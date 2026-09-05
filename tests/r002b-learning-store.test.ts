import { beforeEach, describe, expect, it } from 'vitest';

import { recordParentApprovedAcquisition } from '@/features/growth/achievements';
import {
  projectLearningCompletionIntoGrowthJourney,
  selectGrowthJourneyProfile,
} from '@/features/growth/bootstrap';
import { projectRecognitionSeedEntry } from '@/features/growth/seedLedger';
import { MANGROVE_ROOTS_LEARNING_PACKAGE } from '@/features/learning/mangroveLearning';
import type { AchievementState } from '@/models/achievements';
import type { GrowthJourneyRuntimeState } from '@/features/growth/bootstrap';
import { SCHEMA3_R002A_FIXTURE_VERSION } from '@/models/growthJourney';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

const ORIGIN = {
  kind: 'impact_path' as const,
  route: '/garden/impact-path' as const,
  profileId: 'child_salem' as const,
  focusTargetId: 'impact-path-learning-station-132' as const,
  scrollOffset: 0,
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function runtimeAt132(): GrowthJourneyRuntimeState {
  const runtime = usePrototypeStore.getState().growthJourney;
  const openingLedger = runtime.ledgersByProfile.child_salem;
  const at120 = projectRecognitionSeedEntry({
    ledger: openingLedger,
    profileId: 'child_salem',
    profileEpochId: openingLedger.profileEpochId,
    triggerEventId: 'learning-setup-120',
    recognitionKey: 'recognition:learning-setup-120',
    seedTransactionId: 'seed-transaction:learning-setup-120',
    amount: 12,
    committedAt: '2026-09-05T12:00:00.000Z',
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    mangroveTransition: null,
  });
  expectOk(at120);
  const at132 = projectRecognitionSeedEntry({
    ledger: at120.data.ledger,
    profileId: 'child_salem',
    profileEpochId: openingLedger.profileEpochId,
    triggerEventId: 'learning-setup-132',
    recognitionKey: 'recognition:learning-setup-132',
    seedTransactionId: 'seed-transaction:learning-setup-132',
    amount: 12,
    committedAt: '2026-09-05T12:12:00.000Z',
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    mangroveTransition: null,
  });
  expectOk(at132);
  return {
    ...runtime,
    ledgersByProfile: {
      ...runtime.ledgersByProfile,
      child_salem: at132.data.ledger,
    },
  };
}

function addThreeCoastCredits(state: AchievementState): AchievementState {
  let current = state;
  for (let index = 1; index <= 3; index += 1) {
    const result = recordParentApprovedAcquisition({
      state: current,
      event: {
        eventId: `recognition:coast-${index}`,
        occurrenceId: `occurrence:coast-${index}`,
        profileId: current.profileId,
        profileEpochId: current.profileEpochId,
        taskId: 'task_recycling_p0_v1',
        status: 'committed',
        recognitionMode: 'standard',
        routinePhase: 'acquisition',
      },
    });
    expectOk(result);
    current = result.data.state;
  }
  return current;
}

function legacyRewardSnapshot() {
  const state = usePrototypeStore.getState();
  return {
    children: structuredClone(state.children),
    landscapeProgress: structuredClone(state.landscapeProgress),
    canopy: structuredClone(state.household.combinedCanopy),
    circleGoal: structuredClone(state.circleGoal),
    recognitionLedger: structuredClone(state.recognitionLedger),
  };
}

describe('R002b learning store integration', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('creates isolated empty learning state for each active profile epoch and recreates it on reset', async () => {
    const before = usePrototypeStore.getState();
    expect(before.mangroveLearningByProfile.child_salem).toMatchObject({
      profileId: 'child_salem',
      profileEpochId: before.growthJourney.ledgersByProfile.child_salem.profileEpochId,
      revision: 0,
      completion: null,
    });
    expect(before.mangroveLearningByProfile.child_alya).toMatchObject({
      profileId: 'child_alya',
      profileEpochId: before.growthJourney.ledgersByProfile.child_alya.profileEpochId,
      revision: 0,
      completion: null,
    });

    await enterParentExperienceForTest();
    expectOk(usePrototypeStore.getState().resetPrototype());
    const after = usePrototypeStore.getState();
    expect(after.mangroveLearningByProfile.child_salem.revision).toBe(0);
    expect(after.mangroveLearningByProfile.child_salem.profileEpochId).not.toBe(
      before.mangroveLearningByProfile.child_salem.profileEpochId,
    );
    expect(after.mangroveLearningByProfile.child_alya.profileEpochId).not.toBe(
      before.mangroveLearningByProfile.child_alya.profileEpochId,
    );
  });

  it('fails closed before station 132 without changing learning or reward state', () => {
    const store = usePrototypeStore.getState();
    store.setRole('child');
    const learningBefore = store.mangroveLearningByProfile;
    const rewardsBefore = legacyRewardSnapshot();

    const result = usePrototypeStore.getState().startMangroveLearning('story', ORIGIN);
    expect(result.ok).toBe(false);
    expect(usePrototypeStore.getState().mangroveLearningByProfile).toBe(learningBefore);
    expect(legacyRewardSnapshot()).toEqual(rewardsBefore);
  });

  it('resumes a finite no-fail route and commits one zero-reward completion', async () => {
    await enterChildExperienceForTest();
    usePrototypeStore.setState({ growthJourney: runtimeAt132() });
    const rewardsBefore = legacyRewardSnapshot();
    const started = usePrototypeStore.getState().startMangroveLearning('story', ORIGIN);
    expectOk(started);
    expect(started.data.disposition).toBe('started');

    const resumed = usePrototypeStore.getState().startMangroveLearning('story', ORIGIN);
    expectOk(resumed);
    expect(resumed.data.disposition).toBe('resumed');

    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
      expectOk(usePrototypeStore.getState().advanceMangroveLearning('story', stepId));
    }
    const retry = usePrototypeStore
      .getState()
      .answerMangroveLearningCheck('story', 'visit_or_task_reward');
    expectOk(retry);
    expect(retry.data.disposition).toBe('retry_available');
    const correct = usePrototypeStore
      .getState()
      .answerMangroveLearningCheck('story', 'habitat_support_and_care');
    expectOk(correct);

    const completed = usePrototypeStore
      .getState()
      .completeMangroveLearning('story', '2026-09-05T12:30:00.000Z');
    expectOk(completed);
    expect(completed.data.disposition).toBe('completed');
    expect(completed.data.event.consequences).toMatchObject({
      seedDelta: 0,
      gardenGrowthDelta: 0,
      canopyContributionDelta: 0,
      privateLeagueLeafDelta: 0,
      challengeLeafDelta: 0,
      familyRewardProgressDelta: 0,
    });
    expect(legacyRewardSnapshot()).toEqual(rewardsBefore);

    const duplicate = usePrototypeStore
      .getState()
      .completeMangroveLearning('story', '2026-09-05T12:30:00.000Z');
    expectOk(duplicate);
    expect(duplicate.data.disposition).toBe('already_completed');
    expect(duplicate.data.event.id).toBe(completed.data.event.id);
    expect(legacyRewardSnapshot()).toEqual(rewardsBefore);
  });

  it('does not award Mangrove Care at 132 without all criteria', async () => {
    await enterChildExperienceForTest();
    usePrototypeStore.setState({ growthJourney: runtimeAt132() });
    expectOk(usePrototypeStore.getState().startMangroveLearning('accessible', ORIGIN));
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds) {
      expectOk(usePrototypeStore.getState().advanceMangroveLearning('accessible', stepId));
    }
    expectOk(
      usePrototypeStore
        .getState()
        .answerMangroveLearningCheck('accessible', 'habitat_support_and_care'),
    );
    expectOk(
      usePrototypeStore
        .getState()
        .completeMangroveLearning('accessible', '2026-09-05T12:35:00.000Z'),
    );

    const profile = selectGrowthJourneyProfile(
      usePrototypeStore.getState().growthJourney,
      'child_salem',
    );
    expectOk(profile);
    expect(
      profile.data.achievements.awards.some(
        (award) => award.badgeId === 'badge.habitat.mangrove_care.v1',
      ),
    ).toBe(false);
  });

  it('awards Mangrove Care only when learning joins station 132 and three coast credits', async () => {
    await enterChildExperienceForTest();
    usePrototypeStore.setState({ growthJourney: runtimeAt132() });
    expectOk(usePrototypeStore.getState().startMangroveLearning('story', ORIGIN));
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
      expectOk(usePrototypeStore.getState().advanceMangroveLearning('story', stepId));
    }
    expectOk(
      usePrototypeStore.getState().answerMangroveLearningCheck('story', 'habitat_support_and_care'),
    );
    const completion = usePrototypeStore
      .getState()
      .completeMangroveLearning('story', '2026-09-05T12:40:00.000Z');
    expectOk(completion);

    const currentRuntime = usePrototypeStore.getState().growthJourney;
    const projected = projectLearningCompletionIntoGrowthJourney({
      runtime: {
        ...currentRuntime,
        achievementsByProfile: {
          ...currentRuntime.achievementsByProfile,
          child_salem: addThreeCoastCredits(currentRuntime.achievementsByProfile.child_salem),
        },
      },
      learningState: completion.data.state,
    });
    expectOk(projected);
    expect(projected.data.newlyEarnedBadgeIds).toContain('badge.habitat.mangrove_care.v1');
    expect(projected.data.runtime.ledgersByProfile).toEqual(currentRuntime.ledgersByProfile);
  });
});
