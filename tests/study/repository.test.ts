import { describe, expect, it } from 'vitest';

import { applyStudyCommand, createEmptyStudyState } from '../../src/features/study';
import {
  STUDY_STORAGE_KEY,
  type StudyCommand,
  type StudyResult,
  type StudyState,
} from '../../src/models/study';
import { createStudyRepository } from '../../src/services/local/studyRepository';

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

function storageHarness() {
  const values = new Map<string, string>();
  const behavior = {
    readThrows: false,
    writeThrows: false,
    clearThrows: false,
    silentWrite: false,
    silentClear: false,
    writes: 0,
  };
  const storage = {
    getItem(key: string) {
      if (behavior.readThrows) throw new Error('read unavailable');
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      behavior.writes += 1;
      if (behavior.writeThrows) throw new Error('write unavailable');
      if (!behavior.silentWrite) values.set(key, value);
    },
    removeItem(key: string) {
      if (behavior.clearThrows) throw new Error('clear unavailable');
      if (!behavior.silentClear) values.delete(key);
    },
  };
  return { values, behavior, storage, repository: createStudyRepository(storage) };
}

const context = { familyKey: 'family-a', childIds: ['salem'], now: '2026-09-13T10:00:00.000Z' };
function createPlan(): StudyState {
  return data(
    applyStudyCommand(
      createEmptyStudyState('family-a'),
      { role: 'child', childId: 'salem' },
      {
        type: 'plan.create',
        id: 'plan-a',
        childId: 'salem',
        input: {
          title: 'A small maths step',
          subject: 'Maths',
          nextStep: 'Explain a worked example',
          durationMinutes: 10,
          dueDate: null,
          revisitDate: '2026-09-15',
        },
      },
      context,
    ),
  );
}

function createAgreedGoal(): StudyState {
  const commands: StudyCommand[] = [
    {
      type: 'goal.create',
      id: 'goal-a',
      childId: 'salem',
      input: {
        title: 'Read three examples',
        subject: 'Maths',
        nextStep: 'Choose the first example',
        parentSupport: 'Help check afterwards',
        criterion: { kind: 'practice_count', target: 3 },
        prize: { kind: 'gift', label: 'A new puzzle' },
      },
    },
    { type: 'goal.approve', id: 'goal-a', expectedRevision: 1 },
    { type: 'goal.accept', id: 'goal-a', expectedRevision: 1 },
  ];
  let state = createEmptyStudyState('family-a');
  for (const command of commands) {
    state = data(
      applyStudyCommand(
        state,
        command.type === 'goal.accept' ? { role: 'child', childId: 'salem' } : { role: 'parent' },
        command,
        context,
      ),
    );
  }
  return state;
}

describe('family-bound study persistence', () => {
  it('saves detached records, reloads across repository recreation and never writes on read', () => {
    const harness = storageHarness();
    expect(data(harness.repository.load('family-a'))).toEqual(createEmptyStudyState('family-a'));
    expect(harness.behavior.writes).toBe(0);
    const state = createPlan();
    const saved = data(harness.repository.save(state));
    item(state.plans).title = 'Changed caller reference';
    item(saved.plans).title = 'Changed result reference';
    const restarted = createStudyRepository(harness.storage);
    const loaded = data(restarted.load('family-a'));
    expect(item(loaded.plans).title).toBe('A small maths step');
    item(loaded.plans).nextStep = 'Changed loaded reference';
    expect(item(data(restarted.load('family-a')).plans).nextStep).toBe('Explain a worked example');
  });

  it('refuses a different family until explicit verified clearing succeeds', () => {
    const { repository, values } = storageHarness();
    data(repository.save(createPlan()));
    const before = values.get(STUDY_STORAGE_KEY);
    expect(repository.load('family-b')).toEqual({ ok: false, error: { code: 'family_mismatch' } });
    expect(repository.save(createEmptyStudyState('family-b'))).toEqual({
      ok: false,
      error: { code: 'family_mismatch' },
    });
    expect(values.get(STUDY_STORAGE_KEY)).toBe(before);
    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(data(repository.load('family-b'))).toEqual(createEmptyStudyState('family-b'));
    expect(repository.save(createEmptyStudyState('family-b')).ok).toBe(true);
  });

  it.each(['not json', '{}', '{"schemaVersion":2}', 'x'.repeat(1000001)])(
    'does not overwrite malformed or oversized data %#',
    (raw) => {
      const harness = storageHarness();
      harness.values.set(STUDY_STORAGE_KEY, raw);
      expect(harness.repository.load('family-a')).toEqual({
        ok: false,
        error: { code: 'corrupt_data' },
      });
      expect(harness.repository.save(createPlan())).toEqual({
        ok: false,
        error: { code: 'corrupt_data' },
      });
      expect(harness.values.get(STUDY_STORAGE_KEY)).toBe(raw);
      expect(harness.behavior.writes).toBe(0);
    },
  );

  it('surfaces read failure without treating it as an empty family', () => {
    const harness = storageHarness();
    harness.behavior.readThrows = true;
    expect(harness.repository.load('family-a')).toEqual({
      ok: false,
      error: { code: 'storage_read' },
    });
    expect(harness.repository.save(createPlan())).toEqual({
      ok: false,
      error: { code: 'storage_read' },
    });
    expect(harness.behavior.writes).toBe(0);
  });

  it.each(['writeThrows', 'silentWrite'] as const)(
    'does not claim saved state after %s',
    (behavior) => {
      const harness = storageHarness();
      harness.behavior[behavior] = true;
      expect(harness.repository.save(createPlan())).toEqual({
        ok: false,
        error: { code: 'storage_write' },
      });
      expect(harness.values.has(STUDY_STORAGE_KEY)).toBe(false);
      harness.behavior[behavior] = false;
      expect(harness.repository.save(createPlan()).ok).toBe(true);
    },
  );

  it('checks readback when a storage adapter writes different bytes', () => {
    const harness = storageHarness();
    const repository = createStudyRepository({
      ...harness.storage,
      setItem(key, value) {
        harness.values.set(key, `${value} `);
      },
    });
    expect(repository.save(createPlan())).toEqual({ ok: false, error: { code: 'storage_write' } });
  });

  it.each(['clearThrows', 'silentClear'] as const)(
    'verifies removal and offers an honest retry after %s',
    (behavior) => {
      const harness = storageHarness();
      data(harness.repository.save(createPlan()));
      harness.behavior[behavior] = true;
      expect(harness.repository.clear()).toEqual({ ok: false, error: { code: 'storage_clear' } });
      expect(harness.values.has(STUDY_STORAGE_KEY)).toBe(true);
      harness.behavior[behavior] = false;
      expect(harness.repository.clear()).toEqual({ ok: true, data: true });
      expect(harness.values.has(STUDY_STORAGE_KEY)).toBe(false);
    },
  );

  it('rejects corrupt semantic records and unknown progression fields', () => {
    const harness = storageHarness();
    const state = createPlan();
    item(state.plans).completedAt = context.now;
    harness.values.set(STUDY_STORAGE_KEY, JSON.stringify(state));
    expect(harness.repository.load('family-a').ok).toBe(false);
    harness.values.set(STUDY_STORAGE_KEY, JSON.stringify({ ...createPlan(), seeds: 50 }));
    expect(harness.repository.load('family-a').ok).toBe(false);
    const duplicate = createPlan();
    duplicate.plans.push({ ...item(duplicate.plans) });
    harness.values.set(STUDY_STORAGE_KEY, JSON.stringify(duplicate));
    expect(harness.repository.load('family-a').ok).toBe(false);
  });

  it('bounds the number of persisted plans before use', () => {
    const harness = storageHarness();
    const state = createPlan();
    state.plans = Array.from({ length: 101 }, (_, index) => ({
      ...item(state.plans),
      id: `plan-${index}`,
    }));
    harness.values.set(STUDY_STORAGE_KEY, JSON.stringify(state));
    expect(harness.repository.load('family-a')).toEqual({
      ok: false,
      error: { code: 'corrupt_data' },
    });
  });

  it('rejects removal of completion evidence and changes to accepted terms even through direct save', () => {
    const harness = storageHarness();
    const accepted = createAgreedGoal();
    data(harness.repository.save(accepted));
    const edited = structuredClone(accepted);
    item(edited.goals).prize = { kind: 'gift', label: 'A smaller puzzle' };
    expect(harness.repository.save(edited)).toEqual({
      ok: false,
      error: { code: 'invalid_transition' },
    });
    expect(harness.repository.save(createEmptyStudyState('family-a'))).toEqual({
      ok: false,
      error: { code: 'invalid_transition' },
    });
    expect(data(harness.repository.load('family-a'))).toEqual(accepted);

    const planState = createPlan();
    data(harness.repository.clear());
    const complete = data(
      applyStudyCommand(
        planState,
        { role: 'child', childId: 'salem' },
        { type: 'plan.complete', id: 'plan-a' },
        context,
      ),
    );
    data(harness.repository.save(complete));
    expect(harness.repository.save(planState)).toEqual({
      ok: false,
      error: { code: 'invalid_transition' },
    });
  });

  it('retains reviewed results, unlocked promises and given evidence across reload', () => {
    const harness = storageHarness();
    let state = createAgreedGoal();
    state = data(
      applyStudyCommand(
        state,
        { role: 'child', childId: 'salem' },
        {
          type: 'goal.submit',
          id: 'goal-a',
          submissionId: 'result-a',
          result: { kind: 'practice_count', count: 3 },
        },
        context,
      ),
    );
    data(harness.repository.save(state));
    state = data(
      applyStudyCommand(
        state,
        { role: 'parent' },
        {
          type: 'goal.confirm',
          id: 'goal-a',
          submissionId: 'result-a',
          acknowledgement: 'You practised all three examples.',
        },
        context,
      ),
    );
    data(harness.repository.save(state));
    const changed = structuredClone(state);
    item(item(changed.goals).submissions).acknowledgement = 'Replacement';
    expect(harness.repository.save(changed)).toEqual({
      ok: false,
      error: { code: 'invalid_transition' },
    });
    state = data(
      applyStudyCommand(state, { role: 'parent' }, { type: 'goal.give', id: 'goal-a' }, context),
    );
    data(harness.repository.save(state));
    expect(item(data(createStudyRepository(harness.storage).load('family-a')).goals)).toMatchObject(
      {
        prizeStatus: 'given',
        unlockedAt: context.now,
        givenAt: context.now,
      },
    );
  });
});
