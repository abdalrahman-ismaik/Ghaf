# Ghaf — غاف

Ghaf is an Arabic-first Parent–Child family routine prototype for SMAC 2026. A Parent prepares a
safe, age-appropriate task; a Child completes it with permitted help; the Parent confirms it and
gives specific praise; eligible acquisition work earns fixed symbolic Seeds and grows a shared UAE
living garden.

> This is a competition MVP, not a production child-data service. It uses one synthetic household,
> deterministic local providers, and visibly prepared assistant/media fixtures. It requires no API
> key, account, backend, camera, microphone, or real Child information.

## Current status

Feature 003 Revision 3 is the current competition experience. It is delivered as one Expo app with
separate Parent and Child journeys, deterministic offline fallbacks, bilingual Arabic/English UI,
and guarded optional live-assistant integrations. Parent approval remains the authority for every
task, reward, and permanent growth event.

Growth Journey, badges, learning, Parent Progress, Shared Growth, private League, and Reveal are
implemented as bounded product slices. Features that still require physical-device or human review
remain clearly identified in the evidence ledger rather than being presented as production-ready.

| Area                 | Current evidence                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Product              | Complete deterministic Parent → Child → approval → Seeds → garden journey with private family extensions                                 |
| Automated checks     | Strict TypeScript, lint, formatting, deterministic tests, dependency alignment, and export checks are available through `npm run verify` |
| Web preview          | Arabic RTL and English LTR responsive review is supported through Expo Web                                                               |
| Android              | Android JavaScript export passes; physical-device, TalkBack, native Back/IME, safe-area, and OS font-scale checks remain separate gates  |
| Production readiness | **No** — this is a synthetic competition MVP, not a production child-data or payment service                                             |

The detailed, auditable status lives in [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md). A browser or source pass
does not count as native-device or human-review evidence.

## Run and test locally

Use one of the following two paths. Install dependencies once with `npm ci` before working offline.

### Offline web testing

From the repository root:

```bash
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. The app starts in Arabic RTL. Use
the language switcher for English. This is the quickest visual check, but it does not validate
native Android behavior.

### Android Studio and a USB device on Windows

1. In Android Studio's SDK Manager, install Android SDK Platform 36, Build-Tools, Platform-Tools,
   NDK `27.1.12297006`, and CMake `3.22.1`. Keep at least 10 GB free for the first native build.
2. Enable Developer options and USB debugging on the Android device, connect it, and accept the
   device authorization prompt.
3. Open PowerShell in the Windows checkout, then run:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:ANDROID_HOME\platform-tools;$env:Path"
adb devices
adb reverse tcp:8081 tcp:8081
npx expo run:android --device
```

Select the connected device when prompted. The first native build can take several minutes because
Gradle compiles and downloads Android tooling; later builds reuse its cache. For later UI-only
sessions, keep the device connected and rerun the same commands.

To inspect the current default-off R002b screens in either path, create an ignored `.env.local`
containing:

```dotenv
EXPO_PUBLIC_R002B_PROGRESSION_ENGINE=true
EXPO_PUBLIC_R002B_IMPACT_PATH_UI=true
EXPO_PUBLIC_R002B_BADGES_UI=true
EXPO_PUBLIC_R002B_LEARNING_UI=true
EXPO_PUBLIC_R002B_PARENT_PROGRESS_UI=true
EXPO_PUBLIC_R002B_SHARED_GROWTH_VIEW=true
```

Leave `EXPO_PUBLIC_R002B_REVEAL_BUNDLE_V2` and
`EXPO_PUBLIC_R002B_SHARED_GROWTH_CONTRIBUTION` unset. Those flows remain fail-closed while their
release evidence is incomplete. Restart Expo after changing `.env.local`.

## Verify the repository

Run the complete repeatable local gate:

```bash
npm run verify
```

It runs TypeScript, lint, formatting, all Vitest suites, Expo dependency alignment, and a static web
export. The export is written to ignored `dist/`; it is a build artifact, not source evidence.

Useful verification commands:

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm test`             | Run deterministic domain, service, state, and flow tests  |
| `npm run test:watch`   | Run tests in watch mode                                   |
| `npm run typecheck`    | Check strict TypeScript                                   |
| `npm run lint`         | Run Expo ESLint                                           |
| `npm run format:check` | Check maintained source and developer-document formatting |
| `npm run build:web`    | Produce the ignored static web export in `dist/`          |
| `npm run verify`       | Run the complete repository gate                          |

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

| Path              | Responsibility                                                                      |
| ----------------- | ----------------------------------------------------------------------------------- |
| `app/`            | Thin Expo Router route composition and navigation                                   |
| `src/components/` | Shared UI primitives and Family Growth presentation components                      |
| `src/design/`     | Design tokens and semantic visual roles                                             |
| `src/features/`   | Pure bounded domain policy and lifecycle logic                                      |
| `src/i18n/`       | Arabic/English interface resources and direction utilities                          |
| `src/models/`     | Strict Feature 003 domain and session contracts                                     |
| `src/services/`   | Provider-neutral interfaces, registry, and deterministic local providers            |
| `src/state/`      | One resettable in-memory application session and guarded commands                   |
| `tests/`          | Domain, service, state, privacy, safety, reset, and complete-flow tests             |
| `docs/`           | Documentation index, architecture guidance, development guide, and product evidence |

For boundaries, dependency direction, data ownership, and failure behavior, read
[Architecture](docs/architecture/ARCHITECTURE.md).

## Documentation map

- [Documentation index](docs/README.md) — public engineering, product, and evidence guide.
- [Product contract](PRODUCT.md) — users, behavior, reward/garden rules, AI jobs, and P0 scope.
- [Design contract](DESIGN.md) and [design direction](DESIGN_DIRECTION.md) — system rules and visual
  north star.
- [Research basis](RESEARCH_BASIS.md) — reward, safety, content, and UAE-grounding rationale.
- [Prototype limitations](PROTOTYPE_LIMITATIONS.md) — truthful capability boundaries.
- [Demo runbook](DEMO_RUNBOOK.md) — judge journey and evidence status.
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
