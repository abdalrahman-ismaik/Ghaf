import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access';
import { deviceLocalStorage } from '../src/services/local/storage';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '../src/state/usePrototypeStore';
import { resetPrototypeForTest } from './helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

async function completeParentOnboarding() {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

async function requestSalemPairing() {
  expectOk(usePrototypeStore.getState().signOutExperience());
  expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
  expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
  expectOk(usePrototypeStore.getState().requestChildPairing());
}

async function signInReturningParent() {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

describe('R003 access and role-separated store flow', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('does not authorize reset from the legacy presentation role alone', () => {
    usePrototypeStore.getState().setRole('parent');

    expect(usePrototypeStore.getState().resetPrototype()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('persists only configured local roles and excludes an unconfigured Child everywhere', async () => {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyName: 'Palm Family',
        childCount: 1,
        childIndex: 0,
        child: { nickname: 'Salem Demo' },
      }),
    );
    expectOk(usePrototypeStore.getState().completeParentOnboarding());

    expect(usePrototypeStore.getState().localFamily).toMatchObject({
      status: 'ready',
      configuredChildIds: ['child_salem'],
      record: {
        familyName: 'Palm Family',
        parent: { id: 'parent_al_noor', role: 'parent' },
        children: [{ id: 'child_salem', role: 'child', nickname: 'Salem Demo' }],
      },
    });
    expect(usePrototypeStore.getState().getChildPermissionGrant('child_alya')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(usePrototypeStore.getState().selectChildAccessProfile('child_alya')).toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
  });

  it('keeps review unauthenticated when the complete local-family write fails', async () => {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      parentOnboarding: {
        status: 'verified',
        completionReceipt: null,
        canEnterParentExperience: false,
      },
      localFamily: { record: null, configuredChildIds: [] },
    });
  });

  it('persists a changed app language and reuses it on returning Parent entry', async () => {
    await completeParentOnboarding();
    usePrototypeStore.getState().setLocale('en');

    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'en',
      direction: 'ltr',
      localFamily: { record: { appLanguage: 'en' } },
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    await signInReturningParent();
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'en',
      direction: 'ltr',
      activeExperience: 'parent',
      returningUserWelcome: { kind: 'returning_parent' },
    });
  });

  it('does not let the legacy visual role mutate Parent state after sign-out', async () => {
    await completeParentOnboarding();
    expectOk(usePrototypeStore.getState().signOutExperience());
    usePrototypeStore.getState().setRole('parent');

    const before = usePrototypeStore.getState().journey;
    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: { ar: 'مهمة اصطناعية', en: 'Synthetic task' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().journey).toBe(before);
  });

  it('requires an active experience before consuming transient celebration state', async () => {
    await completeParentOnboarding();
    usePrototypeStore.setState({ celebration: { available: true, consumed: false } });

    expectOk(usePrototypeStore.getState().consumeCelebration());
    expect(usePrototypeStore.getState().celebration).toEqual({ available: true, consumed: true });

    usePrototypeStore.setState({ celebration: { available: true, consumed: false } });
    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(usePrototypeStore.getState().consumeCelebration()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().celebration).toEqual({ available: true, consumed: false });
  });

  it('binds Parent authorization to the active Parent presentation role', async () => {
    await completeParentOnboarding();
    usePrototypeStore.getState().setRole('child');

    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState().authorizeParentExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('requires the active Parent experience for approval, then hands back to Child pairing', async () => {
    await completeParentOnboarding();
    expect(usePrototypeStore.getState().selectChildAccessProfile('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    await requestSalemPairing();

    expect(usePrototypeStore.getState().approveChildPairing()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    expect(usePrototypeStore.getState().enterParentExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    await signInReturningParent();
    expect(selectHasActiveParentExperience(usePrototypeStore.getState())).toBe(true);
    expectOk(usePrototypeStore.getState().approveChildPairing());
    expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());

    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      role: 'child',
      parentOnboarding: { status: 'signed_out', canEnterParentExperience: false },
      childAccess: { status: 'pairing_approved' },
    });

    expectOk(usePrototypeStore.getState().completeChildPairing());
    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(true);
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'child',
      role: 'child',
      activeChildId: 'child_salem',
      localFamily: {
        record: { pairedChildIds: ['child_salem'] },
      },
    });
    expectOk(usePrototypeStore.getState().getOwnChildPermissionGrant());
    expect(usePrototypeStore.getState().setActiveChild('child_alya')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().activeChildId).toBe('child_salem');
    expect(usePrototypeStore.getState().enterParentExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().selectChildAccessProfile('child_alya')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(
      usePrototypeStore.getState().requestParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('binds Child authorization to the profile selected by the active session', async () => {
    await completeParentOnboarding();
    await requestSalemPairing();
    await signInReturningParent();
    expectOk(usePrototypeStore.getState().approveChildPairing());
    expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
    expectOk(usePrototypeStore.getState().completeChildPairing());

    usePrototypeStore.setState({ activeChildId: 'child_alya' });

    expect(selectCanEnterChildExperience(usePrototypeStore.getState())).toBe(false);
    expect(usePrototypeStore.getState().authorizeChildExperience()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().getOwnChildPermissionGrant()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('fails closed for Parent-only private data and controls outside Parent authority', async () => {
    await completeParentOnboarding();
    expectOk(usePrototypeStore.getState().getFamilyReward());
    expectOk(usePrototypeStore.getState().getChildPermissionGrant('child_salem'));

    expectOk(usePrototypeStore.getState().signOutExperience());

    expect(usePrototypeStore.getState().getFamilyReward()).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(usePrototypeStore.getState().getChildPermissionGrant('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'voice',
        granted: true,
        reauthenticationCode: '4242',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().revokeChildDevice('child_salem')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('keeps permission changes Parent-controlled, reauthenticated, and resettable', async () => {
    await completeParentOnboarding();

    expect(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'voice',
        granted: true,
        reauthenticationCode: '0000',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      expectOk(usePrototypeStore.getState().getChildPermissionGrant('child_salem')),
    ).toMatchObject({ voiceGranted: false, version: 1 });

    expectOk(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'voice',
        granted: true,
        reauthenticationCode: '4242',
      }),
    );
    expect(
      expectOk(usePrototypeStore.getState().getChildPermissionGrant('child_salem')),
    ).toMatchObject({ voiceGranted: true });

    expectOk(usePrototypeStore.getState().resetPrototype());
    const reset = usePrototypeStore.getState();
    expect(reset).toMatchObject({
      activeExperience: 'signed_out',
      permissionProofSequence: 0,
      childAccess: { status: 'signed_out', pairedDevices: [] },
      familyReward: { plan: { lifecycle: 'promised' } },
      localFamily: { status: 'ready', record: null, configuredChildIds: [] },
    });
    expect(selectHasActiveParentExperience(reset)).toBe(false);
    expect(selectCanEnterChildExperience(reset)).toBe(false);
  });

  it('refreshes permission authority before reset after settings changed the same grant', async () => {
    await completeParentOnboarding();
    expectOk(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: 'task_recycling_p0_v1',
        parentText: {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        },
      }),
    );
    expectOk(usePrototypeStore.getState().reviewTask());
    expectOk(usePrototypeStore.getState().setChildVoicePermission(true));
    expectOk(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'media',
        granted: true,
        reauthenticationCode: '4242',
      }),
    );

    expectOk(usePrototypeStore.getState().resetPrototype());
    expectOk(resetPrototypeForTest());
    expect(usePrototypeStore.getState().childVoiceView).toMatchObject({
      permissionEnabled: false,
      lifecycle: 'idle',
    });
  });
});
