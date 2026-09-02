import { describe, expect, it } from 'vitest';

import { SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID } from '../src/models/access';
import * as familyRewards from '../src/features/family-rewards';
import {
  createFamilyRewardPlan,
  evaluateFamilyRewardPlan,
  markFamilyRewardGiven,
  projectFamilyRewardPlan,
  reviseFamilyRewardPlan,
  summarizeMonthlyMonetaryCommitments,
  validateFamilyRewardEligibilityEvent,
} from '../src/features/family-rewards';
import type {
  FamilyRewardEligibilityEvent,
  FamilyRewardMilestone,
  FamilyRewardPlan,
  FamilyRewardPlanDraft,
  FamilyRewardPromise,
} from '../src/models/familyReward';
import { createFeature003ServiceRegistry } from '../src/services';

const label = {
  ar: 'مكافأة عائلية',
  en: 'Family reward',
} as const;

const moneyPromise: FamilyRewardPromise = {
  kind: 'money',
  label,
  currency: 'AED',
  amountMinor: 2500,
};

const seedMilestone: FamilyRewardMilestone = {
  kind: 'eligible_seed_delta',
  requiredSeedDelta: 12,
};

function draft(overrides: Partial<FamilyRewardPlanDraft> = {}): FamilyRewardPlanDraft {
  return {
    id: 'family-reward-salem-1',
    childId: 'child_salem',
    guardianIds: ['guardian-parent-1'],
    createdByGuardianId: 'guardian-parent-1',
    month: '2026-09',
    promisedAt: '2026-09-02T10:00:00.000Z',
    promise: moneyPromise,
    milestone: seedMilestone,
    ...overrides,
  };
}

function plan(overrides: Partial<FamilyRewardPlanDraft> = {}): FamilyRewardPlan {
  const result = createFamilyRewardPlan(draft(overrides));
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function event(
  overrides: Partial<FamilyRewardEligibilityEvent> = {},
): FamilyRewardEligibilityEvent {
  return {
    id: 'reward-event-1',
    recognitionKey: 'recognition:reward-event-1',
    childId: 'child_salem',
    categoryId: 'green_impact',
    activityKind: 'general',
    recognitionMode: 'standard',
    routinePhase: 'acquisition',
    eligibleSeedDelta: 12,
    landscapeTransition: {
      landscapeId: 'mangrove',
      stageBefore: 'shoot',
      stageAfter: 'sapling',
    },
    occurredAt: '2026-09-03T10:00:00.000Z',
    prerequisites: {
      parentConfirmationRecorded: true,
      praisePresented: true,
      gardenRecognitionApplied: true,
    },
    ...overrides,
  };
}

describe('Family Reward plans', () => {
  it.each([
    moneyPromise,
    { kind: 'experience', label },
    { kind: 'privilege', label },
    { kind: 'gift', label },
  ] as const)('creates a private promised plan for $kind', (promise) => {
    expect(createFamilyRewardPlan(draft({ promise }))).toMatchObject({
      ok: true,
      data: {
        lifecycle: 'promised',
        version: 1,
        versionState: 'current',
        privacy: 'child_guardians_only',
        promise,
        unlockedAt: null,
        givenAt: null,
      },
    });
  });

  it.each([
    seedMilestone,
    { kind: 'landscape_stage', landscapeId: 'mangrove', targetStage: 'sapling' },
    { kind: 'landscapes_at_stage', targetStage: 'sapling', requiredCount: 3 },
  ] as const)('accepts the $kind personal milestone', (milestone) => {
    expect(createFamilyRewardPlan(draft({ milestone }))).toMatchObject({
      ok: true,
      data: { milestone },
    });
  });

  it.each([
    { ...moneyPromise, currency: 'aed' },
    { ...moneyPromise, currency: '' },
    { ...moneyPromise, amountMinor: -1 },
    { ...moneyPromise, amountMinor: 25.5 },
  ])('rejects invalid monetary metadata %#', (promise) => {
    expect(
      createFamilyRewardPlan(draft({ promise: promise as FamilyRewardPromise })),
    ).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('rejects League-derived fields instead of accepting them as personal progress', () => {
    expect(
      createFamilyRewardPlan({ ...draft(), leagueRank: 1 } as FamilyRewardPlanDraft),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      validateFamilyRewardEligibilityEvent(plan(), {
        ...event(),
        weeklyGrowthScore: 100,
        completionSpeed: 1,
      } as FamilyRewardEligibilityEvent),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });
});

describe('Family Reward eligibility and milestones', () => {
  it.each([
    ['faith category', { categoryId: 'faith_gratitude' }],
    ['faith', { activityKind: 'faith' }],
    ['affection', { activityKind: 'affection' }],
    ['emotional disclosure', { activityKind: 'emotional_disclosure' }],
    ['eating', { activityKind: 'eating' }],
    ['demonstrating love', { activityKind: 'demonstrating_love' }],
    ['private wellbeing', { activityKind: 'private_wellbeing' }],
    [
      'recognition-only',
      {
        recognitionMode: 'recognition_only',
        routinePhase: 'not_applicable',
        eligibleSeedDelta: 0,
      },
    ],
  ] as const)('rejects protected %s activity', (_label, overrides) => {
    expect(
      validateFamilyRewardEligibilityEvent(
        plan(),
        event(overrides as Partial<FamilyRewardEligibilityEvent>),
      ),
    ).toMatchObject({ ok: false, error: { code: 'PROTECTED_ACTIVITY' } });
  });

  it('requires the matching Child and completed praise/Garden prerequisites', () => {
    expect(
      validateFamilyRewardEligibilityEvent(plan(), event({ childId: 'child_alya' })),
    ).toMatchObject({ ok: false, error: { code: 'WRONG_CHILD' } });
    expect(
      validateFamilyRewardEligibilityEvent(
        plan(),
        event({
          prerequisites: {
            parentConfirmationRecorded: true,
            praisePresented: false,
            gardenRecognitionApplied: true,
          },
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'PREREQUISITE_NOT_MET' } });
  });

  it('unlocks an eligible Seed milestone once and deduplicates recognition keys', () => {
    const promised = plan();
    const duplicate = event({ id: 'reward-event-copy' });
    const unlocked = evaluateFamilyRewardPlan(promised, [event(), duplicate], {
      evaluatedAt: '2026-09-03T10:01:00.000Z',
    });

    expect(unlocked).toMatchObject({
      ok: true,
      data: {
        disposition: 'unlocked',
        plan: { lifecycle: 'unlocked', unlockedAt: '2026-09-03T10:01:00.000Z' },
        progress: { eligibleSeedDelta: 12, recognitionKeys: ['recognition:reward-event-1'] },
      },
    });
    if (!unlocked.ok) throw new Error(unlocked.error.message);
    expect(
      evaluateFamilyRewardPlan(unlocked.data.plan, [], {
        evaluatedAt: '2026-09-03T10:02:00.000Z',
      }),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'already_unlocked', plan: unlocked.data.plan },
    });
  });

  it('does not count eligible progress which happens after the evaluation time', () => {
    expect(
      evaluateFamilyRewardPlan(plan(), [event({ occurredAt: '2026-09-04T10:00:00.000Z' })], {
        evaluatedAt: '2026-09-03T10:00:00.000Z',
      }),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'not_reached', progress: { eligibleSeedDelta: 0 } },
    });
  });

  it('unlocks a named landscape only when an eligible event crosses its target stage', () => {
    const promised = plan({
      milestone: { kind: 'landscape_stage', landscapeId: 'mangrove', targetStage: 'sapling' },
    });
    expect(
      evaluateFamilyRewardPlan(
        promised,
        [
          event({
            landscapeTransition: {
              landscapeId: 'mangrove',
              stageBefore: 'sapling',
              stageAfter: 'sapling',
            },
          }),
        ],
        { evaluatedAt: '2026-09-03T10:01:00.000Z' },
      ),
    ).toMatchObject({ ok: true, data: { disposition: 'not_reached' } });
    expect(
      evaluateFamilyRewardPlan(promised, [event()], {
        evaluatedAt: '2026-09-03T10:01:00.000Z',
      }),
    ).toMatchObject({ ok: true, data: { disposition: 'unlocked' } });
  });

  it('counts distinct eligible landscapes which cross the requested stage', () => {
    const promised = plan({
      milestone: { kind: 'landscapes_at_stage', targetStage: 'sapling', requiredCount: 3 },
    });
    const events = ['mangrove', 'ghaf', 'sidr'].map((landscapeId, index) =>
      event({
        id: `reward-event-${index}`,
        recognitionKey: `recognition:reward-event-${index}`,
        landscapeTransition: {
          landscapeId: landscapeId as 'mangrove' | 'ghaf' | 'sidr',
          stageBefore: 'shoot',
          stageAfter: 'sapling',
        },
      }),
    );

    expect(
      evaluateFamilyRewardPlan(promised, events, {
        evaluatedAt: '2026-09-03T10:01:00.000Z',
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'unlocked',
        progress: { landscapesCrossingTarget: ['ghaf', 'mangrove', 'sidr'] },
      },
    });
  });
});

describe('Family Reward lifecycle, revision, and privacy', () => {
  it('moves unlocked to given monotonically and makes the given action idempotent', () => {
    const unlocked = evaluateFamilyRewardPlan(plan(), [event()], {
      evaluatedAt: '2026-09-03T10:01:00.000Z',
    });
    if (!unlocked.ok) throw new Error(unlocked.error.message);

    const given = markFamilyRewardGiven(unlocked.data.plan, {
      guardianId: 'guardian-parent-1',
      givenAt: '2026-09-04T10:00:00.000Z',
    });
    expect(given).toMatchObject({
      ok: true,
      data: { disposition: 'given', plan: { lifecycle: 'given' } },
    });
    if (!given.ok) throw new Error(given.error.message);
    expect(
      markFamilyRewardGiven(given.data.plan, {
        guardianId: 'guardian-parent-1',
        givenAt: '2026-09-05T10:00:00.000Z',
      }),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'already_given', plan: given.data.plan },
    });
    expect(
      markFamilyRewardGiven(plan(), {
        guardianId: 'guardian-parent-1',
        givenAt: '2026-09-04T10:00:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('creates a prospective immutable version only while the plan is promised', () => {
    const original = plan();
    const revision = reviseFamilyRewardPlan(original, {
      guardianId: 'guardian-parent-1',
      expectedVersion: 1,
      revisedAt: '2026-09-05T10:00:00.000Z',
      month: '2026-09',
      promise: { kind: 'experience', label },
      milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 20 },
    });
    expect(revision).toMatchObject({
      ok: true,
      data: {
        priorVersion: { version: 1, versionState: 'superseded' },
        revisedPlan: {
          version: 2,
          previousVersion: 1,
          versionState: 'current',
          lifecycle: 'promised',
          promisedAt: '2026-09-05T10:00:00.000Z',
          milestone: { requiredSeedDelta: 20 },
        },
      },
    });
    if (!revision.ok) throw new Error(revision.error.message);
    expect(
      evaluateFamilyRewardPlan(revision.data.revisedPlan, [event()], {
        evaluatedAt: '2026-09-05T10:01:00.000Z',
      }),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'not_reached', progress: { eligibleSeedDelta: 0 } },
    });

    const unlocked = evaluateFamilyRewardPlan(original, [event()], {
      evaluatedAt: '2026-09-03T10:01:00.000Z',
    });
    if (!unlocked.ok) throw new Error(unlocked.error.message);
    expect(
      reviseFamilyRewardPlan(unlocked.data.plan, {
        guardianId: 'guardian-parent-1',
        expectedVersion: 1,
        revisedAt: '2026-09-05T10:00:00.000Z',
        month: '2026-09',
        promise: { kind: 'gift', label },
        milestone: seedMilestone,
      }),
    ).toMatchObject({ ok: false, error: { code: 'IMMUTABLE_UNLOCKED_PLAN' } });
  });

  it('projects a plan only to its matching Child or guardian', () => {
    const privatePlan = plan();
    expect(
      projectFamilyRewardPlan(privatePlan, { kind: 'child', childId: 'child_salem' }),
    ).toMatchObject({ ok: true, data: { childId: 'child_salem', promise: moneyPromise } });
    expect(
      projectFamilyRewardPlan(privatePlan, {
        kind: 'guardian',
        guardianId: 'guardian-parent-1',
      }),
    ).toMatchObject({ ok: true, data: { childId: 'child_salem', promise: moneyPromise } });
    expect(
      projectFamilyRewardPlan(privatePlan, { kind: 'child', childId: 'child_alya' }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_AUTHORIZED' } });
    expect(
      projectFamilyRewardPlan(privatePlan, { kind: 'guardian', guardianId: 'guardian-other' }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_AUTHORIZED' } });
  });

  it('groups active monetary commitments by month and currency without conversion', () => {
    const aed = plan();
    const usd = plan({
      id: 'family-reward-salem-2',
      promise: { ...moneyPromise, currency: 'USD', amountMinor: 1000 },
    });
    const october = plan({
      id: 'family-reward-salem-3',
      month: '2026-10',
      promisedAt: '2026-10-02T10:00:00.000Z',
      promise: { ...moneyPromise, amountMinor: 5000 },
    });
    const givenSource = plan({ id: 'family-reward-salem-given' });
    const unlocked = evaluateFamilyRewardPlan(givenSource, [event()], {
      evaluatedAt: '2026-09-03T10:01:00.000Z',
    });
    if (!unlocked.ok) throw new Error(unlocked.error.message);
    const given = markFamilyRewardGiven(unlocked.data.plan, {
      guardianId: 'guardian-parent-1',
      givenAt: '2026-09-04T10:00:00.000Z',
    });
    if (!given.ok) throw new Error(given.error.message);

    expect(
      summarizeMonthlyMonetaryCommitments([aed, usd, october, given.data.plan], {
        guardianId: 'guardian-parent-1',
      }),
    ).toEqual({
      ok: true,
      data: [
        { month: '2026-09', currency: 'AED', totalAmountMinor: 2500, planCount: 1 },
        { month: '2026-09', currency: 'USD', totalAmountMinor: 1000, planCount: 1 },
        { month: '2026-10', currency: 'AED', totalAmountMinor: 5000, planCount: 1 },
      ],
    });
  });

  it('exports no payment, custody, transfer, wallet, exchange, or withdrawal operation', () => {
    expect(Object.keys(familyRewards).join(' ')).not.toMatch(
      /payment|custody|transfer|wallet|exchange|withdraw/i,
    );
  });
});

describe('Family Reward service authority', () => {
  it('consumes one stored purpose-scoped Parent proof for a monetary promise', () => {
    const registry = createFeature003ServiceRegistry();
    const signedIn = registry.access.signInParent({
      sessionId: 'parent-session-reward',
      parentFixtureId: 'parent_access_al_noor_v1',
      deviceId: 'parent-device-reward',
      now: '2026-09-02T10:00:00.000Z',
    });
    if (!signedIn.ok) throw new Error(signedIn.error.message);
    const monetaryDraft = draft({
      id: 'family-reward-authorized',
      guardianIds: ['parent_al_noor'],
      createdByGuardianId: 'parent_al_noor',
    });

    expect(registry.familyReward.createPlan(monetaryDraft)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });

    const proof = registry.access.issueReauthentication({
      proofId: 'proof-create-reward',
      parentSession: signedIn.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'create_monetary_family_reward',
      now: '2026-09-02T10:01:00.000Z',
    });
    if (!proof.ok) throw new Error(proof.error.message);
    const authorization = {
      proofId: proof.data.id,
      parentSession: signedIn.data,
      purpose: 'create_monetary_family_reward' as const,
      now: '2026-09-02T10:01:01.000Z',
    };

    expect(registry.familyReward.createPlan(monetaryDraft, authorization)).toMatchObject({
      ok: true,
      data: { lifecycle: 'promised', promise: { kind: 'money' } },
    });
    expect(
      registry.familyReward.createPlan(
        { ...monetaryDraft, id: 'family-reward-replayed-proof' },
        authorization,
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });
});
