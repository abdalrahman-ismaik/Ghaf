import { beforeEach, describe, expect, it } from 'vitest';

import {
  projectParentChildProgress,
  resolveParentProgressTaskPrefill,
  type ParentProgressAuthority,
} from '@/features/growth/parentProgress';
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

function salemInput() {
  const state = usePrototypeStore.getState();
  const profileEpochId = state.growthJourney.ledgersByProfile.child_salem.profileEpochId;
  return {
    authority: AUTHORITY,
    runtime: state.growthJourney,
    profileId: 'child_salem' as const,
    currentStageEvidence: {
      profileId: 'child_salem' as const,
      profileEpochId,
      landscapeId: 'mangrove' as const,
      cumulativeSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
      stage: state.landscapeProgress.mangrove.stage,
      nextThreshold: state.landscapeProgress.mangrove.nextThreshold,
      symbolicOnly: true as const,
    },
    journey: state.journey,
    learningState: state.mangroveLearningByProfile.child_salem,
  };
}

describe('R002b Parent Child Progress projection', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('keeps Salem lifetime and current-stage authorities visually distinct and read-only', () => {
    const input = salemInput();
    const before = structuredClone(input);
    const result = projectParentChildProgress(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({
      profileId: 'child_salem',
      lifetimeSeeds: 108,
      currentStage: {
        landscapeId: 'mangrove',
        cumulativeSeeds: 48,
        stage: 'shoot',
        nextThreshold: 60,
        symbolicOnly: true,
      },
      completedStages: [],
      unlockedLearning: [],
      private: true,
      readOnly: true,
    });
    expect(result.data.earnedBadges).toHaveLength(2);
    expect(result.data.badges).toHaveLength(16);
    expect(result.data.badges.some((badge) => badge.displayState !== 'earned')).toBe(true);
    expect(result.data.badges.every((badge) => badge.criteria.length > 0)).toBe(true);
    expect(input).toEqual(before);
    expect(Object.isFrozen(result.data)).toBe(true);
  });

  it('offers only a transparent prefill intent and cannot assign or create a task', () => {
    const result = projectParentChildProgress(salemInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.suitableTaskSuggestions).toEqual([
      expect.objectContaining({
        profileId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        categoryId: 'green_impact',
        prefill: {
          route: '/parent/task/new',
          childId: 'child_salem',
          templateId: 'task_recycling_p0_v1',
          intent: 'prefill_only',
          requiresParentReviewAndSave: true,
        },
      }),
    ]);
    const serialized = JSON.stringify(result.data.suitableTaskSuggestions);
    expect(serialized).not.toMatch(/assignmentId|assignedAt|seedDelta|award/u);
  });

  it('accepts only the default-off, profile-bound Task Builder prefill contract', () => {
    const params = {
      prefillIntent: 'prefill_only',
      prefillChildId: 'child_salem',
      prefillTemplateId: 'task_recycling_p0_v1',
    };

    expect(
      resolveParentProgressTaskPrefill({
        enabled: true,
        activeChildId: 'child_salem',
        params,
      }),
    ).toEqual({
      route: '/parent/task/new',
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      intent: 'prefill_only',
      requiresParentReviewAndSave: true,
    });
    expect(
      resolveParentProgressTaskPrefill({
        enabled: false,
        activeChildId: 'child_salem',
        params,
      }),
    ).toBeNull();
    expect(
      resolveParentProgressTaskPrefill({
        enabled: true,
        activeChildId: 'child_alya',
        params,
      }),
    ).toBeNull();
    expect(
      resolveParentProgressTaskPrefill({
        enabled: true,
        activeChildId: 'child_salem',
        params: { ...params, prefillIntent: ['prefill_only'] },
      }),
    ).toBeNull();
  });

  it('recomputes Alya without borrowing Salem stage, learning, origin, or task suggestion', () => {
    const state = usePrototypeStore.getState();
    const result = projectParentChildProgress({
      authority: AUTHORITY,
      runtime: state.growthJourney,
      profileId: 'child_alya',
      currentStageEvidence: null,
      journey: state.journey,
      learningState: state.mangroveLearningByProfile.child_alya,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.profileId).toBe('child_alya');
    expect(result.data.lifetimeSeeds).toBe(36);
    expect(result.data.currentStage).toBeNull();
    expect(result.data.completedStages).toEqual([]);
    expect(result.data.unlockedLearning).toEqual([]);
    expect(result.data.suitableTaskSuggestions).toEqual([]);
    expect(JSON.stringify(result.data)).not.toContain('child_salem');
  });

  it('fails closed for Child, missing report capability, and unauthorized profiles', () => {
    const input = salemInput();

    expect(
      projectParentChildProgress({
        ...input,
        authority: { ...AUTHORITY, role: 'child' },
      } as never),
    ).toMatchObject({ ok: false, error: { code: 'PARENT_AUTHORITY_REQUIRED' } });
    expect(
      projectParentChildProgress({
        ...input,
        authority: { ...AUTHORITY, capability: 'manage_tasks' },
      } as never),
    ).toMatchObject({ ok: false, error: { code: 'PARENT_AUTHORITY_REQUIRED' } });
    expect(
      projectParentChildProgress({
        ...input,
        authority: { ...AUTHORITY, authorizedProfileIds: ['child_alya'] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
  });

  it('rejects profile or reset-epoch mismatches instead of leaking another Child projection', () => {
    const input = salemInput();
    expect(
      projectParentChildProgress({
        ...input,
        currentStageEvidence: {
          ...input.currentStageEvidence,
          profileId: 'child_alya',
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      projectParentChildProgress({
        ...input,
        learningState: {
          ...input.learningState,
          profileEpochId: 'another-reset-epoch',
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'EPOCH_SCOPE_MISMATCH' } });
  });
});
