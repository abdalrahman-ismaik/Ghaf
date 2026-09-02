import { beforeEach, describe, expect, it } from 'vitest';

import { createSubmittedP0Session, PREPARED_PRAISE } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly message: string };
}): T {
  expect(result.ok, result.error?.message).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected store command to succeed');
  return result.data;
}

function recognizePreparedSubmission() {
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(
    usePrototypeStore.getState().markPraisePresented({
      actionId: 'family-experience-praise',
      source: 'parent_press',
      presentedAt: '2026-08-26T09:40:00.000Z',
    }),
  );
  return usePrototypeStore.getState().applyRecognition({
    actionId: 'family-experience-recognition',
    source: 'parent_press',
    observedRenderState: 'praise_presented',
    presentationActionId: 'family-experience-praise',
  });
}

describe('family experience store boundary', () => {
  beforeEach(() => {
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
  });

  it('keeps the public projection credential-free and changes legacy role only after entry succeeds', () => {
    expect(usePrototypeStore.getState().familyExperience).toMatchObject({
      activeEntry: null,
      access: {
        children: [
          { childId: 'child_salem', pairingStatus: 'paired' },
          { childId: 'child_alya', pairingStatus: 'paired' },
        ],
      },
      reward: null,
      league: null,
    });

    expectOk(usePrototypeStore.getState().enterParentExperience());
    expectOk(usePrototypeStore.getState().setSyntheticChildAccess('child_salem', false));
    expectOk(usePrototypeStore.getState().enterChildExperience('child_alya'));
    expect(usePrototypeStore.getState()).toMatchObject({
      role: 'child',
      activeChildId: 'child_alya',
    });
    const beforeRejectedEntry = {
      role: usePrototypeStore.getState().role,
      activeChildId: usePrototypeStore.getState().activeChildId,
    };

    expect(usePrototypeStore.getState().enterChildExperience('child_salem')).toMatchObject({
      ok: false,
    });
    expect(usePrototypeStore.getState()).toMatchObject(beforeRejectedEntry);
    expectOk(usePrototypeStore.getState().enterParentExperience());
    expectOk(usePrototypeStore.getState().setSyntheticChildAccess('child_salem', true));
    expect(JSON.stringify(usePrototypeStore.getState().familyExperience)).not.toMatch(
      /credential|session_|device_|synthetic-code-|registry|services/,
    );
  });

  it('projects private Reward and cooperative League without changing P0 counters', () => {
    expectOk(usePrototypeStore.getState().enterParentExperience());
    expectOk(usePrototypeStore.getState().createPreparedFamilyReward());
    expectOk(usePrototypeStore.getState().startPreparedFamilyLeague());
    usePrototypeStore.setState(createSubmittedP0Session());

    const before = usePrototypeStore.getState();
    const recognition = expectOk(recognizePreparedSubmission());
    const after = usePrototypeStore.getState();

    expect('familyExperience' in recognition.session).toBe(false);

    expect(after.familyExperience).toMatchObject({
      reward: { childId: 'child_salem', lifecycle: 'unlocked' },
      league: { cooperativeConfirmedCount: 1, cooperativeGoal: 15 },
    });
    expect({
      salemSeeds: after.children.child_salem.earnedSeeds,
      mangroveSeeds: after.landscapeProgress.mangrove.cumulativeSeeds,
      canopyLeaves: after.household.combinedCanopy.contributionLeaves,
      circleActions: after.circleGoal.eligibleGreenActions,
    }).toEqual({
      salemSeeds: before.children.child_salem.earnedSeeds + 12,
      mangroveSeeds: before.landscapeProgress.mangrove.cumulativeSeeds + 12,
      canopyLeaves: before.household.combinedCanopy.contributionLeaves + 1,
      circleActions: before.circleGoal.eligibleGreenActions + 1,
    });
    expect(
      expectOk(usePrototypeStore.getState().markPreparedFamilyRewardGiven()).reward,
    ).toMatchObject({ lifecycle: 'given' });
  });

  it('uses an already verified receipt when Reward and League are started later', () => {
    usePrototypeStore.setState(createSubmittedP0Session());
    expectOk(recognizePreparedSubmission());
    expect(usePrototypeStore.getState().familyExperience.activeEntry).toBeNull();
    expectOk(usePrototypeStore.getState().enterParentExperience());

    expect(
      expectOk(usePrototypeStore.getState().createPreparedFamilyReward()).reward,
    ).toMatchObject({ lifecycle: 'unlocked' });
    expect(expectOk(usePrototypeStore.getState().startPreparedFamilyLeague()).league).toMatchObject(
      {
        cooperativeConfirmedCount: 1,
      },
    );
  });

  it('authorizes prepared encouragement through Child entry and clears every state on reset', () => {
    expectOk(usePrototypeStore.getState().enterParentExperience());
    expectOk(usePrototypeStore.getState().startPreparedFamilyLeague());
    expectOk(usePrototypeStore.getState().enterChildExperience('child_salem'));
    expectOk(
      usePrototypeStore
        .getState()
        .sendPreparedLeagueEncouragement('child_alya', 'one_leaf_together'),
    );
    expect(usePrototypeStore.getState().familyExperience.league).toMatchObject({
      preparedEncouragementCount: 1,
    });

    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().familyExperience).toMatchObject({
      activeEntry: null,
      reward: null,
      league: null,
      access: {
        children: [
          { childId: 'child_salem', pairingStatus: 'paired' },
          { childId: 'child_alya', pairingStatus: 'paired' },
        ],
      },
    });
  });
});
