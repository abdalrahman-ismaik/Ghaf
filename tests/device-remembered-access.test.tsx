import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createChildDeviceAffinity,
  createParentDeviceAffinity,
  parseDeviceAffinityRecord,
  restoreRememberedDeviceAccess,
} from '../src/features/access/rememberedDeviceAccess';
import {
  createChildAccessController,
  createDeterministicSyntheticAccessService,
  createParentOnboardingController,
  PARENT_VERIFICATION_CODE,
} from '../src/features/access';
import { createLocalFamilyRecord } from '../src/features/local-family';
import { localFamilyRecordToReceipt } from '../src/features/local-family';
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

  async function pairSalem() {
    await enterParent();
    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
    expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
    expectOk(usePrototypeStore.getState().requestChildPairing());
    await enterParent();
    expectOk(usePrototypeStore.getState().approveChildPairing());
    expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
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
});

describe('Feature 005 presentation source contract', () => {
  const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  it.todo('shows an accessible unchecked Parent choice or a temporary Child-device notice');
  it.todo('uses the dedicated Child-to-Parent handoff from every Child-facing switch action');
  it.todo('keeps Arabic and English device-access copy structurally paired');

  void source;
});
