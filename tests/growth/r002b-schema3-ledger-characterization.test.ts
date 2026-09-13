import { readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../../src/features/tasks/demoContent';
import type { PrototypeSession, SyntheticChildId } from '../../src/models/familyGrowth';
import { serviceRegistry } from '../../src/services';
import {
  PREPARED_PRAISE,
  createInitialPrototypeSession,
  createResetSourceSession,
  createSubmittedP0Session,
} from '../../src/services/mock/fixtures';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const SAFE_PARENT_ACTION = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask when unsure.',
} as const;

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function receiptSeedTotal(
  ledger: PrototypeSession['recognitionLedger'],
  childId: SyntheticChildId,
): number {
  const transactionIds = new Set<string>();

  return Object.values(ledger).reduce((total, receipt) => {
    const transaction = receipt.seedTransaction;
    if (!transaction || transaction.childId !== childId || transactionIds.has(transaction.id)) {
      return total;
    }

    transactionIds.add(transaction.id);
    return total + transaction.amount;
  }, 0);
}

function rewardState(session: PrototypeSession) {
  return {
    children: structuredClone(session.children),
    landscapeProgress: structuredClone(session.landscapeProgress),
    householdCanopy: structuredClone(session.household.combinedCanopy),
    circleGoal: structuredClone(session.circleGoal),
    recognitionLedger: structuredClone(session.recognitionLedger),
    celebration: structuredClone(session.celebration),
  };
}

function storeRewardState() {
  const state = usePrototypeStore.getState();
  return rewardState(state);
}

describe('R002b Schema-3 ledger characterization', () => {
  beforeEach(async () => {
    const reset = resetPrototypeForTest();
    expectOk(reset);
    expect(reset.data).toEqual({ navigateTo: '/', replaceHistory: true });
    await enterParentExperienceForTest();
  });

  it('keeps the opening 48 outside the receipt ledger and records only the recognized +12', () => {
    const opening = createInitialPrototypeSession();
    const recognized = createResetSourceSession('recognized');

    expect(opening).toMatchObject({
      schemaVersion: 3,
      children: { child_salem: { earnedSeeds: 48 } },
      landscapeProgress: { mangrove: { cumulativeSeeds: 48 } },
      recognitionLedger: {},
    });
    expect(receiptSeedTotal(opening.recognitionLedger, 'child_salem')).toBe(0);

    expect(recognized).toMatchObject({
      children: { child_salem: { earnedSeeds: 60 } },
      landscapeProgress: { mangrove: { cumulativeSeeds: 60 } },
    });
    expect(Object.keys(recognized.recognitionLedger)).toEqual([
      'recognition:submission_recycling_p0_v1_attempt_1',
    ]);
    expect(receiptSeedTotal(recognized.recognitionLedger, 'child_salem')).toBe(12);
    expect(
      receiptSeedTotal(
        {
          ...recognized.recognitionLedger,
          duplicate_reference:
            recognized.recognitionLedger['recognition:submission_recycling_p0_v1_attempt_1']!,
        },
        'child_salem',
      ),
    ).toBe(12);
    expect(
      recognized.children.child_salem.earnedSeeds -
        receiptSeedTotal(recognized.recognitionLedger, 'child_salem'),
    ).toBe(48);
    expect(receiptSeedTotal(recognized.recognitionLedger, 'child_alya')).toBe(0);
  });

  it('keeps the 12-Seed recycling fixture canonical, alias-free, and executable only by Salem', () => {
    const opening = createInitialPrototypeSession();
    const submitted = createSubmittedP0Session();
    const runtimeEvidence = {
      opening,
      submitted,
      templates: serviceRegistry.task.listTemplates(),
    };

    expect(P0_RECYCLING_TEMPLATE).toMatchObject({
      id: 'task_recycling_p0_v1',
      displayedSeedAward: 12,
    });
    expect(submitted).toMatchObject({
      choicePool: {
        p0AssignmentChoice: {
          childId: 'child_salem',
          taskTemplateId: 'task_recycling_p0_v1',
          demoAvailability: 'p0_executable',
        },
      },
      journey: {
        task: { id: 'task_recycling_p0_v1', targetChildId: 'child_salem' },
        assignment: { childId: 'child_salem' },
      },
    });
    expect(JSON.stringify(runtimeEvidence)).not.toContain('task.recycling_sort.v1');

    expect(
      serviceRegistry.task.createDraft({
        childId: 'child_alya',
        templateId: 'task_recycling_p0_v1',
        parentText: SAFE_PARENT_ACTION,
      }),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'The sole executable P0 recycling fixture is bound to Salem',
      },
    });
    expect(SAFE_PARENT_ACTION.ar.trim()).not.toBe('');
    expect(SAFE_PARENT_ACTION.en.trim()).not.toBe('');
  });

  it('mints nothing through submission, planning, or praise, then stores one +12 receipt', () => {
    const opening = createInitialPrototypeSession();
    const submitted = createSubmittedP0Session();
    const initialRewardState = rewardState(opening);
    const initialAlya = structuredClone(opening.children.child_alya);

    expect(rewardState(submitted)).toEqual(initialRewardState);
    usePrototypeStore.setState(submitted);
    expect(storeRewardState()).toEqual(initialRewardState);

    const planned = usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    });
    expectOk(planned);
    expect(planned.data).toMatchObject({ disposition: 'pending_praise' });
    expect(storeRewardState()).toEqual(initialRewardState);

    expectOk(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'r002b-characterization-praise',
        source: 'parent_press',
        presentedAt: '2026-09-05T12:00:00.000Z',
      }),
    );
    expect(storeRewardState()).toEqual(initialRewardState);

    const recognized = usePrototypeStore.getState().applyRecognition({
      actionId: 'r002b-characterization-recognition',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'r002b-characterization-praise',
    });
    expectOk(recognized);
    expect(recognized.data).toMatchObject({
      disposition: 'applied',
      receipt: {
        recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
        seedTransaction: {
          amount: 12,
          balanceBefore: 48,
          balanceAfter: 60,
        },
        canopyContribution: { leafDelta: 1 },
        circleEvent: { actionDelta: 1 },
      },
    });

    const state = usePrototypeStore.getState();
    expect(Object.keys(state.recognitionLedger)).toEqual([
      'recognition:submission_recycling_p0_v1_attempt_1',
    ]);
    expect(receiptSeedTotal(state.recognitionLedger, 'child_salem')).toBe(12);
    expect(receiptSeedTotal(state.recognitionLedger, 'child_alya')).toBe(0);
    expect(state.children.child_salem.earnedSeeds).toBe(60);
    expect(state.landscapeProgress.mangrove.cumulativeSeeds).toBe(60);
    expect(state.household.combinedCanopy).toEqual({ contributionLeaves: 20, goalLeaves: 25 });
    expect(state.circleGoal).toEqual({
      eligibleGreenActions: 12,
      goal: 12,
      origin: 'synthetic_local',
    });
    expect(state.celebration).toEqual({ available: true, consumed: false });
    expect(state.children.child_alya).toEqual(initialAlya);
  });

  it('reconstructs the exact profile-isolated synthetic opening on every Parent reset', async () => {
    const expected = createInitialPrototypeSession();

    usePrototypeStore.setState(createResetSourceSession('recognized'));
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState()).toMatchObject({
      activeChildId: 'child_alya',
      children: {
        child_salem: { earnedSeeds: 60 },
        child_alya: { earnedSeeds: 36 },
      },
    });

    const firstResetResult = usePrototypeStore.getState().resetPrototype();
    expectOk(firstResetResult);
    expect(firstResetResult.data).toEqual({ navigateTo: '/', replaceHistory: true });
    const firstReset = usePrototypeStore.getState();
    expect(firstReset).toMatchObject({
      activeChildId: 'child_salem',
      children: {
        child_salem: { earnedSeeds: 48 },
        child_alya: { earnedSeeds: 36 },
      },
      landscapeProgress: { mangrove: { cumulativeSeeds: 48, stage: 'shoot' } },
      recognitionLedger: {},
      celebration: { available: false, consumed: false },
    });
    expect(rewardState(firstReset)).toEqual(rewardState(expected));

    await enterParentExperienceForTest();
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    const secondResetResult = usePrototypeStore.getState().resetPrototype();
    expectOk(secondResetResult);
    expect(secondResetResult.data).toEqual({ navigateTo: '/', replaceHistory: true });
    const secondReset = usePrototypeStore.getState();
    expect(rewardState(secondReset)).toEqual(rewardState(expected));
    expect(secondReset.activeChildId).toBe('child_salem');
  });

  it('has no archive, epoch, migration receipt, or durable persistence in the Schema-3 baseline', () => {
    const opening = createInitialPrototypeSession();
    const serializedOpening = JSON.stringify(opening);
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as {
      readonly dependencies?: Readonly<Record<string, string>>;
      readonly devDependencies?: Readonly<Record<string, string>>;
    };
    const dependencyNames = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    });
    const storeSource = readFileSync(
      new URL('../../src/state/usePrototypeStore.ts', import.meta.url),
      'utf8',
    );

    expect(opening.schemaVersion).toBe(3);
    expect(opening).not.toHaveProperty('archivedStages');
    expect(opening).not.toHaveProperty('profileEpochId');
    expect(opening).not.toHaveProperty('migrationReceipts');
    expect(serializedOpening).not.toMatch(/archive|epoch|migrationReceipt/iu);
    expect(dependencyNames).not.toEqual(
      expect.arrayContaining([
        '@react-native-async-storage/async-storage',
        'expo-secure-store',
        'expo-sqlite',
        'react-native-mmkv',
      ]),
    );
    expect(storeSource).not.toMatch(
      /(?:createJSONStorage|AsyncStorage|SecureStore|SQLite|MMKV|\bpersist\s*\()/u,
    );
  });
});
