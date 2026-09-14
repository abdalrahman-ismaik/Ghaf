export const AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION = 1 as const;
export const AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY = 'ghaf.ambient-audio.v1' as const;

export interface AmbientAudioPreferenceRecord {
  readonly schemaVersion: typeof AMBIENT_AUDIO_PREFERENCE_SCHEMA_VERSION;
  readonly ambientSoundEnabled: boolean;
  readonly volume: number;
  readonly origin: 'device_local';
}

export interface AmbientAudioPreferenceView {
  readonly enabled: boolean;
  readonly volume: number;
  readonly status: 'ready' | 'unavailable';
  readonly source: 'default' | 'stored' | 'safe_fallback';
}
