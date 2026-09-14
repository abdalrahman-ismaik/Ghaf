# Messaging backend and Android integration evidence

**Recorded:** 2026-09-14, Dubai time. **Status:** Partial integration evidence; final
Android and scheduled-retention acceptance remains pending.

The user authorized dedicated backend integration and physical Android testing using
Android Studio. Root coordinates `integration/messaging-android-20260914`, starting
from `caf2d00`. The D: native candidate uses that exact committed application source
with dedicated public messaging configuration; integration scripts, tests and
documentation are tracked separately in the C: workspace.
This record does not claim a completed APK, physical app acceptance or production readiness.

## Current evidence

| Check                                   | Status  | Observed result                                                                                                                                                                                                             |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated hosted project                | PASSED  | Free project `ghaf-family-messaging`, reference `ijiwkmvjppfallaoahmh`, Mumbai `ap-south-1`, PostgreSQL 17.6. The adult pilot `bqcfynlbxevqlzbkimhy` was left untouched.                                                    |
| Messaging migrations                    | PASSED  | Migration 001 and additive 002 applied. Metadata inspection found 16 RPC functions and zero direct client table grants; the purge function remains operator-only.                                                           |
| Hosted Auth setup                       | PASSED  | One synthetic Parent was created and confirmed through the dashboard, then allowlisted. Anonymous sign-in and email confirmation are enabled. No email delivery was used or tested.                                         |
| Basic hosted HTTP probes                | PASSED  | Auth settings returned HTTP 200; an unauthenticated RPC probe returned HTTP 401. These probes alone do not establish the full authorization contract.                                                                       |
| Real Auth and messaging HTTP acceptance | PASSED  | One serial hosted integration test passed at 06:21:31: 12.00 seconds of test execution, 13.00 seconds total. It used the actual client and provider with synthetic data.                                                    |
| Test cleanup                            | PASSED  | Both synthetic Child devices were revoked and all three test sessions signed out. Test accounts, Child records, device tombstones and retained messages remain; cleanup did not revoke the Parent account or erase history. |
| Retention installation                  | PASSED  | `pg_cron` enabled; the exact `retention.sql` installed job 1, `ghaf-family-message-retention`, active with schedule `0 * * * *`.                                                                                            |
| Scheduled hourly retention execution    | NOT RUN | A successful later scheduled job run has not yet been observed. The installed schedule and initial purge do not pass this gate.                                                                                             |
| Backup/PITR acceptance                  | NOT RUN | The dashboard did not provide backups on the selected Free plan. PITR is a paid option and was not enabled; no backup-recovery or backup-erasure claim is made.                                                             |
| Local Android build prerequisites       | PASSED  | SDK 36, build tools 35/36, NDK 27.1.12297006 and CMake 3.30.5 verified on D:. `npm ci` installed 1,002 packages in approximately 18 minutes. This is setup evidence, not compilation evidence.                              |
| Physical device availability            | PASSED  | Authorized Samsung SM-S918B, Android 16, arm64 device detected. No raw device serial is included in this record.                                                                                                            |
| Expo Go launch attempt                  | FAILED  | Expo Go 57.0.9 did not load the candidate with the IPv6 development-server setup. This attempt supplies no passing app-behavior evidence.                                                                                   |
| Standalone APK build and installation   | NOT RUN | Root is proceeding with standalone compilation first. No successful APK/build or installation receipt is available for this record.                                                                                         |
| Physical Android app acceptance         | NOT RUN | Keyboard, Back, TalkBack, Arabic/English layout, session persistence, process restart and actual messaging on the installed candidate remain unverified.                                                                    |
| Android Studio emulator acceptance      | NOT RUN | No AVD result is recorded here. Any later emulator pass must remain separate from the physical-device gate.                                                                                                                 |
| Named human content/usability review    | NOT RUN | No named Arabic, accessibility or participant review was supplied by this session.                                                                                                                                          |

The hosted test exercised Parent login, two separately enrolled Child identities,
Parent–Child bidirectional messages, same-key idempotency, canonical peer permission,
Child–Child messages, Parent exclusion from peer content, the 6–8 phrase constraint,
either Child leaving, Parent revocation and retained access to the separate Parent
thread. It does not establish native UI, offline interruption recovery, scheduled
retention, backup recovery or every manual hosted acceptance case.

The current test project's CAPTCHA setting is off by default. The messaging client
has no CAPTCHA challenge/token flow; this controlled synthetic setup does not
establish production abuse prevention. No existing pilot protections were disabled
to accommodate the messaging client.

## Execution notes and references

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
  [Parent provisioning](../../workers/ghaf-family-messaging/provision-parent.sql) and
  [retention](../../workers/ghaf-family-messaging/retention.sql).
- Remaining procedure: [setup and acceptance guide](quickstart.md).
- Historical local evidence: [Feature017 validation](../017-study-family-support/validation.md).

Project configuration, dashboard setup, SQL outcomes and device/tool inventory above
were reported by the root integration owner. The documentation owner directly
inspected the hosted-test log and source references. Credentials, invitation codes,
raw device serials and real Child information are excluded from this record.

## Owner handoff

Root owns the active build/device lane and the next evidence update: obtain the
standalone build receipt, install the exact candidate on the connected Samsung,
exercise the native acceptance journey and inspect a successful later run of the
named hourly retention job. Record exact build identity and results before changing
the pending gates. If an AVD is used, label its results as emulator evidence.

`/root/messaging_extension` owns this documentation slice only. No additional test,
build, deployment or Git mutation was performed to prepare this record. The next
owner should preserve both the successful hosted evidence and the failed/pending
native observations rather than treating backend success as final completion.
