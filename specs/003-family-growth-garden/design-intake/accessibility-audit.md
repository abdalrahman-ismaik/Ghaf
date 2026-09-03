# Arabic, RTL, and Accessibility Audit — Ghaf R001 Batch 1

**Date:** 2026-09-02

**Design result:** **CONDITIONALLY PASSED FOR IMPLEMENTATION**. The default Arabic hierarchy is
usable, but several generated values and all missing variants require the explicit native rules
below. Android, TalkBack, keyboard, and 200% scale remain `NOT RUN` or `BLOCKED` until exercised.

## Required Overrides and Native Translation

| Finding                                                     | Disposition                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Generated label-small is 12 px with 1.2 line height         | Do not use it for user-facing copy. The root product minimum 14/22 wins, including prototype disclosures and tags.                               |
| Some chips rely on padding and may render below 48dp        | Every Pressable gets a 48×48dp minimum hit target and at least 8dp separation.                                                                   |
| Six fixed 50 px OTP fields fit only the wide export         | Use one accessible native input with six responsive visual cells; allow paste, deletion, and smaller widths without horizontal clipping.         |
| Age values wrap/reorder in the PNG (`6–8`, `9–11`, `12–14`) | Isolate numeric labels and keep each range on one line; do not reverse digits or punctuation in RTL.                                             |
| Selected choices use color and border                       | Add selected state semantics and a non-color indicator; announce selection changes once.                                                         |
| Outline gray appears as small text in generated HTML        | Use `on-surface-variant` for readable body/caption text; reserve `outline` for boundaries or disabled decoration.                                |
| HTML uses remote font and Material Symbols font links       | Bundle native fonts locally and use accessible code-native SVG icons; no runtime font/network request.                                           |
| HTML uses backdrop blur                                     | Use a native dimming overlay and opaque/tonal sheet. Background content is hidden from the accessibility tree while the modal is open.           |
| Export uses a fixed 390×844 preview and fixed footers       | Use responsive safe areas and natural scrolling. Keep only the explicit transactional header/action region anchored; avoid keyboard obstruction. |

## RTL and Bidirectional Rules

- Arabic starts with page-level RTL; English uses page-level LTR. Components use logical
  start/end alignment and must not manually reverse an already mirrored tree.
- Back arrows point toward logical Back: right in Arabic, left in English. Globes, checkmarks,
  botanical avatars, and biometric symbols do not mirror.
- Phone, email, verification digits, `6–8`, `9–11`, `12–14`, and progress numerals use isolated
  direction-aware runs. The OTP value is entered and announced in a predictable digit order.
- Arabic receives generous line height, no artificial letter spacing, and no synthetic thin
  weight. Diacritics must not clip.
- Ordinary screens show one locale. “English” on the locale control and a Child preference called
  “both” are not duplicate bilingual content.

## Screen-Reader and Keyboard Order

1. Screen title/wordmark and progress where present.
2. Purpose/supporting copy.
3. Form label, field, helper/error.
4. Choice-group label and choices in logical reading order.
5. Privacy/synthetic disclosure before the action it qualifies.
6. One dominant primary action, then secondary/edit action.

Errors are associated with their field and announced politely once. Loading sets busy/disabled
state without changing the action label's meaning. Return/Done advances or submits only when valid.
Keyboard avoidance must keep the focused field, inline error, and dominant action reachable.

The success sheet receives initial focus on its title, contains a labeled close/dismiss path even
if the visual design relies on the overlay or system Back, traps focus while open, and restores
focus to Create when dismissed.

## Responsive Acceptance Targets

- Compare composition at 390×844.
- Verify 320×568 and 430×932 without horizontal overflow, clipped controls, or unreachable actions.
- Verify long English and Arabic copy with natural scroll.
- Verify 200% font scale without clipped privacy, error, or primary-action content.
- Verify keyboard-open layouts for identifier, verification, family name, and Child nickname.
- Reduced motion uses immediate opacity/state changes and preserves the same modal and navigation
  results.

## Evidence Boundary

The PNGs contain no English, focus, error, loading, offline, keyboard, screen-reader, or increased-
font-scale frame. This audit defines implementation targets; it does not claim those targets have
passed. Physical Android evidence cannot be inferred from a web screenshot.
