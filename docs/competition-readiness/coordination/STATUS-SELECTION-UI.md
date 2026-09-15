# Selection control convergence — 2026-09-15

Owner: this session, continuing the user's request to keep improving the UI after
`13795b5`. `git status --short` was empty before any edit except the untracked
`.claude/launch.json` this session created to run the local web surface; that file is a
tool artifact, is not part of the deliverable and is removed before handoff. No active
reservation in `TEAM_OWNERSHIP.md` names the files below.

SELECTION-UI-001 reserves exactly:

- new `src/components/botanical/SelectionChip.tsx` and `src/components/botanical/EmptyState.tsx`
- `src/components/botanical/index.ts`
- `app/parent/index.tsx` (the Tasks section filter rows and their styles only)
- `src/components/r002a/parent/ParentTaskWorkspace.tsx` (child filter and category rail selection only)
- `src/components/catalog/CatalogTaskList.tsx` (empty state only)
- new `tests/presentation/selection-controls.test.tsx`
- `docs/DESIGN.md` (one selection-control convention section),
  new `docs/competition-readiness/workstreams/selection-ui-20260915.md` and this file

Out of scope and untouched: task authority, award rules, filters' business behavior,
routes, guards, stores, services, i18n resources, dependencies, native configuration,
motion presets and every screen not listed above. No new library is added.

Observation surface: the local Expo web dev server at 375x812, used to record the state
before and after the change. Android is authoritative and **NOT RUN** in this session;
device, TalkBack, large-text and contrast-instrument results stay unrun with exact
reproduction steps in the workstream report.
