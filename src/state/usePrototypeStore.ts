import { create } from 'zustand';

import {
  createChildVoiceController,
  INITIAL_CHILD_VOICE_VIEW,
  type ChildVoiceCommand,
  type ChildVoiceView,
} from '../features/assistants/childVoiceController';
import { evaluateAssistantSafety, resolveParentGuideFallback } from '../features/assistants/policy';
import { createChildAccessController, type ChildAccessView } from '../features/access/childAccess';
import { createLocalFamilyRecord, localFamilyRecordToReceipt } from '../features/local-family';
import {
  createParentOnboardingController,
  normalizeParentIdentifier,
  type ParentOnboardingCompletionReceipt,
  type ParentOnboardingDraftPatch,
  type ParentOnboardingHandoff,
  type ParentOnboardingView,
  validateCompleteParentOnboardingDraft,
} from '../features/access/parentOnboarding';
import { P0_EXECUTABLE_CHOICE, P0_SAFE_EQUIVALENT_TEMPLATE } from '../features/tasks/demoContent';
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
  markFamilyRewardRuntimeGiven,
  projectFamilyRewardRuntime,
  type FamilyRewardPresentation,
  type FamilyRewardRuntime,
} from '../features/family-hub';
import {
  acknowledgeRevealBundle,
  archiveRevealBundle,
  constructRevealBundle,
  createEmptyRevealBundleQueue,
  startOrResumeRevealById,
} from '../features/rewards/revealBundle';
import {
  advanceMangroveLearningStep as advanceMangroveLearningStepDomain,
  completeMangroveLearning as completeMangroveLearningDomain,
  createMangroveLearningState,
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
import type { LocalFamilyRecord, LocalFamilyView } from '../models/localFamily';
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

export type ReturningUserWelcome =
  | {
      readonly kind: 'returning_parent';
      readonly householdId: 'household_al_noor';
    }
  | {
      readonly kind: 'returning_child';
      readonly childId: SyntheticChildId;
    };

const childVoiceController = createChildVoiceController(serviceRegistry);
const parentOnboardingController = createParentOnboardingController(serviceRegistry.access);
const childAccessController = createChildAccessController(
  serviceRegistry.access,
  parentOnboardingController,
);
const R001_ONBOARDING_TIME = '2026-09-04T10:00:00.000Z';
const R003_LOCAL_FAMILY_TIME = '2026-09-06T14:00:00.000Z';

function localFamilyView(
  record: LocalFamilyRecord | null,
  status: LocalFamilyView['status'] = 'ready',
): LocalFamilyView {
  return {
    status,
    record,
    configuredChildIds: record ? record.children.map((child) => child.id) : [],
    errorCode: status === 'unavailable' ? 'invalid_or_unavailable_local_data' : null,
    storageTruth: 'device_local_demo_only',
  };
}

function restoreInitialLocalFamily(): LocalFamilyView {
  const read = serviceRegistry.localFamily.read();
  if (!read.ok) return localFamilyView(null, 'unavailable');
  if (!read.data) return localFamilyView(null);
  const restoredReceipt = parentOnboardingController.restoreCompletionReceipt(
    localFamilyRecordToReceipt(read.data),
  );
  const restoredDevices = childAccessController.restorePairedDevices({
    childIds: read.data.pairedChildIds,
    pairedAt: read.data.updatedAt,
  });
  if (!restoredReceipt.ok || !restoredDevices.ok) {
    parentOnboardingController.reset(R001_ONBOARDING_TIME);
    childAccessController.reset();
    serviceRegistry.access.resetPrototype();
    return localFamilyView(null, 'unavailable');
  }
  return localFamilyView(read.data);
}

const initialLocalFamily = restoreInitialLocalFamily();
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
  readonly mangroveLearningByProfile: MangroveLearningByProfile;
  readonly sharedGrowth: SharedGrowthState;
  readonly revealBundleQueue: RevealBundleQueue;
  readonly parentOnboarding: ParentOnboardingView;
  readonly localFamily: LocalFamilyView;
  readonly returningUserWelcome: ReturningUserWelcome | null;
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
  readonly requestExistingParentVerification: (
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
  readonly dismissReturningUserWelcome: () => void;
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
  mangroveLearningByProfile: initialMangroveLearning,
  sharedGrowth: initialSharedGrowth,
  revealBundleQueue: createEmptyRevealBundleQueue(),
  parentOnboarding: parentOnboardingController.getView(),
  localFamily: initialLocalFamily,
  returningUserWelcome: null,
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
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before starting Parent verification');
    }
    if (state.localFamily.status !== 'ready') {
      return failure('INVALID_TRANSITION', 'The local family directory is unavailable');
    }
    if (state.localFamily.record || state.parentOnboarding.completionReceipt) {
      return failure('INVALID_TRANSITION', 'Use returning Parent sign-in for this family');
    }
    const result = parentOnboardingController.requestVerification(input);
    set({ parentOnboarding: parentOnboardingController.getView(), returningUserWelcome: null });
    return result;
  },

  requestExistingParentVerification: (input) => {
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before starting Parent verification');
    }
    const normalized = normalizeParentIdentifier(input.identifier);
    if (!normalized.ok) return { ok: false, error: normalized.error };
    if (state.localFamily.status !== 'ready') {
      return failure('INVALID_TRANSITION', 'The local family directory is unavailable');
    }
    const record = state.localFamily.record;
    if (
      !record ||
      record.parent.normalizedIdentifier !== normalized.data.normalizedIdentifier ||
      record.parent.identifierKind !== normalized.data.identifierKind
    ) {
      return failure('NOT_FOUND', 'The Parent identifier is not linked to this family');
    }
    const result = parentOnboardingController.requestVerification({
      ...input,
      identifier: normalized.data.normalizedIdentifier,
    });
    set({ parentOnboarding: parentOnboardingController.getView(), returningUserWelcome: null });
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
    const state = get();
    if (state.activeExperience === 'child') {
      return failure('INVALID_TRANSITION', 'Sign out before completing Parent access');
    }
    if (state.activeExperience === 'parent') {
      return parentOnboardingController.complete(R001_ONBOARDING_TIME);
    }
    const returningHouseholdId =
      state.activeExperience === 'signed_out' &&
      state.parentOnboarding.status === 'verified' &&
      state.parentOnboarding.completionReceipt
        ? state.parentOnboarding.completionReceipt.householdId
        : null;
    let newlySavedFamily: LocalFamilyRecord | null = null;
    if (!returningHouseholdId) {
      const parentIdentifier = parentOnboardingController.getPendingIdentifier();
      if (!parentIdentifier) {
        return failure('INVALID_TRANSITION', 'Complete Parent verification before family setup');
      }
      const validated = validateCompleteParentOnboardingDraft(state.parentOnboarding.draft);
      if (!validated.ok) return { ok: false, error: validated.error };
      const created = createLocalFamilyRecord({
        parentIdentifier,
        familyName: validated.data.familyName,
        appLanguage: validated.data.appLanguage,
        children: validated.data.children.slice(0, validated.data.childCount).map((child) => ({
          id: child.profileId,
          role: 'child' as const,
          nickname: child.nickname,
          avatarId: child.avatarId,
          ageBand: child.ageBand,
          preferredLanguage: child.preferredLanguage,
          gender: child.gender,
          interests: [...child.interests],
          hobbies: [...child.hobbies],
          accessibilityDefaults: [...child.accessibilityDefaults],
          supportPreferences: [...child.supportPreferences],
          personalizationEnabled: child.personalizationEnabled,
        })),
        pairedChildIds: [],
        now: R003_LOCAL_FAMILY_TIME,
      });
      if (!created.ok) return { ok: false, error: created.error };
      const saved = serviceRegistry.localFamily.save(created.data);
      if (!saved.ok) return { ok: false, error: saved.error };
      newlySavedFamily = saved.data;
    }
    const result = parentOnboardingController.complete(R001_ONBOARDING_TIME);
    if (result.ok) {
      const locale = state.localFamily.record?.appLanguage ?? result.data.appLanguage;
      set({
        activeExperience: 'parent',
        parentOnboarding: parentOnboardingController.getView(),
        locale,
        direction: getLocaleDirection(locale),
        role: 'parent',
        localFamily: newlySavedFamily ? localFamilyView(newlySavedFamily) : state.localFamily,
        returningUserWelcome: returningHouseholdId
          ? { kind: 'returning_parent', householdId: returningHouseholdId }
          : null,
      });
    } else {
      if (newlySavedFamily) serviceRegistry.localFamily.clear();
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
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before choosing a Child profile');
    }
    if (!state.localFamily.configuredChildIds.includes(childId)) {
      return failure('NOT_FOUND', 'Choose a configured Child profile');
    }
    const result = childAccessController.selectProfile(childId);
    set({ childAccess: childAccessController.getView(), returningUserWelcome: null });
    return result;
  },

  verifyChildCredential: (value) => {
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before verifying a Child credential');
    }
    const selectedChildId = state.childAccess.selectedChildId;
    const hasActivePairing = Boolean(
      selectedChildId &&
      state.childAccess.pairedDevices.some(
        (device) => device.childId === selectedChildId && device.status === 'paired',
      ),
    );
    const result = childAccessController.verifyCredential(value, R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView(), returningUserWelcome: null });
    if (result.ok && result.data.canEnterChildExperience && result.data.selectedChildId) {
      set({
        activeChildId: result.data.selectedChildId,
        activeExperience: 'child',
        role: 'child',
        returningUserWelcome: hasActivePairing
          ? { kind: 'returning_child', childId: result.data.selectedChildId }
          : null,
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
      returningUserWelcome: null,
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
    if (result.ok && childAccess.selectedChildId) {
      const persisted = serviceRegistry.localFamily.setPairedChild(
        childAccess.selectedChildId,
        true,
        R003_LOCAL_FAMILY_TIME,
      );
      if (!persisted.ok) {
        childAccessController.signOut(R001_ONBOARDING_TIME);
        childAccessController.revokeDevice(childAccess.selectedChildId, R001_ONBOARDING_TIME);
        set({ childAccess: childAccessController.getView() });
        return { ok: false, error: persisted.error };
      }
      set({
        childAccess,
        activeChildId: childAccess.selectedChildId,
        activeExperience: 'child',
        role: 'child',
        localFamily: localFamilyView(persisted.data),
        returningUserWelcome: null,
      });
    } else {
      set({ childAccess });
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

  dismissReturningUserWelcome: () => set({ returningUserWelcome: null }),

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
      returningUserWelcome: null,
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
    const persisted = serviceRegistry.localFamily.setPairedChild(
      childId,
      false,
      R003_LOCAL_FAMILY_TIME,
    );
    if (!persisted.ok) return { ok: false, error: persisted.error };
    const result = childAccessController.revokeDevice(childId, R001_ONBOARDING_TIME);
    set({ childAccess: childAccessController.getView() });
    if (result.ok) set({ localFamily: localFamilyView(persisted.data) });
    return result;
  },

  getParentChildProgress: (profileId) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.localFamily.configuredChildIds.includes(profileId)) {
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
    const state = get();
    const record = state.localFamily.record;
    if (!record || record.appLanguage === locale) {
      set({ locale, direction: getLocaleDirection(locale) });
      return;
    }
    const saved = serviceRegistry.localFamily.save({
      ...record,
      appLanguage: locale,
      updatedAt: R003_LOCAL_FAMILY_TIME,
    });
    set({
      locale,
      direction: getLocaleDirection(locale),
      localFamily: saved.ok ? localFamilyView(saved.data) : state.localFamily,
    });
  },

  setRole: (role) => set({ role }),

  switchRole: () => set((state) => ({ role: state.role === 'parent' ? 'child' : 'parent' })),

  setActiveChild: (childId) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.localFamily.configuredChildIds.includes(childId)) {
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
    const localReset = serviceRegistry.localFamily.clear();
    if (!localReset.ok) return { ok: false, error: localReset.error };
    const reset = serviceRegistry.prototypeSession.resetPrototype();
    const nextGrowthJourney = createGrowthJourneyRuntime(
      reset.session,
      get().growthJourney.resetSequence + 1,
    );
    if (!nextGrowthJourney.ok) {
      return failure('INVALID_RESPONSE', nextGrowthJourney.error.message);
    }
    const nextMangroveLearning = createLearningByProfile(nextGrowthJourney.data);
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
      mangroveLearningByProfile: nextMangroveLearning,
      sharedGrowth: nextSharedGrowth,
      revealBundleQueue: createEmptyRevealBundleQueue(),
      parentOnboarding: onboardingReset.data,
      localFamily: localFamilyView(null),
      returningUserWelcome: null,
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
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
    const result = serviceRegistry.recognition.planConfirmation(sessionSnapshot(get()), input);
    if (result.ok && result.data.disposition === 'pending_praise') {
      set({ journey: result.data.plan.journey, confirmationPlan: result.data.plan });
    } else if (result.ok && result.data.disposition === 'praise_presented') {
      set({ journey: result.data.plan.journey, confirmationPlan: result.data.plan });
    }
    return result;
  },

  markPraisePresented: (action) => {
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
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
    const authority = requireActiveParentExperience(get());
    if (!authority.ok) return authority;
    const plan = get().confirmationPlan;
    if (!plan || plan.renderState !== 'praise_presented') {
      return failure('INVALID_TRANSITION', 'Praise must be visibly presented before recognition');
    }
    const before = get();
    const previousSession = sessionSnapshot(before);
    const result = serviceRegistry.recognition.applyRecognition(previousSession, plan, action);
    if (!result.ok) return result;
    const growthProjection = projectRecognitionIntoGrowthJourney({
      runtime: before.growthJourney,
      previousSession,
      nextSession: result.data.session,
      receipt: result.data.receipt,
      committedAt: plan.checkIn.praisePresentedAt,
      learningCompletions: completionEvidenceFor(before, plan.journey.task.targetChildId),
    });
    if (!growthProjection.ok) {
      return failure('INVALID_RESPONSE', growthProjection.error.message);
    }
    if (result.data.disposition === 'already_confirmed') {
      if (growthProjection.data.runtime !== before.growthJourney) {
        set({ growthJourney: growthProjection.data.runtime });
      }
      return result;
    }

    const familyReward = applyRecognitionToFamilyReward({
      runtime: before.familyReward,
      journey: plan.journey,
      receipt: result.data.receipt,
      committedAt: plan.checkIn.praisePresentedAt,
    });
    if (!familyReward.ok) {
      return failure('INVALID_RESPONSE', familyReward.error.message);
    }

    set({
      ...result.data.session,
      growthJourney: growthProjection.data.runtime,
      confirmationPlan: plan,
      lastRecognitionAttempt: result.data,
      familyReward: familyReward.data,
    });
    return result;
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
