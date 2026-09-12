import { describe, expect, it, vi } from 'vitest';

import { DeterministicSyntheticAccessService } from '../src/features/access';
import { createChildAccessController } from '../src/features/access/childAccess';
import { createParentOnboardingController } from '../src/features/access/parentOnboarding/controller';
import { createInitialParentOnboardingDraft } from '../src/features/access/parentOnboarding/policy';
import { createChildVoiceController } from '../src/features/assistants/childVoiceController';
import { createLocalFamilyRecord, localFamilyRecordToReceipt } from '../src/features/local-family';
import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type AccessSession,
  type CapabilityAuthorizationInput,
  type DeviceAccessState,
  type ProjectAccessSessionInput,
  type ReauthenticationProof,
  type SyntheticChildSignIn,
  type SyntheticParentSignIn,
} from '../src/models/access';
import type { DomainResult, SyntheticChildId } from '../src/models/familyGrowth';
import type { ServiceResult } from '../src/services/interfaces';
import { createFeature003ServiceRegistry } from '../src/services/mock';

const NOW = '2026-09-04T10:00:00.000Z';

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

function failure(): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'PRIVACY_REJECTED',
      message: 'Prepared entry rejection',
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function expectOk<T>(result: DomainResult<T>): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected synthetic fixture success');
  return result.data;
}

function familyReceipt() {
  const draft = createInitialParentOnboardingDraft();
  return localFamilyRecordToReceipt(
    expectOk(
      createLocalFamilyRecord({
        familyConnections: draft.familyConnections,
        familyName: 'أسرة النور',
        appLanguage: 'ar',
        parentIdentifier: {
          identifierKind: 'email',
          normalizedIdentifier: 'parent@example.com',
          maskedDestination: 'p***@example.com',
        },
        children: draft.children.map(({ profileId, ...child }) => ({
          ...child,
          id: profileId,
          role: 'child',
          sex: child.sex!,
        })),
        pairedChildIds: ['child_salem', 'child_alya'],
        now: NOW,
      }),
    ),
  );
}

class FaultAccess extends DeterministicSyntheticAccessService {
  failSecondMarker = false;
  failAuthorization = false;
  failTermination = false;
  captured: AccessSession | null = null;

  override restorePairedDevice(
    input: Parameters<DeterministicSyntheticAccessService['restorePairedDevice']>[0],
  ) {
    return this.failSecondMarker && input.childId === 'child_alya'
      ? failure()
      : super.restorePairedDevice(input);
  }

  override signInParent(input: SyntheticParentSignIn) {
    const result = super.signInParent(input);
    if (result.ok) this.captured = result.data;
    return result;
  }

  override signInChild(input: SyntheticChildSignIn) {
    const result = super.signInChild(input);
    if (result.ok) this.captured = result.data;
    return result;
  }

  override authorizeCapability(input: CapabilityAuthorizationInput) {
    return this.failAuthorization ? failure() : super.authorizeCapability(input);
  }

  override terminateParentSession(input: ProjectAccessSessionInput) {
    return this.failTermination ? failure() : super.terminateParentSession(input);
  }

  override terminateChildSession(input: ProjectAccessSessionInput) {
    return this.failTermination ? failure() : super.terminateChildSession(input);
  }
}

function harness(access = new FaultAccess()) {
  const parent = createParentOnboardingController(access, {
    sessionId: 'demo-transaction-parent',
    deviceId: 'demo-transaction-device',
  });
  const child = createChildAccessController(access, parent);
  const run = <T>(operation: () => ServiceResult<T>) =>
    access.withDemoEntryTransaction(() =>
      parent.withDemoEntryTransaction(() => child.withDemoEntryTransaction(operation)),
    );
  const restore = () => {
    const restored = parent.restoreCompletionReceipt(familyReceipt());
    if (!restored.ok) return restored;
    return child.restorePairedDevices({ childIds: ['child_salem', 'child_alya'], pairedAt: NOW });
  };
  return { access, parent, child, run, restore };
}

function expectSessionRejected(access: FaultAccess) {
  expect(access.captured).not.toBeNull();
  expect(access.projectSession({ session: access.captured!, now: NOW }).ok).toBe(false);
}

describe('demo entry authority transaction', () => {
  it.each(['parent', 'child_salem', 'child_alya'] as const)(
    'commits only the selected %s controller authority',
    (principal) => {
      const { access, parent, child, restore, run } = harness();
      const result = run(() => {
        const restored = restore();
        if (!restored.ok) return restored;
        const entered =
          principal === 'parent'
            ? parent.resumeRememberedParent(NOW)
            : child.resumeRememberedChild(principal, NOW);
        return entered.ok ? success(true) : entered;
      });
      expectOk(result);
      expect(parent.authorizeParentExperience(NOW).ok).toBe(principal === 'parent');
      expect(child.authorizeChildExperience(NOW).ok).toBe(principal !== 'parent');
      expect(access.projectSession({ session: access.captured!, now: NOW }).ok).toBe(true);
    },
  );

  it('removes the first access marker when restoring the second marker fails, then retries', () => {
    const { access, parent, child, restore, run } = harness();
    const parentBefore = parent.getView();
    const childBefore = child.getView();
    access.failSecondMarker = true;
    expect(run(restore)).toEqual(failure());
    expect(parent.getView()).toEqual(parentBefore);
    expect(child.getView()).toEqual(childBefore);
    expect(
      access.signInChild({
        childId: 'child_salem',
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        deviceId: 'r003-shared-device-child_salem',
        sessionId: 'orphan-marker-probe',
        now: NOW,
      }).ok,
    ).toBe(false);
    access.failSecondMarker = false;
    expectOk(run(restore));
    expectOk(run(() => child.resumeRememberedChild('child_salem', NOW)));
  });

  it.each(['parent', 'child_salem'] as const)(
    'rolls back %s authority even when authorization and cleanup both fail',
    (principal) => {
      const { access, parent, child, restore, run } = harness();
      expectOk(run(restore));
      const parentBefore = parent.getView();
      const childBefore = child.getView();
      access.failAuthorization = true;
      access.failTermination = true;
      const enter = () => {
        const result =
          principal === 'parent'
            ? parent.resumeRememberedParent(NOW)
            : child.resumeRememberedChild(principal, NOW);
        return result.ok ? success(true) : result;
      };
      expect(run(enter).ok).toBe(false);
      expectSessionRejected(access);
      const failedId = access.captured!.id;
      expect(parent.getView()).toEqual(parentBefore);
      expect(child.getView()).toEqual(childBefore);
      access.failAuthorization = false;
      access.failTermination = false;
      expectOk(run(enter));
      expect(access.captured!.id).toBe(failedId);
      expect(access.projectSession({ session: access.captured!, now: NOW }).ok).toBe(true);
    },
  );

  describe.each(['access', 'parent', 'child'] as const)('%s transaction envelope', (owner) => {
    function envelopeHarness() {
      const h = harness();
      expectOk(h.run(h.restore));
      const host = h[owner];
      const run = <T>(operation: () => ServiceResult<T>) =>
        owner === 'access'
          ? host.withDemoEntryTransaction(operation)
          : h.access.withDemoEntryTransaction(() => host.withDemoEntryTransaction(operation));
      const mutate = () => {
        const result =
          owner === 'parent'
            ? h.parent.resumeRememberedParent(NOW)
            : owner === 'child'
              ? h.child.resumeRememberedChild('child_alya', NOW)
              : h.access.signInParent({
                  sessionId: 'access-envelope-probe',
                  deviceId: 'access-envelope-device',
                  parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
                  now: NOW,
                });
        return result.ok ? success(true) : result;
      };
      return { ...h, host, run, mutate };
    }

    it.each([
      ['null', null],
      ['missing data', { ok: true, meta: { origin: 'synthetic', fallbackUsed: false } }],
      ['missing metadata', { ok: true, data: true }],
      ['invalid metadata', { ok: true, data: true, meta: { origin: 'unexpected' } }],
      ['invalid error', { ok: false, error: {} }],
      [
        'unknown error code',
        {
          ok: false,
          error: {
            code: 'UNKNOWN',
            message: 'Invalid',
            retryable: false,
            fallbackAvailable: false,
          },
        },
      ],
      ['thenable success', { ...success(true), then: () => undefined }],
      ['promise', Promise.resolve(success(true))],
      [
        'accessor envelope',
        Object.defineProperty({}, 'ok', {
          enumerable: true,
          get: () => {
            throw new Error('An accessor must not supply entry state');
          },
        }),
      ],
    ])('rejects %s without leaving authority or consuming a session ID', (_label, invalid) => {
      const h = envelopeHarness();
      const before = owner === 'access' ? null : h[owner].getView();
      const result = h.run(() => {
        expectOk(h.mutate());
        return invalid as ServiceResult<true>;
      });
      expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
      expectSessionRejected(h.access);
      if (owner !== 'access') expect(h[owner].getView()).toEqual(before);
      expectOk(h.run(h.mutate));
    });

    it('propagates a declared failure and restores authority before a retry', () => {
      const h = envelopeHarness();
      const before = owner === 'access' ? null : h[owner].getView();
      expect(
        h.run(() => {
          expectOk(h.mutate());
          return failure();
        }),
      ).toEqual(failure());
      expectSessionRejected(h.access);
      if (owner !== 'access') expect(h[owner].getView()).toEqual(before);
      expectOk(h.run(h.mutate));
    });

    it('sanitizes a thrown error and releases its guard for a valid retry', () => {
      const h = envelopeHarness();
      const result = h.run(() => {
        expectOk(h.mutate());
        throw new Error('sensitive callback detail');
      });
      expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
      expect(JSON.stringify(result)).not.toContain('sensitive callback detail');
      expectSessionRejected(h.access);
      expectOk(h.run(h.mutate));
    });

    it('aborts the outer attempt when a same-instance reentry failure is swallowed', () => {
      const h = envelopeHarness();
      const nested = vi.fn(() => success(true));
      const result = h.run(() => {
        expectOk(h.mutate());
        expect(h.host.withDemoEntryTransaction(nested)).toMatchObject({
          ok: false,
          error: { code: 'INVALID_TRANSITION' },
        });
        return success(true);
      });
      expect(nested).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
      expectSessionRejected(h.access);
      expectOk(h.run(h.mutate));
    });
  });

  it.each(['parent', 'child'] as const)(
    'restores nested %s controller state by value after an injected failure',
    (owner) => {
      const h = harness();
      expectOk(h.run(h.restore));
      if (owner === 'parent') expectOk(h.parent.resumeRememberedParent(NOW));
      else expectOk(h.child.resumeRememberedChild('child_salem', NOW));
      const before = h[owner].getView();
      const devices = Reflect.get(h.child, 'devices') as Map<SyntheticChildId, DeviceAccessState>;
      expect(
        h.run(() => {
          const session = Reflect.get(
            h[owner],
            owner === 'parent' ? 'parentSession' : 'session',
          ) as AccessSession;
          Reflect.set(session.principal, 'householdId', 'invalid-household');
          (session.capabilities as string[]).splice(0);
          if (owner === 'parent') {
            const draft = Reflect.get(h.parent, 'draft') as { children: { interests: string[] }[] };
            const receipt = Reflect.get(h.parent, 'completionReceipt') as {
              children: { interests: string[] }[];
            };
            draft.children[0]!.interests.push('injected mutation');
            receipt.children[0]!.interests.push('injected mutation');
          } else {
            Reflect.set(devices.get('child_salem')!, 'status', 'revoked');
          }
          return failure();
        }),
      ).toEqual(failure());
      expect(h[owner].getView()).toEqual(before);
      expect(Reflect.get(h.child, 'devices')).toBe(devices);
      if (owner === 'parent') expectOk(h.parent.authorizeParentExperience(NOW));
      else expectOk(h.child.authorizeChildExperience(NOW));
    },
  );

  it('restores prior sessions and proofs by value while retaining map identities', () => {
    const access = new FaultAccess();
    const original = expectOk(
      access.signInParent({
        sessionId: 'prior-parent-session',
        deviceId: 'prior-parent-device',
        parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        now: NOW,
      }),
    );
    const proof = expectOk(
      access.issueReauthentication({
        proofId: 'prior-proof',
        parentSession: original,
        reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
        purpose: 'change_voice_permission',
        now: NOW,
      }),
    );
    const device = expectOk(
      access.restorePairedDevice({
        childId: 'child_salem',
        deviceId: 'prior-child-device',
        pairedAt: NOW,
      }),
    );
    const sessions = Reflect.get(access, 'sessions') as Map<string, AccessSession>;
    const devices = Reflect.get(access, 'devices') as Map<string, DeviceAccessState>;
    const proofs = Reflect.get(access, 'proofs') as Map<string, ReauthenticationProof>;
    const result = access.withDemoEntryTransaction(() => {
      const stored = sessions.get(original.id)!;
      (stored.capabilities as string[]).splice(0);
      Reflect.set(proofs.get(proof.id)!, 'purpose', 'change_media_permission');
      Reflect.set(devices.get('child_salem:prior-child-device')!, 'status', 'revoked');
      expectOk(access.terminateParentSession({ session: original, now: NOW }));
      Reflect.set(stored.principal, 'householdId', 'invalid-household');
      return failure();
    });
    expect(result).toEqual(failure());
    expect(Reflect.get(access, 'sessions')).toBe(sessions);
    expect(Reflect.get(access, 'devices')).toBe(devices);
    expect(Reflect.get(access, 'proofs')).toBe(proofs);
    expect(devices.get('child_salem:prior-child-device')).toEqual(device);
    expectOk(
      access.authorizeCapability({ session: original, capability: 'manage_tasks', now: NOW }),
    );
    expectOk(
      access.authorizeSensitiveAction({
        parentSession: original,
        proofId: proof.id,
        purpose: 'change_voice_permission',
        now: NOW,
      }),
    );
    expectOk(
      access.signInChild({
        sessionId: 'prior-device-probe',
        childId: 'child_salem',
        deviceId: device.deviceId,
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        now: NOW,
      }),
    );
  });

  it('preserves established prepared voice authority and grants after failed entry', () => {
    const registry = createFeature003ServiceRegistry();
    const access = registry.access as DeterministicSyntheticAccessService;
    const voice = createChildVoiceController(registry);
    expectOk(
      voice.configureParentPermission({
        actorRole: 'parent',
        childId: 'child_salem',
        languagePreference: 'bilingual',
        enabled: true,
      }),
    );
    expectOk(
      voice.bindActiveTask({
        actorRole: 'child',
        childId: 'child_salem',
        ageBand: '9_11',
        taskId: 'task_recycling_p0_v1',
        approvedTaskVersion: 1,
        lifecycle: 'in_progress',
        approvedByParent: true,
      }),
    );
    const before = voice.getView();
    const grants = new Map<SyntheticChildId, unknown>(
      Reflect.get(access, 'permissionGrants') as Map<SyntheticChildId, unknown>,
    );
    const parent = createParentOnboardingController(access);
    const child = createChildAccessController(access, parent);
    expect(
      access.withDemoEntryTransaction(() =>
        parent.withDemoEntryTransaction(() =>
          child.withDemoEntryTransaction(() => {
            expectOk(parent.restoreCompletionReceipt(familyReceipt()));
            expectOk(parent.resumeRememberedParent(NOW));
            return failure();
          }),
        ),
      ),
    ).toEqual(failure());
    expect(Reflect.get(access, 'permissionGrants')).toEqual(grants);
    expect(voice.getView()).toEqual(before);
    expectOk(voice.start('child'));
    expect(voice.getView().lifecycle).toBe('recording');
    expect(parent.authorizeParentExperience(NOW).ok).toBe(false);
  });
});
