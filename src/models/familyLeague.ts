import type {
  AgeBand,
  CompletionMode,
  GardenStage,
  LandscapeId,
  LocalizedText,
  SyntheticChildId,
  TaskCategoryId,
  VisibilityScope,
} from './familyGrowth';

export const CHALLENGE_LEAVES_PER_WEEK = 5 as const;

export type LeagueParticipantId = 'child_salem' | 'child_alya' | 'cousin_noura';
export type LeagueRelationship = 'sibling' | 'cousin';
export type LeagueTreeAvatarToken = 'mangrove_shoot' | 'ghaf_leaf' | 'sidr_sapling';
export type LeagueTimeZone = 'Asia/Dubai';

export interface SyntheticLeagueParticipant {
  readonly id: LeagueParticipantId;
  readonly relationship: LeagueRelationship;
  readonly nickname: LocalizedText;
  readonly treeAvatarToken: LeagueTreeAvatarToken;
  readonly ageBand: AgeBand;
  readonly invited: true;
  readonly origin: 'synthetic';
}

export interface LeagueProtectedContent {
  readonly prayer: boolean;
  readonly kinship: boolean;
  readonly affection: boolean;
  readonly emotionalDisclosure: boolean;
  readonly relationshipCloseness: boolean;
  readonly foodConsumption: boolean;
  readonly privateWellbeing: boolean;
  readonly hygiene: boolean;
  readonly disabilityRelatedRoutine: boolean;
}

export interface LeagueApprovedTaskReference {
  readonly taskId: string;
  readonly taskVersion: number;
}

export interface ChallengeLeafCandidate {
  readonly id: string;
  readonly participantId: LeagueParticipantId;
  readonly ageBands: readonly AgeBand[];
  readonly approvedTaskRef: LeagueApprovedTaskReference;
  readonly categoryId: TaskCategoryId;
  readonly visibilityScope: VisibilityScope;
  readonly parentApproved: boolean;
  readonly accessibilityAdaptable: boolean;
  readonly protectedContent: LeagueProtectedContent;
}

interface ChallengeLeafBase {
  readonly id: string;
  readonly weekKey: string;
  readonly participantId: LeagueParticipantId;
  readonly ageBand: AgeBand;
  readonly approvedTaskRef: LeagueApprovedTaskReference;
  readonly categoryId: TaskCategoryId;
  readonly visibilityScope: 'household';
  readonly parentApproved: true;
  readonly accessibilityAdaptable: true;
  readonly protectedContent: LeagueProtectedContent;
}

export interface AssignedChallengeLeaf extends ChallengeLeafBase {
  readonly state: 'assigned';
  readonly recognitionKey: null;
  readonly completionMode: null;
  readonly accessibilityAdapted: false;
}

export interface ConfirmedChallengeLeaf extends ChallengeLeafBase {
  readonly state: 'confirmed';
  readonly recognitionKey: string;
  readonly completionMode: CompletionMode;
  readonly accessibilityAdapted: boolean;
}

export type ChallengeLeaf = AssignedChallengeLeaf | ConfirmedChallengeLeaf;

export type LeagueEligibilityRejectionReason =
  | 'unknown_participant'
  | 'not_parent_approved'
  | 'not_accessibility_adaptable'
  | 'age_incompatible'
  | 'private_activity'
  | 'protected_category'
  | 'protected_content';

export type LeagueEligibilityDecision =
  | { readonly eligible: true; readonly reason: null }
  | { readonly eligible: false; readonly reason: LeagueEligibilityRejectionReason };

export interface LeagueConfirmationLedgerEntry {
  readonly recognitionKey: string;
  readonly leafId: string;
  readonly participantId: LeagueParticipantId;
}

export type PreparedLeagueEncouragementId = 'great_growing' | 'keep_growing' | 'one_leaf_together';

export interface PreparedEncouragement {
  readonly id: string;
  readonly weekKey: string;
  readonly senderId: LeagueParticipantId;
  readonly recipientId: LeagueParticipantId;
  readonly phraseId: PreparedLeagueEncouragementId;
  readonly text: LocalizedText;
  readonly origin: 'prepared';
}

export interface FamilyLeagueWeek {
  readonly weekKey: string;
  readonly timeZone: LeagueTimeZone;
  readonly invitedParticipants: readonly SyntheticLeagueParticipant[];
  readonly optedOutParticipantIds: readonly LeagueParticipantId[];
  readonly leaves: readonly ChallengeLeaf[];
  readonly confirmationLedger: Readonly<Record<string, LeagueConfirmationLedgerEntry>>;
  readonly cooperativeConfirmedCount: number;
  readonly cooperativeGoal: number;
  readonly preparedEncouragementLedger: readonly PreparedEncouragement[];
  readonly origin: 'synthetic_local';
}

export interface CreateLeagueWeekInput {
  readonly weekKey: string;
  readonly timeZone: LeagueTimeZone;
  readonly optedOutParticipantIds: readonly LeagueParticipantId[];
  readonly leaves: readonly ChallengeLeafCandidate[];
}

export interface ConfirmChallengeLeafInput {
  readonly week: FamilyLeagueWeek;
  readonly leafId: string;
  readonly recognitionKey: string;
  readonly completionMode: CompletionMode;
  readonly accessibilityAdapted: boolean;
}

export interface WeeklyGrowthResult {
  readonly participantId: LeagueParticipantId;
  readonly completedLeafCount: number;
  readonly score: number;
  readonly position: number;
}

export interface LeagueProjectionCandidate extends WeeklyGrowthResult {
  readonly protectedContentPresent: false;
}

export interface LeagueProjectionInput {
  readonly participants: readonly LeagueProjectionCandidate[];
}

export interface LeagueParticipantProjection {
  readonly nickname: LocalizedText;
  readonly treeAvatarToken: LeagueTreeAvatarToken;
  readonly completedLeafCount: number;
  readonly score: number;
  readonly position: number;
}

export interface PreparedEncouragementInput {
  readonly week: FamilyLeagueWeek;
  readonly senderId: LeagueParticipantId;
  readonly recipientId: LeagueParticipantId;
  readonly phraseId: PreparedLeagueEncouragementId;
}

export interface PreparedEncouragementApplication {
  readonly week: FamilyLeagueWeek;
  readonly encouragement: PreparedEncouragement;
}

export interface LeaguePermanentLandscapeProgress {
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
}

export interface LeaguePermanentProgressSnapshot {
  readonly earnedSeedsByChild: Readonly<Record<SyntheticChildId, number>>;
  readonly gardenByLandscape: Readonly<Record<LandscapeId, LeaguePermanentLandscapeProgress>>;
}

export interface LeagueRolloverInput {
  readonly currentWeek: FamilyLeagueWeek;
  readonly nextWeekKey: string;
  readonly timeZone: LeagueTimeZone;
  readonly permanentProgressBefore: LeaguePermanentProgressSnapshot;
  readonly permanentProgressAfter: LeaguePermanentProgressSnapshot;
}

export interface LeagueRolloverResult {
  readonly week: FamilyLeagueWeek;
  readonly permanentProgress: LeaguePermanentProgressSnapshot;
  readonly permanentProgressUnchanged: true;
}
