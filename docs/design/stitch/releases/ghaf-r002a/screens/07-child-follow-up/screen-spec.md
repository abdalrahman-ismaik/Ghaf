# R002a Child Follow-up screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected presentation specification for the existing retry/resume loop.

## Evidence

- PNG: `docs/design/stitch/releases/ghaf-r002/ghaf_child_task_follow_up/screen.png` — 706×1600 — SHA-256 556ade37198b368f4bdc0f0b1712154a85b8bac770c6e52d90662bb200d63f25.
- HTML: `docs/design/stitch/releases/ghaf-r002/ghaf_child_task_follow_up/code.html` — SHA-256 db8a4badb8d80850a2c9eedfa46d1e03205c6f34ce19e42188a04684a043c5ce — title “Ghaf — Child Task — Follow-up”; viewport includes user-scalable=no, which native implementation rejects.

## Flow

Owner is the existing /child/task retry state. It is entered only when the existing Parent review produces kind retry/support. It shows the existing accepted task, safe Parent note/adult-help context, preserved progress that the store actually retains, and the existing resume/complete/resubmit actions. It returns to Parent review through the canonical lifecycle.

Do not create a second task or award, reduce a previously accepted displayed award, reveal private Parent data, or infer blame. Help and safe-equivalent language remains autonomy-supportive. Per-step persistence may only be shown if supplied by an existing authoritative selector; otherwise use the current whole-task retry representation.

## States and quality

Support loading, recoverable error, resumed, submitting, sent-for-review, interruption recovery, offline deterministic fallback, and reduced motion. Duplicate resubmission is disabled and canonical state wins after relaunch.

Arabic uses checkboxes on the physical right, Back on the right, Help on the left, generous Readex Pro line height, and a 56px primary Child action. English uses LTR. Provide natural scroll, safe areas, fixed-action clearance, 48×48 secondary targets, keyboard avoidance, non-color progress, semantic announcements, and 200% text.

## Acceptance boundary

This is presentation over existing retry/resume behavior. No new reward, task-ID migration, unrestricted AI, real voice processing, or R002b mechanic is authorized.
