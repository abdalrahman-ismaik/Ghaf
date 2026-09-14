import { describe, expect, it } from 'vitest';

import { getPilotConfig } from '../../src/features/pilot/config';

describe('independent real Parent pilot configuration', () => {
  it('keeps explicitly selected demo isolated from accounts', () => {
    expect(getPilotConfig({ EXPO_PUBLIC_GHAF_AUTH_MODE: 'demo' })).toEqual({
      mode: 'demo',
      enabled: false,
      valid: true,
      configurationError: null,
      supabaseUrl: null,
      supabasePublishableKey: null,
    });
  });

  it('uses real accounts by default when provider configuration exists', () => {
    expect(
      getPilotConfig({
        EXPO_PUBLIC_SUPABASE_URL: 'https://pilot.supabase.co',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      }).enabled,
    ).toBe(true);
  });

  it.each([undefined, '', '  '])('keeps missing configuration closed for %s', (mode) => {
    expect(getPilotConfig({ EXPO_PUBLIC_GHAF_AUTH_MODE: mode })).toMatchObject({
      enabled: true,
      valid: false,
      configurationError: 'missing_supabase_configuration',
    });
  });

  it.each(['supabse', 'true', 'SUPABASE'])('fails closed for explicit mode %s', (mode) => {
    expect(getPilotConfig({ EXPO_PUBLIC_GHAF_AUTH_MODE: mode })).toMatchObject({
      mode: 'supabase',
      enabled: true,
      valid: false,
      configurationError: 'invalid_auth_mode',
    });
  });

  it('requires both provider settings after pilot selection', () => {
    expect(
      getPilotConfig({
        EXPO_PUBLIC_GHAF_AUTH_MODE: 'supabase',
        EXPO_PUBLIC_SUPABASE_URL: 'https://pilot.supabase.co',
      }),
    ).toMatchObject({
      enabled: true,
      valid: false,
      configurationError: 'missing_supabase_configuration',
    });
  });

  it('returns trimmed public configuration for the independently selected pilot', () => {
    expect(
      getPilotConfig({
        EXPO_PUBLIC_GHAF_AUTH_MODE: ' supabase ',
        EXPO_PUBLIC_SUPABASE_URL: ' https://pilot.supabase.co ',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ' sb_publishable_test ',
      }),
    ).toEqual({
      mode: 'supabase',
      enabled: true,
      valid: true,
      configurationError: null,
      supabaseUrl: 'https://pilot.supabase.co',
      supabasePublishableKey: 'sb_publishable_test',
    });
  });
});
