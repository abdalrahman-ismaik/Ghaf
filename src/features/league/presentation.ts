import type { DomainResult, SyntheticChildId } from '@/models/familyGrowth';
import type { LeagueParticipantProjection, WeeklyGrowthResult } from '@/models/familyLeague';

import { projectLeagueParticipants } from './index';
import {
  selectCommittedPrivateLeagueReceipt,
  type PrivateLeagueRecognitionRuntime,
} from './recognitionRuntime';

const PREPARED_PRIVATE_LEAGUE_FIXTURE = Object.freeze({
  schemaVersion: 1 as const,
  weekKey: '2026-W36' as const,
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
  readonly privateLeague: PrivateLeagueRecognitionRuntime;
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

function rankedFixtureResults(recognized: boolean): readonly WeeklyGrowthResult[] {
  const scores = PREPARED_PRIVATE_LEAGUE_FIXTURE.results.map((result) => {
    const hasRecognition = result.participantId === 'child_salem' && recognized;
    return {
      participantId: result.participantId,
      completedLeafCount: hasRecognition ? 5 : result.completedLeafCount,
      score: hasRecognition ? 100 : result.score,
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
  const committed = selectCommittedPrivateLeagueReceipt(input.privateLeague);
  if (!committed.ok) return committed;
  const results = rankedFixtureResults(committed.data !== null);
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
      weekKey: input.privateLeague.weekKey,
    }),
  };
}
