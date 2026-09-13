# Data Model: Verified Family Replacement

## Pending family-creation intent

Transient application state; never persisted.

| Value | Meaning | Allowed next transitions |
|---|---|---|
| `null` | No create-family journey owns authority | Fresh request, replacement request, returning sign-in |
| `fresh` | No family existed when new-family verification began | Verify, resend, cancel, setup, complete |
| `replacement` | An existing family was present when replacement verification began | Verify, resend, cancel, stage fresh draft, complete replacement |

Validation rules:

- Requires signed-out Parent access.
- `fresh` requires no local family and no completion receipt.
- `replacement` requires a ready local family and matching restored completion receipt.
- Returning sign-in always clears creation intent.
- Route markers never set or substitute for this state.

## Replacement backup

Private transient controller state containing:

- cloned prior completion receipt;
- cloned prior onboarding draft.

State transitions:

```text
existing signed out
  -> replacement code sent
  -> verified with existing receipt
  -> replacement staged (receipt hidden, fresh draft, backup retained)
     -> cancel/back: restore backup -> existing signed out
     -> validated final review + save: create new receipt -> discard backup
```

Validation rules:

- Can be created only from `verified` with an existing receipt, no Parent session, and a pending
  normalized identifier.
- At most one backup exists.
- Verification resend/request cannot overwrite a staged backup.
- Reset clears the backup.
- Successful completion discards the backup permanently.

## Local family directory

The existing schema-3 complete record remains the only persistent household entity. Replacement
changes no schema and adds no collection.

Replacement invariants:

- Old record remains stored during identifier entry, verification, and setup editing.
- Final draft is fully validated before save.
- One successful save overwrites the sole record with the new normalized Parent identifier and
  complete family details.
- A failed save leaves the old record and visible store projection unchanged.
- The new record contains no verification code, session, backup, or progress ledger.

## Household runtime reset bundle

Existing in-memory authorities reset after the replacement record saves:

- task/journey and routine progress;
- Seed/Garden/Growth/learning/shared-growth/reveal projections;
- Child access and paired-device state;
- remembered Parent/Child device access;
- Family Reward runtime;
- Parent Guide, drafting, Child Coach, voice/media, grants, and confirmation state;
- returning welcome and temporary Parent access.

The device sound preference is not household-private and remains unchanged.
