# R002a Parent Tasks screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected presentation specification; task actions and payloads remain unchanged.

## Evidence

| State      | PNG evidence                                  | Dimensions / SHA-256                                                        | HTML SHA-256                                                     |
| ---------- | --------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Task list  | ghaf_parent_tasks/screen.png                  | 618×1600 / 7ad413709c96e896f46da8b59d7aaab48bb272c5168071b9fabfb4c354ec9f9f | a9fb69f31404caef5d5db6eaf24ad3d5ab2460186717d21118e89bc4e861667a |
| Task added | ghaf_parent_tasks_task_added_final/screen.png | 706×1600 / 09ca5820a4e492ee7ec0b2673d0ebc8201383b5b0281d1dd4a7cf7ffc9921725 | cfe50af371ad5be61955b2c70ab25d3bd831ebf00602977bbb40dc322a0160aa |

Both are under `docs/design/stitch/releases/ghaf-r002/` in the original worktree. HTML titles are “Ghaf — Parent Tasks” and “Ghaf — Parent Tasks — Task Added (Final)”; both declare width=device-width, initial-scale=1.0. Remote image references are unverified and must be replaced with owned/native components.

## Route and flow

This is the Tasks presentation state owned by the existing Parent shell. Entry comes from Parent navigation. Create opens /parent/task/new; an existing task opens its current owning action/review path. Successful assignment returns to the same list in a task-added state; it is not a duplicate route.

Use live task lifecycle, selected Child, category, award, and pending-review data. Preserve assignment control, review access, voice affordances, reauthentication boundaries, and private profile filtering. Never synthesize a task or rename its canonical ID.

## UI and states

Apply Soft Geometric cards, clear status chips, readable task/Child grouping, code-native category icons, and a prominent create action. Provide loading, no-task empty, recoverable error, task-added success, interrupted rehydration, and reduced-motion states. Success feedback must not imply Seeds were awarded at assignment.

The content scrolls; header/navigation remain only where the existing shell fixes them. Arabic card content starts right and directional controls mirror correctly. Maintain 48×48 actions, focus order, semantic status labels, 4.5:1 text contrast, and 200% text without clipped chips or overlapping navigation.

## Acceptance boundary

List and success rendering are projections of existing store state. No screenshot number or remote avatar becomes runtime data. R001 onboarding remains untouched and R002b navigation remains hidden.
