import { beforeEach, describe, expect, it } from 'vitest';

import { r002bFeatureFlags } from '../../src/config/r002bFeatureFlags';
import {
  projectRecognitionIntoGrowthJourney,
  rehydrateGrowthJourneyRuntime,
  selectGrowthJourneyProfile,
} from '../../src/features/growth/bootstrap';
import type { PrototypeSession } from '../../src/models/familyGrowth';
import type { SeedLedgerState } from '../../src/models/growthJourney';
import { serviceRegistry } from '../../src/services';
import { PREPARED_PRAISE, createSubmittedP0Session } from '../../src/services/mock/fixtures';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const PRAISE_ACTION = {
  actionId: 'r002b-parent-praise',
  source: 'parent_press' as const,
  presentedAt: '2026-09-05T10:00:00.000Z',
};

const RECOGNITION_ACTION = {
  actionId: 'r002b-parent-recognition',
  source: 'parent_press' as const,
  observedRenderState: 'praise_presented' as const,
  presentationActionId: PRAISE_ACTION.actionId,
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function sessionSnapshot(): PrototypeSession {
  const state = usePrototypeStore.getState();
  return {
    schemaVersion: state.schemaVersion,
    locale: state.locale,
    direction: state.direction,
    role: state.role,
    household: state.household,
    children: state.children,
    activeChildId: state.activeChildId,
    choicePool: state.choicePool,
    activeAssignmentId: state.activeAssignmentId,
    journey: state.journey,
    landscapeProgress: state.landscapeProgress,
    circleGoal: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
    routineProgressByTask: state.routineProgressByTask,
    preparedParentGuideFixtureId: state.preparedParentGuideFixtureId,
    preparedChildCoachFixtureId: state.preparedChildCoachFixtureId,
    preparedImageFixtureId: state.preparedImageFixtureId,
    preparedAudioFixtureId: state.preparedAudioFixtureId,
    assistantMode: state.assistantMode,
    celebration: state.celebration,
  };
}

function prepareConfirmation(): void {
  usePrototypeStore.setState(createSubmittedP0Session());
  const planned = usePrototypeStore.getState().planConfirmation({
    submissionId: 'submission_recycling_p0_v1_attempt_1',
    praise: PREPARED_PRAISE,
    neutralObservation: null,
    uncertainty: null,
  });
  expectOk(planned);
  expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
}

function profile(profileId: 'child_salem' | 'child_alya') {
  const result = selectGrowthJourneyProfile(usePrototypeStore.getState().growthJourney, profileId);
  expectOk(result);
  return result.data;
}

describe('R002b progression store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('normalizes only synthetic profile evidence while preserving Schema-3 display scalars', () => {
    const state = usePrototypeStore.getState();

    expect(state.children.child_salem.earnedSeeds).toBe(48);
    expect(state.landscapeProgress.mangrove.cumulativeSeeds).toBe(48);
    expect(profile('child_salem')).toMatchObject({
      profileId: 'child_salem',
      lifetimeSeeds: 108,
      path: { chapterState: 'not_entered', nextThreshold: 120 },
      ledger: {
        entries: [{ amount: 48 }, { amount: 60 }],
        migrationReceipts: [{ silentBackfill: true, syntheticOnly: true }],
        plantStageArchives: [],
      },
      achievements: {
        acquisitionCredits: [],
        awards: [
          {
            badgeId: 'badge.journey.seed_start.v1',
            silentBackfill: true,
            celebrationEligible: false,
          },
          {
            badgeId: 'badge.journey.growing_branch.v1',
            silentBackfill: true,
            celebrationEligible: false,
          },
        ],
      },
    });
    expect(profile('child_alya')).toMatchObject({
      profileId: 'child_alya',
      lifetimeSeeds: 36,
      path: { chapterState: 'not_entered', nextThreshold: 120 },
      ledger: {
        entries: [{ amount: 36 }],
        migrationReceipts: [],
        plantStageArchives: [],
      },
      achievements: {
        acquisitionCredits: [],
        awards: [
          {
            badgeId: 'badge.journey.seed_start.v1',
            silentBackfill: true,
            celebrationEligible: false,
          },
        ],
      },
    });
    expect(profile('child_salem').profileEpochId).not.toBe(profile('child_alya').profileEpochId);
    expect(r002bFeatureFlags.r002b_progression_engine).toBe(false);
  });

  it('projects one authoritative +12 approval atomically without changing legacy consequences', () => {
    const beforeGrowth = usePrototypeStore.getState().growthJourney;
    prepareConfirmation();

    expect(usePrototypeStore.getState().growthJourney).toBe(beforeGrowth);
    const result = usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION);
    expectOk(result);

    expect(result.data.disposition).toBe('applied');
    expect(usePrototypeStore.getState()).toMatchObject({
      children: { child_salem: { earnedSeeds: 60 }, child_alya: { earnedSeeds: 36 } },
      landscapeProgress: {
        mangrove: { cumulativeSeeds: 60, stage: 'sapling', nextThreshold: 120 },
      },
      household: { combinedCanopy: { contributionLeaves: 20 } },
      circleGoal: { eligibleGreenActions: 12 },
      celebration: { available: true, consumed: false },
    });
    expect(profile('child_salem')).toMatchObject({
      lifetimeSeeds: 120,
      path: { chapterState: 'active', reachedThresholds: [120], nextThreshold: 132 },
      ledger: {
        entries: [{ amount: 48 }, { amount: 60 }, { kind: 'task_recognition', amount: 12 }],
        plantStageArchives: [
          {
            landscapeId: 'mangrove',
            threshold: 60,
            seedsBefore: 48,
            seedsAfter: 60,
            symbolicOnly: true,
          },
        ],
      },
      achievements: {
        acquisitionCredits: [
          { skillId: 'skill.sorting', taskId: 'task_recycling_p0_v1' },
          { skillId: 'skill.coast_care', taskId: 'task_recycling_p0_v1' },
        ],
        awards: [
          { badgeId: 'badge.journey.seed_start.v1', silentBackfill: true },
          { badgeId: 'badge.journey.growing_branch.v1', silentBackfill: true },
          {
            badgeId: 'badge.journey.expanding_shade.v1',
            silentBackfill: false,
            celebrationEligible: true,
          },
          {
            badgeId: 'badge.skill.sorting.bud.v1',
            silentBackfill: false,
            celebrationEligible: true,
          },
        ],
      },
    });
    expect(profile('child_alya').lifetimeSeeds).toBe(36);
  });

  it('rejects a +12 receipt that omits its required Mangrove transition', () => {
    prepareConfirmation();
    const beforeSession = sessionSnapshot();
    const plan = usePrototypeStore.getState().confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected praise-presented confirmation');
    }
    const application = serviceRegistry.recognition.applyRecognition(
      beforeSession,
      plan,
      RECOGNITION_ACTION,
    );
    expectOk(application);
    const malformedReceipt = { ...application.data.receipt, landscapeGrowth: null };
    const malformedSession = {
      ...application.data.session,
      recognitionLedger: {
        [malformedReceipt.recognitionKey]: malformedReceipt,
      },
    };

    expect(
      projectRecognitionIntoGrowthJourney({
        runtime: usePrototypeStore.getState().growthJourney,
        previousSession: beforeSession,
        nextSession: malformedSession,
        receipt: malformedReceipt,
        committedAt: plan.checkIn.praisePresentedAt,
      }),
    ).toMatchObject({ ok: false, error: { code: 'FIXTURE_EVIDENCE_MISMATCH' } });
    expect(sessionSnapshot()).toEqual(beforeSession);
  });

  it('keeps repeated approval and recovery projection idempotent', () => {
    prepareConfirmation();
    expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
    const firstGrowth = structuredClone(usePrototypeStore.getState().growthJourney);

    for (let index = 0; index < 3; index += 1) {
      const duplicate = usePrototypeStore.getState().applyRecognition({
        ...RECOGNITION_ACTION,
        actionId: `r002b-duplicate-${index}`,
      });
      expectOk(duplicate);
      expect(duplicate.data.disposition).toBe('already_confirmed');
      expect(usePrototypeStore.getState().growthJourney).toEqual(firstGrowth);
      expect(profile('child_salem').ledger.entries).toHaveLength(3);
      expect(profile('child_salem').ledger.plantStageArchives).toHaveLength(1);
    }

    const current = usePrototypeStore.getState().growthJourney;
    const salemBaseline = current.ledgersByProfile.child_salem;
    usePrototypeStore.setState({
      growthJourney: {
        ...current,
        ledgersByProfile: {
          ...current.ledgersByProfile,
          child_salem: {
            ...salemBaseline,
            entries: salemBaseline.entries.filter((entry) => entry.kind !== 'task_recognition'),
            plantStageArchives: [],
          },
        },
      },
    });

    const recovered = usePrototypeStore.getState().applyRecognition({
      ...RECOGNITION_ACTION,
      actionId: 'r002b-recovery',
    });
    expectOk(recovered);
    expect(recovered.data.disposition).toBe('already_confirmed');
    expect(usePrototypeStore.getState().growthJourney).toEqual(firstGrowth);
  });

  it('creates isolated reset epochs and restores deterministic profile baselines', () => {
    const firstEpoch = profile('child_salem').profileEpochId;
    prepareConfirmation();
    expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
    expect(profile('child_salem').lifetimeSeeds).toBe(120);

    expectOk(usePrototypeStore.getState().resetPrototype());

    expect(profile('child_salem')).toMatchObject({
      lifetimeSeeds: 108,
      ledger: { entries: [{ amount: 48 }, { amount: 60 }], plantStageArchives: [] },
    });
    expect(profile('child_alya').lifetimeSeeds).toBe(36);
    expect(profile('child_salem').profileEpochId).not.toBe(firstEpoch);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
    expect(usePrototypeStore.getState().celebration).toEqual({
      available: false,
      consumed: false,
    });
  });

  it('rehydrates opening, praise-presented, and recognized transaction boundaries', () => {
    const openingSession = sessionSnapshot();
    const opening = rehydrateGrowthJourneyRuntime({
      session: openingSession,
      savedRuntime: null,
      resetSequence: 41,
    });
    expectOk(opening);
    expect(selectGrowthJourneyProfile(opening.data, 'child_salem')).toMatchObject({
      ok: true,
      data: { lifetimeSeeds: 108 },
    });

    prepareConfirmation();
    const praisePresented = rehydrateGrowthJourneyRuntime({
      session: sessionSnapshot(),
      savedRuntime: null,
      resetSequence: 42,
    });
    expectOk(praisePresented);
    expect(selectGrowthJourneyProfile(praisePresented.data, 'child_salem')).toMatchObject({
      ok: true,
      data: { lifetimeSeeds: 108 },
    });

    expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
    const recognizedSession = sessionSnapshot();
    const reconstructed = rehydrateGrowthJourneyRuntime({
      session: recognizedSession,
      savedRuntime: null,
      resetSequence: 42,
    });
    expectOk(reconstructed);
    expect(selectGrowthJourneyProfile(reconstructed.data, 'child_salem')).toMatchObject({
      ok: true,
      data: {
        lifetimeSeeds: 120,
        ledger: { entries: [{ amount: 48 }, { amount: 60 }, { amount: 12 }] },
      },
    });
    const restoredSavedSnapshot = rehydrateGrowthJourneyRuntime({
      session: recognizedSession,
      savedRuntime: reconstructed.data,
      resetSequence: 42,
    });
    expectOk(restoredSavedSnapshot);
    expect(restoredSavedSnapshot.data).toEqual(reconstructed.data);
  });

  it('fails closed for partial restoration input instead of throwing', () => {
    expect(
      rehydrateGrowthJourneyRuntime({} as Parameters<typeof rehydrateGrowthJourneyRuntime>[0]),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      rehydrateGrowthJourneyRuntime({
        session: {},
        savedRuntime: null,
        resetSequence: 0,
      } as unknown as Parameters<typeof rehydrateGrowthJourneyRuntime>[0]),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      selectGrowthJourneyProfile(
        {} as Parameters<typeof selectGrowthJourneyProfile>[0],
        'child_salem',
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('fails the whole approval when progression evidence is corrupt', () => {
    prepareConfirmation();
    const state = usePrototypeStore.getState();
    const beforeSession = structuredClone(sessionSnapshot());
    const salemLedger = structuredClone(state.growthJourney.ledgersByProfile.child_salem);
    const openingEntry = salemLedger.entries[0];
    if (!openingEntry) throw new Error('Expected Salem opening evidence');
    const corruptLedger = {
      ...salemLedger,
      entries: [{ ...openingEntry, amount: 49 }, ...salemLedger.entries.slice(1)],
    } as SeedLedgerState;
    usePrototypeStore.setState({
      growthJourney: {
        ...state.growthJourney,
        ledgersByProfile: {
          ...state.growthJourney.ledgersByProfile,
          child_salem: corruptLedger,
        },
      },
    });

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expect(sessionSnapshot()).toEqual(beforeSession);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
    expect(usePrototypeStore.getState().children.child_salem.earnedSeeds).toBe(48);
    expect(usePrototypeStore.getState().landscapeProgress.mangrove.cumulativeSeeds).toBe(48);
  });

  it('fails the whole approval when achievement evidence is corrupt', () => {
    prepareConfirmation();
    const state = usePrototypeStore.getState();
    const beforeSession = structuredClone(sessionSnapshot());
    const salemAchievements = state.growthJourney.achievementsByProfile.child_salem;
    const firstAward = salemAchievements.awards[0];
    if (!firstAward) throw new Error('Expected a silent baseline badge');
    usePrototypeStore.setState({
      growthJourney: {
        ...state.growthJourney,
        achievementsByProfile: {
          ...state.growthJourney.achievementsByProfile,
          child_salem: {
            ...salemAchievements,
            awards: [{ ...firstAward, private: false }, ...salemAchievements.awards.slice(1)],
          } as unknown as typeof salemAchievements,
        },
      },
    });

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expect(sessionSnapshot()).toEqual(beforeSession);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
    expect(usePrototypeStore.getState().children.child_salem.earnedSeeds).toBe(48);
  });
});
