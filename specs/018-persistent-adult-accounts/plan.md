# Implementation plan

## Primary workspace stability continuation

Follow the [2026-09-14 amendment](stability-and-primary-workspace.md): repair missing-file
launchers, promote the existing authenticated workspace into primary daily navigation, simplify
real family/task creation, and reconcile language selection without losing drafts. Preserve
account ownership/revisions, private teardown and the explicit sample. Root owns integration and
one validation lane; bounded writers own workspace UI and startup scripts. No schema expansion
or synthetic-store hydration is needed for these existing records.

## Backend readiness continuation

The 2026-09-14 maintenance/publication request extends execution in this order:

1. Inventory local and both hosted schemas without reading private records. Keep
   adult and messaging migration/Auth settings separate.
2. Add the provider-account-status predicate guard and regression tests. Reproduce
   the missing denial against the current local schema before applying the fix.
3. Apply additive migrations locally without reset; run all pgTAP and independent
   real Auth/data tests. Add pinned isolated backend CI and a safe local verifier.
4. Compare the hosted adult baseline before reconciling manually applied migration
   history, then apply only reviewed pending additive migrations. Verify hosted
   definitions/permissions and the existing messaging retention job separately.
5. Retest native account retrieval against the retained local stack, reconcile
   spec tasks with implementation evidence, then commit coherent slices and push
   main. Keep unverified human/device/production gates explicit.

The installed native clients still use loopback Supabase, so Docker remains needed.
Feature 014's deferred incompatible recovery draft is handled separately from
these already accepted account/backend requirements.

## Original implementation plan

Native acceptance follow-up (2026-09-14): the fresh hosted APK recording exposes
a 104 px auth-ready inset/header shift when the phase key remounts the entire
access shell. Preserve the shell, safe-area view, background and header across
phase changes; retain keyed inner forms/account content to clear credentials and
private drafts. Reset scroll immediately on phase changes and give the visible
pilot dark status-bar icons. Add lifecycle/privacy regression tests, then rebuild
and re-record real sign-in/logout before the final APK handoff. This changes no
authentication operation, provider policy, navigation model or saved-data contract.

Extend the existing account service/controller and account panel. Keep one Supabase
client/session, stable provider UUID, existing guarded SecureStore adapter and
provider refresh lock. No dependency or architecture migration.

Add `account_profiles` and own-row authorization. Narrow authenticated RPCs derive
the owner from `auth.uid()`: get-or-create inserts only when absent; save compares
an expected revision and increments it atomically. Retain administrator approval.
SQL and pgTAP tests are additive and local-first. No hosted migration is applied
without explicit deployment authorization.

The service validates DTOs and account generation; the controller owns loading,
refresh, save and error/conflict state. The existing account panel edits display
name/language and distinguishes cloud profile from the local synthetic sample.
Unsubmitted drafts are not silently replaced by foreground refresh; conflicts
require an explicit reload. Logout/account change invalidate profile work/cache and
independent private messaging access.

Root serializes build/database/runtime jobs and owns native tests, integration,
messaging teardown and documentation. Separate bounded writers own account service/
SQL tests and account UI/controller tests. Preserve existing motion changes.

Expanded user-selected scope: add a private `account_workspaces` row with a stable
server UUID, typed family/member/task/study records and atomic command RPCs. Use an
independent account workspace controller at the existing ready/account boundary.
Do not hydrate the synthetic Zustand store: its private access controllers,
assignment history, recognition/reward evidence and reset behavior cannot safely
be reconstructed from an arbitrary cloud JSON snapshot. The real workspace is
Parent-managed planning; the existing sample progression remains explicitly local.
Keep local device records separate with no automatic migration. All edits report
server success, conflicts preserve draft input, and refresh fetches saved changes.

Evidence: ignored `.expo/persistent-accounts-20260914/` and a tracked validation
record. Local Supabase needs the existing Docker Linux engine; it is initially
stopped. Hosted public configuration exists, but new profile schema is not deployed.

Same-emulator continuation: use an isolated local test application ID
`ae.ac.ku.ghaf.accounttest2`, launcher label `Ghaf Test 2`, scheme `ghaf-test2`.
The original package stays installed with unchanged data. The available verified
test-only native container may be used only after checking manifest/provider/
resource identifier coupling and exact unchanged code payloads. A normal Gradle
variant remains the preferred reproducible build once native tooling is available;
do not claim this bounded packaging is a fresh release build. All evidence goes in
ignored `.expo/dual-account-clients-20260914/` and the tracked validation addendum.
