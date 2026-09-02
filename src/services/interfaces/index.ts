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
import type {
  AccessSession,
  AccessView,
  CapabilityAuthorization,
  CapabilityAuthorizationInput,
  ChildAccessSession,
  ChildPermissionGrant,
  ChildPermissionQueryInput,
  DeviceAccessState,
  DeviceRevocationInput,
  PairingApprovalInput,
  PairingConsumptionInput,
  PairingRequest,
  PairingRequestInput,
  PairingRevocationInput,
  ParentAccessSession,
  PermissionUpdateInput,
  ProjectAccessSessionInput,
  ReauthenticationInput,
  ReauthenticationProof,
  SensitiveActionInput,
  SyntheticChildSignIn,
  SyntheticParentSignIn,
} from '../../models/access';
import type {
  FamilyRewardEvaluation,
  FamilyRewardEvaluationOptions,
  FamilyRewardGivenResult,
  FamilyRewardPlan,
  FamilyRewardPlanDraft,
  FamilyRewardRevision,
  GiveFamilyRewardInput,
  MonetaryCommitmentSummary,
  PrivateFamilyRewardView,
  ReviseFamilyRewardPlanInput,
} from '../../models/familyReward';
import type {
  ChallengeLeafCandidate,
  ConfirmChallengeLeafInput,
  CreateLeagueWeekInput,
  FamilyLeagueWeek,
  LeagueEncouragementRequest,
  LeagueEligibilityDecision,
  LeagueParticipantProjection,
  LeagueRolloverInput,
  LeagueRolloverResult,
  PreparedEncouragement,
  SyntheticLeagueParticipant,
  WeeklyGrowthResult,
} from '../../models/familyLeague';
import type {
  AssignmentApprovalResult,
  AssistantDisclosure,
  CheckInRouteState,
  ChildChoicePool,
  ChildCoachRequest,
  ChildCoachResult,
  CompletionMode,
  ConfirmationAttempt,
  DomainError,
  LandscapeGrowth,
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
  SyntheticChildId,
  Task,
  TaskCategory,
  TaskCategoryId,
  TaskJourney,
  TaskReviewResult,
  TaskTemplate,
} from '../../models/familyGrowth';

export type { DomainError } from '../../models/familyGrowth';

export interface ServiceMeta {
  readonly origin: 'synthetic' | 'prepared' | 'simulated' | 'live';
  readonly fallbackUsed: boolean;
  readonly fixtureId?: string;
}

export type ServiceResult<T> =
  | { readonly ok: true; readonly data: T; readonly meta: ServiceMeta }
  | { readonly ok: false; readonly error: DomainError };

export interface SessionAuthorityInput {
  readonly session: AccessSession;
  readonly now: string;
}

export interface TaskService {
  listCategories(): readonly TaskCategory[];
  listTemplates(categoryId?: TaskCategoryId): readonly TaskTemplate[];
  getChildChoicePool(session: PrototypeSession): ChildChoicePool;
  createDraft(input: {
    readonly childId: SyntheticChildId;
    readonly templateId: string;
    readonly parentText: LocalizedText;
  }): ServiceResult<TaskJourney>;
  updateDraftParentText(
    journey: TaskJourney,
    parentText: LocalizedText,
  ): ServiceResult<TaskJourney>;
  applyAcceptedGuideSuggestion(
    journey: TaskJourney,
    suggestion: ParentGuideTaskSuggestion,
  ): ServiceResult<TaskJourney>;
  keepParentText(journey: TaskJourney): ServiceResult<TaskJourney>;
  review(journey: TaskJourney): ServiceResult<TaskReviewResult>;
  approveAssignment(journey: TaskJourney): ServiceResult<AssignmentApprovalResult>;
  chooseAssignment(
    journey: TaskJourney,
    activeChildId: SyntheticChildId,
  ): ServiceResult<TaskJourney>;
  startAssignment(
    journey: TaskJourney,
    activeChildId: SyntheticChildId,
  ): ServiceResult<TaskJourney>;
  submit(
    journey: TaskJourney,
    activeChildId: SyntheticChildId,
    input: {
      readonly definitionAcknowledged: boolean;
      readonly completionMode: CompletionMode;
      readonly helpUsed: LocalizedText | null;
      readonly preparedMediaFixtureId: string | null;
      readonly reflection: LocalizedText | null;
      readonly observableFacts: readonly LocalizedText[];
    },
  ): ServiceResult<TaskJourney>;
  requestKindRetry(
    journey: TaskJourney,
    neutralObservation: LocalizedText | null,
  ): ServiceResult<TaskJourney>;
  resumeRetry(journey: TaskJourney): ServiceResult<TaskJourney>;
}

export interface RecognitionService {
  resolveCheckInState(
    session: PrototypeSession,
    submissionId: string,
  ): ServiceResult<CheckInRouteState>;
  planConfirmation(
    session: PrototypeSession,
    input: {
      readonly submissionId: string;
      readonly praise: LocalizedText;
      readonly neutralObservation: LocalizedText | null;
      readonly uncertainty: LocalizedText | null;
    },
  ): ServiceResult<ConfirmationAttempt>;
  markPraisePresented(
    plan: PendingConfirmationPlan,
    action: PraisePresentationAction,
  ): ServiceResult<PraisePresentedPlan>;
  applyRecognition(
    session: PrototypeSession,
    presentedPlan: PraisePresentedPlan,
    continuation: RecognitionContinuationAction,
  ): ServiceResult<RecognitionAttemptResult>;
  getReceipt(session: PrototypeSession, recognitionKey: string): RecognitionReceipt | null;
}

export interface GardenService {
  stageForSeeds(cumulativeSeeds: number): PrototypeSession['landscapeProgress']['ghaf']['stage'];
  nextThresholdForSeeds(cumulativeSeeds: number): 20 | 60 | 120 | 200 | null;
  planGrowth(input: {
    readonly landscape: PrototypeSession['landscapeProgress']['ghaf'];
    readonly seedAmount: 4 | 6 | 8 | 12 | 15;
  }): ServiceResult<LandscapeGrowth>;
}

export interface FamilyProjectionService {
  validateTaskSharing(task: Task): ServiceResult<Task>;
  validateEligibilityContext(input: unknown): ServiceResult<ProjectionEligibilityContext>;
  planAfterConfirmation(input: ProjectionEligibilityContext): ServiceResult<ProjectionPlan>;
  applyCanopy(
    current: PrototypeSession['household']['combinedCanopy'],
    dto: NonNullable<ProjectionPlan['canopyContribution']>,
  ): PrototypeSession['household']['combinedCanopy'];
  applyCircle(
    current: PrototypeSession['circleGoal'],
    dto: NonNullable<ProjectionPlan['circleEvent']>,
  ): PrototypeSession['circleGoal'];
}

export interface MediaService {
  getPrepared(id: PreparedMediaFixture['id']): Promise<ServiceResult<PreparedMediaResult>>;
  listPrepared(): readonly PreparedMediaFixture[];
}

export interface ParentGuideService {
  refineTask(request: ParentGuideRequest): Promise<ServiceResult<ParentGuideTaskSuggestion>>;
  summarizePattern(
    request: Omit<ParentGuideRequest, 'intent'> & {
      readonly intent: 'summarize_observable_pattern';
      readonly syntheticSevenDayFacts: readonly LocalizedText[];
    },
  ): Promise<ServiceResult<ParentPatternSummary>>;
}

export interface ChildCoachService {
  respond(request: ChildCoachRequest): Promise<ServiceResult<ChildCoachResult>>;
}

export interface CoachAdaptationService {
  policyForAgeBand(ageBand: unknown): ServiceResult<ChildCoachOutputPolicy>;
  adaptPreparedResult(input: AdaptCoachResultInput): ServiceResult<AgeAdaptedCoachResult>;
}

export interface SyntheticVoiceService {
  createIdle(
    input: CreateVoiceSessionInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  start(
    session: SyntheticVoiceSession,
    access: VoiceAccessContext,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  stopWithPreparedTranscript(
    session: SyntheticVoiceSession,
    input: StopVoiceSessionInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  deleteBeforeSend(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  send(
    session: SyntheticVoiceSession,
    sentAt: string,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  setPlayback(
    session: SyntheticVoiceSession,
    input: VoicePlaybackInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  replay(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
  reset(
    session: SyntheticVoiceSession,
    authority: SessionAuthorityInput,
  ): ServiceResult<SyntheticVoiceSession>;
}

export interface SyntheticAccessService {
  signInParent(input: SyntheticParentSignIn): ServiceResult<ParentAccessSession>;
  signInChild(input: SyntheticChildSignIn): ServiceResult<ChildAccessSession>;
  projectSession(input: ProjectAccessSessionInput): ServiceResult<AccessView>;
  authorizeCapability(input: CapabilityAuthorizationInput): ServiceResult<CapabilityAuthorization>;
  requestPairing(input: PairingRequestInput): ServiceResult<PairingRequest>;
  approvePairing(input: PairingApprovalInput): ServiceResult<PairingRequest>;
  revokePairing(input: PairingRevocationInput): ServiceResult<PairingRequest>;
  consumePairing(input: PairingConsumptionInput): ServiceResult<ChildAccessSession>;
  revokeDevice(input: DeviceRevocationInput): ServiceResult<DeviceAccessState>;
  issueReauthentication(input: ReauthenticationInput): ServiceResult<ReauthenticationProof>;
  authorizeSensitiveAction(input: SensitiveActionInput): ServiceResult<ReauthenticationProof>;
  getChildPermissions(input: ChildPermissionQueryInput): ServiceResult<ChildPermissionGrant>;
  updateChildPermissions(input: PermissionUpdateInput): ServiceResult<ChildPermissionGrant>;
}

export interface FamilyRewardService {
  createPlan(
    input: FamilyRewardPlanDraft,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ServiceResult<FamilyRewardPlan>;
  revisePromisedPlan(
    planId: string,
    input: ReviseFamilyRewardPlanInput,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ServiceResult<FamilyRewardRevision>;
  evaluatePlan(
    planId: string,
    candidateEvents: readonly unknown[],
    options: FamilyRewardEvaluationOptions,
    authority: SessionAuthorityInput,
  ): ServiceResult<FamilyRewardEvaluation>;
  markGiven(
    planId: string,
    input: GiveFamilyRewardInput,
    authority: SessionAuthorityInput,
    monetaryProofId?: string,
  ): ServiceResult<FamilyRewardGivenResult>;
  projectPrivate(
    planId: string,
    authority: SessionAuthorityInput,
  ): ServiceResult<PrivateFamilyRewardView>;
  summarizeMonthlyCommitment(
    authority: SessionAuthorityInput,
  ): ServiceResult<readonly MonetaryCommitmentSummary[]>;
}

export interface FamilyLeagueService {
  evaluateEligibility(
    candidate: ChallengeLeafCandidate,
    participant: SyntheticLeagueParticipant,
  ): LeagueEligibilityDecision;
  createWeek(
    input: CreateLeagueWeekInput,
    authority: SessionAuthorityInput,
    membershipProofId: string,
  ): ServiceResult<FamilyLeagueWeek>;
  confirmLeaf(
    input: ConfirmChallengeLeafInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<FamilyLeagueWeek>;
  calculateResults(
    week: FamilyLeagueWeek,
    authority: SessionAuthorityInput,
  ): ServiceResult<readonly WeeklyGrowthResult[]>;
  projectParticipants(
    weekKey: string,
    authority: SessionAuthorityInput,
  ): ServiceResult<readonly LeagueParticipantProjection[]>;
  sendPreparedEncouragement(
    input: LeagueEncouragementRequest,
    authority: SessionAuthorityInput,
  ): ServiceResult<PreparedEncouragement>;
  rollover(
    input: LeagueRolloverInput,
    authority: SessionAuthorityInput,
  ): ServiceResult<LeagueRolloverResult>;
}

export interface PreparedParentGuideProvider extends ParentGuideService {
  readonly mode: 'deterministic_prepared';
  readonly fixtureId: 'guide_recycling_refine_v1';
  readonly disclosure: AssistantDisclosure;
}

export interface PreparedChildCoachProvider extends ChildCoachService {
  readonly mode: 'deterministic_prepared';
  readonly fixtureId: 'coach_recycling_steps_v1';
  readonly disclosure: AssistantDisclosure;
}

export interface ParentSummaryPolicy {
  validate(summary: ParentPatternSummary): ServiceResult<ParentPatternSummary>;
  applyLocalCorrection(
    summary: ParentPatternSummary,
    correction: ParentSummaryCorrection,
  ): ServiceResult<ParentSummaryCorrectionAttempt>;
}

export interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  resetPrototype(): ResetResult;
  validateSession(session: PrototypeSession): ServiceResult<PrototypeSession>;
}

export interface Feature003ServiceRegistry {
  readonly task: TaskService;
  readonly recognition: RecognitionService;
  readonly garden: GardenService;
  readonly familyProjection: FamilyProjectionService;
  readonly media: MediaService;
  readonly parentGuide: PreparedParentGuideProvider;
  readonly childCoach: PreparedChildCoachProvider;
  readonly coachAdaptation: CoachAdaptationService;
  readonly syntheticVoice: SyntheticVoiceService;
  readonly access: SyntheticAccessService;
  readonly familyReward: FamilyRewardService;
  readonly familyLeague: FamilyLeagueService;
  readonly parentSummary: ParentSummaryPolicy;
  readonly prototypeSession: PrototypeSessionService;
}
