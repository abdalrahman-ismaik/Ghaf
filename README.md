# Ghaf — غاف

Ghaf is an Arabic-first Parent–Child family routine prototype for SMAC 2026. A Parent prepares a
safe, age-appropriate task; a Child completes it with permitted help; the Parent confirms it and
gives specific praise; eligible acquisition work earns fixed symbolic Seeds and grows a shared UAE
living garden.

> This is a competition MVP, not a production child-data service. It uses one synthetic household,
> deterministic local providers, and visibly prepared assistant/media fixtures. It requires no API
> key, account, backend, camera, microphone, or real Child information.

## Current status

| Area                 | Current evidence                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Product              | Feature 003 — Family Growth Garden is implemented as one ten-route deterministic P0 journey                                                 |
| Automated checks     | 17 test files / 305 tests, TypeScript, Expo ESLint, Prettier, and Expo dependency alignment passed at the latest recorded checkpoint        |
| Web preview          | Arabic RTL and English LTR journeys passed at a 390×844 browser proxy with no runtime errors or horizontal overflow                         |
| Android              | Authoritative physical-device validation is **BLOCKED** on this host because the Android SDK, ADB, Java, and a named device are unavailable |
| Human review         | Arabic/UAE culture, safeguarding, accessibility, comprehension, and timed rehearsals are **NOT RUN** until completed by named reviewers     |
| Production readiness | **No** — data, assistants, media, sharing, rewards, and growth are intentionally local/synthetic/prepared                                   |

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

## Demonstrate the P0 loop

The canonical judge flow is:

```text
Parent creates and reviews a Green Impact task
  → Child chooses, starts, uses bounded Coach help, and submits
  → Parent confirms and presents specific praise
  → a separate continuation awards exactly 12 Seeds once
  → Mangrove reaches 60/60, canopy reaches 20/25, circle reaches 12/12
```

Use [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md) for the exact bilingual route sequence and expected values.
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
- Cross-household views receive only coarse eligible Green Impact events—never Child identity,
  Seeds, task records, notes, reflection, or media.
- Symbolic garden growth is not a claim that real trees were planted or environmental impact was
  measured.
- Live AI, production authentication/storage, real Child data/media, public ranking, payments,
  analytics, notifications, and deployment infrastructure are outside P0.

Do not place provider secrets in `EXPO_PUBLIC_*` variables or the mobile bundle. The implemented P0
path is deterministic and local.
