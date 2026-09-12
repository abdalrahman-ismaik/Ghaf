# Current inspection user requests

These are the exact visible user requests for this inspection, copied from the current conversation
record (the final steering message was copied directly from the active turn). They exclude system/developer
instructions, hidden reasoning, credentials and unrelated sessions. Formatting inside each fence is preserved.
This is not a reconstruction of historical project prompts. See the [assistance ledger](ai-assistance-ledger.md).

## Request 1

```text
ok great, now I want you to run a deep inspection and QA session, I want to solidfy ideas and features and make the app more stable and a competition winner, I have added 2 new folders, the first one is "\\wsl.localhost\Ubuntu\home\smyk\projects\Ghaf\assets\opencode-student-bootstrap" I want you to read it and install all the tools, mcps, skills to this project repo to improve the performance and efficiency and productivity of the work, then I want you to unzip and explore all the templates and files in "\\wsl.localhost\Ubuntu\home\smyk\projects\Ghaf\assets\external templates and designs" which I want to use as helping reference to help me refactor all the old design and pale and stale and ai looking designs and screens. I want you to give me detailed, professional, and super prompts to orchestrate the work between multiple codex sessions, you determine how many required codex sessions with model gpt-6-astra Ultra fast mode to do all of this work. For the ideas as I said I want to solidfy them and make them a winning competition ideas, I thought about a demo where we hold up 2 devices one loged to a child accoun and another loged into a parent account, and we show live demo with pre prepared demo tasks and sequence where we can show most of the features and the most impressive ones. from the external templates I saw I got ideas of adding the map feature to track the child location or help him to achieve tasks that require him to move around and connect that with google maps, also I want to add the calender in different places in the app and I want to integrate it in a proper way to show the tasks in google calender also, maybe also we can add something for the money literacy and monitoring and allocating allowances for children and help them grow there money skills, also I thought about adding studying mode or tasks related to studying and like having goals if the child gets a certain mark or achieves something at the school parents give him a prize or so on and this can be custome made and they can agree on custome goals, for the studying mood also we may add some ideas for children to help them better track their studies and help them undrestand and organize studying better, also I thought about adding a chat between children and parents and between children and each other maybe, look for all of these ideas and the provided templates and do research for the best family practices and scientfic studies to be solid ideas and improve the cognitive, communication, and awarness and everything good in both parents and children.
```

## Request 2

```text
> Which competition and submission/demo deadline are you targeting? If you have them, include the judging criteria, demo time limit, and the two devices you plan to use.

We are targeting Khalifa University’s **Smart Mobile App Contest (SMAC), Summer 2026**, organized by the Outreach Office and Computer Science Department.

Our app is **Ghaf**, an AI-enabled mobile MVP based on the theme **“AI for a Stronger Family Bonds.”** Ghaf uses a growing virtual Ghaf tree to represent family connection: an AI-assisted coach recommends personalized family activities, completing an activity grows the tree, and the experience is preserved as a memory leaf. The app emphasizes UAE identity, shared values, family well-being, communication, and traditions.

### Target deadlines

The official schedule provided in the orientation is:

* Competition kickoff: **Monday, 6 July 2026**
* Coaching Session 1: **Monday, 3 August 2026**
* Coaching Session 2: **Wednesday, 26 August 2026**
* Project submission: **Tuesday, 8 September 2026**
* On-campus demonstration day: **Wednesday, 16 September 2026**, for qualified teams

The project-submission package consists of:

* A **2-3 minute app video**
* A **two-page description** of the app idea and functionality
* The team members’ **GitHub accounts/repository evidence**

Our immediate development target is the on-campus demonstration on **16 September 2026**, subject to the team’s qualification status. The documents specify a 2-3 minute limit for the submitted app video, but they do not provide a separate official time limit for the live demonstration. Until another limit is communicated, please design the main Ghaf flow so it can be demonstrated convincingly in **2-3 minutes**.

The ideal demonstration path is:

1. Open Ghaf and enter a synthetic demo family.
2. Show the family’s growing Ghaf tree.
3. Generate a personalized family activity through the AI Connection Coach.
4. Explain why the activity was recommended.
5. Accept and complete the activity.
6. Show the tree growing and a new memory leaf appearing.
7. Briefly show the family legacy or memory timeline.
8. End with the app’s connection to the SMAC theme and UAE Year of Family 2026.

### Judging criteria

The official scoring rubric is:

* **Idea and theme relevance — 20%**

  * Idea originality and usefulness: **10%**
  * Relevance to the competition theme: **10%**

* **Implementation and usability — 25%**

  * User interface and user friendliness: **10%**
  * Functionality: **15%**

* **Application quality — 20%**

  * Mobile app realization: **10%**
  * Performance and reliability: **10%**

* **Knowledge and GitHub check — 35%**

  * GitHub repository and development evidence: **10%**
  * Q&A session: **25%**

* **Total: 100%**

Please prioritize the work accordingly:

* Ghaf must clearly and directly strengthen family bonds.
* Its Ghaf-tree concept, UAE cultural grounding, and family-legacy experience should make it feel original rather than like a generic organizer.
* The interface should be simple, attractive, interactive, clearly labeled, and easy to use on a real phone.
* The core experience must be functional, not a collection of disconnected mock screens.
* Buttons, cards, text, dialogs, and navigation must display correctly on real mobile screens.
* The demo path must be stable, fast, repeatable, and resilient to missing connectivity.
* The implementation should remain understandable enough for the students to explain during Q&A.
* The repository must show honest, gradual development through meaningful commits, documentation, and genuine contributions from each team member.

### Important competition constraints

* Each team consists of **2-3 participants** and submits one project.
* The project must be relevant to the family-bond theme.
* The result must be a **downloadable mobile application**; a web-only application is not acceptable.
* Participants may use AI as a supporting tool, but AI must not generate the entire application without meaningful student participation.
* All AI usage must be documented, including the prompts used and how the generated material contributed to development.
* The students must understand and be able to explain the resulting code.
* Each participant must use an individual GitHub account so contributions are visible.
* Do not fabricate commits, contributors, meeting minutes, tests, research, or historical activity.
* Do not commit passwords, API keys, personal information, or real child/family data.
* Use mock or synthetic family information for the prototype.
* If the recommendation feature is mocked, rules-based, or running in demo mode, describe that honestly.
* Participants must attend Demo Day physically.
* Late submissions are not accepted.

### GitHub evidence expectations

The judges will examine:

* Consistent development activity throughout the project
* Small, meaningful commits rather than one final upload
* Clear commit messages describing actual changes
* Genuine contributions from every team member
* Organized project files
* A README explaining the app, team, idea, architecture, and run instructions
* Project history and genuine meeting records
* Evidence that the students understand the application

Avoid vague commit messages such as `update`, `final`, `final2`, `stuff`, or `asdf`. Prefer messages such as:

* `Add Ghaf tree growth state`
* `Implement personalized activity recommendations`
* `Fix challenge completion persistence`
* `Improve mobile layout on narrow screens`

Please also maintain an honest AI-usage log containing the request or prompt, what Codex produced or changed, the affected files, and what still requires student review.

### Test and demonstration devices

We plan to use **two Android phones**:

1. **Primary Android phone:** the main development and presentation device, used to demonstrate the complete polished flow.
2. **Secondary Android phone:** used to verify installation, narrow-screen responsiveness, touch behavior, persistence, and reliability on separate physical hardware.

The exact phone models and Android versions have not yet been finalized. Do not assume specific screen dimensions or OS versions. Build responsively for common Android phone sizes, respect safe areas, and avoid layouts that only work on one emulator or device. The app should have a documented path to producing an installable Android APK or equivalent standalone build; an Expo web preview alone is insufficient.

### Product and implementation priority

Treat Ghaf as a polished MVP rather than a production-scale platform. Preserve any viable existing mobile stack. If the repository is empty, use GitHub Spec Kit first and default to Expo React Native with TypeScript unless there is a strong reason to select another supported mobile stack.

Prioritize:

* The living Ghaf tree home screen
* A clear AI-assisted family activity recommendation
* An understandable recommendation rationale
* Challenge acceptance and completion
* A visible tree-growth celebration
* A saved memory leaf or family legacy entry
* Deterministic demo reset
* Local/synthetic data
* Offline-friendly and restart-safe behavior
* Strong mobile UI and accessibility
* Tests for recommendation and progress logic
* README, UX, architecture, AI-use, Q&A, and demo documentation

Do not spend the limited time on production authentication, a complex backend, live location, payments, social networking, real family accounts, or sensitive child data unless the existing project already requires them.
```

## Request 3

```text
> Which scope should drive the roadmap and Codex prompt pack?

Competition-first: stabilize the core journey and add only the strongest demo features
```

## Request 4

```text
so you are not giving me prompts for different codex sessions? by the way I increased the subagents numbers to 10 in the toml file
```

## Request 5 — sustained sessions and shared progress

```text
are these prompts good enough? are they detailed and super prompts? are they professional enough? I want them to work for long hours. and also will these sessions be able to know what other sessions progress? is there a shared file that they can document their progress and findings?
```

## Request 6 — subagent capacity

```text
and also I want them to leverage the ability to use multiple subagents, I raised the limit to 10, if thats safe and the laptop can handle 40 subagents at the smae time then let each session prompt levrage that whenever needed
```

Requests 5 and 6 were copied directly from the subsequent active conversation. They extend the
prompt package and coordination workflow; they do not claim the proposed app tasks were executed.

## Request 7 — execute Session A

The user launched the existing Session A role prompt for this run. Exact supplied role text:

```text
# Session A — product and integration owner

You lead Ghaf's bounded competition-readiness work in `/home/smyk/projects/Ghaf` on
`redesign/ui-experiments`. Use GPT-6 Astra, Ultra reasoning and Fast where available; record actual
settings. Sustain useful work across the assigned multi-hour batch, delivering small inspectable
slices. Completion of the first task is a checkpoint, not the end of this mission. Preserve other
contributors' work, configured capacity ten per session, and the four-session A/B/C/D arrangement.

Read repository instructions in their required order, then the shared contract, strategy, QA,
template catalog, assistance ledger and primary/secondary demo plan. The supplied SMAC orientation
permits supporting AI with a prompt/contribution report and prohibits AI generating the full app.
Record actual prompts, generated contributions, rejected suggestions and human review status.
A missing student name may remain pending; never invent participation, understanding or approval.
Human review gates acceptance of the exact diff, without stopping unrelated authorized work.

## Establish the shared control point

Follow [the coordination protocol](../coordination/README.md). Its canonical absolute directory is
`/home/smyk/projects/Ghaf/docs/competition-readiness/coordination/`. Every worktree reads that
directory; its own checkout copy is not the live board. You alone write `BOARD.md` and
`STATUS-A.md`. Read B/C/D statuses, but never edit them. Do not overwrite another active A instance.
Files provide observable coordination, not automatic message delivery or session wakeups.

Inspect Git status, branch, HEAD, worktrees and ownership before writing. Activate the initial NOT STARTED
board before launching B/C/D; its templates do not mean any future session is already running.
Record the mission, approved scope, ordered task IDs, dependencies, exact paths, committed Spec Kit
authority, owner, state, release condition, integration candidate and heavy-job slot. Begin with
the seeded read-only audits; later proposed tasks stay blocked until eligible. A roadmap is not READY.
Reserve A's shared boundaries and grant only disjoint worker paths. A board grant authorizes the
named task; its lead acknowledges it in its own status without another routine permission round.

Publish UTC time, unique session instance, worktree/branch/HEAD, board revision and active task,
held/released paths, completed commits/evidence, blockers, next action and recovery cursor.
Include live helper IDs and paths, command PIDs and heavy jobs. Append numbered addressed outbox
messages, retaining them until acknowledged. Acknowledge other leads' message IDs in your own
status and reflect accepted assignments/decisions in the board. Never erase an unacknowledged ask.

Refresh all statuses at startup/resume, before assigning or starting a task, after checks/commits,
and roughly every ten minutes of active work. Checkpoint status every 10–15 minutes and on state
changes; user-facing updates still follow the platform's more frequent communication requirement.
Timestamps show freshness, not an expiring lock. Transfer a path only after an explicit release or
the protocol's operator-confirmed stop and your updated grant; a stale heartbeat is not permission.

## Delegate useful parallel work

Apply the protocol's **Delegation and resource budget** section and measured hardware budget.
Activate eligible per-session helper quotas in the board; leads may use their allocation without
asking for each spawn. The initial global budget is four helpers, one per lead, with one heavy-job
slot and the constrained browser/Metro preview lane. Recheck actual pressure before any increase.
Ten configured slots per session are capacity, not validation for forty helpers. Count descendants
against the allocation and reserve deeper delegation explicitly. Do not overlap native-heavy work
with the resident preview pair. Resource grants are separate from file ownership and helper count.

Use helpers for independent contract review, owned policy/test modules, components or read-only
audits while the lead performs useful work. Give each exact paths, accepted contract and required
evidence; state that others are editing and their work must be preserved. Leads alone write
coordination files. Track live helpers/jobs, inspect results and release finished allocations.
Do not split dependent edits, duplicate investigations or start workers merely to occupy capacity.

## Progress through the mission

1. Establish the exact baseline and reproducible build path. Grant B the local journey/recovery
   gap audit, C one three-direction component comparison, and D the independent acceptance matrix.
   Record existing versus missing behavior and turn reproducible failures into bounded tasks.
2. Reconcile each proposed change with accepted Spec Kit authority. Existing approved task classes
   may be planned and assigned under the user's mission. Before new behavior, prepare the smallest
   story, plan, tasks and acceptance contract, obtain any consequential scope decision required,
   and commit the accepted contract before delegation. D reviews its failure and privacy cases.
3. Prioritize local progress recovery and reset, truthful recommendation rationale, then a proposed
   private memory leaf. These are selection priorities, not automatic implementation permission.
   Split each accepted story into ordered, independently verifiable modules and explicit shared
   integration seams. B/C may proceed through multiple eligible tasks without reselecting a mission.
4. Implement A-owned shared changes against the committed contract while workers develop their
   disjoint slices. A owns dependencies, registry, aggregate store, shared routes, tokens and
   localization unless an exact boundary is released and transferred. Give workers stable contracts.
5. Collect released cohesive commits, inspect diffs/evidence and integrate locally under the granted
   authority and applicable review gates. Preserve authorship. Publish the exact candidate, delegate
   D's independent retest, and issue scoped corrections before advancing dependent work.
6. Refine the primary-phone script and explanation packet as verified slices land. After core
   native/recovery gates pass, consider a small local agenda only if explicitly selected before
   freeze. Study, money, maps, Google integrations and chat remain later/post-competition.
7. Freeze features September 14, rehearse September 15 and reserve September 16 for a possible
   qualified-team presentation. Qualification is unknown: verify it before presentation, without
   turning it into a blocker for today's authorized engineering and preparation.

## Keep the demo contract exact

One primary Android demonstrates the complete LOCAL role-separated Parent/Child journey; the
secondary independently checks installation, touch, responsiveness, restart and reset. Record
actual models/OS versions when available. No backend, shared transport, live tracking, payments,
free chat, social network or real-family-data work is selected. Independent installs are not sync.

Preserve `task_recycling_p0_v1`: Parent approval precedes assignment and confirmation; permitted
help earns the full accepted +12 once; retry removes nothing. Default Seeds are 48→60 and Mangrove
48/60→60/60. The gated lifetime 108→120 fixture is separate. Keep lifetime Seeds, Garden,
League/canopy and private Family Reward eligibility as separate authorities and R002b flags off.

Directory/remembered-access persistence is not task/progress continuity. A new recovery contract
must define validated versioned evidence, family/Child/task binding, idempotency, failure handling,
interrupted writes and stale-work invalidation after reset. Never persist privileged authority or
Child-private assistant/media content. A proposed memory records at most one accepted event and
never grants progression. Feature 008 remains private Parent recognition-only with zero progression.

Prepared Parent Guide and local category ranking exist; a generalized live Connection Coach and
user-facing durable memory timeline do not. Keep prepared/local/fallible labels. Do not self-approve
new feature boundaries, packages, remote services, accounts, production claims or release flags.
Choose C's direction once using actual Arabic/English states and the user's preference; retain
Tamagui, Alexandria/Readex, logical RTL and approved local artwork without an app rewrite.

## Validate, recover and finish cleanly

For each slice: acknowledge grant → implement → run proportional checks → inspect diff → make a
cohesive local commit → publish evidence and explicit release → continue the next eligible task.
Create a checkpoint around thirty minutes when work forms a coherent validated state; never
fabricate time, force an incomplete commit or accumulate the entire mission into one catch-all.
Run typecheck, lint, format check and the full suite once per meaningful integrated candidate;
repeat when changes, failures or unresolved concerns justify it. Keep expensive jobs serialized.
Only A stages live coordination records; follow the protocol's brief status-write pause and ACK
before their checkpoint commit. Source integration need not freeze unrelated status updates.

When a dependency blocks one task, publish it and proceed to an independent READY task. A verified
active worker producing the next dependency is in-flight work: continue useful review or bounded
refreshes of at most sixty seconds with user updates until handoff. Do not end merely because the
worker is busy. If no eligible work or active expected handoff remains, publish the exact blocker
and resumable cursor. Do not idle for hours, repeat passing tests or expand scope to stay busy.
Missing human/native gates remain pending/BLOCKED; never invent a pass or hold finished files.

On interruption, record dirty paths, running commands/helpers, last check and exact next action;
retain ownership unless honestly released. On planned pause or completion, stop or safely hand off
your jobs/helpers, explicitly release finished paths and allocations, and state any still-held
boundary. Resume by reconciling the live board, instance, Git state and evidence before editing.

Deliver exact integrated commit/build, bounded before/after changes, checks and evidence paths,
per-device results, student review/Q&A status, remaining defects and a self-contained verdict.
Aim for ten actual 2–3 minute primary-phone rehearsals; this is an internal goal, while the official
video independently has a 2–3 minute limit. Native/human gaps may remain BLOCKED in the verdict.
Omit unfinished optional features from the script. No push, main merge, deployment, submission,
history rewrite or deferred release activation is authorized by this prompt.
```

## Recovery sequencing decision — 2026-09-12 00:49:33 UTC

In response to A's question about proposal014 at ca54e40, the user selected:

> Defer recovery implementation until the current APK/native journey is validated (recommended).

The user then stated:

> by the way, all the other codex sessions also stopped

Disposition: recovery implementation is deferred; current APK/native validation is the next
priority. B/C/D are confirmed stopped and are not restarted by this decision. Their released
commits/evidence remain preserved. No recovery scope acceptance, native pass or automatic future
implementation grant follows. Later scope acceptance and exact typed-contract review remain gates.
