import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { serviceRegistry } from '../src/services';
import {
  PREPARED_PRAISE,
  createResetSourceSession,
  createSubmittedP0Session,
} from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from './helpers/prototypeStore';

const CONFIRMATION_INPUT = {
  submissionId: 'submission_recycling_p0_v1_attempt_1',
  praise: PREPARED_PRAISE,
  neutralObservation: null,
  uncertainty: null,
} as const;

const PRAISE_ACTION = {
  actionId: 'provider-boundary-praise',
  source: 'parent_press' as const,
  presentedAt: '2026-09-05T10:00:00.000Z',
};

const RECOGNITION_ACTION = {
  actionId: 'provider-boundary-recognition',
  source: 'parent_press' as const,
  observedRenderState: 'praise_presented' as const,
  presentationActionId: PRAISE_ACTION.actionId,
};

const VALID_FAILURE = {
  ok: false as const,
  error: {
    code: 'TIMEOUT' as const,
    message: 'Synthetic provider timeout',
    retryable: true,
    fallbackAvailable: true,
  },
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected success: ${JSON.stringify(result)}`);
  }
  return result.data;
}

function expectInvalidResponse(result: unknown): void {
  expect(result).toMatchObject({
    ok: false,
    error: { code: 'INVALID_RESPONSE' },
  });
}

function serializeStoreData(): string {
  const serialized = JSON.stringify(usePrototypeStore.getState(), (_key, value: unknown) =>
    typeof value === 'function' ? undefined : value,
  );
  if (serialized === undefined) throw new Error('Expected serializable prototype state');
  return serialized;
}

function preparePendingPraise() {
  const attempt = expectOk(usePrototypeStore.getState().planConfirmation(CONFIRMATION_INPUT));
  if (attempt.disposition !== 'pending_praise') {
    throw new Error('Expected a pending praise plan');
  }
  return attempt.plan;
}

describe('recognition provider store boundary', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    usePrototypeStore.setState(createSubmittedP0Session());
    await enterParentExperienceForTest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['null', 'throw'] as const)(
    'rejects planConfirmation provider %s without changing state',
    (behavior) => {
      vi.spyOn(serviceRegistry.recognition, 'planConfirmation').mockImplementation(() => {
        if (behavior === 'throw') throw new Error('Synthetic provider crash');
        return null as never;
      });
      const before = serializeStoreData();

      const result = usePrototypeStore.getState().planConfirmation(CONFIRMATION_INPUT);

      expectInvalidResponse(result);
      expect(serializeStoreData()).toBe(before);
    },
  );

  it('rejects a stale confirmation request before calling its provider', () => {
    const provider = vi.spyOn(serviceRegistry.recognition, 'planConfirmation');
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().planConfirmation({
      ...CONFIRMATION_INPUT,
      submissionId: 'submission-from-another-task',
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(provider).not.toHaveBeenCalled();
    expect(serializeStoreData()).toBe(before);
  });

  it('rejects an invalid praise action before calling its provider', () => {
    preparePendingPraise();
    const provider = vi.spyOn(serviceRegistry.recognition, 'markPraisePresented');
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().markPraisePresented({
      ...PRAISE_ACTION,
      presentedAt: '2026-02-30T10:00:00.000Z',
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(provider).not.toHaveBeenCalled();
    expect(serializeStoreData()).toBe(before);
  });

  it('rejects a praise plan after the active Child authority changes', () => {
    preparePendingPraise();
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    const provider = vi.spyOn(serviceRegistry.recognition, 'markPraisePresented');
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION);

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(provider).not.toHaveBeenCalled();
    expect(serializeStoreData()).toBe(before);
  });

  it.each(['presentation', 'recognition'] as const)(
    'rejects accessor-backed stored confirmation authority before %s',
    (actionKind) => {
      const malformedPlan = Object.defineProperty({}, 'renderState', {
        enumerable: true,
        get() {
          throw new Error('Stored confirmation getter must not run');
        },
      });
      usePrototypeStore.setState({
        confirmationPlan: malformedPlan as never,
      });
      const provider = vi.spyOn(
        serviceRegistry.recognition,
        actionKind === 'presentation' ? 'markPraisePresented' : 'applyRecognition',
      );
      const before = usePrototypeStore.getState();
      let result: unknown;

      expect(() => {
        result =
          actionKind === 'presentation'
            ? usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION)
            : usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION);
      }).not.toThrow();

      expectInvalidResponse(result);
      expect(provider).not.toHaveBeenCalled();
      const after = usePrototypeStore.getState();
      expect(after.confirmationPlan).toBe(before.confirmationPlan);
      expect(after.journey).toBe(before.journey);
      expect(after.recognitionLedger).toBe(before.recognitionLedger);
      expect(after.growthJourney).toBe(before.growthJourney);
    },
  );

  it('rejects a stale check-in request before calling its provider', () => {
    const provider = vi.spyOn(serviceRegistry.recognition, 'resolveCheckInState');
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().restoreCheckInState('submission-from-another-task');

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(provider).not.toHaveBeenCalled();
    expect(serializeStoreData()).toBe(before);
  });

  it.each(['throw', 'bogus_error_code', 'extra_success_meta'] as const)(
    'rejects markPraisePresented provider %s without changing state',
    (behavior) => {
      const pendingPlan = preparePendingPraise();
      const genuineMarkPraise = serviceRegistry.recognition.markPraisePresented.bind(
        serviceRegistry.recognition,
      );
      vi.spyOn(serviceRegistry.recognition, 'markPraisePresented').mockImplementation(
        (plan, action) => {
          if (behavior === 'throw') throw new Error('Synthetic presentation crash');
          if (behavior === 'bogus_error_code') {
            return {
              ok: false,
              error: {
                code: 'NOT_A_DOMAIN_ERROR',
                message: 'Synthetic malformed error',
                retryable: false,
                fallbackAvailable: false,
              },
            } as never;
          }
          const genuine = genuineMarkPraise(plan, action);
          if (!genuine.ok) return genuine;
          return {
            ...genuine,
            meta: { ...genuine.meta, fixtureId: 'unexpected-provider-metadata' },
          } as never;
        },
      );
      expect(usePrototypeStore.getState().confirmationPlan).toEqual(pendingPlan);
      const before = serializeStoreData();

      const result = usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION);

      expectInvalidResponse(result);
      expect(serializeStoreData()).toBe(before);
    },
  );

  it.each([
    ['plan', 'throw'],
    ['plan', 'malformed_envelope'],
    ['presentation', 'throw'],
    ['presentation', 'malformed_envelope'],
  ] as const)(
    'keeps confirmAndPresentPraise atomic when the %s provider returns %s',
    (stage, behavior) => {
      const method = stage === 'plan' ? 'planConfirmation' : 'markPraisePresented';
      vi.spyOn(serviceRegistry.recognition, method).mockImplementation((() => {
        if (behavior === 'throw') throw new Error('Synthetic combined provider crash');
        return {
          ok: true,
          data: {},
          meta: {
            origin: 'synthetic',
            fallbackUsed: false,
            unexpected: true,
          },
        } as never;
      }) as never);
      const before = serializeStoreData();

      const result = usePrototypeStore
        .getState()
        .confirmAndPresentPraise(CONFIRMATION_INPUT, PRAISE_ACTION);

      expectInvalidResponse(result);
      expect(serializeStoreData()).toBe(before);
    },
  );

  it('isolates planConfirmation input when the provider mutates it and then fails', () => {
    const input = {
      ...CONFIRMATION_INPUT,
      praise: { ...CONFIRMATION_INPUT.praise },
    };
    vi.spyOn(serviceRegistry.recognition, 'planConfirmation').mockImplementation(
      (session, providerInput) => {
        if (!session.journey) throw new Error('Expected the submitted journey');
        (session.journey.task.parentOriginalText as { en: string }).en =
          'Provider changed the stored task';
        (providerInput.praise as { en: string }).en = 'Provider changed the caller input';
        return VALID_FAILURE;
      },
    );
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().planConfirmation(input);

    expect(result).toEqual(VALID_FAILURE);
    expect(input.praise.en).toBe(PREPARED_PRAISE.en);
    expect(serializeStoreData()).toBe(before);
  });

  it('isolates both combined provider inputs when presentation mutates them and fails', () => {
    const input = {
      ...CONFIRMATION_INPUT,
      praise: { ...CONFIRMATION_INPUT.praise },
    };
    const action = { ...PRAISE_ACTION };
    vi.spyOn(serviceRegistry.recognition, 'markPraisePresented').mockImplementation(
      (plan, providerAction) => {
        (plan.praise as { en: string }).en = 'Provider changed the pending praise';
        (providerAction as { actionId: string }).actionId = 'provider-changed-action';
        return VALID_FAILURE;
      },
    );
    const before = serializeStoreData();

    const result = usePrototypeStore.getState().confirmAndPresentPraise(input, action);

    expect(result).toEqual(VALID_FAILURE);
    expect(input.praise.en).toBe(PREPARED_PRAISE.en);
    expect(action.actionId).toBe(PRAISE_ACTION.actionId);
    expect(serializeStoreData()).toBe(before);
  });

  it('keeps stored confirmation data detached from the returned planning result', () => {
    const attempt = expectOk(usePrototypeStore.getState().planConfirmation(CONFIRMATION_INPUT));
    if (attempt.disposition !== 'pending_praise') {
      throw new Error('Expected a pending praise plan');
    }
    const before = serializeStoreData();

    (attempt.plan.praise as { en: string }).en = 'Caller changed returned planning data';
    (attempt.plan.journey.task.parentOriginalText as { en: string }).en =
      'Caller changed returned task data';

    expect(attempt.plan.praise.en).toBe('Caller changed returned planning data');
    expect(serializeStoreData()).toBe(before);
  });

  it('keeps stored praise data detached from the returned presentation result', () => {
    preparePendingPraise();
    const presented = expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    const before = serializeStoreData();

    (presented.praise as { en: string }).en = 'Caller changed returned praise data';
    (presented.journey.task.parentOriginalText as { en: string }).en =
      'Caller changed returned task data';

    expect(presented.praise.en).toBe('Caller changed returned praise data');
    expect(serializeStoreData()).toBe(before);
  });

  it('keeps restored check-in data detached from the store', () => {
    usePrototypeStore.setState(createResetSourceSession('confirmed'));
    const route = expectOk(
      usePrototypeStore.getState().restoreCheckInState('submission_recycling_p0_v1_attempt_1'),
    );
    if (route.state !== 'confirmation_pending') {
      throw new Error('Expected a restored pending praise route');
    }
    const before = serializeStoreData();

    (route.journey.task.parentOriginalText as { en: string }).en =
      'Caller changed returned check-in data';
    (route.attempt.plan.praise as { en: string }).en = 'Caller changed returned route praise';

    expect(route.journey.task.parentOriginalText.en).toBe('Caller changed returned check-in data');
    expect(serializeStoreData()).toBe(before);
  });
});
