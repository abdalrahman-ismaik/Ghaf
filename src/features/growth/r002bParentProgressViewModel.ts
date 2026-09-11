import type {
  ParentProgressArchiveItemPresentation,
  ParentProgressBadgeItemPresentation,
  ParentProgressBadgeState,
  ParentProgressContentState,
  ParentProgressLearningItemPresentation,
  ParentProgressProfileOptionPresentation,
  ParentProgressScreenProps,
  ParentProgressSuggestionPresentation,
} from '@/components/r002b/ParentProgressScreen';
import type {
  BadgeCriterion,
  BadgeCriterionProgress,
  BadgeDisplayState,
  BadgeId,
  BadgeProjectionItem,
  SemanticCriterionComponent,
} from '@/models/achievements';
import type { LocaleCode, SyntheticChildId, TextDirection } from '@/models/familyGrowth';

import type { ParentChildProgressProjection, ParentProgressTaskPrefill } from './parentProgress';

export type R002bParentProgressTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface ParentProgressProfileOption {
  readonly id: SyntheticChildId;
  readonly name: string;
}

export type R002bParentProgressProfileInput = ParentProgressProfileOption;

export interface R002bParentProgressPresentationInput {
  readonly contentState?: ParentProgressContentState;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly onOpenSuitableTask?: (prefill: ParentProgressTaskPrefill) => void;
  readonly onSelectProfile?: (profileId: SyntheticChildId) => void;
  readonly profileName: string;
  readonly profiles: readonly R002bParentProgressProfileInput[];
  readonly projection: ParentChildProgressProjection | null;
  readonly reducedMotion: boolean;
  readonly selectedProfileId?: SyntheticChildId;
  readonly translate: R002bParentProgressTranslate;
}

const SEMANTIC_TRANSLATION_KEYS: Readonly<Record<SemanticCriterionComponent, string>> = {
  wetland_learning: 'wetlandLearning',
  observation_activity: 'observationActivity',
  date_palm_learning: 'datePalmLearning',
  parent_led_reuse_activity: 'parentReuseActivity',
  sadu_learning: 'saduLearning',
  original_pattern_activity: 'originalPatternActivity',
};

function numberFormatter(language: LocaleCode): Intl.NumberFormat {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    useGrouping: false,
  });
}

function boundedPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function badgeState(displayState: BadgeDisplayState): ParentProgressBadgeState | null {
  if (displayState === 'locked') return null;
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
): string {
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
  readonly format: Intl.NumberFormat;
  readonly itemsById: ReadonlyMap<BadgeId, BadgeProjectionItem>;
  readonly language: LocaleCode;
  readonly progress: BadgeCriterionProgress;
  readonly translate: R002bParentProgressTranslate;
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

function profileOptions(input: {
  readonly profiles: readonly R002bParentProgressProfileInput[];
  readonly selectedProfileId?: SyntheticChildId;
  readonly onSelectProfile?: (profileId: SyntheticChildId) => void;
  readonly translate: R002bParentProgressTranslate;
}): readonly ParentProgressProfileOptionPresentation[] {
  return Object.freeze(
    input.profiles.map((profile) => {
      const selected = profile.id === input.selectedProfileId;
      const canSelect = !selected && Boolean(input.onSelectProfile);
      const disabled = !selected && !canSelect;
      const selectionState = input.translate(
        selected ? 'accessibility.selected' : 'accessibility.notSelected',
      );
      return Object.freeze({
        accessibilityLabel: `${profile.name}. ${selectionState}`,
        disabled,
        id: profile.id,
        label: profile.name,
        onPress: canSelect ? () => input.onSelectProfile?.(profile.id) : undefined,
        selected,
        testID: `r002b-parent-progress-profile-${profile.id}`,
      });
    }),
  );
}

function archiveItems(input: {
  readonly projection: ParentChildProgressProjection;
  readonly format: Intl.NumberFormat;
  readonly translate: R002bParentProgressTranslate;
}): readonly ParentProgressArchiveItemPresentation[] {
  return Object.freeze(
    input.projection.completedStages.map((archive, index) => {
      const title = input.translate('r002bParentProgress.archive.itemTitle', {
        position: input.format.format(index + 1),
      });
      const value = input.translate('r002bGrowth.chapter.archiveValue', {
        current: input.format.format(archive.seedsAfter),
        target: input.format.format(archive.threshold),
      });
      const statusLabel = input.translate('r002bParentProgress.archive.saved');
      return Object.freeze({
        accessibilityLabel: `${title}. ${value}. ${statusLabel}`,
        id: archive.id,
        statusLabel,
        title,
        value,
      });
    }),
  );
}

function badgeItems(input: {
  readonly projection: ParentChildProgressProjection;
  readonly format: Intl.NumberFormat;
  readonly language: LocaleCode;
  readonly translate: R002bParentProgressTranslate;
}): readonly ParentProgressBadgeItemPresentation[] {
  const itemsById = new Map(input.projection.badges.map((item) => [item.id, item]));
  return Object.freeze(
    input.projection.badges.flatMap((item) => {
      const state = badgeState(item.displayState);
      if (state === null) return [];

      const title = item.label[input.language];
      const statusLabel = input.translate(
        `r002bGrowth.badges.state.${badgeStateKey(item.displayState)}`,
      );
      const satisfied = item.criteria.filter((criterion) => criterion.satisfied).length;
      const maximum = Math.max(1, item.criteria.length);
      const progressText = input.translate('r002bGrowth.badges.requirementProgress', {
        current: input.format.format(satisfied),
        required: input.format.format(item.criteria.length),
      });
      const criterionText = item.criteria
        .map((progress) =>
          criterionLabel({
            format: input.format,
            itemsById,
            language: input.language,
            progress,
            translate: input.translate,
          }),
        )
        .join(' · ');

      return [
        Object.freeze({
          accessibilityLabel: `${title}. ${statusLabel}. ${criterionText}. ${progressText}`,
          criterionText,
          id: item.id,
          progress: Object.freeze({
            accessibilityLabel: `${title}. ${progressText}`,
            current: satisfied,
            maximum,
            valueText: progressText,
            visualPercent: boundedPercent(item.completionRatio * 100),
          }),
          progressText,
          state,
          statusLabel,
          title,
        }),
      ];
    }),
  );
}

function learningItems(input: {
  readonly projection: ParentChildProgressProjection;
  readonly translate: R002bParentProgressTranslate;
}): readonly ParentProgressLearningItemPresentation[] {
  return Object.freeze(
    input.projection.unlockedLearning.map((learning) => {
      const title = input.translate('learning.mangroveRoots.title');
      const statusLabel = input.translate(
        learning.completed
          ? 'r002bParentProgress.learning.completed'
          : 'r002bParentProgress.learning.unlocked',
      );
      return Object.freeze({
        accessibilityLabel: `${title}. ${statusLabel}`,
        completed: learning.completed,
        id: learning.id,
        statusLabel,
        title,
      });
    }),
  );
}

function suggestionItems(input: {
  readonly projection: ParentChildProgressProjection;
  readonly onOpenSuitableTask?: (prefill: ParentProgressTaskPrefill) => void;
  readonly translate: R002bParentProgressTranslate;
}): readonly ParentProgressSuggestionPresentation[] {
  return Object.freeze(
    input.projection.suitableTaskSuggestions.map((suggestion) => {
      const title = input.translate('r002bParentProgress.suggestions.title');
      const rationale = input.translate('r002bParentProgress.suggestions.rationale');
      const statusLabel = input.translate('r002bParentProgress.suggestions.status');
      const reviewNotice = input.translate('r002bParentProgress.suggestions.reviewNotice');
      const actionLabel = input.translate('r002bParentProgress.suggestions.action');
      const action = input.onOpenSuitableTask
        ? Object.freeze({
            accessibilityHint: reviewNotice,
            accessibilityLabel: actionLabel,
            label: actionLabel,
            onPress: () => input.onOpenSuitableTask?.(suggestion.prefill),
            testID: `r002b-parent-progress-suggestion-${suggestion.id}`,
          })
        : undefined;

      return Object.freeze({
        accessibilityLabel: `${title}. ${rationale}. ${statusLabel}. ${reviewNotice}`,
        action,
        id: suggestion.id,
        rationale,
        reviewNotice,
        statusLabel,
        title,
        unavailableText: action
          ? undefined
          : input.translate('r002bParentProgress.suggestions.unavailable'),
      });
    }),
  );
}

function viewableState(contentState: ParentProgressContentState): boolean {
  return contentState === 'ready' || contentState === 'offline' || contentState === 'interrupted';
}

export function createR002bParentProgressPresentation(
  input: R002bParentProgressPresentationInput,
): ParentProgressScreenProps {
  const selectedProfileId = input.selectedProfileId ?? input.projection?.profileId;
  const profileMatches =
    input.projection !== null &&
    (selectedProfileId === undefined || input.projection.profileId === selectedProfileId);
  const requestedState = input.contentState ?? 'ready';
  const contentState: ParentProgressContentState =
    input.projection && !profileMatches
      ? 'error'
      : input.projection === null && requestedState === 'ready'
        ? 'empty'
        : requestedState;
  const projection = profileMatches && viewableState(contentState) ? input.projection : null;
  const format = numberFormatter(input.language);
  const selectedProfileLabel = input.translate('r002bParentProgress.selectedProfile', {
    name: input.profileName,
  });
  const stateLabel = input.translate(`r002bParentProgress.state.${contentState}`);
  const options =
    contentState === 'unauthorized'
      ? Object.freeze([])
      : profileOptions({
          onSelectProfile: input.onSelectProfile,
          profiles: input.profiles,
          selectedProfileId,
          translate: input.translate,
        });

  const summary = projection
    ? Object.freeze({
        currentStage: Object.freeze(
          projection.currentStage
            ? {
                accessibilityLabel: `${input.translate('r002bGrowth.chapter.currentStage')}. ${input.translate(
                  'r002bGrowth.chapter.numericRange',
                  {
                    current: format.format(projection.currentStage.cumulativeSeeds),
                    target: format.format(
                      projection.currentStage.nextThreshold ??
                        projection.currentStage.cumulativeSeeds,
                    ),
                  },
                )}`,
                label: input.translate('r002bGrowth.chapter.currentStage'),
                supportingText: input.translate(
                  'r002bParentProgress.summary.currentStageSupporting',
                ),
                value:
                  projection.currentStage.nextThreshold === null
                    ? format.format(projection.currentStage.cumulativeSeeds)
                    : input.translate('r002bGrowth.chapter.numericRange', {
                        current: format.format(projection.currentStage.cumulativeSeeds),
                        target: format.format(projection.currentStage.nextThreshold),
                      }),
              }
            : {
                accessibilityLabel: input.translate(
                  'r002bParentProgress.summary.currentStageUnavailable',
                ),
                label: input.translate('r002bGrowth.chapter.currentStage'),
                supportingText: input.translate(
                  'r002bParentProgress.summary.currentStageUnavailable',
                ),
                value: '—',
              },
        ),
        currentStageProgress:
          projection.currentStage?.nextThreshold === null || !projection.currentStage
            ? undefined
            : Object.freeze({
                accessibilityLabel: input.translate('r002bGrowth.chapter.numericRange', {
                  current: format.format(projection.currentStage.cumulativeSeeds),
                  target: format.format(projection.currentStage.nextThreshold),
                }),
                current: projection.currentStage.cumulativeSeeds,
                maximum: projection.currentStage.nextThreshold,
                valueText: input.translate('r002bGrowth.chapter.numericRange', {
                  current: format.format(projection.currentStage.cumulativeSeeds),
                  target: format.format(projection.currentStage.nextThreshold),
                }),
                visualPercent: boundedPercent(
                  (projection.currentStage.cumulativeSeeds /
                    projection.currentStage.nextThreshold) *
                    100,
                ),
              }),
        lifetime: Object.freeze({
          accessibilityLabel: `${input.translate('r002bGrowth.chapter.lifetime')}. ${format.format(
            projection.lifetimeSeeds,
          )}`,
          label: input.translate('r002bGrowth.chapter.lifetime'),
          supportingText: input.translate('r002bParentProgress.summary.lifetimeSupporting'),
          value: format.format(projection.lifetimeSeeds),
        }),
      })
    : null;

  const archives = projection
    ? archiveItems({ format, projection, translate: input.translate })
    : Object.freeze([]);
  const badges = projection
    ? badgeItems({
        format,
        language: input.language,
        projection,
        translate: input.translate,
      })
    : Object.freeze([]);
  const learning = projection
    ? learningItems({ projection, translate: input.translate })
    : Object.freeze([]);
  const suggestions = projection
    ? suggestionItems({
        onOpenSuitableTask: input.onOpenSuitableTask,
        projection,
        translate: input.translate,
      })
    : Object.freeze([]);

  return Object.freeze({
    archiveEmptyText: input.translate('r002bParentProgress.archive.empty'),
    archiveHeading: input.translate('r002bParentProgress.archive.heading'),
    archiveItems: archives,
    badgeItems: badges,
    badgesEmptyText: input.translate('r002bParentProgress.badges.empty'),
    badgesHeading: input.translate('r002bParentProgress.badges.heading'),
    badgesSummary: input.translate('r002bParentProgress.badges.summary', {
      earned: format.format(projection?.earnedBadges.length ?? 0),
      total: format.format(projection?.badges.length ?? 0),
    }),
    contentState,
    description: input.translate('r002bParentProgress.description'),
    direction: input.direction,
    groupLabel: input.translate('r002bParentProgress.groupLabel'),
    language: input.language,
    learningEmptyText: input.translate('r002bParentProgress.learning.empty'),
    learningHeading: input.translate('r002bParentProgress.learning.heading'),
    learningItems: learning,
    privateNote: input.translate('r002bParentProgress.privateNote'),
    profileOptions: options,
    profileSelectorHeading: input.translate('r002bParentProgress.profileSelectorHeading'),
    readOnlyNote: input.translate('r002bParentProgress.readOnlyNote'),
    reducedMotion: input.reducedMotion,
    selectedProfileAnnouncement: input.translate('r002bParentProgress.profileChanged', {
      name: contentState === 'unauthorized' ? '' : input.profileName,
    }),
    selectedProfileLabel:
      contentState === 'unauthorized'
        ? input.translate('r002bParentProgress.profileSelectorHeading')
        : selectedProfileLabel,
    stateLabel,
    suggestions,
    suggestionsEmptyText: input.translate('r002bParentProgress.suggestions.empty'),
    suggestionsHeading: input.translate('r002bParentProgress.suggestions.heading'),
    summary,
    summaryHeading: input.translate('r002bParentProgress.summary.heading'),
    testID: 'r002b-parent-progress-screen',
    title: input.translate('r002bParentProgress.title'),
  });
}
