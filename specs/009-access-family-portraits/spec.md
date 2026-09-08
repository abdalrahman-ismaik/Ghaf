# Feature Specification: Access Family Portraits

**Feature Branch**: `009-access-family-portraits`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "Make the images on Parent-or-Child selection and Parent access use
a 3:2 ratio. Add a fictional Emirati woman wearing a traditional abaya and hijab beside the
existing Parent, and add an image of a fictional Emirati boy and girl in traditional clothes to
Child login."

## User Scenarios & Testing

### User Story 1 - Recognize the two access paths at a glance (Priority: P1)

A signed-out family sees a calm 3:2 Ghaf habitat image before the existing Parent and Child access
actions. Choosing Child then shows one 3:2 image of a fictional Emirati boy and girl before the
existing synthetic Child profile choices.

**Why this priority**: The added composition makes the Child entry feel intentional and culturally
grounded without adding another decision, screen, or authentication concept.

**Independent Test**: Complete first-run onboarding, inspect Welcome and Child profile access in
Arabic and English at 320dp and 390dp, and confirm that both image frames remain 3:2 while every
existing action stays reachable.

**Acceptance Scenarios**:

1. **Given** first-run onboarding is complete and no role is active, **when** Welcome renders,
   **then** its existing local habitat hero is displayed in a responsive 3:2 frame above the
   unchanged Parent and Child actions.
2. **Given** the family opens Child access, **when** the profile chooser renders, **then** one local
   3:2 photograph-like image shows exactly one fictional Emirati boy and one fictional Emirati girl
   in respectful traditional clothing before the profile choices.
3. **Given** the generated Child image cannot decode, **when** Child access renders, **then** the
   image disappears cleanly and every profile choice remains usable.

---

### User Story 2 - See Emirati mothers and fathers represented in Parent access (Priority: P1)

A Parent sees one shared 3:2 image of two fictional Emirati adults across Parent sign-in, sign-up,
and verification: a father in traditional attire and a mother in a traditional abaya and hijab.

**Why this priority**: Showing both adults broadens the Parent-facing welcome while preserving one
compact, coherent visual and the existing deterministic access flow.

**Independent Test**: Open Parent sign-in, sign-up, and verification in both locales; verify the
same local two-adult composition, exact 3:2 frame, safe crop, and unchanged form actions.

**Acceptance Scenarios**:

1. **Given** a signed-out family opens any Parent access route, **when** the route renders, **then**
   the shared local portrait frame is exactly 3:2 and shows exactly one fictional Emirati father
   and one fictional Emirati mother.
2. **Given** the Parent composition includes the mother, **when** it is inspected, **then** her
   clothing is a respectful traditional abaya with a hijab and contains no brand, readable text,
   product state, or identity claim.
3. **Given** the Parent portrait cannot decode, **when** a Parent access route renders, **then** the
   portrait disappears cleanly and sign-in, sign-up, or verification remains usable.

---

### User Story 3 - Keep portraits truthful, safe, and offline (Priority: P2)

A judge can understand that both family compositions are fictional, decorative, locally bundled
presentation candidates. They never identify the current user, select a profile, prove Emirati
identity, or affect access and progress.

**Why this priority**: Child imagery and culturally specific attire require an explicit boundary
so visual polish cannot be confused with real family data, biometric access, or a universal claim
about Emirati families.

**Independent Test**: Inspect the image components, asset provenance, startup preload, offline
rendering, accessibility tree, and access-state tests; confirm zero network, identity, selection,
or state authority.

**Acceptance Scenarios**:

1. **Given** either portrait is visible, **when** a screen reader traverses the access screen,
   **then** the decorative image is excluded and the existing heading and controls remain the
   meaningful accessible content.
2. **Given** the device is offline, **when** Welcome, Parent access, or Child access opens, **then**
   every image resolves locally and no image request is made.
3. **Given** a person taps either portrait, **when** the tap completes, **then** no role, profile,
   credential, session, task, Seed, Garden, League, Circle, reward, or assistant state changes.
4. **Given** the exact Parent-authorized prototype reset completes, **when** Arabic Welcome
   returns, **then** the same packaged images remain available while all access state resets as
   before.

### Edge Cases

- At 320dp width and 200% text size, each 3:2 image may scroll with the rest of the route but must
  not compress or cover the access controls.
- Arabic RTL and English LTR use the same nondirectional centered crops; neither asset is mirrored.
- The two-child composition must avoid adult-coded styling, unsafe props, physical contact that
  could be misread, school/location identifiers, or resemblance claims about the seeded profiles.
- The two-adult composition must avoid wedding, legal relationship, wealth, religiosity, or family-
  structure claims; the subjects are simply Parent-facing presentation candidates.
- A load failure must remove only the failed image frame, without reserving blank height, showing a
  broken-image icon, or blocking navigation.

## Requirements

### Functional Requirements

- **FR-001**: The existing Welcome habitat image frame MUST use a responsive width with an exact
  `3 / 2` aspect ratio and MUST NOT retain a fixed height.
- **FR-002**: Parent sign-in, sign-up, and verification MUST share one responsive `3 / 2` local
  portrait frame with no compact fixed-height exception.
- **FR-003**: The Parent asset MUST show exactly two fictional synthetic adults: one Emirati father
  in respectful traditional attire and one Emirati mother wearing a traditional abaya and hijab.
- **FR-004**: Child profile access MUST add one responsive `3 / 2` local portrait frame before the
  existing profile-choice list.
- **FR-005**: The Child asset MUST show exactly two fictional synthetic children: one Emirati boy
  and one Emirati girl in respectful, age-appropriate traditional clothing.
- **FR-006**: Both generated compositions MUST use a calm natural UAE/Ghaf setting, centered crop-
  safe subjects, realistic anatomy and fabric, restrained natural light, and no readable text,
  logos, screens, task evidence, rewards, private data, or product-state claim.
- **FR-007**: Generated images MUST be stored as opaque 1200×800 local assets, stripped of source
  metadata, kept below 500,000 bytes each, and accompanied by exact prompt, transformation,
  checksum, route, authority, accessibility, and review-status provenance.
- **FR-008**: Existing assets MUST NOT be destructively overwritten; the revised Parent composition
  MUST use a versioned sibling path and the original single-father provenance MUST remain truthful.
- **FR-009**: Access portraits MUST use the existing Expo Image dependency with `cover`, centered
  positioning, local memory/disk caching, reduced-motion-aware transition, and a stable recycling
  key.
- **FR-010**: Each portrait component MUST be decorative, hidden from the accessibility tree,
  non-interactive, and remove its complete frame after an image error.
- **FR-011**: Image preload MUST include the two generated access assets without making their load
  a blocking requirement for app startup or any access action.
- **FR-012**: The feature MUST NOT change routes, access actions, credentials, remembered-device
  behavior, Parent/Child separation, local-family data, reset, task/progress authorities, or
  bilingual copy.
- **FR-013**: The compositions MUST NOT claim to depict the current synthetic household, verify
  identity or nationality, or represent a universal Emirati family appearance.
- **FR-014**: Named Emirati cultural, Arabic/UAE, safeguarding, accessibility, visual, and image-
  rights reviews MUST remain `NOT RUN` until directly performed; physical Android rendering MUST
  remain unclaimed until directly evidenced.

### Key Entities

- **Parent Access Composition**: One versioned local decorative 3:2 asset showing two fictional
  adults and carrying no account or identity authority.
- **Child Access Composition**: One local decorative 3:2 asset showing two fictional children and
  carrying no profile-selection or Child-state authority.
- **Access Portrait Frame**: A failure-safe, non-interactive, accessibility-hidden presentation
  boundary that derives height only from width and a 3:2 ratio.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Welcome, all three Parent access routes, and Child profile access render their
  intended image at an exact 1.5 width-to-height ratio at both 320dp and 390dp viewport widths.
- **SC-002**: Asset inspection finds exactly two adults in the Parent composition and exactly two
  children in the Child composition, with the requested traditional clothing and zero prohibited
  text, logo, device, unsafe prop, or product-state element.
- **SC-003**: Source and behavior tests find zero remote image URLs, zero portrait press handlers,
  zero accessibility exposure, and zero access/store mutation originating from portrait code.
- **SC-004**: Image decode failure leaves 100% of existing Welcome, Parent access, and Child profile
  actions reachable with no blank portrait frame.
- **SC-005**: Arabic and English compact-screen review finds no horizontal overflow, clipped access
  action, or image mirroring at 320×720 and 390×844.
- **SC-006**: Existing remembered-device, Parent/Child isolation, onboarding, access, and reset
  regression suites retain their previous outcomes.

## Assumptions

- “Parent or Child selection screen” refers to the signed-out Welcome decision where the existing
  Parent and Child actions appear below the habitat hero.
- “Parent screen” refers to the shared visual used across Parent sign-in, sign-up, and verification,
  matching the previously requested Parent-login treatment.
- The existing fictional father may be used as an image-editing reference, but the new two-adult
  result is a distinct versioned asset rather than a modification of the original file.
- The Child image is one boy-and-girl composition rather than separate profile portraits; existing
  tree avatars remain the profile controls and continue to prevent face-based identification.
- Generated imagery is a competition presentation candidate subject to named human review before
  any public cultural-accuracy or image-rights claim.
