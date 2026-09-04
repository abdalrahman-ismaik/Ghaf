# Revision 3 Local-Commit Decomposition and Port Plan

> **STATUS: PROPOSED — NOT APPROVED — NOT IMPLEMENTATION AUTHORITY**
>
> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

This is a reconstruction plan, not a cherry-pick plan. It does not apply any local commit or
authorize any slice. Remote head `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2` is the behavioral
baseline. Existing approved specifications are the product baseline. Every local-only commit and
R002 artifact is candidate evidence until explicitly approved.

## Ancestry and patch-equivalence result

Read-only `git rev-list --reverse --no-merges
origin/feature/003-family-growth-garden..feature/003-family-growth-garden` identifies exactly six
commits. `git cherry origin/feature/003-family-growth-garden
feature/003-family-growth-garden` prints `+` for all six, so Git finds no patch-equivalent remote
commit. That does **not** mean their semantics are absent: remote access, League, Family Reward,
voice, and typography work overlaps several local proposals and must be reconciled by behavior.

| Order | Original hash and subject                                                                                      | Date (UTC+04)       | Purpose                                                                | Dependency                           |
| ----: | -------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
|     1 | `f63e39fc702bb1797791f7543c6316e3b06f3ba9` — `docs: record Revision 2 and Ghaf R001 partial release`           | 2026-09-03 17:08:43 | Record R001 intake and rewrite governing docs around a partial release | Remote documentation baseline        |
|     2 | `1dda546054d0a98661c4ead641f9cf6495041714` — `feat(access): add deterministic Parent access domain`            | 2026-09-03 17:08:57 | Add Parent identifier/code/onboarding state                            | Commit 1's R001 interpretation       |
|     3 | `d217520f4e5b8e30b3690091527515dd8fe158cc` — `feat(design): add R001 native design system and access controls` | 2026-09-03 17:09:26 | Add local fonts, tokens, and access UI primitives                      | Commit 1; types/store from commit 2  |
|     4 | `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3` — `feat(onboarding): implement Welcome and Parent setup journey`    | 2026-09-03 17:09:38 | Add seven R001 routes/states and bilingual copy                        | Commits 2–3                          |
|     5 | `96cad3b917f43adad32c491153be54d3ab24f899` — `docs(growth): define Growth Journey product guardrails`          | 2026-09-03 17:50:13 | Add Growth prompt/research/source material and proposed catalogs/ADR   | Commit 1's rewritten authority       |
|     6 | `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c` — `docs(spec): plan Stitch-gated Growth Journey implementation`     | 2026-09-03 17:50:27 | Rewrite canonical Spec Kit documents for candidate R3                  | Commit 5 and commits 1–4 assumptions |

## Porting rule

For every future slice:

1. begin from the then-current remote-based integration branch;
2. obtain the required Product/Design approval first;
3. reconstruct the smallest behavior against existing remote models/services;
4. write focused RED tests before behavior where applicable;
5. preserve original hash in the future commit body as `Candidate-source:`;
6. run the focused test plus typecheck/lint/format before commit; and
7. stop on any semantic conflict rather than choosing a whole-file side.

## Commit 1 — R001 documentation and intake

`f63e39fc702bb1797791f7543c6316e3b06f3ba9`

### Independently useful candidate slices

| Slice                             | Exact candidate files/hunks                                                                                                                                                                                                                                                                       | Future treatment                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw R001 release evidence         | `docs/design/stitch/releases/ghaf-r001/screens/{01-welcome,02-parent-sign-in,03-verification,04-family-basics,05-add-first-child,06-review-create,07-family-created-success}/{screen.png,code.html}` (seven binary PNGs; HTML lines respectively 1-182, 1-177, 1-202, 1-209, 1-260, 1-232, 1-232) | May be archived unchanged only after provenance and explicit approval evidence are verified. HTML remains non-runtime.                                                                                     |
| Release inventory                 | `docs/design/stitch/releases/ghaf-r001/STITCH_DESIGN.md:1-54`, `SCREEN_INDEX.md:1-52`, `design-system/DESIGN.md:1-176`                                                                                                                                                                            | Reconstruct status language against the R3 authority matrix. The files claim approval/partial release at `STITCH_DESIGN.md:3-22`; temporary authority does not accept that claim by filename/commit alone. |
| Intake measurements               | Candidate `design-intake/stitch-inventory.md:28-74` contains dimensions/hashes and missing evidence; `release-gate.md:13-30` itemizes gaps                                                                                                                                                        | Copy only verified measurements/hashes into a new noncanonical evidence record. Re-evaluate every `PASSED`/`RELEASED` label.                                                                               |
| Safety/accessibility/route audits | New `design-intake/{accessibility-audit,product-safety-audit,route-component-map,screen-state-map,visual-audit}.md`                                                                                                                                                                               | Reconstruct after comparing remote access/capability requirements; do not import old decisions as authority.                                                                                               |

### Conflicting or unsafe slices

- All broad replacements of `.specify/memory/constitution.md`, `AGENTS.md`, `PRODUCT.md`,
  `DESIGN.md`, `DESIGN_DIRECTION.md`, `RESEARCH_BASIS.md`, `PROTOTYPE_LIMITATIONS.md`,
  `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, and the active Spec Kit files are semantically mixed
  (commit numstat shows 7,282 insertions/4,842 deletions across 55 files). They must not be ported.
- `design-intake/decision-log.md:5-27` calls D001–D018 resolved and says no P0 conflict remains.
  Under the temporary authority rule, those are candidate dispositions and remain OPEN.
- `GHAF_GOOGLE_STITCH_PROMPT_PACK.md:1-904` is a generation prompt, not acceptance or runtime
  authority. Archive only if its origin is wanted; do not merge its directives into canonical docs.

### Rewrite/drop/dependencies

- **Rewrite:** all approval/status language, route authority, font authority, and cross-links against
  the current source-authority matrix.
- **Drop:** every canonical-doc replacement hunk; any claim that missing English/state/spec evidence
  is already resolved; any screen behavior inferred only from HTML.
- **Dependencies:** Product must confirm R001 approval evidence; Design must validate PNGs and
  provenance; Engineering must validate hashes and route compatibility.

### Proposed future commit boundaries and checks

1. `docs(stitch): archive verified r001 candidate source set` — raw release tree only. Checks:
   hashes/dimensions, no external runtime import, `git diff --check`.
2. `docs(r001): record reconciled intake evidence` — newly written noncanonical inventory/audits.
   Checks: link/path validator, Markdown formatting, approval-language review.
3. Canonical document changes, if approved, belong to a later Spec Kit commit and must not reuse the
   broad historical diff.

## Commit 2 — local Parent access domain

`1dda546054d0a98661c4ead641f9cf6495041714`

### Independently useful candidate slices

| Slice                            | Exact candidate hunk                                                         | Future treatment                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier normalization/masking | `src/features/access/policy.ts:14-109` (`normalizeParentIdentifier`)         | Reconstruct as an R001 presentation/onboarding adapter over remote `DeterministicSyntheticAccessService`, not a second access authority.                  |
| Onboarding draft validation      | `src/models/familyGrowth.ts:85-116`; `src/features/access/policy.ts:111-205` | Move to a bounded onboarding model/module; preserve no-Child-contact and safe text validation. Do not place access authority back into `familyGrowth.ts`. |
| Synthetic verification fixture   | `src/features/access/fixtures.ts:3-17`, code `424242`                        | Candidate only. Store once in fixtures and label it non-authentication if Product approves this R001 interaction.                                         |
| Focused input/draft scenarios    | `tests/revision2-access.test.ts:37-165,202-258`                              | Rewrite to exercise the remote access service plus onboarding adapter, including interruption/reset; do not keep its false role-as-auth assumptions.      |

### Remote semantic overlap

Remote already has separate Parent/Child capability-scoped sessions, pairing, reauthentication,
device revocation, and per-Child grants in `src/models/access.ts:3-248` and
`src/features/access/index.ts:185-390`. `tests/access-control.test.ts:30-143,153-240,403-519`
proves least privilege, expiry, actor/purpose binding, and one-use proofs. The local
`ParentAccessState` at `familyGrowth.ts:68-83` is weaker and cannot supersede it.

### Rewrite/drop/dependencies

- **Rewrite:** `src/services/mock/index.ts:1254-1346` and any service interface against the existing
  access facade; add UI-stage state without creating a second authenticated session.
- **Rewrite:** store integration at local `src/state/usePrototypeStore.ts:335-413,427-440` so route
  access derives from remote capability authorization, not `parentAccess.state` or mutable `role`.
- **Drop:** local `ParentAccessSession` as security authority; duplicate service registry entries;
  `selectIsParentAuthenticated` at local store lines `1285-1287`; screen-local Palm Family values as
  a replacement for Al Noor fixtures.
- **Dependencies:** approved R001 flow/spec, chosen onboarding-draft persistence/reset ownership,
  and remote access controller integration.

### Proposed future commits and tests

1. `test(onboarding): specify deterministic parent entry adapter` — normalization, masking, invalid
   inputs, offline truth, wrong code, interruption, capability isolation.
2. `feat(onboarding): add parent entry and draft adapter` — new module only; preserve remote access.
3. `test(reset): cover onboarding draft and access authority together` — exact Arabic reset plus
   Parent/Child route isolation.

Run `npm test -- tests/access-control.test.ts <new-focused-test>`, `npm run typecheck`, lint, and
format after each behavior slice.

## Commit 3 — R001 design system and controls

`d217520f4e5b8e30b3690091527515dd8fe158cc`

### Independently useful candidate slices

| Slice                        | Exact candidate hunk/symbol                                               | Future treatment                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tunnel helper                | `package.json` script hunk adding `"start:tunnel": "expo start --tunnel"` | Mechanically additive, but port only if maintainers want it; no dependency change.                                                                           |
| Keyboard/safe-area shell     | `src/components/access/AccessShell.tsx:39-80` (`AccessScreen`)            | Reconstruct using current tokens/store; retain natural scroll and keyboard behavior after an approved R001 screen spec.                                      |
| RTL directional icons        | `src/components/access/GhafIcon.tsx:45-71`                                | Reuse geometry only after icon provenance/design review; derive direction from explicit locale rather than global state where needed.                        |
| OTP normalization/control    | `src/components/access/AccessControls.tsx:47-51,127-220`                  | Reconstruct with Arabic/Persian digit input, paste/backspace, focus, and one accessible native input.                                                        |
| Reduced-motion native sheet  | `src/components/access/SuccessSheet.tsx:31-90,93-135`                     | Reconstruct as route-owned native sheet with focus containment/restoration and idempotent navigation; do not reuse it as the R3 reward bundle automatically. |
| Other shared access controls | `AccessControls.tsx:82-126,251-390`; `BotanicalAvatar.tsx:34-170`         | Candidate component patterns; measure against approved frames before extraction.                                                                             |

### Conflicting or unsafe slices

- `app.config.ts` replaces the existing `expo-audio` plugin with `expo-font` in one hunk. Remote
  explicitly configures `expo-audio` with recording/background disabled at `app.config.ts:27-47`.
  Never apply this hunk. Font configuration, if approved, must be additive.
- `package.json` removes `expo-audio`, `react-hook-form`, and `@hookform/resolvers` while upgrading
  Expo patch versions and adding font packages in one mixed hunk; `package-lock.json` has 328 changed
  lines. Recreate only approved dependency changes and preserve voice/form dependencies.
- `src/design/tokens.ts:1-263` replaces the palette, radii, typography, motion, and aliases globally.
  Remote's current locale-aware system typography is approved by `FR-124` and tested at
  `tests/bilingual-typography.test.ts:37-141`. R001 Alexandria/Readex roles need a measured,
  locale-aware reconciliation rather than wholesale replacement.

### Rewrite/drop/dependencies

- **Rewrite:** all component imports/styles against current primitives; font roles must preserve
  Arabic zero tracking and leading; `expo-audio` must remain.
- **Drop:** compatibility aliases without consumers, global token overwrite, mixed dependency
  upgrade/removal, and any use of a fixed preview canvas.
- **Dependencies:** explicit R001 typography release, font license/provenance, native font-loading
  fallback, applicable PNG measurements, and exclusive config/dependency window.

### Proposed future commits and tests

1. `test(design): specify r001 locale-aware roles and controls`.
2. `feat(design): add approved r001 tokens and native access primitives` without config changes.
3. `build(fonts): add approved local fonts while preserving expo-audio` as an exclusive dependency
   commit.

Required checks: `tests/bilingual-typography.test.ts`, localization parity, focused OTP/sheet tests,
Expo dependency check, native font failure/fallback, RTL/LTR, 200% text, keyboard, reduced motion,
and named Android smoke test.

## Commit 4 — Welcome and Parent onboarding routes

`5f3f1a21135d6e0762cc482f11f08bcfde37d2a3`

### Independently useful candidate slices

| Slice                   | Exact candidate files/hunks                                                                                                                                              | Future treatment                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Bilingual access copy   | `src/i18n/resources.ts:40-139,490-589`                                                                                                                                   | Reconcile terminology and named copy review, then add as one paired resource subtree.                                                    |
| Six Parent setup routes | `app/access/parent/{sign-in.tsx:1-183,verification.tsx:1-156,family-basics.tsx:1-137,add-first-child.tsx:1-249,review-create.tsx:1-213,family-created-success.tsx:1-36}` | Reconstruct after route/state approval; bind to remote capability authority and approved draft adapter.                                  |
| Welcome composition     | `app/index.tsx:1-131`                                                                                                                                                    | Reconstruct approved composition while preserving both safe Parent and Child access paths. Remove fixed `minHeight: 760` at lines 89-91. |
| Route-local tests       | `tests/revision2-localization-reset.test.ts:20-93`                                                                                                                       | Keep native/no-DOM, paired-copy, and sheet assertions; replace assertions that celebrate blocked Child routing.                          |

### Semantic conflicts

- Local `app/_layout.tsx:46-70` redirects `/role` and every `/child` path to Parent/root. This
  conflicts with remote capability-scoped Child access (`FR-100`–`FR-105`,
  `spec.md:902-918`) and must be dropped.
- `app/parent/_layout.tsx:5-12` guards only via local `selectIsParentAuthenticated`, not a remote
  capability projection; rewrite.
- `tests/operator-demo-flow.test.ts:18-35` expands the exact route list while remote `SC-001`
  currently requires ten authored routes (`spec.md:1055-1056`). Route count/ownership is a Product
  decision, not a test edit.
- The new screen routes depend on commit 2's weaker access state and commit 3's global font/token
  replacement. They cannot be ported independently as written.

### Rewrite/drop/dependencies

- **Rewrite:** every route around remote access authority, responsive scrolling, Back/deep-link
  behavior, interruption, loading/error/offline states, and exact approved PNG composition.
- **Drop:** Child-access block/redirect, mutable-role authorization, exact-route assertion changes
  until route reconciliation, fixed height, and any claim that synthetic biometric UI is real.
- **Dependencies:** approved R001 authority, commits 2–3 reconstructed foundations, route-count
  decision, English parity, and source/provenance validation.

### Proposed future commits and tests

1. `feat(welcome): add approved bilingual entry without changing access authority`.
2. `feat(parent-onboarding): add sign-in and verification route states`.
3. `feat(parent-onboarding): add family draft, review, and success sheet`.
4. `test(onboarding): prove guards, reset, locale parity, Back, interruption, and route inventory`.

Each route slice requires focused tests plus full access-control, operator-flow, reset, localization,
typecheck, lint, format, and Android smoke validation.

## Commit 5 — Growth Journey product/research pack

`96cad3b917f43adad32c491153be54d3ab24f899`

### Independently useful candidate slices

| Slice                 | Exact candidate files/hunks                                                                                                                                                                            | Future treatment                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt/source archive | `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/{README.md:1-53,report-source.md:1-434,GHAF_GROWTH_JOURNEY_RESEARCH_AND_SPEC.md:1-1092,GOOGLE_STITCH_PROMPT_PACK.md:1-923,CODEX_IMPLEMENTATION_PROMPT.md:1-870}` | Archive as candidate input with explicit non-authority status; revalidate mutable links and rights before using claims. README already says no output exists at lines 6-12. |
| Projection ADR        | `docs/architecture/adr/0002-impact-path-projection.md:1-119`                                                                                                                                           | Retain only as a proposed ADR. Its projection/idempotency ideas at lines 18-74 are useful; approval gate at 106-111 must stay closed.                                       |
| Badge catalog         | `docs/content/BADGE_CATALOG.md:1-77`                                                                                                                                                                   | Candidate exact-16 registry; requires Product/content/cultural/accessibility/rights approval. It explicitly records blocked review at lines 3-9,58-71.                      |
| Learning package      | `docs/content/LEARNING_STORIES.md:1-67`                                                                                                                                                                | Candidate finite Mangrove/equal-credit package; required reviews remain `NOT RUN` at lines 46-59.                                                                           |

### Conflicting or unsafe slices

- All hunks to root `PRODUCT.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `RESEARCH_BASIS.md`,
  `PROTOTYPE_LIMITATIONS.md`, and `docs/architecture/ARCHITECTURE.md` silently elevate candidate
  decisions. Rewrite only after approval.
- The research/spec names `task.recycling_sort.v1` at line 274 and the implementation prompt at line 572. Preserve `task_recycling_p0_v1` unless an explicit migration is approved.
- The pack's 108 → 120 → 180 fixture (`README.md:49-53`; research/spec lines 260-274) conflicts with
  remote 48 → 60.
- The source ledger says claims/policies are mutable and need recheck
  (`report-source.md:3-9,417-434`) and rights need clearance (`:402-413`). It is evidence, not approval.

### Rewrite/drop/dependencies

- **Rewrite:** status labels, task ID, numerical examples, League-versus-Shared-Growth language, and
  any unapproved screen/route assertion.
- **Drop:** canonical root-doc hunks; “implement now” directives; unreviewed external claim as live
  copy; any implied rights clearance.
- **Dependencies:** Product progression/League/badge decisions, content and rights review, source
  revalidation, and complete approved design intake.

### Proposed future commits and checks

1. `docs(growth): archive candidate prompt and source pack`.
2. `docs(adr): propose impact-path projection against remote baseline`.
3. `docs(content): add reviewed candidate badge and learning registries` only after named reviews.

Checks: path/link validation, URL/source revalidation record, exact 16-ID uniqueness, Arabic/English
parity, task-ID scan, Markdown format, and `git diff --check`.

## Commit 6 — Stitch-gated R3 Spec Kit amendment

`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`

### Independently useful candidate slices

| Slice                        | Exact candidate hunk                                                                             | Future treatment                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Task mapping guardrail       | `data-model.md:175-227`, especially canonical `task_recycling_p0_v1` at 223-227                  | Reconstruct additive mapping metadata after criteria approval; preserve all remote safety/eligibility fields.                      |
| Impact/achievement records   | `data-model.md:404-575`                                                                          | Rewrite into new model files against remote types; do not paste interfaces into canonical docs or screens.                         |
| Unlock/migration concepts    | `data-model.md:578-666`                                                                          | Reconcile station ownership and migration with the selected progression option. Preserve zero Seed/mastery/reveal migration rules. |
| Superset receipt/bundle      | `data-model.md:668-721`                                                                          | Use only as input to `REVEAL_BUNDLE_REQUIREMENTS.md`; final contents/order remain OPEN.                                            |
| Preflight/checklist evidence | `design-intake/growth-journey-preflight.md:1-121`; `checklists/growth-journey-readiness.md:1-84` | Reconstruct noncanonically. Demote “Resolved” at preflight line 17 and `PASSED`/“normative” at 108 to proposed/OPEN.               |

### Semantic conflicts

- Candidate preflight `:17-32` calls League, task-ID, 108/120, reveal, reset, and locale decisions
  resolved. Current authorization explicitly reopens them.
- Candidate Family Reward P0 state is 108/120 (`data-model.md:365-367`), conflicting with remote
  domain-only plans and schema-3 reset.
- Candidate League member IDs at `data-model.md:232` differ from remote fixed Salem/Alya/Noura
  fixtures (`src/models/familyLeague.ts:12-27`). Never resolve via rename mechanics.
- Candidate `GrowthMigrationReceipt.schemaTo = 5` at `data-model.md:641-652` has no approved schema
  decision.
- Candidate tasks restart T111+ at `tasks.md:29-80`, colliding with remote T111–T139
  (`remote tasks.md:451-595`). Future tasks must be regenerated/renumbered.
- Broad changes to canonical `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, contracts, and root
  docs are prohibited until decisions are approved.

### Rewrite/drop/dependencies

- **Rewrite:** all growth models/contracts onto remote access, reward, League, recognition, reset,
  voice, and profile boundaries; all task IDs/numbers; progression fixtures; route plan.
- **Drop:** current canonical-document hunks; any “resolved/normative/PASSED” claim without current
  approval; assumptions that missing screens or persistence already exist.
- **Dependencies:** complete Product register; selected migration option; approved RevealBundle;
  complete mobile/English/state/provenance intake; canonical Spec Kit update approval.

### Proposed future commits and tests

1. `docs(r3): approve canonical specification amendment` — only after Product/Design decisions.
2. `test(growth): add RED projection, migration, profile, and bundle contracts`.
3. `feat(growth): add profile-scoped projection and evaluator`.
4. `feat(reveal): integrate approved consequence superset and recovery`.
5. Route/content slices only after their own approved designs.

Tests: projection/source-key equality, migration idempotency/rollback, 16-badge criteria, zero-Seed
learning, profile/role isolation, full remote reset and duplicate oracles, League/reward privacy,
voice preservation, route/reset, Arabic/English parity, and physical Android accessibility.

## Recommended disposition summary

| Commit                                     | Verbatim port? | Safest future treatment                                                                 |
| ------------------------------------------ | -------------- | --------------------------------------------------------------------------------------- |
| `f63e39fc702bb1797791f7543c6316e3b06f3ba9` | No             | Archive verified raw R001 evidence; rewrite status/audits; drop canonical rewrites.     |
| `1dda546054d0a98661c4ead641f9cf6495041714` | No             | Reconstruct identifier/draft adapter over remote access; drop duplicate authority.      |
| `d217520f4e5b8e30b3690091527515dd8fe158cc` | No             | Reconstruct measured controls/tokens; preserve `expo-audio`; isolate dependency commit. |
| `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3` | No             | Rebuild approved routes/copy on remote capabilities; retain Child access.               |
| `96cad3b917f43adad32c491153be54d3ab24f899` | No             | Archive proposal/source material; review and correct task/progression conflicts.        |
| `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c` | No             | Use as proposal evidence; regenerate approved canonical specs/models/tasks later.       |

All six commits remain unapplied. No slice becomes safe merely because this plan names it.

## Exact path disposition manifest

This appendix is a read-only decomposition of the six commits that exist only on the local
Feature 003 history. It does not approve any product decision, apply a patch, or authorize a
screen. No listed path should be cherry-picked. A future integration must reconstruct each
approved slice from the verified remote baseline and preserve the original hash in its commit
message.

### Disposition legend

| Disposition      | Meaning                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SAFE-CANDIDATE` | Independently useful evidence or a bounded additive idea, still subject to the applicable product/design gate and fresh validation. This does **not** mean direct cherry-pick. |
| `REWRITE`        | Reconstruct the intended behavior or documentation against the remote baseline because that path overlaps newer authority, contracts, runtime state, or tests.                 |
| `DROP-WHOLESALE` | Do not import the historical hunk. If a still-valid intent exists, express it later as a new, narrowly scoped change.                                                          |

### 1. `f63e39fc702bb1797791f7543c6316e3b06f3ba9`

Subject: `docs: record Revision 2 and Ghaf R001 partial release`

Verified changed-path count: **55** (`17 SAFE-CANDIDATE`, `37 REWRITE`, `1 DROP-WHOLESALE`).

The raw R001 exports are useful intake evidence. The seven `screen.png` files are binary
composition evidence only; their paired HTML is non-runtime measurement/structure evidence.
Neither kind should be imported into application code. Canonical documents and intake decisions
must be rewritten against the remote product baseline instead of accepting the commit's release
language wholesale.

| Exact repository-relative path                                                       | Future disposition | Reason                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `.specify/memory/constitution.md`                                                    | `REWRITE`          | Governance authority changed on both histories; amend only through an explicitly approved constitution update.                         |
| `AGENTS.md`                                                                          | `REWRITE`          | Collaboration/current-feature authority must be regenerated from the reconciled canonical state.                                       |
| `CODEX_IMPLEMENTATION_PROMPT.md`                                                     | `REWRITE`          | Historical implementation instructions cannot authorize current R002/R3 work.                                                          |
| `DEMO_RUNBOOK.md`                                                                    | `REWRITE`          | Remote demo behavior and evidence ledger advanced independently.                                                                       |
| `DESIGN.md`                                                                          | `REWRITE`          | Reconcile R001 measurements with remote design authority and later approved frames.                                                    |
| `DESIGN_DIRECTION.md`                                                                | `REWRITE`          | Reconcile direction without silently promoting a generated export.                                                                     |
| `GHAF_GOOGLE_STITCH_PROMPT_PACK.md`                                                  | `DROP-WHOLESALE`   | The historical generation prompt is superseded as implementation authority; retain provenance through the actual intake/audit instead. |
| `PRODUCT.md`                                                                         | `REWRITE`          | Product authority conflicts with the remote requirements and open R3 decisions.                                                        |
| `PROTOTYPE_LIMITATIONS.md`                                                           | `REWRITE`          | Capability truth must reflect the remote baseline and current hold.                                                                    |
| `README.md`                                                                          | `REWRITE`          | Repository status and commands must be reconciled rather than copied from the divergent branch.                                        |
| `RESEARCH_BASIS.md`                                                                  | `REWRITE`          | Claims and decision consequences require current source/approval review.                                                               |
| `TEAM_OWNERSHIP.md`                                                                  | `REWRITE`          | Reservations and phase status are time-bound and cannot be ported historically.                                                        |
| `docs/README.md`                                                                     | `REWRITE`          | Documentation index must point to the eventual reconciled source hierarchy.                                                            |
| `docs/design/stitch/releases/ghaf-r001/SCREEN_INDEX.md`                              | `SAFE-CANDIDATE`   | Bounded R001 inventory/provenance evidence; recheck approval metadata before canonical use.                                            |
| `docs/design/stitch/releases/ghaf-r001/STITCH_DESIGN.md`                             | `SAFE-CANDIDATE`   | Raw design-source evidence, not runtime or product authority.                                                                          |
| `docs/design/stitch/releases/ghaf-r001/design-system/DESIGN.md`                      | `SAFE-CANDIDATE`   | Raw R001 token/type evidence; any runtime token change still needs measured reconciliation.                                            |
| `docs/design/stitch/releases/ghaf-r001/screens/01-welcome/code.html`                 | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/01-welcome/screen.png`                | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/02-parent-sign-in/code.html`          | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/02-parent-sign-in/screen.png`         | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/03-verification/code.html`            | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/03-verification/screen.png`           | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/04-family-basics/code.html`           | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/04-family-basics/screen.png`          | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/05-add-first-child/code.html`         | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/05-add-first-child/screen.png`        | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/06-review-create/code.html`           | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/06-review-create/screen.png`          | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `docs/design/stitch/releases/ghaf-r001/screens/07-family-created-success/code.html`  | `SAFE-CANDIDATE`   | Non-runtime measurement and structure hint only.                                                                                       |
| `docs/design/stitch/releases/ghaf-r001/screens/07-family-created-success/screen.png` | `SAFE-CANDIDATE`   | Binary R001 composition evidence only.                                                                                                 |
| `specs/003-family-growth-garden/checklists/design-audit.md`                          | `REWRITE`          | Existing checklist status cannot be overwritten by divergent release assertions.                                                       |
| `specs/003-family-growth-garden/checklists/implementation-baseline.md`               | `REWRITE`          | Re-establish from the verified remote implementation baseline.                                                                         |
| `specs/003-family-growth-garden/checklists/p0-implementation-readiness.md`           | `REWRITE`          | Readiness depends on still-open product/design gates.                                                                                  |
| `specs/003-family-growth-garden/checklists/red-green-evidence.md`                    | `REWRITE`          | Evidence results must be rerun and cannot transfer across histories.                                                                   |
| `specs/003-family-growth-garden/checklists/requirements.md`                          | `REWRITE`          | Requirement IDs/statuses diverged and need canonical reconciliation.                                                                   |
| `specs/003-family-growth-garden/checklists/source-scan.md`                           | `REWRITE`          | Source findings require a current scan and authority labels.                                                                           |
| `specs/003-family-growth-garden/checklists/story-evidence.md`                        | `REWRITE`          | Story evidence must remain tied to the current canonical journeys.                                                                     |
| `specs/003-family-growth-garden/checklists/web-proxy.md`                             | `REWRITE`          | Historical web evidence cannot validate later native behavior.                                                                         |
| `specs/003-family-growth-garden/contracts/acceptance-contract.md`                    | `REWRITE`          | Remote acceptance requirements and open R3 consequences must be preserved.                                                             |
| `specs/003-family-growth-garden/contracts/assistant-contract.md`                     | `REWRITE`          | Preserve newer bounded-assistant and voice constraints.                                                                                |
| `specs/003-family-growth-garden/contracts/domain-contract.md`                        | `REWRITE`          | Domain authority overlaps access, League, rewards, privacy, and reset.                                                                 |
| `specs/003-family-growth-garden/data-model.md`                                       | `REWRITE`          | Models and fixture identifiers conflict with the remote closed unions and newer services.                                              |
| `specs/003-family-growth-garden/design-intake/accessibility-audit.md`                | `REWRITE`          | Useful findings may be retained, but pass/release claims require fresh authority and evidence labels.                                  |
| `specs/003-family-growth-garden/design-intake/decision-log.md`                       | `REWRITE`          | Decisions must be separated into verified approval, recommendation, and open question.                                                 |
| `specs/003-family-growth-garden/design-intake/product-safety-audit.md`               | `REWRITE`          | Safety findings require reconciliation with current access/privacy behavior and named reviews.                                         |
| `specs/003-family-growth-garden/design-intake/release-gate.md`                       | `REWRITE`          | Gate status cannot be ported as a mechanical Git resolution.                                                                           |
| `specs/003-family-growth-garden/design-intake/route-component-map.md`                | `REWRITE`          | Routes/components must target the remote architecture and capability guards.                                                           |
| `specs/003-family-growth-garden/design-intake/screen-state-map.md`                   | `REWRITE`          | State ownership must reflect remote services/reset and missing frame evidence.                                                         |
| `specs/003-family-growth-garden/design-intake/stitch-inventory.md`                   | `REWRITE`          | Preserve factual hashes/dimensions, but rewrite status and source-authority assertions.                                                |
| `specs/003-family-growth-garden/design-intake/visual-audit.md`                       | `REWRITE`          | Visual findings are useful, but pass language and conflict resolutions need reapproval.                                                |
| `specs/003-family-growth-garden/plan.md`                                             | `REWRITE`          | Re-plan from the remote architecture after explicit R3 decisions.                                                                      |
| `specs/003-family-growth-garden/quickstart.md`                                       | `REWRITE`          | Commands/evidence status must match the reconciled branch.                                                                             |
| `specs/003-family-growth-garden/research.md`                                         | `REWRITE`          | Retain sourced facts only after authority and currency checks.                                                                         |
| `specs/003-family-growth-garden/spec.md`                                             | `REWRITE`          | Product specification must be updated only after owner approval.                                                                       |
| `specs/003-family-growth-garden/tasks.md`                                            | `REWRITE`          | Task identifiers/numbering conflict with remote work and must be regenerated.                                                          |

### 2. `1dda546054d0a98661c4ead641f9cf6495041714`

Subject: `feat(access): add deterministic Parent access domain`

Verified changed-path count: **9** (`1 SAFE-CANDIDATE`, `8 REWRITE`, `0 DROP-WHOLESALE`).

The remote head already has a broader capability-scoped Parent/Child access service, device
pairing, reauthentication, permissions, profile isolation, and tests. The local onboarding
normalization rules are potentially additive; local fixture, state, and service wiring cannot
replace that remote authority.

| Exact repository-relative path     | Future disposition | Reason                                                                                                         |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `src/features/access/fixtures.ts`  | `REWRITE`          | Align onboarding fixtures with remote closed fixture IDs, reset, and capability truth.                         |
| `src/features/access/index.ts`     | `REWRITE`          | Preserve the remote `DeterministicSyntheticAccessService` exports; add onboarding policy exports deliberately. |
| `src/features/access/policy.ts`    | `SAFE-CANDIDATE`   | Pure identifier normalization and draft-validation logic is separable, subject to current types/copy review.   |
| `src/models/familyGrowth.ts`       | `REWRITE`          | Do not fold access/onboarding types into a remote model without current ownership and migration review.        |
| `src/services/index.ts`            | `REWRITE`          | Service registry advanced remotely and must remain the integration authority.                                  |
| `src/services/interfaces/index.ts` | `REWRITE`          | Re-express only required onboarding contracts beside existing capability interfaces.                           |
| `src/services/mock/index.ts`       | `REWRITE`          | Preserve remote deterministic access/reset behavior and avoid duplicate providers.                             |
| `src/state/usePrototypeStore.ts`   | `REWRITE`          | Merge onboarding state through current access/profile/reset boundaries, never the old monolithic patch.        |
| `tests/revision2-access.test.ts`   | `REWRITE`          | Retain useful scenarios as new focused tests against current access contracts and fixtures.                    |

### 3. `d217520f4e5b8e30b3690091527515dd8fe158cc`

Subject: `feat(design): add R001 native design system and access controls`

Verified changed-path count: **13** (`2 SAFE-CANDIDATE`, `8 REWRITE`, `3 DROP-WHOLESALE`).

The historical dependency/configuration hunk removes the remote baseline's `expo-audio`,
`react-hook-form`, and resolver entries while introducing font packages. That is not a safe merge.
Font intent must be reconstructed without weakening voice/configuration behavior. The access barrel,
`LanguageSwitcher`, and primitives are listed explicitly because they are integration points, not
standalone visual assets.

| Exact repository-relative path              | Future disposition | Reason                                                                                               |
| ------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `app.config.ts`                             | `DROP-WHOLESALE`   | Historical hunk replaces `expo-audio` configuration; add fonts later in a new additive config edit.  |
| `assets/fonts/README.md`                    | `REWRITE`          | Document only the finally approved asset/package provenance and exact bundled files/licenses.        |
| `package-lock.json`                         | `DROP-WHOLESALE`   | Never port a divergent lockfile that removes remote dependencies.                                    |
| `package.json`                              | `DROP-WHOLESALE`   | Historical hunk removes voice/form dependencies; reintroduce any approved fonts additively.          |
| `src/components/LanguageSwitcher.tsx`       | `REWRITE`          | Reconcile locale switching with current direction state, released typography, and remote navigation. |
| `src/components/access/AccessControls.tsx`  | `REWRITE`          | Visual controls read the obsolete store/domain shape; preserve only reviewed presentation patterns.  |
| `src/components/access/AccessShell.tsx`     | `REWRITE`          | Shell must consume current access/session guards and approved responsive frames.                     |
| `src/components/access/BotanicalAvatar.tsx` | `REWRITE`          | Avatar IDs/state coupling differ from the remote fixture authority.                                  |
| `src/components/access/GhafIcon.tsx`        | `SAFE-CANDIDATE`   | Bounded code-native SVG icon work is separable after directionality and accessibility review.        |
| `src/components/access/SuccessSheet.tsx`    | `SAFE-CANDIDATE`   | Bounded native modal mechanics are reusable for R001 success after motion/focus review.              |
| `src/components/access/index.ts`            | `REWRITE`          | Rebuild the barrel only after the final component set and dependencies are chosen.                   |
| `src/components/primitives.tsx`             | `REWRITE`          | Shared primitives overlap every remote screen and require regression-safe token/RTL integration.     |
| `src/design/tokens.ts`                      | `REWRITE`          | Merge measured R001 roles with remote semantic tokens; do not replace the shared theme wholesale.    |

### 4. `5f3f1a21135d6e0762cc482f11f08bcfde37d2a3`

Subject: `feat(onboarding): implement Welcome and Parent setup journey`

Verified changed-path count: **12** (`1 SAFE-CANDIDATE`, `11 REWRITE`, `0 DROP-WHOLESALE`).

The seven R001 route compositions remain useful implementation reference, but their state and
navigation wiring depends on commits 2 and 3 and predates the remote capability guards. Rebuild
routes and tests on the remote baseline; the bilingual resource additions are the only bounded
path-level candidate for selective reuse after copy review.

| Exact repository-relative path                 | Future disposition | Reason                                                                                          |
| ---------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`                              | `REWRITE`          | Integrate font/loading and navigation behavior without replacing current root guards/providers. |
| `app/access/parent/add-first-child.tsx`        | `REWRITE`          | Reconstruct the approved composition over current profile/onboarding contracts.                 |
| `app/access/parent/family-basics.tsx`          | `REWRITE`          | Reconstruct against current store, validation, and route guards.                                |
| `app/access/parent/family-created-success.tsx` | `REWRITE`          | Rebuild native modal state and destination on current navigation/session authority.             |
| `app/access/parent/review-create.tsx`          | `REWRITE`          | Preserve current profile isolation and idempotent creation semantics.                           |
| `app/access/parent/sign-in.tsx`                | `REWRITE`          | Bind to remote synthetic access truth instead of the local verification-only state machine.     |
| `app/access/parent/verification.tsx`           | `REWRITE`          | Reconcile deterministic code UI with remote session/reauth semantics.                           |
| `app/index.tsx`                                | `REWRITE`          | Welcome routing must not regress remote role/capability isolation.                              |
| `app/parent/_layout.tsx`                       | `REWRITE`          | A placeholder layout is insufficient; enforce the current Parent capability guard.              |
| `src/i18n/resources.ts`                        | `SAFE-CANDIDATE`   | R001 Arabic/English keys are separable, subject to parity, copy, and collision review.          |
| `tests/operator-demo-flow.test.ts`             | `REWRITE`          | Update the remote test rather than accepting a divergent expectation change.                    |
| `tests/revision2-localization-reset.test.ts`   | `REWRITE`          | Recreate coverage against Parent-authorized remote reset and profile-isolated state.            |

### 5. `96cad3b917f43adad32c491153be54d3ab24f899`

Subject: `docs(growth): define Growth Journey product guardrails`

Verified changed-path count: **14** (`7 SAFE-CANDIDATE`, `6 REWRITE`, `1 DROP-WHOLESALE`).

The Growth Journey pack, source ledger, proposed ADR, badge catalog, and learning contract are
candidate evidence. They must remain explicitly non-canonical until product, migration, content,
rights, and design approvals exist. The paste-ready implementation prompt is unsafe as a historical
unit because it embeds unresolved decisions and instructs implementation.

| Exact repository-relative path                                                  | Future disposition | Reason                                                                                            |
| ------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `DESIGN.md`                                                                     | `REWRITE`          | Canonical visual guidance must wait for approved Growth frames and resolve R001/R002 conflicts.   |
| `DESIGN_DIRECTION.md`                                                           | `REWRITE`          | Reconcile the candidate progression language without promoting generated art direction.           |
| `PRODUCT.md`                                                                    | `REWRITE`          | Product choices, progression thresholds, and consequence relationships require explicit approval. |
| `PROTOTYPE_LIMITATIONS.md`                                                      | `REWRITE`          | Add Growth capability truth only after canonical scope is approved.                               |
| `RESEARCH_BASIS.md`                                                             | `REWRITE`          | Separate sourced findings, inference, and decision authority before inclusion.                    |
| `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/CODEX_IMPLEMENTATION_PROMPT.md`           | `DROP-WHOLESALE`   | Do not port a paste-ready implementation directive containing unresolved authority.               |
| `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/GHAF_GROWTH_JOURNEY_RESEARCH_AND_SPEC.md` | `SAFE-CANDIDATE`   | Useful candidate research/spec evidence; thresholds and social model remain open.                 |
| `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/GOOGLE_STITCH_PROMPT_PACK.md`             | `SAFE-CANDIDATE`   | Useful generation provenance/input only; never screen or implementation authority.                |
| `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md`                                | `SAFE-CANDIDATE`   | Bounded source-pack index if relabeled consistently with the final authority state.               |
| `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/report-source.md`                         | `SAFE-CANDIDATE`   | Source ledger is independently useful after URL/date/rights revalidation.                         |
| `docs/architecture/ARCHITECTURE.md`                                             | `REWRITE`          | Remote architecture advanced; integrate only approved projection boundaries.                      |
| `docs/architecture/adr/0002-impact-path-projection.md`                          | `SAFE-CANDIDATE`   | Proposed derived-projection design is reviewable evidence, not an accepted ADR.                   |
| `docs/content/BADGE_CATALOG.md`                                                 | `SAFE-CANDIDATE`   | Candidate 16-badge registry pending exact criteria, content, cultural, and art approval.          |
| `docs/content/LEARNING_STORIES.md`                                              | `SAFE-CANDIDATE`   | Candidate finite learning/equal-credit contract pending factual and accessibility review.         |

### 6. `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`

Subject: `docs(spec): plan Stitch-gated Growth Journey implementation`

Verified changed-path count: **18** (`2 SAFE-CANDIDATE`, `15 REWRITE`, `1 DROP-WHOLESALE`).

This commit translates candidate Growth material into canonical-looking Feature 003 artifacts.
Those edits must not be mechanically applied. The readiness checklist and preflight remain useful
as evidence of questions/gaps, but all claims of resolved authority must be reopened against the
remote behavior, R002 intake, and explicit product decisions.

| Exact repository-relative path                                             | Future disposition | Reason                                                                                          |
| -------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                                | `REWRITE`          | Regenerate current-feature guidance only after canonical R3 decisions.                          |
| `CODEX_IMPLEMENTATION_PROMPT.md`                                           | `DROP-WHOLESALE`   | Do not port historical implementation instructions while the gate remains blocked.              |
| `DEMO_RUNBOOK.md`                                                          | `REWRITE`          | Rehearsal sequence/evidence must match implemented remote behavior and later approved screens.  |
| `README.md`                                                                | `REWRITE`          | Status claims and workflow need reconciled canonical sources.                                   |
| `TEAM_OWNERSHIP.md`                                                        | `REWRITE`          | Old reservations/handoff status cannot be inherited.                                            |
| `docs/README.md`                                                           | `REWRITE`          | Rebuild documentation navigation once approved sources have stable locations.                   |
| `specs/003-family-growth-garden/checklists/growth-journey-readiness.md`    | `SAFE-CANDIDATE`   | Useful open-gate checklist if all historical pass/resolution claims are reverified.             |
| `specs/003-family-growth-garden/checklists/requirements.md`                | `REWRITE`          | Avoid conflicting requirement/task IDs and unsupported completion status.                       |
| `specs/003-family-growth-garden/contracts/acceptance-contract.md`          | `REWRITE`          | Preserve every remote consequence and add Growth acceptance only after approval.                |
| `specs/003-family-growth-garden/contracts/assistant-contract.md`           | `REWRITE`          | Retain remote bounded voice/assistant behavior; add no implied live capability.                 |
| `specs/003-family-growth-garden/contracts/domain-contract.md`              | `REWRITE`          | Reconcile projection/event contracts with remote access, League, rewards, and reset.            |
| `specs/003-family-growth-garden/data-model.md`                             | `REWRITE`          | Requires explicit versioning/migration and resolution of participant/task-ID conflicts.         |
| `specs/003-family-growth-garden/design-intake/growth-journey-preflight.md` | `SAFE-CANDIDATE`   | Useful missing-evidence inventory; any “resolved” disposition must be reopened.                 |
| `specs/003-family-growth-garden/plan.md`                                   | `REWRITE`          | Produce a new plan only after decisions, intake completion, and migration approval.             |
| `specs/003-family-growth-garden/quickstart.md`                             | `REWRITE`          | Validation/run instructions must match the reconciled build and actual evidence.                |
| `specs/003-family-growth-garden/research.md`                               | `REWRITE`          | Reconcile candidate research and present-day sources without converting inference to authority. |
| `specs/003-family-growth-garden/spec.md`                                   | `REWRITE`          | Canonical scope changes require explicit product-owner approval.                                |
| `specs/003-family-growth-garden/tasks.md`                                  | `REWRITE`          | Regenerate dependency order and unique IDs after canonical contracts are settled.               |

### Corrected Ghaf Family League identity evidence

#### Verified remote-head fact

At remote head `a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2`,
`src/models/familyLeague.ts:12-27` defines a closed `LeagueParticipantId` union of exactly
`'child_salem' | 'child_alya' | 'cousin_noura'`, plus the participant record shape. The matching
fixture values in `src/features/league/index.ts:23-55` contain exactly Salem, Alya, and Noura.
`src/features/league/index.ts:68-73` derives the runtime validation enum from those fixture IDs.

#### Verified local-candidate fact

At local head `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`,
`specs/003-family-growth-garden/data-model.md:229-242` proposes
`'child_salem' | 'child_alya' | 'cousin_mariam' | 'cousin_rashid'` for `LeagueMemberId`.

#### Disposition

These are incompatible identity sets, not spelling-only documentation drift. Adding Mariam and
Rashid, replacing Noura, or defining a migration/alias policy requires an explicit product and
fixture-version decision plus profile-isolation, projection, reset, and route tests. Git conflict
mechanics must not decide the participant set.

#### Structural verification target

The six expected Git path counts are `55, 9, 13, 12, 14, 18`, totaling **121 path entries**. Each
entry above has exactly one disposition. This appendix intentionally contains no old-to-new commit
mapping because none of the six commits has been applied.
