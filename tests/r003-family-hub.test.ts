import { describe, expect, it } from 'vitest';

import {
  applyRecognitionToFamilyReward,
  createFamilyRewardRuntime,
  markFamilyRewardRuntimeGiven,
  projectFamilyRewardRuntime,
} from '../src/features/family-hub';
import { PREPARED_PRAISE, createSubmittedP0Session } from '../src/services/mock/fixtures';
import { serviceRegistry } from '../src/services';

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
    const unlocked = expectOk(
      applyRecognitionToFamilyReward({
        runtime: createFamilyRewardRuntime(),
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

    const repeated = expectOk(
      applyRecognitionToFamilyReward({
        runtime: unlocked,
        journey: recognition.journey,
        receipt: recognition.receipt,
        committedAt: TIME,
      }),
    );
    expect(repeated).toBe(unlocked);
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
