import { describe, expect, it, vi } from 'vitest';

import { createSecureAccountStorage } from '../../src/services/accounts/secureStorage';
import {
  ACCOUNT_STORAGE_KEY,
  GuardedAccountStorage,
  type AccountStorage,
} from '../../src/services/accounts/storage';

const childKey = `${ACCOUNT_STORAGE_KEY}.child`;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function harness() {
  const records = new Map<string, string>();
  const raw = {
    getItem: vi.fn(async (key: string) => records.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      records.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      records.delete(key);
    }),
  } satisfies AccountStorage;
  return {
    records,
    raw,
    parent: new GuardedAccountStorage(raw),
    child: new GuardedAccountStorage(raw, childKey),
  };
}

function credentialKeys(key: string) {
  return [key, `${key}-user`, `${key}-code-verifier`, `${key}.recovery`];
}

describe('Parent and Child credential namespaces', () => {
  it.each(['parent', 'child'] as const)('clears only the %s credential family', async (role) => {
    const h = harness();
    for (const key of [...credentialKeys(ACCOUNT_STORAGE_KEY), ...credentialKeys(childKey)]) {
      h.records.set(key, `synthetic:${key}`);
    }
    h.records.set(`${ACCOUNT_STORAGE_KEY}.device-mode`, 'child');
    h.records.set('ghaf.family', 'existing-family');
    const ownKey = role === 'parent' ? ACCOUNT_STORAGE_KEY : childKey;
    const otherKey = role === 'parent' ? childKey : ACCOUNT_STORAGE_KEY;

    h[role].blockWrites();
    await h[role].clearCredentials();

    for (const key of credentialKeys(ownKey)) expect(h.records.has(key)).toBe(false);
    for (const key of credentialKeys(otherKey)) expect(h.records.get(key)).toBe(`synthetic:${key}`);
    expect(h.records.get(`${ACCOUNT_STORAGE_KEY}.device-mode`)).toBe('child');
    expect(h.records.get('ghaf.family')).toBe('existing-family');
    expect(h.raw.removeItem.mock.calls.map(([key]) => key)).toEqual(credentialKeys(ownKey));
  });

  it('preserves only the selected namespace recovery marker when requested', async () => {
    const h = harness();
    for (const key of [...credentialKeys(ACCOUNT_STORAGE_KEY), ...credentialKeys(childKey)]) {
      h.records.set(key, 'retained');
    }
    await h.child.clearCredentials(true);
    expect(h.records.get(`${childKey}.recovery`)).toBe('retained');
    expect(h.records.get(`${ACCOUNT_STORAGE_KEY}.recovery`)).toBe('retained');
    expect(h.raw.removeItem.mock.calls.map(([key]) => key)).toEqual(
      credentialKeys(childKey).slice(0, 3),
    );
  });

  it('reports a failed Child clear while attempting the remaining keys and preserving Parent access', async () => {
    const h = harness();
    h.records.set(ACCOUNT_STORAGE_KEY, 'parent-session');
    for (const key of credentialKeys(childKey)) h.records.set(key, 'child-session');
    h.raw.removeItem.mockImplementation(async (key) => {
      if (key === childKey) throw new Error('synthetic-store-locked');
      h.records.delete(key);
    });

    h.child.blockWrites();
    await expect(h.child.clearCredentials()).rejects.toMatchObject({ code: 'storage_unavailable' });
    expect(h.child.hasFailed).toBe(true);
    expect(h.parent.hasFailed).toBe(false);
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('parent-session');
    expect(h.raw.removeItem.mock.calls.map(([key]) => key)).toEqual(credentialKeys(childKey));
    expect(
      credentialKeys(childKey)
        .slice(1)
        .every((key) => !h.records.has(key)),
    ).toBe(true);
    await h.child.setItem(childKey, 'late-refresh');
    expect(h.records.get(childKey)).toBe('child-session');
  });

  it('serializes a pending Child write before clearing and rejects later refresh persistence', async () => {
    const h = harness();
    const started = deferred();
    const finish = deferred();
    h.raw.setItem.mockImplementation(async (key, value) => {
      started.resolve();
      await finish.promise;
      h.records.set(key, value);
    });
    const pending = h.child.setItem(childKey, 'in-flight-session');
    await started.promise;
    h.child.blockWrites();
    const clearing = h.child.clearCredentials();
    const late = h.child.setItem(childKey, 'late-session');
    finish.resolve();
    await Promise.all([pending, clearing, late]);
    expect(h.records.has(childKey)).toBe(false);
    expect(h.raw.setItem).toHaveBeenCalledTimes(1);
  });

  it('keeps native chunked sessions separate through GuardedAccountStorage cleanup', async () => {
    const records = new Map<string, string>();
    const raw = createSecureAccountStorage({
      getItemAsync: async (key) => records.get(key) ?? null,
      setItemAsync: async (key, value) => {
        records.set(key, value);
      },
      deleteItemAsync: async (key) => {
        records.delete(key);
      },
    });
    const parent = new GuardedAccountStorage(raw);
    const child = new GuardedAccountStorage(raw, childKey);
    const parentSession = `parent:${'p'.repeat(3_000)}`;
    await parent.setItem(ACCOUNT_STORAGE_KEY, parentSession);
    await child.setItem(childKey, `child:${'c'.repeat(3_000)}`);
    child.blockWrites();
    await child.clearCredentials();
    expect(await parent.getItem(ACCOUNT_STORAGE_KEY)).toBe(parentSession);
    expect([...records.keys()].some((key) => key.startsWith(childKey))).toBe(false);
    expect(
      [...records.keys()].some((key) => key.startsWith(`${ACCOUNT_STORAGE_KEY}.manifest`)),
    ).toBe(true);
  });
});
