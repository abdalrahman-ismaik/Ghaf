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
  const badges = projectBadgeGallery({
    state: achievements,
    evidence,
    context: Object.freeze({
      archivedSeedThresholds: Object.freeze(archives.map((archive) => archive.threshold)),
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
