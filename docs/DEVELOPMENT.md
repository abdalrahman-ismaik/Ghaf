# Development and testing

This guide is the practical path for installing, running, resetting, and verifying the current
Feature 003 prototype. Run every command from the repository root.

## Prerequisites

- Git
- Node.js 22.13 or newer
- npm

The repository includes `.nvmrc` for teams using nvm:

```bash
nvm install
nvm use
node --version
npm --version
```

Node 24 is also accepted by the current `engines` range and has passed the local checks. Use one
Node version consistently for install and validation.

## Clean install

Install exactly from `package-lock.json`:

```bash
npm ci
```

The application needs no API key, backend, Expo account, camera permission, microphone permission,
or real Child data. `EXPO_PUBLIC_GHAF_SERVICE_MODE=mock` is the optional explicit form of the built-in
default. No live-provider URL or client-side provider secret is supported.

## Choose a runtime

### Web preview — easiest

```bash
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. Web is suitable for rapid layout,
copy, deterministic-flow, and screenshot review. It cannot pass native Android, TalkBack, physical
touch, IME, media, permission, predictive Back, or device-performance gates.

### Physical phone through Expo

Install an Expo Go version or development build compatible with this repository's Expo SDK, place
the development machine and phone on a reachable network, then run:

```bash
npm start -- --offline
```

Scan the printed QR code or select the connected target from Expo. The `--offline` flag prevents
Expo CLI dependency discovery; `npm ci` may still need registry access when packages are not cached.

### Android SDK, emulator, or USB device

Install a compatible Java runtime, Android Studio/SDK, platform tools (`adb`), and either an emulator
or an authorized USB device. Configure the SDK environment for your operating system, then verify:

```bash
adb devices
npm run android -- --offline
```

If `adb`, Java, the SDK environment, or a named device is missing, Android validation is `BLOCKED`;
do not substitute a web pass.

### iOS

On macOS with Xcode and a configured simulator/device:

```bash
npm run ios
```

iOS is a compatibility surface. Android remains the competition authority.

## Reset to the canonical baseline

1. Enter the prototype and choose Parent mode.
2. Open a Parent route.
3. Choose **Reset demo** in the top prototype bar.
4. Confirm the reset.
5. Verify route `/`, Arabic RTL, Parent demo mode, Salem selected, and no active assignment.

The full counter and fixture baseline is in [DEMO_RUNBOOK.md](../DEMO_RUNBOOK.md). Reloading alone is
not the authoritative reset.

## Validation

Run the complete repository gate:

```bash
npm run verify
```

That command runs:

1. strict TypeScript;
2. Expo ESLint;
3. Prettier checks for maintained source/developer docs;
4. all deterministic Vitest suites;
5. Expo dependency alignment; and
6. a static web export to ignored `dist/`.

Run an individual layer when iterating:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:watch
npm run build:web
```

Before a handoff, also inspect repository hygiene:

```bash
git diff --check
git diff --stat
git status --short
```

`npm test` covers domain, service, state, privacy, assistant safety, reset, and deterministic
operator flows. It is not native UI automation. Record physical and named-human evidence only in
the root Feature 003 runbook.

## Troubleshooting

### Unsupported Node version

```bash
nvm use
npm ci
```

If nvm is unavailable, install a Node version satisfying `package.json#engines` and rerun the clean
install.

### Stale Metro or web bundle

```bash
npx expo start --clear
```

Then choose the target again. `dist/` and `.expo/` are ignored and can be regenerated.

### Port already in use

```bash
npm run web -- --offline --port 8082
```

### Android target does not open

Check `adb devices`, SDK environment variables, emulator state, USB authorization, and Java before
retrying. Expo starting successfully does not prove that a physical Android build ran.

### Tool-specific browser or DevTools warning

Metro can continue even when an optional local browser/DevTools process lacks a host library. Use
the printed URL manually, or install the missing host dependency. Treat application exceptions and
browser console errors separately from optional tooling-launch errors.

## Evidence discipline

- Start every meaningful validation from the canonical reset.
- Record the branch/commit and dirty files.
- Keep automated, browser, native, and human results separate.
- Do not commit `dist/`, `.expo/`, raw `.playwright-cli/` sessions, provider secrets, or real Child
  information.
- Preserve curated Feature 002/003 evidence and its historical attribution.
