import { beforeEach, describe, expect, it } from 'vitest';

import {
  constructRevealBundle,
  createEmptyRevealBundleQueue,
} from '../src/features/rewards/revealBundle';
import type { CommittedRevealSourceReceipt, RevealBundleQueue } from '../src/models/revealBundle';
import { PREPARED_PRAISE, createSubmittedP0Session } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

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
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('starts empty and creates no result bundle for zero-reward submission', () => {
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);

    usePrototypeStore.setState(createSubmittedP0Session());
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('submitted');
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);
  });

  it('keeps approval on the R002a fallback until complete consequence receipts are authoritative', () => {
    const recognition = applyCanonicalRecognition();
    const state = usePrototypeStore.getState();

    expect(recognition.disposition).toBe('applied');
    expect(state.children.child_salem.earnedSeeds).toBe(60);
    expect(state.celebration.available).toBe(true);
    expect(state.revealBundleQueue.bundles).toEqual([]);
  });

  it('runs an authoritative queued fixture through the exact lifecycle idempotently', () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');
    usePrototypeStore.setState({ revealBundleQueue: queue, role: 'child' });

    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('presenting');
    expectOk(usePrototypeStore.getState().startRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().acknowledgeRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expectOk(usePrototypeStore.getState().archiveRevealPresentation(bundle.id));
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('archived');
  });

  it('fails closed across profile boundaries and clears all queued presentation on Parent reset', () => {
    const queue = createRouteFixtureQueue();
    const bundle = queue.bundles[0];
    if (!bundle) throw new Error('Expected route fixture bundle');
    usePrototypeStore.setState({ revealBundleQueue: queue, role: 'child' });

    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState().startRevealPresentation(bundle.id)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(usePrototypeStore.getState().revealBundleQueue.bundles[0]?.lifecycle).toBe('ready');

    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().revealBundleQueue.bundles).toEqual([]);
  });
});
