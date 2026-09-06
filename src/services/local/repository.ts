import { parseLocalFamilyRecord } from '../../features/local-family';
import type { DomainError, DomainResult, SyntheticChildId } from '../../models/familyGrowth';
import { LOCAL_FAMILY_STORAGE_KEY, type LocalFamilyRecord } from '../../models/localFamily';
import type { LocalKeyValueStorage } from './storageTypes';

export interface LocalFamilyRepository {
  read(): DomainResult<LocalFamilyRecord | null>;
  save(record: LocalFamilyRecord): DomainResult<LocalFamilyRecord>;
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
    if (raw === null) return { ok: true, data: null };
    return parseLocalFamilyRecord(raw);
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
    save,
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
        storage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
      } catch {
        return storageFailure('The device-local family directory could not be cleared');
      }
      return { ok: true, data: true };
    },
  };
}
