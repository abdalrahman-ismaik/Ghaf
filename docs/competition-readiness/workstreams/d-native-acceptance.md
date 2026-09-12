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
dependency change or environment repair is performed. Python3.10+ is required; observed host
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

| ID / priority          | Reproduction or ambiguity                                                                                                                                      | Required clarification / owner / retest                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-015-01 / P2 contract | Draft says recheck entry preconditions after chosen resume; both controllers can no longer both be signed_out                                                  | Name postconditions: chosen scoped authority active, other signed_out, unchanged generation/context; A, PENDING                                      |
| D-015-02 / P2 contract | Capture selector callback at generationG; enter Parent; sign out; old callback still hasG and passes signed-out guards                                         | State stale-handoff policy and test it; separate entry epoch if stale callbacks must be rejected, without reseeding progress; A, PENDING             |
| D-015-03 / P2 contract | Existing reset clears repositories and several authorities sequentially before later fallible calls; unchanged generation alone does not preserve a failed run | Specify failed-reset oracle and observable retry; inject a mid-reset failure and inspect actual authority/maps; A, PENDING. No recovery014 expansion |

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
