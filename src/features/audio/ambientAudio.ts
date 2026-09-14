import {
  AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
  type AmbientAudioPreferenceRecord,
  type AmbientAudioPreferenceView,
} from '../../models/audioPreferences';
import type { DomainError, DomainResult } from '../../models/familyGrowth';

const RECORD_KEYS = ['schemaVersion', 'ambientSoundEnabled', 'origin'] as const;

export const AMBIENT_AUDIO_QUIET_VOLUME = 0.2;
export const AMBIENT_AUDIO_DUCKED_VOLUME = 0.06;
export const AMBIENT_AUDIO_MAX_VOLUME = 0.3;
export const AMBIENT_AUDIO_VOLUME_LEVELS = [0, 0.1, 0.2, 0.3] as const;

function isVolume(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= AMBIENT_AUDIO_MAX_VOLUME
  );
}

export type AmbientAudioAppState = 'active' | 'background' | 'inactive' | 'unknown';

export interface AmbientPlaybackInput {
  readonly enabled: boolean;
  readonly volume?: number;
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

export type AmbientAudioPreferenceRestoreInput =
  | {
      readonly storageAvailable: true;
      readonly record: AmbientAudioPreferenceRecord | null;
    }
  | { readonly storageAvailable: false };

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
  if (Object.hasOwn(value, 'volume')) expected.add('volume');
  return (
    Object.keys(value).length === expected.size &&
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
    (Object.hasOwn(value, 'volume') && !isVolume(value.volume)) ||
    value.origin !== 'device_local'
  ) {
    return failure('The ambient audio preference shape or values are invalid');
  }
  return {
    ok: true,
    data: {
      schemaVersion: AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
      ambientSoundEnabled: value.ambientSoundEnabled,
      volume: Object.hasOwn(value, 'volume')
        ? (value.volume as number)
        : AMBIENT_AUDIO_QUIET_VOLUME,
      origin: 'device_local',
    },
  };
}

export function createAmbientAudioPreference(
  enabled: unknown,
  volume: unknown = AMBIENT_AUDIO_QUIET_VOLUME,
): DomainResult<AmbientAudioPreferenceRecord> {
  if (!isVolume(volume)) return failure('The ambient volume is outside its quiet range');
  return parseAmbientAudioPreference(
    JSON.stringify({
      schemaVersion: AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION,
      ambientSoundEnabled: enabled,
      volume,
      origin: 'device_local',
    }),
  );
}

export function restoreAmbientAudioPreference(
  input: AmbientAudioPreferenceRestoreInput,
): AmbientAudioPreferenceView {
  if (!input.storageAvailable) {
    return {
      enabled: false,
      volume: AMBIENT_AUDIO_QUIET_VOLUME,
      status: 'unavailable',
      source: 'safe_fallback',
    };
  }
  if (!input.record)
    return {
      enabled: true,
      volume: AMBIENT_AUDIO_QUIET_VOLUME,
      status: 'ready',
      source: 'default',
    };
  return {
    enabled: input.record.ambientSoundEnabled,
    volume: input.record.volume,
    status: 'ready',
    source: 'stored',
  };
}

export function resolveAmbientPlaybackDecision(
  input: AmbientPlaybackInput,
): AmbientPlaybackDecision {
  const selected = input.volume === undefined ? AMBIENT_AUDIO_QUIET_VOLUME : input.volume;
  const volume = isVolume(selected) ? selected : 0;
  return {
    shouldPlay:
      volume > 0 &&
      input.enabled &&
      input.startupReady &&
      input.appState === 'active' &&
      input.screenReaderActive === false &&
      input.webPlaybackUnlocked &&
      !input.exclusiveAudioActive,
    volume: input.narrationPlaying ? volume * 0.3 : volume,
  };
}
