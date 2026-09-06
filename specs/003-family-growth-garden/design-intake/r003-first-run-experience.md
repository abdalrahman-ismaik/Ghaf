# R003 First-run Experience Contract

**Authority:** user-authorized presentation refinement, 2026-09-06
**Owner:** `/root`
**Route impact:** none; all onboarding states remain inside `/`

## Product promise

The first launch should make Ghaf understandable before asking the family to choose an access
path. Four short moments tell one honest story: understand Ghaf, choose a safe approved action,
receive help and Parent confirmation, then keep permanent symbolic growth in a private family
garden. The tone is vivid, warm, energetic, and child-welcoming rather than game-like, childish,
or behaviorist.

## State and navigation contract

| State     | Purpose                                                                        | Primary action               | Secondary action | Exit                           |
| --------- | ------------------------------------------------------------------------------ | ---------------------------- | ---------------- | ------------------------------ |
| `intro`   | Explain that Ghaf turns small family actions into private symbolic growth      | Next                         | Skip             | `choose` or Welcome            |
| `choose`  | Show that a Child chooses among Parent-approved real-world actions             | Next                         | Back / Skip      | `support` or Welcome           |
| `support` | Show that permitted help keeps full credit and Parent confirmation is required | Next                         | Back / Skip      | `growth` or Welcome            |
| `growth`  | Show permanent private symbolic Garden growth without an impact claim          | Start Ghaf                   | Back             | Existing Welcome access choice |
| `welcome` | Preserve separate Parent and Child access                                      | Parent access / Child access | Language         | Existing access routes         |

Onboarding completion is session-local and intentionally makes no production persistence promise.
An already-active Parent or Child session bypasses onboarding and keeps the existing redirect.
Skip is always visible. Reload may restore the first moment; the existing prototype disclosure
continues to describe this in-memory limitation. Reset remains deterministic and signed out.

## Splash and transition contract

- Expo's native splash continues to use the immutable official raster icon and local background.
- Once the React root mounts, the native splash yields to a branded app-owned splash. It remains
  until local fonts and every statically registered runtime raster settle and the user-requested
  1,200 ms minimum has elapsed, then closes on the next render frame with no fake percentage,
  remote request, or network claim.
- The official logo and leaf-shadow background settle before the native splash yields. Remaining
  raster modules preload in bounded batches. Failures use the existing deterministic image
  fallback, warn once, and count as settled so startup never becomes an unusable dead end.
- The app-owned splash shows real resource-derived progress with a subtle Ghaf growth pulse and
  centered seed-line animation on the UI thread. Reduced motion keeps a calm static mark and
  progress state without spatial looping.
- A transition buffer may appear only when crossing Welcome → Parent access, Welcome → Child
  access, Welcome → an already-active Parent/Child experience, Parent access → Parent experience,
  or Child access → Child experience.
- Parent-to-Parent, Child-to-Child, bottom-tab, nested-screen, Back, and locale changes never show
  the transition buffer.
- Reduced motion removes travel/scale choreography and uses a direct short opacity handoff.
- Each approved major-section buffer dwells for 900 ms so its destination label is readable.

## Visual and asset contract

Use the official raster Ghaf logo plus exactly five local raster photographs added to the original
41-image library:

1. `onboarding-ghaf-intro` — a magnificent real Ghaf tree inviting a family into the product;
2. `onboarding-action` — a vivid safe household sustainability-action still life;
3. `onboarding-support` — a sheltered Ghaf seedling as a non-literal support metaphor;
4. `onboarding-growth` — a vivid seed-to-leaf botanical study that reads as symbolic growth;
5. `section-transition` — a quiet Ghaf leaf-shadow texture with open space for live status copy.

All generated assets follow Quiet UAE Botanical Editorial: natural warm light, tactile detail,
crop-safe composition, no people, faces, hands, readable text, logos, brands, UI, vectors, hazards,
fantasy effects, or environmental-quantity claims. Copy, logo, progress, and controls remain live.
The images are never mirrored for RTL and load through the existing local illustration registry.

## Layout, copy, and accessibility

- Arabic is first; English is equivalent, not a shortened alternate.
- Alexandria owns display text; Readex Pro owns body, status, and controls.
- One dominant action per onboarding moment, minimum 48 dp targets, visible progress (`1/4` plus
  dots), resilient wrapping at 320 and 390 widths, and no horizontal swipe dependency.
- Every meaningful photograph has localized alternative text. Decorative transition texture is
  hidden from accessibility. Step changes use a polite live-region announcement.
- The final Welcome retains the visible local/synthetic prototype disclosure and distinct Parent
  and Child actions; onboarding does not grant either role.

## Acceptance and evidence

- Source and flow tests prove four ordered states, skip/back/next/start, exact route count,
  active-session bypass, no new authority, local raster mapping, and bounded transition groups.
- Arabic RTL and English LTR are inspected at 320×720 and 390×844 with standard and reduced motion;
  text must wrap without clipping or horizontal overflow.
- Automated and web-proxy evidence cannot pass physical Android splash timing, TalkBack, native
  font scale, or named Arabic/UAE/accessibility review. Those remain `BLOCKED` or `NOT RUN` until
  directly observed.
