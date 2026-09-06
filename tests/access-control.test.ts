import { beforeEach, describe, expect, it } from 'vitest';

import {
  ACCESS_SESSION_TTL_MS,
  CHILD_CAPABILITIES,
  PAIRING_TTL_MS,
  PARENT_CAPABILITIES,
  REAUTHENTICATION_TTL_MS,
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type AccessSession,
  type ChildAccessSession,
  type ParentAccessSession,
} from '../src/models/access';
import { DeterministicSyntheticAccessService } from '../src/features/access';

const BASE_TIME = '2026-09-02T10:00:00.000Z';

function after(milliseconds: number): string {
  return new Date(Date.parse(BASE_TIME) + milliseconds).toISOString();
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

describe('synthetic Parent and Child access', () => {
  let service: DeterministicSyntheticAccessService;
  let parentSession: ParentAccessSession;

  beforeEach(() => {
    service = new DeterministicSyntheticAccessService();
    parentSession = expectOk(
      service.signInParent({
        sessionId: 'parent_session_1',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'parent_device_1',
        now: BASE_TIME,
      }),
    );
  });

  function pairSalem(input?: {
    readonly requestId?: string;
    readonly deviceId?: string;
    readonly now?: string;
  }): ChildAccessSession {
    const requestId = input?.requestId ?? 'pairing_salem_1';
    const deviceId = input?.deviceId ?? 'child_device_salem';
    const now = input?.now ?? BASE_TIME;
    const requested = expectOk(
      service.requestPairing({
        requestId,
        pairingCode: `synthetic-code-${requestId}`,
        childId: 'child_salem',
        requestingDeviceId: deviceId,
        now,
      }),
    );
    expect(requested.status).toBe('pending');

    const approved = expectOk(
      service.approvePairing({
        requestId,
        childId: 'child_salem',
        requestingDeviceId: deviceId,
        parentSession,
        now,
      }),
    );
    expect(approved.status).toBe('approved');

    return expectOk(
      service.consumePairing({
        requestId,
        pairingCode: requested.pairingCode,
        childId: 'child_salem',
        deviceId,
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        sessionId: `child_session_${requestId}`,
        now,
      }),
    );
  }

  it('creates separate least-privilege session and projection shapes', () => {
    const childSession = pairSalem();
    const parentView = expectOk(service.projectSession({ session: parentSession, now: BASE_TIME }));
    const childView = expectOk(service.projectSession({ session: childSession, now: BASE_TIME }));

    expect(parentSession).toMatchObject({
      sessionKind: 'parent',
      principal: { role: 'parent', origin: 'synthetic' },
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(childSession).toMatchObject({
      sessionKind: 'child',
      principal: {
        role: 'child',
        childId: 'child_salem',
        avatarId: 'avatar_salem_ghaf',
        origin: 'synthetic',
      },
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(childSession.principal).not.toHaveProperty('email');
    expect(childSession.principal).not.toHaveProperty('phone');
    expect(parentView).toMatchObject({ viewKind: 'parent', parentId: 'parent_al_noor' });
    expect(parentView).toHaveProperty('reportAccess', 'parent_only');
    expect(childView).toMatchObject({ viewKind: 'child', childId: 'child_salem' });
    expect(childView).not.toHaveProperty('parentId');
    expect(childView).not.toHaveProperty('reportAccess');
    expect(childView).not.toHaveProperty('permissionManagement');
  });

  it('uses only reviewed synthetic credential fixture identifiers', () => {
    expect(SYNTHETIC_PARENT_ACCESS_FIXTURE).toEqual({
      fixtureId: 'parent_access_al_noor_v1',
      parentId: 'parent_al_noor',
      householdId: 'household_al_noor',
      verificationKind: 'deterministic_parent_fixture',
      origin: 'synthetic',
    });
    expect(SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem).toMatchObject({
      childId: 'child_salem',
      verificationKind: 'avatar_pin_fixture',
      origin: 'synthetic',
    });
    expect(SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_alya).toMatchObject({
      childId: 'child_alya',
      verificationKind: 'avatar_picture_sequence_fixture',
      origin: 'synthetic',
    });
    expect(SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem).not.toHaveProperty('pin');
    expect(SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_alya).not.toHaveProperty('pictureSequence');
    expect(Object.isFrozen(PARENT_CAPABILITIES)).toBe(true);
    expect(Object.isFrozen(CHILD_CAPABILITIES)).toBe(true);
    expect(Object.isFrozen(SYNTHETIC_PARENT_ACCESS_FIXTURE)).toBe(true);
    expect(Object.isFrozen(SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem)).toBe(true);
  });

  it('does not allow runtime mutation of the Child capability allowlist', () => {
    expect(() =>
      (CHILD_CAPABILITIES as unknown as string[]).push('enter_parent_experience'),
    ).toThrow();
    const childSession = pairSalem({ requestId: 'pairing_frozen_capabilities' });
    expect(childSession.capabilities).not.toContain('enter_parent_experience');
  });

  it('expires sessions from explicit deterministic time input', () => {
    expect(
      service.projectSession({ session: parentSession, now: after(ACCESS_SESSION_TTL_MS) }),
    ).toMatchObject({ ok: false });
  });

  it('requires Parent approval and rejects mismatched pairing fields', () => {
    const request = expectOk(
      service.requestPairing({
        requestId: 'pairing_mismatch',
        pairingCode: 'synthetic-code-mismatch',
        childId: 'child_salem',
        requestingDeviceId: 'child_device_expected',
        now: BASE_TIME,
      }),
    );

    expect(
      service.consumePairing({
        requestId: request.id,
        pairingCode: request.pairingCode,
        childId: 'child_salem',
        deviceId: 'child_device_expected',
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        sessionId: 'child_session_unapproved',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(
      service.approvePairing({
        requestId: request.id,
        childId: 'child_alya',
        requestingDeviceId: 'child_device_expected',
        parentSession,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(
      service.approvePairing({
        requestId: request.id,
        childId: 'child_salem',
        requestingDeviceId: 'wrong_device',
        parentSession,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
  });

  it('rejects Child approval of another device pairing', () => {
    const childSession = pairSalem({
      requestId: 'pairing_child_actor',
      deviceId: 'child_actor_device',
    });
    const request = expectOk(
      service.requestPairing({
        requestId: 'pairing_needs_parent',
        pairingCode: 'synthetic-code-needs-parent',
        childId: 'child_alya',
        requestingDeviceId: 'alya_device',
        now: BASE_TIME,
      }),
    );

    expect(
      service.approvePairing({
        requestId: request.id,
        childId: request.childId,
        requestingDeviceId: request.requestingDeviceId,
        parentSession: childSession,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
  });

  it('rejects expired pairing approval and consumption', () => {
    const first = expectOk(
      service.requestPairing({
        requestId: 'pairing_expired_approval',
        pairingCode: 'synthetic-code-expired-approval',
        childId: 'child_salem',
        requestingDeviceId: 'device_expired_approval',
        now: BASE_TIME,
      }),
    );
    expect(
      service.approvePairing({
        requestId: first.id,
        childId: first.childId,
        requestingDeviceId: first.requestingDeviceId,
        parentSession,
        now: after(PAIRING_TTL_MS),
      }),
    ).toMatchObject({ ok: false });

    const second = expectOk(
      service.requestPairing({
        requestId: 'pairing_expired_consumption',
        pairingCode: 'synthetic-code-expired-consumption',
        childId: 'child_salem',
        requestingDeviceId: 'device_expired_consumption',
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.approvePairing({
        requestId: second.id,
        childId: second.childId,
        requestingDeviceId: second.requestingDeviceId,
        parentSession,
        now: BASE_TIME,
      }),
    );
    expect(
      service.consumePairing({
        requestId: second.id,
        pairingCode: second.pairingCode,
        childId: second.childId,
        deviceId: second.requestingDeviceId,
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        sessionId: 'child_session_expired',
        now: after(PAIRING_TTL_MS),
      }),
    ).toMatchObject({ ok: false });
  });

  it('consumes a pairing once and rejects replay or wrong code', () => {
    const request = expectOk(
      service.requestPairing({
        requestId: 'pairing_one_use',
        pairingCode: 'synthetic-code-one-use',
        childId: 'child_salem',
        requestingDeviceId: 'device_one_use',
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.approvePairing({
        requestId: request.id,
        childId: request.childId,
        requestingDeviceId: request.requestingDeviceId,
        parentSession,
        now: BASE_TIME,
      }),
    );
    const consumption = {
      requestId: request.id,
      childId: request.childId,
      deviceId: request.requestingDeviceId,
      childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
      sessionId: 'child_session_one_use',
      now: BASE_TIME,
    } as const;

    expect(service.consumePairing({ ...consumption, pairingCode: 'wrong-code' })).toMatchObject({
      ok: false,
    });
    expectOk(service.consumePairing({ ...consumption, pairingCode: request.pairingCode }));
    expect(
      service.consumePairing({ ...consumption, pairingCode: request.pairingCode }),
    ).toMatchObject({ ok: false });
  });

  it('allows a Parent to revoke an approved pairing before it is consumed', () => {
    const request = expectOk(
      service.requestPairing({
        requestId: 'pairing_revoke_before_consume',
        pairingCode: 'synthetic-code-revoke-before-consume',
        childId: 'child_salem',
        requestingDeviceId: 'device_revoke_before_consume',
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.approvePairing({
        requestId: request.id,
        childId: request.childId,
        requestingDeviceId: request.requestingDeviceId,
        parentSession,
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.revokePairing({
        requestId: request.id,
        childId: request.childId,
        requestingDeviceId: request.requestingDeviceId,
        parentSession,
        now: BASE_TIME,
      }),
    );

    expect(
      service.consumePairing({
        requestId: request.id,
        pairingCode: request.pairingCode,
        childId: request.childId,
        deviceId: request.requestingDeviceId,
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        sessionId: 'child_session_revoked_before_consume',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('revokes one Child/device binding and denies later sign-in', () => {
    const childSession = pairSalem({ requestId: 'pairing_revoke', deviceId: 'device_revoke' });
    const revoked = expectOk(
      service.revokeDevice({
        parentSession,
        childId: 'child_salem',
        deviceId: childSession.deviceId,
        now: BASE_TIME,
      }),
    );
    expect(revoked).toMatchObject({ status: 'revoked', childId: 'child_salem' });

    expect(
      service.signInChild({
        sessionId: 'child_session_after_revoke',
        childId: 'child_salem',
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        deviceId: childSession.deviceId,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(service.projectSession({ session: childSession, now: BASE_TIME })).toMatchObject({
      ok: false,
    });
  });

  it('enforces every Parent and Child capability by stored session kind', () => {
    const childSession = pairSalem({ requestId: 'pairing_capabilities' });
    for (const capability of PARENT_CAPABILITIES) {
      expect(
        service.authorizeCapability({ session: childSession, capability, now: BASE_TIME }),
      ).toMatchObject({ ok: false });
      expect(
        service.authorizeCapability({ session: parentSession, capability, now: BASE_TIME }),
      ).toMatchObject({ ok: true, data: { capability, authorized: true } });
    }
    for (const capability of CHILD_CAPABILITIES) {
      expect(
        service.authorizeCapability({ session: childSession, capability, now: BASE_TIME }),
      ).toMatchObject({ ok: true, data: { capability, authorized: true } });
      expect(
        service.authorizeCapability({ session: parentSession, capability, now: BASE_TIME }),
      ).toMatchObject({ ok: false });
    }
  });

  it('binds reauthentication to the Parent actor, device, purpose, expiry, and one use', () => {
    const proof = expectOk(
      service.issueReauthentication({
        proofId: 'proof_ai_1',
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_ai_permission',
        now: BASE_TIME,
      }),
    );
    const otherParentSession = expectOk(
      service.signInParent({
        sessionId: 'parent_session_other_device',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        deviceId: 'parent_device_2',
        now: BASE_TIME,
      }),
    );
    const childSession = pairSalem({
      requestId: 'pairing_wrong_reauth_actor',
      deviceId: 'wrong_reauth_actor_device',
    });

    expect(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession,
        purpose: 'change_media_permission',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession: childSession,
        purpose: proof.purpose,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession: otherParentSession,
        purpose: proof.purpose,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expectOk(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession,
        purpose: proof.purpose,
        now: BASE_TIME,
      }),
    );
    expect(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession,
        purpose: proof.purpose,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });

    const expiring = expectOk(
      service.issueReauthentication({
        proofId: 'proof_expired',
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_voice_permission',
        now: BASE_TIME,
      }),
    );
    expect(
      service.authorizeSensitiveAction({
        proofId: expiring.id,
        parentSession,
        purpose: expiring.purpose,
        now: after(REAUTHENTICATION_TTL_MS),
      }),
    ).toMatchObject({ ok: false });
  });

  it.each([
    'create_monetary_family_reward',
    'change_monetary_family_reward',
    'change_league_membership',
    'change_voice_permission',
    'change_media_permission',
    'change_ai_permission',
  ] as const)('authorizes only one use of the scoped %s purpose', (purpose) => {
    const proof = expectOk(
      service.issueReauthentication({
        proofId: `proof_${purpose}`,
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose,
        now: BASE_TIME,
      }),
    );
    expectOk(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession,
        purpose,
        now: BASE_TIME,
      }),
    );
    expect(
      service.authorizeSensitiveAction({
        proofId: proof.id,
        parentSession,
        purpose,
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
  });

  it('stores language and independent voice, media, and AI grants per Child', () => {
    const initial = expectOk(
      service.getChildPermissions({
        session: parentSession,
        childId: 'child_salem',
        now: BASE_TIME,
      }),
    );
    expect(initial).toMatchObject({
      childId: 'child_salem',
      languagePreference: 'ar',
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: false,
      version: 1,
    });

    const language = expectOk(
      service.updateChildPermissions({
        parentSession,
        childId: 'child_salem',
        expectedVersion: initial.version,
        change: { kind: 'language', value: 'bilingual' },
        now: BASE_TIME,
      }),
    );
    expect(language).toMatchObject({
      languagePreference: 'bilingual',
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: false,
      version: 2,
    });

    expect(
      service.updateChildPermissions({
        parentSession,
        childId: 'child_salem',
        expectedVersion: language.version,
        change: { kind: 'ai', granted: true, proofId: 'missing-proof' },
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });

    const proof = expectOk(
      service.issueReauthentication({
        proofId: 'proof_permission_ai',
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_ai_permission',
        now: BASE_TIME,
      }),
    );
    const ai = expectOk(
      service.updateChildPermissions({
        parentSession,
        childId: 'child_salem',
        expectedVersion: language.version,
        change: { kind: 'ai', granted: true, proofId: proof.id },
        now: BASE_TIME,
      }),
    );
    expect(ai).toMatchObject({
      languagePreference: 'bilingual',
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: true,
      version: 3,
      updatedByParentId: 'parent_al_noor',
    });

    const voiceProof = expectOk(
      service.issueReauthentication({
        proofId: 'proof_permission_voice',
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_voice_permission',
        now: BASE_TIME,
      }),
    );
    const voice = expectOk(
      service.updateChildPermissions({
        parentSession,
        childId: 'child_salem',
        expectedVersion: ai.version,
        change: { kind: 'voice', granted: true, proofId: voiceProof.id },
        now: BASE_TIME,
      }),
    );
    const mediaProof = expectOk(
      service.issueReauthentication({
        proofId: 'proof_permission_media',
        parentSession,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_media_permission',
        now: BASE_TIME,
      }),
    );
    const media = expectOk(
      service.updateChildPermissions({
        parentSession,
        childId: 'child_salem',
        expectedVersion: voice.version,
        change: { kind: 'media', granted: true, proofId: mediaProof.id },
        now: BASE_TIME,
      }),
    );
    expect(media).toMatchObject({
      languagePreference: 'bilingual',
      voiceGranted: true,
      mediaGranted: true,
      aiGranted: true,
      version: 5,
    });
    expect(
      expectOk(
        service.getChildPermissions({
          session: parentSession,
          childId: 'child_alya',
          now: BASE_TIME,
        }),
      ),
    ).toMatchObject({
      childId: 'child_alya',
      languagePreference: 'ar',
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: false,
      version: 1,
    });
  });

  it('rejects Child-owned permission changes and cross-Child reads', () => {
    const childSession = pairSalem({ requestId: 'pairing_permission_denial' });
    const current = expectOk(
      service.getChildPermissions({
        session: childSession,
        childId: 'child_salem',
        now: BASE_TIME,
      }),
    );

    expect(
      service.updateChildPermissions({
        parentSession: childSession as AccessSession,
        childId: 'child_salem',
        expectedVersion: current.version,
        change: { kind: 'language', value: 'en' },
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
    expect(
      service.getChildPermissions({
        session: childSession,
        childId: 'child_alya',
        now: BASE_TIME,
      }),
    ).toMatchObject({ ok: false });
  });
});
