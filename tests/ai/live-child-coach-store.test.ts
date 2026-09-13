import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNTHETIC_PARENT_REAUTHENTICATION_CODE } from '@/models/access';
import { createPreparedChildCoachResponse, type LiveChildCoachTextService } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

const parentText = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

async function prepareActiveChildTask(grantText = true) {
  if (grantText) {
    expectOk(
      usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'text',
        granted: true,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      }),
    );
  }
  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText,
    }),
  );
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());
  await enterChildExperienceForTest('child_salem');
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(usePrototypeStore.getState().startAssignment());
}

function requestInput(id: string) {
  return {
    requestId: `request_${id}_123456`,
    bindingNonce: `binding_${id}_123456`,
    intent: 'first_step' as const,
  };
}

function progression() {
  const state = usePrototypeStore.getState();
  return {
    children: state.children,
    landscapeProgress: state.landscapeProgress,
    canopy: state.household.combinedCanopy,
    circleGoal: state.circleGoal,
    familyReward: state.familyReward,
    growthJourney: state.growthJourney,
    journey: state.journey,
  };
}

describe('bounded live Child Coach store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('fails closed before provider access when the text grant is off', async () => {
    await prepareActiveChildTask(false);
    const primary = { respond: vi.fn<LiveChildCoachTextService['respond']>() };

    await expect(
      usePrototypeStore.getState().requestLiveChildCoach(requestInput('blocked'), primary),
    ).resolves.toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(primary.respond).not.toHaveBeenCalled();
    expect(usePrototypeStore.getState().liveChildCoachView.status).toBe('denied');
  });

  it('shows one terminal prepared response with zero authority effects', async () => {
    await prepareActiveChildTask();
    const before = structuredClone(progression());

    const result = await usePrototypeStore
      .getState()
      .requestLiveChildCoach(requestInput('prepared'));
    expectOk(result);
    expect(result.data.terminal).toBe(true);
    expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
      status: 'terminal',
      origin: 'prepared',
      response: { requestId: 'request_prepared_123456' },
    });
    expect(progression()).toEqual(before);
  });

  it('uses the same-attempt prepared fallback for provider failure', async () => {
    await prepareActiveChildTask();
    const unavailable: LiveChildCoachTextService = {
      async respond() {
        return {
          ok: false,
          error: {
            code: 'REMOTE_UNAVAILABLE',
            message: 'fake outage',
            retryable: false,
            fallbackAvailable: true,
          },
        };
      },
    };

    const result = await usePrototypeStore
      .getState()
      .requestLiveChildCoach(requestInput('fallback'), unavailable);
    expectOk(result);
    expect(result.meta).toMatchObject({ origin: 'prepared', fallbackUsed: true });
    expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
      status: 'fallback',
      fallbackReason: 'remote_unavailable',
    });
  });

  it('discards a result after sign-out invalidates the task/profile/grant snapshot', async () => {
    await prepareActiveChildTask();
    let release: ((value: ReturnType<typeof createPreparedChildCoachResponse>) => void) | undefined;
    const pendingProvider: LiveChildCoachTextService = {
      respond(request) {
        return new Promise((resolve) => {
          release = (value) =>
            resolve({ ok: true, data: value, meta: { origin: 'live', fallbackUsed: false } });
        });
      },
    };
    const pending = usePrototypeStore
      .getState()
      .requestLiveChildCoach(requestInput('stale'), pendingProvider);
    const activeRequest = usePrototypeStore.getState().liveChildCoachView.activeRequest;
    expect(activeRequest).not.toBeNull();
    expectOk(usePrototypeStore.getState().signOutExperience());
    if (activeRequest) release?.(createPreparedChildCoachResponse(activeRequest));

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().liveChildCoachView.response).toBeNull();
  });

  it('clears a terminal result when the Child declines further live help', async () => {
    await prepareActiveChildTask();
    expectOk(await usePrototypeStore.getState().requestLiveChildCoach(requestInput('decline')));
    expectOk(usePrototypeStore.getState().declineLiveChildCoach());
    expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
      status: 'declined',
      response: null,
      activeRequest: null,
    });
  });
});
