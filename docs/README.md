# Ghaf documentation map

This directory contains the public engineering guide, architecture decisions, content references,
commercial assumptions, and preserved historical records. Current product contracts live at the
repository root so contributors and competition reviewers can find them immediately.

## Start here

| Need                                                   | Document                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Install, run, reset, and troubleshoot                  | [Development and testing](DEVELOPMENT.md)                                                          |
| Understand runtime boundaries and dependency direction | [Architecture](architecture/ARCHITECTURE.md)                                                       |
| Contribute safely                                      | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                              |
| Demonstrate and verify Feature 003                     | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                              |
| Inspect the active specification                       | [Feature 003 spec](../specs/003-family-growth-garden/spec.md)                                      |
| Check current independent release gates                | [Feature 003 release gates](../specs/003-family-growth-garden/design-intake/release-gate.md)       |
| Inspect frozen R001 composition references             | [R001 source](design/stitch/releases/ghaf-r001/STITCH_DESIGN.md)                                   |
| Inspect selected R002a compatibility references        | [R002a selections](design/stitch/releases/ghaf-r002a/SCREEN_SELECTIONS.md)                         |
| Inspect the R002b implementation contract              | [R002b contract](../specs/003-family-growth-garden/design-intake/r002b-implementation-contract.md) |

## Active Feature 003 contracts

These root-level files are the current source of truth:

| Document                                                | Owns                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| [PRODUCT.md](../PRODUCT.md)                             | Users, behavior, reward/garden rules, assistant jobs, and P0 scope     |
| [DESIGN.md](../DESIGN.md)                               | Design tokens, components, responsive behavior, RTL, and accessibility |
| [DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md)           | Living Family Garden visual and cultural north star                    |
| [RESEARCH_BASIS.md](../RESEARCH_BASIS.md)               | Reward, safety, content, and UAE-grounding rationale                   |
| [PROTOTYPE_LIMITATIONS.md](../PROTOTYPE_LIMITATIONS.md) | Current capability truth and nonclaims                                 |
| [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                   | Exact judge journey and validation ledger                              |

The active product package is [`specs/003-family-growth-garden/`](../specs/003-family-growth-garden/).
Its requirements and contracts define domain acceptance and expected evidence.

Current requirements preserve the private five-Leaf League, canonical task ID, independent
progression authorities, complete approval consequences, access separation, voice boundaries,
reset behavior, and profile isolation.

## Preserved Feature 002 history

The following files in this directory are historical Feature 002 records, not duplicates of the
root Feature 003 documents:

- `DEMO_RUNBOOK.md`
- `DESIGN_DIRECTION.md`
- `PROTOTYPE_LIMITATIONS.md`

They retain the earlier food-rescue routes, prepared assets, results, and open Android/human gates.
Do not use them to make current Feature 003 claims, rename them casually, or transfer their passes
to the current feature. Their preservation requirement is recorded in
[`feature-002-preservation.md`](../specs/003-family-growth-garden/checklists/feature-002-preservation.md).

Historical requirements remain under `specs/001-*` and `specs/002-*`, and historical prepared media
remains under `assets/demo/`.

## Current evidence locations

| Evidence                       | Location                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Feature 003 acceptance ledger  | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                                     |
| R001 Batch 1 validation        | [R001 validation evidence](../specs/003-family-growth-garden/design-intake/r001-validation-evidence.md)   |
| R002a compatibility validation | [R002a validation evidence](../specs/003-family-growth-garden/design-intake/r002a-validation-evidence.md) |
| Automated/story evidence       | [`specs/003-family-growth-garden/checklists/`](../specs/003-family-growth-garden/checklists/)             |

Generated Expo exports, test screenshots, local review reports, and browser-session directories are
reproducible local output and are not versioned. Preserve the command and result in the evidence
ledger instead.

## Documentation rules

- Update the active Feature 003 source of truth; do not create a second copy under `docs/`.
- Keep behavior changes aligned across the spec, product contract, implementation, tests, and
  runbook.
- Label automated, web, Android, and human evidence separately.
- Prefer links to canonical files over repeating long policy text.
- Never document prepared AI, synthetic media, symbolic growth, or self-reported activity as a live
  production capability or measured environmental impact.
