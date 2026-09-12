# Session B — Repeatable Android build

**Current: the actual graph's typed-root parser repair is released, and the app's late-CMake hook correction passes101 standalone mock checks plus the real12-step preflight. Fixed configuration-stage selectors pass65 checks. The six-module final DSL gate and generated Worklets edges still need the separately granted first native configuration run. No APK/device acceptance is established.**

The accepted three-principal adapter is integrated into A's final runtime `5d8a3e8`. Two manifest
attempts stopped on the resource guard; the later sections preserve their exact evidence. A087
permitted the reviewed resource correction; A092/A096/A100/A103/A106 subsequently governed the
interrupted-run and precisely diagnosed cache recovery documented below.
Recovery 014 remains deferred. Earlier sections below are historical checkpoints.

## Identity and authority

- B instance: `B-NB1-20260912T011745Z-545b9f58`.
- Worktree: `/home/smyk/projects/Ghaf-demo-systems`, branch `redesign/native-build-20260912`.
- Prepared baseline: `52c61fcab45f40b233d823a9178780fd07c56efd`, runtime `7fff0f3`.
- A046 authorized only the e02d02b cherry-pick. It completed clean as `bb747cf80bdfc9bad312014d1492710511f855fd` after B's N01 commit `51da7f7ea8bf4ccbdd9e5ff22446ecb2069d03ac`; full runtime input equality passed. No compile yet.
- Board 24 was prepared only. B registered without source/helper writes. Board 25 activated
  `B-N01-r25` and bounded `B-N02-r25`; B acknowledged `A-20260911T2220Z-042` before work.
- Durable grants: this report and `scripts/native/build-apk.sh`. Ignored B output boundaries:
  `output/native-build/`, `output/native-toolchain/`, `output/native-cache/`.
- B may replace only its verified canonical-target dependency symlink with private dependencies.
  Native generation, transient package-script normalization and internal template-debug signing
  remain conditional on the actual build grant, exact candidate, tools and resource clearance.
- Shared source, app configuration, package versions, lockfile and signing identity are protected.
  No source push, main merge, cloud service, public distribution or device mutation is authorized.

Requested settings are GPT-6 Astra, Ultra reasoning and Fast. The allowlisted local configuration
reads `gpt-6-astra`, `xhigh`, `fast`; root served reasoning/tier are not exposed, so Ultra is not
claimed. The script helper launcher explicitly accepted Astra/ultra; its tier is not exposed.
No model configuration or contributor identity was changed. Student owner, exact-diff review and
teach-back remain **PENDING**.

## Existing evidence reused

The [Android guide](../android-build-and-rehearsal.md) and [D candidate report](d-candidate.md)
already establish the source/toolchain audit and narrow browser history. Historical 138-file /
1,677-test results on `7fff0f3` do not establish an installable APK. A's later 139-file / 1,695-test
result belongs to `e02d02b`, not to B's current checkout or a phone.

Inspected inputs are Expo 57.0.20, installed CLI/template 57.0.22, React Native 0.86.3, JDK 17,
Gradle 9.3.1, Android SDK 36, Build Tools 36.0.0, NDK 27.1.12297006 and proposed CMake 3.30.5.
They are inputs to verify together, not a proven compatible toolchain. Missing host tools and
devices are known prerequisites; B did not repeat a general missing-Java audit.

B independently read the installed `expo/template.tgz`: its release variant uses the existing
debug identity, `export:embed` bundles JavaScript, and the wrapper selects Gradle 9.3.1. The template
debug-keystore SHA-256 is
`221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58`.
Safe preflight extracts the unchanged template key into its private receipt for identity checking. No key was generated, replaced or accepted as a public signing identity.

## B-N02 — Private dependency checkpoint

Before unlinking, B verified that its `node_modules` was a symlink whose resolved target was exactly
`/home/smyk/projects/Ghaf/node_modules`. B's lockfile, committed lockfile and canonical lockfile
were byte-identical. Only the B link was unlinked; the target and C/D links were untouched.

```text
npm ci --cache /home/smyk/projects/Ghaf-demo-systems/output/native-cache/npm --no-audit --no-fund
```

| Evidence             | Actual result                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| UTC interval         | 2026-09-12 01:19:39.701962–01:20:21.801227 UTC                                                                                                 |
| Exit / packages      | 0; 992 packages in 42 seconds                                                                                                                  |
| Node / npm           | v24.16.0 / 11.13.0                                                                                                                             |
| Lock SHA-256         | `d312af8f6b07994c983b02908cad16c7d6c52aadebe68ac33ea068ccc1685ccb`                                                                             |
| Final identity       | Private directory, not a symlink; lock unchanged; canonical target inode unchanged                                                             |
| Runner / child       | Python 374035 / npm 374037; both finished; tool session 3503 complete                                                                          |
| Pre-install pressure | 3,863 MiB available / 7,645 MiB total; swap 1,443 MiB; final sample 32 KiB/s swap-in, zero swap-out, 97% idle; approximately 896 GiB disk free |

Exact ignored evidence:
`/home/smyk/projects/Ghaf-demo-systems/output/native-build/dependencies-20260912T011939Z/receipt.json`
and adjacent `npm-ci.log`. The granted initial heavy slot was released after completion. Npm's
deprecation/update notices did not trigger any package, global npm or lockfile upgrade. This
checkpoint establishes private installed dependencies, not native compilation or vulnerability
acceptance.

On a rerun, reuse this private installation only after rechecking its lock/installed identity. Do
not repeat the initial unlink operation against a real directory or a different link target.

## Toolchain preparation and outstanding gates

Publisher metadata was read without executing downloaded tools. The Adoptium latest-assets API
returned HTTP 403; its publisher-hosted release/checksum path worked. An older 17.0.16 checksum
was inspected while resolving the path but is not the selected proposal. The proposed current pin
is Temurin 17.0.20.1+1, Linux x64 JDK. A043 granted JDK/Gradle; A045 records the user's explicit SDK terms acceptance at 2026-09-12T01:26:58.729060+00:00 and grants the six exact SDK packages. Only their `android-sdk-license` was applied; no additional agreement was accepted.

| Input                            | Publisher / integrity                                                                                                                                                                                                                                                                                                      | Proposed destination                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Temurin JDK 17.0.20.1+1          | [Release](https://github.com/adoptium/temurin17-binaries/releases/tag/jdk-17.0.20.1%2B1); [SHA-256](https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_linux_hotspot_17.0.20.1_1.tar.gz.sha256.txt): `3808d1d15e3ec6bd5b84057fb5d84c33d8a1536a258146bcea2e603fc726e08e` | B `output/native-toolchain/jdk-17.0.20.1+1/`                                |
| Gradle 9.3.1 binary distribution | [Publisher checksum](https://services.gradle.org/distributions/gradle-9.3.1-bin.zip.sha256): `b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06`                                                                                                                                                            | B `output/native-cache/gradle/`; checksum enforced before wrapper execution |
| Android packages                 | [Google repository metadata](https://dl.google.com/android/repository/repository2-1.xml); exact package manifest below                                                                                                                                                                                                     | B `output/native-toolchain/sdk/`                                            |

Google's current download page exposes command-line tools 22.0 and its SHA-256; repository metadata
also contains newer/older versions. The proposal pins command-line tools 19.0 for the JDK 17 build
path instead of using a moving `latest` alias. Actual compatibility remains to be verified. The
download page explicitly requires agreement before downloading the SDK; the actual user acceptance and exact package scope are recorded in A045, not inferred from an existing machine license file.
See [Google's download and license page](https://developer.android.com/studio#command-tools).

The metadata snapshot is saved as B `output/native-toolchain/repository2-1.xml`, SHA-256
`26484e1c83de994cb281fd75f20e4eceb55412c9f285c65839997d8a636e01cf`; selected archive metadata is
`publisher-package-metadata.json` beside it. Google publishes 40-hex archive checksums in this
XML; validate these as SHA-1 and also record computed SHA-256. Do not label an independently
computed SHA-256 as a publisher-published checksum.

| Package                          | Exact archive                                | Published SHA-1                            |
| -------------------------------- | -------------------------------------------- | ------------------------------------------ |
| cmdline-tools;19.0               | `commandlinetools-linux-13114758_latest.zip` | `5fdcc763663eefb86a5b8879697aa6088b041e70` |
| platforms;android-36, revision 2 | `platform-36_r02.zip`                        | `2c1a80dd4d9f7d0e6dd336ec603d9b5c55a6f576` |
| build-tools;36.0.0               | `build-tools_r36_linux.zip`                  | `b0b6376977657e8ad9b969bacf4093601da2c6fb` |
| ndk;27.1.12297006                | `android-ndk-r27b-linux.zip`                 | `6fc476b2e57d7c01ac0c95817746b927035b9749` |
| cmake;3.30.5                     | `cmake-3.30.5-linux.zip`                     | `c999a37fa18cb3e24dc003386cffe1d86add91b5` |
| platform-tools;37.0.1            | `platform-tools_r37.0.1-linux.zip`           | `477254aa5f903c15cf51001717bdf347fb6b53e0` |

Archive URLs use Google's `https://dl.google.com/android/repository/` prefix. Platform 36 extension
18/19 alternatives are not the selected plain revision-2 platform. All eight pinned archives passed their published checksum before extraction. Initial provision at 01:29:22–01:30:47 UTC stopped exit1 on the verified CMake flat archive layout. Inspection found exactly `bin`, `doc`, `share`, `source.properties`; the ignored local extractor was narrowly corrected, preserving old staging/failure logs. Rerun 01:31:49–01:31:53 UTC reused verified destinations and completed exit0. Exact receipts are `output/native-build/provision-20260912T012922Z/receipt.json` and `provision-20260912T013149Z/receipt.json`; each records URL, publisher algorithm/checksum, computed SHA-256 and destination. Accepted license hash is `9002c006f4b8d9a16e715a9fa4df30ddb8abf9d9`. Actual executable versions and toolchain preflight passed in the N02 checkpoint below; extraction and preflight do not prove native compilation compatibility.

## B-N01 script and validation

The executable script defaults to preflight. It requires exact HEAD/source identity, private lock-matching dependencies, canonical tool/output paths and the unchanged internal debug signing opt-in. It records UTC step times and preserves command exit codes. It rejects public environment overrides, dotenv files, unexpected source/config changes and shared dependencies. Build additionally requires A's current heavy-slot, preview-release and accepted-terms references plus an exact approved merged-permission JSON array.

Example after A source synchronization (replace the HEAD placeholder with the actual full local commit):

```bash
scripts/native/build-apk.sh \
  --project-root /home/smyk/projects/Ghaf-demo-systems \
  --expected-head FULL_LOCAL_HEAD \
  --source-commit e02d02b3a43c062bd637b57a475b43419a9f9939 \
  --jdk-home /home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/jdk-17.0.20.1+1 \
  --sdk-root /home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk \
  --output-dir /home/smyk/projects/Ghaf-demo-systems/output/native-build \
  --cache-dir /home/smyk/projects/Ghaf-demo-systems/output/native-cache \
  --allow-internal-debug-signing
```

Only an explicitly granted build adds `--build --heavy-slot-ack A046 --metro-release-ack A046 --sdk-license-ack A045 --approved-permissions ABSOLUTE_REVIEWED_JSON_PATH`. A046 authorizes B to cherry-pick only `e02d02b` and records the user's authorized Metro shutdown; source synchronization was pending at the N01 release and completed in the N02 checkpoint below. No B preview runs. A's exact permission-set input remains pending.

Generation uses installed Expo `prebuild --platform android --no-install` only when Android is absent; it captures the exact permitted package android/ios script delta without committing or restoring package.json. Reuse requires this script's source/native inventory receipt. A different runtime source requires A's explicit archive/fresh-generation decision; there is no automatic cleanup. The generated wrapper receives the published Gradle checksum before execution.

Compilation uses `--no-daemon --no-parallel --max-workers=2`, two-CPU affinity and bounded individual Java/Node/CMake settings with memory/paging/disk monitoring. These are not a total memory cap. Only the verified owned process group may be stopped by the script. Logs and partial output remain for recovery. Build failure is never reported as APK success.

Actual artifact inspection checks signed release status, template certificate, package/version, target SDK, merged `allowBackup`, exact approved permissions, ABI parity and embedded JavaScript/audio/fonts/images. Outputs include `receipt.txt`, per-step logs, package/wrapper diffs, `resources.log`, `apk.sha256`, `artifact.json` and `ghaf-internal-rehearsal.apk`. APK inspection/device acceptance is **NOT RUN** at this checkpoint; D alone handles separately authorized devices.

Safe-check evidence: `output/native-build/script-checks/safe-checks.json`. Twelve initial full-script cases passed at 01:24:11–13 UTC; five follow-up full-script cases and two exact-source guard fixtures passed at 01:27:04–07 UTC. These cover help, invalid/missing inputs, wrong root/HEAD/source/paths, symlink escape, build without grants, missing signing/tools, public overrides, dependency-link refusal and preserved exit37. Final cleanup refinement SHA-256 `65e6ecb24373b421bba57317a6a8e1c0d0f03ab19ea30168f47af0b4a0441bf1` passed Bash syntax, all nine embedded Python syntax checks and expected missing-toolchain refusal at 01:27:57 UTC. Earlier cases are attributed to their earlier script hash, not retroactively claimed on the final hash. Watched package/lock/appconfig bytes were unchanged; Android remained absent. Lead independently reviewed the final script and Bash syntax. Full app tests are not claimed for this shell/report slice.

Helper source/check paths were explicitly released to B lead. Student review is pending. For recovery, preserve any failed receipt and generated tree, inspect its failed step, resolve only the named prerequisite within A's grant and rerun with the exact current source/HEAD. Never replace a key, normalize unexpected package fields or remove another owner's work to make a check pass.

## B-N02 — Actual executable/preflight release

N01 script/report commit is `51da7f7ea8bf4ccbdd9e5ff22446ecb2069d03ac`. Under A046, B inspected clean Git and cherry-picked exactly A's existing instruction correction `e02d02b3a43c062bd637b57a475b43419a9f9939`, producing `bb747cf80bdfc9bad312014d1492710511f855fd`. Source identity remains the original e02d02b; B tooling/document commits are recorded separately. No history was reset.

Actual full script preflight, with the documented private paths and exact local/source hashes, passed all 11 steps from 2026-09-12 01:33:02–01:33:05 UTC, exit0. Receipt: `output/native-build/20260912T013302Z-preflight.XgmAxc/receipt.txt`. Input equality/private dependency identity, SDK/JDK/CMake/NDK, installed Expo, public ordinary-mode configuration and resource headroom passed. Generation/compilation were not invoked. Package/lock/config remained unchanged and Android absent.

Separate executable commands at 01:33:14–01:33:16 UTC all returned0, recorded in `output/native-build/tool-versions/receipt.json` and per-tool logs:

- Temurin Java 17.0.20.1+1; Gradle9.3.1 with launcher JVM17.0.20.1; `--version --no-daemon` only.
- SDK manager19.0; CMake3.30.5; Ninja1.10.2; pinned NDK clang18.0.2 (Android build12285214).
- AAPT v0.2-13193326; apksigner0.9; platform-tools37.0.1-15733141 / ADB1.0.41. `adb version` only: no server, device list, install or device mutation.

All provision/version runners ended. A046 holds B's native-heavy lane and records external preview release. The next compile still requires A's exact approved merged-permission input. No full application suite, device/human listening or APK acceptance is implied. Preserve the initial CMake-layout failure receipt alongside successful rerun evidence.

## AI assistance and student review

The user supplied the Session B native-build/adapter mission. Its canonical task counterpart is
`docs/competition-readiness/native-batch/session-b-android-build.md` at main checkpoint `3b5317a`,
Git blob `62b88eb97752e74eac190b4bd1123d18e09b6ccf`. The live board, not that prepared prompt, granted
writes. B generated this report, dependency isolation/checkpoint commands and publisher metadata
inspection. The helper generated one bounded build script and safe checks. B reviewed it, requesting source-input equality across cherry-picks, executable NDK checks, exact permission approval and explicit source-change recovery. All were incorporated; the ancestor-only requirement and partial permission acceptance were rejected. This assistance did not generate the app.

Rejected or deferred approaches: using shared dependencies for Gradle, automatic license
acceptance, global installs, changing packages to satisfy a hypothetical build failure, using
`prebuild --clean` over existing content, silently reverting package mutations, treating an export
as an APK, changing signing identity, and implementing recovery 014 or demo access without its
specific contract. Actual helper prompts and review decisions are recorded in the next section.

No student contribution, exact-diff acceptance, Arabic listening review, device pass or verified
runtime tier is inferred from agent output. All remain pending or not run.

### Actual bounded helper prompts

Helper `/root/native_script` was launched as worker, requested Astra/ultra, no tier override exposed.
Its exclusive paths are the script and ignored `output/native-build/script-checks/**`. B lead owns
this report, dependency isolation and publisher preparation. No recursive spawning is reserved.

Initial prompt:

```text
Session B NB1 active board25. You own ONLY /home/smyk/projects/Ghaf-demo-systems/scripts/native/build-apk.sh and ignored output/native-build/script-checks/** for safe script-check evidence. Parent B owns report, dependencies/provisioning and integration; you are not alone, preserve others' edits. Do not write coordination, package/config/lock, android, dependencies, other scripts/reports. No descendants. Read canonical /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/{shared-contract.md,session-b-android-build.md}, current board r25, Android build guide. Worktree branch redesign/native-build-20260912 HEAD52c61fc; B-N01 source grant active. Implement one maintainable repeatable Bash script, default PREFLIGHT, explicit --build required; help/safe failure must never install/generate/compile. Required explicit expected HEAD and runtime source commit, project root and approved absolute JDK/SDK/output/cache paths, internal rehearsal debug-signing opt-in. Validate canonical root/Git state, installed Expo CLI and lock identity, no shared/symlink node_modules for generation/compilation; all tool/output/cache paths confined to granted B output/native-{toolchain,cache,build} and reject symlink escapes. Validate JDK17; SDK36/BuildTools36.0.0/NDK27.1.12297006/proposed CMake3.30.5; installed template Gradle9.3.1; disk/memory headroom; exact template debug keystore SHA256 221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58 (from expo/template.tgz; inspect independently); no key replacement. Versions are inspected inputs, not proven compatible. Preserve exit status, UTC starts/ends and individual step logs, no env/secret dumps. Build gate must require operator/A heavy-slot + Metro release acknowledgment, not run during your checks. Generation installed Expo prebuild --platform android --no-install only if B android absent; never --clean over content. Reuse only own documented generated tree at matching input/source identity. Capture package.json prebuild diff, allow ONLY android/ios script normalization to expo run:android/run:ios; any other tracked/dependency/lock/appconfig change stops compile, leaves evidence for A. Do not auto-restore package.json or commit it. Compile :app:assembleRelease -Pandroid.cmakeVersion=3.30.5 --no-daemon --no-parallel --max-workers=2 using private GRADLE_USER_HOME and isolated TMPDIR; cap/monitor resource policy without pretending workers cap memory. No remote upload/install/device mutation. Retain APK/log receipt and verify signed internal-release artifact: sha256, actual package/version, ABIs, apksigner cert/signature vs template cert, aapt merged permissions, allowBackup=false, blocked external-storage permissions absent, bundled JS/assets, compare approved provisional ae.ac.ku.ghaf.prototype/0.1.0/config. Use installed toolchain commands/read-only ZIP parser as appropriate. Fail closed on mismatch; never call unsigned/AAB/export success. Full local native compilation untested, label script validation only. Avoid overengineering and self-mirroring tests. Run bash -n, help, invalid option/missing inputs, wrong root/commit/path/shared deps using harmless fixtures as needed; NO build/download/install. Lead may unlink B shared symlink and npm ci privately concurrently, so don't mutate or assume deps stable during checks. Return exact diff/checks/limitations, release script before lead review/commit. Record actual prompts/assistance via message to lead. Request Astra/ultra accepted by launcher, Fast not exposed; don't claim served tier.
```

Follow-up integrity/environment instruction:

```text
Add fail-closed Gradle distribution integrity: template wrapper9.3.1 has no distributionSha256Sum. Require expected publisher SHA256 as explicit input (or recorded validated provisioned distribution), ensure generated wrapper receives matching checksum before first gradlew execution; retain generated diff/identity. Native-generated path is conditionally owned, so no current execution. Lead researching publisher checksum now. Avoid inherited .env/EXPO_PUBLIC_* unexpectedly selecting real providers; build should pin prepared service mode and reject unreviewed dotenv/authority-changing public overrides without dumping values. Keep future015 demo config handling explicit; don't invent mode flags. If scope makes any path unverifiable, stop with actionable nonzero rather than bypass.
```

Follow-up verified input handoff:

```text
Private npm ci completed exit0, unchanged lock SHA256 d312af8f6b07994c983b02908cad16c7d6c52aadebe68ac33ea068ccc1685ccb; node_modules now private and stable. Official https://services.gradle.org/distributions/gradle-9.3.1-bin.zip.sha256 returned b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06. Can pin exact checksum with source comment/report or explicit required input. Lead records provenance; no actual toolchain/native build yet.
```

Follow-up source-boundary review:

```text
Read-only review of draft input guards: (1) A candidate may be synchronized via cherry-pick while B's script/report commits remain, so upstream source commit need not be an ancestor when exact runtime tree equality is verified. Consider replacing ancestor requirement with available commit + strict source-input equality, recording both source and build HEAD, or explicitly document required local sync shape so no false block. (2) Current runtime path list omits root tamagui.config.ts and future metro.config.ts/app.json; prefer fail-closed whole tracked diff excluding only known doc/spec/planning/native-script-only paths, or include every actual build input. (3) NDK source.properties alone doesn't establish usable executable; check granted llvm/clang executable/version as well. Keep writer, apply if warranted; no lead edits yet.
```

Follow-up artifact/recovery review:

```text
Additional review point: current artifact check records every permission but only rejects two blocked storage permissions. Don't label full manifest/config approval PASSED if unexpected permissions remain unreviewed. Either require an explicit A-approved expected permission set at build (compare exact merged set), or make structural APK verification scope explicit with permission review pending and no acceptance claim. User asks compare actual merged manifest to A-approved config. Also document new-source generation-marker mismatch as deliberate stop requiring A archive/re-generation grant; no auto-clean. Existing protected files/checks remain intact. No need expand into device install or extra runtime tests.
```

Read-only follow-up after N01 release (no new source contribution yet):

```text
Reactivating your one B helper allocation for READ-ONLY bounded review, no source/coordination writes or descendants. Your script was released/committed51da7f7; B source cherry-picked exactA046 e02d02b into bb747cf. Actual private-tool preflight passed. Lead works version evidence/A build handoff. Inspect current B installed Android library manifests and Expo app config to propose exact merged uses-permission names likely on ordinary-mode candidate; give exact refs, distinguish static inputs from actual merged APK evidence, flag any unexpected provider/storage/media permission. A must approve exact set; do not self-approve. No Gradle/prebuild/browser/tools installs or runtime tests. Also note any specific artifact parser concern found from read-only review, no speculative scope expansion. All others editing must be preserved; paths read only /home/smyk/projects/Ghaf-demo-systems/{app.config.ts,node_modules,scripts/native/build-apk.sh}; no secret/env reads. Return bounded findings then release allocation. Requested Astra/ultra carried from launcher, Fast unexposed.
```

## A049 — B-N03 manifest review phase

A049 grants a bounded `--manifest-only` phase on ordinary-mode e02d02b before A approves exact permission names. It uses the same source/private-path/signing/resource/preview/terms guards, installed prebuild and transient package-diff capture, then Gradle `:app:processReleaseMainManifest` with no daemon/parallel and at most two workers. SDK automatic installation is disabled through `-Pandroid.builder.sdkDownload=false` in both Gradle modes. This phase exits before any APK task and labels the permission decision pending. It retains the actual merged XML, SHA-256, every permission declaration, package/backup attributes and required merger report; missing manifest or merger evidence is a nonzero failure.

Lead Bash syntax and ten embedded Python blocks pass. Three safe mode cases (help, conflicting modes, missing manifest grant) pass with expected0/1/1; protected config/package/lock unchanged and Android absent. Exact pre-finding-refinement evidence: `output/native-build/manifest-mode-safe-checks.json`. Helper reviewed the diff read-only and found missing merger-report handling; lead added fail-closed absence handling and rechecked syntax. Actual generation remains the next command after this coherent script/report commit.

Static permission review found six directly supported names: ACCESS_NETWORK_STATE, INTERNET, MODIFY_AUDIO_SETTINGS, RECORD_AUDIO, SYSTEM_ALERT_WINDOW and VIBRATE under `android.permission`. This is not a complete merged set or approval: transitive Maven manifests are not yet resolved. The installed Expo template's MAIN manifest line6 declares SYSTEM_ALERT_WINDOW; its line7 declares VIBRATE. Current app.config blocks only storage. Audio's plugin declares record/modify with background modes disabled. Filesystem declares a nonexported URI-grant provider. A has been notified; B changes no app configuration. Artifact verification compares permission names and retains full manifest evidence; it does not claim provider-policy acceptance.

Actual helper follow-up prompt:

```text
One follow-up READ-ONLY diff review under same one-helper budget, no writes/descendants/jobs. A049 grants B script maintenance + manifest-only generation/processReleaseMainManifest before exact permission approval. Lead just added --manifest-only to scripts/native/build-apk.sh (uncommitted relative51da7f7): mode parsing/grants, shared compile target, -Pandroid.builder.sdkDownload=false, actual merged manifest + merger-report receipt then exit before APK stage. Review git diff only for concrete safety/correctness regressions, no broader redesign. Lead runs safe help/missing-grant/mode conflict and report checks concurrently. Verify no script self-approval/fullAPK fallback; preserve all edits. Return findings then release. No tool downloads, Gradle/prebuild/browser/device operations.
```

Helper released all scopes/jobs; B accepted its missing-report finding. Human/student review remains pending. Ordinary e02d02b runtime, config and package versions are unchanged by this phase.

## B-N03 — First actual manifest attempt stopped by resource guard

Source `e02d02b`, B build HEAD `6b5d9ac808080d0ea2d26068beb853e9c5f127dc`, script SHA-256 `c9f17ca2b37f4d4d4956c834f506a556be1cc08a2a127dae376b57d31828b647`. Invocation used the documented paths plus `--manifest-only --heavy-slot-ack A049-board28 --metro-release-ack A046 --sdk-license-ack A045`.

Receipt `output/native-build/20260912T013553Z-manifest.wje3YH/receipt.txt` records 2026-09-12 01:35:52–01:43:50 UTC, **exit75/resource stop**. Installed Expo prebuild passed at01:36:06. Only package.json android/ios changed from `expo start --android` / `expo start --ios` to `expo run:android` / `expo run:ios`; exact `package.prebuild.diff` remains for A, unstaged. No lockfile/appconfig/dependency version changed. Fresh Android generation and source/native inventory marker passed. The wrapper verified Gradle9.3.1; project configuration reported SDK36, BuildTools36.0.0, NDK27.1.12297006 and CMake3.30.5. This establishes configuration progress, not a successful native build.

The real manifest task graph invoked `:app:createBundleReleaseJsAndAssets`, so its own Metro bundler ran as a dependency. This was not an external preview. Three consecutive5-second samples showed paging4710/1147/8997 pages and available memory1754532/1717236/1491240KiB. The conservative monitor stopped the wrapper and returned75, retaining `19-gradle-manifest.log` and `resources.log`. There is **no merged release manifest or APK** to approve or hand D yet. No identical attempt was silently rerun with weaker thresholds.

Observed process identities were shell397538, wrapper398356, separate-group single-use Gradle daemon398652 and bundler411415. Despite `--no-daemon`, Gradle used a daemon configured to stop after this build. All three captured descendant PIDs were absent after exit, recorded in `observed-processes-after-exit.json`; no B native process remains. B released the heavy slot and requested A's next resource/source decision. Suggested smaller individual heap budgets remain a proposal, not an applied change. Generated Android, verified caches and the transient package diff remain held for authorized recovery.

### Cleanup repair after the stopped run

Actual observation showed that group-only signaling does not cover Gradle's separate daemon group. After the run ended, B replaced it with a private receipt of boot/PID/start identities, initial launching-parent verification, descendant refresh before/during termination and Linux pidfd signaling. It never signals an unrelated process group. Empty/unproven ownership fails closed. Original nonzero Gradle exit wins if cleanup also fails; both statuses are logged. This correction is within A049/A055 script maintenance and changes no app source.

Host evidence in `output/native-build/process-guard-check/` and `process-guard-check-v2/` covers an owned separate-group child, unrelated process preservation, stale PID-start and wrong-boot rejection, a child spawned during TERM, empty receipts and an unowned initial parent. Four exact completion-block fixtures prove Gradle37/cleanup9→37,0/9→9,37/0→37 and0/0→0. These are synthetic process/exit tests, not APK or Android acceptance. Helper review found three candidate defects (late descendants, initial ownership and overwritten error code); B accepted and corrected all three before source adoption. The executing script was never edited mid-run.

Actual cleanup-review prompt:

```text
READ-ONLY final bounded cleanup review; one B helper, no writes/descendants/jobs/tests. Actual manifest run still executing script6b5d9ac; do not touch source. Observed Gradle --no-daemon spawns single-use daemon PID398652 with separatePGID398652, parent wrapper398356/PGID398356, so group-only cleanup is incomplete. Lead prepared output/native-build/build-apk-candidate.sh containing owned_processes Python boot/PID/start+pidfd descendant capture/stop, called before/during compile, on pressure, completion and EXIT; exact implementation extracted draft output/native-build/process-guard.py passed synthetic separate-group child/unrelated process/stale-start/wrong-boot cases. Review candidate delta versus current script for concrete cleanup/exit-status risks; propose narrow corrections, no broader design. Lead monitors live native run and A messages. Guard may only signal descendants captured from its own launched root, never other lead/user jobs. Helper findings and actual prompt go report; source will be changed only after current run ends.
```

### Parallel read-only adapter intake

Accepted015 contract293d351 was read without source synchronization during native work. Explorer `/root/demo_family_map` identified production constructors, receipt conversion and public controller postconditions; no adapter code or test was generated. A055 resolved the existing spelling discrepancy: the new demo uses `علياء / Alya`, leaving ordinary data unchanged. Construction uses the existing two-Child defaults, a role-only guardian label and canonical production schema/receipt functions. Source work still needs B-N05's exact grant and T005 foundation. Student review remains pending.

Actual explorer prompt:

```text
Session B one-helper allocation, READ ONLY, no descendants/writes/coordination/tests/builds. You are not alone; preserve others' edits. B native Gradle manifest job runs in /home/smyk/projects/Ghaf-demo-systems at6b5d9ac runtimee02d02b; do not modify source there. A accepted Feature015 contract commit293d351 at /home/smyk/projects/Ghaf/specs/015-demo-entry-onboarding/contracts/demo-entry-v1.md, but B-N05 runtime grant pending. Specific bounded code question: identify exact existing canonical synthetic family/profile defaults and production schema/receipt constructors B should use to implement createCanonicalDemoFamily(now), without importing test helpers or adding credentials; identify runtime validation fields for Parent/Child resume handoff postconditions from their public view types. Read only src/models/localFamily.ts, src/services/local/repository.ts, src/features/access/{parentOnboarding,childAccess.ts}, existing fixture/model profile modules as needed. A helper owns controller transaction work; do not audit/reimplement it or registry/store integration. Return exact file/symbol refs and minimal construction/validation recipe, any concrete contract gap; no generated module or suggested new behavior. Lead monitors native evidence and report concurrently. Requested Astra/ultra explicit; Fast not exposed. Release allocation on completion.
```

Both helpers explicitly released their allocations; no descendant/helper job remains. Baseline APK, later demo-mode APK, physical primary/secondary validation, Arabic listening and student exact-diff acceptance remain **NOT RUN/PENDING**. Recovery014 remains deferred.

Final cleanup source verification: Bash syntax, all11 embedded Python blocks, help and actual full12-step preflight passed. Exact preflight receipt `output/native-build/20260912T014519Z-preflight.IMMGNG/receipt.txt`, UTC01:45:17–01:45:21, exit0; script SHA-256 `3ca7626b6793768365b4ed0845b132814a35be0f481e254a5b7e79d019718ce3`. No new generation/compile occurred. The preserved two-script package delta is excluded from this commit. A057 has now published T005/exact B-N05 grant; adapter implementation follows source sync, independently of the stopped baseline build.

## B-N05 — isolated three-profile demo adapter

Authority: accepted015 contract `293d351`, amendments `7a87f69`/`3f7d5a9`, A055 canonical Alya
spelling and exact A057/A058 grant. B synchronized ONLY A's six named commits after the native job
ended:293d351→28b4fe4,31f1833→8e98fdc,9731935→ef49687,7a87f69→437daa1,
3f7d5a9→bbb9d1e,263bc88→7132946. Adapter baseline is
`713294634609853e0f4ddddbdb2f03d284985b72`; no reset/stash or other contributor edits were used.

A058's archive/restore completed at2026-09-12T01:46:47.714009+00:00. The recorded prebuild package
diff exactly matched current android/ios-only changes and the before bytes matched HEAD. Restored
package SHA256 is `2c7436d3adbee3c532b3dd5ada6623070fb3a3fef5355d97b16b2742c2fe6144`.
Only B's generated Android tree and marker moved to
`output/native-build/baseline-e02-native/android`; its sibling `archive-receipt.json` preserves the
original e02d02b source binding. Package.json is clean, root android absent, caches/logs retained.
This is an archive of a stopped build, not an APK or successful native baseline.

### Behavior and boundaries

Before this slice,015 had shared types, memory repositories and controller transaction wrappers,
but no three-profile entry adapter. `src/features/access/demoEntry.ts` now exports the exact typed
factory/adapter/dependencies. Construction does nothing. First explicit entry validates and saves
the canonical synthetic household in the isolated repository before any authority transaction.
It reuses production schema, default profiles and receipt conversion. The Parent is role-labeled;
Salem is سالم and demo Alya is علياء. Existing ordinary onboarding spelling is untouched. The
schema-required `parent@example.com` is synthetic directory metadata, not a supplied credential or
proof of identity. No relatives, new private content or runtime test helper are introduced.

Every request validates the fixed three-principal set, plain data shape, generation and epoch.
Ordinary mode, active/temporary access, stale callbacks and reentry fail closed. The callback
restores the canonical receipt and two synthetic markers only on initialization, then invokes
only the selected existing resume method. Role, selected Child, receipt and current-context
postconditions remain inside A's rollback boundary. No store role assignment, registry import,
route action, timer, verification, pairing approval, permission grant or progression call occurs.
A completed initialization retains valid profile wording through same-run sign-out/re-entry;
missing/replaced/wrong-family records fail instead of being silently reseeded. Invalidation drops
only this adapter's cache and invalidates in-flight work, never awards or restores progress.

The production dependency contract remains narrow and synchronous. A supplies isolated memory
and composed Access→Parent→Child transaction wrappers, checks its aggregate abort latch inside
the innermost callback, commits a successful handoff once and advances epoch. A owns actual reset,
failed-reset latch, routes, sign-out and all progression. D's independently reported outer/middle
wrapper reentry issue at263bc88 is **not** resolved by these adapter tests; A059 assigns its
reproduction/correction separately. Integrate that correction before claiming full transaction
composition acceptance. No shared hook/store workaround was added here.

### Focused evidence and review

Applied test-driven-development. Helper wrote behavior tests first: the initial focused run failed
because the new module did not yet exist (one failed suite, zero collected tests). After the module
appeared,62/64 cases passed; two invalid-time assertions overconstrained the error code to
INVALID_INPUT although the production schema returns INVALID_RESPONSE and the accepted contract
allows either. Those assertions were corrected to require rejection, without weakening any
successful-state oracle or changing production behavior. Expanded coverage passed69/69.

Lead scoped TypeScript initially found a generic `vi.fn` return type widened to unknown in the test
harness. The harness now keeps a zero-argument call observer inside its explicitly generic real
transaction function; no cast or production change hides the mismatch. A draft request-snapshot
edit initially missed its formatted target and referenced an undeclared request; the helper caught
it before the final passing run. The lead corrected the actual snapshot before all final checks.

Final commands on the adapter/test dirty candidate at7132946,2026-09-12 01:54 UTC:

- `./node_modules/.bin/tsc -p output/native-build/adapter-tsconfig.json`: exit0. Ignored temporary
  config extends the real tsconfig and includes only the two new files plus expo-env.d.ts and their
  imported graph; this is **not** full-project typecheck.
- `./node_modules/.bin/vitest run tests/demo-entry-adapter.test.ts --maxWorkers=1 --no-file-parallelism`:
  exit0,1file/69tests,1.09s. Test runner's displayed05:54:21 is local Asia/Dubai time.
- `./node_modules/.bin/eslint src/features/access/demoEntry.ts tests/demo-entry-adapter.test.ts --no-cache --max-warnings=0`:
  exit0; scoped Prettier check also exit0.

The69 cases exercise malformed/accessor requests, request snapshot mutation, wrong modes/counters,
active aggregate/controllers, failed seed with zero authority, second-marker rollback, injected
resume/termination failure, throws after actual session creation, valid retries, both-role/wrong-Child
postconditions, real session denial after rollback/sign-out, invalidation, reentry and stale context,
family replacement/missing records, sibling isolation, retained profile wording and no forbidden
approval/permission/reset calls. A pre-existing Parent-granted voice permission survives a failed
initialized entry and retry; entry creates none. Test progress preservation uses an independent
sentinel, **not** a substitute for A's full-store48→60/+12/help/duplicate progression tests.

No heavy suite, preview, native build or device command ran for N05. A owns next integrated checks.
Source review is AI review; student exact-diff understanding/acceptance and human identity remain
PENDING. No APK, native cold-start/process-death, physical Android, Arabic listening or rehearsal
pass is claimed. The run is memory-only and full process restart discards it; recovery014 is deferred.

### Actual supporting-AI prompts and contributions

Lead input remains the full user Session B native-build/adapter prompt, preserved in canonical
`native-batch/session-b-android-build.md`. Requested settings are Astra/Ultra/Fast; observable local
config is Astra/xhigh/fast; effective root serving settings are unexposed. Helper launch explicitly
requested Astra/ultra; Fast tier was not exposed. No model/identity/participation was fabricated.

Actual worker `/root/demo_adapter_tests` initial prompt:

```text
Session B-N05 READY A057; you own ONLY /home/smyk/projects/Ghaf-demo-systems/tests/demo-entry-adapter.test.ts. You are not alone; preserve others' edits. NO descendants, coordination/report/module/store/registry/config/package writes or commits. B lead implements ONLY src/features/access/demoEntry.ts and records evidence. Current B HEAD713294634609853e0f4ddddbdb2f03d284985b72 after exact A057 sync; package.json has authorized transient android/ios prebuild fields, preserve. Native build stopped, no heavy/preview; focused single-worker tests allowed. Read committed specs/015-demo-entry-onboarding/{spec,plan}.md and contracts/demo-entry-v1.md; A057/A055 canonical STATUS-A read only, existing tests/demo-entry-transaction.test.ts and real controllers/service/local-memory-repository. Write behavior-first tests for exact adapter contract exports createCanonicalDemoFamily(now),createDemoEntryAdapter(deps); shared types from src/models/demoEntry.ts, dependency types expected exported from adapter. Lead module absent initially: run focused command once for valid initial RED and send result immediately before lead implementation. Exact immutable demo three principals; initial canonical house, Arabic role-only Parent no invented person, Salem سالم/Alya علياء fixed IDs and existing valid profiles. Cover malformed request/mode/generation/epoch/activeaggregate/activecontrollers/temporary/reentrant; failing seed no controllers; wrong initialized family rejects; second marker failure/authorization+termination failure/throw rollback with real A transaction wrappers and retry; invalidation/stale context during callback; sibling authority; same-run signout/reentry retains canonical/profile edits and independent progress sentinel/no new seed; no auto approval/permission APIs called. Narrow ports intentionally exclude reset/signin/permissions; don't import runtime test helpers into module. Compose real deterministic access.withDemoEntryTransaction→parent→child. Tests may use fault subclasses/spies to reproduce boundaries; assert actual authorize/projectSession views/maps not justflags. Avoid duplicating A wrapper46cases or store integration tests; exact+12 fulljourney remains A. Record commands/RED/GREEN distinctions, no fullsuite/typecheck pool/browser/native. Ask lead via collaboration for exact interface issues, not user. Once module appears run focused tests and owntest-only fixes; never alter expectations to bless prohibited behavior. Return reviewable tests and release path. Requested Astra/ultra explicit, tierunexposed.
```

Follow-up instructions coordinated the single focused runner, requested snapshot mutation coverage,
reported the corrected snapshot edit, removed an unnecessary fixture cast, accepted the schema's
contract-permitted invalid-time rejection and required final test-only lint/format/release. The helper
generated only the test file; lead generated/reviewed the isolated module and this report. Rejected
suggestions: narrow INVALID_INPUT-only oracle, using fixture progress as full-store evidence,
editing A's hooks around the independent composition defect, or generating another app/provider.

Actual final read-only review prompt:

```text
Final READ-ONLY review of lead module src/features/access/demoEntry.ts against accepted015 typed contract and your69cases. You are not alone; no file writes, tests, commands that run code, descendants, coordination or commits. Lead now owns released test and fixed scoped TypeScript generic vi.fn issue by a zero-argument observer inside the real generic transaction callback; final TS pending. Review bounded adapter for concrete contract violations/failure gaps independently; do not duplicate A-owned hook composition D-NATIVE-001 review (A059/D handling). Return concise findings or none and release. Lead appends report/checks in parallel; requested settings inherited from explicit Astra/ultra launch, tier unexposed.
```

Final independent helper source review found no concrete violation within the B adapter boundary;
A/D wrapper composition review was explicitly excluded. Helper path/allocation released with no
writes or test rerun. Lead reviewed exact exports/imports, behavioral assertions and final scoped
check results. Adapter/test and this evidence slice are ready for A integration; source acceptance
remains gated on A's integrated checks/correction and pending student review. B releases the module
and test after the recorded commit; script/report/private build paths remain held for the next
exact015 candidate. The local commit hash is published in canonical STATUS-B, which A alone stages.

## Next015 build preparation — A058/A061

Adapter2fe4b09 was integrated by A as5632005. A's current producer is completing integrated015
and the independently reproduced transaction composition correction; B has no new compilation
grant yet. A058 selects the next DEMO candidate instead of repeating the ordinary baseline and
lowers individual budgets to Gradle1536MiB heap/512MiB metaspace, Node1024MiB, one Gradle worker,
one CMake job. A061 additionally approves generated-only Metro `--max-workers 1`. CPU affinity
remains two allowed CPUs; the start/stop memory, paging and disk thresholds are unchanged. These
limits are not a total memory cap and have not yet passed a native build.

The script now accepts `--entry-mode ordinary|demo`, default ordinary for existing invocations.
Only that explicit option can choose demo. Both values map to fixed false/true in the controlled
child environment, never inherited EXPO_PUBLIC variables or dotenv. Run receipts record the option,
exact public boolean and resource limits. Accepted015 requires the static build-time expression
in src/config/demoEntry.ts; current Expo public config does not use this flag and cannot prove
entry mode. B's partial source/preflight is not A's final integrated demo candidate.

Under A061 the fresh native generation step inserts exactly one line into the existing React
configuration: `extraPackagerArgs = ["--max-workers", "1"]`. It refuses an unexpected template,
multiple React anchors, a missing Expo export:embed command or an already active packager setting.
It preserves before/after Gradle files, exact diff and hashes in the run receipt before recording
native identity. No package/config/dependency file is edited by this setting. Native identity now
includes source, entry mode and versioned Metro policy, in addition to existing input/source-file
hashes. Missing/legacy/different-mode markers fail instead of relabeling old build outputs. Any
source or mode change needs A's explicit archive/fresh-generation instruction; no automatic clean.

Installed-source references reviewed: Expo CLI export/embed/index.js accepts --max-workers;
resolveOptions.js88 and exportEmbedAsync.js287/395 pass it to Metro. ReactExtension.kt96 exposes
extraPackagerArgs and BundleHermesCTask.kt170 adds it to the command. Gradle's bundle task does not
declare the public environment flag as an input; fresh app/build outputs are therefore required
across source/mode regeneration. The template already supplies --reset-cache when the task runs.
No root Metro configuration, cache purge or new library was added.

Actual future APK inspection now records source, requested entry mode/public value and SHA256 of
the single nonempty embedded `assets/index.android.bundle`, alongside the APK/signature/ABI/asset
checks. Duplicate or empty bundle entries fail. Manifest receipts label mode as requested build
input only. The actual earlier manifest graph invoked JS bundling; neither a manifest nor a mode
receipt establishes successful selector behavior. D must check the exact new installed APK.

### Safe verification only

Initial six script cases at01:56:54–01:57:01UTC passed: help, invalid/missing mode, manifest without
a grant, inherited demo override rejection and actual demo preflight. Four extracted identity
cases passed ordinary record/reuse and rejected changed mode/legacy marker. Protected package,
lock and app.config bytes remained unchanged; root android stayed absent.

Final source SHA256 `77fa09a61aee7d124100093dbec5f5e8d42c25df06366d673e6d980877029efe`:
Bash syntax and all12 embedded Python blocks passed. Exact extracted-block checks at01:59:01UTC
passed10 behavioral cases: fresh template insertion; repeated/changed-template refusal; demo
marker record/reuse; wrong-mode/legacy-policy rejection; synthetic APK metadata/bundle-hash
extraction; duplicate/empty bundle rejection. These use ignored synthetic parser fixtures, not
cryptographic verification of a real APK or a native pass. Evidence:
`output/native-build/demo-script-final-checks/{results.json,preflight-results.json,*.log}`.
Final ordinary and demo preflight results are retained separately; no generation, compile or
device command was launched. The next build still needs A's exact source, free heavy/preview
lane and the actual permission-manifest review/approved JSON before assembleRelease.

Use the existing documented absolute toolchain/output/cache invocation with `--entry-mode demo`
and A's exact source/head; start with default preflight, then A-authorized `--manifest-only`.
After A approves the actual merged permissions, run `--build` with the same source/mode and
`--approved-permissions` file. All heavy/preview/license ACK arguments still apply. Do not reuse
any old ordinary APK or claim docs-only commits change runtime source.

### Supporting AI and review

Actual helper prompt:

```text
B next bounded READ-ONLY build-script review, one helper allocation, no descendants/writes/coordination/jobs/builds. Worktree Ghaf-demo-systems HEAD2fe4b09. A058 grants lowering next native budgets Gradle heap1536/meta512,Node1024,1Gradleworker,CMake1, unchanged stopthresholds; lead implements these script/report edits. Accepted local specs/015-demo-entry-onboarding/contracts/demo-entry-v1.md requires explicit EXPO_PUBLIC_GHAF_DEMO_ENTRY=true for A's future named candidate. Inspect current scripts/native/build-apk.sh and local mode contract to propose smallest failclosed explicit --entry-mode ordinary|demo wiring, controlled env/receipt/generation marker reuse checks. Do not implement. Independently flag exact ignored build artifacts needed to bind mode/reject stale ordinary generatedtree and whether mode influences Expo config vs only JS bundle. Lead handles resource edit and waits A response to generated-only react extraPackagerArgs=["--max-workers","1"] proposal. No root config/deps/native mutation. Return exact proposal/findings, release. Actual launch originally explicit Astra/ultra, Fast tier unexposed.
```

The helper supplied source references, mode/marker/artifact attribution recommendations and a
read-only diff review; lead wrote script, host fixtures and report. Accepted: fixed public value,
strict stale-mode refusal and actual bundle hash. Rejected: making ordinary mode a new required
option, unnecessary cache cleanup and the helper's initially incorrect statement that a manifest
phase never bundles JS. It explicitly corrected that statement against the observed task graph.

Actual final review prompt:

```text
A061 now approved generated-only Metro1 injection. READ-ONLY final diff review scripts/native/build-apk.sh vs HEAD2fe4b09 for explicit mode, generated configure_generated_bundle() before/diff/hash/marker, immutable source/mode reuse and artifactbundlehash. Lead writes ignored synthetic host/parser checks and report, no actualGradle. You own no files, no tests/jobs/descendants/coordination. Do not rerun checks; inspect for concrete bugs only. Note previous wording 'manifest-only never bundles JS' rejected: actual earlier manifest graph invoked createBundleReleaseJsAndAssets; manifest receipt still cannot prove runtime mode. Defaultordinary retained, explicittrue/false env recorded, inherited overrides still rejected. Return findings, release. RequestedAstra/ultra/tierunexposed.
```

Final helper review found no concrete blocking regression within this diff, checked argument
positions and released its allocation. No helpers/descendants/jobs remain. Student exact-diff
review, actual APK, native cold-start, phones and rehearsals remain PENDING/NOT RUN. Script/report
commit is released for A intake while B retains their maintenance and private build boundaries
for the expected integrated-candidate handoff; adapter/test remain released to A.

Final preflight receipts: demo12steps exit0 at01:59:13.881945–01:59:17.660696UTC,
`20260912T015915Z-preflight.jgnIrx`; ordinary12steps exit0 at01:59:17.660731–01:59:20.949311UTC,
`20260912T015918Z-preflight.pGzQ8T`. Both bind the final script hash above and partial source2fe4b09,
with the exact controlled boolean and budgets; protected inputs unchanged and root android absent.
Scoped report formatting, Bash syntax and diff checks exit0 before release.

## Final source synchronization and second manifest attempt

A published the integrated demo runtime, then two small accessibility/navigation repairs and the
removal of an ineffective web-only style. B used only the explicitly granted clean cherry-picks,
preserving all previous source and report history:

| Grant | A commits → B commits                                           | B runtime comparison                                |
| ----- | --------------------------------------------------------------- | --------------------------------------------------- |
| A064  | 802a4a5→076cc18,1bdad93→b238965,3f194bc→e7c55cf,2ecea74→d9f1318 | Exact app/src/assets/config/package match to2ecea74 |
| A076  | ed51b32→9c2c674,af8da6c→f8870d8,f16112d→9c4b9dd                 | Exact match to f16112d                              |
| A082  | 5d8a3e8→b317f2d                                                 | Exact match to final5d8a3e8                         |

Final runtime source: `5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051`.
Build HEAD: `b317f2da6e87c5118734f2e5a56110f8f533f151`.
A083 attributes final TypeScript/lint/format and148files/1,919tests PASS to that source, with receipt
`/home/smyk/projects/Ghaf/output/native-integration/015/full-5d8a3e8/`. B did not duplicate them.
D's independently unchanged transaction regression passed76 scoped cases after A's shared rollback
correction. C's heading/handoff browser passes remain attributed to f16112d, and the ineffective
web-style evidence was withdrawn and its line removed; none of these are physical Android passes.
The current accepted015 amendments preserve B's public adapter signature and leave shared authority
and root-navigation implementation with A. Recovery014 remains deferred.

B performed exact-source12-step demo preflights at02:03:39–43UTC on2ecea74
(`20260912T020341Z-preflight.MdmjY8`) and02:17:35–40UTC onf16112d
(`20260912T021737Z-preflight.iRpWDM`), both exit0. No generation occurred in these preflights.
A083 granted the final manifest phase only after final checks passed and C039 explicitly released
the browser; A082 separately verified the owned Expo process/wrappers and port8081 had stopped.
No permission, SDK license or signing question was repeated.

### A083 actual execution and stop

Exact command executed from B's worktree:

```bash
scripts/native/build-apk.sh --manifest-only \
  --project-root /home/smyk/projects/Ghaf-demo-systems \
  --expected-head b317f2da6e87c5118734f2e5a56110f8f533f151 \
  --source-commit 5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051 \
  --jdk-home /home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/jdk-17.0.20.1+1 \
  --sdk-root /home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk \
  --output-dir /home/smyk/projects/Ghaf-demo-systems/output/native-build \
  --cache-dir /home/smyk/projects/Ghaf-demo-systems/output/native-cache \
  --allow-internal-debug-signing --entry-mode demo \
  --heavy-slot-ack A083-board38 --metro-release-ack A082-C039 --sdk-license-ack A045
```

Run directory: `/home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T022614Z-manifest.CaPVjg`.
Script SHA256: `77fa09a61aee7d124100093dbec5f5e8d42c25df06366d673e6d980877029efe`.
UTC start02:26:13, end02:27:21, **exit75: approved resource guard**. Tool session89057 ended.
Private dependencies/tools/source/config checks passed. Fresh prebuild ran02:26:16–20 and changed
only the allowed android/ios scripts. Generated Metro1 insertion, native marker, template certificate
and before-compile checks passed; Gradle began at02:26:23 with one worker and the approved lower
heaps/CMake/Metro settings. No source/script/report was edited while it read the worktree.

The actual Gradle graph reached `:app:createBundleReleaseJsAndAssets` and started Metro. Three
consecutive5-second samples exceeded the unchanged1024-page paging threshold:

| UTC      | Paging pages in interval | Available memory KiB |
| -------- | -----------------------: | -------------------: |
| 02:27:09 |                   14,264 |            3,275,200 |
| 02:27:14 |                   10,597 |            3,125,808 |
| 02:27:19 |                    4,775 |            3,050,084 |

The15% low-memory and low-disk thresholds did not trigger. The log measures the sum of global
swap-in/out counters; it does not establish which process or paging direction caused the increase.
No OOM, dependency incompatibility or specific host cause is claimed. Lower worker/heap settings
did not establish a successful manifest build under this policy. **No merged manifest or APK was
produced**, so no permission array was fabricated and no APK assembly was started.

The identity-bound guard stopped only captured descendants. At02:27:41, script478154,
wrapper478743, separate-group daemon478818 and bundler480190 were all absent; evidence is
`observed-processes-after-exit.json` beside `owned-processes.json`, `resources.log`, `receipt.txt`
and `21-gradle-manifest.log`. B explicitly released the heavy lane, helper and command jobs in
outbox025. It did not silently rerun the build or weaken the threshold. A must decide any changed
host resources/policy or exact subsequent attempt; all pinned tools are now installed.

### Generated input evidence and retained recovery state

The read-only helper independently verified all54 newly recorded native source hashes and all54
archived baseline hashes. New `generation.json` equals `android/.ghaf-generation.json` and binds
source5d8a3e8, demo mode and versioned Metro1 policy. Marker SHA256:
`aeb76360f7f42cb5149163235e792489ddc6c16419eea80cc07d1e0919ce447b`.
The only new app Gradle line is the approved extraPackagerArgs setting. Before app Gradle SHA256:
`35115d8ea39d5c3824d8c67353b6a658c5c45d1fd480f8a91a663a26c6f6fbd9`;
after SHA256: `e8a6120cec5c40a0d816a6385e095cee8ec5bfc519748918f091a5b1e6992528`.

Package before/after hashes remain2c7436d3…e6144 and3e1ecfa8…00432; the complete normalized JSON
otherwise matches. Exact `package.prebuild.diff` SHA256:
`d03246192abb88588099f723a93de5adc30709555ec0f61f64a2d371b061b7ed`.
The same template key remains in the new tree, run receipt and archived baseline:
`221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58`.
Certificate DER SHA256 is `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`;
it matches the earlier baseline certificate. This is input identity, **not** an APK signature pass.
Lock SHA256 remainsd312af8f…5ccb and app-config65646459…44b; no dependency/config/signing change.

Retain the fresh owned android tree, both transient package-script fields and all verified private
caches for A's explicit recovery decision. Do not stage package.json, restore unrelated edits or
clean-generate over this tree. Same-source/mode reuse must pass the marker's complete comparison;
a later source/mode change requires A-authorized archival/fresh generation. On resume first read
live board/statuses and actual Git, confirm the exact source/head and a free heavy/preview lane,
then follow A's chosen resource policy. A report-only commit changes build HEAD but not runtime
source; use its actual new full HEAD in any authorized command.

### Actual helper prompt, review and student explanation

```text
A083 exact final manifest phase now RUNNING, one B helper READ-ONLY receipt/native-input review. No writes, tests, builds, commands executing app/Gradle, descendants, coordination or commits. Preserve others. B root /home/smyk/projects/Ghaf-demo-systems HEADb317f2da6e87c5118734f2e5a56110f8f533f151 runtime5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051, run output/native-build/20260912T022614Z-manifest.CaPVjg. Lead monitors memory/owned processes; no source changes while job runs. Specific bounded review: inspect exact package.prebuild.diff, generation.json/android marker, app-build before/diff/after/Metro receipt and source/config/template certificate identities. Confirm only granted Android/iOS script normalization, fresh Android source binding demo+Metro1, same template key, and preserved baseline-e02-native; identify concrete mismatch without touching files. Do not repeat generic script/source audits or scan large caches. No APK/manifest success claim before actual job completes. Return exact relevant hashes/paths or mismatch and release. Actual helper model launch Astra/ultra; Fast tier unexposed.
```

The helper generated only the receipt findings above and found no mismatch. Lead reviewed them
against the run, preserved the failing exit and verified process cleanup. No helper writes/tests,
recursive agents or extra heavy jobs occurred; allocation released. Rejected conclusions/actions:
calling prebuild an APK, calling a template certificate an APK signature pass, assigning global
paging to a particular process, installing different tools, weakening limits or claiming a native
pass from unit/browser tests. Student owner/reviewer remains PENDING; actual settings retain the
requested-versus-observable distinction recorded earlier.

For student Q&A: choosing a demo profile asks the existing controllers to grant one role for this
memory-only run. Signing out removes that role but keeps the run's task/progress; it does not award
Seeds. A confirmed task still follows its normal once-only +12 path with permitted help. A fresh
app process starts a new demo run, while ordinary stored family/access data stays isolated.
The build script checks and records inputs before it generates anything, and stops when a required
check or resource guard fails. Today the application source passed its checks, but producing and
validating a standalone APK is still blocked at native build execution. Primary/secondary Android,
process death, offline launch, physical accessibility, actual rehearsals and student acceptance
remain NOT RUN/PENDING; no artifact path/hash can yet be handed to D as an installable result.

## A087 — Correlate sustained paging with available memory

Authority is canonical A-20260911T2220Z-087, board39, issued at02:29:53UTC. This operational
correction changes only the script and this report; runtime remains
`5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051`, on B baseline
`c0e847fb1e6a31c68b3241504baeb298e2285cff`. It is not a new application behavior or recovery story.
The actual CaPVjg failure above remains exit75. Its summed counters cannot establish paging
source or direction, and post-stop PSI is not evidence of exact during-run pressure.

The revised policy is recorded as `memory-correlated-paging-v2` in both the run receipt and each
JSON resource sample:

| Boundary                | Result                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Start                   | Unchanged: available memory at least3GiB AND40%; existing disk/headroom checks retained                          |
| Runtime critical memory | Below15% available stops on that sample, independent of paging                                                   |
| Runtime critical disk   | Below5GiB free stops on that sample, independent of paging                                                       |
| Sustained paging        | Sum of swap-in/out deltas exceeds1024 pages AND available memory below30%, for three consecutive5-second samples |
| Recovery                | Either paging or memory recovery resets the consecutive count                                                    |
| Invalid essential data  | Missing, malformed, inconsistent or decreasing counters fail closed with exit1                                   |
| Optional memory PSI     | Preserve readable raw text, otherwise explicitly record unavailable; no PSI threshold selected                   |

Gradle1536MiB heap/512MiB metaspace, Node1024MiB, Gradle/CMake/Metro1, two CPUs and all source,
mode, dependency, tool, signing and generation guards are unchanged. No kernel, WSL, swappiness,
host service, cache-clearing or capacity change was made. A policy stop retains exit75 and uses
the same identity-bound descendant cleanup. These per-process limits still are not a total cap.

Samples now record separate cumulative and interval swap-in/out values, their summed delta,
swap used/free, available memory percentage, consecutive count, UTC, PSI and the actual stop
reason. A first sample records its counter baseline explicitly instead of inventing paging before
observation. Essential values reject booleans, negative/missing/non-integer inputs and inconsistent
memory/swap totals. Existing corrupt/non-object state or a state file disappearing after an
already logged sample fails closed instead of forgetting the streak. The Linux kernel documents
memory PSI's `some` and `full` stall measures and their time windows; the script retains the raw
observation without treating it as an attribution or capacity benchmark.
[Kernel PSI documentation](https://docs.kernel.org/accounting/psi.html).

### Focused evidence and generation reuse

The helper extracted and executed the exact `PYRESOURCE` block with mocked input; it did not run
Gradle or the app. A first31-case run had30 passes and one failure: existing JSON `null` was being
accepted as a fresh baseline. Lead corrected the wrapper to reject it, and added rejection when
previous state disappears after a resource log exists. The original failure remains in
`output/native-build/script-checks/resource-v2/red-null-state-results.json` and
`red-null-state-tests.log`, with draft scriptSHA
`d0a013547464c612f4353632e086ef6b819342a5df5c2e5feda30370d09996e8`.

The33-case follow-up passed exit0 at02:37:15.529382–02:37:15.568732UTC. The final34-case run
also tests disappearance after a valid sample and passed exit0 at02:38:56.504051–02:38:56.531379UTC.
It covers exact thresholds,
high-headroom paging, the third correlated sample, both recovery conditions, independent first-sample
memory/disk stops, every essential field, malformed prior state, decreasing counters, mocked
status/logging and optional PSI absence/unreadable/empty/readable text. Old CaPVjg replay preserves
its actual summed values but uses explicitly synthetic all-in/all-out splits; those splits are not
new observations of that failed build. Evidence and exact command are in
`output/native-build/script-checks/resource-v2/policy-results.json` and `policy-tests.log`.
The exact final scriptSHA is
`7c2a2c8da6081586d6182232948a512615c242e67024655063f85487db9abfcf`.

Lead ran one non-heavy real host sample at02:33:45.709096UTC: available4250572/7829152KiB
(54.292%), swap used1665568/free431584KiB, initial counter deltas0 and readable PSI. It returned0;
this idle single sample does not demonstrate native capacity. The check preceded the null-state
wrapper correction and is not claimed as final-script whole-run evidence. Receipt:
`output/native-build/resource-policy-host-check/{receipt.json,resources.log,command.log}`.

The exact current generation verifier passed against the retained Android tree, and its generated
receipt is byte-equal to the prior A083 marker. Evidence:
`output/native-build/resource-policy-host-check/{generation-verify.py,generation-verify.log,generation.json}`.
MarkerSHA remains `aeb76360f7f42cb5149163235e792489ddc6c16419eea80cc07d1e0919ce447b`.
Source5d8a3e8, demo mode, Metro1 and all native source hashes are unchanged; this script-only
correction requires no prebuild or cleanup. The start-check, generation-identity and owned-process
functions are byte-unchanged from baseline. Helper independently confirmed full owned-process
functionSHA `18a0689663c5fce0edfc4614392a59fae36ba56f25c4ad83136e171aa98c68fc` on both sides.
Existing archive, current Android tree and the two authorized package-script changes are retained.
Package.json must not be included in this script/report commit.

### Assistance, decisions and pending acceptance

Lead generated the bounded policy sampler/integration and reviewed the helper's cases/results.
The helper generated only ignored test/evidence files and reviewed the narrow diff; no app, native,
preview, descendants or coordination writes. Requested/observable settings remain as recorded
above: helper launch Astra/ultra, serving tier unexposed; root config Astra/xhigh/fast does not prove
root served Ultra/Fast. Student owner, exact-diff understanding and human acceptance remain PENDING.
No suggestion to remove safeguards, increase heaps, infer harmless paging, reset generation,
re-run the full app suite or claim an APK from prebuild was accepted. The null-state finding was
accepted and fixed; optional PSI absence was intentionally kept distinct from essential failures.

Actual helper prompts, including follow-ups:

```text
A087 new bounded guard correction; one B helper. You own ONLY /home/smyk/projects/Ghaf-demo-systems/output/native-build/script-checks/resource-v2/** (ignored synthetic test runner/evidence). You are not alone; preserve source/package/native/report edits, no tracked files/coordination/descendants/Gradle/preview/fullsuite/commits. Lead owns scripts/native/build-apk.sh + report. Current HEADc0e847fb1e6a31c68b3241504baeb298e2285cff, package only permitted twofielddiff retained, oldmanifestCaPVjg stopped75 highheadroompaging. New policy exactly A087 liveSTATUS-A: unchangedstart3GiB AND40%; critical<15% immediate; disk<5GiB immediate; summedpagingdelta>1024 AND avail<30% for3consecutive5s; recoveryresetsstreak; missinginvalidessentialmemory/disk/swapcountersfailclosed, optionalPSI explicitlyunavailable. Noheap/worker/mode/source/identity/cleanup changes. Lead will add Python heredoc marker PYRESOURCE defining evaluate_sample(sample, previous) -> (state, reason), reason None/'critical_memory'/'critical_disk'/'sustained_paging'; ValueError on invalid sample/previous; state includes swap_in_pages,swap_out_pages,paging_streak and delta keys. sample keys total_kib,available_kib,swap_total_kib,swap_free_kib,swap_in_pages,swap_out_pages,disk_free_bytes, all exact ints. Previous None baseline else prior returnedstate. Extract exact PYRESOURCE body and exec namespace __name__='resource_test' (main guard prevents host reads). Create behavior tests for highheadroompaging not stop (incl oldCaPVjg sequence), exactly3correlatedstops, healthy/sample recovery resetsstreak, independentcritical15/diskimmediate includingfirstsample, exactthreshold boundaries30/15/1024/5GiB, missing/invalidessentialvalues+decreasingcounterfailclosed, unchanged source owned_processes function hash vs HEAD. Read returned reason/state, not source-string assertions except unchangedcleanup. Initial missing PYRESOURCE mayfail; actualCaPVjg highheadroomstop is existingRED and must be retained. Lead will notify oncefunctionexists. No repeatedappchecks, no actualnativeexecution. Record actualcommands/exits/UTC/limits; send test issues before changingassumptions, and release on finalresult. RequestedAstra/ultra explicitoldlaunch, Fasttierunexposed. A088 pausesB STATUSwrites only untilRESUME; neverwritecoord yourself. Lead has useful source implementation inparallel.

PYRESOURCE landed in script. evaluate_sample tuple(state,reason) exactinterface; delta keys swap_in_pages_delta,swap_out_pages_delta,swap_pages_delta; state counters/streak asagreed. main(root,run) log resource-state.json/resources.log JSONL; read_sample/read_psi available for monkeypatch tests so missingessentialmetrics actualmain returns1+stop_reason measurement_invalid. OptionalPSI string unavailable preserved. Please run boundarysuite, review sampling integration narrowdefects. No native tool/process source execution; pure/exactblock and mockedread_sample/rootmain only. Lead adds scoped syntax/help and controlledhost-read sample (nonheavy); no preflight/fullsuite duplication. STATUSpauseduntilAresume.

Minor final script additions now present: resource_policy=memory-correlated-paging-v2 in runreceipt+JSONsample, exactthresholds inreceipt; read_psi catches UnicodeError as explicitunavailable too. Evaluationtuple unchanged. Existingactualandroid generation verify passes with unchangedmarker/source/mode/Metro inventory (lead ignored resource-policy-host-check/generation-verify.log), no regeneration. Please include finalscriptSHA in result afterlasttests; then finalread-onlypolicy review/release. A088 statuswritepause stillwaitingRESUME; no newnativegrant.

Lead fixed the reproduced null-state defect: existing resource-state.json now must decode to a dict; missing prior state when resources.log exists also fails closed. Please add a missing-state-after-valid-sample regression, preserve the RED null-state artifacts, then rerun the final exact-block/mocked-main suite and report final script SHA, commands/exits, findings and release. No native execution, app suite, tracked or coordination writes. Current code passes bash syntax and git diff --check.
```

On release A must inspect/integrate this coherent script/report slice before granting ONE exact
manifest-only retry on the retained source/mode/native tree. Use the then-current full B HEAD in
`--expected-head`, source5d8a3e8 separately, and a new heavy-slot grant; A083 is not reusable.
If the revised guard stops that retry, retain the measured limitation and stop repeated attempts.
A successful actual merged manifest still requires A's exact permission-array approval before
APK assembly. D then needs the actual signed APK path/hash/source receipt for device work;
primary/secondary physical runs, cold-start/process-death, audio, rehearsals and human acceptance
remain NOT RUN/PENDING. No installable artifact exists at this checkpoint.

Final lead checks passed at02:39:25.877824–02:39:26.752236UTC: Bash syntax, all13 embedded
Python blocks compiled, help exit0, scoped report Prettier write/check and git diff whitespace
check. Exact commands/exits are in `output/native-build/script-checks/resource-final/receipt.json`.
No app suite or native job ran. Helper `/root/native_script` explicitly released all ignored test
paths and allocation after the34-case result; no live B helper/job remains. The completed
script/report slice is released for A intake; B retains maintenance and private build boundaries
for the separately granted retry. Adapter/test and shared source remain released to A.

## A092 — Interrupted single retry and resumable handoff

A reviewed/integrated the guard correction5f990802 as305681e and granted ONE manifest-only retry
in A092/board40. Source remained5d8a3e8/demo, exact B build HEAD
`5f990802eb4217b7c9d49ff91c1efddcb005421f`, scriptSHA7c2a2c8d…abfcf. The command used all
previously approved paths/low budgets with `--heavy-slot-ack A092-board40`,
`--metro-release-ack A082-C039-A092`, `--sdk-license-ack A045`. No new tools, configuration,
source, signing identity, dependency versions or memory limits were selected.

Run: `/home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T024056Z-manifest.2nbNeM`.
Start02:40:54UTC; all17 prerequisite steps passed; actual generation reuse passed02:40:58 and
Gradle began02:40:59. No prebuild or clean ran. The graph progressed through JavaScript bundling
and dependency manifest tasks, but there is no completed release-main manifest or APK evidence.

On user-directed resume at09:12UTC, tool session41379 no longer existed. The run receipt has no
terminal exit or end time; do not assign exit0, exit75 or a failure cause. Every recorded process
was absent: script497090, wrapper497447, daemon497525 and descendants498539/499660/500302/500546.
The current Linux boot identifier differs from the captured run's identifier, establishing that
the environment restarted between observations, without establishing the exact cause or timing
of this build interruption. No process was signalled on resume and prior cleanup is not inferred.

The preserved resource log has27 valid samples and one final77-NUL-byte line. Its last valid sample
is02:43:14.227203UTC: available41.922%, paging delta371, streak0, no stop reason. Across the valid
samples minimum available memory was35.647% and maximum paging streak0; none recorded a policy
stop. The Gradle log also has trailing NUL bytes. The original logs were neither repaired nor
truncated. This partial record does not prove sufficient build capacity or a completed build.

Separate resume observation: `resume-observation-20260912T0913Z.json` inside the run above. It
records current UTC, old/current boot identity, absent PIDs, exact raw-log hashes, partial sample
statistics and absent artifact paths. The durable evidence status is **INTERRUPTED / terminal
result UNKNOWN**, with merged permissions/APK/native acceptance **NOT RUN**.

B published outbox030 and explicitly released the heavy lane after verifying no recorded job
remained. All helpers were already released. The script/report completed slices, demo adapter
and tests remain released for integration; the owned private toolchain/dependencies/cache/current
Android tree/archive and authorized two-field package diff are retained for recovery. Do not
stage package.json, discard raw output, clean-generate or rerun A092 automatically. A must issue
an exact interruption-recovery decision and renewed heavy/preview grant; existing source/mode
can then attempt marker validation before reuse. A resource stop was not observed, but the single
authorized attempt was already started. A096 subsequently granted one exact interruption-recovery
execution after B resumed; its separate status is recorded below.

The runtime remains unchanged and A's148files/1919tests plus four checks remain attributed source
evidence. No duplicate app suite was run. Student exact-diff review/teach-back and human acceptance
remain PENDING. A093 separately grants D read-only readiness checks for the owner's Samsung Tab S4;
B performed no device scan/install, and tablet readiness cannot pass either narrow-phone gate.
Recovery014 remains deferred with no automatic later approval.

Actual resume assistance was limited to lead read-only Git/process/log inspection and this bounded
receipt/report; no helper was restarted, no runtime contribution was generated and no native
attempt was repeated. Requested versus observable model/settings distinctions remain unchanged.
Rejected conclusions: assuming success from task logs, fabricating a guard exit from an interrupted
receipt, attributing the restart cause, silently reusing the exhausted single-attempt grant or
claiming native acceptance from the source suite. Original history and evidence remain intact.

The first resumed managed sandbox excluded B's assigned worktree. The report/receipt write used
explicit tool escalation and completed at09:19:03UTC. The user then restored full filesystem
access; no further filesystem approval was required. Neither change expands the assigned product
or native build scope. Exact final checks/commit are published in B's canonical status.

### A096 prerequisite refusal and preservation correction

A096/board43 granted one exact manifest recovery on unchanged BHEAD5f990802/source5d8a3e8/demo,
with the existing script, low budgets, private inputs and guards. A asked B to retain that HEAD
before launch. B prepared to save only its uncommitted report append under ignored output and
return that report to committed content, leaving the authorized package scripts untouched.

Lead's first report-save Python command had an invalid non-ASCII bytes literal and wrote nothing.
The enclosing command still continued to the status update and subsequent launcher, so B031's
initial claim of successful draft preservation was premature. B explicitly corrected it in032.
The unchanged build script correctly refused the still-dirty report at its FIRST input-identity
step: `20260912T092026Z-manifest.Mf3DxX`, start09:20:19, end09:20:26UTC, exit1. Tool98311 ended;
no Gradle, prebuild or native compilation began. This is a real preparation error and a working
input guard, not an app regression or resource-limit stop. Original refusal receipt/log retained.

The corrected report-save operation then succeeded. It checked that the report started with the
exact committed bytes and contained only B's known appended section, saved the complete report
and exact diff under `output/native-build/a096-report-draft/`, verified the copy, and wrote only
that report's committed bytes back. The saved `receipt.json` retains draft/base hashes and UTC;
package.json was never restored/staged, HEAD never moved, and Git now has only its two permitted
script edits. No other contributor's work was modified or hidden. The updated handoff draft is
stored separately as `b-native-build.updated.md`, preserving the first saved version and hashes.

B requested A's corrected-prerequisite launch acknowledgment in032; no repeat was launched while
that single-execution interpretation remained pending. All failure observations and actual lead
contributions are retained; no helper was active for this preparation step. Report draft restoration
and a report-only commit follow native job completion or an explicit paused handoff.

## Completed cache recovery and actual manifest checkpoint

A100 clarified that the first input refusal had started no native work, and granted the corrected
A096 launch. All subsequent executions retained exact BHEAD
`5f990802eb4217b7c9d49ff91c1efddcb005421f`, runtime
`5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051`, demo mode and scriptSHA
`7c2a2c8da6081586d6182232948a512615c242e67024655063f85487db9abfcf`.
No source, app configuration, package version, lockfile, tool version, signing identity, worker,
heap or resource-policy change was made. Report-only work was preserved outside tracked build
inputs until this coherent checkpoint after actual manifest success.

All three runs used the existing `--manifest-only` command and pinned private paths, with the
applicable A acknowledgment substituted for the heavy-slot and Metro-release arguments:

| Grant/run under output/native-build     | UTC start → end   | Actual result                                                                       |
| --------------------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| A100 / 20260912T092446Z-manifest.3Chgns | 09:24:44→09:27:11 | Gradle1, cleanup0, script1:123 distinct empty transform metadata entries            |
| A103 / 20260912T092958Z-manifest.HfIhlC | 09:29:57→09:31:13 | Gradle1, cleanup0, script1:122 different empty transform metadata entries           |
| A106 / 20260912T093503Z-manifest.PZp7Ci | 09:35:01→09:36:18 | Gradle0, cleanup0, script0:actual main release manifest and merger report generated |

HfIhlC was launched by the tool at09:29:56; its script's retained `start_utc` is09:29:57. The table
uses the script receipt, not the earlier tool/status timestamp. Native task failure in both failed
runs was `:app:processReleaseMainManifest` unable to read specific workspace `metadata.bin` files.
Gradle10 deprecation and provider replacement messages are retained warnings, not separate fatal
errors or reasons to change dependencies. No error was relabeled as a resource stop.

Actual resource samples:3Chgns26samples/minimum58.699% available; HfIhlC13/minimum57.103%;
PZp7Ci13/minimum58.5%. All recorded zero swap use, paging streak0 and no guard stop reason.
Each run's `post-exit-observation.json` captures absent owned PIDs, final exits and raw-log hashes.
These measurements apply to these manifest tasks, not a guarantee for subsequent APK compilation.

### Exact diagnosed cache changes

The first failed log named123 distinct immediate transform entries,145 error occurrences. Each
entry's `metadata.bin` and `results.bin` existed as regular zero-byte files. The helper found no
separate fatal error and proposed preserving each complete entry instead of removing one file.
A103 granted exactly those123 directories under B's private
`output/native-cache/gradle/caches/9.3.1/transforms/`, with complete preservation and a new retry.

Lead's ignored `3Chgns/quarantine-A103.py` verified the frozen failed-log hash, exact named path set,
full B HEAD, permitted Git state, absent captured PIDs, private native-build lock, root containment,
regular non-symlink entry/files, expected empty hashes and no destination collision. It recorded
all entries before any move, atomically renamed only each complete entry, checked preserved inode
identity, and fsynced the before/after per-entry receipt and directory metadata. No deletion or
cache-wide purge occurred. A103 completed09:29:44.901852–09:29:45.732103UTC, exit0.

Actual first quarantine: `output/native-build/cache-quarantine-A103/`, receipt
`quarantine-receipt.json` SHA256
`abeeaaa10bab9958c86779d4eca8308bc4aa564c0e97d1a80a3b6fd05a97a7ca`.
Sorted original parent-path list SHA256:
`850ea405fc579b02a60ef9917832a6533f00083d17b652a4a0417b1e5c25a2c8`.
A104 subsequently accepted B's earlier proposed alternate directory, but the actual A103 operation
had already completed. A105 explicitly accepted the executed target and required preserving it;
neither alternate target was created nor the operation repeated.

HfIhlC then named122 completely different entries,144 error occurrences. The independent helper
inspected only the immediate32-hex namespace and metadata/results stats/hashes:3118 directories,
2996 nonempty metadata files,122 empty files, none missing or symlinked. Every remaining empty
metadata file belonged to the actual new failure set; there were zero unreported empty entries.
All first123 entries had reappeared with nonempty metadata, supporting their regeneration.
The helper sampled nonempty recreated results files; it did not establish that every results file
was nonempty.
Nonempty files were not claimed semantically valid. A independently obtained the same inventory.
The logs and metadata do not prove precisely when, why or whether interruption emptied these files.

A106 granted only those122 complete entries. Lead adapted the preserved A103 runner to the exact
new frozen-log/list/target/PIDs and added complete before/after namespace counts and named-path
equality. It completed09:34:40.231369–09:34:41.241868UTC, exit0; before3118 entries/122 empty,
after2996 entries/all nonempty metadata and **zero empty metadata/results pairs**. Every moved
entry remained preserved with before/after path, inode, empty-file hash and UTC observations.
The full count also recorded529 remaining empty results files paired with nonempty metadata.
These were outside the diagnosed empty metadata/results pairs and were preserved unchanged; no
semantic validity or corruption claim is made about them.
Second quarantine: `output/native-build/cache-quarantine-A106/quarantine-receipt.json`;
runner: `HfIhlC/quarantine-A106.py`. Sorted122-parent list SHA256:
`c739dd84632f02e734ca1679e8a759492ecfad37f25abe146a09d950af2b9657`.
The two old quarantine trees and every interrupted/refused/failed run remain intact.

### Actual manifest evidence and next APK gate

PZp7Ci passed all21 script steps:17 prerequisites including actual retained-native reuse, Gradle,
post-build input equality, post-build generation identity, and actual merged-manifest extraction.
No prebuild/clean ran. Gradle reported success in1m2s,87 actionable tasks:6 executed/81 up-to-date.
At09:36:45UTC, script31362 and all recorded descendants31742/31796/32515/32611/32914 were absent;
heavy/helper/job allocations were explicitly released in B046. No extra app suite ran.

Actual retained files under the absolute PZp7Ci run directory:

| Artifact                    | SHA256                                                           |
| --------------------------- | ---------------------------------------------------------------- |
| merged-release-manifest.xml | 5ba0ea320a67dde7fdd8f6099bb23c5c17a11ca5d462248e4559d7cd43797e9a |
| merged-manifest-review.json | fb1a63c5125035f2b17fdd031b5e0c9c0569707bb47dcca2ab74d010ce7b9f6c |
| manifest-merger-0.txt       | 363f60ef6ab1e1d0c9f388d7c5d3d739190b5045f04bc56dd543ddf7bd68d469 |
| receipt.txt                 | 978c603d0ae0ee6a297ba353a30d7a04f90b605c538cb2639888f5ceffecf86c |
| 18-gradle-manifest.log      | a8b6fb7bbbf9abe2fc2d09502db11f459d2bf955455273053d70dbf53c4e4815 |

The actual manifest declares package `ae.ac.ku.ghaf.prototype`, `allowBackup=false` and eight
permission names: its package-scoped DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION plus Android
ACCESS_NETWORK_STATE, INTERNET, MODIFY_AUDIO_SETTINGS, RECORD_AUDIO, SYSTEM_ALERT_WINDOW,
VIBRATE and WAKE_LOCK. These are observations, **not approval** or proof of exercised capabilities.
Prepared audio does not become real Child recording because a microphone permission is declared.
The manifest cannot prove JavaScript demo entry, embedded assets or actual APK signing.

B041 explicitly released only the two unused paths below to A; A107 acknowledged exclusive
ownership. A must inspect actual names, attributes and merger origins before writing approval:
`output/native-build/a-approved-permissions-5d8a3e8-demo.json` and
`output/native-build/a-manifest-review-5d8a3e8-demo.json`. Every other private path remains B-owned.
B will use the actual A-authored permission input only under a separately published full-APK grant.
This report-only checkpoint changes B HEAD, not runtime source; use its new full HEAD for the next
invocation after A acknowledgment. Preserve package.json's two permitted transient script edits.

No signed APK, ABI/package/signature/embedded-asset inspection or physical-device pass exists yet.
D's observed zero ADB transports and user-reported TabS4 remain separate readiness evidence;
primary/secondary phone gates and0/10 rehearsals are unchanged. Named student/human review,
exact-diff teach-back and acceptance remain PENDING. Recovery014 remains deferred.

### Actual bounded helper prompts and review

Lead wrote only the ignored checked maintenance runners and evidence/report in this slice. The
helper generated read-only findings, caught no application defect, and made no file/coordination
writes, app tests, Gradle jobs, signals, installs or descendants. Lead reviewed its exact counts,
list identities and concrete recovery proposal against the failing logs and A's grants before
mutation. No whole app or new product behavior was generated. Requested/observable settings are
unchanged: requested Astra/Ultra/Fast; root config Astra/xhigh/fast with serving unexposed; helper
launch Astra/ultra, tier unexposed. Both helper scopes explicitly released on completion.

```text
A100 recovery native run ended exit1, not guardstop. One B helper READ-ONLY diagnosis; you are not alone, preserve all files/other edits. Exact scope B /home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T092446Z-manifest.3Chgns/18-gradle-manifest.log and ONLY metadata.bin files / immediate parent directory inventories named by its 'Could not read workspace metadata from' errors under output/native-cache/gradle/caches/9.3.1/transforms/. No writes, Gradle/app/tests/downloads/signals/coordination/descendants. Lead captures final processes/resources/evidence and A outbox in parallel. Extract distinct named transform parents, report existence/size/all-zero or truncated metadata evidence, distinguish observed unreadable failure from inferred restart cause. Propose smallest exact quarantine/recompute boundary, preserving receipts and other caches, for A's separate approval under A096; do not perform mutations or broad cache scans. Identify any unrelated error in same exact log that invalidates cache-only diagnosis. Return exact counts/hash examples/limits and release. Current BHEAD5f990802/source5d8a3e8/demo, script7c2, no actual main manifest/APK; oldboot restart known, cache causal attribution unproved. Requested launch Astra/ultra, Fast tier unexposed.

New bounded READ-ONLY follow-up; one B helper, no descendants/writes/native/tests/coordination/signals. A103 moved exact123 approved parents with preserved receipt under B output/native-build/cache-quarantine-A103, then ONE sameHEAD/source manifest HfIhlC ended09:31:13 exit1 cleanup0, again metadata errors but names appear different. Scope ONLY /home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T092958Z-manifest.HfIhlC/18-gradle-manifest.log; previous3Chgns log and A103quarantine-receipt.json for set comparison; current output/native-cache/gradle/caches/9.3.1/transforms IMMEDIATE32hex directories and their metadata.bin/results.bin stat/hash only (do not descend transformed or othercaches). Identify exact newfailed set vs123moved; whether allnewfailedmetadataempty; count remaining zero-byte metadata across this immediate cache namespace and distinguish unreported empty entries from Gradle-diagnosed entries. Any examples newly recomputed prior123 metadata nonempty supports narrow repair outcome but not generalcachehealth. No mutation grant inferred. Lead captures finalprocess/resources/status and requested A105 release of two permissionJSONpaths in parallel. Need smallest evidence-backed next boundary proposal, avoiding serial blind retries or wholecachepurge. State exact counts/list hashes/limits and release. Preservesource5d/HEAD5f990802/script7c2. ActualAstra/ultra launch; tierunexposed.
```

Rejected actions/claims: deleting metadata alone while results were also empty; purging the entire
cache; removing warnings through dependency changes; guessing a restart cause; inferring APK or
native success from bundling/manifest generation; assigning permission approval to B; treating
nonempty cache metadata as full integrity proof; ignoring the initial report-save preparation error.
The next concrete task is A-reviewed APK assembly using the same source and verified inputs.

## SDK prerequisite correction after the first full APK attempt

A110 approved the existing-config internal rehearsal build after A/D reviewed the actual PZp7Ci
merged manifest. D review commit e5291f078c111a31e8bd42e5420e912ab916f70b was integrated by A.
The eight declared permissions include microphone and overlay permissions; they do not authorize
real recording or overlay use, or prove that the device shows no prompt. A alone wrote the two
released permission JSON inputs. Their SHA256 values were checked before the build:

- a-approved-permissions-5d8a3e8-demo.json: 8f2cfb92edf37604981141f9156b2136284436ddf846182f1755f2d1891aaead
- a-manifest-review-5d8a3e8-demo.json: b87fd95907ae3731a25d007bba7aba71a2a109cd33b145d03f5fe59c18977d5a

The actual first full APK run was output/native-build/20260912T094244Z-build.TWkyVS,
09:42:42–09:44:19 UTC. Script and Gradle exited1; owned cleanup exited0. The task-dependency
failure was `:react-native-gesture-handler:compileReleaseJavaWithJavac`: Build Tools35.0.0 was
missing. All17 prerequisites had passed, showing a concrete preflight coverage gap. No APK was
produced. Seventeen resource samples had minimum65.313% available memory, maximum swap used0KiB,
no sustained paging streak or recorded resource stop. Owned PIDs39982/40333/40371
were absent at09:45:55 UTC. The failed log SHA256 is
6528d2033da516bf7fc01e3add4e90725a148c7701386404bfa72b8bec62aacd;
receipt SHA256 is12bf247bc958ff01cc8c66b615340bf29d7f3bf23c6b52c905520a00fbe761c7.
Original logs and post-exit-observation.json remain intact.

The read-only helper found installed RNGH2.32.0 declares AGP8.10.1 in its buildscript but does
not assign buildToolsVersion. Its SDK inheritance helper reads root compile/min/target SDK values;
root reports Build Tools36.0.0. The observed35 requirement is consistent with a library-plugin
default, but the resolved effective AGP version/default constant was not proved. No dependency,
root Gradle, SDK platform or app configuration override was applied. RNGH build.gradle SHA256
6c4add444dec7a99a37d4c9f8f81cee46aaa6b7aaaefbaaf9a659fd5c81dbc49;
generated root build.gradle SHA256
bdb916d3fe7085c9e9f3bb45bd5eacb97f5d2c5a2b2af965642f7d904739ca68.

A113 granted only side-by-side Build Tools35.0.0 in B's existing private SDK and one corrected
same-source APK attempt. The existing official Google repository2-1.xml metadata identified
https://dl.google.com/android/repository/build-tools_r35_linux.zip,61,958,799 bytes,
published SHA1 2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc. The09:48:03.630694–09:48:13.791763UTC
download passed that checksum; computed SHA256 is
bd3a4966912eb8b30ed0d00b0cda6b6543b949d5ffe00bea54c04c81e1561d88.
The retained ZIP source.properties reports35.0.0. No new JDK, platform, NDK, CMake, Gradle, dependency or lockfile change was selected.
The installer records a scoped check of11 protected SDK file hashes; it does not perform a
complete toolchain or dependency integrity audit.

The first explicit sdkmanager install returned0 while printing that it skipped the package for an
unrecognized license record. The wrapper correctly rejected the absent installed source.properties
and exited1; return0 alone was not reported as installation success. No acceptance input was sent:
stdin was closed. The first installer records its11 protected SDK file hashes unchanged.
The failed sdkmanager log and corrected BLOCKED receipt are retained in
output/native-build/build-tools35-A113/; no installed35 directory existed after that attempt.

Lead compared the publisher XML agreement with the displayed SDK Manager agreement through
January16,2019. Both were16962 characters and word-for-word equal after whitespace normalization,
normalized SHA1 a90c249c9e874a0ca1854dd16aa9827dec1430da. The old XML stripped-text SHA1
9002c006f4b8d9a16e715a9fa4df30ddb8abf9d9 was the only stored line. Displayed stripped text
produced SDK Manager acknowledgement hash24333f8a63b6825ea9c5514f83c2829b004d1fee. This was an acknowledgement encoding
mismatch; no changed agreement wording was found. A independently verified the comparison and
A118 authorized precisely that marker append under the user's existing A045 SDK acceptance.
No new human action or generic terms acceptance was invented.

The checked append completed09:54:46.148202–09:54:46.153255UTC exit0, preserving the original
line/bytes. The append receipt records those preserved bytes and the exact authorized new line;
the lead's execution additionally checked the preimage/nonsymlink path under B's private lock.
License file SHA256 changed only fromf2ac255611b04e91254dadab03b5bcc03c6a4e338400d7a0a3ebbae8ef6bfcaf
toafd3c0a637ba1c4cd01beec2ba65bd0be86dd256b91dfd3108409c35833e4b5f.
license-marker-A118.json retains before/after bytes and UTC times. The separate retry directory
preserves the skipped attempt: retry-after-license-marker/install-verified-sdkmanager.py uses the
verified existing manager/JDK and explicit35 only, stdinclosed/private caches, then compares every
installed archive file and tool version before reporting success. The retry completed09:54:51.138546–09:58:49.209687UTC, sdkmanager0 and verification0.
The installer reports verification of168 unique archive-supplied files beneath Build Tools35.0.0;
package.xml is recorded separately with SHA256
efe1bc3424e93863725a90df610fae21e29aca6634f99dd3510d5b42fa2ff049.
aapt0.2-11948202, aapt2.19-11948202, apksigner0.9 and D8 8.6.2-dev each returned0.
All11 recorded protected SDK file hashes were unchanged relative to the post-append baseline.
This verifies the recorded files, not every path in the installed SDK. The full receipt SHA256 is
c8a1be0f1b37e4ebfc44bccc71b593e6b2ca5847c4e1156a6a16d56f9a979246.
At09:59:19.807370UTC both installer PIDs50724/50753 were absent and session38551 had ended0;
the separate post-exit observation released those consumers before native compilation.

### SDK35 bounded AI contribution and review

The lead generated the ignored download/install verification runners, comparison and append receipt,
reviewed actual output and A's exact grants, and retained the skipped-install failure. The helper
provided only the read-only Gradle selection finding; no file edits, native job or descendants.
Scope released. Requested Astra/Ultra/Fast; prior root config Astra/xhigh/fast was observable,
effective serving settings unexposed. Helper launch Astra/ultra; service tier unexposed.
Student exact-diff review and teach-back remain PENDING; no reviewer name or acceptance invented.

Actual helper prompt:

```text
A110 full APK TWkyVS ended09:44:19 exit1: dependencies of :react-native-gesture-handler:compileReleaseJavaWithJavac cannot find Build Tools35.0.0. One B helper READ-ONLY concrete tool-selection diagnosis; no writes/Gradle/tests/downloads/source/config/coordination/descendants. You are not alone, preserve all. Exact paths B /home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T094244Z-build.TWkyVS/18-gradle-build.log; node_modules/react-native-gesture-handler/android/build.gradle and gradle.properties; generated android/build.gradle and gradle.properties; installed RNGH package.json; only immediately referenced Gradle config if needed (report before broader read). Explain actual35selection relative app/root36, whether standard dependency default/tool prerequisite or source config mismatch, with exactlines. No recommendation to edit dependency/root config bypassingA. Lead captures final jobs/resources and official publisher package35/license/checksum proposal inparallel. Need smallest supplemental toolchain/script validation proposal, preserve existing36/SDK36/NDK/etc. RequestedAstra/ultra actuallaunch; tierunexposed. A111 requests STATUS-onlycheckpointpause; helpernevercoordwrites. Return findings/limits/release.
```

Rejected claims/actions: SDKmanager exit0 as success despite missing files; automatic license piping;
replacing the original license record; changing library/root configuration to bypass a concrete tool
requirement; claiming the effective AGP default was proved; upgrading all SDK tools; treating a
signed artifact as physical Android acceptance. A117 separately grants a post-build preflight35
check without an app-source change or a rebuild for tooling-only documentation.

Second read-only review checked this draft against exact receipts while the lead monitored native
compilation. The helper caught overbroad integrity wording and unsupported attribution to a receipt,
and supplied the actual completed-install paragraph. Lead accepted the factual narrowing above.
The helper did not independently repeat the archive comparison or run native tools. Allocation released.
Actual prompt:

```text
One B helper READ-ONLY evidence review while lead monitors A113 native build VLrTIn. No file edits, native/tool execution, tests, downloads, re-hashing all archives, coordination writes or descendants. You are not alone; preserve all others' files/work. Exact scope /home/smyk/projects/Ghaf-demo-systems/output/native-build/build-tools35-A113/{report-draft.md,download-receipt.json,install-receipt.json,license-comparison.json,license-marker-A118.json}; retry-after-license-marker/{install-receipt.json,post-exit-observation.json,tool-version-*.log}; and output/native-build/20260912T094244Z-build.TWkyVS/{post-exit-observation.json,receipt.txt}. Review factual accuracy/unsupported claims, particularly SDKmanager returned0 but skipped first install, same agreement vs acknowledgement marker, protected-input scope, installed168file comparison claim and exact timings/version output. Draft currently correctly says retry result pending (created before completion); propose concise actual result paragraph from completed receipt. No generalized legal advice or extra SDK install needed. Return high-signal findings/exact draft corrections and scope release; do not edit report. Lead handles native monitoring/recovery/status/build outcome, then A117 script after job ends. Requested earlier Astra/ultra launch retained; serving tier unexposed.
```

## Corrected APK attempt — measured compiler concurrency gap

A113's corrected build used exact HEAD3d1320d937e5d0853dceafa70d2fe6542a04d477,
runtime5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051, demo entry, A110 permission array and original
script SHA2567c2a2c8da6081586d6182232948a512615c242e67024655063f85487db9abfcf.
No source or tracked report/script writes occurred during compilation. Run:
`/home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T095927Z-build.VLrTIn`.
All17 prerequisites passed and the retained native tree was reused without prebuild/clean.
The build passed the earlier missing35 failure and advanced through worklets native architectures.

At10:06:09 the lead's process checkpoint showed three simultaneous clang++ children beneath
Ninja60384. A second observation recorded three beneath Ninja60875, whose actual command was:

```text
/home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk/cmake/.extract-yue16cow/bin/ninja -C /home/smyk/projects/Ghaf-demo-systems/node_modules/react-native-worklets/android/.cxx/RelWithDebInfo/f3j115v1/x86_64 worklets
```

There was no `-j` argument. The script's `CMAKE_BUILD_PARALLEL_LEVEL=1` setting and
`cmake_jobs=1` receipt field therefore did not establish actual direct Ninja concurrency1.
Those historical fields describe intended configuration, not measured enforcement. The observed
staging-path Ninja executable remained inside B's private SDK; no tool binary was replaced.
This is a build-control defect, not an application behavior or memory-pressure failure.

The lead saved the observations and sent SIGTERM only to the verified owned build-script PID54547
via Linux pidfd at10:06:54.326652UTC. Existing cleanup handled its descendants. The script ended
at10:07:01UTC with143 (session43629), not a completed Gradle verdict. The signal trap does not
record a separate numeric Gradle/cleanup exit; none is invented. At10:07:11.339324UTC all119
recorded script/descendant PIDs were absent, and heavy allocation was explicitly released.
No APK existed. Eighty-six samples had minimum55.814% available memory, maximum216KiB swap
used, no paging streak and no resource stop reason. The deliberate stop is preserved separately
from earlier automatic guard stops, tool failures and interruption.

| Evidence                              | SHA256                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| receipt.txt                           | caf38153c2a7112931dab573bceaf08ff03fdab1ee2c002f6caf46e5b6864cdb |
| 18-gradle-build.log                   | 6c9bbc13daae9996a4aba2cef7dac2874c8e359352a565510e1eccdf5e6178a5 |
| compiler-concurrency-observation.json | fadf136d27c2c8068bc0c78944aca1cad63e44d6c8a240db7433f9137d7458a3 |
| manual-policy-stop.json               | 38bebd8bb21127a7f42ba27b19c8d9cb0f6cbf0da167c8efa76c5a7a803fc246 |

A120 acknowledged the controlled stop and requested a minimal supported correction proposal.
One read-only B helper investigates installed Android Gradle plugin support while the lead
completes the independent A117 preflight slice. No compiler-limit fix, binary wrapper, generated
configuration change, cache cleanup or native retry is implied by the SDK35 preflight commit.
The actual helper prompt and reviewed conclusion will accompany that separate slice.

## A117 — SDK35 preflight requirement

Only three script lines change: the help's inspected-input list, the executable allowlist to
require35 aapt/apksigner alongside36, and exact source.properties revision validation/recording.
Missing or wrong35 now fails before generation/Gradle instead of passing preflight and failing
later at RNGH's task dependency. Existing36, SDK36, NDK/CMake/JDK/key/source/default-mode,
resource and private-dependency checks are preserved. No tool is installed by the script.
Current script SHA256 is69912fcc7157a5baf95f60421597610596d25dddf12c2d2ae12a7bd28579af24;
it is distinct from the7c2 script used by the stopped APK attempts.

Focused ignored harness: `output/native-build/script-checks/build-tools35/check_sdk35.py`.
It executes the actual extracted SDK-input and executable guard blocks against isolated synthetic
fixtures. The first fixture omitted a synthetic license sentinel, so its unrelated refusal was
retained as initial-fixture-error-results.json and corrected before the valid RED baseline.
On the unchanged script, four intended35 assertions failed: missing metadata, wrong revision,
missing executable and positive35 receipt; existing36/platform exclusions passed. After the
three-line change, all6 checks passed at10:09:04.146466–10:09:04.354357UTC, exit0.
No installed SDK file was removed to simulate failure. Syntax/help passed0; unknown option
refused1 as expected. Separate safe-checks.json records all commands, times and exits.

The actual default-mode preflight used the existing approved private paths/currentHEAD/runtime5d
with `--entry-mode demo`; neither --build nor --manifest-only was supplied. It passed all12
steps at10:09:23–10:09:27UTC, exit0, session60284 ended. Artifact:
`output/native-build/20260912T100925Z-preflight.STQqen/receipt.txt`.
Its05-sdk-inputs.log explicitly records35.0.0 and36.0.0. This did not generate, compile or inspect
an APK. No application suite was repeated for a three-line tooling check.

Lead generated/reviewed the script edit and focused harness, including correcting its own first
fixture mistake. Helpers did not write this slice. Scope is small enough for a student to explain:
we require both installed tool versions because actual modules needed both; file presence/revision
and executable checks are preconditions, while an APK/device pass needs later evidence. Student
exact-diff review and teach-back remain PENDING. No complete app was AI-generated.

Integration: cherry-pick this coherent script/report commit using the configured contributor
identity. It changes tooling/evidence only; runtime5d and approved package/config/key remain the
same, and package.json's two authorized generated script edits remain unstaged for A review.
Use the newly released B HEAD only after A publishes the exact next native grant. Preserve every
old receipt/hash and the generated native tree; do not infer permission for cleanup or another
build. A117 does not require an APK rebuild merely for this preflight change. B releases the
completed preflight/report commit for integration; maintenance ownership and private boundaries
remain B-held for the pending compiler-limit proposal. All native jobs are ended; no APK, device,
primary/secondary Android rehearsal, human acceptance or Recovery014 approval is claimed.

## A125/A133 — Per-invocation shared native pool

The lead implemented the reviewed proposal only in this report and scripts/native/build-apk.sh.
Each future Gradle invocation receives a retained `native-one-job.init.gradle` through
`--init-script`. Its Android application/library `finalizeDsl` hooks add the three approved
CMake arguments for modules declaring a CMake project:

```text
-DCMAKE_JOB_POOLS=ghaf_native=1
-DCMAKE_JOB_POOL_COMPILE=ghaf_native
-DCMAKE_JOB_POOL_LINK=ghaf_native
```

DefaultConfig, buildType and productFlavor arguments are checked first. A preexisting controlled
argument, including typed or split `-D` forms, is refused rather than overridden. An ndk-build
module is refused as uncovered. Selected/skipped records include canonical build root, module
path, requested pool arguments and actual plugin class/version/code source when Android applies.
Missing lifecycle/API/identity refuses instead of claiming coverage. Included/non-Android projects
are recorded; skipped projects and custom compiler commands still require later graph review.
No dependency, generated root Gradle source, tool binary, old.cxx, key or application file changes.

The mechanism follows [CMake3.30 shared pools](https://cmake.org/cmake/help/v3.30/prop_gbl/JOB_POOLS.html)
and [compile-pool initialization](https://cmake.org/cmake/help/v3.30/prop_tgt/JOB_POOL_COMPILE.html).
The earlier [parallel-level environment setting](https://cmake.org/cmake/help/v3.30/envvar/CMAKE_BUILD_PARALLEL_LEVEL.html)
applies to cmake --build; observed AGP direct Ninja did not use that entry point. The environment
setting is retained, but the receipt now labels `cmake_pool_requested_depth=1`, not proven jobs1.
No actual `-j1` argument is added. Equivalence applies only to inspected edges using the shared pool.

Installed AGP8.12 class inspection supports CmakeFlags.arguments and DslLifecycle.finalizeDsl(Action),
and shows configure arguments enter CxxAbiModelSettingsRewriterKt's configuration hash. This does
not prove the app resolves8.12 everywhere. Actual per-module identity and resulting configuration
paths remain a required next observation. No guessed maxConcurrentCompileJobs property was added.

### Included-build receipt correction before application execution

The first exact-hook mock suite passed43 cases. Review then found that multiple init executions in
one Gradle invocation collided with unconditional createNewFile. The helper reproduced the new
same-invocation replay test:43 existing cases passed and that new case failed. Its RED receipt is
`output/native-build/script-checks/ninja-one-job/hook-20260912T102643Z/receipt.json`.
A133/A134 independently confirmed the lifecycle from Gradle9.3.1 source: init scripts and system
properties propagate into included builds, and nested settings loading executes them. Relevant
primary source is [BuildDefinition](https://github.com/gradle/gradle/blob/v9.3.1/subprojects/core/src/main/java/org/gradle/api/internal/BuildDefinition.java)
and [StartParameter](https://github.com/gradle/gradle/blob/v9.3.1/subprojects/core-api/src/main/java/org/gradle/StartParameter.java).
No real Gradle or native failure was run to establish this source/mock defect.

The wrapper now creates one new regular receipt before Gradle starts and refuses an existing init,
hash or module-receipt file without overwriting it. The header records source commit, build HEAD,
init hash and pending coverage. Every init execution validates the prepared receipt/hash and then
appends under a shared JVM mutex and FileChannel lock, preserving the single header. Build roots
distinguish otherwise identical module paths. Fresh wrapper preparation, rather than init replay,
is responsible for rejecting prior-run outputs. Generator failures return explicitly because the
outer step runner captures status through `||`; implicit shell errexit inside a function is not
relied upon. Init hash verification runs before and after the future Gradle command.
The code-source check remains strict; A's separate source review found no reason to weaken it
merely because a plugin class is decorated.

### Proportional checks and their limits

The helper's isolated native fixture used approved installed CMake3.30.5, Ninja and NDK27 with an
Android x86_64/API24 toolchain. It generated eight tiny C compilation units, two static libraries
and two executables, without running the produced executables. The direct Ninja command had no
`-j`; all8 compile and4 archive/link edges were assigned to ghaf_native depth1. All12 entries in
.ninja_log were non-overlapping at integer-millisecond resolution, including interleaved compile
and link work; span0–216ms. Four synthetic missing/conflicting pool/compile-edge cases refused.
This proves the installed pool mechanism on that fixture, not application coverage or host capacity.

Fixture interval10:20:30.863959–10:20:31.343769UTC, exit0; receipt/logs/generated files:
`output/native-build/script-checks/ninja-one-job/20260912T102030Z/`.
Build.ninja SHA256575a73e06532ebc16c02f47d48caba9acabeb98f81668a5e42207209f516d46f;
rules.ninja SHA256db430362cc44d58c39bd1c27c709e68a318ca88845c59cc8853519fb39040bcc.
Fixture runner73793/CMake73806/Ninja73847 ended; heavy allocation released before A's host setup.

Final exact-code command:

```text
python3 output/native-build/script-checks/ninja-one-job/run_hook_checks.py
```

It ran the actual extracted Bash generator and Groovy hook with installed Groovy/Gradle Action
API classes and explicitly synthetic Gradle/DSL/plugin identity objects. All54 cases passed at
10:29:49.313546–10:29:54.575767UTC, exit0. This includes application/library selection, skipped
projects, default/buildType/flavor conflicts, unsupported ndk-build/lifecycle/identity, malformed
receipt/header/path/hash, and repeated independent mock Gradle initialization. Duplicate prepare
and hash-tamper checks correctly exited1; duplicate preparation preserved all four existing policy
and receipt files byte-for-byte. The final replay kept one header and two distinct build_root rows.
Receipt: `output/native-build/script-checks/ninja-one-job/hook-20260912T102949Z/receipt.json`;
case details: `cases/hook-results.json`. The original43-pass run and43/44 replay RED remain intact.
All final owned helper PIDs were absent at10:30:03.213587UTC; helper/boundary/allocation released.
Actual concurrent lock contention was not exercised. Mock plugin identity is not real AGP identity.

Final tested script SHA256:
`c229e099b918fdfccc3048b43b8e097a2c16f102eb0aeb9c57de8c0a0b943cf7`.
Emitted init SHA256:
`638f3160d2226fabe78258f47bced87df928ed3c03f89ff7ab0f3999ef2ae585`.
Lead syntax/help checks passed; missing build acknowledgments refused1 before Gradle.
Final default preflight passed all12 steps10:31:16–10:31:20UTC, exit0, session26465 ended:
`output/native-build/20260912T103118Z-preflight.MAqdqT/receipt.txt`.
No init or app build executes in default preflight. Resource-monitor, owned-process cleanup and
input-identity blocks were compared byte-for-byte with659f521 and remained unchanged. Heap,
Gradle-worker, CPU-affinity, SDK35/36, source/config/key and no-install guards remain in place.
No application suite was repeated for this tooling-only change.

### Next actual native gate and proposed command

A125 authorizes only the isolated fixture and tooling checks. A136 released/rescheduled host setup
after a Windows check found no installer process and no usbipd service; installation remains
unconfirmed. A132/A135 retain the single restored canonical Metro79445, which A must stop/release
before actual application Gradle execution. This commit does not consume a new APK attempt or
grant one.

Proposed next Gradle task vector, after a separately named controlled recipe/HEAD/slot grant:

```text
./gradlew :app:assembleRelease --task-graph \
  --init-script <fresh-run>/native-one-job.init.gradle \
  -Dghaf.nativePolicyReceipt=<fresh-run>/native-module-policy.jsonl \
  -Dghaf.nativePolicyInitSha=638f3160d2226fabe78258f47bced87df928ed3c03f89ff7ab0f3999ef2ae585 \
  -Pandroid.cmakeVersion=3.30.5 -Pandroid.builder.sdkDownload=false \
  --no-daemon --no-parallel --max-workers=1 \
  -Pkotlin.compiler.execution.strategy=in-process \
  '-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8 -Djava.io.tmpdir=/home/smyk/projects/Ghaf-demo-systems/output/native-cache/tmp'
```

This is a proposal, not an executed command or new CLI mode. It must use the same controlled
private environment, source/input checks, prepared hash-bound receipt, lock, affinity, resource
monitor and owned cleanup as the canonical script; do not run an unguarded alternate build path.
The [Gradle CLI reference](https://docs.gradle.org/current/userguide/command_line_interface.html)
describes --task-graph since9.1 as disabling task actions and printing dependencies. Project and
plugin configuration still need observation; no native side-effect claim is made before execution.
The pinned9.3.1 web page did not open through the browser tool, so that particular page was not
reported as read; installed CLI behavior still belongs to the next evidence gate.

Inspect the actual dependency graph before selecting a configure-only target: observed library
prefab dependencies mean a task called configureCMake cannot be assumed compilation-free.
Then obtain the exact execution grant, inspect each selected module/release ABI's effective AGP,
arguments, build.ninja and included rules/subninja, and require the depth1 pool on every relevant
compile, PCH and link edge. Missing/overridden pools or uncovered custom compiler commands/module
types block a concurrency claim. Later actual process observations and the APK verification remain
separate required evidence. Preserve old.cxx/native identity and let supported configure arguments
produce their normal new configuration; no blind cleanup or stale-graph reuse.

### Assistance, review and release

The lead generated and reviewed the tracked hook/wrapper correction and report. The helper wrote
only the ignored tiny C fixture, generated-graph checker and exact extracted-code mock harness;
it also identified/reproduced the receipt replay failure and checked the lead's correction.
No complete application, new product behavior, persistence or authentication was generated.
Actual prompts, intermediate findings and rejected suggestions are retained in
`output/native-build/ninja-one-job-proposal/helper-prompt-and-proof.txt` and
`output/native-build/script-checks/ninja-one-job/lead-assistance-record.md`, both under the absolute
B worktree named above. Requested Astra/Ultra/Fast remains distinct from
prior observed root config Astra/xhigh/fast; effective serving settings are unexposed, helper
launch Astra/ultra and tier unexposed. No student or human participation is invented.

Student explanation: different native libraries required two installed Build Tools versions, so
preflight checks both. Native compile and link work share one requested pool, and nested Gradle
builds append to one prepared run receipt. The tiny fixture and mocks test these mechanics. They
do not prove every app graph uses them or that an APK runs on Android. Exact-diff review and
teach-back remain PENDING. Human review gates acceptance; it does not prevent this tooling release.

Release the coherent script/report commit for A's inspection/integration. Runtime source remains
5d8a3e8, with only the previously authorized package Android/iOS normalization unstaged. No B
helper or native/fixture job remains; B keeps script/report maintenance and private native/output
boundaries for the next exact grant. The two A-owned permission JSON files remain A-exclusive.
No APK hash/signature/device pass or primary/secondary rehearsal is fabricated. Recovery014,
student/native/human acceptance and any broader feature remain deferred/pending as before.

## Read-only task-graph handoff after fabe2cb

The pool slice was committed as fabe2cb5a6fbbdf28a8d3b4ad6349ff22cef8948, parent659f521.
Both exact source/report paths were released to A; only the authorized package Android/iOS
normalization remained dirty. Report formatting and diff checks passed. No application command
ran in this interval. A137 separately verified the Windows USB tool after the user's installation;
that host result does not establish tablet visibility or affect the runtime source.

One bounded read-only explorer, `/root/task_graph_audit`, reviewed the proposed next command.
Installed Gradle9.3.1 TaskGraphBuildExecutionAction.execute delegates actual execution while
ConfigurationTimeBarrier.isAtConfigurationTime() is true (embedded source lines61–62), then
renders the root graph and returns success outside configuration (66–71). Therefore included
plugin compilation/JAR tasks can still execute before graph rendering. No Gradle/JVM experiment
was performed. Core-JAR SHA256, equal in the inspected and wrapper-installed copies:
`9ee3787fb4972209d51622b42ba39ba9a0263381d49fd9efd4a24c875153a34b`.

The installed RootNode class supplies the exact header `Tasks graph for: `; the proposed task's
expected line is `Tasks graph for: :app:assembleRelease`. BuildScopeServices.createBuildExecuter
(embedded source871–874) selects dry-run before task-graph; combining --dry-run/-m with graph
mode would therefore defeat this output check. StartParameter.prepareNewBuild copies taskGraph
(embedded source273), but included builds retain the configuration-time execution exception.
These are archive/bytecode observations, not executed graph evidence.

Locally grounded configuration side effects include:

- `android/settings.gradle:1` invokes Node resolution and includes RN/Expo plugin builds.
  Expo SettingsExtension.kt:22 can include additional discovered plugin sources.
- `node_modules/@react-native/gradle-plugin/settings-plugin/src/main/kotlin/com/facebook/react/ReactSettingsExtension.kt:48`
  creates autolinking directories and can execute commands/write JSON and lock hashes.
- `node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-settings-plugin/src/main/kotlin/expo/modules/plugin/SettingsManager.kt:51`
  resolves Expo configuration and may evaluate publication-selection scripts.
- `android/app/build.gradle:13` directly executes Node for entry/package resolution. Dependency
  resolution, script compilation and applicable transforms also remain configuration work.
  EXPO_OFFLINE=1 does not supply Gradle --offline; repository access is not claimed disabled.

Historical `20260912T013553Z-manifest.wje3YH/19-gradle-manifest.log:10` records plugin compileKotlin,
pluginDescriptors, processResources and jar before root configuration. This supports the setup
inventory only; that ordinary manifest run is not graph-mode evidence. Conversely, bundle/Hermes
commands live inside BundleHermesCTask.kt:82's task action, and Expo's stub-PCH ProcessBuilder
is inside expo-modules-core/android/build.gradle:270's doLast. Merely rendering those task names
does not prove that their actions ran.

The proposed minimal mode preserves all non-preflight identity, private-path, resource, preview,
lock and owned-cleanup checks. It records actual argv and uses only :app:assembleRelease with
--task-graph and plain console output. After zero Gradle/cleanup exit and existing identity
revalidation, it must verify the exact header and root task node, retain/hash the complete log,
record any setup execution statuses, and return before APK inspection. Unexpected application
or native-module `> Task` execution rows should refuse acceptance; any allowed setup rows need
the specifically identified included-plugin namespaces, never a broad `:expo*` exemption.
This output check would be post-run acceptance, not prevention of configuration side effects.
No graph result establishes Ninja pool coverage, zero setup compilation, an APK or Android pass.
The graph CLI mode remains a proposal awaiting A's exact source/execution grant.

Actual initial helper prompt, recorded without claiming a different model setting:

```text
Session B read-only bounded native review. You are not alone; preserve all other edits. No writes, coordination changes, descendants, builds, tests, JVM/Gradle execution or network installs. Worktree /home/smyk/projects/Ghaf-demo-systems, HEAD fabe2cb5a6fbbdf28a8d3b4ad6349ff22cef8948/runtime5d8a3e8. Read scripts/native/build-apk.sh and generated android/settings.gradle plus immediately relevant installed Gradle9.3.1/Expo/RN task configuration or existing logs under output/native-build. Concrete question: for a proposed guarded :app:assembleRelease --task-graph invocation, what task actions or included-build setup could still execute during configuration, and what output is reliable proof that --task-graph was applied rather than an APK build? Identify a minimal script acceptance/receipt guard and pitfalls, with exact local source references. Do not repeat pool/receipt-hook review already completed54/54. A has not yet granted actual app graph execution; no command beyond read-only source/archive inspection. Source-only findings and unknowns must be explicit. Return actual commands/prompts/contributions; requested Astra/Ultra/Fast, effective tier unexposed. Your one helper allocation is for this read-only question only; report then release.
```

The lead supplied the parser/argv/early-return seam and then asked the helper to finish without
broadening the audit. Exact prompt and follow-ups are retained under
`output/native-build/script-checks/ninja-one-job/task-graph-audit-prompt.txt`.
Helper tools were read-only pwd/Git/rg/nl/sed/sha256sum and Python zipfile/struct archive decoding;
one initial parser attempt failed, and its corrected read-only rerun succeeded. No test passed or
build occurred by implication. Rejected assumptions: graph mode is zero-execution; Expo offline
disables Gradle networking; graph task names prove action execution; generic success proves graph
mode. The lead reviewed these findings and published B070. Helper scope/allocation released at
its final response; no descendant or job remains. Explicit launch Astra/ultra, effective tier
unexposed; student exact-diff review/teach-back and native acceptance remain PENDING.

## A138/A140 — Guarded task-graph CLI

A integrated pool fabe2cb as51d99f3 and the read-only audit1ef559d as0987f24. Board54/A138/A140
then granted only the smallest graph-mode addition in B's existing script/report and ignored
focused fixtures. Actual Gradle execution remains separately gated on A's released candidate
review and explicit preview stop. The selected single spelling is `--task-graph-only`.

The mode is mutually exclusive with --build and --manifest-only. It requires all existing
non-preflight source/private-tool/SDK-license/heavy-slot/preview acknowledgments and an existing
matching Android tree. It cannot initiate fresh generation. The existing controlled launcher
receives an argv array beginning `:app:assembleRelease --task-graph --console=plain`; normal
manifest/build task vectors retain their prior options. Every mode now saves the actual array
as gradle-arguments.json before launch, without dumping its controlled environment.

After successful Gradle/owned cleanup and the existing init/source/native revalidation, the new
branch verifies a retained regular Gradle log, the requested task vector, exact graph header/root
node and subsequent successful terminal result. It rejects missing/truncated/NUL evidence,
dry-run/extra-task vectors and unexpected application/native-module task execution rows. Only
the specifically identified included-plugin namespaces may supply recorded setup-task statuses.
Raw log SHA256, source/HEAD/init identities, argv and setup rows enter graph-review.json. That
receipt states GRAPH_RENDERED and keeps native pool coverage/APK/device acceptance NOT RUN.
The branch returns before manifest/APK inspection. Graph names alone never prove action execution.

The lead authored the mode and verifier; helper native_script owns only ignored task-graph
fixtures and reads the script. No application, package, dependency, generated-native, signing or
pool-init edit is part of this slice. The same resource thresholds, one Gradle worker, two-CPU
affinity, heap limits and process-identity cleanup remain. Initial lead source comparison found
pool generator, cleanup, input guards and resource-sampling blocks byte-identical to1ef559d;
receipt output/native-build/graph-mode-release/lead-static.json records exact block hashes.
The init remains638f3160d2226fabe78258f47bced87df928ed3c03f89ff7ab0f3999ef2ae585.

Final script SHA256 is11f41cb4d12853f80877207af36859dea0487d9c538e2eb097760af7b9ab4559.
The helper ran `python3 output/native-build/script-checks/task-graph/run_checks.py` against exact
extracted parser/acknowledgment/argv/verifier functions at10:46:19.083416–10:46:20.448008UTC,
exit0,68/68 PASS. Baseline build and manifest arrays match1ef559d; graph adds only --task-graph
and --console=plain. Receipt and all case commands:
`output/native-build/script-checks/task-graph/20260912T104619Z/receipt.json`.
Runner98803 and all69 recorded runner/Bash PIDs were absent10:46:32UTC. Helper and ignored
boundary released; no JVM, Gradle, application/native command or full suite ran.

The retained first run at104523Z contains one reproduced production defect: the verifier accepted
a second different task-graph header alongside the expected graph. The lead corrected it to count
all headers and require exactly the requested one. That same run separately contains five helper
fixture-extraction errors (a greedy DOTALL initialization regex crossed its intended boundary).
Those were corrected in the harness; they were not application failures. Original RED/incorrect
fixture receipts remain intact, and the final source has68 passing cases. Assistance and review:
`output/native-build/script-checks/task-graph/20260912T104619Z/assistance.json`.

Lead Bash syntax/help/format/diff checks passed. Full-script graph mode with missing acknowledgments
refused1 at10:46:10.798117–10:46:13.993972UTC, before any Gradle execution. Default preflight
passed all12 steps at10:46:13.994026–10:46:17.660855UTC, exit0, tool session27350 ended:
`output/native-build/20260912T104615Z-preflight.eOXv3d/receipt.txt`.
Exact safe-check commands/times/exits are in
`output/native-build/graph-mode-release/20260912T104610Z/receipt.json`.
These results apply to the final11f41 script, not a later actual graph or APK.

The lead's exact helper prompt/follow-ups are retained in
`output/native-build/graph-mode-release/helper-prompt.txt`; this narrowly assigned fixtures and
read-only review, never the full application. Generated contributions: lead script/report and
helper ignored behavioral fixtures. Rejected suggestions/assumptions include accepting mixed
graphs and treating configuration as execution-free. Earlier observed root settings remain
Astra/xhigh/fast; requested Astra/Ultra/Fast and helper explicit Astra/ultra do not expose effective
serving settings. Student exact-diff review/teach-back and human/native acceptance remain PENDING.

Integration: release this coherent script/report commit for A, preserving the preceding report
commit1ef559d and runtime5d. Once A names this released HEAD and stops/releases its preview, invoke
the existing script with --task-graph-only, the usual approved absolute paths, demo entry/source,
unchanged signing opt-in, A045 SDK terms, and the actual new heavy/preview acknowledgment IDs.
Do not run the report's raw Gradle vector as a bypass. Graph output and per-module pool receipt
need actual review before any follow-on configure/compile grant. No APK retry is consumed by these
safe checks. Completed paths/helper/jobs are released for integration; B retains script/report
maintenance and private native/output boundaries. Package.json's two generated script fields
stay unstaged. No generated tree/cache cleanup, source change, device installation or014 approval.

## A144/A145 — Actual graph evidence and typed-root repair

A integrated52c43a3 as99630f4 and stopped/released its owned Metro79445 at10:49:01–02UTC.
A144 granted one guarded graph invocation on exact BHEAD52c43a3/runtime5d/demo/script11f41,
using the unchanged private toolchain/keys/resource limits and A045/A144 acknowledgment IDs.
No source/report changed during this invocation. Exact outer command/start/PIDs/end:
`output/native-build/graph-A144-launch.json`.

Actual run `output/native-build/20260912T104951Z-graph.x9Xru1` started10:49:49.696380UTC and
ended10:50:41.074128UTC, wrapper exit1. All24 prior steps passed, including Gradle exit0,
cleanup0 and after-run init/source/native identity checks. The sole failing step25 was graph
verification. Its actual line117 is `\--- :app:assembleRelease (org.gradle.api.Task)`; the
fixture-derived regex had not allowed that task-type annotation. Gradle itself reported
BUILD SUCCESSFUL in39s. This was a receipt-parser failure, not a native compilation failure.
The original log, wrapper exit1 and failed review remain unchanged; they are never relabeled0.

There were54 included-plugin setup rows:36 UP-TO-DATE,10 NO-SOURCE,8 SKIPPED. These are actual
statuses, not newly executed plugin compilation. The task graph still permits configuration
effects in general. The observed module receipt retained one header and24 rows across four build
roots, proving the included-init receipt no longer collided in this run. Five libraries were
selected with actual AGP8.12.0 identity: worklets, expo-modules-core, gesture-handler, reanimated
and screens. Nineteen rows were skipped. The app's no-CMake skip conflicts with its actual graph
configure/build-CMake nodes and blocks coverage acceptance; requested library arguments alone
do not prove generated pools or app coverage. A147 reserves that app callback investigation to
B's read-only helper; A's separate helper owns general dependency/target closure.

Resource sampling retained8 records: minimum55.617% available memory, maximum420KiB swap used,
paging streak0, no guard stop. Captured launcher/script/wrapper/daemon PIDs102410/102411/102773/
102844 were all absent10:51:29.829824UTC. B explicitly released the heavy slot; no native task,
APK retry, device action or new helper-heavy job followed. Post-exit observations:
`output/native-build/20260912T104951Z-graph.x9Xru1/post-exit-observation.json`.

| Original evidence          | SHA256                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| receipt.txt                | 2a3be5522899445359ef374439701b9d6e580d86d5375d3dc20ecc83e7bfdb0b |
| 21-gradle-graph.log        | 5630ab4dace594bf913e217e7f6ae15085c05bfe6a69795e08a7fb2d5ff3a058 |
| native-module-policy.jsonl | eb9a6fd752b6cc8a5fd77b7257173e66fec097f929e56fc6927652d860ca0556 |
| gradle-arguments.json      | 0283d59bde84e8d6db98a56595493362f61844e4fc4bb3685dc0f520145b24aa |
| 25-task-graph-review.log   | d887655c73dce4c01fa1ccfacd1974513b27237676aa6853637c3eabbe308fee |

A145/A147 authorized the one-line parser correction: accept only the observed optional
`(org.gradle.api.Task)` annotation, retaining exact root name, single graph, terminal result,
task-vector, setup-namespace and log-integrity checks. No arbitrary type or trailing text is
accepted. The lead reproduced the exact saved-log rejection at10:52:20UTC in
`output/native-build/graph-mode-release/actual-log-red/receipt.json`, then added that real log,
the exact type and three lookalike/wrong-type/trailing-text cases to the released ignored harness.
All73 checks passed with `python3 output/native-build/script-checks/task-graph/run_checks.py`;
receipt `output/native-build/script-checks/task-graph/20260912T105311Z/receipt.json`.
Final corrected script SHA256:
`8b67d221b708d3a135cf3be8b8b4729a0759a78abd3c53ec020b9eba146d619c`.
The pool init remains638f3160 unchanged. Bash/format/diff checks pass; no Gradle run was repeated.

The lead authored this one-line repair, five added ignored cases and report from A145's explicit
prompt and the retained line117 evidence. No new helper wrote this repair; the one read-only
helper handles the separate app callback question. Rejected approach: broad arbitrary text/type
matching or rerunning Gradle merely to fix output parsing. After commit, a separate ignored
review receipt will name original52c43a3/log hash and the corrected verifier commit/hash, preserving
the failed original run. The release outbox supplies its absolute path. Student exact-diff review
and teach-back remain PENDING; source/receipt review never establishes generated-edge/native/APK
acceptance. Only the script/report repair slice is released for integration; B retains maintenance
and its private boundaries for the separately granted next step. Package two-field delta stays
unstaged; Recovery014 and unrelated features remain deferred.

## A148 — Two fixed native configuration stages

A's separate read-only closure review is canonical at
`/home/smyk/projects/Ghaf/output/native-integration/015/native-graph-closure-review.md`.
It derives two stages from the saved actual release graph: worklets requests four
`:react-native-worklets:configureCMakeRelWithDebInfo[ABI]` tasks. Remaining requests16 tasks,
the same configure suffix for app, expo-modules-core, gesture-handler and screens, each on
arm64-v8a, armeabi-v7a, x86 and x86_64. Four Reanimated configurations are transitive; no redundant
targets were added. These20 explicit requests cover24 module/ABI configuration nodes.

Stage2 necessarily builds Worklets for all four ABIs through prefabReleaseConfigurePackage →
externalNativeBuildRelease, supported by Worklets fix-prefab.gradle.kts:14–19 and the saved graph.
Standard PCH/compile/link edges therefore require first-stage generated evidence before A grants
stage2. The observed release graph excludes the separate IDE-model/Debug generateStubPCH tasks;
this selector does not add them. CMake compiler probes can still compile even in stage1.

The CLI adds only the mutually exclusive `--native-configure-stage worklets|remaining`. Unknown
stages, arbitrary task strings and conflicting execution modes refuse. The single canonical
native_configuration_tasks function expands both argv and receipt expectations. It preserves
the same controlled launcher/options, prerequisites, resource/preview/owned-process guards and
existing-native identity requirement. No new source, native generation, dependency or ABI change
is allowed through this selector. A native-configure-review.json receipt records exact stage,
requested tasks, full argv, source/HEAD and raw successful-log hash after existing post-run checks.
It explicitly retains transitive compilation and pending generated-pool/APK/device validation,
then exits before artifact inspection. Target selection never becomes a compile-free claim.

This is tooling preparation only. A149 separately grants the late-app-CMake hook repair; A148
stage1 execution still needs its reviewed candidate and named resource grant, and stage2 needs
reviewed fresh Worklets edges plus A's separate grant. The lead owns this script/report; one
helper owns only ignored native-configure-stage behavioral fixtures. No actual stage has run.

Final source SHA256:
`c19796476a5bb8b52d4e0230e7733dfc2c983ab55f0ec6af279bc1fcb1e293b0`.
The helper's first and only focused run passed65/65 at10:58:32.293319–10:58:33.417270UTC,
exit0: `python3 output/native-build/script-checks/native-configure-stage/run_checks.py`.
It covered both exact task arrays/ABI order, invalid/missing/arbitrary/mixed modes, acknowledgment
gates, unchanged build/manifest/graph argv against64cdbec, and valid/refused stage receipts.
No production or harness failure occurred. Results, all commands, exact initiating prompt,
contributions and A's closure-report hash are in
`output/native-build/script-checks/native-configure-stage/20260912T105832Z/{receipt.json,assistance.json}`.
All66 recorded runner/Bash PIDs were absent10:58:57.775935UTC; helper/allocation released.
No JVM/Gradle/native/application execution or unrelated suite repetition occurred.

Lead syntax/help passed0; invalid stage and conflicting mode each refused1 before execution
at10:59:29UTC. Exact commands/times: `output/native-build/native-stage-release/safe-checks.json`.
Report formatting/diff checks passed; pool init638f remained byte-identical. Lead authored the
stage selector and receipt, helper only ignored fixtures/read-only review; student exact-diff
review and teach-back remain PENDING. No full application was generated.

Release the coherent stage CLI/report commit for A, keeping A149's separate app-hook correction
next in the queue. Runtime5d and the unstaged package-script delta remain unchanged. Finished
paths/helper/jobs are released for integration; maintenance/private native boundaries remain B's.
Neither this release nor passing mocked receipts authorizes stage1/stage2 execution or APK proof.

## A149 — Late app CMake path and final module verification

A granted this correction separately from stage selection. The read-only B helper established
the exact ordering: android/app/build.gradle applies Android atline1 and React atline3. Our init
registers finalizeDsl when Android applies; ReactPlugin.kt:83 subsequently calls
configureReactNativeNdk. NdkConfiguratorUtils.kt:21 registers a later finalizeDsl callback;
its29–34 set the app's default CMake path and37–55 add to the existing arguments without clearing
them. The early null-path return therefore skipped the app before its later native setup.

Installed AGP8.12 DslLifecycleComponentsOperationsRegistrar appends callbacks to an ArrayList and
iterates in insertion order (embedded source24/27/31). BasePlugin.createAndroidTasks executes
callbacks at632, locks the DSL at705, then creates variants at745. Archive hash:
`ac19aabdfb6736ed49697e107ba0d824c6f5078e203f2bce911e8a6bba6d91cb`, under the previously recorded
private AGP8.12 cache path. These source/bytecode observations support the callback explanation;
they do not themselves validate a new native execution. A owns the independent full task closure.

The lead keeps argument mutation in finalizeDsl: check conflicts and add the three existing pool
arguments even while the CMake path is null. The hook never sets a CMake path. A read-only
taskGraph.whenReady callback then checks final CMake/ndk-build paths and all default/build-type/
flavor argument scopes. The three exact default definitions must each occur once; removal,
replacement, duplicates and typed/split-form overrides refuse. Android selected/skipped rows are
issued only here with canonical build root, module, actual plugin identity, final path and verified
argument fields. An ndk-build module still refuses. The main B Android build must contain exactly
the six native owners from the approved release graph; included-build roots keep their own hooks
and receipt identity without inheriting that main-build module set.

Coverage here means final module DSL verified, not generated Ninja edges accepted. Mutation is
never delayed until taskGraph.whenReady, projectsEvaluated or beforeVariants. This avoids trying
to repair an already locked DSL. The existing wrapper/header/hash binding, process/resource
guards, task vectors and stage receipts remain unchanged. Lead static comparison with51d9c44
confirmed identical cleanup, input, stage/argv/verifier and resource/launcher blocks; hashes are
in `output/native-build/late-cmake-release/preserved-blocks.json`.

The helper reproduced the old early-path bug in a sequential mock RN callback:54 existing cases
passed and late_rn_application_path failed. Its old638f hook recorded no CMake despite the later
path being present. Evidence remains in
`output/native-build/script-checks/ninja-one-job/hook-20260912T110106Z/receipt.json`.
Lead authors the correction; the helper owns only the ignored extracted-code/mock harness.
No Gradle/native stage is being used as a test for this source change.

Final script SHA256:
`99ae5e6c1b9df0198d85f1b1cc10a9c4ea02d419f3748f9af961dce0a9d1dcab`.
New emitted init SHA256:
`a2d7d42ed62360d9d5636f2e45b2e7f2be51e60eb67920dede4d4627f2754435`.
At11:03:43.834517–11:03:51.786569UTC, the existing
`python3 output/native-build/script-checks/ninja-one-job/run_hook_checks.py` passed101/101
standalone Groovy mock cases, exit0. These cover late RN path selection, early canonical arguments,
all six owners/every missing owner/extra or duplicate owners, later default/build-type/flavor
changes and added scopes, late ndk-build, included-root receipt reuse and unchanged hash/preparation
guards. Immutable snapshots prove the final callback does not mutate the mock DSL or path.
No harness error was observed in this slice. Actual Gradle lifecycle/native execution remains a
separate gate. All six recorded final PIDs were absent11:03:58.960957UTC; helper/allocation released.

Final evidence, exact helper prompt, contributions, preserved harness copies and pristine init:
`output/native-build/script-checks/ninja-one-job/hook-20260912T110343Z/`.
Its receipt.json and assistance.json distinguish the old54/55 RED from the new101/101 GREEN.
The lead authored/reviewed production code; helper contributions are isolated fixtures and
independent read-only review. No full application or new product behavior was generated.
Rejected approaches: forcing RN's CMake path, choosing guessed callback order, mutating locked
DSL in a late callback, or treating module arguments as generated-pool/native acceptance.
Settings retain the previously documented requested/observable distinction; student exact-diff
review and teach-back remain PENDING.

Lead Bash syntax and report formatting/diff checks passed. Actual default preflight passed all12
steps at11:04:40.880722–11:04:44.867755UTC, exit0, runner118443/script118445/session10986 ended.
Receipt `output/native-build/20260912T110442Z-preflight.T2gX9z/receipt.txt`; exact invocation and
outer result `output/native-build/late-cmake-release/20260912T110440Z/receipt.json`.
No init, Gradle graph, native configure or APK job ran in this preflight.

Release the coherent A149 script/report commit for A, following separate stage commit51d9c44.
Only the authorized package Android/iOS delta remains unstaged. A149 permits the first four
Worklets configure requests, after a separately named candidate/resource grant, to exercise actual
final DSL verification for all six native owners and generate Worklets graphs. It does not require
another actual graph-only run. Stage1 must yield final module evidence and fresh PCH/compile/link
pool checks before A grants stage2, which necessarily compiles Worklets. No native configuration,
cleanup or follow-up is automatically authorized by this tooling release. Helpers/jobs/heavy are
released, maintenance/private boundaries retained; device trust/readiness remains A/D-owned.
