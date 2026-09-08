# Contract: Verified Family Replacement State

## Entry commands

### Request fresh family verification

- Preconditions: signed out; local directory ready; no saved family or receipt.
- Success: normalized identifier is pending, code state is visible, intent is `fresh`.
- Failure: no access or family state changes.

### Request replacement family verification

- Preconditions: signed out; local directory ready; one saved family and restored receipt exist.
- Success: normalized identifier is pending, code state is visible, intent is `replacement`; saved
  family and receipt remain unchanged.
- Failure: no access or family state changes.

### Request returning Parent verification

- Preconditions: signed out; candidate identifier matches the sole saved family.
- Success: code state is visible and creation intent is cleared.
- Failure: no verification begins and no family state changes.

## Verification commands

### Verify Parent code

- Uses the existing deterministic bounded verifier.
- Wrong or malformed codes return to code entry and preserve family, receipt, intent, and runtime.
- Verification alone grants no Parent experience.

### Begin verified family replacement

- Preconditions: intent is `replacement`; controller is verified; old receipt/local family exist;
  no active experience exists.
- Success: prior receipt/draft are backed up in memory, a fresh verified draft is exposed, the local
  family remains stored, and Parent experience remains unauthorized.
- Failure: existing family and controller view remain unchanged.

### Cancel Parent verification/setup

- Fresh flow: discard pending verification/draft and return signed out.
- Replacement flow: restore backed-up receipt/draft, clear replacement intent, and return signed out.
- Never clears the local family record.

## Final command

### Complete Parent onboarding

Fresh behavior remains unchanged.

Replacement preconditions:

- intent is `replacement`;
- verified fresh draft is complete and safe;
- prior local family remains available for rollback.

Replacement transaction order:

1. Validate the complete draft and new normalized identifier.
2. Create and save one complete replacement local-family record.
3. Clear remembered access and reset prior household runtime authorities.
4. Complete the controller receipt/session using the new draft.
5. Publish the new local-family projection and active Parent experience.
6. Clear the replacement intent and backup.

Failure contract:

- A validation/save failure leaves the previous persistent record and store projection unchanged.
- A later activation failure attempts to restore the previous record and never exposes a partial
  new family.
- The command remains retryable from final review when the controller can safely retry; otherwise
  cancellation restores the prior family.

## Presentation contract

- **Create a new family** is always visible on signed-out Parent sign-in.
- Existing-family sign-up displays a preservation/single-family notice before the identifier action.
- Verification precedes every personal/family-information screen.
- Final replacement review repeats the consequence and uses a replacement-specific action label.
- Fresh creation keeps its existing labels.
- Arabic RTL and English LTR expose equivalent decisions and Back behavior.
