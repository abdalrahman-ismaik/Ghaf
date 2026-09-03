import type { ParentAccessSession, ParentOnboardingDraft } from '../../models/familyGrowth';

// This deterministic demo code is not a credential or production verification mechanism.
export const PARENT_VERIFICATION_CODE = '424242' as const;

export function createInitialParentAccess(): ParentAccessSession {
  return {
    state: 'signed_out',
    normalizedIdentifier: null,
    identifierKind: null,
    maskedDestination: null,
    origin: 'synthetic',
    delivery: null,
    offlineFallbackUsed: false,
    returnGate: 'pin',
    productionAuthentication: false,
  };
}

export function createInitialParentOnboardingDraft(): ParentOnboardingDraft {
  return {
    familyName: 'عائلة النخلة',
    appLanguage: 'ar',
    child: {
      nickname: 'سالم',
      avatarId: 'ghaf_tree',
      ageBand: '9_11',
      preferredLanguage: 'ar',
      accessibilityDefaults: ['simpler_instructions'],
    },
  };
}
