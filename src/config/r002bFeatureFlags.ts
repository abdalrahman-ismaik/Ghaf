export const R002B_FEATURE_FLAG_NAMES = [
  'r002b_progression_engine',
  'r002b_impact_path_ui',
  'r002b_badges_ui',
  'r002b_learning_ui',
  'r002b_reveal_bundle_v2',
  'r002b_parent_progress_ui',
  'r002b_shared_growth_view',
  'r002b_shared_growth_contribution',
] as const;

export type R002bFeatureFlag = (typeof R002B_FEATURE_FLAG_NAMES)[number];
export type R002bFeatureFlags = Readonly<Record<R002bFeatureFlag, boolean>>;
export type R002bFeatureFlagInput = Readonly<Partial<Record<R002bFeatureFlag, unknown>>>;

function createDisabledFlags(): R002bFeatureFlags {
  return Object.fromEntries(R002B_FEATURE_FLAG_NAMES.map((name) => [name, false])) as Record<
    R002bFeatureFlag,
    false
  >;
}

export const DEFAULT_R002B_FEATURE_FLAGS = Object.freeze(createDisabledFlags());

export function resolveR002bFeatureFlags(source: R002bFeatureFlagInput): R002bFeatureFlags {
  const resolved = Object.fromEntries(
    R002B_FEATURE_FLAG_NAMES.map((name) => {
      const value = source[name];
      return [name, value === true || value === 'true'];
    }),
  ) as Record<R002bFeatureFlag, boolean>;

  return Object.freeze(resolved);
}

export const r002bFeatureFlags = resolveR002bFeatureFlags({
  r002b_progression_engine: process.env.EXPO_PUBLIC_R002B_PROGRESSION_ENGINE,
  r002b_impact_path_ui: process.env.EXPO_PUBLIC_R002B_IMPACT_PATH_UI,
  r002b_badges_ui: process.env.EXPO_PUBLIC_R002B_BADGES_UI,
  r002b_learning_ui: process.env.EXPO_PUBLIC_R002B_LEARNING_UI,
  r002b_reveal_bundle_v2: process.env.EXPO_PUBLIC_R002B_REVEAL_BUNDLE_V2,
  r002b_parent_progress_ui: process.env.EXPO_PUBLIC_R002B_PARENT_PROGRESS_UI,
  r002b_shared_growth_view: process.env.EXPO_PUBLIC_R002B_SHARED_GROWTH_VIEW,
  r002b_shared_growth_contribution: process.env.EXPO_PUBLIC_R002B_SHARED_GROWTH_CONTRIBUTION,
});
