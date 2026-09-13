# Root files and public repository contents

The 2026-09-13 cleanup follows the user's explicit authorization to relocate root documentation.
The root now keeps three Markdown entry points and the configuration files used by development
tools. Eight long documents have moved into `docs/`; none is needed at the root by the application.

## What stays at the root

| File                                  | Why it stays                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `README.md`                           | GitHub landing page and quick start                                             |
| `CONTRIBUTING.md`                     | Standard contributor entry point and existing verification input                |
| `AGENTS.md`                           | Automatically discovered coding-agent instructions and managed Spec Kit context |
| `package.json`, `package-lock.json`   | npm application manifest and reproducible dependency lock                       |
| `app.config.ts`                       | Expo application configuration                                                  |
| `tsconfig.json`                       | TypeScript project configuration                                                |
| `eslint.config.js`                    | ESLint configuration                                                            |
| `vitest.config.mts`                   | Test-runner configuration                                                       |
| `.prettierrc.json`, `.prettierignore` | Formatting rules and generated-file exclusions                                  |
| `.editorconfig`, `.gitattributes`     | Editor defaults and stable Git line endings                                     |
| `.nvmrc`                              | Project Node version baseline                                                   |
| `.gitignore`                          | Local-file exclusions                                                           |
| `.env.example`                        | Documented public placeholders; no real credentials                             |

These conventional locations avoid custom configuration flags and preserve fresh-checkout setup.
Ignored folders such as `node_modules/`, `.expo/`, `dist/` and `output/` may still exist locally;
their presence on disk does not make them public Git content.

## Moved documents

| Previous root file               | Current location                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `PRODUCT.md`                     | [Product contract](../PRODUCT.md)                                                    |
| `DESIGN.md`                      | [Design contract](../DESIGN.md)                                                      |
| `RESEARCH_BASIS.md`              | [Research basis](../product/RESEARCH_BASIS.md)                                       |
| `PROTOTYPE_LIMITATIONS.md`       | [Capability limitations](../product/PROTOTYPE_LIMITATIONS.md)                        |
| `DESIGN_DIRECTION.md`            | [Design direction](../design/DESIGN_DIRECTION.md)                                    |
| `DEMO_RUNBOOK.md`                | [Current demonstration runbook](../competition-readiness/DEMO_RUNBOOK.md)            |
| `TEAM_OWNERSHIP.md`              | [Current file reservations and handoffs](../competition-readiness/TEAM_OWNERSHIP.md) |
| `CODEX_IMPLEMENTATION_PROMPT.md` | [Archived implementation prompt](../archive/CODEX_IMPLEMENTATION_PROMPT.md)          |

`docs/PRODUCT.md` and `docs/DESIGN.md` use the installed design tooling's supported fallback
directory, so no root symlink, duplicate document or vendor-tool patch is needed. The
[relocation map](document-relocations.json) resolves old narrative references. Existing Markdown
links were updated where their files were not held by another active writer. Live coordination
and Feature 016 work remain under their existing owners.

## What is ignored or removed

- Raw Flutter reference source under `assets/character_companion/` stays local. Approved extracted
  assets belong in the separately reviewed runtime asset catalog.
- Supplied competition PDFs under `docs/SMAC 2026/` stay local as reference inputs; the originals
  are retained on disk. Their requirements remain documented in the public project guidance.
- `docs/private/` is reserved for private local notes, not required contribution disclosures.
- Machine-local agent sessions, logs, local overrides and caches are ignored. Shared project
  instructions, skills and configuration remain versioned.
- Redundant Windows `:Zone.Identifier` download sidecars are removed only from the supplied SMAC
  and Growth Journey prompt-pack input directories. Original PDFs and Markdown are retained.

Adding a path to `.gitignore` does not untrack an existing file or erase earlier commits. This
cleanup does not rewrite history or make previously committed information private.

## Public evidence

Product specifications, test results, asset provenance, limitations, Git history and
[AI-assistance disclosure](../AI_ASSISTANCE.md) remain available. Detailed contribution and prompt
records stay tracked. Moving documentation does not change who produced it or establish student
review. Genuine sensitive information needs a separate, explicit redaction process; no such
history rewrite or public submission is performed here.

## Verification

Passed: five repository-tool tests; maintained navigation and all eight relocation targets;
unchanged design-context discovery; root Markdown placement; seven ignore and seven retain cases;
scoped lint/format; unchanged managed Spec Kit block; and diff integrity. Seven download sidecars
were removed while their original documents remain on disk.

Sixteen moved/relinked documents introduce zero new broken Markdown destinations. Their 54
pre-existing local/historical destinations are retained rather than represented as public build
artifacts. The main documentation navigation passes independently.

Application code, application tests, package/configuration work and live Feature 016 records are
outside this maintenance boundary. No native build, provider operation, full application regression
or human acceptance is inferred from these documentation checks.
