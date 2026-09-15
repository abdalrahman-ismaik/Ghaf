# Full Supabase family migration evidence — 2026-09-14

## Scope and authorization

The user rejected the narrow planning workspace and requested a full migration from predefined
application data into Supabase. Feature 019, the constitution exception and ownership record were
updated before implementation. Existing email/password Parent auth, UAE Masroofi artwork,
spending categories, prior stability fixes and explicit local sample were preserved. No source
file, hosted user, family record or migration history was deleted or reset.

The two CLI-generated migrations introduce 65 related private tables and three public RPC entry
points. Family, task versions/assignments/attempts/approval/recognition, permanent Seed/garden
evidence, rewards/cards, study/goals, learning/badges, League and revocable Child enrollment now
have server authorities. The full primary cloud UI uses async commands and real UUIDs. Legacy
workspace import is additive and never fabricates earned progress. Prepared practice/help remains
bounded and messaging retains its independently authenticated project.

## Reproduced defects fixed

- SQL parser failures in unparenthesized CASE expressions inside PL/pgSQL conditions.
- Missing full Child submission receipt validation and conflicting saved-template source IDs.
- Unknown-write retries stuck when optional draft fields were `undefined`.
- Stale form drafts overwriting later record versions; explicit conflict review now precedes save.
- Child credential cleanup skipped when refresh-stop failed, cached credentials surviving logout,
  and insufficient anonymous-user identity validation.
- Archived task-version promises incorrectly rejected by snapshot validation.
- Corrected ages stranding historical card records; current eligibility now governs new actions
  while prior balances/history remain readable.
- Custom recurrent task awards incorrectly restored from a catalog instead of immutable terms.
- More than five weekly Leaves obtained by nominating different work in multiple circles.
- Missing profiles in synthetic SQL test setup, corrupted Arabic reference labels, and a prepared
  help null-state crash found by direct checks.
- Expo's Windows watcher crashing on temporary browser-profile folders under ignored output;
  Metro now excludes verification artifacts while preserving its existing defaults.
- Native `selectable` leaking as an invalid DOM boolean attribute; web now uses CSS selection.
- Stacked phone navigation obscuring content; concise account tabs and a correctly directed
  horizontal section list retain mounted drafts.

## Evidence

| Check                                     | Result                          | Exact scope                                                                                                                                                                            |
| ----------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All six migrations                        | PASSED                          | Applied in order to isolated in-memory PostgreSQL 18.3 with pgcrypto.                                                                                                                  |
| SQL regression suites                     | PASSED                          | 447 assertions: 47 profiles, 42 provider status, 77 legacy workspaces, 133 extensions, 111 core, 37 access. No skips; rollback and plan checks passed.                                 |
| SQL-to-app contracts                      | PASSED                          | 25 actual `ghaf_read` snapshots and `ghaf_command` receipts validated by the app's strict TypeScript parser.                                                                           |
| TypeScript                                | PASSED                          | `npm run typecheck`, including the final schema/age/version/Companion contracts.                                                                                                       |
| Lint                                      | PASSED                          | Complete `npm run lint` passed again after the final compact navigation and selectable presentation adjustment.                                                                        |
| Formatting                                | PASSED                          | Full `npm run format:check` after formatting the six released rewards/study files.                                                                                                     |
| Full Vitest suite                         | PASSED                          | 214 files passed, 2 skipped; 3,329 tests passed, 2 skipped; 116.82 seconds. The skips are opt-in integration gates.                                                                    |
| Final affected regressions                | PASSED                          | 279 tests across 11 files after final presentation changes, including cloud, auth UI, button accessibility and preserved practices.                                                    |
| Launcher / repository                     | PASSED                          | 12 startup tests, five repository checker tests, navigation/artifact checks and `git diff --check`.                                                                                    |
| Expo web compilation                      | PASSED                          | Actual server/client bundles compiled and served at port 8093 after the watcher fix.                                                                                                   |
| Browser Parent sections                   | PASSED, intercepted             | 10 sections in both Arabic and English at 390×844; saved-member selection and UAE card render; no overflow, missing resource keys, runtime exceptions or console errors in final pass. |
| Browser Child sections                    | PASSED, intercepted             | Nine own-Child sections in both locales; same layout/error checks. Own card, balance and history rendered.                                                                             |
| Visual review                             | PASSED for scoped browser views | Parent Family/Tasks/Masroofi and Child Masroofi screenshots inspected; final RTL tab order and full card reviewed.                                                                     |
| Hosted migration / readback               | BLOCKED                         | No Supabase MCP admin connection. CLI `projects list` explicitly returned “Access token not provided.” No new hosted schema or Auth setting was changed.                               |
| Real GoTrue enrollment/email/cross-client | BLOCKED in this run             | SQL Auth facade and intercepted browser sessions do not verify real provider behavior.                                                                                                 |
| Android / static export / APK             | NOT RUN                         | No fresh physical/native acceptance or standalone export is claimed. Browser compilation is separate evidence.                                                                         |
| Named human review                        | NOT RUN                         | Arabic/cultural review and competition rehearsal are separate gates.                                                                                                                   |

The final SQL receipt is
`output/supabase-migration/sql-verification-2026-09-14T19-15-31-011Z.json`; it includes migration/test
SHA-256 hashes and the 25 contract results. Synthetic snapshots, browser scripts, JSON checks and
screenshots are ignored artifacts in the same directory. Browser verification intercepted every
Supabase request and used synthetic SQL-produced records plus a test Auth response. It did not
send a real password, create a hosted account or persist a hosted family. The isolated browser
was closed afterward. An initially sandboxed headless launch exited; the approved isolated launch
succeeded. No rejection prevented the final browser check.

The official CLI 2.117.0 was checksum-verified. Isolated PGlite/pgTAP tooling did not change app
dependencies or user-owned lockfiles. One unused tooling junction created by npm was retained;
the verifier imports only explicit checked tooling paths and never app code through that junction.

## Handoff

Changed source boundaries are `src/components/cloudFamily/`, `src/features/cloudFamily/`,
`src/models/cloudFamily.ts`, bilingual cloud resources, Parent account/gate/storage integration,
small messaging/practice/connection presentation adapters and the reproduced Metro/Text fixes.
SQL, SQL tests, cloud regression tests, Feature 019, operating/product/limitation/runbook documents
and the AI-assistance ledger accompany them. All helper write boundaries are released.

The source is ready for integration review; hosted activation is not complete. Authenticate the
CLI or connect administrative MCP, inspect the target/history, apply only the two reviewed
additive migrations, enable hosted anonymous Auth and verify actual API persistence and revocation.
Use [the full operator workflow](../../backend/full-family-migration.md). Unsupported learning
packages stay unavailable; production pagination/retention, real payments and live Child media
are outside the implemented capability. No commit, push or public deployment occurred in this run.
