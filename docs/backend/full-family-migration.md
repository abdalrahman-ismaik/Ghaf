# Full Supabase family runtime

Feature 019 replaces the narrow account planning document with a normalized family runtime.
The app uses the existing adult project, `bqcfynlbxevqlzbkimhy`. The separately authenticated
messaging project, `ijiwkmvjppfallaoahmh`, keeps its existing schema and identities.

## Schema and authority

The additive migrations are:

- `20260914182327_normalized_family_runtime.sql`: family/guardian/Child profiles, preferences,
  relatives, permissions/consent, reference catalogs, immutable task versions/steps, assignments,
  attempts/check-ins, adjustments/routines, recognition/Seed/garden evidence, reveals, saved
  templates, Child invitations/bindings, command receipts and preserved legacy import records.
- `20260914182411_normalized_family_extensions.sql`: reward plans/versions/contributions,
  Masroofi controls/private promises/ledger, study/help, academic agreements/acceptances/results,
  learning/completions/badges, private circles/invitations/weekly nominations/canopy evidence.

These tables live in `ghaf_private`, with RLS enabled and direct client access revoked. The three
public invoker RPCs are `ghaf_read`, `ghaf_command` and `ghaf_claim_child`. Their private
implementations resolve current provider-backed identity and family membership, never a caller's
chosen role, nickname, family ID or mutable Auth metadata. Explicit function grants expose only
the narrow API entry points. The app strictly validates returned records and relationships.

`ghaf_command` locks the family, checks the expected revision, and retains a request UUID and
payload fingerprint. An identical retry returns its receipt; reusing a key for another action
fails. Task/reward/goal/card edits also carry the version the user actually reviewed. No screen
optimistically mints Seeds, balances, badges or League score.

Reference categories, safe task templates, learning content and badge definitions are seeded
catalogs. Families, children, assignments, completions, balances, ranks and earned awards are
created only through actual account actions. There are no Salem/Alya opening balances or progress
in the real runtime.

## Workflow

1. A Parent signs in with email and password. Email verification and recovery retain their
   separate code flows; the existing account-approval gate remains enforced.
2. The Family page saves the household, full Child profiles, preferred language and optional
   guardian/relative information. New accounts start empty. An optional transfer imports earlier
   account workspace records, retaining the originals and recording provenance. Old planning
   completion flags do not manufacture approvals, Seeds, money or historical achievements.
3. A Parent creates a task from a server catalog or authored content, reviews its fixed terms,
   then assigns it. Accepted work keeps its original version and award. Changes follow the
   explicit smaller-step/Child acceptance or future routine-review paths.
4. The Parent creates a one-use, expiring invitation. The Child installation uses a separate
   Supabase anonymous Auth session and credential namespace to claim it. The database binds that
   session to one Child. Selecting a profile name grants no access. Parent revocation closes the
   bound session's family API access even if it still has an unexpired token.
5. The Child chooses work, asks for help, checks the task steps and submits an attempt. A Parent
   can request a retry or confirm it with action-focused praise. Praise presentation is saved
   before recognition. One transaction creates the recognition receipt and all eligible
   permanent projections. Duplicate recognition cannot award twice.
6. Eligible 10+ Children can have a Masroofi card. Parents set spending categories, online/frozen
   settings and purchase/daily limits, and lock a private amount to a task version before
   acceptance. The Child response omits unearned amounts. Recognition credits the persisted
   ledger once; the UAE card UI then shows the credited balance. Purchases and funds remain
   explicitly simulated: this is no bank card, money custody or payment integration.
7. Study plans, academic agreements, family promises, learning, private badges and invite-only
   League progress are saved separately. Learning never creates Seeds; extra tasks never improve
   the five-Leaf weekly score. Family promises use eligible contribution provenance and cannot
   retroactively weaken an unlocked promise.
8. Refresh or reopen to read saved records. A lost connection closes unverified access and keeps
   the current in-memory draft. Unknown writes must be checked using the original request before
   another change. A changed saved version requires explicit review before resubmitting a draft.

The synthetic sample remains a separate, explicit secondary experience. It does not supply
fallback data or upload its family into the real account. Prepared educational content remains
honestly labeled. The messaging account is separate; no automatic email/nickname linking is used.

## Applying the hosted migration

September 15 continuation: remote `main` at `35631f7` includes a separately developed Feature 020
family runtime, additional September 15 migrations and hosted evidence. This Feature 019 branch
preserves its verified six-migration baseline. Reconcile the two schema/API designs and inspect
the actual hosted history before applying anything from this branch. Do not overwrite the newer
runtime, repair its migration history to match this branch, or use `--include-all` to bypass the
unresolved ordering. The delivery and integration boundaries are recorded in
[the push continuation](../competition-readiness/workstreams/supabase-family-push-20260915.md).

The source and local PostgreSQL tests are separate from hosted installation. A publishable app
key cannot install this schema. The current work requires an authenticated Supabase CLI or an
administrative MCP connection before hosted application and readback can be completed.

The verified local CLI is at
`output/supabase-migration/tooling/cli-2.117.0/supabase.exe`. Authenticate using its interactive
`login` command; do not paste tokens/passwords into chat, source files or command arguments.
In a normal operator terminal:

```powershell
$ghafCli = '.\output\supabase-migration\tooling\cli-2.117.0\supabase.exe'
& $ghafCli login
& $ghafCli link --project-ref bqcfynlbxevqlzbkimhy
& $ghafCli migration list --linked
& $ghafCli db push --linked --dry-run
```

Inspect history and the dry run: this branch's isolated tests use the four account migrations
through `20260914000300` plus its two normalized migrations. That test baseline does not establish
the current hosted migration history. Resolve the known Feature 020 divergence before writing.
Do not repeat historical migration-history repair, reset the
database, apply this directory to the messaging project, or discard existing data.

After the reviewed additive changes are applied with `db push --linked`, enable anonymous Auth
for Child enrollment in the adult project. This setting is enabled in local `supabase/config.toml`;
changing that file alone does not change hosted Auth. Keep email/password registration and existing
verification/recovery SMTP configuration. Verify empty-account reads, two independent Parent
clients, Child claim/revocation, cross-family denial, duplicate recognition and hidden money over
the actual hosted API. Do not claim email delivery from SQL-only verification.

## Local verification and limits

```powershell
node scripts/backend/verify-cloud-runtime.mjs
npm run typecheck
npm run lint
npm run format:check
npm test -- --maxWorkers=2
```

The SQL runner uses isolated PGlite PostgreSQL 18.3, pgcrypto and pgTAP. It applies every migration,
executes rollback-wrapped suites, checks restricted roles and validates real SQL snapshots using
the app parser. It writes timestamped receipts under ignored `output/supabase-migration/`.
Its small Auth SQL facade does not run GoTrue, verify JWT signatures, send email or establish
hosted/native behavior. Do not use these test identities or facade functions in a hosted project.

Physical Android RTL/keyboard/Back/accessibility, human Arabic/cultural review, live provider
authorization and hosted multi-client persistence require their own evidence. Family readbacks
are bounded snapshots; production-scale pagination and operational retention are future work.

Implementation basis: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[database functions](https://supabase.com/docs/guides/database/functions),
[migrations](https://supabase.com/docs/guides/local-development/database-migrations) and the
[current changelog](https://supabase.com/changelog). Expo configuration extends the
[official default Metro configuration](https://docs.expo.dev/guides/customizing-metro/).
