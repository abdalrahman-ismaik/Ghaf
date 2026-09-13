# Ghaf shared mission board

Sole writer: Session A. Canonical directory: `/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/`.
Follow [the protocol](README.md); checkout copies are snapshots, not the live board.

## Revision 93 — selected family name integrated and released

Updated 2026-09-13T10:21:16.316562+00:00. Runtime0b400da; same shared branch. Prepared/default family name is now
عائلة أبو راشد / Abu Rashid Family; garden/examples consistent. Exact canonical old saved family
gets a display-only alias; custom names/profiles, bytes and stable identity unchanged. All exact
source/test/spec/report paths in revision92 RELEASED; helpers0/browser0/jobs0, Metro62701/8082
preserved. Other sessions' audio/status/source remains unstaged. Typecheck/scoped lint/format and
208focused tests (maxWorkers1) passed. Actual AR390x844 entry and EN320x740 synthetic legacy-state
entry passed after one English-titlecase correction. Native/human exact-diff NOT RUN. Report
../workstreams/parent-family-name.md; evidence output/competition-readiness/parent-family-name-20260913/.

## Revision 92 — user-selected family display name

Updated 2026-09-13T10:15:01.735399+00:00, HEAD98aa066. User asks for
natural family names such as عائلة أبو راشد. Lead owns src/i18n/resources.ts,
src/features/access/demoEntry.ts, src/features/access/parentOnboarding/policy.ts,
src/features/tasks/demoContent.ts; app/access/parent/sign-in.tsx and app/parent/index.tsx only for
legacy prepared-family display compatibility if required. New display helper, if needed, will have
an exact grant before writing. Existing household/profile identifiers and custom names stay intact.
Lead owns copy amendment in015 contracts/parent-account-chooser.md and tasks.md, this board and
new workstreams/parent-family-name.md; exact existing tests follow reference tracing.
One helper messaging_seams read-only: identify saved-fixture display compatibility and narrow test
impact; no writes/jobs/browser/descendants. Lead edits copy independently. One serialized focused
check lane (maxWorkers1), then own brief browser8082, user Metro62701 preserved. Other status/audio
source untouched. No new account behavior, flags, packages or storage migration authorized.

Revision92 exact follow-up: helper released read-only scope, helpers0. Lead additionally owns
new src/features/access/localFamilyDisplayName.ts and tests/access/local-family-display-name.test.ts;
existing tests/access/parent-account-chooser.test.tsx, parent-onboarding-controller.test.ts,
family-replacement-flow.test.ts and tests/demo/demo-entry-adapter.test.ts for affected expectations.
Alias only exact old/current canonical prepared name with canonical content (locale/update time
may differ); customized names/profiles retain stored display. No storage or receipt change.

## Revision 91 — local Parent no-code entry complete and released

Updated 2026-09-13T09:55:52.367766+00:00. Contract56c9063, runtime42eb809 on the same shared branch.
All exact source/test/spec/report allocations in revision90, including the four additional stale
assertion files, are RELEASED. Helpers0, descendants0, owned browser/jobs0. User Metro62701/8082
was neither stopped nor restarted. Other sessions' source/audio/status files remain unstaged.

New-family and repair entry no longer request a code. Stale verification URL returns to chooser
without authority; final replacement review and cancellation remain. Arabic390x844 and English
320x740 actual controls/Enter/Back/chooser passed. Optional Remember stays unchecked in details.
TypeScript/lint/format passed. Initial full suite2110pass/4obsolete expectations; corrected44tests
passed with maxWorkers1 and corrected-file lint passed. No final full-suite rerun is claimed.
Default test pool accidentally used default workers; wrapper stopped, pool already completed.
Native/human acceptance NOT RUN; no Supabase project still blocks hosted two-install messaging.
Report ../workstreams/parent-no-code-entry.md; evidence output/competition-readiness/
parent-no-code-20260913/. No new UI, assets, flags, dependencies, push or deployment authorized.

## Revision 90 — remove local Parent verification step

Updated 2026-09-13T09:46:05.460286+00:00; current415f0c4, same shared branch.
Direct user: remove “أدخل رمز التحقق” from login. Extend the preceding local-only account contract:
new-family setup, replacement, legacy profile repair and stale verification URLs must not show OTP.
Real messaging authentication and Child PIN/pairing remain unchanged. No flags/packages/audio edits.

Lead owns additive015 contract/spec/plan/tasks, this board and new workstream report
parent-no-code-entry.md; exact routes app/access/parent/sign-in.tsx, sign-up.tsx, verification.tsx,
family-basics.tsx (including moving the existing optional remember control), add-first-child.tsx
and family-created-success.tsx only if their stale redirects require repair; src/i18n/resources.ts.
Lead test grants: tests/access/parent-account-chooser.test.tsx, family-replacement-flow.test.ts,
device-remembered-access.test.tsx; tests/presentation/r001-onboarding-flow.test.ts;
tests/platform/parent-access-portrait.test.tsx; new tests/access/parent-no-code-routes.test.tsx.
One helper messaging_seams read-only until contract commit, then owns ONLY
src/features/access/parentOnboarding/controller.ts, src/state/usePrototypeStore.ts and new
tests/access/local-parent-setup.test.ts for additive local setup/repair staging commands.
No other controller/store change, commits, descendants or helper jobs. Lead one serialized check
lane then own isolated browser on existing62701/8082; no Metro restart/second preview/native build.
Acceptance: direct local setup with no requested/auto-submitted fake code; no early Parent authority,
family writes or replacement consent bypass; cancel/Child return preserved; stale URL safely redirects;
actual AR/EN controls and focused regressions. Other status/media/source edits preserved.

Revision90 checkpoint: local staging helper released its three paths; helpers0. Lead source now
removes OTP UI and preserves final review. Type/lint/format pass. One default-worker full suite
completed with2110pass/4superseded source assertions; all new behavioral tests passed. Lead grants
these exact additional assertion files: tests/access/local-family-profile-repair.test.ts,
tests/access/r003-returning-family-entry.test.ts, tests/platform/r003-first-run-experience.test.ts,
tests/presentation/r003-screen-flow.test.ts. No runtime expansion; update only obsolete OTP/retired
screen expectations. Remaining retest explicitly maxWorkers1, then own browser8082. Default pool
was unintentionally unbounded; wrapper stopped, pool had already completed; no other job interrupted.

## Revision 89 — Parent account chooser integrated and released

Updated 2026-09-13T09:37:59.987262+00:00. Contract4f48a75; runtime65efe80. Parent Welcome-back
now shows the stored local family or prepared Al Noor account, no credential field. One selection
opens Parent Home without a second welcome dialog. Existing creation/replacement and temporary
Child handoff remain available; Feature016 real authentication is unchanged.

All exact source/test/contract/report grants in revision88 are RELEASED, including the added
tests/platform/parent-access-portrait.test.tsx assertion. Helpers zero, no descendants or owned
jobs/browser/Metro. User Metro62701/8082 preserved. No other status/narration source was staged.

TypeScript/full formatting passed; full suite2093 passed with one stale credential-button assertion.
That assertion and one new-test import-order warning were corrected: affected29 tests, subsequent
49 access/handoff tests and final scoped lint/format passed. Browser ordinary AR390x844 and EN320x740:
Parent button→account→home, zero inputs, Back/Create/keyboard entry passed. CSS1.6x text is explicitly
a simulation. Early overlay captures are excluded; settled images are named in the report at
../workstreams/parent-account-chooser.md. Native and named human review NOT RUN.

## Revision 88 — user-selected Parent account chooser

Updated 2026-09-13T09:22:03.791275+00:00; lead M016-root continues on `d2694e6`.
Direct user correction: Parent “Welcome back” must show local/preconfigured accounts and Create new
family; the demo Parent must enter without email, password or code. This changes only local
prototype entry, never Feature016 real authentication. Ordinary preview 62701/8082 is preserved.

Lead reserves `app/access/parent/sign-in.tsx`, `src/i18n/resources.ts`, new
`src/components/access/ParentAccountChooser.tsx`, new `tests/access/parent-account-chooser.test.tsx`,
new `tests/access/local-parent-entry.test.ts`, `tests/presentation/r001-onboarding-flow.test.ts`,
`src/state/usePrototypeStore.ts` for one local entry action, and a small access helper/controller
seam after read-only tracing. Contract amendment: new015 `contracts/parent-account-chooser.md`
and additive015 spec/plan/tasks; report `docs/competition-readiness/workstreams/parent-account-chooser.md`.
No narration, original Welcome, Child picker or real messaging writes are allocated.

One read-only helper `messaging_seams` traces existing authoritative local entry and temporary Child
handoff; no writes, jobs or descendants. Lead owns UI/contract/integration; one serialized focused
check lane followed by isolated browser reuse of8082, no second Metro or native build.
Acceptance: no credential input on this Parent screen; one-tap seeded Parent or existing local
family; existing data and active-role restrictions preserved; Create family and Back remain usable;
AR/EN and compact layout checks; no backend identity or task/progression side effect.
C's latest narration release/repair is acknowledged and preserved; prior failures stay historical.

Revision88 exact helper handoff after the contract commit: `messaging_seams` exclusively owns
new `src/features/access/localParentEntry.ts`, the `enterLocalParentAccount` integration only in
`src/state/usePrototypeStore.ts`, and `tests/access/local-parent-entry.test.ts`. Lead does not write
these files while helper runs. Existing controller/factory public methods suffice; no controller
edit granted. Helper runs no tests/build/browser; lead uses the serialized integrated check lane.

Revision88 validation correction: initial full suite passes 2093 cases, fails only the stale
`tests/platform/parent-access-portrait.test.tsx` expectation for the removed credential button.
Lead additionally reserves ONLY that test's Parent sign-in action assertion; portrait/signup/code
checks remain unchanged. New rendered test import order is corrected under its existing grant.
All helper files released to lead, helpers zero. Native/other source/preview remain untouched.

## Revision 87 — M016 source handoff; allocations released

Updated 2026-09-13T09:12:36.251484+00:00. Contract `45d6796`; integrated messaging runtime `fd6b72c`
on the unchanged shared branch. Independent implementation is complete; real hosted authentication
and two-installation exchange remain BLOCKED because the user confirms no Supabase project exists.
The setup guide and [implementation report](../workstreams/m016-implementation.md) give exact next steps.

M016 releases ALL source grants from revisions 81–84: `specs/016-real-family-messaging/**`,
`.specify/memory/constitution.md`, `src/features/familyMessaging/**`,
`src/components/familyMessaging/**`, `src/components/companion/**`, `app/messages/**`,
`assets/images/companion/**`, `workers/ghaf-family-messaging/**`, `tests/messaging/**`,
`src/services/index.ts`, `src/i18n/resources.ts`, `app/_layout.tsx`,
`app/parent/family/index.tsx`, `app/child/index.tsx`, `app/child/task.tsx`, `app.config.ts`,
`package.json`, `package-lock.json`, and the route-inventory-only grants in
`tests/integration/operator-demo-flow.test.ts`, `tests/presentation/r001-onboarding-flow.test.ts`,
`tests/platform/r003-first-run-experience.test.ts`. The audio owner may now repair the separate
narration assertion in the last file under its own grant. No audio source or other status was staged.
This report and additive board entry release with the final handoff documentation commit.

Final evidence: 29 isolated SQL cases and 216 focused/affected tests passed; scoped lint, full
TypeScript and formatting passed. Shared full suite: 2073 passed / one concurrent narration failure;
shared lint: one unowned audio-test hook error. Expo compatibility check flags 13 existing package
patch updates; newly added SecureStore is not flagged. No broad dependency update was performed.
Browser AR/EN checks include 22 screenshots and explicitly synthetic transport states; they do not
establish hosted Auth or native acceptance. Native and human review remain NOT RUN.

Helpers: zero, all released, no descendants. Owned browser closed, own Metro 62621 stopped,
all isolated SQL/test/check jobs ended; heavy/browser allocations released. Preserve user terminal
Metro 62701 on 8082 and all other sessions' processes/edits. No calling or further source task is
activated. Evidence: `/home/smyk/projects/Ghaf/output/competition-readiness/family-messaging-016-20260913/`.

## Revision 86 — browser complete; integration checks and concurrent-audio notice

Updated 2026-09-13T09:00:32.759466+00:00. M016 browser closed; ownMetro62621 remainsstopped.
UserterminalMetro62701/8082 preserved. Browser fixture evidence distinguishes unconfigured actual
candidate from injectedtransport/preapprovedtask/imageerror/large-text simulation; no provider/native
pass. Corrected Sendvisibility, ArabicBack, selectablewebprop, counterbidi and unboundlocale lock.
Lead holds one final static/fullsuite lane; nohelpers. Exactsource manifest in016receipts.

Concurrent audio owner: current full lint fails ONLY tests/presentation/onboarding-v2-audio.test.tsx:93
(useNarrator called inside lowercase render). This is outside M016ownership; please repair under your
own grant. M016 preserves all onboarding/audio/otherstatus edits and will not stage them. Report at
output/competition-readiness/family-messaging-016-20260913/receipts/lint-final.log.
Final suite:2073passed/1failed, the unrelated narration source-count expectation in
tests/platform/r003-first-run-experience.test.ts:451 expects12requires but currentaudio sourcehas11.
M016 changed onlyrouteinventory lines128–129 in that file; narration assertion remainsowner-controlled.
Lead moves Child messaging entry immediatelyaftercurrenttask/beforeGrowth+futurepreviews, then one
short affectedentry browser confirmation and scopedchecks. No test pool repeats whilebrowseractive.

## Revision 85 — preview collision resolved by stopping our server

Updated 2026-09-13T08:44:17.063016+00:00. Lead started solegrantedMetro62621/8081 at08:42:20UTC
(port previouslyfree). Other session started npm62689/Metro62701 at08:42:22UTC on8082, samecanonical
workspace. M016 stopped ONLY own62621 to remove duplicateworkload; otherprocesspreserved. M016 own
isolatedbrowser may reuse existing8082 aftersource/envcheck, no restart/change of otherowner's
process. Backend/helper jobs allreleased. No test/build pool runs with browser. Initial8081cold
bundle72s exceededMCP60stimeout; page loaded afterward. This isdevcompile, notdeviceperformance.

## Revision 84 — backend committed; lead integration validation

Updated 2026-09-13T08:37:39.895784+00:00. Backende54924f passed29 isolatedSQL cases; cluster55432
stopped. Helper client/controller handoff passed167 tests across7files; final credential-clear guard
adds one focused regression for lead integrated suite. All source paths returned to lead.
Same solehelper now READ ONLY UI/privacy/navigation review, no descendants/jobs/writes.
Review complete/released: lead repairs uppercase enrollment, polling cursor gap and helper draft
identity disclosure. Extend lead test grant ONLY tests/integration/operator-demo-flow.test.ts,
tests/presentation/r001-onboarding-flow.test.ts, tests/platform/r003-first-run-experience.test.ts
to add the contracted /messages route to exhaustive inventories (3 fullsuitefailures;2060passed).
No other existingroute assertion or invariant is weakened. Lead alone
holds serialized full static/test lane, then sole isolated browser/Metro lane at8081 if still free.
No native/build/provider job, no other browser interruption. Concurrent maintenance052b4a8 moves
canonical docs underdocs; follow updatedAGENTS/relocationmap without recreating old root files.
Project still absent. No native/two-device/provider acceptance claimed.

## Revision 83 — independent implementation; no hosted project

Updated 2026-09-13T08:25:41.060470+00:00. User confirms no Supabase project exists.
Hosted Auth, PostgREST and two-install acceptance remain BLOCKED. Backend isolated PostgreSQL
26 checks passed; helper is finishing provider deletion/ban and UUID-envelope hardening with one
short isolated SQL rerun, then releases heavy slot. No browser/Metro/build runs concurrently.

After backend release, the same sole helper messaging_backend takes ONLY
`src/features/familyMessaging/**` and `tests/messaging/**` for lifecycle/security review, focused
behavior tests and necessary fixes. Lead transfers these paths; lead owns UI, resources, registry,
entry/root seams and portrait only. Preserve public controller method signatures or coordinate.
No descendants, commits or coordination writes by helper. One focused Vitest runner may follow SQL;
lead full checks/browser wait release. No other session status/TEAM changes are ours.

## Revision 82 — contract45d6796 committed; first text milestone active

Updated 2026-09-13T08:12:55.293910+00:00. Feature016 contract and bounded
constitution amendment committed45d6796 before runtime. Maintenance owner committedd4d3dd6 and
released package/TEAM/index paths; shared branch preserved. M016-root now activates the exact
runtime seams in revision81. Add `app.config.ts`, `package.json`, `package-lock.json` solely for
Expo57 secure-store measured gap; `.specify/feature.json` local ignored pointer names016.

One helper `messaging_backend` owns ONLY `workers/ghaf-family-messaging/**` for SQL/Auth authorization,
retention/provisioning docs and isolated PostgreSQL tests. No descendants/shared UI/package/index/
board writes. Prior readonly messaging_seams helper complete/released. Lead owns client/controller,
UI/companion, tests/messaging and shared integration. Backend tests wait for explicit heavy-slot
handoff; lead first installs only compatible secure-store. No existing preview/build/test job seen.

Provider choice Supabase Auth+Postgres. Project setup request is concrete in committed quickstart;
no secrets/public deployment/purchase permitted. Independent source continues. One bounded browser
pass after implementation; no actual native/provider acceptance inferred from tests. Current
helper/backend source and lead source grants RUNNING; progress in unique016 evidence directory.

## Revision 81 — user-authorized real family messaging / M016

Updated 2026-09-13T08:02:54.483690+00:00. New integration lead `M016-root` has direct user authority in this
session to publish exact grants and implement the completed C proposal. This is an additive
mission record, not takeover of STATUS-A/B/C/D. A235/B119/C completed messaging-plan release/D088
and the previous audit are acknowledged. All sessions stay in canonical Ghaf; baseline29f9fe4.
Existing uncommitted repository organization/package/docs work is preserved; that owner reports
COMPLETE but its final reservation release is tied to commit. No index/package/TEAM write until
that boundary is reconciled. No currently observed Metro/browser/build/test job; preserve tool servers.

- Contract lead owns new `specs/016-real-family-messaging/**`, this revision/status additions,
  `.specify/memory/constitution.md` bounded amendment, and new
  `docs/competition-readiness/workstreams/m016-implementation.md`. Existing AGENTS managed block
  and all other status writers remain untouched. Source implementation waits contract commit.
- Prospective runtime seams, activated only after committed contract: new
  `src/features/familyMessaging/**`, `src/components/familyMessaging/**`, `app/messages/**`,
  `workers/ghaf-family-messaging/**`, `tests/messaging/**`; lead owns exact integration changes in
  `src/services/index.ts`, `src/i18n/resources.ts`, `app/parent/family/index.tsx`,
  `app/child/index.tsx`, `app/child/task.tsx`, `app/_layout.tsx` as needed. No store/task authority rewrite.
- Companion seam: new `src/components/companion/**`, `assets/images/companion/**` and provenance;
  adapt only original user-created portrait, no Flutter/build/cache import or AI/multi-turn expansion.
- Dependencies: real identity provider / database selection, precise enrollment/retention contract,
  secure native session-storage gap, private service setup and two physical installations. No paid
  service, public deployment, push, main merge or calling activation authorized.
- Acceptance: server-enforced household/participant/device permissions; stable durable ordered
  plain text; idempotent retry/unknown outcome; no fake fallback; AR/EN controls; no task/Seed/Garden
  sync; focused isolation/revocation tests, bounded browser evidence and explicit native gaps.
- Allocation: M016 one helper maximum including descendants (none permitted), initially read-only
  architecture/seam explorer; lead contract/references. At most one serialized test/build job and
  one isolated browser lane after confirming port/process availability. No duplicate Metro.
- Current state: CONTRACT IN PROGRESS, runtime NOT STARTED. Unique progress/evidence:
  `/home/smyk/projects/Ghaf/output/competition-readiness/family-messaging-016-20260913/`.

## Revision 80 — narration v2 intake needs one replacement

Updated 2026-09-13T07:08:47.446496+00:00; currentHEAD87033fd/B5Abrandpreserved. A fileinspection complete.
All6filenamespresent;5MP3sdecode, Sustainabilityv2 is0bytes andcannotplay.
Noapp/source/audiofiles changed; narration remainsoff. Helperaudit released; noheavy/browserjob.
Usermustreplace assets/audio/onboarding/narration-ar-sustainability-v2.mp3 before sixclip
validation/textsync/manualplayback integration. Evidence output/native-integration/015/narration-v2.
B/C/Dstatuses untouched. Existingpreview427191 retained; no newnative/provider/release work.

## Revision 79 — exact restoration complete

Updated 2026-09-12T17:40:45.935059+00:00; final source46e9b58, all4checksPASS/153files/2025tests.
Original6pageonboarding and originaltwo-choiceWelcomerender live; exactstylesequality and real
AR/ENbrowser/3demoaccountsPASS. SeparateParent9afd720 preserved. Oldvoiceoff pendingoptionaluser
choice; noWiamtextmismatch. Earlierreference-led visuals rejected/superseded, retainedas history.
Aallsource/helpers/browser/heavyjobsRELEASED; retain soleMetro427191/8081 andowncoordwriter.
B/C/Dstatusfiles are not staged byA. Native/physicalaudio/studentreview pending; no newAPK,
push/mainmerge/submission/deployment/flags. Resumeonlyforactualnewuserdecision/correction.

## Revision 78 — exact original onboarding and Welcome

Updated 2026-09-12T17:35:44.271639+00:00; latest user rejects reference-led redesign and requires exact original screens.
Contract42b1a07; integrated33a37c1 plus bounded regression cleanup. OriginalFirstRunOnboarding
and originalWelcome JSX/styles restored, two mainParent/Childactions, existing demo authority.
A owns final originalentrytests/report/ledger and owncoordination. Browser all6AR6EN/3accountsPASS;
helpers/browser0. One finalcheckpool, no nativeoverlap. Metro427191/8081 alive after prior1024MiB
heap failure; replacement1536MiB/oneworker. C100 six-file Parent slice integrated9afd720, separate.
B/C/D source/resource allocations released; statuses remain their own. Narrationquestion unanswered,
oldvoiceoff in demo; Wiam retainedwithouttextmismatch. Native/human gates pending. No new feature.

## Revision 77 — six-page restoration and Parent presentation

Updated 2026-09-12T16:43:31.149187+00:00. A228 records selected contract e4ec763/6b8d4bb and exact paths.
A holds entry/story/audio/resource/tests, browser lane queued after C408291 release; no helpers live.
C owns user-authorized four Parent presentation files/new rendered test/own report; source changes
are disjoint and preserved. C finishes already-running408291 under A229, explicitly releases before A capture. D087/088 Child brief ACK, no Child source grant
yet. B native remains paused. A full checks wait meaningful integrated candidate; no duplicate pools.

## Active reference-led restoration

- Revision **76**, updated 2026-09-12T16:30:24.221033+00:00; A continues on7454d27/runtime0da7237.
- User rejects current onboarding/login design and selects restoration of the older screens,
  improved using supplied external templates/components. Existing quick demo authority, narration,
  ordinary access, flags, poster and native build boundaries remain preserved.
- A reserves src/components/demo/**, relevant tests/demo-entry* and demo-narration* tests,
  app/index.tsx, bilingual resources,015spec/contracts/tasks, scoped design/reference brief,
  own evidence/AI ledger/BOARD/STATUS-A. No shared-token/primitive or ordinary-auth behavior change.
- One A read-only helper traces old FirstRunOnboarding/Welcome presentation and reuse boundaries;
  A lead inspects actual extracted external design previews, artboard/layer structures and rights.
  No template execution/dependency/source/assets imported. One existing Metro366844, browser free.
- ACK D086 user-selected Child dashboard reference review: D may prepare its read-only exact
  presentation brief in own report; publish proposed paths/acceptance before implementation grant.
  A's entry/onboarding does not overlap Child dashboard; no D store/token/package edit selected.
- B/C/D own live status files; A does not stage them. New source work needs the bounded restoration
  contract first. No native build, release activation, external submission or history reset.

## Current user correction — visible onboarding and narration

- Revision **75**, updated 2026-09-12T16:18:00.548784+00:00; continuing A-20260911T2220Z-root.
- Runtime0da7237 integrates three fresh-entry story pages, fixed Next/Back, direct profile escape,
  clearer Parent/Salem/Alya entry and explicit Arabic browser narration. Ordinary access unchanged.
- Contract5ab8571/reset clarification6bfea81; source97556cf/cad80c0/0da7237. Human review pending.
- Reproduced/corrected both blanket web denial and premature retirement from optimistic SDK play.
  The separate MCP audio-output error was environmental; the final browser inherited existing
  WSLg Pulse and recorded all3unmuted clocks, Stop/Replay/step/finish cancellation and3profile homes.
  Final screenshots/receipt: output/native-integration/015/onboarding-correction-browser/.
- Existing first candidate passed151files/1993tests. Final0da typecheck/lint/formatPASS, final full
  suitePASS:151files/1995tests. Helper14policy +44controller tests pass; helpers0/browser0.
- One existing canonical Metro366844/8081 remains, normal watching/demo/mock/all11flags off.
  No native build, provider call, new dependency, new recording or public release selected.
- Completed source/report/helper/browser paths RELEASED; A retains own coordination writer,
  user preview and existingADB15824. B/C STATUS files untouched.
  D085 status-write pause ended atc1741cc. No next worker producer or optional feature selected.
- User's original poster/PPTX/gallery remain frozen to98be865 with unchanged hashes. Later app
  correction is linked from poster-handoff.md; no external submission or push has occurred.
- Recovery014 deferred. Native APK/device sound/focus, human review and public audio rights pending.

## Historical poster handoff — native work preserved

- Revision **73**, updated 2026-09-12T13:46:42Z; A-20260911T2220Z-root.
- Required A1portrait PPT/PPTX due20:00Dubai September12. User confirmed English/bilingualGhaf,
  exact team details and finalist qualification. Contacts only in ignored poster output.
- PRINT delivery ready: output/poster-20260912/final-reviewed/Ghaf-Team-SMAC-2026-A1-PRINT.pptx,
  SHA bf0868597d91a8c2850a0c8d180999b3ed2b3093ead1ab62d2d1a2f67d3972ad. Exact594x841mm,
  actual no-font PowerPoint render, independent metadata and D083 visual/copy retest PASS.
  Outlined type preserves printing; separate editable master requires suppliedfonts. Earlier
  fontsubstitution and permanence wording failures are preserved/closed for PRINT delivery only.
- Integrated source/report HEAD4f4c7f3; runtime98be865. Typecheck/lint/format/fullsuitePASS,150files/1979tests.
  Entry/onboarding and Parent/Child presentation integrated, actual bilingual screen evidence ready.
- C70c0bdc report integrated8e28544; D initialb99a656 integrated92a5a6e, finalb9b0f8f integrated4f4c7f3.
  Gallery13originals; C49total originals include before/invalid/superseded rows, not49passes.
- B A171 stopped75 on paging, NO APK; all captured processes released, native/cache preserved.
  Native/listening/physicalprint/rehearsals0of10 remain unrun. Recovery014 deferred;11flags off.
  Student exact-diff/editorial/Q&A and publicaudio rights pending. No submission/upload/push/merge.

## Session registration and resource disposition

| Lead | Actual current disposition |
| --- | --- |
| A | A-20260911T2220Z-root; integrated4f4c7f3/runtime98be865; helpers0; sole Metro225406/8081 for user |
| B | B-NB1-20260912T011745Z-545b9f58; paused/nativecache preserved; helpers/jobs0 |
| C | C-20260912T011718Z-root;70c0bdc released; browser207767 absent; helpers/jobs0 |
| D | D-NB1-20260912T0122Z-root; b9b0f8f fully released/integrated; D085 status-pause ACK; ADB15824 retained |

One helper per lead/four global remains capacity only; no native/heavy/fullcheck job active.
No browser is held after C090 release. D085 acknowledged A219's brief status-write pause. A stages
only BOARD/STATUS-A/STATUS-D; B/C have not acknowledged this pause and their files remain untouched.
After that checkpoint, D may resume status updates; no new task, browser or native grant follows.
No source-file ownership transfers by stale heartbeat.

## Final queue

| Task | State / owner | Result or exact remaining action |
| --- | --- | --- |
| Selected Entry/Story/Parent/Child visuals | Integrated / A | Runtime98be865, existing behavior preserved; actualC/D browser evidence |
| Exact source checks | PASS / A | Typecheck/lint/format/fullsuite150files/1979tests; old failures preserved |
| Poster PRINT/PDF/PNG and gallery | Ready / A | PRINTbf086859; outlined typography;13original gallery captures |
| Final independent poster retest | PASS / D083 | D001/D002 closed for PRINT; D finalb9b0f8f integrated4f4c7f3 |
| C final bilingual/QA report | Integrated / A | C70c0bdc→8e28544; allC source/capture/browser allocations released |
| Native APK/device journey | BLOCKED/deferred during poster | NoAPK; exact source reconciliation and measured later build needed |
| Mounted narration/publicaudio/student review | Pending | No invented lifecycle/listening/rights/human pass |
| Coordination checkpoint | A / final snapshot | D085 ACK permits STATUS-D; commit A/BOARD/D only, preserve unacknowledged B/C |

All source grants are completed/released. No next feature, native retry or optional breadth is
selected by a successful poster. Existing accepted product/access authority remains unchanged.

Handoff cursor: poster and gallery are ready in `output/poster-20260912/final-reviewed/` and
`output/poster-20260912/screen-gallery/index.html`; master report is `../poster-handoff.md`.
All completed A source/report/output/helper allocations are released. A retains its coordination
writer and the user-requested Metro preview (PID225406), plus existing ADB15824. No active producer
or unfinished poster dependency remains. Native resumption needs an exact candidate/resource grant
and later device evidence; no automatic retry. User-added `docs/SMAC 2026/` remains untouched.

## Historical initial task queue — superseded by NB1 grants



| Task          | Owner / state                                    | Dependencies and authority                                             | Acceptance / release condition                                                                                                                                               |
| ------------- | ------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-001         | A / VERIFIED coordination/build-gap audit only   | Current mission, baseline above                                        | Activate grants/worktrees, establish build path, record ownership and truthful gates                                                                                         |
| B-001         | B / INTEGRATED (report/source audit only)        | Existing 003/005/008/013 at baseline; read-only audit                  | Report exact reload/reset and authority paths, smallest recovery design, rationale/memory gaps, failure cases; local report commit and explicit release                      |
| C-001         | C / INTEGRATED (report/source audit only)        | Existing botanical 003 presentation; read-only comparison              | Compare exactly three directions on same real Arabic/English states, recommend one plus small component boundaries; no runtime change; report commit and release             |
| D-001         | D / INTEGRATED (source matrix only)              | Exact baseline above; existing contracts and current mission           | Independent acceptance matrix with evidence class, recovery/privacy failure cases, device/build gaps; source findings separated from unrun checks; report commit and release |
| A-002         | A / REVIEWED DRAFT; user deferred implementation | Relevant B/C/D findings and scope decision                             | Small Spec Kit proposal with scope, ordered modules, acceptance and exact file seams; accepted committed contract before runtime grants                                      |
| B-002         | B / DEFERRED                                     | Accepted recovery story, committed contract and exact grant            | Restart-safe evidence/reset slice; no authority persistence; focused tests and release                                                                                       |
| C-002         | C / INTEGRATED / RELEASED                        | Existing approved botanical presentation at 02b9618; A selection below | One ChildTodayTaskCard presentation refinement, preserved props/callbacks/copy; bilingual state evidence and release                                                         |
| D-002         | D / INTEGRATED, scoped browser evidence          | A publishes exact integrated candidate and scope                       | Independent regression/retest on resulting hash                                                                                                                              |
| B-003 / C-003 | B / C, BLOCKED                                   | Explicit accepted next story/component and prior integration           | Continue bounded batch; no inferred roadmap permission                                                                                                                       |
| A-003         | A / BLOCKED; prerequisite audit allowed          | Verified integrated candidate and build prerequisites                  | Exact local APK/build handoff; human/native gaps remain explicit                                                                                                             |
| D-003         | D / BLOCKED                                      | Exact APK and actual devices/operator                                  | Per-device evidence and actual rehearsals; never inherit browser passes                                                                                                      |

### A-004 original grant — now integrated as ffad798, source released

Authority: Feature 005 FR-008–010 and Story 3 at `02b9618`, plus Feature 003 FR-171 active
role bypass and session-local first-run behavior. Fix QA-04 by routing a validated in-memory
temporary Child-to-Parent handoff from Welcome to existing Parent sign-in before first-run UI.
No persistence, new authority or new capability. Exact paths: `app/index.tsx`,
`tests/temporary-parent-entry-route.test.tsx`, and A's report. Preserve sign-in verification,
cancellation/back and signed-out reset. Acceptance: fresh first-run state + real eligible Child
handoff reaches Parent sign-in; ordinary signed-out reset shows introduction; failed handoff
cannot navigate; authenticated roles retain redirects. Focused behavioral tests, full candidate
checks, D independent retest and pending student review. Original writer: A; completed and released. D actual b2208aa reload/handoff retest passed; native pending.

## Exact grants

All B/C/D worktrees were created by A from the exact baseline. No worker may create an alternative
source worktree or change shared runtime/configuration under the report-only grant. Read-only
access to the canonical checkout, raw references and specifications is permitted.

| Grant    | Worktree                                                         | Exact writable source/report paths                                                                                                                                                       | Writer / state                                                              |
| -------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| A-001-r1 | `/home/smyk/projects/Ghaf`                                       | `TEAM_OWNERSHIP.md`; `docs/competition-readiness/workstreams/a-contract.md`; `docs/competition-readiness/{requests,ai-assistance-ledger,android-build-and-rehearsal,two-device-demo}.md` | A / RELEASED at final checkpoint                                            |
| B-001-r1 | `/home/smyk/projects/Ghaf-demo-systems`, `redesign/demo-systems` | `docs/competition-readiness/workstreams/b-recovery-audit.md`                                                                                                                             | B lead / RELEASED at b1fc581; integrated c9d5ef6                            |
| C-001-r1 | `/home/smyk/projects/Ghaf-ui-studio`, `redesign/ui-studio`       | `docs/competition-readiness/workstreams/c-design-comparison.md`                                                                                                                          | C lead / RELEASED at a356998; integrated1428622                             |
| D-001-r1 | `/home/smyk/projects/Ghaf-qa-rehearsal`, `redesign/qa-rehearsal` | `docs/competition-readiness/workstreams/d-baseline.md`                                                                                                                                   | D lead / RELEASED at242cd49; integrated217f095; new d-candidate grant in r9 |

Canonical BOARD and STATUS-A are A-only; STATUS-B/C/D each lead only. Helpers never write them.
No previous source writer holds these new report paths. Reports include actual prompt, findings,
rejected suggestions, checks, human-review status and exact commit. Grant ACK in own status is
sufficient to start. No dependency installation is required for the initial source audits.

## Integration and review register

Runtime candidate `7fff0f3c2dc0e802ba1da6a67cd2513a75824809`: A-004ffad798, A-0064d26635,
B-004f38f21d, C-0021428622, A-007b2208aa (incomplete strategy), A-0087fff0f3 (root-reset correction).
Typecheck/lint/format/full suite pass,138files/1,677tests. D-005 actual root-reset retest passes its three sequences;
D-R02 browser correction is closed at7fff0f3, native remains NOT RUN. D prior core/access/replacement evidence has separate source
and browser/command/fault scopes, not a blanket matrix pass. Last integrated handoff HEAD713daae; current decision is documentation only.
Draft014ca54e40 is reviewed documentation only and unaccepted; no source grant follows.
All worker authorship preserved, human review PENDING, no student participation invented.

## Decisions / acknowledged requests

- A-DEC-001, revision 1: B/C/D startup requests accepted. Worktrees and report grants exist now.
  ACK `B-20260911T2217Z-001`, `C-20260911T221908Z-root-001`, `D-20260911T2218Z-p177313-001`.
- A-DEC-002: ACK `D-20260911T2218Z-p177313-002`; empty ADB list leaves physical acceptance BLOCKED.
  Engineering and preparation continue. Qualification unknown and named review pending.
- Reports are authorized audits, not new feature approvals. Source proposals require A's contract
  reconciliation before source grants. Keep local prepared/fallible labels and exact +12 fixture.

## Resume cursor

Local batch has no eligible task or expected active handoff remaining. D report93a98c0 integrated
7beb61c; final docs5f8ef4e; runtime candidate7fff0f3 passed four checks and the assigned D browser
reset subset. All source/report/artifact/helper/heavy/preview boundaries are explicitly RELEASED.
A master-doc and draft014 reservations are released too; sole-writer status rules remain. B/C/D
have explicitly finished/paused. No job/helper remains and timestamps never transfer ownership.

Next: supply actual Android build prerequisites plus identified devices/operator for A-003/D-003.
The user has explicitly deferred014 until that APK/native journey is validated. Afterward, any
recovery batch still needs scope acceptance, exact typed-contract review, committed accepted
authority and new disjoint READY grants; validation alone activates nothing. No runtime014/memory/rationale/agenda is authorized by this handoff. Physical/native,
student review/teach-back and qualification stay pending. Primary rehearsals0/10. Preserve user
PDFs, historical worktrees and ignored evidence. No push/main merge/deploy/history rewrite/release
activation. Resume by reading canonical statuses and actual Git before edits.

Revision 2 updated 2026-09-11 22:22:16 UTC: A-004 is an existing Feature 005 repair, not new persistence scope.

## Revision 3 assignments — 2026-09-11 22:23:45 UTC

**C-002-r3:** A selects **Family Field Journal** for this existing card, based on C's same-state
Arabic/English inventory, prior captures/source provenance, the user's preference for a coherent
botanical/non-generic competition UI, and action discoverability. This is A's delegated design
selection, not a claim of named human review or native acceptance. No new product behavior or
style library. After committing C-001, C may edit only
`src/components/r002a/child/ChildTodayTaskCard.tsx` and its existing report in C's worktree.
Keep every mandatory safety/help/award/rationale string accessible, existing props/callbacks,
disabled states and separate progression authorities. Improve action/help proximity and tabular
metadata. No landscape/route/token/i18n edits. Use actual AR/EN states at 320/390, enlarged/long
text, keyboard focus and reduced motion; report browser vs native honestly. C has the preview
lane, one helper and scoped lint/format/typecheck/focused tests; full suite/export still needs the
heavy slot. A releases this exact component exclusively to C. Second landscape proposal stays
BLOCKED until evidence justifies it.

**B-004-r3:** After B-001 report commit, reproduce B-F007 and fix it only if confirmed. Existing
Feature 011 verified family replacement/reset contract at `02b9618` is authority; this is not
new progress persistence. A explicitly releases the entire shared file
`src/state/usePrototypeStore.ts` to B exclusively for the replacement/reset omission; permitted
edits remain bounded to that defect. B also owns `tests/family-replacement-flow.test.ts` and its
existing report. Reproduce recognition before verified replacement, then inspect independent
League and approval/reveal commitments, and repeat the new-family recognition journey. Preserve
verification, atomic failure, all other authorities/flags and no-loss/idempotency rules. Publish
red/green evidence, exact diff/base/commit, focused tests and explicit file release. A and other
leads must not edit the store until B releases it. No new repository/schema or recovery feature.

A ACKs C outbox 002/004: chosen component scope and provenance accepted, second component not
selected yet. C outbox 003 Arabic effort range is retained for A review; no copy edit granted.
A ACKs B outbox 002/003/004: source audit informs proposed recovery contract; B-F007 granted first
because recovery must not preserve stale replacement authority.

A created ignored node_modules symlinks in all three worktrees to the existing main installation
only after byte-equal package-lock comparison. No install/package change occurred. Treat shared
modules as read-only during these grants; do not run npm ci/install against them. A must invalidate
this arrangement before any dependency change. Tool/browser binaries may be read at canonical
absolute paths. Workers test their own worktree source and record its exact hash/dirty candidate.

## Revision 4 planning reservation — 2026-09-11 22:27:03 UTC

A-004 committed as `ffad798` (route/test/evidence), source reviewed, focused 52 tests and typecheck
passed; actual router/native/student review pending. B-001 `b1fc581` and C-001 `0351f9d` source
audits reviewed and locally integrated; this is agent evidence review, not human acceptance.
ACK B outbox 005/006 and C outbox 005. Their report paths remain re-held for granted next tasks;
A does not edit them while workers append evidence.

A exclusively reserves `specs/014-local-progress-recovery/**` and `.specify/feature.json` for a
**DRAFT** Spec Kit proposal. Existing Feature 003 remains the product authority; the tooling pointer
may select this draft for planning, never implementation. No new runtime file granted. Scope:
one local canonical task, validated minimal evidence, separate restored authorities, no stored
sessions/Child assistant/media content, exact reset and family-generation binding. No memory or
new rationale behavior included. D may review the draft read-only as it appears and append issues
to D's existing report; no draft is accepted before its decision and independent review.

## Revision 5 — 2026-09-11 22:30:26 UTC

ACK B-007 RED/GREEN checkpoint and B-008 generated Expo type bootstrap request. A copied only
missing ignored `expo-env.d.ts` from the canonical checkout to worker worktrees; existing generated
files preserved. No package or tracked config change. B may rerun plain typecheck to confirm.
C's preview now live: Metro PID 206383 (npm 206355), exec handle 94621, port 8096; Firefox root
206699/tool session per C status. No native-heavy work allowed while this pair is resident.
The complete 014 draft now contains spec/plan/tasks/data-model/contracts/research/quickstart and
quality checklist, ready for D review. Implementation remains BLOCKED, not accepted.

## Revision 6 — 2026-09-11 22:31:36 UTC

A-006 READY/RUNNING to A: accept C-003's exact Modern Standard Arabic duration proposal as a
candidate copy clarification: `15–30 دقيقة` → `من 15 إلى 30 دقيقة`, English unchanged. Same
fifteen-to-thirty-minute duration, not a changed task/version/award. Exact files A exclusively holds:
`src/features/tasks/demoContent.ts`, `tests/parent-task-flow.test.ts`, `tests/child-task-flow.test.ts`,
and A's report. Update existing expected copy; no mirrored new tests. Existing Feature 003
Arabic-first/RTL task presentation is authority. Scoped checks and actual later browser rendering
required; named Arabic review PENDING. C-002 keeps card-only ownership and must not edit this field.

A added `/node_modules` to local shared Git info/exclude so ignored dependency symlinks do not
appear as candidate source. Existing repository ignore file unchanged. These local links remain
read-only; no install may mutate the shared tree. Heavy slot FREE; C preview still owns its lane.

## Revision 7 — 2026-09-11 22:35:17 UTC

Current integration HEAD `4d26635801b74cd82856b015d7962b996b0b6c67`. D baseline/review reports integrated as `152b053` / `e57d669`,
source at original audit baseline; A-006 copy commit `4d26635` ready for C/D rendering. B-004 actual
red/green is confirmed, source still B-held until explicit release. A-004/A-006 source files are
released; A retains ownership of its report/master docs and draft014. No active A helper/job.

ACK D outboxes 009/010: original @1 oracle now distinct from smaller @2 (+8) and safe-equivalent
@2 (+12); pending Parent/Child negotiation explicit. Draft now includes a closed proposed evidence
allowlist and redacted-content rules. Parent actual bounded task/praise retention is a declared
scope choice; exact recovered-view/receipt mapping remains blocked T004, not implementation-ready.
D may re-hold its report for a review of this completed draft; leave unproven technical cases open.

**C source synchronization grant:** after its current capture batch, C may cherry-pick only
`4d26635` into its worktree, preserving its dirty card/report. That is an A-owned copy/test/evidence
commit, not a new C edit grant. Capture affected duration at the resulting source state. If a dirty
report conflicts, do not overwrite it; report the conflict for A. No force/reset/history rewrite.

Fresh pressure with C preview: 7,645 MiB total, 3,817 MiB available (~50%), 42 MiB swap; latest
one-second sample 0 paging, 97% idle. Four global helper quotas retained; no increase needed.

## Revision 8 coordination checkpoint — 2026-09-11 22:38:01 UTC

B/C/D acknowledged A-013 and paused their status writes; A may stage this exact live snapshot.
B-004 integrated as `f38f21d0de1d84dbaf9dea87c07ec9c2527fa35d` after source/evidence review; B released store/test/report and all
helpers/jobs. A resumes sole shared-store ownership, with no current edit. B has no further READY
code task and paused its turn; later grants require an operator/session resume, not assumed wakeup.
C resolved A's report dependency during authorized copy cherry-pick as `88900c0`; only its card
and report remain dirty, and final preview/commit handoff is active. D continues draft review;
no D runtime/preview job. A helper `/root/android_build_audit` is read-only T004 feasibility, 1/1.

Current source fixes have focused evidence, not full-candidate/native/student acceptance. APK build
blocked on JDK/SDK/device prerequisites. Draft014 is not implementation-ready; no user decision
or accepted new persistence/memory contract exists. Full candidate checks wait only for C's live
handoff; no unrelated feature is being opened to occupy idle leads.

Status checkpoint `1f80f05edd0b10dc642837c247d0d4a0578a4eff` completed 2026-09-11 22:38:28 UTC; A-015 resumes status writes. A helper released.

## Revision 9 — exact integrated candidate and retest — 2026-09-11 22:42:00 UTC

**Candidate `b862eb6f85321935d297a411aaa58744cf72f18b`** includes A-004, B-004, A-006 and C-002.
C-002 worker `a356998` integrated as `1428622`; D report `513ee40` integrated as `b862eb6`.
C source/card/report, helper and preview explicitly released. A reviewed diff and actual paired
Arabic/English 390 captures; no missing mandatory text or new behavior found. Named/native review
remains pending. Source is now frozen for this retest unless a reproduced defect requires repair.

**D-002-r9 READY:** D may first verify its worktree clean, then create/switch a new local branch
`redesign/qa-candidate-20260912` at exact `b862eb6f85321935d297a411aaa58744cf72f18b` in its existing
`/home/smyk/projects/Ghaf-qa-rehearsal` worktree. Preserve `redesign/qa-rehearsal` history. This is
an explicit source synchronization grant, not permission to rewrite or discard dirty work.
D exclusively owns new `docs/competition-readiness/workstreams/d-candidate.md` and ignored QA
artifacts for this candidate; existing source is read-only. Its independent 014 proposal appendix
may stay in a separately regranted report after review; no runtime writes.

D owns the preview lane now (one Metro + one browser tree; record roots/port/handles), and its
existing one helper quota. Use actual normal router interactions for A-004 Child→Parent→Child,
cancellation and reset; verify C card AR/EN compact/large text and A duration; run ordinary canonical
help/submission/praise/+12 once and duplicate no-op where feasible. B replacement may use a labeled
store fault/command probe if normal full setup is too long, distinguishing it from complete UI.
Do not claim injected states prove the full journey. Document offline browser scope separately
from blocked native tests. No full-suite duplication: A owns the one heavy slot for the integrated
checks below. D may inspect its logs and perform only focused new/reproduced concerns as needed.

**Heavy slot: A reserved** for typecheck → lint → format:check → full tests at this exact candidate,
with logs under `output/competition-readiness/integration-b862eb6/`. No native build/install/export.
C heavy/preview/helper released, B no jobs; D's bounded preview may run concurrently with this
non-native suite within observed memory budget. Full test pool capped at two workers.

Draft014 remains unaccepted/unimplemented; A finishes proposal evidence independently of the frozen
runtime. D may append a final draft verdict in `docs/competition-readiness/workstreams/d-baseline.md`
only after explicitly re-holding that report; it is not a runtime-candidate result.

## Revision 10 — integrated checks and proposal disposition — 2026-09-11 22:45 UTC

Full candidate checks on b862eb6 all exit 0: typecheck, lint, format:check, then 138 test files /
1,669 tests (two workers). Exact times and commands: ignored
`output/competition-readiness/integration-b862eb6/results.json`; logs alongside. Runner PID229181 /
exec80818 completed at 22:43:21 UTC, no A job survives. **A heavy slot RELEASED**; D preview stays
reserved for its active retest. No native evidence follows from these checks.

ACK D-014: released proposal-only review242cd49 integrated as217f095. All seven findings addressed
in the draft design; exact typed implementation mapping, failing tests, actual scope acceptance
and native/human evidence remain gates. B-002 stays BLOCKED, no source grant. A commits proposal
documents and refines the current-feature demo independently; b862eb6 remains the runtime target.
B and C have completed and paused with all source/helper/jobs released; no file change wakes them.

### Proposal checkpoint — 2026-09-11 22:46 UTC

Draft014 committed asca54e40; no runtime change and no accepted scope. A presented the concrete
choice to the user: defer recovery until current APK/native validation (recommended), or accept
proposed scope and proceed through exact contract review before implementation. **Answer PENDING**;
time passing is not consent. Continue D's authorized b862eb6 retest and current-feature documentation.
A's generated script removes unbuilt memory/timeline/generalized Coach claims; target150seconds
is not measured. Primary/secondary devices unknown, physical runs0. No new package/build install.

### Resource clarification — 2026-09-11 22:52:20 UTC

Configured capacity remains ten per session; global operating ceiling remains four helpers.
Active task quotas are **A1 / D1**, B0 / C0 while their released workstreams are paused, leaving
two unallocated slots. A's read-only coordination helper and D's helper have completed/released;
A and D currently have zero active helpers. A future eligible B/C grant must reactivate its quota explicitly. This
clarifies released allocations without changing file ownership or increasing pressure. D's preview
remains exclusively D-held; no timestamp or contradictory historical prose transfers it.

## Revision 11 — preview identity failure, retest retained

D-015 identified `../Ghaf-ui-studio/app/index.tsx` served by D's port8097 despite correct disk
HEADb862eb6. **Initial D browser evidence is candidate-ineligible**; mixed-worktree runtime cannot
pass the intended candidate. D retains preview/report scope and is restarting uncached, verifying
loaded source identity before retest. Automated source checks remain PASSED at b862eb6. No product
regression or source edit is inferred yet. A assigns its one helper read-only Expo root/cache
mechanics; no second Metro/browser or overlapping mutation. User recovery choice still pending.

Preview recovery update 2026-09-11 22:55:57 UTC: D reports --clear loads its own app/index.tsx with A004. Relevant uncached retest active; first captures remain ineligible. A cache helper released, zero A jobs/helpers.

## Revision 12 — A-007 reset navigation correction

D-017 directly observed an unhandled POP_TO_TOP development error after Parent reset, intercepting
subsequent verification clicks. Existing Feature003 FR-095/096 authorizes reliable Parent reset
and usable signed-out Arabic entry. This is an existing-contract repair, not new persistence.
A exclusively reserves `src/utils/navigation.ts`, `tests/reset-navigation.test.ts` and A's report.
Installed Expo's dismissAll enqueues POP_TO_TOP without throwing; the existing try/catch cannot
catch a later unhandled action. Candidate approach: consult the supported canDismiss before
queuing a pop, always preserve root replacement and the existing web Back guard. Write the failing
non-dismissable-stack regression, preserve the ordinary dismissable case, then focused/full checks.
D keeps its b862eb6 source read-only and continues independent EN/B/reset work. No source changes
in D until A supplies a committed candidate and synchronization grant; new reset fix needs D's
actual retest. Other dismissAll call sites remain outside this bounded reproduced failure.

## Revision 13 — A-007 committed candidate and correction retest

A-007 committed `b2208aaaf06ec16d7fb12cc0781aeaba754a7eff`: exact utility/test/A-report only.
RED1failed/2passed; GREEN3files/42tests plus scoped lint/format pass. One helper reviewed/released;
its remaining async guard/queued-dispatch timing concern requires actual retest, not more guessing.
A source boundaries RELEASED; no additional runtime edits queued. New candidate sourceb2208aa
includes all b862eb6 fixes. **A reserves the heavy slot** for one four-check run at b2208aa with
max2 test workers and logs under `output/competition-readiness/integration-b2208aa/`.

**D-004-r13 READY after D's active baseline checks/report checkpoint:** retain sourceb862eb6 for
current EN/B/reset investigation, then commit the D-owned report. Verify clean worktree before
creating `redesign/qa-reset-20260912` at exact b2208aa in the same QA worktree, preserving the old
branch. Cherry-pick only your own new-file d-candidate report commit into this branch if desired;
no other source commits, reset or stash. Report/source synchronization is authorized, not a new
runtime edit grant. D keeps the same sole report and ignored artifacts/preview lane.

Restart only the owned preview with --clear and explicit source-root verification. Retest the
observed remembered-Child/reload→temporary Parent→Settings reset sequence and a normal dismissible-
history reset, repeated reset, fresh Arabic/English entry/verification and Back isolation. Require
no unhandled POP_TO_TOP or blocking error toast. Preserve prior failure evidence and identify
exact source/HEAD for correction results. Do not repeat the whole matrix or full suite unless an
actual concern warrants it; A owns full checks. Native/human gates stay blocked/pending. D's final
status pause request A-026 applies after this correction retest, not before its active handoff.

R13 activated 2026-09-11 23:01:43 UTC; current HEAD/source correction candidate b2208aa, older D source evidence remains b862eb6.

## Revision 14 — 2026-09-11 23:03:33 UTC

A's full b2208aa checks completed23:02:40 UTC exit0:138files/1,670tests plus typecheck/lint/format.
Runner251443/exec2855 ended; heavy slot FREE. Current authoritative source candidate is b2208aa,
while D intentionally preserves b862eb6 baseline findings before D-004-r13. A-007 paths released.
No further source work selected unless D reproduces a remaining defect. D has its report/preview
and one helper quota; A0active helpers/jobs, B/Cpaused. User014 decision still pending.

## Revision 15 — A-007 race reproduced; scoped correction re-held

D-020 proves the b2208aa canDismiss guard is insufficient: true at check time, unhandled queued
POP_TO_TOP after reset route change. D-R02 remains OPEN, patch not browser-accepted. A exclusively
re-holds `src/utils/navigation.ts`, `tests/reset-navigation.test.ts` and its report for A-008 under
existing Feature003 FR095/096. Choose a supported root action valid after route collapse, verify
against installed navigation reducer semantics and actual D repro. Other shared route/caller files
are read-only until an exact additional boundary is published. No source edit by D, no config or
provider change. A helper1 read-only API review, heavy slot FREE, D retains preview.

### A-008 exact caller grant and implementation contract

A additionally exclusively reserves `app/parent/settings/index.tsx` and
`src/components/PrototypeStatusBar.tsx`. The public `useNavigationContainerRef()` works at both
locations; the status bar is outside the app Stack, so do not use app-level useNavigation('/')
blindly. Prepare/validate the mounted outer wrapper and nested app Stack before clearing app state,
then one public resetRoot payload retains only the actual wrapper name and sole nested index.
No pop/replace sequence, old routes/keys/params or framework-internal runtime import. Preserve web
Back guarding; missing/invalid navigation shape must leave application data unchanged. Root reset
and browser/native authority remain distinct; D must prove actual URL/Back/fresh-entry behavior.
Reducer tests may import the pinned installed StackRouter in tests only to model the reported race.

## Revision 16 — 2026-09-11 23:19:30 UTC

A-008 implementation follows the r15 exact caller grant: prepared validated nested root reset,
one public resetRoot, no POP_TO_TOP/replace sequence, old route keys/params discarded. RED reducer
race proved on b2208aa;49focused tests pass on draft. A holds four source/test files and report
until coherent checked commit. D-R02 remains OPEN until new candidate's actual retest. D source
b2208aa unchanged. No new UI/feature/package grant. A helper1 read-only, D preview, no heavy job.

## Revision 17 — exact A-008 correction and D-005 retest grant

A-008 committed `7fff0f3c2dc0e802ba1da6a67cd2513a75824809`; four source/test files and A report.
Focused 49 tests, typecheck and scoped lint/format pass; source paths RELEASED. A reserves the
heavy slot for one full integrated four-check run, max2 test workers, ignored logs
`output/competition-readiness/integration-7fff0f3/`. D-R02 is still OPEN pending actual retest.

**D-005-r17 READY**: ACK D-022–024, clean report checkpoints and stopped jobs. In the existing QA
worktree on `redesign/qa-reset-20260912`, verify clean status then cherry-pick ONLY
`7fff0f3c2dc0e802ba1da6a67cd2513a75824809` onto existing HEAD04ffee9. Preserve own report commits
and prior branch history; no reset/stash/source edits. Runtime source should match A-008 exactly;
compare app/src/tests/config/package paths. D retains sole d-candidate report, ignored
`output/competition-readiness/d-7fff0f3/**`, preview lane and helper quota1. Prepare owned --clear
preview, verify actual loaded prepareEntryReset utility and both callers (including sibling
PrototypeStatusBar public container ref). Retest remembered Child actual reload → temporary
Parent → Settings reset, dismissible and root-only history, repeated reset, statusbar /circle,
Back isolation and fresh bilingual verification. Preserve original evidence and classify harness
errors separately. No queued POP_TO_TOP/error overlay or old authorized route may remain. Earlier
core journey source behavior remains unchanged; do not repeat entire suite/matrix without cause.
Only A owns the full suite. Missing native/human gates remain explicit. Final A-026 status pause
applies after finished report release and job cleanup; a grant ACK needs no new routine permission.

## Revision 18 — automated candidate passed; independent browser retest active

A four checks at exact7fff0f3 all exit0,138files/1,677tests,23:23:18–23:24:11 UTC.
Runner276567/exec40754 completed; heavy slot RELEASED. D synchronized A-008 asa1f1852 over its
report-only commits and owns actual retest; do not infer pass from source checks. A additionally
reserves `docs/competition-readiness/README.md` solely to point readers to current execution
reports instead of old baseline QA counts; no product behavior or new feature grant. A one
read-only final-evidence helper completes independently. Current WSL available~4.9GiB after suite,
swap886MiB reflects accumulated paging; one-second sample si4KiB/s/so0,97%idle. No budget increase.

## Revision 19 — D-026 browser correction passed; final handoff active

ACK D-026: three successive Settings/statusbar/root-only reset sequences on source7fff0f3 passed,
with fresh bilingual continuation, Back/reload and guarded deep links. D-R02 closed for this
Firefox development-browser subset, not production/native/full-matrix acceptance. D holds report,
preview278873/exec66015/browser279164 and one read-only evidence helper until explicit release.
A reviews actual traces/settled screenshots and prepares final docs. D raw initial splash captures
are transitional and not signed-out UI proof; exact traces/settled capture decide each claim.
D-R03 Arabic200% CSS secondarylabel clipping stays OPEN/P3; native font scale NOT RUN. Recovery014
remains DRAFT, user scope question unanswered. No new feature/activation selected.

## Revision 20 — final integration, releases and coordination checkpoint

ACK D027 report-only release and A026 status-pause ACK. Reviewed/integrated only
adcec89→4392184, cf2f740→a55621e,04ffee9→61810e5,93a98c0→7beb61c; authorship preserved,
A's duplicate source carrya1f1852 intentionally not cherry-picked. Final docs5f8ef4e pass scoped
format/link59targets/whitespace checks. Source diff versus7fff0f3 is empty across all runtime,
tests/package/config paths; no full-suite repeat for report-only integration. Final A report and
D candidate report carry exact evidence/gaps. Native/APK/human review remain BLOCKED/NOT RUN.

Finished task disposition: A004/A006/A008, B004,C002 integrated; A007 superseded byA008 rather than
counted as another successful fix. D001/002/004/005 reports integrated with exact failed/passed
history. A002 reviewed DRAFT, no accepted runtime grant. A003/D003 blocked on toolchain/APK/devices;
B002/B003/C003 blocked on accepted next contract. No optional feature selected to occupy idle time.

Final path/resource release: all completed A/B/C/D source and report paths, draft014 proposal,
ignored assigned evidence, helper quotas, heavy slot and preview lane released. Canonical status
files keep their named sole writers; A alone stages them. D verified final Metro278873/exec66015
stopped and Firefox279164 closed; A fullrunner276567/exec40754 and all helpers ended. Existing
unrelated ADB/MCP/client infrastructure is preserved. Configured ten/session unchanged; measured
global budgetfour retained, zero active allocation, no forty-helper claim.

Status snapshot basis: D fresh explicit A026 ACK at23:31:33; B explicitly ended with A013 pause
and released all work; C final COMPLETE/PAUSED at22:42:34 after its integration. No new B/C ACK
or participation is invented, and no heartbeat is treated as a lock expiry. Their quiescent final
records are staged as authored; A never edits STATUS-B/C/D. The brief status-write pause ends
once the commit titled `Checkpoint competition handoff and released workstreams` is visible in
Git history. This permits genuine status updates on resume; it grants no new runtime work and
does not wake a session. Read the final cursor before the next task.

## Revision 21 — user decision recorded

User explicitly selected: “Defer recovery implementation until the current APK/native journey is
validated (recommended).” A-009 is a documentation-only decision record at current HEAD713daae,
with exact paths reserved in TEAM_OWNERSHIP. Recovery014 remains unaccepted and gets no runtime
grant. APK/native validation is the next priority. A used one read-only consistency helper, now completed/released;
zero active helpers/descendants/heavy/preview jobs; all B/C/D allocations stay released. A alone edits BOARD/STATUS-A.

User additionally confirms all other Codex sessions stopped. B/C/D remain stopped with their
previously released paths/jobs/helpers; this decision does not wake or restart them. A's bounded
A-009 update records only that decision. No new APK/native evidence, source change or test pass.
Native toolchain/device prerequisites remain the next engineering boundary. The old unanswered
scope-question entries are historical; this explicit deferral supersedes them.

## Revision 22 — NB1 prompt pack prepared; native batch NOT STARTED

User requested new prompts for the stopped sessions. A prepares
`docs/competition-readiness/native-batch/` with A activation and B/C/D role prompts, shared contract
and short launchers. This is not a claim that B/C/D restarted. User must start A activation first;
A then verifies current state and publishes exact live grants. Recovery014 remains deferred.

Prepared clean branches at52c61fc (runtime7fff0f3), prior branches preserved:
B `/home/smyk/projects/Ghaf-demo-systems`, `redesign/native-build-20260912`;
C `/home/smyk/projects/Ghaf-ui-studio`, `redesign/native-ui-20260912`;
D `/home/smyk/projects/Ghaf-qa-rehearsal`, `redesign/native-qa-20260912`.
Each dependency lockfile hash matched and each android directory was absent. Existing symlinks
remain untouched now; B must install private dependencies under the future exact grant before
native generation/build. Prompts are read from the canonical absolute directory because these
worker snapshots predate the new pack. No toolchain install/native build/source change now.

| Future task | Owner/state                                      | Boundary and prerequisite                                                                                                  |
| ----------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| A-N01       | A / NOT STARTED                                  | Activate NB1, inspect state/resources, grant exact worker paths and host-tool scope from shared contract                   |
| B-N01       | B / PREPARED, NOT READY before activation        | build-apk.sh + b-native-build.md; preflight/script, no repeated broad baseline audit                                       |
| B-N02       | B / BLOCKED on A installation/resource grant     | private B node_modules, ignored host-tool/cache dirs; official checksums, real license readiness                           |
| B-N03/04    | B / BLOCKED on toolchain/exact source/heavy slot | standalone internal-rehearsal APK, generated two-script diff, verified receipt; rebuild only a new published runtime       |
| C-N01       | C / PREPARED, NOT READY before activation        | ChildTodayTaskCard.tsx + c-native-ui.md; reproduce D-R03 and minimal contained correction, shared primitives need transfer |
| C-N02       | C / PREPARED proposal, activation required       | c-product-refinement.md; evaluate user ideas and one reciprocal family journey, no new behavior approval                   |
| C-N03       | C / DEPENDENT                                    | native UI checklist and actual artifact verification; no new design direction                                              |
| D-N01       | D / PREPARED, NOT READY before activation        | collect-device-evidence.sh + d-native-acceptance.md; read-only explicit-target tooling and executable packet               |
| D-N02/03    | D / BLOCKED on artifact/owner-selected devices   | independent APK identity, actual primary/secondary journey, C patch retest and real rehearsals                             |

A preparation helpers: prompt writer `/root/sustained_prompts` owns only three new role files;
read-only `/root/android_build_audit` reviewed installed prebuild/Gradle and released. No worker
session or heavy/preview job starts from this table. Future initial allocation is one helper per
lead (four globally), one heavy job, no native build with the resident browser/Metro pair.
Prompt-preparation sample: available4924MiB of7645MiB; swap1521MiB; current sample98%idle,
si8KiB/s,so0. Recheck before native work; no capacity claim for forty agents or total compiler RAM.

User steering during prompt preparation asks whether suggested ideas were researched/implemented.
A read the existing research report and answered: research covers those ideas; actual recent code
is stabilization/refinement, not new calendar/study/money/maps/chat/memory features. The pack now
includes C-N02 `c-product-refinement.md` and A-N04 review of a concrete connected family story,
within proposal-only scope. This is independent useful work while APK dependencies are pending;
it neither accepts a new product story nor reverses the explicit recovery deferral.

Preparation complete: both A helpers released, zero active helpers/jobs or previews. The three
role prompt files were explicitly handed back before A's final product-refinement edits. B/C/D
remain stopped; prepared branches are not running sessions. NB1 has no active execution grant
until the human starts Session A's activation prompt. All prompt-preparation paths are released
at the final documentation commit. Source7fff0f3 and previous138/1677results are unchanged.

## Revision 23 — product diagnosis, requested entry scope and one bounded repair

A-P01 user-authorized source review is complete. Nine findings and a concrete reciprocal support
proposal are in a-product-service-review.md. The user explicitly selects three no-auth synthetic
demo profiles, onboarding redesign and Arabic narration repair; entry-onboarding-contract.md
records product intent, with A-N05 committed Spec Kit/typed contract before source delegation.
A-N05/B-N05/C-N04/A-N06/D-N04 are PREPARED, not active worker grants. Other proposed features stay
unselected; recovery014 stays deferred. B/C/D have not restarted.

A-P02 bounded existing003 correction: helper /root/approved_instruction_fix wrote only
app/child/task.tsx and tests/child-approved-instruction.test.tsx, then released both to A.
Reviewed +10 runtime lines display existing approved Parent wording without altering safety,
checklists, v2, task or progression. RED6fail/12pass; GREEN18 and related86 tests. A holds the
integrated candidate for full checks and local commit. Native/browser appearance NOT RUN.

Read-only assistant/task/audio/access helpers released; one prompt-consistency helper now reads
the final pack, no writes/descendants. A acquires the single heavy slot for sequential four checks;
no preview/native job or installation. A alone writes/stages its coordination records; B/C/D
statuses stay unchanged. Live command ID is recorded in STATUS-A after launch.

## Revision 24 — review/repair complete; revised prompts ready to launch

A-P01 source review, requested-entry brief and A-P02 correction complete. Runtime e02d02b passes
all four checks (139files/1,695tests); no native/browser/listening/student acceptance invented.
All helper allocations released: assistant_service_trace, task_product_trace, approved_instruction_fix
and final read-only sustained_prompts reviewer. The final reviewer found three prompt ambiguities;
A resolved ordinary-versus-demo restart rows, C-N01-only scope wording and the B contract path.
Fullrunner363643/exec21484 completed; no descendants, preview, build or heavy job remains.

Next: activate NB1 using canonical native-batch/README.md and Session A prompt, then the human
starts B/C/D. Initial and future contract-gated tasks are detailed there. Prepared branches remain
52c61fc; synchronize only A's named source before build. Newly selected A-N05/B-N05/C-N04/A-N06/
D-N04 grants are not live yet. The product brief is not an accepted Spec Kit contract. All finished
A source/docs/ignored-evidence boundaries release at this checkpoint; B/C/D statuses are neither
edited nor staged. User explicitly confirmed those leads stopped, so no pause ACK is fabricated.
Only A-owned BOARD/STATUS-A are committed. No push/main merge/remote activation.


## Revision 25 — NB1 activated under the user's Session A instruction

A continuing instance verified clean tracked3b5317a; runtime e02d02b, four checks139/1695.
Prepared clean B/C/D branches remain52c61fc and preserve old history. Each lead ACKs this grant
on actual startup; old statuses do not mean they are running. B/C/D may resume their own status
writes now; no old pause survives this activation. A alone writes BOARD/STATUS-A.

| Task | Owner/state | Exact grant / release condition |
| --- | --- | --- |
| A-N05 | A ACTIVE | specs/015-demo-entry-onboarding/**, .specify/feature.json; spec/plan/tasks/typed contract, D failure review and cohesive commit before runtime grants |
| B-N01-r25 | B READY on ACK | scripts/native/build-apk.sh, workstreams/b-native-build.md, B output/native-build/**; safe preflight/help/missing-input/script tests, commit/release |
| B-N02-r25 | B READY on ACK, bounded | Verify/unlink ONLY B node_modules symlink to canonical; private npm ci unchanged lock under initial heavy slot. B output/native-toolchain/**, output/native-cache/** reserved; propose exact missing tool versions/publisher checksums before tool install |
| B-N03/04 | B BLOCKED | Exact A-published source, verified host toolchain/licenses, private deps and external Metro release. B android/** + transient package.json android/ios script fields only; default template debug certificate internal rehearsal only. No source/package/lock/appconfig upgrade |
| C-N01-r25 | C READY for source diagnosis; preview blocked | src/components/r002a/child/ChildTodayTaskCard.tsx, workstreams/c-native-ui.md, C output/native-ui/**; D-R03 exact source diagnosis/minimal owned repair, shared primitive needs transfer; no guessed fix |
| C-N02-r25 | C READY on ACK | workstreams/c-product-refinement.md; reuse A product trace/research/catalog; concrete proposal and requested entry/onboarding storyboard/script while A formalizes015; no new source yet |
| C-N03 | C READY checklist / native BLOCKED | Same report; real APK/device needed for native rows |
| D-N01-r25 | D READY on ACK | scripts/native/collect-device-evidence.sh, workstreams/d-native-acceptance.md, D output/native-acceptance/**; read-only explicit-target collector and packet |
| D-N04-r25 | D READY review only | Read-only015 draft/typed-contract failure/privacy review, findings in D report/status; no spec/source edits. Native/audio/human rows remain unrun |
| B-N05/C-N04/A-N06 | DEPENDENT | Committed015 contract plus exact new source-path grant; no implementation from roadmap alone |

All workstream report paths above are under docs/competition-readiness/ in the named worker tree.
One helper per lead; no descendants beyond that quota. Initial B heavy slot permits only private
npm ci and bounded tool preparation after fresh pressure check, not native compilation while
external Metro is resident. Current WSL total7645MiB/available3864MiB, swap1461MiB, sample96%idle
with1060KiB/s swap-in and0swap-out; disk896GiB free. Recheck before commands and avoid multiplying
jobs. Native-heavy and C/D preview lanes remain conditional. Do not kill terminal-owned341101.
No SDK terms are accepted by this grant; no public distribution/signing identity change.

A reserves upcoming shared integration src/state/usePrototypeStore.ts, src/services/index.ts,
app/index.tsx, existing access/settings routes as later specified, bilingual resources and a new
explicit demo config, but does not edit runtime before015 commit. Eight R002b flags stay off.
No recovery014, reciprocal-support proposal or optional feature implementation selected.


## Revision26 — active workers, C reports integrated, exact tools and015 draft

ACK B-NB1-20260912T011745Z-545b9f58-001 through004, C-20260912T011718Z-root-001 through005,
D-NB1-20260912T0122Z-root-001. All three actual new leads registered/ACKed r25. B private npm ci
finished/lock unchanged; initial helper writing build script. C reports8b3b9ec/6da17e9 released and
locally integrated; no UI/native pass. D collector and independent draft review active.

B-N02-r26 exact JDK/Gradle serial download/verified extraction grant is A043; same B ignored dirs,
checksums from publisher metadata, no global install. Google SDK/download/licenses and external
terminal Metro pause both await actual user decisions. Native compile/second preview still blocked.
A helper exact isolation/transaction feasibility completed/released. A-N05 spec/typed draft ready
for D read-only review under A044; plan/tasks in progress. A retains all015/managed pointer writes.
C proposed action/support/growth image IDs verified; shared model type precedes later C source grant.
No recovery014 or other proposed feature selection.


A045 update: user explicitly accepted Google's Android SDK License Agreement and the six named
SDK packages. B-N02 exact isolated download/install now AUTHORIZED alongside JDK/Gradle; record
actual accepted terms and checksums, no blanket acceptance of other agreements. Native compilation
remains blocked on the separately pending external Metro pause plus published source/tool readiness.


A046 update: user authorized pause/restart of external canonical Expo. Exact341101 SIGINT ended
its process tree341100/341088; no preview listener8081/8097. B heavy slot now includes native
compilation under the pinned validated toolchain, internal signing and explicit e02d02b source
sync grant. Preserve B's dirty owned files. First artifact is ordinary-mode baseline, not015demo.
A will restore canonical preview in new demo mode once the lane is released and source ready.

## NB1 Feature015 implementation — r28, 2026-09-12 01:35 UTC

Contract authority293d351, requested scope and D004 technical failure/privacy review. Native/student
acceptance pending. Recovery014 remains deferred. A-N05 complete; A-N06 foundation/integration ACTIVE.
A owns exact T003/T004/T005/T007/T008/T009/T011 paths listed in committed015 plan/tasks, including
src/models/demoEntry.ts, src/config/demoEntry.ts and their tests. No source is delegated implicitly.
C-N04 READY after A051 named synchronization; exact four files only: src/components/demo/
DemoEntryScreen.tsx, DemoOnboardingStory.tsx, types.ts, tests/demo-entry-presentation.test.tsx.
B-N05 module/tests remains pending available build boundary and explicit synchronization.
A-N06 helpers: android_build_audit read-only script review, one allocation, no descendants/jobs.
B native-heavy lane remains held; no browser/Metro. Short single-worker tests allowed with pressure
check; latest WSL available4744MiB, swap1375MiB occupied (capacity2048), no quota increase.

B-N05 ACTIVE underA057/A058; native baseline stopped honestly, next target integrated015 demo. C-N04 source931a186/report779717b integrated, paths released. Next native memory/worker budgets and exact archiving/sync conditions are A058. No current Metro/browser/native command; demo preview restart still owed.

## Revision30 — composition correction and adapter integration

Contractd927f61 and B adapter5632005 integrated. A-N06 active: helper task_product_trace exclusively
owns src/features/access/{index.ts,childAccess.ts,parentOnboarding/controller.ts,demoEntryTransaction.ts}
and tests/demo-entry-transaction.test.ts for D-NATIVE-001 shared synchronous rollback correction.
A retains store/routes/tests/demo-entry-store.test.ts and released route tests. D owns independent
composition test; no overlapping writes. Public adapter interface unchanged. B generated-only
Metro max-workers1 approved as A061, with original/diff receipt; no native job until exact candidate.
C isolated narration candidates active; user listening remains pending. Heavy slot A checks, preview
absent and still owed after readiness. One helper per lead, four global unchanged.

A063:2ecea74 transaction correction released, helperA0. D may sync only2ecea74 to its cleanQA
and independently retest unchanged composite regression+transaction suite one worker; own report.
A holds heavy slot for full integrated checks on2ecea74. B script maintenance, C awaits actual
listening/brief integratedpreview. No native/preview running or delegated yet.

## Revision31 — source2ecea74 validated, brief preview before native

A fulltypecheck/lint/format/suite PASS147files/1914tests,02:01:52–02:03:00UTC. Receipt
output/native-integration/015/full-2ecea74/receipt.json. Heavyjob ended, runner438240 released.
A now owns canonicalExpo8081 at runtime2ecea74/currentHEAD78975ca (onlyscript/reportdiff).
C receives solebrowser lane for integrated AR/EN selector/three-story moments/profileentry,
narrow/large-text/Back/missing-media checks; no nativepass, no secondMetro. Artifacts C ignored
output/native-ui/integrated-015/**, report c-native-ui.md reheld. Exactnewsourcecorrections require
reported reproduction and transfer asneeded; current sharedroutes/resources remainA. C retain
existing ChildTodayTaskCard-only diagnostic grant; no guessedfix. Finish bounded checks thenclose
browser and explicitly release so B can build. A will pause ownedMetro with persistentuserpermission.
B may sync/preflight underA064; no nativewhile previewresident. D exactcomposition retestA063
continues singleworker, not fullsuite. Actualphone/listening/student gates remain pending.

A066:MetroPID441606/npm441578/shell441576 owns8081, exec44936, C browserlanegranted. A helper
android_build_audit one read-only store/reset/async review, no writes/jobs/descendants. No native.

A068: tests/demo-entry-store.test.ts transferred from A lead to A helperandroid_build_audit for
one prepared-media/privacy handoff lifecycle test; no runtime edits. Prior read-only source review
found no actionabledefect. C browser grant awaitsACK; operatorstatusasked without inferredstop.
B nativehelduntilpreviewrelease; allotherresourcegrantsunchanged.

A069 ACKC023: C is actively inspecting grantedpreview; user status question is resolved by actual
ACK, no reassignment or restart required. LastWSLavailable2636MiB/7645; no quota increase/heavyjob.

A070:C exclusive output/playwright/176426/** for tool-allowed MCP evidence then copy toC
integrated-015 path; no source changes. Ahelperc3b1cc8 test-only release, helpersA0/sourceunchanged.

A071: Actualuserrejects3ArabicFatima-v1 takes. Samepinnedtool/sameexistingservice permits candidate-
only Hamed/ZariyahMSA firstmoment auditions afterexactvoicemetadata verification; C onehelper may
produce ignored audition-v2 receipts/files serially whileCleadfinishesbrowser. No newprovider,
acceptedruntimeasset orfullregeneration. Englishunreviewed. Nativebuildmustnotwaitforaudioquality.

A072: C exclusively reholds DemoEntryScreen.tsx/DemoOnboardingStory.tsx for reproducedduplicate
heading fix only, existingpresentationtests/scopedchecks. A ownsintegration/restart/fullcandidate;
C affectedheadingretetst after. B native waits correctedcandidate+previewrelease. No newbehavior.

A073 supersedes A071 narrator set with verified ar-SA-HamedNeural and ar-EG-SalmaNeural, exactly
two short same-script auditions. C onehelpermaygenerate ignoredreceipt/files whileleadfinishesUI.

A074: A helperapproved_instruction_fix owns ONLYapp/parent/task/review.tsx and new
tests/demo-task-handoff-route.test.tsx, existing015T020 observedPOP_TO_TOP correction. C twoheading
files remainsdisjoint. Both integrate beforeone correctedcandidatefullcheck/retest/nativebuild.

A075: Cbrowser released. A ownsprimitives.tsx one web-only buttonLabel positionrelative repair
fromreproducedD-R03 before/diagnosticpaint evidence; no font/truncation/nativebusinesschange.
Cheading integrateded51b32. Ahelperhandoffpending; threecorrections shareone nextcandidate/retest.

A076: correctedruntimef16112d; previewoldPIDs+port verifiedended. Aheavyfullchecks, helpersA0.
B exactcleansync ed51b32→af8da6c→f16112d permitted, native waits affectedCretetst+resourcegrant.

A077: current correctedruntimef16112d includesCheadings+webpaint+handofffixes. Prior2ecea74fullpass
remainsattributed; correctedtype/lint/formatPASS/fulltestsactiveexec5643. AllpreviewPIDsended,
Ahelpers0. Ctargetedretetstafterchecks, thenBnative. ThreeFatimaArabicclipsREJECTED; twoHamed/Salma
auditionsawaitactuallistening, ENunreviewed. No acceptedaudio/newfeature.
