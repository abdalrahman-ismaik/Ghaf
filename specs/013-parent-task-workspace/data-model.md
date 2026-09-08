# Data Model: Parent Task Workspace

## SavedParentTaskTemplate

- `id`: locally generated opaque identifier
- `householdId`: synthetic household scope
- `categoryId`: one of the eight existing task categories
- `title`: bounded Arabic and English Parent wording
- `positiveAction`: bounded Arabic and English observable action wording
- `recurrence`: once or recurrent preference
- `createdAt`, `updatedAt`: valid timestamps
- `origin`: `parent_saved_local`

Validation rejects unknown keys, empty/oversized wording, duplicate normalized title/action pairs,
more than 20 records, unknown category/recurrence, or any authority/reward/media fields.

## TaskWorkspaceChildProjection

- Child identifier and display label
- optional current authoritative task projection
- prepared preview suggestions
- no sibling-private detail, evidence, notes, raw Seeds, or Parent saved wording in Child routes

Saved templates transition through create/update/read/delete only. Reuse returns a copy for Parent
editing; it does not transition task lifecycle state.
