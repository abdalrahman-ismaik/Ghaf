# Ghaf documentation map

This directory contains engineering guidance, design/content provenance, competition work records
and preserved Feature 002 evidence. Feature 003 owns the Family Growth Garden baseline; later
numbered packages describe bounded amendments. The [specification index](../specs/README.md) maps
them without treating every proposal as released behavior.

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Current product contracts live in this documentation tree. R001/R002a remain
regression boundaries; R002b and optional AI release status must be read from their applicable
feature and evidence records. A source or browser pass does not establish physical-demo acceptance.

See the [root-file guide](architecture/PUBLIC_REPOSITORY.md) for what moved, what stays at the root
and what remains private/local, and the [AI-assistance disclosure](AI_ASSISTANCE.md) for contribution
transparency. Older root paths resolve through the [relocation map](architecture/document-relocations.json).

## Start here

| Need                                                   | Document                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Install, run, reset, and troubleshoot                  | [Development and testing](DEVELOPMENT.md)                                                          |
| Understand runtime boundaries and dependency direction | [Architecture](architecture/ARCHITECTURE.md)                                                       |
| Find the right folder for a change                     | [Repository structure](architecture/REPOSITORY_STRUCTURE.md)                                       |
| Review organization findings and remaining debt        | [Repository audit](architecture/REPOSITORY_AUDIT.md)                                               |
| Run a focused test group                               | [Test suite guide](../tests/README.md)                                                             |
| Inspect current competition work and gates             | [Competition readiness](competition-readiness/README.md)                                           |
| Contribute safely                                      | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                              |
| Demonstrate and verify Feature 003                     | [DEMO_RUNBOOK.md](competition-readiness/DEMO_RUNBOOK.md)                                           |
| Inspect the active specification                       | [Feature 003 spec](../specs/003-family-growth-garden/spec.md)                                      |
| Check current independent release gates                | [Feature 003 release gates](../specs/003-family-growth-garden/design-intake/release-gate.md)       |
| Inspect frozen R001 composition references             | [R001 source](design/stitch/releases/ghaf-r001/STITCH_DESIGN.md)                                   |
| Inspect selected R002a compatibility references        | [R002a selections](design/stitch/releases/ghaf-r002a/SCREEN_SELECTIONS.md)                         |
| Inspect the R002b implementation contract              | [R002b contract](../specs/003-family-growth-garden/design-intake/r002b-implementation-contract.md) |

## Active Feature 003 contracts

These documents are the current source of truth, with the implementation prompt retained as history:

| Document                                                                 | Owns                                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)                                                 | Users, behavior, reward/garden rules, assistant jobs, and P0 scope     |
| [DESIGN.md](DESIGN.md)                                                   | Design tokens, components, responsive behavior, RTL, and accessibility |
| [DESIGN_DIRECTION.md](design/DESIGN_DIRECTION.md)                        | Living Family Garden visual and cultural north star                    |
| [RESEARCH_BASIS.md](product/RESEARCH_BASIS.md)                           | Reward, safety, content, and UAE-grounding rationale                   |
| [PROTOTYPE_LIMITATIONS.md](product/PROTOTYPE_LIMITATIONS.md)             | Current capability truth and nonclaims                                 |
| [DEMO_RUNBOOK.md](competition-readiness/DEMO_RUNBOOK.md)                 | Exact judge journey and validation ledger                              |
| [TEAM_OWNERSHIP.md](competition-readiness/TEAM_OWNERSHIP.md)             | File reservations, handoffs, and integration ownership                 |
| [CODEX_IMPLEMENTATION_PROMPT.md](archive/CODEX_IMPLEMENTATION_PROMPT.md) | Preserved Feature 003 implementation handoff record                    |

The active Spec Kit package is
[`specs/003-family-growth-garden/`](../specs/003-family-growth-garden/). Its `spec.md`, `plan.md`, and
`tasks.md` are normative for implementation. Contracts and checklists beneath that directory hold
domain acceptance and exact evidence.

The [Revision 3 proposal package](../specs/003-family-growth-garden/design-intake/revision-3-proposal/REVISION_3_DECISION_BRIEF.md)
is retained as non-canonical reconciliation evidence. Current user authority now fixes the private
five-Leaf League, canonical task ID, independent progression authorities, complete existing
approval consequences, access, voice, reset, and profile isolation. Its Growth recommendations
are now approved product inputs for feature-flagged implementation, while the proposal package
remains non-canonical history. Selected R002a visuals remain governed by their intake record.

## Preserved Feature 002 history

The following files directly in this directory are historical Feature 002 records, not duplicates
of the current Feature 003 documents in the table above:

- [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md)
- [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md)
- [PROTOTYPE_LIMITATIONS.md](PROTOTYPE_LIMITATIONS.md)
- [TEAM_OWNERSHIP.md](TEAM_OWNERSHIP.md)

They retain the earlier food-rescue routes, prepared assets, results, and open Android/human gates.
Do not use them to make current Feature 003 claims, rename them casually, or transfer their passes
to the current feature. Their preservation requirement is recorded in
[`feature-002-preservation.md`](../specs/003-family-growth-garden/checklists/feature-002-preservation.md).

The complete historical Spec Kit records remain under `specs/001-*` and `specs/002-*`; historical
prepared media remains under `assets/demo/`; and the committed `*-mobile-final.png` files under
`output/playwright/` remain Feature 002 browser evidence.

## Current evidence locations

| Evidence                       | Location                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Feature 003 acceptance ledger  | [DEMO_RUNBOOK.md](competition-readiness/DEMO_RUNBOOK.md)                                                  |
| R001 Batch 1 validation        | [R001 validation evidence](../specs/003-family-growth-garden/design-intake/r001-validation-evidence.md)   |
| R002a compatibility validation | [R002a validation evidence](../specs/003-family-growth-garden/design-intake/r002a-validation-evidence.md) |
| Automated/story evidence       | [`specs/003-family-growth-garden/checklists/`](../specs/003-family-growth-garden/checklists/)             |
| Professional UI critique       | [`.impeccable/critique/`](../.impeccable/critique/)                                                       |
| Curated browser screenshots    | [`output/playwright/feature003-audit/`](../output/playwright/feature003-audit/)                           |
| R002a browser screenshots      | [`output/playwright/r002a/`](../output/playwright/r002a/)                                                 |

Generated Expo exports (`dist/`, `output/web-*`) and raw Playwright CLI session directories are
reproducible build/tool output and are not versioned evidence. Preserve the command and result in
the evidence ledger; preserve only deliberately selected screenshots.

## Documentation rules

Folder guides also describe [source](../src/README.md), [assets](../assets/README.md),
[scripts](../scripts/README.md), [Workers](../workers/README.md) and [tools](../tools/README.md).

- Update the applicable canonical document in this tree; do not recreate former root copies.
- Keep behavior changes aligned across the spec, product contract, implementation, tests, and
  runbook.
- Label automated, web, Android, and human evidence separately.
- Prefer links to canonical files over repeating long policy text.
- Never document prepared AI, synthetic media, symbolic growth, or self-reported activity as a live
  production capability or measured environmental impact.
