import { describe, expect, it, vi } from 'vitest';

import {
  MANGROVE_ROOTS_LEARNING_PACKAGE,
  advanceMangroveLearningStep,
  completeMangroveLearning,
  createMangroveLearningState,
  startMangroveLearningRoute,
  submitMangroveLearningCheck,
} from '@/features/learning/mangroveLearning';
import { createR002bLearningPresentation } from '@/features/learning/r002bLearningViewModel';
import type { LearningRoute, MangroveLearningState } from '@/models/learning';

const profileId = 'child_salem';
const profileEpochId = 'epoch-r002b-learning';
const origin = {
  kind: 'impact_path',
  route: '/garden/impact-path',
  profileId,
  focusTargetId: 'impact-path-learning-station-132',
  scrollOffset: 420,
} as const;
const translate = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${JSON.stringify(values)}` : key;

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

function started(route: LearningRoute): MangroveLearningState {
  const created = createMangroveLearningState({ profileId, profileEpochId });
  expectOk(created);
  const result = startMangroveLearningRoute({
    state: created.data,
    profileId,
    profileEpochId,
    route,
    origin,
    unlockEvidence: {
      profileId,
      profileEpochId,
      source: 'canonical_impact_path_projection',
      reachedThresholds: [120, 132],
    },
  });
  expectOk(result);
  return result.data.state;
}

function createActions() {
  return {
    advance: vi.fn(),
    answer: vi.fn(),
    complete: vi.fn(),
    switchMode: vi.fn(),
  };
}

function present(
  state: MangroveLearningState,
  route: LearningRoute,
  selectedOptionId: 'habitat_support_and_care' | 'visit_or_task_reward' | null = null,
) {
  return createR002bLearningPresentation({
    state,
    route,
    language: 'en',
    direction: 'ltr',
    reducedMotion: true,
    selectedOptionId,
    translate,
    actions: createActions(),
  });
}

describe('R002b learning presentation model', () => {
  it('maps the finite Story route to ordered sections and the next canonical step', () => {
    const state = started('story');
    const actions = createActions();
    const view = createR002bLearningPresentation({
      state,
      route: 'story',
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      selectedOptionId: null,
      translate,
      actions,
    });

    expect(view.kind).toBe('story');
    expect(view.props.sections).toHaveLength(2);
    expect(view.props.sections.map((section) => section.state)).toEqual(['current', 'upcoming']);
    expect(view.props.progress).toMatchObject({ current: 0, total: 3, visualPercent: 0 });
    expect(view.props.primaryAction?.testID).toBe('r002b-learning-continue-action');

    view.props.primaryAction?.onPress();
    expect(actions.advance).toHaveBeenCalledWith('story_frame_1');
    expect(view.props.check).toBeUndefined();
  });

  it('shows the shared no-fail check only after all route content is recorded', () => {
    let state = started('accessible');
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds) {
      const result = advanceMangroveLearningStep({
        state,
        profileId,
        profileEpochId,
        route: 'accessible',
        stepId,
      });
      expectOk(result);
      state = result.data.state;
    }

    const actions = createActions();
    const view = createR002bLearningPresentation({
      state,
      route: 'accessible',
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      selectedOptionId: 'visit_or_task_reward',
      translate,
      actions,
    });

    expect(view.kind).toBe('accessible');
    expect(view.props.check?.result).toBe('idle');
    expect(view.props.check?.options).toHaveLength(2);
    view.props.check?.options.at(0)?.onPress();
    expect(actions.answer).toHaveBeenCalledWith('habitat_support_and_care');
  });

  it('offers completion only after the canonical answer and never presents a reward', () => {
    let state = started('story');
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
      const result = advanceMangroveLearningStep({
        state,
        profileId,
        profileEpochId,
        route: 'story',
        stepId,
      });
      expectOk(result);
      state = result.data.state;
    }
    const checked = submitMangroveLearningCheck({
      state,
      profileId,
      profileEpochId,
      route: 'story',
      optionId: 'habitat_support_and_care',
    });
    expectOk(checked);

    const view = present(checked.data.state, 'story', 'habitat_support_and_care');
    expect(view.props.check?.result).toBe('correct');
    expect(
      view.props.check?.options.find((option) => option.id === 'habitat_support_and_care')
        ?.selected,
    ).toBe(true);
    expect(view.props.statusLabel).toContain('readyToComplete');
    expect(view.props.primaryAction?.testID).toBe('r002b-learning-complete-action');
    expect(JSON.stringify(view)).not.toMatch(/(?:\+12|rewardAmount|seedDelta)/u);
  });

  it('restores the canonical correct selection without transient route state', () => {
    let state = started('story');
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds) {
      const advanced = advanceMangroveLearningStep({
        state,
        profileId,
        profileEpochId,
        route: 'story',
        stepId,
      });
      expectOk(advanced);
      state = advanced.data.state;
    }
    const checked = submitMangroveLearningCheck({
      state,
      profileId,
      profileEpochId,
      route: 'story',
      optionId: 'habitat_support_and_care',
    });
    expectOk(checked);

    const restored = present(checked.data.state, 'story');
    expect(restored.props.check?.result).toBe('correct');
    expect(restored.props.check?.options.map(({ id, selected }) => ({ id, selected }))).toEqual([
      { id: 'habitat_support_and_care', selected: true },
      { id: 'visit_or_task_reward', selected: false },
    ]);
  });

  it('renders one stable equal-credit completion from either route', () => {
    let state = started('accessible');
    for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds) {
      const advanced = advanceMangroveLearningStep({
        state,
        profileId,
        profileEpochId,
        route: 'accessible',
        stepId,
      });
      expectOk(advanced);
      state = advanced.data.state;
    }
    const checked = submitMangroveLearningCheck({
      state,
      profileId,
      profileEpochId,
      route: 'accessible',
      optionId: 'habitat_support_and_care',
    });
    expectOk(checked);
    const completed = completeMangroveLearning({
      state: checked.data.state,
      profileId,
      profileEpochId,
      route: 'accessible',
      completedAt: '2026-09-05T12:30:00.000Z',
    });
    expectOk(completed);

    const accessible = present(completed.data.state, 'accessible');
    const story = present(completed.data.state, 'story');
    expect(accessible.props.contentState).toBe('completed');
    expect(story.props.contentState).toBe('already_completed');
    expect(story.props.completionSummaryText).toBeTruthy();
    expect(accessible.props.modeSwitchAction.testID).toBe('r002b-learning-switch-story');
  });
});
