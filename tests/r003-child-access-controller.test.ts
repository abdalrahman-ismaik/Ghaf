import { beforeEach, describe, expect, it } from 'vitest';

import {
  createChildAccessController,
  createDeterministicSyntheticAccessService,
  createParentOnboardingController,
  PARENT_VERIFICATION_CODE,
  type ChildAccessController,
  type ParentOnboardingController,
} from '../src/features/access';
import { SYNTHETIC_CHILD_CREDENTIAL_FIXTURES } from '../src/models/access';

const TIME = '2026-09-05T10:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

describe('R003 Child access presentation controller', () => {
  let access: ReturnType<typeof createDeterministicSyntheticAccessService>;
  let parent: ParentOnboardingController;
  let child: ChildAccessController;

  beforeEach(async () => {
    access = createDeterministicSyntheticAccessService();
    parent = createParentOnboardingController(access, {
      sessionId: 'r003-parent-session',
      deviceId: 'r003-parent-device',
    });
    child = createChildAccessController(access, parent);
    expectOk(parent.requestVerification({ identifier: 'parent@example.com' }));
    expectOk(await parent.verifyCode(PARENT_VERIFICATION_CODE));
    expectOk(parent.complete(TIME));
  });

  it('requires the selected profile credential before pairing', () => {
    expectOk(child.selectProfile('child_salem'));
    expect(child.verifyCredential('0000')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(child.requestPairing(TIME)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    expectOk(child.verifyCredential('2468'));
    expectOk(child.requestPairing(TIME));
    expect(child.getView()).toMatchObject({
      status: 'pairing_pending',
      selectedChildId: 'child_salem',
      productionAuthentication: false,
    });
  });

  it('keeps Parent approval and pairing consumption as explicit transitions', () => {
    expectOk(child.selectProfile('child_salem'));
    expectOk(child.verifyCredential('2468'));
    expectOk(child.requestPairing(TIME));
    expectOk(child.approvePairing(TIME));
    expect(child.getView().status).toBe('pairing_approved');
    expectOk(child.completePairing(TIME));

    expect(child.getView()).toMatchObject({
      status: 'authenticated_child',
      selectedChildId: 'child_salem',
      canEnterChildExperience: true,
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expectOk(child.authorizeChildExperience(TIME));
    expect(child.selectProfile('child_alya')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expectOk(child.authorizeChildExperience(TIME));
  });

  it('supports Alya’s accessible picture sequence with equal access', () => {
    expectOk(child.selectProfile('child_alya'));
    expectOk(child.verifyCredential('leaf-water-tree'));
    expectOk(child.requestPairing(TIME));
    expectOk(child.approvePairing(TIME));
    expectOk(child.completePairing(TIME));

    expect(child.getView()).toMatchObject({
      status: 'authenticated_child',
      selectedChildId: 'child_alya',
      credentialKind: 'picture_sequence',
    });
  });

  it('surfaces an expired request and lets the same Child restart pairing safely', () => {
    expectOk(child.selectProfile('child_salem'));
    expectOk(child.verifyCredential('2468'));
    const first = expectOk(child.requestPairing(TIME));

    expect(child.approvePairing(first.pairingRequest!.expiresAt)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(child.getView()).toMatchObject({
      status: 'pairing_expired',
      canEnterChildExperience: false,
      pairingRequest: { status: 'expired' },
    });

    const restarted = expectOk(child.requestPairing('2026-09-05T10:06:00.000Z'));
    expect(restarted).toMatchObject({
      status: 'pairing_pending',
      selectedChildId: 'child_salem',
      pairingRequest: { status: 'pending' },
    });
    expect(restarted.pairingRequest?.id).not.toBe(first.pairingRequest?.id);
  });

  it('terminates Child authority on sign-out without granting Parent capability', () => {
    expectOk(child.selectProfile('child_salem'));
    expectOk(child.verifyCredential('2468'));
    expectOk(child.requestPairing(TIME));
    expectOk(child.approvePairing(TIME));
    expectOk(child.completePairing(TIME));
    expectOk(child.signOut(TIME));

    expect(child.getView()).toMatchObject({
      status: 'signed_out',
      selectedChildId: null,
      canEnterChildExperience: false,
    });
    expect(child.authorizeChildExperience(TIME)).toMatchObject({ ok: false });
  });

  it('lets a Parent-revoked device complete a fresh pairing before Child re-entry', () => {
    expectOk(child.selectProfile('child_salem'));
    expectOk(child.verifyCredential('2468'));
    const initialRequest = expectOk(child.requestPairing(TIME)).pairingRequest;
    const staleRequest = expectOk(
      access.requestPairing({
        requestId: 'r003-stale-pairing',
        pairingCode: 'synthetic-code-r003-stale-pairing',
        childId: 'child_salem',
        requestingDeviceId: initialRequest!.requestingDeviceId,
        now: TIME,
      }),
    );
    expectOk(child.approvePairing(TIME));
    expectOk(child.completePairing(TIME));

    expect(
      access.requestPairing({
        requestId: 'r003-active-device-pairing',
        pairingCode: 'synthetic-code-r003-active-device-pairing',
        childId: 'child_salem',
        requestingDeviceId: initialRequest!.requestingDeviceId,
        now: '2026-09-05T10:00:30.000Z',
      }),
    ).toMatchObject({ ok: false });

    expectOk(child.revokeDevice('child_salem', '2026-09-05T10:01:00.000Z'));
    expect(child.getView()).toMatchObject({
      status: 'signed_out',
      canEnterChildExperience: false,
      pairedDevices: [{ status: 'revoked' }],
    });

    expectOk(
      parent.approveChildPairing({
        requestId: staleRequest.id,
        childId: staleRequest.childId,
        requestingDeviceId: staleRequest.requestingDeviceId,
        now: '2026-09-05T10:01:00.000Z',
      }),
    );
    expect(
      access.consumePairing({
        requestId: staleRequest.id,
        pairingCode: staleRequest.pairingCode,
        childId: staleRequest.childId,
        deviceId: staleRequest.requestingDeviceId,
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        sessionId: 'r003-stale-child-session',
        now: '2026-09-05T10:01:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    expectOk(child.selectProfile('child_salem'));
    expectOk(child.verifyCredential('2468', '2026-09-05T10:02:00.000Z'));
    const replacementRequest = expectOk(
      child.requestPairing('2026-09-05T10:02:00.000Z'),
    ).pairingRequest;
    expect(replacementRequest?.id).not.toBe(initialRequest?.id);
    expectOk(child.approvePairing('2026-09-05T10:02:00.000Z'));
    expectOk(child.completePairing('2026-09-05T10:02:00.000Z'));

    expect(child.getView()).toMatchObject({
      status: 'authenticated_child',
      selectedChildId: 'child_salem',
      canEnterChildExperience: true,
      pairedDevices: [
        {
          pairingRequestId: replacementRequest?.id,
          status: 'paired',
          revokedAt: null,
          revokedByParentId: null,
        },
      ],
    });
    expectOk(child.authorizeChildExperience('2026-09-05T10:02:00.000Z'));
  });
});
