# Messaging and Android pause checkpoint — 2026-09-14

The owner requested an immediate pause before unplugging the phone and going offline.
This checkpoint preserves completed work and the next actions; it is not final acceptance.

## Resumed status — 2026-09-14

The owner resumed this work; `56b32ba` records that authorization and restores normal
prompt commit cadence. The saved state and original checklist below remain historical.
Study layout correction `6726f25` and messaging layout correction `923cf10` are now
committed. Two corrected full Gradle builds failed after actual exFAT lost writes:
`923cf10` run `20260914T052545228Z-085ff9a9` and `c4b7c26` retry
`20260914T054842239Z-4f0c0b98`, both under `D:/GhafNative/20260914/evidence/`.
The owner-authorized retry followed a matching 1 MiB probe and five minutes without
new errors, but produced 17 new exFAT events around 09:51:13–09:51:34 Dubai. Root
stopped that owned build. D: still reported `Warning / Full Repair Needed`; no more
D: builds are allocated. The short probe did not prove sustained write reliability.
Ignored receipts are `d-drive-write-failure.json`, `d-drive-second-write-failure.json`,
`d-drive-resumed-probe.json`, `failed-native-052545/` and `failed-native-054842/`
under `.expo/messaging-integration/`.

The launcher correction now sends batch logs directly to validated file paths and
checks utility output-copy failures while the child process is alive. AST parsing
and 16 scoped synthetic checks passed. An additional debugger fault-injection probe
stalled and was preserved as failed. These checks do not prove disk-failure recovery
or establish the earlier buffer size as the cause. The passing receipt is
`.expo/messaging-integration/native logging check 64b5595c/checks.json`.

On the installed diagnostic `273f97d` APK, root completed real Parent login to the
dedicated messaging service. After force-stop and cold restart, returning to Messages
displayed "Messaging account: Synthetic Parent" and actual server conversations
without another password entry. `resume-native-session-restart.log` reports COLD and
TotalTime 926 ms; this is activity-launch timing, not authentication latency.
Screenshots `resume-native-parent-auth.png` and `resume-native-auth-restored.png`
are retained under ignored `.expo/messaging-integration/`. This passes the observed
Parent login/restoration case on the diagnostic APK; it does not pass final-candidate
or Child-session acceptance or revocation. Subsequent diagnostic phone/web
bidirectional delivery passed: the `273f97d` phone and corrected `1a1c474` web export
each sent one synthetic message in the same verified Parent–Child thread. A separate
English browser sibling audit passed explicit Parent permission, older-Child text,
younger-Child phrase selection followed by Send, Parent exclusion from peer content,
and revocation clearing both peer views while preserving Parent chats. All audit
browser sessions signed out and its browser/server closed. Synthetic records and
retained messages remain; no Parent account or phone device was revoked.

The diagnostic phone also completed the Equal groups study plan and jointly agreed
80/100 goal, Child-reported 85, Parent acknowledgement, prize unlock and synthetic
mark-given. Actual Alya Child plans/goals remained empty. Parent reset returned to
settled Arabic Welcome, then reentry confirmed empty Salem plans/goals. These direct
results supersede the unrun items in the saved pause section for this diagnostic
candidate only. Receipts are `diagnostic-study-journey.json` and
`diagnostic-reset-settled.json`; the exact screenshots and messaging receipts are in
the [current integration evidence](../../../specs/016-real-family-messaging/backend-android-validation.md).

A C:-only internal update is now installed. It combines the verified `273f97d`
native container with `923cf10` JavaScript prepared from source `a365f9b`, rather
than completing a full Gradle rebuild. APK SHA-256 is
`98223bd92160c843c7c9db36d19c1f38cdec0316ce945ac72c0fa4cf77f219fe`. All 98 resource
mappings passed; the bundle was the only changed base payload, with 1,626 others
unchanged and all 1,627 signed candidate payloads matching. The existing internal
signer and 16 KiB alignment passed. `adb install -r` succeeded; cold activity launch
was 1050 ms. Parent context and the existing two-message history restored. Observed
AR/EN Study body, tabs and mixed-script nickname checks passed, along with messaging
body/list direction. Artifact receipts are under
`%LOCALAPPDATA%/GhafIntegration/20260914/js-update-923cf10/`.

The installed update still displayed the Arabic messaging header aligned left.
Root fixed that single row in `0ad7a0d`; source review, scoped lint/format and 73
messaging tests with one opt-in skip passed at 10:00:24 Dubai in 6.75 seconds.
Root completed its C:-only bundle/package after measuring 3.97 GiB available RAM
and 17.2 GiB free on C:. APK SHA-256 is
`d937a462598090fea79c01db68b0933fc0da9029680ff2be0c433e09cb1d3564`, 62,432,442 bytes.
Resource/payload preservation, alignment and signing passed; this uses the existing
diagnostic native container. The final serialized TypeScript rerun passed with
2,048 MiB after a preserved 1,024 MiB heap failure. Receipts are under
`%LOCALAPPDATA%/GhafIntegration/20260914/js-update-0ad7a0d/` and
`.expo/messaging-integration/final-0ad-typecheck*`.

The owner selected Android Studio emulator acceptance instead of further phone
testing, using C: only. A separate `Ghaf_API35_ARM64Bridge` AVD booted and installed
`d937a462…`, but app startup failed before JavaScript: SoLoader could not find
`libreactnative.so`. Package Manager selected ARM64 while direct APK loading chose
the absent `lib/x86_64` path. That APK supplies no emulator UI or corrected-header pass.
Root completed a separate extraction-only package with `android:extractNativeLibs`
changed from false to true. APK SHA-256 is
`73aced8e982653a4825b191a28a4137e8ebb63a3080c7e18006534ac8b94c3b3`, 62,432,442 bytes.
The four-byte manifest change, 1,626 preserved payloads, all 1,627 signed payloads,
alignment and v2/v3 signatures passed; the original APK is unchanged. Receipt:
`.expo/messaging-integration/emulator-extraction-0ad7a0d-v3/packaging-receipt.json`.
The streamed install reported an empty failure, but on-emulator hashing later
verified the installed `73aced8e…` APK. Extracted native libraries loaded, React
Native reached `Running main`, and settled Arabic onboarding rendered. Root also
skipped onboarding and entered Parent. Installation/startup pass for this emulator
candidate; skipped startup frames prevent a performance claim. Receipts include
`.expo/messaging-integration/emulator-installed-identity.json` and
`emulator-extraction-welcome.png`. Study and corrected-header checks remain pending;
the primary integration record owns the exact emulator results.

Resumed messaging checks passed 73 tests with one opt-in hosted skip at 09:24:48
Dubai (7.20 seconds), scoped lint/format passed, and root observed final TypeScript
exit 0. Logs use the `resumed-messaging-` prefix and `resumed-final-typecheck.log`
under `.expo/messaging-integration/`; empty TypeScript output is expected. No new
full regression or hosted test run is claimed.

Next: check the corrected header and AR/EN Study and Messages on the verified
`73aced8e…` extraction-only emulator APK on C:.
Attribute any further lifecycle/revocation, keyboard/Back, study-goal, Child
isolation/reset and accessibility checks to that exact artifact and emulator.
No new physical-phone check is allocated. Preserve earlier phone evidence and
verified artifacts; clean up only scoped disposable C: intermediates after use.
The diagnostic journey and browser sibling passes above do not close final-candidate,
emulator or two-phone gates. Record the final hash, results and remaining gaps in the
[current integration evidence](../../../specs/016-real-family-messaging/backend-android-validation.md)
before the authorized merge/push. Preserve the D: failure evidence and use the
current C:-only allocation; the original D: checklist below is historical.

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

## Completed build and phone evidence at the original pause

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
retained beside the APK. At the pause, the next launcher version targeted log
flushing; the later observed failure and output-drain correction are recorded above.

## Web and audit evidence at the original pause

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
