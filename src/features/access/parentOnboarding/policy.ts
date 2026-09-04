import type { LanguagePreference } from '../../../models/access';
import type { DomainError, DomainResult } from '../../../models/familyGrowth';
import type {
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
  NormalizedParentIdentifier,
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

function isAllowedString<T extends string>(value: unknown, allowed: ReadonlySet<T>): value is T {
  return typeof value === 'string' && allowed.has(value as T);
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

function cloneDraft(draft: ParentOnboardingDraft): ParentOnboardingDraft {
  return {
    ...draft,
    child: {
      ...draft.child,
      accessibilityDefaults: [...draft.child.accessibilityDefaults],
    },
  };
}

export function createInitialParentOnboardingDraft(): ParentOnboardingDraft {
  return {
    familyName: 'عائلة النخلة',
    appLanguage: 'ar',
    child: {
      nickname: 'سالم',
      avatarId: 'ghaf_tree',
      ageBand: '9_11',
      preferredLanguage: 'ar',
      accessibilityDefaults: ['simpler_instructions'],
    },
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

export function updateParentOnboardingDraft(
  current: ParentOnboardingDraft,
  patch: unknown,
): DomainResult<ParentOnboardingDraft> {
  if (!isRecord(patch) || !hasOnlyKeys(patch, ['familyName', 'appLanguage', 'child'])) {
    return { ok: false, error: invalidInput('The onboarding update is not supported') };
  }
  if (patch.familyName !== undefined && !isSafeText(patch.familyName, 60)) {
    return { ok: false, error: invalidInput('Family name must be 60 characters or fewer') };
  }
  if (patch.appLanguage !== undefined && !isAllowedString(patch.appLanguage, LOCALES)) {
    return { ok: false, error: invalidInput('Choose a supported application language') };
  }

  const childPatch = patch.child;
  if (
    childPatch !== undefined &&
    (!isRecord(childPatch) ||
      !hasOnlyKeys(childPatch, [
        'nickname',
        'avatarId',
        'ageBand',
        'preferredLanguage',
        'accessibilityDefaults',
      ]))
  ) {
    return { ok: false, error: invalidInput('The Child profile update is not supported') };
  }
  if (isRecord(childPatch)) {
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
    if (childPatch.accessibilityDefaults !== undefined) {
      const values = childPatch.accessibilityDefaults;
      if (
        !Array.isArray(values) ||
        values.length > ACCESSIBILITY_DEFAULTS.size ||
        values.some((value) => !isAllowedString(value, ACCESSIBILITY_DEFAULTS)) ||
        new Set(values).size !== values.length
      ) {
        return { ok: false, error: invalidInput('Choose only supported accessibility defaults') };
      }
    }
  }

  const typedPatch = patch as ParentOnboardingDraftPatch;
  return {
    ok: true,
    data: {
      familyName: typedPatch.familyName ?? current.familyName,
      appLanguage: typedPatch.appLanguage ?? current.appLanguage,
      child: {
        ...current.child,
        ...typedPatch.child,
        accessibilityDefaults: [
          ...(typedPatch.child?.accessibilityDefaults ?? current.child.accessibilityDefaults),
        ],
      },
    },
  };
}

export function validateCompleteParentOnboardingDraft(
  draft: ParentOnboardingDraft,
): DomainResult<ParentOnboardingDraft> {
  const validated = updateParentOnboardingDraft(draft, draft);
  if (!validated.ok) return validated;

  const familyName = validated.data.familyName.trim();
  const nickname = validated.data.child.nickname.trim();
  if (familyName.length < 2) {
    return { ok: false, error: invalidInput('Enter a family name') };
  }
  if (nickname.length < 1) {
    return { ok: false, error: invalidInput('Enter a Child nickname') };
  }

  return {
    ok: true,
    data: {
      ...cloneDraft(validated.data),
      familyName,
      child: { ...validated.data.child, nickname },
    },
  };
}

export function toAccessLanguagePreference(
  preferredLanguage: ChildPreferredLanguage,
): LanguagePreference {
  return preferredLanguage === 'both' ? 'bilingual' : preferredLanguage;
}
