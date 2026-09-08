# Ghaf documentation map

This directory contains the public engineering guide, architecture decisions, content references,
commercial assumptions, and selected design records. Current product contracts live at the
repository root so contributors and competition reviewers can find them immediately.

## Start here

| Need                                                   | Document                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| Install, run, reset, and troubleshoot                  | [Development and testing](DEVELOPMENT.md)                        |
| Understand runtime boundaries and dependency direction | [Architecture](architecture/ARCHITECTURE.md)                     |
| Contribute safely                                      | [CONTRIBUTING.md](../CONTRIBUTING.md)                            |
| Demonstrate and verify Feature 003                     | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                            |
| Inspect frozen R001 composition references             | [R001 source](design/stitch/releases/ghaf-r001/STITCH_DESIGN.md) |
| Inspect selected R002a compatibility references        | [R002a selections](design/stitch/releases/ghaf-r002a/)           |

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
to the current feature. Historical prepared media remains under `assets/demo/`.

## Current evidence locations

| Evidence                      | Location                                                |
| ----------------------------- | ------------------------------------------------------- |
| Feature 003 acceptance ledger | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                   |
| Automated checks              | [`tests/`](../tests/) and package verification          |
| Design decisions              | [Architecture decisions](architecture/adr/)             |
| Product capability boundaries | [PROTOTYPE_LIMITATIONS.md](../PROTOTYPE_LIMITATIONS.md) |

Generated Expo exports, test screenshots, local review reports, and browser-session directories are
reproducible local output and are not versioned. Preserve the command and result in the evidence
ledger instead.

## Documentation rules

- Update the root product and design source of truth; do not create a second copy under `docs/`.
- Keep behavior changes aligned across product contracts, implementation, tests, and the runbook.
- Label automated, web, Android, and human evidence separately.
- Prefer links to canonical files over repeating long policy text.
- Never document prepared AI, synthetic media, symbolic growth, or self-reported activity as a live
  production capability or measured environmental impact.
