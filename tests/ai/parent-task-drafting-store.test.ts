import { beforeEach, describe, expect, it } from 'vitest';

import { createPreparedParentTaskDraftSuggestion } from '@/services';
import type { ParentTaskDraftingService } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const parentText = {
  ar: 'افرز الورق والبلاستيك النظيفين بعد فحص شخص بالغ.',
  en: 'Sort clean paper and plastic after an adult check.',
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function createDraft() {
  const result = usePrototypeStore.getState().createTaskDraft({
    childId: 'child_salem',
    templateId: 'task_recycling_p0_v1',
    parentText,
  });
  expectOk(result);
}

function requestInput(id: string) {
  return {
    requestId: `request_${id}_123456`,
    bindingNonce: `binding_${id}_123456`,
    intent: 'make_clearer' as const,
    effortBand: 'fifteen_thirty' as const,
    stepCount: 2,
    supportMode: 'adult_alongside' as const,
  };
}

function progressionSnapshot() {
  const state = usePrototypeStore.getState();
  return {
    children: state.children,
    landscapeProgress: state.landscapeProgress,
    canopy: state.household.combinedCanopy,
    circleGoal: state.circleGoal,
    familyReward: state.familyReward,
    growthJourney: state.growthJourney,
    activeAssignmentId: state.activeAssignmentId,
  };
}

describe('F4 Parent task drafting store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
    createDraft();
  });

  it('requests a prepared suggestion and changes no task before explicit acceptance', async () => {
    const before = structuredClone(usePrototypeStore.getState().journey);
    const progression = structuredClone(progressionSnapshot());
    const result = await usePrototypeStore.getState().requestParentTaskDraft(requestInput('ready'));

    expectOk(result);
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'ready',
      origin: 'prepared',
      suggestion: { requestId: 'request_ready_123456' },
      retainedCopy: expect.any(Object),
      acceptedAttribution: null,
    });
    expect(usePrototypeStore.getState().journey).toEqual(before);
    expect(progressionSnapshot()).toEqual(progression);
  });

  it('uses the prepared provider in the same attempt when primary fails', async () => {
    const unavailable: ParentTaskDraftingService = {
      async draft() {
        return {
          ok: false,
          error: {
            code: 'REMOTE_UNAVAILABLE',
            message: 'synthetic outage',
            retryable: false,
            fallbackAvailable: true,
          },
        };
      },
    };

    const result = await usePrototypeStore
      .getState()
      .requestParentTaskDraft(requestInput('fallback'), unavailable);

    expectOk(result);
    expect(result.meta).toMatchObject({ origin: 'prepared', fallbackUsed: true });
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'fallback',
      origin: 'prepared',
      fallbackReason: 'remote_unavailable',
    });
  });

  it('discards a response after a draft edit makes its snapshot stale', async () => {
    const gate: {
      release?: (value: ReturnType<typeof createPreparedParentTaskDraftSuggestion>) => void;
    } = {};
    const pendingProvider: ParentTaskDraftingService = {
      draft(request) {
        return new Promise((resolve) => {
          gate.release = (value) =>
            resolve(
              value
                ? {
                    ok: true,
                    data: value,
                    meta: { origin: 'live', fallbackUsed: false },
                  }
                : {
                    ok: false,
                    error: {
                      code: 'INVALID_RESPONSE',
                      message: 'missing fixture',
                      retryable: false,
                      fallbackAvailable: true,
                    },
                  },
            );
        });
      },
    };
    const input = requestInput('stale');
    const pending = usePrototypeStore.getState().requestParentTaskDraft(input, pendingProvider);
    expectOk(
      usePrototypeStore.getState().updateTaskDraftParentText({
        ar: 'افرز المواد النظيفة بمساعدة شخص بالغ.',
        en: 'Sort clean items with adult help.',
      }),
    );
    gate.release?.(
      createPreparedParentTaskDraftSuggestion({
        requestId: input.requestId,
        bindingNonce: input.bindingNonce,
        archetypeId: 'task_recycling_p0_v1',
      }),
    );

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'idle',
      suggestion: null,
    });
  });

  it('supports accept, keep, and edit decisions with zero progression effects', async () => {
    const progression = structuredClone(progressionSnapshot());
    expectOk(await usePrototypeStore.getState().requestParentTaskDraft(requestInput('accept')));
    expectOk(usePrototypeStore.getState().acceptParentTaskDraft());
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'idle',
      decision: 'accepted',
      acceptedAttribution: { origin: 'prepared', schemaVersion: '1.0' },
    });
    expect(progressionSnapshot()).toEqual(progression);

    expectOk(await usePrototypeStore.getState().requestParentTaskDraft(requestInput('keep')));
    expectOk(usePrototypeStore.getState().keepParentTaskDraft());
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'idle',
      decision: 'kept',
      suggestion: null,
    });

    expectOk(await usePrototypeStore.getState().requestParentTaskDraft(requestInput('edit')));
    expectOk(usePrototypeStore.getState().editParentTaskDraft());
    expect(usePrototypeStore.getState().parentTaskDraftingView).toMatchObject({
      status: 'idle',
      decision: 'edited',
      suggestion: null,
    });
    expect(progressionSnapshot()).toEqual(progression);
  });

  it('passes an accepted bounded copy through the existing Parent review lifecycle', async () => {
    expectOk(await usePrototypeStore.getState().requestParentTaskDraft(requestInput('review')));
    expectOk(usePrototypeStore.getState().acceptParentTaskDraft());

    expectOk(usePrototypeStore.getState().reviewTask());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'reviewed',
      assignment: null,
      task: { acceptedGuideFixtureId: 'bounded_parent_task_draft_v1' },
    });
  });
});
