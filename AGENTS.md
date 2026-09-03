<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/003-family-growth-garden/plan.md
<!-- SPECKIT END -->

# Ghaf Repository Collaboration Contract

## Current Feature

Ghaf — غاف Feature 003 Revision 3 is the active pre-Stitch planning direction. It inherits the
Arabic-first Revision 2 application with separately authenticated-looking Parent and Child
prototype experiences, Parent-approved tasks, bounded AI coaching, permanent Seeds and UAE
landscapes, an invite-only Ghaf Family League, and optional private Parent-funded Family Rewards,
then adds a private Growth Journey with one Seed-derived Impact Path, permanent deterministic
badges, and sourced finite learning.

The 2026-08-28 ten-route deterministic build remains a preserved Revision 1 implementation
baseline. Its automated and bilingual web-proxy evidence does **not** validate later access,
navigation, League, Family Reward, voice, typography, Growth Journey, or screen design. The
user-approved R001 Batch 1 implements only Welcome and first-time Parent onboarding. Every later
Revision 2 screen and every Revision 3 Growth Journey screen is **ON HOLD** until the user supplies
and approves its Google Stitch design.

Feature 002's physical Android and human-rehearsal gates remained blocked/not run; “validated” does
not mean fully demo-accepted.

Feature 003 lives in `specs/003-family-growth-garden/` and owns the active plan reference. Do not
backport the redesign into Feature 002, overwrite its historical evidence, or manually change the
Spec Kit-managed block above.

## Read Before Editing

Read in this order:

1. `.specify/memory/constitution.md`
2. the active feature's `spec.md`, `plan.md`, and `tasks.md`
3. `PRODUCT.md`
4. `RESEARCH_BASIS.md`
5. `DESIGN.md` and `DESIGN_DIRECTION.md`
6. `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md` and
   `specs/003-family-growth-garden/design-intake/growth-journey-preflight.md` for Growth work
7. `PROTOTYPE_LIMITATIONS.md`
8. `TEAM_OWNERSHIP.md`
9. `DEMO_RUNBOOK.md` when the change affects the judge journey

If attachment names include suffixes such as `README(5).md` or `AGENTS(1).md`, find and edit the
canonical repository files rather than introducing duplicate suffixed files.

## Decision Order

Resolve implementation tradeoffs in this order:

1. Child safety, dignity, privacy, and truthful capability labels
2. Strict Parent/Child access separation and a complete deterministic task-to-growth journey
3. Clear AI value tied to a real sustainability action
4. Arabic-first RTL and equivalent English LTR
5. Fair League scoring, private Family Rewards, and permanent personal growth
6. Polished garden growth and understandable family overview
7. Reliable Android demo, reset, and offline fallback
8. Ease of change for a three-member team
9. Optional breadth

## P0 Boundary

Prepare one polished vertical slice with:

- one synthetic household, Salem and Alya, and seeded invite-only sibling/cousin League members;
- a combined welcome/language/access entry, separate deterministic Parent sign-in/setup and Child
  PIN/picture-sequence or approved pairing paths, and no in-app role toggle;
- Parent navigation for Home, Tasks, Garden, and Family; Child navigation for Today, Garden, and
  League; contextual Task Builder, check-in, Reward Plan, pairing, profile, permissions, settings,
  and reauthentication states;
- eight curated task categories and five UAE landscape tracks from local fixtures;
- one executable 12-Seed Green Impact task, one bounded Parent Guide exchange, one bounded Child
  Coach exchange, one Parent summary, and prepared synthetic image/voice fixtures;
- five weekly Challenge Leaves per Child, normalized score `(confirmed / 5) × 100`, shared tie
  positions, no speed tiebreak, and one cooperative family-canopy contribution per confirmed Leaf;
- one private synthetic Family Reward plan at 108/120 eligible Seeds that moves from `Promised` to
  `Unlocked` only after praise, Seeds, and garden growth;
- one free private 120–180 Impact Path chapter derived from lifetime confirmed Seeds, exactly 16
  deterministic badge definitions, one combined result bundle, one Mangrove learning package with
  an equal-credit accessible route, and one Parent read-only selected-Child progress view; and
- a deterministic signed-out Arabic-first reset that works without a remote service.

Breadth beyond that list is seeded content or later work. Do not build production accounts,
networking, real invitations, payment/custody, notifications, analytics, production storage, live
Child media processing, or a second app in P0. Do not implement an unreleased Revision 2 or
Revision 3 Growth screen before its approved Stitch frames are supplied.

## Product Invariants

- Ghaf is an autonomy-supportive family routine tool, not an obedience, surveillance, or diagnosis
  system.
- Parent approval is required before assignment and before Seeds, recorded sustainability activity,
  or symbolic growth. Confirmation does not establish environmental impact.
- A Child may choose among approved tasks, ask for help, complete with help, retry, or receive a
  smaller equivalent.
- Completing an accepted task with permitted help earns its displayed award. Only a smaller task
  agreed before acceptance may display a smaller award.
- Earned Seeds and garden growth are permanent. No debt, point deduction, punitive streak, public
  failure, dying tree, randomized reward, loot box, or artificial scarcity.
- Impact Path is one free private projection of confirmed lifetime Seeds. Badges use transparent
  deterministic criteria, remain permanent/private, and never become paid, random, scarce,
  tradable, public status, visit proof, or a substitute for a specific action/learning criterion.
- Learning and explicitly defined activity completion are idempotent, create zero Seeds and garden
  growth, and may satisfy only the exact named badge criterion. An accessible equivalent receives
  equal credit.
- Praise describes an action, strategy, improvement, or help-seeking; it never labels the Child's
  character.
- Prayer, affection, emotional disclosure, private wellbeing, hygiene, disability-related routines,
  reflections, media, Child-assistant content, Parent notes, task titles, evidence, accommodations,
  age, missed-task reasons, and Family Reward amounts are never shared across households.
- League projection is separate from Green Impact projection. A League row may expose only the
  approved nickname, tree avatar, weekly rank, normalized score, and confirmed Challenge Leaves.
  It must never expose tasks, Seeds, media, money, age, or private/sensitive categories.
- Apply `visibilityScope`, `challengeLeafEligible`, and `circleEligible` before any shared visual or
  counter. `challengeLeafEligible` never reuses or weakens the Green-only `circleEligible` rule.
- Reject `circleEligible = true` unless category is Green Impact and `visibilityScope = household`.
- Each Child receives exactly five age-appropriate Challenge Leaves per week. Confirmed Leaves are
  worth 20 score points each, score caps at 100, help/accessibility adaptations retain full credit,
  extra tasks cannot improve rank, ties share position, and speed is never a tiebreaker.
- Weekly League score/rank resets; earned Seeds, landscapes, canopy history, and unlocked or given
  Family Rewards never reset.
- Family Reward is a private Parent promise, not a wallet. It may be money, an experience, a
  privilege, or a gift; has no universal Seed-to-AED rate; never depends on League rank; is fulfilled
  outside the app; and uses `promised → unlocked → given`. An unlocked promise cannot be removed or
  retroactively weakened. Future plans may change only after Parent reauthentication.
- A Family Reward may never monetize prayer, affection, emotional disclosure, eating, basic needs,
  caregiving, safety, education, dignity, or proof of love.
- Family Reward progress is fail-closed before confirmation: every contributing task/version must
  have an explicit eligible decision. Unknown or prohibited activity contributes zero, and a
  landscape milestone must use eligible contribution provenance rather than its displayed stage
  alone.
- Symbolic garden growth does not imply real trees planted or measured environmental impact.
- A Parent-confirmed observable quantity may be labeled a self-reported activity metric. Call it
  environmental impact only when an approved method supports the conversion.
- Tasks declare `standard`, `fade-first`, or `recognition-only`. `standard`/`fade-first` use
  acquisition or maintenance; recognition-only uses `not_applicable` and creates no Seed,
  persistent landscape/canopy growth, or circle event. Maintenance creates no Seed or persistent
  landscape/canopy growth. Only recurrent fade-first tasks prompt a Parent review after three
  confirmed completions; no phase changes automatically. Faith, affection, emotion disclosure,
  and relationship closeness default to recognition-only.

## AI and Child-Safety Invariants

The Child Coach is limited to the current Parent-approved task. It may simplify steps, create an
if–then cue, rehearse curated phrases, respond to a prepared fixture, offer one optional, skippable,
task-focused reflection question, or say when an adult is needed.

It must:

- disclose that it is AI and may be wrong;
- use curated intents without free text for ages 6–8, structured intents/template input for 9–11,
  and guardian-enabled bounded text/voice for 12–14; no band gets unrestricted chat;
- never ask for secrets, exclusivity, emotional dependence, or continued conversation;
- never act as therapist, friend, confidant, religious authority, or replacement Parent;
- never diagnose, infer emotion/personality, recognize faces, or judge truthfulness/religiosity;
- use only synthetic prepared media in P0; and
- never listen continuously or in the background.

Any P0 push-to-talk, transcript, replay, slower-playback, delete-before-send, QR, biometric,
passkey, or pairing experience is a visibly synthetic deterministic simulation unless a later
approved specification and direct native evidence say otherwise. Real Child recording or analysis
is not authorized. Safety and task requirements use Modern Standard Arabic; Gulf/Emirati greetings
and encouragement require Parent approval and named human review.

The Parent Guide may suggest tasks, smaller steps, praise, questions, and neutral time-bounded
summaries. It must never output normal/abnormal, lazy/defiant, a diagnosis, ADHD or other condition,
an emotion/risk/personality score, parenting-quality judgment, or religious judgment.

Any optional real AI provider must live behind a server-side boundary, strict structured schemas,
age-appropriate filters, timeout, and the deterministic fallback. Never place a provider secret in
the mobile bundle. Do not add live child photo/voice processing in P0.

If an approved secure server-side boundary exists, the competition build should demonstrate at
least one real model transformation using synthetic input. If it does not, keep live AI `BLOCKED`
or `NOT RUN` and label prepared responses honestly.

## Architecture Boundaries

- Preserve one Expo/React Native application, strict TypeScript, Expo Router, shared tokens,
  logical RTL helpers, and small local components.
- Keep routes thin. Put reusable UI in `src/components/` and bounded behavior in `src/features/`.
- Adapt the existing store and service registry rather than importing concrete providers into
  screens.
- Introduce the smallest useful contracts for access/session, task, Seed recognition, Family Reward
  plans, garden, League, privacy projection, assistant, media, devices/permissions, and prototype
  reset behavior. Keep the Green Impact projection separate from League eligibility.
- Keep one deterministic local provider for every required path and one one-action reset.
- Derive Impact Path and badge state from immutable profile-scoped Seed, approval, learning, and
  activity evidence. Do not create a second currency or let a screen calculate an unlock.
- Keep lifetime Seeds, landscape growth, League/canopy, and Family Reward eligible progress as
  separate authorities even when a synthetic fixture uses equal numbers.
- Preserve the existing task categories, recognition mode, routine phase, privacy, League, Green,
  and reward-eligibility fields; Growth Journey mastery mappings are additive versioned metadata.
- Use code-native SVG and existing motion tools before adding illustration or UI frameworks.
- Alexandria and Readex Pro are approved typography requirements. Their R001 roles and local assets
  are released only for the approved Batch 1 implementation; later token or typography changes
  require measured reconciliation with the applicable Stitch handoff.
- Do not install overlapping state, form, localization, icon, media, or animation libraries without
  a measured gap and explicit owner approval.
- Android is authoritative for the physical demo. Web is a secondary visual/test surface.

## Arabic, Culture, and Content

- Arabic is the starting locale; use logical start/end layout, locale-aware alignment, RTL-aware
  directional icons, readable mixed scripts, and long-label resilience.
- Use Alexandria for released R001 and later approved display roles and Readex Pro for released
  R001 and later approved body/control/data roles; use tabular numerals for rankings, Seeds, and rewards, no
  artificial Arabic letter spacing, no thin Arabic weights, and generous Arabic line height.
- User-facing strings belong in the bilingual resources; do not hard-code a second source of truth.
- Modern Standard Arabic is the safe prototype default. Emirati dialect, transliteration,
  gendered forms, wedding copy, and all religious content require named human review.
- Never present one family greeting or wedding phrase as universally correct.
- Children do not handle hot gahwa, glass, sharps, chemicals, batteries, unknown waste, electrical
  repair, or unsafe outdoor routes in a task.
- Food tasks never score body weight, calories, amount eaten, or a “clean plate.” Parents own food
  safety decisions.

## Collaboration and Ownership

Before writing, inspect `git status --short`, read `TEAM_OWNERSHIP.md`, and reserve exact files
or directories. One person or agent owns a file boundary at a time. Read-only research may run in
parallel; overlapping writes may not.

Run no more than four agents concurrently. Use the smallest applicable project agent and honor its
write scope. The integration owner resolves shared configuration, dependency, and final merge work.

## Comment and Commit Conventions

- In source languages that support `//`, every new or edited comment uses `//`. Write a multi-line
  comment as consecutive `//` lines; do not add `/* ... */` or `/** ... */` block comments.
- Use the valid native comment syntax in files where `//` is not supported. Preserve generated
  content, license text, Spec Kit-managed markers, and tool-required directives.
- Keep comments concise, factual, and clear. Do not introduce intentional spelling or grammar
  mistakes.
- Commit each completed, independently verifiable function, fix, or feature slice as a small,
  cohesive commit. Split unrelated work into separate commits and avoid accumulating one large
  catch-all commit.
- During longer assignments, create a checkpoint around every 30 minutes when the work forms a
  coherent, validated state. Do not fabricate timestamps or split incomplete work only to imitate
  a particular activity pattern.
- Use the repository's configured contributor identity and accurate authorship metadata. Do not
  override or fabricate another person's identity.

## Validation

Run checks proportional to the change:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

For product behavior, add focused tests for:

- fixed award and no-loss rules;
- allowed-help and retry transitions;
- idempotent Parent approval;
- task/category/tree mapping;
- Parent/Child route isolation, reauthentication, pairing expiry/revocation, and exact synthetic
  reset;
- five-Leaf nomination, score cap, ties, no-speed rule, help-equivalent credit, rest week, weekly
  reset, and extra-task exclusion;
- League privacy projection and private/sensitive category exclusion;
- private Family Reward visibility, monthly promised maximum, prospective-only edits, immutable
  unlock, rank independence, and `promised → unlocked → given` transitions;
- privacy filtering before every shared visual/counter update and Green Impact projection acceptance
  of eligible household events only;
- assistant intent allowlists and prohibited parent-summary language;
- Arabic/English resource parity, Alexandria/Readex loading/fallback, tabular numerals, mixed bidi,
  and long-label resilience;
- reset after every meaningful state; and
- remote-provider timeout/failure returning to the same deterministic path.

Source inspection or web evidence cannot pass Android RTL, native media, keyboard, Back, reduced
motion, permission, or physical-device requirements. Record `PASSED`, `FAILED`, `BLOCKED`, or
`NOT RUN` with the exact evidence; never inherit Feature 002 passes for Feature 003.

## Everyday Commands

```bash
npm ci
npm start
npm run android
npm run typecheck
npm run lint
npm run format:check
npm test
```

Use `npm install` only for an intentional dependency/lockfile change. Use `rg` or `rg --files` for
search. Preserve unrelated work and avoid destructive Git commands.

## Delivery Rules

- Update Spec Kit artifacts before implementing behavior outside the active specification.
- Treat the Google Stitch prompt pack as design input, not implementation authority. Do not edit
  runtime UI, navigation, dependencies, fonts, models, services, state, or tests for an unreleased
  Revision 2 or Revision 3 Growth screen until the user supplies and approves its final Stitch
  frames.
- Keep the deterministic competition path complete after every integrated slice.
- Do not claim live AI, real media analysis, production authentication/security, payment or money
  custody, child-data protection, legal compliance, measured sustainability impact, or production
  readiness without direct evidence.
- Do not commit secrets, real child information, local build artifacts, or unreviewed sensitive
  cultural/religious copy.
- Do not push, merge, force-push, deploy, or rewrite shared history without explicit authorization.
- Before handoff, report files changed, checks run, manual evidence, known gaps, and whether the
  boundary is ready for integration.
