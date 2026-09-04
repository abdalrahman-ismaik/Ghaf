import type { SyntheticChildId } from './familyGrowth';

export const ACCESS_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const PAIRING_TTL_MS = 5 * 60 * 1000;
export const REAUTHENTICATION_TTL_MS = 2 * 60 * 1000;

export type SyntheticHouseholdId = 'household_al_noor';
export type SyntheticParentId = 'parent_al_noor';
export type AccessCapabilityTruth = 'local_prototype_not_authentication';
export type LanguagePreference = 'ar' | 'en' | 'bilingual';

export type ParentCapability =
  | 'enter_parent_experience'
  | 'view_parent_reports'
  | 'manage_tasks'
  | 'confirm_tasks'
  | 'manage_family_rewards'
  | 'manage_league_membership'
  | 'manage_child_permissions'
  | 'manage_child_devices';

export type ChildCapability =
  | 'enter_child_experience'
  | 'view_own_tasks'
  | 'submit_own_tasks'
  | 'view_own_rewards'
  | 'view_own_league'
  | 'view_own_permissions'
  | 'use_task_coach'
  | 'use_prepared_media';

export type AccessCapability = ParentCapability | ChildCapability;

export const PARENT_CAPABILITIES: readonly ParentCapability[] = Object.freeze([
  'enter_parent_experience',
  'view_parent_reports',
  'manage_tasks',
  'confirm_tasks',
  'manage_family_rewards',
  'manage_league_membership',
  'manage_child_permissions',
  'manage_child_devices',
]);

export const CHILD_CAPABILITIES: readonly ChildCapability[] = Object.freeze([
  'enter_child_experience',
  'view_own_tasks',
  'submit_own_tasks',
  'view_own_rewards',
  'view_own_league',
  'view_own_permissions',
  'use_task_coach',
  'use_prepared_media',
]);

export interface SyntheticParentAccessFixture {
  readonly fixtureId: 'parent_access_al_noor_v1';
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly verificationKind: 'deterministic_parent_fixture';
  readonly origin: 'synthetic';
}

export interface SyntheticChildCredentialFixture {
  readonly fixtureId: 'child_access_salem_v1' | 'child_access_alya_v1';
  readonly childId: SyntheticChildId;
  readonly householdId: SyntheticHouseholdId;
  readonly avatarId: 'avatar_salem_ghaf' | 'avatar_alya_sidr';
  readonly verificationKind: 'avatar_pin_fixture' | 'avatar_picture_sequence_fixture';
  readonly origin: 'synthetic';
}

export const SYNTHETIC_PARENT_ACCESS_FIXTURE: SyntheticParentAccessFixture = Object.freeze({
  fixtureId: 'parent_access_al_noor_v1',
  parentId: 'parent_al_noor',
  householdId: 'household_al_noor',
  verificationKind: 'deterministic_parent_fixture',
  origin: 'synthetic',
});

export const SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID =
  'parent_reauthentication_al_noor_v1' as const;

export const SYNTHETIC_CHILD_CREDENTIAL_FIXTURES: Readonly<
  Record<SyntheticChildId, SyntheticChildCredentialFixture>
> = Object.freeze({
  child_salem: Object.freeze({
    fixtureId: 'child_access_salem_v1',
    childId: 'child_salem',
    householdId: 'household_al_noor',
    avatarId: 'avatar_salem_ghaf',
    verificationKind: 'avatar_pin_fixture',
    origin: 'synthetic',
  }),
  child_alya: Object.freeze({
    fixtureId: 'child_access_alya_v1',
    childId: 'child_alya',
    householdId: 'household_al_noor',
    avatarId: 'avatar_alya_sidr',
    verificationKind: 'avatar_picture_sequence_fixture',
    origin: 'synthetic',
  }),
});

export interface SyntheticParentPrincipal {
  readonly role: 'parent';
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly fixtureId: SyntheticParentAccessFixture['fixtureId'];
  readonly origin: 'synthetic';
}

export interface SyntheticChildPrincipal {
  readonly role: 'child';
  readonly childId: SyntheticChildId;
  readonly householdId: SyntheticHouseholdId;
  readonly avatarId: SyntheticChildCredentialFixture['avatarId'];
  readonly credentialFixtureId: SyntheticChildCredentialFixture['fixtureId'];
  readonly origin: 'synthetic';
}

export type SyntheticPrincipal = SyntheticParentPrincipal | SyntheticChildPrincipal;

interface BaseAccessSession {
  readonly id: string;
  readonly householdId: SyntheticHouseholdId;
  readonly deviceId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface ParentAccessSession extends BaseAccessSession {
  readonly sessionKind: 'parent';
  readonly principal: SyntheticParentPrincipal;
  readonly capabilities: readonly ParentCapability[];
}

export interface ChildAccessSession extends BaseAccessSession {
  readonly sessionKind: 'child';
  readonly principal: SyntheticChildPrincipal;
  readonly capabilities: readonly ChildCapability[];
}

export type AccessSession = ParentAccessSession | ChildAccessSession;

export interface ParentAccessView {
  readonly viewKind: 'parent';
  readonly sessionId: string;
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly deviceId: string;
  readonly capabilities: readonly ParentCapability[];
  readonly reportAccess: 'parent_only';
  readonly permissionManagement: 'parent_only';
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface ChildAccessView {
  readonly viewKind: 'child';
  readonly sessionId: string;
  readonly childId: SyntheticChildId;
  readonly householdId: SyntheticHouseholdId;
  readonly deviceId: string;
  readonly avatarId: SyntheticChildCredentialFixture['avatarId'];
  readonly capabilities: readonly ChildCapability[];
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export type AccessView = ParentAccessView | ChildAccessView;

export type PairingStatus = 'pending' | 'approved' | 'consumed' | 'expired' | 'revoked';

export interface PairingRequest {
  readonly id: string;
  readonly pairingCode: string;
  readonly householdId: SyntheticHouseholdId;
  readonly childId: SyntheticChildId;
  readonly requestingDeviceId: string;
  readonly requestedAt: string;
  readonly expiresAt: string;
  readonly status: PairingStatus;
  readonly approvedByParentId: SyntheticParentId | null;
  readonly approvedAt: string | null;
  readonly consumedAt: string | null;
  readonly revokedAt: string | null;
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface DeviceAccessState {
  readonly householdId: SyntheticHouseholdId;
  readonly childId: SyntheticChildId;
  readonly deviceId: string;
  readonly pairingRequestId: string;
  readonly status: 'paired' | 'revoked';
  readonly pairedAt: string;
  readonly revokedAt: string | null;
  readonly revokedByParentId: SyntheticParentId | null;
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export type SensitiveActionPurpose =
  | 'create_monetary_family_reward'
  | 'change_monetary_family_reward'
  | 'change_league_membership'
  | 'change_voice_permission'
  | 'change_media_permission'
  | 'change_ai_permission';

export interface ReauthenticationProof {
  readonly id: string;
  readonly parentId: SyntheticParentId;
  readonly parentSessionId: string;
  readonly householdId: SyntheticHouseholdId;
  readonly deviceId: string;
  readonly purpose: SensitiveActionPurpose;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly consumed: boolean;
  readonly consumedAt: string | null;
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface ChildPermissionGrant {
  readonly childId: SyntheticChildId;
  readonly householdId: SyntheticHouseholdId;
  readonly languagePreference: LanguagePreference;
  readonly voiceGranted: boolean;
  readonly mediaGranted: boolean;
  readonly aiGranted: boolean;
  readonly version: number;
  readonly updatedByParentId: SyntheticParentId;
  readonly updatedAt: string;
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export type ChildPermissionChange =
  | { readonly kind: 'language'; readonly value: LanguagePreference }
  | { readonly kind: 'voice'; readonly granted: boolean; readonly proofId: string }
  | { readonly kind: 'media'; readonly granted: boolean; readonly proofId: string }
  | { readonly kind: 'ai'; readonly granted: boolean; readonly proofId: string };

export interface SyntheticParentSignIn {
  readonly sessionId: string;
  readonly parentFixtureId: SyntheticParentAccessFixture['fixtureId'];
  readonly deviceId: string;
  readonly now: string;
}

export interface SyntheticChildSignIn {
  readonly sessionId: string;
  readonly childId: SyntheticChildId;
  readonly childCredentialFixtureId: SyntheticChildCredentialFixture['fixtureId'];
  readonly deviceId: string;
  readonly now: string;
}

export interface ProjectAccessSessionInput {
  readonly session: AccessSession;
  readonly now: string;
}

export interface ParentSessionTermination {
  readonly sessionId: string;
  readonly terminated: true;
  readonly origin: 'synthetic';
}

export interface CapabilityAuthorizationInput extends ProjectAccessSessionInput {
  readonly capability: AccessCapability;
}

export interface CapabilityAuthorization {
  readonly sessionId: string;
  readonly capability: AccessCapability;
  readonly authorized: true;
  readonly origin: 'synthetic';
}

export interface PairingRequestInput {
  readonly requestId: string;
  readonly pairingCode: string;
  readonly childId: SyntheticChildId;
  readonly requestingDeviceId: string;
  readonly now: string;
}

export interface PairingApprovalInput {
  readonly requestId: string;
  readonly childId: SyntheticChildId;
  readonly requestingDeviceId: string;
  readonly parentSession: AccessSession;
  readonly now: string;
}

export interface PairingRevocationInput {
  readonly requestId: string;
  readonly childId: SyntheticChildId;
  readonly requestingDeviceId: string;
  readonly parentSession: AccessSession;
  readonly now: string;
}

export interface PairingConsumptionInput {
  readonly requestId: string;
  readonly pairingCode: string;
  readonly childId: SyntheticChildId;
  readonly deviceId: string;
  readonly childCredentialFixtureId: SyntheticChildCredentialFixture['fixtureId'];
  readonly sessionId: string;
  readonly now: string;
}

export interface DeviceRevocationInput {
  readonly parentSession: AccessSession;
  readonly childId: SyntheticChildId;
  readonly deviceId: string;
  readonly now: string;
}

export interface ReauthenticationInput {
  readonly proofId: string;
  readonly parentSession: AccessSession;
  readonly reauthenticationFixtureId: typeof SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID;
  readonly purpose: SensitiveActionPurpose;
  readonly now: string;
}

export interface SensitiveActionInput {
  readonly proofId: string;
  readonly parentSession: AccessSession;
  readonly purpose: SensitiveActionPurpose;
  readonly now: string;
}

export interface PermissionUpdateInput {
  readonly parentSession: AccessSession;
  readonly childId: SyntheticChildId;
  readonly expectedVersion: number;
  readonly change: ChildPermissionChange;
  readonly now: string;
}

export interface ChildPermissionQueryInput {
  readonly session: AccessSession;
  readonly childId: SyntheticChildId;
  readonly now: string;
}
