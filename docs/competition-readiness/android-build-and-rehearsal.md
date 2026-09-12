# Installable Android build and rehearsal

**NB1 status, September12: local toolchain installed; the interrupted final-source manifest build
is being resumed, with no APK or native acceptance yet.** B's private build worktree is
`/home/smyk/projects/Ghaf-demo-systems`. The user accepted the listed SDK terms/tools and approved
pausing Expo for native builds. A stopped the prior preview and owes its restart in demo mode.

The installed private tools include Temurin17.0.20.1+1, Gradle9.3.1, command-line tools19.0,
Android36r2, BuildTools36.0.0, NDK27.1.12297006, CMake3.30.5 and platform-tools37.0.1. Publisher
and computed hashes, commands and installation receipts are in B's ignored `output/native-toolchain/`
and [B's build report](workstreams/b-native-build.md). No app dependency/lockfile change was made.
Earlier absent-tool observations below are historical baseline evidence.

The first e02d02b manifest attempt (`20260912T013553Z-manifest.wje3YH`) completed prebuild and
Gradle configuration but stopped with exit75 on sustained paging while the manifest task's JS
bundle dependency ran. It produced no merged manifest or APK. Its owned processes ended. The
next attempt targets the integrated Feature015 demo candidate, not another baseline build.

Use the repository's reviewed `scripts/native/build-apk.sh` invocation from B's report, with
exact source/build identity, `EXPO_PUBLIC_GHAF_DEMO_ENTRY=true`, one Gradle worker,1536MiB Gradle
heap/512MiB metaspace,1024MiB Node heap, one CMake job and generated-only Metro `--max-workers 1`.
Record the one-line generated Gradle adjustment. A must review the actual merged permission set
before full APK compilation; do not guess it. The existing template debug signing identity is
approved only for the labeled internal standalone rehearsal artifact. No new/public signing or
cloud upload is selected. Put the approved JDK `bin/` on PATH for both Gradle and `apksigner`.
Native builds and the resident Expo/browser preview remain mutually exclusive.

The demo's three synthetic profiles require no credentials and keep current-run task progress
across explicit sign-out/profile entry. All local repositories use separate memory storage.
A process restart begins a fresh signed-out run; it does not restore task progress or authority.
Ordinary builds retain their verification/pairing flow. Neither configuration is production login.
Actual APK identity, installation, device models/OS, Android RTL/Back/audio and rehearsals remain
NOT RUN/BLOCKED until their exact evidence is supplied.

After the environment interruption, all54 generated native source files still matched their
generation marker. The previous run `20260912T024056Z-manifest.2nbNeM` has no final exit receipt;
its partial logs and surviving intermediate bundle establish neither success nor a resource stop.
The resumed run `20260912T092026Z-manifest.Mf3DxX` stopped before Gradle because B's report was
still dirty after a failed preservation command. B corrected that command and preserved its report;
A100 permits the corrected launch with unchanged source, tools, build limits and resource guards.
See [B's report](workstreams/b-native-build.md) and the canonical coordination record for its outcome.

The user connected a Samsung Tab S4. D's September12 09:20UTC preflight successfully ran the pinned
ADB tool, but WSL returned zero visible transports. Android version, debug trust and USB attachment
remain unverified; this is not proof that the tablet is physically disconnected. The device report
and exact private receipt are in [D's native evidence](workstreams/d-native-acceptance.md).
The tablet can provide useful first hardware evidence once visible. It cannot establish the planned
narrow-screen primary/secondary phone coverage. No app installation or device journey has run yet.

### Prepared Windows USB attachment step

Read-only September12 host checks found Windows `winget.exe`, but no `usbipd.exe` command or
file at its standard Program Files location. The current Windows token is not Administrator.
This is a bounded availability check, not a scan of every possible installation. No Windows
installation, USB binding, firewall/service change or tablet setting was performed.

After the native job releases its lane, the owner can follow the
[Microsoft WSL USB guide](https://learn.microsoft.com/en-us/windows/wsl/connect-usb).
The current upstream release observed is [usbipd-win5.3.0](https://github.com/dorssel/usbipd-win/releases/tag/v5.3.0).
Run the interactive Windows installation command; review the installer instead of allowing an
unattended driver-install restart:

```powershell
winget install --interactive --exact dorssel.usbipd-win
```

In Administrator PowerShell, use `usbipd list` locally to identify the Samsung tablet's actual
BUSID, then `usbipd bind --busid <actual-tablet-busid>`. Keep Ubuntu open and attach with
`usbipd attach --wsl --busid <actual-tablet-busid>`; attachment does not require Administrator.
The installer adds a host service and firewall rule. While attached, Windows cannot use that USB
device. Do not guess a BUSID or bind another device. Do not restart WSL during a build.

On the unlocked tablet, enable Developer options and USB debugging, then accept the computer's
RSA authorization prompt when shown. See [Android's device guide](https://developer.android.com/studio/run/device).
Attachment and debugging trust are separate gates. D then repeats its existing targeted readiness
check; only a verified authorized target may proceed to exact APK installation and native tests.

## Historical Session A prerequisite audit — September 12, 2026

Read-only audit at `02b9618` found Node 24.16.0, npm 11.13.0, Expo 57.0.20, its nested CLI
57.0.22 and bundled bare-minimum template 57.0.22, with React Native 0.86.3. The installed
template selects Gradle 9.3.1. RN's local `gradle/libs.versions.toml` selects Android minimum 24,
compile/target 36, Build Tools 36.0.0, NDK 27.1.12297006 and Kotlin 2.1.20. The installed RN
Gradle plugin declares AGP 8.12.0 and JDK 17. These are inspected inputs, not a successful build;
the exact combined toolchain remains unverified. Do not change versions to fix an unobserved error.

`/usr/lib/android-sdk` contains only licenses and platform-tools. Java/Javac, SDK manager,
platforms, build-tools, NDK, CMake, Ninja and Gradle cache were absent in the inspected paths.
ADB 35.0.0 returned no devices. Native work is **BLOCKED** on toolchain provisioning and then
actual hardware. Existing license files do not establish approval for additional SDK terms.

An ignored `android/` tree exists, but its main manifest is stale: it still enables backup and
declares shared-storage permissions that current `app.config.ts` disables/blocks. Preserve it
and generate a fresh native tree in a dedicated candidate worktree. Validate the resulting APK's
merged permissions and `allowBackup`; source configuration alone cannot pass those checks.

The generated release build currently uses the template debug keystore. It bundles JS/assets
through `export:embed` and may be suitable for a clearly labeled standalone rehearsal build,
but it is not a production signing identity. No key was generated or selected by this audit.
Keep one actual reviewed identity for repeated installation; the team must select its distribution
identity before a downloadable competition artifact is accepted.

After a team build environment is provisioned, the inspected dependency inputs suggest:

```bash
sdkmanager "platform-tools" "platforms;android-36" \
  "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.30.5"
sdkmanager --licenses
```

Run license review interactively; do not pipe automatic acceptance. CMake 3.30.5 is a proposed
explicit pin matching RN's source-build default; the app otherwise leaves CMake selection implicit.
Installed Expo accepts `-Pandroid.cmakeVersion=3.30.5`. After fresh prebuild and signing review:

```bash
./gradlew :app:assembleRelease -Pandroid.cmakeVersion=3.30.5 \
  --no-daemon --no-parallel --max-workers=2
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --verbose --print-certs \
  app/build/outputs/apk/release/app-release.apk
"$ANDROID_HOME/build-tools/36.0.0/aapt" dump permissions \
  app/build/outputs/apk/release/app-release.apk
sha256sum app/build/outputs/apk/release/app-release.apk
```

The Gradle commands run from the generated `android/` directory. Keep the default ABI set until
both phones' supported ABIs are observed. First compilation needs network downloads and A's one
heavy-job slot; no native-heavy job may overlap the resident Metro/browser pair. No commands in
these proposed native-build blocks were executed during the audit.

## Preferred local path

Use an Android-capable team workstation and a dedicated build worktree at the reviewed commit.
Install the JDK and Android SDK required by the generated project's Gradle configuration, using
the current [Expo Android environment guide](https://docs.expo.dev/get-started/set-up-your-environment/).
Do not assume the Windows SDK or USB device automatically appears inside WSL. Verify `java -version`,
SDK/build-tool discovery and `adb devices -l` in the actual build shell.

Restore and validate the existing dependencies before native generation:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
```

Resolve and review any dependency mismatch; do not apply a breaking automatic audit fix. Record
the commit, Node/npm, Expo, JDK, SDK and Gradle versions. Keep the prepared service mode and
independent feature flags at their approved settings; inspect the repository's actual flag files.
Never put a provider secret into an `EXPO_PUBLIC_*` variable or mobile configuration.

Generate Android files using the installed Expo CLI:

```bash
npx expo prebuild --platform android --no-install
```

Inspect the generated changes in this build worktree. Do not use `--clean` over unreviewed native
edits. Configure the release signing identity using the
[Expo local release guide](https://docs.expo.dev/guides/local-app-production/); store the keystore
and its passwords outside versioned files. Use the same reviewed identity for repeat installations
on the team devices. Never solve a signing mismatch by uninstalling a device's data without its
owner's decision. This package does not create or upload credentials.

Build the release APK rather than a development variant that expects Metro:

```bash
cd android
./gradlew :app:assembleRelease
```

The expected default location is `android/app/build/outputs/apk/release/`; inspect the actual Gradle
output and signing result before selecting a file. An unsigned output is not an accepted installable
artifact. Run the SDK's `apksigner verify --verbose` against the selected APK, save its SHA-256 and
record its package/version. APK generation via `:app:assembleRelease` is documented in
[Expo's APK guide](https://docs.expo.dev/build-reference/apk/). An AAB is not directly sideloadable.

For interactive native development, the installed CLI also supports
`npx expo run:android --variant release --device`. That command is not a substitute for verifying
the final signing and distribution artifact. `npm run android` currently starts Expo for Android;
it does not establish a standalone build. See
[Expo local compilation](https://docs.expo.dev/guides/local-app-development/).

## Optional EAS path

If the team chooses its own Expo account and authorizes a build upload, A can review an EAS setup
in a separate task. A suitable proposed profile is:

```json
{
  "build": {
    "competition": {
      "distribution": "internal",
      "developmentClient": false,
      "android": { "buildType": "apk" }
    }
  }
}
```

This is documentation, not an installed configuration. Use a reviewed pinned EAS CLI version,
complete the team's project/signing setup, then run `eas build -p android --profile competition`.
Inspect the source upload contents first: bootstrap credentials, reference archives, local child
data and build caches must remain excluded. No EAS account connection, cloud upload, deployment
or build ran during this inspection. The local path does not require choosing this service.

## Acceptance on each actual phone

Install the verified APK using the owner's chosen file transfer or targeted ADB command. With
multiple devices, always specify the observed serial; do not paste the placeholders literally:

```bash
adb -s <device-serial> install -r <verified-apk-path>
```

Record a fresh-install test separately from an update that preserves local state. Stop Metro,
disconnect development delivery and cold-launch in airplane mode. The Arabic-first welcome,
local fonts/art, setup, separate access, prepared assistance and complete task journey must work.
Repeat the same candidate on the secondary phone independently; no cross-device sync is expected.

Exercise native Back, keyboard resize, text scaling, TalkBack names/order, mixed Arabic/English,
safe areas, long labels, touch targets, reduced motion and foreground/background interruption.
Inspect the installed permissions. The native configuration includes microphone capability for
the separately governed voice boundary; that does not authorize real Child recording. Keep the
competition's prepared fixtures and never claim live media or permissions passed from source alone.

After approved persistence work, force-stop/relaunch at acceptance, pending confirmation and after
recognition. Check exact counters, no duplicate memory, family/profile isolation and reset. Until
then, record the existing lost-progress gap rather than marking restart-safe behavior passed.

| Evidence                        | Required record                                                     | Current status              |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| Standalone artifact             | Commit, versions, Gradle result, signing verification, APK hash     | NOT RUN                     |
| Primary phone                   | Actual model/OS, installation and 2–3 minute complete journey       | BLOCKED: device unavailable |
| Secondary phone                 | Same APK; independent layout/touch/restart/reset evidence           | BLOCKED: device unavailable |
| Offline and process restoration | Metro stopped, internet unavailable, real restart results           | NOT RUN                     |
| Student understanding           | Named member explains build, local storage, AI mode and limitations | NOT RUN                     |

Use the [demo script](two-device-demo.md) and [QA report](qa-report.md) for the final verdict.
The required output is a tested downloadable mobile app; a successful web preview alone cannot
satisfy the competition's mobile requirement.

## Worktree preview identity before QA

D's initial port8097 preview at disk candidateb862eb6 loaded C's
`../Ghaf-ui-studio/app/index.tsx` instead of D's route. Those browser results are candidate-ineligible.
Stopping the owned preview and relaunching with `--clear` restored D's own route including A-004.
A correct Git HEAD and port alone do not establish which source a development bundle executes.

Read-only inspection found a plausible transform-cache collision: worker dependency symlinks
resolve Router's `_ctx.web.js` to the same canonical file; both sibling worktrees give it the same
relative path, while Expo Babel embeds different route roots. Installed Metro defaults to a shared
`os.tmpdir()/metro-cache`. The offending cache entry was not inspected, so this mechanism remains
an inference; loaded wrong/correct route identity before/after clearing is direct D evidence.

For the next preview handoff, the allocated lead should create a new, owned temporary directory
and launch from an explicit project root. Example for the recorded D candidate (future launch,
not a command A executed and not a reason to interrupt a now-correct active preview):

```bash
mkdir -p /tmp/ghaf-preview-D-b862eb6
CI=1 EXPO_OFFLINE=1 TMPDIR=/tmp/ghaf-preview-D-b862eb6 \
  ./node_modules/.bin/expo start /home/smyk/projects/Ghaf-qa-rehearsal \
  --web --localhost --port 8097 --clear --max-workers 2
```

Record the actual branch/HEAD, root PID, browser process, port and temporary directory. Before
recording acceptance, inspect the development bundle's loaded route module/root and changed
function (D used its browser's Metro module inspection); match it to the exact candidate's source.
Retain that identity evidence with the captures. Do not edit shared node_modules, delete another
lead's cache or run another preview alongside the allocated pair. An isolated temporary directory
is a launch precaution, not a tested APK or production setting. Only the lead owns/cleans its jobs.

## Final demo-source build checkpoint — 2026-09-12

Final runtime is5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051; all four source checks pass,148files /
1,919tests. B's matching branch HEADb317f2d generated the demo-mode native project with pinned
tools and one Metro worker. Attempt20260912T022614Z-manifest.CaPVjg ended02:27:21UTC, exit75
during bundling. No merged manifest or APK exists from that attempt; owned jobs were stopped.

The paging-only guard fired at~39% available memory. A087 authorizes a bounded guard correction
with directional logging, unchanged start/heap/worker limits, immediate15% memory floor and paging
correlated with<30% headroom. See the [resource assessment](coordination/resource-assessment.md).
A reviews the script before one measured manifest-only retry. No permission list is guessed: actual
merged XML/declarations and source/hash review must precede a separate full-APK grant.

C browser evidence and D artifact review close the duplicate-heading/approval-handoff observations
within their exact scope. The earlier Arabic clipping diagnosis was withdrawn after identical
isolated-glyph evidence; no typography repair is claimed. Physical Android/font scaling, installed
identity, offline launch, audio listening and real rehearsals remain NOT RUN.
