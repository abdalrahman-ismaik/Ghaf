# Contributing to Ghaf — غاف

Ghaf is a three-member competition prototype. Contributions should make the approved demo path
clearer, more polished, or more reliable without introducing production scope.

## Before You Start

1. Run `git status --short` and preserve work you do not own.
2. Read `.specify/memory/constitution.md`.
3. Read the active feature's `spec.md`, `plan.md`, and `tasks.md`.
4. Check [TEAM_OWNERSHIP.md](docs/TEAM_OWNERSHIP.md) and announce the exact task and file boundary.
5. Confirm that no other person or agent is writing those files.

If the requested behavior is outside the active specification, pause and ask the integration owner
to update the Spec Kit artifacts. Feature 002 implementation must not start until its first plan is
reviewed and approved by the team.

## Setup

Requirements are Node.js 22.13 or newer and npm. Install exactly from the lockfile:

```bash
npm ci
```

Start the development server:

```bash
npm start
```

Android is the primary target:

```bash
npm run android
```

No API key, backend, Expo account, or real child information is needed for Feature 001.

## Validation Commands

Run the checks relevant to your change before handoff:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

For a dependency change, use `npm install <package>` so both `package.json` and the lockfile are
updated, and explain why the existing stack is insufficient. Do not install overlapping UI, state,
form, media, or animation libraries.

For user-facing changes, also run the manual steps in [DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md). A
source review is not evidence for a native RTL, physical-device, offline APK, camera, microphone, or
audio result. Record such checks as `NOT RUN` until directly observed.

## Branch and Commit Discipline

- Keep work small enough to map to one or a few Spec Kit task IDs.
- Prefer a short-lived branch named for the feature and topic, for example
  `001-foundation-ghaf-tree`; the integration owner decides the team's exact branch timing.
- Do not commit directly over another member's active file boundary.
- Review `git diff --check`, `git diff --stat`, and `git status --short` before handoff.
- Do not use destructive Git commands or discard unrelated changes.
- Do not commit secrets, real child data, generated caches, or local build artifacts.
- Do not push, force-push, merge, or rewrite shared history without explicit authorization.

Commit messages should be short and outcome-oriented, for example:

```text
feat: add bilingual role selector
test: cover deterministic demo reset
docs: record Android rehearsal steps
```

## File Ownership and Handoffs

Member 1 is the current bootstrap-period integration owner. Ownership is provisional, but it must
be explicit for every work period. The full matrix and handoff record are in
[TEAM_OWNERSHIP.md](docs/TEAM_OWNERSHIP.md).

Use this handoff shape:

```text
Task: T0XX — short outcome
Files owned: exact paths or directories
Checks: command — PASSED/FAILED/BLOCKED/NOT RUN
Manual evidence: device/build/locale, or NOT RUN
Known gaps: concise list
Ready for integration: yes/no
```

Only the integration owner changes shared configuration during integration. At most four agents
may run concurrently, and they must have disjoint write scopes. Read-only review can run in
parallel.

## Implementation Conventions

- Keep `app/` routes thin and put reusable UI under `src/components/`.
- Use shared tokens rather than one-off colors, spacing, radii, shadows, or motion values.
- Use logical start/end alignment and locale-aware text alignment for Arabic and English.
- Put user-facing shared strings in the bilingual resources unless a deliberately hard-coded
  prototype string is documented.
- Consume service interfaces through the registry; never import a concrete remote provider into a
  screen.
- Start external behavior with a deterministic mock and preserve a complete offline path.
- Keep reset deterministic and update its tests if the approved baseline changes.
- Label seeded, pregenerated, mocked, and future behavior honestly in the UI and docs.
- Use only synthetic or team-created profiles, media, and mission content.

## Scope Guard

Do not add production authentication, multi-family tenancy, school administration, payments,
banking, real rewards, a marketplace, social feed, unrestricted child chat, continuous/background
recording, production analytics, deployment automation, enterprise security/compliance work, a
second application, or a 3D/VR experience.

Do not claim that AI determines food safety. Any future recording starts only after a visible
microphone action, and an OpenAI secret must never be placed in the mobile application.

## Definition of a Good Handoff

A change is ready for integration when it matches the active specification, stays inside its file
boundary, uses the existing small architecture, includes proportional checks, works with the mock
fallback, preserves Arabic/English behavior where relevant, and reports all unrun validation
honestly. Production completeness is not the target; judge-facing coherence is.
