import Storage from 'expo-sqlite/kv-store';

import type { LocalKeyValueStorage } from './storageTypes';

export const deviceLocalStorage: LocalKeyValueStorage = {
  getItem(key) {
    return Storage.getItemSync(key);
  },
  setItem(key, value) {
    Storage.setItemSync(key, value);
  },
  removeItem(key) {
    Storage.removeItemSync(key);
  },
};
