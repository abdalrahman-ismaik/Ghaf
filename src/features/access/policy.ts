import type {
  AgeBand,
  BasicAccessibilityDefault,
  ChildPreferredLanguage,
  ChildTreeAvatarId,
  DomainError,
  DomainResult,
  LocaleCode,
  NormalizedParentIdentifier,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
} from '../../models/familyGrowth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const PHONE_PATTERN = /^\+?\d{8,15}$/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/u;

const LOCALES = new Set<LocaleCode>(['ar', 'en']);
const AGE_BANDS = new Set<AgeBand>(['6_8', '9_11', '12_14']);
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

function invalidInput(message: string): DomainError {
  return {
    code: 'INVALID_INPUT',
    message,
    retryable: false,
    fallbackAvailable: false,
  };
}

function isSafeDraftText(value: unknown, maximumLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.length <= maximumLength &&
    !CONTROL_CHARACTER_PATTERN.test(value)
  );
}

function hasOnlyKeys(value: object, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
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

export function normalizeParentIdentifier(
  rawIdentifier: unknown,
): DomainResult<NormalizedParentIdentifier> {
  if (typeof rawIdentifier !== 'string') {
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
  patch: ParentOnboardingDraftPatch,
): DomainResult<ParentOnboardingDraft> {
  if (
    typeof patch !== 'object' ||
    patch === null ||
    !hasOnlyKeys(patch, ['familyName', 'appLanguage', 'child'])
  ) {
    return { ok: false, error: invalidInput('The onboarding update is not supported') };
  }
  if (patch.familyName !== undefined && !isSafeDraftText(patch.familyName, 60)) {
    return { ok: false, error: invalidInput('Family name must be 60 characters or fewer') };
  }
  if (patch.appLanguage !== undefined && !LOCALES.has(patch.appLanguage)) {
    return { ok: false, error: invalidInput('Choose a supported application language') };
  }

  const childPatch = patch.child;
  if (
    childPatch !== undefined &&
    (typeof childPatch !== 'object' ||
      childPatch === null ||
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
  if (childPatch?.nickname !== undefined && !isSafeDraftText(childPatch.nickname, 40)) {
    return { ok: false, error: invalidInput('Nickname must be 40 characters or fewer') };
  }
  if (childPatch?.avatarId !== undefined && !AVATAR_IDS.has(childPatch.avatarId)) {
    return { ok: false, error: invalidInput('Choose a supported tree avatar') };
  }
  if (childPatch?.ageBand !== undefined && !AGE_BANDS.has(childPatch.ageBand)) {
    return { ok: false, error: invalidInput('Choose a supported age band') };
  }
  if (
    childPatch?.preferredLanguage !== undefined &&
    !PREFERRED_LANGUAGES.has(childPatch.preferredLanguage)
  ) {
    return { ok: false, error: invalidInput('Choose a supported preferred language') };
  }
  if (
    childPatch?.accessibilityDefaults !== undefined &&
    (!Array.isArray(childPatch.accessibilityDefaults) ||
      childPatch.accessibilityDefaults.length > ACCESSIBILITY_DEFAULTS.size ||
      childPatch.accessibilityDefaults.some((value) => !ACCESSIBILITY_DEFAULTS.has(value)) ||
      new Set(childPatch.accessibilityDefaults).size !== childPatch.accessibilityDefaults.length)
  ) {
    return { ok: false, error: invalidInput('Choose only supported accessibility defaults') };
  }

  return {
    ok: true,
    data: {
      familyName: patch.familyName ?? current.familyName,
      appLanguage: patch.appLanguage ?? current.appLanguage,
      child: {
        ...current.child,
        ...childPatch,
      },
    },
  };
}

export function validateCompleteParentOnboardingDraft(
  draft: ParentOnboardingDraft,
): DomainResult<ParentOnboardingDraft> {
  const validated = updateParentOnboardingDraft(draft, draft);
  if (!validated.ok) return validated;

  const familyName = draft.familyName.trim();
  const nickname = draft.child.nickname.trim();
  if (familyName.length < 2) {
    return { ok: false, error: invalidInput('Enter a family name') };
  }
  if (nickname.length < 1) {
    return { ok: false, error: invalidInput('Enter a Child nickname') };
  }

  return {
    ok: true,
    data: {
      ...draft,
      familyName,
      child: { ...draft.child, nickname },
    },
  };
}
