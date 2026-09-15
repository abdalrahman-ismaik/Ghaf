import { describe, expect, it, vi } from 'vitest';
import { createCloudFamilyController } from '../../src/features/cloudFamily/controller';
import { CloudFamilyError, type CloudSnapshot } from '../../src/models/cloudFamily';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function snapshot(revision = 0): CloudSnapshot {
  return {
    schema_version: 1,
    revision,
    actor: { user_id: uuid(1), role: 'parent', family_id: uuid(2), child_id: null },
    family: { id: uuid(2), name: '', locale: 'ar', revision, guardian_names: [], relatives: [] },
    children: [],
    categories: [],
    landscapes: [],
    templates: [],
    tasks: [],
    assignments: [],
    submissions: [],
    check_ins: [],
    adjustments: [],
    recognitions: [],
    seed_entries: [],
    landscape_progress: [],
    legacy_records: [],
    legacy_available: false,
    saved_templates: [],
    reveals: [],
    impact_paths: [],
    permissions: [],
    community: { status: 'paused', revision: 0 },
    extras: {
      rewards: [],
      masroofi: { cards: [], promises: [], transactions: [], purchaseCatalog: [] },
      studyPlans: [],
      goals: [],
      learning: { packages: [], progress: [], completions: [], badges: [] },
      league: { circles: [], invitations: [] },
    },
  };
}
const change = {
  type: 'family.update' as const,
  name: 'Our household',
  locale: 'en' as const,
  guardianNames: [],
  relatives: [],
};
function harness() {
  const service = {
    read: vi.fn(async (): Promise<unknown> => snapshot()),
    command: vi.fn(async (): Promise<unknown> => ({ snapshot: snapshot(1), result: {} })),
  };
  const requestId = vi.fn(() => uuid(3));
  return {
    service,
    requestId,
    controller: createCloudFamilyController(
      service,
      { role: 'parent', userId: uuid(1) },
      requestId,
    ),
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('server-authoritative family controller', () => {
  it('retries the exact normalized payload when optional draft fields are undefined', async () => {
    const h = harness();
    await h.controller.load();
    h.service.command.mockRejectedValueOnce(new CloudFamilyError('network_unavailable'));
    await h.controller.command({
      type: 'task.update',
      taskId: uuid(9),
      expectedVersion: 1,
      childId: uuid(8),
      locale: 'en',
      templateId: undefined,
      title: 'A custom task',
    });
    await h.controller.retry();
    expect(h.service.command).toHaveBeenCalledTimes(2);
    expect(h.service.command.mock.calls[1]).toEqual(h.service.command.mock.calls[0]);
    expect(h.controller.getSnapshot().saved).toBe(true);
  });
  it('starts empty, loads persisted records, and changes only after a validated server receipt', async () => {
    const h = harness();
    expect(h.controller.getSnapshot().snapshot).toBeNull();
    await h.controller.load();
    const pending = deferred<unknown>();
    h.service.command.mockReturnValueOnce(pending.promise);
    const saving = h.controller.command(change);
    expect(h.controller.getSnapshot()).toMatchObject({
      saved: false,
      busy: true,
      snapshot: { revision: 0 },
    });
    pending.resolve({ snapshot: snapshot(1), result: {} });
    await saving;
    expect(h.controller.getSnapshot()).toMatchObject({
      saved: true,
      busy: false,
      snapshot: { revision: 1 },
    });
  });
  it('retries an unknown write with its original request and revision even after reloading', async () => {
    const h = harness();
    await h.controller.load();
    h.service.command.mockRejectedValueOnce(new CloudFamilyError('network_unavailable'));
    await h.controller.command(change);
    expect(h.controller.getSnapshot()).toMatchObject({
      uncertain: true,
      saved: false,
      accessible: false,
    });
    h.service.read.mockResolvedValueOnce(snapshot(1));
    await h.controller.load();
    await h.controller.command({ ...change, name: 'Different change' });
    expect(h.service.command).toHaveBeenCalledTimes(1);
    await h.controller.retry();
    expect(h.service.command.mock.calls[1]).toEqual(h.service.command.mock.calls[0]);
    expect(h.requestId).toHaveBeenCalledTimes(1);
    expect(h.controller.getSnapshot()).toMatchObject({ uncertain: false, saved: true });
  });
  it('serializes rapid submissions and prevents stale revisions from overwriting newer state', async () => {
    const h = harness();
    await h.controller.load();
    const pending = deferred<unknown>();
    h.service.command.mockReturnValueOnce(pending.promise);
    const saving = h.controller.command(change);
    await h.controller.command(change);
    expect(h.service.command).toHaveBeenCalledTimes(1);
    pending.resolve({ snapshot: snapshot(2), result: {} });
    await saving;
    h.service.read.mockResolvedValueOnce(snapshot(1));
    await h.controller.load();
    expect(h.controller.getSnapshot()).toMatchObject({
      accessible: false,
      snapshot: { revision: 2 },
      error: 'service_unavailable',
    });
  });
  it('requires refresh after a conflict and uses a new command ID for a known rejected write', async () => {
    const h = harness();
    await h.controller.load();
    h.service.command.mockRejectedValueOnce(new CloudFamilyError('revision_conflict'));
    await h.controller.command(change);
    await h.controller.command(change);
    expect(h.service.command).toHaveBeenCalledTimes(1);
    h.service.read.mockResolvedValueOnce(snapshot(1));
    await h.controller.load();
    h.service.command.mockResolvedValueOnce({ snapshot: snapshot(2), result: {} });
    await h.controller.command(change);
    expect(h.requestId).toHaveBeenCalledTimes(2);
  });
  it('clears private records on identity mismatch and never publishes a forged successful write', async () => {
    const h = harness();
    await h.controller.load();
    const foreign = snapshot(1);
    foreign.actor.user_id = uuid(9);
    h.service.command.mockResolvedValueOnce({ snapshot: foreign, result: {} });
    await h.controller.command(change);
    expect(h.controller.getSnapshot()).toMatchObject({
      snapshot: null,
      saved: false,
      error: 'access_denied',
    });
  });
  it('does not restore data from a read or write that finishes after invalidation', async () => {
    const h = harness();
    const pending = deferred<unknown>();
    h.service.read.mockReturnValueOnce(pending.promise);
    const loading = h.controller.load();
    h.controller.invalidate();
    pending.resolve(snapshot());
    await loading;
    expect(h.controller.getSnapshot().snapshot).toBeNull();
    await h.controller.load();
    const saving = deferred<unknown>();
    h.service.command.mockReturnValueOnce(saving.promise);
    const submitted = h.controller.command(change);
    h.controller.invalidate();
    saving.resolve({ snapshot: snapshot(1), result: {} });
    await submitted;
    expect(h.controller.getSnapshot()).toMatchObject({ snapshot: null, saved: false, busy: false });
  });
  it('preserves drafts through transient read failure but closes access until verified again', async () => {
    const h = harness();
    await h.controller.load();
    const old = h.controller.getSnapshot().snapshot;
    h.service.read.mockRejectedValueOnce(new TypeError('fetch failed'));
    await h.controller.load();
    expect(h.controller.getSnapshot().snapshot).toBe(old);
    await h.controller.command(change);
    expect(h.service.command).not.toHaveBeenCalled();
    await h.controller.load();
    expect(h.controller.getSnapshot().accessible).toBe(true);
  });
  it('drops credentials-independent controller data and listeners on final disposal', async () => {
    const h = harness();
    await h.controller.load();
    const listener = vi.fn();
    h.controller.subscribe(listener);
    h.controller.dispose();
    await h.controller.load();
    await h.controller.command(change);
    expect(h.controller.getSnapshot().snapshot).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    expect(h.service.read).toHaveBeenCalledTimes(1);
  });
});
