import { beforeEach, describe, expect, it, vi } from 'vitest';

import { constructApprovalReveal } from '../../src/features/rewards/approvalReveal';
import { createFamilyRewardRuntime } from '../../src/features/family-hub';
import { P0_SAFE_EQUIVALENT_TEMPLATE } from '../../src/features/tasks/demoContent';
import {
  applyRecognitionToPrivateLeague,
  createPrivateLeagueRecognitionRuntime,
} from '../../src/features/league/recognitionRuntime';
import { MANGROVE_ROOTS_LEARNING_PACKAGE } from '../../src/features/learning/mangroveLearning';
import {
  constructRevealBundle,
  createEmptyRevealBundleQueue,
} from '../../src/features/rewards/revealBundle';
import type { RecognitionReceipt } from '../../src/models/familyGrowth';
import type {
  CommittedRevealSourceReceipt,
  RevealBundleQueue,
} from '../../src/models/revealBundle';
import {
  PREPARED_PRAISE,
  createResetSourceSession,
  createSubmittedP0Session,
} from '../../src/services/mock/fixtures';
import { serviceRegistry } from '../../src/services';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  seedPrototypeStateForTest,
  createCatalogSubmittedStateForTest,
  taskPraiseForTest,
} from '../helpers/prototypeStore';

const PRAISE_ACTION = {
  actionId: 'r002b-reveal-parent-praise',
  source: 'parent_press' as const,
  presentedAt: '2026-09-05T10:00:00.000Z',
};

const RECOGNITION_ACTION = {
  actionId: 'r002b-reveal-parent-recognition',
  source: 'parent_press' as const,
  observedRenderState: 'praise_presented' as const,
  presentationActionId: PRAISE_ACTION.actionId,
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected success: ${JSON.stringify(result)}`);
  }
  return result.data;
}

function applyCanonicalRecognitionWithContext() {
  seedPrototypeStateForTest(createSubmittedP0Session());
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
  const beforeRecognition = usePrototypeStore.getState();
  const recognition = expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
  const afterRecognition = usePrototypeStore.getState();
  return { beforeRecognition, recognition, afterRecognition } as const;
}

function applyCanonicalRecognition() {
  return applyCanonicalRecognitionWithContext().recognition;
}

function canonicalApprovalProjectionInput() {
  const { beforeRecognition, recognition, afterRecognition } =
    applyCanonicalRecognitionWithContext();
  const plan = beforeRecognition.confirmationPlan;
  const leagueReceipt =
    afterRecognition.privateLeague.receiptsByRecognitionKey[recognition.receipt.recognitionKey];
  if (!plan || plan.renderState !== 'praise_presented' || !leagueReceipt) {
    throw new Error('Expected complete canonical approval authorities');
  }
  const priorAwardIds = new Set(
    beforeRecognition.growthJourney.achievementsByProfile.child_salem.awards.map(
      (award) => award.id,
    ),
  );
  const newlyEarnedBadgeIds =
    afterRecognition.growthJourney.achievementsByProfile.child_salem.awards
      .filter((award) => !priorAwardIds.has(award.id))
      .map((award) => award.badgeId);
  return {
    queue: beforeRecognition.revealBundleQueue,
    plan,
    recognition,
    previousSession: beforeRecognition,
    growthBefore: beforeRecognition.growthJourney,
    growthProjection: {
      disposition: 'projected' as const,
      runtime: afterRecognition.growthJourney,
      addedCreditIds: [],
      newlyEarnedBadgeIds,
      newlyReachedThresholds: [120],
    },
    familyRewardBefore: beforeRecognition.familyReward,
    familyRewardAfter: afterRecognition.familyReward,
    privateLeague: {
      disposition: 'applied' as const,
      runtime: afterRecognition.privateLeague,
      receipt: leagueReceipt,
    },
  };
}

function createRecognitionOnlySubmittedSession() {
  return createCatalogSubmittedStateForTest('FA02');
}

function stageRecognitionOnlyJourneyOverHistory() {
  const fixture = createRecognitionOnlySubmittedSession();
  seedPrototypeStateForTest(fixture);
  if (!fixture.journey.submission) throw new Error('Expected one recognition-only submission');
  return fixture.journey.submission.id;
}

function prepareHistoricalZeroSeedRecognition(_historicalLabel: string, actionPrefix: string) {
  const submissionId = stageRecognitionOnlyJourneyOverHistory();
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId,
      praise: taskPraiseForTest(),
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  const praiseAction = { ...PRAISE_ACTION, actionId: `${actionPrefix}-praise` };
  expectOk(usePrototypeStore.getState().markPraisePresented(praiseAction));
  return {
    ...RECOGNITION_ACTION,
    actionId: `${actionPrefix}-recognition`,
    presentationActionId: praiseAction.actionId,
  };
}

// Explicit historical authority fixture for existing badge allowlists.
// This is not a generated CE1 assignment or a supported repeated-task UI path.
function applyAdditionalGreenRecognition(
  submissionId: string,
  actionPrefix: string,
  presentedAt = '2026-09-05T11:00:00.000Z',
  taskOverride?: { readonly id: string; readonly version: number },
) {
  const fixture = createSubmittedP0Session();
  const journey = fixture.journey;
  if (!journey?.assignment || !journey.submission) {
    throw new Error('Expected one submitted Green journey');
  }
  const taskId = taskOverride?.id ?? `task-other-green-${actionPrefix}`;
  const taskVersion = taskOverride?.version ?? journey.task.version;
  const replacementContent =
    taskId === 'task_recycling_p0_v1' && taskVersion > 1
      ? P0_SAFE_EQUIVALENT_TEMPLATE
      : journey.task.content;
  const assignmentId =
    taskId === 'task_recycling_p0_v1'
      ? 'assignment_recycling_p0_v1'
      : `assignment-other-green-${actionPrefix}`;
  seedPrototypeStateForTest({
    activeAssignmentId: assignmentId,
    journey: {
      ...journey,
      task: {
        ...journey.task,
        id: taskId,
        version: taskVersion,
        templateId: replacementContent.id,
        content: replacementContent,
      },
      assignment: {
        ...journey.assignment,
        id: assignmentId,
        taskId,
        taskVersion,
      },
      submission: {
        ...journey.submission,
        id: submissionId,
        assignmentId,
        taskVersion,
      },
    },
    confirmationPlan: null,
    lastRecognitionAttempt: null,
    celebration: { available: false, consumed: false },
  });
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId,
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  const praiseAction = {
    ...PRAISE_ACTION,
    actionId: `${actionPrefix}-praise`,
    presentedAt,
  };
  expectOk(usePrototypeStore.getState().markPraisePresented(praiseAction));
  const recognitionAction = {
    ...RECOGNITION_ACTION,
    actionId: `${actionPrefix}-recognition`,
    presentationActionId: praiseAction.actionId,
  };
  const recognition = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));
  return { recognition, recognitionAction } as const;
}

function createMaintenanceSubmittedSession() {
  const session = createSubmittedP0Session();
  const journey = session.journey;
  if (!journey?.assignment) throw new Error('Expected one submitted maintenance-task journey');
  const taskId = 'task_maintenance_retry_v1';
  return {
    ...session,
    journey: {
      ...journey,
      task: {
        ...journey.task,
        id: taskId,
        templateId: taskId,
        content: {
          ...journey.task.content,
          id: taskId,
          recognitionMode: 'fade_first' as const,
          routinePhase: 'maintenance' as const,
          recurrence: 'recurrent' as const,
          displayedSeedAward: null,
        },
      },
      assignment: { ...journey.assignment, taskId },
    },
  };
}

function applyZeroSeedRecognition(
  session: ReturnType<
    typeof createRecognitionOnlySubmittedSession | typeof createMaintenanceSubmittedSession
  >,
  actionPrefix: string,
) {
  const submissionId = session.journey.submission?.id;
  if (!submissionId) throw new Error('Expected one zero-Seed submission');
  seedPrototypeStateForTest(session);
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId,
      praise: taskPraiseForTest(session.journey),
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  const praiseAction = { ...PRAISE_ACTION, actionId: `${actionPrefix}-praise` };
  expectOk(usePrototypeStore.getState().markPraisePresented(praiseAction));
  const recognitionAction = {
    ...RECOGNITION_ACTION,
    actionId: `${actionPrefix}-recognition`,
    presentationActionId: praiseAction.actionId,
  };
  const first = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));
  if (first.receipt.seedTransaction !== null) throw new Error('Expected a zero-Seed recognition');
  return { first, recognitionAction } as const;
}

function rekeyRecognitionProvenance(
  provenance: RecognitionReceipt['provenance'],
  recognitionKey: string,
): RecognitionReceipt['provenance'] {
  return {
    ...provenance,
    submissionId: recognitionKey.slice('recognition:'.length),
  };
}

function createRecurringSubmittedSession(priorCompletionCount: 1 | 2 | 3) {
  const session = createSubmittedP0Session();
  const journey = session.journey;
  if (!journey?.assignment || !journey.submission) {
    throw new Error('Expected one submitted recurring-task journey');
  }
  const taskId = `task_recurring_retry_${priorCompletionCount}_v1`;
  const assignmentId = `assignment_recurring_retry_${priorCompletionCount}_v1`;
  const submissionId = `submission_recurring_retry_${priorCompletionCount}_attempt_1`;
  return {
    ...session,
    activeAssignmentId: assignmentId,
    journey: {
      ...journey,
      task: {
        ...journey.task,
        id: taskId,
        templateId: taskId,
        content: {
          ...journey.task.content,
          id: taskId,
          recognitionMode: 'fade_first' as const,
          routinePhase: 'acquisition' as const,
          recurrence: 'recurrent' as const,
          displayedSeedAward: 8 as const,
        },
      },
      assignment: { ...journey.assignment, id: assignmentId, taskId },
      submission: { ...journey.submission, id: submissionId, assignmentId },
    },
    routineProgressByTask: {
      [taskId]: {
        taskId,
        confirmedAcquisitionCount: priorCompletionCount,
        futurePhase: 'acquisition' as const,
        phaseReview:
          priorCompletionCount === 3
            ? {
                taskId,
                confirmedAcquisitionCount: 3 as const,
                options: ['keep_acquisition', 'move_future_to_maintenance'] as const,
                selected: null,
                appliesTo: 'future_completions_only' as const,
                reversibleByParent: true as const,
              }
            : null,
        decision:
          priorCompletionCount === 3
            ? {
                selected: 'keep_acquisition' as const,
                futurePhase: 'acquisition' as const,
                appliesTo: 'future_completions_only' as const,
                reversibleByParent: true as const,
                decidedAt: PRAISE_ACTION.presentedAt,
              }
            : null,
      },
    },
  };
}

function applyRecurringRecognition(priorCompletionCount: 1 | 2 | 3) {
  const session = createRecurringSubmittedSession(priorCompletionCount);
  const submissionId = session.journey.submission.id;
  seedPrototypeStateForTest(session);
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId,
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  const praiseAction = {
    ...PRAISE_ACTION,
    actionId: `r002b-recurring-${priorCompletionCount}-praise`,
  };
  expectOk(usePrototypeStore.getState().markPraisePresented(praiseAction));
  const recognitionAction = {
    ...RECOGNITION_ACTION,
    actionId: `r002b-recurring-${priorCompletionCount}-recognition`,
    presentationActionId: praiseAction.actionId,
  };
  const first = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));
  return { first, recognitionAction, taskId: session.journey.task.id } as const;
}

function prepareCanonicalProviderResult() {
  seedPrototypeStateForTest(createSubmittedP0Session());
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
  const before = usePrototypeStore.getState();
  const plan = before.confirmationPlan;
  if (!plan || plan.renderState !== 'praise_presented') {
    throw new Error('Expected a presented canonical approval plan');
  }
  const genuine = serviceRegistry.recognition.applyRecognition(before, plan, RECOGNITION_ACTION);
  if (!genuine.ok || genuine.data.disposition !== 'applied') {
    throw new Error(`Expected genuine recognition: ${JSON.stringify(genuine)}`);
  }
  return { before, genuine } as const;
}

function expectApprovalStateUnchanged(before: ReturnType<typeof usePrototypeStore.getState>) {
  const after = usePrototypeStore.getState();
  expect(after.journey).toBe(before.journey);
  expect(after.children).toBe(before.children);
  expect(after.recognitionLedger).toBe(before.recognitionLedger);
  expect(after.growthJourney).toBe(before.growthJourney);
  expect(after.privateLeague).toBe(before.privateLeague);
  expect(after.familyReward).toBe(before.familyReward);
  expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  expect(after.approvalRevealCommitments).toBe(before.approvalRevealCommitments);
  expect(after.resetPrototype).toBe(before.resetPrototype);
}

async function prepareReplacementRecognition(
  decision: 'smaller' | 'safe_equivalent',
  submissionId = 'submission_recycling_p0_v1_attempt_1',
) {
  seedPrototypeStateForTest(createResetSourceSession('assigned'));
  await enterChildExperienceForTest('child_salem');
  expectOk(usePrototypeStore.getState().requestSmallerTask());
  await enterParentExperienceForTest();
  expectOk(usePrototypeStore.getState().resolvePreAcceptanceAdjustment({ decision }));
  await enterChildExperienceForTest('child_salem');
  expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('accept'));
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(usePrototypeStore.getState().startAssignment());
  expectOk(
    usePrototypeStore.getState().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: usePrototypeStore.getState().journey!.task.content.permittedHelp,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
  const submittedJourney = usePrototypeStore.getState().journey;
  if (!submittedJourney?.submission) throw new Error('Expected replacement submission');
  seedPrototypeStateForTest({
    journey: {
      ...submittedJourney,
      submission: { ...submittedJourney.submission, id: submissionId },
    },
  });
  await enterParentExperienceForTest();
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId,
      praise: taskPraiseForTest(),
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  const praiseAction = {
    actionId: `r002b-reveal-${decision}-praise`,
    source: 'parent_press' as const,
    presentedAt: PRAISE_ACTION.presentedAt,
  };
  expectOk(usePrototypeStore.getState().markPraisePresented(praiseAction));
  const recognitionAction = {
    ...RECOGNITION_ACTION,
    actionId: `r002b-reveal-${decision}-recognition`,
    presentationActionId: praiseAction.actionId,
  };
  const beforeRecognition = usePrototypeStore.getState();
  return { beforeRecognition, recognitionAction } as const;
}

async function applyReplacementRecognition(
  decision: 'smaller' | 'safe_equivalent',
  submissionId = 'submission_recycling_p0_v1_attempt_1',
) {
  const { beforeRecognition, recognitionAction } = await prepareReplacementRecognition(
    decision,
    submissionId,
  );
  const recognition = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));
  return { beforeRecognition, recognition, recognitionAction } as const;
}

function createRouteFixtureQueue(): RevealBundleQueue {
  const state = usePrototypeStore.getState();
  const profileId = state.activeChildId;
  const profileEpochId = state.growthJourney.ledgersByProfile[profileId].profileEpochId;
  const triggerEventId = 'recognition:test-only-complete-receipt-fixture';
  const triggeredAt = '2026-09-05T10:30:00.000Z';
  const praise: CommittedRevealSourceReceipt = {
    id: 'receipt:test-only:praise',
    authority: 'parent_check_in',
    profileId,
    profileEpochId,
    triggerEventId,
    triggerKind: 'task_approval',
    status: 'committed',
    committedAt: triggeredAt,
    consequence: {
      kind: 'parent_praise',
      checkInId: 'check-in:test-only',
      text: {
        ar: 'لاحظ ولي أمرك الخطوات التي أكملتها.',
        en: 'Your parent noticed the steps you completed.',
      },
    },
  };
  const constructed = constructRevealBundle({
    queue: createEmptyRevealBundleQueue(),
    profileId,
    profileEpochId,
    triggerEventId,
    triggerKind: 'task_approval',
    triggeredAt,
    receipts: [praise],
  });
  if (!constructed.ok || constructed.data.disposition !== 'created') {
    throw new Error('Expected a test-only route fixture queue');
  }
  return constructed.data.queue;
}

describe('R002b RevealBundle store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('starts empty and creates no result bundle for zero-reward submission', () => {
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);

    seedPrototypeStateForTest(createSubmittedP0Session());
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);
  });

  it.each([
    'not-a-date',
    '2026-09-31T10:00:00.000Z',
    '2026-09-05T10:00:00Z',
    '2026-09-05T14:00:00.000+04:00',
    '2026-08-26T09:30:00.000Z',
  ])('rejects the invalid praise-presentation time %s before state changes', (presentedAt) => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    const before = usePrototypeStore.getState();

    expect(
      usePrototypeStore.getState().markPraisePresented({ ...PRAISE_ACTION, presentedAt }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().confirmationPlan).toBe(before.confirmationPlan);
    expectApprovalStateUnchanged(before);
  });

  it('rejects malformed praise authority returned by the presentation provider', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    const before = usePrototypeStore.getState();
    const pendingPlan = before.confirmationPlan;
    if (!pendingPlan || pendingPlan.renderState !== 'confirmation_pending') {
      throw new Error('Expected pending praise authority');
    }
    const genuine = serviceRegistry.recognition.markPraisePresented(pendingPlan, PRAISE_ACTION);
    if (!genuine.ok) throw new Error(`Expected genuine presentation: ${JSON.stringify(genuine)}`);
    const forgedCheckIn = {
      ...genuine.data.checkIn,
      praisePresentedAt: '2026-02-30T10:00:00.000Z',
    };
    const forged = {
      ...genuine,
      data: {
        ...genuine.data,
        checkIn: forgedCheckIn,
        journey: { ...genuine.data.journey, checkIn: forgedCheckIn },
      },
    };
    const markSpy = vi
      .spyOn(serviceRegistry.recognition, 'markPraisePresented')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      markSpy.mockRestore();
    }
    expect(usePrototypeStore.getState().confirmationPlan).toBe(before.confirmationPlan);
    expectApprovalStateUnchanged(before);
  });

  it('isolates praise-plan input when its provider mutates data and fails', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    const before = usePrototypeStore.getState();
    const pendingPlan = before.confirmationPlan;
    if (!pendingPlan || pendingPlan.renderState !== 'confirmation_pending') {
      throw new Error('Expected pending praise authority');
    }
    const originalCreatedAt = pendingPlan.checkIn.createdAt;
    const markSpy = vi
      .spyOn(serviceRegistry.recognition, 'markPraisePresented')
      .mockImplementation((providerPlan) => {
        const mutableCheckIn = providerPlan.checkIn as { createdAt: string };
        mutableCheckIn.createdAt = '2026-02-30T09:38:00.000Z';
        return {
          ok: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Synthetic provider failure',
            retryable: false,
            fallbackAvailable: false,
          },
        };
      });

    try {
      expect(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      markSpy.mockRestore();
    }
    expect(pendingPlan.checkIn.createdAt).toBe(originalCreatedAt);
    expect(usePrototypeStore.getState().confirmationPlan).toBe(before.confirmationPlan);
    expectApprovalStateUnchanged(before);
  });

  it.each(['assignment', 'submission'] as const)(
    'rejects an impossible %s history time before planning confirmation',
    (authority) => {
      const session = createSubmittedP0Session();
      const journey = session.journey;
      if (!journey?.assignment || !journey.submission) {
        throw new Error('Expected a submitted journey timeline');
      }
      usePrototypeStore.setState({
        ...session,
        journey: {
          ...journey,
          assignment:
            authority === 'assignment'
              ? { ...journey.assignment, createdAt: '2026-02-30T09:20:00.000Z' }
              : journey.assignment,
          submission:
            authority === 'submission'
              ? { ...journey.submission, submittedAt: '2026-02-30T09:30:00.000Z' }
              : journey.submission,
        },
      });
      const before = usePrototypeStore.getState();

      expect(
        usePrototypeStore.getState().planConfirmation({
          submissionId: journey.submission.id,
          praise: PREPARED_PRAISE,
          neutralObservation: null,
          uncertainty: null,
        }),
      ).toMatchObject({ ok: false });
      expect(usePrototypeStore.getState().confirmationPlan).toBe(before.confirmationPlan);
      expectApprovalStateUnchanged(before);
    },
  );

  it('rejects an impossible persisted check-in time before calling recognition', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const current = usePrototypeStore.getState();
    const journey = current.journey;
    const plan = current.confirmationPlan;
    if (!journey?.checkIn || !plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented check-in timeline');
    }
    const checkIn = {
      ...journey.checkIn,
      createdAt: '2026-02-30T09:38:00.000Z',
      praisePresentedAt: plan.checkIn.praisePresentedAt,
    };
    const forgedJourney = { ...journey, checkIn };
    usePrototypeStore.setState({
      journey: forgedJourney,
      confirmationPlan: {
        ...plan,
        journey: forgedJourney,
        checkIn,
      },
    });
    const before = usePrototypeStore.getState();
    const applySpy = vi.spyOn(serviceRegistry.recognition, 'applyRecognition');

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      expect(applySpy).not.toHaveBeenCalled();
    } finally {
      applySpy.mockRestore();
    }
    expectApprovalStateUnchanged(before);
  });

  it('rejects resumed praise-presented state when its presentation time is missing', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const current = usePrototypeStore.getState();
    const journey = current.journey;
    if (!journey?.checkIn) throw new Error('Expected a presented check-in');
    const forgedJourney = {
      ...journey,
      checkIn: { ...journey.checkIn, praisePresentedAt: null },
    };
    usePrototypeStore.setState({ journey: forgedJourney });
    const before = usePrototypeStore.getState();

    expect(
      serviceRegistry.recognition.resolveCheckInState(
        before,
        'submission_recycling_p0_v1_attempt_1',
      ),
    ).toMatchObject({ ok: false });
    expect(
      usePrototypeStore.getState().restoreCheckInState('submission_recycling_p0_v1_attempt_1'),
    ).toMatchObject({ ok: false });
    expectApprovalStateUnchanged(before);
  });

  it('fails closed when a zero-Seed duplicate has no active Growth ledger', () => {
    const fixture = createRecognitionOnlySubmittedSession();
    seedPrototypeStateForTest(fixture);
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: fixture.journey.submission!.id,
        praise: taskPraiseForTest(fixture.journey),
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const first = expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
    expect(first.receipt.seedTransaction).toBeNull();

    const growthJourney = usePrototypeStore.getState().growthJourney;
    const ledgersByProfile = { ...growthJourney.ledgersByProfile };
    delete (ledgersByProfile as Partial<typeof ledgersByProfile>).child_salem;
    usePrototypeStore.setState({
      growthJourney: { ...growthJourney, ledgersByProfile },
    });

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('fails closed when zero-Seed recognition carries malformed private badge authority', () => {
    const growthJourney = usePrototypeStore.getState().growthJourney;
    const salemAchievements = growthJourney.achievementsByProfile.child_salem;
    const award = salemAchievements.awards[0];
    if (!award) throw new Error('Expected one opening Salem badge award');
    usePrototypeStore.setState({
      growthJourney: {
        ...growthJourney,
        achievementsByProfile: {
          ...growthJourney.achievementsByProfile,
          child_salem: {
            ...salemAchievements,
            awards: [{ ...award, private: false }, ...salemAchievements.awards.slice(1)],
          } as typeof salemAchievements,
        },
      },
    });
    const fixture = createRecognitionOnlySubmittedSession();
    seedPrototypeStateForTest(fixture);
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: fixture.journey.submission!.id,
        praise: taskPraiseForTest(fixture.journey),
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const beforeRecognition = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it.each(['missing_credits', 'missing_award', 'unearned_award'] as const)(
    'rejects a later zero-Seed approval when historical achievements have %s',
    (tamperKind) => {
      applyCanonicalRecognition();
      const committed = usePrototypeStore.getState();
      const growthJourney = committed.growthJourney;
      const achievements = growthJourney.achievementsByProfile.child_salem;
      const expandingShade = achievements.awards.find(
        (award) => award.badgeId === 'badge.journey.expanding_shade.v1',
      );
      if (!expandingShade) throw new Error('Expected the live Expanding Shade award');

      const nextAchievements =
        tamperKind === 'missing_credits'
          ? { ...achievements, acquisitionCredits: [] }
          : tamperKind === 'missing_award'
            ? {
                ...achievements,
                awards: achievements.awards.filter(
                  (award) => award.badgeId !== 'badge.journey.expanding_shade.v1',
                ),
              }
            : {
                ...achievements,
                awards: [
                  ...achievements.awards,
                  {
                    ...expandingShade,
                    id: `badge-award:${achievements.profileId}:${achievements.profileEpochId}:badge.journey.coastal_care.v1`,
                    badgeId: 'badge.journey.coastal_care.v1' as const,
                  },
                ],
              };
      usePrototypeStore.setState({
        growthJourney: {
          ...growthJourney,
          achievementsByProfile: {
            ...growthJourney.achievementsByProfile,
            child_salem: nextAchievements,
          },
        },
      });
      const action = prepareHistoricalZeroSeedRecognition(
        `submission-achievement-parity-${tamperKind}`,
        `achievement-parity-${tamperKind}`,
      );
      const beforeRecognition = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(action)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(beforeRecognition);
    },
  );

  it('rejects achievement evidence from an incomplete learning completion state', () => {
    applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const learning = committed.mangroveLearningByProfile.child_salem;
    const eventId = `learning-completion:${learning.profileId}:${learning.profileEpochId}:learning.mangrove_roots.v1`;
    usePrototypeStore.setState({
      mangroveLearningByProfile: {
        ...committed.mangroveLearningByProfile,
        child_salem: {
          ...learning,
          completion: {
            id: eventId,
            triggerEventId: eventId,
            profileId: learning.profileId,
            profileEpochId: learning.profileEpochId,
            learningId: 'learning.mangrove_roots.v1',
            route: 'story',
            status: 'committed',
            completedAt: '2026-09-05T10:30:00.000Z',
            completionCreditId: 'learning.mangrove_roots.v1',
            consequences: {
              seedDelta: 0,
              gardenGrowthDelta: 0,
              canopyContributionDelta: 0,
              greenCircleActionDelta: 0,
              privateLeagueLeafDelta: 0,
              challengeLeafDelta: 0,
              familyRewardProgressDelta: 0,
              masteryCreditIds: [],
              taskRecognitionIds: [],
            },
          },
        },
      },
    });
    const action = prepareHistoricalZeroSeedRecognition(
      'submission-incomplete-learning-authority',
      'incomplete-learning-authority',
    );
    const beforeRecognition = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(action)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it('returns a failure when learning achievement authority throws during inspection', () => {
    applyCanonicalRecognition();
    const action = prepareHistoricalZeroSeedRecognition(
      'submission-throwing-learning-authority',
      'throwing-learning-authority',
    );
    const current = usePrototypeStore.getState();
    const throwingLearning = new Proxy(current.mangroveLearningByProfile, {
      get() {
        throw new Error('Malformed learning authority');
      },
    });
    usePrototypeStore.setState({ mangroveLearningByProfile: throwingLearning });
    const beforeRecognition = usePrototypeStore.getState();
    let result: unknown;

    expect(() => {
      result = usePrototypeStore.getState().applyRecognition(action);
    }).not.toThrow();
    expect(result!).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it('rejects a live badge retargeted to a later valid Seed receipt', () => {
    const first = applyCanonicalRecognition();
    const second = applyAdditionalGreenRecognition(
      'submission-achievement-retarget-second',
      'achievement-retarget-second',
    ).recognition;
    const committed = usePrototypeStore.getState();
    const growthJourney = committed.growthJourney;
    const achievements = growthJourney.achievementsByProfile.child_salem;
    const secondEntry = growthJourney.ledgersByProfile.child_salem.entries.find(
      (entry) => entry.triggerEventId === second.receipt.recognitionKey,
    );
    if (!secondEntry?.committedAt) throw new Error('Expected the second committed Growth entry');
    usePrototypeStore.setState({
      growthJourney: {
        ...growthJourney,
        achievementsByProfile: {
          ...growthJourney.achievementsByProfile,
          child_salem: {
            ...achievements,
            awards: achievements.awards.map((award) =>
              award.badgeId === 'badge.journey.expanding_shade.v1'
                ? {
                    ...award,
                    sourceEventId: second.receipt.recognitionKey,
                    earnedAt: secondEntry.committedAt,
                  }
                : award,
            ),
          },
        },
      },
    });
    const action = prepareHistoricalZeroSeedRecognition(
      'submission-achievement-retarget-third',
      'achievement-retarget-third',
    );
    const beforeRecognition = usePrototypeStore.getState();

    expect(first.receipt.recognitionKey).not.toBe(second.receipt.recognitionKey);
    expect(usePrototypeStore.getState().applyRecognition(action)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it('uses commit order when learning happens between fixed-time task approvals', async () => {
    applyCanonicalRecognition();
    applyAdditionalGreenRecognition(
      'submission-learning-order-v2',
      'learning-order-v2',
      '2026-08-26T10:00:00.000Z',
      { id: 'task_recycling_p0_v1', version: 2 },
    );
    await enterChildExperienceForTest('child_salem');
    const origin = {
      kind: 'impact_path' as const,
      route: '/garden/impact-path' as const,
      profileId: 'child_salem' as const,
      focusTargetId: 'impact-path-learning-station-132' as const,
      scrollOffset: 0,
    };
    expectOk(usePrototypeStore.getState().startMangroveLearning('story', origin));
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
      expectOk(usePrototypeStore.getState().advanceMangroveLearning('story', stepId));
    }
    expectOk(
      usePrototypeStore.getState().answerMangroveLearningCheck('story', 'habitat_support_and_care'),
    );
    expectOk(
      usePrototypeStore.getState().completeMangroveLearning('story', '2026-09-05T12:30:00.000Z'),
    );
    await enterParentExperienceForTest();

    const third = applyAdditionalGreenRecognition(
      'submission-learning-order-v3',
      'learning-order-v3',
      '2026-08-26T10:10:00.000Z',
      { id: 'task_recycling_p0_v1', version: 3 },
    ).recognition;
    const mangroveCare = usePrototypeStore
      .getState()
      .growthJourney.achievementsByProfile.child_salem.awards.find(
        (award) => award.badgeId === 'badge.habitat.mangrove_care.v1',
      );

    expect(mangroveCare).toMatchObject({
      sourceEventId: third.receipt.recognitionKey,
      silentBackfill: false,
      permanent: true,
    });
  });

  it.each([
    ['first', 0],
    ['second', 1],
  ] as const)(
    'rejects a Mangrove Care award retargeted to the %s recognition before its criteria were met',
    async (_label, sourceIndex) => {
      const first = applyCanonicalRecognition();
      const second = applyAdditionalGreenRecognition(
        'submission-learning-retarget-v2',
        'learning-retarget-v2',
        '2026-08-26T10:00:00.000Z',
        { id: 'task_recycling_p0_v1', version: 2 },
      ).recognition;
      await enterChildExperienceForTest('child_salem');
      const origin = {
        kind: 'impact_path' as const,
        route: '/garden/impact-path' as const,
        profileId: 'child_salem' as const,
        focusTargetId: 'impact-path-learning-station-132' as const,
        scrollOffset: 0,
      };
      expectOk(usePrototypeStore.getState().startMangroveLearning('story', origin));
      for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
        expectOk(usePrototypeStore.getState().advanceMangroveLearning('story', stepId));
      }
      expectOk(
        usePrototypeStore
          .getState()
          .answerMangroveLearningCheck('story', 'habitat_support_and_care'),
      );
      expectOk(
        usePrototypeStore.getState().completeMangroveLearning('story', '2026-09-05T12:30:00.000Z'),
      );
      await enterParentExperienceForTest();
      applyAdditionalGreenRecognition(
        'submission-learning-retarget-v3',
        'learning-retarget-v3',
        '2026-08-26T10:10:00.000Z',
        { id: 'task_recycling_p0_v1', version: 3 },
      );

      const committed = usePrototypeStore.getState();
      const source = ([first, second] as const)[sourceIndex];
      if (!source) throw new Error('Expected the selected recognition result');
      const sourceEntry = committed.growthJourney.ledgersByProfile.child_salem.entries.find(
        (entry) => entry.triggerEventId === source.receipt.recognitionKey,
      );
      if (!sourceEntry?.committedAt) throw new Error('Expected the selected Growth entry');
      const achievements = committed.growthJourney.achievementsByProfile.child_salem;
      usePrototypeStore.setState({
        growthJourney: {
          ...committed.growthJourney,
          achievementsByProfile: {
            ...committed.growthJourney.achievementsByProfile,
            child_salem: {
              ...achievements,
              awards: achievements.awards.map((award) =>
                award.badgeId === 'badge.habitat.mangrove_care.v1'
                  ? {
                      ...award,
                      sourceEventId: source.receipt.recognitionKey,
                      earnedAt: sourceEntry.committedAt,
                    }
                  : award,
              ),
            },
          },
        },
      });
      const action = prepareHistoricalZeroSeedRecognition(
        `submission-learning-retarget-${sourceIndex}`,
        `learning-retarget-${sourceIndex}`,
      );
      const beforeRecognition = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(action)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(beforeRecognition);
    },
  );

  it('records cumulative Green Circle values after its goal is reached', () => {
    applyCanonicalRecognition();
    const { recognition } = applyAdditionalGreenRecognition(
      'submission-post-goal-green',
      'post-goal-green',
    );
    const state = usePrototypeStore.getState();
    const bundle = state.revealBundleQueue.bundles.find(
      (candidate) => candidate.triggerEventId === recognition.receipt.recognitionKey,
    );

    expect(state.household.combinedCanopy.contributionLeaves).toBe(21);
    expect(state.circleGoal.eligibleGreenActions).toBe(13);
    expect(bundle?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          consequence: expect.objectContaining({
            kind: 'canopy',
            leavesBefore: 20,
            leavesAfter: 21,
          }),
        }),
        expect.objectContaining({
          consequence: expect.objectContaining({
            kind: 'green_circle',
            actionsBefore: 12,
            actionsAfter: 13,
          }),
        }),
      ]),
    );
  });

  it('records cumulative Canopy values after its goal is reached', () => {
    applyCanonicalRecognition();
    for (let index = 1; index <= 5; index += 1) {
      applyAdditionalGreenRecognition(
        `submission-canopy-goal-${index}`,
        `canopy-goal-${index}`,
        `2026-09-05T${String(10 + index).padStart(2, '0')}:00:00.000Z`,
      );
    }
    const { recognition } = applyAdditionalGreenRecognition(
      'submission-canopy-post-goal',
      'canopy-post-goal',
      '2026-09-05T16:00:00.000Z',
    );
    const state = usePrototypeStore.getState();
    const bundle = state.revealBundleQueue.bundles.find(
      (candidate) => candidate.triggerEventId === recognition.receipt.recognitionKey,
    );

    expect(state.household.combinedCanopy.contributionLeaves).toBe(26);
    expect(bundle?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          consequence: expect.objectContaining({
            kind: 'canopy',
            leavesBefore: 25,
            leavesAfter: 26,
          }),
        }),
      ]),
    );
  });

  it.each([
    {
      label: 'Canopy contribution',
      patch: {
        canopyContribution: {
          actionKind: 'eligible_household_acquisition' as const,
          leafDelta: 1 as const,
          origin: 'synthetic' as const,
        },
      },
    },
    {
      label: 'Garden growth',
      patch: {
        landscapeGrowth: {
          landscapeId: 'mangrove' as const,
          seedsBefore: 48,
          seedsAfter: 52,
          stageBefore: 'shoot' as const,
          stageAfter: 'shoot' as const,
          crossedThreshold: null,
          symbolicOnly: true as const,
        },
      },
    },
    {
      label: 'phase review',
      patch: {
        phaseReview: {
          taskId: 'task_other_v1',
          confirmedAcquisitionCount: 3 as const,
          options: ['keep_acquisition', 'move_future_to_maintenance'] as const,
          selected: null,
          appliesTo: 'future_completions_only' as const,
          reversibleByParent: true as const,
        },
      },
    },
    {
      label: 'receipt envelope key',
      patch: { extraAuthority: true },
    },
  ])('rejects a recognition-only retry with forged $label', ({ patch }) => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createRecognitionOnlySubmittedSession(),
      'r002b-recognition-only-forgery',
    );
    const committed = usePrototypeStore.getState();
    const receipt = { ...first.receipt, ...patch };
    usePrototypeStore.setState({
      recognitionLedger: {
        ...committed.recognitionLedger,
        [receipt.recognitionKey]: receipt,
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('keeps an exact maintenance retry and rejects its forged phase review', () => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createMaintenanceSubmittedSession(),
      'r002b-maintenance-forgery',
    );
    expect(
      expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction)).disposition,
    ).toBe('already_confirmed');

    const committed = usePrototypeStore.getState();
    const receipt = {
      ...first.receipt,
      phaseReview: {
        taskId: first.journey.task.id,
        confirmedAcquisitionCount: 3 as const,
        options: ['keep_acquisition', 'move_future_to_maintenance'] as const,
        selected: null,
        appliesTo: 'future_completions_only' as const,
        reversibleByParent: true as const,
      },
    };
    usePrototypeStore.setState({
      recognitionLedger: {
        ...committed.recognitionLedger,
        [receipt.recognitionKey]: receipt,
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('queues every committed consequence from the canonical Parent approval', () => {
    const recognition = applyCanonicalRecognition();
    const state = usePrototypeStore.getState();
    const bundle = state.revealBundleQueue.bundles[0];

    expect(recognition.disposition).toBe('applied');
    expect(state.children.child_salem.earnedSeeds).toBe(60);
    expect(state.celebration.available).toBe(true);
    expect(state.celebration.consumed).toBe(false);
    expect(state.revealBundleQueue.bundles).toHaveLength(1);
    expect(bundle).toMatchObject({
      id: 'reveal:child_salem:recognition:submission_recycling_p0_v1_attempt_1',
      profileId: 'child_salem',
      triggerEventId: recognition.receipt.recognitionKey,
      triggerKind: 'task_approval',
      lifecycle: 'ready',
      triggeredAt: PRAISE_ACTION.presentedAt,
    });
    expect(bundle?.items.map((item) => item.consequence.kind)).toEqual([
      'parent_praise',
      'seed',
      'plant_stage',
      'canopy',
      'green_circle',
      'private_league_leaf',
      'challenge_leaf',
      'private_family_reward',
      'earned_badge',
      'earned_badge',
      'impact_path_station',
      'safe_help',
    ]);
    expect(bundle?.items.map((item) => item.consequence)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'seed', before: 108, after: 120, delta: 12 }),
        expect.objectContaining({
          kind: 'plant_stage',
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
        }),
        expect.objectContaining({ kind: 'canopy', leavesBefore: 19, leavesAfter: 20 }),
        expect.objectContaining({ kind: 'green_circle', actionsBefore: 11, actionsAfter: 12 }),
        expect.objectContaining({
          kind: 'private_league_leaf',
          confirmedLeavesBefore: 4,
          confirmedLeavesAfter: 5,
        }),
        expect.objectContaining({
          kind: 'challenge_leaf',
          recognitionKey: recognition.receipt.recognitionKey,
          state: 'confirmed',
        }),
        expect.objectContaining({
          kind: 'private_family_reward',
          planId: 'family-reward-salem-september-v1',
          planVersion: 1,
          lifecycleBefore: 'promised',
          lifecycleAfter: 'unlocked',
        }),
        expect.objectContaining({
          kind: 'impact_path_station',
          threshold: 120,
          result: 'archive_mangrove_and_earn_expanding_shade',
        }),
        expect.objectContaining({
          kind: 'safe_help',
          helpKind: 'permitted_help',
          recognized: true,
        }),
      ]),
    );
    expect(
      bundle?.items.flatMap((item) =>
        item.consequence.kind === 'earned_badge' ? [item.consequence.badgeId] : [],
      ),
    ).toEqual(['badge.journey.expanding_shade.v1', 'badge.skill.sorting.bud.v1']);
    expect(bundle?.items.some((item) => item.consequence.kind === 'unlocked_learning')).toBe(false);
    expect(
      state.privateLeague.receiptsByRecognitionKey[recognition.receipt.recognitionKey],
    ).toEqual(
      expect.objectContaining({
        profileId: 'child_salem',
        profileEpochId: state.growthJourney.ledgersByProfile.child_salem.profileEpochId,
        confirmedLeavesBefore: 4,
        confirmedLeavesAfter: 5,
        status: 'committed',
      }),
    );
  });

  it('rejects a canonical approval bundle without its applicable Family Reward unlock', () => {
    const input = canonicalApprovalProjectionInput();

    expect(
      constructApprovalReveal({
        ...input,
        familyRewardAfter: input.familyRewardBefore,
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it('rejects a canonical approval bundle without its reached Impact Path station', () => {
    const input = canonicalApprovalProjectionInput();

    expect(
      constructApprovalReveal({
        ...input,
        growthProjection: { ...input.growthProjection, newlyReachedThresholds: [] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it('keeps the same approval consequences on an exact recognition retry', () => {
    const first = applyCanonicalRecognition();
    const queue = usePrototypeStore.getState().revealBundleQueue;

    const repeated = expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));

    expect(first.disposition).toBe('applied');
    expect(repeated.disposition).toBe('already_confirmed');
    expect(repeated.receipt).toEqual(first.receipt);
    expect(usePrototypeStore.getState().revealBundleQueue).toBe(queue);
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toHaveLength(1);
  });

  it.each([1, 2] as const)(
    'keeps a recurring approval retry exact after prior completion count %s',
    (priorCompletionCount) => {
      const { first, recognitionAction } = applyRecurringRecognition(priorCompletionCount);
      const queue = usePrototypeStore.getState().revealBundleQueue;

      const repeated = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));

      expect(first.disposition).toBe('applied');
      expect(repeated.disposition).toBe('already_confirmed');
      expect(repeated.receipt).toEqual(first.receipt);
      expect(usePrototypeStore.getState().revealBundleQueue).toBe(queue);
    },
  );

  it('keeps a third-acquisition retry exact after choosing future maintenance', () => {
    const { first, recognitionAction, taskId } = applyRecurringRecognition(2);
    expect(first.receipt.phaseReview).not.toBeNull();
    expectOk(
      usePrototypeStore.getState().applyRoutinePhaseDecision(taskId, 'move_future_to_maintenance'),
    );
    const queue = usePrototypeStore.getState().revealBundleQueue;

    const repeated = expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));

    expect(repeated.disposition).toBe('already_confirmed');
    expect(repeated.receipt).toEqual(first.receipt);
    expect(usePrototypeStore.getState().routineProgressByTask[taskId]).toMatchObject({
      confirmedAcquisitionCount: 3,
      futurePhase: 'maintenance',
      decision: { selected: 'move_future_to_maintenance' },
    });
    expect(usePrototypeStore.getState().revealBundleQueue).toBe(queue);
  });

  it('rejects a zero-Seed downgrade when the same recognition has Growth evidence', () => {
    const { first, recognitionAction } = applyRecurringRecognition(3);
    expect(first.receipt.seedTransaction).not.toBeNull();
    expect(first.receipt.phaseReview).toBeNull();
    const committed = usePrototypeStore.getState();
    const downgradedReceipt = {
      ...first.receipt,
      seedTransaction: null,
      landscapeGrowth: null,
      canopyContribution: null,
      phaseReview: null,
    };
    usePrototypeStore.setState({
      recognitionLedger: {
        ...committed.recognitionLedger,
        [downgradedReceipt.recognitionKey]: downgradedReceipt,
      },
      revealBundleQueue: createEmptyRevealBundleQueue(),
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects a historical zero-Seed receipt carrying persistent canopy growth', () => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createRecognitionOnlySubmittedSession(),
      'r002b-historical-zero-canopy',
    );
    const committed = usePrototypeStore.getState();
    const historicalRecognitionKey = 'recognition:historical-zero-canopy';
    usePrototypeStore.setState({
      household: {
        ...committed.household,
        combinedCanopy: {
          ...committed.household.combinedCanopy,
          contributionLeaves: committed.household.combinedCanopy.contributionLeaves + 1,
        },
      },
      recognitionLedger: {
        ...committed.recognitionLedger,
        [historicalRecognitionKey]: {
          recognitionKey: historicalRecognitionKey,
          checkInId: 'check-in-historical-zero-canopy',
          provenance: rekeyRecognitionProvenance(
            first.receipt.provenance,
            historicalRecognitionKey,
          ),
          seedTransaction: null,
          landscapeGrowth: null,
          canopyContribution: {
            actionKind: 'eligible_household_acquisition',
            leafDelta: 1,
            origin: 'synthetic',
          },
          circleEvent: null,
          phaseReview: null,
        },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects a historical zero-Seed receipt carrying a phase review', () => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createRecognitionOnlySubmittedSession(),
      'r002b-historical-zero-phase-review',
    );
    const committed = usePrototypeStore.getState();
    const historicalRecognitionKey = 'recognition:historical-zero-phase-review';
    usePrototypeStore.setState({
      recognitionLedger: {
        ...committed.recognitionLedger,
        [historicalRecognitionKey]: {
          recognitionKey: historicalRecognitionKey,
          checkInId: 'check-in-historical-zero-phase-review',
          provenance: rekeyRecognitionProvenance(
            first.receipt.provenance,
            historicalRecognitionKey,
          ),
          seedTransaction: null,
          landscapeGrowth: null,
          canopyContribution: null,
          circleEvent: null,
          phaseReview: {
            taskId: 'task-forged-review',
            confirmedAcquisitionCount: 3,
            options: ['keep_acquisition', 'move_future_to_maintenance'],
            selected: null,
            appliesTo: 'future_completions_only',
            reversibleByParent: true,
          },
        },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects an unverifiable historical zero-Seed Circle event', () => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createRecognitionOnlySubmittedSession(),
      'r002b-historical-zero-circle',
    );
    const committed = usePrototypeStore.getState();
    const historicalRecognitionKey = 'recognition:historical-zero-circle';
    usePrototypeStore.setState({
      circleGoal: { eligibleGreenActions: 12, goal: 12, origin: 'synthetic_local' },
      recognitionLedger: {
        ...committed.recognitionLedger,
        [historicalRecognitionKey]: {
          recognitionKey: historicalRecognitionKey,
          checkInId: 'check-in-historical-zero-circle',
          provenance: rekeyRecognitionProvenance(
            first.receipt.provenance,
            historicalRecognitionKey,
          ),
          seedTransaction: null,
          landscapeGrowth: null,
          canopyContribution: null,
          circleEvent: {
            actionKind: 'eligible_green_action',
            actionDelta: 1,
            sourceScope: 'household',
            origin: 'synthetic_local',
          },
          phaseReview: null,
        },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects a historical Seed receipt without matching Growth evidence', () => {
    const { first, recognitionAction } = applyZeroSeedRecognition(
      createRecognitionOnlySubmittedSession(),
      'r002b-historical-seed-without-growth',
    );
    const committed = usePrototypeStore.getState();
    const historicalRecognitionKey = 'recognition:historical-forged-seed';
    usePrototypeStore.setState({
      household: {
        ...committed.household,
        combinedCanopy: { contributionLeaves: 20, goalLeaves: 25 },
      },
      children: {
        ...committed.children,
        child_salem: { ...committed.children.child_salem, earnedSeeds: 60 },
      },
      landscapeProgress: {
        ...committed.landscapeProgress,
        mangrove: {
          landscapeId: 'mangrove',
          cumulativeSeeds: 60,
          stage: 'sapling',
          nextThreshold: 120,
        },
      },
      circleGoal: { eligibleGreenActions: 12, goal: 12, origin: 'synthetic_local' },
      recognitionLedger: {
        ...committed.recognitionLedger,
        [historicalRecognitionKey]: {
          recognitionKey: historicalRecognitionKey,
          checkInId: 'check-in-historical-forged-seed',
          provenance: rekeyRecognitionProvenance(
            first.receipt.provenance,
            historicalRecognitionKey,
          ),
          seedTransaction: {
            id: 'seed_transaction_historical-forged-seed',
            recognitionKey: historicalRecognitionKey,
            childId: 'child_salem',
            amount: 12,
            balanceBefore: 48,
            balanceAfter: 60,
            meaning: 'symbolic_nonfinancial',
          },
          landscapeGrowth: {
            landscapeId: 'mangrove',
            seedsBefore: 48,
            seedsAfter: 60,
            stageBefore: 'shoot',
            stageAfter: 'sapling',
            crossedThreshold: 60,
            symbolicOnly: true,
          },
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
          phaseReview: null,
        },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it.each([
    {
      label: 'an unsafe completion count',
      patch: { confirmedAcquisitionCount: Number.MAX_SAFE_INTEGER + 1 },
    },
    {
      label: 'maintenance without a Parent decision',
      patch: { futurePhase: 'maintenance' as const },
    },
    {
      label: 'a malformed Parent decision',
      patch: {
        decision: {
          selected: 'move_future_to_maintenance' as const,
          futurePhase: 'acquisition' as const,
          appliesTo: 'future_completions_only' as const,
          reversibleByParent: true as const,
          decidedAt: PRAISE_ACTION.presentedAt,
        },
      },
    },
  ])('rejects a retry carrying $label in routine authority', ({ patch }) => {
    const { recognitionAction, taskId } = applyRecurringRecognition(1);
    const committed = usePrototypeStore.getState();
    const progress = committed.routineProgressByTask[taskId];
    if (!progress) throw new Error('Expected committed recurring progress');
    usePrototypeStore.setState({
      routineProgressByTask: {
        ...committed.routineProgressByTask,
        [taskId]: { ...progress, ...patch },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it.each(['family_reward', 'private_league', 'reveal_bundle'] as const)(
    'rejects a recognition retry when its %s authority was reset',
    (authority) => {
      applyCanonicalRecognition();
      const committed = usePrototypeStore.getState();
      const profileEpochId = committed.growthJourney.ledgersByProfile.child_salem.profileEpochId;
      if (authority === 'family_reward') {
        usePrototypeStore.setState({ familyReward: createFamilyRewardRuntime() });
      } else if (authority === 'private_league') {
        usePrototypeStore.setState({
          privateLeague: createPrivateLeagueRecognitionRuntime({ profileEpochId }),
        });
      } else {
        usePrototypeStore.setState({ revealBundleQueue: createEmptyRevealBundleQueue() });
      }
      const inconsistent = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(inconsistent);
    },
  );

  it.each(['commitment', 'bundle'] as const)(
    'rejects a recognition retry when its approval %s is missing',
    (authority) => {
      const recognition = applyCanonicalRecognition();
      if (authority === 'commitment') {
        usePrototypeStore.setState({ approvalRevealCommitments: {} });
      } else {
        usePrototypeStore.setState({ revealBundleQueue: createEmptyRevealBundleQueue() });
      }
      const inconsistent = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expect(inconsistent.recognitionLedger[recognition.receipt.recognitionKey]).toBeDefined();
      expectApprovalStateUnchanged(inconsistent);
    },
  );

  it.each(['family_reward', 'private_league', 'approval_bundle'] as const)(
    'rejects a later zero-Seed retry after historical %s authority is removed',
    (authority) => {
      applyCanonicalRecognition();
      const action = prepareHistoricalZeroSeedRecognition(
        `submission-secondary-history-${authority}`,
        `secondary-history-${authority}`,
      );
      expectOk(usePrototypeStore.getState().applyRecognition(action));
      const committed = usePrototypeStore.getState();
      const profileEpochId = committed.growthJourney.ledgersByProfile.child_salem.profileEpochId;
      if (authority === 'family_reward') {
        usePrototypeStore.setState({ familyReward: createFamilyRewardRuntime() });
      } else if (authority === 'private_league') {
        usePrototypeStore.setState({
          privateLeague: createPrivateLeagueRecognitionRuntime({ profileEpochId }),
        });
      } else {
        usePrototypeStore.setState({ revealBundleQueue: createEmptyRevealBundleQueue() });
      }
      const inconsistent = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(action)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expect(Object.keys(inconsistent.recognitionLedger)).toHaveLength(2);
      expectApprovalStateUnchanged(inconsistent);
    },
  );

  it('clears approval Reveal commitments with the deterministic prototype reset', () => {
    applyCanonicalRecognition();
    expect(Object.keys(usePrototypeStore.getState().approvalRevealCommitments)).toHaveLength(1);

    expectOk(usePrototypeStore.getState().resetPrototype());

    expect(usePrototypeStore.getState().approvalRevealCommitments).toEqual({});
  });

  it('rejects a recognition retry with hidden Family Reward authority data', () => {
    applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    usePrototypeStore.setState({
      familyReward: {
        ...committed.familyReward,
        hiddenAuthority: undefined,
      } as typeof committed.familyReward,
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('returns a failure when Family Reward authority throws during inspection', () => {
    applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const familyReward = new Proxy(
      { ...committed.familyReward, targetEligibleSeeds: 121 },
      {
        get(target, property, receiver) {
          if (property === 'plan') throw new Error('Malformed Family Reward authority');
          return Reflect.get(target, property, receiver);
        },
      },
    ) as unknown as typeof committed.familyReward;
    usePrototypeStore.setState({ familyReward });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it.each(['growth', 'private_league', 'reveal_queue'] as const)(
    'returns a failure for a malformed %s runtime root',
    (authority) => {
      applyCanonicalRecognition();
      const committed = usePrototypeStore.getState();
      if (authority === 'growth') {
        usePrototypeStore.setState({
          growthJourney: {
            ...committed.growthJourney,
            ledgersByProfile: null,
          } as unknown as typeof committed.growthJourney,
        });
      } else if (authority === 'private_league') {
        usePrototypeStore.setState({
          privateLeague: {
            ...committed.privateLeague,
            receiptsByRecognitionKey: null,
          } as unknown as typeof committed.privateLeague,
        });
      } else {
        usePrototypeStore.setState({
          revealBundleQueue: {
            ...committed.revealBundleQueue,
            bundles: null,
          } as unknown as typeof committed.revealBundleQueue,
        });
      }
      const inconsistent = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(inconsistent);
    },
  );

  it.each([
    ['enumerable', true],
    ['hidden', false],
  ] as const)('rejects a recognition retry with %s Growth authority data', (_label, enumerable) => {
    applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const growthJourney = { ...committed.growthJourney };
    Object.defineProperty(growthJourney, 'unexpectedAuthority', {
      value: undefined,
      enumerable,
      configurable: true,
    });
    usePrototypeStore.setState({
      growthJourney: growthJourney as typeof committed.growthJourney,
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it.each(['migration', 'recognition_entry'] as const)(
    'rejects impossible %s time in committed Growth authority',
    (authority) => {
      const recognition = applyCanonicalRecognition();
      const committed = usePrototypeStore.getState();
      const salemLedger = committed.growthJourney.ledgersByProfile.child_salem;
      const entries = salemLedger.entries.map((entry) =>
        authority === 'recognition_entry' &&
        entry.triggerEventId === recognition.receipt.recognitionKey
          ? { ...entry, committedAt: '2026-02-30T10:00:00.000Z' }
          : entry,
      );
      const migrationReceipts = salemLedger.migrationReceipts.map((receipt, index) =>
        authority === 'migration' && index === 0
          ? { ...receipt, appliedAt: '2026-02-30T08:00:00.000Z' }
          : receipt,
      );
      usePrototypeStore.setState({
        growthJourney: {
          ...committed.growthJourney,
          ledgersByProfile: {
            ...committed.growthJourney.ledgersByProfile,
            child_salem: { ...salemLedger, entries, migrationReceipts },
          },
        },
      });
      const inconsistent = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(inconsistent);
    },
  );

  it('rejects a recognition retry with hidden private League authority data', () => {
    const recognition = applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const recognitionKey = recognition.receipt.recognitionKey;
    const committedLeagueReceipt = committed.privateLeague.receiptsByRecognitionKey[recognitionKey];
    if (!committedLeagueReceipt) throw new Error('Expected the committed private League receipt');
    const leagueReceipt = { ...committedLeagueReceipt };
    Object.defineProperty(leagueReceipt, 'hiddenAuthority', {
      value: true,
      enumerable: false,
      configurable: true,
    });
    usePrototypeStore.setState({
      privateLeague: {
        ...committed.privateLeague,
        receiptsByRecognitionKey: { [recognitionKey]: leagueReceipt },
      },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects a recognition retry with a hidden private League receipt-map entry', () => {
    const recognition = applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const recognitionKey = recognition.receipt.recognitionKey;
    const committedLeagueReceipt = committed.privateLeague.receiptsByRecognitionKey[recognitionKey];
    if (!committedLeagueReceipt) throw new Error('Expected the committed private League receipt');
    const receiptsByRecognitionKey = { [recognitionKey]: committedLeagueReceipt };
    Object.defineProperty(receiptsByRecognitionKey, 'recognition:hidden-authority', {
      value: committedLeagueReceipt,
      enumerable: false,
      configurable: true,
    });
    usePrototypeStore.setState({
      privateLeague: { ...committed.privateLeague, receiptsByRecognitionKey },
    });
    const inconsistent = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(inconsistent);
  });

  it('rejects hidden queue, bundle, and source-receipt authority data on retry', () => {
    applyCanonicalRecognition();
    const committed = usePrototypeStore.getState();
    const validQueue = committed.revealBundleQueue;
    const validBundle = validQueue.bundles[0];
    const validReceipt = validBundle?.items[0];
    if (!validBundle || !validReceipt) throw new Error('Expected one committed approval bundle');

    const withHidden = <T extends object>(value: T): T => {
      Object.defineProperty(value, 'hiddenAuthority', {
        value: true,
        enumerable: false,
        configurable: true,
      });
      return value;
    };
    const malformedQueues: readonly (readonly [string, RevealBundleQueue])[] = [
      ['queue', withHidden({ ...validQueue })],
      ['bundle', { ...validQueue, bundles: [withHidden({ ...validBundle })] }],
      [
        'source receipt',
        {
          ...validQueue,
          bundles: [
            {
              ...validBundle,
              items: [withHidden({ ...validReceipt }), ...validBundle.items.slice(1)],
            },
          ],
        },
      ],
    ];

    for (const [label, queue] of malformedQueues) {
      usePrototypeStore.setState({ revealBundleQueue: queue });
      const inconsistent = usePrototypeStore.getState();
      expect(
        usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION),
        label,
      ).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
      expectApprovalStateUnchanged(inconsistent);
    }
  });

  it.each([
    {
      decision: 'smaller' as const,
      expectedKinds: [
        'parent_praise',
        'seed',
        'plant_stage',
        'canopy',
        'green_circle',
        'earned_badge',
        'safe_help',
      ],
      seedAfter: 116,
      trackAfter: 56,
      stageAfter: 'shoot',
    },
    {
      decision: 'safe_equivalent' as const,
      expectedKinds: [
        'parent_praise',
        'seed',
        'plant_stage',
        'canopy',
        'green_circle',
        'earned_badge',
        'earned_badge',
        'impact_path_station',
        'safe_help',
      ],
      seedAfter: 120,
      trackAfter: 60,
      stageAfter: 'sapling',
    },
  ])(
    'queues only the consequences committed by the approved $decision replacement',
    async ({ decision, expectedKinds, seedAfter, trackAfter, stageAfter }) => {
      const { recognition, recognitionAction } = await applyReplacementRecognition(decision);
      const state = usePrototypeStore.getState();
      const queue = state.revealBundleQueue;
      const bundle = queue.bundles[0];

      expect(recognition).toMatchObject({
        disposition: 'applied',
        journey: { task: { version: 2 } },
      });
      expect(bundle?.items.map((item) => item.consequence.kind)).toEqual(expectedKinds);
      expect(bundle?.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            consequence: expect.objectContaining({
              kind: 'seed',
              after: seedAfter,
            }),
          }),
          expect.objectContaining({
            consequence: expect.objectContaining({
              kind: 'plant_stage',
              seedsAfter: trackAfter,
              stageAfter,
            }),
          }),
        ]),
      );
      expect(
        bundle?.items.some((item) =>
          [
            'private_league_leaf',
            'challenge_leaf',
            'private_family_reward',
            'unlocked_learning',
          ].includes(item.consequence.kind),
        ),
      ).toBe(false);
      expect(state.privateLeague.challengeLeaf.state).toBe('assigned');
      expect(state.familyReward.plan.lifecycle).toBe('promised');

      expectOk(usePrototypeStore.getState().applyRecognition(recognitionAction));
      expect(usePrototypeStore.getState().revealBundleQueue).toBe(queue);
    },
  );

  it('keeps an existing reward unlock outside a later ineligible seeded approval', async () => {
    applyCanonicalRecognition();
    const unlockedReward = usePrototypeStore.getState().familyReward;
    expect(unlockedReward.plan.lifecycle).toBe('unlocked');

    expectOk(resetPrototypeForTest());
    usePrototypeStore.setState({ familyReward: unlockedReward });
    const { recognition } = await applyReplacementRecognition(
      'smaller',
      'submission_recycling_p0_v2_attempt_2',
    );
    const state = usePrototypeStore.getState();

    expect(recognition.journey.task.version).toBe(2);
    expect(state.familyReward).toBe(unlockedReward);
    expect(
      state.revealBundleQueue.bundles[0]?.items.some(
        (item) => item.consequence.kind === 'private_family_reward',
      ),
    ).toBe(false);
  });

  it('rejects an ineligible task version colliding with a committed League key', async () => {
    applyCanonicalRecognition();
    const committedLeague = usePrototypeStore.getState().privateLeague;

    expectOk(resetPrototypeForTest());
    usePrototypeStore.setState({ privateLeague: committedLeague });
    const { recognitionAction } = await prepareReplacementRecognition('smaller');
    const beforeRecognition = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it('rejects an undefined private League receipt-key collision', async () => {
    const privateLeague = usePrototypeStore.getState().privateLeague;
    const recognitionKey = 'recognition:submission_recycling_p0_v1_attempt_1';
    usePrototypeStore.setState({
      privateLeague: {
        ...privateLeague,
        receiptsByRecognitionKey: { [recognitionKey]: undefined },
      } as unknown as typeof privateLeague,
    });
    const { recognitionAction } = await prepareReplacementRecognition('smaller');
    const beforeRecognition = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(recognitionAction)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expectApprovalStateUnchanged(beforeRecognition);
  });

  it('rejects a same-stage Seed approval without its Garden growth consequence', async () => {
    const { beforeRecognition, recognition } = await applyReplacementRecognition('smaller');
    const afterRecognition = usePrototypeStore.getState();
    const plan = beforeRecognition.confirmationPlan;
    const growth = recognition.receipt.landscapeGrowth;
    if (!plan || plan.renderState !== 'praise_presented' || !growth) {
      throw new Error('Expected a prepared smaller-task Garden recognition');
    }
    const receipt = { ...recognition.receipt, landscapeGrowth: null };
    const forgedRecognition = {
      ...recognition,
      receipt,
      session: {
        ...recognition.session,
        recognitionLedger: {
          ...recognition.session.recognitionLedger,
          [receipt.recognitionKey]: receipt,
        },
      },
    };
    const priorAwardIds = new Set(
      beforeRecognition.growthJourney.achievementsByProfile.child_salem.awards.map(
        (award) => award.id,
      ),
    );
    const newlyEarnedBadgeIds =
      afterRecognition.growthJourney.achievementsByProfile.child_salem.awards
        .filter((award) => !priorAwardIds.has(award.id))
        .map((award) => award.badgeId);

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition: forgedRecognition,
        previousSession: beforeRecognition,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: afterRecognition.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds,
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: afterRecognition.familyReward,
        privateLeague: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it('rejects an eligible Green approval without its Canopy and Circle consequences', async () => {
    const { beforeRecognition, recognition } = await applyReplacementRecognition('smaller');
    const afterRecognition = usePrototypeStore.getState();
    const plan = beforeRecognition.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a prepared smaller-task recognition');
    }
    const receipt = {
      ...recognition.receipt,
      canopyContribution: null,
      circleEvent: null,
    };
    const forgedRecognition = {
      ...recognition,
      receipt,
      session: {
        ...recognition.session,
        household: beforeRecognition.household,
        circleGoal: beforeRecognition.circleGoal,
        recognitionLedger: {
          ...recognition.session.recognitionLedger,
          [receipt.recognitionKey]: receipt,
        },
      },
    };
    const priorAwardIds = new Set(
      beforeRecognition.growthJourney.achievementsByProfile.child_salem.awards.map(
        (award) => award.id,
      ),
    );
    const newlyEarnedBadgeIds =
      afterRecognition.growthJourney.achievementsByProfile.child_salem.awards
        .filter((award) => !priorAwardIds.has(award.id))
        .map((award) => award.badgeId);

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition: forgedRecognition,
        previousSession: beforeRecognition,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: afterRecognition.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds,
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: afterRecognition.familyReward,
        privateLeague: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it('rejects a stage crossing when no committed PlantStageArchive exists', async () => {
    const { beforeRecognition, recognition } = await applyReplacementRecognition('smaller');
    const after = usePrototypeStore.getState();
    const plan = beforeRecognition.confirmationPlan;
    const seed = recognition.receipt.seedTransaction;
    if (!plan || plan.renderState !== 'praise_presented' || !seed) {
      throw new Error('Expected a prepared smaller-task recognition');
    }
    const forgedReceipt = {
      ...recognition.receipt,
      seedTransaction: { ...seed, balanceBefore: 52, balanceAfter: 60 },
      landscapeGrowth: {
        landscapeId: 'mangrove' as const,
        seedsBefore: 52,
        seedsAfter: 60,
        stageBefore: 'shoot' as const,
        stageAfter: 'sapling' as const,
        crossedThreshold: 60 as const,
        symbolicOnly: true as const,
      },
    };
    const previousSession = {
      ...beforeRecognition,
      children: {
        ...beforeRecognition.children,
        child_salem: { ...beforeRecognition.children.child_salem, earnedSeeds: 52 },
      },
      landscapeProgress: {
        ...beforeRecognition.landscapeProgress,
        mangrove: {
          ...beforeRecognition.landscapeProgress.mangrove,
          cumulativeSeeds: 52,
          stage: 'shoot' as const,
          nextThreshold: 60 as const,
        },
      },
    };
    const forgedRecognition = {
      ...recognition,
      receipt: forgedReceipt,
      session: {
        ...recognition.session,
        children: {
          ...recognition.session.children,
          child_salem: { ...recognition.session.children.child_salem, earnedSeeds: 60 },
        },
        landscapeProgress: {
          ...recognition.session.landscapeProgress,
          mangrove: {
            ...recognition.session.landscapeProgress.mangrove,
            cumulativeSeeds: 60,
            stage: 'sapling' as const,
            nextThreshold: 120 as const,
          },
        },
        recognitionLedger: { [forgedReceipt.recognitionKey]: forgedReceipt },
      },
    };

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition: forgedRecognition,
        previousSession,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: after.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds: [],
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: after.familyReward,
        privateLeague: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it('rejects a recognized task version that differs from the presented approval plan', () => {
    const { beforeRecognition, recognition, afterRecognition } =
      applyCanonicalRecognitionWithContext();
    const plan = beforeRecognition.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented canonical approval plan');
    }
    const forgedRecognition = {
      ...recognition,
      journey: {
        ...recognition.journey,
        task: { ...recognition.journey.task, version: 2 },
      },
    };

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition: forgedRecognition,
        previousSession: beforeRecognition,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: afterRecognition.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds: [],
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: afterRecognition.familyReward,
        privateLeague: null,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'RECEIPT_CONFLICT',
        message: 'Approval evidence does not form one committed recognition',
      },
    });
  });

  it('rejects a previous session journey that differs from the presented approval plan', () => {
    const { beforeRecognition, recognition, afterRecognition } =
      applyCanonicalRecognitionWithContext();
    const plan = beforeRecognition.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented canonical approval plan');
    }
    const previousJourney = beforeRecognition.journey;
    if (!previousJourney) throw new Error('Expected the canonical previous journey');
    const forgedPreviousSession = {
      ...beforeRecognition,
      journey: {
        ...previousJourney,
        task: { ...previousJourney.task, version: 2 },
      },
    };

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition,
        previousSession: forgedPreviousSession,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: afterRecognition.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds: [],
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: afterRecognition.familyReward,
        privateLeague: null,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'RECEIPT_CONFLICT',
        message: 'Approval evidence does not form one committed recognition',
      },
    });
  });

  it('commits nothing when a provider returns a different persisted journey', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();
    const plan = before.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented canonical approval plan');
    }
    const genuine = serviceRegistry.recognition.applyRecognition(before, plan, RECOGNITION_ACTION);
    if (!genuine.ok) throw new Error(`Expected genuine recognition: ${JSON.stringify(genuine)}`);
    const persistedJourney = genuine.data.session.journey;
    if (!persistedJourney) throw new Error('Expected a persisted recognized journey');
    const forged = {
      ...genuine,
      data: {
        ...genuine.data,
        session: {
          ...genuine.data.session,
          journey: {
            ...persistedJourney,
            task: { ...persistedJourney.task, version: 2 },
          },
        },
      },
    };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    const after = usePrototypeStore.getState();
    expect(after.journey).toBe(before.journey);
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(before.growthJourney);
    expect(after.privateLeague).toBe(before.privateLeague);
    expect(after.familyReward).toBe(before.familyReward);
    expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  });

  it('commits nothing when a Salem approval changes Alya session data', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();
    const plan = before.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented canonical approval plan');
    }
    const genuine = serviceRegistry.recognition.applyRecognition(before, plan, RECOGNITION_ACTION);
    if (!genuine.ok || genuine.data.disposition !== 'applied') {
      throw new Error(`Expected genuine recognition: ${JSON.stringify(genuine)}`);
    }
    const alya = genuine.data.session.children.child_alya;
    const forged = {
      ...genuine,
      data: {
        ...genuine.data,
        session: {
          ...genuine.data.session,
          children: {
            ...genuine.data.session.children,
            child_alya: { ...alya, earnedSeeds: alya.earnedSeeds + 999 },
          },
        },
      },
    };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    const after = usePrototypeStore.getState();
    expect(after.journey).toBe(before.journey);
    expect(after.children).toBe(before.children);
    expect(after.children.child_alya.earnedSeeds).toBe(before.children.child_alya.earnedSeeds);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(before.growthJourney);
    expect(after.privateLeague).toBe(before.privateLeague);
    expect(after.familyReward).toBe(before.familyReward);
    expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  });

  it('commits nothing when a provider adds an undefined action-shaped session key', () => {
    const { before, genuine } = prepareCanonicalProviderResult();
    const forged = {
      ...genuine,
      data: {
        ...genuine.data,
        session: { ...genuine.data.session, resetPrototype: undefined },
      },
    };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    expectApprovalStateUnchanged(before);
  });

  it('rejects a stale continuation before calling the recognition provider', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();
    const originalApply = serviceRegistry.recognition.applyRecognition.bind(
      serviceRegistry.recognition,
    );
    let providerCalls = 0;
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockImplementation((session, plan) => {
        providerCalls += 1;
        return originalApply(session, plan, RECOGNITION_ACTION);
      });
    const staleAction = {
      ...RECOGNITION_ACTION,
      actionId: PRAISE_ACTION.actionId,
      presentationActionId: 'stale-presentation-action',
    };

    try {
      expect(usePrototypeStore.getState().applyRecognition(staleAction)).toMatchObject({
        ok: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Recognition request does not prove the distinct Parent continuation action',
        },
      });
    } finally {
      applySpy.mockRestore();
    }

    expect(providerCalls).toBe(0);
    expectApprovalStateUnchanged(before);
  });

  it('rejects malformed continuation data before calling the recognition provider', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();
    let providerCalls = 0;
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockImplementation(() => {
        providerCalls += 1;
        throw new Error('Provider must not be reached');
      });

    try {
      const malformed = {
        ...RECOGNITION_ACTION,
        actionId: null,
      } as unknown as typeof RECOGNITION_ACTION;
      expect(usePrototypeStore.getState().applyRecognition(malformed)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      const plan = before.confirmationPlan;
      if (!plan || plan.renderState !== 'praise_presented') {
        throw new Error('Expected a presented plan for malformed-boundary coverage');
      }
      usePrototypeStore.setState({
        confirmationPlan: {
          ...plan,
          journey: null,
        } as unknown as typeof plan,
      });
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
    } finally {
      applySpy.mockRestore();
    }

    expect(providerCalls).toBe(0);
    expectApprovalStateUnchanged(before);
  });

  it('fails closed for malformed plain recognition provider envelopes', () => {
    const { before, genuine } = prepareCanonicalProviderResult();
    const malformedResults: readonly (readonly [string, unknown])[] = [
      ['null metadata', { ...genuine, meta: null }],
      ['null result data', { ...genuine, data: null }],
      ['truthy non-boolean status', { ...genuine, ok: 'true' }],
      [
        'extra result-data key',
        { ...genuine, data: { ...genuine.data, hiddenAuthority: undefined } },
      ],
      [
        'mismatched disposition message',
        {
          ...genuine,
          data: { ...genuine.data, disposition: 'already_confirmed', message: null },
        },
      ],
    ];

    for (const [label, malformed] of malformedResults) {
      const applySpy = vi
        .spyOn(serviceRegistry.recognition, 'applyRecognition')
        .mockReturnValue(
          malformed as ReturnType<typeof serviceRegistry.recognition.applyRecognition>,
        );
      try {
        expect(
          usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION),
          label,
        ).toMatchObject({
          ok: false,
          error: { code: 'INVALID_RESPONSE' },
        });
      } finally {
        applySpy.mockRestore();
      }
      expectApprovalStateUnchanged(before);
    }
  });

  it('isolates nested recognition inputs before calling the provider', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();
    const originalApply = serviceRegistry.recognition.applyRecognition.bind(
      serviceRegistry.recognition,
    );
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockImplementation((session, plan, action) => {
        const alya = session.children.child_alya as { earnedSeeds: number };
        alya.earnedSeeds += 999;
        return originalApply(session, plan, action);
      });

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    expectApprovalStateUnchanged(before);
    expect(usePrototypeStore.getState().children.child_alya.earnedSeeds).toBe(
      before.children.child_alya.earnedSeeds,
    );
  });

  it('detaches committed state from provider and caller result ownership', () => {
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const originalApply = serviceRegistry.recognition.applyRecognition.bind(
      serviceRegistry.recognition,
    );
    const providerResults: ReturnType<typeof serviceRegistry.recognition.applyRecognition>[] = [];
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockImplementation((session, plan, action) => {
        const outcome = originalApply(session, plan, action);
        providerResults.push(outcome);
        return outcome;
      });

    let callerOwnedResult: ReturnType<typeof serviceRegistry.recognition.applyRecognition> | null =
      null;
    try {
      callerOwnedResult = usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION);
    } finally {
      applySpy.mockRestore();
    }
    const providerOwnedResult = providerResults[0];
    if (!providerOwnedResult || !providerOwnedResult.ok || !callerOwnedResult?.ok) {
      throw new Error('Expected detached provider and caller recognition results');
    }
    const committed = usePrototypeStore.getState();
    const committedAlyaSeeds = committed.children.child_alya.earnedSeeds;
    const committedSalemSeeds = committed.children.child_salem.earnedSeeds;
    const providerAlya = providerOwnedResult.data.session.children.child_alya as {
      earnedSeeds: number;
    };
    const callerSalem = callerOwnedResult.data.session.children.child_salem as {
      earnedSeeds: number;
    };
    const callerMeta = callerOwnedResult.meta as { origin: string };
    providerAlya.earnedSeeds += 999;
    callerSalem.earnedSeeds += 999;
    callerMeta.origin = 'live';

    const afterMutation = usePrototypeStore.getState();
    expect(afterMutation.children.child_alya.earnedSeeds).toBe(committedAlyaSeeds);
    expect(afterMutation.children.child_salem.earnedSeeds).toBe(committedSalemSeeds);
    expect(afterMutation.lastRecognitionAttempt).not.toBe(callerOwnedResult.data);
    expect(providerOwnedResult.meta.origin).toBe('synthetic');
    const futureResult = serviceRegistry.recognition.resolveCheckInState(
      afterMutation,
      'submission_recycling_p0_v1_attempt_1',
    );
    expect(futureResult.ok && futureResult.meta.origin).toBe('synthetic');
  });

  it('commits nothing when a provider hides a session authority from object spread', () => {
    const { before, genuine } = prepareCanonicalProviderResult();
    const forgedSession = { ...genuine.data.session };
    Object.defineProperty(forgedSession, 'recognitionLedger', {
      value: genuine.data.session.recognitionLedger,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    const forged = {
      ...genuine,
      data: { ...genuine.data, session: forgedSession },
    };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    expectApprovalStateUnchanged(before);
  });

  it('commits nothing when a new recognition is labeled already confirmed', () => {
    const { before, genuine } = prepareCanonicalProviderResult();
    const forged = {
      ...genuine,
      data: { ...genuine.data, disposition: 'already_confirmed' as const },
    };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    } finally {
      applySpy.mockRestore();
    }

    expectApprovalStateUnchanged(before);
  });

  it('rejects an already-confirmed receipt from another stored task chain', () => {
    const recognition = applyCanonicalRecognition();
    const state = usePrototypeStore.getState();
    const activeReceipt = recognition.receipt;
    const activeSeed = activeReceipt.seedTransaction;
    if (!activeSeed) throw new Error('Expected the canonical Seed receipt');
    const otherSubmissionId = 'submission_other_stored_task';
    const otherRecognitionKey = `recognition:${otherSubmissionId}`;
    const otherReceipt = {
      ...activeReceipt,
      recognitionKey: otherRecognitionKey,
      checkInId: 'check-in-other-stored-task',
      seedTransaction: {
        ...activeSeed,
        id: `seed_transaction_${otherSubmissionId}`,
        recognitionKey: otherRecognitionKey,
      },
    };
    usePrototypeStore.setState({
      recognitionLedger: {
        ...state.recognitionLedger,
        [otherRecognitionKey]: otherReceipt,
      },
    });
    const before = usePrototypeStore.getState();
    const plan = before.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected the retained canonical approval plan');
    }
    const providerSession = {
      ...recognition.session,
      recognitionLedger: before.recognitionLedger,
    };
    const genuine = serviceRegistry.recognition.applyRecognition(
      providerSession,
      plan,
      RECOGNITION_ACTION,
    );
    if (!genuine.ok || genuine.data.disposition !== 'already_confirmed') {
      throw new Error(`Expected a repeated recognition: ${JSON.stringify(genuine)}`);
    }
    const forged = { ...genuine, data: { ...genuine.data, receipt: otherReceipt } };
    const applySpy = vi
      .spyOn(serviceRegistry.recognition, 'applyRecognition')
      .mockReturnValue(forged);

    try {
      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
        },
      });
    } finally {
      applySpy.mockRestore();
    }

    expectApprovalStateUnchanged(before);
  });

  it('rejects a League application whose confirmed Leaf differs from its receipt', () => {
    const { beforeRecognition, recognition, afterRecognition } =
      applyCanonicalRecognitionWithContext();
    const plan = beforeRecognition.confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      throw new Error('Expected a presented canonical approval plan');
    }
    const profileId = recognition.journey.task.targetChildId;
    const league = expectOk(
      applyRecognitionToPrivateLeague({
        runtime: beforeRecognition.privateLeague,
        profileId,
        profileEpochId: afterRecognition.growthJourney.ledgersByProfile[profileId].profileEpochId,
        journey: recognition.journey,
        receipt: recognition.receipt,
        recognitionLedger: recognition.session.recognitionLedger,
      }),
    );
    const forgedLeague = {
      ...league,
      runtime: {
        ...league.runtime,
        challengeLeaf: {
          ...league.runtime.challengeLeaf,
          id: 'leaf_child_salem_forged',
        },
      },
    };

    expect(
      constructApprovalReveal({
        queue: beforeRecognition.revealBundleQueue,
        plan,
        recognition,
        previousSession: beforeRecognition,
        growthBefore: beforeRecognition.growthJourney,
        growthProjection: {
          disposition: 'projected',
          runtime: afterRecognition.growthJourney,
          addedCreditIds: [],
          newlyEarnedBadgeIds: [],
          newlyReachedThresholds: [],
        },
        familyRewardBefore: beforeRecognition.familyReward,
        familyRewardAfter: afterRecognition.familyReward,
        privateLeague: forgedLeague,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'RECEIPT_CONFLICT',
        message: 'Private League receipt does not match this approval',
      },
    });
  });

  it('commits no consequence when an authority cannot reconcile', () => {
    const state = usePrototypeStore.getState();
    const growthJourney = state.growthJourney;
    const privateLeague = state.privateLeague;
    usePrototypeStore.setState({
      familyReward: {
        ...state.familyReward,
        targetEligibleSeeds: 121,
      } as unknown as typeof state.familyReward,
    });

    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    const after = usePrototypeStore.getState();
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(growthJourney);
    expect(after.privateLeague).toBe(privateLeague);
    expect(after.revealBundleQueue.bundles).toEqual([]);
  });

  it.each(['unlocked', 'given'] as const)(
    'commits nothing from a malformed unchanged Family Reward lifecycle: %s',
    (lifecycle) => {
      const initial = usePrototypeStore.getState();
      usePrototypeStore.setState({
        familyReward: {
          ...initial.familyReward,
          plan: {
            ...initial.familyReward.plan,
            lifecycle,
            unlockedAt: null,
            givenAt: null,
          },
        },
      });
      seedPrototypeStateForTest(createSubmittedP0Session());
      expectOk(
        usePrototypeStore.getState().planConfirmation({
          submissionId: 'submission_recycling_p0_v1_attempt_1',
          praise: PREPARED_PRAISE,
          neutralObservation: null,
          uncertainty: null,
        }),
      );
      expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
      const before = usePrototypeStore.getState();

      expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });

      const after = usePrototypeStore.getState();
      expect(after.journey).toBe(before.journey);
      expect(after.children.child_salem.earnedSeeds).toBe(48);
      expect(after.recognitionLedger).toEqual({});
      expect(after.growthJourney).toBe(before.growthJourney);
      expect(after.privateLeague).toBe(before.privateLeague);
      expect(after.familyReward).toBe(before.familyReward);
      expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
    },
  );

  it('commits nothing when Family Reward already contains an unreconciled recognition key', () => {
    const recognitionKey = 'recognition:submission_recycling_p0_v1_attempt_1';
    const initial = usePrototypeStore.getState();
    usePrototypeStore.setState({
      familyReward: {
        ...initial.familyReward,
        progress: {
          ...initial.familyReward.progress,
          recognitionKeys: [recognitionKey],
        },
      },
    });
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    const after = usePrototypeStore.getState();
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(before.growthJourney);
    expect(after.privateLeague).toBe(before.privateLeague);
    expect(after.familyReward).toBe(before.familyReward);
    expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  });

  it('commits nothing when Family Reward would erase unrelated private provenance', () => {
    const initial = usePrototypeStore.getState();
    usePrototypeStore.setState({
      familyReward: {
        ...initial.familyReward,
        progress: {
          ...initial.familyReward.progress,
          recognitionKeys: ['recognition:stale-unrelated-event'],
        },
      },
    });
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    const after = usePrototypeStore.getState();
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(before.growthJourney);
    expect(after.privateLeague).toBe(before.privateLeague);
    expect(after.familyReward).toBe(before.familyReward);
    expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  });

  it('rejects a pre-existing matching Family Reward unlock before core approval', async () => {
    applyCanonicalRecognition();
    const unlockedFamilyReward = usePrototypeStore.getState().familyReward;
    expect(unlockedFamilyReward.plan.lifecycle).toBe('unlocked');

    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
    usePrototypeStore.setState({ familyReward: unlockedFamilyReward });
    seedPrototypeStateForTest(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = usePrototypeStore.getState();

    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    const after = usePrototypeStore.getState();
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(before.growthJourney);
    expect(after.privateLeague).toBe(before.privateLeague);
    expect(after.familyReward).toBe(unlockedFamilyReward);
    expect(after.revealBundleQueue).toBe(before.revealBundleQueue);
  });

  it('runs an authoritative queued fixture through the exact lifecycle idempotently', async () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');
    await enterChildExperienceForTest();
    usePrototypeStore.setState({ revealBundleQueue: queue });

    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('presenting');
    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('archived');
  });

  it('fails closed across profile boundaries and clears all queued presentation on Parent reset', async () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');

    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    await enterChildExperienceForTest('child_alya');
    usePrototypeStore.setState({ revealBundleQueue: queue });
    expect(usePrototypeStore.getState().startRevealPresentation(bundle.id)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('ready');

    await enterParentExperienceForTest();
    const priorLeagueEpoch = usePrototypeStore.getState().privateLeague.profileEpochId;
    expectOk(usePrototypeStore.getState().resetPrototype());
    const reset = usePrototypeStore.getState();
    expect(reset.revealBundleQueue.bundles).toEqual([]);
    expect(reset.privateLeague.profileEpochId).not.toBe(priorLeagueEpoch);
    expect(reset.privateLeague.profileEpochId).toBe(
      reset.growthJourney.ledgersByProfile.child_salem.profileEpochId,
    );
    expect(reset.privateLeague.receiptsByRecognitionKey).toEqual({});
  });
});
