import { describe, expect, it } from 'vitest';

import {
  AI_FEATURE_FLAG_NAMES,
  DEFAULT_AI_FEATURE_FLAGS,
  aiFeatureFlags,
  resolveAiFeatureFlags,
} from '@/config/aiFeatureFlags';

describe('Feature 004 AI feature flags', () => {
  it('defines exactly three independent switches that default off', () => {
    expect(AI_FEATURE_FLAG_NAMES).toEqual([
      'ai_parent_task_drafting_live',
      'ai_child_coach_text_live',
      'ai_child_coach_voice_live',
    ]);
    expect(DEFAULT_AI_FEATURE_FLAGS).toEqual(
      Object.fromEntries(AI_FEATURE_FLAG_NAMES.map((name) => [name, false])),
    );
    expect(aiFeatureFlags).toEqual(DEFAULT_AI_FEATURE_FLAGS);
    expect(Object.isFrozen(DEFAULT_AI_FEATURE_FLAGS)).toBe(true);
    expect(Object.isFrozen(aiFeatureFlags)).toBe(true);
  });

  it('enables only the explicitly selected switch', () => {
    for (const enabledName of AI_FEATURE_FLAG_NAMES) {
      const resolved = resolveAiFeatureFlags({ [enabledName]: 'true' });

      for (const name of AI_FEATURE_FLAG_NAMES) {
        expect(resolved[name], `${enabledName} -> ${name}`).toBe(name === enabledName);
      }
      expect(Object.isFrozen(resolved)).toBe(true);
    }
  });

  it('fails closed for missing, malformed, and release-like values', () => {
    const invalidValues = [undefined, null, '', '1', 'TRUE', 'yes', 1, {}, []] as const;

    for (const value of invalidValues) {
      expect(
        resolveAiFeatureFlags({ ai_child_coach_voice_live: value }).ai_child_coach_voice_live,
        String(value),
      ).toBe(false);
    }
  });

  it('does not couple Child voice to Child text or Parent drafting', () => {
    expect(resolveAiFeatureFlags({ ai_child_coach_voice_live: true })).toEqual({
      ai_parent_task_drafting_live: false,
      ai_child_coach_text_live: false,
      ai_child_coach_voice_live: true,
    });
  });
});
