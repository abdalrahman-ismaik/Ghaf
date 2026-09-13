import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ServiceResult } from '../../src/services/interfaces';
import type { PrototypeStoreState } from '../../src/state/usePrototypeStore';

const denied: ServiceResult<never> = {
  ok: false,
  error: {
    code: 'INVALID_TRANSITION',
    message: 'Injected local access failure',
    retryable: false,
    fallbackAvailable: false,
  },
};

async function freshRun(mode: 'ordinary' | 'demo' = 'ordinary') {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', mode === 'demo' ? 'true' : undefined);
  vi.resetModules();
  const store = await import('../../src/state/usePrototypeStore');
  const { serviceRegistry } = await import('../../src/services');
  const { deviceLocalStorage } = await import('../../src/services/local/storage');
  const { LOCAL_FAMILY_STORAGE_KEY } = await import('../../src/models/localFamily');
  return {
    ...store,
    serviceRegistry,
    deviceLocalStorage,
    familyKey: LOCAL_FAMILY_STORAGE_KEY,
    state: store.usePrototypeStore.getState,
  };
}

function expectOk<T>(
  result:
    | { readonly ok: true; readonly data: T }
    | { readonly ok: false; readonly error: { readonly message: string } },
): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function progression(state: PrototypeStoreState) {
  return structuredClone({
    children: state.children,
    journey: state.journey,
    choicePool: state.choicePool,
    landscapeProgress: state.landscapeProgress,
    household: state.household,
    familyReward: state.familyReward,
    growthJourney: state.growthJourney,
    privateLeague: state.privateLeague,
    sharedGrowth: state.sharedGrowth,
  });
}

async function childRun() {
  const run = await freshRun();
  expectOk(run.state().enterLocalParentAccount());
  expectOk(run.state().signOutExperience());
  expectOk(run.state().selectChildAccessProfile('child_salem'));
  expectOk(run.state().verifyChildCredential('2468'));
  expect(run.state().authorizeChildExperience().ok).toBe(true);
  return run;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('ordinary local Parent account selection', () => {
  it('initializes once without verification or remote auth and preserves locale and progression', async () => {
    const run = await freshRun();
    run.state().setLocale('en');
    const before = progression(run.state());
    const messaging = run.serviceRegistry.familyMessaging.controller.getSnapshot();
    const verification = vi.spyOn(run.state(), 'requestExistingParentVerification');
    const code = vi.spyOn(run.state(), 'verifyParentCode');
    const remote = vi.spyOn(run.serviceRegistry.familyMessaging.service, 'restore');
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');

    expect(expectOk(run.state().enterLocalParentAccount())).toMatchObject({
      authorized: true,
      destination: '/parent',
      origin: 'synthetic',
    });
    expect(run.selectHasActiveParentExperience(run.state())).toBe(true);
    expect(run.state().authorizeParentExperience().ok).toBe(true);
    expect(run.state().authorizeChildExperience().ok).toBe(false);
    expect(run.state().localFamily.configuredChildIds).toEqual(['child_salem', 'child_alya']);
    expect(run.state().locale).toBe('en');
    expect(run.state().returningUserWelcome).toBeNull();
    expect(progression(run.state())).toEqual(before);
    expect(save).toHaveBeenCalledTimes(1);
    expect(verification).not.toHaveBeenCalled();
    expect(code).not.toHaveBeenCalled();
    expect(remote).not.toHaveBeenCalled();
    expect(run.serviceRegistry.familyMessaging.controller.getSnapshot()).toBe(messaging);
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('reuses the stored family bytes and pairing without writes or changing the selected language', async () => {
    const run = await freshRun();
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.state().signOutExperience());
    run.state().setLocale('en');
    const beforeBytes = run.deviceLocalStorage.getItem(run.familyKey);
    const before = progression(run.state());
    const paired = run.state().childAccess.pairedDevices;
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');
    run.usePrototypeStore.setState({ locale: 'ar', direction: 'rtl' });

    expectOk(run.state().enterLocalParentAccount());
    expect(run.deviceLocalStorage.getItem(run.familyKey)).toBe(beforeBytes);
    expect(save).not.toHaveBeenCalled();
    expect(run.state().locale).toBe('ar');
    expect(run.state().childAccess.pairedDevices).toEqual(paired);
    expect(progression(run.state())).toEqual(before);
  });

  it('rolls back issued authority and restored pairing after a failed save, then retries', async () => {
    const run = await freshRun();
    const beforeParent = run.state().parentOnboarding;
    const beforeChild = run.state().childAccess;
    const issued = vi.spyOn(run.serviceRegistry.access, 'signInParent');
    run.deviceLocalStorage.failNextWrite();

    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().parentOnboarding).toEqual(beforeParent);
    expect(run.state().childAccess).toEqual(beforeChild);
    expect(run.serviceRegistry.localFamily.read()).toEqual({ ok: true, data: null });
    const issuedSession = issued.mock.results[0]?.value;
    if (!issuedSession?.ok) throw new Error('Expected an issued session before storage failed');
    expect(
      run.serviceRegistry.access.projectSession({
        session: issuedSession.data,
        now: '2026-09-04T10:00:00.000Z',
      }).ok,
    ).toBe(false);
    expectOk(run.state().enterLocalParentAccount());
    expect(run.state().authorizeParentExperience().ok).toBe(true);
  });

  it('does not save a fixture after a provider failure and permits a clean retry', async () => {
    const run = await freshRun();
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');
    vi.spyOn(run.serviceRegistry.access, 'signInParent').mockReturnValueOnce(denied);
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
    expect(run.state().activeExperience).toBe('signed_out');
    expectOk(run.state().enterLocalParentAccount());
  });

  it('aborts a reentrant provider attempt without saving or retaining authority', async () => {
    const run = await freshRun();
    const original = run.serviceRegistry.access.signInParent.bind(run.serviceRegistry.access);
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');
    vi.spyOn(run.serviceRegistry.access, 'signInParent').mockImplementationOnce((input) => {
      expect(run.state().enterLocalParentAccount().ok).toBe(false);
      return original(input);
    });
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(run.state().activeExperience).toBe('signed_out');
    expect(save).not.toHaveBeenCalled();
    expectOk(run.state().enterLocalParentAccount());
  });

  it('fails closed on repository read failure, invalid storage, and changed account data', async () => {
    const run = await freshRun();
    const save = vi.spyOn(run.serviceRegistry.localFamily, 'save');
    const read = vi.spyOn(run.serviceRegistry.localFamily, 'read').mockReturnValueOnce(denied);
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    read.mockRestore();
    run.deviceLocalStorage.setItem(run.familyKey, '{invalid');
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
    run.deviceLocalStorage.removeItem(run.familyKey);
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.state().signOutExperience());
    const family = run.state().localFamily.record!;
    run.deviceLocalStorage.setItem(
      run.familyKey,
      JSON.stringify({ ...family, familyName: 'Other' }),
    );
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rejects demo mode, unavailable directory, reset failure, and incomplete Parent verification', async () => {
    const demo = await freshRun('demo');
    expect(demo.state().enterLocalParentAccount().ok).toBe(false);
    const run = await freshRun();
    const ready = run.state().localFamily;
    run.usePrototypeStore.setState({ localFamily: { ...ready, status: 'unavailable' } });
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    run.usePrototypeStore.setState({ localFamily: ready, demoResetFailed: true });
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    run.usePrototypeStore.setState({ demoResetFailed: false });
    expectOk(run.state().requestParentVerification({ identifier: 'parent@example.com' }));
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(run.serviceRegistry.localFamily.read()).toEqual({ ok: true, data: null });
  });

  it('rejects an active Child and preserves temporary Child affinity through Parent entry and exit', async () => {
    const run = await childRun();
    const before = progression(run.state());
    const affinity = run.serviceRegistry.deviceAccess.read();
    expect(run.state().enterLocalParentAccount().ok).toBe(false);
    expect(run.state().authorizeChildExperience().ok).toBe(true);
    expectOk(run.state().beginTemporaryParentAccess());
    const temporary = run.state().temporaryParentAccess;
    expectOk(run.state().enterLocalParentAccount());
    expect(run.state().temporaryParentAccess).toEqual(temporary);
    expect(run.serviceRegistry.deviceAccess.read()).toEqual(affinity);
    expectOk(run.state().signOutExperience());
    expect(run.state().activeChildId).toBe('child_salem');
    expect(run.state().authorizeChildExperience().ok).toBe(true);
    expect(run.state().authorizeParentExperience().ok).toBe(false);
    expect(run.serviceRegistry.deviceAccess.read()).toEqual(affinity);
    expect(progression(run.state())).toEqual(before);
  });

  it('cancels temporary selection without Parent authority and denies return after affinity disappears', async () => {
    const run = await childRun();
    expectOk(run.state().beginTemporaryParentAccess());
    expectOk(run.state().cancelTemporaryParentAccess());
    expect(run.state().authorizeParentExperience().ok).toBe(false);
    expect(run.state().authorizeChildExperience().ok).toBe(true);
    expectOk(run.state().beginTemporaryParentAccess());
    expectOk(run.state().enterLocalParentAccount());
    expectOk(run.serviceRegistry.deviceAccess.clear());
    expectOk(run.state().signOutExperience());
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().authorizeChildExperience().ok).toBe(false);
  });
});
