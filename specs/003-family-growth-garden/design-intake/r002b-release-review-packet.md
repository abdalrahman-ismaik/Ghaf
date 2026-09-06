# R002b Growth Candidate Release Review Packet

**Prepared:** 2026-09-06

**Engineering-candidate status:** IMPLEMENTED BEHIND INDEPENDENT DEFAULT-OFF FLAGS

**Release status:** BLOCKED

This packet closes the source-verifiable readiness audit and gives reviewers one place to record
the remaining evidence. It does not activate a flag or convert browser/source evidence into native
or human approval. The detailed historical implementation evidence remains in
[`r002b-validation-evidence.md`](r002b-validation-evidence.md), and the twelve-surface authority is
the [code-native screen index](../../../docs/design/stitch/releases/ghaf-r002b/SCREEN_INDEX.md).

## Source-verifiable readiness

- [x] All twelve route or route-owned Growth surfaces have one documented code-native candidate,
      owner, form, independent flag boundary, and exact R001/R002a fallback.
- [x] Every runtime surface has one canonical `screen-spec.md`; missing Stitch imagery does not
      authorize new business behavior.
- [x] The shared composition contract plus each surface specification covers loading, empty/locked,
      error, offline, interruption/recovery, duplicate/already-complete, and reduced-motion states.
- [x] Parent and Child origins, allowlisted return destinations, safe-root fallback, role/profile
      isolation, nested-shell ownership, and physical RTL Back direction are specified.
- [x] Raw desktop wrappers, HTML/CSS/JavaScript, ambiguous duplicates, remote imagery, and screenshot
      constants are excluded from runtime; code-native components and local typed assets replace
      them.
- [x] Path, exactly-16-badge registry, equal-credit zero-Seed learning, Reveal recovery,
      Parent read-only progress, Shared Growth privacy, private League, flags, routes, and reset
      behavior have focused automated coverage.
- [x] Runtime changes remain within the approved product contract and the independent default-off
      flag boundary; missing or false flags preserve R001/R002a.
- [x] The integration gate is bounded here: no R002b flag may activate until its applicable visual,
      native, content, accessibility, privacy, provenance, and named-review rows pass.

## Bilingual and responsive evidence matrix

`PASSED (web proxy)` is implementation review evidence only. A blank or blocked cell remains an
open release gate.

| Surface group                                          | Arabic RTL  | English LTR | 320/360/390/430/768 | 200% browser text | Reduced motion   | Status                                                            |
| ------------------------------------------------------ | ----------- | ----------- | ------------------- | ----------------- | ---------------- | ----------------------------------------------------------------- |
| Today Path, Garden chapter, Path, Badge Gallery/Detail | Captured    | Captured    | Captured            | Captured          | Captured         | `PASSED (web proxy)`                                              |
| Parent Progress, Shared Growth, Shared Garden          | Captured    | Captured    | Captured            | Captured          | Captured         | `PASSED (web proxy)`                                              |
| Private five-Leaf League                               | 320/360/390 | 390/430/768 | Partial             | Arabic only       | Not release-wide | `PARTIAL`                                                         |
| Mangrove Learning Story                                | —           | —           | —                   | —                 | —                | `BLOCKED` until the truthful station-132 fixture is reached       |
| Accessible Mangrove Learning                           | —           | —           | —                   | —                 | —                | `BLOCKED` until the truthful station-132 fixture is reached       |
| Combined approval Reveal                               | —           | —           | —                   | —                 | —                | `BLOCKED` until complete authoritative consequence receipts exist |

The retained local captures are untracked review artifacts and are not canonical design assets.
The incomplete League/Learning/Reveal rows keep the release-wide capture and layout checklist open.

## Physical Android evidence

| Exercise                                                    | Status              | Device/build       | Required evidence                                      |
| ----------------------------------------------------------- | ------------------- | ------------------ | ------------------------------------------------------ |
| Install plus cold/warm/hot launch with flags off            | `BLOCKED / NOT RUN` | No attached target | fallback routes, startup timing, and offline reset     |
| Each explicitly enabled candidate at 390×844                | `BLOCKED / NOT RUN` | No attached target | route, screenshot, console/log result, and safe return |
| Native Back, modal dismissal, IME, and interrupted recovery | `BLOCKED / NOT RUN` | No attached target | before/after state and focus restoration               |
| TalkBack order, labels, live regions, and focus restore     | `BLOCKED / NOT RUN` | No attached target | narrated or recorded observation                       |
| 200% OS font scale, phone/tablet safe areas, and scrolling  | `BLOCKED / NOT RUN` | No attached target | overflow, clipping, and target findings                |
| Reduced motion and offline/duplicate/reset states           | `BLOCKED / NOT RUN` | No attached target | settings and exact stable outcome                      |

## Named-human approvals

Reviewers must record their name, role, date, exact build/commit, result, and notes. These blank rows
are intentionally not approvals.

| Gate                                   | Reviewer | Date | Result    | Scope                                                      |
| -------------------------------------- | -------- | ---- | --------- | ---------------------------------------------------------- |
| Product behavior and factual claims    | —        | —    | `NOT RUN` | Path, badges, learning, Reveal, shared/private meaning     |
| Arabic/English copy parity             | —        | —    | `NOT RUN` | comprehension, mixed bidi, age-appropriate language        |
| UAE culture and Mangrove content       | —        | —    | `NOT RUN` | place wording, facts, sources, stewardship claims          |
| Child safeguarding and privacy/consent | —        | —    | `NOT RUN` | role projections, shared data, learning/assistant limits   |
| Accessibility                          | —        | —    | `NOT RUN` | equal-credit route, TalkBack, 200% text, motion, cognition |
| Visual design                          | —        | —    | `NOT RUN` | hierarchy, states, responsive matrix, fallback continuity  |
| Local asset provenance and rights      | —        | —    | `NOT RUN` | R003 manifest, permissions, modification, public use       |

## Integration-owner release decision

- Current decision: `HOLD / BLOCKED`.
- All R002b flags remain default off.
- R001/R002a remains the supported demo fallback.
- Engineering may continue evidence collection without changing product authority.
- Activation requires the applicable open matrix cells, physical-device rows, and named-human rows
  to pass; partial activation must still honor each independent flag and fallback.
