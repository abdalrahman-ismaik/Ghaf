# Messaging backend and Android integration evidence

**Recorded:** 2026-09-14, Dubai time. **Status:** Partial integration evidence; final
Android acceptance remains pending; hosted scheduled retention now passes.

The user authorized dedicated backend integration and physical Android testing using
Android Studio. Root coordinates `integration/messaging-android-20260914`, starting
from `caf2d00`. Its initial D: build was stopped after native configuration and
partial compilation to include the audited client correction at `7ee7f49`.
The downloaded SDK/build cache is retained for the updated candidate.
The diagnostic D: build at `273f97d` subsequently passed, installed on the Samsung,
and cold-launched without Metro. The corrected web export includes `b6f157c` and
actual browser Parent Auth returned HTTP 200. The owner then requested a pause.
The detailed table below preserves the earlier audit-stage observations; current
build/phone results, safe shutdown and exact next actions are recorded in the
[pause checkpoint](../../docs/competition-readiness/workstreams/messaging-android-resume-20260914.md).
Full physical acceptance and the final corrected APK remain pending. No production
readiness is claimed.

## Current evidence

| Check                                   | Status  | Observed result                                                                                                                                                                                                             |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated hosted project                | PASSED  | Free project `ghaf-family-messaging`, reference `ijiwkmvjppfallaoahmh`, Mumbai `ap-south-1`, PostgreSQL 17.6. The adult pilot `bqcfynlbxevqlzbkimhy` was left untouched.                                                    |
| Messaging migrations                    | PASSED  | Migrations 001, 002 and additive 003 applied. Metadata inspection found 16 RPC functions and zero direct client table grants; the purge function remains operator-only.                                                     |
| Hosted Auth setup                       | PASSED  | One synthetic Parent was created and confirmed through the dashboard, then allowlisted. Anonymous sign-in and email confirmation are enabled. No email delivery was used or tested.                                         |
| Basic hosted HTTP probes                | PASSED  | Auth settings returned HTTP 200; an unauthenticated RPC probe returned HTTP 401. These probes alone do not establish the full authorization contract.                                                                       |
| Real Auth and messaging HTTP acceptance | PASSED  | Initial real HTTP acceptance passed at 06:21:31; expanded post-003 acceptance passed at 07:26:22 in 17.79 seconds. Both used the actual client/provider with synthetic data.                                                |
| Test cleanup                            | PASSED  | Both synthetic Child devices were revoked and all three test sessions signed out. Test accounts, Child records, device tombstones and retained messages remain; cleanup did not revoke the Parent account or erase history. |
| Retention installation                  | PASSED  | `pg_cron` enabled; the exact `retention.sql` installed job 1, `ghaf-family-message-retention`, active with schedule `0 * * * *`.                                                                                            |
| Scheduled hourly retention execution    | PASSED  | `cron.job_run_details` records succeeded at 03:00:00.179407–03:00:00.190289 UTC (07:00 Dubai), with `return_message` of 1 row. This is job execution, not a claim that one message was deleted.                             |
| Backup/PITR acceptance                  | NOT RUN | The dashboard did not provide backups on the selected Free plan. PITR is a paid option and was not enabled; no backup-recovery or backup-erasure claim is made.                                                             |
| Local Android build prerequisites       | PASSED  | SDK 36, build tools 35/36, NDK 27.1.12297006 and CMake 3.30.5 verified on D:. `npm ci` installed 1,002 packages in approximately 18 minutes. This is setup evidence, not compilation evidence.                              |
| Physical device availability            | PASSED  | Authorized Samsung SM-S918B, Android 16, arm64 device detected. No raw device serial is included in this record.                                                                                                            |
| Expo Go launch attempt                  | FAILED  | Expo Go 57.0.9 did not load the candidate with the IPv6 development-server setup. This attempt supplies no passing app-behavior evidence.                                                                                   |
| Compact browser access layouts          | PASSED  | Configured `273f97d` export in actual Chrome: Arabic/English at 320 px and 390 px, zero horizontal overflow elements. Authenticated conversation acceptance is separate.                                                    |
| Browser fetch regression correction     | PASSED  | Commit `b6f157c` fixes the global fetch receiver. Regression failed before the fix; all 32 client tests, scoped lint and formatting passed afterward.                                                                       |
| Actual browser sign-in after fetch fix  | NOT RUN | The `273f97d` browser attempt failed before HTTP with `Illegal invocation`. A rebuilt candidate including `b6f157c` still needs actual browser confirmation.                                                                |
| Standalone APK build and installation   | NOT RUN | The D: build at `273f97d` is in progress. Final acceptance requires a build including `b6f157c`; no successful APK or installation receipt is recorded yet.                                                                 |
| Physical Android app acceptance         | NOT RUN | Keyboard, Back, TalkBack, Arabic/English layout, session persistence, process restart and actual messaging on the installed candidate remain unverified.                                                                    |
| Android Studio emulator acceptance      | NOT RUN | No AVD result is recorded here. Any later emulator pass must remain separate from the physical-device gate.                                                                                                                 |
| Named human content/usability review    | NOT RUN | No named Arabic, accessibility or participant review was supplied by this session.                                                                                                                                          |

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

Final focused messaging checks at `b6f157c` passed 73 tests across five files at
07:52:31 Dubai time in 5.61 seconds, with one opt-in hosted test skipped. This run
used one worker and a 384 MB heap; receipt:
`.expo/messaging-integration/messaging-final-tests.log`. It does not repeat the
earlier real hosted acceptance. The coordinator's read-only source review found
no further blocker in the fetch fix or Windows build launcher; native compilation
is still in progress and has no passing build or device receipt yet.

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
scoped lint and formatting. An actual browser sign-in after rebuilding with this
fix remains pending; unit tests do not pass that gate.

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
web audit JSON, SQL recapture receipts and source references. Credentials, invitation codes,
raw device serials and real Child information are excluded from this record.

## Owner handoff

Root retains the active build/device lane and final evidence updates. Rebuild and
verify the configured browser candidate with `b6f157c`, then obtain the final native
build receipt including that correction, install it on the connected Samsung and
exercise the native acceptance journey. Record exact candidate identities before
changing pending gates. If an AVD is used, label its results as emulator evidence.

This bounded documentation update is released to root. It ran no test, build,
server or deployment. Preserve the successful hosted and scheduled-retention
evidence alongside the failed pre-fix browser attempt and pending post-fix/native
acceptance; the overall task is not yet complete.
