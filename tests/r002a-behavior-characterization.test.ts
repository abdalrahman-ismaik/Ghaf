import { beforeEach, describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { serviceRegistry } from '../src/services';
import { PREPARED_PRAISE } from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const RESET_COUNTERS = {
  salemSeeds: 48,
  mangroveSeeds: 48,
  mangroveStage: 'shoot',
  canopyLeaves: 19,
  circleActions: 11,
} as const;

const SAFE_PARENT_ACTION = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
} as const;

const SUBMISSION = {
  definitionAcknowledged: true,
  completionMode: 'permitted_help' as const,
  helpUsed: {
    ar: 'فحص شخص بالغ المواد وساعد في التخلّص منها.',
    en: 'An adult checked the items and helped with disposal.',
  },
  preparedMediaFixtureId: null,
  reflection: null,
  observableFacts: [
    {
      ar: 'فرز سالم المواد النظيفة التي وافق عليها شخص بالغ.',
      en: 'Salem sorted the clean items an adult approved.',
    },
  ],
} as const;

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function counters(state: PrototypeStoreState = usePrototypeStore.getState()) {
  return {
    salemSeeds: state.children.child_salem.earnedSeeds,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
  };
}

describe('R002a preserved behavioral oracle', () => {
  beforeEach(() => {
    usePrototypeStore.getState().setRole('parent');
    const reset = usePrototypeStore.getState().resetPrototype();
    expectOk(reset);
    expect(reset.data).toMatchObject({ navigateTo: '/', replaceHistory: true });
  });

  it('keeps one canonical task rewardless until the existing idempotent recognition transaction', () => {
    const initialAlya = structuredClone(usePrototypeStore.getState().children.child_alya);

    expect(usePrototypeStore.getState().schemaVersion).toBe(3);
    expect(counters()).toEqual(RESET_COUNTERS);
    expect(P0_RECYCLING_TEMPLATE).toMatchObject({
      id: 'task_recycling_p0_v1',
      displayedSeedAward: 12,
    });
    expect(JSON.stringify(usePrototypeStore.getState())).not.toContain('task.recycling_sort.v1');

    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: SAFE_PARENT_ACTION,
      }),
    );
    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().approveAssignment());
    expect(usePrototypeStore.getState()).toMatchObject({
      journey: {
        lifecycle: 'assigned',
        task: { id: 'task_recycling_p0_v1' },
      },
      choicePool: {
        p0AssignmentChoice: { taskTemplateId: 'task_recycling_p0_v1' },
      },
    });
    expect(counters()).toEqual(RESET_COUNTERS);

    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1')).toMatchObject({
      ok: false,
      error: { code: 'NOT_ASSIGNED_CHILD' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('assigned');
    expect(counters()).toEqual(RESET_COUNTERS);

    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('chosen');
    expect(counters()).toEqual(RESET_COUNTERS);
    expectOk(usePrototypeStore.getState().startAssignment());
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');
    expect(counters()).toEqual(RESET_COUNTERS);

    expectOk(usePrototypeStore.getState().submitTask(SUBMISSION));
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'submitted',
      submission: { id: 'submission_recycling_p0_v1_attempt_1', attempt: 1 },
    });
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
    expect(counters()).toEqual(RESET_COUNTERS);

    usePrototypeStore.getState().setRole('parent');
    expectOk(
      usePrototypeStore.getState().requestKindRetry({
        ar: 'لنراجع الخطوة مرة أخرى بأمان.',
        en: 'Let us review the step safely once more.',
      }),
    );
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('retry');
    expect(counters()).toEqual(RESET_COUNTERS);
    expectOk(usePrototypeStore.getState().resumeRetry());
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');
    expect(counters()).toEqual(RESET_COUNTERS);

    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().submitTask(SUBMISSION));
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'submitted',
      submission: { id: 'submission_recycling_p0_v1_attempt_2', attempt: 2 },
    });
    expect(counters()).toEqual(RESET_COUNTERS);

    usePrototypeStore.getState().setRole('parent');
    const planned = usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_2',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    });
    expectOk(planned);
    expect(planned.data).toMatchObject({ disposition: 'pending_praise' });
    expect(counters()).toEqual(RESET_COUNTERS);

    expectOk(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'r002a-praise',
        source: 'parent_press',
        presentedAt: '2026-09-05T10:00:00.000Z',
      }),
    );
    expect(usePrototypeStore.getState().confirmationPlan?.renderState).toBe('praise_presented');
    expect(counters()).toEqual(RESET_COUNTERS);

    const first = usePrototypeStore.getState().applyRecognition({
      actionId: 'r002a-recognition',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'r002a-praise',
    });
    expectOk(first);
    expect(first.data).toMatchObject({
      disposition: 'applied',
      receipt: {
        recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_2',
        seedTransaction: { amount: 12, balanceBefore: 48, balanceAfter: 60 },
        landscapeGrowth: {
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          crossedThreshold: 60,
        },
        canopyContribution: { leafDelta: 1 },
        circleEvent: { actionDelta: 1 },
      },
    });
    expect(counters()).toEqual({
      salemSeeds: 60,
      mangroveSeeds: 60,
      mangroveStage: 'sapling',
      canopyLeaves: 20,
      circleActions: 12,
    });
    expect(usePrototypeStore.getState().children.child_alya).toEqual(initialAlya);

    const receipt = structuredClone(first.data.receipt);
    const recognizedCounters = counters();
    const celebration = structuredClone(usePrototypeStore.getState().celebration);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(
        usePrototypeStore.getState().applyRecognition({
          actionId: `r002a-duplicate-${attempt}`,
          source: 'parent_press',
          observedRenderState: 'praise_presented',
          presentationActionId: 'r002a-praise',
        }),
      ).toMatchObject({
        ok: true,
        data: { disposition: 'already_confirmed', receipt },
      });
      expect(counters()).toEqual(recognizedCounters);
      expect(usePrototypeStore.getState().children.child_alya).toEqual(initialAlya);
      expect(usePrototypeStore.getState().celebration).toEqual(celebration);
      expect(Object.keys(usePrototypeStore.getState().recognitionLedger)).toEqual([
        'recognition:submission_recycling_p0_v1_attempt_2',
      ]);
    }
  });

  it('keeps access, voice, private League, and Family Reward services separate and available', () => {
    const serviceMethods = [
      serviceRegistry.familyLeague.evaluateEligibility,
      serviceRegistry.familyLeague.createWeek,
      serviceRegistry.familyLeague.confirmLeaf,
      serviceRegistry.familyLeague.calculateResults,
      serviceRegistry.familyLeague.projectParticipants,
      serviceRegistry.familyLeague.sendPreparedEncouragement,
      serviceRegistry.familyLeague.rollover,
      serviceRegistry.familyReward.createPlan,
      serviceRegistry.familyReward.revisePromisedPlan,
      serviceRegistry.familyReward.evaluatePlan,
      serviceRegistry.familyReward.markGiven,
      serviceRegistry.familyReward.projectPrivate,
      serviceRegistry.familyReward.summarizeMonthlyCommitment,
      serviceRegistry.access.signInParent,
      serviceRegistry.access.signInChild,
      serviceRegistry.access.projectSession,
      serviceRegistry.access.authorizeCapability,
      serviceRegistry.access.requestPairing,
      serviceRegistry.access.issueReauthentication,
      serviceRegistry.access.authorizeSensitiveAction,
      serviceRegistry.access.getChildPermissions,
      serviceRegistry.access.updateChildPermissions,
      serviceRegistry.syntheticVoice.createIdle,
      serviceRegistry.syntheticVoice.start,
      serviceRegistry.syntheticVoice.stopWithPreparedTranscript,
      serviceRegistry.syntheticVoice.deleteBeforeSend,
      serviceRegistry.syntheticVoice.send,
      serviceRegistry.syntheticVoice.setPlayback,
      serviceRegistry.syntheticVoice.replay,
      serviceRegistry.syntheticVoice.reset,
    ];

    for (const method of serviceMethods) expect(method).toBeTypeOf('function');
    expect(serviceRegistry.familyLeague).not.toBe(serviceRegistry.familyReward);
    expect(serviceRegistry.access).not.toBe(serviceRegistry.syntheticVoice);
    expect(counters()).toEqual(RESET_COUNTERS);
  });
});
