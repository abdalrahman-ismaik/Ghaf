# Android motion repair contract — 2026-09-14

Authority: the user's explicit request for compatible, restrained interaction
improvements in the existing app. This is presentation repair, with no new product
capability, screen, gesture, progression, authentication or messaging behavior.
Current Feature 003 spec already requires animation not to delay access.

## Scope and plan

1. Preserve native Pressable accessibility and business callbacks. Share subtle
   press timing and a well-damped release spring; never gate an action on motion.
   Use a static nonspatial press alternative when system motion is disabled.
2. Subscribe to live system reduced-motion changes, refresh on foreground, stop
   motion in background and remove subscriptions when unused. Late asynchronous
   preference reads must not override newer events or affect remounted consumers.
3. Retarget existing success-sheet presentation from its current state. Preserve
   route-owned Back, immediate dismissal/actions, safe areas, scrolling and focus.
   No custom draggable sheet or navigation migration.
4. Remove the obsolete 900 ms minimum major-section dwell: readiness alone ends
   the overlay; interruption cannot strand it or let a stale load hide a new one.
   This supersedes only that dwell in earlier first-run plan/tasks. Startup splash
   and explicit story playback timing remain unchanged.
5. Reuse live preferences for the existing leaf loader. Retain its static busy
   semantics and brand; no additional loop or celebratory animation.

## Main native continuation

The user's follow-up authorizes native implementation and verification on `main`
without commits. Baseline emulator evidence at 360 × 640 dp shows the onboarding
Next control initially clipped; scrolling reveals it. Reuse the existing native
footer for progress/Next/Back, preserving the story scroller and web layout.
Connect onboarding to the shared live motion preference. Only a new step starts
its entrance; preference changes settle/cancel without replay. Use the shared
180 ms state preset for image/copy together, removing the copy stagger. Narration
still waits for the current image and completed presentation; stale step timers
remain cancelled. This explicitly supersedes the earlier unchanged story-timing
statement for this bounded continuation. No new product or account behavior.

Evidence and remaining native gates are recorded in
`docs/competition-readiness/workstreams/native-motion-main-20260914.md`.

## Tasks and acceptance

- [x] Record baseline source findings, versions and focused test results.
- [x] Implement and test representative shared press feedback and live preferences.
- [x] Reuse motion conventions in existing sheet/loader and repair overlay cancellation.
- [x] Run proportional static and regression checks; record exact results.
- [x] Document presets, ownership handoff, remaining native acceptance and manual procedure.

Local completion: TypeScript and full ESLint passed; 2,765 tests passed / 2 opt-in
tests skipped, including 31 new motion cases. Changed-file formatting passed; full
format check flags one unchanged baseline file, documented in `docs/motion.md`.
Native acceptance remains NOT RUN for this candidate, separately from these tasks.

Test rapid presses/cancellation without synthetic business callbacks, disabling and
unmount cleanup; event/query races; interrupted section loading; live preference
changes and backgrounding; sheet focus/actions and hidden state. Native release
frame timing, TalkBack, Back, keyboard, large text and actual device feel require
direct evidence. The active backend session owns the device/build lane.

## Second-pass compatible presentation repair

The user's second-pass request authorizes three bounded continuations without new
product behavior or release flag activation:

1. Garden recognition consumes the existing live motion preference. A sequence
   plays once per mounted presentation; disabling motion/backgrounding settles
   both cues, and resuming or toggling preferences cannot replay that sequence.
   Keep existing event authority, announcement and finite recognition timings.
2. Private Growth and Shared Growth controls reuse BotanicalPressable. Preserve
   their supplied static-motion request, native roles, refs, selected/disabled/busy
   state, touch targets and immediate actions. Remove duplicate scale/opacity
   definitions; do not add a selection delay or animate recycled rows.
3. The persistent Shared Growth parent owns dismissal focus restoration. Dismissal
   commits immediately; queued restoration is cancelled on reopening/unmount and
   cannot target the background while a newer confirmation is present. A failed
   or still-pending operation keeps focus inside its existing confirmation.

Record executed interruption tests and static checks separately from unrun native
feel/performance evidence in the second-pass workstream report. Preserve the
concurrent login session's source and exclusive device/build lane.

Second-pass implementation and exact validation/remaining native gates are recorded
in [the workstream report](../../docs/competition-readiness/workstreams/motion-pass2-20260914.md).

## Native page-transition continuation

The user's follow-up explicitly requests polished page transitions. Use the existing
Expo Router native Stack for Parent pages (currently a Slot without native transitions),
preserving URLs, actions, history router, access guards and navigator-owned Back.
Covered Parent pages must relinquish hardware Back, redirect/restore effects and
pending accessibility focus work. Verify retained composer/review state before handoff.

Use installed Android `fade_from_bottom` for detail depth, iOS default transitions,
and a fade on web. Main navigation peers stay immediate. Route-level settings use
the shared live reduced-motion preference; unknown/disabled motion selects `none`.
The existing family-created success sheet remains the sole animation owner of its
transparent modal. No extra root content animation, new gesture, artificial wait,
custom Android duration, dependency, or business action is introduced.

Record actual host execution separately from unrun native Back, keyboard, RTL,
large-text, transition interruption and frame-time acceptance in the navigation
workstream report. Updating native options does not establish immediate cancellation
of an Android transition already in flight.
