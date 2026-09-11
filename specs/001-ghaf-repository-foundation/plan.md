# Implementation Plan: Ghaf Repository Foundation

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ghaf-repository-foundation/spec.md`

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

## Summary

Create one Expo mobile application with a strict TypeScript foundation, four small file-based routes,
Arabic/English direction handling, local design tokens, a deterministic mock-service boundary, a
single shared prototype store, and a reusable six-stage Ghaf tree. Feature 001 proves launch,
language direction, role switching, mock mission display, and reset. It deliberately stops before
mission creation or completion.

## Technical Context

**Language/Version**: TypeScript 6.x in strict mode on Node.js 22.13+ (local Node 24.16.0)

**Primary Dependencies**: Expo SDK 57 (`expo` 57.0.15), React Native 0.86, React 19.2.3,
Expo Router 57, `expo-localization`, `i18next`, `react-i18next`, Zustand, React Native SVG,
React Native Reanimated; React Native `StyleSheet` for styling

**Storage**: In-memory prototype state only for Feature 001; persistence deferred

**Testing**: TypeScript compiler, Expo ESLint, Prettier check, Vitest pure-function/service tests,
manual route and Arabic/RTL checks

**Target Platform**: Android physical device first; convenient iOS compatibility; web only as a
secondary development surface

**Project Type**: Single Expo mobile application; no monorepo and no backend

**Performance Goals**: Foundation navigation feels immediate; role and locale controls respond
within one interaction; future tree motion targets smooth transform/opacity animation

**Constraints**: Complete offline mock behavior, deterministic reset, synthetic data, no embedded
secrets, no production authentication, no Feature 002 screens, provisional native identifiers

**Scale/Scope**: One family, one parent, one child, one mock mission, six tree stages, four routes,
and a small reusable component set

## Constitution Check

*GATE: Passed before research and re-checked after design.*

| Principle | Plan evidence | Result |
|---|---|---|
| MVP Prototype First | Four routes, mock-only data, no backend or production work | PASS |
| One Complete Journey | Foundation prepares the shared shell only; it does not claim the constitution's full journey, which Feature 002 must complete before secondary features | PASS (feature-scoped) |
| Design Is a Core Feature | Tokens, branded shell, reusable tree, warm organic visual direction | PASS |
| Arabic-First, Bilingual | Arabic default, two locale resources, RTL-aware primitives, manual checks | PASS |
| Mock-First, Replaceable Services | Five contracts with deterministic mock implementations | PASS |
| Keep Architecture Small | One app, one store, local components, no component framework | PASS |
| Visible AI Value | Foundation discloses a pregenerated mock; visible input-to-mission transformation remains a mandatory Feature 002 gate and is not claimed complete here | PASS (feature-scoped) |
| Honest Prototype Boundaries | Mock badges and limitation docs distinguish simulated behavior | PASS |
| Fast Team Collaboration | Small files, ownership doc, five scoped agents, exact commands | PASS |
| Demo Reliability | Seeded data and `resetDemo()` work with no network | PASS |

Minimum safeguards are represented in `.gitignore`, `.env.example`, synthetic fixtures,
prototype-limitations documentation, and explicit non-goals. No separate security workstream is
created.

## Architecture

```text
Routes / reusable components
          ↓
small Zustand prototype store
          ↓
typed service interfaces
          ↓
deterministic mock services + fixtures
```

- Routes coordinate screens and navigation only.
- Reusable components consume tokens and logical alignment helpers.
- The store owns shared locale, role, mission state, impact, Ghaf stage, mock-mode label, and reset.
- Service interfaces isolate external dependencies; Feature 001 binds only local mocks.
- Locale resources own user-facing bilingual strings. RTL is applied both at the native direction
  boundary and in screen-level logical styles so a platform reload limitation never breaks the demo.

## Foundation Screen Evaluation

| Route | Feature 001 treatment | Deferred to Feature 002 |
|---|---|---|
| Entry | Ghaf identity, Arabic/English controls, enter action | Rich onboarding |
| Role selector | Parent/Child prototype shortcut and mock disclosure | Authentication |
| Parent home | Tree, mock mission, impact summary, role switch, reset | Create/review/confirm flows |
| Child home | Tree, mock adventure, progress/reward preview, role switch | Mission steps/evidence/reflection |

No other route is approved in Feature 001.

## Project Structure

### Documentation (this feature)

```text
specs/001-ghaf-repository-foundation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── service-contracts.md
├── checklists/
│   ├── requirements.md
│   └── foundation.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── _layout.tsx
├── index.tsx
├── role.tsx
├── parent/index.tsx
└── child/index.tsx
assets/
├── animations/
├── audio/
├── demo/
└── images/
src/
├── components/
├── design/
├── features/
│   ├── child/
│   ├── ghaf-tree/
│   ├── impact/
│   ├── missions/
│   ├── onboarding/
│   └── parent/
├── i18n/
├── models/
├── services/
│   ├── interfaces/
│   ├── mock/
│   └── remote/
├── state/
└── utils/
tests/
├── mock-flow.test.ts
└── prototype-state.test.ts
```

**Structure Decision**: Use a single root Expo application. `app/` stays thin; reusable UI and
behavior live under `src/`. Remote service directories are placeholders only and contain no live
provider in Feature 001.

## Implementation Sequence

1. Scaffold the SDK 57 TypeScript/Router application and basic validation commands.
2. Establish models, fixtures, service contracts/mocks, and resettable shared state.
3. Establish design tokens, i18n, RTL utilities, and reusable primitives.
4. Build the four routes and six-stage Ghaf tree placeholder.
5. Add scoped tests and documentation, then validate the exact demo foundation.

After implementation, run `$speckit-converge`. Any appended Feature 001 gap tasks MUST be
implemented and convergence rerun before the foundation is reported complete.

## Post-Design Constitution Re-check

PASS. The design adds no backend, authentication, financial feature, extra application, or screen
outside Feature 001. Every future external capability remains behind a local contract, and all
judge-facing foundation behavior has a deterministic local path.

## Complexity Tracking

No constitution violations require justification.
