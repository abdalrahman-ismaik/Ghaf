import { describe, expect, it } from 'vitest';

import type { PrototypeSession } from '../src/models/familyGrowth';
import {
  createFamilyExperienceController,
  type FamilyExperiencePresentation,
} from '../src/features/family/familyExperienceController';
import { createResetSourceSession } from '../src/services/mock/fixtures';

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly message: string };
}): T {
  expect(result.ok, result.error?.message).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function recognizedSession(): PrototypeSession {
  return createResetSourceSession('recognized');
}

function expectPaired(presentation: FamilyExperiencePresentation) {
  expect(presentation.access.children).toEqual([
    { childId: 'child_salem', pairingStatus: 'paired' },
    { childId: 'child_alya', pairingStatus: 'paired' },
  ]);
}

describe('family experience access presentation', () => {
  it('starts with two paired Child fixtures and authorizes every entry through stored services', () => {
    const controller = createFamilyExperienceController();
    const initial = controller.getPresentation();

    expect(initial.activeEntry).toBeNull();
    expectPaired(initial);
    expect(expectOk(controller.enterParent()).activeEntry).toEqual({
      role: 'parent',
      origin: 'synthetic',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(expectOk(controller.enterChild('child_salem')).activeEntry).toEqual({
      role: 'child',
      childId: 'child_salem',
      origin: 'synthetic',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(expectOk(controller.enterChild('child_alya')).activeEntry).toEqual({
      role: 'child',
      childId: 'child_alya',
      origin: 'synthetic',
      capabilityTruth: 'local_prototype_not_authentication',
    });
  });

  it('allows only the active Parent to revoke and restore one Child independently', () => {
    const controller = createFamilyExperienceController();

    expectOk(controller.enterChild('child_salem'));
    expect(controller.revokeChild('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'NOT_AUTHORIZED' },
    });

    expectOk(controller.enterParent());
    const revoked = expectOk(controller.revokeChild('child_salem'));
    expect(revoked.access.children).toEqual([
      { childId: 'child_salem', pairingStatus: 'revoked' },
      { childId: 'child_alya', pairingStatus: 'paired' },
    ]);
    expect(controller.enterChild('child_salem')).toMatchObject({ ok: false });
    expect(expectOk(controller.enterChild('child_alya')).activeEntry).toMatchObject({
      role: 'child',
      childId: 'child_alya',
    });

    expectOk(controller.enterParent());
    expectPaired(expectOk(controller.restoreChild('child_salem')));
    expect(expectOk(controller.enterChild('child_salem')).activeEntry).toMatchObject({
      role: 'child',
      childId: 'child_salem',
    });
  });

  it('never exposes fixture credentials, session identifiers, devices, or the service registry', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    const publicJson = JSON.stringify(controller.getPresentation());

    for (const forbidden of [
      'parent_access_al_noor_v1',
      'child_access_salem_v1',
      'child_access_alya_v1',
      'synthetic-code-',
      'session_',
      'device_',
      'services',
      'registry',
    ]) {
      expect(publicJson).not.toContain(forbidden);
    }
    expect(Object.keys(controller)).toEqual([]);
  });
});

describe('private Family Reward presentation', () => {
  it('unlocks the prepared non-monetary Salem promise when created before recognition', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    const promised = expectOk(controller.createPreparedReward());
    expect(promised.reward).toMatchObject({
      childId: 'child_salem',
      lifecycle: 'promised',
      privacy: 'child_guardians_only',
      promise: { kind: 'experience' },
      milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
    });

    const synced = expectOk(controller.syncRecognizedJourney(recognizedSession()));
    expect(synced.reward).toMatchObject({ lifecycle: 'unlocked' });
    expect(expectOk(controller.syncRecognizedJourney(recognizedSession())).reward).toMatchObject({
      lifecycle: 'unlocked',
    });
  });

  it('unlocks from a previously verified receipt when the prepared promise is created afterward', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    expect(expectOk(controller.syncRecognizedJourney(recognizedSession())).reward).toBeNull();
    expect(expectOk(controller.createPreparedReward()).reward).toMatchObject({
      lifecycle: 'unlocked',
    });
  });

  it('keeps the promise private to Parent and Salem and allows only Parent to mark it given', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    expectOk(controller.createPreparedReward());
    expectOk(controller.syncRecognizedJourney(recognizedSession()));

    expect(expectOk(controller.enterChild('child_alya')).reward).toBeNull();
    expect(controller.markPreparedRewardGiven()).toMatchObject({
      ok: false,
      error: { code: 'NOT_AUTHORIZED' },
    });
    expect(expectOk(controller.enterChild('child_salem')).reward).toMatchObject({
      childId: 'child_salem',
      lifecycle: 'unlocked',
    });
    expectOk(controller.enterParent());
    expect(expectOk(controller.markPreparedRewardGiven()).reward).toMatchObject({
      lifecycle: 'given',
    });
  });
});

describe('synthetic Family League presentation', () => {
  it('creates a fixed fifteen-Leaf week and credits only the matching authoritative receipt', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    const started = expectOk(controller.startPreparedLeague());

    expect(started.league).toMatchObject({
      weekKey: '2026-W36',
      cooperativeConfirmedCount: 0,
      cooperativeGoal: 15,
      assignedLeafCount: 15,
      origin: 'synthetic_local',
    });
    expect(started.league?.participants).toHaveLength(3);
    for (const participant of started.league?.participants ?? []) {
      expect(Object.keys(participant).sort()).toEqual([
        'completedLeafCount',
        'nickname',
        'position',
        'score',
        'treeAvatarToken',
      ]);
    }

    const synced = expectOk(controller.syncRecognizedJourney(recognizedSession()));
    expect(synced.league).toMatchObject({
      cooperativeConfirmedCount: 1,
      assignedLeafCount: 15,
      participants: expect.arrayContaining([
        expect.objectContaining({
          nickname: expect.objectContaining({ en: 'Salem' }),
          completedLeafCount: 1,
          score: 20,
        }),
      ]),
    });
    expect(expectOk(controller.syncRecognizedJourney(recognizedSession())).league).toMatchObject({
      cooperativeConfirmedCount: 1,
    });
  });

  it('rejects forged or incomplete snapshots without Reward unlock or League credit', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    expectOk(controller.createPreparedReward());
    expectOk(controller.startPreparedLeague());
    const valid = recognizedSession();
    const missingReceipt = { ...valid, recognitionLedger: {} };
    const mismatchedReceipt = {
      ...valid,
      recognitionLedger: Object.fromEntries(
        Object.entries(valid.recognitionLedger).map(([key, receipt]) => [
          key,
          {
            ...receipt,
            seedTransaction: receipt.seedTransaction
              ? { ...receipt.seedTransaction, amount: 8 }
              : null,
          },
        ]),
      ),
    } as PrototypeSession;

    expect(controller.syncRecognizedJourney(missingReceipt)).toMatchObject({ ok: false });
    expect(controller.syncRecognizedJourney(mismatchedReceipt)).toMatchObject({ ok: false });
    expect(controller.getPresentation()).toMatchObject({
      reward: { lifecycle: 'promised' },
      league: { cooperativeConfirmedCount: 0 },
    });
  });

  it('sends only a prepared encouragement from the active Child projection', () => {
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    expectOk(controller.startPreparedLeague());
    expectOk(controller.enterChild('child_salem'));

    expect(
      expectOk(controller.sendPreparedEncouragement('child_alya', 'one_leaf_together')).league,
    ).toMatchObject({ preparedEncouragementCount: 1 });
    expect(
      controller.sendPreparedEncouragement('child_alya', 'write_anything' as 'one_leaf_together'),
    ).toMatchObject({ ok: false });
    expectOk(controller.enterParent());
    expect(controller.sendPreparedEncouragement('child_alya', 'great_growing')).toMatchObject({
      ok: false,
      error: { code: 'NOT_AUTHORIZED' },
    });
  });
});

describe('family experience isolation and reset', () => {
  it('does not mutate P0 Seeds, Garden, canopy, Circle, celebration, or the supplied session', () => {
    const controller = createFamilyExperienceController();
    const session = recognizedSession();
    const before = JSON.stringify(session);
    const p0Before = {
      seeds: session.children.child_salem.earnedSeeds,
      garden: session.landscapeProgress,
      canopy: session.household.combinedCanopy,
      circle: session.circleGoal,
      celebration: session.celebration,
    };

    expectOk(controller.enterParent());
    expectOk(controller.createPreparedReward());
    expectOk(controller.startPreparedLeague());
    expectOk(controller.syncRecognizedJourney(session));

    expect(JSON.stringify(session)).toBe(before);
    expect({
      seeds: session.children.child_salem.earnedSeeds,
      garden: session.landscapeProgress,
      canopy: session.household.combinedCanopy,
      circle: session.circleGoal,
      celebration: session.celebration,
    }).toEqual(p0Before);
  });

  it('restores the exact initial access, Reward, and League presentation from every state', () => {
    const fresh = createFamilyExperienceController().getPresentation();
    const controller = createFamilyExperienceController();
    expectOk(controller.enterParent());
    expectOk(controller.revokeChild('child_alya'));
    expectOk(controller.createPreparedReward());
    expectOk(controller.startPreparedLeague());
    expectOk(controller.syncRecognizedJourney(recognizedSession()));

    expect(controller.reset()).toEqual(fresh);
    expect(controller.getPresentation()).toEqual(fresh);
    expectOk(controller.enterChild('child_alya'));
  });
});
