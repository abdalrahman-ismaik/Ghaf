import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { createClient, processLock } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from '../../src/services/accounts/storage';

const enabled = process.env.GHAF_LOCAL_ACCOUNT_TEST === '1';

it.runIf(enabled)(
  'verifies the Parent adapter against isolated local Supabase Auth, email codes and RLS',
  async () => {
    const url = process.env.GHAF_LOCAL_SUPABASE_URL ?? 'http://127.0.0.1:54321';
    const publishableKey = process.env.GHAF_LOCAL_SUPABASE_PUBLISHABLE_KEY ?? '';
    if (!['http://127.0.0.1:54321', 'http://localhost:54321'].includes(url)) {
      throw new Error('Local integration test refuses non-loopback or unexpected endpoints.');
    }
    if (!publishableKey.startsWith('sb_publishable_'))
      throw new Error('A local publishable key is required.');
    const mailboxUrl = 'http://127.0.0.1:54324';
    const emails = ['a', 'b'].map(
      (suffix) => `ghaf-pilot-it-${Date.now()}-${randomUUID().slice(0, 8)}-${suffix}@example.test`,
    );
    const seenMessages = new Set<string>();
    const createdIds: string[] = [];
    const password = `Synthetic-${randomUUID()}-initial`;
    const replacementPassword = `Synthetic-${randomUUID()}-replacement`;
    const sql = (statement: string) =>
      execFileSync(
        'docker',
        [
          'exec',
          '-i',
          'supabase_db_ghaf-parent-pilot',
          'psql',
          '-U',
          'postgres',
          '-d',
          'postgres',
          '-v',
          'ON_ERROR_STOP=1',
          '-At',
        ],
        { input: statement, encoding: 'utf8' },
      ).trim();
    const checkedId = (value: string) => {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value))
        throw new Error('Unexpected local fixture ID.');
      return value;
    };
    const rememberCreatedId = (email: string) => {
      if (!/^ghaf-pilot-it-[a-z0-9-]+@example\.test$/.test(email))
        throw new Error('Unexpected fixture address.');
      const id = checkedId(sql(`select id from auth.users where email = '${email}';`));
      createdIds.push(id);
      return id;
    };
    const expectExpiredCode = async (
      userId: string,
      sentAtColumn: 'confirmation_sent_at' | 'recovery_sent_at',
      verify: () => Promise<unknown>,
    ) => {
      const id = checkedId(userId);
      if (!createdIds.includes(id)) throw new Error('Expiry checks require a test-created user.');
      const original = sql(`select ${sentAtColumn}::text from auth.users where id = '${id}';`);
      if (!original) throw new Error('Expected an issued email-code timestamp.');
      sql(`update auth.users set ${sentAtColumn} = now() - interval '2 hours' where id = '${id}';`);
      try {
        expect(
          Number(
            sql(
              `select extract(epoch from (now() - ${sentAtColumn})) from auth.users where id = '${id}';`,
            ),
          ),
        ).toBeGreaterThan(3600);
        await expect(verify()).rejects.toMatchObject({ code: 'invalid_code' });
      } finally {
        sql(
          `update auth.users set ${sentAtColumn} = '${original.replaceAll("'", "''")}'::timestamptz where id = '${id}';`,
        );
      }
    };
    const codeFor = async (email: string) => {
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline) {
        const search = await fetch(
          `${mailboxUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
        );
        if (!search.ok) throw new Error('Local mailbox search is unavailable.');
        const body = (await search.json()) as {
          messages: { ID: string; To: { Address: string }[] }[];
        };
        const message = body.messages.find(
          (item) =>
            !seenMessages.has(item.ID) && item.To.some((recipient) => recipient.Address === email),
        );
        if (message) {
          const response = await fetch(
            `${mailboxUrl}/api/v1/message/${encodeURIComponent(message.ID)}`,
          );
          if (!response.ok) throw new Error('Local mailbox message is unavailable.');
          const content = (await response.json()) as { Text: string; HTML: string };
          const code = `${content.Text}\n${content.HTML}`.match(/\b\d{6}\b/)?.[0];
          if (!code) throw new Error('Expected a six-digit code in the scoped local email.');
          seenMessages.add(message.ID);
          return code;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('No code arrived for the exact local fixture recipient.');
    };
    const account = () => {
      const records = new Map<string, string>();
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
      const client = createClient(url, publishableKey, {
        auth: {
          storage,
          storageKey: ACCOUNT_STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          lock: processLock,
        },
      });
      const service = new SupabaseParentAccountService(async () => ({
        client: client as unknown as AccountClientPort,
        storage,
      }));
      service.setAppActive(false);
      return { client, service, records };
    };
    const first = account();
    const second = account();
    try {
      const firstEmail = emails[0]!;
      const secondEmail = emails[1]!;
      await first.service.signUp(firstEmail, password);
      const firstId = rememberCreatedId(firstEmail);
      expect(sql(`select status from public.pilot_access where user_id = '${firstId}';`)).toBe(
        'pending',
      );
      const signupCode = await codeFor(firstEmail);
      const wrongCode = `${signupCode[0] === '0' ? '1' : '0'}${signupCode.slice(1)}`;
      await expect(first.service.verifyEmail(firstEmail, wrongCode)).rejects.toMatchObject({
        code: 'invalid_code',
      });
      await expectExpiredCode(firstId, 'confirmation_sent_at', () =>
        first.service.verifyEmail(firstEmail, signupCode),
      );
      expect(await first.service.verifyEmail(firstEmail, signupCode)).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      await expect(first.service.verifyEmail(firstEmail, signupCode)).rejects.toMatchObject({
        code: 'invalid_code',
      });
      expect(await first.service.getAccess(firstId)).toBe('pending');
      sql(`update public.pilot_access set status = 'approved' where user_id = '${firstId}';`);
      expect(await first.service.getAccess(firstId)).toBe('approved');

      await second.service.signUp(secondEmail, password);
      const secondId = rememberCreatedId(secondEmail);
      await second.service.verifyEmail(secondEmail, await codeFor(secondEmail));
      expect(await second.service.getAccess(secondId)).toBe('pending');
      const crossRead = await second.client
        .from('pilot_access')
        .select('status')
        .eq('user_id', firstId);
      expect(crossRead.error).toBeNull();
      expect(crossRead.data).toEqual([]);
      const forbiddenApproval = await second.client
        .from('pilot_access')
        .update({ status: 'approved' })
        .eq('user_id', secondId);
      expect(forbiddenApproval.error).not.toBeNull();
      expect(await second.service.getAccess(secondId)).toBe('pending');

      await first.service.signOut();
      expect(first.records.size).toBe(0);
      await first.service.requestPasswordReset(firstEmail);
      const recoveryCode = await codeFor(firstEmail);
      await expectExpiredCode(firstId, 'recovery_sent_at', () =>
        first.service.verifyRecovery(firstEmail, recoveryCode),
      );
      await first.service.verifyRecovery(firstEmail, recoveryCode);
      await expect(first.service.restoreSession()).rejects.toMatchObject({
        code: 'recovery_required',
      });
      await first.service.updatePassword(replacementPassword);
      expect(first.records.size).toBe(0);
      expect(await first.service.restoreSession()).toBeNull();
      await expect(first.service.signIn(firstEmail, password)).rejects.toMatchObject({
        code: 'invalid_credentials',
      });
      expect(await first.service.signIn(firstEmail, replacementPassword)).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      expect(await first.service.restoreSession()).toEqual({ userId: firstId, email: firstEmail });
      sql(`update public.pilot_access set status = 'suspended' where user_id = '${firstId}';`);
      expect(await first.service.getAccess(firstId)).toBe('suspended');
      sql(`delete from public.pilot_access where user_id = '${firstId}';`);
      await expect(first.service.getAccess(firstId)).rejects.toMatchObject({
        code: 'access_unavailable',
      });
    } finally {
      await Promise.allSettled([first.service.signOut(), second.service.signOut()]);
      first.service.dispose();
      second.service.dispose();
      for (const id of createdIds) {
        sql(
          `delete from auth.users where id = '${checkedId(id)}' and email like 'ghaf-pilot-it-%@example.test';`,
        );
      }
      if (seenMessages.size) {
        await fetch(`${mailboxUrl}/api/v1/messages`, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ IDs: [...seenMessages] }),
        });
      }
    }
  },
  60_000,
);
