# Specification Quality Checklist: Family Growth Garden — Revision 3 Planning

**Purpose**: Validate Revision 3 product/domain planning completeness without implying Growth
Journey design, content-review, or runtime readiness

**Revalidated**: 2026-09-03

**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] Revision 2 product behavior is separated from implementation choices still pending Stitch.
- [x] The specification focuses on Parent/Child value, safety, fairness, privacy, and capability truth.
- [x] Revision 1 is explicitly historical and its evidence is non-reusable.
- [x] R001 is preserved as a bounded partial release and is not presented as the complete Revision 2 or Revision 3 product.
- [x] The supplied Growth Journey pack is classified as planning/generation input; approved PNGs and screen specs remain composition authority.
- [x] All mandatory sections are complete.
- [x] Exact routes, geometry, tokens, and asset/loading choices are intentionally deferred to approved Stitch frames rather than guessed.

## Requirement Completeness

- [x] No `NEEDS CLARIFICATION` marker remains.
- [x] Functional requirements are testable and use stable Revision 2 IDs.
- [x] Success criteria are measurable and verifiable.
- [x] User stories cover Parent access, Child access/pairing, task building, Child completion, confirmation, League, Family Rewards, offline reset, first-run orientation, Impact Path/badges, and equal-credit learning/Parent progress.
- [x] Edge cases include access failure, pairing expiry/revocation, tie ranking, help/adaptation, extra tasks, weekly rollover, reward immutability/versioning, missing voice, bidi text, and duplicate confirmation.
- [x] P0 and out-of-scope boundaries are explicit.
- [x] Dependencies and assumptions identify a complete approved Stitch handoff, prerequisite Parent/Child shells, persistence decision, digit strategy, and named content reviews as blocking inputs.

## Contract Coverage

- [x] Parent Home/Tasks/Garden/Family and Child Today/Garden/League navigation is fixed.
- [x] Contextual Task Builder, Check-in, Reward, pairing, permissions, settings, devices, and reauthentication families are covered.
- [x] Parent and Child settings expose only their approved language, voice, AI/media permission, device, accessibility, and profile controls.
- [x] Synthetic Parent/Child access is distinct from production authentication.
- [x] Five Challenge Leaves, the `(confirmed / 5) × 100` formula, 100 cap, full help credit, tied positions, no speed tiebreaker, and weekly/permanent reset split are explicit.
- [x] League privacy allowlist and prohibited categories are explicit.
- [x] Family Reward naming, milestone types, private audience, Promised → Unlocked → Given, reauthentication, monthly maximum, nonretroactive change, irreversibility, no rank dependency, no exchange rate, and no custody are explicit.
- [x] The exact praise → 12 Seeds → Mangrove/canopy → fifth Leaf → private unlock oracle and duplicate no-op are explicit.
- [x] Age-band Coach behavior, MSA/conversational Arabic boundary, prepared simulated push-to-talk, captions/delete/replay/slower playback, and adult exit are explicit.
- [x] Alexandria/Readex hierarchy, page-level RTL, bidi values, tabular numerals, no Arabic tracking, font scaling, targets, contrast, and reduced-motion parity are explicit.
- [x] Visual geometry/tokens remain blocked pending approved Stitch frames.
- [x] Lifetime Seeds, landscape growth, canopy, Challenge Leaf/League, and Family Reward eligible progress remain separate authorities.
- [x] The 120–180 Water & Coast stations and exact 16 private badge IDs have transparent, deterministic criteria.
- [x] Task mastery mappings extend rather than replace the eight categories and recognition/safety/privacy decisions.
- [x] Learning and activity completion is finite, equal-credit, idempotent, and adds zero Seeds or garden growth.
- [x] One recoverable RevealBundle preserves praise-first ordering and places the private Family Reward last.
- [x] Impact Path/My Badges remain nested in Garden; Parent progress is selected-Child read-only and profile isolated.
- [x] Safe-help recognition is one-time descriptive feedback, not a badge or progress source.

## Artifact Consistency

- [x] `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/acceptance-contract.md`, and `tasks.md` use the same Revision 3 planning boundary and date.
- [x] Tasks preserve T001–T110 as historical, T111–T119 as completed R001 design intake, bounded R001 implementation evidence, and broad T121+ work as incomplete.
- [x] The plan, preflight, ADR, and acceptance contract keep Growth implementation blocked until its design intake is released.
- [x] Growth runtime, web, Android, accessibility, and human evidence starts `NOT RUN` or `BLOCKED`; R001 evidence stays scoped to its release.
- [x] The detailed [Growth Journey readiness checklist](growth-journey-readiness.md) records conflict dispositions and remaining gates.

## Design and Implementation Gate

- [ ] Complete Growth Journey Google Stitch release received and approved.
- [ ] Arabic/English frame, state, screen-spec, asset-provenance, and prerequisite-shell inventory complete.
- [ ] Exact route/component/token/persistence/digit/content plan frozen.
- [ ] Sorting-credit provenance at 132 and independent garden provenance at station 180 resolved.
- [ ] Named factual, Arabic/UAE cultural, safeguarding, accessibility, and rights reviews passed.
- [ ] Post-Stitch cross-artifact analysis passed.
- [ ] Integration owner explicitly released the applicable Revision 3 implementation batch.

## Validation Result

**Specification quality**: **PASSED** for the Revision 3 product/domain planning amendment.

**Design readiness**: **BLOCKED** — complete approved Growth Journey Stitch frames have not been
supplied.

**Content-review readiness**: **NOT RUN** — source access does not substitute for named reviews.

**Implementation readiness**: **BLOCKED** — T181+ runtime work and unfinished Revision 2
prerequisites are not authorized.

The open gate items are external readiness dependencies, not unresolved specification ambiguity.
They MUST remain unchecked until direct evidence exists.
