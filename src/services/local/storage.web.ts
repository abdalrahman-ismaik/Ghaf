import type { LocalKeyValueStorage } from './storageTypes';

function browserStorage(): Storage {
  if (typeof globalThis.localStorage === 'undefined') {
    throw new Error('Browser local storage is unavailable');
  }
  return globalThis.localStorage;
}

export const deviceLocalStorage: LocalKeyValueStorage = {
  getItem(key) {
    return browserStorage().getItem(key);
  },
  setItem(key, value) {
    browserStorage().setItem(key, value);
  },
  removeItem(key) {
    browserStorage().removeItem(key);
  },
};
