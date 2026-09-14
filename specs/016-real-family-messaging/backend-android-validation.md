# Messaging backend and Android integration evidence

**Recorded:** 2026-09-14, Dubai time. **Status:** Partial integration evidence;
diagnostic native Parent login/restoration, phone/web exchange and hosted retention pass.
The final native rebuild is blocked by observed D: write failures.

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
exited, and small run logs were copied to C:. No further build writes to D: are
authorized by this evidence; a healthy build location is needed. No final artifact or
installation pass is recorded yet. See the
[historical pause and resumed handoff](../../docs/competition-readiness/workstreams/messaging-android-resume-20260914.md).
The diagnostic APK's results do not pass the final corrected candidate. No production
readiness is claimed.

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

Storage-failure evidence is retained at
`.expo/messaging-integration/d-drive-write-failure.json` and
`.expo/messaging-integration/failed-native-052545/`. D: reports `Warning / Full Repair
Needed`; C: has about 1 GiB free. No disk repair, formatting or user-file removal was
performed. The failure exposed a launcher output-drain error that was not surfaced
until the Gradle client stopped; a bounded launcher correction is being validated.

| Check                                      | Status  | Observed result                                                                                                                                                                                                                                        |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dedicated hosted project                   | PASSED  | Free project `ghaf-family-messaging`, reference `ijiwkmvjppfallaoahmh`, Mumbai `ap-south-1`, PostgreSQL 17.6. The adult pilot `bqcfynlbxevqlzbkimhy` was left untouched.                                                                               |
| Messaging migrations                       | PASSED  | Migrations 001, 002 and additive 003 applied. Metadata inspection found 16 RPC functions and zero direct client table grants; the purge function remains operator-only.                                                                                |
| Hosted Auth setup                          | PASSED  | One synthetic Parent was created and confirmed through the dashboard, then allowlisted. Anonymous sign-in and email confirmation are enabled. No email delivery was used or tested.                                                                    |
| Basic hosted HTTP probes                   | PASSED  | Auth settings returned HTTP 200; an unauthenticated RPC probe returned HTTP 401. These probes alone do not establish the full authorization contract.                                                                                                  |
| Real Auth and messaging HTTP acceptance    | PASSED  | Initial real HTTP acceptance passed at 06:21:31; expanded post-003 acceptance passed at 07:26:22 in 17.79 seconds. Both used the actual client/provider with synthetic data.                                                                           |
| Test cleanup                               | PASSED  | Both synthetic Child devices were revoked and all three test sessions signed out. Test accounts, Child records, device tombstones and retained messages remain; cleanup did not revoke the Parent account or erase history.                            |
| Retention installation                     | PASSED  | `pg_cron` enabled; the exact `retention.sql` installed job 1, `ghaf-family-message-retention`, active with schedule `0 * * * *`.                                                                                                                       |
| Scheduled hourly retention execution       | PASSED  | `cron.job_run_details` records succeeded at 03:00:00.179407–03:00:00.190289 UTC (07:00 Dubai), with `return_message` of 1 row. This is job execution, not a claim that one message was deleted.                                                        |
| Backup/PITR acceptance                     | NOT RUN | The dashboard did not provide backups on the selected Free plan. PITR is a paid option and was not enabled; no backup-recovery or backup-erasure claim is made.                                                                                        |
| Local Android build prerequisites          | PASSED  | SDK 36, build tools 35/36, NDK 27.1.12297006 and CMake 3.30.5 verified on D:. `npm ci` installed 1,002 packages in approximately 18 minutes. This is setup evidence, not compilation evidence.                                                         |
| Physical device availability               | PASSED  | Authorized Samsung SM-S918B, Android 16, arm64 device detected. No raw device serial is included in this record.                                                                                                                                       |
| Expo Go launch attempt                     | FAILED  | Expo Go 57.0.9 did not load the candidate with the IPv6 development-server setup. This attempt supplies no passing app-behavior evidence.                                                                                                              |
| Compact browser access layouts             | PASSED  | Actual Chrome access and invalid-login states in Arabic/English at 320 px and 390 px had zero horizontal overflow. Corrected export `1a1c474` also issued the expected HTTP 400. Authenticated message exchange is separate.                           |
| Browser fetch regression correction        | PASSED  | Commit `b6f157c` fixes the global fetch receiver. Regression failed before the fix; all 32 client tests, scoped lint and formatting passed afterward.                                                                                                  |
| Actual browser sign-in after fetch fix     | PASSED  | Corrected export `1a1c474` returned Parent Auth HTTP 200 and displayed Sign out of messages. Sign-out completed without an unconfirmed-revocation notice. This does not establish authenticated message exchange.                                      |
| Diagnostic APK build and installation      | PASSED  | Source `273f97d` built in 52m 11s, passed APK verification and installed on Samsung SM-S918B / Android 16. The checkpoint records its SHA-256, internal signing and arm64/SDK36/backup-disabled inventory.                                             |
| Diagnostic native startup and study form   | PASSED  | With Metro stopped, the `273f97d` APK cold-launched; Android reported 704 ms. A Parent study plan saved, and keyboard/Back dismissal preserved the form. Native layout defects were observed and subsequently corrected in source.                     |
| Diagnostic native Parent login/restoration | PASSED  | On `273f97d`, real login reached the dedicated messaging service. After force-stop and a cold launch reported as 926 ms, returning to Messages displayed Messaging account: Synthetic Parent and actual server conversations without another password. |
| Resumed source checks                      | PASSED  | Study `6726f25` and messaging `923cf10` have scoped lint/format checks; final TypeScript exited 0. Messaging regression passed 73 tests with one opt-in skip at 09:24:48. These checks do not pass native presentation.                                |
| Final `923cf10` APK verification/install   | BLOCKED | Run `20260914T052545228Z-085ff9a9` failed after actual D: lost writes. No final APK was produced; verification/install require healthy storage.                                                                                                        |
| Final physical Android app acceptance      | NOT RUN | The corrected candidate still needs AR/EN layout, keyboard/Back, full study-goal flow, Child isolation/reset, messaging exchange, native lifecycle/revocation and accessibility checks. Diagnostic passes above remain separately attributed.          |
| Android Studio emulator acceptance         | NOT RUN | No AVD result is recorded here. Any later emulator pass must remain separate from the physical-device gate.                                                                                                                                            |
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
`273f97d` build subsequently passed; the final `923cf10` build remains in progress.

After resumption, `6726f25` limits the Study paragraph-direction correction and wider
tabs to native layout, and isolates the displayed selected nickname. `923cf10` gives
messaging a native physical LTR content context with explicit locale-aware role and
quick-phrase row order. Their read-only review found no role, form or transport
behavior change; actual corrected Arabic/English phone presentation remains pending.

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
the signed-in state and successful sign-out were observed. Authenticated
conversation/send acceptance remains pending; unit tests alone do not pass it.

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
build status were reported by root. Credentials, invitation codes,
raw device serials and real Child information are excluded from this record.

## Owner handoff

Root retains the active build/device lane and final evidence updates. Finish the
`923cf10` build, verify its APK and install it on the connected Samsung. Verify the
corrected AR/EN Study and messaging presentation, actual phone/web exchange and
peer controls, native lifecycle/revocation, the joint academic-goal journey, Child
isolation and reset. Browser Parent Auth and diagnostic Parent restoration already
pass; they do not replace these remaining observations. Record each candidate's
identity before changing pending gates. If an AVD is used, label its results as
emulator evidence; one phone plus browser is not two physical phones.

This bounded documentation update is released to root. It ran no test, build,
server or deployment. Preserve the successful hosted and scheduled-retention
evidence alongside the failed pre-fix browser attempt and pending post-fix/native
acceptance; the overall task is not yet complete.
