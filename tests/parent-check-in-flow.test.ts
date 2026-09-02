import { existsSync, readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import { evaluateRecognitionPolicy } from '../src/features/rewards/policy';
import { validateTaskForReview } from '../src/features/tasks/validation';
import { serviceRegistry, type ParentGuideService } from '../src/services';
import { createResetSourceSession, createSubmittedP0Session } from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const PREPARED_PRAISE = {
  ar: 'لقد فرزت المواد النظيفة القابلة لإعادة التدوير وسألت قبل الذهاب إلى الحاوية؛ وهذا جعل المهمة أكثر أماناً وساعد أسرتنا.',
  en: 'You sorted the clean recyclables and asked before going to the bin—that kept the job safe and helped our household.',
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

function planAndPresentPraise(): void {
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: {
        ar: 'اكتملت الخطوات المرئية مع المساعدة المسموح بها.',
        en: 'The observable steps were completed with permitted help.',
      },
      uncertainty: {
        ar: 'لا يوضح السجل الاختياري كل تفاصيل التجربة.',
        en: 'The optional record does not explain every detail of the experience.',
      },
    }),
  );
  expectOk(
    usePrototypeStore.getState().markPraisePresented({
      actionId: 'us3-praise-presented',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    }),
  );
}

describe('US3 Parent check-in, retry, and praise-first recognition', () => {
  beforeEach(() => {
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
    usePrototypeStore.setState(createSubmittedP0Session());
    usePrototypeStore.getState().setRole('parent');
  });

  it('has the authored Parent check-in route', () => {
    expect(
      existsSync(new URL('../app/parent/check-in.tsx', import.meta.url)),
      '/parent/check-in must be an authored Feature 003 route',
    ).toBe(true);
  });

  it('renders selected prepared evidence with provenance, description/transcript, optionality, and private visibility', () => {
    const source = readFileSync(
      new URL('../src/components/family-growth/ParentCheckIn.tsx', import.meta.url),
      'utf8',
    );
    expect(source).toContain("from '@/components/family-growth/PreparedMedia'");
    expect(source).toContain('testID="parent-check-in-prepared-evidence"');
    expect(source).toContain('fixture={preparedMedia}');

    for (const fixture of serviceRegistry.media.listPrepared()) {
      expect(fixture).toMatchObject({
        origin: 'prepared',
        synthetic: true,
        optional: true,
        crossHouseholdSharing: false,
      });
      expect(fixture.parentVisibilityNotice.ar.trim()).not.toBe('');
      expect(fixture.parentVisibilityNotice.en.trim()).not.toBe('');
      expect(
        fixture.kind === 'audio'
          ? fixture.transcript?.en.trim()
          : fixture.accessibleDescription.en.trim(),
      ).toBeTruthy();
    }
  });

  it('restores the pending praise plan when a confirmed session re-enters check-in', () => {
    usePrototypeStore.setState(createResetSourceSession('confirmed'));

    const restored = usePrototypeStore
      .getState()
      .restoreCheckInState('submission_recycling_p0_v1_attempt_1');

    expectOk(restored);
    expect(restored.data).toMatchObject({
      state: 'confirmation_pending',
      attempt: {
        disposition: 'pending_praise',
        plan: { renderState: 'confirmation_pending', praise: PREPARED_PRAISE },
      },
    });
    expect(usePrototypeStore.getState().confirmationPlan).toMatchObject({
      renderState: 'confirmation_pending',
      praise: PREPARED_PRAISE,
    });
    expectOk(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'us3-restored-praise-presented',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      }),
    );
  });

  it('keeps completion mode, help, media, reflection, observable facts, and uncertainty separate', () => {
    const journey = usePrototypeStore.getState().journey;
    expect(journey).toMatchObject({
      lifecycle: 'submitted',
      submission: {
        completionMode: 'permitted_help',
        helpUsed: { ar: expect.any(String), en: expect.any(String) },
        preparedMediaFixtureId: null,
        reflection: null,
        observableFacts: [{ ar: expect.any(String), en: expect.any(String) }],
      },
      checkIn: null,
    });

    const routeState = serviceRegistry.recognition.resolveCheckInState(
      usePrototypeStore.getState(),
      'submission_recycling_p0_v1_attempt_1',
    );
    expect(routeState).toMatchObject({
      ok: true,
      data: {
        state: 'submitted',
        submission: {
          completionMode: 'permitted_help',
          helpUsed: { ar: expect.any(String), en: expect.any(String) },
          preparedMediaFixtureId: null,
          reflection: null,
          observableFacts: expect.any(Array),
        },
      },
    });
  });

  it('keeps kind retry observable until a distinct resume action, without loss or a public mark', () => {
    const baseline = counters();
    const retry = usePrototypeStore.getState().requestKindRetry({
      ar: 'لنجرّب مرة أخرى بخطوة واضحة وآمنة.',
      en: 'Let us try again with one clear, safe step.',
    });
    expectOk(retry);
    expect(retry.data).toMatchObject({
      lifecycle: 'retry',
      checkIn: {
        decision: 'kind_retry',
        praise: null,
        recognitionKey: null,
      },
    });
    expect(JSON.stringify(retry.data)).not.toMatch(/failure|debt|deduct|punish|rank/i);
    expect(counters()).toEqual(baseline);

    expect(
      serviceRegistry.recognition.resolveCheckInState(
        usePrototypeStore.getState(),
        'submission_recycling_p0_v1_attempt_1',
      ),
    ).toMatchObject({
      ok: true,
      data: { state: 'retry', journey: { lifecycle: 'retry' } },
    });
    const parentHomeSource = readFileSync(
      new URL('../app/parent/index.tsx', import.meta.url),
      'utf8',
    );
    expect(parentHomeSource).toContain("journey?.lifecycle === 'retry'");
    expect(parentHomeSource).toMatch(/lifecycle === 'retry'[\s\S]{0,120}'\/parent\/check-in'/);

    expectOk(usePrototypeStore.getState().resumeRetry());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'in_progress',
      checkIn: null,
    });
    expect(counters()).toEqual(baseline);
  });

  it('does not request and resume a kind retry inside one component action', () => {
    const source = readFileSync(
      new URL('../src/components/family-growth/ParentCheckIn.tsx', import.meta.url),
      'utf8',
    );
    const retryHandler = source.slice(
      source.indexOf('const retry ='),
      source.indexOf('const resume ='),
    );
    expect(retryHandler).toContain('requestKindRetry');
    expect(retryHandler).not.toContain('resumeRetry()');
    expect(source).toContain('testID="kind-retry-state"');
  });

  it('negotiates a bounded smaller or safe-equivalent task before Child acceptance', () => {
    usePrototypeStore.setState(createResetSourceSession('assigned'));
    usePrototypeStore.getState().setRole('child');
    const baseline = structuredClone(usePrototypeStore.getState().journey);
    const baselineCounters = counters();

    const requested = usePrototypeStore.getState().requestSmallerTask();
    expectOk(requested);
    expect(usePrototypeStore.getState().preAcceptanceAdjustment).toMatchObject({
      requestedKind: 'smaller',
      resolvedKind: null,
      status: 'parent_review_required',
      proposal: null,
      childDecision: null,
    });

    usePrototypeStore.getState().setRole('parent');
    const resolved = usePrototypeStore
      .getState()
      .resolvePreAcceptanceAdjustment({ decision: 'smaller' });
    expectOk(resolved);
    expect(resolved.data).toMatchObject({
      requestedKind: 'smaller',
      resolvedKind: 'smaller',
      status: 'child_decision_required',
      proposal: {
        proposedTaskVersion: 2,
        content: {
          displayedSeedAward: 8,
          visibilityScope: 'household',
          circleEligible: true,
        },
      },
    });
    expect(usePrototypeStore.getState().journey).toEqual(baseline);
    expect(counters()).toEqual(baselineCounters);

    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('keep_current'));
    expect(usePrototypeStore.getState().preAcceptanceAdjustment).toMatchObject({
      status: 'kept_current',
      childDecision: 'keep_current',
    });
    expect(usePrototypeStore.getState().journey).toEqual(baseline);
    expect(counters()).toEqual(baselineCounters);
  });

  it('applies an accepted pre-acceptance proposal prospectively while retaining the assignment identity', () => {
    usePrototypeStore.setState(createResetSourceSession('assigned'));
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().requestSmallerTask());
    usePrototypeStore.getState().setRole('parent');
    const resolved = usePrototypeStore
      .getState()
      .resolvePreAcceptanceAdjustment({ decision: 'safe_equivalent' });
    expectOk(resolved);
    expect(resolved.data.proposal?.content).toMatchObject({
      id: 'task_recycling_indoor_safe_equivalent_v1',
      displayedSeedAward: 12,
      visibilityScope: 'household',
      circleEligible: true,
    });
    expect(resolved.data.proposal?.content.definitionOfDone).not.toEqual(
      usePrototypeStore.getState().journey?.task.content.definitionOfDone,
    );
    expect(resolved.data.proposal?.content.safety.routeConstraint?.en).toContain('indoors');
    const baselineCounters = counters();

    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('accept'));
    expect(usePrototypeStore.getState()).toMatchObject({
      activeAssignmentId: 'assignment_recycling_p0_v1',
      preAcceptanceAdjustment: {
        resolvedKind: 'safe_equivalent',
        status: 'accepted',
        childDecision: 'accept',
      },
      journey: {
        lifecycle: 'assigned',
        task: {
          id: 'task_recycling_p0_v1',
          version: 2,
          content: {
            id: 'task_recycling_indoor_safe_equivalent_v1',
            displayedSeedAward: 12,
          },
        },
        assignment: { id: 'assignment_recycling_p0_v1', taskVersion: 2 },
      },
    });
    expect(counters()).toEqual(baselineCounters);
  });

  it.each([
    {
      decision: 'smaller' as const,
      replacementTemplateId: 'GI01',
      seedAward: 8,
      expectedSeeds: 56,
      expectedStage: 'shoot' as const,
    },
    {
      decision: 'safe_equivalent' as const,
      replacementTemplateId: 'task_recycling_indoor_safe_equivalent_v1',
      seedAward: 12,
      expectedSeeds: 60,
      expectedStage: 'sapling' as const,
    },
  ])(
    'keeps the $decision replacement coherent through one full recognized journey',
    ({ decision, replacementTemplateId, seedAward, expectedSeeds, expectedStage }) => {
      usePrototypeStore.setState(createResetSourceSession('assigned'));
      const sourceTask = structuredClone(usePrototypeStore.getState().journey?.task);
      usePrototypeStore.getState().setRole('child');
      expectOk(usePrototypeStore.getState().requestSmallerTask());
      usePrototypeStore.getState().setRole('parent');
      expectOk(usePrototypeStore.getState().resolvePreAcceptanceAdjustment({ decision }));
      usePrototypeStore.getState().setRole('child');
      expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('accept'));

      const adjusted = usePrototypeStore.getState();
      const adjustedTask = adjusted.journey?.task;
      expect(adjustedTask).toMatchObject({
        id: sourceTask?.id,
        version: 2,
        templateId: replacementTemplateId,
        parentOriginalText: sourceTask?.parentOriginalText,
        acceptedGuideFixtureId: sourceTask?.acceptedGuideFixtureId,
        content: { id: replacementTemplateId, displayedSeedAward: seedAward },
      });
      expect(adjusted.journey?.assignment).toMatchObject({
        id: 'assignment_recycling_p0_v1',
        taskId: sourceTask?.id,
        taskVersion: 2,
        childId: 'child_salem',
      });
      expect(adjusted.choicePool.p0AssignmentChoice).toMatchObject({
        id: 'choice_recycling_p0_v1',
        childId: 'child_salem',
        taskTemplateId: replacementTemplateId,
      });
      expect(adjusted.preAcceptanceAdjustment).toMatchObject({
        sourceTaskId: sourceTask?.id,
        sourceTaskVersion: 1,
        resolvedKind: decision,
        status: 'accepted',
        childDecision: 'accept',
        proposal: {
          proposedTaskVersion: 2,
          content: { id: replacementTemplateId },
          origin: 'prepared',
        },
      });
      expect(adjustedTask && validateTaskForReview(adjustedTask)).toMatchObject({ ok: true });

      expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
      expectOk(usePrototypeStore.getState().startAssignment());
      expectOk(
        usePrototypeStore.getState().submitTask({
          definitionAcknowledged: true,
          completionMode: 'permitted_help',
          helpUsed: {
            ar: 'فحص شخص بالغ المواد وساعد عند الحاجة.',
            en: 'An adult checked the items and helped when needed.',
          },
          preparedMediaFixtureId: null,
          reflection: null,
          observableFacts: [
            {
              ar: 'فرز سالم الورق والبلاستيك النظيفين بعد فحص شخص بالغ.',
              en: 'Salem sorted clean paper and plastic after an adult check.',
            },
          ],
        }),
      );
      expect(usePrototypeStore.getState().journey?.submission).toMatchObject({
        assignmentId: 'assignment_recycling_p0_v1',
        taskVersion: 2,
      });

      usePrototypeStore.getState().setRole('parent');
      expectOk(
        usePrototypeStore.getState().planConfirmation({
          submissionId: 'submission_recycling_p0_v1_attempt_1',
          praise: {
            ar: 'فرزت الورق النظيف وطلبت مساعدة شخص بالغ عند الشك.',
            en: 'You sorted the clean paper and asked an adult for help when unsure.',
          },
          neutralObservation: null,
          uncertainty: null,
        }),
      );
      expectOk(
        usePrototypeStore.getState().markPraisePresented({
          actionId: `replacement-praise:${decision}`,
          source: 'parent_press',
          presentedAt: '2026-08-26T10:00:00.000Z',
        }),
      );
      const recognized = usePrototypeStore.getState().applyRecognition({
        actionId: `replacement-recognition:${decision}`,
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: `replacement-praise:${decision}`,
      });
      expectOk(recognized);
      expect(recognized.data).toMatchObject({
        disposition: 'applied',
        receipt: {
          recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
          seedTransaction: { amount: seedAward, balanceBefore: 48, balanceAfter: expectedSeeds },
          canopyContribution: { leafDelta: 1 },
          circleEvent: { actionDelta: 1 },
        },
      });
      expect(counters()).toEqual({
        salemSeeds: expectedSeeds,
        mangroveSeeds: expectedSeeds,
        mangroveStage: expectedStage,
        canopyLeaves: 20,
        circleActions: 12,
      });
      const afterFirst = counters();

      expect(
        usePrototypeStore.getState().applyRecognition({
          actionId: `replacement-duplicate:${decision}`,
          source: 'parent_press',
          observedRenderState: 'praise_presented',
          presentationActionId: `replacement-praise:${decision}`,
        }),
      ).toMatchObject({ ok: true, data: { disposition: 'already_confirmed' } });
      expect(counters()).toEqual(afterFirst);
      expect(Object.keys(usePrototypeStore.getState().recognitionLedger)).toEqual([
        'recognition:submission_recycling_p0_v1_attempt_1',
      ]);
    },
  );

  it('keeps replacement awards prospective and never reduces the accepted task for permitted help', () => {
    const acceptedWithHelp = evaluateRecognitionPolicy({
      submissionId: 'accepted-with-help',
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      recurrence: 'once',
      displayedSeedAward: 12,
      completionMode: 'permitted_help',
      confirmedAcquisitionCount: 1,
      existingReceipt: null,
    });
    expect(acceptedWithHelp).toMatchObject({
      ok: true,
      data: { disposition: 'new', seedAmount: 12 },
    });

    const prospectiveSmaller = evaluateRecognitionPolicy({
      submissionId: 'future-smaller-before-acceptance',
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      recurrence: 'once',
      displayedSeedAward: 8,
      completionMode: 'independent',
      confirmedAcquisitionCount: 0,
      existingReceipt: null,
    });
    expect(prospectiveSmaller).toMatchObject({
      ok: true,
      data: { disposition: 'new', seedAmount: 8 },
    });
    expect(usePrototypeStore.getState().journey?.task.content.displayedSeedAward).toBe(12);
  });

  it('records smaller and safe-equivalent plans for future use without mutating the accepted task', () => {
    const baselineCounters = counters();
    const baselineJourney = structuredClone(usePrototypeStore.getState().journey);
    const baselineLedger = structuredClone(usePrototypeStore.getState().recognitionLedger);

    const smaller = usePrototypeStore.getState().planFutureTaskAdjustment('smaller');
    expectOk(smaller);
    expect(smaller.data).toEqual({
      kind: 'smaller',
      requestedBy: 'parent',
      sourceTaskId: 'task_recycling_p0_v1',
      sourceTaskVersion: 1,
      childId: 'child_salem',
      sourceSubmissionId: 'submission_recycling_p0_v1_attempt_1',
      status: 'future_plan_recorded',
      appliesTo: 'future_task_only',
      origin: 'synthetic_local',
    });

    const equivalent = usePrototypeStore.getState().planFutureTaskAdjustment('safe_equivalent');
    expectOk(equivalent);
    expect(equivalent.data).toEqual({
      ...smaller.data,
      kind: 'safe_equivalent',
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toEqual(equivalent.data);
    expect(usePrototypeStore.getState().journey).toEqual(baselineJourney);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual(baselineLedger);
    expect(counters()).toEqual(baselineCounters);
  });

  it('fails closed for Child, wrong-profile, and stale-lifecycle future plans', () => {
    const baselineCounters = counters();

    usePrototypeStore.getState().setRole('child');
    expect(usePrototypeStore.getState().planFutureTaskAdjustment('smaller')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();

    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState().planFutureTaskAdjustment('safe_equivalent')).toMatchObject({
      ok: false,
      error: { code: 'NOT_ASSIGNED_CHILD' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();

    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().requestKindRetry(null));
    expect(usePrototypeStore.getState().planFutureTaskAdjustment('smaller')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('retry');
    expect(counters()).toEqual(baselineCounters);
  });

  it('clears the transient future plan on reset and when a new draft starts', () => {
    expectOk(usePrototypeStore.getState().planFutureTaskAdjustment('smaller'));
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).not.toBeNull();

    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();

    usePrototypeStore.setState(createSubmittedP0Session());
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().planFutureTaskAdjustment('safe_equivalent'));
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: {
          ar: 'إخراج مواد إعادة التدوير.',
          en: 'Take the recycling out.',
        },
      }),
    );
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('draft');
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();
  });

  it('rejects an older asynchronous Guide result after the Parent changes the draft wording', async () => {
    const originalParentText = {
      ar: 'إخراج مواد إعادة التدوير.',
      en: 'Take the recycling out.',
    } as const;
    const updatedParentText = {
      ar: 'فرز المواد النظيفة مع شخص بالغ.',
      en: 'Sort the clean items with an adult.',
    } as const;
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: originalParentText,
      }),
    );

    let releaseRequest: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    const deferredGuide: ParentGuideService = {
      refineTask: async (request) => {
        await gate;
        return serviceRegistry.parentGuide.refineTask(request);
      },
      summarizePattern: (request) => serviceRegistry.parentGuide.summarizePattern(request),
    };

    const pending = usePrototypeStore
      .getState()
      .requestParentGuide(
        { requestId: 'stale-guide-after-parent-edit', intent: 'make_clearer' },
        deferredGuide,
      );
    expectOk(usePrototypeStore.getState().updateTaskDraftParentText(updatedParentText));
    expectOk(usePrototypeStore.getState().updateTaskDraftParentText(originalParentText));
    releaseRequest?.();

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journey?.task.parentOriginalText).toEqual(
      originalParentText,
    );
    expect(usePrototypeStore.getState().parentGuideSuggestion).toBeNull();
  });

  it('rejects character-label praise and preserves the submitted journey and all counters', () => {
    const baseline = counters();
    const invalid = usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: {
        ar: 'أنت طفل جيد.',
        en: 'You are a good child.',
      },
      neutralObservation: null,
      uncertainty: null,
    });
    expect(invalid).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
    expect(counters()).toEqual(baseline);
  });

  it('rejects trait-only praise and accepts bilingual praise tied to an observable action/help-seeking', () => {
    const baseline = counters();
    expect(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: { ar: 'أنت رائع.', en: 'You are amazing.' },
        neutralObservation: null,
        uncertainty: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: {
          ar: 'فرزت الورق؛ أنت أفضل طفل ورائع.',
          en: 'You sorted the paper; you are the best and perfect child.',
        },
        neutralObservation: null,
        uncertainty: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(counters()).toEqual(baseline);

    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: {
          ar: 'فرزت الورق النظيف وطلبت مساعدة شخص بالغ عند الشك.',
          en: 'You sorted the clean paper and asked an adult for help when unsure.',
        },
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expect(counters()).toEqual(baseline);
  });

  it.each([
    {
      ar: 'فرزت الورق—يا بطلنا الصغير!',
      en: 'You sorted the paper—our little champion!',
    },
    {
      ar: 'فرزت الورق—يا لك من طفل ناضج!',
      en: 'You sorted the paper—such a mature child!',
    },
  ])('rejects an unreviewed label appended to action praise: $en', (praise) => {
    const baseline = counters();
    expect(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise,
        neutralObservation: null,
        uncertainty: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
    expect(counters()).toEqual(baseline);
  });

  it('keeps every praise/recognition command Parent-only and never mutates reward as Child', () => {
    const baseline = counters();
    usePrototypeStore.getState().setRole('child');
    expect(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(
      usePrototypeStore.getState().confirmAndPresentPraise(
        {
          submissionId: 'submission_recycling_p0_v1_attempt_1',
          praise: PREPARED_PRAISE,
          neutralObservation: null,
          uncertainty: null,
        },
        {
          actionId: 'child-role-confirm-attempt',
          source: 'parent_press',
          presentedAt: '2026-08-26T10:00:00.000Z',
        },
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    usePrototypeStore.getState().setRole('parent');
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    usePrototypeStore.getState().setRole('child');
    expect(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'child-role-praise-attempt',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    usePrototypeStore.getState().setRole('parent');
    expectOk(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'parent-role-praise-setup',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      }),
    );
    usePrototypeStore.getState().setRole('child');
    expect(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'child-role-recognition-attempt',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'parent-role-praise-setup',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
    expect(counters()).toEqual(baseline);
  });

  it('uses exactly two Parent actions: confirm renders praise, then continuation applies recognition', () => {
    const baseline = counters();
    const presented = usePrototypeStore.getState().confirmAndPresentPraise(
      {
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      },
      {
        actionId: 'us3-first-visible-confirm',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      },
    );
    expectOk(presented);
    expect(presented.data).toMatchObject({
      renderState: 'praise_presented',
      presentationActionId: 'us3-first-visible-confirm',
      checkIn: { confirmationPresentation: 'praise_presented' },
    });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});

    expectOk(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'us3-second-visible-recognition',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'us3-first-visible-confirm',
      }),
    );
    expect(counters()).toEqual({
      salemSeeds: 60,
      mangroveSeeds: 60,
      mangroveStage: 'sapling',
      canopyLeaves: 20,
      circleActions: 12,
    });
  });

  it('renders action-specific praise as an observable zero-counter phase before a distinct continuation', () => {
    const baseline = counters();
    const planned = usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    });
    expect(planned).toMatchObject({
      ok: true,
      data: {
        disposition: 'pending_praise',
        plan: {
          praise: PREPARED_PRAISE,
          renderState: 'confirmation_pending',
        },
      },
    });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});

    const presented = usePrototypeStore.getState().markPraisePresented({
      actionId: 'us3-praise-presented',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });
    expect(presented).toMatchObject({
      ok: true,
      data: {
        renderState: 'praise_presented',
        presentationActionId: 'us3-praise-presented',
        continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
        checkIn: { confirmationPresentation: 'praise_presented' },
      },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('confirmed');
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});

    expect(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'us3-praise-presented',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'us3-praise-presented',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(counters()).toEqual(baseline);
  });

  it('fails closed on every stale recognition link and a caller-forged idempotency key', () => {
    const corruptions = [
      'active_assignment',
      'assignment_task',
      'assignment_child',
      'submission_assignment',
      'submission_version',
      'checkin_submission',
      'plan_task_version',
      'plan_recognition_key',
    ] as const;

    for (const corruption of corruptions) {
      usePrototypeStore.getState().setRole('parent');
      expectOk(usePrototypeStore.getState().resetPrototype());
      usePrototypeStore.setState(createSubmittedP0Session());
      usePrototypeStore.getState().setRole('parent');
      planAndPresentPraise();
      const baseline = counters();
      const state = usePrototypeStore.getState();
      const journey = state.journey;
      const plan = state.confirmationPlan;
      if (!journey?.assignment || !journey.submission || !journey.checkIn) {
        throw new Error('Expected a complete confirmed journey');
      }
      if (!plan || plan.renderState !== 'praise_presented') {
        throw new Error('Expected a praise-presented plan');
      }

      switch (corruption) {
        case 'active_assignment':
          usePrototypeStore.setState({ activeAssignmentId: 'assignment_stale' });
          break;
        case 'assignment_task':
          usePrototypeStore.setState({
            journey: {
              ...journey,
              assignment: { ...journey.assignment, taskId: 'task_stale' },
            },
          });
          break;
        case 'assignment_child':
          usePrototypeStore.setState({
            journey: {
              ...journey,
              assignment: { ...journey.assignment, childId: 'child_alya' },
            },
          });
          break;
        case 'submission_assignment':
          usePrototypeStore.setState({
            journey: {
              ...journey,
              submission: { ...journey.submission, assignmentId: 'assignment_stale' },
            },
          });
          break;
        case 'submission_version':
          usePrototypeStore.setState({
            journey: {
              ...journey,
              submission: { ...journey.submission, taskVersion: 99 },
            },
          });
          break;
        case 'checkin_submission':
          usePrototypeStore.setState({
            journey: {
              ...journey,
              checkIn: { ...journey.checkIn, submissionId: 'submission_stale' },
            },
          });
          break;
        case 'plan_task_version':
          usePrototypeStore.setState({
            confirmationPlan: {
              ...plan,
              journey: {
                ...plan.journey,
                task: { ...plan.journey.task, version: 99 },
              },
            },
          });
          break;
        case 'plan_recognition_key':
          usePrototypeStore.setState({
            confirmationPlan: { ...plan, recognitionKey: 'recognition:forged' },
          });
          break;
      }

      expect(
        usePrototypeStore.getState().applyRecognition({
          actionId: `reject-corruption:${corruption}`,
          source: 'parent_press',
          observedRenderState: 'praise_presented',
          presentationActionId: 'us3-praise-presented',
        }),
        corruption,
      ).toMatchObject({ ok: false });
      expect(usePrototypeStore.getState().recognitionLedger, corruption).toEqual({});
      expect(counters(), corruption).toEqual(baseline);
    }
  });

  it('stores one exact immutable receipt and admits the matching recognized journey as already confirmed', () => {
    planAndPresentPraise();
    const first = usePrototypeStore.getState().applyRecognition({
      actionId: 'us3-recognize-later',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'us3-praise-presented',
    });
    expectOk(first);
    expect(first.data).toMatchObject({
      disposition: 'applied',
      journey: { lifecycle: 'recognized' },
      receipt: {
        recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
        seedTransaction: { amount: 12, balanceBefore: 48, balanceAfter: 60 },
        landscapeGrowth: {
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          symbolicOnly: true,
        },
        canopyContribution: { leafDelta: 1 },
        circleEvent: { actionDelta: 1 },
        phaseReview: null,
      },
    });
    expect(first.data.receipt).not.toHaveProperty('alreadyApplied');
    const storedReceipt = structuredClone(first.data.receipt);

    const admitted = serviceRegistry.recognition.resolveCheckInState(
      usePrototypeStore.getState(),
      'submission_recycling_p0_v1_attempt_1',
    );
    expect(admitted).toMatchObject({
      ok: true,
      data: {
        state: 'already_confirmed',
        attempt: {
          disposition: 'already_confirmed',
          receipt: storedReceipt,
          message: { ar: expect.any(String), en: expect.any(String) },
        },
      },
    });
  });

  it('makes five repeat confirmations neutral no-ops with the same receipt and no new celebration', () => {
    planAndPresentPraise();
    const first = usePrototypeStore.getState().applyRecognition({
      actionId: 'us3-recognize-first',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'us3-praise-presented',
    });
    expectOk(first);
    const receipt = structuredClone(first.data.receipt);
    const afterFirst = counters();
    const celebration = structuredClone(usePrototypeStore.getState().celebration);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const duplicate = usePrototypeStore.getState().applyRecognition({
        actionId: `us3-duplicate-${attempt}`,
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'us3-praise-presented',
      });
      expect(duplicate).toMatchObject({
        ok: true,
        data: {
          disposition: 'already_confirmed',
          receipt,
          message: { ar: expect.any(String), en: expect.stringContaining('already confirmed') },
        },
      });
      expect(counters()).toEqual(afterFirst);
      expect(usePrototypeStore.getState().celebration).toEqual(celebration);
      expect(Object.keys(usePrototypeStore.getState().recognitionLedger)).toEqual([
        'recognition:submission_recycling_p0_v1_attempt_1',
      ]);
    }
  });

  it('keeps a third fade-first acquisition review unselected, future-only, and reversible', () => {
    const policy = evaluateRecognitionPolicy({
      submissionId: 'third-fade-first-acquisition',
      recognitionMode: 'fade_first',
      routinePhase: 'acquisition',
      recurrence: 'recurrent',
      displayedSeedAward: 8,
      completionMode: 'permitted_help',
      confirmedAcquisitionCount: 3,
      existingReceipt: null,
    });
    expect(policy).toMatchObject({
      ok: true,
      data: {
        disposition: 'new',
        phaseReview: {
          confirmedAcquisitionCount: 3,
          options: ['keep_acquisition', 'move_future_to_maintenance'],
          selected: null,
          appliesTo: 'future_completions_only',
          reversibleByParent: true,
        },
      },
    });
  });
});
