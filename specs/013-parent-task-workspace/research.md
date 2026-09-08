# Research: Parent Task Workspace

## Native carousel pattern

**Decision**: Use the existing horizontal virtualized list with card-width peeking, manual scroll,
clear headings, and a normal primary action outside the rail.

**Rationale**: The reference sites demonstrate scannable card rails, but their implementations are
web-specific. Required content must remain reachable without autoplay or hidden safety details.

**Alternatives considered**: Web component packages were rejected because they do not target React
Native and would duplicate the existing design system. A third-party native carousel was rejected
because the existing list primitive covers the bounded catalog.

## Catalog and custom-template authority

**Decision**: Expand the local prepared catalog to three examples per established category while
keeping every noncanonical entry preview-only. Persist only Parent-authored bilingual wording for
reuse; reuse prefills a draft and creates no domain event.

**Rationale**: This satisfies judge-facing breadth without silently converting unreviewed cultural
content or custom text into executable, rewarded, or shared activity.

## Household and Child presentation

**Decision**: Present an All Children overview and per-Child filters to Parents. Child sessions
continue using the existing profile-scoped choice projection with no sibling details.

**Rationale**: Parents need a planning overview; Children need a focused, private, autonomy-
supportive surface rather than a comparative dashboard.
