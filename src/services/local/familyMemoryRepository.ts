import { emptyFamilyMemories, parseFamilyMemories } from '@/features/family-memory';
import {
  FAMILY_MEMORY_STORAGE_KEY,
  type FamilyMemoryCollection,
  type FamilyMemoryResult,
} from '@/models/familyMemory';
import type { LocalKeyValueStorage } from './storageTypes';

export function createFamilyMemoryRepository(storage: LocalKeyValueStorage) {
  return {
    load(familyKey: string): FamilyMemoryResult<FamilyMemoryCollection> {
      try {
        const raw = storage.getItem(FAMILY_MEMORY_STORAGE_KEY);
        if (raw === null) return { ok: true, data: emptyFamilyMemories(familyKey) };
        if (raw.length > 3_000_000) return { ok: false, error: { code: 'invalid_data' } };
        const parsed = parseFamilyMemories(JSON.parse(raw));
        if (!parsed.ok) return parsed;
        if (parsed.data.familyKey !== familyKey)
          return { ok: false, error: { code: 'family_mismatch' } };
        return parsed;
      } catch {
        return { ok: false, error: { code: 'storage_read' } };
      }
    },
    save(collection: FamilyMemoryCollection): FamilyMemoryResult<true> {
      const parsed = parseFamilyMemories(collection);
      if (!parsed.ok) return parsed;
      try {
        const current = storage.getItem(FAMILY_MEMORY_STORAGE_KEY);
        if (current !== null) {
          const existing = parseFamilyMemories(JSON.parse(current));
          if (!existing.ok) return existing;
          if (existing.data.familyKey !== collection.familyKey)
            return { ok: false, error: { code: 'family_mismatch' } };
          if (
            existing.data.deletedSourceIds.some(
              (id) => !parsed.data.deletedSourceIds.includes(id),
            ) ||
            existing.data.memories.some((memory) => {
              const retained = parsed.data.memories.find((item) => item.id === memory.id);
              return retained
                ? JSON.stringify(retained) !== JSON.stringify(memory)
                : !parsed.data.deletedSourceIds.includes(memory.sourceEventId);
            })
          )
            return { ok: false, error: { code: 'invalid_data' } };
        }
        const serialized = JSON.stringify(parsed.data);
        storage.setItem(FAMILY_MEMORY_STORAGE_KEY, serialized);
        if (storage.getItem(FAMILY_MEMORY_STORAGE_KEY) !== serialized)
          return { ok: false, error: { code: 'storage_write' } };
        return { ok: true, data: true };
      } catch {
        return { ok: false, error: { code: 'storage_write' } };
      }
    },
    clear(): FamilyMemoryResult<true> {
      try {
        storage.removeItem(FAMILY_MEMORY_STORAGE_KEY);
        return storage.getItem(FAMILY_MEMORY_STORAGE_KEY) === null
          ? { ok: true, data: true }
          : { ok: false, error: { code: 'storage_clear' } };
      } catch {
        return { ok: false, error: { code: 'storage_clear' } };
      }
    },
  };
}
