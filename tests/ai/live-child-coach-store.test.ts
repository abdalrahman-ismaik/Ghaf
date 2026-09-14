import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNTHETIC_PARENT_REAUTHENTICATION_CODE } from '@/models/access';
import { createPreparedChildCoachResponse, type LiveChildCoachTextService } from '@/services';
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

function deferredProvider() {
  let release!: () => void;
  let entered!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const service: LiveChildCoachTextService = {
    async respond(request) {
      entered();
      await waiting;
      return {
        ok: true,
        data: createPreparedChildCoachResponse(request),
        meta: { origin: 'live', fallbackUsed: false },
      };
    },
  };
  return { service, started, release };
}

describe('bounded live Child Coach store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['6_8', '9_11', '12_14'] as const)(
    'builds a live Coach request from configured %s and enforces its bounded-text gate',
    async (ageBand) => {
      const fixtures = structuredClone(usePrototypeStore.getState().children);
      configureChildAgeForTest(ageBand);
      await prepareActiveChildTask();
      const respond = vi.fn<LiveChildCoachTextService['respond']>(async (request) => ({
        ok: true,
        data: createPreparedChildCoachResponse(request),
        meta: { origin: 'prepared', fallbackUsed: false },
      }));
      const intent =
        ageBand === '6_8' ? 'show_next_step' : ageBand === '9_11' ? 'first_step' : 'clarify_step';
      expectOk(
        await usePrototypeStore
          .getState()
          .requestLiveChildCoach({ ...requestInput(`age_${ageBand}`), intent }, { respond }),
      );
      expect(respond).toHaveBeenLastCalledWith(expect.objectContaining({ ageBand }));
      respond.mockClear();
      const typed = await usePrototypeStore.getState().requestLiveChildCoach(
        {
          ...requestInput(`typed_${ageBand}`),
          intent,
          boundedText: 'Please clarify the first step.',
          inputOrigin: 'typed',
        },
        { respond },
      );
      expect(typed.ok).toBe(ageBand === '12_14');
      expect(respond).toHaveBeenCalledTimes(ageBand === '12_14' ? 1 : 0);
      expect(usePrototypeStore.getState().children).toEqual(fixtures);
    },
  );

  it.each(['expired', 'age_changed', 'current'] as const)(
    'revalidates the current Child grant and age after a pending response: %s',
    async (condition) => {
      await prepareActiveChildTask();
      const grant = usePrototypeStore.getState().liveChildAiGrants.child_salem.text;
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(Date.parse(grant.expiresAt) - 500);
      const provider = deferredProvider();
      const pending = usePrototypeStore
        .getState()
        .requestLiveChildCoach(requestInput(condition), provider.service);
      await provider.started;

      if (condition === 'expired') vi.setSystemTime(Date.parse(grant.expiresAt));
      if (condition === 'age_changed') {
        configureChildAgeForTest('6_8');
      }
      const before = structuredClone(progression());
      provider.release();
      const result = await pending;

      if (condition === 'current') {
        expectOk(result);
        expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
          status: 'terminal',
          origin: 'live',
          response: { requestId: requestInput(condition).requestId },
        });
      } else {
        expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
        expect(usePrototypeStore.getState().liveChildCoachView).toMatchObject({
          status: 'idle',
          response: null,
          activeRequest: null,
          snapshot: null,
        });
      }
      expect(progression()).toEqual(before);
    },
  );

  it('preserves a newer Coach result when an older request becomes stale', async () => {
    await prepareActiveChildTask();
    const provider = deferredProvider();
    const pending = usePrototypeStore
      .getState()
      .requestLiveChildCoach(requestInput('older'), provider.service);
    await provider.started;
    expectOk(await usePrototypeStore.getState().requestLiveChildCoach(requestInput('newer')));
    const newerView = usePrototypeStore.getState().liveChildCoachView;
    provider.release();

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().liveChildCoachView).toBe(newerView);
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
