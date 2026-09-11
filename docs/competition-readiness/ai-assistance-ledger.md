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
