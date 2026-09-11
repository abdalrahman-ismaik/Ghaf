# Installable Android build and rehearsal

**Status: documented path; APK build and physical acceptance NOT RUN.** This checkout has Expo
SDK 57, React Native 0.86, a provisional Android package `ae.ac.ku.ghaf.prototype`, bundled fonts,
and native plugins in `app.config.ts`. It has no committed `eas.json` or verified APK/AAB. The
inspection environment has `adb`, but no connected device, Java, `sdkmanager`, configured
`ANDROID_HOME`, `ANDROID_SDK_ROOT` or `JAVA_HOME`. An Android JavaScript export is not an APK.

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
