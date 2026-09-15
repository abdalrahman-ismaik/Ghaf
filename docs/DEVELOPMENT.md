# Development and testing

This guide is the practical path for installing, running, resetting, and verifying the current
Feature 020 Supabase family application, its explicitly selected Feature 019 normalized
runtime and the separate Feature 003 synthetic demo. Run every command from the repository root.
The [family-data guide](backend/family-data.md) owns the deployed default contract;
[the normalized workflow](backend/full-family-migration.md) owns the additional schema.
Set `EXPO_PUBLIC_GHAF_FAMILY_RUNTIME=normalized` only for an explicitly configured normalized
build. Missing configuration or schema never selects a different runtime or sample data.

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

Real-account mode is the default. It requires the configured Supabase project's URL,
client-safe publishable key and reviewed migrations. Create the ignored `.env.pilot.local`:

```dotenv
EXPO_PUBLIC_GHAF_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Use placeholders only in tracked examples. A service-role key, database password or AI provider
secret must never enter Expo configuration. Omitting the mode still selects Supabase; invalid or
missing configuration shows a closed account gate rather than a sample family.

Adult signup retains email confirmation, recovery and administrator approval. Once approved,
create a genuinely empty family or accept an authorized family invitation. Add managed Children
explicitly; a Child device pairs under its own restricted Supabase anonymous identity. See
[authentication](auth.md) for session restoration, permissions and signout behavior.

The deterministic sample needs no backend, camera permission, microphone permission or real Child
data. `EXPO_PUBLIC_GHAF_SERVICE_MODE=mock` selects its local service path. Real adult accounts and
saved family/task/study records use the separate Supabase account configuration below. Never put
an admin/service-role key or AI provider secret in an `EXPO_PUBLIC_` variable.

## Run the app

Use the web workflow for quick browser checks or the native workflow for authoritative Android
device checks.

### Real-account browser development

The account launcher selects Supabase and requires a network connection. Use `start:demo` below
for the explicit sample.

```bash
npm run start:pilot -- --web
```

`start:pilot` retains its existing name and loads `.env.pilot.local` before starting Expo. It now
opens the real family application after authentication. Supabase stores tasks, growth, memories,
study/goals, rewards, League and main-account messages; the earlier adult planning workspace
remains separately available. No local sample data is imported on sign-in.

Use isolated test identities and synthetic content. A second independent client must use the same
Supabase project to verify synchronization. Test fresh and returning accounts without resetting
existing families. Missing network access is an error, not an empty-account or mock success.

### Explicit offline demonstration

```bash
npm run start:demo -- --web --offline
```

Open the URL printed by Expo, normally `http://localhost:8081`. Web is suitable for rapid layout,
copy, deterministic-flow, and screenshot review. It cannot pass native Android, TalkBack, physical
touch, IME, media, permission, predictive Back, or device-performance gates. This command explicitly
selects `EXPO_PUBLIC_GHAF_AUTH_MODE=demo` and fast demo entry. It needs no backend, uses synthetic
people/history and does not synchronize between devices. It cannot verify real-account persistence.

### Real adult accounts and saved family tasks

Set the public account project values in your ignored `.env` or optional `.env.pilot.local`:

```dotenv
EXPO_PUBLIC_GHAF_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

```bash
npm run start:pilot -- --web --localhost --port 8093
```

The account launcher always selects Supabase access. The mode-specific env file is optional;
ordinary Expo env files and explicit shell variables also work. Shell values win over file values;
the selected optional mode file wins over the ordinary Expo files. `start:messaging` loads only
the messaging overlay and retains its separate project/identity configuration. Neither launcher
clears caches automatically. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

Sign in with **email and password**. New accounts verify their email with the emailed code;
forgotten passwords use a recovery code. The existing pilot approval check still applies. After
approval, the selected runtime opens your saved family: save a family name, add a Child,
then choose that Child when creating a task or study plan. Reload verifies server persistence.
Parent-confirmed task recognition follows that runtime's fixed award rules. The preserved legacy
planning workspace's completion checkbox grants no Seeds or money.

Account settings and the sample family are separate navigation choices. Switching sections or
interface language retains unsaved workspace input; logout or changing accounts clears it.
On a concurrent edit, reload the latest saved data, review your retained draft, then save explicitly.
Only a successful server response displays a saved notice. Sample reset never resets account data.

See [Feature 020](../specs/020-supabase-family-data/spec.md) for the default family contract,
[Feature 019](../specs/019-supabase-family-runtime/spec.md) for explicit normalized mode and
[Feature 018](../specs/018-persistent-adult-accounts/spec.md) for the preserved planning boundary.
The client cannot fix missing hosted migrations or grant approval to itself.

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
node --env-file=.env.pilot.local ./node_modules/expo/bin/cli run:android --device SM_T835
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
node --env-file=.env.pilot.local ./node_modules/expo/bin/cli run:android --device
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
node --env-file=.env.pilot.local ./node_modules/expo/bin/cli prebuild --platform android
```

Open the generated `android/` directory in Android Studio, wait for Gradle sync, select the
connected phone and the `app` run configuration, then click **Run**. Keep Metro running in a second
terminal from the repository root:

```bash
adb reverse tcp:8081 tcp:8081
npm run start:pilot -- --localhost
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
npm run start:pilot -- --localhost
```

When Metro runs from this repository in WSL but Windows still owns the connected tablet, call the
Windows ADB executable explicitly instead of Linux `adb`:

```bash
GHAF_WINDOWS_ADB="/mnt/c/Users/windows-user/AppData/Local/Android/Sdk/platform-tools/adb.exe"
GHAF_ANDROID_SERIAL="serial-from-adb-devices"
"$GHAF_WINDOWS_ADB" devices -l
"$GHAF_WINDOWS_ADB" -s "$GHAF_ANDROID_SERIAL" reverse tcp:8081 tcp:8081
npm run start:pilot -- --localhost
```

Replace the Windows user and serial placeholders with Android Studio's SDK location and the first
column from `adb devices -l`.

Open Ghaf on the phone and use Fast Refresh. Repeat the configured `run:android --device` command after adding
or changing a native dependency, an Expo config plugin, Android configuration, or native code.

If more than one device or emulator is connected, target the phone explicitly:

```bash
GHAF_ANDROID_SERIAL="serial-from-adb-devices"
GHAF_EXPO_DEVICE_NAME="model-from-adb-devices"
adb -s "$GHAF_ANDROID_SERIAL" reverse tcp:8081 tcp:8081
node --env-file=.env.pilot.local ./node_modules/expo/bin/cli run:android --device "$GHAF_EXPO_DEVICE_NAME"
```

ADB's `-s` option expects the serial from the first column of `adb devices -l`. The repository's
installed Expo CLI expects `--device` to receive the displayed device name or model instead; for
example, the connected `SM_T835` tablet is selected with `--device SM_T835`. Running
`npx expo run:android --device` without a value remains the safest way to choose interactively.

A successful native build establishes that source compiled; it does not establish tested device
behavior. Feature 020 Android build and physical-device acceptance remain separate from the
earlier Feature 018 APK records. A successful Metro start or web run is not a native-flow pass.

The commands above follow Expo's
[local native build workflow](https://docs.expo.dev/guides/local-app-development/) and Android's
[hardware-device setup](https://developer.android.com/studio/run/device). The WSL2 USB split and
`usbipd` commands follow Microsoft's
[WSL USB-device guide](https://learn.microsoft.com/windows/wsl/connect-usb).

## Reset the explicit demo only

1. Start the explicitly selected demo and enter through its Parent access flow.
2. Use its Parent-only **Reset demo** action and confirm.
3. Verify the signed-out Arabic entry and exact synthetic reset state described by the runbook.

The full counter and fixture baseline is in [DEMO_RUNBOOK.md](competition-readiness/DEMO_RUNBOOK.md). Reloading alone is
not the authoritative reset. Real signout never resets a family, deletes saved records or awards
new starter progress. Never run a remote database reset or use demo cleanup against real accounts.

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
5. launcher tests and all deterministic Vitest suites;
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

`npm test` covers domain, service, state, privacy, assistant safety, reset and controller flows.
Its historical fixture suites explicitly select demo mode; mocked transports do not prove hosted
Auth, persistence or authorization. Run the restricted-identity database and HTTP checks described
in [family data](backend/family-data.md) separately, then record the environment, command, source and
result in the [migration inventory](competition-readiness/supabase-data-migration.md). Native and
physical-device checks remain separate. The [demo runbook](competition-readiness/DEMO_RUNBOOK.md)
continues to own synthetic rehearsal evidence.

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
npm run start:pilot -- --web --clear
```

Then reopen the printed local URL. For the synthetic preview, use
`npm run start:demo -- --web --offline --clear`. `dist/` and generated Expo bundles are ignored;
do not indiscriminately delete local fixture credentials, unsynced drafts or evidence directories.

### Port already in use

```bash
npm run start:pilot -- --web --port 8082
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
npm run start:pilot -- --localhost --clear
```

Also verify the Android SDK path, `java -version`, available disk space, and that no other process
owns port `8081`. Expo starting successfully does not prove that a physical Android build ran.

### Tool-specific browser or DevTools warning

Metro can continue even when an optional local browser/DevTools process lacks a host library. Use
the printed URL manually, or install the missing host dependency. Treat application exceptions and
browser console errors separately from optional tooling-launch errors.

## Evidence discipline

- For demo validation, start from the canonical synthetic reset. For real accounts, use isolated
  test identities and preserve legitimate existing records; returning-account checks must restore
  their saved data without resetting it.
- Record the branch/commit and dirty files.
- Keep automated, browser, native, and human results separate.
- Do not commit `dist/`, `.expo/`, raw `.playwright-cli/` sessions, provider secrets, or real Child
  information.
- Preserve curated Feature 002/003 evidence and its historical attribution.
