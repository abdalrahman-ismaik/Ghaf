# Family messaging service — Features 016 and 017

## Authorized backend and Android test session — 2026-09-14

The user authorized backend integration and physical Android testing using Android
Studio. This session may provision/configure a dedicated synthetic team messaging
project and exercise actual Auth, RPCs and device delivery. The adult pilot project
and its credentials remain separate. No paid plan, real Child data or public
production rollout is included. Earlier statements below describe the source-only
handoff; they do not cancel this later authorization.

At the start of this session, the local messaging variables are absent and the
operator browser is awaiting Supabase sign-in. A configured adult pilot does not
establish messaging setup. Record subsequent hosted and physical results against
the exact candidate instead of inheriting local SQL, browser or bundle passes.
Use the updated [setup and acceptance guide](../../specs/016-real-family-messaging/quickstart.md)
for migration order, peer acceptance and the current Auth-client constraint.

The dedicated hosted backend now passes Auth/HTTP acceptance and a scheduled
retention run. Apply [003_idempotent_retry_budget.sql](migrations/003_idempotent_retry_budget.sql)
after001/002 for the narrowly scoped accepted-retry correction. Current results
and remaining native gates are in the [integration record](../../specs/016-real-family-messaging/backend-android-validation.md).

## Feature017 peer extension

Apply [002_peer_threads.sql](migrations/002_peer_threads.sql) once after migration001.
This additive upgrade preserves Parent thread IDs, message history and sequences.
It adds canonical pairs of distinct active Children within the same provisioned
family. Parent explicitly enables a pair after both Children have enrolled devices.
Only the two participants can list, read or send peer messages: Parent permission
management does not grant access to peer content. Either Child can stop the pair;
only a fresh Parent enable resumes it. Retained history follows the existing 30-day
policy and can be read again by participants when Parent resumes the conversation.

New authenticated RPCs are `fm_peer_permissions()`,
`fm_set_peer_permission(p_first_child_id text, p_second_child_id text, p_enabled boolean)`
and `fm_leave_peer_thread(p_thread_id text)`. The first returns canonical pairs with
`firstChildId`, `secondChildId`, `firstName`, `secondName`, nullable `threadId`,
`enabled` and `available` (both Children have active provider-backed enrollment).
The mutations return `{ "ok": true }`; shared safe error envelopes apply.
Thread DTOs add `kind: parent_child | child_child`. Peer `childId` identifies the
other participant. Existing Parent `childId` and Child inventory `threadId` retain
their original meaning. The client reads migration001 Parent DTOs with a default
`parent_child` kind; an unavailable peer RPC disables only the permission panel.

Every peer read/send uses the same live provider/session/device/Parent checks as
Feature016, plus both active Child records and enabled pair membership. The
household transaction lock serializes permission changes, leave and sends.
Permissions allow at most 100 attempts per Parent per hour. No new direct table
grants, AI access, progression authority or real account deployment are introduced.

The isolated SQL runner now applies001, inserts a retained Parent fixture, applies002/003,
checks upgrade preservation and runs original plus peer authorization tests. Hosted
messaging was unconfigured at the Feature017 source handoff; the separately
configured adult pilot is not messaging authority. Local tests cannot pass hosted
Auth, PostgREST, two-device delivery, native or human-review gates.

This boundary contains reviewed source for a dedicated Supabase Auth + PostgreSQL team-test
project. At the 2026-09-13 source handoff, it created no service, logged into no provider and
deployed nothing. Real Auth, PostgREST transport, hosted cleanup and two-installation delivery
were **BLOCKED / NOT RUN**. The new authorized session must produce separate evidence.
Initial content must be synthetic and accounts team-controlled.

The exact RPC names, parameters and camelCase DTOs are in
[service-v1.md](../../specs/016-real-family-messaging/contracts/service-v1.md).
Each public operation returns one JSON object or JSON array. Safe errors return
`{"code":"invalid_invite","message":"invalid_invite"}` with the appropriate HTTP status;
clients must allowlist error identifiers and never display unexpected database messages.
UUID-bearing RPC parameters use SQL `text` with internal parsing so malformed UUID strings also
receive the safe `invalid_request` envelope. The JSON parameter names and UUID success DTOs remain
unchanged. Numeric cursor/limit type errors rejected by PostgREST itself still require the client's
safe unexpected-error handling; never render a raw provider response.

## Operator setup

1. Select a dedicated team-test Supabase project and record its region, operator owners, Auth
   settings and actual backup/PITR retention privately. The current session authorizes dedicated
   synthetic team provisioning; a paid plan or public rollout remains outside that scope.
2. Verify the provider owns `auth.users` and `auth.sessions`, including user `is_anonymous`,
   `deleted_at`, `banned_until`, `email_confirmed_at` and session `id`, `user_id`, `not_after`.
   Do not apply `tests/auth-fixture.sql` to Supabase or another existing database.
3. Review and apply [001_family_messaging.sql](migrations/001_family_messaging.sql) once through
   the project's operator SQL editor. It runs transactionally and deliberately fails if the new
   `fm_private` schema already exists. Do not rerun it as an upgrade or drop existing data to retry.
   Then apply migration002 for approved peer conversations and migration003 for exact
   accepted retries after the send-attempt limit. Only `public` needs
   PostgREST exposure; never expose `fm_private` or grant clients its tables.
4. Enable provider email/password Auth for the Parent and anonymous sign-in for Child installations.
   Disable unused providers. Create/confirm the team Parent through the provider dashboard. Review
   anonymous-signup limits and controls before even controlled external testing. A new anonymous
   Auth identity has no family access until enrollment. A dashboard-created confirmed team account
   does not depend on the adult pilot's SMTP or approval workflow.
   The current messaging client has no CAPTCHA challenge or token input. It cannot authenticate
   against a project that requires CAPTCHA for these requests. Do not disable existing project
   protections to fit this client; record the incompatibility and implement the required challenge
   before using that configuration. An explicitly selected dedicated test configuration without
   CAPTCHA is only a controlled synthetic test setup, not evidence of production abuse prevention.
5. Copy [provision-parent.sql](provision-parent.sql) to the SQL editor. Replace only the placeholder
   provider UUID and synthetic display name with that verified Parent account. Execute as operator;
   no client may write this allowlist. The untouched placeholder intentionally aborts. Never commit
   operator inputs or credentials. Restoration requires explicit operator review: setting the
   restoration input true restores only the Parent allowlist; old devices/Children/invitations
   remain revoked and require fresh Parent sign-in, Child creation and enrollment.
6. Enable Supabase Cron after reviewing it, then run [retention.sql](retention.sql) as the same
   database operator. This installs one named hourly job and performs one initial cleanup.
   Observe a successful later `cron.job_run_details` row. Reads already hide messages at 30 days;
   scheduled physical removal and provider backups require their own hosted evidence.
7. Set only the HTTPS project URL and publishable key in the application's ignored environment:
   `EXPO_PUBLIC_GHAF_MESSAGING_URL`, `EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY`. Provider passwords,
   refresh tokens, database credentials and service-role keys never belong in source or evidence.
8. Verify the project's PostgREST transaction policy is commit with no client rollback override.
   Expected invalid enrollment attempts must commit their counter even though their HTTP response
   is 400. Do not enable `Prefer: tx=rollback` overrides on the live API. Test one invalid enrollment
   followed by an operator counter check and HTTP 400, then verify HTTP 429 after ten attempts.
9. Complete the real two-installation procedure in
   [quickstart.md](../../specs/016-real-family-messaging/quickstart.md), with redacted exact build,
   device/network, actual provider Auth, pagination/retry/revocation and hourly-cleanup evidence.
   The isolated tests below cannot substitute for this procedure.

## Authority and durability

- Provider JWT signature/expiry verification is owned by Supabase/PostgREST. Every RPC additionally
  verifies `auth.uid()`, the JWT `session_id`, the actual undeleted/unbanned user and live unexpired
  session row. The client `role`, metadata, demo identity, nickname and route are never authority.
- Device/session binding, active Parent allowlist and active exact Child relationship are checked
  on every read/send. Parent devices see only their own Parent–Child relationships;
  a Child sees that Parent thread and explicitly approved peer pairs it participates in.
  Only Parents get Child/device inventory; device metadata omits provider identifiers.
  The Parent's provider user must also remain confirmed, non-anonymous, undeleted and unbanned;
  deleting/banning it immediately denies enrolled Children. Provider-user UUID tombstones have no
  Auth foreign key, so actual provider user deletion remains possible without deleting message history.
- Parent registration does not reactivate a revoked session. Revocation is checked even while an
  old JWT is otherwise unexpired. Device tombstones intentionally survive message cleanup.
  Auth user/session share locks and short household transaction locks serialize in-flight operations
  with session deletion/account/device revocation; operations already committed remain history.
- Invitation codes contain 122 random bits from UUIDv4, are returned once, and only their SHA-256
  digest is stored. They expire after ten minutes. Creating a replacement revokes older unused
  codes for that Child. Consumption and device creation are atomic. Same-session retries return
  the original active device; another session cannot reuse the code or change an existing binding.
- Per-thread row locking allocates a positive JS-safe sequence with the insert in the same
  transaction. A rollback consumes no sequence. Household serialization also orders a Parent's
  sender/key receipt across sibling threads. No timestamp or global sequence serves as a cursor.
- A sender/key retry checks requested-thread authorization before looking for the receipt. An
  exact retained body/thread retry that satisfies the current body and age/phrase rules returns
  the immutable original without consuming the send budget. Changed or invalid requests still
  consume an attempt; changing the body/thread yields conflict while budget remains, and an
  exhausted budget returns `rate_limited` before input/conflict errors.
  This guarantee covers only the 30-day history. Expired matching receipts are removed before
  admitting a new operation, even if the hourly job has not yet run. The client separately limits
  uncertain sends to 24 hours and never automatically retries them.
- No message trigger, task foreign key, AI endpoint, media, Seed, reward or garden authority exists.
  Bodies are plain text, 1–500 Unicode code points and not whitespace-only. The server enforces
  the exact Arabic/English human phrase allowlist for ages 6–8. Rendering remains the client's
  responsibility: markup and URLs must stay inert.

## Bounded operations

Counters are fixed windows, transactionally serialized per actor/action. Expected rejected inputs
return safely rather than raising an exception; their increments survive normal PostgREST commit.
Enrollment: 10 attempts per provider user per 10 minutes. Sending: 30 attempts per actual sender
per minute, excluding only exact valid retries of accepted retained messages after migration003.
Rejected inputs and known-key conflicts remain charged. Invitations: 10 per Parent per hour. Child creation: 10
per Parent per hour. New Parent device registration: 10 per Parent per hour; existing active
registration retries return the same device. These bounds do not replace provider signup limits.

The hourly purge deletes messages older than 30 days, expired invitation receipts older than 30
days, and stale rate rows older than one day. Only the database operator can execute it. It does
not purge account/Child/device tombstones or establish backup deletion. Returned pages default to
the latest 30, allow at most 50, and always present ascending sequence. `before` selects the prior
page; `after` selects the next. Both cursors at once or invalid limits are rejected.

## Isolated SQL verification

After obtaining the shared serialized validation slot, run from the repository root:

```bash
workers/ghaf-family-messaging/tests/run.sh
```

For a Windows-mounted checkout under WSL, set `FM_RUN_ROOT` to an isolated Linux
directory such as `/tmp/ghaf-messaging-017`. PostgreSQL requires native directory
permissions; the runner keeps its temporary database and logs under that path.

Requires existing PostgreSQL 16 binaries at `/usr/lib/postgresql/16/bin`, Python 3, Bash and a
non-root user; override only `FM_PG_BIN` if needed. No package install is performed. The script
creates a unique cluster under `output/competition-readiness/family-messaging-017-20260913/backend/`,
listens only on `127.0.0.1:55432`, never connects to existing 5432, caps connections at 12 and stops
its own cluster on exit. An occupied 55432 fails rather than selecting another database. Local
trust authentication exists only in this synthetic ephemeral test cluster. The runner prints the
cluster PID and evidence path; raw data/logs remain ignored local artifacts. Do not publish them.

Tests execute the real migration and RPCs under PostgreSQL roles using an explicitly fake Auth
schema and claims. They cover role/table permissions, safe errors, unknown/mismatched/deleted/
banned/expired sessions, operator allowlisting, sibling/household isolation, enrollment expiry/
reuse/races, persisted rejected-attempt counters, revocation, age policy, Unicode length,
idempotency/conflicts, concurrent commit ordering, rollback, cursor pagination and retention.
Python threads launch at most two SQL clients solely for controlled transaction-race assertions;
they are one bounded test job, not competing test/build pools.

Historical Feature016 local source check on 2026-09-13: **PASSED 29/29 actual PostgreSQL cases in 8.813 seconds**.
Command: `workers/ghaf-family-messaging/tests/run.sh`. Evidence is the ignored local directory
`output/competition-readiness/family-messaging-016-20260913/backend/run-sDsBmrgd/`, including
`tests.log`, `result.txt`, `schema.log` and `lifecycle.log`. Cluster PID 44240 used port 55432 and
was stopped successfully by the runner. Bash syntax and scoped Markdown formatting also passed.
The operator-provisioning placeholder/verification/restoration guards executed against synthetic
Auth rows. The retention script correctly rejected the missing real Cron extension; no hosted
schedule or cleanup run is claimed. Application integration checks belong to the lead's separate lane.

The later [Feature017 validation](../../specs/017-study-family-support/validation.md) records
29 existing plus 12 peer SQL tests, migration-preservation checks and 57 messaging application
tests passing. Those results use synthetic Auth fixtures; they do not pass hosted activation.

## Sources and remaining evidence

Provider session deletion can be checked using the actual JWT `session_id` and `auth.sessions`;
session lifetime policies and hosted Auth configuration still need review.
[Supabase sessions](https://supabase.com/docs/guides/auth/sessions).

The migration uses explicit function privileges and a fixed empty search path for security-definer
entry points. [Supabase database functions](https://supabase.com/docs/guides/database/functions).

Returning a custom HTTP status does not itself abort the database transaction. This distinction
is necessary for enrollment rate counters; actual hosted HTTP behavior remains unobserved.
[PostgREST transactions](https://docs.postgrest.org/en/stable/references/transactions.html).

Supabase recommends CAPTCHA for anonymous sign-ins and documents a configurable per-IP signup
limit. Its CAPTCHA integration requires a client challenge and token, which this messaging client
does not implement. Keep this constraint visible when selecting the controlled test configuration.
[Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous),
[CAPTCHA integration](https://supabase.com/docs/guides/auth/auth-captcha).

No E2EE, production readiness, safeguarding/compliance, backup erasure, native credential storage,
Android behavior or real human-message delivery is established by source or isolated SQL tests.
