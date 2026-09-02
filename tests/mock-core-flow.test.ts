import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParentGuideService } from '../src/services';
import { serviceRegistry } from '../src/services';
import { PREPARED_PRAISE } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectOk(result: { readonly ok: boolean }): void {
  expect(result).toMatchObject({ ok: true });
  if (!result.ok) throw new Error('Expected deterministic store command to succeed');
}

function currentCounters() {
  const state = usePrototypeStore.getState();
  return {
    salemSeeds: state.children.child_salem.earnedSeeds,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
  };
}

async function completeOfflineCycle(cycle: number): Promise<void> {
  const reset = usePrototypeStore.getState().resetPrototype();
  expect(reset).toMatchObject({
    ok: true,
    data: { navigateTo: '/', replaceHistory: true },
  });
  expect(currentCounters()).toEqual({
    salemSeeds: 48,
    mangroveSeeds: 48,
    mangroveStage: 'shoot',
    canopyLeaves: 19,
    circleActions: 11,
  });

  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText: {
        ar: 'أخرج مواد إعادة التدوير.',
        en: 'Take the recycling out.',
      },
    }),
  );
  const guide = await usePrototypeStore.getState().requestParentGuide({
    requestId: `offline-guide-${cycle}`,
    intent: 'make_clearer',
  });
  expect(guide).toMatchObject({
    ok: true,
    data: {
      originalParentText: {
        ar: 'أخرج مواد إعادة التدوير.',
        en: 'Take the recycling out.',
      },
      accepted: false,
      meta: {
        requestId: `offline-guide-${cycle}`,
        origin: 'prepared',
        fixtureId: 'guide_recycling_refine_v1',
        fallbackUsed: false,
      },
    },
  });
  expectOk(usePrototypeStore.getState().acceptGuideSuggestion());
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());

  expect(currentCounters()).toEqual({
    salemSeeds: 48,
    mangroveSeeds: 48,
    mangroveStage: 'shoot',
    canopyLeaves: 19,
    circleActions: 11,
  });
  expect(usePrototypeStore.getState().journey).toMatchObject({
    lifecycle: 'assigned',
    assignment: {
      childId: 'child_salem',
      approvedByParent: true,
      taskVersion: 1,
    },
  });

  usePrototypeStore.getState().setRole('child');
  usePrototypeStore.getState().setActiveChild('child_salem');
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expect(usePrototypeStore.getState().journey?.lifecycle).toBe('chosen');
  expectOk(usePrototypeStore.getState().startAssignment());
  expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');

  const coach = await usePrototypeStore.getState().requestChildCoach({
    requestId: `offline-coach-${cycle}`,
    intent: 'show_steps',
  });
  expect(coach).toMatchObject({
    ok: true,
    data: {
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
      changesDefinitionOfDone: false,
      meta: {
        requestId: `offline-coach-${cycle}`,
        audience: 'child',
        origin: 'prepared',
        fixtureId: 'coach_recycling_steps_v1',
        fallbackUsed: false,
      },
      adultExit: { alwaysVisible: true },
    },
  });

  expectOk(
    usePrototypeStore.getState().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: {
        ar: 'فحص شخص بالغ المواد وحمل الكيس وتولى التخلّص منه.',
        en: 'An adult checked the items, carried the bag, and handled disposal.',
      },
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [
        {
          ar: 'فرز سالم الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ.',
          en: 'Salem sorted the clean paper and plastic approved by an adult.',
        },
      ],
    }),
  );
  expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
  expect(currentCounters()).toEqual({
    salemSeeds: 48,
    mangroveSeeds: 48,
    mangroveStage: 'shoot',
    canopyLeaves: 19,
    circleActions: 11,
  });

  usePrototypeStore.getState().setRole('parent');
  const submissionId = usePrototypeStore.getState().journey?.submission?.id;
  expect(submissionId).toBe('submission_recycling_p0_v1_attempt_1');
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: submissionId ?? '',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(
    usePrototypeStore.getState().markPraisePresented({
      actionId: `offline-praise-${cycle}`,
      source: 'parent_press',
      presentedAt: `2026-08-26T10:00:0${cycle}.000Z`,
    }),
  );
  expect(currentCounters()).toEqual({
    salemSeeds: 48,
    mangroveSeeds: 48,
    mangroveStage: 'shoot',
    canopyLeaves: 19,
    circleActions: 11,
  });

  const recognized = usePrototypeStore.getState().applyRecognition({
    actionId: `offline-recognition-${cycle}`,
    source: 'parent_press',
    observedRenderState: 'praise_presented',
    presentationActionId: `offline-praise-${cycle}`,
  });
  expect(recognized).toMatchObject({
    ok: true,
    data: {
      disposition: 'applied',
      receipt: {
        recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
        seedTransaction: { amount: 12 },
        canopyContribution: { leafDelta: 1 },
        circleEvent: { actionDelta: 1 },
      },
    },
  });
  expect(currentCounters()).toEqual({
    salemSeeds: 60,
    mangroveSeeds: 60,
    mangroveStage: 'sapling',
    canopyLeaves: 20,
    circleActions: 12,
  });
}

function unavailableParentGuide(
  code: 'TIMEOUT' | 'REMOTE_UNAVAILABLE' | 'INVALID_RESPONSE' | 'SAFETY_REJECTED',
) {
  const error = {
    code,
    message: `Synthetic ${code} test`,
    retryable: code === 'TIMEOUT' || code === 'REMOTE_UNAVAILABLE',
    fallbackAvailable: true,
  } as const;
  return {
    refineTask: async () => ({ ok: false as const, error }),
    summarizePattern: async () => ({ ok: false as const, error }),
  } satisfies ParentGuideService;
}

describe('Feature 003 deterministic external-service-denied store flow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('completes five reset-to-circle-ready cycles without any network call', async () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('External services are denied')));
    vi.stubGlobal('fetch', fetchSpy);

    expect(serviceRegistry).toMatchObject({
      parentGuide: { mode: 'deterministic_prepared' },
      childCoach: { mode: 'deterministic_prepared' },
    });
    expect(serviceRegistry).not.toHaveProperty('liveParentGuide');
    expect(serviceRegistry).not.toHaveProperty('liveChildCoach');

    for (let cycle = 1; cycle <= 5; cycle += 1) {
      await completeOfflineCycle(cycle);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['TIMEOUT', 'timeout'],
    ['REMOTE_UNAVAILABLE', 'remote_failure'],
    ['INVALID_RESPONSE', 'malformed_response'],
    ['SAFETY_REJECTED', 'safety_rejected'],
  ] as const)(
    'uses the prepared result on the same attempt after %s',
    async (code, fallbackReason) => {
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: {
          ar: 'أخرج مواد إعادة التدوير.',
          en: 'Take the recycling out.',
        },
      });
      const requestId = `fallback-${code}`;
      const result = await usePrototypeStore
        .getState()
        .requestParentGuide({ requestId, intent: 'make_clearer' }, unavailableParentGuide(code));

      expect(result).toMatchObject({
        ok: true,
        data: {
          originalParentText: {
            ar: 'أخرج مواد إعادة التدوير.',
            en: 'Take the recycling out.',
          },
          meta: {
            requestId,
            origin: 'prepared',
            fixtureId: 'guide_recycling_refine_v1',
            fallbackUsed: true,
            fallbackReason,
            disclosure: { preparedIsExplicit: true, saysAiMayBeWrong: true },
          },
        },
      });
      expect(usePrototypeStore.getState().journey).toMatchObject({
        lifecycle: 'draft',
        task: {
          parentOriginalText: {
            ar: 'أخرج مواد إعادة التدوير.',
            en: 'Take the recycling out.',
          },
          acceptedGuideFixtureId: null,
        },
      });
      expect(currentCounters()).toEqual({
        salemSeeds: 48,
        mangroveSeeds: 48,
        mangroveStage: 'shoot',
        canopyLeaves: 19,
        circleActions: 11,
      });
    },
  );
});
