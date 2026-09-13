import { beforeEach, describe, expect, it } from 'vitest';
import { TASK_TEMPLATES, P0_RECYCLING_TEMPLATE } from '../../src/features/tasks/demoContent';
import { routineProgressKey } from '../../src/features/tasks/assignmentInstances';
import type { SyntheticChildId, TaskTemplate } from '../../src/models/familyGrowth';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

function ok<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}
const state = () => usePrototypeStore.getState();
async function assign(template: TaskTemplate, childId: SyntheticChildId) {
  await enterParentExperienceForTest();
  ok(
    state().createTaskDraft({
      childId,
      templateId: template.id,
      parentText:
        template.id === P0_RECYCLING_TEMPLATE.id
          ? {
              ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
              en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
            }
          : template.positiveAction,
    }),
  );
  ok(state().reviewTask());
  const assigned = ok(state().approveAssignment());
  expect(ok(state().approveAssignment())).toEqual(assigned);
  return assigned.assignment!.id;
}
async function submit(id: string, childId: SyntheticChildId, withHelp = false) {
  await enterChildExperienceForTest(childId);
  ok(state().selectTaskOccurrence(id));
  if (state().journey!.lifecycle === 'assigned')
    ok(state().chooseAssignment(state().choicePool.p0AssignmentChoice!.id));
  if (state().journey!.lifecycle === 'chosen') ok(state().startAssignment());
  return ok(
    state().submitTask({
      definitionAcknowledged: true,
      completionMode: withHelp ? 'permitted_help' : 'independent',
      helpUsed: withHelp ? state().journey!.task.content.permittedHelp : null,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
}
async function confirm(id: string) {
  await enterParentExperienceForTest();
  ok(state().selectTaskOccurrence(id));
  const journey = state().journey!;
  const metadata = journey.task.content.catalogExecution!;
  const praise =
    journey.submission!.completionMode === 'permitted_help'
      ? metadata.permittedHelpPraise
      : metadata.confirmationPraise;
  ok(
    state().confirmAndPresentPraise(
      {
        submissionId: journey.submission!.id,
        praise,
        neutralObservation: null,
        uncertainty: {
          ar: 'تأكيد وليّ الأمر للعمل المتفق عليه.',
          en: 'Parent confirmation of the agreed action.',
        },
      },
      {
        actionId: `praise:${journey.submission!.id}`,
        source: 'parent_press',
        presentedAt: '2026-09-13T14:00:00.000Z',
      },
    ),
  );
  const plan = state().confirmationPlan!;
  if (plan.renderState !== 'praise_presented') throw new Error('Praise must be presented first');
  return ok(
    state().applyRecognition({
      actionId: `award:${journey.submission!.id}`,
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: plan.presentationActionId,
    }),
  );
}

beforeEach(async () => {
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
});

describe('CE1 all 24 task workflows for both configured Children', () => {
  for (const childId of ['child_salem', 'child_alya'] as const) {
    for (const template of TASK_TEMPLATES) {
      it(`${childId} completes ${template.id} with its unchanged award and private profile growth`, async () => {
        const before = state();
        const opening = before.children[childId].earnedSeeds;
        const sibling = childId === 'child_salem' ? 'child_alya' : 'child_salem';
        const siblingGrowth = before.landscapeProgressByChild![sibling];
        const id = await assign(template, childId);
        await submit(id, childId, true);
        expect(state().children[childId].earnedSeeds).toBe(opening);
        const receipt = (await confirm(id)).receipt;
        const award = template.displayedSeedAward ?? 0;
        expect(state().journey!.lifecycle).toBe('recognized');
        expect(state().children[childId].earnedSeeds).toBe(opening + award);
        expect(state().landscapeProgressByChild![sibling]).toEqual(siblingGrowth);
        expect(receipt.provenance.challengeLeafEligible).toBe(false);
        expect(state().familyReward).toEqual(before.familyReward);
        expect(state().taskAssignments.byId[id]!.attempts).toHaveLength(1);
        if (award === 0) {
          expect(receipt.seedTransaction).toBeNull();
          expect(receipt.landscapeGrowth).toBeNull();
          expect(receipt.canopyContribution).toBeNull();
          expect(receipt.circleEvent).toBeNull();
          expect(state().revealBundleQueue.bundles).toHaveLength(0);
        } else {
          expect(receipt.seedTransaction!.amount).toBe(award);
          expect(
            state().landscapeProgressByChild![childId][template.landscapeId].cumulativeSeeds,
          ).toBe(
            before.landscapeProgressByChild![childId][template.landscapeId].cumulativeSeeds + award,
          );
        }
        const plan = state().confirmationPlan!;
        if (plan.renderState !== 'praise_presented')
          throw new Error('Praise must be presented first');
        const repeated = ok(
          state().applyRecognition({
            actionId: 'repeat',
            source: 'parent_press',
            observedRenderState: 'praise_presented',
            presentationActionId: plan.presentationActionId,
          }),
        );
        expect(repeated.disposition).toBe('already_confirmed');
        expect(state().children[childId].earnedSeeds).toBe(opening + award);
      });
    }
  }
});

it('retains interleaved submitted work, repeated definitions, retries and sibling isolation', async () => {
  const template = TASK_TEMPLATES.find((task) => task.id === 'HR01')!;
  const first = await assign(template, 'child_salem');
  await submit(first, 'child_salem');
  const second = await assign(template, 'child_salem');
  const alya = await assign(template, 'child_alya');
  expect(new Set([first, second, alya]).size).toBe(3);
  expect(state().taskAssignments.byId[first]!.journey.lifecycle).toBe('submitted');
  await enterChildExperienceForTest('child_alya');
  expect(state().selectTaskOccurrence(first).ok).toBe(false);
  await enterParentExperienceForTest();
  ok(state().selectTaskOccurrence(first));
  ok(
    state().requestKindRetry({
      ar: 'لنجرب الخطوة مرة أخرى بالمساعدة المتفق عليها.',
      en: 'Let’s try the step again with the agreed help.',
    }),
  );
  ok(state().resumeRetry());
  await submit(first, 'child_salem', true);
  await confirm(first);
  expect(
    state().taskAssignments.byId[first]!.attempts.map((item) => item.submission.attempt),
  ).toEqual([1, 2]);
  expect(state().taskAssignments.byId[second]!.journey.lifecycle).toBe('assigned');
  expect(state().taskAssignments.byId[alya]!.journey.lifecycle).toBe('assigned');
  await submit(second, 'child_salem');
  await confirm(second);
  await submit(alya, 'child_alya');
  await confirm(alya);
  await enterParentExperienceForTest();
  ok(state().selectTaskOccurrence(first));
  const beforeReentry = state();
  const originalPlan = beforeReentry.confirmationPlan!;
  if (originalPlan.renderState !== 'praise_presented')
    throw new Error('Original praise context required');
  const reopened = ok(
    state().applyRecognition({
      actionId: 'historical-reentry',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: originalPlan.presentationActionId,
    }),
  );
  expect(reopened.disposition).toBe('already_confirmed');
  expect(state().children).toEqual(beforeReentry.children);
  expect(state().landscapeProgressByChild).toEqual(beforeReentry.landscapeProgressByChild);
  expect(state().household.combinedCanopy).toEqual(beforeReentry.household.combinedCanopy);
});

it('keeps an accepted acquisition award when a later routine review changes future work', async () => {
  const template = TASK_TEMPLATES.find((task) => task.id === 'GI01')!;
  const pending = await assign(template, 'child_salem');
  for (let i = 0; i < 3; i += 1) {
    const id = await assign(template, 'child_salem');
    await submit(id, 'child_salem');
    await confirm(id);
  }
  const key = routineProgressKey(state().journey!.task);
  ok(state().applyRoutinePhaseDecision(key, 'move_future_to_maintenance'));
  await submit(pending, 'child_salem', true);
  expect((await confirm(pending)).receipt.seedTransaction!.amount).toBe(8);
  const next = await assign(template, 'child_salem');
  expect(state().journey!.task.content.routinePhase).toBe('maintenance');
  await submit(next, 'child_salem');
  expect((await confirm(next)).receipt.seedTransaction).toBeNull();
});

it('preserves P0 identity and clears every catalog occurrence on reset', async () => {
  const id = await assign(P0_RECYCLING_TEMPLATE, 'child_salem');
  expect(id).toBe('assignment_recycling_p0_v1');
  await assign(TASK_TEMPLATES[0]!, 'child_alya');
  ok(resetPrototypeForTest());
  expect(state().taskAssignments.order).toEqual([]);
  expect(state().taskContexts).toEqual({});
  expect(state().catalogSupportRequests).toEqual({});
  expect(state().children.child_salem.earnedSeeds).toBe(48);
  expect(state().children.child_alya.earnedSeeds).toBe(36);
  expect(state().landscapeProgressByChild!.child_alya.mangrove.cumulativeSeeds).toBe(0);
  expect(state().activeExperience).toBe('signed_out');
});
