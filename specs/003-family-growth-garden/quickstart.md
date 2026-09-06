# Quickstart and Verification Guide: Family Growth Garden

**Status**: R003 COMPLETE-SCREEN IMPLEMENTATION CANDIDATE — the validated current worktree extends
runtime checkpoint `40fc5fc` with the dedicated Parent sign-up correction. Typecheck, lint,
formatting, 84 files / 1,044 tests, dependency/configuration checks, a 39-route web export, and
scoped Arabic/English Firefox proxy journeys passed on 2026-09-06. R001/R002a and R002b checkpoint
results cited below remain historical evidence only; physical Android and named human-review
acceptance remain `BLOCKED` or `NOT RUN`.

Use this guide from the repository root. The normative behavior oracle is
`contracts/acceptance-contract.md`; canonical Arabic, fixture content, timing records, build/device
evidence, and reviewer evidence belong in `../../DEMO_RUNBOOK.md`.

## 1. Prerequisites and Evidence Header

- Work from the canonical Ghaf repository on the Feature 003 branch/worktree.
- Use Node.js 22.13 or newer and npm.
- Keep the deterministic prepared providers enabled; no API key, account, camera, microphone, or
  remote service is required for the P0 path.
- Use only the supplied synthetic Al Noor household, synthetic Salem/Alya profiles, synthetic circle
  aggregate, and prepared media/assistant fixtures.
- Obtain a named Android build/device before attempting native acceptance. Web remains a secondary
  preview and evidence proxy.

Before each recorded run, capture the exact source state:

```bash
git branch --show-current
git rev-parse --short HEAD
git status --short
node --version
npm --version
```

Record uncommitted files rather than describing the run as a clean-commit result. Never transfer a
Feature 002 pass into the Feature 003 record.

Every fresh evidence exercise starts `NOT RUN`. Checking whether its named prerequisite is
available counts as an attempt: if the required command, build, device, reviewer, secure boundary,
or other dependency is unavailable, change the result to `BLOCKED` and record that dependency. If
the exercise runs, record `PASSED` or `FAILED`. Do not leave an attempted blocked exercise as
`NOT RUN` or mark an unattempted exercise `BLOCKED`.

## 2. Install and Static Validation

Install the locked dependencies, then run the complete local command set:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
git diff --check
git diff --stat
git status --short
```

Record each command separately as `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN`. `npm ci` may require
package-registry access to populate an empty cache; that installation requirement is separate from
the app's no-network runtime contract.

Inspect `app.config.ts` and the resolved `npx expo config --type public` result. The Feature 003
build must report Android predictive Back enabled (`android.predictiveBackGestureEnabled: true`). A
false/missing value is a static configuration `FAILED` result; a true value does not by itself pass
native Back behavior.

Inspect the authored route inventory:

```bash
rg --files app | sort
rg -n "router\.(push|replace)|<Redirect|href=" app src
```

The current R003 inventory contains 37 route files, excluding framework `_layout.tsx` and
`+html.tsx` files. Confirm the following ownership groups rather than applying the frozen R002a
ten-route count to R003:

```text
Entry and compatibility
  /
  /role                                  compatibility redirect to / only

Parent access and first-family setup
  /access/parent/sign-in
  /access/parent/sign-up              code-native new-family entry before verification
  /access/parent/verification
  /access/parent/family-basics
  /access/parent/add-first-child
  /access/parent/review-create
  /access/parent/family-created-success  route-owned modal

Child access
  /access/child
  /access/child/pin
  /access/child/pair

Parent experience
  /parent
  /parent/task/new
  /parent/task/review
  /parent/check-in
  /parent/family
  /parent/family/reward
  /parent/settings
  /parent/settings/permissions
  /parent/settings/devices
  /parent/reauthenticate

Child experience
  /child
  /child/task
  /child/settings
  /league

Shared role-aware surfaces
  /garden
  /circle

Independent default-off R002b candidates
  /child/reveal/:bundleId
  /garden/impact-path
  /garden/badges
  /garden/badges/:badgeId
  /garden/learn/:learningId/story
  /garden/learn/:learningId/accessible
  /circle/shared-growth
  /parent/family/:profileId/progress
  /parent/family/shared-garden
```

`_layout` files are framework structure, not product routes. Confirm the replaced Feature 002
routes remain absent from `app/`: `/parent/create`, `/parent/generating`, `/parent/review`,
`/child/mission`, `/parent/confirmation`, and `/celebration`. Also confirm every R002b candidate is
still hidden when its own flag is off; the existence of a route file does not release it.

## 3. Start the Deterministic App

For the local Expo development server with remote dependency discovery disabled:

```bash
npm start -- --offline
```

For the secondary web preview:

```bash
npm run web -- --offline
```

For the authoritative physical target, connect the named Android device/build and run:

```bash
npm run android
```

Record the build identifier, device model, Android version, locale, accessibility settings, network
state, operator, observer, and date. If no installable build or device is available, mark Android
`BLOCKED` after that availability attempt and name the missing dependency; do not substitute a web
pass.

## 4. Verify the Canonical Reset First

Open Parent demo controls, choose **Reset synthetic demo**, and confirm. Assert:

- route `/`, no stale Back history, Arabic RTL;
- signed-out experience with no active Parent or Child session;
- Parent and Child entry actions both begin at Welcome and require their own synthetic access path;
- `/role` redirects to `/` and cannot grant either experience;
- synthetic Al Noor household; Salem age 9 and Alya age 11;
- Salem 48 earned Seeds; Alya 36;
- Salem Mangrove 48/60 at Shoot;
- household canopy 19/25 leaves;
- synthetic/local circle 11/12 eligible Green actions;
- no active assignment or submission;
- `guide_recycling_refine_v1`, `coach_recycling_steps_v1`,
  `fixture_recycling_clean_v1`, and `fixture_salem_plan_ar_v1` available with point-of-use prepared/
  synthetic labels;
- deterministic prepared assistant mode; and
- celebration availability and consumption are both `false`;
- no paired Child device, pending pairing request, or active permission proof; and
- private Family Reward returns to its synthetic `promised` state without exposing its amount to a
  Child.

Press native Back once. It must not reveal pre-reset state. Browser Back is only a web history proxy.
Stop and record a reset defect if any value differs; do not patch counters manually.

## 5. Arabic-First Judge Journey

Use the canonical Arabic safety and assistant wording in `../../DEMO_RUNBOOK.md`. Do not improvise
safety-critical Arabic.

| Step | Route / action                                                                       | Required observation                                                                                                                                                                                                      |
| ---: | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | `/` — show disclosure and choose Parent                                              | Arabic RTL; Parent and Child have separate entry actions; household/profiles/media are synthetic; assistant content is prepared/prewritten unless a separately verified live boundary exists                              |
|    2 | `/access/parent/sign-in` → `/access/parent/verification`                             | Local fixture identifier and visible demo code `424242`; this is a deterministic simulation, not production authentication                                                                                                |
|    3 | First run only: family basics → first Child → review → success                       | Synthetic Al Noor/Salem setup remains editable before creation, creates once, and hands off with replaced history; a returning Parent skips setup after verification                                                      |
|    4 | `/parent` — inspect Home, then the Tasks section                                     | Parent bottom navigation is exactly Home, Tasks, Garden, Family; one combined canopy, no raw sibling Seed comparison, and the bounded prepared summary remain visible                                                     |
|    5 | `/parent/task/new` — select Green Impact and P0 recycling task                       | All eight categories and five UAE landscape tracks are local fixtures; the executable P0 task is the 12-Seed `task_recycling_p0_v1`, not catalog `GI01`                                                                   |
|    6 | Enter “Take the recycling out.” and invoke Guide                                     | Prepared `guide_recycling_refine_v1`; Parent text remains unchanged until **Accept suggestion**; disclosure says prepared and may be wrong                                                                                |
|    7 | `/parent/task/review` — inspect, approve, then continue to Child access              | Complete bilingual safety/privacy/reward terms remain visible; approval creates the assignment only; the handoff signs out the Parent and awards nothing                                                                  |
|    8 | `/access/child` → `/access/child/pin`                                                | Choose synthetic Salem and use local PIN `2468`; Alya uses the accessible Leaf → Water → Tree picture sequence; neither credential is production authentication                                                           |
|    9 | First device only: `/access/child/pair` → Parent access → `/parent/settings/devices` | Request pairing; sign in and verify as Parent; approve exactly the pending Child/device; return to the Child pairing route; complete once. Expired, replayed, revoked, or mismatched requests fail closed                 |
|   10 | `/child` — choose the approved task                                                  | Child bottom navigation is exactly Today, Garden, League; lifecycle becomes `chosen`, not `in_progress`; fixed award/help/meaning are visible without exposing private Parent data                                        |
|   11 | `/child/task` — explicitly open/start                                                | Lifecycle becomes `in_progress`; the Parent-approved definition stays unchanged; Coach remains task/version-bound                                                                                                         |
|   12 | Open Coach and choose a bounded intent                                               | Prepared `coach_recycling_steps_v1`; AI-may-be-wrong disclosure; **I need an adult** visible; no unrestricted chat                                                                                                        |
|   13 | Optionally view prepared media, acknowledge the definition, and submit               | Origin and Parent-visibility labels appear; evidence/reflection may be skipped; submission changes zero Seeds/Garden/canopy/League/Reward values and the Child signs out to Welcome for the Parent handoff                |
|   14 | `/` → Parent sign-in/verification → `/parent` → `/parent/check-in`                   | The returning Parent reaches Home, then opens its pending review; facts, permitted help, optional evidence/reflection, uncertainty, and editable action-specific praise are separate                                      |
|   15 | Confirm, then present the final praise                                               | A distinct rendered `praise_presented` state appears; lifecycle is `confirmed`; the four preserved R002a counters remain unchanged and no recognition receipt exists                                                      |
|   16 | Use the separate Parent continuation                                                 | Only this later action applies one guarded recognition result; it is not the same handler/effect as praise presentation                                                                                                   |
|   17 | `/garden`                                                                            | R002a fallback shows Salem 60 and Mangrove 60/60 Sapling with canopy 20/25; symbolic growth is not measured impact or real planting                                                                                       |
|   18 | `/circle`                                                                            | Cooperative aggregate reaches 12/12 from one eligible Green action, not 12 Seeds; it remains separate from the private five-Leaf `/league`                                                                                |
|   19 | Sign out → Child access → `/child` → `/garden` → `/league`                           | The paired Child re-enters through a credential; Today, Garden, and private League are the only Child tabs. A combined R002b reveal appears only when its independent flag is explicitly enabled and receipt parity holds |

Expected route sequence:

```text
/ → /access/parent/sign-in → /access/parent/verification
→ first-family setup when required → /parent → /parent/task/new → /parent/task/review
→ /access/child → /access/child/pin → pairing path when required
→ /child → /child/task → /
→ /access/parent/sign-in → /access/parent/verification → /parent → /parent/check-in
→ /garden → /circle
→ / → /access/child → /access/child/pin → /child → /garden → /league
```

Every Parent/Child change terminates the current synthetic session and returns through Welcome or
the explicit access handoff. `/role` is never part of the normal sequence. Loading, assistant,
pairing waiting/success, retry, awaiting-confirmation, and celebration remain states of their
owning routes.

### Contextual screen-completion sweep

After the core spine, sign in as Parent and verify the remaining destinations without treating them
as extra bottom tabs:

1. Parent **Family** → `/parent/family` → private `/parent/family/reward` → Family.
2. Parent header settings → `/parent/settings` → `/parent/settings/permissions` → typed
   `/parent/reauthenticate` → permissions; an incorrect code changes nothing and local demo code
   `4242` permits exactly the requested change.
3. Parent settings → `/parent/settings/devices`; revoke a synthetic device only after confirming
   the correct Child/device, then prove that Child re-entry requires pairing again.
4. Child avatar/settings → `/child/settings`; permissions are read-only and sign-out returns to
   Welcome.
5. With all R002b flags off, Parent Progress, Shared Garden, Impact Path, Badges, Learning, Shared
   Growth, and combined Reveal entries are absent or safely unavailable. Inspect a candidate only
   with its individual environment flag set explicitly to `true`; do not describe that as release
   activation.

The Step 15 praise state must be visibly rendered before Step 16 becomes available. Capture the
intermediate state and verify the praise-presentation press, callback, effect, or animation does not
also apply recognition. Navigate away from this confirmed pending-praise state and return to
`/parent/check-in`; it must resume the same praise and separate continuation without adding a
receipt or changing a counter.

### Bounded Parent summary correction check

On `/parent`, open the prepared seven-day summary's correction control. Edit one defined synthetic
observable-fact field to another neutral fact, save it locally, and verify the corrected summary is
revalidated and remains strengths-first, time-bounded, uncertain where appropriate, correctable,
and visibly synthetic/prepared. The control must not open chat, arbitrary Child analysis, or a
remote request.

Then enter a character label, diagnosis/condition conclusion, emotion/personality/risk inference,
truthfulness/religiosity judgment, or parenting/family-quality judgment into the bounded field. The
validation must reject it with neutral feedback, retain the last safe summary, and change no task,
reward, Child profile, canopy, or circle state. Repeat the valid and rejected correction checks in
English during the equivalence pass.

## 6. Verify No Early Reward and Dignified Retry

In a separate reset trial, capture the four counters after review, assignment, Child choice, start,
submission, and kind retry. Every capture before first Parent confirmation must remain:

```text
Salem Seeds: 48
Mangrove: 48/60, Shoot
Household canopy: 19/25
Circle: 11/12
```

From `/parent/check-in`, choose **Kind retry**. Verify the task returns to `in_progress`, existing
progress is unchanged, and no failure badge, debt, deduction, public mark, or dying garden appears.
Resubmit with permitted adult help. The displayed 12-Seed award must remain unchanged.

Also verify **Keep mine** on the Parent Guide preserves the original wording, and that a smaller
replacement can change a future displayed award only when agreed before Child acceptance.

## 7. Verify First and Duplicate Confirmation

From an exact reset and valid submitted P0 task, use the first Parent action to validate the edited
praise and render it. Before continuing, record lifecycle `confirmed`, presentation
`praise_presented`, no recognition receipt, and the unchanged reset values:

```text
Salem Seeds: 48
Mangrove: 48/60, Shoot
Household canopy: 19/25
Circle: 11/12
```

Use the separate visible Parent continuation. Only then record the first recognition before/after:

| Counter              |       Before | Required after |
| -------------------- | -----------: | -------------: |
| Salem earned Seeds   |           48 |             60 |
| Salem Mangrove       | 48/60, Shoot | 60/60, Sapling |
| Household canopy     |        19/25 |          20/25 |
| Circle Green actions |        11/12 |          12/12 |

Return to `/parent/check-in` five times for the recognized matching journey and exercise the guarded
duplicate application command in automated coverage. The route must expose only **Already
confirmed** (or the canonical Arabic equivalent), with no retry, praise editor, confirm, or
continuation control. Every attempt must return the same receipt, change none of the four values,
and duplicate no transaction, leaf, event, milestone, announcement, or celebration.

## 8. Verify Route Guards and Reset Matrix

From reset, deep-link or navigate to each conditional route without its prerequisite:

- signed out → any Parent- or Child-private route returns to `/` without private detail exposure;
- active Child experience → any `/parent/**` or `/access/parent/**` route returns to `/child`;
- active Parent experience → any `/child/**` or `/access/child/**` route returns to `/parent`;
- `/role` always redirects to `/` and mutates no session, Child, task, or reward state;
- `/parent/task/review` without a complete candidate returns to `/parent/task/new` and changes no
  assignment/reward;
- `/child/task` without an assignment for the active Child returns to `/child` and reveals no other
  Child's task; and
- `/parent/check-in` admits only an active Parent experience plus the matching journey in one of
  three states:
  `submitted` shows review/retry/confirmation planning; `confirmed` with its pending-praise plan
  resumes the rendered praise and separate continuation; `recognized` with
  `recognition:<submission.id>` resolving to its immutable receipt shows only the neutral **Already
  confirmed** outcome. A missing/mismatched submission, pending plan, or receipt, or any other
  lifecycle state returns to `/parent` and creates no recognition.

Direct `/garden` and `/circle` entry may show safe current aggregate state, but must not infer a
completion or mutate counters. `/league` requires an active Child session and exposes only the
allowlisted private weekly row. A disabled R002b route must use its safe same-role fallback and
must not reveal a hidden candidate through a deep link.

Exercise confirmed reset from every meaningful state: draft, Guide result, Guide fallback,
prepared media selected, prepared media removed, image/audio unavailable fallback, reviewed,
assigned, chosen, `in_progress`, submitted, retry, confirmed/recognized, celebration available,
celebration consumed, garden, and circle. Run five consecutive reset trials per source state for
formal acceptance. Each must restore the full oracle, land signed out on Arabic RTL `/`, revoke
active Parent/Child sessions and pairing/grant state, and leave no stale Back destination.

## 9. Verify External-Service Denial and Fallbacks

With the app already available, deny external network access and run the complete journey five
times. The deterministic Parent Guide, Child Coach, Parent summary, reward, garden, circle, and
reset must remain usable.

Exercise these in-route failure states:

- Parent refinement timeout, malformed structured result, safety rejection, and provider failure:
  retain Parent input and show the same-attempt prepared result with honest fallback status;
- missing prepared image: descriptive synthetic placeholder, no blocked completion;
- missing prepared audio: visible transcript and Coach steps, no microphone request;
- reduced motion or animation failure: immediate final counters/stage and textual cause; and
- unavailable circle fixture: local privacy explanation and household goal without individual data.

The Child Coach must remain prepared-only. If no approved secure server-side Parent provider exists,
record optional live Parent refinement as implementation `BLOCKED` and validation `NOT RUN`; do not
label prepared output live.

## 10. English Equivalence and Native Accessibility

Reset, switch to English, and repeat the full journey. Compare both locales route by route for
equivalent decisions, safety, privacy, fixed award, assistant disclosure, and final counters.

On the named Android build, separately test:

- Arabic RTL and English LTR order, progress direction, and directional icons;
- mixed Arabic/English content, numerals, fixture IDs, 12 Seeds, long labels, wrapping, and Arabic
  diacritics;
- normal-size text at 4.5:1 or better, large text at 3:1 or better, and essential UI
  boundaries/states at 3:1 or better against adjacent colors for applicable WCAG 2.2 AA text and
  non-text contrast;
- resolved Expo config with `android.predictiveBackGestureEnabled: true`, then predictive/system
  Back on a supported named Android OS/device from every conditional route; verify expected guarded
  destinations, no journey mutation, and no stale pre-reset preview/history after reset;
- keyboard avoidance from every editable route;
- 200% font scaling with safety and dominant actions still usable;
- 48×48dp dominant targets and 8dp separation between adjacent small targets;
- screen-reader labels, roles, states, focus order, and once-only announcements;
- prepared audio transcript, prepared-image description, optional removal, and origin labels; and
- reduced-motion final state without reliance on motion, color, or sound.

Record these as physical-device observations. Web layout inspection cannot pass them.

## 11. Privacy and Claim Checks

Use focused tests and a manual scan to confirm:

- raw `Task`, `Submission`, check-in, receipt, or other private domain objects remain inside the
  private recognition boundary and never enter the strict shared projection candidate;
- only the derived minimal projection context enters strict candidate validation; any unknown
  Child/household identity, Seed, task/history, timestamp, media, reflection, assistant, note, or
  other private field is rejected before DTO construction or shared visual/counter mutation;
- valid `child_guardian + circleEligible = false` data yields no shared DTO, while
  `child_guardian + true`, non-Green eligibility, sensitive content, invalid pairings, and malformed
  unknown-field candidates are rejected before mutation;
- duplicate recognition returns the immutable receipt before projection derivation;
- household and circle views contain no raw sibling ranking, podium, first/last state, Child profile
  grid, messages, comments, reactions, discovery, or real invitation;
- the circle adds one family Green action only;
- no wording claims a real planted tree, measured environmental impact, carbon/water/waste value,
  diagnosis, truthfulness, religiosity, parenting quality, food-safety decision, production
  authentication, or legal compliance; and
- no API key, client provider secret, unintended network client, camera/microphone/background
  permission, or real Child data appears in the Feature 003 path.

## 12. Evidence Limits and Handoff

The web preview may support `PASSED (web proxy)` evidence for route reachability, deterministic
logic, console health, basic wrapping, and browser-history recovery. Keep the following statuses
until direct evidence exists:

Apply the transition literally: an unattempted exercise is `NOT RUN`; an attempt that cannot proceed
because its named dependency is unavailable is `BLOCKED`; an executed exercise is `PASSED` or
`FAILED`. The physical Android row below is `BLOCKED` only after the recorded availability attempt
identifies the missing named build/device. Fresh native subchecks that have not been attempted
remain `NOT RUN`.

| Gate                                                                                                  | Current R003 evidence                               |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Automated commands and focused tests                                                                  | `PASSED` — 84 files / 1,044 tests plus static gates |
| R003 role-separated fresh journey                                                                     | `PASSED (web proxy)` — Arabic/English 390×844       |
| Physical Android Arabic/English journey                                                               | `BLOCKED` — no attached device or SDK/toolchain     |
| Predictive/native Back, WCAG contrast, RTL, keyboard, media, reduced motion, screen reader, 200% font | `NOT RUN`                                           |
| Five timed R003 rehearsals against a recorded approved target                                         | `NOT RUN`                                           |
| Three-person comprehension check                                                                      | `NOT RUN`                                           |
| Arabic/UAE cultural, faith, safeguarding, sustainability, accessibility review                        | `NOT RUN`                                           |
| Optional live Parent refinement                                                                       | implementation `BLOCKED`; validation `NOT RUN`      |

After implementation, write actual command, route, build/device, locale, timing, fallback, and human
evidence into `../../DEMO_RUNBOOK.md`. A planning artifact, passing web export, or old Feature 002
record does not make Feature 003 Android-accepted or demo-accepted.

## 13. Verify the Product Experience Redesign Domain Foundation

This verification is source/domain evidence only. It does not exercise a new screen, real account,
payment, invitation, microphone, or native flow.

Run each phase independently:

```bash
npm test -- tests/access-control.test.ts
npm test -- tests/family-reward.test.ts
npm test -- tests/family-league.test.ts
npm test -- tests/assistant-age-adaptation.test.ts tests/assistant-voice-session.test.ts
```

For synthetic access, verify separate Parent/Child projections, no Child email/phone requirement,
pairing approval and one-use consumption, device revocation, action-scoped reauthentication, and
Parent-only permission changes. Repeat every request with the wrong actor, device, purpose, expired
time, replayed value, and revoked device; each must fail closed.

For Family Reward, create Seed-delta, landscape-stage, and landscape-count milestones across money,
experience, privilege, and gift promises. Verify `promised → unlocked → given`, duplicate no-ops,
irreversible unlock, prospective-only edits, matching Child/guardian privacy, protected-category
rejection, and monthly totals grouped by currency. Confirm no API accepts rank, League score,
payment, custody, or a Seed exchange rate.

For Family League, assign exactly five eligible Leaves per participating synthetic Child. Confirm
0/1/2/3/4/5 Leaves map to 0/20/40/60/80/100, extra credit stays at 100, help/adaptation earns full
credit, ties share position, and timestamps are not ranking inputs. Roll to a new week and compare
the supplied permanent Seed/Garden snapshot byte-for-byte. Validate every forbidden projection field
and every non-allowlisted encouragement attempt.

For Coach and voice, test all age bands, maximum steps, tone/pace keys, quick choices, task/version
binding, early adult exit, stored permission, explicit start/stop, prepared transcript review,
delete-before-send, send, captions, 1×/0.75× replay, and reset. Scan the implementation to confirm it
contains no microphone, speech provider, network, audio bytes, background recording, speaker
identity, or biometric path.

Then run the full non-native gate:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

The preserved task, recognition, reward, privacy, and Garden oracles must remain unchanged while
the R003 route/access manifest replaces the old operational ten-route inventory. Frontend craft,
Android, Arabic dialect, real identity, real media, security, payment, and named-human evidence
retain their separately recorded status.
