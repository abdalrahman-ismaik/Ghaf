import type { BadgeId } from './achievements';
import type {
  FixedSeedAward,
  GardenStage,
  LandscapeId,
  LocalizedText,
  SyntheticChildId,
} from './familyGrowth';
import type { ImpactPathStationResult, ImpactPathThreshold } from './growthJourney';

export const REVEAL_BUNDLE_SCHEMA_VERSION = 'r002b.reveal-bundle.v1' as const;

export type RevealTriggerKind = 'task_approval' | 'learning_completion' | 'task_submission';
export type EligibleRevealTriggerKind = Exclude<RevealTriggerKind, 'task_submission'>;
export type RevealBundleLifecycle = 'ready' | 'presenting' | 'acknowledged' | 'archived';

export type RevealAuthority =
  | 'parent_check_in'
  | 'seed_ledger'
  | 'garden'
  | 'canopy'
  | 'green_circle'
  | 'private_league'
  | 'challenge_leaf'
  | 'family_reward'
  | 'achievements'
  | 'impact_path'
  | 'learning'
  | 'safe_help';

export interface ParentPraiseConsequence {
  readonly kind: 'parent_praise';
  readonly checkInId: string;
  readonly text: LocalizedText;
}

export interface SeedConsequence {
  readonly kind: 'seed';
  readonly transactionId: string;
  readonly delta: FixedSeedAward;
  readonly before: number;
  readonly after: number;
  readonly meaning: 'symbolic_nonfinancial';
}

export interface PlantStageConsequence {
  readonly kind: 'plant_stage';
  readonly growthId: string;
  readonly landscapeId: LandscapeId;
  readonly seedsBefore: number;
  readonly seedsAfter: number;
  readonly stageBefore: GardenStage;
  readonly stageAfter: GardenStage;
  readonly crossedThreshold: 20 | 60 | 120 | 200 | null;
  readonly symbolicOnly: true;
}

export interface CanopyConsequence {
  readonly kind: 'canopy';
  readonly contributionId: string;
  readonly leavesBefore: number;
  readonly leavesAfter: number;
  readonly leafDelta: 1;
  readonly goalLeaves: 25;
  readonly origin: 'synthetic';
}

export interface GreenCircleConsequence {
  readonly kind: 'green_circle';
  readonly eventId: string;
  readonly actionsBefore: number;
  readonly actionsAfter: number;
  readonly actionDelta: 1;
  readonly goal: 12;
  readonly sourceScope: 'household';
  readonly origin: 'synthetic_local';
}

export interface PrivateLeagueLeafConsequence {
  readonly kind: 'private_league_leaf';
  readonly weekKey: string;
  readonly leagueReceiptId: string;
  readonly leafId: string;
  readonly confirmedLeavesBefore: number;
  readonly confirmedLeavesAfter: number;
  readonly leafDelta: 1;
  readonly privacy: 'private_family_league';
}

export interface ChallengeLeafConsequence {
  readonly kind: 'challenge_leaf';
  readonly weekKey: string;
  readonly leafId: string;
  readonly recognitionKey: string;
  readonly state: 'confirmed';
  readonly privacy: 'private_family_league';
}

export interface PrivateFamilyRewardConsequence {
  readonly kind: 'private_family_reward';
  readonly planId: string;
  readonly planVersion: number;
  readonly lifecycleBefore: 'promised';
  readonly lifecycleAfter: 'unlocked';
  readonly privacy: 'child_guardians_only';
}

export interface EarnedBadgeConsequence {
  readonly kind: 'earned_badge';
  readonly awardId: string;
  readonly badgeId: BadgeId;
  readonly newlyEarned: true;
  readonly earnedAt: string;
  readonly private: true;
  readonly permanent: true;
}

export interface ImpactPathStationConsequence {
  readonly kind: 'impact_path_station';
  readonly threshold: ImpactPathThreshold;
  readonly result: ImpactPathStationResult;
  readonly newlyReached: true;
}

export interface UnlockedLearningConsequence {
  readonly kind: 'unlocked_learning';
  readonly unlockId: string;
  readonly learningId: 'learning.mangrove_roots.v1';
  readonly newlyUnlocked: true;
}

export interface SafeHelpConsequence {
  readonly kind: 'safe_help';
  readonly recognitionId: string;
  readonly helpKind: 'permitted_help' | 'asked_adult';
  readonly recognized: true;
}

export type RevealConsequence =
  | ParentPraiseConsequence
  | SeedConsequence
  | PlantStageConsequence
  | CanopyConsequence
  | GreenCircleConsequence
  | PrivateLeagueLeafConsequence
  | ChallengeLeafConsequence
  | PrivateFamilyRewardConsequence
  | EarnedBadgeConsequence
  | ImpactPathStationConsequence
  | UnlockedLearningConsequence
  | SafeHelpConsequence;

interface CommittedRevealSourceReceiptBase<
  TAuthority extends RevealAuthority,
  TConsequence extends RevealConsequence,
> {
  readonly id: string;
  readonly authority: TAuthority;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly triggerKind: EligibleRevealTriggerKind;
  readonly status: 'committed';
  readonly committedAt: string;
  readonly consequence: TConsequence;
}

export type CommittedRevealSourceReceipt =
  | CommittedRevealSourceReceiptBase<'parent_check_in', ParentPraiseConsequence>
  | CommittedRevealSourceReceiptBase<'seed_ledger', SeedConsequence>
  | CommittedRevealSourceReceiptBase<'garden', PlantStageConsequence>
  | CommittedRevealSourceReceiptBase<'canopy', CanopyConsequence>
  | CommittedRevealSourceReceiptBase<'green_circle', GreenCircleConsequence>
  | CommittedRevealSourceReceiptBase<'private_league', PrivateLeagueLeafConsequence>
  | CommittedRevealSourceReceiptBase<'challenge_leaf', ChallengeLeafConsequence>
  | CommittedRevealSourceReceiptBase<'family_reward', PrivateFamilyRewardConsequence>
  | CommittedRevealSourceReceiptBase<'achievements', EarnedBadgeConsequence>
  | CommittedRevealSourceReceiptBase<'impact_path', ImpactPathStationConsequence>
  | CommittedRevealSourceReceiptBase<'learning', UnlockedLearningConsequence>
  | CommittedRevealSourceReceiptBase<'safe_help', SafeHelpConsequence>;

export interface RevealBundle {
  readonly id: string;
  readonly schemaVersion: typeof REVEAL_BUNDLE_SCHEMA_VERSION;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly triggerKind: EligibleRevealTriggerKind;
  readonly triggeredAt: string;
  readonly lifecycle: RevealBundleLifecycle;
  readonly sourceFingerprint: string;
  readonly items: readonly CommittedRevealSourceReceipt[];
  readonly audience: 'child';
}

export interface RevealBundleQueue {
  readonly schemaVersion: typeof REVEAL_BUNDLE_SCHEMA_VERSION;
  readonly bundles: readonly RevealBundle[];
}

export interface RevealConstructionInput {
  readonly queue: RevealBundleQueue;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly triggerKind: RevealTriggerKind;
  readonly triggeredAt: string;
  readonly receipts: readonly CommittedRevealSourceReceipt[];
}

export interface RevealPresentationScope {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
}

export type RevealNotCreatedReason =
  'zero_reward_submission' | 'no_presentable_consequence' | 'learning_without_new_outcome';

export type RevealConstructionResult =
  | {
      readonly disposition: 'created' | 'already_exists';
      readonly queue: RevealBundleQueue;
      readonly bundle: RevealBundle;
    }
  | {
      readonly disposition: 'not_created';
      readonly reason: RevealNotCreatedReason;
      readonly queue: RevealBundleQueue;
      readonly bundle: null;
    };

export interface RevealLifecycleResult {
  readonly disposition: 'transitioned' | 'already_at_state';
  readonly queue: RevealBundleQueue;
  readonly bundle: RevealBundle;
}

export type RevealPresentationResult =
  | {
      readonly disposition: 'started' | 'resumed';
      readonly queue: RevealBundleQueue;
      readonly bundle: RevealBundle;
    }
  | {
      readonly disposition: 'empty';
      readonly queue: RevealBundleQueue;
      readonly bundle: null;
    };

export type RevealBundleErrorCode =
  | 'INVALID_INPUT'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'TRIGGER_SCOPE_MISMATCH'
  | 'UNCOMMITTED_RECEIPT'
  | 'RECEIPT_CONFLICT'
  | 'BUNDLE_CONFLICT'
  | 'INELIGIBLE_TRIGGER'
  | 'INVALID_TRANSITION'
  | 'BUNDLE_NOT_FOUND'
  | 'QUEUE_CONFLICT';

export interface RevealBundleError {
  readonly code: RevealBundleErrorCode;
  readonly message: string;
}

export type RevealBundleResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: RevealBundleError };
