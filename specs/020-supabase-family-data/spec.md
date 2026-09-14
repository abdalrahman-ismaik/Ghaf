# Feature 020 — Fresh Supabase family accounts

Authority: the owner's current explicit request for complete migration of implemented
account/family data to Supabase, fresh real accounts, secure Child pairing, persistence,
family sharing and isolation. This supersedes Feature018's planning-only boundary for
this implementation. Historical demo approvals remain applicable only to explicit demo.

## Product and data contract

- Reuse installed Expo 57 / React Native 0.86 / Supabase JS 2.116, existing adult
  Auth verification/recovery and secure native sessions. No new auth provider.
- New real families have only their actual founding Parent membership. No demo
  people, default family name, assigned catalog tasks, completed history or earned
  totals. Catalog, source material, brand assets and learning packages are reference
  content. Starting Seeds, canopy and personal landscape progress are zero.
- Supabase is authoritative for real family memberships, managed Child profiles,
  activities/assignments, task lifecycle and recognition, memories, study/goals/prizes,
  saved templates, connections, permanent growth/learning evidence and private reward
  records. Preserve existing account profile/preferences and legacy planning records.
- Existing local/demo records are never automatically uploaded. Existing proven
  account-owned planning records remain accessible and may be explicitly imported
  with idempotent ownership-checked mapping; historical completion does not create
  retroactive Seeds or recognition. Ambiguous local records remain separate.
- Parent is an authenticated adult membership. Managed Child profile is a separate
  UUID. A separately paired Child device uses its own Supabase anonymous Auth identity,
  bound by an expiring single-use high-entropy Parent-issued token to one Child via a
  trusted RPC; it never receives a Parent session. Revocation is server-enforced.
  Anonymous identity alone confers no family access. No invented Child email/password.
- Family creation/joining, assigning to an in-family Child, Parent confirmation,
  permanent recognition, memory uniqueness and reward approval use authorized atomic
  commands with idempotency keys. No client-written earned totals or entitlements.
- Preserve category/privacy, allowed-help, fixed awards, recognition-only/maintenance
  zero-growth and private reward rules. Do not reinterpret legacy planning checkboxes
  as Child evidence. Study goals/prizes create no Seeds/League/Family Reward credit.
- Read/mutation/loading/conflict/offline states are explicit. Failed requests never
  become empty accounts or mock successes. Clear private runtime and subscriptions on
  identity changes; ignore late results. No offline write queue is introduced.
- Realtime is a refresh signal with RLS, followed by authoritative re-fetch, including
  reconnect/foreground and membership revocation. Durable state lives in Postgres.
- Current implemented memory/media scope is text plus bundled reference assets;
  ephemeral recordings stay ephemeral. Do not invent permanent uploads or retain
  transcripts/location history. Existing separate real messaging records are preserved
  and require an explicit trusted identity mapping before any cross-project import.
- Missing calendar, allowance, location and calls are feature gaps, not tables to
  fabricate for a migration. Demo entitlements are never real subscription authority.

## Acceptance and deployment

Use isolated synthetic users. Exercise fresh A/Family A, writes/readback, restart and
second client, fresh B/Family B isolation, paired Child restrictions, same-family
sharing, stale response/signout, duplicate retries, revoked membership and direct
restricted-client attacks. Verify denied writes leave target records unchanged.
Version-controlled additive migrations, RLS/grants/indexes and local database checks
precede any hosted update. Inspect the existing project identity and schema first.
No remote reset, private-row inspection, destructive cleanup or production seed.
Record exact local/hosted/browser/native evidence and incomplete domains in the
migration inventory; a fresh-looking screen is not migration completion.
