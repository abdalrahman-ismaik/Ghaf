# Feature 003 Design-System and Anti-Slop Audit

**Recorded**: 2026-08-26 before Feature 003 UI implementation
**Methods**: Impeccable native/Android guidance plus Expo Design System token/component audit

## Baseline summary

| Measure                  | Finding                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| Source reviewed          | `app/**`, `src/components/**`, `src/design/tokens.ts`; 8,309 TypeScript/TSX lines |
| Theme entry points       | One: `src/design/tokens.ts`                                                       |
| Hard-coded colors        | 13, all inside the code-native legacy Ghaf illustration                           |
| Typography escapes       | None; reported `fontSize` values reference the shared type scale                  |
| Spacing escapes          | Two deliberate zero values in legacy controls                                     |
| Radius drift             | Token-backed except deliberate square joins (`0`)                                 |
| Legacy shadows/elevation | None                                                                              |
| Styling framework        | React Native `StyleSheet`; retain it                                              |

The inherited system is coherent and should be extended rather than replaced. The problem is
product composition and missing Feature 003 semantics, not a need for another theme or UI library.

## Required system corrections

- Add semantic `mangrove`, `water`, `waterLight`, `coral`, and `coralLight` roles.
- Align runtime type roles, phone screen padding (20dp), and 120/220/650ms motion values with
  `DESIGN.md`.
- Preserve 48dp touch targets, add 8dp separation for adjacent small controls, keep Arabic font
  padding/diacritics safe, and test at 200% font scale on Android.
- Add busy-capable primary/secondary/quiet button states, point-of-use origin disclosures,
  Parent-only reset confirmation, task/safety/praise/retry panels, prepared-media equivalents,
  bounded assistant surfaces, five landscape tracks, combined canopy, and privacy-safe circle
  progress.
- Use code-native SVG and flat tonal layers; keep shadows rare and do not add stock desert imagery,
  generic AI avatars, glassmorphism, emoji, neon game colors, score grids, card-stack dashboards, or
  decorative cultural clichés.

## Route and platform findings

- Keep and redesign `/`, `/role`, `/parent`, and `/child`; add the six Feature 003 paths and retire
  the six Feature 002 paths only after integration.
- Current reset is immediate, globally exposed, and returns to `/parent`; Feature 003 needs a small
  Parent-only confirmation, atomic reset, history replacement, and Arabic `/`.
- Predictive Back is disabled in current configuration and must be corrected, then verified on a
  named Android build.
- Current mixed global RTL mirroring and route-local reversal risks double mirroring. Use logical
  styles and mirror directional icons only.
- Prepared media needs visible description/transcript, origin, optionality, Parent visibility,
  removal, and missing-asset fallback.
- Required state changes need once-only accessibility announcements. Keyboard/IME, screen reader,
  reduced motion, large type, Back, and media remain native evidence gates.

## Approved visual direction

The implementation extends **The Living Family Garden — الحديقة العائلية الحية**: calm Parent
stewardship, capable Child exploration, warm field paper, botanical ink, scarce date-gold accents,
Mangrove teal/water depth, one connected five-track UAE landscape, and a flagship Ghaf household
canopy. Motion explains praise → Seed → Mangrove/canopy/circle consequence and then stops; state
never waits on animation.

**Pre-implementation audit**: `PASSED`; remediation is captured in `plan.md` and `tasks.md`.

## Post-implementation audit — 2026-08-27 final source

All ten authored routes now exist. The source and Expo Design System drift scans plus the Impeccable
detector were rerun after the final mounted-reset fix. Fresh 390×844 Firefox Arabic and English
journeys and branch frames were captured from the final bundle. Android conformance and native
accessibility are never inferred from either source or web evidence.

### Before and after

| Area                | Before Feature 003                                                                                    | Current checkpoint                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product composition | Feature 002 food-rescue route composition; no family garden, circle, or bounded family-task semantics | Exactly ten Family Growth Garden routes with one deterministic Parent → Child → recognition → garden → circle spine                                                                   |
| Visual hierarchy    | Coherent inherited palette but missing the approved Parent/Child landscape hierarchy                  | One dominant action per sampled screen; calm Parent ledger surfaces; more illustrated Child/garden payoff; praise precedes consequence                                                |
| Dashboard shape     | Legacy mission/product blocks                                                                         | One combined canopy, distinct next actions/support, own-goal Child progress, and coarse cooperative circle without raw sibling comparison                                             |
| UAE visual world    | Ghaf illustration only                                                                                | Flagship Ghaf plus connected Mangrove, Samar, Sidr, and date-palm tracks; landscape is described as inspired/symbolic rather than one literal habitat                                 |
| Assistant presence  | Generation-oriented Feature 002 presentation                                                          | Task-local prepared Guide/Coach surfaces with explicit intent, origin, fallibility, Parent ownership, and adult exit; no face/avatar or open chat shell                               |
| Reward feel         | Previous completion treatment                                                                         | Fixed 12 Seeds, action-specific praise, restrained cause/effect, static 60/60 Sapling state, permanent canopy leaf, and coarse 12/12 action—not coins, confetti, rank, or scarcity    |
| Token drift         | 13 illustration-local hard-coded colors; otherwise coherent system                                    | Zero hard-coded hex, numeric typography/spacing/radius escapes, or legacy shadow/elevation hits outside the single token entry                                                        |
| System states       | Missing Feature 003 busy/fallback/reset/media/announcement contracts                                  | Shared busy/disabled/pressed/focus buttons, bounded editor states, reset confirmation, prepared-media removal/fallback, deny-by-default circle fallback, and live-region outcome text |

### Expo Design System drift scan

Source directories: `app`, `src`
Theme entry: `src/design/tokens.ts`
Styling idiom: React Native `StyleSheet`; no NativeWind/Tamagui/Restyle/Unistyles/styled-components
layer was added

```text
TypeScript/TSX SLOC:                 15,659
Hard-coded hex outside theme:       0
Raw numeric fontSize outside theme: 0
Raw numeric spacing outside theme:  0
Raw numeric borderRadius:           0
Legacy shadow/elevation:            0
Theme entry candidates:             1
```

| Category       | Escapes | Score per 100 SLOC | Reading |
| -------------- | ------: | -----------------: | ------- |
| Colors         |       0 |                0.0 | Healthy |
| Typography     |       0 |                0.0 | Healthy |
| Spacing        |       0 |                0.0 | Healthy |
| Radius/shadows |       0 |                0.0 | Healthy |

The theme now provides the approved Mangrove/water/coral roles, 20dp screen padding, named 4–56dp
spacing scale, shared type/line-height ramp, 48dp touch target, continuous low radii, rare
`boxShadow` elevation, and 120/220/650ms motion values. No competing theme or UI framework exists.

Representative static contrast calculations for actual token pairs were:

| Pair                      |   Ratio |
| ------------------------- | ------: |
| `ink` / `ivory`           | 13.80:1 |
| `inkMuted` / `ivory`      |  5.25:1 |
| `white` / `ghaf`          |  6.68:1 |
| `forest` / `leafLight`    | 10.08:1 |
| `danger` / `dangerLight`  |  5.33:1 |
| `mangrove` / `waterLight` |  4.98:1 |

These sampled source ratios satisfy AA for normal text where used, but they do not replace native
screen/device contrast observation.

### Shared-component contract checkpoint

Fourteen shared TSX files now cover the common structure. Representative contracts inspected:

| Surface                            | Variants/structure                                                                                              | States and accessibility                                                                                              | Result                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `Screen` + `Text`                  | One safe-area/readable-column shell; shared type roles; logical locale alignment                                | Keyboard-aware option, scroll/static modes, Arabic/English accessibility language, header semantics for display/title | Source **PASS**; IME/200% native test open                  |
| `Button` / `IconButton`            | Primary, secondary, quiet/ghost intent; style override merged last                                              | 48dp minimum, pressed transform/opacity, disabled and busy blocking, focus ring, role/state                           | Source **PASS**                                             |
| `Input`                            | Token typography, direction, helper/error composition                                                           | 48dp minimum, focus/error boundary, accessibility label/state, polite error live region                               | Source **PASS**; native keyboard open                       |
| `LanguageSwitcher` / journey/reset | One bilingual language control, logical back direction, point-of-use prototype status, confirmed reset          | Selected/disabled semantics and no flag metaphor                                                                      | Source + web sample **PASS**; native Back open              |
| Task/recognition panels            | Named definition, steps, safety, praise, retry, future-phase components instead of route-local card duplication | Safety uses icon plus text; help/retry language is nonpunitive; recognition announcement tested                       | Source/test **PASS**                                        |
| Assistant/prepared media           | Composed bounded intents, original/proposed result, origin disclosure, media description/transcript/removal     | Loading/result/fallback live regions, adult exit, image error callback, optional evidence                             | Source/test/web sample **PASS**; native media open          |
| Garden/canopy/circle               | Five-track landscape, one household canopy, minimal coarse circle progress                                      | Stage/cause text does not depend on hue/motion; exact progress labels; deny-by-default fallback                       | Source/test/web sample **PASS**; native reduced motion open |

### Impeccable and screenshot finish pass

The final post-reset-fix mechanical detector returned JSON `[]`.

Final-bundle screens visually inspected:

- `output/playwright/feature003-audit/final3-entry-ar.png`
- `output/playwright/feature003-audit/final3-garden-ar.png`
- `output/playwright/feature003-audit/final3-circle-ar.png`
- `output/playwright/feature003-audit/final3-garden-en.png`
- `output/playwright/feature003-audit/final3-duplicate-ar.png`
- `output/playwright/feature003-audit/final3-reset-ar.png`
- `output/playwright/feature003-audit/final3-adjusted-child-ar.png`
- `output/playwright/feature003-audit/final3-retry-en.png`

The sampled frames preserve a clear primary axis, warm field-paper ground, botanical ink, scarce
gold rules, illustrated landscape depth, long-copy wrapping, and equivalent Arabic/English garden
meaning. They show no clipping/overlap in the captured viewport, stock desert image, emoji,
glassmorphism, neon game palette, generic AI avatar, podium, score grid, coin shower, or repeated
elevated-card wall. Arabic branch/back arrows point toward logical Back while the English retry
arrow mirrors left; final reset reported `lang=ar` and computed RTL, while the complete English
journey retained `lang=en` and computed LTR.

### Honest platform status

| Dimension                                                            | Current evidence                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Hierarchy, rhythm, unity, alignment                                  | **PASSED** in sampled 390×844 web frames and source system                     |
| Design-token adoption                                                | **PASSED** current source scan                                                 |
| Arabic/English long-copy wrapping                                    | **PASSED** sampled web frames; full 200% native case `NOT RUN`                 |
| Web console                                                          | 0 errors; 1 generated-bundle “unreachable code” warning recorded for follow-up |
| Android-native look/gesture/insets                                   | **BLOCKED**; no build/emulator/device was available                            |
| Dark appearance/tablet/orientation/multi-window                      | **NOT RUN** and outside the demonstrated P0 phone portrait evidence            |
| TalkBack, keyboard/IME, physical touch, reduced motion, native media | **NOT RUN**                                                                    |

**Final design-system/source audit**: `PASSED`; detector JSON `[]`.
**Final-bundle sampled web visual audit**: `PASSED` with the recorded generated-bundle warning.
**Android/platform acceptance**: `BLOCKED` and must not be inferred from the web/source pass.

## Professional MVP confirm round — 2026-08-28

The recovered worktree received a fresh dual-assessment critique, independent domain review, and
integrated confirm round using Impeccable, Expo Design System, Playwright, code review, and focused
RED→GREEN tests. The persisted critique trend improved from **25/40** at the baseline to **35/40**
after remediation, with **0 P0** and **0 P1** findings remaining in the inspected web/source
boundary:

- `.impeccable/critique/2026-08-28T09-02-16Z__app-index-tsx.md`
- `.impeccable/critique/2026-08-28T09-42-25Z__app-index-tsx.md`

The confirm round closed the previously recorded operational-middle defects: complete referential
validation before recognition, coherent alternative task versions, atomic Guide decisions and a
real 1500 ms deadline, lifecycle-derived Child actions, staged Parent prerequisites, explicit
assignment handoff, compact policy records, progressive Child definition/media detail, one changed
Mangrove hero plus four compact tracks, logical RTL accents, duplicate copy, and generic unsafe-copy
recovery. Required Parent safety text remains uncollapsed; the canonical Child definition remains
available in full behind a four-line disclosure rather than dominating the initial viewport.

Final exact evidence:

| Check                                         | Result                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Full suite                                    | **PASSED** — 17 files / 305 tests                                                                          |
| TypeScript, Expo lint, Prettier, diff hygiene | **PASSED**                                                                                                 |
| Expo static export                            | **PASSED** — 12 routes; `entry-09e5b5d373078942395b4f713ab42137.js`                                        |
| Impeccable source detector                    | **PASSED** — JSON `[]`                                                                                     |
| Arabic RTL + English LTR at 390×844           | **PASSED web proxy** — zero errors/overflow, one visible H1, zero measured controls under 44 CSS px        |
| Consequence/reset                             | **PASSED web proxy** — 60/60 Sapling, circle continuation, Arabic RTL `/` after reset and six Back actions |
| Console                                       | 0 errors; one generated Expo unreachable-code warning remains recorded                                     |

Confirm-round visual evidence:

- `output/playwright/feature003-audit/final/ar-child-task-collapsed.png`
- `output/playwright/feature003-audit/final/ar-garden.png`
- `output/playwright/feature003-audit/final/en-child-task-collapsed-final.png`

Physical Android, TalkBack, native Back/IME/media/reduced-motion/200% text, device performance, and
named Arabic/cultural/faith/safeguarding/sustainability/accessibility reviews remain
**BLOCKED**/**NOT RUN**. This confirm round does not upgrade those gates.

# Revision 1 Historical Evidence

> This audit validates the superseded 2026-08-28 ten-route implementation only. It does not validate
> Feature 003 Revision 2 access, navigation, League, Family Reward, typography, voice, or Stitch
> designs. Revision 2 evidence starts `NOT RUN`.
