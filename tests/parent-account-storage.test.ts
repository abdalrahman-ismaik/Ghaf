import { describe, expect, it, vi } from 'vitest';

import { createSecureAccountStorage } from '../src/services/accounts/secureStorage';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from '../src/services/accounts/storage';
import { createPlatformAccountStorage } from '../src/services/accounts/platformStorage.web';

function secureHarness() {
  const records = new Map<string, string>();
  const secure = {
    getItemAsync: vi.fn(async (key: string) => records.get(key) ?? null),
    setItemAsync: vi.fn(async (key: string, value: string) => {
      records.set(key, value);
    }),
    deleteItemAsync: vi.fn(async (key: string) => {
      records.delete(key);
    }),
  };
  return { records, secure, storage: createSecureAccountStorage(secure) };
}

describe('pilot credential storage', () => {
  it('round-trips long native sessions in SecureStore chunks and clears every chunk', async () => {
    const h = secureHarness();
    const session = JSON.stringify({ token: 'x'.repeat(5000), email: 'بالغ@example.com' });
    await h.storage.setItem(ACCOUNT_STORAGE_KEY, session);
    expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe(session);
    expect(
      h.secure.setItemAsync.mock.calls.every(
        ([, value]) => new TextEncoder().encode(value).length < 2048,
      ),
    ).toBe(true);
    await h.storage.setItem(ACCOUNT_STORAGE_KEY, 'replacement-session');
    expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('replacement-session');
    await h.storage.removeItem(ACCOUNT_STORAGE_KEY);
    expect(h.records.size).toBe(0);
  });

  it('preserves committed native data when a replacement is interrupted and removes partial credentials on logout', async () => {
    const h = secureHarness();
    await h.storage.setItem(ACCOUNT_STORAGE_KEY, 'original-session');
    h.secure.setItemAsync.mockImplementation(async (key, value) => {
      if (key.endsWith('.1.1')) throw new Error('native-write-failed');
      h.records.set(key, value);
    });
    await expect(h.storage.setItem(ACCOUNT_STORAGE_KEY, 'x'.repeat(1000))).rejects.toThrow(
      'native-write-failed',
    );
    expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('original-session');
    await h.storage.removeItem(ACCOUNT_STORAGE_KEY);
    expect(h.records.size).toBe(0);
  });

  it('fails closed on unavailable native storage and never creates plaintext fallback', async () => {
    const h = secureHarness();
    h.secure.getItemAsync.mockRejectedValue(new Error('keystore-locked'));
    const guarded = new GuardedAccountStorage(h.storage);
    await expect(guarded.getItem(ACCOUNT_STORAGE_KEY)).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    expect(guarded.hasFailed).toBe(true);
    expect(h.records.size).toBe(0);
  });

  it('cleans interrupted long writes before a shorter retry so no token fragments remain', async () => {
    const h = secureHarness();
    await h.storage.setItem(ACCOUNT_STORAGE_KEY, 'original-session');
    h.secure.setItemAsync.mockImplementation(async (key, value) => {
      if (key.endsWith('.1.3')) throw new Error('native-write-failed');
      h.records.set(key, value);
    });
    await expect(h.storage.setItem(ACCOUNT_STORAGE_KEY, 'x'.repeat(3000))).rejects.toThrow();
    await h.storage.setItem(ACCOUNT_STORAGE_KEY, 'short-replacement');
    expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('short-replacement');
    await h.storage.removeItem(ACCOUNT_STORAGE_KEY);
    expect(h.records.size).toBe(0);
  });

  it('rejects malformed manifests and missing chunks', async () => {
    const h = secureHarness();
    h.records.set(`${ACCOUNT_STORAGE_KEY}.manifest`, '{bad');
    await expect(h.storage.getItem(ACCOUNT_STORAGE_KEY)).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    h.records.set(
      `${ACCOUNT_STORAGE_KEY}.manifest`,
      JSON.stringify({ bank: 0, count: 1, length: 12 }),
    );
    await expect(h.storage.getItem(ACCOUNT_STORAGE_KEY)).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
  });

  it('uses dedicated web keys and does not read or delete the sample-family record', async () => {
    const records = new Map([['ghaf.family', 'synthetic-family']]);
    const browser = {
      getItem: vi.fn((key: string) => records.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        records.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        records.delete(key);
      }),
    };
    vi.stubGlobal('window', { localStorage: browser });
    try {
      const storage = createPlatformAccountStorage();
      await storage.setItem(ACCOUNT_STORAGE_KEY, 'session');
      expect(await storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('session');
      await storage.removeItem(ACCOUNT_STORAGE_KEY);
      await expect(storage.getItem('ghaf.family')).rejects.toMatchObject({
        code: 'storage_unavailable',
      });
      expect(records.get('ghaf.family')).toBe('synthetic-family');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('reports web SSR/storage denial without substituting memory persistence', async () => {
    const storage = createPlatformAccountStorage();
    await expect(storage.getItem(ACCOUNT_STORAGE_KEY)).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('storage-denied');
      },
    });
    try {
      const guarded = new GuardedAccountStorage(storage);
      await expect(guarded.setItem(ACCOUNT_STORAGE_KEY, 'session')).rejects.toMatchObject({
        code: 'storage_unavailable',
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
