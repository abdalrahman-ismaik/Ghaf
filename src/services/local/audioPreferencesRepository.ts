import { createAmbientAudioPreference, parseAmbientAudioPreference } from '../../features/audio';
import type { AmbientAudioPreferenceRecord } from '../../models/audioPreferences';
import { AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY } from '../../models/audioPreferences';
import type { DomainError, DomainResult } from '../../models/familyGrowth';
import type { LocalKeyValueStorage } from './storageTypes';

export interface AmbientAudioPreferencesRepository {
  read(): DomainResult<AmbientAudioPreferenceRecord | null>;
  save(enabled: boolean): DomainResult<AmbientAudioPreferenceRecord>;
  clear(): DomainResult<true>;
}

function storageFailure(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_TRANSITION',
    message,
    retryable: false,
    fallbackAvailable: false,
  };
  return { ok: false, error };
}

function cloneRecord(record: AmbientAudioPreferenceRecord): AmbientAudioPreferenceRecord {
  const parsed = parseAmbientAudioPreference(JSON.stringify(record));
  if (!parsed.ok) throw new Error('Validated ambient audio preference clone failed');
  return parsed.data;
}

export function createAmbientAudioPreferencesRepository(
  storage: LocalKeyValueStorage,
): AmbientAudioPreferencesRepository {
  return {
    read() {
      let raw: string | null;
      try {
        raw = storage.getItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY);
      } catch {
        return storageFailure('The ambient audio preference could not be read');
      }
      return raw === null ? { ok: true, data: null } : parseAmbientAudioPreference(raw);
    },
    save(enabled) {
      const created = createAmbientAudioPreference(enabled);
      if (!created.ok) return created;
      try {
        storage.setItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY, JSON.stringify(created.data));
      } catch {
        return storageFailure('The ambient audio preference could not be saved');
      }
      return { ok: true, data: cloneRecord(created.data) };
    },
    clear() {
      try {
        storage.removeItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY);
      } catch {
        return storageFailure('The ambient audio preference could not be cleared');
      }
      return { ok: true, data: true };
    },
  };
}
