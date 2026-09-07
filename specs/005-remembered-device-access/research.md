# Research: Remembered Device Access

## Decision 1: Persist affinity, never a session

**Decision**: Add a separate versioned record containing one Parent or Child principal reference,
the family creation binding, update time, and prototype truth fields. Resume always creates a fresh
in-memory synthetic session.

**Rationale**: Existing sessions include capabilities, expiry, and identifiers and are intentionally
in-memory. Persisting them would falsely imply secure refresh-token storage. A non-authorizing
affinity record delivers the demo continuity requested while keeping all route guards dependent on
fresh controller authority.

**Alternatives considered**:

- Persist the current session: rejected because it weakens the truth and expiry boundaries.
- Add fields to local-family schema 2: rejected because it couples access lifecycle to family data
  and requires an unnecessary migration of the stable directory.
- Use Zustand persistence for the whole store: rejected because it would serialize far more private
  and transient state than authorized.

## Decision 2: One principal per physical installation

**Decision**: The record is a discriminated Parent-or-Child union. A successful Child pairing
replaces Parent affinity on that installation. Parent remembrance cannot replace a Child-owned
installation during temporary access.

**Rationale**: This directly encodes the normal separate-device model and makes mutual exclusion
structural. It also avoids presenting an in-app role picker as account switching.

**Alternatives considered**:

- Remember both roles: rejected because startup becomes ambiguous and invites accidental access.
- Remember all paired Children: rejected because it would still require a profile chooser and
  weakens the user's “registered on a device” expectation.

## Decision 3: Child pairing is the remembrance consent event

**Decision**: Completed Parent-approved pairing automatically makes that Child the installation's
primary profile. Parent remembrance stays explicitly opt-in and unchecked.

**Rationale**: Pairing is already a Parent-authorized device relationship. Requiring another Child
toggle adds friction. Parent access is broader, so an explicit choice is the safer MVP default.

## Decision 4: Child-to-Parent handoff is explicit and in memory

**Decision**: Add a dedicated Child command for Parent access. It terminates Child authority,
retains pairing/affinity, and stores only an in-memory return Child ID. Parent logout resumes that
Child only after revalidating the pairing.

**Rationale**: Generic logout currently conflates leaving a role with switching roles. A distinct
command makes the user-visible promise accurate and allows explicit Parent logout to keep its
strong meaning.

**Alternatives considered**:

- Keep the Child session alive under Parent access: rejected because two live authorities on one
  device violate separation.
- Persist the temporary return state: rejected because the durable Child marker already makes app
  restart safely return to Child; temporary Parent authority must never survive restart.

## Decision 5: Synchronous startup restore

**Decision**: Use the existing synchronous storage abstraction during store bootstrap, after local
family/pairing restoration and before route rendering.

**Rationale**: Native Expo SQLite KV and web localStorage are already synchronous here. Restoring
before the Welcome route evaluates avoids new loading UI and access-screen flashing.

## Decision 6: Fail-closed mismatch, non-blocking remember write

**Decision**: Corrupt/read-failed/mismatched markers authorize nothing. A remember-write failure
does not undo an otherwise successful current login, but the stored view becomes unavailable and
the UI must not claim persistence. Marker-clear failure blocks explicit Parent logout so stale
automatic access cannot be reported as removed.

**Rationale**: These choices preserve privacy on restore/logout without making an optional
convenience preference a prerequisite for the current valid session.

## Decision 7: Prototype-only multi-device claim

**Decision**: Describe the result as one primary experience per installation. Do not claim real
Parent/Child cross-device synchronization.

**Rationale**: Current family, task, pairing-request, and session services are local/in-memory.
Production separate-device operation needs a backend, installation identity, secure token storage,
and synchronization, all outside P0.
