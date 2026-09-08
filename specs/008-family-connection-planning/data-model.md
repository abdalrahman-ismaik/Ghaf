# Data Model: Family Connection Planning

## Family Connection Directory

The directory is created and saved atomically with the one local family.

| Field | Type | Validation | Meaning |
| --- | --- | --- | --- |
| `primaryGuardianName` | string | trimmed, 2–40 characters, no control characters | Required display name for the current Parent/guardian; not identity authority |
| `secondaryGuardianName` | string | empty or trimmed 2–40 characters, no control characters | Optional display name for another Parent/guardian |
| `relatives` | list of Named Relative | 0–6 unique slot IDs | Explicitly configured relatives only |

## Named Relative

| Field | Type | Validation | Meaning |
| --- | --- | --- | --- |
| `id` | `relative_1` … `relative_6` | unique within directory | Stable local presentation/derivation slot |
| `displayName` | string | trimmed, 2–40 characters, no control characters | Parent-entered display name only |
| `relationship` | enum | `grandmother`, `grandfather`, `aunt`, `uncle` | Broad relationship selected by Parent |
| `rhythm` | enum | `weekly`, `monthly`, `every_three_months`, `no_schedule` | Non-enforcing planning label |

Duplicate display names are allowed. Removing an entry releases its slot for a later entry; no
historical completion or due state is retained.

## Parent Onboarding Draft

`familyConnections` is added beside existing family name, app language, Child count, and two
internal Child draft slots. Draft updates clone the relative array, reject unknown fields and
values, and retain the directory across Back navigation. Complete-draft validation requires the
primary name and every present relative to be valid; optional secondary and relatives may be empty.

## Parent Onboarding Completion Receipt

The immutable completion receipt contains a cloned `familyConnections` directory. Restoring a
receipt reconstructs the exact validated setup draft but does not restore Parent authority.

## Local Family Record Schema 3

Schema 3 adds `familyConnections` to the exact top-level key set. It preserves all schema-2 fields:
household/family identity, locale, normalized synthetic Parent lookup, one/two Child profiles,
paired markers, timestamps, origin, and capability truth.

Migration behavior:

1. Read schema 3 first.
2. If absent, read schema 2 and validate its former exact shape by transforming it into schema 3.
3. If schema 2 is absent, read schema 1, add the canonical prepared Parent lookup, then transform.
4. Migrated records receive `primaryGuardianName = "وليّ الأمر"`, an empty secondary name, and no
   relatives. No personalized connection entry is derived.
5. Write schema 3 before deleting the migrated key. Any read/write/parse failure remains fail-closed.
6. Exact reset removes schema 3, schema 2, and schema 1 keys.

## Derived Connection Plan Entry

Plan entries are never persisted.

| Field | Type | Meaning |
| --- | --- | --- |
| `relativeId` | Named Relative ID | Binds entry to one validated relative |
| `displayName` | string | Isolated copy for private Parent presentation |
| `relationship` | relationship enum | Drives relationship label and allowed idea set |
| `rhythm` | rhythm enum | Display-only planning cadence |
| `ideaId` | allowlisted enum | One deterministic current prepared idea |
| `remoteAlternativeId` | `call_or_message` | Equal non-visit route |
| `recognitionMode` | `recognition_only` | No numeric reward or persistent progress |
| `requiresParentReview` | `true` | Parent decides suitability before any real-world use |
| `childMayChooseOrSkip` | `true` | No forced interaction or penalty |
| `effect` | `none` | No task/progress/shared authority |
| `origin` | `prepared_local` | Truthful non-AI, offline source |

### Deterministic derivation

Entries preserve relative order. A bounded idea sequence is selected from the relationship's
allowlist using the stable relative-slot number, so the same directory always produces the same
entry. Invalid directories return no plan instead of partial or inferred results.

### State transitions

```text
no relative
  -> Parent adds complete relative
  -> validated draft relative
  -> family creation commits schema-3 directory
  -> Parent Family derives one read-only plan entry

configured relative
  -> Parent edits/removes before creation
  -> revalidation/rederivation

any stored directory
  -> Parent-authorized exact reset
  -> no family directory and no derived entries
```

No connection idea has assigned, accepted, submitted, confirmed, missed, overdue, or rewarded
states in Feature 008.
