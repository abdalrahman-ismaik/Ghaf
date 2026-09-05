import {
  IMPACT_PATH_STATIONS,
  SCHEMA3_R002A_FIXTURE_VERSION,
  SEED_LEDGER_MIGRATION_VERSION,
  type MangroveRecognitionTransition,
  type PlantStageArchive,
  type ProgressionErrorCode,
  type ProgressionMigrationReceipt,
  type ProgressionResult,
  type RecognitionSeedProjection,
  type RecognitionSeedProjectionInput,
  type Schema3SeedAudit,
  type Schema3SeedAuditInput,
  type SeedLedgerEntry,
  type SeedLedgerNormalization,
  type SeedLedgerState,
  type WaterAndCoastPathProjection,
} from '../../models/growthJourney';
import type { SyntheticChildId } from '../../models/familyGrowth';

const SUPPORTED_PROFILE_IDS = new Set<string>(['child_salem', 'child_alya']);
const VALID_ENTRY_KINDS = new Set<string>([
  'opening_balance',
  'legacy_carry_forward',
  'task_recognition',
]);
const VALID_PROVENANCE_SOURCES = new Set<string>([
  'schema3_profile_scalar',
  'approved_synthetic_stage_assumption',
  'recognition_receipt',
]);

function failure<T>(code: ProgressionErrorCode, message: string): ProgressionResult<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSupportedProfileId(value: unknown): value is SyntheticChildId {
  return typeof value === 'string' && SUPPORTED_PROFILE_IDS.has(value);
}

function isNonEmptySingleLine(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    value.length > 0 &&
    !/[\r\n]/u.test(value)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    isNonEmptySingleLine(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function stableFingerprint(parts: readonly (string | number | null)[]): string {
  let hash = 0x811c9dc5;
  const canonical = parts.map((part) => (part === null ? '<null>' : String(part))).join('|');
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `schema3-seeds:${hash.toString(16).padStart(8, '0')}`;
}

function schema3Fingerprint(input: {
  readonly schemaVersion: number;
  readonly fixtureVersion: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly openingSeeds: number;
  readonly currentMangroveSeeds: number | null;
  readonly recognitionLedgerEntryCount: number;
  readonly approvedCarryForwardSeeds: number | null;
}): string {
  return stableFingerprint([
    input.schemaVersion,
    input.fixtureVersion,
    input.profileId,
    input.profileEpochId,
    input.openingSeeds,
    input.currentMangroveSeeds,
    input.recognitionLedgerEntryCount,
    input.approvedCarryForwardSeeds,
  ]);
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeEntry(entry: SeedLedgerEntry): SeedLedgerEntry {
  return Object.freeze({
    ...entry,
    provenance: Object.freeze({
      ...entry.provenance,
      sourceIds: freezeStrings(entry.provenance.sourceIds),
    }),
  });
}

function freezeReceipt(receipt: ProgressionMigrationReceipt): ProgressionMigrationReceipt {
  return Object.freeze({
    ...receipt,
    entryIds: Object.freeze([...receipt.entryIds]) as unknown as readonly [string, string],
  });
}

function freezeArchive(archive: PlantStageArchive): PlantStageArchive {
  return Object.freeze({ ...archive });
}

function isFrozenLedger(ledger: SeedLedgerState): boolean {
  return (
    Object.isFrozen(ledger) &&
    Object.isFrozen(ledger.entries) &&
    ledger.entries.every(
      (entry) =>
        Object.isFrozen(entry) &&
        Object.isFrozen(entry.provenance) &&
        Object.isFrozen(entry.provenance.sourceIds),
    ) &&
    Object.isFrozen(ledger.migrationReceipts) &&
    ledger.migrationReceipts.every(
      (receipt) => Object.isFrozen(receipt) && Object.isFrozen(receipt.entryIds),
    ) &&
    Object.isFrozen(ledger.plantStageArchives) &&
    ledger.plantStageArchives.every(Object.isFrozen)
  );
}

function freezeLedger(ledger: SeedLedgerState): SeedLedgerState {
  if (isFrozenLedger(ledger)) return ledger;
  return Object.freeze({
    profileId: ledger.profileId,
    profileEpochId: ledger.profileEpochId,
    entries: Object.freeze(ledger.entries.map(freezeEntry)),
    migrationReceipts: Object.freeze(ledger.migrationReceipts.map(freezeReceipt)),
    plantStageArchives: Object.freeze(ledger.plantStageArchives.map(freezeArchive)),
  });
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameEntry(left: SeedLedgerEntry, right: SeedLedgerEntry): boolean {
  return (
    left.id === right.id &&
    left.profileId === right.profileId &&
    left.profileEpochId === right.profileEpochId &&
    left.triggerEventId === right.triggerEventId &&
    left.kind === right.kind &&
    left.amount === right.amount &&
    left.status === right.status &&
    left.committedAt === right.committedAt &&
    left.silentBackfill === right.silentBackfill &&
    left.provenance.fixtureVersion === right.provenance.fixtureVersion &&
    left.provenance.source === right.provenance.source &&
    left.provenance.sourceFingerprint === right.provenance.sourceFingerprint &&
    sameStrings(left.provenance.sourceIds, right.provenance.sourceIds)
  );
}

function sameArchive(left: PlantStageArchive, right: PlantStageArchive): boolean {
  return (
    left.id === right.id &&
    left.profileId === right.profileId &&
    left.profileEpochId === right.profileEpochId &&
    left.landscapeId === right.landscapeId &&
    left.threshold === right.threshold &&
    left.seedsBefore === right.seedsBefore &&
    left.seedsAfter === right.seedsAfter &&
    left.stageBefore === right.stageBefore &&
    left.stageAfter === right.stageAfter &&
    left.triggerEventId === right.triggerEventId &&
    left.symbolicOnly === right.symbolicOnly
  );
}

function expectedOpeningSeeds(profileId: SyntheticChildId): 48 | 36 {
  return profileId === 'child_salem' ? 48 : 36;
}

function expectedBaselineFingerprint(profileId: SyntheticChildId, profileEpochId: string): string {
  return schema3Fingerprint({
    schemaVersion: 3,
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    profileId,
    profileEpochId,
    openingSeeds: expectedOpeningSeeds(profileId),
    currentMangroveSeeds: profileId === 'child_salem' ? 48 : null,
    recognitionLedgerEntryCount: 0,
    approvedCarryForwardSeeds: profileId === 'child_salem' ? 60 : null,
  });
}

function openingTriggerId(profileId: SyntheticChildId, profileEpochId: string): string {
  return `schema3-opening:${profileId}:${profileEpochId}`;
}

function carryForwardTriggerId(profileEpochId: string): string {
  return `approved-stage-assumption:child_salem:${profileEpochId}:60`;
}

function validateKindProvenance(entry: SeedLedgerEntry): ProgressionResult<true> {
  if (entry.kind === 'opening_balance') {
    if (
      entry.provenance.source === 'schema3_profile_scalar' &&
      entry.provenance.sourceIds.length === 1 &&
      entry.silentBackfill === true &&
      entry.committedAt === null
    ) {
      const expectedFingerprint = expectedBaselineFingerprint(
        entry.profileId,
        entry.profileEpochId,
      );
      if (
        entry.id !== openingEntryId(entry.profileId, entry.profileEpochId) ||
        entry.triggerEventId !== openingTriggerId(entry.profileId, entry.profileEpochId) ||
        entry.amount !== expectedOpeningSeeds(entry.profileId) ||
        entry.provenance.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
        entry.provenance.sourceIds[0] !== `profile:${entry.profileId}:earnedSeeds` ||
        entry.provenance.sourceFingerprint !== expectedFingerprint
      ) {
        return failure(
          'FIXTURE_EVIDENCE_MISMATCH',
          'Opening Seed evidence does not match the exact Schema-3 profile fixture',
        );
      }
      return { ok: true, data: true };
    }
    return failure('INVALID_INPUT', 'Opening Seed provenance has an invalid evidence shape');
  }
  if (entry.kind === 'legacy_carry_forward') {
    if (
      entry.profileId === 'child_salem' &&
      entry.amount === 60 &&
      entry.provenance.source === 'approved_synthetic_stage_assumption' &&
      entry.provenance.sourceIds.length === 1 &&
      entry.silentBackfill === true &&
      entry.committedAt === null
    ) {
      const expectedFingerprint = expectedBaselineFingerprint(
        entry.profileId,
        entry.profileEpochId,
      );
      if (
        entry.id !== carryForwardEntryId(entry.profileEpochId) ||
        entry.triggerEventId !== carryForwardTriggerId(entry.profileEpochId) ||
        entry.provenance.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
        entry.provenance.sourceIds[0] !==
          'approved-fixture-assumption:mangrove-previous-stage:60' ||
        entry.provenance.sourceFingerprint !== expectedFingerprint
      ) {
        return failure(
          'FIXTURE_EVIDENCE_MISMATCH',
          'Carry-forward evidence does not match the approved Salem-only fixture assumption',
        );
      }
      return { ok: true, data: true };
    }
    return failure('INVALID_INPUT', 'Carry-forward provenance has an invalid evidence shape');
  }
  if (
    entry.amount !== 12 ||
    entry.provenance.source !== 'recognition_receipt' ||
    entry.provenance.sourceIds.length !== 2 ||
    entry.provenance.sourceIds[0] === entry.provenance.sourceIds[1] ||
    entry.silentBackfill !== false ||
    !isIsoTimestamp(entry.committedAt)
  ) {
    return failure('INVALID_INPUT', 'Recognition Seed provenance has an invalid evidence shape');
  }
  const recognitionKey = entry.provenance.sourceIds[0];
  const seedTransactionId = entry.provenance.sourceIds[1];
  if (!recognitionKey || !seedTransactionId) {
    return failure('INVALID_INPUT', 'Recognition Seed provenance source IDs are required');
  }
  const expectedFingerprint = stableFingerprint([
    entry.profileId,
    entry.profileEpochId,
    entry.triggerEventId,
    recognitionKey,
    seedTransactionId,
    entry.amount,
    entry.committedAt,
    entry.provenance.fixtureVersion,
  ]);
  if (
    entry.id !== recognitionEntryId(entry.profileId, entry.profileEpochId, entry.triggerEventId) ||
    entry.provenance.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
    entry.provenance.sourceFingerprint !== expectedFingerprint
  ) {
    return failure(
      'EVENT_CONFLICT',
      'Recognition Seed evidence does not match its stable identity',
    );
  }
  return { ok: true, data: true };
}

function validateCanonicalAudit(audit: unknown): ProgressionResult<Schema3SeedAudit> {
  if (
    !isRecord(audit) ||
    audit.schemaVersion !== 3 ||
    audit.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
    !isSupportedProfileId(audit.profileId) ||
    !isNonEmptySingleLine(audit.profileEpochId) ||
    audit.syntheticOnly !== true ||
    !isNonNegativeInteger(audit.openingSeeds) ||
    (audit.currentMangroveSeeds !== 48 && audit.currentMangroveSeeds !== null) ||
    audit.recognitionLedgerEntryCount !== 0 ||
    audit.historicalStage60 !== 'not_recorded' ||
    audit.ledgerReconciliation !== 'opening_balance_missing' ||
    (audit.approvedCarryForwardSeeds !== 60 && audit.approvedCarryForwardSeeds !== null) ||
    (audit.eligibility !== 'salem_opening_and_carry_forward' &&
      audit.eligibility !== 'alya_opening_only') ||
    !isNonEmptySingleLine(audit.sourceFingerprint)
  ) {
    return failure(
      'FIXTURE_EVIDENCE_MISMATCH',
      'The audit does not preserve every canonical Schema-3 evidence discriminator',
    );
  }
  return { ok: true, data: audit as unknown as Schema3SeedAudit };
}

function validateLedger(ledger: unknown): ProgressionResult<SeedLedgerState> {
  if (
    !isRecord(ledger) ||
    !isSupportedProfileId(ledger.profileId) ||
    !isNonEmptySingleLine(ledger.profileEpochId) ||
    !Array.isArray(ledger.entries) ||
    !Array.isArray(ledger.migrationReceipts) ||
    !Array.isArray(ledger.plantStageArchives)
  ) {
    return failure('INVALID_INPUT', 'A complete profile- and epoch-scoped Seed ledger is required');
  }

  const typedLedger = ledger as unknown as SeedLedgerState;
  const entriesById = new Map<string, SeedLedgerEntry>();
  const recognitionSourceOwners = new Map<string, string>();
  for (const candidate of typedLedger.entries) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      candidate.profileId !== typedLedger.profileId ||
      candidate.profileEpochId !== typedLedger.profileEpochId ||
      !isNonEmptySingleLine(candidate.triggerEventId) ||
      !VALID_ENTRY_KINDS.has(String(candidate.kind)) ||
      !isPositiveInteger(candidate.amount) ||
      candidate.status !== 'committed' ||
      (candidate.committedAt !== null && !isIsoTimestamp(candidate.committedAt)) ||
      typeof candidate.silentBackfill !== 'boolean' ||
      !isRecord(candidate.provenance) ||
      !isNonEmptySingleLine(candidate.provenance.fixtureVersion) ||
      !VALID_PROVENANCE_SOURCES.has(String(candidate.provenance.source)) ||
      !isNonEmptySingleLine(candidate.provenance.sourceFingerprint) ||
      !Array.isArray(candidate.provenance.sourceIds) ||
      candidate.provenance.sourceIds.length === 0 ||
      !candidate.provenance.sourceIds.every(isNonEmptySingleLine)
    ) {
      return failure('INVALID_INPUT', 'Seed entries must be complete committed positive evidence');
    }
    const entry = candidate as unknown as SeedLedgerEntry;
    const previous = entriesById.get(entry.id);
    if (previous && !sameEntry(previous, entry)) {
      return failure('EVENT_CONFLICT', 'A stable Seed entry ID contains conflicting evidence');
    }
    const provenanceResult = validateKindProvenance(entry);
    if (!provenanceResult.ok) return provenanceResult;
    entriesById.set(entry.id, entry);
    if (entry.kind === 'task_recognition') {
      for (const sourceId of entry.provenance.sourceIds) {
        const owner = recognitionSourceOwners.get(sourceId);
        if (owner && owner !== entry.id) {
          return failure(
            'EVENT_CONFLICT',
            'An authoritative recognition source cannot fund more than one Seed entry',
          );
        }
        recognitionSourceOwners.set(sourceId, entry.id);
      }
    }
  }

  const receiptIds = new Set<string>();
  for (const candidate of typedLedger.migrationReceipts) {
    if (
      !isRecord(candidate) ||
      candidate.migrationVersion !== SEED_LEDGER_MIGRATION_VERSION ||
      candidate.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
      candidate.profileId !== 'child_salem' ||
      candidate.profileId !== typedLedger.profileId ||
      candidate.profileEpochId !== typedLedger.profileEpochId ||
      !isNonEmptySingleLine(candidate.sourceFingerprint) ||
      candidate.status !== 'applied' ||
      !Array.isArray(candidate.entryIds) ||
      candidate.entryIds.length !== 2 ||
      !candidate.entryIds.every(isNonEmptySingleLine) ||
      !isIsoTimestamp(candidate.appliedAt) ||
      candidate.syntheticOnly !== true ||
      candidate.silentBackfill !== true
    ) {
      return failure(
        'INVALID_INPUT',
        'Migration receipts must retain complete synthetic provenance',
      );
    }
    const expectedReceiptId = migrationReceiptId(typedLedger.profileEpochId);
    const expectedOpeningId = openingEntryId('child_salem', typedLedger.profileEpochId);
    const expectedCarryForwardId = carryForwardEntryId(typedLedger.profileEpochId);
    const expectedFingerprint = expectedBaselineFingerprint(
      'child_salem',
      typedLedger.profileEpochId,
    );
    if (
      candidate.id !== expectedReceiptId ||
      candidate.sourceFingerprint !== expectedFingerprint ||
      !sameStrings(candidate.entryIds, [expectedOpeningId, expectedCarryForwardId])
    ) {
      return failure(
        'EVENT_CONFLICT',
        'The migration receipt does not reference the canonical Salem baseline graph',
      );
    }
    if (receiptIds.has(candidate.id)) {
      return failure('EVENT_CONFLICT', 'A migration receipt ID may occur only once');
    }
    receiptIds.add(candidate.id);
  }

  const openingId = openingEntryId(typedLedger.profileId, typedLedger.profileEpochId);
  const opening = entriesById.get(openingId);
  const openingEntries = [...entriesById.values()].filter(
    (entry) => entry.kind === 'opening_balance',
  );
  const carryForwardId = carryForwardEntryId(typedLedger.profileEpochId);
  const carryForward = entriesById.get(carryForwardId);
  const carryForwardEntries = [...entriesById.values()].filter(
    (entry) => entry.kind === 'legacy_carry_forward',
  );
  const receipt = typedLedger.migrationReceipts[0];

  if (openingEntries.length > 1 || carryForwardEntries.length > 1) {
    return failure('EVENT_CONFLICT', 'A profile epoch can contain only one logical baseline entry');
  }
  if (typedLedger.profileId === 'child_salem') {
    const hasAnyBaselineEvidence = Boolean(opening || carryForward || receipt);
    if (hasAnyBaselineEvidence && (!opening || !carryForward || !receipt)) {
      return failure(
        'EVENT_CONFLICT',
        'Salem opening, carry-forward, and migration receipt must exist as one atomic graph',
      );
    }
    if (typedLedger.migrationReceipts.length > 1) {
      return failure('EVENT_CONFLICT', 'Salem can have only one canonical migration receipt');
    }
  } else if (carryForwardEntries.length > 0 || typedLedger.migrationReceipts.length > 0) {
    return failure(
      'EVENT_CONFLICT',
      'Alya cannot inherit Salem carry-forward or migration receipt evidence',
    );
  }

  const hasRecognition = [...entriesById.values()].some(
    (entry) => entry.kind === 'task_recognition',
  );
  if (hasRecognition && !opening) {
    return failure(
      'EVENT_CONFLICT',
      'Recognition evidence requires a normalized profile opening baseline',
    );
  }

  const archivesById = new Map<string, PlantStageArchive>();
  for (const candidate of typedLedger.plantStageArchives) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      candidate.profileId !== typedLedger.profileId ||
      candidate.profileEpochId !== typedLedger.profileEpochId ||
      candidate.landscapeId !== 'mangrove' ||
      candidate.threshold !== 60 ||
      candidate.seedsBefore !== 48 ||
      candidate.seedsAfter !== 60 ||
      candidate.stageBefore !== 'shoot' ||
      candidate.stageAfter !== 'sapling' ||
      !isNonEmptySingleLine(candidate.triggerEventId) ||
      candidate.symbolicOnly !== true
    ) {
      return failure('INVALID_INPUT', 'Plant archives must preserve the exact symbolic transition');
    }
    if (candidate.profileId !== 'child_salem') {
      return failure(
        'FIXTURE_EVIDENCE_MISMATCH',
        'The canonical Mangrove 60 archive belongs only to Salem',
      );
    }
    const archive = candidate as unknown as PlantStageArchive;
    const previous = archivesById.get(archive.id);
    if (previous && !sameArchive(previous, archive)) {
      return failure('EVENT_CONFLICT', 'A stable archive ID contains conflicting evidence');
    }
    archivesById.set(archive.id, archive);
  }
  if (archivesById.size > 1) {
    return failure(
      'EVENT_CONFLICT',
      'A profile epoch can contain only one logical Mangrove 60 archive',
    );
  }

  for (const archive of archivesById.values()) {
    const matchingRecognition = [...entriesById.values()].find(
      (entry) =>
        entry.kind === 'task_recognition' &&
        entry.triggerEventId === archive.triggerEventId &&
        entry.profileId === archive.profileId &&
        entry.profileEpochId === archive.profileEpochId,
    );
    if (
      !matchingRecognition ||
      archive.id !== archiveId(archive.profileId, archive.profileEpochId, archive.triggerEventId)
    ) {
      return failure(
        'EVENT_CONFLICT',
        'A Mangrove archive requires its exact profile-scoped recognition entry',
      );
    }
  }

  return { ok: true, data: typedLedger };
}

function segment(value: string): string {
  return encodeURIComponent(value);
}

function openingEntryId(profileId: SyntheticChildId, profileEpochId: string): string {
  return `seed:opening:${segment(profileId)}:${segment(profileEpochId)}`;
}

function carryForwardEntryId(profileEpochId: string): string {
  return `seed:carry-forward:child_salem:${segment(profileEpochId)}`;
}

function migrationReceiptId(profileEpochId: string): string {
  return `migration:${SEED_LEDGER_MIGRATION_VERSION}:child_salem:${segment(profileEpochId)}`;
}

function recognitionEntryId(
  profileId: SyntheticChildId,
  profileEpochId: string,
  triggerEventId: string,
): string {
  return `seed:recognition:${segment(profileId)}:${segment(profileEpochId)}:${segment(triggerEventId)}`;
}

function archiveId(
  profileId: SyntheticChildId,
  profileEpochId: string,
  triggerEventId: string,
): string {
  return `archive:mangrove:60:${segment(profileId)}:${segment(profileEpochId)}:${segment(triggerEventId)}`;
}

function expectedAuditFingerprint(audit: Schema3SeedAudit): string {
  return schema3Fingerprint({
    schemaVersion: audit.schemaVersion,
    fixtureVersion: audit.fixtureVersion,
    profileId: audit.profileId,
    profileEpochId: audit.profileEpochId,
    openingSeeds: audit.openingSeeds,
    currentMangroveSeeds: audit.currentMangroveSeeds,
    recognitionLedgerEntryCount: audit.recognitionLedgerEntryCount,
    approvedCarryForwardSeeds: audit.approvedCarryForwardSeeds,
  });
}

function createOpeningEntry(audit: Schema3SeedAudit): SeedLedgerEntry {
  return freezeEntry({
    id: openingEntryId(audit.profileId, audit.profileEpochId),
    profileId: audit.profileId,
    profileEpochId: audit.profileEpochId,
    triggerEventId: openingTriggerId(audit.profileId, audit.profileEpochId),
    kind: 'opening_balance',
    amount: audit.openingSeeds,
    status: 'committed',
    committedAt: null,
    silentBackfill: true,
    provenance: {
      fixtureVersion: audit.fixtureVersion,
      source: 'schema3_profile_scalar',
      sourceIds: [`profile:${audit.profileId}:earnedSeeds`],
      sourceFingerprint: audit.sourceFingerprint,
    },
  });
}

function createCarryForwardEntry(audit: Schema3SeedAudit): SeedLedgerEntry {
  return freezeEntry({
    id: carryForwardEntryId(audit.profileEpochId),
    profileId: 'child_salem',
    profileEpochId: audit.profileEpochId,
    triggerEventId: carryForwardTriggerId(audit.profileEpochId),
    kind: 'legacy_carry_forward',
    amount: 60,
    status: 'committed',
    committedAt: null,
    silentBackfill: true,
    provenance: {
      fixtureVersion: audit.fixtureVersion,
      source: 'approved_synthetic_stage_assumption',
      sourceIds: ['approved-fixture-assumption:mangrove-previous-stage:60'],
      sourceFingerprint: audit.sourceFingerprint,
    },
  });
}

function expectedMangroveArchive(
  input: RecognitionSeedProjectionInput,
  profileId: SyntheticChildId,
): PlantStageArchive | null {
  if (input.mangroveTransition === null) return null;
  return freezeArchive({
    id: archiveId(profileId, input.profileEpochId, input.triggerEventId),
    profileId,
    profileEpochId: input.profileEpochId,
    landscapeId: 'mangrove',
    threshold: 60,
    seedsBefore: 48,
    seedsAfter: 60,
    stageBefore: 'shoot',
    stageAfter: 'sapling',
    triggerEventId: input.triggerEventId,
    symbolicOnly: true,
  });
}

function isCanonicalMangroveTransition(value: unknown): value is MangroveRecognitionTransition {
  return (
    isRecord(value) &&
    value.landscapeId === 'mangrove' &&
    value.seedsBefore === 48 &&
    value.seedsAfter === 60 &&
    value.stageBefore === 'shoot' &&
    value.stageAfter === 'sapling' &&
    value.crossedThreshold === 60 &&
    value.symbolicOnly === true
  );
}

export function auditSchema3SeedState(
  input: Schema3SeedAuditInput,
): ProgressionResult<Schema3SeedAudit> {
  if (
    !isRecord(input) ||
    typeof input.schemaVersion !== 'number' ||
    !isNonEmptySingleLine(input.fixtureVersion) ||
    !isNonEmptySingleLine(input.persistence) ||
    !isNonEmptySingleLine(input.profileId) ||
    !isNonEmptySingleLine(input.activeProfileId) ||
    !isNonEmptySingleLine(input.profileEpochId) ||
    !isNonEmptySingleLine(input.activeResetEpochId) ||
    !isNonEmptySingleLine(input.profileOrigin) ||
    !isNonNegativeInteger(input.openingEarnedSeeds) ||
    !isNonNegativeInteger(input.recognitionLedgerEntryCount) ||
    !Object.prototype.hasOwnProperty.call(input, 'mangroveProgress')
  ) {
    return failure('INVALID_INPUT', 'The complete Schema-3 evidence record is required');
  }
  if (input.schemaVersion !== 3) {
    return failure('UNSUPPORTED_SCHEMA', 'Only the audited Schema-3 fixture can be normalized');
  }
  if (input.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION) {
    return failure(
      'FIXTURE_VERSION_MISMATCH',
      'The fixture version is not an approved R002a baseline',
    );
  }
  if (input.persistence === 'durable_or_real' || input.profileOrigin !== 'synthetic') {
    return failure(
      'NON_SYNTHETIC_SOURCE',
      'Real or non-synthetic profile data cannot use this migration',
    );
  }
  if (input.persistence === 'ambiguous' || input.recognitionLedgerEntryCount !== 0) {
    return failure(
      'AMBIGUOUS_SOURCE',
      'Ambiguous or previously populated ledger evidence fails closed',
    );
  }
  if (input.persistence !== 'synthetic_in_memory') {
    return failure('INVALID_INPUT', 'The persistence classification is invalid');
  }
  if (!isSupportedProfileId(input.profileId)) {
    return failure(
      'UNSUPPORTED_PROFILE',
      'Only local household Child profiles have Seed authority',
    );
  }
  if (input.activeProfileId !== input.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'The active profile must own the audited evidence');
  }
  if (input.activeResetEpochId !== input.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'The active reset epoch must own the audited evidence');
  }

  if (input.profileId === 'child_salem') {
    const mangrove = input.mangroveProgress;
    if (
      input.openingEarnedSeeds !== 48 ||
      !isRecord(mangrove) ||
      mangrove.landscapeId !== 'mangrove' ||
      mangrove.cumulativeSeeds !== 48 ||
      mangrove.stage !== 'shoot' ||
      mangrove.nextThreshold !== 60
    ) {
      return failure(
        'FIXTURE_EVIDENCE_MISMATCH',
        'Salem requires the exact approved Schema-3 reset evidence',
      );
    }
    const audit: Schema3SeedAudit = {
      schemaVersion: 3,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      profileId: 'child_salem',
      profileEpochId: input.profileEpochId,
      syntheticOnly: true,
      openingSeeds: 48,
      currentMangroveSeeds: 48,
      recognitionLedgerEntryCount: 0,
      historicalStage60: 'not_recorded',
      ledgerReconciliation: 'opening_balance_missing',
      approvedCarryForwardSeeds: 60,
      eligibility: 'salem_opening_and_carry_forward',
      sourceFingerprint: '',
    };
    return {
      ok: true,
      data: Object.freeze({ ...audit, sourceFingerprint: expectedAuditFingerprint(audit) }),
    };
  }

  if (input.openingEarnedSeeds !== 36 || input.mangroveProgress !== null) {
    return failure(
      'FIXTURE_EVIDENCE_MISMATCH',
      'Alya requires her exact profile opening evidence only',
    );
  }
  const audit: Schema3SeedAudit = {
    schemaVersion: 3,
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    profileId: 'child_alya',
    profileEpochId: input.profileEpochId,
    syntheticOnly: true,
    openingSeeds: 36,
    currentMangroveSeeds: null,
    recognitionLedgerEntryCount: 0,
    historicalStage60: 'not_recorded',
    ledgerReconciliation: 'opening_balance_missing',
    approvedCarryForwardSeeds: null,
    eligibility: 'alya_opening_only',
    sourceFingerprint: '',
  };
  return {
    ok: true,
    data: Object.freeze({ ...audit, sourceFingerprint: expectedAuditFingerprint(audit) }),
  };
}

export function createEmptySeedLedger(input: {
  readonly profileId: string;
  readonly profileEpochId: string;
}): ProgressionResult<SeedLedgerState> {
  if (
    !isRecord(input) ||
    !isSupportedProfileId(input.profileId) ||
    !isNonEmptySingleLine(input.profileEpochId)
  ) {
    return failure('INVALID_INPUT', 'A supported profile and non-empty reset epoch are required');
  }
  return {
    ok: true,
    data: freezeLedger({
      profileId: input.profileId,
      profileEpochId: input.profileEpochId,
      entries: [],
      migrationReceipts: [],
      plantStageArchives: [],
    }),
  };
}

export function normalizeSchema3SeedLedger(input: {
  readonly audit: Schema3SeedAudit;
  readonly ledger: SeedLedgerState;
  readonly appliedAt: string;
}): ProgressionResult<SeedLedgerNormalization> {
  if (!isRecord(input) || !isRecord(input.audit) || !isIsoTimestamp(input.appliedAt)) {
    return failure(
      'INVALID_INPUT',
      'A complete audit, ledger, and deterministic timestamp are required',
    );
  }
  const auditResult = validateCanonicalAudit(input.audit);
  if (!auditResult.ok) return auditResult;
  const ledgerResult = validateLedger(input.ledger);
  if (!ledgerResult.ok) return ledgerResult;
  const ledger = ledgerResult.data;
  const audit = auditResult.data;
  if (ledger.profileId !== audit.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Audit and ledger profiles must match');
  }
  if (ledger.profileEpochId !== audit.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Audit and ledger reset epochs must match');
  }

  const opening = createOpeningEntry(audit);
  if (audit.profileId === 'child_salem') {
    const carryForward = createCarryForwardEntry(audit);
    const receiptId = migrationReceiptId(audit.profileEpochId);
    const existingReceipt = ledger.migrationReceipts.find((receipt) => receipt.id === receiptId);
    if (existingReceipt && existingReceipt.sourceFingerprint !== audit.sourceFingerprint) {
      return failure(
        'FINGERPRINT_CONFLICT',
        'The existing migration receipt has different fixture provenance',
      );
    }
    if (audit.sourceFingerprint !== expectedAuditFingerprint(audit)) {
      return failure(
        'FIXTURE_EVIDENCE_MISMATCH',
        'The Schema-3 audit fingerprint is not reproducible',
      );
    }
    if (
      audit.syntheticOnly !== true ||
      audit.openingSeeds !== 48 ||
      audit.currentMangroveSeeds !== 48 ||
      audit.approvedCarryForwardSeeds !== 60 ||
      audit.eligibility !== 'salem_opening_and_carry_forward'
    ) {
      return failure(
        'FIXTURE_EVIDENCE_MISMATCH',
        'The Salem audit no longer matches approved evidence',
      );
    }

    if (existingReceipt) {
      const existingOpening = ledger.entries.find((entry) => entry.id === opening.id);
      const existingCarryForward = ledger.entries.find((entry) => entry.id === carryForward.id);
      if (
        !existingOpening ||
        !existingCarryForward ||
        !sameEntry(existingOpening, opening) ||
        !sameEntry(existingCarryForward, carryForward) ||
        !sameStrings(existingReceipt.entryIds, [opening.id, carryForward.id])
      ) {
        return failure(
          'EVENT_CONFLICT',
          'The migration receipt and baseline entries do not reconcile',
        );
      }
      return {
        ok: true,
        data: Object.freeze({
          disposition: 'already_applied',
          ledger: freezeLedger(ledger),
          receipt: existingReceipt,
        }),
      };
    }
    if (ledger.entries.length > 0 || ledger.migrationReceipts.length > 0) {
      return failure(
        'AMBIGUOUS_SOURCE',
        'Salem normalization must apply atomically before later entries',
      );
    }

    const receipt = freezeReceipt({
      id: receiptId,
      migrationVersion: SEED_LEDGER_MIGRATION_VERSION,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      profileId: 'child_salem',
      profileEpochId: audit.profileEpochId,
      sourceFingerprint: audit.sourceFingerprint,
      status: 'applied',
      entryIds: [opening.id, carryForward.id],
      appliedAt: input.appliedAt,
      syntheticOnly: true,
      silentBackfill: true,
    });
    const nextLedger = freezeLedger({
      ...ledger,
      entries: [opening, carryForward],
      migrationReceipts: [receipt],
    });
    return {
      ok: true,
      data: Object.freeze({ disposition: 'applied', ledger: nextLedger, receipt }),
    };
  }

  if (audit.sourceFingerprint !== expectedAuditFingerprint(audit)) {
    return failure(
      'FIXTURE_EVIDENCE_MISMATCH',
      'The Schema-3 audit fingerprint is not reproducible',
    );
  }
  if (
    audit.syntheticOnly !== true ||
    audit.openingSeeds !== 36 ||
    audit.currentMangroveSeeds !== null ||
    audit.approvedCarryForwardSeeds !== null ||
    audit.eligibility !== 'alya_opening_only'
  ) {
    return failure(
      'FIXTURE_EVIDENCE_MISMATCH',
      'The Alya audit no longer matches approved evidence',
    );
  }
  const existingOpening = ledger.entries.find((entry) => entry.id === opening.id);
  if (existingOpening) {
    if (!sameEntry(existingOpening, opening)) {
      return failure('FINGERPRINT_CONFLICT', 'Alya opening evidence changed after normalization');
    }
    return {
      ok: true,
      data: Object.freeze({
        disposition: 'already_applied',
        ledger: freezeLedger(ledger),
        receipt: null,
      }),
    };
  }
  if (ledger.entries.length > 0 || ledger.migrationReceipts.length > 0) {
    return failure(
      'AMBIGUOUS_SOURCE',
      'Alya opening evidence must be normalized before later entries',
    );
  }
  return {
    ok: true,
    data: Object.freeze({
      disposition: 'applied',
      ledger: freezeLedger({ ...ledger, entries: [opening] }),
      receipt: null,
    }),
  };
}

export function selectLifetimeSeeds(
  ledger: SeedLedgerState,
  profileId: string,
  profileEpochId: string,
): ProgressionResult<number> {
  const ledgerResult = validateLedger(ledger);
  if (!ledgerResult.ok) return ledgerResult;
  if (ledgerResult.data.profileId !== profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Lifetime Seeds cannot cross profile boundaries');
  }
  if (ledgerResult.data.profileEpochId !== profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Lifetime Seeds cannot cross reset-epoch boundaries');
  }

  const uniqueEntries = new Map<string, SeedLedgerEntry>();
  for (const entry of ledgerResult.data.entries) {
    if (!uniqueEntries.has(entry.id)) uniqueEntries.set(entry.id, entry);
  }
  const total = [...uniqueEntries.values()].reduce((sum, entry) => sum + entry.amount, 0);
  if (!Number.isSafeInteger(total)) {
    return failure('INVALID_INPUT', 'Lifetime Seed evidence exceeds the safe integer range');
  }
  return { ok: true, data: total };
}

export function projectRecognitionSeedEntry(
  input: RecognitionSeedProjectionInput,
): ProgressionResult<RecognitionSeedProjection> {
  if (
    !isRecord(input) ||
    !isRecord(input.ledger) ||
    !isSupportedProfileId(input.profileId) ||
    !isNonEmptySingleLine(input.profileEpochId) ||
    !isNonEmptySingleLine(input.triggerEventId) ||
    !isNonEmptySingleLine(input.recognitionKey) ||
    !isNonEmptySingleLine(input.seedTransactionId) ||
    input.recognitionKey === input.seedTransactionId ||
    input.amount !== 12 ||
    !isIsoTimestamp(input.committedAt) ||
    input.fixtureVersion !== SCHEMA3_R002A_FIXTURE_VERSION ||
    !Object.prototype.hasOwnProperty.call(input, 'mangroveTransition') ||
    (input.mangroveTransition !== null && !isCanonicalMangroveTransition(input.mangroveTransition))
  ) {
    return failure(
      'INVALID_INPUT',
      'A complete canonical committed recognition receipt is required',
    );
  }
  const ledgerResult = validateLedger(input.ledger);
  if (!ledgerResult.ok) return ledgerResult;
  const ledger = ledgerResult.data;
  if (ledger.profileId !== input.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Recognition and ledger profiles must match');
  }
  if (ledger.profileEpochId !== input.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Recognition and ledger reset epochs must match');
  }
  const normalizedOpening = ledger.entries.find(
    (entry) =>
      entry.kind === 'opening_balance' &&
      entry.id === openingEntryId(ledger.profileId, input.profileEpochId),
  );
  if (!normalizedOpening) {
    return failure(
      'AMBIGUOUS_SOURCE',
      'Recognition cannot be projected before the profile baseline is normalized',
    );
  }
  const projectedEntryId = recognitionEntryId(
    ledger.profileId,
    input.profileEpochId,
    input.triggerEventId,
  );
  const eventAlreadyProjected = ledger.entries.some((entry) => entry.id === projectedEntryId);
  if (input.mangroveTransition !== null && input.profileId !== 'child_salem') {
    return failure(
      'FIXTURE_EVIDENCE_MISMATCH',
      'The canonical Mangrove archive belongs only to Salem',
    );
  }
  if (input.mangroveTransition !== null && !eventAlreadyProjected) {
    const beforeResult = selectLifetimeSeeds(ledger, input.profileId, input.profileEpochId);
    if (!beforeResult.ok) return beforeResult;
    if (beforeResult.data !== 108 || ledger.plantStageArchives.length > 0) {
      return failure(
        'EVENT_CONFLICT',
        'Only the canonical 108-to-120 event may archive the Mangrove 60 stage',
      );
    }
  }

  const fingerprint = stableFingerprint([
    input.profileId,
    input.profileEpochId,
    input.triggerEventId,
    input.recognitionKey,
    input.seedTransactionId,
    input.amount,
    input.committedAt,
    input.fixtureVersion,
  ]);
  const entry = freezeEntry({
    id: recognitionEntryId(input.profileId, input.profileEpochId, input.triggerEventId),
    profileId: input.profileId,
    profileEpochId: input.profileEpochId,
    triggerEventId: input.triggerEventId,
    kind: 'task_recognition',
    amount: 12,
    status: 'committed',
    committedAt: input.committedAt,
    silentBackfill: false,
    provenance: {
      fixtureVersion: input.fixtureVersion,
      source: 'recognition_receipt',
      sourceIds: [input.recognitionKey, input.seedTransactionId],
      sourceFingerprint: fingerprint,
    },
  });
  const archive = expectedMangroveArchive(input, input.profileId);
  const existingEntry = ledger.entries.find((candidate) => candidate.id === entry.id);
  const eventEntry = ledger.entries.find(
    (candidate) => candidate.triggerEventId === input.triggerEventId && candidate.id !== entry.id,
  );
  const reusedRecognitionSource = ledger.entries.find(
    (candidate) =>
      candidate.kind === 'task_recognition' &&
      candidate.id !== entry.id &&
      candidate.provenance.sourceIds.some(
        (sourceId) => sourceId === input.recognitionKey || sourceId === input.seedTransactionId,
      ),
  );
  if (
    eventEntry ||
    reusedRecognitionSource ||
    (existingEntry && !sameEntry(existingEntry, entry))
  ) {
    return failure(
      'EVENT_CONFLICT',
      'The recognition event was already projected with different evidence',
    );
  }

  const existingArchive = archive
    ? ledger.plantStageArchives.find((candidate) => candidate.id === archive.id)
    : ledger.plantStageArchives.find(
        (candidate) => candidate.triggerEventId === input.triggerEventId,
      );
  if (
    (archive && existingArchive && !sameArchive(existingArchive, archive)) ||
    (!archive && existingArchive)
  ) {
    return failure(
      'EVENT_CONFLICT',
      'The recognition event has conflicting Mangrove archive evidence',
    );
  }
  if (existingEntry) {
    if (archive && !existingArchive) {
      return failure('EVENT_CONFLICT', 'The projected recognition is missing its Mangrove archive');
    }
    return {
      ok: true,
      data: Object.freeze({
        disposition: 'already_projected',
        ledger: freezeLedger(ledger),
        entry: existingEntry,
        archive: existingArchive ?? null,
      }),
    };
  }
  if (existingArchive) {
    return failure(
      'EVENT_CONFLICT',
      'A Mangrove archive exists without its recognition Seed entry',
    );
  }

  const nextLedger = freezeLedger({
    ...ledger,
    entries: [...ledger.entries, entry],
    plantStageArchives: archive
      ? [...ledger.plantStageArchives, archive]
      : ledger.plantStageArchives,
  });
  return {
    ok: true,
    data: Object.freeze({ disposition: 'projected', ledger: nextLedger, entry, archive }),
  };
}

export function projectWaterAndCoastPath(
  lifetimeSeeds: number,
): ProgressionResult<WaterAndCoastPathProjection> {
  if (!isNonNegativeInteger(lifetimeSeeds)) {
    return failure('INVALID_INPUT', 'Impact Path requires a non-negative integer lifetime total');
  }
  const reachedThresholds = Object.freeze(
    IMPACT_PATH_STATIONS.filter((station) => lifetimeSeeds >= station.threshold).map(
      (station) => station.threshold,
    ),
  );
  const nextThreshold =
    IMPACT_PATH_STATIONS.find((station) => lifetimeSeeds < station.threshold)?.threshold ?? null;
  const chapterState =
    lifetimeSeeds < 120 ? 'not_entered' : lifetimeSeeds < 180 ? 'active' : 'completed';
  return {
    ok: true,
    data: Object.freeze({ lifetimeSeeds, reachedThresholds, nextThreshold, chapterState }),
  };
}
