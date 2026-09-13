import { z } from 'zod';
import {
  childSchema,
  contextSchema,
  deviceSchema,
  errorCodes,
  invitationSchema,
  messageSchema,
  MessagingError,
  PAGE_SIZE,
  peerPermissionSchema,
  sessionSchema,
  threadSchema,
  type CredentialStorage,
  type FamilyMessagingService,
  type MessagingConfig,
  type MessagingContext,
  type MessagingErrorCode,
  type MessagingSession,
  type SendInput,
} from './contracts';

const authReplySchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().positive(),
  expires_at: z.number().positive().optional(),
  user: z.object({ id: z.string().uuid() }),
});
const storedSchema = z.object({
  version: z.literal(1),
  endpoint: z.string(),
  session: sessionSchema,
});
const okSchema = z.object({ ok: z.literal(true) });

export function readMessagingConfig(
  url: string | undefined,
  key: string | undefined,
): MessagingConfig | null {
  if (!url || !key || !key.startsWith('sb_publishable_')) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      return null;
    if (parsed.pathname !== '/' && parsed.pathname !== '') return null;
    return { url: parsed.origin, publishableKey: key };
  } catch {
    return null;
  }
}

export class SupabaseFamilyMessagingService implements FamilyMessagingService {
  readonly configured: boolean;
  private session: MessagingSession | null = null;
  private generation = 0;
  private refresh: Promise<void> | null = null;
  private enrollmentAuth: Promise<void> | null = null;
  private writes: Promise<void> = Promise.resolve();
  private verifiedContext: MessagingContext | null = null;
  private ownDeviceRevoked = false;

  constructor(
    private readonly config: MessagingConfig | null,
    private readonly storage: CredentialStorage,
    private readonly fetcher: typeof fetch = fetch,
    private readonly now = Date.now,
    private readonly timeoutMs = 8_000,
  ) {
    this.configured = config !== null;
  }

  private assertGeneration(generation: number) {
    if (generation !== this.generation) throw new MessagingError('not_authenticated');
  }

  private async store(session: MessagingSession, generation: number) {
    this.assertGeneration(generation);
    const operation = this.writes
      .catch(() => undefined)
      .then(async () => {
        this.assertGeneration(generation);
        await this.storage.write(
          JSON.stringify({ version: 1, endpoint: this.config?.url, session }),
        );
      });
    this.writes = operation;
    try {
      await operation;
    } catch {
      this.assertGeneration(generation);
      this.session = null;
      throw new MessagingError('storage_failed');
    }
    this.assertGeneration(generation);
    this.session = session;
  }

  async forget() {
    this.generation += 1;
    this.session = null;
    this.verifiedContext = null;
    this.ownDeviceRevoked = false;
    this.refresh = null;
    this.enrollmentAuth = null;
    const operation = this.writes.catch(() => undefined).then(() => this.storage.clear());
    this.writes = operation;
    try {
      await operation;
    } catch {
      throw new MessagingError('storage_failed');
    }
  }

  private async request(
    path: string,
    body: unknown,
    token?: string,
    signal?: AbortSignal,
    isSend = false,
  ): Promise<unknown> {
    if (!this.config) throw new MessagingError('service_unavailable');
    if (signal?.aborted) throw new MessagingError(isSend ? 'unknown' : 'offline');
    const abort = new AbortController();
    const stop = () => abort.abort();
    signal?.addEventListener('abort', stop, { once: true });
    const timer = setTimeout(stop, this.timeoutMs);
    try {
      const response = await this.fetcher(`${this.config.url}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          apikey: this.config.publishableKey,
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: abort.signal,
        cache: 'no-store',
      });
      let data: unknown;
      try {
        data = response.status === 204 ? { ok: true } : await response.json();
      } catch {
        if (response.ok) throw new MessagingError(isSend ? 'unknown' : 'service_unavailable');
      }
      const code = data && typeof data === 'object' && 'code' in data ? data.code : undefined;
      if (!response.ok) {
        if (isSend && response.status >= 500) throw new MessagingError('unknown');
        if (typeof code === 'string' && (errorCodes as readonly string[]).includes(code)) {
          throw new MessagingError(code as MessagingErrorCode);
        }
        throw new MessagingError(
          response.status === 401
            ? 'not_authenticated'
            : response.status === 403
              ? 'not_authorized'
              : response.status === 429
                ? 'rate_limited'
                : response.status < 500
                  ? 'invalid_request'
                  : 'service_unavailable',
        );
      }
      if (typeof code === 'string' && (errorCodes as readonly string[]).includes(code)) {
        throw new MessagingError(code as MessagingErrorCode);
      }
      return data;
    } catch (error) {
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(isSend ? 'unknown' : 'offline');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', stop);
    }
  }

  private parse<T>(schema: z.ZodType<T>, data: unknown, isSend = false): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new MessagingError(isSend ? 'unknown' : 'service_unavailable');
    return parsed.data;
  }

  private async acceptAuth(data: unknown, generation: number, expectedUserId?: string) {
    this.assertGeneration(generation);
    const reply = this.parse(authReplySchema, data);
    if (expectedUserId && reply.user.id !== expectedUserId)
      throw new MessagingError('not_authenticated');
    await this.store(
      { ...reply, expires_at: reply.expires_at ?? this.now() / 1_000 + reply.expires_in },
      generation,
    );
  }

  private async token(signal?: AbortSignal): Promise<string> {
    if (!this.session) throw new MessagingError('not_authenticated');
    const generation = this.generation;
    if (this.session.expires_at * 1_000 <= this.now() + 60_000) {
      if (!this.refresh) {
        const refreshToken = this.session.refresh_token;
        const userId = this.session.user.id;
        const operation = (async () => {
          const reply = await this.request(
            '/auth/v1/token?grant_type=refresh_token',
            { refresh_token: refreshToken },
            undefined,
            signal,
          );
          await this.acceptAuth(reply, generation, userId);
        })();
        this.refresh = operation;
        void operation
          .finally(() => {
            if (this.refresh === operation) this.refresh = null;
          })
          .catch(() => undefined);
      }
      await this.refresh;
    }
    this.assertGeneration(generation);
    if (!this.session) throw new MessagingError('not_authenticated');
    return this.session.access_token;
  }

  private async rpc<T>(
    name: string,
    body: unknown,
    schema: z.ZodType<T>,
    signal?: AbortSignal,
    isSend = false,
  ): Promise<T> {
    const generation = this.generation;
    const token = await this.token(signal);
    const data = await this.request(`/rest/v1/rpc/${name}`, body, token, signal, isSend);
    this.assertGeneration(generation);
    return this.parse(schema, data, isSend);
  }

  async restore(signal?: AbortSignal): Promise<MessagingContext | null> {
    if (!this.configured) return null;
    const generation = this.generation;
    let raw: string | null;
    try {
      await this.writes;
      this.assertGeneration(generation);
      raw = await this.storage.read();
    } catch {
      throw new MessagingError('storage_failed');
    }
    this.assertGeneration(generation);
    if (!raw) return null;
    let saved: z.infer<typeof storedSchema>;
    try {
      saved = storedSchema.parse(JSON.parse(raw));
    } catch {
      await this.forget();
      return null;
    }
    if (saved.endpoint !== this.config?.url) {
      await this.forget();
      return null;
    }
    this.session = saved.session;
    return this.context(signal);
  }

  async context(signal?: AbortSignal) {
    const generation = this.generation;
    const token = await this.token(signal);
    const user = this.parse(
      z.object({ id: z.string().uuid() }),
      await this.request('/auth/v1/user', undefined, token, signal),
    );
    this.assertGeneration(generation);
    if (user.id !== this.session?.user.id) throw new MessagingError('not_authenticated');
    const context = await this.rpc('fm_context', {}, contextSchema, signal);
    this.assertGeneration(generation);
    this.verifiedContext = context;
    return context;
  }

  async signIn(email: string, password: string, label: string, signal?: AbortSignal) {
    const generation = this.generation + 1;
    await this.forget();
    this.assertGeneration(generation);
    const reply = await this.request(
      '/auth/v1/token?grant_type=password',
      { email: email.trim(), password },
      undefined,
      signal,
    );
    await this.acceptAuth(reply, generation);
    const context = await this.rpc(
      'fm_register_parent',
      { p_device_label: label.trim() },
      contextSchema,
      signal,
    );
    this.assertGeneration(generation);
    this.verifiedContext = context;
    return context;
  }

  async enroll(code: string, label: string, signal?: AbortSignal) {
    const generation = this.generation;
    // Keep this genuine installation session for an interrupted invitation redemption retry.
    if (!this.session) {
      if (!this.enrollmentAuth) {
        const operation = (async () => {
          await this.acceptAuth(
            await this.request('/auth/v1/signup', { data: {} }, undefined, signal),
            generation,
          );
        })();
        this.enrollmentAuth = operation;
        void operation
          .finally(() => {
            if (this.enrollmentAuth === operation) this.enrollmentAuth = null;
          })
          .catch(() => undefined);
      }
      await this.enrollmentAuth;
    }
    this.assertGeneration(generation);
    const context = await this.rpc(
      'fm_enroll',
      { p_code: code.trim().toLowerCase(), p_device_label: label.trim() },
      contextSchema,
      signal,
    );
    this.assertGeneration(generation);
    this.verifiedContext = context;
    return context;
  }

  threads(signal?: AbortSignal) {
    return this.rpc('fm_threads', {}, z.array(threadSchema), signal);
  }
  children(signal?: AbortSignal) {
    return this.rpc('fm_children', {}, z.array(childSchema), signal);
  }
  peerPermissions(signal?: AbortSignal) {
    return this.rpc('fm_peer_permissions', {}, z.array(peerPermissionSchema), signal);
  }
  async setPeerPermission(
    firstChildId: string,
    secondChildId: string,
    enabled: boolean,
    signal?: AbortSignal,
  ) {
    await this.rpc(
      'fm_set_peer_permission',
      {
        p_first_child_id: firstChildId,
        p_second_child_id: secondChildId,
        p_enabled: enabled,
      },
      okSchema,
      signal,
    );
  }
  async leavePeerThread(threadId: string, signal?: AbortSignal) {
    await this.rpc('fm_leave_peer_thread', { p_thread_id: threadId }, okSchema, signal);
  }
  createChild(name: string, ageBand: '6_8' | '9_11' | '12_14', signal?: AbortSignal) {
    return this.rpc(
      'fm_create_child',
      { p_name: name.trim(), p_age_band: ageBand },
      childSchema,
      signal,
    );
  }
  invite(childId: string, signal?: AbortSignal) {
    return this.rpc('fm_invite', { p_child_id: childId }, invitationSchema, signal);
  }
  devices(signal?: AbortSignal) {
    return this.rpc('fm_devices', {}, z.array(deviceSchema), signal);
  }
  messages(threadId: string, cursor: { before?: number; after?: number }, signal?: AbortSignal) {
    return this.rpc(
      'fm_messages',
      {
        p_thread_id: threadId,
        p_before: cursor.before ?? null,
        p_after: cursor.after ?? null,
        p_limit: PAGE_SIZE,
      },
      z.array(messageSchema),
      signal,
    );
  }
  send(input: SendInput, signal?: AbortSignal) {
    return this.rpc(
      'fm_send',
      {
        p_thread_id: input.threadId,
        p_client_key: input.clientKey,
        p_body: input.body,
        p_phrase_id: input.phraseId,
      },
      messageSchema,
      signal,
      true,
    );
  }
  async revokeDevice(deviceId: string, signal?: AbortSignal) {
    await this.rpc('fm_revoke_device', { p_device_id: deviceId }, okSchema, signal);
    if (this.verifiedContext?.deviceId === deviceId) this.ownDeviceRevoked = true;
  }
  async revokeAccount(signal?: AbortSignal) {
    await this.rpc('fm_revoke_account', {}, okSchema, signal);
    this.ownDeviceRevoked = true;
  }
  async signOut() {
    const session = this.session;
    const knownContext = this.verifiedContext;
    let deviceRevoked = this.ownDeviceRevoked;
    let providerRevoked = false;
    let storageError: unknown;
    // Invalidate callbacks and credentials before attempting remote work with the old session.
    try {
      await this.forget();
    } catch (error) {
      storageError = error;
    }
    if (!session) {
      if (storageError) throw storageError;
      return { remoteConfirmed: true };
    }
    try {
      if (!deviceRevoked) {
        const context =
          knownContext ??
          this.parse(
            contextSchema,
            await this.request('/rest/v1/rpc/fm_context', {}, session.access_token),
          );
        this.parse(
          okSchema,
          await this.request(
            '/rest/v1/rpc/fm_revoke_device',
            { p_device_id: context.deviceId },
            session.access_token,
          ),
        );
        deviceRevoked = true;
      }
    } catch {
      deviceRevoked = false;
    }
    try {
      await this.request('/auth/v1/logout?scope=local', {}, session.access_token);
      providerRevoked = true;
    } catch {
      providerRevoked = false;
    }
    if (storageError) throw storageError;
    return { remoteConfirmed: deviceRevoked && providerRevoked };
  }
}
