import type {
  BadgeCriterionPresentation,
  BadgeDetailProps,
  BadgeGalleryItemPresentation,
  BadgeGalleryProps,
  BadgePresentationState,
  GardenChapterEntryPresentation,
  GardenChapterModuleProps,
  GrowthActionPresentation,
  GrowthContentState,
  ImpactPathScreenProps,
  ImpactPathStationPresentation,
  TodayImpactPathCardProps,
} from '@/components/r002b/GrowthJourneyScreens';
import type {
  BadgeContextualAction,
  BadgeCriterion,
  BadgeCriterionProgress,
  BadgeDisplayState,
  BadgeId,
  BadgeProjectionItem,
  SemanticCriterionComponent,
} from '@/models/achievements';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type { ImpactPathThreshold } from '@/models/growthJourney';

import type { R002bGrowthExperienceProjection } from './presentation';

export type GrowthJourneyTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface GrowthJourneyPresentationActions {
  readonly openImpactPath?: () => void;
  readonly openBadges?: () => void;
  readonly openBadge: (badgeId: BadgeId) => void;
  readonly openLearning?: (learningId: 'learning.mangrove_roots.v1') => void;
  readonly openAssignedTask?: (assignmentId: string, taskId: string) => void;
  readonly openImpactStation?: (threshold: ImpactPathThreshold) => void;
  readonly openSharedGrowth?: () => void;
}

export interface CurrentMangroveStagePresentation {
  readonly currentSeeds: number;
  readonly targetSeeds: number;
}

export interface GrowthJourneyPresentationModel {
  readonly today: TodayImpactPathCardProps;
  readonly garden: GardenChapterModuleProps;
  readonly impactPath: ImpactPathScreenProps;
  readonly badgeGallery: BadgeGalleryProps;
  readonly badgeDetail: (badgeId: string) => BadgeDetailProps | null;
}

interface GrowthJourneyPresentationInput {
  readonly projection: R002bGrowthExperienceProjection;
  readonly currentMangroveStage: CurrentMangroveStagePresentation | null;
  readonly language: LocaleCode;
  readonly direction: TextDirection;
  readonly reducedMotion: boolean;
  readonly translate: GrowthJourneyTranslate;
  readonly actions: GrowthJourneyPresentationActions;
  readonly earnedAtByBadgeId?: Readonly<Partial<Record<BadgeId, string | null>>>;
}

const STATION_TRANSLATION_KEYS: Readonly<Record<ImpactPathThreshold, string>> = {
  120: 'station120',
  132: 'station132',
  144: 'station144',
  156: 'station156',
  168: 'station168',
  180: 'station180',
};

const SEMANTIC_TRANSLATION_KEYS: Readonly<Record<SemanticCriterionComponent, string>> = {
  wetland_learning: 'wetlandLearning',
  observation_activity: 'observationActivity',
  date_palm_learning: 'datePalmLearning',
  parent_led_reuse_activity: 'parentReuseActivity',
  sadu_learning: 'saduLearning',
  original_pattern_activity: 'originalPatternActivity',
};

function numberFormatter(language: LocaleCode): Intl.NumberFormat {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE', { useGrouping: false });
}

function dateFormatter(language: LocaleCode): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function pathContentState(
  chapterState: R002bGrowthExperienceProjection['path']['chapterState'],
): GrowthContentState {
  if (chapterState === 'completed') return 'complete';
  if (chapterState === 'not_entered') return 'not_entered';
  return 'ready';
}

function chapterStatusKey(
  chapterState: R002bGrowthExperienceProjection['path']['chapterState'],
): string {
  if (chapterState === 'completed') return 'completed';
  if (chapterState === 'not_entered') return 'notEntered';
  return 'active';
}

function badgeState(displayState: BadgeDisplayState): BadgePresentationState {
  if (displayState === 'next_recommended') return 'recommended';
  return displayState;
}

function badgeStateKey(displayState: BadgeDisplayState): string {
  if (displayState === 'next_recommended') return 'recommended';
  if (displayState === 'in_progress') return 'inProgress';
  if (displayState === 'awaiting_review') return 'awaitingReview';
  return displayState;
}

function skillLabelKey(
  skillId: Extract<BadgeCriterion, { kind: 'acquisition_credits' }>['skillId'],
) {
  switch (skillId) {
    case 'skill.sorting':
      return 'sorting';
    case 'skill.coast_care':
      return 'coastCare';
    case 'skill.water':
      return 'water';
    case 'skill.energy':
      return 'energy';
    case 'skill.nature':
      return 'nature';
  }
}

function criterionLabel(input: {
  readonly progress: BadgeCriterionProgress;
  readonly language: LocaleCode;
  readonly translate: GrowthJourneyTranslate;
  readonly itemsById: ReadonlyMap<BadgeId, BadgeProjectionItem>;
  readonly format: Intl.NumberFormat;
}): string {
  const { criterion, current, required } = input.progress;
  const values = {
    current: input.format.format(current),
    required: input.format.format(required),
  };

  switch (criterion.kind) {
    case 'lifetime_seeds':
      return input.translate('r002bGrowth.badges.criteria.lifetimeSeeds', values);
    case 'station_reached':
      return input.translate('r002bGrowth.badges.criteria.stationReached', {
        threshold: input.format.format(criterion.threshold),
      });
    case 'acquisition_credits':
      return input.translate('r002bGrowth.badges.criteria.acquisitionCredits', {
        ...values,
        skill: input.translate(`r002bGrowth.badges.skills.${skillLabelKey(criterion.skillId)}`),
      });
    case 'prerequisite_badge':
      return input.translate('r002bGrowth.badges.criteria.prerequisiteBadge', {
        badge: input.itemsById.get(criterion.badgeId)?.label[input.language] ?? criterion.badgeId,
      });
    case 'learning_completed':
      return input.translate('r002bGrowth.badges.criteria.learningCompleted');
    case 'semantic_component':
      return input.translate(
        `r002bGrowth.badges.criteria.semantic.${SEMANTIC_TRANSLATION_KEYS[criterion.component]}`,
      );
  }
}

function criterionStatusKey(progress: BadgeCriterionProgress): string {
  if (progress.satisfied) return 'satisfied';
  if (progress.awaitingReview) return 'awaitingReview';
  return 'remaining';
}

function contextualAction(input: {
  readonly action: BadgeContextualAction | null;
  readonly actions: GrowthJourneyPresentationActions;
  readonly translate: GrowthJourneyTranslate;
}): GrowthActionPresentation | undefined {
  const action = input.action;
  if (!action) return undefined;
  if (action.kind === 'impact_path_station' && input.actions.openImpactStation) {
    return {
      accessibilityLabel: input.translate('r002bGrowth.badges.action.path'),
      label: input.translate('r002bGrowth.badges.action.path'),
      onPress: () => input.actions.openImpactStation?.(action.threshold),
      testID: 'r002b-badge-detail-path-action',
    };
  }
  if (
    action.kind === 'unlocked_learning' &&
    action.learningId === 'learning.mangrove_roots.v1' &&
    input.actions.openLearning
  ) {
    return {
      accessibilityLabel: input.translate('r002bGrowth.badges.action.learning'),
      label: input.translate('r002bGrowth.badges.action.learning'),
      onPress: () => input.actions.openLearning?.('learning.mangrove_roots.v1'),
      testID: 'r002b-badge-detail-learning-action',
    };
  }
  if (action.kind === 'assigned_task' && input.actions.openAssignedTask) {
    return {
      accessibilityLabel: input.translate('r002bGrowth.badges.action.assignedTask'),
      label: input.translate('r002bGrowth.badges.action.assignedTask'),
      onPress: () => input.actions.openAssignedTask?.(action.assignmentId, action.taskId),
      testID: 'r002b-badge-detail-task-action',
    };
  }
  return undefined;
}

function createBadgePresentations(input: GrowthJourneyPresentationInput) {
  const { projection, translate, language, direction, reducedMotion } = input;
  const format = numberFormatter(language);
  const itemsById = new Map(projection.badges.items.map((item) => [item.id, item]));
  const galleryItems: readonly BadgeGalleryItemPresentation[] = Object.freeze(
    projection.badges.items.map((item) => {
      const label = item.label[language];
      const state = badgeState(item.displayState);
      const statusLabel = translate(`r002bGrowth.badges.state.${badgeStateKey(item.displayState)}`);
      const satisfied = item.criteria.filter((criterion) => criterion.satisfied).length;
      const criterionText = item.criteria
        .map((progress) => criterionLabel({ progress, language, translate, itemsById, format }))
        .join(' · ');
      const progressText = translate('r002bGrowth.badges.requirementProgress', {
        current: format.format(satisfied),
        required: format.format(item.criteria.length),
      });
      return Object.freeze({
        id: item.id,
        title: label,
        state,
        statusLabel,
        criterionText,
        progressText,
        accessibilityLabel: `${label}. ${statusLabel}. ${criterionText}. ${progressText}`,
        onPress: () => input.actions.openBadge(item.id),
        testID: `r002b-badge-${item.id}`,
      });
    }),
  );

  const gallery: BadgeGalleryProps = {
    chapterTitle: translate('r002bGrowth.badges.title'),
    contentState: 'ready',
    description: translate('r002bGrowth.badges.description'),
    direction,
    groupLabel: translate('r002bGrowth.badges.groupLabel'),
    items: galleryItems,
    language,
    privacyNote: translate('r002bGrowth.badges.privacy'),
    recommendedItemId: projection.badges.items.find(
      (item) => item.displayState === 'next_recommended',
    )?.id,
    recommendedLabel: translate('r002bGrowth.badges.recommended'),
    reducedMotion,
    statusLabel: translate('r002bGrowth.surfaceStatus.ready'),
  };

  const detail = (badgeId: string): BadgeDetailProps | null => {
    const item = itemsById.get(badgeId as BadgeId);
    if (!item) return null;
    const label = item.label[language];
    const state = badgeState(item.displayState);
    const statusLabel = translate(`r002bGrowth.badges.state.${badgeStateKey(item.displayState)}`);
    const criteria: readonly BadgeCriterionPresentation[] = Object.freeze(
      item.criteria.map((progress, index) => {
        const labelText = criterionLabel({ progress, language, translate, itemsById, format });
        const progressText = translate('r002bGrowth.badges.numericProgress', {
          current: format.format(progress.current),
          required: format.format(progress.required),
        });
        const criterionStatus = translate(
          `r002bGrowth.badges.criterionState.${criterionStatusKey(progress)}`,
        );
        return Object.freeze({
          id: `${item.id}:criterion:${index}`,
          label: labelText,
          progressText,
          satisfied: progress.satisfied,
          awaitingReview: progress.awaitingReview,
          statusLabel: criterionStatus,
          accessibilityLabel: `${labelText}. ${progressText}. ${criterionStatus}`,
        });
      }),
    );
    const earnedAt = input.earnedAtByBadgeId?.[item.id];
    const earnedDateText =
      item.displayState === 'earned' && typeof earnedAt === 'string'
        ? translate('r002bGrowth.badges.earnedDate', {
            date: dateFormatter(language).format(new Date(earnedAt)),
          })
        : undefined;
    const historicalDateText =
      item.displayState === 'earned' && !earnedDateText
        ? translate('r002bGrowth.badges.historicalDate')
        : undefined;
    const satisfied = criteria.filter((criterion) => criterion.satisfied).length;
    const progressLabel = translate('r002bGrowth.badges.requirementProgress', {
      current: format.format(satisfied),
      required: format.format(criteria.length),
    });

    return {
      accessibilityLabel: `${label}. ${statusLabel}. ${progressLabel}`,
      action: contextualAction({
        action: item.contextualAction,
        actions: input.actions,
        translate,
      }),
      badgeTitle: label,
      chapterTitle: translate('r002bGrowth.badges.chapter'),
      contentState: 'ready',
      criteria,
      criteriaHeading: translate('r002bGrowth.badges.criteriaHeading'),
      direction,
      earnedDateText,
      groupLabel: translate('r002bGrowth.badges.detailGroupLabel', { badge: label }),
      historicalDateText,
      language,
      privacyNote: translate('r002bGrowth.badges.privacy'),
      progressLabel,
      reducedMotion,
      sourceHeading: translate('r002bGrowth.badges.sourceHeading'),
      sourceNote: translate('r002bGrowth.badges.sourceNote'),
      state,
      statusLabel,
      whyHeading: translate('r002bGrowth.badges.whyHeading'),
      whyText: translate('r002bGrowth.badges.whyText'),
    };
  };

  return { gallery, detail };
}

export function createGrowthJourneyPresentation(
  input: GrowthJourneyPresentationInput,
): GrowthJourneyPresentationModel {
  const { projection, language, direction, reducedMotion, translate, actions } = input;
  const format = numberFormatter(language);
  const contentState = pathContentState(projection.path.chapterState);
  const chapterStatus = translate(
    `r002bGrowth.chapter.status.${chapterStatusKey(projection.path.chapterState)}`,
  );
  const nextThreshold = projection.path.nextThreshold;
  const remaining =
    nextThreshold === null ? 0 : Math.max(0, nextThreshold - projection.lifetimeSeeds);
  const nearestStationLabel =
    nextThreshold === null
      ? translate('r002bGrowth.chapter.allStationsComplete')
      : translate('r002bGrowth.chapter.nearestStation', {
          threshold: format.format(nextThreshold),
        });
  const requirementText =
    nextThreshold === null
      ? translate('r002bGrowth.chapter.chapterComplete')
      : translate('r002bGrowth.chapter.remaining', { count: format.format(remaining) });
  const chapterRange = translate('r002bGrowth.chapter.range', {
    start: format.format(120),
    end: format.format(180),
  });
  const archive = projection.completedMangroveArchives.at(-1);
  const archiveValue = archive
    ? translate('r002bGrowth.chapter.archiveValue', {
        current: format.format(archive.seedsAfter),
        target: format.format(archive.threshold),
      })
    : translate('r002bGrowth.chapter.archivePendingValue');
  const archiveLabel = archive
    ? translate('r002bGrowth.chapter.archiveComplete')
    : translate('r002bGrowth.chapter.archivePending');
  const currentStageValue = archive
    ? translate('r002bGrowth.chapter.numericRange', {
        current: format.format(archive.seedsAfter),
        target: format.format(archive.threshold),
      })
    : input.currentMangroveStage
      ? translate('r002bGrowth.chapter.numericRange', {
          current: format.format(input.currentMangroveStage.currentSeeds),
          target: format.format(input.currentMangroveStage.targetSeeds),
        })
      : translate('r002bGrowth.chapter.currentStageUnavailable');

  const today: TodayImpactPathCardProps = {
    action: actions.openImpactPath
      ? {
          accessibilityLabel: translate('r002bGrowth.chapter.pathAction'),
          label: translate('r002bGrowth.chapter.pathAction'),
          onPress: actions.openImpactPath,
          testID: 'r002b-today-path-action',
        }
      : undefined,
    chapterTitle: translate('r002bGrowth.chapter.shortTitle'),
    contentState,
    direction,
    groupLabel: translate('r002bGrowth.chapter.todayGroupLabel'),
    language,
    lifetimeLabel: translate('r002bGrowth.chapter.lifetime'),
    lifetimeValue: format.format(projection.lifetimeSeeds),
    nearestStationLabel,
    reducedMotion,
    requirementText,
    statusLabel: chapterStatus,
    supportingText: translate('r002bGrowth.chapter.todaySupporting'),
  };

  const entries: GardenChapterEntryPresentation[] = [];
  if (actions.openImpactPath) {
    entries.push({
      id: 'impact-path',
      title: translate('r002bGrowth.chapter.pathEntryTitle'),
      description: translate('r002bGrowth.chapter.pathEntryDescription'),
      statusLabel: chapterStatus,
      tone: 'water',
      iconName: 'water-drop',
      accessibilityLabel: `${translate('r002bGrowth.chapter.pathEntryTitle')}. ${chapterStatus}`,
      action: {
        accessibilityLabel: translate('r002bGrowth.chapter.pathAction'),
        label: translate('r002bGrowth.chapter.pathAction'),
        onPress: actions.openImpactPath,
        testID: 'r002b-garden-path-action',
      },
    });
  }
  if (actions.openBadges) {
    entries.push({
      id: 'badges',
      title: translate('r002bGrowth.chapter.badgesEntryTitle'),
      description: translate('r002bGrowth.chapter.badgesEntryDescription'),
      statusLabel: translate('r002bGrowth.badges.privateStatus'),
      tone: 'amber',
      iconName: 'flower',
      accessibilityLabel: `${translate('r002bGrowth.chapter.badgesEntryTitle')}. ${translate(
        'r002bGrowth.badges.privateStatus',
      )}`,
      action: {
        accessibilityLabel: translate('r002bGrowth.chapter.badgesAction'),
        label: translate('r002bGrowth.chapter.badgesAction'),
        onPress: actions.openBadges,
        testID: 'r002b-garden-badges-action',
      },
    });
  }
  if (actions.openSharedGrowth) {
    entries.push({
      id: 'shared-growth',
      title: translate('r002bGrowth.chapter.sharedGrowthEntryTitle'),
      description: translate('r002bGrowth.chapter.sharedGrowthEntryDescription'),
      statusLabel: translate('r002bGrowth.chapter.sharedGrowthStatus'),
      tone: 'leaf',
      iconName: 'leaf',
      accessibilityLabel: `${translate('r002bGrowth.chapter.sharedGrowthEntryTitle')}. ${translate(
        'r002bGrowth.chapter.sharedGrowthStatus',
      )}`,
      action: {
        accessibilityLabel: translate('r002bGrowth.chapter.sharedGrowthAction'),
        label: translate('r002bGrowth.chapter.sharedGrowthAction'),
        onPress: actions.openSharedGrowth,
        testID: 'r002b-garden-shared-growth-action',
      },
    });
  }

  const garden: GardenChapterModuleProps = {
    archiveLabel: `${archiveLabel}. ${archiveValue}`,
    chapterTitle: translate('r002bGrowth.chapter.title'),
    contentState,
    currentStageLabel: translate('r002bGrowth.chapter.currentStage'),
    currentStageValue,
    description: translate('r002bGrowth.chapter.description'),
    direction,
    entries: Object.freeze(entries),
    groupLabel: translate('r002bGrowth.chapter.gardenGroupLabel'),
    language,
    lifetimeLabel: translate('r002bGrowth.chapter.lifetime'),
    lifetimeValue: format.format(projection.lifetimeSeeds),
    reducedMotion,
    statusLabel: chapterStatus,
  };

  const stations: readonly ImpactPathStationPresentation[] = Object.freeze(
    projection.stations.map((station) => {
      const stationKey = STATION_TRANSLATION_KEYS[station.threshold];
      const state =
        station.state === 'next'
          ? ('current' as const)
          : station.state === 'reached'
            ? 'reached'
            : 'locked';
      const statusLabel = translate(
        `r002bGrowth.stationStatus.${station.state === 'next' ? 'current' : station.state}`,
      );
      const title = translate(`r002bGrowth.stations.${stationKey}.title`);
      const criterionText = translate(`r002bGrowth.stations.${stationKey}.criterion`);
      const learningAvailable =
        station.threshold === 132 &&
        station.state === 'reached' &&
        projection.unlockedLearningIds[0] === 'learning.mangrove_roots.v1' &&
        actions.openLearning;
      const action = learningAvailable
        ? {
            accessibilityLabel: translate('r002bGrowth.chapter.learningAction'),
            label: translate('r002bGrowth.chapter.learningAction'),
            onPress: () => actions.openLearning?.('learning.mangrove_roots.v1'),
            testID: 'r002b-impact-path-learning-action',
          }
        : undefined;
      return Object.freeze({
        id: `impact-path-station-${station.threshold}`,
        state,
        thresholdLabel: translate('r002bGrowth.chapter.stationThreshold', {
          count: format.format(station.threshold),
        }),
        title,
        criterionText,
        statusLabel,
        action,
        accessibilityLabel: `${format.format(station.threshold)}. ${title}. ${statusLabel}. ${criterionText}`,
      });
    }),
  );

  const relatedActions: GrowthActionPresentation[] = [];
  if (actions.openBadges) {
    relatedActions.push({
      accessibilityLabel: translate('r002bGrowth.chapter.badgesAction'),
      label: translate('r002bGrowth.chapter.badgesAction'),
      onPress: actions.openBadges,
      testID: 'r002b-impact-path-badges-action',
    });
  }

  const impactPath: ImpactPathScreenProps = {
    archiveLabel,
    archiveValue,
    chapterTitle: translate('r002bGrowth.chapter.title'),
    contentState,
    currentChapterLabel: translate('r002bGrowth.chapter.currentChapter'),
    currentChapterValue: chapterRange,
    direction,
    disclosureText: translate('r002bGrowth.chapter.disclosure'),
    groupLabel: translate('r002bGrowth.chapter.pathGroupLabel'),
    language,
    lifetimeLabel: translate('r002bGrowth.chapter.lifetime'),
    lifetimeValue: format.format(projection.lifetimeSeeds),
    reducedMotion,
    relatedActions: Object.freeze(relatedActions),
    stations,
    statusLabel: chapterStatus,
    summaryText: translate('r002bGrowth.chapter.pathSummary'),
  };

  const badges = createBadgePresentations(input);
  return Object.freeze({
    today: Object.freeze(today),
    garden: Object.freeze(garden),
    impactPath: Object.freeze(impactPath),
    badgeGallery: Object.freeze(badges.gallery),
    badgeDetail: badges.detail,
  });
}
