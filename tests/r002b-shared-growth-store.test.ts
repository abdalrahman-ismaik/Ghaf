import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_CAPABILITIES } from '@/models/access';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected result to succeed: ${JSON.stringify(result)}`);
  }
  return result.data;
}

describe('R002b Shared Growth access and store integration', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('registers a dedicated Parent capability without changing Child capabilities', () => {
    expect(PARENT_CAPABILITIES).toContain('manage_shared_growth_contribution');
    expect(usePrototypeStore.getState().sharedGrowth.preference.status).toBe('continued');
  });

  it('keeps the anonymous qualitative view available when future contribution is paused', async () => {
    await enterParentExperienceForTest();
    const before = usePrototypeStore.getState();
    const immutableAuthorities = {
      children: structuredClone(before.children),
      recognitionLedger: structuredClone(before.recognitionLedger),
      growthJourney: structuredClone(before.growthJourney),
      landscapeProgress: structuredClone(before.landscapeProgress),
      circleGoal: structuredClone(before.circleGoal),
    };

    const paused = expectOk(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-pause-001',
        action: 'pause_new_contributions',
        actedAt: '2026-09-04T10:01:00.000Z',
        proofId: 'shared-growth-proof-pause-001',
        freshConsentConfirmed: false,
      }),
    );

    expect(paused.state.preference).toMatchObject({
      status: 'paused',
      activeConsentReceiptId: expect.any(String),
      acceptingSignalsSince: null,
    });
    await enterChildExperienceForTest();
    const childView = expectOk(usePrototypeStore.getState().getSharedGrowthChildView());
    expect(childView).toMatchObject({
      availability: 'ready',
      viewing: 'available',
      participation: 'paused',
      contributionPrompt: 'none',
      privacy: 'anonymous_qualitative',
    });
    expect(JSON.stringify(childView)).not.toMatch(
      /child_salem|child_alya|name|rank|score|percent|count|seed|badge|task|reward/iu,
    );

    const after = usePrototypeStore.getState();
    expect({
      children: after.children,
      recognitionLedger: after.recognitionLedger,
      growthJourney: after.growthJourney,
      landscapeProgress: after.landscapeProgress,
      circleGoal: after.circleGoal,
    }).toEqual(immutableAuthorities);
  });

  it('reuses consent after Pause but requires explicit fresh consent after End', async () => {
    await enterParentExperienceForTest();
    const initialConsentId =
      usePrototypeStore.getState().sharedGrowth.preference.activeConsentReceiptId;

    expectOk(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-pause-002',
        action: 'pause_new_contributions',
        actedAt: '2026-09-04T10:01:00.000Z',
        proofId: 'shared-growth-proof-pause-002',
        freshConsentConfirmed: false,
      }),
    );
    expectOk(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-resume-002',
        action: 'continue',
        actedAt: '2026-09-04T10:02:00.000Z',
        proofId: 'shared-growth-proof-resume-002',
        freshConsentConfirmed: false,
      }),
    );
    expect(usePrototypeStore.getState().sharedGrowth.preference.activeConsentReceiptId).toBe(
      initialConsentId,
    );

    expectOk(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-end-002',
        action: 'end_participation',
        actedAt: '2026-09-04T10:03:00.000Z',
        proofId: 'shared-growth-proof-end-002',
        freshConsentConfirmed: false,
      }),
    );
    expect(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-return-without-consent-002',
        action: 'continue',
        actedAt: '2026-09-04T10:04:00.000Z',
        proofId: 'shared-growth-proof-return-without-consent-002',
        freshConsentConfirmed: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    expectOk(
      usePrototypeStore.getState().changeSharedGrowthParticipation({
        actionId: 'shared-growth-return-002',
        action: 'continue',
        actedAt: '2026-09-04T10:05:00.000Z',
        proofId: 'shared-growth-proof-return-002',
        freshConsentConfirmed: true,
      }),
    );
    const returned = usePrototypeStore.getState().sharedGrowth.preference;
    expect(returned.status).toBe('continued');
    expect(returned.consentReceipts).toHaveLength(2);
    expect(returned.activeConsentReceiptId).not.toBe(initialConsentId);
  });

  it('requires the real completed Parent session and rejects the Child presentation role', async () => {
    const input = {
      actionId: 'shared-growth-pause-authority',
      action: 'pause_new_contributions' as const,
      actedAt: '2026-09-04T10:01:00.000Z',
      proofId: 'shared-growth-proof-authority',
      freshConsentConfirmed: false as const,
    };
    expect(usePrototypeStore.getState().changeSharedGrowthParticipation(input)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    await enterParentExperienceForTest();
    usePrototypeStore.getState().setRole('child');
    expect(usePrototypeStore.getState().changeSharedGrowthParticipation(input)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('is idempotent for an identical action and creates a fresh epoch on Parent reset', async () => {
    await enterParentExperienceForTest();
    const input = {
      actionId: 'shared-growth-pause-idempotent',
      action: 'pause_new_contributions' as const,
      actedAt: '2026-09-04T10:01:00.000Z',
      proofId: 'shared-growth-proof-idempotent',
      freshConsentConfirmed: false as const,
    };
    const first = expectOk(usePrototypeStore.getState().changeSharedGrowthParticipation(input));
    const retry = expectOk(usePrototypeStore.getState().changeSharedGrowthParticipation(input));
    expect(first.state).toEqual(retry.state);
    expect(retry.disposition).toBe('already_applied');

    const firstEpoch = usePrototypeStore.getState().sharedGrowth.preference.participationEpochId;
    expectOk(usePrototypeStore.getState().resetPrototype());
    const reset = usePrototypeStore.getState().sharedGrowth;
    expect(reset.preference.status).toBe('continued');
    expect(reset.preference.actionHistory).toEqual([]);
    expect(reset.preference.participationEpochId).not.toBe(firstEpoch);
  });
});
