import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type AccessCapabilityTruth,
  type ChildAccessSession,
  type ParentAccessSession,
} from '../../models/access';
import type {
  DomainErrorCode,
  PrototypeSession,
  SyntheticChildId,
} from '../../models/familyGrowth';
import type {
  ChallengeLeafCandidate,
  FamilyLeagueWeek,
  LeagueParticipantId,
  LeagueParticipantProjection,
  PreparedLeagueEncouragementId,
} from '../../models/familyLeague';
import type {
  FamilyRewardEligibilityEvent,
  PrivateFamilyRewardView,
} from '../../models/familyReward';
import { SYNTHETIC_LEAGUE_PARTICIPANTS } from '../league';
import { resources } from '../../i18n/resources';
import {
  createFeature003ServiceRegistry,
  type Feature003ServiceRegistry,
  type ServiceResult,
} from '../../services';

const ACCESS_TRUTH: AccessCapabilityTruth = 'local_prototype_not_authentication';
const CONTROL_BASE_TIME = '2026-09-02T10:00:00.000Z';
const PREPARED_REWARD_PROMISED_AT = '2026-08-26T09:00:00.000Z';
const PREPARED_REWARD_ID = 'family_reward_salem_nature_outing_v1';
const PREPARED_WEEK_KEY = '2026-W36';
const CHILD_IDS: readonly SyntheticChildId[] = ['child_salem', 'child_alya'];

type FamilyExperienceErrorCode = DomainErrorCode | 'NOT_AUTHORIZED';

export interface FamilyExperienceError {
  readonly code: FamilyExperienceErrorCode;
  readonly message: string;
}

export type FamilyExperienceResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: FamilyExperienceError };

export type FamilyExperienceEntry =
  | {
      readonly role: 'parent';
      readonly origin: 'synthetic';
      readonly capabilityTruth: AccessCapabilityTruth;
    }
  | {
      readonly role: 'child';
      readonly childId: SyntheticChildId;
      readonly origin: 'synthetic';
      readonly capabilityTruth: AccessCapabilityTruth;
    };

export interface FamilyAccessChildPresentation {
  readonly childId: SyntheticChildId;
  readonly pairingStatus: 'paired' | 'revoked';
}

export interface FamilyAccessPresentation {
  readonly children: readonly FamilyAccessChildPresentation[];
  readonly origin: 'synthetic_local';
  readonly capabilityTruth: AccessCapabilityTruth;
}

export interface FamilyLeaguePresentation {
  readonly weekKey: string;
  readonly participants: readonly LeagueParticipantProjection[];
  readonly cooperativeConfirmedCount: number;
  readonly cooperativeGoal: number;
  readonly assignedLeafCount: number;
  readonly preparedEncouragementCount: number;
  readonly origin: 'synthetic_local';
}

export interface FamilyExperiencePresentation {
  readonly activeEntry: FamilyExperienceEntry | null;
  readonly access: FamilyAccessPresentation;
  readonly reward: PrivateFamilyRewardView | null;
  readonly league: FamilyLeaguePresentation | null;
}

export interface FamilyExperienceController {
  getPresentation(): FamilyExperiencePresentation;
  enterParent(): FamilyExperienceResult<FamilyExperiencePresentation>;
  enterChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation>;
  revokeChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation>;
  restoreChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation>;
  createPreparedReward(): FamilyExperienceResult<FamilyExperiencePresentation>;
  markPreparedRewardGiven(): FamilyExperienceResult<FamilyExperiencePresentation>;
  startPreparedLeague(): FamilyExperienceResult<FamilyExperiencePresentation>;
  syncRecognizedJourney(
    session: PrototypeSession,
  ): FamilyExperienceResult<FamilyExperiencePresentation>;
  sendPreparedEncouragement(
    recipientId: LeagueParticipantId,
    phraseId: PreparedLeagueEncouragementId,
  ): FamilyExperienceResult<FamilyExperiencePresentation>;
  reset(): FamilyExperiencePresentation;
}

interface ChildAccessRecord {
  readonly childId: SyntheticChildId;
  readonly generation: number;
  readonly pairingStatus: 'paired' | 'revoked';
  readonly session: ChildAccessSession | null;
}

type ActiveAccess =
  | { readonly role: 'parent'; readonly session: ParentAccessSession }
  | {
      readonly role: 'child';
      readonly childId: SyntheticChildId;
      readonly session: ChildAccessSession;
    }
  | null;

interface VerifiedRecognition {
  readonly event: FamilyRewardEligibilityEvent;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly childId: SyntheticChildId;
  readonly completionMode: 'independent' | 'permitted_help';
}

interface ControllerRuntime {
  readonly services: Feature003ServiceRegistry;
  readonly parentSession: ParentAccessSession;
  readonly children: Readonly<Record<SyntheticChildId, ChildAccessRecord>>;
  readonly activeAccess: ActiveAccess;
  readonly rewardPlanId: string | null;
  readonly leagueWeek: FamilyLeagueWeek | null;
  readonly verifiedRecognition: VerifiedRecognition | null;
  readonly actionSequence: number;
}

function success<T>(data: T): FamilyExperienceResult<T> {
  return { ok: true, data };
}

function failure(code: FamilyExperienceErrorCode, message: string): FamilyExperienceResult<never> {
  return { ok: false, error: { code, message } };
}

function fromServiceFailure<T>(result: ServiceResult<T>): FamilyExperienceResult<never> {
  return result.ok
    ? failure('INVALID_RESPONSE', 'Expected the service operation to fail')
    : failure(result.error.code, result.error.message);
}

function unwrapService<T>(result: ServiceResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function childDeviceId(childId: SyntheticChildId, generation: number): string {
  return `family_experience_${childId}_device_${generation}`;
}

function childPairingId(childId: SyntheticChildId, generation: number): string {
  return `family_experience_${childId}_pairing_${generation}`;
}

function childSessionId(childId: SyntheticChildId, generation: number): string {
  return `family_experience_${childId}_session_${generation}`;
}

function pairChild(
  services: Feature003ServiceRegistry,
  parentSession: ParentAccessSession,
  childId: SyntheticChildId,
  generation: number,
  now: string,
): ChildAccessRecord {
  const requestId = childPairingId(childId, generation);
  const deviceId = childDeviceId(childId, generation);
  const pairingCode = `synthetic-code-${requestId}`;
  const request = unwrapService(
    services.access.requestPairing({
      requestId,
      pairingCode,
      childId,
      requestingDeviceId: deviceId,
      now,
    }),
  );
  unwrapService(
    services.access.approvePairing({
      requestId: request.id,
      childId,
      requestingDeviceId: deviceId,
      parentSession,
      now,
    }),
  );
  const session = unwrapService(
    services.access.consumePairing({
      requestId: request.id,
      pairingCode,
      childId,
      deviceId,
      childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[childId].fixtureId,
      sessionId: childSessionId(childId, generation),
      now,
    }),
  );
  return { childId, generation, pairingStatus: 'paired', session };
}

function createRuntime(): ControllerRuntime {
  const services = createFeature003ServiceRegistry();
  const parentSession = unwrapService(
    services.access.signInParent({
      sessionId: 'family_experience_parent_session',
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: 'family_experience_parent_device',
      now: CONTROL_BASE_TIME,
    }),
  );
  return {
    services,
    parentSession,
    children: {
      child_salem: pairChild(services, parentSession, 'child_salem', 0, CONTROL_BASE_TIME),
      child_alya: pairChild(services, parentSession, 'child_alya', 0, CONTROL_BASE_TIME),
    },
    activeAccess: null,
    rewardPlanId: null,
    leagueWeek: null,
    verifiedRecognition: null,
    actionSequence: 0,
  };
}

function safeContent() {
  return {
    prayer: false,
    kinship: false,
    affection: false,
    emotionalDisclosure: false,
    relationshipCloseness: false,
    foodConsumption: false,
    privateWellbeing: false,
    hygiene: false,
    disabilityRelatedRoutine: false,
  } as const;
}

function preparedLeaves(): readonly ChallengeLeafCandidate[] {
  return SYNTHETIC_LEAGUE_PARTICIPANTS.flatMap((participant) =>
    Array.from({ length: 5 }, (_, offset) => {
      const number = offset + 1;
      const canonicalSalemLeaf = participant.id === 'child_salem' && number === 1;
      return {
        id: `family_league_leaf_${participant.id}_${number}`,
        participantId: participant.id,
        ageBands: [participant.ageBand],
        approvedTaskRef: {
          taskId: canonicalSalemLeaf
            ? 'task_recycling_p0_v1'
            : `task_family_league_${participant.id}_${number}`,
          taskVersion: 1,
        },
        categoryId: 'green_impact',
        visibilityScope: 'household',
        parentApproved: true,
        accessibilityAdaptable: true,
        protectedContent: safeContent(),
      } satisfies ChallengeLeafCandidate;
    }),
  );
}

function deriveVerifiedRecognition(
  services: Feature003ServiceRegistry,
  session: PrototypeSession,
): FamilyExperienceResult<VerifiedRecognition> {
  const validSession = services.prototypeSession.validateSession(session);
  if (!validSession.ok) return fromServiceFailure(validSession);
  const journey = session.journey;
  if (
    journey?.lifecycle !== 'recognized' ||
    journey.task.id !== 'task_recycling_p0_v1' ||
    journey.task.version !== 1 ||
    journey.task.targetChildId !== 'child_salem' ||
    journey.task.content.categoryId !== 'green_impact' ||
    journey.task.content.landscapeId !== 'mangrove' ||
    journey.task.content.recognitionMode !== 'standard' ||
    journey.task.content.routinePhase !== 'acquisition' ||
    journey.task.content.visibilityScope !== 'household' ||
    journey.task.content.circleEligible !== true ||
    journey.task.content.displayedSeedAward !== 12 ||
    !journey.assignment ||
    journey.assignment.taskId !== journey.task.id ||
    journey.assignment.taskVersion !== journey.task.version ||
    journey.assignment.childId !== journey.task.targetChildId ||
    journey.assignment.approvedByParent !== true ||
    !journey.submission ||
    journey.submission.assignmentId !== journey.assignment.id ||
    journey.submission.taskVersion !== journey.task.version ||
    !['independent', 'permitted_help'].includes(journey.submission.completionMode) ||
    !journey.checkIn ||
    journey.checkIn.submissionId !== journey.submission.id ||
    journey.checkIn.decision !== 'confirm' ||
    journey.checkIn.confirmationPresentation !== 'recognition_applied' ||
    !journey.checkIn.praise ||
    !journey.checkIn.praise.ar.trim() ||
    !journey.checkIn.praise.en.trim() ||
    !journey.checkIn.praisePresentedAt ||
    !Number.isFinite(Date.parse(journey.checkIn.praisePresentedAt)) ||
    journey.checkIn.recognitionKey !== `recognition:${journey.submission.id}`
  ) {
    return failure('INVALID_RESPONSE', 'Only the canonical recognized task journey can be synced');
  }

  const recognitionKey = journey.checkIn.recognitionKey;
  const receipt = session.recognitionLedger[recognitionKey];
  if (
    !receipt ||
    receipt.recognitionKey !== recognitionKey ||
    receipt.checkInId !== journey.checkIn.id ||
    !receipt.seedTransaction ||
    receipt.seedTransaction.recognitionKey !== recognitionKey ||
    receipt.seedTransaction.childId !== journey.assignment.childId ||
    receipt.seedTransaction.amount !== 12 ||
    receipt.seedTransaction.balanceBefore !== 48 ||
    receipt.seedTransaction.balanceAfter !== 60 ||
    receipt.seedTransaction.meaning !== 'symbolic_nonfinancial' ||
    !receipt.landscapeGrowth ||
    receipt.landscapeGrowth.landscapeId !== 'mangrove' ||
    receipt.landscapeGrowth.seedsBefore !== receipt.seedTransaction.balanceBefore ||
    receipt.landscapeGrowth.seedsAfter !== receipt.seedTransaction.balanceAfter ||
    receipt.landscapeGrowth.stageBefore !== 'shoot' ||
    receipt.landscapeGrowth.stageAfter !== 'sapling' ||
    receipt.landscapeGrowth.crossedThreshold !== 60 ||
    receipt.landscapeGrowth.symbolicOnly !== true ||
    receipt.canopyContribution?.actionKind !== 'eligible_household_acquisition' ||
    receipt.canopyContribution.leafDelta !== 1 ||
    receipt.canopyContribution.origin !== 'synthetic' ||
    receipt.circleEvent?.actionKind !== 'eligible_green_action' ||
    receipt.circleEvent.actionDelta !== 1 ||
    receipt.circleEvent.sourceScope !== 'household' ||
    receipt.circleEvent.origin !== 'synthetic_local' ||
    session.children.child_salem.earnedSeeds !== receipt.seedTransaction.balanceAfter ||
    session.landscapeProgress.mangrove.cumulativeSeeds !== receipt.landscapeGrowth.seedsAfter ||
    session.landscapeProgress.mangrove.stage !== receipt.landscapeGrowth.stageAfter ||
    session.household.combinedCanopy.contributionLeaves !== 20 ||
    session.circleGoal.eligibleGreenActions !== 12
  ) {
    return failure(
      'INVALID_RESPONSE',
      'The stored recognition receipt does not match the canonical journey and progress',
    );
  }

  return success({
    taskId: journey.task.id,
    taskVersion: journey.task.version,
    childId: journey.assignment.childId,
    completionMode: journey.submission.completionMode,
    event: {
      id: `family_reward_event:${recognitionKey}`,
      recognitionKey,
      childId: journey.assignment.childId,
      categoryId: journey.task.content.categoryId,
      activityKind: 'general',
      recognitionMode: journey.task.content.recognitionMode,
      routinePhase: journey.task.content.routinePhase,
      eligibleSeedDelta: receipt.seedTransaction.amount,
      landscapeTransition: {
        landscapeId: receipt.landscapeGrowth.landscapeId,
        stageBefore: receipt.landscapeGrowth.stageBefore,
        stageAfter: receipt.landscapeGrowth.stageAfter,
      },
      occurredAt: journey.checkIn.praisePresentedAt,
      prerequisites: {
        parentConfirmationRecorded: true,
        praisePresented: true,
        gardenRecognitionApplied: true,
      },
    },
  });
}

class PrivateFamilyExperienceController implements FamilyExperienceController {
  #runtime: ControllerRuntime = createRuntime();

  getPresentation(): FamilyExperiencePresentation {
    return this.#projectPresentation();
  }

  enterParent(): FamilyExperienceResult<FamilyExperiencePresentation> {
    const now = this.#nextTime();
    const authorized = this.#runtime.services.access.authorizeCapability({
      session: this.#runtime.parentSession,
      capability: 'enter_parent_experience',
      now,
    });
    if (!authorized.ok) return fromServiceFailure(authorized);
    this.#runtime = {
      ...this.#runtime,
      activeAccess: { role: 'parent', session: this.#runtime.parentSession },
    };
    return success(this.#projectPresentation());
  }

  enterChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation> {
    if (!CHILD_IDS.includes(childId)) {
      return failure('INVALID_INPUT', 'A prepared synthetic Child profile is required');
    }
    const child = this.#runtime.children[childId];
    if (child.pairingStatus !== 'paired' || !child.session) {
      return failure('INVALID_TRANSITION', 'The local Child profile pairing is not active');
    }
    const authorized = this.#runtime.services.access.authorizeCapability({
      session: child.session,
      capability: 'enter_child_experience',
      now: this.#nextTime(),
    });
    if (!authorized.ok) return fromServiceFailure(authorized);
    this.#runtime = {
      ...this.#runtime,
      activeAccess: { role: 'child', childId, session: child.session },
    };
    return success(this.#projectPresentation());
  }

  revokeChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('manage_child_devices');
    if (!parent.ok) return parent;
    if (!CHILD_IDS.includes(childId)) {
      return failure('INVALID_INPUT', 'A prepared synthetic Child profile is required');
    }
    const child = this.#runtime.children[childId];
    if (child.pairingStatus !== 'paired' || !child.session) {
      return failure('INVALID_TRANSITION', 'The local Child profile is already revoked');
    }
    const revoked = this.#runtime.services.access.revokeDevice({
      parentSession: parent.data,
      childId,
      deviceId: child.session.deviceId,
      now: this.#nextTime(),
    });
    if (!revoked.ok) return fromServiceFailure(revoked);
    this.#runtime = {
      ...this.#runtime,
      children: {
        ...this.#runtime.children,
        [childId]: { ...child, pairingStatus: 'revoked', session: null },
      },
    };
    return success(this.#projectPresentation());
  }

  restoreChild(childId: SyntheticChildId): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('manage_child_devices');
    if (!parent.ok) return parent;
    if (!CHILD_IDS.includes(childId)) {
      return failure('INVALID_INPUT', 'A prepared synthetic Child profile is required');
    }
    const current = this.#runtime.children[childId];
    if (current.pairingStatus !== 'revoked') {
      return failure('INVALID_TRANSITION', 'The local Child profile is already paired');
    }
    const restored = pairChild(
      this.#runtime.services,
      parent.data,
      childId,
      current.generation + 1,
      this.#nextTime(),
    );
    this.#runtime = {
      ...this.#runtime,
      children: { ...this.#runtime.children, [childId]: restored },
    };
    return success(this.#projectPresentation());
  }

  createPreparedReward(): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('manage_family_rewards');
    if (!parent.ok) return parent;
    if (this.#runtime.rewardPlanId) return success(this.#projectPresentation());
    const now = this.#nextTime();
    const created = this.#runtime.services.familyReward.createPlan(
      {
        id: PREPARED_REWARD_ID,
        childId: 'child_salem',
        guardianIds: [parent.data.principal.parentId],
        createdByGuardianId: parent.data.principal.parentId,
        month: '2026-09',
        promisedAt: PREPARED_REWARD_PROMISED_AT,
        promise: {
          kind: 'experience',
          label: {
            ar: resources.ar.translation.familyReward.promise,
            en: resources.en.translation.familyReward.promise,
          },
        },
        milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
      },
      { session: parent.data, now },
    );
    if (!created.ok) return fromServiceFailure(created);
    this.#runtime = { ...this.#runtime, rewardPlanId: created.data.id };
    const evaluated = this.#evaluateReward(now);
    return evaluated.ok ? success(this.#projectPresentation()) : evaluated;
  }

  markPreparedRewardGiven(): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('manage_family_rewards');
    if (!parent.ok) return parent;
    if (!this.#runtime.rewardPlanId) {
      return failure('NOT_FOUND', 'The prepared Family Reward promise has not been created');
    }
    const given = this.#runtime.services.familyReward.markGiven(
      this.#runtime.rewardPlanId,
      { guardianId: parent.data.principal.parentId, givenAt: this.#nextTime() },
      { session: parent.data, now: this.#currentTime() },
    );
    return given.ok ? success(this.#projectPresentation()) : fromServiceFailure(given);
  }

  startPreparedLeague(): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('manage_league_membership');
    if (!parent.ok) return parent;
    if (this.#runtime.leagueWeek) return success(this.#projectPresentation());
    const now = this.#nextTime();
    const proof = this.#runtime.services.access.issueReauthentication({
      proofId: `family_experience_league_proof_${this.#runtime.actionSequence}`,
      parentSession: parent.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_league_membership',
      now,
    });
    if (!proof.ok) return fromServiceFailure(proof);
    const created = this.#runtime.services.familyLeague.createWeek(
      {
        weekKey: PREPARED_WEEK_KEY,
        timeZone: 'Asia/Dubai',
        optedOutParticipantIds: [],
        leaves: preparedLeaves(),
      },
      { session: parent.data, now },
      proof.data.id,
    );
    if (!created.ok) return fromServiceFailure(created);
    this.#runtime = { ...this.#runtime, leagueWeek: created.data };
    const credited = this.#creditLeague();
    return credited.ok ? success(this.#projectPresentation()) : credited;
  }

  syncRecognizedJourney(
    session: PrototypeSession,
  ): FamilyExperienceResult<FamilyExperiencePresentation> {
    const parent = this.#requireParent('confirm_tasks');
    if (!parent.ok) return parent;
    const verified = deriveVerifiedRecognition(this.#runtime.services, session);
    if (!verified.ok) return verified;
    if (
      this.#runtime.verifiedRecognition &&
      JSON.stringify(this.#runtime.verifiedRecognition) !== JSON.stringify(verified.data)
    ) {
      return failure('INVALID_TRANSITION', 'A different recognition receipt is already synced');
    }
    this.#runtime = { ...this.#runtime, verifiedRecognition: verified.data };
    const reward = this.#evaluateReward(this.#nextTime());
    if (!reward.ok) return reward;
    const league = this.#creditLeague();
    return league.ok ? success(this.#projectPresentation()) : league;
  }

  sendPreparedEncouragement(
    recipientId: LeagueParticipantId,
    phraseId: PreparedLeagueEncouragementId,
  ): FamilyExperienceResult<FamilyExperiencePresentation> {
    const child = this.#requireChild('view_own_league');
    if (!child.ok) return child;
    if (!this.#runtime.leagueWeek) {
      return failure('NOT_FOUND', 'The prepared synthetic League week has not started');
    }
    const sent = this.#runtime.services.familyLeague.sendPreparedEncouragement(
      { weekKey: this.#runtime.leagueWeek.weekKey, recipientId, phraseId },
      { session: child.data, now: this.#nextTime() },
    );
    if (!sent.ok) return fromServiceFailure(sent);
    const existing = this.#runtime.leagueWeek.preparedEncouragementLedger.some(
      (item) => item.id === sent.data.id,
    );
    this.#runtime = {
      ...this.#runtime,
      leagueWeek: existing
        ? this.#runtime.leagueWeek
        : {
            ...this.#runtime.leagueWeek,
            preparedEncouragementLedger: [
              ...this.#runtime.leagueWeek.preparedEncouragementLedger,
              sent.data,
            ],
          },
    };
    return success(this.#projectPresentation());
  }

  reset(): FamilyExperiencePresentation {
    this.#runtime = createRuntime();
    return this.#projectPresentation();
  }

  #requireParent(
    capability:
      | 'manage_child_devices'
      | 'manage_family_rewards'
      | 'manage_league_membership'
      | 'confirm_tasks',
  ): FamilyExperienceResult<ParentAccessSession> {
    const active = this.#runtime.activeAccess;
    if (active?.role !== 'parent') {
      return failure('NOT_AUTHORIZED', 'An active local Parent entry is required');
    }
    const authorized = this.#runtime.services.access.authorizeCapability({
      session: active.session,
      capability,
      now: this.#currentTime(),
    });
    return authorized.ok ? success(active.session) : fromServiceFailure(authorized);
  }

  #requireChild(capability: 'view_own_league'): FamilyExperienceResult<ChildAccessSession> {
    const active = this.#runtime.activeAccess;
    if (active?.role !== 'child') {
      return failure('NOT_AUTHORIZED', 'An active local Child entry is required');
    }
    const authorized = this.#runtime.services.access.authorizeCapability({
      session: active.session,
      capability,
      now: this.#currentTime(),
    });
    return authorized.ok ? success(active.session) : fromServiceFailure(authorized);
  }

  #evaluateReward(now: string): FamilyExperienceResult<true> {
    const rewardPlanId = this.#runtime.rewardPlanId;
    const recognition = this.#runtime.verifiedRecognition;
    if (!rewardPlanId || !recognition) return success(true);
    const evaluated = this.#runtime.services.familyReward.evaluatePlan(
      rewardPlanId,
      [recognition.event],
      { evaluatedAt: now },
      { session: this.#runtime.parentSession, now },
    );
    return evaluated.ok ? success(true) : fromServiceFailure(evaluated);
  }

  #creditLeague(): FamilyExperienceResult<true> {
    const week = this.#runtime.leagueWeek;
    const recognition = this.#runtime.verifiedRecognition;
    if (!week || !recognition) return success(true);
    const leaf = week.leaves.find(
      (item) =>
        item.participantId === recognition.childId &&
        item.approvedTaskRef.taskId === recognition.taskId &&
        item.approvedTaskRef.taskVersion === recognition.taskVersion &&
        item.categoryId === recognition.event.categoryId,
    );
    if (!leaf) {
      return failure('INVALID_RESPONSE', 'The verified journey has no matching Challenge Leaf');
    }
    const now = this.#nextTime();
    const confirmed = this.#runtime.services.familyLeague.confirmLeaf(
      {
        week,
        leafId: leaf.id,
        recognitionKey: recognition.event.recognitionKey,
        completionMode: recognition.completionMode,
        accessibilityAdapted: false,
      },
      { session: this.#runtime.parentSession, now },
    );
    if (!confirmed.ok) return fromServiceFailure(confirmed);
    this.#runtime = { ...this.#runtime, leagueWeek: confirmed.data };
    return success(true);
  }

  #projectPresentation(): FamilyExperiencePresentation {
    return {
      activeEntry: this.#activeEntryView(),
      access: {
        children: CHILD_IDS.map((childId) => ({
          childId,
          pairingStatus: this.#runtime.children[childId].pairingStatus,
        })),
        origin: 'synthetic_local',
        capabilityTruth: ACCESS_TRUTH,
      },
      reward: this.#projectReward(),
      league: this.#projectLeague(),
    };
  }

  #activeEntryView(): FamilyExperienceEntry | null {
    const active = this.#runtime.activeAccess;
    if (!active) return null;
    return active.role === 'parent'
      ? { role: 'parent', origin: 'synthetic', capabilityTruth: ACCESS_TRUTH }
      : {
          role: 'child',
          childId: active.childId,
          origin: 'synthetic',
          capabilityTruth: ACCESS_TRUTH,
        };
  }

  #projectReward(): PrivateFamilyRewardView | null {
    const active = this.#runtime.activeAccess;
    const rewardPlanId = this.#runtime.rewardPlanId;
    if (!active || !rewardPlanId) return null;
    const projected = this.#runtime.services.familyReward.projectPrivate(rewardPlanId, {
      session: active.session,
      now: this.#currentTime(),
    });
    return projected.ok ? projected.data : null;
  }

  #projectLeague(): FamilyLeaguePresentation | null {
    const active = this.#runtime.activeAccess;
    const week = this.#runtime.leagueWeek;
    if (!active || !week) return null;
    const projected = this.#runtime.services.familyLeague.projectParticipants(week.weekKey, {
      session: active.session,
      now: this.#currentTime(),
    });
    if (!projected.ok) return null;
    return {
      weekKey: week.weekKey,
      participants: projected.data,
      cooperativeConfirmedCount: week.cooperativeConfirmedCount,
      cooperativeGoal: week.cooperativeGoal,
      assignedLeafCount: week.leaves.length,
      preparedEncouragementCount: week.preparedEncouragementLedger.length,
      origin: 'synthetic_local',
    };
  }

  #nextTime(): string {
    const actionSequence = this.#runtime.actionSequence + 1;
    this.#runtime = { ...this.#runtime, actionSequence };
    return new Date(Date.parse(CONTROL_BASE_TIME) + actionSequence * 1000).toISOString();
  }

  #currentTime(): string {
    return new Date(
      Date.parse(CONTROL_BASE_TIME) + this.#runtime.actionSequence * 1000,
    ).toISOString();
  }
}

export function createFamilyExperienceController(): FamilyExperienceController {
  return new PrivateFamilyExperienceController();
}
