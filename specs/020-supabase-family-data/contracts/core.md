# Core family RPC contract v1

All identifiers are provider/server UUID strings. Timestamps are ISO instants. No local
synthetic profile or session is accepted. Database errors expose only allowlisted codes:
`access_unavailable`, `family_unavailable`, `invalid_command`, `invalid_transition`,
`request_conflict`, `invalid_invite`, `rate_limited`. No offline command queue.

## Identity and snapshot

`ghaf_family_identity()` returns `{userId, role, familyId, childId}`. An approved
authenticated adult without a family has `role:"parent"`, `familyId:null`, `childId:null`.
A Child is admitted only through a live provider session bound to an active membership.

`ghaf_family_snapshot(p_family_id uuid default null)` returns:

```ts
interface Snapshot {
  schemaVersion: 1;
  familyCanopyContributions: number;
  deletedMemoryTaskIds: string[];
  actor: { userId: string; role: 'parent' | 'child'; familyId: string | null; childId: string | null };
  families: { id: string; name: string; revision: number }[];
  family: { id: string; name: string; revision: number } | null;
  members: { id: string; userId: string; role: 'parent' | 'child'; childId: string | null; active: boolean }[];
  children: { id: string; familyId: string; displayName: string; ageBand: '6_8' | '9_11' | '12_14'; active: boolean }[];
  tasks: {
    id: string; familyId: string; childId: string; catalogId: string;
    status: 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'praised' | 'recognized';
    revision: number; stepStates: Record<string, 'done' | 'skipped'>; helpRequested: boolean; praise: string | null;
    createdAt: string; submittedAt: string | null; recognizedAt: string | null;
    template: TaskTemplate;
  }[];
  recognitions: {
    id: string; taskId: string; childId: string; seeds: number;
    landscapeId: 'ghaf' | 'samar' | 'sidr' | 'date_palm' | 'mangrove';
    canopyContribution: number; createdAt: string;
  }[];
  memories: { id: string; taskId: string; childId: string; title: { ar: string; en: string }; createdAt: string }[];
  catalog: TaskTemplate[];
}
```

`TaskTemplate` is the existing global reference shape; its `origin:"prepared"` describes
curated catalog content, not a sample assignment. The catalog includes the existing 24
entries and original P0 task. Empty accounts have empty household arrays and no receipts.
Children receive only their own private rows; members is empty for Children. Totals are
derived from immutable server receipts, never accepted from clients.

## Commands

`ghaf_family_command(p_family_id uuid, p_request_id uuid, p_command jsonb)` returns
`{snapshot:Snapshot,result:object|null}`. `p_family_id` is null only for `create_family`.
The exact accepted commands are:

```ts
type Command =
  | { type: 'create_family'; name: string; displayName?: string }
  | { type: 'rename_family'; name: string }
  | { type: 'invite_parent' }
  | { type: 'add_child'; displayName: string; ageBand: '6_8' | '9_11' | '12_14' }
  | { type: 'rename_child'; childId: string; displayName: string }
  | { type: 'invite_child' | 'revoke_child'; childId: string }
  | { type: 'assign_task'; childId: string; catalogId: string; content?: { title?: {ar:string;en:string}; positiveAction?: {ar:string;en:string} } }
  | { type: 'edit_task'; taskId: string; expectedRevision: number; content: { title?: {ar:string;en:string}; positiveAction?: {ar:string;en:string} } }
  | { type: 'accept_task' | 'start_task' | 'request_help' | 'submit_task' | 'recognize_task' | 'save_memory' | 'delete_memory'; taskId: string; expectedRevision: number }
  | { type: 'praise_task'; taskId: string; expectedRevision: number; praise: string }
  | { type: 'set_step'; taskId: string; expectedRevision: number; stepId: string; state: 'done' | 'skipped' };
```

Parent owns setup, assignment, praise, recognition and memory mutations. Child owns only
accept/start/help/step/submit for their assigned task. Optional/adult/conditional steps
may be explicitly skipped; mandatory action steps must be done before submission.
Help never reduces the award. The approved reference controls award/privacy/landscape.
Praise and recognition are separate ordered commands. Recognition-only/maintenance
create zero Seeds and growth. Memory requires eligible confirmed Green household activity;
deletion retains a private tombstone so retry cannot recreate it.
Task revision mismatch fails with `request_conflict`; an exact committed request replay
does not repeat its mutation. Copy edits are permitted before acceptance and cannot
change safety, privacy, age, awards, steps or other template authority. Parent display
name comes from explicit create input or saved account profile, never a sample default.
Only the title may change; any submitted positiveAction must equal the canonical action.
Arbitrary new activities cannot reuse a catalog activity's award or privacy classification.
`praise` shows the saved Parent's actual words to the authorized Child. Deleted-memory task
IDs are projected only to their Parent or own Child and prevent unusable save affordances.

Every request UUID binds to the authenticated user, family and exact JSON command.
Changed payload/family rejects; replay checks current authorization. Receipt snapshots
are not replayed: current authorized snapshot is returned with the original result.
`invite_child` returns `{token,expiresAt,childId}` once. Only token SHA256 is stored;
replay returns `{tokenUnavailable:true,expiresAt,childId}`. Replace a lost invitation
using a new request UUID; creating it revokes older unused tokens for that Child.

`ghaf_redeem_family_invite(p_token text,p_request_id uuid)` returns
`{snapshot:Snapshot,result:null}`. The caller must own a live anonymous Auth session.
Tokens expire in ten minutes, are single-use and allow same-session exact retry.
New sessions cannot reuse them. Parent revocation disables memberships and invitations.
The same redemption RPC accepts `invite_parent` tokens only for approved non-anonymous
adult accounts; it creates a Parent membership without changing the founding owner.
Parent invitations return `{token,expiresAt,childId:null}` once, with the same replay rule.

## Shared server helper

`public.ghaf_family_actor(p_family_id uuid)` returns one SQL row with
`role text, child_id uuid, member_id uuid, auth_user_id uuid`. It verifies live Auth
user/session, approved founding adult, active family/membership and exact Child session.
Other security-definer domain RPCs may call it; it accepts no actor/role parameter.
It does not authorize an arbitrary childId: domain RPCs must also enforce own-Child
scope for Child actors and composite family/Child references. `app_families.revision`
is the shared refresh revision; commands lock the family row before mutation.

All app tables have RLS and no direct client mutations. Core RPCs validate commands,
then lock and atomically mutate immutable evidence and the idempotency receipt. Public
reference catalog is the only seeded data. Existing account workspaces are preserved;
explicit legacy import is a separate additive command and may never award past growth.

## Private custom tasks and routine review (migration 005)

Snapshot adds `customTemplates: {id:string;familyId:string;revision:number;
template:TaskTemplate;createdAt:string;active:boolean}[]`. Only Parents receive this
library; Children receive an empty array and only their assigned task copies. A
custom assignment uses `catalogId: 'custom_' + template UUID` in the DTO, distinct
from the global reference catalog. The SQL source is a private custom-template FK.

The same command RPC additionally accepts:

```ts
type ExtensionCommand =
  | { type:'create_custom_template'; title:{ar:string;en:string};
      positiveAction:{ar:string;en:string}; categoryId:TaskCategoryId;
      recurrence:'once'|'recurrent'; reviewed:true }
  | { type:'assign_custom_task'; childId:string; templateId:string }
  | { type:'remove_custom_template'; templateId:string; expectedRevision:number }
  | { type:'begin_maintenance'; taskId:string; expectedRevision:number };
```

Creation returns `{templateId}` and assignment returns `{taskId}`. Every operation
is Parent-only, family-scoped and receipt-idempotent. Custom definitions require
explicit review; their agreed action becomes one actual mandatory completion step.
The server fixes recognition-only, Child/guardian privacy, zero Seeds, zero canopy
and no Green memory. No supplied award or privacy override is accepted. `prepared`
is the existing TaskTemplate origin literal for the neutral policy wrapper, not an
AI label or an assertion that user-authored action text belongs to the catalog.
Retirement preserves already assigned frozen content; the active library limit is
the existing twenty-template limit. No sample custom templates are inserted.

Maintenance requires three confirmed completions of the same recurrent fade-first
reference task, a still-unaccepted assignment, and the migration 003 helper
`ghaf_require_recent_parent_password`: live Parent plus signed password AMR within
120 seconds. Missing/stale proof fails with `PT428 / reauth_required`. Review
changes that assignment and later assignments to zero-award maintenance. It never
changes accepted assignments, earned receipts or past growth. Retrying an older
assignment request cannot apply a later phase decision retrospectively.

Migration 005 depends on 003 for the fresh-password helper. It wraps the deployed
core RPC through a private, non-client-executable original implementation and
preserves all existing core authorization, validation and task interactions.
