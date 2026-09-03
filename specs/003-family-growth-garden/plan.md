# Design-Intake and Implementation-Readiness Plan: Family Growth Garden — Revision 3

**Branch**: `feature/003-family-growth-garden` | **Date**: 2026-09-03 | **Spec**:
[spec.md](./spec.md)

**Status**: Ghaf R001 Batch 1 is **PARTIALLY RELEASED** for foundations, Welcome, and first-time
Parent onboarding. Revision 3 Growth Journey documentation is prepared; every new design/runtime
slice remains **BLOCKED** pending approved Stitch frames.

## Summary

Revision 3 inherits Revision 2's replacement of the linear ten-route demonstration with one
application containing
separately gated deterministic synthetic Parent and Child experiences. Parent navigation is Home,
Tasks, Garden, and Family. Child navigation is Today, Garden, and League. Contextual families cover
access/setup, pairing, Task Builder, Check-in, Family Rewards, settings, permissions, devices, and
reauthentication.

The product keeps three progression views distinct without merging their meaning:

- five weekly Challenge Leaves derive a normalized 0–100 Ghaf Family League score; and
- a private Parent-funded Family Reward is promised and delivered outside Ghaf; and
- a private Growth Journey projects confirmed lifetime Seeds plus separately proven action and
  learning evidence into one free Impact Path and permanent badges.

Seeds and gardens remain permanent personal progress. One valid P0 confirmation presents praise,
then 12 Seeds and Mangrove/canopy growth, then the fifth Challenge Leaf, then eligible path/badge
results, and finally the private Family Reward unlock. P0 access, pairing, voice, membership,
rewards, learning, and assistant behavior remain deterministic and synthetic.

## Revision and Evidence Boundary

Revision 1's implementation, tasks T001–T110, automated tests, web walkthroughs, screen geometry,
and evidence remain historical. They MAY inform repository feasibility after design approval but
MUST NOT satisfy a later requirement or gate. Only the exact R001 Batch 1 boundary in
`design-intake/release-gate.md` is authorized; every other Revision 2 route, source, test,
dependency, asset, font, or evidence change remains blocked.

The five substantive files under `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/` are preserved user input.
They authorize planning, not code. Their “implement now,” route suggestions, interfaces, timings,
and assumptions about existing Child screens are subordinate to the per-batch Stitch gate. The
resolved planning dispositions and future artifact inventory are in
`design-intake/growth-journey-preflight.md`.

## Current Capability Decision

| Classification            | Revision 3 decision                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Approved product behavior | Revision 2 behavior plus one private Seed-derived Path, 16 badges, finite learning, and one combined result                                |
| Approved typography       | Alexandria display and Readex Pro body/control/data, with the spec's Parent/Child sizes                                                    |
| Deterministic P0          | Synthetic sign-in, PIN/picture sequence, pairing/reauth, League/member data, reward plans, prepared voice/media/AI, exact reset            |
| Design-dependent          | R001 resolves foundations/Parent onboarding; later roles and every Growth Journey composition remain unresolved                            |
| Partially released        | Canonical tokens/fonts/RTL primitives/shared controls, seven access routes, minimal local onboarding state, focused tests                  |
| Blocked                   | Every later application/test/asset/dependency change outside the exact R001 partial release                                                |
| Future/out of scope       | Production auth, payment/custody, real invitations, networking, production persistence/sync, real Child media/voice, open chat, deployment |

## Technical Context

**Existing baseline**: One Expo/React Native application using strict TypeScript, Expo Router,
Zustand, Zod, i18n, StyleSheet, SVG, Reanimated, and local deterministic services. This is a
candidate implementation baseline, not evidence for an unreleased screen family.

**Expected architecture constraint**: Preserve one app, thin routes, shared tokens/components,
bounded feature policies, one session aggregate, a service registry, and one deterministic local
provider for every required path.

**Storage**: Deterministic in-memory prototype state remains the current default. Revision 3 needs a
small versioned local adapter for first-run preferences and earned achievement continuity, but no
provider/dependency is approved until a measured post-Stitch gap review. Production persistence,
sync, accounts, and secure device binding are outside P0.

**External services**: None may be required for the acceptance path. No provider secret, payment
service, auth service, invitation backend, or live Child-media service is authorized.

**Typography**: Alexandria and Readex Pro are approved. R001 uses local Expo-compatible packages,
Alexandria 400/700/800, Readex Pro 400/500/600/700, explicit family names, and deterministic loading/
fallback with no remote font request. Native shaping, license, and bundle evidence remain open.

**Target**: Physical Android is authoritative. Web remains a secondary visual/test proxy and cannot
pass native gates.

**Unresolved by design**: The Stitch frames must resolve exact screen/route inventory, component
geometry, navigation appearance, safe-area behavior, scrolling/sticky actions, sheet/dialog use,
responsive rules, visual tokens, and illustration/motion specifications.

## Constitution Check — Documentation and Design Intake

| Principle                | Plan evidence                                                                          | Result |
| ------------------------ | -------------------------------------------------------------------------------------- | ------ |
| MVP Prototype First      | Synthetic access/League/rewards demonstrate the idea without production infrastructure | PASS   |
| One Complete Journey     | Parent and Child remain separate while one confirmation joins the outcome              | PASS   |
| Design Is a Core Feature | R001 is reconciled narrowly; every later visual boundary remains blocked               | PASS   |
| Arabic-First             | Arabic R001 frames are canonical; equivalent English runtime remains required          | PASS   |
| Mock-First               | Every P0 external-looking capability has a deterministic synthetic path                | PASS   |
| Keep Architecture Small  | One app; Growth Journey stays nested and the lean MVP authors one complete story       | PASS   |
| Visible AI Value         | Coach/Guide remain task-bounded and honestly prepared in P0                            | PASS   |
| Honest Boundaries        | Synthetic auth and off-app rewards cannot be called production security/payment        | PASS   |
| Fast Collaboration       | Exact partial documentation/runtime boundaries are reserved                            | PASS   |
| Demo Reliability         | Exact access/week/reward/garden/path reset and duplicate no-op remain required         | PASS   |

**Implementation gate result**: **PARTIALLY RELEASED**. The constitution's design condition is met
for the user-approved R001 Batch 1 only. Full AC-00/T120 remains blocked.

## Design Intake Gate

The complete Revision 3 implementation may be released only when all of the following are
recorded:

1. The user supplies the selected Stitch project/export and identifies the approved visual
   direction.
2. Arabic RTL frames cover every required screen family and meaningful state.
3. Matched English LTR frames preserve the same hierarchy and meaning.
4. Parent four-tab and Child three-tab navigation are explicit and cross-role access is absent.
5. Task Builder, Check-in, League, Family Reward, pairing, permissions, settings,
   reauthentication, pending, duplicate, offline, and reduced-motion states are represented.
6. Alexandria/Readex hierarchy, long Arabic labels, mixed-direction numbers, 48dp targets, font
   scaling, contrast, and screen-reader order can be derived without guesswork.
7. The selected design rules are captured in root `DESIGN.md` and `DESIGN_DIRECTION.md`.
8. `spec.md`, this plan, `data-model.md`, `acceptance-contract.md`, `quickstart.md`, and `tasks.md`
   are reconciled to the approved frame/state inventory.
9. An integration owner explicitly records that the implementation block is released.
10. Growth Journey includes its complete reachable entry/Child/Parent prerequisites, not only
    nested Path/Gallery screens.
11. Every Growth runtime surface includes a canonical Arabic PNG, matched English frame, mandatory
    `screen-spec.md`, material states, original asset provenance, and motion/reduced-motion rules.
12. The exact 16 badge definitions and P0 learning package have named source, factual, cultural,
    safeguarding, accessibility, and rights-review dispositions.

Missing or contradictory frames return to design refinement; they do not authorize inferred UI.

### R001 Batch 1 Partial Exit

The user supplied and approved seven Arabic Parent-onboarding compositions on 2026-09-02. The
inventory, state map, product-safety audit, accessibility audit, visual audit, decisions,
route/component map, and partial gate are recorded under `design-intake/`. The release deliberately
records that `screen-spec.md`, English/state frames, font binaries, and exported assets are missing.

This narrow exit authorizes only:

- canonical tokens, local Alexandria/Readex integration, RTL primitives, shared controls, and the
  transactional access shell;
- `/`, `/access/parent/sign-in`, `/access/parent/verification`,
  `/access/parent/family-basics`, `/access/parent/add-first-child`,
  `/access/parent/review-create`, and `/access/parent/family-created-success` as a transparent
  modal;
- minimal deterministic local Parent verification/onboarding draft, route guards, bilingual copy,
  and focused tests; and
- success replacement navigation to the preserved `/parent` integration destination without
  redesigning it.

English/runtime system states remain required, but the missing frames are not claimed as visual
evidence. All later screen families and full Revision 2 contracts remain blocked.

## Target Domain and Architecture Boundaries

The detailed contracts are in [data-model.md](./data-model.md). Future implementation must keep:

- access/pairing/reauthentication as synthetic capability states, separate from role navigation;
- Challenge Leaves and League score separate from permanent Seeds and Family Rewards;
- a privacy-first League projection containing only nickname, tree avatar, position, score, and
  completed Leaves;
- fail-closed Family Reward contribution eligibility/provenance plus milestones/versioning/state
  transitions separate from any payment or wallet model;
- one confirmation receipt that is idempotent and presents the required effects in order;
- a profile-scoped lifetime-Seed projection independent of landscape and Family Reward progress;
- versioned chapter/station definitions, exactly 16 badge definitions, structured component
  criteria, immutable achievement awards, and separate approval/learning/activity event IDs;
- additive mastery/action mappings on reviewed task versions without replacing the eight categories,
  recognition mode, routine phase, or Green/League/reward/privacy policy;
- at most one pending/seen RevealBundle per event, preserving canopy/League and Family Reward last;
- install-level first-run flags, profile-scoped story preferences, validated transient navigation
  origins, evaluator-versioned migration, and provenance-safe earned dates outside reward ledgers;
- Parent/Child AI intent allowlists and prepared simulated push-to-talk with no real capture; and
- an atomic reset spanning access, pairing, permissions, task, garden, League week, rewards,
  assistant fixtures, and protected navigation history.

Screens MUST consume service/store commands and MUST NOT calculate ranks, rewards, privacy
projection, reward unlocks, recognition deltas, stations, composite criteria, badges, or migration
independently.

## Project Structure

### Design-intake records

```text
specs/003-family-growth-garden/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── design-intake/
│   ├── stitch-inventory.md
│   ├── screen-state-map.md
│   ├── product-safety-audit.md
│   ├── accessibility-audit.md
│   ├── visual-audit.md
│   ├── decision-log.md
│   ├── route-component-map.md
│   ├── release-gate.md
│   └── growth-journey-preflight.md
├── contracts/acceptance-contract.md
├── checklists/
│   ├── requirements.md
│   └── growth-journey-readiness.md
└── tasks.md
```

```text
docs/
├── GHAF_GROWTH_JOURNEY_PROMPT_PACK/   # preserved input; never runtime authority
├── architecture/adr/0002-impact-path-projection.md
└── content/
    ├── BADGE_CATALOG.md
    └── LEARNING_STORIES.md
```

### Released R001 Batch 1 application boundary

```text
app/
├── _layout.tsx
├── index.tsx
├── access/parent/
│   ├── sign-in.tsx
│   ├── verification.tsx
│   ├── family-basics.tsx
│   ├── add-first-child.tsx
│   ├── review-create.tsx
│   └── family-created-success.tsx
└── parent/_layout.tsx

src/
├── design/tokens.ts
├── components/primitives.tsx
├── components/LanguageSwitcher.tsx
├── components/access/**
├── features/access/**
├── i18n/**
├── models/familyGrowth.ts
├── services/**
└── state/usePrototypeStore.ts
```

The integration owner may touch only the smallest existing seams needed for the route guards,
deterministic local draft, fonts, resources, and checks. See `design-intake/route-component-map.md`
for prerequisites and Back behavior. Exact later route/component paths remain unfrozen.

## Work Phases

### Phase A — Record Revision 2 contract

- Align governance, product, research, design, limitations, runbook, ownership, and Feature 003
  Spec Kit artifacts.
- Preserve Revision 1 history and reset all Revision 2 runtime evidence to `NOT RUN`/`BLOCKED`.
- Do not change application files.

### Phase B — Receive and audit Stitch designs

- Inventory every frame, variant, state, locale, navigation path, component, and asset.
- Map frames to the required screen families and user stories.
- Run child-safety, reward/competition, privacy, Arabic/RTL, typography, accessibility, and
  capability-truth audits.
- Return concrete frame-level conflicts for user resolution.

### Phase C — Reconcile design and implementation artifacts

- Update `DESIGN.md`/`DESIGN_DIRECTION.md` from the selected design.
- Freeze the exact route/state/component map and font/asset loading decision.
- Reconcile the data model, acceptance contract, historical domain/assistant contracts, root
  implementation handoff, validation guide, and dependency-ordered tasks.
- Re-run cross-artifact consistency and explicitly release or retain the block.

### Phase D — Partial implementation and later full implementation

Within R001 Batch 1, implement foundations, failing focused access/localization tests, deterministic
local Parent onboarding state, shared access components, the seven routes/states, and fresh
responsive evidence. Outside that boundary, the future order remains:

1. failing access, League, Family Reward, confirmation, privacy, voice, typography, and reset tests;
2. shared domain contracts and deterministic fixtures;
3. synthetic access/pairing/reauth and role navigation;
4. Parent task/check-in/garden/family/reward surfaces;
5. Child Today/task/Coach/garden/League surfaces;
6. ordered recognition consequence and reset integration; and
7. Arabic/English, offline, accessibility, Android, rehearsal, and named-human validation.

No item outside the R001 partial boundary is authorized until the complete Phase C/T120 gate records
release.

### Phase E — Reconcile Growth Journey planning

- Preserve and classify the prompt pack without importing its proposed source/interfaces.
- Reconcile League naming, task taxonomy, numeric authorities, RevealBundle consequences, reset,
  profile spelling, locale/digits, migration, and station 180 before design generation.
- Record the proposed Impact Path ADR, exact 16-badge catalog, P0 learning/equivalent contract,
  data model, acceptance oracles, lean MVP, content review status, and future frame inventory.
- Keep R001 immutable and every Growth runtime/evidence task blocked.

### Phase F — Receive and gate the Growth Journey Stitch release

1. Preserve the user-selected release with a stable identifier and hashes.
2. Inventory canonical Arabic PNGs, matched English frames, mandatory screen specifications,
   material states, motion/reduced motion, prototype connections, and original asset provenance.
3. Verify a reachable role-safe journey: R001 handoff, Child access/shell, Parent Check-in, Child
   result handoff, Today/Garden/League, Path/Gallery/Detail, learning/equivalent, and Parent origin.
4. Compare every default at 390×844 and audit small/large/tablet, natural scrolling, keyboard,
   200% type, RTL/LTR, bidi, TalkBack/focus, offline, Back/deep links, and cold/warm/hot launch.
5. Resolve content, persistence, digit style, 132 provenance, and station-180 dependencies; record a
   new release gate. Missing prerequisites keep the entire dependent slice blocked.

### Phase G — Tests-first domain and local data work after release

1. Add focused failing tests for lifetime-Seed projection, thresholds, structured criteria,
   idempotent approval/learning/activity evaluation, migration, profile isolation, RevealBundle,
   entry routing, equivalent learning, reset, localization, and accessibility names.
2. Extend the existing model and policies with mastery mappings, definitions/events/awards, source
   records, path projection, reveal state, presentation preferences, and validated origins.
3. Add the smallest versioned local persistence adapter only after the recorded gap/owner decision.
4. Keep deterministic fixtures generic for Salem, Alya, and an empty profile; no screen hard-codes
   canonical totals.

### Phase H — Native UI integration and evidence after release

1. Build the entry layer and shared Path/Badge/Reveal/Learning components from approved PNGs.
2. Integrate Today, Garden, Parent progress, Parent approval, and the role-safe Child result handoff
   without adding a tab or stacked result modal.
3. Run repository gates, Expo smoke/export, screenshot comparison, physical Android/accessibility,
   duplicate/recovery/reset oracles, timed rehearsal, and named content/human reviews.
4. Report only direct evidence and keep production auth, persistence/sync, location/media proof,
   live AI, payments, analytics, and public sharing outside P0.

## Validation Strategy

### Current documentation checks

- no unresolved requirement ambiguity or `NEEDS CLARIFICATION` marker;
- explicit Revision 1 historical boundary in every Feature 003 artifact;
- no claim that synthetic access is production authentication;
- no wallet, custody, exchange, payment, or League-money coupling;
- exact five-Leaf formula, tie semantics, privacy projection, and weekly/permanent reset boundary;
- exact Family Reward state machine and nonretroactive rule;
- exact praise → Seeds/garden/canopy/Leaf → private unlock order;
- exact lifetime Seeds 108→120 versus Mangrove 48/60→60/60 versus private reward 108/120→120/120;
- one 120–180 chapter, six stations, exactly 16 badge IDs, visible composite criteria, zero-Seed
  learning/activity completion, profile isolation, and one combined result;
- R001 handoff and all Growth Journey routes/assets/tests remain explicitly Stitch-blocked;
- Alexandria/Readex and token decisions released only for R001 Batch 1; and
- `git diff --check` plus focused Markdown/link/term scans.

### Future implementation evidence

For the partial batch, run typecheck, lint, formatting, focused/full tests, Expo config/dependency
checks, launch smoke, route inventory, static web export, source/network scans, and responsive
Arabic/English comparisons. Verify 390×844 plus small/large viewports, scroll, keyboard proxy,
font-scale proxy, validation/loading/offline/success, and the native modal state. Physical Android
and named human reviews remain separate evidence classes.

For a released Growth batch, add exact threshold/criterion matrices, event replay and migration,
first-install/return/replay/deep-link routing, Salem/Alya/new-profile isolation, story/equivalent
parity, RevealBundle recovery, source/review mapping, and prohibited-pattern scans. Compare each
approved PNG at 390×844 plus 320×568, 360×800, 430×932, and SM_T835/tablet; direct Android evidence
must cover TalkBack, 200% type, reduced motion, Back, offline, keyboard, and cold/warm/hot launch.

## Main Risks and Bounded Mitigations

| Risk                                               | Mitigation                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Missing later frames are mistaken for full release | Keep every route outside the exact R001 partial gate blocked                          |
| Synthetic sign-in is mistaken for security         | Point-of-use synthetic labels and no production capability claim                      |
| Competition becomes age/speed/wealth comparison    | Exactly five normalized Leaves, 100 cap, ties, full help credit, no money/raw Seeds   |
| Private task data leaks into League                | Derive an allowlisted projection before rendering/counter updates                     |
| Family Reward looks like a wallet                  | Private off-app promise, no custody/exchange, rank independence, reauthentication     |
| Reward overshadows recognition                     | Fixed presentation order with praise and garden before private unlock message         |
| Voice implies real recording                       | Prepared simulated push-to-talk, visible origin, no permissions, transcript fallback  |
| Fonts cause Arabic clipping or dependency drift    | Use the recorded local packages; test Arabic first, 200% scale, mixed direction       |
| Revision 1 passes are reused                       | Fresh Revision 2 evidence ledger and explicit historical labels                       |
| Prompt pack is mistaken for executable design      | Preserve it as input; require PNG/spec/asset inventory and a new release gate         |
| Growth Journey becomes a second currency/pass      | Derive one free path from immutable Seeds; no spending, purchase, rarity, or expiry   |
| Similar progress values are conflated              | Separate lifetime Seed, landscape, League/canopy, and Family Reward authorities       |
| Badge implies unsupported mastery or visit         | Structured evidence components, source/review status, and no GPS/proof/endorsement    |
| New result hides existing consequences             | One reconciled bundle with canopy/League retained and private Family Reward last      |
| Feature frames are unreachable                     | Require Child shell/access, Parent Check-in, result handoff, and Parent origin frames |
| Local persistence expands MVP architecture         | Measure gap; add one versioned adapter only with owner approval                       |

## Constitution Check — After Preliminary Design

**R001 Batch 1:** **PARTIALLY RELEASED** after the user-approved frames and scoped reconciliation.

**Complete Revision 3:** **DOCUMENTATION READY; DESIGN/RUNTIME BLOCKED** until the remaining
Revision 2 prerequisites and approved Growth Journey frames, tests-first gate, content review, and
full reconciled artifacts exist. The partial gate introduces no production infrastructure or
complexity exception.
