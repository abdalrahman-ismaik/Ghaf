import type {
  ApprovedChoiceFixture,
  SyntheticChildProfile,
  SyntheticHousehold,
  TaskCategory,
  TaskSafetyBoundary,
  TaskTemplate,
} from '../../models/familyGrowth';

const text = (ar: string, en: string) => ({ ar, en }) as const;

const EMPTY_SAFE_BOUNDARY: TaskSafetyBoundary = {
  adultPreCheck: text(
    'يختار وليّ الأمر المهمة المناسبة.',
    'A Parent chooses the appropriate task.',
  ),
  adultSecondCheck: text(
    'يتحقق وليّ الأمر من اكتمال المهمة بأمان.',
    'A Parent checks that the task was completed safely.',
  ),
  adultOwnedActions: [
    text('يتولى الشخص البالغ أي خطوة تحتاج إلى إشراف.', 'An adult owns any supervised step.'),
  ],
  childAllowedActions: [
    text('ينفذ الطفل الخطوة الآمنة المتفق عليها.', 'The Child completes the agreed safe step.'),
  ],
  excludedHazards: [
    text(
      'لا تشمل المهمة الأدوات الحادّة أو المواد الكيميائية أو الأعمال الكهربائية.',
      'The task excludes sharps, chemicals, and electrical work.',
    ),
  ],
  stopAndAskAdult: text('توقّف واسأل شخصاً بالغاً عند الشك.', 'Stop and ask an adult when unsure.'),
  routeConstraint: null,
  indoorAlternative: null,
  aftercare: null,
};

export const TASK_CATEGORIES: readonly TaskCategory[] = [
  {
    id: 'faith_gratitude',
    label: text('الإيمان والامتنان', 'Faith & Gratitude'),
    landscapeId: 'sidr',
    defaultVisibilityScope: 'child_guardian',
    circleMayBeEligible: false,
    contentReviewStatus: 'named_human_review_required',
  },
  {
    id: 'roots_kinship',
    label: text('جذورنا', 'Roots & Kinship'),
    landscapeId: 'ghaf',
    defaultVisibilityScope: 'child_guardian',
    circleMayBeEligible: false,
    contentReviewStatus: 'named_human_review_required',
  },
  {
    id: 'home_responsibility',
    label: text('مسؤوليتي', 'Home Responsibility'),
    landscapeId: 'samar',
    defaultVisibilityScope: 'household',
    circleMayBeEligible: false,
    contentReviewStatus: 'reviewed_p0',
  },
  {
    id: 'green_impact',
    label: text('أثر أخضر', 'Green Impact'),
    landscapeId: 'mangrove',
    defaultVisibilityScope: 'household',
    circleMayBeEligible: true,
    contentReviewStatus: 'reviewed_p0',
  },
  {
    id: 'food_hospitality',
    label: text('النعمة والضيافة', 'Food & Hospitality'),
    landscapeId: 'date_palm',
    defaultVisibilityScope: 'household',
    circleMayBeEligible: false,
    contentReviewStatus: 'named_human_review_required',
  },
  {
    id: 'heritage_etiquette',
    label: text('تراثنا وآدابنا', 'Heritage & Etiquette'),
    landscapeId: 'ghaf',
    defaultVisibilityScope: 'household',
    circleMayBeEligible: false,
    contentReviewStatus: 'named_human_review_required',
  },
  {
    id: 'kindness_community',
    label: text('اللطف والمجتمع', 'Kindness & Community'),
    landscapeId: 'samar',
    defaultVisibilityScope: 'household',
    circleMayBeEligible: false,
    contentReviewStatus: 'named_human_review_required',
  },
  {
    id: 'learning_wellbeing',
    label: text('التعلّم والتوازن', 'Learning & Wellbeing'),
    landscapeId: 'sidr',
    defaultVisibilityScope: 'child_guardian',
    circleMayBeEligible: false,
    contentReviewStatus: 'reviewed_p0',
  },
] as const;

const P0_SAFETY: TaskSafetyBoundary = {
  adultPreCheck: text(
    'يفحص شخص بالغ جميع المواد مسبقاً؛ ويقتصر الفرز على الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي.',
    'An adult pre-checks every item; use only intact, non-sharp clean paper and plastic accepted by the household local recycling stream.',
  ),
  adultSecondCheck: text(
    'يعيد الشخص البالغ الفحص قبل إغلاق الكيس.',
    'The adult performs a second check before the lightweight recycling bag is closed.',
  ),
  adultOwnedActions: [
    text(
      'يقيّم الشخص البالغ الحرارة وحركة المركبات، ويحمل الكيس ويتولى التخلّص منه.',
      'The adult assesses heat and traffic, must carry the bag, and owns disposal.',
    ),
    text(
      'يختار الشخص البالغ المسار الآمن ويتولى جميع خطوات الحاوية.',
      'The adult chooses and owns the safe route and every disposal-bin action.',
    ),
  ],
  childAllowedActions: [
    text(
      'يفرز سالم فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين اللذين وافق عليهما شخص بالغ.',
      'Salem sorts only intact, non-sharp clean paper and plastic approved by an adult.',
    ),
    text(
      'بعد الفحص الثاني، يمكن لسالم المساعدة في إغلاق كيس إعادة تدوير خفيف ثم مرافقة الشخص البالغ.',
      'After the second adult check, Salem may help close one light recycling bag and accompany the adult.',
    ),
  ],
  excludedHazards: [
    text(
      'يُمنع لمس الزجاج أو الأدوات الحادّة أو البطاريات أو المواد الكيميائية أو الأدوية أو المواد الفاسدة أو الأكياس المتسربة أو أي مادة مجهولة.',
      'Do not touch glass, sharps, batteries, chemicals, medicine, spoiled material, leaking bags, or unknown waste.',
    ),
    text(
      'يُمنع إصلاح الحاويات أو الأجهزة أو المصابيح أو أي شيء كهربائي.',
      'Do not repair a bin, appliance, light, or electrical item.',
    ),
  ],
  stopAndAskAdult: text(
    'يجب التوقّف وسؤال شخص بالغ عند الشك.',
    'Stop and ask an adult whenever anything is uncertain.',
  ),
  routeConstraint: text(
    'لا يتطلب المسار عبور طريق، ويبقى الطفل بعيداً عن مسارات المركبات والضواغط والمزالق وآلات غرف الحاويات.',
    'The route requires no road crossing and keeps the Child out of vehicle paths, compactors, waste chutes, and bin-room machinery.',
  ),
  indoorAlternative: text(
    'تؤجَّل الرحلة أو يُستخدم بديل داخلي إذا كانت الحرارة أو حركة المركبات غير آمنة.',
    'Postpone the route or use an indoor alternative if heat or traffic is unsafe.',
  ),
  aftercare: text('تُغسل اليدان بعد الانتهاء.', 'Wash hands afterward.'),
};

const P0_INDOOR_SAFE_EQUIVALENT_SAFETY: TaskSafetyBoundary = {
  adultPreCheck: P0_SAFETY.adultPreCheck,
  adultSecondCheck: text(
    'يراجع الشخص البالغ المواد المفروزة قبل نقلها لاحقاً.',
    'The adult reviews the sorted items before moving them later.',
  ),
  adultOwnedActions: [
    text(
      'يتولى الشخص البالغ أي حمل أو نقل أو تخلّص؛ وتنتهي مهمة سالم داخل المنزل.',
      'The adult owns every carry, transfer, and disposal action; Salem’s task ends indoors.',
    ),
  ],
  childAllowedActions: [
    text(
      'يفرز سالم داخل المنزل فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين اللذين وافق عليهما شخص بالغ.',
      'Indoors, Salem sorts only intact, non-sharp clean paper and plastic approved by an adult.',
    ),
  ],
  excludedHazards: P0_SAFETY.excludedHazards,
  stopAndAskAdult: P0_SAFETY.stopAndAskAdult,
  routeConstraint: text(
    'تبقى هذه المهمة داخل المنزل؛ ولا يحمل سالم كيساً ولا يذهب إلى الحاوية أو مسار التخلّص.',
    'This task stays indoors; Salem does not carry a bag or go to the bin or disposal route.',
  ),
  indoorAlternative: null,
  aftercare: P0_SAFETY.aftercare,
};

export const P0_RECYCLING_TEMPLATE: TaskTemplate = {
  id: 'task_recycling_p0_v1',
  categoryId: 'green_impact',
  landscapeId: 'mangrove',
  title: text(
    'فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر',
    'Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin',
  ),
  positiveAction: text(
    'فرز المواد النظيفة المقبولة محلياً ثم مرافقة شخص بالغ عبر مسار آمن.',
    'Sort locally accepted clean recyclables, then accompany an adult on a safe route.',
  ),
  whyItMatters: text(
    'يساعد الفرز الدقيق الأسرة على التعامل بمسؤولية مع المواد القابلة لإعادة التدوير. هذه صلة عملية بالاستدامة، وليست قياساً لكمية الكربون أو الماء أو النفايات، ولا تعني زراعة شجرة حقيقية.',
    'Careful sorting helps the household handle recyclable materials responsibly. This is a practical sustainability connection, not a quantified carbon, water, waste, or real-tree claim.',
  ),
  definitionOfDone: text(
    'بعد أن يفحص شخص بالغ المواد مسبقاً، يفرز سالم الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي، ويضعهما في الحاوية المنزلية الصحيحة. عند الحاجة، يساعد سالم بعد فحص ثانٍ من الشخص البالغ على إغلاق كيس إعادة تدوير خفيف، ثم يرافق الشخص البالغ عبر مسار آمن يوافق عليه وليّ الأمر. يقيّم الشخص البالغ الحرارة وحركة المركبات، ويحمل الكيس ويتولى التخلّص منه. لا يتطلب المسار عبور طريق، ويبقى سالم بعيداً عن مسارات المركبات وضواغط النفايات ومزالقها وآلات غرف الحاويات. إذا كانت الحرارة أو حركة المركبات غير آمنة، تؤجَّل الرحلة أو يُستخدم بديل للفرز داخل المنزل. النفايات المنزلية العامة ليست جزءاً من هذه المهمة.',
    'After an adult pre-check, Salem sorts intact, non-sharp clean paper and plastic accepted by the local stream into the correct household recycling container. If needed, Salem helps after the adult second check to close one lightweight recycling bag, then accompanies the adult on a guardian-approved safe route. The adult assesses heat and traffic, carries the bag, and handles disposal. The route requires no road crossing, and Salem stays out of vehicle paths, compactors, waste chutes, and bin-room machinery. If heat or traffic is unsafe, the family postpones the route or uses an indoor sorting alternative. General household waste is not part of this task.',
  ),
  childAgeBands: ['6_8', '9_11', '12_14'],
  estimatedEffort: text('15–30 دقيقة', '15–30 minutes'),
  permittedHelp: text(
    'تُقبل المساعدة المسموح بها ولا تقلل المكافأة المعروضة.',
    'Permitted help counts and does not reduce the displayed award.',
  ),
  supervision: text(
    'حضور شخص بالغ وفحصه وحمله للكيس وتوليه المسار والتخلّص مطلوب.',
    'An adult must be present, perform both checks, carry the bag, own the route, and handle disposal.',
  ),
  safety: P0_SAFETY,
  evidencePolicy: 'optional_prepared_only',
  reflectionPolicy: 'optional_task_focused',
  recognitionMode: 'standard',
  routinePhase: 'acquisition',
  recurrence: 'once',
  displayedSeedAward: 12,
  visibilityScope: 'household',
  circleEligible: true,
  privacyNotice: text(
    'يرى وليّ الأمر تفاصيل المهمة؛ ولا يصل إلى الدائرة سوى إجراء أخضر إجمالي واحد.',
    'The Parent sees task details; only one coarse Green action can reach the circle.',
  ),
  origin: 'prepared',
};

export const P0_SAFE_EQUIVALENT_TEMPLATE: TaskTemplate = {
  id: 'task_recycling_indoor_safe_equivalent_v1',
  categoryId: 'green_impact',
  landscapeId: 'mangrove',
  title: text(
    'فرز آمن للمواد النظيفة داخل المنزل مع شخص بالغ',
    'Safe indoor sorting of clean recyclables with an adult',
  ),
  positiveAction: text(
    'افرز داخل المنزل الورق والبلاستيك النظيفين اللذين فحصهما شخص بالغ، ثم اترك النقل والتخلّص للشخص البالغ.',
    'Indoors, sort the clean paper and plastic an adult checked, then leave all carrying and disposal to the adult.',
  ),
  whyItMatters: text(
    'يحافظ الفرز الداخلي على الصلة العملية بالاستدامة عندما لا يكون مسار الحاوية مناسباً. وهو نشاط مُبلغ عنه ذاتياً، وليس قياساً للأثر البيئي.',
    'Indoor sorting keeps the practical sustainability action when the bin route is not suitable. It is a self-reported activity, not measured environmental impact.',
  ),
  definitionOfDone: text(
    'بعد فحص شخص بالغ، يفرز سالم داخل المنزل فقط الورق والبلاستيك النظيفين والسليمين وغير الحادّين في حاوية الفرز المنزلية الصحيحة. تنتهي مهمة سالم هناك؛ ويتولى الشخص البالغ لاحقاً كل حمل ونقل وتخلّص.',
    'After an adult check, Salem sorts only intact, non-sharp clean paper and plastic into the correct household sorting container indoors. Salem’s task ends there; the adult owns all later carrying, transfer, and disposal.',
  ),
  childAgeBands: ['6_8', '9_11', '12_14'],
  estimatedEffort: text('نحو عشر دقائق', 'About ten minutes'),
  permittedHelp: text(
    'تُقبل المساعدة المتفق عليها ولا تقلل التقدير المعروض.',
    'Agreed help counts and does not reduce the displayed award.',
  ),
  supervision: text(
    'يبقى شخص بالغ حاضراً، ويفحص المواد، ويتولى كل حمل ونقل وتخلّص.',
    'An adult stays present, checks the items, and owns every carry, transfer, and disposal action.',
  ),
  safety: P0_INDOOR_SAFE_EQUIVALENT_SAFETY,
  evidencePolicy: 'optional_prepared_only',
  reflectionPolicy: 'optional_task_focused',
  recognitionMode: 'standard',
  routinePhase: 'acquisition',
  recurrence: 'once',
  displayedSeedAward: 12,
  visibilityScope: 'household',
  circleEligible: true,
  privacyNotice: P0_RECYCLING_TEMPLATE.privacyNotice,
  origin: 'prepared',
};

function template(
  values: Pick<
    TaskTemplate,
    | 'id'
    | 'categoryId'
    | 'landscapeId'
    | 'title'
    | 'positiveAction'
    | 'recognitionMode'
    | 'routinePhase'
    | 'recurrence'
    | 'displayedSeedAward'
    | 'visibilityScope'
    | 'circleEligible'
  > &
    Partial<Pick<TaskTemplate, 'safety' | 'supervision'>>,
): TaskTemplate {
  return {
    ...values,
    whyItMatters: text(
      'تربط المهمة خطوة واضحة بحاجة عائلية.',
      'The task links one clear action to a family need.',
    ),
    definitionOfDone: values.positiveAction,
    childAgeBands: ['6_8', '9_11', '12_14'],
    estimatedEffort: text('نحو خمس إلى عشر دقائق', 'About five to ten minutes'),
    permittedHelp: text('المساعدة المتفق عليها مسموحة.', 'Agreed help is allowed.'),
    supervision:
      values.supervision ??
      text('يحدد وليّ الأمر مستوى الإشراف.', 'A Parent sets the supervision level.'),
    safety: values.safety ?? EMPTY_SAFE_BOUNDARY,
    evidencePolicy: 'none',
    reflectionPolicy: 'none',
    privacyNotice: text(
      'تظل التفاصيل ضمن نطاق الخصوصية المحدد للمهمة.',
      'Details stay within the task privacy scope.',
    ),
    origin: 'prepared',
  };
}

const HOSPITALITY_SAFETY: TaskSafetyBoundary = {
  ...EMPTY_SAFE_BOUNDARY,
  adultOwnedActions: [
    text(
      'يتولى الشخص البالغ حمل وصب القهوة العربية الساخنة.',
      'An adult alone handles and pours hot gahwa.',
    ),
  ],
  childAllowedActions: [
    text(
      'يمكن للطفل ترتيب التمر أو الماء أو المناديل.',
      'The Child may arrange dates, water, or napkins.',
    ),
  ],
  excludedHazards: [
    text(
      'لا يلمس الطفل السوائل أو الأواني الساخنة.',
      'The Child does not touch hot liquids or vessels.',
    ),
  ],
};

const GENERAL_WASTE_SAFETY: TaskSafetyBoundary = {
  ...EMPTY_SAFE_BOUNDARY,
  adultPreCheck: text(
    'يفحص شخص بالغ الكيس المغلق والخفيف.',
    'An adult checks the sealed light bag.',
  ),
  adultOwnedActions: [
    text(
      'يحمل الشخص البالغ الكيس ويتولى التخلّص منه.',
      'The adult carries and disposes of the bag.',
    ),
  ],
  excludedHazards: [
    text(
      'لا زجاج ولا أدوات حادّة ولا بطاريات ولا مواد كيميائية أو مجهولة.',
      'No glass, sharps, batteries, chemicals, or unknown waste.',
    ),
  ],
};

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  template({
    id: 'FA01',
    categoryId: 'faith_gratitude',
    landscapeId: 'sidr',
    title: text('تجهيز مكان نظيف للصلاة', 'Prepare a clean prayer space'),
    positiveAction: text(
      'جهّز مكاناً نظيفاً يختاره وليّ الأمر.',
      'Prepare a clean space chosen by the Parent.',
    ),
    recognitionMode: 'recognition_only',
    routinePhase: 'not_applicable',
    recurrence: 'recurrent',
    displayedSeedAward: null,
    visibilityScope: 'child_guardian',
    circleEligible: false,
  }),
  template({
    id: 'FA02',
    categoryId: 'faith_gratitude',
    landscapeId: 'sidr',
    title: text('التعرّف إلى عبارة يختارها وليّ الأمر', 'Learn one Parent-approved phrase'),
    positiveAction: text(
      'تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.',
      'Learn a phrase from a Parent-approved source.',
    ),
    recognitionMode: 'recognition_only',
    routinePhase: 'not_applicable',
    recurrence: 'once',
    displayedSeedAward: null,
    visibilityScope: 'child_guardian',
    circleEligible: false,
  }),
  template({
    id: 'RK04',
    categoryId: 'roots_kinship',
    landscapeId: 'ghaf',
    title: text(
      'قضاء عشر دقائق من دون هاتف مع قريب يرغب في المشاركة',
      'Spend ten phone-free minutes with a willing relative',
    ),
    positiveAction: text(
      'اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.',
      'Spend a short time with a willing relative.',
    ),
    recognitionMode: 'recognition_only',
    routinePhase: 'not_applicable',
    recurrence: 'recurrent',
    displayedSeedAward: null,
    visibilityScope: 'household',
    circleEligible: false,
  }),
  template({
    id: 'HR02',
    categoryId: 'home_responsibility',
    landscapeId: 'samar',
    title: text('تجهيز حقيبة المدرسة للغد', "Prepare tomorrow's school bag"),
    positiveAction: text(
      'ضع مواد الغد في الحقيبة باستخدام قائمة.',
      'Use a checklist to place tomorrow items in the bag.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 6,
    visibilityScope: 'household',
    circleEligible: false,
  }),
  template({
    id: 'HR05',
    categoryId: 'home_responsibility',
    landscapeId: 'samar',
    title: text(
      'مساعدة شخص بالغ في كيس نفايات عامة خفيف ومغلق',
      'Help an adult with a sealed light general-waste bag',
    ),
    positiveAction: text(
      'ساعد من الداخل فقط بينما يحمل الشخص البالغ الكيس.',
      'Help indoors while the adult carries the bag.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 8,
    visibilityScope: 'household',
    circleEligible: false,
    safety: GENERAL_WASTE_SAFETY,
  }),
  template({
    id: 'GI01',
    categoryId: 'green_impact',
    landscapeId: 'mangrove',
    title: text('فرز المواد النظيفة المقبولة محلياً', 'Sort locally accepted clean recyclables'),
    positiveAction: text(
      'افرز الورق والبلاستيك النظيفين بعد فحص شخص بالغ.',
      'Sort clean paper and plastic after an adult check.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 8,
    visibilityScope: 'household',
    circleEligible: true,
    safety: P0_SAFETY,
  }),
  template({
    id: 'FH01',
    categoryId: 'food_hospitality',
    landscapeId: 'date_palm',
    title: text('المساعدة في طبق تقديم مشترك', 'Help prepare a shared serving dish'),
    positiveAction: text(
      'ضع كمية يوافق عليها وليّ الأمر في طبق مشترك.',
      'Place a Parent-approved amount in a shared serving dish.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 4,
    visibilityScope: 'household',
    circleEligible: false,
  }),
  template({
    id: 'FH04',
    categoryId: 'food_hospitality',
    landscapeId: 'date_palm',
    title: text(
      'ترتيب التمر أو الماء أو المناديل للضيوف',
      'Arrange dates, water, or napkins for guests',
    ),
    positiveAction: text(
      'رتّب مواد الضيافة الباردة والآمنة.',
      'Arrange safe, cool hospitality items.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 6,
    visibilityScope: 'household',
    circleEligible: false,
    safety: HOSPITALITY_SAFETY,
  }),
  template({
    id: 'KC01',
    categoryId: 'kindness_community',
    landscapeId: 'samar',
    title: text(
      'المساعدة في مهمة صغيرة يختارها الأخ أو الأخت',
      'Help with one small job a sibling chooses',
    ),
    positiveAction: text(
      'اعرض مساعدة طوعية في مهمة صغيرة.',
      'Offer voluntary help with one small job.',
    ),
    recognitionMode: 'recognition_only',
    routinePhase: 'not_applicable',
    recurrence: 'recurrent',
    displayedSeedAward: null,
    visibilityScope: 'household',
    circleEligible: false,
  }),
  template({
    id: 'LW01',
    categoryId: 'learning_wellbeing',
    landscapeId: 'sidr',
    title: text(
      'القراءة أو الاستماع إلى كتاب لمدة عشر دقائق',
      'Read or listen to a book for ten minutes',
    ),
    positiveAction: text(
      'اقرأ أو استمع بصيغة ميسّرة لمدة عشر دقائق.',
      'Read or listen in an accessible format for ten minutes.',
    ),
    recognitionMode: 'fade_first',
    routinePhase: 'acquisition',
    recurrence: 'recurrent',
    displayedSeedAward: 6,
    visibilityScope: 'child_guardian',
    circleEligible: false,
  }),
] as const;

export interface CulturalPhraseOptionGroup {
  readonly situation: 'general_greeting' | 'wedding_congratulations';
  readonly options: readonly { readonly id: string; readonly ar: string; readonly en: string }[];
  readonly parentApprovalRequired: true;
  readonly namedHumanReviewRequired: true;
}

export const CULTURAL_PHRASE_OPTIONS: readonly CulturalPhraseOptionGroup[] = [
  {
    situation: 'general_greeting',
    options: [
      { id: 'greeting_salam', ar: 'السلام عليكم', en: 'Peace be upon you' },
      { id: 'greeting_marhaban', ar: 'مرحباً', en: 'Hello' },
      { id: 'greeting_ahlan', ar: 'أهلاً وسهلاً', en: 'Welcome' },
    ],
    parentApprovalRequired: true,
    namedHumanReviewRequired: true,
  },
  {
    situation: 'wedding_congratulations',
    options: [
      {
        id: 'wedding_bride',
        ar: 'ألف مبروك، أتمنى لكِ حياةً سعيدة',
        en: 'Congratulations; I wish you a happy life',
      },
      {
        id: 'wedding_groom',
        ar: 'ألف مبروك، أتمنى لكَ حياةً سعيدة',
        en: 'Congratulations; I wish you a happy life',
      },
      {
        id: 'wedding_couple',
        ar: 'مبارك لكما، أتمنى لكما حياةً سعيدة',
        en: 'Congratulations to you both',
      },
    ],
    parentApprovalRequired: true,
    namedHumanReviewRequired: true,
  },
] as const;

export const SYNTHETIC_HOUSEHOLD: SyntheticHousehold = {
  id: 'household_al_noor',
  displayName: text('أسرة النور', 'Al Noor family'),
  origin: 'synthetic',
  childIds: ['child_salem', 'child_alya'],
  combinedCanopy: { contributionLeaves: 19, goalLeaves: 25 },
};

export const SYNTHETIC_CHILDREN: Readonly<
  Record<SyntheticChildProfile['id'], SyntheticChildProfile>
> = {
  child_salem: {
    id: 'child_salem',
    displayName: text('سالم', 'Salem'),
    age: 9,
    ageBand: '9_11',
    origin: 'synthetic',
    earnedSeeds: 48,
  },
  child_alya: {
    id: 'child_alya',
    displayName: text('علياء', 'Alya'),
    age: 11,
    ageBand: '9_11',
    origin: 'synthetic',
    earnedSeeds: 36,
  },
};

export const RESET_PREVIEW_CHOICES: readonly [ApprovedChoiceFixture, ApprovedChoiceFixture] = [
  {
    id: 'choice_preview_hr02_v1',
    childId: 'child_salem',
    taskTemplateId: 'HR02',
    approvalState: 'parent_approved_fixture',
    demoAvailability: 'display_only',
    origin: 'prepared',
  },
  {
    id: 'choice_preview_lw01_v1',
    childId: 'child_salem',
    taskTemplateId: 'LW01',
    approvalState: 'parent_approved_fixture',
    demoAvailability: 'display_only',
    origin: 'prepared',
  },
];

export const P0_EXECUTABLE_CHOICE: ApprovedChoiceFixture = {
  id: 'choice_recycling_p0_v1',
  childId: 'child_salem',
  taskTemplateId: 'task_recycling_p0_v1',
  approvalState: 'parent_approved_fixture',
  demoAvailability: 'p0_executable',
  origin: 'prepared',
};
