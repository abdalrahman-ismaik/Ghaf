import {
  createChildDeviceAffinity,
  createParentDeviceAffinity,
  parseDeviceAffinityRecord,
} from '../../features/access/rememberedDeviceAccess';
import { DEVICE_ACCESS_STORAGE_KEY, type DeviceAffinityRecord } from '../../models/deviceAccess';
import type { DomainError, DomainResult, SyntheticChildId } from '../../models/familyGrowth';
import type { LocalFamilyRecord } from '../../models/localFamily';
import type { LocalKeyValueStorage } from './storageTypes';

export interface DeviceAccessRepository {
  read(): DomainResult<DeviceAffinityRecord | null>;
  rememberParent(family: LocalFamilyRecord, now: string): DomainResult<DeviceAffinityRecord>;
  rememberChild(
    family: LocalFamilyRecord,
    childId: SyntheticChildId,
    now: string,
  ): DomainResult<DeviceAffinityRecord>;
  clearMatchingChild(childId: SyntheticChildId): DomainResult<boolean>;
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

function cloneRecord(record: DeviceAffinityRecord): DeviceAffinityRecord {
  const parsed = parseDeviceAffinityRecord(JSON.stringify(record));
  if (!parsed.ok) throw new Error('Validated device affinity clone failed');
  return parsed.data;
}

export function createDeviceAccessRepository(
  storage: LocalKeyValueStorage,
): DeviceAccessRepository {
  const read = (): DomainResult<DeviceAffinityRecord | null> => {
    let raw: string | null;
    try {
      raw = storage.getItem(DEVICE_ACCESS_STORAGE_KEY);
    } catch {
      return storageFailure('Remembered device access could not be read');
    }
    return raw === null ? { ok: true, data: null } : parseDeviceAffinityRecord(raw);
  };

  const save = (record: DeviceAffinityRecord): DomainResult<DeviceAffinityRecord> => {
    const validated = parseDeviceAffinityRecord(JSON.stringify(record));
    if (!validated.ok) return validated;
    try {
      storage.setItem(DEVICE_ACCESS_STORAGE_KEY, JSON.stringify(validated.data));
    } catch {
      return storageFailure('Remembered device access could not be saved');
    }
    return { ok: true, data: cloneRecord(validated.data) };
  };

  const clear = (): DomainResult<true> => {
    try {
      storage.removeItem(DEVICE_ACCESS_STORAGE_KEY);
      if (storage.getItem(DEVICE_ACCESS_STORAGE_KEY) !== null) {
        return storageFailure('Remembered device access was not removed');
      }
    } catch {
      return storageFailure('Remembered device access could not be removed');
    }
    return { ok: true, data: true };
  };

  return {
    read,
    rememberParent(family, now) {
      const created = createParentDeviceAffinity({ family, now });
      return created.ok ? save(created.data) : created;
    },
    rememberChild(family, childId, now) {
      const created = createChildDeviceAffinity({ family, childId, now });
      return created.ok ? save(created.data) : created;
    },
    clearMatchingChild(childId) {
      const current = read();
      if (!current.ok) return current;
      if (current.data?.principal.role !== 'child' || current.data.principal.childId !== childId) {
        return { ok: true, data: false };
      }
      const cleared = clear();
      return cleared.ok ? { ok: true, data: true } : cleared;
    },
    clear,
  };
}
