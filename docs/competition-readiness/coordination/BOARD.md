# Ghaf shared mission board

**Sole live writer: Session A.** All leads read the canonical absolute copy at
`/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/BOARD.md`.
Follow [the coordination protocol](README.md). Worktree copies are historical snapshots.

## Mission control

| Field                             | Current value                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Board revision                    | 0 — prepared template, not an activated run                                                                  |
| Mission state                     | NOT STARTED                                                                                                  |
| A instance / last real update UTC | Not registered / no live update yet                                                                          |
| Integration branch / worktree     | `redesign/ui-experiments` / `/home/smyk/projects/Ghaf`                                                       |
| Baseline                          | A must record actual HEAD at activation; initial prompt package was `1c23ed3`                                |
| Accepted implementation contract  | Existing approved specifications only; no new persistence/memory contract accepted by this template          |
| Integrated candidate / D target   | None published for this work period                                                                          |
| Human owner / review status       | Awaiting actual owner; no review recorded                                                                    |
| Competition target                | 2–3 minute primary Android journey; secondary independently validated; September 16 subject to qualification |
| Work window                       | Continue the assigned batch while eligible work exists; no promised number of unattended hours               |

A activates a run by checking current instructions/ownership, registering its instance, recording
actual baseline/contract references, and incrementing the revision. Never overwrite a later active
board with this starter state. B/C/D may perform read-only orientation before activation; source
writes and helpers require their recorded grant/quota.

## Session status

| Lead | Live record                | Initial state |
| ---- | -------------------------- | ------------- |
| A    | [STATUS-A.md](STATUS-A.md) | NOT STARTED   |
| B    | [STATUS-B.md](STATUS-B.md) | NOT STARTED   |
| C    | [STATUS-C.md](STATUS-C.md) | NOT STARTED   |
| D    | [STATUS-D.md](STATUS-D.md) | NOT STARTED   |

## Resource allocations

The initial budget comes from [the observed WSL resources](resource-assessment.md).
Allocations below become live only when A activates the board. A records every quota transfer;
leads report actual helper IDs and descendants in their own status.

| Resource                       | Starting allocation                                 | Current holder / release                                        |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------------------------- |
| Global helper budget           | 4 helpers total across A/B/C/D                      | None running in this planned mission                            |
| A helper quota                 | 1                                                   | Unclaimed                                                       |
| B helper quota                 | 1                                                   | Unclaimed                                                       |
| C helper quota                 | 1                                                   | Unclaimed                                                       |
| D helper quota                 | 1                                                   | Unclaimed                                                       |
| Conditional expansion          | A may measure and increase gradually toward 8 total | Not measured under the proposed full workload; no expansion yet |
| Per-session configured ceiling | 10 helpers; count descendants                       | Capacity preserved; not an instruction to fill every slot       |
| Heavy local job                | 1 globally                                          | FREE; no command/PID registered                                 |
| Preview lane                   | 1 Metro plus 1 browser                              | FREE; no command/PID registered                                 |

Before reallocating, require explicit helper/job completion or confirmed process termination.
An old status timestamp never releases a slot. Keep quota sums at or below the global budget.

## Ordered work queue

All starter rows are proposals. A turns a row `READY` only after publishing its exact file grant,
authority, dependencies, baseline and acceptance. Workers do not need a second confirmation after
that grant to begin or move to another eligible assigned row.

| Order / task | Owner | State    | Dependency / authority                                       | Required output or acceptance                                                                            |
| ------------ | ----- | -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 0 / A-001    | A     | PROPOSED | Current user mission and actual baseline                     | Activate coordination; establish bounded queue, ownership and build/review gaps                          |
| 1 / B-001    | B     | PROPOSED | A-001; read-only core audit                                  | Trace reload loss, current authorities and smallest recovery contract; report exact source/evidence      |
| 1 / C-001    | C     | PROPOSED | A-001; read-only visual diagnosis                            | Compare three directions once on the same representative states; recommend measured component priorities |
| 1 / D-001    | D     | PROPOSED | A-001; exact candidate and resource grants                   | Independent baseline/acceptance matrix; distinguish source/browser/native evidence                       |
| 2 / A-002    | A     | PROPOSED | B-001/C-001/D-001 relevant findings                          | Publish smallest accepted contract and concrete implementation batch; resolve dependencies               |
| 3 / B-002    | B     | PROPOSED | A-002 accepted recovery story and exact paths                | Small restart-safe progression/reset slice with meaningful regression evidence                           |
| 3 / C-002    | C     | PROPOSED | Chosen direction; accepted component scope                   | One approved core screen/component slice with bilingual state evidence                                   |
| 4 / D-002    | D     | PROPOSED | A-published integrated candidate                             | Reproduce target defects and validate the exact resulting candidate; return findings                     |
| 5 / B-003    | B     | PROPOSED | Accepted rationale/memory story; prior dependencies reviewed | Next small assigned core slice; no invented recommendation or new reward authority                       |
| 5 / C-003    | C     | PROPOSED | Implemented contract and exact assigned next surface         | Continue selected core UI batch; no repeated direction exploration or unrelated rewrite                  |
| 6 / A-003    | A     | PROPOSED | Reviewed integrated candidate and build prerequisites        | Freeze candidate; publish exact APK/build and operator/Q&A handoff; no native pass inferred              |
| 7 / D-003    | D     | PROPOSED | A-003 candidate and available hardware                       | Native evidence and ten actual rehearsals; missing hardware/reviews remain blocked                       |

These rows are not completed Spec Kit stories. A may split, reorder or defer them within the
authorized mission, recording why. Do not activate new behavior merely by marking a row `READY`.
Maps, Google OAuth, payment, free chat and live synchronization remain outside this batch.

## Exact source grants

No source grants are active yet. A publishes one row per exact file/directory boundary, with its
worktree, lead/helper writer, task, grant revision and prior-writer release. Shared store, registry,
tokens, localization and configuration require explicit serialized transfer.

| Grant / task | Worktree | Exact paths | Lead / actual writer | State       | Release evidence |
| ------------ | -------- | ----------- | -------------------- | ----------- | ---------------- |
| None         | —        | —           | —                    | NOT GRANTED | —                |

Useful initial report-only boundaries, to be explicitly granted at activation:
`docs/competition-readiness/workstreams/a-contract.md`, `b-recovery-audit.md`,
`c-design-comparison.md`, and `d-baseline.md` in their assigned source worktrees. These are proposed
paths, not existing evidence. BOARD/status ownership follows the protocol separately.

## Integration and review register

| Candidate / task | Worker commit and required base | Source review | Human review | A integrated commit | D evidence / scope | Remaining gates                                                     |
| ---------------- | ------------------------------- | ------------- | ------------ | ------------------- | ------------------ | ------------------------------------------------------------------- |
| None             | —                               | NOT RUN       | NOT RUN      | —                   | NOT RUN            | APK, native, memory/recovery and relevant content gates remain open |

A never treats a worker's `IN_REVIEW` as integrated or a browser pass as native acceptance.
Record exact hashes and actual review actors. Keep completed task evidence; do not rewrite history.

## Decisions, blockers and acknowledgments

No live decisions or messages yet. A records real decisions with an ID, relevant message IDs,
reason, affected tasks/files, contract revision and timestamp. Read all status outboxes before
changing a grant. An unresolved dependency goes here with an owner and exact unblock condition;
other eligible work continues.

## Freeze and resume cursor

No active cursor yet. A records the next eligible tasks, pending handoffs, active helpers/jobs,
last integrated candidate and any actual stop condition. Feature freeze target: September 14;
rehearsal September 15; September 16 demo subject to qualification. These dates do not justify
claiming an unperformed pass or manufacturing continuous work.
