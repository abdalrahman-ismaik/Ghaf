import { beforeEach, describe, expect, it } from 'vitest';

import {
  constructRevealBundle,
  createEmptyRevealBundleQueue,
} from '../src/features/rewards/revealBundle';
import type { CommittedRevealSourceReceipt, RevealBundleQueue } from '../src/models/revealBundle';
import { PREPARED_PRAISE, createSubmittedP0Session } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

const PRAISE_ACTION = {
  actionId: 'r002b-reveal-parent-praise',
  source: 'parent_press' as const,
  presentedAt: '2026-09-05T10:00:00.000Z',
};

const RECOGNITION_ACTION = {
  actionId: 'r002b-reveal-parent-recognition',
  source: 'parent_press' as const,
  observedRenderState: 'praise_presented' as const,
  presentationActionId: PRAISE_ACTION.actionId,
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected success: ${JSON.stringify(result)}`);
  }
  return result.data;
}

function applyCanonicalRecognition() {
  usePrototypeStore.setState(createSubmittedP0Session());
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
  return expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));
}

function createRouteFixtureQueue(): RevealBundleQueue {
  const state = usePrototypeStore.getState();
  const profileId = state.activeChildId;
  const profileEpochId = state.growthJourney.ledgersByProfile[profileId].profileEpochId;
  const triggerEventId = 'recognition:test-only-complete-receipt-fixture';
  const triggeredAt = '2026-09-05T10:30:00.000Z';
  const praise: CommittedRevealSourceReceipt = {
    id: 'receipt:test-only:praise',
    authority: 'parent_check_in',
    profileId,
    profileEpochId,
    triggerEventId,
    triggerKind: 'task_approval',
    status: 'committed',
    committedAt: triggeredAt,
    consequence: {
      kind: 'parent_praise',
      checkInId: 'check-in:test-only',
      text: {
        ar: 'لاحظ ولي أمرك الخطوات التي أكملتها.',
        en: 'Your parent noticed the steps you completed.',
      },
    },
  };
  const constructed = constructRevealBundle({
    queue: createEmptyRevealBundleQueue(),
    profileId,
    profileEpochId,
    triggerEventId,
    triggerKind: 'task_approval',
    triggeredAt,
    receipts: [praise],
  });
  if (!constructed.ok || constructed.data.disposition !== 'created') {
    throw new Error('Expected a test-only route fixture queue');
  }
  return constructed.data.queue;
}

describe('R002b RevealBundle store integration', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('starts empty and creates no result bundle for zero-reward submission', () => {
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);

    usePrototypeStore.setState(createSubmittedP0Session());
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);
  });

  it('queues every committed consequence from the canonical Parent approval', () => {
    const recognition = applyCanonicalRecognition();
    const state = usePrototypeStore.getState();
    const bundle = state.revealBundleQueue.bundles[0];

    expect(recognition.disposition).toBe('applied');
    expect(state.children.child_salem.earnedSeeds).toBe(60);
    expect(state.celebration.available).toBe(true);
    expect(state.celebration.consumed).toBe(false);
    expect(state.revealBundleQueue.bundles).toHaveLength(1);
    expect(bundle).toMatchObject({
      id: 'reveal:child_salem:recognition:submission_recycling_p0_v1_attempt_1',
      profileId: 'child_salem',
      triggerEventId: recognition.receipt.recognitionKey,
      triggerKind: 'task_approval',
      lifecycle: 'ready',
      triggeredAt: PRAISE_ACTION.presentedAt,
    });
    expect(bundle?.items.map((item) => item.consequence.kind)).toEqual([
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
      'safe_help',
    ]);
    expect(bundle?.items.map((item) => item.consequence)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'seed', before: 108, after: 120, delta: 12 }),
        expect.objectContaining({
          kind: 'plant_stage',
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
        }),
        expect.objectContaining({ kind: 'canopy', leavesBefore: 19, leavesAfter: 20 }),
        expect.objectContaining({ kind: 'green_circle', actionsBefore: 11, actionsAfter: 12 }),
        expect.objectContaining({
          kind: 'private_league_leaf',
          confirmedLeavesBefore: 4,
          confirmedLeavesAfter: 5,
        }),
        expect.objectContaining({
          kind: 'challenge_leaf',
          recognitionKey: recognition.receipt.recognitionKey,
          state: 'confirmed',
        }),
        expect.objectContaining({
          kind: 'private_family_reward',
          planId: 'family-reward-salem-september-v1',
          planVersion: 1,
          lifecycleBefore: 'promised',
          lifecycleAfter: 'unlocked',
        }),
        expect.objectContaining({
          kind: 'impact_path_station',
          threshold: 120,
          result: 'archive_mangrove_and_earn_expanding_shade',
        }),
        expect.objectContaining({
          kind: 'safe_help',
          helpKind: 'permitted_help',
          recognized: true,
        }),
      ]),
    );
    expect(
      bundle?.items.flatMap((item) =>
        item.consequence.kind === 'earned_badge' ? [item.consequence.badgeId] : [],
      ),
    ).toEqual(['badge.journey.expanding_shade.v1', 'badge.skill.sorting.bud.v1']);
    expect(bundle?.items.some((item) => item.consequence.kind === 'unlocked_learning')).toBe(false);
    expect(
      state.privateLeague.receiptsByRecognitionKey[recognition.receipt.recognitionKey],
    ).toEqual(
      expect.objectContaining({
        profileId: 'child_salem',
        profileEpochId: state.growthJourney.ledgersByProfile.child_salem.profileEpochId,
        confirmedLeavesBefore: 4,
        confirmedLeavesAfter: 5,
        status: 'committed',
      }),
    );
  });

  it('keeps the same approval consequences on an exact recognition retry', () => {
    const first = applyCanonicalRecognition();
    const queue = usePrototypeStore.getState().revealBundleQueue;

    const repeated = expectOk(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION));

    expect(first.disposition).toBe('applied');
    expect(repeated.disposition).toBe('already_confirmed');
    expect(repeated.receipt).toEqual(first.receipt);
    expect(usePrototypeStore.getState().revealBundleQueue).toBe(queue);
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toHaveLength(1);
  });

  it('commits no consequence when an authority cannot reconcile', () => {
    const state = usePrototypeStore.getState();
    const growthJourney = state.growthJourney;
    const privateLeague = state.privateLeague;
    usePrototypeStore.setState({
      familyReward: {
        ...state.familyReward,
        targetEligibleSeeds: 121,
      } as unknown as typeof state.familyReward,
    });

    usePrototypeStore.setState(createSubmittedP0Session());
    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId: 'submission_recycling_p0_v1_attempt_1',
        praise: PREPARED_PRAISE,
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expectOk(usePrototypeStore.getState().markPraisePresented(PRAISE_ACTION));
    expect(usePrototypeStore.getState().applyRecognition(RECOGNITION_ACTION)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    const after = usePrototypeStore.getState();
    expect(after.children.child_salem.earnedSeeds).toBe(48);
    expect(after.recognitionLedger).toEqual({});
    expect(after.growthJourney).toBe(growthJourney);
    expect(after.privateLeague).toBe(privateLeague);
    expect(after.revealBundleQueue.bundles).toEqual([]);
  });

  it('runs an authoritative queued fixture through the exact lifecycle idempotently', async () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');
    await enterChildExperienceForTest();
    usePrototypeStore.setState({ revealBundleQueue: queue });

    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('presenting');
    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('archived');
  });

  it('fails closed across profile boundaries and clears all queued presentation on Parent reset', async () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');

    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    await enterChildExperienceForTest('child_alya');
    usePrototypeStore.setState({ revealBundleQueue: queue });
    expect(usePrototypeStore.getState().startRevealPresentation(bundle.id)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('ready');

    await enterParentExperienceForTest();
    const priorLeagueEpoch = usePrototypeStore.getState().privateLeague.profileEpochId;
    expectOk(usePrototypeStore.getState().resetPrototype());
    const reset = usePrototypeStore.getState();
    expect(reset.revealBundleQueue.bundles).toEqual([]);
    expect(reset.privateLeague.profileEpochId).not.toBe(priorLeagueEpoch);
    expect(reset.privateLeague.profileEpochId).toBe(
      reset.growthJourney.ledgersByProfile.child_salem.profileEpochId,
    );
    expect(reset.privateLeague.receiptsByRecognitionKey).toEqual({});
  });
});
