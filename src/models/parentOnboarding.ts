import type {
  AccessCapabilityTruth,
  LanguagePreference,
  SyntheticHouseholdId,
  SyntheticParentId,
} from './access';
import type { AgeBand, LocaleCode, SyntheticChildId } from './familyGrowth';

export type ParentIdentifierKind = 'phone' | 'email';

export interface NormalizedParentIdentifier {
  readonly normalizedIdentifier: string;
  readonly identifierKind: ParentIdentifierKind;
  readonly maskedDestination: string;
}

export type ChildTreeAvatarId = 'ghaf_tree' | 'leaf' | 'flower' | 'energy_leaf' | 'water_drop';

export type ChildPreferredLanguage = LocaleCode | 'both';

export type BasicAccessibilityDefault =
  'larger_text' | 'simpler_instructions' | 'high_contrast' | 'reduced_motion';

export type ParentOnboardingChildCount = 1 | 2;
export type LocalChildGender = 'boy' | 'girl' | 'prefer_not_to_say';
export type LocalChildInterest =
  'nature' | 'making' | 'stories' | 'family_helping' | 'sustainability';
export type LocalChildHobby = 'drawing' | 'reading' | 'sports' | 'puzzles' | 'gardening';
export type LocalSupportPreference =
  'short_steps' | 'visual_examples' | 'extra_time' | 'adult_alongside' | 'quiet_reminders';

export interface ParentOnboardingChildDraft {
  readonly profileId: SyntheticChildId;
  readonly nickname: string;
  readonly avatarId: ChildTreeAvatarId;
  readonly ageBand: AgeBand;
  readonly preferredLanguage: ChildPreferredLanguage;
  readonly gender: LocalChildGender | null;
  readonly interests: readonly LocalChildInterest[];
  readonly hobbies: readonly LocalChildHobby[];
  readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
  readonly supportPreferences: readonly LocalSupportPreference[];
  readonly personalizationEnabled: boolean;
}

export interface ParentOnboardingDraft {
  readonly familyName: string;
  readonly appLanguage: LocaleCode;
  readonly childCount: ParentOnboardingChildCount;
  readonly children: readonly ParentOnboardingChildDraft[];
}

export interface ParentOnboardingDraftPatch {
  readonly familyName?: string;
  readonly appLanguage?: LocaleCode;
  readonly childCount?: ParentOnboardingChildCount;
  readonly childIndex?: number;
  readonly child?: Partial<ParentOnboardingChildDraft>;
}

export type ParentOnboardingStatus =
  'signed_out' | 'code_sent' | 'verifying' | 'verified' | 'authenticated_parent';

export interface ParentOnboardingCompletionReceipt {
  readonly receiptId: 'parent_onboarding_al_noor_r001_v1';
  readonly completedAt: string;
  readonly destination: '/parent';
  readonly householdId: 'household_al_noor';
  readonly familyName: string;
  readonly appLanguage: LocaleCode;
  readonly childCount: ParentOnboardingChildCount;
  readonly children: readonly {
    readonly profileId: SyntheticChildId;
    readonly nickname: string;
    readonly avatarId: ChildTreeAvatarId;
    readonly ageBand: AgeBand;
    readonly preferredLanguage: ChildPreferredLanguage;
    readonly accessLanguagePreference: LanguagePreference;
    readonly gender: LocalChildGender | null;
    readonly interests: readonly LocalChildInterest[];
    readonly hobbies: readonly LocalChildHobby[];
    readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
    readonly supportPreferences: readonly LocalSupportPreference[];
    readonly personalizationEnabled: boolean;
  }[];
  readonly origin: 'synthetic';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface ParentOnboardingView {
  readonly status: ParentOnboardingStatus;
  readonly identifierKind: ParentIdentifierKind | null;
  readonly maskedDestination: string | null;
  readonly delivery: 'local_fixture' | null;
  readonly offlineFallbackUsed: boolean;
  readonly productionAuthentication: false;
  readonly capabilityTruth: 'local_prototype_not_authentication';
  readonly returnGate: 'pin';
  readonly canEnterParentExperience: boolean;
  readonly draft: ParentOnboardingDraft;
  readonly completionReceipt: ParentOnboardingCompletionReceipt | null;
  readonly origin: 'synthetic';
}

export interface ParentOnboardingHandoff {
  readonly authorized: true;
  readonly capability: 'enter_parent_experience';
  readonly destination: '/parent';
  readonly receiptId: ParentOnboardingCompletionReceipt['receiptId'];
  readonly origin: 'synthetic';
}

export interface ParentReportHandoff {
  readonly authorized: true;
  readonly role: 'parent';
  readonly capability: 'view_parent_reports';
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly authorizedProfileIds: readonly SyntheticChildId[];
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface ParentSharedGrowthAccessHandoff {
  readonly authorized: true;
  readonly role: 'parent';
  readonly capability: 'manage_shared_growth_contribution';
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly participationEpochId: string;
  readonly reauthentication: {
    readonly id: string;
    readonly purpose: 'change_shared_growth_participation';
    readonly status: 'verified';
    readonly issuedAt: string;
    readonly expiresAt: string;
    readonly consumedByAccessService: true;
    readonly origin: 'synthetic';
    readonly capabilityTruth: AccessCapabilityTruth;
  };
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}
