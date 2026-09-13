import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import type {
  AnonymousSharedGrowthSignal,
  CommunityParticipationPreference,
  ParentSharedGrowthAuthority,
  SharedGrowthState,
} from '../../src/models/sharedGrowth';
import {
  SHARED_GROWTH_QUALITATIVE_FIXTURE,
  applySharedGrowthParticipationAction,
  createSharedGrowthState,
  projectSharedGrowthView,
  recordSharedGrowthSignal,
} from '../../src/features/shared-growth/sharedGrowth';

const HOUSEHOLD_ID = 'household_al_noor' as const;
const PARTICIPATION_EPOCH_ID = 'shared-growth-epoch-001';
const INITIAL_CONSENT_TIME = '2026-09-05T08:00:00.000Z';

function initialConsent() {
  return {
    id: 'shared-growth-consent-001',
    version: 1,
    parentId: 'parent_al_noor' as const,
    householdId: HOUSEHOLD_ID,
    participationEpochId: PARTICIPATION_EPOCH_ID,
    status: 'explicit_parent_consent' as const,
    grantedAt: INITIAL_CONSENT_TIME,
    supersedesEndActionId: null,
    origin: 'synthetic' as const,
    capabilityTruth: 'local_prototype_not_authentication' as const,
  };
}

function freshConsent(endActionId: string) {
  return {
    ...initialConsent(),
    id: 'shared-growth-consent-002',
    version: 2,
    grantedAt: '2026-09-05T08:40:00.000Z',
    supersedesEndActionId: endActionId,
  };
}

function authority(
  proofId: string,
  issuedAt = '2026-09-05T08:00:00.000Z',
  expiresAt = '2026-09-05T09:00:00.000Z',
): ParentSharedGrowthAuthority {
  return {
    role: 'parent',
    parentId: 'parent_al_noor',
    householdId: HOUSEHOLD_ID,
    participationEpochId: PARTICIPATION_EPOCH_ID,
    capability: 'manage_shared_growth_contribution',
    reauthentication: {
      id: proofId,
      purpose: 'change_shared_growth_participation',
      status: 'verified',
      parentId: 'parent_al_noor',
      householdId: HOUSEHOLD_ID,
      participationEpochId: PARTICIPATION_EPOCH_ID,
      issuedAt,
      expiresAt,
      consumed: false,
      origin: 'synthetic',
      capabilityTruth: 'local_prototype_not_authentication',
    },
    origin: 'synthetic',
    capabilityTruth: 'local_prototype_not_authentication',
  };
}

function createInitialState(): SharedGrowthState {
  const result = createSharedGrowthState({
    householdId: HOUSEHOLD_ID,
    participationEpochId: PARTICIPATION_EPOCH_ID,
    initialConsent: initialConsent(),
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function applyAction(
  state: SharedGrowthState,
  actionId: string,
  action: 'continue' | 'pause_new_contributions' | 'end_participation',
  actedAt: string,
  proofId: string,
  consent: ReturnType<typeof freshConsent> | null = null,
) {
  return applySharedGrowthParticipationAction({
    state,
    actionId,
    action,
    actedAt,
    authority: authority(proofId),
    freshConsent: consent,
  });
}

function acceptedSignal(overrides: Partial<AnonymousSharedGrowthSignal> = {}) {
  return {
    id: 'anonymous-signal-001',
    householdId: HOUSEHOLD_ID,
    profileId: 'child_salem' as const,
    profileEpochId: 'profile-epoch-salem-001',
    consentReceiptId: initialConsent().id,
    theme: 'coastal_habitat_care' as const,
    observedAt: '2026-09-05T08:10:00.000Z',
    source: 'prepared_synthetic_signal' as const,
    privacy: 'anonymous_qualitative_only' as const,
    ...overrides,
  };
}

function recordSignal(
  state: SharedGrowthState,
  signal: AnonymousSharedGrowthSignal = acceptedSignal(),
) {
  return recordSharedGrowthSignal({
    state,
    activeProfile: {
      profileId: signal.profileId,
      profileEpochId: signal.profileEpochId,
    },
    signal,
  });
}

function expectFailureCode(result: unknown, code: string): void {
  expect(result).toMatchObject({ ok: false, error: { code } });
}

function recursivelyAssertPrivateProjection(value: unknown): void {
  const forbiddenKeyFragments = [
    'id',
    'name',
    'profile',
    'rank',
    'score',
    'percent',
    'count',
    'task',
    'seed',
    'badge',
    'league',
    'challenge',
    'reward',
    'event',
    'time',
    'media',
    'money',
    'age',
    'participant',
  ];
  const forbiddenValues = [
    'Salem',
    'Alya',
    'Noura',
    'سالم',
    'علياء',
    'نورة',
    'child_salem',
    'child_alya',
    'parent_al_noor',
    'household_al_noor',
    'anonymous-signal-001',
    'shared-growth-consent-001',
    'shared-growth-epoch-001',
    'profile-epoch-salem-001',
    'reauth-pause-001',
  ];

  if (Array.isArray(value)) {
    for (const item of value) recursivelyAssertPrivateProjection(item);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      expect(
        forbiddenKeyFragments.some((fragment) => normalizedKey.includes(fragment)),
        `forbidden projection key: ${key}`,
      ).toBe(false);
      recursivelyAssertPrivateProjection(child);
    }
    return;
  }
  expect(typeof value).not.toBe('number');
  if (typeof value === 'string') {
    for (const forbidden of forbiddenValues) expect(value).not.toContain(forbidden);
    expect(value).not.toMatch(/^\d{4}-\d{2}-\d{2}T/u);
  }
}

describe('R002b Shared Growth privacy projection', () => {
  it('returns the same deeply immutable qualitative synthetic view for the same supplied fixture', () => {
    const state = createInitialState();
    const first = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: state.preference,
    });
    const second = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: state.preference,
    });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      data: {
        availability: 'ready',
        origin: 'synthetic_local',
        privacy: 'anonymous_qualitative',
        viewing: 'available',
        participation: 'continued',
        contributionPrompt: 'none',
      },
    });
    if (!first.ok) throw new Error(first.error.message);
    expect(Object.isFrozen(first.data)).toBe(true);
    expect(Object.isFrozen(first.data.observations)).toBe(true);
    for (const observation of first.data.observations)
      expect(Object.isFrozen(observation)).toBe(true);
  });

  it('contains no identity, numeric metric, timestamp, task, Seed, badge, League, or reward detail recursively', () => {
    const result = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: createInitialState().preference,
    });
    if (!result.ok) throw new Error(result.error.message);

    recursivelyAssertPrivateProjection(result.data);
  });

  it('keeps viewing available and observations unchanged while contribution is paused or ended', () => {
    const initial = createInitialState();
    const initialView = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: initial.preference,
    });
    const paused = applyAction(
      initial,
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);
    const pausedView = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: paused.data.state.preference,
    });
    const ended = applyAction(
      paused.data.state,
      'participation-end-001',
      'end_participation',
      '2026-09-05T08:30:00.000Z',
      'reauth-end-001',
    );
    if (!ended.ok) throw new Error(ended.error.message);
    const endedView = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: ended.data.state.preference,
    });

    expect(initialView).toMatchObject({ ok: true, data: { participation: 'continued' } });
    expect(pausedView).toMatchObject({
      ok: true,
      data: { viewing: 'available', participation: 'paused' },
    });
    expect(endedView).toMatchObject({
      ok: true,
      data: { viewing: 'available', participation: 'ended' },
    });
    if (!initialView.ok || !pausedView.ok || !endedView.ok) throw new Error('view failed');
    expect(pausedView.data.observations).toEqual(initialView.data.observations);
    expect(endedView.data.observations).toEqual(initialView.data.observations);
  });

  it('is independent of accepted contribution history and never derives a public metric', () => {
    const empty = createInitialState();
    const recorded = recordSignal(empty);
    if (!recorded.ok) throw new Error(recorded.error.message);

    const before = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: empty.preference,
    });
    const after = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: recorded.data.state.preference,
    });

    expect(after).toEqual(before);
  });

  it('fails closed for extra, private, or partial aggregate fields without throwing', () => {
    const preference = createInitialState().preference;
    const privateAggregate = {
      ...SHARED_GROWTH_QUALITATIVE_FIXTURE,
      observations: [
        ...SHARED_GROWTH_QUALITATIVE_FIXTURE.observations,
        {
          theme: 'coastal_habitat_care',
          outlook: 'continuing',
          person: { name: 'Salem', profileId: 'child_salem' },
        },
      ],
    };

    expectFailureCode(
      projectSharedGrowthView({ aggregate: privateAggregate, preference } as never),
      'PRIVACY_VIOLATION',
    );
    expectFailureCode(
      projectSharedGrowthView({ aggregate: { availability: 'ready' }, preference } as never),
      'INVALID_INPUT',
    );
    expectFailureCode(projectSharedGrowthView(null as never), 'INVALID_INPUT');
  });
});

describe('R002b Parent participation lifecycle', () => {
  it('creates one strict continued state from explicit synthetic Parent consent', () => {
    const state = createInitialState();

    expect(state.preference).toMatchObject({
      householdId: HOUSEHOLD_ID,
      participationEpochId: PARTICIPATION_EPOCH_ID,
      status: 'continued',
      activeConsentReceiptId: initialConsent().id,
      acceptingSignalsSince: INITIAL_CONSENT_TIME,
      revision: 1,
    });
    expect(state.preference.consentReceipts).toEqual([initialConsent()]);
    expect(state.preference.actionHistory).toEqual([]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.preference)).toBe(true);
    expect(Object.isFrozen(state.preference.consentReceipts)).toBe(true);
  });

  it('rejects malformed initialization and a consent scoped to another household or epoch', () => {
    expectFailureCode(createSharedGrowthState({} as never), 'INVALID_INPUT');
    expectFailureCode(
      createSharedGrowthState({
        householdId: HOUSEHOLD_ID,
        participationEpochId: PARTICIPATION_EPOCH_ID,
        initialConsent: { ...initialConsent(), householdId: 'household_other' },
      } as never),
      'SCOPE_MISMATCH',
    );
    expectFailureCode(
      createSharedGrowthState({
        householdId: HOUSEHOLD_ID,
        participationEpochId: PARTICIPATION_EPOCH_ID,
        initialConsent: { ...initialConsent(), participationEpochId: 'other-epoch' },
      }),
      'EPOCH_SCOPE_MISMATCH',
    );
  });

  it('pauses only future signals and preserves the active consent and immutable history', () => {
    const recorded = recordSignal(createInitialState());
    if (!recorded.ok) throw new Error(recorded.error.message);
    const historyBefore = recorded.data.state.signalHistory;
    const consentBefore = recorded.data.state.preference.consentReceipts;
    const result = applyAction(
      recorded.data.state,
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!result.ok) throw new Error(result.error.message);

    expect(result.data.disposition).toBe('applied');
    expect(result.data.state.preference.status).toBe('paused');
    expect(result.data.state.preference.activeConsentReceiptId).toBe(initialConsent().id);
    expect(result.data.state.preference.acceptingSignalsSince).toBeNull();
    expect(result.data.state.preference.consentReceipts).toEqual(consentBefore);
    expect(result.data.state.signalHistory).toEqual(historyBefore);
  });

  it('continues from Pause by reusing existing consent and opens a new future-only window', () => {
    const paused = applyAction(
      createInitialState(),
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);
    const resumed = applyAction(
      paused.data.state,
      'participation-continue-001',
      'continue',
      '2026-09-05T08:25:00.000Z',
      'reauth-continue-001',
    );
    if (!resumed.ok) throw new Error(resumed.error.message);

    expect(resumed.data.state.preference.status).toBe('continued');
    expect(resumed.data.state.preference.activeConsentReceiptId).toBe(initialConsent().id);
    expect(resumed.data.state.preference.acceptingSignalsSince).toBe('2026-09-05T08:25:00.000Z');
    expect(resumed.data.state.preference.consentReceipts).toEqual([initialConsent()]);
  });

  it('ends prospectively, invalidates consent, and preserves all prior anonymous history', () => {
    const recorded = recordSignal(createInitialState());
    if (!recorded.ok) throw new Error(recorded.error.message);
    const historyBefore = recorded.data.state.signalHistory;
    const result = applyAction(
      recorded.data.state,
      'participation-end-001',
      'end_participation',
      '2026-09-05T08:30:00.000Z',
      'reauth-end-001',
    );
    if (!result.ok) throw new Error(result.error.message);

    expect(result.data.state.preference.status).toBe('ended');
    expect(result.data.state.preference.activeConsentReceiptId).toBeNull();
    expect(result.data.state.preference.acceptingSignalsSince).toBeNull();
    expect(result.data.state.preference.invalidatedConsentReceiptIds).toEqual([
      initialConsent().id,
    ]);
    expect(result.data.state.preference.consentReceipts).toEqual([initialConsent()]);
    expect(result.data.state.signalHistory).toEqual(historyBefore);
  });

  it('requires a fresh explicit versioned consent after End', () => {
    const endActionId = 'participation-end-001';
    const ended = applyAction(
      createInitialState(),
      endActionId,
      'end_participation',
      '2026-09-05T08:30:00.000Z',
      'reauth-end-001',
    );
    if (!ended.ok) throw new Error(ended.error.message);

    expectFailureCode(
      applyAction(
        ended.data.state,
        'participation-continue-002',
        'continue',
        '2026-09-05T08:40:00.000Z',
        'reauth-continue-002',
      ),
      'CONSENT_REQUIRED',
    );
    expectFailureCode(
      applyAction(
        ended.data.state,
        'participation-continue-002',
        'continue',
        '2026-09-05T08:40:00.000Z',
        'reauth-continue-002',
        { ...freshConsent(endActionId), id: initialConsent().id },
      ),
      'CONSENT_CONFLICT',
    );
    expectFailureCode(
      applyAction(
        ended.data.state,
        'participation-continue-002',
        'continue',
        '2026-09-05T08:40:00.000Z',
        'reauth-continue-002',
        {
          ...freshConsent(endActionId),
          grantedAt: '2026-09-05T08:30:00.000Z',
        },
      ),
      'CONSENT_CONFLICT',
    );

    const resumed = applyAction(
      ended.data.state,
      'participation-continue-002',
      'continue',
      '2026-09-05T08:40:00.000Z',
      'reauth-continue-002',
      freshConsent(endActionId),
    );
    if (!resumed.ok) throw new Error(resumed.error.message);
    expect(resumed.data.state.preference.status).toBe('continued');
    expect(resumed.data.state.preference.activeConsentReceiptId).toBe('shared-growth-consent-002');
    expect(resumed.data.state.preference.consentReceipts).toEqual([
      initialConsent(),
      freshConsent(endActionId),
    ]);
  });

  it('makes an exact action retry a no-op and rejects reuse with changed intent', () => {
    const inputState = createInitialState();
    const first = applyAction(
      inputState,
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!first.ok) throw new Error(first.error.message);
    const retry = applyAction(
      first.data.state,
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );

    expect(retry).toMatchObject({ ok: true, data: { disposition: 'already_applied' } });
    if (!retry.ok) throw new Error(retry.error.message);
    expect(retry.data.state).toEqual(first.data.state);
    expect(retry.data.state.preference.actionHistory).toHaveLength(1);
    expectFailureCode(
      applyAction(
        first.data.state,
        'participation-pause-001',
        'end_participation',
        '2026-09-05T08:21:00.000Z',
        'reauth-pause-001',
      ),
      'ACTION_CONFLICT',
    );
  });

  it('rejects reuse of one reauthentication proof for a different action', () => {
    const paused = applyAction(
      createInitialState(),
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-shared-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);

    expectFailureCode(
      applyAction(
        paused.data.state,
        'participation-end-001',
        'end_participation',
        '2026-09-05T08:30:00.000Z',
        'reauth-shared-001',
      ),
      'AUTHORITY_CONFLICT',
    );
  });

  it('fails closed for Child, wrong-Parent, wrong-household, wrong-epoch, or expired authority', () => {
    const state = createInitialState();
    const base = {
      state,
      actionId: 'participation-pause-001',
      action: 'pause_new_contributions' as const,
      actedAt: '2026-09-05T08:20:00.000Z',
      authority: authority('reauth-pause-001'),
      freshConsent: null,
    };

    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: { ...base.authority, role: 'child' },
      } as never),
      'PARENT_AUTHORITY_REQUIRED',
    );
    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: { ...base.authority, parentId: 'parent_other' },
      } as never),
      'PARENT_AUTHORITY_REQUIRED',
    );
    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: { ...base.authority, householdId: 'household_other' },
      } as never),
      'SCOPE_MISMATCH',
    );
    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: { ...base.authority, participationEpochId: 'other-epoch' },
      }),
      'EPOCH_SCOPE_MISMATCH',
    );
    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: authority(
          'reauth-expired-001',
          '2026-09-05T07:00:00.000Z',
          '2026-09-05T08:00:00.000Z',
        ),
      }),
      'REAUTHENTICATION_REQUIRED',
    );
    expectFailureCode(
      applySharedGrowthParticipationAction({
        ...base,
        authority: {
          ...base.authority,
          reauthentication: { ...base.authority.reauthentication, consumed: true },
        },
      } as never),
      'REAUTHENTICATION_REQUIRED',
    );
  });

  it('rejects corrupt or partial rehydrated state without throwing', () => {
    const state = createInitialState();
    const input = {
      state: { ...state, preference: { status: 'continued' } },
      actionId: 'participation-pause-001',
      action: 'pause_new_contributions',
      actedAt: '2026-09-05T08:20:00.000Z',
      authority: authority('reauth-pause-001'),
      freshConsent: null,
    };

    expectFailureCode(applySharedGrowthParticipationAction(input as never), 'INVALID_STATE');
    expectFailureCode(applySharedGrowthParticipationAction(null as never), 'INVALID_INPUT');
  });

  it('rejects rehydrated history that cannot reconstruct the current consent lifecycle', () => {
    const initial = createInitialState();
    const pausedWithoutAction = {
      ...initial,
      preference: {
        ...initial.preference,
        status: 'paused',
        acceptingSignalsSince: null,
      },
    };
    expectFailureCode(
      applySharedGrowthParticipationAction({
        state: pausedWithoutAction,
        actionId: 'participation-continue-corrupt',
        action: 'continue',
        actedAt: '2026-09-05T08:25:00.000Z',
        authority: authority('reauth-corrupt-001'),
        freshConsent: null,
      } as never),
      'INVALID_STATE',
    );

    const paused = applyAction(
      initial,
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);
    const corruptTransition = {
      ...paused.data.state,
      preference: {
        ...paused.data.state.preference,
        actionHistory: [
          {
            ...paused.data.state.preference.actionHistory[0],
            fromStatus: 'ended',
          },
        ],
      },
    };
    expectFailureCode(
      applySharedGrowthParticipationAction({
        state: corruptTransition,
        actionId: 'participation-continue-corrupt-2',
        action: 'continue',
        actedAt: '2026-09-05T08:25:00.000Z',
        authority: authority('reauth-corrupt-002'),
        freshConsent: null,
      } as never),
      'INVALID_STATE',
    );
  });

  it('rejects a first participation action dated before the initial consent', () => {
    expectFailureCode(
      applySharedGrowthParticipationAction({
        state: createInitialState(),
        actionId: 'participation-pause-before-consent',
        action: 'pause_new_contributions',
        actedAt: '2026-09-05T07:55:00.000Z',
        authority: authority(
          'reauth-before-consent',
          '2026-09-05T07:50:00.000Z',
          '2026-09-05T08:30:00.000Z',
        ),
        freshConsent: null,
      }),
      'INVALID_TRANSITION',
    );
  });
});

describe('R002b anonymous future-signal boundary', () => {
  it('records one supplied synthetic anonymous qualitative signal exactly once', () => {
    const first = recordSignal(createInitialState());
    if (!first.ok) throw new Error(first.error.message);

    expect(first.data.disposition).toBe('recorded');
    expect(first.data.state.signalHistory).toEqual([acceptedSignal()]);
    const retry = recordSignal(first.data.state);
    expect(retry).toMatchObject({ ok: true, data: { disposition: 'already_recorded' } });
    if (!retry.ok) throw new Error(retry.error.message);
    expect(retry.data.state).toEqual(first.data.state);
    expect(retry.data.state.signalHistory).toHaveLength(1);
  });

  it('rejects a reused signal identity with conflicting evidence', () => {
    const first = recordSignal(createInitialState());
    if (!first.ok) throw new Error(first.error.message);

    expectFailureCode(
      recordSignal(first.data.state, acceptedSignal({ theme: 'water_stewardship' })),
      'SIGNAL_CONFLICT',
    );
  });

  it('does not record while paused or ended and cannot backfill a signal from before resume', () => {
    const paused = applyAction(
      createInitialState(),
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);
    const whilePaused = recordSignal(
      paused.data.state,
      acceptedSignal({ observedAt: '2026-09-05T08:22:00.000Z' }),
    );
    expect(whilePaused).toMatchObject({
      ok: true,
      data: { disposition: 'not_recorded', reason: 'participation_paused' },
    });
    if (!whilePaused.ok) throw new Error(whilePaused.error.message);
    expect(whilePaused.data.state.signalHistory).toEqual([]);

    const ended = applyAction(
      paused.data.state,
      'participation-end-001',
      'end_participation',
      '2026-09-05T08:30:00.000Z',
      'reauth-end-001',
    );
    if (!ended.ok) throw new Error(ended.error.message);
    const whileEnded = recordSignal(
      ended.data.state,
      acceptedSignal({ consentReceiptId: null, observedAt: '2026-09-05T08:32:00.000Z' }),
    );
    expect(whileEnded).toMatchObject({
      ok: true,
      data: { disposition: 'not_recorded', reason: 'participation_ended' },
    });

    const resumed = applyAction(
      ended.data.state,
      'participation-continue-002',
      'continue',
      '2026-09-05T08:40:00.000Z',
      'reauth-continue-002',
      freshConsent('participation-end-001'),
    );
    if (!resumed.ok) throw new Error(resumed.error.message);
    expect(
      recordSignal(
        resumed.data.state,
        acceptedSignal({
          consentReceiptId: freshConsent('participation-end-001').id,
          observedAt: '2026-09-05T08:35:00.000Z',
        }),
      ),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'not_recorded', reason: 'outside_active_contribution_window' },
    });
  });

  it('accepts only the active profile and epoch and never applies Salem scope to Alya', () => {
    const state = createInitialState();
    const salemSignal = acceptedSignal();

    expectFailureCode(
      recordSharedGrowthSignal({
        state,
        activeProfile: { profileId: 'child_alya', profileEpochId: 'profile-epoch-alya-001' },
        signal: salemSignal,
      }),
      'PROFILE_SCOPE_MISMATCH',
    );
    expectFailureCode(
      recordSharedGrowthSignal({
        state,
        activeProfile: { profileId: 'child_salem', profileEpochId: 'profile-epoch-salem-002' },
        signal: salemSignal,
      }),
      'EPOCH_SCOPE_MISMATCH',
    );
  });

  it('rejects task, numeric metric, remote, malformed, and wrong-consent signal input', () => {
    const state = createInitialState();
    expectFailureCode(
      recordSharedGrowthSignal({
        state,
        activeProfile: { profileId: 'child_salem', profileEpochId: 'profile-epoch-salem-001' },
        signal: { ...acceptedSignal(), taskId: 'task_recycling_p0_v1' },
      } as never),
      'PRIVACY_VIOLATION',
    );
    expectFailureCode(
      recordSharedGrowthSignal({
        state,
        activeProfile: { profileId: 'child_salem', profileEpochId: 'profile-epoch-salem-001' },
        signal: { ...acceptedSignal(), participantCount: 12 },
      } as never),
      'PRIVACY_VIOLATION',
    );
    expectFailureCode(
      recordSignal(
        state,
        acceptedSignal({ source: 'remote' as AnonymousSharedGrowthSignal['source'] }),
      ),
      'INVALID_INPUT',
    );
    expectFailureCode(
      recordSignal(state, acceptedSignal({ consentReceiptId: 'wrong-consent' })),
      'CONSENT_CONFLICT',
    );
    expectFailureCode(recordSharedGrowthSignal({ state } as never), 'INVALID_INPUT');
  });

  it('preserves Shared Growth history and every private authority snapshot byte-for-byte', () => {
    const privateAuthorities = Object.freeze({
      task: Object.freeze({ status: 'submitted', taskId: 'task_recycling_p0_v1' }),
      seedLedger: Object.freeze([{ amount: 108 }]),
      badges: Object.freeze(['badge.journey.expanding_shade.v1']),
      garden: Object.freeze({ mangrove: '60/60' }),
      canopy: Object.freeze({ leaves: 20 }),
      privateLeague: Object.freeze({ leaves: 4 }),
      challenge: Object.freeze({ leaves: 4 }),
      familyReward: Object.freeze({ status: 'unlocked' }),
      learning: Object.freeze({ completion: null }),
      reveal: Object.freeze({ lifecycle: 'archived' }),
    });
    const before = JSON.stringify(privateAuthorities);
    const recorded = recordSignal(createInitialState());
    if (!recorded.ok) throw new Error(recorded.error.message);
    const ended = applyAction(
      recorded.data.state,
      'participation-end-001',
      'end_participation',
      '2026-09-05T08:30:00.000Z',
      'reauth-end-001',
    );
    if (!ended.ok) throw new Error(ended.error.message);

    expect(JSON.stringify(privateAuthorities)).toBe(before);
    expect(privateAuthorities).toEqual(JSON.parse(before));
    expect(ended.data.state.signalHistory).toEqual(recorded.data.state.signalHistory);
    expect(JSON.stringify(ended.data.state.signalHistory)).toBe(
      JSON.stringify(recorded.data.state.signalHistory),
    );
  });

  it('uses no clock, randomness, network, persistent storage, or private feature imports', () => {
    const source = readFileSync(
      new URL('../../src/features/shared-growth/sharedGrowth.ts', import.meta.url),
      'utf8',
    );

    expect(source).not.toMatch(/Date\.now|new Date|Math\.random|fetch\s*\(|XMLHttpRequest/u);
    expect(source).not.toMatch(/AsyncStorage|localStorage|sessionStorage/u);
    expect(source).not.toMatch(/familyLeague|familyReward|revealBundle|achievements|learning/u);
  });

  it('returns deeply immutable state and never mutates caller-owned input', () => {
    const inputState = createInitialState();
    const before = JSON.stringify(inputState);
    const result = recordSignal(inputState);
    if (!result.ok) throw new Error(result.error.message);

    expect(JSON.stringify(inputState)).toBe(before);
    expect(inputState.signalHistory).toEqual([]);
    expect(Object.isFrozen(result.data.state)).toBe(true);
    expect(Object.isFrozen(result.data.state.signalHistory)).toBe(true);
    expect(Object.isFrozen(result.data.state.signalHistory[0])).toBe(true);
  });

  it('rejects rehydrated signals that fall inside a paused contribution window', () => {
    const paused = applyAction(
      createInitialState(),
      'participation-pause-001',
      'pause_new_contributions',
      '2026-09-05T08:20:00.000Z',
      'reauth-pause-001',
    );
    if (!paused.ok) throw new Error(paused.error.message);
    const resumed = applyAction(
      paused.data.state,
      'participation-continue-001',
      'continue',
      '2026-09-05T08:30:00.000Z',
      'reauth-continue-001',
    );
    if (!resumed.ok) throw new Error(resumed.error.message);
    const corrupt = {
      ...resumed.data.state,
      signalHistory: [acceptedSignal({ observedAt: '2026-09-05T08:25:00.000Z' })],
    };

    expectFailureCode(
      recordSharedGrowthSignal({
        state: corrupt,
        activeProfile: {
          profileId: 'child_salem',
          profileEpochId: 'profile-epoch-salem-001',
        },
        signal: acceptedSignal({ id: 'anonymous-signal-after-recovery' }),
      }),
      'INVALID_STATE',
    );
  });
});

describe('R002b CommunityParticipationPreference shape', () => {
  it('contains only shared-growth authority and no private progress fields', () => {
    const preference: CommunityParticipationPreference = createInitialState().preference;
    const serialized = JSON.stringify(preference);

    for (const forbidden of [
      'task',
      'seed',
      'badge',
      'garden',
      'canopy',
      'league',
      'challenge',
      'familyReward',
      'learning',
      'reveal',
    ]) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
