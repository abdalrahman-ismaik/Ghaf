# Messaging backend and Android integration evidence

**Recorded:** 2026-09-14, Dubai time. **Status:** Partial integration evidence;
diagnostic native Parent login/restoration, Study/goal/isolation/reset, phone/web
exchange, browser sibling controls and hosted retention pass. Both corrected full
native builds failed after D: write errors. A C:-only internal JavaScript update
installed and passed limited phone checks. The later `0ad7a0d` header correction
now has a verified C:-only APK; emulator installation and presentation are pending.

The user authorized dedicated backend integration and physical Android testing using
Android Studio. Root coordinates `integration/messaging-android-20260914`, starting
from `caf2d00`. Its initial D: build was stopped after native configuration and
partial compilation to include the audited client correction at `7ee7f49`.
The downloaded SDK/build cache is retained for the updated candidate.
The diagnostic D: build at `273f97d` subsequently passed, installed on the Samsung,
and cold-launched without Metro. The corrected web export at `1a1c474` includes
`b6f157c`; actual browser Parent Auth returned HTTP 200 and sign-out completed.
After the owner's pause and resumption, the installed diagnostic APK also completed
real Parent login and restored the verified account/conversation list after force-stop
and cold restart without another password entry. These are diagnostic-candidate passes.

The resumed source includes Study layout correction `6726f25` and messaging layout
correction `923cf10`. Its cached native build failed in run
`D:/GhafNative/20260914/evidence/20260914T052545228Z-085ff9a9` after Windows invalidated
the open log file. exFAT events 50 and 141 at 09:27:55–09:28:06 Dubai explicitly report
lost writes to Gradle locks/cache files. The recorded client was stopped, its daemon
exited, and small run logs were copied to C:. The user subsequently confirmed D:
was stable and authorized continuing. At 05:45:46 UTC, a 1 MiB write/read probe
matched and no new exFAT errors appeared in the preceding five minutes; the volume
still reported `Warning / Full Repair Needed`. Root started a bounded full-build
retry at `c4b7c26`, run `20260914T054842239Z-4f0c0b98`, after that probe. It also
failed: 17 further exFAT events around 09:51:13–09:51:34 Dubai reported lost writes.
Root stopped only its owned Java processes 28008 and 24588 and preserved the logs
on C:. No further D: builds are allocated. The second failure receipts are
`.expo/messaging-integration/d-drive-second-write-failure.json` and
`failed-native-054842/`. A short matching probe did not establish sustained write
reliability. The separate C:-only update described below subsequently installed;
it is not a successful full Gradle rebuild. See the
[historical pause and resumed handoff](../../docs/competition-readiness/workstreams/messaging-android-resume-20260914.md).
Each artifact's results remain separately attributed. No production readiness is claimed.

The owner subsequently selected the Android Studio emulator for further testing,
requested C:-only work and authorized removal of disposable intermediates after use.
Root restored the phone's original USB stay-awake setting to `0` and released it
from further testing. The existing C: AVD/tools are being checked; emulator evidence
must remain separate from the physical passes already recorded below. D: is no
longer an active build or cache location for this work.

## Current evidence

The diagnostic `273f97d` phone and corrected `1a1c474` web export exchanged two
synthetic messages through actual UI and the hosted service. The Child message is
sequence 1, `1065f909-e9b1-4d0b-9c48-c2de8f0ea275`; the Parent reply is sequence 2,
`c77c196d-1d87-45d5-8fde-48f7373f887d`, in thread
`c0a85f4e-6e78-4ba2-99d7-7b4ce00314e3`. Both appeared once in the web history, and
the phone displayed the received Child message and accepted Parent reply. Evidence:
`.expo/messaging-integration/web-audit/bidirectional-history.json`,
`web-audit/phone-web-exchange-en.png`, and `resume-native-bidirectional-messages.png`.
This is one physical phone plus a browser, not two physical installations. A duplicate
synthetic Salem profile created during native form navigation explains an earlier
message in a different thread; it was not counted as delivery to the enrolled Child.

### Browser sibling exchange and cleanup

The `1a1c474` export completed an English sibling audit at 390 × 844 in one Chrome
browser with three isolated contexts. The Parent authenticated to the dedicated
service and created `Alya Web QA`, age band `6_8`; a one-use invitation enrolled her
separate Child context. The existing `Salem QA` context was matched by server identity
`b89c71f1-6a1c-43a4-9a52-9722ac4fcb56` and the phone-tested Parent thread above,
rather than the duplicate display name. Alya's identity was
`4a805f3f-105b-4a56-8ece-63c149272de9`.

The Parent explicitly confirmed permission for that exact pair through the UI.
In peer thread `50084dd2-379d-4efc-9dcf-ede397fc7bad`, Salem's text was accepted as
sequence 1 (`685475ca-e4a3-4b49-9144-f19010eb720e`) and appeared in Alya's view.
Alya selected a curated phrase; it created no history until explicit Send. Her
reply was accepted as sequence 2 (`99991991-ca8f-4977-ae2c-51988f9f20a7`) and appeared
in Salem's view. Her composer had zero textboxes. Parent foreground responses
contained only `parent_child` threads, excluded this peer ID, and the Parent UI
showed permission management without either peer message.

Explicit Parent revocation returned HTTP 200. Both Child views removed the peer
entry and history; Salem's unsent sibling draft was hidden. Reopening the separate
Parent conversations preserved Salem's phone reply with an empty composer and
left Alya's Send control disabled with no textbox. The new Parent and Alya web
devices then signed out, followed by Salem when root released the phone check.
All three web contexts and the local server were closed. No sign-out showed an
unconfirmed remote-revocation notice. No Parent account or phone device was revoked;
synthetic Child records, message history and device tombstones remain under the
server retention policy.

These observations used actual UI actions and observed service responses, without
RPC calls outside the UI or network mocks. Receipts under ignored
`.expo/messaging-integration/web-audit/` include `alya-enrolled.json`,
`sibling-permission-granted.json`, `sibling-text-salem-to-alya.json`,
`sibling-phrase-alya-to-salem.json`, `parent-peer-visibility.json`,
`sibling-permission-revoked.json`, `sibling-audit-cleanup.json` and
`final-web-session-cleanup.json`. Screenshots include `alya-peer-phrases.png`,
`parent-peer-permission-only.png`, `salem-after-peer-revoke.png` and
`alya-after-peer-revoke.png`. Arabic sibling UI, Child-initiated stop, offline UI
recovery and native peer controls were not exercised by this browser audit.

### Diagnostic native Study, goal and reset

On the installed `273f97d` diagnostic APK, root completed the synthetic Mathematics
plan `Equal groups` through Child choice, start and completion. The jointly agreed
academic goal used a target of 80/100 and an optional blue-ball gift. The Child
agreed and reported 85; the Parent acknowledged the use of counters and explanation,
unlocked the promise and marked it given. This was a synthetic fulfillment rehearsal,
not delivery of a real prize. Switching to the actual Alya Child experience showed
empty plans and goals. Root then used Parent Settings reset and confirmation,
observed settled Arabic Welcome, and reentered Parent Study with Salem selected to
verify both plans and goals were empty.

The receipts are `.expo/messaging-integration/diagnostic-study-journey.json` and
`diagnostic-reset-settled.json`. Screenshots there include
`resume-study-plan-proposed.png`, `resume-study-plan-child-complete.png`,
`resume-study-goal-parent-agreed.png`, `resume-study-child-goal-submitted.png`,
`resume-study-prize-unlocked.png`, `resume-study-prize-given.png`,
`resume-study-alya-plans-isolated.png`, `resume-study-alya-goals-isolated.png`,
`resume-native-arabic-reset-settled.png`, `resume-native-study-reset-empty.png` and
`resume-native-goals-reset-empty.png`. The earlier `resume-native-arabic-reset.png`
captures the splash transition; the later settled receipt records Welcome at
05:49:08 UTC. Root performed the phone actions; the documentation owner inspected
the fulfillment, isolation and empty-reset screenshots. These are behavior passes
on the diagnostic APK. The C:-only update below subsequently passed the specific
Study nickname-direction and tab-presentation checks.

### Installed C:-only internal JavaScript update

Root packaged the verified `273f97d` native container with application runtime
`923cf10`, prepared from source `a365f9b`. The resulting internal APK SHA-256 is
`98223bd92160c843c7c9db36d19c1f38cdec0316ce945ac72c0fa4cf77f219fe`. All 98 resource
mappings were checked; `assets/index.android.bundle` was the only changed payload
against the base, with 1,626 other payloads unchanged. The signed-payload receipt
confirmed all 1,627 candidate payloads remained unchanged after packaging/signing.
Root verified 16 KiB alignment and the internal signer certificate SHA-256
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.

`adb install -r` returned Success. Cold launch returned Status ok and TotalTime
1050 ms; this is activity-launch timing, not authentication latency. Root observed
the verified Parent context restored and the existing two-message history. Arabic
and English Study body direction, wide tabs and mixed-script nickname display
passed the observed phone checks. Messaging body/list direction also passed, but
the Arabic header remained aligned left. Root corrected that single header row in
`0ad7a0d`; read-only source review, scoped lint/format and 73 messaging tests with
one opt-in skip passed at 10:00:24 Dubai in 6.75 seconds. That correction is not in
the phone APK. After the owner authorized closing idle applications and freed space,
root measured 3.97 GiB available RAM and 17.2 GiB free on C: and compiled the final
bundle between 06:08:17 and 06:10:24 UTC.

Local receipts are under
`%LOCALAPPDATA%/GhafIntegration/20260914/js-update-923cf10/`:
`source-receipt.json`, `repackage-validation.json`, `signed-artifact.json`,
`signed-payload-verification.json`, `signing-verification.log`, `install.log` and
`launch.log`. Phone screenshots are ignored
`.expo/messaging-integration/js-update-study-{ar,en}.png`,
`js-update-messaging-en-settled.png`, `js-update-messaging-ar.png` and
`js-update-messaging-history-en.png`. The documentation owner inspected the artifact
receipts and English Study/Arabic messaging screenshots; root performed alignment,
installation and the phone checks. Source-test log:
`.expo/messaging-integration/final-header-messaging-tests.log`.

### Final C: artifact and emulator transition

The `0ad7a0d797badd56f4182f98437fbbac2653ff53` runtime was compiled with one Metro
worker and Hermes bytecode version 98. Its bundle SHA-256 is
`811b75fa3f34875c2ad394420501df6538f3fe2a9f874fc5c122dcfa670553eb`.
The final APK is 62,432,442 bytes, SHA-256
`d937a462598090fea79c01db68b0933fc0da9029680ff2be0c433e09cb1d3564`.
It again preserves all 98 resource mappings and 1,626 non-bundle payloads from the
verified `273f97d` native container. All 1,627 candidate payloads matched after
alignment/signing; 16 KiB alignment and v2/v3 signature verification passed with
the same internal signer. Source, resource, payload, signing and artifact receipts
are retained under `%LOCALAPPDATA%/GhafIntegration/20260914/js-update-0ad7a0d/`.
This is a compiled JavaScript update to an existing native container, not a full
Gradle build.

Android Studio opened to its Welcome window. A separate C: AVD,
`Ghaf_API35_ARM64Bridge`, reused the installed API35 Google Play x86_64 image and
booted in 63.2 seconds using WHPX. The running image advertised `x86_64,arm64-v8a`
and `libndk_translation.so`. Its actual settings increased the requested memory/data
sizes to 2,048 MiB RAM and a 6 GiB logical data partition; it uses two cores and
720 × 1280. The existing Pixel AVD was not changed. Root closed the idle Studio
Welcome window to free memory while keeping the emulator visible.

Installing APK `d937a462…` succeeded, but **application startup failed** before
JavaScript ran. The initial Activity Manager `Status: ok` and 2,586 ms wait do not
establish successful app launch. The crash buffer records
`SoLoaderDSONotFoundError: couldn't find DSO to load: libreactnative.so`.
Package Manager selected `arm64-v8a`, but SoLoader's direct APK source selected
`lib/x86_64`; the APK uses `extractNativeLibs=false`. This exposed a native-bridge
packaging incompatibility. A compatible emulator runtime/build is being prepared
on C:; no emulator UI pass is inferred from successful boot or installation.
Receipts include `.expo/messaging-integration/c-emulator-creation.json`,
`emulator-launch.json`, `emulator-crash-buffer.log`, emulator stdout/stderr and
the artifact directory's `emulator-install.log` and `emulator-launch.log`.

### Resumed extraction-only emulator candidate

After the technical interruption, root preserved the verified APK and produced a
separate emulator package. Only the compiled manifest's `extractNativeLibs` boolean
changed from false to true: bytes 7744–7747 changed from `00000000` to `ffffffff`.
All 1,626 other payloads, including JavaScript and native libraries, stayed identical;
all 1,627 signed payloads matched the expected candidate. Existing internal signing
(v2/v3) and 16 KiB alignment passed. APK SHA-256 is
`73aced8e982653a4825b191a28a4137e8ebb63a3080c7e18006534ac8b94c3b3`, 62,432,442 bytes.
This is `0ad7a0d` JavaScript in the `273f97d` native container with emulator-only
extraction packaging. It is not a full native rebuild or a physical-phone pass.

The streamed ADB install returned exit 1 with an empty error, but Package Manager
had installed the new package. Root independently hashed the actual installed APK
on the emulator and verified the complete `73aced8e…` digest. The new process loaded
extracted ARM64 libraries, ran JavaScript and rendered the settled Arabic onboarding.
Skipping the introduction and entering Parent Home worked. No ANR was recorded;
startup logs contain skipped frames, so no performance pass is claimed. The original
`d937a462…` launch failure remains valid for its different packaging.

Receipts: `.expo/messaging-integration/emulator-extraction-0ad7a0d-v3/` contains
`packaging-receipt.json`, signing/alignment/manifest logs and the signed APK;
`emulator-installed-identity.json`, `emulator-current-process.log` and
`emulator-extraction-welcome.png` record the installed hash, startup and settled UI.
Earlier packaging attempts failed an overly broad META-INF check and then detected
unrequested v1 signature entries; both failed receipts remain preserved. The released
experiment explicitly uses v2/v3 only. AR/EN Study, messaging and lifecycle checks
are being recorded separately; startup alone does not pass those gates.

The extraction experiment follows the documented Android
[installer setting](https://developer.android.com/guide/topics/manifest/application-element#extractNativeLibs)
and changes no application permission, backup, role or service configuration.

The final TypeScript attempt with a 1,024 MiB Node heap exhausted that heap; the
serialized rerun with 2,048 MiB passed at 06:12:46 UTC. Both logs/exit receipts are
retained under `.expo/messaging-integration/final-0ad-typecheck*`. After verifying
the signed payloads, root removed four no-longer-needed unsigned/aligned APK
intermediates, freeing 249,299,358 bytes. Both signed artifacts, source maps,
compiled bundles and receipts remain; see `c-intermediate-cleanup.json`.

| Follow-up check                          | Status | Candidate and observation                                                                                                                                         |
| ---------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone/web Parent–Child exchange          | PASSED | `273f97d` phone plus `1a1c474` browser, two messages in one verified thread.                                                                                      |
| Browser sibling permission/exchange      | PASSED | `1a1c474`, explicit Parent permission, older-Child text, younger-Child phrase and participant-only content.                                                       |
| Browser peer revocation/cleanup          | PASSED | Both peer views cleared; separate Parent chats survived; all web sessions signed out without revoking the phone Parent or account.                                |
| Diagnostic Study/academic goal           | PASSED | `273f97d`, plan completion and agreed 80/100 goal with reported 85, acknowledgement, unlock and synthetic mark-given.                                             |
| Diagnostic Child isolation/reset         | PASSED | Actual Alya Child records empty, then Parent reset to Arabic Welcome and empty Salem plans/goals on reentry.                                                      |
| Full corrected Gradle rebuild            | FAILED | Both `923cf10` and `c4b7c26` runs encountered D: lost writes. No further D: build is allocated.                                                                   |
| C:-only internal JS-update APK           | PASSED | APK `98223bd9…` uses `273f97d` native code plus `923cf10` JavaScript; payload/signing/install/cold-launch receipts pass. This is not a full native rebuild.       |
| JS-update phone presentation/restoration | PASSED | Study AR/EN body/tabs/nickname, messaging body/list, restored Parent context and existing message history passed. Arabic header is the explicit remaining defect. |
| Latest `0ad7a0d` APK packaging           | PASSED | Verified `d937a462…` artifact; extraction-only `73aced8e…` separately verified and installed on the emulator. Physical header acceptance remains NOT RUN.         |

Storage-failure evidence is retained at
`.expo/messaging-integration/d-drive-write-failure.json` and
`.expo/messaging-integration/failed-native-052545/`. D: reports `Warning / Full Repair
Needed`; C: had about 1 GiB free at the first failure and root later reported about
11.5 GiB. No disk repair or formatting was performed by this integration. The
failure exposed a launcher output-drain error that was not surfaced
until the Gradle client stopped. The corrected launcher writes batch logs directly
to validated file paths and checks utility copy-task failures while the process is
alive. AST parsing and 16 scoped synthetic checks passed, including large dual-stream
output, nonzero exit, spaced paths, environment isolation and unsafe-token rejection.
Evidence: `.expo/messaging-integration/native logging check 64b5595c/checks.json`
(SHA-256 `8c68570dfcfedae7c9cad5242119b958a850b2bbe0579477d43c1e8ce6dbb5a5`).
An additional debugger-based fault-injection probe stalled and was preserved as failed;
its exact synthetic process tree was stopped. No successful reproduction of a disk
failure, or causal claim about the previous buffer size, follows from these checks.
The later probe receipt is `.expo/messaging-integration/d-drive-resumed-probe.json`;
the second failure demonstrates that the probe did not resolve the sustained-write problem.

| Check                                      | Status  | Observed result                                                                                                                                                                                                                                        |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dedicated hosted project                   | PASSED  | Free project `ghaf-family-messaging`, reference `ijiwkmvjppfallaoahmh`, Mumbai `ap-south-1`, PostgreSQL 17.6. The adult pilot `bqcfynlbxevqlzbkimhy` was left untouched.                                                                               |
| Messaging migrations                       | PASSED  | Migrations 001, 002 and additive 003 applied. Metadata inspection found 16 RPC functions and zero direct client table grants; the purge function remains operator-only.                                                                                |
| Hosted Auth setup                          | PASSED  | One synthetic Parent was created and confirmed through the dashboard, then allowlisted. Anonymous sign-in and email confirmation are enabled. No email delivery was used or tested.                                                                    |
| Basic hosted HTTP probes                   | PASSED  | Auth settings returned HTTP 200; an unauthenticated RPC probe returned HTTP 401. These probes alone do not establish the full authorization contract.                                                                                                  |
| Real Auth and messaging HTTP acceptance    | PASSED  | Initial real HTTP acceptance passed at 06:21:31; expanded post-003 acceptance passed at 07:26:22 in 17.79 seconds. Both used the actual client/provider with synthetic data.                                                                           |
| Hosted harness cleanup                     | PASSED  | Both synthetic Child devices in the harness were revoked and its three sessions signed out. Test accounts, Child records, device tombstones and retained messages remain; the Parent account and history were not erased.                              |
| Retention installation                     | PASSED  | `pg_cron` enabled; the exact `retention.sql` installed job 1, `ghaf-family-message-retention`, active with schedule `0 * * * *`.                                                                                                                       |
| Scheduled hourly retention execution       | PASSED  | `cron.job_run_details` records succeeded at 03:00:00.179407–03:00:00.190289 UTC (07:00 Dubai), with `return_message` of 1 row. This is job execution, not a claim that one message was deleted.                                                        |
| Backup/PITR acceptance                     | NOT RUN | The dashboard did not provide backups on the selected Free plan. PITR is a paid option and was not enabled; no backup-recovery or backup-erasure claim is made.                                                                                        |
| Local Android build prerequisites          | PASSED  | SDK 36, build tools 35/36, NDK 27.1.12297006 and CMake 3.30.5 verified on D:. `npm ci` installed 1,002 packages in approximately 18 minutes. This is setup evidence, not compilation evidence.                                                         |
| Physical device availability               | PASSED  | Authorized Samsung SM-S918B, Android 16, arm64 device detected. No raw device serial is included in this record.                                                                                                                                       |
| Expo Go launch attempt                     | FAILED  | Expo Go 57.0.9 did not load the candidate with the IPv6 development-server setup. This attempt supplies no passing app-behavior evidence.                                                                                                              |
| Compact browser access layouts             | PASSED  | Actual Chrome access and invalid-login states in Arabic/English at 320 px and 390 px had zero horizontal overflow. Corrected export `1a1c474` also issued the expected HTTP 400. Authenticated message exchange is separate.                           |
| Browser fetch regression correction        | PASSED  | Commit `b6f157c` fixes the global fetch receiver. Regression failed before the fix; all 32 client tests, scoped lint and formatting passed afterward.                                                                                                  |
| Actual browser sign-in after fetch fix     | PASSED  | Corrected export `1a1c474` returned Parent Auth HTTP 200 and successful sign-out. Subsequent phone/web and sibling exchanges have separate direct receipts above.                                                                                      |
| Diagnostic APK build and installation      | PASSED  | Source `273f97d` built in 52m 11s, passed APK verification and installed on Samsung SM-S918B / Android 16. The checkpoint records its SHA-256, internal signing and arm64/SDK36/backup-disabled inventory.                                             |
| Diagnostic native startup and study form   | PASSED  | With Metro stopped, the `273f97d` APK cold-launched; Android reported 704 ms. A Parent study plan saved, and keyboard/Back dismissal preserved the form. Native layout defects were observed and subsequently corrected in source.                     |
| Diagnostic native Parent login/restoration | PASSED  | On `273f97d`, real login reached the dedicated messaging service. After force-stop and a cold launch reported as 926 ms, returning to Messages displayed Messaging account: Synthetic Parent and actual server conversations without another password. |
| Resumed source checks                      | PASSED  | Study `6726f25` and messaging `923cf10` have scoped lint/format checks; final TypeScript exited 0. Messaging regression passed 73 tests with one opt-in skip at 09:24:48. These checks do not pass native presentation.                                |
| Resumed full native builds                 | FAILED  | Runs `20260914T052545228Z-085ff9a9` and `20260914T054842239Z-4f0c0b98` both failed after D: lost writes. The verified C:-only internal update has a different build provenance.                                                                        |
| Final physical Android app acceptance      | NOT RUN | The corrected candidate still needs AR/EN layout, keyboard/Back, full study-goal flow, Child isolation/reset, messaging exchange, native lifecycle/revocation and accessibility checks. Diagnostic passes above remain separately attributed.          |
| Android Studio emulator startup            | PASSED  | Original `d937a462…` startup FAILED before JavaScript; extraction-only `73aced8e…` installed hash verified and settled Arabic onboarding/Parent entry observed. Functional acceptance remains pending.                                                 |
| Named human content/usability review       | NOT RUN | No named Arabic, accessibility or participant review was supplied by this session.                                                                                                                                                                     |

The hosted test exercised Parent login, two separately enrolled Child identities,
Parent–Child bidirectional messages, same-key idempotency, canonical peer permission,
Child–Child messages, Parent exclusion from peer content, the 6–8 phrase constraint,
either Child leaving, Parent revocation and retained access to the separate Parent
thread. The hosted test itself does not establish native UI, offline interruption
recovery, backup recovery or every manual hosted acceptance case. Scheduled
retention has its separate passing execution receipt in the table above.

The current test project's CAPTCHA setting is off by default. The messaging client
has no CAPTCHA challenge/token flow; this controlled synthetic setup does not
establish production abuse prevention. No existing pilot protections were disabled
to accommodate the messaging client.

## Execution notes and references

Earlier focused messaging checks at `b6f157c` passed 73 tests across five files at
07:52:31 Dubai time in 5.61 seconds, with one opt-in hosted test skipped. This run
used one worker and a 384 MB heap; receipt:
`.expo/messaging-integration/messaging-final-tests.log`. It does not repeat the
earlier real hosted acceptance. The coordinator's read-only source review found
no further blocker in the fetch fix or Windows build launcher. The diagnostic
`273f97d` build subsequently passed; the resumed `923cf10` build failed on D: writes.
The later owner-authorized `c4b7c26` retry also failed after new D: lost writes.

After resumption, `6726f25` limits the Study paragraph-direction correction and wider
tabs to native layout, and isolates the displayed selected nickname. `923cf10` gives
messaging a native physical LTR content context with explicit locale-aware role and
quick-phrase row order. Their read-only review found no role, form or transport
behavior change. The C:-only installed update subsequently passed the specific
Study and messaging-body presentation checks; Arabic header alignment prompted
the later `0ad7a0d` correction, whose phone check remains pending.

The resumed messaging run passed 73 tests across five files with one opt-in hosted
skip at 09:24:48 Dubai, in 7.20 seconds. Scoped lint and formatting passed, and root
observed final TypeScript exit 0; empty TypeScript stdout is expected, not separate
evidence of success. Logs are `.expo/messaging-integration/resumed-messaging-tests.log`,
`resumed-messaging-lint.log`, `resumed-messaging-format.log` and
`resumed-final-typecheck.log`. No new full-suite or hosted run is implied.

The diagnostic native Parent login and post-restart conversation list are captured in
`.expo/messaging-integration/resume-native-parent-auth.png` and
`resume-native-auth-restored.png`. Root observed force-stop, restart and navigation
back to Messages without entering the password. The restored screenshot shows the
Synthetic Parent identity and real server conversation inventory. The matching
`resume-native-session-restart.log` records COLD, Status ok and TotalTime 926 ms;
that value measures the Android activity launch, not authentication latency. These
observations establish this Parent session's restoration on `273f97d`, not Child
session restoration, message delivery or final-candidate acceptance.

The user requested parallel backend/web audits with a coordinator. The backend
review reproduced a terminal refresh-error recovery defect: certain provider
HTTP 400 responses retained the private conversation and draft during retry.
The focused pre-fix run failed 10 cases. After Auth-only terminal-code normalization
in commit `7ee7f49`, all 53 tests in the two client/controller files passed
(one worker, 384 MB heap,
2.46 seconds). Scoped lint and formatting passed. Receipts are ignored
`.expo/messaging-integration/refresh-before.log` and `refresh-after.log`.
This is client test evidence; the final accepted APK must include the corrected
source, rather than the original `caf2d00` build used to prepare the native toolchain.

The retry-budget regression failed against 001/002 (29 passed, one expected failure).
After additive 003 in commit `273f97d`, all 43 SQL cases passed: 30 RPC and 13 peer
tests. A recapture run preserved its logs and confirmed graceful cluster shutdown
and port 55432 release
under `.expo/messaging-integration/sql-retry-fixed-recapture/`; the first run's
temporary logs were lost after an unexplained WSL lifecycle change, with its result
retained in the tool transcript. Existing database port 5432 was not queried or changed.

Root applied 003 to the dedicated hosted project. Its SHA-256 is
`cc2f809ff8ebb3def64f343f2dbbb80964f68346f57d8a5e6a43a26a41dc8caa`.
The expanded actual HTTP test passed at 07:26:22 (17.79 seconds of test execution,
18.18 seconds total): 29 rejected HTTP 400 attempts committed their budget, a fresh
send returned 429, the exact accepted retry returned 200 with its original receipt,
and changed text still returned 429. History contained no duplicate. Receipt:
`.expo/messaging-integration/hosted-after003.log`. This also repeated the original
identity, Parent/peer delivery, permission, revocation and cleanup assertions.

The subsequent fresh, configured web export at `273f97d` exposed a third defect in
actual Chrome: sign-in failed before any HTTP request because calling the stored
browser `fetch` as a service method produced `Illegal invocation`. The UI showed
the safe offline error, cleared the password and exposed no private history or
management surface. Commit `b6f157c` replaces the default transport with a wrapper
that invokes `globalThis.fetch` with its global receiver. Its focused regression
failed before the correction; afterward all 32 client tests passed, along with
scoped lint and formatting. The corrected `1a1c474` export then issued actual HTTP
400 for invalid synthetic credentials and HTTP 200 for the provisioned Parent;
the signed-in state and successful sign-out were observed. Subsequent phone/web and
browser sibling exchange have direct receipts in Current evidence above; unit tests
alone were not used to pass those UI gates.

The same Chrome audit passed Arabic and English access layouts at 320 px and
390 px widths with zero horizontal overflow elements. This is access-surface
evidence, not authenticated conversation or native acceptance. Records are in
ignored `.expo/messaging-integration/web-audit/`: `initial-evidence.json`, the four
`access-{ar,en}-{320,390}.png` screenshots, `fetch-binding-offline.png`,
`fetch-regression-before.log`, `fetch-regression-after.log`, `fetch-lint.log` and
`fetch-format.log`.

Root subsequently reported TypeScript passing with a 1,536 MB heap after a 768 MB
attempt exhausted its heap. The hosted harness then received a scoped lint fix:
explicit environment values now pass into the validation helper instead of dynamic
`process.env` indexing. Its endpoint guards, credential handling and HTTP behavior
are unchanged. Scoped ESLint passed with zero warnings and formatting passed; the
hosted test was not repeated for this environment-access-only edit.

The first attempt to apply migration 002 accidentally resubmitted 001 because the
SQL editor retained its previous contents during a Monaco fill. PostgreSQL rejected
the transaction with `42P06` because the schema already existed; no change was made.
Root replaced the editor contents with the correct 002 SQL using keyboard input and
the upgrade then passed. The rejected attempt remains part of the execution history.

- Hosted execution log: ignored `.expo/messaging-integration/hosted-test.log`.
- Actual HTTP harness: [hosted.integration.test.ts](../../tests/messaging/hosted.integration.test.ts).
- Applied SQL: [migration001](../../workers/ghaf-family-messaging/migrations/001_family_messaging.sql),
  [migration002](../../workers/ghaf-family-messaging/migrations/002_peer_threads.sql),
  [migration003](../../workers/ghaf-family-messaging/migrations/003_idempotent_retry_budget.sql),
  [Parent provisioning](../../workers/ghaf-family-messaging/provision-parent.sql) and
  [retention](../../workers/ghaf-family-messaging/retention.sql).
- Remaining procedure: [setup and acceptance guide](quickstart.md).
- Historical local evidence: [Feature017 validation](../017-study-family-support/validation.md).

Project configuration, dashboard setup, SQL outcomes and device/tool inventory above
were reported by the root integration owner. The documentation owner directly
inspected the initial and post-003 hosted logs, refresh and fetch regression logs,
web audit JSON, SQL recapture receipts and source references. The resumed documentation
owner also inspected the restored-account screenshot, restart log and resumed
messaging/format logs; force-stop, initial login, final TypeScript exit and active
build status were reported by root. The web audit owner directly executed the
browser exchanges, permission changes and scoped cleanup, and inspected root's
diagnostic Study/reset receipts and the noted screenshots. Root supplied the final
reset navigation observation and latest build/probe status. Credentials, invitation codes,
raw device serials and real Child information are excluded from this record.

## Owner handoff

Root retains the active emulator lane and final evidence updates. Packaging and
installed identity for the separate `73aced8e…` extraction candidate now pass.
Continue Arabic/English messaging header and Study checks on that exact emulator APK.
Do not resume D: builds. Preserve the distinction between the verified internal
JavaScript update and the failed full Gradle builds. The final candidate still
needs critical Study/goal/isolation/reset regressions, messaging lifecycle/revocation,
native peer controls and accessibility evidence. Diagnostic Study/goal/reset,
native Parent restoration, phone/web exchange and English browser sibling controls
already pass for their named candidates; the installed `98223bd9…` update also
passes the specific presentation/restoration checks documented above.
Remaining browser gaps include Arabic sibling presentation, Child-initiated stop and
offline/unknown-send UI recovery. Record the candidate and device before changing
any pending gate; an emulator or one phone plus browser does not establish two
physical-phone acceptance. Named human review remains separate.

This bounded documentation update is released to root. It ran no test, build,
server or deployment. Preserve the successful hosted and scheduled-retention
evidence alongside the failed pre-fix browser attempt and pending final-candidate
native acceptance; the overall task is not yet complete.
