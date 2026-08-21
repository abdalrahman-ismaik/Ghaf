# Implementation Plan: Ghaf Core MVP

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Status**: PROPOSED — planning only. Feature 002 implementation requires explicit team approval.

**Input**: Feature specification from `specs/002-ghaf-core-mvp/spec.md`

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

## Summary

Extend the completed Feature 001 Expo foundation into one deterministic Parent-to-Child journey:
prepared household media becomes a structured bilingual mission, a Parent approves the mission, a
Child completes exactly three steps and a reflection, the Parent confirms the result once, and the
family's estimated impact and six-stage Ghaf tree update visibly. Ten thin Expo Router screens use
bounded Zustand actions as application use cases. Those actions call the five existing service
interfaces through one registry, with deterministic local mocks as the required implementation.
No backend or live AI service is required for the competition prototype.

## Prototype Capability Decision

| Classification                                 | Feature 002 decision                                                                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must be real for the competition prototype** | Mobile navigation; Parent and Child screens; Arabic and English; RTL; mission review interaction; mission completion interaction; impact update; Ghaf growth animation; role switching; demo reset  |
| **May initially be mocked**                    | AI mission generation; voice transcription; image interpretation; evidence review; Parent notifications; data persistence; authentication                                                           |
| **May later become real if time permits**      | OpenAI API call; Supabase storage; voice transcription; camera capture; audio recording; saved mission history                                                                                      |
| **Explicitly future work**                     | Production authentication; production child accounts; production privacy controls; multiple families; schools; banking; real rewards; marketplace; social feed; App Store release; scalable backend |

Mocked capabilities remain visible and honest: prepared assets are labeled prepared, simulated
processing is labeled simulated, and pregenerated output is never represented as a live model
result. Optional-later work cannot block acceptance of the offline path.

## Technical Context

**Language/Version**: TypeScript 6.x in strict mode on Node.js 22.13+; React 19.2 and React Native
0.86 through Expo SDK 57

**Primary Dependencies**: Expo SDK 57, Expo Router 57, React Native `StyleSheet`,
`expo-localization`, `i18next`, `react-i18next`, Zustand, React Hook Form, Zod, Hook Form Zod
resolver, `react-native-svg`, React Native Reanimated, and `expo-audio` for prepared voice-note and
narration playback. Prepared media is required; recording and `expo-image-picker` are optional-later
additions.

**Storage**: In-memory Zustand state and deterministic local fixtures are sufficient. AsyncStorage
or Supabase storage may be evaluated later but is not an acceptance dependency.

**Testing**: Type checking, linting, formatting, focused pure-function/service tests, a mock-flow
smoke test, and manual Android Arabic/RTL/offline/rehearsal checks. No coverage target.

**Target Platform**: One primary Android physical demo device; convenient iOS compatibility; web
only as a secondary development surface

**Project Type**: One Expo mobile application; no monorepo, second app, or required backend

**Performance Goals**: Prepared mission generation finishes through bounded simulated stages;
approved impact and Ghaf feedback appears within three seconds; the rehearsed loop takes 75–105
seconds in at least four of five trials.

**Constraints**: Complete offline fallback, deterministic reset, Arabic-first layout, synthetic
data only, Parent approval before assignment and impact, no food-safety verdict, no secret in the
mobile bundle, exactly ten screens, provisional native identifiers

**Scale/Scope**: One synthetic family, one Parent, one Child, one active mission journey, a small
curated mission fixture library, twelve core entities, six tree stages, and ten screens

## Constitution Check

_GATE: Passed before research and re-checked after Phase 1 design._

| Principle                        | Plan evidence                                                                                           | Result |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| MVP Prototype First              | One polished local journey; optional services cannot block delivery                                     | PASS   |
| One Complete Journey             | Parent input through confirmed impact and tree growth is the only implementation spine                  | PASS   |
| Design Is a Core Feature         | Ten-screen visual states, four-stage generation, SVG growth, and bounded celebration are planned        | PASS   |
| Arabic-First, Bilingual          | Arabic defaults, all content is bilingual, and logical RTL behavior has its own acceptance pass         | PASS   |
| Mock-First, Replaceable Services | Five contracts and deterministic mocks run the full journey offline                                     | PASS   |
| Keep Architecture Small          | One app, one bounded store, local components, no required backend                                       | PASS   |
| Visible AI Value                 | The four generation stages visibly transform selected family and food context into a structured mission | PASS   |
| Honest Prototype Boundaries      | Origin metadata and UI labels distinguish prepared, simulated, pregenerated, and optional-live behavior | PASS   |
| Fast Team Collaboration          | Work follows mobile/visual, logic/AI, and product/QA ownership with one integration owner               | PASS   |
| Demo Reliability                 | Prepared media, seeded evidence, idempotent approval, and atomic reset protect the rehearsal path       | PASS   |

The minimum safeguards remain product rules, not a separate security program. The plan adds no
continuous recording, production authentication, legal claim, compliance artifact, or enterprise
infrastructure.

## Architecture

```text
10 thin Expo Router screens
             ↓
reusable components + bounded feature modules
             ↓
Zustand actions / small pure application use cases
             ↓
central registry of five service interfaces
             ↓
deterministic Mock* services and local fixtures
             └── optional remote bindings later, one interface at a time
```

### Responsibilities and data ownership

- `app/` owns navigation parameters and screen composition only. A route never imports a fixture
  or concrete provider.
- `src/features/` owns bounded create, generation, review, Child progress, confirmation, impact,
  and celebration behavior. Small pure functions calculate eligibility, lifecycle transitions,
  impact awards, and tree stages.
- `src/state/` owns the current single-device session and exposes intentional commands such as
  `startGeneration`, `approveMission`, `submitForConfirmation`, `requestRetry`,
  `approveCompletion`, and `resetDemo`. It does not become a generic data repository.
- `src/services/interfaces/` owns `MissionService`, `MediaService`, `AIService`, `ImpactService`,
  and `PrototypeSessionService`. `src/services/mock/` is the mandatory provider; optional remote
  adapters may be bound only after review.
- `src/i18n/` owns shared interface copy. Mission fixtures and mission results carry explicit
  Arabic and English fields so switching languages does not regenerate or reset a mission.
- One idempotent completion command owns the approval, impact record, totals, Ghaf progress, and
  celebration payload update. Screens never update these pieces separately.

### No-backend baseline

The approved baseline makes no network request. A later live AI experiment may add one small
server-side proxy—preferably a Supabase Edge Function—behind `AIService`. It may transcribe a voice
note and request a mission matching the same structured contract. The mobile application never
contains an OpenAI secret, and the mock provider remains selectable without changing a screen.

## Approved Screen Evaluation

|   # | Screen / route proposal                    | Real interaction                                                                      | Deterministic fallback and boundary                                                  |
| --: | ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
|   1 | Entry `/`                                  | Ghaf identity, locale choice, enter action                                            | Arabic default; no network or account requirement                                    |
|   2 | Role selector `/role`                      | Switch one device between Parent and Child                                            | Clearly labeled prototype shortcut, not authentication                               |
|   3 | Parent home `/parent`                      | Tree, active state, totals, create action, role switch                                | Seeded totals and local tree state                                                   |
|   4 | Create mission `/parent/create`            | Select Child, prepared image/audio, quantity, time, reward; validate required fields  | Prepared synthetic media remains available when permissions or network fail          |
|   5 | AI generation `/parent/generating`         | Four ordered, visually polished processing stages                                     | Timed simulated stages return one matching pregenerated mission and label its origin |
|   6 | Parent review `/parent/review`             | Review both languages, edit, and approve assignment                                   | Draft stays local; only explicit approval assigns it                                 |
|   7 | Child home `/child`                        | Open the newly assigned adventure and preview reward/progress                         | Same local approved mission after role switch                                        |
|   8 | Child mission `/child/mission`             | Complete exactly three steps, choose evidence/confirmation, answer reflection, submit | Seeded evidence and Parent-confirmation request work offline                         |
|   9 | Parent confirmation `/parent/confirmation` | Review submission, confirm amount, approve once or request retry                      | Retry awards nothing; repeated approval is idempotent                                |
|  10 | Impact celebration `/celebration`          | Show estimated rescue, earned progress, milestone, and deterministic tree motion      | Bounded local animation; stage five saturates without inventing stage six            |

Loading, empty, permission-denied, validation, provider-failure, retry, and success treatments are
states within these screens. They do not add routes.

## Mission and Impact Flow

```text
Draft input
  → Generating
  → Parent review
  → Assigned
  → Child in progress
  → Awaiting Parent confirmation
  ├─ request retry → Child in progress (no award)
  └─ approve once → Completed + one ImpactRecord + Ghaf update + celebration
```

- Parent Edit returns `Parent review` to `Draft input` without exposing the draft to the Child.
- Generation fallback keeps the same valid input and generation attempt identifier, preventing a
  second mission from being inserted after a timeout.
- Completion uses a key derived from mission and submission identifiers. If that key has already
  produced an impact record, another approval returns the existing result without changing totals.
- Reset atomically replaces the entire session with the documented Arabic/Parent baseline, clears
  drafts and submissions, keeps the pregenerated fallback available but unassigned, and returns
  navigation to Parent home.

## Project Structure

### Documentation (this feature)

```text
specs/002-ghaf-core-mvp/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── service-contracts.md
├── checklists/
└── tasks.md
```

### Source Code (proposed additions to the existing app)

```text
app/
├── index.tsx
├── role.tsx
├── parent/
│   ├── index.tsx
│   ├── create.tsx
│   ├── generating.tsx
│   ├── review.tsx
│   └── confirmation.tsx
├── child/
│   ├── index.tsx
│   └── mission.tsx
└── celebration.tsx
src/
├── components/
├── design/
├── features/
│   ├── missions/
│   ├── parent/
│   ├── child/
│   ├── impact/
│   └── ghaf-tree/
├── i18n/
├── models/
├── services/
│   ├── interfaces/
│   ├── mock/
│   └── remote/          # optional-later only
├── state/
└── utils/
tests/
├── mission-lifecycle.test.ts
├── impact-idempotency.test.ts
├── ghaf-progress.test.ts
├── mock-core-flow.test.ts
└── prototype-state.test.ts
```

**Structure Decision**: Extend the existing single Expo project. Reuse the Feature 001 tokens,
primitives, role switch, locale layer, tree component, service registry, and store; evolve their
types deliberately instead of creating a second architecture.

## Proposed Implementation Sequence

1. Extend the data model, lifecycle reducer/use cases, mock fixtures, and five service contracts.
2. Build mission-input validation and prepared-media selection, then create the Parent create and
   simulated-generation screens.
3. Build Parent review/approval and Child assignment views.
4. Build the three-step Child flow, evidence/confirmation choice, reflection, and submission.
5. Build retry and idempotent approval, impact aggregation, Ghaf progression, and celebration.
6. Complete bilingual/RTL polish, failure fallback, reset, focused checks, physical Android review,
   and five complete rehearsals.

Feature 002 implementation MUST stop at this point in bootstrap. These steps become executable only
after the team reviews this plan and explicitly approves it.

## Team Boundaries

- **Member 1 — Mobile and visual experience**: routes, components, design tokens, RTL integration,
  animation, and physical Android build.
- **Member 2 — AI and application logic**: mission schema, store/use cases, service contracts,
  deterministic mock AI, transformations, impact and idempotency logic, optional proxy only if
  separately approved.
- **Member 3 — Product, content, QA, and presentation**: bilingual content, mission templates,
  acceptance checks, prepared assets, manual QA, and 90-second rehearsal.
- The team records one integration owner for each work period before implementation. Shared config,
  service registry, and store changes are serialized through that owner.

## Main Risks and Bounded Mitigations

| Risk                                          | MVP mitigation                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Dynamic native RTL needs reload               | Mirror content immediately with logical styles; use a development build and document the native reload behavior |
| Permission or network failure stalls the demo | Prepared media and deterministic generation remain the primary path                                             |
| Lifecycle edits double-award impact           | One tested approval command and one impact record per mission/submission key                                    |
| Animation work consumes schedule              | Six layered SVG stages first; limit motion to opacity, transform, and short path reveals                        |
| Bilingual content makes screens dense         | Short curated copy, Arabic-first typography review, wrapping tests on the primary device                        |
| Live provider output varies                   | Structured schema validation plus immediate mock fallback; do not depend on live output for judging             |

## Team Approval Items

Before implementation, the three members should confirm:

1. the ten-screen route names and whether reset returns directly to Parent home;
2. the one prepared food image, family-wisdom voice clip, mission-narration clip, evidence asset,
   and bilingual mission story;
3. the Parent-entered quantity units and demo defaults for available time and reward;
4. Ghaf progress points, stage thresholds, and the milestone shown in the demo climax;
5. the prepared audio assets used with required `expo-audio` playback, and whether optional live
   recording or `expo-image-picker` enters scope;
6. whether the competition build needs any live AI experiment; mock mode remains required either way;
7. the primary Android device, preview-build route, and named integration owner for the first work period.

## Post-Design Constitution Re-check

PASS. The data model maintains Parent approval and idempotent impact; the contracts preserve a
complete deterministic mock path; quickstart validation covers both languages, RTL, reset, and
offline rehearsal. No backend, extra screen, production account, financial feature, unrestricted
chatbot, safety determination, continuous recording, or enterprise workstream is required.

## Complexity Tracking

No constitution violation requires justification.
