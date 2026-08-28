# Codex Implementation Prompt — Ghaf Feature 003

Paste the prompt below into Codex from the actual Ghaf repository root.

---

Deliver a polished, deterministic, Arabic-first Android prototype of **Ghaf Feature 003 — Family
Growth Garden**. Adapt the locally/web-validated Feature 002 Expo/React Native foundation; its
physical Android and human gates did not pass. Do not build a second
app, expose an AI key in the client, or turn Ghaf into a child-surveillance, diagnosis, public
leaderboard, or open-chat product.

Feature 003 is complete only when its Spec Kit artifacts are approved, the exact ten-route P0 works
from a deterministic offline reset, Arabic and English flows are equivalent, required tests pass,
documentation matches actual capability, and Android/human evidence is reported honestly.

## Mandatory first actions

1. Run `git status --short`. Preserve unrelated and uncommitted work.
2. Locate canonical repository files. Do not create suffixed duplicates such as `README(5).md` or
   `AGENTS(1).md`.
3. Read, in order:
   - canonical `AGENTS.md`;
   - `.specify/memory/constitution.md`;
   - current active feature artifacts;
   - `PRODUCT.md`;
   - canonical `RESEARCH_BASIS.md` and `PROTOTYPE_LIMITATIONS.md`;
   - `DESIGN.md` and canonical `DESIGN_DIRECTION.md`;
   - canonical `TEAM_OWNERSHIP.md`, `CONTRIBUTING.md`, and `DEMO_RUNBOOK.md`.
4. Inspect actual routes, dependencies, state, services, fixtures, tests, Android configuration, and
   any existing server boundary. Treat documented versions/passes as history until verified.
5. Reserve exact write scopes in `TEAM_OWNERSHIP.md`. Use no more than four agents and never permit
   overlapping writes.
6. Create `specs/003-family-growth-garden/` through the repository's official Spec Kit workflow. Do
   not widen Feature 002.
7. Complete specification, clarification, plan, tasks, checklist, and cross-artifact analysis before
   implementation. If the workflow requires human approval, stop at that gate and request it.
8. Let Spec Kit update the block between `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` in
   `AGENTS.md`. Never edit that managed block manually.

Before coding, record these decisions in Feature 003:

- exact reset/history and pre/post values from `DEMO_RUNBOOK.md`;
- the P0 recycling task, definition of done, adult role, and safety exclusions;
- why catalog task `GI01` is 8 Seeds while the 15–30-minute P0 variant is exactly 12;
- `recognitionMode`, valid routine phase, `visibilityScope`, `circleEligible`, and projection schemas;
- prepared fixture IDs and point-of-use origin labels;
- Parent Guide and Child Coach typed inputs, outputs, and intent allowlists;
- the secure live-AI boundary or an explicit `BLOCKED`/`NOT RUN` decision;
- migration/retirement of obsolete Feature 002 routes and state; and
- named cultural, faith, safeguarding, and Arabic review gates.

Proceed autonomously through safe, approved implementation. Ask only when a repository gate,
permission boundary, or material product choice cannot be resolved from the authority order below.
Do not push, merge, deploy, or commit unless explicitly authorized.

## Authority order

When documents conflict, follow:

1. Explicit user instructions, child safety/dignity/privacy, and repository permissions.
2. Canonical `AGENTS.md` and `.specify/memory/constitution.md`.
3. Approved Feature 003 `spec.md` and recorded clarifications.
4. `PRODUCT.md`.
5. `PROTOTYPE_LIMITATIONS.md` and `RESEARCH_BASIS.md`.
6. `DESIGN.md` and `DESIGN_DIRECTION.md`.
7. Feature 003 `plan.md` and `tasks.md`.
8. `DEMO_RUNBOOK.md`, `README.md`, `CONTRIBUTING.md`, and `TEAM_OWNERSHIP.md`.

Feature 002-specific food-rescue, screen, and evidence claims are legacy baseline information.
Preserve reusable code, but do not let legacy scope override Feature 003 or transfer old passes.

## Exact P0

Implement one competition-sized vertical slice with:

- one synthetic Al Noor household;
- Salem, age 9, and Alya, age 11, visibly labeled synthetic;
- one seeded synthetic aggregate cousin/family circle;
- eight visible categories:
  1. Faith & Gratitude — الإيمان والامتنان;
  2. Roots & Kinship — جذورنا;
  3. Home Responsibility — مسؤوليتي;
  4. Green Impact — أثر أخضر;
  5. Food & Hospitality — النعمة والضيافة;
  6. Heritage & Etiquette — تراثنا وآدابنا;
  7. Kindness & Community — اللطف والمجتمع;
  8. Learning & Wellbeing — التعلّم والتوازن;
- five landscape tracks: Ghaf grove, Samar grove, Sidr reflection grove, date-palm oasis, and
  mangrove coast;
- five stages: Seed → Shoot → Sapling → Shade → Flourishing;
- one 12-Seed, Parent-approved, `standard + acquisition`, recurrence-once multi-step Green Impact
  recycling task;
- one bounded Parent Guide refinement, one bounded Child Coach exchange, and one strengths-first
  Parent summary;
- optional prepared synthetic image and push-to-talk fixtures with visible origin labels;
- Parent review, assignment, Child choice, steps, acknowledgement, optional reflection/evidence,
  submit, kind retry, confirmation, editable descriptive praise, and idempotent award;
- Mangrove growth, one household canopy leaf, and one coarse eligible Green Impact action added to
  the circle goal;
- Arabic-first RTL with equivalent English LTR; and
- one-action reset with no network dependency.

### P0 task

Use the exact task fixture in `DEMO_RUNBOOK.md`. After an adult pre-check, Salem sorts only intact,
non-sharp, locally accepted clean paper/plastic. After a second adult check, Salem may help close a
lightweight recycling bag and accompanies the adult on a guardian-approved safe route. The adult
assesses heat/traffic, carries the bag, and handles disposal. The safe route requires no road
crossing and keeps the Child out of vehicle paths.

Exclude glass, sharps, batteries, chemicals, medicine, spoiled/unknown waste, leaking bags,
electrical work, compactors, waste chutes/bin-room machinery, road crossing, vehicle paths, and
unsupervised routes. Postpone or use an indoor sorting alternative if heat or traffic is unsafe.
Ask an adult when unsure and wash hands afterward.

General household-waste disposal is a separate Home Responsibility task. It must never receive
sustainability/circle credit.

## Exact authored routes

Export exactly these ten product routes, aside from framework built-ins:

| Route | Purpose |
| --- | --- |
| `/` | Entry, language, and prototype disclosure |
| `/role` | Demo role and synthetic Child selection; not authentication |
| `/parent` | Parent family overview and bounded Guide summary |
| `/parent/task/new` | Curated task/customization and bounded AI refinement |
| `/parent/task/review` | Bilingual safety, privacy, reward, and assignment approval |
| `/child` | Approved choices, personal Seeds, and garden preview |
| `/child/task` | Steps, bounded Coach, optional prepared media/reflection, and submission |
| `/parent/check-in` | Confirmation, editable praise, retry, neutral observation, and future-phase review state |
| `/garden` | Landscape growth and household-canopy consequence |
| `/circle` | Cooperative aggregate sibling/cousin/family overview |

Loading, assistant, empty, error, timeout, fallback, retry, awaiting-confirmation, and celebration
are states of these routes, not additional routes. Retire replaced Feature 002 product routes after
the new route set is integrated and verified.

## Domain contract

Model at least:

- `TaskTemplate`, `Task`, `Assignment`, `Submission`, `ParentCheckIn`;
- `RecognitionMode = 'standard' | 'fade_first' | 'recognition_only'`;
- `RoutinePhase = 'acquisition' | 'maintenance' | 'not_applicable'`;
- `VisibilityScope = 'child_guardian' | 'household'` plus `circleEligible: boolean`;
- `SeedTransaction`, `LandscapeProgress`, `CanopyContribution`, `GreenCircleEvent`;
- `AssistantIntent`, structured Guide/Coach request and result, origin/status;
- prepared `MediaFixture`; and
- `PrototypeSession` with explicit reset and schema version.

Enforce state transitions rather than inferring them in screens:

`draft → reviewed → assigned → chosen/in_progress → submitted → retry | confirmed → recognized`

`apply_award` is a guarded, idempotent side effect only for valid acquisition rows in the matrix;
it is not a universal lifecycle state.

Enforce this matrix:

| Recognition/phase | Seeds | Persistent landscape/canopy | Circle |
| --- | --- | --- | --- |
| Standard + acquisition | Displayed fixed award | Eligible mapped growth; household canopy only when visible | One event only for eligible Green Impact |
| Fade-first + acquisition | Same | Same | Same; after third recurrent confirmation, prompt Parent phase review |
| Standard/fade-first + maintenance | None | None | Eligible Green activity may still record one coarse action |
| Recognition-only + not-applicable | None | None | Never |

Reject every other combination. Parent phase changes apply prospectively, never automatically, and
never remove prior progress. The app never claims a habit formed.

Validate that `standard` is finite or `recurrence = once`; any recurrent reward-eligible routine
must use `fade_first`.

## Behavioral invariants

- Tasks are positive, observable, achievable, age/ability-aware, and explicit about purpose,
  definition of done, permitted help, effort, supervision, hazards, optional evidence, recognition,
  Seeds, routine phase, recurrence, landscape, `visibilityScope`, `circleEligible`, and privacy.
- Children choose among Parent-approved tasks and may ask for help, a smaller step, a safe
  equivalent, or a later retry.
- Completing an accepted task with permitted help earns its displayed award. Only a smaller task
  agreed before acceptance may display a smaller award.
- Parent approval is required before assignment and before recorded credit/growth.
- Submission gets an immediate neutral acknowledgement; prompt Parent confirmation unlocks praise
  and any reward.
- Confirmation is idempotent. Duplicate input never duplicates Seeds, growth, canopy, activity, or
  circle progress.
- Fixed Seed values are 4, 6, 8, 12, or 15; no random multipliers.
- Earned Seeds/growth are permanent. No deduction, debt, punitive streak, public failure, dying
  vegetation, loot box, scarcity, purchasable currency, or monetary value.
- Praise names action, strategy, improvement, or appropriate help-seeking—not character or worth.
- Faith, affection, emotion disclosure, and relationship closeness default to recognition-only.
  Kinship/kindness use recognition-only or fade-first preparation, never payment for affection.
- Food tasks never reward what/how much a Child eats, weight, calories, dieting, or a clean plate.
- Symbolic growth never means a real tree was planted or an environmental impact was measured.
- A Parent-confirmed observable value is a self-reported activity metric; call it impact only when an
  approved conversion method exists.

## Privacy and family projection

Apply privacy filtering before any shared visual or counter update.

- `visibilityScope = child_guardian`: visible only to the Child and guardian; no canopy update.
- `visibilityScope = household`: an acquisition-phase rewarded task may add one combined-canopy
  contribution; do not show sibling raw Seeds, pace, or
  age-unequal totals side by side.
- `circleEligible = true`: allowed only when category is Green Impact and `visibilityScope =
  household`; projects one coarse family-level action count after confirmation. It never projects a
  task record, identity, or Seeds. Reject `child_guardian + circleEligible` at schema validation.

Never project prayer, kinship, affection, food consumption, hygiene, wellbeing, disability-related
routines, Parent observations, exact task history, photo/voice, reflection, or assistant content
across households. No public rank, discovery, messaging, comments, reactions, invitations, or real
cross-family sharing in P0.

## Child Coach

Bind the Coach to the current Parent-approved task and typed intents only: simplify, show steps,
make an if–then plan, rehearse a reviewed phrase, respond to a prepared fixture, ask one optional
reflection question, or request an adult.

- Ages 6–8: curated intents, no free text.
- Ages 9–11: structured intents/template input.
- Ages 12–14: guardian-enabled bounded text or push-to-talk with stronger privacy controls.
- No band receives unrestricted chat.

The Coach states that it is AI and may be wrong. It never requests secrets, creates exclusivity or
dependency, prolongs conversation for engagement, acts as friend/therapist/confidant/religious
authority, diagnoses, infers emotion/personality, recognizes faces/voices, judges truthfulness or
religiosity, or listens in the background. It sends hazards to an adult. P0 processes no real Child
media.

## Parent Guide

The Guide may select from reviewed catalog data, make a task clearer/smaller, check documented
safety constraints, draft specific praise, and summarize synthetic observable records over a stated
window.

Its summary must be strengths-first, separate facts from uncertainty, offer one question/adjustment,
and remain Parent-editable. It never outputs normal/abnormal, lazy/defiant, good/bad Child, ADHD or
another diagnosis, developmental/emotion/personality/risk score, deception claim, religious
judgment, or parenting/family-quality judgment.

## AI implementation

Create an `AssistantProvider` interface with structured schemas, validation, allowlisted intents,
origin labels, short timeout, and same-attempt deterministic fallback.

The offline acceptance provider returns reviewed fixtures. For SMAC, demonstrate at least one real
Parent task-refinement transformation using synthetic input if the repository has—or the approved
Feature 003 plan authorizes—the smallest secure server-side boundary. Keep secrets server-side,
minimize logs/data, and label the result live. If no secure deployable boundary is available, do not
put a key in the app or invent a compliance claim; finish the deterministic flow and report live AI
`BLOCKED` or `NOT RUN`.

Prepared output must never be labeled live. Remote failure, timeout, malformed schema, or safety
rejection returns the reviewed fixture without losing user state.

## Culture and content

- Use neutral Modern Standard Arabic noun-phrase task titles until named local review.
- Keep bilingual keys paired; do not scatter Arabic/English literals through screens.
- Faith content is guardian-enabled, private, nonpunitive, recognition-only by default, and excluded
  from comparison. AI never rules on prayer validity, sincerity, or religiosity.
- Offer multiple Parent-approved wedding/greeting phrases; never mark one family expression
  universally correct.
- Wedding, majlis, hospitality, Emirati dialect, gender variants, transliteration, heritage art, and
  all religious copy need named human review.
- Children follow guardian/host cues, ask before photography/recording, and never handle hot gahwa.
- Use the sourced catalog and safety notes in `RESEARCH_BASIS.md`; do not improvise sensitive copy.

## Implementation constraints

- Preserve one Expo/React Native app, strict TypeScript, Expo Router, shared tokens, logical RTL
  helpers, bounded Zustand-style state, local components, and the service registry.
- Keep routes thin. Put reusable UI in `src/components/` and behavior in bounded task, reward,
  garden, circle, assistant, media, and prototype-session modules.
- Reuse legacy mission/AI/media contracts only where clear; migrate incrementally rather than create
  parallel architectures.
- Screens consume provider interfaces, never concrete remote implementations.
- Use prepared synthetic media only; no camera permission, ambient recording, facial/emotion
  analysis, real Child upload, or background listening.
- Use existing libraries and code-native SVG before adding dependencies. Shared configuration or a
  dependency change requires the integration owner's approval and a validation plan.
- Preserve the warm field-paper/botanical identity. Parent mode is calm stewardship; Child mode is
  capable exploration. Use a living-garden overview, not a score grid.
- AI appears as bounded actions/panels, not a chat destination, human face, or companion avatar.
- Motion explains cause/effect, honors reduced motion, and has a complete static final state. Never
  make state completion depend on animation.
- Maintain 48dp targets, font scaling, contrast, screen-reader semantics, keyboard avoidance,
  pressed/focus/disabled states, and long-Arabic resilience.
- Keep the deterministic journey working after every integrated work package.

## Exact reset

Implement the full reset table from `DEMO_RUNBOOK.md`, including:

- Arabic RTL at `/`, no stale Back history;
- Parent mode, Salem active, no assignment/submission;
- Salem 48 personal earned Seeds; Alya 36;
- Salem Mangrove 48/60 at Shoot;
- household canopy 19/25;
- circle 11/12 eligible Green Impact actions;
- prepared fixture IDs and no consumed celebration.

One confirmation produces Salem 60, Mangrove 60/60 Sapling, canopy 20/25, and circle 12/12. A
duplicate confirmation is a no-op. Reset must work from every meaningful screen/state.

## Automated acceptance

Add focused tests for:

1. Full task lifecycle and explicit transition guards.
2. No award/growth before Parent confirmation.
3. Exactly one 12-Seed transaction, Mangrove update, canopy leaf, and eligible circle action.
4. Duplicate confirmation idempotency.
5. Help, retry, missed task, smaller agreed equivalent, and substitution preserving dignity/progress.
6. Recognition-only and acquisition/maintenance behavior, including the third-confirmation Parent
   prompt, explicit Keep/Move choice, future-only effect, reversal, and no automatic transition.
7. Eight category mappings and five growth stages.
8. Privacy filtering before every household/circle projection.
9. Circle rejection of Seeds, private fields, non-Green tasks, sensitive categories, and every
   `child_guardian + circleEligible` object.
10. Child Coach intent/age allowlists, task binding, disclosures, and fixture results.
11. Parent Guide schema and prohibited-language tests.
12. Remote timeout, malformed result, failure, and network denial using same-attempt fallback.
13. Arabic/English resource parity and stable mixed-script values.
14. Reset and Back/history recovery from assistant, retry, submitted, confirmed, garden, and circle.
15. No unsupported impact conversion/real-tree claim and visible origin labels.

Manually verify all ten routes; Arabic RTL and English LTR; long copy/diacritics; touch, font scale,
contrast, screen reader, keyboard, reduced motion; Back/reset/offline; prepared-media fallback; all
empty/error/retry states; privacy projections; and no runtime errors. Record a named physical
Android build in both languages plus timing/comprehension results in `DEMO_RUNBOOK.md`.

## Non-goals

Do not implement production authentication/consent/tenancy; real Child accounts or media; live
invitations; public ranking/social discovery; messaging/comments; continuous listening; face/voice
identification; emotion inference; diagnosis/developmental screening; religious rulings; automated
welfare decisions; money/purchases/redeemable currency/ads; real-tree claims; unsupported impact
conversion; production analytics/moderation/notifications/compliance/store release; a 3D world;
or a second app/backend that threatens the deterministic path.

## Validation

Run and report, as applicable:

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

Inspect the final route inventory. Scan for secrets, client-side provider keys, unintended network
calls, real Child data, duplicate hard-coded bilingual copy, and camera/microphone/background
permissions. Do not transfer Feature 002 passes. Record each Feature 003 result as `PASSED`,
`FAILED`, `BLOCKED`, or `NOT RUN` with exact evidence.

## Final report

Lead with the delivered outcome, then report:

1. Feature 003 Spec Kit artifacts and approval status.
2. Exact capabilities delivered/deferred.
3. Files changed, grouped by spec, domain/state, UI/routes, content, tests, and docs.
4. Route inventory and exact reset/pre-post values.
5. Behavioral, privacy, AI, culture, and sustainability invariants verified.
6. Commands and exact results.
7. Android, Arabic/RTL, accessibility, timing, cultural, faith, safeguarding, and human-review
   evidence—or `BLOCKED`/`NOT RUN`.
8. Capability truth: real, prepared, simulated, estimated, and future.
9. Known gaps/risks and integration readiness.

Never describe Feature 003 as implemented, live-AI-enabled, production-ready, legally compliant,
culturally approved, Android-accepted, or demo-accepted without direct evidence.

---
