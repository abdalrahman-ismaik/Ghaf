# Feature015 decisions and source evidence

This is engineering/UX decision research, not a new developmental-effects study. Reuse the existing
competition research report and C's sourced product brief. No new package/API recommendation.

1. Fixed build-selected demo mode: registry/controller/store construction captures objects at module
   evaluation (`src/services/index.ts`, store near controller initialization). Swapping one repository
   would leave stale views/authority. Default ordinary, explicit demo build flag; no same-process switch.
2. Platform-neutral memory factory: existing storage.ts exports a factory that native/web platform
   variants do not. Extract it once and re-export explicitly; all four demo repositories share memory.
3. Existing resume methods: Parent/Child controller methods create fresh capability-scoped synthetic
   sessions without credentials after validated receipt/markers. Do not import test bootstraps or
   directly mutate role. Model IDs already name exactly Parent/Salem/Alya.
4. Atomic rollback: partial restorePairedDevices can leave the first service marker; failed Parent
   authorization plus failed termination can strand a session not retained by its controller. Three
   synchronous private-state wrappers restore directly. Whole-service reset would erase permissions
   and invalidate retained voice state. No generic snapshot is exposed to workers/UI.
5. Initialization: canonical memory family save precedes authority transaction. It may remain after
   failed entry but creates no progress/selected profile. This avoids pretending the access wrappers
   roll back repository writes. Ordinary storage is never selected/read in demo mode.
6. Onboarding: C's released report6da17e9 (integrated a11ced9) supplies immediate profile rows and
   three optional moments. Existing action/support/growth assets are real registry IDs. The new
   three-moment script cannot use old six-clip audio. Begin silent and require actual review for clips.
7. Recovery: current-run handoff uses existing sign-out; process restart resets the isolated demo.
   No speculative persistence, timeline or grant of recovery014.

Read-only helper task_product_trace provided the exact registry/rollback seam review; A accepted
these bounded findings, not a claim that native runtime passed. D technical review is recorded in
analysis.md. Named student/content/voice reviewers remain pending.
