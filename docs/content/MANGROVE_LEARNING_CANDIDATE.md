# Mangrove Learning Candidate Content and Source Evidence

**STATUS: CANDIDATE EVIDENCE — NOT HUMAN-APPROVED — NOT RELEASE AUTHORITY**

**Reviewed by automation:** 2026-09-05

**Runtime status:** absent from live copy; `r002b_learning_ui` remains default-off

**Release status:** blocked until every named human review below is complete

## Authority boundary

The product identity, title, objective, unlock, equal-credit routes, and zero-reward behavior are
approved in `docs/content/LEARNING_STORIES.md` and the Feature 003 contract. The Arabic and English
wording in this file is a candidate for human review. Its presence does not authorize release or
make it canonical runtime copy.

This document is the only source of the candidate wording. The message IDs in the JSON block are
recommended keys for later, integration-owner-controlled insertion into `src/i18n/resources.ts`.
No route or feature module should copy these strings directly. A later adapter must deep-freeze its
structured projection and must not fetch this document or any cited page at runtime.

## Evidence classification

- **Verified fact:** EAD's Arabic and English biodiversity pages identify mangroves along Abu
  Dhabi's coast and describe them as sheltered habitat for birds and marine species.
- **Verified fact:** Dubai Municipality's protected-area visitor guidance prohibits harming
  wildlife or vegetation and polluting soil or water.
- **Bounded inference:** the candidate turns those visitor prohibitions into a general, child-safe
  stewardship rule. It does not tell a Child to visit a protected area.
- **Recommendation:** use only the three stable claims below; omit area totals, planting targets,
  carbon quantities, species counts, opening hours, prices, and other mutable facts.
- **Unresolved:** named Arabic, UAE place/culture, safeguarding/age-comprehension,
  accessibility-equivalence, factual-source, and rights reviewers have not reviewed this wording.

## Direct source audit

| Source                                                                                 | Authority                                           | Direct evidence used                                                                                                                                    | Accessed   | Human review |
| -------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------ |
| [Mangroves](https://www.ead.gov.ae/en/Discover-Our-Biodiversity/Plants/Mangroves)      | Environment Agency – Abu Dhabi (EAD), English       | `Description`, `Where they're found today`, and `Abu Dhabi's efforts`: warm-water/coastal occurrence and sheltered habitat for birds and marine species | 2026-09-05 | NOT RUN      |
| [أشجار القرم](https://www.ead.gov.ae/ar-AE/Discover-Our-Biodiversity/Plants/Mangroves) | هيئة البيئة – أبوظبي, Arabic                        | `الوصف`, `مواقع الانتشار`, and `جهود أبوظبي`: Arabic terminology and the same habitat claims                                                            | 2026-09-05 | NOT RUN      |
| [Plan Your Visit](https://www.dm.gov.ae/dubai-protected-areas/plan-your-visit/)        | Dubai Municipality — Dubai Protected Areas, English | `Do's and Don'ts`: do not pollute soil/water, approach or harm wildlife, or damage vegetation                                                           | 2026-09-05 | NOT RUN      |

The joint EAD/MOCCAE national restoration-guidelines PDF was found at
`https://www.ead.gov.ae/-/media/Project/EAD/EAD/Documents/KnowledgeHub/Resources-and-Materials/EAD6735_MANGROVE-INITIATIVE-GUIDELINES_v10b.pdf`,
but the research tool timed out when opening it on 2026-09-05. No claim in this candidate relies on
that inaccessible source. No source image, media, layout, or verbatim paragraph is copied.

## Candidate structured pack

The delimited JSON is evidence and proposed localization input, not a runtime module. User-facing
copy appears only once, here.

<!-- MANGROVE_LEARNING_CANDIDATE_JSON_START -->

```json
{
  "schemaVersion": 1,
  "status": "candidate_evidence_not_human_approved",
  "package": {
    "id": "learning.mangrove_roots.v1",
    "titleMessageId": "learning.mangroveRoots.title",
    "objectiveId": "objective.mangrove_habitat_stewardship.v1",
    "objectiveMessageId": "learning.mangroveRoots.objective",
    "completionCreditId": "learning.mangrove_roots.v1",
    "unlockThreshold": 132,
    "routes": {
      "story": {
        "path": "/garden/learn/learning.mangrove_roots.v1/story",
        "objectiveId": "objective.mangrove_habitat_stewardship.v1",
        "claimIds": [
          "claim.mangrove.abu_dhabi_coastal_habitat.v1",
          "claim.mangrove.wildlife_shelter.v1",
          "claim.mangrove.respect_no_harm_or_pollution.v1"
        ],
        "checkId": "check.mangrove_habitat_stewardship.v1",
        "steps": [
          {
            "stepId": "story_frame_1",
            "messageIds": [
              "learning.mangroveRoots.story.frame1.title",
              "learning.mangroveRoots.story.frame1.body"
            ],
            "claimIds": [
              "claim.mangrove.abu_dhabi_coastal_habitat.v1",
              "claim.mangrove.wildlife_shelter.v1"
            ]
          },
          {
            "stepId": "story_frame_2",
            "messageIds": [
              "learning.mangroveRoots.story.frame2.title",
              "learning.mangroveRoots.story.frame2.body"
            ],
            "claimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"]
          }
        ]
      },
      "accessible": {
        "path": "/garden/learn/learning.mangrove_roots.v1/accessible",
        "objectiveId": "objective.mangrove_habitat_stewardship.v1",
        "claimIds": [
          "claim.mangrove.abu_dhabi_coastal_habitat.v1",
          "claim.mangrove.wildlife_shelter.v1",
          "claim.mangrove.respect_no_harm_or_pollution.v1"
        ],
        "checkId": "check.mangrove_habitat_stewardship.v1",
        "steps": [
          {
            "stepId": "accessible_section_1",
            "messageIds": [
              "learning.mangroveRoots.accessible.section1.heading",
              "learning.mangroveRoots.accessible.section1.body"
            ],
            "claimIds": [
              "claim.mangrove.abu_dhabi_coastal_habitat.v1",
              "claim.mangrove.wildlife_shelter.v1"
            ]
          },
          {
            "stepId": "accessible_section_2",
            "messageIds": [
              "learning.mangroveRoots.accessible.section2.heading",
              "learning.mangroveRoots.accessible.section2.body"
            ],
            "claimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"]
          }
        ]
      }
    }
  },
  "claims": [
    {
      "id": "claim.mangrove.abu_dhabi_coastal_habitat.v1",
      "ar": "توجد غابات القرم في المياه الدافئة، وتنتشر على سواحل أبوظبي.",
      "en": "Mangrove forests occur in warm waters, including along Abu Dhabi's coast.",
      "sourceIds": ["source.ead.mangroves.en", "source.ead.mangroves.ar"],
      "mutable": false,
      "evidenceKind": "verified_fact"
    },
    {
      "id": "claim.mangrove.wildlife_shelter.v1",
      "ar": "توفر غابات القرم مأوى آمنًا ومحميًا للطيور والأنواع البحرية.",
      "en": "Mangrove forests provide safe, sheltered habitat for birds and marine species.",
      "sourceIds": ["source.ead.mangroves.en", "source.ead.mangroves.ar"],
      "mutable": false,
      "evidenceKind": "verified_fact"
    },
    {
      "id": "claim.mangrove.respect_no_harm_or_pollution.v1",
      "ar": "العناية بموطن القرم تعني تجنب إيذاء الكائنات والنباتات وتجنب تلويث الماء أو التربة.",
      "en": "Caring for mangrove habitat means avoiding harm to wildlife and plants and avoiding pollution of water or soil.",
      "sourceIds": ["source.dm.protected_areas.visit_rules.en"],
      "mutable": false,
      "evidenceKind": "bounded_inference_from_official_rule"
    }
  ],
  "sources": [
    {
      "id": "source.ead.mangroves.en",
      "title": "Mangroves",
      "authority": "Environment Agency – Abu Dhabi (EAD)",
      "language": "en",
      "url": "https://www.ead.gov.ae/en/Discover-Our-Biodiversity/Plants/Mangroves",
      "accessedOn": "2026-09-05",
      "directAccess": "opened",
      "evidenceLocator": "Description; Where they're found today; Abu Dhabi's efforts",
      "supportsClaimIds": [
        "claim.mangrove.abu_dhabi_coastal_habitat.v1",
        "claim.mangrove.wildlife_shelter.v1"
      ],
      "humanReview": "not_run"
    },
    {
      "id": "source.ead.mangroves.ar",
      "title": "أشجار القرم",
      "authority": "هيئة البيئة – أبوظبي",
      "language": "ar",
      "url": "https://www.ead.gov.ae/ar-AE/Discover-Our-Biodiversity/Plants/Mangroves",
      "accessedOn": "2026-09-05",
      "directAccess": "opened",
      "evidenceLocator": "الوصف؛ مواقع الانتشار؛ جهود أبوظبي",
      "supportsClaimIds": [
        "claim.mangrove.abu_dhabi_coastal_habitat.v1",
        "claim.mangrove.wildlife_shelter.v1"
      ],
      "humanReview": "not_run"
    },
    {
      "id": "source.dm.protected_areas.visit_rules.en",
      "title": "Plan Your Visit",
      "authority": "Dubai Municipality — Dubai Protected Areas",
      "language": "en",
      "url": "https://www.dm.gov.ae/dubai-protected-areas/plan-your-visit/",
      "accessedOn": "2026-09-05",
      "directAccess": "opened",
      "evidenceLocator": "Do's and Don'ts",
      "supportsClaimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"],
      "humanReview": "not_run"
    }
  ],
  "messages": [
    {
      "id": "learning.mangroveRoots.title",
      "ar": "بين جذور القرم",
      "en": "Among the Mangrove Roots",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.objective",
      "ar": "نتعلّم كيف توفر موائل القرم الساحلية مأوى للكائنات، وكيف نعتني بها من دون إيذاء أو تلويث.",
      "en": "We learn how coastal mangrove habitats shelter living things and how to care for them without harm or pollution.",
      "claimIds": [
        "claim.mangrove.abu_dhabi_coastal_habitat.v1",
        "claim.mangrove.wildlife_shelter.v1",
        "claim.mangrove.respect_no_harm_or_pollution.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.story.frame1.title",
      "ar": "موطن عند الساحل",
      "en": "A home by the coast",
      "claimIds": ["claim.mangrove.abu_dhabi_coastal_habitat.v1"]
    },
    {
      "id": "learning.mangroveRoots.story.frame1.body",
      "ar": "على سواحل أبوظبي، تنمو غابات القرم قرب المياه الدافئة. وهي موطن محمي للطيور وكائنات بحرية.",
      "en": "Along Abu Dhabi's coast, mangrove forests grow by warm waters. They provide sheltered habitat for birds and marine life.",
      "claimIds": [
        "claim.mangrove.abu_dhabi_coastal_habitat.v1",
        "claim.mangrove.wildlife_shelter.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.story.frame2.title",
      "ar": "مأوى يحتاج إلى عناية",
      "en": "Shelter that needs care",
      "claimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"]
    },
    {
      "id": "learning.mangroveRoots.story.frame2.body",
      "ar": "العناية بموطن القرم تعني ألا نؤذي الكائنات أو النباتات، وألا نلوّث الماء أو التربة. يمكننا تعلّم ذلك من دون زيارة المكان.",
      "en": "Caring for a mangrove habitat means not harming wildlife or plants and not polluting water or soil. We can learn this without visiting the place.",
      "claimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"]
    },
    {
      "id": "learning.mangroveRoots.accessible.section1.heading",
      "ar": "الفكرة الأساسية",
      "en": "Main idea",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.accessible.section1.body",
      "ar": "غابات القرم موائل ساحلية. في أبوظبي تنمو قرب المياه الدافئة، وتوفر مأوى للطيور وكائنات بحرية.",
      "en": "Mangrove forests are coastal habitats. In Abu Dhabi, they grow by warm waters and shelter birds and marine life.",
      "claimIds": [
        "claim.mangrove.abu_dhabi_coastal_habitat.v1",
        "claim.mangrove.wildlife_shelter.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.accessible.section2.heading",
      "ar": "كيف نعتني بالموطن؟",
      "en": "How do we care for the habitat?",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.accessible.section2.body",
      "ar": "لا نؤذي الكائنات أو النباتات، ولا نلوّث الماء أو التربة. لا تحتاج إلى زيارة المكان لتتعلّم هذه الفكرة.",
      "en": "We do not harm wildlife or plants, and we do not pollute water or soil. You do not need to visit the place to learn this idea.",
      "claimIds": ["claim.mangrove.respect_no_harm_or_pollution.v1"]
    },
    {
      "id": "learning.mangroveRoots.check.prompt",
      "ar": "أي اختيار يجمع بين وظيفة موطن القرم وطريقة العناية به؟",
      "en": "Which choice connects what mangrove habitat does with how we care for it?",
      "claimIds": [
        "claim.mangrove.wildlife_shelter.v1",
        "claim.mangrove.respect_no_harm_or_pollution.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.check.option.habitatSupportAndCare",
      "ar": "موائل القرم توفر مأوى للكائنات الساحلية، ونعتني بها من دون إيذاء أو تلويث.",
      "en": "Mangrove habitats shelter coastal life, and we care for them without harming or polluting.",
      "claimIds": [
        "claim.mangrove.wildlife_shelter.v1",
        "claim.mangrove.respect_no_harm_or_pollution.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.check.option.visitOrTaskReward",
      "ar": "الزيارة أو مكافأة التطبيق وحدهما.",
      "en": "A visit or an app reward on its own.",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.check.retry",
      "ar": "ليس بعد. لا تحتاج إلى زيارة، ولا يمنح الدرس مكافأة. اختر الإجابة التي تجمع بين المأوى والعناية، ثم حاول مجددًا.",
      "en": "Not yet. You do not need to visit, and the lesson gives no reward. Choose the answer that connects shelter with care, then try again.",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.check.success",
      "ar": "صحيح. موائل القرم توفر مأوى للكائنات الساحلية، والعناية بها تعني تجنب الإيذاء والتلويث.",
      "en": "Correct. Mangrove habitats shelter coastal life, and care means avoiding harm and pollution.",
      "claimIds": [
        "claim.mangrove.wildlife_shelter.v1",
        "claim.mangrove.respect_no_harm_or_pollution.v1"
      ]
    },
    {
      "id": "learning.mangroveRoots.disclosure",
      "ar": "هذا درس محلي بلا مكافآت: لا يمنح بذورًا أو نموًا، ولا يثبت زيارة أو أثرًا بيئيًا.",
      "en": "This is local learning with no rewards: it awards no Seeds or growth and does not prove a visit or environmental impact.",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.sources.note",
      "ar": "معلومات هذا الدرس مرشحة من صفحات رسمية لهيئة البيئة – أبوظبي وبلدية دبي، وتنتظر مراجعة بشرية قبل الإصدار.",
      "en": "Candidate lesson facts come from official Environment Agency – Abu Dhabi and Dubai Municipality pages and await human review before release.",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.route.accessibleLabel",
      "ar": "نسخة نصية مختصرة",
      "en": "Concise text version",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.route.storyLabel",
      "ar": "نسخة القصة",
      "en": "Story version",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.action.continue",
      "ar": "متابعة",
      "en": "Continue",
      "claimIds": []
    },
    {
      "id": "learning.mangroveRoots.action.complete",
      "ar": "إكمال التعلّم",
      "en": "Complete learning",
      "claimIds": []
    }
  ],
  "check": {
    "id": "check.mangrove_habitat_stewardship.v1",
    "objectiveId": "objective.mangrove_habitat_stewardship.v1",
    "claimIds": [
      "claim.mangrove.abu_dhabi_coastal_habitat.v1",
      "claim.mangrove.wildlife_shelter.v1",
      "claim.mangrove.respect_no_harm_or_pollution.v1"
    ],
    "promptMessageId": "learning.mangroveRoots.check.prompt",
    "correctOptionId": "habitat_support_and_care",
    "incorrectOptionId": "visit_or_task_reward",
    "correctOptionMessageId": "learning.mangroveRoots.check.option.habitatSupportAndCare",
    "incorrectOptionMessageId": "learning.mangroveRoots.check.option.visitOrTaskReward",
    "retryMessageId": "learning.mangroveRoots.check.retry",
    "successMessageId": "learning.mangroveRoots.check.success",
    "noFail": true,
    "retryHasNoLoss": true
  },
  "completionConsequences": {
    "seeds": 0,
    "gardenGrowth": 0,
    "canopy": 0,
    "greenCircle": 0,
    "privateLeague": 0,
    "challengeLeaf": 0,
    "familyReward": 0,
    "taskReward": 0
  },
  "delivery": {
    "deterministicLocal": true,
    "offline": true,
    "finite": true,
    "autoplayNextLearning": false,
    "requiresNetwork": false,
    "opensExternalBrowser": false,
    "requiresGps": false,
    "requiresCamera": false,
    "requiresMicrophone": false,
    "requiresMedia": false
  },
  "release": {
    "featureFlag": "r002b_learning_ui",
    "defaultEnabled": false,
    "activation": "blocked",
    "contentAuthority": "candidate_only"
  },
  "reviewGates": [
    {
      "id": "source_link_and_mutable_fact_revalidation",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    },
    {
      "id": "arabic_english_factual_equivalence",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    },
    {
      "id": "uae_cultural_and_place_wording",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    },
    {
      "id": "child_safeguarding_and_age_comprehension",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    },
    {
      "id": "accessible_equal_credit_equivalence",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    },
    {
      "id": "original_illustration_and_rights",
      "status": "not_run",
      "releaseEffect": "blocks_release_activation"
    }
  ],
  "integration": {
    "messageIdsAreRecommendedResourceKeys": true,
    "singleRuntimeCopyAuthority": "src/i18n/resources.ts",
    "deepFreezeAtAdapterBoundary": true,
    "runtimeRemoteContent": false
  },
  "researchGaps": [
    {
      "sourceUrl": "https://www.ead.gov.ae/-/media/Project/EAD/EAD/Documents/KnowledgeHub/Resources-and-Materials/EAD6735_MANGROVE-INITIATIVE-GUIDELINES_v10b.pdf",
      "status": "not_used_timeout",
      "reliedOnByClaimIds": []
    }
  ]
}
```

<!-- MANGROVE_LEARNING_CANDIDATE_JSON_END -->

## Human release gates

All of these remain **NOT RUN** and each independently blocks release activation:

1. Source-link and mutable-fact revalidation by a named content owner.
2. Arabic/English factual-equivalence review by a named fluent Arabic reviewer.
3. UAE cultural and place-wording review.
4. Child safeguarding and age-comprehension review.
5. Accessible-route objective/equal-credit review.
6. Original illustration provenance and rights clearance; no illustration is supplied here.

Reviewers must record their name, date, decision, and evidence outside this candidate block before
the integration owner can change any gate. Automated checks do not satisfy a named human review.

## TDD evidence

RED was recorded before this document existed:

```text
npx vitest run tests/r002b-learning-content.test.ts --reporter=verbose
Test Files  1 failed (1)
Tests       6 failed (6)
Reason      candidate evidence document must exist: expected false to be true
```

The test validates identity, bilingual key parity, equal route coverage, claim-to-source
traceability, bounded offline delivery, zero reward, absent executable/remote content, and all
pending gates. It does not approve facts, translation, culture, safeguarding, accessibility, or
rights.
