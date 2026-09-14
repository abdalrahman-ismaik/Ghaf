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
