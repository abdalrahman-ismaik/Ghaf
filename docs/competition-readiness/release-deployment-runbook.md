# Release deployment and continuation

Date:2026-09-14. **Public release blocked.** This runbook does not authorize
skipping the [eight release gates](release-readiness.md#eight-release-gates).
Feature020 owns the [backend implementation/deployment guide](../backend/family-data.md);
use it for exact feature commands and record any later migration there.

## Verified environment

- Main authoritative project: `bqcfynlbxevqlzbkimhy`, `ghaf-parent-pilot`, main
  PRODUCTION, Mumbai/`ap-south-1`, Free/Nano. Root inspected the authenticated
  Dashboard and CLI2.117.0 metadata, not private family rows.
- Legacy messaging project: `ijiwkmvjppfallaoahmh`; not interchangeable with main.
  No cross-project import/deletion/identity mapping is implied.
- Root's refreshed migration list matched all19 local/remote versions through
  `20260915001400`. Feature020 reports applying001–014 and00101 after local tests
  and explicit dry runs. Root did not run those production writes.
- Root subsequently deployed015 from `e8c6b3b`: only the existing Help-state
  predicate changed after24+73local SQL checks, repeat application, exact dryrun
  and capture of the prior function's schema-only corrective DDL. Post-deploy
  metadata confirms20versions, intended predicate and unchanged execution grants;
  five ordinary restricted-session hosted Help checks passed. No real data deletion.
- Main project has no Storage buckets or Edge Functions. AI Workers are a separate,
  default-off boundary; absence of a Supabase function does not prove missing AI code.
- Main project has no managed backups on the inspected Free plan. Recovery is a
  release blocker; no private-data export, paid upgrade or restore was attempted.

## Safe backend order

1. Confirm the linked project and current migration list. Review only the proposed
   additive diff and every affected grant, RPC, constraint and client contract.
   Keep fixtures out of migrations. Never treat `db reset` as a production command.
2. Validate the upgrade from the actual deployed versions in isolated local/staging
   PostgreSQL, including restricted Auth clients, existing records and rollback of
   test fixtures. Use the existing backend CI/local verifier; do not run adversarial
   or load suites against production.
3. Before risky changes, establish a protected recovery copy, authorized recipient,
   retention and restore procedure. Prove database recovery in a disposable target.
   If Storage is introduced, inventory/copy/restore object bytes independently;
   database metadata is insufficient. No recovery proof currently exists.
4. Review `db push --linked --dry-run` against the confirmed main project. Apply only
   validated compatible changes with their owner; retain exact versions and commit.
   Do not push a broad auth config that overwrites undeclared deployed settings.
5. Deploy required server functions/Workers and secret bindings only after their
   contracts/tests pass. Supply secrets through provider secret storage, never public
   Expo variables or committed files. Missing distributed replay/budget storage
   keeps live AI blocked; deterministic demonstrations stay labeled.
6. Confirm auth/email configuration separately. Existing confirmation/recovery use
   one-time codes with one-hour expiry. One QA signup confirmation reached the
   exact Gmail plus-alias inbox on September15 at00:35Dubai; OTP/native signup and
   recovery remain unverified. Reconcile pilot approval/copy before public signup.
7. Check the one active retention job `ghaf-main-family-message-retention-v1`, hourly
   `0 * * * *`. Inspect its scheduled outcome; configuration alone is not proof of
   execution. Do not add a duplicate job or manually purge real data for a test.
8. Run ordinary controlled-QA smoke journeys with restricted sessions, inspect
   sanitized results and verify old supported clients still work. Mobile rollback
   does not undo a database migration; prefer compatible corrective migrations.

Read-only commands used in this lane:

```powershell
npx.cmd --yes supabase@2.117.0 migration list --linked
npx.cmd --yes supabase@2.117.0 db query --linked --project-ref bqcfynlbxevqlzbkimhy --file PATH_TO_REVIEWED_METADATA_SQL --output json
```

Metadata SQL starts a read-only transaction with a bounded timeout. Do not replace
it with unrestricted table dumps, query-text logs or credential-bearing CLI output.

## Internal Android candidate

The existing [workflow](../../.github/workflows/android-internal.yml) performs
repository checks, verifier tests, typecheck, lint, format and all application tests
before Gradle. It pins Java17, target/build-tools36, NDK27.1.12297006 and CMake3.30.5,
then performs a fresh Expo prebuild and arm64-v8a/x86_64 release-mode assembly.

Current candidate ref: `release/021-internal-20260914` at `4dd6490`.
Fresh b2 run34891473556 completed successfully and its exact APK passed local
artifact checks, a normal update of the paired Child session, a clean app-data
profile and the native Child/Parent/persistence journey recorded in
[QA](release-qa-results.md). Its font1.5 Arabic word break led to the bounded
responsive-column correction4dd6490. Run34896135774 has passed source checks and
is building that later source; its native acceptance remains pending.

On a successful run, download its artifact into a new owned output directory:

```powershell
gh run download SUCCESSFUL_RUN_ID --repo abdalrahman-ismaik/Ghaf --name ghaf-internal-apk --dir .\output\release-021-candidate
Get-FileHash -LiteralPath '.\output\release-021-candidate\ghaf-internal-SOURCE_PREFIX.apk' -Algorithm SHA256
```

Match hash, commit, package/version, flags and signature to the receipt; validate
merged permission removal, embedded JavaScript, cleartext/backup/debug settings and
16KiB alignment. Alignment alone is not complete native-library compatibility.

Coordinate emulator ownership before installation. Preserve installed data and
signer; never uninstall or clear data to bypass an update mismatch. A fresh QA
Android user may isolate a clean account from existing real sessions. Execute
clean/upgrade, real auth/core journey, restart, identity switch, reduced motion,
Back/keyboard and independent-client checks with no Metro dependency.

Internal template signing is intentionally unchanged. No production upload key,
Play App Signing identity or signed AAB is verified. Increasing a version or
creating another key cannot substitute for establishing the existing store identity.

## Publication and operations

Current Google login reaches developer registration, not an existing app/track.
No Console upload, testing availability, review submission or public listing was
performed. The [English/Arabic listing](release-store-listing.md) remains a draft;
approved logo provenance does not approve historical screenshots as current ones.

The owner must establish legal operator/contact, authorized Play developer/app
identity, signing and any account eligibility requirements. No purchase, legal
agreement, identity submission, price or real charge is authorized by this runbook.
When those exist and all gates pass, use the existing authorized testing track,
inspect validation/pre-launch findings, verify a store-distributed install, then
submit/publish using the Console's actual controls. Record exact version/track/
geography and state; upload, review and live availability are distinct.

Operational ownership is **unassigned**, not silently attributed to an engineer.
No crash-monitoring endpoint, alert recipient or controlled received test event is
verified. Before release, assign accountable owners and prove:

- sanitized crash/ANR/auth/backend error reception with release identification;
- email delivery, task/message synchronization and retention execution checks;
- quota, storage, AI usage/cost and subscription reconciliation where activated;
- support/abuse/deletion processing with identity checks and shared-family safeguards;
- protected database/media restoration and a compatible corrective release.

To diagnose a failed core journey, capture package/build/project, request outcome,
role/state and correlation ID without message bodies, Child data or tokens. Check
auth/session, membership, RPC authorization/validation and confirmed readback in
that order. A failed optional AI service must fail honestly without mutating task
completion or returning a mock provider success. Do not weaken authorization or
enable debug endpoints as an incident workaround.

No background monitoring is promised. Resume from the ledger's exact next action
and record new evidence before advancing its statuses.
