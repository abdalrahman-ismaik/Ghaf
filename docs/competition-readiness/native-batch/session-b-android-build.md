# Session B — repeatable Android build and bounded demo-access adapter

You own the native-build lane for Ghaf. Work in `/home/smyk/projects/Ghaf-demo-systems` on
`redesign/native-build-20260912`, prepared clean at `52c61fc`. That checkpoint contains runtime
source `7fff0f3`; its historical 138 files / 1,677 tests do not establish an APK or native pass.
Preserve old branches/work. Recovery 014 is deferred until APK/native validation, without automatic
approval afterward.

Request GPT-6 Astra, Ultra reasoning and Fast; distinguish requested from observable settings.
Record actual AI prompts, contributions, rejected suggestions and student review status. Unknown
reviewers stay pending; never invent participation, acceptance or an unobserved runtime tier.

## Activate and establish ownership

Read the prompt pack from its canonical location:
`/home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/`. Read `shared-contract.md`
there, repository-required documents, build guide and D candidate report. Worktree copies may lack
this pack. Reuse the completed toolchain audit; missing Java/SDK/devices are known prerequisites.

Read BOARD and all statuses at
`/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/`. A must activate this batch
before source, helper or resource grants become usable. Inspect Git/branch/HEAD and prior role
ownership, register a unique B instance in `STATUS-B.md`, and acknowledge the current grant.
Never overwrite an active instance. B alone writes its status; A owns BOARD/master records.
This document does not launch workers or grant shared source.

Initial durable scope: `scripts/native/build-apk.sh` and
`docs/competition-readiness/workstreams/b-native-build.md`. Generated `android/`, local downloads,
toolchain, caches and artifacts need A's grants. Shared dependencies, lockfile, app configuration
and signing identity remain protected; only specified transient package-script edits are allowed.

## Execute the ordered batch

**B-N01 — make the build path executable.** Implement a repeatable, fail-closed script and report.
Default to preflight; require explicit build mode, expected commit and approved absolute toolchain/
output paths. Validate project root, Git state, installed Expo CLI, dependency identity, JDK/SDK
versions, disk/headroom and signing inputs. Missing prerequisites produce actionable nonzero results,
never success or automatic installs. Preserve command exit status and UTC start/end times; avoid
environment/credential dumps. Document invocation, outputs and recovery.

Check script syntax and safe preflight/help/failure behavior without starting a build. Use the
existing inspected inputs—JDK 17, Gradle 9.3.1, SDK 36, Build Tools 36.0.0, NDK 27.1.12297006,
proposed CMake 3.30.5—as inputs to verify, not a proven compatible build. Release a coherent script
commit and report even when provisioning is blocked; do not stop after repeating the missing-JDK audit.

**B-N02 — isolate dependencies and provision the granted toolchain.** Native Gradle may write into
installed modules. Under A-N01's exact grant and heavy slot, verify B's `node_modules` is the known
canonical symlink, unlink only that link, and run `npm ci` from the unchanged lockfile into private
B dependencies. Never remove or mutate the target, C/D links, package versions or lockfile. Stop
if the actual path differs. Reuse verified private dependencies on reruns. Prebuild/compilation
must refuse shared or symlinked dependencies.

Once A grants exact local destinations, obtain tools from their publishers and verify published
checksums before extraction/execution. Record version, source, checksum and destination. Use private
B tool/download caches and `GRADLE_USER_HOME`; no sudo, global package changes or unrelated cleanup.
Existing license files do not authorize new terms. Never pipe automatic license acceptance. If
terms/downloads block, name the package, owner action and resumable command; finish independent
script/evidence work meanwhile.

**B-N03 — build A's exact candidate.** A publishes the source hash, including any accepted C fix,
before compilation. Reconcile B's worktree without resetting others' changes. Record the source
identity separately from script/report-only commits. Confirm B's heavy slot and stopped Metro/
browser pair. Use `--no-daemon --no-parallel --max-workers=2`; monitor memory/process pressure,
since two workers are not a memory cap. Retain logs and failures.

Generate with the installed Expo CLI using `prebuild --platform android --no-install` only inside
B's granted worktree/native boundary, initially absent. The active contract permits transient
normalization of only package.json's `android`/`ios` scripts: capture their exact diff in the build
receipt, do not commit package.json, and retain it for A's review/safe cleanup. Do not stop for those
expected fields. Any dependency/lock/appconfig/other-field change stops compilation for A's review.
Never clean-generate over unreviewed content or install through linked dependencies.

Build a standalone release APK that bundles JavaScript/assets and runs without Metro. No EAS/cloud
upload or account connection is authorized. Use the existing template debug certificate only for a
clearly labeled internal rehearsal release variant, never public distribution. Do not change keys
to bypass a mismatch. An unsigned APK, AAB or JS export is not the installable artifact.

Inspect the actual APK: SHA-256, package/version, supported ABIs, certificate/signature verification,
merged permissions, `allowBackup`, and embedded JS/assets. Compare with A's approved configuration;
do not infer manifest results from app.config alone. Give D the absolute artifact path, exact hash,
source/build identity, signing limitation and verification logs. Installation belongs to D's
owner-authorized device task, not this build script.

**B-N04 — rebuild a released runtime candidate.** After A integrates a source correction or the
requested entry/onboarding work, synchronize the named candidate without resetting history and
repeat the existing reproducible build. Keep previous receipts/hashes distinct. Docs-only commits
do not require rebuilding; D must retest the actual new artifact, not inherit an old APK pass.

**B-N05 — implement the granted demo-access adapter.** Read `native-batch/entry-onboarding-contract.md`
and `workstreams/a-product-service-review.md` from `/home/smyk/projects/Ghaf/docs/competition-readiness/`.
The user requests exactly one Parent and two Child demo profiles without authentication. A-N05
must first commit the reconciled Spec Kit/typed contract and grant exact new module/test paths;
the initial build grant does not include them. Once granted, continue without another routine
scope question. Reuse the canonical synthetic family and controller-owned no-credential session
methods through an isolated demo adapter. Never directly set the store role, import test helpers,
overwrite a normal stored family, persist authority or grant both roles at once.

Use tests to prove three-principal validation, invalid/active-session rejection, atomic failure
cleanup, no stale callback after reset, sibling isolation, no automatic task approval/media grant
and unchanged progression during sign-out/re-entry. The current run is memory-only; don't turn this
adapter into recovery014. A owns registry/store/routes unless a later exact transfer says otherwise.
Publish a small cohesive module/test commit and contract evidence, release it, and support A's
integration/rebuild handoff. Don't overlap native compilation with another heavy suite or preview.

## Coordinate, checkpoint and finish

After activation B has one helper within the global four-helper budget including A. Delegate
independent script/artifact review alongside useful lead work; preserve others' edits and reserve
exact paths/descendants.
Forbid unreserved recursive spawning and helper coordination writes. Track IDs/PIDs; obey heavy/
preview limits. Ten configured slots do not authorize forty helpers or killing another lead's jobs.

Read live coordination before tasks, after checks/commits and about every ten minutes. Publish UTC,
instance, branch/HEAD, task/revision, held/released paths, jobs/helpers, evidence, blockers and exact
resume cursor. Append numbered outbox messages, retain unacknowledged requests and ACK received
IDs in your own status. Checkpoint every 10–15 minutes/state change; user commentary remains more
frequent. Commit coherent validated slices around thirty minutes when appropriate, not by fiction.

Continue the next eligible task after each release. If an active producer is preparing the next
handoff, do useful review or refresh at intervals no longer than sixty seconds with user updates.
If all eligible work is done or an external gate has no active expected handoff, deliver the exact
blocker and resumable output. Explicitly release finished paths/helpers/jobs; interrupted dirty
work stays held unless honestly released. Never steal ownership from an old heartbeat.

Deliver scoped commits, script verification, actual artifact evidence or precise prerequisites,
student review status and explicit handoff. No push, main merge, deployment, submission, unselected feature,
release-flag activation or fabricated native acceptance is authorized.
