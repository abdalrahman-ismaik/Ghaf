# Acceptance Contract: Family Growth Garden

## AC-00 — Split R002 Design-Intake Authority

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

R001 Batch 1 remains a frozen regression baseline: `/`, `/access/parent/sign-in`,
`/access/parent/verification`, `/access/parent/family-basics`,
`/access/parent/add-first-child`, `/access/parent/review-create`, and modal
`/access/parent/family-created-success`, followed by history replacement into `/parent`.

R001 acceptance requires deterministic local access labels, route prerequisites, draft preservation,
idempotent local creation, Back/dismiss restoration, Arabic/English parity, 48dp targets, responsive
safe-area/scroll/keyboard behavior, state variants, reset/profile isolation, and no regression to
remote League, Family Reward, voice, privacy, or Parent-authorized reset behavior. PNGs govern
composition; exported web code never enters runtime.

R002a refreshed Parent Home, Parent Tasks/Builder, Child Today/task execution, Parent review,
the Child support loop, and the existing Garden. Its completed oracle is verified head `0501cf3`
(with R001 evidence ancestor `76fa682`),
`task_recycling_p0_v1`, Schema-3 48→60, zero reward through Child submission and praise
presentation, and the existing separate atomic/idempotent recognition transaction with all its
applicable consequences. It preserves private five-Leaf League, Challenge Leaves, private Family
Reward, capability-scoped access, deterministic `expo-audio` voice, reset, guards, privacy, and
profile isolation.

`task.recycling_sort.v1` is accepted only as a non-runtime design alias. No R002a screen may store
it, migrate to it, calculate rewards, hard-code screenshot progression, or omit an existing domain
consequence.

The cumulative 108→120→180 projection, Impact Path, Badge Gallery/Detail, Learning surfaces, Parent
Progress, revised combined RevealBundle, additive Shared Growth, Parent participation controls, and
cumulative Garden chapter are now authorized for default-off implementation under AC-00B. They
remain excluded from release navigation until their applicable validation and review gates pass.

The remote acceptance oracles below remain current R002a behavior and regression evidence. The
approved R002b amendment adds only the default-off acceptance boundaries in AC-00B.

The R003 complete-screen amendment supersedes the old operational ten-route count and shared role
selector wherever they conflict with the current journey. It adds separate synthetic Parent and
Child access, the exact Parent/Child navigation, Family/Reward/settings surfaces, and documented
code-native candidates without changing the preserved task, recognition, reward, privacy, or
Growth authorities. `/role` remains in source only as a compatibility redirect to `/`.

**Status**: ACTIVE for R003 screen-completion acceptance, frozen R001/R002a regression, and
authorized default-off R002b implementation. No check is passed by this document alone.

**Primary acceptance surface**: named physical Android build, Arabic RTL first and English LTR
second.

**Deterministic baseline**: local prepared providers with every external service denied.

This contract converts the approved behavior in `../spec.md` and the evidence rules in
`../../../DEMO_RUNBOOK.md` into repeatable checks. It is not a public API contract, a production
release checklist, or evidence that the implementation, Android build, cultural content, or human
journey has passed.

## Evidence Vocabulary

Every recorded check MUST use exactly one of these outcomes:

| Outcome   | Meaning                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `PASSED`  | The named command, build, device, locale, or human exercise was run and met every stated assertion.  |
| `FAILED`  | The check was run and at least one stated assertion did not hold. Record the exact observation.      |
| `BLOCKED` | A required dependency such as a build, device, reviewer, or approved secure boundary is unavailable. |
| `NOT RUN` | The check has not been attempted against the current Feature 003 worktree/build.                     |

A fresh evidence exercise remains `NOT RUN` until someone attempts it. Checking whether its named
prerequisite is available counts as an attempt: if the command, build, device, reviewer, secure
boundary, or other required dependency is then unavailable, change the result to `BLOCKED` and name
that dependency. An exercise that runs becomes `PASSED` or `FAILED`; do not leave an attempted,
dependency-blocked exercise as `NOT RUN` or pre-label an unattempted exercise `BLOCKED`.

A source inspection, unit test, web preview, or Feature 002 result MUST NOT pass a physical-device,
native RTL, media, Back, accessibility, timing, comprehension, or named-human-review criterion.

## AC-00A — R002a Slice Acceptance

| Order | Surface                        | Presentation acceptance                                                                 | Behavior acceptance                                                                                 |
| ----: | ------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
|     1 | Parent Home `/parent`          | `ghaf_parent_home` is the primary candidate; Soft Geometric, bilingual, responsive      | Every existing live action remains; no fabricated League/Reward counter and `/circle` is not League |
|     2 | Parent Tasks and Builder       | Selected complete mobile pairs cover choose, edit, review, created, and added states    | Existing task actions/payloads remain authoritative; stored ID is `task_recycling_p0_v1`            |
|     3 | Child Today and task execution | Ready, 0/2, 1/2, 2/2, confirmation, and waiting are states rather than duplicate routes | Existing selectors/transitions are reused; submission awards zero                                   |
|     4 | Parent review                  | Pending, support, submitting, and approved-success states are coherent and accessible   | Approval calls the existing transaction and calculates no reward in the screen                      |
|     5 | Child support loop             | Accepted steps, Parent note, adult help, completion, and resubmission remain visible    | Fixed award and progress survive; return to existing Parent review loses and duplicates nothing     |
|     6 | Compatible existing Garden     | `ghaf_child_growth_garden_final_corrected` is a visual candidate using live values      | No cumulative Next Stage, Impact Path, badge, or other R002b mechanic                               |

Every slice requires centralized Arabic/English copy; loading, empty, validation, recoverable-error,
submitting, success, interruption recovery, and reduced-motion states; 320/360/390/430 and one wider
viewport; 200% text, safe area, keyboard, scroll, no horizontal overflow, semantic state, 48dp
targets, and fixed-action clearance. Arabic physical placement follows the specification. Android
passes only through a named build/device observation.

## AC-00B — R002b Feature-Flagged Acceptance

R001/R002a remains the visible and behavioral fallback whenever an R002b flag is disabled. All
eight R002b flags default off. Passing automated or browser checks permits local inspection only;
it does not activate a release flag or satisfy native/content/human evidence.

| Boundary            | Required acceptance                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifetime projection | `lifetimeSeeds` equals unique committed active-profile/epoch ledger entries; no writable duplicate balance, spend, decrease, or reset within an epoch                                                                                                                       |
| Synthetic migration | One immutable versioned receipt with explicit per-profile provenance; Salem-only 60 carry-forward assumption; ambiguity/non-synthetic/wrong-profile/wrong-epoch/duplicate/partial inputs reject atomically                                                                  |
| One approval        | Existing recognition remains the sole transaction; Mangrove 48→60 and lifetime 108→120 occur once while every existing consequence remains identical                                                                                                                        |
| Impact Path         | Stations 120/132/144/156/168/180 derive from the ledger; archive/current chapter remain separate and navigation creates no reward                                                                                                                                           |
| Badges              | Exactly 16 stable definitions; permanent/private/idempotent; threshold backfill requires evidence; no fabricated mastery                                                                                                                                                    |
| Learning            | Story and accessible alternative share one package/completion; finite, resumable, no-fail, equal-credit, zero existing reward or progress                                                                                                                                   |
| RevealBundle        | One `reveal:<profileId>:<triggerEventId>`; complete praise/Seed/stage/canopy/eligible-Green-Circle/private-League/Challenge/Family-Reward/badge/station/learning/safe-help superset; resumable lifecycle; one visible bundle; no re-commit or rebuild after acknowledgement |
| Parent Progress     | Parent-only, selected-Child scoped and read-only; suggestions may prefill but never assign without normal review/save                                                                                                                                                       |
| Shared Growth       | Additive to private League; anonymous qualitative projection only; view and contribution flags separate; Pause/End affect future signals only                                                                                                                               |
| Routes/origins      | Same-role allowlisted origins restore route/profile/filter/scroll/focus; arbitrary/cross-role origins reject and invalid deep links reach a safe role root                                                                                                                  |
| Presentation        | `screen-spec.md` precedes each missing surface; code-native Soft Geometric UI; Arabic/English; 320–768 widths; 200% text; safe area; keyboard; focus; reduced motion; 48dp targets; no overflow                                                                             |

Required focused coverage includes Schema-3 audit; thresholds 107/108/119/120/131/132/179/180;
duplicate/concurrent recognition and restart boundaries; profile/reset-epoch isolation; exact registry;
equal-credit learning; RevealBundle parity/recovery; Shared Growth privacy/participation independence;
and feature-flag rollback. Physical Android, TalkBack, native Back/IME, and OS font scaling remain
release blockers until directly observed.

## AC-00C — R003 Complete-Screen and Access Acceptance

R003 changes the operational route journey, not the underlying task/reward authority. The current
source inventory contains 37 product route files. `/role` is counted only as a compatibility route;
nine R002b route files remain independently default-off candidates rather than released
destinations.

| Group             | Required routes and acceptance                                                                                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry             | `/` offers distinct Parent and Child actions in Arabic first; `/role` redirects to `/` and cannot create a session or mutate state                                                                                                                                                                                                  |
| Parent access     | `/access/parent/sign-in`, code-native `/access/parent/sign-up`, `/access/parent/verification`, `/access/parent/family-basics`, `/access/parent/add-first-child`, `/access/parent/review-create`, and modal `/access/parent/family-created-success`; Create Family opens sign-up before code request, its closed origin restores correctly, first-family setup is idempotent, and a returning verified Parent reaches Parent Home |
| Child access      | `/access/child`, `/access/child/pin`, and `/access/child/pair`; synthetic Salem PIN and Alya picture sequence are profile-bound, pairing is Parent-approved/one-use, and every surface says it is not production authentication                                                                                                     |
| Parent experience | `/parent`, `/parent/task/new`, `/parent/task/review`, `/parent/check-in`, `/parent/family`, `/parent/family/reward`, `/parent/settings`, `/parent/settings/permissions`, `/parent/settings/devices`, and `/parent/reauthenticate` require an active Parent experience                                                               |
| Child experience  | `/child`, `/child/task`, `/child/settings`, and `/league` require the matching active Child experience; settings expose only the Child's own read-only permissions                                                                                                                                                                  |
| Shared role-aware | `/garden` and `/circle` render only safe data for the active experience and never infer a completion on entry                                                                                                                                                                                                                       |
| R002b candidates  | `/child/reveal/:bundleId`, `/garden/impact-path`, `/garden/badges`, `/garden/badges/:badgeId`, both `/garden/learn/:learningId/**` routes, `/circle/shared-growth`, `/parent/family/:profileId/progress`, and `/parent/family/shared-garden` stay hidden or safely unavailable unless their individual flags and prerequisites pass |

### R003 navigation, guard, and handoff assertions

1. Parent bottom navigation is exactly **Home, Tasks, Garden, Family**. Child bottom navigation is
   exactly **Today, Garden, League**. Rewards, settings, permissions, devices, reauthentication,
   Impact Path, Badges, Learning, Shared Growth, and Reveal are contextual destinations only.
2. There is no normal role toggle. Every Parent/Child change terminates the active synthetic
   session and returns through Welcome or an explicit access handoff. If termination fails, the
   route does not navigate and shows a recoverable error.
3. A signed-out private-route deep link falls back to `/`. An active Child entering any Parent or
   Parent-access route returns to `/child`; an active Parent entering any Child or Child-access
   route returns to `/parent`. No rejected deep link mutates task, reward, or access state.
4. A new Child device follows credential verification → pairing request → Parent sign-in and
   verification → `/parent/settings/devices` approval → signed-out handoff back to
   `/access/child/pair` → one completion → `/child`. Wrong-actor, expired, replayed, revoked,
   mismatched, or stale-session inputs fail closed.
5. Parent permission changes originate at `/parent/settings/permissions`, pass only the allowlisted
   profile/kind/value and return target into `/parent/reauthenticate`, accept local demo code `4242`
   once for that action, and change nothing for an invalid code. Child settings cannot invoke the
   mutation.
6. Parent Family exposes the private Family Reward and only flag-available Parent Progress/Shared
   Garden entries. The Reward plan is read from its authority, remains private, and follows
   `promised → unlocked → given`; a screen cannot calculate or force an unlock.
7. Parent-authorized reset is available only in an active Parent experience and atomically returns
   to signed-out Arabic RTL `/`, invalidates both session types and transient pairing/grant proofs,
   restores the deterministic fixture, and leaves no stale Back destination.
8. The normal default-off approval path retains the R002a result whenever complete RevealBundle
   consequence parity is unavailable. A route file or explicit local test flag is not release
   activation.

## Historical R001/R002a Authored Route and Guard Contract

The table below preserves the pre-R003 remote oracle and completed R001/R002a regression history; it
is not the current operator route inventory. Before R001, the remote application contained exactly
these ten product routes. R001 preserved all ten route files, replaced the `/` composition in
place, and added exactly six approved
`/access/parent/**` route files, so its post-integration inventory is exactly 16. Framework files
such as `app/_layout.tsx` are not product routes. Loading, assistant, fallback, retry,
awaiting-confirmation, phase-review, and celebration remain states of their owning routes.

|   # | Route                 | Required entry or safe behavior                                                                                                                                                                              | State mutation allowed on entry                                        |
| --: | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
|   1 | `/`                   | Always reachable; Arabic RTL after canonical reset                                                                                                                                                           | None                                                                   |
|   2 | `/role`               | Always reachable as a shared-device demo selector; visibly not authentication                                                                                                                                | Demo mode and active synthetic Child only after an explicit choice     |
|   3 | `/parent`             | Parent mode; a Child-mode deep link returns to `/role` without exposing Parent-only detail                                                                                                                   | None on entry                                                          |
|   4 | `/parent/task/new`    | Parent mode; otherwise return to `/role`                                                                                                                                                                     | Draft edits only                                                       |
|   5 | `/parent/task/review` | Parent mode plus a complete review candidate; otherwise return to `/parent/task/new` without losing valid draft input; prepared voice remains off unless the Parent uses its distinct enable action          | Optional stored synthetic voice/AI grant; assignment stays separate    |
|   6 | `/child`              | Child mode plus an active synthetic profile; otherwise return to `/role`                                                                                                                                     | `assigned → chosen` only after the assigned Child deliberately chooses |
|   7 | `/child/task`         | Child mode plus an assignment for the active Child; a missing or wrong-profile assignment returns to `/child` without revealing private task detail; Coach and voice remain task/version-bound               | Explicit task start and synthetic voice-state commands only            |
|   8 | `/parent/check-in`    | Parent mode plus the matching journey in `submitted`, `retry`, `confirmed` with pending praise, or `recognized` with its matching ledger receipt; otherwise return to `/parent` without creating recognition | None on entry; available actions depend on the admitted state          |
|   9 | `/garden`             | Safe read-only family landscape before confirmation and the recognized consequence afterward; available from the authored family flow                                                                        | None on entry                                                          |
|  10 | `/circle`             | Safe synthetic/local aggregate before and after the milestone; no individual record is exposed                                                                                                               | None on entry                                                          |

For `/garden` and `/circle`, direct entry MUST render the counters represented by current session
state and MUST NOT infer a completion. Parent-only reset controls MUST not be exposed as a Child
action even when a shared read-only surface is visible.

For `/parent/check-in`, `submitted` exposes review, kind retry, and confirmation planning; `retry`
resumes the observable no-loss retry panel until the Parent explicitly returns the task to the
Child;
`confirmed` with the matching pending plan resumes the rendered-praise state and its separate
Parent continuation. `recognized` is admitted only when `recognition:<submission.id>` resolves to
the immutable matching receipt, and it exposes only the neutral **Already confirmed** outcome. It
MUST NOT expose retry, praise editing, another confirmation control, recognition continuation, or a
new announcement/celebration. A missing or mismatched submission, pending plan, or receipt follows
the safe `/parent` recovery with no mutation.

The replaced Feature 002 product routes MUST be absent from the final route inventory:

- `/parent/create`
- `/parent/generating`
- `/parent/review`
- `/child/mission`
- `/parent/confirmation`
- `/celebration`

Historical Feature 002 specifications, documentation, screenshots, and evidence remain intact.

### Navigation and History Assertions

1. `assigned → chosen` and `chosen → in_progress` are two observable, guarded transitions.
2. Direct navigation to a conditional route without its prerequisite follows the safe behavior in
   the table and changes no reward or shared counter.
3. Switching language in a safe current state preserves the task identifier, valid input, and
   lifecycle state while updating content direction.
4. Role switching preserves the current approved journey state but never bypasses Parent approval
   or exposes a task assigned to another synthetic Child.
5. Parent reset atomically replaces navigation with `/`; pressing native Back MUST NOT reveal any
   pre-reset draft, task, submission, check-in, garden celebration, or circle milestone.
6. A web browser history check is only a proxy. Android Back passes only after direct observation on
   the named physical build.
7. The resolved Expo configuration MUST set Android predictive Back enabled. On a named supported
   Android OS/device, the predictive gesture and system Back MUST follow the same guarded
   destinations as ordinary navigation, MUST NOT mutate the journey, and MUST NOT preview or reveal
   pre-reset history after reset. Record the config output, build, device, and OS with the native
   observation.

## Historical R002a Schema-3 Reset Value Oracle

The 48-Seed personal reset below is the verified remote R002a compatibility-value oracle. R003
retains the listed household/task/reward values but AC-00C supersedes its access row: reset now
lands signed out on Arabic `/`, with no active session, pairing request/device, or transient proof.
Mangrove remains 48/60→60/60 in the default-off presentation. Any cumulative 108→120→180 display
belongs to the independently flagged R002b projection.

The Parent-only **Reset synthetic demo** action requires confirmation and MUST restore all values in
one action without a remote dependency.

| Field                          | Exact reset value                                              |
| ------------------------------ | -------------------------------------------------------------- |
| Locale / direction             | Arabic / RTL                                                   |
| Route / history                | `/`; no stale Back history                                     |
| Historical R002a demo mode     | Parent; role switch labeled not authentication                 |
| Household                      | Synthetic Al Noor family                                       |
| Children                       | Salem, age 9; Alya, age 11; both visibly synthetic             |
| Active Child                   | Salem                                                          |
| Salem personal earned Seeds    | 48                                                             |
| Alya personal earned Seeds     | 36                                                             |
| Salem Mangrove track           | 48/60, Shoot                                                   |
| Household Ghaf canopy          | 19/25 contribution leaves                                      |
| Circle Green Impact goal       | 11/12 eligible actions; synthetic/local                        |
| Active assignment / submission | None                                                           |
| Parent Guide fixture           | `guide_recycling_refine_v1`                                    |
| Child Coach fixture            | `coach_recycling_steps_v1`                                     |
| Prepared image                 | `fixture_recycling_clean_v1`; prepared/synthetic label visible |
| Prepared audio                 | `fixture_salem_plan_ar_v1`; prepared/synthetic label visible   |
| Assistant mode                 | Deterministic prepared; no remote dependency                   |
| Child voice grants             | Voice and AI off; Parent enablement required                   |
| Synthetic voice lifecycle      | `idle`; transcript `null`; active indicator `false`            |
| Voice playback                 | Captions `true`; rate `1`; replay count `0`; sent time `null`  |
| Celebration state              | `available = false`; `consumed = false`                        |

Reset MUST be exercised from draft, prepared-assistant result, prepared fallback, prepared-media
selected, prepared-media removed, image/audio unavailable fallback, reviewed, assigned, chosen,
`in_progress`, submitted, retry, confirmed/recognized, celebration available, celebration
consumed, garden, circle, voice active-rehearsal, voice transcript-review, and voice sent states.
In the historical R002a flow, a Child-only state first switched to Parent demo mode. R003 must
instead terminate the Child session, complete Parent access, then invoke reset from the active
Parent experience; changing a mutable presentation role alone cannot authorize reset. Acceptance
requires five consecutive exact resets from every named source state; one mismatch is `FAILED` and
must not be repaired by manually editing counters.

## Preserved Remote Schema-3 Lifecycle and No-Early-Reward Oracle

The 48-Seed value in this section is the current R002a behavior oracle. Its no-early-reward and
idempotency invariants remain current; it may be superseded only after a separately approved R002b
migration is implemented and validated.

The valid main lifecycle is:

`draft → reviewed → assigned → chosen → in_progress → submitted → confirmed → recognized`

The dignified retry branch is:

`submitted → retry → in_progress`

At each of `reviewed`, `assigned`, `chosen`, `in_progress`, `submitted`, `retry`, and `confirmed`
before the separate recognition continuation, assert all four reward/projection values remain at
the reset baseline: Salem 48 Seeds, Mangrove 48/60 Shoot, canopy 19/25, circle 11/12. Optional media,
optional reflection, permitted adult help, omission of both optional items, neutral submission
acknowledgement, confirmation planning, and praise presentation MUST NOT change those values.

Repeating the exact Parent assignment-approval command after `assigned` MUST return the same
assignment and executable choice as a neutral no-op; it MUST create no second assignment or counter
change. A repeat whose task/version, Child, assignment, or choice does not match remains invalid.

Kind retry MUST preserve every prior earned value, show no failure badge/debt/deduction, and return
the task to `in_progress`. A safe equivalent or smaller replacement may change a displayed future
award only when agreed before Child acceptance; permitted help after acceptance never reduces the
displayed award.

## Preserved Remote Schema-3 Confirmation and Idempotency Oracle

The P0 submission is one 12-Seed, recurrence-once `standard + acquisition` Green Impact task with
`visibilityScope = household` and `circleEligible = true`. Its first valid recognition MUST use two
distinct visible Parent actions and an observable intermediate state:

1. From `submitted`, the first action validates the editable action-specific praise, creates the
   pending plan, moves the matching journey to `confirmed`, and renders the final praise in a
   `praise_presented` state. Capture that state with all four counters unchanged and no recognition
   receipt, growth, milestone, announcement, or celebration.
2. Only after that rendered state is present may a second explicit Parent continuation invoke
   recognition. The handler that records/renders praise MUST NOT also call recognition in the same
   press, event callback, effect, animation callback, or dispatch chain.
3. The second action moves the journey to `recognized`, stores one immutable receipt, and changes
   exactly these four counters:

| Counter                     |        Before |       After first valid confirmation |
| --------------------------- | ------------: | -----------------------------------: |
| Salem personal earned Seeds |            48 |                                   60 |
| Salem Mangrove progress     |  48/60, Shoot |                       60/60, Sapling |
| Household canopy            |  19/25 leaves |                         20/25 leaves |
| Circle Green Impact goal    | 11/12 actions | 12/12 actions, cooperative milestone |

No other counter, assignment version, prepared fixture identifier, Child profile, locale, or
private record may change as an incidental consequence. The circle receives one coarse eligible
Green action, never 12 Seeds.

Navigate back to `/parent/check-in` for the recognized matching journey five times and exercise the
guarded duplicate command directly in automated coverage. The rendered route MUST expose only
**Already confirmed** (or its canonical Arabic equivalent), and every attempt MUST return the same
receipt as a neutral no-op. It MUST leave the four post-confirmation values unchanged and duplicate
no Seed transaction, stage reveal, canopy leaf, circle event, milestone, announcement, or
celebration.

## Privacy-Before-Projection Oracle

The full `Task`, `Submission`, check-in, receipt, and other private domain records stay inside the
private recognition boundary. That boundary validates recognition/phase, visibility, category, and
circle eligibility, then derives a minimal strict projection-eligibility context. A shared projector
MUST NOT accept or strip a raw private domain object. Only the strict context may enter shared
candidate construction, and only an allowlisted canopy/circle DTO may reach a shared mutation.

Exercise at least these cases and compare the shared counters before and after each attempt:

- a valid `visibilityScope = child_guardian` task with `circleEligible = false` remains valid private
  data but yields no shared candidate; `child_guardian + true` is rejected before derivation;
- `circleEligible = true` for a non-Green category;
- `circleEligible = true` with `visibilityScope = child_guardian`;
- a raw `Task`, `Submission`, check-in, receipt, or other private domain object offered directly to
  the shared projector;
- an otherwise shaped projection candidate with any unknown Child/household identity, Seed
  quantity, task ID/title/history, timestamp, media, reflection, assistant content, Parent note, or
  Parent observation field;
- prayer, kinship, affection, food consumption, hygiene, wellbeing, or disability-related content;
- invalid recognition/routine-phase combinations; and
- a duplicate recognition key, which MUST return its stored receipt before context derivation or
  projection.

Every malformed, unknown-field, invalid-pairing, or sensitive candidate MUST be rejected before DTO
construction and before a canopy/circle visual or counter changes. A valid private item that is not
shareable yields no shared DTO rather than being copied into a candidate. A valid circle DTO
contains only one coarse synthetic family-level eligible Green action. Parent and sibling surfaces
MUST NOT place Salem and Alya's raw Seeds, pace, rank, or age-unequal contribution trails side by
side.

## Prepared Assistant and Media Fallback Oracle

The deterministic acceptance path makes no external request.

| Condition                                                                              | Required behavior                                                                                                                                  |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent enters “Take the recycling out.”                                                | Input remains unchanged until **Accept suggestion**; **Keep mine** preserves it.                                                                   |
| Prepared Parent Guide opens                                                            | Uses `guide_recycling_refine_v1`; labels the result prepared; says AI may be wrong and the Parent decides.                                         |
| Optional live Parent call times out, fails schema/safety validation, or is unavailable | On the same route and attempt, retain Parent input and show the reviewed prepared result with a fallback/prepared label.                           |
| Child Coach opens                                                                      | Uses only `coach_recycling_steps_v1`; stays bound to the active approved task; shows **I need an adult** and the prepared/may-be-wrong disclosure. |
| Child voice opens without Parent grant                                                 | Shows the disabled Parent-required state and creates no voice session.                                                                             |
| Parent enables prepared Child voice                                                    | Uses stored synthetic Parent authority to enable voice and AI separately; assignment approval does not grant either permission.                    |
| Synthetic voice rehearsal runs                                                         | Shows explicit start/stop/review/delete/send/caption/0.75×/1×/replay/reset controls and says no microphone or Child audio is captured.             |
| Synthetic voice transcript is sent                                                     | Marks the prepared review rehearsal complete; does not claim live AI processing, attach evidence, or change task/reward state.                     |
| Prepared image is absent                                                               | Show an accessible descriptive synthetic placeholder; completion remains available.                                                                |
| Prepared audio is absent                                                               | Show the canonical transcript and Coach steps; do not request microphone permission.                                                               |
| All external services are denied                                                       | Parent Guide, Child Coach, summary, media fallbacks, reward, garden, circle, and reset remain usable.                                              |

The Child Coach has no live mode in P0. No assistant may provide unrestricted chat, diagnostic or
religious judgment, emotional/personality inference, secrecy/exclusivity language, food-safety
verdicts, or hazardous instructions. Prepared content MUST never be labeled live.

Optional live Parent refinement remains `BLOCKED` for implementation and `NOT RUN` for validation
until an approved secure server boundary, structured validation, timeout/fallback evidence, and
secret isolation are directly demonstrated. Its absence does not block the deterministic P0.

## Parent Summary Correction Oracle

On `/parent`, open the prepared seven-day summary and its bounded correction control. The control
MUST expose only the defined synthetic observable-fact fields; it MUST NOT become an open prompt,
Child-analysis surface, or remote conversation. Apply one neutral factual correction and verify the
same structured and prohibited-language validation runs before the local corrected summary is
shown with its synthetic/prepared origin and unchanged time window, uncertainty, open question, and
possible adjustment.

Then attempt a correction containing a character label, diagnosis/condition conclusion,
emotion/personality/risk inference, truthfulness/religiosity judgment, or parenting/family-quality
judgment. The correction MUST be rejected with neutral feedback, the last safe summary MUST remain
available, and no remote request, task/reward mutation, Child-profile inference, or shared
projection may occur. Run the valid and rejected correction checks in Arabic and English.

## Bilingual, RTL, and Accessibility Oracle

Run the complete journey in Arabic first, reset, then run the equivalent English journey. For every
route and in-route assistant/retry/celebration state, verify:

- the same decisions, safety boundaries, privacy meaning, fixed award, disclosure, and final values;
- Arabic logical order/alignment and progress direction; English LTR order/alignment;
- only directional arrows mirror; trees, checkmarks, landscape objects, and nondirectional symbols
  do not mirror;
- canonical Arabic safety and assistant copy from `../../../DEMO_RUNBOOK.md` is not improvised;
- voice lifecycle, transcript, caption choice, simulated playback rate, replay count, active Child,
  task, and task version survive locale switching unchanged;
- explicit Arabic or English text selects the matching system-family role metrics; Arabic body
  leading is at least 1.55 and Arabic tracking is zero;
- mixed Arabic/English names, Latin fixture IDs, 12-Seed values, numerals, diacritics, and long labels
  wrap without clipping;
- normal-size text meets at least 4.5:1 contrast, large text meets at least 3:1, and essential UI
  component boundaries/states meet at least 3:1 against adjacent colors, satisfying the applicable
  WCAG 2.2 AA text and non-text contrast criteria;
- required copy and dominant actions remain operable at 200% font scale;
- dominant controls are at least 48×48dp and adjacent small targets have at least 8dp separation;
- screen-reader order, labels, roles, selected/disabled states, and bottom-sheet focus are logical;
- voice start, transcript review, delete, send, submission, confirmation, reward, Sapling stage,
  and circle milestone are each announced once;
- prepared audio has visible equivalent text and prepared imagery has a concise description and
  point-of-use origin label;
- reduced motion produces the same static counters, stage, cause, and symbolic-growth disclosure
  without waiting for animation; and
- the resolved Android configuration has predictive Back enabled and, on a supported named Android
  build/device, predictive/system Back follows every route guard and cannot reveal stale state after
  reset.

These checks remain `NOT RUN` until exercised on a current named build. Source or web inspection may
produce separate proxy evidence but cannot pass the Android criteria.

## Automated Verification Matrix

The implementation MUST provide focused automated evidence for the following behavior. Exact test
filenames may follow repository conventions, but every row must be traceable to one or more tests.

| Area              | Required assertions                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle         | Every valid transition; invalid skips rejected; `chosen` distinct from `in_progress`; wrong Child rejected; exact duplicate Parent assignment approval is an idempotent no-op                |
| Early reward      | Review, assignment, choice, start, submission, media, reflection omission, help, retry, confirmation planning, and praise presentation change none of the four counters                      |
| Reward matrix     | Five valid recognition/phase rows; every other pair rejected; fixed awards limited to 4/6/8/12/15                                                                                            |
| Confirmation      | Distinct rendered `praise_presented` state; separate second Parent continuation; no shared handler/effect; one exact four-counter delta; five matching-receipt duplicates are neutral no-ops |
| Fade-first review | Third recurrent acquisition confirmation prompts an unselected, future-only Parent decision; no automatic phase change; reversal preserves progress                                          |
| Garden            | Eight category mappings; five track thresholds at and around 0/20/60/120/200; no reversal                                                                                                    |
| Privacy           | Raw private records never enter the strict projection candidate; unknown identity/Seed/private fields and invalid/sensitive contexts reject before DTO construction or mutation              |
| Circle            | Only one coarse household-visible eligible Green action is accepted; no task/Child/Seed fields                                                                                               |
| Child Coach       | Age-band and intent allowlists, active-task binding, prepared fixture/disclosure, prohibited intent/output rejection                                                                         |
| Parent Guide      | Structured prepared/fallback result, retained input, strengths-first summary shape, bounded local fact correction, revalidation, and prohibited-language rejection                           |
| Failure fallback  | Network denial, timeout, malformed result, safety rejection, missing image/audio all return to the deterministic path without duplicate state                                                |
| Localization      | Arabic/English resource-key parity and stable mixed-script fixture values                                                                                                                    |
| Reset/history     | Every meaningful source state restores the complete oracle; check-in admits only matching submitted/pending-praise/recognized-receipt states; predictive Back config is enabled              |
| Claims/provenance | No real-tree/unsupported impact claim; prepared/synthetic origin labels are present                                                                                                          |

Run and record at least:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
git diff --check
```

Command success does not replace behavior evidence. An unattempted check is `NOT RUN`; after an
attempt, a missing named dependency makes it `BLOCKED`, while an executed check is `PASSED` or
`FAILED`.

## Judge-Journey Acceptance

From a fresh reset, complete the route sequence below without hidden setup:

`/ → Parent sign-in → new-family sign-up → verification → first-family setup when required → /parent → /parent/task/new → /parent/task/review → Child access/credential → pairing when required → /child → /child/task → / → Parent sign-in/verification → /parent → /parent/check-in → /garden → /circle → Child access/credential → /child → /garden → /league`

No step uses `/role`; each Parent/Child handoff ends the current synthetic session and requires the
receiving access path. For a fresh device, include the Parent-approved pairing return through
`/parent/settings/devices`. The frozen R002a journey previously traversed ten authored routes, but
that count is historical and does not constrain the current 37-file R003 inventory.

The 120–150 second figure was the internal target for the shorter R002a path and is not a published
SMAC judging rule. Time the complete R003 path afresh before setting a new target. Run five
uninterrupted rehearsals and record operator, duration, reset result, access/pairing branch,
fallback use, and failure note; do not mark the rehearsal criterion passed until the team approves
and meets one recorded R003 target.

Ask three people unfamiliar with the detailed design what Salem did, what the assistant did, who
approved the reward, and what another family can see. Record enough of each answer to verify they
understood the real action, bounded/prepared AI, Parent gate, and one coarse eligible Green action.

## Web Proxy and Physical Android Limits

Web evidence may validate route reachability, deterministic logic, browser console health, basic
layout, copy presence, and a web-specific history proxy. Label it `PASSED (web proxy)` where
appropriate. It does not validate Android RTL layout, native Back, keyboard/IME, safe areas, touch
targets, screen reader, reduced-motion setting, prepared native media, permissions, performance, or
an installable build.

The current R003 closeout preserves these truthful statuses:

The physical Android row is `BLOCKED` because the recorded baseline availability attempt already
identified the missing named build/device; `BLOCKED` is not the default for an unattempted
exercise. Each native subcheck remains `NOT RUN` until it is attempted.

| Gate                                                                                                 | Current Feature 003 status                      |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Automated implementation commands                                                                    | `PASSED` — runtime checkpoint `40fc5fc`         |
| R003 role-separated deterministic journey                                                            | `PASSED (web proxy)` — Arabic/English 390×844   |
| Arabic RTL and English LTR physical journey                                                          | `BLOCKED` — no attached device or SDK/toolchain |
| Predictive/native Back, WCAG contrast, keyboard, media, reduced motion, screen reader, and 200% font | `NOT RUN`                                       |
| Five timed rehearsals and three-person comprehension                                                 | `NOT RUN`                                       |
| Arabic/UAE cultural, faith, safeguarding, sustainability, and accessibility reviews                  | `NOT RUN`                                       |
| Optional live Parent refinement                                                                      | implementation `BLOCKED`; validation `NOT RUN`  |

## Release Boundary

R002a is complete within AC-00A and remains the fallback. R002b implementation is authorized only
within AC-00B and remains default-off for release. No local implementation or automated pass may
activate a release flag without the separately recorded applicable native, content, provenance,
accessibility, and human-review evidence.

R003 screen completion is accepted only within AC-00C. Route/source presence, synthetic access
tests, and browser proxy evidence may establish a local implementation candidate, but they do not
prove production authentication, Android behavior, cultural/content approval, or release readiness.

Feature 003 MUST NOT be called **Android-accepted** or **demo-accepted** until the physical bilingual
journey, offline fallback, predictive/native Back, WCAG contrast, reset/media/accessibility checks,
five timed rehearsals, three-person comprehension exercise, and required named human reviews are
recorded in
`../../../DEMO_RUNBOOK.md`. Missing native or human evidence remains `BLOCKED` or `NOT RUN`; it is
never inferred.
