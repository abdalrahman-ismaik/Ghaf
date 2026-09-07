import {
  DEVICE_ACCESS_SCHEMA_VERSION,
  type ChildDeviceAffinity,
  type DeviceAffinityRecord,
  type ParentDeviceAffinity,
} from '../../models/deviceAccess';
import type { DomainError, DomainResult, SyntheticChildId } from '../../models/familyGrowth';
import type { LocalFamilyRecord } from '../../models/localFamily';

const RECORD_KEYS = [
  'schemaVersion',
  'principal',
  'familyCreatedAt',
  'updatedAt',
  'origin',
  'capabilityTruth',
] as const;
const PARENT_KEYS = ['role', 'parentId', 'householdId'] as const;
const CHILD_KEYS = ['role', 'childId', 'householdId'] as const;

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

function isIsoTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
}

function isParentPrincipal(value: unknown): value is ParentDeviceAffinity {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, PARENT_KEYS) &&
    value.role === 'parent' &&
    value.parentId === 'parent_al_noor' &&
    value.householdId === 'household_al_noor'
  );
}

function isChildPrincipal(value: unknown): value is ChildDeviceAffinity {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, CHILD_KEYS) &&
    value.role === 'child' &&
    (value.childId === 'child_salem' || value.childId === 'child_alya') &&
    value.householdId === 'household_al_noor'
  );
}

function cloneRecord(record: DeviceAffinityRecord): DeviceAffinityRecord {
  return { ...record, principal: { ...record.principal } };
}

export function parseDeviceAffinityRecord(raw: string): DomainResult<DeviceAffinityRecord> {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return failure('The remembered device access record is not valid JSON');
  }
  if (!isRecord(value) || !hasOnlyKeys(value, RECORD_KEYS)) {
    return failure('The remembered device access record shape is invalid');
  }
  if (
    value.schemaVersion !== DEVICE_ACCESS_SCHEMA_VERSION ||
    (!isParentPrincipal(value.principal) && !isChildPrincipal(value.principal)) ||
    !isIsoTime(value.familyCreatedAt) ||
    !isIsoTime(value.updatedAt) ||
    Date.parse(value.updatedAt) < Date.parse(value.familyCreatedAt) ||
    value.origin !== 'local_demo' ||
    value.capabilityTruth !== 'local_prototype_not_authentication'
  ) {
    return failure('The remembered device access record values are invalid');
  }
  return { ok: true, data: cloneRecord(value as unknown as DeviceAffinityRecord) };
}

export function createParentDeviceAffinity(input: {
  readonly family: LocalFamilyRecord;
  readonly now: string;
}): DomainResult<DeviceAffinityRecord> {
  return parseDeviceAffinityRecord(
    JSON.stringify({
      schemaVersion: DEVICE_ACCESS_SCHEMA_VERSION,
      principal: {
        role: 'parent',
        parentId: input.family.parent.id,
        householdId: input.family.householdId,
      },
      familyCreatedAt: input.family.createdAt,
      updatedAt: input.now,
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    }),
  );
}

export function createChildDeviceAffinity(input: {
  readonly family: LocalFamilyRecord;
  readonly childId: SyntheticChildId;
  readonly now: string;
}): DomainResult<DeviceAffinityRecord> {
  if (
    !input.family.children.some((child) => child.id === input.childId) ||
    !input.family.pairedChildIds.includes(input.childId)
  ) {
    return failure('Only a configured and paired Child can own this app installation');
  }
  return parseDeviceAffinityRecord(
    JSON.stringify({
      schemaVersion: DEVICE_ACCESS_SCHEMA_VERSION,
      principal: {
        role: 'child',
        childId: input.childId,
        householdId: input.family.householdId,
      },
      familyCreatedAt: input.family.createdAt,
      updatedAt: input.now,
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    }),
  );
}

export function deviceAffinityMatchesFamily(
  record: DeviceAffinityRecord,
  family: LocalFamilyRecord,
): boolean {
  if (
    record.familyCreatedAt !== family.createdAt ||
    record.principal.householdId !== family.householdId
  ) {
    return false;
  }
  if (record.principal.role === 'parent') {
    return record.principal.parentId === family.parent.id;
  }
  const childId = record.principal.childId;
  return (
    family.children.some((child) => child.id === childId) &&
    family.pairedChildIds.includes(childId)
  );
}
