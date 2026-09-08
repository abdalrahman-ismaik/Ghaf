<p align="center">
  <img src="assets/brand/ghaf/ghaf-mark-full-color-1024.png" alt="Ghaf tree logo" width="132" />
</p>

<h1 align="center">Ghaf — غاف</h1>

<p align="center">
  <strong>Arabic-first family routines that grow connection, confidence, and sustainable habits.</strong>
</p>

<p align="center">
  SMAC 2026 competition prototype · Expo · React Native · Android-first · Arabic RTL + English LTR
</p>

Ghaf helps a Parent turn an everyday routine into one clear, age-appropriate task. A Child can
choose the task, complete it with permitted help, and ask for bounded coaching. After the Parent
confirms the action and gives specific praise, eligible acquisition work earns a fixed symbolic
Seed and grows the family's UAE-inspired garden.

> **Prototype boundary:** Ghaf currently uses a synthetic household, deterministic local data, and
> prepared assistant/media experiences. It is not a production child-data, authentication,
> payment, or environmental-impact measurement service.

## Product screens

<table>
  <tr>
    <td align="center" width="33%">
      <img src="docs/screenshots/parent-home-ar.png" alt="Arabic Parent Home screen" width="240" />
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/child-today-ar.png" alt="Arabic Child Today task screen" width="240" />
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/family-garden-ar.png" alt="Arabic Family Garden screen" width="240" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Parent Home</strong><br />Prepare and review the next task.</td>
    <td align="center"><strong>Child Today</strong><br />Choose, understand, and complete it with help.</td>
    <td align="center"><strong>Family Garden</strong><br />Recognize confirmed progress without loss or pressure.</td>
  </tr>
</table>

<p align="center"><sub>Arabic RTL mobile captures from the local synthetic competition build.</sub></p>

## The Ghaf experience

```text
Parent prepares and approves a task
  → Child chooses, completes, or asks for help
  → Parent confirms the observable action and gives specific praise
  → eligible acquisition work awards the displayed Seeds exactly once
  → permanent symbolic garden growth records the family's journey
```

| Experience            | What it provides                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Parent journey        | Family setup, task creation and approval, confirmation, praise, progress, and private reward plans |
| Child journey         | A separate, age-appropriate Today view with choice, retry, permitted help, and bounded coaching    |
| Sustainable growth    | Eight curated task categories, fixed Seeds, and five UAE-inspired landscape tracks                 |
| Family connection     | Private family planning, cooperative canopy growth, and an invite-only synthetic League            |
| Safe assistance       | Constrained Parent Guide and Child Coach intents with deterministic fallback and safety validation |
| Accessible foundation | Arabic-first RTL, equivalent English LTR, reduced-motion support, captions, and scalable layouts   |

Ghaf's proposed **Family Plus** model keeps the core experience ad-free and previews one
household subscription for families with three to six Children. The competition build does not
process purchases or activate extra profiles; the
[commercial case](docs/GHAF_PLUS_COMMERCIAL_CASE.md) documents the pricing assumptions, which
never change a Child's safety, help, rewards, or access.

## Why it is different

- **Family agency first:** the Parent approves tasks and recognition; the Child may choose, ask for
  help, retry, or use an agreed smaller equivalent.
- **Growth without punishment:** earned Seeds and garden progress are permanent. There is no debt,
  loss, dying tree, randomized reward, or speed-based ranking.
- **AI within clear boundaries:** assistance stays tied to the approved task and cannot diagnose,
  infer personality or emotion, request secrets, or replace a trusted adult.
- **Privacy by design:** Parent and Child routes are separate, family rewards stay private, and
  shared views receive only explicitly eligible coarse events.
- **Built for its context:** Arabic is the starting language, Android is the authoritative demo
  platform, and the symbolic garden uses recognizable UAE landscapes.

## Quick start

### Requirements

- Node.js 22.13 or newer
- npm
- Git

Install the locked dependencies and start the offline web preview:

```bash
npm ci
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. The app starts in Arabic RTL; use
the language control to switch to English.

For an Android Studio emulator or a physical USB device, follow the host-specific SDK, ADB, WSL2,
and native build instructions in the [development guide](docs/DEVELOPMENT.md). Android device
testing is authoritative; the web preview does not validate native Back, keyboard, permissions,
TalkBack, safe areas, or device performance.

## Verification

Run the complete repeatable repository gate:

```bash
npm run verify
```

| Command                | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `npm test`             | Run deterministic domain, service, state, and flow tests |
| `npm run typecheck`    | Check strict TypeScript                                  |
| `npm run lint`         | Run Expo ESLint                                          |
| `npm run format:check` | Check maintained source and documentation formatting     |
| `npm run build:web`    | Produce the ignored static web export in `dist/`         |

Automated checks do not replace physical Android, accessibility, media, or human-review evidence.
The current auditable gate status is recorded in the [demo runbook](DEMO_RUNBOOK.md).

## Architecture

Ghaf remains one Expo application with thin routes, reusable presentation components,
provider-neutral services, bounded domain policy, and a resettable deterministic provider for
every required competition path.

```text
app/ routes
  → src/components/ + src/design/ + src/i18n/
  → src/state/usePrototypeStore.ts
  → src/features/ domain and assistant policy
  → src/services/interfaces/ provider-neutral contracts
  → src/services/mock/ deterministic providers and fixtures
```

| Path              | Responsibility                                                        |
| ----------------- | --------------------------------------------------------------------- |
| `app/`            | Expo Router screens and navigation                                    |
| `src/components/` | Shared UI and Family Growth presentation                              |
| `src/features/`   | Task, reward, garden, privacy, and assistant rules                    |
| `src/services/`   | Contracts, provider registry, and deterministic local implementations |
| `src/state/`      | Application commands and exact prototype reset                        |
| `src/i18n/`       | Arabic/English resources and direction utilities                      |
| `tests/`          | Domain, safety, privacy, reset, and complete-flow verification        |

See the [architecture guide](docs/architecture/ARCHITECTURE.md) for dependency direction, data
ownership, and failure behavior.

## Documentation

- [Documentation index](docs/README.md) — engineering, product, and evidence map
- [Product contract](PRODUCT.md) — users, lifecycle rules, commercial preview, and P0 scope
- [Design contract](DESIGN.md) and [design direction](DESIGN_DIRECTION.md) — visual and interaction
  rules
- [Research basis](RESEARCH_BASIS.md) — reward, safety, content, and UAE-grounding rationale
- [Development guide](docs/DEVELOPMENT.md) — setup, USB device workflow, reset, and troubleshooting
- [Prototype limitations](PROTOTYPE_LIMITATIONS.md) — explicit capability and evidence boundaries
- [Demo runbook](DEMO_RUNBOOK.md) — judge journey, expected values, and validation status
- [Contributing](CONTRIBUTING.md) — ownership, implementation, validation, and handoff workflow

## Safety and truthfulness

- Parent approval is required before assignment and before Seeds or symbolic growth.
- Seeds are fixed, nonfinancial, permanent, and never deducted.
- No Child age band receives unrestricted chat, live background listening, or hidden analysis.
- Prepared assistants disclose that they may be wrong and direct hazards to a trusted adult.
- Symbolic garden growth does not claim that a real tree was planted or that environmental impact
  was measured.
- Live Child media processing, production accounts/storage, real payments, public ranking,
  analytics, notifications, and deployment infrastructure are outside the current P0 build.

Never place provider secrets in `EXPO_PUBLIC_*` variables or the mobile bundle. The complete
competition path remains deterministic and available offline.
