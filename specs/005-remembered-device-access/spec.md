# Feature Specification: Remembered Device Access

## Corrupt local-family recovery compatibility — 2026-09-13

The owner approved Feature 003 FR-220–224: a signed-out, explicitly confirmed
recovery path for freshly verified corrupt local-family data. It clears and verifies
the remembered-affinity marker before clearing legacy/current family data, then
reuses deterministic reset. It never restores either role, treats the affinity
marker as authentication, or deletes a valid replacement family. Ordinary Parent
logout and Parent-only reset retain their existing contracts. This is local demo
recovery, not production identity or cloud account recovery.

**Feature Branch**: `005-remembered-device-access`

**Created**: 2026-09-07

**Status**: Approved for implementation

**Input**: User description: "Remember a Parent after first login unless they log out; normally
Parents and Children use different devices; on a shared device Child access requires Parent
logout, while a registered Child can temporarily switch to Parent access without unpairing."

## User Scenarios & Testing

### User Story 1 - Parent chooses remembered access (Priority: P1)

A Parent completing local verification can choose whether this app installation should return
directly to their family space after the app restarts. The choice is explicit, optional, and
truthfully described as local prototype continuity.

**Why this priority**: It removes repeated demonstration login while retaining a clear Parent
choice and an effective explicit logout.

**Independent Test**: Create or sign in to the synthetic family, select remember-this-device,
recreate the app store, and confirm Parent Home is authorized without repeating identifier/code;
then sign out, recreate again, and confirm signed-out Welcome appears.

**Acceptance Scenarios**:

1. **Given** a verified Parent on a device without a remembered Child, **when** the Parent selects
   remember-this-device and enters the family, **then** a later app restart restores a fresh local
   Parent authority and opens Parent Home without another verification step.
2. **Given** a remembered Parent, **when** the Parent explicitly signs out, **then** Parent
   authority ends, the remembered Parent marker is removed before success is reported, and a later
   restart remains signed out.
3. **Given** the Parent does not select remember-this-device, **when** the app restarts, **then** no
   Parent authority is restored.
4. **Given** local preference storage cannot be written, **when** Parent entry completes, **then**
   the current authenticated session remains usable but the app does not claim remembered access.

---

### User Story 2 - Child device returns without another login (Priority: P1)

After a Parent-approved Child pairing completes, that installation remembers the paired Child and
returns to the same Child space after restart without another profile or credential step.

**Why this priority**: A Child normally has a dedicated device, so repeated credential entry adds
friction without strengthening this synthetic prototype.

**Independent Test**: Pair Salem, recreate the app store, and confirm only Salem's authorized
Child experience is restored; revoke Salem's device as Parent and confirm a later restart cannot
restore Salem.

**Acceptance Scenarios**:

1. **Given** a completed, non-revoked Child pairing, **when** the app restarts, **then** the same
   Child receives a fresh local Child authority and opens Today without profile or PIN entry.
2. **Given** a Child pairing is revoked or the prototype is reset, **when** the app restarts,
   **then** no Child authority is restored.
3. **Given** a corrupt, unknown, mismatched, or unavailable device marker, **when** startup runs,
   **then** the app fails closed to signed-out access and exposes no private role surface.

---

### User Story 3 - Safe shared-device handoff (Priority: P1)

An active Parent cannot be replaced by a Child. An active paired Child can instead choose Parent
access without removing the Child pairing. After Parent verification and temporary use, explicit
Parent logout returns directly to the same paired Child.

**Why this priority**: It expresses the user's asymmetric same-device rule while keeping Parent
private data inaccessible from Child space.

**Independent Test**: From remembered Salem access choose Parent access, verify the Parent, confirm
Parent-only screens work and Child screens remain guarded, then sign out as Parent and confirm the
app returns to Salem without PIN or re-pairing.

**Acceptance Scenarios**:

1. **Given** an active Parent, **when** any Child route or Child selection is attempted, **then** it
   remains blocked until explicit Parent logout.
2. **Given** an active remembered Child, **when** the Child chooses Parent access, **then** Child
   authority ends for the temporary handoff but the pairing and Child device marker remain.
3. **Given** temporary Parent access on a Child-owned device, **when** the Parent signs out,
   **then** Parent authority ends before a fresh authority for that same Child is created.
4. **Given** the Child pairing is revoked during temporary Parent access, **when** Parent signs
   out, **then** the app stays signed out and never restores the revoked Child.
5. **Given** a Child-owned device, **when** Parent verification is shown, **then** the screen
   explains that Parent access is temporary and does not offer to replace the remembered Child.

### Edge Cases

- A stored Parent marker without a valid local family receipt is ignored and cannot create access.
- A stored Child marker must match both a configured profile and a currently paired device marker.
- At most one primary role/profile marker exists per app installation; a successful Child pairing
  replaces Parent remembrance on that same installation.
- Repeated remember, restore, handoff, logout, revoke, and reset actions are deterministic and do
  not create parallel authorities.
- App restart during temporary Parent entry or use safely returns to the remembered Child because
  temporary Parent authority is never persisted on a Child-owned device.
- Arabic and English copy must withstand compact widths and long labels without changing meaning.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST present an unchecked, accessible remember-this-device choice during
  Parent verification when the installation is not owned by a remembered Child.
- **FR-002**: The system MUST persist Parent device affinity only after successful Parent family
  entry and only when the Parent explicitly opted in.
- **FR-003**: The system MUST restore remembered Parent access with a newly created synthetic local
  authority, not by persisting or replaying a session or verification code.
- **FR-004**: Explicit Parent logout MUST clear Parent device affinity before reporting success.
- **FR-005**: Successful Child pairing MUST persist that Child as the installation's primary
  profile and replace any Parent affinity on that installation.
- **FR-006**: Startup MUST restore only a configured Child whose pairing marker remains active.
- **FR-007**: An active Parent MUST block Child entry and role replacement until Parent logout.
- **FR-008**: The system MUST offer a Child-facing Parent-access action that terminates current
  Child authority without revoking or deleting the Child pairing.
- **FR-009**: Parent access initiated from a remembered Child installation MUST be temporary and
  MUST NOT expose a remember-Parent choice or replace the Child device marker.
- **FR-010**: Parent logout after a temporary handoff MUST restore the same eligible Child, or stay
  signed out if restoration is invalid or unavailable.
- **FR-011**: Revocation MUST clear matching Child device affinity, and reset MUST clear every
  device-affinity and pairing marker.
- **FR-012**: The persistent record MUST use a versioned, strictly validated schema containing only
  one role/profile owner, update time, synthetic origin, and prototype capability truth.
- **FR-013**: Invalid or unreadable local access data MUST fail closed without authorizing Parent
  or Child routes.
- **FR-014**: All new user-facing copy MUST be Arabic-first with equivalent English, logical RTL/LTR
  layout, 48dp interaction targets, and honest local-prototype wording.
- **FR-015**: The feature MUST add no production account, cloud sync, token storage, biometric,
  passkey, notification, analytics, networking, or second application.
- **FR-016**: Parent and Child route guards and all existing privacy/progression authorities MUST
  remain unchanged in strength.

### Key Entities

- **Device Affinity Record**: One validated device-local statement that this app installation
  should resume either the synthetic Parent or one configured paired Child; it is not a credential
  or authenticated session.
- **Primary Device Owner**: The single Parent or Child profile eligible for restart continuity on
  this app installation.
- **Temporary Parent Handoff**: In-memory state recording that Parent access began from a Child-owned
  installation and must return to that Child after Parent logout if the pairing remains valid.
- **Synthetic Access Authority**: A fresh in-memory Parent or Child session created through the
  existing access service after the device marker is validated.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A remembered Parent reaches Parent Home after restart with zero identifier/code
  interactions, and remains signed out after one explicit logout plus restart.
- **SC-002**: A paired Child reaches Today after restart with zero profile/credential interactions.
- **SC-003**: The same-device Child → Parent → Parent logout → same Child journey completes without
  Child PIN entry, re-pairing, or exposure of both authorities at once.
- **SC-004**: Automated tests cover valid restore, opt-out, explicit logout, child replacement,
  temporary handoff, revocation, reset, corrupt storage, and storage failure with zero regressions
  in existing access-control suites.
- **SC-005**: Arabic and English presentations pass resource parity, source accessibility, compact
  layout, formatting, typecheck, lint, and focused behavior checks.

## Assumptions

- “Different devices in the normal situation” means each physical app installation has its own
  local primary-role marker; P0 does not add remote account/device synchronization.
- Child registration refers to the existing Parent-approved synthetic pairing.
- Child-to-Parent switching is a temporary handoff, not Child logout or device unpairing.
- Parent remembrance is opt-in and unchecked by default; Child remembrance follows pairing by
  default because pairing itself is the Parent approval event.
- Restart restoration may create a new local synthetic authority because real secure token storage
  and production identity are outside P0.
