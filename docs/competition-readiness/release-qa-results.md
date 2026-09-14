# Release QA execution record

Date: 2026-09-14. Verdict and full requirement scope live in the
[release ledger](release-readiness.md). This is a sanitized execution record,
not acceptance of the untested public release.

## Candidate provenance

The release lane began from `baf88a0` with substantial existing uncommitted work.
Other sessions retained their source boundaries. Runtime Feature020 was integrated
through `c54f25f`; `d13c148` corrects a required AI test fixture. Root's subsequent
`f129b7f` changes only the transitive YAML parser lock entry, not application code.
The first native candidate building is explicitly `d13c148`. Current candidate
`63353ae` additionally includes the parser patch, deployed Help repair `e8c6b3b`
and safety display. Its fresh build34889994736 is queued. Neither includes the
separately owned uncommitted navigation work.

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
typecheck, lint, format, application tests). Fresh Gradle compilation is in progress
at this checkpoint. No APK/download/install result is inferred before completion.

The separate backend CI34888514402 and repository CI34888514386 passed for
`d13c148`; both also passed for parser-patched `f129b7f` in34889187004/34889187017.
Current `63353ae` backend CI34889995408 passed the clean migration/SQL/Auth and
separate messaging checks; its repository/native outcomes remain pending here.

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

## Other coordinator evidence

Feature020's [inventory](supabase-data-migration.md) records its own local SQL,
restricted hosted SDK/Realtime and separate-origin browser results. Its c54f25f
Hermes rebundle into an existing native container is useful internal evidence,
but is not the fresh Gradle artifact above. These checks were not rerun by root
and are not substituted for current standalone Android acceptance.

## Not yet passed

Current fresh-APK clean install/upgrade and complete Parent/Child journey;
two independent native clients; minimum/current OS matrix; TalkBack, current
large-text/reduced-motion/notification/media denial cases; process death during
mutation; release frame/memory profile; physical device; recovery email delivery;
store-distributed installation. Historical Feature018/motion results retain their
original source attribution and do not close these gates.
