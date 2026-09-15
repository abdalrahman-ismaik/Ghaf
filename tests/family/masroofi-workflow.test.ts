import { beforeEach, describe, expect, it } from 'vitest';

import { TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import { createMasroofiRuntime } from '../../src/features/masroofi/service';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  taskPraiseForTest,
} from '../helpers/prototypeStore';

const state = () => usePrototypeStore.getState();
function ok<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

async function assignReward() {
  const template = TASK_TEMPLATES.find((task) => task.id === 'HR01')!;
  ok(
    state().createTaskDraft({
      childId: 'child_salem',
      templateId: template.id,
      parentText: template.positiveAction,
    }),
  );
  ok(state().reviewTask());
  const journey = ok(state().approveAssignment());
  const assignmentId = journey.assignment!.id;
  ok(state().enableMasroofi('child_salem', true));
  ok(state().promiseMasroofi(assignmentId, 500));
  return assignmentId;
}

async function submit(assignmentId: string) {
  await enterChildExperienceForTest();
  ok(state().selectTaskOccurrence(assignmentId));
  ok(state().chooseAssignment(state().choicePool.p0AssignmentChoice!.id));
  ok(state().startAssignment());
  ok(
    state().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: state().journey!.task.content.permittedHelp,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
}

async function recognize(assignmentId: string) {
  await enterParentExperienceForTest();
  ok(state().selectTaskOccurrence(assignmentId));
  const journey = state().journey!;
  ok(
    state().confirmAndPresentPraise(
      {
        submissionId: journey.submission!.id,
        praise: taskPraiseForTest(journey),
        neutralObservation: null,
        uncertainty: { ar: 'تأكيد العمل المتفق عليه.', en: 'Confirmation of the agreed action.' },
      },
      {
        actionId: `masroofi-praise:${journey.submission!.id}`,
        source: 'parent_press',
        presentedAt: '2026-09-13T12:00:00.000Z',
      },
    ),
  );
  const plan = state().confirmationPlan!;
  if (plan.renderState !== 'praise_presented') throw new Error('Praise must be visible');
  const action = {
    actionId: `masroofi-recognize:${journey.submission!.id}`,
    source: 'parent_press' as const,
    observedRenderState: 'praise_presented' as const,
    presentationActionId: plan.presentationActionId,
  };
  ok(state().applyRecognition(action));
  return action;
}

beforeEach(async () => {
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
});

describe('Masroofi competition workflow', () => {
  it('keeps the locked amount private until Parent praise and recognition, with help at full credit', async () => {
    const id = await assignReward();
    const familyReward = state().familyReward;
    const seeds = state().children.child_salem.earnedSeeds;
    await enterChildExperienceForTest();
    const before = ok(state().getMasroofiChild());
    expect(before.card?.balanceFils).toBe(0);
    expect(JSON.stringify(before)).not.toContain('amountFils');
    expect(before.promisedTasks).toEqual([{ assignmentId: id, taskVersion: 1 }]);
    await submit(id);
    expect(ok(state().getMasroofiChild()).card?.balanceFils).toBe(0);
    const action = await recognize(id);
    expect(ok(state().getMasroofiParent('child_salem')).card?.balanceFils).toBe(500);
    expect(state().children.child_salem.earnedSeeds).toBeGreaterThan(seeds);
    expect(state().familyReward).toEqual(familyReward);
    ok(state().applyRecognition(action));
    expect(
      state().masroofi.transactions.filter((transaction) => transaction.kind === 'reward'),
    ).toHaveLength(1);
    await enterChildExperienceForTest();
    expect(ok(state().getMasroofiChild()).transactions[0]?.amountFils).toBe(500);
  });

  it('allows a practice purchase, explains a declined one, and never touches growth or double-debits', async () => {
    const id = await assignReward();
    await submit(id);
    await recognize(id);
    const seeds = state().children;
    const garden = state().landscapeProgressByChild;
    const league = state().privateLeague;
    await enterChildExperienceForTest();
    const purchased = ok(state().purchaseMasroofi('stationery', 'practice-1'));
    expect(purchased.card?.balanceFils).toBe(200);
    expect(ok(state().purchaseMasroofi('stationery', 'practice-1')).card?.balanceFils).toBe(200);
    const declined = ok(state().purchaseMasroofi('game_online', 'practice-2'));
    expect(declined.card?.balanceFils).toBe(200);
    expect(declined.transactions.find((entry) => entry.requestId === 'practice-2')?.status).toBe(
      'declined',
    );
    expect(state().children).toEqual(seeds);
    expect(state().landscapeProgressByChild).toEqual(garden);
    expect(state().privateLeague).toEqual(league);
    expect(purchased).not.toHaveProperty('promises');
    expect(purchased).not.toHaveProperty('cards');
  });

  it('denies Child mutation of Parent controls and sibling data, including after sign-out', async () => {
    await assignReward();
    ok(state().enableMasroofi('child_alya', true));
    ok(state().topUpMasroofi('child_alya', 1200, 'sibling-funds'));
    await enterChildExperienceForTest();
    const own = ok(state().getMasroofiChild());
    expect(JSON.stringify(own)).not.toContain('child_alya');
    expect(state().getMasroofiParent('child_alya').ok).toBe(false);
    expect(state().enableMasroofi('child_alya', true).ok).toBe(false);
    expect(state().topUpMasroofi('child_salem', 100, 'forged').ok).toBe(false);
    expect(state().setMasroofiControls('child_salem', own.card!.controls).ok).toBe(false);
    ok(state().signOutExperience());
    expect(state().getMasroofiChild().ok).toBe(false);
    expect(state().getMasroofiParent('child_salem').ok).toBe(false);
    expect(state().purchaseMasroofi('stationery', 'signed-out').ok).toBe(false);
  });

  it('applies Parent category choices across books, snacks and online outings through the store', async () => {
    await assignReward();
    ok(state().topUpMasroofi('child_salem', 2000, 'category-practice'));
    const controls = ok(state().getMasroofiParent('child_salem')).card!.controls;
    ok(
      state().setMasroofiControls('child_salem', {
        ...controls,
        allowedCategories: ['books', 'snacks', 'outings'],
      }),
    );
    await enterChildExperienceForTest();
    const book = ok(state().purchaseMasroofi('storybook', 'book-1'));
    expect(book.card?.balanceFils).toBe(1200);
    const outing = ok(state().purchaseMasroofi('museum_ticket', 'museum-1'));
    expect(outing.transactions.at(-1)?.declineReason).toBe('online_blocked');
    expect(outing.card?.balanceFils).toBe(1200);
    const snack = ok(state().purchaseMasroofi('snack', 'snack-1'));
    expect(snack.card?.balanceFils).toBe(800);
    expect(snack.transactions.at(-1)?.fixtureId).toBe('snack');
    const blocked = ok(state().purchaseMasroofi('stationery', 'no-stationery'));
    expect(blocked.transactions.at(-1)?.declineReason).toBe('category_blocked');
    expect(blocked.card?.balanceFils).toBe(800);
    expect(blocked.card?.controls.allowedCategories).toEqual(['books', 'snacks', 'outings']);
  });

  it('locks the amount immediately and refuses attaching money after acceptance', async () => {
    const id = await assignReward();
    expect(state().promiseMasroofi(id, 300).ok).toBe(false);
    await enterChildExperienceForTest();
    ok(state().selectTaskOccurrence(id));
    ok(state().chooseAssignment(state().choicePool.p0AssignmentChoice!.id));
    await enterParentExperienceForTest();
    expect(state().promiseMasroofi(id, 800).ok).toBe(false);
    expect(ok(state().getMasroofiParent('child_salem')).promises[0]?.amountFils).toBe(500);
  });

  it('retains credits while frozen and clears all card data on the signed-out Arabic reset', async () => {
    const id = await assignReward();
    const controls = ok(state().getMasroofiParent('child_salem')).card!.controls;
    ok(state().setMasroofiControls('child_salem', { ...controls, frozen: true }));
    await submit(id);
    await recognize(id);
    await enterChildExperienceForTest();
    const declined = ok(state().purchaseMasroofi('stationery', 'frozen-purchase'));
    expect(declined.card?.balanceFils).toBe(500);
    expect(
      declined.transactions.find((entry) => entry.requestId === 'frozen-purchase')?.declineReason,
    ).toBe('card_frozen');
    await enterParentExperienceForTest();
    ok(state().resetPrototype());
    expect(state().masroofi).toEqual(createMasroofiRuntime());
    expect(state().activeExperience).toBe('signed_out');
    expect(state().locale).toBe('ar');
    expect(state().getMasroofiChild().ok).toBe(false);
  });

  it('requires explicit Parent age confirmation and refuses an unconfigured profile', () => {
    expect(state().enableMasroofi('child_salem', false).ok).toBe(false);
    expect(state().enableMasroofi('unknown' as 'child_salem', true).ok).toBe(false);
    expect(state().masroofi).toEqual(createMasroofiRuntime());
  });

  it('clears the previous household card only when a verified family replacement completes', async () => {
    await assignReward();
    ok(state().topUpMasroofi('child_salem', 2000, 'old-family-funds'));
    const previous = state().masroofi;
    ok(state().signOutExperience());
    ok(
      state().requestFamilyReplacementVerification({
        identifier: 'new-parent@example.com',
        networkAvailable: false,
      }),
    );
    ok(await state().verifyParentCode(PARENT_VERIFICATION_CODE));
    ok(state().beginVerifiedFamilyReplacement());
    expect(state().masroofi).toEqual(previous);
    ok(
      state().updateParentOnboardingDraft({
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
    ok(state().completeParentOnboarding());
    expect(state().masroofi).toEqual(createMasroofiRuntime());
  });
});
