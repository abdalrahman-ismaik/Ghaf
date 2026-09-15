import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoalsPanel } from '../../src/components/cloudFamily/GoalsPanel';
import { MasroofiPanel } from '../../src/components/cloudFamily/MasroofiPanel';
import { RewardsPanel } from '../../src/components/cloudFamily/RewardsPanel';
import {
  StudyPanel,
  cloudDate,
  cloudFils,
  type CloudPanelProps,
} from '../../src/components/cloudFamily/StudyPanel';
import { cloudFamilyRewardsResources } from '../../src/i18n/cloudFamilyRewards';
import type { CloudCommandResult, CloudReward, CloudSnapshot } from '../../src/models/cloudFamily';
import { MASROOFI_CATEGORIES } from '../../src/models/masroofi';
import type { AcademicGoal } from '../../src/models/study';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  locale: 'ar' as 'ar' | 'en',
}));
vi.mock('react', async (original) => {
  const react = await original<typeof import('react')>();
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
  Platform: {
    OS: 'android',
    select: (value: Record<string, unknown>) => value.android ?? value.default,
  },
  View: 'View',
  Switch: 'Switch',
  StyleSheet: { create: (value: unknown) => value, hairlineWidth: 1 },
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Input: 'Input', Text: 'Text' }));
vi.mock('@/components/masroofi/MasroofiCard', () => ({ MasroofiCard: 'MasroofiCard' }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: mock.locale, resolvedLanguage: mock.locale },
    t: (key: string, values?: Record<string, unknown>) => {
      let translated: unknown = cloudFamilyRewardsResources[mock.locale];
      for (const part of key.replace(/^cloudFamily\./, '').split('.'))
        translated = (translated as Record<string, unknown>)?.[part];
      return typeof translated === 'string'
        ? translated.replace(/{{(\w+)}}/g, (_, name: string) => String(values?.[name] ?? ''))
        : key;
    },
  }),
}));

type Element = ReactElement<Record<string, unknown>>;
const childId = '92ef14db-b81c-40d5-a9b9-a78b584e0422';
function snapshot(): CloudSnapshot {
  return {
    schema_version: 1,
    revision: 1,
    actor: { role: 'parent', family_id: 'family-uuid', child_id: null, user_id: 'parent-uuid' },
    family: {
      id: 'family-uuid',
      name: 'Test family',
      locale: 'ar',
      revision: 1,
      guardian_names: [],
      relatives: [],
    },
    children: [
      {
        id: childId,
        family_id: 'family-uuid',
        nickname: 'اسم محفوظ طويل للاختبار',
        age_band: '9_11',
        age10_plus_confirmed: true,
        preferred_language: 'both',
        avatar_id: 'tree',
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
      },
    ],
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
    landscape_progress: [],
    legacy_records: [],
    legacy_available: false,
    saved_templates: [],
    reveals: [],
    impact_paths: [],
    permissions: [],
    community: { status: 'continued', revision: 1 },
    extras: {
      rewards: [],
      masroofi: { cards: [], promises: [], transactions: [], purchaseCatalog: [] },
      studyPlans: [],
      goals: [],
      learning: { packages: [], progress: [], completions: [], badges: [] },
      league: { circles: [], invitations: [] },
    },
  };
}
function descendants(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  const result = [node];
  if (
    typeof node.type === 'function' &&
    [
      'CloudStudyRow',
      'CloudGoalRow',
      'CloudMemberPicker',
      'CloudSwitch',
      'CloudEditReview',
    ].includes(node.type.name)
  ) {
    result.push(
      ...descendants((node.type as (props: Record<string, unknown>) => ReactNode)(node.props)),
    );
  } else result.push(...descendants(node.props.children as ReactNode));
  return result;
}
function harness(Component: (props: CloudPanelProps) => ReactNode, data = snapshot()) {
  const command = vi.fn<CloudPanelProps['command']>().mockResolvedValue(null);
  const props: CloudPanelProps = { snapshot: data, busy: false, command };
  let nodes: Element[] = [];
  function render() {
    mock.cursor = 0;
    nodes = descendants(Component(props));
    return nodes;
  }
  function get(id: string) {
    const matches = nodes.filter((node) => node.props.testID === id);
    const found = matches.find((node) => node.type === 'Switch') ?? matches[0];
    if (!found) throw new Error(`Missing ${id}`);
    return found;
  }
  function has(id: string) {
    return nodes.some((node) => node.props.testID === id);
  }
  function press(id: string) {
    const handler = get(id).props.onPress as () => void;
    handler();
    render();
  }
  function enter(id: string, value: string) {
    (get(id).props.onChangeText as (value: string) => void)(value);
    render();
  }
  function allText() {
    return nodes
      .map((node) => (typeof node.props.children === 'string' ? node.props.children : ''))
      .join(' ');
  }
  render();
  return { props, command, render, get, has, press, enter, allText };
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
function card(data: CloudSnapshot) {
  data.extras.masroofi.cards.push({
    childId,
    balanceFils: 500,
    controlsVersion: 1,
    ageEligible: true,
    origin: 'simulated',
    controls: {
      frozen: false,
      onlineAllowed: false,
      allowedCategories: ['stationery'],
      perPurchaseLimitFils: 2000,
      dailyLimitFils: 5000,
    },
  });
}
function goal(overrides: Partial<AcademicGoal> = {}): AcademicGoal {
  return {
    id: 'goal-uuid',
    childId,
    createdBy: 'parent',
    subject: 'Reading',
    title: 'Read together',
    nextStep: 'Read a page',
    parentSupport: 'Sit together',
    criterion: { kind: 'practice_count', target: 3 },
    prize: { kind: 'gift', label: 'A chosen book' },
    status: 'proposed',
    revision: 1,
    parentApprovedRevision: null,
    childAcceptedRevision: null,
    submissions: [],
    prizeStatus: 'promised',
    createdAt: '2026-09-14T00:00:00Z',
    updatedAt: '2026-09-14T00:00:00Z',
    acknowledgedAt: null,
    unlockedAt: null,
    givenAt: null,
    ...overrides,
  };
}
function reward(): CloudReward {
  return {
    id: 'reward-uuid',
    childId,
    label: 'A chosen book',
    kind: 'gift',
    amountFils: null,
    month: '2026-09',
    monthlyMaximumFils: 0,
    milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
    status: 'promised',
    version: 1,
    eligibleSeeds: 0,
    unlockedAt: null,
    givenAt: null,
  };
}
beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.locale = 'ar';
});

describe('persisted reward and study panels', () => {
  it('keeps empty server data empty across all four panels', () => {
    for (const Panel of [StudyPanel, GoalsPanel, RewardsPanel, MasroofiPanel]) {
      mock.slots = [];
      const data = snapshot();
      data.children = [];
      const ui = harness(Panel, data);
      expect(ui.command).not.toHaveBeenCalled();
      expect(ui.has('cloud-masroofi-balance')).toBe(false);
      expect(ui.allText()).not.toContain('Salem');
      expect(ui.allText()).not.toContain('Alya');
    }
  });
  it('retains study text and explicit member across locale changes and failed writes', async () => {
    const ui = harness(StudyPanel);
    ui.press('cloud-study-create');
    expect(ui.get('cloud-study-save').props.disabled).toBe(true);
    ui.press(`cloud-member-${childId}`);
    ui.enter('cloud-study-subject', 'العلوم Science');
    ui.enter('cloud-study-title', 'خطة محفوظة');
    ui.enter('cloud-study-next-step', 'قراءة صفحة');
    mock.locale = 'en';
    ui.render();
    expect(ui.get('cloud-study-subject').props.value).toBe('العلوم Science');
    expect(ui.get(`cloud-member-${childId}`).props.selected).toBe(true);
    ui.press('cloud-study-save');
    await settle();
    ui.render();
    expect(ui.command).toHaveBeenCalledWith({
      type: 'study.create',
      childId,
      input: {
        subject: 'العلوم Science',
        title: 'خطة محفوظة',
        nextStep: 'قراءة صفحة',
        durationMinutes: 15,
        dueDate: null,
        revisitDate: null,
      },
    });
    expect(ui.get('cloud-study-title').props.value).toBe('خطة محفوظة');
  });
  it('guards duplicate asynchronous saves before a busy rerender', async () => {
    const ui = harness(StudyPanel);
    let resolve!: (value: CloudCommandResult | null) => void;
    ui.command.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    ui.press('cloud-study-create');
    ui.press(`cloud-member-${childId}`);
    ui.enter('cloud-study-subject', 'Math');
    ui.enter('cloud-study-title', 'One step');
    ui.enter('cloud-study-next-step', 'Read');
    const handler = ui.get('cloud-study-save').props.onPress as () => void;
    handler();
    handler();
    expect(ui.command).toHaveBeenCalledTimes(1);
    resolve(null);
    await settle();
    ui.render();
    expect(ui.has('cloud-study-editor')).toBe(true);
  });
  it('allows Child study completion through one command and withholds Parent completion controls', () => {
    const data = snapshot();
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    data.extras.studyPlans.push({
      id: 'plan-uuid',
      childId,
      createdBy: 'parent',
      subject: 'Math',
      title: 'Read',
      nextStep: 'One page',
      durationMinutes: 10,
      dueDate: null,
      revisitDate: null,
      status: 'active',
      helpRequest: null,
      createdAt: '',
      updatedAt: '',
      completedAt: null,
    });
    const ui = harness(StudyPanel, data);
    ui.press('cloud-study-complete-plan-uuid');
    expect(ui.command).toHaveBeenCalledExactlyOnceWith({ type: 'study.complete', id: 'plan-uuid' });
    data.actor = { ...data.actor, role: 'parent', child_id: null };
    ui.render();
    expect(ui.has('cloud-study-complete-plan-uuid')).toBe(false);
  });
  it('never renders an unearned Child amount even if a malformed projection includes it', () => {
    mock.locale = 'en';
    const data = snapshot();
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    card(data);
    data.extras.masroofi.promises.push({
      id: 'promise-uuid',
      childId,
      assignmentId: 'assignment-uuid',
      taskVersion: 1,
      status: 'promised',
      amountFils: 9900,
    });
    const ui = harness(MasroofiPanel, data);
    expect(ui.allText()).toContain('Its amount appears after recognition');
    expect(ui.allText()).not.toContain('99');
    expect(ui.has('cloud-masroofi-earned')).toBe(false);
  });
  it('requires persisted age eligibility and a visible Parent attestation before card enable', () => {
    const data = snapshot();
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    expect(ui.get('cloud-masroofi-enable').props.disabled).toBe(true);
    (ui.get('cloud-masroofi-attest').props.onValueChange as (value: boolean) => void)(true);
    ui.render();
    ui.press('cloud-masroofi-enable');
    expect(ui.command).toHaveBeenCalledWith({ type: 'masroofi.enable', childId });
    data.children[0]!.age_band = '6_8';
    ui.render();
    expect(ui.has('cloud-masroofi-enable')).toBe(false);
  });
  it('offers all eight independently editable spending categories from an existing card', () => {
    const data = snapshot();
    card(data);
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    ui.press('cloud-masroofi-edit-controls');
    for (const category of MASROOFI_CATEGORIES)
      expect(ui.has(`cloud-masroofi-category-${category}`)).toBe(true);
    (ui.get('cloud-masroofi-category-books').props.onValueChange as (value: boolean) => void)(true);
    ui.render();
    ui.press('cloud-masroofi-save-controls');
    expect(ui.command).toHaveBeenCalledWith({
      type: 'masroofi.controls',
      childId,
      expectedVersion: 1,
      controls: {
        frozen: false,
        onlineAllowed: false,
        allowedCategories: ['stationery', 'books'],
        perPurchaseLimitFils: 2000,
        dailyLimitFils: 5000,
      },
    });
  });
  it('uses only server practice products and sends a Child purchase without minting local balance', async () => {
    const data = snapshot();
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    card(data);
    data.extras.masroofi.purchaseCatalog.push({
      id: 'stationery',
      category: 'stationery',
      online: false,
      amountFils: 300,
    });
    const ui = harness(MasroofiPanel, data);
    ui.press('cloud-masroofi-purchase-stationery');
    await settle();
    ui.render();
    expect(ui.command).toHaveBeenCalledExactlyOnceWith({
      type: 'masroofi.purchase',
      fixtureId: 'stationery',
    });
    expect(data.extras.masroofi.cards[0]!.balanceFils).toBe(500);
    expect(ui.has('cloud-masroofi-purchase-game_online')).toBe(false);
  });
  it('preserves card balance and history after an age correction while blocking funding and spending', () => {
    const data = snapshot();
    card(data);
    data.extras.masroofi.cards[0]!.ageEligible = false;
    data.extras.masroofi.transactions.push({
      id: 'old-credit',
      childId,
      kind: 'top_up',
      amountFils: 500,
      status: 'credited',
      declineReason: null,
      fixtureId: null,
      day: '2026-09-14',
      balanceAfterFils: 500,
      assignmentId: null,
    });
    data.extras.masroofi.purchaseCatalog.push({
      id: 'stationery',
      category: 'stationery',
      online: false,
      amountFils: 300,
    });
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    expect(ui.has('cloud-masroofi-age-unavailable')).toBe(true);
    expect(ui.has('cloud-masroofi-balance')).toBe(true);
    expect(ui.has('cloud-masroofi-transaction-old-credit')).toBe(true);
    ui.enter('cloud-masroofi-topup-amount', '5');
    expect(ui.get('cloud-masroofi-topup').props.disabled).toBe(true);
    ui.press('cloud-masroofi-topup');
    expect(ui.command).not.toHaveBeenCalled();
    expect(ui.get('cloud-masroofi-edit-controls').props.disabled).toBe(false);
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    ui.render();
    expect(ui.get('cloud-masroofi-purchase-stationery').props.disabled).toBe(true);
    ui.press('cloud-masroofi-purchase-stationery');
    expect(ui.command).not.toHaveBeenCalled();
    expect(data.extras.masroofi.cards[0]!.balanceFils).toBe(500);
    expect(ui.has('cloud-masroofi-transaction-old-credit')).toBe(true);
  });
  it('attaches a fixed reward only to a server-eligible unaccepted assignment', () => {
    const data = snapshot();
    card(data);
    data.tasks.push({
      id: 'task-uuid',
      family_id: data.family.id,
      child_id: childId,
      version: 2,
      status: 'assigned',
      template_id: 'template-uuid',
      title: 'Sort clean paper',
      definition_of_done: 'Paper sorted',
      steps: ['Sort'],
      content_locale: 'en',
      category_id: 'green_impact',
      landscape_id: 'ghaf',
      recognition_mode: 'standard',
      routine_phase: 'acquisition',
      seed_award: 12,
      visibility_scope: 'household',
      circle_eligible: true,
      reward_eligible: true,
      league_eligible: true,
      created_at: '',
      permitted_help: 'With an adult',
      supervision: 'An adult stays nearby',
      recurrence: 'once',
      positive_action: 'Sort safe clean paper',
      why_it_matters: 'Practise sorting',
      safety: {
        adult_pre_check: 'Check paper',
        adult_second_check: 'Check space',
        adult_owned_actions: ['Check materials'],
        child_allowed_actions: ['Sort paper'],
        excluded_hazards: ['Sharp objects'],
        stop_and_ask_adult: 'Ask about anything unfamiliar',
        route_constraint: null,
        indoor_alternative: null,
        aftercare: null,
      },
    });
    data.assignments.push(
      {
        id: 'assignment-uuid',
        family_id: data.family.id,
        child_id: childId,
        task_id: 'task-uuid',
        task_version: 2,
        state: 'assigned',
        help_requested: false,
        created_at: '',
      },
      {
        id: 'accepted-uuid',
        family_id: data.family.id,
        child_id: childId,
        task_id: 'task-uuid',
        task_version: 2,
        state: 'chosen',
        help_requested: false,
        created_at: '',
      },
    );
    data.extras.masroofi.promises.push({
      id: 'prior-version-promise',
      childId,
      assignmentId: 'assignment-uuid',
      taskVersion: 1,
      status: 'promised',
      amountFils: 700,
    });
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    expect(ui.has('cloud-masroofi-task-accepted-uuid')).toBe(false);
    ui.press('cloud-masroofi-task-assignment-uuid');
    ui.enter('cloud-masroofi-reward-amount', '٥');
    data.tasks[0]!.version = 3;
    data.assignments[0]!.task_version = 3;
    ui.render();
    expect(ui.get('cloud-masroofi-promise').props.disabled).toBe(true);
    expect(ui.get('cloud-masroofi-reward-amount').props.value).toBe('٥');
    ui.press('cloud-masroofi-task-assignment-uuid');
    data.extras.masroofi.cards[0]!.ageEligible = false;
    ui.render();
    expect(ui.get('cloud-masroofi-promise').props.disabled).toBe(true);
    ui.press('cloud-masroofi-promise');
    expect(ui.command).not.toHaveBeenCalled();
    data.extras.masroofi.cards[0]!.ageEligible = true;
    ui.render();
    ui.press('cloud-masroofi-promise');
    expect(ui.command).toHaveBeenCalledExactlyOnceWith({
      type: 'masroofi.promise',
      assignmentId: 'assignment-uuid',
      expectedTaskVersion: 3,
      amountFils: 500,
    });
  });
  it('preserves unlocked Family Reward terms and offers only the Parent give transition', () => {
    const data = snapshot();
    data.extras.rewards.push({
      id: 'reward-uuid',
      childId,
      label: 'A family visit',
      kind: 'experience',
      amountFils: null,
      month: '2026-09',
      monthlyMaximumFils: 0,
      milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
      status: 'unlocked',
      version: 1,
      eligibleSeeds: 12,
      unlockedAt: '2026-09-14',
      givenAt: null,
    });
    const ui = harness(RewardsPanel, data);
    expect(ui.has('cloud-reward-edit-reward-uuid')).toBe(false);
    ui.press('cloud-reward-give-reward-uuid');
    expect(ui.command).toHaveBeenCalledWith({ type: 'reward.give', id: 'reward-uuid' });
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    ui.render();
    expect(ui.has('cloud-reward-give-reward-uuid')).toBe(false);
  });
  it('requires current Parent approval before Child acceptance and keeps accepted goal terms immutable', () => {
    const data = snapshot();
    data.actor = { ...data.actor, role: 'child', child_id: childId };
    data.extras.goals.push(goal());
    const ui = harness(GoalsPanel, data);
    expect(ui.get('cloud-goal-accept-goal-uuid').props.disabled).toBe(true);
    data.extras.goals[0]!.parentApprovedRevision = 1;
    ui.render();
    expect(ui.get('cloud-goal-accept-goal-uuid').props.disabled).toBe(false);
    data.extras.goals[0]!.childAcceptedRevision = 1;
    data.extras.goals[0]!.status = 'active';
    ui.render();
    expect(ui.has('cloud-goal-edit-goal-uuid')).toBe(false);
    expect(ui.has('cloud-goal-submit-goal-uuid')).toBe(true);
  });
  it('retains a Parent acknowledgement after a failed confirmation and sends the exact submission UUID', async () => {
    const data = snapshot();
    data.extras.goals.push(
      goal({
        status: 'awaiting_confirmation',
        childAcceptedRevision: 1,
        parentApprovedRevision: 1,
        submissions: [
          {
            id: 'submission-uuid',
            result: { kind: 'practice_count', count: 3 },
            submittedAt: '',
            reviewedAt: null,
            acknowledgement: null,
            metCriterion: null,
          },
        ],
      }),
    );
    const ui = harness(GoalsPanel, data);
    ui.enter('cloud-goal-acknowledgement-goal-uuid', 'جرّبت استراتيجية واضحة');
    ui.press('cloud-goal-confirm-goal-uuid');
    await settle();
    ui.render();
    expect(ui.command).toHaveBeenCalledWith({
      type: 'goal.confirm',
      id: 'goal-uuid',
      submissionId: 'submission-uuid',
      acknowledgement: 'جرّبت استراتيجية واضحة',
    });
    expect(ui.get('cloud-goal-acknowledgement-goal-uuid').props.value).toBe(
      'جرّبت استراتيجية واضحة',
    );
  });
  it('blocks a changed reward until its latest terms are reviewed, without replaying the draft', () => {
    const data = snapshot();
    data.extras.rewards.push(reward());
    const ui = harness(RewardsPanel, data);
    ui.press('cloud-reward-edit-reward-uuid');
    ui.enter('cloud-reward-label', 'My retained promise');
    data.revision = 2;
    data.extras.rewards[0] = { ...reward(), label: 'New saved promise', version: 2 };
    ui.render();
    expect(ui.has('cloud-reward-conflict')).toBe(true);
    expect(ui.get('cloud-reward-save').props.disabled).toBe(true);
    expect(ui.get('cloud-reward-label').props.value).toBe('My retained promise');
    ui.press('cloud-reward-save');
    expect(ui.command).not.toHaveBeenCalled();
    ui.press('cloud-reward-conflict-keep');
    expect(ui.command).not.toHaveBeenCalled();
    expect(ui.get('cloud-reward-save').props.disabled).toBe(false);
    ui.press('cloud-reward-save');
    expect(ui.command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'reward.edit',
        id: 'reward-uuid',
        expectedVersion: 2,
        label: 'My retained promise',
      }),
    );
  });
  it('loads the current goal into the draft only after explicit conflict review', () => {
    const data = snapshot();
    data.extras.goals.push(goal());
    const ui = harness(GoalsPanel, data);
    ui.press('cloud-goal-edit-goal-uuid');
    ui.enter('cloud-goal-title', 'My goal draft');
    data.revision = 2;
    data.extras.goals[0] = goal({
      revision: 2,
      title: 'Latest agreed proposal',
      nextStep: 'A newer step',
    });
    mock.locale = 'en';
    ui.render();
    expect(ui.has('cloud-goal-conflict')).toBe(true);
    expect(ui.get('cloud-goal-title').props.value).toBe('My goal draft');
    ui.press('cloud-goal-save');
    expect(ui.command).not.toHaveBeenCalled();
    ui.press('cloud-goal-conflict-reload');
    expect(ui.get('cloud-goal-title').props.value).toBe('Latest agreed proposal');
    expect(ui.get('cloud-goal-next-step').props.value).toBe('A newer step');
    expect(ui.command).not.toHaveBeenCalled();
    ui.press('cloud-goal-save');
    expect(ui.command).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'goal.edit', expectedRevision: 2 }),
    );
  });
  it('preserves card-control drafts through a concurrent freeze and requires review before saving', () => {
    const data = snapshot();
    card(data);
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    ui.press('cloud-masroofi-edit-controls');
    ui.enter('cloud-masroofi-per-purchase', '6.50');
    const current = data.extras.masroofi.cards[0]!;
    data.revision = 2;
    data.extras.masroofi.cards[0] = {
      ...current,
      controlsVersion: 2,
      controls: { ...current.controls, frozen: true, perPurchaseLimitFils: 400 },
    };
    ui.render();
    expect(ui.has('cloud-masroofi-conflict')).toBe(true);
    expect(ui.get('cloud-masroofi-save-controls').props.disabled).toBe(true);
    expect(ui.get('cloud-masroofi-per-purchase').props.value).toBe('6.50');
    ui.press('cloud-masroofi-save-controls');
    expect(ui.command).not.toHaveBeenCalled();
    ui.press('cloud-masroofi-conflict-keep');
    expect(ui.command).not.toHaveBeenCalled();
    ui.press('cloud-masroofi-save-controls');
    expect(ui.command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'masroofi.controls',
        expectedVersion: 2,
        controls: expect.objectContaining({ perPurchaseLimitFils: 650, frozen: false }),
      }),
    );
  });
  it('does not treat an unrelated balance refresh as a changed control draft', () => {
    const data = snapshot();
    card(data);
    const ui = harness(MasroofiPanel, data);
    ui.press(`cloud-member-${childId}`);
    ui.press('cloud-masroofi-edit-controls');
    data.revision = 2;
    data.extras.masroofi.cards[0] = { ...data.extras.masroofi.cards[0]!, balanceFils: 1000 };
    ui.render();
    expect(ui.has('cloud-masroofi-conflict')).toBe(false);
    expect(ui.get('cloud-masroofi-save-controls').props.disabled).toBe(false);
  });
  it('keeps the original version in an already-captured save handler for server rejection', () => {
    const data = snapshot();
    data.extras.rewards.push(reward());
    const ui = harness(RewardsPanel, data);
    ui.press('cloud-reward-edit-reward-uuid');
    const oldHandler = ui.get('cloud-reward-save').props.onPress as () => void;
    ui.props.snapshot = {
      ...data,
      revision: 2,
      extras: { ...data.extras, rewards: [{ ...reward(), version: 2 }] },
    };
    ui.render();
    oldHandler();
    expect(ui.command).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'reward.edit', expectedVersion: 1 }),
    );
  });
  it('normalizes Arabic dates and rejects nonexistent calendar dates', () => {
    expect(cloudDate('٢٠٢٦-٠٩-١٤')).toBe('2026-09-14');
    expect(cloudDate('2026-02-30')).toBe(false);
    expect(cloudDate('')).toBeNull();
  });
  it('retains exact fils and rejects hidden fractional rounding', () => {
    expect(cloudFils('٣٫٥٠')).toBe(350);
    expect(cloudFils('3.501')).toBeNaN();
    expect(cloudFils('')).toBeNaN();
  });
  it('maintains full Arabic and English key parity without synthetic success claims', () => {
    function keys(value: object, prefix = ''): string[] {
      return Object.entries(value).flatMap(([key, entry]) =>
        typeof entry === 'object' ? keys(entry, `${prefix}${key}.`) : [`${prefix}${key}`],
      );
    }
    expect(keys(cloudFamilyRewardsResources.ar).sort()).toEqual(
      keys(cloudFamilyRewardsResources.en).sort(),
    );
  });
});
