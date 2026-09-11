# Implementation Plan: Role Header Branding

**Branch**: `012-role-header-branding` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-role-header-branding/spec.md`

## Summary

Compose the existing immutable `GhafRasterLogo` with existing localized titles at the shared role
header boundaries. Introduce one small `GhafHeaderTitle` component for compact dashboard, flow, and
R002b headers, then apply the same raster source to the structurally different journey header. Keep
the logo decorative, preserve current title colors and semantics, use logical title ordering, and
change no route, state, string, asset, package, or product behavior.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode

**Primary Dependencies**: Existing Expo 57, React Native 0.86, Expo Image 57, Expo Router, current
design tokens and primitives; no dependency addition

**Storage**: N/A; presentation-only

**Testing**: Vitest source/component contracts, TypeScript, Expo ESLint, Prettier, real web layout
inspection, and static web/Android JavaScript exports

**Target Platform**: Android is authoritative; web is a secondary visual and test surface

**Project Type**: Existing single Expo/React Native application

**Performance Goals**: Reuse one bundled memory/disk-cached image source; no extra request or route
work; no visible image transition

**Constraints**: Arabic-first RTL and English LTR; 320/390 dp and 200% text; one decorative mark per
screen header; immutable official asset; offline; no new copy, state, dependency, or behavior

**Scale/Scope**: One reusable title composition, five shared header integrations, one focused test
file, and feature evidence

## Constitution Check

_GATE: Passed before research and re-checked after design._

- **MVP Prototype First / One Complete Journey**: Pass. Only shared presentation changes; all
  deterministic routes and state remain intact.
- **Design Is a Core Feature**: Pass. Repeated brand identity directly addresses the requested
  dashboard and role-screen polish while retaining a clear screen-title hierarchy.
- **Arabic First**: Pass. Logical row direction and natural title wrapping are explicit.
- **Mock First / Demo Reliability**: Pass. The source is bundled, cached, transition-free, and
  non-blocking on decode failure.
- **Keep Architecture Small**: Pass. One small reusable composition extends the existing design
  system and existing shared headers; no package or state is added.
- **Honest Prototype Boundaries**: Pass. The change makes no capability, impact, security, or
  production claim.
- **Fast Team Collaboration**: Pass. Runtime and test files are disjoint from the concurrent
  Feature 011 access/onboarding/store reservation; its work is preserved.
- **Child safety, access separation, AI boundaries**: Not affected. No domain content, authority,
  capture, assistant, task, privacy, or progression behavior changes.

Post-design re-check: all gates still pass. No exception requires complexity tracking.

## Composition Flow

```text
existing route title + direction/language
  -> existing shared role header family
  -> GhafHeaderTitle (compact families) or JourneyHeader title composition
  -> decorative GhafRasterLogo + sole semantic Text heading
  -> unchanged Back/action/profile/help controls and unchanged screen content
```

## Project Structure

### Documentation (this feature)

```text
specs/012-role-header-branding/
├── checklists/requirements.md
├── contracts/role-header-branding.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
src/components/brand/
├── GhafHeaderTitle.tsx
├── GhafRasterLogo.tsx
└── index.ts

src/components/r002a/
├── R002aFlowHeader.tsx
├── child/ChildHomeHeader.tsx
└── parent/ParentHomeHeader.tsx

src/components/r002b/R002bNestedScreen.tsx
src/components/journey.tsx
tests/role-header-branding.test.tsx
```

**Structure Decision**: Put the repeated compact composition in the existing brand component
boundary and consume it from the four compact header families. Keep the journey integration inside
its established shared component because its prominent content hierarchy differs from navigation
chrome. Routes remain unchanged and inherit branding from their existing headers.

## Complexity Tracking

No constitution violations.
