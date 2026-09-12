import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('demo repository storage boundary', () => {
  it('never reads or clears ordinary platform storage through any demo repository', async () => {
    vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', 'true');
    vi.resetModules();
    const { deviceLocalStorage } = await import('../src/services/local/storage');
    const {
      LOCAL_FAMILY_STORAGE_KEY,
      DEVICE_ACCESS_STORAGE_KEY,
      AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY,
      SAVED_TASK_TEMPLATE_STORAGE_KEY,
    } = await import('../src/services/local');
    const keys = [
      LOCAL_FAMILY_STORAGE_KEY,
      DEVICE_ACCESS_STORAGE_KEY,
      AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY,
      SAVED_TASK_TEMPLATE_STORAGE_KEY,
    ];
    keys.forEach((key) => deviceLocalStorage.setItem(key, `ordinary:${key}`));
    const get = vi.spyOn(deviceLocalStorage, 'getItem');
    const set = vi.spyOn(deviceLocalStorage, 'setItem');
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    const { serviceRegistry } = await import('../src/services');
    serviceRegistry.localFamily.read();
    serviceRegistry.deviceAccess.read();
    serviceRegistry.ambientAudioPreferences.read();
    serviceRegistry.savedTaskTemplates.read('household_al_noor');
    expect(serviceRegistry.ambientAudioPreferences.save(true).ok).toBe(true);
    for (const repository of [
      serviceRegistry.localFamily,
      serviceRegistry.deviceAccess,
      serviceRegistry.ambientAudioPreferences,
      serviceRegistry.savedTaskTemplates,
    ]) {
      expect(repository.clear().ok).toBe(true);
    }
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    get.mockRestore();
    set.mockRestore();
    remove.mockRestore();
    keys.forEach((key) => expect(deviceLocalStorage.getItem(key)).toBe(`ordinary:${key}`));
  });

  it('retains ordinary platform storage behavior in the default build', async () => {
    vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', undefined);
    vi.resetModules();
    const { deviceLocalStorage } = await import('../src/services/local/storage');
    const { LOCAL_FAMILY_STORAGE_KEY } = await import('../src/services/local');
    deviceLocalStorage.setItem(LOCAL_FAMILY_STORAGE_KEY, 'ordinary existing bytes');
    const { serviceRegistry } = await import('../src/services');
    expect(serviceRegistry.localFamily.clear().ok).toBe(true);
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });
});
