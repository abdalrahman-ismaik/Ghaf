import type { BadgeId } from './achievements';
import type { CloudFamilyActor } from './cloudFamily';
import type { FamilyRewardMilestone, FamilyRewardPromise } from './familyReward';
import type { LeagueTreeAvatarToken, PreparedLeagueEncouragementId } from './familyLeague';
import type { LandscapeId, LocalizedText } from './familyGrowth';

export interface CloudBadgeAward {
  readonly badgeId: BadgeId;
  readonly awardedAt: string;
}
export interface CloudGrowthChild {
  readonly childId: string;
  readonly lifetimeSeeds: number;
  readonly landscapeSeeds: Readonly<Record<LandscapeId, number>>;
  readonly sortingCredits: number;
  readonly coastCareCredits: number;
  readonly learningCompleted: readonly string[];
  readonly badges: readonly CloudBadgeAward[];
}
export interface CloudRewardPlan {
  readonly id: string;
  readonly childId: string;
  readonly version: number;
  readonly lifecycle: 'promised' | 'unlocked' | 'given';
  readonly month: string;
  readonly promise: FamilyRewardPromise;
  readonly milestone: FamilyRewardMilestone;
  readonly promisedAt: string;
  readonly unlockedAt: string | null;
  readonly givenAt: string | null;
  readonly eligibleSeeds: number;
  readonly eligibleLandscapeSeeds: Readonly<Record<LandscapeId, number>>;
  readonly eligibleLandscapeBaseline: Readonly<Record<LandscapeId, number>>;
}
export interface CloudLeagueRow {
  readonly participantId: string;
  readonly nickname: LocalizedText;
  readonly treeAvatarToken: LeagueTreeAvatarToken;
  readonly completedLeafCount: number;
  readonly score: number;
  readonly position: number;
}
export interface CloudLeagueNomination {
  readonly participantId: string;
  readonly childId: string;
  readonly nickname: LocalizedText;
  readonly treeAvatarToken: LeagueTreeAvatarToken;
  readonly rest: boolean;
  readonly taskIds: readonly string[];
}
export interface CloudLeagueWeek {
  readonly weekKey: string;
  readonly revision: number;
  readonly rows: readonly CloudLeagueRow[];
  readonly cooperativeConfirmedCount: number;
  readonly cooperativeGoal: number;
  readonly nominations: readonly CloudLeagueNomination[];
  readonly ownParticipantId: string | null;
  readonly encouragements: readonly {
    readonly id: string;
    readonly senderId: string;
    readonly recipientId: string;
    readonly phraseId: PreparedLeagueEncouragementId;
    readonly createdAt: string;
  }[];
}
export interface CloudGrowthSnapshot {
  readonly schemaVersion: 1;
  readonly actor: CloudFamilyActor;
  readonly familyId: string;
  readonly revision: number;
  readonly currentWeekKey: string;
  readonly children: readonly CloudGrowthChild[];
  readonly rewards: readonly CloudRewardPlan[];
  readonly league: CloudLeagueWeek | null;
}
export type CloudGrowthCommand =
  | {
      readonly type: 'reward.create';
      readonly childId: string;
      readonly month: string;
      readonly promise: FamilyRewardPromise;
      readonly milestone: FamilyRewardMilestone;
    }
  | {
      readonly type: 'reward.revise';
      readonly planId: string;
      readonly expectedVersion: number;
      readonly month: string;
      readonly promise: FamilyRewardPromise;
      readonly milestone: FamilyRewardMilestone;
    }
  | { readonly type: 'reward.give'; readonly planId: string; readonly expectedVersion: number }
  | {
      readonly type: 'league.nominate';
      readonly childId: string;
      readonly expectedRevision: number;
      readonly nickname: LocalizedText;
      readonly treeAvatarToken: LeagueTreeAvatarToken;
      readonly taskIds: readonly string[];
    }
  | {
      readonly type: 'league.rest';
      readonly childId: string;
      readonly expectedRevision: number;
      readonly rest: boolean;
    }
  | {
      readonly type: 'league.encourage';
      readonly recipientId: string;
      readonly phraseId: PreparedLeagueEncouragementId;
    };
export type CloudGrowthErrorCode =
  | 'access_unavailable'
  | 'family_unavailable'
  | 'invalid_command'
  | 'invalid_transition'
  | 'request_conflict'
  | 'reauth_required'
  | 'network_unavailable'
  | 'provider_unavailable'
  | 'invalid_response';
export class CloudGrowthError extends Error {
  constructor(readonly code: CloudGrowthErrorCode) {
    super(code);
    this.name = 'CloudGrowthError';
  }
}
export interface CloudGrowthTransport {
  familyRequest(
    name: 'ghaf_family_growth' | 'ghaf_family_growth_command',
    args: Readonly<Record<string, unknown>>,
  ): Promise<unknown>;
  subscribeFamily(familyId: string, onChange: () => void): Promise<() => void>;
  reauthenticate?(password: string): Promise<unknown>;
}
export interface CloudGrowthService {
  load(): Promise<CloudGrowthSnapshot>;
  command(requestId: string, command: CloudGrowthCommand): Promise<CloudGrowthSnapshot>;
}
