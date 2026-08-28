import type {
  CompletionMode,
  DomainResult,
  FixedSeedAward,
  RecognitionConsequenceKind,
  RecognitionMode,
  RecognitionReceipt,
  Recurrence,
  RoutinePhase,
} from '../../models/familyGrowth';

export interface RecognitionPolicyInput {
  readonly submissionId: string;
  readonly recognitionMode: RecognitionMode;
  readonly routinePhase: RoutinePhase;
  readonly recurrence: Recurrence;
  readonly displayedSeedAward: number | null;
  readonly completionMode: CompletionMode;
  readonly confirmedAcquisitionCount: number;
  readonly existingReceipt: RecognitionReceipt | null;
}

export interface RecognitionPolicyPhaseReview {
  readonly confirmedAcquisitionCount: 3;
  readonly options: readonly ['keep_acquisition', 'move_future_to_maintenance'];
  readonly selected: null;
  readonly appliesTo: 'future_completions_only';
  readonly reversibleByParent: true;
}

export type RecognitionPolicyResult =
  | {
      readonly disposition: 'already_confirmed';
      readonly receipt: RecognitionReceipt;
    }
  | {
      readonly disposition: 'new';
      readonly seedAmount: FixedSeedAward | null;
      readonly persistentGrowth: boolean;
      readonly consequenceKind: RecognitionConsequenceKind;
      readonly phaseReview: RecognitionPolicyPhaseReview | null;
    };

export interface RecognitionPolicyDependencies {
  readonly projectionPlanner?: () => unknown;
}

const FIXED_AWARDS = new Set<number>([4, 6, 8, 12, 15]);

function failure(
  code: 'INVALID_INPUT' | 'INVALID_REWARD_PAIRING' | 'INVALID_RESPONSE',
  message: string,
): DomainResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export function recognitionKeyForSubmission(submissionId: string): string {
  return `recognition:${submissionId}`;
}

function consequenceKindFor(
  recognitionMode: RecognitionMode,
  routinePhase: RoutinePhase,
): RecognitionConsequenceKind {
  if (recognitionMode === 'recognition_only') return 'recognition_only';
  return routinePhase === 'maintenance' ? 'maintenance_activity' : 'rewarded_acquisition';
}

export function evaluateRecognitionPolicy(
  input: RecognitionPolicyInput,
  dependencies: RecognitionPolicyDependencies = {},
): DomainResult<RecognitionPolicyResult> {
  const recognitionKey = recognitionKeyForSubmission(input.submissionId);

  // Ledger lookup is intentionally first. Duplicate attempts never re-enter validation/projection.
  if (input.existingReceipt) {
    if (input.existingReceipt.recognitionKey !== recognitionKey) {
      return failure(
        'INVALID_RESPONSE',
        'The stored recognition receipt does not match submission',
      );
    }
    return {
      ok: true,
      data: { disposition: 'already_confirmed', receipt: input.existingReceipt },
    };
  }

  const validPair =
    (input.recognitionMode === 'standard' &&
      (input.routinePhase === 'acquisition' || input.routinePhase === 'maintenance')) ||
    (input.recognitionMode === 'fade_first' &&
      (input.routinePhase === 'acquisition' || input.routinePhase === 'maintenance')) ||
    (input.recognitionMode === 'recognition_only' && input.routinePhase === 'not_applicable');

  if (!validPair) {
    return failure('INVALID_REWARD_PAIRING', 'Recognition mode and routine phase are incompatible');
  }

  if (input.recognitionMode === 'standard' && input.recurrence !== 'once') {
    return failure('INVALID_REWARD_PAIRING', 'Standard work must be finite or recurrence-once');
  }

  const acquisition =
    input.recognitionMode !== 'recognition_only' && input.routinePhase === 'acquisition';
  if (acquisition) {
    if (input.displayedSeedAward === null || !FIXED_AWARDS.has(input.displayedSeedAward)) {
      return failure('INVALID_INPUT', 'Acquisition requires a fixed 4, 6, 8, 12, or 15 Seed award');
    }
  } else if (input.displayedSeedAward !== null) {
    return failure(
      'INVALID_REWARD_PAIRING',
      'Maintenance and recognition-only work cannot display a Seed award',
    );
  }

  if (!Number.isInteger(input.confirmedAcquisitionCount) || input.confirmedAcquisitionCount < 0) {
    return failure('INVALID_INPUT', 'Confirmed acquisition count must be a non-negative integer');
  }

  dependencies.projectionPlanner?.();

  const phaseReview: RecognitionPolicyPhaseReview | null =
    input.recognitionMode === 'fade_first' &&
    input.routinePhase === 'acquisition' &&
    input.recurrence === 'recurrent' &&
    input.confirmedAcquisitionCount === 3
      ? {
          confirmedAcquisitionCount: 3,
          options: ['keep_acquisition', 'move_future_to_maintenance'],
          selected: null,
          appliesTo: 'future_completions_only',
          reversibleByParent: true,
        }
      : null;

  return {
    ok: true,
    data: {
      disposition: 'new',
      seedAmount: acquisition ? (input.displayedSeedAward as FixedSeedAward) : null,
      persistentGrowth: acquisition,
      consequenceKind: consequenceKindFor(input.recognitionMode, input.routinePhase),
      phaseReview,
    },
  };
}
