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

## Run the app

Use only one of these two supported local workflows.

### Offline web testing

```bash
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. Web is suitable for rapid layout,
copy, deterministic-flow, and screenshot review. It cannot pass native Android, TalkBack, physical
touch, IME, media, permission, predictive Back, or device-performance gates.

### Android Studio and a USB device on Windows

1. In Android Studio's SDK Manager, install Android SDK Platform 36, Build-Tools, Platform-Tools,
   NDK `27.1.12297006`, and CMake `3.22.1`. Keep at least 10 GB free for the first native build.
2. Enable Developer options and USB debugging on the Android device, connect it, and accept the
   authorization prompt.
3. Open PowerShell in the Windows checkout and run:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:ANDROID_HOME\platform-tools;$env:Path"
adb devices
adb reverse tcp:8081 tcp:8081
npx expo run:android --device
```

Select the connected device when prompted. The first build downloads and compiles native Android
tooling, so it can take several minutes; later builds reuse Gradle's cache. If `adb`, Java, the SDK,
or the authorized device is unavailable, Android validation is `BLOCKED`; do not substitute a web
pass.

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
npm run web -- --offline --clear
```

Then reopen the printed local URL. `dist/` and `.expo/` are ignored and can be regenerated.

### Port already in use

```bash
npm run web -- --offline --port 8082
```

### Android target does not open

Check `adb devices`, SDK environment variables, the USB cable and authorization, available disk
space, and Java before retrying. Expo starting successfully does not prove that a physical Android
build ran.

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
