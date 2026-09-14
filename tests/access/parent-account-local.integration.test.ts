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
    const anotherDevice = account();
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
      await expect(first.service.loadProfile()).rejects.toMatchObject({
        code: 'access_unavailable',
      });
      await expect(first.service.loadWorkspace()).rejects.toMatchObject({
        code: 'access_unavailable',
      });
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

      const initialProfile = await first.service.loadProfile();
      expect(initialProfile).toMatchObject({
        userId: firstId,
        displayName: '',
        preferredLocale: 'ar',
        revision: 0,
      });
      expect(await first.service.loadProfile()).toEqual(initialProfile);
      expect(
        sql(`select count(*) from public.account_profiles where user_id = '${firstId}';`),
      ).toBe('1');

      const firstSavedProfile = await first.service.saveProfile({
        displayName: 'Synthetic Parent A',
        preferredLocale: 'en',
        expectedRevision: initialProfile.revision,
      });
      expect(firstSavedProfile).toMatchObject({
        userId: firstId,
        displayName: 'Synthetic Parent A',
        preferredLocale: 'en',
        revision: initialProfile.revision + 1,
      });

      const emptyWorkspace = await first.service.loadWorkspace();
      expect(emptyWorkspace).toMatchObject({
        userId: firstId,
        familyName: '',
        members: [],
        tasks: [],
        studyPlans: [],
        revision: 0,
      });
      checkedId(emptyWorkspace.workspaceId);
      expect(await first.service.loadWorkspace()).toEqual(emptyWorkspace);
      let firstWorkspace = await first.service.updateWorkspace({
        expectedRevision: emptyWorkspace.revision,
        command: { type: 'rename_family', name: 'Synthetic Family A' },
      });
      firstWorkspace = await first.service.updateWorkspace({
        expectedRevision: firstWorkspace.revision,
        command: { type: 'add_member', nickname: 'Synthetic Learner A' },
      });
      expect(firstWorkspace.members).toHaveLength(1);
      const memberId = checkedId(firstWorkspace.members[0]!.id);
      firstWorkspace = await first.service.updateWorkspace({
        expectedRevision: firstWorkspace.revision,
        command: { type: 'add_task', childId: memberId, title: 'Read chapter one' },
      });
      firstWorkspace = await first.service.updateWorkspace({
        expectedRevision: firstWorkspace.revision,
        command: {
          type: 'add_study_plan',
          childId: memberId,
          subject: 'Mathematics',
          nextStep: 'Complete page two',
        },
      });
      expect(firstWorkspace).toMatchObject({
        userId: firstId,
        workspaceId: emptyWorkspace.workspaceId,
        familyName: 'Synthetic Family A',
        members: [{ id: memberId, nickname: 'Synthetic Learner A' }],
        tasks: [{ childId: memberId, title: 'Read chapter one', completed: false }],
        studyPlans: [
          {
            childId: memberId,
            subject: 'Mathematics',
            nextStep: 'Complete page two',
            completed: false,
          },
        ],
        revision: emptyWorkspace.revision + 4,
      });
      const taskId = checkedId(firstWorkspace.tasks[0]!.id);
      const studyPlanId = checkedId(firstWorkspace.studyPlans[0]!.id);

      // This client signs in independently with separate storage; no session is copied.
      expect(anotherDevice.records.size).toBe(0);
      expect(await anotherDevice.service.signIn(firstEmail, password)).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      const firstSession = (await first.client.auth.getSession()).data.session;
      const anotherSession = (await anotherDevice.client.auth.getSession()).data.session;
      expect(
        Boolean(
          firstSession &&
          anotherSession &&
          firstSession.access_token !== anotherSession.access_token &&
          firstSession.refresh_token !== anotherSession.refresh_token,
        ),
      ).toBe(true);
      expect(await anotherDevice.service.loadProfile()).toEqual(firstSavedProfile);
      expect(await anotherDevice.service.loadWorkspace()).toEqual(firstWorkspace);
      expect(
        sql(`select count(*) from public.account_profiles where user_id = '${firstId}';`),
      ).toBe('1');
      expect(
        sql(`select count(*) from public.account_workspaces where user_id = '${firstId}';`),
      ).toBe('1');

      let secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: firstWorkspace.revision,
        command: { type: 'rename_family', name: 'Synthetic Family A Updated' },
      });
      secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: secondWorkspace.revision,
        command: { type: 'rename_member', id: memberId, nickname: 'Synthetic Learner Updated' },
      });
      secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: secondWorkspace.revision,
        command: { type: 'edit_task', id: taskId, title: 'Read chapter two' },
      });
      secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: secondWorkspace.revision,
        command: { type: 'complete_task', id: taskId, completed: true },
      });
      secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: secondWorkspace.revision,
        command: {
          type: 'edit_study_plan',
          id: studyPlanId,
          subject: 'Science',
          nextStep: 'Review the diagram',
        },
      });
      secondWorkspace = await anotherDevice.service.updateWorkspace({
        expectedRevision: secondWorkspace.revision,
        command: { type: 'complete_study_plan', id: studyPlanId, completed: true },
      });
      expect(secondWorkspace).toMatchObject({
        userId: firstId,
        workspaceId: emptyWorkspace.workspaceId,
        familyName: 'Synthetic Family A Updated',
        members: [{ id: memberId, nickname: 'Synthetic Learner Updated' }],
        tasks: [{ id: taskId, childId: memberId, title: 'Read chapter two', completed: true }],
        studyPlans: [
          {
            id: studyPlanId,
            childId: memberId,
            subject: 'Science',
            nextStep: 'Review the diagram',
            completed: true,
          },
        ],
        revision: firstWorkspace.revision + 6,
      });
      await expect(
        first.service.updateWorkspace({
          expectedRevision: firstWorkspace.revision,
          command: { type: 'rename_family', name: 'Stale family draft' },
        }),
      ).rejects.toMatchObject({ code: 'profile_conflict' });
      expect(await first.service.loadWorkspace()).toEqual(secondWorkspace);

      const secondSavedProfile = await anotherDevice.service.saveProfile({
        displayName: 'ولي الأمر التجريبي',
        preferredLocale: 'ar',
        expectedRevision: firstSavedProfile.revision,
      });
      expect(secondSavedProfile).toMatchObject({
        userId: firstId,
        displayName: 'ولي الأمر التجريبي',
        preferredLocale: 'ar',
        revision: firstSavedProfile.revision + 1,
      });
      await expect(
        first.service.saveProfile({
          displayName: 'Stale device draft',
          preferredLocale: 'en',
          expectedRevision: firstSavedProfile.revision,
        }),
      ).rejects.toMatchObject({ code: 'profile_conflict' });
      expect(await first.service.loadProfile()).toEqual(secondSavedProfile);

      await first.service.signOut();
      expect(first.records.size).toBe(0);
      expect(await first.service.restoreSession()).toBeNull();
      await expect(first.service.loadProfile()).rejects.toMatchObject({
        code: 'session_expired',
      });
      await expect(first.service.loadWorkspace()).rejects.toMatchObject({
        code: 'session_expired',
      });
      const anonymousProfileRead = await first.client.from('account_profiles').select('*');
      expect(anonymousProfileRead.error).not.toBeNull();
      const anonymousProfileLoad = await first.client.rpc('get_or_create_account_profile');
      expect(anonymousProfileLoad.error).not.toBeNull();
      const anonymousWorkspaceRead = await first.client.from('account_workspaces').select('*');
      expect(anonymousWorkspaceRead.error).not.toBeNull();
      const anonymousWorkspaceLoad = await first.client.rpc('get_or_create_account_workspace');
      expect(anonymousWorkspaceLoad.error).not.toBeNull();
      // Refresh exercises the second session's revocation state, beyond its current access JWT.
      const secondSessionRefresh = await anotherDevice.client.auth.refreshSession();
      expect(secondSessionRefresh.error).toBeNull();
      expect(Boolean(secondSessionRefresh.data.session)).toBe(true);
      expect(await anotherDevice.service.restoreSession()).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      expect(await anotherDevice.service.loadProfile()).toEqual(secondSavedProfile);
      expect(await anotherDevice.service.loadWorkspace()).toEqual(secondWorkspace);
      expect(await first.service.signIn(firstEmail, password)).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      expect(await first.service.loadProfile()).toEqual(secondSavedProfile);
      expect(await first.service.loadWorkspace()).toEqual(secondWorkspace);

      sql(`update public.pilot_access set status = 'approved' where user_id = '${secondId}';`);
      const otherInitialProfile = await second.service.loadProfile();
      expect(otherInitialProfile).toMatchObject({
        userId: secondId,
        displayName: '',
        preferredLocale: 'ar',
        revision: 0,
      });
      const otherProfile = await second.service.saveProfile({
        displayName: 'Synthetic Parent B',
        preferredLocale: 'en',
        expectedRevision: otherInitialProfile.revision,
      });
      const crossProfileRead = await second.client
        .from('account_profiles')
        .select('*')
        .eq('user_id', firstId);
      expect(crossProfileRead.error).toBeNull();
      expect(crossProfileRead.data).toEqual([]);
      const forgedProfileLoad = await second.client.rpc('get_or_create_account_profile', {
        p_user_id: firstId,
      });
      expect(forgedProfileLoad.error).not.toBeNull();
      const forgedProfileSave = await second.client.rpc('save_account_profile', {
        p_user_id: firstId,
        p_display_name: 'Forged owner',
        p_preferred_locale: 'en',
        p_expected_revision: secondSavedProfile.revision,
      });
      expect(forgedProfileSave.error).not.toBeNull();
      const forbiddenProfileUpdate = await second.client
        .from('account_profiles')
        .update({ display_name: 'Unauthorized change' })
        .eq('user_id', firstId);
      expect(forbiddenProfileUpdate.error).not.toBeNull();
      const forbiddenProfileDelete = await second.client
        .from('account_profiles')
        .delete()
        .eq('user_id', firstId);
      expect(forbiddenProfileDelete.error).not.toBeNull();
      expect(await second.service.loadProfile()).toEqual(otherProfile);
      expect(await anotherDevice.service.loadProfile()).toEqual(secondSavedProfile);

      const otherEmptyWorkspace = await second.service.loadWorkspace();
      expect(otherEmptyWorkspace).toMatchObject({
        userId: secondId,
        familyName: '',
        members: [],
        tasks: [],
        studyPlans: [],
        revision: 0,
      });
      expect(otherEmptyWorkspace.workspaceId).not.toBe(secondWorkspace.workspaceId);
      const otherWorkspace = await second.service.updateWorkspace({
        expectedRevision: otherEmptyWorkspace.revision,
        command: { type: 'rename_family', name: 'Synthetic Family B' },
      });
      const crossWorkspaceRead = await second.client
        .from('account_workspaces')
        .select('*')
        .eq('workspace_id', secondWorkspace.workspaceId);
      expect(crossWorkspaceRead.error).toBeNull();
      expect(crossWorkspaceRead.data).toEqual([]);
      const forgedWorkspaceLoad = await second.client.rpc('get_or_create_account_workspace', {
        p_user_id: firstId,
      });
      expect(forgedWorkspaceLoad.error).not.toBeNull();
      const forgedWorkspaceUpdate = await second.client.rpc('update_account_workspace', {
        p_workspace_id: secondWorkspace.workspaceId,
        p_expected_revision: secondWorkspace.revision,
        p_command: { type: 'rename_family', name: 'Forged workspace' },
      });
      expect(forgedWorkspaceUpdate.error).not.toBeNull();
      for (const command of [
        { type: 'rename_member', id: memberId, nickname: 'Forged member' },
        { type: 'add_task', childId: memberId, title: 'Foreign member task' },
        { type: 'edit_task', id: taskId, title: 'Forged task' },
        { type: 'complete_task', id: taskId, completed: false },
        {
          type: 'add_study_plan',
          childId: memberId,
          subject: 'Foreign subject',
          nextStep: 'Foreign step',
        },
        {
          type: 'edit_study_plan',
          id: studyPlanId,
          subject: 'Forged subject',
          nextStep: 'Forged step',
        },
        { type: 'complete_study_plan', id: studyPlanId, completed: false },
      ]) {
        const foreignReference = await second.client.rpc('update_account_workspace', {
          p_expected_revision: otherWorkspace.revision,
          p_command: command,
        });
        expect(foreignReference.error?.code).toBe('PT400');
        expect(await second.service.loadWorkspace()).toEqual(otherWorkspace);
      }
      const forbiddenWorkspaceUpdate = await second.client
        .from('account_workspaces')
        .update({ family_name: 'Unauthorized family change' })
        .eq('user_id', firstId);
      expect(forbiddenWorkspaceUpdate.error).not.toBeNull();
      const forbiddenWorkspaceDelete = await second.client
        .from('account_workspaces')
        .delete()
        .eq('user_id', firstId);
      expect(forbiddenWorkspaceDelete.error).not.toBeNull();
      expect(await anotherDevice.service.loadWorkspace()).toEqual(secondWorkspace);

      await first.service.signOut();
      expect(await first.service.signIn(secondEmail, password)).toEqual({
        userId: secondId,
        email: secondEmail,
      });
      expect(await first.service.loadProfile()).toEqual(otherProfile);
      expect(await first.service.loadWorkspace()).toEqual(otherWorkspace);
      expect(await first.service.restoreSession()).toEqual({
        userId: secondId,
        email: secondEmail,
      });
      await first.service.signOut();
      expect(await first.service.signIn(firstEmail, password)).toEqual({
        userId: firstId,
        email: firstEmail,
      });
      expect(await first.service.loadProfile()).toEqual(secondSavedProfile);
      expect(await first.service.loadWorkspace()).toEqual(secondWorkspace);

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
      expect(await first.service.loadProfile()).toEqual(secondSavedProfile);
      expect(await first.service.loadWorkspace()).toEqual(secondWorkspace);
      sql(`update public.pilot_access set status = 'suspended' where user_id = '${firstId}';`);
      expect(await first.service.getAccess(firstId)).toBe('suspended');
      await expect(first.service.loadProfile()).rejects.toMatchObject({
        code: 'access_unavailable',
      });
      await expect(first.service.loadWorkspace()).rejects.toMatchObject({
        code: 'access_unavailable',
      });
      sql(`delete from public.pilot_access where user_id = '${firstId}';`);
      await expect(first.service.getAccess(firstId)).rejects.toMatchObject({
        code: 'access_unavailable',
      });
    } finally {
      await Promise.allSettled([
        first.service.signOut(),
        second.service.signOut(),
        anotherDevice.service.signOut(),
      ]);
      first.service.dispose();
      second.service.dispose();
      anotherDevice.service.dispose();
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
