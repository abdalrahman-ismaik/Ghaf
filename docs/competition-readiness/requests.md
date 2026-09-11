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
