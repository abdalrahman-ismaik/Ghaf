import { describe, expect, it, vi } from 'vitest';

import { createCloudFamilyController } from '../../src/features/cloud-family/controller';
import { selectCloudFamilyProgress } from '../../src/features/cloud-family/progress';
import type { CloudFamilyTransport } from '../../src/models/cloudFamily';
import {
  childId,
  cloudId,
  cloudSnapshot,
  emptyCloudSnapshot,
  familyId,
  taskId,
  userId,
} from './fixtures';

vi.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000777' }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('account-bound cloud family controller', () => {
  it('starts one polling timer only after a successful load and pauses reads while inactive', async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockResolvedValue(cloudSnapshot());
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: async () => () => undefined },
      userId,
    });
    try {
      expect(vi.getTimerCount()).toBe(0);
      expect(request).not.toHaveBeenCalled();
      await controller.load();
      await flush();
      expect(vi.getTimerCount()).toBe(1);
      await controller.refresh();
      expect(vi.getTimerCount()).toBe(1);
      controller.setActive(false);
      const beforePause = request.mock.calls.length;
      await vi.advanceTimersByTimeAsync(60_000);
      expect(request).toHaveBeenCalledTimes(beforePause);
      controller.setActive(true);
      await flush();
      const resumed = request.mock.calls.length;
      await vi.advanceTimersByTimeAsync(60_000);
      expect(request).toHaveBeenCalledTimes(resumed + 1);
      controller.dispose();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      controller.dispose();
      vi.useRealTimers();
    }
  });

  it('distinguishes empty success from provider failure and never injects fixtures', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(emptyCloudSnapshot());
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: vi.fn() },
      userId,
    });
    expect(await controller.load()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      status: 'error',
      snapshot: null,
      error: 'network_unavailable',
    });
    expect(await controller.retry()).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      status: 'empty',
      snapshot: { family: null, children: [], tasks: [] },
      error: null,
    });
    controller.dispose();
  });

  it('retains the exact request UUID and command after uncertain committed recognition', async () => {
    let committed = false;
    let writes = 0;
    const request = vi.fn<CloudFamilyTransport['familyRequest']>(async (name) => {
      if (name === 'ghaf_family_snapshot') return cloudSnapshot(committed);
      if (!committed) {
        committed = true;
        writes += 1;
        throw new TypeError('lost response');
      }
      return { snapshot: cloudSnapshot(true), result: null };
    });
    const makeRequestId = vi.fn(() => cloudId(70));
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: async () => () => undefined },
      userId,
      makeRequestId,
    });
    expect(await controller.load()).toBe(true);
    expect(await controller.command({ type: 'recognize_task', taskId, expectedRevision: 4 })).toBe(
      false,
    );
    expect(
      selectCloudFamilyProgress(controller.getSnapshot().snapshot!).children[childId]?.seeds,
    ).toBe(0);
    expect(controller.getSnapshot()).toMatchObject({
      pendingRequestId: cloudId(70),
      pendingCommand: 'recognize_task',
      busy: false,
    });
    expect(await controller.command({ type: 'rename_family', name: 'Must wait' })).toBe(false);
    expect(await controller.retry()).toBe(true);
    const mutations = request.mock.calls.filter(([name]) => name === 'ghaf_family_command');
    expect(mutations).toHaveLength(2);
    expect(mutations[1]).toEqual(mutations[0]);
    expect(makeRequestId).toHaveBeenCalledTimes(1);
    expect(writes).toBe(1);
    expect(
      selectCloudFamilyProgress(controller.getSnapshot().snapshot!).children[childId]?.seeds,
    ).toBe(8);
    expect(controller.getSnapshot().pendingRequestId).toBeNull();
    controller.dispose();
  });

  it('serializes mutations, reports revision conflicts and requires fresh read before another command', async () => {
    const pending = deferred<unknown>();
    const request = vi
      .fn<CloudFamilyTransport['familyRequest']>()
      .mockResolvedValueOnce(cloudSnapshot())
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(cloudSnapshot(true));
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: async () => () => undefined },
      userId,
    });
    await controller.load();
    const first = controller.command({ type: 'recognize_task', taskId, expectedRevision: 4 });
    expect(await controller.command({ type: 'rename_family', name: 'Blocked' })).toBe(false);
    pending.reject({ code: 'PT409', message: 'request_conflict' });
    expect(await first).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      conflict: true,
      pendingRequestId: null,
      error: 'request_conflict',
    });
    expect(await controller.command({ type: 'rename_family', name: 'Still blocked' })).toBe(false);
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().conflict).toBe(false);
    controller.dispose();
  });

  it('clears private state after revocation and never treats denied reads as empty families', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(cloudSnapshot())
      .mockRejectedValueOnce({ code: '42501', message: 'access_unavailable' });
    const stop = vi.fn();
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: async () => stop },
      userId,
    });
    await controller.load();
    await flush();
    expect(await controller.refresh()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      status: 'error',
      snapshot: null,
      error: 'access_unavailable',
    });
    expect(stop).toHaveBeenCalledOnce();
    controller.dispose();
  });

  it('ignores late reads and cleans up a subscription that resolves after disposal', async () => {
    const read = deferred<unknown>();
    const request = vi.fn().mockReturnValueOnce(read.promise);
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: vi.fn() },
      userId,
    });
    const loading = controller.load();
    controller.dispose();
    read.resolve(cloudSnapshot());
    expect(await loading).toBe(false);
    expect(controller.getSnapshot().snapshot).toBeNull();

    const subscription = deferred<() => void>();
    const stop = vi.fn();
    const second = createCloudFamilyController({
      service: {
        familyRequest: vi.fn().mockResolvedValue(cloudSnapshot()),
        subscribeFamily: () => subscription.promise,
      },
      userId,
    });
    await second.load();
    await flush();
    second.dispose();
    subscription.resolve(stop);
    await flush();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('refreshes on realtime and foreground, ignoring callbacks from a disposed identity', async () => {
    let changed: () => void = () => undefined;
    const request = vi.fn().mockResolvedValue(cloudSnapshot());
    const controller = createCloudFamilyController({
      service: {
        familyRequest: request,
        subscribeFamily: async (_id, callback) => {
          changed = callback;
          return () => undefined;
        },
      },
      userId,
    });
    await controller.load();
    await flush();
    changed();
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
    controller.setActive(false);
    changed();
    expect(request).toHaveBeenCalledTimes(2);
    controller.setActive(true);
    await flush();
    expect(request).toHaveBeenCalledTimes(3);
    controller.dispose();
    changed();
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('rejects a cross-account response and refuses Parent commands in a paired Child view', async () => {
    const other = createCloudFamilyController({
      service: {
        familyRequest: vi.fn().mockResolvedValue(cloudSnapshot()),
        subscribeFamily: vi.fn(),
      },
      userId: cloudId(999),
    });
    expect(await other.load()).toBe(false);
    expect(other.getSnapshot()).toMatchObject({ snapshot: null, error: 'invalid_response' });
    other.dispose();
    const source = cloudSnapshot();
    const paired = { ...source, actor: { userId, role: 'child', familyId, childId }, members: [] };
    const request = vi.fn().mockResolvedValue(paired);
    const controller = createCloudFamilyController({
      service: { familyRequest: request, subscribeFamily: async () => () => undefined },
      userId,
    });
    await controller.load();
    expect(await controller.command({ type: 'recognize_task', taskId, expectedRevision: 4 })).toBe(
      false,
    );
    expect(request).toHaveBeenCalledOnce();
    controller.dispose();
  });
});
