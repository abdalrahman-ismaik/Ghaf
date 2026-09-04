# R002a asset provenance

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: intake risk register, not shipping permission. Raw exports at `docs/design/stitch/releases/ghaf-r002/` in the original worktree remain unmodified evidence.

## Runtime policy

Only repository-owned assets, already approved icons, code-native SVG/vector illustrations, or exported assets with recorded provenance may ship. Remote URLs, Google-hosted fonts, external scripts, Tailwind CDN, Material Symbols web font, rasterized interface text, whole PNG screens, HTML, CSS, JavaScript, DOM elements, and WebViews are prohibited. Alexandria and Readex Pro must load from the existing local app assets. Unknown illustrations are recreated with approved code-native primitives or omitted without blocking the rest of a screen.

## Objective findings

| Evidence class          | Verified finding                                 | Disposition                                            |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Windows metadata        | 148 files ending in :Zone.Identifier             | Excluded from evidence, staging, runtime, and commits. |
| Generated HTML          | 70 files contain web scripts/dependency patterns | Measurement/state hints only; never runtime.           |
| Remote image references | 25 img references across 17 export directories   | Unverified; never ship URLs or download implicitly.    |
| Illustration-only PNGs  | Two 1024×1024 screen.png files                   | Provenance/permission unresolved; do not ship.         |
| Invalid PNG             | ghaf_task_created_success_2/screen.png is 487×1  | Quarantined as invalid.                                |
| Placeholder assets/copy | :EN:S and unresolved SCREEN tokens               | Invalid; replace with owned component/data.            |
| Zoom locks              | 11 HTML viewports use user-scalable=no           | Rejected; native screen must support font scaling.     |

Remote-image directories: ghaf_child_garden_next_stage; ghaf_child_growth_garden; ghaf_child_growth_garden_final; ghaf_child_growth_garden_final_corrected; ghaf_child_growth_moment_approved; ghaf_child_growth_moment_approved_final; ghaf_child_task_active; ghaf_child_task_completion_confirmation; ghaf_child_task_detail_ready; ghaf_child_task_detail_ready_final; ghaf_child_today; ghaf_final_welcome_screen; ghaf_parent_task_review_support_request_2; ghaf_parent_tasks; ghaf_parent_tasks_task_added; ghaf_parent_tasks_task_added_final; ghaf_task_builder_1_choose.

## Selected-surface decisions

| Surface            | Asset need seen in reference             | R002a implementation source                                                                                |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Parent Home        | canopy/tree, avatars, icons              | Existing owned GhafTree/canopy primitives, local initials or owned avatar component, approved vector icons |
| Parent Tasks       | child/profile imagery and task icons     | Code-native initials/category glyphs; no remote profile images                                             |
| Task Builder       | category/Child icons, success leaf       | Existing icon primitives and code-native botanical marks                                                   |
| Child Today / Task | task illustration, checkboxes, help icon | Existing category illustration or code-native SVG; native controls with semantic state                     |
| Parent Review      | avatar, leaf/reward marks                | Replace :EN:S/token output with selected profile data and owned vectors                                    |
| Follow-up          | task/checklist symbols                   | Existing native controls                                                                                   |
| Garden             | mangrove illustration                    | Existing repository-owned garden/tree component; raw remote imagery is composition evidence only           |

Provenance status remains UNVERIFIED for every remote image and both standalone illustration PNGs. Their absence blocks only the illustration, never the R002a route.
