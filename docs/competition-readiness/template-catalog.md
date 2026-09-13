# External template review for Ghaf

**Reviewed:** 2026-09-12. **Disposition:** reference analysis complete; no template code, artwork,
font, route, dependency, or product behavior imported. This is a design proposal, not a release
gate or an amendment to the active product specification.

The useful outcome of these archives is a clearer Ghaf screen system: a composed Parent workspace,
a task-led Child experience, and an expansive botanical Garden. Dailoz supplies the richest task
organization references; Edulive supplies finite learning hierarchy; Notes supplies editorial
rhythm; the transport concepts supply a spatial scene with an anchored detail surface. The bank
and wallet files are chiefly useful for identifying financial patterns Ghaf must avoid.

The recommended direction is **Family Field Journal** within the existing botanical system.
Ghaf should be recognizable through its UAE landscapes, Ghaf canopy, Arabic typography, and the
visible sequence from approved action to permanent growth. It should not resemble a recolored
finance, fitness, course, or transport template.

## Evidence and scope

The review covers **all 13 ZIP archives**, totaling **41,420,916 bytes**, in
[`assets/external templates and designs/`](../../assets/external%20templates%20and%20designs/).
Each contains one Sketch document plus a macOS metadata sidecar. No Figma file, executable app,
HTML export, package manifest, font binary, README, or standalone license was present.

Both the outer ZIP and the nested Sketch bundle were checked for traversal, absolute/drive paths,
backslash ambiguity, symlinks and special files, duplicate entries, encryption, declared expansion,
actual expansion, and compression ratio before extraction. The script also verifies ZIP CRCs by
reading each complete entry. Limits are 64 MiB per entry, 256 MiB per archive, 1 GiB across the
run, 20,000 entries per archive, and a 1,000:1 maximum ratio. All packages passed those checks;
actual extraction wrote **128,705,168 bytes**. No supplied code was executed and no application
dependencies were changed. For the final PDF pass, the official PyPI binary wheel of
**PyMuPDF 1.28.2** was installed only under the ignored review directory's `pdf-tools/`.

The nested bundles contain **175 files: 100 PNGs, 68 JSON files, and 7 PDFs**. Their page JSON
describes **116 artboards and 88 symbol masters**. These counts include presentation/creator
boards, duplicate states, and component canvases; they do not mean 116 distinct application
screens. Every outer and inner file has its size and SHA-256 recorded. Legacy Sketch attributed
strings were read as base64 property-list data, without instantiating archived classes.

Local review artifacts are intentionally ignored and are not distribution assets:

- [Machine inventory, file hashes, artboards, text, font references, and metadata](../../output/competition-readiness/template-review/inventory.json)
- [Compact archive inventory](../../output/competition-readiness/template-review/inventory.tsv)
- [Reproducible bounded extraction script](../../output/competition-readiness/template-review/inspect_archives.py)
- [PDF page inventory, extracted text, metadata, and render hashes](../../output/competition-readiness/template-review/pdf-inventory.json)
- [Bounded PDF inspection script](../../output/competition-readiness/template-review/inspect_pdfs.py)
- Embedded preview contact sheets: [1](../../output/competition-readiness/template-review/contact-sheet-1.jpg),
  [2](../../output/competition-readiness/template-review/contact-sheet-2.jpg),
  [3](../../output/competition-readiness/template-review/contact-sheet-3.jpg),
  [4](../../output/competition-readiness/template-review/contact-sheet-4.jpg)
- Embedded raster contact sheets: [1](../../output/competition-readiness/template-review/embedded-assets-1.jpg),
  [2](../../output/competition-readiness/template-review/embedded-assets-2.jpg),
  [3](../../output/competition-readiness/template-review/embedded-assets-3.jpg),
  [4](../../output/competition-readiness/template-review/embedded-assets-4.jpg)

Every embedded preview and all 87 additional embedded PNGs were visually inspected through those
contact sheets. Artboard names, layer text, and structure were inspected for every document.
All seven PDFs were subsequently rendered and their text and metadata inspected: **371 pages
passed**, comprising 370 cached text fragments and one checkerboard image. No PDF action was
executed or link followed. Sketch itself is unavailable: **fresh Sketch artboard rendering remains
NOT RUN**. Original PNG previews remain usable. The Bank preview covers only its QR artboard,
so its other screens are structural references, not visually validated screens. Small overview
previews, especially Dailoz, cannot establish typography or touch quality.

### Embedded PDF findings

All pages were rendered at at most 2× scale and 1024 pixels on the longest edge, with their source
hashes unchanged. The six `text-previews.pdf` documents contain individual cached layer labels,
not complete screens or reading documents. Some Wallet snippets are clipped at their source page
bounds; this is not evidence of how the full Sketch artboard would render. The PDF metadata has
no named author, and the extracted content adds no license or permission statement.

| Source archive          | Pages | Content and inspected evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Booking components      | 81    | Fare, passenger, trip, selection, and confirmation labels; [sheet 1](../../output/competition-readiness/template-review/pdf-review/booking-ui-components-hoangpts/contact-sheet-1.jpg), [sheet 2](../../output/competition-readiness/template-review/pdf-review/booking-ui-components-hoangpts/contact-sheet-2.jpg)                                                                                                                                                                                                                                                       |
| Fashion concept         | 9     | Product names, wordmark, and status time; [sheet](../../output/competition-readiness/template-review/pdf-review/concept-fashion-app-nkchaudhary01/contact-sheet-1.jpg)                                                                                                                                                                                                                                                                                                                                                                                                    |
| Edulive                 | 26    | Class/lesson labels and status, including reused incidental labels; [sheet](../../output/competition-readiness/template-review/pdf-review/edulive-learning-app-concept-atiqur-rahaman/contact-sheet-1.jpg)                                                                                                                                                                                                                                                                                                                                                                |
| Furniture kit           | 61    | Product names, prices, quantity, placeholder body, and action labels; [sheet 1](../../output/competition-readiness/template-review/pdf-review/furniture-app-full-ui-kit-atiqur-rahaman/contact-sheet-1.jpg), [sheet 2](../../output/competition-readiness/template-review/pdf-review/furniture-app-full-ui-kit-atiqur-rahaman/contact-sheet-2.jpg)                                                                                                                                                                                                                        |
| Notes concept           | 26    | Note headings, timestamps, filters, body placeholders, and actions; [sheet](../../output/competition-readiness/template-review/pdf-review/notes-app-concept-atiq31416/contact-sheet-1.jpg)                                                                                                                                                                                                                                                                                                                                                                                |
| Quickfit                | 1     | Small dark checkerboard image, no extractable text or usable UI composition; [render](../../output/competition-readiness/template-review/pdf-review/quickfit-app-shadhin/page-0001.png)                                                                                                                                                                                                                                                                                                                                                                                   |
| Virtual Currency Wallet | 167   | Currency values, transfer/contact labels, keypad glyphs, and history snippets; [1](../../output/competition-readiness/template-review/pdf-review/virtual-currrency-wallet-juraa/contact-sheet-1.jpg), [2](../../output/competition-readiness/template-review/pdf-review/virtual-currrency-wallet-juraa/contact-sheet-2.jpg), [3](../../output/competition-readiness/template-review/pdf-review/virtual-currrency-wallet-juraa/contact-sheet-3.jpg), [4](../../output/competition-readiness/template-review/pdf-review/virtual-currrency-wallet-juraa/contact-sheet-4.jpg) |

The full [page-by-page text extraction](../../output/competition-readiness/template-review/pdf-review/all-text.txt)
and original-size-bounded page renders remain local. PDF inspection confirms the catalog's
existing interpretation and does not add a new design direction or asset-adoption candidate.

The current [design rulebook](../DESIGN.md),
[botanical amendment](../../specs/003-family-growth-garden/spec.md), and
[runtime tokens](../../src/design/tokens.ts) remain visual authority. The approved Tamagui mapping,
Alexandria/Readex roles, Reanimated controls, botanical artwork, logical RTL helpers, existing
routes, and independent default-off flags are retained in this proposal.

## Archive catalog

Counts below are **artboards / symbol masters / inner files**. Attribution inferred only from an
archive name is marked as filename attribution; it is not verified authorship or permission.

| Archive                                           | Counts       | Strongest relevant reference                      | Transfer decision                                           |
| ------------------------------------------------- | ------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| `bank-mobile-app-template-gokul.zip`              | 20 / 52 / 17 | Account, budget, receipt, summary hierarchy       | Structural reference only; reject wallet framing            |
| `booking-ui-components-hoangpts.zip`              | 1 / 6 / 16   | Selection rows, confirmation/detail surfaces      | Recompose a small native state vocabulary                   |
| `concept-fashion-app-nkchaudhary01.zip`           | 2 / 1 / 17   | Image-led detail composition                      | Useful for Garden prominence; reject shopping language      |
| `dailoz-app-vektora-studio.zip`                   | 42 / 0 / 9   | Task workspace, filters, empty and editing states | Primary Parent Tasks structure reference                    |
| `edulive-learning-app-concept-atiqur-rahaman.zip` | 3 / 10 / 8   | Topic → finite ordered lesson list                | Primary gated learning structure reference                  |
| `furniture-app-full-ui-kit-atiqur-rahaman.zip`    | 9 / 1 / 19   | Scene → focused item detail                       | Useful for habitat/detail hierarchy                         |
| `lunar-calendar-mvu2501.zip`                      | 1 / 6 / 6    | Month grid → selected-date agenda                 | Calendar research only; scheduling is outside current scope |
| `music-player-app-atiq.zip`                       | 4 / 0 / 26   | Playback → expanded transcript                    | Prepared audio reference with explicit personal-use notice  |
| `notes-app-concept-atiq31416.zip`                 | 3 / 5 / 11   | Illustrated list → quiet reading/editor surface   | Editorial rhythm and media/transcript grouping              |
| `quickfit-app-shadhin.zip`                        | 8 / 2 / 11   | Short onboarding and single subject illustration  | Composition reference; reject body/performance scoring      |
| `sample-transport-app-xdionx.zip`                 | 4 / 0 / 8    | Full scene + anchored selection/action region     | Primary spatial/map structure reference                     |
| `uber-redesign-shadhin-arafat.zip`                | 9 / 3 / 16   | Progressive setup, map/search sheet               | Access pacing reference; reject tracking/social proximity   |
| `virtual-currrency-wallet-juraa.zip`              | 10 / 2 / 11  | Value, status, record hierarchy                   | Counterexample for Seeds and Family Rewards                 |

### 1. Bank mobile app — Gokul

[Preview](../../output/competition-readiness/template-review/extracted/bank-mobile-app-template-gokul/sketch/previews/preview.png)
· [Full parsed structure](../../output/competition-readiness/template-review/extracted/bank-mobile-app-template-gokul/structure.json).
Filename attribution: Gokul. Saved with Sketch 91. Two pages: Components and Banking App.

The 20 artboards cover splash, sign-up, sign-in, phone registration, verification, account-created,
Touch ID, PIN, home, summary, budget, budget details, detail/history, finance score, transfer,
receipt, expenses, account, card details, and QR. Most are 414×896/897; home and detail are longer.
The available 414×897 preview shows a centered QR/profile panel on a flat blue field, not the
entire UI kit. DM Sans, Aileron, and Roboto Condensed are referenced, not packaged.

Borrow the **one prominent value, explicit status, then supporting explanation** hierarchy for a
private Family Reward promise. Keep `Promised → Unlocked → Given` understandable and show who
acts next. Reject available-balance dashboards, payment cards, top-up, send, transfer, financial
health scores, spending judgments, and real-biometric implication. Seeds must not acquire a bank
balance appearance. The bundle includes third-party logos and portrait photographs with no
asset-specific provenance.

### 2. Booking UI components — Hoangpts

[Preview](../../output/competition-readiness/template-review/extracted/booking-ui-components-hoangpts/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/booking-ui-components-hoangpts/structure.json).
Filename attribution: Hoangpts. Sketch 63.1. One 2000×1500 component canvas and six symbols.

White compact panels sit on a vivid orange street pattern. The canvas includes passenger rows,
route/timeline rows, selected ride options, loading, cancellation confirmation, and ratings.
SF UI Display is referenced. This is a component study, not a navigable full app.

Borrow **consistent anatomy across normal, selected, busy, and confirmation states** and the
clear relationship between a selected option and the final action. Ghaf's help/completion-mode
choices can share one row grammar with explicit selection semantics. Reject star ratings of
Children, countdowns, cancellation penalties, card-number/payment controls, luxury-tier hierarchy,
and generic indefinite processing. Prepared AI should show its actual bounded state without
booking-style waiting theater.

### 3. Fashion concept — Nkchaudhary01

[Preview](../../output/competition-readiness/template-review/extracted/concept-fashion-app-nkchaudhary01/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/concept-fashion-app-nkchaudhary01/structure.json).
Filename attribution: Nkchaudhary01. Sketch 68.1. Two 375×812 artboards: Season Home and Season
Product, plus one symbol.

The overview combines a category strip with a two-column image catalog; the detail devotes most
of the screen to one photograph and anchors a rounded information/action surface below. Its
serif product titles, vertical brand labels, editorial models, commerce controls, and mixed font
families form a fashion world that Ghaf should not copy.

Borrow **one large image doing the explanatory work** on Garden and a clear image-to-detail
transition. Use Ghaf's own approved landscape rather than another framed thumbnail among many
cards. Reject sale labels, shopping baskets, wishlists, two-column dense text at 320dp, vertical
Arabic labels, fashionable thin type, and purchase calls to action. Photographs and brand marks
have no embedded reuse evidence.

### 4. Dailoz — Vektora Studio

[Preview](../../output/competition-readiness/template-review/extracted/dailoz-app-vektora-studio/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/dailoz-app-vektora-studio/structure.json).
Filename attribution: Vektora Studio. Sketch 75. One Raw File page, 42 artboards, generally
375×812; some artboards are duplicate presentations of a state.

This is the broadest state library: Home; Task; week/calendar selection; empty Task; Setting;
language/delete prompts; Completed/Pending/Canceled/On Going lists and overflow variants;
calendar and tag filters; Add Task, tag/time/date/description editors; Profile and board/logout
prompts; Personal/Work/Private/Meeting/Event categories; Graphic; Login/Signup/Splash; and detail.
The low-resolution overview is supported by parsed labels and frames. Roboto, DM Sans, and Inter
are referenced. Saturated status tiles and compact purple controls repeat throughout.

Borrow **stable task rows, clear scope filters, an always-findable creation action, contextual
editing, and honest empty states**. This aligns with the existing default-off
[Parent Task Workspace](../../specs/013-parent-task-workspace/spec.md), including All Children,
individual Child scope, prepared catalog, and saved wording. Preserve the distinction between
authoritative work and planning examples. Do not turn categories into separate routes.

Reject productivity-pressure headlines, urgent tags, red canceled/missed states, per-day graphs,
secret task types, reminder rings, automatic recurrence, and numerical task-performance tiles.
Neither this archive nor the current task workspace authorizes due dates or a calendar engine.
Do not copy a 42-screen workflow to solve Ghaf's one complete task journey.

### 5. Edulive — Atiqur Rahaman

[Preview](../../output/competition-readiness/template-review/extracted/edulive-learning-app-concept-atiqur-rahaman/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/edulive-learning-app-concept-atiqur-rahaman/structure.json).
Filename attribution: Atiqur Rahaman. Sketch 70.3. Splash, My Classroom, and My Classroom--Details;
three 375×812 artboards and ten symbols. Metropolis/October font references.

The overview uses illustrated horizontal subject panels with a visible status and directional
action. The detail keeps the subject illustration/header above a finite numbered lesson list.
An in-progress line belongs to one lesson. This is the clearest source for a **finite learning
package with visible contents**, rather than a content feed.

Adapt its subject → ordered material structure to the approved gated Mangrove package, keeping
the accessible equivalent equally prominent and carrying the exact named completion criterion.
Reject attendance counts, grade/course authority, trophy tabs, infinite discovery, and the
assumption that listening or elapsed playback earns credit. Learning creates zero Seeds or
Garden growth. The archive's lesson visuals are design references, not sourced educational
content or an approval to activate Growth flags.

### 6. Furniture UI kit — Atiqur Rahaman

[Preview](../../output/competition-readiness/template-review/extracted/furniture-app-full-ui-kit-atiqur-rahaman/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/furniture-app-full-ui-kit-atiqur-rahaman/structure.json).
Filename attribution: Atiqur Rahaman. Sketch 65.1. Eight mobile artboards plus one 1218×812 Scene
board; one symbol. Home/category, detail/quantity/checkout, and room-scan variants use Metropolis.

Muted object fields, generous subject scale, and restrained controls make this more useful for
**habitat selection and detail hierarchy** than its shopping purpose suggests. The room scene
also demonstrates how context can make a selected object understandable without a dashboard.

Use one landscape scene and a focused detail region, with stable text outside the image. Keep
approved five-track navigation accessible through a list as well as imagery. Reject scanning,
AR, object identification, pricing tags, quantity steppers, sale/cart affordances, and a grid
that makes habitats look purchasable. The staged room photos and product cutouts have no named
image license in the bundle and should not enter Ghaf.

### 7. Lunar Calendar — Mvu2501

[Preview](../../output/competition-readiness/template-review/extracted/lunar-calendar-mvu2501/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/lunar-calendar-mvu2501/structure.json).
Filename attribution: Mvu2501. Sketch 49.1. One 375×667 artboard and six symbols.

The compact month grid uses paired day values, a selected-day capsule, event dots, and an agenda
row below. Its Vietnamese weekday labels and March 2018 content show that “lunar” here is not
evidence of a Hijri calendar. Archived text/font data was recovered; no Arabic behavior was
present in the preview.

Borrow **month context → selected day → agenda** only if a separately approved scheduling
feature eventually needs it. A default agenda/list view would be more resilient than fitting
seven 48dp targets inside a 320dp phone's content width. Reject importing the date system,
weekday order, weekend styling, tiny secondary numerals, and blue-purple gradient as Ghaf
decisions. Current Family rhythms are descriptive, with no date, reminder, overdue state,
calendar entry, or proof of contact; this review does not change that boundary.

### 8. Music player — Atiq

[Preview](../../output/competition-readiness/template-review/extracted/music-player-app-atiq/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/music-player-app-atiq/structure.json).
The creator board names **Atiqur Rahaman**, `atiq31416`, and `www.atiq.info`. Sketch 71.2. Four
artboards: Creator, Home, Now Playing, and Now Playing--Lyrics; three mobile surfaces at 375×812.

Useful patterns are **one current media item, an unmistakable play state, and an expandable
transcript**. The discovery shelves and persistent mini-player are secondary. Ghaf can use
the content/control separation for existing prepared narration and Coach replay, with the exact
visible transcript and no expectation of real recording.

The creator board explicitly states **“Completely free for personal use.”** That statement is
not permission for commercial redistribution or a license for the album artwork, photographs,
lyrics, and third-party marks. Treat the entire bundle as reference-only. Reject streaming
discovery, autoplay-next, social listening, lyrics, album art, attention-retaining carousels,
and decorative waveforms that suggest a recording or live AI response.

### 9. Notes concept — Atiq31416

[Preview](../../output/competition-readiness/template-review/extracted/notes-app-concept-atiq31416/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/notes-app-concept-atiq31416/structure.json).
Filename attribution: Atiq31416. Sketch 68.1. Splash, Home, and Details at 375×812; five symbols.
Metropolis is referenced.

The illustrated opening, mixed text/image/audio list, quiet detail view, and clear note title
offer a useful **field-journal reading rhythm**. Borrow the measured alternation of subject image,
short explanation, and a simple next action. A Parent summary should read as a short useful
account of an action, not as analytics.

Reject unrestricted Child notes/chat, location reminders, invisible background capture,
photo/voice collection, extensive formatting tools, and the floating Create button if it covers
long Arabic content. Existing Parent wording templates remain Parent-only and bounded. The
landscape illustrations are not UAE-specific, and neither their origin nor the portrait's rights
is established by this archive.

### 10. Quickfit — Shadhin

[Preview](../../output/competition-readiness/template-review/extracted/quickfit-app-shadhin/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/quickfit-app-shadhin/structure.json).
Filename attribution: Shadhin. Sketch 50. Eight 375×812 artboards: launch, four tour moments,
login/sign-up landing, login, and dashboard; two symbols.

The tour presents one large subject against a consistent full-height color field with short
copy and a visible Skip/Next path. Borrow **one concept per onboarding moment** and consistent
subject scale. Ghaf already has a six-moment approved onboarding journey; the reference does
not justify replacing its step count, photography, narration, or progress behavior.

Reject calorie targets, goal rings, distance/time graphs, body scoring, “things look alright”
assessment, diet planning, unverified Face ID/fingerprint actions, saturated cyan chrome, and
an athletic-performance identity. These conflict with Ghaf's autonomy, safety, and food rules.
The embedded fitness photographs and legacy font references are not import candidates.

### 11. Sample Transport — Xdionx

[Preview](../../output/competition-readiness/template-review/extracted/sample-transport-app-xdionx/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/sample-transport-app-xdionx/structure.json).
Filename attribution: Xdionx. Sketch 45.1. Four 414×736 artboards: Home, Search, Map, and
Announcement. Archived attributed strings expose Poppins and SF UI font references.

The large, pale map keeps an anchored lower selection/action region while search becomes a
separate readable list above the keyboard. This is the strongest **spatial overview with a
focused detail region** reference. Ghaf's selected landscape can occupy the same strong visual
position without filling the screen with metric cards.

Reject current-location pins, route ETA, distance, “nearby” claims, fare/payment controls, driver
contact, promotional feeds, and off-the-shelf street maps. An Impact Path is private symbolic
progression, not physical navigation or proof of visiting. Any spatial view must have equivalent
linear access and retain exact existing unlock rules.

### 12. Uber redesign — Shadhin Arafat

[Preview](../../output/competition-readiness/template-review/extracted/uber-redesign-shadhin-arafat/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/uber-redesign-shadhin-arafat/structure.json).
Filename attribution: Shadhin Arafat. Sketch 52.5. Nine numbered 414×896 artboards plus three
symbols: introduction, phone, verification, name, identity choice, photo, notifications,
map/home, and destination/nearby content.

Borrow **progressive setup, one clear input task, and preserved context between steps**. Its
clean spacing and photo-to-form relationship are relevant to access presentation, but Ghaf
already has approved role-separated access and synthetic identity flows. The current code must
continue to own those transitions.

Reject gender/identity inference, photo upload, real SMS assumptions, push activation, real-time
trip promises, friend proximity, restaurant discovery, and copied brand assets. Seven-field
account forms should not be recreated from a ridesharing flow. SF, Helvetica, Poppins, and
Montserrat references do not replace Ghaf's two approved families.

### 13. Virtual Currency Wallet — Juraa

[Preview](../../output/competition-readiness/template-review/extracted/virtual-currrency-wallet-juraa/sketch/previews/preview.png)
· [Structure](../../output/competition-readiness/template-review/extracted/virtual-currrency-wallet-juraa/structure.json).
Filename attribution: Juraa. The source filename spells `currrency` with three r's and is
preserved exactly. Sketch 69. Ten 375×812 artboards cover start, dashboard, two wallet states,
history, transfer variants, contacts, and sending; two symbols. Eina font families are referenced.

Its consistent **value → status → supporting row** ordering can inform readable private data,
but the dominant balance/chart/transfer grammar is unsuitable for Ghaf. Use a promise description,
eligible progress, and explicit fulfillment state on the Parent Reward Plan; it should not
look spendable or transferable.

Reject Bitcoin/coin artwork, market appreciation, income/expense percentages, positive/negative
transaction colors, request/send, QR payment, contact pickers, financial graph heroes, exchange
rates, and any Seed-to-AED equivalence. Family Rewards remain optional private promises; earned
Seeds are permanent and never debited. The source offers no embedded license or credit board.

## Pattern-to-product mapping

| Pattern                   | Best references                                                        | Ghaf use                                                                          | Boundary                                                                                           |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Calendar / agenda         | Lunar Calendar; Dailoz Task and date/filter sheets                     | Future planning research; possible agenda-first structure                         | No current dates, reminder engine, overdue state, or scheduling permission                         |
| Study / finite learning   | Edulive Classroom and Details; Notes detail                            | Existing gated Mangrove content with clear order and equivalent accessible route  | No generic school app, attendance, grades, new content library, or automatic Seed award            |
| Allowance / Family Reward | Bank receipt/summary structure; Wallet value/status ordering           | Private Parent promise and its next actor                                         | No wallet, payout, custody, conversion rate, purchase, or League dependency                        |
| Map / habitat             | Sample Transport Home/Map; Uber map; Furniture scene                   | Existing Garden scene or gated private Impact Path with linear alternative        | No GPS, route guidance, location permission, nearby people, visit proof, or claim of real planting |
| Task hierarchy            | Dailoz Home/Task/empty/detail; Booking selection rows                  | Primary Create action, Child scope, active work, prepared catalog, template reuse | Sole executable P0 task and Parent authority remain unchanged; Workspace stays gated               |
| Navigation                | Dailoz contextual editing; Edulive finite list; Uber progressive setup | Existing Parent and Child tabs with simple contextual Back                        | No extra tabs, duplicate tab/side-menu systems, hidden safety copy, or role switch                 |
| Prepared audio            | Music current item/transcript; Notes audio row                         | Existing playback/replay and exact transcript                                     | No live microphone implication, new media source, autoplay-next, or chat companion                 |

## Three coherent directions

These are alternative compositions within the existing Ghaf brand, not three token systems.
Use one across the complete journey; do not combine every appealing template treatment.

### Recommended: Family Field Journal

**Idea:** a family can see what to do now and how that action belongs to a living UAE landscape.
Combine Notes' reading rhythm, Edulive's finite sequence, and Dailoz's task clarity with Ghaf's
existing limestone, paper, forest, sage, water, and restrained amber.

The Parent's first viewport gives the role/family identity modest space, then places the next
pending action ahead of an open account of recent progress. Canopy artwork is a wide narrative
anchor, with meaningful action rows rather than a grid of metrics. Child Today gives one approved
task a strong title, existing landscape context, visible help, and a clear next action. Garden
expands into the visual reward: one selected landscape, one understandable permanent-growth
statement, then relevant track or chapter detail.

The signature is **recognition becoming visible in the same landscape the task introduced**.
Typography and composition carry most hierarchy; panel borders and shadows are sparse. Parent
surfaces remain composed, Child surfaces more illustrated, and both share exact controls and
readable Arabic. This direction best supports the already approved route set and complete demo.

### Alternative: Canopy Atlas

**Idea:** the family explores a small, intelligible botanical world. Borrow the transport scene
and anchored detail relationship, plus the furniture kit's confident subject scale. Keep the
approved landscapes and Ghaf canopy as the main visual subjects.

Garden and any enabled Impact Path begin with a large spatial composition and a stable lower
detail region. Parent Home shows the household canopy as the overview, then resolves to the
single next decision. Child Today places the task beside or directly beneath its landscape.
An equivalent list presents every selectable element in a clear reading order.

The risk is decorative geography overwhelming action or suggesting location tracking. Use no
street map, compass, current-location control, route ETA, 3D scene engine, or newly invented
milestone. This direction needs stronger native accessibility and compact-height validation
than Field Journal and must not add an atlas route.

### Alternative: Family Workshop

**Idea:** useful shared routines are assembled clearly and confidently. Borrow Dailoz's row and
editing consistency and Booking's selection/state anatomy, while keeping Ghaf's warm materials.

Parent Tasks leads with Create task, Child filters, current assignment, and bounded planning
tools. Parent Home acts as a short decision desk. Child task detail is a small visual sequence
with generous help and completion choices. Garden remains an expansive destination, providing
the emotional contrast to the more practical task screens.

This is the most operational direction and fits a Parent-heavy demonstration. Its risk is
becoming a generic productivity tool. Avoid urgent labels, productivity scores, tiny status
chips, dashboard tiles, and copied purple/cyan controls. The botanical subject must remain
visible at key task and recognition moments.

## Proposed screen system

This organizes existing surfaces and already gated candidates; it does not authorize new screens.

| Surface family                                   | Composition                                                                                     | Main action / state                                                   | Shared system                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Welcome and access                               | Existing approved local imagery, short role-aware copy, progressive form                        | Explicit Parent or Child access; visible Back                         | Existing access shell, branded text, form field, validation, footer action                  |
| Parent Home                                      | Short role header; canopy anchor; open next-action section; restrained family context           | Review the next pending step or create within current authority       | Canopy hero, action row, section heading, Child scope                                       |
| Parent Tasks                                     | Create stays visible; Child scope; current work before prepared examples                        | Create, review, or reuse wording; clear empty state                   | Task row, selectable scope, catalog rail plus accessible list, preview label                |
| Child Today                                      | One primary approved choice/assignment; relevant landscape; help stays near action              | Choose or continue the approved task                                  | Task hero, step row, help choice, clear current state                                       |
| Task Builder / detail / check-in                 | One readable content column; safety and fixed award before acceptance; help and retry in flow   | Parent review or Child next step                                      | Field, step list, assistance choices, contextual notice, sticky action only when unobscured |
| Recognition result                               | Action-specific praise first; Seeds and growth second; private promise consequence last         | Understand the confirmed result once                                  | Existing event-owned reveal and reduced-motion equivalent                                   |
| Garden                                           | Selected landscape at the largest useful scale; simple track navigation; textual growth context | Explore existing personal growth                                      | Existing landscape component, track selector, stage/Seed semantics                          |
| League                                           | Cooperative canopy context; five-Leaf explanation; restrained rank list                         | Understand the week's fair shared progress                            | Privacy-filtered row, shared-rank layout, non-color status                                  |
| Parent Family / Reward Plan                      | Named people and practical private rows; distinct promise detail                                | Review family planning or Parent promise                              | Utility row, optional directory, private promise status, reauthentication                   |
| Gated Path / badges / learning / Parent progress | One private chapter; finite named criteria; legible learning order                              | View exact evidence or complete the approved accessible learning path | Existing projection and reveal components; independent flags remain off                     |
| Settings, empty, loading, error                  | Quiet divided rows; concrete message; immediate recovery action                                 | Change preference, retry, go Back, or use deterministic fallback      | Existing native inputs/toggles, busy state, botanical pressable, notice                     |

The template collection suggests only a few reusable anatomical patterns: **section heading,
action row, task row, option row, scene with detail, finite step list, promise state, and a current
audio item with transcript**. First extend existing components with these roles. Do not install a
template framework or create a second set of cards, controls, fonts, or navigation primitives.

## Arabic, RTL, brand, and interaction contract

- Alexandria continues to own headings; Readex Pro owns body, controls, labels, and data. Imported
  SF, Poppins, Eina, Metropolis, DM Sans, Inter, or decorative serif references are not candidates.
  Preserve local loading/fallback, generous Arabic line height, zero Arabic tracking, tabular data
  numerals, and readable mixed-script runs.
- Design the Arabic composition directly. Start/end alignment, directional Back/Next icons,
  selected rails, and progress order follow locale. Landscape art, the brand mark, photographs,
  media playback symbols, and geographic imagery are not blindly mirrored.
- Keep essential titles and actions capable of wrapping. At 320dp, prefer a vertical list to a
  dense two-column catalog or seven-cell interactive calendar. Maintain 48dp minimum targets and
  the existing 56dp regular controls; do not copy the source kits' tiny icon-only affordances.
- Parent Home/Tasks and Child Today must reveal their purpose without reading several cards.
  Use one focal action, one main subject, a short explanatory statement, and useful whitespace.
  Data below the main action should answer a family question, not fill a dashboard slot.
- Each interactive component needs selected, pressed, disabled, busy, focused, and error behavior
  where applicable. Keep native TextInput editing and keyboard handling. No floating action or
  bottom sheet may cover safety text, help, the last item, or the Android navigation area.
- Motion follows the existing press/selection and event-owned growth vocabulary. Reduced motion
  exposes the same result immediately. No continuous decorative animation, timed onboarding,
  autoplay rails, progress urgency, or synthetic processing delay.
- Use approved Ghaf/UAE artwork and the existing palette. Make Growth explain the action's
  symbolic consequence. Do not import a crypto coin, fitness avatar, shopping card, map tile,
  foreign landscape, source portrait, or third-party logo to make the app feel “finished.”
- Retain exact Parent/Child isolation, explicit permission/help, prepared/live/fallback truth,
  permanent growth, private Family Rewards, five-Leaf fairness, and separate progress authorities.
  No visual treatment may imply surveillance, environmental measurement, real banking, public
  Child comparison beyond the permitted League projection, or unapproved AI capability.

## Licensing and provenance disposition

All 13 raw sources were provided in the user's workspace. Twelve have only filename attribution;
Music also has an embedded creator board and the explicit personal-use statement quoted above.
No package contains a standalone license/README, and **none establishes redistribution rights for
all of its embedded imagery, font references, logos, or content**. Source filenames and hashes
are preserved; no author relationship or external download origin has been inferred.

Use the archives as private structural references. Any later proposal to copy an actual source
asset must identify its creator, original source, applicable license/permission, allowed use,
required attribution, and the exact derivative. For this review, the practical choice is to
author Ghaf-native composition with existing approved assets. Contact sheets and extracted files
remain local review evidence and should not be packaged in the public app or submission.

## Validation and handoff

| Check                                                  | Status                  | Evidence / limit                                                                                |
| ------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------- |
| All 13 requested archives present and inventoried      | PASSED                  | Inventory names match the source directory exactly                                              |
| Outer/nested path, type, size, ratio, CRC checks       | PASSED                  | Bounded extraction script completed without rejection                                           |
| Every source file has size/hash metadata               | PASSED                  | 26 outer files and 175 inner files in `inventory.json`                                          |
| Every archive's embedded visual preview inspected      | PASSED                  | Four overview contact sheets; original previews linked above                                    |
| Additional embedded PNGs inspected                     | PASSED                  | Four asset sheets, 87 PNGs                                                                      |
| All document page/artboard/symbol structures inspected | PASSED                  | 116 artboards, 88 symbol masters, recovered legacy attributed strings                           |
| Fresh full-resolution Sketch artboard rendering        | NOT RUN                 | No Sketch runtime; embedded PNGs and JSON are the available evidence                            |
| Seven embedded PDF files rendered and inspected        | PASSED                  | All 371 pages rendered; text, metadata, and contact sheets inspected; original hashes unchanged |
| License/README and creator/provenance inventory        | PASSED at archive scope | No standalone license/README; one embedded personal-use statement                               |
| Third-party redistribution clearance                   | NOT ESTABLISHED         | Archive contents do not establish complete rights                                               |
| App runtime, Android RTL/Back/IME/TalkBack/font scale  | NOT RUN in this review  | No app code changed; archive inspection cannot pass native gates                                |
| Named Arabic/UAE/visual/accessibility review           | NOT RUN                 | Proposal requires the normal review evidence before release                                     |

The catalog is ready for integration as a planning/reference document. The next implementation
slice should select one composition direction, reconcile it with the current botanical evidence,
and implement only the already approved screens through existing components. Calendar/scheduling,
new study execution, real allowance, location, or flag activation needs its own product authority;
no such authority is supplied by a design ZIP.
