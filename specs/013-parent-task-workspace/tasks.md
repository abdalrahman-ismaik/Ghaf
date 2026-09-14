# Tasks: Parent Task Workspace

## Phase 1: Specification and foundation

- [x] T001 Reserve exact planning/runtime boundaries in TEAM_OWNERSHIP.md
- [x] T002 Complete spec, research, data model, contract, plan, quickstart, and checklist in specs/013-parent-task-workspace/
- [x] T003 Add RED catalog/repository/workspace contracts in tests/task-catalog.test.ts, tests/saved-task-templates.test.ts, and tests/parent-task-workspace.test.tsx

## Phase 2: User Story 1 - Create and reuse (P1)

- [x] T004 [US1] Expand prepared catalog in src/features/tasks/demoContent.ts
- [x] T005 [US1] Add saved-template model, validation, and repository in src/models/savedTaskTemplate.ts, src/features/tasks/savedTemplates.ts, and src/services/local/savedTaskTemplateRepository.ts
- [x] T006 [US1] Expose repository and reset behavior in src/services/local/index.ts, src/services/index.ts, and src/state/usePrototypeStore.ts
- [x] T007 [US1] Add saved-template reuse controls to src/components/family-growth/ParentTaskComposer.tsx

## Phase 3: User Story 2 - Family task overview (P1)

- [x] T008 [US2] Build the native Parent workspace in src/components/r002a/parent/ParentTaskWorkspace.tsx
- [x] T009 [US2] Export and integrate the candidate with an always-visible create action in src/components/r002a/parent/index.ts and app/parent/index.tsx

## Phase 4: User Story 3 - Responsive modern interaction (P2)

- [x] T010 [US3] Add flag and bilingual copy in src/config/taskWorkspaceFeatureFlag.ts and src/i18n/resources.ts
- [ ] T011 [US3] Validate Arabic/English, compact width, large text, accessibility, reduced motion, and Child privacy

## Phase 5: Validation

- [x] T012 Run focused and full quality gates, detector, Git whitespace, and exports
- [x] T013 Record evidence and final status in specs/013-parent-task-workspace/tasks.md and TEAM_OWNERSHIP.md

## Dependencies

T003 precedes implementation. T004–T006 precede T007–T010. T011–T013 follow the complete candidate.

## MVP

Stories 1 and 2 together are the minimum useful slice: creation remains visible, reusable wording
persists, and Parents can understand the household without weakening Child privacy.

## Validation evidence

- `npm run typecheck`: `PASSED`.
- `npm run lint`: `PASSED` after renaming the workspace's React-reserved `children` prop.
- Feature-owned source/test formatting: `PASSED`. The repository-wide `npm run format:check` now
  reports only `docs/README.md`, changed by a concurrent repository-cleanup commit outside this
  feature's reservation.
- Focused task, lifecycle, Parent/Child presentation, recommendations, catalog, workspace, and saved
  template suite: `PASSED` — 9 files, 87 tests.
- Full `npm test`: `PASSED` — 128 files, 1,391 tests after the concurrent portrait-test update was
  integrated ahead of this feature.
- Impeccable detector on the changed Parent route, workspace, and composer: `PASSED` with `[]`.
- `git diff --check`: `PASSED`.
- Feature-enabled Android export: `PASSED`; this is a bundle check, not physical Android evidence.
- Default-off static web export: `PASSED` for all 39 routes.
- `npx expo install --check`: `FAILED` on existing patch drift: `expo` 57.0.20 expects 57.0.21 and
  `expo-router` 57.0.19 expects 57.0.20. No dependency change was authorized for this slice.
- Playwright web inspection: `PASSED` for Arabic RTL and English LTR at 390 px and 320 px, including
  the stacked Create task panel, All Children, per-Child cards, both horizontal rails, non-carousel
  library path, custom bilingual wording, local save, and deterministic reset clearing the storage
  key. Browser console contained no errors.
- Enlarged native text, reduced motion, Child-device manual traversal, physical Android, and named
  product/cultural/accessibility review: `NOT RUN`. T011 and release activation remain open.

## CE1 — Full catalog execution

- [x] T014 Commit expanded contract, content snapshot, plan and board99 grants.
- [x] T015 Implement occurrence/attempt identity, canonical definitions and fail-closed task services.
- [x] T016 Implement per-profile landscape producer/verifier and immutable accepted award/phase.
- [x] T017 Integrate store context, multiple tasks and profile-only projections with safe reset.
- [x] T018 Connect all24 Parent/Child workflows; task-specific help and zero-growth acknowledgement.
- [x] T019 Test all24×2 profiles and interleaving/retry/duplicate/authority/P0 compatibility.
- [ ] T020 Run serialized static/regression and one bilingual browser batch; resolve actual defects.
- [ ] T021 Commit validated slices, evidence/native-human gaps and exact releases.

This is the user's full-task selection, not activation of the default-off alternative workspace.

2026-09-14 reconciliation: T015–T019 were implemented in the already integrated
CE1 work, recorded by `3b58e95` and
[the publication evidence](../../docs/competition-readiness/workstreams/repository-publication-20260913.md).
Canonical definitions, occurrence engine, catalog screens/store and the 24×2
execution suite are present. These are corrected stale implementation markers,
not new work or reconstructed historical RED runs. T020's remaining bilingual
browser batch and the compound final acceptance rows remain open where evidence
is incomplete. Earlier formatter/dependency observations above are historical;
current checks and remaining gates are recorded in
[the spec completion report](../../docs/competition-readiness/workstreams/spec-completion-20260914.md).
