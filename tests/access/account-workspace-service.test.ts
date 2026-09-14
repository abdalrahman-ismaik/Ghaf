import { describe, expect, it, vi } from 'vitest';

import type { AccountWorkspaceUpdate, WorkspaceCommand } from '../../src/models/accountWorkspace';
import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { GuardedAccountStorage, RECOVERY_STORAGE_KEY } from '../../src/services/accounts/storage';

const owner = '01800000-0000-4000-8000-000000000001';
const otherOwner = '01800000-0000-4000-8000-000000000002';
const workspaceId = '01800000-0000-4000-8000-000000000003';
const memberId = '01800000-0000-4000-8000-000000000004';
const taskId = '01800000-0000-4000-8000-000000000005';
const planId = '01800000-0000-4000-8000-000000000006';
const member = { id: memberId, nickname: 'Synthetic member' };
const task = { id: taskId, childId: memberId, title: 'Synthetic task', completed: false };
const plan = {
  id: planId,
  childId: memberId,
  subject: 'Math',
  nextStep: 'Read one worked example',
  completed: false,
};
const row = {
  user_id: owner,
  workspace_id: workspaceId,
  family_name: 'Synthetic family',
  members: [member],
  tasks: [task],
  study_plans: [plan],
  revision: 4,
  updated_at: '2026-09-14T12:00:00+00:00',
};

function commandResponse(command: WorkspaceCommand) {
  const result = {
    ...row,
    members: [...row.members],
    tasks: [...row.tasks],
    study_plans: [...row.study_plans],
    revision: 5,
  };
  switch (command.type) {
    case 'rename_family':
      result.family_name = command.name;
      break;
    case 'add_member':
      result.members.push({
        id: '01800000-0000-4000-8000-000000000007',
        nickname: command.nickname,
      });
      break;
    case 'rename_member':
      result.members = [{ ...member, nickname: command.nickname }];
      break;
    case 'add_task':
      result.tasks.push({
        id: '01800000-0000-4000-8000-000000000008',
        childId: command.childId,
        title: command.title,
        completed: false,
      });
      break;
    case 'edit_task':
      result.tasks = [{ ...task, title: command.title }];
      break;
    case 'complete_task':
      result.tasks = [{ ...task, completed: command.completed }];
      break;
    case 'add_study_plan':
      result.study_plans.push({
        id: '01800000-0000-4000-8000-000000000009',
        childId: command.childId,
        subject: command.subject,
        nextStep: command.nextStep,
        completed: false,
      });
      break;
    case 'edit_study_plan':
      result.study_plans = [{ ...plan, subject: command.subject, nextStep: command.nextStep }];
      break;
    case 'complete_study_plan':
      result.study_plans = [{ ...plan, completed: command.completed }];
      break;
  }
  return result;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function harness() {
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
  const user = {
    id: owner,
    email: 'synthetic-workspace@example.invalid',
    email_confirmed_at: row.updated_at,
  };
  let listener: (event: string, session?: { user?: typeof user } | null) => void = () => undefined;
  const rpc = vi.fn(async (): Promise<{ data: unknown; error: unknown; status?: number }> => ({
    data: [row],
    error: null,
  }));
  const client = {
    auth: {
      signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { session: {} }, error: null })),
      verifyOtp: vi.fn(async () => ({ data: { session: {} }, error: null })),
      resend: vi.fn(async () => ({ data: {}, error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
      updateUser: vi.fn(async () => ({ data: {}, error: null })),
      getSession: vi.fn(async () => ({ data: { session: {} }, error: null })),
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
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
    })),
    rpc,
  } satisfies AccountClientPort;
  const service = new SupabaseParentAccountService(async () => ({ client, storage }));
  return {
    service,
    client,
    rpc,
    records,
    user,
    emit: (id: string) => listener('SIGNED_IN', { user: { ...user, id } }),
  };
}

describe('real account workspace service boundary', () => {
  it('loads the remotely verified owner and copies only bounded workspace fields', async () => {
    const h = harness();
    const workspace = await h.service.loadWorkspace();
    expect(h.client.auth.getUser).toHaveBeenCalledOnce();
    expect(h.rpc).toHaveBeenCalledWith('get_or_create_account_workspace');
    expect(workspace).toEqual({
      userId: owner,
      workspaceId,
      familyName: row.family_name,
      members: [member],
      tasks: [task],
      studyPlans: [plan],
      revision: 4,
      updatedAt: row.updated_at,
    });
    expect(workspace.members[0]).not.toBe(member);
    expect(h.records.size).toBe(0);
  });

  it('accepts empty first-login data without uploading or inventing local demo records', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: [{ ...row, family_name: '', members: [], tasks: [], study_plans: [], revision: 0 }],
      error: null,
    });
    expect(await h.service.loadWorkspace()).toMatchObject({
      familyName: '',
      members: [],
      tasks: [],
      studyPlans: [],
      revision: 0,
    });
  });

  const validCommands: WorkspaceCommand[] = [
    { type: 'rename_family', name: 'New family' },
    { type: 'add_member', nickname: 'New member' },
    { type: 'rename_member', id: memberId, nickname: 'New nickname' },
    { type: 'add_task', childId: memberId, title: 'New task' },
    { type: 'edit_task', id: taskId, title: 'Edited task' },
    { type: 'complete_task', id: taskId, completed: true },
    {
      type: 'add_study_plan',
      childId: memberId,
      subject: 'Science',
      nextStep: 'Read the introduction',
    },
    { type: 'edit_study_plan', id: planId, subject: 'Math', nextStep: 'Try another example' },
    { type: 'complete_study_plan', id: planId, completed: false },
  ];
  it.each(validCommands.map((command) => ({ command })))(
    'sends one exact revision-checked $command.type command',
    async ({ command }) => {
      const h = harness();
      h.rpc.mockResolvedValueOnce({ data: [commandResponse(command)], error: null });
      expect(await h.service.updateWorkspace({ expectedRevision: 4, command })).toMatchObject({
        revision: 5,
        userId: owner,
      });
      expect(h.rpc).toHaveBeenCalledWith('update_account_workspace', {
        p_expected_revision: 4,
        p_command: command,
      });
      expect(h.records.size).toBe(0);
    },
  );

  it('normalizes text once without altering stable references', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: [
        commandResponse({
          type: 'edit_study_plan',
          id: planId,
          subject: 'Math',
          nextStep: 'Try another example',
        }),
      ],
      error: null,
    });
    await h.service.updateWorkspace({
      expectedRevision: 4,
      command: {
        type: 'edit_study_plan',
        id: planId,
        subject: '  Math  ',
        nextStep: '  Try another example  ',
      },
    });
    expect(h.rpc).toHaveBeenCalledWith('update_account_workspace', {
      p_expected_revision: 4,
      p_command: {
        type: 'edit_study_plan',
        id: planId,
        subject: 'Math',
        nextStep: 'Try another example',
      },
    });
  });

  const malformedRows: unknown[] = [
    null,
    [],
    [row, row],
    [null],
    [{ ...row, user_id: otherOwner }],
    [{ ...row, workspace_id: 'device-based-id' }],
    [{ ...row, secrets: 'unexpected' }],
    [{ ...row, family_name: 'x'.repeat(81) }],
    [{ ...row, revision: -1 }],
    [{ ...row, revision: 0.5 }],
    [{ ...row, revision: Number.MAX_SAFE_INTEGER + 1 }],
    [{ ...row, updated_at: 'invalid' }],
    [{ ...row, members: [member, member] }],
    [{ ...row, members: [{ ...member, id: workspaceId }] }],
    [{ ...row, members: Array.from({ length: 21 }, () => member) }],
    [{ ...row, members: [{ ...member, nickname: '' }] }],
    [{ ...row, members: [{ ...member, accountId: otherOwner }] }],
    [{ ...row, tasks: [{ ...task, childId: otherOwner }] }],
    [{ ...row, tasks: [{ ...task, id: memberId }] }],
    [{ ...row, tasks: [{ ...task, title: '' }] }],
    [{ ...row, tasks: [{ ...task, completed: 'true' }] }],
    [{ ...row, tasks: Array.from({ length: 201 }, () => task) }],
    [{ ...row, study_plans: [{ ...plan, childId: otherOwner }] }],
    [{ ...row, study_plans: [{ ...plan, nextStep: 'x'.repeat(301) }] }],
    [{ ...row, study_plans: [{ ...plan, completed: 1 }] }],
    [{ ...row, study_plans: Array.from({ length: 201 }, () => plan) }],
  ];
  it.each(malformedRows.map((data, index) => ({ data, index })))(
    'rejects malformed or foreign workspace DTO $index',
    async ({ data }) => {
      const h = harness();
      h.rpc.mockResolvedValueOnce({ data, error: null });
      await expect(h.service.loadWorkspace()).rejects.toMatchObject({
        code: 'profile_unavailable',
      });
    },
  );

  const invalidCommands: unknown[] = [
    null,
    {},
    { type: 'delete_workspace' },
    { type: 'rename_family', name: 'Valid', userId: otherOwner },
    { type: 'rename_family', name: '' },
    { type: 'rename_family', name: 'x'.repeat(81) },
    { type: 'add_member', nickname: 123 },
    { type: 'rename_member', id: 'device-id', nickname: 'Valid' },
    { type: 'add_task', childId: memberId, title: 'x'.repeat(161) },
    { type: 'edit_task', id: taskId, title: 'Valid', childId: otherOwner },
    { type: 'complete_task', id: taskId, completed: 1 },
    { type: 'add_study_plan', childId: memberId, subject: 'Math', nextStep: '' },
    { type: 'edit_study_plan', id: planId, subject: 'Math', nextStep: 'x'.repeat(301) },
    { type: 'complete_study_plan', id: planId, completed: 'true' },
  ];
  it.each(invalidCommands.map((command, index) => ({ command, index })))(
    'rejects an invalid or expanded command before transport $index',
    async ({ command }) => {
      const h = harness();
      await expect(
        h.service.updateWorkspace({ expectedRevision: 4, command } as AccountWorkspaceUpdate),
      ).rejects.toMatchObject({ code: 'invalid_profile' });
      expect(h.rpc).not.toHaveBeenCalled();
      expect(h.client.auth.getUser).not.toHaveBeenCalled();
    },
  );

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER])(
    'rejects invalid expected revision %s',
    async (expectedRevision) => {
      const h = harness();
      await expect(
        h.service.updateWorkspace({
          expectedRevision,
          command: { type: 'rename_family', name: 'Name' },
        }),
      ).rejects.toMatchObject({ code: 'invalid_profile' });
      expect(h.rpc).not.toHaveBeenCalled();
    },
  );

  it('requires an actual server revision increment before reporting success', async () => {
    const h = harness();
    await expect(
      h.service.updateWorkspace({
        expectedRevision: 4,
        command: { type: 'rename_family', name: 'Name' },
      }),
    ).rejects.toMatchObject({ code: 'profile_unavailable' });
  });

  it('does not report a command as saved when the returned workspace omits its change', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({ data: [{ ...row, revision: 5 }], error: null });
    await expect(
      h.service.updateWorkspace({
        expectedRevision: 4,
        command: { type: 'rename_family', name: 'Missing update' },
      }),
    ).rejects.toMatchObject({ code: 'profile_unavailable' });
  });

  it('surfaces a conflict without retrying a command or replacing a newer server revision', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'PT409', message: 'profile_conflict' },
    });
    await expect(
      h.service.updateWorkspace({
        expectedRevision: 3,
        command: { type: 'rename_family', name: 'Stale' },
      }),
    ).rejects.toMatchObject({ code: 'profile_conflict' });
    expect(h.rpc).toHaveBeenCalledOnce();
    expect(await h.service.loadWorkspace()).toMatchObject({
      revision: 4,
      familyName: row.family_name,
    });
  });

  it('preserves recoverable credentials when the workspace backend cannot be reached', async () => {
    const h = harness();
    h.rpc.mockResolvedValueOnce({ data: null, error: { code: '' }, status: 0 });
    await expect(h.service.loadWorkspace()).rejects.toMatchObject({ code: 'network_unavailable' });
    expect(h.client.auth.signOut).not.toHaveBeenCalled();
    expect(await h.service.loadWorkspace()).toMatchObject({ userId: owner });
  });

  it('does not expose workspace data during recovery or without a verified identity', async () => {
    const h = harness();
    h.client.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(h.service.loadWorkspace()).rejects.toMatchObject({ code: 'session_expired' });
    h.records.set(RECOVERY_STORAGE_KEY, 'pending');
    await expect(h.service.loadWorkspace()).rejects.toMatchObject({ code: 'recovery_required' });
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it('cancels both a response and queued commands when logout interrupts an update', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const update = {
      expectedRevision: 4,
      command: { type: 'rename_family', name: 'Saved remotely' },
    } as const;
    const first = h.service.updateWorkspace(update);
    const rejected = expect(first).rejects.toMatchObject({ code: 'operation_cancelled' });
    const queued = h.service.updateWorkspace(update);
    const queuedRejected = expect(queued).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    const logout = h.service.signOut();
    expect(await h.service.restoreSession()).toBeNull();
    response.resolve({ data: [{ ...row, revision: 5 }], error: null });
    await rejected;
    await queuedRejected;
    await logout;
    expect(h.rpc).toHaveBeenCalledOnce();
    expect(h.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('cannot return an old account workspace after an SDK account switch', async () => {
    const h = harness();
    await h.service.loadWorkspace();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const request = h.service.loadWorkspace();
    const rejected = expect(request).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    h.emit(otherOwner);
    response.resolve({ data: [row], error: null });
    await rejected;
  });

  it('discards a response after disposal', async () => {
    const h = harness();
    const started = deferred<void>();
    const response = deferred<{ data: unknown; error: unknown }>();
    h.rpc.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const request = h.service.loadWorkspace();
    const rejected = expect(request).rejects.toMatchObject({ code: 'operation_cancelled' });
    await started.promise;
    h.service.dispose();
    response.resolve({ data: [row], error: null });
    await rejected;
  });
});
