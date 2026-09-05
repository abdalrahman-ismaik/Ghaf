import { beforeEach, describe, expect, it } from 'vitest';

import {
  evaluateBadgeAwards,
  recordParentApprovedAcquisition,
} from '@/features/growth/achievements';
import type { GrowthJourneyRuntimeState } from '@/features/growth/bootstrap';
import {
  projectRecognitionSeedEntry,
  projectWaterAndCoastPath,
  selectLifetimeSeeds,
} from '@/features/growth/seedLedger';
import { MANGROVE_ROOTS_LEARNING_PACKAGE } from '@/features/learning/mangroveLearning';
import type { AchievementState } from '@/models/achievements';
import { SCHEMA3_R002A_FIXTURE_VERSION } from '@/models/growthJourney';
import { usePrototypeStore } from '@/state/usePrototypeStore';

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
    triggerEventId: 'reveal-learning-setup-120',
    recognitionKey: 'recognition:reveal-learning-setup-120',
    seedTransactionId: 'seed-transaction:reveal-learning-setup-120',
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
    triggerEventId: 'reveal-learning-setup-132',
    recognitionKey: 'recognition:reveal-learning-setup-132',
    seedTransactionId: 'seed-transaction:reveal-learning-setup-132',
    amount: 12,
    committedAt: '2026-09-05T12:12:00.000Z',
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    mangroveTransition: null,
  });
  expectOk(at132);
  const lifetime = selectLifetimeSeeds(
    at132.data.ledger,
    'child_salem',
    openingLedger.profileEpochId,
  );
  expectOk(lifetime);
  const path = projectWaterAndCoastPath(lifetime.data);
  expectOk(path);
  const synchronizedAchievements = evaluateBadgeAwards({
    state: runtime.achievementsByProfile.child_salem,
    evidence: {
      lifetimeSeeds: {
        profileId: 'child_salem',
        profileEpochId: openingLedger.profileEpochId,
        source: 'committed_seed_ledger',
        exact: true,
        amount: lifetime.data,
        entryIds: at132.data.ledger.entries.map((entry) => entry.id),
      },
      stationProjection: {
        profileId: 'child_salem',
        profileEpochId: openingLedger.profileEpochId,
        source: 'canonical_impact_path_projection',
        reachedThresholds: path.data.reachedThresholds,
      },
      learningCompletions: [],
      semanticCriterionEvidence: [],
    },
    mode: 'historical_seed_backfill',
    triggerEventId: 'reveal-learning-setup-seed-backfill',
  });
  expectOk(synchronizedAchievements);
  return {
    ...runtime,
    ledgersByProfile: {
      ...runtime.ledgersByProfile,
      child_salem: at132.data.ledger,
    },
    achievementsByProfile: {
      ...runtime.achievementsByProfile,
      child_salem: synchronizedAchievements.data.state,
    },
  };
}

function addThreeCoastCredits(state: AchievementState): AchievementState {
  let current = state;
  for (let index = 1; index <= 3; index += 1) {
    const result = recordParentApprovedAcquisition({
      state: current,
      event: {
        eventId: `recognition:reveal-coast-${index}`,
        occurrenceId: `occurrence:reveal-coast-${index}`,
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

function synchronizeLiveCreditBadges(
  runtime: GrowthJourneyRuntimeState,
  state: AchievementState,
): AchievementState {
  const ledger = runtime.ledgersByProfile.child_salem;
  const lifetime = selectLifetimeSeeds(ledger, 'child_salem', ledger.profileEpochId);
  expectOk(lifetime);
  const path = projectWaterAndCoastPath(lifetime.data);
  expectOk(path);
  const result = evaluateBadgeAwards({
    state,
    evidence: {
      lifetimeSeeds: {
        profileId: 'child_salem',
        profileEpochId: ledger.profileEpochId,
        source: 'committed_seed_ledger',
        exact: true,
        amount: lifetime.data,
        entryIds: ledger.entries.map((entry) => entry.id),
      },
      stationProjection: {
        profileId: 'child_salem',
        profileEpochId: ledger.profileEpochId,
        source: 'canonical_impact_path_projection',
        reachedThresholds: path.data.reachedThresholds,
      },
      learningCompletions: [],
      semanticCriterionEvidence: [],
    },
    mode: 'live',
    triggerEventId: 'recognition:reveal-coast-3',
    occurredAt: '2026-09-05T12:20:00.000Z',
  });
  expectOk(result);
  return result.data.state;
}

function completeStory(completedAt: string) {
  expectOk(usePrototypeStore.getState().startMangroveLearning('story', ORIGIN));
  for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
    expectOk(usePrototypeStore.getState().advanceMangroveLearning('story', stepId));
  }
  expectOk(
    usePrototypeStore.getState().answerMangroveLearningCheck('story', 'habitat_support_and_care'),
  );
  return usePrototypeStore.getState().completeMangroveLearning('story', completedAt);
}

describe('R002b learning outcome RevealBundle integration', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('queues one zero-Seed reveal only when learning newly earns a badge', () => {
    const runtime = runtimeAt132();
    const achievements = synchronizeLiveCreditBadges(
      runtime,
      addThreeCoastCredits(runtime.achievementsByProfile.child_salem),
    );
    usePrototypeStore.setState({
      role: 'child',
      growthJourney: {
        ...runtime,
        achievementsByProfile: {
          ...runtime.achievementsByProfile,
          child_salem: achievements,
        },
      },
    });

    const completed = completeStory('2026-09-05T12:40:00.000Z');
    expectOk(completed);

    const queue = usePrototypeStore.getState().revealBundleQueue;
    expect(queue.bundles).toHaveLength(1);
    expect(queue.bundles[0]).toMatchObject({
      id: `reveal:child_salem:${completed.data.event.triggerEventId}`,
      profileId: 'child_salem',
      profileEpochId: completed.data.event.profileEpochId,
      triggerKind: 'learning_completion',
      lifecycle: 'ready',
    });
    expect(queue.bundles[0]?.items).toHaveLength(1);
    expect(queue.bundles[0]?.items[0]?.consequence).toMatchObject({
      kind: 'earned_badge',
      badgeId: 'badge.habitat.mangrove_care.v1',
      newlyEarned: true,
    });
    expect(queue.bundles[0]?.items.some((item) => item.consequence.kind === 'seed')).toBe(false);

    expectOk(
      usePrototypeStore.getState().completeMangroveLearning('story', '2026-09-05T12:40:00.000Z'),
    );
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toHaveLength(1);
  });

  it('does not queue a reveal when learning creates no new eligible outcome', () => {
    usePrototypeStore.setState({ role: 'child', growthJourney: runtimeAt132() });
    expectOk(completeStory('2026-09-05T12:35:00.000Z'));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);
  });
});
