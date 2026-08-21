<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: MVP Prototype First; One Complete Journey; Design Is a Core Feature;
  Arabic-First, Bilingual Experience; Mock-First, Replaceable Services; Keep Architecture Small;
  Visible AI Value; Honest Prototype Boundaries; Fast Team Collaboration; Demo Reliability
- Added sections: Prototype Boundaries; Delivery Workflow
- Removed sections: generic template placeholders
- Follow-up TODOs: none
-->
# Ghaf — غاف Constitution

## Core Principles

### I. MVP Prototype First
> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

Every tradeoff MUST favor, in order: a complete demo flow, memorable visual quality, interaction
clarity, correct Arabic, demo reliability, team comprehension, and reasonable cleanliness.

### II. One Complete Journey
The parent-to-child-to-Ghaf-growth journey MUST work end to end before secondary features are
added. A single complete, judge-readable experience is more valuable than multiple incomplete
features, screens, or integrations.

### III. Design Is a Core Feature
Visual identity, motion, spacing, Arabic typography, emotional appeal, and presentation quality
MUST be treated as product requirements. The Ghaf tree MUST remain the hero visual, progression
indicator, emotional anchor, and demo climax.

### IV. Arabic-First, Bilingual Experience
Every approved user-facing flow MUST work naturally in Arabic and English. RTL layout, logical
start/end alignment, mixed-script content, numbers, icons, and progress direction MUST be tested
from the first implementation rather than deferred as polish.

### V. Mock-First, Replaceable Services
Every external dependency MUST have a deterministic mock implementation capable of completing
the demo without network access. Screens MUST depend on small service contracts so real providers
can replace mocks without screen-wide rewrites.

### VI. Keep Architecture Small
The team MUST use the minimum number of libraries, services, abstractions, repositories, and
screens needed for the approved MVP. Production infrastructure, speculative flexibility, and
technically interesting additions without direct demo value MUST be excluded.

### VII. Visible AI Value
AI MUST visibly transform a family voice note and household food-waste situation into a structured,
personalized child mission that a parent reviews. AI MUST NOT be reduced to a decorative chatbot,
an unrestricted child chat surface, or an invisible label on static behavior.

### VIII. Honest Prototype Boundaries
Documentation and the demo MUST clearly identify behavior that is real, mocked, seeded,
pregenerated, or future work. The team MUST NOT claim food-safety assessment, production readiness,
legal compliance, real financial rewards, or capabilities the prototype does not provide.

### IX. Fast Team Collaboration
Work MUST be split into small, explicitly owned tasks with minimally overlapping file scopes.
Spec Kit artifacts are the primary planning source. One integration owner MUST be named for each
work period, and agents MUST read this constitution plus the active feature artifacts before edits.

### X. Demo Reliability
Every judge-facing feature MUST have a deterministic fallback. Mock mode, prepared media, seeded
data, and a visible reset path MUST support repeatable rehearsal and an approximately 90-second
demo even when network services are unavailable.

## Prototype Boundaries

- The app MUST use synthetic or team-created demo data and MUST NOT contain real child data.
- API keys MUST NOT be committed, and OpenAI secret keys MUST NOT be embedded in the mobile app.
- Audio capture MUST start only after a visible microphone action; continuous or background
  recording is prohibited.
- Parent approval MUST remain in the mission journey, and the app MUST NOT claim that AI decides
  whether food is safe to eat.
- Production authentication, multi-family tenancy, banking, real rewards, school administration,
  enterprise security, compliance programs, and production deployment are outside MVP scope.
- Android is the primary physical demo target. iOS compatibility is useful when inexpensive; web
  is a secondary development surface.

## Delivery Workflow

- Each feature MUST follow its requested Spec Kit cycle and remain within its approved spec.
- Feature 001 MUST establish only the small repository and Expo foundation, then pass typecheck,
  lint, focused tests, and a demo-oriented convergence review.
- Feature 002 MUST stop after specification, research, design, tasks, and analysis until the team
  explicitly approves implementation.
- Requirements and plans MUST distinguish real, mocked, optional-later, and future behavior.
- Quality gates MUST be proportional to prototype risk: basic checks, focused tests, a mock-flow
  smoke test, Arabic/RTL review, physical-device review, and demo rehearsal.
- Agents MUST NOT introduce production infrastructure or expand the screen set without first
  updating the active specification.

## Governance

This constitution governs all Ghaf specifications, plans, tasks, implementation, and reviews.
Conflicts MUST be resolved in favor of these principles. Amendments require a documented rationale,
an updated Sync Impact Report, semantic versioning, and review by the current integration owner.
Feature artifacts MUST be rechecked after any material amendment. Reviewers MUST reject scope or
architecture that contradicts MVP Prototype First unless the constitution is explicitly amended.

**Version**: 1.0.0 | **Ratified**: 2026-08-22 | **Last Amended**: 2026-08-22
