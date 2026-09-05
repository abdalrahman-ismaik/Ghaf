import type { FixedSeedAward, GardenStage, SyntheticChildId } from './familyGrowth';

export const SCHEMA3_R002A_FIXTURE_VERSION = 'schema3.r002a.al-noor.v1' as const;
export const SEED_LEDGER_MIGRATION_VERSION = 'r002b.seed-ledger.v1' as const;

export type Schema3Persistence = 'synthetic_in_memory' | 'ambiguous' | 'durable_or_real';

export interface Schema3MangroveProgressEvidence {
  readonly landscapeId: 'mangrove';
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
  readonly nextThreshold: 20 | 60 | 120 | 200 | null;
}

export interface Schema3SeedAuditInput {
  readonly schemaVersion: number;
  readonly fixtureVersion: string;
  readonly persistence: Schema3Persistence;
  readonly profileId: string;
  readonly activeProfileId: string;
  readonly profileEpochId: string;
  readonly activeResetEpochId: string;
  readonly profileOrigin: string;
  readonly openingEarnedSeeds: number;
  readonly recognitionLedgerEntryCount: number;
  readonly mangroveProgress: Schema3MangroveProgressEvidence | null;
}

export type Schema3SeedEligibility = 'salem_opening_and_carry_forward' | 'alya_opening_only';

export interface Schema3SeedAudit {
  readonly schemaVersion: 3;
  readonly fixtureVersion: typeof SCHEMA3_R002A_FIXTURE_VERSION;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly syntheticOnly: true;
  readonly openingSeeds: 48 | 36;
  readonly currentMangroveSeeds: 48 | null;
  readonly recognitionLedgerEntryCount: 0;
  readonly historicalStage60: 'not_recorded';
  readonly ledgerReconciliation: 'opening_balance_missing';
  readonly approvedCarryForwardSeeds: 60 | null;
  readonly eligibility: Schema3SeedEligibility;
  readonly sourceFingerprint: string;
}

export type ProgressionErrorCode =
  | 'INVALID_INPUT'
  | 'UNSUPPORTED_SCHEMA'
  | 'FIXTURE_VERSION_MISMATCH'
  | 'NON_SYNTHETIC_SOURCE'
  | 'AMBIGUOUS_SOURCE'
  | 'UNSUPPORTED_PROFILE'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'FIXTURE_EVIDENCE_MISMATCH'
  | 'FINGERPRINT_CONFLICT'
  | 'EVENT_CONFLICT';

export interface ProgressionError {
  readonly code: ProgressionErrorCode;
  readonly message: string;
}

export type ProgressionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ProgressionError };

export type ProgressionEventKind = 'opening_balance' | 'legacy_carry_forward' | 'task_recognition';

export type SeedLedgerProvenanceSource =
  'schema3_profile_scalar' | 'approved_synthetic_stage_assumption' | 'recognition_receipt';

export interface SeedLedgerProvenance {
  readonly fixtureVersion: string;
  readonly source: SeedLedgerProvenanceSource;
  readonly sourceIds: readonly string[];
  readonly sourceFingerprint: string;
}

export interface SeedLedgerEntry {
  readonly id: string;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly kind: ProgressionEventKind;
  readonly amount: number;
  readonly status: 'committed';
  readonly committedAt: string | null;
  readonly silentBackfill: boolean;
  readonly provenance: SeedLedgerProvenance;
}

export interface ProgressionMigrationReceipt {
  readonly id: string;
  readonly migrationVersion: typeof SEED_LEDGER_MIGRATION_VERSION;
  readonly fixtureVersion: typeof SCHEMA3_R002A_FIXTURE_VERSION;
  readonly profileId: 'child_salem';
  readonly profileEpochId: string;
  readonly sourceFingerprint: string;
  readonly status: 'applied';
  readonly entryIds: readonly [string, string];
  readonly appliedAt: string;
  readonly syntheticOnly: true;
  readonly silentBackfill: true;
}

export interface PlantStageArchive {
  readonly id: string;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly landscapeId: 'mangrove';
  readonly threshold: 60;
  readonly seedsBefore: 48;
  readonly seedsAfter: 60;
  readonly stageBefore: 'shoot';
  readonly stageAfter: 'sapling';
  readonly triggerEventId: string;
  readonly symbolicOnly: true;
}

export interface SeedLedgerState {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly entries: readonly SeedLedgerEntry[];
  readonly migrationReceipts: readonly ProgressionMigrationReceipt[];
  readonly plantStageArchives: readonly PlantStageArchive[];
}

export interface SeedLedgerNormalization {
  readonly disposition: 'applied' | 'already_applied';
  readonly ledger: SeedLedgerState;
  readonly receipt: ProgressionMigrationReceipt | null;
}

export interface MangroveRecognitionTransition {
  readonly landscapeId: 'mangrove';
  readonly seedsBefore: number;
  readonly seedsAfter: number;
  readonly stageBefore: GardenStage;
  readonly stageAfter: GardenStage;
  readonly crossedThreshold: 20 | 60 | 120 | 200 | null;
  readonly symbolicOnly: true;
}

export interface RecognitionSeedProjectionInput {
  readonly ledger: SeedLedgerState;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly recognitionKey: string;
  readonly seedTransactionId: string;
  readonly amount: FixedSeedAward;
  readonly committedAt: string;
  readonly fixtureVersion: string;
  readonly mangroveTransition: MangroveRecognitionTransition | null;
}

export interface RecognitionSeedProjection {
  readonly disposition: 'projected' | 'already_projected';
  readonly ledger: SeedLedgerState;
  readonly entry: SeedLedgerEntry;
  readonly archive: PlantStageArchive | null;
}

export type ImpactPathThreshold = 120 | 132 | 144 | 156 | 168 | 180;

export type ImpactPathStationResult =
  | 'archive_mangrove_and_earn_expanding_shade'
  | 'unlock_mangrove_roots_learning'
  | 'unlock_coastal_ripple_cosmetic'
  | 'evaluate_water_care_bud'
  | 'unlock_jubail_learning_story'
  | 'earn_coastal_care_and_reveal_configured_next_stage';

export interface ImpactPathStation {
  readonly threshold: ImpactPathThreshold;
  readonly result: ImpactPathStationResult;
}

export const IMPACT_PATH_STATIONS: readonly ImpactPathStation[] = Object.freeze([
  Object.freeze({ threshold: 120, result: 'archive_mangrove_and_earn_expanding_shade' }),
  Object.freeze({ threshold: 132, result: 'unlock_mangrove_roots_learning' }),
  Object.freeze({ threshold: 144, result: 'unlock_coastal_ripple_cosmetic' }),
  Object.freeze({ threshold: 156, result: 'evaluate_water_care_bud' }),
  Object.freeze({ threshold: 168, result: 'unlock_jubail_learning_story' }),
  Object.freeze({ threshold: 180, result: 'earn_coastal_care_and_reveal_configured_next_stage' }),
]);

export interface WaterAndCoastPathProjection {
  readonly lifetimeSeeds: number;
  readonly reachedThresholds: readonly ImpactPathThreshold[];
  readonly nextThreshold: ImpactPathThreshold | null;
  readonly chapterState: 'not_entered' | 'active' | 'completed';
}
