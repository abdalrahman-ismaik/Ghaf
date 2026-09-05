import type { RoutinePhase, RecognitionMode } from './familyGrowth';
import type { ImpactPathThreshold } from './growthJourney';

export type BadgeId =
  | 'badge.journey.seed_start.v1'
  | 'badge.journey.growing_branch.v1'
  | 'badge.journey.expanding_shade.v1'
  | 'badge.journey.coastal_care.v1'
  | 'badge.skill.sorting.bud.v1'
  | 'badge.skill.sorting.branch.v1'
  | 'badge.skill.sorting.shade.v1'
  | 'badge.skill.water.bud.v1'
  | 'badge.skill.water.branch.v1'
  | 'badge.skill.water.shade.v1'
  | 'badge.skill.energy.bud.v1'
  | 'badge.habitat.ghaf_roots.v1'
  | 'badge.habitat.mangrove_care.v1'
  | 'badge.biodiversity.wetland_exploration.v1'
  | 'badge.heritage.date_palm_gifts.v1'
  | 'badge.heritage.sadu_patterns.v1';

export interface AchievementLocalizedText {
  readonly ar: string;
  readonly en: string;
}

export interface PendingAchievementCopy {
  readonly status: 'pending_human_copy_review';
  readonly ar: null;
  readonly en: null;
}

export interface BadgeSourceNote {
  readonly criterionAuthority: 'docs/content/BADGE_CATALOG.md';
  readonly provenanceManifest: 'unavailable';
  readonly contentReview: 'not_run';
  readonly rightsReview: 'not_run';
}

export type AchievementSkillId =
  'skill.sorting' | 'skill.coast_care' | 'skill.water' | 'skill.energy' | 'skill.nature';

export type ApprovedLearningId = 'learning.ghaf_basics.v1' | 'learning.mangrove_roots.v1';

export type SemanticCriterionComponent =
  | 'wetland_learning'
  | 'observation_activity'
  | 'date_palm_learning'
  | 'parent_led_reuse_activity'
  | 'sadu_learning'
  | 'original_pattern_activity';

export type BadgeCriterion =
  | {
      readonly kind: 'lifetime_seeds';
      readonly required: 12 | 60 | 120 | 180;
    }
  | {
      readonly kind: 'station_reached';
      readonly threshold: 132 | 156;
    }
  | {
      readonly kind: 'acquisition_credits';
      readonly skillId: AchievementSkillId;
      readonly required: 1 | 2 | 3 | 5 | 7 | 10;
    }
  | {
      readonly kind: 'prerequisite_badge';
      readonly badgeId: BadgeId;
    }
  | {
      readonly kind: 'learning_completed';
      readonly learningId: ApprovedLearningId;
    }
  | {
      readonly kind: 'semantic_component';
      readonly component: SemanticCriterionComponent;
    };

export interface BadgeDefinition {
  readonly id: BadgeId;
  readonly label: AchievementLocalizedText;
  readonly criterionText: {
    readonly ar: null;
    readonly en: string;
    readonly status: 'arabic_copy_pending_human_review';
  };
  readonly criteria: readonly BadgeCriterion[];
  readonly whyItMatters: PendingAchievementCopy;
  readonly sourceNote: BadgeSourceNote;
  readonly privacy: 'private';
  readonly permanence: 'permanent';
}

export type BadgeStoredState = 'locked' | 'in_progress' | 'awaiting_review' | 'earned';
export type BadgeDisplayState = BadgeStoredState | 'next_recommended';

export type AchievementErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_EVIDENCE'
  | 'AMBIGUOUS_LIFETIME_EVIDENCE'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'NON_ACQUISITION_EVIDENCE'
  | 'EVIDENCE_CONFLICT'
  | 'UNKNOWN_BADGE';

export interface AchievementError {
  readonly code: AchievementErrorCode;
  readonly message: string;
}

export type AchievementResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: AchievementError };

export interface AcquisitionCredit {
  readonly id: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly eventId: string;
  readonly occurrenceId: string;
  readonly taskId: string;
  readonly skillId: AchievementSkillId;
  readonly status: 'committed';
  readonly recognitionMode: Exclude<RecognitionMode, 'recognition_only'>;
  readonly routinePhase: 'acquisition';
  readonly private: true;
}

export interface BadgeAward {
  readonly id: string;
  readonly badgeId: BadgeId;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly sourceEventId: string;
  readonly status: 'earned';
  readonly earnedAt: string | null;
  readonly silentBackfill: boolean;
  readonly celebrationEligible: boolean;
  readonly private: true;
  readonly permanent: true;
}

export interface AchievementState {
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly acquisitionCredits: readonly AcquisitionCredit[];
  readonly awards: readonly BadgeAward[];
}

export interface ParentApprovedAcquisitionEvent {
  readonly eventId: string;
  readonly occurrenceId: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly taskId: string;
  readonly status: 'committed';
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly skillIds?: readonly AchievementSkillId[];
}

export interface AcquisitionRecordResult {
  readonly disposition: 'recorded' | 'already_recorded';
  readonly state: AchievementState;
  readonly addedCreditIds: readonly string[];
}

export interface LifetimeSeedEvidence {
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly source: 'committed_seed_ledger';
  readonly exact: boolean;
  readonly amount: number;
  readonly entryIds: readonly string[];
}

export interface ImpactPathStationEvidence {
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly source: 'canonical_impact_path_projection';
  readonly reachedThresholds: readonly ImpactPathThreshold[];
}

export interface LearningCompletionEvidence {
  readonly id: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly learningId: ApprovedLearningId;
  readonly status: 'committed';
}

export interface SemanticCriterionEvidence {
  readonly id: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly badgeId: BadgeId;
  readonly component: SemanticCriterionComponent;
  readonly status: 'awaiting_review' | 'committed';
}

export interface AchievementEvaluationEvidence {
  readonly lifetimeSeeds: LifetimeSeedEvidence;
  readonly stationProjection: ImpactPathStationEvidence;
  readonly learningCompletions: readonly LearningCompletionEvidence[];
  readonly semanticCriterionEvidence: readonly SemanticCriterionEvidence[];
}

export type BadgeEvaluationInput =
  | {
      readonly state: AchievementState;
      readonly evidence: AchievementEvaluationEvidence;
      readonly mode: 'live';
      readonly triggerEventId: string;
      readonly occurredAt: string;
    }
  | {
      readonly state: AchievementState;
      readonly evidence: AchievementEvaluationEvidence;
      readonly mode: 'historical_seed_backfill';
      readonly triggerEventId: string;
    };

export interface BadgeEvaluationResult {
  readonly state: AchievementState;
  readonly newlyEarnedBadgeIds: readonly BadgeId[];
  readonly celebrationBadgeIds: readonly BadgeId[];
}

export interface AssignedAchievementTask {
  readonly assignmentId: string;
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly taskId: string;
  readonly status: 'assigned' | 'chosen' | 'in_progress';
  readonly skillIds: readonly AchievementSkillId[];
}

export interface BadgeProjectionContext {
  readonly archivedSeedThresholds: readonly (12 | 60 | 120 | 180)[];
  readonly unlockedLearningIds: readonly ApprovedLearningId[];
  readonly assignedTasks: readonly AssignedAchievementTask[];
}

export type BadgeContextualAction =
  | {
      readonly kind: 'impact_path_station';
      readonly threshold: ImpactPathThreshold;
    }
  | {
      readonly kind: 'unlocked_learning';
      readonly learningId: ApprovedLearningId;
    }
  | {
      readonly kind: 'assigned_task';
      readonly assignmentId: string;
      readonly taskId: string;
    };

export interface BadgeCriterionProgress {
  readonly kind: BadgeCriterion['kind'];
  readonly current: number;
  readonly required: number;
  readonly satisfied: boolean;
  readonly awaitingReview: boolean;
  readonly criterion: BadgeCriterion;
}

export interface ArchivedBadgeContext {
  readonly kind: 'completed_seed_stage';
  readonly threshold: 12 | 60 | 120 | 180;
}

export interface BadgeProjectionItem {
  readonly id: BadgeId;
  readonly label: AchievementLocalizedText;
  readonly criterionText: BadgeDefinition['criterionText'];
  readonly displayState: BadgeDisplayState;
  readonly criteria: readonly BadgeCriterionProgress[];
  readonly completionRatio: number;
  readonly whyItMatters: PendingAchievementCopy;
  readonly sourceNote: BadgeSourceNote;
  readonly contextualAction: BadgeContextualAction | null;
  readonly archivedContext: ArchivedBadgeContext | null;
  readonly private: true;
}

export interface BadgeGalleryProjection {
  readonly profileId: string;
  readonly profileEpochId: string;
  readonly items: readonly BadgeProjectionItem[];
}
