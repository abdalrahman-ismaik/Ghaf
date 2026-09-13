import { describe, expect, it } from 'vitest';

import {
  createGrowthJourneyRuntime,
  projectRecognitionIntoGrowthJourney,
} from '../../src/features/growth/bootstrap';
import type { PrototypeSession, RecognitionReceipt } from '../../src/models/familyGrowth';
import { createInitialPrototypeSession } from '../../src/services/mock/fixtures';
import { initializeProfileLandscapes } from '../../src/features/tasks/assignmentInstances';

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

describe('R002b general plant-stage archive projection', () => {
  it('projects the normal Samar 16-to-24 crossing into Alya Growth history', () => {
    const opening = createInitialPrototypeSession();
    const openingMaps = initializeProfileLandscapes(opening);
    const previousLandscapes = {
      ...openingMaps.child_alya,
      samar: {
        landscapeId: 'samar' as const,
        cumulativeSeeds: 16,
        stage: 'seed' as const,
        nextThreshold: 20 as const,
      },
    };
    const nextLandscapes = {
      ...previousLandscapes,
      samar: {
        landscapeId: 'samar' as const,
        cumulativeSeeds: 24,
        stage: 'shoot' as const,
        nextThreshold: 60 as const,
      },
    };
    // Historical projection fixture: the Samar 16 balance is explicitly profile-scoped.
    const previousSession: PrototypeSession = {
      ...opening,
      activeChildId: 'child_alya',
      landscapeProgressByChild: { ...openingMaps, child_alya: previousLandscapes },
      landscapeProgress: previousLandscapes,
    };
    const recognitionKey = 'recognition:submission_samar_threshold_attempt_1';
    const receipt: RecognitionReceipt = {
      recognitionKey,
      checkInId: 'checkin_samar_threshold_attempt_1',
      provenance: {
        schemaVersion: 'r003.recognition-provenance.v1',
        taskId: 'task_samar_threshold_v1',
        taskVersion: 1,
        submissionId: 'submission_samar_threshold_attempt_1',
        profileId: 'child_alya',
        landscapeId: 'samar',
        completionMode: 'independent',
        projection: {
          schemaVersion: '1.0',
          categoryId: 'home_responsibility',
          recognitionMode: 'standard',
          routinePhase: 'acquisition',
          visibilityScope: 'child_guardian',
          circleEligible: false,
          consequenceKind: 'rewarded_acquisition',
          confirmed: true,
          prohibitedSharedFieldsPresent: false,
        },
        recurrence: 'once',
        routineCompletionCountBefore: 0,
        routineCompletionCountAfter: 0,
        familyRewardEligible: false,
        challengeLeafEligible: false,
      },
      seedTransaction: {
        id: 'seed_transaction_samar_threshold_attempt_1',
        recognitionKey,
        childId: 'child_alya',
        amount: 8,
        balanceBefore: 36,
        balanceAfter: 44,
        meaning: 'symbolic_nonfinancial',
      },
      landscapeGrowth: {
        landscapeId: 'samar',
        seedsBefore: 16,
        seedsAfter: 24,
        stageBefore: 'seed',
        stageAfter: 'shoot',
        crossedThreshold: 20,
        symbolicOnly: true,
      },
      canopyContribution: null,
      circleEvent: null,
      phaseReview: null,
    };
    const nextSession: PrototypeSession = {
      ...previousSession,
      children: {
        ...previousSession.children,
        child_alya: { ...previousSession.children.child_alya, earnedSeeds: 44 },
      },
      landscapeProgressByChild: { ...openingMaps, child_alya: nextLandscapes },
      landscapeProgress: nextLandscapes,
      recognitionLedger: { [recognitionKey]: receipt },
    };
    const runtime = createGrowthJourneyRuntime(opening, 7);
    expectOk(runtime);

    const projected = projectRecognitionIntoGrowthJourney({
      runtime: runtime.data,
      previousSession,
      nextSession,
      receipt,
      committedAt: '2026-09-05T08:05:00.000Z',
    });
    expectOk(projected);
    expect(projected.data.runtime.ledgersByProfile.child_alya.plantStageArchives).toEqual([
      expect.objectContaining({
        landscapeId: 'samar',
        threshold: 20,
        seedsBefore: 16,
        seedsAfter: 24,
        stageBefore: 'seed',
        stageAfter: 'shoot',
        triggerEventId: recognitionKey,
      }),
    ]);
  });
});
