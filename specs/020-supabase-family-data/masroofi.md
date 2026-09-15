# Masroofi in the hosted family experience

Authority: the user's requested UAE Masroofi card, complete saved-data migration, preservation
during the main merge and September 15 correction: “where's Masroofi pages? it's not there”.
Expose Masroofi within the normal hosted Parent and paired Child family navigation. Preserve
the normalized Feature019 runtime and the explicit local sample without importing their records.

## Behavior

Parent selects an actual active Child. Enrollment requires explicit confirmation of age 10+;
the 6–8 band is denied and a 9–11 band alone is insufficient. A new card has zero balance and
restrictive controls. Reuse the existing UAE card artwork, all eight spending categories and
one clear simulated-money notice. No repeated DEMO artwork marks, issuer, real payment or custody.

Parent can freeze the card, allow categories/online practice purchases, set per-purchase/daily
limits, add simulated funds and lock a fixed reward to an eligible assigned/unaccepted task.
Financial/control changes require existing fresh password reauthentication. Money never derives
from a Seed exchange rate or League rank. Paid task eligibility uses a strict curated allowlist
and existing content/privacy/recognition rules; altered/custom/sensitive/education tasks fail closed.
Lock accepted reward terms and task content against later weakening. Reserve outstanding promised
amounts when enforcing the existing maximum balance. Card freezing affects spending, not earnings.

Child sees only their card and transactions. Pending reward amounts are omitted from their RPC
response until Parent recognition; the Child may see that a task has a hidden reward. Existing
recognition atomically credits the promise once, without changing Seeds, growth or League rules.
Practice purchases use server-owned reference item prices. Freeze/category/online/transaction/
daily/balance restrictions are enforced atomically, including declined receipts and exact retries.
No backend error becomes a fixture balance, successful save, or automatic runtime switch.

## API and storage

New narrow RPCs: ghaf_family_masroofi(p_family_id uuid) and
ghaf_family_masroofi_command(p_family_id uuid,p_request_id uuid,p_command jsonb).
Use existing ghaf_family_actor and active membership/session checks, the family transaction lock,
immutable request receipts and app_families revision notification. Tables reference the existing
hosted family/Child/task/recognition UUIDs. Enable RLS, explicit grants and narrowly scoped trusted
helpers; restricted clients cannot directly update money or read pending Child reward amounts.
An AFTER INSERT app_recognitions trigger creates the corresponding ledger credit in the same
transaction. Old recognition is not retroactively paid; task commands and other domains remain.

The model, strict response parser and service use camelCase DTOs with schemaVersion, actor,
familyId, revision, cards, promises and transactions. Every snapshot must match the expected
user, family, role and Child. Mutations use a retained idempotency UUID for ambiguous retries,
revision checks for control/task edits and fresh reauthentication for sensitive Parent actions.
Background/account changes invalidate stale writes and erase private view state.

## Verification and installation

Verify empty real accounts, Parent enrollment, underage denial, Child/sibling/cross-family denial,
hidden amounts, content locking, eligible recognition, no duplicate awards, balance reservations,
spending boundaries and concurrent idempotent retries. Run strict response/controller tests,
Parent/Child navigation/form tests, bilingual checks and actual SQL assertions. Preserve all
existing family data and migration files. Apply only reviewed additive SQL after authenticated
admin access, inspect migration history, and record separate hosted read/write/isolation evidence.
No reset or migration-history repair is authorized. Browser fixtures are not hosted acceptance.
