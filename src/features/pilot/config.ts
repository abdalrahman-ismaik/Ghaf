export type PilotAuthMode = 'demo' | 'supabase';

export interface PilotEnvironment {
  readonly EXPO_PUBLIC_GHAF_AUTH_MODE?: string;
  readonly EXPO_PUBLIC_SUPABASE_URL?: string;
  readonly EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface PilotConfig {
  readonly mode: PilotAuthMode;
  readonly enabled: boolean;
  readonly valid: boolean;
  readonly configurationError: 'invalid_auth_mode' | 'missing_supabase_configuration' | null;
  readonly supabaseUrl: string | null;
  readonly supabasePublishableKey: string | null;
}

export function getPilotConfig(
  environment: PilotEnvironment = {
    EXPO_PUBLIC_GHAF_AUTH_MODE: process.env.EXPO_PUBLIC_GHAF_AUTH_MODE,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
): PilotConfig {
  const selectedMode = environment.EXPO_PUBLIC_GHAF_AUTH_MODE?.trim() ?? '';
  if (selectedMode === 'demo') {
    return {
      mode: 'demo',
      enabled: false,
      valid: true,
      configurationError: null,
      supabaseUrl: null,
      supabasePublishableKey: null,
    };
  }

  const supabaseUrl = environment.EXPO_PUBLIC_SUPABASE_URL?.trim() || null;
  const supabasePublishableKey = environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || null;
  const configurationError =
    selectedMode !== '' && selectedMode !== 'supabase'
      ? 'invalid_auth_mode'
      : !supabaseUrl || !supabasePublishableKey?.startsWith('sb_publishable_')
        ? 'missing_supabase_configuration'
        : null;
  return {
    // An invalid explicit mode keeps the real-account gate mounted and closed.
    mode: 'supabase',
    enabled: true,
    valid: configurationError === null,
    configurationError,
    supabaseUrl,
    supabasePublishableKey,
  };
}
