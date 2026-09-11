# Contributing to Ghaf — غاف

Ghaf is a three-member SMAC 2026 prototype. Contributions should improve the approved Feature 003
vertical slice without overstating implementation, AI, sustainability, cultural authority, child
safety, or production readiness.

## Before You Start

1. Run `git status --short` and preserve unrelated work.
2. Read the repository's canonical `AGENTS.md`.
3. Read `.specify/memory/constitution.md` and the active feature's `spec.md`, `plan.md`, and
   `tasks.md`.
4. Read `PRODUCT.md`, `RESEARCH_BASIS.md`, and `PROTOTYPE_LIMITATIONS.md` for any
   user-facing change.
5. Check `TEAM_OWNERSHIP.md` and reserve the exact file boundary.
6. Confirm no person or agent is writing the same file or shared configuration.

Feature 003 is the active approved Spec Kit package. Update its artifacts before changing behavior
outside the current specification; do not silently widen Feature 002 or manually edit the Spec
Kit-managed block in `AGENTS.md`.

## Setup

Use Node.js 22.13 or newer and npm. The repository `.nvmrc` records the baseline.

```bash
npm ci
npm run web -- --offline
```

Android is the primary target:

```bash
npm run android
```

Run the complete local gate with `npm run verify`; see
[`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for runtime choices and troubleshooting.

The deterministic P0 path requires no API key, backend account, real Child data, camera, or
microphone permission.

## Work Reservation

Record this before editing:

```text
Work period: date/time or session label
Owner: Member or agent
Feature/tasks: exact Spec Kit IDs
Write scope: exact files/directories
Expected handoff: outcome and validation
Cross-cutting review: Arabic/culture/safeguarding/accessibility as applicable
```

Only the integration owner changes shared app configuration or resolves dependency conflicts.
At most four agents may run concurrently, with disjoint write scopes.

## Branch and Commit Discipline

- Keep work small enough to map to one or a few Feature 003 task IDs.
- Use a short-lived branch such as `003-garden-reward-loop`; the integration owner decides timing.
- Do not commit across another owner's active boundary.
- Inspect `git diff --check`, `git diff --stat`, and `git status --short` before handoff.
- Do not use destructive Git commands or discard unrelated changes.
- Do not push, merge, force-push, deploy, or rewrite shared history without explicit authorization.

Example commit messages:

```text
feat: add deterministic seed award loop
feat: add bounded child coach fixtures
test: keep private categories out of family circle
docs: record Arabic Android rehearsal
```

## Implementation Conventions

- Keep Expo Router screens thin and put reusable UI in `src/components/`.
- Put task, reward, garden, circle, and assistant behavior in bounded feature modules.
- Consume service interfaces through the central registry; screens never import a concrete remote
  provider.
- Preserve one complete local deterministic provider and reset path.
- Use shared tokens and logical start/end layout; do not add one-off colors, spacing, radii, motion,
  or left/right assumptions.
- Put shared user-facing copy in the Arabic/English resources.
- Treat loading, retry, fallback, assistant, and celebration as screen states unless the approved
  specification defines a route.
- Use code-native SVG and existing libraries before installing a new UI or illustration system.
- If an optional remote AI provider is approved, keep the secret on a server, validate structured
  output, time out quickly, and fall back within the same attempt.

## Behavioral-Design Review

Every task or reward change must answer:

- Is the action positive, specific, observable, achievable, and age/ability appropriate?
- Can the Child choose, ask for help, complete with help, retry, or use a safe equivalent?
- Is the award predictable, proportionate, nonfinancial, and shown before acceptance?
- Does completing the accepted task with permitted help keep the displayed award?
- Does the task declare recognition mode, valid routine phase, `visibilityScope`, and
  `circleEligible`?
- If circle-eligible, is it Green Impact and household-visible, with the projection stripped to one
  coarse family action?
- Does praise describe the action or strategy rather than the Child's worth?
- Can a miss occur without debt, shame, public failure, punitive streak loss, or dying growth?
- For a recurrent fade-first acquisition task, does the third confirmation only prompt a Parent
  review, with maintenance producing zero future Seeds/persistent growth and no automatic switch?
- Does privacy filtering happen before any shared visual/counter update, and is the task excluded
  from cross-family views if it concerns prayer, kinship, affection, food consumption, wellbeing,
  hygiene, disability, media, reflection, Parent notes, or Child-assistant content?

Do not introduce random rewards, loot boxes, purchasable currency, points removal, fixed-child
labels, or raw sibling/cousin ranking.

## Content and Cultural Review

- Use Modern Standard Arabic until named Emirati-language review is recorded.
- Review Arabic gender, diacritics, mixed scripts, numerals, line breaks, and RTL order.
- Wedding, majlis, hospitality, dialect, and all faith content require local human review.
- Offer valid phrase choices; do not mark a family expression wrong.
- Keep prayer and faith content Parent-enabled, private, nonpunitive, and outside circle data.
- Parent owns food safety. Never reward how much a Child eats or “cleaning the plate.”
- Age-gate cooking, waste, electrical, outdoor, and cleaning tasks. Children report hazards rather
  than repair or touch them.
- Do not invent litres saved, carbon avoided, food rescued, or trees planted.

## AI and Data Review

For P0, use synthetic profiles, prepared image/voice fixtures, and deterministic assistant
responses. If an approved secure server boundary exists, demonstrate at least one real model
transformation with synthetic input and the same-attempt fallback; otherwise record live AI as
`BLOCKED` or `NOT RUN`. The Child Coach is a bounded task tool, not open chat. The Parent Guide
summarizes observable records, not “normality,” diagnosis, emotion, personality, truthfulness,
religiosity, or parenting quality.

Reject a change that introduces:

- real Child photo/voice processing without a separately approved safeguard design;
- ambient/background listening;
- facial recognition or emotion inference;
- secret or attachment language;
- hidden Parent surveillance;
- cross-family sharing of tasks, notes, reflections, media, or sensitive categories; or
- an API secret in client code, fixtures, logs, documentation, or source control.

## Validation Commands

Run the checks relevant to the change:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Also run targeted tests for changed state transitions and a manual journey from the reset baseline.
For user-facing changes, test Arabic/RTL and English/LTR, font scaling, reduced motion, touch targets,
Back behavior, empty/loading/retry states, and external-service denial.

A source review is not evidence for a native, physical, media, permission, timing, or human-
comprehension result. Record those as `NOT RUN` or `BLOCKED` until directly observed in
`DEMO_RUNBOOK.md`.

## Handoff Format

```text
Task: F003-T0XX — short outcome
Files owned: exact paths/directories
Product invariants checked: concise list
Checks: command — PASSED/FAILED/BLOCKED/NOT RUN
Manual evidence: device/build/locale or NOT RUN
Content review: reviewer/scope or NOT RUN
Known gaps: concise list
Ready for integration: yes/no
```

## Definition of a Good Handoff

A change is ready when it matches the active Feature 003 specification, preserves the deterministic
fallback and reset, follows reward/AI/privacy invariants, has Arabic/English parity, stays inside its
file boundary, includes proportional tests, and reports every unrun check honestly. Competition
coherence is the target; production completeness is not.
