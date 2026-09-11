# R002b Badge Detail specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Flag: `r002b_badges_ui`, default off.
Owner route: `/garden/badges/:badgeId`, nested in the Child Growth stack.

## Purpose and composition

Explain one canonical badge without mystery or reward pressure. The naturally scrolling detail
contains a compact code-native badge mark; canonical Arabic/English identity; earned, in-progress,
or locked state; exact visible criteria; current progress; “why this matters”; source/provenance
note; private/permanent note; and at most one contextual next action.

## Data and action authority

The badge ID must resolve through the exact 16-item registry for the active profile. Detail reads
the deterministic projection and never grants, revokes, edits, or recomputes stored evidence. The
single next action may open the relevant Impact Path station, unlocked learning, or an already
Parent-assigned eligible task. If none exists, render no action. A Child action never creates or
assigns a task.

## Navigation and states

Allow only Child capability, active-profile scope, flag on, a valid badge ID, and a closed same-role
origin. Arabic Back is physically right and restores Gallery/Path/Reveal route, filter, scroll, and
focus. Invalid/cross-role origins or badge IDs fall back to `/garden/badges` or `/child` without
leaking another profile. Bottom navigation is omitted.

Required states: earned with date or explicitly unknown historical date; in progress; awaiting
review; locked; contextual-action unavailable; loading; offline-ready; recoverable projection
error; missing art/source note; interrupted/recovered; and 200% text. No state uses rarity,
probability, expiry, public status, or unavailable reward copy.

## Accessibility, copy, and review

Expose one screen heading, explicit status, a semantic criteria list, progress text, and a named
48×48 action. Art never carries text and has an alternative when informative. Content reflows from
320–768 without horizontal scrolling; reduced motion shows the stable state immediately. Registry
names/criteria are authoritative; descriptions, why-it-matters copy, factual sources, and art remain
human-review/provenance pending.

## Acceptance

Prove all 16 valid IDs, invalid-ID fallback, exact visible composite criteria, permanent/private
state, no mutation on view, contextual-action allowlist, no Child task creation, profile isolation,
origin restoration, bilingual/RTL behavior, flag-off inaccessibility, and large-text containment.
Local browser-proxy review now covers Arabic RTL and English LTR at 320×844, 360×844, 390×844,
430×932, and 768×1024; a synthetic 200%-text pass has no document horizontal overflow, and the
390×844 reduced-motion pass settles with zero running animations. These remain review candidates;
physical Android/TalkBack and named human review remain pending.
