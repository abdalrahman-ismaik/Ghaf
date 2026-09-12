# AI assistance record — competition readiness inspection

This record covers the September 12, 2026 inspection on `redesign/ui-experiments`, starting at
`55f9f2b`. It identifies generated assistance honestly. **Student review and teach-back are NOT RUN**
unless a later entry records an actual named review. Local commits use the repository's configured
identity; this does not establish that a student authored the generated code or documents.

The supplied orientation permits supporting AI and requires its prompts and contribution to be
documented. It prohibits AI generating the full app. The four-session pack therefore assigns
bounded reviewable tasks to support the existing student project. It is not authority to replace
the team's participation or certify eligibility. The team must explain its actual implementation.

## Requests and provenance

[requests.md](requests.md) preserves the exact current user requests, including the contest brief,
competition-first selection and the user's increase of the TOML agent capacity to 10. The two
earlier branch requests were executed before this inspection: switch to the botanical branch,
bring local main to its already-published head, then create `redesign/ui-experiments`.

The [orchestration prompts](orchestration/README.md) are **future prompts**, not records of work
already executed. Copy each actual assigned task and any subsequent steering into the team's log
when it is used. The role summaries below describe the current delegation; they are not verbatim
subagent transcripts. This file does not claim to capture every historical Ghaf AI prompt. Recover
earlier prompts from genuine team records and record any missing evidence explicitly.

Codex produced the current assistance. Specialized agents were used for read-only bootstrap and
product review, template intake, browser QA, tooling setup, a bounded profile correction, and prompt
alignment. GPT-6 Astra/Ultra was requested where supported by the agent launcher. Fast service delivery
was not independently measured; the launch guide distinguishes configuration from actual service.

## Contribution register

| ID / actual request or delegated task                    | What Codex produced or changed                                                                                                                                                                          | Affected files / evidence                                                                                                                                                                                                                    | Student review still required                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-01: inspect/install supplied productivity pack        | Reviewed installer/credential boundaries; installed pinned project tools, enabled three MCPs and left four account-dependent entries disabled; added three original scoped skills                       | `.codex/config.toml`, `.gitignore`, `tools/codex/**`, `scripts/tooling/**`, `.agents/skills/ghaf-presentation/**`, `.agents/skills/ghaf-quality-workflow/**`, `.agents/skills/ghaf-reference-intake/**`, [tooling report](tooling-report.md) | Understand what each tool sends/executes; review configuration and selective dispositions; no bundled classroom credential use                                      |
| AI-02: unpack/explore all design references              | Safely extracted 13 archives, inventoried Sketch structure and assets, visually reviewed previews/contact sheets and embedded PDFs, proposed reusable structural ideas                                  | [template catalog](template-catalog.md); ignored `output/competition-readiness/template-review/**`                                                                                                                                           | Select a direction; establish any reuse license/provenance; no copied runtime assets in this inspection                                                             |
| AI-03: deep QA                                           | Restored lockfile dependencies, ran automated checks, exercised bilingual browser flows, reproduced profile mismatch and lost progress, recorded native/build gaps                                      | [QA report](qa-report.md); ignored `output/competition-readiness/qa/**`                                                                                                                                                                      | Repeat on actual Android hardware; assess remaining findings; understand what browser evidence cannot establish                                                     |
| AI-04: fix reproduced configured-Child selector mismatch | Replaced static fixture labels with configured profiles/nicknames/age bands, invalid-selection guards and bidi-isolated numeric ranges; added six bilingual regression cases                            | `src/components/family-growth/ParentTaskComposer.tsx`, `tests/parent-task-composer-profiles.test.tsx`                                                                                                                                        | Review full diff; explain profile identity versus display name, allowed task eligibility, selection guard and numeric bidi; native verification remains unperformed |
| AI-05: research ideas and contest priorities             | Cited evidence assessment of autonomy/help, rewards, learning, money practice, communication and location; differentiated findings from product hypotheses; read supplied competition PDFs              | [research and strategy](research-and-product-strategy.md), [team Q&A](team-qa-guide.md)                                                                                                                                                      | Read key sources and limitations; approve product hypotheses; obtain named Arabic/cultural/content review where required                                            |
| AI-06: prepare multi-session prompts                     | Four bounded session prompts, shared contract, model/settings evidence, worktree/ownership handoffs and integration/freeze sequence                                                                     | `orchestration/*.md`                                                                                                                                                                                                                         | Record actual task IDs and human ownership; audits/authorized work may proceed with review pending, while acceptance requires genuine student review                |
| AI-07: scope clarification and final integration         | Replaced the initial sync-first/four-minute proposal with the user's 2–3 minute local primary-phone journey and independent secondary checks; documented APK path and proposed memory/persistence gates | [demo](two-device-demo.md), [Android guide](android-build-and-rehearsal.md), [index](README.md), `TEAM_OWNERSHIP.md`, this ledger and requests                                                                                               | Validate final candidate, rehearsal and submission/qualification circumstances; no unbuilt feature may be presented as complete                                     |

## Rejected or deferred suggestions

- The initial two-device relay and four-minute live rehearsal proposal was superseded by the
  user's latest scope. Synchronization is later work; both phones have independent stores.
- Broad calendar, study, money, Maps/Google OAuth and free messaging implementations were deferred.
  Only a local agenda may be reconsidered after core acceptance and if time remains.
- Bootstrap global installers, classroom credentials, opaque browser extensions, automatic update
  suites and paid generation workflows were not activated. Exact dispositions are in the tooling report.
- Imported template code/artwork was not added to the app. The source packs do not establish reuse rights.
- No runtime memory timeline, generalized live recommendation engine, progress persistence, new
  backend or default-off feature activation was implemented during this inspection.

## Completed local slices

- `9619ed1` — repository-local MCP tooling and reviewed skills, including the user's capacity-ten setting.
- `236bbae` — configured Child choices and numeric bidi correction with six regression cases.
- The remaining inspection/research/prompt documents form their own local documentation commit;
  see Git history for its actual identifier. No push or main merge is included.

## Validation and acceptance

Read the final [QA report](qa-report.md) for commands, counts, platforms and evidence paths.
Tooling initialization and synthetic calls are distinct from app AI behavior. Passing tests does
not prove clinical/developmental benefit, production security, live AI, media analysis, measured
environmental impact or physical demo readiness. Student contribution and review cannot be inferred
from automated checks or an agent's review.

For each subsequent bounded contribution, append:

```text
Date and actual human owner:
Exact user prompt / follow-up prompts:
Selected spec task IDs and reserved paths:
Model / reasoning / speed actually selected:
Generated output and suggestions rejected:
Files changed and cohesive commit:
Commands, results and direct artifacts:
Human review date, reviewer and code explanation actually observed:
Remaining work / NOT RUN evidence:
```

Keep synthetic-only evidence in any shared log. Do not copy secrets, real family information,
hidden reasoning or unrelated account/session data. Preserve honest history and individual
contributions; never fabricate reviews, meeting minutes, timestamps or authorship.

## Follow-up: sustained sessions and scoped subagents

The exact follow-up requests are preserved as Requests 5 and 6 in [requests.md](requests.md).
Codex reviewed premature-stop instructions, corrected unsupported qualification claims, extended
all four role prompts and the launch/shared contract, and created a canonical BOARD plus four
single-writer status files with task queues, findings/outbox acknowledgments, helper/resource
allocations, explicit path release and recovery instructions. Current task status templates are
NOT STARTED; no future work or student review has been fabricated.

A read-only helper measured WSL CPU/memory/swap/process context. The
[resource report](coordination/resource-assessment.md) records actual observations and separates
conservative scheduling thresholds from unperformed capacity benchmarks. It recommends four
helpers total initially, with measured growth toward eight; the user's ten-per-session setting
is preserved. No forty-helper stress test or Windows RAM audit occurred.

Affected files: `orchestration/*.md`, `coordination/*.md`, package `README.md`, the qualification
sentence in `research-and-product-strategy.md`, this ledger, `requests.md`, `TEAM_OWNERSHIP.md`,
and only the concurrency paragraph in `AGENTS.md` (its managed context block is unchanged).
The role-prompt writer owned only the four role prompts; independent reviewers were read-only.
No application source, dependency, native configuration or feature flag changed. Validation covers
document formatting, local links and independent protocol consistency; app/native tests are not
new evidence for this documentation-only change. Student review remains NOT RUN.

## Executed Session A — September 12, 2026 UAE time

The user launched Session A (Request 7), activating the previously prepared A/B/C/D workflow.
The earlier NOT STARTED descriptions above are historical. A created separate worker worktrees,
activated exact report/helper grants, and implemented A-004's existing temporary Parent-entry
routing correction under Feature 005. See [A's contribution and exact helper prompts](workstreams/a-contract.md)
for red/green evidence, actual model visibility, source files, rejected approaches and review gaps.
The Android prerequisite audit changed no native files and produced no APK. Root source/commit
identity does not establish student authorship or understanding; exact-diff review remains PENDING.
B/C/D report their own prompts/contributions in their reserved workstream reports; A incorporates
those links only when an actual released handoff arrives. No memory/recovery feature is approved
merely by this coordination activation.

### Released workstream evidence incorporated by A

- [B core audit and replacement repair](workstreams/b-recovery-audit.md): worker `b1fc581` and
  `a081f642`, integrated as `c9d5ef6` and `f38f21d`. Six store lines plus four regression cases;
  132 relevant tests, scoped checks and typecheck recorded by B; exact student review PENDING.
- [C three-direction comparison](workstreams/c-design-comparison.md): worker `0351f9d`, integrated
  `233df14`; C-002 worker `a356998` integrated as `1428622`. One existing card presentation
  changed; 39 focused tests and labeled browser matrix, no native acceptance.
- [D independent matrix/draft review](workstreams/d-baseline.md): workers `f95c57d` / `c56141b`,
  integrated `152b053` / `e57d669`; source/contract evidence, no new native or browser pass.
- A-004 `ffad798` (4 route lines, 5 behavior tests) and A-006 `4d26635` (Arabic duration wording,
  existing expected-copy updates) have focused checks in A's report. The combined b862eb6
  candidate passes typecheck, lint, format and all 138 files / 1,669 tests; D mounted-router retest
  is independently in progress.

A preserved B/C/D ownership and authorship. Paused status-write acknowledgments enabled the
coordination checkpoint; no fabricated continuous student work or human approval is recorded.

### Recovery proposal and current-feature presentation checkpoint

A-002 draft `ca54e40` records the new014 proposal and actual third helper prompt/steering in
[A's report](workstreams/a-contract.md). D final draft review242cd49 integrated217f095 addresses
seven design findings, without accepting implementation. A generated the spec/plan/tasks, finite
evidence/reset contract and proposed recovered-approved-task boundary; no runtime014 files.
Rejected shortcuts include serializing Child content/raw store, inventing Parent original text,
restoring authority or live praise continuations, and treating a draft as an implementation grant.
User scope acceptance, exact typed mapping review, failing tests and student/native review remain
required. No memory feature is added. The revised two-device script omits unfinished features and
uses target timings only; actual APK/device models/OS and all ten physical runs remain unavailable.

The current execution records preserve actual source changes and team-assistance prompts. No
student review, participant contribution, qualification, Ultra/Fast runtime setting or native
pass is inferred from these generated reports. All commits remain local.

### Additional reproduced reset repair — A-007

D's source-verified browser run found an unhandled queued POP_TO_TOP after Parent reset that
blocked the next verification click through the development error overlay. Under existing003
FR-095/096, A generated `b2208aa`: `src/utils/navigation.ts` now checks the supported canDismiss
before dismissing, while keeping root replacement and the web Back guard; one new behavior case
and a type-style cleanup are in `tests/reset-navigation.test.ts`. RED1failed/2passed; GREEN42
focused tests and scoped checks; full candidate typecheck/lint/format and138files/1,670tests pass.
D actual retest FAILED the dismissible-history race: canDismiss was true, then queued POP_TO_TOP
ran after route collapse. The guard did not close D-R02. No production/native effect is claimed.

[A's report](workstreams/a-contract.md) preserves the exact helper prompt, source reasoning and
remaining timing gap. Rejected actions: hiding the error toast, changing app code for the earlier
wrong-worktree bundle, treating synchronous catch as protection against a queued error, or
claiming unit tests establish native navigation. Human exact-diff review/teach-back PENDING.
The cache analysis also generated a future isolated-preview launch note, not app/package changes;
initial mixed-source D captures are explicitly candidate-ineligible. No source change followed
just from that cache inference. No push, native build, SDK license acceptance or release activation.

### Root reset correction — A-008

A generated `7fff0f3` under the same existing reset contract after D reproduced the remaining
race. Public navigation-container refs in Parent Settings and PrototypeStatusBar prepare a
validated root payload before clearing data; one resetRoot retains only the actual wrapper and
entry route. No queued pop/replace, old route parameters, authority persistence or package change.
Files: `src/utils/navigation.ts`, `app/parent/settings/index.tsx`,
`src/components/PrototypeStatusBar.tsx`, `tests/reset-navigation.test.ts`. The installed reducer
reproduced the old failure (1 failed / 3 passed); the new focused reset/access set passes49tests,
with typecheck and scoped lint/format passing. Full candidate typecheck/lint/format and138files/1,677tests pass; D verified and released three actual browser reset sequences; report93a98c0 integrated7beb61c.
Exact three helper prompts, generated contributions and rejected shortcuts are preserved in
[A's report](workstreams/a-contract.md#a-008--one-validated-root-reset-after-the-queued-pop-failure).
Human exact-diff review/teach-back and physical Android validation remain pending.

### Independent final QA and integration handoff

D's [candidate report](workstreams/d-candidate.md) contains actual successive requests, helper
prompts, prepared UI journeys, read-only state observations, labeled replacement command/fault
probes and rejected evidence. Its report-only commitsadcec89/cf2f740/04ffee9/93a98c0 were integrated
as4392184/a55621e/61810e5/7beb61c preserving configured authorship; no student contribution is
inferred from Git identity. A excluded wrong-worktree captures and transitional splash screenshots
from settled-UI claims, inspected the final entry capture and retained the Arabic CSS-stress crop
and audio/native/recovery limitations. No generated screenshot was used as executed-test evidence.
A's final report records exact source7fff0f3,138files/1,677tests, per-deviceNOT RUN, pending student
review and the bounded next-work cursor. Human exact-diff acceptance and participant teach-back
remain PENDING. No new feature, dependency, real account, provider, release flag or remote action.

### User-selected recovery deferral — 2026-09-12 00:49:33 UTC

Actual user inputs: “Defer recovery implementation until the current APK/native journey is
validated (recommended).” Then: “by the way, all the other codex sessions also stopped”.
A recorded this sequencing decision in014 spec/plan/tasks, BOARD/STATUS-A, TEAM_OWNERSHIP and
requests. No recovery source, build, dependency, feature flag or B/C/D status changed. Native
validation is necessary before reconsideration; it does not automatically accept recovery scope
or replace exact typed-contract review. Human acceptance of implementation remains pending.
The user decision itself is recorded as provided, without inventing any student review.

One A-only read-only helper received this actual prompt while A edited decision records:

```text
One bounded READ-ONLY A-009 decision check. User has now explicitly selected: 'Defer recovery implementation until the current APK/native journey is validated (recommended).' User also confirms all other Codex sessions stopped. Do not wake B/C/D; you are only A's temporary helper. No writes/jobs/tests/descendants; preserve others. Read tops of specs/014-local-progress-recovery/{spec,plan,tasks}.md and canonical BOARD/STATUS-A as A updates them. Check only that deferral is recorded, native validation is necessary but does not automatically approve recovery implementation, and stopped sessions have no active grants/jobs. Don't review the full proposal or app. A edits decision records/ledger independently. Return any semantic contradiction in current decision wording and release. Global budget4, A quota1, no heavy/preview.
```

Rejected inference: selecting deferral approves the recovery contract or validates the current
native app. The previous test results remain attributed to7fff0f3; documentation edits require
only scoped formatting/consistency/whitespace checks, not another app test run.

Helper outcome: old header/cursor wording was aligned during A's edits; its additional finding
removed the stale T004 authorization and made T001 a later reconsideration. Read-only review
completed with no writes, jobs, tests or descendants. A released that helper; B/C/D stayed stopped.

### Native-batch prompts and product-refinement clarification

Actual user request and steering are preserved in requests.md's dated new-session section. A
created `native-batch/{README,shared-contract,session-a-native-integration}.md`, coordinated the
three role prompts, updated the launcher index and prepared fresh clean B/C/D branches at52c61fc
without rewriting prior history. No worker session was started. A recorded that the prior research
exists but the recent code batch did not implement the user's new feature modules. After that
steering, A added C-N02 proposal-only product refinement and A-N04 scope review. Recovery remains
deferred; no new feature scope is self-approved.

`/root/sustained_prompts` generated only the three B/C/D prompt files and released them after scoped
formatting checks. A then inspected all three and added the product-refinement section after the
user's steering. `/root/android_build_audit` read installed build behavior only and returned five
requirements: private native dependencies; expected prebuild script rewrites; separate provisioning/
compile grants; frozen source/artifact identity; rehearsal signing and device-action boundaries.
A accepted these into the shared/role prompts. No helper ran native builds, app tests, installs,
previews or descendants. All helper allocations released after prompt preparation.

Exact native review prompt:

```text
Bounded READ-ONLY prompt-contract review under A preparation quota2 total (otherhelper writes B/C/D prompts). No writes/jobs/tests/browser/download/descendants. User wants new session prompts after deferring recovery until APK/native validated. Fresh clean B/C/D branches at52c61fc prepared; B worktree /home/smyk/projects/Ghaf-demo-systems has no android dir, shared read-only node_modules identicallock. A plans B build-preflight/failclosed scripts/native/build-apk.sh, separate A-granted isolated host JDK17/SDK provisioning then standalone releaseAPK, no automaticlicense acceptance/global installs/cloud; C minimal D-R03 Arabic200%existingcard candidate, sharedprimitivesneedAgrant; D read-only scripts/native/collect-device-evidence.sh thenactualAPKdeviceQA. Review existing android-build-and-rehearsal.md and installed package/config only for critical native prompt traps (prebuildwritespackagejson/appconfig, sharedsymlink Gradle outputs, stale sourceattribution, builddebugkey/distribution, room/resources). Prior audit alreadyknownmissingtoolchain; don'tduplicate. Return max5 actionable prompt requirements for A shared-contract/buildgrants to avoid deadlock or unsafe sharedwrites. Relevant published spec003native obligations existing; no businessfeatures. A writespackwhileyoureview. Release afterward.
```

Exact three-file prompt-writing assignment:

```text
Produce three NEW detailed copy-paste Codex prompts, ~650–1000 words each, ownership ONLY /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/session-b-android-build.md, session-c-native-ui.md, session-d-device-qa.md. You are not alone; preserve all others' edits, no other writes/commits/deps/tests/jobs/descendants/coordination. A independently writes shared-contract/README/A-resume and live prepared register. Read current native build guide, D candidate report and old shared coordination protocol, avoid repeating completed audits. User defers recovery014 until APK/native validated, confirms B/C/D stopped and now requests prompts so they can resume productive work. Worktrees JUST prepared clean at52c61fc: B /home/smyk/projects/Ghaf-demo-systems branch redesign/native-build-20260912; C /home/smyk/projects/Ghaf-ui-studio branch redesign/native-ui-20260912; D /home/smyk/projects/Ghaf-qa-rehearsal branch redesign/native-qa-20260912. All contain source7fff0f3,138/1677tests historical, no APK/devices/toolchain. Old branches preserved. Prompts loaded from canonical /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/, checkout copies may not contain them. A resume activation MUST precede runtime/helper/resource grants; writing prompts doesn't start workers. Each lead read shared-contract at canonical abs, AGENTS required docs, BOARD/all statuses; reserve new instance/status ACK without overwriting active lead. Task design: B-N01 create repeatable build readiness/preflight and fail-closed build script at scripts/native/build-apk.sh + report docs/competition-readiness/workstreams/b-native-build.md; B-N02 provision only A-granted isolated host toolchain/download paths, validate publisher checksums/no sudo/global package change/no automatic new license acceptance; B-N03 build standalone release APK on exact A-published source, max2workers serialized heavy slot, --no-install prebuild in B-owned android only (currently absent), inspect any tracked autochanges and stop/reconcile unauthorized shared files with A; no shared node_modules mutation. B validates SHA/package/version/ABI/signing/permissions/JS asset bundle actualartifact, no debug-keystore public release claim, no cloud/EAS or signingidentitychange authorized. If tools/licensing block, complete script/handoff and exact prerequisite rather than stop after known missing-JDK audit. C-N01 bounded D-R03 Arabic secondarylabel CSS200% clipping repro and minimal existing card fix candidate under003visual scope (not new design round), owns ONLY src/components/r002a/child/ChildTodayTaskCard.tsx, report docs/competition-readiness/workstreams/c-native-ui.md, optional existing focused card test if A explicitly grants; common QuietButton/primitives/tokens/resources A-only unless transfer. Use prior D raw artifacts canonical otherworktree readable. Preserve labels/actions/fullaward/fonts/RTL, no disablingfontscale/truncation to hide. If cause sharedprimitive, report exacttransferrequest, don't workaround/hardcode sibling text. Candidate needs normalAR/EN320/390/browser native separately; browser lane can't overlapBnativeheavy. C-N02 prepare actionable native UI checklist and patch verification while awaiting actualAPK, no gallery/new screens/recovery. D-N01 owns scripts/native/collect-device-evidence.sh and report docs/competition-readiness/workstreams/d-native-acceptance.md; useful now create read-only explicitserial/explicitAPK validation/evidencecollector, no installs/uninstall/reset/logcat personaldata bydefault, commandexitstatus/UTC/hash identity real result no fabricate. D-N02 independent actualAPK check/install once candidate supplied and deviceowner authorizes chosen serial; D-N03 nativejourney primary/secondary +real timedrehearsals target10 only actualhumans, existingprogressloss honest not recoverypass; independent C retest after exactsourceintegration. B/C/D each1helper initially global4includingA, descendantscount, A writesBOARD mastersharedsource; no max40. No push/mainmerge/deploy/submission/releaseflags/newfeatures. Sustainable orderedtasks and active producer waits bounded<=60sec, stop honestly only when all eligible work completed or externalgate with no active expectedhandoff. Detailed phase acceptance, narrow failure handling, cross-session outputs/outbox/state10min/commitcheckpoints, actual model/request AstraUltraFast vsunverifiedavailable, actualAI prompts/rejectedideas/studentreview. No obsoleteT004 permission. Only draft prompts then scopedPrettier files iftoolavailable; report result/release. Do not launch B/C/D.
```

Exact steering to that helper, in order:

```text
Critical B detail: native Gradle may write build outputs inside installed native module directories. Shared read-only node_modules symlink is NOT sufficient for B native build. Shared contract will require A-N01 exact grant: verify B's path is symlink to canonical, unlink ONLY that symlink (never target), npm ci from unchanged lockfile into private B node_modules under heavy slot, no other dependency/version/package change. Use private B tool/download caches and GRADLE_USER_HOME, no nativebuild with C/Dpreview. Preserve C/D's existing symlinks read-only. B must not prebuild/compile before isolation. A read-only nativehelper checking othertraps. Initial working branches at52c61fc stable; newprompts onlycanonicalabs.
```

```text
Native helper confirmed two requirements: 1) Gradle/Reanimated write build/.cxx inside native-module deps, so private B npm ci mandatory (sharedGradlecache alone insufficient). 2) Installed prebuild --no-install WILL normalize package.json android AND ios scripts. Shared contract will preauthorize B transient ownership of ONLY those two script fields during prebuild, capture exact diff in artifact receipt, no package deps/lock/appconfig mutation; do not stop solely for expected two-script rewrite. B must not commit package.json; retain documented generateddiff for A review/safe cleanup of own fields. Unknown fields/configchange stop forA beforecompile. 3) Explicitly authorize existing template debug certificate only for clearly labeled internal rehearsal releasevariant; not publicdistribution approval. Compilationgrant bounded --no-daemon --no-parallel --max-workers=2; 2workers not totalmemorycap, watchprocesses. A shared contract/Aprompt beingupdated. Keep B/C/D full prompts aligned.
```

```text
A's shared-contract.md and session-a-native-integration.md now exist; explicit transient prebuild Android/iOS script-field grant, isolated private dependencies and internal template-debug-signed rehearsal artifact authorization included. Please align any B top blanket package prohibition with that narrow exception, then finish scoped checks and release three role files. A will review complete prompts and commit; no runtime tasks activated.
```

Official Astra prompting guidance was fetched through OpenAI Docs; the pack makes delegation,
follow-through and proportional checks explicit without promising hours or model-tier availability.
Rejected: shared writable native dependencies, false native/idea-delivery claims, automatic SDK
license acceptance, automatic post-validation recovery approval and unbounded feature accumulation.
Student exact-output review remains PENDING; no student names/contributions or APK evidence invented.

### Product/service review and selected entry scope — 2026-09-12 01:10:06 UTC

Actual user requests are preserved verbatim in [requests](requests.md), including the confirmation
that services feel improperly implemented and the new three-account/onboarding/Arabic-voice request.
A produced [the source-based review](workstreams/a-product-service-review.md), the selected-scope
[entry/onboarding brief](native-batch/entry-onboarding-contract.md), and revised all four prompt roles.
The review distinguishes observed code, intentional P0 limitations, proposed behavior and unrun
native/listening evidence. Research sources were re-opened for UNICEF communication and CFPB youth
financial capability; no Ghaf outcome benefit was claimed.

Initial helper audits were read-only: `/root/assistant_service_trace` traced Parent Guide/Child
Coach/Parent summary/Feature008; `/root/task_product_trace` traced catalog/customization/task and
reward authority. These are scope summaries, not reconstructed verbatim prompts. They found a
source-level omission of approved Parent wording, identical prepared Guide intents, static summary
and read-only planning limits. They did not run the app or perform new browser/native tests.

Exact follow-up prompt to `/root/assistant_service_trace`:

```text
New bounded read-only audit: user reports Arabic narrator language/voice very poor. Trace onboarding narration actual source, synthesis/audio assets, locale/voice selection, playback lifecycle and exact wording. Find safest existing-authority fix vs new content requiring Arabic human review. Max5 sourced findings with paths/lines, current tests and minimal candidate implementation boundary. Do not listen to personal media, write files, run builds/browser/tests or spawn descendants. Other contributors exist, preserve work. Also identify if actual synthetic shipped Arabic audio can be inspected through available tool without generating new media; do not claim listened unless actually done. You own only this independent read-only investigation.
```

Exact follow-up prompt to `/root/task_product_trace`:

```text
New bounded read-only audit: user requests fast no-auth demo entry for exactly 1 Parent +2 Child synthetic accounts. Trace current welcome/onboarding/access/account seed helpers/guards and route state. Identify minimal explicit Demo-mode entry contract preserving strict Parent/Child authority separation (no privileged persisted session/role toggle within signed-in app), ideal reuse of seeded Salem/Alya family. Report exact file seams, state transitions, reset/profile isolation implications, tests to adapt, whether existing deterministic entry method can be safely reused. No writes/tests/browser/builds/descendants; other contributors editing, preserve work. Focus only this new sign-in scope, not prior findings.
```

Both released. A then commissioned `/root/approved_instruction_fix` with this exact prompt:

```text
Implement bounded existing-behavior correction in /home/smyk/projects/Ghaf (canonical shared checkout), branch redesign/ui-experiments HEAD52c61fc. Ownership ONLY app/child/task.tsx and NEW tests/child-approved-instruction.test.tsx. You are not alone; preserve every other contributor's edits. No coordination/docs/source other files/deps/build/browser/descendants/commit. A alone commits and fullchecks. Read required repository instructions and relevant focused test conventions. Parent custom approved action survives as journey.task.content.positiveAction and Parent review, but initial Child task v1 displays only fixed title/checklist; approved wording absent. Existing003/Parent flow authority permits displaying already accepted safe wording. Small correction: render the localized approved positiveAction in chosen (before start) AND in_progress/retry active presentation using existing Text/components, preserving all current fixed safety/checklist/definition/help copy, two-checkbox completion, version2 adjusted behavior, scopes/guards. No new translation/content/key/award/task/service. Avoid replacement of required checklist by custom content. Prove meaningful RED→GREEN with actual rendered route/component + real store journey fixtures where practical (existing temporary-parent-entry-route.test.tsx illustrates route import + hook/store mocks). Test exact approved action in both locales and chosen/active states, no cross-child/unassigned projection; don't substitute source-string assertions. Can mock platform/router/hooks to traverse React element tree, but retain real store authority/setup/actions rather than invent successful states. Inspect existing test helpers; do not import test helpers into runtime. First deliver RED evidence, then smallpatch, focused relevant tests and scoped lint/format/typecheck if proportional. Share exact commands/results and any native/rendering limitations; no browser/native pass claim. Finish release exact two paths to A; no commit.
```

Output: ten runtime lines show approved wording in chosen/active version-one views; 18 rendered
regressions cover AR/EN, chosen/active/retry, retained safety/checklists, unchanged version-two
presentation and sibling/unassigned isolation. RED six expected failures/twelve passes; GREEN
18 passes and related four-file/86-test batch. Native hosts/peripheral UI are mocked; real React
rendering and store/controller/service actions are retained. A reviews and commits the exact diff;
full-candidate checks are reported separately. No student authored/understood/accepted claim.

Rejected suggestions: treating all service limits as bugs; claiming new ideas already shipped;
replacing required safety steps with custom copy; broad role mutation as demo access; overwriting
custom local families; claiming phone TTS changes repair bundled MP3; using metadata as proof of
Arabic voice quality; shipping old audio against rewritten transcripts. Named Arabic/asset-rights,
actual-phone and student exact-diff reviews remain PENDING. New entry/onboarding runtime is not
implemented in this review/prompt pass. Recovery014 remains explicitly deferred.

Final correction receipt: local source commit `e02d02b3a43c062bd637b57a475b43419a9f9939`.
A's four checks ran 01:11:45–01:12:25 UTC on 2026-09-12, all exit0; 139 files/1,695 tests.
Ignored exact logs: `output/competition-readiness/product-instruction-repair/`. Scoped mechanical
UI detector returned `[]`; no browser/native quality claim. New demo-entry/onboarding/audio runtime
is still pending the committed contract and owned implementation queue. A also refreshed the
competition-readiness index to point to the new prompts and preserve the recovery deferral.

Exact final read-only prompt review request to `/root/sustained_prompts`:

```text
Read-only final consistency review, no writes/jobs/tests/descendants. A revised your released prompts after user selected no-auth 1 Parent+2 Child demo accounts, attractive onboarding, repaired Arabic narrator. Read canonical docs/competition-readiness/native-batch/{README,shared-contract,entry-onboarding-contract,session-a-native-integration,session-b-android-build,session-c-native-ui,session-d-device-qa}.md. Check only contradictions that could prevent execution or widen authority: new selected intent vs unselected proposals/recovery; exact future grants after committed Spec Kit; initial branches52c61fc vs A's new pending narrow approved-instruction fix; no B/C/D live claims; shared ownership/resources; coherent launch order. Do not rewrite prose or duplicate product/service research. Return at most5 actionable material findings and release. Other contributors exist, preserve all work. A performs full candidate checks and final receipts independently.
```

The helper released with three actionable ambiguities. A corrected ordinary/demo restart distinction,
C-N01-only scope wording, and B's entry-contract path. No new behavior was self-approved by this
review. A alone staged its coordination records; other stopped leads' statuses stayed untouched.

## NB1 actual implementation work — 2026-09-12 (in progress)

The user launched the native-batch Session A prompt and explicitly selected three synthetic no-auth
profiles, short attractive onboarding and Arabic narration repair. The user accepted the named Google
SDK tools/terms and authorized pausing Expo PID341101 for builds, then restarting it afterward in demo
mode. Those are actual permissions, not inferred student review. Exact grants/ACKs and revisions are
retained in canonical coordination/STATUS-A.md and worker statuses; the native-batch prompts are now
used task instructions, not evidence that an unstarted session ran. Actual active NB1 instances are
recorded on BOARD. Runtime settings remain observed config Astra/xhigh/fast; served Ultra/tier unknown.

A generated Feature015 stories/plan/tasks/types/storage and integration drafts. D's three technical
findings were accepted before contract293d351: chosen-role postconditions, a separate entry epoch, and
an honest terminal restart state after partial reset failure. This is not recovery014. A-I001 plan
alignment and actual settings-path correction were applied. Human/native/Arabic listening acceptance
remain pending. No participant name or approval was invented.

Completed A source slices:31f1833 immutable build mode/shared types (7 focused mode checks),9731935
isolated memory repositories (19 focused repository checks). A helper263bc88 adds narrow rollback
hooks and46 new fault cases;104 focused existing/new access checks pass. D reviewed foundation
storage/startup contracts independently with no actionable source finding. C931a186/779717b integrate
as802a4a5/9b8431b: three-profile selector and optional story,29 rendered/callback checks, no native
claim or generated audio. The root store/navigation/copy integration is in progress and is not yet
an accepted functional candidate. Full checks will be recorded against its exact eventual commit.

B installed only the approved private dependencies/toolchain. Baseline native attempt reached Expo
prebuild, Gradle configuration and bundled-JS dependency, then stopped at its paging threshold; no
APK/merged-manifest pass exists. B owns repeatable script and failure evidence; D owns a read-only
collector with46 synthetic host cases, not actual physical-device results. See their workstream
reports for exact prompt copies, hashes, tool receipts and failures. A script reviewer identified the
missing JDK bin/PATH instruction, accepted and fixed by D6214078. The process-descendant correction
is B7d9a850 integrateda0af5c0; no unrelated process was selected for termination.

Rejected shortcuts: direct role mutation/credentials to enter demo; shared ordinary storage; seeding
on each handoff; cleanup-as-rollback; reuse of mismatched six legacy clips; a new Parent name; native
claims from web/SSR; forty-helper expansion; a repeated baseline build solely for documentation.
Narration bodies are C's exact Arabic/English candidate script; extra entry/error/restart labels are
A-generated MSA/English copy requiring human review. No new clips, provider/account or asset license
claim was produced. The reciprocal support-request story remains a proposal, not selected code.

A helper actual T005 instruction (same conversation, task_product_trace): implement only the four
existing access/interface/controller files plus tests/demo-entry-transaction.test.ts against293d351;
by-value direct rollback on failure/throw/malformed/thenable, same-instance reentry with abort,
no permission/voice reset, one-worker fault tests, scoped checks and exact-file commit/release.
Generated output263bc88 was inspected and accepted as an integration slice, not student acceptance.
The subsequent test-only instruction assigns tests/demo-entry-routes.test.tsx with real controller
commands/rendered route callbacks, failed navigation/entry and ordinary/role/reset guards; adapter
absence is an honest test dependency, never an excuse to stub away authority. No descendants were
permitted. Full exact helper prompt text remains in this session's actual tool-call transcript; this
paragraph is an explicitly labeled summary, not a fabricated verbatim quote.

## NB1 Feature015 integrated access and presentation

Actual user request: "I want the app to come with a 3 main demo accounts that doesnt require
authentication, 1 parent account and 2 child accounts"; the same request selected attractive
onboarding and Arabic narration repair. Full accepted Session A mission is in native-batch/session-a-native-integration.md
and this conversation; exact contract293d351 plus d927f61 governs these bounded contributions.

Generated: B adapter2fe4b09→5632005, A store1bdad93, A routes/resources3f194bc, C components802a4a5,
C AI-reviewed copy1364d6a and candidate-only narration reportbe4c3b2. Exact files/command evidence
are recorded in workstreams/a-contract.md and each worker report. Root prepared17 real-store tests;
helper prepared19 route/callback tests, lead repaired two test harness issues without weakening
assertions. Root added the demo epoch guard after reproducing a delayed Coach response on same-Child
reentry.39 ordinary access regressions pass. Full015/native acceptance remains pending here.

Rejected: direct store role selection, universal credentials, persistent authority, reseeding at
handoff, duplicating Salem's task for Alya, calling a test setup failure a product defect, reusing
old narration under new copy, claiming AI editorial review was human listening. No contribution or
student comprehension inferred from Git identity; exact diff review and teach-back PENDING.

Exact helper follow-up prompt, A061:

```text
A061 / board30 grants bounded D-NATIVE-001 correction in canonical /home/smyk/projects/Ghaf. Contract d927f61 now committed; read authority transaction section. Others editing; preserve all work. You exclusively own src/features/access/index.ts, childAccess.ts, parentOnboarding/controller.ts, new demoEntryTransaction.ts and tests/demo-entry-transaction.test.ts. DO NOT edit store/routes/interface/independent D test or coordination. One helper, no descendants. All three nested wrappers must share synchronous transaction scope: retain each private rollback callback until outermost exit; any failure/throw/malformed/thenable/reentry aborts whole composite even when swallowed, including failure after inner success. Restore all private snapshots directly in reverse order; finally release control for same-run retry. No snapshot exposure, ordinary authority/persistence change. D test in QA tests/demo-entry-independent-acceptance.test.ts reproduces 5 fail/3 pass with existing wrappers; read it without edits. Lead integrating B adapter5632005 and store tests in parallel. Implement minimal understandable internal coordinator (or equivalent robust mechanism), extend existing transaction tests for all-three and outer-after-inner failure, run focused single-worker transaction+adapter tests, lint/format exact paths. D independently owns next retest. Inspect diff, cohesive local commit ONLY owned source/test when green, explicitly release paths/allocation; record exact command/results and actual prompt for A ledger. No fullsuite/build/browser.
```

Follow-up: D test integratedfec750e, preserve all assertions; lead alone fixes store/route scope.
Git-index pause coordinated for two lead commits, then explicitly released to helper. Helper outcome
and independent retest will be recorded against their actual completed commits; no preclaimed pass.

A061 outcome: helper2ecea74 shared synchronous rollback correction,145focused tests PASS including
D unchanged8/8 and22new composite cases. A reviewed source and ran full integrated typecheck/lint/
format/147files1914tests PASS on2ecea74. Limitations: reviewed callbacks may not schedule async
side effects; private rollback closures must remain infallible direct restoration. Native and
independent D retest remain separate. No student acceptance inferred.

Exact A read-only helper prompt after integration:

```text
A sole helper quota reassigned to a bounded READ-ONLY final integration review while lead handles preview/native handoff. Canonical runtime2ecea74, focus ONLY A store changes1bdad93 in src/state/usePrototypeStore.ts and tests/demo-entry-store.test.ts, plus existing authority helpers they call. Others editing; preserve their work. No writes/tests/build/browser/descendants/coordination. D already reviews wrapper/adapter; do not duplicate that work. Inspect whether demo failed-reset latch actually denies all product commands, handoff clears Child-private async/media state, old same-Child async responses are invalidated, and ordinary behavior remains unchanged. Report only concrete reproducible code paths and minimal correction/test, distinguish source inference from execution. Don't demand extra architecture or audit unrelated legacy features; current live AI/R002bflags off. A handles exact preview/source receipts independently. Explicitly release allocation after concise findings.
```

Generated review is in flight, no result preclaimed. Full source assertions/physical evidence remain
attributed to their actual scope; prepared narration candidates are not accepted runtime audio.

A documentation follow-up: README quick demo command, actual three-profile/restart/storage
limitations and link to standalone build guide. No new runtime contribution or source test rerun;
scoped formatting only. D independent76test retest report6ec0fcd→4472c8a closes the reproduced
transaction defect; it does not pass physical devices or app-wide native behavior. Student review
remains pending.
