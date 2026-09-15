import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CHILD_STORAGE_KEY,
  createCloudChildService,
  readCloudDeviceMode,
  writeCloudDeviceMode,
} from '../../src/features/cloudFamily/childService';
import {
  ACCOUNT_STORAGE_KEY,
  type GuardedAccountStorage,
} from '../../src/services/accounts/storage';

const modules = vi.hoisted(() => ({
  createClient: vi.fn(),
  createStorage: vi.fn(),
  setupURLPolyfill: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: modules.createClient,
  processLock: async (_name: string, _timeout: number, operation: () => Promise<unknown>) =>
    operation(),
}));
vi.mock('../../src/services/accounts/platformStorage', () => ({
  createPlatformAccountStorage: modules.createStorage,
}));
vi.mock('react-native-url-polyfill', () => ({ setupURLPolyfill: modules.setupURLPolyfill }));
vi.mock('../../src/features/pilot/config', () => ({
  getPilotConfig: () => ({
    enabled: true,
    valid: true,
    mode: 'supabase',
    supabaseUrl: 'https://synthetic-ghaf.supabase.co',
    supabasePublishableKey: 'sb_publishable_synthetic_child_tests',
  }),
}));

const childUserId = '01900000-0000-4000-8000-000000000031';
const invitation = 'synthetic_child_invitation_1234567890';
const session = { access_token: 'synthetic-child-token', refresh_token: 'synthetic-child-refresh' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

interface ClientOptions {
  auth: { storage: GuardedAccountStorage; storageKey: string; autoRefreshToken: boolean };
}

function harness(hasSession = true) {
  const records = new Map<string, string>([[ACCOUNT_STORAGE_KEY, 'untouched-parent-session']]);
  if (hasSession) records.set(CHILD_STORAGE_KEY, JSON.stringify(session));
  const rawStorage = {
    getItem: vi.fn(async (key: string) => records.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      records.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      records.delete(key);
    }),
  };
  let options: ClientOptions | undefined;
  const storage = () => {
    if (!options) throw new Error('Client has not initialized');
    return options.auth.storage;
  };
  let providerUser: unknown = { id: childUserId, is_anonymous: true };
  const snapshot = { source: 'synthetic-provider-fixture' };
  const client = {
    auth: {
      getSession: vi.fn(async () => {
        const saved = await storage().getItem(CHILD_STORAGE_KEY);
        return {
          data: { session: saved === null ? null : (JSON.parse(saved) as unknown) },
          error: null as unknown,
        };
      }),
      getUser: vi.fn(async () => ({ data: { user: providerUser }, error: null as unknown })),
      signInAnonymously: vi.fn(async () => {
        await storage().setItem(CHILD_STORAGE_KEY, JSON.stringify(session));
        return { data: { session }, error: null as unknown };
      }),
      signOut: vi.fn(async () => {
        await storage().removeItem(CHILD_STORAGE_KEY);
        return { error: null as unknown };
      }),
      startAutoRefresh: vi.fn(async () => undefined),
      stopAutoRefresh: vi.fn(async () => undefined),
    },
    rpc: vi.fn(async (_name: string, _parameters?: Record<string, unknown>) => ({
      data: snapshot as unknown,
      error: null as unknown,
    })),
  };
  modules.createStorage.mockReturnValue(rawStorage);
  modules.createClient.mockImplementation(
    (_url: string, _key: string, configured: ClientOptions) => {
      options = configured;
      return client;
    },
  );
  return {
    records,
    rawStorage,
    client,
    storage,
    snapshot,
    service: createCloudChildService(),
    setUser: (user: unknown) => {
      providerUser = user;
    },
    options: () => options,
  };
}

beforeEach(() => {
  modules.createClient.mockReset();
  modules.createStorage.mockReset();
  modules.setupURLPolyfill.mockReset();
});

describe('separate Supabase Child access service', () => {
  it('restores a verified provider identity from the Child namespace without touching Parent credentials', async () => {
    const h = harness();
    await expect(h.service.restore()).resolves.toBe(childUserId);
    expect(CHILD_STORAGE_KEY).not.toBe(ACCOUNT_STORAGE_KEY);
    expect(h.options()?.auth.storageKey).toBe(CHILD_STORAGE_KEY);
    expect(h.rawStorage.getItem.mock.calls.every(([key]) => key === CHILD_STORAGE_KEY)).toBe(true);
    expect(h.client.auth.getUser).toHaveBeenCalledOnce();
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });

  it('keeps a fresh Child device signed out until an enrollment invitation is claimed', async () => {
    const h = harness(false);
    await expect(h.service.restore()).resolves.toBeNull();
    expect(h.client.auth.getUser).not.toHaveBeenCalled();
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.client.rpc).not.toHaveBeenCalled();
  });

  it('creates a distinct anonymous identity and sends only the enrollment token to server authority', async () => {
    const h = harness(false);
    await expect(h.service.claim(`  ${invitation}  `)).resolves.toEqual({
      userId: childUserId,
      snapshot: h.snapshot,
    });
    expect(h.client.auth.signInAnonymously).toHaveBeenCalledOnce();
    expect(h.client.rpc).toHaveBeenCalledExactlyOnceWith('ghaf_claim_child', {
      p_token: invitation,
    });
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
    expect(h.records.has(CHILD_STORAGE_KEY)).toBe(true);
  });

  it('reuses the Child session for an invitation while still checking the provider identity', async () => {
    const h = harness();
    await h.service.claim(invitation);
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.client.auth.getUser).toHaveBeenCalled();
    expect(h.client.rpc).toHaveBeenCalledWith('ghaf_claim_child', { p_token: invitation });
  });

  it.each(['Salem', 'سالم', '', ' ', 'x'.repeat(257), 'invalid/token/123456789012345'])(
    'rejects non-invitation input %j before provider work',
    async (token) => {
      const h = harness(false);
      await expect(h.service.claim(token)).rejects.toMatchObject({ code: 'invalid_invitation' });
      expect(modules.createClient).not.toHaveBeenCalled();
    },
  );

  it.each([
    null,
    { id: childUserId, is_anonymous: false },
    { id: childUserId, is_anonymous: 'true' },
    { id: childUserId, is_anonymous: 1 },
    { is_anonymous: true },
    { id: '', is_anonymous: true },
    { id: 'Salem', is_anonymous: true },
  ])('rejects malformed or Parent identity %j without issuing Child RPCs', async (user) => {
    const h = harness();
    h.setUser(user);
    await expect(h.service.restore()).rejects.toMatchObject({ code: 'access_denied' });
    await expect(h.service.read()).rejects.toMatchObject({ code: 'access_denied' });
    expect(h.client.rpc).not.toHaveBeenCalled();
  });

  it('forwards authenticated commands with server revision and request ID, without actor overrides', async () => {
    const h = harness();
    const command = {
      type: 'assignment.accept',
      assignmentId: '01900000-0000-4000-8000-000000000041',
    } as const;
    await h.service.command('01900000-0000-4000-8000-000000000042', 8, command);
    expect(h.client.rpc).toHaveBeenCalledExactlyOnceWith('ghaf_command', {
      p_request_id: '01900000-0000-4000-8000-000000000042',
      p_expected_revision: 8,
      p_command: command,
    });
  });

  it('preserves the server access denial instead of inventing a local Child snapshot', async () => {
    const h = harness();
    h.client.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'access_revoked' },
    });
    await expect(h.service.read()).rejects.toMatchObject({ code: 'access_revoked' });
  });

  it('does not start background refresh when restored while inactive', async () => {
    const h = harness();
    h.service.setActive(false);
    await h.service.restore();
    expect(h.options()?.auth.autoRefreshToken).toBe(false);
    expect(h.client.auth.stopAutoRefresh).toHaveBeenCalled();
    h.service.setActive(true);
    await vi.waitFor(() => expect(h.client.auth.startAutoRefresh).toHaveBeenCalledOnce());
    h.service.dispose();
    await vi.waitFor(() => expect(h.client.auth.stopAutoRefresh).toHaveBeenCalledTimes(2));
    await expect(h.service.read()).rejects.toMatchObject({ code: 'access_revoked' });
  });

  it('invalidates an outstanding read when logout wins the race', async () => {
    const h = harness();
    await h.service.restore();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.client.rpc.mockImplementationOnce(() => response.promise);
    const reading = h.service.read();
    const rejected = expect(reading).rejects.toMatchObject({ code: 'access_revoked' });
    await vi.waitFor(() => expect(h.client.rpc).toHaveBeenCalledOnce());
    await h.service.signOut();
    response.resolve({ data: h.snapshot, error: null });
    await rejected;
    expect(h.records.has(CHILD_STORAGE_KEY)).toBe(false);
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });

  it('blocks late anonymous sign-in persistence and enrollment after logout', async () => {
    const h = harness(false);
    const release = deferred<void>();
    h.client.auth.signInAnonymously.mockImplementationOnce(async () => {
      await release.promise;
      await h.storage().setItem(CHILD_STORAGE_KEY, JSON.stringify(session));
      return { data: { session }, error: null };
    });
    const joining = h.service.claim(invitation);
    const rejected = expect(joining).rejects.toMatchObject({ code: 'access_revoked' });
    await vi.waitFor(() => expect(h.client.auth.signInAnonymously).toHaveBeenCalledOnce());
    await h.service.signOut();
    release.resolve();
    await rejected;
    expect(h.records.has(CHILD_STORAGE_KEY)).toBe(false);
    expect(h.client.rpc).not.toHaveBeenCalled();
  });

  it('removes the remembered Child snapshot so a later restore cannot undo logout', async () => {
    const h = harness();
    await h.service.restore();
    await h.service.signOut();
    await expect(h.service.restore()).resolves.toBeNull();
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });

  it('still attempts local credential cleanup when stopping refresh rejects', async () => {
    const h = harness();
    await h.service.restore();
    h.client.auth.stopAutoRefresh.mockRejectedValueOnce(new Error('synthetic-refresh-stop-failed'));
    await h.service.signOut().catch(() => undefined);
    expect(h.records.has(CHILD_STORAGE_KEY)).toBe(false);
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });

  it('reports failed credential clearing and keeps subsequent Child access closed', async () => {
    const h = harness();
    await h.service.restore();
    h.rawStorage.removeItem.mockImplementation(async (key) => {
      if (key === CHILD_STORAGE_KEY) throw new Error('synthetic-storage-locked');
      h.records.delete(key);
    });
    await expect(h.service.signOut()).rejects.toMatchObject({ code: 'storage_unavailable' });
    await expect(h.service.read()).rejects.toMatchObject({ code: 'access_denied' });
    expect(h.client.rpc).not.toHaveBeenCalled();
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });

  it('treats the device-mode marker as navigation preference without creating identity authority', async () => {
    const h = harness(false);
    await expect(readCloudDeviceMode()).resolves.toBe('parent');
    await writeCloudDeviceMode('child');
    await expect(readCloudDeviceMode()).resolves.toBe('child');
    await expect(h.service.restore()).resolves.toBeNull();
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.client.rpc).not.toHaveBeenCalled();
    h.records.set(`${ACCOUNT_STORAGE_KEY}.device-mode`, 'Salem');
    await expect(readCloudDeviceMode()).resolves.toBe('parent');
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('untouched-parent-session');
  });
});
