import { describe, expect, it, vi } from 'vitest';

import { ParentAccountError } from '../src/models/parentAccount';
import { createSupabaseParentAccountService } from '../src/services/accounts';
import { validateParentAccountConfiguration } from '../src/services/accounts/configuration';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../src/services/accounts/SupabaseParentAccountService';
import {
  ACCOUNT_STORAGE_KEY,
  GuardedAccountStorage,
  RECOVERY_STORAGE_KEY,
} from '../src/services/accounts/storage';

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
    id: 'adult-a',
    email: 'adult@example.com',
    email_confirmed_at: '2026-09-13T00:00:00Z',
  };
  const session = {
    access_token: 'synthetic-access-token',
    refresh_token: 'synthetic-refresh-token',
  };
  let authListener: (event: string, session?: { user?: typeof user } | null) => void = () =>
    undefined;
  const persistSession = async () => {
    await storage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(session));
    return { data: { session }, error: null };
  };
  const maybeSingle = vi.fn(async () => ({
    data: { user_id: user.id, status: 'pending' },
    error: null as unknown,
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const client = {
    auth: {
      signUp: vi.fn(async () => ({ data: { session: null as unknown }, error: null as unknown })),
      signInWithPassword: vi.fn(persistSession),
      verifyOtp: vi.fn(persistSession),
      resend: vi.fn(async () => ({ data: {}, error: null as unknown })),
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null as unknown })),
      updateUser: vi.fn(async () => ({ data: {}, error: null as unknown })),
      getSession: vi.fn(async () => ({
        data: { session: await storage.getItem(ACCOUNT_STORAGE_KEY) },
        error: null as unknown,
      })),
      getUser: vi.fn(async () => ({
        data: { user: user as typeof user | null },
        error: null as unknown,
      })),
      signOut: vi.fn(async () => {
        await storage.removeItem(ACCOUNT_STORAGE_KEY);
        authListener('SIGNED_OUT');
        return { error: null as unknown };
      }),
      onAuthStateChange: vi.fn(
        (listener: (event: string, session?: { user?: typeof user } | null) => void) => {
          authListener = listener;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
      ),
      startAutoRefresh: vi.fn(async () => undefined),
      stopAutoRefresh: vi.fn(async () => undefined),
    },
    from: vi.fn(() => ({ select })),
  } satisfies AccountClientPort;
  const initialize = vi.fn(async () => ({ client, storage }));
  const service = new SupabaseParentAccountService(initialize);
  return {
    service,
    client,
    storage,
    records,
    rawStorage,
    initialize,
    user,
    session,
    maybeSingle,
    eq,
    select,
    emit: (event: string, session?: { user?: typeof user } | null) => authListener(event, session),
  };
}

describe('real Parent account adapter', () => {
  it('accepts explicit local development endpoints while rejecting remote HTTP or embedded credentials', () => {
    const publishableKey = 'sb_publishable_synthetic';
    for (const url of [
      'http://127.0.0.1:54321',
      'http://localhost:54321',
      'https://example.supabase.co',
    ]) {
      expect(() => validateParentAccountConfiguration({ url, publishableKey })).not.toThrow();
    }
    for (const url of [
      'http://example.com:54321',
      'http://localhost',
      'http://127.0.0.1',
      'http://localhost.example.com:54321',
      'https://user:password@example.supabase.co',
      'https://example.supabase.co?token=synthetic',
      'https://example.supabase.co#session',
    ]) {
      expect(() => validateParentAccountConfiguration({ url, publishableKey })).toThrow(
        'configuration_unavailable',
      );
    }
  });
  it('rejects missing configuration and server secrets before loading any provider', async () => {
    for (const publishableKey of ['', 'sb_secret_never-public', 'legacy-anon-jwt']) {
      const service = createSupabaseParentAccountService({
        url: 'https://example.supabase.co',
        publishableKey,
      });
      await expect(service.restoreSession()).rejects.toMatchObject({
        code: 'configuration_unavailable',
      });
    }
    const service = createSupabaseParentAccountService({
      url: 'http://example.com',
      publishableKey: 'sb_publishable_synthetic',
    });
    await expect(service.restoreSession()).rejects.toMatchObject({
      code: 'configuration_unavailable',
    });
  });
  it('remains lazy and registers normalized adult credentials without returning provider data', async () => {
    const h = harness();
    expect(h.initialize).not.toHaveBeenCalled();
    await expect(
      h.service.signUp(' Adult@Example.com ', 'long-password-value'),
    ).resolves.toBeUndefined();
    expect(h.client.auth.signUp).toHaveBeenCalledWith({
      email: 'adult@example.com',
      password: 'long-password-value',
    });
    expect(h.records.size).toBe(0);
  });

  it('rejects a project that bypasses required email confirmation and clears its session', async () => {
    const h = harness();
    h.client.auth.signUp.mockResolvedValue({ data: { session: h.session }, error: null });
    await expect(h.service.signUp(h.user.email, 'long-password-value')).rejects.toMatchObject({
      code: 'configuration_unavailable',
    });
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(h.records.size).toBe(0);
  });

  it('verifies a signup code with its intended type and exposes only server-validated identity', async () => {
    const h = harness();
    await expect(h.service.verifyEmail(h.user.email, '123456')).resolves.toEqual({
      userId: h.user.id,
      email: h.user.email,
    });
    expect(h.client.auth.verifyOtp).toHaveBeenCalledWith({
      email: h.user.email,
      token: '123456',
      type: 'signup',
    });
    expect(h.client.auth.getUser).toHaveBeenCalledOnce();
    await expect(h.service.verifyEmail(h.user.email, 'bad')).rejects.toMatchObject({
      code: 'invalid_code',
    });
  });

  it('accepts eight-digit provider codes for signup and recovery without truncating them', async () => {
    const h = harness();
    await expect(h.service.verifyEmail(h.user.email, '12345678')).resolves.toMatchObject({
      userId: h.user.id,
    });
    expect(h.client.auth.verifyOtp).toHaveBeenLastCalledWith({
      email: h.user.email,
      token: '12345678',
      type: 'signup',
    });
    await expect(h.service.verifyRecovery(h.user.email, '87654321')).resolves.toBeUndefined();
    expect(h.client.auth.verifyOtp).toHaveBeenLastCalledWith({
      email: h.user.email,
      token: '87654321',
      type: 'recovery',
    });
  });

  it.each(['1234567', '12345', '123456789', '1234567a', '١٢٣٤٥٦٧٨'])(
    'rejects invalid or unnormalized code %s before contacting the provider',
    async (code) => {
      const h = harness();
      await expect(h.service.verifyEmail(h.user.email, code)).rejects.toMatchObject({
        code: 'invalid_code',
      });
      await expect(h.service.verifyRecovery(h.user.email, code)).rejects.toMatchObject({
        code: 'invalid_code',
      });
      expect(h.client.auth.verifyOtp).not.toHaveBeenCalled();
    },
  );

  it('maps expired/reused codes and credentials to stable errors without provider details', async () => {
    const h = harness();
    h.client.auth.verifyOtp.mockRejectedValue({
      code: 'otp_expired',
      message: 'sensitive-email-secret',
    });
    await expect(h.service.verifyEmail(h.user.email, '123456')).rejects.toEqual(
      new ParentAccountError('invalid_code'),
    );
    h.client.auth.signInWithPassword.mockRejectedValue({
      code: 'invalid_credentials',
      message: 'sensitive-email-secret',
    });
    await expect(h.service.signIn(h.user.email, 'password')).rejects.toEqual(
      new ParentAccountError('invalid_credentials'),
    );
    h.client.auth.signInWithPassword.mockRejectedValue({ code: 'email_not_confirmed' });
    await expect(h.service.signIn(h.user.email, 'password')).rejects.toMatchObject({
      code: 'email_not_verified',
    });
  });

  it('restores only after validating identity remotely and never trusts cached user fields', async () => {
    const h = harness();
    expect(await h.service.restoreSession()).toBeNull();
    h.records.set(ACCOUNT_STORAGE_KEY, JSON.stringify({ ...h.session, user: { id: 'forged-id' } }));
    await expect(h.service.restoreSession()).resolves.toEqual({
      userId: h.user.id,
      email: h.user.email,
    });
    h.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 401 } });
    await expect(h.service.restoreSession()).rejects.toMatchObject({ code: 'session_expired' });
  });

  it('fails closed on approval absence, unexpected values and identity mismatches', async () => {
    const h = harness();
    await expect(h.service.getAccess('adult-b')).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.client.from).not.toHaveBeenCalled();
    for (const status of ['pending', 'approved', 'suspended']) {
      h.maybeSingle.mockResolvedValue({ data: { user_id: h.user.id, status }, error: null });
      await expect(h.service.getAccess(h.user.id)).resolves.toBe(status);
    }
    expect(h.select).toHaveBeenCalledWith('user_id,status');
    expect(h.eq).toHaveBeenCalledWith('user_id', h.user.id);
    h.maybeSingle.mockResolvedValue({
      data: { user_id: h.user.id, status: 'administrator' },
      error: null,
    });
    await expect(h.service.getAccess(h.user.id)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    h.maybeSingle.mockResolvedValue({ data: null as never, error: null });
    await expect(h.service.getAccess(h.user.id)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
  });

  it('keeps verified recovery durable across restart, blocks approval, then revokes sessions', async () => {
    const h = harness();
    await h.service.requestPasswordReset(h.user.email);
    await h.service.verifyRecovery(h.user.email, '123456');
    expect(h.client.auth.verifyOtp).toHaveBeenCalledWith({
      email: h.user.email,
      token: '123456',
      type: 'recovery',
    });
    const restarted = new SupabaseParentAccountService(h.initialize);
    await expect(restarted.restoreSession()).rejects.toMatchObject({ code: 'recovery_required' });
    await expect(restarted.getAccess(h.user.id)).rejects.toMatchObject({
      code: 'recovery_required',
    });
    await restarted.updatePassword('new-long-password');
    expect(h.client.auth.updateUser).toHaveBeenCalledWith({ password: 'new-long-password' });
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
    expect(h.records.size).toBe(0);
    expect(await restarted.restoreSession()).toBeNull();
  });

  it('does not allow password updates outside recovery and keeps failures recoverable', async () => {
    const h = harness();
    await expect(h.service.updatePassword('new-long-password')).rejects.toMatchObject({
      code: 'recovery_required',
    });
    await h.service.verifyRecovery(h.user.email, '123456');
    h.client.auth.updateUser.mockResolvedValue({ data: {}, error: { code: 'weak_password' } });
    await expect(h.service.updatePassword('new-long-password')).rejects.toMatchObject({
      code: 'weak_password',
    });
    expect(JSON.parse(h.records.get(RECOVERY_STORAGE_KEY)!)).toMatchObject({
      version: 1,
      state: 'verified',
      userId: h.user.id,
      email: h.user.email,
    });
  });

  it('clears recovery after ordinary password login', async () => {
    const h = harness();
    h.records.set(RECOVERY_STORAGE_KEY, '1');
    await h.service.signIn(h.user.email, 'password');
    expect(h.records.has(RECOVERY_STORAGE_KEY)).toBe(false);
    await expect(h.service.restoreSession()).resolves.toMatchObject({ userId: h.user.id });
  });

  it('does not let failed recovery for B reuse a retained normal session for A after restart', async () => {
    const h = harness();
    await h.service.signIn(h.user.email, 'password');
    h.maybeSingle.mockResolvedValueOnce({ data: null as never, error: { name: 'TypeError' } });
    await expect(h.service.getAccess(h.user.id)).rejects.toMatchObject({
      code: 'network_unavailable',
    });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(true);
    h.client.auth.verifyOtp.mockRejectedValueOnce({ code: 'otp_expired' });
    await expect(
      h.service.verifyRecovery('other-adult@example.com', '123456'),
    ).rejects.toMatchObject({ code: 'invalid_code' });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
    expect(JSON.parse(h.records.get(RECOVERY_STORAGE_KEY)!)).toEqual({
      version: 1,
      state: 'pending',
      email: 'other-adult@example.com',
    });
    const restarted = new SupabaseParentAccountService(h.initialize);
    await expect(restarted.updatePassword('replacement-password')).rejects.toMatchObject({
      code: 'recovery_required',
    });
    await expect(restarted.restoreSession()).rejects.toMatchObject({ code: 'session_expired' });
    await expect(restarted.updatePassword('replacement-password')).rejects.toMatchObject({
      code: 'session_expired',
    });
    expect(h.client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejects an OTP response whose server identity does not match the requested recovery email', async () => {
    const h = harness();
    await expect(
      h.service.verifyRecovery('other-adult@example.com', '123456'),
    ).rejects.toMatchObject({ code: 'invalid_code' });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
    const restarted = new SupabaseParentAccountService(h.initialize);
    await expect(restarted.updatePassword('replacement-password')).rejects.toMatchObject({
      code: 'recovery_required',
    });
    expect(h.client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('requires a verified recovery receipt to match the fresh server user before a password update', async () => {
    const h = harness();
    await h.service.verifyRecovery(h.user.email, '123456');
    h.client.auth.getUser.mockResolvedValue({
      data: { user: { ...h.user, id: 'adult-b', email: 'other-adult@example.com' } },
      error: null,
    });
    await expect(h.service.updatePassword('replacement-password')).rejects.toMatchObject({
      code: 'session_expired',
    });
    expect(h.client.auth.updateUser).not.toHaveBeenCalled();
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
  });

  it('treats pending, legacy and malformed recovery records as barriers without update authority', async () => {
    for (const marker of [
      '1',
      '{invalid',
      JSON.stringify({ version: 1, state: 'pending', email: 'adult@example.com' }),
    ]) {
      const h = harness();
      await h.service.signIn(h.user.email, 'password');
      h.records.set(RECOVERY_STORAGE_KEY, marker);
      await expect(h.service.updatePassword('replacement-password')).rejects.toMatchObject({
        code: 'recovery_required',
      });
      await expect(h.service.restoreSession()).rejects.toMatchObject({ code: 'session_expired' });
      expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
      expect(h.client.auth.updateUser).not.toHaveBeenCalled();
    }
  });

  it('cancels an approval read when the SDK reports an external account switch', async () => {
    const h = harness();
    await h.service.signIn(h.user.email, 'password');
    const started = deferred<void>();
    const response = deferred<{ data: { user_id: string; status: string }; error: null }>();
    h.maybeSingle.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const access = h.service.getAccess(h.user.id);
    const rejected = expect(access).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    h.emit('SIGNED_IN', { user: { ...h.user, id: 'adult-b', email: 'other-adult@example.com' } });
    response.resolve({ data: { user_id: h.user.id, status: 'approved' }, error: null });
    await rejected;
  });

  it('cancels an approval response that returns after signout', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: { user_id: string; status: string }; error: null }>();
    h.maybeSingle.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const access = h.service.getAccess(h.user.id);
    const rejected = expect(access).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    response.resolve({ data: { user_id: h.user.id, status: 'approved' }, error: null });
    await rejected;
    await logout;
    expect(await h.service.restoreSession()).toBeNull();
  });

  it('keeps the recovery marker when verification outcome is uncertain and surfaces resend limits', async () => {
    const h = harness();
    h.client.auth.verifyOtp.mockRejectedValueOnce(new TypeError('private transport detail'));
    await expect(h.service.verifyRecovery(h.user.email, '123456')).rejects.toMatchObject({
      code: 'network_unavailable',
    });
    expect(JSON.parse(h.records.get(RECOVERY_STORAGE_KEY)!)).toMatchObject({
      version: 1,
      state: 'pending',
      email: h.user.email,
    });
    h.client.auth.resend.mockResolvedValueOnce({ data: {}, error: { status: 429 } });
    await expect(h.service.resendVerification(h.user.email)).rejects.toMatchObject({
      code: 'rate_limited',
    });
  });

  it('closes immediately and prevents a delayed signin from restoring credentials after logout', async () => {
    const h = harness();
    const started = deferred<void>();
    const delayed = deferred<void>();
    h.client.auth.signInWithPassword.mockImplementationOnce(async () => {
      started.resolve();
      await delayed.promise;
      await h.storage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(h.session));
      return { data: { session: h.session }, error: null };
    });
    const events: string[] = [];
    h.service.onSessionChange((event) => events.push(event));
    const signin = h.service.signIn(h.user.email, 'password');
    const rejectedSignin = expect(signin).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    expect(events).toContain('signed-out');
    expect(await h.service.restoreSession()).toBeNull();
    delayed.resolve();
    await rejectedSignin;
    await logout;
    expect(h.records.size).toBe(0);
    await h.service.signIn(h.user.email, 'password');
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(true);
  });

  it('retains a transient SDK read snapshot for revocation after persistent credentials are cleared', async () => {
    const h = harness();
    await h.service.signIn(h.user.email, 'password');
    h.client.auth.signOut.mockImplementationOnce(async () => {
      expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
      expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe(JSON.stringify(h.session));
      return { error: null };
    });
    await h.service.signOut();
    expect(await h.storage.getItem(ACCOUNT_STORAGE_KEY)).toBeNull();
  });

  it('surfaces storage and network failure without synthetic fallback; failed logout still clears local credentials', async () => {
    const h = harness();
    h.rawStorage.setItem.mockRejectedValueOnce(new Error('device-secret-details'));
    await expect(h.service.signIn(h.user.email, 'password')).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    await h.service.signIn(h.user.email, 'password');
    h.client.auth.signOut.mockRejectedValueOnce(new TypeError('private-network-details'));
    await expect(h.service.signOut()).rejects.toMatchObject({ code: 'network_unavailable' });
    expect(h.records.size).toBe(0);
  });

  it('refreshes only while active and emits a fail-closed account event for remote signout', async () => {
    const h = harness();
    const events: string[] = [];
    h.service.onSessionChange((event) => events.push(event));
    await h.service.signIn(h.user.email, 'password');
    h.service.setAppActive(false);
    expect(h.client.auth.stopAutoRefresh).toHaveBeenCalled();
    h.service.setAppActive(true);
    expect(h.client.auth.startAutoRefresh).toHaveBeenCalled();
    h.emit('TOKEN_REFRESHED');
    expect(events).toContain('changed');
    h.emit('SIGNED_OUT');
    expect(events).toContain('signed-out');
    expect(await h.service.restoreSession()).toBeNull();
    h.service.dispose();
  });
});
