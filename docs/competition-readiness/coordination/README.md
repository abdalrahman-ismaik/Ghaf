# Shared coordination for sustained Ghaf sessions

This is a lightweight file protocol for four independent Codex sessions and their scoped helpers.
It supports long work batches, visible progress and recovery after interruption. It is not a
background scheduler, message service, file lock or guarantee of uninterrupted model execution.

## One live location

Every session uses this **same absolute directory**, including sessions working in other worktrees:

```text
/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/
```

The copy under `Ghaf-demo-systems`, `Ghaf-ui-studio` or `Ghaf-qa-rehearsal` is only a Git snapshot.
Never write progress to those copies or expect them to synchronize. Source code stays in each
assigned worktree; coordination updates go to the canonical directory above. On another machine,
the operator must choose and record one reachable shared location before this protocol can work.
There is no cross-machine synchronization in this package.

| File                                                            | Sole writer once the work period starts  | Purpose                                                                                            |
| --------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [BOARD.md](BOARD.md)                                            | Session A                                | Mission, ordered tasks, dependencies, source grants, resource allocation and integrated candidates |
| [STATUS-A.md](STATUS-A.md)                                      | Session A lead                           | Integration progress, findings, messages, acknowledgments and resume cursor                        |
| [STATUS-B.md](STATUS-B.md)                                      | Session B lead                           | Core implementation progress, evidence, helpers and blockers                                       |
| [STATUS-C.md](STATUS-C.md)                                      | Session C lead                           | Design decisions, screen work, captures, helpers and blockers                                      |
| [STATUS-D.md](STATUS-D.md)                                      | Session D lead                           | Independent checks, defects, native gaps and rehearsal results                                     |
| This protocol and [resource assessment](resource-assessment.md) | A through a documented protocol revision | Operating rules; never changed silently by a worker                                                |

The files are initialized as **NOT STARTED**. They do not claim that four sessions, helper agents,
future tasks or human reviews are already running. Root prepared the templates; A/B/C/D take their
respective file ownership only when actually launched. Read `TEAM_OWNERSHIP.md` and preserve later
ownership changes rather than assuming this initial snapshot is current.

## Start and register

1. Start A first. It verifies branch/HEAD, current changes, mission scope and the latest instructions.
   A publishes a real board revision, records its instance and activates only eligible tasks.
2. Each lead registers a unique run/instance label, actual worktree, branch, HEAD and UTC update time
   in its own status. It checks whether a prior instance of that role still holds work. A second
   Session B cannot silently become the writer of `STATUS-B.md` or the first B's source files.
3. A grants exact paths and a task batch to each lead. An existing-spec repair can use existing
   authority; new behavior requires the appropriate accepted Spec Kit story and committed contract.
   Read-only audits can proceed while implementation authority or a human owner is unresolved.
4. Workers acknowledge the grant/revision in their status and begin eligible work. A does not need
   to approve each ordinary edit, check or helper spawn already covered by that grant and quota.

In a restricted CLI workspace, launch B/C/D with the canonical coordination directory explicitly
included using `--add-dir`; see the [launch guide](../orchestration/README.md). A file permission
error is not permission to bypass the sandbox. If the directory is unavailable, publish a local
handoff for the operator and continue only independent read-only work until coordination is restored.

## Sustained execution loop

At start, after resume/compaction, before claiming the next task, before a scope change, after a
check/commit, and before integration, read BOARD plus all four status files. During a long active
step, check for relevant updates at the next safe boundary, approximately every ten minutes.
This cadence is an operating target, not an installed timer or guaranteed heartbeat.

For each task, follow this loop:

1. Confirm its owner, dependencies, accepted contract, baseline, exact paths and acceptance criteria.
   A `READY` task with that lead's explicit grant can start after the lead acknowledges it in status.
2. Split useful independent work into bounded helpers within the lead's allocated quota. Keep
   integration and shared-file decisions with their named owner.
3. Complete the small slice. Investigate a failure and correct its cause; do not weaken tests or
   add unrelated features to make progress appear larger.
4. Run proportional checks against the exact source state. Reserve heavy jobs before starting them.
   Save the command, result, commit/worktree state and artifact path.
5. Make a cohesive local commit when the slice is verifiable. Publish its hash, required base,
   changed paths, evidence, known gaps and an explicit source-path release. Human acceptance may
   still be pending; do not call an agent review a student review.
6. Read the board again and continue the next eligible task in the already assigned batch. Do not
   end after the first fix, after writing a plan, or merely because another lane awaits review.

Work through the approved queue rather than trying to fill an arbitrary number of hours. If one
task is blocked, record the precise dependency and move to another eligible task. Missing phones
block native acceptance, not source inspection, focused tests, documentation or browser diagnosis.
Pending student review blocks acceptance of that slice, not separately authorized independent work.
Do not pile up dependent unreviewed changes or generate the whole application under this rule.

If the next dependency is being produced by a verified active lead/helper, that is an in-flight
handoff, not a permanent external blocker. Continue useful review work or wait in bounded intervals
of at most sixty seconds, refreshing the board/status and respecting user-update requirements.
Do not end A's coordination run merely because a worker has not finished its current slice.
If activity stops or no eligible work/active handoff remains, record the exact unblock condition
and resume cursor, then hand back honestly. Files cannot wake a session that has ended; the operator
must resume it. Do not busy-poll, repeat passed tests, fabricate progress or sleep for hours merely
to appear active. User cancellation, tool limits, quota exhaustion and lost execution context can
also end a run; save the checkpoint whenever the runtime permits.

## Progress, findings and messages

Update the lead's status at every task transition, failure, important finding, handoff and helper
allocation change, and roughly every 10–15 minutes during substantial active work. Keep the user
informed separately at the cadence required by the session; a file update does not replace commentary.
Create a coherent checkpoint around thirty minutes when the work is actually validated, as required
by the repository. Do not split incomplete work or invent times to meet that interval.

Each status contains a short current snapshot plus dated findings and an outbox. Messages use
unique IDs such as `B-<actual-run-label>-001`, with recipient, type, task, exact request, relevant
paths/commit and any blocker. Record only real messages. The recipient acknowledges the ID in
its own status and records its response there; A reflects authoritative decisions in BOARD.
Keep unacknowledged messages and referenced findings. Do not overwrite another lead's status,
clear someone else's blocker, or edit a previous claim into a fabricated historical success.

Write a complete updated status using a temporary sibling file and atomic replacement when
practical, or make one small coherent edit. Readers encountering an incomplete document must retry
and must not infer ownership from a partial write. This is cooperative coordination, not a locking
service; one writer per file and explicit transfer are what avoid collisions.

## Ownership and task states

`PROPOSED → READY → RUNNING → IN_REVIEW → INTEGRATED → VERIFIED` describes the usual task path.
`BLOCKED` and `CANCELLED` preserve the last successful state and the reason. A records the board
state; workers report actual activity immediately in their own status while A catches up.
`IN_REVIEW` does not imply human acceptance, and `VERIFIED` must name the verified platform/scope.
An automated source task can be verified while a separate native release gate remains blocked.

No worker self-assigns an ungranted task or expands its paths because a backlog item looks useful.
Request a handoff through the outbox. A cannot revoke and reassign an active writer's files until
the writer acknowledges stopping and releases them, or the operator confirms the old process has
stopped. An old timestamp, closed chat window, failed test or silent agent is not a release.
Apply the same rule to helper slots and heavy jobs; inspect their actual process/task state.

No helper writes BOARD or lead status files. Leads own their helpers' exact file reservations and
publish those reservations. Read-only helpers can overlap source reads; two writers cannot own the
same file even when their intended functions differ. A controls shared store/registry/tokens/i18n
handoffs explicitly. Student names stay pending until supplied; never invent participation.

## Delegation and resource budget

The user's Codex configuration allows **ten helpers per session**. Four such sessions could have
forty helpers plus four leads. That is capacity, not a validated load target. Use the measured
starting budget in [resource-assessment.md](resource-assessment.md) and the current allocations
in BOARD. The sum of all live helper quotas must stay within the global helper budget. Count
descendants too; a helper cannot recursively spawn unless the lead explicitly reserves those slots.

Within its published quota, each lead may spawn helpers without a new user confirmation for
every task. Give each helper one concrete independent output, exact read/write paths, current
contract/commit, required evidence and a reminder that others are working. Keep useful local work
for the lead. Prefer separate research, domain tests, isolated UI components and independent review.
Do not spawn extra coordinators that simply repeat the same reading or split shared-file edits.

A allocates quotas through BOARD; each lead records actual helper IDs, scopes and statuses in its
own file. Releasing unused quota requires no live helper or descendant in that slot. Increase
quotas only after checking actual resource pressure and useful queued work. Do not launch all
forty merely because every session reports spare capacity. Model/API limits and usage costs are
separate from laptop memory; a large configured limit does not guarantee simultaneous execution.

Heavy local work needs a separate resource grant: full tests, exports, native builds, dependency
installs and browser/Metro process trees consume local resources independently of helper count. A
owns a single heavy-job slot initially and a separate limited preview/browser allocation. One browser means one owned browser session/process
tree, including its renderer/utility children; record its root PID or tool handle. Leads
request a slot in their outbox, record the actual job PID/session and release it after completion.
Do not use parallel test pools or nested npm installs to evade the job limit. Follow the resource
assessment's stop-and-measure guidance when memory, swap or responsiveness degrades.

## Integration and durable evidence

Worktree commits share Git objects but do not automatically update other working files. A reads a
candidate diff at its exact hash, validates its base/dependencies and required review status, then
integrates only that cohesive slice on `redesign/ui-experiments`. Preserve actual authorship and
resolve conflicts semantically. No push, main merge, deployment or history rewrite is authorized.
A may prepare an unaccepted local candidate for concrete review under the user's integration
authority while recording `human review: PENDING`, unless the applicable contract explicitly
requires prior human approval. Candidate preparation never establishes student acceptance or
release approval. Do not represent a dependent stack of unreviewed work as a finished feature.
D verifies the resulting integrated commit, not just the worker's earlier branch.

Source handoff includes branch/worktree/hash, dirty files, exact released paths, commands/results,
artifact paths, unresolved defects, human review and the next task. Put durable implementation
evidence in the worker's reserved versioned report so it accompanies the code. Ignored screenshots
stay local; record an absolute location and platform. Coordination files are a live working record,
not the only evidence of implementation or genuine student contribution.

A also owns the master `TEAM_OWNERSHIP.md` and AI assistance ledger. Each lead keeps exact prompts
and contribution detail in its own reserved versioned workstream report, then supplies the link
and commit for A to incorporate. Four workers must not all edit the master ledger independently.

Only A stages coordination records in the main checkout. Before a coordination checkpoint, ask
leads to finish and pause status writes briefly; obtain acknowledgments, stage the intended paths,
inspect the staged snapshot, commit, then resume updates. Never use broad `git add .` or reset a
worker's live file to a historical snapshot. Source integration can occur without freezing status
files when no coordination file is being staged or changed by that integration.

## Resume after interruption

Read the live board/status and actual Git/process state before acting. A last-known `RUNNING` state
is not proof its process still exists. Record whether a command/helper survived, preserve dirty
work, and reconcile any complete commit before rerunning anything. Do not reset, duplicate a
running build, reuse stale file grants or overwrite a newer status from another instance.

Use this continuation message, replacing the role:

```text
Resume Session B's assigned Ghaf batch. Read the canonical shared coordination directory at
/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/ and your current role prompt.
Reconcile BOARD, STATUS-B, Git HEAD/dirty files and any still-running commands/helpers. Continue
the next eligible preauthorized task with the current file grants and helper/resource budget.
Preserve all other work and pending human/native gates. Publish a new checkpoint before stopping.
```

Official [Codex guidance on long-running chats](https://learn.chatgpt.com/guides/best-practices#organize-long-running-chats)
describes resume, fork and context compaction. The shared files above are this project's explicit
recovery and collaboration design; they do not claim that separate chats share conversation memory
or automatically notify one another.
