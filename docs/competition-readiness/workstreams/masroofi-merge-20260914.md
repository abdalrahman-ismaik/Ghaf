# Masroofi incoming merge — 2026-09-14

The user requested: “Resolve the merge conflicts by adding the masroofi one to the new incoming
change (don't delete anything before asking)”. Local HEAD was `67adf41`; incoming MERGE_HEAD
was `0761c707f9ab301277966cbf6120089c7211ea4d`. This record covers integration, not a new
product contract, native release or publication.

## Preserved scope

Masroofi's eight spending categories, UAE card artwork, private fixed task reward, guarded
Parent/Child views and single simulation notice remain. Incoming adult account/planning,
study/practices, messaging, configured age, corruption recovery and motion changes remain.
Both `017-masroofi-demo` and `017-study-family-support` packages retain their original paths.
The specification index now links each separately, plus the incoming adult account packages.

Parent Family and Child Today expose both Study and Masroofi alongside messaging. The Child
file arrived marker-free but still unmerged, with imports for both entries and neither entry
rendered; integration restored the two buttons without replacing its existing resolution.
The bilingual resource namespaces and service registry include both branches' additions.

The incoming shared `resetClearedPrototype` function remains authoritative. Adding Masroofi
there preserves its reset behavior during ordinary Parent reset and extends it to the incoming
confirmed-recovery and pilot-sample teardown paths. Initial state and successful verified
family replacement also retain their empty Masroofi initialization. Real adult workspace data
remains separate from the synthetic store. Route inventories cover the combined 44 routes.

## File boundary and preservation evidence

The 15 originally unmerged files were:

- `app/child/index.tsx`, `app/parent/family/index.tsx`
- `src/i18n/resources.ts`, `src/services/index.ts`, `src/state/usePrototypeStore.ts`
- `docs/PRODUCT.md`, `docs/product/PROTOTYPE_LIMITATIONS.md`
- `docs/competition-readiness/DEMO_RUNBOOK.md`, `docs/competition-readiness/TEAM_OWNERSHIP.md`
- `specs/003-family-growth-garden/{spec,plan,tasks}.md`
- `tests/integration/operator-demo-flow.test.ts`
- `tests/platform/r003-first-run-experience.test.ts`
- `tests/presentation/r002a-child-task-presentation.test.ts`

Additional reserved changes are this report, the append-only assistance ledger entry,
`specs/README.md` and additive tests in `tests/access/{pilot-demo-lifecycle,corrupt-local-family-recovery}.test.ts`.
Root performed all writes; the existing domain and UI helpers performed bounded read-only
reviews. No helper ran a build or modified files.

Before editing, root backed up every conflicted worktree file and all three Git merge stages
under ignored `output/masroofi/merge-2026-09-14T16-26-52-284Z/`. Its manifest captures the initial
status, refs and root lockfile hash. Both sides' complete conflicting documentation blocks were
verified retained. The five conflicted runtime files have only additions against incoming.
No file deletion, data reset, dependency cleanup, native build, push or deployment was performed.

The pre-existing unstaged `package-lock.json` edit is excluded. Its SHA-256 remains
`c2e120cff7e1ae458eb0864fb3bf172025ace5a562798f0df79dc5e1a720ad6d`.
Incoming account dependencies were missing locally; the initial typecheck failed on their imports.
An offline install was unavailable. The two missing packages were installed with scripts disabled
in a fresh ignored validation folder and linked only at absent node_modules paths. All installed
package versions match the incoming staged lockfile. Existing dependencies and the root lockfile
were preserved; the validation folder and backups remain available.

## Validation

New isolated tests exercise preservation without recovery confirmation, clearing after confirmed
recovery, and clearing private card funds before another pilot sample starts. These tests operate
on synthetic memory storage, not existing user data.

- PASSED: `npm run typecheck` after the missing incoming dependencies were made available.
- PASSED: focused Masroofi, pilot, recovery and route checks — 8 files / 236 tests.
- PASSED: `npm run lint` and `npm run format:check`.
- Initial full run: 3,093 passed, 2 skipped, 1 Expo configuration check exceeded its existing
  15-second timeout. The unchanged platform file then passed alone — 17 tests in 4.59 seconds.
- PASSED: `npm test -- --maxWorkers=2` — 204 files / 3,094 tests passed; 2 opt-in integration
  files/tests skipped (local adult account and hosted messaging). Duration: 106.33 seconds.
  Assertions and timeouts were unchanged.
- PASSED: `npm run repo:check` — 5 checker tests plus repository navigation/artifact checks.
- PASSED: conflict-marker inspection, complete preservation of both documentation blocks,
  runtime addition-only comparison against incoming, and unchanged root lockfile hash.

Physical Android, fresh browser rehearsal and named Arabic/UAE review are NOT RUN for this merge.
Prior feature evidence remains historical; it is not transferred to this candidate.

The boundary is ready for local integration. All 15 conflicts are resolved and staged; the
pre-existing unstaged lockfile edit remains untouched. Automatic approval review rejected the
local merge commit because it requires explicit commit authorization beyond conflict resolution.
The merge remains in progress with zero unmerged index entries, awaiting that separate approval.
No commit, push, release activation or device acceptance is implied. Backup and isolated
dependency files are retained.
