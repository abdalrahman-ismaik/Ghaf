import { ParentAccountError, type ParentAccountService } from '../../models/parentAccount';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from './SupabaseParentAccountService';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from './storage';
import { validateParentAccountConfiguration } from './configuration';

export function createSupabaseParentAccountService(config: {
  url: string;
  publishableKey: string;
}): ParentAccountService {
  return new SupabaseParentAccountService(async () => {
    if (
      !config.publishableKey.startsWith('sb_publishable_') ||
      !/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1):\d+(\/|$))/.test(config.url)
    ) {
      throw new ParentAccountError('configuration_unavailable');
    }
    const { setupURLPolyfill } = await import('react-native-url-polyfill');
    setupURLPolyfill();
    validateParentAccountConfiguration(config);
    const [{ createClient, processLock }, { createPlatformAccountStorage }] = await Promise.all([
      import('@supabase/supabase-js'),
      import('./platformStorage'),
    ]);
    const storage = new GuardedAccountStorage(createPlatformAccountStorage());
    const client = createClient(config.url, config.publishableKey, {
      auth: {
        storage,
        storageKey: ACCOUNT_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'implicit',
        lock: processLock,
      },
      global: {
        async fetch(input, init) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15_000);
          const onAbort = () => controller.abort();
          init?.signal?.addEventListener('abort', onAbort);
          if (init?.signal?.aborted) controller.abort();
          try {
            return await fetch(input, { ...init, signal: controller.signal });
          } finally {
            clearTimeout(timeout);
            init?.signal?.removeEventListener('abort', onAbort);
          }
        },
      },
    });
    // Keep the provider's generic database types outside the small injectable account boundary.
    return { client: client as unknown as AccountClientPort, storage };
  });
}
