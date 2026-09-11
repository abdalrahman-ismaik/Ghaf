# Implementation Plan: Remembered Device Access

**Branch**: `005-remembered-device-access` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-remembered-device-access/spec.md`

## Summary

Add one strictly validated device-local affinity record alongside the existing family directory.
It stores one Parent-or-Child restart preference but no credential or session. Startup validates
that record against the local family and pairing state, then asks the existing controllers to mint
a fresh synthetic authority synchronously before routing. Parent remembrance is an unchecked
verification-screen option. Completed Child pairing becomes the device's default Child. A distinct
Child-to-Parent handoff ends Child authority but preserves its pairing and device marker; temporary
Parent logout mints a fresh authority for that Child. Parent logout on a Parent-owned device clears
its marker first. Revocation and reset clear matching affinity.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Expo 57, React Native 0.86, Expo Router 57, Zustand 5, Zod 4,
`expo-sqlite/kv-store`, i18next/react-i18next

**Storage**: Existing synchronous device-local key/value abstraction backed by Expo SQLite KV on
native, browser `localStorage` on web, and deterministic memory storage in tests

**Testing**: Vitest 4, component rendering already used by the repository, source-contract tests,
TypeScript, Expo ESLint, and Prettier

**Target Platform**: Android authoritative; web secondary visual/test surface

**Project Type**: Single Expo/React Native mobile application

**Performance Goals**: Validate and resume one marker synchronously during existing startup with no
additional network request and no signed-out screen flash after the app-owned loading sequence

**Constraints**: Offline deterministic behavior; one synthetic household; one remembered principal
per installation; no persisted session/token/code; no simultaneous Parent/Child authority; reset
must be complete; Arabic-first parity; no new dependency or production-authentication claim

**Scale/Scope**: One versioned record, two controller resume methods, one store handoff state, one
small reusable access control, and additive changes to existing access/settings surfaces

## Constitution Check

*GATE: Passed before research and re-checked after design.*

- **MVP Prototype First / One Complete Journey**: Pass. This removes repeat login from the local
  judge path without adding production infrastructure or a second app.
- **Design / Arabic First**: Pass. One accessible choice and one temporary-access notice use the
  existing typography, tokens, logical layout, bilingual resources, and 48dp controls.
- **Mock First / Demo Reliability**: Pass. Resume is fully local, synchronous, network-free, and
  cleared by the existing deterministic reset.
- **Keep Architecture Small**: Pass. The design reuses the current storage abstraction, access
  services, controllers, store, and route guards; it adds no package.
- **Honest Prototype Boundaries**: Pass. The marker explicitly says local prototype continuity and
  cannot be represented as a token, account, secure device trust, or cross-device synchronization.
- **Fast Team Collaboration**: Pass. Exact planning/runtime boundaries are reserved in
  `TEAM_OWNERSHIP.md`; protected unrelated worktree edits remain outside commits.
- **Visible AI Value**: Not affected. No AI contract, provider, prompt, or progression behavior is
  changed.

Post-design re-check: all gates still pass. No constitution exception requires complexity tracking.

## Architecture and State Sequence

```text
App startup
  -> read local family + paired profiles
  -> read and strictly validate one device-affinity marker
  -> Parent marker: validate family receipt -> mint fresh Parent authority -> /parent
  -> Child marker: validate configured active pairing -> mint fresh Child authority -> /child
  -> absent/mismatch/corrupt/read failure -> signed-out Welcome

Remembered Child -> Parent access
  -> terminate Child authority
  -> retain Child pairing + affinity marker
  -> keep return Child ID in memory only
  -> Parent verifies -> fresh Parent authority
  -> Parent logout -> terminate Parent authority -> validate pairing -> fresh Child authority
  -> revoked/missing pairing -> signed-out Welcome
```

Only the currently active controller session authorizes private routes. The persistent marker never
passes an authorization guard by itself.

## Project Structure

### Documentation (this feature)

```text
specs/005-remembered-device-access/
├── checklists/requirements.md
├── contracts/device-access-v1.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── access/parent/
│   ├── sign-in.tsx
│   └── verification.tsx
├── child/
│   ├── index.tsx
│   ├── settings.tsx
│   └── task.tsx
├── circle.tsx
└── garden.tsx

src/
├── components/access/
│   └── RememberDeviceChoice.tsx
├── features/access/
│   ├── childAccess.ts
│   ├── parentOnboarding/controller.ts
│   └── rememberedDeviceAccess.ts
├── models/
│   └── deviceAccess.ts
├── services/local/
│   └── deviceAccessRepository.ts
├── services/index.ts
├── state/usePrototypeStore.ts
└── i18n/resources.ts

tests/
└── device-remembered-access.test.tsx
```

**Structure Decision**: Keep all behavior inside the existing Expo application. A small model,
parser/policy module, and repository make the persisted boundary independently testable. Existing
controllers mint authority, the store sequences mutual exclusion and handoff, and routes remain
thin. No screen calculates access authority.

## Complexity Tracking

No constitution violations.
