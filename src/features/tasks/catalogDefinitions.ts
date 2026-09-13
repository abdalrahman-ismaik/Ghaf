import type { TaskSafetyBoundary, TaskTemplate } from '@/models/familyGrowth';

// CE1 engineering content; named Arabic, cultural and age-suitability review remains pending.
interface CatalogDefinition {
  title: TaskTemplate['title'];
  positiveAction: TaskTemplate['positiveAction'];
  definitionOfDone: TaskTemplate['definitionOfDone'];
  catalogExecution: NonNullable<TaskTemplate['catalogExecution']>;
  safetyPatch?: Partial<TaskSafetyBoundary>;
}

const definitions: Readonly<Record<string, CatalogDefinition>> = {
  FA01: {
    title: {
      ar: 'تجهيز مكان نظيف للصلاة',
      en: 'Prepare a clean prayer space',
    },
    positiveAction: {
      ar: 'جهّز مكاناً نظيفاً يختاره وليّ الأمر.',
      en: 'Prepare a clean space chosen by the Parent.',
    },
    definitionOfDone: {
      ar: 'جهّز مكاناً نظيفاً يختاره وليّ الأمر.',
      en: 'Prepare a clean space chosen by the Parent.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fa01-step-1',
          kind: 'action',
          text: {
            ar: 'اختر مع وليّ الأمر مكانًا مناسبًا.',
            en: 'Choose a suitable place with the Parent.',
          },
          condition: null,
        },
        {
          id: 'fa01-step-2',
          kind: 'action',
          text: {
            ar: 'رتّب المواد الآمنة التي اختارها وليّ الأمر.',
            en: 'Arrange the safe items the Parent selected.',
          },
          condition: null,
        },
        {
          id: 'fa01-step-3',
          kind: 'action',
          text: {
            ar: 'راجع المكان مع وليّ الأمر عند الانتهاء.',
            en: 'Review the space with the Parent when finished.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'رتّبت المواد المتفق عليها في المكان الذي اخترناه.',
        en: 'You arranged the agreed items in the space we chose.',
      },
      permittedHelpPraise: {
        ar: 'رتّبت المواد المتفق عليها في المكان الذي اخترناه. استخدمت المساعدة المتفق عليها.',
        en: 'You arranged the agreed items in the space we chose. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  FA02: {
    title: {
      ar: 'التعرّف إلى عبارة يختارها وليّ الأمر',
      en: 'Learn one Parent-approved phrase',
    },
    positiveAction: {
      ar: 'تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.',
      en: 'Learn a phrase from a Parent-approved source.',
    },
    definitionOfDone: {
      ar: 'تعرّف إلى عبارة من مصدر يختاره وليّ الأمر.',
      en: 'Learn a phrase from a Parent-approved source.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fa02-step-1',
          kind: 'adult',
          text: {
            ar: 'يختار وليّ الأمر العبارة ومصدرها.',
            en: 'The Parent chooses the phrase and its source.',
          },
          condition: null,
        },
        {
          id: 'fa02-step-2',
          kind: 'action',
          text: {
            ar: 'استمع أو اقرأ بالطريقة المناسبة لك.',
            en: 'Listen or read in the way that suits you.',
          },
          condition: null,
        },
        {
          id: 'fa02-step-3',
          kind: 'optional',
          text: {
            ar: 'جرّب ترديد العبارة مع المساعدة إن رغبت.',
            en: 'Try saying the phrase with help if you wish.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'تعرّفت إلى العبارة من المصدر الذي اخترناه.',
        en: 'You explored the phrase from the source we chose.',
      },
      permittedHelpPraise: {
        ar: 'تعرّفت إلى العبارة من المصدر الذي اخترناه. استخدمت المساعدة المتفق عليها.',
        en: 'You explored the phrase from the source we chose. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  RK04: {
    title: {
      ar: 'قضاء وقت قصير مع قريب يرغب في المشاركة',
      en: 'Spend a short time with a willing relative',
    },
    positiveAction: {
      ar: 'اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.',
      en: 'Spend a short time with a willing relative.',
    },
    definitionOfDone: {
      ar: 'اقضِ وقتاً قصيراً مع قريب يرغب في المشاركة.',
      en: 'Spend a short time with a willing relative.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'rk04-step-1',
          kind: 'action',
          text: {
            ar: 'اتفق مع وليّ الأمر وقريبك على وقت قصير.',
            en: 'Agree a short time with the Parent and relative.',
          },
          condition: null,
        },
        {
          id: 'rk04-step-2',
          kind: 'action',
          text: {
            ar: 'اختر نشاطًا بسيطًا يرغب فيه الجميع.',
            en: 'Choose a simple activity everyone wants.',
          },
          condition: null,
        },
        {
          id: 'rk04-step-3',
          kind: 'action',
          text: {
            ar: 'شارك في الوقت المتفق عليه مع حرية التوقف واستخدام وسائل الإتاحة التي تحتاج إليها.',
            en: 'Take part for the agreed time, with freedom to stop and use the accessibility tools you need.',
          },
          condition: null,
        },
      ],
      completionScope: 'parent_observed_period',
      confirmationPraise: {
        ar: 'شاركت في النشاط والوقت اللذين اتفقنا عليهما.',
        en: 'You took part in the activity for the time we agreed.',
      },
      permittedHelpPraise: {
        ar: 'شاركت في النشاط والوقت اللذين اتفقنا عليهما. استخدمت المساعدة المتفق عليها.',
        en: 'You took part in the activity for the time we agreed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HR02: {
    title: {
      ar: 'تجهيز حقيبة المدرسة للغد',
      en: "Prepare tomorrow's school bag",
    },
    positiveAction: {
      ar: 'ضع مواد الغد في الحقيبة باستخدام قائمة.',
      en: 'Use a checklist to place tomorrow items in the bag.',
    },
    definitionOfDone: {
      ar: 'ضع مواد الغد في الحقيبة باستخدام قائمة.',
      en: 'Use a checklist to place tomorrow items in the bag.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'hr02-step-1',
          kind: 'action',
          text: {
            ar: 'راجع قائمة مواد الغد مع وليّ الأمر.',
            en: 'Review tomorrow’s materials with the Parent.',
          },
          condition: null,
        },
        {
          id: 'hr02-step-2',
          kind: 'action',
          text: {
            ar: 'ضع المواد الآمنة في الحقيبة.',
            en: 'Put the safe materials in the bag.',
          },
          condition: null,
        },
        {
          id: 'hr02-step-3',
          kind: 'action',
          text: {
            ar: 'راجع القائمة واطلب المساعدة عند الحاجة.',
            en: 'Check the list and ask for help when needed.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'جهّزت الأدوات المتفق عليها في الحقيبة.',
        en: 'You packed the agreed items in the bag.',
      },
      permittedHelpPraise: {
        ar: 'جهّزت الأدوات المتفق عليها في الحقيبة. استخدمت المساعدة المتفق عليها.',
        en: 'You packed the agreed items in the bag. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HR05: {
    title: {
      ar: 'مساعدة شخص بالغ في كيس نفايات عامة خفيف ومغلق',
      en: 'Help an adult with a sealed light general-waste bag',
    },
    positiveAction: {
      ar: 'ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.',
      en: 'Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.',
    },
    definitionOfDone: {
      ar: 'ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.',
      en: 'Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'hr05-step-1',
          kind: 'adult',
          text: {
            ar: 'يفحص الشخص البالغ الكيس ويتولى حمله.',
            en: 'The adult checks the bag and handles all carrying.',
          },
          condition: null,
        },
        {
          id: 'hr05-step-2',
          kind: 'action',
          text: {
            ar: 'ضع كيسًا جديدًا فارغًا يقدمه الشخص البالغ في المكان المتفق عليه داخل المنزل، دون لمس الكيس المستخدم أو الحاوية.',
            en: 'Put a new, empty bag provided by the adult in the agreed indoor place, without touching the used bag or bin.',
          },
          condition: null,
        },
        {
          id: 'hr05-step-3',
          kind: 'adult',
          text: {
            ar: 'اترك نقل الكيس والتخلص منه للشخص البالغ.',
            en: 'Leave moving and disposing of the bag to the adult.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'وضعت الكيس الجديد الفارغ في المكان الآمن المتفق عليه.',
        en: 'You placed the new empty bag in the agreed safe place.',
      },
      permittedHelpPraise: {
        ar: 'وضعت الكيس الجديد الفارغ في المكان الآمن المتفق عليه. استخدمت المساعدة المتفق عليها.',
        en: 'You placed the new empty bag in the agreed safe place. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  GI01: {
    title: {
      ar: 'فرز المواد النظيفة المقبولة محلياً',
      en: 'Sort locally accepted clean recyclables',
    },
    positiveAction: {
      ar: 'افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.',
      en: 'Sort only intact, non-sharp clean paper and plastic indoors after an adult check.',
    },
    definitionOfDone: {
      ar: 'افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.',
      en: 'Sort only intact, non-sharp clean paper and plastic indoors after an adult check.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'gi01-step-1',
          kind: 'adult',
          text: {
            ar: 'يفحص الشخص البالغ المواد المقبولة محليًا.',
            en: 'The adult checks materials accepted locally.',
          },
          condition: null,
        },
        {
          id: 'gi01-step-2',
          kind: 'action',
          text: {
            ar: 'افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.',
            en: 'Sort only intact, non-sharp clean paper and plastic indoors after an adult check.',
          },
          condition: null,
        },
        {
          id: 'gi01-step-3',
          kind: 'adult',
          text: {
            ar: 'يراجع الشخص البالغ الفرز ويتولى النقل والتخلص.',
            en: 'The adult checks the sorting and handles transport and disposal.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'فرزت المواد النظيفة التي فحصها الشخص البالغ داخل المنزل.',
        en: 'You sorted the clean, adult-checked materials indoors.',
      },
      permittedHelpPraise: {
        ar: 'فرزت المواد النظيفة التي فحصها الشخص البالغ داخل المنزل. استخدمت المساعدة المتفق عليها.',
        en: 'You sorted the clean, adult-checked materials indoors. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
    safetyPatch: {
      childAllowedActions: [
        {
          ar: 'افرز داخل المنزل الورق والبلاستيك النظيفين والسليمين وغير الحادّين بعد فحص شخص بالغ.',
          en: 'Sort only intact, non-sharp clean paper and plastic indoors after an adult check.',
        },
      ],
      adultOwnedActions: [
        {
          ar: 'يفحص الشخص البالغ المواد المقبولة محليًا.',
          en: 'The adult checks materials accepted locally.',
        },
        {
          ar: 'يراجع الشخص البالغ الفرز ويتولى النقل والتخلص.',
          en: 'The adult checks the sorting and handles transport and disposal.',
        },
      ],
      adultSecondCheck: {
        ar: 'يراجع الشخص البالغ الفرز بعد الانتهاء.',
        en: 'The adult checks the sorting when finished.',
      },
      routeConstraint: {
        ar: 'داخل المنزل فقط؛ يتولى الشخص البالغ النقل والتخلص.',
        en: 'Indoors only; the adult handles transport and disposal.',
      },
      indoorAlternative: {
        ar: 'يقتصر نشاط الطفل على الفرز داخل المنزل؛ لا يلزم الخروج.',
        en: 'The Child only sorts indoors; no outing is required.',
      },
    },
  },
  FH01: {
    title: {
      ar: 'المساعدة في طبق تقديم مشترك',
      en: 'Help prepare a shared serving dish',
    },
    positiveAction: {
      ar: 'ساعد في ترتيب طبق تقديم مشترك باستخدام الطعام والكمية وأدوات التقديم الآمنة التي اختارها وليّ الأمر، دون اشتراط تناول الطعام.',
      en: 'Help arrange a shared serving dish using the food, amount and safe serving tools the Parent selected, with no requirement to eat it.',
    },
    definitionOfDone: {
      ar: 'ساعد في ترتيب طبق تقديم مشترك باستخدام الطعام والكمية وأدوات التقديم الآمنة التي اختارها وليّ الأمر، دون اشتراط تناول الطعام.',
      en: 'Help arrange a shared serving dish using the food, amount and safe serving tools the Parent selected, with no requirement to eat it.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fh01-step-1',
          kind: 'adult',
          text: {
            ar: 'يختار وليّ الأمر الطعام وأدوات تقديم باردة وآمنة وغير قابلة للكسر، ويتولى فحص سلامة الطعام.',
            en: 'The Parent chooses the food and safe, cool, non-breakable serving tools, and handles food-safety checks.',
          },
          condition: null,
        },
        {
          id: 'fh01-step-2',
          kind: 'action',
          text: {
            ar: 'ساعد في ترتيب طبق مشترك بمواد باردة وآمنة.',
            en: 'Help arrange a shared dish using safe, cool items.',
          },
          condition: null,
        },
        {
          id: 'fh01-step-3',
          kind: 'action',
          text: {
            ar: 'اعرض ما جهّزته على وليّ الأمر؛ لا يلزم تناول الطعام.',
            en: 'Show the Parent what you prepared; eating is not required.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'رتّبت الطعام البارد المتفق عليه مع مراعاة خطة السلامة.',
        en: 'You arranged the agreed cool food following the safety plan.',
      },
      permittedHelpPraise: {
        ar: 'رتّبت الطعام البارد المتفق عليه مع مراعاة خطة السلامة. استخدمت المساعدة المتفق عليها.',
        en: 'You arranged the agreed cool food following the safety plan. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  FH04: {
    title: {
      ar: 'ترتيب التمر أو الماء أو المناديل للضيوف',
      en: 'Arrange dates, water, or napkins for guests',
    },
    positiveAction: {
      ar: 'رتّب مواد الضيافة الباردة والآمنة.',
      en: 'Arrange safe, cool hospitality items.',
    },
    definitionOfDone: {
      ar: 'رتّب مواد الضيافة الباردة والآمنة.',
      en: 'Arrange safe, cool hospitality items.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fh04-step-1',
          kind: 'action',
          text: {
            ar: 'اختر مع وليّ الأمر مواد الضيافة الباردة والآمنة.',
            en: 'Choose safe, cool hospitality items with the Parent.',
          },
          condition: null,
        },
        {
          id: 'fh04-step-2',
          kind: 'action',
          text: {
            ar: 'رتّب التمر أو الماء أو المناديل.',
            en: 'Arrange dates, water or napkins.',
          },
          condition: null,
        },
        {
          id: 'fh04-step-3',
          kind: 'adult',
          text: {
            ar: 'اترك الأواني الزجاجية والسوائل والأواني الساخنة للشخص البالغ.',
            en: 'Leave glassware, hot liquids and hot vessels to the adult.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'جهّزت ضيافة بسيطة باستخدام المواد الآمنة المتفق عليها.',
        en: 'You prepared simple hospitality using the agreed safe items.',
      },
      permittedHelpPraise: {
        ar: 'جهّزت ضيافة بسيطة باستخدام المواد الآمنة المتفق عليها. استخدمت المساعدة المتفق عليها.',
        en: 'You prepared simple hospitality using the agreed safe items. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  KC01: {
    title: {
      ar: 'المساعدة في مهمة صغيرة يختارها الأخ أو الأخت',
      en: 'Help with one small job a sibling chooses',
    },
    positiveAction: {
      ar: 'اعرض المساعدة في مهمة صغيرة وآمنة، وقدّمها فقط إذا رغبتما معًا؛ رفض العرض لا يعني الفشل ولا يوجب متابعة المهمة.',
      en: 'Offer help with one small, safe job and help only if you both wish; declining is not failure and does not require continuing the task.',
    },
    definitionOfDone: {
      ar: 'اعرض المساعدة في مهمة صغيرة وآمنة، وقدّمها فقط إذا رغبتما معًا؛ رفض العرض لا يعني الفشل ولا يوجب متابعة المهمة.',
      en: 'Offer help with one small, safe job and help only if you both wish; declining is not failure and does not require continuing the task.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'kc01-step-1',
          kind: 'action',
          text: {
            ar: 'اعرض على أخيك أو أختك المساعدة في مهمة صغيرة.',
            en: 'Offer your sibling help with one small job.',
          },
          condition: null,
        },
        {
          id: 'kc01-step-2',
          kind: 'conditional',
          text: {
            ar: 'إذا وافقتما معًا، اتفقا على خطوة صغيرة وآمنة.',
            en: 'If you both agree, choose one small, safe step together.',
          },
          condition: {
            ar: 'إذا وافقتما معًا، اتفقا على خطوة صغيرة وآمنة.',
            en: 'If you both agree, choose one small, safe step together.',
          },
        },
        {
          id: 'kc01-step-3',
          kind: 'conditional',
          text: {
            ar: 'قدّم المساعدة إن رغبتما؛ يمكن لأي منكما التوقف.',
            en: 'Help if you both wish; either person may stop.',
          },
          condition: {
            ar: 'قدّم المساعدة إن رغبتما؛ يمكن لأي منكما التوقف.',
            en: 'Help if you both wish; either person may stop.',
          },
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'عرضت المساعدة مع احترام رغبة الطرف الآخر.',
        en: 'You offered help while respecting the other person’s choice.',
      },
      permittedHelpPraise: {
        ar: 'عرضت المساعدة مع احترام رغبة الطرف الآخر. استخدمت المساعدة المتفق عليها.',
        en: 'You offered help while respecting the other person’s choice. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  LW01: {
    title: {
      ar: 'قراءة كتاب أو الاستماع إليه',
      en: 'Read or listen to a book',
    },
    positiveAction: {
      ar: 'اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها مع وليّ الأمر قبل قبول المهمة، مع الاستراحات والمساعدة المتفق عليها.',
      en: 'Read or listen in an accessible format for the duration agreed with the Parent before accepting the task, with the agreed breaks and help.',
    },
    definitionOfDone: {
      ar: 'اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها مع وليّ الأمر قبل قبول المهمة، مع الاستراحات والمساعدة المتفق عليها.',
      en: 'Read or listen in an accessible format for the duration agreed with the Parent before accepting the task, with the agreed breaks and help.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'lw01-step-1',
          kind: 'action',
          text: {
            ar: 'اختر كتابًا أو تسجيلًا مناسبًا مع وليّ الأمر.',
            en: 'Choose a suitable book or recording with the Parent.',
          },
          condition: null,
        },
        {
          id: 'lw01-step-2',
          kind: 'action',
          text: {
            ar: 'اقرأ أو استمع بصيغة ميسّرة للمدة المتفق عليها.',
            en: 'Read or listen in an accessible format for the agreed time.',
          },
          condition: null,
        },
        {
          id: 'lw01-step-3',
          kind: 'adult',
          text: {
            ar: 'اطلب المساعدة أو استراحة عند الحاجة.',
            en: 'Ask for help or a break when needed.',
          },
          condition: null,
        },
      ],
      completionScope: 'parent_observed_period',
      confirmationPraise: {
        ar: 'قرأت أو استمعت للمدة المتفق عليها مع الاستراحات المناسبة.',
        en: 'You read or listened for the agreed time with the breaks you needed.',
      },
      permittedHelpPraise: {
        ar: 'قرأت أو استمعت للمدة المتفق عليها مع الاستراحات المناسبة. استخدمت المساعدة المتفق عليها.',
        en: 'You read or listened for the agreed time with the breaks you needed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  FA03: {
    title: {
      ar: 'مشاركة لحظة امتنان يختارها الطفل',
      en: 'Share one gratitude moment the Child chooses',
    },
    positiveAction: {
      ar: 'اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها.',
      en: 'If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required.',
    },
    definitionOfDone: {
      ar: 'اختر إن رغبت شيئًا تقدّره؛ يمكنك الاحتفاظ بالفكرة لنفسك ولا يلزم الإفصاح عنها أو تسجيلها.',
      en: 'If you wish, choose something you appreciate; you may keep it to yourself, with no disclosure or recording required.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fa03-step-1',
          kind: 'optional',
          text: {
            ar: 'اختر شيئًا تقدّره إن رغبت.',
            en: 'Choose something you appreciate if you wish.',
          },
          condition: null,
        },
        {
          id: 'fa03-step-2',
          kind: 'optional',
          text: {
            ar: 'يمكنك التعبير بالكلام أو الرسم أو الكتابة إن رغبت.',
            en: 'You may express it by speaking, drawing or writing if you wish.',
          },
          condition: null,
        },
        {
          id: 'fa03-step-3',
          kind: 'adult',
          text: {
            ar: 'يمكنك الاحتفاظ بالفكرة لنفسك؛ لا يلزم مشاركتها أو تسجيلها في غاف.',
            en: 'You may keep the thought to yourself; sharing or recording it in Ghaf is not required.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'اخترت طريقة مريحة لك للتعبير، مع الحفاظ على خصوصيتك.',
        en: 'You chose a comfortable way to reflect while keeping your privacy.',
      },
      permittedHelpPraise: {
        ar: 'اخترت طريقة مريحة لك للتعبير، مع الحفاظ على خصوصيتك. استخدمت المساعدة المتفق عليها.',
        en: 'You chose a comfortable way to reflect while keeping your privacy. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  RK01: {
    title: {
      ar: 'الاتصال بقريب يختاره وليّ الأمر',
      en: 'Call a relative chosen by the Parent',
    },
    positiveAction: {
      ar: 'اختر تحية أو سؤالًا قصيرًا مع وليّ الأمر، وشارك إن رغبت في مكالمة يرتّبها وليّ الأمر خارج غاف مع قريب موافق. يمكنك الاكتفاء بالتدرّب على التحية مع وليّ الأمر.',
      en: 'Choose a short greeting or question with the Parent, and optionally join a call the Parent arranges outside Ghaf with a willing relative. You may just rehearse the greeting with the Parent.',
    },
    definitionOfDone: {
      ar: 'اختر تحية أو سؤالًا قصيرًا مع وليّ الأمر، وشارك إن رغبت في مكالمة يرتّبها وليّ الأمر خارج غاف مع قريب موافق. يمكنك الاكتفاء بالتدرّب على التحية مع وليّ الأمر.',
      en: 'Choose a short greeting or question with the Parent, and optionally join a call the Parent arranges outside Ghaf with a willing relative. You may just rehearse the greeting with the Parent.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'rk01-step-1',
          kind: 'action',
          text: {
            ar: 'اختر مع وليّ الأمر قريبًا يرغب في التواصل.',
            en: 'Choose a willing relative with the Parent.',
          },
          condition: null,
        },
        {
          id: 'rk01-step-2',
          kind: 'optional',
          text: {
            ar: 'يمكنك التدرّب على تحية مع وليّ الأمر، أو المشاركة إن رغبت في اتصال يرتّبه خارج غاف.',
            en: 'You may rehearse a greeting with the Parent, or optionally join a call they arrange outside Ghaf.',
          },
          condition: null,
        },
        {
          id: 'rk01-step-3',
          kind: 'optional',
          text: {
            ar: 'استخدم تحية أو سؤالًا تختاره، ويمكنك إنهاء المشاركة.',
            en: 'Use a greeting or question you choose; you may finish participating.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'نفّذت التحية أو التدريب الذي اتفقنا عليه.',
        en: 'You completed the greeting or rehearsal we agreed.',
      },
      permittedHelpPraise: {
        ar: 'نفّذت التحية أو التدريب الذي اتفقنا عليه. استخدمت المساعدة المتفق عليها.',
        en: 'You completed the greeting or rehearsal we agreed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  RK02: {
    title: {
      ar: 'الاستماع إلى قصة عائلية قصيرة',
      en: 'Listen to a short family story',
    },
    positiveAction: {
      ar: 'استمع إلى قصة يختار قريب مشاركتها، مع إمكانية التوقف في أي وقت.',
      en: 'Listen to a story a relative chooses to share, with the option to stop at any time.',
    },
    definitionOfDone: {
      ar: 'استمع إلى قصة يختار قريب مشاركتها، مع إمكانية التوقف في أي وقت.',
      en: 'Listen to a story a relative chooses to share, with the option to stop at any time.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'rk02-step-1',
          kind: 'action',
          text: {
            ar: 'اختر قريبًا يرغب في مشاركة قصة.',
            en: 'Choose a relative who wants to share a story.',
          },
          condition: null,
        },
        {
          id: 'rk02-step-2',
          kind: 'action',
          text: {
            ar: 'استمع بالطريقة والمدة المتفق عليهما.',
            en: 'Listen in the agreed way for the agreed time.',
          },
          condition: null,
        },
        {
          id: 'rk02-step-3',
          kind: 'optional',
          text: {
            ar: 'يمكنك طرح سؤال أو إنهاء المشاركة.',
            en: 'You may ask a question or finish participating.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'استمعت إلى القصة بالطريقة المتفق عليها.',
        en: 'You listened to the story in the way we agreed.',
      },
      permittedHelpPraise: {
        ar: 'استمعت إلى القصة بالطريقة المتفق عليها. استخدمت المساعدة المتفق عليها.',
        en: 'You listened to the story in the way we agreed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HR01: {
    title: {
      ar: 'ترتيب الكتب والأقلام',
      en: 'Put books and pens in their places',
    },
    positiveAction: {
      ar: 'أعد الكتب والأقلام إلى أماكنها المتفق عليها.',
      en: 'Return books and pens to their agreed places.',
    },
    definitionOfDone: {
      ar: 'أعد الكتب والأقلام إلى أماكنها المتفق عليها.',
      en: 'Return books and pens to their agreed places.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'hr01-step-1',
          kind: 'action',
          text: {
            ar: 'اختر الكتب والأقلام التي ستُرتّب.',
            en: 'Choose the books and pens to put away.',
          },
          condition: null,
        },
        {
          id: 'hr01-step-2',
          kind: 'action',
          text: {
            ar: 'أعدها إلى الأماكن المتفق عليها مع المساعدة عند الحاجة.',
            en: 'Return them to their agreed places, with help when needed.',
          },
          condition: null,
        },
        {
          id: 'hr01-step-3',
          kind: 'action',
          text: {
            ar: 'راجع المساحة التي اخترتها.',
            en: 'Check the space you chose.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'رتّبت الكتب والأقلام في الأماكن المتفق عليها.',
        en: 'You arranged the books and pens in the agreed places.',
      },
      permittedHelpPraise: {
        ar: 'رتّبت الكتب والأقلام في الأماكن المتفق عليها. استخدمت المساعدة المتفق عليها.',
        en: 'You arranged the books and pens in the agreed places. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  GI02: {
    title: {
      ar: 'إطفاء الأنوار غير المستخدمة مع شخص بالغ',
      en: 'Switch off unused lights with an adult',
    },
    positiveAction: {
      ar: 'تفقد غرفة واحدة مع شخص بالغ وأطفئ الضوء غير المطلوب.',
      en: 'Check one room with an adult and switch off an unneeded light.',
    },
    definitionOfDone: {
      ar: 'تفقد غرفة واحدة مع شخص بالغ وأطفئ الضوء غير المطلوب.',
      en: 'Check one room with an adult and switch off an unneeded light.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'gi02-step-1',
          kind: 'action',
          text: {
            ar: 'اختر غرفة مع شخص بالغ وتحققا من الحاجة إلى الضوء.',
            en: 'Choose a room with an adult and check whether its light is needed.',
          },
          condition: null,
        },
        {
          id: 'gi02-step-2',
          kind: 'action',
          text: {
            ar: 'أطفئ الضوء غير المطلوب باستخدام مفتاح سليم وآمن الوصول، مع المساعدة عند الحاجة.',
            en: 'Switch off the unneeded light using an intact, safely reachable switch, with help when needed.',
          },
          condition: null,
        },
        {
          id: 'gi02-step-3',
          kind: 'adult',
          text: {
            ar: 'اطلب من الشخص البالغ إتمام الخطوة إذا احتجت إلى مساعدة.',
            en: 'Ask the adult to complete the step if you need help.',
          },
          condition: null,
        },
      ],
      completionScope: 'parent_observed_period',
      confirmationPraise: {
        ar: 'أطفأت الضوء غير المطلوب باستخدام المفتاح الآمن.',
        en: 'You switched off the unneeded light using the safe switch.',
      },
      permittedHelpPraise: {
        ar: 'أطفأت الضوء غير المطلوب باستخدام المفتاح الآمن. استخدمت المساعدة المتفق عليها.',
        en: 'You switched off the unneeded light using the safe switch. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  GI03: {
    title: {
      ar: 'استخدام زجاجة ماء قابلة لإعادة الاستخدام',
      en: 'Prepare a reusable water bottle',
    },
    positiveAction: {
      ar: 'اطلب من شخص بالغ فحص زجاجة سليمة ثم جهزها للاستخدام.',
      en: 'Ask an adult to check an intact bottle, then prepare it for use.',
    },
    definitionOfDone: {
      ar: 'اطلب من شخص بالغ فحص زجاجة سليمة ثم جهزها للاستخدام.',
      en: 'Ask an adult to check an intact bottle, then prepare it for use.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'gi03-step-1',
          kind: 'action',
          text: {
            ar: 'اطلب من شخص بالغ فحص زجاجة سليمة غير قابلة للكسر.',
            en: 'Ask an adult to check an intact, non-breakable bottle.',
          },
          condition: null,
        },
        {
          id: 'gi03-step-2',
          kind: 'action',
          text: {
            ar: 'جهّزها للاستخدام بالطريقة التي اتفقتما عليها.',
            en: 'Prepare it for use in the agreed way.',
          },
          condition: null,
        },
        {
          id: 'gi03-step-3',
          kind: 'action',
          text: {
            ar: 'ضعها في المكان المتفق عليه.',
            en: 'Put it in the agreed place.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'جهّزت الزجاجة القابلة لإعادة الاستخدام وفق الخطة الآمنة.',
        en: 'You prepared the reusable bottle following the safe plan.',
      },
      permittedHelpPraise: {
        ar: 'جهّزت الزجاجة القابلة لإعادة الاستخدام وفق الخطة الآمنة. استخدمت المساعدة المتفق عليها.',
        en: 'You prepared the reusable bottle following the safe plan. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  FH02: {
    title: {
      ar: 'ترتيب المناديل والملاعق الباردة',
      en: 'Arrange napkins and cool utensils',
    },
    positiveAction: {
      ar: 'رتّب مواد آمنة وغير قابلة للكسر يحددها وليّ الأمر.',
      en: 'Arrange safe, non-breakable items selected by the Parent.',
    },
    definitionOfDone: {
      ar: 'رتّب مواد آمنة وغير قابلة للكسر يحددها وليّ الأمر.',
      en: 'Arrange safe, non-breakable items selected by the Parent.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'fh02-step-1',
          kind: 'adult',
          text: {
            ar: 'يختار وليّ الأمر مواد باردة وآمنة وغير قابلة للكسر.',
            en: 'The Parent selects safe, cool, non-breakable items.',
          },
          condition: null,
        },
        {
          id: 'fh02-step-2',
          kind: 'action',
          text: {
            ar: 'رتّب المناديل والملاعق في المكان المتفق عليه.',
            en: 'Arrange napkins and spoons in the agreed place.',
          },
          condition: null,
        },
        {
          id: 'fh02-step-3',
          kind: 'action',
          text: {
            ar: 'راجع الترتيب مع المساعدة عند الحاجة.',
            en: 'Check the arrangement with help when needed.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'رتّبت المناديل والأدوات الآمنة المتفق عليها.',
        en: 'You arranged the napkins and safe items we agreed.',
      },
      permittedHelpPraise: {
        ar: 'رتّبت المناديل والأدوات الآمنة المتفق عليها. استخدمت المساعدة المتفق عليها.',
        en: 'You arranged the napkins and safe items we agreed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HE01: {
    title: {
      ar: 'اختيار تحية مناسبة مع وليّ الأمر',
      en: 'Choose an appropriate greeting with the Parent',
    },
    positiveAction: {
      ar: 'اختر تحية من الخيارات التي يراجعها وليّ الأمر، ويمكنك التدرّب عليها إن رغبت.',
      en: 'Choose a greeting from options reviewed by the Parent; you may rehearse it if you wish.',
    },
    definitionOfDone: {
      ar: 'اختر تحية من الخيارات التي يراجعها وليّ الأمر، ويمكنك التدرّب عليها إن رغبت.',
      en: 'Choose a greeting from options reviewed by the Parent; you may rehearse it if you wish.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'he01-step-1',
          kind: 'adult',
          text: {
            ar: 'يراجع وليّ الأمر خيارات التحية المناسبة للموقف.',
            en: 'The Parent reviews greetings suited to the situation.',
          },
          condition: null,
        },
        {
          id: 'he01-step-2',
          kind: 'action',
          text: {
            ar: 'اختر عبارة ترتاح لاستخدامها.',
            en: 'Choose a phrase you feel comfortable using.',
          },
          condition: null,
        },
        {
          id: 'he01-step-3',
          kind: 'optional',
          text: {
            ar: 'تدرّب عليها مع وليّ الأمر إن رغبت.',
            en: 'Practise it with the Parent if you wish.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'اخترت التحية المناسبة للموقف الذي راجعناه.',
        en: 'You chose a greeting for the situation we reviewed.',
      },
      permittedHelpPraise: {
        ar: 'اخترت التحية المناسبة للموقف الذي راجعناه. استخدمت المساعدة المتفق عليها.',
        en: 'You chose a greeting for the situation we reviewed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HE02: {
    title: {
      ar: 'الاستماع إلى المتحدث في المجلس',
      en: 'Practise listening to a speaker in the majlis',
    },
    positiveAction: {
      ar: 'تابع حديثًا قصيرًا بالطريقة المناسبة لك، ويمكنك طلب توضيح أو استراحة أو إنهاء المشاركة.',
      en: 'Follow a short conversation in the way that suits you; you may ask for clarification or a break, or stop participating.',
    },
    definitionOfDone: {
      ar: 'تابع حديثًا قصيرًا بالطريقة المناسبة لك، ويمكنك طلب توضيح أو استراحة أو إنهاء المشاركة.',
      en: 'Follow a short conversation in the way that suits you; you may ask for clarification or a break, or stop participating.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'he02-step-1',
          kind: 'action',
          text: {
            ar: 'اتفق مع وليّ الأمر على وقت قصير مناسب.',
            en: 'Agree a suitable short time with the Parent.',
          },
          condition: null,
        },
        {
          id: 'he02-step-2',
          kind: 'action',
          text: {
            ar: 'استمع بالطريقة المناسبة لك دون فرض تواصل بصري.',
            en: 'Listen in the way that suits you; eye contact is not required.',
          },
          condition: null,
        },
        {
          id: 'he02-step-3',
          kind: 'adult',
          text: {
            ar: 'اطلب توضيحًا أو استراحة عند الحاجة.',
            en: 'Ask for clarification or a break when needed.',
          },
          condition: null,
        },
      ],
      completionScope: 'parent_observed_period',
      confirmationPraise: {
        ar: 'شاركت في الاستماع بالطريقة والمدة المتفق عليهما.',
        en: 'You took part in listening for the agreed time and in the agreed way.',
      },
      permittedHelpPraise: {
        ar: 'شاركت في الاستماع بالطريقة والمدة المتفق عليهما. استخدمت المساعدة المتفق عليها.',
        en: 'You took part in listening for the agreed time and in the agreed way. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  HE03: {
    title: {
      ar: 'سؤال شخص بالغ عن غرض تراثي',
      en: 'Ask an adult about one heritage object',
    },
    positiveAction: {
      ar: 'اختر غرضاً آمناً واسأل شخصاً بالغاً عن قصته أو استخدامه.',
      en: 'Choose one safe object and ask an adult about its story or use.',
    },
    definitionOfDone: {
      ar: 'اختر غرضاً آمناً واسأل شخصاً بالغاً عن قصته أو استخدامه.',
      en: 'Choose one safe object and ask an adult about its story or use.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'he03-step-1',
          kind: 'adult',
          text: {
            ar: 'يختار وليّ الأمر غرضًا آمنًا.',
            en: 'The Parent chooses a safe object.',
          },
          condition: null,
        },
        {
          id: 'he03-step-2',
          kind: 'action',
          text: {
            ar: 'اسأل شخصًا بالغًا عن استخدامه أو قصته.',
            en: 'Ask an adult about its use or story.',
          },
          condition: null,
        },
        {
          id: 'he03-step-3',
          kind: 'adult',
          text: {
            ar: 'استمع أو شاهد الغرض دون حمله أو استخدامه؛ يتولى الشخص البالغ التعامل معه.',
            en: 'Listen or look without holding or using the object; the adult handles it.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'تعرّفت إلى الغرض التراثي بالطريقة الآمنة التي اخترناها.',
        en: 'You explored the heritage object in the safe way we chose.',
      },
      permittedHelpPraise: {
        ar: 'تعرّفت إلى الغرض التراثي بالطريقة الآمنة التي اخترناها. استخدمت المساعدة المتفق عليها.',
        en: 'You explored the heritage object in the safe way we chose. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  KC02: {
    title: {
      ar: 'كتابة رسالة شكر قصيرة',
      en: 'Write a short thank-you note',
    },
    positiveAction: {
      ar: 'اكتب أو ارسم رسالة شكر لمن تختاره، أو أمْلها على شخص بالغ يساعدك في كتابتها؛ تسليمها اختياري.',
      en: 'Write or draw a thank-you note for someone you choose, or dictate it to an adult who helps write it; delivery is optional.',
    },
    definitionOfDone: {
      ar: 'اكتب أو ارسم رسالة شكر لمن تختاره، أو أمْلها على شخص بالغ يساعدك في كتابتها؛ تسليمها اختياري.',
      en: 'Write or draw a thank-you note for someone you choose, or dictate it to an adult who helps write it; delivery is optional.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'kc02-step-1',
          kind: 'action',
          text: {
            ar: 'اختر شخصًا ترغب في شكره.',
            en: 'Choose someone you would like to thank.',
          },
          condition: null,
        },
        {
          id: 'kc02-step-2',
          kind: 'action',
          text: {
            ar: 'اكتب أو ارسم رسالة للشخص الذي اخترته، أو اطلب من شخص بالغ كتابتها بإملائك.',
            en: 'Write or draw a note for the person you chose, or dictate it to an adult who helps write it.',
          },
          condition: null,
        },
        {
          id: 'kc02-step-3',
          kind: 'optional',
          text: {
            ar: 'اختر مع وليّ الأمر إن كنت تريد تسليمها.',
            en: 'Choose with the Parent whether to give the note.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'عبّرت عن الشكر بالطريقة التي اخترتها.',
        en: 'You expressed thanks in the way you chose.',
      },
      permittedHelpPraise: {
        ar: 'عبّرت عن الشكر بالطريقة التي اخترتها. استخدمت المساعدة المتفق عليها.',
        en: 'You expressed thanks in the way you chose. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  KC03: {
    title: {
      ar: 'اختيار مساعدة صغيرة في المنزل',
      en: 'Choose one small way to help at home',
    },
    positiveAction: {
      ar: 'اسأل عمّا يحتاج إلى مساعدة واختر خطوة آمنة يمكنك إنجازها.',
      en: 'Ask what needs help and choose one safe step you can complete.',
    },
    definitionOfDone: {
      ar: 'اسأل عمّا يحتاج إلى مساعدة واختر خطوة آمنة يمكنك إنجازها.',
      en: 'Ask what needs help and choose one safe step you can complete.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'kc03-step-1',
          kind: 'action',
          text: {
            ar: 'اسأل وليّ الأمر عن مساعدة بسيطة مطلوبة.',
            en: 'Ask the Parent about a small helpful job.',
          },
          condition: null,
        },
        {
          id: 'kc03-step-2',
          kind: 'action',
          text: {
            ar: 'اختر خطوة آمنة تستطيع القيام بها.',
            en: 'Choose a safe step you can do.',
          },
          condition: null,
        },
        {
          id: 'kc03-step-3',
          kind: 'action',
          text: {
            ar: 'نفّذها مع المساعدة المتفق عليها.',
            en: 'Do it with the agreed help.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'أنجزت خطوة المساعدة الآمنة التي اتفقنا عليها.',
        en: 'You completed the safe helping step we agreed.',
      },
      permittedHelpPraise: {
        ar: 'أنجزت خطوة المساعدة الآمنة التي اتفقنا عليها. استخدمت المساعدة المتفق عليها.',
        en: 'You completed the safe helping step we agreed. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  LW02: {
    title: {
      ar: 'تجهيز مكان هادئ للتعلّم',
      en: 'Prepare a calm learning space',
    },
    positiveAction: {
      ar: 'ضع الأدوات المطلوبة في مكان مناسب يختاره وليّ الأمر.',
      en: 'Place the needed materials in a suitable space chosen by the Parent.',
    },
    definitionOfDone: {
      ar: 'ضع الأدوات المطلوبة في مكان مناسب يختاره وليّ الأمر.',
      en: 'Place the needed materials in a suitable space chosen by the Parent.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'lw02-step-1',
          kind: 'action',
          text: {
            ar: 'اختر مكانًا مناسبًا مع وليّ الأمر.',
            en: 'Choose a suitable space with the Parent.',
          },
          condition: null,
        },
        {
          id: 'lw02-step-2',
          kind: 'action',
          text: {
            ar: 'ضع الأدوات المطلوبة في متناولك.',
            en: 'Place the needed materials within reach.',
          },
          condition: null,
        },
        {
          id: 'lw02-step-3',
          kind: 'action',
          text: {
            ar: 'راجع ما تحتاج إليه قبل البدء.',
            en: 'Check what you need before starting.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'جهّزت المواد ومكان التعلّم وفق خطتنا.',
        en: 'You prepared the materials and learning space following our plan.',
      },
      permittedHelpPraise: {
        ar: 'جهّزت المواد ومكان التعلّم وفق خطتنا. استخدمت المساعدة المتفق عليها.',
        en: 'You prepared the materials and learning space following our plan. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
  LW03: {
    title: {
      ar: 'تقسيم مشروع إلى ثلاث خطوات',
      en: 'Break one project into three steps',
    },
    positiveAction: {
      ar: 'اكتب ثلاث خطوات قصيرة أو أمْلها على شخص بالغ، مع المساعدة المتفق عليها.',
      en: 'Write three short steps or dictate them to an adult, with the agreed help.',
    },
    definitionOfDone: {
      ar: 'اكتب ثلاث خطوات قصيرة أو أمْلها على شخص بالغ، مع المساعدة المتفق عليها.',
      en: 'Write three short steps or dictate them to an adult, with the agreed help.',
    },
    catalogExecution: {
      revision: 'catalog_execution_v1',
      steps: [
        {
          id: 'lw03-step-1',
          kind: 'action',
          text: {
            ar: 'اختر مشروعًا صغيرًا مع وليّ الأمر.',
            en: 'Choose a small project with the Parent.',
          },
          condition: null,
        },
        {
          id: 'lw03-step-2',
          kind: 'action',
          text: {
            ar: 'اكتب أو أمْلِ على شخص بالغ ثلاث خطوات قصيرة.',
            en: 'Write or dictate three short steps to an adult.',
          },
          condition: null,
        },
        {
          id: 'lw03-step-3',
          kind: 'optional',
          text: {
            ar: 'اختر الخطوة الأولى التي ستجربها.',
            en: 'Choose the first step you will try.',
          },
          condition: null,
        },
      ],
      completionScope: 'one_session',
      confirmationPraise: {
        ar: 'قسّمت المشروع إلى ثلاث خطوات قصيرة.',
        en: 'You broke the project into three short steps.',
      },
      permittedHelpPraise: {
        ar: 'قسّمت المشروع إلى ثلاث خطوات قصيرة. استخدمت المساعدة المتفق عليها.',
        en: 'You broke the project into three short steps. You used the agreed help.',
      },
      smallerAlternative: null,
      safeEquivalent: null,
    },
  },
};

export function applyCatalogDefinition(template: TaskTemplate): TaskTemplate {
  const definition = definitions[template.id];
  if (!definition) return template;
  const { safetyPatch, ...content } = definition;
  const actionRows = content.catalogExecution.steps.filter((step) => step.kind === 'action');
  const adultRows = content.catalogExecution.steps.filter((step) => step.kind === 'adult');
  const safety: TaskSafetyBoundary = {
    ...template.safety,
    childAllowedActions: actionRows.length
      ? actionRows.map((step) => step.text)
      : [content.positiveAction],
    adultOwnedActions: [
      ...template.safety.adultOwnedActions,
      ...adultRows.map((step) => step.text),
    ],
    ...safetyPatch,
  };
  if (template.id === 'HR05') {
    return {
      ...template,
      ...content,
      safety: {
        ...safety,
        excludedHazards: [
          ...safety.excludedHazards,
          {
            ar: 'لا لمس للكيس المستخدم أو الحاوية، ولا لعب بالأكياس أو تغطية الرأس أو الوجه بها.',
            en: 'Do not touch the used bag or bin, play with bags, or cover the head or face with a bag.',
          },
        ],
      },
    };
  }
  return { ...template, ...content, safety };
}
