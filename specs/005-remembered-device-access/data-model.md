# Data Model: Remembered Device Access

## DeviceAffinityRecordV1

One optional record exists per app installation under `ghaf.device-access.v1`.

| Field | Type | Rule |
| --- | --- | --- |
| `schemaVersion` | `1` | Exact value; unknown versions fail closed |
| `principal` | `ParentAffinity \| ChildAffinity` | Exactly one discriminated principal |
| `familyCreatedAt` | ISO timestamp | Must equal the current local family creation time |
| `updatedAt` | ISO timestamp | Required valid timestamp |
| `origin` | `local_demo` | Exact prototype origin |
| `capabilityTruth` | `local_prototype_not_authentication` | Exact honest label |

No additional fields are accepted.

## ParentAffinity

| Field | Type | Rule |
| --- | --- | --- |
| `role` | `parent` | Discriminator |
| `parentId` | `parent_al_noor` | Must match the current synthetic family |
| `householdId` | `household_al_noor` | Must match the current synthetic family |

## ChildAffinity

| Field | Type | Rule |
| --- | --- | --- |
| `role` | `child` | Discriminator |
| `childId` | `child_salem \| child_alya` | Must be configured and actively paired |
| `householdId` | `household_al_noor` | Must match the current synthetic family |

## DeviceAccessView

Store-facing projection:

- `status`: `ready | unavailable`
- `record`: validated record or `null`
- `primaryRole`: `none | parent | child`
- `primaryChildId`: exact Child ID only for Child affinity
- `storageTruth`: `device_local_demo_only`
- `productionAuthentication`: `false`

## TemporaryParentAccess

In-memory store state only:

- `returnChildId`: configured paired Child ID
- `startedAt`: deterministic local prototype time

It is created only from an active matching Child authority, survives route changes in the current
runtime, and is cleared after cancel, Parent logout, failed resume, revocation, or reset. It is
never serialized.

## Validation Relationships

```text
Parent affinity
  -> local family exists
  -> familyCreatedAt matches
  -> parentId + householdId match
  -> restored completion receipt is valid
  -> fresh Parent session may be minted

Child affinity
  -> local family exists
  -> familyCreatedAt matches
  -> householdId matches
  -> childId is configured
  -> pairedChildIds includes childId
  -> restored device status is paired
  -> fresh Child session may be minted
```

The record never directly authorizes a route.

## State Transitions

| Current | Event | Next | Persistent effect |
| --- | --- | --- | --- |
| none | Parent enters, opt-in false | Parent active | none |
| none | Parent enters, opt-in true | Parent active | Parent affinity written |
| Parent affinity | Parent logout | signed out | affinity removed first |
| any | Child pairing completes | Child active | Child affinity replaces prior record |
| Child active | begin Parent access | signed out / Parent entry | Child affinity retained |
| temporary Parent | Parent enters | Parent active | Child affinity retained |
| temporary Parent | Parent logout | Child active | Child affinity retained |
| Child affinity | Parent revokes matching device | signed out or Parent active | affinity removed |
| any | prototype reset | signed out | affinity and family/pairing data removed |
| any | corrupt/mismatched startup marker | signed out | no authority; marker may be cleared |
