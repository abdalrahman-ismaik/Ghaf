import { describe, expect, it, vi } from 'vitest';

import type { AccountProfileUpdate } from '../../src/models/parentAccount';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { GuardedAccountStorage, RECOVERY_STORAGE_KEY } from '../../src/services/accounts/storage';

const userId = '01800000-0000-4000-8000-000000000001';
const otherId = '01800000-0000-4000-8000-000000000002';
const row = {
  user_id: userId,
  display_name: 'Synthetic adult',
  preferred_locale: 'ar',
  revision: 1,
  updated_at: '2026-09-14T12:00:00+00:00',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function harness() {
  const records = new Map<string, string>();
  const rawStorage = {
    getItem: vi.fn(async (key: string) => records.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      records.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      records.delete(key);
    }),
  };
  const storage = new GuardedAccountStorage(rawStorage);
  const user = {
    id: userId,
    email: 'synthetic-adult@example.invalid',
    email_confirmed_at: '2026-09-14T00:00:00Z',
  };
  let listener: (event: string, session?: { user?: typeof user } | null) => void = () => undefined;
  const rpc = vi.fn(
    async (
      ..._args: Parameters<AccountClientPort['rpc']>
    ): Promise<{ data: unknown; error: unknown; status?: number }> => ({
      data: [row],
      error: null,
      status: 200,
    }),
  );
  const client = {
    auth: {
      signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { session: {} }, error: null })),
      verifyOtp: vi.fn(async () => ({ data: { session: {} }, error: null })),
      resend: vi.fn(async () => ({ data: {}, error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
      updateUser: vi.fn(async () => ({ data: {}, error: null })),
      getSession: vi.fn(async () => ({
        data: { session: { access_token: 'synthetic-profile-token' } },
        error: null,
      })),
      getUser: vi.fn(async () => ({
        data: { user: user as typeof user | null },
        error: null as unknown,
      })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn((next: typeof listener) => {
        listener = next;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      startAutoRefresh: vi.fn(async () => undefined),
      stopAutoRefresh: vi.fn(async () => undefined),
    },
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    })),
    rpc(...args: Parameters<AccountClientPort['rpc']>) {
      const request = rpc(...args);
      return Object.assign(request, { setHeader: vi.fn(() => request) });
    },
  } satisfies AccountClientPort;
  const service = new SupabaseParentAccountService(async () => ({ client, storage }));
  return {
    service,
    rpc,
    client,
    storage,
    rawStorage,
    records,
    user,
    emit: (id: string) => listener('SIGNED_IN', { user: { ...user, id } }),
  };
}

describe('account-owned profile service', () => {
  it('loads exactly one profile matching the freshly verified stable identity without a local cache', async () => {
    const h = harness();
    const profile = await h.service.loadProfile();
    expect(h.client.auth.getUser).toHaveBeenCalledOnce();
    expect(h.rpc).toHaveBeenCalledWith('get_or_create_account_profile');
    expect(profile).toEqual({
      userId,
      displayName: row.display_name,
      preferredLocale: 'ar',
      revision: 1,
      updatedAt: row.updated_at,
    });
    expect(h.records.size).toBe(0);
  });

  it('accepts the empty server default without inventing a name from local family data', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({ data: [{ ...row, display_name: '', revision: 0 }], error: null });
    expect(await h.service.loadProfile()).toMatchObject({ displayName: '', revision: 0 });
  });

  it('saves only the explicit fields and expected revision, then returns the real response', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: [
        { ...row, display_name: 'Profile from device A', preferred_locale: 'en', revision: 2 },
      ],
      error: null,
    });
    const profile = await h.service.saveProfile({
      displayName: '  Profile from device A  ',
      preferredLocale: 'en',
      expectedRevision: 1,
      userId: otherId,
    } as AccountProfileUpdate);
    expect(h.rpc).toHaveBeenCalledWith('save_account_profile', {
      p_display_name: 'Profile from device A',
      p_preferred_locale: 'en',
      p_expected_revision: 1,
    });
    expect(profile).toMatchObject({ userId, revision: 2, preferredLocale: 'en' });
    expect(h.records.size).toBe(0);
  });

  it.each(
    [
      null,
      [],
      [row, row],
      [null],
      [{ ...row, user_id: otherId }],
      [{ ...row, display_name: 7 }],
      [{ ...row, display_name: 'x'.repeat(81) }],
      [{ ...row, display_name: ' padded ' }],
      [{ ...row, display_name: '' }],
      [{ ...row, preferred_locale: 'fr' }],
      [{ ...row, revision: '1' }],
      [{ ...row, revision: -1 }],
      [{ ...row, revision: 1.5 }],
      [{ ...row, revision: Number.MAX_SAFE_INTEGER + 1 }],
      [{ ...row, updated_at: 'not-a-date' }],
      [{ ...row, updated_at: '2026-09-14T12:00:00' }],
    ].map((data) => ({ data })),
  )('rejects wrong-owner or malformed server rows %#', async ({ data }) => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({ data, error: null });
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'profile_unavailable' });
  });

  it.each([
    { displayName: '' },
    { displayName: '   ' },
    { displayName: 'x'.repeat(81) },
    { displayName: null },
    { preferredLocale: 'xx' },
    { expectedRevision: -1 },
    { expectedRevision: 1.5 },
    { expectedRevision: Number.MAX_SAFE_INTEGER },
  ])('validates edits before a provider request %#', async (invalid) => {
    const h = harness();
    await expect(
      h.service.saveProfile({
        displayName: 'Valid name',
        preferredLocale: 'ar',
        expectedRevision: 1,
        ...invalid,
      } as AccountProfileUpdate),
    ).rejects.toMatchObject({ code: 'invalid_profile' });
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.client.auth.getUser).not.toHaveBeenCalled();
  });

  it('uses Unicode character bounds for display names', async () => {
    const h = harness();
    const displayName = '🌱'.repeat(80);
    h.rpc.mockResolvedValueOnce({
      data: [{ ...row, display_name: displayName, revision: 2 }],
      error: null,
    });
    expect(
      await h.service.saveProfile({ displayName, preferredLocale: 'ar', expectedRevision: 1 }),
    ).toMatchObject({ displayName, revision: 2 });
  });

  it.each([
    { revision: 1 },
    { revision: 3 },
    { display_name: 'Unexpected name' },
    { preferred_locale: 'en' },
  ])('does not report success for a mismatched save response %#', async (mismatch) => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({ data: [{ ...row, revision: 2, ...mismatch }], error: null });
    await expect(
      h.service.saveProfile({
        displayName: row.display_name,
        preferredLocale: 'ar',
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ code: 'profile_unavailable' });
  });

  it.each([
    ['PT409', 'profile_conflict'],
    ['PT400', 'invalid_profile'],
    ['42501', 'access_unavailable'],
    ['PGRST202', 'profile_unavailable'],
    ['PGRST301', 'session_expired'],
    ['PGRST303', 'session_expired'],
  ])(
    'sanitizes RPC error %s without returning private provider messages',
    async (code, expected) => {
      const h = harness();
      h.rpc.mockResolvedValueOnce({
        data: null,
        error: { code, message: 'private-provider-detail' },
      });
      await expect(h.service.loadProfile()).rejects.toMatchObject({
        code: expected,
        message: expected,
      });
    },
  );

  it('retains a recoverable session on a network error and allows a subsequent server refresh', async () => {
    const h = harness();
    h.records.set('synthetic-session-marker', 'retained');
    h.rpc.mockRejectedValueOnce(new TypeError('private-network-detail'));
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'network_unavailable' });
    expect(h.records.get('synthetic-session-marker')).toBe('retained');
    expect(h.client.auth.signOut).not.toHaveBeenCalled();
    expect(await h.service.loadProfile()).toMatchObject({ userId });
  });

  it('recognizes the installed PostgREST zero-status transport failure without parsing private messages', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: '', message: 'private-network-detail' },
      status: 0,
    });
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'network_unavailable' });
    expect(h.client.auth.signOut).not.toHaveBeenCalled();
  });

  it('does not fetch a profile without a verified current identity or during recovery', async () => {
    const h = harness();
    h.client.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'session_expired' });
    h.client.auth.getUser.mockResolvedValueOnce({
      data: { user: { ...h.user, email_confirmed_at: '' } },
      error: null,
    });
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'email_not_verified' });
    h.records.set(RECOVERY_STORAGE_KEY, 'pending');
    await expect(h.service.loadProfile()).rejects.toMatchObject({ code: 'recovery_required' });
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it('cancels a delayed load after account switching before it can populate the next profile', async () => {
    const h = harness();
    await h.service.loadProfile();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const pending = h.service.loadProfile();
    const rejected = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    h.emit(otherId);
    response.resolve({ data: [row], error: null });
    await rejected;
    h.client.auth.getUser.mockResolvedValueOnce({
      data: { user: { ...h.user, id: otherId } },
      error: null,
    });
    h.rpc.mockResolvedValueOnce({
      data: [{ ...row, user_id: otherId, display_name: 'Other adult' }],
      error: null,
    });
    expect(await h.service.loadProfile()).toMatchObject({
      userId: otherId,
      displayName: 'Other adult',
    });
  });

  it('invalidates an in-flight save and queued work immediately on logout', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const pending = h.service.saveProfile({
      displayName: row.display_name,
      preferredLocale: 'ar',
      expectedRevision: 1,
    });
    const rejected = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    const queued = h.service.loadProfile();
    const queuedRejected = expect(queued).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    expect(await h.service.restoreSession()).toBeNull();
    response.resolve({ data: [{ ...row, revision: 2 }], error: null });
    await rejected;
    await queuedRejected;
    await logout;
    expect(h.rpc).toHaveBeenCalledOnce();
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('stops before the RPC when logout interrupts the remote identity check', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: { user: typeof h.user }; error: null }>();
    h.client.auth.getUser.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const pending = h.service.loadProfile();
    const rejected = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    response.resolve({ data: { user: h.user }, error: null });
    await rejected;
    await logout;
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it('stops before identity verification if logout interrupts secure-storage access', async () => {
    const h = harness();
    const started = deferred<void>();
    const read = deferred<string | null>();
    h.rawStorage.getItem.mockImplementationOnce(() => {
      started.resolve();
      return read.promise;
    });
    const pending = h.service.loadProfile();
    const rejected = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    read.resolve(null);
    await rejected;
    await logout;
    expect(h.client.auth.getUser).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it('discards a load completing after service disposal', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const pending = h.service.loadProfile();
    const rejected = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    h.service.dispose();
    response.resolve({ data: [row], error: null });
    await rejected;
  });
});
