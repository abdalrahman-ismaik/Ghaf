# Session B — Repeatable Android build

**B-N01 ready: executable fail-closed build script and safe validation; private dependencies and pinned tools provisioned. No APK or native pass yet.**

This batch owns build tooling and a later separately granted demo-access adapter. Recovery 014 is
deferred. The requested three-principal entry is awaiting A's committed Feature 015 contract and
exact module/test grants; no access behavior is implemented by this report.

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
