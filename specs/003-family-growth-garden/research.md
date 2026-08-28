# Phase 0 Research: Family Growth Garden

**Feature**: `003-family-growth-garden`

**Date**: 2026-08-26

**Scope**: Repository-grounded implementation decisions for the deterministic P0

All technical unknowns are resolved. Sources are the approved Feature 003 specification and root
product/design/research documents, the current Expo repository, and preserved Feature 002
architecture artifacts. External production integrations are not required.

## Decision 1 — Evolve the Existing Single Expo Application

**Decision**: Migrate Feature 002 in place using the installed Expo SDK 57/React Native 0.86 stack,
strict TypeScript, Expo Router, Zustand, Zod, React Hook Form, i18n, StyleSheet, SVG, Reanimated, and
prepared audio. Add no package and no backend.

**Rationale**: The repository already has the necessary mobile, localization, validation, state,
animation, media-playback, and test capabilities. P0 is ten local routes over one synthetic
session. Adding a second app, server, UI kit, state library, database, or media library increases
demo risk without enabling an acceptance requirement.

**Alternatives considered**:

- Add a server/live model adapter now: rejected because no approved secure deployable boundary
  exists and prepared fallback is the acceptance baseline.
- Add a component/theme framework: rejected because the current StyleSheet/token system has low
  drift and the design contract explicitly favors small local components.
- Preserve Feature 002 as a parallel route tree: rejected because Feature 003 defines the sole
  judge-facing product direction and exactly ten routes.

## Decision 2 — Reuse Architectural Seams, Retire Food-Rescue Semantics

**Decision**: Reuse `LocalizedText`, `ServiceResult`, error metadata, the central registry, strict
Zod validation, deterministic fixture factories, pure transition functions, stale asynchronous
attempt guards, Zustand application commands, atomic reset, and Vitest seams. Replace mission/
quantity/impact/streak/six-stage-tree types with explicit task, recognition, five-landscape,
privacy projection, assistant, media, and schema-versioned session types.

**Rationale**: Feature 002's seams are sound, but its entities encode food rescue, estimated
quantities, one Child, a seven-state mission lifecycle, streaks, and an impact record. Aliasing those
concepts into Family Growth Garden would blur symbolic Seeds with environmental impact and leave
unsafe projection rules implicit.

**Alternatives considered**:

- Keep both model families indefinitely: rejected because screens and services could read the
  wrong source of truth and reset would become ambiguous.
- Rename legacy fields mechanically: rejected because Feature 003 adds materially different
  lifecycle, reward, privacy, assistant, sibling, landscape, and circle invariants.
- Rewrite the application foundation: rejected because route shells, locale helpers, registry,
  tokens, SVG mechanics, and tests remain valuable.

## Decision 3 — Migrate to Exactly Ten Authored Routes

**Decision**: Rewrite `/`, `/role`, `/parent`, and `/child`; add `/parent/task/new`,
`/parent/task/review`, `/child/task`, `/parent/check-in`, `/garden`, and `/circle`; then remove
`/parent/create`, `/parent/generating`, `/parent/review`, `/child/mission`,
`/parent/confirmation`, and `/celebration` after the replacement flow passes.

**Rationale**: Expo Router derives authored routes from files, so leaving legacy files would violate
the exact route inventory even if the UI stopped linking to them. Assistant, loading, fallback,
retry, phase-review, and celebration are state variants, not route files.

**Alternatives considered**:

- Redirect legacy routes: rejected because they would still be authored routes.
- Delete legacy routes before replacements work: rejected because it breaks the deterministic
  path during integration.
- Add assistant or celebration routes: rejected by the route contract.

## Decision 4 — Distinguish Available Choices from Current Work

**Decision**: Interpret reset's “active assignment/submission: none” as no selected/current P0
work. Seed `/child` with two or three local Parent-approved preview choices, but make only the newly
Parent-approved P0 recycling assignment executable in the judge journey.

**Rationale**: The Child screen contract requires bounded choice, while the reset contract requires
no active assignment. Separating an approved-choice fixture from current lifecycle state satisfies
both without inventing extra completed journeys or routes.

**Alternatives considered**:

- Show an empty Child home at reset: rejected because it does not demonstrate autonomy or meet the
  two-to-three-choice requirement.
- Treat seeded choices as active work: rejected because reset would no longer be exact.
- Implement all catalog tasks: rejected as P0 breadth and demo risk.

## Decision 5 — Use Explicit Pure Lifecycle Transitions

**Decision**: Implement `draft → reviewed → assigned → chosen → in_progress → submitted → retry |
confirmed → recognized` as guarded pure transitions. `retry` returns to `in_progress` without loss;
award application is a guarded side effect after confirmation, not another generic state.

**Rationale**: The current Feature 002 store moves assigned directly to Child-in-progress and ties
submission shape to three food steps. Explicit transitions make Child choice visible, prevent early
reward, and are easy to test without rendering routes.

**Alternatives considered**:

- Infer status from screen location: rejected because Back/reload/reset can desynchronize reward
  and navigation.
- Store independent booleans: rejected because invalid combinations multiply.
- Award on submission: rejected because Parent confirmation is mandatory.

## Decision 6 — Centralize Reward and Growth Policy

**Decision**: Validate the five allowed recognition/phase rows, fixed award allowlist
`4 | 6 | 8 | 12 | 15`, recurrence rules, third-confirmation future-phase prompt, and cumulative
growth thresholds `0 | 20 | 60 | 120 | 200` in pure policies. `planConfirmation` prepares editable
praise with zero counter changes. Only after praise is presented may ledger-first
`applyRecognition` atomically produce the P0 result, at most once per submission.

**Rationale**: A single policy prevents routes from interpreting maintenance, recognition-only,
help, smaller equivalents, or recurrent fade-first tasks inconsistently. The separate planning
state enforces praise before reward without making mutation depend on animation. The reset-to-
recognition transition is exactly Salem 48→60, Mangrove 48/60 Shoot→60/60 Sapling, canopy 19→20,
and circle 11→12; a duplicate returns the recorded result before recomputing any projection.

**Alternatives considered**:

- Let task fixtures encode arbitrary numeric deltas: rejected because invalid combinations could
  bypass no-loss and maintenance rules.
- Use random or multiplicative rewards: prohibited and contrary to predictability.
- Automatically change phase after three completions: prohibited; Parent choice is prospective,
  reversible, and initially unselected.

## Decision 7 — Filter Privacy Before Shared Projection

**Decision**: Build deny-by-default pure projectors. Household projection accepts only a valid
household-visible acquisition result and returns one coarse canopy contribution. Circle projection
accepts only confirmed household-visible Green Impact activity with `circleEligible = true` and
returns one coarse family action containing no Child ID, task record, Seeds, media, reflection,
assistant content, or sensitive fields. Mutate no shared counter until projection succeeds.

**Rationale**: Post-render filtering or UI-only hiding can leak fields or increment counters before
rejection. A minimized return type makes excluded data unrepresentable at the shared boundary.

**Alternatives considered**:

- Filter only on `/circle`: rejected because household/circle counters and visuals may already
  have changed.
- Pass the complete task and hide fields in components: rejected because identity and sensitive
  data remain available to the shared surface.
- Use Seeds as the circle unit: rejected; the circle counts one eligible action.

## Decision 8 — Keep Assistants Structured, Prepared, and Provider-Neutral

**Decision**: Define typed Parent Guide and Child Coach requests/results with allowlisted intents,
active-task binding, origin/status/disclosure, validation, and deterministic same-attempt fallback.
P0 registers reviewed prepared results for both. The Child Coach has no live mode. Live Parent
refinement remains unimplemented and labeled `BLOCKED`/`NOT RUN` until a separately approved secure
server boundary exists.

**Rationale**: Repository inspection found no remote adapter, network client, server function, or
secure deployment boundary. A client key would violate the project safeguards. The prepared
fixtures still demonstrate the intended transformation and safety rules reliably.

**Alternatives considered**:

- Call a model directly from Expo: rejected because it exposes a provider secret and has no
  approved minor-data boundary.
- Add unrestricted chat and filter afterward: prohibited for all Child age bands.
- Present prepared text as live AI: rejected as dishonest capability labeling.
- Remove provider contracts: rejected because structured replacement and timeout/fallback remain
  useful, small seams.

## Decision 9 — Treat Prepared Media as Optional Fixture Data

**Decision**: Add the exact image/audio fixture IDs with visible synthetic/prepared origin,
description/transcript, Parent-visibility statement, remove action, and provenance metadata. Ship
the prepared recycling image; the audio fixture may deliberately exercise its visible transcript
fallback when no reviewed binary is available. Do not request camera or microphone permission.
Missing files never block submission.

**Rationale**: Existing Feature 002 bread and family-wisdom assets do not represent the approved
recycling task. The app already supports bundled asset playback, and `app.config.ts` disables
microphone permission, recording, and background audio. P0 needs a new safe recycling object image
and prepared plan audio, not capture infrastructure.

**Alternatives considered**:

- Reuse mismatched food-rescue media: rejected because it weakens task coherence and origin truth.
- Enable image picker/recording: rejected because P0 uses no real Child media and completion cannot
  depend on evidence.
- Block when media is missing: rejected by the fallback contract.

## Decision 10 — Extend the Existing Design System

**Decision**: Keep `src/design/tokens.ts` as the single runtime theme. Add semantic mangrove, water,
water-light, and coral roles; align type, 120/220/650 ms motion, and 20 px phone padding to
`DESIGN.md`; build needed shared primitives with StyleSheet and code-native SVG; add no theme/UI
library.

**Rationale**: The repository audit found 8,309 TS/TSX lines, 13 hardcoded hex hits all inside
`GhafTree.tsx`, token references rather than raw font-size drift, only two deliberate zero-spacing
values, token-backed radii except zero, no legacy shadow/elevation, and one theme entry. The
existing botanical system needs semantic expansion and route-specific components, not replacement.

**Alternatives considered**:

- Install a broad design system: rejected due overlap, bundle/learning cost, and avoidable visual
  genericness.
- Rebuild styling screen by screen: rejected because it recreates drift.
- Preserve Feature 002's compact tree dashboard unchanged: rejected because Feature 003 requires
  an interconnected five-track landscape and combined canopy, not a score grid.

## Decision 11 — Author Arabic Direction and Accessibility in Shared Primitives

**Decision**: Keep typed paired resources, Arabic default, logical start/end helpers, locale-aware
text alignment, directional icon handling, generous Arabic line heights, 48 dp controls, 8 dp
adjacent spacing, accessible control states, once-only announcements, visible audio transcript/
image descriptions, 200% font-scale resilience, and reduced-motion static outcomes in reusable
components.

**Rationale**: Applying these rules at the primitive/component boundary prevents ten route files
from implementing inconsistent RTL, disclosures, focus states, or target sizes. Native direction
and navigation chrome may differ from the immediate logical layout and require device evidence.

**Alternatives considered**:

- Depend only on global native mirroring: rejected because mixed scripts and directional icons
  require explicit logic.
- Treat English as the source and mirror later: rejected by the Arabic-first contract.
- Verify accessibility only on web: rejected because native Back, screen reader, font scale,
  keyboard, and reduced motion require physical evidence.

## Decision 12 — Separate Atomic Session Reset from Navigation Reset

**Decision**: The session service returns the exact canonical Arabic Parent/Salem state and fixture
IDs atomically. A root navigation adapter then clears the current stack and lands on `/`. Exercise
reset from every meaningful state and assert no Back path restores stale work.

**Rationale**: Keeping router objects out of the store preserves pure state tests while still
meeting the no-stale-history requirement. The current Feature 002 reset goes to `/parent`; that
behavior must be migrated rather than reused silently.

**Alternatives considered**:

- Reset counters individually: rejected because interrupted reset could mix journeys.
- Call only `replace('/')` without testing history: rejected because stale navigation may remain.
- Reset on reload only: rejected because the judge flow requires a visible Parent-only action.

## Decision 13 — Verify Web and Android as Different Evidence Classes

**Decision**: Use Vitest, typecheck, lint, format, Expo dependency/config checks, route inventory,
static web export, console inspection, and optional browser screenshots for source/web evidence.
Use a named physical Android build for Arabic/English direction, Back, keyboard, media playback,
font scale, accessibility, reduced motion, touch targets, offline behavior, timing, and rehearsal.

**Rationale**: Web is useful for fast visual and deterministic-flow inspection, but it cannot prove
native configuration or physical behavior. Feature 002 passes do not transfer to the redesigned
routes.

**Alternatives considered**:

- Infer Android acceptance from Expo web: rejected by the specification and runbook.
- Inherit Feature 002 RTL/offline evidence: rejected because Feature 003 has new screens, state,
  copy, media, and navigation.
- Block implementation until a device exists: rejected because automated/web work can proceed;
  only the physical gate remains `BLOCKED`.

## Decision 14 — Keep Human and Capability Gates Explicit

**Decision**: Automated artifact/source checks may pass independently, but physical Android remains
`BLOCKED` until a named build/device exists. Timed rehearsals, three-person comprehension, fluent
Arabic/UAE culture, faith, child safeguarding, sustainability, and accessibility remain `NOT RUN`
until named reviewers perform them. Prepared assistants never become “live” through code
inspection.

**Rationale**: These criteria depend on observation, expertise, or external infrastructure.
Reporting them separately prevents a polished web build from becoming a false demo-acceptance
claim.

**Alternatives considered**:

- Mark review gates passed from canonical copy: rejected because canonical draft is not named human
  approval.
- Remove all sensitive catalog breadth: rejected because local fixtures must show eight categories;
  keep them nonexecuting and flagged for review.
- Claim the deterministic provider is live AI: rejected by capability-truth requirements.

## Research Resolution

No `NEEDS CLARIFICATION` item remains. The implementation can proceed after the generated Feature
003 data model, contracts, quickstart, tasks, checklist, and cross-artifact analysis confirm these
decisions. Any later request for a backend, live Child media/AI, real accounts/circle sharing,
production persistence, impact conversion, or additional route is a scope change and must return to
the specification.
