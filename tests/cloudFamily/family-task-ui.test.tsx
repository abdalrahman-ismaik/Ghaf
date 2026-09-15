import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FamilyPanel, cloudFamilyConnections } from '../../src/components/cloudFamily/FamilyPanel';
import { TaskEditor, emptyTaskSafety } from '../../src/components/cloudFamily/TaskEditor';
import { TasksPanel, cloudParentTaskRows } from '../../src/components/cloudFamily/TasksPanel';
import {
  ChildTaskPanel,
  cloudChildTaskRows,
} from '../../src/components/cloudFamily/ChildTaskPanel';
import { cloudFamilyCoreResources } from '../../src/i18n/cloudFamilyCore';
import type {
  CloudAssignment,
  CloudChild,
  CloudCommandResult,
  CloudSnapshot,
  CloudTask,
  CloudTemplate,
} from '../../src/models/normalizedCloudFamily';

const hooks = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  locale: 'ar' as 'ar' | 'en',
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slot = (hooks.slots[hooks.cursor++] ??= {
      value: typeof initial === 'function' ? initial() : initial,
    });
    return [
      slot.value,
      (next: unknown) => {
        slot.value = typeof next === 'function' ? next(slot.value) : next;
      },
    ];
  },
  useRef: (initial: unknown) =>
    (hooks.slots[hooks.cursor++] ??= { value: { current: initial } }).value,
}));
vi.mock('react-native', () => ({
  View: 'View',
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (value: unknown) => value },
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => '20000000-0000-4000-8000-000000000001' }));
vi.mock('@/components/access', () => ({
  AccessTextField: 'AccessTextField',
  ChoiceChip: 'ChoiceChip',
  GhafIcon: 'GhafIcon',
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/components/family/FamilyConnectionPlan', () => ({
  FamilyConnectionPlan: 'FamilyConnectionPlan',
}));
vi.mock('@/components/r002a/parent/ParentReviewTaskCard', () => ({
  ParentReviewTaskCard: 'ParentReviewTaskCard',
}));
vi.mock('@/components/r002a/child/ChildTaskPlanCard', () => ({
  ChildTaskPlanCard: 'ChildTaskPlanCard',
}));
vi.mock('@/components/r002a/child/ChildTaskChecklist', () => ({
  ChildTaskChecklist: 'ChildTaskChecklist',
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: hooks.locale, resolvedLanguage: hooks.locale },
    t: (key: string) =>
      key
        .replace(/^normalizedCloudFamily\./, '')
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : key,
          cloudFamilyCoreResources[hooks.locale],
        ),
  }),
}));

const firstId = '10000000-0000-4000-8000-000000000001';
const secondId = '10000000-0000-4000-8000-000000000002';
const child = (id = firstId): CloudChild => ({
  id,
  family_id: 'family-uuid',
  nickname: id === firstId ? 'First test child' : 'Second test child',
  age_band: '9_11',
  age10_plus_confirmed: false,
  preferred_language: 'ar',
  avatar_id: 'ghaf_tree',
  active: true,
  preferences: {
    sex: 'female',
    interests: ['nature'],
    hobbies: [],
    support: [],
    accessibility: [],
    personalization_enabled: false,
    custom_interest: 'A family-authored interest',
    custom_hobby: null,
    custom_support: null,
    custom_accessibility: null,
  },
});
const task = (id: string, childId = firstId, version = 1): CloudTask => ({
  id,
  family_id: 'family-uuid',
  child_id: childId,
  version,
  status: 'assigned',
  template_id: null,
  title: `Task ${id} v${version}`,
  definition_of_done: 'One safe step is complete',
  positive_action: 'A safe step',
  why_it_matters: 'A shared routine',
  steps: ['One safe step'],
  content_locale: 'ar',
  category_id: 'green_impact',
  landscape_id: 'mangrove',
  recognition_mode: 'standard',
  routine_phase: 'acquisition',
  seed_award: 12,
  visibility_scope: 'household',
  circle_eligible: true,
  reward_eligible: false,
  league_eligible: false,
  created_at: '2026-09-14T00:00:00Z',
  permitted_help: 'An adult can help',
  supervision: 'An adult is present',
  safety: emptyTaskSafety(),
  recurrence: 'once',
});
const assignment = (
  id: string,
  taskId: string,
  state: CloudAssignment['state'],
  childId = firstId,
): CloudAssignment => ({
  id,
  family_id: 'family-uuid',
  child_id: childId,
  task_id: taskId,
  task_version: 1,
  state,
  help_requested: false,
  created_at: '2026-09-14T00:00:00Z',
});
const template: CloudTemplate = {
  id: 'template-reference',
  category_id: 'green_impact',
  landscape_id: 'mangrove',
  title_ar: 'خطوة جاهزة',
  title_en: 'Prepared step',
  definition_ar: 'أكمل الخطوة',
  definition_en: 'Complete the step',
  steps_ar: ['خطوة واحدة'],
  steps_en: ['One step'],
  positive_action_ar: 'فعل واضح',
  positive_action_en: 'A clear action',
  why_it_matters_ar: 'روتين عائلي',
  why_it_matters_en: 'A family routine',
  recognition_mode: 'standard',
  routine_phase: 'acquisition',
  seed_award: 12,
  visibility_scope: 'household',
  circle_eligible: true,
  reward_eligible: true,
  league_eligible: true,
  skill_ids: [],
  permitted_help_ar: 'بمساعدة',
  permitted_help_en: 'With help',
  supervision_ar: 'مع بالغ',
  supervision_en: 'With an adult',
  safety_ar: emptyTaskSafety(),
  safety_en: emptyTaskSafety(),
  recurrence: 'once',
  age_bands: ['9_11'],
};
const makeSnapshot = (): CloudSnapshot => ({
  schema_version: 1,
  revision: 1,
  actor: { role: 'parent', family_id: 'family-uuid', child_id: null, user_id: 'adult-uuid' },
  family: {
    id: 'family-uuid',
    name: 'Test family',
    locale: 'ar',
    revision: 1,
    guardian_names: ['Test guardian'],
    relatives: [],
  },
  children: [child(), child(secondId)],
  categories: [
    { id: 'green_impact', label_ar: 'البيئة', label_en: 'Environment', landscape_id: 'mangrove' },
  ],
  landscapes: [],
  templates: [template],
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
  impact_paths: [],
  permissions: [],
  community: { status: 'continued', revision: 1 },
  reveals: [],
  extras: {
    rewards: [],
    masroofi: { cards: [], promises: [], transactions: [], purchaseCatalog: [] },
    studyPlans: [],
    goals: [],
    learning: { packages: [], progress: [], completions: [], badges: [] },
    league: { circles: [], invitations: [] },
  },
});

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
let draw: () => ReactNode;
let snapshot: CloudSnapshot;
const command = vi.fn<(input: unknown) => Promise<CloudCommandResult | null>>();
function nodes(value: ReactNode = tree): Node[] {
  if (Array.isArray(value)) return value.flatMap((item) => nodes(item));
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...nodes((value.props.children as ReactNode) ?? null)];
}
function byId(id: string): Node {
  const found = nodes().find((node) => node.props.testID === id);
  expect(found, `Missing ${id}`).toBeDefined();
  return found!;
}
function render() {
  hooks.cursor = 0;
  tree = draw();
}
function press(id: string) {
  const node = byId(id);
  expect(node.props.disabled).not.toBe(true);
  (node.props.onPress as () => void)();
  render();
}
function enter(id: string, value: string) {
  (byId(id).props.onChangeText as (value: string) => void)(value);
  render();
}
function choose(id: string, value: string) {
  (byId(id).props.onSelect as (value: string) => void)(value);
  render();
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  render();
}

beforeEach(() => {
  hooks.cursor = 0;
  hooks.slots = [];
  hooks.locale = 'ar';
  snapshot = makeSnapshot();
  command.mockReset();
  command.mockResolvedValue({ snapshot, result: {} });
});

describe('real family and task interface', () => {
  it('retains the complete UUID child draft across language changes and a failed save', async () => {
    command.mockResolvedValue(null);
    draw = () => FamilyPanel({ snapshot, busy: false, command });
    render();
    press(`cloud-child-edit-${firstId}`);
    enter('cloud-child-nickname', 'اسم محفوظ');
    enter('cloud-child-custom_support', 'خطوة مع الأسرة');
    hooks.locale = 'en';
    render();
    expect(byId('cloud-child-nickname').props.value).toBe('اسم محفوظ');
    press('cloud-family-save');
    await settle();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'child.update',
        childId: firstId,
        nickname: 'اسم محفوظ',
        preferences: expect.objectContaining({
          custom_interest: 'A family-authored interest',
          custom_support: 'خطوة مع الأسرة',
        }),
      }),
    );
    expect(byId('cloud-child-custom_support').props.value).toBe('خطوة مع الأسرة');
    expect(byId('cloud-family-error')).toBeDefined();
  });

  it('requires an explicit age for imported children and prevents duplicate in-flight family saves', async () => {
    snapshot.children[0] = { ...child(), age_band: null };
    let release!: (result: CloudCommandResult | null) => void;
    command.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    draw = () => FamilyPanel({ snapshot, busy: false, command });
    render();
    press(`cloud-child-edit-${firstId}`);
    press('cloud-family-save');
    expect(command).not.toHaveBeenCalled();
    choose('cloud-child-age', '9_11');
    const save = byId('cloud-family-save').props.onPress as () => void;
    save();
    save();
    expect(command).toHaveBeenCalledTimes(1);
    release(null);
    await settle();
    expect(byId('cloud-child-editor')).toBeDefined();
  });

  it('keeps guardian names and relative UUIDs in a family update', async () => {
    draw = () => FamilyPanel({ snapshot, busy: false, command });
    render();
    press('cloud-family-edit');
    enter('cloud-family-guardian-1', 'Second guardian');
    press('cloud-family-add-relative');
    enter('cloud-relative-name-20000000-0000-4000-8000-000000000001', 'Test relative');
    press('cloud-family-save');
    await settle();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'family.update',
        guardianNames: ['Test guardian', 'Second guardian'],
        relatives: [
          expect.objectContaining({
            id: '20000000-0000-4000-8000-000000000001',
            display_name: 'Test relative',
          }),
        ],
      }),
    );
  });

  it('blocks saving a preserved profile draft until the parent reviews the latest saved revision', async () => {
    draw = () => FamilyPanel({ snapshot, busy: false, command });
    render();
    press(`cloud-child-edit-${firstId}`);
    enter('cloud-child-nickname', 'My unfinished draft');
    snapshot = {
      ...snapshot,
      revision: 2,
      children: [{ ...child(), nickname: 'Changed on another device' }, child(secondId)],
    };
    hooks.locale = 'en';
    render();
    expect(byId('cloud-child-nickname').props.value).toBe('My unfinished draft');
    expect(byId('cloud-family-save').props.disabled).toBe(true);
    expect(command).not.toHaveBeenCalled();
    press('cloud-family-review-latest');
    expect(byId('cloud-family-latest-data')).toBeDefined();
    snapshot = { ...snapshot, revision: 3 };
    render();
    expect(nodes().some((node) => node.props.testID === 'cloud-family-keep-draft')).toBe(false);
    press('cloud-family-review-latest');
    press('cloud-family-keep-draft');
    expect(byId('cloud-child-nickname').props.value).toBe('My unfinished draft');
    press('cloud-family-save');
    await settle();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'child.update',
        childId: firstId,
        nickname: 'My unfinished draft',
      }),
    );
  });

  it('reviews a changed task version before explicitly preserving and saving the draft', async () => {
    const original = { ...task('first'), status: 'draft' as const };
    draw = () => TaskEditor({ snapshot, busy: false, command, task: original, onClose: vi.fn() });
    render();
    enter('cloud-task-title', 'My edited task');
    snapshot = { ...snapshot, revision: 2, tasks: [{ ...original, version: 2 }] };
    render();
    expect(byId('cloud-task-save').props.disabled).toBe(true);
    expect(command).not.toHaveBeenCalled();
    press('cloud-task-review-latest');
    press('cloud-task-keep-draft');
    expect(byId('cloud-task-title').props.value).toBe('My edited task');
    press('cloud-task-save');
    await settle();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'task.update',
        taskId: 'first',
        expectedVersion: 2,
        title: 'My edited task',
      }),
    );
  });

  it('uses saved real guardian and relative identifiers for prepared connection ideas', () => {
    snapshot.family.relatives = [
      {
        id: 'relative-real-uuid',
        display_name: 'Saved relative',
        relationship: 'grandmother',
        rhythm: 'weekly',
      },
    ];
    expect(cloudFamilyConnections(snapshot)).toEqual({
      guardianDisplayNames: ['Test guardian'],
      entries: [
        {
          relativeId: 'relative-real-uuid',
          displayName: 'Saved relative',
          relationship: 'grandmother',
          rhythm: 'weekly',
          ideaKind: 'family_story',
        },
      ],
    });
  });

  it('saves Parent permissions and community consent without optimistic state changes', async () => {
    snapshot.permissions = [
      {
        child_id: firstId,
        voice_granted: false,
        media_granted: false,
        ai_granted: false,
        revision: 1,
      },
    ];
    command.mockResolvedValue(null);
    draw = () => FamilyPanel({ snapshot, busy: false, command });
    render();
    press(`cloud-permission-${firstId}-ai_granted`);
    await settle();
    expect(command).toHaveBeenCalledWith({
      type: 'child.permissions',
      childId: firstId,
      voiceGranted: false,
      mediaGranted: false,
      aiGranted: true,
    });
    expect(byId(`cloud-permission-${firstId}-ai_granted`).props.selected).toBe(false);
    press('cloud-community-pause_new_contributions');
    await settle();
    expect(command).toHaveBeenLastCalledWith({
      type: 'community.participation',
      action: 'pause_new_contributions',
    });
    snapshot.actor = { ...snapshot.actor, role: 'child', child_id: firstId };
    render();
    expect(nodes().some((node) => node.props.testID === 'cloud-community-controls')).toBe(false);
  });

  it('lets only the owning child acknowledge the saved achievement reveal', async () => {
    snapshot.actor = { ...snapshot.actor, role: 'child', child_id: firstId };
    snapshot.tasks = [task('first')];
    snapshot.assignments = [assignment('a1', 'first', 'recognized')];
    snapshot.recognitions = [
      {
        id: 'recognition-uuid',
        child_id: firstId,
        assignment_id: 'a1',
        task_id: 'first',
        task_version: 1,
        submission_id: 'submission-uuid',
        check_in_id: 'checkin-uuid',
        seed_amount: 12,
        landscape_id: 'mangrove',
        created_at: '2026-09-14T00:00:00Z',
      },
    ];
    snapshot.reveals = [
      {
        id: 'reveal-uuid',
        child_id: firstId,
        recognition_id: 'recognition-uuid',
        acknowledged_at: null,
      },
    ];
    draw = () => ChildTaskPanel({ snapshot, busy: false, command });
    render();
    press('cloud-child-reveal-ack-reveal-uuid');
    await settle();
    expect(command).toHaveBeenCalledWith({ type: 'reveal.acknowledge', revealId: 'reveal-uuid' });
  });

  it('preserves authored task language/content and fixed template terms through failed asynchronous saves', async () => {
    const close = vi.fn();
    command.mockResolvedValue(null);
    draw = () => TaskEditor({ snapshot, busy: false, command, onClose: close });
    render();
    expect(byId('cloud-task-title').props.value).toBe('');
    choose('cloud-task-child', firstId);
    choose('cloud-task-template', template.id);
    enter('cloud-task-title', 'My own wording');
    hooks.locale = 'en';
    render();
    expect(byId('cloud-task-title').props.value).toBe('My own wording');
    press('cloud-task-save');
    await settle();
    expect(command).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'task.create',
        childId: firstId,
        locale: 'ar',
        title: 'My own wording',
        steps: ['خطوة واحدة'],
        seedAward: 12,
        recognitionMode: 'standard',
        routinePhase: 'acquisition',
      }),
    );
    expect(close).not.toHaveBeenCalled();
    expect(byId('cloud-task-title').props.value).toBe('My own wording');
  });

  it('uses only the saved template reference while retaining its original catalog-derived terms', async () => {
    const savedId = '40000000-0000-4000-8000-000000000001';
    const original = { ...task('saved-task'), template_id: template.id, seed_award: 6 };
    snapshot.tasks = [
      original,
      { ...original, version: 2, title: 'Later changed title', seed_award: 15 },
    ];
    snapshot.saved_templates = [
      { id: savedId, title: original.title, task_id: original.id, task_version: 1 },
    ];
    draw = () => TaskEditor({ snapshot, busy: false, command, onClose: vi.fn() });
    render();
    choose('cloud-task-child', secondId);
    choose('cloud-task-template', template.id);
    choose('cloud-task-saved-template', savedId);
    expect(byId('cloud-task-title').props.value).toBe(original.title);
    expect(byId('cloud-task-steps').props.value).toBe(original.steps.join('\n'));
    press('cloud-task-save');
    await settle();
    expect(command).toHaveBeenCalledTimes(1);
    const submitted = command.mock.calls[0]?.[0];
    expect(submitted).toEqual(
      expect.objectContaining({
        type: 'task.create',
        savedTemplateId: savedId,
        childId: secondId,
        title: original.title,
        definitionOfDone: original.definition_of_done,
        steps: original.steps,
        permittedHelp: original.permitted_help,
        safety: original.safety,
        seedAward: 6,
        recognitionMode: original.recognition_mode,
        routinePhase: original.routine_phase,
        visibilityScope: original.visibility_scope,
      }),
    );
    expect(submitted).not.toHaveProperty('templateId');
  });

  it('keeps assigned, pending and completed task versions and a newer draft accessible', () => {
    snapshot.tasks = [
      task('first'),
      task('second'),
      task('third'),
      { ...task('first', firstId, 2), status: 'draft' },
      task('sibling', secondId),
    ];
    snapshot.assignments = [
      assignment('a1', 'first', 'in_progress'),
      assignment('a2', 'second', 'submitted'),
      assignment('a3', 'third', 'recognized'),
      assignment('a4', 'sibling', 'assigned', secondId),
    ];
    expect(cloudParentTaskRows(snapshot, '', 'all')).toHaveLength(5);
    expect(
      cloudParentTaskRows(snapshot, firstId, 'assigned').map((row) => row.assignment?.id),
    ).toEqual(['a1']);
    expect(
      cloudParentTaskRows(snapshot, firstId, 'pending').map((row) => row.assignment?.id),
    ).toEqual(['a2']);
    expect(
      cloudParentTaskRows(snapshot, firstId, 'completed').map((row) => row.assignment?.id),
    ).toEqual(['a3']);
    expect(cloudParentTaskRows(snapshot, firstId, 'drafts').map((row) => row.task.version)).toEqual(
      [2],
    );
  });

  it('requires separate saved praise presentation before showing recognition action', async () => {
    snapshot.tasks = [task('first')];
    snapshot.assignments = [assignment('a1', 'first', 'submitted')];
    draw = () => TasksPanel({ snapshot, busy: false, command });
    render();
    press('cloud-task-open-a1');
    enter('cloud-task-praise-a1', 'You organized the paper carefully');
    press('cloud-task-confirm-a1');
    await settle();
    expect(command).toHaveBeenCalledTimes(1);
    expect(command).toHaveBeenCalledWith({
      type: 'checkin.confirm',
      assignmentId: 'a1',
      praise: 'You organized the paper carefully',
    });
    snapshot.assignments[0]!.state = 'confirmed';
    snapshot.check_ins = [
      {
        id: 'check1',
        assignment_id: 'a1',
        submission_id: 's1',
        decision: 'confirm',
        praise: 'You organized the paper carefully',
        observation: null,
        presentation: 'editing_praise',
        created_at: '2026-09-14T00:00:00Z',
      },
    ];
    render();
    expect(nodes().some((node) => node.props.testID === 'cloud-task-recognize-a1')).toBe(false);
    press('cloud-task-present-praise-a1');
    await settle();
    expect(command).toHaveBeenLastCalledWith({
      type: 'checkin.praise_presented',
      checkInId: 'check1',
    });
    snapshot.check_ins[0]!.presentation = 'praise_presented';
    render();
    press('cloud-task-recognize-a1');
    await settle();
    expect(command).toHaveBeenLastCalledWith({ type: 'recognition.apply', checkInId: 'check1' });
  });

  it('shows only the authenticated child’s exact accepted task version', () => {
    snapshot.actor = { ...snapshot.actor, role: 'child', child_id: firstId };
    snapshot.tasks = [task('first'), task('first', firstId, 2), task('second', secondId)];
    snapshot.assignments = [
      assignment('a1', 'first', 'assigned'),
      assignment('a2', 'second', 'assigned', secondId),
    ];
    expect(cloudChildTaskRows(snapshot).map((row) => row.task.title)).toEqual(['Task first v1']);
    draw = () => ChildTaskPanel({ snapshot, busy: false, command });
    render();
    expect(nodes().some((node) => node.props.testID === 'cloud-child-assignment-a2')).toBe(false);
    snapshot.actor.role = 'parent';
    expect(cloudChildTaskRows(snapshot)).toEqual([]);
  });

  it('submits permitted-help completion only after the child checks the steps and definition', async () => {
    snapshot.actor = { ...snapshot.actor, role: 'child', child_id: firstId };
    snapshot.tasks = [task('first')];
    snapshot.assignments = [assignment('a1', 'first', 'in_progress')];
    draw = () => ChildTaskPanel({ snapshot, busy: false, command });
    render();
    expect(byId('cloud-child-submit-a1').props.disabled).toBe(true);
    const checklist = nodes().find((node) => node.type === 'ChildTaskChecklist');
    (checklist!.props.onToggle as (id: string) => void)('a1:1:0:0');
    render();
    press('cloud-child-acknowledge-a1');
    press('cloud-child-with-help-a1');
    press('cloud-child-submit-a1');
    await settle();
    expect(command).toHaveBeenCalledWith({
      type: 'assignment.submit',
      assignmentId: 'a1',
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
    });
  });

  it('keeps Arabic and English resource coverage equivalent', () => {
    const keys = (value: object, prefix = ''): string[] =>
      Object.entries(value)
        .flatMap(([key, item]) =>
          typeof item === 'object' ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`],
        )
        .sort();
    expect(keys(cloudFamilyCoreResources.ar)).toEqual(keys(cloudFamilyCoreResources.en));
  });
});
