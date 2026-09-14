# Supabase account-data migration inventory

Authority: current owner migration request and
[Feature 020](../../specs/020-supabase-family-data/spec.md); starting source `e48e8e2`.
This checkpoint records the integrated code and evidence available on 2026-09-14.
Root owns final deployment and verification updates. It does not mark all family
features complete or inherit native acceptance from an earlier build.

The configured hosted pilot project is `bqcfynlbxevqlzbkimhy`, labelled
**main / Production** in Supabase. Tests use isolated synthetic identities in
that project; this is not a separate development environment. The owner's standing
authorization covers reviewed additive maintenance. Existing private rows were
not reset or automatically imported.

The real application now reaches authenticated Family, Tasks, Garden, Study,
Messages and settings through `RealFamilySession` → `CloudFamilyBoundary`.
Supabase commands derive family/Child authority; no synthetic store is uploaded.
New family creation stores only the explicit Parent/name, then starts all private
collections and earned totals empty. The 25 catalog references are not assignments.

| Domain                             | Current source/read/write                                                                     | Ownership and fresh state                                                      | Implementation / remaining work                                                                                                                                                                                    | Verification level                                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Auth/profile/language              | Existing account service/profile RPCs; expected-user identity and pinned bearer added         | Actual Auth UUID; existing account records retained                            | IMPLEMENTED: live session/member checks, separate paired Child sessions, private cleanup; full current release checks pending                                                                                      | Local automated + installed-service hosted test passed; earlier account evidence remains separate                              |
| Family/managed Children            | `app_families`, `app_children`, `app_family_members`; core snapshot/commands; Family/setup UI | Explicit Parent, names and age bands; zero sample people                       | IMPLEMENTED: create/rename/join/Child pairing/revoke; duplicate-safe commands                                                                                                                                      | Local SQL + five-group actual hosted core journey passed                                                                       |
| Catalog                            | `app_task_catalog`; global reference migration; actual catalog UI                             | 24 catalog entries + original P0 reference, no assigned/history seed           | IMPLEMENTED: versioned canonical reference; safe custom wording cannot inherit catalog awards                                                                                                                      | SQL reference and task checks; hosted catalog count/read exercised                                                             |
| Tasks/Seeds/landscapes/canopy      | `app_tasks`, immutable `app_recognitions`; core task UI/service/controller                    | Own Child and Parent projections; totals derive from actual receipts           | IMPLEMENTED: accept/start/help/steps/submit/praise/recognize; idempotent awards; custom/routine extensions await fresh hosted checks                                                                               | Local SQL and frontend checks; hosted GI01 loop/help/retry/second-session restoration passed                                   |
| Memory timeline                    | `app_memories`; eligible Green task save, unique task receipt and deletion tombstone          | Parent mutation, own-Child projection; no initial leaves                       | IMPLEMENTED for text only; no upload or free-form/edit flow added                                                                                                                                                  | Hosted save/second-session restoration passed; deletion rules locally tested                                                   |
| Study/goals/prizes                 | Typed documents; scalar snapshot RPC, command/controller and full Study forms/cards           | Own Child; Parent approval; no school integration or growth awards             | IMPLEMENTED: all criteria, dates, agreement revisions, help/revisit/review and protected prizes                                                                                                                    | Local checks + actual hosted full lifecycle passed; earlier read-only/conflict failures fixed by 010/012/013                   |
| Family connections/preferences     | Typed documents and Family settings                                                           | Parent-only optional names, no contacts; explicit preference opt-out           | IMPLEMENTED: revision-safe save and prepared rationale from saved allowlisted preferences                                                                                                                          | Local checks + hosted independent readback and Parent/Child authorization passed                                               |
| Saved templates/custom tasks       | Document wording library and reviewed custom-task definitions                                 | Parent/family, no initial templates                                            | IMPLEMENTED: save/edit/reuse/deduplication/retirement; private zero-award custom actions; guard 011                                                                                                                | Hosted template write/edit/deduplication/readback passed; custom task UI/guard locally tested                                  |
| Learning/Impact Path/badges        | Learning document + recognition evidence + permanent `app_badge_awards`; Growth/Learning UI   | Child-private; Parent read-only; zero initial completion/badges                | PARTIAL: finite accessible/story completion and evidence-derived path/badges implemented; unmapped badge criteria stay locked; human/source/native content acceptance outstanding                                  | Local SQL/frontend + actual hosted learning/growth lifecycle passed; human/source acceptance remains separate                  |
| League/Family Rewards              | `app_league_*`, `app_reward_versions`; growth RPC/UI                                          | Actual private family, no seeded nominees/promises; current week Asia/Dubai    | IMPLEMENTED current private-family rules: explicit five-Leaf nomination, separate score, prospective private promises/reauth; only approved eligible task versions count; broader historical cousin mapping absent | Local SQL/frontend + hosted rewards/League lifecycle and independent restoration passed                                        |
| Main-account human messages        | Main project message RPCs, tables and Messages tab                                            | Actual participants; exact Parent-approved sibling pairs                       | IMPLEMENTED: persisted text/order/retry/read cursors, disable/leave, retention filtering; hourly job configured                                                                                                    | Actual hosted Parent/Child/peer exchange and negative checks passed; scheduled purge execution passed; hourly cadence restored |
| Legacy Feature 016 messages        | Original separate project/service preserved                                                   | Existing independent Auth/enrollment identities                                | PARTIAL integration: retained intact, no cross-project identity mapping/import; new main messages are distinct                                                                                                     | Historical separate hosted evidence only for those records                                                                     |
| Legacy adult planning              | `account_workspaces`; existing load/update RPC and Parent legacy-plans panel                  | Adult-owned; records retained, no automatic conversion                         | PARTIAL migration: access preserved; explicit idempotent conversion to managed-Child records not implemented; old completion never awards Seeds                                                                    | Prior workspace hosted evidence; recent focused service/controller checks; conversion not run                                  |
| AI drafts/grants/media             | Prepared personalization and existing bounded gateway/adapters remain separate                | Task-bounded, transient; no transcript/conversation import                     | No AI storage migration needed; reviewed drafts may become explicit tasks; live provider activation remains separate and unverified                                                                                | Code inspected; no live-AI claim from database tests                                                                           |
| Onboarding/audio/device preference | Existing local repositories                                                                   | Device settings, not role authority                                            | Retained device-local; real Auth session storage remains secured/project-scoped; no imported demo sessions                                                                                                         | Existing Feature 019 checks; current native audio/device acceptance not inherited                                              |
| Avatars/photos/attachments         | Bundled approved assets and text memories                                                     | Reference content; no uploaded private media                                   | NOT LOCATED after source inventory: existing persistent user-upload flow; no fictitious bucket/migration created                                                                                                   | Code inspected; no upload verification                                                                                         |
| Calendar/allowance/location/calls  | No implemented domain/device/provider flow found in this checkout                             | No data model to migrate                                                       | MISSING features, not missing migration tables; optional historical external objects were not imported                                                                                                             | Documented source search; no runtime integration claim                                                                         |
| Billing/capacity                   | Database insert guard 007 and UI Free capacity                                                | Two Free Child profiles; existing rows preserved, zero imported Plus authority | PARTIAL: enforced Free capacity; paid purchases/receipt verification/plan entitlements missing                                                                                                                     | Local capacity tests passed; no live billing evidence                                                                          |

## Executed evidence

Results below are coordinator execution receipts, with PASS report files inspected
for the document, messaging and Realtime suites. Times without a Z suffix are 2026-09-14 Dubai time.
No credential-bearing fixture file is reproduced in tracked documentation.

| Environment / command                                                     | Result                                                          | Scope and evidence                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local Supabase CLI 2.117.0 / PostgreSQL 17; loopback pgTAP runner         | **647 checks passed across 17 suites**                          | 624 checks in the complete 16-suite run, followed by the separate retention 014 suite's 23 checks; includes read-only auth, content guard, 127-record scalar document read, business conflicts and actual local purge                                                                                                                                                                        |
| npm run typecheck; npm run lint                                           | **PASSED**                                                      | Coordinator's current full checks; no lint suppression substituted for lifecycle fixes                                                                                                                                                                                                                                                                                                       |
| Latest `npm test -- --maxWorkers=2`                                       | **3,412 passed, 6 skipped; 240 files**                          | 23:39:00, 73.71 seconds; 234 passed files, six opt-in skips. Gateway fixture now supplies its required replay store, preserving the original unauthorized/no-provider-call assertions. The subsequently added hosted growth file was checked separately below.                                                                                                                               |
| Earlier full npm test -- --maxWorkers=2                                   | **3,405 passed, 5 skipped; 239 files**                          | Historical coordinator full-run receipt at 23:15:40; superseded by the newer batch above. Skipped suites are not passes.                                                                                                                                                                                                                                                                     |
| Earlier focused frontend/controller batch                                 | **110 passed**                                                  | Controlled-provider/component evidence only; full suite above supersedes the earlier narrow count                                                                                                                                                                                                                                                                                            |
| node scripts/backend/verify-family-http.mjs                               | **5 hosted groups passed**                                      | Actual A/A2/B/anonymous Child Auth+RPC: fresh state, pairing, isolation, task/help/praise/recognition/memory, duplicate retry, sign-in restoration and revocation. Report result.json under the approved ignored invocation, finished 18:44:31.802Z                                                                                                                                          |
| tests/access/family-service-hosted.integration.test.ts, explicit opt-in   | **1 hosted test passed**                                        | Actual installed SupabaseParentAccountService, independent restoration and verified A-bearer/B-switch denial; sdk-service-3f7eb8cc-1696-4306-a647-ec7a79c493c7.json                                                                                                                                                                                                                          |
| tests/access/family-documents-hosted.integration.test.ts, explicit opt-in | **PASSED against hosted service**                               | Full plan lifecycle, all three goal criteria, both proposal roles, exact agreement/date immutability, below-target retry, Parent-only prizes, preferences/connections/templates and unchanged cross-family targets; documents-hosted-c0132845-0d7d-4782-be58-cef1575d4b17.json, finished 19:14:00.677Z                                                                                       |
| tests/access/family-messaging-hosted.integration.test.ts, explicit opt-in | **PASSED against hosted service**                               | Real independent Parent/Child messages, order/retry/read cursors, newly paired-session restoration, exact guardian-enabled sibling participants, nonparticipant/foreign denial, disable/leave enforcement; messaging-hosted-802d70fe-1809-40f8-8073-292c92db1fb7.json, finished 19:14:16.603Z                                                                                                |
| Combined hosted document + messaging invocation                           | **2 tests passed in 37.23 seconds**                             | Coordinator invocation at 23:13:39; actual SDK/HTTP, no fabricated provider response                                                                                                                                                                                                                                                                                                         |
| Current browser journey                                                   | **PASSED for the exercised two-origin flow**                    | Isolated invocation 14222bba-3eb0-4e26-a5e1-df03d6991bad: fresh zero state, explicit Child/assignment, independently paired Child completion, Parent praise/confirmation, 8 Seeds, one canopy contribution and memory. Both sessions restore after reload; Parent switches to fresh Account B while Child retains only Family A data.                                                        |
| Hosted Realtime integration test                                          | **PASSED, 17.46 seconds**                                       | Coordinator invocation 23:25:39; realtime-hosted-bb1c502b-5a3a-428a-a6f4-f351b024aaa1.json finished 19:25:56.780Z. Actual Parent/Child WebSocket UPDATE, authoritative readback, disconnect/reconnect, revoked Child denial and observed foreign subscription isolation; no mobile-background or physical-device claim.                                                                      |
| Hosted growth/learning/reward lifecycle                                   | **PASSED, 47.39 seconds**                                       | `family-growth-hosted.integration.test.ts`, 23:49:30; 133 normal authorized commands, 16 immutable task receipts, Child A 132 Seeds/Child B 60, five nominated Leaves each with shared rank/100 cap, prospective promise unlock/given, accessible learning replay/zero-award and independent restoration. `growth-hosted-b1c9c71d-2b31-45ef-a7a1-eef3b4cdd192.json`, finished 19:50:17.434Z. |
| Metro/Hermes and internal APK emulator checks                             | **PASSED for bundle/package/install and exercised Parent flow** | Current c54f25f bundle: 93.36 seconds, 2,935 modules; native payloads preserved. On emulator-5554, synthetic browser Parent A signs in, restores its family/Child/8 Seeds/one canopy contribution, and retains session/data after force-stop/cold restart. Garden-to-Family Back and keyboard dismissal exercised; full native Child journey and physical devices remain unverified.         |
| Current full Gradle build / physical-device journey                       | **BLOCKED / NOT RUN**                                           | Full builder preflight requires 20 GB, but C: has 5.68 GiB free. A separate release lane is running a remote fresh Gradle build; no pass is inherited here. Internal rebundle does not satisfy a current native build, release signer/store or physical-device check.                                                                                                                        |

The hosted report names above are under the ignored directory
.expo/family-verification/4d2450ee-924c-4666-8369-ba9fb84ef1b3/. Only report IDs and
results are recorded here; Auth, family, Child, message and cleanup identifiers and
fixture credentials remain in their isolated local artifacts.

Root has now deployed the reviewed family migrations 001 through 014, including
00101 reference data, after local tests and dry runs. The Auth configuration push
changed only anonymous sign-ins to enabled. No existing family/demo data was
automatically imported or reset. Migration 014 separately enabled the available
pg_cron extension and configured its exact named hourly retention job.

The explicitly internal emulator candidate is
`.expo/family-native-prep/family-candidate-1/ghaf-family-REBUNDLE-INTERNAL-TEST-ONLY.apk`,
SHA-256 `ce51f8487dd05d3a098eb9656f9626d8c395b146c4fc8c7fb3644742be08635b`.
Root built the Metro/Hermes JavaScript at runtime source `c54f25f` in 93.36 seconds
(2,935 modules), then preserved 1,626 nonbundle payloads, matched all 97 assets,
and verified the same 85 keep-XML references with order-only differences.
`adb -s emulator-5554 install -r -t` preserved app data; a cold launch and native
UI XML showed Arabic real-account sign-in without Salem/Alya or demo-family content.
The synthetic browser Parent subsequently signed in on this native package and
restored its same family, Child, 8 Seeds and one canopy contribution. Force-stop
and cold restart retained the session and values; Android Back returned Garden to
Family. This is not a new Gradle/release build, complete native Child pairing/task
journey, device reboot or physical-device check. Native payloads are reused intentionally.

To repeat the current SQL selection with the installed ignored local runner tools:

    $familySqlTests = @(rg --files supabase/tests/database)
    node scripts/backend/test-family-local.mjs @familySqlTests

This selects the current 17 files; the recorded 647 total came from the 16-suite
batch plus the separate 23-check retention run, not one invented combined run.

## Resolved provider defects

- Migration 010 fixed SQLSTATE 25006 from row-locking authorization in PostgREST
  read-only transactions without weakening identity/membership checks.
- Migration 012 added the scalar JSON family-document snapshot and strict count/
  actor/family validation. The application no longer restores from a possibly
  truncated SETOF result. The local regression returned all 127 permitted records
  with the API row limit unchanged; hosted document behavior subsequently passed.
- Migration 013 replaced deliberate document business-conflict SQLSTATE 40001 with
  PT409 / HTTP 409. The hosted duplicate-template check now terminates safely instead
  of being treated as a serialization failure. This follows the
  [official Supabase troubleshooting guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b).
  Earlier failed/RUNNING reports are historical failure evidence, not current passes.

## Setup, limits and next actions

The [backend guide](../backend/family-data.md) records current public configuration,
migration order, identity/ownership, Realtime and retention behavior. Hosted suites
require their explicit GHAF_FAMILY_*_HOSTED_TEST opt-ins, GHAF_FAMILY_TEST_FIXTURES
pointing to the approved ignored invocation, GHAF_TEST_PROJECT_REF selecting the
configured hosted pilot project (Supabase main / Production), and SUPABASE_CLI. They do not target arbitrary users.

1. Browser completion → Parent confirmation → growth → memory and hosted
   Realtime/reconnect verification passed. Continue native acceptance independently;
   browser reload does not prove Android process-death or OS storage behavior.
2. Scheduled retention execution passed at 19:45:00.109294Z. For the bounded
   check only the exact named job used a one-minute cadence; its normal hourly
   cadence was restored in `finally` and checked through the guarded operator RPC.
   Local 23-check deletion coverage and provider backup retention remain distinct.
3. The final full suite and hosted growth/learning/reward lifecycle passed. Continue
   calendar-week rollover, elapsed-time reauthentication expiry and native learning
   acceptance separately; the current-week hosted test does not establish these.
4. Resolve native build disk headroom before a current Gradle build. Continue full
   Auth/family acceptance on the internal emulator candidate, then verify Android
   Back/keyboard/RTL/audio/reduced motion and physical-device behavior separately.
5. Existing legacy account_workspaces remain usable and saved under their proven
   adult identity. Optional conversion into managed-Child tasks would need reviewed
   mapping and no retroactive awards. Preserve separate Feature 016 conversations
   until a trusted cross-project mapping/import is defined and verified.
6. Obtain approved evidence mappings for remaining badge/reward targets and finish
   learning source/human acceptance; unmapped criteria stay locked.
7. Treat missing calendar, allowance, location, calls, media uploads and billing
   as product implementation work, not unused migration tables.

Use the existing [coordination checkpoint](coordination/STATUS-SUPABASE-MIGRATION.md)
for current ownership and subsequent root execution receipts. This is the single
domain migration inventory; code, SQL, hosted, browser and device evidence remain
distinct.
