import type {
  AccessibleLearningScreenProps,
  LearningActionPresentation,
  LearningCheckPresentation,
  LearningContentState,
  LearningScreenPresentationProps,
  LearningSectionPresentation,
  MangroveStoryScreenProps,
} from '@/components/r002b/LearningScreens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type {
  LearningCheckOptionId,
  LearningContentStepId,
  LearningRoute,
  MangroveLearningState,
} from '@/models/learning';

import { MANGROVE_ROOTS_LEARNING_PACKAGE } from './mangroveLearning';

export type R002bLearningTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface R002bLearningPresentationActions {
  readonly advance: (stepId: LearningContentStepId) => void;
  readonly answer: (optionId: LearningCheckOptionId) => void;
  readonly complete: () => void;
  readonly switchMode: (route: LearningRoute) => void;
}

export type R002bLearningPresentation =
  | { readonly kind: 'story'; readonly props: MangroveStoryScreenProps }
  | { readonly kind: 'accessible'; readonly props: AccessibleLearningScreenProps };

const STEP_TRANSLATION_KEYS: Readonly<Record<LearningContentStepId, string>> = {
  story_frame_1: 'story.frame1',
  story_frame_2: 'story.frame2',
  accessible_section_1: 'accessible.section1',
  accessible_section_2: 'accessible.section2',
};

function sectionState(input: {
  readonly completed: boolean;
  readonly firstIncompleteStepId: LearningContentStepId | undefined;
  readonly stepId: LearningContentStepId;
}): LearningSectionPresentation['state'] {
  if (input.completed) return 'complete';
  return input.firstIncompleteStepId === input.stepId ? 'current' : 'upcoming';
}

function contentState(input: {
  readonly actionError?: boolean;
  readonly state: MangroveLearningState;
  readonly route: LearningRoute;
}): LearningContentState {
  if (input.actionError) return 'error';
  if (input.state.completion !== null) {
    return input.state.completion.route === input.route ? 'completed' : 'already_completed';
  }
  const progress = input.state.routeProgress[input.route];
  if (progress.completedContentStepIds.length > 0 || progress.checkAttempts > 0) return 'resumed';
  return 'ready';
}

function statusLabel(input: {
  readonly actionError?: boolean;
  readonly state: MangroveLearningState;
  readonly route: LearningRoute;
  readonly translate: R002bLearningTranslate;
}): string {
  if (input.actionError) {
    return input.translate('learning.mangroveRoots.presentation.status.error');
  }
  const progress = input.state.routeProgress[input.route];
  if (input.state.completion !== null) {
    return input.translate(
      input.state.completion.route === input.route
        ? 'learning.mangroveRoots.presentation.status.complete'
        : 'learning.mangroveRoots.presentation.status.alreadyComplete',
    );
  }
  if (progress.lifecycle === 'ready_to_complete') {
    return input.translate('learning.mangroveRoots.presentation.status.readyToComplete');
  }
  if (progress.lifecycle === 'awaiting_check' && progress.checkAttempts > 0) {
    return input.translate('learning.mangroveRoots.presentation.status.retry');
  }
  if (progress.lifecycle === 'awaiting_check') {
    return input.translate('learning.mangroveRoots.presentation.status.check');
  }
  if (progress.completedContentStepIds.length > 0) {
    return input.translate('learning.mangroveRoots.presentation.status.resumed');
  }
  return input.translate('learning.mangroveRoots.presentation.status.ready');
}

function createSections(input: {
  readonly state: MangroveLearningState;
  readonly route: LearningRoute;
  readonly translate: R002bLearningTranslate;
}): readonly LearningSectionPresentation[] {
  const progress = input.state.routeProgress[input.route];
  const stepIds = MANGROVE_ROOTS_LEARNING_PACKAGE.routes[input.route].contentStepIds;
  const completePackage = input.state.completion !== null;
  const firstIncompleteStepId = stepIds.find(
    (stepId) => !progress.completedContentStepIds.includes(stepId),
  );

  return Object.freeze(
    stepIds.map((stepId) => {
      const complete = completePackage || progress.completedContentStepIds.includes(stepId);
      const state = sectionState({ completed: complete, firstIncompleteStepId, stepId });
      const key = STEP_TRANSLATION_KEYS[stepId];
      return Object.freeze({
        id: stepId,
        state,
        title: input.translate(`learning.mangroveRoots.${key}.title`, {
          defaultValue: input.translate(`learning.mangroveRoots.${key}.heading`),
        }),
        body: input.translate(`learning.mangroveRoots.${key}.body`),
        statusLabel: input.translate(`learning.mangroveRoots.presentation.sectionStatus.${state}`),
      });
    }),
  );
}

function createCheck(input: {
  readonly actions: R002bLearningPresentationActions;
  readonly route: LearningRoute;
  readonly selectedOptionId: LearningCheckOptionId | null;
  readonly state: MangroveLearningState;
  readonly translate: R002bLearningTranslate;
}): LearningCheckPresentation | undefined {
  const progress = input.state.routeProgress[input.route];
  const contentComplete =
    progress.completedContentStepIds.length ===
      MANGROVE_ROOTS_LEARNING_PACKAGE.routes[input.route].contentStepIds.length ||
    input.state.completion !== null;
  if (!contentComplete) return undefined;

  const result =
    progress.checkSatisfied || input.state.completion !== null
      ? ('correct' as const)
      : progress.checkAttempts > 0
        ? ('retry' as const)
        : ('idle' as const);
  const disabled = result === 'correct';
  const optionIds = ['habitat_support_and_care', 'visit_or_task_reward'] as const;

  return Object.freeze({
    accessibilityLabel: input.translate('learning.mangroveRoots.presentation.check.accessibility'),
    heading: input.translate('learning.mangroveRoots.presentation.check.heading'),
    noFailText: input.translate('learning.mangroveRoots.presentation.check.noFail'),
    prompt: input.translate('learning.mangroveRoots.check.prompt'),
    result,
    ...(result === 'idle'
      ? {}
      : {
          feedbackText: input.translate(
            result === 'correct'
              ? 'learning.mangroveRoots.check.success'
              : 'learning.mangroveRoots.check.retry',
          ),
        }),
    options: Object.freeze(
      optionIds.map((optionId) => {
        const label = input.translate(
          optionId === 'habitat_support_and_care'
            ? 'learning.mangroveRoots.check.option.habitatSupportAndCare'
            : 'learning.mangroveRoots.check.option.visitOrTaskReward',
        );
        return Object.freeze({
          id: optionId,
          label,
          accessibilityLabel: label,
          disabled,
          selected:
            (progress.checkSatisfied || input.state.completion !== null
              ? 'habitat_support_and_care'
              : input.selectedOptionId) === optionId,
          onPress: () => input.actions.answer(optionId),
          testID: `r002b-learning-check-${optionId}`,
        });
      }),
    ),
  });
}

function createPrimaryAction(input: {
  readonly actions: R002bLearningPresentationActions;
  readonly route: LearningRoute;
  readonly state: MangroveLearningState;
  readonly translate: R002bLearningTranslate;
}): LearningActionPresentation | undefined {
  if (input.state.completion !== null) return undefined;
  const progress = input.state.routeProgress[input.route];
  if (progress.lifecycle === 'ready_to_complete') {
    const label = input.translate('learning.mangroveRoots.action.complete');
    return Object.freeze({
      accessibilityLabel: label,
      label,
      onPress: input.actions.complete,
      testID: 'r002b-learning-complete-action',
    });
  }
  if (progress.lifecycle !== 'in_progress') return undefined;
  const nextStep = MANGROVE_ROOTS_LEARNING_PACKAGE.routes[input.route].contentStepIds.find(
    (stepId) => !progress.completedContentStepIds.includes(stepId),
  );
  if (!nextStep) return undefined;
  const label = input.translate('learning.mangroveRoots.action.continue');
  return Object.freeze({
    accessibilityLabel: label,
    label,
    onPress: () => input.actions.advance(nextStep),
    testID: 'r002b-learning-continue-action',
  });
}

export function createR002bLearningPresentation(input: {
  readonly actionError?: boolean;
  readonly actions: R002bLearningPresentationActions;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly reducedMotion: boolean;
  readonly route: LearningRoute;
  readonly selectedOptionId: LearningCheckOptionId | null;
  readonly state: MangroveLearningState;
  readonly translate: R002bLearningTranslate;
}): R002bLearningPresentation {
  const progress = input.state.routeProgress[input.route];
  const total = MANGROVE_ROOTS_LEARNING_PACKAGE.routes[input.route].contentStepIds.length + 1;
  const current = input.state.completion
    ? total
    : progress.completedContentStepIds.length + (progress.checkSatisfied ? 1 : 0);
  const otherRoute: LearningRoute = input.route === 'story' ? 'accessible' : 'story';
  const modeSwitchLabel = input.translate(
    `learning.mangroveRoots.presentation.switchMode.${otherRoute}`,
  );
  const sections = createSections(input);
  const shared: LearningScreenPresentationProps = {
    contentState: contentState(input),
    direction: input.direction,
    disclosureText: input.translate('learning.mangroveRoots.disclosure'),
    equivalenceText: input.translate('learning.mangroveRoots.presentation.equivalence'),
    groupLabel: input.translate('learning.mangroveRoots.presentation.groupLabel'),
    language: input.language,
    modeLabel: input.translate(`learning.mangroveRoots.presentation.mode.${input.route}`),
    modeSwitchAction: Object.freeze({
      accessibilityLabel: modeSwitchLabel,
      label: modeSwitchLabel,
      onPress: () => input.actions.switchMode(otherRoute),
      testID: `r002b-learning-switch-${otherRoute}`,
    }),
    objectiveText: input.translate('learning.mangroveRoots.objective'),
    packageIdentityText: input.translate('learning.mangroveRoots.presentation.packageIdentity'),
    primaryAction: createPrimaryAction(input),
    progress: Object.freeze({
      accessibilityLabel: input.translate(
        'learning.mangroveRoots.presentation.progress.accessibility',
        { current, total },
      ),
      current,
      label: input.translate('learning.mangroveRoots.presentation.progress.label'),
      total,
      valueText: input.translate('learning.mangroveRoots.presentation.progress.value', {
        current,
        total,
      }),
      visualPercent: Math.round((current / total) * 100),
    }),
    reducedMotion: input.reducedMotion,
    sections,
    sourceHeading: input.translate('learning.mangroveRoots.presentation.sourceHeading'),
    sourceText: input.translate('learning.mangroveRoots.sources.note'),
    statusLabel: statusLabel(input),
    title: input.translate('learning.mangroveRoots.title'),
    check: createCheck(input),
    ...(input.actionError
      ? {
          announcementText: input.translate('learning.mangroveRoots.presentation.status.error'),
        }
      : {}),
    ...(input.state.completion === null
      ? {}
      : {
          completionSummaryText: input.translate('learning.mangroveRoots.presentation.completion'),
        }),
  };

  if (input.route === 'story') {
    return Object.freeze({
      kind: 'story',
      props: Object.freeze({
        ...shared,
        illustrationAccessibilityLabel: input.translate(
          'learning.mangroveRoots.presentation.illustration',
        ),
        testID: 'r002b-learning-story-screen',
      }),
    });
  }
  return Object.freeze({
    kind: 'accessible',
    props: Object.freeze({
      ...shared,
      parentGuideHeading: input.translate('learning.mangroveRoots.presentation.parentGuideHeading'),
      parentGuideText: input.translate('learning.mangroveRoots.presentation.parentGuide'),
      testID: 'r002b-learning-accessible-screen',
    }),
  });
}
