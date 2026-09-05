import type { DomainResult, PrototypeSession, SyntheticChildId } from '@/models/familyGrowth';
import type { LeagueParticipantProjection, WeeklyGrowthResult } from '@/models/familyLeague';

import { projectLeagueParticipants } from './index';

const PRIVATE_LEAGUE_WEEK_KEY = '2026-W36';
const PREPARED_PRIVATE_LEAGUE_FIXTURE = Object.freeze({
  schemaVersion: 1 as const,
  weekKey: PRIVATE_LEAGUE_WEEK_KEY,
  provenance: 'approved_synthetic_reset_summary' as const,
  results: Object.freeze([
    Object.freeze({ participantId: 'child_salem' as const, completedLeafCount: 4, score: 80 }),
    Object.freeze({ participantId: 'child_alya' as const, completedLeafCount: 4, score: 80 }),
    Object.freeze({ participantId: 'cousin_noura' as const, completedLeafCount: 3, score: 60 }),
  ]),
});

export interface PrivateLeagueParticipantPresentation extends LeagueParticipantProjection {
  readonly isActiveProfile: boolean;
}

export interface PrivateLeaguePresentation {
  readonly activeParticipant: PrivateLeagueParticipantPresentation;
  readonly activeProfileId: SyntheticChildId;
  readonly leavesPerWeek: 5;
  readonly origin: 'synthetic_local';
  readonly participants: readonly PrivateLeagueParticipantPresentation[];
  readonly weekKey: string;
}

interface PrivateLeaguePresentationInput {
  readonly activeProfileId: SyntheticChildId;
  readonly journey: PrototypeSession['journey'];
  readonly recognitionLedger: PrototypeSession['recognitionLedger'];
}

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

function canonicalRecognitionKey(input: PrivateLeaguePresentationInput): string | null {
  const journey = input.journey;
  if (
    journey?.lifecycle !== 'recognized' ||
    journey.task.id !== 'task_recycling_p0_v1' ||
    journey.task.version !== 1 ||
    journey.task.templateId !== 'task_recycling_p0_v1' ||
    journey.task.targetChildId !== 'child_salem' ||
    journey.task.content.categoryId !== 'green_impact' ||
    journey.task.content.recognitionMode !== 'standard' ||
    journey.task.content.routinePhase !== 'acquisition' ||
    journey.task.content.visibilityScope !== 'household' ||
    journey.task.content.circleEligible !== true ||
    journey.assignment?.childId !== 'child_salem' ||
    journey.assignment.taskId !== journey.task.id ||
    journey.assignment.taskVersion !== journey.task.version ||
    journey.assignment.approvedByParent !== true ||
    journey.submission?.assignmentId !== journey.assignment.id ||
    journey.submission.taskVersion !== journey.task.version ||
    journey.checkIn?.decision !== 'confirm' ||
    journey.checkIn.confirmationPresentation !== 'recognition_applied' ||
    journey.checkIn.submissionId !== journey.submission.id ||
    journey.checkIn.recognitionKey !== `recognition:${journey.submission.id}`
  ) {
    return null;
  }

  const receipt = input.recognitionLedger[journey.checkIn.recognitionKey];
  const seed = receipt?.seedTransaction;
  const growth = receipt?.landscapeGrowth;
  if (
    !receipt ||
    receipt.recognitionKey !== journey.checkIn.recognitionKey ||
    receipt.checkInId !== journey.checkIn.id ||
    seed?.recognitionKey !== receipt.recognitionKey ||
    seed.childId !== 'child_salem' ||
    seed.amount !== 12 ||
    seed.balanceBefore !== 48 ||
    seed.balanceAfter !== 60 ||
    seed.meaning !== 'symbolic_nonfinancial' ||
    growth?.landscapeId !== 'mangrove' ||
    growth.seedsBefore !== 48 ||
    growth.seedsAfter !== 60 ||
    growth.stageBefore !== 'shoot' ||
    growth.stageAfter !== 'sapling' ||
    growth.crossedThreshold !== 60 ||
    growth.symbolicOnly !== true ||
    receipt.canopyContribution?.actionKind !== 'eligible_household_acquisition' ||
    receipt.canopyContribution?.leafDelta !== 1 ||
    receipt.canopyContribution.origin !== 'synthetic' ||
    receipt.circleEvent?.actionKind !== 'eligible_green_action' ||
    receipt.circleEvent?.actionDelta !== 1 ||
    receipt.circleEvent.sourceScope !== 'household' ||
    receipt.circleEvent.origin !== 'synthetic_local'
  ) {
    return null;
  }
  return receipt.recognitionKey;
}

function rankedFixtureResults(recognitionKey: string | null): readonly WeeklyGrowthResult[] {
  const scores = PREPARED_PRIVATE_LEAGUE_FIXTURE.results.map((result) => {
    const recognized = result.participantId === 'child_salem' && recognitionKey !== null;
    return {
      participantId: result.participantId,
      completedLeafCount: recognized ? 5 : result.completedLeafCount,
      score: recognized ? 100 : result.score,
    };
  });

  return Object.freeze(
    scores.map((result) =>
      Object.freeze({
        ...result,
        position: 1 + scores.filter((candidate) => candidate.score > result.score).length,
      }),
    ),
  );
}

export function buildPrivateLeaguePresentation(
  input: PrivateLeaguePresentationInput,
): DomainResult<PrivateLeaguePresentation> {
  const recognitionKey = canonicalRecognitionKey(input);
  const results = rankedFixtureResults(recognitionKey);
  const projected = projectLeagueParticipants({
    participants: results.map((result) => ({
      ...result,
      protectedContentPresent: false as const,
    })),
  });
  if (!projected.ok) return projected;

  const participants = Object.freeze(
    projected.data.map((participant, index) => {
      const result = results[index];
      return Object.freeze({
        ...participant,
        isActiveProfile: result?.participantId === input.activeProfileId,
      });
    }),
  );
  const activeParticipant = participants.find((participant) => participant.isActiveProfile);
  if (!activeParticipant) return failure('The active Child is not in the private League fixture');

  return {
    ok: true,
    data: Object.freeze({
      activeParticipant,
      activeProfileId: input.activeProfileId,
      leavesPerWeek: 5,
      origin: 'synthetic_local',
      participants,
      weekKey: PREPARED_PRIVATE_LEAGUE_FIXTURE.weekKey,
    }),
  };
}
