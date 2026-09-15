export type FamilyRuntime = 'hosted' | 'normalized';

export interface FamilyRuntimeConfig {
  readonly runtime: FamilyRuntime;
  readonly valid: boolean;
}

export function getFamilyRuntimeConfig(
  value = process.env.EXPO_PUBLIC_GHAF_FAMILY_RUNTIME,
): FamilyRuntimeConfig {
  const selected = value?.trim() ?? '';
  if (selected === '' || selected === 'hosted') return { runtime: 'hosted', valid: true };
  if (selected === 'normalized') return { runtime: 'normalized', valid: true };
  return { runtime: 'hosted', valid: false };
}
