import type { DomainError, DomainResult, TaskCategoryId } from '../../models/familyGrowth';
import {
  SAVED_TASK_TEMPLATE_LIMIT,
  type SavedParentTaskTemplate,
  type SavedParentTaskTemplateInput,
} from '../../models/savedTaskTemplate';

const CATEGORY_IDS = new Set<TaskCategoryId>([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);
const INPUT_KEYS = new Set(['householdId', 'categoryId', 'title', 'positiveAction', 'recurrence']);
const RECORD_KEYS = new Set([...INPUT_KEYS, 'id', 'createdAt', 'updatedAt', 'origin']);
const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/u;

function invalid(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_INPUT',
    message,
    retryable: false,
    fallbackAvailable: true,
  };
  return { ok: false, error };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown): DomainResult<{ readonly ar: string; readonly en: string }> {
  if (!isPlainObject(value) || Object.keys(value).some((key) => key !== 'ar' && key !== 'en')) {
    return invalid('Saved wording must contain Arabic and English only');
  }
  const ar = typeof value.ar === 'string' ? value.ar.trim() : '';
  const en = typeof value.en === 'string' ? value.en.trim() : '';
  if (!ar || !en || ar.length > 180 || en.length > 180) {
    return invalid('Saved wording must be 1 to 180 characters in each language');
  }
  if (CONTROL_CHARACTER_PATTERN.test(ar) || CONTROL_CHARACTER_PATTERN.test(en)) {
    return invalid('Saved wording contains unsupported control characters');
  }
  return { ok: true, data: { ar, en } };
}

export function validateSavedTaskTemplateInput(
  value: unknown,
): DomainResult<SavedParentTaskTemplateInput> {
  if (!isPlainObject(value) || Object.keys(value).some((key) => !INPUT_KEYS.has(key))) {
    return invalid('Saved task template input contains unsupported fields');
  }
  const title = normalizeText(value.title);
  if (!title.ok) return title;
  const positiveAction = normalizeText(value.positiveAction);
  if (!positiveAction.ok) return positiveAction;
  if (value.householdId !== 'household_al_noor') return invalid('Unknown household scope');
  if (
    typeof value.categoryId !== 'string' ||
    !CATEGORY_IDS.has(value.categoryId as TaskCategoryId)
  ) {
    return invalid('Unknown task category');
  }
  if (value.recurrence !== 'once' && value.recurrence !== 'recurrent') {
    return invalid('Unknown recurrence preference');
  }
  return {
    ok: true,
    data: {
      householdId: value.householdId,
      categoryId: value.categoryId as TaskCategoryId,
      title: title.data,
      positiveAction: positiveAction.data,
      recurrence: value.recurrence,
    },
  };
}

export function parseSavedTaskTemplateCollection(
  raw: string,
): DomainResult<readonly SavedParentTaskTemplate[]> {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return invalid('Saved task template storage is not valid JSON');
  }
  if (!Array.isArray(value) || value.length > SAVED_TASK_TEMPLATE_LIMIT) {
    return invalid('Saved task template collection exceeds its limit');
  }
  const parsed: SavedParentTaskTemplate[] = [];
  for (const item of value) {
    if (!isPlainObject(item) || Object.keys(item).some((key) => !RECORD_KEYS.has(key))) {
      return invalid('Saved task template record contains unsupported fields');
    }
    const input = validateSavedTaskTemplateInput({
      householdId: item.householdId,
      categoryId: item.categoryId,
      title: item.title,
      positiveAction: item.positiveAction,
      recurrence: item.recurrence,
    });
    if (!input.ok) return input;
    if (
      typeof item.id !== 'string' ||
      !/^saved-task-[a-z0-9-]+$/u.test(item.id) ||
      item.origin !== 'parent_saved_local' ||
      typeof item.createdAt !== 'string' ||
      typeof item.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(item.createdAt)) ||
      !Number.isFinite(Date.parse(item.updatedAt))
    ) {
      return invalid('Saved task template metadata is invalid');
    }
    parsed.push({
      ...input.data,
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      origin: item.origin,
    });
  }
  return { ok: true, data: parsed };
}

export function savedTaskTemplateFingerprint(input: SavedParentTaskTemplateInput): string {
  return [
    input.householdId,
    input.categoryId,
    input.title.ar,
    input.title.en,
    input.positiveAction.ar,
    input.positiveAction.en,
  ]
    .map((value) => value.trim().toLocaleLowerCase())
    .join('|');
}
