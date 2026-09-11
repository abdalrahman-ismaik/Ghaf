import type { SyntheticChildId } from './familyGrowth';

export const SHARED_GROWTH_SCHEMA_VERSION = 'r002b.shared-growth.v1' as const;

export type SharedGrowthHouseholdId = 'household_al_noor';
export type SharedGrowthParentId = 'parent_al_noor';
export type SharedGrowthParticipationStatus = 'continued' | 'paused' | 'ended';
export type SharedGrowthParticipationAction =
  'continue' | 'pause_new_contributions' | 'end_participation';

export interface ParentSharedGrowthConsentReceipt {
  readonly id: string;
  readonly version: number;
  readonly parentId: SharedGrowthParentId;
  readonly householdId: SharedGrowthHouseholdId;
  readonly participationEpochId: string;
  readonly status: 'explicit_parent_consent';
  readonly grantedAt: string;
  readonly supersedesEndActionId: string | null;
  readonly origin: 'synthetic';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface ParentSharedGrowthReauthenticationReference {
  readonly id: string;
  readonly purpose: 'change_shared_growth_participation';
  readonly status: 'verified';
  readonly parentId: SharedGrowthParentId;
  readonly householdId: SharedGrowthHouseholdId;
  readonly participationEpochId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly consumed: false;
  readonly origin: 'synthetic';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface ParentSharedGrowthAuthority {
  readonly role: 'parent';
  readonly parentId: SharedGrowthParentId;
  readonly householdId: SharedGrowthHouseholdId;
  readonly participationEpochId: string;
  readonly capability: 'manage_shared_growth_contribution';
  readonly reauthentication: ParentSharedGrowthReauthenticationReference;
  readonly origin: 'synthetic';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface SharedGrowthParticipationActionReceipt {
  readonly id: string;
  readonly action: SharedGrowthParticipationAction;
  readonly fromStatus: SharedGrowthParticipationStatus;
  readonly toStatus: SharedGrowthParticipationStatus;
  readonly actedAt: string;
  readonly parentId: SharedGrowthParentId;
  readonly reauthenticationId: string;
  readonly consentReceiptId: string | null;
  readonly effect: 'future_signals_only';
  readonly requestFingerprint: string;
}

export interface CommunityParticipationPreference {
  readonly schemaVersion: typeof SHARED_GROWTH_SCHEMA_VERSION;
  readonly householdId: SharedGrowthHouseholdId;
  readonly participationEpochId: string;
  readonly status: SharedGrowthParticipationStatus;
  readonly activeConsentReceiptId: string | null;
  readonly acceptingSignalsSince: string | null;
  readonly consentReceipts: readonly ParentSharedGrowthConsentReceipt[];
  readonly invalidatedConsentReceiptIds: readonly string[];
  readonly actionHistory: readonly SharedGrowthParticipationActionReceipt[];
  readonly revision: number;
  readonly origin: 'synthetic_local';
}

export type SharedGrowthSignalTheme =
  'coastal_habitat_care' | 'water_stewardship' | 'native_canopy_care';

export interface AnonymousSharedGrowthSignal {
  readonly id: string;
  readonly householdId: SharedGrowthHouseholdId;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly consentReceiptId: string | null;
  readonly theme: SharedGrowthSignalTheme;
  readonly observedAt: string;
  readonly source: 'prepared_synthetic_signal';
  readonly privacy: 'anonymous_qualitative_only';
}

export interface ActiveSharedGrowthProfile {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
}

export interface SharedGrowthState {
  readonly schemaVersion: typeof SHARED_GROWTH_SCHEMA_VERSION;
  readonly preference: CommunityParticipationPreference;
  readonly signalHistory: readonly AnonymousSharedGrowthSignal[];
  readonly origin: 'synthetic_local';
}

export type SharedGrowthScene = 'coastal_canopy';
export type SharedGrowthObservationOutlook = 'continuing' | 'taking_root' | 'growing_gently';

export interface SharedGrowthQualitativeObservation {
  readonly theme: SharedGrowthSignalTheme;
  readonly outlook: SharedGrowthObservationOutlook;
}

export interface SharedGrowthQualitativeAggregate {
  readonly availability: 'ready' | 'unavailable';
  readonly scene: SharedGrowthScene;
  readonly observations: readonly SharedGrowthQualitativeObservation[];
  readonly origin: 'prepared_synthetic';
  readonly privacy: 'anonymous_qualitative';
}

export interface SharedGrowthChildView {
  readonly availability: SharedGrowthQualitativeAggregate['availability'];
  readonly scene: SharedGrowthScene;
  readonly observations: readonly SharedGrowthQualitativeObservation[];
  readonly origin: 'synthetic_local';
  readonly privacy: 'anonymous_qualitative';
  readonly viewing: 'available';
  readonly participation: SharedGrowthParticipationStatus;
  readonly contributionPrompt: 'none';
}

export interface CreateSharedGrowthStateInput {
  readonly householdId: SharedGrowthHouseholdId;
  readonly participationEpochId: string;
  readonly initialConsent: ParentSharedGrowthConsentReceipt;
}

export interface ApplySharedGrowthParticipationActionInput {
  readonly state: SharedGrowthState;
  readonly actionId: string;
  readonly action: SharedGrowthParticipationAction;
  readonly actedAt: string;
  readonly authority: ParentSharedGrowthAuthority;
  readonly freshConsent: ParentSharedGrowthConsentReceipt | null;
}

export interface RecordSharedGrowthSignalInput {
  readonly state: SharedGrowthState;
  readonly activeProfile: ActiveSharedGrowthProfile;
  readonly signal: AnonymousSharedGrowthSignal;
}

export interface ProjectSharedGrowthViewInput {
  readonly aggregate: SharedGrowthQualitativeAggregate;
  readonly preference: CommunityParticipationPreference;
}

export type SharedGrowthSignalNotRecordedReason =
  'participation_paused' | 'participation_ended' | 'outside_active_contribution_window';

export interface SharedGrowthParticipationActionResult {
  readonly disposition: 'applied' | 'already_applied';
  readonly state: SharedGrowthState;
}

export type SharedGrowthSignalResult =
  | {
      readonly disposition: 'recorded' | 'already_recorded';
      readonly reason: null;
      readonly state: SharedGrowthState;
    }
  | {
      readonly disposition: 'not_recorded';
      readonly reason: SharedGrowthSignalNotRecordedReason;
      readonly state: SharedGrowthState;
    };

export type SharedGrowthErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_STATE'
  | 'PRIVACY_VIOLATION'
  | 'PARENT_AUTHORITY_REQUIRED'
  | 'REAUTHENTICATION_REQUIRED'
  | 'SCOPE_MISMATCH'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'INVALID_TRANSITION'
  | 'ACTION_CONFLICT'
  | 'AUTHORITY_CONFLICT'
  | 'CONSENT_REQUIRED'
  | 'CONSENT_CONFLICT'
  | 'SIGNAL_CONFLICT';

export interface SharedGrowthError {
  readonly code: SharedGrowthErrorCode;
  readonly message: string;
}

export type SharedGrowthResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: SharedGrowthError };
