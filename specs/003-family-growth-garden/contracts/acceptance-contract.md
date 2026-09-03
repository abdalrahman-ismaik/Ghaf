# Acceptance Contract: Family Growth Garden — Revision 2

**Approved product revision**: 2026-09-01

**Current release state**: **DESIGN BLOCKED**. This contract defines future acceptance; it does not
claim the Revision 2 app or frames exist.

Revision 1's ten-route implementation and evidence are historical and cannot satisfy an assertion
below.

## Evidence Vocabulary

| Status       | Meaning                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| `PASSED`     | Direct evidence exists for the exact Revision 2 artifact/build and assertion      |
| `FAILED`     | The exact assertion was attempted and did not hold                                |
| `BLOCKED`    | An attempted or required gate cannot proceed because a named dependency is absent |
| `NOT RUN`    | No qualifying Revision 2 attempt exists                                           |
| `HISTORICAL` | Evidence belongs to Revision 1 or an earlier feature and is not reusable          |

Synthetic, prepared, and simulated are capability-origin labels, not evidence statuses.

## AC-00 — Stitch Design-Intake Gate

Implementation is accepted for release only if all are true:

- the user supplied and approved the selected Stitch frames;
- Arabic RTL and matched English LTR cover every required screen family and state;
- exact route, navigation, component, token, font-loading, illustration, motion, and Back behavior
  are recorded in the design/plan artifacts;
- Parent navigation is Home/Tasks/Garden/Family and Child navigation is Today/Garden/League;
- cross-role navigation and the old role toggle are absent from ordinary product frames;
- the product, privacy, competition, reward, AI, Arabic, and accessibility audits pass; and
- the integration owner explicitly releases the implementation block.

Absent Stitch frames produce `BLOCKED`, never an inferred pass.

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

Task Builder contains Choose, Adjust, and Review/Assign. Celebration is a Garden state. AI is
contextual, not a tab. Exact route paths are filled after Stitch intake.

## AC-03 — Canonical Reset Oracle

One Parent-authorized reset atomically restores:

| Field         | Expected value                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Entry         | Arabic RTL welcome/access, signed out, no protected Back history                                                  |
| Household     | Synthetic Al Noor; Salem 9; Alya 11                                                                               |
| League        | Synthetic Salem/Alya/Mariam/Rashid; five slots each                                                               |
| Salem         | 4/5 confirmed; Weekly Growth Score 80                                                                             |
| Other scores  | Mariam 100, Alya 60, Rashid 40                                                                                    |
| Garden        | Salem Mangrove 48/60 Shoot; family canopy 19/25                                                                   |
| Family Reward | Salem 108/120 eligible Seeds; AED 25; Promised; private                                                           |
| Task          | No active assignment/submission until Parent creates it                                                           |
| Fixtures      | `guide_recycling_refine_v1`, `coach_recycling_steps_v1`, `fixture_recycling_clean_v1`, `fixture_salem_plan_ar_v1` |
| Permissions   | Real camera/microphone off; prepared voice on; captions on                                                        |
| Recognition   | Empty ledger; celebration unavailable/unconsumed                                                                  |

Reset must pass from access, pairing, draft, Coach voice, submitted, retry, confirmation,
celebration, Garden, League, reward, permission, device, and reauthentication states without
network, auth, camera, microphone, payment, invitation, or AI service.

## AC-04 — No-Early-Recognition Oracle

Assignment, Child choice, start, help/Coach use, prepared voice/media, completion with help,
submission, and kind retry change all of the following by zero:

- Seeds and landscape stage;
- family-canopy leaves;
- Challenge Leaf count and Weekly Growth Score; and
- Family Reward progress/state.

Help, accessibility adaptation, and an agreed smaller/equivalent task preserve the displayed award
and full Challenge Leaf credit after Parent confirmation.

## AC-05 — Confirmation and Presentation Oracle

The first valid P0 confirmation stores one immutable receipt and presents:

1. Parent praise naming the safe action/help-seeking;
2. exactly 12 Seeds;
3. Mangrove 48/60 Shoot → 60/60 Sapling;
4. family canopy 19/25 → 20/25, exactly one leaf;
5. Salem 4/5 → 5/5 and score 80 → 100;
6. reward progress 108/120 → 120/120 and Promised → Unlocked; and
7. the private reward message only after praise and garden growth.

Five duplicate confirmation attempts must each return a neutral Already confirmed result and
change no transaction, stage, leaf, score, reward, rank, announcement, or celebration.

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

Final colors, radii, spacing, icons, illustrations, and motion are not accepted until derived from
the approved Stitch system.

## AC-10 — Privacy and Capability Truth Oracle

Every tested shared surface applies its allowlist before rendering or mutation. Every synthetic
access, pairing, member, reward, media, assistant, and voice object shows its origin where confusion
is possible. The app makes zero claims of production auth, payment/custody, real invitation,
live Child media/voice, unrestricted AI, real planting, or measured environmental impact.

## Verification Matrix

| Contract    | Documentation/design    | Automated                        | Web                           | Physical Android/human                            |
| ----------- | ----------------------- | -------------------------------- | ----------------------------- | ------------------------------------------------- |
| AC-00       | Required before release | —                                | —                             | —                                                 |
| AC-01–AC-04 | Spec/frame review       | Fresh focused tests              | Fresh role-flow proxy         | Native Back/accessibility review                  |
| AC-05–AC-07 | Oracle review           | Idempotency/League/reward tests  | Visual ordering/privacy proxy | Judge/human comprehension                         |
| AC-08       | Safety/content review   | Intent/permission/fallback tests | Prepared-state proxy          | Native playback/permissions + safeguarding review |
| AC-09       | Frame/token audit       | Resource/style assertions        | RTL/LTR/scale proxy           | Named device, TalkBack, scale, reduced motion     |
| AC-10       | Claim/privacy review    | Projection/source scan           | Network/request ledger        | Named privacy/capability review                   |

Every cell starts `NOT RUN` for Revision 2 unless the dependency itself is `BLOCKED`. Revision 1
evidence remains `HISTORICAL`.

## Release Boundary

Current result: **NOT READY FOR IMPLEMENTATION** because AC-00 is `BLOCKED` on user-supplied
approved Stitch frames.

After AC-00 passes, update this contract with exact route/frame identifiers before implementation.
Reconcile or deliberately retire the historical `domain-contract.md` and `assistant-contract.md`
in the same gate so no Revision 1 interface is mistaken for Revision 2 authority.
After implementation, Revision 2 is not demo-accepted until the deterministic path, named Android
build, bilingual/accessibility checks, five rehearsals, three-person comprehension, and named
Arabic/UAE, safeguarding, reward-ethics, sustainability, and accessibility reviews are directly
recorded.
