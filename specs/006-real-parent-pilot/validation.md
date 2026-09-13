# Feature 006 Validation

## Implementation evidence — 2026-09-13

The implementation is ready for code review. Hosted activation remains blocked by
the external gates below. Account fixtures were synthetic adults on an isolated
local Supabase project; no real participant or Child data was used.

| Check                             | Result | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                        | PASSED | `npm run typecheck`, including final UI changes.                                                                                                                                                                                                                                                                                                                                                                                             |
| Lint                              | PASSED | `npm run lint`; final changed UI/controller/integration files also passed scoped ESLint.                                                                                                                                                                                                                                                                                                                                                     |
| Formatting                        | PASSED | `npm run format:check`; final changed files also passed scoped Prettier.                                                                                                                                                                                                                                                                                                                                                                     |
| Complete regression suite         | PASSED | Final `npx vitest run --maxWorkers=1`: 140 passed files, 1 skipped file; 1,878 passed tests, 1 skipped test. The skipped local integration test was run separately with its opt-in flag during the implementation phase.                                                                                                                                                                                                                     |
| Account service/storage           | PASSED | 31 focused tests, including the installed SDK with injected transport, SecureStore chunking/failures, logout write barriers, identity changes and recovery receipts bound to the verified account.                                                                                                                                                                                                                                           |
| Gate/controller UI                | PASSED | 19 controller tests and 28 UI tests. Includes idle/busy identity changes, delayed callbacks, reset during refresh, blocked navigation, Android Back handler behavior and Child-view logout at component level.                                                                                                                                                                                                                               |
| Sample lifecycle/existing access  | PASSED | 159 tests across the focused pilot/access selection: memory-only fixtures, unchanged demo configuration, cleared service history and generation isolation.                                                                                                                                                                                                                                                                                   |
| Database migration/policies       | PASSED | 37 pgTAP assertions; Supabase CLI 2.117.0, PostgreSQL 17.6.1.167, Docker 29.2.1. Own-row reads, cross-user/client mutation denial, pending status, constraints and cascade deletion.                                                                                                                                                                                                                                                         |
| Actual local Auth/API integration | PASSED | Opt-in `tests/parent-account-local.integration.test.ts`, rerun after recovery fixes and expiry assertions. Registration, wrong/expired/reused confirmation codes, expired recovery codes, password replacement, old-password rejection, restoration/logout, approval/suspension, missing row and two-account isolation. Expiry was tested by aging only each test-created user's issuance timestamp beyond 3,600 seconds, then restoring it. |
| Pilot web export                  | PASSED | 39 static routes; final entry `entry-a25ca33e539617111bed23cfc1589ac1.js` embeds the intended local pilot configuration.                                                                                                                                                                                                                                                                                                                     |
| Default demo web export           | PASSED | `expo export --platform web --clear --max-workers 1`; 39 routes. Entry `entry-94e7bf6f869fb2f491783639df822fd4.js` embeds `demo` with undefined Supabase URL/key. Browser opened the existing Arabic intro/welcome.                                                                                                                                                                                                                          |
| Pilot Android JavaScript export   | PASSED | `expo export --platform android --max-workers 1`: Hermes bundle `entry-ecd9650c9f581ff58f7661de9e597731.hbc`, 94 assets. This is not an APK install or native-device acceptance.                                                                                                                                                                                                                                                             |
| Working-tree preservation         | PASSED | 26 unrelated initially modified files matched saved baseline hashes. Pilot-only layout/store changes were staged through verified index candidates; existing hydration/age/maintainer work remains unstaged.                                                                                                                                                                                                                                 |

The integration suite cleaned its own users and mailbox records. The separate
browser fixture was deleted too. Final local queries returned zero `auth.users`
and zero `pilot_access` rows. That local verification did not change hosted data.

## Direct browser evidence

Brave Browser exercised exported files on loopback ports 8094 (pilot) and 8095
(demo), with local Supabase and Mailpit. Screenshots and accessibility observations
are in the implementation task; credentials/codes are not copied into this record.

- PASSED: Arabic registration → emailed code → pending → administrator approval
  → launcher → canonical Parent experience. Direct `/parent` while signed out and
  `/child` while pending displayed the account gate.
- PASSED: English launcher/account controls, Arabic login screenshot with right
  aligned field labels and LTR email entry, and Child/pairing simulation labels.
- PASSED: Restart sample retained real login; browser reload restored the approved
  account to a fresh launcher. Continue sample resumed Parent after the account panel.
- PASSED: Complete synthetic Child PIN/pairing path, Child Today, persistent pilot
  account control, real signout from Child, and browser Back remaining signed out.
- PASSED: Wrong-password error, suspension after reload, unavailable backend showing
  retry/signout, and signout during the outage. No error-level browser console
  entries were captured during these checks.
- PASSED, limited: narrow Arabic login DOM at 390 × 844 CSS pixels had document
  width 390 and the expected controls. Screenshot capture repeatedly timed out,
  so narrow visual acceptance remains NOT RUN. Viewport overrides were reset.
- NOT RUN directly in browser: password replacement submission, cross-tab switching,
  storage-denial injection and the full one-minute polling interval. These have
  provider/controller/component coverage, not direct browser passes.

Hosted-configuration follow-up: `npm run start:pilot -- --localhost --port 8081
--max-workers 1` started the dedicated development preview. Brave directly showed
the Arabic login (screenshot reviewed) and English controls; direct `/parent` and
`/child` both settled on the signed-out gate. No error-level browser console entries
were captured. No credentials were entered or emails sent. This PASSED signed-out
preview does not establish hosted registration, recovery or session restoration.

## Environment issues resolved during verification

- Optional Studio/postgres-meta images failed with `exec format error`.
  `supabase start --exclude studio,postgres-meta` supplied Auth, API, PostgreSQL and
  Mailpit. No unrelated Docker images or volumes were removed.
- Concurrent compiler work exhausted memory; final checks ran serially, with two
  regression workers.
- During hosted setup, the two-worker regression rerun hit the existing Expo
  branding-config test's 5-second timeout (1,877 other tests passed). That file
  passed alone, then the complete one-worker suite passed all 1,878 tests in 97.88
  seconds. No unrelated test timeout or implementation was changed.
- Initial Android export/index writes failed with `ENOSPC`. After the owner freed
  disk space, both succeeded. Cleanup attempts rejected by automatic approval
  review were not performed.
- A nominal demo export reused cached pilot environment values. `--clear` corrected
  the artifact; the runbook now requires cache clearing when changing mode/project.

## External gates

- PASSED: Owner-authorized Mumbai project provisioning and schema/access metadata
  verification. The dedicated `ghaf-parent-pilot` project is healthy; the migration
  is applied and both Auth/approval tables contain zero users/rows. See the
  [hosted operator record](../../docs/backend/hosted-pilot.md).
- PASSED: Hosted read-only connection check with the publishable key. Auth settings
  returned HTTP 200 with email/signup enabled, confirmation required and anonymous
  access disabled. Anonymous approval-table SELECT returned HTTP 401 / SQLSTATE
  `42501` permission denied. No hosted identities or messages were created.
- PASSED: Email minimum password length 12, OTP length 8 with 3,600-second expiry,
  refresh-token compromise detection on, reuse interval 10 seconds and access-token
  expiry 3,600 seconds, directly observed in Dashboard. The app accepts exactly six
  or eight digits; 71 focused account/storage/UI tests passed after that adjustment.
- BLOCKED: External verification/recovery delivery. Owner confirmed no sending
  domain. Resend requires a verified domain; local Mailpit is test evidence only.
  This Free project's Dashboard also blocks template editing until custom SMTP is
  configured. Repository bilingual code templates are ready but are not installed;
  default hosted emails remain active. Resend interval must be checked at SMTP setup.
- NOT RUN: Hosted registration, email verification, login, recovery and approval
  transitions with controlled adult accounts. No local result substitutes for them.
- NOT RUN: Approved hosted web origin configuration; Site URL remains `http://localhost:3000`
  with no redirect allowlist. Typed-code templates do not use redirects.
- NOT RUN: Physical Android SecureStore, process restart, keyboard, Back, TalkBack,
  RTL/reduced motion and provider failure/recovery. SDK `adb devices -l` returned no
  attached device. JavaScript exports and component tests cannot pass these gates.
- NOT RUN: Named Arabic/human pilot review and hosted activation review.
- Default authentication mode remains demo; no hosted activation, provider/SMTP
  secret, real Child data or real family-progress persistence is enabled.
  An ignored `.env.pilot.local` supplies public project configuration only to the
  explicit `npm run start:pilot` development command, which clears Metro's cache.
