import {
  AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
  type AmbientAudioPreferenceRecord,
} from '../../models/audioPreferences';
import type { DomainError, DomainResult } from '../../models/familyGrowth';

const RECORD_KEYS = ['schemaVersion', 'ambientSoundEnabled', 'origin'] as const;

export const AMBIENT_AUDIO_QUIET_VOLUME = 0.2;
export const AMBIENT_AUDIO_DUCKED_VOLUME = 0.06;

export type AmbientAudioAppState = 'active' | 'background' | 'inactive' | 'unknown';

export interface AmbientPlaybackInput {
  readonly enabled: boolean;
  readonly startupReady: boolean;
  readonly appState: AmbientAudioAppState;
  readonly screenReaderActive: boolean | null;
  readonly webPlaybackUnlocked: boolean;
  readonly narrationPlaying: boolean;
  readonly exclusiveAudioActive: boolean;
}

export interface AmbientPlaybackDecision {
  readonly shouldPlay: boolean;
  readonly volume: number;
}

function failure(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_RESPONSE',
    message,
    retryable: false,
    fallbackAvailable: false,
  };
  return { ok: false, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>): boolean {
  const expected = new Set<string>(RECORD_KEYS);
  return (
    Object.keys(value).length === RECORD_KEYS.length &&
    Object.keys(value).every((key) => expected.has(key))
  );
}

export function parseAmbientAudioPreference(
  raw: string,
): DomainResult<AmbientAudioPreferenceRecord> {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return failure('The ambient audio preference is not valid JSON');
  }
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value) ||
    value.schemaVersion !== AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION ||
    typeof value.ambientSoundEnabled !== 'boolean' ||
    value.origin !== 'device_local'
  ) {
    return failure('The ambient audio preference shape or values are invalid');
  }
  return {
    ok: true,
    data: {
      schemaVersion: AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
      ambientSoundEnabled: value.ambientSoundEnabled,
      origin: 'device_local',
    },
  };
}

export function createAmbientAudioPreference(
  enabled: unknown,
): DomainResult<AmbientAudioPreferenceRecord> {
  return parseAmbientAudioPreference(
    JSON.stringify({
      schemaVersion: AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
      ambientSoundEnabled: enabled,
      origin: 'device_local',
    }),
  );
}

export function resolveAmbientPlaybackDecision(
  input: AmbientPlaybackInput,
): AmbientPlaybackDecision {
  return {
    shouldPlay:
      input.enabled &&
      input.startupReady &&
      input.appState === 'active' &&
      input.screenReaderActive === false &&
      input.webPlaybackUnlocked &&
      !input.exclusiveAudioActive,
    volume: input.narrationPlaying ? AMBIENT_AUDIO_DUCKED_VOLUME : AMBIENT_AUDIO_QUIET_VOLUME,
  };
}
