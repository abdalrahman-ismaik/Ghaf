import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createR002bParentProgressPresentation } from '@/features/growth/r002bParentProgressViewModel';
import {
  projectParentChildProgress,
  type ParentChildProgressProjection,
  type ParentProgressAuthority,
} from '@/features/growth/parentProgress';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const AUTHORITY: ParentProgressAuthority = {
  role: 'parent',
  parentId: 'parent_al_noor',
  householdId: 'household_al_noor',
  capability: 'view_parent_reports',
  authorizedProfileIds: ['child_salem', 'child_alya'],
  origin: 'synthetic',
  capabilityTruth: 'local_prototype_not_authentication',
};

const translate = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${JSON.stringify(values)}` : key;

function project(profileId: SyntheticChildId): ParentChildProgressProjection {
  const state = usePrototypeStore.getState();
  const profileEpochId = state.growthJourney.ledgersByProfile[profileId].profileEpochId;
  const result = projectParentChildProgress({
    authority: AUTHORITY,
    runtime: state.growthJourney,
    profileId,
    currentStageEvidence:
      profileId === 'child_salem'
        ? {
            profileId,
            profileEpochId,
            landscapeId: 'mangrove',
            cumulativeSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
            stage: state.landscapeProgress.mangrove.stage,
            nextThreshold: state.landscapeProgress.mangrove.nextThreshold,
            symbolicOnly: true,
          }
        : null,
    journey: state.journey,
    learningState: state.mangroveLearningByProfile[profileId],
  });

  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error.code);
  return result.data;
}

function present(
  projection: ParentChildProgressProjection | null,
  overrides: Partial<Parameters<typeof createR002bParentProgressPresentation>[0]> = {},
) {
  return createR002bParentProgressPresentation({
    projection,
    selectedProfileId: projection?.profileId ?? 'child_salem',
    profileName: projection?.profileId === 'child_alya' ? 'Alya' : 'Salem',
    profiles: [
      { id: 'child_salem', name: 'Salem' },
      { id: 'child_alya', name: 'Alya' },
    ],
    language: 'en',
    direction: 'ltr',
    reducedMotion: false,
    translate,
    ...overrides,
  });
}

describe('R002b Parent Progress presentation model', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('maps lifetime and current-stage authorities separately without mutating the projection', () => {
    const projection = project('child_salem');
    const before = structuredClone(projection);
    const view = present(projection);

    expect(view.contentState).toBe('ready');
    expect(view.summary?.lifetime.value).toBe('108');
    expect(view.summary?.currentStage.value).toContain('48');
    expect(view.summary?.currentStage.value).toContain('60');
    expect(view.summary?.currentStageProgress).toMatchObject({
      current: 48,
      maximum: 60,
      visualPercent: 80,
    });
    expect(view.archiveItems).toHaveLength(projection.completedStages.length);
    expect(projection).toEqual(before);
    expect(Object.isFrozen(view)).toBe(true);
    expect(Object.isFrozen(view.badgeItems)).toBe(true);
  });

  it('shows earned and actionable progress with exact deterministic criteria but omits locked noise', () => {
    const projection = project('child_salem');
    const view = present(projection);
    const expectedVisible = projection.badges.filter((badge) => badge.displayState !== 'locked');

    expect(view.badgeItems).toHaveLength(expectedVisible.length);
    expect(view.badgeItems.some((badge) => badge.state === 'earned')).toBe(true);
    expect(view.badgeItems.every((badge) => badge.criterionText.length > 0)).toBe(true);
    expect(view.badgeItems.every((badge) => badge.progress.maximum >= 1)).toBe(true);
    expect(view.badgesSummary).toContain(String(projection.earnedBadges.length));
    expect(view.badgesSummary).toContain(String(projection.badges.length));
  });

  it('emits only the exact typed Task Builder prefill intent', () => {
    const projection = project('child_salem');
    const onOpenSuitableTask = vi.fn();
    const view = present(projection, { onOpenSuitableTask });
    const suggestion = view.suggestions[0];

    expect(suggestion?.action).toBeDefined();
    suggestion?.action?.onPress();
    expect(onOpenSuitableTask).toHaveBeenCalledTimes(1);
    expect(onOpenSuitableTask).toHaveBeenCalledWith(projection.suitableTaskSuggestions[0]?.prefill);
    expect(onOpenSuitableTask.mock.calls[0]?.[0]).toEqual({
      route: '/parent/task/new',
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      intent: 'prefill_only',
      requiresParentReviewAndSave: true,
    });
  });

  it('keeps a suggestion informative and unavailable when no safe Task Builder action exists', () => {
    const view = present(project('child_salem'));

    expect(view.suggestions[0]?.action).toBeUndefined();
    expect(view.suggestions[0]?.unavailableText).toBe(
      'r002bParentProgress.suggestions.unavailable',
    );
  });

  it('recomputes profile options and never leaks Salem content into an Alya presentation', () => {
    const onSelectProfile = vi.fn();
    const alya = present(project('child_alya'), {
      selectedProfileId: 'child_alya',
      profileName: 'Alya',
      onSelectProfile,
    });

    expect(alya.summary?.lifetime.value).toBe('36');
    expect(alya.summary?.currentStageProgress).toBeUndefined();
    expect(alya.suggestions).toEqual([]);
    expect(JSON.stringify(alya.summary)).not.toContain('108');
    expect(alya.profileOptions.find((option) => option.id === 'child_alya')).toMatchObject({
      selected: true,
      disabled: false,
      accessibilityLabel: 'Alya. accessibility.selected',
    });

    const salemOption = alya.profileOptions.find((option) => option.id === 'child_salem');
    expect(salemOption).toMatchObject({
      selected: false,
      disabled: false,
      accessibilityLabel: 'Salem. accessibility.notSelected',
    });
    salemOption?.onPress?.();
    expect(onSelectProfile).toHaveBeenCalledWith('child_salem');
  });

  it('fails closed when the selected profile and projection disagree', () => {
    const view = present(project('child_salem'), {
      selectedProfileId: 'child_alya',
      profileName: 'Alya',
    });

    expect(view.contentState).toBe('error');
    expect(view.summary).toBeNull();
    expect(view.badgeItems).toEqual([]);
    expect(view.learningItems).toEqual([]);
    expect(view.suggestions).toEqual([]);
    expect(JSON.stringify(view)).not.toContain('task_recycling_p0_v1');
  });

  it('models conservative loading, empty, error, and unauthorized states without projection data', () => {
    for (const contentState of ['loading', 'error', 'unauthorized'] as const) {
      const view = present(project('child_salem'), { contentState });
      expect(view.contentState).toBe(contentState);
      expect(view.summary).toBeNull();
      expect(view.suggestions).toEqual([]);
    }

    const empty = present(null);
    expect(empty.contentState).toBe('empty');
    expect(empty.summary).toBeNull();
    expect(empty.badgeItems).toEqual([]);
  });

  it('fails closed for a stale projection until its canonical inputs are refreshed', () => {
    const stale = present(project('child_salem'), { contentState: 'stale' });

    expect(stale.contentState).toBe('stale');
    expect(stale.summary).toBeNull();
    expect(stale.badgeItems).toEqual([]);
    expect(stale.learningItems).toEqual([]);
    expect(stale.suggestions).toEqual([]);
  });

  it('preserves Arabic RTL, English LTR, reduced motion, and localized recovery copy', () => {
    const projection = project('child_salem');
    const arabic = present(projection, {
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      contentState: 'interrupted',
    });
    const english = present(projection);

    expect(arabic).toMatchObject({
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      contentState: 'interrupted',
      stateLabel: 'r002bParentProgress.state.interrupted',
    });
    expect(english).toMatchObject({ language: 'en', direction: 'ltr', reducedMotion: false });
    expect(arabic.summary?.lifetime.value).toBeTruthy();
    expect(english.summary?.lifetime.value).toBeTruthy();
  });
});
