import type { DomainError, DomainResult, SyntheticChildId } from '../../models/familyGrowth';
import {
  LOCAL_FAMILY_SCHEMA_VERSION,
  type CreateLocalFamilyRecordInput,
  type LocalChildProfile,
  type LocalFamilyRecord,
} from '../../models/localFamily';
import type { ParentOnboardingCompletionReceipt } from '../../models/parentOnboarding';
import { toAccessLanguagePreference } from '../access/parentOnboarding';

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;
const CHILD_IDS = ['child_salem', 'child_alya'] as const;
const LOCALES = new Set(['ar', 'en']);
const AGE_BANDS = new Set(['6_8', '9_11', '12_14']);
const PREFERRED_LANGUAGES = new Set(['ar', 'en', 'both']);
const AVATARS = new Set(['ghaf_tree', 'leaf', 'flower', 'energy_leaf', 'water_drop']);
const GENDERS = new Set(['boy', 'girl', 'prefer_not_to_say']);
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

const RECORD_KEYS = [
  'schemaVersion',
  'householdId',
  'familyName',
  'appLanguage',
  'parent',
  'children',
  'pairedChildIds',
  'createdAt',
  'updatedAt',
  'origin',
  'capabilityTruth',
] as const;
const CHILD_KEYS = [
  'id',
  'role',
  'nickname',
  'avatarId',
  'ageBand',
  'preferredLanguage',
  'gender',
  'interests',
  'hobbies',
  'accessibilityDefaults',
  'supportPreferences',
  'personalizationEnabled',
] as const;

function failure(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_RESPONSE',
    message,
    retryable: false,
    fallbackAvailable: false,
  };
  return { ok: false, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const expected = new Set(keys);
  return (
    Object.keys(value).length === keys.length &&
    Object.keys(value).every((key) => expected.has(key))
  );
}

function isText(value: unknown, minimum: number, maximum: number): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    value.length >= minimum &&
    value.length <= maximum &&
    !CONTROL_CHARACTER_PATTERN.test(value)
  );
}

function isEnum(value: unknown, values: ReadonlySet<string>): value is string {
  return typeof value === 'string' && values.has(value);
}

function isEnumArray(value: unknown, values: ReadonlySet<string>, maximum: number): boolean {
  return (
    Array.isArray(value) &&
    value.length <= maximum &&
    value.every((item) => isEnum(item, values)) &&
    new Set(value).size === value.length
  );
}

function isIsoTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
}

function validChild(value: unknown, expectedId: SyntheticChildId): value is LocalChildProfile {
  if (!isRecord(value) || !hasOnlyKeys(value, CHILD_KEYS)) return false;
  return (
    value.id === expectedId &&
    value.role === 'child' &&
    isText(value.nickname, 2, 40) &&
    isEnum(value.avatarId, AVATARS) &&
    isEnum(value.ageBand, AGE_BANDS) &&
    isEnum(value.preferredLanguage, PREFERRED_LANGUAGES) &&
    (value.gender === null || isEnum(value.gender, GENDERS)) &&
    isEnumArray(value.interests, INTERESTS, 3) &&
    isEnumArray(value.hobbies, HOBBIES, 3) &&
    isEnumArray(value.accessibilityDefaults, ACCESSIBILITY, 4) &&
    isEnumArray(value.supportPreferences, SUPPORT, 3) &&
    typeof value.personalizationEnabled === 'boolean'
  );
}

function cloneRecord(record: LocalFamilyRecord): LocalFamilyRecord {
  return {
    ...record,
    parent: { ...record.parent },
    children: record.children.map((child) => ({
      ...child,
      interests: [...child.interests],
      hobbies: [...child.hobbies],
      accessibilityDefaults: [...child.accessibilityDefaults],
      supportPreferences: [...child.supportPreferences],
    })),
    pairedChildIds: [...record.pairedChildIds],
  };
}

export function parseLocalFamilyRecord(raw: string): DomainResult<LocalFamilyRecord> {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return failure('The device-local family directory is not valid JSON');
  }
  if (!isRecord(value) || !hasOnlyKeys(value, RECORD_KEYS)) {
    return failure('The device-local family directory shape is invalid');
  }
  if (
    value.schemaVersion !== LOCAL_FAMILY_SCHEMA_VERSION ||
    value.householdId !== 'household_al_noor' ||
    !isText(value.familyName, 2, 60) ||
    !isEnum(value.appLanguage, LOCALES) ||
    !isRecord(value.parent) ||
    !hasOnlyKeys(value.parent, ['id', 'role']) ||
    value.parent.id !== 'parent_al_noor' ||
    value.parent.role !== 'parent' ||
    !Array.isArray(value.children) ||
    value.children.length < 1 ||
    value.children.length > 2 ||
    !(value.children as unknown[]).every((child, index) => validChild(child, CHILD_IDS[index]!)) ||
    !Array.isArray(value.pairedChildIds) ||
    new Set(value.pairedChildIds).size !== value.pairedChildIds.length ||
    !value.pairedChildIds.every(
      (childId) =>
        typeof childId === 'string' &&
        (value.children as Record<string, unknown>[]).some((child) => child.id === childId),
    ) ||
    !isIsoTime(value.createdAt) ||
    !isIsoTime(value.updatedAt) ||
    Date.parse(value.updatedAt) < Date.parse(value.createdAt) ||
    value.origin !== 'local_demo' ||
    value.capabilityTruth !== 'local_prototype_not_authentication'
  ) {
    return failure('The device-local family directory values are invalid');
  }
  return { ok: true, data: cloneRecord(value as unknown as LocalFamilyRecord) };
}

export function createLocalFamilyRecord(
  input: CreateLocalFamilyRecordInput,
): DomainResult<LocalFamilyRecord> {
  const candidate: LocalFamilyRecord = {
    schemaVersion: LOCAL_FAMILY_SCHEMA_VERSION,
    householdId: 'household_al_noor',
    familyName: input.familyName.trim(),
    appLanguage: input.appLanguage,
    parent: { id: 'parent_al_noor', role: 'parent' },
    children: input.children.map((child) => ({
      ...child,
      nickname: child.nickname.trim(),
      interests: [...child.interests],
      hobbies: [...child.hobbies],
      accessibilityDefaults: [...child.accessibilityDefaults],
      supportPreferences: [...child.supportPreferences],
    })),
    pairedChildIds: [...input.pairedChildIds],
    createdAt: input.now,
    updatedAt: input.now,
    origin: 'local_demo',
    capabilityTruth: 'local_prototype_not_authentication',
  };
  return parseLocalFamilyRecord(JSON.stringify(candidate));
}

export function localFamilyRecordToReceipt(
  record: LocalFamilyRecord,
): ParentOnboardingCompletionReceipt {
  return {
    receiptId: 'parent_onboarding_al_noor_r001_v1',
    completedAt: record.createdAt,
    destination: '/parent',
    householdId: record.householdId,
    familyName: record.familyName,
    appLanguage: record.appLanguage,
    childCount: record.children.length as 1 | 2,
    children: record.children.map((child) => ({
      profileId: child.id,
      nickname: child.nickname,
      avatarId: child.avatarId,
      ageBand: child.ageBand,
      preferredLanguage: child.preferredLanguage,
      accessLanguagePreference: toAccessLanguagePreference(child.preferredLanguage),
      gender: child.gender,
      interests: [...child.interests],
      hobbies: [...child.hobbies],
      accessibilityDefaults: [...child.accessibilityDefaults],
      supportPreferences: [...child.supportPreferences],
      personalizationEnabled: child.personalizationEnabled,
    })),
    origin: 'synthetic',
    capabilityTruth: 'local_prototype_not_authentication',
  };
}

export { LOCAL_FAMILY_STORAGE_KEY } from '../../models/localFamily';
