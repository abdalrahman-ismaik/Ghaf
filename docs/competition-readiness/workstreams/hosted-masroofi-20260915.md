# Browser checkout repair and hosted Masroofi

## User requests and scope

The user reported the Arabic family-service failure in a browser started from this project,
asked to work directly on main, then reported the missing Masroofi pages. Root owns final
integration in the original checkout on main. The previous integration worktree and feature
branch remain preserved. Exact writer boundaries are in TEAM_OWNERSHIP.md.

## Reproduced browser cause and local repair

The original checkout was still on feature/019-normalized-supabase-family-runtime at ed14804,
while origin/main and the isolated integration checkout were already at 11eba5e. The running
Expo server on port 8081 used that original older checkout. Its selected normalized family
RPC ghaf_read returned HTTP 404/PGRST202 against the configured adult project. Read-only public
probes of ghaf_family_identity and ghaf_family_snapshot returned HTTP 401/42501: those functions
exist and deny an unauthenticated caller. This does not establish an authenticated family read.

Root preserved exact copies of the user's package-lock.json and skills-lock.json under ignored
output/browser-runtime-repair/preserved, retained the lockfile stash, fast-forwarded original
main to 11eba5e and reapplied the local patch. All twenty local package metadata edits survived;
skills-lock.json and the untracked Supabase skill retained their original SHA-256 hashes.
No source file or user data was removed. The new server runs from original main on the same
port with hosted selection and a refreshed Metro cache. TypeScript passed after the checkout
update; seventy-two account transport/runtime-selection checks passed after Masroofi RPC wiring.

## Missing Masroofi cause and implementation

The prior merge preserved Masroofi in the optional normalized runtime and explicit sample, but
did not put it in Feature020's default saved-family navigation. The additive
[Masroofi contract](../../../specs/020-supabase-family-data/masroofi.md) supplies that missing
integration using the existing hosted family/Child/task/recognition authority. It does not map
Feature019 records, change the active runtime, import samples or create real banking.

The migration is 20260915095557_hosted_family_masroofi.sql, created by the verified Supabase CLI.
It adds six restricted relational tables and two authenticated family RPCs. Recognition posts a
promised reward in the same transaction; frozen cards still receive earned rewards. Requests
are idempotent, promises lock eligible task content, and pending amounts are omitted from Child
responses. Parent actions require password reauthentication. The existing UAE card illustration
is reused, with eight spending categories and a single practice-money notice.

## Verification

- PASSED: strict TypeScript and 153 focused checks across seven files, including the real
  account transport, navigation, parser/controller and Parent/Child presentation contracts.
- PASSED: 130 in-memory pgTAP assertions and five actual SQL-to-TypeScript snapshot contracts.
  These use a minimal Auth facade and rollback-only synthetic families, not GoTrue or hosted data.
- PASSED: intercepted Chromium checks at 390 by 844 for a Parent with a pending promise and
  a Child before and after reward credit. Parent and pending Child pages passed Arabic/English
  switching; no runtime errors, horizontal overflow or calls to the unavailable ghaf_read RPC
  were observed. Child pending reward text contains no amount. Screenshots and exact request
  evidence are under ignored output/browser-runtime-repair. The source fixtures come from the
  successful SQL test, not predefined runtime account data.
- PASSED: Parent spending controls displayed all eight categories without horizontal overflow.
- PASSED: repository-wide TypeScript, lint and maintained-file formatting. Full Vitest results:
  257 files passed, seven opt-in files skipped; 3,936 tests passed and seven skipped.
- PASSED: final migration hash rerun with 130/130 pgTAP assertions and five SQL-to-app contracts
  in masroofi-sql-2026-09-15T10-38-10-597Z.json. Repository checks (five tests), startup checks
  (12 tests), backend verifier safety (eight tests), and git diff whitespace checks passed.

## Delivery

Root committed the guarded backend as 0b2a615 and the bilingual pages/navigation and evidence
as 6d08d12. Both were published successfully to public abdalrahman-ismaik/Ghaf main, advancing
11eba5e to 6d08d12 without a forced update. This publication follows the user's existing explicit
push approval and subsequent request to add the work to main. The original checkout stays on
main; the separate integration checkout, feature branch, retained stash and backups remain.
User-owned package-lock.json, skills-lock.json and the Supabase skill are not in either commit.

Local checks above apply to the published source. GitHub Actions must be assessed on the final
delivery SHA; prior main CI is not evidence for this change. This documentation checkpoint
records source publication and remaining hosted/native gaps, not a hosted deployment.

## Hosted access

The application public configuration successfully reaches the adult Supabase project. No local
CLI administrator token is available. The user stated that Supabase is already connected;
plugin discovery returned Supabase with status DISABLED_BY_ADMIN, installation NOT_AVAILABLE
and installed false in this session. No Supabase SQL/MCP tools are exposed here. This evidence
describes this session's access, not the user's connection status in another workspace.
The final read-only public-key check returned HTTP 404/PGRST202 for
ghaf_family_masroofi with a synthetic UUID, confirming that its hosted function is missing.
Existing family identity/snapshot functions still returned the expected unauthenticated denial.

Hosted schema installation and authenticated read/write remain BLOCKED pending accessible
administrative authority. No hosted reset, SQL application, private-row inspection or Auth
configuration change has been performed in this continuation. In-memory SQL and intercepted
browser evidence must remain separately labeled. Physical Android/human acceptance is NOT RUN.

CLI login is not required when an authorized operator uses the Supabase SQL Editor. Apply only
[the additive migration](../../../supabase/migrations/20260915095557_hosted_family_masroofi.sql)
to adult project bqcfynlbxevqlzbkimhy after confirming its existing Feature020 schema; do not run
the normalized migrations or reset the database. The SQL contains its transaction and schema
reload notification. Confirm authenticated Parent enrollment, Child hidden-promise read,
recognition credit and independent refresh before marking hosted acceptance passed. No server
secret belongs in the app or in a chat message.
