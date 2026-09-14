import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  CloudLeagueView,
  eligibleChallengeTasks,
} from '../../src/components/cloud-growth/CloudLeagueViews';
import {
  CloudRewardList,
  parsePromiseAmount,
} from '../../src/components/cloud-growth/CloudRewardViews';
import { cloudGrowthResources } from '../../src/i18n/cloudGrowthResources';
import type { CloudLeagueWeek, CloudRewardPlan } from '../../src/models/cloudGrowth';
import { cloudId, cloudSnapshot } from '../cloud-family/fixtures';

vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('@/components/illustrations', () => ({
  LocalIllustration: 'Illustration',
  leagueAvatarArtworkIds: { mangrove_shoot: 'mangrove', ghaf_leaf: 'ghaf', sidr_sapling: 'sidr' },
}));
vi.mock('@/components/cloud-growth/common', () => ({
  GrowthButton: 'Button',
  GrowthField: 'Field',
  GrowthRow: 'Row',
  GrowthText: 'Text',
  growthStyles: {},
  useGrowthCopy: () => ({
    locale: 'en',
    direction: 'ltr',
    number: String,
    text: (key: string, values?: Record<string, unknown>) => {
      const value = cloudGrowthResources.en[key as keyof typeof cloudGrowthResources.en] ?? key;
      return String(value).replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
        String(values?.[name] ?? ''),
      );
    },
  }),
}));

function content(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(content).join(' ');
  if (!isValidElement<{ children?: ReactNode }>(node)) return '';
  return Children.toArray(node.props.children).map(content).join(' ');
}
const zero = { ghaf: 0, samar: 0, sidr: 0, date_palm: 0, mangrove: 0 };

describe('private cloud growth presentation', () => {
  it('parses entered virtual promise amounts without floating-point ledger errors', () => {
    expect(parsePromiseAmount('10.10')).toBe(1010);
    expect(parsePromiseAmount('١٢٫٥٠')).toBe(1250);
    expect(parsePromiseAmount('0.01')).toBe(1);
    for (const value of ['', '0', '-1', '1.999', '1e3', 'Infinity', '9999999999999999999'])
      expect(parsePromiseAmount(value)).toBeNull();
  });

  it('shows empty rewards honestly and exposes creation only to Parents', () => {
    const props = { plans: [], busy: false, onCreate: vi.fn(), onRevise: vi.fn(), onGive: vi.fn() };
    const child = content(CloudRewardList({ ...props, parent: false }));
    expect(child).toContain('No Family Rewards promised yet.');
    expect(child).not.toContain('Create a promise');
    expect(content(CloudRewardList({ ...props, parent: true }))).toContain('Create a promise');
  });

  it('does not expose promised edits after an authoritative unlock', () => {
    const plan: CloudRewardPlan = {
      id: cloudId(80),
      childId: cloudId(3),
      version: 1,
      lifecycle: 'unlocked',
      month: '2026-09',
      promise: { kind: 'experience', label: { ar: 'وعد', en: 'A family activity' } },
      milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
      promisedAt: '2026-09-14T10:00:00.000Z',
      unlockedAt: '2026-09-14T12:00:00.000Z',
      givenAt: null,
      eligibleSeeds: 12,
      eligibleLandscapeSeeds: zero,
      eligibleLandscapeBaseline: zero,
    };
    const props = {
      plans: [plan],
      busy: false,
      onCreate: vi.fn(),
      onRevise: vi.fn(),
      onGive: vi.fn(),
    };
    const parent = content(CloudRewardList({ ...props, parent: true }));
    expect(parent).toContain('Mark as given');
    expect(parent).not.toContain('Revise future promise');
    expect(content(CloudRewardList({ ...props, parent: false }))).not.toContain('Mark as given');
  });

  it('offers only approved in-family own-Child unconfirmed P0 nominations', () => {
    const source = cloudSnapshot();
    const child = source.children[0];
    const base = source.tasks[0];
    if (!child || !base) throw new Error('Expected an assigned activity and Child in the fixture');
    const task = {
      ...base,
      catalogId: 'task_recycling_p0_v1',
      template: { ...base.template, id: 'task_recycling_p0_v1' },
    };
    expect(eligibleChallengeTasks([task], child)).toHaveLength(1);
    expect(
      eligibleChallengeTasks(
        [
          { ...task, childId: cloudId(99) },
          { ...task, familyId: cloudId(99) },
          { ...task, status: 'recognized' },
          { ...task, catalogId: 'GI01' },
          { ...task, template: { ...task.template, visibilityScope: 'child_guardian' } },
          { ...task, template: { ...task.template, routinePhase: 'maintenance' } },
          { ...task, template: { ...task.template, childAgeBands: ['12_14'] } },
        ],
        child,
      ),
    ).toEqual([]);
  });

  it('shows only the approved League projection and no Child management actions', () => {
    const child = cloudSnapshot().children[0];
    if (!child) throw new Error('Expected a Child in the fixture');
    const league: CloudLeagueWeek = {
      weekKey: '2026-W38',
      revision: 1,
      cooperativeConfirmedCount: 1,
      cooperativeGoal: 10,
      ownParticipantId: cloudId(60),
      nominations: [],
      encouragements: [],
      rows: [
        {
          participantId: cloudId(60),
          nickname: { ar: 'شجرة', en: 'Tree' },
          treeAvatarToken: 'ghaf_leaf',
          completedLeafCount: 1,
          score: 20,
          position: 1,
        },
        {
          participantId: cloudId(61),
          nickname: { ar: 'ورقة', en: 'Leaf' },
          treeAvatarToken: 'sidr_sapling',
          completedLeafCount: 0,
          score: 0,
          position: 2,
        },
      ],
    };
    const result = content(
      CloudLeagueView({
        league,
        currentWeekKey: league.weekKey,
        child,
        parent: false,
        busy: false,
        onNominate: vi.fn(),
        onRest: vi.fn(),
        onEncourage: vi.fn(),
      }),
    );
    expect(result).toContain('Tree');
    expect(result).toContain('20 points');
    expect(result).toContain('Great growing!');
    expect(result).not.toContain('Choose five Challenge Leaves');
    expect(result).not.toContain('Pause this Child');
    expect(result).not.toContain('Test Child');
  });

  it('keeps Arabic and English migration resources in parity', () => {
    expect(Object.keys(cloudGrowthResources.ar).sort()).toEqual(
      Object.keys(cloudGrowthResources.en).sort(),
    );
  });
});
