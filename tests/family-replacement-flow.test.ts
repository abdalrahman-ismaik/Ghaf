import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access';
import { selectGrowthJourneyProfile } from '../src/features/growth/bootstrap';
import { buildPrivateLeaguePresentation } from '../src/features/league/presentation';
import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { PARENT_GUIDE_FIXTURE, PREPARED_PRAISE, serviceRegistry } from '../src/services';
import { deviceLocalStorage } from '../src/services/local/storage';
import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { resetPrototypeForTest } from './helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result).toMatchObject({ ok: true });
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

async function pairCurrentSalem(identifier = 'parent@example.com') {
  expectOk(usePrototypeStore.getState().signOutExperience());
  expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
  expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
  expectOk(usePrototypeStore.getState().requestChildPairing());
  expectOk(
    usePrototypeStore.getState().requestExistingParentVerification({
      identifier,
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
  expectOk(usePrototypeStore.getState().approveChildPairing());
  expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  expectOk(usePrototypeStore.getState().completeChildPairing());
}

function recognitionAuthorities() {
  const state = replacementStore();
  return {
    children: state.children,
    landscapeProgress: state.landscapeProgress,
    household: state.household,
    circleGoal: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
    growthJourney: state.growthJourney,
    familyReward: state.familyReward,
    privateLeague: state.privateLeague,
    revealBundleQueue: state.revealBundleQueue,
    approvalRevealCommitments: state.approvalRevealCommitments,
    celebration: state.celebration,
  };
}

function salemLeague() {
  return expectOk(
    buildPrivateLeaguePresentation({
      activeProfileId: 'child_salem',
      privateLeague: replacementStore().privateLeague,
    }),
  ).activeParticipant;
}

function fillReplacementDraft() {
  expectOk(
    replacementStore().updateParentOnboardingDraft({
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
}

async function recognizeCurrentFamily(identifier = 'parent@example.com') {
  expectOk(
    replacementStore().createTaskDraft({
      childId: 'child_salem',
      templateId: P0_RECYCLING_TEMPLATE.id,
      parentText: PARENT_GUIDE_FIXTURE.originalParentText,
    }),
  );
  expectOk(
    await replacementStore().requestParentGuide({
      requestId: 'replacement-prepared-guide',
      intent: 'make_clearer',
    }),
  );
  expectOk(replacementStore().acceptGuideSuggestion());
  expectOk(replacementStore().reviewTask());
  expectOk(replacementStore().approveAssignment());
  await pairCurrentSalem(identifier);
  expectOk(replacementStore().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(replacementStore().startAssignment());
  expectOk(
    replacementStore().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: P0_RECYCLING_TEMPLATE.permittedHelp,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
  expect(replacementStore().children.child_salem.earnedSeeds).toBe(48);
  expectOk(replacementStore().signOutExperience());
  expectOk(
    replacementStore().requestExistingParentVerification({ identifier, networkAvailable: false }),
  );
  expectOk(await replacementStore().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(replacementStore().completeParentOnboarding());
  const submissionId = replacementStore().journey?.submission?.id ?? '';
  expectOk(replacementStore().restoreCheckInState(submissionId));
  expectOk(
    replacementStore().confirmAndPresentPraise(
      { submissionId, praise: PREPARED_PRAISE, neutralObservation: null, uncertainty: null },
      {
        actionId: 'replacement-parent-praise',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      },
    ),
  );
  expect(replacementStore().children.child_salem.earnedSeeds).toBe(48);
  const action = {
    actionId: 'replacement-parent-recognition',
    source: 'parent_press' as const,
    observedRenderState: 'praise_presented' as const,
    presentationActionId: 'replacement-parent-praise',
  };
  expect(expectOk(replacementStore().applyRecognition(action)).disposition).toBe('applied');
  return action;
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

  it.each([false, true])(
    'allows exactly one new recognition after replacement with prior recognition=%s',
    async (recognizedBeforeReplacement) => {
      await createFamily({
        identifier: 'parent@example.com',
        familyName: 'Old Family',
        guardianName: 'Old Parent',
        childName: 'Old Child',
      });
      if (recognizedBeforeReplacement) await recognizeCurrentFamily();
      const oldEpoch = replacementStore().privateLeague.profileEpochId;
      expectOk(replacementStore().signOutExperience());
      await beginReplacement();
      fillReplacementDraft();
      expectOk(replacementStore().completeParentOnboarding());
      const state = replacementStore();

      expect(state.recognitionLedger).toEqual({});
      expect(state.revealBundleQueue.bundles).toEqual([]);
      expect.soft(state.approvalRevealCommitments).toEqual({});
      expect.soft(state.privateLeague.receiptsByRecognitionKey).toEqual({});
      expect.soft(state.privateLeague.profileEpochId).not.toBe(oldEpoch);
      expect
        .soft(state.privateLeague.profileEpochId)
        .toBe(state.growthJourney.ledgersByProfile.child_salem.profileEpochId);
      expect.soft(salemLeague()).toMatchObject({ completedLeafCount: 4, score: 80 });
      expect(state.children.child_salem.earnedSeeds).toBe(48);
      expect(state.familyReward.plan.lifecycle).toBe('promised');
      expect(state.familyReward.progress.eligibleSeedDelta).toBe(0);

      const action = await recognizeCurrentFamily('new-parent@example.com');
      expect(replacementStore()).toMatchObject({
        children: { child_salem: { earnedSeeds: 60 }, child_alya: { earnedSeeds: 36 } },
        landscapeProgress: { mangrove: { cumulativeSeeds: 60, stage: 'sapling' } },
        household: { combinedCanopy: { contributionLeaves: 20 } },
        circleGoal: { eligibleGreenActions: 12 },
        familyReward: {
          plan: { lifecycle: 'unlocked' },
          baselineEligibleSeeds: 108,
          targetEligibleSeeds: 120,
          progress: { eligibleSeedDelta: 12 },
        },
      });
      expect(salemLeague()).toMatchObject({ completedLeafCount: 5, score: 100 });
      expect(
        expectOk(selectGrowthJourneyProfile(replacementStore().growthJourney, 'child_salem'))
          .lifetimeSeeds,
      ).toBe(120);
      expect(Object.keys(replacementStore().recognitionLedger)).toHaveLength(1);
      expect(Object.keys(replacementStore().approvalRevealCommitments)).toHaveLength(1);
      expect(replacementStore().revealBundleQueue.bundles).toHaveLength(1);
      const recognized = recognitionAuthorities();
      expect(expectOk(replacementStore().applyRecognition(action)).disposition).toBe(
        'already_confirmed',
      );
      expect(recognitionAuthorities()).toEqual(recognized);
    },
  );

  it.each(['cancel', 'failed_save'] as const)(
    'preserves recognized authorities when replacement ends with %s',
    async (outcome) => {
      await createFamily({
        identifier: 'parent@example.com',
        familyName: 'Old Family',
        guardianName: 'Old Parent',
        childName: 'Old Child',
      });
      await recognizeCurrentFamily();
      const previous = recognitionAuthorities();
      const previousRecord = replacementStore().localFamily.record;
      expectOk(replacementStore().signOutExperience());
      await beginReplacement();
      fillReplacementDraft();
      if (outcome === 'failed_save') {
        const save = vi.spyOn(serviceRegistry.localFamily, 'save').mockReturnValueOnce({
          ok: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: 'Prepared replacement save failure',
            retryable: false,
            fallbackAvailable: false,
          },
        });
        try {
          expect(replacementStore().completeParentOnboarding().ok).toBe(false);
          expect(save).toHaveBeenCalledOnce();
        } finally {
          save.mockRestore();
        }
        expect(recognitionAuthorities()).toEqual(previous);
      }
      expectOk(replacementStore().cancelParentVerification());
      expect(recognitionAuthorities()).toEqual(previous);
      expect(expectOk(serviceRegistry.localFamily.read())).toEqual(previousRecord);
      expect(salemLeague()).toMatchObject({ completedLeafCount: 5, score: 100 });
    },
  );

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
