import type { LocalKeyValueStorage } from './storageTypes';

export interface MemoryLocalKeyValueStorage extends LocalKeyValueStorage {
  failNextWrite(): void;
}

export function createMemoryLocalKeyValueStorage(): MemoryLocalKeyValueStorage {
  const values = new Map<string, string>();
  let shouldFailNextWrite = false;
  const consumeFailure = (): void => {
    if (!shouldFailNextWrite) return;
    shouldFailNextWrite = false;
    throw new Error('Prepared local storage write failure');
  };
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      consumeFailure();
      values.set(key, value);
    },
    removeItem(key) {
      consumeFailure();
      values.delete(key);
    },
    failNextWrite() {
      shouldFailNextWrite = true;
    },
  };
}

export const deviceLocalStorage: MemoryLocalKeyValueStorage = createMemoryLocalKeyValueStorage();
