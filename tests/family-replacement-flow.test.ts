import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access';
import { serviceRegistry } from '../src/services';
import { deviceLocalStorage } from '../src/services/local/storage';
import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { resetPrototypeForTest } from './helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function replacementStore() {
  return usePrototypeStore.getState();
}

async function createFamily(input: {
  readonly identifier: string;
  readonly familyName: string;
  readonly guardianName: string;
  readonly childName: string;
}) {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: input.identifier,
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(
    usePrototypeStore.getState().updateParentOnboardingDraft({
      familyConnections: {
        primaryGuardianName: input.guardianName,
        secondaryGuardianName: '',
        relatives: [],
      },
      familyName: input.familyName,
      childCount: 1,
      childIndex: 0,
      child: { nickname: input.childName },
    }),
  );
  return expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

async function requestReplacement(identifier = 'new-parent@example.com') {
  expectOk(
    replacementStore().requestFamilyReplacementVerification({
      identifier,
      networkAvailable: false,
    }),
  );
}

async function beginReplacement(identifier = 'new-parent@example.com') {
  await requestReplacement(identifier);
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(replacementStore().beginVerifiedFamilyReplacement());
}

async function pairCurrentSalem() {
  expectOk(usePrototypeStore.getState().signOutExperience());
  expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
  expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
  expectOk(usePrototypeStore.getState().requestChildPairing());
  expectOk(
    usePrototypeStore.getState().requestExistingParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
  expectOk(usePrototypeStore.getState().approveChildPairing());
  expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  expectOk(usePrototypeStore.getState().completeChildPairing());
}

describe('Feature 011 Parent access presentation contract', () => {
  const source = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

  it('keeps Create a new family visible and routes through guarded replacement verification', () => {
    const signIn = source('app/access/parent/sign-in.tsx');
    const signUp = source('app/access/parent/sign-up.tsx');
    const verification = source('app/access/parent/verification.tsx');
    const review = source('app/access/parent/review-create.tsx');

    expect(signIn).toContain('testID="create-family-button"');
    expect(signIn).not.toContain('parentOnboarding.completionReceipt ? null');
    expect(signIn).toContain('router.push(signUpHref)');
    expect(signUp).toContain('requestFamilyReplacementVerification');
    expect(signUp).toContain("t('access.signUp.replacementTitle')");
    expect(signUp).not.toContain(
      'if (parentOnboarding.completionReceipt) {\n    return <Redirect href="/access/parent/sign-in" />;',
    );
    expect(verification).toContain('beginVerifiedFamilyReplacement');
    expect(review).toContain("pendingFamilyCreation === 'replacement'");
    expect(review).toContain("'access.review.replaceFamily'");
  });

  it('provides equivalent Arabic and English preservation and final-action copy', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'replacementTitle',
      'replacementBody',
      'replacementAction',
      'replacementReview',
      'replaceFamily',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});

describe('Feature 011 verified family replacement', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('preserves the established family through a wrong code and cancellation', async () => {
    await createFamily({
      identifier: 'parent@example.com',
      familyName: 'Old Family',
      guardianName: 'Old Parent',
      childName: 'Old Child',
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    const previousRecord = usePrototypeStore.getState().localFamily.record;
    const previousReceipt = usePrototypeStore.getState().parentOnboarding.completionReceipt;

    await requestReplacement();
    expect(replacementStore().pendingFamilyCreation).toBe('replacement');
    await expect(usePrototypeStore.getState().verifyParentCode('111111')).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().localFamily.record).toEqual(previousRecord);
    expect(usePrototypeStore.getState().parentOnboarding.completionReceipt).toEqual(
      previousReceipt,
    );
    expect(expectOk(serviceRegistry.localFamily.read())).toEqual(previousRecord);

    expectOk(usePrototypeStore.getState().cancelParentVerification());
    expect(replacementStore().pendingFamilyCreation).toBeNull();
    expect(usePrototypeStore.getState().parentOnboarding).toMatchObject({
      status: 'signed_out',
      completionReceipt: previousReceipt,
    });
    expect(expectOk(serviceRegistry.localFamily.read())).toEqual(previousRecord);
  });

  it('stages a fresh draft after verification and restores the old draft on Back cancellation', async () => {
    await createFamily({
      identifier: 'parent@example.com',
      familyName: 'Old Family',
      guardianName: 'Old Parent',
      childName: 'Old Child',
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    const previousRecord = usePrototypeStore.getState().localFamily.record;
    const previousReceipt = usePrototypeStore.getState().parentOnboarding.completionReceipt;

    await beginReplacement();
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      pendingFamilyCreation: 'replacement',
      parentOnboarding: {
        status: 'verified',
        completionReceipt: null,
        canEnterParentExperience: false,
        draft: { familyName: 'عائلة النخلة' },
      },
      localFamily: { record: previousRecord },
    });
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({ familyName: 'Unfinished Family' }),
    );

    expectOk(usePrototypeStore.getState().cancelParentVerification());
    expect(usePrototypeStore.getState()).toMatchObject({
      pendingFamilyCreation: null,
      parentOnboarding: {
        status: 'signed_out',
        completionReceipt: previousReceipt,
        draft: { familyName: 'Old Family' },
      },
      localFamily: { record: previousRecord },
    });
  });

  it('activates one new family and resets prior household-private runtime', async () => {
    await createFamily({
      identifier: 'parent@example.com',
      familyName: 'Old Family',
      guardianName: 'Old Parent',
      childName: 'Old Child',
    });
    expectOk(
      usePrototypeStore.getState().updateChildPermissionGrant({
        childId: 'child_salem',
        kind: 'voice',
        granted: true,
        reauthenticationCode: '4242',
      }),
    );
    await pairCurrentSalem();
    expect(usePrototypeStore.getState().localFamily.record?.pairedChildIds).toEqual([
      'child_salem',
    ]);
    const previousResetSequence = usePrototypeStore.getState().growthJourney.resetSequence;
    const ambientPreference = usePrototypeStore.getState().ambientAudioPreference;
    expectOk(usePrototypeStore.getState().signOutExperience());

    await beginReplacement();
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyConnections: {
          primaryGuardianName: 'New Parent',
          secondaryGuardianName: '',
          relatives: [],
        },
        familyName: 'New Family',
        childCount: 1,
        childIndex: 0,
        child: { nickname: 'New Child' },
      }),
    );
    expectOk(usePrototypeStore.getState().completeParentOnboarding());

    const state = replacementStore();
    expect(state).toMatchObject({
      activeExperience: 'parent',
      role: 'parent',
      pendingFamilyCreation: null,
      localFamily: {
        configuredChildIds: ['child_salem'],
        record: {
          familyName: 'New Family',
          pairedChildIds: [],
          parent: { normalizedIdentifier: 'new-parent@example.com' },
          children: [{ nickname: 'New Child' }],
        },
      },
      childAccess: { status: 'signed_out', pairedDevices: [] },
      returningUserWelcome: null,
      parentGuideSuggestion: null,
      confirmationPlan: null,
    });
    expect(state.growthJourney.resetSequence).toBe(previousResetSequence + 1);
    expect(state.ambientAudioPreference).toEqual(ambientPreference);
    expect(expectOk(state.getChildPermissionGrant('child_salem'))).toMatchObject({
      voiceGranted: false,
    });
    expect(expectOk(serviceRegistry.localFamily.read())).toEqual(state.localFamily.record);

    expectOk(state.signOutExperience());
    expect(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'new-parent@example.com',
      }),
    );
  });

  it('keeps the old family recoverable when the final replacement save fails', async () => {
    await createFamily({
      identifier: 'parent@example.com',
      familyName: 'Old Family',
      guardianName: 'Old Parent',
      childName: 'Old Child',
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    const previousRecord = usePrototypeStore.getState().localFamily.record;

    await beginReplacement();
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyConnections: {
          primaryGuardianName: 'New Parent',
          secondaryGuardianName: '',
          relatives: [],
        },
        familyName: 'New Family',
        childCount: 1,
        childIndex: 0,
        child: { nickname: 'New Child' },
      }),
    );
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      pendingFamilyCreation: 'replacement',
      localFamily: { record: previousRecord },
      parentOnboarding: { status: 'verified', completionReceipt: null },
    });
    expect(expectOk(serviceRegistry.localFamily.read())).toEqual(previousRecord);

    expectOk(usePrototypeStore.getState().cancelParentVerification());
    expect(usePrototypeStore.getState().parentOnboarding).toMatchObject({
      status: 'signed_out',
      completionReceipt: { familyName: 'Old Family' },
    });
  });
});
