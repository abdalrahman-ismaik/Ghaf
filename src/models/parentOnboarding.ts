import type { LanguagePreference } from './access';
import type { AgeBand, LocaleCode } from './familyGrowth';

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

export interface ParentOnboardingChildDraft {
  readonly nickname: string;
  readonly avatarId: ChildTreeAvatarId;
  readonly ageBand: AgeBand;
  readonly preferredLanguage: ChildPreferredLanguage;
  readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
}

export interface ParentOnboardingDraft {
  readonly familyName: string;
  readonly appLanguage: LocaleCode;
  readonly child: ParentOnboardingChildDraft;
}

export interface ParentOnboardingDraftPatch {
  readonly familyName?: string;
  readonly appLanguage?: LocaleCode;
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
  readonly child: {
    readonly nickname: string;
    readonly avatarId: ChildTreeAvatarId;
    readonly ageBand: AgeBand;
    readonly accessLanguagePreference: LanguagePreference;
    readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
  };
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
