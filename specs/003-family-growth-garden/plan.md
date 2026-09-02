# Implementation Plan: Family Growth Garden

**Branch**: `feature/003-family-growth-garden` | **Date**: 2026-08-26 | **Spec**:
[spec.md](./spec.md)

**Status**: Deterministic P0 implementation is authorized after Feature 003 tasks, checklist, and
cross-artifact analysis pass. Physical Android and named human-review acceptance remain open.

**Input**: Feature specification from `specs/003-family-growth-garden/spec.md`

## Summary

Replace the judge-facing Feature 002 food-rescue journey inside the existing Expo application with
one ten-route Family Growth Garden journey. The implementation will evolve the current strict
TypeScript models, Zustand session, service registry, bilingual resources, StyleSheet design
tokens, SVG, Reanimated, and prepared-media seams rather than create a parallel architecture.

The deterministic spine is Parent task drafting and bounded prepared refinement → bilingual
review and assignment → Child choice, start, bounded prepared coaching, and submission → Parent
retry or idempotent confirmation → exactly one fixed 12-Seed recognition transaction → symbolic
Mangrove, household-canopy, and privacy-filtered circle changes. Every required path works with
external services denied. The Child Coach remains prepared-only. No approved secure server boundary
exists in this repository, so live Parent AI is `BLOCKED` for implementation and `NOT RUN` for
validation; it is not a P0 dependency.

## Prototype Capability Decision

| Classification             | Feature 003 implementation decision                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real prototype interaction | Ten-route navigation, Arabic/English direction, synthetic role/Child choice, Parent review/approval, Child lifecycle actions, kind retry, praise editing, idempotent confirmation, symbolic counters/growth, privacy filtering, reset |
| Seeded local content       | Al Noor household, Salem and Alya, two or three approved preview-choice fixtures, eight categories, five landscape tracks, cousin-circle aggregate, initial counters                                                                  |
| Prepared content           | Parent Guide, Child Coach, Parent summary, recycling image/audio, disclosures, deterministic fallback; every result labeled at point of use                                                                                           |
| Blocked/nonblocking        | Optional live Parent refinement: no approved deployable server boundary or direct evidence; keep `BLOCKED`/`NOT RUN`                                                                                                                  |
| Future/out of scope        | Live Child AI, real media capture/processing, real accounts or family sharing, persistence guarantees, analytics, notifications, production backend, impact conversion, deployment                                                    |

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode (`noUncheckedIndexedAccess`) on Node.js
22.13+; React 19.2 and React Native 0.86 through Expo SDK 57

**Primary Dependencies**: Existing Expo Router 57, React Native `StyleSheet`, Zustand 5, Zod 4,
React Hook Form, `i18next`/`react-i18next`, `expo-localization`, `react-native-svg`, Reanimated 4,
Gesture Handler, Safe Area Context, Screens, and `expo-audio` prepared playback. No new library is
introduced. The integration owner applied Expo-compatible patch alignment within the existing SDK
57 stack: Expo `57.0.15 → 57.0.17`, Expo Linking `57.0.7 → 57.0.8`, Expo Router
`57.0.15 → 57.0.17`, React Native `0.86.2 → 0.86.3`, and ESLint Config Expo
`57.0.1 → 57.0.2`; `package-lock.json` records the corresponding transitive patch resolution.

**Storage**: In-memory, schema-versioned Zustand prototype session plus deterministic local typed
fixtures. Reload persistence is deliberately not promised; the Parent-only reset is authoritative.

**Testing**: Vitest pure-policy, contract, state, reset, and end-to-end store-flow tests; TypeScript,
Expo ESLint, Prettier, Expo dependency/config checks, static web export, route inventory, secret/
network scan, and manual web/native journey evidence

**Target Platform**: Android physical device is authoritative; iOS is convenient compatibility;
web is a secondary development, screenshot, and flow-inspection surface

**Project Type**: One Expo/React Native mobile application with file-based routing; no backend,
second application, monorepo, or production service

**Performance Goals**: Press feedback is immediate; prepared results do not simulate extended
thinking; the Seed/growth explanation settles in at most the approved 650 ms motion window or is
immediate with reduced motion; five uninterrupted human journeys target at most 150 seconds each

**Constraints**: Exact ten-route inventory; Arabic-first reset at `/` with no stale history;
external-service-denied completion; synthetic data only; no media permission on the deterministic
path; Parent gates before assignment and recognition; privacy filtering before shared mutation;
exact pre/post counters; 48 dp controls; 200% font-scale resilience; no unsupported impact claim

**Scale/Scope**: One synthetic household, two synthetic siblings, one seeded aggregate circle,
eight curated categories, five landscape tracks, five stages, one executable 12-Seed task, two
prepared assistant interactions, one prepared summary, four prepared fixture identifiers, and ten
authored routes

**Clarifications**: None. The approved spec resolves machine enums, lifecycle separation,
recognition/phase validity, growth thresholds, reset values, fixture IDs, safety copy, capability
labels, and evidence gates.

## Constitution Check — Before Design

_GATE: Passed before Phase 0 research. No unresolved scope or architecture exception remains._

| Principle                           | Plan evidence                                                                                                                                                               | Result |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. MVP Prototype First              | One deterministic competition slice; no production infrastructure or optional breadth on the critical path                                                                  | PASS   |
| II. One Complete Journey            | Parent → Child → confirmation → garden → circle is the only executable spine                                                                                                | PASS   |
| III. Design Is a Core Feature       | The approved Living Family Garden direction, token sync, static growth states, Arabic typography, and restrained cause/effect motion are implementation work                | PASS   |
| IV. Arabic-First, Bilingual         | Arabic is the reset locale; typed bilingual content and logical direction are tested across the same ten decisions                                                          | PASS   |
| V. Mock-First, Replaceable Services | Screens consume registry contracts; deterministic prepared providers complete every required path offline                                                                   | PASS   |
| VI. Keep Architecture Small         | One app, one bounded store, existing libraries, pure policies, and no backend/dependency addition                                                                           | PASS   |
| VII. Visible AI Value               | A visibly prepared Guide transforms a Parent recycling brief into a safer structured task; a bounded Coach and time-bounded Parent summary show the other approved AI roles | PASS   |
| VIII. Honest Prototype Boundaries   | Synthetic, seeded, prepared, fallback, symbolic, blocked, and future capabilities are labeled at point of use                                                               | PASS   |
| IX. Fast Team Collaboration         | Domain/state, UI/i18n, tests, and QA/runbook use disjoint reservations with one integration owner                                                                           | PASS   |
| X. Demo Reliability                 | Exact atomic reset, prepared media/transcripts, same-attempt fallback, idempotency, static outcomes, and offline path protect the demo                                      | PASS   |

Constitution v2.0.0 now states the active durable rule directly: visible AI value is a bounded,
structured, honestly labeled transformation or coaching action under Parent review, and the demo
must meet the active feature's documented internal rehearsal target. Feature 003 satisfies those
rules without carrying Feature 002 evidence forward.

The minimum safeguards remain product behavior, not a new security/compliance workstream. The plan
adds no provider secret, continuous recording, real Child data, production authentication,
financial feature, diagnostic surface, religious judgment, or public Child comparison.

## Architecture

```text
10 thin Expo Router route files
              ↓
shared bilingual UI primitives + bounded feature components
              ↓
intentional Zustand application commands
              ↓
pure lifecycle / recognition / projection / growth / assistant policies
              ↓
central service registry interfaces
              ↓
deterministic prepared providers + local fixtures
```

### Responsibilities and data ownership

- `app/` owns route composition, navigation, and route-local visual state only. Routes do not
  import concrete providers or mutate counters independently.
- `src/models/` owns strict, schema-versioned task, lifecycle, reward, garden, circle, assistant,
  media, and session values. Food-rescue quantities and `ImpactRecord` do not masquerade as Seeds
  or environmental results.
- `src/features/tasks/` owns validation and explicit lifecycle transitions. `chosen` and
  `in_progress` remain separate states.
- `src/features/rewards/` owns the valid recognition/phase matrix, fixed award allowlist,
  recurrence/phase review rules, and one idempotency key per submission.
- `src/features/garden/` owns deterministic thresholds and symbolic landscape/canopy projections.
- `src/features/circle/` owns a deny-by-default projection function. The private recognition
  boundary derives a minimal eligibility context with no Child identity, task record, Seed amount,
  media, reflection, or note; strict projectors validate that context before returning allowlisted
  canopy/circle DTOs and reject unknown shared-candidate fields.
- `src/features/assistants/` owns allowlisted Parent/Child intents, request/result validation,
  prohibited-language checks, origin metadata, deterministic same-attempt fallback, all-band
  interaction-policy tests, and bounded local correction/revalidation of the prepared Parent
  summary's synthetic facts.
- `src/state/` owns one bounded prototype session and application commands. `planConfirmation`
  validates the submission and prepares editable praise without changing a counter. A distinct
  Parent action moves the route into an observable `praise_presented` state; only a second visible
  continuation may call `applyRecognition`. That command checks the ledger first, runs reward and
  privacy policy, then commits the transaction, landscape, canopy, circle, celebration, and phase-
  review payload atomically. A duplicate returns the immutable existing receipt without mutation.
- `src/services/interfaces/` owns provider-neutral task, reward, garden, circle, assistant, media,
  and session contracts. `src/services/mock/` is the required provider. Screens depend only on the
  central registry.
- `src/i18n/` owns interface copy and canonical Arabic/English pairs. Typed fixtures own their
  bilingual domain content; safety-critical Arabic is copied unchanged from `DEMO_RUNBOOK.md`.

### Reset and seeded-choice semantics

The reset has no **active assignment** or submission: no task is selected as current work and no
P0 assignment exists. `/child` may still show two or three local Parent-approved choice fixtures to
satisfy the choice design; these are preview-only catalog assignments at reset. Only the
Parent-created P0 recycling assignment becomes executable in the judge journey. Selecting it moves
`assigned → chosen`, and opening/starting it separately moves `chosen → in_progress`.

`resetPrototype()` replaces the entire session atomically with the canonical schema-versioned
fixture. The route shell then clears/dismisses the current stack and lands on `/` in Arabic RTL;
navigation recovery is not embedded inside the store. Tests exercise state reset separately from
the router history-reset adapter.

### Confirmation transaction ordering

```text
submitted task + Parent decision
  → planConfirmation validates lifecycle and prepares editable praise (zero counter changes)
  → a Parent action renders the final action-specific praise in a praise_presented state
  → a separate visible Parent continuation calls applyRecognition
  → applyRecognition checks the idempotency ledger first and returns immutable stored receipts
  → validate recognition mode / phase / recurrence / fixed award
  → filter household projection before canopy mutation
  → filter circle projection before circle mutation
  → atomically commit allowed Seed, landscape, canopy, and circle deltas
  → expose static final values and optional one-time celebration
```

Recognition cannot be applied from the same event that marks praise presented. Rejected, invalid,
private,
sensitive, non-Green, identity-bearing, Seed-bearing, or duplicate events never reach a shared
visual or shared counter. Duplicate application returns the existing ledger result before reward or
projection work. The circle receives one coarse eligible action, not 12 Seeds and not a task record.

### Route migration

| Keep or add                       | Replaces/retire after integration      | Implementation note                                                                                    |
| --------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/`, `/role`, `/parent`, `/child` | Existing files are rewritten in place  | Preserve reusable shells, language control, and synthetic disclosure while replacing food-rescue state |
| `/parent/task/new`                | `/parent/create`, `/parent/generating` | Generation becomes an in-route bounded assistant state                                                 |
| `/parent/task/review`             | `/parent/review`                       | Full bilingual safety/privacy/recognition approval                                                     |
| `/child/task`                     | `/child/mission`                       | Explicit choose/start, bounded Coach, optional prepared media/reflection                               |
| `/parent/check-in`                | `/parent/confirmation`                 | Retry, equivalent/smaller future choice, praise, idempotent confirm, phase-review state                |
| `/garden`                         | `/celebration`                         | Celebration is a state; garden owns static and animated consequence                                    |
| `/circle`                         | No legacy route                        | Local cooperative aggregate only                                                                       |

The six replaced route files are removed only after all ten new routes resolve and the deterministic
flow passes the route/store smoke test. Historical Feature 002 specifications, screenshots,
runbooks, and evidence remain untouched and attributed to Feature 002.

### Design-system implementation

Use the existing `src/design/tokens.ts` as the single theme entry and extend the established warm
field-paper/botanical-ink system. Synchronize it to `DESIGN.md`: add mangrove, water, water-light,
and coral roles; align the type ramp, 120/220/650 ms motion values, and 20 px phone screen padding.
The audit found 8,309 TS/TSX lines, 13 hardcoded hex values confined to the code-native Ghaf
illustration, token-backed font sizes, only two deliberate zero-spacing values, token-backed radii,
and no legacy native shadow/elevation drift. Keep illustration-local SVG colors documented or move
them to semantic tokens while touching the component; do not add a second theme or UI library.

Build flat tonal Parent surfaces and a more illustrated but non-gamey Child mode. Add only the
shared primitives demanded by the ten routes: explicit button states, origin disclosure, task/
safety/recognition panels, prepared media, bounded assistant sheet, garden tracks, combined canopy,
and circle progress. Verify WCAG 2.2 AA text/essential-UI contrast, enable Android predictive Back
in `app.config.ts`, and retain the router as the only navigation/history authority. Code-native SVG
provides the five static landscape stages; Reanimated only explains confirmation cause/effect,
never controls whether state commits.

## Project Structure

### Documentation (this feature)

```text
specs/003-family-growth-garden/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── checklists/
└── tasks.md
```

### Source code (single existing Expo app)

```text
app/
├── _layout.tsx
├── index.tsx
├── role.tsx
├── parent/
│   ├── index.tsx
│   ├── check-in.tsx
│   └── task/
│       ├── new.tsx
│       └── review.tsx
├── child/
│   ├── index.tsx
│   └── task.tsx
├── garden.tsx
└── circle.tsx
src/
├── components/
├── design/
├── features/
│   ├── assistants/
│   ├── circle/
│   ├── garden/
│   ├── rewards/
│   └── tasks/
├── i18n/
├── models/
├── services/
│   ├── interfaces/
│   └── mock/
├── state/
└── utils/
tests/
├── assistant-safety.test.ts
├── garden-progression.test.ts
├── privacy-projection.test.ts
├── prototype-state.test.ts
├── reward-matrix.test.ts
└── task-lifecycle.test.ts
assets/images/
├── fixture-recycling-clean-v1.png
└── fixture-recycling-clean-v1.md
```

**Structure Decision**: Migrate the existing Expo project in place. Reuse `LocalizedText`, service
result/error shapes, registry construction, deterministic fixture factories, stale asynchronous
attempt guards, Zustand reset pattern, locale utilities, route shells, design tokens, primitives,
SVG mechanics, and Vitest seams. Retire Feature 002 food quantities, impact summaries, mission
generation theater, streaks, and food-specific route components once the Feature 003 replacements
are proven; do not maintain two domain models or two journeys.

## Implementation Sequence and Exclusive Boundaries

1. **Foundation and tests first**: establish Feature 003 model/contract names, fixture IDs, reward
   matrix, privacy schema, growth thresholds, and failing focused tests. One logic owner controls
   `src/models/**`, then releases types to test/UI owners.
2. **Pure domain policies**: implement task validation/transitions, fixed awards, no-loss retry,
   privacy-before-projection, stages, assistant allowlists/prohibited summary language, and provider
   fallback. Keep these independent of React Native.
3. **Session and registry integration**: adapt the existing store and registry; implement exact
   reset without storing the current route, no-counter `planConfirmation`, a separately rendered
   praise-presented continuation, and ledger-first atomic idempotent `applyRecognition`. Do not
   expose partial counter setters.
4. **Visual foundation**: synchronize tokens and build shared bilingual components, five static
   landscape states, combined canopy, prepared-media disclosure, bounded assistant sheet, reduced-
   motion alternatives, and accessibility states.
5. **Parent path**: integrate `/`, `/role`, `/parent`, `/parent/task/new`, and
   `/parent/task/review` against the released domain/store contracts.
6. **Child and check-in path**: integrate `/child`, `/child/task`, and `/parent/check-in`, including
   explicit choose/start, adult exit, optional media/reflection, kind retry, editable praise,
   duplicate confirmation, and future-only phase-review state.
7. **Growth and sharing path**: integrate `/garden` and `/circle`; render exact pre/post values,
   one symbolic Mangrove transition, one canopy leaf, one coarse circle event, and complete static
   outcomes.
8. **Route retirement**: verify the new inventory and smoke journey, then remove the six replaced
   Feature 002 route files and orphaned food-rescue UI imports. Preserve all historical evidence.
9. **Polish and acceptance**: complete bilingual parity, long-copy/font-scale, offline/fallback,
   Back/reset, reduced-motion, route, secret/network, web-export, and automated checks. Record only
   directly observed evidence; physical Android and human reviews cannot pass by source inspection.

Shared configuration and dependencies remain unchanged except for the integration owner's measured
Expo SDK 57 compatibility patch alignment documented above. No new library was added. No two agents
edit the same route, store, registry, token, i18n, test, or runbook file concurrently.

## Validation Strategy

### Automated and source-verifiable gates

Run from the repository root and record the exact worktree/commit state:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
git diff --check
git diff --stat
git status --short
```

In addition:

- enumerate `app/**/*.tsx` and prove exactly the ten authored product routes;
- scan `app/`, `src/`, config, and fixtures for secrets, network calls, real Child data, camera/
  microphone capture, prohibited claims, hard-coded user copy, and legacy route imports;
- run focused tests for every lifecycle edge, recognition/phase row, threshold boundary, projection
  rejection, assistant allowlist, timeout/failure fallback, reset source state, bilingual resource
  parity, sensitive-category fixture rule, summary correction, and duplicate confirmation;
- execute five automated store-flow cycles from reset with all optional providers denied;
- use the static web export only for secondary responsive, visual, keyboard, and console inspection.

### Manual evidence gates

- Walk every route and meaningful state in Arabic RTL and English LTR.
- Verify exact reset from draft, prepared assistant result/fallback, prepared-media selected/
  removed/unavailable, reviewed, assigned, chosen, in-progress, submitted, retry, confirmed/
  recognized, celebration available/consumed, garden, and circle; check Back cannot recover stale
  state.
- Verify no award at assignment, choice, start, or submission; one confirmation changes only
  48→60, 48/60 Shoot→60/60 Sapling, 19→20, and 11→12; five duplicates change nothing.
- Verify prepared image/audio removal and missing-file transcript/description fallbacks.
- Check WCAG 2.2 AA text/essential-UI contrast, 200% font scale, screen reader order/announcements,
  48 dp targets, keyboard avoidance, reduced motion, direction, mixed scripts, diacritics,
  predictive/native Back, and `app.config.ts` on a named Android build.
- Run five timed rehearsals and three comprehension observations with named people.

Web evidence may support implementation debugging but cannot pass Android RTL, native media,
keyboard, Back, reduced-motion, permission, screen-reader, or physical-device criteria. Until a
named installable build/device is available, physical Android remains `BLOCKED`; timing,
comprehension, cultural, faith, safeguarding, accessibility, and sustainability reviews remain
`NOT RUN` until performed by the named owners.

## Main Risks and Bounded Mitigations

| Risk                                                             | MVP mitigation                                                                                                                                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature 002 and Feature 003 models coexist ambiguously           | Introduce released Feature 003 types/policies first, migrate every consumer, then remove legacy UI/domain code only after the new smoke flow passes                                 |
| Confirmation rewards before praise or partially updates counters | `planConfirmation` changes no counter; a separate rendered praise continuation precedes ledger-first `applyRecognition`; projection returns allowed values before one atomic commit |
| Reset says no assignment while Child needs choices               | Distinguish selected/current assignment from local approved choice fixtures; only the new P0 assignment is executable                                                               |
| Long safety-critical Arabic overwhelms actions                   | Arabic-first content hierarchy, 20 px screen padding, uncollapsed safety block, generous line height, keyboard/200% tests, sticky action only when unobscured                       |
| Garden polish consumes the schedule                              | Five clear static SVG stages first; one 650 ms optional cause/effect reveal; no 3D, illustration framework, or animation-dependent state                                            |
| Prepared media is absent or mismatched                           | Add the synthetic recycling image with provenance plus prepared audio fixture metadata/transcript; always provide description/transcript and allow omission/removal                 |
| Optional live AI tempts client-side secrets or scope             | No remote adapter in P0; show prepared origin; keep live status `BLOCKED`/`NOT RUN` until a separately approved secure boundary exists                                              |
| Dynamic RTL or Back differs on native                            | Logical styles, predictive Back enabled in `app.config.ts`, and a route-level history adapter; retain `BLOCKED`/`NOT RUN` until observed on named Android                           |
| Cultural or faith fixture breadth implies approval               | Keep sensitive catalog entries seeded/nonexecuting, preserve canonical MSA, visibly flag named reviews, and never infer review completion                                           |

## Constitution Check — After Design

_GATE: Passed after research and Phase 1 design. Cross-artifact analysis still must confirm the
generated data model, contracts, quickstart, and tasks before implementation begins._

- The data design separates symbolic Seeds/growth from sustainability activity and rejects invalid
  recognition, recurrence, visibility, and circle pairings before persistence.
- The contract design keeps routes provider-neutral, the Child Coach prepared-only, the Parent
  Guide bounded, and the deterministic fallback mandatory.
- The journey design contains exactly ten routes and makes assistant, retry, phase-review,
  celebration, failure, and fallback into in-route states.
- The validation design starts Feature 003 evidence fresh and cannot convert web/source evidence
  into native or human passes.
- No backend, dependency addition, production account, real Child data/media, open chat, public
  rank, financial system, compliance claim, second app, or unsupported impact conversion is needed.

All ten constitutional principles therefore remain satisfied under the approved Feature 003
transition. No complexity exception is required.

## Complexity Tracking

No constitution violation or architectural exception requires justification.

## Product Experience Redesign Domain Addendum (2026-09-02)

### Scope and technical context

The September redesign brief was compared against the shipped Feature 003 domain and recorded in
`redesign-gap-analysis.md`. This addendum authorizes a post-P0 deterministic domain foundation only.
It does not replace the existing ten-route journey, add a screen, change `PrototypeSession` schema
version `3`, weaken the Green Circle projector, or claim production authentication, payment,
invitation, persistence, or voice processing.

The implementation remains strict TypeScript with Vitest and existing dependencies. New behavior
lives in small models and pure feature reducers behind process-local in-memory deterministic service
facades. It consumes only synthetic fixtures or caller-provided deterministic test data. Recreating
the registry or reloading may clear these new ledgers; they are not production persistence. The
current Zustand P0 aggregate remains unchanged so reset and judge-flow evidence stay stable until
the frontend redesign receives its own approved integration window.

### Phased implementation

| Phase | Domain outcome | Reserved files | Independent evidence |
| --- | --- | --- | --- |
| A — authority and contracts | Gap matrix, requirements, entities, service contracts, and executable tasks | Feature 003 Spec Kit artifacts and bounded root product-limit documents | Artifact review finds the current P0 and production boundaries explicit |
| B — synthetic access | Separate local Parent/Child sessions, least-privilege views, expiring one-use pairing, scoped reauthentication, and Parent-owned grants | `src/models/access.ts`, `src/features/access/**`, `tests/access-control.test.ts` | Wrong actor, purpose, expiry, replay, revocation, and capability cases fail closed |
| C — private Family Reward | Versioned personal milestone promises, `promised → unlocked → given`, protected-category exclusion, privacy, and monthly commitments | `src/models/familyReward.ts`, `src/features/family-rewards/**`, `tests/family-reward.test.ts` | No League input, payment operation, Seed conversion, retroactive edit, or unlocked withdrawal is accepted |
| D — weekly Family League | Five-leaf week, idempotent credit, normalized capped score, shared ties, rollover, strict projection, prepared encouragement, and cooperative goal | `src/models/familyLeague.ts`, `src/features/league/**`, `tests/family-league.test.ts` | Score, tie, accessibility, protected-category, privacy, rollover, and allowlist cases pass |
| E — age-adaptive Coach and synthetic voice | Output constraints for all age bands and explicit task-bound transcript lifecycle | `src/models/assistantVoice.ts`, `src/features/assistants/{ageAdaptation.ts,voiceSession.ts}`, focused tests | No microphone/provider access; all permission, task, transcript, replay, caption, pace, and reset transitions pass |
| F — registry and convergence | Deterministic services exposed through `serviceRegistry`; complete static and behavioral validation | Existing service facade plus full suite | Typecheck, lint, formatting, tests, diff checks, and route inventory pass |

Phases B, C, and D may be developed in parallel because their write boundaries are disjoint. Shared
registry changes and Phase E remain serialized under the integration owner. Each completed phase is
committed as a cohesive checkpoint after its focused tests pass.

### Security and privacy boundaries

- Synthetic access tokens are opaque local values with explicit expiry and replay handling; they
  are not passwords, biometrics, identity verification, or production sessions.
- The Family Reward service evaluator accepts strict caller-provided candidate fixtures only after
  stored Parent authorization in this domain-only prototype. Frontend integration must derive them
  from the authoritative confirmation/Garden store; that adapter is deferred. The candidate schema
  never accepts League rank, another Child's progress, a Seed exchange rate, or a payment command.
- League eligibility is decided before assignment. Its projector is a new strict allowlist and does
  not reuse or relax `GreenCircleEventDTO` validation.
- Voice state accepts a prepared synthetic transcript only after explicit start/stop and stored
  Parent permission. It never calls camera, microphone, speech, network, or biometric APIs.
- Emirati/Gulf conversational content and real Arabic-English code-switch understanding remain
  blocked pending named human review and an approved provider boundary.

### Constitution check after addendum

The addendum preserves the complete P0 journey, uses deterministic mock-first services, adds no
dependency or route, and labels every new capability synthetic. A private promise is metadata rather
than a real financial reward; a local access fixture is not production authentication; and the
League uses only synthetic participants behind a separate minimal privacy projection. Production
infrastructure and claims remain excluded, so no constitution amendment or complexity exception is
required for this domain-only foundation.
