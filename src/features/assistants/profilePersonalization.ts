import type { DomainResult, TaskCategoryId } from '../../models/familyGrowth';
import type {
  BasicAccessibilityDefault,
  LocalChildHobby,
  LocalChildInterest,
  LocalSupportPreference,
} from '../../models/parentOnboarding';

const AGE_BANDS = new Set(['6_8', '9_11', '12_14']);
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
  'interests',
  'hobbies',
  'accessibilityDefaults',
  'supportPreferences',
  'personalizationEnabled',
] as const;

export interface ProfilePersonalizationInput {
  readonly ageBand: '6_8' | '9_11' | '12_14';
  readonly interests: readonly LocalChildInterest[];
  readonly hobbies: readonly LocalChildHobby[];
  readonly accessibilityDefaults: readonly BasicAccessibilityDefault[];
  readonly supportPreferences: readonly LocalSupportPreference[];
  readonly personalizationEnabled: boolean;
}

export interface PreparedProfilePersonalization {
  readonly enabled: boolean;
  readonly coachingStyle: 'short_visual_steps' | 'short_steps' | 'visual_steps' | 'guided_steps';
  readonly recommendedCategoryIds: readonly TaskCategoryId[];
  readonly parentApprovalRequired: true;
  readonly meta: {
    readonly origin: 'prepared';
    readonly localOnly: true;
    readonly saysAiMayBeWrong: true;
    readonly providerCalled: false;
  };
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

function recommendedCategories(input: ProfilePersonalizationInput): readonly TaskCategoryId[] {
  const categories: TaskCategoryId[] = [];
  if (
    input.interests.includes('sustainability') ||
    input.interests.includes('nature') ||
    input.hobbies.includes('gardening')
  ) {
    categories.push('green_impact');
  }
  if (
    input.interests.includes('stories') ||
    input.hobbies.includes('reading') ||
    input.hobbies.includes('puzzles') ||
    input.accessibilityDefaults.includes('simpler_instructions')
  ) {
    categories.push('learning_wellbeing');
  }
  if (input.interests.includes('family_helping')) categories.push('home_responsibility');
  if (input.interests.includes('making') || input.hobbies.includes('drawing')) {
    categories.push('kindness_community');
  }
  return categories.length > 0 ? [...new Set(categories)].slice(0, 2) : ['home_responsibility'];
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
    !validArray(input.interests, INTERESTS, 3) ||
    !validArray(input.hobbies, HOBBIES, 3) ||
    !validArray(input.accessibilityDefaults, ACCESSIBILITY, 4) ||
    !validArray(input.supportPreferences, SUPPORT, 3) ||
    typeof input.personalizationEnabled !== 'boolean'
  ) {
    return failure('Prepared profile personalization accepts only reviewed curated fields');
  }
  const typed = input as unknown as ProfilePersonalizationInput;
  const hasShort =
    typed.supportPreferences.includes('short_steps') ||
    typed.accessibilityDefaults.includes('simpler_instructions');
  const hasVisual = typed.supportPreferences.includes('visual_examples');
  const coachingStyle =
    hasShort && hasVisual
      ? 'short_visual_steps'
      : hasShort
        ? 'short_steps'
        : hasVisual
          ? 'visual_steps'
          : 'guided_steps';
  return {
    ok: true,
    data: {
      enabled: typed.personalizationEnabled,
      coachingStyle,
      recommendedCategoryIds: typed.personalizationEnabled ? recommendedCategories(typed) : [],
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
