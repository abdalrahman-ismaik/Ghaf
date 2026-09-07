# R003 First-run Experience Contract

**Authority:** user-authorized presentation refinement, 2026-09-06
**Owner:** `/root`
**Route impact:** none; all onboarding states remain inside `/`

## 2026-09-07 compact audio story correction

The six-state and three-pillar contracts below remain authoritative. Each existing photograph now
renders in its intended responsive 3:2 `cover` frame, revealing the already-curated combination of
wide establishing and close detail scenes. The original visible `1/6` plus six-dot progress row
returns directly above the lower navigation actions. It is direction-aware, explicitly controlled,
clear against the page, and never timed.

All six paired scripts are rewritten as a direct first-person welcome from the Ghaf Guide. The
exact centered visible title/body is also the prepared narration transcript. The Guide row is
removed. One high-contrast 48dp speaker icon over the photograph restarts the current clip.
Automatic playback waits for the current image and layout to settle and remains suppressed whenever
native assistive speech is active. Speech stops on step, locale, and onboarding exit; it never
changes reducer state. Browser refusal of pre-gesture audible autoplay is nonblocking, while the
speaker press must still attempt the packaged clip.

Prepared synthetic narration and one locally authored low-volume nature soundscape use the existing
`expo-audio` foreground player. Ambience loops only while onboarding is visible, ducks beneath
narration, yields to assistive speech, and stops on exit. The clips are bundled local assets with
recorded provenance and checksums. They add no microphone, recording, model/network request at
runtime, background listening/OS playback, provider state, or product authority.

## Product promise

The first launch should make Ghaf and its three competition pillars understandable before asking
the family to choose an access path. Six short moments tell one honest story: meet Ghaf, see Family
as the team, practise Sustainability through a safe approved action, use bounded AI for the next
step, receive help and Parent confirmation, then keep permanent symbolic growth in a private family
garden. The tone is vivid, warm, energetic, and child-welcoming rather than game-like, childish,
or behaviorist.

## State and navigation contract

| State            | Purpose                                                                        | Primary action               | Secondary action      | Exit                           |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------- | --------------------- | ------------------------------ |
| `intro`          | Introduce Ghaf as one private family story of action, safe AI, and growth      | Next                         | Pillars / Skip        | `family` or Welcome            |
| `family`         | Show that the family chooses, helps, and celebrates together                   | Next                         | Pillars / Back / Skip | `sustainability` or Welcome    |
| `sustainability` | Show one small safe Parent-approved household action at a time                 | Next                         | Pillars / Back / Skip | `ai` or Welcome                |
| `ai`             | Explain bounded approved-task help, fallibility, and the adult-help exit       | Next                         | Pillars / Back / Skip | `support` or Welcome           |
| `support`        | Show that permitted help keeps full credit and Parent confirmation is required | Next                         | Back / Skip           | `growth` or Welcome            |
| `growth`         | Show permanent private symbolic Garden growth without an impact claim          | Start Ghaf                   | Back                  | Existing Welcome access choice |
| `welcome`        | Preserve separate Parent and Child access                                      | Parent access / Child access | Language              | Existing access routes         |

The three pillar controls are accessible direct links to `family`, `sustainability`, and `ai`.
They do not mark onboarding complete and never select a role, approve a task, grant permission, or
enable an AI provider.

Onboarding completion is session-local and intentionally makes no production persistence promise.
An already-active Parent or Child session bypasses onboarding and keeps the existing redirect.
Skip is always visible. Reload may restore the first moment; the existing prototype disclosure
continues to describe this in-memory limitation. Reset remains deterministic and signed out.

## Splash and transition contract

- Expo's native splash continues to use the immutable official raster icon and local background.
- Once the React root mounts, the native splash yields to a branded app-owned splash. It remains
  until the four currently used local font files and nine-image signed-out onboarding/Welcome raster set
  settle and the user-requested 1,200 ms minimum has elapsed after native handoff, then closes on
  the next render frame with no fake percentage, remote request, or network claim.
- The official logo and leaf-shadow background settle before the native splash yields. Remaining
  signed-out photographs preload in one bounded batch. Garden, League, reveal, learning, Shared
  Growth, canopy, Circle, and prepared-media imagery never enters startup. Failures use the
  existing deterministic image fallback, warn once, and count as settled so startup never becomes
  an unusable dead end.
- The app-owned splash shows the official mark/name and one simple three-leaf indeterminate loop on
  the UI thread. It has no visible technical loading sentence or resource progress. Reduced motion
  keeps the leaves static; assistive technology receives a short localized loading label.
- A transition buffer may appear only when crossing Welcome → Parent access, Welcome → Child
  access, Welcome → an already-active Parent/Child experience, Parent access → Parent experience,
  or Child access → Child experience.
- Parent-to-Parent, Child-to-Child, bottom-tab, nested-screen, Back, and locale changes never show
  the transition buffer.
- Reduced motion removes travel/scale choreography and uses a direct short opacity handoff.
- Each approved major-section buffer dwells for 900 ms so its destination label is readable.
- Each approved major-section buffer also waits for only its immediate destination images:
  botanical avatars for access and field/task art for the Parent/Child experience. Deeper images
  remain lazy in their existing Expo Image consumers and are cached after first render.

## Visual and asset contract

Use the official raster Ghaf logo plus exactly seven local raster photographs added to the original
41-image library:

1. `onboarding-ghaf-intro` — a magnificent real Ghaf tree inviting a family into the product;
2. `onboarding-family` — several Ghaf saplings sharing one sheltering canopy as a family-team metaphor;
3. `onboarding-action` — a vivid safe household sustainability-action still life;
4. `onboarding-ai` — a restrained leaf-and-guided-path still life for bounded step support;
5. `onboarding-support` — a sheltered Ghaf seedling as a non-literal support metaphor;
6. `onboarding-growth` — a vivid seed-to-leaf botanical study that reads as symbolic growth;
7. `section-transition` — a quiet Ghaf leaf-shadow texture with open space for live status copy.

All generated assets follow Quiet UAE Botanical Editorial: natural warm light, tactile detail,
crop-safe composition, no people, faces, hands, readable text, logos, brands, UI, vectors, hazards,
fantasy effects, robot/companion imagery, or environmental-quantity claims. Copy, logo, progress,
pillar controls, and actions remain live.
The images are never mirrored for RTL and load through the existing local illustration registry.

## Layout, copy, and accessibility

- Arabic is first; English is equivalent, not a shortened alternate.
- Alexandria owns display text; Readex Pro owns body, status, and controls.
- One dominant action per onboarding moment, minimum 48 dp targets, visible progress (`1/6` plus
  six dots) directly above the navigation actions, resilient wrapping at 320 and 390 widths, and
  no horizontal swipe dependency. A thin nonsemantic image-edge stroke echoes the same explicit
  six-step state, beginning at the lower center and completing the rounded perimeter on the last
  photograph.
- Every meaningful photograph has localized alternative text. Decorative transition texture is
  hidden from accessibility. Step changes use a polite live-region announcement.
- The final Welcome retains the visible local/synthetic prototype disclosure and distinct Parent
  and Child actions; onboarding does not grant either role.

## Acceptance and evidence

- Source and flow tests prove six ordered states, closed pillar jumps, skip/back/next/start, exact route count,
  active-session bypass, no new authority, local raster mapping, and bounded transition groups.
- Arabic RTL and English LTR are inspected at 320×720 and 390×844 with standard and reduced motion;
  text must wrap without clipping or horizontal overflow.
- Automated and web-proxy evidence cannot pass physical Android splash timing, TalkBack, native
  font scale, or named Arabic/UAE/accessibility review. Those remain `BLOCKED` or `NOT RUN` until
  directly observed.
