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
  ParentAccessSession,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
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

export interface ParentAccessService {
  getInitialAccess(): ParentAccessSession;
  getInitialOnboardingDraft(): ParentOnboardingDraft;
  requestVerification(input: {
    readonly current: ParentAccessSession;
    readonly identifier: unknown;
    readonly networkAvailable?: boolean;
  }): ServiceResult<ParentAccessSession>;
  verifyCode(current: ParentAccessSession, code: unknown): ServiceResult<ParentAccessSession>;
  updateOnboardingDraft(
    current: ParentOnboardingDraft,
    patch: ParentOnboardingDraftPatch,
  ): ServiceResult<ParentOnboardingDraft>;
  completeOnboarding(
    current: ParentAccessSession,
    draft: ParentOnboardingDraft,
  ): ServiceResult<ParentAccessSession>;
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
  readonly parentSummary: ParentSummaryPolicy;
  readonly parentAccess: ParentAccessService;
  readonly prototypeSession: PrototypeSessionService;
}
