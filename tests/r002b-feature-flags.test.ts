import { describe, expect, it } from 'vitest';

import {
  DEFAULT_R002B_FEATURE_FLAGS,
  R002B_FEATURE_FLAG_NAMES,
  resolveR002bFeatureFlags,
  r002bFeatureFlags,
} from '@/config/r002bFeatureFlags';

describe('R002b feature flags', () => {
  it('defines exactly eight independent flags that default off', () => {
    expect(R002B_FEATURE_FLAG_NAMES).toEqual([
      'r002b_progression_engine',
      'r002b_impact_path_ui',
      'r002b_badges_ui',
      'r002b_learning_ui',
      'r002b_reveal_bundle_v2',
      'r002b_parent_progress_ui',
      'r002b_shared_growth_view',
      'r002b_shared_growth_contribution',
    ]);
    expect(DEFAULT_R002B_FEATURE_FLAGS).toEqual(
      Object.fromEntries(R002B_FEATURE_FLAG_NAMES.map((name) => [name, false])),
    );
    expect(r002bFeatureFlags).toEqual(DEFAULT_R002B_FEATURE_FLAGS);
    expect(Object.isFrozen(DEFAULT_R002B_FEATURE_FLAGS)).toBe(true);
    expect(Object.isFrozen(r002bFeatureFlags)).toBe(true);
  });

  it('enables only the explicitly selected flag', () => {
    for (const enabledName of R002B_FEATURE_FLAG_NAMES) {
      const resolved = resolveR002bFeatureFlags({ [enabledName]: 'true' });

      for (const name of R002B_FEATURE_FLAG_NAMES) {
        expect(resolved[name], `${enabledName} -> ${name}`).toBe(name === enabledName);
      }
      expect(Object.isFrozen(resolved)).toBe(true);
    }
  });

  it('fails closed for missing, malformed, or release-like values', () => {
    const invalidValues = [undefined, null, '', '1', 'TRUE', 'yes', 1, {}, []] as const;

    for (const value of invalidValues) {
      const resolved = resolveR002bFeatureFlags({
        r002b_progression_engine: value,
      });
      expect(resolved.r002b_progression_engine, String(value)).toBe(false);
    }
  });

  it('accepts explicit booleans without coupling view and contribution', () => {
    const resolved = resolveR002bFeatureFlags({
      r002b_shared_growth_view: true,
      r002b_shared_growth_contribution: false,
    });

    expect(resolved.r002b_shared_growth_view).toBe(true);
    expect(resolved.r002b_shared_growth_contribution).toBe(false);
    expect(DEFAULT_R002B_FEATURE_FLAGS.r002b_shared_growth_view).toBe(false);
  });
});
