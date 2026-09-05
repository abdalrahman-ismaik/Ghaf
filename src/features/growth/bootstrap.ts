import type {
  PrototypeSession,
  RecognitionReceipt,
  SyntheticChildId,
} from '../../models/familyGrowth';
import {
  SCHEMA3_R002A_FIXTURE_VERSION,
  type ProgressionResult,
  type SeedLedgerState,
  type WaterAndCoastPathProjection,
} from '../../models/growthJourney';
import {
  auditSchema3SeedState,
  createEmptySeedLedger,
  normalizeSchema3SeedLedger,
  projectRecognitionSeedEntry,
  projectWaterAndCoastPath,
  selectLifetimeSeeds,
} from './seedLedger';

const PROFILE_IDS = ['child_salem', 'child_alya'] as const;
const SYNTHETIC_MIGRATION_TIME = '2026-09-05T08:00:00.000Z';
const VALID_FIXED_SEED_AWARDS = new Set<number>([4, 6, 8, 12, 15]);

export interface GrowthJourneyRuntimeState {
  readonly resetSequence: number;
  readonly ledgersByProfile: Readonly<Record<SyntheticChildId, SeedLedgerState>>;
}

export interface GrowthJourneyProfileProjection {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly lifetimeSeeds: number;
  readonly path: WaterAndCoastPathProjection;
  readonly ledger: SeedLedgerState;
}

export interface GrowthJourneyRecognitionProjection {
  readonly disposition: 'projected' | 'already_projected' | 'not_applicable';
  readonly runtime: GrowthJourneyRuntimeState;
}

function failure<T>(
  message: string,
  code: 'INVALID_INPUT' | 'FIXTURE_EVIDENCE_MISMATCH' = 'FIXTURE_EVIDENCE_MISMATCH',
): ProgressionResult<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function epochId(profileId: SyntheticChildId, resetSequence: number): string {
  return `prototype-reset-${String(resetSequence).padStart(4, '0')}:${profileId}`;
}

function freezeRuntime(input: {
  readonly resetSequence: number;
  readonly ledgersByProfile: Record<SyntheticChildId, SeedLedgerState>;
}): GrowthJourneyRuntimeState {
  return Object.freeze({
    resetSequence: input.resetSequence,
    ledgersByProfile: Object.freeze({ ...input.ledgersByProfile }),
  });
}

function sameReceipt(left: RecognitionReceipt, right: RecognitionReceipt): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCanonicalMangroveArchiveTransition(receipt: RecognitionReceipt): boolean {
  const growth = receipt.landscapeGrowth;
  return (
    growth?.landscapeId === 'mangrove' &&
    growth.seedsBefore === 48 &&
    growth.seedsAfter === 60 &&
    growth.stageBefore === 'shoot' &&
    growth.stageAfter === 'sapling' &&
    growth.crossedThreshold === 60 &&
    growth.symbolicOnly === true
  );
}

export function createGrowthJourneyRuntime(
  session: PrototypeSession,
  resetSequence: number,
): ProgressionResult<GrowthJourneyRuntimeState> {
  if (
    !isRecord(session) ||
    !isRecord(session.children) ||
    !isRecord(session.landscapeProgress) ||
    !isRecord(session.landscapeProgress.mangrove) ||
    !isRecord(session.recognitionLedger) ||
    !Number.isSafeInteger(resetSequence) ||
    resetSequence < 0
  ) {
    return failure(
      'A complete Schema-3 reset session and valid reset sequence are required',
      'INVALID_INPUT',
    );
  }

  const ledgers = {} as Record<SyntheticChildId, SeedLedgerState>;
  for (const profileId of PROFILE_IDS) {
    const child = session.children[profileId];
    if (!child) return failure(`Synthetic profile ${profileId} is missing`);

    const profileEpochId = epochId(profileId, resetSequence);
    const audit = auditSchema3SeedState({
      schemaVersion: session.schemaVersion,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      persistence: 'synthetic_in_memory',
      profileId,
      activeProfileId: profileId,
      profileEpochId,
      activeResetEpochId: profileEpochId,
      profileOrigin: child.origin,
      openingEarnedSeeds: child.earnedSeeds,
      recognitionLedgerEntryCount: Object.keys(session.recognitionLedger).length,
      mangroveProgress:
        profileId === 'child_salem'
          ? {
              landscapeId: 'mangrove',
              cumulativeSeeds: session.landscapeProgress.mangrove.cumulativeSeeds,
              stage: session.landscapeProgress.mangrove.stage,
              nextThreshold: session.landscapeProgress.mangrove.nextThreshold,
            }
          : null,
    });
    if (!audit.ok) return audit;

    const empty = createEmptySeedLedger({ profileId, profileEpochId });
    if (!empty.ok) return empty;
    const normalized = normalizeSchema3SeedLedger({
      audit: audit.data,
      ledger: empty.data,
      appliedAt: SYNTHETIC_MIGRATION_TIME,
    });
    if (!normalized.ok) return normalized;
    ledgers[profileId] = normalized.data.ledger;
  }

  return {
    ok: true,
    data: freezeRuntime({ resetSequence, ledgersByProfile: ledgers }),
  };
}

export function selectGrowthJourneyProfile(
  runtime: GrowthJourneyRuntimeState,
  profileId: SyntheticChildId,
): ProgressionResult<GrowthJourneyProfileProjection> {
  if (
    !isRecord(runtime) ||
    !Number.isSafeInteger(runtime.resetSequence) ||
    runtime.resetSequence < 0 ||
    !isRecord(runtime.ledgersByProfile)
  ) {
    return failure('Growth Journey runtime state is incomplete', 'INVALID_INPUT');
  }
  const ledger = runtime.ledgersByProfile[profileId];
  if (!ledger) {
    return { ok: false, error: { code: 'UNSUPPORTED_PROFILE', message: 'Profile is missing' } };
  }
  const lifetime = selectLifetimeSeeds(ledger, profileId, ledger.profileEpochId);
  if (!lifetime.ok) return lifetime;
  const path = projectWaterAndCoastPath(lifetime.data);
  if (!path.ok) return path;
  return {
    ok: true,
    data: Object.freeze({
      profileId,
      profileEpochId: ledger.profileEpochId,
      lifetimeSeeds: lifetime.data,
      path: path.data,
      ledger,
    }),
  };
}

export function projectRecognitionIntoGrowthJourney(input: {
  readonly runtime: GrowthJourneyRuntimeState;
  readonly previousSession: PrototypeSession;
  readonly nextSession: PrototypeSession;
  readonly receipt: RecognitionReceipt;
  readonly committedAt: string;
}): ProgressionResult<GrowthJourneyRecognitionProjection> {
  if (
    !isRecord(input) ||
    !isRecord(input.runtime) ||
    !isRecord(input.previousSession) ||
    !isRecord(input.nextSession) ||
    !isRecord(input.receipt) ||
    typeof input.committedAt !== 'string'
  ) {
    return failure('Complete recognition projection evidence is required', 'INVALID_INPUT');
  }
  const transaction = input.receipt.seedTransaction;
  if (transaction === null) {
    return {
      ok: true,
      data: Object.freeze({ disposition: 'not_applicable', runtime: input.runtime }),
    };
  }

  const profileId = transaction.childId;
  const ledger = input.runtime.ledgersByProfile[profileId];
  const previousChild = input.previousSession.children[profileId];
  const nextChild = input.nextSession.children[profileId];
  const previouslyCommitted = input.previousSession.recognitionLedger[input.receipt.recognitionKey];
  const nextCommitted = input.nextSession.recognitionLedger[input.receipt.recognitionKey];
  if (
    !ledger ||
    !previousChild ||
    !nextChild ||
    transaction.recognitionKey !== input.receipt.recognitionKey ||
    !VALID_FIXED_SEED_AWARDS.has(transaction.amount) ||
    transaction.balanceAfter !== transaction.balanceBefore + transaction.amount ||
    nextChild.earnedSeeds !== transaction.balanceAfter ||
    (previouslyCommitted
      ? previousChild.earnedSeeds !== transaction.balanceAfter ||
        !sameReceipt(previouslyCommitted, input.receipt)
      : previousChild.earnedSeeds !== transaction.balanceBefore) ||
    !nextCommitted ||
    !sameReceipt(nextCommitted, input.receipt)
  ) {
    return failure('Recognition receipt does not reconcile with the authoritative sessions');
  }

  const growth = input.receipt.landscapeGrowth;
  if (growth) {
    const previousLandscape = input.previousSession.landscapeProgress[growth.landscapeId];
    const nextLandscape = input.nextSession.landscapeProgress[growth.landscapeId];
    if (
      !previousLandscape ||
      !nextLandscape ||
      nextLandscape.cumulativeSeeds !== growth.seedsAfter ||
      nextLandscape.stage !== growth.stageAfter ||
      (previouslyCommitted
        ? previousLandscape.cumulativeSeeds !== growth.seedsAfter ||
          previousLandscape.stage !== growth.stageAfter
        : previousLandscape.cumulativeSeeds !== growth.seedsBefore ||
          previousLandscape.stage !== growth.stageBefore)
    ) {
      return failure('Landscape receipt does not reconcile with the authoritative sessions');
    }
  }

  const requiresMangroveArchive =
    profileId === 'child_salem' &&
    transaction.balanceBefore === 48 &&
    transaction.balanceAfter === 60;
  if (requiresMangroveArchive && !isCanonicalMangroveArchiveTransition(input.receipt)) {
    return failure('The canonical 48-to-60 approval requires its Mangrove stage transition');
  }

  const projected = projectRecognitionSeedEntry({
    ledger,
    profileId,
    profileEpochId: ledger.profileEpochId,
    triggerEventId: input.receipt.recognitionKey,
    recognitionKey: input.receipt.recognitionKey,
    seedTransactionId: transaction.id,
    amount: transaction.amount,
    committedAt: input.committedAt,
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    mangroveTransition: isCanonicalMangroveArchiveTransition(input.receipt)
      ? {
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          crossedThreshold: 60,
          symbolicOnly: true,
        }
      : null,
  });
  if (!projected.ok) return projected;

  const nextRuntime =
    projected.data.ledger === ledger
      ? input.runtime
      : freezeRuntime({
          resetSequence: input.runtime.resetSequence,
          ledgersByProfile: {
            ...input.runtime.ledgersByProfile,
            [profileId]: projected.data.ledger,
          },
        });
  return {
    ok: true,
    data: Object.freeze({
      disposition: projected.data.disposition,
      runtime: nextRuntime,
    }),
  };
}

function resetSessionFromRecognized(
  session: PrototypeSession,
  receipt: RecognitionReceipt,
): ProgressionResult<PrototypeSession> {
  const transaction = receipt.seedTransaction;
  if (
    transaction?.childId !== 'child_salem' ||
    transaction.balanceBefore !== 48 ||
    transaction.balanceAfter !== 60 ||
    session.children.child_salem.earnedSeeds !== 60 ||
    session.children.child_alya.earnedSeeds !== 36 ||
    session.landscapeProgress.mangrove.cumulativeSeeds !== 60 ||
    !isCanonicalMangroveArchiveTransition(receipt)
  ) {
    return failure('Recognized session does not preserve the canonical synthetic receipt chain');
  }
  return {
    ok: true,
    data: {
      ...session,
      children: {
        ...session.children,
        child_salem: { ...session.children.child_salem, earnedSeeds: 48 },
      },
      landscapeProgress: {
        ...session.landscapeProgress,
        mangrove: {
          landscapeId: 'mangrove',
          cumulativeSeeds: 48,
          stage: 'shoot',
          nextThreshold: 60,
        },
      },
      recognitionLedger: {},
      celebration: { available: false, consumed: false },
    },
  };
}

export function rehydrateGrowthJourneyRuntime(input: {
  readonly session: PrototypeSession;
  readonly savedRuntime: GrowthJourneyRuntimeState | null;
  readonly resetSequence: number;
}): ProgressionResult<GrowthJourneyRuntimeState> {
  if (
    !isRecord(input) ||
    !isRecord(input.session) ||
    !isRecord(input.session.children) ||
    !isRecord(input.session.landscapeProgress) ||
    !isRecord(input.session.landscapeProgress.mangrove) ||
    !isRecord(input.session.recognitionLedger) ||
    (input.savedRuntime !== null && !isRecord(input.savedRuntime)) ||
    !Number.isSafeInteger(input.resetSequence) ||
    input.resetSequence < 0
  ) {
    return failure('Complete Growth Journey restoration evidence is required', 'INVALID_INPUT');
  }
  if (input.savedRuntime !== null && input.savedRuntime.resetSequence !== input.resetSequence) {
    return failure('Saved Growth Journey reset epoch does not match restoration authority');
  }
  const receipts = Object.values(input.session.recognitionLedger);
  if (receipts.length === 0) {
    if (input.savedRuntime === null) {
      return createGrowthJourneyRuntime(input.session, input.resetSequence);
    }
    const salem = selectGrowthJourneyProfile(input.savedRuntime, 'child_salem');
    const alya = selectGrowthJourneyProfile(input.savedRuntime, 'child_alya');
    if (
      !salem.ok ||
      !alya.ok ||
      salem.data.lifetimeSeeds !== 108 ||
      alya.data.lifetimeSeeds !== 36 ||
      salem.data.ledger.entries.some((entry) => entry.kind === 'task_recognition') ||
      salem.data.ledger.plantStageArchives.length !== 0 ||
      input.session.children.child_salem.earnedSeeds !== 48 ||
      input.session.landscapeProgress.mangrove.cumulativeSeeds !== 48
    ) {
      return failure('Saved opening state does not reconcile with the Schema-3 session');
    }
    return { ok: true, data: input.savedRuntime };
  }
  if (receipts.length !== 1) {
    return failure('This synthetic restoration boundary supports one canonical approval receipt');
  }
  const receipt = receipts[0];
  if (!receipt) return failure('Recognition receipt is missing');
  const committedAt = input.session.journey?.checkIn?.praisePresentedAt;
  if (
    input.session.journey?.lifecycle !== 'recognized' ||
    input.session.journey.submission === null ||
    receipt.recognitionKey !== `recognition:${input.session.journey.submission.id}` ||
    typeof committedAt !== 'string'
  ) {
    return failure('Recognized restoration requires its exact journey and praise evidence');
  }
  const resetSession = resetSessionFromRecognized(input.session, receipt);
  if (!resetSession.ok) return resetSession;
  if (input.savedRuntime !== null) {
    const alya = selectGrowthJourneyProfile(input.savedRuntime, 'child_alya');
    if (!alya.ok || alya.data.lifetimeSeeds !== 36) {
      return failure('Saved recognition state does not preserve Alya profile isolation');
    }
  }
  const baseRuntime =
    input.savedRuntime === null
      ? createGrowthJourneyRuntime(resetSession.data, input.resetSequence)
      : ({ ok: true, data: input.savedRuntime } as const);
  if (!baseRuntime.ok) return baseRuntime;
  const projected = projectRecognitionIntoGrowthJourney({
    runtime: baseRuntime.data,
    previousSession: resetSession.data,
    nextSession: input.session,
    receipt,
    committedAt,
  });
  return projected.ok ? { ok: true, data: projected.data.runtime } : projected;
}
