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

## T014 decisions — exact approved narration

- Decision: isolate the demo playback controller/hook. Existing ordinary useOnboardingNarrator
  autoplays; its pure helper suppresses failures and does not expose this story's loading/error
  surface. Reuse its revision-cancellation pattern, preserving ordinary runtime unchanged.
- Decision: use current expo-audio57.0.4 and one manually owned player per explicit intent. Installed
  types define synchronous pause/play and asynchronous seekTo; stale seek completion must recheck
  current permission/revision. Coalesce requests to avoid overlapping seeks on the same player.
- Decision: narrator lives outside the keyed AccessScreen; synchronous event cancellation plus
  generation/entry epoch and layout cleanup cover handoff/reset/source changes. Unknown accessibility
  state fails silent rather than assuming web screen-reader absence. No JS-initiated auto-resume.
- Evidence: A readonly narration_contract_seams inspected exact source/player APIs; no media was
  played or generated. Full findings informed contracts/demo-narration-v1.md. Existing render-to-
  string tests cannot establish effects, so mounted lifecycle evidence needs the separate existing-tool harness.
- Limit: Expo web play discards its underlying promise; no exhaustive browser error-handling claim.
  Android native verification remains authoritative. User approved three clips; Free-plan provenance is user-reported and
  C-N06 records conditional noncommercial/attribution terms; public use remains unresolved. No public release selected.

D059 revision findings incorporated: recheck request identity after successful reentrant guards/
callbacks, fail closed on unknown AppState or foreground-subscription failure, and preserve
truthful validation gates. Current Node/SSR setup lacks mounted test dependencies; esbuild is
also unavailable. Existing Metro/ReactDOM/Playwright harness preparation is a later bounded
preview task, not an invented current test capability. Required mounted rows remain BLOCKED.
A publishes shared required types/caller/resources/fixtures before transferring C's presentation
boundary. Actual user now reports Free plan; C-N06 owns primary-source use/attribution research.

D060 and A's narrow installed-source follow-up establish why pause-only cleanup is insufficient:
AudioModule.kt:544 removes only registry membership; BaseAudioPlayer.kt:154 schedules physical
release on the main dispatcher after SharedObject release. Use manually owned createAudioPlayer
with downloadFirst:false, a new controller per explicit intent, identity invalidation then guarded
cancel/dispose, subscription removal, player.remove and player.release. No useAudioPlayer/global
mode/dependency patch. Already-captured native references and unobserved focus-loss/gain remain a
native acceptance gap, not an absolute cancellation guarantee. Android status.playing can represent
intended playback while buffering and status.error is hardcoded null; require loaded/nonbuffering
status, a 10-second startup fallback, and retire observed interruptions. All results are source
inspection, not acoustic/device evidence. Helper completed read-only and released; no execution.
