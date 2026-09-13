import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEVICE_ACCESS_STORAGE_KEY } from '../src/models/deviceAccess';
import { LOCAL_FAMILY_STORAGE_KEY } from '../src/models/localFamily';
import { createMemoryLocalKeyValueStorage } from '../src/services/local/memory';
import type { LocalKeyValueStorage } from '../src/services/local/storageTypes';

function assertOk(result: { readonly ok: boolean; readonly error?: { readonly message: string } }) {
  expect(result.ok, result.error?.message).toBe(true);
}

const parentText = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
};

async function loadStore(mode: string, deviceStorage: LocalKeyValueStorage) {
  vi.stubEnv('EXPO_PUBLIC_GHAF_AUTH_MODE', mode);
  vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://pilot.supabase.co');
  vi.stubEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  vi.doMock('../src/services/local/storage', () => ({ deviceLocalStorage: deviceStorage }));
  const { usePrototypeStore } = await import('../src/state/usePrototypeStore');
  const { serviceRegistry } = await import('../src/services');
  return { usePrototypeStore, serviceRegistry };
}

describe('real Parent pilot sample lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.doUnmock('../src/services/local/storage');
  });

  it('never reads, migrates, overwrites or deletes an existing device demo in pilot mode', async () => {
    const device = createMemoryLocalKeyValueStorage();
    device.setItem(LOCAL_FAMILY_STORAGE_KEY, 'untouched device family');
    device.setItem(DEVICE_ACCESS_STORAGE_KEY, 'untouched device affinity');
    const storage = {
      getItem: vi.fn(device.getItem),
      setItem: vi.fn(device.setItem),
      removeItem: vi.fn(device.removeItem),
    };
    const { usePrototypeStore } = await loadStore('supabase', storage);
    expect(usePrototypeStore.getState().localFamily).toMatchObject({
      status: 'ready',
      record: null,
    });
    assertOk(await usePrototypeStore.getState().startPilotSample());
    assertOk(usePrototypeStore.getState().clearPilotSample());
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(device.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe('untouched device family');
    expect(device.getItem(DEVICE_ACCESS_STORAGE_KEY)).toBe('untouched device affinity');
  });

  it('keeps default demo storage and rejects both pilot-only commands', async () => {
    const storage = createMemoryLocalKeyValueStorage();
    storage.setItem(LOCAL_FAMILY_STORAGE_KEY, 'existing corrupt family');
    const { usePrototypeStore } = await loadStore('demo', storage);
    expect(usePrototypeStore.getState().localFamily.status).toBe('unavailable');
    expect((await usePrototypeStore.getState().startPilotSample()).ok).toBe(false);
    expect(usePrototypeStore.getState().clearPilotSample().ok).toBe(false);
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe('existing corrupt family');
  });

  it('keeps invalid explicit modes in isolated memory but refuses sample entry', async () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('device storage must stay untouched');
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const { usePrototypeStore } = await loadStore('supabse', storage);
    expect((await usePrototypeStore.getState().startPilotSample()).ok).toBe(false);
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it('starts canonical synthetic Parent access without an email argument or second form', async () => {
    const { usePrototypeStore } = await loadStore('supabase', createMemoryLocalKeyValueStorage());
    usePrototypeStore.getState().setLocale('en');
    const launched = await usePrototypeStore.getState().startPilotSample();
    assertOk(launched);
    expect(launched).toMatchObject({
      data: { destination: '/parent', authorized: true, origin: 'synthetic' },
    });
    const state = usePrototypeStore.getState();
    expect(state).toMatchObject({
      activeExperience: 'parent',
      role: 'parent',
      locale: 'en',
      pilotSampleActive: true,
    });
    expect(state.localFamily.record).toMatchObject({
      familyName: 'عائلة النور',
      parent: { normalizedIdentifier: 'parent@example.com' },
      children: [{ id: 'child_salem' }, { id: 'child_alya' }],
    });
    expect(state.parentOnboarding.status).toBe('authenticated_parent');
    expect(state.deviceAccess.record).toBeNull();
    assertOk(state.authorizeParentExperience());
  });

  it('repeatedly clears Child authority and progress, then launches a fresh sample', async () => {
    const { usePrototypeStore, serviceRegistry } = await loadStore(
      'supabase',
      createMemoryLocalKeyValueStorage(),
    );
    const { enterChildExperienceForTest } = await import('./helpers/prototypeStore');
    assertOk(await usePrototypeStore.getState().startPilotSample());
    const baselineSeeds = usePrototypeStore.getState().children.child_salem.earnedSeeds;
    let epoch = usePrototypeStore.getState().growthJourney.resetSequence;
    for (let index = 0; index < 3; index += 1) {
      await enterChildExperienceForTest();
      assertOk(usePrototypeStore.getState().authorizeChildExperience());
      expect(usePrototypeStore.getState().resetPrototype().ok).toBe(false);
      const previousServices = {
        familyReward: serviceRegistry.familyReward,
        familyLeague: serviceRegistry.familyLeague,
        syntheticVoice: serviceRegistry.syntheticVoice,
      };
      const cleared = usePrototypeStore.getState().clearPilotSample();
      assertOk(cleared);
      expect(cleared).toMatchObject({ data: { navigateTo: '/', replaceHistory: true } });
      const state = usePrototypeStore.getState();
      expect(state).toMatchObject({
        activeExperience: 'signed_out',
        pilotSampleActive: false,
        locale: 'ar',
        localFamily: { record: null, configuredChildIds: [] },
        deviceAccess: { record: null },
        childCoachResult: null,
        liveVoiceCapture: null,
      });
      expect(state.authorizeChildExperience().ok).toBe(false);
      expect(state.authorizeParentExperience().ok).toBe(false);
      expect(state.growthJourney.resetSequence).toBeGreaterThan(epoch);
      expect(state.children.child_salem.earnedSeeds).toBe(baselineSeeds);
      expect(serviceRegistry.familyReward).not.toBe(previousServices.familyReward);
      expect(serviceRegistry.familyLeague).not.toBe(previousServices.familyLeague);
      expect(serviceRegistry.syntheticVoice).not.toBe(previousServices.syntheticVoice);
      assertOk(await state.startPilotSample());
      epoch = usePrototypeStore.getState().growthJourney.resetSequence;
    }
  });

  it('does not let a pending launch reopen the sample after teardown', async () => {
    const { usePrototypeStore } = await loadStore('supabase', createMemoryLocalKeyValueStorage());
    const opening = usePrototypeStore.getState().startPilotSample();
    assertOk(usePrototypeStore.getState().clearPilotSample());
    expect((await opening).ok).toBe(false);
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(usePrototypeStore.getState().localFamily.record).toBeNull();
  });

  it('distinguishes sample reset from synthetic signout for the pilot launcher', async () => {
    const { usePrototypeStore } = await loadStore('supabase', createMemoryLocalKeyValueStorage());
    assertOk(await usePrototypeStore.getState().startPilotSample());
    assertOk(usePrototypeStore.getState().signOutExperience());
    expect(usePrototypeStore.getState().pilotSampleActive).toBe(true);
    const { enterParentExperienceForTest } = await import('./helpers/prototypeStore');
    await enterParentExperienceForTest();
    assertOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().pilotSampleActive).toBe(false);
  });

  it('does not let an older overlapping launch clear or authenticate a later launch', async () => {
    const { usePrototypeStore } = await loadStore('supabase', createMemoryLocalKeyValueStorage());
    const older = usePrototypeStore.getState().startPilotSample();
    const later = usePrototypeStore.getState().startPilotSample();
    expect((await older).ok).toBe(false);
    assertOk(await later);
    expect(usePrototypeStore.getState().activeExperience).toBe('parent');
  });

  it('rejects a delayed Child Coach result after restarting the identical synthetic task', async () => {
    const { usePrototypeStore, serviceRegistry } = await loadStore(
      'supabase',
      createMemoryLocalKeyValueStorage(),
    );
    const { enterChildExperienceForTest } = await import('./helpers/prototypeStore');
    const prepare = async () => {
      assertOk(await usePrototypeStore.getState().startPilotSample());
      assertOk(
        usePrototypeStore.getState().createTaskDraft({
          childId: 'child_salem',
          templateId: 'task_recycling_p0_v1',
          parentText,
        }),
      );
      assertOk(usePrototypeStore.getState().reviewTask());
      assertOk(usePrototypeStore.getState().approveAssignment());
      await enterChildExperienceForTest();
      assertOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
      assertOk(usePrototypeStore.getState().startAssignment());
    };
    await prepare();
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = serviceRegistry.childCoach.respond.bind(serviceRegistry.childCoach);
    const provider = vi
      .spyOn(serviceRegistry.childCoach, 'respond')
      .mockImplementation(async (request) => {
        await delayed;
        return original(request);
      });
    const pending = usePrototypeStore.getState().requestChildCoach({
      requestId: 'pilot_delayed_coach',
      intent: 'simplify_task',
    });
    expect(provider).toHaveBeenCalledTimes(1);
    await prepare();
    release();
    expect((await pending).ok).toBe(false);
    expect(usePrototypeStore.getState().childCoachResult).toBeNull();
  });

  it('drops sample data on module reload without changing the device family', async () => {
    const device = createMemoryLocalKeyValueStorage();
    const first = await loadStore('supabase', device);
    assertOk(await first.usePrototypeStore.getState().startPilotSample());
    expect(first.usePrototypeStore.getState().localFamily.record).not.toBeNull();
    vi.resetModules();
    const next = await loadStore('supabase', device);
    expect(next.usePrototypeStore.getState().localFamily.record).toBeNull();
    expect(next.usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(device.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });
});
