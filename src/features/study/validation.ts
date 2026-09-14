import { z } from 'zod';

import {
  STUDY_RECORD_LIMIT,
  STUDY_SUBMISSION_LIMIT,
  type AcademicGoal,
  type StudyReportedResult,
  type StudyState,
} from '../../models/study';

const identifier = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_.:@/-]+$/);
const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const timestamp = z.string().datetime({ offset: true });
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });

export const studyPlanInputSchema = z.strictObject({
  subject: text(80),
  title: text(120),
  nextStep: text(300),
  durationMinutes: z.number().int().min(1).max(60),
  dueDate: date.nullable(),
  revisitDate: date.nullable(),
});

const criterion = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('practice_count'), target: z.number().int().min(1).max(1000) }),
  z.strictObject({ kind: z.literal('achievement'), description: text(300) }),
  z
    .strictObject({
      kind: z.literal('mark'),
      threshold: z.number().min(0).max(1000000),
      denominator: z.number().positive().max(1000000),
    })
    .refine((value) => value.threshold <= value.denominator),
]);

const academicGoalInputFields = z.strictObject({
  subject: text(80),
  title: text(120),
  nextStep: text(300),
  parentSupport: text(300),
  criterion,
  prize: z
    .strictObject({ kind: z.enum(['gift', 'experience', 'privilege']), label: text(160) })
    .nullable(),
  targetDate: date.nullable().default(null),
  reviewDate: date.nullable().default(null),
});

function validGoalDates(goal: Pick<AcademicGoal, 'targetDate' | 'reviewDate'>): boolean {
  return goal.targetDate === null || goal.reviewDate === null || goal.reviewDate >= goal.targetDate;
}

export const academicGoalInputSchema = academicGoalInputFields.refine(validGoalDates);

const reportedResult = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('practice_count'),
    count: z.number().int().min(0).max(1000000),
  }),
  z.strictObject({ kind: z.literal('achievement'), achieved: z.boolean() }),
  z.strictObject({ kind: z.literal('mark'), value: z.number().min(0).max(1000000) }),
]);
const helpRequest = z.enum(['explain', 'smaller_step', 'together']);
const revision = z.number().int().positive().max(10000);

const planSchema = studyPlanInputSchema
  .extend({
    id: identifier,
    childId: identifier,
    createdBy: z.enum(['parent', 'child']),
    status: z.enum(['proposed', 'planned', 'active', 'paused', 'completed']),
    helpRequest: helpRequest.nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp.nullable(),
  })
  .refine(
    (plan) =>
      (plan.status === 'completed') === (plan.completedAt !== null) &&
      !(plan.createdBy === 'child' && plan.status === 'proposed') &&
      Date.parse(plan.updatedAt) >= Date.parse(plan.createdAt) &&
      (plan.completedAt === null ||
        (Date.parse(plan.completedAt) >= Date.parse(plan.createdAt) &&
          Date.parse(plan.completedAt) <= Date.parse(plan.updatedAt))),
  );

export function resultMatchesCriterion(
  goal: Pick<AcademicGoal, 'criterion'>,
  result: StudyReportedResult,
): boolean {
  return (
    result.kind === goal.criterion.kind &&
    !(
      result.kind === 'mark' &&
      goal.criterion.kind === 'mark' &&
      result.value > goal.criterion.denominator
    )
  );
}

export function resultMeetsCriterion(
  goal: Pick<AcademicGoal, 'criterion'>,
  result: StudyReportedResult,
): boolean {
  if (goal.criterion.kind === 'practice_count' && result.kind === 'practice_count') {
    return result.count >= goal.criterion.target;
  }
  if (goal.criterion.kind === 'mark' && result.kind === 'mark') {
    return result.value >= goal.criterion.threshold;
  }
  return goal.criterion.kind === 'achievement' && result.kind === 'achievement' && result.achieved;
}

function validGoal(goal: AcademicGoal): boolean {
  const accepted = goal.childAcceptedRevision !== null;
  if (Date.parse(goal.updatedAt) < Date.parse(goal.createdAt)) return false;
  if (goal.parentApprovedRevision !== null && goal.parentApprovedRevision !== goal.revision)
    return false;
  if (
    accepted &&
    (goal.childAcceptedRevision !== goal.revision || goal.parentApprovedRevision !== goal.revision)
  )
    return false;
  if (
    ['active', 'paused', 'awaiting_confirmation', 'acknowledged'].includes(goal.status) &&
    !accepted
  )
    return false;
  if (['proposed', 'declined'].includes(goal.status) && accepted) return false;
  if (!accepted && goal.submissions.length > 0) return false;
  if ((goal.prize === null) !== (goal.prizeStatus === null)) return false;
  if ((goal.status === 'acknowledged') !== (goal.acknowledgedAt !== null)) return false;
  if (goal.prizeStatus === 'promised' && (goal.unlockedAt !== null || goal.givenAt !== null))
    return false;
  if (goal.prizeStatus === null && (goal.unlockedAt !== null || goal.givenAt !== null))
    return false;
  if (
    (goal.prizeStatus === 'unlocked' || goal.prizeStatus === 'given') &&
    (goal.status !== 'acknowledged' || goal.unlockedAt !== goal.acknowledgedAt)
  )
    return false;
  if ((goal.prizeStatus === 'given') !== (goal.givenAt !== null)) return false;
  if (
    goal.givenAt !== null &&
    goal.unlockedAt !== null &&
    (Date.parse(goal.givenAt) < Date.parse(goal.unlockedAt) ||
      Date.parse(goal.givenAt) > Date.parse(goal.updatedAt))
  )
    return false;
  if (new Set(goal.submissions.map((submission) => submission.id)).size !== goal.submissions.length)
    return false;
  let pending = 0;
  for (const [index, submission] of goal.submissions.entries()) {
    if (!resultMatchesCriterion(goal, submission.result)) return false;
    if (
      Date.parse(submission.submittedAt) < Date.parse(goal.createdAt) ||
      Date.parse(submission.submittedAt) > Date.parse(goal.updatedAt)
    )
      return false;
    if (submission.reviewedAt === null) {
      pending += 1;
      if (
        index !== goal.submissions.length - 1 ||
        submission.acknowledgement !== null ||
        submission.metCriterion !== null
      )
        return false;
    } else {
      if (
        submission.acknowledgement === null ||
        submission.metCriterion !== resultMeetsCriterion(goal, submission.result)
      )
        return false;
      if (
        Date.parse(submission.reviewedAt) < Date.parse(submission.submittedAt) ||
        Date.parse(submission.reviewedAt) > Date.parse(goal.updatedAt)
      )
        return false;
      if (
        submission.metCriterion &&
        (goal.status !== 'acknowledged' || goal.acknowledgedAt !== submission.reviewedAt)
      )
        return false;
    }
  }
  if ((goal.status === 'awaiting_confirmation') !== (pending === 1)) return false;
  const last = goal.submissions.at(-1);
  if (
    goal.status === 'acknowledged' &&
    (!last?.metCriterion || last.reviewedAt !== goal.acknowledgedAt)
  )
    return false;
  if (goal.prize !== null && goal.status === 'acknowledged' && goal.prizeStatus === 'promised')
    return false;
  return true;
}

const goalSchema = academicGoalInputFields
  .extend({
    id: identifier,
    childId: identifier,
    createdBy: z.enum(['parent', 'child']),
    status: z.enum([
      'proposed',
      'active',
      'paused',
      'awaiting_confirmation',
      'acknowledged',
      'declined',
      'change_requested',
    ]),
    revision,
    parentApprovedRevision: revision.nullable(),
    childAcceptedRevision: revision.nullable(),
    submissions: z
      .array(
        z.strictObject({
          id: identifier,
          result: reportedResult,
          submittedAt: timestamp,
          reviewedAt: timestamp.nullable(),
          acknowledgement: text(300).nullable(),
          metCriterion: z.boolean().nullable(),
        }),
      )
      .max(STUDY_SUBMISSION_LIMIT),
    prizeStatus: z.enum(['promised', 'unlocked', 'given']).nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
    acknowledgedAt: timestamp.nullable(),
    unlockedAt: timestamp.nullable(),
    givenAt: timestamp.nullable(),
  })
  .refine(validGoalDates)
  .refine(validGoal);

export const studyStateSchema: z.ZodType<StudyState> = z
  .strictObject({
    schemaVersion: z.literal(1),
    familyKey: identifier,
    plans: z.array(planSchema).max(STUDY_RECORD_LIMIT),
    goals: z.array(goalSchema).max(STUDY_RECORD_LIMIT),
  })
  .refine((state) => {
    const ids = [...state.plans, ...state.goals].map((record) => record.id);
    return new Set(ids).size === ids.length;
  });

export const studyActorSchema = z.discriminatedUnion('role', [
  z.strictObject({ role: z.literal('parent') }),
  z.strictObject({ role: z.literal('child'), childId: identifier }),
]);
export const studyContextSchema = z.strictObject({
  familyKey: identifier,
  childIds: z
    .array(identifier)
    .min(1)
    .max(20)
    .refine((ids) => new Set(ids).size === ids.length),
  now: timestamp,
});

export const studyCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('plan.create'),
    id: identifier,
    childId: identifier,
    input: studyPlanInputSchema,
  }),
  z.strictObject({
    type: z.enum([
      'plan.accept',
      'plan.start',
      'plan.pause',
      'plan.complete',
      'plan.help_resolved',
    ]),
    id: identifier,
  }),
  z.strictObject({ type: z.literal('plan.help'), id: identifier, request: helpRequest }),
  z.strictObject({ type: z.literal('plan.revisit'), id: identifier, date: date.nullable() }),
  z.strictObject({
    type: z.literal('goal.create'),
    id: identifier,
    childId: identifier,
    input: academicGoalInputSchema,
  }),
  z.strictObject({
    type: z.literal('goal.edit'),
    id: identifier,
    expectedRevision: revision,
    input: academicGoalInputSchema,
  }),
  z.strictObject({
    type: z.enum(['goal.approve', 'goal.accept']),
    id: identifier,
    expectedRevision: revision,
  }),
  z.strictObject({
    type: z.enum(['goal.decline', 'goal.request_change', 'goal.pause', 'goal.resume', 'goal.give']),
    id: identifier,
  }),
  z.strictObject({
    type: z.literal('goal.submit'),
    id: identifier,
    submissionId: identifier,
    result: reportedResult,
  }),
  z.strictObject({
    type: z.literal('goal.confirm'),
    id: identifier,
    submissionId: identifier,
    acknowledgement: text(300),
  }),
]);
