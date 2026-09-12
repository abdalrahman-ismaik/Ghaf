# D — independent native acceptance

**Collector, independent source/browser-artifact review and the actual merged-manifest review are
complete for their recorded scope; APK and physical-device acceptance remain BLOCKED.** Final published runtime is
`5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051`. A's exact four-check receipt passes typecheck, lint,
format and148files/1,919tests. D independently passed46 synthetic collector checks and76 controller
fault tests on their separately identified source versions. No APK/device/human rehearsal pass exists.

Latest completed observation,2026-09-12 11:29:25UTC: a short passive check observed only the
**same unauthorized tablet**, with no authorization transition. Earlier owner Allow, empty-list
and timeout evidence remain preserved. Model/OS/ABI, APK installation and native journeys are unverified.

C's actual `f16112d` browser retest supports closure of duplicate headings and the demo approval
handoff warning; D independently reviewed its artifacts. The final runtime removes only the
ineffective web label positioning. D-R03's recorded clipping interpretation is **withdrawn after
contrary pixel evidence**, not repaired by that property. Native font scaling remains NOT RUN.
Historical findings below are retained in chronological order; the final disposition section
supersedes earlier open/visual statements without erasing their evidence.

D owns only the collector, assigned independent test, this report and local ignored
`output/native-acceptance/**` under A's exact grants. Product source changes were limited to A's
explicit transaction-source cherry-picks for testing; D made no product correction. Recovery014
remains deferred, ordinary progress remains process-local and demo restart restores no principal.
All native/human/audio acceptance limits remain open. This evidence is ready for integration;
readiness for an APK demonstration has not been established.

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

## New integrated-browser findings and actual narration rejection

Checkpoint 2026-09-12T02:15:31.519912+00:00. A attributes all four checks on runtime2ecea74 to
147files/1,914tests; D did not repeat them. Later A privacy lifecycle testc3b1cc8 adds a real-command
prepared transcript/media/reflection handoff case without changing runtime source. C performed
the serialized browser pass; D inspected the named failure artifact and corresponding source,
not C's live browser.

**P2 D-NATIVE-002 / C030 — OPEN, same defect under two references.** Candidate
2ecea74f3dc0886a2be4461d701678365673beaa, browser. C actually chose Parent, created the Salem
Green task, used the prepared clearer wording, reviewed/approved and pressed the success dialog's
open-Child action. The selector appeared with visible “The action 'POP_TO_TOP' was not handled”;
subsequent Salem selection still reached the assigned task. Expected: clean signed-out demo
selector, preserved approved task and correct subsequent Child authority, without an unhandled
navigation action. Native outcome and independent D pointer reproduction: **NOT RUN**.

D read the exact original snapshot at
`/home/smyk/projects/Ghaf/output/playwright/176426/page-2026-09-12T02-12-07-331Z.yml`,
SHA256 `81658dda3ef489d8a4540deff202b9cb3fbc6bc10e4b512e6fdb401a40c672d7`; lines27–29
record the warning next to the three-profile selector. D independently traced
`app/parent/task/review.tsx` at2ecea74: continueToChild signs out, calls router.dismissAll and
then replaces with /access/child. Ending role authority can unmount the stack before the queued
pop. Existing public-container prepareEntryReset is already used by demo Settings; A074 owns
any correction to the approval-handoff route and its tests. No product source was changed by D.

This is a separate caller from the three historical D-R02 reset cases. Their narrow7fff0f3 closure
stands; neither it nor the new transaction closure establishes this approval-handoff pass. D016/017
request a short independent retest of the exact released correction with explicit browser/artifact
allocation; no C slot or stopped-process ownership is inferred.

Other C evidence remains carefully attributed:

- C027 found duplicate accessibility headings in the AR/EN selector/story: one visual title but
  two heading nodes. A072 grants C a two-file correction, retaining the outer focusable header.
  Independent corrected-browser and native TalkBack acceptance remain pending.
- C031 records four normal entry and12 normal story rows,12 enlarged CSS story rows, AR/EN
  Finish/Back/reopen/focus and a labeled missing-image/reduced-motion probe. These are C browser
  observations, not phone measurements or a D whole-matrix pass.
- D-R03 remains **OPEN, P3 browser CSS-stress clipping**. C's new Arabic35-span200% probe
  reproduces the cut final word at320; normal text remains readable. Focus/blur and removing a
  transform did not fix it. A temporary label position:relative probe exposed the word and was
  restored; this is diagnostic injection, not a released correction. The shared Button owns the
  label, so C did not patch its card as a workaround. C's English card attempt hit a duplicate
  hidden-route testID selector error; that row is NOT RUN, not an app failure.

C026 records an actual user reply at02:08:27.912227UTC saying they heard the three recordings and
found them very bad, requesting a different Arabic narrator. All three original Fatima-v1 Arabic
takes are therefore **REJECTED**, not pending or approved. This is attributed to C's recorded user
listening; D has not listened, and the user's name/playback device/context remain unspecified.
English listening is NOT RUN. Hamed and Salma first-moment audition candidates were subsequently
generated under A073; C032 supplies hashes and durations. They await actual user selection and
are not accepted full narration or runtime assets. The complete silent onboarding remains selected.

C explicitly closed/released browser444083 at02:14:24.994798UTC. A owns its Metro and correction
queue; D holds no browser/server/native job or helper. APK, identified phones, native checks and
actual primary rehearsals remain absent/NOT RUN. The new defects and rejected clips prevent a
blanket readiness verdict while useful correction and build verification continue.

## D-EVID-001 — preserved diagnostic image does not show the reported repair

At 2026-09-12T02:21:08.837585+00:00, independent artifact review found **FAILED evidence support**,
P2 D-EVID-001. This corrects the preceding attributed statement that C's temporary relative-position
probe exposed the complete word. That was a reported observation; the preserved image does not
substantiate it. D-R03 remains OPEN until fresh exact-candidate verification.

Source being prepared for retest: f16112d2daf0378445df08654e7da872af4f5658, including web-only
label changeaf8da6c. Original browser source2ecea74. Under canonical
`/home/smyk/projects/Ghaf/output/playwright/176426/integrated-015/`, these three files are
byte-identical, each SHA256 `c5a98062115434ae4c05d6a927a06766fcd21141c0db974421cbf34aeac79488`:

- `ar-card-css200-secondary.png`
- `ar-card-css200-relative-diagnostic.png`
- `ar-card-css200-blurred.png`

The helper also matched transform-none/block diagnostic files, C's copied directory and manifest.
Lead independently ran SHA256 on the three named canonical files (exit0) and directly viewed the
relative diagnostic: the last line's Arabic glyphs remain cut at the bottom. These images cannot
support a before/after improvement. Focus adds an amber border and two pixels of control height,
not a demonstrated text repair. No asset was changed, replaced or removed. A/C own corrected
attribution and fresh retest evidence; no further product fix is inferred from this evidence issue.

The exact recorded CSS recipe is available in
`/home/smyk/projects/Ghaf-ui-studio/output/native-ui/integrated-015/card-diagnostic-ar.json`:
320×844, Salem's assigned unaccepted task, fonts ready plus two frames; select35 nonempty
positive-width leaf span.is_Text elements within child-home-screen; index with data-d-stress;
double computed font-size and line-height with important rules; wait two frames and scroll the
primary action into view before viewport/secondary crops. The secondary is index13, text
`طلب مهمة أصغر قبل البدء`,16/26→32/52px. Original button240×182, label198×156; final-word
Range remains within both, so geometry alone did not establish painted visibility. Normal secondary
is240×52 at320 and310×52 at390. Native text scaling is a separate unrun requirement.

Fresh retest must verify loadedf16112d modules, repeat the recorded recipe without adding another
relative-position override, inspect complete final-word paint, record actual geometry/focus and
preserve both outcomes. English needs its own visible-route-scoped run: C's previous duplicate
testID error establishes no English card stress result.

Helper `/root/native_visual_evidence_review` (ghaf-demo-qa-agent) was launched explicitly
Astra/ultra; effective serving/Fast remain unexposed. It read artifacts/source only, opened no
browser, ran no app/test/native command, wrote no files and spawned no descendants. Lead reviewed
its findings and released the allocation. Rejected inference: treating C031/A075's reported
relative-position improvement as supported by the preserved paired PNGs. Actual prompt:

> You are Session D's ONLY active helper under NB1 one-helper quota (no descendants). Requested Astra/Ultra; launch explicit, effective serving/Fast unexposed. READ ONLY bounded artifact preparation while lead waits for A's exact browser grant and prepares actions. Source candidate being retested f16112d2daf0378445df08654e7da872af4f5658 (canonical /home/smyk/projects/Ghaf); original C browser source2ecea74. Question: from C report/status and exact artifacts under /home/smyk/projects/Ghaf/output/playwright/176426/integrated-015/ and /home/smyk/projects/Ghaf-ui-studio/output/native-ui/integrated-015/, identify the recorded Arabic D-R03 CSS stress recipe and paired visual evidence required for an equivalent independent retest (35 leaf spans,320 width, text/line sizes, focused/settled differences). Distinguish what is actually recorded from guesses. Inspect code-native sharedButton correction af8da6c and affected 2heading/handoff changes only as needed. You are not alone; preserve everyone's changes. NO WRITES, no coordination/report edits, no app/test/browser/Metro/native execution, no tool install, no commits or recursive spawning. Do not open a browser or claim native passes. Report concise exact paths/recipe/limits to D and release; later I may ask you to inspect new paired screenshots read-only. Lead owns all report/status/browser actions.

D read the Playwright skill and confirmed existing npx. The repository MCP workflow and A's
serialized resource/artifact grants take precedence over downloading an additional CLI. D has not
started a browser or installed tools. A078 assigns C the affected retest; D016/017 request for an
independent browser allocation remains pending. A's new fullf16112d four-check receipt records
exit0 throughout and148files/1,919tests are A's published count, not D execution or visual acceptance.

## Final browser-artifact disposition and frozen build handoff

Checkpoint 2026-09-12T02:28:02.582898+00:00; board38/A079–084 acknowledged.
Final published runtime `5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051`; D report base
`fdcfe7c91f234579cf819fc755b95546373c1981` in the QA branch, which contains only the separately
authorized transaction source sync and is not a full015 runtime checkout. B's clean
`b317f2da6e87c5118734f2e5a56110f8f533f151` matches final runtime according to A/B's source receipt.
No final APK is published yet. A083 grants B manifest-only generation, followed by A's explicit
actual merged-permission review before a full build. D claims no native/heavy/browser slot.

**D-R03: captured-state clipping diagnosis WITHDRAWN following contrary evidence.** D's earlier
statement that the final Arabic glyph was cut was a visual misreading. The helper independently
reproduced C's483-pixel green mask, matching bboxes `[90,131,148,163]` and `[91,26,149,58]`,
normalized IoU1.0 and zero missing/extra pixels. All599 pixels differing from the observed
background also match. More strongly, the entire original crop `(70,115,170,181)` and isolated
reference crop `(71,10,171,76)` are exactly RGB-identical,100×66 including the full last word and
padding. Lead independently repeated the full RGB comparison: equal bytes and no difference bbox.
Thus a green threshold cannot hide missing faint ink in this comparison.

Original canonical `ar-card-css200-secondary.png` remains SHA256
`c5a98062115434ae4c05d6a927a06766fcd21141c0db974421cbf34aeac79488`; isolated reference
`corrected/ar-isolated-final-word-reference.png` is
`5caa686f603e3704d8ad3746e7789883a0c4a989051ce1b37948bc66739a5811`, both under
`/home/smyk/projects/Ghaf/output/playwright/176426/integrated-015/`. The240×76 isolated image
shows the same word shape with surrounding space. C records extraction into a body element with
ReadexPro_500Medium,32px font,52px line height, RTL,198px content width and visible overflow.
Those setup details are **attributed to C**: the granted artifact directories contain no raw
reference-creation Playwright code/computed-style receipt. The pixels and original computed-style
receipt are consistent with that record, but do not independently establish every setup detail.
This bounded withdrawal is not an all-label, all-font, Arabic-language or native-scaling pass.

**D-EVID-001: evidence correction complete.** Original before/relative/blurred and freshf16112d
secondary PNGs are byte-identical. The temporary property never demonstrated a repair. A079/C037
explicitly withdrew the claimed paired improvement; A removed the unsupported property in5d8a3e8.
Preserve the original unsupported inference, evidence and correction. Do not describe either the
property addition or removal as a demonstrated typography fix.

**D-NATIVE-002 / C030: CLOSED for the exact recorded demo browser caller onf16112d.** D read
`corrected-handoff.json`, including the executed Playwright click code: approve Salem's task,
press open-Child, wait for the Salem profile selector, settle two frames, capture and inspect.
Result: URL `/`, three profiles, no POP_TO_TOP text, no collected error/POP_TO_TOP console message.
Loaded route name is canonical `app/parent/task/review.tsx` and contains prepareEntryReset.
The PNG shows the selector; the receipt supplies the action evidence that a static image alone
cannot establish. Source change prepares the root reset before sign-out, fails safely if preparation
fails, then uses the prepared reset. Ordinary fallback is unchanged and was not passed by this
retest. This closes only C's browser reproduction plus D's independent source/artifact review.
D's own pointer execution, native Back, authority/counter journey and ordinary caller remain NOT RUN
for this browser receipt. Historical D-R02 reset closure remains separately scoped.

**C027 duplicate heading: CLOSED for C's four recorded AR/EN browser states onf16112d.**
`corrected-headings.json` records actual locale switch, story open/close, snapshots and DOM
observations: entry has four headings (title plus profiles), story one, zero nested heading nodes
in each locale, with the intended title active. Loaded module proof records both inner text-role
changes from canonical source. This is browser focus/DOM evidence, not TalkBack names/order.

C's `corrected-card-matrix.json` records eight AR/EN×320/390×normal/CSS200 states, including the
previously failed English selector probe now scoped successfully. It captures primary/secondary
buttons and geometry; D read all eight results and directly viewed the320 English and390 Arabic
stressed secondary crops, without operating the app. Arabic320 matches the original pixel evidence.
CSS injection is a labeled browser stress test, not Android font scaling. No entire native matrix
or new D interaction pass is inferred.

Lead independently checked all81 canonical/copy artifact pairs against C's `capture-manifest.json`:
**81/81 SHA256 matches**. D's own receipt is
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/visual-review/final-c-artifact-review.json`.
It records UTC, absolute original/copy paths, expected/actual hashes, receipt hashes and the lead's
RGB comparison. Host Python/Pillow analysis exited0, modified no input images and ran no browser,
app, device or test. Raw originals remain in their granted local ignored boundaries.

Loaded proof at `corrected/loaded-proof.json` records02:20:16.678Z, fonts loaded, canonical module
names and demo mode onf16112d; no mixed-worktree preview root is accepted. C is the executor.
A's final5d8a3e8 commit removes only one web-only style line. The heading and handoff evidence is
reused with that exact source attribution and unchanged behavior scope; there was no further D/C
browser run after removal. A explicitly selected no repeat for this ineffective-property removal.

D read A's final receipt at
`/home/smyk/projects/Ghaf/output/native-integration/015/full-5d8a3e8/receipt.json`:
02:24:07.613684–02:25:11.152004UTC; runner473953; typecheck473955, lint474383, format474589,
test474896 all exit0. Published count148files/1,919tests is attributed to A. D did not duplicate
those checks. No pass transfers to an as-yet-unbuilt APK, signing identity, installed package,
physical phone, cold start, offline launch or actual human rehearsal.

The sole helper `/root/native_visual_evidence_review` completed and released with no writes,
app/tests/browser/native commands or descendants. It also corrected its earlier visual reading.
Lead accepted the independent pixel evidence and rejected both the unsupported repair claim and
our original clipping interpretation. Actual follow-up prompt:

> A081 explicitly grants bounded independent read-only review of new glyph evidence, no browser or broad investigation. C038 now captured corrected/ar-isolated-final-word-reference.png and /home/smyk/projects/Ghaf-ui-studio/output/native-ui/integrated-015/glyph-reference-comparison.json; claims original last-line bbox[90,131,148,163] and isolated bbox[91,26,149,58],483 green pixels each, IoU1 after translation; same Readex500/font32/line52/RTL outside button/card. Please assess actual recorded capture/code provenance, equal font/size/context, mask threshold interpretation and whether it supports withdrawing initial D-R03 clipping diagnosis (rather than claiming relative patch fixed it). Read images/receipts and perform read-only pixel calculations if needed; no outputs/files, app/tests/browser/native/installs/descendants. You are not alone; preserve originals and others' work. Lead independently reviews heading/handoff final artifact scope and writes D analysis receipt/report. D's one-helper quota reused, settings unchanged. Be candid about our earlier visual misreading and any remaining limits; report to D and release.

Report and completed ignored review evidence are released after the scoped format/diff check and
commit. D retains only its status writer and waits for the verified active B artifact handoff.
Physical phones/owner authorization, actual human review and0/10 rehearsals remain unchanged.

## Resumed tablet preflight — A093 retained by A096

The user resumed D after the environment interruption, then restored full filesystem/network tool
access. Same D instance and clean QA5501b4a were reconciled against board43 and A094–098.
The old B A092 processes were absent; its receipt had no final exit and the logs contained partial
NUL tails. A095 independently recorded an intermediate bundle but no merged manifest or APK.
This is an interrupted build with unknown final exit, not a new resource-stop or native pass.
B alone owns the subsequent A096 build recovery. No old build output was modified by D.

A093 records the owner's statement, “yes I have connected my samsung tab s4”, and grants D a
bounded read-only visibility check. The reported Samsung Tab S4 is a **tablet**; it does not
establish primary/secondary narrow-phone coverage. Actual Android model, OS, ABI, serial and
installed Ghaf identity remain unknown until a usable transport is observed. No APK/install
permission is inferred from the connection statement.

D's first restricted `ss` listener check returned “Operation not permitted”. Its escalation request
was interrupted before any successful result. After the user restored full access, a fresh `ss`
check returned exit0 with no5037listener. No surviving adb/java/node process was observed at that
check. This environment/tool failure is preserved separately from device visibility. Existing
default host adbkey was present; only existence was checked, never contents. No custom ADB socket,
port or vendor-key environment was set. No new key, USB setting or host configuration was selected.

Actual evidence directory:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-preflight/20260912T092019Z/`.
The local0600receipt and raw command files are inside a0700directory; device lines/serials belong
only there. No serial was returned in this run or added to Git. Receipt identifies runner15820,
source5d8a3e8, QA5501b4a and exact tool path:

```text
/home/smyk/projects/Ghaf-demo-systems/output/native-toolchain/sdk/platform-tools/adb
```

Tool SHA256 `a902be8f45c6c62e76c9efaf6947a0fa747c9cabd89a2ac8e0d16ecb30b3ed01`.
Version output: ADB1.0.41,37.0.1-15733141, Linux WSL2. The Linux version describes this host,
not the tablet's Android version.

| Check                                                 | Actual command/result                                                                                                          | Status and limit                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Host tool identity                                    | Exact binary `version`, PID15821,09:20:19.458968–.462188UTC, exit0                                                             | PASSED host tool check                              |
| Transport enumeration                                 | Exact binary `devices -l`, PID15822,09:20:19.462470–.470111UTC, exit0; no timeout, header only, zero rows                      | PASSED enumeration; device work BLOCKED             |
| Local server                                          | stderr says absent daemon started successfully; subsequent `ss -ltnp 'sport = :5037'` exit0 observes adb15824 on127.0.0.1:5037 | A093 lightweight local server; no tablet acceptance |
| Model/Android SDK/release                             | No selected authorized transport, so no serial-scoped getprop command executed                                                 | BLOCKED                                             |
| Existing Ghaf package                                 | No device query executed                                                                                                       | NOT RUN                                             |
| APK/install/journey                                   | No published APK, no install or UI action                                                                                      | NOT RUN/BLOCKED                                     |
| Narrow primary/secondary phones and actual rehearsals | No observed phone, operator timing or human run                                                                                | NOT RUN;0/10                                        |

A header-only successful enumeration establishes **no ADB-visible device in this WSL host at that
observation**. It does not prove that no tablet is physically connected, that Android debugging is
disabled, that permission was denied, or that Ghaf is absent. No target was selected by order or
inferred serial. No reconnect, install, uninstall, reset, clear-data, permission acceptance,
recording, screenshot, broad properties, package inventory or logcat command ran.

D028 asks A to coordinate the exact owner step: make the selected tablet visible and authorized
to the intended ADB host. USB attachment, Windows-versus-WSL visibility and debugging/trust state
remain unknown. D will not alter USB/WSL/services as a shortcut. The observed local server15824
is retained for explicit handoff; no unrelated server was killed. Any future scoped device reads
must revalidate a nonempty, unambiguous authorized transport, then use the exact selected serial.
Successful metadata would still not pass APK, native or human rows.

This is **separate from collector --preflight**, which requires a real APK and all five explicit
identity arguments and performs host/APK checks only. D did not invoke the collector with a
fabricated APK or serial. The collector's default installed-package/ABI inspection exceeds this
initial A093 model/OS visibility scope and is not used to bypass the missing artifact gate.

Bounded AI review: sole helper `/root/tablet_preflight_review`, explicit Astra/ultra launch accepted;
Fast/effective serving unavailable. Initial wording “no commands” was clarified to permit bounded
read-only file readers, while forbidding device/network/socket/app/test execution. It reviewed
collector/report semantics and supplied the above empty-list/host-versus-Android distinctions;
lead executed actual preflight and owns this report. No product generation or human approval.
Initial exact prompt:

> You are D's sole helper under canonical board43/A093/A096 quota1. READ ONLY bounded safety review, no descendants or commands/device/browser/tests/writes. You are not alone; preserve all files. Exact QA /home/smyk/projects/Ghaf-qa-rehearsal HEAD5501b4a, final runtime5d8a3e8; no actualAPK yet. User via A093 reported connected SamsungTabS4; actual serial/model/OS unknown. A093 grants B SDK adb version + bounded devices -l enumeration, then only exact owner-selected authorized TabS4 serial model/release/SDK and targetGhafpackage if relevant. No install/uninstall/clear/reset/permissions/media/personaldata/host USB services. Existing5037 listener was absent at09:18 full-access ss; no adbprocess observed. Lead will run version then enumerate (maystart lightweightADBserver underA093), keep raw serial/device lines only ignored QA output/native-acceptance/device-preflight, report sanitized status. If multiple/offline/unauthorized/mismatcheddevice block followup, do not auto-reconnect/selectfirst. Concrete question: inspect existing collector/docs read-only and advise minimal correct command/receipt/absence interpretation for this preflight; assess resulting receipts when supplied. Do not repeat broad audits or run device/network/socket actions. Lead owns actual commands/report/status. Requested Astra/Ultra explicit, Fast launch unavailable; effective settings unexposed. Return findings here, never shared coordination. Initial output concise; wait for receipt followup if necessary.

Actual clarification:

> Clarification: bounded read-only shell cat/rg/python file reads are permitted for exact collector/docs/receipt; no app/device/network/socket/test/native commands. The no-commands phrase meant no execution under review, not file inspection. Existing default ~/.android/adbkey is present (contents never read/output), no custom ADB socket/port/vendor-key env; exact B adb version37.0.1-15733141/1.0.41 observed. Lead now records enumeration.

Receipt follow-up:

> Actual receipt now at /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-preflight/20260912T092019Z/receipt.json plus version/devices stdout/stderr. B SDK version37.0.1-15733141, client1.0.41. devices -l exit0/header-only/zero rows, no timeout. stderr server absent→started successfully. Afterwards ss observed loopback127.0.0.1:5037 adbPID15824. No device-specific command issued, no serial/model/AndroidOS known, no install. Please read exact outputs/receipt for narrow evidence classification and safe owner next-step, then finalize/release. Lead records own fresh observer commands and outbox to A; no second enumeration needed.

Helper final review accepted the host-enumeration classification and explicitly released with no
writes, device/test/browser operations or descendants. Server PID/listener proof is D's separate
observation, not a helper-executed check. Rejected inferences: treating zero rows as no physical
connection, diagnosing a cable/driver/trust/WSL fault without evidence, or calling this collector
execution/native acceptance. Initial scoped format check reported style warnings; formatted output
and a fresh scoped check follow before commit. No app suite was repeated for this report change.

## Independent actual merged-manifest review — A108/A109

D reviewed the first successful manifest candidate, not an estimated source list. B's exact run is
`/home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T093503Z-manifest.PZp7Ci/`,
start09:35:01/end09:36:18UTC, build HEAD5f990802eb4217b7c9d49ff91c1efddcb005421f,
runtime5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051, demo mode and reviewed script SHA
`7c2a2c8da6081586d6182232948a512615c242e67024655063f85487db9abfcf`. B records21steps exit0,
Gradle0 and cleanup0, with owned processes absent. D read the actual final receipt and artifacts;
it did not run or duplicate this build. Earlier interrupted/refused/cache-failed outputs remain
preserved and do not acquire this success. This is a manifest gate only; no APK yet exists.

Lead independently parsed the XML and verified three-way SHA256 equality: copied
`merged-release-manifest.xml`, its actual generated release-main source and B's recorded hash:
`5ba0ea320a67dde7fdd8f6099bb23c5c17a11ca5d462248e4559d7cd43797e9a`.
All eight actual permission declarations match the names and full attributes in
`merged-manifest-review.json`. The merger-origin evidence is `manifest-merger-0.txt`.
D's independent receipt stores absolute paths, sizes/hashes, parsed attributes and source-file
comparison results at
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/manifest-review/PZp7Ci/independent-manifest-receipt.json`.
The host parser exited0; it did not execute the app or modify any B artifact.

| Boundary                    | Actual XML/source evidence                                                                                       | Disposition                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Package/version             | ae.ac.ku.ghaf.prototype, versionCode1, versionName0.1.0                                                          | PASSED against unchanged config                                     |
| Android range               | minSdk24, targetSdk36                                                                                            | PASSED manifest identity; phone compatibility NOT RUN               |
| Backup                      | application allowBackup=false                                                                                    | PASSED declaration; no production data-protection claim             |
| Debug/cleartext             | debuggable and usesCleartextTraffic attributes absent                                                            | Record absence; final APK badging/behavior still NOT RUN            |
| RTL/keyboard                | supportsRtl=true; MainActivity adjustResize, portrait, singleTask                                                | Configuration only; RTL/IME/Back/native scaling NOT RUN             |
| Blocked storage permissions | READ_EXTERNAL_STORAGE and WRITE_EXTERNAL_STORAGE absent; merger records dependency declarations rejected         | PASSED merged exclusion                                             |
| Entry/providers/flags       | exact source config matches5d8a3e8; build child env is cleared, mock service, demo=true, no live/R002b overrides | PASSED source/input fidelity; actual APK selection/behavior NOT RUN |
| APK/signing/install         | manifest phase only; template certificate is a build input                                                       | NOT RUN; no signed APK identity or native acceptance                |

Every final uses-permission element has only `android:name`: no maxSdkVersion or other qualifier
is present. Full names below are declarations, not a grant to exercise those capabilities.
Origins refer to the actual merger report's line numbers and supporting unchanged inputs:

| Permission                                                       | Actual merged origin                                                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| android.permission.INTERNET                                      | Generated main; merged expo.modules.filesystem57.0.6 and expo.modules.image57.0.4, report177–184                |
| android.permission.MODIFY_AUDIO_SETTINGS                         | Generated main and expo.modules.audio57.0.4, report185–190                                                      |
| android.permission.RECORD_AUDIO                                  | Generated main, report199–202; unchanged expo-audio config recordAudioAndroid=true                              |
| android.permission.SYSTEM_ALERT_WINDOW                           | Generated main, report203–206; retained installed Expo template declaration                                     |
| android.permission.VIBRATE                                       | Generated main, report207–210; retained template declaration                                                    |
| android.permission.ACCESS_NETWORK_STATE                          | expo.modules.image57.0.4 plus Media3 exoplayer/common1.9.0, report714–721                                       |
| android.permission.WAKE_LOCK                                     | androidx.media3:media3-exoplayer1.9.0, report722–725                                                            |
| ae.ac.ku.ghaf.prototype.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION | androidx.core:core1.18.0, report766–785; same-name permission explicitly defined with protectionLevel=signature |

WAKE_LOCK and the app-scoped signature permission account for the difference from B's earlier
six-name source estimate. That estimate was explicitly provisional; it was not an approved final
permission set. The actual storage exclusions are substantiated by both final XML and merger
rejection records, not by source configuration alone.

No mismatch against the unchanged selected configuration was found. **Acceptance concern remains
explicit:** RECORD_AUDIO and SYSTEM_ALERT_WINDOW are declared capabilities outside the prepared
demo's permitted recording/overlay behavior. Their declaration is not evidence of an actual
request, prompt, grant, recording or overlay. The build's cleared environment and default-off
three live-AI/eight R002b flags are source/input evidence only; direct APK/native no-prompt and
prepared-only behavior remain unrun. Do not request real Child media or exercise those capabilities
as a shortcut. A alone decides whether this disclosed existing-config internal rehearsal artifact
is approved; D does not approve a guessed permission list or alter the configuration.

Lead inspected `src/config/r002bFeatureFlags.ts`, `aiFeatureFlags.ts`, `demoEntry.ts` and
`app.config.ts`, verifying their actual B bytes against the exact5d8a3e8 Git objects. Eight and
three respective flags enable only true/'true' and default false. Build script uses env-i,
EXPO_NO_DOTENV=1, serviceMode=mock and selected demo=true; its own input guard rejects inherited
public overrides. The manifest cannot establish whether the future APK opens the selected profile
picker or preserves all private role/progress authorities. Recovery014 and task durability remain
deferred, regardless of this manifest success.

Independent helper `/root/manifest_origin_review` is D's sole Astra/ultra launch for this scope;
Fast/effective serving unexposed. It reads only exact XML/merger/config/template/dependency origins
and reports to D. Lead owns package/SDK/config/hash verification and the durable report. No source,
provider, feature or human-review generation is delegated. Actual prompt:

> D sole helper under board48/A108. READ ONLY independent manifest permission-origin review; no descendants or writes, no device/browser/app/test/native/install/network commands. B actual completed manifest /home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T093503Z-manifest.PZp7Ci/{merged-release-manifest.xml,merged-manifest-review.json,manifest-merger-0.txt}; XMLSHA5ba0ea320a67dde7fdd8f6099bb23c5c17a11ca5d462248e4559d7cd43797e9a, source5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051/demo/script7c2. Grant question: map ALL eight uses-permission names/fullattributes to actual merger origins (generated main/template/config or exact dependency), verify signature-level dynamic receiver declaration and anything materially broader than prior source assumptions (WAKE_LOCK/custompermission vs previously six). Identify actionable evidence gaps or boundary concerns without approving set: A alone finalpermissiondecision/fullAPKgrant. Current product prepared/synthetic only; recordingcapability not authorization realChildmedia. Product source/shared reports/status read-only; only lead D writes ownreport/ignoredmanifest-review and separately checks config/package/SDK/backup/debuggable/flags. You are not alone, preserve all edits. File-reading cat/rg/python permitted; no code execution under review/device/socket/test/network. Inspect narrowly supporting installed manifests/config if needed to substantiate origin. Return exact source/report line references and limits here then release. Requested Astra/Ultra explicit; Fast/effective serving unexposed.

Follow-up:

> Lead independently parsed/hash-verified XML==generatedsource==Breceipt5ba0ea, all8attributes/name sets, exactconfig/defaultflag source matches5d8a3e8, controlledenv clears alloverrides/serviceMode mock/demo true. debuggable/cleartext absent, backupfalse, min24/target36, supportsRtltrue, no storage permissions. No sourcefidelity mismatch found; A owns explicitinternalpermissiondecision, native recording/overlay/flag behavior unrun. Please finish origin evidence and concise acceptance concerns, then release; no broader source audit.

Helper completed and released: all eight origins and name-only attributes independently confirmed,
including six exact transformed dependency manifests. Installed Expo template archive SHA256
`2d088eab31fd6b113ee3d5069927467c205f7a62d33fc408a44a7db25a5cb4f3` matches its receipt;
archive main manifest supplies INTERNET/SYSTEM_ALERT_WINDOW/VIBRATE. Installed expo-audio plugin
withAudio.ts68–89 supplies RECORD_AUDIO/MODIFY_AUDIO_SETTINGS from the true recording option;
its Android build.gradle29–32 declares Media3/ExoPlayer1.9.0. The review does not establish
necessity of the declared capabilities for this prepared journey.

One approval-evidence detail must remain explicit: B's JSON records uses-permission attributes but
omits the separate custom permission definition. The XML37–41 and D's independent receipt retain
its exact name and signature protectionLevel; A should preserve that declaration in its review,
not infer it from the permission name alone. Background recording/playback false also does not
remove the transitive WAKE_LOCK declaration. No runtime lock/background behavior was tested.

Lead accepted the independently substantiated provenance and kept these limits. Rejected inference:
permission provenance or a disabled background option establishes native non-use. No product-source
suggestion was implemented, no native/human pass invented, and the sole helper allocation is released.
This cohesive report and ignored receipt are ready for integration after scoped formatting/diff
checks; the next gate is A's permission decision and exact completed APK/source/hash handoff.

## Attached tablet readiness — A152, unauthorized transport

A's published A152 records the actual Windows bind exit0 and Ubuntu USB attachment exit0 for the
owner-selected Galaxy Tab S4. Those setup commands and Windows device description are **attributed
to A**, not executed by D. Windows BusId is not an Android serial or evidence of app readiness.
D acknowledged board56/A152 in D041 before reacquiring only this report and ignored
`output/native-acceptance/device-readiness/**`. QA was clean at
`e5291f078c111a31e8bd42e5420e912ab916f70b`; runtime remains5d8a3e8.

Actual D receipt:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T110125Z/receipt.json`.
The fresh directory is0700; receipt and `devices-raw.txt` are0600. The returned hardware identifier
is confined to those ignored files and omitted from this report, coordination and user-facing output.

| Check                                    | Actual result                                                                                                                             | Disposition                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Existing server/tool                     | `/proc/15824/exe` resolves to the exact B SDK adb; binary SHA256 remains a902be8f45c6c62e76c9efaf6947a0fa747c9cabd89a2ac8e0d16ecb30b3ed01 | PASSED identity; retained existing server                 |
| Host `adb version`                       | PID115445,11:01:25.908933–.911638UTC, exit0                                                                                               | PASSED host tool, not Android version                     |
| Direct `host:version`                    | Existing127.0.0.1:5037 smart socket,11:01:25.911656–.914872UTC, OKAY,0029                                                                 | PASSED protocol1.0.41; no child-process exit code applies |
| Direct `host:devices-l`                  | Same server,11:01:25.914890–.915262UTC, OKAY, exactly one transport with state unauthorized                                               | PASSED enumeration, BLOCKED authorized device access      |
| Overall readiness wrapper                | PID115444,11:01:25.717066–.915525UTC, exit3                                                                                               | BLOCKED, not a product defect                             |
| Serial-scoped model/release/SDK/ABI      | No transport selection, sysfs mapping, serial query or shell request executed                                                             | NOT RUN                                                   |
| APK/package/install/native/human journey | No artifact, package query, install or UI action                                                                                          | BLOCKED/NOT RUN;0/10 rehearsals                           |

This is an actual change from the earlier zero-row enumeration. It establishes that the existing
WSL ADB server can now see one transport, while Android has not authorized its debug access.
The host query's OKAY status is recorded separately from shell exit codes; there were no device
shell commands. D did not run `adb devices` through a client branch that might restart a server:
the bounded direct smart-socket requests used the existing server only. `adb version` does not
contact or start a server. The readiness wrapper had a ten-second per-query deadline and64KiB
response cap; neither limit was reached. This was not an APK-required collector invocation.

D042 asks A to have the actual owner unlock the tablet and review/approve the USB debugging RSA
prompt for this host. D has not observed that prompt, invented its acceptance, changed USB settings,
reconnected, restarted ADB, installed anything or diagnosed a Linux file-permission failure. After
confirmed owner action, a fresh bounded enumeration must establish authorized unambiguous access
before the four allowlisted properties. A serial must never be selected merely by list order.
The current evidence cannot identify either narrow primary/secondary phone or pass an APK, native
accessibility, offline, reset, recovery014, student or human-rehearsal gate.

Bounded supporting AI: sole helper `/root/attached_tablet_evidence_review`, launched explicitly
Astra/ultra; Fast selector/effective serving unexposed. Lead executed the actual commands and wrote
this evidence; helper only read the previous policy and exact receipt. No product generation,
shared coordination writes, descendants or delegated device operations. Actual initial prompt:

> You are D's only helper, quota1 board56/A152. You are not alone; preserve all others' files. READ ONLY, no writes or descendants, no device/ADB/socket/network/browser/native/app/test execution. B/A own active build tooling; don't duplicate it. Exact QA /home/smyk/projects/Ghaf-qa-rehearsal HEAD e5291f078c111a31e8bd42e5420e912ab916f70b, runtime5d8a3e8cd90ac0975b0d4be7eeb2d66b3fbde051; APK absent. Concrete task: independently review D's forthcoming actual device-readiness receipt and report addition for safe scope, accurate transport/model/OS/ABI claims and missing gates. A152 reports owner-selected Samsung Galaxy Tab S4 attached Ubuntu after exact Windows bind/attach exit0; D owns existing loopbackADB PID15824. Lead will inspect host version/list, then model/Androidrelease/SDK/ABI only if one authorized matched selected device. No first-phone selection, no install/permissions/media/personal logs. Serials/raw stay ignored and must never appear in your reply/status/Git. Read relevant report's prior tablet preflight section + collector smart-socket policy, then wait for exact receipt path. Bounded file-reading shell is allowed; no execution of anything under review. Lead owns report/status and actual commands. Return findings only to lead, do not touch coordination. Requested Astra/Ultra explicit; Fast/effective serving unexposed. Initial output concise; review receipt when sent, then release.

Actual receipt follow-up:

> Actual bounded run exit3 at /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T110125Z/receipt.json (raw serial private, do not quote). Existing exact server15824/proc executable + pinnedSHA, host adb version0, host:version0029 and host:devices-l OKAY; exactlyONE transport state unauthorized. Lead stopped before sysfs mapping or any serial/shell property command, no device metadata. Actual runner115444 ended. Please inspect receipt for accurate limitation/operator next-step, return brief final review/release. Report draft will state owner Android USBdebugging trust action pending, not Linuxpermission diagnosis or APK failure. No repeat enumeration without confirmed owner action.

Rejected inferences: one visible transport means authorized access, A's Windows description means
Android model/OS have been inspected, host protocol/version is Android version, or this tablet
closes both phone gates. No product fix or human review is generated by this evidence.

Helper receipt review completed and allocation released: no scope violation observed; transport
unauthorized and all native gates remain open. It independently verified0600/0700 boundaries and
noted the original JSON omits the overall wrapper exit. Lead's actual command-tool result supplies
exit3, retained separately in `execution-observation.json`; no original receipt was rewritten.
Helper reviewed the receipt before this report addition existed, so no final report review is claimed.

## Passive authorization observation and owner-action follow-up — A154/A160

A154 permitted one passive state subscription through the existing server, capped at ten minutes;
an observed authorized state could enable the already-granted four metadata reads, without
inventing who accepted a prompt. D044 acknowledged before reacquiring only this report and ignored
readiness evidence. This is separate from the completed collector and does not change its source.
The [AOSP service documentation](https://android.googlesource.com/platform/packages/modules/adb/+/refs/heads/main/docs/dev/services.md)
describes tracking state changes on an open connection. The pinned installed binary contains the
long-format tracking service, and this actual server accepted `host:track-devices-l` with OKAY.

Exact ignored source: `output/native-acceptance/device-readiness/passive-state-listener.py`, SHA256
`00e882db619e467858e8d192d642c15a267e274d861af5e5017d84a4e308e147`.
Actual receipt:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T110540Z-passive/receipt.json`.

| Observation         | Actual evidence                                                                              | Disposition                                                |
| ------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Subscription        | PID119290/session19959, existing127.0.0.1:5037 server15824; one socket, one tracking request | PASSED passive connection; no polling/restart              |
| Only event          | 11:05:40.824576UTC, one transport matching the prior private serial, unauthorized            | BLOCKED authorized access; no subsequent event             |
| Completion          | 11:15:55.793624UTC, exit3, timed out; session ended and PID absent                           | BLOCKED; listener allocation released                      |
| Timing              | Start11:05:40.806677UTC, configured600-second monotonic deadline; actual UTC span614.986947s | FAILED strict600-second wall-clock bound; cause unverified |
| Remaining server    | Separate termination observation confirms15824 present                                       | Retained existing server; no new subscription              |
| Metadata/app/native | No serial-scoped property, package, install or UI request                                    | NOT RUN                                                    |

**D-EVID-002 / P3 evidence-control deviation:** on QAfb0a6b5, WSL host, the above exact listener
command `python3 -u output/native-acceptance/device-readiness/passive-state-listener.py` recorded a
UTC duration14.986947s beyond600s. Expected: the A154 listener ends within ten minutes. Observed:
configured monotonic timeout, socket timeout result,614.986947s UTC receipt span. Artifact: exact
receipt plus `termination-observation.json`. Suspected owner: D evidence runner; underlying cause
unknown. There are no recorded monotonic start/end timestamps to distinguish timer/scheduling/clock
behavior. **Retest NOT RUN**; no claimed strict-cap pass or second subscription. Future reuse must
address/verify that control; this is not a product/native regression. The actual final timeout,
no-authorization result and PID release remain valid observations.

A160 subsequently records the actual owner's response, “I tapped Allow”, and explicitly grants
one fresh bounded enumeration after the listener had ended. D047 acknowledged that evidence and
grant; the response does not itself establish authorized transport. Exact new ignored source:
`output/native-acceptance/device-readiness/read-authorized-metadata.py`.
Actual new receipt:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T111731Z-authorized/receipt.json`.
Its directory name describes the intended check, not a successful authorization result.

This one check verified the same retained server/pinned binary and received OKAY for `host:version`
(0029) and `host:devices-l`. **The returned transport list was empty.** WrapperPID129560 endedexit3.
D stopped before any serial-specific state/identity command, USB mapping or four-property read.
No package/install/UI/media request ran. D048 asks A to verify the actual current attachment and
owner connection state. The empty list does not diagnose physical disconnection, USB-mode changes,
Linux permissions, user rejection or an APK failure; no reconnect/restart is selected by D.
Original unauthorized, timeout and owner-action evidence remain separate and unmodified.

The helper was reused sequentially within D's quota1 for this new passive-listener scope; explicit
Astra/ultra launch settings were inherited, Fast/effective serving unexposed. Its exact new prompt:

> New bounded scope under A154, reuse D quota1. READ ONLY ignored /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/passive-state-listener.py and 20260912T110540Z-passive/receipt.json, no writes/device/socket/network/tests/descendants/status. Lead listener PID119290/session19959 active, one existing host:track-devices-l stream capped600s/128frames. Concrete independent question: verify it cannot start/restart ADB or select a different transport, preserves private identifiers, records actual state vs human acceptance, and terminates/records failures. Initial actual event one matching prior serial unauthorized, no metadata commands yet. Do not quote serial. Any issue advise lead, do not execute script. A154 permits actual authorized unambiguous event sufficient to resume four metadata fields but no APK/install/human approval. Lead handles stream/status/report, B owns tooling. Inspect only this new listener scope, not prior broad audit; return concise result then release. Requested Astra/Ultra already inherited from prior explicit launch, Fast/effective serving unexposed.

Helper source/initial-receipt review found no selection/privacy violation and verified0600/0700
permissions and matching script hash. It qualified that disk-write failure can prevent a final
receipt; this run did write one. The initial review did not observe termination. Actual follow-up:

> Final narrow receipt follow-up under same A154 scope, no execution/writes/descendants: /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T110540Z-passive/{receipt.json,termination-observation.json}. Actual listener119290/session19959 ended exit3/timed out; PIDabsent, existingADB15824 remains. Only initialmatchingunauthorizedevent, no auth or metadata. Important contrary timing: source configured600-second monotonic budget, receiptUTC11:05:40.806677→11:15:55.793624 =614.986947s. Do NOT claim strict10minute wall-clock cap pass or guess scheduling/clock cause; no monotonic start/end inreceipt to diagnose. Lead will record timing deviation, no secondsubscription. Please verify resulting evidence classification and concise concerns, then release. Do not quote realserial. Leadreport/status only, sourcecode unchanged.

The final receipt review independently confirmed the614.986947s duration, exit3, absence of an
authorized event and the need to leave strict wall-cap compliance failed. No cause was invented.
Owner-action check follow-up:

> New exact A160 result after actual owner viaA 'I tapped Allow': lead ONE fresh enumeration at /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T111731Z-authorized/receipt.json, ephemeral source ../read-authorized-metadata.py. Runner129560 exit3, pinnedexistingserver/host:version0029/host:devices-l OKAY, nowZEROrows. No serial/state/getprop/sysfs/package/install. READ ONLY receipt to verify no metadata claim or inferredcause; do not execute source/commands, quoteidentifier, writefiles, spawn. Lead routed D048 toA ownerhostUSBverification; no automatic retry/serverrestart. Need concise final review combining preservedunauthorized→timeout614.986947s→ownerAllowattributed→currentempty, then release. Lead updatescohesivereport; A/Bproduceractive separate.

Lead implemented only ignored, bounded evidence runners and this report. No product code, privileged
session, personal app data or user media was read or generated. Rejected claims include strict
wall-cap success, a guessed timeout cause, owner Allow proving technical authorization, or an empty
list proving disconnection. All APK/native/student/human acceptance gates remain unchanged.

Final owner-action receipt review completed and helper allocation released. It confirmed only two
host requests, empty metadata and zero transports; the intended-check filename is not acceptance.
No helper executed the listener, device queries or report validation. Lead's scoped formatting and
diff checks apply to the final report; the next device action awaits A's concrete attachment handoff.

## Restored attachment, same unauthorized transport — A164

A161 independently observed the Samsung still connected/shared in Windows while detached from
WSL. A's targeted restoration exited0 but the attachment was lost again; A163/A164 then recorded
Linux visibility during a45-second held Windows launcher. These are attributed A observations,
not a demonstrated cause or permanent attachment fix. D performed no host attachment operation.

D050 acknowledged A164 before reacquiring only this report and ignored readiness evidence.
QA was clean at `be9d1fa10c307eb69a75fc8d5ca4ee1f9021ba30`; frozen runtime5d is unchanged.
One new evidence-reader copy changes only the grant/current QA attribution from the preserved
A160 reader: `output/native-acceptance/device-readiness/read-authorized-metadata-A164.py`, SHA256
`69490aa78734fc0211d1ae736185ca7cfc4d31009835e0ded720f6a33490985d`. No collector or product source changed.

Actual receipt:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T112416Z-authorized/receipt.json`.
Runner136909 started `2026-09-12T11:24:16.177420+00:00`, ended `2026-09-12T11:24:16.193555+00:00`, exit3.
The existing server15824/pinned binary and host protocol0029 matched. The one fresh host list
returned **one transport with the exact prior private serial and state unauthorized**. D stopped
before serial-specific state/identity queries, USB mapping or any property/package/install/UI
command. Model, Android release/SDK, ABI and native acceptance remain **NOT RUN/BLOCKED**.

The actual owner Allow response recorded in A160 remains valid attributed action; the later
unauthorized state does not explain why access is unavailable or establish that the owner rejected
a prompt. D051 asks A to verify the current tablet trust/connection state. No automatic repeated
scan, new subscription, reconnect or server restart follows from this result. The receipt's
`-authorized` directory describes the intended check and does not override its BLOCKED status.

Lead performed this small follow-up without another helper or a repeated broad audit; prior helper
scope reviews remain separately attributed. No new student/human acceptance or Android device
identity is invented. Raw serial stays in the private ignored receipt, never this report or Git.

## Short dual-clock observation — A166

A166 explicitly authorized one new existing-server passive subscription with a120-second maximum,
both wall-clock and monotonic timestamps, and the same authorized-only property boundary. A asked
the owner to inspect any new RSA prompt after USB restoration; no new human response is inferred.
D053 acknowledged and reacquired only this report and ignored readiness files, QA d15663f/runtime5d.
The new separate runner uses a115-second observation budget to leave cleanup margin, checking the
earlier of both deadlines through at-most-one-second reads on the **same socket**. Socket read
waits do not send repeated device-list requests. The earlier runner and its timing failure are
unchanged; this does not retrospectively pass D-EVID-002.

Source: `output/native-acceptance/device-readiness/passive-state-listener-A166.py`, SHA256
`50f985930f1e1cd97527f96fef6d87622127e0b90e899bb1a8d0c53c6398492b`.
Actual receipt:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/20260912T112730Z-passive-A166/receipt.json`.

- PID142039/session13072 sent one `host:track-devices-l` request to retained server15824, OKAY.
- Only event:11:27:30.342161UTC, one transport matching the prior private serial, unauthorized.
- Finalization:11:29:25.324071UTC, exit3,115-second observation budget reached. Recorded wall
  duration115.001170158s and monotonic duration111.479130239s both recompute from the stored values.
  Their difference has no established cause. Finalization occurred within120seconds.
- The actual tool returned exit3. Separate `exit-observation.json` confirms the listener absent
  and existing server present at11:29:32.735763UTC,122.412855 wall seconds after start. That later
  check proves termination by the observation; it cannot establish a strict120-second process-exit
  pass or an overrun. The finalization timestamp precedes final save/print/exit.
- Device readiness remains **BLOCKED**. No authorized transition, property, package, install,
  native journey or human acceptance was observed. No additional subscription follows this result.

D055 published completion and helper/job release. An initial status-update helper command had a
literal-brace NameError before any write; the corrected status update succeeded without changing
original device receipts. This bookkeeping failure is separate from the actual observation.

Bounded independent helper reused within quota1; exact prompt:

> A166 expressly grants ONE new <=120second existing-server passive subscription with BOTH wall/monotonic timestamps. D currentQA d15663f/runtime5d. READ ONLY new ignored /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/device-readiness/passive-state-listener-A166.py and 20260912T112730Z-passive-A166/receipt.json; no writes/execution/device/socket/tests/descendants/status. Concrete question: review dual-clock115second observation budget inside120max, 1second waits on SAMEsocket (not network polling), exactpriorprivateidentity checks and result/timing attribution. New PID142039/session13072 active initialunauthorizedevent; original600sec variant/614.986947UTCfailure untouched. Lead handlesactualrun/report. Return any blockingfinding promptly, then finalreceipt when supplied; no inferredauthorization/promptactor/properties. RequestedAstraUltra inherited, Fastunexposed; preserveothers'work, B/APKreviewindependent.

Helper source review confirmed one fixed tracking request, exact identity rejection, matching
script hash/private modes and no reconnect/ADB execution. It qualified that the timer/finalization
field is not an external process watchdog; final disk writes or scheduling remain outside that
field's measurement. Final actual receipt prompt:

> Actual A166 completed exit3 via toolchunk e031a7; final receipt + exit-observation.json now in 20260912T112730Z-passive-A166. One initialmatchingunauthorizedevent only, no metadata. Receipt wall115.001170158s vsmono111.479130239s, finish11:29:25.324071; no causeinferred. FollowupPIDabsent check11:29:32.735763 /122.41285491wall-since-start is later than120 but does NOT prove actualprocessoverrun; finalizationwithin120 observed, exactprocess-exitwalltime notrecorded. Original600s/614.986947s failureunchanged. Please finalnarrowassessment/limitations/release withoutclaimstrictprocess-exitbound orhumanacceptance. No new subscription.

Final independent review recomputed both deltas, confirmed the above distinctions and released
without writes, execution or descendants. Lead wrote only the ignored runner and this report;
no product/source/collector change or student/human participation is fabricated. Rejected claims:
one-second local waits are repeated ADB requests; configured timeout proves process-exit timing;
clock difference identifies its cause; unauthorized observations establish a native app failure.
All completed evidence and helper allocation are released after scoped report checks/commit;
only the existing ADB server and D status writer remain held for the next actual handoff.

## Selected T014 narration contract review — A172 draft63c492d

This is an independent **pre-implementation contract review**, not a new product/native regression,
a listening session or approval to release features. A172 grants only read-only contract/direct-seam
inspection and D's report/ignored evidence. D058 acknowledged board61 before writing. Exact canonical
HEAD at capture: `6076dbad634d9be1cb6266df89a539ac3cdc4121`; the contract is an untracked draft with
SHA256 `63c492da6472ca3d5657225247f41d66ef424bf2127128d118437b754e762a17`, not yet a committed
implementation authority. Snapshot and five Spec amendment diff/receipt are retained under
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/contract-review/T014/draft-63c492d/`.
QA source remainsacb962f; the active baseline APK build remains5d8a3e8 with no narration import.

A170/C060 records all three exact Wiam clips approved by the actual user for wording/pronunciation/
delivery; D does not request those approvals again or claim to have listened. The draft names the
three supplied hashes and body-only transcript IDs. English is complete and silent. C separately
owns current export-plan/rights intake; user quality approval does not establish native execution,
named student review or public distribution rights. No provider, microphone, persisted preference,
authentication or progression authority is added by this selected story.

Read-only evidence: draft lines70–85 specify the pure controller,103–132 the context and native-event
adapter,141–150 the required tests. Existing app/index.tsx180–181 already reads aggregate generation
and epoch; current caller278 does not yet pass them. Existing DemoEntryScreen Back/profile/locale
callbacks and keyed AccessScreen were inspected, preserving the ordinary narrator's separate
existing behavior. Installed Expo status includes player `id`/`isLoaded`/`playing`/`error`; no native
playback was executed. No source, contract or test file was edited by D.

| ID / priority / kind            | Concrete challenge on draft63c492d                                                                                                                                                                                                                                        | Requested owner decision / evidence                                                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-T014-001 / P2 contract        | Lines73–76 recheck revision before calling isAllowed; a guard can synchronously cancel/fail/dispose then returntrue. A successful onChange callback can also invalidate without throwing. Checking only before that callback can still allow the old play/next operation. | A: revalidate revision/disposal/failure after externally supplied synchronous callbacks/guard return and before further player operations. Pure tests must include successful reentrant invalidation, not only thrown callbacks. Implementation NOT RUN.                                      |
| D-T014-002 / P2 contract        | Lines127–130 specify background events and fail-closed SR detection, but do not explicitly define unknown initial foreground state or failed AppState subscription. Installed RN AppState.currentState starts nullable.                                                   | A: allowed predicate requires known active foreground; synchronously revoke permission/cancel before publishing React state; unknown initial state or failed foreground observation stays silent. No automatic foreground resume. Implementation NOT RUN.                                     |
| D-T014-003 / P2 validation path | Lines145–150 require mounted effect tests while forbidding new dependencies. Actual Vitest environment is node; existing demo presentation tests137–143 explicitly use React server rendering only.                                                                       | A: name a feasible existing browser/ReactDOM mounted harness and its exact paths/preview slot, or leave mounted rows BLOCKED pending a concrete tooling decision. SSR or a hand-built fake hook dispatcher cannot establish mounted effect wiring. No dependency installed/test written by D. |

D059 published these concrete clarifications to A. Node module-resolution inspection exited0:
react-dom/client resolves; react-test-renderer, jsdom, happy-dom, both testing-library variants,
react-reconciler and @vitest/browser do not resolve from the canonical project. Their optional
references/types in the lockfile do not establish an installed runtime. Repository-provided browser
tooling remains available under the serialized preview grant; a package-resolution result does not
prove that no browser harness can be built. No browser/native slot or new package was requested by D.

A174 independently identifies the typed publication seam: required generation/epoch/copy fields
must land coherently with caller/resources/current typed fixtures. D supports A owning that small
preparation slice, then explicitly releasing types/fixtures to C; an optional narration prop may
preserve the silent story until C wires the controls. This is an integration-order recommendation,
not an overlapping source reservation or permission to leave the final lifecycle props unbound.

Acceptance matrix for the selected narration work:

| Owner / evidence row          | Required observable result                                                                                                                                                                                           | Current status                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A T014a / pure controller     | No construction autoplay; Play/Replay only; fixed player operation ordering; failures settle without unhandled rejection; cancel/dispose/guard/callback reentrancy cannot start stale work                           | NOT RUN; clarification001 pending                                                       |
| A/C / per-player pending work | Repeated Play coalesces; cancelled old seek retains its lock; source/context replacement cannot cause overlapping seeks on one player or permit old settlement to alter new state                                    | NOT RUN; existing universal invariant, not a separate defect                            |
| C T014b / mounted wiring      | Back/close/finish/step/locale/profile cancel synchronously; generation/epoch/unmount cleanup invalidates pending work, including settlement before a later passive effect                                            | BLOCKED on concrete mounted evidence path, then implementation                          |
| C / foreground and SR         | Known permitted foreground/SR state only; thrown/rejected query or failed observer stays silent; new SR event wins over late initial query; cancellation precedes state publication; no resume on disable/foreground | NOT RUN; clarification002 pending                                                       |
| C / player status             | Match current player/source/context; loaded native status alone establishes playing; error cancels/unavailable; completion changes no story, profile, Seeds or replay                                                | NOT RUN                                                                                 |
| A/C / content and absence     | Exact three supplied hashes map to current AR body transcripts; EN/absent media complete and silent; full text and navigation remain usable during loading/error                                                     | NOT RUN after copy/integration; actual user clip quality approval attributed separately |
| A / integration               | Compatible required types, route aggregate props, bilingual resources and typed fixtures; ordinary narrator/tests unchanged; no new dependency or progression/session authority                                      | NOT RUN; A174 preparation order accepted in review                                      |
| D/B / exact artifact/native   | New runtime and APK identified separately from5d; actual AR touch/RTL/TalkBack, Back, background/audio interruption and playback/error/Stop on authorized hardware                                                   | BLOCKED; no corresponding APK or authorized device                                      |

Sole initial helper `/root/narration_contract_privacy_review`, explorer explicitly launched
Astra/ultra; Fast/effective serving unexposed. It owns read-only guard/reentrancy/privacy analysis;
lead owns foreground/SR/event wiring and evidence feasibility. Exact prompt:

> D's solehelper board61/A172, READ ONLY, no writes/descendants/tests/Gradle/browser/device/provider/network/install. You are not alone; preserve allothersfiles. Concreteboundedquestion: challenge ONLY pure DemoPlaybackController guard/callback reentrancy, outstanding seek/cancel/fail/dispose semantics and source/player/principal generation/epoch privacy boundaries in exact draft snapshot /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/contract-review/T014/draft-63c492d/demo-narration-v1.md SHA63c492da6472ca3d5657225247f41d66ef424bf2127128d118437b754e762a17. CanonicalHEAD6076dbad634d9be1cb6266df89a539ac3cdc4121/runtimeAPK5d8a3e8 unchanged; draftnotimplemented. Read directly relevant existing seams in /home/smyk/projects/Ghaf/src/features/onboarding/playback.ts, components/onboarding, components/demo, app/index.tsx, aggregate generation/epoch ifneeded. Do notduplicate lead's SRquery/eventrace/nativeUIwiring or mountedtestfeasibility review, A'scompletedExpoAPIseamreview, or broadbaselineaudit. Return ONLY materialcontractambiguities/defects with exactlines and concreteadversarialsequence, versus alreadycoveredrequirements; no productfix/sourcegrant. Userapprovedall3exactARWiamclips; qualitynotreopened, nohuman/nativeclaim. AaloneamendsSpec/contracts; Dleadwritesownreport/status, helpernevercoordination. RequestedAstra/Ultraexplicit; Fastunexposed. Useboundedfile reads only, neverexecuteapp/sourceunderreview. Finishconcise/release.

Helper independently confirmed001. It explicitly rejected two extra diagnoses: a separate principal
field is not inherently missing because the aggregate epoch already changes on handoff; the universal
per-player no-overlapping-seek invariant already covers replacement instances and must be tested
rather than reported as a separate missing contract. No helper product/source/test write occurred.

### Android focus/foreground resumption — D-T014-004

**P2 contract gap; native execution NOT RUN.** The same exact draft123–132 requires no automatic
resume after cancellation/foreground restoration. The independent helper found installed Android
implementation behavior that the proposed pause-only cancellation cannot disarm:

- `node_modules/expo-audio/android/src/main/java/expo/modules/audio/AudioModule.kt`88–128 sets
  an internal paused marker on transient focus loss (and the default duck-loss branch), then calls
  `playable.play()` directly on focus gain. The exposed pause483–486 only pauses the underlying
  reference and does not clear that marker.
- The same file286–319 marks playing instances paused on background and restarts them on foreground
  when background playback is disabled. Consequently Play → interruption → JS Stop → focus gain,
  and background → cancel → foreground, can bypass the pure controller's revision check.
- Native initial interruptionMode is null61 and requests focus143–155. The TypeScript-documented
  mixWithOthers default cannot be assumed to describe untouched Android initialization. Explicit
  mixWithOthers avoids requesting focus and therefore does not establish stopping on interruption.
- `AudioModule.types.ts`278 exposes generic playback-status events, and `BaseAudioPlayer.kt`79
  emits playing changes. `AudioPlayer.kt`194 returns null waiting reason. No dedicated focus reason
  is exposed here. A reactive pause after an unexpected playing event cannot prove that no audio
  already resumed. keepAudioSessionActive is not an Android solution.

D060 asks A to specify an existing-API player-ownership mechanism that actually disarms/retires
native resume eligibility before claiming the promise, with fresh explicit intent required for a
new start. The pure controller/adapter ownership and removal boundary must agree. D proposes no
SDK/dependency patch, global audio-mode change or new library. The exact interruption → Stop → gain
and background → cancel → foreground cases belong in the acceptance matrix, separately labelled
source, mounted and actual native evidence. No native result is inherited from these source reads.

The relevant installed/source file hashes are retained in `supporting-source-identities.json` next
to the draft snapshot. A owns the resulting contract revision and any subsequent source grant.
Actual additional helper prompt:

> One additional disjoint exact code question under sameA172/quota1, read-only/no execution/writes/descendants: installed canonical node_modules/expo-audio/android/** + immediately relevant TS defaultaudiooptions. Does current Expo57 player automatically resume on Android audiofocus gain after transient loss or duck under default configuration, without explicit Play/Replay? If yes, what concreteexisting option/status/event seam supports contract's noauto-resume/no-background/interruption expectations, and is draft63c492d explicitenough? Do NOT repeat API signatures/A'searlierseamreview or broadenintoOSaudiodesign. User nativeacceptance includesaudiointerruption; don'tinventobservednativebehaviorfromsource. Return exactlines/limitedsuggestion; leadwritesmatrix whileyouread. SamefrozenAPK5d/draftnotimplemented, private/progression scopeunchanged. Finish/release.

Helper completed and released with exact source lines and the limited mechanism assessment above.
Lead accepted those substantiated findings and rejected assuming a documented default, pausing
reactively, or disabling focus callbacks as proof of no native restart. All four D-T014 items are
pre-implementation contract/evidence findings, not fixed runtime defects. This draft review is
complete and ready for A's corrections; implementation, mounted/native execution, student review
and public rights remain separate. The frozen5d APK build continues independently.

### A175 revised draft — closure limited to contract text

A175 publishes exact revision SHA256
`2be2c77223dc3d6bf09142354026f15fcd10a5aece823d76df9e7f1d8809ba09`.
D independently compared it with the preserved63c492d snapshot; the new snapshot/receipt are in
`output/native-acceptance/contract-review/T014/revision-2be2c77/`.

- D-T014-001: **CLOSED for contract clarification only**. Request identity/lock precede external
  callbacks; the contract now requires before/after guard/callback checks, rechecks after pause
  and loading notification, and tests successful reentrant cancel/fail/dispose/restart.
- D-T014-002: **CLOSED for contract clarification only**. A known active AppState is required;
  unknown state/failed observation or subscription fails closed, with permission refs and
  invalidation preceding React publication.
- D-T014-003: **The evidence gap is explicitly bounded; mounted execution remains BLOCKED.** A names
  an existing Metro/ReactDOM/Playwright harness in C's ignored lifecycle directory, requiring a
  concrete plan/preview allocation. No new dependency, SSR-to-mounted promotion or fake dispatcher
  pass is selected. That future harness has not been executed or proven feasible yet.
- A's required type/caller/resource/typed-fixture publication and later explicit C transfer are
  now coherent. Optional presentation controls preserve the silent preparation slice; this does
  not waive final scope binding. Free-plan provenance is recorded, with C's rights review separate.
- **D-T014-004 remains OPEN**: this revision still relies on pause/controller invalidation without
  specifying how the installed native resume marker loses authority. A owns that correction.

No source implementation or tests were run for these closures. The supporting helper allocations
are released; lead alone reviewed the revised text. This cohesive initial/revised contract evidence
is ready for integration while the concrete native-stop contract remains under A review.

### A177 retirement revision — bounded technical preparation review

D062 acknowledged board62 and reacquired only this report plus the ignored revision snapshot before
writing. Exact draft SHA256 is
`f452d25d10a4d451b39f9dddc4b14dc9d08d0ff56253df3e55c072bf9812aa69`, independently captured at
2026-09-12T11:52:59.837084+00:00 from canonical HEAD
`4e7540d1430d5dbb325160337cfad3e257287649`. QA was clean at91f988f; the draft was untracked,
not a source implementation grant. Absolute snapshot and receipt boundary:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/contract-review/T014/revision-f452d25/`.
The comparison against preserved2be2c772 exited1 because the contract text changed; that expected
`diff` result is not a failed validation command. A178 attributes integration of the prior D report
91f988f asd6b48c7. Frozen5d8a3e8 and B's active A171 APK build remain separate.

The lead reviewed the concrete change in status and failure handling, without repeating the earlier
SDK API or Android audio-focus source audits:

- Lines131–137 allocate no player until explicit Play/Replay and bind a fresh player/controller to
  an immutable source/locale/step/generation/epoch token. Pending input coalesces; retired players
  cannot be reused. This prevents hook-owned automatic source allocation from being mistaken for
  an explicit narration request.
- Lines140–147 require matching token and player ID, with playing, loaded and non-buffering state.
  That state is player-reported playback, not evidence of audible output or Arabic quality. The
  startup deadline is10,000ms from the accepted intent, with no queued retry; stale timers/events
  cannot retire a later session. Observed interruption and normal completion retire the session.
- Lines149–154 invalidate the token and clear the active slot before independent cleanup attempts.
  A pause, cancellation or subscription-removal exception cannot skip subsequent removal/release.
  Fresh intent allocates another instance; source checks or mocked removal do not prove native
  release scheduling or uninterrupted silence.
- Lines170–185 explicitly preserve the captured-reference/native-focus race, Android's null error
  reporting, and web's discarded underlying play promise. The deadline supplies bounded startup
  fallback; it does not prove exhaustive decoding-error notification or absence of resumed sound.
- Lines124–127 preserve full transcript and immediate navigation/Stop during loading, with a new
  screen-reader reason seam. English, unavailable detection and rejected permissions remain silent.
  No media, preference, session, progression or Child-private content persistence is added.

The exact execution matrix for this revision remains:

| Required evidence / owner        | Result required                                                                                                                                                      | Current result                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A pure controller                | Reentrant guard/callback cancellation, failed operations, pending seeks and disposal remain inert after invalidation                                                 | NOT RUN for the proposed implementation; earlier contract clarifications001/002 remain closed |
| C actual mounted adapter         | Fresh intent only, current token/player matching, startup timeout, stale events/timers, independent cleanup failures, Back/locale/profile/reset/unmount cancellation | BLOCKED pending implemented adapter and the concrete existing-tool harness/preview grant      |
| C status and silent fallback     | Full transcript, equivalent labels, readable English, screen-reader failure silence, immediate Stop/navigation; no optimistic playing                                | NOT RUN for the proposed adapter                                                              |
| D/B actual new APK               | Exact asset hashes and new source/build identity, distinct from the frozen silent5d artifact                                                                         | BLOCKED; no corresponding completed APK                                                       |
| D actual Android interruption    | Play → transient focus loss → Stop → focus gain, plus background → cancellation → foreground; no resumed audio without new explicit intent                           | BLOCKED; no authorized native execution, captured-reference race remains unproven             |
| D actual hardware media failures | Actual load/decode failure, interruptions and permitted Stop/Replay with app navigation still usable                                                                 | BLOCKED; synthetic status.error tests cannot establish Android's absent native error callback |
| Human review                     | Preserve already recorded user approval of all three exact Wiam clips; separately identify native listener/student reviewer and scope                                | User quality approval attributed to A/C; D listening NOT RUN, student review PENDING          |

A180 may prepare the previously reviewed pure controller/shared types/assets under its committed
contract and own grants. This review does not grant C source ownership, a preview, native builds,
public distribution or release activation. A owns the exact contract commit and subsequent transfers.

The sole helper `/root/narration_contract_privacy_review` completed and released its independent
cleanup/ownership review. The retained helper was originally launched with explicit Astra/ultra;
Fast/effective serving remains unexposed. Actual follow-up prompt:

> D sole helper under board62/A177, exact revision snapshot /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/contract-review/T014/revision-f452d25/demo-narration-v1.md SHA f452d25d10a4d451b39f9dddc4b14dc9d08d0ff56253df3e55c072bf9812aa69, canonical HEAD4e7540d / QA91f988f / frozen APK runtime5d. READ ONLY, no writes, descendants, execution, tools/build/browser/device/provider jobs. You are not alone; preserve others' work. Bounded question: does new adapter retirement order/token invalidation/independent cleanup exception handling/fresh-intent player ownership coherently address your prior D-T014004 pause-only reuse finding, while explicitly retaining native captured-reference/focus races as unproven gates? Look only for new material cleanup/reentrancy ambiguity in exact contract, not repeat A's installed remove/release API audit, your earlier Android focus source audit, or broad privacy review. Lead separately checks UI/status/startup timeout/evidence gates. Return limited technical preparation verdict with exact contract lines, remaining native limits and any genuinely new blocker; no implementation/native acceptance, no product fix, no public rights ruling. Existing helper explicit Astra/ultra request retained, Fast unexposed. Finish/release.

The helper independently found no new blocker in that boundary and confirmed token invalidation
before guarded cleanup, fresh ownership and preserved callback checks. The lead accepts that
bounded conclusion. Rejected claims: successful remove/release proves no native audio blip; a
synthetic error event establishes Android decode-error reporting; controller unit tests establish
mounted effect wiring; user clip approval establishes public rights or native listening. No student
understanding or participation was inferred.

**D-T014-004: CLOSED for the contract's pause-only ownership correction; actual no-resume acceptance
remains BLOCKED.** D's technical preparation review of exactf452d25 is PASSED with the stated
limits. Every adapter cancellation entry must execute the full retirement path, including native
Back, background and screen-reader events; passing only the pure controller's pause is insufficient.
This is an implementation acceptance row, not another API redesign request. The stronger native
requirement has not been waived, weakened into a source pass or proven by this report.

This report-only boundary is ready for A integration after scoped format/diff checks. No product
source, test, asset, dependency, device or APK mutation was performed. Completed snapshot and helper
allocations are released with the commit; D retains only its status writer and existing ADB15824,
and continues to the published APK or next exact integrated candidate.

### A187 published preparation fa9821c — independent source conformance

**PASSED for bounded source-contract conformance; no material defect substantiated.** This is not
an implementation test execution, mounted lifecycle pass, audible playback or native acceptance.
D064 began read-only review after A186 published exact candidate
`fa9821c68eb80985b690f5551fee08c7c9cdcd33`, governed by accepted contract40a6299. D065 acknowledged
A187/board64 and reacquired this report and the exact ignored evidence boundary before writing:
`/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/contract-review/T014/source-fa9821c/`.
QA stayed on887cdf2, with no source synchronization. The Git-object snapshot receipt records four
commands, individual PIDs/UTC/exit0/hashes and source paths; runner181490 completed. It preserves
controller/tests/accepted contract and the shared-publication diff rather than inspecting a later
working-tree edit. Frozen5d8a3e8 and B's A171 APK build contain no new narration implementation.

The lead independently inspected the actual route/type/resource delta:

- `app/index.tsx` already reads `demoRunGeneration` and `demoEntryEpoch` from the aggregate at180–181.
  New props at284–285 pass those same values directly to DemoEntryScreen; no replacement authority
  or persisted principal is created. Existing role redirects and guarded entry command remain intact.
- Required type fields and all five AR/EN audio labels land with their caller and typed fixture.
  The story narration prop remains optional. At this exact commit, Git search found no runtime
  import of demoPlayback or the new demo audio paths; the prepared source slice remains silent.
- The added route test explicitly inspects a later epoch after sign-out and a later generation/epoch
  after reset, comparing them with the actual aggregate and checking absent authority. D inspected
  that test's content; the49 shared-test passes remain A's attributed execution.
- Independent `git show` blob reads and SHA256 calculation matched all three accepted audio hashes:
  together245805bytes, support379551bytes, growth366177bytes. Command tool receiptf684fa exited0.
  This establishes committed byte identity only; no decoder, speaker, listener or device was used.
  New control-label editorial review remains pending; prior user clip approvals are retained.

The sole independent helper reviewed actual pure-controller code and its tests, not another broad
SDK or contract audit. It found no material implementation defect in the selected boundary:
controller95–125 rechecks current identity after guard/observer callbacks and locks before external
calls;128–134 retains the pending lock through settlement notification;54–92 and143–149 contain
observer/pause failures, prevent stop-time rearming and suppress disposed observers. Existing tests
98–203,205–351 and384–462 include successful reentrant cancellation/failure/disposal/restart,
stale exceptions and rejected seeks, repeated cancellation and disposal. Those are source-inspected
cases, not independently executed tests in this review.

Actual prompt to the retained explicit Astra/ultra helper; Fast/effective serving unexposed:

> D sole helper board64/D064, independent READ-ONLY published exact source fa9821c68eb80985b690f5551fee08c7c9cdcd33 against accepted contract40a6299. You are not alone, preserve others' work. Concrete bounded review: git show this exact commit's src/features/onboarding/demoPlayback.ts and tests/demo-playback.test.ts; challenge actual pure-controller cancellation/disposal/guard/onChange reentrancy and seek-finally failure behavior against accepted contract. A reports44 tests passing; don't rerun or assume their pass covers adversarial paths. No writes, descendants, tests/code execution, source sync, browser/build/device/network/provider. Lead independently checks changed route generation/epoch and typed publication; don't review UI or repeat earlier SDK/contract audits. Return only material substantiated implementation findings with exact lines, concrete callback sequence, whether existing tests cover it, or bounded no-finding verdict. Distinguish synthetic port reentrancy from actual native bug, no fix. Source-preparation commit not full feature/native pass. Same explicit Astra/ultra request; Fast unexposed. Report only to D, never shared status; finish/release.

Helper `/root/narration_contract_privacy_review` completed/released with no writes, descendants or
application/test execution. Lead accepted its bounded no-finding result. Rejected promotions:
44 prior passing tests prove every adapter lifecycle path; a new source commit inherits5d full
checks; exact MP3 bytes establish audible quality or public distribution rights; absent runtime
imports establish that the future C adapter works. No student understanding was inferred.

| Evidence on fa9821c                        | Disposition                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| D source/controller/shared-boundary review | PASSED in the bounded inspected scope; no material finding                                                              |
| D independent committed audio identity     | PASSED,3/3 accepted hashes; no listening                                                                                |
| A pure controller/shared test execution    | Attributed PASSED44+49; no D rerun                                                                                      |
| A limited full TypeScript attempt          | FAILED to complete:768MiB Node heap exhaustion, exit-6 at12:01:08 perA185; no TypeScript diagnostic or pass established |
| Mandatory new-candidate static/full checks | BLOCKED on serialized resource allocation after B; no heap-increase retry by D                                          |
| C adapter/mounted lifecycle                | NOT RUN for this source slice; adapter is a separate later candidate and mounted evidence remains BLOCKED               |
| D APK/device/native/human rehearsal        | BLOCKED/NOT RUN; no corresponding artifact or native execution,0/10 human rehearsals                                    |

All source, test and asset files remained read-only. No new defect or fix grant is requested.
The report and source-fa9821c evidence are ready for A integration/release after scoped report
checks; D continues to B's actual published APK and C's later integrated adapter candidate.

## September12 poster handoff — A194–197 priority

A194 supersedes the earlier native/harness order for the user’s poster deadline. A195 grants D
only this report and ignored `output/native-acceptance/poster-20260912/**`; D067 acknowledged
board66 before writing. QA remains880e868, with no product/source synchronization or design edit.
A/C own the presentation changes, canonical preview and sole browser; D will inspect their actual
captures without starting a second browser. The optional mounted narration harness is deferred.

A197 reports that the user-supplied official finalist email confirms qualification and specifies
**A1 portrait PPT/PPTX, due20:00 Asia/Dubai on September12**. This supersedes the earlier unknown
qualification state **with attribution to A’s email review**. D has not inspected that email;
team/student names, poster language, attendance and submission remain with A/user. No student
participation, exact-diff approval, Arabic review or device evidence follows from qualification.

The independently reviewed copy/shot packet and explicit empty capture manifest are available at:

- `/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/poster-20260912/packet.md`
- `/home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/poster-20260912/capture-manifest.json`

Reference runtime is0d23b8eeec27c11d570139fac6db48b5b7550401. A/C visual changes are in progress;
that reference cannot identify their later final screenshots. The manifest currently contains
**zero images / six planned AR/EN rows NOT RUN**. It requires the actual integrated source, loaded
source proof, URL, viewport/DPR, principal/state, interactions, UTC/operator, original path/hash and
D review. Prepared mock harness images and historical screenshots are not current product captures.

Concise screenshot and caption map, using existing canonical `demoEntry` resources:

| Priority / actual state                      | Existing Arabic / English caption                                         | What the image may support                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1 / signed-out demo entry                    | خطوة صغيرة، ننجزها معًا / A small step, done together                     | Three synthetic profile choices, readable demo and Salem-only task disclosures                   |
| 2 / Parent Home                              | راجع المهمة وقدّم الدعم / Review the task and offer support               | Actual Parent route, selected Child and visible task/support actions                             |
| 3 / Salem Today after Parent approval        | جرّب المهمة واطلب المساعدة / Try the task and ask for help                | Correct Child, approved task, displayed +12 and permitted Help action                            |
| Optional / actual confirmed result or Garden | نقدّر الفعل، ثم تنمو الحديقة / Recognize the action, then grow the garden | Only the genuinely captured completion/confirmation/praise sequence and resulting symbolic state |

Proposed supporting English copy, an AI drafting contribution for A’s editorial selection:

> A Parent approves a task, such as sorting clean recyclables with adult supervision. The Child
> can ask for permitted help without losing the agreed award. The Parent confirms completion
> and praises the action; Seeds and private symbolic garden growth follow.

Keep **Browser preview · Synthetic demo data** with screenshots. Prepared task-focused AI examples
may be inaccurate; symbolic garden growth is not measured environmental impact. This wording is
not a named human/editorial approval. Exact existing Arabic headings are reused; D supplied no
new Arabic translation. A static baseline view cannot prove award transitions, idempotency,
privacy enforcement or persistence. A completed result capture must distinguish default Seeds48→60
and Mangrove48/60→60/60 from the optional lifetime/Reward108→120 fixture. Restarting the isolated
demo begins a fresh run; recovery014 remains deferred. Do not advertise live inference, recording,
synchronization, production accounts, measured impact or native/rehearsal acceptance.

D’s sole helper `/root/poster_claim_review`, ghaf-demo-qa-agent explicitly launched Astra/ultra,
completed/released read-only claim review. Fast/effective serving is unexposed. It required praise
before growth, a concrete supervised recycling example, task-specific+12, a separate actual result
capture and the explicit restart limitation. The lead incorporated all five. Rejected claims:
Parent approval proves automated safety assessment; baseline screenshots demonstrate completion;
all tasks award12; narration controls prove native audible playback; later visual edits inherit
reference0d23b8e identity. No files, tests, media, device/network actions or descendants were used
by the helper. Exact prompt:

> Session D sole helper under board66/A194–195. You are not alone; preserve others' edits. READ ONLY; no writes, descendants, coordination edits, tests/browser/native/device/provider/network jobs. Concrete bounded task: review a concise poster screenshot/capability map for misleading claims, using only canonical /home/smyk/projects/Ghaf/docs/competition-readiness/coordination/BOARD.md current poster priority, native-batch/shared-contract.md, and current source copy src/i18n/resources.ts + D report /home/smyk/projects/Ghaf-qa-rehearsal/docs/competition-readiness/workstreams/d-native-acceptance.md if needed. Runtime integrated0d23b8e, canonical docs HEADb93935e; A/C new presentation edits in progress, no final capture candidate yet. B APK frozen5d still building; TabS4 last unauthorized, no physical/native passes,0/10 human rehearsals. Recovery014 deferred. Do not repeat broad contract/source audit or research rights already resolved/pending. Proposed short factual claims: Parent approves a safe task; Child can ask for permitted help without losing its agreed +12 award; Parent confirms completion; Seeds and private symbolic garden growth follow. Default Seeds48→60 and Mangrove48/60→60/60 distinct from optional108→120 reward fixture. AI assistance uses local prepared examples and may be inaccurate; no live inference/sync/measured environmental impact. Screenshot selection: actual final integrated demo entry, Parent Home, Salem Today; optional separate garden only if truly captured. Every image must bind source/URL/viewport/locale/interaction/state, label browser preview + synthetic data, never pose as device evidence. Use existing canonical AR/EN headlines only; no invented translation/human approval. Lead independently prepares exact shot priorities, caption map and manifest in assigned ignored poster-20260912 directory/report. Return only material wording/evidence pitfalls and a bounded verdict; no new product/design edits or extra features. New source may show audio controls but source/button presence is not audible/native/media rights acceptance. Requested explicit Astra/Ultra; Fast selector unavailable. Report only to D, then release.

### Frozen APK build stop — preserved contrary evidence

B102/A196 report that A171T4DtZl ended with wrapper exit75 at12:24:55.088411UTC after the
sustained-paging guard triggered12:24:52.726667UTC. D read the actual
`/home/smyk/projects/Ghaf-demo-systems/output/native-build/20260912T113307Z-build.T4DtZl/full-build-summary.json`:
three correlated samples record available29.463→28.582→28.345percent and paging deltas2279→3859→5843,
ending in sustained_paging; `apk_files` is empty. The raw Gradle terminal code was **NOT RECORDED**
on that stop path; do not substitute wrapper75 for it or infer a signal, compiler error, OOM or
normal build completion. Source/Java/Kotlin/bundle/native-task progress is not an APK gate pass.
B separately reports all2565 captured PIDs absent12:25:45.518917UTC and releases heavy/observer/jobs;
D attributes that cleanup result rather than claiming to have re-audited all consumers.

A197 restores one canonical actual-app Metro8081, PID203040, for poster capture after that release.
D does not start a browser, query the tablet, retry the build or alter caches/guards. APK inspection,
installation and native journeys remain BLOCKED/NOT RUN; rehearsals remain0/10. The poster packet
preparation is complete and releaseable after scoped checks, while actual screenshot review remains
NOT RUN pending A/C’s exact integrated capture handoff. No submission or public release is authorized.

Poster preparation integrity check exited0 at12:30:37UTC: JSON parses, six planned IDs are unique,
all artifact/candidate fields remain empty, and12 AR/EN caption strings occur verbatim in the
exact0d23b8e resource blob. `preparation-receipt.json` records file hashes and zero actual images.
Scoped report Prettier/diff checks passed. This is document integrity, not an app test or screenshot
pass. A200 acknowledges receipt of the packet; final image/candidate review remains the next task.

### C080 actual before frames — independent image/source review

A201 re-grants D's report and existing poster directory for actual capture review. D070 acknowledged
board68/C080 and clean QA39620b8 before writing. C published four Entry/Story AR/EN browser images
at390×844, DPR1, reduced motion, **before C's A194 composition**. C's source receipt names canonical
`4b685438aceea767f35c0b47c9e9f18a84396823`, Metro203040 and Firefox207767. These are actual-app
browser captures attributed to C, not D pointer actions or physical-device evidence.

Original files and source receipt are in
`/home/smyk/projects/Ghaf-ui-studio/output/native-ui/poster-20260912/`:
`before-entry-{ar,en}-390.png`, `before-story-{ar,en}-390.png`, `before-source-receipt.json` and
`before-source-map.json`. D independently recomputed source-map SHA256
`514e60797021b472268d5d71334170447c5a8ea22c5f2ae8ded67a7bac2d4337` and compared all four inspected
emitted source contents with their exact4b685438 Git blobs: DemoEntryScreen, DemoOnboardingStory,
ChildTodayTaskCard and ParentCanopySummaryCard all match. This is a four-module identity check;
it does not prove every module, flag or browser interaction. Parent/Child source matches do not
create absent Parent/Child screenshots. All four PNG dimensions/hashes were independently recorded
in D's `before-identity-review.json`; commandcb933e exited0 at12:41:04UTC.

D viewed all four images; its sole helper separately reviewed the two Arabic frames. Visible Entry
headlines, synthetic-data disclosure, Parent/Salem/Alya choices, Salem-only task limit and restart
notice are readable in both locales. Story step2 shows the complete help/full-award/prepared/fallible
AI/Parent-support paragraph and narration-unavailable notice. English Back lies partly beyond the
bottom viewport; Arabic Back sits near the lower edge but is visible. D did not exercise scrolling
or touch, so neither observation is a demonstrated reachability or layout-clipping defect. The
Arabic Entry has a visible blue rectangular heading outline; its cause is not established and it
is not a text-clipping diagnosis. Preserve the baseline original and capture an actual settled
state for the final poster, without disabling accessibility behavior in source.

**PASSED only for observed visible-label readability and the bounded identity checks.** No product
fix is requested. The help-story frame alone lacks the entry's synthetic-data/restart context; use
an appropriate surrounding caption if presented separately. It does not demonstrate the other
story steps or a completed task/growth transition. Final C composition, DPR3 print images,320-width,
large-text, native RTL/TalkBack/Back/media, actual D browser actions and named human review remain
NOT RUN. `before-visual-review.json` preserves these limits; the final screenshot manifest remains
unpopulated until the exact final handoff.

Actual follow-up prompt to the existing explicit Astra/ultra helper, Fast unexposed:

> D sole helper A201/C080/D070, board68. Actual C BEFORE captures available; review READ ONLY two exact files /home/smyk/projects/Ghaf-ui-studio/output/native-ui/poster-20260912/before-entry-ar-390.png and before-story-ar-390.png using view_image, and before-source-receipt.json if needed. Canonical source4b685438aceea767f35c0b47c9e9f18a84396823; 390x844 CSS/DPR1/reduced motion. These are pre-A194 Entry/Story, NOT C's new composition or final DPR3 poster images. You are not alone; preserve all files. No writes, descendants, tests, app/browser/native/device/media recording. Concrete independent question: are visible critical Arabic task/help/fallibility/restart/synthetic-data labels and navigation readable and complete in these actual frames? Separate viewport/scroll boundary from a demonstrated clipping defect; no D-R03-like glyph diagnosis without evidence. Lead independently reviews English pair and verifies source map/commit hashes. Report actual observed frame-only findings and poster-use limits; do not pass native RTL/large text/Back/TalkBack or claim final capture/source identity. No source redesign suggestions; C already owns the composition. Existing explicit Astra/ultra, Fast unexposed. Return bounded result then release.

Helper `/root/poster_claim_review` completed/released with no writes, descendants or browser/device
execution. Lead accepted its readable-visible-copy finding and rejected promoting it to a native,
interaction or final poster pass. A204 subsequently selects **English main images with Arabic review
counterparts**; A202 specifies390×844 CSS/DPR3, DPR2 if constrained. D updated the live packet and
planned manifest accordingly, preserving their earlier bytes as `packet-pre-A204.md` and
`capture-manifest-pre-A204.json`; `packet-update-A204.json` records new hashes. App default locale
is unchanged. A205's full-check/restart window is respected: D performs only local image/source
reads while C keeps its browser idle. Final integrated source/captures remain the next dependency.

### C086 first final captures — runtime98be865, independent D review

A207/A212/A213 authorize incoming captures and actual poster review, with the same D report/ignored
poster boundary. D073–076 acknowledge board70, QA39620b8 and continuing sole-writer ownership.
The exact runtime is `98be86558426f593b639e0db2be0da9cebc36078`, documentation HEAD
`4260b8e3763bac6b43151f2a64dcd455bceb5c3a`. A207 reports typecheck, lint, format and full tests
PASSED:150 files/1,979 tests, all exit0, suite60.73seconds. D did not duplicate that run.
Receipts are in canonical `output/native-integration/015/full-98be865/`. Preserve the earlier
42203a3 lint exit1 for render-time `useState(environment.current)` and the prior768MiB typecheck
heap failure; the corrected candidate's pass does not erase either failed attempt.

C's first released `capture-manifest.json` records Firefox155.0/PID207767, A Metro225406,
390×844 CSS/DPR3/reduced motion, loaded canonical root and six1170×2532 PNGs. D independently
recomputed all six PNG hashes/dimensions and exact98be865 Git blobs for five source-receipt paths;
all five equal C's reported served hashes. Final raw source-map retrieval is **attributed to C**;
D did not independently fetch that map. This is five-module identity evidence, not complete-bundle,
flag, native, device or synchronization proof. D's `C086-identity-review.json` contains full paths,
hashes and the manifest identity. Earlier incoming snapshots are preserved in
`provisional-20260912T1327Z/`, with actual file mtimes distinguished from C's capture timestamp.

The C-attributed interaction sequence is EntryEnglish→Parent→create task for Salem→Continue→
Make it clearer→Accept suggestion→Review task→Approve task for Salem→Open Child experience→
signed-out selector→Salem→Today. The task is approved and ready to choose, with48Seeds unchanged;
no completion or growth is demonstrated by this set. D did not perform these pointer actions.

| Image in C poster directory     | Independent D result and limits                                                                                                                                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `final-entry-en-390.png`        | PASSED visible headline, synthetic-data disclosure, three profile cards and Salem-only task limit. Restart notice is below this viewport.                                                                                               |
| `final-entry-en-390-footer.png` | PASSED visible fresh-run restart notice after C's scroll; upper headline lies under fixed header. This is supplementary scroll evidence, not the main poster image.                                                                     |
| `final-parent-en-390.png`       | PASSED visible Parent navigation, synthetic/local label, cooperative canopy19/25 and no-comparison wording. Upper view does not show a selected Child or approval action; do not claim those are pictured.                              |
| `final-salem-en-390.png`        | PASSED visible correct synthetic Child, approved clean-recycling task,48Seeds,12 fixed Seeds after Parent confirmation, adult-supervision notice. Help paragraph is partly below bottom navigation; not a complete help-action capture. |
| `final-salem-en-390-task.png`   | Hash/dimensions PASSED; title-under-header framing reported by A211. D has not independently passed that frame's visual composition.                                                                                                    |
| `final-entry-ar-390.png`        | Hash/dimensions PASSED; independent Arabic helper pixel review pending at this checkpoint.                                                                                                                                              |

These captures are eligible for truthful browser/synthetic poster illustration. Parent approval,
permitted help and confirmation/praise may be explained as product behavior; the pictured canopy
and ready-to-choose task alone do not demonstrate those transitions. A210/211 requests a naturally
framed task/help view, preserving originals. C's supplementary Arabic/Story/320/enlarged checks
remain separately in progress. No native, printed-page, TalkBack, touch, audio or human acceptance
is inherited. Rehearsals remain0/10 and recovery014 remains deferred.

### Actual poster findings — A213 candidate, corrections pending

D read actual PPTX OOXML and viewed actual PowerPoint PNG exports without changing A's artifacts.
A212 candidate `Ghaf-A1-Portrait-CANDIDATE.pptx` SHA256
`756df368e1431e6b3ee4510cecdffc42c597578bd1752c3e8cc277492c60ad2a` embeds the three English C086
PNG byte streams unchanged. A213 names final
`/home/smyk/projects/Ghaf/output/poster-20260912/final/Ghaf-Team-SMAC-2026-A1.pptx`, SHA256
`56e6a16528e2e5d74cddbc3152c1183b5603dcb371f86abccd47ad54056389f0`, and adjacent PNG SHA256
`47542a1b8d314946fe1a7550bd65274d9af7920156fc50e6018e75dd69073f93`. These exact bytes received
the following independent findings; later replacements require retest.

- **D-POSTER-001 / P2 / FAILED, OPEN / A poster copy.** The Salem caption says Parent confirmation
  and praise lead to “permanent symbolic garden growth.” Exact wording is present in the draft,
  A212 candidate and A213 final OOXML/PNG; no slide restart qualifier exists. It can imply durable
  progress although isolated-demo restart begins a fresh run and recovery014 is deferred. Expected:
  remove “permanent” or explicitly limit progress to the current local run. D072/D075/D076 route the
  correction to A. Original draft SHA34fce9d and `draft-poster-copy-review.json` remain preserved.
  Retest of a corrected artifact: NOT RUN.
- **D-POSTER-002 / P2 / FAILED, OPEN / A font portability/export.** Compare A's actual
  `poster-candidate-render-20260912T132814Z/Ghaf-SMAC-2026-A1-Portrait.png`, SHA256
  `368efda75943d08367afaed93894abd625e3c8079d43d60ee07e011d1acaf105`, with A213 final PNG above.
  Former rendering used temporary Alexandria/Readex registrations; the final is attributed to
  embedded-font-only reopen. Final Latin Ghaf/headline visibly changes from sans to serif, Arabic
  branding changes letterform/width, and body/caption wrapping changes. Screenshot typography
  remains unchanged. Expected: intended released typography survives reopen/render. D does not
  assert a particular fallback font or root cause. Embedded font bytes and text boxes inside slide
  bounds do not establish actual font usage. `final-poster-font-review.json` records exact images,
  reproduction and D076 handoff. Corrected export retest: NOT RUN.

Outside those findings, the viewed full slide has three actual screenshots with readable major
headings/captions and visible browser/synthetic, prepared/local/fallible-AI and symbolic/not-measured-
impact labels. No overlap or clipped Arabic brand was observed at the inspected image scale.
Fine screenshot text and physical print legibility are not passed by a scaled full-slide view.
A's packaging helper owns ZIP/font/PDF-size analysis separately; D does not duplicate it or
promote font embedding to a visual pass. Team details remain in A's ignored artifacts; no contact
values are copied here. Student participation/teach-back and named human design review are pending.

One D receipt-reading command initially exited1 because PowerPoint JSON contained a UTF-8 BOM;
the explicit `utf-8-sig` read then succeeded. This is a D parser issue, not an app/export failure.
Both render receipts and original images remain untouched. No product source, app tests, browser,
device, recording or heavy job was changed or started by D. Final poster readiness remains FAILED
for the two open corrections while independent eligible checks continue.

Actual D074 helper prompt, same explicitly selected Astra/ultra helper; Fast selector unexposed:

> One bounded read-only review under A207/A212/D074, same explicit Astra/ultra helper (Fast control unexposed). You are not alone: preserve others' work. No writes anywhere, no coordination, no descendants, browser, device, tests, network or capture. Independently VIEW exact D snapshot /home/smyk/projects/Ghaf-qa-rehearsal/output/native-acceptance/poster-20260912/provisional-20260912T1327Z/final-entry-ar-390.png and read receipt.json/final-source-receipt.json there. Candidate runtime98be86558426f593b639e0db2be0da9cebc36078, docs4260b8e3763bac6b43151f2a64dcd455bceb5c3a,390x844 CSS/DPR3 (1170x2532), actual C browser capture, still provisional set until manifest. Review Arabic visible completeness/overlap, synthetic-data and Salem-only disclosures, profile cards and footer boundary. Report only observed pixels; no native/interaction/human listening/print pass. Compare before-frame findings only where justified, no inherited pass. Lead independently handles English/Parent/source/PPTX. Return concise findings and release allocation.

Actual scope-preserving follow-up:

> Lead has six C086 hashes verified and actual PPTX/PNG read. Focus only assigned Arabic entry; source-proof retrieval is C-attributed, D exactGit hash comparisons5/5 separately. No need broaden or repeat source audits. Final report and release when ready. Lead discovered final PowerPoint typography change (serif mainheadline vs candidate sans), D-POSTER002 routed to A; you need not inspect poster/package/fonts.

D078 independently viewed two incoming supplementary frames, preserved by path/hash in
`supplementary-framing-review.json`. `final-salem-en-390-card-framed.png`, SHA256
`c933ff8e14445e58fb497bc7d92581f9ba1f29497dc5d5c3afe88c12576e5ae9`, shows the complete task title,
48Seeds,12 after confirmation, adult supervision, full help/no-loss notice, Choose and smaller-task
CTAs. D recommends this existing-state frame for the help column; it does not demonstrate completion.
`final-parent-review-en-390.png`, SHA256
`fdc14a8e825a61e9483bc97ec8768fdfd20e744e4b10d96dcc14702c6c1aff9c`, instead shows the prepared
Ghaf Guide, accepted-suggestion message, Parent choice, fixed12 and Review task CTA. It precedes
actual review/approval and contains no canopy. If A selects it, its caption must change accordingly.
Both are1170×2532; completed supplementary manifest/actions remain C's responsibility. No further
capture, source edit or native test was requested. A214 independently confirms the typography
failure and is investigating its own exporter; D-POSTER001/002 remain open at this checkpoint.
