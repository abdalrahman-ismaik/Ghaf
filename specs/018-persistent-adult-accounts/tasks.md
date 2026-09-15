# Tasks

## Primary workspace and reported stability failures

- [x] S01 Repair startup when optional pilot/messaging environment files are absent.
- [x] S02 Make real account-owned family/tasks/study the primary post-login experience.
- [x] S03 Verify and repair family/task creation, completion, validation and conflict recovery.
- [x] S04 Verify and repair language selection and draft preservation in account/local forms.
- [x] S05 Preserve sample tasks, Masroofi and existing account-switch/reset boundaries.
- [x] S06 Run focused/full checks and available real-backend/browser verification; record gaps.
- [ ] BLOCKED: fresh authenticated hosted save/reload needs a controlled signed-in test session.
- [ ] NOT RUN: fresh Android build, RTL restart, native keyboard/Back and named-human acceptance.

Current [stability evidence](../../docs/competition-readiness/workstreams/account-stability-20260914.md)
records 3,118 passing Vitest tests, 12 launcher tests and the exact browser/provider limits.

Scope and authority: [stability amendment](stability-and-primary-workspace.md).

## Earlier implementation evidence

- [x] Recover real provider/session and local-only data boundaries.
- [x] Record adult profile plus family/task/study planning scope and no automatic guest migration.
- [x] Add typed owned workspace, atomic validated commands and RLS isolation tests.
- [x] Add real workspace UI/controller with failed-write, conflict and account-switch handling.
- [x] Add profile schema, RLS/RPCs and database isolation/conflict tests.
- [x] Extend existing account service with guarded profile reads/writes.
- [x] Add account panel/controller editing, refresh, failure and conflict behavior.
- [x] Isolate private messaging state on account logout/switch.
- [x] Run local real-provider tests and independent-client round trips.
- [x] Build/run the bounded native test artifact and test restart, account switch, keyboard/Back and logout.
- [x] Retest native-found logout error and cleanup retry on the rebuilt artifact.
- [x] Record exact passes/blockers, setup instructions and untouched local data.
- [x] Verify two independently signed-in native installations on one emulator: separate UIDs/storage, two-way saved data, restart and logout/account isolation.
- [x] Enforce banned/deleted/anonymous provider status with reproduced regression and 203 passing local database assertions.
- [x] Reconcile the hosted adult baseline, deploy the additive profile/workspace/status migrations and verify schema/history parity.
- [x] Verify hosted independent provider sign-ins, two-way owned data, ownership denial, local logout and retained-JWT ban denial using disposable synthetic accounts.
- [x] Add safe repeatable local backend verification and separate account/messaging CI jobs; CI execution remains separately evidenced.
- [ ] BLOCKED: repeat with two separate Android devices/AVDs; second native environment cannot boot reliably on this host.
- [x] Build a fresh hosted Gradle APK with pinned NDK/CMake, verify its signature/configuration and install it normally on the emulator.
- [x] Verify hosted native profile/family/task/study writes, independent SDK two-way sync, restart, local logout and User B isolation.
- [x] Diagnose the recorded auth-shell inset flash and preserve the shell with focused lifecycle tests; full suite passes 2,983 tests.
- [x] Install the fresh shell-fix APK from run 34851035020 and compare the recorded native transition: stable shell/insets/logo and legible dark status icons in inspected samples.
- [x] Retest final APK session restoration, saved-data retrieval, one server completion after three rapid taps, reduced-motion/large-text logout and protected Back/deep-link denial.
- [ ] FAILED / NOT RUN: recovery first Back exits the form in floating Gboard mode; docked-keyboard dismissal and root cause remain unverified.
- [x] Repeat final B isolation/foreign-record denials, sign out and relaunch, remove only the two invocation-created hosted fixtures and record restored operator settings.
- [ ] NOT RUN: external verification/recovery email delivery, native recovery/forced expiry/revocation, account TalkBack spoken traversal and physical-device performance acceptance.
