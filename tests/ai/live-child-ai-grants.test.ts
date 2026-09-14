import { beforeEach, describe, expect, it } from 'vitest';

import { SYNTHETIC_PARENT_REAUTHENTICATION_CODE } from '@/models/access';
import { createFeature003ServiceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { configureChildAgeForTest } from '../helpers/configuredChildAge';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

describe('Feature 004 synthetic Child AI grants', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  it('keeps text and voice separate, profile-scoped, versioned, and default off', () => {
    const before = usePrototypeStore.getState().liveChildAiGrants;
    expect(before.child_salem.text.status).toBe('revoked');
    expect(before.child_salem.voice.status).toBe('revoked');
    expect(before.child_alya.text.status).toBe('revoked');

    const granted = usePrototypeStore.getState().updateLiveChildAiGrant({
      childId: 'child_salem',
      capability: 'text',
      granted: true,
      reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
    });
    expectOk(granted);
    expect(granted.data).toMatchObject({
      capability: 'text',
      status: 'granted',
      grantVersion: before.child_salem.text.grantVersion + 1,
      capabilityTruth: 'synthetic_implementation_only',
    });

    const after = usePrototypeStore.getState().liveChildAiGrants;
    expect(after.child_salem.voice).toEqual(before.child_salem.voice);
    expect(after.child_alya).toEqual(before.child_alya);
  });

  it('requires Parent reauthentication and immediately versions revocation', () => {
    configureChildAgeForTest('12_14');
    const rejected = usePrototypeStore.getState().updateLiveChildAiGrant({
      childId: 'child_salem',
      capability: 'voice',
      granted: true,
      reauthenticationCode: '0000',
    });
    expect(rejected).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });

    const granted = usePrototypeStore.getState().updateLiveChildAiGrant({
      childId: 'child_salem',
      capability: 'voice',
      granted: true,
      reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
    });
    expectOk(granted);
    const revoked = usePrototypeStore.getState().updateLiveChildAiGrant({
      childId: 'child_salem',
      capability: 'voice',
      granted: false,
      reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
    });
    expectOk(revoked);
    expect(revoked.data).toMatchObject({
      status: 'revoked',
      grantVersion: granted.data.grantVersion + 1,
      revokedAt: expect.any(String),
    });
  });

  it('does not grant real voice to a profile below age 12', () => {
    expect(
      usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'voice',
        granted: true,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it.each(['6_8', '9_11', '12_14'] as const)(
    'uses configured %s for voice grants while keeping text separate and fixtures unchanged',
    (ageBand) => {
      const fixtures = structuredClone(usePrototypeStore.getState().children);
      configureChildAgeForTest(ageBand);
      expectOk(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability: 'text',
          granted: true,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      );
      const result = usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'voice',
        granted: true,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      });
      expect(result.ok).toBe(ageBand === '12_14');
      expect(usePrototypeStore.getState().liveChildAiGrants.child_alya.voice.status).toBe(
        'revoked',
      );
      expect(usePrototypeStore.getState().children).toEqual(fixtures);
    },
  );

  it('rejects new grants without configured age but still allows reauthenticated revocation', () => {
    configureChildAgeForTest('12_14');
    for (const capability of ['text', 'voice'] as const) {
      expectOk(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability,
          granted: true,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      );
    }
    const { localFamily } = usePrototypeStore.getState();
    usePrototypeStore.setState({ localFamily: { ...localFamily, record: null } });
    for (const capability of ['text', 'voice'] as const) {
      expect(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability,
          granted: true,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
      expectOk(
        usePrototypeStore.getState().updateLiveChildAiGrant({
          childId: 'child_salem',
          capability,
          granted: false,
          reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
        }),
      );
    }
  });

  it('allows revoking an older voice grant after a configured age downgrade', () => {
    configureChildAgeForTest('12_14');
    expectOk(
      usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'voice',
        granted: true,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      }),
    );
    configureChildAgeForTest('6_8');
    expectOk(
      usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'voice',
        granted: false,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      }),
    );
    expect(usePrototypeStore.getState().liveChildAiGrants.child_salem.voice.status).toBe('revoked');
  });

  it('fails closed on stale versions and projects expiry without reviving access', () => {
    const registry = createFeature003ServiceRegistry();
    const service = registry.boundedAi.childAiGrants;
    const initial = service.get({
      childId: 'child_salem',
      capability: 'text',
      now: '2026-09-07T10:00:00.000Z',
    });
    expectOk(initial);
    const granted = service.update({
      childId: 'child_salem',
      capability: 'text',
      granted: true,
      expectedVersion: initial.data.grantVersion,
      noticeVersion: 1,
      policyVersion: 'child-coach-policy-v1',
      providerVersion: 'provider-contract-v1',
      reauthenticationProofId: 'reauth_grant_123456789',
      now: '2026-09-07T10:00:00.000Z',
    });
    expectOk(granted);

    expect(
      service.update({
        childId: 'child_salem',
        capability: 'text',
        granted: false,
        expectedVersion: initial.data.grantVersion,
        noticeVersion: 1,
        policyVersion: 'child-coach-policy-v1',
        providerVersion: 'provider-contract-v1',
        reauthenticationProofId: 'reauth_stale_123456789',
        now: '2026-09-08T10:00:00.000Z',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });

    expect(
      service.get({
        childId: 'child_salem',
        capability: 'text',
        now: '2026-10-07T10:00:00.000Z',
      }),
    ).toMatchObject({ ok: true, data: { status: 'expired' } });
  });

  it('clears every implementation-only grant on exact prototype reset', () => {
    expectOk(
      usePrototypeStore.getState().updateLiveChildAiGrant({
        childId: 'child_salem',
        capability: 'text',
        granted: true,
        reauthenticationCode: SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
      }),
    );
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().liveChildAiGrants.child_salem.text.status).toBe('revoked');
  });
});
