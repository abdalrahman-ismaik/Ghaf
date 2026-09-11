# Device Access Contract v1

## Storage Boundary

Key: `ghaf.device-access.v1`

The value is one strict JSON object matching `DeviceAffinityRecordV1`. Unknown keys, missing fields,
unknown schema versions, invalid timestamps, and unsupported principals are rejected. Absence is a
valid signed-out state.

## Repository Operations

### `read()`

Returns one cloned validated record or `null`. Storage exceptions and invalid JSON return a typed,
non-retryable local transition error and authorize nothing.

### `rememberParent(family, now)`

Writes a Parent affinity bound to the current family creation timestamp. It accepts no session,
verification, reauthentication, or capability data.

### `rememberChild(family, childId, now)`

Requires `childId` to be configured and present in the family's approved paired IDs before writing
a Child affinity. It replaces any prior principal.

### `clear()`

Removes only the v1 affinity key. Explicit Parent logout calls this before reporting logout success.
Prototype reset calls it before clearing the family directory.

### `clearMatchingChild(childId)`

Removes the record only when its principal is that Child. Parent affinity and other Child affinity
records are unchanged.

## Controller Operations

### `resumeRememberedParent(now)`

Requires a restored valid completion receipt, a signed-out Parent controller, and no existing
Parent session. It asks the access service to issue and authorize a fresh synthetic Parent session.

### `resumeRememberedChild(childId, now)`

Requires a restored paired device for `childId`, a signed-out Child controller, and no existing
Child session. It asks the access service to issue and authorize a fresh synthetic Child session.

## Store Guarantees

- Startup validates record-to-family relationships before calling either controller resume method.
- Only a successful controller resume changes `activeExperience` from `signed_out`.
- Parent and Child authority are never held simultaneously.
- Parent remembrance is ignored during temporary access from a Child-owned installation.
- Parent logout clears Parent affinity first; temporary Parent logout retains Child affinity and
  revalidates pairing before Child resume.
- Child device revocation clears matching affinity.
- Reset clears affinity, family receipt, pairings, controller sessions, and temporary return state.

## Non-Contract

This contract does not provide identity verification, encryption, secure token storage, remote
account lookup, device attestation, cross-device sync, recovery, or production access control.
