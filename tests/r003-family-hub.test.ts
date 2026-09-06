import { describe, expect, it } from 'vitest';

import {
  applyRecognitionToFamilyReward,
  createFamilyRewardRuntime,
  markFamilyRewardRuntimeGiven,
  projectFamilyRewardUnlock,
  projectFamilyRewardRuntime,
} from '../src/features/family-hub';
import { PREPARED_PRAISE, createSubmittedP0Session } from '../src/services/mock/fixtures';
import { serviceRegistry } from '../src/services';
import { isExactPlainDataEqual } from '../src/utils/exactPlainData';

const TIME = '2026-09-05T10:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected success');
  return result.data;
}

function canonicalRecognition() {
  const session = createSubmittedP0Session();
  const planned = expectOk(
    serviceRegistry.recognition.planConfirmation(session, {
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  if (planned.disposition !== 'pending_praise') throw new Error('Expected pending praise');
  const presented = expectOk(
    serviceRegistry.recognition.markPraisePresented(planned.plan, {
      actionId: 'r003-family-reward-praise',
      source: 'parent_press',
      presentedAt: TIME,
    }),
  );
  return expectOk(
    serviceRegistry.recognition.applyRecognition(
      { ...session, journey: presented.journey },
      presented,
      {
        actionId: 'r003-family-reward-recognition',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: presented.presentationActionId,
      },
    ),
  );
}

function recognitionLandscapeTransition(recognition: ReturnType<typeof canonicalRecognition>) {
  const growth = recognition.receipt.landscapeGrowth;
  if (!growth) throw new Error('Expected canonical landscape growth');
  return {
    landscapeId: growth.landscapeId,
    stageBefore: growth.stageBefore,
    stageAfter: growth.stageAfter,
  };
}

describe('R003 Family hub reward runtime', () => {
  it('starts as one private 108 of 120 experience promise', () => {
    const runtime = createFamilyRewardRuntime();
    expect(
      projectFamilyRewardRuntime(runtime, {
        kind: 'guardian',
        guardianId: 'parent_al_noor',
      }),
    ).toMatchObject({
      ok: true,
      data: {
        currentEligibleSeeds: 108,
        targetEligibleSeeds: 120,
        remainingEligibleSeeds: 12,
        view: { lifecycle: 'promised', privacy: 'child_guardians_only' },
      },
    });
    expect(
      projectFamilyRewardRuntime(runtime, { kind: 'child', childId: 'child_alya' }),
    ).toMatchObject({ ok: false });
  });

  it('unlocks only after the canonical confirmed, praised, and grown +12 event', () => {
    const recognition = canonicalRecognition();
    const before = createFamilyRewardRuntime();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: before,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    expect(unlocked).toMatchObject({
      plan: { lifecycle: 'unlocked', unlockedAt: TIME },
      progress: { eligibleSeedDelta: 12, recognitionKeys: [recognition.receipt.recognitionKey] },
    });
    expect(
      projectFamilyRewardRuntime(unlocked, {
        kind: 'guardian',
        guardianId: 'parent_al_noor',
      }),
    ).toMatchObject({
      data: { currentEligibleSeeds: 120, remainingEligibleSeeds: 0 },
    });
    expect(
      projectFamilyRewardUnlock({
        before,
        after: unlocked,
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: recognition.receipt.recognitionKey,
        committedAt: TIME,
      }),
    ).toEqual({
      ok: true,
      data: {
        planId: 'family-reward-salem-september-v1',
        planVersion: 1,
        lifecycleBefore: 'promised',
        lifecycleAfter: 'unlocked',
        privacy: 'child_guardians_only',
      },
    });

    const repeated = expectOk(
      applyRecognitionToFamilyReward({
        runtime: unlocked,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    expect(repeated).toBe(unlocked);
    expect(
      projectFamilyRewardUnlock({
        before: unlocked,
        after: repeated,
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: recognition.receipt.recognitionKey,
        committedAt: TIME,
      }),
    ).toEqual({ ok: true, data: null });
  });

  it('rejects a reward unlock projected from another recognition', () => {
    const recognition = canonicalRecognition();
    const before = createFamilyRewardRuntime();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: before,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );

    expect(
      projectFamilyRewardUnlock({
        before,
        after: unlocked,
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: 'recognition:another-submission',
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('rejects an unlock that erases earlier private provenance', () => {
    const recognition = canonicalRecognition();
    const baseline = createFamilyRewardRuntime();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: baseline,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    const before = {
      ...baseline,
      progress: {
        ...baseline.progress,
        recognitionKeys: ['recognition:stale-unrelated-event'],
      },
    };

    expect(
      projectFamilyRewardUnlock({
        before,
        after: unlocked,
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: recognition.receipt.recognitionKey,
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('rejects promised-to-unlocked evidence carrying a given timestamp', () => {
    const recognition = canonicalRecognition();
    const baseline = createFamilyRewardRuntime();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: baseline,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    const before = { ...baseline, plan: { ...baseline.plan, givenAt: TIME } };
    const after = { ...unlocked, plan: { ...unlocked.plan, givenAt: TIME } };

    expect(
      projectFamilyRewardUnlock({
        before,
        after,
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: recognition.receipt.recognitionKey,
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('rejects an unlock whose private plan and progress belong to another Child', () => {
    const recognition = canonicalRecognition();
    const before = createFamilyRewardRuntime();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: before,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    const forAlya = (runtime: typeof before): typeof before => ({
      ...runtime,
      plan: { ...runtime.plan, childId: 'child_alya' },
      progress: { ...runtime.progress, childId: 'child_alya' },
    });

    expect(
      projectFamilyRewardUnlock({
        before: forAlya(before),
        after: forAlya(unlocked),
        expectedProfileId: 'child_salem',
        expectedLandscapeTransition: recognitionLandscapeTransition(recognition),
        recognitionKey: recognition.receipt.recognitionKey,
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('fails closed when a task version has no explicit eligibility decision', () => {
    const recognition = canonicalRecognition();
    const runtime = createFamilyRewardRuntime();
    const unknownVersion = {
      ...recognition.journey,
      task: { ...recognition.journey.task, version: 2 },
    };

    const ignored = expectOk(
      applyRecognitionToFamilyReward({
        runtime,
        journey: unknownVersion,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    expect(ignored).toBe(runtime);
    expect(ignored).toMatchObject({
      plan: { lifecycle: 'promised' },
      progress: { eligibleSeedDelta: 0, recognitionKeys: [] },
    });
  });

  it('rejects a current recognition key without its reconciled unlock', () => {
    const recognition = canonicalRecognition();
    const runtime = createFamilyRewardRuntime();
    const forged = {
      ...runtime,
      progress: {
        ...runtime.progress,
        recognitionKeys: [recognition.receipt.recognitionKey],
      },
    };

    expect(
      applyRecognitionToFamilyReward({
        runtime: forged,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(forged.plan.lifecycle).toBe('promised');
    expect(forged.progress.eligibleSeedDelta).toBe(0);
  });

  it('rejects hidden root authority on a reconciled reward duplicate', () => {
    const recognition = canonicalRecognition();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: createFamilyRewardRuntime(),
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    const malformed = { ...unlocked, hiddenAuthority: undefined } as typeof unlocked;

    expect(
      applyRecognitionToFamilyReward({
        runtime: malformed,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('rejects malformed same-reference plain-data comparisons', () => {
    const hidden = {};
    Object.defineProperty(hidden, 'hiddenAuthority', { value: true, enumerable: false });
    const accessor = {};
    Object.defineProperty(accessor, 'authority', { get: () => true, enumerable: true });
    const symbolKeyed = { [Symbol('authority')]: true };
    class ForgedArray extends Array<string> {}
    const forgedArray = new ForgedArray('expected');

    expect(isExactPlainDataEqual(hidden, hidden)).toBe(false);
    expect(isExactPlainDataEqual(accessor, accessor)).toBe(false);
    expect(isExactPlainDataEqual(symbolKeyed, symbolKeyed)).toBe(false);
    expect(isExactPlainDataEqual(forgedArray, ['expected'])).toBe(false);
    expect(isExactPlainDataEqual(Number.NaN, Number.NaN)).toBe(false);
    expect(isExactPlainDataEqual(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('cannot be given before unlock and remains given idempotently', () => {
    expect(markFamilyRewardRuntimeGiven(createFamilyRewardRuntime(), TIME)).toMatchObject({
      ok: false,
    });
    const recognition = canonicalRecognition();
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: createFamilyRewardRuntime(),
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    const given = expectOk(markFamilyRewardRuntimeGiven(unlocked, TIME));
    expect(given.plan).toMatchObject({ lifecycle: 'given', givenAt: TIME });
    expect(expectOk(markFamilyRewardRuntimeGiven(given, TIME))).toEqual(given);
  });
});
