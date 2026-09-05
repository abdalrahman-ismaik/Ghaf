import type { LocalizedText, SyntheticChildId } from './familyGrowth';
import type { ImpactPathThreshold } from './growthJourney';

export type MangroveLearningId = 'learning.mangrove_roots.v1';
export type MangroveLearningObjectiveId = 'objective.mangrove_habitat_stewardship.v1';
export type LearningRoute = 'story' | 'accessible';
export type LearningRoutePath =
  | '/garden/learn/learning.mangrove_roots.v1/story'
  | '/garden/learn/learning.mangrove_roots.v1/accessible';

export type LearningContentStepId =
  'story_frame_1' | 'story_frame_2' | 'accessible_section_1' | 'accessible_section_2';

export type LearningCheckId = 'check.mangrove_habitat_stewardship.v1';
export type LearningCheckOptionId = 'habitat_support_and_care' | 'visit_or_task_reward';

export interface BlockedLearningContent {
  readonly status: 'blocked_pending_named_human_review';
  readonly ar: null;
  readonly en: null;
  readonly bilingualParity: 'not_run';
}

export type LearningReviewGateId =
  | 'source_link_and_mutable_fact_revalidation'
  | 'arabic_english_factual_equivalence'
  | 'uae_cultural_and_place_wording'
  | 'child_safeguarding_and_age_comprehension'
  | 'accessible_equal_credit_equivalence'
  | 'original_illustration_and_rights';

export interface LearningReviewGate {
  readonly id: LearningReviewGateId;
  readonly status: 'not_run';
  readonly releaseEffect: 'blocks_release_activation';
  readonly evidence: null;
}

export interface LearningProvenance {
  readonly packageAuthority: 'docs/content/LEARNING_STORIES.md';
  readonly candidateResearchLocation: '96cad3b917f43adad32c491153be54d3ab24f899:docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/report-source.md#E2';
  readonly candidateResearchStatus: 'not_revalidated';
  readonly externalRuntimeDependency: false;
}

export interface LearningRouteDefinition {
  readonly packageId: MangroveLearningId;
  readonly route: LearningRoute;
  readonly routePath: LearningRoutePath;
  readonly reviewedLearningObjectiveId: MangroveLearningObjectiveId;
  readonly completionCreditId: MangroveLearningId;
  readonly contentStepIds: readonly LearningContentStepId[];
  readonly checkId: LearningCheckId;
  readonly content: BlockedLearningContent;
  readonly finite: true;
  readonly noFail: true;
}

export interface MangroveLearningPackageDefinition {
  readonly id: MangroveLearningId;
  readonly title: LocalizedText;
  readonly unlockThreshold: 132;
  readonly reviewedLearningObjectiveId: MangroveLearningObjectiveId;
  readonly completionCreditId: MangroveLearningId;
  readonly finite: true;
  readonly noFail: true;
  readonly autoplayNextLearning: false;
  readonly content: BlockedLearningContent;
  readonly routes: Readonly<Record<LearningRoute, LearningRouteDefinition>>;
  readonly provenance: LearningProvenance;
  readonly reviewGates: readonly LearningReviewGate[];
  readonly release: {
    readonly featureFlag: 'r002b_learning_ui';
    readonly defaultEnabled: false;
    readonly implementation: 'authorized';
    readonly activation: 'blocked';
  };
  readonly capabilities: {
    readonly offline: true;
    readonly requiresGps: false;
    readonly requiresVisitProof: false;
    readonly requiresCamera: false;
    readonly requiresMicrophone: false;
    readonly opensExternalBrowser: false;
    readonly generatedFacts: false;
    readonly liveAi: false;
  };
}

export type ImpactPathLearningFocusTarget =
  'impact-path-learning-station-132' | 'impact-path-learning-card';
export type GardenLearningFocusTarget = 'garden-impact-path-card';
export type TodayCompleteLearningFocusTarget = 'today-complete-heading';

export type LearningOrigin =
  | {
      readonly kind: 'impact_path';
      readonly route: '/garden/impact-path';
      readonly profileId: SyntheticChildId;
      readonly focusTargetId: ImpactPathLearningFocusTarget;
      readonly scrollOffset: number;
    }
  | {
      readonly kind: 'garden';
      readonly route: '/garden';
      readonly profileId: SyntheticChildId;
      readonly focusTargetId: GardenLearningFocusTarget;
      readonly scrollOffset: number;
    }
  | {
      readonly kind: 'today_complete';
      readonly route: '/child';
      readonly profileId: SyntheticChildId;
      readonly focusTargetId: TodayCompleteLearningFocusTarget;
      readonly scrollOffset: 0;
    };

export type MangroveLearningReturnIntent =
  | {
      readonly kind: 'restore_origin';
      readonly route: '/garden/impact-path' | '/garden';
      readonly profileId: SyntheticChildId;
      readonly focusTargetId: ImpactPathLearningFocusTarget | GardenLearningFocusTarget;
      readonly scrollOffset: number;
      readonly replaceHistory: true;
      readonly autoplayLearningId: null;
    }
  | {
      readonly kind: 'today_complete';
      readonly route: '/child';
      readonly profileId: SyntheticChildId;
      readonly focusTargetId: TodayCompleteLearningFocusTarget;
      readonly scrollOffset: 0;
      readonly replaceHistory: true;
      readonly autoplayLearningId: null;
    };

export type LearningRouteLifecycle =
  'not_started' | 'in_progress' | 'awaiting_check' | 'ready_to_complete' | 'completed';

export interface LearningRouteProgress {
  readonly route: LearningRoute;
  readonly lifecycle: LearningRouteLifecycle;
  readonly completedContentStepIds: readonly LearningContentStepId[];
  readonly checkAttempts: number;
  readonly checkSatisfied: boolean;
}

export interface LearningCompletionConsequences {
  readonly seedDelta: 0;
  readonly gardenGrowthDelta: 0;
  readonly canopyContributionDelta: 0;
  readonly greenCircleActionDelta: 0;
  readonly privateLeagueLeafDelta: 0;
  readonly challengeLeafDelta: 0;
  readonly familyRewardProgressDelta: 0;
  readonly masteryCreditIds: readonly [];
  readonly taskRecognitionIds: readonly [];
}

export interface LearningCompletionEvent {
  readonly id: string;
  readonly triggerEventId: string;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly learningId: MangroveLearningId;
  readonly route: LearningRoute;
  readonly status: 'committed';
  readonly completedAt: string;
  readonly completionCreditId: MangroveLearningId;
  readonly consequences: LearningCompletionConsequences;
}

export interface LearningUnlockEvidence {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly source: 'canonical_impact_path_projection';
  readonly reachedThresholds: readonly ImpactPathThreshold[];
}

export interface MangroveLearningState {
  readonly schemaVersion: 1;
  readonly packageId: MangroveLearningId;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly revision: number;
  readonly unlockEvidence: LearningUnlockEvidence | null;
  readonly origin: LearningOrigin | null;
  readonly activeRoute: LearningRoute | null;
  readonly routeProgress: Readonly<Record<LearningRoute, LearningRouteProgress>>;
  readonly completion: LearningCompletionEvent | null;
}

export type LearningErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_STATE'
  | 'INVALID_ORIGIN'
  | 'ORIGIN_CONFLICT'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'INACTIVE_ROUTE'
  | 'INVALID_STEP_ORDER'
  | 'NOT_READY_FOR_CHECK'
  | 'NOT_READY_TO_COMPLETE'
  | 'NOT_UNLOCKED'
  | 'UNLOCK_EVIDENCE_CONFLICT'
  | 'COMPLETION_CONFLICT';

export interface LearningError {
  readonly code: LearningErrorCode;
  readonly message: string;
}

export type LearningResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: LearningError };

export interface StartLearningRouteResult {
  readonly disposition: 'started' | 'resumed' | 'already_completed';
  readonly state: MangroveLearningState;
}

export interface AdvanceLearningStepResult {
  readonly disposition: 'recorded' | 'already_recorded';
  readonly state: MangroveLearningState;
}

export interface SubmitLearningCheckResult {
  readonly disposition: 'retry_available' | 'ready_to_complete' | 'already_ready';
  readonly state: MangroveLearningState;
}

export interface CompleteLearningResult {
  readonly disposition: 'completed' | 'already_completed';
  readonly state: MangroveLearningState;
  readonly event: LearningCompletionEvent;
}
