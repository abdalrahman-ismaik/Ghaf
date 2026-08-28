import type {
  CompletionMode,
  DomainErrorCode,
  DomainResult,
  LocalizedText,
  SyntheticChildId,
  TaskLifecycleStatus,
} from '../../models/familyGrowth';

export const ZERO_PERSISTENT_EFFECTS = Object.freeze({
  seedDelta: 0,
  landscapeSeedDelta: 0,
  canopyLeafDelta: 0,
  circleActionDelta: 0,
});

export type TaskLifecycleAction =
  | 'review'
  | 'approve_assignment'
  | 'choose'
  | 'start'
  | 'submit'
  | 'request_retry'
  | 'resume_retry'
  | 'plan_confirmation'
  | 'apply_recognition';

export interface TaskLifecycleGuards {
  readonly taskIsValid: boolean;
  readonly activeChildId: SyntheticChildId;
  readonly assignedChildId: SyntheticChildId;
  readonly taskVersion: number;
  readonly assignmentTaskVersion: number;
  readonly definitionAcknowledged: boolean;
  readonly completionMode: CompletionMode;
  readonly helpUsed?: LocalizedText | null;
  readonly preparedMediaFixtureId: string | null;
  readonly reflection: LocalizedText | null;
  readonly praisePresented: boolean;
}

export interface TaskLifecycleTransitionInput {
  readonly current: TaskLifecycleStatus;
  readonly action: TaskLifecycleAction;
  readonly guards: TaskLifecycleGuards;
}

export interface TaskLifecycleTransition {
  readonly lifecycle: TaskLifecycleStatus;
  /** The lifecycle guard never mutates persistent progress; recognition commits elsewhere. */
  readonly effects: typeof ZERO_PERSISTENT_EFFECTS;
}

const TRANSITIONS: Readonly<
  Partial<Record<TaskLifecycleStatus, Partial<Record<TaskLifecycleAction, TaskLifecycleStatus>>>>
> = {
  draft: { review: 'reviewed' },
  reviewed: { approve_assignment: 'assigned' },
  assigned: { choose: 'chosen' },
  chosen: { start: 'in_progress' },
  in_progress: { submit: 'submitted' },
  submitted: { request_retry: 'retry', plan_confirmation: 'confirmed' },
  retry: { resume_retry: 'in_progress' },
  confirmed: { apply_recognition: 'recognized' },
};

function failure(code: DomainErrorCode, message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export function transitionTaskLifecycle(
  input: TaskLifecycleTransitionInput,
): DomainResult<TaskLifecycleTransition> {
  const next = TRANSITIONS[input.current]?.[input.action];
  if (!next) {
    return failure('INVALID_TRANSITION', `${input.current} cannot perform ${input.action}`);
  }

  if (!input.guards.taskIsValid) {
    return failure('INVALID_INPUT', 'The approved task version must pass validation');
  }

  if (
    ['choose', 'start', 'submit'].includes(input.action) &&
    input.guards.activeChildId !== input.guards.assignedChildId
  ) {
    return failure('NOT_ASSIGNED_CHILD', 'This assignment belongs to another synthetic Child');
  }

  if (
    [
      'approve_assignment',
      'choose',
      'start',
      'submit',
      'request_retry',
      'resume_retry',
      'plan_confirmation',
      'apply_recognition',
    ].includes(input.action) &&
    input.guards.taskVersion !== input.guards.assignmentTaskVersion
  ) {
    return failure('INVALID_TRANSITION', 'The assignment task version no longer matches');
  }

  if (input.action === 'submit') {
    if (!input.guards.definitionAcknowledged) {
      return failure('INVALID_INPUT', 'The approved definition of done must be acknowledged');
    }
    if (!['independent', 'permitted_help'].includes(input.guards.completionMode)) {
      return failure('INVALID_INPUT', 'Completion mode is invalid');
    }
  }

  if (input.action === 'apply_recognition' && !input.guards.praisePresented) {
    return failure('INVALID_TRANSITION', 'Praise must be visibly presented first');
  }

  return {
    ok: true,
    data: { lifecycle: next, effects: ZERO_PERSISTENT_EFFECTS },
  };
}
