<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/003-family-growth-garden/plan.md
<!-- SPECKIT END -->

# Ghaf Repository Collaboration Contract

## Current Feature

Ghaf — غاف now implements the approved Feature 003 product direction: an Arabic-first
Parent–Child task, reward, bounded AI-coaching, and UAE living-garden prototype for SMAC 2026.
The deterministic implementation and bilingual web-proxy journey are validated in the current
Feature 003 evidence; authoritative physical Android and named human-review gates remain open.

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
6. `PROTOTYPE_LIMITATIONS.md`
7. `TEAM_OWNERSHIP.md`
8. `DEMO_RUNBOOK.md` when the change affects the judge journey

If attachment names include suffixes such as `README(5).md` or `AGENTS(1).md`, find and edit the
canonical repository files rather than introducing duplicate suffixed files.

## Decision Order

Resolve implementation tradeoffs in this order:

1. Child safety, dignity, privacy, and truthful capability labels
2. Complete deterministic Parent → Child → confirmation → growth journey
3. Clear AI value tied to a real sustainability action
4. Arabic-first RTL and equivalent English LTR
5. Polished garden growth and understandable family overview
6. Reliable Android demo, reset, and offline fallback
7. Ease of change for a three-member team
8. Optional breadth

## P0 Boundary

Maintain one polished vertical slice with:

- one synthetic household, two synthetic siblings, and one seeded aggregate cousin circle;
- eight curated task categories and five UAE landscape tracks visible from local fixtures;
- one executable Green Impact task;
- one bounded Parent Guide exchange, one bounded Child Coach exchange, and one Parent summary;
- prepared synthetic image/voice fixtures with visible origin labels;
- Parent confirmation, specific praise, a fixed 12-Seed award, garden growth, one household leaf,
  and one eligible Green Impact action added to cooperative circle progress;
- ten authored routes defined in `PRODUCT.md`; and
- a deterministic Arabic-first reset that works without a remote service.

Breadth beyond that list is seeded content or a later feature. Do not build real accounts,
networking, notifications, analytics, production storage, or a second app in P0.

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
- Praise describes an action, strategy, improvement, or help-seeking; it never labels the Child's
  character.
- Prayer, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines,
  reflections, media, Child-assistant content, and Parent notes are never shared across households.
- Apply `visibilityScope` and `circleEligible` before shared visuals or counters: private tasks remain
  Child/guardian only, household views use one combined canopy, and the circle accepts only coarse
  eligible Green Impact events—not Seeds or task records.
- Reject `circleEligible = true` unless category is Green Impact and `visibilityScope = household`.
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
- Introduce the smallest useful contracts for task, reward, garden, family circle, assistant,
  media, and prototype session behavior. Reuse existing mission/AI/media contracts where doing so
  remains clear.
- Keep one deterministic local provider for every required path and one one-action reset.
- Use code-native SVG and existing motion tools before adding illustration or UI frameworks.
- Do not install overlapping state, form, localization, icon, media, or animation libraries without
  a measured gap and explicit owner approval.
- Android is authoritative for the physical demo. Web is a secondary visual/test surface.

## Arabic, Culture, and Content

- Arabic is the starting locale; use logical start/end layout, locale-aware alignment, RTL-aware
  directional icons, readable mixed scripts, and long-label resilience.
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
- private-category exclusion from circle data;
- privacy filtering before every shared visual/counter update and circle acceptance of eligible
  Green Impact events only;
- assistant intent allowlists and prohibited parent-summary language;
- Arabic/English resource parity;
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
- Keep the deterministic competition path complete after every integrated slice.
- Do not claim live AI, real media analysis, authentication, child-data protection, legal
  compliance, measured sustainability impact, or production readiness without direct evidence.
- Do not commit secrets, real child information, local build artifacts, or unreviewed sensitive
  cultural/religious copy.
- Do not push, merge, force-push, deploy, or rewrite shared history without explicit authorization.
- Before handoff, report files changed, checks run, manual evidence, known gaps, and whether the
  boundary is ready for integration.
