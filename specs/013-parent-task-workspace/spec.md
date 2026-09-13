# Feature Specification: Parent Task Workspace

## Catalog execution amendment CE1 — 2026-09-13

User selection authorizes completing all24 existing catalog tasks under
[contracts/catalog-execution.md](contracts/catalog-execution.md). This explicitly supersedes FR009
and preview-only assumptions for those definitions. Saved custom wording and unknown templates
remain planning-only. FR014 continues to gate the alternate workspace presentation; execution
works through the normal current surfaces without changing that flag. Parent approval, private
Child lists, immutable accepted awards, separate occurrences and personal landscapes are required.
Engineering implementation is authorized; named content/native acceptance is not claimed.

**Feature Branch**: `013-parent-task-workspace`

**Created**: 2026-09-08

**Status**: Default-off implementation complete; release activation blocked

**Input**: Redesign Parent Tasks around task creation, varied categories, reusable custom
templates, and clear per-Child or whole-family task views using modern mobile patterns.

## User Scenarios & Testing

### User Story 1 - Create or reuse a task first (Priority: P1)

A Parent entering Tasks always finds a prominent Create task action, can browse every existing
category and varied prepared examples, and can reopen reusable wording they saved previously.

**Independent Test**: With no journey and with an existing journey, open Parent Tasks in Arabic
and English and confirm Create task stays visible; browse all eight categories and reuse a saved
template without changing the authoritative assignment.

**Acceptance Scenarios**:

1. **Given** any task lifecycle, **when** Parent Tasks opens, **then** Create task is visible.
2. **Given** the prepared catalog, **when** the Parent browses it, **then** all eight categories
   have at least three distinct examples and clearly identify preview-only content.
3. **Given** custom bilingual wording, **when** the Parent saves it as a template, **then** it is
   available after revisiting the builder on that device and can repopulate the draft wording.

### User Story 2 - Understand work across the family (Priority: P1)

A Parent can select All Children, Salem, or Alya and see current authoritative work separately
from prepared suggestions, while a Child sees only their own Parent-approved choices.

**Independent Test**: Switch among All Children and both Child filters and verify labels, grouping,
empty states, task status, and privacy; enter each Child route and verify no sibling task details or
Parent template controls appear.

**Acceptance Scenarios**:

1. **Given** All Children, **when** the overview renders, **then** each configured Child has a
   distinct section with current work or an honest empty/prepared state.
2. **Given** one Child filter, **when** it is selected, **then** only that Child's projection is
   shown and task creation targets that Child where the P0 authority permits it.
3. **Given** a Child session, **when** Today opens, **then** only that Child's approved choices and
   current assignment appear; saved Parent templates never appear.

### User Story 3 - Use calm, modern mobile interactions (Priority: P2)

The Parent can scan categories and templates through horizontally scrollable rails with a visible
next-card cue, accessible labels, no autoplay, and a non-carousel path to required information.

**Independent Test**: Inspect Arabic RTL and English LTR at 320 and 390 dp plus enlarged text;
confirm all actions remain usable, content is not clipped, and no required safety or approval
detail exists only inside a carousel.

### Edge Cases

- A corrupt or unavailable saved-template record fails closed to an empty library without blocking
  the deterministic task journey.
- Duplicate or blank custom templates are rejected; limits prevent unbounded device storage.
- Switching Children never transfers a task, template, private detail, or assignment authority.
- Recognition-only, maintenance, religious, affection, and relationship content never gains Seeds
  or shared eligibility through customization.
- Prepared examples that lack approved executable behavior remain explicitly preview-only.

## Requirements

### Functional Requirements

- **FR-001**: Parent Tasks MUST always expose one primary Create task action.
- **FR-002**: The workspace MUST offer All Children and every configured Child as accessible,
  mutually exclusive filters.
- **FR-003**: Current authoritative assignments MUST be visually and semantically separated from
  prepared examples and Parent-saved templates.
- **FR-004**: The prepared catalog MUST retain exactly the existing eight categories and provide at
  least three materially different templates per category.
- **FR-005**: Category and template rails MUST support touch scrolling, Arabic RTL and English LTR,
  visible continuation, no autoplay, and an accessible non-rail route to required actions.
- **FR-006**: A Parent MUST be able to save, reuse, and delete up to 20 device-local bilingual task
  wording templates; blank, oversized, duplicate, or malformed records MUST be rejected.
- **FR-007**: Saved templates MUST store only Parent-authored title/action wording, category,
  recurrence preference, created/updated timestamps, and synthetic household scope; they MUST NOT
  store Child media, evidence, notes, assistant content, access credentials, or reward state.
- **FR-008**: Reusing a saved template MUST only prefill editable Parent wording and MUST NOT approve,
  assign, confirm, award Seeds, grow a landscape, update League/Canopy, or unlock a reward.
- **FR-009**: The sole executable P0 journey MUST remain `task_recycling_p0_v1`; all other catalog
  and saved entries MUST remain honestly labeled planning previews until separately approved.
- **FR-010**: Parent review and approval MUST remain required before Child visibility or execution.
- **FR-011**: Child screens MUST expose only the active Child's Parent-approved choices and MUST NOT
  expose sibling task details, the catalog, or saved Parent templates.
- **FR-012**: Reset and verified family replacement MUST clear saved templates deterministically.
- **FR-013**: The candidate MUST add no UI dependency, network request, notification, due date,
  overdue pressure, production persistence, or external service.
- **FR-014**: The candidate MUST remain behind one independent default-off flag and preserve the
  current Tasks screen byte-for-behavior when disabled.

### Key Entities

- **Prepared Task Template**: Reviewed local catalog content with category, safety, privacy, mode,
  recurrence, and honest demo availability.
- **Saved Parent Template**: Bounded device-local Parent-authored wording that can prefill a future
  draft but carries no approval or progression authority.
- **Child Task Projection**: Parent-only presentation of one Child's current authoritative task and
  prepared ideas without exposing protected content across Child sessions.

## Success Criteria

- **SC-001**: Create task is findable within one screen and one tap in every lifecycle state.
- **SC-002**: Automated catalog checks find exactly eight categories and at least 24 distinct
  prepared templates, with at least three per category.
- **SC-003**: Save, restore, reuse, delete, corrupt-read fallback, 20-item cap, reset, and family
  replacement scenarios pass without any assignment or progression mutation.
- **SC-004**: Arabic and English layouts at 320/390 dp expose All Children, each Child, every
  category, visible rail continuation, and complete touch targets without clipped actions.
- **SC-005**: Existing task lifecycle, Child privacy, reset, full automated tests, and offline
  exports remain green with the flag disabled.

## Assumptions

- “Complete templates” means a varied demo catalog of at least three prepared examples for each of
  the eight established categories, not production-ready cultural approval or execution.
- “Custom task” means bounded Parent-owned wording saved for reuse; it never bypasses category,
  safety, privacy, review, or approval rules.
- 21.dev and React Bits inform composition and interaction ideas only; the native app continues to
  use its existing Expo components and design tokens.
