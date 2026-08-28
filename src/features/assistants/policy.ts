import { z } from 'zod';

import type {
  ActiveCoachContext,
  AgeBand,
  AssistantAudience,
  AssistantSafetyDecision,
  ChildCoachIntent,
  ChildCoachRequest,
  ChildInputAttempt,
  ChildInteractionDecision,
  ChildInteractionPolicy,
  DomainResult,
  FallbackReason,
  LocalizedText,
  ParentGuideIntent,
  ParentGuideRequest,
  ParentGuideTaskSuggestion,
  ParentPatternSummary,
  ParentSummaryCorrectionAttempt,
  ParentSummaryCorrectionRejection,
  ProhibitedAssistantOutput,
} from '../../models/familyGrowth';

const PARENT_INTENTS = [
  'make_clearer',
  'make_smaller',
  'check_safety',
  'adapt_age',
  'draft_descriptive_praise',
  'summarize_observable_pattern',
  'suggest_parent_question',
] as const;

const CHILD_INTENTS = [
  'simplify_task',
  'show_steps',
  'create_if_then_cue',
  'rehearse_reviewed_phrase',
  'respond_to_prepared_fixture',
  'offer_optional_reflection',
  'need_adult',
] as const;

const parentIntentSet = new Set<string>(PARENT_INTENTS);
const childIntentSet = new Set<string>(CHILD_INTENTS);

function failure(message: string, code: 'INVALID_INPUT' | 'SAFETY_REJECTED' = 'INVALID_INPUT') {
  return {
    ok: false as const,
    error: {
      code,
      message,
      retryable: false,
      fallbackAvailable: code === 'SAFETY_REJECTED',
    },
  };
}

export function validateParentGuideIntent(input: unknown): DomainResult<ParentGuideIntent> {
  return typeof input === 'string' && parentIntentSet.has(input)
    ? { ok: true, data: input as ParentGuideIntent }
    : failure('Parent Guide intent is not allowlisted');
}

export function validateChildCoachIntent(input: unknown): DomainResult<ChildCoachIntent> {
  return typeof input === 'string' && childIntentSet.has(input)
    ? { ok: true, data: input as ChildCoachIntent }
    : failure('Child Coach intent is not allowlisted');
}

const AGE_POLICIES: Readonly<Record<AgeBand, ChildInteractionPolicy>> = {
  '6_8': {
    ageBand: '6_8',
    inputMode: 'curated_intents_only',
    freeTextAllowed: false,
    pushToTalkAllowed: false,
    unrestrictedChatAllowed: false,
  },
  '9_11': {
    ageBand: '9_11',
    inputMode: 'structured_template',
    freeTextAllowed: false,
    pushToTalkAllowed: false,
    unrestrictedChatAllowed: false,
  },
  '12_14': {
    ageBand: '12_14',
    inputMode: 'guardian_enabled_bounded',
    freeTextAllowed: true,
    pushToTalkAllowed: true,
    unrestrictedChatAllowed: false,
  },
};

export function policyForAgeBand(ageBand: AgeBand): ChildInteractionPolicy {
  return AGE_POLICIES[ageBand];
}

export function evaluateChildInteraction(input: {
  readonly ageBand: AgeBand;
  readonly attempt: ChildInputAttempt;
  readonly guardianEnabled: boolean;
}): ChildInteractionDecision {
  const policy = policyForAgeBand(input.ageBand);
  if (input.attempt === 'unrestricted_chat') {
    return { allowed: false, policy, rejectedFor: 'unrestricted_chat_prohibited' };
  }

  if (input.attempt === 'curated_intent') {
    return { allowed: true, policy, rejectedFor: 'none' };
  }

  if (input.ageBand === '6_8') {
    return { allowed: false, policy, rejectedFor: 'wrong_input_mode' };
  }

  if (input.ageBand === '9_11') {
    return input.attempt === 'structured_template'
      ? { allowed: true, policy, rejectedFor: 'none' }
      : { allowed: false, policy, rejectedFor: 'wrong_input_mode' };
  }

  if (input.attempt === 'structured_template') {
    return { allowed: true, policy, rejectedFor: 'none' };
  }
  if (input.attempt === 'bounded_text' || input.attempt === 'push_to_talk') {
    return input.guardianEnabled
      ? { allowed: true, policy, rejectedFor: 'none' }
      : { allowed: false, policy, rejectedFor: 'guardian_enablement_required' };
  }
  return { allowed: false, policy, rejectedFor: 'wrong_input_mode' };
}

const childCoachRequestSchema = z
  .object({
    requestId: z.string().trim().min(1),
    intent: z.enum(CHILD_INTENTS),
    locale: z.enum(['ar', 'en']),
    child: z
      .object({
        id: z.enum(['child_salem', 'child_alya']),
        ageBand: z.literal('9_11'),
        synthetic: z.literal(true),
      })
      .strict(),
    assignmentId: z.string().trim().min(1),
    taskId: z.string().trim().min(1),
    approvedTaskVersion: z.number().int().positive(),
    lifecycle: z.enum(['chosen', 'in_progress']),
    fixtureId: z.enum(['fixture_recycling_clean_v1', 'fixture_salem_plan_ar_v1']).nullable(),
    templateSelection: z.string().nullable(),
  })
  .strict();

export function validateChildCoachRequest(
  request: unknown,
  context: ActiveCoachContext,
): DomainResult<ChildCoachRequest> {
  const parsed = childCoachRequestSchema.safeParse(request);
  if (!parsed.success) return failure('Child Coach request shape or P0 age band is invalid');
  const value = parsed.data;
  if (
    !context.approvedByParent ||
    value.child.id !== context.activeChildId ||
    value.assignmentId !== context.assignmentId ||
    value.taskId !== context.taskId ||
    value.approvedTaskVersion !== context.approvedTaskVersion ||
    value.lifecycle !== context.lifecycle ||
    !['chosen', 'in_progress'].includes(context.lifecycle)
  ) {
    return failure('Child Coach request is not bound to the active Parent-approved task');
  }
  return { ok: true, data: value };
}

const SAFETY_PATTERNS: readonly {
  readonly reason: ProhibitedAssistantOutput;
  readonly pattern: RegExp;
  readonly audiences?: readonly AssistantAudience[];
}[] = [
  {
    reason: 'normality_or_character_judgment',
    pattern:
      /\b(?:lazy|defiant|normal|abnormal|good child|bad child|responsible\s+(?:child|boy|girl))\b|(?:كسول|متحدّ|طفل جيد|طفل سيئ|غير طبيعي|(?:طفل|ولد|بنت)\s+مسؤول(?:ة)?)/iu,
  },
  {
    reason: 'diagnosis_or_condition_inference',
    pattern:
      /\b(?:adhd|diagnos(?:e|is)|disorder|condition|developmental\s+delay)\b|(?:تشخيص|اضطراب|فرط الحركة|تأخ(?:ر|ّر)\s+(?:نمائي|تطوري|في\s+النمو))/iu,
  },
  {
    reason: 'emotion_personality_or_risk_score',
    pattern:
      /\b(?:anxiety|emotion|personality|risk)\s*(?:score|rating|is)|\b(?:is|seems|looks|feels|appears)\s+(?:anxious|angry|sad|happy|afraid|depressed|upset|worried|nervous|tense)\b|(?:درجة|نقاط)\s*(?:القلق|المشاعر|الشخصية|الخطر)|(?:غاضب|قلق|حزين|سعيد|خائف|مكتئب|متوتر|عصبي|يشعر بالقلق|يبدو قلقاً)/iu,
  },
  {
    reason: 'emotion_personality_or_risk_score',
    audiences: ['child'],
    pattern:
      /\b(?:tell|show)\s+me\s+how\s+you\s+feel\b|\b(?:share|describe)\s+your\s+(?:feelings|emotions)\s+(?:with|to)\s+me\b|\btalk\s+to\s+me\s+about\s+your\s+(?:feelings|emotions)\b|(?:أخبرني كيف تشعر|شاركني مشاعرك|صف لي مشاعرك|تحدث معي عن مشاعرك)/iu,
  },
  {
    reason: 'truthfulness_or_deception_judgment',
    pattern:
      /\b(?:is lying|is (?:a )?liar|lied about|deceptive|dishonest|untruthful|truthfulness score|cannot be trusted|can't be trusted)\b|(?:يكذب|كاذب|خادع|غير صادق|غير جدير بالثقة|لا يمكن الوثوق به)/iu,
  },
  {
    reason: 'religious_judgment',
    pattern:
      /\b(?:prayer is invalid|religiously wrong|not sincere in prayer|religiosity score|not religious enough|weak faith|faith is weak|deficient faith|faith is deficient|lacks faith|has no faith|faithless|not devout)\b|(?:صلات\w* باطلة|غير مخلص في الصلاة|درجة التدين|إيمان\w* ضعيف|إيمان.{0,20}ناقص|ناقص الإيمان|ضعيف الإيمان|غير متدين|يفتقر إلى الإيمان|عديم الإيمان|قليل الإيمان)/iu,
  },
  {
    reason: 'parenting_or_family_quality_judgment',
    pattern:
      /\b(?:bad|poor|good|terrible|awful|inadequate) parenting\b|\bparenting is (?:bad|poor|terrible|awful|inadequate)\b|\b(?:bad|poor|good|broken|dysfunctional|toxic|unhealthy) family\b|\b(?:family|household) is (?:broken|dysfunctional|toxic|unhealthy)\b|(?:تربية سيئة|تربيتك سيئة|تربيتك فظيعة|أسلوب تربيتك فظيع|أسرة سيئة|جودة التربية|أسرتك مختلة|عائلتك مختلة|أسرة مختلة|عائلة مختلة|عائلة مفككة)/iu,
  },
  {
    reason: 'food_safety_or_medical_decision',
    pattern:
      /\b(?:food is safe to eat|safe for you to eat|medical diagnosis|take this medicine)\b|(?:الطعام آمن للأكل|تناول هذا الدواء)/iu,
  },
  {
    reason: 'hazardous_child_instruction',
    pattern:
      /\b(?:carry|take|bring|move|sort|collect|gather|place|dispose|throw|pick up|touch|handle|repair)\b.{0,55}\b(?:glass|broken glass|(?<!non-)sharps?|batter(?:y|ies)|chemicals?|electrical|unknown waste)\b|(?:احمل|خذ|انقل|افرز|اجمع|ضع|تخلّص|التقط|المس|تعامل|أصلح).{0,55}(?:الزجاج|الزجاج المكسور|أداة حادة|بطارية|بطاريات|مادة كيميائية|مواد كيميائية|كهرباء)/iu,
  },
  {
    reason: 'secret_or_exclusivity_request',
    pattern:
      /\b(?:keep (?:this|it) secret|keep (?:this|that|it) between us|this stays between you and me|do not tell (?:your )?parent|do not tell anyone|only tell me|our little secret)\b|(?:احتفظ بهذا سراً|احتفظ (?:بهذا|بذلك) بيننا|يبقى هذا بيننا|لا تخبر ولي أمرك|لا تخبر أحداً|سر بيننا)/iu,
  },
  {
    reason: 'attachment_or_dependency_language',
    pattern:
      /\b(?:special friend|you need me|only i understand|love me)\b|(?:صديقك المميز|تحتاج إليّ|أنا وحدي أفهمك)/iu,
  },
  {
    reason: 'continued_conversation_lure',
    pattern:
      /\b(?:keep talking to me|stay here|do not leave|come back and chat)\b|(?:واصل الحديث معي|ابق هنا|لا تغادر)/iu,
  },
  {
    reason: 'face_voice_or_biometric_inference',
    pattern:
      /\b(?:identify|recognize|infer)\b.{0,30}\b(?:face|voice|biometric)\b|(?:أتعرف|أحدد|أستنتج).{0,30}(?:وجهك|صوتك|بصمتك)/iu,
  },
  {
    reason: 'cross_household_private_content',
    pattern:
      /\bshare\b.{0,35}\b(?:child reflection|photo|voice|private note)\b.{0,20}\b(?:every family|other families|public)\b|(?:شارك|انشر).{0,35}(?:تأمل الطفل|صورته|صوته|ملاحظة خاصة)/iu,
  },
];

export function evaluateAssistantSafety<T>(input: {
  readonly audience: AssistantAudience;
  readonly texts: readonly LocalizedText[];
  readonly value?: T;
}): AssistantSafetyDecision<T | typeof input> {
  const combined = input.texts.map((item) => `${item.ar}\n${item.en}`).join('\n');
  const rejectedFor = [
    ...new Set(
      SAFETY_PATTERNS.filter(
        ({ audiences, pattern }) =>
          (!audiences || audiences.includes(input.audience)) && pattern.test(combined),
      ).map(({ reason }) => reason),
    ),
  ];
  return rejectedFor.length > 0
    ? { accepted: false, value: null, rejectedFor }
    : { accepted: true, value: input.value ?? input, rejectedFor: [] };
}

const summaryCorrectionSchema = z.discriminatedUnion('operation', [
  z
    .object({
      operation: z.literal('replace_fact'),
      factIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
      correctedFact: z
        .object({
          ar: z
            .string()
            .trim()
            .min(1)
            .max(180)
            .refine((value) => !/[\r\n]/u.test(value)),
          en: z
            .string()
            .trim()
            .min(1)
            .max(180)
            .refine((value) => !/[\r\n]/u.test(value)),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      operation: z.literal('remove_fact'),
      factIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    })
    .strict(),
  z
    .object({
      operation: z.literal('mark_fact_uncertain'),
      factIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    })
    .strict(),
]);

// P0 corrections are structured observable facts, not open-ended prose. These whole-field
// grammars intentionally admit only the reviewed synthetic subject, action, count, object, and
// help clauses used by the prepared summary/correction surface. An unrecognized trailing clause
// therefore fails closed without trying to enumerate diagnoses, traits, or inferred conditions.
const BOUNDED_OBSERVABLE_ENGLISH_FACT =
  /^Salem (?:independently completed two Green Impact steps and asked for adult help once|completed one (?:sorting|reviewed recycling) step and asked (?:an adult (?:before continuing|to check the (?:items|materials))|for adult help once)|asked an adult to check the (?:items|materials) once)\.$/u;
const BOUNDED_OBSERVABLE_ARABIC_FACT =
  /^(?:أكمل سالم خطوتين من مهام الأثر الأخضر باستقلالية، وطلب مساعدة شخص بالغ مرة واحدة|أكمل سالم خطوة فرز واحدة وطلب (?:مساعدة شخص بالغ قبل المتابعة|من شخص بالغ فحص المواد)|طلب سالم من شخص بالغ فحص المواد مرة واحدة)\.$/u;

const observableFactSchema = z
  .object({
    ar: z.string().trim().min(1).max(180),
    en: z.string().trim().min(1).max(180),
  })
  .strict()
  .superRefine((fact, context) => {
    if (
      !BOUNDED_OBSERVABLE_ENGLISH_FACT.test(fact.en) ||
      !BOUNDED_OBSERVABLE_ARABIC_FACT.test(fact.ar)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'A correction must remain a bounded bilingual observable action fact',
      });
    }
  });

function summaryTexts(summary: ParentPatternSummary): readonly LocalizedText[] {
  return [
    summary.timeWindow,
    summary.strengthsFirst,
    ...summary.observableFacts,
    summary.uncertainty,
    summary.questionForChild,
    summary.possibleAdjustment,
    summary.meta.disclosure.text,
  ];
}

export function validateParentSummary(
  summary: ParentPatternSummary,
): DomainResult<ParentPatternSummary> {
  if (
    summary.meta.audience !== 'parent' ||
    summary.meta.origin !== 'prepared' ||
    !summary.meta.disclosure.saysAiMayBeWrong ||
    !summary.meta.disclosure.preparedIsExplicit ||
    !summary.parentCorrectable ||
    summary.dataOrigin !== 'synthetic' ||
    summary.observableFacts.length < 1 ||
    summary.observableFacts.length > 3
  ) {
    return failure('Parent summary shape or disclosure is invalid');
  }
  const allTexts = summaryTexts(summary);
  if (allTexts.some((value) => !value.ar.trim() || !value.en.trim())) {
    return failure('Parent summary requires non-empty bilingual fields');
  }
  const safety = evaluateAssistantSafety({ audience: 'parent', texts: allTexts });
  if (!safety.accepted) {
    return failure('Parent summary contains prohibited inference or judgment', 'SAFETY_REJECTED');
  }
  if (summary.observableFacts.some((fact) => !observableFactSchema.safeParse(fact).success)) {
    return failure(
      'Parent summary facts must describe bounded observable actions',
      'SAFETY_REJECTED',
    );
  }
  return { ok: true, data: summary };
}

function rejectedCorrection(
  summary: ParentPatternSummary,
  rejectedFor: readonly ParentSummaryCorrectionRejection[],
): DomainResult<ParentSummaryCorrectionAttempt> {
  return {
    ok: true,
    data: { disposition: 'rejected', summary, rejectedFor },
  };
}

function looksObservable(value: LocalizedText): boolean {
  return observableFactSchema.safeParse(value).success;
}

export function applyLocalSummaryCorrection(
  summary: Omit<ParentPatternSummary, 'observableFacts'> & {
    readonly observableFacts: readonly LocalizedText[];
  },
  correction: unknown,
): DomainResult<ParentSummaryCorrectionAttempt> {
  const firstFact = summary.observableFacts[0];
  if (!firstFact) return failure('Parent summary requires at least one observable fact');
  const safeSummary = summary as ParentPatternSummary;
  const parsed = summaryCorrectionSchema.safeParse(correction);
  if (!parsed.success) return rejectedCorrection(safeSummary, ['invalid_shape']);
  const value = parsed.data;
  const selected = safeSummary.observableFacts[value.factIndex];
  if (!selected) return rejectedCorrection(safeSummary, ['fact_out_of_range']);

  if (value.operation === 'remove_fact' && safeSummary.observableFacts.length === 1) {
    return rejectedCorrection(safeSummary, ['would_remove_all_facts']);
  }

  if (value.operation === 'replace_fact') {
    const safety = evaluateAssistantSafety({
      audience: 'parent',
      texts: [value.correctedFact],
    });
    if (!safety.accepted) return rejectedCorrection(safeSummary, ['prohibited_language']);
    if (!looksObservable(value.correctedFact)) {
      return rejectedCorrection(safeSummary, ['not_observable_fact']);
    }
  }

  let observableFacts: readonly [LocalizedText, ...LocalizedText[]];
  let uncertainty = safeSummary.uncertainty;
  if (value.operation === 'replace_fact') {
    observableFacts = safeSummary.observableFacts.map((fact, index) =>
      index === value.factIndex ? value.correctedFact : fact,
    ) as [LocalizedText, ...LocalizedText[]];
  } else {
    const remainingFacts = safeSummary.observableFacts.filter(
      (_, index) => index !== value.factIndex,
    );
    if (!remainingFacts[0]) return rejectedCorrection(safeSummary, ['would_remove_all_facts']);
    observableFacts = remainingFacts as [LocalizedText, ...LocalizedText[]];
    if (value.operation === 'mark_fact_uncertain') {
      uncertainty = {
        ar: `${safeSummary.uncertainty.ar} حقيقة غير مؤكدة: ${selected.ar}`,
        en: `${safeSummary.uncertainty.en} Uncertain fact: ${selected.en}`,
      };
    }
  }

  const corrected: ParentPatternSummary = {
    meta: safeSummary.meta,
    timeWindow: safeSummary.timeWindow,
    strengthsFirst: safeSummary.strengthsFirst,
    observableFacts,
    uncertainty,
    questionForChild: safeSummary.questionForChild,
    possibleAdjustment: safeSummary.possibleAdjustment,
    parentCorrectable: true,
    dataOrigin: 'synthetic',
    localCorrection: {
      applied: true,
      operation: value.operation,
      factIndex: value.factIndex,
    },
  };
  const validated = validateParentSummary(corrected);
  if (!validated.ok) {
    const reason =
      validated.error.code === 'SAFETY_REJECTED' ? 'prohibited_language' : 'invalid_shape';
    return rejectedCorrection(safeSummary, [reason]);
  }
  return {
    ok: true,
    data: { disposition: 'applied', summary: corrected, rejectedFor: [] },
  };
}

export function resolveParentGuideFallback(input: {
  readonly request: ParentGuideRequest;
  readonly failureReason: Exclude<FallbackReason, 'remote_not_configured'>;
  readonly preparedSuggestion: ParentGuideTaskSuggestion;
}): DomainResult<ParentGuideTaskSuggestion> {
  const intent = validateParentGuideIntent(input.request.intent);
  if (!intent.ok) return intent;

  const suggestion: ParentGuideTaskSuggestion = {
    meta: {
      ...input.preparedSuggestion.meta,
      requestId: input.request.requestId,
      audience: 'parent',
      origin: 'prepared',
      fixtureId: 'guide_recycling_refine_v1',
      fallbackUsed: true,
      fallbackReason: input.failureReason,
      disclosure: {
        ...input.preparedSuggestion.meta.disclosure,
        saysAiMayBeWrong: true,
        saysHumanDecides: true,
        preparedIsExplicit: true,
      },
    },
    originalParentText: input.request.parentText,
    suggestedContent: input.preparedSuggestion.suggestedContent,
    changedFields: input.preparedSuggestion.changedFields,
    availableActions: input.preparedSuggestion.availableActions,
    accepted: false,
  };
  return { ok: true, data: suggestion };
}
