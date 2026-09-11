# R002b Parent Child Progress specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_parent_progress_ui`, default off.
Owner route: `/parent/family/:profileId/progress`, nested behind existing Parent access.

## Purpose and composition

Give an authorized Parent a private, read-only summary for one explicitly selected Child. Use the
R002a Parent shell with selected-Child context, lifetime and current-stage progress kept visually
distinct, completed-stage archive, earned badges, exact in-progress criteria, unlocked learning,
and transparent suitable-task suggestions. The hierarchy supports encouragement without diagnosis,
surveillance, sibling comparison, public status, or manual grants.

## Data and actions

Project only the requested household profile through Parent-capability and privacy selectors. Seeds,
stages, badges, criteria, and learning are read-only. Parent cannot grant, revoke, edit, or complete
them here. “Create suitable task” may pass a typed template/category prefill into the existing Task
Builder; normal review/save remains required and no assignment occurs from this screen. Existing
private League and Family Reward data appears only if already authorized by their own projection;
it is never compared across children.

## Navigation, selection, and recovery

Entry comes from Parent Family/selected-Child UI after existing access/reauthentication checks.
Arabic Back is physically right and returns to the validated Parent origin. Switching children
recomputes every selector and clears the previous Child's origin, filters, task suggestion, scroll,
and focus state. Invalid/out-of-household profiles, expired authority, cross-role origins, and flag-
off routes resolve through existing Parent sign-in or `/parent` without leaking data.

## States

Salem/eligible migration, Alya/no synthetic carry-forward, new/empty Child, partial data, loading,
offline-ready, recoverable projection error, stale/recovered fixture, no badges, no unlocked
learning, completed chapter, profile switch, unauthorized/session expired, suggestion unavailable,
and long-name/large-number/200% text. No fabricated history fills an empty state.

## Accessibility, copy, and review

Announce selected-profile changes. Use headings, semantic lists, textual chart equivalents,
tabular numerals, non-color progress, 48×48 controls, logical RTL/LTR content, and stable reduced-
motion profile updates. Any privacy/safety wording and task-suggestion rationale require human copy
review. Child/avatar/badge/landscape marks are existing owned or code-native assets only.

## Acceptance

Prove Parent-only access/reauthentication, household/profile isolation, selector recomputation and
context clearing, no sibling comparison, no manual reward mutation, safe Task Builder prefill,
existing privacy visibility, deterministic offline/reset behavior, flag-off fallback, bilingual
layout, and large-text containment. Local browser-proxy review now covers Arabic RTL and English
LTR at 320×844, 360×844, 390×844, 430×932, and 768×1024; an English 320-wide synthetic
200%-text pass has no document horizontal overflow, and the 390×844 reduced-motion pass settles
with zero running animations. Physical Android/TalkBack/Back and named privacy/copy review remain
pending.
