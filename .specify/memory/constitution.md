<!--
Sync Impact Report
- Version change: 2.1.0 -> 2.1.1
- Modified principles: Design Is a Core Feature
- Modified sections: Delivery Workflow; Governance
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none; the approved R001 Batch 1 frames release only their seven-screen slice,
  while every unreleased Revision 2 screen remains behind the Stitch approval gate
-->
# Ghaf — غاف Constitution

## Core Principles

### I. MVP Prototype First
Ghaf is an MVP Prototype for competition evaluation. It demonstrates the product concept, core
interactions, bounded AI value, cultural identity, visual quality, and a responsible sustainability
connection. It is not production authentication, a payment product, a social network, a compliance
program, a verified environmental-impact platform, or a store-ready deployment.

Every tradeoff MUST favor, in order: child safety and dignity, a complete family outcome, memorable
visual quality, interaction clarity, correct Arabic, demo reliability, team comprehension, and
reasonable cleanliness. Separate synthetic Parent and Child access, a private weekly Family League,
and a private off-app Family Reward promise MAY be demonstrated only within the boundaries below.

### II. One Complete Journey
The Parent-to-Child-to-recognition-to-growth journey MUST work end to end before secondary features
are added. Parent and Child MUST use separately gated experiences inside one application; the normal
product MUST NOT depend on an in-app role toggle or repeated forced role switching. A hidden,
clearly labeled operator control MAY coordinate synthetic demo state without becoming product
navigation.

### III. Design Is a Core Feature
Visual identity, motion, spacing, Arabic typography, emotional appeal, and presentation quality
MUST be treated as product requirements. The Ghaf tree and household canopy MUST remain the
strongest brand silhouette and emotional anchor. Alexandria is the approved display family and
Readex Pro is the approved body/control/data family for both locales. Final screen geometry,
component placement, visual tokens, illustration composition, and route realization MUST follow
the user-approved Google Stitch frames. Implementation MAY proceed only for a supplied, reviewed,
and reconciled screen batch; all unreleased screens MUST remain blocked behind that same gate.

### IV. Arabic-First, Bilingual Experience
Every approved user-facing flow MUST work naturally in Arabic and English. Arabic MUST be the
starting locale. True page-level RTL, logical start/end alignment, mixed-script content, numbers,
icons, progress direction, generous Arabic line height, and unclipped font scaling MUST be tested
from the first implementation rather than deferred as polish. Ordinary screens MUST be fully
localized instead of displaying both languages simultaneously.

### V. Mock-First, Replaceable Services
Every external dependency MUST have a deterministic local implementation capable of completing the
demo without network access. Screens MUST depend on small service contracts so a later approved
provider can replace a mock without screen-wide rewrites. Synthetic access, pairing, reauthentication,
League membership, rewards, assistant responses, and voice states MUST all reset deterministically.

### VI. Keep Architecture Small
The team MUST use the minimum number of libraries, services, abstractions, repositories, and screen
families needed for the approved MVP. Ghaf remains one Expo application with role-specific
navigation and approximately fourteen screen families plus contextual states. Production
infrastructure, a second application, speculative flexibility, and technically interesting
additions without direct demo value MUST be excluded.

### VII. Visible AI Value
AI MUST visibly perform a bounded, structured transformation or task-coaching action tied to the
approved real-world family journey. Parent-owned input MUST remain under Parent review before it
becomes an assignment, and every prepared, simulated, fallback, or live result MUST be labeled
honestly at the point of use. AI MUST NOT be reduced to a decorative chatbot, unrestricted Child
chat, companion theater, an invisible label on static behavior, or an automated judge of a Child.

### VIII. Honest Prototype Boundaries
Documentation and the demo MUST clearly identify behavior that is real interaction, synthetic,
prepared, simulated, self-reported, blocked, not run, or future. Synthetic Parent/Child access MUST
not be described as production authentication or security. A Family Reward MAY represent a private
Parent-funded promise delivered outside the app; Ghaf MUST NOT transfer, store, custody, convert,
or settle money and MUST NOT imply a universal Seed-to-currency exchange rate.

### IX. Fast Team Collaboration
Work MUST be split into small, explicitly owned tasks with minimally overlapping file scopes. Spec
Kit artifacts are the primary planning source. One integration owner MUST be named for each work
period, and agents MUST read this constitution plus the active feature artifacts before edits.

### X. Demo Reliability
Every judge-facing feature MUST have a deterministic fallback. Mock mode, prepared media, seeded
data, and one visible Parent-authorized reset MUST support repeatable rehearsal without remote
services. League week state, reward-plan state, access state, permissions, and pairing state MUST
reset together. Rehearsal targets MUST be recorded as internal goals rather than represented as
external competition rules unless an authoritative source establishes them.

## Prototype Boundaries

- The app MUST use synthetic or team-created demo data and MUST NOT contain real child data.
- Parent and Child experiences MAY use deterministic synthetic sign-in, PIN, picture-sequence,
  passkey/biometric, QR, pairing-code, and reauthentication simulations. They MUST disclose that
  production identity verification, account recovery, cryptography, tenancy, and secure device
  binding are not implemented.
- Normal Child navigation MUST NOT expose Parent tasks, reports, rewards, invitations, permissions,
  or a shortcut into Parent mode.
- The Ghaf Family League MAY show invite-only synthetic siblings and cousins. It MUST normalize
  exactly five weekly Challenge Leaves per participating Child, cap score at 100, give full credit
  for permitted help and accessibility adaptations, share tied positions without speed ranking,
  exclude money and private task data, and preserve permanent Seeds and garden growth across the
  weekly reset.
- A Family Reward MAY be money, an experience, a privilege, or a gift privately promised by a
  Parent and delivered outside Ghaf. It MUST be milestone-based, rank-independent, noncustodial,
  private to the Child and guardians, irreversible after unlock, and free from a universal exchange
  rate. Prayer, affection, emotional disclosure, food consumption, and proof of love MUST NOT be
  monetized.
- API keys MUST NOT be committed, and provider secrets MUST NOT be embedded in the mobile app.
- Audio capture MUST never be ambient or background. P0 voice and push-to-talk states MUST use
  prepared or simulated synthetic fixtures without requesting real microphone or camera access.
- Parent approval MUST remain in the task-and-recognition journey. AI MUST NOT determine task
  appropriateness, a Child's worth or condition, religious validity, truthfulness, or whether food
  or a hazard is safe.
- Production authentication, payment processing, stored value, custody, banking, real family
  invitations, real Child media, analytics, production persistence, compliance claims, and
  production deployment remain outside MVP scope.
- Android is the primary physical demo target. iOS compatibility is useful when inexpensive; web
  is a secondary development surface and cannot pass native evidence gates.

## Delivery Workflow

- Each feature MUST follow its requested Spec Kit cycle and remain within its approved spec.
- Historical Feature 001, Feature 002, and Feature 003 Revision 1 scope and evidence MUST remain
  attributed to their own artifacts or historical sections. No prior implementation, automated
  pass, web walkthrough, Android result, or human review MAY satisfy Feature 003 Revision 2.
- Feature 003 Revision 2 was product-approved on 2026-09-01. The approved R001 Batch 1 frames
  released only Welcome and first-time Parent onboarding after reconciliation with the active
  artifacts. Application implementation for every later screen MUST remain `BLOCKED` until the
  user supplies and approves its Stitch frames and the active spec, plan, tasks, data model,
  acceptance contract, and design documents are reconciled to that batch.
- Before a screen batch passes that gate, agents MUST NOT change its routes, application state,
  tests, fonts/assets, packages, dependencies, or runtime evidence.
- Requirements and plans MUST distinguish real interaction, synthetic, prepared, simulated,
  optional-later, blocked, not run, and future behavior.
- Quality gates MUST be proportional to prototype risk: artifact consistency, focused automated
  tests, deterministic offline smoke paths, Arabic/RTL review, physical-device review, privacy and
  child-safety review, and demo rehearsal.
- Agents MUST NOT introduce production infrastructure or expand the approved screen-family set
  without first updating the active specification.

## Governance

This constitution governs all Ghaf specifications, plans, tasks, implementation, and reviews.
Conflicts MUST be resolved in favor of these principles. Amendments require a documented rationale,
an updated Sync Impact Report, semantic versioning, and review by the current integration owner.
Feature artifacts MUST be rechecked after any material amendment. Reviewers MUST reject production
authentication/payment claims, unsafe competition or reward behavior, or implementation that
bypasses the per-batch Stitch design-intake gate unless the constitution is explicitly amended
again.

**Version**: 2.1.1 | **Ratified**: 2026-08-22 | **Last Amended**: 2026-09-03
