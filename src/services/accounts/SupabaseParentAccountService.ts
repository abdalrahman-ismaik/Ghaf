import {
  ParentAccountError,
  type ParentAccountErrorCode,
  type ParentAccountEvent,
  type ParentAccountService,
  type PilotAccessStatus,
  type RealAccountSession,
} from '../../models/parentAccount';
import { GuardedAccountStorage, RECOVERY_STORAGE_KEY } from './storage';

interface ProviderUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
}

interface ProviderResult<T> {
  data: T;
  error: unknown;
}

interface RecoveryReceipt {
  version: 1;
  state: 'pending' | 'verified';
  email: string;
  userId?: string;
}

function recoveryReceipt(value: string): RecoveryReceipt | null {
  try {
    const receipt = JSON.parse(value) as Partial<RecoveryReceipt> | null;
    if (
      receipt?.version === 1 &&
      (receipt.state === 'pending' || receipt.state === 'verified') &&
      typeof receipt.email === 'string' &&
      (receipt.state === 'pending' ||
        (typeof receipt.userId === 'string' && receipt.userId.length > 0))
    )
      return receipt as RecoveryReceipt;
  } catch {
    // Legacy or interrupted metadata is a barrier, never proof of verified recovery.
  }
  return null;
}

export interface AccountClientPort {
  auth: {
    signUp(credentials: {
      email: string;
      password: string;
    }): Promise<ProviderResult<{ session: unknown }>>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<ProviderResult<{ session: unknown }>>;
    verifyOtp(credentials: {
      email: string;
      token: string;
      type: 'signup' | 'recovery';
    }): Promise<ProviderResult<{ session: unknown }>>;
    resend(credentials: { email: string; type: 'signup' }): Promise<ProviderResult<unknown>>;
    resetPasswordForEmail(email: string): Promise<ProviderResult<unknown>>;
    updateUser(attributes: { password: string }): Promise<ProviderResult<unknown>>;
    getSession(): Promise<ProviderResult<{ session: unknown }>>;
    getUser(): Promise<ProviderResult<{ user: ProviderUser | null }>>;
    signOut(options: { scope: 'local' | 'global' }): Promise<{ error: unknown }>;
    onAuthStateChange(
      listener: (event: string, session?: { user?: ProviderUser } | null) => void,
    ): {
      data: { subscription: { unsubscribe(): void } };
    };
    startAutoRefresh(): Promise<void>;
    stopAutoRefresh(): Promise<void>;
  };
  from(table: 'pilot_access'): {
    select(columns: 'user_id,status'): {
      eq(
        column: 'user_id',
        value: string,
      ): {
        maybeSingle(): PromiseLike<ProviderResult<{ user_id: string; status: string } | null>>;
      };
    };
  };
}

export interface AccountRuntime {
  client: AccountClientPort;
  storage: GuardedAccountStorage;
}

function sanitize(
  error: unknown,
  fallback: ParentAccountErrorCode = 'provider_unavailable',
): ParentAccountError {
  if (error instanceof ParentAccountError) return error;
  if (typeof error !== 'object' || error === null) return new ParentAccountError(fallback);
  const candidate = error as { code?: unknown; status?: unknown; name?: unknown };
  const codes: Record<string, ParentAccountErrorCode> = {
    invalid_credentials: 'invalid_credentials',
    email_not_confirmed: 'email_not_verified',
    otp_expired: 'invalid_code',
    otp_disabled: 'invalid_code',
    weak_password: 'weak_password',
    same_password: 'weak_password',
    over_email_send_rate_limit: 'rate_limited',
    over_request_rate_limit: 'rate_limited',
    user_banned: 'account_unavailable',
    user_not_found: 'session_expired',
    session_not_found: 'session_expired',
    refresh_token_not_found: 'session_expired',
    refresh_token_already_used: 'session_expired',
  };
  if (typeof candidate.code === 'string' && codes[candidate.code]) {
    return new ParentAccountError(codes[candidate.code]!);
  }
  if (candidate.status === 429) return new ParentAccountError('rate_limited');
  if (
    candidate.status === 401 ||
    candidate.status === 403 ||
    candidate.name === 'AuthSessionMissingError'
  ) {
    return new ParentAccountError('session_expired');
  }
  if (
    candidate.name === 'AbortError' ||
    candidate.name === 'TimeoutError' ||
    candidate.name === 'TypeError' ||
    candidate.name === 'AuthRetryableFetchError'
  ) {
    return new ParentAccountError('network_unavailable');
  }
  return new ParentAccountError(fallback);
}

function emailAddress(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ParentAccountError('invalid_credentials');
  }
  return email;
}

function strongPassword(value: string) {
  if (value.length < 12 || value.length > 256) throw new ParentAccountError('weak_password');
}

function emailCode(value: string) {
  if (!/^(?:[0-9]{6}|[0-9]{8})$/.test(value)) throw new ParentAccountError('invalid_code');
}

function checked<T>(result: ProviderResult<T>, fallback?: ParentAccountErrorCode): T {
  if (result.error) throw sanitize(result.error, fallback);
  return result.data;
}

export class SupabaseParentAccountService implements ParentAccountService {
  private runtimePromise: Promise<AccountRuntime> | null = null;
  private runtime: AccountRuntime | null = null;
  private generation = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<(event: ParentAccountEvent) => void>();
  private unsubscribe: (() => void) | null = null;
  private blocked = false;
  private disposed = false;
  private active = true;
  private recovering = false;
  private knownUserId: string | null = null;
  private ownAuthMutation = false;
  private ownMutationEmail: string | null = null;

  constructor(private readonly initialize: () => Promise<AccountRuntime>) {}

  private emit(event: ParentAccountEvent) {
    if (!this.disposed) this.listeners.forEach((listener) => listener(event));
  }

  private async getRuntime(): Promise<AccountRuntime> {
    if (!this.runtimePromise) {
      this.runtimePromise = this.initialize()
        .then((runtime) => {
          this.runtime = runtime;
          if (this.blocked || this.disposed) runtime.storage.blockWrites();
          const { data } = runtime.client.auth.onAuthStateChange((event, session) => {
            if (this.blocked || this.disposed) return;
            if (event === 'SIGNED_OUT') {
              this.generation++;
              this.blocked = true;
              runtime.storage.blockWrites();
              this.emit('signed-out');
              void runtime.storage.clearCredentials().catch(() => this.emit('error'));
            } else if (event === 'PASSWORD_RECOVERY') {
              this.recovering = true;
              this.emit('recovery');
            } else if (
              event === 'TOKEN_REFRESHED' ||
              event === 'SIGNED_IN' ||
              event === 'USER_UPDATED'
            ) {
              if (event === 'SIGNED_IN' && session?.user?.id) {
                const changedDuringRead =
                  !this.ownAuthMutation && this.knownUserId && session.user.id !== this.knownUserId;
                const unexpectedMutationIdentity =
                  this.ownAuthMutation &&
                  this.ownMutationEmail &&
                  session.user.email?.trim().toLowerCase() !== this.ownMutationEmail;
                if (changedDuringRead || unexpectedMutationIdentity) {
                  this.generation++;
                  this.knownUserId = session.user.id;
                }
              }
              this.emit(
                runtime.storage.hasFailed ? 'error' : this.recovering ? 'recovery' : 'changed',
              );
            }
          });
          this.unsubscribe = () => data.subscription.unsubscribe();
          if (this.disposed) this.unsubscribe();
          this.setAppActive(this.active);
          return runtime;
        })
        .catch((error: unknown) => {
          this.runtimePromise = null;
          throw sanitize(error);
        });
    }
    return this.runtimePromise;
  }

  private run<T>(
    operation: (runtime: AccountRuntime, generation: number) => Promise<T>,
    allowSignIn = false,
  ): Promise<T> {
    const generation = this.generation;
    const pending = this.queue.then(async () => {
      this.assertCurrent(generation);
      const runtime = await this.getRuntime();
      this.assertCurrent(generation);
      if (allowSignIn) {
        this.blocked = false;
        runtime.storage.allowWrites();
        this.setAppActive(this.active);
      } else if (this.blocked) {
        throw new ParentAccountError('session_expired');
      }
      try {
        const result = await operation(runtime, generation);
        this.assertCurrent(generation);
        if (runtime.storage.hasFailed) throw new ParentAccountError('storage_unavailable');
        return result;
      } catch (error) {
        this.assertCurrent(generation);
        if (runtime.storage.hasFailed) throw new ParentAccountError('storage_unavailable');
        throw sanitize(error);
      }
    });
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  private assertCurrent(generation: number) {
    if (generation !== this.generation || this.disposed)
      throw new ParentAccountError('operation_cancelled');
  }

  private async identity(runtime: AccountRuntime): Promise<RealAccountSession> {
    const generation = this.generation;
    const { user } = checked(await runtime.client.auth.getUser());
    this.assertCurrent(generation);
    if (!user?.id || !user.email) throw new ParentAccountError('session_expired');
    if (!user.email_confirmed_at) throw new ParentAccountError('email_not_verified');
    this.knownUserId = user.id;
    return { userId: user.id, email: user.email };
  }

  signUp(email: string, password: string): Promise<void> {
    return this.run(async ({ client }) => {
      strongPassword(password);
      const { session } = checked(
        await this.authMutation(
          () => client.auth.signUp({ email: emailAddress(email), password }),
          emailAddress(email),
        ),
      );
      if (session) {
        await this.clearRuntimeSession();
        throw new ParentAccountError('configuration_unavailable');
      }
    }, true);
  }

  verifyEmail(email: string, code: string): Promise<RealAccountSession> {
    return this.run(async (runtime, generation) => {
      emailCode(code);
      checked(
        await this.authMutation(
          () =>
            runtime.client.auth.verifyOtp({
              email: emailAddress(email),
              token: code,
              type: 'signup',
            }),
          emailAddress(email),
        ),
        'invalid_code',
      );
      this.assertCurrent(generation);
      const session = await this.identity(runtime);
      this.assertCurrent(generation);
      await runtime.storage.removeItem(RECOVERY_STORAGE_KEY);
      this.recovering = false;
      return session;
    }, true);
  }

  signIn(email: string, password: string): Promise<RealAccountSession> {
    return this.run(async (runtime, generation) => {
      if (!password || password.length > 256) throw new ParentAccountError('invalid_credentials');
      checked(
        await this.authMutation(
          () => runtime.client.auth.signInWithPassword({ email: emailAddress(email), password }),
          emailAddress(email),
        ),
      );
      this.assertCurrent(generation);
      const session = await this.identity(runtime);
      this.assertCurrent(generation);
      await runtime.storage.removeItem(RECOVERY_STORAGE_KEY);
      this.recovering = false;
      return session;
    }, true);
  }

  restoreSession(): Promise<RealAccountSession | null> {
    if (this.blocked) return Promise.resolve(null);
    return this.run(async (runtime) => {
      const rawReceipt = await runtime.storage.getItem(RECOVERY_STORAGE_KEY);
      if (rawReceipt) {
        this.recovering = true;
        const receipt = recoveryReceipt(rawReceipt);
        if (receipt?.state !== 'verified') {
          await this.clearRuntimeSession('local', true);
          throw new ParentAccountError('session_expired');
        }
        const identity = await this.identity(runtime);
        if (receipt.userId !== identity.userId || receipt.email !== emailAddress(identity.email)) {
          await this.clearRuntimeSession('local', true);
          throw new ParentAccountError('session_expired');
        }
        throw new ParentAccountError('recovery_required');
      }
      const { session } = checked(await runtime.client.auth.getSession());
      return session ? this.identity(runtime) : null;
    });
  }

  getAccess(userId: string): Promise<PilotAccessStatus> {
    return this.run(async (runtime) => {
      if (this.recovering || (await runtime.storage.getItem(RECOVERY_STORAGE_KEY)))
        throw new ParentAccountError('recovery_required');
      const session = await this.identity(runtime);
      if (session.userId !== userId) throw new ParentAccountError('access_unavailable');
      const row = checked(
        await runtime.client
          .from('pilot_access')
          .select('user_id,status')
          .eq('user_id', userId)
          .maybeSingle(),
        'access_unavailable',
      );
      if (
        !row ||
        row.user_id !== userId ||
        !['pending', 'approved', 'suspended'].includes(row.status)
      ) {
        throw new ParentAccountError('access_unavailable');
      }
      return row.status as PilotAccessStatus;
    });
  }

  resendVerification(email: string): Promise<void> {
    return this.run(async ({ client }) => {
      checked(await client.auth.resend({ email: emailAddress(email), type: 'signup' }));
    }, true);
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.run(async ({ client }) => {
      checked(await client.auth.resetPasswordForEmail(emailAddress(email)));
    }, true);
  }

  verifyRecovery(email: string, code: string): Promise<void> {
    return this.run(async (runtime, generation) => {
      emailCode(code);
      const normalizedEmail = emailAddress(email);
      const pending: RecoveryReceipt = { version: 1, state: 'pending', email: normalizedEmail };
      await runtime.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(pending));
      this.recovering = true;
      await this.clearRuntimeSession('local', true);
      this.assertCurrent(generation);
      this.blocked = false;
      runtime.storage.allowWrites();
      this.setAppActive(this.active);
      try {
        const { session } = checked(
          await this.authMutation(
            () =>
              runtime.client.auth.verifyOtp({
                email: normalizedEmail,
                token: code,
                type: 'recovery',
              }),
            normalizedEmail,
          ),
          'invalid_code',
        );
        this.assertCurrent(generation);
        if (!session) throw new ParentAccountError('invalid_code');
        const identity = await this.identity(runtime);
        this.assertCurrent(generation);
        if (emailAddress(identity.email) !== normalizedEmail)
          throw new ParentAccountError('invalid_code');
        const receipt: RecoveryReceipt = {
          version: 1,
          state: 'verified',
          email: normalizedEmail,
          userId: identity.userId,
        };
        await runtime.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(receipt));
      } catch (error) {
        this.assertCurrent(generation);
        await this.clearRuntimeSession('local', true);
        throw error;
      }
    }, true);
  }

  updatePassword(password: string): Promise<void> {
    return this.run(async (runtime, generation) => {
      strongPassword(password);
      const rawReceipt = await runtime.storage.getItem(RECOVERY_STORAGE_KEY);
      const receipt = rawReceipt ? recoveryReceipt(rawReceipt) : null;
      if (receipt?.state !== 'verified') throw new ParentAccountError('recovery_required');
      const identity = await this.identity(runtime);
      this.assertCurrent(generation);
      if (receipt.userId !== identity.userId || receipt.email !== emailAddress(identity.email)) {
        await this.clearRuntimeSession('local', true);
        throw new ParentAccountError('session_expired');
      }
      checked(
        await this.authMutation(
          () => runtime.client.auth.updateUser({ password }),
          emailAddress(identity.email),
        ),
      );
      await this.clearRuntimeSession('global');
    });
  }

  private async authMutation<T>(operation: () => Promise<T>, expectedEmail: string): Promise<T> {
    this.ownAuthMutation = true;
    this.ownMutationEmail = expectedEmail;
    try {
      return await operation();
    } finally {
      this.ownAuthMutation = false;
      this.ownMutationEmail = null;
    }
  }

  private async clearRuntimeSession(
    scope: 'local' | 'global' = 'local',
    preserveRecovery = false,
  ): Promise<void> {
    const runtime = this.runtime;
    if (!runtime) return;
    this.blocked = true;
    runtime.storage.blockWrites();
    let providerError: unknown;
    try {
      await runtime.client.auth.stopAutoRefresh();
      providerError = (await runtime.client.auth.signOut({ scope })).error;
    } catch (error) {
      providerError = error;
    } finally {
      try {
        await runtime.storage.clearCredentials(preserveRecovery);
      } finally {
        runtime.storage.forgetSnapshot();
        this.recovering = preserveRecovery;
        this.knownUserId = null;
      }
    }
    if (providerError) throw sanitize(providerError);
  }

  signOut(): Promise<void> {
    this.generation++;
    this.blocked = true;
    this.recovering = false;
    this.runtime?.storage.blockWrites();
    this.emit('signed-out');
    const immediateClear = this.runtime?.storage.clearCredentials().catch(() => undefined);
    const pending = this.queue.then(async () => {
      await immediateClear;
      if (this.runtimePromise) await this.runtimePromise.catch(() => undefined);
      await this.clearRuntimeSession();
    });
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  onSessionChange(listener: (event: ParentAccountEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setAppActive(active: boolean): void {
    this.active = active;
    if (this.runtime) {
      const auth = this.runtime.client.auth;
      void (
        active && !this.blocked && !this.disposed ? auth.startAutoRefresh() : auth.stopAutoRefresh()
      ).catch(() => this.emit('error'));
    }
  }

  dispose(): void {
    this.disposed = true;
    this.generation++;
    this.runtime?.storage.blockWrites();
    this.unsubscribe?.();
    this.listeners.clear();
    this.setAppActive(false);
  }
}
