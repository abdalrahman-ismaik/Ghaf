import { ParentAccountError } from '../../models/parentAccount';
import { ACCOUNT_STORAGE_KEY, type AccountStorage } from './storage';

export function createPlatformAccountStorage(): AccountStorage {
  const browserStorage = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new ParentAccountError('storage_unavailable');
    }
    return window.localStorage;
  };
  const checkedKey = (key: string) => {
    if (!key.startsWith(ACCOUNT_STORAGE_KEY)) throw new ParentAccountError('storage_unavailable');
    return key;
  };
  return {
    async getItem(key) {
      return browserStorage().getItem(checkedKey(key));
    },
    async setItem(key, value) {
      browserStorage().setItem(checkedKey(key), value);
    },
    async removeItem(key) {
      browserStorage().removeItem(checkedKey(key));
    },
  };
}
