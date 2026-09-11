# R002a Child Task screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected state specification for one existing /child/task lifecycle.

## Evidence

All evidence is under `docs/design/stitch/releases/ghaf-r002/` in the original worktree.

| State          | Candidate                               | PNG dimensions / SHA-256                                                    | HTML SHA-256                                                     |
| -------------- | --------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Ready          | ghaf_child_task_detail_ready_final      | 706×1600 / e91d29d9232b684233518919d8838dd5f8eccede0ff58151fc9827653abb3398 | a6272d051456d8f66e8d553c615a8b603054280933f260413ae0a94832bfb7bf |
| Active 0/2–2/2 | ghaf_child_task_active_final_2          | 706×1600 / 08bd384426fdc537007a9cfdb1d7479b4166723b6e92de80e942f172a355c2a5 | 3e10662f8621e032567d5b0466736e5423e6b3a31a899fb894558174f1160d19 |
| Confirmation   | ghaf_child_task_completion_confirmation | 706×1600 / 19f4b15a07ca15def3a9948c5b966b305afa95132df20b663e50937fde322bd8 | 2a774ff4f014d96acd21ad5930419c8a38ea33e939eb08718e5aaf1b20db4935 |
| Waiting        | ghaf_waiting_for_parent_approval_fixed  | 706×1600 / 0e7af09959956a84a310896490560f5a7579846ceadfd2deb9312365b5458513 | 0ba9886796930f1e8bd9d2afe2a82a4b0851700f5f33cedaddef7e9be7558833 |

The selected HTML titles identify ready, active, completion confirmation, and waiting. Confirmation/waiting HTML disables viewport zoom; native implementation explicitly rejects that behavior. Remote images are composition evidence only.

## State flow

Ready uses the existing assigned task and displayed award, with Back on physical right and the existing start action. Active uses one route and canonical task state: 0/2, 1/2, and 2/2 are render states, never separate routes. Checkboxes are physical right in Arabic; the 56px completion action stays disabled until the presentation reflects all required existing steps.

Help invokes only the existing bounded task support. Confirmation summarizes current completion/help evidence and submits once. Submission creates zero Seeds, zero garden/canopy growth, and no reward. Waiting reflects the persisted Parent-review state and cannot resubmit.

## State resilience

Provide loading, unavailable assignment, validation, recoverable submission error, submitting, pending success, interruption recovery, offline deterministic fallback, and reduced-motion states. Never lose canonical accepted progress or duplicate a submission. Any optimistic local checkbox presentation must reconcile to the existing state machine and may not become a reward authority.

Use safe-area natural scroll, keyboard avoidance for existing reflection/media controls, fixed-action clearance, Arabic/English parity, mixed-script isolation, 48×48 controls, 56px primary Child actions, status announcements, non-color completion feedback, and 200% text.

## Acceptance boundary

Do not rename task_recycling_p0_v1, add evidence/media processing, hard-code screenshot values, calculate rewards, or expose R002b.
