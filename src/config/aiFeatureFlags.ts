export const AI_FEATURE_FLAG_NAMES = [
  'ai_parent_task_drafting_live',
  'ai_child_coach_text_live',
  'ai_child_coach_voice_live',
] as const;

export type AiFeatureFlag = (typeof AI_FEATURE_FLAG_NAMES)[number];
export type AiFeatureFlags = Readonly<Record<AiFeatureFlag, boolean>>;
export type AiFeatureFlagInput = Readonly<Partial<Record<AiFeatureFlag, unknown>>>;

function createDisabledFlags(): AiFeatureFlags {
  return Object.fromEntries(AI_FEATURE_FLAG_NAMES.map((name) => [name, false])) as Record<
    AiFeatureFlag,
    false
  >;
}

export const DEFAULT_AI_FEATURE_FLAGS = Object.freeze(createDisabledFlags());

export function resolveAiFeatureFlags(source: AiFeatureFlagInput): AiFeatureFlags {
  const resolved = Object.fromEntries(
    AI_FEATURE_FLAG_NAMES.map((name) => {
      const value = source[name];
      return [name, value === true || value === 'true'];
    }),
  ) as Record<AiFeatureFlag, boolean>;

  return Object.freeze(resolved);
}

export const aiFeatureFlags = resolveAiFeatureFlags({
  ai_parent_task_drafting_live: process.env.EXPO_PUBLIC_GHAF_AI_PARENT_TASK_DRAFTING_LIVE,
  ai_child_coach_text_live: process.env.EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE,
  ai_child_coach_voice_live: process.env.EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE,
});
