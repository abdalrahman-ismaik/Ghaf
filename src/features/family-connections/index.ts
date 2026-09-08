import type { DomainError, DomainResult } from '../../models/familyGrowth';
import {
  FAMILY_RELATIVE_IDS,
  type FamilyConnectionDirectory,
  type FamilyConnectionIdeaKind,
  type FamilyConnectionPlan,
  type FamilyRelativeId,
  type FamilyRelationship,
  type NamedFamilyRelative,
} from '../../models/familyConnections';

const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u001f\u007f-\u009f\u200e-\u200f\u202a-\u202e\u2066-\u2069]/u;
const DIRECTORY_KEYS = ['primaryGuardianName', 'secondaryGuardianName', 'relatives'] as const;
const RELATIVE_KEYS = ['id', 'displayName', 'relationship', 'rhythm'] as const;
const RELATIONSHIPS = new Set(['grandmother', 'grandfather', 'aunt', 'uncle']);
const RHYTHMS = new Set(['weekly', 'monthly', 'every_three_months', 'no_schedule']);

const GRANDPARENT_IDEAS: readonly FamilyConnectionIdeaKind[] = [
  'visit_or_call',
  'family_story',
  'safe_help',
  'thank_you_message',
  'phone_free_moment',
];
const AUNT_UNCLE_IDEAS: readonly FamilyConnectionIdeaKind[] = [
  'visit_or_call',
  'safe_help',
  'thank_you_message',
  'phone_free_moment',
  'family_story',
];

function failure(message: string): DomainResult<never> {
  const error: DomainError = {
    code: 'INVALID_INPUT',
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

function isDraftName(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && !CONTROL_CHARACTER_PATTERN.test(value);
}

function isCompleteName(value: unknown, optional = false): value is string {
  if (!isDraftName(value)) return false;
  const trimmed = value.trim();
  return optional && trimmed.length === 0 ? true : trimmed.length >= 2;
}

function isRelative(value: unknown): value is NamedFamilyRelative {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, RELATIVE_KEYS) &&
    typeof value.id === 'string' &&
    FAMILY_RELATIVE_IDS.includes(value.id as FamilyRelativeId) &&
    isCompleteName(value.displayName) &&
    typeof value.relationship === 'string' &&
    RELATIONSHIPS.has(value.relationship) &&
    typeof value.rhythm === 'string' &&
    RHYTHMS.has(value.rhythm)
  );
}

export function cloneFamilyConnectionDirectory(
  directory: FamilyConnectionDirectory,
): FamilyConnectionDirectory {
  return {
    primaryGuardianName: directory.primaryGuardianName,
    secondaryGuardianName: directory.secondaryGuardianName,
    relatives: directory.relatives.map((relative) => ({ ...relative })),
  };
}

export function createInitialFamilyConnectionDirectory(): FamilyConnectionDirectory {
  return {
    primaryGuardianName: 'راشد',
    secondaryGuardianName: '',
    relatives: [],
  };
}

export function validateFamilyConnectionDraft(
  value: unknown,
): DomainResult<FamilyConnectionDirectory> {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, DIRECTORY_KEYS) ||
    !isDraftName(value.primaryGuardianName) ||
    !isDraftName(value.secondaryGuardianName) ||
    !Array.isArray(value.relatives) ||
    value.relatives.length > FAMILY_RELATIVE_IDS.length ||
    !value.relatives.every(isRelative) ||
    new Set(value.relatives.map((relative) => relative.id)).size !== value.relatives.length
  ) {
    return failure('The private family connection directory is invalid');
  }
  return {
    ok: true,
    data: cloneFamilyConnectionDirectory(value as unknown as FamilyConnectionDirectory),
  };
}

export function validateCompleteFamilyConnectionDirectory(
  value: unknown,
): DomainResult<FamilyConnectionDirectory> {
  const draft = validateFamilyConnectionDraft(value);
  if (
    !draft.ok ||
    !isCompleteName(draft.data.primaryGuardianName) ||
    !isCompleteName(draft.data.secondaryGuardianName, true)
  ) {
    return failure('Complete the required private family display names');
  }
  return {
    ok: true,
    data: {
      primaryGuardianName: draft.data.primaryGuardianName.trim(),
      secondaryGuardianName: draft.data.secondaryGuardianName.trim(),
      relatives: draft.data.relatives.map((relative) => ({
        ...relative,
        displayName: relative.displayName.trim(),
      })),
    },
  };
}

export function nextFamilyRelativeId(
  relatives: readonly NamedFamilyRelative[],
): FamilyRelativeId | null {
  return (
    FAMILY_RELATIVE_IDS.find((id) => !relatives.some((relative) => relative.id === id)) ?? null
  );
}

function ideasForRelationship(
  relationship: FamilyRelationship,
): readonly FamilyConnectionIdeaKind[] {
  return relationship === 'grandmother' || relationship === 'grandfather'
    ? GRANDPARENT_IDEAS
    : AUNT_UNCLE_IDEAS;
}

export function createFamilyConnectionPlan(value: unknown): DomainResult<FamilyConnectionPlan> {
  const directory = validateCompleteFamilyConnectionDirectory(value);
  if (!directory.ok) return directory;

  return {
    ok: true,
    data: {
      guardianDisplayNames: [
        directory.data.primaryGuardianName,
        ...(directory.data.secondaryGuardianName ? [directory.data.secondaryGuardianName] : []),
      ],
      entries: directory.data.relatives.map((relative) => {
        const slotIndex = FAMILY_RELATIVE_IDS.indexOf(relative.id);
        const ideas = ideasForRelationship(relative.relationship);
        return {
          relativeId: relative.id,
          displayName: relative.displayName,
          relationship: relative.relationship,
          rhythm: relative.rhythm,
          ideaKind: ideas[slotIndex % ideas.length]!,
          remoteAlternativeId: 'call_or_message',
          recognitionMode: 'recognition_only',
          requiresParentReview: true,
          childMayChooseOrSkip: true,
          schedulingAuthority: 'none',
          progressEffects: 'none',
          origin: 'prepared_local',
        };
      }),
      origin: 'prepared_local',
      localOnly: true,
    },
  };
}
