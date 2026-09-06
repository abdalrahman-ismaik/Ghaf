import { describe, expect, it, vi } from 'vitest';

import {
  evaluateRecognitionPolicy,
  recognitionKeyForSubmission,
} from '../src/features/rewards/policy';
import { TASK_TEMPLATES } from '../src/features/tasks/demoContent';
import { createSubmittedP0Session } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const baseInput = {
  submissionId: 'submission_recycling_p0_1',
  recognitionMode: 'standard' as const,
  routinePhase: 'acquisition' as const,
  recurrence: 'once' as const,
  displayedSeedAward: 12 as const,
  completionMode: 'independent' as const,
  confirmedAcquisitionCount: 1,
  existingReceipt: null,
};

describe('Feature 003 recognition and reward policy', () => {
  it.each([
    ['standard', 'acquisition', 'once', 12, 12, true],
    ['fade_first', 'acquisition', 'recurrent', 8, 8, true],
    ['standard', 'maintenance', 'once', null, null, false],
    ['fade_first', 'maintenance', 'recurrent', null, null, false],
    ['recognition_only', 'not_applicable', 'once', null, null, false],
  ] as const)(
    'accepts %s + %s and derives its exact consequence class',
    (
      recognitionMode,
      routinePhase,
      recurrence,
      displayedSeedAward,
      seedAmount,
      persistentGrowth,
    ) => {
      expect(
        evaluateRecognitionPolicy({
          ...baseInput,
          recognitionMode,
          routinePhase,
          recurrence,
          displayedSeedAward,
        }),
      ).toMatchObject({
        ok: true,
        data: {
          disposition: 'new',
          seedAmount,
          persistentGrowth,
        },
      });
    },
  );

  it.each([
    ['standard', 'not_applicable'],
    ['fade_first', 'not_applicable'],
    ['recognition_only', 'acquisition'],
    ['recognition_only', 'maintenance'],
  ] as const)('rejects invalid pairing %s + %s', (recognitionMode, routinePhase) => {
    expect(
      evaluateRecognitionPolicy({
        ...baseInput,
        recognitionMode,
        routinePhase,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_REWARD_PAIRING' } });
  });

  it('accepts only fixed 4, 6, 8, 12, or 15 Seed acquisition awards', () => {
    for (const displayedSeedAward of [4, 6, 8, 12, 15] as const) {
      expect(evaluateRecognitionPolicy({ ...baseInput, displayedSeedAward })).toMatchObject({
        ok: true,
        data: { seedAmount: displayedSeedAward },
      });
    }

    for (const displayedSeedAward of [-1, 0, 5, 10, 16]) {
      expect(
        evaluateRecognitionPolicy({
          ...baseInput,
          displayedSeedAward: displayedSeedAward as 12,
        }),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    }
  });

  it('rejects recurrent standard work and acquisition without a displayed award', () => {
    expect(
      evaluateRecognitionPolicy({
        ...baseInput,
        recurrence: 'recurrent',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_REWARD_PAIRING' } });
    expect(
      evaluateRecognitionPolicy({
        ...baseInput,
        displayedSeedAward: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('keeps the accepted award identical when completion used permitted help', () => {
    const independent = evaluateRecognitionPolicy(baseInput);
    const withHelp = evaluateRecognitionPolicy({
      ...baseInput,
      completionMode: 'permitted_help',
    });

    expect(independent).toMatchObject({ ok: true, data: { seedAmount: 12 } });
    expect(withHelp).toMatchObject({ ok: true, data: { seedAmount: 12 } });
  });

  it('offers an unselected future-only phase review on exactly the third fade-first acquisition', () => {
    const input = {
      ...baseInput,
      recognitionMode: 'fade_first' as const,
      recurrence: 'recurrent' as const,
      displayedSeedAward: 8 as const,
    };

    expect(evaluateRecognitionPolicy({ ...input, confirmedAcquisitionCount: 2 })).toMatchObject({
      ok: true,
      data: { phaseReview: null },
    });
    expect(evaluateRecognitionPolicy({ ...input, confirmedAcquisitionCount: 3 })).toMatchObject({
      ok: true,
      data: {
        phaseReview: {
          confirmedAcquisitionCount: 3,
          options: ['keep_acquisition', 'move_future_to_maintenance'],
          selected: null,
          appliesTo: 'future_completions_only',
          reversibleByParent: true,
        },
      },
    });
    expect(evaluateRecognitionPolicy({ ...input, confirmedAcquisitionCount: 4 })).toMatchObject({
      ok: true,
      data: { phaseReview: null },
    });
  });

  it('returns the immutable receipt before validation or projection for a duplicate', () => {
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
          ...baseInput,
          recognitionMode: 'recognition_only',
          routinePhase: 'acquisition',
          existingReceipt: receipt,
        },
        { projectionPlanner },
      ),
    ).toEqual({
      ok: true,
      data: { disposition: 'already_confirmed', receipt },
    });
    expect(projectionPlanner).not.toHaveBeenCalled();
    expect(recognitionKeyForSubmission('submission_recycling_p0_1')).toBe(
      'recognition:submission_recycling_p0_1',
    );
  });

  it('persists the third recurrent fade-first count and a reversible future-only phase decision', () => {
    const submitted = createSubmittedP0Session();
    if (!submitted.journey) throw new Error('Expected submitted journey');
    const recurrentTemplate = TASK_TEMPLATES.find((template) => template.id === 'GI01');
    if (!recurrentTemplate) throw new Error('Expected the reviewed GI01 replacement fixture');
    const recurrentSubmittedJourney = {
      ...submitted.journey,
      task: {
        ...submitted.journey.task,
        version: 2,
        templateId: recurrentTemplate.id,
        acceptedGuideFixtureId: null,
        content: recurrentTemplate,
      },
      assignment: submitted.journey.assignment
        ? { ...submitted.journey.assignment, taskVersion: 2 }
        : null,
      submission: submitted.journey.submission
        ? { ...submitted.journey.submission, taskVersion: 2 }
        : null,
    };
    usePrototypeStore.getState().setRole('parent');
    expect(usePrototypeStore.getState().resetPrototype()).toMatchObject({ ok: true });
    usePrototypeStore.setState({
      ...submitted,
      role: 'parent',
      journey: recurrentSubmittedJourney,
      choicePool: {
        ...submitted.choicePool,
        p0AssignmentChoice: submitted.choicePool.p0AssignmentChoice
          ? {
              ...submitted.choicePool.p0AssignmentChoice,
              taskTemplateId: recurrentTemplate.id,
            }
          : null,
      },
      routineProgressByTask: {
        task_recycling_p0_v1: {
          taskId: 'task_recycling_p0_v1',
          confirmedAcquisitionCount: 2,
          futurePhase: 'acquisition',
          phaseReview: null,
          decision: null,
        },
      },
    });

    expect(
      usePrototypeStore.getState().confirmAndPresentPraise(
        {
          submissionId: 'submission_recycling_p0_v1_attempt_1',
          praise: {
            ar: 'فرزت المواد النظيفة وطلبت مساعدة شخص بالغ عند الشك.',
            en: 'You sorted the clean items and asked an adult for help when unsure.',
          },
          neutralObservation: null,
          uncertainty: null,
        },
        {
          actionId: 'phase-review-praise',
          source: 'parent_press',
          presentedAt: '2026-08-26T10:00:00.000Z',
        },
      ).ok,
    ).toBe(true);
    const recognized = usePrototypeStore.getState().applyRecognition({
      actionId: 'phase-review-recognition',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'phase-review-praise',
    });
    expect(recognized).toMatchObject({
      ok: true,
      data: {
        receipt: {
          phaseReview: {
            selected: null,
            appliesTo: 'future_completions_only',
            reversibleByParent: true,
          },
        },
      },
    });
    expect(usePrototypeStore.getState().routineProgressByTask.task_recycling_p0_v1).toMatchObject({
      confirmedAcquisitionCount: 3,
      futurePhase: 'acquisition',
      phaseReview: { selected: null },
      decision: null,
    });

    const countersAfterCurrentCompletion = {
      seeds: usePrototypeStore.getState().children.child_salem.earnedSeeds,
      mangrove: usePrototypeStore.getState().landscapeProgress.mangrove.cumulativeSeeds,
      canopy: usePrototypeStore.getState().household.combinedCanopy.contributionLeaves,
      circle: usePrototypeStore.getState().circleGoal.eligibleGreenActions,
    };
    expect(
      usePrototypeStore
        .getState()
        .applyRoutinePhaseDecision('task_recycling_p0_v1', 'move_future_to_maintenance'),
    ).toMatchObject({
      ok: true,
      data: {
        confirmedAcquisitionCount: 3,
        futurePhase: 'maintenance',
        decision: {
          selected: 'move_future_to_maintenance',
          appliesTo: 'future_completions_only',
          reversibleByParent: true,
        },
      },
    });
    expect({
      seeds: usePrototypeStore.getState().children.child_salem.earnedSeeds,
      mangrove: usePrototypeStore.getState().landscapeProgress.mangrove.cumulativeSeeds,
      canopy: usePrototypeStore.getState().household.combinedCanopy.contributionLeaves,
      circle: usePrototypeStore.getState().circleGoal.eligibleGreenActions,
    }).toEqual(countersAfterCurrentCompletion);

    const current = usePrototypeStore.getState();
    if (!recurrentSubmittedJourney.submission) throw new Error('Expected recurrent submission');
    usePrototypeStore.setState({
      journey: {
        ...recurrentSubmittedJourney,
        submission: {
          ...recurrentSubmittedJourney.submission,
          id: 'submission_recycling_p0_v1_attempt_2',
          attempt: 2,
        },
        checkIn: null,
      },
      confirmationPlan: null,
      lastRecognitionAttempt: null,
      celebration: { available: current.celebration.available, consumed: true },
    });
    expect(
      usePrototypeStore.getState().confirmAndPresentPraise(
        {
          submissionId: 'submission_recycling_p0_v1_attempt_2',
          praise: {
            ar: 'فرزت المواد النظيفة وطلبت مساعدة شخص بالغ عند الشك.',
            en: 'You sorted the clean items and asked an adult for help when unsure.',
          },
          neutralObservation: null,
          uncertainty: null,
        },
        {
          actionId: 'maintenance-future-praise',
          source: 'parent_press',
          presentedAt: '2026-08-26T10:10:00.000Z',
        },
      ).ok,
    ).toBe(true);
    expect(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'maintenance-future-recognition',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'maintenance-future-praise',
      }),
    ).toMatchObject({
      ok: true,
      data: {
        receipt: {
          seedTransaction: null,
          landscapeGrowth: null,
          canopyContribution: null,
        },
      },
    });
    expect({
      seeds: usePrototypeStore.getState().children.child_salem.earnedSeeds,
      mangrove: usePrototypeStore.getState().landscapeProgress.mangrove.cumulativeSeeds,
      canopy: usePrototypeStore.getState().household.combinedCanopy.contributionLeaves,
    }).toEqual({
      seeds: countersAfterCurrentCompletion.seeds,
      mangrove: countersAfterCurrentCompletion.mangrove,
      canopy: countersAfterCurrentCompletion.canopy,
    });
    expect(usePrototypeStore.getState().circleGoal.eligibleGreenActions).toBe(
      countersAfterCurrentCompletion.circle + 1,
    );
    expect(usePrototypeStore.getState().routineProgressByTask.task_recycling_p0_v1).toMatchObject({
      confirmedAcquisitionCount: 3,
      futurePhase: 'maintenance',
      decision: { selected: 'move_future_to_maintenance' },
    });

    expect(
      usePrototypeStore.getState().reverseRoutinePhaseDecision('task_recycling_p0_v1'),
    ).toMatchObject({
      ok: true,
      data: { futurePhase: 'acquisition', decision: null, phaseReview: { selected: null } },
    });
  });
});
