import type { DomainError, DomainResult } from '../../models/familyGrowth';
import {
  SAVED_TASK_TEMPLATE_LIMIT,
  SAVED_TASK_TEMPLATE_STORAGE_KEY,
  type SavedParentTaskTemplate,
  type SavedParentTaskTemplateInput,
} from '../../models/savedTaskTemplate';
import {
  parseSavedTaskTemplateCollection,
  savedTaskTemplateFingerprint,
  validateSavedTaskTemplateInput,
} from '../../features/tasks/savedTemplates';
import type { LocalKeyValueStorage } from './storageTypes';

export interface SavedTaskTemplateRepository {
  read(householdId: 'household_al_noor'): DomainResult<readonly SavedParentTaskTemplate[]>;
  save(input: SavedParentTaskTemplateInput, now: string): DomainResult<SavedParentTaskTemplate>;
  remove(id: string, householdId: 'household_al_noor'): DomainResult<true>;
  clear(): DomainResult<true>;
}

function failure(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_INPUT',
    message,
    retryable: false,
    fallbackAvailable: true,
  };
  return { ok: false, error };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createSavedTaskTemplateRepository(
  storage: LocalKeyValueStorage,
): SavedTaskTemplateRepository {
  const readAll = (): DomainResult<readonly SavedParentTaskTemplate[]> => {
    try {
      const raw = storage.getItem(SAVED_TASK_TEMPLATE_STORAGE_KEY);
      return raw === null ? { ok: true, data: [] } : parseSavedTaskTemplateCollection(raw);
    } catch {
      return failure('Saved task templates could not be read');
    }
  };
  const persist = (items: readonly SavedParentTaskTemplate[]): DomainResult<true> => {
    try {
      storage.setItem(SAVED_TASK_TEMPLATE_STORAGE_KEY, JSON.stringify(items));
      return { ok: true, data: true };
    } catch {
      return failure('Saved task templates could not be written');
    }
  };
  return {
    read(householdId) {
      const all = readAll();
      if (!all.ok) return all;
      return { ok: true, data: clone(all.data.filter((item) => item.householdId === householdId)) };
    },
    save(candidate, now) {
      const input = validateSavedTaskTemplateInput(candidate);
      if (!input.ok) return input;
      if (!Number.isFinite(Date.parse(now))) return failure('Saved template time is invalid');
      const all = readAll();
      if (!all.ok) return all;
      if (all.data.length >= SAVED_TASK_TEMPLATE_LIMIT)
        return failure('Saved template limit reached');
      const fingerprint = savedTaskTemplateFingerprint(input.data);
      if (all.data.some((item) => savedTaskTemplateFingerprint(item) === fingerprint)) {
        return failure('This wording is already saved');
      }
      const id = `saved-task-${Date.parse(now).toString(36)}-${all.data.length + 1}`;
      const record: SavedParentTaskTemplate = {
        ...input.data,
        id,
        createdAt: now,
        updatedAt: now,
        origin: 'parent_saved_local',
      };
      const written = persist([...all.data, record]);
      return written.ok ? { ok: true, data: clone(record) } : written;
    },
    remove(id, householdId) {
      const all = readAll();
      if (!all.ok) return all;
      const next = all.data.filter((item) => !(item.id === id && item.householdId === householdId));
      if (next.length === all.data.length) return failure('Saved task template was not found');
      return persist(next);
    },
    clear() {
      try {
        storage.removeItem(SAVED_TASK_TEMPLATE_STORAGE_KEY);
        return { ok: true, data: true };
      } catch {
        return failure('Saved task templates could not be cleared');
      }
    },
  };
}
