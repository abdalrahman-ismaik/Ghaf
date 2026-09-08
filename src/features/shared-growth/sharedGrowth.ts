import {
  SHARED_GROWTH_SCHEMA_VERSION,
  type AnonymousSharedGrowthSignal,
  type ApplySharedGrowthParticipationActionInput,
  type CommunityParticipationPreference,
  type ParentSharedGrowthAuthority,
  type ParentSharedGrowthConsentReceipt,
  type SharedGrowthChildView,
  type SharedGrowthErrorCode,
  type SharedGrowthParticipationAction,
  type SharedGrowthParticipationActionReceipt,
  type SharedGrowthParticipationActionResult,
  type SharedGrowthParticipationStatus,
  type SharedGrowthQualitativeAggregate,
  type SharedGrowthQualitativeObservation,
  type SharedGrowthResult,
  type SharedGrowthSignalResult,
  type SharedGrowthState,
} from '../../models/sharedGrowth';

type UnknownRecord = Record<string, unknown>;

const HOUSEHOLD_ID = 'household_al_noor' as const;
const PARENT_ID = 'parent_al_noor' as const;
const CAPABILITY_TRUTH = 'local_prototype_not_authentication' as const;

const STATE_KEYS = ['schemaVersion', 'preference', 'signalHistory', 'origin'] as const;
const PREFERENCE_KEYS = [
  'schemaVersion',
  'householdId',
  'participationEpochId',
  'status',
  'activeConsentReceiptId',
  'acceptingSignalsSince',
  'consentReceipts',
  'invalidatedConsentReceiptIds',
  'actionHistory',
  'revision',
  'origin',
] as const;
const CONSENT_KEYS = [
  'id',
  'version',
  'parentId',
  'householdId',
  'participationEpochId',
  'status',
  'grantedAt',
  'supersedesEndActionId',
  'origin',
  'capabilityTruth',
] as const;
const ACTION_RECEIPT_KEYS = [
  'id',
  'action',
  'fromStatus',
  'toStatus',
  'actedAt',
  'parentId',
  'reauthenticationId',
  'consentReceiptId',
  'effect',
  'requestFingerprint',
] as const;
const AUTHORITY_KEYS = [
  'role',
  'parentId',
  'householdId',
  'participationEpochId',
  'capability',
  'reauthentication',
  'origin',
  'capabilityTruth',
] as const;
const REAUTHENTICATION_KEYS = [
  'id',
  'purpose',
  'status',
  'parentId',
  'householdId',
  'participationEpochId',
  'issuedAt',
  'expiresAt',
  'consumed',
  'origin',
  'capabilityTruth',
] as const;
const SIGNAL_KEYS = [
  'id',
  'householdId',
  'profileId',
  'profileEpochId',
  'consentReceiptId',
  'theme',
  'observedAt',
  'source',
  'privacy',
] as const;
const ACTIVE_PROFILE_KEYS = ['profileId', 'profileEpochId'] as const;
const AGGREGATE_KEYS = ['availability', 'scene', 'observations', 'origin', 'privacy'] as const;
const OBSERVATION_KEYS = ['theme', 'outlook'] as const;

const PARTICIPATION_STATUSES = new Set<string>(['continued', 'paused', 'ended']);
const PARTICIPATION_ACTIONS = new Set<string>([
  'continue',
  'pause_new_contributions',
  'end_participation',
]);
const SIGNAL_THEMES = new Set<string>([
  'coastal_habitat_care',
  'water_stewardship',
  'native_canopy_care',
]);
const OBSERVATION_OUTLOOKS = new Set<string>(['continuing', 'taking_root', 'growing_gently']);
const SUPPORTED_PROFILES = new Set<string>(['child_salem', 'child_alya']);

const PUBLIC_PROJECTION_FORBIDDEN_KEYS = [
  'id',
  'name',
  'profile',
  'rank',
  'score',
  'percent',
  'count',
  'task',
  'seed',
  'badge',
  'league',
  'challenge',
  'reward',
  'event',
  'time',
  'media',
  'money',
  'age',
  'participant',
] as const;

export const SHARED_GROWTH_QUALITATIVE_FIXTURE: SharedGrowthQualitativeAggregate = deepFreeze({
  availability: 'ready',
  scene: 'coastal_canopy',
  observations: [
    { theme: 'coastal_habitat_care', outlook: 'continuing' },
    { theme: 'water_stewardship', outlook: 'taking_root' },
    { theme: 'native_canopy_care', outlook: 'growing_gently' },
  ],
  origin: 'prepared_synthetic',
  privacy: 'anonymous_qualitative',
});

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: UnknownRecord, allowed: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 160;
}

function isSafeIdentifier(value: unknown): value is string {
  return (
    isNonEmptyString(value) && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value) && !value.includes('..')
  );
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function timestampValue(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => deepFreeze(item))) as T;
  }
  if (isRecord(value)) {
    const copy: UnknownRecord = {};
    for (const [key, child] of Object.entries(value)) copy[key] = deepFreeze(child);
    return Object.freeze(copy) as T;
  }
  return value;
}

function success<T>(data: T): SharedGrowthResult<T> {
  return deepFreeze({ ok: true as const, data });
}

function failure<T>(code: SharedGrowthErrorCode, message: string): SharedGrowthResult<T> {
  return deepFreeze({ ok: false as const, error: { code, message } });
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableHash(value: unknown): string {
  const input = canonicalJson(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sameValue(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function isParticipationStatus(value: unknown): value is SharedGrowthParticipationStatus {
  return typeof value === 'string' && PARTICIPATION_STATUSES.has(value);
}

function isParticipationAction(value: unknown): value is SharedGrowthParticipationAction {
  return typeof value === 'string' && PARTICIPATION_ACTIONS.has(value);
}

function isConsentReceipt(value: unknown): value is ParentSharedGrowthConsentReceipt {
  if (!isRecord(value) || !hasExactKeys(value, CONSENT_KEYS)) return false;
  return (
    isSafeIdentifier(value.id) &&
    isPositiveInteger(value.version) &&
    value.parentId === PARENT_ID &&
    isNonEmptyString(value.householdId) &&
    isSafeIdentifier(value.participationEpochId) &&
    value.status === 'explicit_parent_consent' &&
    timestampValue(value.grantedAt) !== null &&
    (value.supersedesEndActionId === null || isSafeIdentifier(value.supersedesEndActionId)) &&
    value.origin === 'synthetic' &&
    value.capabilityTruth === CAPABILITY_TRUTH
  );
}

function isActionReceipt(value: unknown): value is SharedGrowthParticipationActionReceipt {
  if (!isRecord(value) || !hasExactKeys(value, ACTION_RECEIPT_KEYS)) return false;
  return (
    isSafeIdentifier(value.id) &&
    isParticipationAction(value.action) &&
    isParticipationStatus(value.fromStatus) &&
    isParticipationStatus(value.toStatus) &&
    timestampValue(value.actedAt) !== null &&
    value.parentId === PARENT_ID &&
    isSafeIdentifier(value.reauthenticationId) &&
    (value.consentReceiptId === null || isSafeIdentifier(value.consentReceiptId)) &&
    value.effect === 'future_signals_only' &&
    typeof value.requestFingerprint === 'string' &&
    /^shared-growth-action:[a-f0-9]{8}$/u.test(value.requestFingerprint)
  );
}

function isSignal(value: unknown): value is AnonymousSharedGrowthSignal {
  if (!isRecord(value) || !hasExactKeys(value, SIGNAL_KEYS)) return false;
  return (
    isSafeIdentifier(value.id) &&
    value.householdId === HOUSEHOLD_ID &&
    typeof value.profileId === 'string' &&
    SUPPORTED_PROFILES.has(value.profileId) &&
    isSafeIdentifier(value.profileEpochId) &&
    (value.consentReceiptId === null || isSafeIdentifier(value.consentReceiptId)) &&
    typeof value.theme === 'string' &&
    SIGNAL_THEMES.has(value.theme) &&
    timestampValue(value.observedAt) !== null &&
    value.source === 'prepared_synthetic_signal' &&
    value.privacy === 'anonymous_qualitative_only'
  );
}

function reconstructsParticipationLifecycle(preference: CommunityParticipationPreference): boolean {
  const firstConsent = preference.consentReceipts[0];
  if (!firstConsent) return false;

  let status: SharedGrowthParticipationStatus = 'continued';
  let activeConsentReceiptId: string | null = firstConsent.id;
  let acceptingSignalsSince: string | null = firstConsent.grantedAt;
  let nextConsentIndex = 1;
  const invalidatedConsentReceiptIds: string[] = [];
  let previousAction: SharedGrowthParticipationActionReceipt | null = null;
  let previousActionTime = timestampValue(firstConsent.grantedAt) ?? -1;

  for (const action of preference.actionHistory) {
    const actionTime = timestampValue(action.actedAt);
    if (action.fromStatus !== status || actionTime === null || actionTime < previousActionTime) {
      return false;
    }

    if (action.action === 'pause_new_contributions') {
      if (
        status !== 'continued' ||
        action.toStatus !== 'paused' ||
        action.consentReceiptId !== activeConsentReceiptId
      ) {
        return false;
      }
      status = 'paused';
      acceptingSignalsSince = null;
    } else if (action.action === 'end_participation') {
      if (
        (status !== 'continued' && status !== 'paused') ||
        action.toStatus !== 'ended' ||
        activeConsentReceiptId === null ||
        action.consentReceiptId !== activeConsentReceiptId
      ) {
        return false;
      }
      invalidatedConsentReceiptIds.push(activeConsentReceiptId);
      activeConsentReceiptId = null;
      acceptingSignalsSince = null;
      status = 'ended';
    } else if (status === 'paused') {
      if (
        action.toStatus !== 'continued' ||
        activeConsentReceiptId === null ||
        action.consentReceiptId !== activeConsentReceiptId
      ) {
        return false;
      }
      acceptingSignalsSince = action.actedAt;
      status = 'continued';
    } else if (status === 'ended') {
      const nextConsent = preference.consentReceipts[nextConsentIndex];
      if (
        action.toStatus !== 'continued' ||
        !nextConsent ||
        previousAction?.action !== 'end_participation' ||
        nextConsent.supersedesEndActionId !== previousAction.id ||
        action.consentReceiptId !== nextConsent.id ||
        (timestampValue(nextConsent.grantedAt) ?? -1) <=
          (timestampValue(previousAction.actedAt) ?? -1) ||
        (timestampValue(nextConsent.grantedAt) ?? Number.POSITIVE_INFINITY) >
          (timestampValue(action.actedAt) ?? -1)
      ) {
        return false;
      }
      activeConsentReceiptId = nextConsent.id;
      acceptingSignalsSince = action.actedAt;
      nextConsentIndex += 1;
      status = 'continued';
    } else {
      return false;
    }
    previousAction = action;
    previousActionTime = actionTime;
  }

  return (
    nextConsentIndex === preference.consentReceipts.length &&
    preference.status === status &&
    preference.activeConsentReceiptId === activeConsentReceiptId &&
    preference.acceptingSignalsSince === acceptingSignalsSince &&
    sameValue(preference.invalidatedConsentReceiptIds, invalidatedConsentReceiptIds)
  );
}

function signalFallsWithinRecordedContributionWindow(
  preference: CommunityParticipationPreference,
  signal: AnonymousSharedGrowthSignal,
): boolean {
  const firstConsent = preference.consentReceipts[0];
  const observedAt = timestampValue(signal.observedAt);
  if (!firstConsent || observedAt === null) return false;

  let status: SharedGrowthParticipationStatus = 'continued';
  let activeConsentReceiptId: string | null = firstConsent.id;
  let acceptingSignalsSince: number | null = timestampValue(firstConsent.grantedAt);
  for (const action of preference.actionHistory) {
    const actionTime = timestampValue(action.actedAt);
    if (actionTime === null) return false;
    if (actionTime > observedAt) break;

    if (action.action === 'pause_new_contributions') {
      status = 'paused';
      acceptingSignalsSince = null;
    } else if (action.action === 'end_participation') {
      status = 'ended';
      activeConsentReceiptId = null;
      acceptingSignalsSince = null;
    } else {
      status = 'continued';
      activeConsentReceiptId = action.consentReceiptId;
      acceptingSignalsSince = actionTime;
    }
  }

  return (
    status === 'continued' &&
    activeConsentReceiptId !== null &&
    signal.consentReceiptId === activeConsentReceiptId &&
    acceptingSignalsSince !== null &&
    observedAt >= acceptingSignalsSince
  );
}

function validatePreference(value: unknown): value is CommunityParticipationPreference {
  if (!isRecord(value) || !hasExactKeys(value, PREFERENCE_KEYS)) return false;
  if (
    value.schemaVersion !== SHARED_GROWTH_SCHEMA_VERSION ||
    value.householdId !== HOUSEHOLD_ID ||
    !isSafeIdentifier(value.participationEpochId) ||
    !isParticipationStatus(value.status) ||
    (value.activeConsentReceiptId !== null && !isSafeIdentifier(value.activeConsentReceiptId)) ||
    (value.acceptingSignalsSince !== null &&
      timestampValue(value.acceptingSignalsSince) === null) ||
    !Array.isArray(value.consentReceipts) ||
    !Array.isArray(value.invalidatedConsentReceiptIds) ||
    !Array.isArray(value.actionHistory) ||
    !isPositiveInteger(value.revision) ||
    value.origin !== 'synthetic_local'
  ) {
    return false;
  }

  const consents = value.consentReceipts;
  if (consents.length === 0 || !consents.every(isConsentReceipt)) return false;
  const consentIds = consents.map((receipt) => receipt.id);
  const consentVersions = consents.map((receipt) => receipt.version);
  if (
    new Set(consentIds).size !== consentIds.length ||
    new Set(consentVersions).size !== consentVersions.length ||
    consents.some(
      (receipt) =>
        receipt.householdId !== value.householdId ||
        receipt.participationEpochId !== value.participationEpochId,
    ) ||
    consentVersions.some((version, index) => version !== index + 1) ||
    consents[0]?.supersedesEndActionId !== null
  ) {
    return false;
  }

  if (
    !value.invalidatedConsentReceiptIds.every(isSafeIdentifier) ||
    new Set(value.invalidatedConsentReceiptIds).size !==
      value.invalidatedConsentReceiptIds.length ||
    value.invalidatedConsentReceiptIds.some((id) => !consentIds.includes(id))
  ) {
    return false;
  }

  const actions = value.actionHistory;
  if (!actions.every(isActionReceipt) || value.revision !== actions.length + 1) return false;
  const actionIds = actions.map((receipt) => receipt.id);
  const proofIds = actions.map((receipt) => receipt.reauthenticationId);
  if (new Set(actionIds).size !== actionIds.length || new Set(proofIds).size !== proofIds.length) {
    return false;
  }
  return reconstructsParticipationLifecycle(value as unknown as CommunityParticipationPreference);
}

function validateState(value: unknown): value is SharedGrowthState {
  if (!isRecord(value) || !hasExactKeys(value, STATE_KEYS)) return false;
  if (value.schemaVersion !== SHARED_GROWTH_SCHEMA_VERSION || value.origin !== 'synthetic_local') {
    return false;
  }
  const preference = value.preference;
  const signalHistory = value.signalHistory;
  if (
    !validatePreference(preference) ||
    !Array.isArray(signalHistory) ||
    !signalHistory.every(isSignal)
  ) {
    return false;
  }
  const signalIds = signalHistory.map((signal) => signal.id);
  return (
    new Set(signalIds).size === signalIds.length &&
    signalHistory.every(
      (signal) =>
        signal.householdId === preference.householdId &&
        preference.consentReceipts.some((receipt) => receipt.id === signal.consentReceiptId) &&
        signalFallsWithinRecordedContributionWindow(preference, signal),
    )
  );
}

function validateAuthority(
  value: unknown,
  preference: CommunityParticipationPreference,
  actedAt: string,
): SharedGrowthResult<ParentSharedGrowthAuthority> {
  if (!isRecord(value) || !hasExactKeys(value, AUTHORITY_KEYS)) {
    return failure(
      'PARENT_AUTHORITY_REQUIRED',
      'A prevalidated synthetic Parent authority is required',
    );
  }
  if (value.role !== 'parent' || value.parentId !== PARENT_ID) {
    return failure(
      'PARENT_AUTHORITY_REQUIRED',
      'Only the authorized synthetic Parent may change participation',
    );
  }
  if (value.householdId !== preference.householdId) {
    return failure('SCOPE_MISMATCH', 'Parent authority must match the participation household');
  }
  if (value.participationEpochId !== preference.participationEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Parent authority must match the participation epoch');
  }
  if (
    value.capability !== 'manage_shared_growth_contribution' ||
    value.origin !== 'synthetic' ||
    value.capabilityTruth !== CAPABILITY_TRUTH ||
    !isRecord(value.reauthentication) ||
    !hasExactKeys(value.reauthentication, REAUTHENTICATION_KEYS)
  ) {
    return failure('PARENT_AUTHORITY_REQUIRED', 'The bounded Shared Growth capability is required');
  }

  const proof = value.reauthentication;
  if (proof.parentId !== PARENT_ID) {
    return failure(
      'PARENT_AUTHORITY_REQUIRED',
      'The reauthentication reference must belong to the Parent',
    );
  }
  if (proof.householdId !== preference.householdId) {
    return failure('SCOPE_MISMATCH', 'Reauthentication must match the participation household');
  }
  if (proof.participationEpochId !== preference.participationEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Reauthentication must match the participation epoch');
  }
  const actionTime = timestampValue(actedAt);
  const issuedAt = timestampValue(proof.issuedAt);
  const expiresAt = timestampValue(proof.expiresAt);
  if (
    !isSafeIdentifier(proof.id) ||
    proof.purpose !== 'change_shared_growth_participation' ||
    proof.status !== 'verified' ||
    proof.consumed !== false ||
    proof.origin !== 'synthetic' ||
    proof.capabilityTruth !== CAPABILITY_TRUTH ||
    actionTime === null ||
    issuedAt === null ||
    expiresAt === null ||
    issuedAt >= expiresAt ||
    actionTime < issuedAt ||
    actionTime >= expiresAt
  ) {
    return failure(
      'REAUTHENTICATION_REQUIRED',
      'A current unconsumed Parent reauthentication reference is required',
    );
  }
  return success(value as unknown as ParentSharedGrowthAuthority);
}

function actionRequestFingerprint(
  input: Omit<ApplySharedGrowthParticipationActionInput, 'state'>,
): string {
  return `shared-growth-action:${stableHash(input)}`;
}

function lastEndActionId(preference: CommunityParticipationPreference): string | null {
  for (let index = preference.actionHistory.length - 1; index >= 0; index -= 1) {
    const receipt = preference.actionHistory[index];
    if (receipt?.action === 'end_participation') return receipt.id;
  }
  return null;
}

function validateFreshConsent(
  value: unknown,
  preference: CommunityParticipationPreference,
  expectedEndActionId: string,
  actedAt: string,
): SharedGrowthResult<ParentSharedGrowthConsentReceipt> {
  if (!isConsentReceipt(value)) {
    return failure('CONSENT_REQUIRED', 'Fresh explicit Parent consent is required after End');
  }
  if (value.householdId !== preference.householdId) {
    return failure('SCOPE_MISMATCH', 'Fresh consent must match the participation household');
  }
  if (value.participationEpochId !== preference.participationEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Fresh consent must match the participation epoch');
  }
  if (
    preference.consentReceipts.some((receipt) => receipt.id === value.id) ||
    preference.invalidatedConsentReceiptIds.includes(value.id) ||
    value.version !== preference.consentReceipts.length + 1 ||
    value.supersedesEndActionId !== expectedEndActionId
  ) {
    return failure(
      'CONSENT_CONFLICT',
      'Ended participation requires a distinct next-version consent receipt',
    );
  }
  const endReceipt = preference.actionHistory.find((receipt) => receipt.id === expectedEndActionId);
  const grantedAt = timestampValue(value.grantedAt);
  const endedAt = timestampValue(endReceipt?.actedAt);
  const actionTime = timestampValue(actedAt);
  if (
    !endReceipt ||
    grantedAt === null ||
    endedAt === null ||
    actionTime === null ||
    grantedAt <= endedAt ||
    grantedAt > actionTime
  ) {
    return failure(
      'CONSENT_CONFLICT',
      'Fresh consent must be granted after the matching End action',
    );
  }
  return success(value);
}

function containsForbiddenPublicData(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenPublicData);
  if (!isRecord(value)) return typeof value === 'number';
  return Object.entries(value).some(([key, child]) => {
    const normalized = key.toLowerCase();
    return (
      PUBLIC_PROJECTION_FORBIDDEN_KEYS.some((fragment) => normalized.includes(fragment)) ||
      containsForbiddenPublicData(child)
    );
  });
}

function hasUnexpectedKeys(value: unknown, allowed: readonly string[]): boolean {
  return isRecord(value) && Object.keys(value).some((key) => !allowed.includes(key));
}

function validateObservation(value: unknown): value is SharedGrowthQualitativeObservation {
  return (
    isRecord(value) &&
    hasExactKeys(value, OBSERVATION_KEYS) &&
    typeof value.theme === 'string' &&
    SIGNAL_THEMES.has(value.theme) &&
    typeof value.outlook === 'string' &&
    OBSERVATION_OUTLOOKS.has(value.outlook)
  );
}

function validateAggregate(value: unknown): value is SharedGrowthQualitativeAggregate {
  if (!isRecord(value) || !hasExactKeys(value, AGGREGATE_KEYS)) return false;
  if (
    (value.availability !== 'ready' && value.availability !== 'unavailable') ||
    value.scene !== 'coastal_canopy' ||
    !Array.isArray(value.observations) ||
    !value.observations.every(validateObservation) ||
    value.origin !== 'prepared_synthetic' ||
    value.privacy !== 'anonymous_qualitative'
  ) {
    return false;
  }
  const themes = value.observations.map((observation) => observation.theme);
  if (new Set(themes).size !== themes.length) return false;
  return value.availability === 'ready'
    ? value.observations.length >= 2 && value.observations.length <= 3
    : value.observations.length === 0;
}

export function createSharedGrowthState(input: unknown): SharedGrowthResult<SharedGrowthState> {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, ['householdId', 'participationEpochId', 'initialConsent']) ||
    input.householdId !== HOUSEHOLD_ID ||
    !isSafeIdentifier(input.participationEpochId) ||
    !isConsentReceipt(input.initialConsent)
  ) {
    return failure(
      'INVALID_INPUT',
      'A complete synthetic Shared Growth initialization is required',
    );
  }
  const consent = input.initialConsent;
  if (consent.householdId !== input.householdId) {
    return failure('SCOPE_MISMATCH', 'Initial consent must match the participation household');
  }
  if (consent.participationEpochId !== input.participationEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Initial consent must match the participation epoch');
  }
  if (consent.version !== 1 || consent.supersedesEndActionId !== null) {
    return failure(
      'CONSENT_CONFLICT',
      'Initial participation requires the first explicit consent receipt',
    );
  }

  const preference: CommunityParticipationPreference = {
    schemaVersion: SHARED_GROWTH_SCHEMA_VERSION,
    householdId: input.householdId,
    participationEpochId: input.participationEpochId,
    status: 'continued',
    activeConsentReceiptId: consent.id,
    acceptingSignalsSince: consent.grantedAt,
    consentReceipts: [consent],
    invalidatedConsentReceiptIds: [],
    actionHistory: [],
    revision: 1,
    origin: 'synthetic_local',
  };
  return success({
    schemaVersion: SHARED_GROWTH_SCHEMA_VERSION,
    preference,
    signalHistory: [],
    origin: 'synthetic_local',
  });
}

export function applySharedGrowthParticipationAction(
  input: unknown,
): SharedGrowthResult<SharedGrowthParticipationActionResult> {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, ['state', 'actionId', 'action', 'actedAt', 'authority', 'freshConsent'])
  ) {
    return failure('INVALID_INPUT', 'A complete Shared Growth participation action is required');
  }
  if (!validateState(input.state)) {
    return failure('INVALID_STATE', 'The Shared Growth state is malformed or inconsistent');
  }
  if (
    !isSafeIdentifier(input.actionId) ||
    !isParticipationAction(input.action) ||
    timestampValue(input.actedAt) === null
  ) {
    return failure(
      'INVALID_INPUT',
      'The participation action identity, kind, and time are required',
    );
  }

  const state = input.state;
  const actionId = input.actionId as string;
  const action = input.action as SharedGrowthParticipationAction;
  const actedAt = input.actedAt as string;
  const request = {
    actionId,
    action,
    actedAt,
    authority: input.authority,
    freshConsent: input.freshConsent,
  } as Omit<ApplySharedGrowthParticipationActionInput, 'state'>;
  const requestFingerprint = actionRequestFingerprint(request);
  const existingAction = state.preference.actionHistory.find((receipt) => receipt.id === actionId);
  if (existingAction) {
    if (existingAction.requestFingerprint !== requestFingerprint) {
      return failure(
        'ACTION_CONFLICT',
        'The participation action identity was reused with different input',
      );
    }
    return success({ disposition: 'already_applied', state });
  }

  const authorityResult = validateAuthority(input.authority, state.preference, actedAt);
  if (!authorityResult.ok) return authorityResult;
  const authority = authorityResult.data;
  if (
    state.preference.actionHistory.some(
      (receipt) => receipt.reauthenticationId === authority.reauthentication.id,
    )
  ) {
    return failure(
      'AUTHORITY_CONFLICT',
      'A reauthentication reference cannot authorize two actions',
    );
  }
  const previousAction = state.preference.actionHistory.at(-1);
  const chronologicalLowerBound =
    previousAction?.actedAt ?? state.preference.consentReceipts[0]?.grantedAt;
  if (
    chronologicalLowerBound === undefined ||
    (timestampValue(actedAt) ?? -1) < (timestampValue(chronologicalLowerBound) ?? -1)
  ) {
    return failure('INVALID_TRANSITION', 'Participation actions must preserve deterministic order');
  }

  const preference = state.preference;
  let nextStatus: SharedGrowthParticipationStatus;
  let nextActiveConsentId = preference.activeConsentReceiptId;
  let nextAcceptingSince = preference.acceptingSignalsSince;
  let nextConsents = [...preference.consentReceipts];
  let nextInvalidated = [...preference.invalidatedConsentReceiptIds];
  let actionConsentId: string | null = preference.activeConsentReceiptId;

  if (action === 'pause_new_contributions') {
    if (preference.status !== 'continued' || input.freshConsent !== null) {
      return failure(
        'INVALID_TRANSITION',
        'Pause applies only to currently continued participation',
      );
    }
    nextStatus = 'paused';
    nextAcceptingSince = null;
  } else if (action === 'end_participation') {
    if (preference.status === 'ended' || input.freshConsent !== null || !nextActiveConsentId) {
      return failure('INVALID_TRANSITION', 'End applies only to active or paused participation');
    }
    nextStatus = 'ended';
    if (!nextInvalidated.includes(nextActiveConsentId)) nextInvalidated.push(nextActiveConsentId);
    nextActiveConsentId = null;
    nextAcceptingSince = null;
  } else if (preference.status === 'paused') {
    if (input.freshConsent !== null || !nextActiveConsentId) {
      return failure('CONSENT_CONFLICT', 'Continue from Pause reuses the existing consent');
    }
    nextStatus = 'continued';
    nextAcceptingSince = actedAt;
  } else if (preference.status === 'ended') {
    const endActionId = lastEndActionId(preference);
    if (!endActionId || input.freshConsent === null) {
      return failure('CONSENT_REQUIRED', 'Fresh explicit Parent consent is required after End');
    }
    const consentResult = validateFreshConsent(
      input.freshConsent,
      preference,
      endActionId,
      actedAt,
    );
    if (!consentResult.ok) return consentResult;
    nextConsents.push(consentResult.data);
    nextActiveConsentId = consentResult.data.id;
    actionConsentId = consentResult.data.id;
    nextStatus = 'continued';
    nextAcceptingSince = actedAt;
  } else {
    return failure('INVALID_TRANSITION', 'Continued participation cannot be continued twice');
  }

  const receipt: SharedGrowthParticipationActionReceipt = {
    id: actionId,
    action,
    fromStatus: preference.status,
    toStatus: nextStatus,
    actedAt,
    parentId: authority.parentId,
    reauthenticationId: authority.reauthentication.id,
    consentReceiptId: actionConsentId,
    effect: 'future_signals_only',
    requestFingerprint,
  };
  const nextPreference: CommunityParticipationPreference = {
    ...preference,
    status: nextStatus,
    activeConsentReceiptId: nextActiveConsentId,
    acceptingSignalsSince: nextAcceptingSince,
    consentReceipts: nextConsents,
    invalidatedConsentReceiptIds: nextInvalidated,
    actionHistory: [...preference.actionHistory, receipt],
    revision: preference.revision + 1,
  };
  return success({
    disposition: 'applied',
    state: {
      ...state,
      preference: nextPreference,
      signalHistory: [...state.signalHistory],
    },
  });
}

export function recordSharedGrowthSignal(
  input: unknown,
): SharedGrowthResult<SharedGrowthSignalResult> {
  if (!isRecord(input) || !hasExactKeys(input, ['state', 'activeProfile', 'signal'])) {
    return failure('INVALID_INPUT', 'A complete private Shared Growth signal decision is required');
  }
  if (!validateState(input.state)) {
    return failure('INVALID_STATE', 'The Shared Growth state is malformed or inconsistent');
  }
  if (hasUnexpectedKeys(input.signal, SIGNAL_KEYS)) {
    return failure(
      'PRIVACY_VIOLATION',
      'Shared Growth signals reject all fields outside the private allowlist',
    );
  }
  if (
    !isRecord(input.activeProfile) ||
    !hasExactKeys(input.activeProfile, ACTIVE_PROFILE_KEYS) ||
    !isSignal(input.signal)
  ) {
    return failure(
      'INVALID_INPUT',
      'Only a supplied synthetic anonymous qualitative signal is accepted',
    );
  }
  const state = input.state;
  const signal = input.signal;
  if (signal.householdId !== state.preference.householdId) {
    return failure('SCOPE_MISMATCH', 'The signal must match the Shared Growth household');
  }
  if (input.activeProfile.profileId !== signal.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'The signal must match the active private profile');
  }
  if (input.activeProfile.profileEpochId !== signal.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'The signal must match the active profile epoch');
  }

  const existing = state.signalHistory.find((candidate) => candidate.id === signal.id);
  if (existing) {
    if (!sameValue(existing, signal)) {
      return failure(
        'SIGNAL_CONFLICT',
        'The anonymous signal identity was reused with different evidence',
      );
    }
    return success({ disposition: 'already_recorded', reason: null, state });
  }
  if (state.preference.status === 'paused') {
    return success({ disposition: 'not_recorded', reason: 'participation_paused', state });
  }
  if (state.preference.status === 'ended') {
    return success({ disposition: 'not_recorded', reason: 'participation_ended', state });
  }
  if (signal.consentReceiptId !== state.preference.activeConsentReceiptId) {
    return failure(
      'CONSENT_CONFLICT',
      'The signal must reference the active Parent consent receipt',
    );
  }
  const acceptingSince = timestampValue(state.preference.acceptingSignalsSince);
  const observedAt = timestampValue(signal.observedAt);
  if (acceptingSince === null || observedAt === null || observedAt < acceptingSince) {
    return success({
      disposition: 'not_recorded',
      reason: 'outside_active_contribution_window',
      state,
    });
  }

  return success({
    disposition: 'recorded',
    reason: null,
    state: {
      ...state,
      preference: state.preference,
      signalHistory: [...state.signalHistory, signal],
    },
  });
}

export function projectSharedGrowthView(input: unknown): SharedGrowthResult<SharedGrowthChildView> {
  if (!isRecord(input) || !hasExactKeys(input, ['aggregate', 'preference'])) {
    return failure(
      'INVALID_INPUT',
      'A qualitative aggregate and participation preference are required',
    );
  }
  if (!validatePreference(input.preference)) {
    return failure('INVALID_STATE', 'The participation preference is malformed or inconsistent');
  }
  if (containsForbiddenPublicData(input.aggregate)) {
    return failure(
      'PRIVACY_VIOLATION',
      'The Child projection rejected identifying or numeric data',
    );
  }
  if (!validateAggregate(input.aggregate)) {
    return failure('INVALID_INPUT', 'A complete supplied qualitative aggregate is required');
  }
  const aggregate = input.aggregate;
  return success({
    availability: aggregate.availability,
    scene: aggregate.scene,
    observations: aggregate.observations.map((observation) => ({
      theme: observation.theme,
      outlook: observation.outlook,
    })),
    origin: 'synthetic_local',
    privacy: 'anonymous_qualitative',
    viewing: 'available',
    participation: input.preference.status,
    contributionPrompt: 'none',
  });
}
