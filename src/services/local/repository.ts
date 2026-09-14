import {
  createLocalFamilyProfileRepairCandidate,
  migrateLegacyLocalFamilyRecord,
  migrateOldestLocalFamilyRecord,
  migratePreviousLocalFamilyRecord,
  parseLocalFamilyRecord,
} from '../../features/local-family';
import type { DomainError, DomainResult, SyntheticChildId } from '../../models/familyGrowth';
import {
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
  type LocalFamilyProfileRepairCandidate,
  type LocalFamilyRecord,
} from '../../models/localFamily';
import type { LocalKeyValueStorage } from './storageTypes';

export interface LocalFamilyRepository {
  read(): DomainResult<LocalFamilyRecord | null>;
  readProfileRepairCandidate(): DomainResult<LocalFamilyProfileRepairCandidate | null>;
  save(record: LocalFamilyRecord): DomainResult<LocalFamilyRecord>;
  saveProfileRepair(record: LocalFamilyRecord): DomainResult<LocalFamilyRecord>;
  setPairedChild(
    childId: SyntheticChildId,
    paired: boolean,
    now: string,
  ): DomainResult<LocalFamilyRecord>;
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

function cloneRecord(record: LocalFamilyRecord): LocalFamilyRecord {
  const parsed = parseLocalFamilyRecord(JSON.stringify(record));
  if (!parsed.ok) throw new Error('Validated local family clone failed');
  return parsed.data;
}

export function createLocalFamilyRepository(storage: LocalKeyValueStorage): LocalFamilyRepository {
  const read = (): DomainResult<LocalFamilyRecord | null> => {
    let raw: string | null;
    try {
      raw = storage.getItem(LOCAL_FAMILY_STORAGE_KEY);
    } catch {
      return storageFailure('The device-local family directory could not be read');
    }
    if (raw !== null) return parseLocalFamilyRecord(raw);

    let previousRaw: string | null;
    try {
      previousRaw = storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY);
    } catch {
      return storageFailure('The previous device-local family directory could not be read');
    }
    let migrated: DomainResult<LocalFamilyRecord>;
    let migratedKey: string;
    if (previousRaw !== null) {
      migrated = migratePreviousLocalFamilyRecord(previousRaw);
      migratedKey = PREVIOUS_LOCAL_FAMILY_STORAGE_KEY;
    } else {
      let legacyRaw: string | null;
      try {
        legacyRaw = storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY);
      } catch {
        return storageFailure('The legacy device-local family directory could not be read');
      }
      if (legacyRaw !== null) {
        migrated = migrateLegacyLocalFamilyRecord(legacyRaw);
        migratedKey = LEGACY_LOCAL_FAMILY_STORAGE_KEY;
      } else {
        let oldestRaw: string | null;
        try {
          oldestRaw = storage.getItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY);
        } catch {
          return storageFailure('The oldest device-local family directory could not be read');
        }
        if (oldestRaw === null) return { ok: true, data: null };
        migrated = migrateOldestLocalFamilyRecord(oldestRaw);
        migratedKey = OLDEST_LOCAL_FAMILY_STORAGE_KEY;
      }
    }
    if (!migrated.ok) return migrated;
    try {
      storage.setItem(LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(migrated.data));
      storage.removeItem(migratedKey);
    } catch {
      return storageFailure('The device-local family directory could not be migrated');
    }
    return { ok: true, data: cloneRecord(migrated.data) };
  };

  const save = (record: LocalFamilyRecord): DomainResult<LocalFamilyRecord> => {
    const validated = parseLocalFamilyRecord(JSON.stringify(record));
    if (!validated.ok) return validated;
    try {
      storage.setItem(LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(validated.data));
    } catch {
      return storageFailure('The complete family could not be saved on this device');
    }
    return { ok: true, data: cloneRecord(validated.data) };
  };

  return {
    read,
    readProfileRepairCandidate() {
      let currentRaw: string | null;
      try {
        currentRaw = storage.getItem(LOCAL_FAMILY_STORAGE_KEY);
      } catch {
        return storageFailure('The device-local family directory could not be read for repair');
      }
      if (currentRaw !== null) return { ok: true, data: null };

      const candidates = [
        [PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, 3],
        [LEGACY_LOCAL_FAMILY_STORAGE_KEY, 2],
        [OLDEST_LOCAL_FAMILY_STORAGE_KEY, 1],
      ] as const;
      for (const [key, sourceSchemaVersion] of candidates) {
        let raw: string | null;
        try {
          raw = storage.getItem(key);
        } catch {
          return storageFailure('The previous device-local family directory could not be read');
        }
        if (raw !== null) {
          return createLocalFamilyProfileRepairCandidate(raw, sourceSchemaVersion);
        }
      }
      return { ok: true, data: null };
    },
    save,
    saveProfileRepair(record) {
      const saved = save(record);
      if (!saved.ok) return saved;
      try {
        storage.removeItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY);
        storage.removeItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY);
        storage.removeItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY);
      } catch {
        return storageFailure('The repaired family was saved but legacy cleanup was interrupted');
      }
      return saved;
    },
    setPairedChild(childId, paired, now) {
      const current = read();
      if (!current.ok) return current;
      if (!current.data || !current.data.children.some((child) => child.id === childId)) {
        return storageFailure('The configured Child profile was not found on this device');
      }
      const isAlreadyPaired = current.data.pairedChildIds.includes(childId);
      if (isAlreadyPaired === paired) return { ok: true, data: cloneRecord(current.data) };
      const nextIds = paired
        ? [...current.data.pairedChildIds, childId]
        : current.data.pairedChildIds.filter((id) => id !== childId);
      return save({ ...current.data, pairedChildIds: nextIds, updatedAt: now });
    },
    clear() {
      try {
        // Verify all migration sources are absent before removing the current family.
        for (const key of [
          LEGACY_LOCAL_FAMILY_STORAGE_KEY,
          OLDEST_LOCAL_FAMILY_STORAGE_KEY,
          PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
        ]) {
          storage.removeItem(key);
          if (storage.getItem(key) !== null) {
            return storageFailure('The previous device-local family directory was not cleared');
          }
        }
        storage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
        if (storage.getItem(LOCAL_FAMILY_STORAGE_KEY) !== null) {
          return storageFailure('The device-local family directory was not cleared');
        }
      } catch {
        return storageFailure('The device-local family directory could not be cleared');
      }
      return { ok: true, data: true };
    },
  };
}
