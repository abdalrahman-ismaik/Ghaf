# Ghaf — غاف

Ghaf is an Arabic-first Parent–Child family routine prototype for SMAC 2026. Feature 003 Revision 3
inherits the approved Revision 2 family experience, then plans one free private Seed-derived Impact
Path, permanent deterministic badges, and finite sourced learning inside the same application.

> R001 Batch 1 is the only released later-revision runtime: it delivers a bounded Revision 2
> Welcome and first-time Parent-onboarding slice. Every other Revision 2 screen and all Revision 3
> Growth Journey runtime remain on hold until their Google Stitch designs are supplied and
> approved. The older ten-route journey remains a preserved Revision 1 baseline.

## Current status

| Area                    | Current evidence                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product contract        | Feature 003 Revision 3 planning active; inherited Revision 2 rules plus the private Impact Path, badges, and finite learning are documented       |
| Runtime                 | R001 Batch 1 implemented; all later Revision 2 and all Growth Journey screens remain **ON HOLD** pending approved Stitch designs                  |
| Historical checks       | Revision 1: 17 test files / 305 tests plus TypeScript, lint, format, Expo checks, and bilingual web-proxy journey passed                          |
| Later-revision evidence | Batch 1: 20 test files / 332 tests and bilingual web-proxy checks passed; full Revision 2 and all Revision 3 evidence remain incomplete           |
| Android                 | Windows release APK build/install passed on SM_T835; the observed Arabic/English physical journey and native interaction gates remain **NOT RUN** |
| Human review            | Arabic/UAE culture, safeguarding, accessibility, comprehension, and timed rehearsals are **NOT RUN** until completed by named reviewers           |
| Production readiness    | **No** — data, assistants, media, sharing, rewards, and growth are intentionally local/synthetic/prepared                                         |

The detailed, auditable status lives in [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md). A browser or source pass
does not count as native-device or human-review evidence.

## Run it in five minutes

Prerequisites:

- Node.js 22.13 or newer; `.nvmrc` pins the repository baseline;
- npm; and
- Git.

The easiest path is the local web preview:

```bash
nvm use        # optional, when nvm is installed
npm ci
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. The app starts in Arabic RTL. Use
the language switcher for English.

For a phone through Expo's QR workflow:

```bash
npm start -- --offline
```

For an Android emulator or USB device configured with the Android SDK and ADB:

```bash
npm run android -- --offline
```

Android is the competition authority; web is a convenient development and visual-review surface.
See [Development and testing](docs/DEVELOPMENT.md) for prerequisites and troubleshooting.

## Verify the repository

Run the complete repeatable local gate:

```bash
npm run verify
```

It runs TypeScript, lint, formatting, all Vitest suites, Expo dependency alignment, and a static web
export. The export is written to ignored `dist/`; it is a build artifact, not source evidence.

Useful individual commands:

| Command                | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `npm start`            | Start the Expo development server                              |
| `npm run web`          | Start the web preview                                          |
| `npm run android`      | Start and open Android; requires a configured device/toolchain |
| `npm run ios`          | Start and open iOS; requires macOS/Xcode                       |
| `npm test`             | Run deterministic domain, service, state, and flow tests once  |
| `npm run test:watch`   | Run tests in watch mode                                        |
| `npm run typecheck`    | Check strict TypeScript                                        |
| `npm run lint`         | Run Expo ESLint                                                |
| `npm run format:check` | Check maintained source and developer-document formatting      |
| `npm run build:web`    | Produce the ignored static web export in `dist/`               |
| `npm run verify`       | Run the complete repository gate                               |

These automated tests do not replace Android, accessibility, media, or human acceptance checks.

## Current runnable baseline

The runnable app starts with the R001 Welcome and Parent onboarding slice, then hands off to the
preserved Revision 1 Parent surface. That historical surface still demonstrates this older flow:

```text
Parent creates and reviews a Green Impact task
  → Child chooses, starts, uses bounded Coach help, and submits
  → Parent confirms and presents specific praise
  → a separate continuation awards exactly 12 Seeds once
  → Mangrove reaches 60/60, canopy reaches 20/25, circle reaches 12/12
```

Use [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md) for the evidence separation and historical route sequence.
To reset manually, enter Parent mode, open a Parent route, choose **Reset demo** in the top prototype
bar, and confirm. The app returns to `/` in Arabic RTL with the canonical synthetic baseline.

## Architecture at a glance

```text
app/ routes
  → src/components/ + src/design/ + src/i18n/
  → src/state/usePrototypeStore.ts application commands
  → src/features/ pure task/reward/garden/circle/assistant policy
  → src/services/interfaces/ provider-neutral contracts
  → src/services/mock/ deterministic providers and fixtures
```

| Path              | Responsibility                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `app/`            | Thin Expo Router route composition and navigation                                                |
| `src/components/` | Shared UI primitives and Family Growth presentation components                                   |
| `src/design/`     | Design tokens and semantic visual roles                                                          |
| `src/features/`   | Pure bounded domain policy and lifecycle logic                                                   |
| `src/i18n/`       | Arabic/English interface resources and direction utilities                                       |
| `src/models/`     | Strict Feature 003 domain and session contracts                                                  |
| `src/services/`   | Provider-neutral interfaces, registry, and deterministic local providers                         |
| `src/state/`      | One resettable in-memory application session and guarded commands                                |
| `tests/`          | Domain, service, state, privacy, safety, reset, and complete-flow tests                          |
| `specs/`          | Versioned Spec Kit records for Features 001–003                                                  |
| `docs/`           | Documentation index, architecture guidance, development guide, and preserved Feature 002 history |

For boundaries, dependency direction, data ownership, and failure behavior, read
[Architecture](docs/architecture/ARCHITECTURE.md).

## Documentation map

- [Documentation index](docs/README.md) — where active contracts, historical records, and evidence
  belong.
- [Product contract](PRODUCT.md) — users, behavior, reward/garden rules, AI jobs, and P0 scope.
- [Design contract](DESIGN.md) and [design direction](DESIGN_DIRECTION.md) — system rules and visual
  north star.
- [Google Stitch prompt pack](GHAF_GOOGLE_STITCH_PROMPT_PACK.md) — approved design-generation input;
  generated screens are not implementation authority until the user approves them.
- [Growth Journey prompt pack](docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md) — Revision 3 source
  material and generation input; runtime implementation remains Stitch-blocked.
- [Growth Journey preflight](specs/003-family-growth-garden/design-intake/growth-journey-preflight.md)
  — resolved product conflicts, required prerequisite screens, and future design evidence.
- [Badge catalog](docs/content/BADGE_CATALOG.md), [learning stories](docs/content/LEARNING_STORIES.md),
  and [Impact Path ADR](docs/architecture/adr/0002-impact-path-projection.md) — proposed deterministic
  content and projection contracts for the pending release.
- [Research basis](RESEARCH_BASIS.md) — reward, safety, content, and UAE-grounding rationale.
- [Prototype limitations](PROTOTYPE_LIMITATIONS.md) — truthful capability boundaries.
- [Active Feature 003 specification](specs/003-family-growth-garden/spec.md) — normative feature
  requirements and acceptance criteria.
- [Contributing](CONTRIBUTING.md) — ownership, implementation, validation, and handoff workflow.

## Safety and scope boundaries

- Parent approval is required before assignment and before Seeds or symbolic growth.
- Seeds are fixed, nonfinancial, permanent, and never deducted.
- The Child Coach is bounded to the approved task; no age band receives unrestricted chat.
- Prepared assistants disclose that they may be wrong and direct hazards to a trusted adult.
- The invite-only League may show only approved nickname, tree avatar, weekly rank, normalized
  score, and completed Challenge Leaves; never task details, evidence, age, accommodations, money,
  private categories, or unrestricted messages.
- Family Rewards are private Parent promises fulfilled outside the app, with no wallet, payment,
  custody, cash-out, or universal Seed-to-AED exchange rate.
- Impact Path progress is a free private projection of confirmed lifetime Seeds; badges are
  deterministic and private, while learning completion is idempotent and awards no Seeds or garden
  growth.
- Symbolic garden growth is not a claim that real trees were planted or environmental impact was
  measured.
- Live AI, production authentication/storage, real Child data/media, public ranking, payments,
  analytics, notifications, and deployment infrastructure are outside P0.

Do not place provider secrets in `EXPO_PUBLIC_*` variables or the mobile bundle. The implemented P0
path is deterministic and local.
