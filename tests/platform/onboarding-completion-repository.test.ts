import { describe, expect, it, vi } from 'vitest';

import {
  createOnboardingCompletionRepository,
  ONBOARDING_COMPLETION_STORAGE_KEY,
} from '../../src/services/local/onboardingCompletionRepository';
import { createMemoryLocalKeyValueStorage } from '../../src/services/local/memoryStorage';

describe('ordinary onboarding completion storage', () => {
  it('restores completion in a new repository without storing identity or authority', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createOnboardingCompletionRepository(storage);
    expect(repository.read()).toEqual({ ok: true, completed: false });
    expect(repository.complete()).toEqual({ ok: true, completed: true });
    expect(createOnboardingCompletionRepository(storage).read()).toEqual({
      ok: true,
      completed: true,
    });
    expect(JSON.parse(storage.getItem(ONBOARDING_COMPLETION_STORAGE_KEY)!)).toEqual({
      schemaVersion: 1,
      completed: true,
    });
    const write = vi.spyOn(storage, 'setItem');
    expect(repository.complete()).toEqual({ ok: true, completed: true });
    expect(write).not.toHaveBeenCalled();
  });

  it.each([
    '{',
    'null',
    'true',
    '[]',
    '{"schemaVersion":1,"completed":false}',
    '{"schemaVersion":2,"completed":true}',
    '{"schemaVersion":1,"completed":true,"role":"parent"}',
  ])('never treats the malformed marker %s as completion', (raw) => {
    const storage = createMemoryLocalKeyValueStorage();
    storage.setItem(ONBOARDING_COMPLETION_STORAGE_KEY, raw);
    const repository = createOnboardingCompletionRepository(storage);
    expect(repository.read()).toEqual({ ok: false, error: 'invalid' });
    expect(storage.getItem(ONBOARDING_COMPLETION_STORAGE_KEY)).toBe(raw);
    expect(repository.complete()).toEqual({ ok: true, completed: true });
  });

  it('fails explicitly on unreadable storage and does not attempt a blind write', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('unavailable');
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const repository = createOnboardingCompletionRepository(storage);
    expect(repository.read()).toEqual({ ok: false, error: 'read' });
    expect(repository.complete()).toEqual({ ok: false, error: 'read' });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('verifies writes, supports a failed-write retry and clears only its own marker', () => {
    const storage = createMemoryLocalKeyValueStorage();
    storage.setItem('existing-family', 'preserved');
    const repository = createOnboardingCompletionRepository(storage);
    storage.failNextWrite();
    expect(repository.complete()).toEqual({ ok: false, error: 'write' });
    expect(repository.read()).toEqual({ ok: true, completed: false });
    expect(repository.complete()).toEqual({ ok: true, completed: true });
    storage.failNextWrite();
    expect(repository.clear()).toEqual({ ok: false, error: 'clear' });
    expect(repository.read()).toEqual({ ok: true, completed: true });
    expect(repository.clear()).toEqual({ ok: true, completed: false });
    expect(createOnboardingCompletionRepository(storage).read()).toEqual({
      ok: true,
      completed: false,
    });
    expect(storage.getItem('existing-family')).toBe('preserved');
  });

  it('does not claim success when a storage provider silently drops a write or removal', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createOnboardingCompletionRepository(storage);
    const write = vi.spyOn(storage, 'setItem').mockImplementationOnce(() => undefined);
    expect(repository.complete()).toEqual({ ok: false, error: 'write' });
    write.mockRestore();
    expect(repository.complete().ok).toBe(true);
    vi.spyOn(storage, 'removeItem').mockImplementationOnce(() => undefined);
    expect(repository.clear()).toEqual({ ok: false, error: 'clear' });
    expect(repository.read()).toEqual({ ok: true, completed: true });
  });
});
