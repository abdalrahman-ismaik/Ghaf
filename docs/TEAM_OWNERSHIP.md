# Team Ownership

This is the provisional ownership map for the Ghaf bootstrap work period beginning 2026-08-22.
Replace `Member 1`, `Member 2`, and `Member 3` with names only when the team chooses to do so.

## Current Integration Owner

**Member 1 — Mobile and visual experience** is the integration owner for the current bootstrap
period.

The integration owner coordinates shared configuration, resolves file-boundary conflicts, checks
the combined diff, runs the final validation gate, and decides when a work period is ready to merge.
This role does not allow silent overwrites of another member's active changes.

## Provisional Human Ownership

| Member                                        | Product responsibility                                                                                            | Default Feature 001 file scope                                                                                                                                       | Feature 001 task ownership                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Member 1 — Mobile and visual experience       | Expo, navigation, design system, screens, RTL, Ghaf visual, physical-device build, integration                    | `app/**`, `src/components/**`, `src/design/**`, `src/i18n/**`, UI feature folders, visual assets, root app/tool configuration during an exclusive integration window | T001–T004, T010–T016, T018–T019, T021–T026, T034 |
| Member 2 — AI and application logic           | Mission schema, mock AI, service interfaces, data transformations, impact logic                                   | `src/models/**`, `src/services/**`, `src/state/**`, `src/utils/**`, mission/impact feature folders, automated state/service tests                                    | T005–T009, T017, T020                            |
| Member 3 — Product, content, QA, presentation | Spec Kit product artifacts, bilingual mission content, acceptance criteria, manual testing, demo data, pitch flow | `specs/**` product artifacts, `docs/**`, root guidance, manual evidence; implementation copy is handed to its current source owner                                   | T027–T033, T035–T036                             |

During bootstrap, Member 2 owns automated test-file edits while Member 3 owns manual QA execution
and evidence. This prevents both members from changing the same test file. Reassign this explicitly
if the work period changes.

## Project-Agent Write Scopes

Project-scoped Codex agents are helpers, not extra owners. Their write scope must be reserved before
they run:

| Agent                     | Write scope                                                                                            | Never writes concurrently with                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `ghaf-orchestrator`       | Root collaboration docs, technical plan/design artifacts, and explicitly reserved shared configuration | Any owner currently editing those shared files        |
| `ghaf-product-spec-agent` | Active `spec.md`, checklists, and assigned limitation copy                                             | Orchestrator or Member 3 in the same product artifact |
| `ghaf-ui-expo-agent`      | Routes, UI components, design, i18n, approved UI features, visual assets                               | Member 1 or another UI agent in the same area         |
| `ghaf-ai-prototype-agent` | Models, services, state, mission/impact logic, prepared demo fixtures                                  | Member 2 or another logic agent in the same area      |
| `ghaf-demo-qa-agent`      | Focused tests and `docs/DEMO_RUNBOOK.md`                                                               | Member 2 in tests or Member 3 in the runbook          |

At most four agents may run concurrently. Independent read-only research, specification review, UI
screenshot review, and inspection of separate repository areas can overlap. Agents must not edit
the same files, change shared configuration simultaneously, install competing libraries, rewrite
the same specification, or implement alternate versions of a feature.

## Reservation Protocol

Before work starts, post or record:

```text
Work period: date/time or session label
Owner: Member/agent
Task IDs: T0XX
Write scope: exact files/directories
Expected handoff: outcome and validation
```

The integration owner confirms any shared-file reservation. When finished, the owner reports the
files changed, checks run, manual evidence, and gaps, then releases the boundary.

## Handoff Record

Record every integration-owner change here before new work resumes:

| Effective time             | Previous owner | New owner | Active feature/work period        | Reason                         |
| -------------------------- | -------------- | --------- | --------------------------------- | ------------------------------ |
| 2026-08-22 bootstrap start | —              | Member 1  | Feature 001 repository foundation | Initial provisional assignment |

If there is no newer row, Member 1 remains the integration owner.

## Conflict Rule

If overlapping work appears, stop both writers, preserve both diffs, and let the integration owner
choose one base. Do not overwrite, reset, or discard either version. A scope addition first goes to
the active specification; it is not resolved by quietly widening a member's file boundary.
