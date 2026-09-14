import type { LocalKeyValueStorage } from './storageTypes';

export const ONBOARDING_COMPLETION_STORAGE_KEY = 'ghaf.onboarding-completion.v1';

export type OnboardingCompletionResult =
  | { readonly ok: true; readonly completed: boolean }
  | { readonly ok: false; readonly error: 'read' | 'invalid' | 'write' | 'clear' };

const completionMarker = JSON.stringify({ schemaVersion: 1, completed: true });

export function createOnboardingCompletionRepository(storage: LocalKeyValueStorage) {
  const read = (): OnboardingCompletionResult => {
    let raw: string | null;
    try {
      raw = storage.getItem(ONBOARDING_COMPLETION_STORAGE_KEY);
    } catch {
      return { ok: false, error: 'read' };
    }
    if (raw === null) return { ok: true, completed: false };
    try {
      const value: unknown = JSON.parse(raw);
      if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value) ||
        Object.keys(value).length !== 2 ||
        !('schemaVersion' in value) ||
        value.schemaVersion !== 1 ||
        !('completed' in value) ||
        value.completed !== true
      ) {
        return { ok: false, error: 'invalid' };
      }
      return { ok: true, completed: true };
    } catch {
      return { ok: false, error: 'invalid' };
    }
  };

  return {
    read,
    complete(): OnboardingCompletionResult {
      const previous = read();
      if (previous.ok && previous.completed) return previous;
      if (!previous.ok && previous.error === 'read') return previous;
      try {
        storage.setItem(ONBOARDING_COMPLETION_STORAGE_KEY, completionMarker);
        const saved = read();
        return saved.ok && saved.completed ? saved : { ok: false, error: 'write' };
      } catch {
        return { ok: false, error: 'write' };
      }
    },
    clear(): OnboardingCompletionResult {
      try {
        storage.removeItem(ONBOARDING_COMPLETION_STORAGE_KEY);
        return storage.getItem(ONBOARDING_COMPLETION_STORAGE_KEY) === null
          ? { ok: true, completed: false }
          : { ok: false, error: 'clear' };
      } catch {
        return { ok: false, error: 'clear' };
      }
    },
  };
}
