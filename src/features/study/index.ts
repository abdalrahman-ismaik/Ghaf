import {
  STUDY_RECORD_LIMIT,
  STUDY_SUBMISSION_LIMIT,
  type AcademicGoal,
  type StudyActor,
  type StudyCommand,
  type StudyContext,
  type StudyErrorCode,
  type StudyPlan,
  type StudyResult,
  type StudyState,
} from '../../models/study';
import {
  resultMatchesCriterion,
  resultMeetsCriterion,
  studyActorSchema,
  studyCommandSchema,
  studyContextSchema,
  studyStateSchema,
} from './validation';

export type * from '../../models/study';

export function studyFailure(code: StudyErrorCode): StudyResult<never> {
  return { ok: false, error: { code } };
}

export function createEmptyStudyState(familyKey: string): StudyState {
  return { schemaVersion: 1, familyKey, plans: [], goals: [] };
}

function canAccessChild(actor: StudyActor, childId: string, context: StudyContext): boolean {
  return (
    context.childIds.includes(childId) && (actor.role === 'parent' || actor.childId === childId)
  );
}

function mutatePlan(
  plan: StudyPlan,
  actor: StudyActor,
  command: StudyCommand,
  now: string,
): StudyErrorCode | null {
  if (command.type === 'plan.help_resolved') {
    if (actor.role !== 'parent') return 'forbidden';
    if (plan.helpRequest === null) return null;
    plan.helpRequest = null;
    plan.updatedAt = now;
    return null;
  }
  if (actor.role !== 'child') return 'forbidden';
  switch (command.type) {
    case 'plan.accept':
      if (plan.status === 'planned') return null;
      if (plan.status !== 'proposed') return 'invalid_transition';
      plan.status = 'planned';
      break;
    case 'plan.start':
      if (plan.status === 'active') return null;
      if (plan.status !== 'planned' && plan.status !== 'paused') return 'invalid_transition';
      plan.status = 'active';
      break;
    case 'plan.pause':
      if (plan.status === 'paused') return null;
      if (plan.status !== 'planned' && plan.status !== 'active') return 'invalid_transition';
      plan.status = 'paused';
      break;
    case 'plan.complete':
      if (plan.status === 'completed') return null;
      if (plan.status === 'proposed') return 'invalid_transition';
      plan.status = 'completed';
      plan.completedAt = now;
      break;
    case 'plan.help':
      plan.helpRequest = command.request;
      break;
    case 'plan.revisit':
      plan.revisitDate = command.date;
      break;
    default:
      return 'invalid_input';
  }
  plan.updatedAt = now;
  return null;
}

function mutateGoal(
  goal: AcademicGoal,
  actor: StudyActor,
  command: StudyCommand,
  now: string,
): StudyErrorCode | null {
  switch (command.type) {
    case 'goal.edit':
      if (command.expectedRevision !== goal.revision) return 'stale_revision';
      if (goal.childAcceptedRevision !== null) return 'invalid_transition';
      if (goal.revision >= 10000) return 'limit_reached';
      Object.assign(goal, command.input);
      goal.revision += 1;
      goal.parentApprovedRevision = null;
      goal.childAcceptedRevision = null;
      goal.prizeStatus = goal.prize === null ? null : 'promised';
      goal.status = 'proposed';
      break;
    case 'goal.approve':
      if (actor.role !== 'parent') return 'forbidden';
      if (command.expectedRevision !== goal.revision) return 'stale_revision';
      if (goal.parentApprovedRevision === goal.revision) return null;
      if (goal.status !== 'proposed') return 'invalid_transition';
      goal.parentApprovedRevision = goal.revision;
      break;
    case 'goal.accept':
      if (actor.role !== 'child') return 'forbidden';
      if (command.expectedRevision !== goal.revision) return 'stale_revision';
      if (goal.childAcceptedRevision === goal.revision) return null;
      if (goal.status !== 'proposed' || goal.parentApprovedRevision !== goal.revision)
        return 'invalid_transition';
      goal.childAcceptedRevision = goal.revision;
      goal.status = 'active';
      break;
    case 'goal.decline':
      if (actor.role !== 'child') return 'forbidden';
      if (goal.status === 'declined') return null;
      if (goal.childAcceptedRevision !== null) return 'invalid_transition';
      goal.status = 'declined';
      goal.parentApprovedRevision = null;
      break;
    case 'goal.request_change':
      if (actor.role !== 'child') return 'forbidden';
      if (goal.status === 'change_requested') return null;
      if (goal.status === 'acknowledged' || goal.status === 'awaiting_confirmation')
        return 'invalid_transition';
      goal.status = 'change_requested';
      if (goal.childAcceptedRevision === null) goal.parentApprovedRevision = null;
      break;
    case 'goal.pause':
      if (actor.role !== 'child') return 'forbidden';
      if (goal.status === 'paused') return null;
      if (goal.status !== 'active') return 'invalid_transition';
      goal.status = 'paused';
      break;
    case 'goal.resume':
      if (actor.role !== 'child') return 'forbidden';
      if (goal.status === 'active') return null;
      if (
        goal.childAcceptedRevision !== goal.revision ||
        (goal.status !== 'paused' && goal.status !== 'change_requested')
      )
        return 'invalid_transition';
      goal.status = 'active';
      break;
    case 'goal.submit': {
      if (actor.role !== 'child') return 'forbidden';
      const existing = goal.submissions.find(
        (submission) => submission.id === command.submissionId,
      );
      if (existing) {
        return JSON.stringify(existing.result) === JSON.stringify(command.result)
          ? null
          : 'invalid_input';
      }
      if (goal.status !== 'active' || goal.childAcceptedRevision !== goal.revision)
        return 'invalid_transition';
      if (!resultMatchesCriterion(goal, command.result)) return 'invalid_input';
      if (goal.submissions.length >= STUDY_SUBMISSION_LIMIT) return 'limit_reached';
      goal.submissions.push({
        id: command.submissionId,
        result: command.result,
        submittedAt: now,
        reviewedAt: null,
        acknowledgement: null,
        metCriterion: null,
      });
      goal.status = 'awaiting_confirmation';
      break;
    }
    case 'goal.confirm': {
      if (actor.role !== 'parent') return 'forbidden';
      const submission = goal.submissions.find((entry) => entry.id === command.submissionId);
      if (!submission) return 'not_found';
      if (submission.reviewedAt !== null) return null;
      if (goal.status !== 'awaiting_confirmation') return 'invalid_transition';
      submission.reviewedAt = now;
      submission.acknowledgement = command.acknowledgement;
      submission.metCriterion = resultMeetsCriterion(goal, submission.result);
      goal.status = submission.metCriterion ? 'acknowledged' : 'active';
      if (submission.metCriterion) {
        goal.acknowledgedAt = now;
        if (goal.prize !== null) {
          goal.prizeStatus = 'unlocked';
          goal.unlockedAt = now;
        }
      }
      break;
    }
    case 'goal.give':
      if (actor.role !== 'parent') return 'forbidden';
      if (goal.prizeStatus === 'given') return null;
      if (goal.prizeStatus !== 'unlocked' || goal.status !== 'acknowledged')
        return 'invalid_transition';
      goal.prizeStatus = 'given';
      goal.givenAt = now;
      break;
    default:
      return 'invalid_input';
  }
  goal.updatedAt = now;
  return null;
}

export function applyStudyCommand(
  state: StudyState,
  actor: StudyActor,
  command: StudyCommand,
  context: StudyContext,
): StudyResult<StudyState> {
  const parsedState = studyStateSchema.safeParse(state);
  if (!parsedState.success) return studyFailure('corrupt_data');
  const parsedActor = studyActorSchema.safeParse(actor);
  const parsedContext = studyContextSchema.safeParse(context);
  const parsedCommand = studyCommandSchema.safeParse(command);
  if (!parsedActor.success || !parsedContext.success || !parsedCommand.success)
    return studyFailure('invalid_input');
  const next = parsedState.data;
  const currentActor = parsedActor.data;
  const action = parsedCommand.data;
  const currentContext = parsedContext.data;
  if (next.familyKey !== currentContext.familyKey) return studyFailure('family_mismatch');
  if (currentActor.role === 'child' && !currentContext.childIds.includes(currentActor.childId))
    return studyFailure('forbidden');
  const { now } = currentContext;

  if (action.type === 'plan.create' || action.type === 'goal.create') {
    if (!canAccessChild(currentActor, action.childId, currentContext))
      return studyFailure('forbidden');
    if ([...next.plans, ...next.goals].some((record) => record.id === action.id))
      return studyFailure('invalid_input');
    if (action.type === 'plan.create') {
      if (next.plans.length >= STUDY_RECORD_LIMIT) return studyFailure('limit_reached');
      next.plans.push({
        ...action.input,
        id: action.id,
        childId: action.childId,
        createdBy: currentActor.role,
        status: currentActor.role === 'parent' ? 'proposed' : 'planned',
        helpRequest: null,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      });
    } else {
      if (next.goals.length >= STUDY_RECORD_LIMIT) return studyFailure('limit_reached');
      next.goals.push({
        ...action.input,
        id: action.id,
        childId: action.childId,
        createdBy: currentActor.role,
        status: 'proposed',
        revision: 1,
        parentApprovedRevision: null,
        childAcceptedRevision: null,
        submissions: [],
        prizeStatus: action.input.prize === null ? null : 'promised',
        createdAt: now,
        updatedAt: now,
        acknowledgedAt: null,
        unlockedAt: null,
        givenAt: null,
      });
    }
  } else {
    const record = action.type.startsWith('plan.')
      ? next.plans.find((plan) => plan.id === action.id)
      : next.goals.find((goal) => goal.id === action.id);
    if (!record) return studyFailure('not_found');
    if (!canAccessChild(currentActor, record.childId, currentContext))
      return studyFailure('forbidden');
    if (Date.parse(now) < Date.parse(record.updatedAt)) return studyFailure('invalid_input');
    const error = action.type.startsWith('plan.')
      ? mutatePlan(record as StudyPlan, currentActor, action, now)
      : mutateGoal(record as AcademicGoal, currentActor, action, now);
    if (error !== null) return studyFailure(error);
  }
  const validated = studyStateSchema.safeParse(next);
  return validated.success
    ? { ok: true, data: validated.data }
    : studyFailure('invalid_transition');
}
