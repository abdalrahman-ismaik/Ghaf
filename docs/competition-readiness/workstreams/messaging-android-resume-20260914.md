# Messaging and Android pause checkpoint — 2026-09-14

The owner requested an immediate pause before unplugging the phone and going offline.
This checkpoint preserves completed work and the next actions; it is not final acceptance.

## Resumed status — 2026-09-14

The owner resumed this work; `56b32ba` records that authorization and restores normal
prompt commit cadence. The saved state and original checklist below remain historical.
Study layout correction `6726f25` and messaging layout correction `923cf10` are now
committed. The final cached D: build used `923cf10` and failed after actual exFAT lost writes under
`D:/GhafNative/20260914/evidence/20260914T052545228Z-085ff9a9`. Final APK verification,
installation and corrected native presentation have not passed yet.

On the installed diagnostic `273f97d` APK, root completed real Parent login to the
dedicated messaging service. After force-stop and cold restart, returning to Messages
displayed "Messaging account: Synthetic Parent" and actual server conversations
without another password entry. `resume-native-session-restart.log` reports COLD and
TotalTime 926 ms; this is activity-launch timing, not authentication latency.
Screenshots `resume-native-parent-auth.png` and `resume-native-auth-restored.png`
are retained under ignored `.expo/messaging-integration/`. This passes the observed
Parent login/restoration case on the diagnostic APK; it does not pass final-candidate
or Child-session acceptance or revocation. Subsequent diagnostic phone/web bidirectional delivery passed; see the current integration evidence below.

Resumed messaging checks passed 73 tests with one opt-in hosted skip at 09:24:48
Dubai (7.20 seconds), scoped lint/format passed, and root observed final TypeScript
exit 0. Logs use the `resumed-messaging-` prefix and `resumed-final-typecheck.log`
under `.expo/messaging-integration/`; empty TypeScript output is expected. No new
full regression or hosted test run is claimed.

Next: use healthy build storage, finish and verify the final APK, install it, check corrected AR/EN Study and
Messages, complete phone/web messaging and native lifecycle/revocation, then the
joint-goal journey, Child isolation and reset. Record the final results in the
[current integration evidence](../../../specs/016-real-family-messaging/backend-android-validation.md)
before the authorized merge/push. Reuse the retained caches; the older instruction
to implement the layout corrections is already satisfied in source.

## Saved state at pause

- Branch: `integration/messaging-android-20260914`; implementation/tooling head
  `1a1c4743accaa5956bd61322fa14d571797eac18`. The main C: worktree was clean before
  this checkpoint. Nothing from this integration branch has been pushed or merged yet.
  The earlier authorization to push/merge remains available when work resumes.
- `origin/main` was last checked at `caf2d00`; the initial Feature 017 merge is already
  complete. Do not reimplement study, goals, family practices or messaging.
- The D: candidate is clean and already checked out at `1a1c474`. SDK, dependencies,
  generated Android files and Gradle/native caches are retained. No native build is
  running. Do not run `npm ci`, prebuild or clean again without a new reason.
- Dedicated hosted messaging project: `ijiwkmvjppfallaoahmh`. Migrations 001–003,
  actual HTTP acceptance and scheduled retention passed. The adult pilot is separate.
  See [the integration record](../../../specs/016-real-family-messaging/backend-android-validation.md).
- Credentials remain Windows-DPAPI encrypted under
  `%LOCALAPPDATA%/GhafIntegration/20260914/`; public configuration is in the ignored
  `.env.messaging.local`. No credential should be printed or placed in a commit.

## Completed build and phone evidence

The first complete Windows build succeeded in 52m 11s and passed APK verification.
Its source is `273f97d`; it includes the terminal-refresh and retry-budget fixes,
but predates the browser-fetch correction at `b6f157c`.

- APK: `D:/GhafNative/20260914/evidence/20260914T033313062Z-b2ba959f/ghaf-internal-rehearsal-arm64.apk`
- SHA-256: `3287b450051625b0a636f9e83688f651d4c23f25a97942cc2c2beffefde04c03`
- Size: 59.54 MiB; package `ae.ac.ku.ghaf.prototype`, version 0.1.0/code 1,
  target SDK 36, arm64 only, backup disabled, unchanged internal template signing.
- Installation on Samsung SM-S918B / Android 16: **PASSED**.
- Standalone cold launch with Metro stopped: **PASSED**, Android reported COLD and
  704 ms. Arabic onboarding, English language switch and Parent entry were observed.
- Parent Study space opened. A Math plan named “Equal groups”, next step
  “Explain 3 groups of 4”, 15 minutes, saved as “Proposed for choice”.
  Native keyboard input and Back dismissal preserved the form: **PASSED**.
- A goal proposal form opened; no goal was saved and the full agreement/result/prize
  journey was not completed. Messaging on the phone, secure-session restart/revocation,
  Child isolation, final reset, TalkBack and named human review remain pending.
- Phone evidence lives under ignored `.expo/messaging-integration/phone-*.log/png`.
  Root restored the original `stay_on_while_plugged_in` setting when stopping.
  The installed app is left available; demo study records are session-only.

Six main generated Ninja graphs have 289 compile/link edges in a depth-one pool.
Two CMake LTO probe graphs have six edges outside that pool; probe serialization and
continuous runtime-wide coverage are unverified. The manifest has 10 permissions,
including two biometric declarations inherited from SecureStore's dependency.
No biometric login was enabled or tested. Exact build/graph/manifest receipts are
retained beside the APK. The next launcher version improves log flushing.

## Web and audit evidence

The coordinated audits fixed three reproduced defects in separate commits:
terminal refresh recovery (`7ee7f49`), accepted retries at the send limit
(`273f97d`), and the default browser fetch receiver (`b6f157c`). Focused messaging
checks passed 73 tests with one opt-in hosted skip; 43 SQL tests and the separately
enabled real hosted test passed. Existing full Feature 017 regression evidence is
historical; do not call it a new full-suite run.

A corrected configured web export from `1a1c474` completed at
`D:/GhafNative/20260914/web-current` (44 routes). Its temporary/cache files are on D:.
The browser auditor observed an actual HTTP 400 for invalid synthetic credentials,
safe bilingual feedback, cleared password, no private content and no overflow at
320/390 px. This confirms the earlier pre-HTTP `Illegal invocation` blocker is fixed.

Root then entered the dedicated synthetic Parent credentials without printing them;
the actual Auth response was HTTP 200. The pause arrived immediately afterward.
The browser auditor observed “Sign out of messages”, signed out successfully,
returned to messaging access with no unconfirmed remote revocation, closed only
the audit browser and stopped its server on port 8094. No authenticated
conversation/send acceptance is inferred from the HTTP 200 alone.
Evidence: `.expo/messaging-integration/web-audit/`, including
`corrected-export.log` and `parent-auth-handoff.json`.

## Original pause resume checklist (historical)

1. Recheck Git status, D: availability, free memory/storage and the connected phone.
   C: had only about 1 GiB free near build completion; keep heavy caches/output on D:.
   Do not request USB authorization again unless an actual new device state requires it.
2. Fix the newly observed native Study presentation in a bounded slice. No patch has
   been applied yet. Read-only investigation identified inherited native RTL paragraph
   direction after Arabic-to-English switching, reordered mixed-script nickname text,
   and overly narrow tabs splitting “understanding”. Proposed exact boundaries:
   `src/components/study/StudyScreen.tsx` and `src/components/study/shared.tsx`.
   Apply native-only physical LTR content context while retaining existing locale-aware
   text alignment/row helpers; isolate the interpolated nickname with FSI/PDI; allow
   wider native tab wrapping (suggested minWidth 180, web remains 110). Verify Arabic
   and English on the phone before claiming the fix. Avoid a broad shared-Screen change.
3. Run proportional checks, including final TypeScript after source changes. The last
   whole-project typecheck passed before the browser fetch correction; the latest
   fetch/client tests and scoped lint/format checks passed afterward.
4. Update the D: checkout to the final committed source, reuse its caches, and run the
   Windows launcher for the final APK. The installed diagnostic APK must not be
   mislabeled as the later source. See [the native guide](../android-build-and-rehearsal.md).
5. Reopen the corrected web export and complete authenticated UI messaging with
   synthetic participants. Install the final APK; verify phone/web delivery, native
   restart/background/revocation, Arabic/English study-goal flow, Child isolation,
   Back/keyboard and reset. One phone plus browser is not two physical-phone evidence.
6. Update exact results and remaining human/accessibility limits, then use the existing
   push/merge authorization, fetching and resolving any new conflicts first.

No real Child data, paid plan, production rollout, live Child media or AI activation
was selected. Study/goals remain local by their current contract. No Android Studio
AVD or editor session was started; native compilation used the installed Android
toolchain directly. The owner requested a stop at that checkpoint; the later
resumption above supersedes that pause instruction.
