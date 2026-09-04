import { beforeEach, describe, expect, it } from 'vitest';

import { DeterministicSyntheticAccessService } from '../src/features/access';
import {
  createInitialParentOnboardingDraft,
  createParentOnboardingController,
  normalizeParentIdentifier,
  PARENT_VERIFICATION_CODE,
  updateParentOnboardingDraft,
  type ParentOnboardingAccessAuthority,
} from '../src/features/access/parentOnboarding';
import {
  ACCESS_SESSION_TTL_MS,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type ParentAccessSession,
} from '../src/models/access';
import { createFeature003ServiceRegistry } from '../src/services';

const BASE_TIME = '2026-09-04T10:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function createTrackedAuthority() {
  const service = new DeterministicSyntheticAccessService();
  let parentSignInCount = 0;
  let capturedParentSession: ParentAccessSession | null = null;
  const authority: ParentOnboardingAccessAuthority = {
    signInParent(input) {
      parentSignInCount += 1;
      const result = service.signInParent(input);
      if (result.ok) capturedParentSession = result.data;
      return result;
    },
    authorizeCapability: (input) => service.authorizeCapability(input),
    terminateParentSession: (input) => service.terminateParentSession(input),
  };

  return {
    authority,
    service,
    parentSignInCount: () => parentSignInCount,
    capturedParentSession: () => capturedParentSession,
  };
}

async function verifyController(
  controller: ReturnType<typeof createParentOnboardingController>,
): Promise<void> {
  expectOk(controller.requestVerification({ identifier: ' Parent@Example.COM ' }));
  expectOk(await controller.verifyCode(PARENT_VERIFICATION_CODE));
}

describe('R001 Parent onboarding input policy', () => {
  it.each([
    {
      identifier: ' Parent@Example.COM ',
      expected: {
        normalizedIdentifier: 'parent@example.com',
        identifierKind: 'email',
        maskedDestination: 'p***@example.com',
      },
    },
    {
      identifier: '+971 50 123 4242',
      expected: {
        normalizedIdentifier: '+971501234242',
        identifierKind: 'phone',
        maskedDestination: '••••••••••42',
      },
    },
    {
      identifier: '00971 (50) 123-4242',
      expected: {
        normalizedIdentifier: '+971501234242',
        identifierKind: 'phone',
        maskedDestination: '••••••••••42',
      },
    },
  ])('normalizes and masks $expected.identifierKind identifiers', ({ identifier, expected }) => {
    expect(expectOk(normalizeParentIdentifier(identifier))).toEqual(expected);
  });

  it.each([
    undefined,
    '',
    'parent',
    'parent@',
    '1234',
    '+971 phone',
    'parent@example.com\u0000',
    `${'a'.repeat(250)}@example.com`,
  ])('rejects malformed, controlled, or oversized identifier %j', (identifier) => {
    expect(normalizeParentIdentifier(identifier)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('accepts only allowlisted draft fields and accessibility values', () => {
    const initial = createInitialParentOnboardingDraft();
    const updated = expectOk(
      updateParentOnboardingDraft(initial, {
        familyName: 'Palm Family',
        appLanguage: 'en',
        child: {
          nickname: 'Salem',
          avatarId: 'water_drop',
          ageBand: '12_14',
          preferredLanguage: 'both',
          accessibilityDefaults: ['larger_text', 'reduced_motion'],
        },
      }),
    );

    expect(updated).toEqual({
      familyName: 'Palm Family',
      appLanguage: 'en',
      child: {
        nickname: 'Salem',
        avatarId: 'water_drop',
        ageBand: '12_14',
        preferredLanguage: 'both',
        accessibilityDefaults: ['larger_text', 'reduced_motion'],
      },
    });
    expect(
      updateParentOnboardingDraft(initial, {
        child: { accessibilityDefaults: ['larger_text', 'larger_text'] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      updateParentOnboardingDraft(initial, {
        child: { accessibilityDefaults: ['unsupported'] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      updateParentOnboardingDraft(initial, {
        child: { avatarId: 'unsupported' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(updateParentOnboardingDraft(initial, { appLanguage: 'fr' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(updateParentOnboardingDraft(initial, { child: { ageBand: '15_17' } })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(
      updateParentOnboardingDraft(initial, { child: { preferredLanguage: 'bilingual' } }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(updateParentOnboardingDraft(initial, { child: { unsupported: true } })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(
      updateParentOnboardingDraft(initial, {
        familyName: 'Unsafe\u0007name',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      updateParentOnboardingDraft(initial, {
        child: { nickname: 'x'.repeat(41) },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      updateParentOnboardingDraft(initial, {
        unsupported: true,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });
});

describe('R001 Parent onboarding controller', () => {
  let tracked: ReturnType<typeof createTrackedAuthority>;
  let controller: ReturnType<typeof createParentOnboardingController>;

  beforeEach(() => {
    tracked = createTrackedAuthority();
    controller = createParentOnboardingController(tracked.authority);
  });

  it('uses the honest local verification fixture and creates no access session at verification', async () => {
    const requested = expectOk(
      controller.requestVerification({
        identifier: '+971 50 123 4242',
        networkAvailable: false,
      }),
    );
    expect(requested).toMatchObject({
      status: 'code_sent',
      identifierKind: 'phone',
      maskedDestination: '••••••••••42',
      delivery: 'local_fixture',
      offlineFallbackUsed: true,
      productionAuthentication: false,
      canEnterParentExperience: false,
    });
    expect(requested).not.toHaveProperty('normalizedIdentifier');

    const wrongAttempt = controller.verifyCode('111111');
    expect(controller.getView().status).toBe('verifying');
    await expect(wrongAttempt).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(controller.getView().status).toBe('code_sent');

    const correctAttempt = controller.verifyCode(PARENT_VERIFICATION_CODE);
    expect(controller.getView().status).toBe('verifying');
    expect(expectOk(await correctAttempt)).toMatchObject({
      status: 'verified',
      canEnterParentExperience: false,
    });
    expect(tracked.parentSignInCount()).toBe(0);
    expect(controller.authorizeParentExperience(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('prepares the local code again without retaining or exposing the raw identifier', async () => {
    const requested = expectOk(
      controller.requestVerification({ identifier: 'Parent@Example.COM' }),
    );
    expectOk(await controller.verifyCode(PARENT_VERIFICATION_CODE));

    const resent = expectOk(controller.resendVerification({ networkAvailable: false }));

    expect(resent).toMatchObject({
      status: 'code_sent',
      maskedDestination: requested.maskedDestination,
      delivery: 'local_fixture',
      offlineFallbackUsed: true,
      canEnterParentExperience: false,
    });
    expect(resent).not.toHaveProperty('normalizedIdentifier');
    expect(JSON.stringify(resent)).not.toContain('parent@example.com');
    expect(controller.resendVerification({})).toMatchObject({ ok: true });

    expectOk(controller.cancelVerification());
    expect(controller.resendVerification({})).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('requires verified access and a complete safe draft before creating Parent authority', async () => {
    expect(controller.complete(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    await verifyController(controller);
    expectOk(controller.updateDraft({ familyName: '  ' }));

    expect(controller.complete(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(controller.getView()).toMatchObject({
      status: 'verified',
      canEnterParentExperience: false,
    });
    expect(tracked.parentSignInCount()).toBe(0);
  });

  it('creates real Parent capability authority while exposing only a safe receipt and handoff', async () => {
    await verifyController(controller);
    expectOk(
      controller.updateDraft({
        familyName: 'Palm Family',
        appLanguage: 'en',
        child: {
          nickname: 'Salem',
          preferredLanguage: 'both',
          accessibilityDefaults: ['larger_text', 'simpler_instructions'],
        },
      }),
    );

    const receipt = expectOk(controller.complete(BASE_TIME));
    expect(receipt).toMatchObject({
      receiptId: 'parent_onboarding_al_noor_r001_v1',
      destination: '/parent',
      familyName: 'Palm Family',
      appLanguage: 'en',
      child: {
        nickname: 'Salem',
        accessLanguagePreference: 'bilingual',
        accessibilityDefaults: ['larger_text', 'simpler_instructions'],
      },
      origin: 'synthetic',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(receipt).not.toHaveProperty('sessionId');
    expect(receipt).not.toHaveProperty('capabilities');
    expect(controller.getView()).toMatchObject({
      status: 'authenticated_parent',
      canEnterParentExperience: true,
      completionReceipt: receipt,
    });
    expect(controller.getView()).not.toHaveProperty('session');
    expect(controller.getView()).not.toHaveProperty('deviceId');

    expect(expectOk(controller.authorizeParentExperience(BASE_TIME))).toEqual({
      authorized: true,
      capability: 'enter_parent_experience',
      destination: '/parent',
      receiptId: receipt.receiptId,
      origin: 'synthetic',
    });
    const session = tracked.capturedParentSession();
    expect(session).not.toBeNull();
    expect(
      tracked.service.authorizeCapability({
        session: session!,
        capability: 'enter_parent_experience',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: true, data: { authorized: true } });

    const permissions = expectOk(
      tracked.service.getChildPermissions({
        session: session!,
        childId: 'child_salem',
        now: BASE_TIME,
      }),
    );
    expect(permissions).toMatchObject({
      languagePreference: 'ar',
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: false,
      version: 1,
    });
  });

  it('integrates with the existing shared registry access facade', async () => {
    const registryController = createParentOnboardingController(
      createFeature003ServiceRegistry().access,
    );
    await verifyController(registryController);

    expect(registryController.complete(BASE_TIME)).toMatchObject({ ok: true });
    expect(registryController.authorizeParentExperience(BASE_TIME)).toMatchObject({
      ok: true,
      data: { capability: 'enter_parent_experience', destination: '/parent' },
    });
    expect(registryController.reset(BASE_TIME)).toMatchObject({
      ok: true,
      data: { status: 'signed_out' },
    });
  });

  it('does not accept a forged or mutated presentation role as authority', async () => {
    const forgedView = controller.getView() as unknown as {
      status: string;
      canEnterParentExperience: boolean;
      draft: { familyName: string };
    };
    forgedView.status = 'authenticated_parent';
    forgedView.canEnterParentExperience = true;
    forgedView.draft.familyName = 'Forged';

    expect(controller.getView()).toMatchObject({
      status: 'signed_out',
      canEnterParentExperience: false,
      draft: { familyName: 'عائلة النخلة' },
    });
    expect(controller.authorizeParentExperience(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    await verifyController(controller);
    expect(controller.authorizeParentExperience(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('returns the same completion receipt without creating a second session', async () => {
    await verifyController(controller);

    const first = expectOk(controller.complete(BASE_TIME));
    const second = expectOk(controller.complete('2026-09-04T10:01:00.000Z'));

    expect(second).toEqual(first);
    expect(tracked.parentSignInCount()).toBe(1);
  });

  it('removes a partially created session when capability authorization fails', async () => {
    const service = new DeterministicSyntheticAccessService();
    const blockedAuthority: ParentOnboardingAccessAuthority = {
      signInParent: (input) => service.signInParent(input),
      authorizeCapability: () => ({
        ok: false,
        error: {
          code: 'PRIVACY_REJECTED',
          message: 'Blocked for test',
          retryable: false,
          fallbackAvailable: false,
        },
      }),
      terminateParentSession: (input) => service.terminateParentSession(input),
    };
    const blocked = createParentOnboardingController(blockedAuthority, {
      sessionId: 'cleanup-parent-session',
      deviceId: 'cleanup-parent-device',
    });
    await verifyController(blocked);

    expect(blocked.complete(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(
      service.signInParent({
        sessionId: 'cleanup-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'cleanup-parent-device',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: true });
  });

  it('surfaces failed cleanup and retains the partial session for deterministic reset recovery', async () => {
    const service = new DeterministicSyntheticAccessService();
    let cleanupBlocked = true;
    const blockedAuthority: ParentOnboardingAccessAuthority = {
      signInParent: (input) => service.signInParent(input),
      authorizeCapability: () => ({
        ok: false,
        error: {
          code: 'PRIVACY_REJECTED',
          message: 'Blocked for test',
          retryable: false,
          fallbackAvailable: false,
        },
      }),
      terminateParentSession: (input) =>
        cleanupBlocked
          ? {
              ok: false,
              error: {
                code: 'INVALID_TRANSITION',
                message: 'Cleanup blocked for test',
                retryable: false,
                fallbackAvailable: false,
              },
            }
          : service.terminateParentSession(input),
    };
    const blocked = createParentOnboardingController(blockedAuthority, {
      sessionId: 'failed-cleanup-parent-session',
      deviceId: 'failed-cleanup-parent-device',
    });
    await verifyController(blocked);

    expect(blocked.complete(BASE_TIME)).toEqual({
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'The synthetic Parent session could not be safely established',
        retryable: false,
        fallbackAvailable: false,
      },
    });
    expect(blocked.getView()).toMatchObject({
      status: 'verified',
      canEnterParentExperience: false,
      completionReceipt: null,
    });
    expect(blocked.complete(BASE_TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    cleanupBlocked = false;
    expect(blocked.reset('2026-09-04T10:01:00.000Z')).toMatchObject({
      ok: true,
      data: { status: 'signed_out' },
    });
    expect(
      service.signInParent({
        sessionId: 'failed-cleanup-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'failed-cleanup-parent-device',
        now: '2026-09-04T10:02:00.000Z',
      }),
    ).toMatchObject({ ok: true });
  });

  it('invalidates an interrupted verification when cancelled or reset', async () => {
    expectOk(controller.requestVerification({ identifier: 'parent@example.com' }));
    const cancelledAttempt = controller.verifyCode(PARENT_VERIFICATION_CODE);
    expect(controller.getView().status).toBe('verifying');
    expectOk(controller.cancelVerification());

    await expect(cancelledAttempt).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(controller.getView().status).toBe('signed_out');
    expect(tracked.parentSignInCount()).toBe(0);

    expectOk(controller.requestVerification({ identifier: 'parent@example.com' }));
    const resetAttempt = controller.verifyCode(PARENT_VERIFICATION_CODE);
    expectOk(controller.reset(BASE_TIME));

    await expect(resetAttempt).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(controller.getView()).toMatchObject({
      status: 'signed_out',
      draft: createInitialParentOnboardingDraft(),
    });
  });

  it('terminates its Parent session and can deterministically complete again', async () => {
    await verifyController(controller);
    expectOk(controller.complete(BASE_TIME));
    const endedSession = tracked.capturedParentSession();
    expect(endedSession).not.toBeNull();

    expectOk(controller.reset('2026-09-04T10:02:00.000Z'));
    expect(
      tracked.service.authorizeCapability({
        session: endedSession!,
        capability: 'enter_parent_experience',
        now: '2026-09-04T10:02:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    await verifyController(controller);
    expectOk(controller.complete('2026-09-04T10:03:00.000Z'));
    expect(tracked.parentSignInCount()).toBe(2);
    expect(controller.authorizeParentExperience('2026-09-04T10:03:00.000Z')).toMatchObject({
      ok: true,
    });
  });
});

describe('Parent access-session termination', () => {
  it('cleans up an expired identity-matching Parent session so its ID can be reused', () => {
    const service = new DeterministicSyntheticAccessService();
    const session = expectOk(
      service.signInParent({
        sessionId: 'expired-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'expired-parent-device',
        now: BASE_TIME,
      }),
    );
    const expiredAt = new Date(Date.parse(BASE_TIME) + ACCESS_SESSION_TTL_MS).toISOString();

    expect(service.projectSession({ session, now: expiredAt })).toMatchObject({ ok: false });
    expect(service.terminateParentSession({ session, now: expiredAt })).toMatchObject({
      ok: true,
      data: { sessionId: session.id, terminated: true },
    });
    expect(
      service.signInParent({
        sessionId: session.id,
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: session.deviceId,
        now: expiredAt,
      }),
    ).toMatchObject({ ok: true, data: { id: session.id } });
  });

  it('removes only a validated Parent session, rejects old authority, and permits ID reuse', () => {
    const service = new DeterministicSyntheticAccessService();
    const session = expectOk(
      service.signInParent({
        sessionId: 'reusable-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'reusable-parent-device',
        now: BASE_TIME,
      }),
    );
    const otherSession = expectOk(
      service.signInParent({
        sessionId: 'preserved-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'preserved-parent-device',
        now: BASE_TIME,
      }),
    );
    const wrongRole = {
      ...session,
      principal: { ...session.principal, role: 'child' },
    } as unknown as ParentAccessSession;
    expect(service.terminateParentSession({ session: wrongRole, now: BASE_TIME })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(
      service.terminateParentSession({
        session: { ...session, id: 'unknown-parent-session' },
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(
      service.authorizeCapability({
        session,
        capability: 'enter_parent_experience',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: true });

    expect(expectOk(service.terminateParentSession({ session, now: BASE_TIME }))).toEqual({
      sessionId: 'reusable-parent-session',
      terminated: true,
      origin: 'synthetic',
    });
    expect(
      service.authorizeCapability({
        session,
        capability: 'enter_parent_experience',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(
      service.authorizeCapability({
        session: otherSession,
        capability: 'enter_parent_experience',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: true });
    expect(service.terminateParentSession({ session, now: BASE_TIME })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    const replacementSession = expectOk(
      service.signInParent({
        sessionId: session.id,
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: session.deviceId,
        now: '2026-09-04T10:05:00.000Z',
      }),
    );
    expect(replacementSession).toMatchObject({ id: 'reusable-parent-session' });
    expect(
      service.authorizeCapability({
        session,
        capability: 'enter_parent_experience',
        now: '2026-09-04T10:05:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(
      service.authorizeCapability({
        session: replacementSession,
        capability: 'enter_parent_experience',
        now: '2026-09-04T10:05:00.000Z',
      }),
    ).toMatchObject({ ok: true });
  });

  it('purges only reauthentication proofs bound to the terminated Parent session', () => {
    const service = new DeterministicSyntheticAccessService();
    const session = expectOk(
      service.signInParent({
        sessionId: 'proof-owner-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'proof-owner-parent-device',
        now: BASE_TIME,
      }),
    );
    const otherSession = expectOk(
      service.signInParent({
        sessionId: 'proof-preserved-parent-session',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'proof-preserved-parent-device',
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.issueReauthentication({
        proofId: 'terminated-session-proof',
        parentSession: session,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_ai_permission',
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.issueReauthentication({
        proofId: 'preserved-session-proof',
        parentSession: otherSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_ai_permission',
        now: BASE_TIME,
      }),
    );

    expectOk(service.terminateParentSession({ session, now: BASE_TIME }));
    const replacementSession = expectOk(
      service.signInParent({
        sessionId: session.id,
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: session.deviceId,
        now: '2026-09-04T10:01:00.000Z',
      }),
    );

    expect(
      service.authorizeSensitiveAction({
        proofId: 'terminated-session-proof',
        parentSession: replacementSession,
        purpose: 'change_ai_permission',
        now: '2026-09-04T10:01:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    expect(
      service.authorizeSensitiveAction({
        proofId: 'preserved-session-proof',
        parentSession: otherSession,
        purpose: 'change_ai_permission',
        now: '2026-09-04T10:01:00.000Z',
      }),
    ).toMatchObject({ ok: true, data: { consumed: true } });
  });
});
