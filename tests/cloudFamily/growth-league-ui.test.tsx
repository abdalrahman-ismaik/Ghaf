import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudGrowthChildPicker, GrowthPanel } from '../../src/components/cloudFamily/GrowthPanel';
import { LearningPanel } from '../../src/components/cloudFamily/LearningPanel';
import { LeaguePanel } from '../../src/components/cloudFamily/LeaguePanel';
import { BADGE_REGISTRY } from '../../src/features/growth/badgeRegistry';
import { cloudFamilyGrowthResources } from '../../src/i18n/cloudFamilyGrowth';
import { resources } from '../../src/i18n/resources';
import type {
  CloudChild,
  CloudCommand,
  CloudCommandResult,
  CloudSnapshot,
} from '../../src/models/cloudFamily';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  locale: 'en' as 'ar' | 'en',
  snapshot: null as CloudSnapshot | null,
  command: vi.fn<(command: CloudCommand) => Promise<CloudCommandResult | null>>(),
}));
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: (initial: unknown) => {
      const slot = (mock.slots[mock.cursor++] ??= { value: initial });
      return [
        slot.value,
        (next: unknown) => {
          slot.value = typeof next === 'function' ? next(slot.value) : next;
        },
      ];
    },
    useRef: (initial: unknown) =>
      (mock.slots[mock.cursor++] ??= { value: { current: initial } }).value,
  };
});
vi.mock('react-native', () => ({
  View: 'View',
  StyleSheet: { create: (value: unknown) => value },
  Platform: { OS: 'web', select: (value: Record<string, unknown>) => value.web ?? value.default },
}));
vi.mock('@/components/access', () => ({
  ChoiceChip: 'ChoiceChip',
  AccessTextField: 'AccessTextField',
  StatusBanner: 'StatusBanner',
}));
vi.mock('@/components/access/BotanicalAvatar', () => ({
  BotanicalAvatar: 'BotanicalAvatar',
  botanicalAvatarOptions: ['ghaf_tree', 'leaf', 'flower', 'energy_leaf', 'water_drop'],
}));
vi.mock('@/components/primitives', () => ({ Text: 'Text', Button: 'Button' }));
vi.mock('@/components/family-growth/GardenLandscape', () => ({
  GardenLandscape: 'GardenLandscape',
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: object) => unknown) =>
    selector({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      const tree = {
        ...resources[mock.locale].translation,
        cloudFamily: cloudFamilyGrowthResources[mock.locale],
      };
      const result = key
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[part]
              : undefined,
          tree,
        );
      return Object.entries(values ?? {}).reduce(
        (label, [name, value]) => label.replace(`{{${name}}}`, String(value)),
        typeof result === 'string' ? result : key,
      );
    },
  }),
}));

const familyId = '10000000-0000-4000-8000-000000000001';
const childA = '20000000-0000-4000-8000-000000000001';
const childB = '20000000-0000-4000-8000-000000000002';
const circleId = '30000000-0000-4000-8000-000000000001';
const packageId = 'learning.mangrove_roots.v1';
function child(id: string, nickname: string): CloudChild {
  return {
    id,
    family_id: familyId,
    nickname,
    age_band: '9_11',
    age10_plus_confirmed: true,
    preferred_language: 'both',
    avatar_id: 'ghaf_tree',
    active: true,
    preferences: {
      sex: null,
      interests: [],
      hobbies: [],
      accessibility: [],
      support: [],
      personalization_enabled: false,
      custom_interest: null,
      custom_hobby: null,
      custom_support: null,
      custom_accessibility: null,
    },
  };
}
function fixture(): CloudSnapshot {
  return {
    schema_version: 1,
    revision: 1,
    actor: {
      role: 'parent',
      family_id: familyId,
      child_id: null,
      user_id: '40000000-0000-4000-8000-000000000001',
    },
    family: {
      id: familyId,
      name: 'Saved family',
      locale: 'en',
      revision: 1,
      guardian_names: [],
      relatives: [],
    },
    children: [child(childA, 'Saved A'), child(childB, 'Saved B')],
    categories: [],
    landscapes: [],
    templates: [],
    tasks: [],
    assignments: [],
    submissions: [],
    check_ins: [],
    adjustments: [],
    recognitions: [],
    seed_entries: [],
    saved_templates: [],
    reveals: [],
    permissions: [],
    community: { status: 'continued', revision: 1 },
    landscape_progress: [childA, childB].flatMap((id) =>
      (['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'] as const).map((landscape) => ({
        child_id: id,
        landscape_id: landscape,
        cumulative_seeds: 0,
        stage: 'seed',
        next_threshold: 20,
      })),
    ),
    impact_paths: [
      {
        child_id: childA,
        lifetime_seeds: 0,
        reached_thresholds: [],
        next_threshold: 120,
        chapter_state: 'not_entered',
      },
    ],
    legacy_records: [],
    legacy_available: false,
    extras: {
      rewards: [],
      masroofi: { cards: [], promises: [], transactions: [], purchaseCatalog: [] },
      studyPlans: [],
      goals: [],
      learning: {
        packages: [
          {
            id: packageId,
            labelAr: 'جذور القرم',
            labelEn: 'Mangrove Roots',
            unlockThreshold: 132,
            available: true,
            unlockedChildIds: [childA],
            steps: {
              story: ['story_frame_1', 'story_frame_2'],
              accessible: ['accessible_section_1', 'accessible_section_2'],
            },
            checkOptions: ['habitat_support_and_care', 'visit_or_task_reward'],
          },
        ],
        progress: [],
        completions: [],
        badges: [],
      },
      league: { circles: [], invitations: [] },
    },
  };
}
type Node = ReactElement<Record<string, unknown>>;
function nodes(tree: ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!isValidElement<Record<string, unknown>>(tree)) return [];
  return [tree, ...nodes(tree.props.children as ReactNode)];
}
function byId(tree: ReactNode, id: string) {
  return nodes(tree).find((node) => node.props.testID === id);
}
function content(tree: ReactNode): string {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(content).join(' ');
  if (!isValidElement<Record<string, unknown>>(tree)) return '';
  return content(tree.props.children as ReactNode);
}
function render(Panel: typeof GrowthPanel) {
  mock.cursor = 0;
  return Panel({ snapshot: mock.snapshot!, busy: false, command: mock.command });
}
function press(tree: ReactNode, id: string) {
  const node = byId(tree, id);
  expect(node, id).toBeDefined();
  expect(node!.props.disabled).not.toBe(true);
  (node!.props.onPress as () => void)();
}
function enter(tree: ReactNode, id: string, value: string) {
  (byId(tree, id)!.props.onChangeText as (value: string) => void)(value);
}
function chooseChild(tree: ReactNode, id: string) {
  const picker = nodes(tree).find((node) => node.type === CloudGrowthChildPicker)!;
  (picker.props.onSelect as (id: string) => void)(id);
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
function childActor() {
  mock.snapshot!.actor = { ...mock.snapshot!.actor, role: 'child', child_id: childA };
}
function leagueFixture() {
  mock.snapshot!.extras.league.circles = [
    {
      id: circleId,
      name: 'Saved circle',
      isOwner: true,
      rows: [
        { nickname: 'Shared A', avatarId: 'ghaf_tree', rank: 1, score: 40, confirmedLeaves: 2 },
        { nickname: 'Shared B', avatarId: 'leaf', rank: 1, score: 40, confirmedLeaves: 2 },
      ],
      canopyContributions: 4,
      greenActions: 1,
      canopyHistory: [{ week: '2026-09-07', contributions: 3 }],
      memberships: [
        {
          childId: childA,
          nickname: 'Shared A',
          avatarId: 'ghaf_tree',
          eligibleAssignmentIds: Array.from({ length: 6 }, (_, index) => `assignment-${index}`),
          nominatedAssignmentIds: [],
          restWeek: false,
        },
      ],
    },
  ];
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.locale = 'en';
  mock.snapshot = fixture();
  mock.command
    .mockReset()
    .mockImplementation(async () => ({ snapshot: mock.snapshot!, result: {} }));
});

describe('saved growth and badge presentation', () => {
  it('starts empty without substituting sample people or earned progress', () => {
    mock.snapshot!.children = [];
    const tree = render(GrowthPanel);
    expect(content(tree)).toContain('Add a child profile');
    expect(byId(tree, 'cloud-garden-landscape')).toBeUndefined();
    expect(mock.command).not.toHaveBeenCalled();
  });
  it('uses the five server stages and shows zero lifetime Seeds without invented awards', () => {
    mock.snapshot!.landscape_progress[0]!.stage = 'shade';
    const tree = render(GrowthPanel);
    const garden = byId(tree, 'cloud-garden-landscape')!;
    const tracks = garden.props.tracks as Record<
      string,
      { cumulativeSeeds: number; stage: string }
    >;
    expect(Object.keys(tracks)).toHaveLength(5);
    expect(tracks.mangrove).toMatchObject({ cumulativeSeeds: 0, stage: 'shade' });
    expect(content(byId(tree, 'cloud-growth-seeds'))).toBe('0 confirmed Seeds');
  });
  it('keeps missing server tracks unavailable instead of inventing a stage', () => {
    mock.snapshot!.landscape_progress = [];
    expect(byId(render(GrowthPanel), 'cloud-garden-landscape')).toBeUndefined();
    expect(content(render(GrowthPanel))).toContain('Refresh the data');
  });
  it('uses server Impact Path station state instead of recalculating unlocks', () => {
    mock.snapshot!.impact_paths[0] = {
      child_id: childA,
      lifetime_seeds: 999,
      reached_thresholds: [120],
      next_threshold: 132,
      chapter_state: 'active',
    };
    const path = content(byId(render(GrowthPanel), 'cloud-impact-path'));
    expect(path.match(/Reached/g)).toHaveLength(1);
    expect(path.match(/Upcoming/g)).toHaveLength(5);
    expect(path).toContain('Next station: 132 Seeds');
  });
  it('shows all 16 server badge definitions and only server-confirmed earned status', () => {
    mock.snapshot!.extras.learning.badges = BADGE_REGISTRY.map((badge, index) => ({
      childId: childA,
      id: badge.id,
      labelAr: badge.label.ar,
      labelEn: `Saved badge ${index}`,
      criteria: badge.criteria,
      earnedAt: index === 0 ? '2026-09-14' : null,
    }));
    const tree = render(GrowthPanel);
    expect(
      nodes(tree).filter((node) => String(node.props.testID).startsWith('cloud-badge-')),
    ).toHaveLength(16);
    expect(content(tree).match(/In progress/g)).toHaveLength(15);
    expect(content(tree)).toContain('Saved badge 0');
  });
  it('shows only the Child actor’s profile even if another profile is present', () => {
    childActor();
    mock.snapshot!.seed_entries = [
      {
        id: 'entry',
        child_id: childB,
        recognition_id: 'recognition',
        amount: 900,
        created_at: '2026-09-14',
      },
    ];
    expect(content(byId(render(GrowthPanel), 'cloud-growth-seeds'))).toBe('0 confirmed Seeds');
    expect(nodes(render(GrowthPanel)).some((node) => node.type === CloudGrowthChildPicker)).toBe(
      false,
    );
  });
});

describe('persisted equal-credit learning', () => {
  it('does not unlock content from a locally displayed high Seed total', () => {
    childActor();
    mock.snapshot!.extras.learning.packages[0]!.unlockedChildIds = [];
    mock.snapshot!.seed_entries = [
      {
        id: 'entry',
        child_id: childA,
        recognition_id: 'recognition',
        amount: 999,
        created_at: '2026-09-14',
      },
    ];
    expect(byId(render(LearningPanel), 'cloud-learning-locked')).toBeDefined();
    expect(byId(render(LearningPanel), 'cloud-learning-start')).toBeUndefined();
  });
  it('keeps Parent learning read-only', () => {
    expect(byId(render(LearningPanel), 'cloud-learning-start')).toBeUndefined();
    expect(content(render(LearningPanel))).toContain('Parent view');
  });
  it('starts the selected accessible route once under rapid taps', async () => {
    childActor();
    press(render(LearningPanel), 'cloud-learning-route-accessible');
    const tree = render(LearningPanel);
    press(tree, 'cloud-learning-start');
    press(tree, 'cloud-learning-start');
    expect(mock.command).toHaveBeenCalledTimes(1);
    expect(mock.command).toHaveBeenCalledWith({
      type: 'learning.start',
      learningId: packageId,
      route: 'accessible',
    });
    await settle();
  });
  it('uses the saved check result and requires saved steps before completion', async () => {
    childActor();
    mock.snapshot!.extras.learning.progress = [
      {
        childId: childA,
        learningId: packageId,
        route: 'story',
        completedStepIds: ['story_frame_1', 'story_frame_2'],
        checkSatisfied: false,
      },
    ];
    expect(byId(render(LearningPanel), 'cloud-learning-complete')).toBeUndefined();
    press(render(LearningPanel), 'cloud-learning-check-visit_or_task_reward');
    await settle();
    expect(
      nodes(render(LearningPanel)).some(
        (node) => node.props.message === cloudFamilyGrowthResources.en.learning.retry,
      ),
    ).toBe(true);
    mock.snapshot!.extras.learning.progress[0]!.checkSatisfied = true;
    press(render(LearningPanel), 'cloud-learning-complete');
    await settle();
    expect(mock.command).toHaveBeenLastCalledWith({
      type: 'learning.complete',
      learningId: packageId,
      route: 'story',
    });
  });
  it('treats a saved completion as shared across routes without offering another credit', () => {
    childActor();
    mock.snapshot!.extras.learning.completions = [
      { childId: childA, learningId: packageId, completedAt: '2026-09-14' },
    ];
    press(render(LearningPanel), 'cloud-learning-route-accessible');
    expect(byId(render(LearningPanel), 'cloud-learning-start')).toBeUndefined();
    expect(byId(render(LearningPanel), 'cloud-learning-complete')).toBeUndefined();
  });
});

describe('saved League membership and privacy', () => {
  it('does not create sample participants for an empty League', () => {
    expect(content(render(LeaguePanel))).toContain('has not joined');
    expect(byId(render(LeaguePanel), 'cloud-league-shared-rows')).toBeUndefined();
  });
  it('retains a failed circle-name draft across language changes', async () => {
    mock.command.mockResolvedValue(null);
    enter(render(LeaguePanel), 'cloud-league-name', 'اسم محفوظ');
    press(render(LeaguePanel), 'cloud-league-create');
    await settle();
    mock.locale = 'ar';
    const tree = render(LeaguePanel);
    expect(byId(tree, 'cloud-league-name')!.props.value).toBe('اسم محفوظ');
    expect(
      nodes(tree).some(
        (node) => node.props.message === cloudFamilyGrowthResources.ar.league.failed,
      ),
    ).toBe(true);
  });
  it('renders server ties and canopy counts without exposing private family fields', () => {
    leagueFixture();
    childActor();
    const tree = render(LeaguePanel);
    const rows = content(byId(tree, 'cloud-league-shared-rows'));
    expect(rows.match(/Rank 1/g)).toHaveLength(2);
    expect(rows).toContain('40 of 100');
    expect(rows).not.toContain(childA);
    expect(rows).not.toContain('Saved A');
    expect(content(byId(tree, 'cloud-league-canopy'))).toContain('4 family canopy');
    expect(byId(tree, 'cloud-league-create')).toBeUndefined();
    expect(byId(tree, 'cloud-league-invite')).toBeUndefined();
  });
  it('requires an explicit saved child and nickname before joining', async () => {
    leagueFixture();
    chooseChild(render(LeaguePanel), childB);
    expect(byId(render(LeaguePanel), 'cloud-league-join')!.props.disabled).toBe(true);
    enter(render(LeaguePanel), 'cloud-league-nickname', 'Shared nickname');
    press(render(LeaguePanel), 'cloud-league-join');
    await settle();
    expect(mock.command).toHaveBeenCalledWith({
      type: 'circle.join_child',
      circleId,
      childId: childB,
      nickname: 'Shared nickname',
      avatarId: 'ghaf_tree',
    });
  });
  it('requires exactly five saved eligible assignment IDs and preserves selection across locale changes', async () => {
    leagueFixture();
    for (let index = 0; index < 6; index += 1) {
      mock.snapshot!.tasks.push({
        id: `task-${index}`,
        child_id: childA,
        family_id: familyId,
        version: 1,
        title: `Private task ${index}`,
        status: 'assigned',
        template_id: null,
        definition_of_done: 'Done',
        steps: ['Step'],
        content_locale: 'en',
        category_id: 'green_impact',
        landscape_id: 'mangrove',
        recognition_mode: 'standard',
        routine_phase: 'acquisition',
        seed_award: 12,
        visibility_scope: 'household',
        circle_eligible: true,
        reward_eligible: true,
        league_eligible: true,
        created_at: '2026-09-14',
        permitted_help: 'An adult may demonstrate sorting.',
        supervision: 'A Parent checks the materials first.',
        recurrence: 'once',
        positive_action: 'Sort clean paper for reuse.',
        why_it_matters: 'Keep useful paper ready for another use.',
        safety: {
          adult_pre_check: 'Check that all paper is clean and dry.',
          adult_second_check: 'Check the finished sorting together.',
          adult_owned_actions: ['Remove unsafe materials.'],
          child_allowed_actions: ['Sort the prepared paper.'],
          excluded_hazards: ['Sharp or contaminated materials.'],
          stop_and_ask_adult: 'Stop and ask a Parent if anything is unfamiliar.',
          route_constraint: null,
          indoor_alternative: null,
          aftercare: null,
        },
      });
      mock.snapshot!.assignments.push({
        id: `assignment-${index}`,
        child_id: childA,
        family_id: familyId,
        task_id: `task-${index}`,
        task_version: 1,
        state: 'assigned',
        help_requested: false,
        created_at: '2026-09-14',
      });
    }
    chooseChild(render(LeaguePanel), childA);
    mock.snapshot!.assignments[0]!.state = 'chosen';
    mock.snapshot!.tasks[1]!.visibility_scope = 'child_guardian';
    const membership = mock.snapshot!.extras.league.circles[0]!.memberships[0]!;
    membership.eligibleAssignmentIds = membership.eligibleAssignmentIds.filter(
      (id) => id !== 'assignment-2',
    );
    for (let index = 0; index < 3; index += 1) {
      expect(byId(render(LeaguePanel), `cloud-league-leaf-assignment-${index}`)).toBeUndefined();
    }
    mock.snapshot!.assignments[0]!.state = 'assigned';
    mock.snapshot!.tasks[1]!.visibility_scope = 'household';
    membership.eligibleAssignmentIds.push('assignment-2');
    expect(byId(render(LeaguePanel), 'cloud-league-nominate')!.props.disabled).toBe(true);
    for (let index = 0; index < 5; index += 1)
      press(render(LeaguePanel), `cloud-league-leaf-assignment-${index}`);
    expect(byId(render(LeaguePanel), 'cloud-league-leaf-assignment-5')!.props.disabled).toBe(true);
    mock.locale = 'ar';
    press(render(LeaguePanel), 'cloud-league-nominate');
    await settle();
    expect(mock.command).toHaveBeenCalledWith({
      type: 'league.nominate',
      circleId,
      childId: childA,
      assignmentIds: [
        'assignment-0',
        'assignment-1',
        'assignment-2',
        'assignment-3',
        'assignment-4',
      ],
    });
  });
});

it('keeps Arabic and English growth resource keys equivalent', () => {
  const keys = (value: object, prefix = ''): string[] =>
    Object.entries(value).flatMap(([key, child]) =>
      typeof child === 'object' ? keys(child as object, `${prefix}${key}.`) : [`${prefix}${key}`],
    );
  expect(keys(cloudFamilyGrowthResources.ar)).toEqual(keys(cloudFamilyGrowthResources.en));
});
