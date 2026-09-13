import { beforeEach, describe, expect, it } from 'vitest';

import { resolveAiFeatureFlags } from '@/config/aiFeatureFlags';
import { SYNTHETIC_PARENT_REAUTHENTICATION_CODE } from '@/models/access';
import type { LiveChildCoachTextService, ParentTaskDraftingService } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { configureChildAgeForTest } from '../helpers/configuredChildAge';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

const parentText = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
};

function expectOk<T>(
  result: { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: unknown },
): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  expect(result.ok).toBe(true);
  return result.data;
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
  };
}

describe('bounded AI cross-feature integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('keeps the three activation flags independent and false by default', () => {
    expect(resolveAiFeatureFlags({})).toEqual({
      ai_parent_task_drafting_live: false,
      ai_child_coach_text_live: false,
      ai_child_coach_voice_live: false,
    });
    for (const name of [
      'ai_parent_task_drafting_live',
      'ai_child_coach_text_live',
      'ai_child_coach_voice_live',
    ] as const) {
      expect(resolveAiFeatureFlags({ [name]: true })).toEqual({
        ai_parent_task_drafting_live: name === 'ai_parent_task_drafting_live',
        ai_child_coach_text_live: name === 'ai_child_coach_text_live',
        ai_child_coach_voice_live: name === 'ai_child_coach_voice_live',
      });
    }
  });

  it('combines prepared fallbacks with zero progression effects and an exact reset', async () => {
    configureChildAgeForTest('12_14');
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText,
      }),
    );
    const beforeParent = structuredClone(progressionSnapshot());
    const unavailableParent: ParentTaskDraftingService = {
      async draft() {
        return {
          ok: false,
          error: {
            code: 'REMOTE_UNAVAILABLE',
            message: 'synthetic parent outage',
            retryable: false,
            fallbackAvailable: true,
          },
        };
      },
    };
    expectOk(
      await usePrototypeStore.getState().requestParentTaskDraft(
        {
          requestId: 'request_combined_parent_123',
          bindingNonce: 'binding_combined_parent_123',
          intent: 'make_clearer',
          effortBand: 'fifteen_thirty',
          stepCount: 2,
          supportMode: 'adult_alongside',
        },
        unavailableParent,
      ),
    );
    expect(usePrototypeStore.getState().parentTaskDraftingView.status).toBe('fallback');
    expect(progressionSnapshot()).toEqual(beforeParent);
    expectOk(usePrototypeStore.getState().keepParentTaskDraft());

    for (const capability of ['text', 'voice'] as const) {
      expectOk(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability,
          granted: true,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      );
    }
    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().approveAssignment());
    await enterChildExperienceForTest('child_salem');
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());

    const beforeChild = structuredClone(progressionSnapshot());
    const unavailableChild: LiveChildCoachTextService = {
      async respond() {
        return {
          ok: false,
          error: {
            code: 'REMOTE_UNAVAILABLE',
            message: 'synthetic child outage',
            retryable: false,
            fallbackAvailable: true,
          },
        };
      },
    };
    expectOk(
      await usePrototypeStore.getState().requestLiveChildCoach(
        {
          requestId: 'request_combined_child_123',
          bindingNonce: 'binding_combined_child_123',
          intent: 'clarify_step',
          boundedText: 'Please clarify the first sorting step.',
          inputOrigin: 'typed',
        },
        unavailableChild,
      ),
    );
    expect(usePrototypeStore.getState().liveChildCoachView.status).toBe('fallback');
    expect(progressionSnapshot()).toEqual(beforeChild);
    expectOk(
      usePrototypeStore.getState().prepareLiveVoiceCapture({
        voiceSessionId: 'voice_combined_reset_123',
        requestId: 'request_combined_voice_123',
        bindingNonce: 'binding_combined_voice_123',
      }),
    );
    expect(usePrototypeStore.getState().liveVoiceCapture).not.toBeNull();

    expectOk(resetPrototypeForTest());
    const reset = usePrototypeStore.getState();
    expect(reset.parentTaskDraftingView).toMatchObject({ status: 'idle', suggestion: null });
    expect(reset.liveChildCoachView).toMatchObject({ status: 'idle', response: null });
    expect(reset.liveVoiceCapture).toBeNull();
    expect(reset.liveChildAiGrants.child_salem.text.status).toBe('revoked');
    expect(reset.liveChildAiGrants.child_salem.voice.status).toBe('revoked');
  });
});
