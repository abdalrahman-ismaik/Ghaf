import type {
  AccessCapabilityTruth,
  ParentCapability,
  SyntheticHouseholdId,
  SyntheticParentId,
} from '../../models/access';
import type {
  AchievementSkillId,
  BadgeId,
  BadgeProjectionItem,
  LearningCompletionEvidence,
} from '../../models/achievements';
import type {
  GardenStage,
  LandscapeId,
  SyntheticChildId,
  TaskJourney,
} from '../../models/familyGrowth';
import type { PlantStageArchive } from '../../models/growthJourney';
import type { MangroveLearningId, MangroveLearningState } from '../../models/learning';
import { restoreMangroveLearningState } from '../learning/mangroveLearning';
import type { GrowthJourneyRuntimeState } from './bootstrap';
import { projectR002bGrowthExperience } from './presentation';

const SUPPORTED_PROFILES = new Set<SyntheticChildId>(['child_salem', 'child_alya']);
const GARDEN_STAGES = new Set<GardenStage>(['seed', 'shoot', 'sapling', 'shade', 'flourishing']);
const MANGROVE_THRESHOLDS = new Set<number>([20, 60, 120, 200]);
const RECYCLING_SKILLS = Object.freeze([
  'skill.sorting',
  'skill.coast_care',
] as const satisfies readonly AchievementSkillId[]);

export interface ParentProgressAuthority {
  readonly role: 'parent';
  readonly parentId: SyntheticParentId;
  readonly householdId: SyntheticHouseholdId;
  readonly capability: Extract<ParentCapability, 'view_parent_reports'>;
  readonly authorizedProfileIds: readonly SyntheticChildId[];
  readonly origin: 'synthetic';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface CurrentMangroveStageEvidence {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly landscapeId: Extract<LandscapeId, 'mangrove'>;
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
  readonly nextThreshold: 20 | 60 | 120 | 200 | null;
  readonly symbolicOnly: true;
}

export interface ParentProgressLearningItem {
  readonly id: MangroveLearningId;
  readonly completed: boolean;
}

export interface ParentProgressTaskPrefill {
  readonly route: '/parent/task/new';
  readonly childId: SyntheticChildId;
  readonly templateId: 'task_recycling_p0_v1';
  readonly intent: 'prefill_only';
  readonly requiresParentReviewAndSave: true;
}

export interface ParentProgressSuitableTaskSuggestion {
  readonly id: string;
  readonly profileId: SyntheticChildId;
  readonly templateId: 'task_recycling_p0_v1';
  readonly categoryId: 'green_impact';
  readonly relevantSkillIds: readonly AchievementSkillId[];
  readonly relevantBadgeIds: readonly BadgeId[];
  readonly prefill: ParentProgressTaskPrefill;
}

export interface ParentChildProgressProjection {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly lifetimeSeeds: number;
  readonly currentStage: Omit<CurrentMangroveStageEvidence, 'profileId' | 'profileEpochId'> | null;
  readonly completedStages: readonly PlantStageArchive[];
  readonly badges: readonly BadgeProjectionItem[];
  readonly earnedBadges: readonly BadgeProjectionItem[];
  readonly unlockedLearning: readonly ParentProgressLearningItem[];
  readonly suitableTaskSuggestions: readonly ParentProgressSuitableTaskSuggestion[];
  readonly private: true;
  readonly readOnly: true;
}

export type ParentProgressErrorCode =
  | 'INVALID_INPUT'
  | 'PARENT_AUTHORITY_REQUIRED'
  | 'PROFILE_SCOPE_MISMATCH'
  | 'EPOCH_SCOPE_MISMATCH'
  | 'PROJECTION_ERROR';

export type ParentProgressResult =
  | { readonly ok: true; readonly data: ParentChildProgressProjection }
  | {
      readonly ok: false;
      readonly error: { readonly code: ParentProgressErrorCode; readonly message: string };
    };

export interface ProjectParentChildProgressInput {
  readonly authority: ParentProgressAuthority;
  readonly runtime: GrowthJourneyRuntimeState;
  readonly profileId: SyntheticChildId;
  readonly currentStageEvidence: CurrentMangroveStageEvidence | null;
  readonly journey: TaskJourney | null;
  readonly learningState: MangroveLearningState;
}

function failure(code: ParentProgressErrorCode, message: string): ParentProgressResult {
  return Object.freeze({ ok: false as const, error: Object.freeze({ code, message }) });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSupportedProfile(value: unknown): value is SyntheticChildId {
  return typeof value === 'string' && SUPPORTED_PROFILES.has(value as SyntheticChildId);
}

function isGrowthJourneyRuntime(value: unknown): value is GrowthJourneyRuntimeState {
  return (
    isRecord(value) &&
    typeof value.resetSequence === 'number' &&
    Number.isSafeInteger(value.resetSequence) &&
    value.resetSequence >= 0 &&
    isRecord(value.ledgersByProfile) &&
    isRecord(value.achievementsByProfile)
  );
}

function isParentAuthority(value: unknown): value is ParentProgressAuthority {
  if (!isRecord(value) || !Array.isArray(value.authorizedProfileIds)) return false;
  return (
    value.role === 'parent' &&
    value.parentId === 'parent_al_noor' &&
    value.householdId === 'household_al_noor' &&
    value.capability === 'view_parent_reports' &&
    value.origin === 'synthetic' &&
    value.capabilityTruth === 'local_prototype_not_authentication' &&
    value.authorizedProfileIds.length > 0 &&
    value.authorizedProfileIds.every(isSupportedProfile) &&
    new Set(value.authorizedProfileIds).size === value.authorizedProfileIds.length
  );
}

function isCurrentStageEvidence(value: unknown): value is CurrentMangroveStageEvidence {
  return (
    isRecord(value) &&
    isSupportedProfile(value.profileId) &&
    typeof value.profileEpochId === 'string' &&
    value.profileEpochId.length > 0 &&
    value.landscapeId === 'mangrove' &&
    typeof value.cumulativeSeeds === 'number' &&
    Number.isSafeInteger(value.cumulativeSeeds) &&
    value.cumulativeSeeds >= 0 &&
    typeof value.stage === 'string' &&
    GARDEN_STAGES.has(value.stage as GardenStage) &&
    (value.nextThreshold === null ||
      (typeof value.nextThreshold === 'number' && MANGROVE_THRESHOLDS.has(value.nextThreshold))) &&
    value.symbolicOnly === true
  );
}

function completionEvidence(state: MangroveLearningState): readonly LearningCompletionEvidence[] {
  const completion = state.completion;
  return completion === null
    ? Object.freeze([])
    : Object.freeze([
        Object.freeze({
          id: completion.id,
          profileId: completion.profileId,
          profileEpochId: completion.profileEpochId,
          learningId: completion.learningId,
          status: 'committed' as const,
        }),
      ]);
}

function currentStageProjection(
  evidence: CurrentMangroveStageEvidence | null,
): ParentChildProgressProjection['currentStage'] {
  return evidence === null
    ? null
    : Object.freeze({
        landscapeId: evidence.landscapeId,
        cumulativeSeeds: evidence.cumulativeSeeds,
        stage: evidence.stage,
        nextThreshold: evidence.nextThreshold,
        symbolicOnly: true as const,
      });
}

function suitableTaskSuggestions(input: {
  readonly profileId: SyntheticChildId;
  readonly badges: readonly BadgeProjectionItem[];
  readonly journey: TaskJourney | null;
}): readonly ParentProgressSuitableTaskSuggestion[] {
  if (input.profileId !== 'child_salem') return Object.freeze([]);
  const taskAlreadyActive =
    input.journey?.task.id === 'task_recycling_p0_v1' && input.journey.lifecycle !== 'recognized';
  if (taskAlreadyActive) return Object.freeze([]);

  const relevantBadgeIds = Object.freeze(
    input.badges
      .filter(
        (badge) =>
          badge.displayState !== 'earned' &&
          badge.criteria.some(
            (criterion) =>
              !criterion.satisfied &&
              criterion.criterion.kind === 'acquisition_credits' &&
              RECYCLING_SKILLS.includes(
                criterion.criterion.skillId as (typeof RECYCLING_SKILLS)[number],
              ),
          ),
      )
      .map((badge) => badge.id),
  );
  if (relevantBadgeIds.length === 0) return Object.freeze([]);

  return Object.freeze([
    Object.freeze({
      id: 'parent-progress-suggestion:child_salem:task_recycling_p0_v1',
      profileId: input.profileId,
      templateId: 'task_recycling_p0_v1',
      categoryId: 'green_impact',
      relevantSkillIds: RECYCLING_SKILLS,
      relevantBadgeIds,
      prefill: Object.freeze({
        route: '/parent/task/new',
        childId: input.profileId,
        templateId: 'task_recycling_p0_v1',
        intent: 'prefill_only',
        requiresParentReviewAndSave: true,
      }),
    }),
  ]);
}

export function projectParentChildProgress(input: unknown): ParentProgressResult {
  if (
    !isRecord(input) ||
    !isParentAuthority(input.authority) ||
    !isSupportedProfile(input.profileId) ||
    !isGrowthJourneyRuntime(input.runtime) ||
    !isRecord(input.learningState) ||
    (input.journey !== null && !isRecord(input.journey)) ||
    (input.currentStageEvidence !== null && !isCurrentStageEvidence(input.currentStageEvidence))
  ) {
    const authority = isRecord(input) ? input.authority : null;
    return isParentAuthority(authority)
      ? failure('INVALID_INPUT', 'A complete Parent progress projection input is required')
      : failure('PARENT_AUTHORITY_REQUIRED', 'A synthetic Parent report capability is required');
  }
  const authority = input.authority;
  const profileId = input.profileId;
  const runtime = input.runtime;
  if (!authority.authorizedProfileIds.includes(profileId)) {
    return failure('PROFILE_SCOPE_MISMATCH', 'The Parent report does not authorize this Child');
  }

  const restoredLearning = restoreMangroveLearningState(input.learningState);
  if (!restoredLearning.ok) {
    return failure('INVALID_INPUT', restoredLearning.error.message);
  }
  const ledger = runtime.ledgersByProfile[profileId];
  if (!ledger) return failure('PROFILE_SCOPE_MISMATCH', 'The selected Child has no Growth profile');
  if (restoredLearning.data.profileId !== profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Learning evidence belongs to another Child');
  }
  if (restoredLearning.data.profileEpochId !== ledger.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Learning evidence belongs to another reset epoch');
  }

  const stageEvidence = input.currentStageEvidence;
  if (stageEvidence !== null && stageEvidence.profileId !== profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Current-stage evidence belongs to another Child');
  }
  if (stageEvidence !== null && stageEvidence.profileEpochId !== ledger.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Current-stage evidence belongs to another reset epoch');
  }

  const growth = projectR002bGrowthExperience({
    runtime,
    profileId,
    journey: (input.journey as TaskJourney | null) ?? null,
    learningCompletions: completionEvidence(restoredLearning.data),
    semanticCriterionEvidence: Object.freeze([]),
  });
  if (!growth.ok) return failure('PROJECTION_ERROR', growth.error.message);

  const badges = Object.freeze([...growth.data.badges.items]);
  const earnedBadges = Object.freeze(badges.filter((badge) => badge.displayState === 'earned'));
  const unlockedLearning = Object.freeze(
    growth.data.unlockedLearningIds.map((id) =>
      Object.freeze({ id, completed: restoredLearning.data.completion?.learningId === id }),
    ),
  );
  const suggestions = suitableTaskSuggestions({
    profileId,
    badges,
    journey: (input.journey as TaskJourney | null) ?? null,
  });

  return Object.freeze({
    ok: true as const,
    data: Object.freeze({
      profileId,
      profileEpochId: growth.data.profileEpochId,
      lifetimeSeeds: growth.data.lifetimeSeeds,
      currentStage: currentStageProjection(stageEvidence),
      completedStages: Object.freeze([...growth.data.completedMangroveArchives]),
      badges,
      earnedBadges,
      unlockedLearning,
      suitableTaskSuggestions: suggestions,
      private: true as const,
      readOnly: true as const,
    }),
  });
}
