# R003 Natural Botanical Artwork Refresh

**Authority**: User-authorized presentation replacement, 2026-09-06

**Direction**: Quiet UAE Botanical Editorial

## Boundary

Replace scenic, decorative, botanical-state, profile-choice, task, learning, reveal, and shared
growth drawings with generated local raster imagery. Preserve the official Ghaf logo/wordmark,
platform icons, small functional icons, selection/focus rings, semantic controls, live progress
geometry, route/state/domain behavior, reset, privacy, and default-off flags. Remove the Private
League watermark without adding a competing hero image.

Every image is opaque, contains no UI copy, and is composed nondirectionally so it is never mirrored
between Arabic RTL and English LTR. Photography is calm and credible: tactile bark, leaf, seed,
sand, or shallow-water detail; warm Pearl/Ivory ground; restrained Ghaf Emerald, Deep Forest,
Mangrove Teal, Sand, and Earth; soft early-morning UAE light; natural asymmetry. Exclude vector or
painted styling, 3D/plastic rendering, fantasy glow, perfect symmetry, repeated foliage, people,
children, faces, hands, buildings, cars, readable text, logos, brands, watermarks, litter, and unsafe
objects.

## Exact asset manifest

| Family | IDs | Count | Source target | Presentation |
| --- | --- | ---: | --- | --- |
| Field | `field-paper` | 1 | 1440×2560 | very low-contrast full-screen texture |
| Welcome | `welcome-ghaf-habitat` | 1 | 1536×1024 | crop-safe 3:2 hero |
| Profile choices | `avatar-ghaf`, `avatar-leaf`, `avatar-flower`, `avatar-energy-leaf`, `avatar-water-drop` | 5 | 512×512 each | circle-safe botanical macro |
| Task | `task-recycling` | 1 | 1536×640 | clean sorted household recyclables, no hands |
| Garden | `{ghaf,samar,sidr,date-palm,mangrove}-{seed,shoot,sapling,shade,flourishing}` | 25 | 1408×832 each | exact 176:104 stage frame; distinct source per state |
| Family canopy | `family-canopy-19`, `family-canopy-20` | 2 | 1440×1040 each | same composition; exact data-selected state |
| Circle | `circle-garden-1`, `circle-garden-2`, `circle-garden-3` | 3 | 832×656 each | anonymous, equal-weight habitat scenes |
| Reveal | `recognition-reveal` | 1 | 1024×1024 | centered natural sunlight/water response |
| Learning | `mangrove-habitat` | 1 | 1536×960 | atmospheric supporting study; lesson stays live text |
| Shared Growth | `shared-coastal-canopy` | 1 | 1536×960 | anonymous coastal canopy, no counts or identity |

Total: **41** local generated assets.

## State and accessibility contract

- Literal static source mappings are the only runtime asset authority; no constructed paths or
  remote fallback.
- Informative images receive concise bilingual labels and a localized deterministic unavailable
  fallback. Decorative field, Welcome, and task-support imagery is hidden from assistive technology
  when adjacent live text already provides all meaning.
- Profile images remain inside semantic radio controls; selected, focused, pressed, and disabled
  state stays native and is never encoded only in the photograph.
- Allowlisted private-League tree-avatar tokens reuse the same local profile photographs inside the
  existing semantic rows; the imagery adds no identity or projection field.
- Garden, canopy, and Circle labels/progress remain live text and progress semantics. Images never
  calculate, award, or prove a Seed, Leaf, stage, activity, learning result, or environmental impact.
- Reduced motion disables decorative crossfade. Image failure leaves the action, explanation, and
  state usable.

## Provenance and review

Each shipping file records its exact prompt, generator, generation date, source dimensions,
shipping dimensions and format, crop/resize/compression/metadata transformations, SHA-256 checksum,
routes/states, accessibility mode, and review status. Fail closed for malformed or repeated
botanical details, impossible growth transitions, unwanted people/text/logos/hazards, unsafe crop,
directional composition, unsupported ecological implication, or missing provenance.

Automated and web evidence may verify local loading, mappings, dimensions, checksums, semantics,
copy separation, route preservation, crop, and overflow. They do not pass physical Android,
TalkBack, botanical/cultural/safeguarding review, image rights review, or measured environmental
accuracy; those remain separate named evidence gates.
