import { describe, expect, it } from 'vitest';

import { transitionTaskLifecycle, ZERO_PERSISTENT_EFFECTS } from '../src/features/tasks/lifecycle';

const statuses = [
  'draft',
  'reviewed',
  'assigned',
  'chosen',
  'in_progress',
  'submitted',
  'retry',
  'confirmed',
  'recognized',
] as const;

const actions = [
  'review',
  'approve_assignment',
  'choose',
  'start',
  'submit',
  'request_retry',
  'resume_retry',
  'plan_confirmation',
  'apply_recognition',
] as const;

const validTransitions = new Map<string, (typeof statuses)[number]>([
  ['draft:review', 'reviewed'],
  ['reviewed:approve_assignment', 'assigned'],
  ['assigned:choose', 'chosen'],
  ['chosen:start', 'in_progress'],
  ['in_progress:submit', 'submitted'],
  ['submitted:request_retry', 'retry'],
  ['retry:resume_retry', 'in_progress'],
  ['submitted:plan_confirmation', 'confirmed'],
  ['confirmed:apply_recognition', 'recognized'],
]);

interface GuardOverrides {
  readonly taskIsValid?: boolean;
  readonly activeChildId?: 'child_salem' | 'child_alya';
  readonly assignedChildId?: 'child_salem' | 'child_alya';
  readonly taskVersion?: number;
  readonly assignmentTaskVersion?: number;
  readonly definitionAcknowledged?: boolean;
  readonly completionMode?: 'independent' | 'permitted_help';
  readonly helpUsed?: { readonly ar: string; readonly en: string } | null;
  readonly preparedMediaFixtureId?: string | null;
  readonly reflection?: { readonly ar: string; readonly en: string } | null;
  readonly praisePresented?: boolean;
}

function transition(
  current: (typeof statuses)[number],
  action: (typeof actions)[number],
  guardOverrides: GuardOverrides = {},
) {
  return transitionTaskLifecycle({
    current,
    action,
    guards: {
      taskIsValid: true,
      activeChildId: 'child_salem',
      assignedChildId: 'child_salem',
      taskVersion: 1,
      assignmentTaskVersion: 1,
      definitionAcknowledged: true,
      completionMode: 'independent',
      preparedMediaFixtureId: null,
      reflection: null,
      praisePresented: true,
      ...guardOverrides,
    },
  });
}

describe('Feature 003 task lifecycle', () => {
  it('allows exactly the documented transitions and rejects every skipped state', () => {
    for (const current of statuses) {
      for (const action of actions) {
        const expected = validTransitions.get(`${current}:${action}`);
        const result = transition(current, action);

        if (expected) {
          expect(result, `${current} + ${action}`).toMatchObject({
            ok: true,
            data: { lifecycle: expected, effects: ZERO_PERSISTENT_EFFECTS },
          });
        } else {
          expect(result, `${current} + ${action}`).toMatchObject({
            ok: false,
            error: { code: 'INVALID_TRANSITION' },
          });
        }
      }
    }
  });

  it('keeps choosing separate from starting and guards the assigned Child and task version', () => {
    expect(transition('assigned', 'choose')).toMatchObject({
      ok: true,
      data: { lifecycle: 'chosen' },
    });
    expect(transition('chosen', 'start')).toMatchObject({
      ok: true,
      data: { lifecycle: 'in_progress' },
    });
    expect(
      transition('assigned', 'choose', {
        activeChildId: 'child_alya',
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_ASSIGNED_CHILD' } });
    expect(
      transition('chosen', 'start', {
        assignmentTaskVersion: 2,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('requires the approved task version to remain valid through every downstream transition', () => {
    for (const [current, action] of [
      ['reviewed', 'approve_assignment'],
      ['assigned', 'choose'],
      ['chosen', 'start'],
      ['in_progress', 'submit'],
      ['submitted', 'request_retry'],
      ['retry', 'resume_retry'],
      ['submitted', 'plan_confirmation'],
      ['confirmed', 'apply_recognition'],
    ] as const) {
      expect(
        transition(current, action, { taskIsValid: false }),
        `${current} + ${action}`,
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    }
  });

  it('accepts permitted help with no media or reflection and still requires the definition', () => {
    expect(
      transition('in_progress', 'submit', {
        completionMode: 'permitted_help',
        helpUsed: { ar: 'بمساعدة شخص بالغ', en: 'With adult help' },
        preparedMediaFixtureId: null,
        reflection: null,
      }),
    ).toMatchObject({
      ok: true,
      data: { lifecycle: 'submitted', effects: ZERO_PERSISTENT_EFFECTS },
    });

    expect(
      transition('in_progress', 'submit', {
        definitionAcknowledged: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('makes retry and confirmation planning zero-loss, zero-reward transitions', () => {
    for (const [current, action] of [
      ['reviewed', 'approve_assignment'],
      ['assigned', 'choose'],
      ['chosen', 'start'],
      ['in_progress', 'submit'],
      ['submitted', 'request_retry'],
      ['retry', 'resume_retry'],
      ['submitted', 'plan_confirmation'],
    ] as const) {
      expect(transition(current, action)).toMatchObject({
        ok: true,
        data: { effects: ZERO_PERSISTENT_EFFECTS },
      });
    }

    expect(ZERO_PERSISTENT_EFFECTS).toEqual({
      seedDelta: 0,
      landscapeSeedDelta: 0,
      canopyLeafDelta: 0,
      circleActionDelta: 0,
    });
  });

  it('does not recognize until praise has been presented', () => {
    expect(
      transition('confirmed', 'apply_recognition', {
        praisePresented: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });
});
