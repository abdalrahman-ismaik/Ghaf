# Implementation Plan: Verified Family Replacement

**Branch**: `integration/r3-complete-screens-20260905` | **Date**: 2026-09-08 | **Spec**:
[spec.md](spec.md)

**Input**: Feature specification from `specs/011-verified-family-replacement/spec.md`

## Summary

Keep **Create a new family** visible on Parent sign-in and extend the existing first-family journey
into a fail-safe one-device replacement flow. A closed transient store intent distinguishes fresh
creation, returning sign-in, and replacement. After accepted deterministic verification, the
onboarding controller stages a fresh draft while holding the previous receipt/draft in memory.
Cancellation restores the previous state. Final review first validates and saves the complete new
directory, then resets prior household runtime authorities and activates the new Parent session.
No route, dependency, network request, second household, production account, or payment is added.

## Technical Context

**Language/Version**: Strict TypeScript 6.0, React 19, React Native 0.86

**Primary Dependencies**: Expo SDK 57, Expo Router 57, Zustand 5, i18next/react-i18next, existing
Expo SQLite key/value boundary

**Storage**: One schema-3 device-local family record through the existing `LocalFamilyRepository`;
replacement intent, backup, draft, verification, and session remain memory-only

**Testing**: Vitest 4 source, controller, store-integration, persistence-failure, localization, and
reset regressions; Expo TypeScript/lint/format gates; web and Android JavaScript exports

**Target Platform**: Android is authoritative; Expo web is the secondary visual/test proxy

**Project Type**: One Expo/React Native mobile application

**Performance Goals**: Entry navigation is immediate; no network wait is introduced; final local
replacement completes within one foreground interaction without partial screen authority

**Constraints**: Arabic-first RTL and English LTR; deterministic offline verification; one local
household; synthetic data only; no production authentication; old family recoverable until final
save; 48dp targets; no dependency or route addition

**Scale/Scope**: Four existing Parent access/setup routes, one controller, one aggregate store,
bilingual resources, one focused test file, and narrow truth/evidence updates

## Constitution Check

*GATE: Passed before research and re-checked after design.*

- **MVP Prototype First / One Complete Journey**: Pass. The existing complete setup journey is
  reused and the missing entry action is repaired without creating another product branch.
- **Design Is a Core Feature**: Pass. Existing access shell, portrait, typography, spacing, fields,
  banners, and actions are reused; replacement copy receives clear hierarchy at entry and review.
- **Arabic-First**: Pass. Every new decision and consequence has equivalent Arabic/English copy,
  logical layout, mixed-identifier behavior, and compact-layout checks.
- **Mock-First / Demo Reliability**: Pass. The deterministic verification and local repository
  remain authoritative, including offline, wrong-code, cancellation, failure, and reset paths.
- **Keep Architecture Small**: Pass. One transient intent and two controller transitions extend the
  existing boundaries; no route, library, provider, schema, or parallel storage is introduced.
- **Visible AI Value**: Not changed. The flow does not add, remove, or relabel AI behavior.
- **Honest Prototype Boundaries**: Pass. Copy and evidence describe one local synthetic family and
  never claim account creation, identity proof, cloud storage, or multi-family tenancy.
- **Fast Team Collaboration**: Pass. Exact files are reserved in `TEAM_OWNERSHIP.md`, and unrelated
  configuration/assets remain untouched.
- **Child safety, privacy, and access separation**: Pass. No Child route can trigger replacement;
  prior household-private state is cleared only after the replacement record is safely saved.

Post-design check: passed. The staged receipt/draft backup is transient, route parameters grant no
authority, the sole persistent write remains a complete validated record, and final activation
resets cross-household runtime data before Parent Home is exposed.

## Project Structure

### Documentation (this feature)

```text
specs/011-verified-family-replacement/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── family-replacement-state.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
app/access/parent/
├── sign-in.tsx
├── sign-up.tsx
├── verification.tsx
└── review-create.tsx

src/features/access/parentOnboarding/
└── controller.ts

src/state/
└── usePrototypeStore.ts

src/i18n/
└── resources.ts

tests/
├── family-replacement-flow.test.ts
└── parent-onboarding-controller.test.ts
```

**Structure Decision**: Preserve the current one-app structure. Routes remain thin, the controller
owns reversible onboarding state, the aggregate store owns the cross-service replacement
transaction, the existing local repository owns the sole persistent family record, and focused
tests cover behavior at each authority boundary.

## Complexity Tracking

No constitution violation or new architecture layer requires justification.
