# Feature Specification: Role Header Branding

**Feature Branch**: `012-role-header-branding`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "Add the app logo to the dashboard screen and the other screens in
the parent and child screens."

## User Scenarios & Testing

### User Story 1 - Recognize Ghaf on Parent and Child dashboards (Priority: P1)

A Parent or Child entering their main app area sees the official Ghaf mark beside the current
screen title, making the product identity immediately recognizable without weakening navigation or
the dashboard content hierarchy.

**Why this priority**: The dashboards are the most frequently revisited role surfaces and establish
the visual identity for the rest of each experience.

**Independent Test**: Open Parent Home and Child Today in Arabic and English and confirm that each
header shows one official Ghaf mark with the current title while settings, help, profile, and
navigation controls remain in their established positions.

**Acceptance Scenarios**:

1. **Given** an authenticated-looking Parent session, **when** Parent Home, Tasks, Family, or Garden
   opens, **then** the shared top header shows one official Ghaf mark beside the existing title.
2. **Given** an authenticated-looking Child session, **when** Today, Garden, or League opens,
   **then** the shared top header shows one official Ghaf mark beside the existing title.
3. **Given** either role header, **when** assistive technology reads the screen, **then** it announces
   the screen title once and does not announce a redundant decorative logo.

---

### User Story 2 - Keep branding across deeper role screens (Priority: P1)

A Parent or Child moving from a dashboard into a task, settings, check-in, reward, progress,
learning, badge, reveal, or shared-garden screen continues to see the same official Ghaf mark in the
screen header.

**Why this priority**: Consistent identity across navigation levels makes deeper flows easier to
understand and avoids a disconnected collection of screens.

**Independent Test**: Open one screen from every shared role-header family and confirm that the
same local mark appears once without changing Back, action, content, or route behavior.

**Acceptance Scenarios**:

1. **Given** a Parent or Child opens an ordinary nested flow, **when** its top header renders,
   **then** the logo accompanies the existing title without displacing Back or contextual actions.
2. **Given** a Growth Journey nested screen renders, **when** the family moves among progress,
   learning, badge, reveal, and shared-growth routes, **then** each shared header retains the same
   logo treatment.
3. **Given** a journey-style role screen renders, **when** it has contextual or Back controls,
   **then** the logo remains part of the title area and the controls keep their current meaning.

---

### User Story 3 - Preserve bilingual and compact-screen clarity (Priority: P2)

Arabic-first and English users can still read the complete title and use every header control at
compact phone widths and enlarged text sizes after the logo is added.

**Why this priority**: Repeated branding is valuable only if it does not crowd Arabic, truncate
meaningful titles, or reduce control access.

**Independent Test**: Inspect representative Parent and Child dashboard and nested headers in
Arabic RTL and English LTR at 320 and 390 dp widths, including 200% text scaling, and confirm that
titles remain readable, controls stay usable, and the logo follows the logical title direction.

**Acceptance Scenarios**:

1. **Given** Arabic RTL, **when** a branded title renders, **then** the logo/title relationship uses
   logical direction without mirroring the logo artwork.
2. **Given** English LTR, **when** the same title renders, **then** its logical order reverses as
   expected while the official artwork remains unchanged.
3. **Given** a 320 dp viewport or 200% text size, **when** a longer localized title renders, **then**
   it may wrap naturally and never hides a required header control.

### Edge Cases

- Long Arabic and English screen titles may wrap; required words must not be ellipsized to a single
  line merely to accommodate the logo.
- Back, settings, help, profile, and contextual actions must retain at least their existing touch
  target and accessible name.
- The logo must remain decorative beside a visible title so screen readers do not announce the
  brand and title as competing headers.
- Header reuse must not add a second mark to already branded access, onboarding, or splash screens.
- An image decode failure must leave the screen title and navigation usable.

## Requirements

### Functional Requirements

- **FR-001**: Every released Parent and Child dashboard or tab header MUST show the immutable
  official local Ghaf raster mark beside its existing screen title.
- **FR-002**: Every released Parent and Child ordinary flow, Growth Journey nested, and
  journey-style header MUST show the same official local mark in its title area.
- **FR-003**: The implementation MUST apply branding through shared header boundaries rather than
  adding route-specific copies.
- **FR-004**: Each rendered role screen MUST show no more than one logo in its top screen header.
- **FR-005**: The visible screen title MUST remain the single header announcement, and the adjacent
  logo MUST be treated as decorative.
- **FR-006**: Arabic RTL and English LTR MUST use logical title ordering without mirroring or
  modifying the official mark.
- **FR-007**: Titles MUST remain scalable and readable at 320 and 390 dp widths and up to 200% text
  size; the logo MUST shrink from layout pressure before required text or controls are lost.
- **FR-008**: Existing Back, settings, help, profile, action, safe-area, and navigation behavior MUST
  remain unchanged.
- **FR-009**: The feature MUST reuse the current bundled official logo source and MUST add no remote
  image, generated substitute, dependency, network request, state, preference, or product logic.
- **FR-010**: Existing access, onboarding, and splash branding MUST remain unchanged and MUST NOT
  gain duplicate marks.
- **FR-011**: The complete deterministic Arabic-first offline journey MUST remain usable if the logo
  image cannot decode.

### Key Entities

- **Official Ghaf Mark**: The existing immutable, bundled raster brand asset and its established
  accessible fallback behavior.
- **Role Header Title**: A visible Parent or Child screen title paired with one decorative official
  mark while retaining sole heading semantics.
- **Header Family**: A shared presentation boundary used by multiple dashboard, tab, flow, nested,
  or journey-style routes.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Parent Home/Tasks/Family/Garden and Child Today/Garden/League each display exactly one
  official mark in the top header with no route-specific logo copy.
- **SC-002**: Every released role route using an ordinary flow, Growth Journey nested, or
  journey-style shared header inherits the logo automatically.
- **SC-003**: Representative Parent and Child headers pass Arabic RTL and English LTR inspection at
  320 and 390 dp, with no hidden required control or horizontally clipped title.
- **SC-004**: Automated accessibility inspection finds one heading title and zero separately
  announced decorative header logos per screen.
- **SC-005**: Existing role navigation, behavior, full tests, and offline exports complete without a
  new package, remote asset, or state change.

## Assumptions

- “Other screens” means released in-app Parent and Child screens with a shared top-screen header;
  transient sheets, dialogs, bottom navigation, access/onboarding, and splash surfaces are not
  separate screen headers and do not receive another logo.
- A compact mark beside the title is preferable to a full wordmark because the visible screen title
  remains primary and compact phone space is limited.
- The current official bundled raster mark is the sole approved source; this feature does not alter
  its pixels, checksum, proportions, or meaning.
