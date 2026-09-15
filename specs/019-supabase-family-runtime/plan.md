# Implementation plan

Use the existing adult Supabase project and session boundary. The imperative SQL workflow adds
new normalized tables, private privileged implementations and narrowly granted API wrappers. The
server owns actor identity, transitions, idempotency and derived progress. Existing workspace
rows remain untouched as preserved import sources; cutover is recorded separately.

The current synchronous fixture services cannot authorize remote writes. Introduce a typed UUID
cloud contract, async controller and service boundary; reuse existing presentational components
in the full primary family experience. Keep the deterministic store solely for the explicit demo.
Root integrates Parent/Child auth, errors, lifecycle clearing and navigation. Bounded UI writers
consume the shared contract; the SQL writer owns schema/contract; a tooling helper supplies the
pinned CLI and a resource-safe Postgres validation engine. No overlapping writes or heavy jobs.

Order: publish contracts and feature inventory → normalized migration/RLS/transactional commands
and import → real service/controller → full family/task/Child/progression/reward/study/League UI
→ actual SQL and application tests → reviewed hosted application/readback if authenticated →
browser/native evidence where available → explicit remaining gaps and updated documentation.

Use the installed Supabase skill and current official docs. Generate migration names with the
CLI. Test real SQL with rollback-isolated synthetic fixtures, never reset the user's database.
The local machine has under 1 GiB free, so no Docker stack/native build/dependency reinstall is
allocated. Prefer a small isolated Postgres test runtime and existing remote CI where accessible.
