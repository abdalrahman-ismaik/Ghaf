import { existsSync, readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { P0_RECYCLING_TEMPLATE, TASK_CATEGORIES } from '../src/features/tasks/demoContent';
import { serviceRegistry, type ParentGuideService } from '../src/services';
import { PARENT_GUIDE_FIXTURE } from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const PARENT_WORDING = {
  ar: 'أخرج مواد إعادة التدوير.',
  en: 'Take the recycling out.',
} as const;

const EDITED_PARENT_WORDING = {
  ar: 'افرز المواد النظيفة ثم خذها مع شخص بالغ.',
  en: 'Sort the clean materials, then take them with an adult.',
} as const;

const SAFE_PARENT_AUTHORED_ACTION = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
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

function createP0Draft() {
  return usePrototypeStore.getState().createTaskDraft({
    childId: 'child_salem',
    templateId: 'task_recycling_p0_v1',
    parentText: PARENT_WORDING,
  });
}

function createReviewableP0Draft() {
  return usePrototypeStore.getState().createTaskDraft({
    childId: 'child_salem',
    templateId: 'task_recycling_p0_v1',
    parentText: SAFE_PARENT_AUTHORED_ACTION,
  });
}

describe('US1 Parent task approval flow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  it('has both authored Parent task routes for composing and reviewing the assignment', () => {
    expect(
      existsSync(new URL('../app/parent/task/new.tsx', import.meta.url)),
      '/parent/task/new must be an authored Feature 003 route',
    ).toBe(true);
    expect(
      existsSync(new URL('../app/parent/task/review.tsx', import.meta.url)),
      '/parent/task/review must be an authored Feature 003 route',
    ).toBe(true);
  });

  it('explains a safety-rejected Parent draft instead of showing a generic retry', () => {
    const source = readFileSync(
      new URL('../src/components/family-growth/ParentTaskComposer.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain("result.error.code === 'SAFETY_REJECTED'");
    expect(source).toContain("t('taskNew.reviewNeedsSafety')");
  });

  it('keeps assignment approval navigation ahead of the invalid-review deep-link guard', () => {
    const source = readFileSync(new URL('../app/parent/task/review.tsx', import.meta.url), 'utf8');
    expect(source).toContain('const approvalNavigationPending = useRef(false)');
    expect(source).toMatch(
      /approvalNavigationPending\.current = true;[\s\S]{0,120}approveAssignment\(\)/,
    );
    expect(source).toContain('!reviewable && !approvalNavigationPending.current');
    expect(source).toContain("router.replace('/role')");
  });

  it('exposes Salem, all eight categories, all five landscape tracks, and the distinct P0 task', () => {
    const state = usePrototypeStore.getState();

    expect(state.children.child_salem).toMatchObject({
      id: 'child_salem',
      age: 9,
      ageBand: '9_11',
      origin: 'synthetic',
    });
    expect(TASK_CATEGORIES).toHaveLength(8);
    expect(new Set(TASK_CATEGORIES.map((category) => category.landscapeId))).toEqual(
      new Set(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']),
    );
    expect(P0_RECYCLING_TEMPLATE).toMatchObject({
      id: 'task_recycling_p0_v1',
      categoryId: 'green_impact',
      landscapeId: 'mangrove',
      estimatedEffort: { ar: '15–30 دقيقة', en: '15–30 minutes' },
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      recurrence: 'once',
      displayedSeedAward: 12,
      visibilityScope: 'household',
      circleEligible: true,
    });

    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'missing-template',
        parentText: PARENT_WORDING,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  it('keeps the sole executable P0 recycling assignment bound to Salem', () => {
    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_alya',
        templateId: 'task_recycling_p0_v1',
        parentText: SAFE_PARENT_AUTHORED_ACTION,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(usePrototypeStore.getState().journey).toBeNull();
    expect(usePrototypeStore.getState().choicePool.p0AssignmentChoice).toBeNull();
  });

  it('keeps Parent task drafting, Guide use, and review inside the Parent demo role', async () => {
    usePrototypeStore.getState().setRole('child');
    expect(createReviewableP0Draft()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journey).toBeNull();

    usePrototypeStore.getState().setRole('parent');
    expectOk(createReviewableP0Draft());
    usePrototypeStore.getState().setRole('child');
    expect(
      await usePrototypeStore.getState().requestParentGuide({
        requestId: 'child-role-parent-guide-attempt',
        intent: 'make_clearer',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('draft');
  });

  it('keeps Parent wording unchanged until the prepared Guide suggestion is explicitly accepted', async () => {
    expectOk(createP0Draft());
    const baseline = counters();

    const guide = await usePrototypeStore.getState().requestParentGuide({
      requestId: 'us1-guide-accept',
      intent: 'make_clearer',
    });

    expectOk(guide);
    expect(guide.data).toMatchObject({
      originalParentText: PARENT_WORDING,
      accepted: false,
      availableActions: ['accept_suggestion', 'keep_mine', 'make_smaller'],
      meta: {
        requestId: 'us1-guide-accept',
        audience: 'parent',
        origin: 'prepared',
        fixtureId: 'guide_recycling_refine_v1',
        fallbackUsed: false,
        disclosure: {
          preparedIsExplicit: true,
          saysAiMayBeWrong: true,
          saysHumanDecides: true,
        },
      },
    });
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'draft',
      assignment: null,
      task: {
        parentOriginalText: PARENT_WORDING,
        acceptedGuideFixtureId: null,
      },
    });

    expectOk(usePrototypeStore.getState().acceptGuideSuggestion());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'draft',
      assignment: null,
      task: {
        parentOriginalText: PARENT_WORDING,
        acceptedGuideFixtureId: 'guide_recycling_refine_v1',
      },
    });
    expect(counters()).toEqual(baseline);
  });

  it('requires the Parent to resolve a pending Guide comparison exactly once before editing or review', async () => {
    expectOk(createP0Draft());
    expectOk(
      await usePrototypeStore.getState().requestParentGuide({
        requestId: 'us1-guide-pending-decision',
        intent: 'make_clearer',
      }),
    );
    const pendingSuggestion = structuredClone(usePrototypeStore.getState().parentGuideSuggestion);

    expect(
      usePrototypeStore.getState().updateTaskDraftParentText(EDITED_PARENT_WORDING),
    ).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    await expect(
      usePrototypeStore.getState().requestParentGuide({
        requestId: 'us1-guide-conflicting-intent',
        intent: 'check_safety',
      }),
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      parentGuideSuggestion: pendingSuggestion,
      journey: {
        lifecycle: 'draft',
        task: { parentOriginalText: PARENT_WORDING, acceptedGuideFixtureId: null },
      },
    });

    expectOk(usePrototypeStore.getState().acceptGuideSuggestion());
    expect(usePrototypeStore.getState()).toMatchObject({
      parentGuideSuggestion: null,
      journey: {
        lifecycle: 'draft',
        task: {
          parentOriginalText: PARENT_WORDING,
          acceptedGuideFixtureId: 'guide_recycling_refine_v1',
        },
      },
    });
    expect(usePrototypeStore.getState().acceptGuideSuggestion()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expectOk(usePrototypeStore.getState().reviewTask());
  });

  it('falls back after 1500ms and ignores a valid primary Guide result that arrives late', async () => {
    vi.useFakeTimers();
    try {
      expectOk(createP0Draft());
      let releasePrimary: (() => void) | undefined;
      const gate = new Promise<void>((resolve) => {
        releasePrimary = resolve;
      });
      const latePrimary: ParentGuideService = {
        refineTask: async (request) => {
          await gate;
          return serviceRegistry.parentGuide.refineTask(request);
        },
        summarizePattern: (request) => serviceRegistry.parentGuide.summarizePattern(request),
      };

      const pending = usePrototypeStore
        .getState()
        .requestParentGuide(
          { requestId: 'us1-guide-real-timeout', intent: 'make_clearer' },
          latePrimary,
        );
      await vi.advanceTimersByTimeAsync(1499);
      expect(usePrototypeStore.getState().parentGuideSuggestion).toBeNull();
      await vi.advanceTimersByTimeAsync(1);

      const fallback = await pending;
      expectOk(fallback);
      expect(fallback).toMatchObject({
        meta: { origin: 'prepared', fallbackUsed: true },
        data: {
          originalParentText: PARENT_WORDING,
          meta: {
            requestId: 'us1-guide-real-timeout',
            fallbackUsed: true,
            fallbackReason: 'timeout',
          },
        },
      });
      const displayedFallback = structuredClone(usePrototypeStore.getState().parentGuideSuggestion);

      releasePrimary?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(usePrototypeStore.getState().parentGuideSuggestion).toEqual(displayedFallback);
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves the original wording and creates no assignment when the Parent chooses Keep mine', async () => {
    expectOk(createP0Draft());
    expectOk(
      await usePrototypeStore.getState().requestParentGuide({
        requestId: 'us1-guide-keep',
        intent: 'check_safety',
      }),
    );

    expectOk(usePrototypeStore.getState().keepParentText());
    expect(usePrototypeStore.getState()).toMatchObject({
      parentGuideSuggestion: null,
      activeAssignmentId: null,
      journey: {
        lifecycle: 'draft',
        assignment: null,
        task: {
          parentOriginalText: PARENT_WORDING,
          acceptedGuideFixtureId: null,
        },
      },
    });
  });

  it('reviews the Parent-authored positive action after Keep mine instead of the untouched template action', async () => {
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: SAFE_PARENT_AUTHORED_ACTION,
      }),
    );
    expectOk(
      await usePrototypeStore.getState().requestParentGuide({
        requestId: 'us1-guide-keep-reviewed-action',
        intent: 'make_clearer',
      }),
    );

    expectOk(usePrototypeStore.getState().keepParentText());
    expect(usePrototypeStore.getState().journey?.task.content.positiveAction).toEqual(
      SAFE_PARENT_AUTHORED_ACTION,
    );
    expectOk(usePrototypeStore.getState().reviewTask());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'reviewed',
      task: {
        parentOriginalText: SAFE_PARENT_AUTHORED_ACTION,
        acceptedGuideFixtureId: null,
        content: { positiveAction: SAFE_PARENT_AUTHORED_ACTION },
      },
    });
  });

  it('blocks hazardous Parent-authored instructions even when the retained safety metadata is safe', () => {
    const hazardous = {
      ar: 'احمل الزجاج والبطاريات إلى الحاوية بنفسك.',
      en: 'Carry the glass and batteries to the bin yourself.',
    } as const;
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: hazardous,
      }),
    );
    expectOk(usePrototypeStore.getState().keepParentText());

    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'draft',
      assignment: null,
    });
  });

  it('falls back before display when a successful Guide response changes canonical task content', async () => {
    expectOk(createP0Draft());
    const unsafePrimary: ParentGuideService = {
      refineTask: async (request) => {
        const prepared = await serviceRegistry.parentGuide.refineTask(request);
        if (!prepared.ok) return prepared;
        return {
          ...prepared,
          data: {
            ...prepared.data,
            suggestedContent: {
              ...prepared.data.suggestedContent,
              definitionOfDone: {
                ar: 'اجمع المواد الفاسدة والأكياس المتسربة وضعها في الحاوية.',
                en: 'Collect the spoiled material and leaking bags and put them in the bin.',
              },
            },
          },
        };
      },
      summarizePattern: (request) => serviceRegistry.parentGuide.summarizePattern(request),
    };

    const result = await usePrototypeStore
      .getState()
      .requestParentGuide(
        { requestId: 'unsafe-successful-guide-content', intent: 'make_clearer' },
        unsafePrimary,
      );
    expectOk(result);
    expect(result.data).toMatchObject({
      suggestedContent: PARENT_GUIDE_FIXTURE.suggestedContent,
      meta: { fallbackUsed: true, fallbackReason: 'malformed_response' },
    });
    expectOk(usePrototypeStore.getState().acceptGuideSuggestion());
    expectOk(usePrototypeStore.getState().reviewTask());
  });

  it('rejects a P0 draft whose non-action content no longer matches the canonical task', () => {
    expectOk(createReviewableP0Draft());
    const journey = usePrototypeStore.getState().journey;
    if (!journey) throw new Error('Expected a draft journey');
    usePrototypeStore.setState({
      journey: {
        ...journey,
        task: {
          ...journey.task,
          content: {
            ...journey.task.content,
            definitionOfDone: {
              ar: 'اجمع المواد الفاسدة والأكياس المتسربة وضعها في الحاوية.',
              en: 'Collect the spoiled material and leaking bags and put them in the bin.',
            },
          },
        },
      },
    });

    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
  });

  it('blocks review when a required bilingual or safety-critical field is incomplete', () => {
    expectOk(createReviewableP0Draft());
    const journey = usePrototypeStore.getState().journey;
    if (!journey) throw new Error('Expected a draft journey');

    usePrototypeStore.setState({
      journey: {
        ...journey,
        task: {
          ...journey.task,
          content: {
            ...journey.task.content,
            definitionOfDone: { ...journey.task.content.definitionOfDone, en: '' },
          },
        },
      },
    });

    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'draft',
      assignment: null,
    });
  });

  it('carries the exact Arabic-first/English-equivalent task, safety, privacy, and reward contract into review', () => {
    expectOk(createReviewableP0Draft());
    expectOk(usePrototypeStore.getState().reviewTask());

    const content = usePrototypeStore.getState().journey?.task.content;
    expect(content).toMatchObject({
      title: {
        ar: 'فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر',
        en: 'Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin',
      },
      estimatedEffort: { ar: '15–30 دقيقة', en: '15–30 minutes' },
      evidencePolicy: 'optional_prepared_only',
      reflectionPolicy: 'optional_task_focused',
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      recurrence: 'once',
      displayedSeedAward: 12,
      landscapeId: 'mangrove',
      visibilityScope: 'household',
      circleEligible: true,
      safety: {
        adultPreCheck: {
          ar: expect.stringContaining('يفحص شخص بالغ جميع المواد مسبقاً'),
          en: expect.stringContaining('An adult pre-checks every item'),
        },
        adultSecondCheck: {
          ar: expect.stringContaining('يعيد الشخص البالغ الفحص'),
          en: expect.stringContaining('second check'),
        },
        stopAndAskAdult: {
          ar: expect.stringContaining('سؤال شخص بالغ'),
          en: expect.stringContaining('ask an adult'),
        },
        routeConstraint: {
          ar: expect.stringContaining('لا يتطلب المسار عبور طريق'),
          en: expect.stringContaining('requires no road crossing'),
        },
        indoorAlternative: {
          ar: expect.stringContaining('بديل داخلي'),
          en: expect.stringContaining('indoor alternative'),
        },
        aftercare: {
          ar: expect.stringContaining('تُغسل اليدان'),
          en: expect.stringContaining('Wash hands'),
        },
      },
    });
    expect(content?.definitionOfDone).toEqual(P0_RECYCLING_TEMPLATE.definitionOfDone);
    expect(content?.whyItMatters).toEqual(P0_RECYCLING_TEMPLATE.whyItMatters);
    expect(content?.permittedHelp).toEqual(P0_RECYCLING_TEMPLATE.permittedHelp);
    expect(content?.supervision).toEqual(P0_RECYCLING_TEMPLATE.supervision);
    expect(content?.privacyNotice).toEqual(P0_RECYCLING_TEMPLATE.privacyNotice);
  });

  it('returns a reviewed task to an editable draft without losing content or creating recognition', () => {
    expectOk(createReviewableP0Draft());
    const baseline = counters();
    const originalTask = usePrototypeStore.getState().journey?.task;

    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().returnReviewedTaskToDraft());
    expectOk(usePrototypeStore.getState().updateTaskDraftParentText(EDITED_PARENT_WORDING));

    expect(usePrototypeStore.getState()).toMatchObject({
      activeAssignmentId: null,
      choicePool: { p0AssignmentChoice: null },
      journey: {
        lifecycle: 'draft',
        assignment: null,
        submission: null,
        checkIn: null,
        task: {
          ...originalTask,
          parentOriginalText: EDITED_PARENT_WORDING,
          acceptedGuideFixtureId: null,
          content: {
            ...originalTask?.content,
            positiveAction: EDITED_PARENT_WORDING,
          },
        },
      },
    });
    expect(counters()).toEqual(baseline);
  });

  it('creates exactly one executable Salem choice only after explicit approval and changes no counters', () => {
    expectOk(createReviewableP0Draft());
    const baseline = counters();

    expectOk(usePrototypeStore.getState().reviewTask());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeAssignmentId: null,
      choicePool: { p0AssignmentChoice: null },
      journey: { lifecycle: 'reviewed', assignment: null },
    });
    expect(counters()).toEqual(baseline);

    expectOk(usePrototypeStore.getState().approveAssignment());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeAssignmentId: 'assignment_recycling_p0_v1',
      choicePool: {
        seededPreviewChoices: [
          { demoAvailability: 'display_only' },
          { demoAvailability: 'display_only' },
        ],
        p0AssignmentChoice: {
          id: 'choice_recycling_p0_v1',
          childId: 'child_salem',
          taskTemplateId: 'task_recycling_p0_v1',
          approvalState: 'parent_approved_fixture',
          demoAvailability: 'p0_executable',
        },
      },
      journey: {
        lifecycle: 'assigned',
        assignment: {
          id: 'assignment_recycling_p0_v1',
          childId: 'child_salem',
          approvedByParent: true,
        },
      },
    });
    expect(counters()).toEqual(baseline);

    const firstAssignment = usePrototypeStore.getState().journey;
    const repeatedApproval = usePrototypeStore.getState().approveAssignment();
    expectOk(repeatedApproval);
    expect(repeatedApproval.data).toEqual(firstAssignment);
    expect(usePrototypeStore.getState().journey).toEqual(firstAssignment);
    expect(usePrototypeStore.getState().choicePool.p0AssignmentChoice).toMatchObject({
      id: 'choice_recycling_p0_v1',
      childId: 'child_salem',
    });
    expect(counters()).toEqual(baseline);
  });

  it('rejects assignment approval outside the Parent demo role', () => {
    expectOk(createReviewableP0Draft());
    expectOk(usePrototypeStore.getState().reviewTask());
    usePrototypeStore.getState().setRole('child');

    expect(usePrototypeStore.getState().approveAssignment()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeAssignmentId: null,
      journey: { lifecycle: 'reviewed', assignment: null },
      choicePool: { p0AssignmentChoice: null },
    });
  });

  it('rejects a duplicate assignment approval when task, version, or Child identity no longer matches', () => {
    expectOk(createReviewableP0Draft());
    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().approveAssignment());
    const assigned = structuredClone(usePrototypeStore.getState().journey);
    const baseline = counters();
    expect(assigned?.assignment).not.toBeNull();

    for (const scenario of [
      { assignmentPatch: { taskId: 'different-task' } },
      { assignmentPatch: { taskVersion: 99 } },
      { assignmentPatch: { childId: 'child_alya' as const } },
      {
        assignmentPatch: { id: 'assignment_spoofed' },
        activeAssignmentId: 'assignment_spoofed',
      },
      { assignmentPatch: { approvalSequence: 99 } },
      { assignmentPatch: { createdAt: '2099-01-01T00:00:00.000Z' } },
      { assignmentPatch: { approvedByParent: false as never } },
    ]) {
      usePrototypeStore.setState({
        activeAssignmentId: scenario.activeAssignmentId ?? assigned?.assignment?.id ?? null,
        journey: assigned
          ? {
              ...assigned,
              assignment: assigned.assignment
                ? { ...assigned.assignment, ...scenario.assignmentPatch }
                : null,
            }
          : null,
      });
      expect(usePrototypeStore.getState().approveAssignment()).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      expect(counters()).toEqual(baseline);
    }
  });

  it('rejects a duplicate assignment approval when the executable choice is not an exact repeat', () => {
    expectOk(createReviewableP0Draft());
    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().approveAssignment());
    const assigned = structuredClone(usePrototypeStore.getState().journey);
    const choicePool = structuredClone(usePrototypeStore.getState().choicePool);
    const assignedChoice = choicePool.p0AssignmentChoice;
    const baseline = counters();
    expect(assignedChoice).not.toBeNull();

    for (const choicePatch of [
      { id: 'choice_preview_hr02_v1' as const },
      { approvalState: 'pending' as never },
      { demoAvailability: 'display_only' as const },
      { origin: 'live' as never },
    ]) {
      usePrototypeStore.setState({
        journey: assigned,
        choicePool: {
          ...choicePool,
          p0AssignmentChoice: assignedChoice ? { ...assignedChoice, ...choicePatch } : null,
        },
      });
      expect(usePrototypeStore.getState().approveAssignment()).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
      expect(counters()).toEqual(baseline);
    }
  });
});
