import { describe, expect, it, vi } from 'vitest';

import {
  applyCanopy,
  applyCircle,
  planAfterConfirmation,
  projectionEligibilityContextSchema,
  validateEligibilityContext,
} from '../src/features/circle/projection';
import { evaluateRecognitionPolicy } from '../src/features/rewards/policy';

const eligibleContext = {
  schemaVersion: '1.0' as const,
  categoryId: 'green_impact' as const,
  recognitionMode: 'standard' as const,
  routinePhase: 'acquisition' as const,
  visibilityScope: 'household' as const,
  circleEligible: true,
  consequenceKind: 'rewarded_acquisition' as const,
  confirmed: true as const,
  prohibitedSharedFieldsPresent: false as const,
};

describe('Feature 003 privacy-before-projection policy', () => {
  it('accepts only the strict minimal projection context', () => {
    expect(projectionEligibilityContextSchema.safeParse(eligibleContext).success).toBe(true);
    expect(validateEligibilityContext(eligibleContext)).toMatchObject({ ok: true });

    const forbiddenFields: ReadonlyArray<readonly [string, unknown]> = [
      ['childId', 'child_salem'],
      ['householdId', 'household_al_noor'],
      ['taskId', 'task_recycling_p0_v1'],
      ['taskTitle', 'Sort recyclables'],
      ['submissionId', 'submission_recycling_p0_1'],
      ['recognitionKey', 'recognition:submission_recycling_p0_1'],
      ['seedAmount', 12],
      ['seedBalance', 60],
      ['mediaFixtureId', 'fixture_recycling_clean_v1'],
      ['reflection', 'Private reflection'],
      ['assistantContent', 'Prepared Coach response'],
      ['parentNote', 'Private note'],
      ['timestamp', '2026-08-26T12:00:00.000Z'],
      ['freeText', 'Do not share'],
      ['prayer', 'Private faith routine'],
      ['kinship', 'Private family visit'],
      ['affection', 'Private relationship detail'],
      ['foodConsumption', 'Private eating detail'],
      ['hygiene', 'Private hygiene routine'],
      ['wellbeing', 'Private wellbeing detail'],
      ['disabilityRoutine', 'Private access support'],
    ];

    for (const [field, value] of forbiddenFields) {
      const candidate = { ...eligibleContext, [field]: value };
      expect(projectionEligibilityContextSchema.safeParse(candidate).success, field).toBe(false);
      expect(validateEligibilityContext(candidate), field).toMatchObject({
        ok: false,
        error: { code: 'PRIVACY_REJECTED' },
      });
    }
  });

  it('plans only allowlisted one-unit household and Green-circle DTOs', () => {
    expect(planAfterConfirmation(eligibleContext)).toEqual({
      ok: true,
      data: {
        canopyContribution: {
          actionKind: 'eligible_household_acquisition',
          leafDelta: 1,
          origin: 'synthetic',
        },
        circleEvent: {
          actionKind: 'eligible_green_action',
          actionDelta: 1,
          sourceScope: 'household',
          origin: 'synthetic_local',
        },
        canopyRejection: null,
        circleRejection: null,
      },
    });
  });

  it('returns null shared DTOs for valid private and recognition-only consequences', () => {
    expect(
      planAfterConfirmation({
        ...eligibleContext,
        visibilityScope: 'child_guardian',
        circleEligible: false,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        canopyContribution: null,
        circleEvent: null,
        canopyRejection: 'private_scope',
      },
    });

    expect(
      planAfterConfirmation({
        ...eligibleContext,
        recognitionMode: 'recognition_only',
        routinePhase: 'not_applicable',
        consequenceKind: 'recognition_only',
        circleEligible: false,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        canopyContribution: null,
        circleEvent: null,
        canopyRejection: 'recognition_only',
        circleRejection: 'recognition_only',
      },
    });
  });

  it('rejects sensitive and invalid eligibility contexts before any shared DTO exists', () => {
    expect(
      planAfterConfirmation({
        ...eligibleContext,
        categoryId: 'home_responsibility',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(
      validateEligibilityContext({
        ...eligibleContext,
        prohibitedSharedFieldsPresent: true,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('allows non-Green household acquisition into the canopy but never the circle', () => {
    expect(
      planAfterConfirmation({
        ...eligibleContext,
        categoryId: 'home_responsibility',
        circleEligible: false,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        canopyContribution: { leafDelta: 1 },
        circleEvent: null,
      },
    });
  });

  it('allows maintenance Green activity into the circle without canopy growth', () => {
    expect(
      planAfterConfirmation({
        ...eligibleContext,
        recognitionMode: 'fade_first',
        routinePhase: 'maintenance',
        consequenceKind: 'maintenance_activity',
      }),
    ).toMatchObject({
      ok: true,
      data: {
        canopyContribution: null,
        circleEvent: { actionDelta: 1 },
        circleRejection: null,
      },
    });
  });

  it('applies allowlisted DTOs immutably and by exactly one unit', () => {
    const canopy = { contributionLeaves: 19, goalLeaves: 25 as const };
    const circle = {
      eligibleGreenActions: 11,
      goal: 12 as const,
      origin: 'synthetic_local' as const,
    };
    const plan = planAfterConfirmation(eligibleContext);
    if (!plan.ok || !plan.data.canopyContribution || !plan.data.circleEvent) {
      throw new Error('Expected eligible projection plan');
    }

    expect(applyCanopy(canopy, plan.data.canopyContribution)).toEqual({
      contributionLeaves: 20,
      goalLeaves: 25,
    });
    expect(applyCircle(circle, plan.data.circleEvent)).toEqual({
      eligibleGreenActions: 12,
      goal: 12,
      origin: 'synthetic_local',
    });
    expect(canopy.contributionLeaves).toBe(19);
    expect(circle.eligibleGreenActions).toBe(11);
  });

  it('bypasses validation and projection entirely when the ledger already has a receipt', () => {
    const receipt = {
      recognitionKey: 'recognition:submission_recycling_p0_1',
      checkInId: 'checkin_recycling_p0_1',
      seedTransaction: null,
      landscapeGrowth: null,
      canopyContribution: null,
      circleEvent: null,
      phaseReview: null,
    } as const;
    const projectionPlanner = vi.fn();

    expect(
      evaluateRecognitionPolicy(
        {
          submissionId: 'submission_recycling_p0_1',
          recognitionMode: 'recognition_only',
          routinePhase: 'acquisition',
          recurrence: 'recurrent',
          displayedSeedAward: 5 as 4,
          completionMode: 'permitted_help',
          confirmedAcquisitionCount: 99,
          existingReceipt: receipt,
        },
        { projectionPlanner },
      ),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'already_confirmed', receipt },
    });
    expect(projectionPlanner).not.toHaveBeenCalled();
  });
});
