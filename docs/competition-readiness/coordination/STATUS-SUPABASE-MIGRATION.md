# Supabase family migration — 2026-09-14

Owner/integrator `/root`, source `e48e8e2`, same Windows checkout on main.
Authority: current full account-data migration request; Feature020 records scope.
Existing NAV-MOTION modified/untracked files remain separately owned and unchanged.
Four existing helpers performed read-only audits; root is granting disjoint work.
Only reviewed additive hosted changes and invocation-owned synthetic HTTP fixtures
have been created in this run; no existing family was reset, imported or deleted.
One root DB/build lane.

Initial findings: real adult Auth/profile/private planning workspace already exists;
main navigator opens only synthetic sample. Local task/growth assumes fixed people
and seeded balances. All pilot sample repositories are memory-only. No persistent
user-uploaded media exists; calendar/allowance/location/calls are missing features.
Real family migration must use UUID membership authority, not hydrate mock state.

Reservations: root owns this checkpoint, Feature020 specification, migration
inventory, account auth/service integration, configuration, docs and final checks.
Helpers have no overlapping write grants until explicit contracts below are issued.

Active grants (root + five bounded helpers; no descendants, one DB/build lane):

- backend_audit: 20260915000100_family_accounts.sql, family_accounts.test.sql,
  approved catalog migration/reference and contracts/core.md.
- core_audit: cloudFamily model, features/cloud-family, services/cloud-family,
  tests/cloud-family; typed DTOs/controller and authoritative re-fetch behavior.
- planning_ai_audit: 20260915000200_family_documents.sql, its database tests,
  cloudFamilyDocuments model, features/cloud-study, components/cloud-study,
  tests/cloud-study and contracts/documents.md.
- presentation_audit: components/cloud-family, cloudFamilyResources and
  tests/cloud-family-ui; root mounts boundary in the real authenticated gate.
- cloud_auth: parentAccount model, existing account SDK service/index, pilot
  controller, two new cloud-family-auth test files. Same-client anonymous Child
  pairing, safe RPC allowlist/Realtime cleanup; no Parent token on Child device.
- root: remaining auth/gate UI, config, documentation, backend environment/checks
  and integration; no existing NAV-MOTION file is reserved for source changes.

Checkpoint at 2026-09-14 22:40 Dubai:

- Local additive migrations 00100 core, 00101 global reference and 00200 documents
  applied using CLI 2.117.0. Existing four migrations and account records retained.
- Core pgTAP: 73/73 passed through local PostgreSQL 17.6 restricted-role tests.
  The initial failed mandatory-step case targeted an adult guidance step; corrected
  to the actual action step without weakening the assertion. SQL guard was correct.
- Core controller/config: 30 tests passed. Auth helper reports 97 focused tests
  passed, including pairing UI retry, same-user reauth and isolated session storage.
  These are automated tests, not hosted or physical-device evidence.
- Root mounted real family boundary, explicit Child pairing and retained legacy
  personal plans; real mode is default, explicit demo test/build configuration remains.
- Local Docker command inspection/test runner hangs while PostgreSQL/API respond.
  A loopback-only pgTAP runner uses pg@8.16.3 installed under ignored .expo, with no
  application dependency change. No Docker restart or volume reset.
- Hosted metadata preflight read only: linked bqcfynlbxevqlzbkimhy has the expected
  account_profiles/account_workspaces/pilot_access tables with RLS; no app_* collision.
- Additional disjoint grants: core_audit owns growth003 SQL/model/service/projection;
  backend_audit owns task extensions005 and messages004; growth_ui owns cloud-growth
  components/controller/resources/tests. Root plus six helpers = seven, no descendants,
  code-only parallelism and one DB/build lane; ~3.4GB free physical memory at allocation.
- Next: documents/growth/custom/messages checks, full integration checks, restricted
  Auth HTTP clients, hosted additive deployment after checks, actual UI/browser/Android.

Checkpoint at 2026-09-14 22:50 Dubai:

- Hosted 00100/00101/00200 deployed after dry-run review of exactly those migrations,
  no seed/roles payload. Configuration diff/push declared only anonymous sign-ins=true
  for backend-enforced Child pairing; 21 undeclared hosted settings were preserved.
- Raw Supabase HTTP/SDK checks: five groups PASSED with independent A/A2/B and
  anonymous Child identities. Freshness, create retry, correct shared readback,
  cross-family/role attacks + unchanged target, complete task/help/submission/praise/
  immutable award/memory, sign-out/re-sign-in restoration and Child revocation.
  Report `.expo/family-verification/4d2450ee-924c-4666-8369-ba9fb84ef1b3/result.json`;
  fixture credentials remain only in ignored local artifacts, never repository evidence.
- Documents pgTAP 88/88, growth pgTAP 56/56, custom/routine pgTAP 30/30 passed locally.
  Growth003 and task005 are applied locally only. Exact landscape milestone semantics
  need additive008 before hosted rollout; monthly/private/League behavior remains under review.
- Independent security reviewer found transport error mapping and stale private document
  cleanup gaps; helpers fixed them with regression tests. Request-origin identity must
  also be checked before dispatch and pinned to the verified bearer token; in progress.
- Main family UI 13/13 focused component checks passed. Real Parent name is required at
  fresh setup; no invented fallback. These are synthetic DTO tests, not native evidence.
- Next: finish messaging, input/FK hardening006, free capacity007, milestone008;
  rerun coherent full checks, actual service-adapter HTTP test, browser and Android.
  Checkpoint at 2026-09-14 23:30 Dubai:
- Hosted additive migrations001–014 (including00101 references) applied after local checks
  and explicit dryruns; no seeds/history/reset. pg_cron enabled, one named hourly
  new-message retention job; local23purge checks passed, scheduled hosted run pending.
- Local PostgreSQL17.6: 624checks in16files passed together, plus23retention checks
  separately (647total). All execute restricted roles; fixtures roll back.
- Full frontend: npm test -- --maxWorkers=2,3405passed/5skipped,239files. Later exact
  UI/validator/auth regression:83passed3files. Typecheck, lint, format:check and
  repo:check passed; latest schema-derived types also typechecked. No stack upgrades.
- Hosted real SDK: installed-service identity race test passed; document and messaging
  full lifecycle tests both passed (37.23s); Realtime WebSocket/reconnect/isolation test
  passed (17.46s). Only invocation-owned synthetic Auth/family data used.
- Browser: localhost Parent A14222 begins without a family, creates its chosen family
  and one Child, assignsGI01. Separate IPv6-loopback browser origin pairs its own
  anonymous Child session. Actual task submission, Parent praise/recognition produces
  exactly8Seeds/onecanopy; saved textmemory visible to both. Reload restores both;
  A signout/B login shows freshsetup, Child session stays scoped to A.
- Browser exposed submit mismatch: optional/adult steps were unresolved despite enabled
  button; server denied correctly. UI plus DTOvalidation now require allstepsdecided;
  adult/optional skip is explicit, action skip denied. Focused regression83 passed.
- Provider defects fixed:010read-only authorization no accidental25006/emptyfallback;
  012scalarJSON returns all127records despite100rowRESTlimit;013PT409 prevents
  deliberately raised40001businessconflicts looping insidePostgREST.
- Runtime Feature020 changes committed through c54f25f; unrelated NAV-MOTION and
  RELEASE files remain uncommitted and untouched. Six helpers releasedcode; root
  retains final native/build/docs lane. No source writes duringnative compilation.
- Native: currentGradle build lacks20GBdiskpreflight. Attempting verified JS/Hermes
  rebundle into existing isolated accounttest2 nativecontainer with98exactasset and
  signer/payload checks; not a fullGradle/release build. OriginalAPK/device data kept.
  Candidate receipts under ignored .expo/family-native-prep/family-candidate-1.

Checkpoint at 2026-09-14 23:45 Dubai:

- Final full automated run passed: 3,412 tests, six opt-in skips, 240 files;
  npm test -- --maxWorkers=2 at 23:39:00, 73.71 seconds. Runtime source c54f25f;
  d13c148 corrects the required gateway replay-store test fixture without weakening assertions.
- Internal c54f25f Hermes APK packaged/signature checked, installed preserving data,
  and cold launched on emulator-5554; Arabic real-account sign-in rendered. Source
  and APK provenance are in the inventory. Not a current Gradle/release build.
- RELEASE-011 released emulator input. Feature020 root now reserves accounttest2-only
  native synthetic sign-in/restart checks; user0/user10/user11 and original app data
  stay intact. Release's remote full Gradle build remains separate and authoritative.
- core_audit has one renewed exact-file grant: tests/access/family-growth-hosted.integration.test.ts;
  hosted normal-RPC coverage of growth, learning, rewards and private League using
  its own new synthetic family. All other helper code boundaries remain released.

Checkpoint at 2026-09-14 23:53 Dubai:

- Hosted growth/learning/reward/League suite PASSED: one test, 47.39 seconds at
  23:49:30, 133 ordinary authorized commands; no administrative award writes.
  Report growth-hosted-b1c9c71d-2b31-45ef-a7a1-eef3b4cdd192.json records six groups,
  16 legitimate synthetic confirmations, Child A 132 Seeds/Child B 60, tied score100,
  private promise unlock/given, accessible learning idempotency and independent reload.
  First failed invocation was a test expectation mixing P0 standard with GI01 fade_first;
  corrected against canonical content, no runtime rule/test protection weakened.
- Retention scheduled execution PASSED at 19:45:00.109294Z. Only the existing exact
  named job temporarily used a one-minute cadence. Its hourly schedule was restored
  in finally and the guarded configuration RPC verified it; unrelated jobs untouched.
- Native accounttest2: synthetic browser Parent A signed in; actual same family/Child,
  8 Seeds and one canopy contribution loaded. Force-stop/cold restart restored Auth
  and the same data. Garden-to-Family Android Back and keyboard dismissal exercised.
  UI XML and inspected botanical screenshot are under the ignored candidate directory.
  Sign-out completed; sign-in form visible and prior family/Child absent.
- EMULATOR INPUT RELEASED to RELEASE root. No session/data reset or original package
  modification; accounttest2 remains signed out. For the fresh full-Gradle APK's
  isolated user11 journey, use only retained synthetic invocation14222bba-3eb0-4e26-a5e1-df03d6991bad
  under .expo/family-verification; its private-fixtures.json holds test accounts A/B.
  A has only the browser-created Verification Family UI14222 and one Child/completedGI01
  with8Seeds/memory; B has no family. Credentials must stay in ignored files, not logs.
- Current release Gradle CI remains separately owned. This lane claims emulator Parent
  persistence only, not full native Child onboarding/task, reboot or physical-device acceptance.

Final migration checkpoint, 2026-09-14 19:54:20 UTC:

- Verification commit e5b314c records the passed hosted growth suite. Runtime remains
  c54f25f; test correction d13c148 is included. Typecheck, repo:check and format:check
  passed again after the final test/doc edits; scoped ESLint passed for both edited
  hosted tests. The last full suite is the exact 3,412-pass/six-skip receipt above.
- All Feature020 helpers are released. Root owns only final documentation commit;
  no pending local build/test process or provider job reconfiguration remains.
- Next independent acceptance: full native Child pairing/task/memory and device reboot,
  physical/two-device checks, external confirmation/recovery email delivery; release
  lane owns its fresh Gradle candidate. Current account approval remains intentional.
- Remaining product/data decisions: optional explicit legacy workspace conversion and
  trusted separate-project message mapping; unsupported badge/reward evidence mappings.
  No old data is guessed, imported, reset or deleted. Missing new product features are
  itemized in the single migration inventory, not described as migrated functionality.
