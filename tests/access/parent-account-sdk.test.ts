import { createClient, processLock } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from '../../src/services/accounts/storage';

function sdkHarness() {
  const records = new Map<string, string>();
  const requests: { path: string; method: string; body: unknown; authorization: string | null }[] =
    [];
  const storage = new GuardedAccountStorage({
    async getItem(key) {
      return records.get(key) ?? null;
    },
    async setItem(key, value) {
      records.set(key, value);
    },
    async removeItem(key) {
      records.delete(key);
    },
  });
  const user = {
    id: '00000000-0000-4000-8000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'synthetic-adult@example.test',
    email_confirmed_at: '2026-09-13T00:00:00Z',
    created_at: '2026-09-13T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    identities: [],
  };
  const payload = Buffer.from(
    JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString('base64url');
  const accessToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.c3ludGhldGljLW9ubHk`;
  const client = createClient('https://synthetic.invalid', 'sb_publishable_synthetic-test', {
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
        const url = new URL(String(input));
        const method = init?.method ?? 'GET';
        const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null;
        requests.push({
          path: url.pathname,
          method,
          body,
          authorization: new Headers(init?.headers).get('authorization'),
        });
        let data: unknown;
        if (url.pathname === '/auth/v1/token' || url.pathname === '/auth/v1/verify') {
          data = {
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'synthetic-refresh-only',
            user,
          };
        } else if (url.pathname === '/auth/v1/user') {
          data = user;
        } else if (url.pathname === '/rest/v1/pilot_access') {
          expect(url.searchParams.get('user_id')).toBe(`eq.${user.id}`);
          data = [{ user_id: user.id, status: 'approved' }];
        } else if (url.pathname === '/auth/v1/logout') {
          return new Response(null, { status: 204 });
        } else {
          throw new Error('Unexpected mocked SDK request');
        }
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
  }));
  service.setAppActive(false);
  return { service, records, requests, user, accessToken };
}

describe('account adapter with the installed Supabase SDK and a synthetic transport', () => {
  it('validates identity, selects the own approval row and revokes the persisted session on logout', async () => {
    const h = sdkHarness();
    try {
      const account = await h.service.signIn(h.user.email, 'synthetic-long-password');
      expect(account).toEqual({ userId: h.user.id, email: h.user.email });
      expect(await h.service.getAccess(account.userId)).toBe('approved');
      expect(await h.service.restoreSession()).toEqual(account);
      expect(h.records.has(ACCOUNT_STORAGE_KEY)).toBe(true);
      await h.service.signOut();
      expect(h.records.size).toBe(0);
      expect(h.requests.find((request) => request.path === '/auth/v1/logout')?.authorization).toBe(
        `Bearer ${h.accessToken}`,
      );
      expect(await h.service.restoreSession()).toBeNull();
    } finally {
      h.service.dispose();
    }
  });

  it('uses code verification for recovery, persists the barrier, updates password and requires ordinary login', async () => {
    const h = sdkHarness();
    try {
      await h.service.verifyRecovery(h.user.email, '123456');
      expect(h.requests.find((request) => request.path === '/auth/v1/verify')?.body).toMatchObject({
        email: h.user.email,
        token: '123456',
        type: 'recovery',
      });
      await expect(h.service.restoreSession()).rejects.toMatchObject({ code: 'recovery_required' });
      await h.service.updatePassword('replacement-synthetic-password');
      expect(
        h.requests.find((request) => request.path === '/auth/v1/user' && request.method === 'PUT')
          ?.body,
      ).toMatchObject({ password: 'replacement-synthetic-password' });
      expect(h.records.size).toBe(0);
      expect(await h.service.restoreSession()).toBeNull();
    } finally {
      h.service.dispose();
    }
  });
});
