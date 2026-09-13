import { describe, expect, it } from 'vitest';

import {
  allocateTaskOccurrence,
  createTaskAssignmentCollection,
  initializeProfileLandscapes,
  recordTaskJourney,
  routineProgressKey,
  selectAssignedTasks,
  selectTaskInstance,
  type TaskAssignmentCollection,
} from '../../src/features/tasks/assignmentInstances';
import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import {
  createGrowthJourneyRuntime,
  projectRecognitionIntoGrowthJourney,
} from '../../src/features/growth/bootstrap';
import { createFamilyRewardRuntime } from '../../src/features/family-hub';
import {
  constructApprovalReveal,
  reconcileCommittedApprovalReveal,
} from '../../src/features/rewards/approvalReveal';
import { createEmptyRevealBundleQueue } from '../../src/features/rewards/revealBundle';
import {
  validateConfirmationPlanningRequest,
  validateRecognitionSessionTransition,
} from '../../src/features/tasks/recognitionSession';
import { validateCatalogTaskAuthority } from '../../src/features/tasks/validation';
import type {
  AgeBand,
  CompletionMode,
  PrototypeSession,
  SyntheticChildId,
  TaskJourney,
} from '../../src/models/familyGrowth';
import type { TaskService } from '../../src/services/interfaces';
import { DeterministicRecognitionService, DeterministicTaskService } from '../../src/services/mock';
import { createInitialPrototypeSession } from '../../src/services/mock/fixtures';

const tasks = new DeterministicTaskService();
const recognition = new DeterministicRecognitionService();

function value<T>(
  result:
    | { readonly ok: true; readonly data: T }
    | { readonly ok: false; readonly error: { readonly message: string } },
): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function record(
  collection: TaskAssignmentCollection,
  journey: TaskJourney,
): TaskAssignmentCollection {
  const instanceId = journey.task.occurrence?.instanceId ?? journey.assignment?.id;
  if (!instanceId) throw new Error('Expected an occurrence identity');
  return value(
    recordTaskJourney(collection, {
      instanceId,
      expectedTaskVersion: journey.task.version,
      journey,
    }),
  );
}

function assigned(
  collection: TaskAssignmentCollection,
  templateId: string,
  childId: SyntheticChildId = 'child_salem',
  routinePhase?: 'acquisition' | 'maintenance',
) {
  const allocation = value(
    allocateTaskOccurrence(collection, { householdId: 'household_al_noor', templateId, childId }),
  );
  const template = tasks.listTemplates().find((entry) => entry.id === templateId);
  if (!template) throw new Error('Expected a reviewed template');
  const childProfile = { id: childId, ageBand: '9_11' as const };
  const draft = value(
    tasks.createDraft({
      childId,
      templateId,
      parentText:
        template.id === P0_RECYCLING_TEMPLATE.id
          ? {
              ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
              en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
            }
          : template.positiveAction,
      occurrence: allocation.identity,
      childProfile,
      ...(routinePhase ? { routinePhase } : {}),
    }),
  );
  let next = record(allocation.collection, draft);
  value(tasks.review(draft));
  const reviewed: TaskJourney = { ...draft, lifecycle: 'reviewed' };
  next = record(next, reviewed);
  const approved = value(tasks.approveAssignment(reviewed, childProfile));
  next = record(next, approved.journey);
  return { collection: next, journey: approved.journey, identity: allocation.identity };
}

function submissionInput(
  journey: TaskJourney,
  completionMode: CompletionMode = 'independent',
): Parameters<TaskService['submit']>[2] {
  return {
    definitionAcknowledged: true,
    completionMode,
    helpUsed: completionMode === 'permitted_help' ? journey.task.content.permittedHelp : null,
    preparedMediaFixtureId: null,
    reflection: null,
    observableFacts: [],
  };
}

function submitted(journey: TaskJourney, completionMode: CompletionMode = 'independent') {
  const chosen = value(tasks.chooseAssignment(journey, journey.task.targetChildId));
  const started = value(tasks.startAssignment(chosen, journey.task.targetChildId));
  return value(
    tasks.submit(started, journey.task.targetChildId, submissionInput(started, completionMode)),
  );
}

function selectSession(session: PrototypeSession, journey: TaskJourney): PrototypeSession {
  const childId = journey.task.targetChildId;
  const maps = initializeProfileLandscapes(session);
  return {
    ...session,
    role: 'parent',
    activeChildId: childId,
    activeAssignmentId: journey.assignment?.id ?? null,
    journey,
    landscapeProgressByChild: maps,
    landscapeProgress: maps[childId],
  };
}

function complete(session: PrototypeSession, journey: TaskJourney) {
  const current = selectSession(session, journey);
  const submission = journey.submission;
  if (!submission) throw new Error('Expected submitted work');
  const metadata = journey.task.content.catalogExecution;
  const praise = metadata
    ? submission.completionMode === 'permitted_help'
      ? metadata.permittedHelpPraise
      : metadata.confirmationPraise
    : {
        ar: 'فرزت المواد النظيفة وطلبت مساعدة شخص بالغ عند الشك.',
        en: 'You sorted the clean materials and asked an adult for help when unsure.',
      };
  const request = {
    submissionId: submission.id,
    praise,
    neutralObservation: null,
    uncertainty: null,
  };
  expect(validateConfirmationPlanningRequest({ session: current, request }).ok).toBe(true);
  const attempt = value(recognition.planConfirmation(current, request));
  if (attempt.disposition !== 'pending_praise')
    throw new Error('Expected the first praise boundary');
  expect(current.children).toEqual(session.children);
  const presented = value(
    recognition.markPraisePresented(attempt.plan, {
      actionId: `present:${submission.id}`,
      source: 'parent_press',
      presentedAt: '2026-09-13T10:00:00.000Z',
    }),
  );
  const before: PrototypeSession = { ...current, journey: presented.journey };
  const continuation = {
    actionId: `recognize:${submission.id}`,
    source: 'parent_press' as const,
    observedRenderState: 'praise_presented' as const,
    presentationActionId: presented.presentationActionId,
  };
  const result = value(recognition.applyRecognition(before, presented, continuation));
  expect(
    validateRecognitionSessionTransition({
      before,
      after: result.session,
      disposition: result.disposition,
      journey: result.journey,
      receipt: result.receipt,
    }).ok,
  ).toBe(true);
  const duplicate = value(recognition.applyRecognition(result.session, presented, continuation));
  expect(duplicate.disposition).toBe('already_confirmed');
  expect(duplicate.session).toEqual(result.session);
  expect(
    validateRecognitionSessionTransition({
      before: result.session,
      after: duplicate.session,
      disposition: duplicate.disposition,
      journey: duplicate.journey,
      receipt: duplicate.receipt,
    }).ok,
  ).toBe(true);
  return { ...result, before, presented, continuation };
}

describe('CE1 catalog assignment engine', () => {
  it.each(
    TASK_TEMPLATES.flatMap((template) =>
      (['child_salem', 'child_alya'] as const).map((childId) => [template.id, childId] as const),
    ),
  )(
    'completes reviewed %s for %s exactly once with the fixed consequence',
    (templateId, childId) => {
      const approved = assigned(
        createTaskAssignmentCollection('catalog-matrix'),
        templateId,
        childId,
      );
      const journey = submitted(approved.journey, 'permitted_help');
      const baseline = createInitialPrototypeSession();
      const result = complete(baseline, journey);
      const amount = journey.task.content.displayedSeedAward;
      expect(result.session.children[childId].earnedSeeds).toBe(
        baseline.children[childId].earnedSeeds + (amount ?? 0),
      );
      expect(result.receipt.seedTransaction?.amount ?? null).toBe(amount);
      expect(result.receipt.provenance.familyRewardEligible).toBe(false);
      expect(result.receipt.provenance.challengeLeafEligible).toBe(false);
      expect(Object.keys(result.session.recognitionLedger)).toEqual([
        `recognition:${journey.submission!.id}`,
      ]);
      const sibling = childId === 'child_salem' ? 'child_alya' : 'child_salem';
      expect(result.session.children[sibling]).toEqual(baseline.children[sibling]);
      expect(result.session.landscapeProgressByChild?.[sibling]).toEqual(
        initializeProfileLandscapes(baseline)[sibling],
      );
      if (amount === null) {
        expect(result.receipt).toMatchObject({
          seedTransaction: null,
          landscapeGrowth: null,
          canopyContribution: null,
          circleEvent: null,
          phaseReview: null,
        });
        expect(result.session.celebration.available).toBe(false);
      }
    },
  );

  it('preserves two pending tasks and isolates the same template assigned to siblings', () => {
    const first = assigned(createTaskAssignmentCollection('parallel'), 'GI01');
    const second = assigned(first.collection, 'HR01');
    const sibling = assigned(second.collection, 'GI01', 'child_alya');
    expect(selectAssignedTasks(sibling.collection, 'child_salem').map((entry) => entry.id)).toEqual(
      [first.identity.instanceId, second.identity.instanceId],
    );
    expect(selectAssignedTasks(sibling.collection, 'child_alya').map((entry) => entry.id)).toEqual([
      sibling.identity.instanceId,
    ]);
    expect(
      selectTaskInstance(sibling.collection, {
        instanceId: first.identity.instanceId,
        childId: 'child_alya',
      }).ok,
    ).toBe(false);
    const selection = value(
      selectTaskInstance(sibling.collection, {
        instanceId: first.identity.instanceId,
        childId: 'child_salem',
      }),
    );
    expect(selection.journey.lifecycle).toBe('assigned');
    expect(selection.collection.byId).toEqual(sibling.collection.byId);
    expect(
      new Set([first.journey.task.id, second.journey.task.id, sibling.journey.task.id]).size,
    ).toBe(3);
  });

  it('keeps retry history, requires a new attempt, and rejects rewind or changed accepted awards', () => {
    const approved = assigned(createTaskAssignmentCollection('retry'), 'GI01');
    const chosen = value(tasks.chooseAssignment(approved.journey, 'child_salem'));
    let collection = record(approved.collection, chosen);
    const started = value(tasks.startAssignment(chosen, 'child_salem'));
    collection = record(collection, started);
    const first = value(tasks.submit(started, 'child_salem', submissionInput(started)));
    collection = record(collection, first);
    const retry = value(tasks.requestKindRetry(first, null));
    collection = record(collection, retry);
    const resumed = value(tasks.resumeRetry(retry));
    collection = record(collection, resumed);
    const second = value(
      tasks.submit(resumed, 'child_salem', submissionInput(resumed, 'permitted_help')),
    );
    collection = record(collection, second);
    const history = collection.byId[approved.identity.instanceId]?.attempts;
    expect(history).toHaveLength(2);
    expect(history?.[0]?.checkIn?.decision).toBe('kind_retry');
    expect(history?.[1]?.submission.attempt).toBe(2);
    expect(second.submission?.id).not.toBe(first.submission?.id);
    expect(
      recordTaskJourney(collection, {
        instanceId: approved.identity.instanceId,
        expectedTaskVersion: 1,
        journey: approved.journey,
      }).ok,
    ).toBe(false);
    const changed = {
      ...second,
      task: { ...second.task, content: { ...second.task.content, displayedSeedAward: 4 as const } },
    };
    expect(
      recordTaskJourney(collection, {
        instanceId: approved.identity.instanceId,
        expectedTaskVersion: 1,
        journey: changed,
      }).ok,
    ).toBe(false);
  });

  it('rejects copied IDs, changed revision/content, wrong age and missing profile approval', () => {
    const approved = assigned(createTaskAssignmentCollection('authority'), 'GI01');
    const task = approved.journey.task;
    expect(
      validateCatalogTaskAuthority({ ...task, approvedAgeBand: 'unknown' as AgeBand }).ok,
    ).toBe(false);
    expect(validateCatalogTaskAuthority(task, { id: 'child_alya', ageBand: '9_11' }).ok).toBe(
      false,
    );
    expect(validateCatalogTaskAuthority(task, { id: 'child_salem', ageBand: '6_8' }).ok).toBe(
      false,
    );
    expect(tasks.approveAssignment({ ...approved.journey, lifecycle: 'reviewed' }).ok).toBe(false);
    for (const content of [
      { ...task.content, displayedSeedAward: 12 as const },
      { ...task.content, title: { ar: 'عنوان مختلف', en: 'Different title' } },
      { ...task.content, childAgeBands: ['6_8' as const] },
      {
        ...task.content,
        catalogExecution: { ...task.content.catalogExecution!, revision: 'copied-revision' },
      },
      { ...task.content, safety: { ...task.content.safety, adultOwnedActions: [] } },
    ])
      expect(validateCatalogTaskAuthority({ ...task, content }).ok).toBe(false);
    const { occurrence: _occurrence, ...copied } = task;
    expect(validateCatalogTaskAuthority(copied).ok).toBe(false);
    expect(tasks.chooseAssignment({ ...approved.journey, task: copied }, 'child_salem').ok).toBe(
      false,
    );
  });

  it('rejects cross-profile/stale submissions and inherited recycling media, reflection, facts or false help', () => {
    const approved = assigned(createTaskAssignmentCollection('submission-policy'), 'FA01');
    const chosen = value(tasks.chooseAssignment(approved.journey, 'child_salem'));
    const started = value(tasks.startAssignment(chosen, 'child_salem'));
    const input = submissionInput(started);
    expect(tasks.submit(started, 'child_alya', input).ok).toBe(false);
    expect(
      tasks.submit(
        { ...started, assignment: { ...started.assignment!, taskVersion: 2 } },
        'child_salem',
        input,
      ).ok,
    ).toBe(false);
    for (const changed of [
      { ...input, definitionAcknowledged: false },
      { ...input, preparedMediaFixtureId: 'fixture_recycling_clean_v1' },
      { ...input, reflection: { ar: 'انعكاس', en: 'Reflection' } },
      { ...input, observableFacts: [P0_RECYCLING_TEMPLATE.definitionOfDone] },
      { ...input, helpUsed: started.task.content.permittedHelp },
      { ...input, completionMode: 'permitted_help' as const },
    ])
      expect(tasks.submit(started, 'child_salem', changed).ok).toBe(false);
  });

  it('grows only the correct personal landscape across interleaved confirmations', () => {
    const first = assigned(createTaskAssignmentCollection('landscapes'), 'GI01');
    const sibling = assigned(first.collection, 'GI01', 'child_alya');
    const repeated = assigned(sibling.collection, 'GI01');
    let session = complete(createInitialPrototypeSession(), submitted(first.journey)).session;
    session = complete(session, submitted(sibling.journey)).session;
    session = complete(session, submitted(repeated.journey)).session;
    expect(session.landscapeProgressByChild?.child_salem.mangrove.cumulativeSeeds).toBe(64);
    expect(session.landscapeProgressByChild?.child_alya.mangrove.cumulativeSeeds).toBe(8);
    expect(session.children.child_salem.earnedSeeds).toBe(64);
    expect(session.children.child_alya.earnedSeeds).toBe(44);
    expect(Object.keys(session.recognitionLedger)).toHaveLength(3);
    expect(
      Object.values(session.recognitionLedger).map(
        (receipt) => receipt.provenance.recognitionSequence,
      ),
    ).toEqual([1, 2, 3]);
    expect(routineProgressKey(first.journey.task)).toBe(routineProgressKey(repeated.journey.task));
    expect(routineProgressKey(first.journey.task)).not.toBe(
      routineProgressKey(sibling.journey.task),
    );
  });

  it('applies future maintenance only to new approvals, preserving an already accepted award', () => {
    let collection = createTaskAssignmentCollection('routine');
    let session = createInitialPrototypeSession();
    let acceptedBeforeDecision: TaskJourney | null = null;
    for (let index = 0; index < 4; index += 1) {
      const next = assigned(collection, 'GI01');
      collection = next.collection;
      if (index === 3) acceptedBeforeDecision = next.journey;
      else session = complete(session, submitted(next.journey)).session;
    }
    if (!acceptedBeforeDecision) throw new Error('Expected an accepted fourth occurrence');
    const key = routineProgressKey(acceptedBeforeDecision.task);
    const progress = session.routineProgressByTask?.[key];
    if (!progress) throw new Error('Expected three confirmed routine occurrences');
    session = {
      ...session,
      routineProgressByTask: {
        ...session.routineProgressByTask,
        [key]: {
          ...progress,
          futurePhase: 'maintenance',
          decision: {
            selected: 'move_future_to_maintenance',
            futurePhase: 'maintenance',
            appliesTo: 'future_completions_only',
            reversibleByParent: true,
            decidedAt: '2026-09-13T10:01:00.000Z',
          },
        },
      },
    };
    const fourth = complete(session, submitted(acceptedBeforeDecision));
    expect(fourth.receipt.seedTransaction?.amount).toBe(8);
    const future = assigned(collection, 'GI01', 'child_salem', 'maintenance');
    const maintenance = complete(fourth.session, submitted(future.journey, 'permitted_help'));
    expect(maintenance.receipt.seedTransaction).toBeNull();
    expect(maintenance.session.children.child_salem.earnedSeeds).toBe(80);
    expect(maintenance.session.routineProgressByTask?.[key]?.confirmedAcquisitionCount).toBe(4);
  });

  it('rejects a provider changing the sibling map or recognition amount', () => {
    const approved = assigned(createTaskAssignmentCollection('provider'), 'GI01');
    const result = complete(createInitialPrototypeSession(), submitted(approved.journey));
    const maps = result.session.landscapeProgressByChild!;
    const changed: PrototypeSession = {
      ...result.session,
      landscapeProgressByChild: {
        ...maps,
        child_alya: {
          ...maps.child_alya,
          mangrove: { ...maps.child_alya.mangrove, cumulativeSeeds: 8 },
        },
      },
    };
    expect(
      validateRecognitionSessionTransition({
        before: result.before,
        after: changed,
        disposition: 'applied',
        journey: result.journey,
        receipt: result.receipt,
      }).ok,
    ).toBe(false);
    const changedReceipt = {
      ...result.receipt,
      seedTransaction: { ...result.receipt.seedTransaction!, amount: 12 as const },
    };
    expect(
      validateRecognitionSessionTransition({
        before: result.before,
        after: result.session,
        disposition: 'applied',
        journey: result.journey,
        receipt: changedReceipt,
      }).ok,
    ).toBe(false);
    const wrongSequence = {
      ...result.receipt,
      provenance: { ...result.receipt.provenance, recognitionSequence: 2 },
    };
    const sequenceSession = {
      ...result.session,
      recognitionLedger: { [wrongSequence.recognitionKey]: wrongSequence },
    };
    expect(
      validateRecognitionSessionTransition({
        before: result.before,
        after: sequenceSession,
        disposition: 'applied',
        journey: result.journey,
        receipt: wrongSequence,
      }).ok,
    ).toBe(false);
    const sibling = assigned(approved.collection, 'GI01', 'child_alya');
    expect(
      recognition.applyRecognition(
        selectSession(result.session, submitted(sibling.journey)),
        result.presented,
        result.continuation,
      ).ok,
    ).toBe(false);
  });

  it('reconciles an older immutable reveal after both Children and the same routine progress', () => {
    let collection = createTaskAssignmentCollection('historical-reveal');
    let session = createInitialPrototypeSession();
    let runtime = value(createGrowthJourneyRuntime(session, 0));
    let queue = createEmptyRevealBundleQueue();
    const reward = createFamilyRewardRuntime();
    let first: ReturnType<typeof complete> | null = null;
    for (const childId of ['child_salem', 'child_alya', 'child_salem'] as const) {
      const next = assigned(collection, 'GI01', childId);
      collection = next.collection;
      const result = complete(session, submitted(next.journey, 'permitted_help'));
      const projection = value(
        projectRecognitionIntoGrowthJourney({
          runtime,
          previousSession: result.before,
          nextSession: result.session,
          receipt: result.receipt,
          committedAt: result.presented.checkIn.praisePresentedAt,
        }),
      );
      const reveal = value(
        constructApprovalReveal({
          queue,
          plan: result.presented,
          recognition: result,
          previousSession: result.before,
          growthBefore: runtime,
          growthProjection: projection,
          familyRewardBefore: reward,
          familyRewardAfter: reward,
          privateLeague: null,
        }),
      );
      expect(reveal.disposition).toBe('created');
      queue = reveal.queue;
      runtime = projection.runtime;
      session = result.session;
      first ??= result;
    }
    if (!first) throw new Error('Expected the first committed approval');
    const current = selectSession(session, first.journey);
    const reconciled = value(
      reconcileCommittedApprovalReveal({
        queue,
        plan: first.presented,
        recognition: { ...first, disposition: 'already_confirmed', session: current },
        growthRuntime: runtime,
        familyReward: reward,
        privateLeague: null,
      }),
    );
    expect(reconciled.disposition).toBe('already_exists');
    expect(reconciled.queue).toEqual(queue);
    expect(current.children.child_salem.earnedSeeds).toBe(64);
    expect(current.children.child_alya.earnedSeeds).toBe(44);
  });

  it('retains first P0 identity, isolates repeats and clears all occurrence history on reset', () => {
    const first = assigned(createTaskAssignmentCollection('p0'), P0_RECYCLING_TEMPLATE.id);
    const repeated = assigned(first.collection, P0_RECYCLING_TEMPLATE.id);
    expect(first.identity.assignmentId).toBe('assignment_recycling_p0_v1');
    expect(repeated.identity.assignmentId).not.toBe(first.identity.assignmentId);
    expect(routineProgressKey(first.journey.task)).toBe(routineProgressKey(repeated.journey.task));
    const firstResult = complete(createInitialPrototypeSession(), submitted(first.journey));
    const secondResult = complete(firstResult.session, submitted(repeated.journey));
    expect(firstResult.receipt.seedTransaction?.amount).toBe(12);
    expect(secondResult.receipt.seedTransaction?.amount).toBe(12);
    expect(secondResult.receipt.provenance.familyRewardEligible).toBe(false);
    const reset = createTaskAssignmentCollection('p0-reset');
    expect(reset.order).toEqual([]);
    expect(reset.byId).toEqual({});
    expect(reset.selectedByChild).toEqual({ child_salem: null, child_alya: null });
    expect(createInitialPrototypeSession().children.child_salem.earnedSeeds).toBe(48);
    expect(createInitialPrototypeSession().children.child_alya.earnedSeeds).toBe(36);
  });
});
