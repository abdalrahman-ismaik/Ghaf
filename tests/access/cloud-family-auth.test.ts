import { describe, expect, it, vi } from 'vitest';
import { createClient, processLock } from '@supabase/supabase-js';

import { createProjectAccountStorage } from '../../src/services/accounts';

import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import {
  ACCOUNT_STORAGE_KEY,
  GuardedAccountStorage,
  RECOVERY_STORAGE_KEY,
} from '../../src/services/accounts/storage';

const parentId = '02000000-0000-4000-8000-000000000001';
const childUserId = '02000000-0000-4000-8000-000000000002';
const familyId = '02000000-0000-4000-8000-000000000003';
const childId = '02000000-0000-4000-8000-000000000004';
const requestId = '02000000-0000-4000-8000-000000000005';
const otherId = '02000000-0000-4000-8000-000000000006';
const token = 'abcdef01'.repeat(8);
const identity = { userId: childUserId, role: 'child', familyId, childId };
const childAccount = { userId: childUserId, email: '', role: 'child', familyId, childId };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

function harness(mode: 'signed-out' | 'adult' | 'child' | 'unpaired' = 'adult') {
  const records = new Map<string, string>();
  if (mode !== 'signed-out') records.set(ACCOUNT_STORAGE_KEY, 'synthetic-provider-session');
  const storage = new GuardedAccountStorage({
    getItem: async (key) => records.get(key) ?? null,
    setItem: async (key, value) => {
      records.set(key, value);
    },
    removeItem: async (key) => {
      records.delete(key);
    },
  });
  const adult = {
    id: parentId,
    email: 'synthetic-parent@example.invalid',
    email_confirmed_at: '2026-09-14T00:00:00Z',
    is_anonymous: false,
  };
  const anonymous = { id: childUserId, is_anonymous: true };
  let user: { id: string; email?: string; email_confirmed_at?: string; is_anonymous?: boolean } =
    mode === 'adult' ? adult : anonymous;
  let paired = mode === 'child';
  let authListener: (event: string, session?: { user: typeof user } | null) => void = () =>
    undefined;
  let databaseSignal: () => void = () => undefined;
  let channelStatus: (status: string) => void = () => undefined;
  const channel = {
    on: vi.fn((_event: unknown, _filter: unknown, callback: () => void) => {
      databaseSignal = callback;
      return channel;
    }),
    subscribe: vi.fn((callback: (status: string) => void) => {
      channelStatus = callback;
      return channel;
    }),
  };
  const rpc = vi.fn(
    async (
      name: string,
      _args?: Record<string, unknown>,
    ): Promise<{ data: unknown; error: unknown }> => {
      if (name === 'ghaf_family_identity')
        return paired ? { data: identity, error: null } : { data: null, error: { code: '42501' } };
      if (name === 'ghaf_redeem_family_invite') paired = true;
      return { data: { authoritative: 'synthetic-response' }, error: null };
    },
  );
  const client = {
    auth: {
      signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { session: {} }, error: null })),
      signInAnonymously: vi.fn(async () => {
        user = anonymous;
        await storage.setItem(ACCOUNT_STORAGE_KEY, 'synthetic-child-session');
        authListener('SIGNED_IN', { user });
        return { data: { session: {} }, error: null };
      }),
      verifyOtp: vi.fn(async () => ({ data: { session: {} }, error: null })),
      resend: vi.fn(async () => ({ data: {}, error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
      updateUser: vi.fn(async () => ({ data: {}, error: null })),
      getSession: vi.fn(async () => ({
        data: {
          session: (await storage.getItem(ACCOUNT_STORAGE_KEY))
            ? { access_token: `synthetic-token-${user.id}` }
            : null,
        },
        error: null,
      })),
      getUser: vi.fn(async () => ({ data: { user }, error: null as unknown })),
      signOut: vi.fn(async () => {
        await storage.removeItem(ACCOUNT_STORAGE_KEY);
        authListener('SIGNED_OUT');
        return { error: null };
      }),
      onAuthStateChange: vi.fn((listener: typeof authListener) => {
        authListener = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      startAutoRefresh: vi.fn(async () => undefined),
      stopAutoRefresh: vi.fn(async () => undefined),
    },
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { user_id: parentId, status: 'approved' },
            error: null,
          }),
        }),
      }),
    })),
    rpc: vi.fn((name: string, args?: Record<string, unknown>) => {
      const pending = args === undefined ? rpc(name) : rpc(name, args);
      return Object.assign(pending, { setHeader: vi.fn(() => pending) });
    }),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(async () => 'ok'),
  } satisfies AccountClientPort;
  const service = new SupabaseParentAccountService(async () => ({ client, storage }));
  return {
    service,
    client,
    rpc,
    records,
    storage,
    channel,
    changeUser(nextId: string, event?: string) {
      user = { ...user, id: nextId };
      if (event) authListener(event, { user });
    },
    emit(event: string) {
      authListener(event, { user });
    },
    databaseSignal: () => databaseSignal(),
    channelStatus: (status: string) => channelStatus(status),
  };
}

describe('Supabase family account transport', () => {
  it('pins the hosted Masroofi RPCs to the verified caller and denies internal helpers', async () => {
    const h = harness();
    for (const name of ['ghaf_family_masroofi', 'ghaf_family_masroofi_command']) {
      await expect(
        h.service.familyRequest(name, { p_family_id: familyId }, parentId),
      ).resolves.toEqual({
        authoritative: 'synthetic-response',
      });
    }
    for (const call of h.client.rpc.mock.results)
      expect(call.value.setHeader).toHaveBeenCalledWith(
        'Authorization',
        `Bearer synthetic-token-${parentId}`,
      );
    await expect(
      h.service.familyRequest('ghaf_masroofi_credit', {}, parentId),
    ).rejects.toMatchObject({
      code: 'access_unavailable',
    });
  });

  it.each([
    [{ code: 'PGRST202' }, 'schema_unavailable'],
    [{ code: 'PT400', message: 'age_ineligible' }, 'age_ineligible'],
    [{ code: 'PT400', message: 'task_ineligible' }, 'task_ineligible'],
    [{ code: 'PT400', message: 'promise_locked' }, 'promise_locked'],
    [{ code: 'PT400', message: 'balance_limit' }, 'balance_limit'],
    [{ code: 'PT409' }, 'request_conflict'],
    [{ code: 'PT428' }, 'reauth_required'],
    [{ code: 'PT400', message: 'private database diagnostic' }, 'invalid_profile'],
    [{ code: 'constructor', message: 'private database diagnostic' }, 'provider_unavailable'],
  ])(
    'retains safe Masroofi failures while withholding arbitrary server messages',
    async (error, code) => {
      const h = harness();
      h.rpc.mockResolvedValueOnce({ data: null, error });
      await expect(
        h.service.familyRequest('ghaf_family_masroofi_command', {}, parentId),
      ).rejects.toMatchObject({ code });
    },
  );

  it('does not publish a Masroofi response after the account changes', async () => {
    const h = harness();
    const waiting = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockReturnValueOnce(waiting.promise);
    const pending = h.service.familyRequest(
      'ghaf_family_masroofi',
      { p_family_id: familyId },
      parentId,
    );
    const denied = expect(pending).rejects.toMatchObject({ code: 'operation_cancelled' });
    await vi.waitFor(() => expect(h.rpc).toHaveBeenCalledOnce());
    h.changeUser(otherId, 'SIGNED_IN');
    waiting.resolve({ data: { authoritative: 'previous-family' }, error: null });
    await denied;
  });

  it('blocks stale legacy profile and workspace callers before any read or mutation RPC', async () => {
    const h = harness();
    const actions = [
      () => h.service.loadProfile(otherId),
      () =>
        h.service.saveProfile(
          { displayName: 'Old A draft', preferredLocale: 'ar', expectedRevision: 0 },
          otherId,
        ),
      () => h.service.loadWorkspace(otherId),
      () =>
        h.service.updateWorkspace(
          { expectedRevision: 0, command: { type: 'rename_family', name: 'Old A draft' } },
          otherId,
        ),
    ];
    for (const action of actions)
      await expect(action()).rejects.toMatchObject({ code: 'operation_cancelled' });
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it.each(['profile', 'workspace'] as const)(
    'pins legacy %s mutations before a provider identity change',
    async (domain) => {
      const h = harness();
      const waiting = deferred<{ data: unknown; error: unknown }>();
      h.rpc.mockReturnValueOnce(waiting.promise);
      const operation =
        domain === 'profile'
          ? h.service.saveProfile(
              { displayName: 'A only', preferredLocale: 'ar', expectedRevision: 0 },
              parentId,
            )
          : h.service.updateWorkspace(
              { expectedRevision: 0, command: { type: 'rename_family', name: 'A only' } },
              parentId,
            );
      const cancelled = expect(operation).rejects.toMatchObject({ code: 'operation_cancelled' });
      await vi.waitFor(() => expect(h.rpc).toHaveBeenCalledOnce());
      expect(h.client.auth.getUser).toHaveBeenCalledWith(`synthetic-token-${parentId}`);
      expect(h.client.rpc.mock.results[0]?.value.setHeader).toHaveBeenCalledWith(
        'Authorization',
        `Bearer synthetic-token-${parentId}`,
      );
      h.changeUser(otherId, 'SIGNED_IN');
      waiting.resolve({ data: null, error: null });
      await cancelled;
    },
  );

  it('allows only the approved messaging RPCs and rejects their private helpers', async () => {
    const h = harness();
    for (const name of [
      'ghaf_family_message_threads',
      'ghaf_family_message_page',
      'ghaf_family_message_send',
      'ghaf_family_message_mark_read',
      'ghaf_family_peer_permissions',
      'ghaf_family_peer_permission',
      'ghaf_family_peer_leave',
    ])
      await h.service.familyRequest(name, { p_family_id: familyId }, parentId);
    expect(h.rpc).toHaveBeenCalledTimes(7);
    for (const name of [
      'ghaf_message_thread',
      'ghaf_message_parent_name',
      'ghaf_family_message_purge_expired',
    ])
      await expect(h.service.familyRequest(name, {}, parentId)).rejects.toMatchObject({
        code: 'access_unavailable',
      });
    expect(h.rpc).toHaveBeenCalledTimes(7);
  });

  it('rejects a stale caller identity before any family mutation or password request', async () => {
    const h = harness();
    await expect(
      h.service.familyRequest('ghaf_family_command', { p_family_id: familyId }, otherId),
    ).rejects.toMatchObject({ code: 'operation_cancelled' });
    expect(h.rpc).not.toHaveBeenCalled();
    await expect(h.service.reauthenticate('synthetic-password', otherId)).rejects.toMatchObject({
      code: 'operation_cancelled',
    });
    expect(h.client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('pins Authorization to the explicitly verified token rather than a later SDK identity', async () => {
    const h = harness();
    h.rpc.mockImplementationOnce(async () => {
      h.changeUser(otherId);
      return { data: { acknowledged: true }, error: null };
    });
    await expect(
      h.service.familyRequest('ghaf_family_command', { p_family_id: familyId }, parentId),
    ).rejects.toMatchObject({ code: 'operation_cancelled' });
    expect(h.client.auth.getUser).toHaveBeenCalledWith(`synthetic-token-${parentId}`);
    expect(h.client.rpc.mock.results[0]?.value.setHeader).toHaveBeenCalledWith(
      'Authorization',
      `Bearer synthetic-token-${parentId}`,
    );
  });

  it('reauthenticates only the verified current adult and retains same-principal subscriptions', async () => {
    const h = harness();
    const events: string[] = [];
    h.service.onSessionChange((event) => events.push(event));
    await h.service.subscribeFamily(familyId, vi.fn());
    h.client.auth.signInWithPassword.mockImplementationOnce(async () => {
      h.emit('SIGNED_IN');
      return { data: { session: {} }, error: null };
    });
    await h.service.reauthenticate('synthetic-recheck-password');
    expect(h.client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'synthetic-parent@example.invalid',
      password: 'synthetic-recheck-password',
    });
    expect(h.client.auth.getUser).toHaveBeenCalledTimes(3);
    expect(events).toEqual(['refreshed']);
    expect(h.client.removeChannel).not.toHaveBeenCalled();
    expect([...h.records.values()].join('')).not.toContain('synthetic-recheck-password');
    h.service.dispose();
  });

  it('denies Child reauthentication and a recovery session without contacting password auth', async () => {
    const child = harness('child');
    await expect(child.service.reauthenticate('synthetic-password')).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(child.client.auth.signInWithPassword).not.toHaveBeenCalled();
    const recovery = harness();
    recovery.records.set(RECOVERY_STORAGE_KEY, 'recovery-barrier');
    await expect(recovery.service.reauthenticate('synthetic-password')).rejects.toMatchObject({
      code: 'recovery_required',
    });
    expect(recovery.client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('does not accept a different principal returned by password reauthentication', async () => {
    const h = harness();
    h.client.auth.signInWithPassword.mockImplementationOnce(async () => {
      h.changeUser(otherId);
      return { data: { session: {} }, error: null };
    });
    await expect(h.service.reauthenticate('synthetic-password')).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
  });

  it('uses verified identity before and after a narrow family RPC without local data fallback', async () => {
    const h = harness();
    const args = { p_family_id: familyId };
    await expect(h.service.familyRequest('ghaf_family_snapshot', args)).resolves.toEqual({
      authoritative: 'synthetic-response',
    });
    expect(h.rpc).toHaveBeenCalledWith('ghaf_family_snapshot', args);
    expect(h.client.auth.getUser).toHaveBeenCalledTimes(2);
    expect(h.records.size).toBe(1);
    for (const name of ['save_account_profile', 'admin_create_user', 'unknown', '']) {
      await expect(h.service.familyRequest(name)).rejects.toMatchObject({
        code: 'access_unavailable',
      });
    }
    expect(h.rpc).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['PT409', 'profile_conflict'],
    ['PT400', 'invalid_profile'],
    ['42501', 'access_unavailable'],
    ['PT428', 'reauth_required'],
    ['PT429', 'rate_limited'],
    ['22023', 'invalid_profile'],
    ['40001', 'profile_conflict'],
    ['54000', 'rate_limited'],
  ])(
    'maps %s without exposing backend content or returning an empty family',
    async (code, safe) => {
      const h = harness();
      h.rpc.mockResolvedValueOnce({
        data: null,
        error: { code, message: 'private family content' },
      });
      await expect(h.service.familyRequest('ghaf_family_command')).rejects.toMatchObject({
        code: safe,
        message: safe,
      });
    },
  );

  it('blocks recovery sessions before any family request', async () => {
    const h = harness();
    h.records.set(RECOVERY_STORAGE_KEY, 'pending-recovery');
    await expect(h.service.familyRequest('ghaf_family_snapshot')).rejects.toMatchObject({
      code: 'recovery_required',
    });
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it('does not interpret raw backend message text as a privileged error code', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'P0001', message: 'reauth_required', details: 'private server details' },
    });
    await expect(h.service.familyRequest('ghaf_family_growth_command')).rejects.toMatchObject({
      code: 'provider_unavailable',
      message: 'provider_unavailable',
    });
  });

  it.each(['SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED'])(
    'discards a delayed family response on a different identity %s event',
    async (event) => {
      const h = harness();
      const waiting = deferred<{ data: unknown; error: unknown }>();
      h.rpc.mockReturnValueOnce(waiting.promise);
      const load = h.service.familyRequest('ghaf_family_snapshot');
      const rejected = expect(load).rejects.toMatchObject({ code: 'operation_cancelled' });
      await vi.waitFor(() => expect(h.rpc).toHaveBeenCalledOnce());
      h.changeUser(otherId, event);
      waiting.resolve({ data: { family: 'old-account' }, error: null });
      await rejected;
    },
  );

  it('also detects identity replacement without a provider notification', async () => {
    const h = harness();
    h.rpc.mockImplementationOnce(async () => {
      h.changeUser(otherId);
      return { data: { family: 'old-account' }, error: null };
    });
    await expect(h.service.familyRequest('ghaf_family_snapshot')).rejects.toMatchObject({
      code: 'operation_cancelled',
    });
  });

  it('removes subscription signals immediately on logout and suppresses a late response', async () => {
    const h = harness();
    const changed = vi.fn();
    const cleanup = await h.service.subscribeFamily(familyId, changed);
    expect(h.channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'app_families', filter: `id=eq.${familyId}` },
      expect.any(Function),
    );
    h.channelStatus('SUBSCRIBED');
    h.databaseSignal();
    expect(changed).toHaveBeenCalledTimes(2);
    const waiting = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockReturnValueOnce(waiting.promise);
    const load = h.service.familyRequest('ghaf_family_snapshot');
    const rejected = expect(load).rejects.toMatchObject({ code: 'operation_cancelled' });
    await vi.waitFor(() => expect(h.rpc).toHaveBeenCalledOnce());
    const logout = h.service.signOut();
    h.databaseSignal();
    h.channelStatus('SUBSCRIBED');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(h.client.removeChannel).toHaveBeenCalledOnce();
    waiting.resolve({ data: { family: 'old-account' }, error: null });
    await rejected;
    await logout;
    cleanup();
    expect(h.client.removeChannel).toHaveBeenCalledOnce();
  });

  it.each(['SIGNED_IN', 'PASSWORD_RECOVERY', 'dispose'])(
    'cleans up Realtime on %s and never applies event contents',
    async (event) => {
      const h = harness();
      const changed = vi.fn();
      await h.service.subscribeFamily(familyId, changed);
      if (event === 'SIGNED_IN') h.changeUser(otherId, event);
      else if (event === 'dispose') h.service.dispose();
      else h.emit(event);
      h.databaseSignal();
      h.channelStatus('SUBSCRIBED');
      expect(changed).not.toHaveBeenCalled();
      expect(h.client.removeChannel).toHaveBeenCalledOnce();
    },
  );

  it('refreshes on reconnect, channel failure and timeout instead of claiming delivery', async () => {
    const h = harness();
    const changed = vi.fn();
    await h.service.subscribeFamily(familyId, changed);
    for (const status of ['SUBSCRIBED', 'TIMED_OUT', 'CHANNEL_ERROR', 'CLOSED', 'SUBSCRIBED'])
      h.channelStatus(status);
    expect(changed).toHaveBeenCalledTimes(5);
    h.service.dispose();
  });
});

describe('separate paired Child Auth identity', () => {
  it('creates its own anonymous identity and only opens after verified server membership', async () => {
    const h = harness('signed-out');
    await expect(h.service.pairChildDevice(token, requestId)).resolves.toEqual(childAccount);
    expect(h.client.auth.signInAnonymously).toHaveBeenCalledOnce();
    expect(h.client.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(h.rpc).toHaveBeenCalledWith('ghaf_redeem_family_invite', {
      p_token: token,
      p_request_id: requestId,
    });
    expect(h.rpc).toHaveBeenCalledWith('ghaf_family_identity');
    await expect(h.service.restoreSession()).resolves.toEqual(childAccount);
    await expect(h.service.getAccess(childUserId)).resolves.toBe('approved');
    expect(h.client.from).not.toHaveBeenCalled();
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe('synthetic-child-session');
  });

  it('cannot reuse a Parent session or rebind a restored Child', async () => {
    const h = harness();
    await expect(h.service.pairChildDevice(token, requestId)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.client.auth.signOut).not.toHaveBeenCalled();
    const child = harness('child');
    await child.service.restoreSession();
    await expect(child.service.pairChildDevice(token, requestId)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(child.rpc).not.toHaveBeenCalledWith('ghaf_redeem_family_invite', expect.anything());
  });

  it.each([
    null,
    [],
    { ...identity, userId: otherId },
    { ...identity, role: 'parent' },
    { ...identity, familyId: null },
    { ...identity, childId: 'salem' },
    { ...identity, permissions: ['parent'] },
  ])('rejects malformed, unpaired or mismatched server identity %#', async (data) => {
    const h = harness('child');
    h.rpc.mockResolvedValueOnce({ data, error: null });
    await expect(h.service.restoreSession()).rejects.toMatchObject({ code: 'access_unavailable' });
    expect(h.client.from).not.toHaveBeenCalled();
  });

  it('blocks unpaired anonymous access and rechecks revocation on every restore/access call', async () => {
    const unpaired = harness('unpaired');
    await expect(unpaired.service.restoreSession()).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    const h = harness('child');
    await h.service.restoreSession();
    h.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501' } });
    await expect(h.service.getAccess(childUserId)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.client.from).not.toHaveBeenCalled();
  });

  it('denies legacy adult profile/workspace operations and other-family subscriptions for Child', async () => {
    const h = harness('child');
    for (const action of [
      () => h.service.loadProfile(),
      () => h.service.saveProfile({ displayName: 'A', preferredLocale: 'ar', expectedRevision: 0 }),
      () => h.service.loadWorkspace(),
      () =>
        h.service.updateWorkspace({
          expectedRevision: 0,
          command: { type: 'rename_family', name: 'A' },
        }),
      () => h.service.subscribeFamily(otherId, vi.fn()),
    ])
      await expect(action()).rejects.toMatchObject({ code: 'access_unavailable' });
    expect(h.rpc.mock.calls.every(([name]) => name === 'ghaf_family_identity')).toBe(true);
    expect(h.client.channel).not.toHaveBeenCalled();
  });

  it('clears a failed anonymous redemption and can retry from a clean signed-out session', async () => {
    const h = harness('signed-out');
    h.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501', message: 'private token' } });
    await expect(h.service.pairChildDevice(token, requestId)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    await expect(h.service.pairChildDevice(token, requestId)).resolves.toEqual(childAccount);
    expect(h.client.auth.signInAnonymously).toHaveBeenCalledTimes(2);
  });

  it('retains only the anonymous session after an ambiguous network failure for an exact retry', async () => {
    const h = harness('signed-out');
    h.rpc.mockRejectedValueOnce(new TypeError('network synthetic failure'));
    await expect(h.service.pairChildDevice(token, requestId)).rejects.toMatchObject({
      code: 'network_unavailable',
    });
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(true);
    expect(h.client.auth.signOut).not.toHaveBeenCalled();
    await expect(h.service.pairChildDevice(token, requestId)).resolves.toEqual(childAccount);
    expect(h.client.auth.signInAnonymously).toHaveBeenCalledOnce();
  });

  it('does not reopen a Child when redemption finishes after signout', async () => {
    const h = harness('signed-out');
    const pending = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockReturnValueOnce(pending.promise);
    const pairing = h.service.pairChildDevice(token, requestId);
    const rejected = expect(pairing).rejects.toMatchObject({ code: 'operation_cancelled' });
    await vi.waitFor(() =>
      expect(h.rpc).toHaveBeenCalledWith('ghaf_redeem_family_invite', expect.anything()),
    );
    const logout = h.service.signOut();
    pending.resolve({ data: { snapshot: {}, result: null }, error: null });
    await rejected;
    await logout;
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(false);
    expect(h.rpc).not.toHaveBeenCalledWith('ghaf_family_identity');
    expect(await h.service.restoreSession()).toBeNull();
  });

  it('rejects short pairing tokens and malformed request IDs before creating an Auth user', async () => {
    const h = harness('signed-out');
    for (const [candidate, request] of [
      ['123456', requestId],
      [token, 'request'],
      [token.toUpperCase(), requestId],
    ])
      await expect(h.service.pairChildDevice(candidate!, request!)).rejects.toMatchObject({
        code: 'invalid_code',
      });
    expect(h.client.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
  });
});

describe('project-scoped account credentials', () => {
  const endpoint = 'https://synthetic-a.supabase.co';
  const prefix = `${ACCOUNT_STORAGE_KEY}.project.v1.${Array.from(endpoint, (character) => character.charCodeAt(0).toString(16).padStart(4, '0')).join('')}.`;
  const legacy = (issuer = `${endpoint}/auth/v1`) =>
    JSON.stringify({
      access_token: `synthetic.${Buffer.from(JSON.stringify({ iss: issuer, sub: parentId })).toString('base64url')}.signature`,
      refresh_token: 'synthetic-legacy-refresh',
    });
  function scoped(records = new Map<string, string>()) {
    const checkedKey = (key: string) => {
      // Match the installed native SecureStore characters and existing web account-only boundary.
      if (!/^[a-zA-Z0-9._-]+$/.test(key) || !key.startsWith(ACCOUNT_STORAGE_KEY))
        throw new Error('Unsupported platform credential key');
      return key;
    };
    const base = {
      getItem: vi.fn(async (key: string) => records.get(checkedKey(key)) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        records.set(checkedKey(key), value);
      }),
      removeItem: vi.fn(async (key: string) => {
        records.delete(checkedKey(key));
      }),
    };
    const project = createProjectAccountStorage(base, endpoint);
    const guarded = new GuardedAccountStorage(project.storage);
    return { records, base, project, guarded };
  }

  it('isolates credentials and recovery markers across backend projects and preserves other local data', async () => {
    const h = scoped(new Map([['legitimate-ambiguous-draft', 'preserve-me']]));
    const other = createProjectAccountStorage(h.base, 'https://synthetic-b.supabase.co');
    await h.guarded.setItem(ACCOUNT_STORAGE_KEY, 'project-a-session');
    await h.guarded.setItem(RECOVERY_STORAGE_KEY, 'project-a-recovery');
    expect(await other.storage.getItem(ACCOUNT_STORAGE_KEY)).toBeNull();
    expect(await other.storage.getItem(RECOVERY_STORAGE_KEY)).toBeNull();
    await other.storage.setItem(ACCOUNT_STORAGE_KEY, 'project-b-session');
    await h.guarded.clearCredentials();
    expect(await other.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('project-b-session');
    expect(h.records.get('legitimate-ambiguous-draft')).toBe('preserve-me');
  });

  it('selects matching legacy tokens but copies them only after trusted identity confirmation', async () => {
    const old = legacy();
    const h = scoped(new Map([[ACCOUNT_STORAGE_KEY, old]]));
    expect(await h.guarded.getItem(ACCOUNT_STORAGE_KEY)).toBe(old);
    expect(h.records.get(`${prefix}${ACCOUNT_STORAGE_KEY}`)).toBeUndefined();
    await h.project.confirmIdentity(h.guarded);
    expect(h.records.get(`${prefix}${ACCOUNT_STORAGE_KEY}`)).toBe(old);
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe(old);
    await h.guarded.clearCredentials();
    expect(await h.guarded.getItem(ACCOUNT_STORAGE_KEY)).toBeNull();
    expect(h.records.get(ACCOUNT_STORAGE_KEY)).toBe(old);
  });

  it('does not use mismatched or malformed legacy sessions and does not delete them', async () => {
    for (const old of [legacy('https://other.supabase.co/auth/v1'), 'not-json', '{}']) {
      const h = scoped(new Map([[ACCOUNT_STORAGE_KEY, old]]));
      expect(await h.guarded.getItem(ACCOUNT_STORAGE_KEY)).toBeNull();
      await h.project.confirmIdentity(h.guarded);
      expect([...h.records.entries()]).toEqual([[ACCOUNT_STORAGE_KEY, old]]);
    }
  });

  it('preserves a matching legacy recovery barrier when credentials are migrated', async () => {
    const old = legacy();
    const recovery = JSON.stringify({
      version: 1,
      state: 'verified',
      email: 'synthetic@example.invalid',
      userId: parentId,
    });
    const h = scoped(
      new Map([
        [ACCOUNT_STORAGE_KEY, old],
        [RECOVERY_STORAGE_KEY, recovery],
      ]),
    );
    expect(await h.guarded.getItem(RECOVERY_STORAGE_KEY)).toBe(recovery);
    expect(await h.guarded.getItem(ACCOUNT_STORAGE_KEY)).toBe(old);
    await h.project.confirmIdentity(h.guarded);
    const restarted = createProjectAccountStorage(h.base, endpoint);
    expect(await restarted.storage.getItem(RECOVERY_STORAGE_KEY)).toBe(recovery);
    expect(await restarted.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe(old);
  });

  it('does not accept an ignored migration write as durable success', async () => {
    const h = scoped(new Map([[ACCOUNT_STORAGE_KEY, legacy()]]));
    await h.guarded.getItem(ACCOUNT_STORAGE_KEY);
    h.base.setItem.mockResolvedValue(undefined);
    await expect(h.project.confirmIdentity(h.guarded)).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    expect(h.records.get(`${prefix}legacy-retired`)).toBeUndefined();
    expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(true);
  });

  it('keeps the legacy recovery barrier when SDK refresh precedes application restoration', async () => {
    const recovery = 'legacy-recovery-barrier';
    const h = scoped(
      new Map([
        [ACCOUNT_STORAGE_KEY, legacy()],
        [RECOVERY_STORAGE_KEY, recovery],
      ]),
    );
    await h.guarded.getItem(ACCOUNT_STORAGE_KEY);
    await h.guarded.setItem(ACCOUNT_STORAGE_KEY, 'sdk-refreshed-session');
    const restarted = createProjectAccountStorage(h.base, endpoint);
    expect(await restarted.storage.getItem(RECOVERY_STORAGE_KEY)).toBe(recovery);
    expect(await restarted.storage.getItem(ACCOUNT_STORAGE_KEY)).toBe('sdk-refreshed-session');
  });
});

it('pairs and restores a Child through the installed SDK with isolated synthetic HTTP transport', async () => {
  const records = new Map<string, string>();
  const url = 'https://synthetic-child.invalid';
  const user = {
    id: childUserId,
    aud: 'authenticated',
    role: 'authenticated',
    is_anonymous: true,
    created_at: '2026-09-14T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    identities: [],
  };
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      iss: `${url}/auth/v1`,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url');
  const accessToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.c3ludGhldGlj`;
  const requests: { path: string; authorization: string | null }[] = [];
  const createService = () => {
    const project = createProjectAccountStorage(
      {
        getItem: async (key) => records.get(key) ?? null,
        setItem: async (key, value) => {
          records.set(key, value);
        },
        removeItem: async (key) => {
          records.delete(key);
        },
      },
      url,
    );
    const storage = new GuardedAccountStorage(project.storage);
    const client = createClient(url, 'sb_publishable_synthetic-test', {
      auth: {
        storage,
        storageKey: ACCOUNT_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        lock: processLock,
      },
      global: {
        async fetch(input, init) {
          const path = new URL(String(input)).pathname;
          requests.push({ path, authorization: new Headers(init?.headers).get('authorization') });
          let data: unknown;
          if (path === '/auth/v1/signup') {
            expect(JSON.parse(String(init?.body))).not.toHaveProperty('email');
            expect(JSON.parse(String(init?.body))).not.toHaveProperty('password');
            data = {
              access_token: accessToken,
              token_type: 'bearer',
              expires_in: 3600,
              refresh_token: 'synthetic-child-refresh',
              user,
            };
          } else if (path === '/auth/v1/user') data = user;
          else if (path === '/rest/v1/rpc/ghaf_redeem_family_invite') {
            expect(JSON.parse(String(init?.body))).toEqual({
              p_token: token,
              p_request_id: requestId,
            });
            data = { snapshot: {}, result: null };
          } else if (path === '/rest/v1/rpc/ghaf_family_identity') data = identity;
          else if (path === '/auth/v1/logout') return new Response(null, { status: 204 });
          else throw new Error(`Unexpected synthetic request ${path}`);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        },
      },
    });
    const service = new SupabaseParentAccountService(async () => ({
      client: client as unknown as AccountClientPort,
      storage,
      confirmIdentity: () => project.confirmIdentity(storage),
    }));
    service.setAppActive(false);
    return service;
  };
  const original = createService();
  try {
    await expect(original.pairChildDevice(token, requestId)).resolves.toEqual(childAccount);
  } finally {
    original.dispose();
  }
  const restored = createService();
  try {
    await expect(restored.restoreSession()).resolves.toEqual(childAccount);
    await expect(restored.getAccess(childUserId)).resolves.toBe('approved');
    expect(requests.filter(({ path }) => path === '/auth/v1/signup')).toHaveLength(1);
    expect(
      requests
        .filter(({ path }) => path.startsWith('/rest/v1/rpc/'))
        .every(({ authorization }) => authorization === `Bearer ${accessToken}`),
    ).toBe(true);
    await restored.signOut();
    expect([...records.values()].some((value) => value.includes('synthetic-child-refresh'))).toBe(
      false,
    );
  } finally {
    restored.dispose();
  }
});
