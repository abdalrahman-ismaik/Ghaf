# Feature Specification: Bounded Live AI Drafting and Coach

**Feature Branch**: `004-bounded-live-ai` (proposed; no branch created)

**Created**: 2026-09-07

**Status**: APPROVED FOR DEFAULT-OFF IMPLEMENTATION — RELEASE ACTIVATION BLOCKED

**Input**: Define independently gated Parent task drafting and optional live Child Coach
transformations without weakening Feature 003's deterministic, private, Parent-approved journey.

This is a new feature rather than a Feature 003 amendment. Feature 003 FR-219 and the current
product/limitations records deliberately put broader mission generation and live Child Coach
outside the approved P0 contract. The product owner approved all three stages on 2026-09-07:
Feature 4 Parent drafting, Feature 5 bounded text, and Feature 5 real push-to-talk voice. Keeping
this feature separate preserves Feature 003 as the active fallback and prevents implementation
approval from being mistaken for release activation.

The detailed archaeology, data inventory, architecture, threat model, test matrix, evidence gates,
and approval decisions are in [approval-packet.md](approval-packet.md).

## Authorization Boundary

- This document authorizes independently flagged, default-off implementation and
  synthetic/fake-provider testing for all three stages. It does not authorize activation,
  deployment, a real provider request, or real Child data in development or test evidence.
- Feature 4 Parent drafting, Feature 5 text Coach, and Feature 5 voice are separate stages with
  independent default-off flags and release gates.
- Feature 5 voice approval is limited to visible, one-shot push-to-talk and transcript review for
  guardian-enabled ages 12–14. Its activation remains separately blocked until every voice,
  consent/privacy, safeguarding, provider, and physical Android gate passes.
- A server-only MCP projection is authorized for synthetic/local integration evidence only. It is
  independently default off, reuses the Parent-drafting and Child-text boundaries, is never
  imported by Expo, and is not a connection step for judges or families.
- The deterministic Parent Guide, Child Coach, summary, media, voice rehearsal, profile helper,
  service registry, reset, and complete competition journey remain the mandatory default.
- No provider credential may enter Expo source, an `EXPO_PUBLIC_` variable, source control, logs,
  screenshots, fixtures, or generated artifacts.

## User Scenarios & Testing

### User Story 1 — Parent drafts from a reviewed archetype (Priority: P1)

A Parent chooses a reviewed, non-sensitive task archetype and bounded planning options. Ghaf may
propose clear Arabic and English wording and ordered steps, while the selected template continues
to own safety, recognition, phase, award, privacy, landscape, and eligibility values.

**Why this priority**: It adds visible model value while retaining the Parent as author and every
existing business authority as deterministic.

**Independent Test**: With only the Parent-drafting flag enabled and a synthetic authenticated
Parent fixture, request a suggestion, compare it with the retained input, accept, keep, and edit it,
then continue through the existing review and approval path. Repeat with the network denied and
confirm the same-attempt prepared result.

**Acceptance Scenarios**:

1. **Given** a Parent session and an allowlisted task archetype, **when** the Parent requests a
   draft, **then** the app displays a bounded bilingual suggestion as an untrusted diff and changes
   no task until the Parent explicitly accepts or edits it.
2. **Given** an accepted suggestion, **when** it is mapped into a draft, **then** the task retains
   the exact deterministic template identity, safety, recognition mode, routine phase, recurrence,
   fixed award, visibility, landscape, Challenge Leaf, Circle, and Family Reward decisions.
3. **Given** provider failure, timeout, refusal, malformed output, unsafe output, or stale state,
   **when** the request settles, **then** Ghaf uses the prepared result for the same attempt or
   rejects the stale result without changing the Parent's draft.
4. **Given** a suggestion that is accepted and reviewed, **when** the Parent approves assignment,
   **then** the existing task lifecycle remains the only authority that makes the task visible to
   the Child.

---

### User Story 2 — Child receives bounded live text help (Priority: P2)

With explicit guardian enablement and an approved live-data boundary, a Child can invoke one
allowed, task-scoped intent. Ghaf returns one terminal coaching card or a deterministic safe exit;
it never opens an unrestricted conversation.

**Why this priority**: A live transformation can adapt the current approved task at the moment of
need, but only after the higher child-safety, consent, privacy, authentication, and operational
gates pass.

**Independent Test**: With only the Child-text flag enabled in a synthetic provider sandbox,
exercise every age band and intent against one current Parent-approved reviewed archetype. Verify
the task/version/profile binding, notice and adult exit, terminal result, zero state effects, and
prepared fallback. This test is not release evidence for real Children.

**Acceptance Scenarios**:

1. **Given** an age 6–8 policy, **when** the Child chooses a curated intent, **then** no Child text
   field exists and the provider receives only the intent, coarse age band, locale, per-request
   binding, and server-owned reviewed task context.
2. **Given** an age 9–11 policy, **when** the Child uses structured help, **then** only allowlisted
   template fields are accepted and unrestricted text, voice, media, URLs, contact data, and
   secrets are rejected before the network boundary.
3. **Given** an age 12–14 policy and an unexpired guardian grant, **when** the Child submits bounded
   text, **then** local and server limits apply, sensitive or off-topic input terminates without
   probing, and the provider receives no history or identity.
4. **Given** any successful response, **when** it is displayed, **then** the screen identifies it as
   AI that may be wrong, keeps **Ask an adult** visible, offers no open-ended continuation, and
   changes zero task, Seed, Garden, canopy, Circle, League, or Family Reward state.
5. **Given** guardian disablement, sign-out, reset, pairing expiry/revocation, task/version change,
   or stale correlation, **when** a response arrives, **then** it is discarded and no Child content
   or provider result survives into another profile.

---

### User Story 3 — Guardian controls live Child access and data (Priority: P2)

The guardian receives a purpose-specific explanation, explicitly enables or disables the live text
capability for one Child, can revoke it, and can request deletion of any data the approved design
actually retains. The Child receives an age-appropriate notice and may decline the interaction.

**Why this priority**: Live Child AI cannot be safely separated from access, consent, notice,
revocation, retention, reporting, and operator-accountability behavior.

**Independent Test**: Issue and consume a capability-scoped Parent reauthentication proof, record
a versioned grant for one synthetic profile, confirm the other profile remains disabled, exercise
Child notice/decline, revoke, and verify gateway denial and deletion evidence.

**Acceptance Scenarios**:

1. **Given** the default state, **when** a Child opens Coach, **then** live text is off and the
   deterministic Coach remains available.
2. **Given** a Parent without fresh reauthentication, **when** live text is enabled, **then** the
   request is rejected and no grant is recorded.
3. **Given** a valid one-Child grant, **when** another Child, device, household, task, or expired
   session attempts use, **then** authorization fails before inference.
4. **Given** revocation or deletion, **when** a pending or replayed request arrives, **then** it is
   denied and the evidence ledger records the non-content control event.

---

### User Story 4 — Child reviews a push-to-talk transcript (Priority: P3)

With separate guardian enablement, an eligible 12–14-year-old may make one visible push-to-talk
recording, stop it, review the transcript, delete it or explicitly send the bounded transcript,
and receive the same terminal text Coach response. It never listens in the background and
performs no speaker, face, emotion, personality, truthfulness, or biometric inference.

**Why this priority**: Audio capture and transcription introduce native permission, retention,
metadata, safeguarding, and provider risks that are not implied by approval of text Coach.

**Independent Test**: With only the voice flag enabled in a synthetic native media and
transcription harness, exercise permission denial, start/stop, interruption, backgrounding,
transcript review, edit within bounded text rules, delete-before-send, explicit send, timeout,
network failure, task/profile/grant change, sign-out, and reset. Verify no raw audio reaches the
Coach model, persists after transcription/deletion, or enters logs. This is implementation
evidence only and cannot activate real Child voice.

**Acceptance Scenarios**:

1. **Given** the default state or an ineligible age band, **when** the Child opens Coach, **then**
   the real microphone path is unavailable and the existing synthetic rehearsal remains truthful
   and unchanged.
2. **Given** a valid separate voice grant for a 12–14-year-old, **when** microphone permission is
   denied, **then** Ghaf makes no capture or transcription request and offers bounded text or the
   prepared Coach without pressure to enable the microphone.
3. **Given** visible push-to-talk capture, **when** the Child stops recording, **then** capture
   ends before transcription and no transcript or Coach request is sent automatically.
4. **Given** a transcript draft, **when** the Child chooses delete, **then** audio and transcript
   are discarded, no Coach inference occurs, and a non-content deletion event is recorded.
5. **Given** a reviewed transcript that passes the 12–14 bounded-text policy, **when** the Child
   explicitly sends it, **then** only the minimized transcript enters the same one-turn terminal
   Coach path and raw audio is not forwarded to the Coach model.
6. **Given** backgrounding, interruption, process death, permission change, grant revocation,
   profile/task change, sign-out, reset, transcription failure, or stale correlation, **when** the
   operation settles, **then** capture stops, transient data is cleared, no stale result displays,
   and the prepared path remains usable.
7. **Given** any missing voice-native, privacy/legal, safeguarding, provider-retention, Arabic,
   accessibility, or physical Android evidence, **when** release is evaluated, **then** real Child
   voice activation remains `BLOCKED` even if implementation tests pass.

---

### User Story 5 — Team verifies the bounded AI boundary through MCP (Priority: P3)

The Ghaf team can inspect and invoke the same two bounded text transformations through a local,
server-only MCP endpoint while the mobile experience remains unchanged. Judges see the polished
Parent and Child moments in the app; they do not configure or operate an MCP client.

**Why this priority**: It provides a recognizable, standards-based AI integration artifact for
technical review without adding a second product surface, duplicating policy, or risking the
competition journey.

**Independent Test**: Enable MCP only in the local fake-binding Worker harness, list its
capabilities, and invoke each tool with synthetic authorized inputs. Verify exactly two tools,
strict request/response parity with HTTPS, zero persistent effects, and safe rejection when MCP is
disabled, legacy transport is used, the tool is unknown, or authorization scope mismatches.

**Acceptance Scenarios**:

1. **Given** MCP is disabled, **when** any client requests `/mcp`, **then** the Worker returns a
   safe not-found response and no body, provider call, or capability is exposed.
2. **Given** MCP is enabled in the synthetic harness, **when** a client lists tools, **then** it
   receives exactly `draft_parent_task` and `coach_current_task`, both described as read-only,
   closed-schema, bounded transformations.
3. **Given** a valid operation-scoped capability, **when** either tool is called, **then** it uses
   the same operation handler, schema, safety validation, limits, and response DTO as HTTPS.
4. **Given** an unknown tool, wrong protocol revision, missing required metadata, replayed token,
   or mismatched role/scope/grant, **when** a call arrives, **then** it fails before inference and
   exposes no request content in logs or errors.
5. **Given** the native judge journey, **when** Parent drafting and Child coaching are demonstrated,
   **then** no MCP terminology, setup, credential, or connection step appears in the family UI.

### Edge Cases

- The provider returns valid JSON with unknown keys, a wrong schema/operation version, wrong
  request/binding correlation, non-equivalent Arabic and English, a refusal, partial output, or an
  incomplete response.
- A Parent edits the draft, changes archetype, changes Child, reviews, signs out, or resets while a
  request is pending.
- A Child changes task/version/profile, signs out, loses pairing, declines notice, or has a grant
  revoked while a request is pending.
- An age-band boundary changes after the request was formed.
- Bounded text uses mixed bidirectional text, Unicode confusables, encoded contact details, prompt
  injection, threats, self-harm/crisis language, sexual content, religious questions, medical or
  food-safety questions, or an attempt to continue the conversation.
- A request omits `Content-Length`, streams past the body limit, repeats an idempotency key, exceeds
  rate or budget limits, or arrives from an originless native client with an invalid credential.
- Provider output passes structure but changes meaning, weakens the adult-help boundary, introduces
  unsafe actions, or tries to assign an authority field through prose.
- Microphone permission is unavailable, restricted by the OS, revoked mid-capture, or requested by
  a stale/ineligible profile; an audio route interruption, app background, or process death occurs.
- A captured clip is silent, too short, oversized, over the time limit, corrupt, unsupported,
  contains background speech or personal data, or yields an unsafe, incomplete, or low-confidence
  transcript.
- The network is unavailable and the app must remain fully usable, bilingual, resettable, and
  demonstrable.
- An MCP client sends a legacy initialization request, wrong protocol revision, missing routing
  headers, an unknown tool, a tool/scope mismatch, unknown arguments, or requests resources,
  prompts, sampling, roots, tasks, apps, voice, or media capabilities.

## Requirements

### Functional Requirements

#### Common authority and fallback

- **FR-001**: Feature 4 Parent drafting, Feature 5 text Coach, and Feature 5 voice MUST use three
  independent flags that default off; no flag may be inferred from another.
- **FR-002**: The deterministic service registry and prepared providers MUST remain the default and
  complete same-attempt fallback for every accepted intent and failure mode.
- **FR-003**: Screens MUST use service interfaces and store actions; they MUST NOT import concrete
  remote providers or provider SDKs.
- **FR-004**: Every remote request and response MUST use an exact operation and versioned strict
  schema that rejects unknown keys.
- **FR-005**: A remote result MUST be treated as untrusted and revalidated locally for schema,
  safety, correlation, authorization, active profile, task/version, consent version, and staleness.
- **FR-006**: No AI request or interaction may award or deduct Seeds, change task completion, League
  score/rank, Circle activity, Family Reward progress, landscape/Garden/canopy growth, badge or
  learning evidence, or any other persistent authority.
- **FR-007**: Sign-out and reset MUST cancel or invalidate pending requests and clear transient
  result/correlation state without weakening the exact Feature 003 reset.
- **FR-008**: Runtime activation MUST remain `BLOCKED` without a trusted token broker and real
  Parent/Child authorization boundary; a static credential in a distributed app is prohibited.

#### Feature 4 — Parent task drafting

- **FR-009**: Feature 4 MUST accept curated selections from reviewed, non-sensitive archetypes; its
  initial allowlist is `task_recycling_p0_v1`, `GI01`, `HR02`, and `LW01`. Enabling execution of a
  currently display-only template requires its existing independent lifecycle/content approval.
- **FR-010**: Faith, affection, emotional disclosure, relationship closeness, hygiene,
  disability-related routines, food intake/body scoring, Family Reward content, and every category
  marked `named_human_review_required` MUST be excluded from open generation.
- **FR-011**: The request MUST use coarse age band and curated planning values; it MUST NOT include
  a Child/Parent name or nickname, household/profile/task database identifier, notes, media,
  contact/location/device data, evidence, accommodations, reward amount, reflection, history, or
  free-form family content.
- **FR-012**: `ParentTaskDraftSuggestionV1` MAY contain only correlation, selected archetype,
  bilingual title/action/rationale, one to four bilingual ordered steps, and a bounded adult-help
  prompt. It MUST NOT contain business-authority fields.
- **FR-013**: A deterministic mapper MUST render the accepted ordered steps into the current
  task-draft `definitionOfDone` representation and copy only the allowlisted wording fields.
- **FR-014**: The mapper MUST retain the selected `TaskTemplate`'s identity, category, landscape,
  child age bands, effort authority, permitted-help rule, supervision authority, complete safety
  boundary, evidence/reflection policy, recognition mode, routine phase, recurrence, displayed
  award, visibility, Circle eligibility, privacy notice, origin, and all League/Family Reward
  eligibility decisions.
- **FR-015**: The UI MUST show retained input and proposed copy, live/prepared origin, fallibility,
  and Parent authority; it MUST support accept, keep, and edit before the existing review step.
- **FR-016**: A suggestion MUST never autonomously create, assign, approve, confirm, recognize, or
  establish activity/visit/environmental proof.

#### Feature 5 — live Child Coach text

- **FR-017**: Feature 5 MUST operate only on the current Parent-approved, chosen or in-progress
  task/version for the active authorized Child and one allowlisted intent.
- **FR-018**: Ages 6–8 MUST have curated intent controls only and no Child text, voice, or media
  input; ages 9–11 MUST have structured template fields only and no unrestricted text; ages 12–14
  MAY have guardian-enabled bounded text and, under the separate requirements below, an explicitly
  reviewed push-to-talk transcript. No age band may send raw audio to the Coach model.
- **FR-019**: The initial live Coach allowlist MUST use server-owned reviewed task content selected
  by public archetype/catalog version. Arbitrary Parent-authored task text MUST use deterministic
  Coach fallback until separately approved minimization and PII controls exist.
- **FR-020**: A live Coach response MUST be one terminal card containing only correlation,
  disposition, bilingual bounded steps/cue/optional reflection/reviewed phrase, and `terminal=true`.
  It MUST include no continuation token, memory key, tool call, business field, or model-selected
  link.
- **FR-021**: The UI, not model output, MUST supply the reviewed bilingual AI disclosure and the
  always-visible **Ask an adult** action.
- **FR-022**: Off-topic, sensitive, crisis, unsafe, sexual, medical, food-safety, religious,
  secret/exclusivity/dependency, contact/location, and adversarial input MUST terminate through a
  reviewed deterministic route without asking for more detail.
- **FR-023**: No age band may receive unrestricted chat, cross-turn transcript, provider memory,
  browsing, retrieval, tool use, household history, or automatic conversational retry.
- **FR-024**: Each response MUST preserve Modern Standard Arabic safety meaning and equivalent
  English; dialect, gendered, religious, and cultural variants require named human approval.

#### Consent, privacy, and operations

- **FR-025**: Feature 5 text MUST default off per Child and require a versioned, purpose-specific,
  time-bounded guardian grant created after Parent reauthentication plus a visible age-appropriate
  Child notice and decline path.
- **FR-026**: Revocation, grant expiry/version change, sign-out, reset, device revocation, pairing
  expiry/revocation, or task/profile change MUST invalidate pending and replayed calls before
  display.
- **FR-027**: Data minimization MUST occur before the network boundary. Raw prompts/responses,
  credentials, Child text, names, and task content MUST NOT enter ordinary application, gateway,
  provider-adapter, analytics, or error logs.
- **FR-028**: Operational records MAY contain only documented non-content fields such as operation,
  schema version, coarse age band, outcome category, latency bucket, fallback reason, rate-limit
  bucket, deployment version, and random request correlation, under a bounded retention schedule.
- **FR-029**: Provider training, retention, residency/region, subprocessors, deletion, abuse
  monitoring, and incident handling MUST have direct evidence and privacy/legal approval. If an
  OpenAI service processes personal data for a Child under 13 or the applicable digital-consent
  age, zero data retention MUST be implemented before use; `store:false` alone MUST NOT be treated
  as proof of zero data retention.
- **FR-030**: An approved incident playbook MUST define reports, high-risk escalation, authorized
  operator roles, evidence access, deletion holds, Child/guardian notification decisions, provider
  escalation, and rollback/kill-switch ownership without relying on unrestricted content logging.
- **FR-031**: The gateway MUST enforce HTTPS, short-lived scoped credentials, authorization before
  inference, exact path/method/content type/origin rules, body limits measured after reading, rate
  and budget limits, concurrency limits, no-store responses, strict schemas, timeout/cancellation,
  replay protection, and fail-closed error mapping.
- **FR-032**: Provider/model/prompt/schema/catalog changes MUST be pinned, evaluated against the
  bilingual safety corpus, reviewed, versioned, and independently roll-backable.
- **FR-033**: Real Child photos and video remain excluded from this feature.

#### Feature 5 — real push-to-talk voice

- **FR-034**: Real voice MUST be available only to ages 12–14 with separate, unexpired guardian
  voice and live-Coach grants, fresh age-appropriate notice, and an independent default-off flag;
  text approval or synthetic `voiceGranted` state MUST NOT imply real-voice authorization.
- **FR-035**: Capture MUST be a visible, user-held push-to-talk action for one clip, MUST stop on
  release and on every interruption/background/route-exit/revocation/reset boundary, and MUST NOT
  support continuous listening, background capture, wake words, or automatic restart.
- **FR-036**: The Child MUST be able to review the resulting transcript, delete audio and
  transcript before sending, or explicitly send. Recording, transcription completion, or
  transcript display MUST NOT automatically invoke the Coach.
- **FR-037**: A sent transcript MUST pass the same normalization, 240-Unicode-scalar,
  512-UTF-8-byte, topic, contact, URL, secret, sensitive, crisis, and adversarial rules as bounded
  12–14 text. Unsafe or ineligible transcripts MUST terminate locally without probing.
- **FR-038**: Raw audio MUST go only to the approved transcription boundary, MUST NOT be forwarded
  to the Coach model, persisted in application state, analytics, logs, crash reports, or ordinary
  backups, and MUST be deleted after transcript delivery, explicit deletion, cancellation,
  timeout, failure, sign-out, or reset according to the approved deletion evidence.
- **FR-039**: Voice processing MUST NOT perform or derive speaker identity, biometric templates,
  emotion, personality, truthfulness, religiosity, health, diagnosis, risk, accent, gender, age,
  or household-background inference; it MUST NOT retain voiceprints or reuse audio for training.
- **FR-040**: Permission denial, unavailable hardware, silence, duration/size violation,
  interruption, transcription refusal/failure/low confidence, network loss, or stale state MUST
  return to bounded text or the same prepared Coach path without loss of task state or pressure to
  grant microphone access.
- **FR-041**: Real voice release MUST remain blocked until the named native Android, privacy/legal,
  safeguarding, provider/ZDR, Arabic voice, accessibility, deletion, incident, and human-rehearsal
  gates pass on the exact candidate build; implementation approval and synthetic harness evidence
  cannot satisfy those gates.

#### Server-only MCP projection

- **FR-042**: The Feature 004 Worker MAY expose one `/mcp` endpoint only behind a server-only
  switch that defaults false. The Expo application MUST NOT import an MCP SDK or call that route.
- **FR-043**: The endpoint MUST implement only the current stateless MCP Streamable HTTP revision
  selected by the pinned server SDK and MUST reject legacy session/initialization behavior.
- **FR-044**: MCP MUST advertise exactly two tools: `draft_parent_task` and
  `coach_current_task`. It MUST NOT advertise voice/media, resources, prompts, sampling, roots,
  tasks, apps, accounts, Garden, League, rewards, persistence, or any other capability.
- **FR-045**: Each MCP tool MUST project the corresponding HTTPS operation's same closed input and
  output schemas and MUST call the same handler, prefilter, post-validator, timeout, and safe error
  mapping. MCP-specific prompts or duplicated policy logic are prohibited.
- **FR-046**: Tool calls MUST verify the short-lived capability plus exact operation, role, and
  replay status before parsing arguments; subject/grant binding, rate, concurrency, and budget
  controls MUST all pass before inference. Content-free discovery MAY be available only while the
  MCP switch is enabled.
- **FR-047**: Tool results MUST return the existing structured DTO plus a short non-sensitive text
  summary, declare read-only/destructive-false/open-world-false hints, and create zero application
  or business-authority state.
- **FR-048**: Disabling MCP MUST make `/mcp` unavailable without changing HTTPS operations,
  prepared providers, app flags, or the complete offline competition journey.
- **FR-049**: MCP names, transport details, credentials, and setup instructions MUST remain outside
  the Parent/Child UI and normal judge journey.
- **FR-050**: Public discovery, OAuth, remote judge access, hosted deployment, and production MCP
  security/readiness claims are outside this MVP and remain blocked until separately specified.

### Key Entities

- **ParentTaskDraftRequestV1**: Minimized curated Parent selections plus a random request/binding
  correlation; contains no household or Child identity.
- **ParentTaskDraftSuggestionV1**: Untrusted bilingual wording proposal with no business authority.
- **TaskAuthoritySnapshotV1**: Local immutable snapshot/digest of the selected deterministic task
  template and active draft revision used to reject changed or stale results.
- **ChildCoachRequestV1**: One age-policy/intent request bound through a random nonce to the current
  approved task without transmitting local profile or assignment identifiers.
- **ChildCoachResponseV1**: One terminal bilingual coaching result with a safe disposition and no
  continuation state.
- **LiveChildCoachGrant**: Versioned, purpose-specific, per-Child guardian decision with notice
  version, capability (`text` or `voice`), reauthentication proof reference,
  issue/expiry/revocation times, and no provider secret.
- **VoiceCaptureEnvelopeV1**: Ephemeral one-clip capture state containing only random correlation,
  timing/size bounds, locale, permission/capture state, and deletion status; no identity or
  inference attributes.
- **VoiceTranscriptDraftV1**: Ephemeral transcript shown for review before explicit send and
  validated by the same bounded 12–14 text policy; never conversation history.
- **AiControlEvent**: Non-content operational record for authorization, fallback, rate, safety,
  deletion, incident, flag, and rollback evidence.

## Success Criteria

### Measurable Outcomes

- **SC-001**: With all new flags off, 100% of the existing deterministic competition journey and
  reset tests pass with no network request.
- **SC-002**: Across the approved Parent drafting corpus, 100% of mutations to safety, award,
  category, landscape, privacy, recognition, phase, recurrence, Circle, Challenge Leaf, or Family
  Reward authorities are rejected before draft acceptance.
- **SC-003**: For network, timeout, provider 4xx/5xx, refusal, incomplete, schema, safety, auth, rate,
  and stale failures, 100% of accepted intents return the same-attempt deterministic fallback or a
  safe terminal denial without losing current state.
- **SC-004**: In automated adversarial tests, 100% of unknown fields, oversized payloads,
  mismatched correlations, replay, cross-profile/task/version requests, prohibited age-band input,
  and open-ended continuation attempts are denied before state mutation.
- **SC-005**: Every displayed Child result has one reviewed AI disclosure, one always-visible adult
  exit, no conversation continuation, and zero persistent task/reward/growth/social effects.
- **SC-006**: Arabic and English schema/content test cases have complete decision, safety, and
  fallback parity; named Arabic review records zero unresolved safety-critical meaning defects
  before release.
- **SC-007**: Real-network, physical Android, safeguarding, privacy/security, provider-retention,
  legal/consent, and rehearsal results are independently recorded as `PASSED`, `FAILED`, `BLOCKED`,
  or `NOT RUN`; no source test substitutes for those gates.
- **SC-008**: A reviewer can answer who authored the suggestion, who approved the task, what the AI
  changed, what data crossed the boundary, and why no reward changed in at least 3 of 3 observed
  rehearsals before release.
- **SC-009**: In the exact Android voice release candidate, 100% of permission denial,
  backgrounding, interruption, process-death, revoke, delete, failure, sign-out, and reset cases
  stop capture and leave no accessible audio, transcript, stale result, or raw-content log entry.
- **SC-010**: Across 100% of accepted voice attempts, the Child explicitly starts and stops one
  recording, reviews the transcript before send, and the Coach receives text only after an
  explicit send action; no audio is sent to the Coach model.
- **SC-011**: In local fake-boundary tests, MCP tool discovery returns exactly two tools and 100%
  of accepted calls match the corresponding HTTPS operation's structured success or safe error
  contract with zero persistent effects.
- **SC-012**: In automated MCP tests, 100% of disabled-endpoint, legacy-revision, missing-header,
  unknown-tool, unknown-argument, replay, and operation/role/grant mismatch cases fail before
  inference, and no MCP package is reachable from the Expo bundle.

## Assumptions

- The 2026-09-07 product approval authorizes only default-off code and synthetic provider/media
  harness evidence for all three stages. It does not authorize release activation, deployment,
  provider execution, or real Child data in development/testing.
- The current Expo access/session system is intentionally synthetic and cannot mint a trusted
  remote credential. A production-grade or competition-approved broker/authorization boundary is
  a prerequisite, not an implementation detail to infer.
- The initial Parent drafting inputs are curated; adding Parent free text to the remote request is
  a later privacy/safety amendment.
- The initial live Child Coach supports reviewed catalog/archetype context only. Arbitrary custom
  tasks remain on the deterministic Coach.
- A single model call is attempted per user action. There is no model repair retry; fallback is
  deterministic.
- Judges use only the native Ghaf journey. MCP is an implementation-quality proof for the team and
  technical review, not a judge-operated integration or a voice tool.
- Provider choice remains open. Any adapter must meet the same contract. If OpenAI is chosen,
  current official under-18, safety, storage, structured-output, and moderation guidance must be
  rechecked at implementation and release review.
- Legal, safeguarding, Arabic/UAE cultural, privacy/security, and Android reviewers must be named
  before their gates can pass.
