import { beforeEach, describe, expect, it } from 'vitest';

import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { serviceRegistry } from '../src/services';

async function reachAwaitingParent(): Promise<void> {
  const state = usePrototypeStore.getState();
  state.applyDemoInput();
  expect(state.startGeneration().ok).toBe(true);
  expect((await usePrototypeStore.getState().completeGeneration()).ok).toBe(true);
  expect(usePrototypeStore.getState().approveMission().ok).toBe(true);
  expect(usePrototypeStore.getState().openChildMission().ok).toBe(true);
  const mission = usePrototypeStore.getState().activeMission;
  if (!mission) throw new Error('Expected active mission');
  for (const step of mission.steps) {
    expect(usePrototypeStore.getState().setStepCompleted(step.id, true).ok).toBe(true);
  }
  usePrototypeStore.getState().choosePreparedEvidence();
  usePrototypeStore.getState().setReflection('تعلمت أن الخبز نعمة نستفيد منها.');
  expect(usePrototypeStore.getState().submitForConfirmation().ok).toBe(true);
}

describe('Parent completion decision', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetDemo();
  });

  it('returns a retry to Child work without awarding anything', async () => {
    await reachAwaitingParent();
    const before = usePrototypeStore.getState();

    expect(before.requestRetry().ok).toBe(true);

    const after = usePrototypeStore.getState();
    expect(after.journeyStatus).toBe('child-in-progress');
    expect(after.impactSummary).toEqual(before.impactSummary);
    expect(after.ghaf).toEqual(before.ghaf);
    expect(after.sessionImpactRecords).toEqual([]);
    expect(after.celebration).toBeNull();
  });

  it('validates quantity and applies one award across five approval attempts', async () => {
    await reachAwaitingParent();

    expect(
      usePrototypeStore.getState().approveCompletion({ value: 0, unit: 'grams' }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(
        usePrototypeStore.getState().approveCompletion({ value: 250, unit: 'grams' }),
      ).toMatchObject({ ok: true });
    }

    const state = usePrototypeStore.getState();
    expect(state.sessionImpactRecords).toHaveLength(1);
    expect(state.impactSummary).toEqual({
      rescuedGrams: 1_500,
      rescuedPortions: 5,
      completedMissions: 4,
      streakDays: 3,
    });
    expect(state.ghaf).toMatchObject({
      stage: 3,
      progressPercent: 60,
      progressPoints: 60,
      unlockedMilestoneIds: ['sapling', 'new-branch'],
    });
    expect(state.celebration).toMatchObject({
      awardedProgressPoints: 12,
      milestoneId: 'new-branch',
      reward: { en: 'Golden Ghaf Leaf' },
    });
  });

  it('defensively rejects completion when Parent assignment approval is absent', async () => {
    await reachAwaitingParent();
    const state = usePrototypeStore.getState();
    if (!state.activeMission || !state.submission) throw new Error('Expected awaiting submission');

    const result = serviceRegistry.impact.approveCompletion(
      {
        mission: { ...state.activeMission, approvedByParent: false },
        submission: state.submission,
        confirmedQuantity: { value: 250, unit: 'grams' },
        currentSummary: state.impactSummary,
        currentGhaf: state.ghaf,
      },
      state.sessionImpactRecords,
    );

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(usePrototypeStore.getState().sessionImpactRecords).toEqual([]);
  });
});
