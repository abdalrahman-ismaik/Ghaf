# Bounded Assistant Contract

## Capability Truth

Feature 003 P0 has two deterministic, prepared assistants:

- Parent Guide: a bounded transformation of synthetic Parent/task input; and
- Child Coach: a prepared helper bound to the current Parent-approved task.

Prepared output is always labeled prepared/prewritten and may be wrong. The Child Coach has no live
mode. No approved secure server boundary exists, so live Parent AI is `BLOCKED` for implementation
and `NOT RUN` for validation. This contract defines the future-shaped seam without authorizing a
remote adapter, provider SDK, secret, proxy, real Child input, or unrestricted chat.

## Shared Assistant Types

```ts
type AssistantLocale = 'ar' | 'en';
type AssistantAudience = 'parent' | 'child';
type AssistantOrigin = 'prepared' | 'live';
type AssistantMode = 'deterministic_prepared' | 'live_optional';

type AssistantState = 'idle' | 'prepared_loading' | 'result' | 'fallback' | 'dismissed';

type ParentLiveOnlyState = 'live_loading' | 'live_result' | 'live_error';

type FallbackReason =
  'remote_not_configured' | 'timeout' | 'remote_failure' | 'malformed_response' | 'safety_rejected';

interface AssistantDisclosure {
  readonly text: LocalizedText;
  readonly saysAiMayBeWrong: true;
  readonly saysHumanDecides: boolean;
  readonly preparedIsExplicit: boolean;
}

interface AssistantResultMeta {
  readonly requestId: string;
  readonly audience: AssistantAudience;
  readonly origin: AssistantOrigin;
  readonly fixtureId: string | null;
  readonly fallbackUsed: boolean;
  readonly fallbackReason: FallbackReason | null;
  readonly disclosure: AssistantDisclosure;
}
```

P0 results always have `origin = 'prepared'`, a non-null reviewed fixture ID, and
`preparedIsExplicit = true`. `live` is not a selectable P0 mode.

## Parent Guide

### Allowlisted Intents

```ts
type ParentGuideIntent =
  | 'make_clearer'
  | 'make_smaller'
  | 'check_safety'
  | 'adapt_age'
  | 'draft_descriptive_praise'
  | 'summarize_observable_pattern'
  | 'suggest_parent_question';
```

There is no `chat`, `analyze_child`, `diagnose`, `score`, or arbitrary tool intent.

### Request and Task-Refinement Result

```ts
interface ParentGuideRequest {
  readonly requestId: string;
  readonly intent: ParentGuideIntent;
  readonly locale: AssistantLocale;
  readonly child: {
    readonly id: SyntheticChildProfile['id'];
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

interface ParentGuideTaskSuggestion {
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
```

The result is a proposal, not a mutation. `originalParentText` must equal the request input. Only
`TaskService.applyAcceptedGuideSuggestion` copies reviewed suggestion fields into a draft.

The canonical P0 fixture is `guide_recycling_refine_v1` for “Take the recycling out.” It must
produce the exact P0 recycling task and retain every adult check, item exclusion, safe-route,
heat/traffic, carrying/disposal, indoor-alternative, ask-an-adult, and handwashing boundary from
the approved task. Canonical Arabic safety text comes from `DEMO_RUNBOOK.md` unchanged.

### Parent Summary Result

```ts
interface ParentPatternSummary {
  readonly meta: AssistantResultMeta;
  readonly timeWindow: LocalizedText;
  readonly strengthsFirst: LocalizedText;
  readonly observableFacts: readonly LocalizedText[];
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
```

The prepared seven-day summary states that Salem completed two Green Impact steps and appropriately
asked for adult help once, cannot explain a postponed task, asks which step felt easiest, and asks
whether the next task should remain the same size. It does not compare siblings.

### Bounded Local Parent Correction

Correction is a pure local edit of one synthetic observable-fact slot. It is not an assistant
prompt, conversation, remote request, hidden note, or request to analyze the Child.

```ts
type ParentSummaryCorrection =
  | {
      readonly operation: 'replace_fact';
      readonly factIndex: 0 | 1 | 2;
      readonly correctedFact: LocalizedText;
    }
  | {
      readonly operation: 'remove_fact';
      readonly factIndex: 0 | 1 | 2;
    }
  | {
      readonly operation: 'mark_fact_uncertain';
      readonly factIndex: 0 | 1 | 2;
    };

type ParentSummaryCorrectionRejection =
  | 'invalid_shape'
  | 'fact_out_of_range'
  | 'would_remove_all_facts'
  | 'prohibited_language'
  | 'not_observable_fact';

interface ParentSummaryCorrectionAttempt {
  readonly disposition: 'applied' | 'rejected';
  readonly summary: ParentPatternSummary;
  readonly rejectedFor: readonly ParentSummaryCorrectionRejection[];
}

interface ParentSummaryPolicy {
  validate(summary: ParentPatternSummary): ServiceResult<ParentPatternSummary>;
  applyLocalCorrection(
    summary: ParentPatternSummary,
    correction: ParentSummaryCorrection,
  ): ServiceResult<ParentSummaryCorrectionAttempt>;
}
```

- `replace_fact` changes exactly one existing synthetic observable fact. Each localized value is
  trimmed, one line, 1–180 Unicode characters, and cannot introduce an extra fact, score, label,
  question, adjustment, diagnosis, interpretation, or note.
- The correction union is strict at runtime; unknown fields, a fourth index, missing bilingual
  replacement text, and operation-specific extra fields are rejected rather than stripped.
- `remove_fact` removes exactly one fact; it cannot leave `observableFacts` empty.
- `mark_fact_uncertain` moves the selected fact into the existing uncertainty statement without
  claiming a reason or motive.
- The operation cannot change the time window, strengths-first structure, question, adjustment,
  origin/disclosure, Child identity, or any task/reward/shared-projection state.
- `applyLocalCorrection` reconstructs a new immutable summary by explicit field selection, then
  runs strict shape and prohibited-language validation over both languages. Invalid correction
  returns `disposition = 'rejected'`, the unchanged last-valid prepared/corrected summary, and
  bounded validation reasons; a valid edit returns `disposition = 'applied'`. It never sends text
  to `ParentGuideService` or any remote provider.
- There is no append, general rewrite, conversation history, arbitrary analysis field, or free-chat
  command. The UI exposes only the three operations above for the synthetic fact slots.

## Child Coach

### Allowlisted Intents and Age Policy

```ts
type ChildCoachIntent =
  | 'simplify_task'
  | 'show_steps'
  | 'create_if_then_cue'
  | 'rehearse_reviewed_phrase'
  | 'respond_to_prepared_fixture'
  | 'offer_optional_reflection'
  | 'need_adult';

interface ChildInteractionPolicy {
  readonly ageBand: AgeBand;
  readonly inputMode: 'curated_intents_only' | 'structured_template' | 'guardian_enabled_bounded';
  readonly freeTextAllowed: boolean;
  readonly pushToTalkAllowed: boolean;
  readonly unrestrictedChatAllowed: false;
}

type ChildInputAttempt =
  'curated_intent' | 'structured_template' | 'bounded_text' | 'push_to_talk' | 'unrestricted_chat';

interface ChildInteractionDecision {
  readonly allowed: boolean;
  readonly policy: ChildInteractionPolicy;
  readonly rejectedFor:
    'none' | 'wrong_input_mode' | 'guardian_enablement_required' | 'unrestricted_chat_prohibited';
}

interface ChildInteractionPolicyService {
  policyFor(ageBand: AgeBand): ChildInteractionPolicy;
  evaluate(input: {
    readonly ageBand: AgeBand;
    readonly attempt: ChildInputAttempt;
    readonly guardianEnabled: boolean;
  }): ChildInteractionDecision;
}
```

| Age band | Input mode                 | Free text / voice                                              |
| -------- | -------------------------- | -------------------------------------------------------------- |
| `6_8`    | `curated_intents_only`     | Neither                                                        |
| `9_11`   | `structured_template`      | No arbitrary free text; prepared media only in P0              |
| `12_14`  | `guardian_enabled_bounded` | Future guardian-enabled bounded text/push-to-talk only; not P0 |

The policy service is pure and has exhaustive unit cases for `6_8`, `9_11`, and `12_14`, including
every input attempt and guardian-enablement edge. No band receives unrestricted chat. P0 provider
requests remain narrower: Salem and Alya are synthetic `9_11` profiles, and no P0 service request
can be constructed for another band.

### Request and Result

```ts
interface ChildCoachRequest {
  readonly requestId: string;
  readonly intent: ChildCoachIntent;
  readonly locale: AssistantLocale;
  readonly child: {
    readonly id: SyntheticChildProfile['id'];
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

interface ChildCoachResult {
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
```

The canonical fixture is `coach_recycling_steps_v1`. It contains exactly the four reviewed steps
and if–then cue in `DEMO_RUNBOOK.md`, shows **I need an adult**, and uses the disclosure “Prepared
AI-assistant example; this response is prewritten and may be wrong” with its canonical Arabic pair.

The request is valid only when the active synthetic Child owns the assignment, the assignment is
Parent-approved, the version matches, and lifecycle is `chosen` or `in_progress`. A Coach result can
simplify presentation but cannot alter category, safety, definition of done, reward, visibility,
circle eligibility, or assignment.

## Assistant Services and Providers

```ts
interface ParentGuideService {
  refineTask(request: ParentGuideRequest): Promise<ServiceResult<ParentGuideTaskSuggestion>>;
  summarizePattern(
    request: Omit<ParentGuideRequest, 'intent'> & {
      readonly intent: 'summarize_observable_pattern';
      readonly syntheticSevenDayFacts: readonly LocalizedText[];
    },
  ): Promise<ServiceResult<ParentPatternSummary>>;
}

interface ChildCoachService {
  respond(request: ChildCoachRequest): Promise<ServiceResult<ChildCoachResult>>;
}

interface PreparedParentGuideProvider extends ParentGuideService {
  readonly mode: 'deterministic_prepared';
  readonly fixtureId: 'guide_recycling_refine_v1';
}

interface PreparedChildCoachProvider extends ChildCoachService {
  readonly mode: 'deterministic_prepared';
  readonly fixtureId: 'coach_recycling_steps_v1';
}
```

The P0 registry contains only these prepared providers. They do not read environment variables,
make network calls, request permissions, or persist conversations.

`ParentSummaryPolicy` is registered as a local pure policy beside these providers, not implemented
as a Guide intent or transport. A correction never enters `refineTask`, `summarizePattern`, a
fallback provider, or a future live-adapter seam.

### Reserved Future Parent Fallback Seam

The following behavior is a contract test seam, not authorization to implement a provider:

```ts
interface ParentGuideFallbackPolicy {
  readonly timeoutMs: 1500;
  readonly retainParentInput: true;
  readonly sameRequestId: true;
  readonly validateBeforeDisplay: true;
  readonly preparedFallbackFixtureId: 'guide_recycling_refine_v1';
}
```

If a separately approved server-side Parent provider is later supplied, timeout, network failure,
malformed structured output, or safety rejection must return the same-attempt prepared result with
the Parent's original input retained and an honest fallback label. It may be labeled live only with
direct evidence. A provider secret can never enter the Expo bundle, fixture, documentation, log,
or repository history.

There is intentionally no corresponding live Child provider seam in P0.

## Structured Validation and Safety Filter

Every result passes, in order:

1. request identity, audience, age policy, active assignment, task ID/version, and intent allowlist;
2. strict structured-shape validation with unknown fields rejected;
3. task safety, category, reward, recurrence, visibility, and circle invariants;
4. semantic prohibited-output checks across both localized strings;
5. point-of-use disclosure/origin validation; and
6. fallback to the reviewed fixture when the Parent live-optional seam fails.

```ts
type ProhibitedAssistantOutput =
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

interface AssistantSafetyDecision<T> {
  readonly accepted: boolean;
  readonly value: T | null;
  readonly rejectedFor: readonly ProhibitedAssistantOutput[];
}
```

The Parent Guide may suggest tasks, smaller/equivalent steps, safety checks, descriptive praise,
questions, and neutral time-bounded summaries only. It cannot diagnose, label normality, infer a
motive or trait, judge parenting/religiosity/truthfulness, or decide food/medical safety.

The Child Coach cannot ask for secrets, exclusivity, affection, dependence, emotional disclosure,
or continued conversation. It cannot act as a friend, therapist, confidant, religious authority,
or replacement Parent; recognize faces/voices; infer emotion/personality; judge truthfulness or
religiosity; or tell a Child to handle a hazard. Any uncertainty or listed hazard yields the
visible trusted-adult exit.

## Prepared Media Interaction

- `respond_to_prepared_fixture` accepts only `fixture_recycling_clean_v1` or
  `fixture_salem_plan_ar_v1`.
- The image is object-only and the audio is synthetic/prepared; neither is analyzed as a real Child
  photo or voice.
- The Coach uses the repository transcript/description, not biometric, face, voice, emotion, or
  truth analysis.
- The UI explains optionality, Parent visibility, no cross-household sharing, and removal before
  use. Missing media yields the same accessible transcript/description path.
- No camera or microphone permission, ambient listening, background capture, or upload exists in
  the deterministic path.

## Required Assistant Contract Tests

1. Every Parent and Child intent is accepted; unknown or chat-like intents are rejected.
2. The pure interaction policy exhaustively checks all supported bands and input modes: ages 6–8
   accept curated intents only, ages 9–11 accept curated/structured input only, and ages 12–14
   require guardian enablement for bounded text/push-to-talk; every band rejects unrestricted chat.
   Separately, P0 `ChildCoachRequest` construction rejects every band other than `9_11`.
3. Child requests fail for the wrong Child, task, version, lifecycle, or unapproved assignment.
4. Coach output cannot change definition of done, reward, safety, privacy, or assignment.
5. Parent input remains unchanged before explicit suggestion acceptance and after **Keep mine**.
6. Timeout, failure, malformed Parent result, and safety rejection retain input and return
   `guide_recycling_refine_v1` with honest fallback metadata.
7. Parent summary rejects every prohibited judgment class and falls back to the prepared seven-day
   summary. Each bounded fact correction is local, changes only one indexed fact, revalidates both
   languages, rejects unknown fields/prohibited language, and cannot invoke a provider or free chat.
8. Coach rejects secrets, attachment, emotional disclosure, diagnosis, religious judgment,
   hazardous action, and continued-conversation language.
9. Prepared fixtures have the exact IDs, disclosure, origin, steps/cue, and no live label.
10. Missing image/audio returns description/transcript and leaves submission available.
