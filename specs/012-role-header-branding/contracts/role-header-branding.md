# Contract: Role Header Branding

## Source

- The only permitted header logo source is the current official local Ghaf raster mark.
- The shared raster component owns source resolution, aspect fit, cache policy, and decode fallback.
- No header may embed a URI, duplicate the source declaration, or alter the image pixels.

## Composition

- Parent dashboard/tab, Child dashboard/tab, ordinary flow, and R002b nested headers render one
  shared compact mark/title composition.
- Journey-style screen headers render the same raster mark within their title composition.
- Access, onboarding, splash, dialog, sheet, and bottom-navigation components are outside this
  contract and retain their current treatment.

## Accessibility

- The visible localized title is the only heading in the composition.
- The adjacent mark is decorative and excluded from the accessibility tree.
- Existing Back and action labels, roles, states, hit slop, and touch targets are unchanged.

## Responsive and Bidi

- Mark/title order follows logical direction; the mark pixels are never mirrored.
- The mark cannot grow from font scaling and remains subordinate to the title.
- The title region can shrink and wrap; it is not forced to one line.
- Existing fixed control slots remain available at 320 dp and enlarged text sizes.

## Failure

- Logo decode failure does not hide the title, controls, or content.
- The header performs no network request and exposes no loading or error workflow.
