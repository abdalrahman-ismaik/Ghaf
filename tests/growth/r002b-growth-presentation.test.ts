import { beforeEach, describe, expect, it } from 'vitest';

import {
  projectImpactPathStations,
  projectR002bGrowthExperience,
  projectR002bGrowthExperienceWithLearning,
} from '@/features/growth/presentation';
import { projectRecognitionSeedEntry } from '@/features/growth/seedLedger';
import { IMPACT_PATH_STATIONS, SCHEMA3_R002A_FIXTURE_VERSION } from '@/models/growthJourney';
import { usePrototypeStore } from '@/state/usePrototypeStore';

describe('R002b Growth presentation projection', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('joins Salem ledger, Path, archive, and exact badge gallery without a second balance', () => {
    const state = usePrototypeStore.getState();
    const result = projectR002bGrowthExperience({
      runtime: state.growthJourney,
      profileId: 'child_salem',
      journey: state.journey,
      learningCompletions: [],
      semanticCriterionEvidence: [],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.profileId).toBe('child_salem');
    expect(result.data.lifetimeSeeds).toBe(108);
    expect(result.data.path).toMatchObject({
      lifetimeSeeds: 108,
      chapterState: 'not_entered',
      reachedThresholds: [],
      nextThreshold: 120,
    });
    expect(result.data.stations).toHaveLength(6);
    expect(result.data.stations[0]).toMatchObject({ threshold: 120, state: 'next' });
    expect(result.data.stations.slice(1).every((station) => station.state === 'locked')).toBe(true);
    expect(result.data.completedMangroveArchives).toEqual([]);
    expect(result.data.badges.items).toHaveLength(16);
    expect(result.data.badges.items.filter((item) => item.displayState === 'earned')).toHaveLength(
      2,
    );
    expect(result.data.unlockedLearningIds).toEqual([]);
    expect(result.data.configuredNextGardenStage).toBeNull();
  });

  it('projects each canonical station as reached, next, or locked in registry order', () => {
    const stations = projectImpactPathStations({
      lifetimeSeeds: 144,
      chapterState: 'active',
      reachedThresholds: [120, 132, 144],
      nextThreshold: 156,
    });

    expect(stations.map((station) => station.threshold)).toEqual(
      IMPACT_PATH_STATIONS.map((station) => station.threshold),
    );
    expect(stations.map((station) => station.state)).toEqual([
      'reached',
      'reached',
      'reached',
      'next',
      'locked',
      'locked',
    ]);
    expect(Object.isFrozen(stations)).toBe(true);
    expect(stations.every(Object.isFrozen)).toBe(true);
  });

  it('unlocks only the configured Mangrove package at station 132', () => {
    const state = usePrototypeStore.getState();
    const salemLedger = state.growthJourney.ledgersByProfile.child_salem;
    const firstRecognition = projectRecognitionSeedEntry({
      ledger: salemLedger,
      profileId: 'child_salem',
      profileEpochId: salemLedger.profileEpochId,
      triggerEventId: 'test-approved-event-120',
      recognitionKey: 'recognition:test-approved-event-120',
      seedTransactionId: 'seed-transaction:test-approved-event-120',
      amount: 12,
      committedAt: '2026-09-05T09:30:00.000Z',
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      mangroveTransition: null,
    });
    expect(firstRecognition.ok).toBe(true);
    if (!firstRecognition.ok) return;
    const secondRecognition = projectRecognitionSeedEntry({
      ledger: firstRecognition.data.ledger,
      profileId: 'child_salem',
      profileEpochId: salemLedger.profileEpochId,
      triggerEventId: 'test-approved-event-132',
      recognitionKey: 'recognition:test-approved-event-132',
      seedTransactionId: 'seed-transaction:test-approved-event-132',
      amount: 12,
      committedAt: '2026-09-05T09:45:00.000Z',
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      mangroveTransition: null,
    });
    expect(secondRecognition.ok).toBe(true);
    if (!secondRecognition.ok) return;
    const runtime = {
      ...state.growthJourney,
      ledgersByProfile: {
        ...state.growthJourney.ledgersByProfile,
        child_salem: secondRecognition.data.ledger,
      },
    };

    const result = projectR002bGrowthExperience({
      runtime,
      profileId: 'child_salem',
      journey: null,
      learningCompletions: [],
      semanticCriterionEvidence: [],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.lifetimeSeeds).toBe(132);
    expect(result.data.unlockedLearningIds).toEqual(['learning.mangrove_roots.v1']);
    expect(result.data.stations.find((station) => station.threshold === 132)?.state).toBe(
      'reached',
    );
    expect(result.data.stations.find((station) => station.threshold === 144)?.state).toBe('next');
  });

  it('fails closed on cross-profile learning evidence', () => {
    const state = usePrototypeStore.getState();
    const result = projectR002bGrowthExperience({
      runtime: state.growthJourney,
      profileId: 'child_salem',
      journey: null,
      learningCompletions: [
        {
          id: 'learning-completion:child_alya:epoch:learning.mangrove_roots.v1',
          profileId: 'child_alya',
          profileEpochId: state.growthJourney.ledgersByProfile.child_alya.profileEpochId,
          learningId: 'learning.mangrove_roots.v1',
          status: 'committed',
        },
      ],
      semanticCriterionEvidence: [],
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PROFILE_SCOPE_MISMATCH' },
    });
  });

  it('is deterministic and does not mutate caller-owned state', () => {
    const state = usePrototypeStore.getState();
    const before = structuredClone(state.growthJourney);
    const input = {
      runtime: state.growthJourney,
      profileId: 'child_alya' as const,
      journey: state.journey,
      learningCompletions: [],
      semanticCriterionEvidence: [],
    };

    const first = projectR002bGrowthExperience(input);
    const second = projectR002bGrowthExperience(input);
    expect(first).toEqual(second);
    expect(state.growthJourney).toEqual(before);
  });

  it('derives learning evidence only from the active profile and reset epoch', () => {
    const state = usePrototypeStore.getState();
    const result = projectR002bGrowthExperienceWithLearning({
      runtime: state.growthJourney,
      profileId: 'child_salem',
      journey: state.journey,
      learningState: state.mangroveLearningByProfile.child_salem,
    });
    expect(result.ok).toBe(true);

    const crossProfile = projectR002bGrowthExperienceWithLearning({
      runtime: state.growthJourney,
      profileId: 'child_salem',
      journey: state.journey,
      learningState: state.mangroveLearningByProfile.child_alya,
    });
    expect(crossProfile).toMatchObject({
      ok: false,
      error: { code: 'PROFILE_SCOPE_MISMATCH' },
    });
  });
});
