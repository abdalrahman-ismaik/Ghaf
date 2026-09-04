# Ghaf documentation map

This directory contains current engineering guidance and preserved Feature 002 records. The active
Feature 003 product contracts intentionally remain in the repository root because the approved
handoff, `AGENTS.md`, and Spec Kit workflow reference those canonical paths.

> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

R001 Batch 1 is the only released visual/runtime boundary. The remote implementation remains the
behavioral regression baseline; the six local-only commits remain unapplied provenance.

## Start here

| Need                                                   | Document                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Install, run, reset, and troubleshoot                  | [Development and testing](DEVELOPMENT.md)                                            |
| Understand runtime boundaries and dependency direction | [Architecture](architecture/ARCHITECTURE.md)                                         |
| Contribute safely                                      | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                |
| Demonstrate and verify Feature 003                     | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                |
| Inspect the active specification                       | [Feature 003 spec](../specs/003-family-growth-garden/spec.md)                        |
| Check the only released screen batch                   | [R001 release gate](../specs/003-family-growth-garden/design-intake/release-gate.md) |
| Inspect the approved R001 composition references       | [R001 source](design/stitch/releases/ghaf-r001/STITCH_DESIGN.md)                     |

## Active Feature 003 contracts

These root-level files are the current source of truth:

| Document                                                            | Owns                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [PRODUCT.md](../PRODUCT.md)                                         | Users, behavior, reward/garden rules, assistant jobs, and P0 scope     |
| [DESIGN.md](../DESIGN.md)                                           | Design tokens, components, responsive behavior, RTL, and accessibility |
| [DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md)                       | Living Family Garden visual and cultural north star                    |
| [RESEARCH_BASIS.md](../RESEARCH_BASIS.md)                           | Reward, safety, content, and UAE-grounding rationale                   |
| [PROTOTYPE_LIMITATIONS.md](../PROTOTYPE_LIMITATIONS.md)             | Current capability truth and nonclaims                                 |
| [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                               | Exact judge journey and validation ledger                              |
| [TEAM_OWNERSHIP.md](../TEAM_OWNERSHIP.md)                           | File reservations, handoffs, and integration ownership                 |
| [CODEX_IMPLEMENTATION_PROMPT.md](../CODEX_IMPLEMENTATION_PROMPT.md) | Preserved Feature 003 implementation handoff record                    |

The active Spec Kit package is
[`specs/003-family-growth-garden/`](../specs/003-family-growth-garden/). Its `spec.md`, `plan.md`, and
`tasks.md` are normative for implementation. Contracts and checklists beneath that directory hold
domain acceptance and exact evidence.

The [Revision 3 proposal package](../specs/003-family-growth-garden/design-intake/revision-3-proposal/REVISION_3_DECISION_BRIEF.md)
is retained as non-canonical reconciliation evidence. Current user authority now fixes the private
five-Leaf League, canonical task ID, independent progression authorities, superset result, access,
voice, reset, profile isolation, 120–180 Impact Path, exact 16-badge registry, and equal-credit
Mangrove learning. It does not approve an R002 visual variant or missing Growth screen.

## Preserved Feature 002 history

The following files in this directory are historical Feature 002 records, not duplicates of the
root Feature 003 documents:

- `DEMO_RUNBOOK.md`
- `DESIGN_DIRECTION.md`
- `PROTOTYPE_LIMITATIONS.md`
- `TEAM_OWNERSHIP.md`

They retain the earlier food-rescue routes, prepared assets, results, and open Android/human gates.
Do not use them to make current Feature 003 claims, rename them casually, or transfer their passes
to the current feature. Their preservation requirement is recorded in
[`feature-002-preservation.md`](../specs/003-family-growth-garden/checklists/feature-002-preservation.md).

The complete historical Spec Kit records remain under `specs/001-*` and `specs/002-*`; historical
prepared media remains under `assets/demo/`; and the committed `*-mobile-final.png` files under
`output/playwright/` remain Feature 002 browser evidence.

## Current evidence locations

| Evidence                      | Location                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| Feature 003 acceptance ledger | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                                   |
| R001 Batch 1 validation       | [R001 validation evidence](../specs/003-family-growth-garden/design-intake/r001-validation-evidence.md) |
| Automated/story evidence      | [`specs/003-family-growth-garden/checklists/`](../specs/003-family-growth-garden/checklists/)           |
| Professional UI critique      | [`.impeccable/critique/`](../.impeccable/critique/)                                                     |
| Curated browser screenshots   | [`output/playwright/feature003-audit/`](../output/playwright/feature003-audit/)                         |

Generated Expo exports (`dist/`, `output/web-*`) and raw Playwright CLI session directories are
reproducible build/tool output and are not versioned evidence. Preserve the command and result in
the evidence ledger; preserve only deliberately selected screenshots.

## Documentation rules

- Update the active Feature 003 source of truth; do not create a second copy under `docs/`.
- Keep behavior changes aligned across the spec, product contract, implementation, tests, and
  runbook.
- Label automated, web, Android, and human evidence separately.
- Prefer links to canonical files over repeating long policy text.
- Never document prepared AI, synthetic media, symbolic growth, or self-reported activity as a live
  production capability or measured environmental impact.
