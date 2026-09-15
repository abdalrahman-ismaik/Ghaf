# Interaction motion convergence — 2026-09-15

Owner: this motion session, continuing the user's explicit request to improve
interaction quality after `35631f7`. `git status --short` was empty before any edit.
No active reservation in `TEAM_OWNERSHIP.md` names the files below; the previous
motion, navigation-motion and backend sessions released their boundaries.

INTERACTION-MOTION-001 reserves exactly:

- `src/design/motion.ts` (additive presets only; frozen `botanical.motion` tokens unchanged)
- `src/components/primitives.tsx` (`IconButton` press path only)
- `src/components/r002a/parent/ParentHomeNavigation.tsx`
- `src/components/r002a/child/ChildBottomNavigation.tsx`
- `src/components/r002a/child/ChildTaskChecklist.tsx`
- `src/components/catalog/CatalogTaskList.tsx` (disclosure wrapper only)
- new `src/components/botanical/ExpandableSection.tsx` and `src/components/botanical/index.ts`
- new `tests/motion/interaction-press-convergence.test.tsx`,
  `tests/motion/checklist-continuity.test.tsx`,
  `tests/motion/expandable-section.test.tsx`
- `src/components/botanical/BotanicalPressable.tsx` (additive `animatedStyle` prop only)
- host test mocks for the new imports in `tests/presentation/parent-dashboard-presentation.test.tsx`
  and `tests/tasks/child-approved-instruction.test.tsx`
- `specs/003-family-growth-garden/motion-interactions.md` (continuation section),
  new `docs/competition-readiness/workstreams/interaction-motion-20260915.md`,
  `docs/motion.md` and this file

Out of scope and untouched: dependencies, `app.config.ts`, native configuration,
navigation options, routes, stores, services, guards, task authority, award rules,
the native `Modal` sheets and their focus lifecycle, existing RN `Animated` code,
`src/design/tokens.ts`, and every screen not listed above. No new library, no
haptics (none installed; `AGENTS.md` requires a measured gap and owner approval),
no blur, shadow, Skia, Lottie or gesture-driven surface is added.

No emulator, physical device, APK build or export job runs in this session; the
disk constraint recorded by the previous sessions still applies. Android, TalkBack,
large-text and frame-timing results stay `NOT RUN` with exact reproduction steps.
