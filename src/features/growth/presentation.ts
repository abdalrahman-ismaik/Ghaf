import type {
  AchievementError,
  AchievementEvaluationEvidence,
  AchievementSkillId,
  AssignedAchievementTask,
  BadgeGalleryProjection,
  LearningCompletionEvidence,
  SemanticCriterionEvidence,
} from '../../models/achievements';
import type { SyntheticChildId, TaskJourney } from '../../models/familyGrowth';
import type { MangroveLearningState } from '../../models/learning';
import {
  IMPACT_PATH_STATIONS,
  type ImpactPathStation,
  type PlantStageArchive,
  type ProgressionError,
  type WaterAndCoastPathProjection,
} from '../../models/growthJourney';
import { projectBadgeGallery } from './achievements';
import { selectGrowthJourneyProfile, type GrowthJourneyRuntimeState } from './bootstrap';

export type ImpactPathStationDisplayState = 'reached' | 'next' | 'locked';

export interface ImpactPathStationProjection extends ImpactPathStation {
  readonly state: ImpactPathStationDisplayState;
}

export interface R002bGrowthExperienceProjection {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly lifetimeSeeds: number;
  readonly path: WaterAndCoastPathProjection;
  readonly stations: readonly ImpactPathStationProjection[];
  readonly completedMangroveArchives: readonly PlantStageArchive[];
  readonly unlockedLearningIds: readonly ['learning.mangrove_roots.v1'] | readonly [];
  readonly badges: BadgeGalleryProjection;
  readonly configuredNextGardenStage: null;
}

export type R002bGrowthPresentationResult =
  | { readonly ok: true; readonly data: R002bGrowthExperienceProjection }
  | { readonly ok: false; readonly error: ProgressionError | AchievementError };

const RECYCLING_SKILLS = Object.freeze([
  'skill.sorting',
  'skill.coast_care',
] as const satisfies readonly AchievementSkillId[]);

function freezeArchive(archive: PlantStageArchive): PlantStageArchive {
  return Object.freeze({ ...archive });
}

function assignedAchievementTasks(input: {
  readonly journey: TaskJourney | null;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
}): readonly AssignedAchievementTask[] {
  const { journey } = input;
  if (
    !journey?.assignment ||
    journey.assignment.childId !== input.profileId ||
    (journey.lifecycle !== 'assigned' &&
      journey.lifecycle !== 'chosen' &&
      journey.lifecycle !== 'in_progress') ||
    journey.task.id !== 'task_recycling_p0_v1'
  ) {
    return Object.freeze([]);
  }

  return Object.freeze([
    Object.freeze({
      assignmentId: journey.assignment.id,
      profileId: input.profileId,
      profileEpochId: input.profileEpochId,
      taskId: journey.task.id,
      status: journey.lifecycle,
      skillIds: RECYCLING_SKILLS,
    }),
  ]);
}

export function projectImpactPathStations(
  path: WaterAndCoastPathProjection,
): readonly ImpactPathStationProjection[] {
  return Object.freeze(
    IMPACT_PATH_STATIONS.map((station) =>
      Object.freeze({
        ...station,
        state: path.reachedThresholds.includes(station.threshold)
          ? ('reached' as const)
          : path.nextThreshold === station.threshold
            ? ('next' as const)
            : ('locked' as const),
      }),
    ),
  );
}

export function projectR002bGrowthExperience(input: {
  readonly runtime: GrowthJourneyRuntimeState;
  readonly profileId: SyntheticChildId;
  readonly journey: TaskJourney | null;
  readonly learningCompletions: readonly LearningCompletionEvidence[];
  readonly semanticCriterionEvidence: readonly SemanticCriterionEvidence[];
}): R002bGrowthPresentationResult {
  const profile = selectGrowthJourneyProfile(input.runtime, input.profileId);
  if (!profile.ok) return profile;

  const { ledger, achievements, path, profileEpochId, lifetimeSeeds } = profile.data;
  const unlockedLearningIds: readonly ['learning.mangrove_roots.v1'] | readonly [] =
    path.reachedThresholds.includes(132)
      ? Object.freeze(['learning.mangrove_roots.v1'] as const)
      : Object.freeze([]);
  const evidence: AchievementEvaluationEvidence = Object.freeze({
    lifetimeSeeds: Object.freeze({
      profileId: input.profileId,
      profileEpochId,
      source: 'committed_seed_ledger' as const,
      exact: true,
      amount: lifetimeSeeds,
      entryIds: Object.freeze(ledger.entries.map((entry) => entry.id)),
    }),
    stationProjection: Object.freeze({
      profileId: input.profileId,
      profileEpochId,
      source: 'canonical_impact_path_projection' as const,
      reachedThresholds: path.reachedThresholds,
    }),
    learningCompletions: Object.freeze([...input.learningCompletions]),
    semanticCriterionEvidence: Object.freeze([...input.semanticCriterionEvidence]),
  });
  const archives = Object.freeze(ledger.plantStageArchives.map(freezeArchive));
  const archivedBadgeThresholds = Object.freeze(
    archives.flatMap((archive) =>
      archive.threshold === 60 || archive.threshold === 120 ? [archive.threshold] : [],
    ),
  );
  const badges = projectBadgeGallery({
    state: achievements,
    evidence,
    context: Object.freeze({
      archivedSeedThresholds: archivedBadgeThresholds,
      unlockedLearningIds,
      assignedTasks: assignedAchievementTasks({
        journey: input.journey,
        profileId: input.profileId,
        profileEpochId,
      }),
    }),
  });
  if (!badges.ok) return badges;

  return {
    ok: true,
    data: Object.freeze({
      profileId: input.profileId,
      profileEpochId,
      lifetimeSeeds,
      path,
      stations: projectImpactPathStations(path),
      completedMangroveArchives: archives,
      unlockedLearningIds,
      badges: badges.data,
      configuredNextGardenStage: null,
    }),
  };
}

export function projectR002bGrowthExperienceWithLearning(input: {
  readonly runtime: GrowthJourneyRuntimeState;
  readonly profileId: SyntheticChildId;
  readonly journey: TaskJourney | null;
  readonly learningState: MangroveLearningState;
  readonly semanticCriterionEvidence?: readonly SemanticCriterionEvidence[];
}): R002bGrowthPresentationResult {
  const profile = selectGrowthJourneyProfile(input.runtime, input.profileId);
  if (!profile.ok) return profile;
  if (input.learningState.profileId !== input.profileId) {
    return {
      ok: false,
      error: {
        code: 'PROFILE_SCOPE_MISMATCH',
        message: 'Learning evidence belongs to another profile',
      },
    };
  }
  if (input.learningState.profileEpochId !== profile.data.profileEpochId) {
    return {
      ok: false,
      error: {
        code: 'EPOCH_SCOPE_MISMATCH',
        message: 'Learning evidence belongs to another reset epoch',
      },
    };
  }

  const completion = input.learningState.completion;
  const learningCompletions: readonly LearningCompletionEvidence[] = completion
    ? Object.freeze([
        Object.freeze({
          id: completion.id,
          profileId: completion.profileId,
          profileEpochId: completion.profileEpochId,
          learningId: completion.learningId,
          status: 'committed' as const,
        }),
      ])
    : Object.freeze([]);

  return projectR002bGrowthExperience({
    runtime: input.runtime,
    profileId: input.profileId,
    journey: input.journey,
    learningCompletions,
    semanticCriterionEvidence: input.semanticCriterionEvidence ?? Object.freeze([]),
  });
}
