import {
  evaluateAssistantSafety,
  applyLocalSummaryCorrection,
  validateChildCoachRequest,
  validateParentGuideIntent,
  validateParentSummary,
} from '../../features/assistants/policy';
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

  // The editable P0 praise surface is structured action/help praise. Whole-field matching keeps
  // labels and inferred character clauses out even when they follow an otherwise valid action.
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
      activeChildId: 'child_salem',
      assignmentId: 'assignment_recycling_p0_v1',
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
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
  return {
    task: new DeterministicTaskService(),
    recognition: new DeterministicRecognitionService(),
    garden: new DeterministicGardenService(),
    familyProjection: new DeterministicFamilyProjectionService(),
    media: new DeterministicMediaService(),
    parentGuide: new DeterministicParentGuideProvider(),
    childCoach: new DeterministicChildCoachProvider(),
    parentSummary: new DeterministicParentSummaryPolicy(),
    prototypeSession: new DeterministicPrototypeSessionService(),
  };
}
