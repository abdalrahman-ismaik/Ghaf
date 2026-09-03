# Acceptance Contract: Family Growth Garden — Revision 3 Planning Amendment

**Revision 2 product baseline approved**: 2026-09-01

**Revision 3 Growth Journey planning amendment**: 2026-09-03

**Current release state**: R001 is **PARTIALLY RELEASED** for Welcome and first-time Parent
onboarding. Every Growth Journey surface and its prerequisite Child/Parent shell remain **DESIGN
BLOCKED**. This contract defines future acceptance; it does not claim those frames or runtime exist.

Revision 1's ten-route implementation and evidence are historical and cannot satisfy an assertion
below.

## Evidence Vocabulary

| Status       | Meaning                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| `PASSED`     | Direct evidence exists for the exact revision, release, build, and assertion      |
| `FAILED`     | The exact assertion was attempted and did not hold                                |
| `BLOCKED`    | An attempted or required gate cannot proceed because a named dependency is absent |
| `NOT RUN`    | No qualifying attempt exists for the named revision and release                   |
| `HISTORICAL` | Evidence belongs to Revision 1 or an earlier feature and is not reusable          |

Synthetic, prepared, and simulated are capability-origin labels, not evidence statuses.

## AC-00 — Stitch Design-Intake Gate

Implementation is accepted for release only if all are true:

- the user supplied and approved a separately identified Growth Journey Stitch release;
- Arabic RTL and matched English LTR cover every required screen family and state;
- each runtime surface has a canonical PNG, mandatory `screen-spec.md`, material state references,
  and any exported HTML treated only as non-runtime measurement/structure guidance;
- exact route, navigation, component, token, font-loading, illustration, motion, and Back behavior
  are recorded in the design/plan artifacts;
- original launch, botanical, badge, icon, and learning assets have provenance, rights status, and
  required factual/cultural/accessibility review status;
- Parent navigation is Home/Tasks/Garden/Family and Child navigation is Today/Garden/League;
- cross-role navigation and the old role toggle are absent from ordinary product frames;
- the product, privacy, competition, reward, AI, Arabic, and accessibility audits pass; and
- the integration owner explicitly releases the implementation block.

Absent or incomplete Stitch frames produce `BLOCKED`, never an inferred pass. Growth-only nested
frames are insufficient unless the release also supplies a complete reachable Child shell,
Parent Check-in origin, Child result handoff, and Parent selected-Child origin.

## AC-01 — Separate Synthetic Access

| Assertion             | Required result                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Parent entry          | Synthetic phone/email verification plus PIN/passkey/biometric-gate state; visible nonproduction disclosure                 |
| Parent setup          | Family name, Child nickname/avatar/age band/language/accessibility only; no Child email/phone/location/school/medical data |
| Child shared device   | Parent-created profile plus PIN or picture sequence; neutral error/help states                                             |
| Child separate device | Prepared QR or six-digit code → awaiting Parent → approved/denied/expired/offline/revoked; no real camera/network claim    |
| Role isolation        | Child cannot open Parent Home/Tasks/Family/rewards/reports/permissions/invitations                                         |
| Reauthentication      | Required before monetary reward, member, League, trusted-device, or media-permission change                                |
| Normal navigation     | No role toggle or repeated forced role switching                                                                           |

Every access fixture is synthetic. Production identity verification, cryptography, account
recovery, tenancy, and secure device binding remain out of scope.

Parent settings contain account protection, Child profiles, paired devices, language, League
participation, age-band communication, prepared photo/voice/AI permissions, family visibility,
device removal, and Child-code reset. Child settings contain only language, Parent-approved voice,
speed, captions, reduced motion, text size, and tree avatar. Permission/device states cover off,
requested, denied, approved, revoked, offline, and updated; they never imply real P0 capture.

## AC-02 — Role Navigation and Screen Families

The approved Stitch inventory must map Welcome/access; Parent auth/setup, Home, Tasks, Task Builder,
Check-in, Garden, Family/League management, Family Rewards; Child access/pairing, Today, Task/Coach,
Garden/celebration/reward unlock, League; and role-appropriate profile/settings/permissions/device/
reauthentication states.

The Growth release must additionally map the native system launch asset, a brief Opening Moment,
exactly three role-neutral first-run introduction panels, explicit R001 `/` handoff, complete Child
Today and Garden origins, Impact Path, My Badges, Badge Detail, one combined RevealBundle, Mangrove
story, equal-credit accessible/Parent-guided alternative, and Parent selected-Child Progress &
Achievements.

Task Builder contains Choose, Adjust, and Review/Assign. Celebration is a Garden state. AI is
contextual, not a tab. Impact Path and My Badges are nested Garden destinations and never a fourth
Child tab. Exact unreleased route paths are filled after Stitch intake.

## AC-03 — Canonical Reset Oracle

One Parent-authorized reset atomically restores:

| Field               | Expected value                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Entry               | Arabic RTL welcome/access, signed out, no protected Back history                                                  |
| Household           | Synthetic Al Noor; Salem 9; Alya 11                                                                               |
| League              | Synthetic Salem/Alya/Mariam/Rashid; five slots each                                                               |
| Salem               | 4/5 confirmed; Weekly Growth Score 80                                                                             |
| Other scores        | Mariam 100, Alya 60, Rashid 40                                                                                    |
| Garden              | Salem Mangrove 48/60 Shoot; family canopy 19/25                                                                   |
| Lifetime Seeds/Path | Salem 108; no Water & Coast station receipt; next station 120                                                     |
| Badge history       | Seed Start and Growing Branch only, backed by provable history; no migration reveal                               |
| Mastery/learning    | Sorting 0, water 2, energy 1, nature 2, coast care 2; Ghaf Basics complete; other P0 learning/activity incomplete |
| Family Reward       | Salem 108/120 eligible Seeds; AED 25; Promised; private                                                           |
| Presentation        | No pending RevealBundle or safe-help recognition; first-run preferences use a separate operator reset             |
| Task                | No active assignment/submission until Parent creates it                                                           |
| Fixtures            | `guide_recycling_refine_v1`, `coach_recycling_steps_v1`, `fixture_recycling_clean_v1`, `fixture_salem_plan_ar_v1` |
| Permissions         | Real camera/microphone off; prepared voice on; captions on                                                        |
| Recognition         | No current confirmation receipt                                                                                   |

Reset must pass from access, pairing, draft, Coach voice, submitted, retry, confirmation,
reveal, Path, badge detail, learning, Garden, League, reward, permission, device, and
reauthentication states without
network, auth, camera, microphone, payment, invitation, or AI service.

Ordinary restart and manual introduction replay preserve all earned domain records, install-level
first-run flags, and per-Child story preferences. Only the explicit Parent-authorized demo reset
restores the domain table above; it preserves those preferences and clears transient replay,
deep-link, and nested-route intent. The operator-only first-run reset may clear only the install-level
Opening Moment/introduction flags without changing a Child profile or any progress ledger.

## AC-04 — No-Early-Recognition Oracle

Assignment, Child choice, start, help/Coach use, prepared voice/media, completion with help,
submission, and kind retry change all of the following by zero:

- Seeds, lifetime Path position, mastery credits, badge awards, and landscape stage;
- family-canopy leaves;
- Challenge Leaf count and Weekly Growth Score; and
- Family Reward progress/state or pending RevealBundle.

Help, accessibility adaptation, and an agreed smaller/equivalent task preserve the displayed award
and full Challenge Leaf credit after Parent confirmation.

Learning and recognition-only activity use separate idempotent completion events. They always add
zero Seeds, garden, canopy, Leaf, League, or Family Reward progress and may satisfy only their
explicit badge component.

## AC-05 — Confirmation and Presentation Oracle

The first valid P0 confirmation stores one immutable receipt, creates at most one recoverable
RevealBundle, and presents:

1. Parent praise naming the safe action/help-seeking;
2. an honestly labelled self-reported activity result, only when the approved task carries one;
3. exactly 12 Seeds and lifetime Seeds 108 → 120;
4. Mangrove 48/60 Shoot → 60/60 Sapling;
5. family canopy 19/25 → 20/25, exactly one leaf;
6. Salem 4/5 → 5/5 and score 80 → 100;
7. Water & Coast Path 120/180, station 120 reached, next station 132;
8. one sorting and one coast-care acquisition credit, Expanding Shade and Sorting Bud earned, and
   four total earned Gallery badges;
9. optional one-time safe-help recognition only when explicit evidence qualifies; and
10. reward progress 108/120 → 120/120 and Promised → Unlocked, with the private message last.

Five duplicate confirmation attempts must each return a neutral Already confirmed result and
change no transaction, station, mastery credit, badge, stage, leaf, score, reward, rank,
recognition, or RevealBundle.

Reduced motion presents the same final values and textual cause immediately.

## AC-06 — Weekly League Oracle

### Score and opportunity rules

- Each participating Child has exactly five planned Leaf slots before the active week.
- `score = confirmedLeaves / 5 × 100`; possible values are 0, 20, 40, 60, 80, and 100 only.
- Extra tasks never change score or rank.
- Permitted help, accessibility adaptations, and agreed equivalents earn the same 20 points.
- Equal scores share position; speed, timestamps, age, difficulty, raw Seeds, money, and evidence
  do not break ties.

### Required post-confirmation standings

| Position | Nickname | Score | Leaves |
| -------: | -------- | ----: | -----: |
|        1 | Salem    |   100 |    5/5 |
|        1 | Mariam   |   100 |    5/5 |
|        3 | Alya     |    60 |    3/5 |
|        4 | Rashid   |    40 |    2/5 |

### Privacy and rollover

A League row contains only nickname, tree avatar, position, score, and Leaves. Injecting a task,
evidence, age, accommodation, praise, raw Seed, money, missed reason, note, assistant output, or
timestamp must reject the projection before rendering/counter change.

Prayer, affection, emotional disclosure, food consumption, private wellbeing, hygiene,
disability-related routines, and proof of love are ineligible. Only prepared bilingual reactions
are accepted. Weekly rollover replaces Leaf/score/rank state and changes no permanent garden,
Seed, canopy history, unlocked reward, or Given record.

Revision 1 `circleEligible` is not a League field and must not drive Revision 2 ranking/projection.

## AC-07 — Family Reward Oracle

| Rule               | Required result                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Name               | Family Reward — المكافأة العائلية; never wallet/store/exchange                                                             |
| Audience           | Relevant Child and guardians only                                                                                          |
| Milestones         | New eligible Seeds, landscape stage, or multiple landscapes at Sapling                                                     |
| Promise types      | Money, family experience, privilege, or gift                                                                               |
| State machine      | Promised → Unlocked → Given only                                                                                           |
| Funding/delivery   | Parent-selected and delivered outside app                                                                                  |
| Money handling     | No transfer, custody, settlement, redemption, or balance                                                                   |
| Competition        | No rank/winner dependency and no appearance in League                                                                      |
| Exchange           | No universal Seed-to-AED rate                                                                                              |
| Immutability       | Agreed plan snapshot cannot be retroactively changed; future plans version prospectively                                   |
| Unlock             | Cannot be revoked, reduced, or removed as punishment                                                                       |
| Monthly summary    | Sum of agreed monetary plans assigned to the month across Promised, Unlocked, and Given; drafts/nonmonetary plans add zero |
| Protection         | Monetary save/edit requires Parent reauthentication                                                                        |
| Source eligibility | Every contribution is tied to an immutable task version and fails closed; unknown/prohibited activity adds zero            |
| Landscape progress | Stage milestones use eligible-contribution provenance, never displayed aggregate stage alone                               |

Prayer, affection, emotional disclosure, eating/body outcomes, and proof of love must fail
validation as reward milestones, as must private wellbeing or disability-related activity. A
Family Reward must never condition food, water, clothing, safe shelter, sleep, healthcare,
education, transport, ordinary family contact, affection, safety, dignity, or ordinary religious
participation. Seed and landscape progress without explicit eligible provenance adds zero Family
Reward progress. Duplicate unlock/Given actions are no-ops.

## AC-08 — Task, Coach, and Prepared Voice Oracle

The P0 task is the Parent-approved 12-Seed Mangrove recycling task with adult pre-check, safe clean
paper/plastic only, prohibited hazards, no road crossing, adult-carried disposal, unsafe-heat/
traffic alternative, and handwashing.

The Coach:

- is visibly AI and may be wrong;
- remains bound to that task and never changes the definition of done;
- provides age-band-limited steps/intents and prominent Ask an adult;
- never offers unrestricted chat, secrets, dependency, companion, diagnostic, truthfulness,
  religious-authority, food-safety, or hazardous-action behavior; and
- in P0 uses prepared voice with visible simulated recording state, transcript,
  delete-before-send, replay, captions, slower playback, and transcript fallback.

No real microphone, camera, background listening, face/voice recognition, or natural speech claim
is accepted. MSA carries safety/task meaning; reviewed conversational/code-switch variants are
limited prepared fixtures.

## AC-09 — Typography, RTL, and Accessibility Oracle

- Alexandria: Child hero 32/44 800, Parent hero 30/42 700, Child screen title 26/38 700, Parent
  screen title 24/36 700.
- Readex Pro: Child Arabic body 18/30 400–500, Parent Arabic body 17/28 400, Child button 17/26 600,
  Parent button 16/24 600, caption minimum 14/22.
- True page-level RTL in Arabic and true LTR in English; one locale on ordinary controls.
- No artificial Arabic letter spacing or thin Arabic weight.
- Correct bidi isolation and tabular alignment for `AED 25`, `١٢٠ بذرة`, ranks, scores, dates, and
  names.
- 200% text scale without clipped safety/actions; 48dp targets; accessible contrast and reading
  order; captions and reduced-motion parity.
- Badge criteria, source rows, lock reasons, progress, and status changes have explicit accessible
  names; opening a detail sheet moves focus into it and Back/dismiss restores focus to its tile.
- Default frames compare at 390×844 and remain usable at 320×568, 360×800, 430×932, and the
  connected SM_T835/tablet viewport with natural scrolling and no fixed-canvas clipping.
- One approved release uses one consistent visual digit strategy; every numeric token remains bidi
  isolated and has equivalent spoken semantics regardless of glyph choice.

Final colors, radii, spacing, icons, illustrations, and motion are not accepted until derived from
the approved Stitch system.

## AC-10 — Privacy and Capability Truth Oracle

Every tested shared surface applies its allowlist before rendering or mutation. Every synthetic
access, pairing, member, reward, media, assistant, and voice object shows its origin where confusion
is possible. The app makes zero claims of production auth, payment/custody, real invitation,
live Child media/voice, unrestricted AI, real planting, or measured environmental impact. Impact
Path and badges remain private and never enter a public profile, League row, or global ranking.
Place/heritage content requires no location, GPS, camera, microphone, visit proof, copied official
art, or official partnership/endorsement claim.

## AC-11 — First-Run Introduction and Route Recovery Oracle

- The system splash is native configuration and never a navigable route.
- A brief, interruptible Opening Moment is visually distinct from exactly three role-neutral
  introduction panels.
- Finish and Skip both hand off to the existing R001 `/` access entry; no role or profile is chosen
  inside the introduction.
- Manual replay returns to its validated Welcome, Parent Settings, or Child Settings origin. It
  does not mutate a profile, task, Seed, landscape, canopy, League, badge, reward, or analytics
  record.
- An authorized deferred deep link is restored only after access requirements are satisfied. An
  unauthorized or stale destination is discarded safely.
- First install, returning launch, warm/hot resume, app update, corrupt preference, offline, and
  reduced-motion states are specified and testable.

## AC-12 — Impact Path and Badge Oracle

- Impact Path is one free private projection of Parent-approved lifetime Seeds. It is not XP, a
  second currency, a paid pass, a rank, or a source of Seeds.
- The P0 Water & Coast chapter has exactly stations 120, 132, 144, 156, 168, and 180. Reaching a
  station records one permanent profile-scoped receipt.
- P0 config contains exactly the 16 stable IDs in `docs/content/BADGE_CATALOG.md`; it silently adds
  no decorative or unreachable seventeenth badge.
- Every composite criterion exposes its Seed, station, acquisition mastery, learning, activity,
  and prerequisite components. A Seed total never proves another component.
- Bud, Branch, and Shade mean practice progression, not rarity. Earned badges never expire,
  downgrade, transfer, become public, or gain monetary value.
- `task_recycling_p0_v1` adds at most one sorting and one coast-care acquisition credit after its
  one valid approval. The 132 fixture cannot award Sorting Branch without immutable provenance for
  the missing earlier sorting credit.
- Station 180 may complete its Path result. It advances a garden only if the garden's independent
  mapped-landscape rule and provenance also qualify.

## AC-13 — Learning, Parent Progress, and Profile Isolation Oracle

- P0 includes one finite `learning.mangrove_roots.v1` package and an equally visible, equal-credit
  accessible or Parent-guided alternative. Neither route is framed as lesser.
- Completing either route once creates one immutable completion and zero Seeds, garden, canopy,
  Leaf, League, or Family Reward change. Wrong-answer retry is kind and consequence-free.
- A Parent may view only the selected Child's read-only Path, badge criteria, provenance-backed
  earned dates or explicit historical-date-unavailable state, and source/review status. No
  comparison, inferred preference, personality, ability, diagnosis, or public share is shown.
- Salem's Path, events, awards, learning, reveal, and migration keys cannot appear for Alya or a
  new Child, and the reverse is also true.
- `recognition.safe_help_once.v1` may appear once when explicit evidence qualifies. It is not a
  badge, adds no progress, and never labels character.
- E1–E4 source access is research input only. Named factual, Arabic/UAE cultural, safeguarding,
  accessibility, and rights reviews remain required and are never inferred from a URL.

## AC-14 — Migration, Persistence, and Reveal Recovery Oracle

- Migration backfills only awards proven by immutable evidence under a recorded evaluator version,
  mints zero Seeds, infers zero mastery credits, queues no reveal, and never fabricates an earned
  date. A later criteria version cannot revoke or silently reinterpret an earned award.
- Approval, learning, activity, migration, station, badge-award, and safe-help keys are idempotent
  and profile-scoped.
- Killing and reopening the approved build preserves committed progress only after the minimal
  versioned persistence decision is explicitly approved and implemented. Until then this assertion
  is `BLOCKED`, not simulated as a pass.
- A pending RevealBundle recovers once after interruption, can become `seen`, and cannot replay its
  mutations. Reduced motion exposes the identical final data and finite dismissal path.

## Verification Matrix

| Contract    | Documentation/design     | Automated                        | Web                           | Physical Android/human                            |
| ----------- | ------------------------ | -------------------------------- | ----------------------------- | ------------------------------------------------- |
| AC-00       | Required before release  | —                                | —                             | —                                                 |
| AC-01–AC-04 | Spec/frame review        | Fresh focused tests              | Fresh role-flow proxy         | Native Back/accessibility review                  |
| AC-05–AC-07 | Oracle review            | Idempotency/League/reward tests  | Visual ordering/privacy proxy | Judge/human comprehension                         |
| AC-08       | Safety/content review    | Intent/permission/fallback tests | Prepared-state proxy          | Native playback/permissions + safeguarding review |
| AC-09       | Frame/token audit        | Resource/style assertions        | RTL/LTR/scale proxy           | Named device, TalkBack, scale, reduced motion     |
| AC-10       | Claim/privacy review     | Projection/source scan           | Network/request ledger        | Named privacy/capability review                   |
| AC-11       | Entry/state-map review   | Route/preference/reset tests     | First-run/replay proxy        | Cold/warm/hot launch + Back/deep links            |
| AC-12       | Criteria/catalog review  | Evaluator/idempotency tests      | Path/gallery/detail proxy     | Criteria comprehension and touch review           |
| AC-13       | Content/review ledger    | Learning/profile-isolation tests | Learning/Parent-view proxy    | Named content/accessibility review                |
| AC-14       | Persistence decision ADR | Migration/recovery/restart tests | Interruption proxy            | Kill/relaunch and reduced-motion recovery         |

Every Growth Journey cell starts `NOT RUN` unless the dependency itself is `BLOCKED`. Direct R001
evidence remains valid only for its released Batch 1 assertions; Revision 1 evidence remains
`HISTORICAL`.

## Release Boundary

Current result: **DOCUMENTATION READY; GROWTH IMPLEMENTATION BLOCKED** because AC-00 is blocked on
a complete, user-approved Growth Journey Stitch release and its prerequisite shells. R001 remains
released only within its recorded Welcome/Parent-onboarding boundary.

After AC-00 passes, update this contract with exact route/frame identifiers before implementation.
Reconcile or deliberately retire the historical `domain-contract.md` and `assistant-contract.md`
in the same gate so no Revision 1 interface is mistaken for Revision 2 authority.
After implementation, Revision 3 is not demo-accepted until the deterministic path, named Android
build, bilingual/accessibility checks, five rehearsals, three-person comprehension, and named
Arabic/UAE, safeguarding, reward-ethics, sustainability, and accessibility reviews are directly
recorded.
