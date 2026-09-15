import { describe, expect, it, vi } from 'vitest';

import { createCloudMasroofiController } from '../../src/features/cloud-masroofi/controller';
import { CloudMasroofiError, type CloudMasroofiSnapshot } from '../../src/models/cloudMasroofi';
import {
  cardSnapshot,
  child,
  childId,
  emptySnapshot,
  familyId,
  fundedSnapshot,
  id,
  requestId,
} from './fixtures';

vi.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000005' }));

const topUp = { type: 'card.top_up' as const, childId, amountFils: 1000 };
const enable = { type: 'card.enable' as const, childId, age10PlusConfirmed: true as const };
const purchase = { type: 'purchase' as const, childId, fixtureId: 'gift' as const };
const tick = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function harness(snapshot = cardSnapshot()) {
  const stop = vi.fn();
  let onChange = () => {};
  const familyRequest = vi.fn().mockResolvedValue(snapshot);
  const reauthenticate = vi.fn().mockResolvedValue(undefined);
  const subscribeFamily = vi.fn().mockImplementation(async (_familyId, callback) => {
    onChange = callback;
    return stop;
  });
  const controller = createCloudMasroofiController({
    userId: snapshot.actor.userId,
    familyId,
    actor: snapshot.actor,
    transport: { familyRequest, reauthenticate, subscribeFamily },
    makeRequestId: () => requestId,
  });
  return {
    controller,
    familyRequest,
    reauthenticate,
    subscribeFamily,
    stop,
    notify: () => onChange(),
  };
}

describe('hosted Masroofi async controller', () => {
  it.each(['constructor', 'toString', '__proto__'])(
    'sanitizes inherited property names from provider errors (%s)',
    async (code) => {
      const { controller, familyRequest } = harness();
      familyRequest.mockRejectedValue({ code, message: 'Private upstream failure details' });
      await controller.load();
      expect(controller.getSnapshot()).toMatchObject({
        error: 'provider_unavailable',
        snapshot: null,
      });
      expect(JSON.stringify(controller.getSnapshot())).not.toContain('Private upstream');
      controller.dispose();
    },
  );

  it('requires fresh password for every Parent mutation and never stores the password', async () => {
    const { controller, familyRequest, reauthenticate } = harness(emptySnapshot());
    await controller.load();
    expect(await controller.command(enable)).toBe(false);
    expect(controller.getSnapshot().error).toBe('reauth_required');
    expect(familyRequest).toHaveBeenCalledTimes(1);
    familyRequest.mockResolvedValue({ snapshot: cardSnapshot() });
    expect(await controller.command(enable, 'one-password')).toBe(true);
    expect(reauthenticate).toHaveBeenLastCalledWith('one-password');
    expect(controller.getSnapshot()).toMatchObject({
      busy: false,
      saved: true,
      pendingRequestId: null,
    });
    expect(JSON.stringify(controller.getSnapshot())).not.toContain('one-password');
    familyRequest.mockResolvedValue({ snapshot: fundedSnapshot() });
    await controller.command(topUp, 'second-password');
    expect(reauthenticate).toHaveBeenCalledTimes(2);
    controller.dispose();
  });

  it('retains the same request UUID after an ambiguous send, including a failed retry password', async () => {
    const { controller, familyRequest, reauthenticate } = harness();
    await controller.load();
    familyRequest.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    expect(await controller.command(topUp, 'password')).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      error: 'network_unavailable',
      pendingRequestId: requestId,
      retryNeedsPassword: true,
      saved: false,
    });
    expect(await controller.command(topUp, 'password')).toBe(false);
    reauthenticate.mockRejectedValueOnce({ code: 'invalid_credentials' });
    expect(await controller.retry('bad-password')).toBe(false);
    expect(controller.getSnapshot().pendingRequestId).toBe(requestId);
    familyRequest.mockResolvedValue({ snapshot: fundedSnapshot() });
    expect(await controller.retry('correct-password')).toBe(true);
    const commands = familyRequest.mock.calls.filter(
      ([name]) => name === 'ghaf_family_masroofi_command',
    );
    expect(commands).toHaveLength(2);
    expect(commands[1]).toEqual(commands[0]);
    controller.dispose();
  });

  it('blocks duplicate clicks while reauthentication or a command is in flight', async () => {
    const { controller, familyRequest, reauthenticate } = harness();
    await controller.load();
    const auth = deferred<void>();
    reauthenticate.mockReturnValueOnce(auth.promise);
    const result = controller.command(topUp, 'password');
    expect(await controller.command(topUp, 'password')).toBe(false);
    expect(await controller.retry('password')).toBe(false);
    familyRequest.mockResolvedValue({ snapshot: fundedSnapshot() });
    auth.resolve();
    expect(await result).toBe(true);
    expect(familyRequest).toHaveBeenCalledTimes(2);
    controller.dispose();
  });

  it('allows only the paired Child purchase without a Parent password', async () => {
    const { controller, familyRequest, reauthenticate } = harness(cardSnapshot(child));
    await controller.load();
    expect(await controller.command(topUp, 'password')).toBe(false);
    expect(await controller.command({ ...purchase, childId: id(99) })).toBe(false);
    familyRequest.mockResolvedValue({ snapshot: cardSnapshot(child) });
    expect(await controller.command(purchase)).toBe(true);
    expect(reauthenticate).not.toHaveBeenCalled();
    controller.dispose();
    const parentHarness = harness();
    await parentHarness.controller.load();
    expect(await parentHarness.controller.command(purchase, 'password')).toBe(false);
    expect(parentHarness.familyRequest).toHaveBeenCalledTimes(1);
    parentHarness.controller.dispose();
  });

  it('erases sensitive snapshots and pending writes after access revocation', async () => {
    const { controller, familyRequest, stop } = harness(fundedSnapshot());
    await controller.load();
    await tick();
    familyRequest.mockRejectedValueOnce(new TypeError('network'));
    await controller.command(topUp, 'password');
    familyRequest.mockRejectedValueOnce(new CloudMasroofiError('access_unavailable'));
    await controller.refresh();
    expect(controller.getSnapshot()).toMatchObject({
      snapshot: null,
      pendingRequestId: null,
      retryNeedsPassword: false,
      error: 'access_unavailable',
      saved: false,
    });
    expect(stop).toHaveBeenCalledOnce();
    controller.dispose();
  });

  it('does not accept late identity-mismatched responses or write after disposal during password verification', async () => {
    const { controller, familyRequest, reauthenticate } = harness();
    await controller.load();
    const auth = deferred<void>();
    reauthenticate.mockReturnValueOnce(auth.promise);
    const result = controller.command(topUp, 'password');
    controller.dispose();
    auth.resolve();
    expect(await result).toBe(false);
    expect(familyRequest).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().snapshot).toBeNull();
    const second = harness();
    await second.controller.load();
    second.familyRequest.mockResolvedValue({ snapshot: cardSnapshot(child) });
    expect(await second.controller.command(topUp, 'password')).toBe(false);
    expect(second.controller.getSnapshot()).toMatchObject({
      error: 'invalid_response',
      snapshot: null,
      pendingRequestId: requestId,
    });
    second.controller.dispose();
  });

  it('clears data while backgrounded, rejects late writes and reloads on foreground before retry', async () => {
    const { controller, familyRequest } = harness();
    await controller.load();
    const response = deferred<{ snapshot: CloudMasroofiSnapshot }>();
    familyRequest.mockReturnValueOnce(response.promise);
    const result = controller.command(topUp, 'password');
    await tick();
    controller.setActive(false);
    expect(controller.getSnapshot()).toMatchObject({
      snapshot: null,
      busy: false,
      pendingRequestId: requestId,
    });
    response.resolve({ snapshot: fundedSnapshot() });
    expect(await result).toBe(false);
    expect(controller.getSnapshot().snapshot).toBeNull();
    familyRequest.mockResolvedValue(fundedSnapshot());
    controller.setActive(true);
    await tick();
    expect(controller.getSnapshot().snapshot?.cards[0]?.balanceFils).toBe(1000);
    expect(controller.getSnapshot().pendingRequestId).toBe(requestId);
    familyRequest.mockResolvedValue({ snapshot: fundedSnapshot() });
    expect(await controller.retry('password')).toBe(true);
    controller.dispose();
  });

  it('refreshes from Realtime and serializes invalidation behind a pending mutation', async () => {
    const { controller, familyRequest, notify } = harness();
    await controller.load();
    await tick();
    const response = deferred<{ snapshot: CloudMasroofiSnapshot }>();
    familyRequest.mockReturnValueOnce(response.promise).mockResolvedValue(fundedSnapshot());
    const result = controller.command(topUp, 'password');
    await tick();
    notify();
    notify();
    expect(familyRequest).toHaveBeenCalledTimes(2);
    response.resolve({ snapshot: fundedSnapshot() });
    expect(await result).toBe(true);
    await tick();
    expect(familyRequest).toHaveBeenCalledTimes(3);
    expect(controller.getSnapshot().snapshot?.cards[0]?.balanceFils).toBe(1000);
    controller.dispose();
  });

  it('allows explicit cancellation only while idle and reloads authoritative state', async () => {
    const { controller, familyRequest } = harness();
    await controller.load();
    familyRequest.mockRejectedValueOnce(new TypeError('network'));
    await controller.command(topUp, 'password');
    familyRequest.mockResolvedValue(fundedSnapshot());
    expect(await controller.cancelPending()).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({ pendingRequestId: null, saved: false });
    expect(controller.getSnapshot().snapshot?.cards[0]?.balanceFils).toBe(1000);
    controller.dispose();
  });

  it('requires refresh after a control conflict and does not hide missing schema behind empty state', async () => {
    const { controller, familyRequest } = harness();
    await controller.load();
    familyRequest.mockRejectedValueOnce(new CloudMasroofiError('request_conflict'));
    await controller.command(topUp, 'password');
    expect(controller.getSnapshot()).toMatchObject({
      conflict: true,
      pendingRequestId: null,
      saved: false,
    });
    expect(await controller.command(topUp, 'password')).toBe(false);
    familyRequest.mockRejectedValueOnce(new CloudMasroofiError('schema_unavailable'));
    await controller.refresh();
    expect(controller.getSnapshot()).toMatchObject({
      error: 'schema_unavailable',
      snapshot: null,
      loading: false,
    });
    controller.dispose();
  });

  it('keeps persisted reads visible with a subscription warning and retries subscriptions on refresh', async () => {
    const { controller, subscribeFamily } = harness();
    subscribeFamily.mockRejectedValueOnce(new Error('subscription unavailable'));
    await controller.load();
    await tick();
    expect(controller.getSnapshot()).toMatchObject({ subscriptionError: true, error: null });
    expect(controller.getSnapshot().snapshot).not.toBeNull();
    await controller.refresh();
    await tick();
    expect(controller.getSnapshot().subscriptionError).toBe(false);
    controller.dispose();
  });

  it('ignores a superseded load after background and never repopulates a disposed view', async () => {
    const { controller, familyRequest } = harness();
    const response = deferred<CloudMasroofiSnapshot>();
    familyRequest.mockReturnValueOnce(response.promise);
    const result = controller.load();
    controller.setActive(false);
    response.resolve(fundedSnapshot());
    expect(await result).toBe(false);
    expect(controller.getSnapshot().snapshot).toBeNull();
    controller.dispose();
    expect(await controller.load()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({ loading: false, busy: false });
  });
});
