# Implementation Plan: Parent Task Workspace

## CE1 execution plan — 2026-09-13

Follow [catalog-execution.md](contracts/catalog-execution.md): commit scope/content first; build
instance/attempt authority and independent recognition validation; integrate store projections;
connect existing Parent/Child UI; verify all24×2profiles, zero/positive awards, retries and reset.
Keep the alternate workspace flag off and reuse existing libraries. C115/C116 supply reviewed
engineering content, with human review pending. Canonical board99 owns exact sequential grants.

**Branch**: `013-parent-task-workspace` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

## Summary

Add a default-off native Tasks workspace candidate through one reusable Parent component, expand
the prepared local catalog to three examples per existing category, and add a strict device-local
repository for at most 20 Parent-saved bilingual wording templates. Integrate saved-template reuse
inside the existing builder and clear the repository through reset/replacement. Preserve the
canonical executable journey, existing store authority, Child projection, dependencies, and
flag-off presentation.

## Technical Context

**Language/Version**: strict TypeScript 6, React 19, React Native 0.86, Expo 57

**Dependencies**: existing Expo Router, Zustand, i18next, StyleSheet, Pressable, FlatList, Zod;
no new dependency

**Storage**: existing synchronous device-local key/value adapter; one versioned bounded record

**Testing**: Vitest source/domain/component contracts, typecheck, lint, format, full tests, exports

**Target**: Android authoritative; web secondary

**Constraints**: Arabic-first RTL, 320 dp, 48 dp targets, no autoplay, default-off flag, one
executable P0 task, Parent-only saved templates, exact reset

## Constitution Check

All gates pass: the design makes creation and family planning legible; prepared/local fallbacks
remain offline; no new library or production service is introduced; Arabic/English and Child
privacy are explicit; custom wording remains under Parent review and carries no authority.

## Project Structure

New code is limited to `src/models/savedTaskTemplate.ts`,
`src/features/tasks/savedTemplates.ts`, `src/services/local/savedTaskTemplateRepository.ts`,
`src/config/taskWorkspaceFeatureFlag.ts`, and
`src/components/r002a/parent/ParentTaskWorkspace.tsx`. Existing integration files expose the
repository, clear it during reset/replacement, add localized copy, and select the flag-off or
candidate presentation.

## Complexity Tracking

One small repository is justified by the explicit persistence/reset requirement. No screen route,
state library, form library, or carousel package is added.
