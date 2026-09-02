# Deterministic Domain Service Contract

## Contract Goal

The Expo routes depend on one local service registry and one resettable store. Services validate and
return values; the store is the only owner that commits the aggregate. This keeps the core journey
deterministic, makes duplicate confirmation testable, and prevents screens from creating Seeds or
shared progress directly.

Feature 003 adapts the existing Mission, Media, Impact, and Prototype Session boundaries rather than
adding a backend. The implementation may rename Mission to Task and Impact to Recognition where it
improves clarity, but it must not keep parallel Feature 002 and Feature 003 domain sources.

## Shared Result Envelope

```ts
type DomainErrorCode =
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

interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly fallbackAvailable: boolean;
}

interface ServiceMeta {
  readonly origin: 'synthetic' | 'prepared' | 'simulated' | 'live';
  readonly fallbackUsed: boolean;
  readonly fixtureId?: string;
}

type ServiceResult<T> =
  | { readonly ok: true; readonly data: T; readonly meta: ServiceMeta }
  | { readonly ok: false; readonly error: DomainError };
```

Expected guards return a `ServiceResult`; they do not throw. Fixture construction may fail fast in
development when repository-owned constants are malformed.

## Task Service

```ts
interface TaskReviewResult {
  readonly task: Task;
  readonly warnings: readonly LocalizedText[];
}

interface AssignmentApprovalResult {
  readonly journey: TaskJourney;
  readonly executableChoice: ApprovedChoiceFixture;
}

interface TaskService {
  listCategories(): readonly TaskCategory[];
  listTemplates(categoryId?: TaskCategoryId): readonly TaskTemplate[];
  getChildChoicePool(session: PrototypeSession): ChildChoicePool;

  createDraft(input: {
    readonly childId: SyntheticChildProfile['id'];
    readonly templateId: string;
    readonly parentText: LocalizedText;
  }): ServiceResult<TaskJourney>;

  applyAcceptedGuideSuggestion(
    journey: TaskJourney,
    suggestion: ParentGuideTaskSuggestion,
  ): ServiceResult<TaskJourney>;

  keepParentText(journey: TaskJourney): ServiceResult<TaskJourney>;
  review(journey: TaskJourney): ServiceResult<TaskReviewResult>;
  approveAssignment(journey: TaskJourney): ServiceResult<AssignmentApprovalResult>;

  chooseAssignment(
    journey: TaskJourney,
    activeChildId: SyntheticChildProfile['id'],
  ): ServiceResult<TaskJourney>;

  startAssignment(journey: TaskJourney): ServiceResult<TaskJourney>;

  submit(
    journey: TaskJourney,
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
```

### Task-Service Invariants

- `createDraft` requires a synthetic Child, one curated category/template, and Parent text. Custom
  wording cannot bypass template safety, privacy, reward, or category validation.
- `review` validates bilingual equivalence structurally, all safety fields, the exact reward matrix,
  recurrence, landscape/category mapping, and circle eligibility. It never creates an assignment.
- `applyAcceptedGuideSuggestion` is the only operation that may copy a Guide suggestion into the
  task. Merely requesting or displaying a suggestion changes nothing.
- The task-service `approveAssignment` operation requires lifecycle `reviewed` and explicit Parent
  invocation. The application command is idempotent: an exact repeat for the same already-assigned
  task/version, Child, assignment, and executable choice returns that existing journey without
  calling the task service or changing any state. Every nonmatching repeat remains invalid. Neither
  path creates reward, growth, activity, canopy, circle, submission, or confirmation records.
- A reset display-only choice returns `INVALID_TRANSITION` when selected; it never creates a hidden
  assignment. The sole P0-executable assignment is the approved recycling task.
- `chooseAssignment` and `startAssignment` are separate operations. The former yields `chosen`; the
  latter yields `in_progress`.
- `submit` permits null media and null reflection. It yields `submitted` and changes no counters.
- `requestKindRetry` yields `retry`; `resumeRetry` yields `in_progress`. Neither removes or creates
  progress.
- Every operation verifies task version and assigned Child identity before reading private fields.

## Recognition Service

Praise presentation and recognition application are deliberately separate. This guarantees the
specified sequence without trusting an animation delay.

```ts
interface PendingConfirmationPlan {
  readonly journey: TaskJourney; // lifecycle = 'confirmed'
  readonly checkIn: ParentCheckIn;
  readonly recognitionKey: string;
  readonly praise: LocalizedText;
  readonly renderState: 'confirmation_pending';
}

interface PraisePresentedPlan {
  readonly journey: TaskJourney; // lifecycle = 'confirmed'
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

interface RecognitionReceipt {
  readonly recognitionKey: string;
  readonly checkInId: string;
  readonly seedTransaction: SeedTransaction | null;
  readonly landscapeGrowth: LandscapeGrowth | null;
  readonly canopyContribution: CanopyContributionDTO | null;
  readonly circleEvent: GreenCircleEventDTO | null;
  readonly phaseReview: PhaseReviewPrompt | null;
}

type RecognitionAttemptDisposition = 'applied' | 'already_confirmed';

type ConfirmationAttempt =
  | {
      readonly disposition: 'pending_praise';
      readonly plan: PendingConfirmationPlan;
    }
  | {
      readonly disposition: 'praise_presented';
      readonly plan: PraisePresentedPlan;
    }
  | {
      readonly disposition: 'already_confirmed';
      readonly journey: TaskJourney; // lifecycle = 'recognized'
      readonly receipt: RecognitionReceipt;
      readonly message: LocalizedText;
    };

type CheckInRouteState =
  | {
      readonly state: 'submitted';
      readonly journey: TaskJourney;
      readonly submission: Submission;
    }
  | {
      readonly state: 'retry';
      readonly journey: TaskJourney; // lifecycle = 'retry'
      readonly submission: Submission;
    }
  | {
      readonly state: 'confirmation_pending';
      readonly journey: TaskJourney; // lifecycle = 'confirmed'
      readonly attempt:
        | Extract<ConfirmationAttempt, { readonly disposition: 'pending_praise' }>
        | Extract<ConfirmationAttempt, { readonly disposition: 'praise_presented' }>;
    }
  | {
      readonly state: 'already_confirmed';
      readonly journey: TaskJourney; // lifecycle = 'recognized'
      readonly attempt: Extract<ConfirmationAttempt, { readonly disposition: 'already_confirmed' }>;
    };

interface RecognitionAttemptResult {
  readonly disposition: RecognitionAttemptDisposition;
  readonly session: PrototypeSession;
  readonly journey: TaskJourney; // lifecycle = 'recognized'
  readonly receipt: RecognitionReceipt;
  readonly message: LocalizedText | null;
}

interface PraisePresentationAction {
  readonly actionId: string;
  readonly source: 'parent_press';
  readonly presentedAt: string;
}

interface RecognitionContinuationAction {
  readonly actionId: string;
  readonly source: 'parent_press';
  readonly observedRenderState: 'praise_presented';
  readonly presentationActionId: string;
}

interface RecognitionService {
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
```

### Recognition-Service Invariants

- `resolveCheckInState` lets `/parent/check-in` accept exactly three safe domain states for the
  matching submission:
  `submitted` without a plan, `confirmed` with a pending plan and no ledger receipt, or `recognized`
  with a receipt whose key and check-in match the current journey. Every mismatched, missing-ledger,
  wrong-submission, or impossible combination returns `INVALID_TRANSITION` or `INVALID_RESPONSE`
  without exposing private data.
- `planConfirmation` derives the recognition key and checks the ledger before its lifecycle guard.
  A matching known key returns `already_confirmed` with the immutable receipt and a neutral message,
  even when the journey is already `recognized`. It performs no write, presentation trigger, or
  animation. A nonmatching receipt is an invalid session, not a duplicate success.
- For a new key in `submitted`, `planConfirmation` requires the matching submission and task
  version, explicit Parent action, and descriptive action/strategy/help-seeking praise. It returns
  `pending_praise` and creates no counter change. Re-entering a matching `confirmed` journey returns
  its existing `pending_praise` or `praise_presented` plan without creating another check-in.
- The recognition key is exactly `recognition:<submission.id>`.
- `markPraisePresented` requires a Parent press, rejects empty or character-labeling praise, and
  yields the observable route state `praise_presented`. The store commits that state and the route
  renders the final praise plus a visible continuation control before recognition is callable.
- `applyRecognition` accepts only `PraisePresentedPlan` plus a later visible Parent continuation.
  `continuation.actionId` MUST differ from `presentationActionId`, MUST refer to the rendered
  `praise_presented` state, and MUST originate from a separate Parent event. A route or store MUST
  NOT call `markPraisePresented` and `applyRecognition` from one handler, promise chain, effect, or
  automatic timer.
- `applyRecognition` checks the ledger before reward calculation or projection. A new key validates
  reward and privacy, applies all allowed consequences atomically, stores one immutable receipt,
  and returns `disposition = 'applied'`. A known matching key returns the unchanged receipt inside
  an attempt wrapper with `disposition = 'already_confirmed'`; it changes no value and creates no new
  celebration or announcement trigger.
- `RecognitionReceipt` contains only consequence facts. It never contains `alreadyApplied`, retry
  status, UI state, or any other attempt-specific field; those belong to
  `RecognitionAttemptResult.disposition`.
- Seeds are always positive fixed values from `4 | 6 | 8 | 12 | 15`; there is no subtraction,
  transfer, randomness, multiplier, or money field.
- `permitted_help` never lowers an accepted task's award.
- `recognition_only + not_applicable` produces descriptive recognition but null reward/projection
  fields. Maintenance produces no Seed, landscape, or canopy effect; one valid coarse Green circle
  action may remain.
- The third confirmed recurrent `fade_first + acquisition` result adds an unselected prospective
  `PhaseReviewPrompt`. It never changes the current task phase.

## Garden and Privacy Projection Services

```ts
interface GardenService {
  stageForSeeds(cumulativeSeeds: number): GardenStage;
  nextThresholdForSeeds(cumulativeSeeds: number): 20 | 60 | 120 | 200 | null;
  planGrowth(input: {
    readonly landscape: LandscapeProgress;
    readonly seedAmount: FixedSeedAward;
  }): ServiceResult<LandscapeGrowth>;
}

interface ProjectionPlan {
  readonly canopyContribution: CanopyContributionDTO | null;
  readonly circleEvent: GreenCircleEventDTO | null;
  readonly canopyRejection: ProjectionRejectionReason | null;
  readonly circleRejection: ProjectionRejectionReason | null;
}

interface ProjectionEligibilityContext {
  readonly schemaVersion: '1.0';
  readonly categoryId: TaskCategoryId;
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly visibilityScope: VisibilityScope;
  readonly circleEligible: boolean;
  readonly consequenceKind: 'rewarded_acquisition' | 'maintenance_activity' | 'recognition_only';
  readonly confirmed: true;
  readonly prohibitedSharedFieldsPresent: false;
}

interface FamilyProjectionService {
  validateTaskSharing(task: Task): ServiceResult<Task>;
  validateEligibilityContext(input: unknown): ServiceResult<ProjectionEligibilityContext>;
  planAfterConfirmation(input: ProjectionEligibilityContext): ServiceResult<ProjectionPlan>;
  applyCanopy(current: HouseholdCanopy, dto: CanopyContributionDTO): HouseholdCanopy;
  applyCircle(current: CircleGoal, dto: GreenCircleEventDTO): CircleGoal;
}
```

### Garden and Projection Invariants

- `stageForSeeds` uses cumulative boundaries 0, 20, 60, 120, and 200 exactly. Negative or
  non-integer input is invalid.
- `planGrowth` is monotonic and labels every result symbolic. It does not contain impact units or a
  real-tree flag.
- `validateTaskSharing` rejects `circleEligible = true` unless category is `green_impact` and scope
  is `household`.
- The private recognition boundary derives `ProjectionEligibilityContext` by explicitly picking
  only the listed policy scalars. It does not spread, serialize, or forward a rich domain object.
- The context schema is strict at runtime. `validateEligibilityContext` and
  `planAfterConfirmation` reject every unknown key, including Child/household identity, task or
  submission fields, recognition keys, Seed presence/amount/balance, timestamp, media, reflection,
  assistant content, Parent note, and free text. They never silently strip an unknown field.
- `planAfterConfirmation` receives only a successfully parsed `ProjectionEligibilityContext`. Its
  signature and implementation MUST NOT accept `Task`, `Submission`, `SeedTransaction`,
  `RecognitionReceipt`, private profile/session objects, or an untyped record.
- `prohibitedSharedFieldsPresent` is the literal `false`; any missing, true, or differently typed
  value is rejected before a DTO or counter is calculated.
- Household canopy requires rewarded acquisition plus household scope. Circle requires Green
  Impact, household scope, and `circleEligible = true`; recognition-only is always excluded.
- Shared DTOs contain neither Child identity nor Seeds, task record, media, reflection, assistant
  content, notes, or sensitive category content.
- Rejected/null shared projections do not block a valid private recognition consequence. No shared
  apply method is called for a null DTO.

## Prepared Media Service

```ts
interface PreparedMediaResult {
  readonly fixture: PreparedMediaFixture | null;
  readonly fallbackText: LocalizedText;
  readonly available: boolean;
}

interface MediaService {
  getPrepared(id: PreparedMediaFixture['id']): Promise<ServiceResult<PreparedMediaResult>>;
  listPrepared(): readonly PreparedMediaFixture[];
}
```

- Only `fixture_recycling_clean_v1` and `fixture_salem_plan_ar_v1` are used in P0.
- A missing file returns a successful, honestly labeled `available = false` result with description
  or transcript. It does not request camera or microphone permission and cannot block submission.
- Media is optional, removable, Parent-visible, synthetic/prepared, and never cross-household.

## Prototype Session Service

```ts
interface ResetResult {
  readonly session: PrototypeSession;
  readonly navigateTo: '/';
  readonly replaceHistory: true;
}

interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  resetPrototype(): ResetResult;
  validateSession(session: PrototypeSession): ServiceResult<PrototypeSession>;
}
```

`getInitialSession` and `resetPrototype` use the same pure fixture factory. Reset is Parent-only at
the application-action boundary and replaces the entire aggregate in one store update. It restores
schema version `3`, Arabic/RTL, Parent, Salem, exact pre-counters, no active assignment/submission,
the two display-only choice fixtures, empty recognition ledger, the four exact prepared fixture
IDs, and celebration with `available = false` and `consumed = false`. Navigation replaces history
with `/` after the store update.

## Central Registry

```ts
interface Feature003ServiceRegistry {
  readonly task: TaskService;
  readonly recognition: RecognitionService;
  readonly garden: GardenService;
  readonly familyProjection: FamilyProjectionService;
  readonly media: MediaService;
  readonly parentGuide: ParentGuideService;
  readonly childCoach: ChildCoachService;
  readonly prototypeSession: PrototypeSessionService;
}
```

All P0 registry entries are deterministic local implementations. There is no remote adapter,
provider SDK, client secret, production log, or server proxy in Feature 003 P0. Optional live Parent
AI remains `BLOCKED` for implementation and `NOT RUN` for validation.

## Required Contract Tests

1. Every valid and invalid recognition/phase row, recurrence rule, and fixed-award value.
2. Assignment, choice, start, submit, and retry produce zero counter changes.
3. Completing with permitted help retains the displayed award.
4. First P0 recognition yields 48→60 Seeds, 48/60 Shoot→60/60 Sapling, 19→20 leaves, and
   11→12 eligible actions; five repeats are no-ops.
5. Stage boundaries and values immediately below/above 0, 20, 60, 120, and 200.
6. Private, non-Green, recognition-only, sensitive, identity-bearing, and Seed-bearing candidates
   never update a shared counter.
7. A maintenance Green task can create one eligible coarse circle action but no Seed, landscape, or
   canopy consequence.
8. The third recurrent fade-first acquisition creates an unselected future-only phase prompt.
9. Reset from every meaningful state reconstructs the exact baseline and empty ledger.
10. Missing media returns accessible fallback content and never blocks submission.

## Product Experience Redesign Service Contracts

The redesign services are deterministic local contracts. They are added to the existing registry
without changing the P0 session or Green Circle contracts.

```ts
interface SyntheticAccessService {
  signInParent(input: SyntheticParentSignIn): ServiceResult<ParentAccessSession>;
  signInChild(input: SyntheticChildSignIn): ServiceResult<ChildAccessSession>;
  projectSession(
    input: ProjectAccessSessionInput,
  ): ServiceResult<ParentAccessView | ChildAccessView>;
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

interface FamilyRewardService {
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

interface FamilyLeagueService {
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

interface CoachAdaptationService {
  policyForAgeBand(ageBand: unknown): ServiceResult<ChildCoachOutputPolicy>;
  adaptPreparedResult(input: AdaptCoachResultInput): ServiceResult<AgeAdaptedCoachResult>;
}

interface SyntheticVoiceService {
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
```

### Required contract properties

- Access and sensitive-action services validate session role, actor, household, device, purpose,
  expiry, revocation, and replay state from stored values. They never trust a standalone caller role.
- Pairing and reauthentication values are opaque synthetic fixtures and have no production-security
  claim.
- Family Reward creation/change requires a consumed proof for monetary metadata. The deterministic
  evaluator accepts caller-provided candidate fixtures only from a stored Parent-authorized
  service call and validates every field, prerequisite, Child, and recognition-key duplicate. Its
  event type has no rank, score, speed, payment, or exchange-rate property. A future frontend MUST
  replace these candidate fixtures with events derived from the authoritative confirmation/Garden
  store before this evaluator is exposed outside the local prototype adapter.
- Family Reward lifecycle transitions are monotonic. Duplicate unlock/given attempts return the
  current value, while withdrawal or retroactive milestone edits fail.
- League creation validates exactly five unique Parent-approved eligible Leaves per participating
  Child. A rolled empty week may be filled once with a new proof-scoped membership set; a populated
  week cannot be replaced. Credit is idempotent by recognition key and full for permitted help or
  adaptation.
- League ranking sorts score only, uses competition positions with gaps after ties, and cannot use a
  completion timestamp. Results are capped at 100.
- Child League projection accepts a week key only, derives raw state from its private service
  ledger, and emits only the minimal projection. The pure projector rejects unknown or forbidden
  keys before output. Neither path calls the Green Circle projector or changes P0 counters.
- Prepared encouragement accepts only reviewed IDs with paired Arabic/English content and no
  caller-supplied message text.
- Coach adaptation exact-matches the reviewed fixture, rejects invalid age/task/version/Child
  binding, and selects a reviewed prefix of complete steps and choices up to the age-band limits; it
  never truncates localized text. Voice start, stop, playback, replay, and send require the current
  stored Parent grant plus the canonical task-bound prepared transcript; delete and reset remain
  available to the same Child after revocation. No method can accept audio bytes, microphone
  handles, speaker identity, background mode, or provider credentials.

### Additional focused contract tests

11. Parent and Child projections expose only their allowlisted capabilities and fields.
12. Pairing and reauthentication reject wrong actor, device, purpose, expiry, replay, and revocation.
13. Permission updates require Parent authority and matching proof.
14. Family Reward lifecycle, privacy, eligibility, prospective versioning, and monthly totals.
15. Family Reward inputs cannot derive from League position or convert Seeds to money.
16. Exactly-five League assignment, 20-point increments, cap, help/adaptation credit, ties, and
    rollover isolation.
17. Strict League projection and prepared-encouragement allowlist rejection.
18. Age-specific Coach output limits and task/version binding.
19. Synthetic voice permission, explicit lifecycle, delete-before-send, playback, and reset.
