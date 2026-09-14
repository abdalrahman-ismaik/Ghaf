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

Use the web workflow for quick browser checks or the native workflow for authoritative Android
device checks.

### Offline web testing

```bash
npm run web -- --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. Web is suitable for rapid layout,
copy, deterministic-flow, and screenshot review. It cannot pass native Android, TalkBack, physical
touch, IME, media, permission, predictive Back, or device-performance gates.

### Android Studio and a physical USB device

#### 1. Install the native prerequisites

In Android Studio's SDK Manager, install Android SDK Platform 36, Android SDK Build-Tools,
Android SDK Platform-Tools, NDK `27.1.12297006`, and CMake `3.30.5`. Keep at least 10 GB free for the
first native build. Android Studio's bundled JDK is suitable; `java -version` must work in the
terminal used to run Expo.

On the phone, enable **Developer options** and **USB debugging**, use a data-capable cable, unlock
the phone, and accept its RSA authorization prompt.

#### 2. Put the Android SDK tools on the terminal path

Use the block for the development host. Change the SDK path if Android Studio shows a different
location under **Settings > Languages & Frameworks > Android SDK**.

Linux:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
adb devices -l
```

macOS:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
adb devices -l
```

Windows PowerShell:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:ANDROID_HOME\platform-tools;$env:Path"
adb devices -l
```

Continue only when the phone's state (the second column) is `device`. If it says `unauthorized`,
unlock the phone and accept the prompt. If no row appears, fix the cable, USB mode, host
permissions, or Windows OEM USB driver before building.

#### WSL2: keep the build and ADB on one side

A phone connected to Windows is not automatically available to Linux `adb` inside WSL2. Choose one
toolchain and use it consistently:

- To use Android Studio installed on Windows, keep the checkout on the Windows filesystem and run
  `npm`, Expo, and `adb` from Windows PowerShell. Do not reuse Linux `node_modules` from WSL.
- To build from a checkout stored under `/home/...` in WSL2, install the Linux Android SDK/JDK in
  WSL and attach the phone to WSL with `usbipd-win`. While attached to WSL, the phone is unavailable
  to Windows Android Studio; build from the WSL terminal, or use Android Studio running on Linux.

If Expo reports that `/home/<user>/Android/Sdk` is missing and finds no device, the command is
running in WSL while the Android toolchain and phone are still owned by Windows. Do not point the
Linux `ANDROID_HOME` at the Windows SDK under `/mnt/c`; switch to the Windows-owned workflow or
finish the WSL-owned setup below.

On the current Ghaf workstation, use the existing Windows checkout and Android Studio toolchain.
From WSL, enter Windows PowerShell:

```bash
powershell.exe -NoProfile
```

Then build from the Windows filesystem. Change the checkout or cache paths if needed:

```powershell
$GhafWindowsRoot="D:\Ghaf-device"
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:GRADLE_USER_HOME="D:\Ghaf-gradle-home"
$env:Path="$env:ANDROID_HOME\platform-tools;$env:Path"
Set-Location $GhafWindowsRoot
adb devices -l
npm.cmd ci
npx.cmd expo run:android --device SM_T835
```

The model name after `--device` is specific to the currently connected tablet. Use the model shown
by `adb devices -l`, or omit the value and select the physical device interactively. Keep the
Windows checkout at the same Git revision as the WSL source checkout before rebuilding native code.

For the WSL-owned workflow, install `usbipd-win`, update WSL, find the phone's bus ID, and share it
once from an **Administrator PowerShell**:

```powershell
winget install --interactive --exact dorssel.usbipd-win
wsl --update
usbipd list
$GhafUsbBusId="4-4"
usbipd bind --busid $GhafUsbBusId
```

Replace `4-4` with the bus ID printed for the phone. Keep a WSL terminal open, then attach it from a
normal PowerShell whenever the phone is reconnected:

```powershell
$GhafUsbBusId="4-4"
usbipd attach --wsl --busid $GhafUsbBusId
```

Verify from WSL before running Expo:

```bash
lsusb
adb kill-server
adb start-server
adb devices -l
```

Return the phone to Windows when finished:

```powershell
$GhafUsbBusId="4-4"
usbipd detach --busid $GhafUsbBusId
```

#### 3. First build and installation from the terminal

From the repository root in the same operating system that owns the Android SDK and phone, run:

```bash
npm ci
npx expo run:android --device
```

Select the USB phone when prompted. Because `android/` is intentionally ignored and absent from a
clean checkout, Expo prebuilds it automatically, compiles the debug app, installs it on the phone,
starts Metro, and launches Ghaf. The first build can take several minutes; later builds reuse the
Gradle cache.

`npm run android` is not the first-build command in this repository. It expands to
`expo start --android`, so it can launch an existing installation but cannot compile and install a
missing native app.

#### 4. Build and launch from Android Studio

Generate the native project once if `android/` does not exist:

```bash
npx expo prebuild --platform android
```

Open the generated `android/` directory in Android Studio, wait for Gradle sync, select the
connected phone and the `app` run configuration, then click **Run**. Keep Metro running in a second
terminal from the repository root:

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --localhost
```

The reverse tunnel makes the phone's `localhost:8081` reach Metro over USB, so phone and computer
do not need to share Wi-Fi. Open Ghaf on the phone if Android Studio does not bring it to the
foreground.

Do not run `npx expo prebuild --clean` as routine setup: it replaces the generated native project
and can discard deliberate native edits.

#### 5. Daily JavaScript and TypeScript loop

After the debug app is installed, most changes need Metro only:

```bash
adb devices -l
adb reverse tcp:8081 tcp:8081
npx expo start --localhost
```

When Metro runs from this repository in WSL but Windows still owns the connected tablet, call the
Windows ADB executable explicitly instead of Linux `adb`:

```bash
GHAF_WINDOWS_ADB="/mnt/c/Users/windows-user/AppData/Local/Android/Sdk/platform-tools/adb.exe"
GHAF_ANDROID_SERIAL="serial-from-adb-devices"
"$GHAF_WINDOWS_ADB" devices -l
"$GHAF_WINDOWS_ADB" -s "$GHAF_ANDROID_SERIAL" reverse tcp:8081 tcp:8081
npx expo start --localhost
```

Replace the Windows user and serial placeholders with Android Studio's SDK location and the first
column from `adb devices -l`.

Open Ghaf on the phone and use Fast Refresh. Run `npx expo run:android --device` again after adding
or changing a native dependency, an Expo config plugin, Android configuration, or native code.

If more than one device or emulator is connected, target the phone explicitly:

```bash
GHAF_ANDROID_SERIAL="serial-from-adb-devices"
GHAF_EXPO_DEVICE_NAME="model-from-adb-devices"
adb -s "$GHAF_ANDROID_SERIAL" reverse tcp:8081 tcp:8081
npx expo run:android --device "$GHAF_EXPO_DEVICE_NAME"
```

ADB's `-s` option expects the serial from the first column of `adb devices -l`. The repository's
installed Expo CLI expects `--device` to receive the displayed device name or model instead; for
example, the connected `SM_T835` tablet is selected with `--device SM_T835`. Running
`npx expo run:android --device` without a value remains the safest way to choose interactively.

The native build is the Android evidence. A successful Metro start or web run alone is not a
physical-device pass.

The commands above follow Expo's
[local native build workflow](https://docs.expo.dev/guides/local-app-development/) and Android's
[hardware-device setup](https://developer.android.com/studio/run/device). The WSL2 USB split and
`usbipd` commands follow Microsoft's
[WSL USB-device guide](https://learn.microsoft.com/windows/wsl/connect-usb).

## Reset to the canonical baseline

1. Enter the prototype and choose Parent mode.
2. Open a Parent route.
3. Choose **Reset demo** in the top prototype bar.
4. Confirm the reset.
5. Verify route `/`, Arabic RTL, Parent demo mode, Salem selected, and no active assignment.

The full counter and fixture baseline is in [DEMO_RUNBOOK.md](competition-readiness/DEMO_RUNBOOK.md). Reloading alone is
not the authoritative reset.

## Validation

Run the complete repository gate:

```bash
npm run verify
```

That command runs:

1. repository navigation, test-layout and tracked-artifact checks;
2. strict TypeScript;
3. Expo ESLint;
4. Prettier checks for maintained source/developer docs;
5. all deterministic Vitest suites;
6. Expo dependency alignment; and
7. a static web export to ignored `dist/`.

Run an individual layer when iterating:

```bash
npm run repo:check
npm run typecheck
npm run lint
npm run format:check
npm test -- --maxWorkers=2
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
the current [Feature 003 runbook](competition-readiness/DEMO_RUNBOOK.md).

Tests are grouped by subject; use `npm test -- tests/access` or another directory from the
[test guide](../tests/README.md) for a focused run. Historical test paths are retained in its
relocation map. The [repository map](architecture/REPOSITORY_STRUCTURE.md) explains where source,
specifications, provenance and generated output belong.

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

Check the device state first:

```bash
adb kill-server
adb start-server
adb devices -l
```

For `unauthorized`, unlock the phone, revoke **USB debugging authorizations** in Developer options,
reconnect, and accept the new prompt. On Ubuntu/Debian, a device that is visible but inaccessible
may require the standard udev rules and `plugdev` membership:

```bash
sudo apt-get install android-sdk-platform-tools-common
sudo usermod -aG plugdev "$LOGNAME"
```

Log out and back in after changing group membership. On Windows, install the manufacturer's OEM
USB driver when the standard driver does not expose the phone to ADB. Android Studio also provides
**Tools > Troubleshoot Device Connections**.

If the app installs but cannot load JavaScript, restart the USB tunnel and Metro cache:

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --localhost --clear
```

Also verify the Android SDK path, `java -version`, available disk space, and that no other process
owns port `8081`. Expo starting successfully does not prove that a physical Android build ran.

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
