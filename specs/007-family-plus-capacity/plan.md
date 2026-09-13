# Implementation Plan: Family Plus Capacity Preview

**Branch**: `007-family-plus-capacity` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-family-plus-capacity/spec.md`

## Summary

Add a Parent-only 3–6-Child Ghaf Plus offer beside the existing one/two-Child selector. A local
bottom sheet compares the complete ad-free Free plan with a proposed household subscription,
labels AED pricing as a hypothesis, and states that this prototype processes no purchase or extra
profile. A small immutable catalog and integer-price helpers keep capacity, savings, and commercial
scenario arithmetic exact. The validated one/two-Child draft, persistence schema, and all Child
journeys remain unchanged.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Expo 57, React Native 0.86, Expo Router, React i18next, Reanimated, the
existing Ghaf design tokens and native component primitives

**Storage**: None for this feature; the existing schema-2 local family directory remains limited to
one or two configured Child profiles

**Testing**: Vitest pure-domain, bilingual resource, source-contract, and regression checks;
web-proxy visual inspection; physical Android remains the authoritative native gate

**Target Platform**: Expo Android application; Arabic-first RTL and equivalent English LTR; web is
secondary visual evidence

**Project Type**: Single Expo/React Native mobile application

**Performance Goals**: Open and dismiss the local preview within one interaction frame; preserve
60fps transform/opacity motion on the UI thread; make zero network requests

**Constraints**: Offline; no billing SDK, purchase, entitlement, account, analytics, new Child ID,
schema migration, child-facing commercial copy, or reward/progression authority; 48dp targets;
320dp and 200% text resilience; Android Back closes the preview first

**Scale/Scope**: One existing Parent setup route, one reusable plan-preview component, one pure
family-plan module, two locale resource branches, one focused test file, one commercial-case
document, and narrow truth/evidence updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Child dignity and free core**: PASS. Capacity is Parent-only and never changes a Child's task,
  help, award, safety, access, privacy, or earned progress.
- **Complete deterministic journey**: PASS. One/two-Child setup remains the only executable path;
  the preview is additive and offline.
- **Prototype truth**: PASS. Price is labeled proposed, no purchase or entitlement is simulated,
  and actual 3–6-Child support is explicitly future work.
- **No production finance**: PASS. No billing SDK, checkout, transaction, wallet, or payment state
  is introduced.
- **Arabic-first Android**: PASS by design. Bilingual resources, logical direction, Android Back,
  compact width, and reduced-motion behavior are part of the contract; physical proof remains a
  later evidence gate.
- **Specification discipline**: PASS. Feature 007 was specified and checked before behavior edits.
- **Small-team maintainability**: PASS. The plan adds no dependency, route, persistence schema, or
  store authority.

Post-design re-check: PASS. The data model is immutable presentation metadata; the UI contract has
no authority path; validation preserves the existing deterministic acceptance journey.

## Project Structure

### Source Code and Documentation (repository root)

```text
app/access/parent/
└── family-basics.tsx

src/
├── components/access/
│   └── FamilyPlusPreview.tsx
├── features/family-plan/
│   └── index.ts
└── i18n/
    └── resources.ts

tests/
└── family-plus-capacity.test.tsx

docs/
└── GHAF_PLUS_COMMERCIAL_CASE.md

specs/007-family-plus-capacity/
├── checklists/requirements.md
├── contracts/family-plus-preview-v1.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

**Structure Decision**: Preserve the single Expo application. Keep the route thin, put the visual
and accessibility behavior in one access component, keep commercial arithmetic in a pure feature
module, and leave the store, local-family schema, services, and Child routes untouched.

## Complexity Tracking

No constitution violations require exceptions.
