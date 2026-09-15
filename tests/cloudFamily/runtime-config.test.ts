import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFamilyRuntimeConfig } from '../../src/features/cloudFamily/config';

afterEach(() => vi.unstubAllEnvs());

describe('explicit family runtime configuration', () => {
  it.each(['', ' ', 'hosted', ' hosted '])('retains deployed authority for %j', (value) => {
    expect(getFamilyRuntimeConfig(value)).toEqual({ runtime: 'hosted', valid: true });
  });

  it('defaults an absent setting to the hosted family runtime', () => {
    vi.stubEnv('EXPO_PUBLIC_GHAF_FAMILY_RUNTIME', undefined);
    expect(getFamilyRuntimeConfig()).toEqual({ runtime: 'hosted', valid: true });
  });

  it('selects normalized authority only by explicit build configuration', () => {
    vi.stubEnv('EXPO_PUBLIC_GHAF_FAMILY_RUNTIME', 'normalized');
    expect(getFamilyRuntimeConfig()).toEqual({ runtime: 'normalized', valid: true });
  });

  it.each(['demo', 'auto', 'supabase', 'NORMALIZED', 'typo'])(
    'fails closed for unsupported setting %j',
    (value) => {
      expect(getFamilyRuntimeConfig(value).valid).toBe(false);
    },
  );
});
