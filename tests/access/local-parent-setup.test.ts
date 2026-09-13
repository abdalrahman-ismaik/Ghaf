import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ServiceResult } from '../../src/services/interfaces';
import type { PrototypeStoreState } from '../../src/state/usePrototypeStore';

const denied: ServiceResult<never> = {
  ok: false,
  error: {
    code: 'INVALID_TRANSITION',
    message: 'Injected local staging failure',
    retryable: false,
    fallbackAvailable: false,
  },
};

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected successful local setup');
  return result.data;
}

async function freshRun(mode: 'ordinary' | 'demo' = 'ordinary') {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', mode === 'demo' ? 'true' : undefined);
  vi.resetModules();
  const store = await import('../../src/state/usePrototypeStore');
  const { serviceRegistry } = await import('../../src/services');
  const { deviceLocalStorage } = await import('../../src/services/local/storage');
  const { LOCAL_FAMILY_STORAGE_KEY, PREVIOUS_LOCAL_FAMILY_STORAGE_KEY } =
    await import('../../src/models/localFamily');
  const { ParentOnboardingController } =
    await import('../../src/features/access/parentOnboarding/controller');
  return {
    ...store,
    serviceRegistry,
    deviceLocalStorage,
    ParentOnboardingController,
    familyKey: LOCAL_FAMILY_STORAGE_KEY,
    previousKey: PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
    state: store.usePrototypeStore.getState,
  };
}

function progression(state: PrototypeStoreState) {
  return structuredClone({
    children: state.children,
    journey: state.journey,
    landscapeProgress: state.landscapeProgress,
    household: state.household,
    growthJourney: state.growthJourney,
    familyReward: state.familyReward,
    privateLeague: state.privateLeague,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('local Parent setup without a verification code', () => {
  it('stages fresh details with no OTP, authority, persistence or messaging until final completion', async () => {
    const run = await freshRun();
    run.state().setLocale('en');
    const before = progression(run.state());
    const request = vi.spyOn(run.ParentOnboardingController.prototype, 'requestVerification');
    const verify = vi.spyOn(run.ParentOnboardingController.prototype, 'verifyCode');
    const signIn = vi.spyOn(run.serviceRegistry.access, 'signInParent');
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');
    const messaging = run.serviceRegistry.familyMessaging.controller.getSnapshot();

    expectOk(run.state().beginLocalFamilySetup({ identifier: ' New-Parent@Example.com ' }));
    expect(run.state()).toMatchObject({
      activeExperience: 'signed_out',
      locale: 'en',
      pendingFamilyCreation: 'fresh',
      rememberParentOnThisDevice: false,
      parentOnboarding: {
        status: 'verified',
        delivery: null,
        productionAuthentication: false,
        canEnterParentExperience: false,
        completionReceipt: null,
        draft: { appLanguage: 'en' },
      },
    });
    expect(request).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(progression(run.state())).toEqual(before);
    expect(run.serviceRegistry.familyMessaging.controller.getSnapshot()).toBe(messaging);
    expect(run.state().beginLocalFamilySetup({ identifier: 'other@example.com' }).ok).toBe(false);

    expectOk(run.state().completeParentOnboarding());
    expect(run.state().authorizeParentExperience().ok).toBe(true);
    expect(run.state().localFamily.record?.parent.normalizedIdentifier).toBe(
      'new-parent@example.com',
    );
    expect(request).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('preserves the old family through staging and cancel and replaces only on final completion', async () => {
    const run = await freshRun();
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.state().signOutExperience());
    const previous = run.deviceLocalStorage.getItem(run.familyKey);
    const before = progression(run.state());
    const receipt = run.state().parentOnboarding.completionReceipt;
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');

    expectOk(run.state().beginLocalFamilySetup({ identifier: 'replacement@example.com' }));
    expect(run.state().pendingFamilyCreation).toBe('replacement');
    expect(run.state().parentOnboarding.completionReceipt).toBeNull();
    expect(run.state().authorizeParentExperience().ok).toBe(false);
    expect(run.deviceLocalStorage.getItem(run.familyKey)).toBe(previous);
    expect(progression(run.state())).toEqual(before);
    expect(save).not.toHaveBeenCalled();
    expectOk(run.state().cancelParentVerification());
    expect(run.state().parentOnboarding.completionReceipt).toEqual(receipt);
    expect(run.state().pendingFamilyCreation).toBeNull();
    expect(run.deviceLocalStorage.getItem(run.familyKey)).toBe(previous);

    expectOk(run.state().beginLocalFamilySetup({ identifier: 'replacement@example.com' }));
    expectOk(run.state().updateParentOnboardingDraft({ familyName: 'Replacement Family' }));
    expect(run.deviceLocalStorage.getItem(run.familyKey)).toBe(previous);
    expectOk(run.state().completeParentOnboarding());
    expect(run.state().localFamily.record).toMatchObject({
      familyName: 'Replacement Family',
      parent: { normalizedIdentifier: 'replacement@example.com' },
      pairedChildIds: [],
    });
    expect(run.state().authorizeParentExperience().ok).toBe(true);
  });

  it('rolls back replacement staging failure and permits retry without losing the receipt', async () => {
    const run = await freshRun();
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.state().signOutExperience());
    const before = run.state().parentOnboarding;
    const original = run.ParentOnboardingController.prototype.beginVerifiedFamilyReplacement;
    vi.spyOn(
      run.ParentOnboardingController.prototype,
      'beginVerifiedFamilyReplacement',
    ).mockImplementationOnce(function (this: InstanceType<typeof run.ParentOnboardingController>) {
      expectOk(original.call(this));
      return denied;
    });
    expect(run.state().beginLocalFamilySetup({ identifier: 'replacement@example.com' }).ok).toBe(
      false,
    );
    expect(run.state().parentOnboarding).toEqual(before);
    expect(run.state().pendingFamilyCreation).toBeNull();
    expectOk(run.state().beginLocalFamilySetup({ identifier: 'replacement@example.com' }));
    expectOk(run.state().cancelParentVerification());
    expect(run.state().parentOnboarding.completionReceipt).toEqual(before.completionReceipt);
  });

  it('stages only the authoritative repair candidate and preserves its identity, pairing and bytes', async () => {
    const run = await freshRun();
    const { createCanonicalDemoFamily } = await import('../../src/features/access/demoEntry');
    const family = expectOk(createCanonicalDemoFamily('2026-09-04T10:00:00.000Z'));
    const raw = JSON.stringify({
      ...family,
      schemaVersion: 3,
      children: family.children.map((child, index) => {
        const previous: Record<string, unknown> = { ...child, gender: index === 0 ? 'boy' : null };
        for (const key of [
          'sex',
          'customInterest',
          'customHobby',
          'customSupportPreference',
          'customAccessibility',
        ])
          delete previous[key];
        return previous;
      }),
    });
    run.deviceLocalStorage.setItem(run.previousKey, raw);
    const candidate = expectOk(run.serviceRegistry.localFamily.readProfileRepairCandidate());
    run.usePrototypeStore.setState({
      localFamily: { ...run.state().localFamily, status: 'unavailable' },
      localFamilyProfileRepair: candidate,
      locale: 'en',
      direction: 'ltr',
    });
    const request = vi.spyOn(run.ParentOnboardingController.prototype, 'requestVerification');
    const verify = vi.spyOn(run.ParentOnboardingController.prototype, 'verifyCode');
    const original = run.ParentOnboardingController.prototype.beginVerifiedProfileRepair;
    vi.spyOn(
      run.ParentOnboardingController.prototype,
      'beginVerifiedProfileRepair',
    ).mockImplementationOnce(function (
      this: InstanceType<typeof run.ParentOnboardingController>,
      input,
    ) {
      expectOk(original.call(this, input));
      return denied;
    });
    expect(run.state().beginLocalFamilyProfileRepair().ok).toBe(false);
    expect(run.state().parentOnboarding.status).toBe('signed_out');
    expect(run.state().pendingFamilyCreation).toBeNull();
    expectOk(run.state().beginLocalFamilyProfileRepair());
    expect(run.state()).toMatchObject({
      locale: 'en',
      pendingFamilyCreation: 'profile_repair',
      activeExperience: 'signed_out',
      parentOnboarding: { delivery: null, draft: { appLanguage: 'en' } },
    });
    expect(run.deviceLocalStorage.getItem(run.previousKey)).toBe(raw);
    expect(run.deviceLocalStorage.getItem(run.familyKey)).toBeNull();
    expect(request).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
    expectOk(run.state().updateParentOnboardingDraft({ childIndex: 1, child: { sex: 'female' } }));
    expectOk(run.state().completeParentOnboarding());
    expect(run.state().localFamily.record?.parent).toEqual(family.parent);
    expect(run.state().localFamily.record?.pairedChildIds).toEqual(family.pairedChildIds);
    expect(run.deviceLocalStorage.getItem(run.previousKey)).toBeNull();
  });

  it('rejects invalid identifiers, unavailable data, active sessions and demo mode', async () => {
    const run = await freshRun();
    expect(run.state().beginLocalFamilySetup({ identifier: 'invalid' }).ok).toBe(false);
    expect(run.state().parentOnboarding.status).toBe('signed_out');
    expect(run.state().beginLocalFamilyProfileRepair().ok).toBe(false);
    const ready = run.state().localFamily;
    run.usePrototypeStore.setState({ localFamily: { ...ready, status: 'unavailable' } });
    expect(run.state().beginLocalFamilySetup({ identifier: 'parent@example.com' }).ok).toBe(false);
    run.usePrototypeStore.setState({ localFamily: ready });
    expectOk(run.state().enterLocalParentAccount());
    expect(run.state().beginLocalFamilySetup({ identifier: 'parent@example.com' }).ok).toBe(false);
    expectOk(run.state().signOutExperience());
    expectOk(run.state().selectChildAccessProfile('child_salem'));
    expectOk(run.state().verifyChildCredential('2468'));
    expect(run.state().beginLocalFamilySetup({ identifier: 'parent@example.com' }).ok).toBe(false);
    expect(run.state().beginLocalFamilyProfileRepair().ok).toBe(false);
    expect(run.state().authorizeChildExperience().ok).toBe(true);
    const demo = await freshRun('demo');
    expect(demo.state().beginLocalFamilySetup({ identifier: 'parent@example.com' }).ok).toBe(false);
    expect(demo.state().beginLocalFamilyProfileRepair().ok).toBe(false);
  });

  it('preserves temporary Child return and affinity when local replacement setup is cancelled', async () => {
    const run = await freshRun();
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.state().signOutExperience());
    expectOk(run.state().selectChildAccessProfile('child_salem'));
    expectOk(run.state().verifyChildCredential('2468'));
    expectOk(run.state().beginTemporaryParentAccess());
    const temporary = run.state().temporaryParentAccess;
    const affinity = run.serviceRegistry.deviceAccess.read();
    const before = progression(run.state());
    expectOk(run.state().beginLocalFamilySetup({ identifier: 'replacement@example.com' }));
    expect(run.state().temporaryParentAccess).toEqual(temporary);
    expect(run.serviceRegistry.deviceAccess.read()).toEqual(affinity);
    expectOk(run.state().cancelParentVerification());
    expectOk(run.state().cancelTemporaryParentAccess());
    expect(run.state().authorizeChildExperience().ok).toBe(true);
    expect(run.state().authorizeParentExperience().ok).toBe(false);
    expect(run.serviceRegistry.deviceAccess.read()).toEqual(affinity);
    expect(progression(run.state())).toEqual(before);
  });

  it('invalidates a legacy in-flight verification callback when local setup is explicitly staged', async () => {
    const run = await freshRun();
    const controller = new run.ParentOnboardingController(run.serviceRegistry.access);
    expectOk(controller.requestVerification({ identifier: 'old@example.com' }));
    const pending = controller.verifyCode('424242');
    expectOk(controller.stageLocalSetup('new@example.com'));
    expect((await pending).ok).toBe(false);
    expect(controller.getPendingIdentifier()?.normalizedIdentifier).toBe('new@example.com');
    expect(controller.getView()).toMatchObject({
      status: 'verified',
      delivery: null,
      canEnterParentExperience: false,
      completionReceipt: null,
    });
    expect(controller.authorizeParentExperience('2026-09-04T10:00:00.000Z').ok).toBe(false);
  });
});
