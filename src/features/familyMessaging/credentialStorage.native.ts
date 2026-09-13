import * as SecureStore from 'expo-secure-store';
import type { CredentialStorage } from './contracts';

const KEY = 'ghaf.messaging.auth.v1';
export function createCredentialStorage(): CredentialStorage {
  return {
    read: () => SecureStore.getItemAsync(KEY),
    write: (value) =>
      SecureStore.setItemAsync(KEY, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    clear: () => SecureStore.deleteItemAsync(KEY),
  };
}
