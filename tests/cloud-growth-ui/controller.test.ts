import { describe, expect, it, vi } from 'vitest';

import {
  createCloudGrowthController,
  growthCommandNeedsPassword,
} from '../../src/features/cloud-growth/controller';
import type {
  CloudGrowthCommand,
  CloudGrowthSnapshot,
  CloudGrowthTransport,
} from '../../src/models/cloudGrowth';

vi.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000099' }));

const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const userId = id(1);
const familyId = id(2);
const childId = id(3);
const zero = { ghaf: 0, samar: 0, sidr: 0, date_palm: 0, mangrove: 0 };
function snapshot(child = false): CloudGrowthSnapshot {
  return {
    schemaVersion: 1,
    actor: { userId, familyId, role: child ? 'child' : 'parent', childId: child ? childId : null },
    familyId,
    revision: 1,
    currentWeekKey: '2026-W38',
    children: [
      {
        childId,
        lifetimeSeeds: 0,
        landscapeSeeds: zero,
        sortingCredits: 0,
        coastCareCredits: 0,
        learningCompleted: [],
        badges: [],
      },
    ],
    rewards: [],
    league: null,
  };
}
const promise: CloudGrowthCommand = {
  type: 'reward.create',
  childId,
  month: '2026-09',
  promise: {
    kind: 'experience',
    label: { ar: 'نشاط تختاره العائلة', en: 'An agreed family activity' },
  },
  milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
};
const money: CloudGrowthCommand = {
  ...promise,
  promise: {
    kind: 'money',
    label: { ar: 'وعد خاص', en: 'A private promise' },
    amountMinor: 1000,
    currency: 'AED',
  },
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
async function flush() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
function transport(
  request = vi.fn<CloudGrowthTransport['familyRequest']>().mockResolvedValue(snapshot()),
): CloudGrowthTransport {
  return {
    familyRequest: request,
    subscribeFamily: async () => () => undefined,
    reauthenticate: vi.fn().mockResolvedValue(undefined),
  };
}

describe('Supabase growth controller client behavior', () => {
  it('does not substitute seeded growth for failed or empty reads', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(snapshot());
    const controller = createCloudGrowthController({
      transport: transport(request),
      userId,
      familyId,
    });
    expect(await controller.load()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      snapshot: null,
      error: 'network_unavailable',
      loading: false,
    });
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().snapshot?.children[0]).toMatchObject({
      lifetimeSeeds: 0,
      badges: [],
    });
    expect(controller.getSnapshot().snapshot?.rewards).toEqual([]);
    expect(controller.getSnapshot().snapshot?.league).toBeNull();
    controller.dispose();
  });

  it('retries the exact uncertain request and blocks intervening mutations', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockResolvedValueOnce(snapshot())
      .mockRejectedValueOnce(new TypeError('lost response'))
      .mockResolvedValueOnce({ snapshot: snapshot() });
    const makeRequestId = vi.fn(() => id(99));
    const controller = createCloudGrowthController({
      transport: transport(request),
      userId,
      familyId,
      makeRequestId,
    });
    await controller.load();
    expect(await controller.command(promise)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({ pendingRequestId: id(99), saved: false });
    expect(await controller.command(money, 'test-only')).toBe(false);
    expect(await controller.retry()).toBe(true);
    expect(request.mock.calls[2]).toEqual(request.mock.calls[1]);
    expect(makeRequestId).toHaveBeenCalledOnce();
    expect(controller.getSnapshot()).toMatchObject({ pendingRequestId: null, saved: true });
    controller.dispose();
  });

  it('requires actual password authentication before protected commands', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce({ snapshot: snapshot() });
    const port = transport(request);
    const controller = createCloudGrowthController({ transport: port, userId, familyId });
    await controller.load();
    expect(await controller.command(money)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      error: 'reauth_required',
      pendingRequestId: null,
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(await controller.command(money, 'test-only-password')).toBe(true);
    expect(port.reauthenticate).toHaveBeenCalledWith('test-only-password');
    const mutation = request.mock.calls[1];
    if (!mutation) throw new Error('Expected one authenticated reward mutation');
    expect(mutation[1]).not.toHaveProperty('password');
    expect(JSON.stringify(controller.getSnapshot())).not.toContain('test-only-password');
    controller.dispose();
  });

  it('does not send a queued command after identity disposal during reauthentication', async () => {
    const auth = deferred<unknown>();
    const port = transport();
    port.reauthenticate = () => auth.promise;
    const controller = createCloudGrowthController({ transport: port, userId, familyId });
    await controller.load();
    const pending = controller.command(money, 'test-only-password');
    controller.dispose();
    auth.resolve(undefined);
    expect(await pending).toBe(false);
    expect(port.familyRequest).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().snapshot).toBeNull();
  });

  it('refuses Child reward and League control mutations before transport', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockResolvedValue(snapshot(true));
    const controller = createCloudGrowthController({
      transport: transport(request),
      userId,
      familyId,
    });
    await controller.load();
    expect(await controller.command(promise)).toBe(false);
    expect(
      await controller.command(
        { type: 'league.rest', childId, expectedRevision: 1, rest: true },
        'ignored',
      ),
    ).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().error).toBe('access_unavailable');
    controller.dispose();
  });

  it('clears revoked private state and removes its subscription', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockResolvedValueOnce(snapshot())
      .mockRejectedValueOnce({ code: '42501', message: 'access_unavailable' });
    const stop = vi.fn();
    const port = transport(request);
    port.subscribeFamily = async () => stop;
    const controller = createCloudGrowthController({ transport: port, userId, familyId });
    await controller.load();
    await flush();
    expect(await controller.refresh()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({ snapshot: null, error: 'access_unavailable' });
    expect(stop).toHaveBeenCalledOnce();
    controller.dispose();
  });

  it('requires a fresh read after a version conflict', async () => {
    const request = vi
      .fn<CloudGrowthTransport['familyRequest']>()
      .mockResolvedValueOnce(snapshot())
      .mockRejectedValueOnce({ code: 'PT409', message: 'request_conflict' })
      .mockResolvedValueOnce(snapshot());
    const controller = createCloudGrowthController({
      transport: transport(request),
      userId,
      familyId,
    });
    await controller.load();
    expect(await controller.command(promise)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({ conflict: true, pendingRequestId: null });
    expect(await controller.command(promise)).toBe(false);
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().conflict).toBe(false);
    controller.dispose();
  });

  it('ignores stale reads and closes subscriptions established after disposal', async () => {
    const read = deferred<unknown>();
    const port = transport(vi.fn().mockReturnValue(read.promise));
    const controller = createCloudGrowthController({ transport: port, userId, familyId });
    const loading = controller.load();
    controller.dispose();
    read.resolve(snapshot());
    expect(await loading).toBe(false);
    expect(controller.getSnapshot().snapshot).toBeNull();
    const subscription = deferred<() => void>();
    const stop = vi.fn();
    const second = createCloudGrowthController({
      transport: { ...transport(), subscribeFamily: () => subscription.promise },
      userId,
      familyId,
    });
    await second.load();
    await flush();
    second.dispose();
    subscription.resolve(stop);
    await flush();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('refreshes after foreground and subscription changes without replaying writes', async () => {
    let changed: () => void = () => undefined;
    const port = transport();
    port.subscribeFamily = async (_familyId, callback) => {
      changed = callback;
      return () => undefined;
    };
    const controller = createCloudGrowthController({ transport: port, userId, familyId });
    await controller.load();
    await flush();
    controller.setActive(false);
    changed();
    expect(port.familyRequest).toHaveBeenCalledTimes(1);
    controller.setActive(true);
    await flush();
    expect(port.familyRequest).toHaveBeenCalledTimes(2);
    controller.dispose();
    changed();
    expect(port.familyRequest).toHaveBeenCalledTimes(2);
  });

  it('requires real reauthentication for each approved sensitive command kind', () => {
    expect(growthCommandNeedsPassword(promise)).toBe(false);
    expect(growthCommandNeedsPassword(money)).toBe(true);
    expect(
      growthCommandNeedsPassword({ type: 'reward.give', planId: id(10), expectedVersion: 1 }),
    ).toBe(true);
    expect(
      growthCommandNeedsPassword({ type: 'league.rest', childId, expectedRevision: 1, rest: true }),
    ).toBe(true);
    expect(
      growthCommandNeedsPassword({
        type: 'league.encourage',
        recipientId: id(10),
        phraseId: 'great_growing',
      }),
    ).toBe(false);
  });
});
