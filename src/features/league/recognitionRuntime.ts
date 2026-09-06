import type {
  CompletionMode,
  DomainResult,
  RecognitionReceipt,
  SyntheticChildId,
  TaskJourney,
} from '../../models/familyGrowth';
import type { ChallengeLeafCandidate } from '../../models/familyLeague';

import { evaluateChallengeLeafEligibility, SYNTHETIC_LEAGUE_PARTICIPANTS } from './index';

export const PRIVATE_LEAGUE_WEEK_KEY = '2026-W36' as const;
export const SALEM_RECYCLING_CHALLENGE_LEAF_ID = 'leaf_child_salem_5' as const;
export const PRIVATE_LEAGUE_RECOGNITION_SCHEMA_VERSION =
  'r003.private-league-recognition.v1' as const;

export interface PrivateLeagueRecognitionReceipt {
  readonly leagueReceiptId: string;
  readonly profileId: 'child_salem';
  readonly profileEpochId: string;
  readonly weekKey: typeof PRIVATE_LEAGUE_WEEK_KEY;
  readonly leafId: typeof SALEM_RECYCLING_CHALLENGE_LEAF_ID;
  readonly recognitionKey: string;
  readonly committedAt: string;
  readonly completionMode: CompletionMode;
  readonly accessibilityAdapted: false;
  readonly confirmedLeavesBefore: 4;
  readonly confirmedLeavesAfter: 5;
  readonly leafDelta: 1;
  readonly status: 'committed';
  readonly privacy: 'private_family_league';
}

export interface PrivateLeagueRecognitionRuntime {
  readonly schemaVersion: typeof PRIVATE_LEAGUE_RECOGNITION_SCHEMA_VERSION;
  readonly profileId: 'child_salem';
  readonly profileEpochId: string;
  readonly weekKey: typeof PRIVATE_LEAGUE_WEEK_KEY;
  readonly nominatedLeaf: ChallengeLeafCandidate;
  readonly receiptsByRecognitionKey: Readonly<Record<string, PrivateLeagueRecognitionReceipt>>;
}

export interface PrivateLeagueRecognitionApplication {
  readonly disposition: 'applied' | 'already_confirmed';
  readonly runtime: PrivateLeagueRecognitionRuntime;
  readonly receipt: PrivateLeagueRecognitionReceipt;
}

export interface ApplyRecognitionToPrivateLeagueInput {
  readonly runtime: PrivateLeagueRecognitionRuntime;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
  readonly recognitionLedger: Readonly<Record<string, RecognitionReceipt>>;
}

const SAFE_PROTECTED_CONTENT = Object.freeze({
  prayer: false,
  kinship: false,
  affection: false,
  emotionalDisclosure: false,
  relationshipCloseness: false,
  foodConsumption: false,
  privateWellbeing: false,
  hygiene: false,
  disabilityRelatedRoutine: false,
});

function failure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: true,
    },
  };
}

function immutable<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) immutable(nested);
  return Object.freeze(value);
}

function hasExactKeys(value: object, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validProfileEpochId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
}

function createNominatedLeaf(): ChallengeLeafCandidate {
  return {
    id: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
    participantId: 'child_salem',
    ageBands: ['9_11'],
    approvedTaskRef: { taskId: 'task_recycling_p0_v1', taskVersion: 1 },
    categoryId: 'green_impact',
    visibilityScope: 'household',
    parentApproved: true,
    accessibilityAdaptable: true,
    protectedContent: SAFE_PROTECTED_CONTENT,
  };
}

function isValidPhaseReview(value: unknown, journey: TaskJourney): boolean {
  return (
    value === null ||
    (isRecord(value) &&
      hasExactKeys(value, [
        'taskId',
        'confirmedAcquisitionCount',
        'options',
        'selected',
        'appliesTo',
        'reversibleByParent',
      ]) &&
      value.taskId === journey.task.id &&
      value.confirmedAcquisitionCount === 3 &&
      Array.isArray(value.options) &&
      value.options.length === 2 &&
      value.options[0] === 'keep_acquisition' &&
      value.options[1] === 'move_future_to_maintenance' &&
      value.selected === null &&
      value.appliesTo === 'future_completions_only' &&
      value.reversibleByParent === true)
  );
}

function isCanonicalNomination(value: unknown): value is ChallengeLeafCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'id',
      'participantId',
      'ageBands',
      'approvedTaskRef',
      'categoryId',
      'visibilityScope',
      'parentApproved',
      'accessibilityAdaptable',
      'protectedContent',
    ]) ||
    value.id !== SALEM_RECYCLING_CHALLENGE_LEAF_ID ||
    value.participantId !== 'child_salem' ||
    !Array.isArray(value.ageBands) ||
    value.ageBands.length !== 1 ||
    value.ageBands[0] !== '9_11' ||
    !isRecord(value.approvedTaskRef) ||
    !hasExactKeys(value.approvedTaskRef, ['taskId', 'taskVersion']) ||
    value.approvedTaskRef.taskId !== 'task_recycling_p0_v1' ||
    value.approvedTaskRef.taskVersion !== 1 ||
    value.categoryId !== 'green_impact' ||
    value.visibilityScope !== 'household' ||
    value.parentApproved !== true ||
    value.accessibilityAdaptable !== true ||
    !isRecord(value.protectedContent) ||
    !hasExactKeys(value.protectedContent, [
      'prayer',
      'kinship',
      'affection',
      'emotionalDisclosure',
      'relationshipCloseness',
      'foodConsumption',
      'privateWellbeing',
      'hygiene',
      'disabilityRelatedRoutine',
    ]) ||
    Object.values(value.protectedContent).some((entry) => entry !== false)
  ) {
    return false;
  }
  return evaluateChallengeLeafEligibility(
    value as unknown as ChallengeLeafCandidate,
    SYNTHETIC_LEAGUE_PARTICIPANTS[0],
  ).eligible;
}

function isRuntimeEnvelope(value: unknown): value is PrivateLeagueRecognitionRuntime {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      'schemaVersion',
      'profileId',
      'profileEpochId',
      'weekKey',
      'nominatedLeaf',
      'receiptsByRecognitionKey',
    ]) &&
    value.schemaVersion === PRIVATE_LEAGUE_RECOGNITION_SCHEMA_VERSION &&
    value.profileId === 'child_salem' &&
    validProfileEpochId(value.profileEpochId) &&
    value.weekKey === PRIVATE_LEAGUE_WEEK_KEY &&
    isCanonicalNomination(value.nominatedLeaf) &&
    isRecord(value.receiptsByRecognitionKey)
  );
}

export function createPrivateLeagueRecognitionRuntime(input: {
  readonly profileEpochId: string;
}): PrivateLeagueRecognitionRuntime {
  if (!validProfileEpochId(input.profileEpochId)) {
    throw new Error('Private League reset requires a valid Salem profile epoch');
  }
  const nominatedLeaf = createNominatedLeaf();
  if (!isCanonicalNomination(nominatedLeaf)) {
    throw new Error('Private League canonical nomination is not eligible');
  }
  return immutable({
    schemaVersion: PRIVATE_LEAGUE_RECOGNITION_SCHEMA_VERSION,
    profileId: 'child_salem',
    profileEpochId: input.profileEpochId,
    weekKey: PRIVATE_LEAGUE_WEEK_KEY,
    nominatedLeaf,
    receiptsByRecognitionKey: {},
  });
}

function isCanonicalCoreRecognitionReceipt(
  value: unknown,
  journey: TaskJourney,
): value is RecognitionReceipt {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'recognitionKey',
      'checkInId',
      'seedTransaction',
      'landscapeGrowth',
      'canopyContribution',
      'circleEvent',
      'phaseReview',
    ]) ||
    !journey.submission ||
    !journey.checkIn
  ) {
    return false;
  }
  const recognitionKey = `recognition:${journey.submission.id}`;
  const seed = value.seedTransaction;
  const growth = value.landscapeGrowth;
  const canopy = value.canopyContribution;
  const circle = value.circleEvent;
  return (
    value.recognitionKey === recognitionKey &&
    value.checkInId === journey.checkIn.id &&
    isValidPhaseReview(value.phaseReview, journey) &&
    isRecord(seed) &&
    hasExactKeys(seed, [
      'id',
      'recognitionKey',
      'childId',
      'amount',
      'balanceBefore',
      'balanceAfter',
      'meaning',
    ]) &&
    typeof seed.id === 'string' &&
    seed.id.length > 0 &&
    seed.recognitionKey === recognitionKey &&
    seed.childId === 'child_salem' &&
    seed.amount === 12 &&
    seed.balanceBefore === 48 &&
    seed.balanceAfter === 60 &&
    seed.meaning === 'symbolic_nonfinancial' &&
    isRecord(growth) &&
    hasExactKeys(growth, [
      'landscapeId',
      'seedsBefore',
      'seedsAfter',
      'stageBefore',
      'stageAfter',
      'crossedThreshold',
      'symbolicOnly',
    ]) &&
    growth.landscapeId === 'mangrove' &&
    growth.seedsBefore === 48 &&
    growth.seedsAfter === 60 &&
    growth.stageBefore === 'shoot' &&
    growth.stageAfter === 'sapling' &&
    growth.crossedThreshold === 60 &&
    growth.symbolicOnly === true &&
    isRecord(canopy) &&
    hasExactKeys(canopy, ['actionKind', 'leafDelta', 'origin']) &&
    canopy.actionKind === 'eligible_household_acquisition' &&
    canopy.leafDelta === 1 &&
    canopy.origin === 'synthetic' &&
    isRecord(circle) &&
    hasExactKeys(circle, ['actionKind', 'actionDelta', 'sourceScope', 'origin']) &&
    circle.actionKind === 'eligible_green_action' &&
    circle.actionDelta === 1 &&
    circle.sourceScope === 'household' &&
    circle.origin === 'synthetic_local'
  );
}

function isCanonicalRecognizedJourney(input: ApplyRecognitionToPrivateLeagueInput): boolean {
  const { journey, profileId } = input;
  const { task, assignment, submission, checkIn } = journey;
  return (
    profileId === 'child_salem' &&
    journey.lifecycle === 'recognized' &&
    task.id === 'task_recycling_p0_v1' &&
    task.version === 1 &&
    task.templateId === 'task_recycling_p0_v1' &&
    task.targetChildId === profileId &&
    task.content.categoryId === 'green_impact' &&
    task.content.landscapeId === 'mangrove' &&
    task.content.recognitionMode === 'standard' &&
    task.content.routinePhase === 'acquisition' &&
    task.content.displayedSeedAward === 12 &&
    task.content.visibilityScope === 'household' &&
    task.content.circleEligible === true &&
    assignment !== null &&
    assignment.taskId === task.id &&
    assignment.taskVersion === task.version &&
    assignment.childId === profileId &&
    assignment.approvedByParent === true &&
    submission !== null &&
    submission.assignmentId === assignment.id &&
    submission.taskVersion === task.version &&
    submission.definitionAcknowledged === true &&
    (submission.completionMode === 'independent' ||
      submission.completionMode === 'permitted_help') &&
    checkIn !== null &&
    checkIn.submissionId === submission.id &&
    checkIn.decision === 'confirm' &&
    checkIn.praise !== null &&
    checkIn.praisePresentedAt !== null &&
    checkIn.confirmationPresentation === 'recognition_applied' &&
    checkIn.recognitionKey === `recognition:${submission.id}`
  );
}

function sameReceipt(left: RecognitionReceipt, right: RecognitionReceipt): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCommittedPrivateLeagueReceipt(
  value: unknown,
  runtime: PrivateLeagueRecognitionRuntime,
  recognitionKey: string,
  submissionId: string,
  completionMode: CompletionMode,
  committedAt: string,
): value is PrivateLeagueRecognitionReceipt {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      'leagueReceiptId',
      'profileId',
      'profileEpochId',
      'weekKey',
      'leafId',
      'recognitionKey',
      'committedAt',
      'completionMode',
      'accessibilityAdapted',
      'confirmedLeavesBefore',
      'confirmedLeavesAfter',
      'leafDelta',
      'status',
      'privacy',
    ]) &&
    value.leagueReceiptId === `league-confirmation:${runtime.profileEpochId}:${submissionId}` &&
    value.profileId === runtime.profileId &&
    value.profileEpochId === runtime.profileEpochId &&
    value.weekKey === runtime.weekKey &&
    value.leafId === SALEM_RECYCLING_CHALLENGE_LEAF_ID &&
    value.recognitionKey === recognitionKey &&
    value.committedAt === committedAt &&
    value.completionMode === completionMode &&
    value.accessibilityAdapted === false &&
    value.confirmedLeavesBefore === 4 &&
    value.confirmedLeavesAfter === 5 &&
    value.leafDelta === 1 &&
    value.status === 'committed' &&
    value.privacy === 'private_family_league'
  );
}

export function selectCommittedPrivateLeagueReceipt(
  runtime: PrivateLeagueRecognitionRuntime,
): DomainResult<PrivateLeagueRecognitionReceipt | null> {
  if (!isRuntimeEnvelope(runtime)) {
    return failure('The private League runtime envelope is invalid');
  }
  const entries = Object.entries(runtime.receiptsByRecognitionKey);
  if (entries.length === 0) return { ok: true, data: null };
  if (entries.length !== 1) {
    return failure('The private League runtime accepts one canonical confirmation only');
  }
  const [recognitionKey, receipt] = entries[0]!;
  if (!recognitionKey.startsWith('recognition:')) {
    return failure('The private League recognition key is invalid');
  }
  const submissionId = recognitionKey.slice('recognition:'.length);
  if (
    submissionId.length === 0 ||
    !isRecord(receipt) ||
    typeof receipt.committedAt !== 'string' ||
    receipt.committedAt.length === 0 ||
    receipt.committedAt.trim() !== receipt.committedAt ||
    (receipt.completionMode !== 'independent' && receipt.completionMode !== 'permitted_help') ||
    !isCommittedPrivateLeagueReceipt(
      receipt,
      runtime,
      recognitionKey,
      submissionId,
      receipt.completionMode,
      receipt.committedAt,
    )
  ) {
    return failure('The private League committed receipt is invalid');
  }
  return { ok: true, data: receipt };
}

export function applyRecognitionToPrivateLeague(
  input: ApplyRecognitionToPrivateLeagueInput,
): DomainResult<PrivateLeagueRecognitionApplication> {
  if (
    !isRuntimeEnvelope(input.runtime) ||
    input.runtime.profileId !== input.profileId ||
    input.runtime.profileEpochId !== input.profileEpochId
  ) {
    return failure('The private League runtime belongs to another profile or reset epoch');
  }
  if (!isCanonicalRecognizedJourney(input)) {
    return failure('Only the canonical recognized Salem journey can confirm this Challenge Leaf');
  }
  const submission = input.journey.submission;
  const checkIn = input.journey.checkIn;
  if (!submission || !checkIn?.recognitionKey || !checkIn.praisePresentedAt) {
    return failure('The recognized journey is incomplete');
  }
  const recognitionKey = checkIn.recognitionKey;
  if (!isCanonicalCoreRecognitionReceipt(input.receipt, input.journey)) {
    return failure('The recognition receipt is malformed or does not match the journey');
  }
  const committedReceipt = input.recognitionLedger[recognitionKey];
  if (
    !committedReceipt ||
    !isCanonicalCoreRecognitionReceipt(committedReceipt, input.journey) ||
    !sameReceipt(committedReceipt, input.receipt)
  ) {
    return failure('The recognition receipt is not committed in the canonical ledger');
  }

  const receipts = Object.entries(input.runtime.receiptsByRecognitionKey);
  if (receipts.length > 0) {
    if (receipts.length !== 1 || receipts[0]![0] !== recognitionKey) {
      return failure('The private League receipt ledger has conflicting confirmation evidence');
    }
    const existing = receipts[0]![1];
    if (
      !isCommittedPrivateLeagueReceipt(
        existing,
        input.runtime,
        recognitionKey,
        submission.id,
        submission.completionMode,
        checkIn.praisePresentedAt,
      )
    ) {
      return failure('The private League receipt ledger is inconsistent');
    }
    return {
      ok: true,
      data: immutable({
        disposition: 'already_confirmed',
        runtime: input.runtime,
        receipt: existing,
      }),
    };
  }

  const receipt: PrivateLeagueRecognitionReceipt = immutable({
    leagueReceiptId: `league-confirmation:${input.profileEpochId}:${submission.id}`,
    profileId: 'child_salem',
    profileEpochId: input.profileEpochId,
    weekKey: PRIVATE_LEAGUE_WEEK_KEY,
    leafId: SALEM_RECYCLING_CHALLENGE_LEAF_ID,
    recognitionKey,
    committedAt: checkIn.praisePresentedAt,
    completionMode: submission.completionMode,
    accessibilityAdapted: false,
    confirmedLeavesBefore: 4,
    confirmedLeavesAfter: 5,
    leafDelta: 1,
    status: 'committed',
    privacy: 'private_family_league',
  });
  const runtime: PrivateLeagueRecognitionRuntime = immutable({
    ...input.runtime,
    receiptsByRecognitionKey: { [recognitionKey]: receipt },
  });
  return {
    ok: true,
    data: immutable({ disposition: 'applied', runtime, receipt }),
  };
}
