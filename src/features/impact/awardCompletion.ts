import type {
  ChildSubmission,
  ImpactRecord,
  Mission,
  ParentConfirmation,
} from '../../models/prototype';
import type {
  ApproveCompletionRequest,
  CompletionAward,
  ServiceResult,
} from '../../services/interfaces';
import { transitionLifecycle } from '../missions/lifecycle';
import { quantitySchema } from '../missions/validation';
import { applyGhafAward, milestoneIdForStage } from '../ghaf-tree/progression';

export const DEMO_COMPLETION_PROGRESS_POINTS = 12;

function invalidInput(message: string): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function createConfirmation(
  mission: Mission,
  submission: ChildSubmission,
  confirmedQuantity: ApproveCompletionRequest['confirmedQuantity'],
): ParentConfirmation {
  return {
    id: `confirmation:${submission.id}`,
    missionId: mission.id,
    submissionId: submission.id,
    decision: 'approve',
    confirmedQuantity,
    retryMessage: null,
    awardKey: `${mission.id}:${submission.id}`,
  };
}

export function awardCompletion(
  request: ApproveCompletionRequest,
  existingRecords: readonly ImpactRecord[],
): ServiceResult<CompletionAward> {
  const awardKey = `${request.mission.id}:${request.submission.id}`;
  const existing = existingRecords.find((record) => record.awardKey === awardKey);

  if (existing) {
    const confirmation = createConfirmation(
      request.mission,
      request.submission,
      existing.rescuedQuantity,
    );
    return {
      ok: true,
      data: {
        alreadyApplied: true,
        confirmation,
        impactRecord: existing,
        impactSummary: request.currentSummary,
        ghaf: request.currentGhaf,
        celebration: {
          missionId: request.mission.id,
          awardKey,
          rescuedQuantity: existing.rescuedQuantity,
          awardedProgressPoints: existing.awardedProgressPoints,
          previousStage: request.currentGhaf.stage,
          currentStage: request.currentGhaf.stage,
          milestoneId: null,
          milestone: null,
          reward: request.mission.reward,
          origin: 'parent-estimate',
        },
      },
      meta: { origin: 'seeded', fallbackUsed: false },
    };
  }

  const transition = transitionLifecycle(request.mission.status, 'approve-completion');
  if (!transition.ok) return transition;
  if (!request.mission.approvedByParent) {
    return invalidInput('Completion requires a mission explicitly approved by a Parent');
  }
  if (
    request.submission.missionId !== request.mission.id ||
    request.submission.status !== 'awaiting-parent'
  ) {
    return invalidInput('Submission does not match an awaiting Parent-confirmation mission');
  }
  if (!quantitySchema.safeParse(request.confirmedQuantity).success) {
    return invalidInput('Confirmed rescued quantity is invalid');
  }

  const confirmation = createConfirmation(
    request.mission,
    request.submission,
    request.confirmedQuantity,
  );
  const impactRecord: ImpactRecord = {
    id: `impact:${awardKey}`,
    awardKey,
    missionId: request.mission.id,
    confirmationId: confirmation.id,
    rescuedQuantity: request.confirmedQuantity,
    awardedProgressPoints: DEMO_COMPLETION_PROGRESS_POINTS,
    origin: 'parent-estimate',
  };
  const impactSummary = {
    rescuedGrams:
      request.currentSummary.rescuedGrams +
      (request.confirmedQuantity.unit === 'grams' ? request.confirmedQuantity.value : 0),
    rescuedPortions:
      request.currentSummary.rescuedPortions +
      (request.confirmedQuantity.unit === 'portions' ? request.confirmedQuantity.value : 0),
    completedMissions: request.currentSummary.completedMissions + 1,
    streakDays: request.currentSummary.streakDays + 1,
  };
  const ghaf = applyGhafAward(request.currentGhaf, DEMO_COMPLETION_PROGRESS_POINTS);
  const crossedStage = ghaf.stage > request.currentGhaf.stage;

  return {
    ok: true,
    data: {
      alreadyApplied: false,
      confirmation,
      impactRecord,
      impactSummary,
      ghaf,
      celebration: {
        missionId: request.mission.id,
        awardKey,
        rescuedQuantity: request.confirmedQuantity,
        awardedProgressPoints: DEMO_COMPLETION_PROGRESS_POINTS,
        previousStage: request.currentGhaf.stage,
        currentStage: ghaf.stage,
        milestoneId: crossedStage ? milestoneIdForStage(ghaf.stage) : null,
        milestone: crossedStage ? ghaf.newMilestone : null,
        reward: request.mission.reward,
        origin: 'parent-estimate',
      },
    },
    meta: { origin: 'seeded', fallbackUsed: false },
  };
}

export function requestRetryWithoutAward(
  mission: Mission,
  submission: ChildSubmission,
): ServiceResult<{
  mission: Mission;
  submission: ChildSubmission;
  confirmation: ParentConfirmation;
}> {
  const transition = transitionLifecycle(mission.status, 'request-retry');
  if (!transition.ok) return transition;
  if (submission.missionId !== mission.id || submission.status !== 'awaiting-parent') {
    return invalidInput('Submission does not match the mission awaiting Parent confirmation');
  }

  const awardKey = `${mission.id}:${submission.id}`;
  return {
    ok: true,
    data: {
      mission: { ...mission, status: transition.data },
      submission: { ...submission, status: 'retry-requested' },
      confirmation: {
        id: `confirmation-retry:${submission.id}`,
        missionId: mission.id,
        submissionId: submission.id,
        decision: 'retry',
        confirmedQuantity: null,
        retryMessage: {
          ar: 'راجع المهمة مع وليّ أمرك وحاول مرة أخرى.',
          en: 'Review the adventure with your Parent and try again.',
        },
        awardKey,
      },
    },
    meta: { origin: 'seeded', fallbackUsed: false },
  };
}
