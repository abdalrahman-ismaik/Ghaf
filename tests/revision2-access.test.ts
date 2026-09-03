import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access/fixtures';
import {
  selectIsParentAuthenticated,
  selectParentAccessState,
  usePrototypeStore,
} from '../src/state/usePrototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

describe('Revision 2 deterministic Parent access and setup', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  it('starts signed out without treating the compatible legacy Parent role as authentication', () => {
    const state = usePrototypeStore.getState();

    expect(state.role).toBe('parent');
    expect(state.parentAccess).toMatchObject({
      state: 'signed_out',
      origin: 'synthetic',
      productionAuthentication: false,
      normalizedIdentifier: null,
      offlineFallbackUsed: false,
    });
    expect(selectParentAccessState(state)).toBe('signed_out');
    expect(selectIsParentAuthenticated(state)).toBe(false);
  });

  it.each([
    {
      identifier: ' Parent@Example.COM ',
      normalizedIdentifier: 'parent@example.com',
      identifierKind: 'email',
      maskedDestination: 'p***@example.com',
    },
    {
      identifier: '+971 50 123 4242',
      normalizedIdentifier: '+971501234242',
      identifierKind: 'phone',
      maskedDestination: '••••••••••42',
    },
  ] as const)(
    'accepts and normalizes a synthetic $identifierKind identifier',
    ({ identifier, normalizedIdentifier, identifierKind, maskedDestination }) => {
      const result = usePrototypeStore.getState().requestParentVerification({ identifier });

      expectOk(result);
      expect(result.data).toMatchObject({
        state: 'code_sent',
        normalizedIdentifier,
        identifierKind,
        maskedDestination,
        delivery: 'local_fixture',
        offlineFallbackUsed: false,
        productionAuthentication: false,
      });
      expect(result.meta).toMatchObject({ origin: 'synthetic', fallbackUsed: false });
    },
  );

  it.each(['', 'parent', 'parent@', '1234', '+971 phone'])(
    'rejects invalid identifier %j without advancing the access state',
    (identifier) => {
      const result = usePrototypeStore.getState().requestParentVerification({ identifier });

      expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
      expect(usePrototypeStore.getState().parentAccess.state).toBe('signed_out');
    },
  );

  it('uses the same local fixture offline and labels the fallback honestly', () => {
    const result = usePrototypeStore.getState().requestParentVerification({
      identifier: '+971501234242',
      networkAvailable: false,
    });

    expectOk(result);
    expect(result.data).toMatchObject({
      state: 'code_sent',
      delivery: 'local_fixture',
      offlineFallbackUsed: true,
    });
    expect(result.meta).toMatchObject({ origin: 'synthetic', fallbackUsed: true });
  });

  it('exposes verifying while pending, rejects a wrong code, and accepts the local fixture code', async () => {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: '+971501234242' }),
    );

    const wrongAttempt = usePrototypeStore.getState().verifyParentCode('111111');
    expect(usePrototypeStore.getState().parentAccess.state).toBe('verifying');
    await expect(wrongAttempt).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().parentAccess.state).toBe('code_sent');

    const correctAttempt = usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE);
    expect(usePrototypeStore.getState().parentAccess.state).toBe('verifying');
    await expect(correctAttempt).resolves.toMatchObject({
      ok: true,
      data: { state: 'verified', productionAuthentication: false },
    });
    expect(usePrototypeStore.getState().parentAccess.state).toBe('verified');
    expect(selectIsParentAuthenticated(usePrototypeStore.getState())).toBe(false);
  });

  it('keeps the onboarding draft through access steps and applies deep partial updates', async () => {
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyName: 'عائلة النخلة',
        child: {
          nickname: 'سالم',
          avatarId: 'water_drop',
          preferredLanguage: 'both',
          accessibilityDefaults: ['larger_text', 'simpler_instructions'],
        },
      }),
    );

    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: 'parent@example.com' }),
    );
    await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE);

    expect(usePrototypeStore.getState().parentOnboardingDraft).toEqual({
      familyName: 'عائلة النخلة',
      appLanguage: 'ar',
      child: {
        nickname: 'سالم',
        avatarId: 'water_drop',
        ageBand: '9_11',
        preferredLanguage: 'both',
        accessibilityDefaults: ['larger_text', 'simpler_instructions'],
      },
    });
  });

  it('requires verified access and a complete safe draft before authentication', async () => {
    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: 'parent@example.com' }),
    );
    await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE);
    expectOk(usePrototypeStore.getState().updateParentOnboardingDraft({ familyName: '  ' }));

    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().parentAccess.state).toBe('verified');
  });

  it('completes once, preserves canonical household fixtures, and is idempotent', async () => {
    const canonicalHousehold = structuredClone(usePrototypeStore.getState().household);
    const canonicalChildren = structuredClone(usePrototypeStore.getState().children);

    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: 'parent@example.com' }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        appLanguage: 'en',
        familyName: 'Palm Family',
        child: { nickname: 'Salem', preferredLanguage: 'en' },
      }),
    );

    const first = usePrototypeStore.getState().completeParentOnboarding();
    expectOk(first);
    expect(first.data).toMatchObject({ state: 'authenticated_parent' });
    expect(usePrototypeStore.getState()).toMatchObject({
      role: 'parent',
      locale: 'en',
      direction: 'ltr',
    });
    expect(selectIsParentAuthenticated(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState().household).toEqual(canonicalHousehold);
    expect(usePrototypeStore.getState().children).toEqual(canonicalChildren);

    const second = usePrototypeStore.getState().completeParentOnboarding();
    expectOk(second);
    expect(second.data).toEqual(first.data);
    expect(usePrototypeStore.getState().household).toEqual(canonicalHousehold);
    expect(usePrototypeStore.getState().children).toEqual(canonicalChildren);
  });

  it('reset clears access and drafts atomically back to the Arabic synthetic baseline', async () => {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: 'parent@example.com' }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        appLanguage: 'en',
        familyName: 'Changed family',
        child: { nickname: 'Changed child', accessibilityDefaults: ['reduced_motion'] },
      }),
    );
    expectOk(usePrototypeStore.getState().completeParentOnboarding());

    const reset = usePrototypeStore.getState().resetPrototype();

    expect(reset).toEqual({ navigateTo: '/', replaceHistory: true });
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      parentAccess: {
        state: 'signed_out',
        normalizedIdentifier: null,
        offlineFallbackUsed: false,
        productionAuthentication: false,
      },
      parentOnboardingDraft: {
        familyName: 'عائلة النخلة',
        appLanguage: 'ar',
        child: {
          nickname: 'سالم',
          avatarId: 'ghaf_tree',
          ageBand: '9_11',
          preferredLanguage: 'ar',
          accessibilityDefaults: ['simpler_instructions'],
        },
      },
    });
    expect(selectIsParentAuthenticated(usePrototypeStore.getState())).toBe(false);
  });

  it('does not restore protected access when reset interrupts a pending verification', async () => {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({ identifier: 'parent@example.com' }),
    );
    const pending = usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE);
    expect(usePrototypeStore.getState().parentAccess.state).toBe('verifying');

    usePrototypeStore.getState().resetPrototype();

    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().parentAccess.state).toBe('signed_out');
    expect(selectIsParentAuthenticated(usePrototypeStore.getState())).toBe(false);
  });
});
