import { describe, expect, it } from 'vitest';

import {
  REVEAL_BUNDLE_SCHEMA_VERSION,
  type CommittedRevealSourceReceipt,
  type RevealBundleQueue,
  type RevealConstructionInput,
  type RevealPresentationScope,
} from '../../src/models/revealBundle';
import {
  archiveRevealBundle,
  acknowledgeRevealBundle,
  constructRevealBundle,
  createEmptyRevealBundleQueue,
  selectVisibleRevealBundle,
  startOrResumeRevealById,
  startOrResumeNextReveal,
} from '../../src/features/rewards/revealBundle';

type ReceiptKind = CommittedRevealSourceReceipt['consequence']['kind'];
type ReceiptOfKind<TKind extends ReceiptKind> = Extract<
  CommittedRevealSourceReceipt,
  { readonly consequence: { readonly kind: TKind } }
>;

function receiptIs<TKind extends ReceiptKind>(kind: TKind) {
  return (receipt: CommittedRevealSourceReceipt): receipt is ReceiptOfKind<TKind> =>
    receipt.consequence.kind === kind;
}

const PROFILE_ID = 'child_salem' as const;
const PROFILE_EPOCH_ID = 'reset-epoch-001';
const TRIGGER_EVENT_ID = 'recognition:submission_recycling_p0_1';
const TRIGGERED_AT = '2026-09-05T08:05:00.000Z';
const PRESENTATION_SCOPE: RevealPresentationScope = {
  profileId: PROFILE_ID,
  profileEpochId: PROFILE_EPOCH_ID,
};

function sourceReceipt(
  receipt: Omit<
    CommittedRevealSourceReceipt,
    'profileId' | 'profileEpochId' | 'triggerEventId' | 'triggerKind' | 'status' | 'committedAt'
  >,
): CommittedRevealSourceReceipt {
  return {
    ...receipt,
    profileId: PROFILE_ID,
    profileEpochId: PROFILE_EPOCH_ID,
    triggerEventId: TRIGGER_EVENT_ID,
    triggerKind: 'task_approval',
    status: 'committed',
    committedAt: TRIGGERED_AT,
  } as CommittedRevealSourceReceipt;
}

function approvalReceipts(): CommittedRevealSourceReceipt[] {
  return [
    sourceReceipt({
      id: 'receipt:safe-help:1',
      authority: 'safe_help',
      consequence: {
        kind: 'safe_help',
        recognitionId: 'safe-help:submission_recycling_p0_1',
        helpKind: 'permitted_help',
        recognized: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:station:132',
      authority: 'impact_path',
      consequence: {
        kind: 'impact_path_station',
        threshold: 132,
        result: 'unlock_mangrove_roots_learning',
        newlyReached: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:badge:coastal-care',
      authority: 'achievements',
      consequence: {
        kind: 'earned_badge',
        awardId: 'award:coastal-care:1',
        badgeId: 'badge.journey.coastal_care.v1',
        newlyEarned: true,
        earnedAt: TRIGGERED_AT,
        private: true,
        permanent: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:learning:mangrove-roots',
      authority: 'learning',
      consequence: {
        kind: 'unlocked_learning',
        unlockId: 'unlock:mangrove-roots:1',
        learningId: 'learning.mangrove_roots.v1',
        newlyUnlocked: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:seed:1',
      authority: 'seed_ledger',
      consequence: {
        kind: 'seed',
        transactionId: 'seed_transaction_recycling_p0_1',
        delta: 12,
        before: 108,
        after: 120,
        meaning: 'symbolic_nonfinancial',
      },
    }),
    sourceReceipt({
      id: 'receipt:praise:1',
      authority: 'parent_check_in',
      consequence: {
        kind: 'parent_praise',
        checkInId: 'checkin_recycling_p0_1',
        text: {
          ar: 'فرزت المواد بعناية وطلبت المساعدة بأمان.',
          en: 'You sorted carefully and asked for help safely.',
        },
      },
    }),
    sourceReceipt({
      id: 'receipt:garden:1',
      authority: 'garden',
      consequence: {
        kind: 'plant_stage',
        growthId: 'growth:mangrove:submission_recycling_p0_1',
        landscapeId: 'mangrove',
        seedsBefore: 48,
        seedsAfter: 60,
        stageBefore: 'shoot',
        stageAfter: 'sapling',
        crossedThreshold: 60,
        symbolicOnly: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:canopy:1',
      authority: 'canopy',
      consequence: {
        kind: 'canopy',
        contributionId: 'canopy:submission_recycling_p0_1',
        leavesBefore: 19,
        leavesAfter: 20,
        leafDelta: 1,
        goalLeaves: 25,
        origin: 'synthetic',
      },
    }),
    sourceReceipt({
      id: 'receipt:circle:1',
      authority: 'green_circle',
      consequence: {
        kind: 'green_circle',
        eventId: 'circle:submission_recycling_p0_1',
        actionsBefore: 11,
        actionsAfter: 12,
        actionDelta: 1,
        goal: 12,
        sourceScope: 'household',
        origin: 'synthetic_local',
      },
    }),
    sourceReceipt({
      id: 'receipt:league:1',
      authority: 'private_league',
      consequence: {
        kind: 'private_league_leaf',
        weekKey: '2026-W36',
        leagueReceiptId: 'league-confirmation:submission_recycling_p0_1',
        leafId: 'leaf:salem:recycling',
        confirmedLeavesBefore: 3,
        confirmedLeavesAfter: 4,
        leafDelta: 1,
        privacy: 'private_family_league',
      },
    }),
    sourceReceipt({
      id: 'receipt:challenge:1',
      authority: 'challenge_leaf',
      consequence: {
        kind: 'challenge_leaf',
        weekKey: '2026-W36',
        leafId: 'leaf:salem:recycling',
        recognitionKey: TRIGGER_EVENT_ID,
        state: 'confirmed',
        privacy: 'private_family_league',
      },
    }),
    sourceReceipt({
      id: 'receipt:family-reward:1',
      authority: 'family_reward',
      consequence: {
        kind: 'private_family_reward',
        planId: 'reward-plan:salem:september',
        planVersion: 1,
        lifecycleBefore: 'promised',
        lifecycleAfter: 'unlocked',
        privacy: 'child_guardians_only',
      },
    }),
    sourceReceipt({
      id: 'receipt:badge:expanding-shade',
      authority: 'achievements',
      consequence: {
        kind: 'earned_badge',
        awardId: 'award:expanding-shade:1',
        badgeId: 'badge.journey.expanding_shade.v1',
        newlyEarned: true,
        earnedAt: TRIGGERED_AT,
        private: true,
        permanent: true,
      },
    }),
    sourceReceipt({
      id: 'receipt:station:120',
      authority: 'impact_path',
      consequence: {
        kind: 'impact_path_station',
        threshold: 120,
        result: 'archive_mangrove_and_earn_expanding_shade',
        newlyReached: true,
      },
    }),
  ];
}

function approvalInput(
  overrides: Partial<Omit<RevealConstructionInput, 'queue'>> & {
    readonly queue?: RevealBundleQueue;
  } = {},
): RevealConstructionInput {
  return {
    queue: createEmptyRevealBundleQueue(),
    profileId: PROFILE_ID,
    profileEpochId: PROFILE_EPOCH_ID,
    triggerEventId: TRIGGER_EVENT_ID,
    triggerKind: 'task_approval',
    triggeredAt: TRIGGERED_AT,
    receipts: approvalReceipts(),
    ...overrides,
  };
}

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

function createdBundle(input = approvalInput()) {
  const result = constructRevealBundle(input);
  expectOk(result);
  expect(result.data.disposition).toBe('created');
  if (result.data.disposition !== 'created') throw new Error('Expected a created bundle');
  return result.data;
}

describe('R002b receipt-only RevealBundle construction', () => {
  it('uses the exact profile and trigger identity and preserves complete consequence parity', () => {
    const result = createdBundle();

    expect(result.bundle.id).toBe(`reveal:${PROFILE_ID}:${TRIGGER_EVENT_ID}`);
    expect(result.bundle).toMatchObject({
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: TRIGGER_EVENT_ID,
      triggerKind: 'task_approval',
      lifecycle: 'ready',
      triggeredAt: TRIGGERED_AT,
    });
    expect(result.bundle.items.map((item) => item.consequence.kind)).toEqual([
      'parent_praise',
      'seed',
      'plant_stage',
      'canopy',
      'green_circle',
      'private_league_leaf',
      'challenge_leaf',
      'private_family_reward',
      'earned_badge',
      'earned_badge',
      'impact_path_station',
      'impact_path_station',
      'unlocked_learning',
      'safe_help',
    ]);
    expect(
      result.bundle.items.filter(receiptIs('earned_badge')).map((item) => item.consequence.badgeId),
    ).toEqual(['badge.journey.coastal_care.v1', 'badge.journey.expanding_shade.v1']);
    expect(
      result.bundle.items
        .filter(receiptIs('impact_path_station'))
        .map((item) => item.consequence.threshold),
    ).toEqual([120, 132]);
    expect(result.bundle.items).toHaveLength(approvalReceipts().length);
  });

  it('keeps Green Circle optional without changing the remaining canonical order', () => {
    const receipts = approvalReceipts().filter(
      (receipt) => receipt.consequence.kind !== 'green_circle',
    );
    const result = createdBundle(approvalInput({ receipts }));

    expect(result.bundle.items.some((item) => item.consequence.kind === 'green_circle')).toBe(
      false,
    );
    expect(result.bundle.items.map((item) => item.consequence.kind)).toEqual([
      'parent_praise',
      'seed',
      'plant_stage',
      'canopy',
      'private_league_leaf',
      'challenge_leaf',
      'private_family_reward',
      'earned_badge',
      'earned_badge',
      'impact_path_station',
      'impact_path_station',
      'unlocked_learning',
      'safe_help',
    ]);
  });

  it('requires the committed Parent praise in every task-approval reveal', () => {
    const seedOnly = approvalReceipts().filter(receiptIs('seed'));

    expect(constructRevealBundle(approvalInput({ receipts: seedOnly }))).toMatchObject({
      ok: false,
      error: { code: 'RECEIPT_CONFLICT' },
    });
  });

  it('is deterministic regardless of source order and harmless exact duplicate receipts', () => {
    const receipts = approvalReceipts();
    const duplicate = receipts[4];
    if (!duplicate) throw new Error('Missing duplicate fixture');
    const first = createdBundle(approvalInput({ receipts }));
    const second = createdBundle(
      approvalInput({ receipts: [duplicate, ...receipts.toReversed(), duplicate] }),
    );

    expect(second.bundle).toEqual(first.bundle);
    expect(second.bundle.sourceFingerprint).toBe(first.bundle.sourceFingerprint);
  });

  it('returns the existing bundle on a retry and rejects a conflicting concurrent candidate', () => {
    const first = createdBundle();
    const duplicate = constructRevealBundle(approvalInput({ queue: first.queue }));
    expectOk(duplicate);
    expect(duplicate.data).toEqual({
      disposition: 'already_exists',
      queue: first.queue,
      bundle: first.bundle,
    });

    const concurrentCandidate = createdBundle();
    const merged = constructRevealBundle(
      approvalInput({ queue: concurrentCandidate.queue, receipts: approvalReceipts() }),
    );
    expectOk(merged);
    expect(merged.data.disposition).toBe('already_exists');

    const changedReceipts: CommittedRevealSourceReceipt[] = approvalReceipts().map((receipt) =>
      receiptIs('parent_praise')(receipt)
        ? {
            ...receipt,
            consequence: {
              ...receipt.consequence,
              text: { ...receipt.consequence.text, en: 'Conflicting committed praise.' },
            },
          }
        : receipt,
    );
    expect(
      constructRevealBundle(approvalInput({ queue: first.queue, receipts: changedReceipts })),
    ).toMatchObject({ ok: false, error: { code: 'BUNDLE_CONFLICT' } });
  });

  it('rejects hidden authority on a stored queue, bundle, or source receipt', () => {
    const first = createdBundle();
    const hiddenQueue = { ...first.queue };
    Object.defineProperty(hiddenQueue, 'hiddenAuthority', { value: true, enumerable: false });

    const hiddenBundle = { ...first.bundle };
    Object.defineProperty(hiddenBundle, 'hiddenAuthority', { value: true, enumerable: false });

    const source = first.bundle.items[0];
    if (!source) throw new Error('Expected one stored source receipt');
    const hiddenSource = { ...source };
    Object.defineProperty(hiddenSource, 'hiddenAuthority', { value: true, enumerable: false });

    const malformedQueues: RevealBundleQueue[] = [
      hiddenQueue,
      { ...first.queue, bundles: [hiddenBundle] },
      {
        ...first.queue,
        bundles: [{ ...first.bundle, items: [hiddenSource, ...first.bundle.items.slice(1)] }],
      },
    ];

    for (const queue of malformedQueues) {
      expect(constructRevealBundle(approvalInput({ queue }))).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
    }
  });

  it('fails closed for a conflicting source ID or multiple singleton consequences', () => {
    const receipts = approvalReceipts();
    const praise = receipts.find(receiptIs('parent_praise'));
    if (!praise) throw new Error('Missing praise');

    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            ...receipts,
            {
              ...praise,
              consequence: {
                ...praise.consequence,
                text: { ...praise.consequence.text, en: 'Different content under the same ID.' },
              },
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });

    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            ...receipts,
            {
              ...praise,
              id: 'receipt:praise:2',
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it.each([
    ['receipt profile', { profileId: 'child_alya' }, 'PROFILE_SCOPE_MISMATCH'],
    ['receipt epoch', { profileEpochId: 'reset-epoch-002' }, 'EPOCH_SCOPE_MISMATCH'],
    [
      'receipt trigger',
      { triggerEventId: 'recognition:another-submission' },
      'TRIGGER_SCOPE_MISMATCH',
    ],
    ['receipt trigger kind', { triggerKind: 'learning_completion' }, 'TRIGGER_SCOPE_MISMATCH'],
    ['uncommitted receipt', { status: 'pending' }, 'UNCOMMITTED_RECEIPT'],
  ] as const)('rejects a mismatched %s', (_label, override, code) => {
    const [receipt, ...rest] = approvalReceipts();
    if (!receipt) throw new Error('Missing receipt fixture');
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            { ...receipt, ...override } as unknown as CommittedRevealSourceReceipt,
            ...rest,
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code } });
  });

  it('rejects partial, unknown-key, malformed, and internally inconsistent receipt data', () => {
    expect(constructRevealBundle({ profileId: PROFILE_ID })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(constructRevealBundle({ ...approvalInput(), rewardCalculator: () => 12 })).toMatchObject(
      { ok: false, error: { code: 'INVALID_INPUT' } },
    );

    const seed = approvalReceipts().find(receiptIs('seed'));
    if (!seed) throw new Error('Missing Seed receipt');
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            {
              ...seed,
              consequence: { ...seed.consequence, after: 999 },
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });

    const praise = approvalReceipts().find(receiptIs('parent_praise'));
    if (!praise) throw new Error('Missing praise receipt');
    const badge = approvalReceipts().find(receiptIs('earned_badge'));
    if (!badge) throw new Error('Missing badge receipt');
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            praise,
            {
              ...badge,
              consequence: { ...badge.consequence, earnedAt: null },
            } as unknown as CommittedRevealSourceReceipt,
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            {
              ...seed,
              consequence: { ...seed.consequence, writableBalance: 120 },
            } as unknown as CommittedRevealSourceReceipt,
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            {
              ...badge,
              consequence: { ...badge.consequence, badgeId: 'badge.unknown.v1' },
            } as unknown as CommittedRevealSourceReceipt,
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      constructRevealBundle(
        approvalInput({
          receipts: [
            {
              ...seed,
              authority: 'garden',
            } as unknown as CommittedRevealSourceReceipt,
          ],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('does not retain mutable references and deeply freezes every produced record', () => {
    const input = approvalInput();
    const result = createdBundle(input);
    const praise = input.receipts.find(receiptIs('parent_praise'));
    if (!praise) throw new Error('Missing praise');
    const originalArabic = praise.consequence.text.ar;

    (praise.consequence.text as { ar: string }).ar = 'mutated input';
    const storedPraise = result.bundle.items.find(receiptIs('parent_praise'));
    expect(storedPraise?.consequence.kind).toBe('parent_praise');
    if (!storedPraise) {
      throw new Error('Missing stored praise');
    }
    expect(storedPraise.consequence.text.ar).toBe(originalArabic);
    expect(Object.isFrozen(result.queue)).toBe(true);
    expect(Object.isFrozen(result.queue.bundles)).toBe(true);
    expect(Object.isFrozen(result.bundle)).toBe(true);
    expect(Object.isFrozen(result.bundle.items)).toBe(true);
    expect(Object.isFrozen(storedPraise.consequence.text)).toBe(true);
    expect(() => {
      (storedPraise.consequence.text as { en: string }).en = 'mutated output';
    }).toThrow(TypeError);
  });

  it('contains presentation records only and no reward calculation or mutation controls', () => {
    const { bundle } = createdBundle();
    const forbiddenKeys = new Set([
      'apply',
      'calculate',
      'calculator',
      'commit',
      'grant',
      'mint',
      'mutation',
      'reverse',
      'rollback',
      'spend',
      'writableBalance',
    ]);

    function assertPresentationOnly(value: unknown): void {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        expect(forbiddenKeys.has(key)).toBe(false);
        assertPresentationOnly(child);
      }
    }

    assertPresentationOnly(bundle);
  });
});

describe('R002b trigger eligibility', () => {
  it('creates no bundle for zero-reward task submission and rejects supplied reward receipts', () => {
    const emptyQueue = createEmptyRevealBundleQueue();
    const result = constructRevealBundle({
      queue: emptyQueue,
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: 'submission:submission_recycling_p0_1',
      triggerKind: 'task_submission',
      triggeredAt: '2026-09-05T08:00:00.000Z',
      receipts: [],
    });
    expectOk(result);
    expect(result.data).toEqual({
      disposition: 'not_created',
      reason: 'zero_reward_submission',
      queue: emptyQueue,
      bundle: null,
    });

    expect(
      constructRevealBundle({
        ...approvalInput(),
        triggerKind: 'task_submission',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INELIGIBLE_TRIGGER' } });
  });

  it('creates no task-approval bundle when no committed visible consequence exists', () => {
    const queue = createEmptyRevealBundleQueue();
    const result = constructRevealBundle(approvalInput({ queue, receipts: [] }));
    expectOk(result);
    expect(result.data).toEqual({
      disposition: 'not_created',
      reason: 'no_presentable_consequence',
      queue,
      bundle: null,
    });
  });

  it('allows a zero-Seed learning bundle only for a genuinely newly earned outcome', () => {
    const learningEventId = 'learning-completion:mangrove-roots:1';
    const earnedBadgeReceipt: CommittedRevealSourceReceipt = {
      id: 'receipt:learning-badge:mangrove-care',
      authority: 'achievements',
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: learningEventId,
      triggerKind: 'learning_completion',
      status: 'committed',
      committedAt: '2026-09-05T09:00:00.000Z',
      consequence: {
        kind: 'earned_badge',
        awardId: 'award:mangrove-care:1',
        badgeId: 'badge.habitat.mangrove_care.v1',
        newlyEarned: true,
        earnedAt: '2026-09-05T09:00:00.000Z',
        private: true,
        permanent: true,
      },
    };
    const result = constructRevealBundle({
      queue: createEmptyRevealBundleQueue(),
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: learningEventId,
      triggerKind: 'learning_completion',
      triggeredAt: '2026-09-05T09:00:00.000Z',
      receipts: [earnedBadgeReceipt],
    });
    expectOk(result);
    expect(result.data.disposition).toBe('created');
    if (result.data.disposition !== 'created') throw new Error('Expected learning bundle');
    expect(result.data.bundle.items.map((item) => item.consequence.kind)).toEqual(['earned_badge']);
    expect(result.data.bundle.items.some((item) => item.consequence.kind === 'seed')).toBe(false);
  });

  it('omits learning bundles without a new outcome and rejects task-reward consequences', () => {
    const learningEventId = 'learning-completion:mangrove-roots:1';
    const queue = createEmptyRevealBundleQueue();
    const noOutcome = constructRevealBundle({
      queue,
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: learningEventId,
      triggerKind: 'learning_completion',
      triggeredAt: '2026-09-05T09:00:00.000Z',
      receipts: [],
    });
    expectOk(noOutcome);
    expect(noOutcome.data).toEqual({
      disposition: 'not_created',
      reason: 'learning_without_new_outcome',
      queue,
      bundle: null,
    });

    const seed = approvalReceipts().find(receiptIs('seed'));
    if (!seed) throw new Error('Missing Seed receipt');
    expect(
      constructRevealBundle({
        queue,
        profileId: PROFILE_ID,
        profileEpochId: PROFILE_EPOCH_ID,
        triggerEventId: learningEventId,
        triggerKind: 'learning_completion',
        triggeredAt: '2026-09-05T09:00:00.000Z',
        receipts: [
          {
            ...seed,
            triggerEventId: learningEventId,
            triggerKind: 'learning_completion',
          },
        ],
      }),
    ).toMatchObject({ ok: false, error: { code: 'INELIGIBLE_TRIGGER' } });
  });

  it('rejects a second claim that a permanent badge is a genuinely new learning outcome', () => {
    function learningBadgeReceipt(
      triggerEventId: string,
      suffix: string,
    ): CommittedRevealSourceReceipt {
      return {
        id: `receipt:learning-badge:mangrove-care:${suffix}`,
        authority: 'achievements',
        profileId: PROFILE_ID,
        profileEpochId: PROFILE_EPOCH_ID,
        triggerEventId,
        triggerKind: 'learning_completion',
        status: 'committed',
        committedAt: `2026-09-05T09:0${suffix}:00.000Z`,
        consequence: {
          kind: 'earned_badge',
          awardId: `award:mangrove-care:${suffix}`,
          badgeId: 'badge.habitat.mangrove_care.v1',
          newlyEarned: true,
          earnedAt: `2026-09-05T09:0${suffix}:00.000Z`,
          private: true,
          permanent: true,
        },
      };
    }

    const firstEvent = 'learning-completion:mangrove-roots:1';
    const first = constructRevealBundle({
      queue: createEmptyRevealBundleQueue(),
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: firstEvent,
      triggerKind: 'learning_completion',
      triggeredAt: '2026-09-05T09:01:00.000Z',
      receipts: [learningBadgeReceipt(firstEvent, '1')],
    });
    expectOk(first);
    expect(first.data.disposition).toBe('created');
    if (first.data.disposition !== 'created') throw new Error('Expected first learning bundle');

    const secondEvent = 'learning-completion:mangrove-roots:2';
    const standaloneSecond = constructRevealBundle({
      queue: createEmptyRevealBundleQueue(),
      profileId: PROFILE_ID,
      profileEpochId: PROFILE_EPOCH_ID,
      triggerEventId: secondEvent,
      triggerKind: 'learning_completion',
      triggeredAt: '2026-09-05T09:02:00.000Z',
      receipts: [learningBadgeReceipt(secondEvent, '2')],
    });
    expectOk(standaloneSecond);
    expect(standaloneSecond.data.disposition).toBe('created');
    if (standaloneSecond.data.disposition !== 'created') {
      throw new Error('Expected standalone second learning bundle');
    }
    expect(
      selectVisibleRevealBundle(
        {
          schemaVersion: first.data.queue.schemaVersion,
          bundles: [first.data.bundle, standaloneSecond.data.bundle],
        },
        PRESENTATION_SCOPE,
      ),
    ).toMatchObject({ ok: false, error: { code: 'QUEUE_CONFLICT' } });

    expect(
      constructRevealBundle({
        queue: first.data.queue,
        profileId: PROFILE_ID,
        profileEpochId: PROFILE_EPOCH_ID,
        triggerEventId: secondEvent,
        triggerKind: 'learning_completion',
        triggeredAt: '2026-09-05T09:02:00.000Z',
        receipts: [learningBadgeReceipt(secondEvent, '2')],
      }),
    ).toMatchObject({ ok: false, error: { code: 'RECEIPT_CONFLICT' } });
  });

  it.each([
    'parent_praise',
    'seed',
    'plant_stage',
    'canopy',
    'green_circle',
    'private_league_leaf',
    'challenge_leaf',
    'private_family_reward',
    'earned_badge',
    'impact_path_station',
    'unlocked_learning',
    'safe_help',
  ] as const)('rejects cross-bundle replay of the same committed %s outcome', (kind) => {
    function standaloneOutcomeBundle(sequence: 1 | 2) {
      const triggerEventId = `recognition:outcome-replay-${kind}:${sequence}`;
      const triggeredAt = `2026-09-05T10:0${sequence}:00.000Z`;
      const targetSource = approvalReceipts().find((receipt) => receipt.consequence.kind === kind);
      const praiseSource = approvalReceipts().find(receiptIs('parent_praise'));
      if (!targetSource || !praiseSource) throw new Error('Missing consequence fixture');

      const target = {
        ...targetSource,
        id: `${targetSource.id}:replay:${sequence}`,
        triggerEventId,
        committedAt: triggeredAt,
        consequence:
          targetSource.consequence.kind === 'challenge_leaf'
            ? { ...targetSource.consequence, recognitionKey: triggerEventId }
            : targetSource.consequence,
      } as CommittedRevealSourceReceipt;
      const praise = {
        ...praiseSource,
        id: `${praiseSource.id}:replay:${kind}:${sequence}`,
        triggerEventId,
        committedAt: triggeredAt,
        consequence: {
          ...praiseSource.consequence,
          checkInId: `checkin:outcome-replay:${kind}:${sequence}`,
        },
      } as CommittedRevealSourceReceipt;
      const input: RevealConstructionInput = {
        queue: createEmptyRevealBundleQueue(),
        profileId: PROFILE_ID,
        profileEpochId: PROFILE_EPOCH_ID,
        triggerEventId,
        triggerKind: 'task_approval',
        triggeredAt,
        receipts: kind === 'parent_praise' ? [target] : [praise, target],
      };
      const result = constructRevealBundle(input);
      expectOk(result);
      expect(result.data.disposition).toBe('created');
      if (result.data.disposition !== 'created') throw new Error('Expected standalone bundle');
      return { bundle: result.data.bundle, input, queue: result.data.queue };
    }

    const first = standaloneOutcomeBundle(1);
    const second = standaloneOutcomeBundle(2);
    expect(constructRevealBundle({ ...second.input, queue: first.queue })).toMatchObject({
      ok: false,
      error: { code: 'RECEIPT_CONFLICT' },
    });
    expect(
      selectVisibleRevealBundle(
        {
          schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION,
          bundles: [first.bundle, second.bundle],
        },
        PRESENTATION_SCOPE,
      ),
    ).toMatchObject({ ok: false, error: { code: 'QUEUE_CONFLICT' } });
  });
});

describe('R002b RevealBundle lifecycle and deterministic queue', () => {
  function enqueueAt(
    queue: RevealBundleQueue,
    triggerEventId: string,
    triggeredAt: string,
    profileId: 'child_salem' | 'child_alya' = PROFILE_ID,
  ): RevealBundleQueue {
    const outcomeSuffix = `${profileId}:${triggerEventId}`;
    const receipts = approvalReceipts()
      .filter(
        (receipt) =>
          !['earned_badge', 'impact_path_station', 'unlocked_learning'].includes(
            receipt.consequence.kind,
          ),
      )
      .map((receipt) => ({
        ...receipt,
        id: `${receipt.id}:${profileId}:${triggerEventId}`,
        profileId,
        triggerEventId,
        committedAt: triggeredAt,
        consequence: (() => {
          switch (receipt.consequence.kind) {
            case 'parent_praise':
              return { ...receipt.consequence, checkInId: `checkin:${outcomeSuffix}` };
            case 'seed':
              return { ...receipt.consequence, transactionId: `seed:${outcomeSuffix}` };
            case 'plant_stage':
              return { ...receipt.consequence, growthId: `growth:${outcomeSuffix}` };
            case 'canopy':
              return { ...receipt.consequence, contributionId: `canopy:${outcomeSuffix}` };
            case 'green_circle':
              return { ...receipt.consequence, eventId: `circle:${outcomeSuffix}` };
            case 'private_league_leaf':
              return {
                ...receipt.consequence,
                leagueReceiptId: `league:${outcomeSuffix}`,
                leafId: `leaf:${outcomeSuffix}`,
              };
            case 'challenge_leaf':
              return {
                ...receipt.consequence,
                leafId: `leaf:${outcomeSuffix}`,
                recognitionKey: triggerEventId,
              };
            case 'private_family_reward':
              return { ...receipt.consequence, planId: `reward-plan:${outcomeSuffix}` };
            case 'safe_help':
              return { ...receipt.consequence, recognitionId: `safe-help:${outcomeSuffix}` };
            default:
              return receipt.consequence;
          }
        })(),
      })) as CommittedRevealSourceReceipt[];
    const result = constructRevealBundle(
      approvalInput({ queue, profileId, triggerEventId, triggeredAt, receipts }),
    );
    expectOk(result);
    expect(result.data.disposition).toBe('created');
    if (result.data.disposition !== 'created') throw new Error('Expected queue entry');
    return result.data.queue;
  }

  it('orders bundles by trigger time and stable identity, independent of insertion order', () => {
    let queue = enqueueAt(
      createEmptyRevealBundleQueue(),
      'recognition:late',
      '2026-09-05T10:00:00.000Z',
    );
    queue = enqueueAt(queue, 'recognition:z-tie', '2026-09-05T09:00:00.000Z');
    queue = enqueueAt(queue, 'recognition:a-tie', '2026-09-05T09:00:00.000Z');

    expect(queue.bundles.map((bundle) => bundle.triggerEventId)).toEqual([
      'recognition:a-tie',
      'recognition:z-tie',
      'recognition:late',
    ]);
    const started = startOrResumeNextReveal(queue, PRESENTATION_SCOPE);
    expectOk(started);
    expect(started.data.disposition).toBe('started');
    expect(started.data.bundle?.triggerEventId).toBe('recognition:a-tie');
  });

  it('moves only through ready to presenting to acknowledged to archived', () => {
    const created = createdBundle();
    expect(
      acknowledgeRevealBundle(created.queue, created.bundle.id, PRESENTATION_SCOPE),
    ).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    const started = startOrResumeNextReveal(created.queue, PRESENTATION_SCOPE);
    expectOk(started);
    expect(started.data.bundle?.lifecycle).toBe('presenting');
    if (!started.data.bundle) throw new Error('Expected presenting bundle');

    const acknowledged = acknowledgeRevealBundle(
      started.data.queue,
      started.data.bundle.id,
      PRESENTATION_SCOPE,
    );
    expectOk(acknowledged);
    expect(acknowledged.data.bundle.lifecycle).toBe('acknowledged');
    expect(startOrResumeNextReveal(acknowledged.data.queue, PRESENTATION_SCOPE)).toMatchObject({
      ok: true,
      data: { disposition: 'empty', bundle: null },
    });

    const archived = archiveRevealBundle(
      acknowledged.data.queue,
      acknowledged.data.bundle.id,
      PRESENTATION_SCOPE,
    );
    expectOk(archived);
    expect(archived.data.bundle.lifecycle).toBe('archived');
    expect(
      archiveRevealBundle(archived.data.queue, archived.data.bundle.id, PRESENTATION_SCOPE),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'already_at_state', bundle: { lifecycle: 'archived' } },
    });
    expect(
      acknowledgeRevealBundle(archived.data.queue, archived.data.bundle.id, PRESENTATION_SCOPE),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'already_at_state', bundle: { lifecycle: 'archived' } },
    });
  });

  it('resumes the same presenting bundle after interruption and never stacks another', () => {
    let queue = enqueueAt(
      createEmptyRevealBundleQueue(),
      'recognition:first',
      '2026-09-05T09:00:00.000Z',
    );
    queue = enqueueAt(queue, 'recognition:second', '2026-09-05T10:00:00.000Z');
    const started = startOrResumeNextReveal(queue, PRESENTATION_SCOPE);
    expectOk(started);
    const recoveredQueue = structuredClone(started.data.queue);

    const resumed = startOrResumeNextReveal(recoveredQueue, PRESENTATION_SCOPE);
    expectOk(resumed);
    expect(resumed.data.disposition).toBe('resumed');
    expect(resumed.data.bundle?.id).toBe(started.data.bundle?.id);
    expect(
      resumed.data.queue.bundles.filter((bundle) => bundle.lifecycle === 'presenting'),
    ).toHaveLength(1);

    const visible = selectVisibleRevealBundle(resumed.data.queue, PRESENTATION_SCOPE);
    expectOk(visible);
    expect(visible.data?.id).toBe(started.data.bundle?.id);
  });

  it('starts only the exact canonical next bundle requested by a guarded route', () => {
    let queue = enqueueAt(
      createEmptyRevealBundleQueue(),
      'recognition:first',
      '2026-09-05T09:00:00.000Z',
    );
    queue = enqueueAt(queue, 'recognition:second', '2026-09-05T10:00:00.000Z');
    const first = queue.bundles[0];
    const second = queue.bundles[1];
    if (!first || !second) throw new Error('Expected two queued bundles');

    expect(startOrResumeRevealById(queue, second.id, PRESENTATION_SCOPE)).toMatchObject({
      ok: false,
      error: { code: 'QUEUE_CONFLICT' },
    });
    expect(queue.bundles.every((bundle) => bundle.lifecycle === 'ready')).toBe(true);

    const started = startOrResumeRevealById(queue, first.id, PRESENTATION_SCOPE);
    expectOk(started);
    expect(started.data.bundle?.id).toBe(first.id);
    expect(started.data.bundle?.lifecycle).toBe('presenting');

    expect(
      startOrResumeRevealById(started.data.queue, second.id, PRESENTATION_SCOPE),
    ).toMatchObject({
      ok: false,
      error: { code: 'QUEUE_CONFLICT' },
    });
    const resumed = startOrResumeRevealById(started.data.queue, first.id, PRESENTATION_SCOPE);
    expectOk(resumed);
    expect(resumed.data.disposition).toBe('resumed');
    expect(resumed.data.bundle?.id).toBe(first.id);
  });

  it('selects only the active profile and never exposes or acknowledges another profile bundle', () => {
    let queue = enqueueAt(
      createEmptyRevealBundleQueue(),
      'recognition:alya-first',
      '2026-09-05T08:00:00.000Z',
      'child_alya',
    );
    queue = enqueueAt(queue, 'recognition:salem-second', '2026-09-05T09:00:00.000Z', 'child_salem');

    const salemStarted = startOrResumeNextReveal(queue, PRESENTATION_SCOPE);
    expectOk(salemStarted);
    expect(salemStarted.data.bundle?.profileId).toBe('child_salem');
    if (!salemStarted.data.bundle) throw new Error('Expected Salem bundle');

    const alyaScope: RevealPresentationScope = {
      profileId: 'child_alya',
      profileEpochId: PROFILE_EPOCH_ID,
    };
    const alyaVisible = selectVisibleRevealBundle(salemStarted.data.queue, alyaScope);
    expectOk(alyaVisible);
    expect(alyaVisible.data).toBeNull();
    expect(startOrResumeNextReveal(salemStarted.data.queue, alyaScope)).toMatchObject({
      ok: false,
      error: { code: 'PROFILE_SCOPE_MISMATCH' },
    });
    expect(
      acknowledgeRevealBundle(salemStarted.data.queue, salemStarted.data.bundle.id, alyaScope),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
  });

  it('fails closed when corrupt recovery state claims two visible bundles', () => {
    let queue = enqueueAt(
      createEmptyRevealBundleQueue(),
      'recognition:first',
      '2026-09-05T09:00:00.000Z',
    );
    queue = enqueueAt(queue, 'recognition:second', '2026-09-05T10:00:00.000Z');
    const corrupt = {
      ...queue,
      bundles: queue.bundles.map((bundle) => ({ ...bundle, lifecycle: 'presenting' as const })),
    };

    expect(selectVisibleRevealBundle(corrupt, PRESENTATION_SCOPE)).toMatchObject({
      ok: false,
      error: { code: 'QUEUE_CONFLICT' },
    });
    expect(startOrResumeNextReveal(corrupt, PRESENTATION_SCOPE)).toMatchObject({
      ok: false,
      error: { code: 'QUEUE_CONFLICT' },
    });
  });

  it('never rebuilds an acknowledged or archived bundle and dismissal changes no consequences', () => {
    const created = createdBundle();
    const started = startOrResumeNextReveal(created.queue, PRESENTATION_SCOPE);
    expectOk(started);
    if (!started.data.bundle) throw new Error('Expected presenting bundle');
    const consequencesBefore = started.data.bundle.items;
    const acknowledged = acknowledgeRevealBundle(
      started.data.queue,
      started.data.bundle.id,
      PRESENTATION_SCOPE,
    );
    expectOk(acknowledged);
    expect(acknowledged.data.bundle.items).toEqual(consequencesBefore);

    const retry = constructRevealBundle(approvalInput({ queue: acknowledged.data.queue }));
    expectOk(retry);
    expect(retry.data.disposition).toBe('already_exists');
    expect(retry.data.bundle?.lifecycle).toBe('acknowledged');
    expect(retry.data.bundle?.items).toEqual(consequencesBefore);

    const archived = archiveRevealBundle(
      acknowledged.data.queue,
      acknowledged.data.bundle.id,
      PRESENTATION_SCOPE,
    );
    expectOk(archived);
    const archivedRetry = constructRevealBundle(approvalInput({ queue: archived.data.queue }));
    expectOk(archivedRetry);
    expect(archivedRetry.data.disposition).toBe('already_exists');
    expect(archivedRetry.data.bundle?.lifecycle).toBe('archived');
    expect(archivedRetry.data.bundle?.items).toEqual(consequencesBefore);
  });

  it('rejects missing bundle IDs and malformed stored bundle identity', () => {
    const created = createdBundle();
    expect(
      archiveRevealBundle(created.queue, 'reveal:missing:event', PRESENTATION_SCOPE),
    ).toMatchObject({
      ok: false,
      error: { code: 'BUNDLE_NOT_FOUND' },
    });
    expect(
      selectVisibleRevealBundle(
        {
          ...created.queue,
          bundles: [{ ...created.bundle, id: 'not-the-derived-identity' }],
        },
        PRESENTATION_SCOPE,
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });
});
