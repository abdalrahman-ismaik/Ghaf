import type {
  GardenStage,
  LandscapeId,
  LocalizedText,
  RecognitionMode,
  RoutinePhase,
  SyntheticChildId,
  TaskCategoryId,
} from './familyGrowth';

export type FamilyRewardLifecycle = 'promised' | 'unlocked' | 'given';
export type FamilyRewardVersionState = 'current' | 'superseded';
export type FamilyRewardPromiseKind = 'money' | 'experience' | 'privilege' | 'gift';

export type FamilyRewardPromise =
  | {
      readonly kind: 'money';
      readonly label: LocalizedText;
      readonly currency: string;
      readonly amountMinor: number;
    }
  | {
      readonly kind: Exclude<FamilyRewardPromiseKind, 'money'>;
      readonly label: LocalizedText;
    };

export type FamilyRewardMilestone =
  | {
      readonly kind: 'eligible_seed_delta';
      readonly requiredSeedDelta: number;
    }
  | {
      readonly kind: 'landscape_stage';
      readonly landscapeId: LandscapeId;
      readonly targetStage: GardenStage;
    }
  | {
      readonly kind: 'landscapes_at_stage';
      readonly targetStage: GardenStage;
      readonly requiredCount: number;
    };

export interface FamilyRewardPlanDraft {
  readonly id: string;
  readonly childId: SyntheticChildId;
  readonly guardianIds: readonly string[];
  readonly createdByGuardianId: string;
  readonly month: string;
  readonly promisedAt: string;
  readonly promise: FamilyRewardPromise;
  readonly milestone: FamilyRewardMilestone;
}

export interface FamilyRewardPlan extends FamilyRewardPlanDraft {
  readonly version: number;
  readonly previousVersion: number | null;
  readonly versionState: FamilyRewardVersionState;
  readonly supersededAt: string | null;
  readonly lifecycle: FamilyRewardLifecycle;
  readonly privacy: 'child_guardians_only';
  readonly unlockedAt: string | null;
  readonly givenAt: string | null;
}

export type FamilyRewardActivityKind =
  | 'general'
  | 'faith'
  | 'affection'
  | 'emotional_disclosure'
  | 'eating'
  | 'demonstrating_love'
  | 'private_wellbeing';

export interface FamilyRewardRecognitionPrerequisites {
  readonly parentConfirmationRecorded: boolean;
  readonly praisePresented: boolean;
  readonly gardenRecognitionApplied: boolean;
}

export interface EligibleLandscapeTransition {
  readonly landscapeId: LandscapeId;
  readonly stageBefore: GardenStage;
  readonly stageAfter: GardenStage;
}

export interface FamilyRewardEligibilityEvent {
  readonly id: string;
  readonly recognitionKey: string;
  readonly childId: SyntheticChildId;
  readonly categoryId: TaskCategoryId;
  readonly activityKind: FamilyRewardActivityKind;
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly eligibleSeedDelta: number;
  readonly landscapeTransition: EligibleLandscapeTransition;
  readonly occurredAt: string;
  readonly prerequisites: FamilyRewardRecognitionPrerequisites;
}

export interface FamilyRewardProgressSnapshot {
  readonly childId: SyntheticChildId;
  readonly eligibleSeedDelta: number;
  readonly recognitionKeys: readonly string[];
  readonly eligibleLandscapeTransitions: readonly EligibleLandscapeTransition[];
  readonly landscapesCrossingTarget: readonly LandscapeId[];
}

export interface FamilyRewardEvaluationOptions {
  readonly evaluatedAt: string;
}

export type FamilyRewardEvaluationDisposition =
  'not_reached' | 'unlocked' | 'already_unlocked' | 'already_given';

export interface FamilyRewardEvaluation {
  readonly disposition: FamilyRewardEvaluationDisposition;
  readonly plan: FamilyRewardPlan;
  readonly progress: FamilyRewardProgressSnapshot;
}

export interface GiveFamilyRewardInput {
  readonly guardianId: string;
  readonly givenAt: string;
}

export interface FamilyRewardGivenResult {
  readonly disposition: 'given' | 'already_given';
  readonly plan: FamilyRewardPlan;
}

export interface ReviseFamilyRewardPlanInput {
  readonly guardianId: string;
  readonly expectedVersion: number;
  readonly revisedAt: string;
  readonly month: string;
  readonly promise: FamilyRewardPromise;
  readonly milestone: FamilyRewardMilestone;
}

export interface FamilyRewardRevision {
  readonly priorVersion: FamilyRewardPlan;
  readonly revisedPlan: FamilyRewardPlan;
}

export type FamilyRewardViewer =
  | { readonly kind: 'child'; readonly childId: SyntheticChildId }
  | { readonly kind: 'guardian'; readonly guardianId: string };

export interface PrivateFamilyRewardView {
  readonly id: string;
  readonly version: number;
  readonly childId: SyntheticChildId;
  readonly lifecycle: FamilyRewardLifecycle;
  readonly month: string;
  readonly promise: FamilyRewardPromise;
  readonly milestone: FamilyRewardMilestone;
  readonly promisedAt: string;
  readonly unlockedAt: string | null;
  readonly givenAt: string | null;
  readonly privacy: 'child_guardians_only';
}

export interface MonetaryCommitmentSummary {
  readonly month: string;
  readonly currency: string;
  readonly totalAmountMinor: number;
  readonly planCount: number;
}

export interface MonetaryCommitmentRequest {
  readonly guardianId: string;
}

export type FamilyRewardErrorCode =
  | 'INVALID_INPUT'
  | 'PROTECTED_ACTIVITY'
  | 'WRONG_CHILD'
  | 'PREREQUISITE_NOT_MET'
  | 'INVALID_TRANSITION'
  | 'IMMUTABLE_UNLOCKED_PLAN'
  | 'STALE_VERSION'
  | 'NOT_AUTHORIZED';

export interface FamilyRewardError {
  readonly code: FamilyRewardErrorCode;
  readonly message: string;
}

export type FamilyRewardResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: FamilyRewardError };
