# R002a Task Builder screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected native presentation specification for the existing builder workflow.

## Evidence

All evidence is under `docs/design/stitch/releases/ghaf-r002/` in the original worktree.

| Stage           | Candidate                              | PNG dimensions / SHA-256                                                    | HTML SHA-256                                                     |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Choose          | ghaf_task_builder_1_choose_corrected   | 706×1600 / 3f417588e8d747549fa8eba5fc11dec0c1a8d1bcbf85e38f5a8b114ffdfea254 | 64acc2ed5adbc8b074dde6dc40d2bef91df71304a5027808c4ffbc149b1d2fec |
| Edit            | ghaf_task_builder_2_edit_fixed_layout  | 706×1600 / cb8b4a649af029d4b060fb0b0e398eec86f6d09e55acca767a5937d77f64b0cb | 9377080df149bacfe65569028eb230978bfe20f188c19420669215ebe940e36d |
| Review          | ghaf_task_builder_3_review_interactive | 507×1600 / b0e4aaa07343c525b4a863925b59be62d430fc1aa7757b1aeecafccad8ed35a2 | ead883ef7111d38ee2fde27207cf9d30340f5e70a8f06b172d10d25bad701c19 |
| Success support | ghaf_task_created_success_1            | 706×1600 / 5ededb3dae37786f8ce3185f6a24f25634f614db9bcb6c7e4cb0d921055c26e7 | 897193f50efadeb53cfa152f478802bc9dcf293bd352d8ac73a7baa9f0d0cae9 |

The HTML titles identify Choose, Edit, Review, and Task Created Success; all declare width=device-width, initial-scale=1.0. The web modal/script is interaction evidence only. updated_success is excluded for SCREEN_51; success_2 is invalid at 487×1.

## Existing flow

Choose and Edit are states of /parent/task/new; Review is owned by /parent/task/review. Use existing draft creation/update, Child/category choice, bounded deterministic Parent Guide, review, assignment approval, and return-to-list actions. task_recycling_p0_v1 remains the stored task ID; task.recycling_sort.v1 is never persisted.

The three-step indicator communicates local progress, not a new state machine. Back preserves the existing draft. Review renders the existing payload. Approval invokes the existing action once; the screen does not compute rewards. Success is one native sheet/dialog, then returns to Parent Tasks.

## Required states

- Choose: default, selection validation, unavailable/empty fixtures, loading, and draft restoration.
- Edit: focused fields, keyboard avoidance, validation error, bounded Guide loading/fallback, and interrupted restoration.
- Review: complete payload, missing-draft safe return, submitting disabled action, recoverable failure, and accepted success.
- Sheet: accessibility focus trap/restoration, Back-safe dismissal after persisted success, no stacked overlays, reduced-motion instant presentation.

Use natural scroll with fixed action clearance, 48×48 targets, Arabic Back physical right/forward physical left, semantic step/current-state announcements, English LTR parity, 200% text, and no remote images/web dependencies.

## Acceptance boundary

No new category, reward, task outcome, migration, or R002b mechanic is authorized. Assignment does not award Seeds.
