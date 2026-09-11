# Research: Role Header Branding

## Decision 1: Integrate at shared header boundaries

**Decision**: Brand the five existing shared header families: Parent dashboard/tab, Child
dashboard/tab, ordinary R002a flow, R002b nested Growth Journey, and journey-style content.

**Rationale**: These boundaries cover released Parent and Child screen headers while keeping routes
thin. A later route that adopts one of these headers inherits the mark automatically.

**Alternatives considered**:

- Add a logo in every route: rejected because it duplicates layout and can produce double marks.
- Add a global floating logo: rejected because it competes with safe areas, dialogs, and route
  controls and cannot preserve each header's hierarchy.
- Brand only the two dashboards: rejected because deeper screens would still feel disconnected.

## Decision 2: Reuse the established local raster component

**Decision**: Render the existing immutable raster source through `GhafRasterLogo`; do not create or
modify brand artwork.

**Rationale**: The component already binds the approved local source, preserves aspect ratio,
provides deterministic caching, disables transition flicker, and supports a decorative mode.

**Alternatives considered**:

- Use the code-native Ghaf tree illustration: rejected because it is not the official raster mark.
- Copy the image into another asset folder: rejected because it creates a second source of truth.
- Fetch a brand asset remotely: rejected because Ghaf is offline-first and remote branding can fail.

## Decision 3: Keep title semantics primary

**Decision**: The mark is decorative in role headers; the existing localized title remains the sole
header announcement.

**Rationale**: Repeating the logo's brand name beside a screen title adds no navigation meaning and
would make screen-reader traversal noisy.

## Decision 4: Use compact logical lockups

**Decision**: Pair a small fixed-proportion mark with the title using logical row direction, a
shrinkable title region, natural wrapping, and no one-line clamp. The journey-style header uses the
same mark at a slightly more prominent but still subordinate size.

**Rationale**: This retains Arabic-first ordering, keeps the artwork unmirrored, and protects Back
and action slots at 320 dp and enlarged text sizes.

## Decision 5: No state, copy, or dependency changes

**Decision**: Treat the feature as presentation-only. Reuse existing titles, source, tokens,
components, and route contracts.

**Rationale**: The request is for visual identity, not another setting or workflow. A pure shared
component change is easier to verify and cannot alter progression, privacy, access, or offline
behavior.
