import { describe, expect, it } from 'vitest';

import {
  nextThresholdForSeeds,
  planLandscapeGrowth,
  stageForSeeds,
} from '../src/features/garden/progression';

describe('Feature 003 landscape progression', () => {
  it.each([
    [0, 'seed', 20],
    [19, 'seed', 20],
    [20, 'shoot', 60],
    [59, 'shoot', 60],
    [60, 'sapling', 120],
    [119, 'sapling', 120],
    [120, 'shade', 200],
    [199, 'shade', 200],
    [200, 'flourishing', null],
    [500, 'flourishing', null],
  ] as const)('maps %i cumulative Seeds to %s', (seeds, stage, nextThreshold) => {
    expect(stageForSeeds(seeds)).toBe(stage);
    expect(nextThresholdForSeeds(seeds)).toBe(nextThreshold);
  });

  it('rejects negative and fractional cumulative values', () => {
    expect(() => stageForSeeds(-1)).toThrow();
    expect(() => stageForSeeds(19.5)).toThrow();
    expect(() => nextThresholdForSeeds(-1)).toThrow();
  });

  it('plans the exact symbolic Mangrove Shoot-to-Sapling transition', () => {
    expect(
      planLandscapeGrowth({
        landscape: {
          landscapeId: 'mangrove',
          cumulativeSeeds: 48,
          stage: 'shoot',
          nextThreshold: 60,
        },
        seedAmount: 12,
      }),
    ).toEqual({
      ok: true,
      data: {
        landscapeId: 'mangrove',
        seedsBefore: 48,
        seedsAfter: 60,
        stageBefore: 'shoot',
        stageAfter: 'sapling',
        crossedThreshold: 60,
        symbolicOnly: true,
      },
    });
  });

  it('never permits growth to reduce cumulative Seeds or stage', () => {
    expect(
      planLandscapeGrowth({
        landscape: {
          landscapeId: 'mangrove',
          cumulativeSeeds: 60,
          stage: 'sapling',
          nextThreshold: 120,
        },
        seedAmount: -4 as 4,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });

    const stages = [0, 20, 60, 120, 200, 250].map(stageForSeeds);
    expect(stages).toEqual(['seed', 'shoot', 'sapling', 'shade', 'flourishing', 'flourishing']);
  });
});
