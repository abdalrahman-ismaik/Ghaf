import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DemoPrincipal } from '../../src/models/demoEntry';
import type { StudyCommand, StudyResult } from '../../src/models/study';

function data<T>(result: StudyResult<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.data;
}
async function fresh() {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', 'true');
  vi.resetModules();
  const { usePrototypeStore } = await import('../../src/state/usePrototypeStore');
  const { serviceRegistry } = await import('../../src/services');
  const state = usePrototypeStore.getState;
  const enter = (principal: DemoPrincipal) => {
    if (state().activeExperience !== 'signed_out')
      expect(state().signOutExperience().ok).toBe(true);
    expect(
      state().enterDemoExperience({
        principal,
        expectedGeneration: state().demoRunGeneration,
        expectedEpoch: state().demoEntryEpoch,
      }).ok,
    ).toBe(true);
    expect(state().initializeStudy().ok).toBe(true);
  };
  const send = (command: StudyCommand) => data(state().dispatchStudy(command));
  return { state, enter, send, serviceRegistry, usePrototypeStore };
}
const plan: StudyCommand = {
  type: 'plan.create',
  id: 'plan-one',
  childId: 'child_salem',
  input: {
    subject: 'Math',
    title: 'Equal groups',
    nextStep: 'Draw three equal groups',
    durationMinutes: 15,
    dueDate: null,
    revisitDate: '2026-10-01',
  },
};
const goal: StudyCommand = {
  type: 'goal.create',
  id: 'goal-one',
  childId: 'child_salem',
  input: {
    subject: 'Math',
    title: 'Our agreed mark',
    nextStep: 'Review worked examples',
    parentSupport: 'Read one example together',
    criterion: { kind: 'mark', threshold: 80, denominator: 100 },
    prize: { kind: 'experience', label: 'Choose a family museum visit' },
  },
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('private study store authority and handoffs', () => {
  it('clears orphan records before binding a new family with the same prepared timestamp', async () => {
    const run = await fresh();
    run.enter('parent_al_noor');
    run.send(plan);
    const oldFamily = run.state().localFamily.record;
    if (!oldFamily) throw new Error('Expected family');
    const { studyInstanceId: oldId, ...newFamily } = oldFamily;
    expect(run.serviceRegistry.localFamily.save(newFamily).ok).toBe(true);
    run.usePrototypeStore.setState({
      localFamily: { ...run.state().localFamily, record: newFamily },
    });
    expect(run.state().getStudy().ok).toBe(false);
    const clear = vi
      .spyOn(run.serviceRegistry.study, 'clear')
      .mockReturnValueOnce({ ok: false, error: { code: 'storage_clear' } });
    expect(run.state().initializeStudy().ok).toBe(false);
    expect(run.state().localFamily.record?.studyInstanceId).toBeUndefined();
    clear.mockRestore();
    expect(data(run.state().initializeStudy()).plans).toEqual([]);
    expect(run.state().localFamily.record?.createdAt).toBe(oldFamily.createdAt);
    expect(run.state().localFamily.record?.studyInstanceId).not.toBe(oldId);
  });
  it('requires real role-controller authority and projects only the active Child', async () => {
    const run = await fresh();
    expect(run.state().getStudy().ok).toBe(false);
    run.usePrototypeStore.setState({ role: 'parent', activeExperience: 'parent' });
    expect(run.state().dispatchStudy(plan).ok).toBe(false);
    run.usePrototypeStore.setState({ activeExperience: 'signed_out' });
    run.enter('parent_al_noor');
    run.send(plan);
    expect(run.state().dispatchStudy({ type: 'plan.accept', id: 'plan-one' }).ok).toBe(false);
    run.enter('child_alya');
    expect(data(run.state().getStudy()).plans).toEqual([]);
    expect(run.state().dispatchStudy({ type: 'plan.accept', id: 'plan-one' }).ok).toBe(false);
    expect(run.state().dispatchStudy({ ...plan, id: 'spoofed' }).ok).toBe(false);
    run.enter('child_salem');
    expect(data(run.state().getStudy()).plans).toHaveLength(1);
    run.send({ type: 'plan.accept', id: 'plan-one' });
    run.send({ type: 'plan.start', id: 'plan-one' });
    run.send({ type: 'plan.help', id: 'plan-one', request: 'together' });
    run.send({ type: 'plan.complete', id: 'plan-one' });
    run.enter('parent_al_noor');
    expect(data(run.state().getStudy()).plans[0]).toMatchObject({
      status: 'completed',
      helpRequest: 'together',
    });
  });

  it('agrees, retries a lower mark and fulfils one promise without altering progression', async () => {
    const run = await fresh();
    run.enter('parent_al_noor');
    const before = structuredClone({
      children: run.state().children,
      household: run.state().household,
      familyReward: run.state().familyReward,
      growth: run.state().growthJourney,
      league: run.state().privateLeague,
    });
    run.send(goal);
    run.send({ type: 'goal.approve', id: 'goal-one', expectedRevision: 1 });
    run.enter('child_salem');
    run.send({ type: 'goal.accept', id: 'goal-one', expectedRevision: 1 });
    run.send({
      type: 'goal.submit',
      id: 'goal-one',
      submissionId: 'first-report',
      result: { kind: 'mark', value: 70 },
    });
    expect(
      run.state().dispatchStudy({
        type: 'goal.confirm',
        id: 'goal-one',
        submissionId: 'first-report',
        acknowledgement: 'Reviewed the worked example',
      }).ok,
    ).toBe(false);
    run.enter('parent_al_noor');
    run.send({
      type: 'goal.confirm',
      id: 'goal-one',
      submissionId: 'first-report',
      acknowledgement: 'You checked the example and asked for help.',
    });
    expect(data(run.state().getStudy()).goals[0]).toMatchObject({
      status: 'active',
      prizeStatus: 'promised',
    });
    run.enter('child_salem');
    run.send({
      type: 'goal.submit',
      id: 'goal-one',
      submissionId: 'second-report',
      result: { kind: 'mark', value: 85 },
    });
    run.enter('parent_al_noor');
    const confirmation: StudyCommand = {
      type: 'goal.confirm',
      id: 'goal-one',
      submissionId: 'second-report',
      acknowledgement: 'You practised grouping and checked your answer.',
    };
    run.send(confirmation);
    run.send(confirmation);
    run.send({ type: 'goal.give', id: 'goal-one' });
    run.send({ type: 'goal.give', id: 'goal-one' });
    expect(data(run.state().getStudy()).goals[0]).toMatchObject({
      status: 'acknowledged',
      prizeStatus: 'given',
    });
    expect({
      children: run.state().children,
      household: run.state().household,
      familyReward: run.state().familyReward,
      growth: run.state().growthJourney,
      league: run.state().privateLeague,
    }).toEqual(before);
  });

  it('does not publish a failed write and preserves records until an authorized verified reset', async () => {
    const run = await fresh();
    run.enter('parent_al_noor');
    const revision = run.state().studyRevision;
    const write = vi
      .spyOn(run.serviceRegistry.study, 'save')
      .mockReturnValue({ ok: false, error: { code: 'storage_write' } });
    expect(run.state().dispatchStudy(plan)).toEqual({
      ok: false,
      error: { code: 'storage_write' },
    });
    expect(run.state().studyRevision).toBe(revision);
    expect(data(run.state().getStudy()).plans).toEqual([]);
    write.mockRestore();
    run.send(plan);
    const clear = vi
      .spyOn(run.serviceRegistry.study, 'clear')
      .mockReturnValue({ ok: false, error: { code: 'storage_clear' } });
    expect(run.state().resetDemo().ok).toBe(false);
    expect(run.state().demoResetFailed).toBe(true);
    expect(run.state().getStudy().ok).toBe(false);
    clear.mockRestore();
    const restarted = await fresh();
    restarted.enter('parent_al_noor');
    restarted.send(plan);
    expect(restarted.state().resetDemo().ok).toBe(true);
    expect(restarted.state().locale).toBe('ar');
    expect(restarted.state().activeExperience).toBe('signed_out');
    restarted.enter('parent_al_noor');
    expect(data(restarted.state().getStudy()).plans).toEqual([]);
  });
});
