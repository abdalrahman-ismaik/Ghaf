/**
 * Synthetic, public-demo content for the deterministic Ghaf journey.
 *
 * This module deliberately owns content only. It does not import application models so the
 * mission schema can evolve without coupling bilingual copy or prepared-asset metadata to state.
 */

export type DemoLocale = 'ar' | 'en';

export type DemoLocalizedText = Readonly<Record<DemoLocale, string>>;

export type DemoMediaAssetId =
  | 'food-rescue-bread'
  | 'child-evidence'
  | 'family-wisdom-ar'
  | 'family-wisdom-en'
  | 'mission-narration-ar'
  | 'mission-narration-en';

export type DemoMediaKind = 'food-image' | 'evidence-image' | 'family-voice-note' | 'narration';

export interface DemoMediaAsset {
  readonly id: DemoMediaAssetId;
  readonly fileName: string;
  readonly relativePath: `assets/demo/${string}`;
  readonly kind: DemoMediaKind;
  readonly locale: DemoLocale | null;
  readonly label: DemoLocalizedText;
  readonly origin: 'prepared';
  readonly mimeType: 'image/jpeg' | 'audio/mpeg';
  readonly durationMs: number | null;
}

export interface DemoGeneratedMissionPayload {
  readonly schemaVersion: '1.0';
  readonly title: DemoLocalizedText;
  readonly story: DemoLocalizedText;
  readonly steps: readonly [
    { readonly order: 1; readonly instruction: DemoLocalizedText },
    { readonly order: 2; readonly instruction: DemoLocalizedText },
    { readonly order: 3; readonly instruction: DemoLocalizedText },
  ];
  readonly reflectionPrompt: DemoLocalizedText;
  readonly impactTarget: {
    readonly value: 250;
    readonly unit: 'grams';
  };
  readonly evidenceMethod: 'either';
  readonly reward: DemoLocalizedText;
  readonly personalization: {
    readonly childAgeBand: '8-10';
    readonly foodSituation: DemoLocalizedText;
    readonly familyWisdomSummary: DemoLocalizedText;
    readonly availableMinutes: 15;
  };
}

export const demoMediaAssets = {
  foodImage: {
    id: 'food-rescue-bread',
    fileName: 'food-rescue-bread.jpg',
    relativePath: 'assets/demo/food-rescue-bread.jpg',
    kind: 'food-image',
    locale: null,
    label: {
      ar: 'صورة مجهّزة لخبز متبقٍّ بعد الغداء',
      en: 'Prepared image of extra flatbread after lunch',
    },
    origin: 'prepared',
    mimeType: 'image/jpeg',
    durationMs: null,
  },
  evidenceImage: {
    id: 'child-evidence',
    fileName: 'child-evidence.jpg',
    relativePath: 'assets/demo/child-evidence.jpg',
    kind: 'evidence-image',
    locale: null,
    label: {
      ar: 'صورة دليل مجهّزة لسلطة عائلية مع قطع الخبز المحمّص',
      en: 'Prepared evidence image of a family salad with toasted bread pieces',
    },
    origin: 'prepared',
    mimeType: 'image/jpeg',
    durationMs: null,
  },
  familyWisdomArabic: {
    id: 'family-wisdom-ar',
    fileName: 'family-wisdom-ar.mp3',
    relativePath: 'assets/demo/family-wisdom-ar.mp3',
    kind: 'family-voice-note',
    locale: 'ar',
    label: {
      ar: 'رسالة الحكمة العائلية المجهّزة بالعربية',
      en: 'Prepared family-wisdom message in Arabic',
    },
    origin: 'prepared',
    mimeType: 'audio/mpeg',
    durationMs: 11_424,
  },
  familyWisdomEnglish: {
    id: 'family-wisdom-en',
    fileName: 'family-wisdom-en.mp3',
    relativePath: 'assets/demo/family-wisdom-en.mp3',
    kind: 'family-voice-note',
    locale: 'en',
    label: {
      ar: 'رسالة الحكمة العائلية المجهّزة بالإنجليزية',
      en: 'Prepared family-wisdom message in English',
    },
    origin: 'prepared',
    mimeType: 'audio/mpeg',
    durationMs: 8_376,
  },
  missionNarrationArabic: {
    id: 'mission-narration-ar',
    fileName: 'mission-narration-ar.mp3',
    relativePath: 'assets/demo/mission-narration-ar.mp3',
    kind: 'narration',
    locale: 'ar',
    label: {
      ar: 'سرد مغامرة إنقاذ الخبز بالعربية',
      en: 'Arabic narration of the bread-rescue adventure',
    },
    origin: 'prepared',
    mimeType: 'audio/mpeg',
    durationMs: 18_288,
  },
  missionNarrationEnglish: {
    id: 'mission-narration-en',
    fileName: 'mission-narration-en.mp3',
    relativePath: 'assets/demo/mission-narration-en.mp3',
    kind: 'narration',
    locale: 'en',
    label: {
      ar: 'سرد مغامرة إنقاذ الخبز بالإنجليزية',
      en: 'English narration of the bread-rescue adventure',
    },
    origin: 'prepared',
    mimeType: 'audio/mpeg',
    durationMs: 12_048,
  },
} as const satisfies Record<string, DemoMediaAsset>;

export const demoFamilyWisdom = {
  transcript: {
    ar: 'يا سالم، خبز اليوم نعمة. بدلًا من رميه، لنحوّله إلى وجبة خفيفة، ولنشارك عائلتنا ما يزيد منه.',
    en: "Salem, today's bread is a blessing. Instead of throwing it away, let's turn it into a snack and share any extra with our family.",
  },
  summary: {
    ar: 'حفظ الخبز المتبقّي أو استخدامه بطريقة جديدة مع العائلة بدل هدره.',
    en: 'Save extra bread or reuse it with the family instead of wasting it.',
  },
} as const;

export const demoMissionNarration = {
  transcript: {
    ar: 'مغامرة من الخبز إلى الكنز. اطلب من وليّ أمرك أن يقرّر إن كان الخبز مناسبًا للنشاط، ثم حوّلاه معًا إلى خبز محمّص، ووثّقا النتيجة. هل أنت مستعد لمساعدة شجرة الغاف على النمو؟',
    en: 'The Bread-to-Treasure Adventure. Ask a Parent to decide whether the bread is suitable for the activity, then turn it into toast together and document the result. Ready to help your Ghaf tree grow?',
  },
} as const;

export const demoMissionPayload = {
  schemaVersion: '1.0',
  title: {
    ar: 'مغامرة من الخبز إلى الكنز',
    en: 'The Bread-to-Treasure Adventure',
  },
  story: {
    ar: 'تذكّرت عائلة سالم أن الطعام نعمة نحافظ عليها ونشاركها. بقيت حصتان من الخبز بعد الغداء. خلال 15 دقيقة، سيعمل سالم مع وليّ أمره ليستخدمهما بطريقة جديدة ويمنع هدر نحو 250 غرامًا من الخبز.',
    en: "Salem's family remembered that food is a blessing worth caring for and sharing. Two portions of bread remained after lunch. In 15 minutes, Salem and a Parent will give them a new purpose and keep about 250 grams of bread from going to waste.",
  },
  steps: [
    {
      order: 1,
      instruction: {
        ar: 'اطلب من وليّ أمرك أن يقرّر إن كان الخبز مناسبًا للنشاط، ثم ضع حصتين في طبق نظيف.',
        en: 'Ask a Parent to decide whether the bread is suitable for the activity, then place two portions on a clean plate.',
      },
    },
    {
      order: 2,
      instruction: {
        ar: 'بمساعدة وليّ أمرك، قطّع الخبز وحمّصه ليصبح قطعًا مقرمشة تُضاف إلى سلطة العائلة.',
        en: "With a Parent's help, tear and toast the bread into crunchy pieces for the family salad.",
      },
    },
    {
      order: 3,
      instruction: {
        ar: 'شارك الطبق مع العائلة، ورتّب المكان، ثم اطلب من وليّ أمرك توثيق النتيجة.',
        en: 'Share the dish with your family, tidy the space, then ask a Parent to document the result.',
      },
    },
  ],
  reflectionPrompt: {
    ar: 'ما الفكرة التي ستجرّبها مع الطعام الفائض في المرة القادمة؟',
    en: 'What idea will you try with extra food next time?',
  },
  impactTarget: {
    value: 250,
    unit: 'grams',
  },
  evidenceMethod: 'either',
  reward: {
    ar: 'ورقة الغاف الذهبية',
    en: 'Golden Ghaf Leaf',
  },
  personalization: {
    childAgeBand: '8-10',
    foodSituation: {
      ar: 'حصتان من الخبز المتبقّي بعد الغداء، بوزن تقديري 250 غرامًا.',
      en: 'Two portions of extra bread after lunch, estimated at 250 grams.',
    },
    familyWisdomSummary: demoFamilyWisdom.summary,
    availableMinutes: 15,
  },
} as const satisfies DemoGeneratedMissionPayload;

export const demoScenario = {
  id: 'bread-rescue-demo',
  family: {
    id: 'family-ghaf-demo',
    displayName: { ar: 'عائلة الغاف', en: 'Ghaf Family' },
  },
  parent: {
    id: 'parent-demo',
    displayName: { ar: 'أم سالم', en: "Salem's Parent" },
  },
  child: {
    id: 'child-salem-demo',
    displayName: { ar: 'سالم', en: 'Salem' },
    ageBand: '8-10',
  },
  inputDefaults: {
    quantity: { value: 250, unit: 'grams' as const },
    equivalentPortions: 2,
    availableMinutes: 15,
    reward: demoMissionPayload.reward,
  },
  mission: {
    id: 'mission-bread-rescue-demo',
    generationAttemptId: 'generation-bread-rescue-demo',
    origin: 'pregenerated-mock' as const,
    payload: demoMissionPayload,
  },
  submission: {
    id: 'submission-bread-rescue-demo',
    reflection: {
      ar: 'سأسأل عائلتي كيف نحفظ الطعام الإضافي قبل أن نفكر في رميه.',
      en: 'I will ask my family how we can save extra food before thinking about throwing it away.',
    },
    retryGuidance: {
      ar: 'رتّب المكان، ثم أعد إرسال صورة واضحة للطبق.',
      en: 'Tidy the space, then send one clear photo of the dish.',
    },
  },
  completion: {
    confirmedQuantity: { value: 250, unit: 'grams' as const },
    equivalentPortions: 2,
    awardedProgress: 12,
    reward: demoMissionPayload.reward,
  },
  ghaf: {
    before: { stage: 2, progressPercent: 48 },
    after: { stage: 3, progressPercent: 60 },
    milestoneId: 'new-branch',
    milestone: {
      ar: 'ظهر غصن جديد في غاف العائلة',
      en: 'A new branch appeared on the family Ghaf',
    },
  },
  safeguards: {
    parentDecision: {
      ar: 'غاف لا يقيّم سلامة الطعام. يقرّر وليّ الأمر ما إذا كان الطعام مناسبًا للنشاط، وعند الشك يختار حالة أخرى.',
      en: 'Ghaf does not assess food safety. A Parent decides what is suitable for the activity; when unsure, choose another situation.',
    },
    childReminder: {
      ar: 'اسأل وليّ أمرك دائمًا قبل استخدام أي طعام أو أدوات مطبخ.',
      en: 'Always ask a Parent before using any food or kitchen tools.',
    },
  },
} as const;
