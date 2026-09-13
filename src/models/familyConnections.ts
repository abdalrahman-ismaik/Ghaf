export const FAMILY_RELATIVE_IDS = [
  'relative_1',
  'relative_2',
  'relative_3',
  'relative_4',
  'relative_5',
  'relative_6',
] as const;

export type FamilyRelativeId = (typeof FAMILY_RELATIVE_IDS)[number];
export type FamilyRelationship = 'grandmother' | 'grandfather' | 'aunt' | 'uncle';
export type FamilyConnectionRhythm = 'weekly' | 'monthly' | 'every_three_months' | 'no_schedule';

export interface NamedFamilyRelative {
  readonly id: FamilyRelativeId;
  readonly displayName: string;
  readonly relationship: FamilyRelationship;
  readonly rhythm: FamilyConnectionRhythm;
}

export interface FamilyConnectionDirectory {
  readonly primaryGuardianName: string;
  readonly secondaryGuardianName: string;
  readonly relatives: readonly NamedFamilyRelative[];
}

export type FamilyConnectionIdeaKind =
  'visit_or_call' | 'family_story' | 'safe_help' | 'thank_you_message' | 'phone_free_moment';

export interface FamilyConnectionPlanEntry {
  readonly relativeId: FamilyRelativeId;
  readonly displayName: string;
  readonly relationship: FamilyRelationship;
  readonly rhythm: FamilyConnectionRhythm;
  readonly ideaKind: FamilyConnectionIdeaKind;
  readonly remoteAlternativeId: 'call_or_message';
  readonly recognitionMode: 'recognition_only';
  readonly requiresParentReview: true;
  readonly childMayChooseOrSkip: true;
  readonly schedulingAuthority: 'none';
  readonly progressEffects: 'none';
  readonly origin: 'prepared_local';
}

export interface FamilyConnectionPlan {
  readonly guardianDisplayNames: readonly string[];
  readonly entries: readonly FamilyConnectionPlanEntry[];
  readonly origin: 'prepared_local';
  readonly localOnly: true;
}
