# Release QA execution record

Updated: 2026-09-15 Dubai; the d13/b2 receipts are dated 2026-09-14 UTC.
Verdict and full requirement scope live in the
[release ledger](release-readiness.md). This is a sanitized execution record,
not acceptance of the untested public release.

## Candidate provenance

The release lane began from `baf88a0` with substantial existing uncommitted work.
Other sessions retained their source boundaries. Runtime Feature020 was integrated
through `c54f25f`; `d13c148` corrects a required AI test fixture. Root's subsequent
`f129b7f` changes only the transitive YAML parser lock entry, not application code.
The first fresh native candidate, `d13c148`, was built and installed successfully;
its historical standalone checks are retained below. Candidate `63353ae` added
the parser patch, deployed Help repair `e8c6b3b` and safety display. The tested
`b2b4302` APK includes those changes and the default-font footer repair; fresh
build34891473556 passed, and its native execution is recorded below. Later
`4dd6490` adjusts enlarged-text footer columns after a b2 failure; its source
checks and fresh build34896135774 passed. Its exact artifact and bounded native
acceptance are recorded in the final4dd section below.
These candidates exclude the separately owned uncommitted navigation work.

Package: `ae.ac.ku.ghaf.prototype`, version `0.1.0`, code `1`, minimum API24,
target API36. Internal builds use the existing Expo template signer. A release-mode
APK with this signer is not a Play production artifact.

## Root-executed checks

| Check                                       | Result                      | Evidence / limit                                                                                                                                                        |
| ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native artifact validator                   | PASSED, 12 tests            | Complete flag/version validation and overlay-permission rejection; source validation is not merged-manifest evidence.                                                   |
| Android runtime configuration               | PASSED, 5 tests             | Overlay block and retained platform settings.                                                                                                                           |
| Initial gateway hardening                   | PASSED, 18 tests            | Missing replay storage rejects HTTP/MCP operations without consuming input/provider/budget.                                                                             |
| Full gateway directory after fixture repair | PASSED, 107 tests / 8 files | `npx vitest run tests/gateway --maxWorkers=2`, 23:42 Dubai, 2.71 seconds.                                                                                               |
| TypeScript / repository checks              | PASSED                      | Root typecheck and repository checks; see exact candidate CI below for complete clean-checkout validation.                                                              |
| Dependency patch reproduction               | PASSED                      | Old 4.3.1 accepts four empty merge sources with budget3; isolated 4.3.2 rejects. All three workflow YAML parse results unchanged. Only the locked parser entry changes. |
| Locked production dependency audit          | PARTIAL                     | Before: 1 high / 14 moderate. After parser patch: 0 high / 14 moderate; remaining reachability in the security record. This is not a blanket security pass.             |

[Run34887712753](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34887712753)
at `c54f25f` **FAILED**: 3,387 tests passed, one failed, six skipped. The failing
Gemini unauthenticated-request fixture omitted the newly required replay binding.
All preceding verify steps passed; APK compilation was skipped. `d13c148` supplies
the explicit test binding and preserves the 401/no-body/no-provider assertions.

[Run34888514880](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34888514880)
at `d13c148` passed its complete source-check job (repository, Node verifier tests,
typecheck, lint, format, application tests) and fresh Gradle compilation. The
downloaded APK's SHA-256 matches its build receipt; root's upgrade install succeeded.
This establishes the exact d13 artifact, not the latest source or Play readiness.

The separate backend CI34888514402 and repository CI34888514386 passed for
`d13c148`; both also passed for parser-patched `f129b7f` in34889187004/34889187017.
Candidate `63353ae` backend CI34889995408 passed the clean migration/SQL/Auth and
separate messaging checks. Root also reports repository/backend CI passed for
`b2b4302`; its local typecheck, scoped lint and 26 focused safety/core UI tests
passed. Those 26 tests are distinct from the subsequent full CI application suite.

[Run34891473556](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34891473556)
at `b2b43028ebd61ba943a808bf6c3be35ff8f78d5f` **PASSED** the source gates and
fresh Gradle compilation. The retained `b2-ci-test-summary.txt` records
**3,397 tests passed / 7 skipped; 233 files passed / 7 skipped**, in49.10seconds.
Typecheck, lint, format and repository checks passed; the source job also passed
20 Node verifier tests. The artifact receipt records embedded bundle, signature,
16KiB ZIP alignment, `testOnly=false`, `debuggable=false`, cleartext disabled and
backup disabled. These checks do not establish physical-device or public-release
acceptance. Later `4dd6490` has root-executed typecheck, scoped lint and26 focused
UI passes. Its subsequent complete CI and native result are recorded below.

## Task safety and Help repair

Safety presentation9tests passed under the helper. Root then ran typecheck,
scoped ESLint and the safety/core UI suites: **26tests in2files passed**.
The actual nested details render the existing safety fields in both languages
for Parent/Child and assignment review; missing fields do not create blank groups.
No adult certification, task-state change or new award was added by this UI repair.

Before015, the new local SQL suite reproduced the assigned Help defect with
**8failed assertions out of24**. After applying the guarded migration twice safely
to loopback PostgreSQL, **24/24 plus the existing73core checks passed**. It
preserves caller/family/revocation restrictions, optimistic revision, exact retry,
task assignment, displayed award and zero recognition/canopy creation.

Root captured the existing hosted function DDL (schema only) for a compatible
corrective migration. The dryrun listed exactly015, with no seeds or role changes;
deployment to the confirmed main project succeeded. Post-deploy read-only metadata
reported20migrations through015, the new predicate and unchanged denied internal/
unauthenticated EXECUTE grants. Full database/media recovery remains unverified.

At19:58:16UTC, root ran **five ordinary hosted checks** using the retained controlled
QA invocation14222, independent Parent and newly paired Child SDK sessions:
request Help while assigned, exact retry, independent Parent readback, unchanged
assignment/8-Seed displayed award, and no recognition/memory/canopy change. Both
sessions signed out locally afterward. One new assigned GI01 QA task was retained
for native continuation; existing QA history and real account records were kept.
Credentials/tokens remained outside tracked evidence. No production adversarial
or load test was run by this release lane.

## Actual Android baseline

ADB confirmed `emulator-5554`, `Ghaf_API35_ARM64Bridge`, Android35/x86_64 with an
ARM64 translation layer. The displayed viewport was 720×1600 at320dpi, font scale1.
Only one emulator ran. Other listed profiles were `Ghaf_Account_Test_API35_20260914`
and `Pixel_9_Pro_XL`; listing them does not establish execution coverage.

Root created Android user11, `GhafReleaseQA20260914`, and installed the existing
package for that user without changing its APK. App UID was1110209. Original
user0/user10 sessions and the separate accounttest2 package were retained.

The installed baseline SHA matched source `5ad7faa63c90c63287b01da2045f58a1b17106d5`:
`6e809841e6824dca0f2ef4be339323f73e2ef079449bad1ed262329b1af45100`.
It is 88,134,244bytes. The artifact is retained in `output/android-internal-final/`.
`adb reverse --list` was empty. JavaScript ran from the APK without Metro.

| Executed interaction                | Result                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Fresh user opens signed-out app     | PASSED: Arabic form, no inherited session.                                                          |
| Switch English; scroll the form     | PASSED: rendered controls remained reachable.                                                       |
| Open password keyboard; system Back | PASSED for this sign-in path. Recovery and all keyboard modes are separate, untested cases.         |
| Owner-authorized account sign-in    | Initially FAILED: network unavailable. After emulator DNS recovery, PASSED to `pilot-ready-screen`. |
| Force-stop and cold relaunch        | PASSED: restoring state then authenticated ready state.                                             |
| Local sign-out                      | PASSED: signed-out form returned. No family/business records were changed.                          |
| Process-cold activity timings       | Three samples collected; see [performance record](release-performance.md).                          |

The failed network path was reproduced outside the app: emulator hostname lookup
failed while Windows resolved the same project. Gracefully restarting the same AVD
with `-dns-server 8.8.8.8,8.8.4.4 -no-snapshot-load -no-snapshot-save` restored lookup
and actual login. No emulator wipe, TLS bypass or backend change was used. This is
an environment repair, not a claimed app networking improvement.

After login, root collected only resource IDs and expected fixed error markers;
private UI labels, tokens and family data were not saved. Redundant/account-form
captures created by this lane were deleted, reclaiming1,301,476bytes. The empty
Arabic baseline capture and sanitized timing/metadata receipts remain under
ignored `.expo/release-20260914/`. No credential-bearing artifact is tracked.

Root signed out, restored user11's screen timeout to60000ms, force-stopped its app,
returned the foreground to user0 without capturing it, and released emulator input
to Feature020. Later input must be coordinated; changing user0 data is not allowed.

## Fresh d13 standalone native continuation

**Root executed**, on the same API35 emulator and isolated Android user11, after
Feature020 released input. This continuation is separate from the historical
`5ad7faa` checks above. The source is `d13c148e09ddd64c5cd17c8f784c21f7c5396f72`;
the standalone APK is 88,449,616 bytes with SHA-256
`2648b6038d5b65778583f05bae9df7ccb3208cf134a1cf1cbbc5ff803fa8f060`.
Artifact and build receipt are under ignored `output/release-021-baseline-d13/`.
It runs its embedded bundle without Metro and retains the internal signer.

| Executed interaction                                                                          | Result and boundary                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upgrade install over the existing prototype package                                           | **PASSED**. This was an upgrade, not a clean-install test. Original users' application data was preserved.                                                                              |
| Controlled synthetic Parent A signs in through native UI                                      | **PASSED** to the real family surface. No owner household was used for QA business writes.                                                                                              |
| Parent creates a pairing invite, signs out, then pairs the restricted Child through native UI | **PASSED** for this controlled family. Parent and Child ran sequentially on user11; this is not two concurrent independent native clients. Pairing credentials are not reproduced here. |
| Child force-stop and cold relaunch                                                            | **PASSED**: the paired Child session and real task view restored. Language did not retain EN; see P2 below.                                                                             |
| Disable emulator Wi-Fi and data, then cold launch                                             | **PASSED for truthful failure**: `pilot-error-screen` appeared. It did not present an empty or synthetic account as a successful restore.                                               |
| Re-enable connectivity and retry                                                              | **PASSED**: the real tasks returned. This does not establish offline mutations, process-death mutation recovery or every network failure mode.                                          |
| Task/growth state inspection                                                                  | Two tasks were present in the native dataset. The retained Parent read confirms one recognition, one memory and canopy1, without new task completion in this continuation.              |
| Retained crash-buffer scan                                                                    | Zero matched `FATAL EXCEPTION`, `Fatal signal`, and package-specific ANR markers. Limited to the scoped retained crash buffer; not proof of no ANR or Play-vitals stability.            |
| Three repeated Child navigation cycles                                                        | Frame and memory counters collected; see [performance evidence](release-performance.md). No physical-device or FPS conclusion.                                                          |

At **20:14:49 UTC on September14 / 00:14:49 Dubai on September15**, ignored
`.expo/release-20260914/native-core-paired-before.json` recorded the controlled
assigned task still at revision1, Help requested, empty step states, recognition1,
memory1 and canopy1. The two-task count is also recorded in the native profiling
method, not a field in that JSON receipt. Root observed these existing totals
unchanged; **no Child completion or Parent confirmation was executed in this d13
continuation**. Earlier hosted recognition evidence must not be relabeled native.

Other ignored evidence includes `d13-first-open`, `d13-family-a`, `d13-tasks`,
`d13-child-restored`, and `d13-offline-restart` UI captures; `d13-profile.json`,
`d13-memory-before.txt`, `d13-memory-after.txt`, and `d13-crash-summary.json` retain
the measurement summaries. These are root's executed receipts, reviewed by the
documentation helper; the helper did not repeat device actions. No private labels,
tokens, invite values or complete UI dumps are copied into this tracked record.

## Accessibility baseline and open native findings

TalkBack was installed and bound on user11. Root observed touch exploration enabled
and a visible accessibility focus outline, then a Garden activation while the
service was bound. Initial notification/setup interaction was unreliable under
ADB injection and was dismissed with Back; no spoken-output, traversal-order or
complete accessible journey acceptance is claimed. Services were restored to
disabled/empty afterward. d13 font-scale1.5 was also rendered and captured, then
restored to1.0; this is baseline coverage, not acceptance of the later footer.

The d13 APK's50 ELF libraries passed a read-only PT_LOAD16KiB alignment/congruence
check in addition to ZIP alignment. This is artifact evidence, not execution on
a16KiB-page device. The known-credential scan required Hermes string-boundary
review; the [security record](release-security-and-privacy.md) explains that result.

**P2 — language choice does not persist through cloud restart.** On d13, the
paired Child's Settings EN switch changed the visible language, but force-stop
and cold launch returned to Arabic. Parent also selected EN on the sign-in screen
and received Arabic after the account profile loaded. The two code paths differ:

- [setLocale](../../src/state/usePrototypeStore.ts#L3521) updates memory and only
  saves through an existing local-family record. Cloud accounts lack that synthetic
  record; [pilot/demo repositories](../../src/services/index.ts#L116) intentionally
  use memory storage. [Locale bootstrap](../../src/state/usePrototypeStore.ts#L533)
  consequently falls back to the initial Arabic session. Paired Children intentionally
  skip adult profile loading in [the pilot controller](../../src/features/pilot/controller.ts#L242).
- [PilotGate](../../src/components/pilot/PilotGate.tsx#L70) applies the authenticated
  adult profile's preferred locale once per user/revision, overriding the sign-in
  screen choice. Arabic is the [database profile default](../../supabase/migrations/20260914000100_account_profiles.sql#L9).
  This is existing **Parent-profile precedence**, while the general language switcher
  does not save that profile. Its revision-checked account edit remains a separate action.

No rushed locale fix is included. A future bounded change needs a device-only
locale preference and explicit precedence with account preferences. Preserve the
[authorized prototype reset to signed-out Arabic](../../specs/015-demo-entry-onboarding/spec.md#L63),
ordinary demo isolation and the existing account revision/Child-access boundaries.
Root layout already follows store locale; no NAV-owned layout change is justified
by this diagnosis. Cold restart and profile arrival must both be regression-tested.

**Fixed P2 — footer height and enlarged text.** On d13 at720×1600/font1 the six destinations wrapped into
three rows, consuming384px before insets and hiding much of the Child action area
until scrolling. The b2 native footer now uses two rows at font1: its top moved
from y1120 to y1256 in the same viewport, reclaiming136px. This default-font
correction is **verified on b2**. At font1.5, b2 broke the Arabic Settings word
across lines. Source `4dd6490` changes enlarged-text/narrow layouts to two wider
columns;26 focused UI tests, typecheck and scoped lint passed. Its fresh
[build34896135774](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34896135774)
and corrected large-text native layout **PASSED**. The final4dd section records
normal/enlarged Arabic/English, repeated input and cancellation limits; full
accessibility and physical-device acceptance remain open.

## Executed b2 standalone task-to-growth journey

Root executed the actual `b2b43028ebd61ba943a808bf6c3be35ff8f78d5f` APK from
run34891473556, **88,451,812 bytes**, SHA-256
`ec870fa8bf8153c847751482ae4bba161f86fd141bedb4b70078606ea3510ff5`.
The APK and build receipt are retained under ignored `output/release-021-candidate/`.
It is the existing application package and internal signer, with its embedded
bundle. The later `4dd6490` source is not part of this artifact.

The upgrade preserved the paired Child in Android user11. Root enabled the
installed package for new Android user12 with `pm install-existing`, giving the
Parent a separate fresh app-data boundary. This is **two independent Android-user
sessions on one emulator**, not two devices or a clean APK installation.
User12 opened a blank Arabic sign-in form and Parent A authenticated through
native UI. Initial activity-not-found during user setup resolved after the user
became ready. An initial login attempt used an automation-truncated email and
succeeded after input correction; neither observation establishes an app auth bug.

All business actions below used the retained controlled synthetic QA family.
No owner household was used for business writes or captured. Independent Parent
SDK readbacks corroborated server state after native actions; the readbacks do
not replace the separately observed native UI outcomes.

| Native action / readback                                           | Executed result                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Child accepts the assigned GI01 task, then starts it               | **PASSED**: accepted revision2, then in_progress revision3; recognition1, memory1 and canopy1 unchanged.                                                                                         |
| Child skips adult step1, completes action step2, skips adult step3 | Reached revision6 with the recorded skipped/done/skipped states. This demonstrates the prerequisite gap described below, not safe real-world execution.                                          |
| Child taps Submit three times                                      | **PASSED for this repeated-input case**: submitted revision7, one transition and no new award; recognition1, memory1 and canopy1 remained.                                                       |
| Parent user12 praises through native UI                            | **PASSED**: praised revision8, with no new award or memory.                                                                                                                                      |
| Parent confirms through native UI                                  | **PASSED for state/award ordering**: recognized revision9, recognition2 and canopy2; memory stayed1.                                                                                             |
| Parent saves the memory through native UI                          | **PASSED**: memory2; task stayed recognized revision9, recognition2 and canopy2.                                                                                                                 |
| Parent force-stops/relaunches, then Child force-stops/relaunches   | **PASSED** for both session/readback paths. Native views showed16 Seeds, canopy2 and two memories; independent Parent readback retained recognized revision9, recognition2, memory2 and canopy2. |

The ignored `.expo/release-20260914/` receipts are:

- `native-core-accepted-started.json`, at20:46:29UTC, confirming revision3.
- `native-core-child-submitted.json`, at20:47:10UTC, confirming revision7 and step states.
- `native-core-parent-praised.json`, at20:53:33UTC, confirming revision8 without an award.
- `native-core-parent-recognized.json`, at20:54:00UTC, confirming revision9 and the new recognition/canopy.
- `native-core-memory-saved.json`, at20:54:50UTC, confirming the second memory.
- `native-core-both-restarted.json`, at21:00:30UTC, confirming retained server totals.

These timestamps are September14UTC / September15Dubai. The receipts contain
Parent SDK snapshots;16 Seeds is an observed native UI total, not a field in those
receipts. This controlled test establishes application transitions and persisted
totals, not a performed sustainability action or measured environmental impact.

**G1 remains open: adult prerequisites are not authoritatively acknowledged.**
The Child could skip both adult-owned steps and proceed to submission and Parent
recognition without a distinct Parent prerequisite acknowledgment. Displaying
safety text and passing the generic transition flow do not close this gap. A
Child must not certify Parent duties; the required acknowledgment and
retry/adaptation lifecycle remain release blockers in the
[catalog audit](release-task-catalog.md) and [release ledger](release-readiness.md).

Retained synthetic-only capture stems include `b2-child-settled`,
`b2-native-safety`, `b2-native-safety-actions`, `b2-parent-two-memories`,
`b2-child-canopy-restored`, `b2-child-memories-visible` and `b2-large-text-ar`.
`b2-parent-confirmation.mp4` was requested for30seconds and pulled successfully,
962,223bytes. A read-only ISO-BMFF `mvhd` parse reports29.2407seconds;
SHA-256 `72560c35dca27def593c810c933982c483c06d436656d3fe6ee86128649ef4bf`.
This verifies container metadata, not decoded-frame quality or app frame timing.

Root set animator/window/transition scales to0 during Parent font1.5 tab
interaction and Child restart/readback. These bounded actions completed; they
are not a full reduced-motion or TalkBack acceptance pass. Settings were restored:
animator scale unset (`null`, system default), window/transition scales1, and
font scale1 for the tested users. Transient UIAutomator failures and code137
around user switching remain automation limitations, not proven app crashes.
Process death during an active mutation, traversal/spoken feedback and interrupted
gesture/animation paths remain unverified.

Before the core task test, root repeated the same two-task/one-recognition Child
navigation workload used for d13. The [performance record](release-performance.md)
reports b2's mixed frame counters and larger surrounding PSS increase; no overall
improvement, memory acceptance or physical-device performance claim is made.

## Account-switch follow-up on b2

Root signed Parent A out of Android user12, verified the blank sign-in form,
then logged in as the independently provisioned QA Parent B. The actual screen
showed only create/join-family setup and two navigation destinations. No Family A
Child, task, memory or earned history appeared. `b2-account-b-empty.png` records
this empty state. B was an already-approved QA account without a family; this is
not fresh public signup or a native cross-family mutation test. B was then signed
out and the sign-in screen returned. Family A's controlled data remains intact.

## Final4dd standalone acceptance — bounded pass

[Run34896135774](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34896135774)
finished successfully at21:20:49UTC. The exact source is
`4dd649025da828a53ee9617573ebbc0b2849245c`. Complete source CI passed typecheck,
lint, format,5 repository checks,20 Node verifier checks and **3,397 application
tests /7 skipped;233 files passed /7 skipped**,52.52seconds. Separate backend
CI34896121034 passed migrations/function lint/pgTAP and one real Auth integration
test with none skipped; isolated messaging SQL passed with its stated provider/
HTTP/hosted/two-device exclusions. Repository CI34896121110 also passed.

The fresh Gradle APK is **88,451,956bytes**, SHA-256
`eacad1cc78a04e4d2a7d753a646ea07bb0540061e7e0fd47497ad757afd3a886`.
Root independently matched receipt/hash, existing template signer, signaturev2,
16KiB ZIP alignment and all50 ELF PT_LOAD alignments/congruences. The installed
`base.apk` independently has that same hash. Merged-manifest checks retain backup
disabled and no enabled debug/cleartext/overlay setting. The1,652-entry known-key
scan had the same two raw Hermes false-positive categories;22,322 decoded strings
contained no actual known privileged-key match. This is a bounded pattern review,
not a guarantee against all secrets or an Android security certification.

Actual native checks on API35 emulator5554,720×1600@320dpi:

| Check                                    | Executed result                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upgrade with existing Child pairing      | `adb install -r --user11` succeeded. Restricted Child session and both recognized tasks restored without data clearing.                                                                                                                                                                   |
| Default footer                           | Three columns/two rows; all six labeled, enabled controls remain at least48dp. Arabic selected state and104px-high bounds retained.                                                                                                                                                       |
| Font1.5 Arabic and English               | Two columns/three rows; direct screenshot review confirms whole labels, including Arabic Settings and English Messages. Multiline task titles remain readable.                                                                                                                            |
| Repeated input and Back                  | Each of normal, enlarged Arabic, enlarged English and zero-scale modes passed12 consecutive native Garden/Family/Tasks taps, last-intent selection, then Garden and immediate system Back to Tasks. ADB cadence includes command overhead; latency was not measured.                      |
| Press cancellation                       | Moving away from a task Review press cancelled activation and retained the task list. The short two-task list does not establish fast-scrolling acceptance.                                                                                                                               |
| Disabled animations and restart          | Animator, transition and window scales0: navigation/Back passed; force-stop/cold restart restored the restricted session/tasks. Full reduced-motion/TalkBack coverage remains open.                                                                                                       |
| Persistence after final upgrade/restart  | Child Garden showed16Seeds/two canopy contributions and both memories. An independent Parent SDK read at21:29:31UTC confirmed task revision9/recognized and two recognitions/memories/canopy; no new recognition was requested by these regression checks.                                |
| Final clean app-data launch              | After verifying user12 was signed out with an empty form, root cleared only this synthetic QA profile's app data. The exact installed final APK launched to blank Arabic sign-in. This is a clean app-data test on an existing emulator installation, not a Play install or fresh device. |
| Parent restoration from that clean state | Fresh native QA Parent A login restored the existing Child,16Seeds/two canopy contributions and both memories. Parent signed out afterward. No original Android profile or hosted records were cleared.                                                                                   |
| Signed-out startup                       | Three `COLD`/`ok` activity TotalTime samples1,406/1,261/1,419ms; sign-in resource IDs confirmed each. Median1,406ms is not usable-content or physical-device timing.                                                                                                                      |
| Scoped crash evidence                    | Retained crash buffers for QA app UIDs1110209/1210209 contained zero fatal-exception, fatal-signal or package-ANR markers. This does not cover every historical crash/ANR or physical device.                                                                                             |

[Reviewed screenshots and sanitized receipts](release-evidence/2026-09-15/README.md)
make the before/after and exact final candidate reviewable. Warmed frame/memory
samples remain mixed and do not pass the [performance gate](release-performance.md).
The native core GI01 lifecycle was executed on b2;4dd changes footer width only
and passed the relevant regression/readback checks above, not another full task
submission. Its restored locale still resets English to Arabic on process restart
(P2). White status icons against the light cloud background remain P2; the separate
root navigation/status-bar work is excluded from this artifact.

At21:34:36UTC both QA accounts were signed out. Font scales1,60-second screen
timeouts, disabled accessibility service state, original default animator setting
and1.0 window/transition scales were verified restored. User12 app was stopped;
user11 was returned to sign-in. ADB reverse was empty. The emulator was left
running. Regenerable extracted bytecode was deleted after inspection; APKs,
controlled QA backend records and required evidence were retained.

## Other coordinator evidence

Feature020's [inventory](supabase-data-migration.md) records its own local SQL,
restricted hosted SDK/Realtime and separate-origin browser results. Its c54f25f
Hermes rebundle into an existing native container is useful internal evidence,
but is not the fresh Gradle artifact above. These checks were not rerun by root
and are not substituted for current standalone Android acceptance.

## Not yet passed

Fresh device/store installation; complete24-task acceptance, authoritative adult prerequisite/retry/adaptation
lifecycle; two physical devices; minimum/current OS matrix; full TalkBack,
large-text/reduced-motion/notification/media-denial coverage; process death during
mutation; controlled comparative frame/memory acceptance; representative physical
device; recovery email delivery; store-distributed installation. The b2 core
journey and separate Android-user sessions above are executed within their stated
limits. Historical Feature018/motion results retain their original source
attribution and do not close remaining gates or establish public readiness.
