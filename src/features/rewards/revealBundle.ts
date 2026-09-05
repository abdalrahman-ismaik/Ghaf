import { IMPACT_PATH_STATIONS } from '../../models/growthJourney';
import { BADGE_IDS } from '../growth/badgeRegistry';
import {
  REVEAL_BUNDLE_SCHEMA_VERSION,
  type CommittedRevealSourceReceipt,
  type EligibleRevealTriggerKind,
  type RevealBundle,
  type RevealBundleErrorCode,
  type RevealBundleLifecycle,
  type RevealBundleQueue,
  type RevealBundleResult,
  type RevealConstructionResult,
  type RevealLifecycleResult,
  type RevealPresentationScope,
  type RevealPresentationResult,
} from '../../models/revealBundle';

type UnknownRecord = Record<string, unknown>;

const RECEIPT_KEYS = [
  'id',
  'authority',
  'profileId',
  'profileEpochId',
  'triggerEventId',
  'triggerKind',
  'status',
  'committedAt',
  'consequence',
] as const;

const CONSTRUCTION_KEYS = [
  'queue',
  'profileId',
  'profileEpochId',
  'triggerEventId',
  'triggerKind',
  'triggeredAt',
  'receipts',
] as const;

const BUNDLE_KEYS = [
  'id',
  'schemaVersion',
  'profileId',
  'profileEpochId',
  'triggerEventId',
  'triggerKind',
  'triggeredAt',
  'lifecycle',
  'sourceFingerprint',
  'items',
  'audience',
] as const;

const CONSEQUENCE_ORDER = {
  parent_praise: 0,
  seed: 1,
  plant_stage: 2,
  canopy: 3,
  green_circle: 4,
  private_league_leaf: 5,
  challenge_leaf: 6,
  private_family_reward: 7,
  earned_badge: 8,
  impact_path_station: 9,
  unlocked_learning: 10,
  safe_help: 11,
} as const;

const SINGLETON_KINDS = new Set<string>([
  'parent_praise',
  'seed',
  'plant_stage',
  'canopy',
  'green_circle',
  'private_league_leaf',
  'challenge_leaf',
  'private_family_reward',
  'safe_help',
]);

const AUTHORITY_BY_KIND = {
  parent_praise: 'parent_check_in',
  seed: 'seed_ledger',
  plant_stage: 'garden',
  canopy: 'canopy',
  green_circle: 'green_circle',
  private_league_leaf: 'private_league',
  challenge_leaf: 'challenge_leaf',
  private_family_reward: 'family_reward',
  earned_badge: 'achievements',
  impact_path_station: 'impact_path',
  unlocked_learning: 'learning',
  safe_help: 'safe_help',
} as const;

const FIXED_SEED_AWARDS = new Set([4, 6, 8, 12, 15]);
const APPROVED_BADGE_IDS = new Set<string>(BADGE_IDS);
const LANDSCAPE_IDS = new Set(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']);
const GARDEN_STAGES = new Set(['seed', 'shoot', 'sapling', 'shade', 'flourishing']);
const GROWTH_THRESHOLDS = new Set([20, 60, 120, 200]);
const REVEAL_LIFECYCLES = new Set<RevealBundleLifecycle>([
  'ready',
  'presenting',
  'acknowledged',
  'archived',
]);
const ELIGIBLE_TRIGGER_KINDS = new Set<EligibleRevealTriggerKind>([
  'task_approval',
  'learning_completion',
]);

function success<T>(data: T): RevealBundleResult<T> {
  return immutableCopy({ ok: true as const, data });
}

function failure<T>(code: RevealBundleErrorCode, message: string): RevealBundleResult<T> {
  return immutableCopy({ ok: false as const, error: { code, message } });
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: UnknownRecord, allowed: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return isNonNegativeInteger(value) && value > 0;
}

function isIsoInstant(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function isProfileId(value: unknown): value is 'child_salem' | 'child_alya' {
  return value === 'child_salem' || value === 'child_alya';
}

function isLocalizedText(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, ['ar', 'en']) &&
    isNonEmptyString(value.ar) &&
    isNonEmptyString(value.en)
  );
}

function immutableCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => immutableCopy(item))) as T;
  }
  if (isRecord(value)) {
    const copy: UnknownRecord = {};
    for (const [key, child] of Object.entries(value)) copy[key] = immutableCopy(child);
    return Object.freeze(copy) as T;
  }
  return value;
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

function sourceFingerprint(receipts: readonly CommittedRevealSourceReceipt[]): string {
  return `reveal-source:${stableHash(receipts)}`;
}

function consequenceKind(receipt: UnknownRecord): string | null {
  return isRecord(receipt.consequence) && typeof receipt.consequence.kind === 'string'
    ? receipt.consequence.kind
    : null;
}

function isParentPraise(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, ['kind', 'checkInId', 'text']) &&
    value.kind === 'parent_praise' &&
    isNonEmptyString(value.checkInId) &&
    isLocalizedText(value.text)
  );
}

function isSeed(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, ['kind', 'transactionId', 'delta', 'before', 'after', 'meaning']) &&
    value.kind === 'seed' &&
    isNonEmptyString(value.transactionId) &&
    typeof value.delta === 'number' &&
    FIXED_SEED_AWARDS.has(value.delta) &&
    isNonNegativeInteger(value.before) &&
    isNonNegativeInteger(value.after) &&
    value.after === value.before + value.delta &&
    value.meaning === 'symbolic_nonfinancial'
  );
}

function isPlantStage(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'growthId',
      'landscapeId',
      'seedsBefore',
      'seedsAfter',
      'stageBefore',
      'stageAfter',
      'crossedThreshold',
      'symbolicOnly',
    ]) &&
    value.kind === 'plant_stage' &&
    isNonEmptyString(value.growthId) &&
    typeof value.landscapeId === 'string' &&
    LANDSCAPE_IDS.has(value.landscapeId) &&
    isNonNegativeInteger(value.seedsBefore) &&
    isNonNegativeInteger(value.seedsAfter) &&
    value.seedsAfter > value.seedsBefore &&
    typeof value.stageBefore === 'string' &&
    GARDEN_STAGES.has(value.stageBefore) &&
    typeof value.stageAfter === 'string' &&
    GARDEN_STAGES.has(value.stageAfter) &&
    (value.crossedThreshold === null ||
      (typeof value.crossedThreshold === 'number' &&
        GROWTH_THRESHOLDS.has(value.crossedThreshold))) &&
    value.symbolicOnly === true
  );
}

function isCanopy(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'contributionId',
      'leavesBefore',
      'leavesAfter',
      'leafDelta',
      'goalLeaves',
      'origin',
    ]) &&
    value.kind === 'canopy' &&
    isNonEmptyString(value.contributionId) &&
    isNonNegativeInteger(value.leavesBefore) &&
    isNonNegativeInteger(value.leavesAfter) &&
    value.leafDelta === 1 &&
    value.leavesAfter === value.leavesBefore + value.leafDelta &&
    value.goalLeaves === 25 &&
    value.leavesAfter <= value.goalLeaves &&
    value.origin === 'synthetic'
  );
}

function isGreenCircle(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'eventId',
      'actionsBefore',
      'actionsAfter',
      'actionDelta',
      'goal',
      'sourceScope',
      'origin',
    ]) &&
    value.kind === 'green_circle' &&
    isNonEmptyString(value.eventId) &&
    isNonNegativeInteger(value.actionsBefore) &&
    isNonNegativeInteger(value.actionsAfter) &&
    value.actionDelta === 1 &&
    value.actionsAfter === value.actionsBefore + value.actionDelta &&
    value.goal === 12 &&
    value.actionsAfter <= value.goal &&
    value.sourceScope === 'household' &&
    value.origin === 'synthetic_local'
  );
}

function isPrivateLeagueLeaf(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'weekKey',
      'leagueReceiptId',
      'leafId',
      'confirmedLeavesBefore',
      'confirmedLeavesAfter',
      'leafDelta',
      'privacy',
    ]) &&
    value.kind === 'private_league_leaf' &&
    isNonEmptyString(value.weekKey) &&
    isNonEmptyString(value.leagueReceiptId) &&
    isNonEmptyString(value.leafId) &&
    isNonNegativeInteger(value.confirmedLeavesBefore) &&
    isNonNegativeInteger(value.confirmedLeavesAfter) &&
    value.leafDelta === 1 &&
    value.confirmedLeavesAfter === value.confirmedLeavesBefore + value.leafDelta &&
    value.confirmedLeavesAfter <= 5 &&
    value.privacy === 'private_family_league'
  );
}

function isChallengeLeaf(value: UnknownRecord, triggerEventId: string): boolean {
  return (
    hasExactKeys(value, ['kind', 'weekKey', 'leafId', 'recognitionKey', 'state', 'privacy']) &&
    value.kind === 'challenge_leaf' &&
    isNonEmptyString(value.weekKey) &&
    isNonEmptyString(value.leafId) &&
    value.recognitionKey === triggerEventId &&
    value.state === 'confirmed' &&
    value.privacy === 'private_family_league'
  );
}

function isPrivateFamilyReward(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'planId',
      'planVersion',
      'lifecycleBefore',
      'lifecycleAfter',
      'privacy',
    ]) &&
    value.kind === 'private_family_reward' &&
    isNonEmptyString(value.planId) &&
    isPositiveInteger(value.planVersion) &&
    value.lifecycleBefore === 'promised' &&
    value.lifecycleAfter === 'unlocked' &&
    value.privacy === 'child_guardians_only'
  );
}

function isEarnedBadge(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, [
      'kind',
      'awardId',
      'badgeId',
      'newlyEarned',
      'earnedAt',
      'private',
      'permanent',
    ]) &&
    value.kind === 'earned_badge' &&
    isNonEmptyString(value.awardId) &&
    isNonEmptyString(value.badgeId) &&
    APPROVED_BADGE_IDS.has(value.badgeId) &&
    value.newlyEarned === true &&
    isIsoInstant(value.earnedAt) &&
    value.private === true &&
    value.permanent === true
  );
}

function isImpactPathStation(value: UnknownRecord): boolean {
  if (
    !hasExactKeys(value, ['kind', 'threshold', 'result', 'newlyReached']) ||
    value.kind !== 'impact_path_station' ||
    value.newlyReached !== true
  ) {
    return false;
  }
  return IMPACT_PATH_STATIONS.some(
    (station) => station.threshold === value.threshold && station.result === value.result,
  );
}

function isUnlockedLearning(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, ['kind', 'unlockId', 'learningId', 'newlyUnlocked']) &&
    value.kind === 'unlocked_learning' &&
    isNonEmptyString(value.unlockId) &&
    value.learningId === 'learning.mangrove_roots.v1' &&
    value.newlyUnlocked === true
  );
}

function isSafeHelp(value: UnknownRecord): boolean {
  return (
    hasExactKeys(value, ['kind', 'recognitionId', 'helpKind', 'recognized']) &&
    value.kind === 'safe_help' &&
    isNonEmptyString(value.recognitionId) &&
    (value.helpKind === 'permitted_help' || value.helpKind === 'asked_adult') &&
    value.recognized === true
  );
}

function isValidConsequence(value: UnknownRecord, triggerEventId: string): boolean {
  switch (value.kind) {
    case 'parent_praise':
      return isParentPraise(value);
    case 'seed':
      return isSeed(value);
    case 'plant_stage':
      return isPlantStage(value);
    case 'canopy':
      return isCanopy(value);
    case 'green_circle':
      return isGreenCircle(value);
    case 'private_league_leaf':
      return isPrivateLeagueLeaf(value);
    case 'challenge_leaf':
      return isChallengeLeaf(value, triggerEventId);
    case 'private_family_reward':
      return isPrivateFamilyReward(value);
    case 'earned_badge':
      return isEarnedBadge(value);
    case 'impact_path_station':
      return isImpactPathStation(value);
    case 'unlocked_learning':
      return isUnlockedLearning(value);
    case 'safe_help':
      return isSafeHelp(value);
    default:
      return false;
  }
}

interface ReceiptScope {
  readonly profileId: 'child_salem' | 'child_alya';
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly triggerKind: EligibleRevealTriggerKind;
}

function validateReceipt(
  value: unknown,
  scope: ReceiptScope,
): RevealBundleResult<CommittedRevealSourceReceipt> {
  if (!isRecord(value) || !hasExactKeys(value, RECEIPT_KEYS)) {
    return failure('INVALID_INPUT', 'Each source receipt must use the exact committed schema');
  }
  if (value.status !== 'committed') {
    return failure('UNCOMMITTED_RECEIPT', 'RevealBundle accepts committed source receipts only');
  }
  if (!isNonEmptyString(value.id) || !isIsoInstant(value.committedAt)) {
    return failure('INVALID_INPUT', 'Source receipt identity and commit time are required');
  }
  if (value.profileId !== scope.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Source receipt belongs to another profile');
  }
  if (value.profileEpochId !== scope.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Source receipt belongs to another profile epoch');
  }
  if (value.triggerEventId !== scope.triggerEventId || value.triggerKind !== scope.triggerKind) {
    return failure('TRIGGER_SCOPE_MISMATCH', 'Source receipt belongs to another trigger');
  }
  if (
    !isRecord(value.consequence) ||
    !isValidConsequence(value.consequence, scope.triggerEventId)
  ) {
    return failure('INVALID_INPUT', 'Source receipt consequence is malformed');
  }
  const kind = consequenceKind(value);
  if (!kind || AUTHORITY_BY_KIND[kind as keyof typeof AUTHORITY_BY_KIND] !== value.authority) {
    return failure('INVALID_INPUT', 'Source receipt authority does not own this consequence');
  }
  return success(immutableCopy(value as unknown as CommittedRevealSourceReceipt));
}

function semanticReceiptKey(receipt: CommittedRevealSourceReceipt): string {
  switch (receipt.consequence.kind) {
    case 'earned_badge':
      return `${receipt.consequence.kind}:${receipt.consequence.badgeId}`;
    case 'impact_path_station':
      return `${receipt.consequence.kind}:${receipt.consequence.threshold}`;
    case 'unlocked_learning':
      return `${receipt.consequence.kind}:${receipt.consequence.learningId}`;
    default:
      return receipt.consequence.kind;
  }
}

function receiptSecondaryKey(receipt: CommittedRevealSourceReceipt): string {
  switch (receipt.consequence.kind) {
    case 'earned_badge':
      return receipt.consequence.badgeId;
    case 'impact_path_station':
      return String(receipt.consequence.threshold).padStart(3, '0');
    case 'unlocked_learning':
      return receipt.consequence.learningId;
    default:
      return receipt.id;
  }
}

function compareReceipts(
  first: CommittedRevealSourceReceipt,
  second: CommittedRevealSourceReceipt,
): number {
  const kindOrder =
    CONSEQUENCE_ORDER[first.consequence.kind] - CONSEQUENCE_ORDER[second.consequence.kind];
  if (kindOrder !== 0) return kindOrder;
  const firstKey = receiptSecondaryKey(first);
  const secondKey = receiptSecondaryKey(second);
  return firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0;
}

function normalizeReceipts(
  receipts: readonly unknown[],
  scope: ReceiptScope,
): RevealBundleResult<readonly CommittedRevealSourceReceipt[]> {
  const byId = new Map<string, CommittedRevealSourceReceipt>();
  const bySemanticKey = new Map<string, CommittedRevealSourceReceipt>();

  for (const candidate of receipts) {
    const validated = validateReceipt(candidate, scope);
    if (!validated.ok) return validated;
    const receipt = validated.data;
    const priorId = byId.get(receipt.id);
    if (priorId) {
      if (canonicalJson(priorId) !== canonicalJson(receipt)) {
        return failure('RECEIPT_CONFLICT', 'One source receipt ID has conflicting committed data');
      }
      continue;
    }

    const semanticKey = semanticReceiptKey(receipt);
    const priorSemantic = bySemanticKey.get(semanticKey);
    if (
      priorSemantic &&
      (SINGLETON_KINDS.has(receipt.consequence.kind) || priorSemantic.id !== receipt.id)
    ) {
      return failure('RECEIPT_CONFLICT', 'A consequence is supplied more than once');
    }
    byId.set(receipt.id, receipt);
    bySemanticKey.set(semanticKey, receipt);
  }

  return success(immutableCopy([...byId.values()].sort(compareReceipts)));
}

function revealBundleId(profileId: string, triggerEventId: string): string {
  return `reveal:${profileId}:${triggerEventId}`;
}

function compareBundles(first: RevealBundle, second: RevealBundle): number {
  if (first.triggeredAt !== second.triggeredAt)
    return first.triggeredAt < second.triggeredAt ? -1 : 1;
  return first.id < second.id ? -1 : first.id > second.id ? 1 : 0;
}

function validateBundle(value: unknown): RevealBundleResult<RevealBundle> {
  if (!isRecord(value) || !hasExactKeys(value, BUNDLE_KEYS)) {
    return failure('INVALID_INPUT', 'Stored RevealBundle has an invalid shape');
  }
  if (
    value.schemaVersion !== REVEAL_BUNDLE_SCHEMA_VERSION ||
    !isProfileId(value.profileId) ||
    !isNonEmptyString(value.profileEpochId) ||
    !isNonEmptyString(value.triggerEventId) ||
    !ELIGIBLE_TRIGGER_KINDS.has(value.triggerKind as EligibleRevealTriggerKind) ||
    !isIsoInstant(value.triggeredAt) ||
    !REVEAL_LIFECYCLES.has(value.lifecycle as RevealBundleLifecycle) ||
    value.audience !== 'child' ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    !isNonEmptyString(value.sourceFingerprint)
  ) {
    return failure('INVALID_INPUT', 'Stored RevealBundle metadata is invalid');
  }
  if (value.id !== revealBundleId(value.profileId, value.triggerEventId)) {
    return failure('INVALID_INPUT', 'Stored RevealBundle identity is not canonical');
  }

  const normalized = normalizeReceipts(value.items, {
    profileId: value.profileId,
    profileEpochId: value.profileEpochId,
    triggerEventId: value.triggerEventId,
    triggerKind: value.triggerKind as EligibleRevealTriggerKind,
  });
  if (!normalized.ok) return normalized;
  if (
    canonicalJson(normalized.data) !== canonicalJson(value.items) ||
    value.sourceFingerprint !== sourceFingerprint(normalized.data)
  ) {
    return failure('INVALID_INPUT', 'Stored RevealBundle source projection is not canonical');
  }
  if (
    value.triggerKind === 'learning_completion' &&
    (!normalized.data.some((receipt) => receipt.consequence.kind === 'earned_badge') ||
      normalized.data.some(
        (receipt) =>
          receipt.consequence.kind !== 'earned_badge' && receipt.consequence.kind !== 'safe_help',
      ))
  ) {
    return failure('INVALID_INPUT', 'Stored learning reveal has an ineligible consequence');
  }
  if (
    value.triggerKind === 'task_approval' &&
    !normalized.data.some((receipt) => receipt.consequence.kind === 'parent_praise')
  ) {
    return failure('INVALID_INPUT', 'Stored task-approval reveal is missing Parent praise');
  }
  return success(immutableCopy(value as unknown as RevealBundle));
}

function validateQueue(value: unknown): RevealBundleResult<RevealBundleQueue> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['schemaVersion', 'bundles']) ||
    value.schemaVersion !== REVEAL_BUNDLE_SCHEMA_VERSION ||
    !Array.isArray(value.bundles)
  ) {
    return failure('INVALID_INPUT', 'RevealBundle queue has an invalid shape');
  }
  const bundles: RevealBundle[] = [];
  const ids = new Set<string>();
  const sourceReceiptIds = new Set<string>();
  const authoritativeOutcomeKeys = new Set<string>();
  let presentingCount = 0;
  for (const candidate of value.bundles) {
    const validated = validateBundle(candidate);
    if (!validated.ok) return validated;
    if (ids.has(validated.data.id)) {
      return failure('QUEUE_CONFLICT', 'RevealBundle queue contains a duplicate identity');
    }
    ids.add(validated.data.id);
    for (const receipt of validated.data.items) {
      if (sourceReceiptIds.has(receipt.id)) {
        return failure('QUEUE_CONFLICT', 'A source receipt appears in more than one RevealBundle');
      }
      sourceReceiptIds.add(receipt.id);
      const outcomeKey = authoritativeOutcomeKey(receipt);
      if (authoritativeOutcomeKeys.has(outcomeKey)) {
        return failure(
          'QUEUE_CONFLICT',
          'An authoritative outcome appears in more than one RevealBundle',
        );
      }
      authoritativeOutcomeKeys.add(outcomeKey);
    }
    if (validated.data.lifecycle === 'presenting') presentingCount += 1;
    bundles.push(validated.data);
  }
  if (presentingCount > 1) {
    return failure('QUEUE_CONFLICT', 'Only one RevealBundle may be presenting');
  }
  const sorted = [...bundles].sort(compareBundles);
  if (canonicalJson(sorted) !== canonicalJson(bundles)) {
    return failure('QUEUE_CONFLICT', 'RevealBundle queue order is not canonical');
  }
  return success(immutableCopy({ schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION, bundles: sorted }));
}

export function createEmptyRevealBundleQueue(): RevealBundleQueue {
  return immutableCopy({
    schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION,
    bundles: [],
  });
}

function validatePresentationScope(value: unknown): RevealBundleResult<RevealPresentationScope> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['profileId', 'profileEpochId']) ||
    !isProfileId(value.profileId) ||
    !isNonEmptyString(value.profileEpochId)
  ) {
    return failure('INVALID_INPUT', 'An exact active-profile presentation scope is required');
  }
  return success(immutableCopy(value as unknown as RevealPresentationScope));
}

function authoritativeOutcomeKey(receipt: CommittedRevealSourceReceipt): string {
  const scope = `${receipt.profileId}:${receipt.profileEpochId}`;
  switch (receipt.consequence.kind) {
    case 'parent_praise':
      return `parent-praise:${scope}:${receipt.consequence.checkInId}`;
    case 'seed':
      return `seed:${scope}:${receipt.consequence.transactionId}`;
    case 'plant_stage':
      return `plant-stage:${scope}:${receipt.consequence.growthId}`;
    case 'canopy':
      return `canopy:${scope}:${receipt.consequence.contributionId}`;
    case 'green_circle':
      return `green-circle:${scope}:${receipt.consequence.eventId}`;
    case 'private_league_leaf':
      return `private-league-leaf:${scope}:${receipt.consequence.leagueReceiptId}`;
    case 'challenge_leaf':
      return `challenge-leaf:${scope}:${receipt.consequence.weekKey}:${receipt.consequence.leafId}`;
    case 'private_family_reward':
      return `private-family-reward:${scope}:${receipt.consequence.planId}:${receipt.consequence.planVersion}:${receipt.consequence.lifecycleAfter}`;
    case 'earned_badge':
      return `badge:${scope}:${receipt.consequence.badgeId}`;
    case 'impact_path_station':
      return `station:${scope}:${receipt.consequence.threshold}`;
    case 'unlocked_learning':
      return `learning:${scope}:${receipt.consequence.learningId}`;
    case 'safe_help':
      return `safe-help:${scope}:${receipt.consequence.recognitionId}`;
  }
}

function conflictsWithPriorBundle(
  queue: RevealBundleQueue,
  receipts: readonly CommittedRevealSourceReceipt[],
): boolean {
  const priorReceiptIds = new Set(
    queue.bundles.flatMap((bundle) => bundle.items.map((receipt) => receipt.id)),
  );
  const priorAuthoritativeOutcomes = new Set(
    queue.bundles.flatMap((bundle) =>
      bundle.items.map((receipt) => authoritativeOutcomeKey(receipt)),
    ),
  );
  return receipts.some((receipt) => {
    const outcomeKey = authoritativeOutcomeKey(receipt);
    return priorReceiptIds.has(receipt.id) || priorAuthoritativeOutcomes.has(outcomeKey);
  });
}

export function constructRevealBundle(
  input: unknown,
): RevealBundleResult<RevealConstructionResult> {
  if (!isRecord(input) || !hasExactKeys(input, CONSTRUCTION_KEYS)) {
    return failure(
      'INVALID_INPUT',
      'RevealBundle construction input is incomplete or has unknown fields',
    );
  }
  const queue = validateQueue(input.queue);
  if (!queue.ok) return queue;
  if (
    !isProfileId(input.profileId) ||
    !isNonEmptyString(input.profileEpochId) ||
    !isNonEmptyString(input.triggerEventId) ||
    !isIsoInstant(input.triggeredAt) ||
    !Array.isArray(input.receipts) ||
    !['task_approval', 'learning_completion', 'task_submission'].includes(
      input.triggerKind as string,
    )
  ) {
    return failure('INVALID_INPUT', 'RevealBundle construction metadata is invalid');
  }

  if (input.triggerKind === 'task_submission') {
    if (input.receipts.length > 0) {
      return failure('INELIGIBLE_TRIGGER', 'Task submission cannot carry reward receipts');
    }
    return success({
      disposition: 'not_created',
      reason: 'zero_reward_submission',
      queue: queue.data,
      bundle: null,
    });
  }

  const triggerKind = input.triggerKind as EligibleRevealTriggerKind;
  const receipts = normalizeReceipts(input.receipts, {
    profileId: input.profileId,
    profileEpochId: input.profileEpochId,
    triggerEventId: input.triggerEventId,
    triggerKind,
  });
  if (!receipts.ok) return receipts;

  if (triggerKind === 'learning_completion') {
    const hasNewEligibleOutcome = receipts.data.some(
      (receipt) => receipt.consequence.kind === 'earned_badge',
    );
    const hasIneligibleOutcome = receipts.data.some(
      (receipt) =>
        receipt.consequence.kind !== 'earned_badge' && receipt.consequence.kind !== 'safe_help',
    );
    if (hasIneligibleOutcome) {
      return failure(
        'INELIGIBLE_TRIGGER',
        'Learning completion cannot carry task reward consequences',
      );
    }
    if (!hasNewEligibleOutcome) {
      return success({
        disposition: 'not_created',
        reason: 'learning_without_new_outcome',
        queue: queue.data,
        bundle: null,
      });
    }
  } else if (receipts.data.length === 0) {
    return success({
      disposition: 'not_created',
      reason: 'no_presentable_consequence',
      queue: queue.data,
      bundle: null,
    });
  } else if (!receipts.data.some((receipt) => receipt.consequence.kind === 'parent_praise')) {
    return failure('RECEIPT_CONFLICT', 'Task-approval reveal requires its committed Parent praise');
  }

  const id = revealBundleId(input.profileId, input.triggerEventId);
  const fingerprint = sourceFingerprint(receipts.data);
  const existing = queue.data.bundles.find((bundle) => bundle.id === id);
  if (existing) {
    if (
      existing.profileEpochId !== input.profileEpochId ||
      existing.triggerKind !== triggerKind ||
      existing.triggeredAt !== input.triggeredAt ||
      existing.sourceFingerprint !== fingerprint ||
      canonicalJson(existing.items) !== canonicalJson(receipts.data)
    ) {
      return failure(
        'BUNDLE_CONFLICT',
        'RevealBundle identity already has different source evidence',
      );
    }
    return success({ disposition: 'already_exists', queue: queue.data, bundle: existing });
  }
  if (conflictsWithPriorBundle(queue.data, receipts.data)) {
    return failure(
      'RECEIPT_CONFLICT',
      'A source receipt or authoritative outcome was already projected by another trigger',
    );
  }

  const bundle: RevealBundle = immutableCopy({
    id,
    schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION,
    profileId: input.profileId,
    profileEpochId: input.profileEpochId,
    triggerEventId: input.triggerEventId,
    triggerKind,
    triggeredAt: input.triggeredAt,
    lifecycle: 'ready',
    sourceFingerprint: fingerprint,
    items: receipts.data,
    audience: 'child',
  });
  const nextQueue: RevealBundleQueue = immutableCopy({
    schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION,
    bundles: [...queue.data.bundles, bundle].sort(compareBundles),
  });
  return success({ disposition: 'created', queue: nextQueue, bundle });
}

export function selectVisibleRevealBundle(
  queueInput: unknown,
  scopeInput: unknown,
): RevealBundleResult<RevealBundle | null> {
  const queue = validateQueue(queueInput);
  if (!queue.ok) return queue;
  const scope = validatePresentationScope(scopeInput);
  if (!scope.ok) return scope;
  return success(
    queue.data.bundles.find(
      (bundle) =>
        bundle.lifecycle === 'presenting' &&
        bundle.profileId === scope.data.profileId &&
        bundle.profileEpochId === scope.data.profileEpochId,
    ) ?? null,
  );
}

function replaceBundle(queue: RevealBundleQueue, replacement: RevealBundle): RevealBundleQueue {
  return immutableCopy({
    schemaVersion: REVEAL_BUNDLE_SCHEMA_VERSION,
    bundles: queue.bundles
      .map((bundle) => (bundle.id === replacement.id ? replacement : bundle))
      .sort(compareBundles),
  });
}

export function startOrResumeNextReveal(
  queueInput: unknown,
  scopeInput: unknown,
): RevealBundleResult<RevealPresentationResult> {
  const queue = validateQueue(queueInput);
  if (!queue.ok) return queue;
  const scope = validatePresentationScope(scopeInput);
  if (!scope.ok) return scope;
  const presenting = queue.data.bundles.find((bundle) => bundle.lifecycle === 'presenting');
  if (presenting) {
    if (presenting.profileId !== scope.data.profileId) {
      return failure('PROFILE_SCOPE_MISMATCH', 'Another profile owns the current reveal');
    }
    if (presenting.profileEpochId !== scope.data.profileEpochId) {
      return failure('EPOCH_SCOPE_MISMATCH', 'Another profile epoch owns the current reveal');
    }
    return success({ disposition: 'resumed', queue: queue.data, bundle: presenting });
  }
  const next = queue.data.bundles.find(
    (bundle) =>
      bundle.lifecycle === 'ready' &&
      bundle.profileId === scope.data.profileId &&
      bundle.profileEpochId === scope.data.profileEpochId,
  );
  if (!next) return success({ disposition: 'empty', queue: queue.data, bundle: null });
  const started = immutableCopy({ ...next, lifecycle: 'presenting' as const });
  return success({
    disposition: 'started',
    queue: replaceBundle(queue.data, started),
    bundle: started,
  });
}

export function startOrResumeRevealById(
  queueInput: unknown,
  bundleId: unknown,
  scopeInput: unknown,
): RevealBundleResult<RevealPresentationResult> {
  if (!isNonEmptyString(bundleId)) {
    return failure('INVALID_INPUT', 'RevealBundle ID is required');
  }
  const queue = validateQueue(queueInput);
  if (!queue.ok) return queue;
  const scope = validatePresentationScope(scopeInput);
  if (!scope.ok) return scope;
  const requested = queue.data.bundles.find((bundle) => bundle.id === bundleId);
  if (!requested) return failure('BUNDLE_NOT_FOUND', 'RevealBundle does not exist');
  if (requested.profileId !== scope.data.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'RevealBundle belongs to another profile');
  }
  if (requested.profileEpochId !== scope.data.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'RevealBundle belongs to another profile epoch');
  }

  const presenting = queue.data.bundles.find((bundle) => bundle.lifecycle === 'presenting');
  if (presenting) {
    if (presenting.id !== requested.id) {
      return failure('QUEUE_CONFLICT', 'Another RevealBundle is already presenting');
    }
    return success({ disposition: 'resumed', queue: queue.data, bundle: presenting });
  }
  if (requested.lifecycle !== 'ready') {
    return failure('INVALID_TRANSITION', 'Only a ready RevealBundle may begin presentation');
  }
  const next = queue.data.bundles.find(
    (bundle) =>
      bundle.lifecycle === 'ready' &&
      bundle.profileId === scope.data.profileId &&
      bundle.profileEpochId === scope.data.profileEpochId,
  );
  if (next?.id !== requested.id) {
    return failure('QUEUE_CONFLICT', 'Requested RevealBundle is not next in canonical order');
  }
  const started = immutableCopy({ ...requested, lifecycle: 'presenting' as const });
  return success({
    disposition: 'started',
    queue: replaceBundle(queue.data, started),
    bundle: started,
  });
}

function transitionBundle(
  queueInput: unknown,
  bundleId: unknown,
  scopeInput: unknown,
  expected: RevealBundleLifecycle,
  target: RevealBundleLifecycle,
  alreadyProgressed: readonly RevealBundleLifecycle[] = [],
): RevealBundleResult<RevealLifecycleResult> {
  if (!isNonEmptyString(bundleId)) {
    return failure('INVALID_INPUT', 'RevealBundle ID is required');
  }
  const queue = validateQueue(queueInput);
  if (!queue.ok) return queue;
  const scope = validatePresentationScope(scopeInput);
  if (!scope.ok) return scope;
  const bundle = queue.data.bundles.find((candidate) => candidate.id === bundleId);
  if (!bundle) return failure('BUNDLE_NOT_FOUND', 'RevealBundle does not exist');
  if (bundle.profileId !== scope.data.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'RevealBundle belongs to another profile');
  }
  if (bundle.profileEpochId !== scope.data.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'RevealBundle belongs to another profile epoch');
  }
  if (bundle.lifecycle === target || alreadyProgressed.includes(bundle.lifecycle)) {
    return success({ disposition: 'already_at_state', queue: queue.data, bundle });
  }
  if (bundle.lifecycle !== expected) {
    return failure(
      'INVALID_TRANSITION',
      `RevealBundle cannot move from ${bundle.lifecycle} to ${target}`,
    );
  }
  const transitioned = immutableCopy({ ...bundle, lifecycle: target });
  return success({
    disposition: 'transitioned',
    queue: replaceBundle(queue.data, transitioned),
    bundle: transitioned,
  });
}

export function acknowledgeRevealBundle(
  queue: unknown,
  bundleId: unknown,
  scope: unknown,
): RevealBundleResult<RevealLifecycleResult> {
  return transitionBundle(queue, bundleId, scope, 'presenting', 'acknowledged', ['archived']);
}

export function archiveRevealBundle(
  queue: unknown,
  bundleId: unknown,
  scope: unknown,
): RevealBundleResult<RevealLifecycleResult> {
  return transitionBundle(queue, bundleId, scope, 'acknowledged', 'archived');
}
