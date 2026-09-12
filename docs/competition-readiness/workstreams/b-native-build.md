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
