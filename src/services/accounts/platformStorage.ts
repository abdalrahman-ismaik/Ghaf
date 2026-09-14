import * as SecureStore from 'expo-secure-store';

import type { AccountStorage } from './storage';
import { createSecureAccountStorage } from './secureStorage';

export function createPlatformAccountStorage(): AccountStorage {
  return createSecureAccountStorage({
    getItemAsync: (key) => SecureStore.getItemAsync(key),
    setItemAsync: (key, value) =>
      SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
  });
}
