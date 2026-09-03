# Phase 0 Research: Family Growth Garden — Revision 2

**Feature**: `003-family-growth-garden`

**Revision 2 date**: 2026-09-01

**Status**: Product decisions resolved; visual implementation research is blocked until approved
Google Stitch frames are supplied.

Revision 1 research described the historical linear ten-route implementation. It remains useful as
repository history but is not the Revision 2 decision baseline or acceptance evidence.

## Decision 1 — Keep One App, Separate the Experiences

**Decision**: Ghaf remains one application with separately gated Parent and Child experiences.
Parent navigation is Home/Tasks/Garden/Family; Child navigation is Today/Garden/League. Normal
navigation contains no role toggle.

**Rationale**: Protected role experiences reduce daily friction and prevent a Child from reaching
guardian controls while preserving one maintainable app.

**Alternatives considered**: Keep `/role` switching (rejected as the superseded demo pattern); build
two apps (rejected as unnecessary scope).

## Decision 2 — Demonstrate Access Honestly with Synthetic State

**Decision**: P0 simulates Parent phone/email verification, PIN/passkey/biometric return access,
Child PIN/picture sequence, QR/short-code pairing, approval, revocation, and sensitive-action
reauthentication through deterministic fixtures. It makes no production authentication claim.

**Rationale**: The screen behavior and role boundary can be demonstrated without collecting real
identity data or building security infrastructure.

**Alternatives considered**: Real auth/tenancy (outside P0); a visual role switch (insufficient
boundary); Child email/phone (unnecessary and prohibited).

## Decision 3 — Separate Seeds, League Score, and Family Reward

**Decision**:

- Seeds and landscapes are permanent personal growth.
- Weekly Growth Score is `confirmed Challenge Leaves / 5 × 100`.
- Family Reward is a private Parent-funded milestone promise delivered outside Ghaf.

**Rationale**: The separation prevents wealth, unlimited task volume, or raw Seed totals from buying
League position and keeps permanent progress independent of weekly competition.

**Alternatives considered**: Rank by Seeds (unfair across age/ability and task volume); reward the
winner with money (coercive and wealth-linked); convert Seeds to AED (creates an exchange/wallet
meaning that Ghaf does not support).

## Decision 4 — Normalize Competition with Five Challenge Leaves

**Decision**: Each participating Child receives exactly five age/ability-appropriate opportunities
before the week. Each confirmed Leaf is 20 points; maximum score is 100. Help, accessibility
adaptations, and agreed equivalents earn full credit. Ties share position and speed never breaks a
tie. Extra tasks may grow the garden but cannot improve rank.

**Rationale**: Equal opportunity count is more comparable than raw task difficulty or output. The
visible ranking is balanced by personal gardens and a cooperative family canopy. Research on
competitive gamification is mixed, so Ghaf does not make competition the only outcome.

**Source supplied with the approved direction**: [Peer competition and collaboration
meta-analysis](https://link.springer.com/article/10.1007/s10639-021-10770-2).

## Decision 5 — Project League Data Through a Strict Allowlist

**Decision**: A League row contains only nickname, tree avatar, position, score, and completed
Leaves. Tasks, evidence, age, accommodations, praise, raw Seeds, money, missed-task reasons, notes,
assistant content, and timestamps are rejected before shared rendering. Prepared bilingual
encouragement is allowed; free text is not.

**Rationale**: UI hiding after projection is too late. A minimized projection prevents private
routine and disability/family context from entering the shared surface.

**Alternatives considered**: Reuse Revision 1 `circleEligible` (rejected because League eligibility
is broader and separately private); show task titles (rejected as unnecessary disclosure); public
discovery/chat (outside P0 and unsafe).

## Decision 6 — Make Family Reward a Noncustodial Promise

**Decision**: A plan belongs to one Child, uses an immutable personal milestone, and transitions
Promised → Unlocked → Given. It may describe money, an experience, a privilege, or a gift. Money is
private, rank-independent, set by the Parent, and fulfilled outside the app. The Parent sees a
monthly maximum promised and reauthenticates before monetary changes.

Every contribution uses a fail-closed eligibility decision tied to the immutable approved task
version. Unknown or prohibited activity adds zero plan progress; landscape milestones use eligible
contribution provenance rather than displayed aggregate growth alone.

**Rationale**: Clear agreed goals and positive recognition can support routines, but Ghaf must not
become a wallet, universal exchange, punishment mechanism, or winner-take-all prize. An unlocked
promise cannot be removed. Future changes require a new prospective plan/version.

**Sources supplied with the approved direction**:
[AAP reward guidance](https://www.healthychildren.org/English/family-life/family-dynamics/Pages/Positive-Reinforcement-Through-Rewards.aspx)
and [CDC praise/reward guidance](https://www.cdc.gov/parenting-toddlers/responding-to-behavior/using-rewards.html).

## Decision 7 — Preserve Praise-First, Idempotent Recognition

**Decision**: One immutable confirmation receipt applies the P0 consequence at most once. The
presentation order is Parent praise → 12 Seeds → Mangrove/canopy growth → fifth Challenge Leaf →
private reward unlock message. Submission itself changes nothing.

**Rationale**: Praise and real action remain primary, money remains secondary, and ledger-first
idempotency prevents double Seeds, score, growth, or unlocks.

**Alternatives considered**: Unlock money first (rejected because it displaces recognition); apply
effects independently (rejected because partial failure becomes ambiguous); reward on submission
(rejected because Parent confirmation is required).

## Decision 8 — Keep Voice Prepared and Task-Bounded in P0

**Decision**: P0 simulates push-to-talk with a visible state, prepared transcript,
delete-before-send, replay, captions, slower playback, and transcript fallback. It requests no real
microphone/camera permission. Coach behavior remains bound to the current task and age band.

**Rationale**: The interaction design can be evaluated without processing real Child voice. It also
preserves the deterministic offline path and avoids implying speech recognition or ambient
listening.

**Alternatives considered**: Real recording or live Child AI (outside P0); open chat (prohibited);
voice-only instructions (inaccessible and nondeterministic).

## Decision 9 — Use MSA for Safety and Review Conversational Arabic

**Decision**: Task requirements, safety, and sensitive content use clear Modern Standard Arabic.
Light Emirati/Gulf greetings and encouragement and prepared Arabic-English code-switch variants
require named Parent/child/language review. P0 does not claim unrestricted natural speech
understanding.

**Rationale**: MSA is the safer shared baseline. Conversational warmth is valuable but must not
invent dialect or imply one family phrase is universal.

## Decision 10 — Approve Font Families, Defer Visual Geometry

**Decision**: Alexandria is the display family and Readex Pro is the body/control/dialogue/numeric
family in both locales. The sizes in `spec.md` are fixed product requirements. Exact font loading,
tokens, layout, radii, illustration, navigation appearance, and motion remain blocked on Stitch.

**Rationale**: Typography is approved product direction, while implementing visual details from
text alone would conflict with the user's pending screen designs.

**Alternatives considered**: Retain system typography (superseded); guess the Stitch outcome
(rejected); install fonts now (premature dependency/asset change).

## Decision 11 — Preserve One Deterministic Aggregate and Fresh Evidence

**Decision**: Reset atomically restores access, pairing, permissions, tasks, Mangrove/canopy,
five-Leaf week, standings, reward plan, prepared fixtures, and Arabic RTL welcome history. Every
Revision 2 automated, web, Android, accessibility, and human-review result starts fresh.

**Rationale**: The broader product state must remain repeatable offline, and Revision 1 checks do
not exercise the new access, League, rewards, typography, or navigation.

## Decision 12 — Do Not Freeze Routes Before Stitch Intake

**Decision**: The approximately fourteen screen families are product requirements; exact route
paths, frame/state allocation, component geometry, and assets are not selected until the approved
Stitch export is inventoried and reconciled.

**Rationale**: Screen prompts communicate intent but are not final design evidence. A route tree
chosen now could force the later design into an obsolete architecture.

## Research Resolution

No product `NEEDS CLARIFICATION` item remains. The only open dependency is an intentional design
input: approved Stitch frames. It is recorded as `BLOCKED`, not as permission to infer a design.
After the frames arrive, perform a focused design/route/component/font-loading analysis and update
the plan, contracts, quickstart, and T111+ tasks before implementation.
