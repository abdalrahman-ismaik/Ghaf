import type {
  CheckInRouteState,
  ConfirmationAttempt,
  DomainErrorCode,
  DomainResult,
  PraisePresentedPlan,
} from '../../models/familyGrowth';
import type { ServiceResult } from '../../services/interfaces';
import {
  hasDensePlainArrayShape,
  hasExactPlainDataKeys,
  isPlainDataRecord,
} from '../../utils/exactPlainData';

const DOMAIN_ERROR_CODES: ReadonlySet<DomainErrorCode> = new Set([
  'INVALID_INPUT',
  'NOT_FOUND',
  'INVALID_TRANSITION',
  'NOT_ASSIGNED_CHILD',
  'SAFETY_REJECTED',
  'PRIVACY_REJECTED',
  'INVALID_REWARD_PAIRING',
  'PREPARED_FIXTURE_UNAVAILABLE',
  'REMOTE_UNAVAILABLE',
  'TIMEOUT',
  'INVALID_RESPONSE',
]);

function invalidProviderResult(): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message: 'Provider result envelope is malformed',
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function clonePlainValue(value: unknown, stack: WeakSet<object>): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite boundary number');
    return value;
  }
  if (typeof value !== 'object' || stack.has(value)) {
    throw new Error('Provider boundary value is not acyclic plain data');
  }

  stack.add(value);
  if (Array.isArray(value)) {
    if (!hasDensePlainArrayShape(value)) {
      throw new Error('Provider boundary array is malformed');
    }
    const clone: unknown[] = [];
    for (let index = 0; index < value.length; index += 1) {
      clone[index] = clonePlainValue(value[index], stack);
    }
    stack.delete(value);
    return clone;
  }

  if (!isPlainDataRecord(value)) {
    throw new Error('Provider boundary object is not plain data');
  }
  const clone: Record<string, unknown> = Object.create(Object.getPrototypeOf(value)) as Record<
    string,
    unknown
  >;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (
      typeof key !== 'string' ||
      descriptor === undefined ||
      !descriptor.enumerable ||
      !('value' in descriptor)
    ) {
      throw new Error('Provider boundary object has a non-data property');
    }
    Object.defineProperty(clone, key, {
      value: clonePlainValue(descriptor.value, stack),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  stack.delete(value);
  return clone;
}

function cloneBoundaryInput(value: unknown): DomainResult<unknown> {
  try {
    return { ok: true, data: clonePlainValue(value, new WeakSet<object>()) };
  } catch {
    return invalidProviderResult();
  }
}

function hasValidFailureEnvelope(candidate: Record<string, unknown>): boolean {
  const error = candidate.error;
  return (
    candidate.ok === false &&
    hasExactPlainDataKeys(candidate, ['ok', 'error']) &&
    isPlainDataRecord(error) &&
    hasExactPlainDataKeys(error, ['code', 'message', 'retryable', 'fallbackAvailable']) &&
    typeof error.code === 'string' &&
    DOMAIN_ERROR_CODES.has(error.code as DomainErrorCode) &&
    typeof error.message === 'string' &&
    error.message.trim().length > 0 &&
    typeof error.retryable === 'boolean' &&
    typeof error.fallbackAvailable === 'boolean'
  );
}

function hasValidSuccessEnvelope(candidate: Record<string, unknown>): boolean {
  const meta = candidate.meta;
  return (
    candidate.ok === true &&
    hasExactPlainDataKeys(candidate, ['ok', 'data', 'meta']) &&
    isPlainDataRecord(candidate.data) &&
    isPlainDataRecord(meta) &&
    hasExactPlainDataKeys(meta, ['origin', 'fallbackUsed']) &&
    meta.origin === 'synthetic' &&
    meta.fallbackUsed === false
  );
}

export function validateSyntheticProviderResult<T extends object>(
  value: unknown,
): DomainResult<ServiceResult<T>> {
  const isolated = cloneBoundaryInput(value);
  if (!isolated.ok || !isPlainDataRecord(isolated.data)) return invalidProviderResult();

  const candidate = isolated.data;
  if (!hasValidFailureEnvelope(candidate) && !hasValidSuccessEnvelope(candidate)) {
    return invalidProviderResult();
  }
  return { ok: true, data: candidate as unknown as ServiceResult<T> };
}

export function validateCheckInRouteProviderResult(
  value: unknown,
): DomainResult<ServiceResult<CheckInRouteState>> {
  return validateSyntheticProviderResult<CheckInRouteState>(value);
}

export function validateConfirmationProviderResult(
  value: unknown,
): DomainResult<ServiceResult<ConfirmationAttempt>> {
  return validateSyntheticProviderResult<ConfirmationAttempt>(value);
}

export function validatePraisePresentationProviderResult(
  value: unknown,
): DomainResult<ServiceResult<PraisePresentedPlan>> {
  return validateSyntheticProviderResult<PraisePresentedPlan>(value);
}
