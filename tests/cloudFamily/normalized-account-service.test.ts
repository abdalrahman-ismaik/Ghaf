import { describe, expect, it, vi } from 'vitest';

import { createParentCloudService } from '../../src/features/cloudFamily/service';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { GuardedAccountStorage, RECOVERY_STORAGE_KEY } from '../../src/services/accounts/storage';

const parentId = '01900000-0000-4000-8000-000000000001';
const otherId = '01900000-0000-4000-8000-000000000002';
const childId = '01900000-0000-4000-8000-000000000003';
const familyId = '01900000-0000-4000-8000-000000000004';

function harness(child = false) {
  const records = new Map<string, string>();
  const storage = new GuardedAccountStorage({
    getItem: async (key) => records.get(key) ?? null,
    setItem: async (key, value) => {
      records.set(key, value);
    },
    removeItem: async (key) => {
      records.delete(key);
    },
  });
  let user = {
    id: parentId,
    email: 'synthetic-parent@example.invalid',
    email_confirmed_at: '2026-09-15T00:00:00Z',
    is_anonymous: child,
  };
  const headers: [string, string][] = [];
  const result = vi.fn(
    async (_name: string): Promise<{ data: unknown; error: unknown; status?: number }> => ({
      data: { authoritative: 'synthetic-response' },
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
        data: { session: { access_token: 'verified-parent-token' } },
        error: null,
      })),
      getUser: vi.fn(async (_token?: string) => ({ data: { user }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      startAutoRefresh: vi.fn(async () => undefined),
      stopAutoRefresh: vi.fn(async () => undefined),
    },
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
    })),
    rpc: vi.fn((name: string, _args?: Record<string, unknown>) => {
      const pending =
        name === 'ghaf_family_identity'
          ? Promise.resolve({
              data: { userId: parentId, role: 'child', familyId, childId },
              error: null,
            })
          : result(name);
      return Object.assign(pending, {
        setHeader: (key: string, value: string) => {
          headers.push([key, value]);
          return pending;
        },
      });
    }),
  } satisfies AccountClientPort;
  return {
    client,
    headers,
    result,
    records,
    changeUser: () => {
      user = { ...user, id: otherId };
    },
    service: new SupabaseParentAccountService(async () => ({ client, storage })),
  };
}

describe('separate normalized Parent account transport', () => {
  it('pins the verified Parent token and preserves the normalized receipt envelope', async () => {
    const h = harness();
    const receipt = {
      data: null,
      error: { code: 'PT409', message: 'revision_conflict' },
      status: 409,
    };
    h.result.mockResolvedValueOnce(receipt);
    await expect(
      h.service.normalizedFamilyRequest('ghaf_command', { p_expected_revision: 1 }, parentId),
    ).resolves.toBe(receipt);
    expect(h.client.auth.getUser).toHaveBeenNthCalledWith(1, 'verified-parent-token');
    expect(h.headers).toEqual([['Authorization', 'Bearer verified-parent-token']]);
    expect(h.client.rpc).toHaveBeenCalledExactlyOnceWith('ghaf_command', {
      p_expected_revision: 1,
    });
  });

  it.each([otherId, '', 'Salem'])(
    'rejects stale or invalid expected identity %j before the normalized RPC',
    async (expectedUserId) => {
      const h = harness();
      await expect(
        h.service.normalizedFamilyRequest('ghaf_read', undefined, expectedUserId),
      ).rejects.toMatchObject({
        code: expectedUserId === otherId ? 'operation_cancelled' : 'access_unavailable',
      });
      expect(h.client.rpc).not.toHaveBeenCalled();
    },
  );

  it('rejects a hosted Child identity without substituting its profile into the normalized runtime', async () => {
    const h = harness(true);
    await expect(
      h.service.normalizedFamilyRequest('ghaf_read', undefined, parentId),
    ).rejects.toMatchObject({ code: 'access_unavailable' });
    expect(h.result).not.toHaveBeenCalled();
    expect(h.client.rpc.mock.calls.map(([name]) => name)).toEqual(['ghaf_family_identity']);
  });

  it('rejects identity changes that happen during a normalized request', async () => {
    const h = harness();
    h.result.mockImplementationOnce(async () => {
      h.changeUser();
      return { data: { private: 'stale' }, error: null };
    });
    await expect(
      h.service.normalizedFamilyRequest('ghaf_read', undefined, parentId),
    ).rejects.toMatchObject({ code: 'operation_cancelled' });
  });

  it('keeps recovery sessions from reaching either family authority', async () => {
    const h = harness();
    h.records.set(RECOVERY_STORAGE_KEY, 'pending-recovery');
    await expect(
      h.service.normalizedFamilyRequest('ghaf_read', undefined, parentId),
    ).rejects.toMatchObject({ code: 'recovery_required' });
    expect(h.client.rpc).not.toHaveBeenCalled();
  });

  it('does not expand the hosted RPC allowlist to normalized operations', async () => {
    const h = harness();
    await expect(h.service.familyRequest('ghaf_read', undefined, parentId)).rejects.toMatchObject({
      code: 'access_unavailable',
    });
    expect(h.client.rpc).not.toHaveBeenCalled();
    await expect(
      h.service.familyRequest('ghaf_family_snapshot', undefined, parentId),
    ).resolves.toEqual({ authoritative: 'synthetic-response' });
  });

  it('maps detailed normalized conflicts without retrying the hosted authority', async () => {
    const h = harness();
    h.result.mockResolvedValueOnce({
      data: null,
      error: { code: 'PT409', message: 'revision_conflict' },
      status: 409,
    });
    const service = createParentCloudService(h.service, parentId);
    await expect(service.read()).rejects.toMatchObject({ code: 'revision_conflict' });
    expect(h.client.rpc.mock.calls.map(([name]) => name)).toEqual(['ghaf_read']);
  });
});
