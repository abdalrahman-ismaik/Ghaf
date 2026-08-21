# Ghaf — غاف

**Project:** Ghaf — غاف

**Stage:** MVP Prototype

**Purpose:** SMAC 2026 competition demo

**Production-ready:** No

Ghaf is an Arabic-first family sustainability application that transforms a parent's or
grandparent's voice message and a real household food-waste situation into a personalized,
parent-approved adventure for a child.

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

The Ghaf tree is the product's central metaphor: family action grows a seed into a full tree. It is
the hero visual, progress indicator, reward system, emotional anchor, and climax of the competition
demo—not a decorative logo.

## Current Scope

Feature 001 builds the smallest useful foundation:

- one Expo/React Native application with strict TypeScript and Expo Router;
- Arabic and English selection with visible RTL/LTR treatment;
- entry, role-selector, Parent, and Child routes;
- a single-device Parent/Child role switch in place of authentication;
- one synthetic pregenerated mission, seeded impact, and deterministic mock services;
- a reusable six-stage Ghaf tree and small token-based component system;
- one-action reset to a known Arabic-first demo baseline.

Feature 002 implements the full Parent → Child → confirmation → impact → tree-growth journey with
deterministic local services and synthetic prepared media. The team approved this scope on
2026-08-22 with Member 1 as integration owner. Local checks and five bilingual browser rehearsals
pass; physical Android and three-person timed rehearsal gates remain open. Live AI, camera capture,
audio recording, and remote storage stay deferred until the mock journey is reliable on the team's
primary Android phone.

## Competition Demo Path

```text
Ghaf entry
    ↓
Arabic or English
    ↓
Prototype role selector
    ↓
Prepared food image + family voice message
    ↓
Four-stage simulated mission generation
    ↓
Parent bilingual review and approval
    ↓
Child completes three steps, evidence, and reflection
    ↓
Parent confirms the estimated impact
    ↓
Ghaf grows from Sapling at 48% to Young tree at 60%
    ↓
Reset Demo to the ready-to-create baseline
```

The AI transformation is visible but honestly labeled as simulated processing over a pregenerated
bilingual mission. The complete required path makes no remote request.

## Quick Start

### Prerequisites

- Node.js 22.13 or newer
- npm
- Android Studio/emulator or an Android physical device for native RTL verification
- a trusted Codex project session to discover project-scoped agents

No API key, backend account, or real child information is required.

### Install and run

```bash
npm ci
npm start
```

Choose the Android target from Expo, or run:

```bash
npm run android
```

Web is a secondary development surface; it does not replace physical Android RTL validation.

### Validate

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Useful scope guards:

```bash
rg -n -i '\b(ATHAR|Athar)\b' . --hidden -g '!.git/**' -g '!node_modules/**' -g '!dist/**' -g '!README.md'
rg -n '(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY[[:space:]]*=[[:space:]]*[^[:space:]#]+)' . --hidden -g '!.git/**' -g '!node_modules/**' -g '!dist/**' -g '!README.md'
find app -type f -print | sort
rg -n 'https?://|fetch\(|axios|supabase|firebase|stripe|payment|bank' src app --glob '*.{ts,tsx}'
```

The Arabic noun `أثر` may appear in copy with its ordinary meaning, “impact”; it must never appear
as the application name or legacy branding.

Use `npm install` rather than `npm ci` only when intentionally changing dependencies and updating
the lockfile. See the full [foundation quickstart](specs/001-ghaf-repository-foundation/quickstart.md)
and [demo runbook](docs/DEMO_RUNBOOK.md).

## Deterministic Reset Baseline

`Reset Demo` must always restore:

| Field                | Starting value               |
| -------------------- | ---------------------------- |
| Locale and direction | Arabic (`ar`), RTL           |
| Role                 | Parent                       |
| Mode                 | Mock                         |
| Mission              | Empty, ready-to-create draft |
| Food rescued         | 1,250 g                      |
| Portions rescued     | 5                            |
| Completed missions   | 3                            |
| Family streak        | 2 days                       |
| Ghaf progress        | Stage 2 — Sapling, 48%       |

Prepared assets and the unassigned pregenerated fallback remain available after reset. Impact and
tree state remain coherent while switching Parent → Child → Parent. Reset and offline rehearsal
details are in [DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md).

## What Is Real and What Is Simulated

| Classification           | Prototype treatment                                                                                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real in the MVP          | Ten-screen navigation; Arabic/English and directional layouts; role switching; validated mission inputs; Parent review/approval; Child steps/evidence/reflection; Parent retry/confirmation; local impact update; six-stage Ghaf rendering and bounded growth motion; reset |
| Prepared                 | Two synthetic JPEGs and four synthetic bilingual MP3 clips are bundled behind one media-ID adapter; native playback still needs physical-device validation                                                                                                                  |
| Mocked                   | Mission, media metadata, AI, impact, and prototype-session providers are deterministic local `Mock*` implementations; no remote service is required                                                                                                                         |
| Seeded                   | One synthetic family, one Parent, one Child, initial impact totals, and Sapling progress; reset has no assigned mission                                                                                                                                                     |
| Simulated / pregenerated | Four timed processing stages reveal a curated structured bilingual mission; this is not a live model response                                                                                                                                                               |
| Optional later           | One minimal server-side AI proxy, visible-action recording, image picking/camera capture, and local or remote persistence after the Android mock gate passes                                                                                                                |
| Future                   | Production authentication, child accounts, privacy controls, multiple families, schools, banking, real rewards, marketplace, social feed, production deployment, and store release                                                                                          |

The app does not determine whether food is safe to eat. Seeded impact values are demonstration
estimates, not sensor or computer-vision measurements. See
[PROTOTYPE_LIMITATIONS.md](docs/PROTOTYPE_LIMITATIONS.md).

## Small Architecture

```text
Expo Router routes and reusable local components
                    ↓
      one bounded Zustand prototype store
                    ↓
        five TypeScript service contracts
                    ↓
       deterministic local mock services
```

The service boundary consists of:

- `MissionService`
- `MediaService`
- `AIService`
- `ImpactService`
- `PrototypeSessionService`

Routes use store commands plus one prepared-media ID resolver; the store binds the central service
registry rather than importing remote providers into screens. A later approved provider therefore
stays behind the existing contracts and media adapter.

## First-Draft Technology Stack

Every decision in this section remains **PROPOSED** until the team validates the first plan and the
primary Android device.

| Area              | Recommendation                                                                                                        | Why it helps the MVP                                                             | Main downside                                                | Alternative                                                            | Status   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | -------- |
| Spec workflow     | Official GitHub Spec Kit 1.0.1, pinned, with Python scripts and Codex integration                                     | Gives the team one specification-to-task workflow and deterministic tooling      | Adds ceremony if features grow too large                     | Official `specify-cli==1.0.1` PyPI distribution                        | PROPOSED |
| Mobile foundation | Expo SDK 57, React Native, strict TypeScript, Expo Router, Android first                                              | Fast single-app iteration with a small file-based route model                    | Current SDK requires a recent Node runtime and native checks | SDK 56 only if a concrete compatibility blocker appears                | PROPOSED |
| Styling           | React Native `StyleSheet`, central tokens, local components                                                           | Makes RTL and visual decisions explicit with little configuration                | More verbose than utility classes                            | Time-box NativeWind only if it demonstrates a clear speed gain         | PROPOSED |
| Localization      | `i18next`, `react-i18next`, `expo-localization`, and `I18nManager` plus logical styles                                | Supports Arabic-first copy and visible direction on every route                  | Native direction changes may require an app reload           | Instant translated copy with device-locale global direction            | PROPOSED |
| Shared state      | One small typed Zustand store; local React state for isolated controls                                                | Keeps role, locale, mission, impact, tree, and reset coherent across routes      | A global store can grow carelessly                           | React Context with `useReducer`                                        | PROPOSED |
| Ghaf visual       | Six layered `react-native-svg` stages with restrained Reanimated transition motion                                    | Lightweight, reusable, deterministic, and expressive enough for the demo climax  | Bespoke SVG artwork takes focused design time                | Six transparent images; Lottie only if finished assets exist           | PROPOSED |
| Media             | Bundled prepared images plus `expo-audio` for prepared playback; image picking and recording later                    | Keeps the required path offline while voice-note and narration playback are real | Live permissions and recording add device failure modes      | Keep prepared audio as a visibly selected fixture without live capture | PROPOSED |
| Forms             | React Hook Form, Zod, and the Zod resolver for the bounded mission and confirmation inputs                            | Prevents broken demo states with a familiar small schema                         | Adds three small dependencies                                | Local state with targeted validation                                   | PROPOSED |
| Real AI           | At most one small server-side proxy after the mock journey works                                                      | Keeps the OpenAI secret outside the mobile app and contains the integration      | Introduces network and deployment risk                       | Use pregenerated outputs for the entire demo                           | PROPOSED |
| Testing           | Typecheck, lint, format check, focused pure/service tests, one mock-flow smoke test, and manual Android RTL rehearsal | Protects the demo path without a large test program                              | Automated UI coverage remains intentionally limited          | Add focused component tests only where regressions recur               | PROPOSED |
| Build path        | Expo development build for RTL/native work; later an Android preview APK                                              | Enables realistic iteration and a Metro-independent rehearsal artifact           | Requires signing/build setup and rebuild time                | `npx expo run:android` locally                                         | PROPOSED |

No large component framework, Redux, monorepo, separate Parent/Child apps, production backend, or
real-time 3D tree is proposed.

## Spec Kit Status

| Item                   | Value                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Installed CLI          | `specify-cli 1.0.1`                                                                                                    |
| Installation source    | Official `github/spec-kit` tag `v1.0.1`, installed with `uv`                                                           |
| Pinned install command | `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.0.1`                                 |
| Initialization command | `specify init --here --integration codex --script py`                                                                  |
| Script type            | Python (`py`); local Python reported by the CLI is 3.12.3                                                              |
| Integration            | Codex initialized; official skills are under `.agents/skills/`                                                         |
| Constitution           | [`.specify/memory/constitution.md`](.specify/memory/constitution.md)                                                   |
| Feature 001            | [`specs/001-ghaf-repository-foundation/`](specs/001-ghaf-repository-foundation/)                                       |
| Feature 002            | [`specs/002-ghaf-core-mvp/`](specs/002-ghaf-core-mvp/) — approved 2026-08-22; deterministic mock implementation active |

Available project skills include `speckit-constitution`, `speckit-specify`, `speckit-clarify`,
`speckit-plan`, `speckit-checklist`, `speckit-tasks`, `speckit-analyze`, `speckit-implement`,
`speckit-converge`, and `speckit-taskstoissues`. Feature 001 uses the full cycle through convergence;
Feature 002 completed its planning cycle and deterministic mock implementation. Its remaining
acceptance gates are the named physical Android journey and human timed/concept rehearsals.

`.specify/feature.json` is intentionally machine-local. In a fresh clone, select the active feature
before running Spec Kit scripts:

```bash
export SPECIFY_FEATURE_DIRECTORY=specs/002-ghaf-core-mvp
```

## Project Agents

Standalone agent definitions are discovered from `.codex/agents/` after the repository is trusted.
`.codex/config.toml` enables agents and limits the session to four concurrent threads; it does not
duplicate-register the standalone files.

| Agent                     | Purpose                                                                       | Default write scope                                                                    | Use it when                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ghaf-orchestrator`       | Spec Kit coordination, scope control, ownership, integration                  | Coordination docs, plan/design artifacts, and explicitly reserved shared configuration | Dividing a feature, resolving ownership, integrating results, or running convergence |
| `ghaf-product-spec-agent` | Product stories, acceptance criteria, bilingual terminology, scope protection | Active `spec.md`, feature checklists, assigned limitations copy                        | Specifying or reviewing judge-visible product behavior                               |
| `ghaf-ui-expo-agent`      | Expo routes, design system, Arabic/RTL, motion, tree visual                   | `app/`, UI/design/i18n feature areas, visual assets, assigned design direction         | Building or reviewing an approved mobile screen or reusable visual                   |
| `ghaf-ai-prototype-agent` | Mission schema, mock AI/media, service boundaries, shared logic               | Models, services, state, mission/impact logic, prepared demo fixtures                  | Building deterministic mission/impact behavior or a later approved adapter           |
| `ghaf-demo-qa-agent`      | Exact demo flow, offline/reset, Arabic/RTL, visual consistency                | Focused tests and the demo runbook                                                     | Rehearsing, recording evidence, and separating blockers from optional polish         |

Only one agent may write a file area at a time. See [TEAM_OWNERSHIP.md](docs/TEAM_OWNERSHIP.md).

## Repository Status

Evidence recorded on 2026-08-22. `NOT RUN` means no direct command or device observation had been
recorded when this table was updated; it is not a pass or failure.

| Check                                      | Status  | Evidence                                                                                      |
| ------------------------------------------ | ------- | --------------------------------------------------------------------------------------------- |
| Official Spec Kit CLI version              | PASSED  | `specify version` reported 1.0.1                                                              |
| Codex Spec Kit skill directories           | PASSED  | Ten official project skill directories are present under `.agents/skills/`                    |
| Constitution and both feature cycles       | PASSED  | Feature 001 is code-converged; Feature 002 deterministic implementation is locally complete   |
| Project-agent definitions                  | PASSED  | Five standalone TOMLs plus one concurrency-only config are present                            |
| Clean-checkout dependency install          | PASSED  | `npm ci` completed successfully from the lockfile                                             |
| TypeScript typecheck                       | PASSED  | `npm run typecheck` exited successfully on 2026-08-22                                         |
| Lint                                       | PASSED  | `npm run lint` exited successfully on 2026-08-22                                              |
| Formatting validation                      | PASSED  | `npm run format:check` reported all matched files compliant on 2026-08-22                     |
| Focused tests                              | PASSED  | `npm test`: 5 files and 32 tests passed on 2026-08-22                                         |
| Expo web static export                     | PASSED  | Ten authored routes plus Expo's two built-ins bundled successfully                            |
| Rendered app launch and hydration on web   | PASSED  | Five 412×915 local-export journeys completed with no page or console errors                   |
| Arabic and English selection on web        | PASSED  | Rehearsal observed `rtl`/`ltr`, row order, back icons, and logical progress origin            |
| RTL on primary Android device              | BLOCKED | This environment has no connected phone, Android SDK, or `adb`; no native result was inferred |
| Complete deterministic mock journey on web | PASSED  | Five flows covered all ten screens, retry, validation, dynamic quantities, and Ghaf 48→60     |
| Reset and Back-history recovery on web     | PASSED  | Five resets restored the exact baseline; Back did not reopen prior journey state              |
| External-service-free web journey          | PASSED  | Every non-local request was denied; all interactions used only the exported local assets      |
| Prepared audio on physical Android         | BLOCKED | Bundled playback is implemented; no device is available to verify native playback             |
| Offline Android preview-build flow         | BLOCKED | No Android SDK/device is available here to build or install the preview APK                   |

Update a row only with a command result or recorded device/build observation. Do not convert native
or physical checks to `PASSED` from source inspection.

## Repository Map

```text
app/                 Expo Router routes
assets/              images, audio, animation, and prepared demo assets
src/components/      reusable local UI
src/design/          shared visual tokens
src/features/        bounded product areas
src/i18n/            Arabic/English resources and direction helpers
src/models/          prototype data contracts
src/services/        replaceable interfaces plus mock/remote adapters
src/state/           resettable shared prototype state
.specify/            official Spec Kit templates, scripts, and constitution
.agents/skills/      official project-scoped Spec Kit skills
.codex/agents/       five focused Ghaf custom agents
specs/               primary feature planning artifacts
docs/                only the four small prototype support documents
```

## Team Workflow

Member 1 is the current Feature 002 integration owner. Member 2 owns AI/application logic. Member 3
owns product/content/QA/presentation. Exact, non-overlapping file areas and the handoff format are
in [TEAM_OWNERSHIP.md](docs/TEAM_OWNERSHIP.md); setup and branch guidance are in
[CONTRIBUTING.md](CONTRIBUTING.md).

Do not commit API keys or real child data. Do not push repository changes unless explicitly
authorized.
