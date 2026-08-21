<!-- SPECKIT START -->

For additional context about technologies, project structure, shell commands, and implementation
decisions, read the current plan at `specs/002-ghaf-core-mvp/plan.md`.
<!-- SPECKIT END -->

# Ghaf Repository Collaboration Contract

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

This repository builds **Ghaf — غاف** for the Khalifa University SMAC 2026 competition. Optimize
for one polished, reliable, bilingual demonstration that a three-person team can understand and
change quickly. Do not describe this application as production-ready.

## Read Before Editing

Read these files in order before making feature changes:

1. `.specify/memory/constitution.md`
2. The active feature's `spec.md`
3. The active feature's `plan.md`
4. The active feature's `tasks.md`

Spec Kit artifacts are the planning source of truth. Keep the managed block at the top of this file
intact; the Spec Kit planning workflow owns the plan path between `SPECKIT START` and `SPECKIT END`.
If implementation needs behavior outside the active specification, stop and update the
specification before writing code.

## Active Scope

- Feature 001 establishes only the Expo/TypeScript shell, four routes, Arabic/English and RTL,
  local design tokens, deterministic mocks, role switching, reset, a mock mission, and a staged
  Ghaf tree.
- The only Feature 001 routes are entry, role selector, Parent home, and Child home.
- Feature 002 defines the complete competition journey but remains planning-only until the team
  reviews and explicitly approves its first technical plan.
- The application is one Expo project. Do not create a second app, monorepo, admin site, production
  backend, production authentication, banking feature, social feed, unrestricted chatbot, 3D game,
  VR surface, or screen outside the approved journey.

## Prototype Decision Order

Resolve tradeoffs in this order:

1. Complete demo flow
2. Polished and memorable visual experience
3. Interaction clarity without explanation
4. Correct Arabic and RTL behavior
5. Reliable live demonstration and deterministic fallback
6. Ease of change for Codex and the three team members
7. Reasonably clean implementation
8. Everything else

## Architecture Boundaries

- Use React Native `StyleSheet`, shared design tokens, and small local components.
- Keep routes thin. Put reusable UI under `src/components/` and bounded feature behavior under
  `src/features/`.
- Screens consume `MissionService`, `MediaService`, `AIService`, `ImpactService`, and
  `PrototypeSessionService` contracts through the central service registry. They must not import a
  concrete remote provider.
- Feature 001 uses deterministic `Mock*` implementations and in-memory Zustand state. A real
  provider requires a reviewed Feature 002 decision.
- Arabic is the default locale. Use logical start/end layout, locale-aware text alignment, and RTL-
  aware directional icons; do not rely only on global native mirroring.
- The implemented Feature 001 reset baseline is Arabic, Parent, mock mode, one assigned
  pregenerated mission, 1,250 rescued grams, 5 rescued portions, 3 completed missions, a 2-day
  streak, and Ghaf stage 2 at 48%.
- The proposed Feature 002 reset replaces that assignment with an empty creation draft and keeps
  the pregenerated mission available—but unassigned—as the next deterministic fallback.
- Keep Android the primary physical-demo target. iOS is convenient compatibility and web is a
  secondary development surface. Native package and bundle identifiers remain provisional.

## Mock and Honesty Rules

Clearly label behavior as real, mocked, seeded, pregenerated, optional-later, or future. In
Feature 001, all mission, profile, impact, media, AI, and session content is synthetic local demo
data. Pregenerated mission text is not a live model result. Never imply that AI determines whether
food is safe to eat.

## Minimum Safeguards

- Never commit API keys or embed an OpenAI secret in the mobile bundle.
- Use only synthetic or team-created demo information; never use real child data.
- Start audio capture only after a visible microphone action. Never record continuously or in the
  background.
- Keep Parent approval in the product journey.
- Do not claim production readiness, legal compliance, or food-safety determination.
- Do not expand these safeguards into an enterprise security or compliance workstream.

## Collaboration and File Ownership

Member 1 is the bootstrap-period integration owner until a handoff is recorded in
`docs/TEAM_OWNERSHIP.md`. The integration owner resolves shared configuration and final merges.

- Member 1: Expo, routes, components, design tokens, i18n/RTL integration, Ghaf visual, and physical
  device build.
- Member 2: models, service contracts and mocks, shared state, transformations, and impact logic.
- Member 3: specifications, bilingual mission content, acceptance criteria, manual QA, demo data,
  documentation, and presentation flow.

Run no more than four agents concurrently. Parallel read-only research and review are welcome;
parallel writes to the same file or shared configuration are prohibited. Before editing, state the
exact file boundary. One writing agent owns that boundary until it hands the work back. Do not
install competing libraries or implement two versions of the same feature. The orchestrator owns
final integration.

Project-scoped agent definitions live in `.codex/agents/`. Use the smallest applicable role and
honor the `Write scope` inside its instructions. Do not widen an agent's scope implicitly.

## Everyday Commands

```bash
npm ci
npm start
npm run android
npm run typecheck
npm run lint
npm run format:check
npm test
```

Use `npm install` only when intentionally changing dependencies and the lockfile. Before handoff,
run checks proportional to the changed area and report `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN`
without guessing. Physical-device, Arabic/RTL, offline, and rehearsal checks remain `NOT RUN` until
someone records the device and observed result.

## Git and Delivery Rules

- Inspect `git status --short` before and after work; preserve unrelated and uncommitted changes.
- Keep tasks small and reference their Spec Kit task ID when practical.
- Do not use destructive Git commands, commit secrets, or push without explicit authorization.
- Do not mark a task complete from code inspection alone when its acceptance criterion requires a
  runtime or physical-device check.
- End Feature 001 with proportional automated checks plus the manual runbook. Stop before Feature
  002 implementation until its plan is reviewed.
