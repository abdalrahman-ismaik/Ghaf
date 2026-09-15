# Feature 019 normalized family API

The executable TypeScript contract is `src/models/cloudFamily.ts`. Core rows use snake_case; commands and explicit extended-domain projections use camelCase. `src/features/cloudFamily/validation.ts` validates the transport against the expected authenticated role and user before the controller adopts a snapshot. No local prototype document is hydrated into this runtime.

## Public entry points

| RPC                            | Arguments                                                                             | Response                                       |
| ------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `public.ghaf_read()`           | None                                                                                  | `CloudSnapshot`                                |
| `public.ghaf_command(...)`     | `p_request_id uuid`, `p_expected_revision bigint`, `p_command jsonb` (`CloudCommand`) | `{snapshot: CloudSnapshot, result: object}`    |
| `public.ghaf_claim_child(...)` | `p_token text`                                                                        | `CloudSnapshot` for the enrolled Child session |

Each wrapper is SECURITY INVOKER with an empty search path and an explicit authenticated EXECUTE grant. Its private entry point is SECURITY DEFINER with an empty search path. Anonymous API-key-only requests have no access. Private normalized tables have RLS enabled and no client table privileges; internal helpers cannot be called with a forged actor. All identifiers for user-owned records are server UUIDs. Reference category/landscape/template/learning/badge IDs are finite strings. Timestamps are PostgreSQL ISO timestamps, dates are `YYYY-MM-DD`, and reward months are `YYYY-MM`.

`current_actor()` returns `{role, family_id, child_id, user_id}` using `auth.uid()`, the signed `session_id`, the matching live `auth.sessions` row, current user status, and approved owner access. A Parent has `child_id = null`; a Child has exactly one bound UUID. Mutable user metadata and client-supplied roles, owner IDs, or profile selections are never authority. Child access is rechecked against the current family owner's approval/status and active binding on every operation.

An approved Parent's first read creates an empty family/guardian boundary. There are no sample children, tasks, balances, Seed entries, completions, prizes, or League peers. The finite reference catalog supplies reusable content only.

## Revision and retry rules

Commands lock the family row, recheck the actor, check an actor-scoped request receipt, and compare the expected family revision before mutation. A successful command increments the revision once and commits its result receipt in the same transaction. Reusing the same request UUID with identical JSON returns the retained result and a fresh authorized snapshot, even if its old expected revision is stale. Reusing it with different JSON fails. A transport retry must retain the original request UUID and exact payload; an intentional new action gets a new UUID.

Draft terms also carry record-level guards: `task.update.expectedVersion`, `reward.edit.expectedVersion`, `goal.edit/approve/accept.expectedRevision`, `masroofi.controls.expectedVersion`, and `masroofi.promise.expectedTaskVersion`. The client retains the version of the record actually reviewed. It must not substitute a refreshed version into an old draft or automatically replay a stale edit.

Core failures use SQLSTATE `PT400` for bounded input/transition failures, `PT409` for revision/request conflicts, and `42501` for denied or revoked authority. Extensions also use `PT403` and bounded domain codes. The adapter maps schema-cache absence, network failure, and reauthentication requirements to safe UI states; raw SQL errors are never displayed.

## Core records and workflow

| Boundary             | Normalized authority                                                                   | Commands                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Family/profile       | `families`, `guardians`, `children`, `child_preferences`, `family_relatives`           | `family.update`, `child.create`, `child.update`                                                                             |
| Child access         | `child_invitations`, `child_bindings`                                                  | `child.invite`, `child.revoke`, separate `ghaf_claim_child`                                                                 |
| Permissions/consent  | `child_permissions`, `community_preferences`, `community_consents`                     | `child.permissions`, `community.participation`                                                                              |
| Authored tasks       | `tasks`, immutable `task_versions`, `task_steps`, `saved_templates`                    | `task.create`, `task.update`, `task.review`, `task.save_template`, `task.assign`                                            |
| Choice and execution | `assignments`, `submissions`, `adjustments`, `routines`                                | `assignment.accept/start/help/help_resolved/resume_retry/submit`, `adjustment.request/propose/accept/keep`, `routine.phase` |
| Confirmation         | `check_ins`, `recognitions`                                                            | `checkin.retry`, `checkin.confirm`, `checkin.praise_presented`, `recognition.apply`                                         |
| Permanent progress   | `seed_entries`, `landscape_events`, filtered canopy/circle/community events, `reveals` | Recognition transaction; `reveal.acknowledge` records only dismissal                                                        |
| Legacy continuity    | `workspace_imports`, `legacy_records`; original `public.account_workspaces` retained   | `workspace.import`, `legacy.convert`                                                                                        |

Family profiles preserve custom interests, hobbies, support and accessibility wording, personalization preference, language, avatar, guardian names and relative/rhythm metadata. Imported unknown ages remain null and cannot authorize assignment, enrollment or money features until a Parent completes the profile. The 9–11 age band alone cannot establish 10+ eligibility; the persisted Parent attestation is additionally required.

Task versions preserve title, positive action, why it matters, definition of done, ordered steps, content locale, permitted help, supervision, full safety fields, category/landscape, recognition mode, routine phase, fixed award, privacy, recurrence and eligibility provenance. Custom tasks supply explicit safety content. Template edits retain the Parent's exact wording but lose money/League eligibility unless their complete canonical content and policy fields still match the server catalog. Unknown content never acquires eligible provenance from a category label alone.

`draft → reviewed → assigned → chosen → in_progress → submitted → confirmed → recognized` is the ordinary journey. Child submission creates no progress. A kind retry records an observation and a separate next submission; it never overwrites the prior attempt or reduces the accepted award. Allowed help earns the same fixed award. The Parent records action-focused praise, marks it presented, then applies recognition. Recognition atomically inserts the unique receipt, eligible Seed/landscape events, filtered shared events, a private reveal, and extension callbacks. A repeat recognition returns the original receipt, without another credit.

Adjustments require the still-unaccepted assignment. The Parent proposes another immutable version; the Child accepts it or keeps the original. Previously agreed assignment/version money promises remain immutable history and cannot pay a different version. Routine phase review affects a future assignment only. Acquisition may award the fixed Seeds; maintenance and recognition-only award zero. There is no deletion or deduction of earned progress.

Result objects use snake_case identifiers such as `child_id`, `task_id`, `assignment_id`, `submission_id`, `check_in_id`, `adjustment_id`, `recognition_id`, or `saved_template_id`; acknowledgement commands return `{ok:true}`. Invitation creation returns a plaintext `token` and `expires_at` only to the requesting Parent response. Snapshots never contain invitation tokens or token hashes.

## Read projections

Every snapshot includes all required arrays, even when empty; `schema_version` is 1. The top-level and family revisions agree. Parent task rows include every immutable version so saved templates, assignments, and receipts remain resolvable by `(id, version)`. Child task rows include only versions referenced by their own assignment, adjustment, submission or recognition. The Child receives no sibling profile, task, money, saved-template inventory, imported planning record, or Parent invitation inventory.

The server returns exactly five landscape rows per visible Child, including zeros, with stages at 20/60/120/200 cumulative Seeds. Impact Path stations are server-derived at 120/132/144/156/168/180 lifetime Seeds. Neither UI garden components nor threshold text is an unlock authority. Private reveal acknowledgements do not affect awards. Permission rows default false; community participation defaults paused. Continued consent permits only future eligible Green contributions; consent changes never backfill prior activity or erase earned evidence.

`extras` contains Family Rewards, Masroofi, study plans, academic goals, learning and League projections. Family Reward amounts remain private to the family. A Child Masroofi promised row omits `amountFils` until credited; the server never merely hides it with UI styling. Child projections omit stale unearned task-version promises. Cards explicitly carry `origin: 'simulated'`, `controlsVersion` and server-derived `ageEligible`; they do not represent custody, banking or payment rails. A truthful age correction may make an existing card ineligible for new spending, funding or promises while preserving its earned balance and ledger. Purchases use finite server catalog fixtures and integer fils.

Learning packages project server `unlockedChildIds`. Learning/accessible-route completion creates no Seeds. League memberships project server `eligibleAssignmentIds`; foreign households expose only approved nickname, avatar, rank, score and confirmed Leaves. No foreign UUIDs, task content, Seeds, age or money are projected in ranking rows. Five nominated Leaves cap score at 100, tied scores share rank, and extra tasks do not improve rank.

## Child enrollment and sensitive Parent actions

The Parent creates a high-entropy expiring invitation for a fully configured owned Child. A distinct authenticated anonymous installation claims it. The invitation hash, binding and claim are persisted transactionally; a second installation cannot reuse it. An idempotent retry by the already-bound session returns the same authorized view. Parent revocation disables the binding without deleting the Child's records. Selecting a Child UUID under a Parent session never creates Child authority.

Sensitive changes require a signed password authentication-method (`amr`) timestamp within five minutes. A refreshed token's `iat` does not satisfy this requirement. Permissions and community consent use the core fresh-Parent helper; extensions reuse it for their sensitive promise/control changes. This is a server requirement, not a client acknowledgement checkbox.

## Extension integration

The core migration creates replaceable private hooks with these exact signatures:

```sql
ghaf_private.read_extras(p_family_id uuid, p_child_id uuid, p_role text) returns jsonb
ghaf_private.command_extras(p_command jsonb, p_family_id uuid, p_child_id uuid, p_role text, p_user_id uuid) returns jsonb
ghaf_private.after_recognition(p_receipt_id uuid) returns void
ghaf_private.require_fresh_parent(p_user_id uuid) returns void
```

The later extension migration replaces the hooks. `command_extras` runs under the core family lock, actor checks, request receipt and revision transaction; the request UUID is available as transaction-local `ghaf.request_id`. `after_recognition` reads the immutable receipt by UUID in that same transaction. Any callback failure rolls back recognition and all its side effects. Core `children`, `assignments` and `recognitions` have `(id,family_id)` uniqueness for compound ownership foreign keys. Extensions cannot independently mint a core recognition or substitute a different task version.

## Legacy import and deployment boundary

Import locks the existing owner's account workspace and imports real member IDs and task/study planning facts once. It is additive even if normalized children already exist: the combined profile count may not exceed 20, and an existing UUID collision fails before any insert. Current profiles and nonempty family names are never overwritten, and the normalized family UUID remains stable. The source workspace and its original JSON are preserved, with an import receipt recording source revision, fingerprint and counts. A cutover trigger blocks further writes through the old workspace API after import; it does not delete the source. Completed legacy planning facts do not fabricate Child submissions, Parent praise, Seeds, rewards or money. Conversion creates a fresh reviewed workflow beginning with a draft and retains the legacy record.

Migrations and database tests are additive and locally verifiable. Hosted deployment, actual multi-device behavior, physical Android acceptance and named Arabic/UAE review require their own recorded evidence. Reference content and a passing isolated database harness do not establish those results.
