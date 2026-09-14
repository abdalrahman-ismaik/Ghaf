import { describe, expect, it, vi } from 'vitest';

import { createWorkspaceController } from '../../src/features/pilot/workspaceController';
import type { AccountWorkspace, AccountWorkspaceUpdate } from '../../src/models/accountWorkspace';
import { ParentAccountError } from '../../src/models/parentAccount';

const saved: AccountWorkspace = {
  userId: 'adult-a',
  workspaceId: 'workspace-a',
  revision: 1,
  updatedAt: '2026-09-14T00:00:00.000Z',
  familyName: 'Prepared family',
  members: [{ id: 'member-a', nickname: 'Prepared member' }],
  tasks: [],
  studyPlans: [],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

function harness(userId = saved.userId) {
  const service = {
    loadWorkspace: vi.fn(async () => saved),
    updateWorkspace: vi.fn(async (update: AccountWorkspaceUpdate) => ({
      ...saved,
      familyName: update.command.type === 'rename_family' ? update.command.name : saved.familyName,
      revision: update.expectedRevision + 1,
    })),
  };
  return { service, controller: createWorkspaceController(service, userId) };
}

describe('account workspace controller', () => {
  it('starts closed and shows actual loading, error and retry results', async () => {
    const h = harness();
    expect(h.controller.getSnapshot()).toMatchObject({ data: null, loading: true, notice: null });
    vi.mocked(h.service.loadWorkspace).mockRejectedValueOnce(
      new ParentAccountError('profile_unavailable'),
    );
    expect(await h.controller.load()).toBe(false);
    expect(h.controller.getSnapshot()).toMatchObject({
      data: null,
      error: 'profile_unavailable',
      loading: false,
      busy: false,
    });
    expect(await h.controller.reload()).toBe(true);
    expect(h.controller.getSnapshot()).toMatchObject({ data: saved, error: null, notice: null });
    expect(h.service.updateWorkspace).not.toHaveBeenCalled();
  });

  it('deduplicates loading and does not submit without a loaded workspace', async () => {
    const h = harness();
    const waiting = deferred<AccountWorkspace>();
    h.service.loadWorkspace.mockReturnValueOnce(waiting.promise);
    const first = h.controller.load();
    expect(await h.controller.load()).toBe(false);
    expect(await h.controller.update({ type: 'rename_family', name: 'Not loaded' })).toBe(false);
    expect(h.service.loadWorkspace).toHaveBeenCalledOnce();
    expect(h.service.updateWorkspace).not.toHaveBeenCalled();
    waiting.resolve(saved);
    await first;
  });

  it('submits one write using the server revision and never reports optimistic success', async () => {
    const h = harness();
    await h.controller.load();
    const waiting = deferred<AccountWorkspace>();
    h.service.updateWorkspace.mockReturnValueOnce(waiting.promise);
    const command = { type: 'rename_family', name: 'Saved change' } as const;
    const first = h.controller.update(command);
    expect(await h.controller.update(command)).toBe(false);
    expect(await h.controller.load()).toBe(false);
    expect(h.service.updateWorkspace).toHaveBeenCalledExactlyOnceWith({
      expectedRevision: 1,
      command,
    });
    expect(h.controller.getSnapshot()).toMatchObject({ data: saved, busy: true, notice: null });
    waiting.resolve({ ...saved, familyName: 'Saved change', revision: 2 });
    expect(await first).toBe(true);
    expect(h.controller.getSnapshot()).toMatchObject({
      data: { familyName: 'Saved change', revision: 2 },
      busy: false,
      notice: 'saved',
    });
  });

  it('keeps a stale editor revision and requires explicit reload after conflict', async () => {
    const h = harness();
    await h.controller.load();
    h.service.loadWorkspace.mockResolvedValue({
      ...saved,
      familyName: 'Other client',
      revision: 2,
    });
    await h.controller.load();
    h.service.updateWorkspace.mockRejectedValueOnce(new ParentAccountError('profile_conflict'));
    const command = { type: 'rename_family', name: 'My draft' } as const;
    expect(await h.controller.update(command, 1)).toBe(false);
    expect(h.service.updateWorkspace).toHaveBeenCalledExactlyOnceWith({
      expectedRevision: 1,
      command,
    });
    expect(h.controller.getSnapshot()).toMatchObject({
      conflict: true,
      error: 'profile_conflict',
      notice: null,
    });
    await h.controller.load();
    expect(h.controller.getSnapshot().conflict).toBe(true);
    expect(await h.controller.update(command)).toBe(false);
    expect(h.service.updateWorkspace).toHaveBeenCalledOnce();
    await h.controller.reload();
    expect(h.controller.getSnapshot()).toMatchObject({ conflict: false, error: null });
    expect(await h.controller.update(command)).toBe(true);
    expect(h.service.updateWorkspace).toHaveBeenLastCalledWith({ expectedRevision: 2, command });
  });

  it('does not queue or automatically replay a failed write after reconnecting', async () => {
    const h = harness();
    await h.controller.load();
    h.service.updateWorkspace.mockRejectedValueOnce(new ParentAccountError('network_unavailable'));
    await h.controller.update({ type: 'add_task', childId: 'member-a', title: 'Prepared task' });
    expect(h.controller.getSnapshot()).toMatchObject({
      data: saved,
      notice: null,
      error: 'network_unavailable',
    });
    await h.controller.load();
    expect(h.service.updateWorkspace).toHaveBeenCalledOnce();
    expect(h.controller.getSnapshot().notice).toBeNull();
  });

  it('withholds cached saved data when a refresh cannot validate its server read', async () => {
    const h = harness();
    await h.controller.load();
    h.service.loadWorkspace.mockRejectedValueOnce(new ParentAccountError('network_unavailable'));
    await h.controller.load();
    expect(h.controller.getSnapshot()).toMatchObject({ data: null, error: 'network_unavailable' });
    await h.controller.reload();
    expect(h.controller.getSnapshot().data).toEqual(saved);
  });

  it.each(['load', 'update'] as const)(
    'rejects another owner returned by %s',
    async (operation) => {
      const h = harness();
      if (operation === 'load')
        h.service.loadWorkspace.mockResolvedValue({ ...saved, userId: 'adult-b' });
      await h.controller.load();
      if (operation === 'update') {
        h.service.updateWorkspace.mockResolvedValue({
          ...saved,
          userId: 'adult-b',
          revision: 2,
          familyName: 'Other owner',
        });
        await h.controller.update({ type: 'rename_family', name: 'Prepared update' });
      }
      expect(h.controller.getSnapshot()).toMatchObject({
        error: 'profile_unavailable',
        notice: null,
      });
      expect(JSON.stringify(h.controller.getSnapshot())).not.toContain('adult-b');
      expect(JSON.stringify(h.controller.getSnapshot())).not.toContain('Other owner');
    },
  );

  it('rejects replacement workspace identity and non-advancing write receipts', async () => {
    const h = harness();
    await h.controller.load();
    h.service.updateWorkspace.mockResolvedValueOnce({
      ...saved,
      workspaceId: 'other-workspace',
      revision: 2,
    });
    expect(await h.controller.update({ type: 'rename_family', name: 'Prepared update' })).toBe(
      false,
    );
    h.service.updateWorkspace.mockResolvedValueOnce(saved);
    expect(await h.controller.update({ type: 'rename_family', name: 'Prepared update' })).toBe(
      false,
    );
    expect(h.controller.getSnapshot()).toMatchObject({
      data: saved,
      notice: null,
      error: 'profile_unavailable',
    });
  });

  it.each(['access_unavailable', 'session_expired', 'storage_unavailable'] as const)(
    'closes saved data on %s during a write',
    async (code) => {
      const h = harness();
      await h.controller.load();
      h.service.updateWorkspace.mockRejectedValueOnce(new ParentAccountError(code));
      await h.controller.update({ type: 'rename_family', name: 'Prepared update' });
      expect(h.controller.getSnapshot()).toMatchObject({ data: null, error: code, notice: null });
    },
  );

  it.each(['load', 'update'] as const)(
    'clears private data and ignores late %s after disposal',
    async (operation) => {
      const h = harness();
      await h.controller.load();
      const waiting = deferred<AccountWorkspace>();
      let pending: Promise<boolean>;
      if (operation === 'load') {
        h.service.loadWorkspace.mockReturnValueOnce(waiting.promise);
        pending = h.controller.load();
      } else {
        h.service.updateWorkspace.mockReturnValueOnce(waiting.promise);
        pending = h.controller.update({ type: 'rename_family', name: 'Pending old owner' });
      }
      h.controller.dispose();
      waiting.resolve({ ...saved, revision: 2 });
      expect(await pending).toBe(false);
      expect(h.controller.getSnapshot()).toMatchObject({
        data: null,
        busy: false,
        loading: false,
        notice: null,
      });
      expect(await h.controller.reload()).toBe(false);
    },
  );

  it('keeps independent controller identities isolated when an old request completes', async () => {
    const a = harness();
    const waiting = deferred<AccountWorkspace>();
    a.service.loadWorkspace.mockReturnValueOnce(waiting.promise);
    const pending = a.controller.load();
    a.controller.dispose();
    const b = harness('adult-b');
    const savedB = {
      ...saved,
      userId: 'adult-b',
      workspaceId: 'workspace-b',
      familyName: 'Prepared B',
    };
    b.service.loadWorkspace.mockResolvedValue(savedB);
    await b.controller.load();
    waiting.resolve(saved);
    await pending;
    expect(a.controller.getSnapshot().data).toBeNull();
    expect(b.controller.getSnapshot().data).toEqual(savedB);
  });
});
