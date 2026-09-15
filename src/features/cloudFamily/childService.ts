import type { SupabaseClient } from '@supabase/supabase-js';
import { CloudFamilyError, type CloudCommand } from '@/models/cloudFamily';
import { getPilotConfig } from '@/features/pilot/config';
import { validateParentAccountConfiguration } from '@/services/accounts/configuration';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from '@/services/accounts/storage';
import { cloudError } from './validation';

export const CHILD_STORAGE_KEY = `${ACCOUNT_STORAGE_KEY}.child`;
const MODE_KEY = `${ACCOUNT_STORAGE_KEY}.device-mode`;

export async function readCloudDeviceMode(): Promise<'parent' | 'child'> {
  const { createPlatformAccountStorage } = await import('@/services/accounts/platformStorage');
  return (await createPlatformAccountStorage().getItem(MODE_KEY)) === 'child' ? 'child' : 'parent';
}

export async function writeCloudDeviceMode(mode: 'parent' | 'child') {
  const { createPlatformAccountStorage } = await import('@/services/accounts/platformStorage');
  await createPlatformAccountStorage().setItem(MODE_KEY, mode);
}

export function createCloudChildService() {
  let runtime: Promise<{ client: SupabaseClient; storage: GuardedAccountStorage }> | null = null;
  let generation = 0;
  let disposed = false;
  let active = true;
  let writable = true;
  const getRuntime = () => {
    runtime ??= (async () => {
      const config = getPilotConfig();
      if (!config.valid || !config.supabaseUrl || !config.supabasePublishableKey)
        throw new CloudFamilyError('service_unavailable');
      const provider = { url: config.supabaseUrl, publishableKey: config.supabasePublishableKey };
      validateParentAccountConfiguration(provider);
      const { setupURLPolyfill } = await import('react-native-url-polyfill');
      setupURLPolyfill();
      const [{ createClient }, { createPlatformAccountStorage }] = await Promise.all([
        import('@supabase/supabase-js'),
        import('@/services/accounts/platformStorage'),
      ]);
      const storage = new GuardedAccountStorage(createPlatformAccountStorage(), CHILD_STORAGE_KEY);
      if (!writable || disposed) storage.blockWrites();
      const client = createClient(provider.url, provider.publishableKey, {
        auth: {
          storage,
          storageKey: CHILD_STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: active && !disposed,
          detectSessionInUrl: false,
        },
        global: {
          async fetch(input, init) {
            const abort = new AbortController();
            const timeout = setTimeout(() => abort.abort(), 15_000);
            const cancelled = () => abort.abort();
            init?.signal?.addEventListener('abort', cancelled);
            if (init?.signal?.aborted) abort.abort();
            try {
              return await fetch(input, { ...init, signal: abort.signal });
            } finally {
              clearTimeout(timeout);
              init?.signal?.removeEventListener('abort', cancelled);
            }
          },
        },
      });
      if (disposed || !active) await client.auth.stopAutoRefresh();
      return { client, storage };
    })();
    return runtime;
  };
  const assertAlive = (attempt: number) => {
    if (disposed || attempt !== generation) throw new CloudFamilyError('access_revoked');
  };
  const identity = async () => {
    const { client, storage } = await getRuntime();
    const result = await client.auth.getUser();
    if (result.error) throw cloudError(result.error);
    if (
      result.data.user?.is_anonymous !== true ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        result.data.user.id ?? '',
      ) ||
      storage.hasFailed
    )
      throw new CloudFamilyError('access_denied');
    return result.data.user.id;
  };
  const call = async (
    name: 'ghaf_read' | 'ghaf_command' | 'ghaf_claim_child',
    parameters?: Record<string, unknown>,
  ) => {
    const attempt = generation;
    assertAlive(attempt);
    const { client, storage } = await getRuntime();
    await identity();
    assertAlive(attempt);
    const result = await client.rpc(name, parameters);
    assertAlive(attempt);
    if (storage.hasFailed) throw new CloudFamilyError('access_denied');
    if (result.error) throw cloudError(result.error);
    return result.data as unknown;
  };
  return {
    async restore() {
      const attempt = generation;
      const { client, storage } = await getRuntime();
      const session = await client.auth.getSession();
      assertAlive(attempt);
      if (session.error) throw cloudError(session.error);
      if (storage.hasFailed) throw new CloudFamilyError('access_denied');
      if (!session.data.session) return null;
      const id = await identity();
      assertAlive(attempt);
      return id;
    },
    async claim(token: string) {
      if (!/^[a-zA-Z0-9_-]{24,256}$/.test(token.trim()))
        throw new CloudFamilyError('invalid_invitation');
      const attempt = generation;
      assertAlive(attempt);
      const { client, storage } = await getRuntime();
      writable = true;
      storage.allowWrites();
      const session = await client.auth.getSession();
      if (session.error) throw cloudError(session.error);
      assertAlive(attempt);
      if (!session.data.session) {
        const joined = await client.auth.signInAnonymously();
        assertAlive(attempt);
        if (joined.error) throw cloudError(joined.error);
      }
      const userId = await identity();
      const snapshot = await call('ghaf_claim_child', { p_token: token.trim() });
      assertAlive(attempt);
      return { userId, snapshot };
    },
    read: () => call('ghaf_read'),
    command: (requestId: string, expectedRevision: number, command: CloudCommand) =>
      call('ghaf_command', {
        p_request_id: requestId,
        p_expected_revision: expectedRevision,
        p_command: command,
      }),
    async signOut() {
      generation += 1;
      writable = false;
      const { client, storage } = await getRuntime();
      storage.blockWrites();
      try {
        await client.auth.stopAutoRefresh();
        await client.auth.signOut({ scope: 'local' });
      } finally {
        storage.forgetSnapshot();
        await storage.clearCredentials();
      }
    },
    setActive(next: boolean) {
      active = next;
      if (runtime)
        void runtime
          .then(({ client }) =>
            !disposed && next ? client.auth.startAutoRefresh() : client.auth.stopAutoRefresh(),
          )
          .catch(() => undefined);
    },
    dispose() {
      disposed = true;
      writable = false;
      generation += 1;
      if (runtime)
        void runtime
          .then(({ client, storage }) => {
            storage.blockWrites();
            return client.auth.stopAutoRefresh();
          })
          .catch(() => undefined);
    },
  };
}

export type CloudChildService = ReturnType<typeof createCloudChildService>;
