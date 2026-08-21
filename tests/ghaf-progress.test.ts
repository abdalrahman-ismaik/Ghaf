import { describe, expect, it } from 'vitest';

import {
  applyGhafAward,
  deriveGhafStage,
  GHAF_STAGE_NAMES,
} from '../src/features/ghaf-tree/progression';
import type { GhafProgress } from '../src/models/prototype';

const sapling: GhafProgress = {
  stage: 2,
  progressPercent: 48,
  progressPoints: 48,
  unlockedMilestoneIds: ['sapling'],
  newMilestone: null,
};

describe('six-stage Ghaf progression', () => {
  it('derives all six approved stages from configured thresholds', () => {
    expect(GHAF_STAGE_NAMES).toHaveLength(6);
    expect([0, 20, 40, 60, 80, 100].map(deriveGhafStage)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('adds below-threshold progress without claiming a new milestone', () => {
    expect(applyGhafAward(sapling, 11)).toEqual({
      ...sapling,
      progressPoints: 59,
      progressPercent: 59,
    });
  });

  it('crosses the approved demo threshold once and unlocks the new branch', () => {
    const first = applyGhafAward(sapling, 12);
    const repeated = applyGhafAward(first, 0);

    expect(first).toMatchObject({
      stage: 3,
      progressPercent: 60,
      progressPoints: 60,
      unlockedMilestoneIds: ['sapling', 'new-branch'],
      newMilestone: { en: 'A new branch appears' },
    });
    expect(repeated.unlockedMilestoneIds).toEqual(['sapling', 'new-branch']);
    expect(repeated.newMilestone).toBeNull();
  });

  it('clamps at Full Ghaf tree without inventing a seventh stage', () => {
    const full: GhafProgress = {
      stage: 5,
      progressPercent: 100,
      progressPoints: 100,
      unlockedMilestoneIds: ['sapling', 'new-branch', 'leaves', 'full-tree'],
      newMilestone: null,
    };

    expect(applyGhafAward(full, 12)).toMatchObject({
      stage: 5,
      progressPercent: 100,
      progressPoints: 100,
    });
    expect(deriveGhafStage(10_000)).toBe(5);
  });
});
