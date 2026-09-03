# Phase 0 Research: Family Growth Garden — Revision 3

**Feature**: `003-family-growth-garden`

**Revision 3 planning date**: 2026-09-03

**Status**: Product/domain decisions resolved for planning; visual implementation and content
approval are blocked until approved Google Stitch frames and named reviews are supplied.

**Planning input**:
[`docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/`](../../docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/)

**Reconciled preflight**:
[`design-intake/growth-journey-preflight.md`](design-intake/growth-journey-preflight.md)

Revision 1 research described the historical linear ten-route implementation. It remains useful as
repository history but is not the Revision 3 decision baseline or acceptance evidence. Revision 2
remains the inherited product baseline; R001 evidence applies only to its released access slice.

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

## Decision 3 — Separate Every Progress Authority

**Decision**:

- Seeds and landscapes are permanent personal growth.
- Weekly Growth Score is `confirmed Challenge Leaves / 5 × 100`.
- Family Reward is a private Parent-funded milestone promise delivered outside Ghaf.
- Impact Path is a private projection of lifetime confirmed Seeds plus separately proven
  action/learning evidence; it is not a currency or rank.

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
presentation order is Parent praise → any honestly labelled self-reported activity result → 12
Seeds → mapped Mangrove growth → family canopy → fifth Challenge Leaf and League result → eligible
Path/badge/recognition results → private reward unlock message last. Submission itself changes
nothing. One event creates at most one recoverable RevealBundle.

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
family in both locales. The sizes in `spec.md` are fixed product requirements. R001 resolves local
font loading for its released slice. Later token changes, layout, radii, illustration, navigation
appearance, and motion remain blocked on Stitch.

**Rationale**: Typography is approved product direction, while implementing visual details from
text alone would conflict with the user's pending screen designs.

**Alternatives considered**: Retain system typography (superseded); guess later Stitch geometry
(rejected); replace the working R001 font integration without a measured need (rejected).

## Decision 11 — Preserve One Deterministic Aggregate and Fresh Evidence

**Decision**: Reset atomically restores access, pairing, permissions, tasks, Mangrove/canopy,
five-Leaf week, standings, reward plan, prepared fixtures, and Arabic RTL welcome history. Every
Revision 3 Growth Journey automated, web, Android, accessibility, and human-review evidence starts
fresh. Direct R001 Batch 1 evidence remains valid only inside its recorded release boundary.

Opening/introduction seen/version flags are install-level preferences; story preference is
profile-scoped; replay/deep-link/nested-route origin is transient navigation state and carries a
Child ID whenever it targets a Child surface. Ordinary restart or replay preserves progress and
preferences. The Parent-authorized demo reset restores the domain fixture, preserves install/profile
preferences, and clears transient navigation intent. An operator-only first-run reset may clear only
the install-level flags separately.

**Rationale**: The broader product state must remain repeatable offline, and Revision 1 checks do
not exercise the new access, League, rewards, typography, or navigation.

## Decision 12 — Do Not Freeze Routes Before Stitch Intake

**Decision**: The inherited Revision 2 families plus the explicit Growth release inventory in the
preflight are product requirements. Exact unreleased route paths, frame/state allocation,
component geometry, and assets are not selected until the approved Stitch export is inventoried
and reconciled.

**Rationale**: Screen prompts communicate intent but are not final design evidence. A route tree
chosen now could force the later design into an obsolete architecture.

## Decision 13 — Project One Free Path from the Seed Ledger

**Decision**: Lifetime Seed total is derived only from immutable positive Parent-approved
transactions. Water & Coast stations project thresholds 120/132/144/156/168/180. Landscape,
canopy, League, and Family Reward authorities remain separate even when values change in the same
confirmation. Station 180 completes its Path result but changes a landscape only when that
landscape's independent mapping and provenance also qualify. See
[`ADR 0002`](../../docs/architecture/adr/0002-impact-path-projection.md).

**Rationale**: Reusing Seeds preserves a simple mental model; separate provenance prevents a path
threshold from falsely advancing a landscape, rank, or private reward.

## Decision 14 — Use Transparent Composite Badge Criteria

**Decision**: P0 has exactly the 16 stable badge definitions in `docs/content/BADGE_CATALOG.md`.
Seed, station, acquisition mastery, learning, activity, and prerequisite components are evaluated
explicitly and shown separately. Bud/Branch/Shade describes practice, not rarity.

**Rationale**: A high Seed total cannot prove sorting, water care, habitat learning, or a visit.
Transparent components are testable and more autonomy-supportive than mystery unlocks.

## Decision 15 — Make Learning Finite, Equal-Credit, and Zero-Seed

**Decision**: P0 authors one Mangrove package with a sourced story and a visible story-disabled or
Parent-guided equivalent. Either route commits one idempotent completion event, adds zero Seeds/
garden growth, and may satisfy only its named criterion.

**Rationale**: Learning has intrinsic meaning and should not inflate the action-reward economy. An
equal-credit route prevents story format or accessibility needs from becoming a disadvantage.

## Decision 16 — Reconcile One Result Bundle

**Decision**: One event creates at most one pending/seen RevealBundle. It projects, rather than
owns, the immutable receipt and retains praise, Seeds, mapped garden, canopy/League, Path/badges/
recognition, and private Family Reward last. Reduced motion shows the same result.

**Rationale**: One finite causal explanation avoids stacked modals, duplicate awards, and reward
pressure without discarding established outcomes.

## Decision 17 — Keep Task and League Contracts Intact

**Decision**: Growth mastery/action mappings extend immutable reviewed task versions; they do not
replace eight categories, `recognitionMode`, `routinePhase`, safety, visibility, Green, League, or
Family Reward eligibility. The private invite-only League and English label remain; the new “no
ranking” rule means no public/global ranking or badge comparison. The canonical recycling task can
add at most one sorting and one coast-care acquisition credit on valid approval. Safe-help
recognition is one-time descriptive feedback, not a badge or progress source.

**Rationale**: The prompt pack assumed a narrower environmental taxonomy and an unapproved Shared
Growth shell. Silent replacement would weaken safety/privacy policy and erase an approved product
decision.

## Decision 18 — Separate Fact, Lore, and Review Authority

**Decision**: Every factual item keeps source metadata and verified fact separate from original
creative lore. Source access is not Ghaf approval. Named factual, Arabic/UAE cultural,
safeguarding, accessibility, and rights reviews remain required; place content uses no visit proof
or official identity.

**Rationale**: Source links can change, and official facts do not grant permission to copy art,
marks, or imply endorsement.

## Decision 19 — Layer First-Run Presentation Before R001

**Decision**: A native system splash remains separate from an optional brief Opening Moment and
exactly three role-neutral introduction panels. After visual approval, Finish/Skip hands off to the
released R001 `/`; manual replay returns to a validated origin and cannot mutate domain state.

**Rationale**: This preserves the implemented access contract while clearly separating product
orientation from Parent household onboarding.

## Decision 20 — Isolate Profiles and Version Migration

**Decision**: Achievement progress, events, awards, reveals, migration, and route origins include
profile identity. Migration backfills only provable history and queues no reveal. A small local
persistence adapter is a proposed gap to measure after Stitch; no dependency is approved now.

**Rationale**: Salem fixtures must not leak to Alya or a new Child, and prototype restart continuity
must not grow into an unplanned production storage system.

## Research Resolution

No product `NEEDS CLARIFICATION` item remains for planning. Open dependencies are intentional:
approved complete Stitch frames, a measured local-persistence choice, one consistent visual digit
strategy, and named content reviews. They are recorded as `BLOCKED`/`NOT RUN`, not permission to
infer a design or claim approval. After frames arrive, perform a focused design/route/component/
asset/persistence analysis and update the plan, contracts, quickstart, and post-T174 tasks before
implementation.
