# Feature 002 Preservation Baseline

**Recorded**: 2026-08-26
**Purpose**: Protect the previous deterministic food-rescue slice and its evidence while Feature
003 replaces only the judge-facing runtime journey.

## Preserved historical sources

- `specs/001-ghaf-repository-foundation/**`
- `specs/002-ghaf-core-mvp/**`
- `docs/DEMO_RUNBOOK.md`
- `docs/PROTOTYPE_LIMITATIONS.md`
- `docs/TEAM_OWNERSHIP.md`
- committed `output/playwright/*-mobile-final.png` Feature 002 captures
- `assets/demo/**` Feature 002 bread, evidence, narration, and family-wisdom fixtures
- Git history through checkpoint `0db6d76`

These files are not Feature 003 acceptance evidence. Pre-existing working-tree edits in
`docs/DEMO_RUNBOOK.md` and `specs/002-ghaf-core-mvp/spec.md` are preserved as user-owned changes and
must not be overwritten during Feature 003 implementation.

## Runtime migration boundary

The existing `/`, `/role`, `/parent`, and `/child` files may be rewritten for Feature 003. The six
Feature 002 route files are removed only after all ten Feature 003 replacements and the
deterministic smoke flow work:

- `/parent/create`
- `/parent/generating`
- `/parent/review`
- `/child/mission`
- `/parent/confirmation`
- `/celebration`

Legacy food-rescue runtime modules/tests may be retired after replacement coverage passes; their
specifications, documentation, media, screenshots, and Git history remain preserved.

## Evidence status carried forward truthfully

- Feature 002 local/web typecheck, lint, formatting, and 32 tests were healthy at the Feature 003
  baseline audit.
- Feature 001 T037 and Feature 002 T039 physical Android evidence remained `BLOCKED`.
- Feature 002 T041 human rehearsal evidence remained `NOT RUN`.
- No Feature 002 pass changes any Feature 003 criterion from `NOT RUN` or `BLOCKED`.

**Preservation review**: `PASSED` by repository inventory; runtime retirement remains pending until
the Feature 003 replacement gate.
