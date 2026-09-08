import { create } from 'zustand';

import {
  createChildVoiceController,
  INITIAL_CHILD_VOICE_VIEW,
  type ChildVoiceCommand,
  type ChildVoiceView,
} from '../features/assistants/childVoiceController';
import { evaluateAssistantSafety, resolveParentGuideFallback } from '../features/assistants/policy';
import { validateLiveParentGuideSuggestion } from '../features/assistants/liveParentGuide';
import {
  applyParentTaskDraftSuggestion,
  createParentTaskDraftRequest,
  INITIAL_PARENT_TASK_DRAFTING_VIEW,
  validateParentTaskDraftSuggestion,
  type ParentTaskDraftingView,
} from '../features/assistants/parentTaskDrafting';
import {
  createLiveChildCoachRequest,
  idleLiveChildCoachView,
  INITIAL_LIVE_CHILD_COACH_VIEW,
  validateLiveChildCoachResponse,
  type LiveChildCoachIntent,
  type LiveChildCoachView,
} from '../features/assistants/liveChildCoach';
import {
  applyVoiceTranscript,
  beginVoiceDeletion,
  beginVoicePermissionRequest,
  beginVoiceTranscriptSend,
  completeVoiceDeletion,
  completeVoiceTranscriptSend,
  createLiveVoiceCaptureState,
  editVoiceTranscript,
  markVoiceTranscriptReady,
  resolveVoicePermission,
  restoreVoiceTranscriptAfterFailedSend,
  startHeldVoiceCapture,
  stopHeldVoiceCapture,
  type LiveVoiceCaptureState,
} from '../features/assistants/liveVoiceCapture';
import { createChildAccessController, type ChildAccessView } from '../features/access/childAccess';
import {
  createInitialLiveChildCoachGrant,
  LIVE_CHILD_AI_NOTICE_VERSION,
  LIVE_CHILD_AI_POLICY_VERSION,
  LIVE_CHILD_AI_PROVIDER_VERSION,
} from '../features/access';
import { restoreRememberedDeviceAccess } from '../features/access/rememberedDeviceAccess';
import { restoreAmbientAudioPreference } from '../features/audio';
import { createLocalFamilyRecord, localFamilyRecordToReceipt } from '../features/local-family';
import { createFamilyConnectionPlan } from '../features/family-connections';
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
import type {
  DeviceAccessView,
  DeviceAffinityRecord,
  TemporaryParentAccess,
} from '../models/deviceAccess';
import type {
  LocalFamilyProfileRepairCandidate,
  LocalFamilyRecord,
  LocalFamilyView,
} from '../models/localFamily';
import type { FamilyConnectionPlan } from '../models/familyConnections';
import type { AmbientAudioPreferenceView } from '../models/audioPreferences';
import type { AgeAdaptedCoachResult } from '../models/assistantVoice';
import {
  parentTaskArchetypeSchema,
  type ChildCoachTextResponseV1,
  LiveChildAiGrantsByProfile,
  LiveChildCoachCapability,
  LiveChildCoachGrant,
  ParentTaskDraftRequestV1,
  ParentTaskDraftSuggestionV1,
  VoiceTranscriptionResponseV1,
} from '../models/boundedAi';
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
import {
  serviceRegistry,
  type EphemeralMediaService,
  type LiveChildCoachTextService,
  type ParentGuideService,
  type ParentTaskDraftingService,
  type ServiceResult,
  type VoiceCaptureService,
  type VoiceTranscriptionService,
} from '../services';
import { ExpoEphemeralMediaService, ExpoVoiceCaptureService } from '../services/native';

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

export type PendingFamilyCreationIntent = 'fresh' | 'replacement' | 'profile_repair' | null;

export interface BoundLiveVoiceCapture {
  readonly state: LiveVoiceCaptureState;
  readonly childId: SyntheticChildId;
  readonly assignmentId: string;
  readonly taskId: string;
  readonly textGrantVersion: number;
  readonly voiceGrantVersion: number;
}

const childVoiceController = createChildVoiceController(serviceRegistry);
const liveVoiceCaptureService = new ExpoVoiceCaptureService();
const liveVoiceMediaService = new ExpoEphemeralMediaService();
void liveVoiceMediaService.purgeOrphanedRecordings();
const parentOnboardingController = createParentOnboardingController(serviceRegistry.access);
const childAccessController = createChildAccessController(
  serviceRegistry.access,
  parentOnboardingController,
);
const R001_ONBOARDING_TIME = '2026-09-04T10:00:00.000Z';
const R003_LOCAL_FAMILY_TIME = '2026-09-06T14:00:00.000Z';
function feature004Now(): string {
  return new Date().toISOString();
}

function releaseLiveVoiceCapture(bound: BoundLiveVoiceCapture | null): void {
  if (!bound) return;
  void (async () => {
    const canceled = await liveVoiceCaptureService.cancel();
    const uris = new Set(
      [bound.state.envelope.cacheUri, canceled.ok ? canceled.data.uri : null].filter(
        (uri): uri is string => Boolean(uri),
      ),
    );
    await Promise.all([...uris].map((uri) => liveVoiceMediaService.delete(uri)));
  })();
}

function createInitialLiveChildAiGrants(): LiveChildAiGrantsByProfile {
  return Object.freeze({
    child_salem: Object.freeze({
      text: createInitialLiveChildCoachGrant('child_salem', 'text'),
      voice: createInitialLiveChildCoachGrant('child_salem', 'voice'),
    }),
    child_alya: Object.freeze({
      text: createInitialLiveChildCoachGrant('child_alya', 'text'),
      voice: createInitialLiveChildCoachGrant('child_alya', 'voice'),
    }),
  });
}

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

function deviceAccessView(
  record: DeviceAffinityRecord | null,
  status: DeviceAccessView['status'] = 'ready',
): DeviceAccessView {
  return {
    status,
    record,
    primaryRole: record?.principal.role ?? 'none',
    primaryChildId: record?.principal.role === 'child' ? record.principal.childId : null,
    storageTruth: 'device_local_demo_only',
    productionAuthentication: false,
  };
}

function restoreInitialLocalFamily(): {
  readonly view: LocalFamilyView;
  readonly profileRepair: LocalFamilyProfileRepairCandidate | null;
} {
  const read = serviceRegistry.localFamily.read();
  if (!read.ok) {
    const repair = serviceRegistry.localFamily.readProfileRepairCandidate();
    return repair.ok && repair.data
      ? { view: localFamilyView(null, 'unavailable'), profileRepair: repair.data }
      : { view: localFamilyView(null, 'unavailable'), profileRepair: null };
  }
  if (!read.data) return { view: localFamilyView(null), profileRepair: null };
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
    return { view: localFamilyView(null, 'unavailable'), profileRepair: null };
  }
  return { view: localFamilyView(read.data), profileRepair: null };
}

const initialLocalFamilyRestore = restoreInitialLocalFamily();
const initialLocalFamily = initialLocalFamilyRestore.view;
const initialLocalFamilyProfileRepair = initialLocalFamilyRestore.profileRepair;
const initialAmbientAudioPreference: AmbientAudioPreferenceView = (() => {
  const read = serviceRegistry.ambientAudioPreferences.read();
  return read.ok
    ? restoreAmbientAudioPreference({ storageAvailable: true, record: read.data })
    : restoreAmbientAudioPreference({ storageAvailable: false });
})();
const initialRememberedDeviceAccess = (() => {
  const read = serviceRegistry.deviceAccess.read();
  if (!read.ok) {
    return {
      view: deviceAccessView(null, 'unavailable'),
      activeExperience: 'signed_out' as const,
      activeChildId: null,
    };
  }
  if (!read.data) {
    return {
      view: deviceAccessView(null),
      activeExperience: 'signed_out' as const,
      activeChildId: null,
    };
  }
  if (!initialLocalFamily.record || initialLocalFamily.status !== 'ready') {
    return {
      view: deviceAccessView(null, 'unavailable'),
      activeExperience: 'signed_out' as const,
      activeChildId: null,
    };
  }
  const restored = restoreRememberedDeviceAccess({
    affinity: read.data,
    family: initialLocalFamily.record,
    parent: parentOnboardingController,
    child: childAccessController,
    now: R001_ONBOARDING_TIME,
  });
  return restored.ok
    ? {
        view: deviceAccessView(read.data),
        activeExperience: restored.data.activeExperience,
        activeChildId: restored.data.activeChildId,
      }
    : {
        view: deviceAccessView(null, 'unavailable'),
        activeExperience: 'signed_out' as const,
        activeChildId: null,
      };
})();
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
  readonly ambientAudioPreference: AmbientAudioPreferenceView;
  readonly activeExperience: 'signed_out' | 'parent' | 'child';
  readonly childAccess: ChildAccessView;
  readonly deviceAccess: DeviceAccessView;
  readonly rememberParentOnThisDevice: boolean;
  readonly temporaryParentAccess: TemporaryParentAccess | null;
  readonly familyReward: FamilyRewardRuntime;
  readonly growthJourney: GrowthJourneyRuntimeState;
  readonly mangroveLearningByProfile: MangroveLearningByProfile;
  readonly sharedGrowth: SharedGrowthState;
  readonly revealBundleQueue: RevealBundleQueue;
  readonly parentOnboarding: ParentOnboardingView;
  readonly localFamily: LocalFamilyView;
  readonly localFamilyProfileRepair: LocalFamilyProfileRepairCandidate | null;
  readonly pendingFamilyCreation: PendingFamilyCreationIntent;
  readonly returningUserWelcome: ReturningUserWelcome | null;
  readonly parentGuideSuggestion: ParentGuideTaskSuggestion | null;
  readonly parentTaskDraftingView: ParentTaskDraftingView;
  readonly liveChildAiGrants: LiveChildAiGrantsByProfile;
  readonly liveChildCoachView: LiveChildCoachView;
  readonly liveVoiceCapture: BoundLiveVoiceCapture | null;
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
  readonly requestFamilyReplacementVerification: (
    input: Parameters<typeof parentOnboardingController.requestVerification>[0],
  ) => ServiceResult<ParentOnboardingView>;
  readonly requestExistingParentVerification: (
    input: Parameters<typeof parentOnboardingController.requestVerification>[0],
  ) => ServiceResult<ParentOnboardingView>;
  readonly verifyParentCode: (code: unknown) => Promise<ServiceResult<ParentOnboardingView>>;
  readonly beginVerifiedFamilyReplacement: () => ServiceResult<ParentOnboardingView>;
  readonly beginVerifiedFamilyProfileRepair: () => ServiceResult<ParentOnboardingView>;
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
  readonly setRememberParentOnThisDevice: (remember: boolean) => void;
  readonly beginTemporaryParentAccess: () => ServiceResult<true>;
  readonly cancelTemporaryParentAccess: () => ServiceResult<true>;
  readonly dismissReturningUserWelcome: () => void;
  readonly signOutExperience: () => ServiceResult<true>;
  readonly getFamilyConnectionPlan: () => ServiceResult<FamilyConnectionPlan>;
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
  readonly getLiveChildAiGrant: (
    childId: SyntheticChildId,
    capability: LiveChildCoachCapability,
  ) => ServiceResult<LiveChildCoachGrant>;
  readonly updateLiveChildAiGrant: (input: {
    readonly childId: SyntheticChildId;
    readonly capability: LiveChildCoachCapability;
    readonly granted: boolean;
    readonly reauthenticationCode: unknown;
  }) => ServiceResult<LiveChildCoachGrant>;
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
  readonly setAmbientSoundEnabled: (enabled: boolean) => ServiceResult<boolean>;
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
  readonly requestParentTaskDraft: (
    input: {
      readonly requestId: string;
      readonly bindingNonce: string;
      readonly intent: ParentTaskDraftRequestV1['intent'];
      readonly effortBand: ParentTaskDraftRequestV1['effortBand'];
      readonly stepCount: number;
      readonly supportMode: ParentTaskDraftRequestV1['supportMode'];
    },
    primaryService?: ParentTaskDraftingService,
  ) => Promise<ServiceResult<ParentTaskDraftSuggestionV1>>;
  readonly acceptParentTaskDraft: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly keepParentTaskDraft: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
  readonly editParentTaskDraft: () => ServiceResult<NonNullable<PrototypeSession['journey']>>;
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
  readonly requestLiveChildCoach: (
    input: {
      readonly requestId: string;
      readonly bindingNonce: string;
      readonly intent: LiveChildCoachIntent;
      readonly boundedText?: string;
      readonly inputOrigin?: 'typed' | 'reviewed_voice_transcript';
      readonly voiceRequestId?: string;
      readonly voiceBindingNonce?: string;
    },
    primaryService?: LiveChildCoachTextService,
  ) => Promise<ServiceResult<ChildCoachTextResponseV1>>;
  readonly declineLiveChildCoach: () => ServiceResult<true>;
  readonly clearLiveChildCoach: () => ServiceResult<true>;
  readonly prepareLiveVoiceCapture: (input: {
    readonly voiceSessionId: string;
    readonly requestId: string;
    readonly bindingNonce: string;
  }) => ServiceResult<BoundLiveVoiceCapture>;
  readonly requestLiveVoicePermission: (
    captureService?: VoiceCaptureService,
  ) => Promise<ServiceResult<BoundLiveVoiceCapture>>;
  readonly startLiveVoiceHold: (
    captureService?: VoiceCaptureService,
  ) => Promise<ServiceResult<BoundLiveVoiceCapture>>;
  readonly stopLiveVoiceHold: (services?: {
    readonly capture?: VoiceCaptureService;
    readonly media?: EphemeralMediaService;
    readonly transcription?: VoiceTranscriptionService;
  }) => Promise<ServiceResult<BoundLiveVoiceCapture>>;
  readonly editLiveVoiceTranscript: (text: string) => ServiceResult<BoundLiveVoiceCapture>;
  readonly markLiveVoiceTranscriptReady: () => ServiceResult<BoundLiveVoiceCapture>;
  readonly deleteLiveVoiceCapture: (
    mediaService?: EphemeralMediaService,
  ) => Promise<ServiceResult<BoundLiveVoiceCapture>>;
  readonly sendLiveVoiceTranscript: (
    input: {
      readonly requestId: string;
      readonly bindingNonce: string;
      readonly intent: Extract<
        LiveChildCoachIntent,
        'clarify_step' | 'plan_order' | 'ask_for_help' | 'reflect_on_strategy'
      >;
    },
    primaryService?: LiveChildCoachTextService,
  ) => Promise<ServiceResult<ChildCoachTextResponseV1>>;
  readonly cancelLiveVoiceCapture: (
    captureService?: VoiceCaptureService,
    mediaService?: EphemeralMediaService,
  ) => Promise<ServiceResult<true>>;
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

function validateLiveVoiceAuthority(state: PrototypeStoreState): ServiceResult<{
  readonly journey: ActiveChildAssignmentJourney;
  readonly textGrant: LiveChildCoachGrant;
  readonly voiceGrant: LiveChildCoachGrant;
}> {
  const active = validateActiveChildAssignment(state, true);
  if (!active.ok) return active;
  const ageBand: string = state.children[state.activeChildId].ageBand;
  const grants = state.liveChildAiGrants[state.activeChildId];
  const now = Date.now();
  if (ageBand !== '12_14') {
    return failure('PRIVACY_REJECTED', 'Live voice is limited to ages 12–14');
  }
  if (
    grants.text.status !== 'granted' ||
    grants.voice.status !== 'granted' ||
    now >= Date.parse(grants.text.expiresAt) ||
    now >= Date.parse(grants.voice.expiresAt)
  ) {
    return failure('PRIVACY_REJECTED', 'Separate current text and voice grants are required');
  }
  return success({ journey: active.data, textGrant: grants.text, voiceGrant: grants.voice });
}

function boundLiveVoiceIsCurrent(
  state: PrototypeStoreState,
  bound: BoundLiveVoiceCapture,
): boolean {
  const authority = validateLiveVoiceAuthority(state);
  return (
    authority.ok &&
    state.liveVoiceCapture?.state.envelope.voiceSessionId === bound.state.envelope.voiceSessionId &&
    state.activeChildId === bound.childId &&
    authority.data.journey.assignment.id === bound.assignmentId &&
    authority.data.journey.task.id === bound.taskId &&
    authority.data.journey.task.version === bound.state.envelope.approvedTaskVersion &&
    authority.data.textGrant.grantVersion === bound.textGrantVersion &&
    authority.data.voiceGrant.grantVersion === bound.voiceGrantVersion
  );
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

const PARENT_TASK_DRAFT_TIMEOUT_MS = 2_500;

function requestParentTaskDraftWithinDeadline(
  service: ParentTaskDraftingService,
  request: ParentTaskDraftRequestV1,
): Promise<ServiceResult<ParentTaskDraftSuggestionV1>> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ServiceResult<ParentTaskDraftSuggestionV1>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      finish(
        failure('TIMEOUT', 'Parent task drafting provider exceeded the 2500ms deadline', true),
      );
    }, PARENT_TASK_DRAFT_TIMEOUT_MS);

    void Promise.resolve()
      .then(() => service.draft(request))
      .then(
        (result) => finish(result),
        () =>
          finish(
            failure('REMOTE_UNAVAILABLE', 'Parent task drafting provider was unavailable', true),
          ),
      );
  });
}

function parentTaskDraftFallbackReason(
  code: DomainErrorCode,
): NonNullable<ParentTaskDraftingView['fallbackReason']> {
  switch (code) {
    case 'TIMEOUT':
      return 'timeout';
    case 'SAFETY_REJECTED':
      return 'safety_rejected';
    case 'INVALID_RESPONSE':
      return 'invalid_response';
    default:
      return 'remote_unavailable';
  }
}

function idleParentTaskDraftingView(
  current: ParentTaskDraftingView,
  decision: ParentTaskDraftingView['decision'] = 'none',
  acceptedAttribution: ParentTaskDraftingView['acceptedAttribution'] = null,
): ParentTaskDraftingView {
  return {
    ...INITIAL_PARENT_TASK_DRAFTING_VIEW,
    requestRevision: current.requestRevision + 1,
    decision,
    acceptedAttribution,
  };
}

const LIVE_CHILD_COACH_TIMEOUT_MS = 1_500;

function requestLiveChildCoachWithinDeadline(
  service: LiveChildCoachTextService,
  request: Parameters<LiveChildCoachTextService['respond']>[0],
): Promise<ServiceResult<ChildCoachTextResponseV1>> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ServiceResult<ChildCoachTextResponseV1>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      finish(failure('TIMEOUT', 'Child Coach provider exceeded the 1500ms deadline', true));
    }, LIVE_CHILD_COACH_TIMEOUT_MS);
    void Promise.resolve()
      .then(() => service.respond(request))
      .then(
        (result) => finish(result),
        () => finish(failure('REMOTE_UNAVAILABLE', 'Child Coach provider was unavailable', true)),
      );
  });
}

function liveChildCoachFallbackReason(
  code: DomainErrorCode,
): NonNullable<LiveChildCoachView['fallbackReason']> {
  switch (code) {
    case 'TIMEOUT':
      return 'timeout';
    case 'SAFETY_REJECTED':
      return 'safety_rejected';
    case 'INVALID_RESPONSE':
      return 'invalid_response';
    default:
      return 'remote_unavailable';
  }
}

const LIVE_VOICE_TRANSCRIPTION_TIMEOUT_MS = 4_000;

function requestVoiceTranscriptionWithinDeadline(
  service: VoiceTranscriptionService,
  input: Parameters<VoiceTranscriptionService['transcribe']>[0],
): Promise<ServiceResult<VoiceTranscriptionResponseV1>> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ServiceResult<VoiceTranscriptionResponseV1>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      finish(failure('TIMEOUT', 'Voice transcription exceeded the 4000ms deadline', true));
    }, LIVE_VOICE_TRANSCRIPTION_TIMEOUT_MS);
    void Promise.resolve()
      .then(() => service.transcribe(input))
      .then(
        (result) => finish(result),
        () => finish(failure('REMOTE_UNAVAILABLE', 'Voice transcription was unavailable', true)),
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
    !suggestion.meta.disclosure.saysAiMayBeWrong ||
    !suggestion.meta.disclosure.saysHumanDecides ||
    suggestion.accepted !== false ||
    suggestion.suggestedContent.id !== request.taskTemplateId ||
    suggestion.suggestedContent.categoryId !== request.allowedCategoryId ||
    JSON.stringify(suggestion.suggestedContent.safety) !== JSON.stringify(request.allowedSafety) ||
    !validateTaskTemplate(suggestion.suggestedContent).ok ||
    !matchesCanonicalP0TaskContent(suggestion.suggestedContent, 'exact_guide')
  ) {
    return false;
  }
  const validOrigin =
    suggestion.meta.origin === 'live'
      ? validateLiveParentGuideSuggestion(request, suggestion)
      : suggestion.meta.origin === 'prepared' &&
        suggestion.meta.fixtureId === 'guide_recycling_refine_v1' &&
        suggestion.meta.disclosure.preparedIsExplicit;
  if (!validOrigin) return false;
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
  ambientAudioPreference: initialAmbientAudioPreference,
  activeExperience: initialRememberedDeviceAccess.activeExperience,
  activeChildId:
    initialRememberedDeviceAccess.activeChildId ?? initialPrototypeSession.activeChildId,
  role:
    initialRememberedDeviceAccess.activeExperience === 'child'
      ? 'child'
      : initialRememberedDeviceAccess.activeExperience === 'parent'
        ? 'parent'
        : initialPrototypeSession.role,
  childAccess: childAccessController.getView(),
  deviceAccess: initialRememberedDeviceAccess.view,
  rememberParentOnThisDevice: false,
  temporaryParentAccess: null,
  familyReward: createFamilyRewardRuntime(),
  growthJourney: initialGrowthJourney.data,
  mangroveLearningByProfile: initialMangroveLearning,
  sharedGrowth: initialSharedGrowth,
  revealBundleQueue: createEmptyRevealBundleQueue(),
  parentOnboarding: parentOnboardingController.getView(),
  localFamily: initialLocalFamily,
  localFamilyProfileRepair: initialLocalFamilyProfileRepair,
  pendingFamilyCreation: null,
  returningUserWelcome: null,
  parentGuideSuggestion: null,
  parentTaskDraftingView: { ...INITIAL_PARENT_TASK_DRAFTING_VIEW },
  liveChildAiGrants: createInitialLiveChildAiGrants(),
  liveChildCoachView: { ...INITIAL_LIVE_CHILD_COACH_VIEW },
  liveVoiceCapture: null,
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
    set({
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: result.ok ? 'fresh' : null,
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
    });
    return result;
  },

  requestFamilyReplacementVerification: (input) => {
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before starting family replacement');
    }
    if (state.localFamily.status !== 'ready') {
      return failure('INVALID_TRANSITION', 'The local family directory is unavailable');
    }
    if (!state.localFamily.record || !state.parentOnboarding.completionReceipt) {
      return failure('INVALID_TRANSITION', 'An existing local family is required for replacement');
    }
    const result = parentOnboardingController.requestVerification(input);
    set({
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: result.ok ? 'replacement' : null,
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
    });
    return result;
  },

  requestExistingParentVerification: (input) => {
    const state = get();
    if (state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Sign out before starting Parent verification');
    }
    const normalized = normalizeParentIdentifier(input.identifier);
    if (!normalized.ok) return { ok: false, error: normalized.error };
    const record = state.localFamily.record;
    const repair = state.localFamilyProfileRepair;
    if (state.localFamily.status !== 'ready' && !repair) {
      return failure('INVALID_TRANSITION', 'The local family directory is unavailable');
    }
    const savedParent = record?.parent ?? repair?.parent;
    if (
      !savedParent ||
      savedParent.normalizedIdentifier !== normalized.data.normalizedIdentifier ||
      savedParent.identifierKind !== normalized.data.identifierKind
    ) {
      return failure('NOT_FOUND', 'The Parent identifier is not linked to this family');
    }
    const result = parentOnboardingController.requestVerification({
      ...input,
      identifier: normalized.data.normalizedIdentifier,
    });
    set({
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: result.ok && repair ? 'profile_repair' : state.pendingFamilyCreation,
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
    });
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

  beginVerifiedFamilyReplacement: () => {
    const state = get();
    if (
      state.activeExperience !== 'signed_out' ||
      state.pendingFamilyCreation !== 'replacement' ||
      state.localFamily.status !== 'ready' ||
      !state.localFamily.record ||
      state.parentOnboarding.status !== 'verified' ||
      !state.parentOnboarding.completionReceipt
    ) {
      return failure(
        'INVALID_TRANSITION',
        'Complete verified replacement access before starting family setup',
      );
    }
    const result = parentOnboardingController.beginVerifiedFamilyReplacement();
    set({ parentOnboarding: parentOnboardingController.getView() });
    return result;
  },

  beginVerifiedFamilyProfileRepair: () => {
    const state = get();
    if (
      state.activeExperience !== 'signed_out' ||
      state.pendingFamilyCreation !== 'profile_repair' ||
      !state.localFamilyProfileRepair ||
      state.parentOnboarding.status !== 'verified' ||
      state.parentOnboarding.completionReceipt
    ) {
      return failure(
        'INVALID_TRANSITION',
        'Complete verified access before repairing the local family profile',
      );
    }
    const result = parentOnboardingController.beginVerifiedProfileRepair(
      state.localFamilyProfileRepair,
    );
    set({
      parentOnboarding: parentOnboardingController.getView(),
      locale: state.localFamilyProfileRepair.appLanguage,
      direction: getLocaleDirection(state.localFamilyProfileRepair.appLanguage),
    });
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
    set({
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: result.ok ? null : get().pendingFamilyCreation,
    });
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
    const replacingFamily = state.pendingFamilyCreation === 'replacement';
    const repairingFamily = state.pendingFamilyCreation === 'profile_repair';
    const previousFamily = replacingFamily ? state.localFamily.record : null;
    if (replacingFamily && !previousFamily) {
      return failure(
        'INVALID_TRANSITION',
        'The current local family is unavailable for replacement',
      );
    }
    const repairCandidate = repairingFamily ? state.localFamilyProfileRepair : null;
    if (repairingFamily && !repairCandidate) {
      return failure('INVALID_TRANSITION', 'The local family profile repair is unavailable');
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
        familyConnections: validated.data.familyConnections,
        familyName: validated.data.familyName,
        appLanguage: validated.data.appLanguage,
        children: validated.data.children.slice(0, validated.data.childCount).map((child) => ({
          id: child.profileId,
          role: 'child' as const,
          nickname: child.nickname,
          avatarId: child.avatarId,
          ageBand: child.ageBand,
          preferredLanguage: child.preferredLanguage,
          sex: child.sex!,
          interests: [...child.interests],
          hobbies: [...child.hobbies],
          accessibilityDefaults: [...child.accessibilityDefaults],
          supportPreferences: [...child.supportPreferences],
          customInterest: child.customInterest,
          customHobby: child.customHobby,
          customSupportPreference: child.customSupportPreference,
          customAccessibility: child.customAccessibility,
          personalizationEnabled: child.personalizationEnabled,
        })),
        pairedChildIds: repairCandidate ? [...repairCandidate.pairedChildIds] : [],
        createdAt: repairCandidate?.createdAt,
        now: R003_LOCAL_FAMILY_TIME,
      });
      if (!created.ok) return { ok: false, error: created.error };
      const saved = repairingFamily
        ? serviceRegistry.localFamily.saveProfileRepair(created.data)
        : serviceRegistry.localFamily.save(created.data);
      if (!saved.ok) return { ok: false, error: saved.error };
      newlySavedFamily = saved.data;
      if (repairingFamily && repairCandidate) {
        const restoredDevices = childAccessController.restorePairedDevices({
          childIds: repairCandidate.pairedChildIds,
          pairedAt: repairCandidate.updatedAt,
        });
        if (!restoredDevices.ok) return restoredDevices;
      }
    }
    let replacementReset: {
      readonly session: PrototypeSession;
      readonly growthJourney: GrowthJourneyRuntimeState;
      readonly mangroveLearningByProfile: MangroveLearningByProfile;
      readonly sharedGrowth: SharedGrowthState;
      readonly childAccess: ChildAccessView;
      readonly childVoiceView: ChildVoiceView;
    } | null = null;
    if (replacingFamily && newlySavedFamily && previousFamily) {
      const restorePreviousFamily = () => {
        serviceRegistry.localFamily.save(previousFamily);
      };
      const deviceAccessReset = serviceRegistry.deviceAccess.clear();
      if (!deviceAccessReset.ok) {
        restorePreviousFamily();
        return { ok: false, error: deviceAccessReset.error };
      }
      const reset = serviceRegistry.prototypeSession.resetPrototype();
      const nextGrowthJourney = createGrowthJourneyRuntime(
        reset.session,
        state.growthJourney.resetSequence + 1,
      );
      if (!nextGrowthJourney.ok) {
        restorePreviousFamily();
        return failure('INVALID_RESPONSE', nextGrowthJourney.error.message);
      }
      const voiceReset = childVoiceController.resetPrototype('parent');
      if (!voiceReset.ok) {
        restorePreviousFamily();
        return voiceReset;
      }
      const accessReset = serviceRegistry.access.resetPrototype();
      if (!accessReset.ok) {
        restorePreviousFamily();
        return accessReset;
      }
      const liveChildAiGrantReset = serviceRegistry.boundedAi.childAiGrants.reset();
      if (!liveChildAiGrantReset.ok) {
        restorePreviousFamily();
        return liveChildAiGrantReset;
      }
      const savedTaskTemplateReset = serviceRegistry.savedTaskTemplates.clear();
      if (!savedTaskTemplateReset.ok) {
        restorePreviousFamily();
        return savedTaskTemplateReset;
      }
      replacementReset = {
        session: reset.session,
        growthJourney: nextGrowthJourney.data,
        mangroveLearningByProfile: createLearningByProfile(nextGrowthJourney.data),
        sharedGrowth: createInitialSharedGrowth(nextGrowthJourney.data.resetSequence),
        childAccess: childAccessController.reset(),
        childVoiceView: childVoiceController.releaseAccessAuthorityAfterPrototypeReset(),
      };
    }
    const result = parentOnboardingController.complete(R001_ONBOARDING_TIME);
    if (result.ok) {
      const locale =
        newlySavedFamily?.appLanguage ??
        state.localFamily.record?.appLanguage ??
        result.data.appLanguage;
      const activeFamily = newlySavedFamily ?? state.localFamily.record;
      const remembered =
        state.rememberParentOnThisDevice && !state.temporaryParentAccess && activeFamily
          ? serviceRegistry.deviceAccess.rememberParent(activeFamily, R003_LOCAL_FAMILY_TIME)
          : null;
      if (replacementReset && newlySavedFamily) {
        releaseLiveVoiceCapture(state.liveVoiceCapture);
        set((current) => ({
          ...replacementReset.session,
          activeExperience: 'parent',
          childAccess: replacementReset.childAccess,
          deviceAccess: remembered
            ? remembered.ok
              ? deviceAccessView(remembered.data)
              : deviceAccessView(null, 'unavailable')
            : deviceAccessView(null),
          familyReward: createFamilyRewardRuntime(),
          growthJourney: replacementReset.growthJourney,
          mangroveLearningByProfile: replacementReset.mangroveLearningByProfile,
          sharedGrowth: replacementReset.sharedGrowth,
          revealBundleQueue: createEmptyRevealBundleQueue(),
          parentOnboarding: parentOnboardingController.getView(),
          localFamily: localFamilyView(newlySavedFamily),
          localFamilyProfileRepair: null,
          pendingFamilyCreation: null,
          rememberParentOnThisDevice: false,
          returningUserWelcome: null,
          temporaryParentAccess: null,
          parentGuideSuggestion: null,
          parentTaskDraftingView: idleParentTaskDraftingView(current.parentTaskDraftingView),
          liveChildAiGrants: createInitialLiveChildAiGrants(),
          liveChildCoachView: idleLiveChildCoachView(current.liveChildCoachView),
          liveVoiceCapture: null,
          childCoachResult: null,
          ageAdaptedCoachResult: null,
          childVoiceView: replacementReset.childVoiceView,
          confirmationPlan: null,
          lastRecognitionAttempt: null,
          prospectiveTaskAdjustment: null,
          preAcceptanceAdjustment: null,
          routineProgressByTask: replacementReset.session.routineProgressByTask ?? {},
          childTaskDraft: createEmptyChildTaskDraft(),
          taskDraftRevision: current.taskDraftRevision + 1,
          permissionProofSequence: 0,
          locale,
          direction: getLocaleDirection(locale),
          role: 'parent',
        }));
        return result;
      }
      set({
        activeExperience: 'parent',
        deviceAccess: remembered
          ? remembered.ok
            ? deviceAccessView(remembered.data)
            : deviceAccessView(null, 'unavailable')
          : state.deviceAccess,
        parentOnboarding: parentOnboardingController.getView(),
        localFamilyProfileRepair: newlySavedFamily ? null : state.localFamilyProfileRepair,
        pendingFamilyCreation: null,
        rememberParentOnThisDevice: false,
        locale,
        direction: getLocaleDirection(locale),
        role: 'parent',
        localFamily: newlySavedFamily ? localFamilyView(newlySavedFamily) : state.localFamily,
        returningUserWelcome: returningHouseholdId
          ? { kind: 'returning_parent', householdId: returningHouseholdId }
          : null,
      });
    } else {
      if (newlySavedFamily && !repairingFamily) {
        if (replacingFamily && previousFamily) serviceRegistry.localFamily.save(previousFamily);
        else serviceRegistry.localFamily.clear();
      }
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
      const rememberedChild = state.localFamily.record
        ? serviceRegistry.deviceAccess.rememberChild(
            state.localFamily.record,
            result.data.selectedChildId,
            R003_LOCAL_FAMILY_TIME,
          )
        : null;
      set({
        activeChildId: result.data.selectedChildId,
        activeExperience: 'child',
        deviceAccess: rememberedChild
          ? rememberedChild.ok
            ? deviceAccessView(rememberedChild.data)
            : deviceAccessView(null, 'unavailable')
          : state.deviceAccess,
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
    if (!state.temporaryParentAccess) {
      const cleared = serviceRegistry.deviceAccess.clear();
      if (!cleared.ok) return cleared;
    }
    const signedOut = parentOnboardingController.signOut(R001_ONBOARDING_TIME);
    if (!signedOut.ok) return signedOut;
    set({
      activeExperience: 'signed_out',
      deviceAccess: state.temporaryParentAccess ? state.deviceAccess : deviceAccessView(null),
      parentOnboarding: parentOnboardingController.getView(),
      role: 'child',
      returningUserWelcome: null,
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
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
      const rememberedChild = serviceRegistry.deviceAccess.rememberChild(
        persisted.data,
        childAccess.selectedChildId,
        R003_LOCAL_FAMILY_TIME,
      );
      set({
        childAccess,
        activeChildId: childAccess.selectedChildId,
        activeExperience: 'child',
        deviceAccess: rememberedChild.ok
          ? deviceAccessView(rememberedChild.data)
          : deviceAccessView(null, 'unavailable'),
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

  setRememberParentOnThisDevice: (remember) => {
    const state = get();
    set({ rememberParentOnThisDevice: state.temporaryParentAccess ? false : remember });
  },

  beginTemporaryParentAccess: () => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    const record = state.deviceAccess.record;
    if (
      state.deviceAccess.status !== 'ready' ||
      record?.principal.role !== 'child' ||
      record.principal.childId !== state.activeChildId
    ) {
      return failure(
        'INVALID_TRANSITION',
        'This Child device must be remembered before temporary Parent access',
      );
    }
    const signedOut = childAccessController.signOut(R001_ONBOARDING_TIME);
    if (!signedOut.ok) return signedOut;
    releaseLiveVoiceCapture(state.liveVoiceCapture);
    set({
      activeExperience: 'signed_out',
      childAccess: childAccessController.getView(),
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
      temporaryParentAccess: {
        returnChildId: state.activeChildId,
        startedAt: R003_LOCAL_FAMILY_TIME,
      },
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
      liveVoiceCapture: null,
    });
    return success(true);
  },

  cancelTemporaryParentAccess: () => {
    const state = get();
    const temporary = state.temporaryParentAccess;
    if (!temporary || state.activeExperience !== 'signed_out') {
      return failure('INVALID_TRANSITION', 'Temporary Parent access is not waiting to return');
    }
    if (state.parentOnboarding.status !== 'signed_out') {
      const canceled = parentOnboardingController.cancelVerification();
      if (!canceled.ok) return canceled;
    }
    const resumed = childAccessController.resumeRememberedChild(
      temporary.returnChildId,
      R001_ONBOARDING_TIME,
    );
    if (!resumed.ok) {
      set({
        childAccess: childAccessController.getView(),
        parentOnboarding: parentOnboardingController.getView(),
        pendingFamilyCreation: null,
        temporaryParentAccess: null,
      });
      return resumed;
    }
    set({
      activeChildId: temporary.returnChildId,
      activeExperience: 'child',
      childAccess: childAccessController.getView(),
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: null,
      role: 'child',
      returningUserWelcome: null,
      temporaryParentAccess: null,
    });
    return success(true);
  },

  dismissReturningUserWelcome: () => set({ returningUserWelcome: null }),

  signOutExperience: () => {
    const state = get();
    if (state.activeExperience === 'parent') {
      if (!state.temporaryParentAccess) {
        const cleared = serviceRegistry.deviceAccess.clear();
        if (!cleared.ok) return cleared;
      }
      const result = parentOnboardingController.signOut(R001_ONBOARDING_TIME);
      if (!result.ok) return result;
      if (state.temporaryParentAccess) {
        const returnChildId = state.temporaryParentAccess.returnChildId;
        const record = state.deviceAccess.record;
        const canResume =
          record?.principal.role === 'child' &&
          record.principal.childId === returnChildId &&
          state.localFamily.record?.pairedChildIds.includes(returnChildId);
        const resumed = canResume
          ? childAccessController.resumeRememberedChild(returnChildId, R001_ONBOARDING_TIME)
          : null;
        releaseLiveVoiceCapture(state.liveVoiceCapture);
        set({
          activeChildId: resumed?.ok ? returnChildId : state.activeChildId,
          activeExperience: resumed?.ok ? 'child' : 'signed_out',
          childAccess: childAccessController.getView(),
          parentOnboarding: parentOnboardingController.getView(),
          pendingFamilyCreation: null,
          rememberParentOnThisDevice: false,
          role: resumed?.ok ? 'child' : state.role,
          returningUserWelcome: null,
          temporaryParentAccess: null,
          parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
          liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
          liveVoiceCapture: null,
        });
        return success(true);
      }
    } else if (state.activeExperience === 'child') {
      const cleared = serviceRegistry.deviceAccess.clearMatchingChild(state.activeChildId);
      if (!cleared.ok) return cleared;
      const result = childAccessController.signOut(R001_ONBOARDING_TIME);
      if (!result.ok) return result;
    }
    releaseLiveVoiceCapture(state.liveVoiceCapture);
    set({
      activeExperience: 'signed_out',
      childAccess: childAccessController.getView(),
      deviceAccess: deviceAccessView(null),
      parentOnboarding: parentOnboardingController.getView(),
      pendingFamilyCreation: null,
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
      temporaryParentAccess: null,
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
      liveVoiceCapture: null,
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

  getFamilyConnectionPlan: () => {
    const state = get();
    if (!requireActiveParentExperience(state).ok) {
      return failure(
        'PRIVACY_REJECTED',
        'Family connection planning is available only to the active Parent',
      );
    }
    const directory = state.localFamily.record?.familyConnections;
    if (!directory) {
      return failure('NOT_FOUND', 'The local family connection directory is unavailable');
    }
    const plan = createFamilyConnectionPlan(directory);
    return plan.ok
      ? success(plan.data)
      : failure('INVALID_RESPONSE', 'The local family connection plan is invalid');
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

  getLiveChildAiGrant: (childId, capability) => {
    const state = get();
    const parentAuthorized = requireActiveParentExperience(state).ok;
    const childAuthorized =
      requireActiveChildExperience(state).ok && state.activeChildId === childId;
    if (!parentAuthorized && !childAuthorized) {
      return failure('PRIVACY_REJECTED', 'Only the Parent or matching Child can view this grant');
    }
    return success({ ...state.liveChildAiGrants[childId][capability] });
  },

  updateLiveChildAiGrant: (input) => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) {
      return failure('INVALID_TRANSITION', 'Only the active Parent can change bounded AI access');
    }
    if (
      input.capability === 'voice' &&
      input.granted &&
      (state.children[input.childId].ageBand as string) !== '12_14'
    ) {
      return failure('PRIVACY_REJECTED', 'Live voice grants are limited to ages 12–14');
    }
    const permissionProofSequence = state.permissionProofSequence + 1;
    const now = feature004Now();
    const proof = parentOnboardingController.authorizeLiveChildAiGrantChange({
      childId: input.childId,
      capability: input.capability,
      proofId: `f004-grant-${input.childId}-${input.capability}-${permissionProofSequence}`,
      reauthenticationCode: input.reauthenticationCode,
      now: R001_ONBOARDING_TIME,
    });
    if (!proof.ok) return proof;
    const current = state.liveChildAiGrants[input.childId][input.capability];
    const updated = serviceRegistry.boundedAi.childAiGrants.update({
      childId: input.childId,
      capability: input.capability,
      granted: input.granted,
      expectedVersion: current.grantVersion,
      noticeVersion: LIVE_CHILD_AI_NOTICE_VERSION,
      policyVersion: LIVE_CHILD_AI_POLICY_VERSION,
      providerVersion: LIVE_CHILD_AI_PROVIDER_VERSION,
      reauthenticationProofId: proof.data.id,
      now,
    });
    if (!updated.ok) return updated;
    releaseLiveVoiceCapture(state.liveVoiceCapture);
    set({
      liveChildAiGrants: Object.freeze({
        ...state.liveChildAiGrants,
        [input.childId]: Object.freeze({
          ...state.liveChildAiGrants[input.childId],
          [input.capability]: updated.data,
        }),
      }),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
      liveVoiceCapture: null,
      permissionProofSequence,
    });
    return updated;
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
    if (result.ok) {
      const cleared = serviceRegistry.deviceAccess.clearMatchingChild(childId);
      if (!cleared.ok) {
        set({
          deviceAccess: deviceAccessView(null, 'unavailable'),
          localFamily: localFamilyView(persisted.data),
          temporaryParentAccess:
            state.temporaryParentAccess?.returnChildId === childId
              ? null
              : state.temporaryParentAccess,
        });
        return cleared;
      }
      set({
        deviceAccess: cleared.data ? deviceAccessView(null) : state.deviceAccess,
        localFamily: localFamilyView(persisted.data),
        temporaryParentAccess:
          state.temporaryParentAccess?.returnChildId === childId
            ? null
            : state.temporaryParentAccess,
      });
    }
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

  setAmbientSoundEnabled: (enabled) => {
    const saved = serviceRegistry.ambientAudioPreferences.save(enabled);
    if (!saved.ok) return saved;
    set({
      ambientAudioPreference: {
        enabled: saved.data.ambientSoundEnabled,
        status: 'ready',
        source: 'stored',
      },
    });
    return success(saved.data.ambientSoundEnabled);
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
    releaseLiveVoiceCapture(state.liveVoiceCapture);
    set({
      activeChildId: childId,
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
      liveVoiceCapture: null,
    });
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
    const deviceAccessReset = serviceRegistry.deviceAccess.clear();
    if (!deviceAccessReset.ok) return { ok: false, error: deviceAccessReset.error };
    const localReset = serviceRegistry.localFamily.clear();
    if (!localReset.ok) return { ok: false, error: localReset.error };
    const ambientAudioReset = serviceRegistry.ambientAudioPreferences.clear();
    if (!ambientAudioReset.ok) return { ok: false, error: ambientAudioReset.error };
    const savedTaskTemplateReset = serviceRegistry.savedTaskTemplates.clear();
    if (!savedTaskTemplateReset.ok) return { ok: false, error: savedTaskTemplateReset.error };
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
    const liveChildAiGrantReset = serviceRegistry.boundedAi.childAiGrants.reset();
    if (!liveChildAiGrantReset.ok) return liveChildAiGrantReset;
    const releasedVoiceView = childVoiceController.releaseAccessAuthorityAfterPrototypeReset();
    releaseLiveVoiceCapture(state.liveVoiceCapture);
    set((state) => ({
      ...reset.session,
      ambientAudioPreference: { enabled: true, status: 'ready', source: 'default' },
      activeExperience: 'signed_out',
      childAccess: childAccessController.reset(),
      deviceAccess: deviceAccessView(null),
      familyReward: createFamilyRewardRuntime(),
      growthJourney: nextGrowthJourney.data,
      mangroveLearningByProfile: nextMangroveLearning,
      sharedGrowth: nextSharedGrowth,
      revealBundleQueue: createEmptyRevealBundleQueue(),
      parentOnboarding: onboardingReset.data,
      localFamily: localFamilyView(null),
      localFamilyProfileRepair: null,
      pendingFamilyCreation: null,
      rememberParentOnThisDevice: false,
      returningUserWelcome: null,
      temporaryParentAccess: null,
      parentGuideSuggestion: null,
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
      liveChildAiGrants: createInitialLiveChildAiGrants(),
      liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
      liveVoiceCapture: null,
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
    const current = get();
    const authority = requireActiveParentExperience(current);
    if (!authority.ok) return authority;
    const result = serviceRegistry.task.createDraft(input);
    if (result.ok) {
      releaseLiveVoiceCapture(current.liveVoiceCapture);
      const clearedVoice = childVoiceController.clearTaskBinding('parent');
      if (!clearedVoice.ok) return clearedVoice;
      set((state) => ({
        activeChildId: input.childId,
        activeAssignmentId: null,
        journey: result.data,
        parentGuideSuggestion: null,
        parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
        childCoachResult: null,
        ageAdaptedCoachResult: null,
        childVoiceView: clearedVoice.data,
        liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
        liveVoiceCapture: null,
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
              parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView),
              taskDraftRevision: state.taskDraftRevision + 1,
            }
          : { journey: result.data },
      );
    }
    return result;
  },

  requestParentGuide: async (input, primaryService = serviceRegistry.parentGuidePrimary) => {
    const before = get();
    const authority = requireActiveParentExperience(before);
    if (!authority.ok) return authority;
    if (before.parentGuideSuggestion) {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Guide suggestion before requesting another intent',
      );
    }
    if (
      before.parentTaskDraftingView.status === 'requesting' ||
      before.parentTaskDraftingView.suggestion
    ) {
      return failure('INVALID_TRANSITION', 'Resolve the Parent task draft suggestion first');
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

  requestParentTaskDraft: async (
    input,
    primaryService = serviceRegistry.boundedAi.parentTaskDraftingPrimary,
  ) => {
    const before = get();
    const authority = requireActiveParentExperience(before);
    if (!authority.ok) return authority;
    if (!before.journey || before.journey.lifecycle !== 'draft') {
      return failure('INVALID_TRANSITION', 'A current Parent task draft is required');
    }
    if (
      before.parentGuideSuggestion ||
      before.parentTaskDraftingView.status === 'requesting' ||
      before.parentTaskDraftingView.suggestion
    ) {
      return failure('INVALID_TRANSITION', 'Resolve the current assistant suggestion first');
    }
    const child = before.children[before.journey.task.targetChildId];
    const built = createParentTaskDraftRequest({
      journey: before.journey,
      ageBand: child.ageBand,
      requestId: input.requestId,
      bindingNonce: input.bindingNonce,
      catalogVersion: 1,
      intent: input.intent,
      effortBand: input.effortBand,
      stepCount: input.stepCount,
      supportMode: input.supportMode,
      draftRevision: before.taskDraftRevision,
    });
    if (!built.ok) return { ok: false, error: built.error };
    const requestRevision = before.parentTaskDraftingView.requestRevision + 1;
    set({
      parentTaskDraftingView: {
        status: 'requesting',
        origin: null,
        suggestion: null,
        retainedCopy: built.data.snapshot.retainedCopy,
        acceptedAttribution: null,
        requestRevision,
        decision: 'none',
        fallbackReason: null,
        activeRequest: built.data.request,
        authoritySnapshot: built.data.snapshot,
      },
    });
    const requestIsCurrent = () => {
      const current = get();
      return (
        requireActiveParentExperience(current).ok &&
        current.journey?.lifecycle === 'draft' &&
        current.journey.task.id === built.data.snapshot.taskId &&
        current.journey.task.version === built.data.snapshot.taskVersion &&
        current.journey.task.targetChildId === built.data.snapshot.targetChildId &&
        current.activeChildId === built.data.snapshot.targetChildId &&
        current.taskDraftRevision === built.data.snapshot.draftRevision &&
        current.parentTaskDraftingView.requestRevision === requestRevision
      );
    };

    const primary = await requestParentTaskDraftWithinDeadline(primaryService, built.data.request);
    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'Parent task drafting response is stale');
    }
    const validated = primary.ok
      ? validateParentTaskDraftSuggestion(built.data.request, primary.data)
      : primary;
    if (validated.ok && primary.ok) {
      const origin = primary.meta.origin === 'live' ? 'live' : 'prepared';
      set({
        parentTaskDraftingView: {
          status: 'ready',
          origin,
          suggestion: validated.data,
          retainedCopy: built.data.snapshot.retainedCopy,
          acceptedAttribution: null,
          requestRevision,
          decision: 'none',
          fallbackReason: null,
          activeRequest: built.data.request,
          authoritySnapshot: built.data.snapshot,
        },
      });
      return {
        ok: true,
        data: validated.data,
        meta: { ...primary.meta, origin },
      };
    }

    const fallbackReason = !primary.ok
      ? parentTaskDraftFallbackReason(primary.error.code)
      : !validated.ok
        ? parentTaskDraftFallbackReason(validated.error.code)
        : 'invalid_response';
    const prepared = await serviceRegistry.boundedAi.parentTaskDraftingPrepared.draft(
      built.data.request,
    );
    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'Parent task drafting response is stale');
    }
    if (!prepared.ok) return prepared;
    const preparedValidated = validateParentTaskDraftSuggestion(built.data.request, prepared.data);
    if (!preparedValidated.ok) return { ok: false, error: preparedValidated.error };
    const result: ServiceResult<ParentTaskDraftSuggestionV1> = {
      ok: true,
      data: preparedValidated.data,
      meta: {
        origin: 'prepared',
        fallbackUsed: true,
        fixtureId: prepared.meta.fixtureId,
      },
    };
    set({
      parentTaskDraftingView: {
        status: 'fallback',
        origin: 'prepared',
        suggestion: result.data,
        retainedCopy: built.data.snapshot.retainedCopy,
        acceptedAttribution: null,
        requestRevision,
        decision: 'none',
        fallbackReason,
        activeRequest: built.data.request,
        authoritySnapshot: built.data.snapshot,
      },
    });
    return result;
  },

  acceptParentTaskDraft: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const view = state.parentTaskDraftingView;
    if (
      !state.journey ||
      !view.suggestion ||
      !view.authoritySnapshot ||
      !view.activeRequest ||
      !view.origin
    ) {
      return failure('INVALID_TRANSITION', 'A displayed Parent task draft is required');
    }
    const validated = validateParentTaskDraftSuggestion(view.activeRequest, view.suggestion);
    if (!validated.ok) return { ok: false, error: validated.error };
    const applied = applyParentTaskDraftSuggestion(
      state.journey,
      view.authoritySnapshot,
      validated.data,
      state.taskDraftRevision,
    );
    if (!applied.ok) return { ok: false, error: applied.error };
    set({
      journey: applied.data,
      taskDraftRevision: state.taskDraftRevision + 1,
      parentTaskDraftingView: idleParentTaskDraftingView(view, 'accepted', {
        origin: view.origin,
        schemaVersion: '1.0',
        archetypeId: view.suggestion.archetypeId,
      }),
    });
    return success(applied.data);
  },

  keepParentTaskDraft: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.journey || !state.parentTaskDraftingView.suggestion) {
      return failure('INVALID_TRANSITION', 'A displayed Parent task draft is required');
    }
    set({
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView, 'kept'),
    });
    return success(state.journey);
  },

  editParentTaskDraft: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    if (!state.journey || !state.parentTaskDraftingView.suggestion) {
      return failure('INVALID_TRANSITION', 'A displayed Parent task draft is required');
    }
    set({
      parentTaskDraftingView: idleParentTaskDraftingView(state.parentTaskDraftingView, 'edited'),
    });
    return success(state.journey);
  },

  reviewTask: () => {
    const state = get();
    const authority = requireActiveParentExperience(state);
    if (!authority.ok) return authority;
    const { journey, parentGuideSuggestion, parentTaskDraftingView } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'A draft is required');
    if (parentGuideSuggestion) {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Guide suggestion before reviewing the task',
      );
    }
    if (parentTaskDraftingView.suggestion || parentTaskDraftingView.status === 'requesting') {
      return failure(
        'INVALID_TRANSITION',
        'Resolve the displayed Parent task draft before reviewing the task',
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

  requestLiveChildCoach: async (
    input,
    primaryService = serviceRegistry.boundedAi.childCoachTextPrimary,
  ) => {
    const before = get();
    const guarded = validateActiveChildAssignment(before, true);
    if (!guarded.ok) return guarded;
    const journey = guarded.data;
    const grant = before.liveChildAiGrants[before.activeChildId].text;
    const voiceGrant = before.liveChildAiGrants[before.activeChildId].voice;
    const requestRevision = before.liveChildCoachView.requestRevision + 1;
    if (grant.status !== 'granted') {
      set({
        liveChildCoachView: {
          ...INITIAL_LIVE_CHILD_COACH_VIEW,
          status: 'denied',
          requestRevision,
        },
      });
      return failure('PRIVACY_REJECTED', 'A current Parent text grant is required');
    }
    const archetype = parentTaskArchetypeSchema.safeParse(journey.task.templateId);
    if (!archetype.success) {
      return failure('INVALID_INPUT', 'The active task is outside the reviewed Coach catalog');
    }
    if (input.inputOrigin === 'reviewed_voice_transcript') {
      const voice = before.liveVoiceCapture;
      if (
        !voice ||
        !boundLiveVoiceIsCurrent(before, voice) ||
        voice.state.envelope.requestId !== input.voiceRequestId ||
        voice.state.envelope.bindingNonce !== input.voiceBindingNonce ||
        !voice.state.transcript ||
        !['ready_to_send', 'sending_text'].includes(voice.state.envelope.status)
      ) {
        return failure('PRIVACY_REJECTED', 'Reviewed voice text is not bound to this session');
      }
    }
    const built = createLiveChildCoachRequest({
      ageBand: before.children[before.activeChildId].ageBand,
      childId: before.activeChildId,
      locale: before.locale,
      now: feature004Now(),
      taskArchetypeId: archetype.data,
      catalogVersion: 1,
      approvedTaskVersion: journey.task.version,
      requestId: input.requestId,
      bindingNonce: input.bindingNonce,
      grant,
      intent: input.intent,
      boundedText: input.boundedText,
      inputOrigin: input.inputOrigin,
      voiceGrant: input.inputOrigin === 'reviewed_voice_transcript' ? voiceGrant : undefined,
      voiceRequestId: input.voiceRequestId,
      voiceBindingNonce: input.voiceBindingNonce,
    });
    if (!built.ok) {
      set({
        liveChildCoachView: {
          ...INITIAL_LIVE_CHILD_COACH_VIEW,
          status: 'denied',
          requestRevision,
          fallbackReason: built.error.code === 'SAFETY_REJECTED' ? 'safety_rejected' : null,
        },
      });
      return built;
    }
    const snapshot = {
      childId: before.activeChildId,
      assignmentId: journey.assignment.id,
      taskId: journey.task.id,
      approvedTaskVersion: journey.task.version,
      grantVersion: grant.grantVersion,
      noticeVersion: grant.noticeVersion,
      voiceGrantVersion:
        input.inputOrigin === 'reviewed_voice_transcript' ? voiceGrant.grantVersion : null,
      voiceRequestId:
        input.inputOrigin === 'reviewed_voice_transcript' ? (input.voiceRequestId ?? null) : null,
    };
    set({
      liveChildCoachView: {
        status: 'requesting',
        origin: null,
        response: null,
        activeRequest: built.data,
        snapshot,
        requestRevision,
        fallbackReason: null,
      },
    });
    const requestIsCurrent = () => {
      const current = get();
      const active = validateActiveChildAssignment(current, true);
      const currentGrant = current.liveChildAiGrants[snapshot.childId].text;
      return (
        active.ok &&
        current.activeChildId === snapshot.childId &&
        active.data.assignment.id === snapshot.assignmentId &&
        active.data.task.id === snapshot.taskId &&
        active.data.task.version === snapshot.approvedTaskVersion &&
        currentGrant.status === 'granted' &&
        currentGrant.grantVersion === snapshot.grantVersion &&
        currentGrant.noticeVersion === snapshot.noticeVersion &&
        (snapshot.voiceGrantVersion === null ||
          (current.liveChildAiGrants[snapshot.childId].voice.status === 'granted' &&
            current.liveChildAiGrants[snapshot.childId].voice.grantVersion ===
              snapshot.voiceGrantVersion)) &&
        current.liveChildCoachView.requestRevision === requestRevision
      );
    };

    const primary = await requestLiveChildCoachWithinDeadline(primaryService, built.data);
    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'The bounded Child Coach request is stale');
    }
    const validated = primary.ok
      ? validateLiveChildCoachResponse(built.data, primary.data)
      : primary;
    if (validated.ok && primary.ok) {
      const origin = primary.meta.origin === 'live' ? 'live' : 'prepared';
      set({
        liveChildCoachView: {
          status: 'terminal',
          origin,
          response: validated.data,
          activeRequest: built.data,
          snapshot,
          requestRevision,
          fallbackReason: null,
        },
      });
      return { ok: true, data: validated.data, meta: { ...primary.meta, origin } };
    }

    const fallbackReason = !primary.ok
      ? liveChildCoachFallbackReason(primary.error.code)
      : !validated.ok
        ? liveChildCoachFallbackReason(validated.error.code)
        : 'invalid_response';
    const prepared = await serviceRegistry.boundedAi.childCoachTextPrepared.respond(built.data);
    if (!requestIsCurrent()) {
      return failure('INVALID_TRANSITION', 'The bounded Child Coach request is stale');
    }
    if (!prepared.ok) return prepared;
    const preparedValidated = validateLiveChildCoachResponse(built.data, prepared.data);
    if (!preparedValidated.ok) return { ok: false, error: preparedValidated.error };
    const result: ServiceResult<ChildCoachTextResponseV1> = {
      ok: true,
      data: preparedValidated.data,
      meta: {
        origin: 'prepared',
        fallbackUsed: true,
        fixtureId: prepared.meta.fixtureId,
      },
    };
    set({
      liveChildCoachView: {
        status: 'fallback',
        origin: 'prepared',
        response: result.data,
        activeRequest: built.data,
        snapshot,
        requestRevision,
        fallbackReason,
      },
    });
    return result;
  },

  declineLiveChildCoach: () => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    set({ liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView, 'declined') });
    return success(true);
  },

  clearLiveChildCoach: () => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    set({ liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView) });
    return success(true);
  },

  prepareLiveVoiceCapture: (input) => {
    const state = get();
    const authority = validateLiveVoiceAuthority(state);
    if (!authority.ok) return authority;
    const archetype = parentTaskArchetypeSchema.safeParse(authority.data.journey.task.templateId);
    if (!archetype.success) {
      return failure('INVALID_INPUT', 'The active task is outside the reviewed voice catalog');
    }
    let voiceState: LiveVoiceCaptureState;
    try {
      voiceState = createLiveVoiceCaptureState({
        voiceSessionId: input.voiceSessionId,
        requestId: input.requestId,
        bindingNonce: input.bindingNonce,
        locale: state.locale,
        noticeVersion: authority.data.voiceGrant.noticeVersion,
        grantVersion: authority.data.voiceGrant.grantVersion,
        taskArchetypeId: archetype.data,
        approvedTaskVersion: authority.data.journey.task.version,
      });
    } catch {
      return failure('INVALID_INPUT', 'Voice request correlation is outside policy');
    }
    const bound: BoundLiveVoiceCapture = {
      state: voiceState,
      childId: state.activeChildId,
      assignmentId: authority.data.journey.assignment.id,
      taskId: authority.data.journey.task.id,
      textGrantVersion: authority.data.textGrant.grantVersion,
      voiceGrantVersion: authority.data.voiceGrant.grantVersion,
    };
    set({ liveVoiceCapture: bound });
    return success(bound);
  },

  requestLiveVoicePermission: async (captureService = liveVoiceCaptureService) => {
    const before = get();
    const bound = before.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(before, bound)) {
      return failure('INVALID_TRANSITION', 'A current eligible voice session is required');
    }
    const pending = beginVoicePermissionRequest(bound.state);
    if (!pending.ok) return pending;
    set({ liveVoiceCapture: { ...bound, state: pending.data } });
    const permission = await captureService.requestPermission();
    const current = get();
    if (!boundLiveVoiceIsCurrent(current, bound)) {
      return failure('INVALID_TRANSITION', 'Voice permission result is stale');
    }
    if (!permission.ok) {
      const denied = resolveVoicePermission(pending.data, false);
      if (denied.ok) set({ liveVoiceCapture: { ...bound, state: denied.data } });
      return permission;
    }
    const resolved = resolveVoicePermission(pending.data, permission.data === 'granted');
    if (!resolved.ok) return resolved;
    const next = { ...bound, state: resolved.data };
    set({ liveVoiceCapture: next });
    return success(next);
  },

  startLiveVoiceHold: async (captureService = liveVoiceCaptureService) => {
    const before = get();
    const bound = before.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(before, bound)) {
      return failure('INVALID_TRANSITION', 'A current eligible voice session is required');
    }
    if (bound.state.envelope.status !== 'ready') {
      return failure('INVALID_TRANSITION', 'Microphone permission must be granted before hold');
    }
    const started = await captureService.startHeld();
    if (!started.ok) return started;
    if (!boundLiveVoiceIsCurrent(get(), bound)) {
      await captureService.cancel();
      return failure('INVALID_TRANSITION', 'Voice capture start is stale');
    }
    const transitioned = startHeldVoiceCapture(bound.state, started.data.startedAt);
    if (!transitioned.ok) {
      await captureService.cancel();
      return transitioned;
    }
    const next = { ...bound, state: transitioned.data };
    set({ liveVoiceCapture: next });
    return success(next);
  },

  stopLiveVoiceHold: async (services = {}) => {
    const capture = services.capture ?? liveVoiceCaptureService;
    const media = services.media ?? liveVoiceMediaService;
    const transcription =
      services.transcription ?? serviceRegistry.boundedAi.voiceTranscriptionPrimary;
    const before = get();
    const bound = before.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(before, bound)) {
      return failure('INVALID_TRANSITION', 'A current held voice session is required');
    }
    const discardCapturedFile = async <T>(
      uri: string,
      source: LiveVoiceCaptureState,
      original: ServiceResult<T>,
    ): Promise<ServiceResult<T>> => {
      const deletion = await media.delete(uri);
      if (boundLiveVoiceIsCurrent(get(), bound)) {
        const deleting = beginVoiceDeletion(source);
        const completed = deleting.ok
          ? completeVoiceDeletion(deleting.data, deletion.ok)
          : deleting;
        if (completed.ok) set({ liveVoiceCapture: { ...bound, state: completed.data } });
      }
      return deletion.ok ? original : deletion;
    };
    const captured = await capture.stopHeld();
    if (!captured.ok) return captured;
    const inspected = await media.inspect(captured.data.uri);
    if (!inspected.ok) {
      return discardCapturedFile(captured.data.uri, bound.state, inspected);
    }
    const bytes = await media.read(captured.data.uri);
    if (!bytes.ok || bytes.data.byteLength !== inspected.data.byteCount) {
      return discardCapturedFile(
        captured.data.uri,
        bound.state,
        bytes.ok ? failure('INVALID_RESPONSE', 'Voice file changed before transcription') : bytes,
      );
    }
    const stopped = stopHeldVoiceCapture(bound.state, {
      stoppedAt: new Date().toISOString(),
      durationMs: captured.data.durationMs,
      byteCount: inspected.data.byteCount,
      cacheUri: inspected.data.uri,
    });
    if (!stopped.ok) {
      bytes.data.fill(0);
      return discardCapturedFile(captured.data.uri, bound.state, stopped);
    }
    const transcribing = { ...bound, state: stopped.data };
    set({ liveVoiceCapture: transcribing });
    const metadata = {
      operation: 'transcribe_child_task_voice_v1' as const,
      schemaVersion: '1.0' as const,
      requestId: stopped.data.envelope.requestId,
      bindingNonce: stopped.data.envelope.bindingNonce,
      locale: stopped.data.envelope.locale,
      taskArchetypeId: stopped.data.envelope.taskArchetypeId,
      catalogVersion: 1,
      approvedTaskVersion: stopped.data.envelope.approvedTaskVersion,
      noticeVersion: stopped.data.envelope.noticeVersion,
      grantVersion: stopped.data.envelope.grantVersion,
      durationMs: stopped.data.envelope.durationMs,
      declaredByteCount: inspected.data.byteCount,
      mediaType: captured.data.mediaType,
      synthetic: true as const,
    };
    const primary = await requestVoiceTranscriptionWithinDeadline(transcription, {
      metadata,
      audioBytes: bytes.data,
    });
    const transcript = primary.ok
      ? primary
      : await requestVoiceTranscriptionWithinDeadline(
          serviceRegistry.boundedAi.voiceTranscriptionPrepared,
          { metadata, audioBytes: bytes.data },
        );
    bytes.data.fill(0);
    const deletion = await media.delete(captured.data.uri);
    if (!boundLiveVoiceIsCurrent(get(), transcribing)) {
      return failure('INVALID_TRANSITION', 'Voice transcription result is stale');
    }
    if (!deletion.ok) {
      const deleting = beginVoiceDeletion(transcribing.state);
      const failed = deleting.ok ? completeVoiceDeletion(deleting.data, false) : deleting;
      if (failed.ok) set({ liveVoiceCapture: { ...bound, state: failed.data } });
      return deletion;
    }
    if (!transcript.ok) {
      const deleting = beginVoiceDeletion(transcribing.state);
      const deleted = deleting.ok ? completeVoiceDeletion(deleting.data, true) : deleting;
      if (deleted.ok) set({ liveVoiceCapture: { ...bound, state: deleted.data } });
      return transcript;
    }
    const applied = applyVoiceTranscript(
      transcribing.state,
      transcript.data,
      primary.ok && primary.meta.origin === 'live' ? 'transcribed' : 'prepared_synthetic',
    );
    if (!applied.ok) return applied;
    const next = { ...bound, state: applied.data };
    set({ liveVoiceCapture: next });
    return success(next);
  },

  editLiveVoiceTranscript: (text) => {
    const state = get();
    const bound = state.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(state, bound)) {
      return failure('INVALID_TRANSITION', 'A current voice transcript is required');
    }
    const edited = editVoiceTranscript(bound.state, text);
    if (!edited.ok) return edited;
    const next = { ...bound, state: edited.data };
    set({ liveVoiceCapture: next });
    return success(next);
  },

  markLiveVoiceTranscriptReady: () => {
    const state = get();
    const bound = state.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(state, bound)) {
      return failure('INVALID_TRANSITION', 'A current voice transcript is required');
    }
    const reviewed = markVoiceTranscriptReady(bound.state);
    if (!reviewed.ok) return reviewed;
    const next = { ...bound, state: reviewed.data };
    set({ liveVoiceCapture: next });
    return success(next);
  },

  deleteLiveVoiceCapture: async (mediaService = liveVoiceMediaService) => {
    const state = get();
    const bound = state.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(state, bound)) {
      return failure('INVALID_TRANSITION', 'A current voice session is required');
    }
    const deleting = beginVoiceDeletion(bound.state);
    if (!deleting.ok) return deleting;
    set({ liveVoiceCapture: { ...bound, state: deleting.data } });
    const uri = deleting.data.envelope.cacheUri;
    const deleted = uri ? await mediaService.delete(uri) : success(true as const);
    if (!boundLiveVoiceIsCurrent(get(), bound)) {
      return failure('INVALID_TRANSITION', 'Voice deletion result is stale');
    }
    const completed = completeVoiceDeletion(deleting.data, deleted.ok);
    if (!completed.ok) return completed;
    const next = { ...bound, state: completed.data };
    set({ liveVoiceCapture: next });
    return deleted.ok ? success(next) : deleted;
  },

  sendLiveVoiceTranscript: async (input, primaryService) => {
    const before = get();
    const bound = before.liveVoiceCapture;
    if (!bound || !boundLiveVoiceIsCurrent(before, bound) || !bound.state.transcript) {
      return failure('INVALID_TRANSITION', 'A current reviewed voice transcript is required');
    }
    const sending = beginVoiceTranscriptSend(bound.state);
    if (!sending.ok) return sending;
    set({ liveVoiceCapture: { ...bound, state: sending.data } });
    const result = await get().requestLiveChildCoach(
      {
        requestId: input.requestId,
        bindingNonce: input.bindingNonce,
        intent: input.intent,
        boundedText: bound.state.transcript.text,
        inputOrigin: 'reviewed_voice_transcript',
        voiceRequestId: bound.state.envelope.requestId,
        voiceBindingNonce: bound.state.envelope.bindingNonce,
      },
      primaryService,
    );
    const current = get();
    if (!boundLiveVoiceIsCurrent(current, bound)) {
      return failure('INVALID_TRANSITION', 'Voice Coach result is stale');
    }
    if (!result.ok) {
      const restored = restoreVoiceTranscriptAfterFailedSend(sending.data);
      if (restored.ok) set({ liveVoiceCapture: { ...bound, state: restored.data } });
      return result;
    }
    const completed = completeVoiceTranscriptSend(sending.data);
    if (!completed.ok) return completed;
    set({ liveVoiceCapture: { ...bound, state: completed.data } });
    return result;
  },

  cancelLiveVoiceCapture: async (
    captureService = liveVoiceCaptureService,
    mediaService = liveVoiceMediaService,
  ) => {
    const bound = get().liveVoiceCapture;
    if (!bound) return success(true);
    const canceled = await captureService.cancel();
    const uris = new Set(
      [bound.state.envelope.cacheUri, canceled.ok ? canceled.data.uri : null].filter(
        (uri): uri is string => Boolean(uri),
      ),
    );
    for (const uri of uris) {
      const deleted = await mediaService.delete(uri);
      if (!deleted.ok) return deleted;
    }
    set({ liveVoiceCapture: null });
    return success(true);
  },

  submitTask: (input) => {
    const state = get();
    const authority = requireActiveChildExperience(state);
    if (!authority.ok) return authority;
    const { activeChildId, journey } = state;
    if (!journey) return failure('INVALID_TRANSITION', 'An in-progress task is required');
    const result = serviceRegistry.task.submit(journey, activeChildId, input);
    if (result.ok) {
      releaseLiveVoiceCapture(state.liveVoiceCapture);
      set((state) => ({
        journey: result.data,
        confirmationPlan: null,
        lastRecognitionAttempt: null,
        liveChildCoachView: idleLiveChildCoachView(state.liveChildCoachView),
        liveVoiceCapture: null,
      }));
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
