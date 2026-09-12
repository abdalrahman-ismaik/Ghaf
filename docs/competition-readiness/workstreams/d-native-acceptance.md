# D — independent native acceptance

**D-N01 collector/checklist complete; APK/device acceptance BLOCKED.** D-N01-r25
owns the collector, this report and local ignored `output/native-acceptance/**`. D-N04-r25 is
read-only contract review. No product source, shared tooling, board or another lead's report was
edited. This cohesive slice is ready for A to integrate; no native acceptance is implied.

## Identity and evidence limits

- D instance: `D-NB1-20260912T0122Z-root`; registered after A activated board25, ACK A042;
  board26/A044 subsequently requested the015 draft review. Actual human owner remains PENDING.
- Worktree `/home/smyk/projects/Ghaf-qa-rehearsal`, branch `redesign/native-qa-20260912`, initial
  clean HEAD `52c61fcab45f40b233d823a9178780fd07c56efd`; runtime `7fff0f3c2dc0e802ba1da6a67cd2513a75824809`.
  A's later instruction repair `e02d02b3a43c062bd637b57a475b43419a9f9939` has not been synchronized.
- Historical138 files/1,677 tests and the browser reset subset belong to7fff0f3. A attributes
  139 files/1,695 tests to e02d02b. Neither result identifies an APK or establishes native behavior.
- Actual APK path/hash/build/certificate: **unknown / NOT RUN**. Primary and secondary serial,
  model, OS, ABI, operator and install state: **unknown / NOT RUN**. No actual timed rehearsal;
  0/10 internal target. Qualification unknown. No native or listening evidence inherited.
- Requested GPT-6 Astra / Ultra / Fast. Allowlisted local configuration inspected in this run:
  `gpt-6-astra` / `xhigh` / `fast`. Effective served reasoning/tier are not exposed; Ultra is not
  verified for the lead. No settings changed. One helper launcher accepted Astra/ultra; Fast is
  not a helper-launch option and effective serving remains unexposed.
- Read canonical native shared/entry contracts, build guide, A product/service report and current
  coordination. Reused unchanged003/005/008/013 authorities and prior audits;014 remains deferred.
  A's015 draft is reviewed separately below. No live AI, recording, transport, memory or optional
  feature implementation is selected by this report.

## Collector invocation and boundaries

The [collector](../../../scripts/native/collect-device-evidence.sh) requires **all five explicit
identity arguments**. Obtain A's published artifact/build receipt and the actual owner's selected
serial first. The placeholders below are instructions, not an invocation or observed device.

```bash
scripts/native/collect-device-evidence.sh --help
PATH="/home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/jdk-17.0.20.1+1/bin:/home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk/build-tools/36.0.0:/home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk/platform-tools:$PATH" \
  scripts/native/collect-device-evidence.sh \
  --apk /absolute/path/to/A-published.apk \
  --serial OWNER_OBSERVED_SERIAL \
  --sha256 A_PUBLISHED_64_HEX_DIGEST \
  --source-candidate A_PUBLISHED_40_HEX_COMMIT \
  --build-id A_PUBLISHED_BUILD_ID \
  --preflight
```

`--preflight` executes no adb command or socket request. It checks trusted tool availability,
APK container/hash/required entries, package/version, signature certificate, ABI, merged backup
and blocked shared-storage permissions. Remove only `--preflight` for narrow inspection of an
already installed package on the explicitly selected owner-authorized phone. It does not install.
Use verified SDK `aapt` and `apksigner` from B's provisioned tool directories on PATH; no download,
dependency change or environment repair is performed. Put B’s approved private JDK `bin` on PATH as shown: the inspected Build Tools36.0.0
`apksigner` launcher executes `java` directly, so JAVA_HOME alone is insufficient. The collector
reports missing Java before artifact/device work and records its executable/version.
Python3.10+ is required; observed host
Python3.12.3. `--help` uses Bash builtins and needs neither Python nor Android tools.

The default device path contacts only an **existing loopback ADB service on5037**. It sends
allowlisted smart-socket queries for the supplied serial and shell-v2 queries for the exact package,
model, OS release/API and ABI list. It never invokes the ADB client's device-command path, which
can restart an incompatible server during negotiation. Host `adb version` is the sole adb
executable command. Requests fail closed on malformed/ambiguous/empty/nonzero responses, missing
exit frames, trailing data, timeout or unavailable server. No reconnect/start/kill operation exists.

Raw `dumpsys`, stderr, broad property lists, device lists, logcat, screenshots, audio and other
packages are not saved. Parsed allowlisted values and narrow commands enter a fresh private receipt.
No install/uninstall, clear/reset, launch/force-stop, settings change or permission acceptance is
performed. Tool/runtime incompatibility and unauthorized/offline transport require owner action.

The protocol is based on [AOSP services](https://android.googlesource.com/platform/packages/modules/adb/+/HEAD/docs/dev/services.md)
and [shell framing](https://android.googlesource.com/platform/packages/modules/adb/+/refs/heads/main/daemon/shell_service.cpp).
APK verification uses the documented [apksigner verify command](https://developer.android.com/tools/apksigner).
These sources support command/protocol choices; they are not evidence from a Ghaf phone.

## Output and failure schema

Each run creates a mode0700 directory at this checkout's
`output/native-acceptance/<UTC>-<random>/`; `evidence.json` is mode0600. Existing destinations are
not reused and output symlinks are rejected. Keep serials and raw local receipts in this ignored
boundary; redact them before sharing any extract. Invalid invocation may exit before a receipt
exists. An unwritable evidence boundary is BLOCKED and cannot support a pass.

| Field                                                             | Meaning and limitation                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `schema`                                                          | `ghaf.native-metadata.v1`                                                                                                       |
| `source_candidate`, `build_id`                                    | Explicit A/operator attribution, not cryptographic proof of source-to-APK provenance                                            |
| `collector_path`, `collector_sha256`, `collector_pid`, UTC fields | Actual script identity and execution boundaries                                                                                 |
| `apk_path`, `expected_sha256`, `apk.sha256`                       | Absolute supplied artifact and independent SHA-256 comparison                                                                   |
| `tools`                                                           | Resolved executable paths, observed versions; preflight does not execute adb version                                            |
| `commands`                                                        | Actual argv or wire request, PID, UTC, phase, exit code or protocol status, output sizes, allowlisted error categories          |
| `apk`                                                             | Package/version, signer certificate SHA-256, ABI, bundle size/asset count, permissions, explicit backup/debuggable observations |
| `device`, `installed`                                             | Exact serial's bounded identity and target-package paths/version only                                                           |
| `checks`, `collection_status`, `exit_code`                        | Parsed metadata checks, failures and preserved command exits; no pipeline status masking                                        |
| `acceptance`                                                      | Native journey, installed APK byte/certificate identity, offline cold launch, public signing and human review remain NOT RUN    |

Exit0 means only that the requested metadata was collected. Exit2 means malformed/missing explicit
arguments; exit3 means BLOCKED prerequisite/transport/value or command failure; exit4 means FAILED
identity/configuration comparison; exit130 means interruption. Command-level nonzero codes are
retained even when the collector returns3. Shell-v2 distinguishes a real remote exit from an OKAY
transport handshake. Missing installed package blocks that phase; it is not an application rejection.

Package/version equality cannot establish installed bytes or signing identity. A signature that
verifies is not approval for public distribution. A bundled JS entry/asset count cannot establish
Metro-independent launch or complete fonts/media. D-N02 still needs independent inspection of the
actual APK and owner-authorized installation evidence. Unknown `debuggable` attributes remain
unknown; manifest/permission review is broader than the two prohibited shared-storage permissions.

## D-N01 checks and independent review

Only shell/report scope is changed; no product full suite, install, export, browser or native job
was duplicated. B owns the heavy slot; the unrelated terminal Metro341101 is preserved. Short
host runners exited; no D resident process or device mutation was launched.

Local evidence root for the following is
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/script-checks/`.

| Check                                     | Status            | Evidence and limits                                                                                                                                                                          |
| ----------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bash syntax and ordinary help             | PASSED            | `bash -n scripts/native/collect-device-evidence.sh`; direct help, exit0                                                                                                                      |
| Initial synthetic harness                 | FAILED, retained  | `results-initial.json`:25/26 expected outcomes; restricted-PATH help exited127 because it used external cat                                                                                  |
| Corrected host/transport harness          | PASSED            | `pass2/results.json`:26/26; help repaired, socket/tool stubs and non-APK ZIP only                                                                                                            |
| Expanded protocol harness                 | PASSED            | `pass3/results.json`:36/36; malformed lengths/status, trailing host data, transport FAIL, missing/wrong/duplicate exit, unknown/oversized frames and remote exit126                          |
| Command failure preservation/privacy      | PASSED synthetic  | Nonzero aapt exit17 and remote shell exit126 preserved; raw personal sentinel omitted; metadata receipt/file modes checked                                                                   |
| Extra prerequisite/output-boundary checks | PASSED            | `extra/results.json`:9/9; help without tools; missing Python/adb/aapt/apksigner; symlink output preserved; non-ZIP; actual30second fake-tool timeout exit3; SIGINT exit130 and child cleanup |
| Actual APK tooling and physical transport | BLOCKED / NOT RUN | No A-published APK or identified authorized phone; fake ZIP/tool/socket fixtures confer no native pass                                                                                       |

The socket harness replaces `socket.create_connection` with a fake object and splits reads into
three-byte chunks; it creates no real socket. SDK executables are synthetic stubs. The positive
fixture is deliberately named `SYNTHETIC-NOT-AN-APK.apk` and is not installable Android content.
All harness receipts say `SYNTHETIC-HARNESS`; source labels identify the audit base only.

Independent helper `/root/native_collector_review` had read-only scope, no writes, device commands,
test suites or descendants. It found the implicit ADB server-restart risk in the initial design;
D replaced device-side CLI calls with a bounded protocol allowlist. It also identified Ctrl-C's
exit mismatch and trailing-host-response hardening; both were accepted. Final source review found
no remaining blocking defect, subject to lead harness results. Allocation released after review.

## D-N04 draft challenge before implementation

Reviewed A044's draft at runtime baselinee02d02b, with unchanged access/reset seams inspected in
the QA52c61fc checkout. Exact snapshots and UTC are in `output/native-acceptance/contract-review/`.
Draft spec SHA256 `f0618e49601e6466b44b5b64e3892a3cc36756b6dc88d3f9a34b8b7972fca4ad`;
typed contract SHA256 `8b27fdc632e425a337b6324dd71e529e5ca9d16047abca001107e0d0bbc70098`.
This is a draft review, not accepted015 implementation or native evidence.

Fixed build-selected mode, explicit memory repositories, controller authority, direct private
rollback, denied active/sibling selection and a complete silent three-moment flow are coherent.
No old six-clip mapping or new permissions are approved. Three clarifications were sent to A in
D outbox002; only A may resolve the contract and grant implementation.

| ID / priority          | Reproduction or ambiguity                                                                                                                                      | Required clarification / owner / retest                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-015-01 / P2 contract | Draft says recheck entry preconditions after chosen resume; both controllers can no longer both be signed_out                                                  | Name postconditions: chosen scoped authority active, other signed_out, unchanged generation/context; A, RESOLVED in A047 contract; runtime NOT RUN                                      |
| D-015-02 / P2 contract | Capture selector callback at generationG; enter Parent; sign out; old callback still hasG and passes signed-out guards                                         | State stale-handoff policy and test it; separate entry epoch if stale callbacks must be rejected, without reseeding progress; A, RESOLVED in A047 contract; runtime NOT RUN             |
| D-015-03 / P2 contract | Existing reset clears repositories and several authorities sequentially before later fallible calls; unchanged generation alone does not preserve a failed run | Specify failed-reset oracle and observable retry; inject a mid-reset failure and inspect actual authority/maps; A, RESOLVED in A047 contract; runtime NOT RUN. No recovery014 expansion |

Ordinary configuration still requires its existing access flow; demo storage must make no ordinary
repository reads/writes. Test existing ordinary family/affinity/template/ambience bytes before and
after the whole demo. Initialization may leave a canonical memory record after access failure but
must leave no session, permission or progression. Failure checks inspect command authority and
maps rather than only displayed flags. Synchronous entry narrows interruption tests; it does not
turn browser reload into process-death or durable-recovery evidence.

## Exact candidate acceptance matrix and device handoff

Every row below requires the eventual A-published source/build/hash. Both locales are independent
rows at execution; retain separate primary/secondary outcomes. Current runtime state is **NOT RUN**
unless explicitly attributed to historical source/browser evidence above.

| Row / owning task                                    | Required evidence and observable oracle                                                                                                                                                                                                            | Current status                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| N02-APK / B artifact, D independent review           | Received SHA256 equals A receipt; inspect package/version/ABIs/certificate/signature, merged permissions/backup and embedded JS/fonts/assets versus approved config. Attribute B build separately                                                  | BLOCKED: artifact absent            |
| N02-INSTALL-P/S / D + actual owner                   | Record model/OS/ABI/serial locally, exact APK and owner authorization. Distinguish fresh install/update. Verify target package/version/signature/ABI before update; stop mismatch/downgrade, never uninstall/clear to bypass                       | BLOCKED: phones/approval absent     |
| N03-CORE-AR/EN / D primary                           | Arabic-first entry; Parent chooses/approves; Salem accepts, asks help, completes; Parent confirms; action praise precedes symbolic growth. +12 once, no loss on retry; Seeds48→60, Mangrove48/60→60/60                                             | NOT RUN native                      |
| N03-AUTH / D primary + source tests                  | Child completion alone awards nothing; duplicate confirmation/reload cannot add growth. Distinct Seed/Garden/League/canopy/Family Reward/private projections; Alya unchanged; gated lifetime108→120 is separate; eight independent R002b flags off | NOT RUN new candidate               |
| N03-PREPARED / D primary                             | AR/EN prepared Guide/Coach retains actual curated basis, Parent choice, AI/fallible/prepared labels; no recording or permission auto-approval, live provider or generalized Connection Coach                                                       | NOT RUN native                      |
| N03-OFFLINE / D + A/owner                            | Exact standalone APK cold launch with Metro unavailable and owner-selected offline state; inspect bundled assets/prepared help. Measure actual startup, never use browser export as APK                                                            | BLOCKED                             |
| N03-NATIVE-P / D primary                             | Actual RTL/LTR, touch, TalkBack names/order, Back, IME/keyboard, font scaling, mixed script/long labels, safe areas, reduced motion, foreground/background, audio interruption and permission denial                                               | BLOCKED; no phone                   |
| N03-NATIVE-S / D secondary                           | Independent same-APK installation/layout/touch/responsiveness/restart/reset and applicable accessibility rows; no sync/session-sharing claim                                                                                                       | BLOCKED; no phone                   |
| N03-RESTART-ORDINARY / D                             | Valid remembered-access markers may survive; task/progress remains process-local and resets. Record exact loss honestly; not recovery014                                                                                                           | NOT RUN native                      |
| N03-RESET / D                                        | Reset before assignment, after acceptance/help/completion/confirmation/growth; repeat reset and stale callbacks; exact Arabic defaults. Additional approved recovery rows require selected scope                                                   | NOT RUN native                      |
| N04-ENTRY-AR/EN / A/B source, D UI/native            | Parent/Salem/Alya one-tap signed-out entry without setup/auth; one controller session, correct routes/actions; wrong-role/sibling/direct URLs denied; rapid double taps, failures and retry                                                        | BLOCKED pending015 candidate        |
| N04-HANDOFF / A/B source, D UI/native                | Explicit sign-out preserves current run; Back cannot restore authority; Alya receives no Salem task. Successful reset invalidates old callbacks; restart opens signed-out picker without privileged principal                                      | BLOCKED pending015 candidate        |
| N04-ISOLATION / A source, D independent              | Separate ordinary synthetic family and all ordinary repository bytes unchanged by entry/story/handoffs/restart/reset; no privileged/media/assistant persistence shortcut                                                                           | BLOCKED pending015 candidate        |
| N04-STORY / C source, D browser/native               | Three optional moments, entry immediately reachable, manual forward/back/skip/replay, equivalent AR/EN text. All audio/images absent still operable; no automatic speech; large text/TalkBack/reduced motion/safe areas                            | BLOCKED pending015 candidate        |
| N04-VOICE / A/C artifacts, actual Arabic reviewer, D | Exact final clips/transcripts/provenance; opt-in play/stop/replay and navigation/locale/background/screen-reader cancellation. Actual named listening for grammar/pronunciation/clarity/pace/transcript/Ghaf                                       | BLOCKED: no reviewed clips/reviewer |
| N04-INSTRUCTIONS / A e02d02b, D retest               | Parent-approved wording on chosen/active task in both locales; preserve fixed safety/award behavior. Source/rendered tests attributed to A; new browser/native inspection required                                                                 | NOT RUN D                           |
| N03-REHEARSALS / actual operator + D                 | Ten actual2–3minute human-operated primary runs, including offline fallback, reset/recovery and cold start; exact build, operator, duration/help/outcome per run                                                                                   | NOT RUN:0/10                        |

Before any installation, obtain an observed device identity and explicit owner authorization for
that serial and APK. Record the exact command/exit and installed identity. Do not accept USB or
permissions on the owner's behalf. A must coordinate the native/preview slot and Metro availability;
D never stops another lead's process. No public-distribution signing or release flag is authorized.

Native row receipt template: `row ID; UTC; source/build/APK SHA256; primary/secondary; observed
model/OS/API/ABI; local serial receipt; operator/owner authorization reference; locale; precondition;
pointer/touch/keyboard/system actions; observed routes/counters; expected; PASSED/FAILED/BLOCKED/
NOT RUN; narrow artifact; defect ID`. Record startup-to-settled and tap-to-home separately on
named hardware. Browser320/390-width, CSS200% stress and test mocks do not identify phones.

Rehearsal receipt template: `run number; actual operator; UTC; APK/build/hash; phone; locale;
ordinary/demo mode; cold/offline/reset scenario; start/end/duration; assistance; outcome; defect`.
Do not fill ten placeholder passes. This is an internal target, not an official ten-run rule or
live time limit; the official video requirement is independently2–3minutes. No qualification claim.

## Defects, student review and readiness

Historical D-R02 is closed only for its recorded browser reset subset at7fff0f3. D-R03 remains
P3 Arabic CSS200% secondary-label clipping; no ordinary-size or native failure is inferred.
C owns its bounded diagnosis. Track a released correction by new exact source, and keep CSS-stress
and native verdicts separate. Any browser preview must prove the loaded source root after the
prior shared-Metro cache contamination; do not copy earlier passes to a new candidate.

New runtime defect template: `ID/severity; exact commit/build/platform; reproduction; expected;
observed; artifact path; suspected A/B/C owner; retest status`. The three015 items above are
contract findings, not reproduced app regressions. Collector issues were fixed in D's owned tooling.
No absent memory leaf, deferred recovery, unbuilt reciprocal-support idea or production backend
is classified as a regression against unselected scope.

Student explanation questions are prepared; actual answers/review are **PENDING**:

1. Show where Parent approval, Child completion, confirmation and recognition differ. Why is
   permitted help still +12, and why can retry/duplicate confirmation not remove/add awards?
2. Explain the separate Seed, Garden, League/canopy and private Family Reward authorities. Why
   are default48→60 and the gated lifetime108→120 fixture different?
3. Trace the selected profile through controller capability and route guards. Why may Alya not
   execute Salem's task, and why does demo selection not prove production authentication?
4. Explain isolated in-memory demo repositories, same-run handoff, signed-out restart and the
   remaining ordinary progress-loss limitation. Why is none of this recovery014 or phone sync?
5. Identify the curated/prepared basis of Guide/Coach, actual AI contributions and limitations.
   Why do metadata, scripts and automated tests not establish voice quality or human participation?

Arabic/cultural/accessibility/safeguarding reviewer names and scopes remain pending. Reuse the
[previous device/Q&A handoff](d-baseline.md) and [candidate report](d-candidate.md) with their
original evidence attribution. Source/browser readiness is bounded historical evidence; **full
integration/native/demo acceptance remains BLOCKED** until the exact APK and required observations.

## AI contribution record

The controlling user prompts are Session D's native/APK request and canonical
`native-batch/session-d-device-qa.md` / `shared-contract.md`. AI work is bounded to independent QA,
this collector/report, synthetic failure harness and contract review. No AI generated product app
or claimed student understanding. The lead used the Ghaf quality workflow; the helper used a bounded
code-review workflow. No human approval was inferred from code or generated scripts.

Actual initial helper prompt:

> You are D's only active helper under canonical BOARD r25, D-N01-r25. Requested GPT-6 Astra / Ultra; report launcher accepted vs effective settings; Fast not exposed. Worktree /home/smyk/projects/Ghaf-qa-rehearsal, branch redesign/native-qa-20260912, exact candidate52c61fcab45f40b233d823a9178780fd07c56efd (runtime7fff0f3). You are not alone: preserve others' edits. READ ONLY: no writes, commands that contact devices, installs, suites, browser, product changes, coordination edits, commits or descendants. Read canonical /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/shared-contract.md and session-d-device-qa.md, plus relevant collector once it appears. Concrete question: independently review the proposed safe evidence collector against explicit APK+serial, package/hash/signature/tool/transport validation, empty/nonzero/ambiguous failures, privacy allowlist and output containment. Lead will create scripts/native/collect-device-evidence.sh and report; send first a short risk/checklist recommendation now, then await followup with actual script for bounded code review. Only report findings to D here, with evidence/line refs when implemented. Initial design: Bash executable embeds Python standard-library argparse/subprocess(argv,no shell)/hashlib/zipfile/json. Explicit --apk --serial --sha256 --source-candidate, expected package fixed approved ae.ac.ku.ghaf.prototype. --help no tools; --preflight host APK/tools only. Default no installation or state changes; exact adb -s serial get-state/get-serialno then allowlisted model/OS/ABI and exact target pm path/dumpsys parsed fields. Host aapt and apksigner verify real artifact. Fresh private output only under D output/native-acceptance. No broad device properties/logcat/media/captures. Commands/UTC/exit codes recorded, installed version match cannot establish installed APK hash; report limits. Advise minimal robust approach; do not invent physical execution or human acceptance. No need to repeat broad existing product audit.

Actual implementation review followup:

> Collector is now written at /home/smyk/projects/Ghaf-qa-rehearsal/scripts/native/collect-device-evidence.sh (uncommitted on52c61fc; only owned path). Please perform bounded independent code review now, read-only no device calls/tests/writes/descendants. Look especially for actual adb/aapt/apksigner invocation/parser errors, failure ordering, fail-closed identity checks, privacy and output containment. Distinguish blocking script defects from physical acceptance limits. Lead will run synthetic host harness and write report in parallel. Send reproducible issues with line refs; do not repair source. Exact prompt/contribution will be retained. One helper allocation remains held only for this review.

Actual protocol-review message:

> Accepted server restart defect; will remove all device-side adb executable invocations. Proposed minimum replacement: Python standard-library smart socket to existing loopback5037 only; length-prefixed host:version and host-serial:<validatedserial>:get-state/get-serialno, explicit host:transport:<serial> then shell,v2,raw:<fixed allowlisted command>, parse shell-v2 frames id1 stdout/id2 stderr/id3 exit, preserve exit codes and timeout. Never host:kill/start/reconnect, no adb subprocess except `adb version` host-only. Please check exact AOSP protocol details/exit-frame format as a concrete continuation, source read only. No implementation writes. Initial synthetic harness also found cat dependency in help with restrictedPATH; fixing using Bash builtin print. Lead handles raw socket implementation and report.

Actual final review followup:

> Revised script now ready, 392lines at same path. Please final read-only code review of device_query smart-socket section plus interrupt/help repairs. Lead synthetic harness passed26 cases using fully fake Python socket (no network), fake SDK tools and non-APK ZIP, split reads to3bytes; final protocol failure cases are next. Need bounded review verdict and any concrete blockers; no new broad audit/writes/device commands/descendants. Lead independently reviews A's newly published015 typed contract while you review collector.

Accepted contributions: explicit-target/failure/privacy checklist; actual implicit-server-restart
defect; AOSP one-byte shell exit framing; timeout/EOF/output bounds; interruption/help and trailing
host-response repairs. Rejected initial design: direct device-side ADB CLI calls, despite an existing
port check, because client negotiation can replace someone else's server. Rejected evidentiary
shortcuts: package/version equality as installed-hash proof, fake fixture success as APK/device
acceptance, legacy shell without exit evidence, stale browser/native pass inheritance and automatic
audio without reviewed matching clips. These are design decisions, not invented human suggestions.

## D-N01 final local verification receipt

Completed 2026-09-12T01:32:34.617142+00:00. Final collector SHA256 `d31798d109d47ae8c286ec36759a4092886503e243d550d90e5e86ba67f27376`.
The final synthetic matrix has45/45 expected outcomes across `pass3/results.json` and
`extra/results.json`, both bound to this exact script hash. Initial failures remain preserved.
Embedded Python compile, Bash syntax, scoped report formatting and Git whitespace checks pass.
The actual fake-tool timeout ran30seconds; collector390393/fake child ended, and interruption
collector391083 exited130 with its child gone. Extra harness session28743 ended exit0. No D
helper, device connection, native/browser/Metro job or heavy allocation remains.

D additionally inspected the exact e02d02b Child instruction diff and its rendered test source: two
localized `content.positiveAction` displays are added for chosen and active version-one tasks,
with existing safety blocks unchanged; tests exercise AR/EN, retry, adjusted-version and sibling
guards. This is **PASSED source review only**. D did not rerun A's suite or render this candidate;
browser/native appearance and actual student review remain NOT RUN/PENDING.

Release the collector and this report for A's local integration after the cohesive commit.
D-N04 contract clarifications continue through the existing review grant; APK/phone gates remain
external. No product source, signing identity, release flag, dependency or coordination record is
in this commit.

## D-N04 corrected draft re-review

At 2026-09-12T01:34:38.543959+00:00, ACK A047/A048, board27. Re-read corrected spec/typed contract,
plan/tasks, research/data model and quickstart; exact snapshots/hashes in
`output/native-acceptance/contract-review/corrected/receipt.json`. Corrected typed contract SHA256
`a6c96eeaefd94921586e205961a910867cd0f1716001866944317eb4538b54dd`. No runtime was implemented or tested by this review.

- D-015-01 **RESOLVED at contract level**: selected controller must be authenticated with scoped
  authority, other controller signed out, aggregate context/generation/epoch unchanged until commit.
- D-015-02 **RESOLVED at contract level**: a distinct monotonic entry epoch is captured in requests,
  advanced at successful entry/sign-out and authorized reset start. It invalidates stale selectors
  without reseeding same-run task/progress.
- D-015-03 **RESOLVED at contract level**: reset failure closes aggregate access and latches a
  complete bilingual restart-required screen. No profile/story/role actions, false reset success
  or partially cleared-run retry is offered. A fresh process, not foregrounding, makes a new run.
  Ordinary reset is unchanged; no atomic/durable recovery014 claim is made. First/middle/last
  injected reset failures and actual route/command denial must still be tested.

No blocking contract issue remains in this bounded failure/privacy review. Before source grants,
A should reconcile the plan's sequence3/4 to include expectedEpoch, the data model's handoff summary
to include entryEpoch, and the Parent settings path to actual `app/parent/settings/index.tsx`
(the plan currently says settings.tsx). These are cross-document corrections, not new product scope.

Runtime acceptance rows N04-ENTRY/HANDOFF/ISOLATION/STORY remain BLOCKED pending an exact integrated
candidate. The failed-reset row now requires actual latched-state command/route denial and a true
fresh-process restart; source/module-isolation tests cannot establish physical Android restart.
Missing clips still require a complete silent flow and do not mark narration fixed. Human acceptance
is PENDING while authorized implementation and verification can continue.

## A052 private-JDK prerequisite correction

At 2026-09-12T01:40:27.023077+00:00, A's read-only script reviewer identified the
missing private-JDK PATH instruction. D independently inspected the installed Build Tools36.0.0
launcher at B's `output/native-toolchain/sdk/build-tools/36.0.0/apksigner:97`: it executes `java`
directly. The invocation above now includes B's approved JDK bin; the collector fails actionably
on absent Java and records the chosen executable/version. No tool was installed or reconfigured.

Updated collector SHA256 `13c942d50b84e0076f593ef367965164dbb8d959bb726d48f34beacfc5f97b79`. **46/46 synthetic checks PASSED** in
`output/native-acceptance/script-checks/pass4/results.json` and `extra2/results.json`; both bind
to this new script hash. The added missing-Java case exits3 before APK/device inspection. Earlier
45-case receipts remain attributed to the earlier script. Real30second fake-tool timeout and
SIGINT child-cleanup checks also passed; sessions8482/75821 completed exit0, timeout404487 and
interrupt405246/fake children ended. No actual APK/device or native performance evidence.

A052 prompt/contribution was the exact request in canonical STATUS-A outbox052: private JDK bin
must be on PATH for apksigner; correct the owned report and optionally add a bounded missing-Java
diagnostic. D accepted both. No other product change was requested or made.

## D-N04 foundation and startup-seam source review

Completed 2026-09-12T01:41:08.314690+00:00 under A051/A053/A054; no D source
synchronization or product edits. Technical contract293d351 and startup amendment7a87f69 are the
authority. A reconciled the three cross-document notes from D004 before contract commit.

- **31f1833cb94b3c2289f4d5bb0e2c8437f9d1f88d — PASSED source review.** Lead inspected exact
  shared types/config/test source. Request and handoff include generation/epoch; exact build
  string `true` alone selects demo, and the exported constant cannot switch modes mid-run. A's
  seven mode tests are attributed to A; no D suite rerun or bundled APK flag proof.
- **973193542e256a3745ef8b42a53a7ab4211f3c11 — PASSED bounded storage source review.** Independent
  helper found all four repositories use one newly created demo memory instance, including legacy
  migration/clear paths. The factory exports directly from memoryStorage, avoiding platform-specific
  factory resolution; the existing ordinary adapters and Node singleton behavior are retained.
  No actionable storage-isolation defect was found.
- **Limits:** the registry still imports the native platform storage module through the barrel.
  ExpoSQLite must therefore be present even though its database opens lazily. This is an existing
  native dependency requirement, not proof of ordinary-data access or a regression. Vitest's Node
  sentinel/spying tests do not establish Metro platform resolution or physical storage bytes. Only
  ambience has an explicit save exercise in the new test, and read return values are not asserted;
  the test demonstrates noninterference rather than all repository functions. Actual startup,
  same-run handoff, failed reset and process restart remain untested by this source slice.
- **7a87f69 — PASSED bounded contract review.** Demo-only artificial holds may be removed while
  actual font/image readiness and failure fallbacks remain. Global ambience must be suppressed
  on signed-out/reset-failed demo entry, even after Parent previously enabled it. These address
  selected immediate/silent entry; no new provider/assets or ordinary timing change. Native
  silence, focus cancellation and measured latency remain NOT RUN.

Helper `/root/native_storage_review` was D's sole active helper for this slice, an explorer launched
with Astra/ultra; effective serving and Fast are unexposed. It changed no files, ran no tests/browser/
device commands, spawned no descendants and released its scope. Lead reviewed its concrete findings
and preserved limits; no additional product change or human approval was inferred. Actual prompt:

> You are Session D's sole currently active helper, board28 NB1, under A051 D read-only foundation inspection and D-N04 review. Exact source candidate9731935 in /home/smyk/projects/Ghaf (canonical A worktree); D worktree /home/smyk/projects/Ghaf-qa-rehearsal remains f5149be and must not be synchronized by you. Requested Astra/Ultra; record launcher accepted vs effective settings; Fast not exposed. Concrete bounded question: does commit9731935's demo storage extraction/registry selection preserve ordinary storage behavior and isolate ALL four demo repositories with no accidental native/web storage resolution leak? Read exact git show9731935 and committed015 contract293d351, plus only directly relevant imports/test source. Report line/symbol evidence, realistic failure/privacy concerns and limits; do not repeat prior broad audit. This is source review, not module execution/native/process recovery proof. You are not alone; preserve everyone's edits. READ ONLY: no file writes, coordination edits, tests/suites, installs, browser, device commands, commits or descendants. Lead handles own collector Java prerequisite repair in parallel. Report findings only to D here; release when bounded review is done.

No helper suggestion was rejected in this review; the source/native distinction is retained.
The preceding collector correction is commitc30700a; earlier D slices15a8316/f5149be remain
independently attributable. Foundation review adds no acceptance for the unbuilt integrated demo.

## D-N04 transaction source challenge — D-NATIVE-001

Reviewed 2026-09-12T01:47:24.459086+00:00: exact foundation
`263bc889cdbcf979e03e52bc45183f6071e6bdcf`, contract293d351. **P2 contract defect inferred from
source; focused execution NOT RUN, no released UI/native trigger established.** A owns correction;
D outbox007 requests a specific independent test-file/candidate/short-run grant before any new test
write. A's attributed46 new/104 focused passing tests do not cover this composition case.

Reproduction skeleton (fault injection, not a completed UI journey): compose Access → Parent →
Child wrappers; restore valid receipt/markers and resume a chosen principal inside Child; reenter
the outer Access wrapper and deliberately swallow its INVALID_TRANSITION; return success from
the inner operation. Repeat with reentry of the middle Parent wrapper while Child has resumed.

Expected: the composite failure restores every participating controller and service to usable
signed-out state; captured attempt authority is denied and a valid subsequent entry succeeds.
Source-inferred result: each wrapper has its own abort flag. Inner Child/Parent can commit before
outer Access notices its abort and restores only access maps. Controller views can stay authenticated
with a session absent from the service map; next resume rejects an existing controller session, and
termination can reject the missing service session. This is a retry/cleanup failure rather than proof
of usable leaked capability. Evidence: access/index.ts328–359, Parent controller221–242 and
ChildAccess141–156 at the exact commit; minimal reproduction and expected state are this artifact.

Lead independently inspected the test source: each swallowed-reentry test composes Access plus
one selected host (or Access alone). It does not call an outer wrapper from inside all three while
asserting inner controller state and retry. Other existing oracles use real controllers, actual
capability/projection rejection, maps by identity/value, sanitized exceptions, malformed envelopes,
second-marker failure and prepared voice/grant preservation. Those are useful source-level test
oracles, not new D execution or Android evidence.

Helper implementation review otherwise found the specified snapshots/clones and clear/set map
restoration coherent. Rollback does not call termination/reset/provider functions. The wrappers
are not a sandbox for trusted callbacks that mutate forbidden APIs, corrupted private internals
or monkeypatched Maps; no such production protection is claimed.

Separate conditional limitation: with trusted provider/test interception, a failed raw AccessSession
can become valid after a same-time retry recreates its ID/time/principal/device fields. The contract
explicitly rolls back those counters; accepted adapter/UI ports expose no raw session. No user-facing
privacy bypass was demonstrated. D rejected classifying that private instrumentation case as a
proven UI defect; it remains an explicit limit to synthetic authentication claims.

Helper native_storage_review was reused as the sole read-only helper, inspected the four implementation
files, ran no tests, made no writes/descendants and released. Lead owned the disjoint test-source review.
Actual followup prompt:

> New bounded D-N04 foundation source review under A051: exact canonical commit263bc889cdbcf979e03e52bc45183f6071e6bdcf adds access/Parent/Child withDemoEntryTransaction and optional interface capability. Review ONLY implementation in those four source files at that exact commit against accepted015 contract293d351 (+ harmless startup/copy amendments). Lead independently inspects tests/demo-entry-transaction.test.ts coverage; do not repeat test-file review unless needed for a concrete defect. Question: do nested error/throw/malformed/thenable/reentry rollback paths restore actual maps/controller authority while preserving unrelated grants/voice and fail closed? Check clones, reset/session/verification generations and exceptions in rollback. Lead noticed tests require retry session id equal the failed id after rollback; assess whether a captured failed AccessSession could become valid again on retry through projectSession/authorizeCapability, and distinguish a reachable accepted-scope defect from private trusted-callback limitations. READ ONLY, no files/tests/device/browser/installs/commits/descendants or D sync. You are not alone; preserve others. Same one-helper allocation Astra/Ultra requested; effective/Fast unexposed. Report concrete source evidence and release. Lead handles test evidence/status in parallel.

Actual lead coverage reply:

> Confirmed test-source gap: envelopeHarness composes access+one selected host (or access alone), and each same-instance reentry test checks only that host. No case invokes outer Access or middle Parent reentry from inside all three wrappers while an inner Child controller has resumed. This appears to violate committed composite rollback/usable signed-out retry contract even though no UI trigger is demonstrated. Please finish exact minimal pseudocode/reachable injected dependency scenario, controller status versus actual capability distinctions, and line refs; no execution. Captured-session resurrection is conditional trusted-boundary limitation as you found, not UI/privacy regression. I will publish main finding to A and request an exact independent test path + short-run grant before writing any new test.

Current disposition: **OPEN — A correction/focused regression required before accepting this
transaction boundary.** No product source was fixed by its reviewer. APK still absent: B's
manifest-only job ended with resource-stop exit75 at01:43:50UTC (B attribution); this is an
environment/resource failure, not a completed APK or an application rejection.

## D-N05 independent RED regression — D-NATIVE-001 reproduced

Completed 2026-09-12T01:56:07.007925+00:00 under A059/board29. **FAILED at the real-controller Node
fault-injection boundary; P2 D-NATIVE-001 remains OPEN.** This supersedes the previous
“focused execution NOT RUN” disposition for this defect only. No UI trigger, APK, device or
production authentication exploit is demonstrated.

A authorized only source commit263bc889cdbcf979e03e52bc45183f6071e6bdcf, cherry-picked without
conflict/reset/stash into the clean D tree as1fc7afcaf8a688c439906695ab204b9ce7b918a1.
Other015 application integration is absent from this QA candidate; this is a foundation test, not
a complete demo build. D authored only `tests/demo-entry-independent-acceptance.test.ts` and this
report. A retains all product hooks/interfaces.

Executed at01:55:20.767947–01:55:21.751592UTC, PID427933, exit1:

```bash
./node_modules/.bin/vitest run tests/demo-entry-independent-acceptance.test.ts \
  --maxWorkers=1 --no-file-parallelism --reporter=verbose --reporter=json \
  --outputFile.json=/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/transaction-review/red/vitest.json
```

Exact test SHA256 `fe65a4438258c9114a15eeebd1389526118e2b1419ef6ed01ce7f020455078e8`.
Absolute evidence directory: `/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/transaction-review/red/`.
`receipt.json` binds command, source/QA hashes, UTC, PID and exit; `console.log` and `vitest.json`
preserve the original failures. No full suite, browser, native job or device command was run.

| Cases                                                             | Result                                    | Observed behavior                                                                                                                                                                              |
| ----------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent, Salem, Alya without injection                             | PASSED 3/3                                | Same real restoration/resume path obtains only the selected controller authority.                                                                                                              |
| Outer Access reentry after Parent/Salem/Alya resume               | FAILED 3/3                                | Nested operation is rejected without executing; outer result is INVALID_TRANSITION. Selected controller remains authenticated, public snapshots retain changes and valid same-run retry fails. |
| Middle Parent reentry after Salem/Alya resume                     | FAILED 2/2                                | Parent snapshot is restored, but inner Child remains authenticated with retained state; same public retry fails.                                                                               |
| Failed attempt projection and both controller authorization calls | PASSED assertions in all five fault cases | Actual failed authority is denied before retry. Stale controller presentation is not treated as usable permission.                                                                             |

The tests deliberately swallow the nested rejection after valid entry inside Access → Parent →
Child wrappers. Soft assertions collect the distinct public-view/status and retry failures without
skipping authority checks. The retry repeats public restoration/resume without reset or private
repair. A passive subclass records the real service's returned synthetic session solely for the
projection assertion; it changes no result or private state. Failed-session validity after a later
same-time successful retry is outside this test and remains the previously documented trusted
interception limitation.

Independent helper native_storage_review reviewed the new exact test source while D executed the
single worker. It found no false-failure source, unnecessary private-state requirement or must-fix
test issue. It ran no commands/tests, wrote no files, spawned no descendants and released its
allocation. Lead accepted the review and inspected every failed case: three positive controls
passed, five expected cases failed on controller rollback and retry, with no authority-denial
assertion failures. No suggestion required rejection or product source change. Scoped ESLint,
Prettier and whitespace checks passed exit0. Full candidate typecheck remains A's coordinated gate.

Actual bounded helper prompt:

> A059 now grants D-N05 independent regression. Reuse D's sole helper quota; READ ONLY review /home/smyk/projects/Ghaf-qa-rehearsal/tests/demo-entry-independent-acceptance.test.ts, currently uncommitted, source exact263bc889cdbcf979e03e52bc45183f6071e6bdcf cherry-picked as1fc7afc atop prior D evidence. Concrete question: do new tests faithfully demonstrate your composite rollback defect with real public controllers, verify valid fixture controls, denied failed authority, exact public rollback and usable retry without manufacturing an implementation-only requirement? Check potential false failures/overassertions; no repeat broad review. Lead executes one granted single-worker test and writes evidence in parallel. You are not alone; preserve all edits. NO writes/product fixes/coordination/test commands/browser/native/installs/commits/descendants. Report concrete improvements/rejected scope distinctions and release. Prior requested Astra/Ultra launcher accepted; Fast/effective remains unexposed.

This is a deliberately failing regression handoff to A, not a green integration recommendation.
Retest unchanged or justified amended assertions on A's exact corrected source before closing
D-NATIVE-001. All native, narration-listening, student acceptance and actual rehearsal rows retain
their earlier BLOCKED/NOT RUN/PENDING status; primary rehearsals remain0/10.

## Released adapter review and next integrated evidence boundary

At 2026-09-12T01:59:00.855107+00:00, D independently reviewed adapter source5632005 (B original2fe4b09)
against accepted015 contract293d351 and shared-scope clarificationd927f61. **PASSED bounded source
review with no additional accepted-scope defect.** D-NATIVE-001 remains open independently.

Helper native_storage_review inspected implementation; lead read the entire released adapter test
source (SHA256 `4a848711f48650f6ad287359d0e9b936cb90b96966c25b4fdc9c0b2406a74618`).
B's69 passing tests are attributed to B, not rerun or inherited as native evidence.

The request accepts only principal/generation/epoch as plain data. It cannot select a mode, storage
provider, destination or extra principal. Canonical identity and two pairing markers are validated;
initial family seeding creates no session. Exactly one resume branch runs inside the supplied
transaction. Final postconditions require the other controller signed out and unchanged context,
generation, epoch and original selected-Child context. Output contains the specified internal
family/controller views, without raw sessions or transaction snapshots.

The immutable mode, isolated family repository and corrected composite transaction remain trusted
integration responsibilities. The adapter does not independently prevent a deliberately miswired
provider from returning forged context or touching ordinary storage. That is not a user-controlled
request path, nor a reason to claim production authentication/security.

Lead test-source observations:

- Real controller/projection/capability oracles cover each principal, rejected sibling authority,
  malformed/stale requests, restoration failures, denied authorization, sanitized exceptions and
  successful same-run retry. No fake OTP or direct role assignment establishes these results.
- Context changes and invalidation during resume are labeled injected callbacks. They do not
  establish actual Back, double-tap, process death or device behavior.
- The profile-edit/handoff test stores an arbitrary independent progress JSON sentinel. Its
  unchanged bytes establish that this module leaves that sentinel alone, not that real Seeds,
  Garden, League, canopy or Family Rewards persist through the complete app journey.
- The module harness uses an isolated in-memory repository. Ordinary-family whole-run storage
  noninterference, native platform resolution and the actual +12 journey remain integration/device
  rows. Source inspection of A's still-dirty store/route tests is preparation, not an executed
  candidate pass.

A059 also authorized a narrow legacy-root guard check. At01:56–01:57UTC, /circle and /garden
redirect signed-out state and require the role selectors; /league requires Child authority and
/role always redirects to root. A's uncommitted reset-failure snapshot explicitly sets signed out
and false controller entry flags, and all role selectors reject demoResetFailed. No rendering-guard
gap was inferred in these named roots. Exact hashed dirty-source receipt:
`output/native-acceptance/transaction-review/legacy-route-source-receipt.json`. This is not a
published integrated candidate or proof that deep-link rendering/Back and every command fail closed.

The sole helper made no writes, ran no app/test/native/browser operation, spawned no descendants
and released. Lead accepted its bounded conclusions; no corrective suggestion was rejected.
Actual prompt:

> New bounded source review alongside D's useful test-matrix work: exact canonical A commit5632005 integrates B adapter2fe4b09 under015 contract293d351 + amendmentsd927f61. Review ONLY src/features/access/demoEntry.ts at5632005 and directly needed contract/model references. Question: do explicit immutable demo mode, family/principal validation, stale generation+epoch checks, signed-out gate, postconditions and metadata limit entry to one correct principal without exposing sessions or touching ordinary storage/progression? Identify realistic accepted-scope defects vs trusted injected-port abuse; do NOT re-review already assigned shared-wrapper defect (A fixing separately). Lead reviews tests/demo-entry-adapter.test.ts source/coverage independently and maintains handoff. READ ONLY, exact source via git show (canonical store dirty unrelated); no file writes, coordination, tests/commands that execute app, installs/browser/native/commits/descendants. You are not alone; preserve all work. Sole D helper quota1, Astra/Ultra launcher previously accepted/effective and Fast unexposed. Release on bounded review completion; send exact findings here.

C reports six generated narration candidates under A060. Generation metadata and AI editorial review
are not listening evidence. Actual user acceptance of exact clips, runtime import/cancellation
checks and native audio interruption remain pending. A/B remain active candidate producers; D
continues the queue after this source checkpoint.

## D-N05 correction retest — D-NATIVE-001 closed for tested boundary

At 2026-09-12T02:03:29.305268+00:00, **PASSED: D-NATIVE-001 CLOSED for the reproduced real-controller
Node fault boundary** on exact correction `2ecea74f3dc0886a2be4461d701678365673beaa`.
The original263bc88 failures remain in `transaction-review/red/`; no assertion or result was
erased. This does not establish an actual UI/native trigger, complete015 acceptance or durable recovery.

Under A063, D cherry-picked only2ecea74 into its clean tree as
`ee804aaa4dc2188f868047933703383a76ac4797`. Exact changed transaction source, relevant models,
interfaces and plain-data helper match A's commit. The rest of015 is intentionally absent from
this QA synchronization; B adapter/store/routes were reviewed separately without being run here.

D executed at02:02:32.154966–02:02:34.439967UTC, PID439434/session40816, exit0:

```bash
./node_modules/.bin/vitest run tests/demo-entry-independent-acceptance.test.ts \
  tests/demo-entry-transaction.test.ts --maxWorkers=1 --no-file-parallelism \
  --reporter=verbose --reporter=json \
  --outputFile.json=/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/transaction-review/green/vitest.json
```

**2 files /76 tests PASSED**: unchanged independent8 plus existing68, including22 new composite
cases from A. The independent test SHA remains
`fe65a4438258c9114a15eeebd1389526118e2b1419ef6ed01ce7f020455078e8`; existing transaction test SHA
`6b506faf5282e1939ccf42a45844366f2d09f3c4ae167d2483d4cb06215b4c9d`. Absolute artifact directory
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/transaction-review/green/` contains
receipt, full console and Vitest JSON. No fullsuite/native/preview job was duplicated.

The five previously failing cases now restore public views and signed-out controller state, deny
failed authority and permit the same valid retry without reset. Lead also inspected A's new tests:
outer/middle declared failure, exception, malformed/thenable result after inner success; swallowed
inner failure; all three principals/participant reentry; and reuse of a returned participant before
the outer scope ends. The existing assertion that retry IDs repeat is retained as A's counter-rollback
contract test; D's independent test requires no private ID equality or post-retry old-session claim.

The independent helper found the correction uses one synchronous scope, a shared monotonic failure
and retained rollback closures. Inner success no longer discards snapshots. The outermost wrapper
restores Child → Parent → Access on abort and releases the scope in finally. Closures preserve
the prior field/counter snapshots and Map identities without invoking fallible termination/reset
services. No new accepted-scope defect was found.

Limits remain explicit: trusted callbacks must not schedule asynchronous work. An actual exception
in a private rollback closure produces sanitized INVALID_RESPONSE and allows the remaining closures
to run, but cannot promise complete restoration of the throwing closure. Current reviewed closures
contain no ordinary external fallible operation. This is a local synchronous mechanism, not durable
storage recovery, production authentication or a sandbox against arbitrary trusted-code mutation.

Helper native_storage_review was the sole read-only helper, ran no tests/app/device operations,
changed no files or descendants and released. Lead accepted the review without additional source
changes or rejected corrective suggestions. Actual prompt:

> A063 exact correction grant now active: source2ecea74f3dc0886a2be4461d701678365673beaa, QA ee804aa (only source sync) at /home/smyk/projects/Ghaf-qa-rehearsal. READ ONLY bounded independent review of new src/features/access/demoEntryTransaction.ts and three revised wrapper methods at that exact commit against accepted d927f61 composite contract. Does new shared synchronous scope retain/restore all private snapshots on outer failure after inner success, swallowed nested failure/reentry, exception/malformed/thenable, then release for usable retry, without changing ordinary calls or persisting authority? Check realistic fail-closed limitations; do not create new product requirements for malicious trusted callbacks. Lead executes unchanged D8 + existing transaction suite one worker under A063, and inspects new test oracles independently. No file writes, coordination/tests/app execution/browser/native/installs/commits/descendants. You are not alone; preserve all edits. Sole D helper quota1; prior Astra/Ultra accepted/effective and Fast unexposed. Return findings here and release.

Report/test/completed ignored evidence can be released for integration. No D product fix was made.
Next gates are the exact integrated candidate's checks/browser evidence, actual APK identity, chosen
owner-authorized primary and secondary devices, native operation and actual listening/rehearsals.
The collector remains ready; native/human readiness is not implied by closing this source defect.
