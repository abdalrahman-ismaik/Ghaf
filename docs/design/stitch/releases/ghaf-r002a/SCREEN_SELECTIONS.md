# R002a screen selections

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: design-intake metadata, not runtime or behavioral authority. Raw evidence remains immutable at `docs/design/stitch/releases/ghaf-r002/` in the original worktree’s untracked intake. PNG composition is the visual reference; HTML is measurement and state evidence only.

## Selection rules

A selected candidate must preserve the remote-head behavior, have usable mobile composition, avoid placeholder copy, respect physical RTL, remain accessible after native translation, and require no unverified runtime asset. “Final”, “fixed”, and “corrected” describe lineage only. All values, task identity, rewards, access, privacy, reset, and voice behavior come from existing selectors and services.

| Group            | Selected evidence                                     | Runtime owner               | Disposition                            | Binding qualification                                                                                                    |
| ---------------- | ----------------------------------------------------- | --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Parent Home      | ghaf_parent_home/screen.png + code.html               | /parent                     | Primary candidate                      | Preserve every existing capability; omit or derive screenshot-only 19/25, 4/5, and 108/120 values from live authorities. |
| Parent Tasks     | ghaf_parent_tasks; ghaf_parent_tasks_task_added_final | /parent task-list state     | Primary candidates                     | Existing actions/payloads only; post-create is a state, not a route.                                                     |
| Builder Choose   | ghaf_task_builder_1_choose_corrected                  | /parent/task/new            | Primary candidate                      | Use existing Child/category options and canonical task identity.                                                         |
| Builder Edit     | ghaf_task_builder_2_edit_fixed_layout                 | /parent/task/new            | Primary candidate                      | Existing draft and bounded Parent Guide behavior only.                                                                   |
| Builder Review   | ghaf_task_builder_3_review_interactive                | /parent/task/review         | Primary candidate                      | Native review state; no web script or reward calculation.                                                                |
| Builder Success  | ghaf_task_created_success_1                           | /parent/task/review overlay | Supporting state                       | Native modal/sheet; invalid success_2 is rejected.                                                                       |
| Child Today      | ghaf_child_today_final                                | /child                      | Primary candidate                      | Existing assigned-task selector and physical navigation order.                                                           |
| Task Ready       | ghaf_child_task_detail_ready_final                    | /child/task                 | Primary candidate                      | Existing accept/start action; displayed award comes from assignment.                                                     |
| Task Active      | ghaf_child_task_active_final_2                        | /child/task state           | Primary candidate                      | 0/2, 1/2, and 2/2 are one route state sequence.                                                                          |
| Completion       | ghaf_child_task_completion_confirmation               | /child/task state           | Primary candidate                      | Submission awards zero and moves to pending review.                                                                      |
| Waiting          | ghaf_waiting_for_parent_approval_fixed                | /child pending state        | Primary candidate                      | No reward language before Parent approval.                                                                               |
| Parent Pending   | ghaf_parent_task_review_pending_corrected             | /parent/check-in            | Primary candidate with repaired avatar | Discard visible :EN:S and SCREEN_34 token output; preserve review transaction.                                           |
| Support Request  | ghaf_parent_task_review_support_request_2             | /parent/check-in state      | Primary candidate                      | Extract only its 390×844 phone frame; _1 supports default composition.                                                   |
| Approval Success | ghaf_parent_task_review_approved_success              | /parent/check-in overlay    | Primary candidate                      | Present all existing receipt consequences; the screen never computes them.                                               |
| Child Follow-up  | ghaf_child_task_follow_up                             | /child/task retry state     | Primary candidate                      | Existing kind-retry/resume path; do not claim new persisted step targeting.                                              |
| Child Garden     | ghaf_child_growth_garden_final_corrected              | /garden                     | Visual-only candidate                  | Replace every screenshot progression number with current Garden selectors.                                               |

## State and lineage decisions

- ghaf_child_task_active_final_1 and the active variants support progress-state interpretation; they do not create routes.
- ghaf_parent_task_review_support_request_1 supports the default state. support_request_2 supplies selected, sending, and sent evidence, but its desktop outer wrapper is documentation-only.
- ghaf_task_builder_3_review and task_created_success_1 are supporting evidence. ghaf_task_builder_3_review_updated_success remains unresolved because it contains {{DATA:SCREEN:SCREEN_51}}.
- Non-selected earlier variants are superseded for composition, not deleted and not imported.
- R001 Welcome and Parent onboarding exports are frozen regression evidence and outside R002a redesign.
- Opening moments, system-launch boards, editorial variants, raw design directories, access/pairing exports, and illustration-only exports are supporting or unresolved evidence, not selected runtime surfaces.

## Explicit R002b quarantine

| Export                                          | Reason blocked                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ghaf_child_garden_next_stage                    | Encodes the unapproved cumulative Next Stage progression.                                         |
| ghaf_child_growth_league_shared_growth          | Could replace or alter the canonical private five-Leaf League.                                    |
| ghaf_child_growth_moment_approved               | Encodes a revised combined reveal/reward model and has missing title plus mixed-language heading. |
| ghaf_child_growth_moment_approved_final         | Encodes the same blocked product expansion.                                                       |
| ghaf_parent_shared_garden_participation_privacy | Adds blocked participation/privacy controls and lacks title/H1 evidence.                          |

No Impact Path, Badge Gallery, Badge Detail, Learning, Parent Progress, Shared Growth, cumulative Next Stage, or revised combined RevealBundle surface is selected for R002a.
