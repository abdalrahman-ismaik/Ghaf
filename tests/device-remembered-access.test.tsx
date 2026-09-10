import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  createChildDeviceAffinity,
  createParentDeviceAffinity,
  parseDeviceAffinityRecord,
  resolveRememberedAccessLocale,
  restoreRememberedDeviceAccess,
} from '../src/features/access/rememberedDeviceAccess';
import {
  createChildAccessController,
  createDeterministicSyntheticAccessService,
  createParentOnboardingController,
  PARENT_VERIFICATION_CODE,
} from '../src/features/access';
import { createLocalFamilyRecord, localFamilyRecordToReceipt } from '../src/features/local-family';
import { resources } from '../src/i18n/resources';
import type { LocalFamilyRecord } from '../src/models/localFamily';
import {
  createDeviceAccessRepository,
  createMemoryLocalKeyValueStorage,
  DEVICE_ACCESS_STORAGE_KEY,
} from '../src/services/local';
import { deviceLocalStorage } from '../src/services/local/storage';
import { serviceRegistry } from '../src/services';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '../src/state/usePrototypeStore';
import { resetPrototypeForTest } from './helpers/prototypeStore';

const CREATED_AT = '2026-09-06T14:00:00.000Z';
const UPDATED_AT = '2026-09-07T09:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function localFamily(pairedChildIds: LocalFamilyRecord['pairedChildIds'] = []): LocalFamilyRecord {
  return expectOk(
    createLocalFamilyRecord({
      parentIdentifier: {
        normalizedIdentifier: 'parent@example.com',
        identifierKind: 'email',
        maskedDestination: 'p***@example.com',
      },
      familyName: 'Palm Family',
      appLanguage: 'en',
      children: [
        {
          id: 'child_salem',
          role: 'child',
          nickname: 'Salem',
          avatarId: 'ghaf_tree',
          ageBand: '9_11',
          preferredLanguage: 'both',
          gender: 'prefer_not_to_say',
          interests: ['sustainability', 'nature'],
          hobbies: ['gardening'],
          accessibilityDefaults: ['simpler_instructions'],
          supportPreferences: ['short_steps', 'adult_alongside'],
          personalizationEnabled: true,
        },
      ],
      pairedChildIds,
      now: CREATED_AT,
    }),
  );
}

describe('Feature 005 device-affinity schema', () => {
  it('round-trips one exact Parent or eligible Child principal without an access secret', () => {
    const family = localFamily(['child_salem']);
    const parent = expectOk(createParentDeviceAffinity({ family, now: UPDATED_AT }));
    const child = expectOk(
      createChildDeviceAffinity({ family, childId: 'child_salem', now: UPDATED_AT }),
    );

    expect(parseDeviceAffinityRecord(JSON.stringify(parent))).toEqual({ ok: true, data: parent });
    expect(parseDeviceAffinityRecord(JSON.stringify(child))).toEqual({ ok: true, data: child });
    expect(parent).toMatchObject({
      schemaVersion: 1,
      principal: {
        role: 'parent',
        parentId: 'parent_al_noor',
        householdId: 'household_al_noor',
      },
      familyCreatedAt: CREATED_AT,
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(child).toMatchObject({
      principal: {
        role: 'child',
        childId: 'child_salem',
        householdId: 'household_al_noor',
      },
    });
    expect(JSON.stringify({ parent, child })).not.toMatch(
      /424242|2468|password|verificationCode|sessionId|expiresAt|capabilities|token|proof/iu,
    );
  });

  it.each([
    'not-json',
    JSON.stringify({ schemaVersion: 2 }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      extra: true,
    }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      updatedAt: 'not-a-time',
    }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      principal: { role: 'child', childId: 'child_unknown', householdId: 'household_al_noor' },
    }),
  ])('fails closed for malformed, expanded, unknown-version, or invalid data', (raw) => {
    expect(parseDeviceAffinityRecord(raw)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('rejects a Child marker before that exact profile is configured and paired', () => {
    expect(
      createChildDeviceAffinity({
        family: localFamily(),
        childId: 'child_salem',
        now: UPDATED_AT,
      }),
    ).toMatchObject({ ok: false });
    expect(
      createChildDeviceAffinity({
        family: localFamily(),
        childId: 'child_alya',
        now: UPDATED_AT,
      }),
    ).toMatchObject({ ok: false });
  });
});

describe('Feature 005 device-affinity repository', () => {
  it('reads absence, replaces one principal, clones reads, clears a matching Child, and clears all', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    const family = localFamily(['child_salem']);

    expect(repository.read()).toEqual({ ok: true, data: null });
    const rememberedParent = expectOk(repository.rememberParent(family, UPDATED_AT));
    expect(repository.read()).toEqual({ ok: true, data: rememberedParent });

    const rememberedChild = expectOk(repository.rememberChild(family, 'child_salem', UPDATED_AT));
    expect(repository.read()).toEqual({ ok: true, data: rememberedChild });
    expect(storage.getItem(DEVICE_ACCESS_STORAGE_KEY)).not.toBeNull();

    expect(repository.clearMatchingChild('child_alya')).toEqual({ ok: true, data: false });
    expect(repository.read()).toEqual({ ok: true, data: rememberedChild });
    expect(repository.clearMatchingChild('child_salem')).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });

    expectOk(repository.rememberParent(family, UPDATED_AT));
    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
  });

  it('fails closed for corrupt storage and preserves the prior record on failed writes', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    const family = localFamily(['child_salem']);
    const rememberedParent = expectOk(repository.rememberParent(family, UPDATED_AT));

    storage.failNextWrite();
    expect(repository.rememberChild(family, 'child_salem', UPDATED_AT)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toEqual({ ok: true, data: rememberedParent });

    storage.setItem(DEVICE_ACCESS_STORAGE_KEY, '{broken');
    expect(repository.read()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('blocks a clear failure so explicit logout cannot claim the marker was removed', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    expectOk(repository.rememberParent(localFamily(), UPDATED_AT));

    storage.failNextWrite();
    expect(repository.clear()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toMatchObject({ ok: true, data: { principal: { role: 'parent' } } });
  });

  it('fails closed when the storage read itself throws', () => {
    const repository = createDeviceAccessRepository({
      getItem() {
        throw new Error('Prepared read failure');
      },
      setItem() {},
      removeItem() {},
    });

    expect(repository.read()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('returns isolated record clones that cannot mutate persisted affinity', () => {
    const repository = createDeviceAccessRepository(createMemoryLocalKeyValueStorage());
    const saved = expectOk(repository.rememberParent(localFamily(), UPDATED_AT));
    const firstRead = expectOk(repository.read());
    if (!firstRead) throw new Error('Expected a remembered Parent record');

    (firstRead as { updatedAt: string }).updatedAt = CREATED_AT;
    (firstRead.principal as { parentId: string }).parentId = 'tampered-parent';

    expect(repository.read()).toEqual({ ok: true, data: saved });
  });
});

describe('Feature 005 fresh authority restoration', () => {
  function controllers(family: LocalFamilyRecord) {
    const access = createDeterministicSyntheticAccessService();
    const parent = createParentOnboardingController(access, {
      sessionId: 'f005-parent-session',
      deviceId: 'f005-parent-device',
    });
    const child = createChildAccessController(access, parent);
    expectOk(parent.restoreCompletionReceipt(localFamilyRecordToReceipt(family)));
    expectOk(
      child.restorePairedDevices({
        childIds: family.pairedChildIds,
        pairedAt: family.updatedAt,
      }),
    );
    return { parent, child };
  }

  it('mints a fresh Parent authority only after the marker matches a restored family receipt', () => {
    const family = localFamily();
    const affinity = expectOk(createParentDeviceAffinity({ family, now: UPDATED_AT }));
    const { parent, child } = controllers(family);

    expect(
      restoreRememberedDeviceAccess({
        affinity,
        family,
        parent,
        child,
        now: UPDATED_AT,
      }),
    ).toMatchObject({
      ok: true,
      data: { activeExperience: 'parent', activeChildId: null },
    });
    expect(parent.authorizeParentExperience(UPDATED_AT)).toMatchObject({ ok: true });
    expect(parent.resumeRememberedParent(UPDATED_AT)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(child.authorizeChildExperience(UPDATED_AT)).toMatchObject({ ok: false });
  });

  it('mints a fresh Child authority only for the exact restored active pairing', () => {
    const family = localFamily(['child_salem']);
    const affinity = expectOk(
      createChildDeviceAffinity({ family, childId: 'child_salem', now: UPDATED_AT }),
    );
    const { parent, child } = controllers(family);

    expect(
      restoreRememberedDeviceAccess({
        affinity,
        family,
        parent,
        child,
        now: UPDATED_AT,
      }),
    ).toMatchObject({
      ok: true,
      data: { activeExperience: 'child', activeChildId: 'child_salem' },
    });
    expect(child.authorizeChildExperience(UPDATED_AT)).toMatchObject({ ok: true });
    expect(parent.authorizeParentExperience(UPDATED_AT)).toMatchObject({ ok: false });
  });

  it('fails closed before either controller resumes when the affinity and family do not match', () => {
    const family = localFamily(['child_salem']);
    const affinity = {
      ...expectOk(createParentDeviceAffinity({ family, now: UPDATED_AT })),
      familyCreatedAt: '2026-09-06T15:00:00.000Z',
    };
    const { parent, child } = controllers(family);

    expect(
      restoreRememberedDeviceAccess({
        affinity,
        family,
        parent,
        child,
        now: UPDATED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(parent.authorizeParentExperience(UPDATED_AT)).toMatchObject({ ok: false });
    expect(child.authorizeChildExperience(UPDATED_AT)).toMatchObject({ ok: false });
  });

  it('rejects direct Child resume when no matching pairing was restored', () => {
    const family = localFamily();
    const { child } = controllers(family);

    expect(child.resumeRememberedChild('child_salem', UPDATED_AT)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(child.getView()).toMatchObject({ status: 'signed_out', selectedChildId: null });
  });

  it('restores the configured family language only with remembered authority', () => {
    const family = { ...localFamily(), appLanguage: 'en' as const };

    expect(
      resolveRememberedAccessLocale({
        activeExperience: 'parent',
        family,
        fallbackLocale: 'ar',
      }),
    ).toBe('en');
    expect(
      resolveRememberedAccessLocale({
        activeExperience: 'signed_out',
        family,
        fallbackLocale: 'ar',
      }),
    ).toBe('ar');
  });
});

describe('Feature 005 store integration', () => {
  async function enterParent(remember = false) {
    const state = usePrototypeStore.getState();
    expectOk(
      state.localFamily.record
        ? state.requestExistingParentVerification({
            identifier: 'parent@example.com',
            networkAvailable: false,
          })
        : state.requestParentVerification({
            identifier: 'parent@example.com',
            networkAvailable: false,
          }),
    );
    usePrototypeStore.getState().setRememberParentOnThisDevice(remember);
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(usePrototypeStore.getState().completeParentOnboarding());
  }

  async function prepareSalemPairing() {
    await enterParent();
    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
    expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
    expectOk(usePrototypeStore.getState().requestChildPairing());
    await enterParent();
    expectOk(usePrototypeStore.getState().approveChildPairing());
    expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  }

  async function pairSalem() {
    await prepareSalemPairing();
    expectOk(usePrototypeStore.getState().completeChildPairing());
  }

  it('stores Parent opt-in after entry and clears it before successful explicit logout', async () => {
    expectOk(resetPrototypeForTest());
    await enterParent(true);

    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'parent',
      rememberParentOnThisDevice: false,
      deviceAccess: { status: 'ready', primaryRole: 'parent', primaryChildId: null },
    });
    expect(serviceRegistry.deviceAccess.read()).toMatchObject({
      ok: true,
      data: { principal: { role: 'parent' } },
    });

    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      deviceAccess: { status: 'ready', primaryRole: 'none' },
    });
  });

  it('keeps opt-out session-only and does not undo valid entry when preference storage fails', async () => {
    expectOk(resetPrototypeForTest());
    await enterParent();
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
    expectOk(usePrototypeStore.getState().signOutExperience());

    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    usePrototypeStore.getState().setRememberParentOnThisDevice(true);
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    deviceLocalStorage.failNextWrite();
    expectOk(usePrototypeStore.getState().completeParentOnboarding());

    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState().deviceAccess).toMatchObject({
      status: 'unavailable',
      record: null,
      primaryRole: 'none',
    });
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
  });

  it('clears a stale affinity before creating a new family with Parent remembrance off', async () => {
    expectOk(resetPrototypeForTest());
    expectOk(serviceRegistry.deviceAccess.rememberParent(localFamily(), UPDATED_AT));

    await enterParent();

    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState()).toMatchObject({
      rememberParentOnThisDevice: false,
      deviceAccess: { primaryRole: 'none', primaryChildId: null },
    });
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
  });

  it('blocks Parent logout when its remembered marker cannot be removed', async () => {
    expectOk(resetPrototypeForTest());
    await enterParent(true);
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().signOutExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(true);
    expect(serviceRegistry.deviceAccess.read()).toMatchObject({
      ok: true,
      data: { principal: { role: 'parent' } },
    });
  });

  it('makes completed Child pairing the one remembered principal', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();

    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'child',
      activeChildId: 'child_salem',
      deviceAccess: { primaryRole: 'child', primaryChildId: 'child_salem' },
    });
    expect(serviceRegistry.deviceAccess.read()).toMatchObject({
      ok: true,
      data: { principal: { role: 'child', childId: 'child_salem' } },
    });
  });

  it('keeps returning Child entry retryable when affinity storage fails before activation', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().verifyChildCredential('2468')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      childAccess: {
        status: 'profile_selected',
        selectedChildId: 'child_salem',
        canEnterChildExperience: false,
        pairedDevices: [{ childId: 'child_salem', status: 'paired' }],
      },
      deviceAccess: { status: 'unavailable', primaryRole: 'none', primaryChildId: null },
      returningUserWelcome: null,
    });
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(false);
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(false);
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
    expect(serviceRegistry.localFamily.read()).toMatchObject({
      ok: true,
      data: { pairedChildIds: ['child_salem'] },
    });

    expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    await enterParent();
    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeChildId: 'child_salem',
      temporaryParentAccess: null,
    });
  });

  it('leaves pairing approved and retryable when the family pairing marker cannot be saved', async () => {
    expectOk(resetPrototypeForTest());
    await prepareSalemPairing();
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().completeChildPairing()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      childAccess: {
        status: 'pairing_approved',
        pairedDevices: [],
        canEnterChildExperience: false,
      },
      deviceAccess: { primaryRole: 'none', primaryChildId: null },
      localFamily: { record: { pairedChildIds: [] } },
    });
    expect(serviceRegistry.localFamily.read()).toMatchObject({
      ok: true,
      data: { pairedChildIds: [] },
    });
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });

    expectOk(usePrototypeStore.getState().completeChildPairing());
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
  });

  it('rolls back the family marker and remains retryable when Child affinity cannot be saved', async () => {
    expectOk(resetPrototypeForTest());
    await prepareSalemPairing();
    const persistPairing = serviceRegistry.localFamily.setPairedChild;
    const scheduleAffinityFailure = vi
      .spyOn(serviceRegistry.localFamily, 'setPairedChild')
      .mockImplementationOnce((...args) => {
        const result = persistPairing(...args);
        if (result.ok) deviceLocalStorage.failNextWrite();
        return result;
      });

    const result = usePrototypeStore.getState().completeChildPairing();
    scheduleAffinityFailure.mockRestore();

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      childAccess: {
        status: 'pairing_approved',
        pairedDevices: [],
        canEnterChildExperience: false,
      },
      deviceAccess: { status: 'unavailable', primaryRole: 'none', primaryChildId: null },
      localFamily: { record: { pairedChildIds: [] } },
    });
    expect(serviceRegistry.localFamily.read()).toMatchObject({
      ok: true,
      data: { pairedChildIds: [] },
    });
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });

    expectOk(usePrototypeStore.getState().completeChildPairing());
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
  });

  it('hands a remembered Child to temporary Parent access and returns after Parent logout', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();

    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      childAccess: { status: 'signed_out', canEnterChildExperience: false },
      temporaryParentAccess: { returnChildId: 'child_salem' },
      deviceAccess: { primaryRole: 'child', primaryChildId: 'child_salem' },
    });
    await enterParent(true);
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(true);
    expect(serviceRegistry.deviceAccess.read()).toMatchObject({
      ok: true,
      data: { principal: { role: 'child', childId: 'child_salem' } },
    });

    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(false);
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'child',
      activeChildId: 'child_salem',
      temporaryParentAccess: null,
    });
  });

  it('stays signed out when remembered Child affinity disappears during temporary Parent access', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    await enterParent();
    expectOk(serviceRegistry.deviceAccess.clear());

    expectOk(usePrototypeStore.getState().signOutExperience());

    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      temporaryParentAccess: null,
      deviceAccess: { status: 'ready', primaryRole: 'none', primaryChildId: null },
    });
  });

  it('cancels temporary Parent entry back to Child and never bypasses active Parent separation', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    expectOk(usePrototypeStore.getState().cancelTemporaryParentAccess());
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);

    expect(usePrototypeStore.getState().beginTemporaryParentAccess()).toMatchObject({ ok: true });
    await enterParent();
    expect(usePrototypeStore.getState().selectChildAccessProfile('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('fails closed when Child affinity disappears before temporary Parent entry is cancelled', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    expectOk(serviceRegistry.deviceAccess.clear());

    expect(usePrototypeStore.getState().cancelTemporaryParentAccess()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      temporaryParentAccess: null,
      deviceAccess: { status: 'ready', primaryRole: 'none', primaryChildId: null },
    });
  });

  it('clears matching Child affinity on revocation and every affinity on reset', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    await enterParent();
    expectOk(usePrototypeStore.getState().revokeChildDevice('child_salem'));
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });

    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      temporaryParentAccess: null,
    });

    await enterParent(true);
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
    expect(usePrototypeStore.getState().deviceAccess).toMatchObject({
      status: 'ready',
      record: null,
      primaryRole: 'none',
    });
  });

  it('publishes durable unpairing and forgets cached Child access when controller revocation fails', async () => {
    expectOk(resetPrototypeForTest());
    await pairSalem();
    expectOk(usePrototypeStore.getState().beginTemporaryParentAccess());
    await enterParent();
    const failControllerRevocation = vi
      .spyOn(serviceRegistry.access, 'revokeDevice')
      .mockReturnValueOnce({
        ok: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Prepared controller revocation failure',
          retryable: false,
          fallbackAvailable: false,
        },
      });

    const result = usePrototypeStore.getState().revokeChildDevice('child_salem');
    failControllerRevocation.mockRestore();

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'parent',
      childAccess: { pairedDevices: [], canEnterChildExperience: false },
      deviceAccess: { primaryRole: 'none', primaryChildId: null },
      localFamily: { record: { pairedChildIds: [] } },
      temporaryParentAccess: null,
    });
    expect(serviceRegistry.localFamily.read()).toMatchObject({
      ok: true,
      data: { pairedChildIds: [] },
    });
    expect(serviceRegistry.deviceAccess.read()).toEqual({ ok: true, data: null });
  });
});

describe('Feature 005 presentation source contract', () => {
  const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  it('shows an accessible unchecked Parent choice or a temporary Child-device notice', () => {
    const choice = source('src/components/access/RememberDeviceChoice.tsx');
    const verification = source('app/access/parent/verification.tsx');

    expect(choice).toContain('accessibilityRole="checkbox"');
    expect(choice).toContain('accessibilityState={{ checked: selected, disabled }}');
    expect(choice).toContain('minHeight: layout.touchTarget');
    expect(verification).toContain('<RememberDeviceChoice');
    expect(verification).toContain('selected={rememberParentOnThisDevice}');
    expect(verification).toContain("t('access.verification.temporaryParentAccess')");
    expect(verification).toContain('temporaryParentAccess ? (');
  });

  it('uses the dedicated Child-to-Parent handoff from every Child-facing switch action', () => {
    for (const path of [
      'app/child/index.tsx',
      'app/child/settings.tsx',
      'app/child/task.tsx',
      'app/garden.tsx',
      'app/circle.tsx',
    ]) {
      expect(source(path), path).toContain('beginTemporaryParentAccess');
    }
  });

  it('keeps Arabic and English device-access copy structurally paired', () => {
    const arabic = resources.ar.translation.access.verification;
    const english = resources.en.translation.access.verification;
    for (const key of [
      'rememberDeviceTitle',
      'rememberDeviceBody',
      'temporaryParentAccess',
    ] as const) {
      expect(arabic).toHaveProperty(key);
      expect(english).toHaveProperty(key);
    }
    expect(resources.ar.translation.r003.childSettings).toHaveProperty('parentAccess');
    expect(resources.en.translation.r003.childSettings).toHaveProperty('parentAccess');
  });
});
