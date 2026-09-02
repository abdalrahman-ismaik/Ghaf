import { describe, expect, it } from 'vitest';

import {
  calculateWeeklyGrowthResults,
  confirmChallengeLeaf,
  createFamilyLeagueWeek,
  evaluateChallengeLeafEligibility,
  PREPARED_LEAGUE_ENCOURAGEMENTS,
  projectLeagueParticipants,
  rolloverFamilyLeagueWeek,
  sendPreparedEncouragement,
  SYNTHETIC_LEAGUE_PARTICIPANTS,
} from '../src/features/league';
import type {
  ChallengeLeafCandidate,
  FamilyLeagueWeek,
  LeagueParticipantId,
  LeaguePermanentProgressSnapshot,
} from '../src/models/familyLeague';
import { createFeature003ServiceRegistry } from '../src/services';

const AGE_BANDS: Readonly<Record<LeagueParticipantId, ChallengeLeafCandidate['ageBands']>> = {
  child_salem: ['9_11'],
  child_alya: ['9_11'],
  cousin_noura: ['6_8'],
};

const SAFE_CONTENT = {
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

function leaf(
  participantId: LeagueParticipantId,
  index: number,
  overrides: Partial<ChallengeLeafCandidate> = {},
): ChallengeLeafCandidate {
  return {
    id: `leaf_${participantId}_${index}`,
    participantId,
    ageBands: AGE_BANDS[participantId],
    approvedTaskRef: { taskId: `task_${participantId}_${index}`, taskVersion: 1 },
    categoryId: 'home_responsibility',
    visibilityScope: 'household',
    parentApproved: true,
    accessibilityAdaptable: true,
    protectedContent: SAFE_CONTENT,
    ...overrides,
  };
}

function candidates(
  optedOutParticipantIds: readonly LeagueParticipantId[] = [],
): ChallengeLeafCandidate[] {
  return SYNTHETIC_LEAGUE_PARTICIPANTS.flatMap((participant) =>
    optedOutParticipantIds.includes(participant.id)
      ? []
      : Array.from({ length: 5 }, (_, index) => leaf(participant.id, index + 1)),
  );
}

function createWeek(optedOutParticipantIds: readonly LeagueParticipantId[] = []): FamilyLeagueWeek {
  const result = createFamilyLeagueWeek({
    weekKey: '2026-W36',
    timeZone: 'Asia/Dubai',
    optedOutParticipantIds,
    leaves: candidates(optedOutParticipantIds),
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function confirm(
  week: FamilyLeagueWeek,
  participantId: LeagueParticipantId,
  leafIndex: number,
  recognitionKey = `recognition_${participantId}_${leafIndex}`,
  completionMode: 'independent' | 'permitted_help' = 'independent',
  accessibilityAdapted = false,
): FamilyLeagueWeek {
  const result = confirmChallengeLeaf({
    week,
    leafId: `leaf_${participantId}_${leafIndex}`,
    recognitionKey,
    completionMode,
    accessibilityAdapted,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

describe('synthetic Family League week', () => {
  it('is exposed separately from the unchanged P0 session and Green Circle', () => {
    const registry = createFeature003ServiceRegistry();
    const baseline = registry.prototypeSession.getInitialSession();
    const week = registry.familyLeague.createWeek({
      weekKey: '2026-W36',
      timeZone: 'Asia/Dubai',
      optedOutParticipantIds: ['cousin_noura'],
      leaves: candidates(['cousin_noura']),
    });

    expect(week).toMatchObject({
      ok: true,
      data: { cooperativeGoal: 10, cooperativeConfirmedCount: 0 },
    });
    expect(registry.prototypeSession.getInitialSession()).toMatchObject({
      children: baseline.children,
      landscapeProgress: baseline.landscapeProgress,
      circleGoal: baseline.circleGoal,
    });
  });

  it('assigns exactly five unique eligible Leaves to each participating fixed invitee', () => {
    const week = createWeek(['cousin_noura']);

    expect(week.invitedParticipants).toEqual(SYNTHETIC_LEAGUE_PARTICIPANTS);
    expect(week.optedOutParticipantIds).toEqual(['cousin_noura']);
    expect(week.leaves).toHaveLength(10);
    expect(week.leaves.filter((item) => item.participantId === 'child_salem')).toHaveLength(5);
    expect(week.leaves.filter((item) => item.participantId === 'child_alya')).toHaveLength(5);
    expect(week.leaves.filter((item) => item.participantId === 'cousin_noura')).toHaveLength(0);
    expect(new Set(week.leaves.map((item) => item.id)).size).toBe(10);
    expect(week.cooperativeConfirmedCount).toBe(0);
    expect(week.cooperativeGoal).toBe(10);
  });

  it('rejects wrong counts, duplicate task references, unapproved, age-incompatible, and opt-out Leaves', () => {
    const valid = candidates(['cousin_noura']);
    const inputs: readonly ChallengeLeafCandidate[][] = [
      valid.slice(0, -1),
      [...valid, leaf('child_salem', 6)],
      valid.map((item, index) =>
        index === 1 ? { ...item, approvedTaskRef: valid[0]!.approvedTaskRef } : item,
      ),
      valid.map((item, index) => (index === 0 ? { ...item, parentApproved: false } : item)),
      valid.map((item, index) => (index === 0 ? { ...item, ageBands: ['6_8'] } : item)),
      [...valid, leaf('cousin_noura', 1)],
    ];

    for (const leaves of inputs) {
      expect(
        createFamilyLeagueWeek({
          weekKey: '2026-W36',
          timeZone: 'Asia/Dubai',
          optedOutParticipantIds: ['cousin_noura'],
          leaves,
        }),
      ).toMatchObject({ ok: false });
    }
  });

  it('rejects private and protected activity before assignment', () => {
    expect(
      evaluateChallengeLeafEligibility(
        leaf('child_salem', 1, { visibilityScope: 'child_guardian' }),
        SYNTHETIC_LEAGUE_PARTICIPANTS[0],
      ),
    ).toEqual({ eligible: false, reason: 'private_activity' });
    expect(
      evaluateChallengeLeafEligibility(
        leaf('child_salem', 1, { categoryId: 'faith_gratitude' }),
        SYNTHETIC_LEAGUE_PARTICIPANTS[0],
      ),
    ).toEqual({ eligible: false, reason: 'protected_category' });

    for (const key of Object.keys(SAFE_CONTENT) as (keyof typeof SAFE_CONTENT)[]) {
      expect(
        evaluateChallengeLeafEligibility(
          leaf('child_salem', 1, {
            protectedContent: { ...SAFE_CONTENT, [key]: true },
          }),
          SYNTHETIC_LEAGUE_PARTICIPANTS[0],
        ),
      ).toEqual({ eligible: false, reason: 'protected_content' });
    }
  });

  it('credits confirmations once and gives full score credit with help or adaptation', () => {
    let week = createWeek(['cousin_noura']);
    week = confirm(week, 'child_salem', 1);
    week = confirm(week, 'child_salem', 2, undefined, 'permitted_help');
    week = confirm(week, 'child_salem', 3, undefined, 'permitted_help', true);

    const afterThree = calculateWeeklyGrowthResults(week);
    expect(afterThree).toMatchObject({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          participantId: 'child_salem',
          completedLeafCount: 3,
          score: 60,
        }),
      ]),
    });
    expect(week.cooperativeConfirmedCount).toBe(3);

    const duplicate = confirmChallengeLeaf({
      week,
      leafId: 'leaf_child_salem_3',
      recognitionKey: 'recognition_child_salem_3',
      completionMode: 'permitted_help',
      accessibilityAdapted: true,
    });
    expect(duplicate).toEqual({ ok: true, data: week });

    week = confirm(week, 'child_salem', 4);
    week = confirm(week, 'child_salem', 5);
    expect(calculateWeeklyGrowthResults(week)).toMatchObject({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          participantId: 'child_salem',
          completedLeafCount: 5,
          score: 100,
        }),
      ]),
    });
    expect(
      confirmChallengeLeaf({
        week,
        leafId: 'not_a_challenge_leaf',
        recognitionKey: 'recognition_extra_task',
        completionMode: 'independent',
        accessibilityAdapted: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  it('uses score-only competition positions with shared ties and gaps', () => {
    let week = createWeek();
    for (let index = 1; index <= 5; index += 1) {
      week = confirm(week, 'child_salem', index);
      week = confirm(week, 'child_alya', index, undefined, 'permitted_help');
    }
    for (let index = 1; index <= 3; index += 1) {
      week = confirm(week, 'cousin_noura', index, undefined, 'independent', true);
    }

    expect(calculateWeeklyGrowthResults(week)).toEqual({
      ok: true,
      data: [
        { participantId: 'child_salem', completedLeafCount: 5, score: 100, position: 1 },
        { participantId: 'child_alya', completedLeafCount: 5, score: 100, position: 1 },
        { participantId: 'cousin_noura', completedLeafCount: 3, score: 60, position: 3 },
      ],
    });

    const withCompletionTime = {
      ...week,
      leaves: week.leaves.map((item, index) =>
        index === 0 ? { ...item, completionTimestamp: '2026-09-01T08:00:00Z' } : item,
      ),
    } as FamilyLeagueWeek;
    expect(calculateWeeklyGrowthResults(withCompletionTime)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('projects only approved nickname, tree avatar, count, score, and position', () => {
    let week = createWeek(['cousin_noura']);
    week = confirm(week, 'child_salem', 1);
    const results = calculateWeeklyGrowthResults(week);
    if (!results.ok) throw new Error(results.error.message);
    const input = {
      participants: results.data.map((result) => ({
        ...result,
        protectedContentPresent: false as const,
      })),
    };

    const projection = projectLeagueParticipants(input);
    expect(projection).toMatchObject({ ok: true });
    if (!projection.ok) throw new Error(projection.error.message);
    expect(projection.data).not.toHaveLength(0);
    expect(Object.keys(projection.data[0]!).sort()).toEqual([
      'completedLeafCount',
      'nickname',
      'position',
      'score',
      'treeAvatarToken',
    ]);

    const forbiddenFields: readonly (readonly [string, unknown])[] = [
      ['unknown', true],
      ['taskText', 'private task'],
      ['taskHistory', ['task_1']],
      ['evidence', 'photo'],
      ['earnedSeeds', 80],
      ['media', 'audio'],
      ['reflection', 'private'],
      ['assistantContent', 'prepared response'],
      ['parentNote', 'private note'],
      ['categoryId', 'faith_gratitude'],
    ];
    for (const [field, value] of forbiddenFields) {
      expect(
        projectLeagueParticipants({
          participants: [{ ...input.participants[0]!, [field]: value }],
        }),
      ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    }
    expect(
      projectLeagueParticipants({
        participants: [{ ...input.participants[0]!, protectedContentPresent: true }],
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('records only allowlisted prepared bilingual encouragement without free text', () => {
    const week = createWeek(['cousin_noura']);
    const sent = sendPreparedEncouragement({
      week,
      senderId: 'child_salem',
      recipientId: 'child_alya',
      phraseId: 'great_growing',
    });
    expect(sent).toMatchObject({
      ok: true,
      data: {
        encouragement: {
          phraseId: 'great_growing',
          text: PREPARED_LEAGUE_ENCOURAGEMENTS.great_growing,
          origin: 'prepared',
        },
        week: { preparedEncouragementLedger: [{ phraseId: 'great_growing' }] },
      },
    });

    expect(
      sendPreparedEncouragement({
        week,
        senderId: 'child_salem',
        recipientId: 'child_alya',
        phraseId: 'not_reviewed',
      }),
    ).toMatchObject({ ok: false });
    expect(
      sendPreparedEncouragement({
        week,
        senderId: 'child_salem',
        recipientId: 'child_alya',
        phraseId: 'great_growing',
        freeText: 'call me',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('rolls over only weekly state after verifying Seeds and Garden are unchanged', () => {
    let week = createWeek(['cousin_noura']);
    week = confirm(week, 'child_salem', 1);
    const sent = sendPreparedEncouragement({
      week,
      senderId: 'child_salem',
      recipientId: 'child_alya',
      phraseId: 'great_growing',
    });
    if (!sent.ok) throw new Error(sent.error.message);
    week = sent.data.week;

    const permanentProgress: LeaguePermanentProgressSnapshot = {
      earnedSeedsByChild: { child_salem: 60, child_alya: 36 },
      gardenByLandscape: {
        ghaf: { cumulativeSeeds: 0, stage: 'seed' },
        samar: { cumulativeSeeds: 0, stage: 'seed' },
        sidr: { cumulativeSeeds: 0, stage: 'seed' },
        date_palm: { cumulativeSeeds: 0, stage: 'seed' },
        mangrove: { cumulativeSeeds: 60, stage: 'sapling' },
      },
    };
    const rollover = rolloverFamilyLeagueWeek({
      currentWeek: week,
      nextWeekKey: '2026-W37',
      timeZone: 'Asia/Dubai',
      permanentProgressBefore: permanentProgress,
      permanentProgressAfter: permanentProgress,
    });
    expect(rollover).toMatchObject({
      ok: true,
      data: {
        permanentProgress,
        permanentProgressUnchanged: true,
        week: {
          weekKey: '2026-W37',
          leaves: [],
          confirmationLedger: {},
          cooperativeConfirmedCount: 0,
          preparedEncouragementLedger: [],
          optedOutParticipantIds: [],
        },
      },
    });

    expect(
      rolloverFamilyLeagueWeek({
        currentWeek: week,
        nextWeekKey: '2026-W37',
        timeZone: 'Asia/Dubai',
        permanentProgressBefore: permanentProgress,
        permanentProgressAfter: {
          ...permanentProgress,
          earnedSeedsByChild: { ...permanentProgress.earnedSeedsByChild, child_salem: 61 },
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });
});
