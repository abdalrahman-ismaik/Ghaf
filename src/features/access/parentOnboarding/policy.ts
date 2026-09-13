import type { LanguagePreference } from '../../../models/access';
import type { DomainError, DomainResult } from '../../../models/familyGrowth';
import {
  cloneFamilyConnectionDirectory,
  createInitialFamilyConnectionDirectory,
  validateCompleteFamilyConnectionDirectory,
  validateFamilyConnectionDraft,
} from '../../family-connections';
import type {
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
  LocalChildHobby,
  LocalChildInterest,
  LocalChildSex,
  LocalSupportPreference,
  NormalizedParentIdentifier,
  ParentOnboardingChildDraft,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
} from '../../../models/parentOnboarding';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const PHONE_PATTERN = /^\+?\d{8,15}$/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;

const LOCALES = new Set(['ar', 'en']);
const AGE_BANDS = new Set(['6_8', '9_11', '12_14']);
const PREFERRED_LANGUAGES = new Set<ChildPreferredLanguage>(['ar', 'en', 'both']);
const AVATAR_IDS = new Set<ChildTreeAvatarId>([
  'ghaf_tree',
  'leaf',
  'flower',
  'energy_leaf',
  'water_drop',
]);
const ACCESSIBILITY_DEFAULTS = new Set<BasicAccessibilityDefault>([
  'larger_text',
  'simpler_instructions',
  'high_contrast',
  'reduced_motion',
]);
const SEXES = new Set<LocalChildSex>(['male', 'female']);
const INTERESTS = new Set<LocalChildInterest>([
  'nature',
  'making',
  'stories',
  'family_helping',
  'sustainability',
]);
const HOBBIES = new Set<LocalChildHobby>(['drawing', 'reading', 'sports', 'puzzles', 'gardening']);
const SUPPORT_PREFERENCES = new Set<LocalSupportPreference>([
  'short_steps',
  'visual_examples',
  'extra_time',
  'adult_alongside',
  'quiet_reminders',
]);
const CHILD_PROFILE_IDS = ['child_salem', 'child_alya'] as const;

// This local fixture demonstrates flow only; it is not a credential.
export const PARENT_VERIFICATION_CODE = '424242' as const;

function invalidInput(message: string): DomainError {
  return {
    code: 'INVALID_INPUT',
    message,
    retryable: false,
    fallbackAvailable: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isSafeText(value: unknown, maximumLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.length <= maximumLength &&
    !CONTROL_CHARACTER_PATTERN.test(value)
  );
}

function isSafeCustomDraftText(value: unknown): value is string | null {
  return value === null || isSafeText(value, 80);
}

function isCompleteCustomAnswer(value: string | null): boolean {
  return value === null || value.trim().length >= 2;
}

function choicesFitLimit(child: ParentOnboardingChildDraft): boolean {
  return (
    child.interests.length + (child.customInterest === null ? 0 : 1) <= 3 &&
    child.hobbies.length + (child.customHobby === null ? 0 : 1) <= 3 &&
    child.supportPreferences.length + (child.customSupportPreference === null ? 0 : 1) <= 3 &&
    child.accessibilityDefaults.length + (child.customAccessibility === null ? 0 : 1) <= 4
  );
}

export function isChildProfileComplete(child: ParentOnboardingChildDraft): boolean {
  return (
    child.nickname.trim().length >= 2 &&
    child.sex !== null &&
    isCompleteCustomAnswer(child.customInterest) &&
    isCompleteCustomAnswer(child.customHobby) &&
    isCompleteCustomAnswer(child.customSupportPreference) &&
    isCompleteCustomAnswer(child.customAccessibility) &&
    choicesFitLimit(child)
  );
}

function isAllowedString<T extends string>(value: unknown, allowed: ReadonlySet<T>): value is T {
  return typeof value === 'string' && allowed.has(value as T);
}

function isAllowedArray<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  maximumLength: number,
): value is readonly T[] {
  return (
    Array.isArray(value) &&
    value.length <= maximumLength &&
    value.every((item) => isAllowedString(item, allowed)) &&
    new Set(value).size === value.length
  );
}

function maskEmail(email: string): string {
  const separator = email.indexOf('@');
  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  return `${local.slice(0, 1)}***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/gu, '');
  return `${'•'.repeat(Math.max(0, digits.length - 2))}${digits.slice(-2)}`;
}

function cloneChild(child: ParentOnboardingChildDraft): ParentOnboardingChildDraft {
  return {
    ...child,
    interests: [...child.interests],
    hobbies: [...child.hobbies],
    accessibilityDefaults: [...child.accessibilityDefaults],
    supportPreferences: [...child.supportPreferences],
  };
}

function cloneDraft(draft: ParentOnboardingDraft): ParentOnboardingDraft {
  return {
    ...draft,
    familyConnections: cloneFamilyConnectionDirectory(draft.familyConnections),
    children: draft.children.map(cloneChild),
  };
}

export function createInitialParentOnboardingDraft(): ParentOnboardingDraft {
  return {
    familyConnections: createInitialFamilyConnectionDirectory(),
    familyName: 'عائلة أبو راشد',
    appLanguage: 'ar',
    childCount: 2,
    children: [
      {
        profileId: 'child_salem',
        nickname: 'سالم',
        avatarId: 'ghaf_tree',
        ageBand: '9_11',
        preferredLanguage: 'ar',
        sex: 'male',
        interests: ['sustainability', 'nature'],
        hobbies: ['gardening'],
        accessibilityDefaults: ['simpler_instructions'],
        supportPreferences: ['short_steps', 'adult_alongside'],
        customInterest: null,
        customHobby: null,
        customSupportPreference: null,
        customAccessibility: null,
        personalizationEnabled: true,
      },
      {
        profileId: 'child_alya',
        nickname: 'عليا',
        avatarId: 'flower',
        ageBand: '9_11',
        preferredLanguage: 'ar',
        sex: 'female',
        interests: ['stories', 'family_helping'],
        hobbies: ['reading'],
        accessibilityDefaults: [],
        supportPreferences: ['visual_examples'],
        customInterest: null,
        customHobby: null,
        customSupportPreference: null,
        customAccessibility: null,
        personalizationEnabled: true,
      },
    ],
  };
}

export function normalizeParentIdentifier(
  rawIdentifier: unknown,
): DomainResult<NormalizedParentIdentifier> {
  if (typeof rawIdentifier !== 'string' || CONTROL_CHARACTER_PATTERN.test(rawIdentifier)) {
    return { ok: false, error: invalidInput('Enter a valid synthetic phone number or email') };
  }

  const trimmed = rawIdentifier.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return { ok: false, error: invalidInput('Enter a valid synthetic phone number or email') };
  }

  if (trimmed.includes('@')) {
    const normalizedIdentifier = trimmed.toLocaleLowerCase('en-US');
    if (!EMAIL_PATTERN.test(normalizedIdentifier)) {
      return { ok: false, error: invalidInput('Enter a valid synthetic email') };
    }
    return {
      ok: true,
      data: {
        normalizedIdentifier,
        identifierKind: 'email',
        maskedDestination: maskEmail(normalizedIdentifier),
      },
    };
  }

  const compact = trimmed.replace(/[\s()-]/gu, '');
  const normalizedIdentifier = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  if (!PHONE_PATTERN.test(normalizedIdentifier)) {
    return { ok: false, error: invalidInput('Enter a valid synthetic phone number') };
  }
  return {
    ok: true,
    data: {
      normalizedIdentifier,
      identifierKind: 'phone',
      maskedDestination: maskPhone(normalizedIdentifier),
    },
  };
}

function validateChildPatch(childPatch: Record<string, unknown>): DomainResult<true> {
  if (
    !hasOnlyKeys(childPatch, [
      'nickname',
      'avatarId',
      'ageBand',
      'preferredLanguage',
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
    ])
  ) {
    return { ok: false, error: invalidInput('The Child profile update is not supported') };
  }
  if (childPatch.nickname !== undefined && !isSafeText(childPatch.nickname, 40)) {
    return { ok: false, error: invalidInput('Nickname must be 40 characters or fewer') };
  }
  if (childPatch.avatarId !== undefined && !isAllowedString(childPatch.avatarId, AVATAR_IDS)) {
    return { ok: false, error: invalidInput('Choose a supported tree avatar') };
  }
  if (childPatch.ageBand !== undefined && !isAllowedString(childPatch.ageBand, AGE_BANDS)) {
    return { ok: false, error: invalidInput('Choose a supported age band') };
  }
  if (
    childPatch.preferredLanguage !== undefined &&
    !isAllowedString(childPatch.preferredLanguage, PREFERRED_LANGUAGES)
  ) {
    return { ok: false, error: invalidInput('Choose a supported preferred language') };
  }
  if (
    childPatch.sex !== undefined &&
    childPatch.sex !== null &&
    !isAllowedString(childPatch.sex, SEXES)
  ) {
    return { ok: false, error: invalidInput('Choose male or female for the Child profile') };
  }
  if (childPatch.interests !== undefined && !isAllowedArray(childPatch.interests, INTERESTS, 3)) {
    return { ok: false, error: invalidInput('Choose up to three supported interests') };
  }
  if (childPatch.hobbies !== undefined && !isAllowedArray(childPatch.hobbies, HOBBIES, 3)) {
    return { ok: false, error: invalidInput('Choose up to three supported hobbies') };
  }
  if (
    childPatch.accessibilityDefaults !== undefined &&
    !isAllowedArray(childPatch.accessibilityDefaults, ACCESSIBILITY_DEFAULTS, 4)
  ) {
    return { ok: false, error: invalidInput('Choose only supported accessibility defaults') };
  }
  if (
    childPatch.supportPreferences !== undefined &&
    !isAllowedArray(childPatch.supportPreferences, SUPPORT_PREFERENCES, 3)
  ) {
    return { ok: false, error: invalidInput('Choose up to three supported help preferences') };
  }
  for (const key of [
    'customInterest',
    'customHobby',
    'customSupportPreference',
    'customAccessibility',
  ] as const) {
    if (childPatch[key] !== undefined && !isSafeCustomDraftText(childPatch[key])) {
      return { ok: false, error: invalidInput('Custom answers must be 80 characters or fewer') };
    }
  }
  if (
    childPatch.personalizationEnabled !== undefined &&
    typeof childPatch.personalizationEnabled !== 'boolean'
  ) {
    return { ok: false, error: invalidInput('Choose whether prepared suggestions are enabled') };
  }
  return { ok: true, data: true };
}

export function updateParentOnboardingDraft(
  current: ParentOnboardingDraft,
  patch: unknown,
): DomainResult<ParentOnboardingDraft> {
  if (
    !isRecord(patch) ||
    !hasOnlyKeys(patch, [
      'familyConnections',
      'familyName',
      'appLanguage',
      'childCount',
      'childIndex',
      'child',
    ])
  ) {
    return { ok: false, error: invalidInput('The onboarding update is not supported') };
  }
  if (patch.familyName !== undefined && !isSafeText(patch.familyName, 60)) {
    return { ok: false, error: invalidInput('Family name must be 60 characters or fewer') };
  }
  if (patch.familyConnections !== undefined) {
    const validatedDirectory = validateFamilyConnectionDraft(patch.familyConnections);
    if (!validatedDirectory.ok) return validatedDirectory;
  }
  if (patch.appLanguage !== undefined && !isAllowedString(patch.appLanguage, LOCALES)) {
    return { ok: false, error: invalidInput('Choose a supported application language') };
  }
  if (patch.childCount !== undefined && patch.childCount !== 1 && patch.childCount !== 2) {
    return { ok: false, error: invalidInput('Choose one or two Child profiles') };
  }
  if (
    patch.childIndex !== undefined &&
    (typeof patch.childIndex !== 'number' ||
      !Number.isInteger(patch.childIndex) ||
      patch.childIndex < 0 ||
      patch.childIndex > 1)
  ) {
    return { ok: false, error: invalidInput('Choose a supported Child profile position') };
  }
  if (patch.child !== undefined) {
    if (!isRecord(patch.child)) {
      return { ok: false, error: invalidInput('The Child profile update is not supported') };
    }
    const validatedChild = validateChildPatch(patch.child);
    if (!validatedChild.ok) return validatedChild;
  }

  const typedPatch = patch as ParentOnboardingDraftPatch;
  const childIndex = typedPatch.childIndex ?? 0;
  const children = current.children.map((child, index) => {
    if (index !== childIndex || !typedPatch.child) return cloneChild(child);
    return {
      ...child,
      ...typedPatch.child,
      interests: [...(typedPatch.child.interests ?? child.interests)],
      hobbies: [...(typedPatch.child.hobbies ?? child.hobbies)],
      accessibilityDefaults: [
        ...(typedPatch.child.accessibilityDefaults ?? child.accessibilityDefaults),
      ],
      supportPreferences: [...(typedPatch.child.supportPreferences ?? child.supportPreferences)],
    };
  });
  if (children.length !== 2) {
    return { ok: false, error: invalidInput('Exactly two internal Child slots are required') };
  }
  return {
    ok: true,
    data: {
      familyConnections: typedPatch.familyConnections
        ? cloneFamilyConnectionDirectory(typedPatch.familyConnections)
        : cloneFamilyConnectionDirectory(current.familyConnections),
      familyName: typedPatch.familyName ?? current.familyName,
      appLanguage: typedPatch.appLanguage ?? current.appLanguage,
      childCount: typedPatch.childCount ?? current.childCount,
      children,
    },
  };
}

export function validateCompleteParentOnboardingDraft(
  draft: ParentOnboardingDraft,
): DomainResult<ParentOnboardingDraft> {
  let validated = updateParentOnboardingDraft(createInitialParentOnboardingDraft(), {
    familyConnections: draft.familyConnections,
    familyName: draft.familyName,
    appLanguage: draft.appLanguage,
    childCount: draft.childCount,
  });
  if (!validated.ok) return validated;
  if (!Array.isArray(draft.children) || draft.children.length !== 2) {
    return { ok: false, error: invalidInput('Exactly two internal Child slots are required') };
  }
  for (const [childIndex, child] of draft.children.entries()) {
    if (child.profileId !== CHILD_PROFILE_IDS[childIndex]) {
      return { ok: false, error: invalidInput('Child profile positions cannot change') };
    }
    const { profileId: _profileId, ...editableChild } = child;
    validated = updateParentOnboardingDraft(validated.data, { childIndex, child: editableChild });
    if (!validated.ok) return validated;
  }

  const familyName = validated.data.familyName.trim();
  if (familyName.length < 2) {
    return { ok: false, error: invalidInput('Enter a family name') };
  }
  const familyConnections = validateCompleteFamilyConnectionDirectory(
    validated.data.familyConnections,
  );
  if (!familyConnections.ok) return familyConnections;
  const configuredChildren = validated.data.children.slice(0, validated.data.childCount);
  if (
    configuredChildren.length !== validated.data.childCount ||
    configuredChildren.some((child) => !isChildProfileComplete(child))
  ) {
    return { ok: false, error: invalidInput('Complete every required Child profile field') };
  }

  return {
    ok: true,
    data: {
      ...cloneDraft(validated.data),
      familyConnections: familyConnections.data,
      familyName,
      children: validated.data.children.map((child, index) => ({
        ...cloneChild(child),
        nickname: index < validated.data.childCount ? child.nickname.trim() : child.nickname,
        customInterest: child.customInterest?.trim() || null,
        customHobby: child.customHobby?.trim() || null,
        customSupportPreference: child.customSupportPreference?.trim() || null,
        customAccessibility: child.customAccessibility?.trim() || null,
      })),
    },
  };
}

export function toAccessLanguagePreference(
  preferredLanguage: ChildPreferredLanguage,
): LanguagePreference {
  return preferredLanguage === 'both' ? 'bilingual' : preferredLanguage;
}
