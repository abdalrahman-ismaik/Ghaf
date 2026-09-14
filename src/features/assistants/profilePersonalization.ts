import type { DomainResult, TaskCategoryId } from '../../models/familyGrowth';
import type {
  BasicAccessibilityDefault,
  LocalChildHobby,
  LocalChildInterest,
  LocalChildSex,
  LocalSupportPreference,
} from '../../models/parentOnboarding';

const AGE_BANDS = new Set(['6_8', '9_11', '12_14']);
const SEXES = new Set<LocalChildSex>(['male', 'female']);
const INTERESTS = new Set(['nature', 'making', 'stories', 'family_helping', 'sustainability']);
const HOBBIES = new Set(['drawing', 'reading', 'sports', 'puzzles', 'gardening']);
const ACCESSIBILITY = new Set([
  'larger_text',
  'simpler_instructions',
  'high_contrast',
  'reduced_motion',
]);
const SUPPORT = new Set([
  'short_steps',
  'visual_examples',
  'extra_time',
  'adult_alongside',
  'quiet_reminders',
]);
const ALLOWED_KEYS = [
  'ageBand',
  'sex',
  'interests',
  'hobbies',
  'accessibilityDefaults',
  'supportPreferences',
  'customInterest',
  'customHobby',
  'customSupportPreference',
  'customAccessibility',
  'personalizationEnabled',
] as const;
const TASK_CATEGORY_IDS = new Set<TaskCategoryId>([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);

export interface ProfilePersonalizationInput {
  readonly ageBand: '6_8' | '9_11' | '12_14';
  readonly sex: LocalChildSex;
  readonly interests: readonly LocalChildInterest[];
  readonly hobbies: readonly LocalChildHobby[];
  readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
  readonly supportPreferences: readonly LocalSupportPreference[];
  readonly customInterest: string | null;
  readonly customHobby: string | null;
  readonly customSupportPreference: string | null;
  readonly customAccessibility: string | null;
  readonly personalizationEnabled: boolean;
}

export type ProfileRecommendationReason =
  | 'sustainability'
  | 'nature'
  | 'gardening'
  | 'stories'
  | 'reading'
  | 'puzzles'
  | 'simplerInstructions'
  | 'familyHelping'
  | 'making'
  | 'drawing'
  | 'customInterestMatch'
  | 'practicalStart';

export interface PreparedCategoryRecommendation {
  readonly categoryId: TaskCategoryId;
  readonly reasonCode: ProfileRecommendationReason;
}

export interface PreparedProfilePersonalization {
  readonly enabled: boolean;
  readonly addressForm: 'masculine' | 'feminine';
  readonly coachingStyle: 'short_visual_steps' | 'short_steps' | 'visual_steps' | 'guided_steps';
  readonly recommendedCategoryIds: readonly TaskCategoryId[];
  readonly recommendations: readonly PreparedCategoryRecommendation[];
  readonly customSignalsUsed: boolean;
  readonly parentApprovalRequired: true;
  readonly meta: {
    readonly origin: 'prepared';
    readonly localOnly: true;
    readonly saysAiMayBeWrong: true;
    readonly providerCalled: false;
  };
}

export interface PreparedTaskCategoryPlan {
  readonly recommendedCategoryIds: readonly TaskCategoryId[];
  readonly recommendations: readonly PreparedCategoryRecommendation[];
  readonly orderedCategoryIds: readonly TaskCategoryId[];
  readonly preselectedCategoryId: TaskCategoryId | null;
  readonly parentApprovalRequired: true;
  readonly meta: PreparedProfilePersonalization['meta'];
}

function failure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function validArray(value: unknown, allowed: ReadonlySet<string>, maximum: number): boolean {
  return (
    Array.isArray(value) &&
    value.length <= maximum &&
    value.every((item) => typeof item === 'string' && allowed.has(item)) &&
    new Set(value).size === value.length
  );
}

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;
const GREEN_SIGNAL =
  /nature|garden|plant|recycl|environment|sustain|outdoor|الطبيع|الحديق|النبات|الزراع|التدوير|البيئ|الاستدام/iu;
const LEARNING_SIGNAL =
  /read|book|story|puzzle|science|learn|study|قراء|كتاب|قص|ألغاز|علوم|تعل[ّ]?م|دراس/iu;
const HOME_SIGNAL =
  /family|home|help|tidy|organi[sz]|kitchen|عائل|أسرة|منزل|مساعدة|ترتيب|تنظيم|مطبخ/iu;
const KINDNESS_SIGNAL = /draw|art|craft|make|creat|community|رسم|فن|حرف|صنع|ابتكار|مجتمع/iu;
const SHORT_SIGNAL = /short|simple|brief|one step|قصير|بسيط|خطوة/iu;
const VISUAL_SIGNAL = /visual|picture|show|demo|example|مرئي|صورة|اعرض|عرض|مثال/iu;

function validCustomAnswer(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === 'string' &&
      value.trim() === value &&
      value.length >= 2 &&
      value.length <= 80 &&
      !CONTROL_CHARACTER_PATTERN.test(value))
  );
}

function customCategorySignals(input: ProfilePersonalizationInput): readonly TaskCategoryId[] {
  const text = [input.customInterest, input.customHobby].filter(Boolean).join(' ');
  const categories: TaskCategoryId[] = [];
  if (GREEN_SIGNAL.test(text)) categories.push('green_impact');
  if (LEARNING_SIGNAL.test(text)) categories.push('learning_wellbeing');
  if (HOME_SIGNAL.test(text)) categories.push('home_responsibility');
  if (KINDNESS_SIGNAL.test(text)) categories.push('kindness_community');
  return categories;
}

function customSupportSignals(input: ProfilePersonalizationInput) {
  const text = [input.customSupportPreference, input.customAccessibility].filter(Boolean).join(' ');
  return {
    short: SHORT_SIGNAL.test(text),
    visual: VISUAL_SIGNAL.test(text),
  };
}

function recommendedCategories(
  input: ProfilePersonalizationInput,
): readonly PreparedCategoryRecommendation[] {
  const categories: PreparedCategoryRecommendation[] = [];
  if (
    input.interests.includes('sustainability') ||
    input.interests.includes('nature') ||
    input.hobbies.includes('gardening')
  ) {
    categories.push({
      categoryId: 'green_impact',
      reasonCode: input.interests.includes('sustainability')
        ? 'sustainability'
        : input.interests.includes('nature')
          ? 'nature'
          : 'gardening',
    });
  }
  if (
    input.interests.includes('stories') ||
    input.hobbies.includes('reading') ||
    input.hobbies.includes('puzzles') ||
    input.accessibilityDefaults.includes('simpler_instructions')
  ) {
    categories.push({
      categoryId: 'learning_wellbeing',
      reasonCode: input.interests.includes('stories')
        ? 'stories'
        : input.hobbies.includes('reading')
          ? 'reading'
          : input.hobbies.includes('puzzles')
            ? 'puzzles'
            : 'simplerInstructions',
    });
  }
  if (input.interests.includes('family_helping')) {
    categories.push({ categoryId: 'home_responsibility', reasonCode: 'familyHelping' });
  }
  if (input.interests.includes('making') || input.hobbies.includes('drawing')) {
    categories.push({
      categoryId: 'kindness_community',
      reasonCode: input.interests.includes('making') ? 'making' : 'drawing',
    });
  }
  for (const categoryId of customCategorySignals(input)) {
    categories.push({ categoryId, reasonCode: 'customInterestMatch' });
  }
  return categories.length > 0
    ? categories
        .filter(
          (entry, index) =>
            categories.findIndex((candidate) => candidate.categoryId === entry.categoryId) ===
            index,
        )
        .slice(0, 2)
    : [{ categoryId: 'home_responsibility', reasonCode: 'practicalStart' }];
}

export function createPreparedProfilePersonalization(
  value: unknown,
): DomainResult<PreparedProfilePersonalization> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return failure('Prepared profile personalization input is invalid');
  }
  const input = value as Record<string, unknown>;
  const allowed = new Set(ALLOWED_KEYS);
  if (
    Object.keys(input).length !== ALLOWED_KEYS.length ||
    !Object.keys(input).every((key) => allowed.has(key as (typeof ALLOWED_KEYS)[number])) ||
    typeof input.ageBand !== 'string' ||
    !AGE_BANDS.has(input.ageBand) ||
    typeof input.sex !== 'string' ||
    !SEXES.has(input.sex as LocalChildSex) ||
    !validArray(input.interests, INTERESTS, 3) ||
    !validArray(input.hobbies, HOBBIES, 3) ||
    !validArray(input.accessibilityDefaults, ACCESSIBILITY, 4) ||
    !validArray(input.supportPreferences, SUPPORT, 3) ||
    !validCustomAnswer(input.customInterest) ||
    !validCustomAnswer(input.customHobby) ||
    !validCustomAnswer(input.customSupportPreference) ||
    !validCustomAnswer(input.customAccessibility) ||
    (input.interests as readonly unknown[]).length + (input.customInterest === null ? 0 : 1) > 3 ||
    (input.hobbies as readonly unknown[]).length + (input.customHobby === null ? 0 : 1) > 3 ||
    (input.supportPreferences as readonly unknown[]).length +
      (input.customSupportPreference === null ? 0 : 1) >
      3 ||
    (input.accessibilityDefaults as readonly unknown[]).length +
      (input.customAccessibility === null ? 0 : 1) >
      4 ||
    typeof input.personalizationEnabled !== 'boolean'
  ) {
    return failure('Prepared profile personalization accepts only reviewed curated fields');
  }
  const typed = input as unknown as ProfilePersonalizationInput;
  const customSupport = customSupportSignals(typed);
  const hasShort =
    typed.supportPreferences.includes('short_steps') ||
    typed.accessibilityDefaults.includes('simpler_instructions') ||
    customSupport.short;
  const hasVisual = typed.supportPreferences.includes('visual_examples') || customSupport.visual;
  const coachingStyle =
    hasShort && hasVisual
      ? 'short_visual_steps'
      : hasShort
        ? 'short_steps'
        : hasVisual
          ? 'visual_steps'
          : 'guided_steps';
  const recommendations = typed.personalizationEnabled ? recommendedCategories(typed) : [];
  return {
    ok: true,
    data: {
      enabled: typed.personalizationEnabled,
      addressForm: typed.sex === 'female' ? 'feminine' : 'masculine',
      coachingStyle,
      recommendedCategoryIds: recommendations.map((entry) => entry.categoryId),
      recommendations,
      customSignalsUsed:
        typed.personalizationEnabled &&
        (customCategorySignals(typed).length > 0 || customSupport.short || customSupport.visual),
      parentApprovalRequired: true,
      meta: {
        origin: 'prepared',
        localOnly: true,
        saysAiMayBeWrong: true,
        providerCalled: false,
      },
    },
  };
}

export function createPreparedTaskCategoryPlan(
  profile: unknown,
  categoryIds: readonly TaskCategoryId[],
): DomainResult<PreparedTaskCategoryPlan> {
  if (
    categoryIds.length !== TASK_CATEGORY_IDS.size ||
    new Set(categoryIds).size !== categoryIds.length ||
    categoryIds.some((categoryId) => !TASK_CATEGORY_IDS.has(categoryId))
  ) {
    return failure('Prepared task category planning requires the exact reviewed catalog');
  }
  const personalization = createPreparedProfilePersonalization(profile);
  if (!personalization.ok) return personalization;
  const recommendedCategoryIds = personalization.data.recommendedCategoryIds.filter((categoryId) =>
    categoryIds.includes(categoryId),
  );
  return {
    ok: true,
    data: {
      recommendedCategoryIds,
      recommendations: personalization.data.recommendations.filter((entry) =>
        recommendedCategoryIds.includes(entry.categoryId),
      ),
      orderedCategoryIds: [
        ...recommendedCategoryIds,
        ...categoryIds.filter((categoryId) => !recommendedCategoryIds.includes(categoryId)),
      ],
      preselectedCategoryId: recommendedCategoryIds[0] ?? null,
      parentApprovalRequired: true,
      meta: personalization.data.meta,
    },
  };
}
