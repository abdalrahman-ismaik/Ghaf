import type { LocaleCode, SyntheticChildId } from './familyGrowth';
import type {
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
  LocalChildGender,
  LocalChildHobby,
  LocalChildInterest,
  LocalSupportPreference,
  NormalizedParentIdentifier,
  ParentOnboardingChildCount,
  ParentIdentifierKind,
} from './parentOnboarding';
import type { FamilyConnectionDirectory } from './familyConnections';

export const LOCAL_FAMILY_SCHEMA_VERSION = 3 as const;
export const LOCAL_FAMILY_STORAGE_KEY = 'ghaf.local-family.v3' as const;
export const PREVIOUS_LOCAL_FAMILY_STORAGE_KEY = 'ghaf.local-family.v2' as const;
export const LEGACY_LOCAL_FAMILY_STORAGE_KEY = 'ghaf.local-family.v1' as const;

export interface LocalChildProfile {
  readonly id: SyntheticChildId;
  readonly role: 'child';
  readonly nickname: string;
  readonly avatarId: ChildTreeAvatarId;
  readonly ageBand: '6_8' | '9_11' | '12_14';
  readonly preferredLanguage: ChildPreferredLanguage;
  readonly gender: LocalChildGender | null;
  readonly interests: readonly LocalChildInterest[];
  readonly hobbies: readonly LocalChildHobby[];
  readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
  readonly supportPreferences: readonly LocalSupportPreference[];
  readonly personalizationEnabled: boolean;
}

export interface LocalFamilyRecord {
  readonly schemaVersion: typeof LOCAL_FAMILY_SCHEMA_VERSION;
  readonly householdId: 'household_al_noor';
  readonly familyConnections: FamilyConnectionDirectory;
  readonly familyName: string;
  readonly appLanguage: LocaleCode;
  readonly parent: {
    readonly id: 'parent_al_noor';
    readonly role: 'parent';
    readonly normalizedIdentifier: string;
    readonly identifierKind: ParentIdentifierKind;
  };
  readonly children: readonly LocalChildProfile[];
  readonly pairedChildIds: readonly SyntheticChildId[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly origin: 'local_demo';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface CreateLocalFamilyRecordInput {
  readonly parentIdentifier: NormalizedParentIdentifier;
  readonly familyConnections: FamilyConnectionDirectory;
  readonly familyName: string;
  readonly appLanguage: LocaleCode;
  readonly children: readonly LocalChildProfile[];
  readonly pairedChildIds: readonly SyntheticChildId[];
  readonly now: string;
}

export interface LocalFamilyView {
  readonly status: 'ready' | 'unavailable';
  readonly record: LocalFamilyRecord | null;
  readonly configuredChildIds: readonly SyntheticChildId[];
  readonly errorCode: 'invalid_or_unavailable_local_data' | null;
  readonly storageTruth: 'device_local_demo_only';
}

export type LocalFamilyChildCount = ParentOnboardingChildCount;
