# Repository structure and placement rules

Ghaf is one Expo application with optional server adapters and development tooling. Its layout
separates runtime code, executable verification, product authority, curated evidence and local
generated output. This guide describes the maintained repository, not every ignored local file.

```text
Ghaf/
├── app/                       Expo Router routes and route layouts
├── src/
│   ├── components/            Shared primitives and feature presentation
│   ├── config/                Build-time flags and asset configuration
│   ├── design/                Tokens, typography, theme and motion
│   ├── features/              Domain policies, controllers and projections
│   ├── i18n/                  Bilingual resource authority
│   ├── models/                Shared types and schemas
│   ├── services/
│   │   ├── interfaces/        Provider-neutral contracts
│   │   ├── local/             Device-local repositories and platform storage
│   │   ├── mock/              Deterministic providers and synthetic fixtures
│   │   ├── native/            Optional native adapters
│   │   ├── remote/            Optional gateway clients
│   │   └── index.ts           Composition and registry
│   ├── state/                 Application commands and session orchestration
│   └── utils/                 Small shared helpers
├── tests/                     Subject-based suites, helpers and legacy path map
├── assets/                    Reviewed packaged images, audio and brand assets
├── public/                    Static web-served icons and manifest
├── workers/                   Optional server boundaries; no default deployment
├── scripts/                   Repository, brand, native and tooling utilities
├── tools/                     Isolated optional development-tool package
├── specs/                     Numbered Spec Kit feature contracts and evidence
├── docs/
│   ├── architecture/          System boundaries, structure, audit and ADRs
│   ├── competition-readiness/ Coordination, workstream reports and rehearsal evidence
│   ├── content/               Reviewed learning content and provenance
│   ├── design/                Design intake, selected references and brand provenance
│   ├── merge-notes/           Historical integration records
│   └── screenshots/           Curated README screenshots
├── .github/                   CI and contribution templates
├── .agents/                   Project skills
├── .codex/                    Project agent configuration
├── .specify/                  Spec Kit constitution, templates and automation
└── output/                    Ignored generated work; exact historical exceptions only
```

## Where a change belongs

| Change                              | Location and boundary                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| Screen or route entry               | `app/`; delegate reusable UI and domain behavior into `src/`                       |
| Shared control                      | `src/components/`; reuse the existing tokens and translated copy                   |
| One feature's rule                  | `src/features/<existing-feature>/`; keep helpers local until reuse is real         |
| Shared schema                       | `src/models/`; do not create a competing award or access authority                 |
| Provider implementation             | `src/services/{mock,local,native,remote}/` behind existing interfaces              |
| Application transaction             | `src/state/`; preserve approval ordering, isolation, stale-result guards and reset |
| Domain or UI regression             | Relevant `tests/<subject>/` folder; use meaningful existing fixtures/helpers       |
| Product amendment                   | Applicable `specs/<number>-<feature>/` package before implementation               |
| Architecture decision               | `docs/architecture/adr/` with context, tradeoffs and consequences                  |
| Asset authoring/provenance          | `docs/design/` or the approved asset package's provenance record                   |
| New selected screenshot             | `docs/screenshots/` with feature, source revision and actual evidence scope        |
| Export, recording draft or tool log | Ignored `output/`; never stage the entire directory                                |

Use PascalCase for component modules and camelCase for ordinary TypeScript modules, following
nearby conventions. Use kebab-case for new feature directories and documentation filenames unless
an established contract requires a canonical name. Keep Expo route names and parameter syntax.
Avoid catch-all `common`, `misc`, `shared2` or new barrel exports without a demonstrated need.

The [source guide](../../src/README.md) explains existing revision-named component folders.
The [test guide](../../tests/README.md) explains suite selection and historical path lookup.

## Canonical documents and preserved history

Root `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `RESEARCH_BASIS.md`,
`PROTOTYPE_LIMITATIONS.md`, `TEAM_OWNERSHIP.md` and `DEMO_RUNBOOK.md` are established contract
paths. Keep them stable. The similarly named files under `docs/` are historical Feature 002
records, with their own acceptance boundaries; they are not duplicate current policies.

Likewise, 66 already tracked files under `output/pdf/` and `output/playwright/` remain at their
original paths. The exact exception list is
[`preserved-artifacts.json`](../../scripts/repository/preserved-artifacts.json). It preserves
evidence links; it is not permission to add future exports. Do not rewrite original results or
promote old screenshots to current device acceptance.

Do not add navigation Markdown inside `app/`: keep the Expo Router directory focused on routes.
Configuration files stay at the root where their tools discover them. An extra `apps/mobile/`
wrapper, package workspace or second dependency manager would add migration cost without a second
application requirement.

## Automatic enforcement

`npm run repo:check` checks maintained navigation links, the historical test relocation map,
accidental copied filenames, flat-root tests and tracked generated output. Local checks include
untracked, nonignored files as link targets; CI checks the committed checkout. Link validation
is deliberately limited to the maintained navigation documents, checks destinations rather than
heading anchors, and does not fetch external URLs or reinterpret historical evidence prose.

The [CI workflow](../../.github/workflows/ci.yml) runs that check, strict TypeScript, lint,
formatting, the complete Vitest suite, the local Expo compatibility check and a web export.
It has read-only repository permissions and does not deploy. `.editorconfig` keeps basic editor
behavior aligned; Prettier remains the formatting authority.
