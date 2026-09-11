# B-001 — Core journey and recovery audit

This audit maps the existing local journey and identifies the smallest decisions needed before
restart-safe progress can be implemented. It changes no application behavior and accepts no new
product contract. The report is input to A-002, not approval for B-002 or B-003.

## Identity, scope and authority

- Recorded UTC: 2026-09-11 22:23:34 UTC.
- Writer: Session B `B-20260911T2217Z-3572e5c9`; student owner/reviewer: **PENDING**.
- Worktree/branch: `/home/smyk/projects/Ghaf-demo-systems`, `redesign/demo-systems`.
- Source baseline: `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`.
- Grant: canonical board revision 1, `B-001-r1`; ACK `A-20260911T2220Z-001` in STATUS-B.
- Sole writable versioned path: this report. Live coordination: canonical STATUS-B only; A alone
  stages coordination. App/shared store/registry/routes/config/tokens/i18n remain ungranted.
- Existing authority: Feature 003 spec/plan/tasks and preserved Feature 005 access, Feature 008
  connection planning, Feature 013 Parent Tasks at the baseline. Constitution, product/research,
  design, Growth preflight, limitations, ownership, runbook, shared contract, strategy, QA and
  primary/secondary Android storyboard informed the bounded trace.
- Board 0 was initially unactivated and the B worktree absent. Source tracing began read-only;
  A subsequently created the worktree and granted this report. No template row was self-activated.

## Findings

### B-F002 — current journey and recognition authorities (source trace, not a fresh runtime pass)

All references below are relative to `/home/smyk/projects/Ghaf` at `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`.

1. Parent selection/Guide: `src/components/family-growth/ParentTaskComposer.tsx:130` constructs the profile category plan; `:201` limits executable selection to Salem + Green Impact + the canonical recycling template; `:224` calls the guarded store draft action. Store `src/state/usePrototypeStore.ts:2845` creates the draft, `:2907` requests the prepared Guide with stale-request checks, `:3203` reviews it, and `:3253` approves assignment. Repeated approval checks the exact assignment/task/version/Child/choice before returning unchanged.
2. Child chooses from Today at `app/child/index.tsx:289` through store `:3305`; store `:3329` starts the chosen task. The active Parent/Child guard functions at store `:884` and `:895` require controller authority, not merely a persisted role value. `app/child/task.tsx:192` requests bounded Coach help. Submission at `:290` supplies `permitted_help` and prepared help/facts, then store `:4248` and deterministic task service validate the active Child/journey. It grants no progress.
3. Parent retry is store `:4267` / `:4279`: only journey/confirmation state changes; no counter deduction. Praise planning is `src/components/family-growth/ParentCheckIn.tsx:176` and store `:4527`. Recognition is a distinct later Parent action at component `:219`, guarded in store `:4640`; the provider requires different presentation/continuation action IDs (`src/services/mock/index.ts:1020`). Reopening is not that action.
4. `src/services/mock/index.ts:1035` consults the existing receipt before projecting growth. New recognition evaluates reward rules, filters Green privacy (`:1094`), computes Seeds/landscape and constructs immutable receipt provenance (`:1137`), then returns one next session (`:1185`). The store independently validates provider output and cross-authority parity before the single `set` at `:5033`. It also derives independent Growth, Family Reward, private League and reveal authorities; no screen balance is authoritative. `src/features/tasks/recognitionSession.ts` and `recognitionProviderBoundary.ts` are reusable validation seams, not persistence adapters.
5. Separate default oracles: personal Seeds 48→60, Mangrove 48/Shoot→60/Sapling, cooperative canopy 19/25→20/25, Green Circle 11/12→12/12, private League Salem 4/5 & 80→5/5 & 100. Alya's personal 36 stays unchanged. Source: `src/features/tasks/demoContent.ts:818`, `:830`, `:838`; `src/services/mock/fixtures.ts:323`, `:332`; `src/features/league/presentation.ts:11`, `:51`. Family Reward has its own eligible 108/120→120/120 authority (`src/features/family-hub/index.ts:25`, `:79`); the gated lifetime fixture is separate from default personal Seeds. No restoration or memory may combine these authorities.

### B-F003 — reload loss and existing storage seam (confirmed source; historical browser evidence)

- Startup restores the directory (`src/state/usePrototypeStore.ts:366`) and remembered device preference (`:403`), but gets a fresh prototype session at `:445`, builds Growth at `:452` with reset sequence 0 and fresh other runtimes. `src/services/mock/fixtures.ts:286` begins with no journey/assignment/receipt and the opening counters. The service registry (`src/services/index.ts:109`) supplies only directory, device affinity, ambience and saved Parent-template repositories; it has no task/progress repository. Saved templates and audio preferences are also durable, but are not completion evidence.
- Prior browser QA at `55f9f2b` observed League 100→80, Mangrove 60→48 and canopy 20→19 after reload. Read artifacts: `output/competition-readiness/qa/reload-result.txt` and `reload-garden-and-guard.txt`; attribution remains historical, not B runtime evidence. `git log --oneline 55f9f2b..HEAD -- src/state/usePrototypeStore.ts src/services/local src/features/tasks src/features/assistants/profilePersonalization.ts` exited 0 with no changes in these scoped authorities. This does not create a new browser/native pass.
- Reuse `src/services/local/storageTypes.ts:1`: synchronous get/set/remove; native SQLite sync adapter `storage.native.ts:5`, web localStorage `storage.web.ts:10`, deterministic memory/fail-next-write adapter `storage.ts:7`. Individual repository writes are validated record writes; the interface exposes no multi-key transaction or async cancellation guarantee.
- Family schema 4 (`src/models/localFamily.ts:16`) supports explicit prior-schema migrations through `src/services/local/repository.ts:48`; corrupt/unknown/current data does not become trusted state. New progression needs its own strict versioned minimum-evidence parser and error dispositions, not serialization of the Zustand store or a numeric balance.

### B-F004 — reset/generation contract prerequisites (source findings)

- Parent-only reset (`src/state/usePrototypeStore.ts:2589`) clears affinity, directory, ambience and saved templates in sequence, returns on each error, then recreates controllers/domain/reveal state and signs out in Arabic. It increments runtime resetSequence; it does not persist that sequence. Multi-key interruption can therefore leave some keys cleared before the later operation fails. This is a source-based transaction risk to define/test, not a newly reproduced reset defect.
- All replacement families reuse `household_al_noor` and the same Child IDs (`src/models/localFamily.ts:43`). Family creation uses fixed `R003_LOCAL_FAMILY_TIME` (store `:284`, `:1681`). Runtime profile epoch generation is `prototype-reset-<sequence>:<Child>` (`src/features/growth/bootstrap.ts:82`), and startup initializes sequence 0. Neither these fixed IDs nor timestamp alone safely binds new durable evidence across replacement/reset/restart.
- A's story must define a persisted synthetic family/reset generation and its fail-closed ordering across directory replacement, evidence saves and reset. Old pending work must compare its generation at application/commit time and never recreate deleted evidence. Minimum evidence excludes credentials, controller sessions, permission grants, provider data, Child drafts/reflections/help text/media/transcripts. Restoration must reconstruct a recognized result without reopening celebration or calling a new award action.

### B-F005 — actual recommendation basis and rationale seam (source trace)

- Prepared Guide (`src/services/mock/index.ts:1299`) accepts only bounded synthetic P0/version-one/Green-Impact/9–11 requests; it returns `guide_recycling_refine_v1`, retains Parent wording and requires Parent choice. It is not a general live coach.
- Category helper `src/features/assistants/profilePersonalization.ts:149`: nature/sustainability/gardening → Green; stories/reading/puzzles or `simpler_instructions` → Learning; family_helping → Home; making/drawing → Kindness; fallback Home; stable de-duplication and at most two recommendations. Custom interest/hobby text is reduced by bounded regexes (`:109`, `:131`), not a model. Custom support/accessibility affects coaching style. Opt-out returns no recommendations; `:246` validates all eight categories exactly once, preserves the remaining order and labels prepared/local/fallible/no provider.
- The plan input currently includes sex (`ParentTaskComposer.tsx:136`); the helper uses it for grammatical address, not category ranking (`profilePersonalization.ts:228`; existing regression `tests/required-child-profile-personalization.test.tsx:175`). Nicknames/relatives are absent from this input. Current `PRODUCT.md:254` acknowledges custom fields/grammatical address, while older FR-216/FR-194 wording excludes free text/gender. Do not silently change ranking from that older paragraph or claim all current inputs are curated-only. A's accepted rationale story must reconcile the current custom/accessibility inputs with the latest no-sensitive-content requirement, avoid echoing raw text, and keep gender/identity out of the rationale projection. Any ranking change is a separately explicit contract decision.

### B-F006 — memory remains absent (source inventory)

No memory/timeline/journal/recovery-named module/route/repository exists in inspected `app`, `src/features`, `src/models`, `src/services/local`; registry/startup has no durable memory authority. Internal recognition evidence and reveal queues do not establish a user-facing durable journal. `src/features/family-connections/index.ts:180` produces private recognition-only Parent ideas; PRODUCT Feature 008 says they cannot be accepted/completed/confirmed/rewarded. A separate story must define one private minimal projection from accepted confirmation, audience, retention/deletion, same-family/profile binding, idempotency and zero progression. No general timeline or Child-content archive is implied.

### B-F007 — independently confirmed source omission; runtime reproduction NOT RUN

`src/state/usePrototypeStore.ts:1701` computes replacement reset; its success merge at `:1769` clears session, Growth, Family Reward and reveal queue but does not reset `privateLeague` or `approvalRevealCommitments`. Full prototype reset does reset both (`:2625`). Because Zustand merges partial state, old secondary authorities can remain. Proposed trigger: fully recognize recycling, replace the family, inspect League and attempt the new family's task/confirmation. Expected: fresh independent baseline and no old reveal fingerprint; suspected: retained old League receipt/commitment causing stale display or validation rejection (`:4533`, `:4647`). Existing replacement test `tests/family-replacement-flow.test.ts:197` pairs/changes permission before replacement but never recognizes first and asserts neither authority. Request A's exact reproduction/fix boundary; no code or regression has been written and no runtime failure is claimed.

Independent read-only helper `/root/replacement_audit` found no intervening clear. The session
reset only returns a fresh session; it does not reset the complete store. A retained commitment
makes its count differ from the reset empty recognition ledger (`usePrototypeStore.ts:844`), so
check-in restoration (`:4343`) and confirmation planning (`:4409`) reject the inconsistent state.
Retained League can show the prior 5/5 and 100 result; the current `/league` route has access guards
but no release flag gate. Even replacement before recognition retains the old League epoch, causing
the later award's epoch comparison to fail (`src/features/league/recognitionRuntime.ts:551`).
These are code-derived consequences, not fresh executed reproduction.

Minimal regression: recognize through real store actions, complete verified replacement, assert
empty core ledger/commitments/reveal queue and fresh League matching the new Growth epoch, then
complete the new family's canonical recognition successfully once. Also cover replacement before
recognition and preservation on cancellation/failed final save. Minimal proposed fix paths are
`src/state/usePrototypeStore.ts` and `tests/family-replacement-flow.test.ts`; Feature 011 FR-013
(`specs/011-verified-family-replacement/spec.md:130`) already requires prior progress clearance.
A's explicit grant is still required before editing those shared boundaries.

## Proposed next contract and bounded queue — not approved

The first story should preserve the supported canonical task stages and accepted synthetic evidence,
not merely remember the recognized screen. A must settle assigned/chosen/in-progress/submitted/
confirmed-praise-pending/recognized restoration, the accepted definition-of-done state, and which
checklist state may safely be recomputed. Never restore a submitted/recognized state from an
arbitrary balance or an unfinished action. Define a minimal allowlisted representation rather than
retaining Child-private input or every runtime object.

| Proposed slice                 | Suggested boundary, subject to A grant                                                               | Required decision/evidence                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reproduce replacement omission | Existing `tests/family-replacement-flow.test.ts`; A owns any store repair                            | Recognize first, replace, inspect League/reveal parity, then execute replacement-family recognition; fail before fix                                           |
| Evidence parser                | New `src/features/progress-recovery/evidence.ts`, `tests/progress-evidence.test.ts`                  | Exact known version/keys, family generation, Child/task/version/approval binding, accepted stage, duplicate evidence, unsupported version and corruption       |
| Evidence repository            | New `src/services/local/progressEvidenceRepository.ts`, `tests/progress-evidence-repository.test.ts` | Reuse sync storage; minimum record; known migration only; failure dispositions; interrupted write/load and reset-generation invalidation                       |
| Integration                    | A-owned store, registry, local-family generation/reset boundaries and focused integration tests      | One coherent restore/commit; no partial growth; no persisted authority; no replayed celebration; existing access/directory behavior intact                     |
| Rationale                      | A-accepted follow-on story and exact pure projection/UI grants                                       | Explain actual safe allowlisted basis; reconcile custom/accessibility input; stable categories/opt-out; no identity/sex/raw sensitive text in rationale        |
| One private memory leaf        | Separate accepted story after evidence authority exists                                              | At most one projection per accepted confirmation; audience/retention/deletion defined; no new Seeds, Garden, canopy, League, badges, Reward or learning credit |

These proposed new paths do not exist and are not held by B. A should retain or explicitly transfer
shared seams; a parallel shadow store/repository authority is not a workaround. No new dependency,
remote service, production account, real media processing or R002b flag activation is needed.

A persisted generation must distinguish replacement even when the synthetic household/Child IDs,
Parent lookup value or fixed creation timestamp are reused. A key-value interface with separate
writes cannot by itself prove a multi-key transaction. Specify ordering and recovery for crashes
between durable evidence, family replacement and reset writes; define whether failed durable saving
rejects the commit or leaves clearly labeled recoverable unsaved work. Do not claim success while
silently discarding evidence, and do not partially restore counters from an invalid record.

The accepted confirmation evidence should derive every separate authority through existing bounded
validation/projection logic. Restoration cannot invoke an award action again. A durable deletion or
reset must dominate stale pending work and prevent memory/celebration resurrection. Existing
process-local resetSequence is useful for in-process guards but insufficient as the only restart
identity.

## Acceptance matrix for a future approved recovery slice

All rows below are **NOT RUN for new recovery** because the implementation/contract does not exist.
They describe meaningful behavior to test, not completed checks.

| Trigger                                                                           | Required observable result                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Parent assigns; Child chooses/starts/help/submits; restart at each accepted stage | Restore only validated supported state for that family/profile/version, with zero early progression                                        |
| Parent confirms/presents praise, then interrupts before recognition               | Resume the specified pending state; no automatic recognition, Seeds or new presentation claim                                              |
| One recognized event, duplicate confirmation and repeated reload                  | Same receipt/result; personal 60, Mangrove 60, canopy 20, Circle 12, Salem Leaf 5/5 and score 100; no additional Reward/lifetime authority |
| Wrong role, Child, family generation or task version                              | Reject before any private projection or counter change                                                                                     |
| Missing record                                                                    | Honest fresh supported baseline; no invented completion                                                                                    |
| Corrupt/unknown/truncated record or contradictory evidence                        | No partial restoration or numeric fallback presented as accepted evidence; defined recoverable state                                       |
| Storage read/write unavailable                                                    | Preserve the specified last accepted state and expose failure; no successful-save claim                                                    |
| Failure/crash between each storage operation                                      | Consistent old or committed-new state according to contract; no cross-family restoration or mixed authority set                            |
| Replacement after recognized progress, including reused synthetic IDs             | Fresh replacement baseline; old League/reveal/evidence absent; next valid confirmation succeeds once                                       |
| Reset twice and reset while work is pending                                       | Parent-only signed-out Arabic baseline; stale work cannot restore deleted family/progress, reopen celebration or add memory                |
| Restoration/reopen of an already viewed result                                    | No fresh animation-owned award; consumed/pending presentation follows explicit contract                                                    |
| Memory absent/deleted/restored/reopened repeatedly                                | Zero progression; no leaf without its accepted confirmation; no recreated deleted leaf                                                     |
| Optional service failure or no network                                            | Same prepared local path; no private provider input retained                                                                               |

Existing regression sources to reuse include `tests/task-lifecycle.test.ts`,
`reward-matrix.test.ts`, `prototype-state.test.ts`, `recognition-provider-store-boundary.test.ts`,
`local-family-repository.test.ts`, `device-remembered-access.test.tsx`,
`family-replacement-flow.test.ts`, `profile-task-recommendations.test.ts` and
`required-child-profile-personalization.test.tsx`. Their existence is not a new pass. A grants the
full-suite slot; D verifies A's integrated commit. Native cold start/process death, SQLite behavior,
Back/keyboard/permissions/audio and physical-device acceptance require the installed build on the
primary phone plus independent secondary checks. Unit adapters/browser snapshots cannot pass them.

## Evidence and verification

- **PASSED source inspection**: baseline/branch/clean B worktree established; registry/startup,
  transition, receipt, projection, storage and reset paths inspected at the recorded hash.
- **Historical FAILED restart continuity**: original browser QA `55f9f2b`, artifacts named in B-F003;
  read directly here, not rerun or relabeled. Scoped Git history confirms no intervening change
  to the listed core authorities through `02b9618`.
- **NOT RUN**: fresh application tests, typecheck, lint, full format, browser, native and live provider.
  No runtime changed and no heavy/preview job was granted for this report-only task.
- **PASSED source review**: helper independently confirmed B-F007 and supplied the failure path;
  B reviewed the finding and incorporated it with runtime reproduction explicitly NOT RUN.
- **PASSED documentation checks**: scoped Prettier, report local-link resolution and seven primary
  source-path existence checks, all exit 0. Final staged whitespace/format checks also passed with exit 0.
  Student ownership, understanding and exact-output review remain PENDING.
- Initial read in the absent B worktree could not create a process; no shell exit code exists.
  `pdftotext` was unavailable (exit 127); existing local SMAC orientation page 10/13/17 extraction
  and GitHub-guide text were read instead. No package installed and no raw PDF changed.

## Actual AI prompts and contribution

User's full supplied Session B task is preserved in
[`session-b-demo-systems.md`](../orchestration/session-b-demo-systems.md) at `02b9618`, Git blob
`aa81893a4273f2507666a0700d09312f9031f28c`. There was no additional user follow-up during this audit.
The explicit read-only direction included: “If the queue has no code grant, begin the read-only gap
audit and publish findings or proposed tasks in your outbox.”

Lead runtime identifies GPT-6. User configuration reads `gpt-6-astra`, reasoning `xhigh`, tier `fast`;
project configuration sets none of those keys. Effective runtime reasoning/tier is not exposed;
Ultra is not verified and no settings were changed. Helper launcher accepted `gpt-6-astra` and
`ultra`; it exposes no Fast-tier override.

Actual prompt sent to read-only helper `/root/replacement_audit`:

```text
Session B helper under live board revision 1, quota one. Worktree /home/smyk/projects/Ghaf-demo-systems, branch redesign/demo-systems, baseline 02b9618631fa9fc1b29f2cda5fa68c6adb2003fd. READ ONLY; no writes, commits, tests, heavy jobs, browser or descendants. Others are editing; preserve all changes. Concrete question: after canonical recycling recognition, does successful family replacement reset privateLeague and approvalRevealCommitments consistently with session/growth/reveal state? Inspect exact source src/state/usePrototypeStore.ts replacement branch (~1640–1820), its recognition/selector consumers and tests/family-replacement-flow.test.ts. Lead found the partial replacement set omits these fields; independently determine whether any other path clears them, likely observable consequence and a minimal meaningful regression scenario. Cite exact lines. Distinguish source inference from reproduced runtime defect. Read applicable repository instructions/shared contract as needed. Return concise evidence, any rejected hypothesis, and minimal fix boundaries for A; do not implement. Lead is writing only docs/competition-readiness/workstreams/b-recovery-audit.md in parallel. Requested helper launcher GPT-6 Astra / ultra; Fast not selectable here. Report actual settings visibility honestly.
```

Actual helper follow-up: “Thanks. That is enough for the report; finalize with the concise source
conclusion, minimal regression/fix boundary, and explicit release/no jobs. Do not expand inspection.
I will keep it labeled source-confirmed omission, runtime reproduction NOT RUN.”

Generated contribution: this bounded source audit, failure hypotheses, recovery-story proposals,
acceptance matrix and student explanation, plus B's coordination entries. No application, test,
image, native build or new product feature was generated. Supporting skill:
`.agents/skills/ghaf-quality-workflow/SKILL.md`. Rejected/deferred suggestions: serializing the whole
store or balances; using fixed fixture IDs alone for replacement binding; treating internal timelines
as a built memory feature; broadening recommendations without a contract; claiming source review as
runtime/native/student acceptance. Helper contribution: independently traced the replacement omission, its stale League epoch and
recognition-commitment consequences, and proposed the minimal regression. Rejected hypothesis:
calling the session reset implicitly clears the complete store. Its interim claim that League was
gated was withdrawn after inspection. Its final “worktree remained clean” statement is not adopted:
the lead-owned report was already untracked; the correct claim is that the helper wrote nothing.
No runtime result was fabricated. Helper is complete/released with zero jobs or descendants.

## Student explanation and integration handoff

A remembered family is different from remembered progress. The app currently remembers who was set
up and which local access experience to restore, but starts a fresh task and garden session. During
one running session, a Child submission asks for Parent review. Parent praise appears before a
separate action applies the fixed award. The accepted receipt then supports distinct Seed,
landscape, cooperative, League and private Reward calculations. Help keeps the accepted award; a
retry does not subtract anything.

A restart-safe version needs to remember the minimum validated evidence that an action was accepted,
then reconstruct the same result once. It must know which generation of the local family owns that
evidence, because this prototype reuses its synthetic IDs. A memory leaf would only display an
acknowledgment derived from that evidence. Reading it must never act like completing another task.
These are proposed behavior and design decisions, not capabilities this audit implements.

A may review/integrate the report-only commit once released in canonical STATUS-B. No code patch,
recovery acceptance, human review or flag activation follows from integrating this report. B releases
the report boundary through canonical STATUS-B after the validated report commit. No shared
runtime path is held; no push, deployment or history rewrite is authorized.

## Final report verification

Document-only checks use the already installed formatter from the main checkout; no worktree
installation or heavy slot was needed. Commands are run from the B worktree:

```text
/home/smyk/projects/Ghaf/node_modules/.bin/prettier --check docs/competition-readiness/workstreams/b-recovery-audit.md
git diff --cached --check
```

Both final commands passed with exit 0. The report commit is published in canonical STATUS-B. The commit containing this report is discoverable with `git log -1 -- <report path>`;
there is no self-referential commit hash written into its own content. Application behavior before
and after this report is identical. No application/native/physical rehearsal check is implied.
