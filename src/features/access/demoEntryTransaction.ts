import type { DomainErrorCode } from '../../models/familyGrowth';
import type { ServiceResult } from '../../services/interfaces';
import { hasOnlyPlainDataProperties, isPlainDataRecord } from '../../utils/exactPlainData';

type TransactionFailure = Extract<ServiceResult<never>, { readonly ok: false }>;

interface DemoEntryTransactionScope {
  readonly participants: Set<object>;
  readonly rollbacks: (() => void)[];
  failure: TransactionFailure | null;
}

let activeScope: DemoEntryTransactionScope | null = null;

function failure(code: DomainErrorCode, message: string): TransactionFailure {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function isDemoEntryTransactionResult<T>(value: unknown): value is ServiceResult<T> {
  if (!isPlainDataRecord(value) || !hasOnlyPlainDataProperties(value) || 'then' in value) {
    return false;
  }
  if (value.ok === true) {
    const meta = value.meta;
    return (
      Object.hasOwn(value, 'data') &&
      isPlainDataRecord(meta) &&
      hasOnlyPlainDataProperties(meta) &&
      ['synthetic', 'prepared', 'simulated', 'live'].includes(meta.origin as string) &&
      typeof meta.fallbackUsed === 'boolean' &&
      (!Object.hasOwn(meta, 'fixtureId') || typeof meta.fixtureId === 'string')
    );
  }
  const error = value.error;
  return (
    value.ok === false &&
    isPlainDataRecord(error) &&
    hasOnlyPlainDataProperties(error) &&
    [
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
    ].includes(error.code as string) &&
    typeof error.message === 'string' &&
    typeof error.retryable === 'boolean' &&
    typeof error.fallbackAvailable === 'boolean'
  );
}

// Only synchronous wrapper calls join this scope; callbacks must not schedule later work.
// Reviewed rollback closures must restore private state without fallible service calls.
export function runDemoEntryTransaction<T>(
  participant: object,
  captureRollback: () => () => void,
  operation: () => ServiceResult<T>,
): ServiceResult<T> {
  const outermost = activeScope === null;
  const scope: DemoEntryTransactionScope = activeScope ?? {
    participants: new Set(),
    rollbacks: [],
    failure: null,
  };
  if (scope.failure) return scope.failure;
  if (scope.participants.has(participant)) {
    scope.failure = failure(
      'INVALID_TRANSITION',
      'Demo entry cannot reenter an active transaction',
    );
    return scope.failure;
  }
  if (outermost) activeScope = scope;

  let result: ServiceResult<T>;
  try {
    scope.participants.add(participant);
    scope.rollbacks.push(captureRollback());
    result = scope.failure ?? operation();
    if (!isDemoEntryTransactionResult<T>(result)) {
      scope.failure ??= failure(
        'INVALID_RESPONSE',
        'Demo entry requires a synchronous service result',
      );
    } else if (!result.ok) {
      scope.failure ??= result;
    }
  } catch {
    result = failure('INVALID_RESPONSE', 'Demo entry transaction could not be completed');
    scope.failure ??= result;
  } finally {
    if (outermost) {
      try {
        if (scope.failure) {
          // Keep every private snapshot until all nested participants have finished.
          for (let index = scope.rollbacks.length - 1; index >= 0; index -= 1) {
            try {
              scope.rollbacks[index]!();
            } catch {
              scope.failure = failure(
                'INVALID_RESPONSE',
                'Demo entry rollback could not be completed',
              );
            }
          }
        }
      } finally {
        activeScope = null;
      }
    }
  }
  return scope.failure ?? result;
}
