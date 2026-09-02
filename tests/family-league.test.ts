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
import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
} from '../src/models/access';
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

function createLeagueServiceHarness() {
  const registry = createFeature003ServiceRegistry();
  const parent = registry.access.signInParent({
    sessionId: 'league-harness-parent-session',
    parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
    deviceId: 'league-harness-parent-device',
    now: '2026-09-02T10:00:00.000Z',
  });
  if (!parent.ok) throw new Error(parent.error.message);
  const proof = registry.access.issueReauthentication({
    proofId: 'league-harness-membership-proof',
    parentSession: parent.data,
    reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
    purpose: 'change_league_membership',
    now: '2026-09-02T10:01:00.000Z',
  });
  if (!proof.ok) throw new Error(proof.error.message);
  const parentAuthority = { session: parent.data, now: '2026-09-02T10:01:01.000Z' };
  const week = registry.familyLeague.createWeek(
    {
      weekKey: '2026-W36',
      timeZone: 'Asia/Dubai',
      optedOutParticipantIds: ['cousin_noura'],
      leaves: candidates(['cousin_noura']),
    },
    parentAuthority,
    proof.data.id,
  );
  if (!week.ok) throw new Error(week.error.message);
  const pairing = registry.access.requestPairing({
    requestId: 'league-harness-child-pairing',
    pairingCode: 'synthetic-code-league-harness',
    childId: 'child_salem',
    requestingDeviceId: 'league-harness-child-device',
    now: '2026-09-02T10:02:00.000Z',
  });
  if (!pairing.ok) throw new Error(pairing.error.message);
  const approved = registry.access.approvePairing({
    requestId: pairing.data.id,
    childId: pairing.data.childId,
    requestingDeviceId: pairing.data.requestingDeviceId,
    parentSession: parent.data,
    now: '2026-09-02T10:02:01.000Z',
  });
  if (!approved.ok) throw new Error(approved.error.message);
  const child = registry.access.consumePairing({
    requestId: pairing.data.id,
    pairingCode: pairing.data.pairingCode,
    childId: pairing.data.childId,
    deviceId: pairing.data.requestingDeviceId,
    childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
    sessionId: 'league-harness-child-session',
    now: '2026-09-02T10:02:02.000Z',
  });
  if (!child.ok) throw new Error(child.error.message);
  return {
    registry,
    parentAuthority,
    childAuthority: { session: child.data, now: '2026-09-02T10:03:00.000Z' },
    week: week.data,
  };
}

describe('synthetic Family League week', () => {
  it('is exposed separately from the unchanged P0 session and Green Circle', () => {
    const registry = createFeature003ServiceRegistry();
    const baseline = registry.prototypeSession.getInitialSession();
    const parent = registry.access.signInParent({
      sessionId: 'league-parent-session',
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: 'league-parent-device',
      now: '2026-09-02T10:00:00.000Z',
    });
    if (!parent.ok) throw new Error(parent.error.message);
    const proof = registry.access.issueReauthentication({
      proofId: 'league-membership-proof',
      parentSession: parent.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_league_membership',
      now: '2026-09-02T10:01:00.000Z',
    });
    if (!proof.ok) throw new Error(proof.error.message);
    const authority = { session: parent.data, now: '2026-09-02T10:01:01.000Z' };
    const input = {
      weekKey: '2026-W36',
      timeZone: 'Asia/Dubai' as const,
      optedOutParticipantIds: ['cousin_noura'] as const,
      leaves: candidates(['cousin_noura']),
    };
    const week = registry.familyLeague.createWeek(input, authority, proof.data.id);

    expect(week).toMatchObject({
      ok: true,
      data: { cooperativeGoal: 10, cooperativeConfirmedCount: 0 },
    });
    expect(registry.prototypeSession.getInitialSession()).toMatchObject({
      children: baseline.children,
      landscapeProgress: baseline.landscapeProgress,
      circleGoal: baseline.circleGoal,
    });
    expect(
      registry.familyLeague.createWeek({ ...input, weekKey: '2026-W37' }, authority, proof.data.id),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
  });

  it('fails closed when League membership proof is missing or the actor is a Child', () => {
    const harness = createLeagueServiceHarness();
    const freshRegistry = createFeature003ServiceRegistry();
    const parent = freshRegistry.access.signInParent({
      sessionId: 'league-missing-proof-parent',
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: 'league-missing-proof-device',
      now: '2026-09-02T10:00:00.000Z',
    });
    if (!parent.ok) throw new Error(parent.error.message);
    const weekInput = {
      weekKey: '2026-W37',
      timeZone: 'Asia/Dubai' as const,
      optedOutParticipantIds: ['cousin_noura'] as const,
      leaves: candidates(['cousin_noura']),
    };

    expect(
      harness.registry.familyLeague.createWeek(
        weekInput,
        { session: parent.data, now: '2026-09-02T10:01:00.000Z' },
        undefined as unknown as string,
      ),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(
      freshRegistry.familyLeague.createWeek(
        weekInput,
        harness.childAuthority,
        'forged-membership-proof',
      ),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('keeps raw League state behind minimal Child projections and prepared actions', () => {
    const { registry, parentAuthority, childAuthority, week } = createLeagueServiceHarness();
    const projected = registry.familyLeague.projectParticipants(week.weekKey, childAuthority);
    expect(projected).toMatchObject({ ok: true });
    if (!projected.ok) throw new Error(projected.error.message);
    expect(Object.keys(projected.data[0]!).sort()).toEqual([
      'completedLeafCount',
      'nickname',
      'position',
      'score',
      'treeAvatarToken',
    ]);
    expect(registry.familyLeague.calculateResults(week, childAuthority)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(registry.familyLeague.calculateResults(week, parentAuthority)).toMatchObject({
      ok: true,
    });

    const encouragementInput = {
      weekKey: week.weekKey,
      recipientId: 'child_alya' as const,
      phraseId: 'great_growing' as const,
    };
    const sent = registry.familyLeague.sendPreparedEncouragement(
      encouragementInput,
      childAuthority,
    );
    expect(sent).toMatchObject({
      ok: true,
      data: {
        senderId: 'child_salem',
        recipientId: 'child_alya',
        phraseId: 'great_growing',
      },
    });
    if (!sent.ok) throw new Error(sent.error.message);
    expect(sent.data).not.toHaveProperty('week');
    expect(
      registry.familyLeague.sendPreparedEncouragement(encouragementInput, childAuthority),
    ).toEqual(sent);
    expect(
      registry.familyLeague.sendPreparedEncouragement(
        { ...encouragementInput, freeText: 'private text' } as typeof encouragementInput,
        childAuthority,
      ),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('accepts only the exact original or current state for an idempotent confirmation retry', () => {
    const { registry, parentAuthority, week } = createLeagueServiceHarness();
    const input = {
      week,
      leafId: 'leaf_child_salem_1',
      recognitionKey: 'league-service-recognition-1',
      completionMode: 'permitted_help' as const,
      accessibilityAdapted: true,
    };
    const confirmed = registry.familyLeague.confirmLeaf(input, parentAuthority);
    expect(confirmed).toMatchObject({
      ok: true,
      data: { cooperativeConfirmedCount: 1 },
    });
    if (!confirmed.ok) throw new Error(confirmed.error.message);
    expect(registry.familyLeague.confirmLeaf(input, parentAuthority)).toEqual(confirmed);
    expect(
      registry.familyLeague.confirmLeaf(
        {
          ...input,
          week: { ...week, cooperativeGoal: week.cooperativeGoal + 1 },
        },
        parentAuthority,
      ),
    ).toMatchObject({ ok: false });
    expect(
      registry.familyLeague.confirmLeaf({ ...input, week: confirmed.data }, parentAuthority),
    ).toEqual(confirmed);
  });

  it('lets a reauthenticated Parent fill the rolled week with changed membership', () => {
    const { registry, parentAuthority, week } = createLeagueServiceHarness();
    const permanentProgress: LeaguePermanentProgressSnapshot = {
      earnedSeedsByChild: { child_salem: 48, child_alya: 36 },
      gardenByLandscape: {
        ghaf: { cumulativeSeeds: 0, stage: 'seed' },
        samar: { cumulativeSeeds: 0, stage: 'seed' },
        sidr: { cumulativeSeeds: 0, stage: 'seed' },
        date_palm: { cumulativeSeeds: 0, stage: 'seed' },
        mangrove: { cumulativeSeeds: 48, stage: 'shoot' },
      },
    };
    const rolled = registry.familyLeague.rollover(
      {
        currentWeek: week,
        nextWeekKey: '2026-W37',
        timeZone: 'Asia/Dubai',
        permanentProgressBefore: permanentProgress,
        permanentProgressAfter: permanentProgress,
      },
      parentAuthority,
    );
    expect(rolled).toMatchObject({
      ok: true,
      data: { week: { optedOutParticipantIds: ['cousin_noura'], leaves: [] } },
    });

    const proof = registry.access.issueReauthentication({
      proofId: 'league-refill-membership-proof',
      parentSession: parentAuthority.session,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_league_membership',
      now: '2026-09-02T10:04:00.000Z',
    });
    if (!proof.ok) throw new Error(proof.error.message);
    const filled = registry.familyLeague.createWeek(
      {
        weekKey: '2026-W37',
        timeZone: 'Asia/Dubai',
        optedOutParticipantIds: [],
        leaves: candidates(),
      },
      { ...parentAuthority, now: '2026-09-02T10:04:01.000Z' },
      proof.data.id,
    );
    expect(filled).toMatchObject({
      ok: true,
      data: { optedOutParticipantIds: [], cooperativeGoal: 15 },
    });
    if (!filled.ok) throw new Error(filled.error.message);
    expect(filled.data.leaves).toHaveLength(15);
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
    expect(Object.isFrozen(SYNTHETIC_LEAGUE_PARTICIPANTS)).toBe(true);
    expect(Object.isFrozen(SYNTHETIC_LEAGUE_PARTICIPANTS[0].nickname)).toBe(true);
    expect(Object.isFrozen(PREPARED_LEAGUE_ENCOURAGEMENTS.great_growing)).toBe(true);
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

  it('rejects malformed confirmation fields before storing credit', () => {
    const week = createWeek(['cousin_noura']);
    expect(
      confirmChallengeLeaf({
        week,
        leafId: 'leaf_child_salem_1',
        recognitionKey: 'recognition_malformed_mode',
        completionMode: 'forced_help' as 'independent',
        accessibilityAdapted: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      confirmChallengeLeaf({
        week,
        leafId: 'leaf_child_salem_1',
        recognitionKey: 'recognition_malformed_adaptation',
        completionMode: 'independent',
        accessibilityAdapted: 'yes' as unknown as boolean,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
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

  it('revalidates protected content, age, and task uniqueness after week creation', () => {
    const week = createWeek(['cousin_noura']);
    const first = week.leaves[0]!;
    const second = week.leaves[1]!;
    const mutatedWeeks: readonly FamilyLeagueWeek[] = [
      {
        ...week,
        leaves: week.leaves.map((item) =>
          item.id === first.id
            ? {
                ...item,
                categoryId: 'faith_gratitude',
                protectedContent: { ...item.protectedContent, prayer: true },
              }
            : item,
        ),
      },
      {
        ...week,
        leaves: week.leaves.map((item) =>
          item.id === second.id ? { ...item, approvedTaskRef: first.approvedTaskRef } : item,
        ),
      },
      {
        ...week,
        leaves: week.leaves.map((item) =>
          item.id === first.id ? { ...item, ageBand: '6_8' } : item,
        ),
      },
      {
        ...week,
        leaves: week.leaves.filter((item) => item.participantId !== 'child_alya'),
        cooperativeGoal: 5,
      },
    ];

    for (const mutated of mutatedWeeks) {
      expect(
        confirmChallengeLeaf({
          week: mutated,
          leafId: first.id,
          recognitionKey: 'recognition_tampered_week',
          completionMode: 'independent',
          accessibilityAdapted: false,
        }),
      ).toMatchObject({ ok: false });
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

  it('produces every normalized score from zero through the five-Leaf cap', () => {
    let week = createWeek(['cousin_noura']);
    const observed: number[] = [];
    for (let count = 0; count <= 5; count += 1) {
      const results = calculateWeeklyGrowthResults(week);
      if (!results.ok) throw new Error(results.error.message);
      observed.push(results.data.find((item) => item.participantId === 'child_salem')!.score);
      if (count < 5) week = confirm(week, 'child_salem', count + 1);
    }
    expect(observed).toEqual([0, 20, 40, 60, 80, 100]);
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
          optedOutParticipantIds: ['cousin_noura'],
          cooperativeGoal: 10,
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
