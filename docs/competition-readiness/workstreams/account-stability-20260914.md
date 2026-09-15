# Account, family, task and language stability

Date: 2026-09-14. Starting revision: `fe74286` on `main`; changes are local and uncommitted.
Authority: the user's request for fixes and real Supabase data, followed by email/password login
and specific family/task/language priorities. Contract:
[Feature 018 amendment](../../../specs/018-persistent-adult-accounts/stability-and-primary-workspace.md).

## Delivered behavior

- `npm run start:pilot` starts without a missing optional `.env.pilot.local` file and always selects
  real adult access. Ordinary Expo env files and explicit shell values work; messaging uses its
  own optional overlay. No automatic cache clearing or dependency changes were needed.
- Approved Supabase sign-in opens the saved account-owned family/tasks/study workspace first.
  Account settings and the preserved sample are separate choices. Changing those panels retains
  the mounted workspace/draft; denied access and identity changes still clear protected views.
- Empty accounts guide family name → saved member → first task. New tasks/study plans require a
  selected saved member. Create/edit/complete actions retain existing server revision/ownership
  checks and display success only after a successful provider receipt.
- Typed drafts survive language/section changes and failed reads. Explicit reload retains the
  draft, updates its revision and asks for review before saving; it never silently resubmits.
  UI submission guards prevent repeated callbacks while a save/completion is pending. The existing
  controller remains the underlying one-write authority.
- All four local Child-profile “Other” fields now explain blank/short answers. Existing errors
  translate when the language changes. Changing child index resets scroll while retaining drafts.
- An unrelated saved profile revision no longer changes the current interface language. An actual
  saved language change still applies, as does the saved preference on a new sign-in. Native
  direction persistence now records the last selection even after switching back to the startup
  language. The compact language control fits its buttons without an empty stretched segment.
- The sample's task workspace candidate now retains earlier assignments, child filters and
  assigned/pending/completed history after a new task becomes current.

## Workflow

Start `npm run start:pilot -- --web --localhost --port 8093` using the ignored public Supabase
account configuration. Sign in with email/password; registration and recovery retain their email
codes and the existing administrator approval gate. In **Family and tasks**, save the family name,
add a member, then open **Tasks**, choose the member and save a title. Complete/reopen and reload
to verify saved planning progress. **Study** saves a subject and next step in the same owned
workspace. Account settings hold the saved profile/language preference. The sample family is an
explicit secondary choice for the complete Child, Seeds, garden, League and Masroofi demonstration.

The cloud planning completion flag is not a Child approval or a Seed/money authority. Masroofi's
UAE card, spending categories and existing reward flow remain simulated and preserved. No sample
data is uploaded or substituted for account records; no new schema or payment behavior was added.

## Reproduction and verification

| Check                                 | Result                    | Evidence / limit                                                                                                                                                                                                                |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing optional launcher file        | PASSED after fix          | Previously exited before Expo; actual updated launch reached the login page without the optional file.                                                                                                                          |
| Workspace draft/member regressions    | PASSED after fix          | Initial focused run failed 8 of 16 cases; actual defects and newly required behavior are distinguished in tests. Final workspace suite passes 19 cases.                                                                         |
| Native direction round trip           | PASSED in unit harness    | Both Arabic-start and English-start tests failed before the fix and pass afterward. This is not native-device evidence.                                                                                                         |
| Profile refresh language reversion    | PASSED after fix          | New regression failed before the key changed from revision to saved locale; actual preference changes and new sign-in remain covered.                                                                                           |
| Focused combined forms/history suite  | PASSED                    | 96 tests across six files, including real sample store task transitions.                                                                                                                                                        |
| TypeScript                            | PASSED                    | `npm run typecheck`; two newly added test array-access types were corrected without changing assertions.                                                                                                                        |
| Lint                                  | PASSED                    | `npm run lint`; a new hook-dependency warning was corrected, then the complete command passed.                                                                                                                                  |
| Formatting                            | PASSED                    | `npm run format:check`, now including development launcher scripts.                                                                                                                                                             |
| Full Vitest regression suite          | PASSED                    | `npm test -- --maxWorkers=2`: 206 files passed, 2 skipped; 3,118 tests passed, 2 skipped; 111.58 seconds. Skips are opt-in integration gates, not passes.                                                                       |
| Launcher tests                        | PASSED                    | `npm run test:startup`: 12 tests, including env precedence, absent overlays, exact argument forwarding and sanitized failures.                                                                                                  |
| Repository checks                     | PASSED                    | `npm run repo:check`: five checker tests plus repository navigation/test-path/artifact checks. `git diff --check` also passed.                                                                                                  |
| Development web compilation           | PASSED                    | Expo router server and client bundles compiled; the actual Supabase-mode login page rendered. No static export or native build was attempted.                                                                                   |
| Fresh browser auth/language checks    | PASSED                    | Isolated Chrome at 390 × 844: AR RTL / EN LTR, no horizontal overflow, selected language, typed-email/password retention, password reveal, registration/recovery navigation and secret clearing. No credentials were submitted. |
| Visual inspection                     | PASSED for login surface  | Arabic and English screenshots reviewed; confirmation shows centered 146 px language control. No claim of signed-in workspace visual acceptance.                                                                                |
| Interface detector                    | PASSED for scoped targets | One `impeccable` detector run returned no findings for changed account/workspace/family/task surfaces.                                                                                                                          |
| Public hosted provider probe          | PASSED, bounded           | `/auth/v1/settings`: HTTP 200, email enabled, signup not disabled. Anonymous zero-row workspace request: HTTP 401 / `42501`. No private row or credential was read and no hosted record was changed.                            |
| Authenticated hosted save/reload      | BLOCKED in this run       | No controlled signed-in test session was available. The user was asked to test the running app without sharing a password. Historical Feature 018 provider passes are not inherited.                                            |
| Physical/native build and interaction | NOT RUN                   | No fresh APK, Android RTL restart, native keyboard/Back, TalkBack or physical-device acceptance. C: has under 1 GiB available; no native build or cleanup was attempted.                                                        |
| Named human Arabic/cultural review    | NOT RUN                   | Automated resource parity does not replace named review.                                                                                                                                                                        |

The first sandboxed headless Chrome process exited before opening its test port; an approved
isolated headless launch succeeded. Existing Expo development warnings for web file-system
support, pointer-event deprecation, the SDK's existing auth-lock option deprecation and terminal
color settings were observed; they did not prevent
the login page or the recorded controls from working. They are not counted as application crashes.

Ignored evidence lives in `output/account-stability/`: public probe JSON, bounded browser scripts,
layout confirmation and login screenshots. No tokens, passwords or real Child data are included
in this tracked report. The isolated browser has never signed in to the backend.

## Supabase review

Used the installed Supabase skill, current
[changelog](https://supabase.com/changelog),
[React Native auth guide](https://supabase.com/docs/guides/auth/quickstarts/react-native),
[RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) and
[database functions guide](https://supabase.com/docs/guides/database/functions).
The skill's old monitoring URL returned 404; current
[logs](https://supabase.com/docs/guides/observability/logs) and
[advanced filtering](https://supabase.com/docs/guides/observability/advanced-log-filtering) pages were
used instead. No privileged hosted logs were accessed.

Source review retained `pilot_access`, profile/workspace ownership, explicit grants, RPC validation,
row locks and revision checks. Current Node/TypeScript meet the reviewed changelog requirements;
no speculative dependency upgrade or grant broadening was performed. Existing account and messaging
projects/identities remain separate. No exact field-to-synthetic-Child-ID mapping was invented.

## Files and handoff

Root changed the account view/gate, native language configuration, compact switcher, package
scripts, profile/UI regressions, Feature 018 amendment/links/tasks, development/product/limitation
docs, runbook, script index, ownership and AI-assistance ledger. Helpers changed the cloud workspace
view/resources/tests, local family form/route/tests, launcher/test files and task-history route/test.

Existing `package-lock.json`, `skills-lock.json` and untracked installed Supabase skill changes are
user-owned and preserved. No files, caches or family records were deleted. No install, database
reset, commit, push, merge or deployment was performed in this continuation. All helper boundaries
are released; source is ready for local integration review. Hosted authenticated and native evidence
remain the specific outstanding acceptance gates above. The interface context tool also reported
stale/missing platform context; this documentation issue was noted without expanding the repair scope.
