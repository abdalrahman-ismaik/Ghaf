# Feature Specification: Verified Family Replacement

**Feature Branch**: `integration/r3-complete-screens-20260905`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "Keep Create a new family visible, then ask for the Parent identifier,
authenticate, collect personal and family information, and continue through the existing new-family
screens."

## User Scenarios & Testing

### User Story 1 - Start a new-family journey from Parent sign-in (Priority: P1)

As a Parent on a device that already contains a family, I can still see **Create a new family** and
open a clearly explained new-family flow before entering an email address or phone number.

**Why this priority**: The missing action is the immediate usability defect, and the replacement
consequence must be understandable before the Parent proceeds.

**Independent Test**: Sign out from an established family, confirm the action remains visible, open
it, and verify that the identifier form and current-family preservation notice are both available.

**Acceptance Scenarios**:

1. **Given** no local family exists, **When** the Parent chooses **Create a new family**, **Then** the
   existing first-family identifier and verification journey opens unchanged.
2. **Given** one local family exists, **When** the Parent opens Parent sign-in, **Then** **Create a
   new family** remains visible and opens identifier entry without altering the current family.
3. **Given** one local family exists, **When** the Parent reaches new-family identifier entry,
   **Then** the screen explains that the current family remains until the final replacement action
   and that only one family is stored on this device.

---

### User Story 2 - Verify before editing replacement details (Priority: P1)

As a Parent creating a replacement family, I enter an identifier and complete the existing bounded
verification before Ghaf asks for Parent/guardian, family, and Child profile information.

**Why this priority**: Verification preserves the intended access sequence, while recoverability
prevents a wrong code, cancellation, Back action, or interrupted setup from deleting family data.

**Independent Test**: Start replacement, try a wrong code and cancel, then repeat with the accepted
code; prove the old family remains stored until setup reaches its final review action.

**Acceptance Scenarios**:

1. **Given** an established family and a valid new identifier, **When** the wrong code is entered,
   **Then** the existing family, receipt, pairings, and progress remain unchanged.
2. **Given** replacement verification or personal-information editing is in progress, **When** the
   Parent cancels, uses Back, or restarts the app, **Then** the established family remains the active
   saved family and the incomplete replacement is discarded.
3. **Given** the accepted verification code, **When** verification completes, **Then** Family Basics
   opens with a fresh draft and continues through Parent/guardian details, family details, Child
   profiles, and whole-family review.

---

### User Story 3 - Replace only from final review (Priority: P1)

As a verified Parent, I review the complete new family and choose an explicitly labeled replacement
action before the old household is replaced and the new household becomes active.

**Why this priority**: The final action is destructive to prototype household state and must be
deliberate, complete, recoverable on write failure, and private between households.

**Independent Test**: Complete replacement with a different identifier and family name; prove the
new family is active, prior household state is reset, and an injected save failure leaves the old
family recoverable.

**Acceptance Scenarios**:

1. **Given** a complete replacement draft, **When** the Parent opens Review Family, **Then** the
   replacement consequence is repeated and the primary action explicitly says it will replace the
   current family.
2. **Given** a complete replacement draft, **When** its final save succeeds, **Then** the new family
   becomes the sole local family, binds the newly verified identifier, opens Parent Home, and the
   old household's progress, pairings, permissions, drafts, and assistant state are cleared.
3. **Given** a complete replacement draft, **When** its save fails, **Then** the old family remains
   saved, no partial family becomes active, and the Parent can retry or cancel safely.

### Edge Cases

- A direct or unknown create-family route marker with no matching pending intent fails closed to
  Parent sign-in.
- Repeated taps cannot request multiple verification attempts or complete replacement twice.
- A returning-family sign-in still matches only the identifier stored with the current family and
  continues to bypass all first-family screens.
- Replacement begun from a temporarily entered Parent route on a paired Child device clears that
  pairing only after the final successful replacement.
- Offline preview uses the same deterministic verification and replacement behavior without a
  network dependency.
- A new family may reuse the current identifier; replacement intent, not identifier difference, is
  the authority for the final action.

## Requirements

### Functional Requirements

- **FR-001**: Parent sign-in MUST always present **Create a new family** while signed out, regardless
  of whether a valid local family already exists.
- **FR-002**: Choosing that action MUST open new-family identifier entry without requesting a code,
  changing access authority, or mutating the saved family.
- **FR-003**: If a local family exists, identifier entry MUST explain that this device stores one
  family, that the current family is preserved until final review, and what household state will be
  cleared after replacement.
- **FR-004**: Fresh creation and replacement MUST use distinct, closed pending intents; route
  parameters alone MUST NOT authorize replacement.
- **FR-005**: Replacement MUST reuse the established bounded identifier normalization and
  deterministic six-digit verification flow and MUST NOT claim production authentication, account
  creation, message delivery, or remote identity proof.
- **FR-006**: Wrong-code, resend, identifier-change, cancellation, Back, and interrupted-process
  paths MUST leave the existing saved family unchanged.
- **FR-007**: Successful replacement verification MUST create an isolated fresh setup draft while
  retaining a recoverable in-memory copy of the current completion receipt and draft.
- **FR-008**: The replacement setup MUST collect the same approved Parent/guardian, relative,
  family, Child-count, Child-profile, accessibility, support, and prepared-personalization fields as
  fresh family creation, with no new sensitive field.
- **FR-009**: Cancelling after verified replacement setup begins MUST restore the previous receipt
  and draft, discard the replacement draft, and return signed out.
- **FR-010**: Review Family MUST repeat the replacement consequence and use a replacement-specific
  primary action; ordinary fresh creation MUST retain its existing label and behavior.
- **FR-011**: Replacement MUST validate the whole draft and successfully save the complete new
  family before exposing the new completion receipt or Parent experience.
- **FR-012**: A successful replacement MUST bind the newly verified normalized identifier and make
  the new record the sole local household.
- **FR-013**: Only after a successful new-family save, replacement MUST clear prior household
  progress, pairings, remembered access, permission grants, task/assistant drafts, media state, and
  transient welcome state before activating the new Parent experience.
- **FR-014**: Device-level presentation preferences that are not household-private MAY remain
  unchanged during replacement.
- **FR-015**: If final save or activation fails, the previous local family MUST be restored when
  possible, no partial replacement may become active, and a clear retry/cancel path MUST remain.
- **FR-016**: Returning sign-in MUST continue to match the sole saved family identifier and bypass
  new-family screens; stale or direct setup entry MUST fail closed.
- **FR-017**: Arabic RTL and English LTR MUST expose equivalent decisions, consequences, focus
  order, Back behavior, mixed-identifier handling, and at least 48dp action targets.
- **FR-018**: The feature MUST add no second household, production account, cloud sync, network
  request, analytics, payment, subscription entitlement, or Child-facing commercial behavior.

### Key Entities

- **Pending family-creation intent**: A transient closed state identifying fresh creation or
  verified replacement; it is not access authority and is never persisted.
- **Replacement backup**: A transient copy of the established completion receipt and setup draft,
  retained only so cancellation can restore the current family before final replacement.
- **Local family directory**: The single complete validated household stored on this device; a
  successful final replacement overwrites it as one record.
- **Replacement draft**: Fresh Parent/guardian, family, relative, and Child setup values collected
  after verification and validated before the final action.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In both Arabic and English, 100% of signed-out Parent sign-in states show one reachable
  **Create a new family** action, including devices with an established family.
- **SC-002**: The complete order is observable in every successful trial: identifier entry,
  verification, Parent/guardian and family details, Child profiles, review, then activation.
- **SC-003**: Across wrong-code, cancel-from-verification, cancel-from-setup, Back, restart, and
  injected-save-failure trials, the established saved family is retained in 100% of cases.
- **SC-004**: Across successful replacement trials, exactly one local family remains and 100% of
  prior household-private progress, pairing, permission, draft, assistant, and transient state
  returns to its canonical baseline before the new Parent Home opens.
- **SC-005**: Compact 320×720 and reference 390×844 layouts in Arabic RTL and English LTR keep
  the identifier field, preservation notice, replacement warning, and all actions readable and
  reachable without horizontal overflow.
- **SC-006**: Automated checks find no new route, network dependency, credential persistence,
  second-family collection, payment flow, or production-authentication claim.

## Assumptions

- The user wants the full existing first-family information sequence after verification, not a
  shortened duplicate-family form.
- The prototype remains limited to one synthetic household on one device; "new family" means a
  deliberate replacement when one already exists.
- The current deterministic code and offline path remain the approved competition behavior.
- The previous family remains recoverable until final review; after successful replacement there
  is no household-history or undo feature in this P0 prototype.
- Existing one-or-two-Child free behavior and the Parent-only Ghaf Plus capacity preview remain
  unchanged.
