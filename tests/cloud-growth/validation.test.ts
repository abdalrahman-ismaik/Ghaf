import { describe, expect, it } from 'vitest';
import {
  parseCloudGrowthCommand,
  parseCloudGrowthSnapshot,
} from '../../src/features/cloud-growth/validation';
import type { CloudGrowthSnapshot } from '../../src/models/cloudGrowth';
import { cloudId, userId, familyId, childId } from '../cloud-family/fixtures';

const zero = () => ({ ghaf: 0, samar: 0, sidr: 0, date_palm: 0, mangrove: 0 });
function snapshot(): CloudGrowthSnapshot {
  return {
    schemaVersion: 1,
    actor: { userId, role: 'parent', familyId, childId: null },
    familyId,
    revision: 0,
    currentWeekKey: '2026-W38',
    children: [
      {
        childId,
        lifetimeSeeds: 0,
        landscapeSeeds: zero(),
        sortingCredits: 0,
        coastCareCredits: 0,
        learningCompleted: [],
        badges: [],
      },
    ],
    rewards: [],
    league: null,
  };
}
describe('private cloud growth external DTO boundary', () => {
  it('accepts a genuinely empty new profile without inventing Seeds, badges, promise or League', () => {
    const actual = parseCloudGrowthSnapshot(snapshot(), userId, familyId);
    expect(actual.children[0]?.lifetimeSeeds).toBe(0);
    expect(actual.children[0]?.badges).toEqual([]);
    expect(actual.rewards).toEqual([]);
    expect(actual.league).toBeNull();
    expect(Object.isFrozen(actual.children[0])).toBe(true);
  });
  it('rejects wrong session, wrong family, private sibling data and unrecognized fields', () => {
    const value = snapshot();
    expect(() => parseCloudGrowthSnapshot(value, cloudId(99), familyId)).toThrow(
      'invalid_response',
    );
    expect(() => parseCloudGrowthSnapshot(value, userId, cloudId(99))).toThrow('invalid_response');
    expect(() =>
      parseCloudGrowthSnapshot({ ...value, secret: 'private' }, userId, familyId),
    ).toThrow('invalid_response');
    const childView = {
      ...value,
      actor: { userId, familyId, childId, role: 'child' },
      children: [...value.children, { ...value.children[0], childId: cloudId(44) }],
    };
    expect(() => parseCloudGrowthSnapshot(childView, userId, familyId)).toThrow('invalid_response');
  });
  it('requires named badge evidence and coherent immutable personal totals', () => {
    const value = snapshot();
    const child = value.children[0];
    expect(() =>
      parseCloudGrowthSnapshot(
        { ...value, children: [{ ...child, lifetimeSeeds: 12 }] },
        userId,
        familyId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudGrowthSnapshot(
        {
          ...value,
          children: [
            {
              ...child,
              badges: [{ badgeId: 'badge.skill.energy.bud.v1', awardedAt: '2026-09-14T12:00:00Z' }],
            },
          ],
        },
        userId,
        familyId,
      ),
    ).toThrow('invalid_response');
    const earned = {
      ...child,
      lifetimeSeeds: 12,
      landscapeSeeds: { ...zero(), mangrove: 12 },
      sortingCredits: 1,
      coastCareCredits: 1,
      badges: [
        { badgeId: 'badge.journey.seed_start.v1', awardedAt: '2026-09-14T12:00:00Z' },
        { badgeId: 'badge.skill.sorting.bud.v1', awardedAt: '2026-09-14T12:00:00Z' },
      ],
    };
    expect(
      parseCloudGrowthSnapshot({ ...value, children: [earned] }, userId, familyId).children[0]
        ?.badges,
    ).toHaveLength(2);
    expect(() =>
      parseCloudGrowthSnapshot(
        { ...value, children: [{ ...earned, badges: [...earned.badges, earned.badges[0]] }] },
        userId,
        familyId,
      ),
    ).toThrow('invalid_response');
  });
  it('preserves exact20 point Leaves and shared tie positions without exposing task references to Children', () => {
    const value = snapshot();
    const row = {
      participantId: cloudId(10),
      nickname: { ar: 'غصن', en: 'Branch' },
      treeAvatarToken: 'ghaf_leaf',
      completedLeafCount: 2,
      score: 40,
      position: 1,
    };
    const league = {
      weekKey: value.currentWeekKey,
      revision: 1,
      rows: [row, { ...row, participantId: cloudId(11) }],
      cooperativeConfirmedCount: 4,
      cooperativeGoal: 10,
      nominations: [],
      ownParticipantId: null,
      encouragements: [],
    };
    expect(
      parseCloudGrowthSnapshot({ ...value, league }, userId, familyId).league?.rows.map(
        (item) => item.position,
      ),
    ).toEqual([1, 1]);
    expect(() =>
      parseCloudGrowthSnapshot(
        { ...value, league: { ...league, rows: [{ ...row, score: 41 }, league.rows[1]] } },
        userId,
        familyId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudGrowthSnapshot(
        { ...value, league: { ...league, rows: [row, { ...league.rows[1], position: 2 }] } },
        userId,
        familyId,
      ),
    ).toThrow('invalid_response');
    const child = {
      ...value,
      actor: { userId, familyId, childId, role: 'child' },
      league: {
        ...league,
        ownParticipantId: row.participantId,
        nominations: [
          {
            participantId: row.participantId,
            childId,
            nickname: row.nickname,
            treeAvatarToken: 'ghaf_leaf',
            rest: false,
            taskIds: [20, 21, 22, 23, 24].map(cloudId),
          },
        ],
      },
    };
    expect(() => parseCloudGrowthSnapshot(child, userId, familyId)).toThrow('invalid_response');
  });
});
describe('bounded growth commands', () => {
  it('requires five distinct UUID occurrences and no arbitrary awards or free text encouragement', () => {
    const nomination = {
      type: 'league.nominate',
      childId,
      expectedRevision: 0,
      nickname: { ar: 'غصن', en: 'Branch' },
      treeAvatarToken: 'ghaf_leaf',
      taskIds: [20, 21, 22, 23, 24].map(cloudId),
    };
    expect(parseCloudGrowthCommand(nomination).type).toBe('league.nominate');
    expect(() =>
      parseCloudGrowthCommand({ ...nomination, taskIds: Array(5).fill(cloudId(20)) }),
    ).toThrow('invalid_command');
    expect(() => parseCloudGrowthCommand({ ...nomination, score: 100 })).toThrow('invalid_command');
    expect(() =>
      parseCloudGrowthCommand({
        type: 'league.encourage',
        recipientId: cloudId(5),
        phraseId: 'private free text',
      }),
    ).toThrow('invalid_command');
  });
  it('rejects missing/null/string concurrency versions and client-authored lifecycle', () => {
    const give = { type: 'reward.give', planId: cloudId(60), expectedVersion: 1 };
    expect(parseCloudGrowthCommand(give).type).toBe('reward.give');
    for (const expectedVersion of [undefined, null, '1', -1])
      expect(() => parseCloudGrowthCommand({ ...give, expectedVersion })).toThrow(
        'invalid_command',
      );
    expect(() =>
      parseCloudGrowthCommand({ ...give, lifecycle: 'given', givenAt: '2026-09-14' }),
    ).toThrow('invalid_command');
  });
});
