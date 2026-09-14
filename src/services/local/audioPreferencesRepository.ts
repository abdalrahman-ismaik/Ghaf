import { createAmbientAudioPreference, parseAmbientAudioPreference } from '../../features/audio';
import type { AmbientAudioPreferenceRecord } from '../../models/audioPreferences';
import { AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY } from '../../models/audioPreferences';
import type { DomainError, DomainResult } from '../../models/familyGrowth';
import type { LocalKeyValueStorage } from './storageTypes';

export interface AmbientAudioPreferencesRepository {
  read(): DomainResult<AmbientAudioPreferenceRecord | null>;
  save(enabled: boolean, volume?: number): DomainResult<AmbientAudioPreferenceRecord>;
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
  const read = (): DomainResult<AmbientAudioPreferenceRecord | null> => {
    let raw: string | null;
    try {
      raw = storage.getItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY);
    } catch {
      return storageFailure('The ambient audio preference could not be read');
    }
    return raw === null ? { ok: true, data: null } : parseAmbientAudioPreference(raw);
  };
  return {
    read,
    save(enabled, volume) {
      const previous = volume === undefined ? read() : null;
      if (previous && !previous.ok) return previous;
      const selectedVolume = volume ?? (previous?.ok ? previous.data?.volume : undefined);
      const created = createAmbientAudioPreference(enabled, selectedVolume);
      if (!created.ok) return created;
      try {
        const serialized = JSON.stringify(created.data);
        storage.setItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY, serialized);
        if (storage.getItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY) !== serialized) {
          return storageFailure('The ambient audio preference write could not be verified');
        }
      } catch {
        return storageFailure('The ambient audio preference could not be saved');
      }
      return { ok: true, data: cloneRecord(created.data) };
    },
    clear() {
      try {
        storage.removeItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY);
        if (storage.getItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY) !== null) {
          return storageFailure('The ambient audio preference removal could not be verified');
        }
      } catch {
        return storageFailure('The ambient audio preference could not be cleared');
      }
      return { ok: true, data: true };
    },
  };
}
