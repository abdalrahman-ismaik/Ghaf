import { create } from 'zustand';

import {
  createChildVoiceController,
  INITIAL_CHILD_VOICE_VIEW,
  type ChildVoiceCommand,
  type ChildVoiceView,
} from '../features/assistants/childVoiceController';
import { evaluateAssistantSafety, resolveParentGuideFallback } from '../features/assistants/policy';
import { createChildAccessController, type ChildAccessView } from '../features/access/childAccess';
import {
  createParentOnboardingController,
  type ParentOnboardingCompletionReceipt,
  type ParentOnboardingDraftPatch,
  type ParentOnboardingHandoff,
  type ParentOnboardingView,
} from '../features/access/parentOnboarding';
import { P0_EXECUTABLE_CHOICE, P0_SAFE_EQUIVALENT_TEMPLATE } from '../features/tasks/demoContent';
import {
  cloneRecognitionBoundaryInput,
  hasCommittedGrowthRecognitionEvidence,
  hasRecognitionAchievementParity,
  hasSeedReceiptGrowthParity,
  validateActivePraisePresentationRequest,
  validateCheckInRouteRequest,
  validateCheckInRouteTransition,
  validateConfirmationPlanningRequest,
  validateConfirmationPlanningTransition,
  validateGrowthJourneyRuntimeBoundary,
  validateRecognitionProviderResult,
  validatePraisePresentationTransition,
  validatePraisePresentationRequest,
  validateRecognitionRequest,
  validateRecognitionSessionTransition,
  type CommittedLearningAchievementEvent,
} from '../features/tasks/recognitionSession';
import {
  validateCheckInRouteProviderResult,
  validateConfirmationProviderResult,
  validatePraisePresentationProviderResult,
} from '../features/tasks/recognitionProviderBoundary';
import {
  matchesCanonicalP0TaskContent,
  validateOptionalTaskReflection,
  validateTaskForReview,
  validateTaskTemplate,
} from '../features/tasks/validation';
import {
  createGrowthJourneyRuntime,
  projectLearningCompletionIntoGrowthJourney,
  projectRecognitionIntoGrowthJourney,
  selectGrowthJourneyProfile,
  type GrowthJourneyRuntimeState,
} from '../features/growth/bootstrap';
import {
  projectParentChildProgress,
  type ParentChildProgressProjection,
  type ParentProgressErrorCode,
} from '../features/growth/parentProgress';
import {
  applyRecognitionToFamilyReward,
  createFamilyRewardRuntime,
  isFamilyRewardRecognitionEligible,
  isValidFamilyRewardRuntimeAuthority,
  markFamilyRewardRuntimeGiven,
  projectFamilyRewardRuntime,
  type FamilyRewardPresentation,
  type FamilyRewardRuntime,
} from '../features/family-hub';
import {
  applyRecognitionToPrivateLeague,
  createPrivateLeagueRecognitionRuntime,
  selectCommittedPrivateLeagueReceipt,
  selectPrivateLeagueRecognitionEligibility,
  type PrivateLeagueRecognitionRuntime,
} from '../features/league/recognitionRuntime';
import {
  constructApprovalReveal,
  reconcileCommittedApprovalReveal,
} from '../features/rewards/approvalReveal';
import {
  acknowledgeRevealBundle,
  archiveRevealBundle,
  constructRevealBundle,
  createEmptyRevealBundleQueue,
  startOrResumeRevealById,
  validateRevealBundleQueue,
} from '../features/rewards/revealBundle';
import {
  advanceMangroveLearningStep as advanceMangroveLearningStepDomain,
  completeMangroveLearning as completeMangroveLearningDomain,
  createMangroveLearningState,
  restoreMangroveLearningState,
  startMangroveLearningRoute as startMangroveLearningRouteDomain,
  submitMangroveLearningCheck as submitMangroveLearningCheckDomain,
} from '../features/learning/mangroveLearning';
import {
  applySharedGrowthParticipationAction as applySharedGrowthParticipationActionDomain,
  createSharedGrowthState,
  projectSharedGrowthView,
  SHARED_GROWTH_QUALITATIVE_FIXTURE,
} from '../features/shared-growth/sharedGrowth';
import { coerceLocale, getLocaleDirection } from '../models/prototype';
import { hasOnlyPlainDataProperties, isPlainDataRecord } from '../utils/exactPlainData';
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
import type { ChildPermissionGrant } from '../models/access';
import type { AgeAdaptedCoachResult } from '../models/assistantVoice';
import type {
  AdvanceLearningStepResult,
  CompleteLearningResult,
  LearningCheckOptionId,
  LearningContentStepId,
  LearningOrigin,
  LearningRoute,
  MangroveLearningState,
  StartLearningRouteResult,
  SubmitLearningCheckResult,
} from '../models/learning';
import type { LearningCompletionEvidence } from '../models/achievements';
import type { ImpactPathThreshold } from '../models/growthJourney';
import type {
  CommittedRevealSourceReceipt,
  RevealBundleErrorCode,
  RevealBundleQueue,
  RevealLifecycleResult,
  RevealPresentationResult,
} from '../models/revealBundle';
import type {
  ParentSharedGrowthConsentReceipt,
  SharedGrowthChildView,
  SharedGrowthErrorCode,
  SharedGrowthParticipationAction,
  SharedGrowthParticipationActionResult,
  SharedGrowthState,
} from '../models/sharedGrowth';
import { serviceRegistry, type ParentGuideService, type ServiceResult } from '../services';

type ConfirmationPlan = PendingConfirmationPlan | PraisePresentedPlan;
type PrototypeJourney = NonNullable<PrototypeSession['journey']>;
type ActiveChildAssignmentJourney = PrototypeJourney & {
  readonly lifecycle: 'chosen' | 'in_progress';
  readonly assignment: NonNullable<PrototypeJourney['assignment']>;
};
type MangroveLearningByProfile = Readonly<Record<SyntheticChildId, MangroveLearningState>>;
type ApprovalRevealCommitments = Readonly<Record<string, string | null>>;

const childVoiceController = createChildVoiceController(serviceRegistry);
const parentOnboardingController = createParentOnboardingController(serviceRegistry.access);
const childAccessController = createChildAccessController(
  serviceRegistry.access,
  parentOnboardingController,
);
const R001_ONBOARDING_TIME = '2026-09-04T10:00:00.000Z';
const initialPrototypeSession = serviceRegistry.prototypeSession.getInitialSession();
const initialGrowthJourney = createGrowthJourneyRuntime(initialPrototypeSession, 0);

if (!initialGrowthJourney.ok) {
  throw new Error(`R002b progression bootstrap failed: ${initialGrowthJourney.error.message}`);
}

function createLearningByProfile(runtime: GrowthJourneyRuntimeState): MangroveLearningByProfile {
  const salem = createMangroveLearningState({
    profileId: 'child_salem',
    profileEpochId: runtime.ledgersByProfile.child_salem.profileEpochId,
  });
  const alya = createMangroveLearningState({
    profileId: 'child_alya',
    profileEpochId: runtime.ledgersByProfile.child_alya.profileEpochId,
  });
  if (!salem.ok || !alya.ok) {
    throw new Error('R002b learning bootstrap failed for the canonical synthetic profiles');
  }
  return Object.freeze({ child_salem: salem.data, child_alya: alya.data });
}

const initialMangroveLearning = createLearningByProfile(initialGrowthJourney.data);
const initialPrivateLeague = createPrivateLeagueRecognitionRuntime({
  profileEpochId: initialGrowthJourney.data.ledgersByProfile.child_salem.profileEpochId,
});

function createInitialSharedGrowth(resetSequence: number): SharedGrowthState {
  const participationEpochId = `shared-growth-epoch-${resetSequence}`;
  const initialConsent: ParentSharedGrowthConsentReceipt = {
    id: `shared-growth-consent-${resetSequence}-1`,
    version: 1,
    parentId: 'parent_al_noor',
    householdId: 'household_al_noor',
    participationEpochId,
    status: 'explicit_parent_consent',
    grantedAt: '2026-09-04T10:00:00.000Z',
    supersedesEndActionId: null,
    origin: 'synthetic',
    capabilityTruth: 'local_prototype_not_authentication',
  };
  const result = createSharedGrowthState({
    householdId: 'household_al_noor',
    participationEpochId,
    initialConsent,
  });
  if (!result.ok) {
    throw new Error(`R002b Shared Growth bootstrap failed: ${result.error.message}`);
  }
  return result.data;
}

const initialSharedGrowth = createInitialSharedGrowth(initialGrowthJourney.data.resetSequence);

export interface PrototypeStoreState extends PrototypeSession {
  readonly activeExperience: 'signed_out' | 'parent' | 'child';
  readonly childAccess: ChildAccessView;
  readonly familyReward: FamilyRewardRuntime;
  readonly growthJourney: GrowthJourneyRuntimeState;
  readonly privateLeague: PrivateLeagueRecognitionRuntime;
  readonly mangroveLearningByProfile: MangroveLearningByProfile;
  readonly sharedGrowth: SharedGrowthState;
  readonly revealBundleQueue: RevealBundleQueue;
  readonly approvalRevealCommitments: ApprovalRevealCommitments;
  readonly parentOnboarding: ParentOnboardingView;
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
  readonly permissionProofSequence: number;

  readonly requestParentVerification: (
    input: Parameters<typeof parentOnboardingController.requestVerification>[0],
  ) => ServiceResult<ParentOnboardingView>;
  readonly verifyParentCode: (code: unknown) => Promise<ServiceResult<ParentOnboardingView>>;
  readonly resendParentVerification: (input: {
    readonly networkAvailable?: boolean;
  }) => ServiceResult<ParentOnboardingView>;
  readonly cancelParentVerification: () => ServiceResult<ParentOnboardingView>;
  readonly updateParentOnboardingDraft: (
    patch: ParentOnboardingDraftPatch,
  ) => ServiceResult<ParentOnboardingView>;
  readonly completeParentOnboarding: () => ServiceResult<ParentOnboardingCompletionReceipt>;
  readonly authorizeParentExperience: () => ServiceResult<ParentOnboardingHandoff>;
  readonly enterParentExperience: () => ServiceResult<ParentOnboardingHandoff>;
  readonly selectChildAccessProfile: (childId: SyntheticChildId) => ServiceResult<ChildAccessView>;
  readonly verifyChildCredential: (value: unknown) => ServiceResult<ChildAccessView>;
  readonly requestChildPairing: () => ServiceResult<ChildAccessView>;
  readonly approveChildPairing: () => ServiceResult<ChildAccessView>;
  readonly handoffApprovedChildPairing: () => ServiceResult<ChildAccessView>;
  readonly completeChildPairing: () => ServiceResult<ChildAccessView>;
  readonly authorizeChildExperience: () => ServiceResult<ChildAccessView>;
  readonly signOutExperience: () => ServiceResult<true>;
  readonly getFamilyReward: () => ServiceResult<FamilyRewardPresentation>;
  readonly markFamilyRewardGiven: () => ServiceResult<FamilyRewardPresentation>;
  readonly getChildPermissionGrant: (
    childId: SyntheticChildId,
  ) => ServiceResult<ChildPermissionGrant>;
  readonly getOwnChildPermissionGrant: () => ServiceResult<ChildPermissionGrant>;
  readonly updateChildPermissionGrant: (input: {
    readonly childId: SyntheticChildId;
    readonly kind: 'voice' | 'media' | 'ai';
    readonly granted: boolean;
    readonly reauthenticationCode: unknown;
  }) => ServiceResult<ChildPermissionGrant>;
  readonly revokeChildDevice: (childId: SyntheticChildId) => ServiceResult<ChildAccessView>;
  readonly getParentChildProgress: (
    profileId: SyntheticChildId,
  ) => ServiceResult<ParentChildProgressProjection>;
  readonly getSharedGrowthChildView: () => ServiceResult<SharedGrowthChildView>;
  readonly changeSharedGrowthParticipation: (input: {
    readonly actionId: string;
    readonly action: SharedGrowthParticipationAction;
    readonly actedAt: string;
    readonly proofId: string;
    readonly freshConsentConfirmed: boolean;
  }) => ServiceResult<SharedGrowthParticipationActionResult>;
  readonly setLocale: (value: unknown) => void;
  readonly setRole: (role: PrototypeSession['role']) => void;
  readonly switchRole: () => void;
  readonly setActiveChild: (childId: SyntheticChildId) => ServiceResult<SyntheticChildId>;
  readonly resetPrototype: () => ServiceResult<Omit<ResetResult, 'session'>>;
  // Route shell still uses this alias; resetPrototype owns the reset behavior.
  readonly resetDemo: () => ServiceResult<'/'>;
  readonly startMangroveLearning: (
    route: LearningRoute,
    origin: LearningOrigin,
  ) => ServiceResult<StartLearningRouteResult>;
  readonly advanceMangroveLearning: (
    route: LearningRoute,
    stepId: LearningContentStepId,
  ) => ServiceResult<AdvanceLearningStepResult>;
  readonly answerMangroveLearningCheck: (
    route: LearningRoute,
    optionId: LearningCheckOptionId,
  ) => ServiceResult<SubmitLearningCheckResult>;
  readonly completeMangroveLearning: (
    route: LearningRoute,
    completedAt: string,
  ) => ServiceResult<CompleteLearningResult>;
  readonly startRevealPresentation: (bundleId: string) => ServiceResult<RevealPresentationResult>;
  readonly acknowledgeRevealPresentation: (
    bundleId: string,
  ) => ServiceResult<RevealLifecycleResult>;
  readonly archiveRevealPresentation: (bundleId: string) => ServiceResult<RevealLifecycleResult>;

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
  readonly consumeCelebration: () => ServiceResult<PrototypeSession['celebration']>;
}

export function selectCanEnterParentExperience(
  state: Pick<PrototypeStoreState, 'parentOnboarding'>,
): boolean {
  return state.parentOnboarding.canEnterParentExperience;
}

export function selectHasActiveParentExperience(
  state: Pick<PrototypeStoreState, 'activeExperience' | 'parentOnboarding' | 'role'>,
): boolean {
  return (
    state.role === 'parent' &&
    state.activeExperience === 'parent' &&
    state.parentOnboarding.canEnterParentExperience
  );
}

export function selectCanEnterChildExperience(
  state: Pick<PrototypeStoreState, 'activeChildId' | 'activeExperience' | 'childAccess' | 'role'>,
): boolean {
  return (
    state.role === 'child' &&
    state.activeExperience === 'child' &&
    state.childAccess.canEnterChildExperience &&
    state.childAccess.selectedChildId === state.activeChildId
  );
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

function hasValidApprovalRevealCommitments(input: {
  readonly session: PrototypeSession;
  readonly queue: RevealBundleQueue;
  readonly commitments: ApprovalRevealCommitments;
}): boolean {
  try {
    if (!validateRevealBundleQueue(input.queue).ok) return false;
    if (!isPlainDataRecord(input.commitments) || !hasOnlyPlainDataProperties(input.commitments)) {
      return false;
    }
    const recognitionKeys = Object.keys(input.session.recognitionLedger);
    const commitmentKeys = Object.keys(input.commitments);
    if (
      recognitionKeys.length !== commitmentKeys.length ||
      recognitionKeys.some((key) => !Object.prototype.hasOwnProperty.call(input.commitments, key))
    ) {
      return false;
    }
    const taskBundles = input.queue.bundles.filter(
      (bundle) => bundle.triggerKind === 'task_approval',
    );
    if (
      taskBundles.some(
        (bundle) =>
          !Object.prototype.hasOwnProperty.call(
            input.session.recognitionLedger,
            bundle.triggerEventId,
          ),
      )
    ) {
      return false;
    }
    return recognitionKeys.every((recognitionKey) => {
      const receipt = input.session.recognitionLedger[recognitionKey];
      const commitment = input.commitments[recognitionKey];
      const matchingBundles = taskBundles.filter(
        (bundle) => bundle.triggerEventId === recognitionKey,
      );
      return receipt?.seedTransaction
        ? typeof commitment === 'string' &&
            commitment.trim().length > 0 &&
            matchingBundles.length === 1 &&
            matchingBundles[0]?.sourceFingerprint === commitment
        : commitment === null && matchingBundles.length === 0;
    });
  } catch {
    return false;
  }
}

function requireActiveParentExperience(state: PrototypeStoreState): ServiceResult<true> {
  if (
    state.role !== 'parent' ||
    !selectHasActiveParentExperience(state) ||
    !parentOnboardingController.authorizeParentExperience(R001_ONBOARDING_TIME).ok
  ) {
    return failure('INVALID_TRANSITION', 'An active synthetic Parent session is required');
  }
  return success(true);
}

function requireActiveChildExperience(state: PrototypeStoreState): ServiceResult<true> {
  if (
    state.role !== 'child' ||
    !selectCanEnterChildExperience(state) ||
    !childAccessController.authorizeChildExperience(R001_ONBOARDING_TIME).ok
  ) {
    return failure('INVALID_TRANSITION', 'An active synthetic Child session is required');
  }
  return success(true);
}

function createEmptyChildTaskDraft(): ChildTaskDraftState {
  return {
    selectedMediaFixtureId: null,
    removedMediaFixtureIds: [],
    unavailableMediaFixtureIds: [],
    reflection: null,
  };
}

function validateActiveChildAssignment(
  state: PrototypeStoreState,
  includeChosen: boolean,
): ServiceResult<ActiveChildAssignmentJourney> {
  const authority = requireActiveChildExperience(state);
  if (!authority.ok) return authority;
  const journey = state.journey;
  const lifecycleAllowed =
    journey?.lifecycle === 'in_progress' || (includeChosen && journey?.lifecycle === 'chosen');
  if (!journey?.assignment || !lifecycleAllowed) {
    return failure(
      'INVALID_TRANSITION',
      includeChosen
        ? 'An active Parent-approved assignment is required'
        : 'An in-progress Parent-approved task is required',
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
  return {
    ok: true,
    data: journey as ActiveChildAssignmentJourney,
    meta: { origin: 'synthetic', fallbackUsed: false },
  };
}

function validateActiveChildTask(
  state: PrototypeStoreState,
): ServiceResult<ActiveChildAssignmentJourney> {
  return validateActiveChildAssignment(state, false);
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

function selectActiveLearningContext(state: PrototypeStoreState): ServiceResult<{
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly learning: MangroveLearningState;
  readonly reachedThresholds: readonly ImpactPathThreshold[];
}> {
  const authority = requireActiveChildExperience(state);
  if (!authority.ok) return authority;
  const profile = selectGrowthJourneyProfile(state.growthJourney, state.activeChildId);
  if (!profile.ok) return failure('INVALID_RESPONSE', profile.error.message);
  const learning = state.mangroveLearningByProfile[state.activeChildId];
  if (
    learning.profileId !== profile.data.profileId ||
    learning.profileEpochId !== profile.data.profileEpochId
  ) {
    return failure('INVALID_RESPONSE', 'Learning state does not match the active Child epoch');
  }
  return success({
    profileId: profile.data.profileId,
    profileEpochId: profile.data.profileEpochId,
    learning,
    reachedThresholds: profile.data.path.reachedThresholds,
  });
}

function learningFailure(message: string): ServiceResult<never> {
  return failure('INVALID_TRANSITION', message);
}

function revealFailure(code: RevealBundleErrorCode, message: string): ServiceResult<never> {
  switch (code) {
    case 'PROFILE_SCOPE_MISMATCH':
    case 'EPOCH_SCOPE_MISMATCH':
      return failure('PRIVACY_REJECTED', message);
    case 'BUNDLE_NOT_FOUND':
      return failure('NOT_FOUND', message);
    case 'INVALID_INPUT':
      return failure('INVALID_INPUT', message);
    case 'QUEUE_CONFLICT':
    case 'BUNDLE_CONFLICT':
    case 'RECEIPT_CONFLICT':
    case 'TRIGGER_SCOPE_MISMATCH':
    case 'UNCOMMITTED_RECEIPT':
      return failure('INVALID_RESPONSE', message);
    case 'INELIGIBLE_TRIGGER':
    case 'INVALID_TRANSITION':
      return failure('INVALID_TRANSITION', message);
  }
}

function activeRevealScope(state: PrototypeStoreState): ServiceResult<{
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
}> {
  const authority = requireActiveChildExperience(state);
  if (!authority.ok) return authority;
  const profile = selectGrowthJourneyProfile(state.growthJourney, state.activeChildId);
  if (!profile.ok) return failure('INVALID_RESPONSE', profile.error.message);
  return success({
    profileId: profile.data.profileId,
    profileEpochId: profile.data.profileEpochId,
  });
}

function parentProgressFailure(
  code: ParentProgressErrorCode,
  message: string,
): ServiceResult<never> {
  switch (code) {
    case 'PARENT_AUTHORITY_REQUIRED':
      return failure('INVALID_TRANSITION', message);
    case 'PROFILE_SCOPE_MISMATCH':
      return failure('PRIVACY_REJECTED', message);
    case 'INVALID_INPUT':
      return failure('INVALID_INPUT', message);
    case 'EPOCH_SCOPE_MISMATCH':
    case 'PROJECTION_ERROR':
      return failure('INVALID_RESPONSE', message);
  }
}

function sharedGrowthFailure(code: SharedGrowthErrorCode, message: string): ServiceResult<never> {
  switch (code) {
    case 'PARENT_AUTHORITY_REQUIRED':
    case 'REAUTHENTICATION_REQUIRED':
    case 'INVALID_TRANSITION':
    case 'ACTION_CONFLICT':
    case 'AUTHORITY_CONFLICT':
    case 'CONSENT_REQUIRED':
    case 'CONSENT_CONFLICT':
      return failure('INVALID_TRANSITION', message);
    case 'PRIVACY_VIOLATION':
    case 'SCOPE_MISMATCH':
    case 'PROFILE_SCOPE_MISMATCH':
      return failure('PRIVACY_REJECTED', message);
    case 'EPOCH_SCOPE_MISMATCH':
    case 'INVALID_STATE':
      return failure('INVALID_RESPONSE', message);
    case 'INVALID_INPUT':
    case 'SIGNAL_CONFLICT':
      return failure('INVALID_INPUT', message);
  }
}

function completionEvidenceFor(
  state: PrototypeStoreState,
  profileId: SyntheticChildId,
): readonly LearningCompletionEvidence[] {
  const completion = state.mangroveLearningByProfile[profileId].completion;
  return completion === null
    ? Object.freeze([])
    : Object.freeze([
        Object.freeze({
          id: completion.id,
          profileId: completion.profileId,
          profileEpochId: completion.profileEpochId,
          learningId: completion.learningId,
          status: 'committed' as const,
        }),
      ]);
}

function learningAchievementEventsFor(
  state: PrototypeStoreState,
): readonly CommittedLearningAchievementEvent[] | null {
  try {
    const events: CommittedLearningAchievementEvent[] = [];
    for (const profileId of ['child_salem', 'child_alya'] as const) {
      const restored = restoreMangroveLearningState(state.mangroveLearningByProfile[profileId]);
      const profileEpochId = state.growthJourney.ledgersByProfile[profileId]?.profileEpochId;
      if (
        !restored.ok ||
        restored.data.profileId !== profileId ||
        restored.data.profileEpochId !== profileEpochId
      ) {
        return null;
      }
      const completion = restored.data.completion;
      if (completion !== null) {
        events.push({
          id: completion.id,
          profileId: completion.profileId,
          profileEpochId: completion.profileEpochId,
          learningId: completion.learningId,
          status: completion.status,
          triggerEventId: completion.triggerEventId,
          completedAt: completion.completedAt,
        });
      }
    }
    return Object.freeze(events);
  } catch {
    return null;
  }
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
  ...initialPrototypeSession,
  activeExperience: 'signed_out',
  childAccess: childAccessController.getView(),
  familyReward: createFamilyRewardRuntime(),
  growthJourney: initialGrowthJourney.data,
  privateLeague: initialPrivateLeague,
  mangroveLearningByProfile: initialMangroveLearning,
  sharedGrowth: initialSharedGrowth,
  revealBundleQueue: createEmptyRevealBundleQueue(),
  approvalRevealCommitments: {},
  parentOnboarding: parentOnboardingController.getView(),
  parentGuideSuggestion: null,
  childCoachResult: null,
  ageAdaptedCoachResult: null,
  childVoiceView: INITIAL_CHILD_VOICE_VIEW,
  confirmationPlan: null,
  lastRecognitionAttempt: null,
  prospectiveTaskAdjustment: null,
  preAcceptanceAdjustment: null,
  routineProgressByTask: initialPrototypeSession.routineProgressByTask ?? {},
  childTaskDraft: createEmptyChildTaskDraft(),
  taskDraftRevision: 0,
  permissionProofSequence: 0,

  requestParentVerification: (input) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before starting Parent verification');
    }
    const result = parentOnboardingController.requestVerification(input);
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  verifyParentCode: async (code) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before verifying Parent access');
    }
    const pending = parentOnboardingController.verifyCode(code);
    set({ parentOnboarding: parentOnboardingController.getView() });
    const result = await pending;
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  resendParentVerification: (input) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before resending Parent verification');
    }
    const result = parentOnboardingController.resendVerification(input);
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  cancelParentVerification: () => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before cancelling Parent verification');
    }
    const result = parentOnboardingController.cancelVerification();
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  updateParentOnboardingDraft: (patch) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before changing Parent setup');
    }
    const result = parentOnboardingController.updateDraft(patch);
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  completeParentOnboarding: () => {
    if (get().activeExperience === 'child') {
      return failure('INVALID_TRANSITION', 'Sign out before completing Parent access');
    }
    const result = parentOnboardingController.complete(R001_ONBOARDING_TIME);
    if (result.ok) {
      const locale = result.data.appLanguage;
      set({
        activeExperience: 'parent',
        parentOnboarding: parentOnboardingController.getView(),
        locale,
        direction: getLocaleDirection(locale),
        role: 'parent',
      });
    } else {
      set({ parentOnboarding: parentOnboardingController.getView() });
    }
    return result;
  },

  authorizeParentExperience: () => {
    const state = get();
    if (state.activeExperience !== 'parent' || state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'An active Parent experience is required');
    }
    return parentOnboardingController.authorizeParentExperience(R001_ONBOARDING_TIME);
  },

  enterParentExperience: () => {
    if (get().activeExperience === 'child') {
      return failure('INVALID_TRANSITION', 'Sign out of the Child experience before Parent access');
    }
    const result = parentOnboardingController.authorizeParentExperience(R001_ONBOARDING_TIME);
    if (result.ok) set({ activeExperience: 'parent', role: 'parent' });
    return result;
  },

  selectChildAccessProfile: (childId) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before choosing a Child profile');
    }
    const result = childAccessController.selectProfile(childId);
    set({ childAccess: childAccessController.getView() });
    return result;
  },

  verifyChildCredential: (value) => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before verifying a Child credential');
    }
    const result = childAccessController.verifyCredential(value, R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView() });
    if (result.ok && result.data.canEnterChildExperience && result.data.selectedChildId) {
      set({
        activeChildId: result.data.selectedChildId,
        activeExperience: 'child',
        role: 'child',
      });
    }
    return result;
  },

  requestChildPairing: () => {
    if (get().activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before requesting Child pairing');
    }
    const result = childAccessController.requestPairing(R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView() });
    return result;
  },

  approveChildPairing: () => {
    const state = get();
    if (state.activeExperience !== 'parent' || state.role !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the active Parent can approve Child pairing');
    }
    const result = childAccessController.approvePairing(R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView() });
    return result;
  },

  handoffApprovedChildPairing: () => {
    const state = get();
    if (
      state.activeExperience !== 'parent' ||
      state.role !== 'parent' ||
      state.childAccess.status !== 'pairing_approved'
    ) {
      return failure(
        'INVALID_TRANSITION',
        'An active Parent and approved Child pairing are required for handoff',
      );
    }
    const signedOut = parentOnboardingController.signOut(R001_ONBOARDING_TIME);
    if (!signedOut.ok) return signedOut;
    set({
      activeExperience: 'signed_out',
      parentOnboarding: parentOnboardingController.getView(),
      role: 'child',
    });
    return success(childAccessController.getView());
  },

  completeChildPairing: () => {
    if (get().activeExperience !== 'signed_out') {
      return failure(
        'INVALID_TRANSITION',
        'Parent approval must hand back before pairing completes',
      );
    }
    const result = childAccessController.completePairing(R001_ONBOARDING_TIME);
    const childAccess = childAccessController.getView();
    set({ childAccess });
    if (result.ok && childAccess.selectedChildId) {
      set({
        activeChildId: childAccess.selectedChildId,
        activeExperience: 'child',
        role: 'child',
      });
    }
    return result;
  },

  authorizeChildExperience: () => {
    const state = get();
    if (
      state.activeExperience !== 'child' ||
      state.role !== 'child' ||
      state.childAccess.selectedChildId !== state.activeChildId
    ) {
      return failure('INVALID_TRANSITION', 'An active Child experience is required');
    }
    return childAccessController.authorizeChildExperience(R001_ONBOARDING_TIME);
  },

  signOutExperience: () => {
    const state = get();
    if (state.activeExperience === 'parent') {
      const result = parentOnboardingController.signOut(R001_ONBOARDING_TIME);
      if (!result.ok) return result;
    } else if (state.activeExperience === 'child') {
      const result = childAccessController.signOut(R001_ONBOARDING_TIME);
      if (!result.ok) return result;
    }
    set({
      activeExperience: 'signed_out',
      childAccess: childAccessController.getView(),
      parentOnboarding: parentOnboardingController.getView(),
    });
    return success(true);
  },

  getFamilyReward: () => {
    const state = get();
    if (!requireActiveParentExperience(state).ok) {
      return failure('PRIVACY_REJECTED', 'Family Reward is available only to the active Parent');
    }
    const projected = projectFamilyRewardRuntime(state.familyReward, {
      kind: 'guardian',
      guardianId: 'parent_al_noor',
    });
    return projected.ok
      ? success(projected.data)
      : failure('PRIVACY_REJECTED', projected.error.message);
  },

  markFamilyRewardGiven: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) {
      return failure('INVALID_TRANSITION', 'Only the active Parent can mark a promise as given');
    }
    const marked = markFamilyRewardRuntimeGiven(state.familyReward, '2026-09-05T10:10:00.000Z');
    if (!marked.ok) return failure('INVALID_TRANSITION', marked.error.message);
    set({ familyReward: marked.data });
    const projected = projectFamilyRewardRuntime(marked.data, {
      kind: 'guardian',
      guardianId: 'parent_al_noor',
    });
    return projected.ok
      ? success(projected.data)
      : failure('INVALID_RESPONSE', projected.error.message);
  },

  getChildPermissionGrant: (childId) => {
    const state = get();
    if (!requireActiveParentExperience(state).ok) {
      return failure('PRIVACY_REJECTED', 'Only the active Parent can view Child permissions');
    }
    return parentOnboardingController.getChildPermissions(childId, R001_ONBOARDING_TIME);
  },

  getOwnChildPermissionGrant: () => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    return childAccessController.getOwnPermissions(R001_ONBOARDING_TIME);
  },

  updateChildPermissionGrant: (input) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) {
      return failure('INVALID_TRANSITION', 'Only the active Parent can change Child permissions');
    }
    const permissionProofSequence = get().permissionProofSequence + 1;
    const result = parentOnboardingController.updateChildPermission({
      childId: input.childId,
      change: { kind: input.kind, granted: input.granted },
      proofId: `r003-permission-${input.childId}-${input.kind}-${permissionProofSequence}`,
      reauthenticationCode: input.reauthenticationCode,
      now: R001_ONBOARDING_TIME,
    });
    if (result.ok) set({ permissionProofSequence });
    return result;
  },

  revokeChildDevice: (childId) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) {
      return failure('INVALID_TRANSITION', 'Only the active Parent can revoke a Child device');
    }
    const result = childAccessController.revokeDevice(childId, R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView() });
    return result;
  },

  getParentChildProgress: (profileId) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.children[profileId]) {
      return failure('NOT_FOUND', 'The selected synthetic Child profile was not found');
    }
    const handoff = parentOnboardingController.authorizeParentReport(
      profileId,
      R001_ONBOARDING_TIME,
    );
    if (!handoff.ok) return handoff;
    const ledger = state.growthJourney.ledgersByProfile[profileId];
    const currentStageEvidence =
      profileId === 'child_salem'
        ? {
            profileId,
            profileEpochId: ledger.profileEpochId,
            landscapeId: 'mangrove' as const,
            cumulativeSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
            stage: state.landscapeProgress.mangrove.stage,
            nextThreshold: state.landscapeProgress.mangrove.nextThreshold,
            symbolicOnly: true as const,
          }
        : null;
    const journey = state.journey?.task.targetChildId === profileId ? state.journey : null;
    const projected = projectParentChildProgress({
      authority: handoff.data,
      runtime: state.growthJourney,
      profileId,
      currentStageEvidence,
      journey,
      learningState: state.mangroveLearningByProfile[profileId],
    });
    return projected.ok
      ? success(projected.data)
      : parentProgressFailure(projected.error.code, projected.error.message);
  },

  getSharedGrowthChildView: () => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    const projected = projectSharedGrowthView({
      aggregate: SHARED_GROWTH_QUALITATIVE_FIXTURE,
      preference: state.sharedGrowth.preference,
    });
    return projected.ok
      ? success(projected.data)
      : sharedGrowthFailure(projected.error.code, projected.error.message);
  },

  changeSharedGrowthParticipation: (input) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const existing = state.sharedGrowth.preference.actionHistory.find(
      (receipt) => receipt.id === input.actionId,
    );
    if (existing) {
      const expectedFreshConsent =
        existing.fromStatus === 'ended' && existing.action === 'continue';
      return existing.action === input.action &&
        existing.actedAt === input.actedAt &&
        existing.reauthenticationId === input.proofId &&
        expectedFreshConsent === input.freshConsentConfirmed
        ? success({ disposition: 'already_applied', state: state.sharedGrowth })
        : failure('INVALID_TRANSITION', 'Participation action identity has conflicting input');
    }
    const preference = state.sharedGrowth.preference;
    const requiresFreshConsent = preference.status === 'ended' && input.action === 'continue';
    if (requiresFreshConsent !== input.freshConsentConfirmed) {
      return failure(
        'INVALID_TRANSITION',
        requiresFreshConsent
          ? 'Fresh explicit Parent consent is required after End'
          : 'Fresh consent is accepted only when returning after End',
      );
    }
    const handoff = parentOnboardingController.authorizeSharedGrowthParticipation({
      proofId: input.proofId,
      participationEpochId: preference.participationEpochId,
      now: input.actedAt,
    });
    if (!handoff.ok) return handoff;
    const lastEndAction = [...preference.actionHistory]
      .reverse()
      .find((receipt) => receipt.action === 'end_participation');
    const freshConsent: ParentSharedGrowthConsentReceipt | null = requiresFreshConsent
      ? {
          id: `shared-growth-consent-${preference.participationEpochId}-${preference.consentReceipts.length + 1}`,
          version: preference.consentReceipts.length + 1,
          parentId: handoff.data.parentId,
          householdId: handoff.data.householdId,
          participationEpochId: preference.participationEpochId,
          status: 'explicit_parent_consent',
          grantedAt: input.actedAt,
          supersedesEndActionId: lastEndAction?.id ?? null,
          origin: 'synthetic',
          capabilityTruth: handoff.data.capabilityTruth,
        }
      : null;
    const applied = applySharedGrowthParticipationActionDomain({
      state: state.sharedGrowth,
      actionId: input.actionId,
      action: input.action,
      actedAt: input.actedAt,
      authority: {
        role: 'parent',
        parentId: handoff.data.parentId,
        householdId: handoff.data.householdId,
        participationEpochId: preference.participationEpochId,
        capability: 'manage_shared_growth_contribution',
        reauthentication: {
          id: handoff.data.reauthentication.id,
          purpose: 'change_shared_growth_participation',
          status: 'verified',
          parentId: handoff.data.parentId,
          householdId: handoff.data.householdId,
          participationEpochId: preference.participationEpochId,
          issuedAt: handoff.data.reauthentication.issuedAt,
          expiresAt: handoff.data.reauthentication.expiresAt,
          consumed: false,
          origin: 'synthetic',
          capabilityTruth: handoff.data.capabilityTruth,
        },
        origin: 'synthetic',
        capabilityTruth: handoff.data.capabilityTruth,
      },
      freshConsent,
    });
    if (!applied.ok) return sharedGrowthFailure(applied.error.code, applied.error.message);
    set({ sharedGrowth: applied.data.state });
    return success(applied.data);
  },

  setLocale: (value) => {
    const locale = coerceLocale(value);
    set({ locale, direction: getLocaleDirection(locale) });
  },

  setRole: (role) => set({ role }),

  switchRole: () => set((state) => ({ role: state.role === 'parent' ? 'child' : 'parent' })),

  setActiveChild: (childId) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.children[childId]) {
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
    const state = get();
    if (state.role !== 'parent' || state.activeExperience !== 'parent') {
      return failure('INVALID_TRANSITION', 'An active Parent experience is required before reset');
    }
    const reset = serviceRegistry.prototypeSession.resetPrototype();
    const nextGrowthJourney = createGrowthJourneyRuntime(
      reset.session,
      get().growthJourney.resetSequence + 1,
    );
    if (!nextGrowthJourney.ok) {
      return failure('INVALID_RESPONSE', nextGrowthJourney.error.message);
    }
    const nextMangroveLearning = createLearningByProfile(nextGrowthJourney.data);
    const nextPrivateLeague = createPrivateLeagueRecognitionRuntime({
      profileEpochId: nextGrowthJourney.data.ledgersByProfile.child_salem.profileEpochId,
    });
    const nextSharedGrowth = createInitialSharedGrowth(nextGrowthJourney.data.resetSequence);
    const voiceReset = childVoiceController.resetPrototype('parent');
    if (!voiceReset.ok) return voiceReset;
    const onboardingReset = parentOnboardingController.reset(R001_ONBOARDING_TIME);
    if (!onboardingReset.ok) return onboardingReset;
    const accessReset = serviceRegistry.access.resetPrototype();
    if (!accessReset.ok) return accessReset;
    const releasedVoiceView = childVoiceController.releaseAccessAuthorityAfterPrototypeReset();
    set((state) => ({
      ...reset.session,
      activeExperience: 'signed_out',
      childAccess: childAccessController.reset(),
      familyReward: createFamilyRewardRuntime(),
      growthJourney: nextGrowthJourney.data,
      privateLeague: nextPrivateLeague,
      mangroveLearningByProfile: nextMangroveLearning,
      sharedGrowth: nextSharedGrowth,
      revealBundleQueue: createEmptyRevealBundleQueue(),
      approvalRevealCommitments: {},
      parentOnboarding: onboardingReset.data,
      parentGuideSuggestion: null,
      childCoachResult: null,
      ageAdaptedCoachResult: null,
      childVoiceView: releasedVoiceView,
      confirmationPlan: null,
      lastRecognitionAttempt: null,
      prospectiveTaskAdjustment: null,
      preAcceptanceAdjustment: null,
      routineProgressByTask: reset.session.routineProgressByTask ?? {},
      childTaskDraft: createEmptyChildTaskDraft(),
      taskDraftRevision: state.taskDraftRevision + 1,
      permissionProofSequence: 0,
    }));
    return success({ navigateTo: reset.navigateTo, replaceHistory: reset.replaceHistory });
  },

  resetDemo: () => {
    const result = get().resetPrototype();
    return result.ok ? success(result.data.navigateTo) : result;
  },

  startMangroveLearning: (route, origin) => {
    const context = selectActiveLearningContext(get());
    if (!context.ok) return context;
    const unlocked = context.data.reachedThresholds.includes(132);
    const result = startMangroveLearningRouteDomain({
      state: context.data.learning,
      profileId: context.data.profileId,
      profileEpochId: context.data.profileEpochId,
      route,
      origin,
      ...(unlocked
        ? {
            unlockEvidence: {
              profileId: context.data.profileId,
              profileEpochId: context.data.profileEpochId,
              source: 'canonical_impact_path_projection',
              reachedThresholds: context.data.reachedThresholds,
            },
          }
        : {}),
    });
    if (!result.ok) return learningFailure(result.error.message);
    set((state) => ({
      mangroveLearningByProfile: Object.freeze({
        ...state.mangroveLearningByProfile,
        [context.data.profileId]: result.data.state,
      }),
    }));
    return success(result.data);
  },

  advanceMangroveLearning: (route, stepId) => {
    const context = selectActiveLearningContext(get());
    if (!context.ok) return context;
    const result = advanceMangroveLearningStepDomain({
      state: context.data.learning,
      profileId: context.data.profileId,
      profileEpochId: context.data.profileEpochId,
      route,
      stepId,
    });
    if (!result.ok) return learningFailure(result.error.message);
    set((state) => ({
      mangroveLearningByProfile: Object.freeze({
        ...state.mangroveLearningByProfile,
        [context.data.profileId]: result.data.state,
      }),
    }));
    return success(result.data);
  },

  answerMangroveLearningCheck: (route, optionId) => {
    const context = selectActiveLearningContext(get());
    if (!context.ok) return context;
    const result = submitMangroveLearningCheckDomain({
      state: context.data.learning,
      profileId: context.data.profileId,
      profileEpochId: context.data.profileEpochId,
      route,
      optionId,
    });
    if (!result.ok) return learningFailure(result.error.message);
    set((state) => ({
      mangroveLearningByProfile: Object.freeze({
        ...state.mangroveLearningByProfile,
        [context.data.profileId]: result.data.state,
      }),
    }));
    return success(result.data);
  },

  completeMangroveLearning: (route, completedAt) => {
    const context = selectActiveLearningContext(get());
    if (!context.ok) return context;
    const completed = completeMangroveLearningDomain({
      state: context.data.learning,
      profileId: context.data.profileId,
      profileEpochId: context.data.profileEpochId,
      route,
      completedAt,
    });
    if (!completed.ok) return learningFailure(completed.error.message);
    const currentState = get();
    const projected = projectLearningCompletionIntoGrowthJourney({
      runtime: currentState.growthJourney,
      learningState: completed.data.state,
    });
    if (!projected.ok) return failure('INVALID_RESPONSE', projected.error.message);

    const receipts: CommittedRevealSourceReceipt[] = [];
    const achievements = projected.data.runtime.achievementsByProfile[context.data.profileId];
    for (const badgeId of projected.data.newlyEarnedBadgeIds) {
      const award = achievements.awards.find(
        (candidate) =>
          candidate.badgeId === badgeId &&
          candidate.sourceEventId === completed.data.event.triggerEventId,
      );
      if (!award || award.earnedAt === null || !award.celebrationEligible) {
        return failure(
          'INVALID_RESPONSE',
          'A newly earned learning badge must have committed live award evidence',
        );
      }
      receipts.push({
        id: `reveal-receipt:${award.id}:${completed.data.event.triggerEventId}`,
        authority: 'achievements',
        profileId: context.data.profileId,
        profileEpochId: context.data.profileEpochId,
        triggerEventId: completed.data.event.triggerEventId,
        triggerKind: 'learning_completion',
        status: 'committed',
        committedAt: award.earnedAt,
        consequence: {
          kind: 'earned_badge',
          awardId: award.id,
          badgeId: award.badgeId,
          newlyEarned: true,
          earnedAt: award.earnedAt,
          private: true,
          permanent: true,
        },
      });
    }
    const reveal = constructRevealBundle({
      queue: currentState.revealBundleQueue,
      profileId: context.data.profileId,
      profileEpochId: context.data.profileEpochId,
      triggerEventId: completed.data.event.triggerEventId,
      triggerKind: 'learning_completion',
      triggeredAt: completed.data.event.completedAt,
      receipts,
    });
    if (!reveal.ok) return revealFailure(reveal.error.code, reveal.error.message);

    set((state) => ({
      mangroveLearningByProfile: Object.freeze({
        ...state.mangroveLearningByProfile,
        [context.data.profileId]: completed.data.state,
      }),
      growthJourney: projected.data.runtime,
      revealBundleQueue: reveal.data.queue,
    }));
    return success(completed.data);
  },

  startRevealPresentation: (bundleId) => {
    const state = get();
    const scope = activeRevealScope(state);
    if (!scope.ok) return scope;
    const result = startOrResumeRevealById(state.revealBundleQueue, bundleId, scope.data);
    if (!result.ok) return revealFailure(result.error.code, result.error.message);
    set({ revealBundleQueue: result.data.queue });
    return success(result.data);
  },

  acknowledgeRevealPresentation: (bundleId) => {
    const state = get();
    const scope = activeRevealScope(state);
    if (!scope.ok) return scope;
    const result = acknowledgeRevealBundle(state.revealBundleQueue, bundleId, scope.data);
    if (!result.ok) return revealFailure(result.error.code, result.error.message);
    set({ revealBundleQueue: result.data.queue });
    return success(result.data);
  },

  archiveRevealPresentation: (bundleId) => {
    const state = get();
    const scope = activeRevealScope(state);
    if (!scope.ok) return scope;
    const result = archiveRevealBundle(state.revealBundleQueue, bundleId, scope.data);
    if (!result.ok) return revealFailure(result.error.code, result.error.message);
    set({ revealBundleQueue: result.data.queue });
    return success(result.data);
  },

  createTaskDraft: (input) => {
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
    const result = serviceRegistry.task.createDraft(input);
    if (result.ok) {
      const clearedVoice = childVoiceController.clearTaskBinding('parent');
      if (!clearedVoice.ok) return clearedVoice;
      set((state) => ({
        activeChildId: input.childId,
        activeAssignmentId: null,
        journey: result.data,
        parentGuideSuggestion: null,
        childCoachResult: null,
        ageAdaptedCoachResult: null,
        childVoiceView: clearedVoice.data,
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey, parentGuideSuggestion } = state;
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
    const authority = requireActiveParentExperience(before);
    if (!authority.ok) return authority;
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
        requireActiveParentExperience(state).ok &&
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey, parentGuideSuggestion } = state;
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey } = state;
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey, parentGuideSuggestion } = state;
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey } = state;
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
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
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
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    const { activeChildId, journey } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'A chosen assignment is required');
    const result = serviceRegistry.task.startAssignment(journey, activeChildId);
    if (result.ok) set({ journey: result.data });
    return result;
  },

  requestSmallerTask: () => {
    const state = get();
    const journey = state.journey;
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const guarded = validateActiveChildAssignment(state, true);
    if (!guarded.ok) return guarded;
    const journey = guarded.data;
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
    const guarded = validateActiveChildAssignment(state, true);
    if (!guarded.ok) return guarded;
    const journey = guarded.data;
    if (
      journey.task.id !== state.childVoiceView.taskId ||
      journey.task.version !== state.childVoiceView.approvedTaskVersion
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
    const guarded = validateActiveChildAssignment(state, true);
    if (!guarded.ok) return guarded;
    const journey = guarded.data;
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
    const currentState = get();
    const currentAssignment = validateActiveChildAssignment(currentState, true);
    if (
      !currentAssignment.ok ||
      currentState.activeChildId !== request.child.id ||
      currentAssignment.data.assignment.id !== request.assignmentId ||
      currentAssignment.data.task.id !== request.taskId ||
      currentAssignment.data.task.version !== request.approvedTaskVersion
    ) {
      return failure('INVALID_TRANSITION', 'The Child Coach request is stale');
    }
    if (
      result.ok &&
      currentAssignment.data.task.id === request.taskId &&
      currentAssignment.data.task.version === request.approvedTaskVersion
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
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    const { activeChildId, journey } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'An in-progress task is required');
    const result = serviceRegistry.task.submit(journey, activeChildId, input);
    if (result.ok) {
      set({ journey: result.data, confirmationPlan: null, lastRecognitionAttempt: null });
    }
    return result;
  },

  requestKindRetry: (neutralObservation) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'A submitted task is required');
    const result = serviceRegistry.task.requestKindRetry(journey, neutralObservation);
    if (result.ok) set({ journey: result.data, confirmationPlan: null });
    return result;
  },

  resumeRetry: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'A retry state is required');
    const result = serviceRegistry.task.resumeRetry(journey);
    if (result.ok) set({ journey: result.data });
    return result;
  },

  planFutureTaskAdjustment: (kind) => {
    const state = get();
    const journey = state.journey;
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const snapshot = sessionSnapshot(state);
    if (
      !hasValidApprovalRevealCommitments({
        session: snapshot,
        queue: state.revealBundleQueue,
        commitments: state.approvalRevealCommitments,
      })
    ) {
      return failure('INVALID_RESPONSE', 'Stored approval Reveal authority is inconsistent');
    }
    const requestAuthority = validateCheckInRouteRequest({
      session: snapshot,
      submissionId,
    });
    if (!requestAuthority.ok) {
      return failure(requestAuthority.error.code, requestAuthority.error.message);
    }
    const baselineSession = cloneRecognitionBoundaryInput(snapshot);
    const providerSession = cloneRecognitionBoundaryInput(snapshot);
    if (!baselineSession.ok || !providerSession.ok) {
      return failure('INVALID_TRANSITION', 'Check-in authority could not be isolated');
    }
    let providerResult: unknown;
    try {
      providerResult = serviceRegistry.recognition.resolveCheckInState(
        providerSession.data,
        submissionId,
      );
    } catch {
      return failure('INVALID_RESPONSE', 'Check-in provider failed outside its result boundary');
    }
    const normalizedResult = validateCheckInRouteProviderResult(providerResult);
    if (!normalizedResult.ok) return failure('INVALID_RESPONSE', normalizedResult.error.message);
    const result = normalizedResult.data;
    if (!result.ok) return result;
    const transition = validateCheckInRouteTransition({
      session: baselineSession.data,
      submissionId,
      route: result.data as unknown as CheckInRouteState,
    });
    if (!transition.ok) return failure('INVALID_RESPONSE', transition.error.message);
    const storeRoute = cloneRecognitionBoundaryInput(transition.data);
    const callerResult = cloneRecognitionBoundaryInput({ ...result, data: transition.data });
    if (!storeRoute.ok || !callerResult.ok) {
      return failure('INVALID_RESPONSE', 'Check-in route could not be detached');
    }

    if (storeRoute.data.state === 'confirmation_pending') {
      set({
        journey: storeRoute.data.journey,
        confirmationPlan: storeRoute.data.attempt.plan,
        lastRecognitionAttempt: null,
      });
    } else {
      set({
        journey: storeRoute.data.journey,
        confirmationPlan: null,
      });
    }
    return callerResult.data as unknown as ServiceResult<CheckInRouteState>;
  },

  planConfirmation: (input) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const session = sessionSnapshot(state);
    if (
      !hasValidApprovalRevealCommitments({
        session,
        queue: state.revealBundleQueue,
        commitments: state.approvalRevealCommitments,
      })
    ) {
      return failure('INVALID_RESPONSE', 'Stored approval Reveal authority is inconsistent');
    }
    const requestAuthority = validateConfirmationPlanningRequest({ session, request: input });
    if (!requestAuthority.ok) {
      return failure(requestAuthority.error.code, requestAuthority.error.message);
    }
    const providerInput = cloneRecognitionBoundaryInput({ session, input });
    if (!providerInput.ok) return failure('INVALID_TRANSITION', providerInput.error.message);
    let providerResult: unknown;
    try {
      providerResult = serviceRegistry.recognition.planConfirmation(
        providerInput.data.session,
        providerInput.data.input,
      );
    } catch {
      return failure(
        'INVALID_RESPONSE',
        'Confirmation provider failed outside its result boundary',
      );
    }
    const normalizedResult = validateConfirmationProviderResult(providerResult);
    if (!normalizedResult.ok) return failure('INVALID_RESPONSE', normalizedResult.error.message);
    const result = normalizedResult.data;
    if (!result.ok) return result;
    const transition = validateConfirmationPlanningTransition({
      session,
      request: input,
      attempt: result.data,
    });
    if (!transition.ok) return failure('INVALID_RESPONSE', transition.error.message);
    const storeAttempt = cloneRecognitionBoundaryInput(transition.data);
    const callerResult = cloneRecognitionBoundaryInput({ ...result, data: transition.data });
    if (!storeAttempt.ok || !callerResult.ok) {
      return failure('INVALID_RESPONSE', 'Confirmation result could not be detached');
    }
    if (
      storeAttempt.data.disposition === 'pending_praise' ||
      storeAttempt.data.disposition === 'praise_presented'
    ) {
      set({
        journey: storeAttempt.data.plan.journey,
        confirmationPlan: storeAttempt.data.plan,
      });
    }
    return callerResult.data;
  },

  markPraisePresented: (action) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const session = sessionSnapshot(state);
    if (
      !hasValidApprovalRevealCommitments({
        session,
        queue: state.revealBundleQueue,
        commitments: state.approvalRevealCommitments,
      })
    ) {
      return failure('INVALID_RESPONSE', 'Stored approval Reveal authority is inconsistent');
    }
    const storedPlan = cloneRecognitionBoundaryInput(state.confirmationPlan);
    if (!storedPlan.ok) {
      return failure('INVALID_RESPONSE', 'Stored confirmation plan is malformed');
    }
    const plan = storedPlan.data;
    if (!plan || plan.renderState !== 'confirmation_pending') {
      return failure('INVALID_TRANSITION', 'Confirmation praise is not awaiting presentation');
    }
    const requestAuthority = validateActivePraisePresentationRequest({
      session,
      pendingPlan: plan,
      action,
    });
    if (!requestAuthority.ok) {
      return failure(requestAuthority.error.code, requestAuthority.error.message);
    }
    const isolatedInput = cloneRecognitionBoundaryInput({ plan, action });
    if (!isolatedInput.ok) {
      return failure('INVALID_TRANSITION', isolatedInput.error.message);
    }
    let providerResult: unknown;
    try {
      providerResult = serviceRegistry.recognition.markPraisePresented(
        isolatedInput.data.plan,
        isolatedInput.data.action,
      );
    } catch {
      return failure(
        'INVALID_RESPONSE',
        'Praise presentation provider failed outside its result boundary',
      );
    }
    const normalizedResult = validatePraisePresentationProviderResult(providerResult);
    if (!normalizedResult.ok) return failure('INVALID_RESPONSE', normalizedResult.error.message);
    const result = normalizedResult.data;
    if (!result.ok) return result;
    const transition = validatePraisePresentationTransition({
      pendingPlan: plan,
      action,
      presentedPlan: result.data,
    });
    if (!transition.ok) return failure('INVALID_RESPONSE', transition.error.message);
    const storePlan = cloneRecognitionBoundaryInput(transition.data);
    const callerResult = cloneRecognitionBoundaryInput({ ...result, data: transition.data });
    if (!storePlan.ok || !callerResult.ok) {
      return failure('INVALID_RESPONSE', 'Praise presentation could not be detached');
    }
    set({ journey: storePlan.data.journey, confirmationPlan: storePlan.data });
    return callerResult.data;
  },

  confirmAndPresentPraise: (input, action) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const session = sessionSnapshot(state);
    if (
      !hasValidApprovalRevealCommitments({
        session,
        queue: state.revealBundleQueue,
        commitments: state.approvalRevealCommitments,
      })
    ) {
      return failure('INVALID_RESPONSE', 'Stored approval Reveal authority is inconsistent');
    }
    const planningAuthority = validateConfirmationPlanningRequest({ session, request: input });
    if (!planningAuthority.ok) {
      return failure(planningAuthority.error.code, planningAuthority.error.message);
    }
    const providerInput = cloneRecognitionBoundaryInput({
      session,
      input,
      action,
    });
    if (!providerInput.ok) return failure('INVALID_TRANSITION', providerInput.error.message);
    let providerPlanned: unknown;
    try {
      providerPlanned = serviceRegistry.recognition.planConfirmation(
        providerInput.data.session,
        providerInput.data.input,
      );
    } catch {
      return failure(
        'INVALID_RESPONSE',
        'Confirmation provider failed outside its result boundary',
      );
    }
    const normalizedPlanned = validateConfirmationProviderResult(providerPlanned);
    if (!normalizedPlanned.ok) return failure('INVALID_RESPONSE', normalizedPlanned.error.message);
    const planned = normalizedPlanned.data;
    if (!planned.ok) return planned;
    const plannedTransition = validateConfirmationPlanningTransition({
      session,
      request: input,
      attempt: planned.data,
    });
    if (!plannedTransition.ok) {
      return failure('INVALID_RESPONSE', plannedTransition.error.message);
    }
    const validatedPlanned = plannedTransition.data;
    if (validatedPlanned.disposition === 'already_confirmed') {
      return failure('INVALID_TRANSITION', 'This task was already confirmed');
    }
    if (validatedPlanned.disposition === 'praise_presented') {
      const storePlan = cloneRecognitionBoundaryInput(validatedPlanned.plan);
      const callerResult = cloneRecognitionBoundaryInput({
        ok: true,
        data: validatedPlanned.plan,
        meta: { origin: 'synthetic', fallbackUsed: false },
      } as const);
      if (!storePlan.ok || !callerResult.ok) {
        return failure('INVALID_RESPONSE', 'Presented confirmation could not be detached');
      }
      set({ journey: storePlan.data.journey, confirmationPlan: storePlan.data });
      return callerResult.data;
    }
    const presentedPlan = validatedPlanned.plan;
    const presentationAuthority = validatePraisePresentationRequest({
      pendingPlan: presentedPlan,
      action,
    });
    if (!presentationAuthority.ok) {
      return failure(presentationAuthority.error.code, presentationAuthority.error.message);
    }
    const providerPresentationInput = cloneRecognitionBoundaryInput({
      plan: presentedPlan,
      action,
    });
    if (!providerPresentationInput.ok) {
      return failure('INVALID_TRANSITION', providerPresentationInput.error.message);
    }
    let providerPresented: unknown;
    try {
      providerPresented = serviceRegistry.recognition.markPraisePresented(
        providerPresentationInput.data.plan,
        providerPresentationInput.data.action,
      );
    } catch {
      return failure(
        'INVALID_RESPONSE',
        'Praise presentation provider failed outside its result boundary',
      );
    }
    const normalizedPresented = validatePraisePresentationProviderResult(providerPresented);
    if (!normalizedPresented.ok) {
      return failure('INVALID_RESPONSE', normalizedPresented.error.message);
    }
    const presented = normalizedPresented.data;
    if (!presented.ok) return presented;
    const transition = validatePraisePresentationTransition({
      pendingPlan: presentedPlan,
      action,
      presentedPlan: presented.data,
    });
    if (!transition.ok) return failure('INVALID_RESPONSE', transition.error.message);
    const storePlan = cloneRecognitionBoundaryInput(transition.data);
    const callerResult = cloneRecognitionBoundaryInput({ ...presented, data: transition.data });
    if (!storePlan.ok || !callerResult.ok) {
      return failure('INVALID_RESPONSE', 'Praise presentation could not be detached');
    }
    set({ journey: storePlan.data.journey, confirmationPlan: storePlan.data });
    return callerResult.data;
  },

  applyRecognition: (action) => {
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
    const storedPlan = cloneRecognitionBoundaryInput(get().confirmationPlan);
    if (!storedPlan.ok) {
      return failure('INVALID_RESPONSE', 'Stored confirmation plan is malformed');
    }
    const plan = storedPlan.data;
    if (!plan || plan.renderState !== 'praise_presented') {
      return failure('INVALID_TRANSITION', 'Praise must be visibly presented before recognition');
    }
    const before = get();
    const snapshot = sessionSnapshot(before);
    if (
      !hasValidApprovalRevealCommitments({
        session: snapshot,
        queue: before.revealBundleQueue,
        commitments: before.approvalRevealCommitments,
      })
    ) {
      return failure('INVALID_RESPONSE', 'Stored approval Reveal authority is inconsistent');
    }
    const requestAuthority = validateRecognitionRequest({ session: snapshot, plan, action });
    if (!requestAuthority.ok) {
      return failure(requestAuthority.error.code, requestAuthority.error.message);
    }
    const baselineSession = cloneRecognitionBoundaryInput(snapshot);
    const providerSession = cloneRecognitionBoundaryInput(snapshot);
    const providerPlan = cloneRecognitionBoundaryInput(plan);
    const providerAction = cloneRecognitionBoundaryInput(action);
    if (!baselineSession.ok || !providerSession.ok || !providerPlan.ok || !providerAction.ok) {
      return failure('INVALID_RESPONSE', 'Recognition boundary inputs could not be isolated');
    }
    const previousSession = baselineSession.data;
    let providerResult: unknown;
    try {
      providerResult = serviceRegistry.recognition.applyRecognition(
        providerSession.data,
        providerPlan.data,
        providerAction.data,
      );
    } catch {
      return failure('INVALID_RESPONSE', 'Recognition provider failed outside its result boundary');
    }
    const normalizedResult = validateRecognitionProviderResult(providerResult);
    if (!normalizedResult.ok) {
      return failure('INVALID_RESPONSE', 'Recognition provider result is not isolated plain data');
    }
    const result = normalizedResult.data;
    if (!result.ok) return result;
    const callerResult = cloneRecognitionBoundaryInput(result);
    if (!callerResult.ok) {
      return failure('INVALID_RESPONSE', 'Recognition result could not be detached for its caller');
    }
    const detachedResult = callerResult.data;
    const sessionTransition = validateRecognitionSessionTransition({
      before: previousSession,
      after: result.data.session,
      disposition: result.data.disposition,
      journey: result.data.journey,
      receipt: result.data.receipt,
    });
    if (!sessionTransition.ok) {
      return failure('INVALID_RESPONSE', sessionTransition.error.message);
    }
    const familyRewardEligible = isFamilyRewardRecognitionEligible(result.data.journey);
    const challengeLeafEligible =
      selectPrivateLeagueRecognitionEligibility(result.data.journey)?.challengeLeafEligible ===
      true;
    if (
      result.data.receipt.provenance.familyRewardEligible !== familyRewardEligible ||
      result.data.receipt.provenance.challengeLeafEligible !== challengeLeafEligible
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Recognition provenance does not match explicit task eligibility decisions',
      );
    }
    const growthBeforeBoundary = validateGrowthJourneyRuntimeBoundary(before.growthJourney);
    if (
      !growthBeforeBoundary.ok ||
      !selectGrowthJourneyProfile(growthBeforeBoundary.data, 'child_salem').ok ||
      !selectGrowthJourneyProfile(growthBeforeBoundary.data, 'child_alya').ok
    ) {
      return failure('INVALID_RESPONSE', 'Growth Journey authority is not canonical plain data');
    }
    if (
      !hasSeedReceiptGrowthParity(
        previousSession,
        growthBeforeBoundary.data,
        result.data.disposition === 'already_confirmed'
          ? result.data.receipt.recognitionKey
          : undefined,
      )
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Core Seed receipts do not match committed Growth evidence',
      );
    }
    const learningAchievementEvents = learningAchievementEventsFor(before);
    if (learningAchievementEvents === null) {
      return failure('INVALID_RESPONSE', 'Learning achievement authority is malformed');
    }
    if (
      !hasRecognitionAchievementParity(
        previousSession,
        growthBeforeBoundary.data,
        learningAchievementEvents,
        result.data.disposition === 'already_confirmed'
          ? result.data.receipt.recognitionKey
          : undefined,
      )
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Committed recognition evidence does not match permanent achievement authority',
      );
    }
    let familyRewardAuthorityIsValid = false;
    try {
      familyRewardAuthorityIsValid = isValidFamilyRewardRuntimeAuthority(before.familyReward);
    } catch {
      familyRewardAuthorityIsValid = false;
    }
    if (!familyRewardAuthorityIsValid) {
      return failure('INVALID_RESPONSE', 'Family Reward authority is not canonical plain data');
    }
    const familyRewardRecognitionKey = before.familyReward.progress.recognitionKeys[0];
    const familyRewardCoreReceipt = familyRewardRecognitionKey
      ? previousSession.recognitionLedger[familyRewardRecognitionKey]
      : undefined;
    if (
      familyRewardCoreReceipt &&
      familyRewardCoreReceipt.provenance.familyRewardEligible !== true
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Family Reward authority is not backed by an eligible core recognition',
      );
    }
    const missingFamilyRewardKey = Object.values(previousSession.recognitionLedger)
      .filter((receipt) => receipt.provenance.familyRewardEligible)
      .map((receipt) => receipt.recognitionKey)
      .find(
        (recognitionKey) => !before.familyReward.progress.recognitionKeys.includes(recognitionKey),
      );
    if (missingFamilyRewardKey) {
      return failure(
        'INVALID_RESPONSE',
        'Eligible core recognition is missing its Family Reward authority',
      );
    }
    let storedPrivateLeague: ReturnType<typeof selectCommittedPrivateLeagueReceipt>;
    try {
      storedPrivateLeague = selectCommittedPrivateLeagueReceipt(before.privateLeague);
    } catch {
      return failure('INVALID_RESPONSE', 'Private League authority is malformed');
    }
    if (!storedPrivateLeague.ok) {
      return failure('INVALID_RESPONSE', storedPrivateLeague.error.message);
    }
    const privateLeagueCoreReceipt = storedPrivateLeague.data
      ? previousSession.recognitionLedger[storedPrivateLeague.data.recognitionKey]
      : undefined;
    if (
      storedPrivateLeague.data &&
      (!privateLeagueCoreReceipt || !privateLeagueCoreReceipt.provenance.challengeLeafEligible)
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Private League authority is not backed by an eligible core recognition',
      );
    }
    const missingPrivateLeagueKey = Object.values(previousSession.recognitionLedger)
      .filter((receipt) => receipt.provenance.challengeLeafEligible)
      .map((receipt) => receipt.recognitionKey)
      .find((recognitionKey) => storedPrivateLeague.data?.recognitionKey !== recognitionKey);
    if (missingPrivateLeagueKey) {
      return failure(
        'INVALID_RESPONSE',
        'Eligible core recognition is missing its Private League authority',
      );
    }
    let revealQueueIsValid = false;
    try {
      revealQueueIsValid = validateRevealBundleQueue(before.revealBundleQueue).ok;
    } catch {
      revealQueueIsValid = false;
    }
    if (!revealQueueIsValid) {
      return failure('INVALID_RESPONSE', 'RevealBundle queue authority is malformed');
    }
    const recognitionKey = result.data.receipt.recognitionKey;
    if (
      result.data.receipt.seedTransaction === null &&
      hasCommittedGrowthRecognitionEvidence(growthBeforeBoundary.data, recognitionKey)
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Zero-Seed recognition conflicts with committed Growth evidence',
      );
    }
    let growthProjection: ReturnType<typeof projectRecognitionIntoGrowthJourney>;
    try {
      growthProjection = projectRecognitionIntoGrowthJourney({
        runtime: before.growthJourney,
        previousSession,
        nextSession: result.data.session,
        receipt: result.data.receipt,
        committedAt: plan.checkIn.praisePresentedAt,
        learningCompletions: completionEvidenceFor(before, plan.journey.task.targetChildId),
      });
    } catch {
      return failure('INVALID_RESPONSE', 'Growth Journey projection authority is malformed');
    }
    if (!growthProjection.ok) {
      return failure('INVALID_RESPONSE', growthProjection.error.message);
    }
    const growthBoundary = validateGrowthJourneyRuntimeBoundary(growthProjection.data.runtime);
    if (
      !growthBoundary.ok ||
      !selectGrowthJourneyProfile(growthBoundary.data, 'child_salem').ok ||
      !selectGrowthJourneyProfile(growthBoundary.data, 'child_alya').ok
    ) {
      return failure('INVALID_RESPONSE', 'Growth Journey authority is not canonical plain data');
    }
    if (
      !hasRecognitionAchievementParity(
        result.data.session,
        growthBoundary.data,
        learningAchievementEvents,
      )
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Projected recognition evidence does not match permanent achievement authority',
      );
    }

    if (
      result.data.disposition === 'applied' &&
      before.familyReward.progress.recognitionKeys.includes(result.data.receipt.recognitionKey)
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Family Reward recognition was committed before its core approval authority',
      );
    }
    let familyReward: ReturnType<typeof applyRecognitionToFamilyReward>;
    try {
      familyReward = applyRecognitionToFamilyReward({
        runtime: before.familyReward,
        journey: result.data.journey,
        receipt: result.data.receipt,
        committedAt: plan.checkIn.praisePresentedAt,
      });
    } catch {
      return failure('INVALID_RESPONSE', 'Family Reward authority is malformed');
    }
    if (!familyReward.ok) {
      return failure('INVALID_RESPONSE', familyReward.error.message);
    }

    const privateLeagueEligibility = selectPrivateLeagueRecognitionEligibility(result.data.journey);
    if (
      privateLeagueEligibility === null &&
      storedPrivateLeague.data?.recognitionKey === result.data.receipt.recognitionKey
    ) {
      return failure(
        'INVALID_RESPONSE',
        'Private League recognition was committed for an ineligible task version',
      );
    }
    const privateLeague = privateLeagueEligibility
      ? applyRecognitionToPrivateLeague({
          runtime: before.privateLeague,
          profileId: result.data.journey.task.targetChildId,
          profileEpochId:
            growthProjection.data.runtime.ledgersByProfile[result.data.journey.task.targetChildId]
              .profileEpochId,
          journey: result.data.journey,
          receipt: result.data.receipt,
          recognitionLedger: result.data.session.recognitionLedger,
        })
      : null;
    if (privateLeague && !privateLeague.ok) {
      return failure('INVALID_RESPONSE', privateLeague.error.message);
    }

    if (result.data.disposition === 'already_confirmed') {
      const growthAuthorityIsReconciled = result.data.receipt.seedTransaction
        ? (growthProjection.data.disposition === 'already_projected' &&
            growthProjection.data.runtime === before.growthJourney) ||
          (growthProjection.data.disposition === 'projected' &&
            growthProjection.data.runtime !== before.growthJourney)
        : growthProjection.data.disposition === 'not_applicable' &&
          growthProjection.data.runtime === before.growthJourney;
      if (
        !growthAuthorityIsReconciled ||
        familyReward.data !== before.familyReward ||
        (privateLeagueEligibility !== null &&
          (!privateLeague?.ok ||
            privateLeague.data.disposition !== 'already_confirmed' ||
            privateLeague.data.runtime !== before.privateLeague))
      ) {
        return failure(
          'INVALID_RESPONSE',
          'Repeated recognition is missing one of its committed secondary authorities',
        );
      }
      const profileId = result.data.journey.task.targetChildId;
      const profileLedger = growthProjection.data.runtime.ledgersByProfile[profileId];
      if (!profileLedger) {
        return failure(
          'INVALID_RESPONSE',
          'Repeated recognition is missing its active Growth profile authority',
        );
      }
      const profileEpochId = profileLedger.profileEpochId;
      if (result.data.receipt.seedTransaction) {
        const reveal = reconcileCommittedApprovalReveal({
          queue: before.revealBundleQueue,
          plan,
          recognition: result.data,
          growthRuntime: growthProjection.data.runtime,
          familyReward: before.familyReward,
          privateLeague: privateLeague?.ok ? privateLeague.data : null,
        });
        if (!reveal.ok || reveal.data.disposition !== 'already_exists') {
          return failure(
            'INVALID_RESPONSE',
            reveal.ok
              ? 'Repeated recognition is missing its committed result bundle'
              : reveal.error.message,
          );
        }
      } else {
        const queueValidation = constructRevealBundle({
          queue: before.revealBundleQueue,
          profileId,
          profileEpochId,
          triggerEventId: result.data.receipt.recognitionKey,
          triggerKind: 'task_submission',
          triggeredAt: plan.checkIn.praisePresentedAt,
          receipts: [],
        });
        if (
          !queueValidation.ok ||
          queueValidation.data.disposition !== 'not_created' ||
          before.revealBundleQueue.bundles.some(
            (bundle) => bundle.triggerEventId === result.data.receipt.recognitionKey,
          )
        ) {
          return failure(
            'INVALID_RESPONSE',
            'Zero-Seed recognition has an invalid result-bundle authority',
          );
        }
      }
      if (growthProjection.data.runtime !== before.growthJourney) {
        set({ growthJourney: growthProjection.data.runtime });
      }
      return detachedResult;
    }

    const reveal =
      result.data.receipt.seedTransaction !== null
        ? constructApprovalReveal({
            queue: before.revealBundleQueue,
            plan,
            recognition: result.data,
            previousSession,
            growthBefore: before.growthJourney,
            growthProjection: growthProjection.data,
            familyRewardBefore: before.familyReward,
            familyRewardAfter: familyReward.data,
            privateLeague: privateLeague?.ok ? privateLeague.data : null,
          })
        : null;
    if (reveal && !reveal.ok) {
      return failure('INVALID_RESPONSE', reveal.error.message);
    }
    if (
      result.data.receipt.seedTransaction !== null &&
      (!reveal?.ok || reveal.data.disposition !== 'created')
    ) {
      return failure('INVALID_RESPONSE', 'New Seed recognition requires one new result bundle');
    }
    const revealCommitment =
      reveal?.ok && reveal.data.disposition === 'created'
        ? reveal.data.bundle.sourceFingerprint
        : null;

    set({
      ...result.data.session,
      growthJourney: growthProjection.data.runtime,
      confirmationPlan: plan,
      lastRecognitionAttempt: result.data,
      familyReward: familyReward.data,
      privateLeague: privateLeague?.ok ? privateLeague.data.runtime : before.privateLeague,
      revealBundleQueue: reveal?.ok ? reveal.data.queue : before.revealBundleQueue,
      approvalRevealCommitments: {
        ...before.approvalRevealCommitments,
        [result.data.receipt.recognitionKey]: revealCommitment,
      },
    });
    return detachedResult;
  },

  applyRoutinePhaseDecision: (taskId, option) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
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
    const state = get();
    const authority =
      state.role === 'parent'
        ? requireActiveParentExperience(state)
        : state.role === 'child'
          ? requireActiveChildExperience(state)
          : failure('INVALID_TRANSITION', 'An active synthetic experience is required');
    if (!authority.ok) return authority;
    if (!state.celebration.available || state.celebration.consumed) {
      return success(state.celebration);
    }
    const celebration = { available: true, consumed: true } as const;
    set({ celebration });
    return success(celebration);
  },
}));

export type PrototypeStoreSnapshot = PrototypeSession;
