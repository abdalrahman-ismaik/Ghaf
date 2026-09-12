# Native validation batch — shared contract

Read this canonical file, not an old worktree copy:
`/home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/shared-contract.md`.
This batch follows the user's explicit recovery deferral at `52c61fc`. It prepares and verifies the
current downloadable Android prototype, permits bounded existing UI corrections and prepares
a concrete family-experience proposal responding to the user's feature ideas. The user subsequently
selected three no-auth synthetic demo profiles, onboarding redesign and Arabic narration repair.
[The entry/onboarding brief](entry-onboarding-contract.md) specifies that requested scope and the
ordered A-N05/B-N05/C-N04/A-N06/D-N04 tasks. A commits the reconciled Spec Kit/typed contract before
source grants; do not ask the user to select the same scope again. Other proposed features remain
unselected. Recovery014 stays deferred; native validation does not automatically approve it later.
Existing003/005/008/011/013 authority remains binding until the exact amendments are committed.

## Startup, authority and source

1. Read AGENTS.md in the required order, then this contract, your role prompt, the canonical
   coordination protocol/BOARD and all four STATUS files, current D candidate report and Android
   guide. Use the existing evidence to avoid repeating completed audits.
2. A must activate NB1 before worker source edits, tool installation or resource jobs. A's
   activation grants are the entry permission; the named lead ACKs in its own status and proceeds
   without another routine user confirmation. Until then, read-only planning is useful; publish
   a grant request, not an invented RUNNING implementation state.
3. The prepared branches all start at exact `52c61fcab45f40b233d823a9178780fd07c56efd`, whose runtime
   equals tested `7fff0f3c2dc0e802ba1da6a67cd2513a75824809`. At branch preparation, no app change followed that test run:
   138 files / 1,677 tests plus typecheck/lint/format passed. These are historical checks on that
   source, not checks on an eventual UI patch or APK. A subsequently committed a focused
   Parent-approved instruction repair as `e02d02b` (139 files / 1,695 tests and all four checks passed).
   Read its final receipt and synchronize only A's published
   candidate before build/retest. Initial wrong-worktree browser captures are
   ineligible; D's final report separately attributes valid core/reset evidence.
4. Inspect actual Git status/HEAD/worktree. A prepared new branches in the stopped worktrees;
   all prior branches/history remain. Do not repeat branch creation, reset, stash or overwrite
   unexpected work. A publishes exact synchronization/cherry-pick instructions for later candidates.
5. Record a new unique lead instance and actual model/reasoning/tier. Request GPT-6 Astra / Ultra /
   Fast where offered; do not claim selected settings are served settings. Preserve capacity ten.
   Use installed relevant project skills/tools. Skills do not create additional product authority.

| Lead | Worktree                                | Prepared branch                  | Exact initial write boundary after A activation                                                                                                                                                                             |
| ---- | --------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | `/home/smyk/projects/Ghaf`              | `redesign/ui-experiments`        | Master docs, BOARD/STATUS-A, shared integration/configuration; transfer exact paths before workers touch shared code                                                                                                        |
| B    | `/home/smyk/projects/Ghaf-demo-systems` | `redesign/native-build-20260912` | `scripts/native/build-apk.sh`; `docs/competition-readiness/workstreams/b-native-build.md`; ignored B `android/`, `output/native-build/`, `output/native-toolchain/`, `output/native-cache/`, private installed dependencies |
| C    | `/home/smyk/projects/Ghaf-ui-studio`    | `redesign/native-ui-20260912`    | `src/components/r002a/child/ChildTodayTaskCard.tsx`; `docs/competition-readiness/workstreams/c-native-ui.md`; proposal-only `docs/competition-readiness/workstreams/c-product-refinement.md`; ignored C `output/native-ui/` |
| D    | `/home/smyk/projects/Ghaf-qa-rehearsal` | `redesign/native-qa-20260912`    | `scripts/native/collect-device-evidence.sh`; `docs/competition-readiness/workstreams/d-native-acceptance.md`; ignored D `output/native-acceptance/`                                                                         |

Shared primitives, store, registry, navigation, tokens, localization, package/lockfiles and native
app configuration stay A-only except B's precisely bounded transient prebuild script fields below. New behavior requires accepted Spec Kit authority before code.
No task here authorizes maps, agenda, Google services, chat, payments, production access, real
Child media, live AI or any default-off R002b activation. Existing permanent-award/help/privacy
rules are invariant. Do not edit another lead's report/status or the imported historical evidence.

## One resource plan for all four sessions

A activates one helper quota per lead: four helpers globally, descendants included. Delegate
independent reviews or disjoint owned modules while doing useful work yourself. Name exact paths,
expected evidence and prohibitions; tell helpers others are editing and their work must be
preserved. Leads alone write live coordination. More than one descendant requires an explicit
allocation. Ten configured slots is capacity, not a reason to spawn forty helpers.

Fresh prompt-preparation observation: WSL 7,645 MiB total, 4,924 MiB available, swap 1,521 MiB;
one-second vmstat 98% idle, swap-in 8 KiB/s, swap-out 0. This is not a stress benchmark or a promise
of native-build capacity. Recheck memory/disk/paging before installs/builds and any increased quota.
Follow the existing resource guide; do not increase this initial budget without A's measured grant.

One heavy job globally: install, native build, export or full suite. One shared browser/Metro pair,
with a single owner and isolated temporary cache. A serializes these lanes: **no native-heavy job
with resident Metro/browser**, even if a different lead owns it. C/D can read, write owned docs or
review code while B builds. Release finished lanes explicitly; no speculative resident preview.
Publish PID/tool handle, port, command, root, disk output and cleanup state. Do not kill another
session's processes or the existing ADB server. An assigned phone has one operator/ADB writer.

### B's private build boundary

B initially has a node_modules symlink to A's checkout, as do C/D. Native module Gradle tasks can
write within dependency directories. Before native generation/compilation, B must obtain A's
installation/heavy-slot grant, verify its node_modules is that expected symlink, unlink **only the
B symlink**, then run `npm ci` from the unchanged committed lockfile to create private dependencies.
Never delete the target, run npm against A's shared folder or reinstall C/D dependencies. Record
lockfile hash, actual versions and result. Reuse verified private dependencies on subsequent runs.

B may provision the measured missing JDK/Android tools only under A's exact host-tool grant, using
publisher downloads/checksums in B's ignored toolchain directory. No sudo/system-wide install,
global shell-profile edits, app-library upgrade or automatic license acceptance. Prepare exact
versions, sources, storage requirements and commands before an unresolved terms/operator step.
Existing accepted local SDK terms may be reused when genuinely applicable; do not invent acceptance.
A grants `GRADLE_USER_HOME` and caches under B's ignored output, never redefines HOME/CODEX_HOME.

B's android directory is absent at preparation; A's ignored android tree is stale and must stay
untouched. Generate fresh only in B's owned tree using installed CLI and `--no-install`, never
`--clean` over edits. A-N01 may grant B transient ownership of only `package.json`'s Android and iOS script fields:
installed prebuild normalizes both, even with `--platform android --no-install`. Capture the exact
before/after diff; this expected rewrite alone need not block compilation. Do not commit those
fields or discard them without A's review of the recorded generated delta. Dependencies, lockfile,
other package fields and app configuration are outside this exception; unexpected changes stop
compilation for A reconciliation. Any later cleanup touches only B's recorded generated changes
and preserves concurrent edits. Generated native files/logs/keystores/APKs stay ignored.
The known template release variant uses debug signing. A-N01 explicitly permits the existing
template identity solely for a labeled internal standalone rehearsal build. Verify its actual
certificate; this is not a production identity or approved public distribution. No cloud account, upload, signing identity change or public release.

## Execution, handoffs and truthful evidence

The live hub is `/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/`. Each lead
alone writes its STATUS; A alone writes BOARD. These are observable files, not message delivery or
session wakeups. At startup/resume, before each task and after checks/commits, read the board and
other statuses. Refresh roughly every ten minutes during active work, record numbered addressed
outbox/ACKs, retain unacknowledged asks, and obey the platform's more frequent user updates.
No heartbeat expires a file reservation. Transfer only after explicit release or confirmed stop.

Work through the ordered eligible tasks in your prompt. A first-task result is a checkpoint;
continue independent authorized work while a dependency is in flight. Wait at most sixty seconds
per refresh for a verified active producer, with meaningful user updates. If no eligible work or
active expected handoff remains, record the concrete blocker and stop; do not manufacture hours,
repeat passing tests or expand scope. If A has ended, the human must resume A for shared decisions.

Commit cohesive verified source/tooling/report slices with configured authorship; checkpoint around
thirty minutes when a coherent state exists. Never fabricate student contributions or timings.
Report actual prompt/steering, generated files, rejected ideas, checks, limitations and pending
student review. A integrates released commits preserving authorship and publishes exact candidates.
Only A stages live coordination, with the protocol's status-write pause/ACK when collecting others'
records. Human acceptance of exact diffs remains distinct from local integration permission.

Use focused checks for changed behavior and source/tooling checks for scripts. Do not assert style
implementation in new tests just to increase counts. A runs all four app checks once per meaningful
integrated runtime candidate; reports alone do not warrant repeating them. D independently checks
the exact APK/source/flags, not merely the worker branch. Candidate evidence must include APK
SHA-256, package/version, signing certificate, supported ABI, actual generated permission/backup
settings, bundled JS/assets, command versions/exit codes and native device model/OS when executed.
A JavaScript export, emulator, Expo Go or Metro-served browser cannot pass standalone physical APK.

One primary phone demonstrates the full LOCAL Parent/Child journey; the secondary independently
checks the same artifact. No sync. Canonical task `task_recycling_p0_v1` grants +12 once after
Parent review/praise/recognition; permitted help keeps full credit; retry loses nothing. Default
Seeds48→60 and Mangrove48/60→60/60 stay distinct from lifetime/Reward108→120, League/canopy and
Green Circle. Process-local progress loss is a known deferred gap: observe and report it, do not
implement persistence, invent a pass or promise restart survival. Reset must not revive authority.

Primary/secondary native testing requires actual owner-selected devices, synthetic data and an
installable exact artifact. Read-only device collection must not silently install, clear/uninstall,
record personal logs/screens, accept USB prompts or reset data. Device mutation belongs to D's
separately recorded operator session. Record PASSED/FAILED/BLOCKED/NOT RUN per case and device;
zero measured rehearsals stays zero. Internal goal ten actual 2–3 minute rehearsals is not a demand
to invent human performance. Sept14 freeze, Sept15 rehearsal, Sept16 presentation if qualified;
qualification is unknown. Do not push, merge main, deploy, submit or activate release flags.
