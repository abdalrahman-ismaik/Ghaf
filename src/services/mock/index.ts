import {
  evaluateAssistantSafety,
  applyLocalSummaryCorrection,
  validateChildCoachRequest,
  validateParentGuideIntent,
  validateParentSummary,
} from '../../features/assistants/policy';
import {
  adaptPreparedCoachResult,
  coachOutputPolicyForAgeBand,
} from '../../features/assistants/ageAdaptation';
import {
  createIdleVoiceSession,
  deleteVoiceTranscript,
  replayVoiceTranscript,
  resetVoiceSession,
  sendVoiceTranscript,
  setVoicePlayback,
  startVoiceSession,
  stopVoiceSessionWithPreparedTranscript,
} from '../../features/assistants/voiceSession';
import { P0_APPROVED_COACH_BINDING } from '../../features/assistants/preparedContent';
import { DeterministicSyntheticAccessService } from '../../features/access';
import {
  createFamilyRewardPlan,
  evaluateFamilyRewardPlan,
  markFamilyRewardGiven,
  projectFamilyRewardPlan,
  reviseFamilyRewardPlan,
  summarizeMonthlyMonetaryCommitments,
} from '../../features/family-rewards';
import {
  calculateWeeklyGrowthResults,
  confirmChallengeLeaf,
  createFamilyLeagueWeek,
  evaluateChallengeLeafEligibility,
  projectLeagueParticipants,
  rolloverFamilyLeagueWeek,
  sendPreparedEncouragement,
  SYNTHETIC_LEAGUE_PARTICIPANTS,
} from '../../features/league';
import {
  applyCanopy,
  applyCircle,
  planAfterConfirmation,
  validateEligibilityContext,
} from '../../features/circle/projection';
import {
  nextThresholdForSeeds,
  planLandscapeGrowth,
  stageForSeeds,
} from '../../features/garden/progression';
import {
  evaluateRecognitionPolicy,
  recognitionKeyForSubmission,
} from '../../features/rewards/policy';
import {
  P0_EXECUTABLE_CHOICE,
  P0_RECYCLING_TEMPLATE,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '../../features/tasks/demoContent';
import { transitionTaskLifecycle } from '../../features/tasks/lifecycle';
import {
  matchesCanonicalP0TaskContent,
  validateOptionalTaskReflection,
  validateTaskForReview,
  validateTaskTemplate,
} from '../../features/tasks/validation';
import type {
  AdaptCoachResultInput,
  AgeAdaptedCoachResult,
  ChildCoachOutputPolicy,
  CreateVoiceSessionInput,
  StopVoiceSessionInput,
  SyntheticVoiceSession,
  VoiceAccessContext,
  VoicePlaybackInput,
} from '../../models/assistantVoice';
import type { ParentCapability, SensitiveActionPurpose } from '../../models/access';
import type {
  FamilyRewardErrorCode,
  FamilyRewardEvaluationOptions,
  FamilyRewardPlan,
  FamilyRewardPlanDraft,
  FamilyRewardResult,
  GiveFamilyRewardInput,
  ReviseFamilyRewardPlanInput,
} from '../../models/familyReward';
import type {
  ChallengeLeafCandidate,
  ConfirmChallengeLeafInput,
  CreateLeagueWeekInput,
  FamilyLeagueWeek,
  LeagueEncouragementRequest,
  LeagueRolloverInput,
  PreparedEncouragement,
  PreparedEncouragementApplication,
  SyntheticLeagueParticipant,
} from '../../models/familyLeague';
import type {
  ActiveCoachContext,
  AssignmentApprovalResult,
  CheckInRouteState,
  ChildCoachRequest,
  ChildCoachResult,
  ConfirmationAttempt,
  DomainErrorCode,
  DomainResult,
  LocalizedText,
  ParentGuideRequest,
  ParentGuideTaskSuggestion,
  ParentPatternSummary,
  ParentSummaryCorrection,
  ParentSummaryCorrectionAttempt,
  PendingConfirmationPlan,
  PraisePresentationAction,
  PraisePresentedPlan,
  PreparedMediaFixture,
  PreparedMediaResult,
  ProjectionEligibilityContext,
  ProjectionPlan,
  PrototypeSession,
  RecognitionAttemptResult,
  RecognitionContinuationAction,
  RecognitionReceipt,
  ResetResult,
  Task,
  TaskJourney,
  TaskReviewResult,
  TaskTemplate,
} from '../../models/familyGrowth';
import type {
  CoachAdaptationService,
  FamilyLeagueService,
  FamilyRewardService,
  FamilyProjectionService,
  Feature003ServiceRegistry,
  GardenService,
  MediaService,
  ParentGuideService,
  ParentSummaryPolicy,
  PreparedChildCoachProvider,
  PreparedParentGuideProvider,
  PrototypeSessionService,
  RecognitionService,
  ServiceMeta,
  ServiceResult,
  SessionAuthorityInput,
  SyntheticVoiceService,
  SyntheticAccessService,
  TaskService,
} from '../interfaces';
import {
  CHILD_COACH_FIXTURE,
  createInitialPrototypeSession,
  FEATURE_003_TIMESTAMP,
  PARENT_GUIDE_FIXTURE,
  PARENT_SUMMARY_FIXTURE,
  PREPARED_PRAISE,
  PREPARED_MEDIA_FIXTURES,
} from './fixtures';

export { DeterministicSyntheticAccessService };

const PREPARED_META: ServiceMeta = { origin: 'prepared', fallbackUsed: false };
const SYNTHETIC_META: ServiceMeta = { origin: 'synthetic', fallbackUsed: false };

function success<T>(data: T, meta: ServiceMeta = SYNTHETIC_META): ServiceResult<T> {
  return { ok: true, data, meta };
}

function failure(
  code: DomainErrorCode,
  message: string,
  options: { readonly retryable?: boolean; readonly fallbackAvailable?: boolean } = {},
): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: options.retryable ?? false,
      fallbackAvailable: options.fallbackAvailable ?? false,
    },
  };
}

function fromDomain<T>(
  result: DomainResult<T>,
  meta: ServiceMeta = SYNTHETIC_META,
): ServiceResult<T> {
  return result.ok ? success(result.data, meta) : { ok: false, error: result.error };
}

function familyRewardErrorCode(code: FamilyRewardErrorCode): DomainErrorCode {
  switch (code) {
    case 'PROTECTED_ACTIVITY':
      return 'SAFETY_REJECTED';
    case 'WRONG_CHILD':
    case 'NOT_AUTHORIZED':
      return 'PRIVACY_REJECTED';
    case 'PREREQUISITE_NOT_MET':
    case 'IMMUTABLE_UNLOCKED_PLAN':
    case 'STALE_VERSION':
      return 'INVALID_TRANSITION';
    case 'INVALID_INPUT':
    case 'INVALID_TRANSITION':
      return code;
  }
}

function fromFamilyReward<T>(result: FamilyRewardResult<T>): ServiceResult<T> {
  return result.ok
    ? success(result.data)
    : failure(familyRewardErrorCode(result.error.code), result.error.message);
}

function nonEmptyLocalized(value: LocalizedText): boolean {
  return value.ar.trim().length > 0 && value.en.trim().length > 0;
}

function lifecycleGuards(journey: TaskJourney, praisePresented = false) {
  return {
    taskIsValid: validateTaskForReview(journey.task).ok,
    activeChildId: journey.assignment?.childId ?? journey.task.targetChildId,
    assignedChildId: journey.assignment?.childId ?? journey.task.targetChildId,
    taskVersion: journey.task.version,
    assignmentTaskVersion: journey.assignment?.taskVersion ?? journey.task.version,
    definitionAcknowledged: journey.submission?.definitionAcknowledged ?? true,
    completionMode: journey.submission?.completionMode ?? ('independent' as const),
    helpUsed: journey.submission?.helpUsed ?? null,
    preparedMediaFixtureId: journey.submission?.preparedMediaFixtureId ?? null,
    reflection: journey.submission?.reflection ?? null,
    praisePresented,
  };
}

function validateApprovedJourneyLinks(journey: TaskJourney): ServiceResult<TaskJourney> {
  const assignment = journey.assignment;
  if (!assignment || assignment.approvedByParent !== true) {
    return failure('INVALID_TRANSITION', 'A Parent-approved assignment is required');
  }
  const validatedTask = validateTaskForReview(journey.task);
  if (!validatedTask.ok) return { ok: false, error: validatedTask.error };
  if (
    assignment.taskId !== journey.task.id ||
    assignment.taskVersion !== journey.task.version ||
    assignment.childId !== journey.task.targetChildId
  ) {
    return failure(
      'INVALID_TRANSITION',
      'The assignment no longer matches the approved task, Child, and version',
    );
  }
  if (
    journey.submission &&
    (journey.submission.assignmentId !== assignment.id ||
      journey.submission.taskVersion !== journey.task.version)
  ) {
    return failure('INVALID_RESPONSE', 'The submission no longer matches its approved assignment');
  }
  return success(journey);
}

function cloneTemplate(template: TaskTemplate): TaskTemplate {
  return {
    ...template,
    title: { ...template.title },
    positiveAction: { ...template.positiveAction },
    whyItMatters: { ...template.whyItMatters },
    definitionOfDone: { ...template.definitionOfDone },
    childAgeBands: [...template.childAgeBands],
    estimatedEffort: { ...template.estimatedEffort },
    permittedHelp: { ...template.permittedHelp },
    supervision: { ...template.supervision },
    safety: {
      adultPreCheck: { ...template.safety.adultPreCheck },
      adultSecondCheck: { ...template.safety.adultSecondCheck },
      adultOwnedActions: template.safety.adultOwnedActions.map((item) => ({ ...item })),
      childAllowedActions: template.safety.childAllowedActions.map((item) => ({ ...item })),
      excludedHazards: template.safety.excludedHazards.map((item) => ({ ...item })),
      stopAndAskAdult: { ...template.safety.stopAndAskAdult },
      routeConstraint: template.safety.routeConstraint
        ? { ...template.safety.routeConstraint }
        : null,
      indoorAlternative: template.safety.indoorAlternative
        ? { ...template.safety.indoorAlternative }
        : null,
      aftercare: template.safety.aftercare ? { ...template.safety.aftercare } : null,
    },
    privacyNotice: { ...template.privacyNotice },
  };
}

export class DeterministicTaskService implements TaskService {
  listCategories() {
    return TASK_CATEGORIES;
  }

  listTemplates(categoryId?: Parameters<TaskService['listTemplates']>[0]) {
    const all = [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE];
    return categoryId ? all.filter((item) => item.categoryId === categoryId) : all;
  }

  getChildChoicePool(session: PrototypeSession) {
    return session.choicePool;
  }

  createDraft(input: Parameters<TaskService['createDraft']>[0]): ServiceResult<TaskJourney> {
    if (
      !['child_salem', 'child_alya'].includes(input.childId) ||
      !nonEmptyLocalized(input.parentText)
    ) {
      return failure(
        'INVALID_INPUT',
        'A synthetic Child and bilingual Parent wording are required',
      );
    }
    const template = this.listTemplates().find((item) => item.id === input.templateId);
    if (!template) return failure('NOT_FOUND', 'The curated task template was not found');
    if (template.id === P0_RECYCLING_TEMPLATE.id && input.childId !== 'child_salem') {
      return failure('INVALID_INPUT', 'The sole executable P0 recycling fixture is bound to Salem');
    }

    const task: Task = {
      id:
        template.id === P0_RECYCLING_TEMPLATE.id
          ? template.id
          : `task_${template.id.toLowerCase()}_v1`,
      version: 1,
      templateId: template.id,
      targetChildId: input.childId,
      parentOriginalText: { ...input.parentText },
      acceptedGuideFixtureId: null,
      content: {
        ...cloneTemplate(template),
        positiveAction: { ...input.parentText },
      },
      origin: 'synthetic',
    };
    return success({ lifecycle: 'draft', task, assignment: null, submission: null, checkIn: null });
  }

  updateDraftParentText(
    journey: TaskJourney,
    parentText: LocalizedText,
  ): ServiceResult<TaskJourney> {
    if (journey.lifecycle !== 'draft') {
      return failure('INVALID_TRANSITION', 'Parent wording can be edited only while drafting');
    }
    if (!nonEmptyLocalized(parentText)) {
      return failure('INVALID_INPUT', 'Bilingual Parent wording is required');
    }
    if (
      journey.task.parentOriginalText.ar === parentText.ar &&
      journey.task.parentOriginalText.en === parentText.en
    ) {
      return success(journey);
    }

    const template = this.listTemplates().find((item) => item.id === journey.task.templateId);
    if (!template) return failure('NOT_FOUND', 'The curated task template was not found');

    return success({
      ...journey,
      task: {
        ...journey.task,
        parentOriginalText: { ...parentText },
        acceptedGuideFixtureId: null,
        content: {
          ...cloneTemplate(template),
          positiveAction: { ...parentText },
        },
      },
    });
  }

  applyAcceptedGuideSuggestion(
    journey: TaskJourney,
    suggestion: ParentGuideTaskSuggestion,
  ): ServiceResult<TaskJourney> {
    if (journey.lifecycle !== 'draft' || suggestion.accepted !== false) {
      return failure('INVALID_TRANSITION', 'Only a displayed draft suggestion can be accepted');
    }
    const validated = validateTaskTemplate(suggestion.suggestedContent);
    if (!validated.ok) return { ok: false, error: validated.error };
    if (!matchesCanonicalP0TaskContent(validated.data, 'exact_guide')) {
      return failure(
        'SAFETY_REJECTED',
        'The prepared P0 Guide suggestion must match the full reviewed task fixture',
      );
    }
    if (
      suggestion.originalParentText.ar !== journey.task.parentOriginalText.ar ||
      suggestion.originalParentText.en !== journey.task.parentOriginalText.en
    ) {
      return failure('INVALID_RESPONSE', 'The Guide suggestion lost the Parent original wording');
    }
    if (
      suggestion.suggestedContent.id !== journey.task.content.id ||
      suggestion.suggestedContent.categoryId !== journey.task.content.categoryId ||
      suggestion.suggestedContent.landscapeId !== journey.task.content.landscapeId ||
      suggestion.suggestedContent.recognitionMode !== journey.task.content.recognitionMode ||
      suggestion.suggestedContent.routinePhase !== journey.task.content.routinePhase ||
      suggestion.suggestedContent.recurrence !== journey.task.content.recurrence ||
      suggestion.suggestedContent.displayedSeedAward !== journey.task.content.displayedSeedAward ||
      suggestion.suggestedContent.visibilityScope !== journey.task.content.visibilityScope ||
      suggestion.suggestedContent.circleEligible !== journey.task.content.circleEligible ||
      JSON.stringify(suggestion.suggestedContent.safety) !==
        JSON.stringify(journey.task.content.safety)
    ) {
      return failure(
        'SAFETY_REJECTED',
        'A Guide suggestion cannot change the approved task, reward, privacy, or safety boundary',
      );
    }
    return success({
      ...journey,
      task: {
        ...journey.task,
        content: cloneTemplate(suggestion.suggestedContent),
        acceptedGuideFixtureId: suggestion.meta.fixtureId,
      },
    });
  }

  keepParentText(journey: TaskJourney): ServiceResult<TaskJourney> {
    if (journey.lifecycle !== 'draft') {
      return failure('INVALID_TRANSITION', 'Parent wording can be retained only while drafting');
    }
    return success({
      ...journey,
      task: {
        ...journey.task,
        acceptedGuideFixtureId: null,
        content: {
          ...journey.task.content,
          positiveAction: { ...journey.task.parentOriginalText },
        },
      },
    });
  }

  review(journey: TaskJourney): ServiceResult<TaskReviewResult> {
    if (journey.lifecycle !== 'draft') {
      return failure('INVALID_TRANSITION', 'Only a draft can enter review');
    }
    const validated = validateTaskForReview(journey.task);
    if (!validated.ok) return { ok: false, error: validated.error };
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'review',
      guards: lifecycleGuards(journey),
    });
    if (!transition.ok) return { ok: false, error: transition.error };
    return success({ task: journey.task, warnings: [] });
  }

  approveAssignment(journey: TaskJourney): ServiceResult<AssignmentApprovalResult> {
    if (journey.lifecycle !== 'reviewed') {
      return failure('INVALID_TRANSITION', 'Parent approval requires a reviewed task');
    }
    if (
      journey.task.templateId !== P0_RECYCLING_TEMPLATE.id ||
      journey.task.content.id !== P0_RECYCLING_TEMPLATE.id ||
      journey.task.targetChildId !== 'child_salem'
    ) {
      return failure(
        'INVALID_TRANSITION',
        'Only the reviewed recycling task is executable in the P0 prototype',
      );
    }
    const validated = validateTaskForReview(journey.task);
    if (!validated.ok) return { ok: false, error: validated.error };
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'approve_assignment',
      guards: lifecycleGuards(journey),
    });
    if (!transition.ok) return { ok: false, error: transition.error };
    const assignment = {
      id:
        journey.task.id === P0_RECYCLING_TEMPLATE.id
          ? 'assignment_recycling_p0_v1'
          : `assignment_${journey.task.id}`,
      taskId: journey.task.id,
      taskVersion: journey.task.version,
      childId: journey.task.targetChildId,
      approvedByParent: true as const,
      approvalSequence: 1,
      createdAt: FEATURE_003_TIMESTAMP,
    };
    return success({
      journey: { ...journey, lifecycle: transition.data.lifecycle, assignment },
      executableChoice: { ...P0_EXECUTABLE_CHOICE, childId: journey.task.targetChildId },
    });
  }

  chooseAssignment(
    journey: TaskJourney,
    activeChildId: Parameters<TaskService['chooseAssignment']>[1],
  ): ServiceResult<TaskJourney> {
    const linked = validateApprovedJourneyLinks(journey);
    if (!linked.ok) return linked;
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'choose',
      guards: { ...lifecycleGuards(journey), activeChildId },
    });
    return transition.ok
      ? success({ ...journey, lifecycle: transition.data.lifecycle })
      : { ok: false, error: transition.error };
  }

  startAssignment(
    journey: TaskJourney,
    activeChildId: Parameters<TaskService['startAssignment']>[1],
  ): ServiceResult<TaskJourney> {
    const linked = validateApprovedJourneyLinks(journey);
    if (!linked.ok) return linked;
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'start',
      guards: { ...lifecycleGuards(journey), activeChildId },
    });
    return transition.ok
      ? success({ ...journey, lifecycle: transition.data.lifecycle })
      : { ok: false, error: transition.error };
  }

  submit(
    journey: TaskJourney,
    activeChildId: Parameters<TaskService['submit']>[1],
    input: Parameters<TaskService['submit']>[2],
  ): ServiceResult<TaskJourney> {
    const linked = validateApprovedJourneyLinks(journey);
    if (!linked.ok) return linked;
    const assignment = journey.assignment;
    if (!assignment) return failure('INVALID_TRANSITION', 'An assignment is required');
    if (
      input.preparedMediaFixtureId !== null &&
      !PREPARED_MEDIA_FIXTURES.some((item) => item.id === input.preparedMediaFixtureId)
    ) {
      return failure('INVALID_INPUT', 'Only a reviewed prepared media fixture may be attached');
    }
    if (input.observableFacts.some((fact) => !nonEmptyLocalized(fact))) {
      return failure('INVALID_INPUT', 'Observable facts must be bilingual and non-empty');
    }
    const reflection = validateOptionalTaskReflection(input.reflection);
    if (!reflection.ok) return { ok: false, error: reflection.error };
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'submit',
      guards: {
        ...lifecycleGuards(journey),
        activeChildId,
        definitionAcknowledged: input.definitionAcknowledged,
        completionMode: input.completionMode,
        helpUsed: input.helpUsed,
        preparedMediaFixtureId: input.preparedMediaFixtureId,
        reflection: input.reflection,
      },
    });
    if (!transition.ok) return { ok: false, error: transition.error };
    const attempt = (journey.submission?.attempt ?? 0) + 1;
    return success({
      ...journey,
      lifecycle: transition.data.lifecycle,
      submission: {
        id: `submission_recycling_p0_v1_attempt_${attempt}`,
        assignmentId: assignment.id,
        taskVersion: journey.task.version,
        attempt,
        definitionAcknowledged: true,
        completionMode: input.completionMode,
        helpUsed: input.helpUsed ? { ...input.helpUsed } : null,
        preparedMediaFixtureId: input.preparedMediaFixtureId,
        reflection: input.reflection ? { ...input.reflection } : null,
        observableFacts: input.observableFacts.map((fact) => ({ ...fact })),
        submittedAt: '2026-08-26T09:30:00.000Z',
      },
      checkIn: null,
    });
  }

  requestKindRetry(
    journey: TaskJourney,
    neutralObservation: LocalizedText | null,
  ): ServiceResult<TaskJourney> {
    const linked = validateApprovedJourneyLinks(journey);
    if (!linked.ok) return linked;
    if (!journey.submission) return failure('INVALID_TRANSITION', 'A submission is required');
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'request_retry',
      guards: lifecycleGuards(journey),
    });
    if (!transition.ok) return { ok: false, error: transition.error };
    return success({
      ...journey,
      lifecycle: transition.data.lifecycle,
      checkIn: {
        id: `checkin_${journey.submission.id}`,
        submissionId: journey.submission.id,
        decision: 'kind_retry',
        praise: null,
        neutralObservation,
        uncertainty: null,
        replacementTaskId: null,
        recognitionKey: null,
        confirmationPresentation: null,
        praisePresentedAt: null,
        createdAt: '2026-08-26T09:35:00.000Z',
      },
    });
  }

  resumeRetry(journey: TaskJourney): ServiceResult<TaskJourney> {
    const linked = validateApprovedJourneyLinks(journey);
    if (!linked.ok) return linked;
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'resume_retry',
      guards: lifecycleGuards(journey),
    });
    return transition.ok
      ? success({ ...journey, lifecycle: transition.data.lifecycle, checkIn: null })
      : { ok: false, error: transition.error };
  }
}

function descriptivePraise(praise: LocalizedText): boolean {
  if (!nonEmptyLocalized(praise)) return false;
  const safety = evaluateAssistantSafety({ audience: 'parent', texts: [praise] });
  if (!safety.accepted) return false;
  if (praise.en === PREPARED_PRAISE.en && praise.ar === PREPARED_PRAISE.ar) return true;

  // Editable praise accepts only the approved action-and-help patterns.
  // Matching the full field blocks labels or character claims after otherwise valid praise.
  const boundedEnglishPraise =
    /^(?:You\s+)?sorted\s+(?:the\s+)?(?:clean\s+)?(?:paper|plastic|items|materials|recyclables)(?:\s+approved\s+by\s+an?\s+adult)?\s+and\s+asked\s+(?:(?:an?\s+adult\s+)?for\s+help\s+when\s+(?:unsure|needed)|an?\s+adult\s+before\s+continuing)[.!]?$/iu;
  const boundedArabicPraise =
    /^(?:لقد\s+)?فرزت\s+(?:الورق|المواد)(?:\s+النظيف(?:ة|ين)?)?(?:\s+القابلة\s+لإعادة\s+التدوير)?\s+و(?:سألت\s+شخص(?:اً|ا)?\s+بالغ(?:اً|ا)?\s+قبل\s+المتابعة|طلبت\s+مساعدة\s+شخص\s+بالغ\s+عند\s+الشك)[.!؟]?$/u;
  return boundedEnglishPraise.test(praise.en) && boundedArabicPraise.test(praise.ar);
}

function pendingPlan(journey: TaskJourney): PendingConfirmationPlan | null {
  const checkIn = journey.checkIn;
  if (
    journey.lifecycle !== 'confirmed' ||
    !checkIn ||
    checkIn.decision !== 'confirm' ||
    !checkIn.praise ||
    !checkIn.recognitionKey
  ) {
    return null;
  }
  return {
    journey,
    checkIn,
    recognitionKey: checkIn.recognitionKey,
    praise: checkIn.praise,
    renderState: 'confirmation_pending',
  };
}

interface ActiveRecognitionChain {
  readonly journey: TaskJourney;
  readonly recognitionKey: string;
}

function sameStructuredData(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateActiveRecognitionChain(
  session: PrototypeSession,
): ServiceResult<ActiveRecognitionChain> {
  const journey = session.journey;
  const assignment = journey?.assignment;
  const submission = journey?.submission;
  if (!journey || !assignment || !submission) {
    return failure('INVALID_TRANSITION', 'A complete submitted assignment is required');
  }
  const linked = validateApprovedJourneyLinks(journey);
  if (!linked.ok) return linked;
  if (
    session.activeAssignmentId !== assignment.id ||
    session.activeChildId !== assignment.childId ||
    session.children[assignment.childId]?.id !== assignment.childId
  ) {
    return failure(
      'INVALID_RESPONSE',
      'The active assignment and synthetic Child no longer match the submitted journey',
    );
  }
  if (!submission.id.trim() || !Number.isInteger(submission.attempt) || submission.attempt < 1) {
    return failure('INVALID_RESPONSE', 'The active submission identity is malformed');
  }

  const recognitionKey = recognitionKeyForSubmission(submission.id);
  const checkIn = journey.checkIn;
  if (checkIn) {
    if (!checkIn.id.trim() || checkIn.submissionId !== submission.id) {
      return failure('INVALID_RESPONSE', 'The check-in no longer matches the active submission');
    }
    if (
      checkIn.decision === 'confirm'
        ? checkIn.recognitionKey !== recognitionKey || !checkIn.praise
        : checkIn.recognitionKey !== null
    ) {
      return failure('INVALID_RESPONSE', 'The check-in recognition identity is malformed');
    }
  }

  if (journey.lifecycle === 'submitted' && checkIn !== null) {
    return failure('INVALID_RESPONSE', 'A submitted journey cannot contain a resolved check-in');
  }
  if (
    journey.lifecycle === 'retry' &&
    (!checkIn || checkIn.decision !== 'kind_retry' || checkIn.confirmationPresentation !== null)
  ) {
    return failure('INVALID_RESPONSE', 'The retry check-in is malformed');
  }
  if (
    journey.lifecycle === 'confirmed' &&
    (!checkIn ||
      checkIn.decision !== 'confirm' ||
      !['editing_praise', 'praise_presented'].includes(checkIn.confirmationPresentation ?? ''))
  ) {
    return failure('INVALID_RESPONSE', 'The pending confirmation check-in is malformed');
  }
  if (
    journey.lifecycle === 'recognized' &&
    (!checkIn ||
      checkIn.decision !== 'confirm' ||
      checkIn.confirmationPresentation !== 'recognition_applied')
  ) {
    return failure('INVALID_RESPONSE', 'The recognized check-in is malformed');
  }

  return success({ journey, recognitionKey });
}

function validatePresentedPlanChain(
  chain: ActiveRecognitionChain,
  presentedPlan: PraisePresentedPlan,
): ServiceResult<PraisePresentedPlan> {
  const currentJourney = chain.journey;
  const currentCheckIn = currentJourney.checkIn;
  if (!currentCheckIn) {
    return failure('INVALID_TRANSITION', 'A matching confirmation check-in is required');
  }
  const comparableCurrentCheckIn =
    currentJourney.lifecycle === 'recognized'
      ? { ...currentCheckIn, confirmationPresentation: 'praise_presented' as const }
      : currentCheckIn;
  if (
    presentedPlan.recognitionKey !== chain.recognitionKey ||
    presentedPlan.checkIn.recognitionKey !== chain.recognitionKey ||
    presentedPlan.journey.lifecycle !== 'confirmed' ||
    presentedPlan.renderState !== 'praise_presented' ||
    presentedPlan.checkIn.confirmationPresentation !== 'praise_presented' ||
    !presentedPlan.presentationActionId.trim() ||
    presentedPlan.continuation.action !== 'apply_recognition' ||
    presentedPlan.continuation.source !== 'visible_parent_control' ||
    !sameStructuredData(presentedPlan.journey.task, currentJourney.task) ||
    !sameStructuredData(presentedPlan.journey.assignment, currentJourney.assignment) ||
    !sameStructuredData(presentedPlan.journey.submission, currentJourney.submission) ||
    !sameStructuredData(presentedPlan.journey.checkIn, presentedPlan.checkIn) ||
    !sameStructuredData(presentedPlan.checkIn, comparableCurrentCheckIn) ||
    !sameStructuredData(presentedPlan.praise, currentCheckIn.praise)
  ) {
    return failure(
      'INVALID_RESPONSE',
      'The presented plan no longer matches the active task, version, submission, and check-in',
    );
  }
  return success(presentedPlan);
}

export class DeterministicRecognitionService implements RecognitionService {
  getReceipt(session: PrototypeSession, recognitionKey: string): RecognitionReceipt | null {
    return session.recognitionLedger[recognitionKey] ?? null;
  }

  resolveCheckInState(
    session: PrototypeSession,
    submissionId: string,
  ): ServiceResult<CheckInRouteState> {
    const chain = validateActiveRecognitionChain(session);
    if (!chain.ok) return chain;
    const { journey, recognitionKey: expectedRecognitionKey } = chain.data;
    if (journey.submission?.id !== submissionId) {
      return failure('INVALID_TRANSITION', 'The requested submission is not active');
    }
    if (journey.lifecycle === 'submitted' && !journey.checkIn) {
      return success({ state: 'submitted', journey, submission: journey.submission });
    }
    if (journey.lifecycle === 'retry' && journey.checkIn?.decision === 'kind_retry') {
      return success({ state: 'retry', journey, submission: journey.submission });
    }
    if (journey.lifecycle === 'recognized' && journey.checkIn?.recognitionKey) {
      if (journey.checkIn.recognitionKey !== expectedRecognitionKey) {
        return failure('INVALID_RESPONSE', 'Recognized check-in has a mismatched recognition key');
      }
      const receipt = this.getReceipt(session, expectedRecognitionKey);
      if (
        !receipt ||
        receipt.recognitionKey !== expectedRecognitionKey ||
        receipt.checkInId !== journey.checkIn.id
      ) {
        return failure('INVALID_RESPONSE', 'Recognized journey is missing its matching receipt');
      }
      return success({
        state: 'already_confirmed',
        journey,
        attempt: {
          disposition: 'already_confirmed',
          journey,
          receipt,
          message: {
            ar: 'تم تأكيد هذه المهمة مسبقاً.',
            en: 'This task was already confirmed.',
          },
        },
      });
    }
    if (
      journey.lifecycle === 'confirmed' &&
      journey.checkIn?.recognitionKey !== expectedRecognitionKey
    ) {
      return failure('INVALID_RESPONSE', 'Confirmed check-in has a mismatched recognition key');
    }
    const plan = pendingPlan(journey);
    if (!plan) return failure('INVALID_TRANSITION', 'Check-in state is not safely resumable');
    if (journey.checkIn?.confirmationPresentation === 'praise_presented') {
      const presented: PraisePresentedPlan = {
        ...plan,
        checkIn: journey.checkIn as PraisePresentedPlan['checkIn'],
        renderState: 'praise_presented',
        presentationActionId: `presentation:${journey.checkIn.id}`,
        continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
      };
      return success({
        state: 'confirmation_pending',
        journey,
        attempt: { disposition: 'praise_presented', plan: presented },
      });
    }
    return success({
      state: 'confirmation_pending',
      journey,
      attempt: { disposition: 'pending_praise', plan },
    });
  }

  planConfirmation(
    session: PrototypeSession,
    input: Parameters<RecognitionService['planConfirmation']>[1],
  ): ServiceResult<ConfirmationAttempt> {
    const chain = validateActiveRecognitionChain(session);
    if (!chain.ok) return chain;
    const journey = chain.data.journey;
    const recognitionKey = chain.data.recognitionKey;
    if (journey.submission?.id !== input.submissionId) {
      return failure('INVALID_TRANSITION', 'A matching submitted task is required');
    }
    const existingReceipt = this.getReceipt(session, recognitionKey);
    if (existingReceipt) {
      if (
        journey.lifecycle !== 'recognized' ||
        !journey.checkIn ||
        existingReceipt.recognitionKey !== recognitionKey ||
        existingReceipt.checkInId !== journey.checkIn.id
      ) {
        return failure('INVALID_RESPONSE', 'Stored receipt does not match the current journey');
      }
      return success({
        disposition: 'already_confirmed',
        journey,
        receipt: existingReceipt,
        message: { ar: 'تم تأكيد هذه المهمة مسبقاً.', en: 'This task was already confirmed.' },
      });
    }

    if (journey.lifecycle === 'confirmed') {
      const existingPlan = pendingPlan(journey);
      if (!existingPlan)
        return failure('INVALID_RESPONSE', 'Pending confirmation plan is malformed');
      if (journey.checkIn?.confirmationPresentation === 'praise_presented') {
        return success({
          disposition: 'praise_presented',
          plan: {
            ...existingPlan,
            checkIn: journey.checkIn as PraisePresentedPlan['checkIn'],
            renderState: 'praise_presented',
            presentationActionId: `presentation:${journey.checkIn.id}`,
            continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
          },
        });
      }
      return success({ disposition: 'pending_praise', plan: existingPlan });
    }
    if (journey.lifecycle !== 'submitted' || !descriptivePraise(input.praise)) {
      return failure(
        'INVALID_INPUT',
        'Submitted work and descriptive bilingual praise are required',
      );
    }

    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'plan_confirmation',
      guards: lifecycleGuards(journey),
    });
    if (!transition.ok) return { ok: false, error: transition.error };
    const checkIn = {
      id: `checkin_${input.submissionId}`,
      submissionId: input.submissionId,
      decision: 'confirm' as const,
      praise: { ...input.praise },
      neutralObservation: input.neutralObservation ? { ...input.neutralObservation } : null,
      uncertainty: input.uncertainty ? { ...input.uncertainty } : null,
      replacementTaskId: null,
      recognitionKey,
      confirmationPresentation: 'editing_praise' as const,
      praisePresentedAt: null,
      createdAt: '2026-08-26T09:38:00.000Z',
    };
    const confirmedJourney: TaskJourney = {
      ...journey,
      lifecycle: transition.data.lifecycle,
      checkIn,
    };
    return success({
      disposition: 'pending_praise',
      plan: {
        journey: confirmedJourney,
        checkIn,
        recognitionKey,
        praise: checkIn.praise,
        renderState: 'confirmation_pending',
      },
    });
  }

  markPraisePresented(
    plan: PendingConfirmationPlan,
    action: PraisePresentationAction,
  ): ServiceResult<PraisePresentedPlan> {
    const linked = validateApprovedJourneyLinks(plan.journey);
    if (!linked.ok) return linked;
    const submission = plan.journey.submission;
    const expectedRecognitionKey = submission ? recognitionKeyForSubmission(submission.id) : null;
    if (
      !submission ||
      !expectedRecognitionKey ||
      plan.recognitionKey !== expectedRecognitionKey ||
      plan.checkIn.recognitionKey !== expectedRecognitionKey ||
      plan.checkIn.submissionId !== submission.id ||
      !sameStructuredData(plan.journey.checkIn, plan.checkIn) ||
      !sameStructuredData(plan.praise, plan.checkIn.praise) ||
      action.source !== 'parent_press' ||
      !action.actionId.trim() ||
      !action.presentedAt.trim() ||
      plan.journey.lifecycle !== 'confirmed' ||
      plan.checkIn.confirmationPresentation !== 'editing_praise' ||
      !descriptivePraise(plan.praise)
    ) {
      return failure('INVALID_TRANSITION', 'A valid Parent praise-presentation press is required');
    }
    const checkIn = {
      ...plan.checkIn,
      confirmationPresentation: 'praise_presented' as const,
      praisePresentedAt: action.presentedAt,
    };
    const journey = { ...plan.journey, checkIn };
    return success({
      journey,
      checkIn,
      recognitionKey: plan.recognitionKey,
      praise: plan.praise,
      renderState: 'praise_presented',
      presentationActionId: action.actionId,
      continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
    });
  }

  applyRecognition(
    session: PrototypeSession,
    presentedPlan: PraisePresentedPlan,
    continuation: RecognitionContinuationAction,
  ): ServiceResult<RecognitionAttemptResult> {
    const chain = validateActiveRecognitionChain(session);
    if (!chain.ok) return chain;
    const validatedPlan = validatePresentedPlanChain(chain.data, presentedPlan);
    if (!validatedPlan.ok) return validatedPlan;
    if (
      continuation.source !== 'parent_press' ||
      continuation.observedRenderState !== 'praise_presented' ||
      continuation.presentationActionId !== presentedPlan.presentationActionId ||
      continuation.actionId === presentedPlan.presentationActionId ||
      presentedPlan.renderState !== 'praise_presented' ||
      presentedPlan.checkIn.confirmationPresentation !== 'praise_presented'
    ) {
      return failure('INVALID_TRANSITION', 'Recognition requires a distinct later Parent press');
    }

    const journey = chain.data.journey;
    const recognitionKey = chain.data.recognitionKey;
    const existingReceipt = this.getReceipt(session, recognitionKey);
    if (existingReceipt) {
      if (
        journey.lifecycle !== 'recognized' ||
        !journey.checkIn ||
        existingReceipt.recognitionKey !== recognitionKey ||
        existingReceipt.checkInId !== journey.checkIn.id
      ) {
        return failure('INVALID_RESPONSE', 'Stored receipt does not match the recognized journey');
      }
      return success({
        disposition: 'already_confirmed',
        session,
        journey,
        receipt: existingReceipt,
        message: { ar: 'تم تأكيد هذه المهمة مسبقاً.', en: 'This task was already confirmed.' },
      });
    }
    if (!journey.submission || !journey.assignment || !journey.checkIn) {
      return failure('INVALID_TRANSITION', 'The confirmed journey is incomplete');
    }
    const transition = transitionTaskLifecycle({
      current: journey.lifecycle,
      action: 'apply_recognition',
      guards: lifecycleGuards(journey, true),
    });
    if (!transition.ok) {
      return { ok: false, error: transition.error };
    }

    const existingRoutineProgress = session.routineProgressByTask?.[journey.task.id] ?? null;
    const recurringFadeFirst =
      journey.task.content.recognitionMode === 'fade_first' &&
      journey.task.content.recurrence === 'recurrent';
    const effectiveRoutinePhase = recurringFadeFirst
      ? (existingRoutineProgress?.futurePhase ?? journey.task.content.routinePhase)
      : journey.task.content.routinePhase;
    const confirmedAcquisitionCount =
      recurringFadeFirst && effectiveRoutinePhase === 'acquisition'
        ? (existingRoutineProgress?.confirmedAcquisitionCount ?? 0) + 1
        : (existingRoutineProgress?.confirmedAcquisitionCount ?? 1);
    const policy = evaluateRecognitionPolicy({
      submissionId: journey.submission.id,
      recognitionMode: journey.task.content.recognitionMode,
      routinePhase: effectiveRoutinePhase,
      recurrence: journey.task.content.recurrence,
      displayedSeedAward:
        effectiveRoutinePhase === 'maintenance' ? null : journey.task.content.displayedSeedAward,
      completionMode: journey.submission.completionMode,
      confirmedAcquisitionCount,
      existingReceipt: null,
    });
    if (!policy.ok) return { ok: false, error: policy.error };
    if (policy.data.disposition !== 'new') {
      return failure('INVALID_RESPONSE', 'Unexpected duplicate policy result');
    }

    const projectionContext: ProjectionEligibilityContext = {
      schemaVersion: '1.0',
      categoryId: journey.task.content.categoryId,
      recognitionMode: journey.task.content.recognitionMode,
      routinePhase: effectiveRoutinePhase,
      visibilityScope: journey.task.content.visibilityScope,
      circleEligible: journey.task.content.circleEligible,
      consequenceKind: policy.data.consequenceKind,
      confirmed: true,
      prohibitedSharedFieldsPresent: false,
    };
    const projection = planAfterConfirmation(projectionContext);
    if (!projection.ok) return { ok: false, error: projection.error };

    const seedAmount = policy.data.seedAmount;
    const child = session.children[journey.task.targetChildId];
    if (!child) return failure('INVALID_RESPONSE', 'Assigned synthetic Child is missing');
    const landscape = session.landscapeProgress[journey.task.content.landscapeId];
    const growth = seedAmount === null ? null : planLandscapeGrowth({ landscape, seedAmount });
    if (growth && !growth.ok) return { ok: false, error: growth.error };

    const seedTransaction =
      seedAmount === null
        ? null
        : {
            id: `seed_transaction_${journey.submission.id}`,
            recognitionKey,
            childId: child.id,
            amount: seedAmount,
            balanceBefore: child.earnedSeeds,
            balanceAfter: child.earnedSeeds + seedAmount,
            meaning: 'symbolic_nonfinancial' as const,
          };
    const phaseReview = policy.data.phaseReview
      ? {
          taskId: journey.task.id,
          confirmedAcquisitionCount: 3 as const,
          options: policy.data.phaseReview.options,
          selected: null,
          appliesTo: 'future_completions_only' as const,
          reversibleByParent: true as const,
        }
      : null;
    const receipt: RecognitionReceipt = {
      recognitionKey,
      checkInId: journey.checkIn.id,
      seedTransaction,
      landscapeGrowth: growth?.data ?? null,
      canopyContribution: projection.data.canopyContribution,
      circleEvent: projection.data.circleEvent,
      phaseReview,
    };

    const nextRoutineProgress = recurringFadeFirst
      ? {
          taskId: journey.task.id,
          confirmedAcquisitionCount,
          futurePhase: existingRoutineProgress?.futurePhase ?? 'acquisition',
          phaseReview: phaseReview ?? existingRoutineProgress?.phaseReview ?? null,
          decision: existingRoutineProgress?.decision ?? null,
        }
      : null;

    const recognizedJourney: TaskJourney = {
      ...journey,
      lifecycle: transition.data.lifecycle,
      checkIn: {
        ...journey.checkIn,
        confirmationPresentation: 'recognition_applied',
      },
    };
    const nextSession: PrototypeSession = {
      ...session,
      household: projection.data.canopyContribution
        ? {
            ...session.household,
            combinedCanopy: applyCanopy(
              session.household.combinedCanopy,
              projection.data.canopyContribution,
            ),
          }
        : session.household,
      children: seedTransaction
        ? {
            ...session.children,
            [child.id]: { ...child, earnedSeeds: seedTransaction.balanceAfter },
          }
        : session.children,
      journey: recognizedJourney,
      landscapeProgress: growth?.data
        ? {
            ...session.landscapeProgress,
            [growth.data.landscapeId]: {
              landscapeId: growth.data.landscapeId,
              cumulativeSeeds: growth.data.seedsAfter,
              stage: growth.data.stageAfter,
              nextThreshold: nextThresholdForSeeds(growth.data.seedsAfter),
            },
          }
        : session.landscapeProgress,
      circleGoal: projection.data.circleEvent
        ? applyCircle(session.circleGoal, projection.data.circleEvent)
        : session.circleGoal,
      recognitionLedger: {
        ...session.recognitionLedger,
        [receipt.recognitionKey]: receipt,
      },
      routineProgressByTask: nextRoutineProgress
        ? {
            ...(session.routineProgressByTask ?? {}),
            [journey.task.id]: nextRoutineProgress,
          }
        : session.routineProgressByTask,
      celebration: { available: seedAmount !== null, consumed: false },
    };
    return success({
      disposition: 'applied',
      session: nextSession,
      journey: recognizedJourney,
      receipt,
      message: null,
    });
  }
}

export class DeterministicGardenService implements GardenService {
  stageForSeeds = stageForSeeds;
  nextThresholdForSeeds = nextThresholdForSeeds;

  planGrowth(input: Parameters<GardenService['planGrowth']>[0]) {
    return fromDomain(planLandscapeGrowth(input));
  }
}

export class DeterministicFamilyProjectionService implements FamilyProjectionService {
  validateTaskSharing(task: Task): ServiceResult<Task> {
    const validated = validateTaskForReview(task);
    return validated.ok
      ? success(task)
      : { ok: false, error: { ...validated.error, code: 'PRIVACY_REJECTED' } };
  }

  validateEligibilityContext(input: unknown) {
    return fromDomain(validateEligibilityContext(input));
  }

  planAfterConfirmation(input: ProjectionEligibilityContext): ServiceResult<ProjectionPlan> {
    return fromDomain(planAfterConfirmation(input));
  }

  applyCanopy = applyCanopy;
  applyCircle = applyCircle;
}

export class DeterministicMediaService implements MediaService {
  listPrepared(): readonly PreparedMediaFixture[] {
    return PREPARED_MEDIA_FIXTURES;
  }

  async getPrepared(id: PreparedMediaFixture['id']): Promise<ServiceResult<PreparedMediaResult>> {
    const fixture = PREPARED_MEDIA_FIXTURES.find((item) => item.id === id) ?? null;
    if (!fixture) {
      return success(
        {
          fixture: null,
          fallbackText: {
            ar: 'الوسيط المُعدّ غير متاح؛ يمكنك المتابعة من دون إرفاقه.',
            en: 'The prepared media is unavailable; you can continue without attaching it.',
          },
          available: false,
        },
        { ...PREPARED_META, fixtureId: id },
      );
    }
    return success(
      {
        fixture,
        fallbackText: fixture.fallbackText,
        available: fixture.uri !== null,
      },
      { ...PREPARED_META, fixtureId: fixture.id },
    );
  }
}

export class DeterministicParentGuideProvider implements PreparedParentGuideProvider {
  readonly mode = 'deterministic_prepared' as const;
  readonly fixtureId = 'guide_recycling_refine_v1' as const;
  readonly disclosure = PARENT_GUIDE_FIXTURE.meta.disclosure;

  async refineTask(request: ParentGuideRequest): Promise<ServiceResult<ParentGuideTaskSuggestion>> {
    const intent = validateParentGuideIntent(request.intent);
    if (!intent.ok) return { ok: false, error: intent.error };
    if (
      request.inputOrigin !== 'synthetic' ||
      request.child.ageBand !== '9_11' ||
      request.taskTemplateId !== P0_RECYCLING_TEMPLATE.id ||
      request.taskVersion !== 1 ||
      request.allowedCategoryId !== 'green_impact' ||
      !nonEmptyLocalized(request.parentText)
    ) {
      return failure('INVALID_INPUT', 'Parent Guide request is outside the synthetic P0 task');
    }
    return success(
      {
        ...PARENT_GUIDE_FIXTURE,
        meta: { ...PARENT_GUIDE_FIXTURE.meta, requestId: request.requestId },
        originalParentText: { ...request.parentText },
      },
      { ...PREPARED_META, fixtureId: this.fixtureId },
    );
  }

  async summarizePattern(
    request: Parameters<ParentGuideService['summarizePattern']>[0],
  ): Promise<ServiceResult<ParentPatternSummary>> {
    if (request.inputOrigin !== 'synthetic' || request.child.ageBand !== '9_11') {
      return failure('INVALID_INPUT', 'Parent summary accepts only synthetic P0 facts');
    }
    return success(
      {
        ...PARENT_SUMMARY_FIXTURE,
        meta: { ...PARENT_SUMMARY_FIXTURE.meta, requestId: request.requestId },
      },
      { ...PREPARED_META, fixtureId: PARENT_SUMMARY_FIXTURE.meta.fixtureId ?? undefined },
    );
  }
}

export class DeterministicChildCoachProvider implements PreparedChildCoachProvider {
  readonly mode = 'deterministic_prepared' as const;
  readonly fixtureId = 'coach_recycling_steps_v1' as const;
  readonly disclosure = CHILD_COACH_FIXTURE.meta.disclosure;

  async respond(request: ChildCoachRequest): Promise<ServiceResult<ChildCoachResult>> {
    const context: ActiveCoachContext = {
      activeChildId: P0_APPROVED_COACH_BINDING.childId,
      assignmentId: P0_APPROVED_COACH_BINDING.assignmentId,
      taskId: P0_APPROVED_COACH_BINDING.taskId,
      approvedTaskVersion: P0_APPROVED_COACH_BINDING.approvedTaskVersion,
      lifecycle: request.lifecycle,
      approvedByParent: true,
    };
    const validated = validateChildCoachRequest(request, context);
    if (!validated.ok) return { ok: false, error: validated.error };
    return success(
      {
        ...CHILD_COACH_FIXTURE,
        meta: { ...CHILD_COACH_FIXTURE.meta, requestId: request.requestId },
      },
      { ...PREPARED_META, fixtureId: this.fixtureId },
    );
  }
}

export class DeterministicCoachAdaptationService implements CoachAdaptationService {
  policyForAgeBand(ageBand: unknown): ServiceResult<ChildCoachOutputPolicy> {
    if (ageBand !== '6_8' && ageBand !== '9_11' && ageBand !== '12_14') {
      return failure('INVALID_INPUT', 'Coach age band is outside the reviewed policy');
    }
    return success(coachOutputPolicyForAgeBand(ageBand));
  }

  adaptPreparedResult(input: AdaptCoachResultInput): ServiceResult<AgeAdaptedCoachResult> {
    return fromDomain(adaptPreparedCoachResult(input), PREPARED_META);
  }
}

export class DeterministicSyntheticVoiceService implements SyntheticVoiceService {
  private readonly sessions = new Map<string, SyntheticVoiceSession>();

  constructor(private readonly accessService: SyntheticAccessService) {}

  createIdle(
    input: CreateVoiceSessionInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const authorized = this.authorizeCurrentGrant(
      input.access.childId,
      input.access.accessSessionId,
      input.access.grant.version,
      authority,
    );
    if (!authorized.ok) return authorized;
    if (this.sessions.has(input.voiceSessionId)) {
      return failure('INVALID_TRANSITION', 'Synthetic voice session identifier is already used');
    }
    return this.storeVoiceSession(fromDomain(createIdleVoiceSession(input)));
  }

  start(
    session: SyntheticVoiceSession,
    access: VoiceAccessContext,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, true);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(fromDomain(startVoiceSession(stored.data, access)));
  }

  stopWithPreparedTranscript(
    session: SyntheticVoiceSession,
    input: StopVoiceSessionInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, true);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(
      fromDomain(stopVoiceSessionWithPreparedTranscript(stored.data, input), PREPARED_META),
    );
  }

  deleteBeforeSend(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, false);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(fromDomain(deleteVoiceTranscript(stored.data)));
  }

  send(
    session: SyntheticVoiceSession,
    sentAt: string,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, true);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(fromDomain(sendVoiceTranscript(stored.data, sentAt)));
  }

  setPlayback(
    session: SyntheticVoiceSession,
    input: VoicePlaybackInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, true);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(fromDomain(setVoicePlayback(stored.data, input)));
  }

  replay(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, true);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(fromDomain(replayVoiceTranscript(stored.data)));
  }

  reset(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.resolveVoiceSession(session, authority, false);
    if (!stored.ok) return stored;
    return this.storeVoiceSession(success(resetVoiceSession(stored.data)));
  }

  private resolveVoiceSession(
    supplied: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
    currentGrantRequired: boolean,
  ): ServiceResult<SyntheticVoiceSession> {
    const stored = this.sessions.get(supplied.voiceSessionId);
    if (!stored || JSON.stringify(stored) !== JSON.stringify(supplied)) {
      return failure('INVALID_TRANSITION', 'Synthetic voice session state is stale or forged');
    }
    const authorized = currentGrantRequired
      ? this.authorizeCurrentGrant(
          stored.childId,
          stored.accessSessionId,
          stored.permissionVersion,
          authority,
        )
      : this.authorizeIdentity(stored, authority);
    return authorized.ok ? success(this.cloneVoiceSession(stored)) : authorized;
  }

  private storeVoiceSession(
    result: ServiceResult<SyntheticVoiceSession>,
  ): ServiceResult<SyntheticVoiceSession> {
    if (!result.ok) return result;
    const stored = this.cloneVoiceSession(result.data);
    this.sessions.set(stored.voiceSessionId, stored);
    return success(this.cloneVoiceSession(stored), result.meta);
  }

  private cloneVoiceSession(session: SyntheticVoiceSession): SyntheticVoiceSession {
    return {
      voiceSessionId: session.voiceSessionId,
      childId: session.childId,
      accessSessionId: session.accessSessionId,
      taskId: session.taskId,
      approvedTaskVersion: session.approvedTaskVersion,
      permissionVersion: session.permissionVersion,
      lifecycle: session.lifecycle,
      transcriptFixtureId: session.transcriptFixtureId,
      transcript: session.transcript ? { ...session.transcript } : null,
      captionsEnabled: session.captionsEnabled,
      playbackRate: session.playbackRate,
      replayCount: session.replayCount,
      recordingVisible: session.recordingVisible,
      backgroundRecording: false,
      sentAt: session.sentAt,
      origin: 'synthetic',
    };
  }

  private authorizeIdentity(
    session: Pick<SyntheticVoiceSession, 'childId' | 'accessSessionId'>,
    authority: SessionAuthorityInput,
  ): ServiceResult<true> {
    const projected = this.accessService.projectSession(authority);
    if (!projected.ok) return projected;
    if (
      projected.data.viewKind !== 'child' ||
      projected.data.childId !== session.childId ||
      projected.data.sessionId !== session.accessSessionId ||
      !projected.data.capabilities.includes('use_task_coach')
    ) {
      return failure('PRIVACY_REJECTED', 'Voice session authority does not match the active Child');
    }
    return success(true);
  }

  private authorizeCurrentGrant(
    childId: string,
    accessSessionId: string,
    permissionVersion: number,
    authority: SessionAuthorityInput,
  ): ServiceResult<true> {
    const identity = this.authorizeIdentity({ childId, accessSessionId }, authority);
    if (!identity.ok) return identity;
    if (childId !== 'child_salem' && childId !== 'child_alya') {
      return failure('PRIVACY_REJECTED', 'Voice is limited to the active synthetic Child');
    }
    const grant = this.accessService.getChildPermissions({
      session: authority.session,
      childId,
      now: authority.now,
    });
    if (!grant.ok) return grant;
    if (
      grant.data.version !== permissionVersion ||
      !grant.data.voiceGranted ||
      !grant.data.aiGranted
    ) {
      return failure('PRIVACY_REJECTED', 'Stored Parent voice and AI grants are required');
    }
    return success(true);
  }
}

export class DeterministicFamilyRewardService implements FamilyRewardService {
  private readonly plans = new Map<string, FamilyRewardPlan>();

  constructor(private readonly access: SyntheticAccessService) {}

  createPlan(
    input: FamilyRewardPlanDraft,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ReturnType<FamilyRewardService['createPlan']> {
    const parent = this.authorizeParent(input.createdByGuardianId, authority);
    if (!parent.ok) return parent;
    const created = createFamilyRewardPlan(input);
    if (!created.ok) return fromFamilyReward(created);
    if (this.plans.has(created.data.id)) {
      return failure('INVALID_TRANSITION', 'Family Reward plan identifier is already used');
    }
    if (created.data.promise.kind === 'money') {
      const authorized = this.authorizeMonetaryChange(
        'create_monetary_family_reward',
        authority,
        monetaryProofId,
      );
      if (!authorized.ok) return authorized;
    }
    return success(this.savePlan(created.data));
  }

  revisePromisedPlan(
    planId: string,
    input: ReviseFamilyRewardPlanInput,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ReturnType<FamilyRewardService['revisePromisedPlan']> {
    const parent = this.authorizeParent(input.guardianId, authority);
    if (!parent.ok) return parent;
    const stored = this.resolvePlan(planId);
    if (!stored.ok) return stored;
    const revised = reviseFamilyRewardPlan(stored.data, input);
    if (!revised.ok) return fromFamilyReward(revised);
    if (
      revised.data.priorVersion.promise.kind === 'money' ||
      revised.data.revisedPlan.promise.kind === 'money'
    ) {
      const authorized = this.authorizeMonetaryChange(
        'change_monetary_family_reward',
        authority,
        monetaryProofId,
      );
      if (!authorized.ok) return authorized;
    }
    const revisedPlan = this.savePlan(revised.data.revisedPlan);
    return success({
      priorVersion: this.clonePlan(revised.data.priorVersion),
      revisedPlan,
    });
  }

  evaluatePlan(
    planId: string,
    candidateEvents: readonly unknown[],
    options: FamilyRewardEvaluationOptions,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyRewardService['evaluatePlan']> {
    const parent = this.resolveParent(authority);
    if (!parent.ok) return parent;
    const stored = this.resolvePlan(planId);
    if (!stored.ok) return stored;
    const authorized = this.authorizePlanGuardian(stored.data, authority);
    if (!authorized.ok) return authorized;
    const evaluated = evaluateFamilyRewardPlan(stored.data, candidateEvents, options);
    if (!evaluated.ok) return fromFamilyReward(evaluated);
    const savedPlan = this.savePlan(evaluated.data.plan);
    return success({
      ...evaluated.data,
      plan: savedPlan,
      progress: {
        ...evaluated.data.progress,
        recognitionKeys: [...evaluated.data.progress.recognitionKeys],
        eligibleLandscapeTransitions: evaluated.data.progress.eligibleLandscapeTransitions.map(
          (item) => ({ ...item }),
        ),
        landscapesCrossingTarget: [...evaluated.data.progress.landscapesCrossingTarget],
      },
    });
  }

  markGiven(
    planId: string,
    input: GiveFamilyRewardInput,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ReturnType<FamilyRewardService['markGiven']> {
    const parent = this.authorizeParent(input.guardianId, authority);
    if (!parent.ok) return parent;
    const stored = this.resolvePlan(planId);
    if (!stored.ok) return stored;
    const given = markFamilyRewardGiven(stored.data, input);
    if (!given.ok) return fromFamilyReward(given);
    if (given.data.disposition === 'given' && given.data.plan.promise.kind === 'money') {
      const authorized = this.authorizeMonetaryChange(
        'change_monetary_family_reward',
        authority,
        monetaryProofId,
      );
      if (!authorized.ok) return authorized;
    }
    return success({ ...given.data, plan: this.savePlan(given.data.plan) });
  }

  projectPrivate(
    planId: string,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyRewardService['projectPrivate']> {
    const projected = this.access.projectSession(authority);
    if (!projected.ok) return projected;
    const stored = this.resolvePlan(planId);
    if (!stored.ok) {
      return projected.data.viewKind === 'child'
        ? failure('PRIVACY_REJECTED', 'Family Reward is not available to this Child')
        : stored;
    }
    const viewer =
      projected.data.viewKind === 'parent'
        ? { kind: 'guardian' as const, guardianId: projected.data.parentId }
        : { kind: 'child' as const, childId: projected.data.childId };
    const privateView = projectFamilyRewardPlan(stored.data, viewer);
    return !privateView.ok && projected.data.viewKind === 'child'
      ? failure('PRIVACY_REJECTED', 'Family Reward is not available to this Child')
      : fromFamilyReward(privateView);
  }

  summarizeMonthlyCommitment(
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyRewardService['summarizeMonthlyCommitment']> {
    const parent = this.resolveParent(authority);
    if (!parent.ok) return parent;
    return fromFamilyReward(
      summarizeMonthlyMonetaryCommitments([...this.plans.values()], {
        guardianId: parent.data.parentId,
      }),
    );
  }

  private resolvePlan(planId: string): ServiceResult<FamilyRewardPlan> {
    const stored = this.plans.get(planId);
    return stored
      ? success(this.clonePlan(stored))
      : failure('NOT_FOUND', 'Family Reward plan was not created by this service');
  }

  private savePlan(plan: FamilyRewardPlan): FamilyRewardPlan {
    const stored = this.clonePlan(plan);
    this.plans.set(stored.id, stored);
    return this.clonePlan(stored);
  }

  private clonePlan(plan: FamilyRewardPlan): FamilyRewardPlan {
    return {
      ...plan,
      guardianIds: [...plan.guardianIds],
      promise:
        plan.promise.kind === 'money'
          ? { ...plan.promise, label: { ...plan.promise.label } }
          : { ...plan.promise, label: { ...plan.promise.label } },
      milestone: { ...plan.milestone },
    };
  }

  private authorizeMonetaryChange(
    purpose: SensitiveActionPurpose,
    authority: SessionAuthorityInput,
    proofId?: string,
  ): ServiceResult<true> {
    if (!proofId?.trim()) {
      return failure(
        'PRIVACY_REJECTED',
        'A matching one-use Parent reauthentication proof is required for monetary metadata',
      );
    }
    const authorized = this.access.authorizeSensitiveAction({
      proofId,
      parentSession: authority.session,
      purpose,
      now: authority.now,
    });
    if (!authorized.ok) return authorized;
    if (!authorized.data.consumed || authorized.data.consumedAt === null) {
      return failure(
        'PRIVACY_REJECTED',
        'The reauthentication proof was not consumed for this monetary change',
      );
    }
    return success(true);
  }

  private resolveParent(authority: SessionAuthorityInput) {
    const projected = this.access.projectSession(authority);
    if (!projected.ok) return projected;
    if (
      projected.data.viewKind !== 'parent' ||
      !projected.data.capabilities.includes('manage_family_rewards')
    ) {
      return failure('PRIVACY_REJECTED', 'A stored Parent reward capability is required');
    }
    return success(projected.data);
  }

  private authorizeParent(
    guardianId: string,
    authority: SessionAuthorityInput,
  ): ServiceResult<true> {
    const parent = this.resolveParent(authority);
    if (!parent.ok) return parent;
    if (parent.data.parentId !== guardianId) {
      return failure('PRIVACY_REJECTED', 'The acting Parent is not this promise guardian');
    }
    return success(true);
  }

  private authorizePlanGuardian(
    plan: FamilyRewardPlan,
    authority: SessionAuthorityInput,
  ): ServiceResult<true> {
    const parent = this.resolveParent(authority);
    if (!parent.ok) return parent;
    const privateView = projectFamilyRewardPlan(plan, {
      kind: 'guardian',
      guardianId: parent.data.parentId,
    });
    return privateView.ok
      ? success(true)
      : failure(familyRewardErrorCode(privateView.error.code), privateView.error.message);
  }
}

export class DeterministicFamilyLeagueService implements FamilyLeagueService {
  private readonly weeks = new Map<string, FamilyLeagueWeek>();
  private readonly confirmationRequests = new Map<string, string>();

  constructor(private readonly access: SyntheticAccessService) {}

  evaluateEligibility(candidate: ChallengeLeafCandidate, participant: SyntheticLeagueParticipant) {
    return evaluateChallengeLeafEligibility(candidate, participant);
  }

  createWeek(
    input: CreateLeagueWeekInput,
    authority: SessionAuthorityInput,
    membershipProofId: string,
  ): ReturnType<FamilyLeagueService['createWeek']> {
    const parent = this.authorizeParent(authority, 'manage_league_membership');
    if (!parent.ok) return parent;
    const created = createFamilyLeagueWeek(input);
    if (!created.ok) return fromDomain(created);
    const existing = this.weeks.get(created.data.weekKey);
    const replaceableRolledWeek =
      existing &&
      existing.leaves.length === 0 &&
      Object.keys(existing.confirmationLedger).length === 0 &&
      existing.cooperativeConfirmedCount === 0 &&
      existing.preparedEncouragementLedger.length === 0;
    if (existing && !replaceableRolledWeek) {
      return failure('INVALID_TRANSITION', 'Synthetic League week already exists');
    }
    if (!membershipProofId?.trim()) {
      return failure(
        'PRIVACY_REJECTED',
        'A one-use Parent proof is required to establish League membership',
      );
    }
    const authorized = this.access.authorizeSensitiveAction({
      proofId: membershipProofId,
      parentSession: authority.session,
      purpose: 'change_league_membership',
      now: authority.now,
    });
    return authorized.ok ? this.storeWeek(fromDomain(created)) : authorized;
  }

  confirmLeaf(
    input: ConfirmChallengeLeafInput,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyLeagueService['confirmLeaf']> {
    const validated = confirmChallengeLeaf(input);
    if (!validated.ok) return fromDomain(validated);
    const parent = this.authorizeParent(authority, 'confirm_tasks');
    if (!parent.ok) return parent;
    const current = this.weeks.get(input.week.weekKey);
    const existingCredit = current?.confirmationLedger[input.recognitionKey];
    if (existingCredit) {
      const requestKey = `${input.week.weekKey}:${input.recognitionKey}`;
      const repeatedOriginal = this.confirmationRequests.get(requestKey) === JSON.stringify(input);
      const repeatedCurrent = JSON.stringify(current) === JSON.stringify(input.week);
      return existingCredit.leafId === input.leafId && (repeatedOriginal || repeatedCurrent)
        ? success(this.cloneWeek(current))
        : failure('INVALID_TRANSITION', 'League confirmation retry is stale or forged');
    }
    const stored = this.resolveWeek(input.week);
    if (!stored.ok) return stored;
    const confirmed = confirmChallengeLeaf({ ...input, week: stored.data });
    if (!confirmed.ok) return fromDomain(confirmed);
    this.confirmationRequests.set(
      `${input.week.weekKey}:${input.recognitionKey}`,
      JSON.stringify(input),
    );
    return this.storeWeek(success(confirmed.data));
  }

  calculateResults(
    week: FamilyLeagueWeek,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyLeagueService['calculateResults']> {
    const parent = this.authorizeParent(authority, 'manage_league_membership');
    if (!parent.ok) return parent;
    const stored = this.resolveWeek(week);
    return stored.ok ? fromDomain(calculateWeeklyGrowthResults(stored.data)) : stored;
  }

  projectParticipants(
    weekKey: string,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyLeagueService['projectParticipants']> {
    const viewer = this.authorizeViewer(authority);
    if (!viewer.ok) return viewer;
    const stored = this.resolveWeekKey(weekKey);
    if (!stored.ok) return stored;
    const calculated = calculateWeeklyGrowthResults(stored.data);
    if (!calculated.ok) return fromDomain(calculated);
    return fromDomain(
      projectLeagueParticipants({
        participants: calculated.data.map((item) => ({
          ...item,
          protectedContentPresent: false as const,
        })),
      }),
    );
  }

  sendPreparedEncouragement(
    input: LeagueEncouragementRequest,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyLeagueService['sendPreparedEncouragement']> {
    const projected = this.access.projectSession(authority);
    if (
      !projected.ok ||
      projected.data.viewKind !== 'child' ||
      !projected.data.capabilities.includes('view_own_league')
    ) {
      return failure(
        'PRIVACY_REJECTED',
        'Prepared encouragement sender must match the stored Child session',
      );
    }
    if (
      !input ||
      typeof input !== 'object' ||
      Object.keys(input).sort().join(',') !== 'phraseId,recipientId,weekKey'
    ) {
      return failure('PRIVACY_REJECTED', 'Prepared encouragement input must not include free text');
    }
    const stored = this.resolveWeekKey(input.weekKey);
    if (!stored.ok) return stored;
    const prepared = sendPreparedEncouragement({
      week: stored.data,
      senderId: projected.data.childId,
      recipientId: input.recipientId,
      phraseId: input.phraseId,
    });
    if (!prepared.ok) return fromDomain(prepared, PREPARED_META);
    const existing = stored.data.preparedEncouragementLedger.find(
      (item) => item.id === prepared.data.encouragement.id,
    );
    if (existing) return success({ ...existing, text: { ...existing.text } }, PREPARED_META);
    return this.storeEncouragement(prepared);
  }

  rollover(
    input: LeagueRolloverInput,
    authority: SessionAuthorityInput,
  ): ReturnType<FamilyLeagueService['rollover']> {
    const parent = this.authorizeParent(authority, 'manage_league_membership');
    if (!parent.ok) return parent;
    const stored = this.resolveWeek(input.currentWeek);
    if (!stored.ok) return stored;
    if (this.weeks.has(input.nextWeekKey)) {
      return failure('INVALID_TRANSITION', 'The next synthetic League week already exists');
    }
    const rolled = rolloverFamilyLeagueWeek({ ...input, currentWeek: stored.data });
    if (!rolled.ok) return fromDomain(rolled);
    this.weeks.delete(stored.data.weekKey);
    for (const requestKey of this.confirmationRequests.keys()) {
      if (requestKey.startsWith(`${stored.data.weekKey}:`)) {
        this.confirmationRequests.delete(requestKey);
      }
    }
    const saved = this.storeWeek(success(rolled.data.week));
    return saved.ok ? success({ ...rolled.data, week: saved.data }) : saved;
  }

  private resolveWeek(supplied: FamilyLeagueWeek): ServiceResult<FamilyLeagueWeek> {
    const stored = this.weeks.get(supplied.weekKey);
    if (!stored || JSON.stringify(stored) !== JSON.stringify(supplied)) {
      return failure('INVALID_TRANSITION', 'Synthetic League week state is stale or forged');
    }
    return success(this.cloneWeek(stored));
  }

  private resolveWeekKey(weekKey: string): ServiceResult<FamilyLeagueWeek> {
    if (typeof weekKey !== 'string' || !weekKey.trim()) {
      return failure('INVALID_INPUT', 'Synthetic League week key is required');
    }
    const stored = this.weeks.get(weekKey);
    return stored
      ? success(this.cloneWeek(stored))
      : failure('NOT_FOUND', 'Synthetic League week was not found');
  }

  private storeWeek(result: ServiceResult<FamilyLeagueWeek>): ServiceResult<FamilyLeagueWeek> {
    if (!result.ok) return result;
    const stored = this.cloneWeek(result.data);
    this.weeks.set(stored.weekKey, stored);
    return success(this.cloneWeek(stored), result.meta);
  }

  private storeEncouragement(
    result: DomainResult<PreparedEncouragementApplication>,
  ): ServiceResult<PreparedEncouragement> {
    if (!result.ok) return fromDomain(result, PREPARED_META);
    const saved = this.storeWeek(success(result.data.week, PREPARED_META));
    return saved.ok
      ? success(
          { ...result.data.encouragement, text: { ...result.data.encouragement.text } },
          PREPARED_META,
        )
      : saved;
  }

  private cloneWeek(week: FamilyLeagueWeek): FamilyLeagueWeek {
    return {
      weekKey: week.weekKey,
      timeZone: week.timeZone,
      invitedParticipants: SYNTHETIC_LEAGUE_PARTICIPANTS,
      optedOutParticipantIds: [...week.optedOutParticipantIds],
      leaves: week.leaves.map((leaf) => ({
        ...leaf,
        approvedTaskRef: { ...leaf.approvedTaskRef },
        protectedContent: { ...leaf.protectedContent },
      })),
      confirmationLedger: Object.fromEntries(
        Object.entries(week.confirmationLedger).map(([key, entry]) => [key, { ...entry }]),
      ),
      cooperativeConfirmedCount: week.cooperativeConfirmedCount,
      cooperativeGoal: week.cooperativeGoal,
      preparedEncouragementLedger: week.preparedEncouragementLedger.map((item) => ({
        ...item,
        text: { ...item.text },
      })),
      origin: 'synthetic_local',
    };
  }

  private authorizeParent(
    authority: SessionAuthorityInput,
    capability: Extract<ParentCapability, 'manage_league_membership' | 'confirm_tasks'>,
  ): ServiceResult<true> {
    const projected = this.access.projectSession(authority);
    if (
      !projected.ok ||
      projected.data.viewKind !== 'parent' ||
      !projected.data.capabilities.includes(capability)
    ) {
      return failure('PRIVACY_REJECTED', 'A matching stored Parent League capability is required');
    }
    return success(true);
  }

  private authorizeViewer(authority: SessionAuthorityInput): ServiceResult<true> {
    const projected = this.access.projectSession(authority);
    if (!projected.ok) return projected;
    const allowed =
      (projected.data.viewKind === 'parent' &&
        projected.data.capabilities.includes('manage_league_membership')) ||
      (projected.data.viewKind === 'child' &&
        projected.data.capabilities.includes('view_own_league'));
    return allowed
      ? success(true)
      : failure('PRIVACY_REJECTED', 'The stored session cannot view this synthetic League');
  }
}

export class DeterministicParentSummaryPolicy implements ParentSummaryPolicy {
  validate(summary: ParentPatternSummary): ServiceResult<ParentPatternSummary> {
    return fromDomain(validateParentSummary(summary), PREPARED_META);
  }

  applyLocalCorrection(
    summary: ParentPatternSummary,
    correction: ParentSummaryCorrection,
  ): ServiceResult<ParentSummaryCorrectionAttempt> {
    return fromDomain(applyLocalSummaryCorrection(summary, correction), PREPARED_META);
  }
}

export class DeterministicPrototypeSessionService implements PrototypeSessionService {
  getInitialSession(): PrototypeSession {
    return createInitialPrototypeSession();
  }

  resetPrototype(): ResetResult {
    return {
      session: createInitialPrototypeSession(),
      navigateTo: '/',
      replaceHistory: true,
    };
  }

  validateSession(session: PrototypeSession): ServiceResult<PrototypeSession> {
    if (
      session.schemaVersion !== 3 ||
      session.household.id !== 'household_al_noor' ||
      !session.children.child_salem ||
      !session.children.child_alya ||
      Object.keys(session.landscapeProgress).length !== 5
    ) {
      return failure('INVALID_RESPONSE', 'Prototype Session does not match schema version 3');
    }
    return success(session);
  }
}

export function createFeature003ServiceRegistry(): Feature003ServiceRegistry {
  const access = new DeterministicSyntheticAccessService();
  return {
    task: new DeterministicTaskService(),
    recognition: new DeterministicRecognitionService(),
    garden: new DeterministicGardenService(),
    familyProjection: new DeterministicFamilyProjectionService(),
    media: new DeterministicMediaService(),
    parentGuide: new DeterministicParentGuideProvider(),
    childCoach: new DeterministicChildCoachProvider(),
    coachAdaptation: new DeterministicCoachAdaptationService(),
    syntheticVoice: new DeterministicSyntheticVoiceService(access),
    access,
    familyReward: new DeterministicFamilyRewardService(access),
    familyLeague: new DeterministicFamilyLeagueService(access),
    parentSummary: new DeterministicParentSummaryPolicy(),
    prototypeSession: new DeterministicPrototypeSessionService(),
  };
}
