import { createEmptyStudyState, studyFailure } from '../../features/study';
import { studyStateSchema } from '../../features/study/validation';
import {
  STUDY_STORAGE_KEY,
  type AcademicGoal,
  type StudyResult,
  type StudyState,
} from '../../models/study';
import type { LocalKeyValueStorage } from './storageTypes';

export interface StudyRepository {
  load(familyKey: string): StudyResult<StudyState>;
  save(state: StudyState): StudyResult<StudyState>;
  clear(): StudyResult<true>;
}

const MAX_STUDY_STORAGE_LENGTH = 1000000;

function agreedTerms(goal: AcademicGoal): string {
  return JSON.stringify({
    subject: goal.subject,
    title: goal.title,
    nextStep: goal.nextStep,
    parentSupport: goal.parentSupport,
    criterion: goal.criterion,
    prize: goal.prize,
    targetDate: goal.targetDate,
    reviewDate: goal.reviewDate,
    revision: goal.revision,
    parentApprovedRevision: goal.parentApprovedRevision,
    childAcceptedRevision: goal.childAcceptedRevision,
  });
}

function preservesEvidence(previous: StudyState, next: StudyState): boolean {
  for (const plan of previous.plans) {
    const replacement = next.plans.find((entry) => entry.id === plan.id);
    if (
      !replacement ||
      replacement.childId !== plan.childId ||
      replacement.createdAt !== plan.createdAt ||
      replacement.createdBy !== plan.createdBy ||
      Date.parse(replacement.updatedAt) < Date.parse(plan.updatedAt)
    )
      return false;
    if (plan.completedAt !== null && replacement.completedAt !== plan.completedAt) return false;
  }
  for (const goal of previous.goals) {
    const replacement = next.goals.find((entry) => entry.id === goal.id);
    if (
      !replacement ||
      replacement.childId !== goal.childId ||
      replacement.createdAt !== goal.createdAt ||
      replacement.createdBy !== goal.createdBy ||
      Date.parse(replacement.updatedAt) < Date.parse(goal.updatedAt)
    )
      return false;
    if (goal.childAcceptedRevision !== null && agreedTerms(goal) !== agreedTerms(replacement))
      return false;
    if (goal.unlockedAt !== null && replacement.unlockedAt !== goal.unlockedAt) return false;
    if (goal.givenAt !== null && replacement.givenAt !== goal.givenAt) return false;
    for (const submission of goal.submissions) {
      const retained = replacement.submissions.find((entry) => entry.id === submission.id);
      if (
        !retained ||
        retained.submittedAt !== submission.submittedAt ||
        JSON.stringify(retained.result) !== JSON.stringify(submission.result)
      )
        return false;
      if (submission.reviewedAt !== null && JSON.stringify(retained) !== JSON.stringify(submission))
        return false;
    }
  }
  return true;
}

export function createStudyRepository(storage: LocalKeyValueStorage): StudyRepository {
  const read = (): StudyResult<StudyState | null> => {
    let raw: string | null;
    try {
      raw = storage.getItem(STUDY_STORAGE_KEY);
    } catch {
      return studyFailure('storage_read');
    }
    if (raw === null) return { ok: true, data: null };
    if (raw.length > MAX_STUDY_STORAGE_LENGTH) return studyFailure('corrupt_data');
    try {
      const parsed = studyStateSchema.safeParse(JSON.parse(raw));
      return parsed.success ? { ok: true, data: parsed.data } : studyFailure('corrupt_data');
    } catch {
      return studyFailure('corrupt_data');
    }
  };
  return {
    load(familyKey) {
      const empty = studyStateSchema.safeParse(createEmptyStudyState(familyKey));
      if (!empty.success) return studyFailure('invalid_input');
      const previous = read();
      if (!previous.ok) return previous;
      if (previous.data === null) return { ok: true, data: empty.data };
      if (previous.data.familyKey !== familyKey) return studyFailure('family_mismatch');
      return { ok: true, data: previous.data };
    },
    save(state) {
      const candidate = studyStateSchema.safeParse(state);
      if (!candidate.success) return studyFailure('invalid_input');
      const previous = read();
      if (!previous.ok) return previous;
      if (previous.data !== null) {
        if (previous.data.familyKey !== candidate.data.familyKey)
          return studyFailure('family_mismatch');
        if (!preservesEvidence(previous.data, candidate.data))
          return studyFailure('invalid_transition');
      }
      const serialized = JSON.stringify(candidate.data);
      if (serialized.length > MAX_STUDY_STORAGE_LENGTH) return studyFailure('limit_reached');
      try {
        storage.setItem(STUDY_STORAGE_KEY, serialized);
        if (storage.getItem(STUDY_STORAGE_KEY) !== serialized) return studyFailure('storage_write');
      } catch {
        return studyFailure('storage_write');
      }
      return { ok: true, data: candidate.data };
    },
    clear() {
      try {
        storage.removeItem(STUDY_STORAGE_KEY);
        if (storage.getItem(STUDY_STORAGE_KEY) !== null) return studyFailure('storage_clear');
        return { ok: true, data: true };
      } catch {
        return studyFailure('storage_clear');
      }
    },
  };
}
