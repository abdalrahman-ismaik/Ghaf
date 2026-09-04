import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access/parentOnboarding';
import { selectCanEnterParentExperience, usePrototypeStore } from '../src/state/usePrototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

async function completeOnboarding() {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  return expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

describe('R001 Parent onboarding store integration', () => {
  beforeEach(() => {
    usePrototypeStore.setState({ role: 'parent' });
    const reset = usePrototypeStore.getState().resetPrototype();
    expect(reset.ok).toBe(true);
  });

  it('does not treat the mutable presentation role as Parent access authority', () => {
    const initial = usePrototypeStore.getState();

    expect(initial.parentOnboarding).toMatchObject({
      status: 'signed_out',
      canEnterParentExperience: false,
      productionAuthentication: false,
    });
    expect(selectCanEnterParentExperience(initial)).toBe(false);

    initial.setRole('child');
    initial.setRole('parent');

    expect(selectCanEnterParentExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState().authorizeParentExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('exposes verification transitions and creates authority only on completion', async () => {
    const requested = expectOk(
      usePrototypeStore.getState().requestParentVerification({
        identifier: '+971 50 123 4242',
        networkAvailable: false,
      }),
    );
    expect(requested).toMatchObject({
      status: 'code_sent',
      offlineFallbackUsed: true,
      canEnterParentExperience: false,
    });

    const pendingWrongCode = usePrototypeStore.getState().verifyParentCode('111111');
    expect(usePrototypeStore.getState().parentOnboarding.status).toBe('verifying');
    await expect(pendingWrongCode).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().parentOnboarding.status).toBe('code_sent');

    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expect(selectCanEnterParentExperience(usePrototypeStore.getState())).toBe(false);

    const receipt = expectOk(usePrototypeStore.getState().completeParentOnboarding());
    expect(receipt).toMatchObject({
      destination: '/parent',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(selectCanEnterParentExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState().authorizeParentExperience()).toMatchObject({
      ok: true,
      data: { authorized: true, capability: 'enter_parent_experience' },
    });
  });

  it('keeps the established household and Child profiles isolated from the onboarding draft', async () => {
    const before = usePrototypeStore.getState();
    const household = before.household;
    const children = before.children;

    expectOk(
      usePrototypeStore.getState().requestParentVerification({
        identifier: 'parent@example.com',
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyName: 'Palm Family',
        appLanguage: 'en',
        child: {
          nickname: 'Demo Salem',
          preferredLanguage: 'both',
          accessibilityDefaults: ['larger_text', 'simpler_instructions'],
        },
      }),
    );

    const firstReceipt = expectOk(usePrototypeStore.getState().completeParentOnboarding());
    const secondReceipt = expectOk(usePrototypeStore.getState().completeParentOnboarding());

    expect(secondReceipt).toEqual(firstReceipt);
    expect(usePrototypeStore.getState()).toMatchObject({
      household,
      children,
      locale: 'en',
      direction: 'ltr',
      role: 'parent',
    });
  });

  it('invalidates onboarding authority during the existing exact Parent reset', async () => {
    await completeOnboarding();
    expect(selectCanEnterParentExperience(usePrototypeStore.getState())).toBe(true);

    expectOk(usePrototypeStore.getState().resetPrototype());

    const reset = usePrototypeStore.getState();
    expect(reset.parentOnboarding).toMatchObject({
      status: 'signed_out',
      canEnterParentExperience: false,
      completionReceipt: null,
    });
    expect(selectCanEnterParentExperience(reset)).toBe(false);
    expect(reset.authorizeParentExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });
});
