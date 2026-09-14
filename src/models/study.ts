export type StudyErrorCode =
  | 'invalid_input'
  | 'forbidden'
  | 'not_found'
  | 'invalid_transition'
  | 'stale_revision'
  | 'limit_reached'
  | 'storage_read'
  | 'storage_write'
  | 'storage_clear'
  | 'corrupt_data'
  | 'family_mismatch';

export type StudyResult<T> = { ok: true; data: T } | { ok: false; error: { code: StudyErrorCode } };
export type StudyActor = { role: 'parent' } | { role: 'child'; childId: string };
export interface StudyContext {
  familyKey: string;
  childIds: readonly string[];
  now: string;
}

export type StudyHelpRequest = 'explain' | 'smaller_step' | 'together';
export interface StudyPlanInput {
  subject: string;
  title: string;
  nextStep: string;
  durationMinutes: number;
  dueDate: string | null;
  revisitDate: string | null;
}
export interface StudyPlan extends StudyPlanInput {
  id: string;
  childId: string;
  createdBy: 'parent' | 'child';
  status: 'proposed' | 'planned' | 'active' | 'paused' | 'completed';
  helpRequest: StudyHelpRequest | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type StudyCriterion =
  | { kind: 'practice_count'; target: number }
  | { kind: 'achievement'; description: string }
  | { kind: 'mark'; threshold: number; denominator: number };
export type StudyReportedResult =
  | { kind: 'practice_count'; count: number }
  | { kind: 'achievement'; achieved: boolean }
  | { kind: 'mark'; value: number };
export interface StudyPrize {
  kind: 'gift' | 'experience' | 'privilege';
  label: string;
}
export interface AcademicGoalInput {
  subject: string;
  title: string;
  nextStep: string;
  parentSupport: string;
  criterion: StudyCriterion;
  prize: StudyPrize | null;
}
export interface StudySubmission {
  id: string;
  result: StudyReportedResult;
  submittedAt: string;
  reviewedAt: string | null;
  acknowledgement: string | null;
  metCriterion: boolean | null;
}
export interface AcademicGoal extends AcademicGoalInput {
  id: string;
  childId: string;
  createdBy: 'parent' | 'child';
  status:
    | 'proposed'
    | 'active'
    | 'paused'
    | 'awaiting_confirmation'
    | 'acknowledged'
    | 'declined'
    | 'change_requested';
  revision: number;
  parentApprovedRevision: number | null;
  childAcceptedRevision: number | null;
  submissions: StudySubmission[];
  prizeStatus: 'promised' | 'unlocked' | 'given' | null;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  unlockedAt: string | null;
  givenAt: string | null;
}
export interface StudyState {
  schemaVersion: 1;
  familyKey: string;
  plans: StudyPlan[];
  goals: AcademicGoal[];
}

export type StudyCommand =
  | { type: 'plan.create'; id: string; childId: string; input: StudyPlanInput }
  | {
      type: 'plan.accept' | 'plan.start' | 'plan.pause' | 'plan.complete' | 'plan.help_resolved';
      id: string;
    }
  | { type: 'plan.help'; id: string; request: StudyHelpRequest }
  | { type: 'plan.revisit'; id: string; date: string | null }
  | { type: 'goal.create'; id: string; childId: string; input: AcademicGoalInput }
  | { type: 'goal.edit'; id: string; expectedRevision: number; input: AcademicGoalInput }
  | { type: 'goal.approve' | 'goal.accept'; id: string; expectedRevision: number }
  | {
      type: 'goal.decline' | 'goal.request_change' | 'goal.pause' | 'goal.resume' | 'goal.give';
      id: string;
    }
  | { type: 'goal.submit'; id: string; submissionId: string; result: StudyReportedResult }
  | { type: 'goal.confirm'; id: string; submissionId: string; acknowledgement: string };

export const STUDY_STORAGE_KEY = 'ghaf.study.v1';
export const STUDY_RECORD_LIMIT = 100;
export const STUDY_SUBMISSION_LIMIT = 30;
