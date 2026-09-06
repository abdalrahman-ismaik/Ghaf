import { describe, expect, it } from 'vitest';

import {
  IMPACT_PATH_STATIONS,
  SCHEMA3_R002A_FIXTURE_VERSION,
  SEED_LEDGER_MIGRATION_VERSION,
  type Schema3SeedAudit,
  type Schema3SeedAuditInput,
  type SeedLedgerState,
} from '../src/models/growthJourney';
import {
  auditSchema3SeedState,
  createEmptySeedLedger,
  normalizeSchema3SeedLedger,
  projectRecognitionSeedEntry,
  projectWaterAndCoastPath,
  selectLifetimeSeeds,
} from '../src/features/growth/seedLedger';
import { createResetSourceSession } from '../src/services/mock/fixtures';

const EPOCH_ONE = 'reset-epoch-001';
const EPOCH_TWO = 'reset-epoch-002';
const APPLIED_AT = '2026-09-05T08:00:00.000Z';
const RECOGNIZED_AT = '2026-09-05T08:05:00.000Z';

const SALEM_AUDIT_INPUT: Schema3SeedAuditInput = {
  schemaVersion: 3,
  fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
  persistence: 'synthetic_in_memory',
  profileId: 'child_salem',
  activeProfileId: 'child_salem',
  profileEpochId: EPOCH_ONE,
  activeResetEpochId: EPOCH_ONE,
  profileOrigin: 'synthetic',
  openingEarnedSeeds: 48,
  recognitionLedgerEntryCount: 0,
  mangroveProgress: {
    landscapeId: 'mangrove',
    cumulativeSeeds: 48,
    stage: 'shoot',
    nextThreshold: 60,
  },
};

const ALYA_AUDIT_INPUT: Schema3SeedAuditInput = {
  schemaVersion: 3,
  fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
  persistence: 'synthetic_in_memory',
  profileId: 'child_alya',
  activeProfileId: 'child_alya',
  profileEpochId: EPOCH_ONE,
  activeResetEpochId: EPOCH_ONE,
  profileOrigin: 'synthetic',
  openingEarnedSeeds: 36,
  recognitionLedgerEntryCount: 0,
  mangroveProgress: null,
};

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

function audited(input: Schema3SeedAuditInput): Schema3SeedAudit {
  const result = auditSchema3SeedState(input);
  expectOk(result);
  return result.data;
}

function emptyLedger(profileId: 'child_salem' | 'child_alya', epoch = EPOCH_ONE): SeedLedgerState {
  const result = createEmptySeedLedger({ profileId, profileEpochId: epoch });
  expectOk(result);
  return result.data;
}

function normalizedSalem(): SeedLedgerState {
  const result = normalizeSchema3SeedLedger({
    audit: audited(SALEM_AUDIT_INPUT),
    ledger: emptyLedger('child_salem'),
    appliedAt: APPLIED_AT,
  });
  expectOk(result);
  return result.data.ledger;
}

function normalizedAlya(): SeedLedgerState {
  const result = normalizeSchema3SeedLedger({
    audit: audited(ALYA_AUDIT_INPUT),
    ledger: emptyLedger('child_alya'),
    appliedAt: APPLIED_AT,
  });
  expectOk(result);
  return result.data.ledger;
}

const SALEM_RECOGNITION = {
  profileId: 'child_salem',
  profileEpochId: EPOCH_ONE,
  triggerEventId: 'recognition:submission_recycling_p0_v1_attempt_1',
  recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
  seedTransactionId: 'seed_transaction_recycling_p0_v1_attempt_1',
  amount: 12,
  committedAt: RECOGNIZED_AT,
  fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
  landscapeTransition: {
    landscapeId: 'mangrove',
    seedsBefore: 48,
    seedsAfter: 60,
    stageBefore: 'shoot',
    stageAfter: 'sapling',
    crossedThreshold: 60,
    symbolicOnly: true,
  },
} as const;

describe('R002b Schema-3 Seed authority audit', () => {
  it('records what the reset 48 proves and what it does not prove', () => {
    const first = audited(SALEM_AUDIT_INPUT);
    const second = audited(structuredClone(SALEM_AUDIT_INPUT));

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      schemaVersion: 3,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      profileId: 'child_salem',
      profileEpochId: EPOCH_ONE,
      syntheticOnly: true,
      openingSeeds: 48,
      currentMangroveSeeds: 48,
      recognitionLedgerEntryCount: 0,
      historicalStage60: 'not_recorded',
      ledgerReconciliation: 'opening_balance_missing',
      approvedCarryForwardSeeds: 60,
      eligibility: 'salem_opening_and_carry_forward',
    });
    expect(first.sourceFingerprint).toMatch(/^schema3-seeds:[0-9a-f]{8}$/u);
  });

  it.each([
    ['real data', { persistence: 'durable_or_real' }, 'NON_SYNTHETIC_SOURCE'],
    ['ambiguous data', { persistence: 'ambiguous' }, 'AMBIGUOUS_SOURCE'],
    ['wrong active profile', { activeProfileId: 'child_alya' }, 'PROFILE_SCOPE_MISMATCH'],
    ['wrong reset epoch', { activeResetEpochId: EPOCH_TWO }, 'EPOCH_SCOPE_MISMATCH'],
    ['non-empty historical ledger', { recognitionLedgerEntryCount: 1 }, 'AMBIGUOUS_SOURCE'],
    ['changed opening scalar', { openingEarnedSeeds: 47 }, 'FIXTURE_EVIDENCE_MISMATCH'],
  ] as const)('fails closed for %s', (_label, override, code) => {
    expect(auditSchema3SeedState({ ...SALEM_AUDIT_INPUT, ...override })).toMatchObject({
      ok: false,
      error: { code },
    });
  });

  it('rejects unsupported and partial profiles without creating evidence', () => {
    expect(
      auditSchema3SeedState({
        ...SALEM_AUDIT_INPUT,
        profileId: 'cousin_noura',
        activeProfileId: 'cousin_noura',
      }),
    ).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_PROFILE' } });

    expect(auditSchema3SeedState({ schemaVersion: 3 } as Schema3SeedAuditInput)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });
});

describe('R002b lifetime Seed normalization', () => {
  it.each(['2026-02-30T08:00:00.000Z', '2026-09-05T08:00:00Z', '2026-09-05T12:00:00.000+04:00'])(
    'rejects the non-canonical or impossible migration time %s',
    (appliedAt) => {
      expect(
        normalizeSchema3SeedLedger({
          audit: audited(SALEM_AUDIT_INPUT),
          ledger: emptyLedger('child_salem'),
          appliedAt,
        }),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    },
  );

  it('creates one Salem-only versioned receipt for explicit 48 + synthetic carry-forward 60', () => {
    const base = emptyLedger('child_salem');
    const result = normalizeSchema3SeedLedger({
      audit: audited(SALEM_AUDIT_INPUT),
      ledger: base,
      appliedAt: APPLIED_AT,
    });
    expectOk(result);

    expect(base).toEqual({
      profileId: 'child_salem',
      profileEpochId: EPOCH_ONE,
      entries: [],
      migrationReceipts: [],
      plantStageArchives: [],
    });
    expect(result.data.disposition).toBe('applied');
    expect(result.data.receipt).toMatchObject({
      migrationVersion: SEED_LEDGER_MIGRATION_VERSION,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      profileId: 'child_salem',
      profileEpochId: EPOCH_ONE,
      status: 'applied',
      syntheticOnly: true,
      silentBackfill: true,
      appliedAt: APPLIED_AT,
    });
    expect(result.data.ledger.entries).toMatchObject([
      {
        profileId: 'child_salem',
        profileEpochId: EPOCH_ONE,
        kind: 'opening_balance',
        amount: 48,
        status: 'committed',
        committedAt: null,
        silentBackfill: true,
        provenance: { source: 'schema3_profile_scalar' },
      },
      {
        profileId: 'child_salem',
        profileEpochId: EPOCH_ONE,
        kind: 'legacy_carry_forward',
        amount: 60,
        status: 'committed',
        committedAt: null,
        silentBackfill: true,
        provenance: { source: 'approved_synthetic_stage_assumption' },
      },
    ]);
    expect(selectLifetimeSeeds(result.data.ledger, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 108,
    });
    expect(JSON.stringify(result.data)).not.toMatch(
      /taskHistory|mastery|learningCompletion|celebration|league|challenge|familyReward/iu,
    );
  });

  it('normalizes Alya only from her own 36-Seed opening evidence', () => {
    const result = normalizeSchema3SeedLedger({
      audit: audited(ALYA_AUDIT_INPUT),
      ledger: emptyLedger('child_alya'),
      appliedAt: APPLIED_AT,
    });
    expectOk(result);

    expect(result.data).toMatchObject({ disposition: 'applied', receipt: null });
    expect(result.data.ledger.entries).toHaveLength(1);
    expect(result.data.ledger.entries[0]).toMatchObject({
      profileId: 'child_alya',
      kind: 'opening_balance',
      amount: 36,
      provenance: { source: 'schema3_profile_scalar' },
    });
    expect(selectLifetimeSeeds(result.data.ledger, 'child_alya', EPOCH_ONE)).toEqual({
      ok: true,
      data: 36,
    });
    expect(result.data.ledger.entries.some((entry) => entry.amount === 60)).toBe(false);
  });

  it('is immutable and idempotent for repeated and concurrent normalization calls', () => {
    const base = emptyLedger('child_salem');
    const input = {
      audit: audited(SALEM_AUDIT_INPUT),
      ledger: base,
      appliedAt: APPLIED_AT,
    } as const;
    const concurrentA = normalizeSchema3SeedLedger(input);
    const concurrentB = normalizeSchema3SeedLedger(input);
    expectOk(concurrentA);
    expectOk(concurrentB);
    expect(concurrentA.data).toEqual(concurrentB.data);
    expect(base.entries).toEqual([]);

    const repeated = normalizeSchema3SeedLedger({
      ...input,
      ledger: concurrentA.data.ledger,
    });
    expectOk(repeated);
    expect(repeated.data.disposition).toBe('already_applied');
    expect(repeated.data.ledger).toBe(concurrentA.data.ledger);
    expect(repeated.data.ledger.entries).toHaveLength(2);
  });

  it('rejects changed provenance and malformed input atomically', () => {
    const ledger = normalizedSalem();
    const conflictingAudit = {
      ...audited(SALEM_AUDIT_INPUT),
      sourceFingerprint: 'schema3-seeds:deadbeef',
    } as Schema3SeedAudit;

    const conflict = normalizeSchema3SeedLedger({
      audit: conflictingAudit,
      ledger,
      appliedAt: APPLIED_AT,
    });
    expect(conflict).toMatchObject({ ok: false, error: { code: 'FINGERPRINT_CONFLICT' } });
    expect(ledger.entries).toHaveLength(2);
    expect(ledger.migrationReceipts).toHaveLength(1);

    const partial = normalizeSchema3SeedLedger({
      audit: audited(SALEM_AUDIT_INPUT),
      ledger: { ...ledger, entries: undefined } as unknown as SeedLedgerState,
      appliedAt: APPLIED_AT,
    });
    expect(partial).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(ledger.entries).toHaveLength(2);
  });

  it.each([
    ['historical stage claim', { historicalStage60: 'verified' }],
    ['ledger reconciliation claim', { ledgerReconciliation: 'reconciled' }],
  ] as const)(
    'rejects a forged audit %s even when its fingerprint fields are unchanged',
    (_label, override) => {
      const forgedAudit = {
        ...audited(SALEM_AUDIT_INPUT),
        ...override,
      } as unknown as Schema3SeedAudit;
      const base = emptyLedger('child_salem');

      expect(
        normalizeSchema3SeedLedger({ audit: forgedAudit, ledger: base, appliedAt: APPLIED_AT }),
      ).toMatchObject({ ok: false, error: { code: 'FIXTURE_EVIDENCE_MISMATCH' } });
      expect(base.entries).toEqual([]);
    },
  );

  it('rejects cross-profile and reset-epoch reads instead of mixing ledgers', () => {
    const ledger = normalizedSalem();
    expect(selectLifetimeSeeds(ledger, 'child_alya', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'PROFILE_SCOPE_MISMATCH' },
    });
    expect(selectLifetimeSeeds(ledger, 'child_salem', EPOCH_TWO)).toMatchObject({
      ok: false,
      error: { code: 'EPOCH_SCOPE_MISMATCH' },
    });
    expect(
      normalizeSchema3SeedLedger({
        audit: audited(ALYA_AUDIT_INPUT),
        ledger,
        appliedAt: APPLIED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
  });

  it('counts an exact stable entry ID once and rejects conflicting or non-committed evidence', () => {
    const ledger = normalizedSalem();
    const firstEntry = ledger.entries[0];
    expect(firstEntry).toBeDefined();
    const exactRetry = {
      ...ledger,
      entries: [...ledger.entries, structuredClone(firstEntry)],
    } as SeedLedgerState;
    expect(selectLifetimeSeeds(exactRetry, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 108,
    });

    const conflictingRetry = {
      ...ledger,
      entries: [...ledger.entries, { ...structuredClone(firstEntry), amount: 49 }],
    } as SeedLedgerState;
    expect(selectLifetimeSeeds(conflictingRetry, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'EVENT_CONFLICT' },
    });

    const pendingEntry = {
      ...ledger,
      entries: [{ ...structuredClone(firstEntry), status: 'pending' }, ...ledger.entries.slice(1)],
    } as unknown as SeedLedgerState;
    expect(selectLifetimeSeeds(pendingEntry, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });

    const relabeledEvidence = {
      ...ledger,
      entries: ledger.entries.map((entry, index) =>
        index === 1 ? { ...entry, kind: 'task_recognition' as const } : entry,
      ),
    } as SeedLedgerState;
    expect(selectLifetimeSeeds(relabeledEvidence, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('requires the exact Salem baseline graph and never counts a carry-forward without its receipt', () => {
    const ledger = normalizedSalem();
    expect(ledger.entries.map((entry) => [entry.id, entry.triggerEventId])).toEqual([
      ['seed:opening:child_salem:reset-epoch-001', 'schema3-opening:child_salem:reset-epoch-001'],
      [
        'seed:carry-forward:child_salem:reset-epoch-001',
        'approved-stage-assumption:child_salem:reset-epoch-001:60',
      ],
    ]);
    expect(ledger.migrationReceipts[0]).toMatchObject({
      id: 'migration:r002b.seed-ledger.v1:child_salem:reset-epoch-001',
      entryIds: [
        'seed:opening:child_salem:reset-epoch-001',
        'seed:carry-forward:child_salem:reset-epoch-001',
      ],
    });

    const carryWithoutReceipt = {
      ...ledger,
      migrationReceipts: [],
    } as SeedLedgerState;
    expect(selectLifetimeSeeds(carryWithoutReceipt, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'EVENT_CONFLICT' },
    });
  });

  it.each([
    [
      'orphan receipt',
      (ledger: SeedLedgerState) => ({ ...ledger, entries: ledger.entries.slice(0, 1) }),
    ],
    [
      'arbitrary receipt ID',
      (ledger: SeedLedgerState) => ({
        ...ledger,
        migrationReceipts: ledger.migrationReceipts.map((receipt) => ({
          ...receipt,
          id: 'migration:arbitrary',
        })),
      }),
    ],
    [
      'arbitrary receipt entry IDs',
      (ledger: SeedLedgerState) => ({
        ...ledger,
        migrationReceipts: ledger.migrationReceipts.map((receipt) => ({
          ...receipt,
          entryIds: ['seed:forged:one', 'seed:forged:two'] as const,
        })),
      }),
    ],
    [
      'arbitrary receipt fingerprint',
      (ledger: SeedLedgerState) => ({
        ...ledger,
        migrationReceipts: ledger.migrationReceipts.map((receipt) => ({
          ...receipt,
          sourceFingerprint: 'schema3-seeds:deadbeef',
        })),
      }),
    ],
  ] as const)('rejects an %s', (_label, forge) => {
    const forged = forge(normalizedSalem()) as SeedLedgerState;
    expect(selectLifetimeSeeds(forged, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'EVENT_CONFLICT' },
    });
  });

  it('rejects a forged opening amount even when the entry remains positive and committed', () => {
    const ledger = normalizedSalem();
    const forged = {
      ...ledger,
      entries: ledger.entries.map((entry) =>
        entry.kind === 'opening_balance' ? { ...entry, amount: 49 } : entry,
      ),
    } as SeedLedgerState;
    expect(selectLifetimeSeeds(forged, 'child_salem', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'FIXTURE_EVIDENCE_MISMATCH' },
    });
  });

  it('returns frozen snapshots without freezing or changing the caller input', () => {
    const base = {
      profileId: 'child_salem',
      profileEpochId: EPOCH_ONE,
      entries: [],
      migrationReceipts: [],
      plantStageArchives: [],
    } satisfies SeedLedgerState;
    expect(Object.isFrozen(base)).toBe(false);

    const result = normalizeSchema3SeedLedger({
      audit: audited(SALEM_AUDIT_INPUT),
      ledger: base,
      appliedAt: APPLIED_AT,
    });
    expectOk(result);
    expect(Object.isFrozen(base)).toBe(false);
    expect(Object.isFrozen(result.data.ledger)).toBe(true);
    expect(Object.isFrozen(result.data.ledger.entries)).toBe(true);
    expect(Object.isFrozen(result.data.ledger.entries[0]?.provenance.sourceIds)).toBe(true);
  });

  it('does not trust a shallow-frozen caller ledger as a deeply immutable snapshot', () => {
    const normalized = normalizedSalem();
    const shallowLedger = Object.freeze({
      ...normalized,
      entries: Object.freeze(
        normalized.entries.map((entry) => ({
          ...entry,
          provenance: { ...entry.provenance, sourceIds: [...entry.provenance.sourceIds] },
        })),
      ),
      migrationReceipts: Object.freeze(
        normalized.migrationReceipts.map((receipt) => ({
          ...receipt,
          entryIds: [...receipt.entryIds] as [string, string],
        })),
      ),
      plantStageArchives: Object.freeze(
        normalized.plantStageArchives.map((archive) => ({ ...archive })),
      ),
    }) as SeedLedgerState;
    expect(Object.isFrozen(shallowLedger.entries[0]?.provenance)).toBe(false);

    const repeated = normalizeSchema3SeedLedger({
      audit: audited(SALEM_AUDIT_INPUT),
      ledger: shallowLedger,
      appliedAt: APPLIED_AT,
    });
    expectOk(repeated);
    expect(repeated.data.ledger).not.toBe(shallowLedger);
    expect(Object.isFrozen(repeated.data.ledger.entries[0])).toBe(true);
    expect(Object.isFrozen(repeated.data.ledger.entries[0]?.provenance)).toBe(true);
    expect(Object.isFrozen(repeated.data.ledger.entries[0]?.provenance.sourceIds)).toBe(true);
    expect(Object.isFrozen(repeated.data.ledger.migrationReceipts[0]?.entryIds)).toBe(true);
  });
});

describe('R002b recognition and Impact Path projection', () => {
  it('binds the projection to the exact authoritative Schema-3 recognition receipt IDs', () => {
    const recognized = createResetSourceSession('recognized');
    const receipt = recognized.recognitionLedger[SALEM_RECOGNITION.recognitionKey];
    expect(receipt).toBeDefined();
    expect(SALEM_RECOGNITION).toMatchObject({
      triggerEventId: receipt?.recognitionKey,
      recognitionKey: receipt?.recognitionKey,
      seedTransactionId: receipt?.seedTransaction?.id,
    });
  });

  it.each(['2026-02-30T08:05:00.000Z', '2026-09-05T08:05:00Z'])(
    'rejects the non-canonical or impossible recognition time %s',
    (committedAt) => {
      expect(
        projectRecognitionSeedEntry({
          ledger: normalizedSalem(),
          ...SALEM_RECOGNITION,
          committedAt,
        }),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    },
  );

  it('projects the canonical +12 once, independently archives Mangrove 60/60, and reaches 120', () => {
    const before = normalizedSalem();
    const result = projectRecognitionSeedEntry({ ledger: before, ...SALEM_RECOGNITION });
    expectOk(result);

    expect(selectLifetimeSeeds(before, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 108,
    });
    expect(selectLifetimeSeeds(result.data.ledger, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 120,
    });
    expect(result.data).toMatchObject({
      disposition: 'projected',
      entry: {
        kind: 'task_recognition',
        amount: 12,
        triggerEventId: SALEM_RECOGNITION.triggerEventId,
        status: 'committed',
        silentBackfill: false,
        provenance: { source: 'recognition_receipt' },
      },
      archive: {
        profileId: 'child_salem',
        profileEpochId: EPOCH_ONE,
        landscapeId: 'mangrove',
        threshold: 60,
        triggerEventId: SALEM_RECOGNITION.triggerEventId,
        symbolicOnly: true,
      },
    });
    expect(result.data.ledger.plantStageArchives).toHaveLength(1);
  });

  it('archives a Samar seed-to-shoot crossing from 16 to 24 and leaves later growth archive-free', () => {
    const crossing = projectRecognitionSeedEntry({
      ledger: normalizedAlya(),
      profileId: 'child_alya',
      profileEpochId: EPOCH_ONE,
      triggerEventId: 'recognition:submission_samar_threshold_attempt_1',
      recognitionKey: 'recognition:submission_samar_threshold_attempt_1',
      seedTransactionId: 'seed_transaction_samar_threshold_attempt_1',
      amount: 8,
      committedAt: RECOGNIZED_AT,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      landscapeTransition: {
        landscapeId: 'samar',
        seedsBefore: 16,
        seedsAfter: 24,
        stageBefore: 'seed',
        stageAfter: 'shoot',
        crossedThreshold: 20,
        symbolicOnly: true,
      },
    });
    expectOk(crossing);
    expect(crossing.data.archive).toMatchObject({
      id: `archive:samar:20:child_alya:${EPOCH_ONE}:recognition%3Asubmission_samar_threshold_attempt_1`,
      profileId: 'child_alya',
      landscapeId: 'samar',
      threshold: 20,
      seedsBefore: 16,
      seedsAfter: 24,
      stageBefore: 'seed',
      stageAfter: 'shoot',
    });

    const nonCrossing = projectRecognitionSeedEntry({
      ledger: crossing.data.ledger,
      profileId: 'child_alya',
      profileEpochId: EPOCH_ONE,
      triggerEventId: 'recognition:submission_samar_followup_attempt_1',
      recognitionKey: 'recognition:submission_samar_followup_attempt_1',
      seedTransactionId: 'seed_transaction_samar_followup_attempt_1',
      amount: 12,
      committedAt: '2026-09-05T08:10:00.000Z',
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      landscapeTransition: {
        landscapeId: 'samar',
        seedsBefore: 24,
        seedsAfter: 36,
        stageBefore: 'shoot',
        stageAfter: 'shoot',
        crossedThreshold: null,
        symbolicOnly: true,
      },
    });
    expectOk(nonCrossing);
    expect(nonCrossing.data.archive).toBeNull();
    expect(nonCrossing.data.ledger.plantStageArchives).toHaveLength(1);
  });

  it.each([
    ['wrong stage', { stageAfter: 'sapling' }],
    ['missing crossing', { crossedThreshold: null }],
    ['wrong balance', { seedsAfter: 25 }],
  ] as const)('rejects a Samar transition with %s', (_label, change) => {
    const transition = {
      landscapeId: 'samar',
      seedsBefore: 16,
      seedsAfter: 24,
      stageBefore: 'seed',
      stageAfter: 'shoot',
      crossedThreshold: 20,
      symbolicOnly: true,
      ...change,
    } as const;

    expect(
      projectRecognitionSeedEntry({
        ledger: normalizedAlya(),
        profileId: 'child_alya',
        profileEpochId: EPOCH_ONE,
        triggerEventId: 'recognition:invalid-samar-transition',
        recognitionKey: 'recognition:invalid-samar-transition',
        seedTransactionId: 'seed_transaction_invalid_samar_transition',
        amount: 8,
        committedAt: RECOGNIZED_AT,
        fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
        landscapeTransition: transition,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('rejects recognition projection until the profile baseline is normalized', () => {
    const empty = emptyLedger('child_salem');
    expect(projectRecognitionSeedEntry({ ledger: empty, ...SALEM_RECOGNITION })).toMatchObject({
      ok: false,
      error: { code: 'AMBIGUOUS_SOURCE' },
    });
    expect(empty.entries).toEqual([]);
    expect(empty.plantStageArchives).toEqual([]);
  });

  it('rejects a forged plant archive with an impossible threshold', () => {
    const triggerEventId = 'recognition:alya-later-task';
    const alyaProjection = projectRecognitionSeedEntry({
      ledger: normalizedAlya(),
      profileId: 'child_alya',
      profileEpochId: EPOCH_ONE,
      triggerEventId,
      recognitionKey: triggerEventId,
      seedTransactionId: 'seed_transaction_alya_later_task',
      amount: 12,
      committedAt: RECOGNIZED_AT,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      landscapeTransition: null,
    });
    expectOk(alyaProjection);
    const forged = {
      ...alyaProjection.data.ledger,
      plantStageArchives: [
        {
          id: `archive:mangrove:120:child_alya:${EPOCH_ONE}:recognition%3Aalya-later-task`,
          profileId: 'child_alya',
          profileEpochId: EPOCH_ONE,
          landscapeId: 'mangrove',
          threshold: 120,
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          triggerEventId,
          symbolicOnly: true,
        },
      ],
    } as SeedLedgerState;

    expect(selectLifetimeSeeds(forged, 'child_alya', EPOCH_ONE)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('permits only the 108→120 event to archive Mangrove and keeps later +12 entries archive-free', () => {
    const first = projectRecognitionSeedEntry({
      ledger: normalizedSalem(),
      ...SALEM_RECOGNITION,
    });
    expectOk(first);
    const secondEvent = {
      ...SALEM_RECOGNITION,
      triggerEventId: 'recognition:submission_recycling_p0_v1_attempt_2',
      recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_2',
      seedTransactionId: 'seed_transaction_recycling_p0_v1_attempt_2',
      committedAt: '2026-09-05T08:10:00.000Z',
    } as const;

    expect(
      projectRecognitionSeedEntry({ ledger: first.data.ledger, ...secondEvent }),
    ).toMatchObject({ ok: false, error: { code: 'EVENT_CONFLICT' } });
    expect(first.data.ledger.entries).toHaveLength(3);
    expect(first.data.ledger.plantStageArchives).toHaveLength(1);

    const laterWithoutArchive = projectRecognitionSeedEntry({
      ledger: first.data.ledger,
      ...secondEvent,
      landscapeTransition: null,
    });
    expectOk(laterWithoutArchive);
    expect(selectLifetimeSeeds(laterWithoutArchive.data.ledger, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 132,
    });
    expect(laterWithoutArchive.data.ledger.plantStageArchives).toHaveLength(1);
  });

  it('is deterministic for concurrent projection and idempotent after the first projection', () => {
    const before = normalizedSalem();
    const concurrentA = projectRecognitionSeedEntry({ ledger: before, ...SALEM_RECOGNITION });
    const concurrentB = projectRecognitionSeedEntry({ ledger: before, ...SALEM_RECOGNITION });
    expectOk(concurrentA);
    expectOk(concurrentB);
    expect(concurrentA.data).toEqual(concurrentB.data);
    expect(before.entries).toHaveLength(2);

    const repeated = projectRecognitionSeedEntry({
      ledger: concurrentA.data.ledger,
      ...SALEM_RECOGNITION,
    });
    expectOk(repeated);
    expect(repeated.data.disposition).toBe('already_projected');
    expect(repeated.data.ledger).toBe(concurrentA.data.ledger);
    expect(repeated.data.ledger.entries).toHaveLength(3);
    expect(repeated.data.ledger.plantStageArchives).toHaveLength(1);
  });

  it('fails atomically on a changed event or partial recognition receipt', () => {
    const projected = projectRecognitionSeedEntry({
      ledger: normalizedSalem(),
      ...SALEM_RECOGNITION,
    });
    expectOk(projected);
    const ledger = projected.data.ledger;

    const conflicting = projectRecognitionSeedEntry({
      ledger,
      ...SALEM_RECOGNITION,
      seedTransactionId: 'seed_transaction_conflicting',
    });
    expect(conflicting).toMatchObject({ ok: false, error: { code: 'EVENT_CONFLICT' } });
    expect(ledger.entries).toHaveLength(3);
    expect(ledger.plantStageArchives).toHaveLength(1);

    const partial = projectRecognitionSeedEntry({
      ledger,
      profileId: 'child_salem',
      profileEpochId: EPOCH_ONE,
    } as Parameters<typeof projectRecognitionSeedEntry>[0]);
    expect(partial).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(ledger.entries).toHaveLength(3);
  });

  it('rejects reuse of an authoritative recognition key or transaction under another trigger', () => {
    const projected = projectRecognitionSeedEntry({
      ledger: normalizedSalem(),
      ...SALEM_RECOGNITION,
    });
    expectOk(projected);
    const ledger = projected.data.ledger;

    const duplicateSource = projectRecognitionSeedEntry({
      ledger,
      ...SALEM_RECOGNITION,
      triggerEventId: 'recognition:forged-alternate-trigger',
      landscapeTransition: null,
    });
    expect(duplicateSource).toMatchObject({ ok: false, error: { code: 'EVENT_CONFLICT' } });
    expect(ledger.entries).toHaveLength(3);
    expect(selectLifetimeSeeds(ledger, 'child_salem', EPOCH_ONE)).toEqual({
      ok: true,
      data: 120,
    });
  });

  it('rejects recognition projection across profiles and reset epochs', () => {
    const ledger = normalizedSalem();
    expect(
      projectRecognitionSeedEntry({
        ledger,
        ...SALEM_RECOGNITION,
        profileId: 'child_alya',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      projectRecognitionSeedEntry({
        ledger,
        ...SALEM_RECOGNITION,
        profileEpochId: EPOCH_TWO,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EPOCH_SCOPE_MISMATCH' } });
  });

  it('locks the six Water & Coast stations and their canonical meanings', () => {
    expect(IMPACT_PATH_STATIONS).toEqual([
      { threshold: 120, result: 'archive_mangrove_and_earn_expanding_shade' },
      { threshold: 132, result: 'unlock_mangrove_roots_learning' },
      { threshold: 144, result: 'unlock_coastal_ripple_cosmetic' },
      { threshold: 156, result: 'evaluate_water_care_bud' },
      { threshold: 168, result: 'unlock_jubail_learning_story' },
      { threshold: 180, result: 'earn_coastal_care_and_reveal_configured_next_stage' },
    ]);
    expect(Object.isFrozen(IMPACT_PATH_STATIONS)).toBe(true);
    expect(IMPACT_PATH_STATIONS.every(Object.isFrozen)).toBe(true);
  });

  it.each([
    [107, [], 120, 'not_entered'],
    [108, [], 120, 'not_entered'],
    [119, [], 120, 'not_entered'],
    [120, [120], 132, 'active'],
    [131, [120], 132, 'active'],
    [132, [120, 132], 144, 'active'],
    [179, [120, 132, 144, 156, 168], 180, 'active'],
    [180, [120, 132, 144, 156, 168, 180], null, 'completed'],
  ] as const)(
    'projects %i lifetime Seeds without writing a second balance',
    (lifetimeSeeds, reachedThresholds, nextThreshold, chapterState) => {
      expect(projectWaterAndCoastPath(lifetimeSeeds)).toEqual({
        ok: true,
        data: {
          lifetimeSeeds,
          reachedThresholds,
          nextThreshold,
          chapterState,
        },
      });
    },
  );

  it('rejects negative and fractional path input', () => {
    expect(projectWaterAndCoastPath(-1)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(projectWaterAndCoastPath(119.5)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });
});
