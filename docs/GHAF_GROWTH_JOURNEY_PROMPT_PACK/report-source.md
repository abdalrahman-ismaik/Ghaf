# Source Ledger — Ghaf Growth Journey

**Research date:** 2026-09-02
**Purpose:** Evidence trail for launch/onboarding guidance, child motivation and wellbeing, game-pass
benchmarks, platform policy, and UAE environmental/cultural content
**Method:** Targeted web research of official platform/policy pages, original game-publisher
documentation, government/cultural authorities, and peer-reviewed or institutional research. Claims
below distinguish evidence from product inference. Mutable policies and destination information must
be rechecked before release.

---

## A. Launch and onboarding

### A1. Apple Human Interface Guidelines — Launching

- URL: [Launching — Apple Developer](https://developer.apple.com/design/human-interface-guidelines/launching)
- Authority: Primary platform guidance.
- Supports: Launch should feel immediate; the system launch screen is a transition into a stable
  first frame, not a place for a rich advertisement.
- Product inference: If Ghaf needs an emotional brand reveal, implement it as a separate, brief,
  interruptible in-app surface rather than extending the native launch asset. Apple does not require
  or specifically endorse this additional branded moment.
- Limitation: Native iOS guidance; a web/PWA shell follows the principle rather than UIKit details.

### A2. Apple Human Interface Guidelines — Onboarding

- URL: [Onboarding — Apple Developer](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- Authority: Primary platform guidance.
- Supports: Onboarding should be fast, optional, and focused; people should be able to skip and later
  replay it, and learning by safely trying a real mechanic is preferable to teaching everything up
  front.
- Product consequence: Three screens maximum, one isolated interaction, no permissions or purchase
  prompts, and replay from Help/Settings.
- Limitation: General platform guidance, not child-specific.

### A3. Android Developers — Splash screens

- URL: [Splash screens — Android Developers](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Authority: Primary Android documentation; page observed as updated 2026-08-14.
- Supports: Android 12+ provides the system `SplashScreen`; it dismisses when ready, can use an icon
  animation of no more than 1,000 ms, and should move into a stable first frame.
- Product consequence: No forced “few seconds” delay, fake loader, or second spinner.
- Limitation: A web implementation approximates the behavior rather than using the native API.

### A4. W3C — Web Content Accessibility Guidelines (WCAG) 2.2

- URL: [Web Content Accessibility Guidelines (WCAG) 2.2 — W3C Recommendation](https://www.w3.org/TR/WCAG22/)
- Authority: Primary web accessibility standard.
- Supports: Testable requirements for perceivable, operable, understandable, and robust interfaces,
  including contrast, focus visibility/order, status messages, reflow, and target size.
- Product consequence: Treat WCAG 2.2 AA as the web baseline, test enlarged text and non-color state
  cues, and retain Ghaf’s more generous 48×48 px touch target as a product choice. WCAG 2.2 Success
  Criterion 2.5.8 sets a 24×24 CSS-pixel AA minimum with defined exceptions; it is not the source of
  Ghaf’s 48×48 target.
- Limitation: Native Android/iOS accessibility also requires platform-specific testing and guidance.

### A5. W3C Internationalization — inline bidirectional text

- URL: [Inline markup and bidirectional text in HTML — W3C Internationalization](https://www.w3.org/International/articles/inline-bidi-markup/)
- Authority: Primary W3C internationalization guidance for HTML.
- Supports: Directional isolation is necessary when unknown or mixed-direction strings are inserted
  into surrounding text; HTML `bdi` and related directional techniques prevent spillover and visual
  reordering errors.
- Product consequence: Isolate interpolated numeric/name tokens, author Arabic as true RTL, and test
  Arabic/English mixtures with assistive technology. Use platform-equivalent direction controls on
  native surfaces rather than assuming HTML `bdi` exists everywhere.
- Limitation: The article addresses web markup; React Native and other native stacks need their own
  writing-direction implementation and verification.

---

## B. Game-pass and badge benchmarks

These sources describe patterns to analyze, not designs or monetization to copy.

### B1. Supercell — Pass Royale changes and updates

- URLs:
  - [Pass Royale Changes! — Supercell](https://supercell.com/en/games/clashroyale/blog/news/pass-royale-changes/)
  - [October Update — Supercell](https://supercell.com/en/games/clashroyale/blog/release-notes/october-update/)
  - [June Update 2025 — Supercell](https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2025/)
  - [December Update 2025 — Supercell](https://supercell.com/en/games/clashroyale/blog/release-notes/december-update-2025/)
  - [March Update 2026 — Supercell](https://supercell.com/en/games/clashroyale/blog/release-notes/march-update-2026/)
- Authority: Primary publisher documentation.
- Supports: Visible milestone roads, reward tracks, continuation beyond a nominal pass end, player
  choice at selected tiers, badge categories, retained older badges, and upgradeable achievement
  thresholds are durable comprehension/collection patterns.
- Also documents patterns rejected for Ghaf: paid tracks, seasonal exclusivity, repeated drops,
  variable/starred rewards, daily streaks/spins, limited participation windows, and competitive
  badges.
- Product inference: Borrow visibility, category organization, deterministic choice, and collection
  permanence; reject urgency, randomness, monetized acceleration, and public status.
- Limitation: Live game structure changes by season; exact tier counts and current offers must not be
  treated as stable requirements.

### B2. PUBG Mobile — Royale Pass

- URLs:
  - [Royale Pass A19 — PUBG Mobile](https://www.pubgmobile.com/en/event/royalepassA19/)
  - [Royale Pass Season 14 — PUBG Mobile](https://www.pubgmobile.com/en/event/royalepass14/)
  - [Royale Pass Season 4 — PUBG Mobile](https://www.pubgmobile.com/en/event/royalepass4/)
- Authority: Primary publisher pages.
- Supports: The classic loop of missions → points → ranks → previewed rewards, with free and paid
  layers, premium missions, rank acceleration, exclusive items, renewal currency, and expiry/reset.
- Product inference: The sequence is easy to understand, but Ghaf should use Parent-approved tasks →
  existing Seeds → permanent stations with one free path. Premium acceleration and reset hooks are
  specifically excluded.
- Limitation: Offers, dates, pricing, and rank counts vary by edition and market.

---

## C. Motivation, learning, and child wellbeing

### C1. Li, Hew, and Du (2024) — intrinsic motivation meta-analysis

- URL: [Gamification enhances student intrinsic motivation… — Educational Technology Research and Development](https://link.springer.com/article/10.1007/s11423-023-10337-7)
- Evidence: 35 independent interventions, 2,500 participants; small overall intrinsic-motivation
  effect (Hedges’ g = 0.257), with positive autonomy and relatedness effects and minimal competence
  effect. The review identifies lack of perceived autonomy and competence as recurring problems.
- Product consequence: Give choice, an achievable next step, informative feedback, and family
  connection. Do not assume badge volume equals learning.
- Confidence: High for the synthesized educational literature.
- Limitation: Mixed ages and contexts, substantial heterogeneity, not a Ghaf-specific causal result.

### C2. Sailer and Homner (2020) — learning meta-analysis

- URL: [The Gamification of Learning: a Meta-analysis — Educational Psychology Review](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- Evidence: Positive average cognitive, motivational, and behavioral outcomes, with weaker certainty
  for motivation/behavior in high-rigor subsets; narrative and cooperative combinations appear
  promising.
- Product consequence: UAE stories and family/cooperative meaning should carry the system; badges
  should be evidence markers, not the whole intervention.
- Limitation: Many studies are not K–12; moderator findings are less certain.

### C3. Deci, Koestner, and Ryan (1999) — extrinsic rewards

- URLs:
  - [PubMed record](https://pubmed.ncbi.nlm.nih.gov/10589297/)
  - [Author-hosted PDF](https://selfdeterminationtheory.org/SDT/documents/1999_DeciKoestnerRyan_Meta.pdf)
- Evidence: Expected tangible rewards can reduce later intrinsic interest in some contexts; effects
  depend on reward type and contingency.
- Product consequence: Pair every achievement with what the Child learned/did and descriptive
  feedback. Never make the collectible the sole reason for an action.
- Limitation: The reward literature contains genuine debate; not every performance-linked reward is
  harmful, especially for low-interest tasks.

### C4. Mekler et al. (2017) — individual game elements

- URLs:
  - [Aalto research record](https://research.aalto.fi/en/publications/towards-understanding-the-effects-of-individual-gamification-elem/)
  - [DOI](https://doi.org/10.1016/j.chb.2015.08.048)
- Evidence: Points, levels, and leaderboards increased work quantity in the studied task without a
  significant intrinsic-motivation or competence increase.
- Product consequence: Time-in-app and output volume are not proof of learning or healthy
  motivation.
- Limitation: Adult/non-child task context.

### C5. Abramovich, Schunn, and Higashi (2013) — badge type and learner readiness

- URLs:
  - [University at Buffalo record](https://researchconnect.buffalo.edu/en/publications/are-badges-useful-in-education-it-depends-upon-the-type-of-badge-/)
  - [DOI](https://doi.org/10.1007/s11423-013-9289-2)
- Evidence: Middle-school learner motivation/acquisition patterns differed by badge type and prior
  knowledge.
- Product consequence: Include easy starter acknowledgements and deeper mastery; do not make one
  ability-dependent path the only route.
- Limitation: Exploratory work in a single intelligent-tutor context.

### C6. Mohammed, Fatemah, and Hassan (2024) — ages 9–11

- URL: [Effects of Gamification on Motivations of Elementary School Students — Simulation & Gaming](https://journals.sagepub.com/doi/10.1177/10468781241237389)
- Evidence: Small field experiment with Egyptian fifth-graders found improvements within badge and
  leaderboard groups but no significant difference between the mechanics; authors note holistic
  design and novelty.
- Product consequence: Prototype-test the whole Arabic story/task/feedback/reward loop with UAE
  children, rather than claiming badges alone “keep children engaged.”
- Limitation: N = 30, five weeks, no non-gamified control, novelty confound.

### C7. Papakostas and Stergiou (2026) — EcoHeroes

- URL: [Evaluating EcoHeroes — Natural Sciences Education](https://acsess.onlinelibrary.wiley.com/doi/10.1002/nse2.70047)
- Evidence: Six-week sustainability gamification study with 80 children ages 9–11 reported improved
  knowledge, attitudes, and intentions, with high perceived understanding.
- Product consequence: Blend story, a no-fail learning interaction, real-world mission, and badge;
  separately test transfer into approved household action.
- Limitation: One-school convenience sample, no control, self-report, short duration; long-term
  behavior remains unknown.

### C8. Mueller and Dweck (1998) — process praise

- URL: [Praise for Intelligence Can Undermine Children’s Motivation and Performance — PDF](https://www.columbia.edu/cu/psychology/courses/3615/Readings/Mueller_Dweck.pdf)
- Evidence: Across six studies, fifth-graders praised for intelligence showed more performance goals
  and less persistence/enjoyment after difficulty than children receiving effort-oriented praise.
- Product consequence: Name the action, strategy, safe help, or improvement; never label Salem
  “smartest,” “best,” or morally superior.
- Limitation: Classic short experimental tasks; generic or insincere effort praise is not sufficient.

### C9. Pickal et al. (2026) — leaderboard feedback

- URLs:
  - [Institutional record](https://repository.eduhk.hk/en/publications/the-winner-takes-it-all-effects-of-leaderboard-based-feedback-on/)
  - [DOI](https://doi.org/10.1016/j.lindif.2025.102836)
- Evidence: Randomized study found small performance differences; favorable/upward leaderboard
  feedback benefited motivation more than negative feedback, which could be worse than no feedback.
- Product consequence: Preserve private personal progress and cooperative Shared Growth; avoid public
  Child ranking.
- Limitation: Sample is not clearly child-specific; not a universal ban on leaderboards.

### C10. UNICEF RITEC Design Toolbox

- URLs:
  - [RITEC Design Toolbox — UNICEF](https://www.unicef.org/childrightsandbusiness/workstreams/responsible-technology/online-gaming/ritec-design-toolbox)
  - [RITEC overview — UNICEF Innovation](https://www.unicef.org/innovation/responsible-innovation-technology-children-ritec)
- Evidence: Child-centered design framework developed and validated with 787 children ages 8–12 in
  18 countries, covering safety, inclusion, autonomy, emotion, competence, relationships, creativity,
  and identity.
- Product consequence: Let children choose equivalent paths, understand mastery, connect with family,
  and organize a private collection; test across abilities.
- Limitation: A design framework, not a causal guarantee or company endorsement.

### C11. American Academy of Pediatrics (2026) — digital ecosystems

- URL: [Digital Ecosystems, Children, and Adolescents — Pediatrics](https://publications.aap.org/pediatrics/article/157/2/e2025075320/206129/Digital-Ecosystems-Children-and-Adolescents-Policy)
- Evidence: Describes intermittent rewards and social quantification as engagement-based design and
  notes that frequent badges/trophies can function as digital lures; recommends less frequent
  reinforcement and disengagement check-ins.
- Product consequence: Use sparse meaningful reveals and a finite “finished for today” endpoint.
- Limitation: Policy guidance; AAP notes much media evidence is observational/correlational.

### C12. OECD — Dark commercial patterns

- URLs:
  - [Dark commercial patterns — OECD PDF](https://one.oecd.org/document/DSTI/CP(2021)12/FINAL/en/pdf)
  - [DOI](https://doi.org/10.1787/44f5e846-en)
- Evidence: Dark patterns may extract money, data, or attention through urgency, false scarcity,
  nagging, social proof, and obstruction; children can be disproportionately harmed.
- Product consequence: No countdown, shame, nagging, purchase gate, hidden opt-out, or scarcity.
- Limitation: Consumer-protection synthesis; not a feature-by-feature app law.

### C13. UK ICO Children’s Code — nudge techniques and detrimental use

- URLs:
  - [Nudge techniques — ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/)
  - [Standard 5: Detrimental use of data — ICO PDF](https://ico.org.uk/media2/fz0kcday/children-s-code-standard-5-detrimental-use-of-data.pdf)
- Evidence: Child-facing choices should use high-privacy defaults and not exploit psychological bias;
  reward loops, continuous feeds, autoplay, notifications, and profiling can create excessive-
  engagement or financial-loss risks.
- Product consequence: Privacy-protective defaults, clear explanations, Parent involvement, no
  autoplay/infinite scroll, no FOMO, Save & Exit, and child reminders off by default.
- Limitation: UK data-protection framework; applying the same restraint outside privacy decisions is
  a product inference.

---

## D. Child privacy and platform policy

### D1. FTC — COPPA rule changes

- URL: [FTC Finalizes Changes to Children’s Privacy Rule](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data)
- Supports: Verifiable Parent consent requirements for covered collection/use/disclosure, separate
  opt-in for third-party targeted-ad disclosure, data minimization/retention limits, and explicit FTC
  concern about child-directed push and engagement techniques.
- Product consequence: P0 should collect no unnecessary Child data, use no ads, and avoid targeted
  engagement optimization.
- Limitation: US law and context; obtain jurisdiction-specific legal review.

### D2. FTC — Epic/Fortnite enforcement

- URL: [FTC action regarding Epic Games](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations)
- Supports: Enforcement concerns around child privacy, default communications, dark patterns, and
  charges without adequate Parent action.
- Product consequence: Do not import child purchases, public communications, or manipulative battle-
  pass flows.
- Limitation: Enforcement allegations/settlements around a specific company and product.

### D3. Apple App Review Guidelines — Kids Category

- URL: [App Review Guidelines §1.3 — Apple Developer](https://developer.apple.com/app-store/review/guidelines/)
- Supports: Links and purchases must be reserved behind a parental gate; Kids Category apps generally
  should not include third-party analytics/advertising or send personally identifiable/device
  information to third parties.
- Product consequence: No child shop or third-party tracking in the P0 design.
- Limitation: Store requirements depend on final category, functionality, and jurisdiction.

### D4. Google Play Families policy

- URL: [Google Play Families policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- Supports: Child privacy/data disclosure, restrictions on advertising identifiers and precise
  location for child-only apps, adult control for social features, and prohibitions on deceptive or
  emotionally manipulative monetization and launch interstitials.
- Product consequence: No location-based badges, public social layer, personalized ads, or ambiguous
  currency/purchase design.
- Limitation: Living policy; recheck before store submission.

### D5. UAE digital safety

- URLs:
  - [Children’s digital safety — UAE Government](https://u.ae/en/information-and-services/social-affairs/children/Childrens-digital-safety)
  - [Family Online Safety campaign — TDRA](https://tdra.gov.ae/ar/media/press-release/2024/community-awareness-initiative-tdra-uae-media-council-and-tiktok)
- Supports: UAE emphasis on privacy, age-appropriate games, parental controls, excessive-device-use
  risk, and family online safety.
- Product consequence: Design for healthy return and real-world activity, not prolonged screen time;
  give Parents clear controls and children a safe stopping point.
- Limitation: Public guidance/campaign material, not a complete compliance analysis.

### D6. UAE production privacy and child-rights legal gap

- URLs:
  - [Federal Decree-Law No. 45 of 2021 Concerning the Protection of Personal Data — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/1972/download)
  - [Federal Law No. 3 of 2016 on Child Rights (Wadeema) — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/1176)
- Authority: Primary UAE legislation.
- Supports: A production service processing personal data must be assessed against the UAE personal-
  data framework, while product decisions affecting children must account for applicable child-rights
  protections and the child’s best interests.
- Current gap: This pack deliberately specifies local synthetic prototype data and is not a UAE legal
  compliance assessment. Before any real Child or household data, accounts, analytics, notifications,
  cloud storage, or cross-border vendors are introduced, UAE counsel must document applicability,
  roles and lawful basis, guardian/Child notices and consent where required, data minimization,
  retention/deletion, rights handling, security, incident response, transfers, age assurance, and
  every third-party SDK. Free-zone or sector-specific rules may also apply.

---

## E. UAE environmental and cultural content

### E1. Ghaf tree

- URL: [Ghaf Tree — Environment Agency–Abu Dhabi](https://www.ead.gov.ae/en/discover-our-biodiversity/plants/ghaf-tree)
- Supports: *Prosopis cineraria* is drought-tolerant, supports biodiversity, is the UAE national tree,
  and has cultural associations with stability and peace; EAD states it was declared the national
  tree in 2008.
- P0 use: source support for **جذور الغاف** and the Ghaf brand story. This source does not define or
  endorse the product badge.
- Caution: Avoid uncorroborated lifespan claims and never imply official endorsement.

### E2. Mangroves

- URLs:
  - [UAE 100 million mangrove target announcement — MOCCAE](https://moccae.gov.ae/ar/media-center/news/9/11/2021/uae-announces-enhanced-target-to-plant-100-million-mangroves-by-2030-at-cop26.aspx)
  - [Mangrove restoration guidelines — EAD](https://www.ead.gov.ae/Media-Centre/News/MANGROVE-INITIATIVE-GUIDELINES)
  - [Mangrove National Park — EAD](https://www.ead.gov.ae/en/experience-green-abu-dhabi/places-to-go/mangrove-national-park)
  - [Jubail Mangrove Park — Experience Abu Dhabi](https://visitabudhabi.ae/en/things-to-do/nature-and-wildlife/parks/jubail-mangrove-park)
- Supports: Coastal protection, habitat, biodiversity, carbon storage, water/ecosystem learning, and
  the announced 100 million mangrove target by 2030.
- P0 use: source support for **رعاية القرم**, **بين جذور القرم**, and the Water & Coast chapter.
  These are independent Ghaf product concepts, not official badges.
- Caution: Never imply that an in-app task planted a tree. Revalidate targets and destination details
  before showing dated figures. Restoration is science-based, not “plant anything anywhere.”

### E3. Wetlands, mountains, and species

- URLs:
  - [Sheikh Zayed Protected Areas Network — EAD](https://www.ead.gov.ae/en/discover-our-biodiversity/sheikh-zayed-protected-areas-network)
  - [Al Wathba Wetland Reserve — EAD](https://www.ead.gov.ae/en/experience-green-abu-dhabi/places-to-go/al-wathba-wetland-reserve)
  - [Jabal Hafit National Park — EAD](https://www.ead.gov.ae/en/Experience-Green-Abu-Dhabi/Places-To-Go/Jabal-Hafit-National--Park)
  - [Hawksbill Turtle — EAD](https://www.ead.gov.ae/en/discover-our-biodiversity/amphibians-and-reptiles/hawksbill-turtle)
  - [Arabian oryx — EAD](https://www.ead.gov.ae/en/Discover-Our-Biodiversity/Mammals/Arabian-oryx)
- Supports: Habitat and conservation stories spanning mangroves, dunes, sabkha, mountains, wetlands,
  turtles, birds, and desert species.
- P0 use: **استكشاف الأراضي الرطبة**. Mountain, turtle, and oryx concepts are research-backed P1
  candidates only; their final names and criteria require the same editorial and rights review.
- Caution: Omit mutable population/visitor numbers from evergreen cards unless versioned. Al Wathba
  currently displays a closure notice; never award a “visit” badge.

### E4. Date palm, falaj, khous, Al-Sadu, and pearl history

- URLs:
  - [Date palm knowledge and practices — Abu Dhabi Culture](https://abudhabiculture.ae/en/cultural-heritage/intangible/unesco-ich-inscribed-elements/date-palm)
  - [Khous — Abu Dhabi Culture](https://abudhabiculture.ae/en/cultural-heritage/intangible/heritage-register/social-practices/khous)
  - [Al-Sadu — Abu Dhabi Culture](https://abudhabiculture.ae/en/cultural-heritage/intangible/unesco-ich-inscribed-elements/al-sadu)
  - [Pearl diving in the UAE — Abu Dhabi Culture](https://abudhabiculture.ae/en/cultural-heritage/intangible/heritage-register/traditional-handicraft/pearl-diving)
  - [Al Ain Oasis — Experience Abu Dhabi](https://visitabudhabi.ae/en/things-to-do/nature-and-wildlife/natural-wonders/al-ain-oasis)
  - [Cultural Sites of Al Ain — UNESCO World Heritage Centre](https://whc.unesco.org/en/list/1343)
- Supports: Date-palm uses and social traditions, palm-frond craft, Al-Sadu weaving, historic pearl-
  diving teamwork, oasis agriculture, and falaj irrigation.
- P0 use: **عطاء النخلة** and **نقوش السدو**. Khous, pearl, and falaj concepts remain P1 candidates,
  not additional entries in the exact P0 registry.
- Caution: Learning badges do not certify cultural mastery or UNESCO status. Use original art and
  obtain Emirati cultural-practitioner/editorial review. Never turn pearl diving into a child physical
  challenge.

### E5. Clean energy, green education, and UAE places

- URLs:
  - [UAE Green Education Partnership Roadmap — Ministry of Education](https://www.moe.gov.ae/en/mediacenter/news/pages/green-education.aspx)
  - [UAE Net Zero 2050 strategy details — MOCCAE](https://www.moccae.gov.ae/ar/media-center/news/16/11/2023/climate-neutrality-a-national-priority-as-uae-net-zero-2050-strategy-accelerated-following-the-annou)
  - [DEWA Innovation Centre — DEWA](https://dewa.gov.ae/en/about-us/media-publications/latest-news/2020/12/innovation-centre)
  - [Terra — Visit Dubai](https://www.visitdubai.com/en/places-to-visit/terra-sustainability-pavilion)
  - [Kalba — Visit Sharjah](https://www.visitsharjah.com/regions/east-coast/kalba/)
  - [Al Zorah Nature Reserve — Visit Ajman](https://visit-ajman.ae/en/destinations/ajman-city/al-zorah-nature-reserve)
  - [Wadi Al Wurayah — Fujairah Tourism](https://tourism.fujairah.ae/destinations/wadi-al-wurayah)
- Supports: Green skills, energy/resource systems, sustainability education, and habitat stories
  across multiple Emirates.
- Potential P1 use: a clean-energy learning package and place-inspired chapters. Neither belongs to
  the exact P0 badge registry unless it is later specified, reviewed, and versioned.
- Caution: Prefer generic habitat art and independent educational wording. Do not use institutional
  logos, copy attraction artwork, or imply a partnership.

---

## F. Rights and representation

- [Federal Decree-Law No. 38 of 2021 on Copyright and Neighboring Rights — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/1534/download)
- [Federal Decree-Law No. 36 of 2021 on Trademarks — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/1535/download)
- [Federal law concerning the UAE logo and official seal — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/1989)
- [Federal law concerning the Union Flag — UAE Legislation](https://uaelegislation.gov.ae/en/legislations/2013)
- [Nation Brand logo usage guidelines — Emirates Brand Office](https://nationbrand.ae/en/logo-guidelines)
- [DCT Abu Dhabi terms and conditions](https://abudhabiculture.ae/en/terms-and-conditions)

Product consequence: Paraphrase facts, create original illustration, clear final names/trademarks,
and never make badge borders or icons resemble government seals. Avoid the UAE flag as a rarity or
reward frame. Cultural and named-place content requires review before commercial release.

---

## G. Evidence gaps and validation plan

1. There is no evidence that a badge system alone will create durable pro-environmental behavior in
   Ghaf’s target population.
2. Long-term transfer from app completion to household stewardship must be tested separately from
   short-term engagement or recall.
3. The precise chapter density (recommended 6–8 visible milestones) and reveal cadence are product
   hypotheses, not statutory or experimentally proven numbers.
4. Arabic copy, badge metaphors, heritage representation, and attraction naming require Emirati
   cultural/editorial review.
5. Children across abilities and neurotypes must be included in usability/co-design work.
6. Platform policies, destination status, strategy targets, and legal requirements are mutable and
   must be rechecked before launch.
7. Production privacy, child-rights, consumer-protection, accessibility, and sector/free-zone legal
   obligations have not been mapped; complete that assessment before processing real family data.
8. Recommended validation measures: next-criterion comprehension, task quality, learning recall,
   Child autonomy/enjoyment, Parent trust, equitable completion, healthy exit, and absence of shame or
   pressure. Session length and return frequency are not sufficient success measures.
