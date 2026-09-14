import { ParentAccountError, type ParentAccountService } from '../../models/parentAccount';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from './SupabaseParentAccountService';
import {
  ACCOUNT_STORAGE_KEY,
  GuardedAccountStorage,
  RECOVERY_STORAGE_KEY,
  type AccountStorage,
} from './storage';
import { validateParentAccountConfiguration } from './configuration';
import type { Database } from './database.types';

export function createProjectAccountStorage(base: AccountStorage, url: string) {
  const endpoint = new URL(url).href.replace(/\/+$/, '');
  const projectKey = Array.from(endpoint, (character) =>
    character.charCodeAt(0).toString(16).padStart(4, '0'),
  ).join('');
  const prefix = `${ACCOUNT_STORAGE_KEY}.project.v1.${projectKey}.`;
  const retiredKey = `${prefix}legacy-retired`;
  let legacyCandidate: string | null = null;
  let legacyRecovery: string | null = null;
  const legacySession = async () => {
    if ((await base.getItem(retiredKey)) !== null) return null;
    const raw = await base.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw || raw.length > 100_000) return null;
    try {
      const record = JSON.parse(raw) as { access_token?: unknown };
      if (typeof record.access_token !== 'string') return null;
      const body = record.access_token.split('.')[1];
      if (!body || !/^[A-Za-z0-9_-]+$/.test(body)) return null;
      const normalized = body.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')),
      ) as { iss?: unknown };
      // Issuer only selects a legacy candidate. getUser and backend membership still authorize it.
      if (payload.iss !== `${endpoint}/auth/v1`) return null;
      legacyCandidate = raw;
      return raw;
    } catch {
      return null;
    }
  };
  const storage: AccountStorage = {
    async getItem(key) {
      const value = await base.getItem(`${prefix}${key}`);
      if (value !== null) return value;
      if (key === ACCOUNT_STORAGE_KEY) return legacySession();
      if (key === RECOVERY_STORAGE_KEY && (await legacySession())) {
        legacyRecovery = await base.getItem(key);
        return legacyRecovery;
      }
      return null;
    },
    async setItem(key, value) {
      if (
        key === ACCOUNT_STORAGE_KEY &&
        legacyCandidate &&
        (await base.getItem(`${prefix}${RECOVERY_STORAGE_KEY}`)) === null
      ) {
        const recovery = legacyRecovery ?? (await base.getItem(RECOVERY_STORAGE_KEY));
        if (recovery) {
          await base.setItem(`${prefix}${RECOVERY_STORAGE_KEY}`, recovery);
          if ((await base.getItem(`${prefix}${RECOVERY_STORAGE_KEY}`)) !== recovery)
            throw new ParentAccountError('storage_unavailable');
        }
      }
      await base.setItem(`${prefix}${key}`, value);
      if (key === ACCOUNT_STORAGE_KEY) await base.setItem(retiredKey, '1');
    },
    async removeItem(key) {
      // A project logout cannot reactivate an old shared-key credential on the next startup.
      if (key === ACCOUNT_STORAGE_KEY) await base.setItem(retiredKey, '1');
      await base.removeItem(`${prefix}${key}`);
    },
  };
  return {
    storage,
    async confirmIdentity(guarded: GuardedAccountStorage) {
      if (!legacyCandidate) return;
      if (legacyRecovery && (await base.getItem(`${prefix}${RECOVERY_STORAGE_KEY}`)) === null) {
        await guarded.setItem(RECOVERY_STORAGE_KEY, legacyRecovery);
        if ((await base.getItem(`${prefix}${RECOVERY_STORAGE_KEY}`)) !== legacyRecovery)
          throw new ParentAccountError('storage_unavailable');
      }
      const current = await base.getItem(`${prefix}${ACCOUNT_STORAGE_KEY}`);
      if (current === null) {
        await guarded.setItem(ACCOUNT_STORAGE_KEY, legacyCandidate);
        if ((await base.getItem(`${prefix}${ACCOUNT_STORAGE_KEY}`)) !== legacyCandidate)
          throw new ParentAccountError('storage_unavailable');
      }
      if ((await base.getItem(retiredKey)) !== '1')
        throw new ParentAccountError('storage_unavailable');
      legacyCandidate = null;
      legacyRecovery = null;
    },
  };
}

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
    const projectStorage = createProjectAccountStorage(createPlatformAccountStorage(), config.url);
    const storage = new GuardedAccountStorage(projectStorage.storage);
    const client = createClient<Database>(config.url, config.publishableKey, {
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
    // Runtime validators still check responses across the small injectable account boundary.
    return {
      client: client as unknown as AccountClientPort,
      storage,
      confirmIdentity: () => projectStorage.confirmIdentity(storage),
    };
  });
}
