# Installable Android build and rehearsal

## Windows build and emulator acceptance — September 14, 2026

**Current build boundary:** two later full Gradle runs failed after D: lost writes.
No further D: build is allocated. The D: invocation below records the original
setup; it is not an instruction to rerun on the unhealthy drive. The owner selected
Android Studio emulator acceptance using C: only. The pinned `73aced8e…` APK passed
startup, AR/EN Study/header presentation and Parent login/restoration, but exposed a
Study hardware Back failure. The released motion work and Study handler are packaged
from `e8ae266`; a separately verified native compatibility setting now passes the
bounded Parent/Child Back and Parent keyboard checks. Cold-start reliability remains open. See the
[primary integration record](../../specs/016-real-family-messaging/backend-android-validation.md)
for exact artifact identities and acceptance results.

### Current compatibility candidate — `9d756ef` configuration, `e8ae266` JavaScript

The installed APK is
`.expo/messaging-integration/predictive-back-e8ae266/ghaf-predictive-back-disabled.apk`,
62,436,538 bytes, SHA-256
`615048cd27c2c2856fbbaac2de113024325d3ec8d8819d9b56c216770705b27f`.
Against `a55a6acb…`, only four bytes of the compiled manifest changed to disable
predictive Back. All 1,626 other payloads, including the JavaScript bundle below,
are unchanged. Signing/alignment, installation and installed hash passed.
Parent Study Back passed twice, keyboard Back retained a `Math` draft, and Child
Study Back returned to Salem Today. `9d756ef` applies the same native setting to
the source build configuration; Expo introspection, scoped lint and formatting passed.
A later cold-launch command timed out at 22,440 ms, so reliable startup is not passed.
Settled rendering, English Study/Back, AR/EN messaging and restored Parent account
passed afterward; see `resumed-final-acceptance.json` for the exact scope.
This is an internal compatibility package using the existing native container.

### Earlier resumed candidate — `e8ae266`

Compilation and packaging passed for source
`e8ae266bf3623d70a764f92bac8cce68d9bcaf76`. APK
`.expo/messaging-integration/resumed-candidate/ghaf-resumed-emulator.apk` is
62,436,538 bytes, SHA-256
`a55a6acb1e1beae32b982f364ff84b602efd83d66854e77fb6e9fd30a9ca5337`.
Hermes bytecode SHA-256 is
`da402d92ba6857afd208ea10eb39b8989769d1f13e2c6b0857895cc567c18c67`.
All 98 resource mappings matched; 1,626 non-bundle payloads were preserved from the
`73aced8e…` extraction package, and all 1,627 signed payloads matched. The existing
signer, v2/v3 signatures and 16 KiB alignment passed. The native container remains
`273f97d`; this is a compiled JavaScript update with extraction packaging, not a
full Gradle rebuild.

Final TypeScript, full lint, full formatting and 2,773 tests across 193 files
passed, with two opt-in tests skipped. Format-only `b8da974` resolved the earlier
unrelated test-formatting failure. Receipts use
`.expo/messaging-integration/resumed-source-*` and `resumed-candidate/`.
Installation and two installed-hash checks passed for `a55a6acb…`, along with
AR/EN messaging headers and restored Parent account. Study Back failed on this
artifact; the separate compatibility package above corrects that observed case.
Neither result establishes motion performance, accessibility or physical acceptance.

### Earlier Windows builds and pinned candidates — historical evidence

The owner authorized native compilation on D: after the Expo Go connection failed.
The Windows launcher is [build-apk.ps1](../../scripts/native/build-apk.ps1). It uses
an explicitly selected disposable checkout, SDK and cache; default invocation is
preflight only. The original C: repository remains intact. This run uses JDK 17,
Android 36, Gradle 9.3.1, CMake 3.30.5 and NDK 27.1.12297006, with one worker and
only `arm64-v8a` for the connected Samsung phone. It does not produce an x86 emulator APK.

```powershell
$candidateHead = git -c safe.directory=D:/GhafNative/20260914/source -C D:/GhafNative/20260914/source rev-parse HEAD
./scripts/native/build-apk.ps1 `
  -ProjectRoot D:/GhafNative/20260914/source `
  -ExpectedHead $candidateHead `
  -SdkRoot D:/GhafNative/20260914/sdk `
  -JdkHome 'C:/Program Files/Microsoft/jdk-17.0.18.8-hotspot' `
  -GradleUserHome D:/GhafNative/20260914/gradle `
  -OutputDirectory D:/GhafNative/20260914/evidence `
  -MessagingEnvFile D:/GhafNative/20260914/evidence/messaging-public.env
```

Add `-Build -AllowDependencyDownloads` for the authorized build. The public
configuration file contains only the dedicated messaging URL and publishable key.
The launcher fixes demo access, mock core services and disabled live AI, and records
the public configuration hash as a bundle task input. Passwords remain outside the
bundle and evidence. The original build logs, receipts and APKs remain ignored on D:;
the current internal-update artifacts are retained separately on C:.

Keep one heavy job active. Admission requires 3 GiB of available Windows memory;
the operator monitors the run and stops its owned build if sustained availability
falls below 1 GiB. The launcher records snapshots, not an automatic watchdog.
The verified internal artifact uses the existing Expo template debug signing
identity. Actual APK permission, source/configuration identity, installation and
standalone launch require recorded evidence. See the
[current backend and Android record](../../specs/016-real-family-messaging/backend-android-validation.md)
for outcomes. Historical Linux stages below are not Windows or phone acceptance.

The first complete Windows run finished at 04:25:42 UTC on September 14:
`20260914T033313062Z-b2ba959f`, source `273f97d`, Gradle success in 52m 11s.
Its internal APK passed signer, package, SDK, backup, storage-permission, standalone
bundle and arm64 checks. It is a diagnostic candidate that predates the browser
transport fix; the later C:-only update includes that JavaScript correction.
Six generated main graphs contain 289
compile/link edges in the depth-one pool. Two CMake LTO probe graphs have six edges
outside that pool; probe serialization and continuous runtime-wide compiler coverage
remain unverified. The merged manifest's 10 permissions include SecureStore's
biometric dependency declarations, which do not establish biometric login.
The first run's exact launcher copy and hash are retained with its receipt. A later
logging change reduced buffering, but that observation does not establish the cause
of the subsequent failure. The corrected launcher now redirects batch logs directly
to validated file paths and checks utility output-copy failures while the child
process is alive. AST parsing and 16 scoped synthetic checks passed, including large
dual-stream output and nonzero exit. A separate debugger fault-injection probe stalled
and was preserved as failed; neither that probe nor the passing checks establish
successful recovery from an actual disk failure.

The corrected full build from `923cf10`, run
`20260914T052545228Z-085ff9a9`, failed after exFAT lost-write events at
09:27:55–09:28:06 Dubai. After the owner reported D: stable, a matching 1 MiB probe
and five minutes without new exFAT events preceded the `c4b7c26` retry,
`20260914T054842239Z-4f0c0b98`. That retry was stopped after 17 new exFAT events
around 09:51:13–09:51:34 Dubai. The drive still reported `Warning / Full Repair
Needed`; the short probe did not establish sustained write reliability. No disk
repair or formatting was performed. Failure receipts are
`.expo/messaging-integration/d-drive-write-failure.json`,
`d-drive-second-write-failure.json`, and the `failed-native-052545/` and
`failed-native-054842/` directories. Logging-check evidence is
`.expo/messaging-integration/native logging check 64b5595c/checks.json`.

The installed C:-only update uses the verified `273f97d` native container and
`923cf10` application JavaScript prepared from source `a365f9b`. APK SHA-256
`98223bd92160c843c7c9db36d19c1f38cdec0316ce945ac72c0fa4cf77f219fe` passed resource,
payload, 16 KiB alignment and existing internal signer checks. Only the JavaScript
bundle changed against the base; 1,626 other payloads remained unchanged, and all
1,627 candidate payloads matched after signing. Installation with `adb install -r`
passed, followed by a 1050 ms cold activity launch, restored Parent context and
existing message history. Observed Arabic/English Study body, tabs and mixed-script
nickname checks passed, as did messaging body/list direction. This is a verified
internal update, not a successful full native rebuild. Receipts remain under
`%LOCALAPPDATA%/GhafIntegration/20260914/js-update-923cf10/`.

That installed APK still showed an Arabic messaging header aligned left. The
single-row correction `0ad7a0d` passed source review, scoped lint/format and 73
messaging tests with one opt-in skip. Its final C:-only APK is 62,432,442 bytes,
SHA-256 `d937a462598090fea79c01db68b0933fc0da9029680ff2be0c433e09cb1d3564`.
Resource/payload preservation, 16 KiB alignment and the existing signer passed;
receipts are under `%LOCALAPPDATA%/GhafIntegration/20260914/js-update-0ad7a0d/`.
The serialized 2,048 MiB TypeScript rerun passed after the preserved 1,024 MiB
heap-exhaustion attempt. This remains a JavaScript update to the diagnostic native
container, not a full Gradle rebuild.

The separate C: AVD `Ghaf_API35_ARM64Bridge` booted and installed that APK. App
startup then failed before JavaScript with `SoLoaderDSONotFoundError` for
`libreactnative.so`: Package Manager selected ARM64, while SoLoader selected the
APK's absent `lib/x86_64` path. The Activity Manager success status did not prove a
rendered app. Root packaged a separate copy with only `android:extractNativeLibs`
changed from false to true. Its SHA-256 is
`73aced8e982653a4825b191a28a4137e8ebb63a3080c7e18006534ac8b94c3b3`, 62,432,442 bytes.
The manifest changed by four bytes, 1,626 other payloads stayed unchanged, and all
1,627 signed payloads matched. Alignment and v2/v3 signatures passed; `d937a462…`
remains unchanged. Receipt:
`.expo/messaging-integration/emulator-extraction-0ad7a0d-v3/packaging-receipt.json`.
The streamed install reported an empty failure, but the installed APK's on-emulator
hash subsequently matched `73aced8e…`. Native libraries loaded from extraction,
React Native reached `Running main`, and settled Arabic onboarding rendered;
skipping onboarding and entering Parent also worked. Installation and startup pass
for this exact emulator candidate. Startup skipped frames, so no performance pass
is claimed. Later pinned checks passed AR/EN Study body/tabs/mixed-script nickname,
messaging header/list direction, real Parent login and restoration after force-stop
without credential reentry. Native Study hardware Back exited the app; `e8ae266`
addresses that failure. Conversation history/composer scroll reachability remains
unverified. The later conversation capture made while ADB was offline is invalid
and supplies no additional evidence. Receipts include
`.expo/messaging-integration/emulator-pinned-acceptance.json`,
`emulator-installed-identity.json` and `emulator-extraction-welcome.png`.
This is a separate emulator candidate, not a full native rebuild or new phone evidence.

No new phone check is allocated. Retain the verified artifacts and receipts;
remove only scoped disposable C: intermediates after their use. Do not transfer
the installed phone update's passes to a later artifact or emulator automatically.

## Historical Linux build — September 12, 2026

**NB1 status, September12: the manifest and first native configuration stage passed.**
The remaining configuration stage is running on B b32174d/runtime5d8a3e8. Its dependencies compile
Worklets; actual process limits and fresh generated graphs must be checked before the full APK.
No APK or native acceptance exists yet. B's private worktree is
`/home/smyk/projects/Ghaf-demo-systems`. SDK terms/tools and preview pauses are authorized.
The canonical demo preview is stopped for native work; A will restore it afterward.

The installed private tools include Temurin17.0.20.1+1, Gradle9.3.1, command-line tools19.0,
Android36r2, BuildTools35.0.0 and36.0.0, NDK27.1.12297006, CMake3.30.5 and platform-tools37.0.1. Publisher
and computed hashes, commands and installation receipts are in B's ignored `output/native-toolchain/`
and [B's build report](workstreams/b-native-build.md). No app dependency/lockfile change was made.
Earlier absent-tool observations below are historical baseline evidence.

The first e02d02b manifest attempt (`20260912T013553Z-manifest.wje3YH`) completed prebuild and
Gradle configuration but stopped with exit75 on sustained paging while the manifest task's JS
bundle dependency ran. It produced no merged manifest or APK. Its owned processes ended. The
next attempt targets the integrated Feature015 demo candidate, not another baseline build.

Use the repository's reviewed `scripts/native/build-apk.sh` invocation from B's report, with
exact source/build identity, `EXPO_PUBLIC_GHAF_DEMO_ENTRY=true`, one Gradle worker,1536MiB Gradle
heap/512MiB metaspace,1024MiB Node heap and generated-only Metro `--max-workers 1`.
The requested CMake single-job environment setting did not constrain direct Ninja invocation;
B stopped the observed attempt. The integrated script requests one shared compile/link Ninja pool.
Actual stage1 `20260912T110835Z-configure.rhvmwi` passed all25 steps, final six-module DSL
coverage and four Worklets ABI configurations. Reviewed snapshots contain156 PCH/CXX/shared-link
edges in the depth1 pool. This covers those graphs; regeneration, CMake probes and concurrent
Ninja instances require separate observation. A162 grants the remaining stage on B b32174d,
script99ae/init a2d7; no full APK success is implied. See B's exact receipts and reviewed limits.
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
still dirty after a failed preservation command. After its correction, two builds exposed123 and
122 distinct empty Gradle transform-metadata entries. A complete namespace inventory identified
the remaining empty metadata; B preserved those245 entries in two exact quarantines, without a
whole-cache purge or source change. Empty results files with nonempty metadata were left untouched.

The corrected run `20260912T093503Z-manifest.PZp7Ci` passed all21 steps at09:36:18UTC, including
actual merged XML generation and post-build input/native identity checks. D independently verified
manifest SHA256 `5ba0ea320a67dde7fdd8f6099bb23c5c17a11ca5d462248e4559d7cd43797e9a`, package
`ae.ac.ku.ghaf.prototype`, version0.1.0/code1, minSdk24/targetSdk36, backupfalse and blocked storage
permission exclusions. These are manifest results, not installed-device compatibility evidence.

A110 approves the actual eight permission declarations and their complete attributes for this
unchanged **internal rehearsal build**. The app-scoped receiver permission is explicitly defined
at signature protection level. Existing RECORD_AUDIO and SYSTEM_ALERT_WINDOW declarations remain;
no real recording or overlay use is selected, and direct native no-prompt/prepared-only behavior
still needs testing. This is not a public-release or least-privilege claim. The exact approval
array and detailed receipt are A-authored files under B's ignored output/native-build, with hashes
recorded in canonical STATUS-A. The first full-build attempt below used HEAD3d1320d, runtime5d8a3e8/demo and unchanged
script7c2a2c8d. See [B's build report](workstreams/b-native-build.md) and
[D's independent review](workstreams/d-native-acceptance.md). No app suite was repeated for these
report-only commits.

The first full APK run `20260912T094244Z-build.TWkyVS` ended09:44:19UTC, exit1/cleanup0,
because gesture-handler Java compilation requires missing Build Tools 35.0.0. A113 authorizes
only that side-by-side tool in the existing private SDK and one corrected same-source build.
The accepted SDK terms remain applicable; no new app package, configuration, guard or signing
change is selected. The explicit SDKmanager installation completed09:58:49UTC;168 installed files
matched the publisher-verified archive and four tool version checks passed. The original SDK
agreement marker encoded different whitespace. A independently verified unchanged agreement
wording, then authorized appending its canonical digest while retaining the original entry; no
new agreement or generic automatic license acceptance was used.

The corrected full build `20260912T095927Z-build.VLrTIn` advanced into native C++ configuration.
B observed three concurrent compiler children despite the requested CMake single-job setting and
sent TERM to its owned script at10:06:54UTC. The run ended10:07:01UTC, exit143, without an APK.
All119 captured process IDs were absent at10:07:11UTC. This was a deliberate policy stop, not
an application failure or resource-guard trigger:86 samples had minimum55.814% available memory,
maximum216KiB swap used and no paging streak. Preserve the exact compiler-concurrency and
post-exit receipts. A117's missing35 preflight check and a bounded compiler-limit correction are
separate tooling work; unchanged source checks do not need repeating.

The owner tapped Allow on the tablet, but D's11:17:31UTC check returned zero ADB transports.
A found Windows still saw the Samsung as shared but detached from WSL. One authorized reattachment
returned0 at11:19:56UTC, then immediately disconnected again. A subsequent bounded diagnostic attachment remained visible
after its launcher exited at11:24:06UTC; the original cause remains unknown.
D then observed the same selected tablet, still UNAUTHORIZED, at11:24:16UTC. Model/OS/ABI,
installation and native journeys remain NOT RUN. See [D's evidence](workstreams/d-native-acceptance.md).
The Tab S4 can supply initial tablet evidence; both planned phone gates remain separate.

### Prepared Windows USB attachment step

Read-only September12 host checks found Windows `winget.exe`, but no `usbipd.exe` command or
file at its standard Program Files location. The current Windows token is not Administrator.
This is a bounded availability check, not a scan of every possible installation. No Windows
installation, USB binding, firewall/service change or tablet setting was performed in that audit.

A later A123 preparation downloaded the exact 5.3.0 x64 MSI (4,501,504 bytes), matched the published
SHA256 `1c984914aec944de19b64eff232421439629699f8138e3ddc29301175bc6d938`, and copied the same bytes
into a fresh Windows task-temp directory. Authenticode on the WSL path returned UnknownError;
the local Windows copy verified Valid for Open Source Developer, Frans van Dorsselaer. The
interactive `/norestart` launch returned “The operation was canceled by the user” at 10:14:56 UTC.
No installer PID or successful installation was recorded; the follow-up service check remained
ABSENT. A released the host setup slot and will not reopen the canceled prompt automatically.
Exact receipts stay under canonical `output/native-integration/015/usbipd-5.3.0/`.

The user subsequently clarified that no installer window appeared, then completed the supplied
manual installation step. A verified usbipd5.3.0, service Running and Valid publisher signature
at10:37UTC. Installation is complete; do not reinstall it. After the user requested A run binding,
A launched the verified installed tool through Windows elevation. The bind process returned0 at
10:58:32UTC; actual state reported sharedtrue. A then ran attachment to Ubuntu, returning0 at
10:59:12UTC. Windows state and Linux USB visibility independently confirmed attachment at10:59:45.
These completed commands are recorded for recovery, not instructions to repeat now:

```powershell
& "$env:ProgramFiles\usbipd-win\usbipd.exe" bind --busid 2-1
& "$env:ProgramFiles\usbipd-win\usbipd.exe" attach --wsl Ubuntu --busid 2-1
```

Binding requires Administrator; attachment does not. Following the
[Microsoft WSL USB guide](https://learn.microsoft.com/en-us/windows/wsl/connect-usb), recheck the
actual device/BUSID if reconnecting. Windows cannot use that USB device while attached. Do not
bind another device or restart WSL during a build.

The owner has already enabled debugging and reported tapping Allow; do not request the same
approval again without an actual new prompt. USB attachment and Android debugging authorization
remain separate gates. D owns the existing ADB server and targeted checks after stable attachment;
no authorized device properties have been observed. Do not restart WSL during the native build.
Only an authorized target and an exact verified APK may proceed to installation and native tests.

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

The following matrix is the historical September 12 baseline. Current Windows
artifact, emulator and phone results are recorded at the top of this guide and in
the linked integration evidence; remaining human/two-phone gates stay separate.

| Evidence                        | Required record                                                     | Historical status           |
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

## Historical baseline demo-source build checkpoint — 2026-09-12

That baseline runtime is5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051; all four source checks pass,148files /
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

## Narration preparation and the next rebuild

Preparation sourcefa9821c adds a separate pure optional-playback controller, bilingual control
interfaces and the three exact approved Arabic files.44controller and49shared tests, scoped
formatting, source review and asset/script hashes pass. D independently reviewed the source and
committed asset identities. C's adapter/UI source was subsequently released as `61d2576` and integrated as `0d23b8e`.
Its 40 focused SSR/resolver tests passed, and bounded source review found no material defect.
Actual mounted effects, native playback and the new full candidate checks remain pending. There
is no narration APK yet: the frozen A171 build still uses `5d8a3e8`.

A full TypeScript attempt at a temporary768MiB heap limit failed from Node heap exhaustion on
12September at12:01:08UTC. It emitted no source diagnostic, but it did not pass. Adequate-memory
full checks remain mandatory for the integrated candidate after native-heavy release.

B's generation guard binds the exact source commit. A later narration rebuild therefore needs
either fresh generation or a separately reviewed, case-specific equivalence receipt. A189 selects
preparing the latter while preserving the original marker/generated-from source; this is not yet
an executable reuse authorization. Only a final exact source pair with unchanged native/config/
plugin/dependency/codegen inputs may qualify. Normal bundling, Gradle and new APK/device checks
still run. Do not copy or rename the baseline APK and call it the narration candidate.

## Poster candidate and preserved native work — September 12, 12:48 UTC

The current app source is `98be86558426f593b639e0db2be0da9cebc36078`. It includes the selected
three-profile demo entry, optional Arabic narration integration, refreshed entry/story composition
and Parent/Child home presentation. Typecheck, lint, format and the full suite passed: **150 files,
1,979 tests**, one worker. Receipt/logs: `output/native-integration/015/full-98be865/`. The earlier
768 MiB heap failure and `42203a3` lint failure remain recorded; neither was silently relabeled.

This is not an APK identity. B's baseline A171 run `20260912T113307Z-build.T4DtZl` stopped with
exit 75 on sustained paging at 12:24:55 UTC, with no APK. All 2,565 recorded PIDs were absent
at release; generated native inputs and build/cache outputs were preserved. There is no native
retry or recertification while the selected urgent poster handoff is in progress.

A restored the canonical demo preview on localhost:8081, PID 225406, with one worker, private
caches, mock services and all eight R002b/three live-AI flags off. C owns the sole actual-app
browser capture session. This preview is for visible UI and poster evidence; it cannot pass
Android installation, offline startup, Back, TalkBack, font scaling or audible playback.

After the poster handoff, the resumable native task is a separately reviewed exact baseline-to-
new-source build-input reconciliation, then a measured build on the final published source.
D independently verifies the resulting APK before installation. The tablet was last UNAUTHORIZED;
no current properties or native pass are inferred. Recovery 014 remains deferred even if a future
native gate passes. Human/public-audio/student gates remain separately pending.
