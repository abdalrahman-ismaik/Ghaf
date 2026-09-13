import { describe, expect, it } from 'vitest';

import { applyStudyCommand, createEmptyStudyState } from '../../src/features/study';
import { checkStudyPracticeAnswer } from '../../src/features/study/practice';
import type {
  AcademicGoalInput,
  StudyActor,
  StudyCommand,
  StudyContext,
  StudyPlanInput,
  StudyResult,
  StudyState,
} from '../../src/models/study';

const context: StudyContext = {
  familyKey: 'family-017',
  childIds: ['salem', 'alya'],
  now: '2026-09-13T10:00:00.000Z',
};
const parent: StudyActor = { role: 'parent' };
const child: StudyActor = { role: 'child', childId: 'salem' };
const sibling: StudyActor = { role: 'child', childId: 'alya' };
const planInput: StudyPlanInput = {
  subject: 'Maths',
  title: 'Practice equal groups',
  nextStep: 'Draw three groups of four dots',
  durationMinutes: 10,
  dueDate: '2026-09-15',
  revisitDate: '2026-09-17',
};
const goalInput: AcademicGoalInput = {
  subject: 'Maths',
  title: 'My next maths assessment',
  nextStep: 'Recall one worked example',
  parentSupport: 'Help me check the example afterwards',
  criterion: { kind: 'mark', threshold: 8, denominator: 10 },
  prize: { kind: 'experience', label: 'Choose a family board game evening' },
};

function item<T>(items: readonly T[], index = 0): T {
  const value = items[index];
  if (value === undefined) throw new Error(`Missing expected record at index ${index}`);
  return value;
}

function data<T>(result: StudyResult<T>): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error.code);
  return result.data;
}
function apply(state: StudyState, actor: StudyActor, command: StudyCommand): StudyState {
  return data(applyStudyCommand(state, actor, command, context));
}
function plan(actor = parent): StudyState {
  return apply(createEmptyStudyState(context.familyKey), actor, {
    type: 'plan.create',
    id: 'plan-1',
    childId: 'salem',
    input: planInput,
  });
}
function goal(input = goalInput): StudyState {
  return apply(createEmptyStudyState(context.familyKey), child, {
    type: 'goal.create',
    id: 'goal-1',
    childId: 'salem',
    input,
  });
}
function activeGoal(input = goalInput): StudyState {
  let state = goal(input);
  state = apply(state, parent, { type: 'goal.approve', id: 'goal-1', expectedRevision: 1 });
  return apply(state, child, { type: 'goal.accept', id: 'goal-1', expectedRevision: 1 });
}

describe('study plan authority and retained progress', () => {
  it('requires Child acceptance of a Parent proposal, while a Child can plan their own work', () => {
    const proposed = plan();
    expect(item(proposed.plans).status).toBe('proposed');
    expect(
      applyStudyCommand(proposed, child, { type: 'plan.start', id: 'plan-1' }, context),
    ).toEqual({ ok: false, error: { code: 'invalid_transition' } });
    const accepted = apply(proposed, child, { type: 'plan.accept', id: 'plan-1' });
    expect(item(accepted.plans).status).toBe('planned');
    expect(item(plan(child).plans).status).toBe('planned');
    expect(item(proposed.plans).status).toBe('proposed');
  });

  it('supports pausing, asking for help, self-reported completion and a later revisit without loss', () => {
    let state = plan(child);
    state = apply(state, child, { type: 'plan.start', id: 'plan-1' });
    state = apply(state, child, { type: 'plan.pause', id: 'plan-1' });
    state = apply(state, child, { type: 'plan.help', id: 'plan-1', request: 'together' });
    state = apply(state, child, { type: 'plan.complete', id: 'plan-1' });
    const completed = item(state.plans).completedAt;
    state = apply(state, child, { type: 'plan.revisit', id: 'plan-1', date: '2026-09-20' });
    expect(item(state.plans)).toMatchObject({
      status: 'completed',
      helpRequest: 'together',
      completedAt: completed,
    });
    expect(apply(state, child, { type: 'plan.complete', id: 'plan-1' })).toEqual(state);
    expect(applyStudyCommand(state, child, { type: 'plan.start', id: 'plan-1' }, context).ok).toBe(
      false,
    );
    state = apply(state, parent, { type: 'plan.help_resolved', id: 'plan-1' });
    expect(item(state.plans).helpRequest).toBeNull();
  });

  it.each(['plan.accept', 'plan.start', 'plan.pause', 'plan.complete'] as const)(
    'does not allow Parent to impersonate Child for %s',
    (type) => {
      expect(applyStudyCommand(plan(), parent, { type, id: 'plan-1' }, context)).toEqual({
        ok: false,
        error: { code: 'forbidden' },
      });
    },
  );

  it('denies sibling, unknown-child and different-family writes', () => {
    const state = plan(child);
    expect(
      applyStudyCommand(state, sibling, { type: 'plan.complete', id: 'plan-1' }, context),
    ).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(
      applyStudyCommand(
        state,
        parent,
        {
          type: 'plan.create',
          id: 'plan-2',
          childId: 'unknown',
          input: planInput,
        },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(
      applyStudyCommand(
        state,
        child,
        { type: 'plan.complete', id: 'plan-1' },
        { ...context, familyKey: 'another-family' },
      ),
    ).toEqual({ ok: false, error: { code: 'family_mismatch' } });
    expect(
      applyStudyCommand(
        state,
        { role: 'child', childId: 'unknown' },
        { type: 'plan.complete', id: 'plan-1' },
        context,
      ).ok,
    ).toBe(false);
  });

  it.each(['2026-02-29', '2026-13-01', '2026-04-31', '13/09/2026', ''])(
    'rejects invalid due date %s',
    (dueDate) => {
      expect(
        applyStudyCommand(
          createEmptyStudyState(context.familyKey),
          child,
          {
            type: 'plan.create',
            id: 'p',
            childId: 'salem',
            input: { ...planInput, dueDate },
          },
          context,
        ),
      ).toEqual({ ok: false, error: { code: 'invalid_input' } });
    },
  );

  it('accepts a real leap day and rejects excessive duration and unknown progression fields', () => {
    expect(
      applyStudyCommand(
        createEmptyStudyState(context.familyKey),
        child,
        {
          type: 'plan.create',
          id: 'p',
          childId: 'salem',
          input: { ...planInput, dueDate: '2028-02-29' },
        },
        context,
      ).ok,
    ).toBe(true);
    expect(
      applyStudyCommand(
        createEmptyStudyState(context.familyKey),
        child,
        {
          type: 'plan.create',
          id: 'p',
          childId: 'salem',
          input: { ...planInput, durationMinutes: 61 },
        },
        context,
      ).ok,
    ).toBe(false);
    const injected = {
      type: 'plan.create',
      id: 'p',
      childId: 'salem',
      input: { ...planInput, seeds: 100 },
    };
    expect(
      applyStudyCommand(
        createEmptyStudyState(context.familyKey),
        child,
        injected as StudyCommand,
        context,
      ).ok,
    ).toBe(false);
  });
});

describe('joint academic agreements and private promises', () => {
  it('requires Parent review followed by Child acceptance of the same revision', () => {
    let state = goal();
    expect(
      applyStudyCommand(
        state,
        child,
        { type: 'goal.accept', id: 'goal-1', expectedRevision: 1 },
        context,
      ).ok,
    ).toBe(false);
    state = apply(state, parent, { type: 'goal.approve', id: 'goal-1', expectedRevision: 1 });
    state = apply(state, child, {
      type: 'goal.edit',
      id: 'goal-1',
      expectedRevision: 1,
      input: { ...goalInput, nextStep: 'Try a smaller example' },
    });
    expect(item(state.goals)).toMatchObject({
      revision: 2,
      parentApprovedRevision: null,
      childAcceptedRevision: null,
    });
    expect(
      applyStudyCommand(
        state,
        parent,
        { type: 'goal.approve', id: 'goal-1', expectedRevision: 1 },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'stale_revision' } });
    expect(
      applyStudyCommand(
        state,
        child,
        { type: 'goal.accept', id: 'goal-1', expectedRevision: 1 },
        context,
      ).ok,
    ).toBe(false);
    state = apply(state, parent, { type: 'goal.approve', id: 'goal-1', expectedRevision: 2 });
    state = apply(state, child, { type: 'goal.accept', id: 'goal-1', expectedRevision: 2 });
    expect(item(state.goals).status).toBe('active');
  });

  it('preserves agreed terms through pause and requested changes; replacements need a new agreement', () => {
    let state = activeGoal();
    const terms = item(state.goals).prize;
    state = apply(state, child, { type: 'goal.pause', id: 'goal-1' });
    state = apply(state, child, { type: 'goal.request_change', id: 'goal-1' });
    for (const actor of [parent, child]) {
      expect(
        applyStudyCommand(
          state,
          actor,
          {
            type: 'goal.edit',
            id: 'goal-1',
            expectedRevision: 1,
            input: { ...goalInput, prize: null },
          },
          context,
        ),
      ).toEqual({ ok: false, error: { code: 'invalid_transition' } });
    }
    expect(item(state.goals).prize).toEqual(terms);
    state = apply(state, child, { type: 'goal.resume', id: 'goal-1' });
    expect(item(state.goals).status).toBe('active');
    state = apply(state, child, {
      type: 'goal.create',
      id: 'goal-2',
      childId: 'salem',
      input: { ...goalInput, prize: null },
    });
    expect(item(state.goals, 1)).toMatchObject({ status: 'proposed', childAcceptedRevision: null });
  });

  it('lets a Child decline a proposal without deleting it', () => {
    const state = apply(goal(), child, { type: 'goal.decline', id: 'goal-1' });
    expect(item(state.goals)).toMatchObject({ status: 'declined', parentApprovedRevision: null });
    expect(state.goals).toHaveLength(1);
  });

  it('keeps a below-target result private and retryable, then unlocks and gives once after Parent review', () => {
    let state = activeGoal();
    state = apply(state, child, {
      type: 'goal.submit',
      id: 'goal-1',
      submissionId: 'try-1',
      result: { kind: 'mark', value: 6 },
    });
    const submitted = state;
    expect(
      apply(state, child, {
        type: 'goal.submit',
        id: 'goal-1',
        submissionId: 'try-1',
        result: { kind: 'mark', value: 6 },
      }),
    ).toEqual(submitted);
    expect(
      applyStudyCommand(
        state,
        child,
        {
          type: 'goal.submit',
          id: 'goal-1',
          submissionId: 'try-1',
          result: { kind: 'mark', value: 9 },
        },
        context,
      ).ok,
    ).toBe(false);
    state = apply(state, parent, {
      type: 'goal.confirm',
      id: 'goal-1',
      submissionId: 'try-1',
      acknowledgement: 'You checked your example; we can practise the next step together.',
    });
    expect(item(state.goals)).toMatchObject({
      status: 'active',
      prizeStatus: 'promised',
      unlockedAt: null,
    });
    expect(item(item(state.goals).submissions).metCriterion).toBe(false);
    state = apply(state, child, {
      type: 'goal.submit',
      id: 'goal-1',
      submissionId: 'try-2',
      result: { kind: 'mark', value: 8 },
    });
    state = apply(state, parent, {
      type: 'goal.confirm',
      id: 'goal-1',
      submissionId: 'try-2',
      acknowledgement: 'You practised and checked your reasoning.',
    });
    expect(item(state.goals)).toMatchObject({ status: 'acknowledged', prizeStatus: 'unlocked' });
    expect(
      apply(state, parent, {
        type: 'goal.confirm',
        id: 'goal-1',
        submissionId: 'try-2',
        acknowledgement: 'Changed wording',
      }),
    ).toEqual(state);
    state = apply(state, parent, { type: 'goal.give', id: 'goal-1' });
    expect(item(state.goals).prizeStatus).toBe('given');
    expect(apply(state, parent, { type: 'goal.give', id: 'goal-1' })).toEqual(state);
    expect(item(state.goals).submissions).toHaveLength(2);
    expect(Object.keys(state).sort()).toEqual(['familyKey', 'goals', 'plans', 'schemaVersion']);
  });

  it.each([
    {
      criterion: { kind: 'practice_count' as const, target: 3 },
      result: { kind: 'practice_count' as const, count: 3 },
    },
    {
      criterion: { kind: 'achievement' as const, description: 'Finish and explain my model' },
      result: { kind: 'achievement' as const, achieved: true },
    },
  ])('supports explicit $criterion.kind criteria without a prize', ({ criterion, result }) => {
    let state = activeGoal({ ...goalInput, criterion, prize: null });
    state = apply(state, child, {
      type: 'goal.submit',
      id: 'goal-1',
      submissionId: 'result-1',
      result,
    });
    state = apply(state, parent, {
      type: 'goal.confirm',
      id: 'goal-1',
      submissionId: 'result-1',
      acknowledgement: 'You followed the agreed next step.',
    });
    expect(item(state.goals)).toMatchObject({
      status: 'acknowledged',
      prizeStatus: null,
      unlockedAt: null,
    });
    expect(applyStudyCommand(state, parent, { type: 'goal.give', id: 'goal-1' }, context).ok).toBe(
      false,
    );
  });

  it('rejects role impersonation and sibling access across goal actions', () => {
    const proposed = goal();
    expect(
      applyStudyCommand(
        proposed,
        child,
        { type: 'goal.approve', id: 'goal-1', expectedRevision: 1 },
        context,
      ).ok,
    ).toBe(false);
    expect(
      applyStudyCommand(
        proposed,
        parent,
        { type: 'goal.accept', id: 'goal-1', expectedRevision: 1 },
        context,
      ).ok,
    ).toBe(false);
    const state = activeGoal();
    const submit: StudyCommand = {
      type: 'goal.submit',
      id: 'goal-1',
      submissionId: 'r',
      result: { kind: 'mark', value: 8 },
    };
    expect(applyStudyCommand(state, parent, submit, context).ok).toBe(false);
    expect(applyStudyCommand(state, sibling, submit, context).ok).toBe(false);
    expect(
      applyStudyCommand(
        state,
        child,
        {
          type: 'goal.confirm',
          id: 'goal-1',
          submissionId: 'r',
          acknowledgement: 'Checked the example.',
        },
        context,
      ).ok,
    ).toBe(false);
    expect(applyStudyCommand(state, child, { type: 'goal.give', id: 'goal-1' }, context).ok).toBe(
      false,
    );
  });

  it.each([
    { kind: 'mark', threshold: 11, denominator: 10 },
    { kind: 'mark', threshold: -1, denominator: 10 },
    { kind: 'mark', threshold: 0, denominator: 0 },
    { kind: 'mark', threshold: Number.NaN, denominator: 10 },
    { kind: 'mark', threshold: 9, denominator: Number.POSITIVE_INFINITY },
    { kind: 'practice_count', target: 0 },
    { kind: 'practice_count', target: 1.5 },
  ])('rejects invalid criterion $kind/$threshold/$target', (criterion) => {
    expect(
      applyStudyCommand(
        createEmptyStudyState(context.familyKey),
        parent,
        {
          type: 'goal.create',
          id: 'g',
          childId: 'salem',
          input: { ...goalInput, criterion } as AcademicGoalInput,
        },
        context,
      ).ok,
    ).toBe(false);
  });

  it('rejects mismatched results, marks exceeding the agreed denominator and backwards time', () => {
    const state = activeGoal();
    for (const result of [
      { kind: 'mark' as const, value: 11 },
      { kind: 'practice_count' as const, count: 20 },
    ]) {
      expect(
        applyStudyCommand(
          state,
          child,
          { type: 'goal.submit', id: 'goal-1', submissionId: 'r', result },
          context,
        ).ok,
      ).toBe(false);
    }
    expect(
      applyStudyCommand(
        state,
        child,
        { type: 'goal.pause', id: 'goal-1' },
        { ...context, now: '2026-09-12T10:00:00.000Z' },
      ).ok,
    ).toBe(false);
  });

  it('rejects corrupted persisted approval or prize state before applying an action', () => {
    const state = activeGoal();
    item(state.goals).parentApprovedRevision = null;
    expect(applyStudyCommand(state, child, { type: 'goal.pause', id: 'goal-1' }, context)).toEqual({
      ok: false,
      error: { code: 'corrupt_data' },
    });
  });
});

describe('finite prepared practice', () => {
  it('offers retry feedback and explanation without inferring mastery or creating progress', () => {
    expect(data(checkStudyPracticeAnswer('7'))).toEqual({
      correct: false,
      feedbackKey: 'study.example.tryAgain',
    });
    expect(data(checkStudyPracticeAnswer('12'))).toEqual({
      correct: true,
      feedbackKey: 'study.example.correct',
    });
    expect(checkStudyPracticeAnswer('unbounded-input').ok).toBe(false);
  });
});
