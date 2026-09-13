import type { CredentialStorage } from './contracts';

// Browser credentials deliberately last only as long as this tab's module instance.
export function createCredentialStorage(): CredentialStorage {
  let value: string | null = null;
  return {
    async read() {
      return value;
    },
    async write(next) {
      value = next;
    },
    async clear() {
      value = null;
    },
  };
}
