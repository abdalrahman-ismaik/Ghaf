# Codex handoff: AI Features 4 and 5

Copy the prompt below into a separate Codex session that starts from the latest Ghaf integration
branch. This prompt is a work order for specification and safety approval first. It is not approval
to ship live mission generation or a live Child Coach.

## Copy-paste prompt

```text
You are working in /home/smyk/projects/Ghaf on the latest integration branch.

Objective

Professionally define and, only after explicit product approval, implement two future Ghaf AI
capabilities:

4. Parent-facing AI mission/task drafting: redesign the historical food-rescue/general mission
   generator from origin/002-ghaf-core-mvp so it produces bounded suggestions compatible with the
   current Feature 003 task lifecycle and safety model.
5. Optional live Child Coach: design a task-scoped, age-banded live transformation behind a secure
   server boundary. The current Feature 003 P0 contract explicitly prohibits this capability, so
   begin with a proposed safety/privacy/consent/spec amendment and do not implement runtime code
   until I explicitly approve that amendment.

Authorization boundary

- This prompt authorizes read-only repository/branch archaeology and proposed specification,
  architecture, threat/privacy analysis, test planning, and approval-gate documents.
- It does not override AGENTS.md, the constitution, Feature 003, or the prohibition on live Child
  Coach and general AI-generated task behavior in P0.
- Do not implement, activate, deploy, or call a real provider for Feature 4 or 5 until you present
  the proposed contract and I explicitly approve implementation.
- Do not treat my request for a proposal as approval. Stop at the approval gate.
- Never add a provider secret to Expo, EXPO_PUBLIC_ variables, source control, logs, screenshots,
  test fixtures, or generated artifacts.
- Do not push, merge, deploy, rewrite history, or modify Feature 002 historical evidence.

Required repository preparation

1. Read the repository AGENTS.md and then, in its required order:
   .specify/memory/constitution.md;
   specs/003-family-growth-garden/spec.md, plan.md, and tasks.md;
   PRODUCT.md; RESEARCH_BASIS.md; DESIGN.md; DESIGN_DIRECTION.md;
   docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md;
   specs/003-family-growth-garden/design-intake/growth-journey-preflight.md;
   PROTOTYPE_LIMITATIONS.md; TEAM_OWNERSHIP.md; and DEMO_RUNBOOK.md.
2. Run git status --short, git branch --show-current, and git log -1 --oneline. Preserve every
   unrelated or user-owned change.
3. Check TEAM_OWNERSHIP.md before reserving files. Do not overlap with the AI Services 1-3
   integration window or another active owner. If it is still active, restrict yourself to
   read-only analysis and a new, non-overlapping proposal document until ownership is released.
4. Inspect, but do not copy blindly, the historical implementation on origin/002-ghaf-core-mvp:
   src/services/remote/GatewayAIService.ts, workers/ghaf-ai/src/index.ts,
   src/features/missions/, src/features/ai/, associated models/tests, and docs/AI_SETUP.md.
5. Compare it to current task, assistant, access, privacy, service-registry, state, i18n, and test
   boundaries. Document incompatibilities. At minimum, call out the old mission schema, permissive
   CORS, absent gateway authentication/rate limiting, long timeout, obsolete service contract, and
   obsolete Child Coach authorization.

Phase 1 deliverable: proposed amendment only

Use the project's Spec Kit workflow and author a proposed amendment, not an approved contract.
Prefer two independently flaggable workstreams because Feature 4 and Feature 5 have different risk
and approval gates. Decide, with repository evidence, whether these belong in a new feature spec or
an explicitly marked future Feature 003 amendment. Do not edit the Spec Kit-managed AGENTS.md
block manually.

The proposal must include:

A. Product definitions and exclusions

- Feature 4 is a Parent drafting assistant, not autonomous assignment. A model may propose bounded
  bilingual wording and steps from curated Parent inputs; it cannot approve, assign, confirm,
  recognize, award Seeds, choose visibility, declare League/Green/reward eligibility, advance a
  landscape, or produce a visit/activity proof.
- Map accepted output into the current Task draft/review/Parent-approval lifecycle. The existing
  Task, TaskTemplate, recognition mode, routine phase, category, safety, visibility, fixed award,
  landscape, Challenge Leaf, Circle, and Family Reward authorities remain deterministic.
- Do not revive the historical food-rescue payload as the current domain model. Specify an
  additive, versioned suggestion DTO and an explicit mapper into the current task draft.
- Begin with reviewed, non-sensitive sustainability/task archetypes. Faith, affection, emotional
  disclosure, relationship closeness, hygiene, disability-related routines, food intake/body
  scoring, and other protected/private activities must not become open-generation topics.
- Feature 5 supports only the current Parent-approved task and only the allowed intent for that
  turn. It is not open chat, a companion, therapist, confidant, religious authority, emotion
  detector, truthfulness judge, diagnosis tool, or replacement Parent.
- Keep real Child photo/video analysis out of the initial proposal. Treat real voice as a separate
  higher-risk release stage with native-device evidence, explicit guardian enablement, visible
  push-to-talk, delete-before-send, no background listening, retention rules, and its own approval.

B. Child-safety and age-band contract

- Ages 6-8: curated intent buttons only; no Child free text. If a provider is used, it receives the
  selected intent and minimum approved task context, not an open Child message.
- Ages 9-11: structured intents/template fields only, with fixed limits and no unrestricted text.
- Ages 12-14: guardian-enabled bounded text may be proposed, with length/topic limits, local and
  server validation, clear stop conditions, and no unrestricted conversation. Voice is not implied.
- Every response must disclose that it is AI and may be wrong, keep an always-visible Ask an adult
  exit, avoid emotional dependency/exclusivity/secrets, and terminate safely for off-topic,
  sensitive, crisis, unsafe, or adversarial input without probing for details.
- Specify deterministic, bilingual fallback behavior for every accepted intent and failure mode.
  The app must remain fully demonstrable offline.
- Modern Standard Arabic is the safety default. Gulf/Emirati encouragement, gendered wording,
  religious content, and cultural variants require named human review before release.

C. Privacy, consent, and data governance

- Produce a data-flow diagram and field-level allowlist for each request and response. Apply data
  minimization before the network boundary.
- Explicitly prohibit nicknames/real names, household identifiers, Parent notes, media, secrets,
  exact age, location, contact data, device identifiers, sensitive category details, reward
  amounts, evidence, accommodations, emotional disclosures, and cross-household data unless a
  separately approved necessity and control exists. Prefer coarse age band and opaque per-request
  correlation identifiers.
- Define guardian enable/disable, informed consent, age-appropriate Child notice/assent, revocation,
  deletion, retention, provider training/zero-retention expectations, regional processing review,
  access control, audit data, incident response, and operator access. Do not claim legal compliance
  without counsel and direct evidence.
- Separate sensitive logs from content. Specify that raw prompts/responses, credentials, and Child
  text are not logged. Define safe metrics, redaction, bounded retention, and deletion evidence.

D. Architecture and security contract

- Use the existing service registry. Screens must never import a concrete provider.
- Keep independent default-off flags for mission drafting and live Child Coach. The deterministic
  provider remains the default and same-attempt fallback.
- Put all provider access behind a server-side gateway with HTTPS, authentication/authorization,
  per-user/household and abuse-aware rate limits, small body limits, exact route/method allowlists,
  origin policy, no-store responses, strict request/response schemas, request correlation, timeout,
  no automatic conversational retry, and fail-closed local revalidation.
- Define how a trusted client obtains a short-lived gateway credential. A static secret embedded in
  a distributed mobile app is unacceptable. If no approved token broker and real Parent/Child
  authorization boundary exist, runtime activation remains BLOCKED.
- Treat model output as untrusted. No tool use, browsing, memory, retrieval of household history,
  cross-turn transcript, or arbitrary model-selected business fields in the first release.
- Pin operation/schema versions and define provider/model changes, rollback, kill switch, budget
  cap, concurrency, outage, malformed output, prompt injection, replay, and stale-response handling.

E. State-machine and authority requirements

- Diagram the full sequence for Feature 4:
  Parent structured input -> local validation -> gateway -> strict validation -> displayed diff ->
  Parent accepts/keeps/edits -> Task draft -> existing review -> existing Parent approval.
- Diagram the full sequence for Feature 5:
  approved current task -> age policy -> allowed intent -> consent/capability checks -> minimized
  request -> gateway -> strict safety validation -> bounded response or deterministic fallback ->
  no reward/state change.
- Specify stale-response protection, cancellation, idempotency, reset, sign-out, profile isolation,
  pairing expiry/revocation, and Parent reauthentication where appropriate.
- AI calls and learning/coach interactions create zero Seeds, zero League score, zero Circle event,
  zero Family Reward progress, and zero persistent garden/canopy growth.

F. Acceptance criteria and test matrix

Include executable acceptance criteria and tests for:

- strict schema rejection of unknown keys, wrong task/version/profile/request correlation, changed
  safety/award/privacy/eligibility fields, oversized input, invalid Arabic/English parity, malformed
  model output, unsafe content, stale responses, and replay;
- auth before inference, authorization/profile isolation, rate limiting, origin/method/path/body
  limits, timeout, cancellation, no retry, no-store, secret scanning, and no content logging;
- exact same-attempt deterministic fallback for network, timeout, provider 4xx/5xx, schema, and
  safety failures;
- all three age bands and their input restrictions, guardian enable/disable and revocation, Child
  notice, Ask an adult, off-topic/sensitive/crisis/unsafe termination, prompt injection, and no
  open-ended continuation;
- Parent diff/accept/keep/edit/review behavior for mission drafts, with no authority or reward
  mutation before the existing confirmation path;
- Arabic-first RTL/LTR parity, long labels, mixed bidi, reduced motion, accessibility, Android
  keyboard/Back/permission behavior, offline reset, and no cross-profile leakage;
- flags default off and no change to the deterministic competition journey when off.

G. Evidence gates

Define PASS/FAIL/BLOCKED/NOT RUN gates separately for repository tests, local gateway tests,
provider sandbox, security/privacy review, named Arabic human review, legal/consent review, Android
physical-device behavior, real-network failure, and rehearsal. Source inspection cannot pass native
or human-review gates.

Approval-gate response

At the end of Phase 1, give me:

1. A concise repository-grounded gap analysis of the historical code.
2. The proposed spec/amendment paths and a summary of every changed contract.
3. A risk register with severity, likelihood, control, owner, and release gate.
4. A data inventory and request/response allowlist for each age band.
5. An architecture diagram and state sequences.
6. A dependency-ordered implementation plan split into Feature 4, Feature 5 text, and optional
   Feature 5 voice stages.
7. The exact unresolved decisions requiring my approval.
8. A direct question asking whether I approve Feature 4 implementation, Feature 5 implementation,
   both, or neither.

Then stop. Do not write runtime code until I explicitly approve.

Phase 2 instructions after explicit approval

After approval, reread the approved artifacts, reserve exact non-overlapping files, use test-driven
development, and implement the smallest approved vertical slice. Preserve prepared providers and
the complete offline path. Keep routes thin, behavior in src/features, provider adapters in
src/services, and server code isolated under workers or the approved backend. Add bilingual
resources rather than hard-coded UI strings. Make small cohesive commits using the repository's
configured identity. Do not install a new library unless the approved plan records a measured gap.

Run, at minimum:

npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npm run build:web

Also run focused gateway/contract/safety/profile-isolation/reset tests and perform the approved
Android/manual evidence gates. Report exact commands and PASS/FAIL/BLOCKED/NOT RUN evidence. Do not
claim deployment, live Child safety, privacy compliance, production authentication, real media,
or production readiness without direct evidence.
```

## Current interpretation

- Feature 4 is not the already-approved optional live Parent Guide. It is broader Parent-facing
  mission/task drafting and needs a product-contract amendment before implementation.
- Feature 5 remains expressly prohibited in the current P0 contract. No approval for live Child
  Coach was found in the audited branches or active Feature 003 artifacts.
