# Release QA execution record

Updated: 2026-09-15 Dubai; the new d13 receipts are dated 2026-09-14 UTC.
Verdict and full requirement scope live in the
[release ledger](release-readiness.md). This is a sanitized execution record,
not acceptance of the untested public release.

## Candidate provenance

The release lane began from `baf88a0` with substantial existing uncommitted work.
Other sessions retained their source boundaries. Runtime Feature020 was integrated
through `c54f25f`; `d13c148` corrects a required AI test fixture. Root's subsequent
`f129b7f` changes only the transitive YAML parser lock entry, not application code.
The first fresh native candidate, `d13c148`, was built and installed successfully;
its bounded standalone checks are recorded below. Candidate `63353ae` additionally
includes the parser patch, deployed Help repair `e8c6b3b` and safety display; its
fresh build34889994736 is running at this checkpoint. Later `b2b4302` adds the
footer repair and is queued in build34891473556. No later APK is claimed here.
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
passed. Those 26 tests are not a new full application-suite or native pass.
The later native runs remain pending as described above.

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

### Open native defects

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

**P2 — d13 footer height.** At720×1600/font1 the six destinations wrapped into
three rows, consuming384px before insets and hiding much of the Child action area
until scrolling. The bounded equal-column source repair is `b2b4302`; its 26
focused UI tests, typecheck and scoped lint passed. Its queued fresh build and
actual corrected native layout are **not yet verified** here.

## Other coordinator evidence

Feature020's [inventory](supabase-data-migration.md) records its own local SQL,
restricted hosted SDK/Realtime and separate-origin browser results. Its c54f25f
Hermes rebundle into an existing native container is useful internal evidence,
but is not the fresh Gradle artifact above. These checks were not rerun by root
and are not substituted for current standalone Android acceptance.

## Not yet passed

Latest safety/footer candidate installation and native behavior; clean install;
complete native task completion/Parent confirmation; two independent native clients;
minimum/current OS matrix; TalkBack, current
large-text/reduced-motion/notification/media denial cases; process death during
mutation; controlled comparative frame/memory acceptance; physical device; recovery email delivery;
store-distributed installation. Historical Feature018/motion results retain their
original source attribution and do not close these gates.
