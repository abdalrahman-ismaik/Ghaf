import { describe, expect, it } from 'vitest';

import { buildPrivateLeaguePresentation } from '@/features/league/presentation';
import {
  applyRecognitionToPrivateLeague,
  createPrivateLeagueRecognitionRuntime,
  PRIVATE_LEAGUE_ELIGIBILITY_DECISIONS,
  SALEM_RECYCLING_CHALLENGE_LEAF_ID,
  selectPrivateLeagueRecognitionEligibility,
} from '@/features/league/recognitionRuntime';
import { createResetSourceSession } from '@/services/mock/fixtures';

const PROFILE_EPOCH_ID = 'prototype-reset-0000:child_salem';

function recognizedInput(
  runtime = createPrivateLeagueRecognitionRuntime({ profileEpochId: PROFILE_EPOCH_ID }),
) {
  const session = createResetSourceSession('recognized');
  const journey = session.journey;
  if (!journey?.checkIn?.recognitionKey) throw new Error('Expected recognized fixture journey');
  const receipt = session.recognitionLedger[journey.checkIn.recognitionKey];
  if (!receipt) throw new Error('Expected committed recognition fixture');
  return {
    runtime,
    profileId: 'child_salem' as const,
    profileEpochId: runtime.profileEpochId,
    journey,
    receipt,
    recognitionLedger: session.recognitionLedger,
  };
}

describe('R002b private League recognition runtime', () => {
  it('creates the immutable approved 4/4/3 reset with Salem recycling Leaf still assigned', () => {
    const runtime = createPrivateLeagueRecognitionRuntime({ profileEpochId: PROFILE_EPOCH_ID });
    const result = buildPrivateLeaguePresentation({
      activeProfileId: 'child_salem',
      privateLeague: runtime,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data).toMatchObject({
      activeProfileId: 'child_salem',
      leavesPerWeek: 5,
      origin: 'synthetic_local',
      weekKey: '2026-W36',
    });
    expect(result.data.participants.map((participant) => participant.completedLeafCount)).toEqual([
      4, 4, 3,
    ]);
    expect(result.data.participants.map((participant) => participant.score)).toEqual([80, 80, 60]);
    expect(result.data.participants.map((participant) => participant.position)).toEqual([1, 1, 3]);
    expect(runtime).toMatchObject({
      schemaVersion: 'r003.private-league-recognition.v2',
      profileId: 'child_salem',
      profileEpochId: PROFILE_EPOCH_ID,
      weekKey: '2026-W36',
    });
    expect(runtime.challengeLeaf).toMatchObject({
      id: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
      state: 'assigned',
      participantId: 'child_salem',
      approvedTaskRef: { taskId: 'task_recycling_p0_v1', taskVersion: 1 },
      categoryId: 'green_impact',
      visibilityScope: 'household',
      parentApproved: true,
      accessibilityAdaptable: true,
    });
    expect(Object.isFrozen(runtime)).toBe(true);
    expect(Object.isFrozen(runtime.challengeLeaf)).toBe(true);
    expect(runtime.receiptsByRecognitionKey).toEqual({});
  });

  it('keeps the task-version decision separate while rejecting changed canonical content', () => {
    const input = recognizedInput();
    const withoutCircle = {
      ...input.journey,
      task: {
        ...input.journey.task,
        content: { ...input.journey.task.content, circleEligible: false },
      },
    };

    expect(PRIVATE_LEAGUE_ELIGIBILITY_DECISIONS).toEqual({
      'task_recycling_p0_v1@1': {
        challengeLeafEligible: true,
        leafId: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
        profileId: 'child_salem',
      },
    });
    expect(selectPrivateLeagueRecognitionEligibility(withoutCircle)).toEqual(
      PRIVATE_LEAGUE_ELIGIBILITY_DECISIONS['task_recycling_p0_v1@1'],
    );
    expect(
      selectPrivateLeagueRecognitionEligibility({
        ...input.journey,
        task: { ...input.journey.task, version: 2 },
      }),
    ).toBeNull();

    const receiptWithoutCircle = { ...input.receipt, circleEvent: null };
    expect(
      applyRecognitionToPrivateLeague({
        ...input,
        journey: withoutCircle,
        receipt: receiptWithoutCircle,
        recognitionLedger: { [receiptWithoutCircle.recognitionKey]: receiptWithoutCircle },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(input.runtime.challengeLeaf.state).toBe('assigned');
  });

  it('commits Salem fifth Leaf once with reveal-ready authoritative receipt fields', () => {
    const input = recognizedInput();
    const before = structuredClone(input.runtime);
    const result = applyRecognitionToPrivateLeague(input);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data.disposition).toBe('applied');
    expect(result.data.receipt).toEqual({
      leagueReceiptId: `league-confirmation:${PROFILE_EPOCH_ID}:submission_recycling_p0_v1_attempt_1`,
      profileId: 'child_salem',
      profileEpochId: PROFILE_EPOCH_ID,
      weekKey: '2026-W36',
      leafId: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
      recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
      committedAt: '2026-08-26T09:40:00.000Z',
      completionMode: 'permitted_help',
      accessibilityAdapted: false,
      confirmedLeavesBefore: 4,
      confirmedLeavesAfter: 5,
      leafDelta: 1,
      status: 'committed',
      privacy: 'private_family_league',
    });
    expect(result.data.runtime.receiptsByRecognitionKey[input.receipt.recognitionKey]).toBe(
      result.data.receipt,
    );
    expect(result.data.runtime.challengeLeaf).toMatchObject({
      id: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
      state: 'confirmed',
      recognitionKey: input.receipt.recognitionKey,
      completionMode: 'permitted_help',
      accessibilityAdapted: false,
    });
    expect(input.runtime).toEqual(before);
    expect(Object.isFrozen(result.data.runtime)).toBe(true);
    expect(Object.isFrozen(result.data.receipt)).toBe(true);
  });

  it('keeps League credit for one validated Parent-retained action', () => {
    const input = recognizedInput();
    const parentAction = {
      ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ.',
      en: 'Sort clean paper and plastic that were approved by an adult.',
    };
    const journey = {
      ...input.journey,
      task: {
        ...input.journey.task,
        parentOriginalText: parentAction,
        acceptedGuideFixtureId: null,
        content: { ...input.journey.task.content, positiveAction: parentAction },
      },
    };

    expect(
      applyRecognitionToPrivateLeague({
        ...input,
        journey,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'applied',
        runtime: { challengeLeaf: { state: 'confirmed' } },
      },
    });
  });

  it('allows a service-valid third-acquisition phase review without changing League credit', () => {
    const input = recognizedInput();
    const receipt = {
      ...input.receipt,
      phaseReview: {
        taskId: input.journey.task.id,
        confirmedAcquisitionCount: 3,
        options: ['keep_acquisition', 'move_future_to_maintenance'],
        selected: null,
        appliesTo: 'future_completions_only',
        reversibleByParent: true,
      },
    } as const;
    const result = applyRecognitionToPrivateLeague({
      ...input,
      receipt,
      recognitionLedger: { [receipt.recognitionKey]: receipt },
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        disposition: 'applied',
        receipt: { confirmedLeavesBefore: 4, confirmedLeavesAfter: 5, leafDelta: 1 },
      },
    });
  });

  it('returns the same committed runtime and receipt for an exact retry', () => {
    const firstInput = recognizedInput();
    const first = applyRecognitionToPrivateLeague(firstInput);
    if (!first.ok) throw new Error(first.error.message);

    const retry = applyRecognitionToPrivateLeague({
      ...firstInput,
      runtime: first.data.runtime,
    });

    expect(retry.ok).toBe(true);
    if (!retry.ok) throw new Error(retry.error.message);
    expect(retry.data.disposition).toBe('already_confirmed');
    expect(retry.data.runtime).toBe(first.data.runtime);
    expect(retry.data.receipt).toBe(first.data.receipt);
    expect(Object.keys(retry.data.runtime.receiptsByRecognitionKey)).toHaveLength(1);
  });

  it.each(['receipt', 'receipt_map'] as const)(
    'rejects hidden authority on a committed %s',
    (target) => {
      const input = recognizedInput();
      const first = applyRecognitionToPrivateLeague(input);
      if (!first.ok) throw new Error(first.error.message);
      const recognitionKey = first.data.receipt.recognitionKey;
      const receipt = { ...first.data.receipt };
      const receiptsByRecognitionKey = { [recognitionKey]: receipt };
      if (target === 'receipt') {
        Object.defineProperty(receipt, 'hiddenAuthority', {
          value: true,
          enumerable: false,
          configurable: true,
        });
      } else {
        Object.defineProperty(receiptsByRecognitionKey, 'recognition:hidden-authority', {
          value: receipt,
          enumerable: false,
          configurable: true,
        });
      }
      const runtime = {
        ...first.data.runtime,
        receiptsByRecognitionKey,
      } as typeof first.data.runtime;

      expect(applyRecognitionToPrivateLeague({ ...input, runtime })).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
    },
  );

  it('rejects a forged retry runtime and leaves the valid committed runtime unchanged', () => {
    const input = recognizedInput();
    const first = applyRecognitionToPrivateLeague(input);
    if (!first.ok) throw new Error(first.error.message);
    const before = structuredClone(first.data.runtime);
    const forgedReceipt = { ...first.data.receipt, confirmedLeavesAfter: 4 };
    const forgedRuntime = {
      ...first.data.runtime,
      receiptsByRecognitionKey: { [first.data.receipt.recognitionKey]: forgedReceipt },
    } as unknown as typeof first.data.runtime;

    const retry = applyRecognitionToPrivateLeague({ ...input, runtime: forgedRuntime });

    expect(retry).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(first.data.runtime).toEqual(before);
  });

  it('rejects an old runtime when the current profile reset epoch changes', () => {
    const oldRuntime = createPrivateLeagueRecognitionRuntime({
      profileEpochId: PROFILE_EPOCH_ID,
    });
    const input = recognizedInput(oldRuntime);

    const result = applyRecognitionToPrivateLeague({
      ...input,
      profileEpochId: 'prototype-reset-0001:child_salem',
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT', fallbackAvailable: true },
    });
    expect(oldRuntime.receiptsByRecognitionKey).toEqual({});
  });

  it('rejects cross-profile, task, category, scope, uncommitted, and malformed evidence unchanged', () => {
    const input = recognizedInput();
    const runtimeBefore = structuredClone(input.runtime);
    const attempts = [
      { ...input, profileId: 'child_alya' as const },
      { ...input, profileEpochId: 'prototype-reset-0001:child_salem' },
      {
        ...input,
        journey: { ...input.journey, task: { ...input.journey.task, id: 'task_other' } },
      },
      {
        ...input,
        journey: {
          ...input.journey,
          task: {
            ...input.journey.task,
            content: { ...input.journey.task.content, categoryId: 'home_responsibility' as const },
          },
        },
      },
      {
        ...input,
        journey: {
          ...input.journey,
          task: {
            ...input.journey.task,
            content: { ...input.journey.task.content, visibilityScope: 'child_guardian' as const },
          },
        },
      },
      { ...input, recognitionLedger: {} },
      {
        ...input,
        receipt: {
          ...input.receipt,
          seedTransaction: input.receipt.seedTransaction
            ? { ...input.receipt.seedTransaction, childId: 'child_alya' as const }
            : null,
        },
      },
    ];

    for (const attempt of attempts) {
      expect(applyRecognitionToPrivateLeague(attempt)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT', fallbackAvailable: true },
      });
      expect(input.runtime).toEqual(runtimeBefore);
    }
  });

  it('projects the authoritative runtime from four to five without exposing private fields', () => {
    const input = recognizedInput();
    const before = buildPrivateLeaguePresentation({
      activeProfileId: 'child_salem',
      privateLeague: input.runtime,
    });
    const applied = applyRecognitionToPrivateLeague(input);
    if (!applied.ok) throw new Error(applied.error.message);
    const after = buildPrivateLeaguePresentation({
      activeProfileId: 'child_salem',
      privateLeague: applied.data.runtime,
    });

    if (!before.ok || !after.ok) throw new Error('Expected valid private League presentations');
    expect(before.data.activeParticipant).toMatchObject({ completedLeafCount: 4, score: 80 });
    expect(after.data.activeParticipant).toMatchObject({
      completedLeafCount: 5,
      position: 1,
      score: 100,
    });
    expect(after.data.participants.find((row) => row.nickname.en === 'Alya')).toMatchObject({
      completedLeafCount: 4,
      score: 80,
    });
    for (const row of after.data.participants) {
      expect(Object.keys(row).sort()).toEqual([
        'completedLeafCount',
        'isActiveProfile',
        'nickname',
        'position',
        'score',
        'treeAvatarToken',
      ]);
      expect(JSON.stringify(row)).not.toMatch(
        /task|seed|badge|media|reflection|parentNote|completionTime|familyReward/iu,
      );
    }
  });

  it('fails closed when the active Child is outside the private League fixture', () => {
    const result = buildPrivateLeaguePresentation({
      activeProfileId: 'child_unknown' as never,
      privateLeague: createPrivateLeagueRecognitionRuntime({
        profileEpochId: PROFILE_EPOCH_ID,
      }),
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT', fallbackAvailable: true },
    });
  });
});
