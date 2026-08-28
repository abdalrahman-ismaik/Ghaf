export const SUPPORTED_LOCALES = ['ar', 'en'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];
export type TextDirection = 'rtl' | 'ltr';
export type DemoRole = 'parent' | 'child';
export type CapabilityOrigin = 'synthetic' | 'prepared' | 'simulated' | 'live';

export type AuthoredRoute =
  | '/'
  | '/role'
  | '/parent'
  | '/parent/task/new'
  | '/parent/task/review'
  | '/child'
  | '/child/task'
  | '/parent/check-in'
  | '/garden'
  | '/circle';

export interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}

export type AgeBand = '6_8' | '9_11' | '12_14';
export type FixedSeedAward = 4 | 6 | 8 | 12 | 15;
export type RecognitionMode = 'standard' | 'fade_first' | 'recognition_only';
export type RoutinePhase = 'acquisition' | 'maintenance' | 'not_applicable';
export type Recurrence = 'once' | 'recurrent';
export type VisibilityScope = 'child_guardian' | 'household';
export type LandscapeId = 'ghaf' | 'samar' | 'sidr' | 'date_palm' | 'mangrove';
export type GardenStage = 'seed' | 'shoot' | 'sapling' | 'shade' | 'flourishing';

export type TaskCategoryId =
  | 'faith_gratitude'
  | 'roots_kinship'
  | 'home_responsibility'
  | 'green_impact'
  | 'food_hospitality'
  | 'heritage_etiquette'
  | 'kindness_community'
  | 'learning_wellbeing';

export interface HouseholdCanopy {
  readonly contributionLeaves: number;
  readonly goalLeaves: 25;
}

export interface SyntheticHousehold {
  readonly id: 'household_al_noor';
  readonly displayName: LocalizedText;
  readonly origin: 'synthetic';
  readonly childIds: readonly ['child_salem', 'child_alya'];
  readonly combinedCanopy: HouseholdCanopy;
}

export type SyntheticChildId = 'child_salem' | 'child_alya';

export interface SyntheticChildProfile {
  readonly id: SyntheticChildId;
  readonly displayName: LocalizedText;
  readonly age: 9 | 11;
  readonly ageBand: '9_11';
  readonly origin: 'synthetic';
  readonly earnedSeeds: number;
}

export interface TaskCategory {
  readonly id: TaskCategoryId;
  readonly label: LocalizedText;
  readonly landscapeId: LandscapeId;
  readonly defaultVisibilityScope: VisibilityScope;
  readonly circleMayBeEligible: boolean;
  readonly contentReviewStatus: 'reviewed_p0' | 'named_human_review_required';
}

export interface TaskSafetyBoundary {
  readonly adultPreCheck: LocalizedText;
  readonly adultSecondCheck: LocalizedText;
  readonly adultOwnedActions: readonly LocalizedText[];
  readonly childAllowedActions: readonly LocalizedText[];
  readonly excludedHazards: readonly LocalizedText[];
  readonly stopAndAskAdult: LocalizedText;
  readonly routeConstraint: LocalizedText | null;
  readonly indoorAlternative: LocalizedText | null;
  readonly aftercare: LocalizedText | null;
}

export interface TaskTemplate {
  readonly id: string;
  readonly categoryId: TaskCategoryId;
  readonly landscapeId: LandscapeId;
  readonly title: LocalizedText;
  readonly positiveAction: LocalizedText;
  readonly whyItMatters: LocalizedText;
  readonly definitionOfDone: LocalizedText;
  readonly childAgeBands: readonly AgeBand[];
  readonly estimatedEffort: LocalizedText;
  readonly permittedHelp: LocalizedText;
  readonly supervision: LocalizedText;
  readonly safety: TaskSafetyBoundary;
  readonly evidencePolicy: 'optional_prepared_only' | 'none';
  readonly reflectionPolicy: 'optional_task_focused' | 'none';
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly recurrence: Recurrence;
  readonly displayedSeedAward: FixedSeedAward | null;
  readonly visibilityScope: VisibilityScope;
  readonly circleEligible: boolean;
  readonly privacyNotice: LocalizedText;
  readonly origin: 'prepared';
}

export interface Task {
  readonly id: string;
  readonly version: number;
  readonly templateId: string;
  readonly targetChildId: SyntheticChildId;
  readonly parentOriginalText: LocalizedText;
  readonly acceptedGuideFixtureId: string | null;
  readonly content: TaskTemplate;
  readonly origin: 'prepared' | 'synthetic';
}

export interface ApprovedChoiceFixture {
  readonly id: 'choice_preview_hr02_v1' | 'choice_preview_lw01_v1' | 'choice_recycling_p0_v1';
  readonly childId: SyntheticChildId;
  readonly taskTemplateId: string;
  readonly approvalState: 'parent_approved_fixture';
  readonly demoAvailability: 'display_only' | 'p0_executable';
  readonly origin: 'prepared';
}

export interface ChildChoicePool {
  readonly seededPreviewChoices: readonly [ApprovedChoiceFixture, ApprovedChoiceFixture];
  readonly p0AssignmentChoice: ApprovedChoiceFixture | null;
}

export type TaskLifecycleStatus =
  | 'draft'
  | 'reviewed'
  | 'assigned'
  | 'chosen'
  | 'in_progress'
  | 'submitted'
  | 'retry'
  | 'confirmed'
  | 'recognized';

export interface Assignment {
  readonly id: string;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly childId: SyntheticChildId;
  readonly approvedByParent: true;
  readonly approvalSequence: number;
  readonly createdAt: string;
}

export type CompletionMode = 'independent' | 'permitted_help';

export interface Submission {
  readonly id: string;
  readonly assignmentId: string;
  readonly taskVersion: number;
  readonly attempt: number;
  readonly definitionAcknowledged: true;
  readonly completionMode: CompletionMode;
  readonly helpUsed: LocalizedText | null;
  readonly preparedMediaFixtureId: string | null;
  readonly reflection: LocalizedText | null;
  readonly observableFacts: readonly LocalizedText[];
  readonly submittedAt: string;
}

export type ParentCheckInDecision =
  'kind_retry' | 'confirm' | 'propose_smaller_future_task' | 'propose_safe_equivalent';

export interface ParentCheckIn {
  readonly id: string;
  readonly submissionId: string;
  readonly decision: ParentCheckInDecision;
  readonly praise: LocalizedText | null;
  readonly neutralObservation: LocalizedText | null;
  readonly uncertainty: LocalizedText | null;
  readonly replacementTaskId: string | null;
  readonly recognitionKey: string | null;
  readonly confirmationPresentation:
    'editing_praise' | 'praise_presented' | 'recognition_applied' | null;
  readonly praisePresentedAt: string | null;
  readonly createdAt: string;
}

export interface TaskJourney {
  readonly lifecycle: TaskLifecycleStatus;
  readonly task: Task;
  readonly assignment: Assignment | null;
  readonly submission: Submission | null;
  readonly checkIn: ParentCheckIn | null;
}

export type ProspectiveTaskAdjustmentKind = 'smaller' | 'safe_equivalent';

export type PreAcceptanceAdjustmentStatus =
  'parent_review_required' | 'child_decision_required' | 'accepted' | 'kept_current';

export interface PreAcceptanceTaskProposal {
  readonly proposedTaskVersion: number;
  readonly content: TaskTemplate;
  readonly origin: 'prepared';
}

/**
 * A bounded negotiation attached to the still-unaccepted assignment. No task or counter changes
 * until the Parent resolves it and the assigned Child explicitly accepts the reviewed proposal.
 */
export interface PreAcceptanceTaskAdjustment {
  readonly requestId: string;
  readonly sourceAssignmentId: string;
  readonly sourceTaskId: string;
  readonly sourceTaskVersion: number;
  readonly childId: SyntheticChildId;
  readonly requestedKind: 'smaller';
  readonly resolvedKind: ProspectiveTaskAdjustmentKind | null;
  readonly status: PreAcceptanceAdjustmentStatus;
  readonly proposal: PreAcceptanceTaskProposal | null;
  readonly childDecision: 'accept' | 'keep_current' | null;
  readonly origin: 'synthetic_local';
}

/**
 * A local, future-only request. It never replaces the accepted TaskJourney or carries a reward.
 */
export interface ProspectiveTaskAdjustment {
  readonly kind: ProspectiveTaskAdjustmentKind;
  readonly requestedBy: 'child' | 'parent';
  readonly sourceTaskId: string;
  readonly sourceTaskVersion: number;
  readonly childId: SyntheticChildId;
  readonly sourceSubmissionId: string | null;
  readonly status: 'parent_review_required' | 'future_plan_recorded';
  readonly appliesTo: 'future_task_only';
  readonly origin: 'synthetic_local';
}

export interface SeedTransaction {
  readonly id: string;
  readonly recognitionKey: string;
  readonly childId: SyntheticChildId;
  readonly amount: FixedSeedAward;
  readonly balanceBefore: number;
  readonly balanceAfter: number;
  readonly meaning: 'symbolic_nonfinancial';
}

export interface PhaseReviewPrompt {
  readonly taskId: string;
  readonly confirmedAcquisitionCount: 3;
  readonly options: readonly ['keep_acquisition', 'move_future_to_maintenance'];
  readonly selected: null;
  readonly appliesTo: 'future_completions_only';
  readonly reversibleByParent: true;
}

export type RoutinePhaseReviewOption = PhaseReviewPrompt['options'][number];

export interface RoutinePhaseDecision {
  readonly selected: RoutinePhaseReviewOption;
  readonly futurePhase: 'acquisition' | 'maintenance';
  readonly appliesTo: 'future_completions_only';
  readonly reversibleByParent: true;
  readonly decidedAt: string;
}

export interface RoutineProgressState {
  readonly taskId: string;
  readonly confirmedAcquisitionCount: number;
  readonly futurePhase: 'acquisition' | 'maintenance';
  readonly phaseReview: PhaseReviewPrompt | null;
  readonly decision: RoutinePhaseDecision | null;
}

export interface LandscapeProgress {
  readonly landscapeId: LandscapeId;
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
  readonly nextThreshold: 20 | 60 | 120 | 200 | null;
}

export interface LandscapeGrowth {
  readonly landscapeId: LandscapeId;
  readonly seedsBefore: number;
  readonly seedsAfter: number;
  readonly stageBefore: GardenStage;
  readonly stageAfter: GardenStage;
  readonly crossedThreshold: 20 | 60 | 120 | 200 | null;
  readonly symbolicOnly: true;
}

export interface CanopyContributionDTO {
  readonly actionKind: 'eligible_household_acquisition';
  readonly leafDelta: 1;
  readonly origin: 'synthetic';
}

export interface GreenCircleEventDTO {
  readonly actionKind: 'eligible_green_action';
  readonly actionDelta: 1;
  readonly sourceScope: 'household';
  readonly origin: 'synthetic_local';
}

export interface CircleGoal {
  readonly eligibleGreenActions: number;
  readonly goal: 12;
  readonly origin: 'synthetic_local';
}

export type RecognitionConsequenceKind =
  'rewarded_acquisition' | 'maintenance_activity' | 'recognition_only';

export interface ProjectionEligibilityContext {
  readonly schemaVersion: '1.0';
  readonly categoryId: TaskCategoryId;
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly visibilityScope: VisibilityScope;
  readonly circleEligible: boolean;
  readonly consequenceKind: RecognitionConsequenceKind;
  readonly confirmed: true;
  readonly prohibitedSharedFieldsPresent: false;
}

export type ProjectionRejectionReason =
  | 'private_scope'
  | 'non_green_category'
  | 'circle_not_eligible'
  | 'recognition_only'
  | 'sensitive_content'
  | 'invalid_pairing';

export interface ProjectionPlan {
  readonly canopyContribution: CanopyContributionDTO | null;
  readonly circleEvent: GreenCircleEventDTO | null;
  readonly canopyRejection: ProjectionRejectionReason | null;
  readonly circleRejection: ProjectionRejectionReason | null;
}

export interface RecognitionReceipt {
  readonly recognitionKey: string;
  readonly checkInId: string;
  readonly seedTransaction: SeedTransaction | null;
  readonly landscapeGrowth: LandscapeGrowth | null;
  readonly canopyContribution: CanopyContributionDTO | null;
  readonly circleEvent: GreenCircleEventDTO | null;
  readonly phaseReview: PhaseReviewPrompt | null;
}

export type RecognitionApplication =
  | { readonly status: 'applied'; readonly receipt: RecognitionReceipt }
  | {
      readonly status: 'already_confirmed';
      readonly receipt: RecognitionReceipt;
      readonly message: LocalizedText;
    };

export type PreparedMediaKind = 'image' | 'audio';

export interface PreparedMediaFixture {
  readonly id: 'fixture_recycling_clean_v1' | 'fixture_salem_plan_ar_v1';
  readonly kind: PreparedMediaKind;
  readonly origin: 'prepared';
  readonly synthetic: true;
  readonly optional: true;
  readonly uri: string | null;
  readonly accessibleDescription: LocalizedText;
  readonly transcript: LocalizedText | null;
  readonly parentVisibilityNotice: LocalizedText;
  readonly crossHouseholdSharing: false;
  readonly removeAllowed: true;
  readonly fallbackText: LocalizedText;
}

export interface ChildTaskDraftState {
  readonly selectedMediaFixtureId: PreparedMediaFixture['id'] | null;
  readonly removedMediaFixtureIds: readonly PreparedMediaFixture['id'][];
  readonly unavailableMediaFixtureIds: readonly PreparedMediaFixture['id'][];
  readonly reflection: LocalizedText | null;
}

export interface PrototypeSession {
  readonly schemaVersion: 3;
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly role: DemoRole;
  readonly household: SyntheticHousehold;
  readonly children: Readonly<Record<SyntheticChildId, SyntheticChildProfile>>;
  readonly activeChildId: SyntheticChildId;
  readonly choicePool: ChildChoicePool;
  readonly activeAssignmentId: string | null;
  readonly journey: TaskJourney | null;
  readonly landscapeProgress: Readonly<Record<LandscapeId, LandscapeProgress>>;
  readonly circleGoal: CircleGoal;
  readonly recognitionLedger: Readonly<Record<string, RecognitionReceipt>>;
  /** Added by the application store as recurrent tasks are confirmed; reset sessions may omit it. */
  readonly routineProgressByTask?: Readonly<Record<string, RoutineProgressState>>;
  readonly preparedParentGuideFixtureId: 'guide_recycling_refine_v1';
  readonly preparedChildCoachFixtureId: 'coach_recycling_steps_v1';
  readonly preparedImageFixtureId: 'fixture_recycling_clean_v1';
  readonly preparedAudioFixtureId: 'fixture_salem_plan_ar_v1';
  readonly assistantMode: 'deterministic_prepared';
  readonly celebration: {
    readonly available: boolean;
    readonly consumed: boolean;
  };
}

export type AssistantLocale = LocaleCode;
export type AssistantAudience = 'parent' | 'child';
export type AssistantOrigin = 'prepared' | 'live';
export type AssistantMode = 'deterministic_prepared' | 'live_optional';
export type AssistantState = 'idle' | 'prepared_loading' | 'result' | 'fallback' | 'dismissed';
export type ParentLiveOnlyState = 'live_loading' | 'live_result' | 'live_error';

export type FallbackReason =
  'remote_not_configured' | 'timeout' | 'remote_failure' | 'malformed_response' | 'safety_rejected';

export interface AssistantDisclosure {
  readonly text: LocalizedText;
  readonly saysAiMayBeWrong: true;
  readonly saysHumanDecides: boolean;
  readonly preparedIsExplicit: boolean;
}

export interface AssistantResultMeta {
  readonly requestId: string;
  readonly audience: AssistantAudience;
  readonly origin: AssistantOrigin;
  readonly fixtureId: string | null;
  readonly fallbackUsed: boolean;
  readonly fallbackReason: FallbackReason | null;
  readonly disclosure: AssistantDisclosure;
}

export type ParentGuideIntent =
  | 'make_clearer'
  | 'make_smaller'
  | 'check_safety'
  | 'adapt_age'
  | 'draft_descriptive_praise'
  | 'summarize_observable_pattern'
  | 'suggest_parent_question';

export interface ParentGuideRequest {
  readonly requestId: string;
  readonly intent: ParentGuideIntent;
  readonly locale: AssistantLocale;
  readonly child: {
    readonly id: SyntheticChildId;
    readonly age: 9 | 11;
    readonly ageBand: '9_11';
    readonly synthetic: true;
  };
  readonly parentText: LocalizedText;
  readonly taskTemplateId: string;
  readonly taskVersion: number;
  readonly allowedCategoryId: TaskCategoryId;
  readonly allowedSafety: TaskSafetyBoundary;
  readonly inputOrigin: 'synthetic';
}

export interface ParentGuideTaskSuggestion {
  readonly meta: AssistantResultMeta;
  readonly originalParentText: LocalizedText;
  readonly suggestedContent: TaskTemplate;
  readonly changedFields: readonly (
    | 'positiveAction'
    | 'whyItMatters'
    | 'definitionOfDone'
    | 'estimatedEffort'
    | 'permittedHelp'
    | 'supervision'
    | 'safety'
  )[];
  readonly availableActions: readonly ['accept_suggestion', 'keep_mine', 'make_smaller'];
  readonly accepted: false;
}

export interface ParentPatternSummary {
  readonly meta: AssistantResultMeta;
  readonly timeWindow: LocalizedText;
  readonly strengthsFirst: LocalizedText;
  readonly observableFacts: readonly [LocalizedText, ...LocalizedText[]];
  readonly uncertainty: LocalizedText;
  readonly questionForChild: LocalizedText;
  readonly possibleAdjustment: LocalizedText;
  readonly parentCorrectable: true;
  readonly dataOrigin: 'synthetic';
  readonly localCorrection: {
    readonly applied: boolean;
    readonly operation: ParentSummaryCorrection['operation'] | null;
    readonly factIndex: 0 | 1 | 2 | null;
  };
}

export type ParentSummaryCorrection =
  | {
      readonly operation: 'replace_fact';
      readonly factIndex: 0 | 1 | 2;
      readonly correctedFact: LocalizedText;
    }
  | { readonly operation: 'remove_fact'; readonly factIndex: 0 | 1 | 2 }
  | { readonly operation: 'mark_fact_uncertain'; readonly factIndex: 0 | 1 | 2 };

export type ParentSummaryCorrectionRejection =
  | 'invalid_shape'
  | 'fact_out_of_range'
  | 'would_remove_all_facts'
  | 'prohibited_language'
  | 'not_observable_fact';

export interface ParentSummaryCorrectionAttempt {
  readonly disposition: 'applied' | 'rejected';
  readonly summary: ParentPatternSummary;
  readonly rejectedFor: readonly ParentSummaryCorrectionRejection[];
}

export type ChildCoachIntent =
  | 'simplify_task'
  | 'show_steps'
  | 'create_if_then_cue'
  | 'rehearse_reviewed_phrase'
  | 'respond_to_prepared_fixture'
  | 'offer_optional_reflection'
  | 'need_adult';

export interface ChildInteractionPolicy {
  readonly ageBand: AgeBand;
  readonly inputMode: 'curated_intents_only' | 'structured_template' | 'guardian_enabled_bounded';
  readonly freeTextAllowed: boolean;
  readonly pushToTalkAllowed: boolean;
  readonly unrestrictedChatAllowed: false;
}

export type ChildInputAttempt =
  'curated_intent' | 'structured_template' | 'bounded_text' | 'push_to_talk' | 'unrestricted_chat';

export interface ChildInteractionDecision {
  readonly allowed: boolean;
  readonly policy: ChildInteractionPolicy;
  readonly rejectedFor:
    'none' | 'wrong_input_mode' | 'guardian_enablement_required' | 'unrestricted_chat_prohibited';
}

export interface ChildCoachRequest {
  readonly requestId: string;
  readonly intent: ChildCoachIntent;
  readonly locale: AssistantLocale;
  readonly child: {
    readonly id: SyntheticChildId;
    readonly ageBand: '9_11';
    readonly synthetic: true;
  };
  readonly assignmentId: string;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly lifecycle: 'chosen' | 'in_progress';
  readonly fixtureId: PreparedMediaFixture['id'] | null;
  readonly templateSelection: string | null;
}

export interface ChildCoachResult {
  readonly meta: AssistantResultMeta;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly steps: readonly [LocalizedText, LocalizedText, LocalizedText, LocalizedText];
  readonly ifThenCue: LocalizedText;
  readonly optionalReflection: LocalizedText | null;
  readonly adultExit: {
    readonly label: LocalizedText;
    readonly alwaysVisible: true;
  };
  readonly changesDefinitionOfDone: false;
}

export interface ActiveCoachContext {
  readonly activeChildId: SyntheticChildId;
  readonly assignmentId: string;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly lifecycle: TaskLifecycleStatus;
  readonly approvedByParent: boolean;
}

export type ProhibitedAssistantOutput =
  | 'normality_or_character_judgment'
  | 'diagnosis_or_condition_inference'
  | 'emotion_personality_or_risk_score'
  | 'truthfulness_or_deception_judgment'
  | 'religious_judgment'
  | 'parenting_or_family_quality_judgment'
  | 'food_safety_or_medical_decision'
  | 'hazardous_child_instruction'
  | 'secret_or_exclusivity_request'
  | 'attachment_or_dependency_language'
  | 'continued_conversation_lure'
  | 'face_voice_or_biometric_inference'
  | 'cross_household_private_content';

export interface AssistantSafetyDecision<T> {
  readonly accepted: boolean;
  readonly value: T | null;
  readonly rejectedFor: readonly ProhibitedAssistantOutput[];
}

export interface PendingConfirmationPlan {
  readonly journey: TaskJourney;
  readonly checkIn: ParentCheckIn;
  readonly recognitionKey: string;
  readonly praise: LocalizedText;
  readonly renderState: 'confirmation_pending';
}

export interface PraisePresentedPlan {
  readonly journey: TaskJourney;
  readonly checkIn: ParentCheckIn & { readonly praisePresentedAt: string };
  readonly recognitionKey: string;
  readonly praise: LocalizedText;
  readonly renderState: 'praise_presented';
  readonly presentationActionId: string;
  readonly continuation: {
    readonly action: 'apply_recognition';
    readonly source: 'visible_parent_control';
  };
}

export type ConfirmationAttempt =
  | { readonly disposition: 'pending_praise'; readonly plan: PendingConfirmationPlan }
  | { readonly disposition: 'praise_presented'; readonly plan: PraisePresentedPlan }
  | {
      readonly disposition: 'already_confirmed';
      readonly journey: TaskJourney;
      readonly receipt: RecognitionReceipt;
      readonly message: LocalizedText;
    };

export type CheckInRouteState =
  | { readonly state: 'submitted'; readonly journey: TaskJourney; readonly submission: Submission }
  | { readonly state: 'retry'; readonly journey: TaskJourney; readonly submission: Submission }
  | {
      readonly state: 'confirmation_pending';
      readonly journey: TaskJourney;
      readonly attempt: Extract<
        ConfirmationAttempt,
        { readonly disposition: 'pending_praise' | 'praise_presented' }
      >;
    }
  | {
      readonly state: 'already_confirmed';
      readonly journey: TaskJourney;
      readonly attempt: Extract<ConfirmationAttempt, { readonly disposition: 'already_confirmed' }>;
    };

export type RecognitionAttemptDisposition = 'applied' | 'already_confirmed';

export interface RecognitionAttemptResult {
  readonly disposition: RecognitionAttemptDisposition;
  readonly session: PrototypeSession;
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
  readonly message: LocalizedText | null;
}

export interface PraisePresentationAction {
  readonly actionId: string;
  readonly source: 'parent_press';
  readonly presentedAt: string;
}

export interface RecognitionContinuationAction {
  readonly actionId: string;
  readonly source: 'parent_press';
  readonly observedRenderState: 'praise_presented';
  readonly presentationActionId: string;
}

export interface TaskReviewResult {
  readonly task: Task;
  readonly warnings: readonly LocalizedText[];
}

export interface AssignmentApprovalResult {
  readonly journey: TaskJourney;
  readonly executableChoice: ApprovedChoiceFixture;
}

export interface PreparedMediaResult {
  readonly fixture: PreparedMediaFixture | null;
  readonly fallbackText: LocalizedText;
  readonly available: boolean;
}

export interface ResetResult {
  readonly session: PrototypeSession;
  readonly navigateTo: '/';
  readonly replaceHistory: true;
}

export type DomainErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'INVALID_TRANSITION'
  | 'NOT_ASSIGNED_CHILD'
  | 'SAFETY_REJECTED'
  | 'PRIVACY_REJECTED'
  | 'INVALID_REWARD_PAIRING'
  | 'PREPARED_FIXTURE_UNAVAILABLE'
  | 'REMOTE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE';

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly fallbackAvailable: boolean;
}

/** Pure policy functions use this envelope; service providers add provenance metadata. */
export type DomainResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: DomainError };
