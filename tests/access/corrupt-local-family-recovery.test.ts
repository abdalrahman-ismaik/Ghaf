import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import { INITIAL_CHILD_VOICE_VIEW } from '../../src/features/assistants/childVoiceController';
import { TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import { FAMILY_MEMORY_STORAGE_KEY } from '../../src/models/familyMemory';
import type { LocalFamilyRecord } from '../../src/models/localFamily';
import { STUDY_STORAGE_KEY } from '../../src/models/study';
import { serviceRegistry } from '../../src/services';
import {
  AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY,
  DEVICE_ACCESS_STORAGE_KEY,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
  SAVED_TASK_TEMPLATE_STORAGE_KEY,
  deviceLocalStorage,
} from '../../src/services/local';
import { ONBOARDING_COMPLETION_STORAGE_KEY } from '../../src/services/local/onboardingCompletionRepository';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const ALL_KEYS = [
  DEVICE_ACCESS_STORAGE_KEY,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
] as const;
const AUXILIARY_KEYS = [
  ONBOARDING_COMPLETION_STORAGE_KEY,
  AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY,
  SAVED_TASK_TEMPLATE_STORAGE_KEY,
  STUDY_STORAGE_KEY,
  FAMILY_MEMORY_STORAGE_KEY,
] as const;
const HISTORICAL_FAMILIES = [
  { key: OLDEST_LOCAL_FAMILY_STORAGE_KEY, schemaVersion: 1 },
  { key: LEGACY_LOCAL_FAMILY_STORAGE_KEY, schemaVersion: 2 },
  { key: PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, schemaVersion: 3 },
] as const;

function historicalFamily(family: LocalFamilyRecord, schemaVersion: 1 | 2 | 3, repair = false) {
  const { familyConnections, ...directory } = family;
  return JSON.stringify({
    ...directory,
    ...(schemaVersion === 3 ? { familyConnections } : {}),
    schemaVersion,
    parent:
      schemaVersion === 1 ? { id: family.parent.id, role: family.parent.role } : family.parent,
    children: family.children.map((child, index) => {
      const {
        sex,
        customInterest: _customInterest,
        customHobby: _customHobby,
        customSupportPreference: _customSupportPreference,
        customAccessibility: _customAccessibility,
        ...previous
      } = child;
      return {
        ...previous,
        gender: repair && index === 1 ? null : sex === 'male' ? 'boy' : 'girl',
      };
    }),
  });
}

function corrupt(key: string = LOCAL_FAMILY_STORAGE_KEY, raw = 'synthetic-corrupt-json') {
  deviceLocalStorage.setItem(key, raw);
  return raw;
}

function confirm() {
  return usePrototypeStore.getState().confirmCorruptLocalFamilyRecovery({ confirmed: true });
}

function retry() {
  return usePrototypeStore.getState().retryLocalFamilyLoad();
}

async function savedFamily() {
  await enterParentExperienceForTest();
  const family = usePrototypeStore.getState().localFamily.record;
  if (!family) throw new Error('Expected synthetic family');
  expect(usePrototypeStore.getState().signOutExperience().ok).toBe(true);
  return family;
}

function clearRecoveryFixture() {
  [...ALL_KEYS, ...AUXILIARY_KEYS].forEach((key) => deviceLocalStorage.removeItem(key));
  usePrototypeStore.setState({
    localFamily: {
      status: 'ready',
      record: null,
      configuredChildIds: [],
      errorCode: null,
      storageTruth: 'device_local_demo_only',
    },
  });
  expect(resetPrototypeForTest().ok).toBe(true);
}

beforeEach(() => {
  vi.restoreAllMocks();
  clearRecoveryFixture();
});

afterEach(() => {
  vi.restoreAllMocks();
  clearRecoveryFixture();
});

describe('confirmed corrupt saved-family recovery', () => {
  it.each([
    [LOCAL_FAMILY_STORAGE_KEY, 'synthetic-corrupt-json'],
    [LOCAL_FAMILY_STORAGE_KEY, '{"schemaVersion":999}'],
    [LOCAL_FAMILY_STORAGE_KEY, '{"schemaVersion":2}'],
    [LEGACY_LOCAL_FAMILY_STORAGE_KEY, 'synthetic-corrupt-json'],
    [LEGACY_LOCAL_FAMILY_STORAGE_KEY, '{"schemaVersion":999}'],
    [OLDEST_LOCAL_FAMILY_STORAGE_KEY, 'synthetic-corrupt-json'],
    [PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, 'synthetic-corrupt-json'],
  ])('classifies and recovers parser corruption in %s: %s', (key, raw) => {
    corrupt(key, raw);
    expect(retry()).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
    expect(usePrototypeStore.getState().localFamily).toMatchObject({
      status: 'unavailable',
      errorCode: 'corrupt_local_data',
      record: null,
      configuredChildIds: [],
    });
    expect(confirm()).toMatchObject({ ok: true, data: { navigateTo: '/', replaceHistory: true } });
    expect(ALL_KEYS.map((key) => deviceLocalStorage.getItem(key))).toEqual(
      ALL_KEYS.map(() => null),
    );
  });

  it.each([undefined, {}, { confirmed: false }, { confirmed: 'true' }, { confirmed: 1 }])(
    'requires the explicit boolean confirmation and preserves all data for %j',
    (input) => {
      corrupt();
      const before = usePrototypeStore.getState();
      const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
      expect(before.confirmCorruptLocalFamilyRecovery(input as never)).toMatchObject({ ok: false });
      expect(usePrototypeStore.getState()).toBe(before);
      expect(remove).not.toHaveBeenCalled();
    },
  );

  it.each(['parent', 'child'] as const)('denies recovery and retry from active %s', (role) => {
    corrupt();
    usePrototypeStore.setState({ activeExperience: role, role });
    const before = usePrototypeStore.getState();
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(confirm()).toMatchObject({ ok: false });
    expect(retry()).toMatchObject({ ok: false });
    expect(usePrototypeStore.getState()).toBe(before);
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps ordinary reset Parent-only even when signed-out saved data is corrupt', () => {
    corrupt();
    expect(usePrototypeStore.getState().resetPrototype()).toMatchObject({ ok: false });
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
  });

  it('rejects a fresh absent directory and repeated confirmation after completed recovery', () => {
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(confirm()).toMatchObject({ ok: false });
    expect(remove).not.toHaveBeenCalled();
    corrupt();
    expect(confirm().ok).toBe(true);
    remove.mockClear();
    const before = usePrototypeStore.getState();
    expect(confirm()).toMatchObject({ ok: false });
    expect(remove).not.toHaveBeenCalled();
    expect(usePrototypeStore.getState()).toBe(before);
  });

  it('rechecks and preserves a valid family repaired between proposal and confirmation', async () => {
    const family = await savedFamily();
    corrupt();
    expect(retry().ok).toBe(false);
    expect(serviceRegistry.localFamily.save(family).ok).toBe(true);
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(confirm()).toMatchObject({ ok: false });
    expect(remove).not.toHaveBeenCalled();
    expect(serviceRegistry.localFamily.read()).toEqual({ ok: true, data: family });
    expect(usePrototypeStore.getState().localFamily).toMatchObject({
      status: 'ready',
      record: family,
    });
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(usePrototypeStore.getState().authorizeParentExperience().ok).toBe(false);
  });

  it('treats transient read failures as unavailable, preserves data, and retries without role grant', async () => {
    const family = await savedFamily();
    const raw = deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY);
    const read = vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation(() => {
      throw new Error('Synthetic transient I/O failure');
    });
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(retry()).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().localFamily.errorCode).toBe(
      'invalid_or_unavailable_local_data',
    );
    expect(confirm()).toMatchObject({ ok: false });
    expect(remove).not.toHaveBeenCalled();
    read.mockRestore();
    expect(retry().ok).toBe(true);
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(raw);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      localFamily: { status: 'ready', errorCode: null, record: family },
      parentOnboarding: { status: 'signed_out', canEnterParentExperience: false },
      childAccess: { status: 'signed_out', canEnterChildExperience: false },
    });
    expect(
      usePrototypeStore
        .getState()
        .requestExistingParentVerification({ identifier: 'parent@example.com' }).ok,
    ).toBe(true);
  });

  it.each(HISTORICAL_FAMILIES)(
    'does not treat a valid schema-$schemaVersion migration write failure as corruption',
    async ({ key, schemaVersion }) => {
      const family = await savedFamily();
      deviceLocalStorage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
      const legacy = historicalFamily(family, schemaVersion);
      deviceLocalStorage.setItem(key, legacy);
      const write = vi.spyOn(deviceLocalStorage, 'setItem').mockImplementation(() => {
        throw new Error('Synthetic migration failure');
      });
      const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
      expect(retry().ok).toBe(false);
      expect(usePrototypeStore.getState().localFamily.errorCode).toBe(
        'invalid_or_unavailable_local_data',
      );
      expect(confirm().ok).toBe(false);
      expect(remove).not.toHaveBeenCalled();
      expect(deviceLocalStorage.getItem(key)).toBe(legacy);
      write.mockRestore();
      expect(retry().ok).toBe(true);
      expect(usePrototypeStore.getState().localFamily.record).toMatchObject({
        schemaVersion: 4,
        children: [{ sex: 'male' }, { sex: 'female' }],
      });
    },
  );

  it.each(HISTORICAL_FAMILIES)(
    'preserves repairable schema-$schemaVersion after a stale corruption proposal',
    async ({ key, schemaVersion }) => {
      const family = await savedFamily();
      expect(resetPrototypeForTest().ok).toBe(true);
      corrupt();
      expect(retry().ok).toBe(false);
      expect(usePrototypeStore.getState().localFamily.errorCode).toBe('corrupt_local_data');
      const legacy = historicalFamily(family, schemaVersion, true);
      deviceLocalStorage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
      deviceLocalStorage.setItem(key, legacy);
      const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
      expect(confirm()).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
      expect(remove).not.toHaveBeenCalled();
      expect(deviceLocalStorage.getItem(key)).toBe(legacy);
      expect(usePrototypeStore.getState()).toMatchObject({
        activeExperience: 'signed_out',
        localFamily: {
          status: 'unavailable',
          errorCode: 'invalid_or_unavailable_local_data',
          record: null,
        },
        localFamilyProfileRepair: {
          sourceSchemaVersion: schemaVersion,
          children: [{ sex: 'male' }, { sex: null }],
        },
      });
      expect(usePrototypeStore.getState().authorizeParentExperience().ok).toBe(false);
      expect(usePrototypeStore.getState().authorizeChildExperience().ok).toBe(false);
      expect(usePrototypeStore.getState().beginLocalFamilyProfileRepair().ok).toBe(true);
      expect(deviceLocalStorage.getItem(key)).toBe(legacy);
    },
  );

  it('verifies affinity removal before legacy and current family removal', () => {
    [...ALL_KEYS, ...AUXILIARY_KEYS].forEach((key) => corrupt(key));
    const events: string[] = [];
    const originalRead = deviceLocalStorage.getItem;
    const originalRemove = deviceLocalStorage.removeItem;
    vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation((key) => {
      events.push(`read:${key}`);
      return originalRead(key);
    });
    vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
      events.push(`remove:${key}`);
      originalRemove(key);
    });
    expect(confirm().ok).toBe(true);
    expect(events.slice(events.indexOf(`remove:${DEVICE_ACCESS_STORAGE_KEY}`))).toEqual([
      ...ALL_KEYS.flatMap((key) => [`remove:${key}`, `read:${key}`]),
      ...AUXILIARY_KEYS.flatMap((key) => [`remove:${key}`, `read:${key}`]),
    ]);
    expect(deviceLocalStorage.getItem(STUDY_STORAGE_KEY)).toBeNull();
  });

  it.each(ALL_KEYS.flatMap((key) => ['throw', 'no-op'].map((mode) => ({ key, mode }))))(
    'does not report success when $mode removal fails at $key; subsequent confirmation recovers',
    ({ key: failedKey, mode }) => {
      ALL_KEYS.forEach((key) => corrupt(key));
      const removeItem = deviceLocalStorage.removeItem;
      const remove = vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
        if (key === failedKey) {
          if (mode === 'throw') throw new Error('Synthetic deletion failure');
          return;
        }
        removeItem(key);
      });
      expect(confirm()).toMatchObject({ ok: false });
      expect(deviceLocalStorage.getItem(failedKey)).not.toBeNull();
      const failedIndex = ALL_KEYS.indexOf(failedKey);
      ALL_KEYS.slice(failedIndex + 1).forEach((key) =>
        expect(deviceLocalStorage.getItem(key)).not.toBeNull(),
      );
      expect(usePrototypeStore.getState().localFamily.status).toBe('unavailable');
      remove.mockRestore();
      expect(confirm().ok).toBe(true);
    },
  );

  it.each(ALL_KEYS)(
    'does not report success when removal verification throws for %s',
    (failedKey) => {
      ALL_KEYS.forEach((key) => corrupt(key));
      const getItem = deviceLocalStorage.getItem;
      let removed = false;
      const removeItem = deviceLocalStorage.removeItem;
      vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
        removeItem(key);
        if (key === failedKey) removed = true;
      });
      const read = vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation((key) => {
        if (removed && key === failedKey) throw new Error('Synthetic verification failure');
        return getItem(key);
      });
      expect(confirm().ok).toBe(false);
      read.mockRestore();
      expect(confirm().ok).toBe(true);
    },
  );

  it('completes previously confirmed absent recovery without issuing another deletion', () => {
    corrupt();
    const getItem = deviceLocalStorage.getItem;
    let removed = false;
    const removeItem = deviceLocalStorage.removeItem;
    vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
      removeItem(key);
      if (key === LOCAL_FAMILY_STORAGE_KEY) removed = true;
    });
    const failingRead = vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation((key) => {
      if (removed && key === LOCAL_FAMILY_STORAGE_KEY)
        throw new Error('Synthetic final read failure');
      return getItem(key);
    });
    expect(confirm().ok).toBe(false);
    failingRead.mockRestore();
    const noMoreDeletion = vi.spyOn(deviceLocalStorage, 'removeItem').mockClear();
    const epoch = usePrototypeStore.getState().growthJourney.resetSequence;
    expect(retry()).toMatchObject({ ok: false, error: { retryable: true } });
    expect(usePrototypeStore.getState().growthJourney.resetSequence).toBe(epoch);
    expect(usePrototypeStore.getState().localFamily.errorCode).toBe('corrupt_local_data');
    expect(confirm().ok).toBe(true);
    expect(noMoreDeletion.mock.calls).toEqual(AUXILIARY_KEYS.map((key) => [key]));
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      activeExperience: 'signed_out',
    });
  });

  it('keeps pending confirmation reachable after a partial clear and a later transient read failure', () => {
    corrupt();
    const getItem = deviceLocalStorage.getItem;
    const removeItem = deviceLocalStorage.removeItem;
    let removed = false;
    vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
      removeItem(key);
      if (key === LOCAL_FAMILY_STORAGE_KEY) removed = true;
    });
    const read = vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation((key) => {
      if (removed && key === LOCAL_FAMILY_STORAGE_KEY)
        throw new Error('Synthetic unavailable verification');
      return getItem(key);
    });
    expect(confirm().ok).toBe(false);
    expect(retry().ok).toBe(false);
    expect(usePrototypeStore.getState().localFamily.errorCode).toBe(
      'invalid_or_unavailable_local_data',
    );
    expect(confirm().ok).toBe(false);
    read.mockRestore();
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem').mockClear();
    expect(retry()).toMatchObject({ ok: false, error: { retryable: true } });
    expect(usePrototypeStore.getState().localFamily.errorCode).toBe('corrupt_local_data');
    expect(confirm().ok).toBe(true);
    expect(remove.mock.calls).toEqual(AUXILIARY_KEYS.map((key) => [key]));
  });

  it('revokes partial-recovery continuation when a valid replacement family is observed', async () => {
    const family = await savedFamily();
    corrupt();
    const getItem = deviceLocalStorage.getItem;
    const removeItem = deviceLocalStorage.removeItem;
    let removed = false;
    vi.spyOn(deviceLocalStorage, 'removeItem').mockImplementation((key) => {
      removeItem(key);
      if (key === LOCAL_FAMILY_STORAGE_KEY) removed = true;
    });
    const read = vi.spyOn(deviceLocalStorage, 'getItem').mockImplementation((key) => {
      if (removed && key === LOCAL_FAMILY_STORAGE_KEY)
        throw new Error('Synthetic unavailable verification');
      return getItem(key);
    });
    expect(confirm().ok).toBe(false);
    read.mockRestore();
    expect(serviceRegistry.localFamily.save(family).ok).toBe(true);
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem').mockClear();
    expect(confirm().ok).toBe(false);
    expect(remove).not.toHaveBeenCalled();
    expect(serviceRegistry.localFamily.read()).toEqual({ ok: true, data: family });
    deviceLocalStorage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
    remove.mockClear();
    expect(confirm().ok).toBe(false);
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not complete pending absent-family recovery while new remembered access exists', () => {
    corrupt();
    const reset = vi.spyOn(serviceRegistry.access, 'resetPrototype').mockReturnValueOnce({
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Synthetic reset unavailable',
        retryable: true,
        fallbackAvailable: false,
      },
    });
    expect(confirm().ok).toBe(false);
    reset.mockRestore();
    corrupt(DEVICE_ACCESS_STORAGE_KEY);
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(confirm().ok).toBe(false);
    expect(remove).not.toHaveBeenCalled();
    expect(deviceLocalStorage.getItem(DEVICE_ACCESS_STORAGE_KEY)).not.toBeNull();
  });

  it('keeps controller restore failure unavailable even if its error code is INVALID_RESPONSE', async () => {
    const family = await savedFamily();
    expect(
      serviceRegistry.localFamily.save({ ...family, pairedChildIds: ['child_salem'] }).ok,
    ).toBe(true);
    const restore = vi.spyOn(serviceRegistry.access, 'restorePairedDevice').mockReturnValue({
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Synthetic controller restore failure',
        retryable: false,
        fallbackAvailable: false,
      },
    });
    const remove = vi.spyOn(deviceLocalStorage, 'removeItem');
    expect(retry().ok).toBe(false);
    expect(usePrototypeStore.getState().localFamily.errorCode).toBe(
      'invalid_or_unavailable_local_data',
    );
    expect(confirm().ok).toBe(false);
    expect(remove).not.toHaveBeenCalled();
    restore.mockRestore();
    const signInParent = vi.spyOn(serviceRegistry.access, 'signInParent');
    const signInChild = vi.spyOn(serviceRegistry.access, 'signInChild');
    expect(retry().ok).toBe(true);
    expect(signInParent).not.toHaveBeenCalled();
    expect(signInChild).not.toHaveBeenCalled();
    expect(usePrototypeStore.getState().childAccess).toMatchObject({
      status: 'signed_out',
      canEnterChildExperience: false,
      pairedDevices: [{ childId: 'child_salem', status: 'paired' }],
    });
  });

  it.each([LOCAL_FAMILY_STORAGE_KEY, ...HISTORICAL_FAMILIES.map(({ key }) => key)])(
    'classifies corrupt %s at fresh startup without restoring remembered authority',
    async (key) => {
      vi.resetModules();
      const { deviceLocalStorage: freshStorage } = await import('../../src/services/local/storage');
      freshStorage.setItem(key, 'synthetic-corrupt-json');
      freshStorage.setItem(DEVICE_ACCESS_STORAGE_KEY, 'synthetic-corrupt-affinity');
      const { usePrototypeStore: freshStore } = await import('../../src/state/usePrototypeStore');
      expect(freshStore.getState()).toMatchObject({
        activeExperience: 'signed_out',
        localFamily: { status: 'unavailable', errorCode: 'corrupt_local_data', record: null },
      });
      expect(freshStore.getState().authorizeParentExperience().ok).toBe(false);
      expect(freshStore.getState().authorizeChildExperience().ok).toBe(false);
      expect(freshStore.getState().confirmCorruptLocalFamilyRecovery({ confirmed: true }).ok).toBe(
        true,
      );
    },
  );
  it('clears saved task wording, catalog occurrences and audio preferences during recovery', async () => {
    await enterParentExperienceForTest();
    const template = TASK_TEMPLATES.find((candidate) => candidate.id === 'HR01');
    if (!template) throw new Error('Expected the approved catalog fixture');
    expect(
      serviceRegistry.savedTaskTemplates.save(
        {
          householdId: 'household_al_noor',
          categoryId: template.categoryId,
          title: template.title,
          positiveAction: template.positiveAction,
          recurrence: template.recurrence,
        },
        '2026-09-13T12:00:00.000Z',
      ).ok,
    ).toBe(true);
    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: template.id,
        parentText: template.positiveAction,
      }).ok,
    ).toBe(true);
    expect(usePrototypeStore.getState().reviewTask().ok).toBe(true);
    expect(usePrototypeStore.getState().approveAssignment().ok).toBe(true);
    expect(usePrototypeStore.getState().taskAssignments.order).toHaveLength(1);
    expect(usePrototypeStore.getState().setAmbientSoundEnabled(false).ok).toBe(true);
    expect(usePrototypeStore.getState().signOutExperience().ok).toBe(true);
    corrupt();
    expect(confirm().ok).toBe(true);
    expect(serviceRegistry.savedTaskTemplates.read('household_al_noor')).toEqual({
      ok: true,
      data: [],
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      taskAssignments: { order: [], byId: {} },
      taskContexts: {},
      catalogSupportRequests: {},
      localFamilyProfileRepair: null,
      pendingFamilyCreation: null,
      ambientAudioPreference: { enabled: true, volume: 0.2, status: 'ready', source: 'default' },
    });
    expect(AUXILIARY_KEYS.map((key) => deviceLocalStorage.getItem(key))).toEqual(
      AUXILIARY_KEYS.map(() => null),
    );
  });

  it('clears transient state and all voice authority exactly like ordinary reset, then permits normal setup', async () => {
    const baseline = usePrototypeStore.getState();
    await enterParentExperienceForTest();
    usePrototypeStore.getState().setLocale('en');
    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        },
      }).ok,
    ).toBe(true);
    expect(usePrototypeStore.getState().reviewTask().ok).toBe(true);
    expect(usePrototypeStore.getState().setChildVoicePermission(true).ok).toBe(true);
    expect(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'media',
        granted: true,
        reauthenticationCode: '4242',
      }).ok,
    ).toBe(true);
    expect(usePrototypeStore.getState().signOutExperience().ok).toBe(true);
    corrupt();
    const signIn = vi.spyOn(serviceRegistry.access, 'signInParent');
    expect(confirm().ok).toBe(true);
    expect(signIn).not.toHaveBeenCalled();
    const state = usePrototypeStore.getState();
    expect(state).toMatchObject(serviceRegistry.prototypeSession.getInitialSession());
    expect(state).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      activeExperience: 'signed_out',
      localFamily: { status: 'ready', record: null, errorCode: null },
      deviceAccess: { status: 'ready', primaryRole: 'none', record: null },
      parentOnboarding: baseline.parentOnboarding,
      childAccess: baseline.childAccess,
      childVoiceView: INITIAL_CHILD_VOICE_VIEW,
      liveChildAiGrants: baseline.liveChildAiGrants,
      liveVoiceCapture: null,
      childCoachResult: null,
      ageAdaptedCoachResult: null,
      parentGuideSuggestion: null,
      returningUserWelcome: null,
      temporaryParentAccess: null,
      familyReward: baseline.familyReward,
      permissionProofSequence: 0,
    });
    expect(state.authorizeParentExperience().ok).toBe(false);
    expect(state.authorizeChildExperience().ok).toBe(false);
    expect(
      state.requestParentVerification({ identifier: 'fresh@example.com', networkAvailable: false })
        .ok,
    ).toBe(true);
    expect((await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE)).ok).toBe(
      true,
    );
    expect(usePrototypeStore.getState().completeParentOnboarding().ok).toBe(true);
    expect(usePrototypeStore.getState().getChildPermissionGrant('child_salem')).toMatchObject({
      ok: true,
      data: {
        voiceGranted: false,
        mediaGranted: false,
        aiGranted: false,
        languagePreference: 'ar',
      },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'parent',
      localFamily: { record: { parent: { normalizedIdentifier: 'fresh@example.com' } } },
    });
  });
});
