# Four-session Codex work plan

**Next batch after recovery deferral:** use the [product, onboarding and Android prompts](../native-batch/README.md).
The original prompts below preserve the completed batch's history. Start the new A activation
prompt first, then B/C/D; the old recovery queue is not selected. Fresh worker branches are already
prepared, so do not rerun the historical worktree-creation commands below.

Use **four working sessions**, including the integration owner, as the recommended arrangement.
The user's current TOML capacity is **ten** (`max_concurrent_threads_per_session = 10`); preserve
that setting. Capacity and the number of sessions selected for this task are different decisions.
Four sessions allow independent domain, visual and QA work while keeping shared configuration and
product decisions under one owner.
More concurrent writers would add contention around the store, localization, tokens and routes.
This is a coordination choice, not a claim of measured productivity gains.

| Session | Role                               | Paste this prompt                      | Primary result                                                                            |
| ------- | ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| A       | Product and integration owner      | [Session A](session-a-integration.md)  | Approved bounded spec, dependencies, integration checkpoints and final readiness decision |
| B       | Core journey and recovery engineer | [Session B](session-b-demo-systems.md) | An ordered batch of local journey/recovery slices with tested handoffs                    |
| C       | UI and interaction designer        | [Session C](session-c-ui-studio.md)    | An approved sequence of core UI improvements within one bilingual system                  |
| D       | Independent QA and rehearsal owner | [Session D](session-d-qa.md)           | Reproduced failures, acceptance evidence, physical rehearsal and release verdict          |

The supplied organizer orientation prohibits AI generating the full app and requires a prompts/
contribution report for supporting AI. Use these sessions as **bounded assistance**: a named
student owns the assigned batch, understands its behavior, and reviews exact diffs before
acceptance. Routine execution continues across eligible preauthorized tasks while separate reviews are pending. Do not launch the pack as an autonomous replacement for the team's development. The broader waves below are a roadmap,
not authorization to generate every proposed feature. Read the
[assistance record](../ai-assistance-ledger.md) before using any prompt.

Each prompt is written to be pasted as the first message in its own session. The linked shared
contract is part of that task. The inspection package is evidence and a proposal; it does not
silently activate new runtime features. Session A reconciles the selected scope into the active
Spec Kit artifacts before B or C implements new behavior.

## Requested model and speed

Choose **GPT-6 Astra**, **Ultra reasoning**, and **Fast** in each session. These are three separate
settings. The local Codex 0.154.0 model catalog advertises `gpt-6-astra`, `ultra`, and the
`priority` service tier displayed as Fast. A local configuration parse accepted the corresponding
model/effort/`fast` values; that does not prove the tier actually served a model request.

For a terminal session, use:

```bash
codex -C /home/smyk/projects/Ghaf -m gpt-6-astra \
  -c 'model_reasoning_effort="ultra"' \
  -c 'service_tier="fast"' \
  -c 'agents.enabled=true' \
  --add-dir /home/smyk/projects/Ghaf/docs/competition-readiness/coordination
```

Change only the `-C` directory for B, C and D. In the CLI, inspect `/fast status`; use `/fast on`
when the active model/account offers it. In the desktop app, inspect the model, reasoning and speed
selectors. Do not substitute another model or silently downgrade reasoning if a setting is absent.
Record the actual selection and continue with available research only while resolving a missing
required setting. Do not confuse Ultra reasoning with an `ultrafast` service tier.

OpenAI's [Speed documentation](https://developers.openai.com/codex/speed) describes Fast mode and
its increased credit use; it currently lists Astra Fast at 2.5 times the Standard credit rate where
available. The [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
documents project MCPs and independent service-tier configuration. Its generic reasoning enum did
not list the locally advertised Ultra setting at inspection time; preserve that evidence distinction.

The launch command enables helpers and includes the canonical coordination directory as an
additional writable location. The installed CLI exposes `--add-dir`; this is useful when B/C/D
run in separate restricted worktrees. Desktop sessions need equivalent access to that directory.
The configured per-session ceiling stays ten. Actual allocations come from the shared board,
not from every session independently filling its ceiling. Tool installation does not change
an already-running session's model or speed.

## Shared progress and long work batches

The live hub is **`/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/`**.
Read [the protocol](../coordination/README.md) and use [BOARD](../coordination/BOARD.md) as the
mission index. A alone writes BOARD; each lead alone writes its `STATUS-A/B/C/D.md`, recording
progress, findings, commits, blockers, helper IDs, messages and a precise resume cursor.
Every session reads all five files from the same absolute directory. Worktree copies do not
synchronize. Status files communicate published facts; they do not share chat memory, import
another branch's code or wake an ended session.

A publishes an ordered batch with exact file grants and dependencies. Each lead repeats
**read updates → choose eligible task → delegate/execute → check → commit → publish → continue**.
Do not end after one small fix or repeatedly ask permission for already assigned routine work.
Use updates at task boundaries and roughly every 10–15 minutes during substantial work, with
coherent validated checkpoints around thirty minutes. Preserve the runtime's separate user-update
requirements. Student review and native acceptance remain truthful gates; independent eligible
work can continue while those gates are pending.

The [resource assessment](../coordination/resource-assessment.md) measured approximately 7.47 GiB
of WSL RAM and 16 logical CPUs. Start with **four helper slots total across the four leads**, one
each. A may reallocate idle slots and increase gradually toward eight after measuring headroom.
Use one global heavy-job slot and one shared Metro/browser lane. Forty helpers plus four leads
has not been load-tested and is not recommended as the starting workload. Your capacity-ten
setting remains unchanged. Helpers need concrete independent tasks, disjoint write scopes and
lead supervision; their descendants count toward the same allocation.

The prompts can sustain multi-hour batches when useful work and runtime availability permit.
They cannot guarantee a particular unattended duration, bypass account limits or keep a closed
session executing. On interruption, use the protocol's resume message and actual Git/process state.
When all eligible work is complete or genuinely externally blocked, publish the unblock condition
and stop honestly. A may wait in bounded intervals for a verified active worker handoff, keeping
its coordination role available; an in-flight dependency is not proof the whole mission is blocked.

## Worktrees and setup

Session A stays on `redesign/ui-experiments`. The team records the mission, intended human owner and ordered bounded support batch.
A activates the canonical board before delegating source writes. After the inspection package and selected planning
contract are committed, A prepares independent worktrees from that exact checkpoint. Run each
command once; an existing branch/path is a reason to inspect and reuse it, not delete or reset it.

```bash
git worktree add -b redesign/demo-systems ../Ghaf-demo-systems redesign/ui-experiments
git worktree add -b redesign/ui-studio ../Ghaf-ui-studio redesign/ui-experiments
git worktree add -b redesign/qa-rehearsal ../Ghaf-qa-rehearsal redesign/ui-experiments
```

In each worktree, restore the lockfiles with `npm ci` and
`npm --prefix tools/codex ci --ignore-scripts`, then run
`npm --prefix tools/codex run check`. Browser setup is
`npm --prefix tools/codex run browser:install`; remote documentation checks are
`npm --prefix tools/codex run check:online`. See the [tooling report](../tooling-report.md) if a
script name or platform prerequisite changes. Never reuse one mutable `node_modules` symlink across
worktrees with different lockfiles. Tooling dependencies stay outside the mobile application's
package manifest.

Reserve potential development ports A 8081, B 8082, C 8083 and D 8084, but start only the
currently granted preview lane. A port number is not permission to run four Metro servers.
Confirm it is free and record its actual owner/PID before starting. The original reference archives stay in the main checkout's ignored assets
directories; worker worktrees may read that absolute reference path. Extracted images remain
reference-only and must not be copied into runtime without provenance approval. The untracked SMAC
PDF originals also stay in the main checkout; read `/home/smyk/projects/Ghaf/docs/SMAC 2026/` rather
than expecting them in every worktree.

## Sequencing

**Wave 0 — core gap audit and baseline.** A records the settled scope: SMAC KU Summer 2026
family bonds; September 8 submission passed; September 16 subject to qualification; main live
target 2–3 minutes. The official video is also 2–3 minutes, with no separate live limit stated in
the supplied orientation. A reads the rubric, AI-use rule and GitHub guide. B audits the existing
local role-separated task journey, process-local progress, recommendation/rationale and absent
memory leaf. C compares three lightweight directions for one representative component. D records
the exact baseline and native acceptance gaps. No transport spike or backend work is required.

**Checkpoint 1.** A and the named student select the smallest task and exact files. New persistence,
recommendation generalization/rationale or private memory behavior needs a small Spec Kit story,
plan, tasks and acceptance contract before code. B and C receive the same committed contract;
existing R002b flags remain default-off. A prepared Parent Guide/category ranking is not a
generalized live Connection Coach, and Feature 008 private recognition-only ideas create no growth.

**Wave 1 — sustained bounded batches.** Each lead completes one cohesive task at a time and
continues the next eligible assigned item. A named student owns the work and reviews exact diffs
for acceptance; missing review stays pending and does not block unrelated authorized work. B handles a selected local recovery, rationale or memory task; C handles a selected
named UI component, without an all-screen rewrite. D tests the integrated behavior independently.
A alone edits the registry, aggregate store, root dependencies, shared routes and localization
unless an exact file boundary has been explicitly transferred. Log actual prompts, contributions,
rejected suggestions and review status; never invent historical work or student approval.

**Checkpoint 2.** A integrates one cohesive slice at a time, resolves conflicts semantically and
runs applicable checks. D reviews the resulting integrated commit. The primary Android must carry
the complete local Parent/Child journey. The secondary independently checks installation,
responsiveness, touch, restart and reset; exact models/OS versions are recorded when available.
Neither device is presented as synchronized. A source merge or browser capture is not native proof.

**Wave 2 — optional local agenda only.** Consider one small local agenda only after the core
journey and native recovery gates pass and capacity remains before freeze. It needs its own
student-selected story and no progression effects. Study, money literacy, maps, Google integrations,
chat and social networking stay later/post-competition. Do not add backend, live tracking,
payments or real data. Existing gated learning/reveal stays off.

**Wave 3 — freeze and rehearse.** Freeze features September 14; rehearse September 15; September 16
is demo-only for the qualified team. Stop visual exploration. D aims for ten actual primary-phone
rehearsals of the **2–3 minute** core, with restart/reset recovery and the prepared offline path.
Record missing runs as NOT RUN. A prepares the evidence and student Q&A packet. Reopen frozen
screens only for reproduced blockers, and omit an unfinished memory leaf or optional agenda.

## Handoff format

Every session records the actual user prompt and AI contribution, including rejected suggestions.
The named student reviews the exact diff and explains its behavior before accepting it. Record
that review only when it occurs; otherwise mark it pending. Every session reports: commit and
baseline; exact owned paths; behavior before/after; commands and exit codes; visual/native evidence;
unresolved defect IDs; remaining capability gaps; and whether
its files are released for integration. Long reports belong in artifacts, not repeated chat dumps.
No session claims unobserved Android, human-review, live-AI, persistence or memory results.
Publish every handoff and blocker in the canonical role status; a final chat answer alone is not
a handoff another independent session can read.

Useful control messages for A:

```text
Contract checkpoint: <commit>. Human owner: <actual name or review pending>.
Assigned ordered task batch: <IDs>; exact grants and helper quota are in the canonical BOARD.
Execute eligible tasks in order. Preserve others' work; use bounded helpers within your allocation.
After each verified slice, publish its commit, evidence and path release in your STATUS file,
then continue the next eligible assigned task. Do not expand scope or push. Keep required human
acceptance pending until an actual review; continue independent authorized work.
```

```text
Integration candidate: <commit>. Reproduce the canonical journey and defects <ids> on this commit.
Test interrupted/retried/reset states and both locales. Report PASSED/FAILED/BLOCKED/NOT RUN with
specific artifacts. Do not fix product source while acting as independent reviewer.
```

```text
Freeze checkpoint: <commit>. No new features or visual variants. Resolve only reproduced blockers
<ids> in the named boundaries. Rehearse the 2–3 minute local primary-phone core and restart/reset
recovery. Check the secondary installation independently; retain truthful labels and report gaps.
```
