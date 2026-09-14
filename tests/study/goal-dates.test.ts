import { describe, expect, it } from 'vitest';
import { applyStudyCommand, createEmptyStudyState } from '../../src/features/study';
import {
  STUDY_STORAGE_KEY,
  type AcademicGoalInput,
  type StudyActor,
  type StudyCommand,
  type StudyResult,
  type StudyState,
} from '../../src/models/study';
import { createStudyRepository } from '../../src/services/local/studyRepository';

const context = {
  familyKey: 'family-dates',
  childIds: ['salem', 'alya'],
  now: '2026-09-14T10:00:00.000Z',
};
const parent: StudyActor = { role: 'parent' };
const child: StudyActor = { role: 'child', childId: 'salem' };
const input: AcademicGoalInput = {
  subject: 'Maths',
  title: 'Explain equal groups',
  nextStep: 'Explain one example',
  parentSupport: 'Help check the example',
  criterion: { kind: 'practice_count', target: 3 },
  prize: { kind: 'experience', label: 'Choose a shared board game' },
  targetDate: '2026-09-20',
  reviewDate: '2026-09-22',
};

function data<T>(result: StudyResult<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.data;
}

function apply(state: StudyState, actor: StudyActor, command: StudyCommand): StudyState {
  return data(applyStudyCommand(state, actor, command, context));
}

function proposed(overrides: Partial<AcademicGoalInput> = {}): StudyState {
  return apply(createEmptyStudyState(context.familyKey), parent, {
    type: 'goal.create',
    id: 'goal-dates',
    childId: 'salem',
    input: { ...input, ...overrides },
  });
}

function agreed(): StudyState {
  const approved = apply(proposed(), parent, {
    type: 'goal.approve',
    id: 'goal-dates',
    expectedRevision: 1,
  });
  return apply(approved, child, {
    type: 'goal.accept',
    id: 'goal-dates',
    expectedRevision: 1,
  });
}

function storageHarness() {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
  return { values, storage, repository: createStudyRepository(storage) };
}

describe('jointly agreed academic goal dates', () => {
  it.each([
    { targetDate: null, reviewDate: null },
    { targetDate: '2028-02-29', reviewDate: null },
    { targetDate: null, reviewDate: '2026-09-22' },
    { targetDate: '2026-09-20', reviewDate: '2026-09-20' },
    { targetDate: '2026-09-20', reviewDate: '2026-10-01' },
  ])('retains valid optional civil dates without UTC conversion: %j', (dates) => {
    expect(proposed(dates).goals[0]).toMatchObject(dates);
  });

  it.each([
    { targetDate: '2026-02-29' },
    { targetDate: '2026-04-31' },
    { reviewDate: '2026-13-01' },
    { reviewDate: '2026-00-10' },
    { targetDate: '2026-9-01' },
    { reviewDate: '2026-09-22T00:00:00Z' },
    { targetDate: '2026-09-23', reviewDate: '2026-09-22' },
  ])('rejects invalid dates or reversed review order: %j', (dates) => {
    expect(
      applyStudyCommand(
        createEmptyStudyState(context.familyKey),
        parent,
        {
          type: 'goal.create',
          id: 'invalid-goal',
          childId: 'salem',
          input: { ...input, ...dates },
        },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'invalid_input' } });
  });

  it('requires a new Parent approval and Child agreement after proposed dates change', () => {
    let state = apply(proposed(), parent, {
      type: 'goal.approve',
      id: 'goal-dates',
      expectedRevision: 1,
    });
    state = apply(state, child, {
      type: 'goal.edit',
      id: 'goal-dates',
      expectedRevision: 1,
      input: { ...input, targetDate: '2026-09-21' },
    });
    expect(state.goals[0]).toMatchObject({
      revision: 2,
      targetDate: '2026-09-21',
      parentApprovedRevision: null,
      childAcceptedRevision: null,
    });
    expect(
      applyStudyCommand(
        state,
        child,
        { type: 'goal.accept', id: 'goal-dates', expectedRevision: 2 },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'invalid_transition' } });
  });

  it.each([parent, child])('prevents either role changing accepted dates: %j', (actor) => {
    expect(
      applyStudyCommand(
        agreed(),
        actor,
        {
          type: 'goal.edit',
          id: 'goal-dates',
          expectedRevision: 1,
          input: { ...input, reviewDate: '2026-09-23' },
        },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'invalid_transition' } });
  });

  it('denies sibling date edits', () => {
    expect(
      applyStudyCommand(
        proposed(),
        { role: 'child', childId: 'alya' },
        {
          type: 'goal.edit',
          id: 'goal-dates',
          expectedRevision: 1,
          input: { ...input, reviewDate: '2026-09-23' },
        },
        context,
      ),
    ).toEqual({ ok: false, error: { code: 'forbidden' } });
  });

  it('keeps dates after successful confirmation, retry and external prize fulfillment', () => {
    let state = apply(agreed(), child, {
      type: 'goal.submit',
      id: 'goal-dates',
      submissionId: 'result-dates',
      result: { kind: 'practice_count', count: 3 },
    });
    const confirm: StudyCommand = {
      type: 'goal.confirm',
      id: 'goal-dates',
      submissionId: 'result-dates',
      acknowledgement: 'You checked each example.',
    };
    state = apply(state, parent, confirm);
    expect(apply(state, parent, confirm)).toEqual(state);
    state = apply(state, parent, { type: 'goal.give', id: 'goal-dates' });
    expect(state.goals[0]).toMatchObject({
      targetDate: input.targetDate,
      reviewDate: input.reviewDate,
      prizeStatus: 'given',
    });
  });
});

describe('compatible goal date persistence', () => {
  it('loads old goals with null dates without rewriting their stored bytes', () => {
    const { values, repository } = storageHarness();
    const oldState = agreed();
    const legacy = {
      ...oldState,
      goals: oldState.goals.map((goal) => {
        const legacyGoal: Partial<typeof goal> = { ...goal };
        delete legacyGoal.targetDate;
        delete legacyGoal.reviewDate;
        return legacyGoal;
      }),
    };
    const raw = JSON.stringify(legacy);
    values.set(STUDY_STORAGE_KEY, raw);
    const loaded = data(repository.load(context.familyKey));
    expect(loaded.goals[0]).toMatchObject({ targetDate: null, reviewDate: null });
    expect(values.get(STUDY_STORAGE_KEY)).toBe(raw);
    const saved = data(repository.save(loaded));
    expect(saved.goals[0]).toMatchObject({ targetDate: null, reviewDate: null });
  });

  it('restores agreed dates after repository recreation', () => {
    const { storage, repository } = storageHarness();
    data(repository.save(agreed()));
    const restarted = createStudyRepository(storage);
    expect(data(restarted.load(context.familyKey)).goals[0]).toMatchObject({
      targetDate: input.targetDate,
      reviewDate: input.reviewDate,
    });
  });

  it.each(['targetDate', 'reviewDate'] as const)(
    'rejects direct persisted changes to accepted %s',
    (field) => {
      const { values, repository } = storageHarness();
      const state = agreed();
      data(repository.save(state));
      const before = values.get(STUDY_STORAGE_KEY);
      const edited = {
        ...state,
        goals: state.goals.map((goal) => ({ ...goal, [field]: null })),
      };
      expect(repository.save(edited)).toEqual({
        ok: false,
        error: { code: 'invalid_transition' },
      });
      expect(values.get(STUDY_STORAGE_KEY)).toBe(before);
    },
  );

  it('refuses invalid stored dates without deleting or replacing the record', () => {
    const { values, repository } = storageHarness();
    const state = proposed();
    const raw = JSON.stringify({
      ...state,
      goals: state.goals.map((goal) => ({ ...goal, reviewDate: '2026-02-30' })),
    });
    values.set(STUDY_STORAGE_KEY, raw);
    expect(repository.load(context.familyKey)).toEqual({
      ok: false,
      error: { code: 'corrupt_data' },
    });
    expect(repository.save(proposed())).toEqual({
      ok: false,
      error: { code: 'corrupt_data' },
    });
    expect(values.get(STUDY_STORAGE_KEY)).toBe(raw);
  });
});
