import { create } from 'zustand';

import {
  createChildVoiceController,
  INITIAL_CHILD_VOICE_VIEW,
  type ChildVoiceCommand,
  type ChildVoiceView,
} from '../features/assistants/childVoiceController';
import { evaluateAssistantSafety, resolveParentGuideFallback } from '../features/assistants/policy';
import { P0_EXECUTABLE_CHOICE, P0_SAFE_EQUIVALENT_TEMPLATE } from '../features/tasks/demoContent';
import {
  matchesCanonicalP0TaskContent,
  validateOptionalTaskReflection,
  validateTaskForReview,
  validateTaskTemplate,
} from '../features/tasks/validation';
import { coerceLocale, getLocaleDirection } from '../models/prototype';
import type {
  ChildCoachIntent,
  ChildCoachResult,
  ChildTaskDraftState,
  CheckInRouteState,
  CompletionMode,
  DomainErrorCode,
  FallbackReason,
  LocalizedText,
  ParentGuideIntent,
  ParentGuideRequest,
  ParentGuideTaskSuggestion,
  PendingConfirmationPlan,
  PreAcceptanceTaskAdjustment,
  PreparedMediaFixture,
  PraisePresentationAction,
  PraisePresentedPlan,
  ProspectiveTaskAdjustment,
  ProspectiveTaskAdjustmentKind,
  PrototypeSession,
  RecognitionAttemptResult,
  RecognitionContinuationAction,
  ResetResult,
  RoutinePhaseReviewOption,
  RoutineProgressState,
  SyntheticChildId,
} from '../models/familyGrowth';
import type { AgeAdaptedCoachResult } from '../models/assistantVoice';
import { serviceRegistry, type ParentGuideService, type ServiceResult } from '../services';

type ConfirmationPlan = PendingConfirmationPlan | PraisePresentedPlan;

const childVoiceController = createChildVoiceController(serviceRegistry);

export interface PrototypeStoreState extends PrototypeSession {
  readonly parentGuideSuggestion: ParentGuideTaskSuggestion | null;
  readonly childCoachResult: ChildCoachResult | null;
  readonly ageAdaptedCoachResult: AgeAdaptedCoachResult | null;
  readonly childVoiceView: ChildVoiceView;
  readonly confirmationPlan: ConfirmationPlan | null;
  readonly lastRecognitionAttempt: RecognitionAttemptResult | null;
  readonly prospectiveTaskAdjustment: ProspectiveTaskAdjustment | null;
  readonly preAcceptanceAdjustment: PreAcceptanceTaskAdjustment | null;
  readonly routineProgressByTask: Readonly<Record<string, RoutineProgressState>>;
  readonly childTaskDraft: ChildTaskDraftState;
  readonly taskDraftRevision: number;

  readonly setLocale: (value: unknown) => void;
  readonly setRole: (role: PrototypeSession['role']) => void;
  readonly switchRole: () => void;
  readonly setActiveChild: (childId: SyntheticChildId) => ServiceResult<SyntheticChildId>;
  readonly resetPrototype: () => ServiceResult<Omit<ResetResult, 'session'>>;
  // Route shell still uses this alias; resetPrototype owns the reset behavior.
  readonly resetDemo: () => ServiceResult<'/'>;

  readonly createTaskDraft: (input: {
    readonly childId: SyntheticChildId;
    readonly templateId: string;
    readonly parentText: LocalizedText;
  }) => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly updateTaskDraftParentText: (
    parentText: LocalizedText,
  ) => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly requestParentGuide: (
    input: { readonly requestId: string; readonly intent: ParentGuideIntent },
    primaryService?: ParentGuideService,
  ) => Promise<ServiceResult<ParentGuideTaskSuggestion>>;
  readonly acceptGuideSuggestion: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly keepParentText: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly reviewTask: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly returnReviewedTaskToDraft: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly approveAssignment: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly chooseAssignment: (
    choiceId: PrototypeSession['choicePool']['seededPreviewChoices'][number]['id'],
  ) => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly startAssignment: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly requestSmallerTask: () => ServiceResult<ProspectiveTaskAdjustment>;
  readonly resolvePreAcceptanceAdjustment: (input: {
    readonly decision: ProspectiveTaskAdjustmentKind;
  }) => ServiceResult<PreAcceptanceTaskAdjustment>;
  readonly respondToPreAcceptanceAdjustment: (
    decision: 'accept' | 'keep_current',
  ) => ServiceResult<PreAcceptanceTaskAdjustment>;
  readonly selectPreparedMedia: (
    fixtureId: PreparedMediaFixture['id'],
  ) => ServiceResult<ChildTaskDraftState>;
  readonly removePreparedMedia: (
    fixtureId: PreparedMediaFixture['id'],
  ) => ServiceResult<ChildTaskDraftState>;
  readonly markPreparedMediaUnavailable: (
    fixtureId: PreparedMediaFixture['id'],
  ) => ServiceResult<ChildTaskDraftState>;
  readonly setChildTaskReflection: (
    reflection: LocalizedText | null,
  ) => ServiceResult<ChildTaskDraftState>;
  readonly setChildVoicePermission: (enabled: boolean) => ServiceResult<ChildVoiceView>;
  readonly prepareChildVoice: () => ServiceResult<ChildVoiceView>;
  readonly runChildVoiceCommand: (command: ChildVoiceCommand) => ServiceResult<ChildVoiceView>;
  readonly requestChildCoach: (input: {
    readonly requestId: string;
    readonly intent: ChildCoachIntent;
    readonly fixtureId?:
      | PrototypeSession['preparedImageFixtureId']
      | PrototypeSession['preparedAudioFixtureId']
      | null;
    readonly templateSelection?: string | null;
  }) => Promise<ServiceResult<ChildCoachResult>>;
  readonly submitTask: (input: {
    readonly definitionAcknowledged: boolean;
    readonly completionMode: CompletionMode;
    readonly helpUsed: LocalizedText | null;
    readonly preparedMediaFixtureId: string | null;
    readonly reflection: LocalizedText | null;
    readonly observableFacts: readonly LocalizedText[];
  }) => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly requestKindRetry: (
    neutralObservation: LocalizedText | null,
  ) => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly resumeRetry: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly planFutureTaskAdjustment: (
    kind: ProspectiveTaskAdjustmentKind,
  ) => ServiceResult<ProspectiveTaskAdjustment>;
  readonly restoreCheckInState: (submissionId: string) => ServiceResult<CheckInRouteState>;
  readonly planConfirmation: (
    input: Parameters<typeof serviceRegistry.recognition.planConfirmation>[1],
  ) => ReturnType<typeof serviceRegistry.recognition.planConfirmation>;
  readonly markPraisePresented: (
    action: PraisePresentationAction,
  ) => ReturnType<typeof serviceRegistry.recognition.markPraisePresented>;
  readonly confirmAndPresentPraise: (
    input: Parameters<typeof serviceRegistry.recognition.planConfirmation>[1],
    action: PraisePresentationAction,
  ) => ReturnType<typeof serviceRegistry.recognition.markPraisePresented>;
  readonly applyRecognition: (
    action: RecognitionContinuationAction,
  ) => ReturnType<typeof serviceRegistry.recognition.applyRecognition>;
  readonly applyRoutinePhaseDecision: (
    taskId: string,
    option: RoutinePhaseReviewOption,
  ) => ServiceResult<RoutineProgressState>;
  readonly reverseRoutinePhaseDecision: (taskId: string) => ServiceResult<RoutineProgressState>;
  readonly consumeCelebration: () => void;
}

function failure(
  code: DomainErrorCode,
  message: string,
  fallbackAvailable = false,
): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable },
  };
}

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

function createEmptyChildTaskDraft(): ChildTaskDraftState {
  return {
    selectedMediaFixtureId: null,
    removedMediaFixtureIds: [],
    unavailableMediaFixtureIds: [],
    reflection: null,
  };
}

function validateActiveChildTask(
  state: PrototypeStoreState,
): ServiceResult<NonNullable<PrototypeSession['journey']>> {
  const journey = state.journey;
  if (state.role !== 'child') {
    return failure('INVALID_TRANSITION', 'Only the Child demo role can edit task-scoped input');
  }
  if (!journey?.assignment || journey.lifecycle !== 'in_progress') {
    return failure('INVALID_TRANSITION', 'An in-progress Parent-approved task is required');
  }
  if (journey.assignment.childId !== state.activeChildId) {
    return failure('NOT_ASSIGNED_CHILD', 'This assignment belongs to another synthetic Child');
  }
  if (
    state.activeAssignmentId !== journey.assignment.id ||
    journey.assignment.taskId !== journey.task.id ||
    journey.assignment.taskVersion !== journey.task.version ||
    journey.task.targetChildId !== journey.assignment.childId
  ) {
    return failure('INVALID_TRANSITION', 'The active assignment no longer matches this task');
  }
  return {
    ok: true,
    data: journey,
    meta: { origin: 'synthetic', fallbackUsed: false },
  };
}

function sessionSnapshot(state: PrototypeStoreState): PrototypeSession {
  return {
    schemaVersion: state.schemaVersion,
    locale: state.locale,
    direction: state.direction,
    role: state.role,
    household: state.household,
    children: state.children,
    activeChildId: state.activeChildId,
    choicePool: state.choicePool,
    activeAssignmentId: state.activeAssignmentId,
    journey: state.journey,
    landscapeProgress: state.landscapeProgress,
    circleGoal: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
    routineProgressByTask: state.routineProgressByTask,
    preparedParentGuideFixtureId: state.preparedParentGuideFixtureId,
    preparedChildCoachFixtureId: state.preparedChildCoachFixtureId,
    preparedImageFixtureId: state.preparedImageFixtureId,
    preparedAudioFixtureId: state.preparedAudioFixtureId,
    assistantMode: state.assistantMode,
    celebration: state.celebration,
  };
}

function guideRequestFromState(
  state: PrototypeStoreState,
  input: { readonly requestId: string; readonly intent: ParentGuideIntent },
): ParentGuideRequest | null {
  const journey = state.journey;
  if (!journey || journey.lifecycle !== 'draft') return null;
  const child = state.children[journey.task.targetChildId];
  return {
    requestId: input.requestId,
    intent: input.intent,
    locale: state.locale,
    child: {
      id: child.id,
      age: child.age,
      ageBand: '9_11',
      synthetic: true,
    },
    parentText: journey.task.parentOriginalText,
    taskTemplateId: journey.task.content.id,
    taskVersion: journey.task.version,
    allowedCategoryId: journey.task.content.categoryId,
    allowedSafety: journey.task.content.safety,
    inputOrigin: 'synthetic',
  };
}

function fallbackReasonFor(code: string): Exclude<FallbackReason, 'remote_not_configured'> {
  switch (code) {
    case 'TIMEOUT':
      return 'timeout';
    case 'INVALID_RESPONSE':
      return 'malformed_response';
    case 'SAFETY_REJECTED':
      return 'safety_rejected';
    default:
      return 'remote_failure';
  }
}

const PARENT_GUIDE_TIMEOUT_MS = 1500;

function requestGuideWithinDeadline(
  service: ParentGuideService,
  request: ParentGuideRequest,
): Promise<ServiceResult<ParentGuideTaskSuggestion>> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ServiceResult<ParentGuideTaskSuggestion>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      finish(failure('TIMEOUT', 'Parent Guide provider exceeded the 1500ms deadline', true));
    }, PARENT_GUIDE_TIMEOUT_MS);

    void Promise.resolve()
      .then(() => service.refineTask(request))
      .then(
        (result) => finish(result),
        () => finish(failure('REMOTE_UNAVAILABLE', 'Parent Guide provider was unavailable', true)),
      );
  });
}

function validateGuideSuggestion(
  request: ParentGuideRequest,
  suggestion: ParentGuideTaskSuggestion,
): boolean {
  if (
    suggestion.originalParentText.ar !== request.parentText.ar ||
    suggestion.originalParentText.en !== request.parentText.en ||
    suggestion.meta.requestId !== request.requestId ||
    suggestion.meta.audience !== 'parent' ||
    suggestion.meta.origin !== 'prepared' ||
    suggestion.meta.fixtureId !== 'guide_recycling_refine_v1' ||
    !suggestion.meta.disclosure.saysAiMayBeWrong ||
    !suggestion.meta.disclosure.saysHumanDecides ||
    !suggestion.meta.disclosure.preparedIsExplicit ||
    suggestion.accepted !== false ||
    suggestion.suggestedContent.id !== request.taskTemplateId ||
    suggestion.suggestedContent.categoryId !== request.allowedCategoryId ||
    JSON.stringify(suggestion.suggestedContent.safety) !== JSON.stringify(request.allowedSafety) ||
    !validateTaskTemplate(suggestion.suggestedContent).ok ||
    !matchesCanonicalP0TaskContent(suggestion.suggestedContent, 'exact_guide')
  ) {
    return false;
  }
  const texts = [
    suggestion.suggestedContent.positiveAction,
    suggestion.suggestedContent.whyItMatters,
    suggestion.suggestedContent.definitionOfDone,
    suggestion.suggestedContent.estimatedEffort,
    suggestion.suggestedContent.permittedHelp,
    suggestion.suggestedContent.supervision,
  ];
  return evaluateAssistantSafety({ audience: 'parent', texts }).accepted;
}

export const usePrototypeStore = create<PrototypeStoreState>((set, get) => ({
  ...serviceRegistry.prototypeSession.getInitialSession(),
  parentGuideSuggestion: null,
  childCoachResult: null,
  ageAdaptedCoachResult: null,
  childVoiceView: INITIAL_CHILD_VOICE_VIEW,
  confirmationPlan: null,
  lastRecognitionAttempt: null,
  prospectiveTaskAdjustment: null,
  preAcceptanceAdjustment: null,
  routineProgressByTask:
    serviceRegistry.prototypeSession.getInitialSession().routineProgressByTask ?? {},
  childTaskDraft: createEmptyChildTaskDraft(),
  taskDraftRevision: 0,

  setLocale: (value) => {
    const locale = coerceLocale(value);
    set({ locale, direction: getLocaleDirection(locale) });
  },

  setRole: (role) => set({ role }),

  switchRole: () => set((state) => ({ role: state.role === 'parent' ? 'child' : 'parent' })),

  setActiveChild: (childId) => {
    if (!get().children[childId]) {
      return failure('NOT_FOUND', 'Synthetic Child was not found');
    }
    set({ activeChildId: childId });
    return {
      ok: true,
      data: childId,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  resetPrototype: () => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Switch to the Parent demo role before reset');
    }
    const voiceReset = childVoiceController.resetPrototype('parent');
    if (!voiceReset.ok) return voiceReset;
    const reset = serviceRegistry.prototypeSession.resetPrototype();
    set((state) => ({
      ...reset.session,
      parentGuideSuggestion: null,
      childCoachResult: null,
      ageAdaptedCoachResult: null,
      childVoiceView: voiceReset.data,
      confirmationPlan: null,
      lastRecognitionAttempt: null,
      prospectiveTaskAdjustment: null,
      preAcceptanceAdjustment: null,
      routineProgressByTask: reset.session.routineProgressByTask ?? {},
      childTaskDraft: createEmptyChildTaskDraft(),
      taskDraftRevision: state.taskDraftRevision + 1,
    }));
    return success({ navigateTo: reset.navigateTo, replaceHistory: reset.replaceHistory });
  },

  resetDemo: () => {
    const result = get().resetPrototype();
    return result.ok ? success(result.data.navigateTo) : result;
  },

  createTaskDraft: (input) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can create a task draft');
    }
    const result = serviceRegistry.task.createDraft(input);
    if (result.ok) {
      set((state) => ({
        activeChildId: input.childId,
        activeAssignmentId: null,
        journey: result.data,
        parentGuideSuggestion: null,
        childCoachResult: null,
        ageAdaptedCoachResult: null,
        confirmationPlan: null,
        lastRecognitionAttempt: null,
        prospectiveTaskAdjustment: null,
        preAcceptanceAdjustment: null,
        childTaskDraft: createEmptyChildTaskDraft(),
        taskDraftRevision: state.taskDraftRevision + 1,
      }));
    }
    return result;
  },

  updateTaskDraftParentText: (parentText) => {
    const { journey, parentGuideSuggestion, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can edit a task draft');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A draft is required');
    if (parentGuideSuggestion) {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Guide suggestion before editing Parent wording',
      );
    }
    const wordingChanged =
      journey.task.parentOriginalText.ar !== parentText.ar ||
      journey.task.parentOriginalText.en !== parentText.en;
    const result = serviceRegistry.task.updateDraftParentText(journey, parentText);
    if (result.ok) {
      set((state) =>
        wordingChanged
          ? {
              journey: result.data,
              parentGuideSuggestion: null,
              taskDraftRevision: state.taskDraftRevision + 1,
            }
          : { journey: result.data },
      );
    }
    return result;
  },

  requestParentGuide: async (input, primaryService = serviceRegistry.parentGuide) => {
    const before = get();
    if (before.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can request Parent guidance');
    }
    if (before.parentGuideSuggestion) {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Guide suggestion before requesting another intent',
      );
    }
    const request = guideRequestFromState(before, input);
    if (!request) return failure('INVALID_TRANSITION', 'A current draft is required');
    const expectedTaskId = before.journey?.task.id;
    const expectedVersion = before.journey?.task.version;
    const expectedDraftRevision = before.taskDraftRevision;
    const requestIsCurrent = () => {
      const state = get();
      return (
        state.journey?.lifecycle === 'draft' &&
        state.journey.task.id === expectedTaskId &&
        state.journey.task.version === expectedVersion &&
        state.taskDraftRevision === expectedDraftRevision
      );
    };

    const result = await requestGuideWithinDeadline(primaryService, request);

    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'The Parent Guide request is stale');
    }

    if (result.ok && validateGuideSuggestion(request, result.data)) {
      set({ parentGuideSuggestion: result.data });
      return result;
    }

    const fallbackReason = result.ok ? 'malformed_response' : fallbackReasonFor(result.error.code);
    const prepared = await serviceRegistry.parentGuide.refineTask(request);
    if (!prepared.ok) return prepared;
    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'The Parent Guide request is stale');
    }
    const fallback = resolveParentGuideFallback({
      request,
      failureReason: fallbackReason,
      preparedSuggestion: prepared.data,
    });
    if (!fallback.ok) return { ok: false, error: fallback.error };
    const serviceResult: ServiceResult<ParentGuideTaskSuggestion> = {
      ok: true,
      data: fallback.data,
      meta: {
        origin: 'prepared',
        fallbackUsed: true,
        fixtureId: fallback.data.meta.fixtureId ?? undefined,
      },
    };
    set({ parentGuideSuggestion: serviceResult.data });
    return serviceResult;
  },

  acceptGuideSuggestion: () => {
    const { journey, parentGuideSuggestion, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can accept Parent guidance');
    }
    if (!journey || !parentGuideSuggestion) {
      return failure('INVALID_TRANSITION', 'A displayed Guide suggestion is required');
    }
    const result = serviceRegistry.task.applyAcceptedGuideSuggestion(
      journey,
      parentGuideSuggestion,
    );
    if (result.ok) {
      set((state) => ({
        journey: result.data,
        parentGuideSuggestion: null,
        taskDraftRevision: state.taskDraftRevision + 1,
      }));
    }
    return result;
  },

  keepParentText: () => {
    const { journey, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can retain Parent wording');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A draft is required');
    const result = serviceRegistry.task.keepParentText(journey);
    if (result.ok) {
      set((state) => ({
        journey: result.data,
        parentGuideSuggestion: null,
        taskDraftRevision: state.taskDraftRevision + 1,
      }));
    }
    return result;
  },

  reviewTask: () => {
    const { journey, parentGuideSuggestion, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can review a task');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A draft is required');
    if (parentGuideSuggestion) {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Guide suggestion before reviewing the task',
      );
    }
    const result = serviceRegistry.task.review(journey);
    if (!result.ok) return result;
    const reviewed = { ...journey, lifecycle: 'reviewed' as const, task: result.data.task };
    set({ journey: reviewed });
    return { ...result, data: reviewed };
  },

  returnReviewedTaskToDraft: () => {
    const { journey, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can return a task to draft');
    }
    if (!journey || journey.lifecycle !== 'reviewed') {
      return failure('INVALID_TRANSITION', 'A reviewed task is required');
    }
    const draft = {
      ...journey,
      lifecycle: 'draft' as const,
      assignment: null,
      submission: null,
      checkIn: null,
    };
    set((state) => ({ journey: draft, taskDraftRevision: state.taskDraftRevision + 1 }));
    return {
      ok: true,
      data: draft,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  approveAssignment: () => {
    const state = get();
    const { journey } = state;
    if (state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can approve an assignment');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A reviewed task is required');
    if (journey.lifecycle === 'assigned') {
      const assignment = journey.assignment;
      const choice = state.choicePool.p0AssignmentChoice;
      if (
        assignment &&
        choice &&
        state.activeAssignmentId === assignment.id &&
        assignment.id === 'assignment_recycling_p0_v1' &&
        assignment.taskId === journey.task.id &&
        assignment.taskVersion === journey.task.version &&
        assignment.childId === journey.task.targetChildId &&
        assignment.childId === 'child_salem' &&
        assignment.approvedByParent === true &&
        assignment.approvalSequence === 1 &&
        assignment.createdAt === '2026-08-26T09:00:00.000Z' &&
        choice.childId === assignment.childId &&
        choice.id === P0_EXECUTABLE_CHOICE.id &&
        choice.taskTemplateId === journey.task.templateId &&
        choice.approvalState === P0_EXECUTABLE_CHOICE.approvalState &&
        choice.demoAvailability === P0_EXECUTABLE_CHOICE.demoAvailability &&
        choice.origin === P0_EXECUTABLE_CHOICE.origin
      ) {
        return {
          ok: true,
          data: journey,
          meta: { origin: 'synthetic', fallbackUsed: false },
        };
      }
      return failure(
        'INVALID_TRANSITION',
        'The existing assignment no longer exactly matches this task, version, Child, and choice',
      );
    }
    const result = serviceRegistry.task.approveAssignment(journey);
    if (!result.ok) return result;
    set((state) => ({
      journey: result.data.journey,
      activeAssignmentId: result.data.journey.assignment?.id ?? null,
      choicePool: {
        ...state.choicePool,
        p0AssignmentChoice: result.data.executableChoice,
      },
    }));
    return { ...result, data: result.data.journey };
  },

  chooseAssignment: (choiceId) => {
    const state = get();
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child demo role can choose an assignment');
    }
    if (
      !state.journey ||
      !state.choicePool.p0AssignmentChoice ||
      choiceId !== state.choicePool.p0AssignmentChoice.id ||
      state.choicePool.p0AssignmentChoice.demoAvailability !== 'p0_executable' ||
      !state.journey.assignment ||
      state.activeAssignmentId !== state.journey.assignment.id ||
      state.choicePool.p0AssignmentChoice.childId !== state.journey.assignment.childId ||
      state.choicePool.p0AssignmentChoice.taskTemplateId !== state.journey.task.templateId
    ) {
      return failure(
        'INVALID_TRANSITION',
        'This preview is display-only; choose the Parent-approved recycling task',
      );
    }
    const result = serviceRegistry.task.chooseAssignment(state.journey, state.activeChildId);
    if (result.ok) set({ journey: result.data });
    return result;
  },

  startAssignment: () => {
    const { activeChildId, journey, role } = get();
    if (role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child demo role can start an assignment');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A chosen assignment is required');
    const result = serviceRegistry.task.startAssignment(journey, activeChildId);
    if (result.ok) set({ journey: result.data });
    return result;
  },

  requestSmallerTask: () => {
    const state = get();
    const journey = state.journey;
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child demo role can request a smaller task');
    }
    if (!journey?.assignment || journey.lifecycle !== 'assigned') {
      return failure(
        'INVALID_TRANSITION',
        'A smaller task must be requested before accepting the active assignment',
      );
    }
    if (journey.assignment.childId !== state.activeChildId) {
      return failure('NOT_ASSIGNED_CHILD', 'This assignment belongs to another synthetic Child');
    }
    if (
      state.activeAssignmentId !== journey.assignment.id ||
      journey.assignment.taskId !== journey.task.id ||
      journey.assignment.taskVersion !== journey.task.version ||
      journey.task.targetChildId !== journey.assignment.childId
    ) {
      return failure('INVALID_TRANSITION', 'The active assignment no longer matches this task');
    }

    const adjustment: ProspectiveTaskAdjustment = {
      kind: 'smaller',
      requestedBy: 'child',
      sourceTaskId: journey.task.id,
      sourceTaskVersion: journey.task.version,
      childId: journey.assignment.childId,
      sourceSubmissionId: null,
      status: 'parent_review_required',
      appliesTo: 'future_task_only',
      origin: 'synthetic_local',
    };
    const negotiation: PreAcceptanceTaskAdjustment = {
      requestId: `pre_acceptance:${journey.assignment.id}:${journey.task.version}`,
      sourceAssignmentId: journey.assignment.id,
      sourceTaskId: journey.task.id,
      sourceTaskVersion: journey.task.version,
      childId: journey.assignment.childId,
      requestedKind: 'smaller',
      resolvedKind: null,
      status: 'parent_review_required',
      proposal: null,
      childDecision: null,
      origin: 'synthetic_local',
    };
    set({ prospectiveTaskAdjustment: adjustment, preAcceptanceAdjustment: negotiation });
    return {
      ok: true,
      data: adjustment,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  resolvePreAcceptanceAdjustment: ({ decision }) => {
    const state = get();
    const journey = state.journey;
    const negotiation = state.preAcceptanceAdjustment;
    if (state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can resolve a task adjustment');
    }
    if (decision !== 'smaller' && decision !== 'safe_equivalent') {
      return failure('INVALID_INPUT', 'Choose a smaller task or a safe equivalent');
    }
    if (
      !journey?.assignment ||
      journey.lifecycle !== 'assigned' ||
      !negotiation ||
      negotiation.status !== 'parent_review_required' ||
      negotiation.sourceAssignmentId !== journey.assignment.id ||
      negotiation.sourceTaskId !== journey.task.id ||
      negotiation.sourceTaskVersion !== journey.task.version ||
      negotiation.childId !== journey.assignment.childId ||
      state.activeAssignmentId !== journey.assignment.id ||
      state.activeChildId !== journey.assignment.childId
    ) {
      return failure('INVALID_TRANSITION', 'The adjustment request is stale or not reviewable');
    }

    const smallerTemplate = serviceRegistry.task
      .listTemplates('green_impact')
      .find((template) => template.id === 'GI01');
    const content = decision === 'smaller' ? smallerTemplate : P0_SAFE_EQUIVALENT_TEMPLATE;
    if (!content) return failure('NOT_FOUND', 'The reviewed smaller task fixture is unavailable');
    const validated = validateTaskTemplate(content);
    if (!validated.ok) return { ok: false, error: validated.error };

    const resolved: PreAcceptanceTaskAdjustment = {
      ...negotiation,
      resolvedKind: decision,
      status: 'child_decision_required',
      proposal: {
        proposedTaskVersion: journey.task.version + 1,
        content: validated.data,
        origin: 'prepared',
      },
      childDecision: null,
    };
    set({ preAcceptanceAdjustment: resolved, prospectiveTaskAdjustment: null });
    return {
      ok: true,
      data: resolved,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  respondToPreAcceptanceAdjustment: (decision) => {
    const state = get();
    const journey = state.journey;
    const negotiation = state.preAcceptanceAdjustment;
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the assigned Child can answer the proposal');
    }
    if (decision !== 'accept' && decision !== 'keep_current') {
      return failure('INVALID_INPUT', 'Choose the proposal or keep the current task');
    }
    if (
      !journey?.assignment ||
      journey.lifecycle !== 'assigned' ||
      !negotiation?.proposal ||
      negotiation.status !== 'child_decision_required' ||
      negotiation.sourceAssignmentId !== journey.assignment.id ||
      negotiation.sourceTaskId !== journey.task.id ||
      negotiation.sourceTaskVersion !== journey.task.version ||
      negotiation.childId !== state.activeChildId ||
      journey.assignment.childId !== state.activeChildId ||
      state.activeAssignmentId !== journey.assignment.id ||
      negotiation.proposal.proposedTaskVersion !== journey.task.version + 1 ||
      !negotiation.resolvedKind ||
      !state.choicePool.p0AssignmentChoice ||
      state.choicePool.p0AssignmentChoice.childId !== journey.assignment.childId ||
      state.choicePool.p0AssignmentChoice.taskTemplateId !== journey.task.templateId
    ) {
      return failure('INVALID_TRANSITION', 'The proposal is stale or belongs to another Child');
    }

    const completed: PreAcceptanceTaskAdjustment = {
      ...negotiation,
      status: decision === 'accept' ? 'accepted' : 'kept_current',
      childDecision: decision,
    };
    if (decision === 'keep_current') {
      set({ preAcceptanceAdjustment: completed });
    } else {
      const proposedTaskVersion = negotiation.proposal.proposedTaskVersion;
      const expectedTemplateId =
        negotiation.resolvedKind === 'smaller' ? 'GI01' : P0_SAFE_EQUIVALENT_TEMPLATE.id;
      if (negotiation.proposal.content.id !== expectedTemplateId) {
        return failure('INVALID_RESPONSE', 'The reviewed replacement provenance is inconsistent');
      }
      const replacementTask = {
        ...journey.task,
        version: proposedTaskVersion,
        templateId: negotiation.proposal.content.id,
        parentOriginalText: { ...journey.task.parentOriginalText },
        acceptedGuideFixtureId: journey.task.acceptedGuideFixtureId,
        content: negotiation.proposal.content,
      };
      const validatedReplacement = validateTaskForReview(replacementTask);
      if (!validatedReplacement.ok) {
        return { ok: false, error: validatedReplacement.error };
      }
      const assignment = { ...journey.assignment, taskVersion: proposedTaskVersion };
      const choice = state.choicePool.p0AssignmentChoice;
      set({
        preAcceptanceAdjustment: completed,
        journey: {
          ...journey,
          task: validatedReplacement.data,
          assignment,
        },
        choicePool: {
          ...state.choicePool,
          p0AssignmentChoice: { ...choice, taskTemplateId: validatedReplacement.data.templateId },
        },
      });
    }
    return {
      ok: true,
      data: completed,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  selectPreparedMedia: (fixtureId) => {
    const state = get();
    const guarded = validateActiveChildTask(state);
    if (!guarded.ok) return guarded;
    const fixture = serviceRegistry.media.listPrepared().find((item) => item.id === fixtureId);
    if (!fixture) return failure('NOT_FOUND', 'Prepared media fixture was not found');
    if (state.childTaskDraft.unavailableMediaFixtureIds.includes(fixtureId)) {
      return failure('INVALID_TRANSITION', 'Unavailable prepared media cannot be selected');
    }
    const next: ChildTaskDraftState = {
      ...state.childTaskDraft,
      selectedMediaFixtureId: fixtureId,
      removedMediaFixtureIds: state.childTaskDraft.removedMediaFixtureIds.filter(
        (id) => id !== fixtureId,
      ),
    };
    set({ childTaskDraft: next });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  removePreparedMedia: (fixtureId) => {
    const state = get();
    const guarded = validateActiveChildTask(state);
    if (!guarded.ok) return guarded;
    if (state.childTaskDraft.selectedMediaFixtureId !== fixtureId) {
      return failure('INVALID_TRANSITION', 'Only the selected prepared media can be removed');
    }
    const next: ChildTaskDraftState = {
      ...state.childTaskDraft,
      selectedMediaFixtureId: null,
      removedMediaFixtureIds: [
        ...state.childTaskDraft.removedMediaFixtureIds.filter((id) => id !== fixtureId),
        fixtureId,
      ],
    };
    set({ childTaskDraft: next });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  markPreparedMediaUnavailable: (fixtureId) => {
    const state = get();
    const guarded = validateActiveChildTask(state);
    if (!guarded.ok) return guarded;
    const fixture = serviceRegistry.media.listPrepared().find((item) => item.id === fixtureId);
    if (!fixture) return failure('NOT_FOUND', 'Prepared media fixture was not found');
    const next: ChildTaskDraftState = {
      ...state.childTaskDraft,
      selectedMediaFixtureId:
        state.childTaskDraft.selectedMediaFixtureId === fixtureId
          ? null
          : state.childTaskDraft.selectedMediaFixtureId,
      unavailableMediaFixtureIds: [
        ...state.childTaskDraft.unavailableMediaFixtureIds.filter((id) => id !== fixtureId),
        fixtureId,
      ],
    };
    set({ childTaskDraft: next });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  setChildTaskReflection: (reflection) => {
    const state = get();
    const guarded = validateActiveChildTask(state);
    if (!guarded.ok) return guarded;
    const normalized = reflection ? { ar: reflection.ar, en: reflection.en } : null;
    const resolved =
      normalized && (normalized.ar.trim() || normalized.en.trim()) ? normalized : null;
    const validated = validateOptionalTaskReflection(resolved);
    if (!validated.ok) return { ok: false, error: validated.error };
    const next: ChildTaskDraftState = { ...state.childTaskDraft, reflection: resolved };
    set({ childTaskDraft: next });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  setChildVoicePermission: (enabled) => {
    const state = get();
    if (state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can change prepared voice permission');
    }
    if (
      !state.journey ||
      (state.journey.lifecycle !== 'reviewed' && state.journey.lifecycle !== 'assigned')
    ) {
      return failure('INVALID_TRANSITION', 'A reviewed task is required');
    }
    const childId = state.journey.assignment?.childId ?? state.journey.task.targetChildId;
    const result = childVoiceController.configureParentPermission({
      actorRole: 'parent',
      childId,
      languagePreference: state.locale,
      enabled,
    });
    if (result.ok) set({ childVoiceView: result.data });
    return result;
  },

  prepareChildVoice: () => {
    const state = get();
    const journey = state.journey;
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child can open the prepared voice rehearsal');
    }
    if (
      !journey?.assignment ||
      (journey.lifecycle !== 'chosen' && journey.lifecycle !== 'in_progress')
    ) {
      return failure('INVALID_TRANSITION', 'An active Parent-approved assignment is required');
    }
    if (journey.assignment.childId !== state.activeChildId) {
      return failure('NOT_ASSIGNED_CHILD', 'This assignment belongs to another synthetic Child');
    }
    const result = childVoiceController.bindActiveTask({
      actorRole: 'child',
      childId: state.activeChildId,
      ageBand: state.children[state.activeChildId].ageBand,
      taskId: journey.task.id,
      approvedTaskVersion: journey.task.version,
      lifecycle: journey.lifecycle,
      approvedByParent: journey.assignment.approvedByParent,
    });
    if (result.ok) set({ childVoiceView: result.data });
    return result;
  },

  runChildVoiceCommand: (command) => {
    const state = get();
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child can use the prepared voice rehearsal');
    }
    const journey = state.journey;
    if (
      !journey?.assignment ||
      (journey.lifecycle !== 'chosen' && journey.lifecycle !== 'in_progress') ||
      journey.assignment.childId !== state.activeChildId ||
      journey.task.id !== state.childVoiceView.taskId ||
      journey.task.version !== state.childVoiceView.approvedTaskVersion ||
      journey.assignment.taskVersion !== journey.task.version
    ) {
      return failure('INVALID_TRANSITION', 'Prepared voice is not bound to the active assignment');
    }
    const result = (() => {
      switch (command.type) {
        case 'start':
          return childVoiceController.start('child');
        case 'stop':
          return childVoiceController.stop('child');
        case 'delete':
          return childVoiceController.deleteBeforeSend('child');
        case 'send':
          return childVoiceController.send('child');
        case 'replay':
          return childVoiceController.replay('child');
        case 'reset':
          return childVoiceController.resetVoice('child');
        case 'playback':
          return childVoiceController.setPlayback('child', {
            captionsEnabled: command.captionsEnabled,
            playbackRate: command.playbackRate,
          });
      }
    })();
    if (result.ok) set({ childVoiceView: result.data });
    return result;
  },

  requestChildCoach: async (input) => {
    const state = get();
    const journey = state.journey;
    if (state.role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child demo role can request task coaching');
    }
    if (
      !journey?.assignment ||
      (journey.lifecycle !== 'chosen' && journey.lifecycle !== 'in_progress')
    ) {
      return failure('INVALID_TRANSITION', 'An active Parent-approved assignment is required');
    }
    if (journey.assignment.childId !== state.activeChildId) {
      return failure('NOT_ASSIGNED_CHILD', 'This assignment belongs to another synthetic Child');
    }
    if (journey.task.version !== 1 || journey.assignment.taskVersion !== 1) {
      return failure(
        'INVALID_TRANSITION',
        'The prepared Coach is bound to the original reviewed task; use the adjusted steps or ask an adult',
        true,
      );
    }
    const request = {
      requestId: input.requestId,
      intent: input.intent,
      locale: state.locale,
      child: {
        id: state.activeChildId,
        ageBand: state.children[state.activeChildId].ageBand,
        synthetic: true as const,
      },
      assignmentId: journey.assignment.id,
      taskId: journey.task.id,
      approvedTaskVersion: journey.task.version,
      lifecycle: journey.lifecycle,
      fixtureId: input.fixtureId ?? null,
      templateSelection: input.templateSelection ?? input.intent,
    };
    const result = await serviceRegistry.childCoach.respond(request);
    if (
      result.ok &&
      get().journey?.task.id === request.taskId &&
      get().journey?.task.version === request.approvedTaskVersion
    ) {
      const adapted = childVoiceController.adaptCoach({
        actorRole: 'child',
        childId: request.child.id,
        ageBand: request.child.ageBand,
        taskId: request.taskId,
        approvedTaskVersion: request.approvedTaskVersion,
        lifecycle: request.lifecycle,
        approvedByParent: true,
      });
      if (!adapted.ok) return adapted;
      set({ childCoachResult: result.data, ageAdaptedCoachResult: adapted.data });
    }
    return result;
  },

  submitTask: (input) => {
    const { activeChildId, journey, role } = get();
    if (role !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child demo role can submit the task');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'An in-progress task is required');
    const result = serviceRegistry.task.submit(journey, activeChildId, input);
    if (result.ok) {
      set({ journey: result.data, confirmationPlan: null, lastRecognitionAttempt: null });
    }
    return result;
  },

  requestKindRetry: (neutralObservation) => {
    const { journey, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can request a kind retry');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A submitted task is required');
    const result = serviceRegistry.task.requestKindRetry(journey, neutralObservation);
    if (result.ok) set({ journey: result.data, confirmationPlan: null });
    return result;
  },

  resumeRetry: () => {
    const { journey, role } = get();
    if (role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can resume a kind retry');
    }
    if (!journey) return failure('INVALID_TRANSITION', 'A retry state is required');
    const result = serviceRegistry.task.resumeRetry(journey);
    if (result.ok) set({ journey: result.data });
    return result;
  },

  planFutureTaskAdjustment: (kind) => {
    const state = get();
    const journey = state.journey;
    if (state.role !== 'parent') {
      return failure(
        'INVALID_TRANSITION',
        'Only the Parent demo role can record a future task adjustment',
      );
    }
    if (kind !== 'smaller' && kind !== 'safe_equivalent') {
      return failure('INVALID_INPUT', 'Choose a smaller task or a safe equivalent');
    }
    if (!journey?.assignment || !journey.submission || journey.lifecycle !== 'submitted') {
      return failure(
        'INVALID_TRANSITION',
        'A submitted task is required to record a future adjustment',
      );
    }
    if (journey.assignment.childId !== state.activeChildId) {
      return failure('NOT_ASSIGNED_CHILD', 'This submission belongs to another synthetic Child');
    }
    if (
      state.activeAssignmentId !== journey.assignment.id ||
      journey.assignment.taskId !== journey.task.id ||
      journey.assignment.taskVersion !== journey.task.version ||
      journey.submission.assignmentId !== journey.assignment.id ||
      journey.submission.taskVersion !== journey.task.version ||
      journey.task.targetChildId !== journey.assignment.childId
    ) {
      return failure('INVALID_TRANSITION', 'The submitted task no longer matches this assignment');
    }

    const adjustment: ProspectiveTaskAdjustment = {
      kind,
      requestedBy: 'parent',
      sourceTaskId: journey.task.id,
      sourceTaskVersion: journey.task.version,
      childId: journey.assignment.childId,
      sourceSubmissionId: journey.submission.id,
      status: 'future_plan_recorded',
      appliesTo: 'future_task_only',
      origin: 'synthetic_local',
    };
    set({ prospectiveTaskAdjustment: adjustment });
    return {
      ok: true,
      data: adjustment,
      meta: { origin: 'synthetic', fallbackUsed: false },
    };
  },

  restoreCheckInState: (submissionId) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can restore a check-in');
    }
    const result = serviceRegistry.recognition.resolveCheckInState(
      sessionSnapshot(get()),
      submissionId,
    );
    if (!result.ok) return result;

    if (result.data.state === 'confirmation_pending') {
      set({
        journey: result.data.journey,
        confirmationPlan: result.data.attempt.plan,
        lastRecognitionAttempt: null,
      });
    } else {
      set({
        journey: result.data.journey,
        confirmationPlan: null,
      });
    }
    return result;
  },

  planConfirmation: (input) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can plan confirmation');
    }
    const result = serviceRegistry.recognition.planConfirmation(sessionSnapshot(get()), input);
    if (result.ok && result.data.disposition === 'pending_praise') {
      set({ journey: result.data.plan.journey, confirmationPlan: result.data.plan });
    } else if (result.ok && result.data.disposition === 'praise_presented') {
      set({ journey: result.data.plan.journey, confirmationPlan: result.data.plan });
    }
    return result;
  },

  markPraisePresented: (action) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can present praise');
    }
    const plan = get().confirmationPlan;
    if (!plan || plan.renderState !== 'confirmation_pending') {
      return failure('INVALID_TRANSITION', 'Confirmation praise is not awaiting presentation');
    }
    const result = serviceRegistry.recognition.markPraisePresented(plan, action);
    if (result.ok) {
      set({ journey: result.data.journey, confirmationPlan: result.data });
    }
    return result;
  },

  confirmAndPresentPraise: (input, action) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can confirm task praise');
    }
    const planned = serviceRegistry.recognition.planConfirmation(sessionSnapshot(get()), input);
    if (!planned.ok) return planned;
    if (planned.data.disposition === 'already_confirmed') {
      return failure('INVALID_TRANSITION', 'This task was already confirmed');
    }
    if (planned.data.disposition === 'praise_presented') {
      set({ journey: planned.data.plan.journey, confirmationPlan: planned.data.plan });
      return {
        ok: true,
        data: planned.data.plan,
        meta: { origin: 'synthetic', fallbackUsed: false },
      };
    }
    const presented = serviceRegistry.recognition.markPraisePresented(planned.data.plan, action);
    if (presented.ok) {
      set({ journey: presented.data.journey, confirmationPlan: presented.data });
    }
    return presented;
  },

  applyRecognition: (action) => {
    if (get().role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent demo role can apply recognition');
    }
    const plan = get().confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      return failure('INVALID_TRANSITION', 'Praise must be visibly presented before recognition');
    }
    const result = serviceRegistry.recognition.applyRecognition(
      sessionSnapshot(get()),
      plan,
      action,
    );
    if (!result.ok || result.data.disposition === 'already_confirmed') return result;

    set({
      ...result.data.session,
      confirmationPlan: plan,
      lastRecognitionAttempt: result.data,
    });
    return result;
  },

  applyRoutinePhaseDecision: (taskId, option) => {
    const state = get();
    if (state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can choose a future routine phase');
    }
    if (option !== 'keep_acquisition' && option !== 'move_future_to_maintenance') {
      return failure('INVALID_INPUT', 'Choose one reviewed future-phase option');
    }
    const progress = state.routineProgressByTask[taskId];
    if (!progress?.phaseReview || progress.taskId !== taskId) {
      return failure('INVALID_TRANSITION', 'A third-completion phase review is required');
    }
    const next: RoutineProgressState = {
      ...progress,
      futurePhase: option === 'keep_acquisition' ? 'acquisition' : 'maintenance',
      decision: {
        selected: option,
        futurePhase: option === 'keep_acquisition' ? 'acquisition' : 'maintenance',
        appliesTo: 'future_completions_only',
        reversibleByParent: true,
        decidedAt: '2026-08-26T10:05:00.000Z',
      },
    };
    set({ routineProgressByTask: { ...state.routineProgressByTask, [taskId]: next } });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  reverseRoutinePhaseDecision: (taskId) => {
    const state = get();
    if (state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can reverse a future phase decision');
    }
    const progress = state.routineProgressByTask[taskId];
    if (!progress?.phaseReview || !progress.decision) {
      return failure('INVALID_TRANSITION', 'A reversible future phase decision is required');
    }
    const next: RoutineProgressState = {
      ...progress,
      futurePhase: 'acquisition',
      decision: null,
    };
    set({ routineProgressByTask: { ...state.routineProgressByTask, [taskId]: next } });
    return { ok: true, data: next, meta: { origin: 'synthetic', fallbackUsed: false } };
  },

  consumeCelebration: () => {
    if (!get().celebration.available) return;
    set({ celebration: { available: true, consumed: true } });
  },
}));

export type PrototypeStoreSnapshot = PrototypeSession;
