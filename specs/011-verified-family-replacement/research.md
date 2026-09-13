# Research: Verified Family Replacement

## Decision 1: Treat “new family” as replacement, not multi-family tenancy

- **Decision**: When one local family exists, **Create a new family** starts an explicit replacement
  flow for the sole device-local household.
- **Rationale**: The user receives the requested journey while the P0 one-household boundary,
  access model, repository schema, and deterministic demo remain intact.
- **Alternatives considered**: Persisting multiple families was rejected because it requires family
  selection, tenant-scoped ledgers, migration, authorization, and new privacy behavior. Silently
  resetting first was rejected because cancellation or a wrong code would destroy the current
  family.

## Decision 2: Keep replacement authority in a closed transient store intent

- **Decision**: Distinguish `fresh`, `replacement`, and no pending creation intent in application
  state; route query parameters remain presentation context only.
- **Rationale**: A deep link cannot gain destructive authority, and returning sign-in remains
  separate from creation.
- **Alternatives considered**: Trusting `flow=create-family` was rejected because route input is not
  an authorization boundary. Inferring replacement only from an existing record was rejected
  because direct navigation could start the destructive path.

## Decision 3: Stage a fresh verified draft without deleting the current family

- **Decision**: After accepted verification, the onboarding controller temporarily backs up the
  current receipt/draft, exposes a fresh verified draft, and restores the backup on cancellation.
- **Rationale**: The Parent can enter personal and family information in the requested order while
  wrong-code, Back, cancellation, and process restart preserve the existing record.
- **Alternatives considered**: Clearing the receipt before code verification was rejected as early
  data loss. Persisting the replacement draft was rejected because P0 does not need resumable
  cross-restart drafts and should minimize family data at rest.

## Decision 4: Commit the new record before clearing old runtime authorities

- **Decision**: Final review validates and saves the complete replacement record first. Only after
  that succeeds does the store reset prior household progress, pairings, permissions, assistant and
  media state, then establish the new Parent session.
- **Rationale**: A storage write failure leaves the old record available. The new Parent never sees
  prior household-private runtime state.
- **Alternatives considered**: Resetting runtime and storage before the new save was rejected because
  failure would strand the device without a family. Retaining prior progress was rejected as
  cross-household privacy leakage.

## Decision 5: Preserve device presentation preferences

- **Decision**: Household-private state resets, while the device-local sound preference may remain.
- **Rationale**: Sound is a device presentation choice rather than family data, and preserving it
  avoids a surprising unrelated setting change.
- **Alternatives considered**: Reusing the full Parent reset unchanged was rejected because it also
  resets a non-household device preference and navigates to the signed-out root.

## Decision 6: Repeat the consequence at entry and final review

- **Decision**: Identifier entry explains preservation and single-family scope; final review repeats
  the consequence and uses an explicit replacement-specific action label.
- **Rationale**: The first notice gives informed context, while the final label is adjacent to the
  only destructive transition.
- **Alternatives considered**: A one-time modal was rejected because it is easy to dismiss early and
  can obscure the requested email-first flow. An unlabeled reuse of **Create family** was rejected
  because it hides the replacement consequence at the decision point.
