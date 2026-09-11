# Implementation Plan: Family Connection Planning

**Branch**: `008-family-connection-planning` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-family-connection-planning/spec.md`

## Summary

Extend the existing first-family Family Basics route with a required primary Parent/guardian
display name, one optional additional Parent/guardian name, and progressive disclosure for up to
six optional named grandparents, aunts, or uncles. Persist the minimized directory through a
strict schema-3 migration. A pure local family-connections module derives exactly one current,
recognition-only Roots & Kinship planning entry per configured relative, including the selected
rhythm and a remote alternative. Whole-family review and Parent Family present the data; Child,
shared, assistant, reward, and executable-task authorities remain unchanged.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Expo 57, React Native 0.86, Expo Router, Zustand, React i18next, and the
existing Ghaf access/r003 components and design tokens

**Storage**: Existing local-family repository over Expo SQLite key-value storage on native,
localStorage on web, and the memory test adapter; upgrade strict schema 2 to schema 3 with v2/v1
migration

**Testing**: Vitest domain, migration, controller, store, bilingual resource, route-source,
privacy-isolation, reset, and regression checks; secondary Firefox web-proxy visual inspection;
physical Android remains authoritative

**Target Platform**: Expo Android application; Arabic-first RTL with equivalent English LTR; web
is a secondary test and visual surface

**Project Type**: Single Expo/React Native mobile application

**Performance Goals**: Recalculate at most six local plan entries synchronously within one render;
add/remove/update controls respond within one interaction frame; make zero network requests

**Constraints**: One local synthetic household; exactly one or two executable Child profiles;
display names only; no contacts, locations, calendar, notifications, analytics, live AI, new route,
new dependency, or new progress authority; 48dp targets; 320dp and 200% text resilience; sole
executable recycling task unchanged

**Scale/Scope**: Three existing routes, one setup component, one pure feature module, three model/
persistence boundaries, two locale branches, one focused test file plus targeted migration and
onboarding regression updates, and narrow product/design/evidence documentation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Child dignity and autonomy**: PASS. Ideas are optional, recognition-only, allow Child choice,
  provide remote alternatives, and create no miss, score, punishment, proof, or closeness judgment.
- **Privacy and minimum collection**: PASS. Only display name, relationship, and rhythm are stored;
  contacts, location, notes, inference, assistant input, and shared projections are prohibited.
- **Parent authority and deterministic journey**: PASS. Parent setup and review own the directory;
  Parent Family is read-only; the canonical recycling assignment remains the sole executable P0
  journey.
- **Arabic-first UAE grounding**: PASS by design. Runtime copy uses MSA and the sourced kinship
  catalog while named UAE cultural/Arabic review remains an explicit release evidence gate.
- **Mock-first and demo reliability**: PASS. Planning entries are pure, local, deterministic, and
  offline; the existing exact reset removes the directory.
- **Small architecture**: PASS. The feature extends the current draft, receipt, repository, store,
  and routes; it adds no server, provider, calendar, notification, account, or library.
- **Truthful AI/capability labels**: PASS. The plan is labeled prepared local behavior and never AI,
  a reminder, a verified visit, or an executable task.
- **Specification discipline**: PASS. Feature 008 spec and checklist were completed before runtime
  edits.

Post-design re-check: PASS. The schema migration is additive and fail-closed; plan entries are
derived rather than persisted; UI contracts explicitly exclude Child/shared/progression authority;
no constitution exception is required.

## Project Structure

### Source Code and Documentation (repository root)

```text
app/
├── access/parent/
│   ├── family-basics.tsx
│   └── review-create.tsx
└── parent/family/
    └── index.tsx

src/
├── components/
│   ├── access/
│   │   └── FamilyPeopleEditor.tsx
│   └── family/
│       └── FamilyConnectionPlan.tsx
├── features/
│   ├── access/parentOnboarding/
│   │   ├── controller.ts
│   │   └── policy.ts
│   ├── family-connections/
│   │   └── index.ts
│   └── local-family/
│       └── schema.ts
├── models/
│   ├── familyConnections.ts
│   ├── localFamily.ts
│   └── parentOnboarding.ts
├── services/local/
│   └── repository.ts
├── state/
│   └── usePrototypeStore.ts
└── i18n/
    └── resources.ts

tests/
├── family-connections.test.tsx
├── local-family-repository.test.ts
├── parent-onboarding-controller.test.ts
└── r003-local-family-onboarding.test.ts

specs/008-family-connection-planning/
├── checklists/requirements.md
├── contracts/family-connection-ui-v1.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

**Structure Decision**: Preserve the single Expo application. Put setup editing and Parent plan
presentation in two small reusable components, all validation and idea derivation in pure feature
boundaries, persistence in the existing local-family repository, and route code in orchestration
only. Expose the plan through a Parent-authority-checked store getter; do not let the Parent Family
route read relative data directly. Do not alter the task service, assignment lifecycle, Child
choices, or any progress ledger.

## Complexity Tracking

No constitution violations require exceptions.
