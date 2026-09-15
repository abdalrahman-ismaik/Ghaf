# Hosted Masroofi SQL contract

This API extends Feature020 `app_families`, `app_children`, `app_tasks` and
`app_recognitions`. It does not read or remap Feature019 or sample records.
All monetary values are simulated AED fils, integers; there is no payment provider.

## Calls and identity

`ghaf_family_masroofi(p_family_id uuid)` returns `CloudMasroofiSnapshot` directly.
`ghaf_family_masroofi_command(p_family_id uuid, p_request_id uuid, p_command jsonb)`
returns exactly `{ "snapshot": CloudMasroofiSnapshot }`.

The exact camelCase DTO lives in `src/models/cloudMasroofi.ts`. A snapshot contains
`schemaVersion: 1`, `actor`, `familyId`, `revision`, `cards`, `promises` and
`transactions`. Arrays contain complete history, not a truncated window. The actor
contains `userId`, `role`, `familyId` and `childId`; Parent `childId` is null.
Cards expose current `controlsVersion` and controls; historical versions remain
private server evidence. Only the actor's selected authorized family is projected.
Parents see its cards; a Child sees only their own card, promises and transactions.

Every call checks the live provider session and family membership using
`ghaf_family_actor`, takes the existing family row lock, then checks the actor
again. Reads use one MVCC statement for all arrays and family revision, taking
`FOR SHARE` only in writable transactions; read-only transactions remain supported.
Commands use `FOR UPDATE`.
Commands also use the existing per-user transaction lock and a request UUID lock.
No user metadata or client `childId` grants authority. No new table has client
read/write grants; all enable RLS. Only the two RPCs grant authenticated execution.
Internal functions explicitly revoke public/anonymous/authenticated execution.

## Exact commands

| `type`           | Other required fields                          | Authorized actor             |
| ---------------- | ---------------------------------------------- | ---------------------------- |
| `card.enable`    | `childId`, `age10PlusConfirmed: true`          | Parent with fresh password   |
| `card.controls`  | `childId`, `expectedVersion`, `controls`       | Parent with fresh password   |
| `card.top_up`    | `childId`, `amountFils`                        | Parent with fresh password   |
| `reward.promise` | `taskId`, `expectedTaskRevision`, `amountFils` | Parent with fresh password   |
| `purchase`       | `childId`, `fixtureId`                         | Separately paired Child only |

Every key is required and unknown keys are rejected. Numeric strings, fractions,
null controls, duplicate categories and malformed IDs fail closed. The existing
signed password AMR must be numeric, no more than 120 seconds old and not future.
Parent practice purchase is deliberately excluded: a Parent cannot impersonate a
Child. Purchase `childId` must equal the live actor's Child, and be active in-family.

Enrollment requires an explicit 10+ confirmation and a `9_11` or `12_14` age band;
`9_11` alone does not establish age eligibility. Initial balance is zero, version
one, unfrozen, online blocked, stationery allowed, 2000-fils purchase limit and
5000-fils daily limit. Controls have exactly `frozen`, `onlineAllowed`,
`allowedCategories`, `perPurchaseLimitFils` and `dailyLimitFils`. Limits are
1–50000 fils. Allowed categories may be empty and use the eight existing categories.
Each change inserts immutable controls/category history and advances the version.

Top-ups are 1–50000 fils. Fixed task promises are 1–10000 fils. Balance plus all
outstanding promises must remain at most 1000000 fils, reserving capacity for the
full future credit. Money is independent of Seeds and League scoring.

## Task promise and recognition

Only assigned, unaccepted, unsubmitted, unrecognized canonical tasks can receive a
promise. The allowlist is `task_recycling_p0_v1`, `HR01`, `HR05`, `GI01`, `GI02`,
`GI03`. Content must exactly equal the server catalog template, with only the
existing P0 Child-name localization applied at promise creation. The current Child
age band must be allowed; category must be `home_responsibility` or `green_impact`,
visibility `household`, phase `acquisition`, and recognition `standard` or
`fade_first`. Custom, edited, education and sensitive tasks are denied. A renamed
Child's old localized P0 task may require a fresh assignment before promising;
the backend never accepts arbitrary name/content differences as canonical.

One immutable promise stores task identity, revision, exact JSONB SHA-256 content
fingerprint and amount. A task trigger prevents later identity/template changes
and removal, while allowing its original lifecycle and permitted help transitions.
The promise cannot be reduced, replaced or removed, even before acceptance.

The `AFTER INSERT app_recognitions` trigger credits the full amount in the same
transaction while the existing task is still `praised`. It verifies Parent
authority and fingerprint, updates card and promise, and appends one reward ledger
row. No new recognition endpoint or Seed/growth calculation is introduced. Freeze
affects spending only. Old recognitions are not retroactively paid.

Child pending promises omit the `amountFils` key entirely; after recognition the
same promise includes it. Reward transaction `requestId` equals the server promise
UUID; clients cannot consume that reserved ID. `creditedAt` and transaction
`createdAt` equal one server credit-posting timestamp. One credited promise has one matching
reward transaction; the ledger sum equals the current balance.

## Practice spending and retries

Server-owned prices use the existing reference items:

| `fixtureId`     | Category   | Fils | Online |
| --------------- | ---------- | ---: | ------ |
| `stationery`    | stationery |  300 | false  |
| `storybook`     | books      |  800 | false  |
| `football`      | sports     | 1800 | false  |
| `art_supplies`  | arts       | 1000 | false  |
| `museum_ticket` | outings    | 1500 | true   |
| `snack`         | snacks     |  400 | false  |
| `gift`          | gifts      | 2000 | false  |
| `game_online`   | games      | 1200 | true   |

Purchases require an enabled card. Restriction order is freeze, category, online,
per-purchase limit, daily limit, available balance. Day comes from the server's
`Asia/Dubai` date. Only approved purchases count toward daily spending. Approved
and declined purchases both create immutable transactions/command receipts;
declines never change balance. `card_disabled` remains a shared-model reason but
an unenrolled purchase returns `invalid_transition` without inventing a card.

Request UUIDs are globally unique within this command domain. An exact replay by
the same still-authorized actor returns a current snapshot without reapplying the
operation. Different family, actor or command content returns `request_conflict`.
Parent retries still require fresh password. A declined receipt remains declined
after controls or balance change; use a new UUID for an intentional new purchase.
Successful new commands increment `app_families.revision` for existing refresh
subscriptions. Recognition uses the existing task command's revision increment.

## Errors and evidence

`42501` carries `access_unavailable` or `family_unavailable`; `PT428` carries
`reauth_required`; `PT409` carries `request_conflict`. Domain validation uses
`PT400` with `invalid_command`, `invalid_transition`, `age_ineligible`,
`task_ineligible`, `promise_locked` or `balance_limit`. Infrastructure errors remain
errors, never synthetic success. Client transports sanitize unknown messages.

The rollback-only `family_masroofi.test.sql` exercises restricted identities,
hidden fields, controls, immutable rewards, real hosted-task lifecycle, exact
retries and balance reservations. It emits synthetic DTO snapshots for the strict
application parser. A single SQL connection does not prove concurrent scheduling,
GoTrue delivery, hosted installation or physical Android acceptance; record those
separately in the workstream before claiming them.

Implementation follows Supabase's current [function privilege guidance](https://supabase.com/docs/guides/database/functions)
and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
