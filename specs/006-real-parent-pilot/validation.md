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
| Complete regression suite         | PASSED | `npx vitest run --maxWorkers=2`: 140 passed files, 1 skipped file; 1,866 passed tests, 1 skipped test. The skipped integration test was run separately with its opt-in flag.                                                                                                                                                                                                                                                                 |
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
and zero `pilot_access` rows. No hosted data was changed.

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

## Environment issues resolved during verification

- Optional Studio/postgres-meta images failed with `exec format error`.
  `supabase start --exclude studio,postgres-meta` supplied Auth, API, PostgreSQL and
  Mailpit. No unrelated Docker images or volumes were removed.
- Concurrent compiler work exhausted memory; final checks ran serially, with two
  regression workers.
- Initial Android export/index writes failed with `ENOSPC`. After the owner freed
  disk space, both succeeded. Cleanup attempts rejected by automatic approval
  review were not performed.
- A nominal demo export reused cached pilot environment values. `--clear` corrected
  the artifact; the runbook now requires cache clearing when changing mode/project.

## External gates

- BLOCKED: Hosted Mumbai project provisioning; Supabase dashboard is signed out.
  Owner sign-in requested in the opened tab; no hosted project is claimed.
- BLOCKED: External verification/recovery delivery. Owner confirmed no sending
  domain. Resend requires a verified domain; local Mailpit is test evidence only.
- NOT RUN: Physical Android SecureStore, process restart, keyboard, Back, TalkBack,
  RTL/reduced motion and provider failure/recovery. SDK `adb devices -l` returned no
  attached device. JavaScript exports and component tests cannot pass these gates.
- NOT RUN: Named Arabic/human pilot review and hosted activation review.
- Default authentication mode remains demo; no hosted activation, provider/SMTP
  secret, real Child data or real family-progress persistence is enabled.
