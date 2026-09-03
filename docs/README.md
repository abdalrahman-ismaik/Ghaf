# Ghaf documentation map

This directory contains current engineering guidance, Revision 3 Growth Journey planning input,
and preserved historical records. Canonical product contracts remain in the repository root
because `AGENTS.md` and the Spec Kit workflow reference those paths.

Feature 003 Revision 3 is the active pre-Stitch planning direction and inherits the approved
Revision 2 contract. R001 Batch 1 implements Welcome and first-time Parent onboarding and is the
only released runtime. Every later Revision 2 screen and every Growth Journey screen remains
pending user-supplied, approved Stitch frames. The 2026-08-28 ten-route Feature 003 build is
Revision 1 historical evidence only; none of its passes carry forward.

## Start here

| Need                                                   | Document                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Install, run, reset, and troubleshoot                  | [Development and testing](DEVELOPMENT.md)                                                               |
| Understand runtime boundaries and dependency direction | [Architecture](architecture/ARCHITECTURE.md)                                                            |
| Contribute safely                                      | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                                   |
| Demonstrate and verify Feature 003                     | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                                   |
| Inspect the active specification                       | [Feature 003 spec](../specs/003-family-growth-garden/spec.md)                                           |
| Generate the pending Revision 2 screen designs         | [Google Stitch prompt pack](../GHAF_GOOGLE_STITCH_PROMPT_PACK.md)                                       |
| Inspect the Revision 3 Growth Journey source material  | [Growth Journey prompt pack](GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md)                                 |
| Prepare the future Growth Journey design handoff       | [Growth Journey preflight](../specs/003-family-growth-garden/design-intake/growth-journey-preflight.md) |

## Active Feature 003 contracts

These files form the current contract map. R001 Batch 1 has approved executable design details and
scoped evidence; all remaining screens stay behind the recorded per-batch Stitch gate.

| Document                                                                                                | Owns                                                                                                              | Revision status                                                                               |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [PRODUCT.md](../PRODUCT.md)                                                                             | Revision 3 product contract, including inherited access/League/Reward rules and the proposed Growth Journey       | R001 Batch 1 implemented; later Revision 2 and all Growth screens pending Stitch approval     |
| [Google Stitch prompt pack](../GHAF_GOOGLE_STITCH_PROMPT_PACK.md)                                       | Canonical 20-prompt generation workflow, visual variants, screen inputs, prototype connection, audit, and repairs | Approved generation input; not executable design truth                                        |
| [DESIGN.md](../DESIGN.md)                                                                               | Durable tokens, components, motion, RTL, and accessibility rules after reconciliation with approved frames        | Must not be treated as final later-screen proof before approved Stitch exports are integrated |
| [DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md)                                                           | Visual and cultural north star plus Revision 2/3 design holds                                                     | R001 Batch 1 released; later generated frames remain pending user approval                    |
| [RESEARCH_BASIS.md](../RESEARCH_BASIS.md)                                                               | Reward, League, safety, content, UAE grounding, and Growth Journey guardrails                                     | Research rationale only; not implementation or outcome evidence                               |
| [PROTOTYPE_LIMITATIONS.md](../PROTOTYPE_LIMITATIONS.md)                                                 | Current capability truth, synthetic simulations, and nonclaims                                                    | Batch 1 evidence is scoped; full Revision 2 and all Growth validation remain incomplete       |
| [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                                   | Judge journey and validation ledger                                                                               | Must separate superseded Revision 1 evidence from future Revision 2/3 results                 |
| [TEAM_OWNERSHIP.md](../TEAM_OWNERSHIP.md)                                                               | File reservations, handoffs, and integration ownership                                                            | Current collaboration authority                                                               |
| [CODEX_IMPLEMENTATION_PROMPT.md](../CODEX_IMPLEMENTATION_PROMPT.md)                                     | Revision 3 Codex handoff, partial-release boundary, approved product scope, and future design-intake sequence     | Do not widen beyond approved screen batches; not a screen or build plan                       |
| [Growth Journey prompt pack](GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md)                                 | Supplied Revision 3 research, implementation, and Stitch-generation inputs                                        | Planning input only; conflicts are resolved in the active contracts                           |
| [Growth Journey preflight](../specs/003-family-growth-garden/design-intake/growth-journey-preflight.md) | Lean MVP, conflict dispositions, prerequisite screens, state matrix, and evidence gate                            | Normative intake checklist for the future Growth release                                      |
| [Badge catalog](content/BADGE_CATALOG.md)                                                               | Exact 16 deterministic badge definitions and review ledger                                                        | Proposed content contract; runtime and named human reviews remain pending                     |
| [Learning stories](content/LEARNING_STORIES.md)                                                         | Finite Mangrove learning package and equal-credit accessible route                                                | Proposed content contract; awards zero Seeds/garden growth                                    |
| [Impact Path ADR](architecture/adr/0002-impact-path-projection.md)                                      | Proposed Seed-derived projection, idempotency, reveal ordering, persistence, and migration boundary               | Proposed architecture decision; implementation remains Stitch-blocked                         |

The active Spec Kit package is
[`specs/003-family-growth-garden/`](../specs/003-family-growth-garden/). Its `spec.md`, `plan.md`, and
`tasks.md` are normative for implementation. Contracts and checklists beneath that directory hold
domain acceptance and exact evidence.

## Feature 003 revision boundary

| Revision                    | Meaning                                                                                                                                                                                                            | Evidence use                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Revision 3 — 2026-09-03** | Revision 2 plus one private Seed-derived Impact Path, exactly 16 permanent deterministic badges, finite sourced learning, one result bundle, and Parent read-only selected-Child progress                          | Pre-Stitch planning only. No Growth Journey runtime or validation may be claimed until designs are approved and implementation is tested.         |
| **Revision 2 — 2026-09-01** | Separate synthetic Parent/Child access, role-specific navigation, Challenge Leaf League, private non-custodial Family Rewards, age-adapted bounded Coach, simulated push-to-talk, and Alexandria/Readex typography | R001 Batch 1 is implemented with scoped evidence. Later screens and full Android/human validation remain pending and cannot inherit prior passes. |
| **Revision 1 — 2026-08-28** | Implemented deterministic ten-route flow with `/role`, forced role handoff, cooperative `/circle`, no Family Reward, and previous typography                                                                       | Superseded historical baseline. Its exact automated and web evidence may describe that build only.                                                |

Do not edit or reinterpret earlier evidence to make it resemble a later revision. Once the user
supplies approved Stitch frames, update the active Spec Kit artifacts before implementing changed
behavior or screen architecture.

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

| Evidence                      | Location                                                                                      | Current interpretation                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Feature 003 acceptance ledger | [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md)                                                         | Revision-aware status ledger; Revision 2/3 results must be newly recorded                   |
| Automated/story evidence      | [`specs/003-family-growth-garden/checklists/`](../specs/003-family-growth-garden/checklists/) | Existing passes belong to the exact Revision 1 build unless a later artifact says otherwise |
| Professional UI critique      | [`.impeccable/critique/`](../.impeccable/critique/)                                           | Historical Revision 1 UI evidence, not approval of pending Stitch frames                    |
| Curated browser screenshots   | [`output/playwright/feature003-audit/`](../output/playwright/feature003-audit/)               | Historical Revision 1 browser evidence                                                      |

Generated Expo exports (`dist/`, `output/web-*`) and raw Playwright CLI session directories are
reproducible build/tool output and are not versioned evidence. Preserve the command and result in
the evidence ledger; preserve only deliberately selected screenshots.

## Documentation rules

- Update the active Feature 003 source of truth; do not create a second copy under `docs/`.
- Treat both Stitch prompt packs as generation input. Do not implement from them or call generated
  screens approved until the user supplies and approves them.
- Keep behavior changes aligned across the spec, product contract, implementation, tests, and
  runbook.
- Keep historical evidence separate from Revision 2 and Revision 3 results; never carry a pass
  forward by analogy.
- Label automated, web, Android, and human evidence separately.
- Prefer links to canonical files over repeating long policy text.
- Never document prepared AI, synthetic media, symbolic growth, or self-reported activity as a live
  production capability or measured environmental impact.
