# Feature 003 Data Model

## Purpose and Boundary

This model replaces the Feature 002 food-rescue domain for the judge-facing Feature 003 journey
without rewriting Feature 002 history. It is an in-memory, deterministic prototype model. Every
profile, task choice, assistant result, media item, summary, and circle value is synthetic or
prepared local data.

The model has one aggregate root, `PrototypeSession`. Screens read the aggregate through services;
they do not calculate rewards, garden stages, or shared projections. The deterministic provider is
the complete P0 path. No account, remote persistence, unrestricted assistant conversation, or live
Child media enters this model.

## Canonical Scalar Types

```ts
type LocaleCode = 'ar' | 'en';
type TextDirection = 'rtl' | 'ltr';
type DemoRole = 'parent' | 'child';
type CapabilityOrigin = 'synthetic' | 'prepared' | 'simulated' | 'live';
type AuthoredRoute =
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

interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}

type AgeBand = '6_8' | '9_11' | '12_14';
type FixedSeedAward = 4 | 6 | 8 | 12 | 15;
type RecognitionMode = 'standard' | 'fade_first' | 'recognition_only';
type RoutinePhase = 'acquisition' | 'maintenance' | 'not_applicable';
type Recurrence = 'once' | 'recurrent';
type VisibilityScope = 'child_guardian' | 'household';
type LandscapeId = 'ghaf' | 'samar' | 'sidr' | 'date_palm' | 'mangrove';
type GardenStage = 'seed' | 'shoot' | 'sapling' | 'shade' | 'flourishing';
```

Machine values use underscores. User-facing English may display “fade-first” and
“recognition-only.”

## Synthetic Household

```ts
interface SyntheticHousehold {
  readonly id: 'household_al_noor';
  readonly displayName: LocalizedText;
  readonly origin: 'synthetic';
  readonly childIds: readonly ['child_salem', 'child_alya'];
  readonly combinedCanopy: HouseholdCanopy;
}

interface SyntheticChildProfile {
  readonly id: 'child_salem' | 'child_alya';
  readonly displayName: LocalizedText;
  readonly age: 9 | 11;
  readonly ageBand: '9_11';
  readonly origin: 'synthetic';
  readonly earnedSeeds: number;
}
```

The reset fixtures are Salem, age 9, with 48 personal earned Seeds and Alya, age 11, with 36.
Individual totals are available only in the active Child/guardian context. A sibling-facing or
circle projection never contains both raw totals.

## Categories and Landscape Mapping

```ts
type TaskCategoryId =
  | 'faith_gratitude'
  | 'roots_kinship'
  | 'home_responsibility'
  | 'green_impact'
  | 'food_hospitality'
  | 'heritage_etiquette'
  | 'kindness_community'
  | 'learning_wellbeing';

interface TaskCategory {
  readonly id: TaskCategoryId;
  readonly label: LocalizedText;
  readonly landscapeId: LandscapeId;
  readonly defaultVisibilityScope: VisibilityScope;
  readonly circleMayBeEligible: boolean;
  readonly contentReviewStatus: 'reviewed_p0' | 'named_human_review_required';
}
```

| Category machine value | English / Arabic                        | Landscape   | Default sharing rule                                                      |
| ---------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `faith_gratitude`      | Faith & Gratitude / الإيمان والامتنان   | `sidr`      | `child_guardian`; recognition-only by default; never circle               |
| `roots_kinship`        | Roots & Kinship / جذورنا                | `ghaf`      | Private or household; never circle                                        |
| `home_responsibility`  | Home Responsibility / مسؤوليتي          | `samar`     | Household; never circle unless represented by a separate valid Green task |
| `green_impact`         | Green Impact / أثر أخضر                 | `mangrove`  | Household may be circle-eligible after filtering                          |
| `food_hospitality`     | Food & Hospitality / النعمة والضيافة    | `date_palm` | Household; never circle                                                   |
| `heritage_etiquette`   | Heritage & Etiquette / تراثنا وآدابنا   | `ghaf`      | Private or household; never circle                                        |
| `kindness_community`   | Kindness & Community / اللطف والمجتمع   | `samar`     | Recognition-only or fade-first preparation; never circle                  |
| `learning_wellbeing`   | Learning & Wellbeing / التعلّم والتوازن | `sidr`      | `child_guardian`; never circle                                            |

Only `green_impact` can set `circleEligible = true`, and only with
`visibilityScope = 'household'`.

## Task Template and Reviewed Task

```ts
interface TaskSafetyBoundary {
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

interface TaskTemplate {
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

interface Task {
  readonly id: string;
  readonly version: number;
  readonly templateId: string;
  readonly targetChildId: SyntheticChildProfile['id'];
  readonly parentOriginalText: LocalizedText;
  readonly acceptedGuideFixtureId: string | null;
  readonly content: TaskTemplate;
  readonly origin: 'prepared' | 'synthetic';
}
```

`TaskTemplate` is the immutable reviewed catalog shape. A Parent-created `Task` preserves the
original wording even when a Guide result exists. `TaskJourney.lifecycle` is the only draft/review
source of truth, and the existence of `Assignment` is the only assignment-approval source of truth.
The suggested copy replaces task content only after **Accept suggestion**. **Keep mine** leaves
`parentOriginalText` and content unchanged.

The P0 task is `task_recycling_p0_v1`, a separate 12-Seed multi-step variant of catalog item
`GI01`. `GI01` remains an 8-Seed, single-step `fade_first + acquisition` fixture. General household
waste is a Home Responsibility item and cannot inherit Green or circle eligibility.

### Canonical P0 Task Values

| Field                            | Required value                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Task / source template           | `task_recycling_p0_v1` / separate variant based on `GI01`                                               |
| Child                            | `child_salem`, synthetic, age 9                                                                         |
| Category / landscape             | `green_impact` / `mangrove`                                                                             |
| English title                    | Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin                 |
| Arabic title                     | فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر |
| Effort                           | 15–30 minutes                                                                                           |
| Recognition / phase / recurrence | `standard` / `acquisition` / `once`                                                                     |
| Award                            | 12 Seeds after one Parent confirmation                                                                  |
| Visibility / circle              | `household` / `true`                                                                                    |
| Evidence / reflection            | Optional prepared fixtures; neither blocks completion                                                   |
| Meaning                          | Practical responsible recycling; no quantified impact or real-tree claim                                |

The bilingual definition of done and all safety fields are the canonical P0 strings in
`DEMO_RUNBOOK.md`. Implementations must consume those reviewed fixture values without rewriting the
Arabic safety-critical text.

## Child-Home Choice Pool

Reset and active assignment are intentionally separate concepts:

```ts
interface ApprovedChoiceFixture {
  readonly id: 'choice_preview_hr02_v1' | 'choice_preview_lw01_v1' | 'choice_recycling_p0_v1';
  readonly childId: SyntheticChildProfile['id'];
  readonly taskTemplateId: string;
  readonly approvalState: 'parent_approved_fixture';
  readonly demoAvailability: 'display_only' | 'p0_executable';
  readonly origin: 'prepared';
}

interface ChildChoicePool {
  readonly seededPreviewChoices: readonly [ApprovedChoiceFixture, ApprovedChoiceFixture];
  readonly p0AssignmentChoice: ApprovedChoiceFixture | null;
}
```

- Reset contains two local Parent-approved `display_only` preview choices so `/child` can show the
  required breadth. They are visibly prepared catalog previews, create no `Assignment`, and cannot
  enter the P0 lifecycle or issue recognition.
- The two reset fixtures are exactly `choice_preview_hr02_v1` → `HR02` (prepare tomorrow's school
  bag) and `choice_preview_lw01_v1` → `LW01` (read or listen to a book for ten minutes).
- Reset has `p0AssignmentChoice = null` and `activeAssignmentId = null`; therefore it has no active,
  selected, chosen, or in-progress assignment.
- Explicit Parent approval of `task_recycling_p0_v1` creates the sole `p0_executable` choice and
  its `Assignment` as `choice_recycling_p0_v1`. Child home then shows two previews plus the
  executable recycling choice.
- Selecting a display-only fixture is a neutral guard result explaining that the deterministic
  slice demonstrates the Parent-approved recycling task. It never widens P0 into a second task.

## Journey Aggregate and Lifecycle

There is one lifecycle source of truth on `TaskJourney`; `Task`, `Assignment`, and `Submission` do
not keep competing copies of it.

```ts
type TaskLifecycleStatus =
  | 'draft'
  | 'reviewed'
  | 'assigned'
  | 'chosen'
  | 'in_progress'
  | 'submitted'
  | 'retry'
  | 'confirmed'
  | 'recognized';

interface Assignment {
  readonly id: string;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly childId: SyntheticChildProfile['id'];
  readonly approvedByParent: true;
  readonly approvalSequence: number;
  readonly createdAt: string;
}

type CompletionMode = 'independent' | 'permitted_help';

interface Submission {
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

type ParentCheckInDecision =
  'kind_retry' | 'confirm' | 'propose_smaller_future_task' | 'propose_safe_equivalent';

interface ParentCheckIn {
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

interface TaskJourney {
  readonly lifecycle: TaskLifecycleStatus;
  readonly task: Task;
  readonly assignment: Assignment | null;
  readonly submission: Submission | null;
  readonly checkIn: ParentCheckIn | null;
}
```

The canonical path is:

`draft → reviewed → assigned → chosen → in_progress → submitted → confirmed → recognized`

Kind retry is `submitted → retry → in_progress`. The `retry` state is retained as an auditable
transition result before resuming work. It removes nothing and creates no public failure mark.
A smaller or safe-equivalent proposal at check-in creates a new draft for prospective Parent review;
it never edits the accepted assignment or changes its award retroactively.

### Transition Guards and Effects

| Transition                | Required guard                                                                                                                                                                           | Persistent/reward/shared effect                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `draft → reviewed`        | Complete bilingual positive action, purpose, definition, effort, permitted help, supervision, safety, privacy, reward/recognition, phase, recurrence, landscape, and category validation | None                                                                     |
| `reviewed → assigned`     | Explicit Parent approval; task still matches approved version; valid recognition/phase/privacy combination                                                                               | Create one `Assignment`; no counter change                               |
| `assigned ↺ assigned`     | Exact repeated Parent approval for the same task/version, Child, assignment, and executable choice                                                                                       | Return the existing journey; no mutation or counter change               |
| `assigned → chosen`       | Active synthetic Child matches `assignment.childId`; deliberate Child choice                                                                                                             | None                                                                     |
| `chosen → in_progress`    | Explicit start/open action; assignment and task versions still match                                                                                                                     | None                                                                     |
| `in_progress → submitted` | Approved definition acknowledged; completion mode is valid; media/reflection may be absent                                                                                               | Create `Submission`; no counter change                                   |
| `submitted → retry`       | Parent chooses kind retry                                                                                                                                                                | Create check-in; no counter change or loss                               |
| `retry → in_progress`     | Same assignment/task version; optional Parent note is nonpunitive                                                                                                                        | None                                                                     |
| `submitted → confirmed`   | Parent chooses confirm; editable action-specific praise is valid                                                                                                                         | Create one check-in and pending recognition plan; no counter changes yet |
| `confirmed → recognized`  | Praise has been presented; recognition key is not in the ledger; all projection filters have run                                                                                         | Apply one atomic recognition consequence                                 |

The `assigned ↺ assigned` row is an application-command idempotency guard rather than a second
lifecycle transition; nonmatching approval repeats and all other transitions return
`INVALID_TRANSITION`. Assignment, choice, start, submission, and retry must keep all Seed, garden,
canopy, and circle counters byte-for-byte unchanged.

## Recognition, Reward, and Idempotency

```ts
interface SeedTransaction {
  readonly id: string;
  readonly recognitionKey: string;
  readonly childId: SyntheticChildProfile['id'];
  readonly amount: FixedSeedAward;
  readonly balanceBefore: number;
  readonly balanceAfter: number;
  readonly meaning: 'symbolic_nonfinancial';
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

type RecognitionApplication =
  | {
      readonly status: 'applied';
      readonly receipt: RecognitionReceipt;
    }
  | {
      readonly status: 'already_confirmed';
      readonly receipt: RecognitionReceipt;
      readonly message: LocalizedText;
    };
```

The deterministic idempotency key is `recognition:<submission.id>`. The first valid application
stores one immutable receipt in a recognition ledger. Every later call returns that receipt inside
an `already_confirmed` attempt result and performs no write, animation trigger, milestone, or
celebration. Attempt disposition never mutates or masquerades as a field on the receipt.

Only a replacement task agreed before Child acceptance can have a different displayed award.
Completing with `permitted_help` applies the same displayed award as independent completion.

### Valid Reward Matrix

| Recognition and phase               | Task validity                    | Seed transaction      | Landscape/canopy                                     | Circle                                                         |
| ----------------------------------- | -------------------------------- | --------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `standard + acquisition`            | Valid only when finite or `once` | Fixed displayed award | Mapped landscape; canopy only when household-visible | One event only for eligible household Green Impact             |
| `fade_first + acquisition`          | Valid; recurrent is allowed      | Fixed displayed award | Same                                                 | Same; third recurrent confirmation creates future-phase prompt |
| `standard + maintenance`            | Valid only when finite or `once` | None                  | None                                                 | One eligible coarse Green action may be recorded               |
| `fade_first + maintenance`          | Valid                            | None                  | None                                                 | One eligible coarse Green action may be recorded               |
| `recognition_only + not_applicable` | Valid                            | None                  | None                                                 | Never                                                          |

Every other pairing is invalid before assignment. `displayedSeedAward` is required only for
acquisition `standard`/`fade_first`; it must be null for maintenance and recognition-only. A
recurrent reward-eligible task must use `fade_first`. `standard` is finite or `once`.

```ts
interface PhaseReviewPrompt {
  readonly taskId: string;
  readonly confirmedAcquisitionCount: 3;
  readonly options: readonly ['keep_acquisition', 'move_future_to_maintenance'];
  readonly selected: null;
  readonly appliesTo: 'future_completions_only';
  readonly reversibleByParent: true;
}
```

No service changes routine phase automatically or claims that a habit has formed.

## Garden Progress

```ts
interface LandscapeProgress {
  readonly landscapeId: LandscapeId;
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
  readonly nextThreshold: 20 | 60 | 120 | 200 | null;
}

interface LandscapeGrowth {
  readonly landscapeId: LandscapeId;
  readonly seedsBefore: number;
  readonly seedsAfter: number;
  readonly stageBefore: GardenStage;
  readonly stageAfter: GardenStage;
  readonly crossedThreshold: 20 | 60 | 120 | 200 | null;
  readonly symbolicOnly: true;
}
```

The pure stage function is:

| Cumulative Seeds | Stage         |
| ---------------: | ------------- |
|             0–19 | `seed`        |
|            20–59 | `shoot`       |
|           60–119 | `sapling`     |
|          120–199 | `shade`       |
|             200+ | `flourishing` |

The P0 display begins as 48/60 Shoot. After one award it presents the just-crossed threshold as
60/60 Sapling and records cumulative Mangrove Seeds as 60. Growth is monotonic; no transaction may
decrease a balance or stage.

## Privacy-First Shared Projections

Shared DTOs are constructed from an internal recognition candidate after validation. Raw domain
objects are never passed to household or circle views.

```ts
interface HouseholdCanopy {
  readonly contributionLeaves: number;
  readonly goalLeaves: 25;
}

interface CanopyContributionDTO {
  readonly actionKind: 'eligible_household_acquisition';
  readonly leafDelta: 1;
  readonly origin: 'synthetic';
}

interface GreenCircleEventDTO {
  readonly actionKind: 'eligible_green_action';
  readonly actionDelta: 1;
  readonly sourceScope: 'household';
  readonly origin: 'synthetic_local';
}

interface CircleGoal {
  readonly eligibleGreenActions: number;
  readonly goal: 12;
  readonly origin: 'synthetic_local';
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

type ProjectionRejectionReason =
  | 'private_scope'
  | 'non_green_category'
  | 'circle_not_eligible'
  | 'recognition_only'
  | 'sensitive_content'
  | 'invalid_pairing';
```

`GreenCircleEventDTO` has no Child ID, household name, task ID/title/history, Seed amount, exact
date/time, media, reflection, assistant content, Parent note, prayer/kinship/affection, food
consumption, hygiene, wellbeing, or disability-related field. The recognition ledger performs
deduplication before construction, so no internal correlation key enters a shared DTO.

The private recognition boundary validates the full `Task` and `Submission`, then derives only the
strict `ProjectionEligibilityContext`. `FamilyProjectionService` never accepts the raw private
objects. Its context schema rejects unknown fields, so an attempted shared candidate containing a
Child/household identity, task record, Seed amount, media, reflection, assistant content, note, or
timestamp fails before DTO construction or counter mutation.

Privacy filtering happens before a canopy or circle counter is calculated or changed:

1. Check the recognition ledger; a duplicate returns the stored receipt before reward or
   projection work.
2. Validate the task and recognition/phase combination.
3. Reject an invalid `circleEligible` pairing before assignment.
4. Derive the private reward plan.
5. Construct a canopy DTO only for household-visible rewarded acquisition.
6. Construct a circle DTO only for household-visible, circle-eligible Green Impact confirmation;
   maintenance may create this event without reward/growth.
7. Scan candidate shared data for prohibited fields/content; reject the affected projection.
8. Atomically commit only allowed consequences and store the receipt.

A private or non-Green acquisition can still receive its valid private Seed/landscape consequence,
but its shared DTOs are null and shared counters do not change. Recognition-only never produces a
shared DTO.

## Prepared Media Fixtures

```ts
type PreparedMediaKind = 'image' | 'audio';

interface PreparedMediaFixture {
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
```

The prepared image contains only safe clean recyclable objects and no Child, face, hand, personal
data, brand, address, school, readable private text, or watermark. The prepared audio is a
synthetic/prepared fixture, never a real Child recording. Missing media returns its description or
transcript and never blocks submission.

The application store also owns one resettable, route-independent Child task draft so prepared
media and reflection state cannot survive navigation or reset accidentally:

```ts
interface ChildTaskDraftState {
  readonly selectedMediaFixtureId: PreparedMediaFixture['id'] | null;
  readonly removedMediaFixtureIds: readonly PreparedMediaFixture['id'][];
  readonly unavailableMediaFixtureIds: readonly PreparedMediaFixture['id'][];
  readonly reflection: LocalizedText | null;
}
```

This draft is local transient interaction state, not an account record and not a cross-household
projection. Successful new-task creation and `resetPrototype()` replace it with the empty value.

## Prototype Session and Exact Reset

```ts
interface PrototypeSession {
  readonly schemaVersion: 3;
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly role: DemoRole;
  readonly household: SyntheticHousehold;
  readonly children: Readonly<Record<SyntheticChildProfile['id'], SyntheticChildProfile>>;
  readonly activeChildId: SyntheticChildProfile['id'];
  readonly choicePool: ChildChoicePool;
  readonly activeAssignmentId: string | null;
  readonly journey: TaskJourney | null;
  readonly landscapeProgress: Readonly<Record<LandscapeId, LandscapeProgress>>;
  readonly circleGoal: CircleGoal;
  readonly recognitionLedger: Readonly<Record<string, RecognitionReceipt>>;
  readonly preparedParentGuideFixtureId: 'guide_recycling_refine_v1';
  readonly preparedChildCoachFixtureId: 'coach_recycling_steps_v1';
  readonly preparedImageFixtureId: 'fixture_recycling_clean_v1';
  readonly preparedAudioFixtureId: 'fixture_salem_plan_ar_v1';
  readonly assistantMode: 'deterministic_prepared';
  readonly celebration: { readonly available: boolean; readonly consumed: boolean };
}
```

`resetPrototype()` constructs a new aggregate in one operation; it does not patch the prior state.
The router then replaces history with `/`.

| Reset field                            | Canonical value                                                 |
| -------------------------------------- | --------------------------------------------------------------- |
| Schema version                         | `3`                                                             |
| Locale / direction                     | `ar` / `rtl`                                                    |
| Reset navigation result                | `navigateTo = '/'`; `replaceHistory = true` outside the session |
| Role / active Child                    | `parent` / `child_salem`                                        |
| Profiles                               | Synthetic Al Noor household; Salem 9; Alya 11                   |
| Personal Seeds                         | Salem 48; Alya 36                                               |
| Mangrove                               | 48/60, `shoot`                                                  |
| Household canopy                       | 19/25 leaves                                                    |
| Circle                                 | 11/12 eligible Green actions, synthetic/local                   |
| Choice pool                            | Two approved display-only fixtures; no executable P0 choice yet |
| Active assignment / journey submission | `null` / none                                                   |
| Prepared fixture IDs                   | The four exact IDs in `PrototypeSession` above                  |
| Assistant mode                         | `deterministic_prepared`; no remote dependency                  |
| Recognition ledger                     | Empty                                                           |
| Celebration                            | `available = false`, `consumed = false`                         |

After the P0 task is approved, completed, and validly recognized once, only these counters differ:

- Salem personal earned Seeds: 48 → 60;
- Mangrove: 48/60 Shoot → 60/60 Sapling;
- combined household canopy: 19/25 → 20/25; and
- circle eligible Green actions: 11/12 → 12/12.

Repeated recognition changes no value. Reset from every lifecycle, assistant, media, garden,
circle, or celebration state reconstructs the exact table above without network access.

## Product Experience Redesign Domain Models

These models are independent deterministic aggregates in the current phase. They do not change the
P0 `PrototypeSession` or its schema version.

### Synthetic access

- `SyntheticPrincipal`: one Parent or Child fixture identifier, role, household, and synthetic
  origin. A Child principal has no email or phone field.
- `AccessSession`: opaque session ID, principal, issued/expiry times, device ID, and capability
  allowlist. Parent and Child projections are distinct union members.
- `PairingRequest`: opaque pairing ID/code, Child ID, requesting device, expiry, status
  (`pending | approved | consumed | expired | revoked`), and approving Parent when applicable.
- `ReauthenticationProof`: Parent/session ID, one sensitive purpose, issue/expiry, consumed flag,
  and synthetic origin.
- `ChildPermissionGrant`: Child ID, language preference, voice/media/AI booleans, version, updating
  Parent, and update time.

Every transition receives an explicit deterministic time. Expired or consumed values are rejected,
and no API accepts a caller-provided role as proof of authority.

### Family Reward

- `FamilyRewardPlan`: plan/Child/guardian IDs, version, promise kind
  (`money | experience | privilege | gift`), private bilingual description, optional currency and
  minor-unit amount, one personal milestone, baseline, lifecycle (`promised | unlocked | given`),
  creation/update/unlock/given times, and synthetic origin.
- `FamilyRewardMilestone`: eligible Seed delta, one landscape stage, or a number of landscapes at a
  stage. No union member includes League score or rank.
- `FamilyRewardEligibilityEvent`: recognition key, Child, category, recognition mode, phase,
  eligible Seed delta, resulting landscape state, and protected-content flags. It contains no task
  text, media, reflection, assistant content, Parent note, or money.
- `FamilyRewardProgressSnapshot`: personal Child progress only.
- `FamilyRewardPrivateView`: plan details for the matching Child/guardian audience.

Plan edits produce the next version while the plan is still promised. Unlock and given transitions
are monotonic and idempotent. Monetary promise totals group active promises by month and currency;
they never multiply Seeds by money.

### Weekly Family League

- `ChallengeLeaf`: week/Leaf/Child identifiers, age band, approved task reference, category,
  visibility, content-sensitivity flags, accessibility-adapted flag, state
  (`assigned | confirmed`), and recognition key after confirmation.
- `FamilyLeagueWeek`: ISO week key plus explicit time-zone identifier, five Leaves per participant,
  confirmation ledger, cooperative confirmed count, invited synthetic members, opt-out set, and
  prepared encouragement ledger.
- `WeeklyGrowthResult`: Child ID, completed count, score in 20-point increments, and competition
  position. No timestamp or speed field exists.
- `LeagueParticipantProjection`: allowlisted nickname, tree-avatar token, completed count, score,
  and position only.
- `PreparedEncouragement`: sender/recipient synthetic IDs and one bilingual reviewed phrase ID; no
  free-text field exists.

League scoring and rollover never mutate Seed, landscape, recognition, canopy, or Green Circle
state. The strict League projection is separate from `GreenCircleEventDTO`.

### Age-adaptive Coach and synthetic voice

- `ChildCoachOutputPolicy`: age band, maximum step count, sentence/pace/tone keys, quick-choice
  support, and early adult-exit requirement.
- `AgeAdaptedCoachResult`: active task/version binding, bounded steps, optional reviewed choices,
  adult exit, and deterministic prepared origin.
- `SyntheticVoiceSession`: Child/session/task/version IDs, stored permission version, lifecycle
  (`idle | recording | transcript_review | sent`), prepared transcript, captions, playback rate,
  replay availability, and background-recording literal `false`.

Only an explicit start can enter `recording`; stop supplies a prepared transcript and enters review.
Delete clears it before send, and reset returns the exact idle value. No model carries audio bytes,
microphone permission, speaker identity, biometric data, or provider metadata.
