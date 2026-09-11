# Research: Access Family Portraits

## Decision 1: Use one two-adult Parent composition

- **Decision**: Generate a versioned 3:2 composition that keeps the visual character of the current
  father and adds one fictional Emirati mother in traditional abaya and hijab.
- **Rationale**: One frame fulfills the representation request across three compact form routes
  without stacking two large images or adding a carousel, pagination, timing, or new interaction.
- **Alternatives rejected**: Two stacked portraits consume too much 320dp vertical space; a
  carousel hides one Parent and adds motion/control semantics; replacing the father with only a
  woman would not satisfy “also add.”

## Decision 2: Keep Child imagery separate from profile controls

- **Decision**: Place one decorative boy-and-girl composition between the Child access hero and
  the existing tree-avatar profile list.
- **Rationale**: The image gives the requested cultural presentation while botanical avatars stay
  the clear, accessible, privacy-protecting selection controls.
- **Alternatives rejected**: Face portraits inside profile buttons imply the generated faces are
  Salem/Alya or support facial identity; separate boy/girl buttons couple fictional appearance to
  credentials.

## Decision 3: Derive frame height from `aspectRatio`

- **Decision**: Use `width: '100%'` and `aspectRatio: 3 / 2` with no fixed height or compact height.
- **Rationale**: React Native computes a consistent 3:2 frame at every content width, and existing
  scroll/keyboard-aware access shells handle the additional vertical content.
- **Alternatives rejected**: Device-width calculations duplicate layout authority; fixed 168/148/
  112 heights visibly change ratio across content widths.

## Decision 4: Preserve the original Parent asset

- **Decision**: Store the new composition as `parent-access-emirati-family-v2.jpg`, update the
  source registry, and retain the v1 father image and history.
- **Rationale**: A versioned sibling preserves provenance and rollback while making the active
  source explicit.
- **Alternatives rejected**: Overwriting v1 would make its checksum and one-subject provenance
  false; deleting it would remove auditability.

## Decision 5: Keep both portraits non-blocking and non-critical

- **Decision**: Add each source only to its destination section preload. Components catch decode
  failure and return no frame.
- **Rationale**: Portraits are polish, not access prerequisites; section preloading improves the
  transition without extending the signed-out startup gate.
- **Alternatives rejected**: Startup-critical loading delays the demo for decorative content;
  placeholder identity art could confuse users after a failure.

## Decision 6: Treat generation as candidate evidence

- **Decision**: Use built-in image generation, inspect results, normalize locally, embed the exact
  prompt, and record all named human reviews as `NOT RUN`.
- **Rationale**: Synthetic imagery meets the competition prototype boundary while cultural and
  image-rights accuracy cannot be promoted without qualified review.
- **Alternatives rejected**: Stock photography adds licensing and real-person issues; code-native
  figures would not meet the requested generated-image quality; an unlabeled asset lacks audit
  truth.
