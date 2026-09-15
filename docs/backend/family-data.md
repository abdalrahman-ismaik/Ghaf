# Supabase family data

## Masroofi continuation — September 15

The hosted family menu now includes Masroofi for Parent and paired Child sessions. It reuses
the UAE card artwork and actual Feature020 family/Child/task UUIDs. Parent enables a zero-balance
simulated card with age10+ attestation, sets spending controls, adds practice funds and locks an
eligible task reward. The Child's pending reward response omits its amount; existing Parent
recognition posts the reward once. Child practice purchases use server-fixed item prices.

Migration `20260915095557_hosted_family_masroofi.sql` adds the required relational card, control,
promise and ledger tables plus two guarded RPCs. Its presence in source is not hosted activation.
Until this migration is installed, the tab shows the preserved artwork and an explicit unavailable
state; it invents no balance and makes no mock save. See the [contract](../../specs/020-supabase-family-data/masroofi.md)
and [current installation/verification evidence](../competition-readiness/workstreams/hosted-masroofi-20260915.md).
The separate normalized Feature019 runtime stays opt-in and is not needed for this hosted card.

## Existing family backend

Feature 020 extends the existing approved Supabase account project to real family
records. Its authority is the current owner migration request and
[Feature 020](../../specs/020-supabase-family-data/spec.md). The historical
[Parent pilot guide](parent-pilot.md) still describes the earlier adult-only
boundary; its instructions to disable anonymous sign-in and Realtime do **not**
apply to this family implementation. Current configuration is in
`supabase/config.toml` and `.env.example`.

The implementation uses the installed Expo 57 / React Native 0.86 application,
Supabase JS 2.116 and PostgreSQL 17. It does not introduce another application,
state store, authentication provider, or client-side database of earned balances.

## Identity and fresh accounts

The configured hosted pilot project is `bqcfynlbxevqlzbkimhy`
(`ghaf-parent-pilot`), labelled **main / Production** in Supabase. It is not a
separate development project. Hosted checks use isolated synthetic identities;
additive maintenance follows the owner's standing authorization and does not
reset existing private rows. The project reference is public configuration.
Never apply these migrations to the separate Feature 016 messaging project
`ijiwkmvjppfallaoahmh`.

An approved, confirmed adult Auth identity can create a family with an explicit
family name and Parent display name. A new family has that founding membership,
zero Children, zero assignments, zero recognition/Seeds/landscape/canopy history,
zero memories and no study, reward, League or learning records. The 24 catalog
entries plus original P0 recycling task are global reference content, not assigned
or completed activities. Creating a managed Child requires an explicit name and
age band. Migration 007 enforces the current two-Child Free capacity at the
database boundary; it retains existing profiles and imports no demo entitlement.

A Child device signs in with its **own** Supabase anonymous identity, then redeems
a Parent-issued, ten-minute, single-use token through `ghaf_redeem_family_invite`.
The token is hashed in storage. A bare anonymous identity has no family access;
the backend binds its live Auth session to one actual managed Child. Parent
credentials are never transferred. Parent-issued invitations also support an
already approved adult joining the family. Revocation is checked by the backend,
including when a client retries an old successful request.

`ghaf_family_actor` derives authority from live Auth user/session rows, the
approved founding owner, active membership and active in-family Child. It does
not trust a selected role or supplied family/Child UUID. Mutation RPCs acquire the
family lock and recheck authority before accessing idempotency receipts. Migration
010 preserves those checks in PostgREST read-only transactions without attempting
row locks there; infrastructure failures no longer become empty RLS success.

Migration 012 makes the application read `ghaf_family_document_snapshot`, a single
JSON result with actor, family revision, document count and all authorized rows.
It avoids truncation by the API's table-row limit without increasing that limit;
the client rejects mismatched counts or authority. A local 127-record regression
and the hosted document lifecycle passed. The older SETOF function remains for
internal SQL/explicitly paginated compatibility callers.

Migration 013 changes document business conflicts from `40001` to `PT409`, yielding
HTTP 409 instead of triggering PostgREST serialization retries. The hosted duplicate
template/conflict checks now complete. Supabase documents this failure mode and
the `PT409` remedy in its [official troubleshooting guide](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b).

## Persistent domains and commands

| Domain                                | Authoritative tables / reads                                                                               | Writes and visible flow                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Families, Children, membership        | `app_families`, `app_children`, `app_family_members`; `ghaf_family_identity`, `ghaf_family_snapshot`       | `ghaf_family_command` setup/rename/invite/revoke commands; real Family/setup UI                                                                                        |
| Tasks and recognition                 | `app_task_catalog`, `app_tasks`, immutable `app_recognitions`; family snapshot                             | Parent assignment → Child accept/start/help/steps/submit → Parent praise/recognize; exact request retries award once                                                   |
| Custom wording and routines           | `app_custom_task_templates`, `app_routine_phases`; family snapshot                                         | Reviewed custom tasks have their own mandatory action and are private, recognition-only, zero-award; maintenance review preserves accepted tasks and earned evidence   |
| Memories                              | `app_memories`; family snapshot                                                                            | Parent saves a text memory from eligible confirmed household Green activity; one per task, deletion tombstone prevents recreation by retry; Child sees own projection  |
| Study, goals, prizes                  | Typed `app_family_documents`; `ghaf_family_document_snapshot`                                              | Full plan/help/revisit and joint goal/criteria/date/review/prize commands through `ghaf_family_document_command`; Study tab reuses existing forms/cards                |
| Connections/preferences/templates     | Same typed documents                                                                                       | Parent-only names, optional relatives, explicit Child preferences and bilingual saved wording; Family settings; template reuse populates reviewed custom-task creation |
| Permanent learning                    | `learning` document                                                                                        | Child-owned finite Mangrove story or accessible route, exact ordered steps/check, server 132-Seed unlock; one completion, no Seeds or garden award                     |
| Impact Path, badges, promises, League | Recognition/documents plus `app_badge_awards`, `app_reward_versions`, `app_league_*`; `ghaf_family_growth` | `ghaf_family_growth_command`; actual private progress, prospective Parent promises and explicitly nominated five-Leaf weeks                                            |
| Main-account messages                 | `app_family_message_threads`, `app_family_messages`, `app_family_message_reads`; message RPCs              | Real Messages tab: participant-only Parent–Child text; optional Parent-enabled exact Child pairs; pending/confirmed/retry/read-cursor states                           |

Exact DTOs, privacy rules and command schemas are maintained in the
[core](../../specs/020-supabase-family-data/contracts/core.md),
[documents](../../specs/020-supabase-family-data/contracts/documents.md),
[growth](../../specs/020-supabase-family-data/contracts/growth.md) and
[messaging](../../specs/020-supabase-family-data/contracts/messaging.md) contracts.
These contracts describe code; runtime evidence is tracked separately below.

All application tables have RLS. Clients have no direct mutation grant for these
domains and cannot write awards, authority, timestamps or receipt contents.
Document reads project Parent-only records away from Children and restrict Child
records to the assigned profile. Parent membership does not grant access to another
Parent's private conversation or a Child–Child conversation. Sibling disable/leave
is enforced on reads, sends and retries. Human conversation bodies are not AI input.

Study prizes and Family Rewards are distinct private promises, fulfilled outside
Ghaf. Study never contributes Seeds, League or Family Reward eligibility. Growth
promises preserve `promised → unlocked → given`, prospective evidence and immutable
unlocked terms. Sensitive promise/League/routine actions require a recent signed
password authentication event; client-selected role, token issue time and UI
visibility are insufficient.

## Client integration and refresh

`PilotGate` / `RealFamilySession` mount `CloudFamilyBoundary` for real sessions;
`CloudFamilyView` reaches Tasks, Garden, Study, Messages and Family settings.
`SupabaseParentAccountService.familyRequest(name,args,expectedUserId)` allowlists
RPCs, verifies the caller and pins dispatch to that verified bearer token. Domain
services/controllers validate returned DTOs and clear private state/subscriptions
on identity/session denial. Late results cannot populate a switched account.

Only `app_families` is added to the `supabase_realtime` publication by migration
00100, if that publication exists. Authorized family revision updates trigger a
fresh RPC read; messages, marks, transcripts and private document bodies are not
subscribed payloads. Foreground/manual refresh and reconnect signals also re-fetch.
Postgres remains authoritative if Realtime is unavailable. A failed load is not
an empty account; uncertain writes keep their original request UUID for explicit
retry. There is no offline write queue or automatic fallback to sample records.

## Configure and apply

Use the existing installed CLI **2.117.0**, Node compatible with `package.json`,
and the existing local Docker project. `SUPABASE_CLI` may point to the installed
executable. Local commands do not require a hosted database URL:

```powershell
& $env:SUPABASE_CLI start
& $env:SUPABASE_CLI migration up --local
& $env:SUPABASE_CLI test db
```

Do not reset an existing database to apply these additive migrations. The optional
`scripts/backend/test-family-local.mjs` runner executes explicitly named pgTAP
files against loopback port 54322; it requires the separately installed ignored
`.expo/family-db-tools` tooling. Root used that runner when Docker command
inspection hung while PostgreSQL/Auth remained available.

For the already linked hosted pilot project (Supabase main / Production), inspect
the selected project and migration list before reviewing and applying authorized
pending changes:

```powershell
& $env:SUPABASE_CLI migration list --linked
& $env:SUPABASE_CLI db push --linked --dry-run
& $env:SUPABASE_CLI db push --linked
```

Root applied the family migrations through 014 to the approved hosted project
after local checks and reviewed dry runs. These commands describe the repeatable
operator procedure; exact executed checks are in the inventory.
Keep hosted Auth/SMTP settings not explicitly changed by this feature. Enable
anonymous Auth for managed Child pairing and Realtime for `app_families`; enabling
anonymous Auth does not grant anonymous callers family access. Hosted configuration
is not changed merely by editing local `supabase/config.toml`. The Auth configuration
push in this run changed only `enable_anonymous_sign_ins`; other settings were
preserved. The retention migration separately configured its named database job.

| Configuration                                                                                                                              | Value / purpose                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_GHAF_AUTH_MODE`                                                                                                               | `supabase` for real accounts; `demo` only for an explicitly isolated synthetic build                                                    |
| `EXPO_PUBLIC_SUPABASE_URL`                                                                                                                 | `https://bqcfynlbxevqlzbkimhy.supabase.co` for the configured hosted pilot project (Supabase main / Production)                         |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                                                                                                     | Project's public publishable key; no secret value belongs in this document                                                              |
| `EXPO_PUBLIC_GHAF_SERVICE_MODE`                                                                                                            | Existing `mock` selector belongs to legacy deterministic providers; real account family requests use the authenticated Supabase service |
| `EXPO_PUBLIC_GHAF_DEMO_ENTRY`                                                                                                              | Explicit synthetic entry selector, never real-account authority                                                                         |
| `EXPO_PUBLIC_GHAF_MESSAGING_URL`, `EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY`                                                             | Legacy separate Feature 016 service only; not needed for main-account Feature 020 messages                                              |
| `EXPO_PUBLIC_GHAF_AI_PARENT_TASK_DRAFTING_LIVE`, `EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE`, `EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE` | Remain `false`; this migration does not activate live AI                                                                                |

Retrieve public keys through the operator's secure tooling. Never place
`service_role`, provider, SMTP, JWT-signing or database credentials in Expo public
variables, logs, screenshots or tracked evidence.

Migration order retains the four earlier access/profile/workspace migrations,
then applies the versioned family additions:

| Suffix under `20260915`      | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `000100`, `000101`           | Family/session/task authority; 25 global task references               |
| `000200`                     | Typed study/connections/preferences/templates/learning documents       |
| `000300`, `000400`, `000500` | Private growth; main-account messages; reviewed custom tasks/routines  |
| `000600`, `000700`           | Composite document ownership and canonical text; two-Child capacity    |
| `000800`, `000900`           | Prospective landscape crossing and reachable reward-target checks      |
| `001000`, `001100`           | Read-only authorization compatibility; server task-instruction guards  |
| `001200`, `001300`           | Complete scalar document reads; business conflicts as HTTP 409         |
| `001400`                     | Reviewed named hourly message-retention job and operator-only controls |

## Repeat the fresh-account journey

1. Put the three public Supabase settings above in ignored `.env.pilot.local`, then
   run `npm run start:pilot -- --web` (or `npm run start:pilot -- --android` with the
   compatible native development client). Normal account entry uses real Auth.
2. Create/confirm an isolated adult test account and follow the existing operator
   approval procedure for `pilot_access`. Sign in and create a family with actual
   test names. Confirm there are no Children, activities, memories or earned totals.
3. Add one managed Child, review and assign GI01 from the shared catalog, and create
   a Child pairing token. On an independent client choose Child pairing and redeem
   it. The Child receives its own restricted anonymous Auth session.
4. Accept/start the task, resolve every step (required action done; permitted
   optional/adult steps done or explicitly skipped), and submit. On the Parent
   client record action-focused praise and confirm once. Expect exactly 8 Seeds
   and one eligible canopy contribution; a repeated confirmation adds nothing.
5. Save the eligible text memory. Reload both clients and sign the Parent out/in:
   the same task, earned total and memory must return from Supabase.
6. Sign in as a separate approved Parent B on the first client. Before B has made
   a family, expect fresh setup without A's Child, task, memory or earned total.
   The independent Child must remain restricted to A's authorized family.

Use only isolated test identities/content. This is a repeatable procedure, not a
claim that every platform has passed it; see the evidence matrix below.

## Retention and limitations

Main-account messages are readable for 30 days; retry receipts expire after 24
hours. `ghaf_family_message_purge_expired` is operator-only. Migration 014 enables
the available `pg_cron` extension and configures the exact active job
`ghaf-main-family-message-retention-v1` at `0 * * * *`, preserving unrelated jobs.
Local purge and retention tests passed 23 checks. The exact hosted job completed
successfully at `2026-09-14 19:45:00.109294+00` through pg_cron. Its cadence was
temporarily changed to every minute for this bounded check, then restored to
`0 * * * *` in `finally` and verified through the guarded configuration function.
No other job was changed. This proves scheduled execution; local synthetic expired
rows verified deletion separately. Read expiry alone does not prove deletion, and database
backups have separate provider retention settings. Do not create a second job
using the older unsuffixed example name.

- No existing persistent media-upload operation was found to migrate. Memories
  remain text; bundled imagery is reference content. No child transcripts,
  recording files, location history or attachment bucket is silently created.
- Badge definitions are not invented evidence: only canonical P0 currently maps
  sorting/coast mastery and reward eligibility. Unmapped badge criteria stay locked.
  Reachable reward landscape targets are consequently limited; see growth contract.
- `account_workspaces` remains available under the Parent's legacy personal plans.
  No automatic import occurs; explicit conversion into managed-Child activities
  remains unimplemented, including its idempotent mapping and no-award review.
- Separate Feature 016 messages remain in their original project. No trusted
  cross-project identity mapping or conversation import has been implemented.
- Calendar integration, allowances, location sharing and calls remain missing
  features. Paid subscriptions/entitlements are not implemented by Free capacity.
- Hosted WebSocket delivery, independent readback, disconnect/reconnect and revoked
  Child isolation passed the gated Realtime suite on 2026-09-14. This is actual
  provider evidence, separate from the database-only tests.
- Two separate browser origins completed fresh setup, assignment, separately paired
  Child completion, Parent praise/confirmation, 8 Seeds, one canopy contribution and
  one memory. Both sessions restored after reload. Parent account switching showed
  fresh Account B setup while the independent Child retained only Family A data.
- A current Hermes bundle was packaged into an explicitly internal test APK using
  preserved native payloads and installed without clearing emulator data. On
  emulator-5554, the synthetic browser Parent signed in and retrieved its family,
  actual managed Child, 8 Seeds and one canopy contribution. Force-stop/cold restart
  restored the session and the same values. Android Back returned Garden to Family;
  keyboard dismissal was exercised. This does not verify the complete native Child
  pairing/task journey, a current Gradle build, device reboot or physical devices.
- Full Gradle build preflight remains blocked: 5.68 GiB free on C: is below the
  builder's 20 GB requirement. Internal rebundle provenance and its APK hash are
  recorded in the migration inventory; it is not a release artifact.

Current executed results and the exact hosted/browser/native limitations belong
to the [migration inventory](../competition-readiness/supabase-data-migration.md).
