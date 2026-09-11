# R002b Parent Shared Garden settings specification

> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

Status: code-native implementation candidate. Owner route:
`/parent/family/shared-garden`, nested behind existing Parent access. Visibility flag:
`r002b_shared_growth_view`; mutation flag: `r002b_shared_growth_contribution`, both default off.

## Purpose and composition

Let an authorized Parent understand and govern only future anonymous Shared Growth signals. Use the
R002a Parent shell, a concise privacy explanation, current participation state, explicit effects
and non-effects, and one bounded action area. The only states are Continue Participation, Pause New
Contributions, and End Participation. Resuming after Pause may use existing consent; returning
after End requires a fresh Parent-consent confirmation.

## Data and action authority

The screen reads a household-scoped participation record independent from tasks and all personal
progress. Pause/End applies prospectively to anonymous aggregate signals only. It never changes or
deletes tasks, Seeds, badges, Garden, League, Challenge Leaves, Family Rewards, or history. Viewing
requires the view flag. Any participation mutation additionally requires the contribution flag,
Parent capability/reauthentication, and an idempotent domain action. When contribution is off, the
screen is read-only or absent; it must not imply a saved setting.

## Navigation and states

Entry is from an approved Parent Family/Garden context. Arabic Back is physically right and restores
the validated Parent origin. Invalid session, household, origin, or flag follows existing Parent
sign-in/safe-root behavior. Required states: continued, paused, ended, fresh-consent confirmation,
submitting, saved, duplicate/idempotent retry, recoverable error, offline unable-to-save, interrupted
and reconciled, read-only view, and reduced-motion stable update.

## Accessibility, copy, and review

Expose the current state through text and accessibility state, not color. Confirm destructive-
meaningful “End” without fear language; focus is trapped/restored in confirmation. Controls are at
least 48×48, disabled state stays readable, 200% text scrolls without obscuring fixed actions, and
RTL/LTR physical placement follows locale. Privacy/consent wording requires named product, privacy,
and human copy review before release activation; no external asset is needed.

## Acceptance

Prove Parent-only access and reauthentication, view/contribution flag separation, Pause versus End
consent semantics, prospective-only anonymous effect, complete independence from every existing
reward/progress authority, idempotency/recovery, household/profile isolation, offline/error truth,
safe origin handling, flag-off R002a fallback, bilingual/large-text containment, and focus
restoration. Local browser-proxy review now covers Arabic RTL and English LTR at 320×844, 360×844,
390×844, 430×932, and 768×1024; synthetic 200%-text passes have no document horizontal overflow,
and the English 390×844 reduced-motion pass settles with zero running animations. Physical
Android/TalkBack/Back and named guardian-governance/privacy review remain pending.
