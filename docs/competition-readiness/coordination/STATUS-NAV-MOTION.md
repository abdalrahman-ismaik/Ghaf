# Page-transition polish — 2026-09-14

Owner: this motion session, continuing the user's explicit request to polish page
transitions after `0f90d24`. Working tree was clean. Prior motion reservations are
released; backend's latest source remains untouched. No current backend source
reservation names the files below.

NAV-MOTION-001 to login/backend integration: this session reserves only
`app/_layout.tsx`, `app/parent/_layout.tsx`, `app/child/_layout.tsx`,
`app/access/parent/_layout.tsx` for native transition options (guards unchanged),
new `src/design/navigationMotion.ts`, new `tests/motion/navigation-transitions.test.tsx`,
`tests/growth/r002b-nested-screen-hardening.test.ts` (old fade assertion),
`tests/platform/{web-hydration-boundary,onboarding-presentation-readiness}.test.tsx`
(live preference mock), the motion contract, this file and new
`docs/competition-readiness/workstreams/navigation-motion-20260914.md`.

One read-only `motion_flow_audit` helper verifies installed native navigator APIs;
no helper writes/jobs/descendants. Root retains serialized light checks. Auth
forms, services, state, URLs, actions, guards, dependencies and app configuration
remain outside scope. No device input, installed-APK changes or local/export build
under the continuing disk constraint (about 25 MB free initially). No push/remote
dispatch. Exact reservations are recorded before runtime edits.

NAV-MOTION-002: installed native Stack retains covered Parent screens unlike Slot.
Root additionally reserves focus-lifecycle-only edits in
`app/parent/{index,check-in}.tsx`, `app/parent/family/index.tsx`,
`app/parent/task/{new,review}.tsx`,
`src/components/family-growth/ParentCheckIn.tsx`, and
`src/components/r002b/R002bNestedScreen.tsx`. Existing guards/actions stay identical;
their effects and hardware Back/focus callbacks run only on the focused page.
The helper maps affected host test mocks read-only. No store/auth action changes.

NAV-MOTION-003: read-only audit complete. The one helper slot is reassigned to
`garden_motion` for tests only: `tests/motion/navigation-transitions.test.tsx`,
`tests/growth/r002b-nested-screen-hardening.test.ts`,
`tests/platform/web-hydration-boundary.test.tsx`,
`tests/demo/{demo-task-handoff-route,demo-entry-routes}.test.tsx`, and
`tests/presentation/parent-dashboard-presentation.test.tsx`. Root owns new
`tests/motion/navigation-focus-lifecycle.test.tsx` and all runtime changes.
No helper validation jobs. Composer remount-on-return preserves Slot's previous
fresh draft behavior without changing review/edit URLs or history actions.
