import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CompanionPanel } from '../../src/components/cloudFamily/CompanionPanel';
import { FamilyMessagingScreen } from '../../src/components/familyMessaging/FamilyMessagingScreen';
import { MessagingLifecycle } from '../../src/components/familyMessaging/MessagingLifecycle';
import { PracticeSessionScreen } from '../../src/components/familyPractices/FamilyPracticesScreen';
import { StudyPractice } from '../../src/components/study/StudyPractice';
import { cloudFamilyCompanionResources } from '../../src/i18n/cloudFamilyCompanion';
import { resources } from '../../src/i18n/resources';
import type { CloudCommand, CloudCommandResult, CloudSnapshot } from '../../src/models/cloudFamily';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  cleanups: [] as (() => void)[],
  locale: 'en' as 'ar' | 'en',
  real: true,
  sample: false,
  storeUpdate: null as (() => void) | null,
  router: { canGoBack: vi.fn(() => false), back: vi.fn(), replace: vi.fn() },
  messaging: {
    subscribe: vi.fn(),
    getSnapshot: vi.fn(),
    setLocalContext: vi.fn(),
    openFor: vi.fn(),
    setVisible: vi.fn(),
    clearAccountSession: vi.fn(async () => undefined),
    setLocale: vi.fn(),
    setForeground: vi.fn(),
    dismissInvitation: vi.fn(),
    closeThread: vi.fn(),
  },
  messagingState: {
    phase: 'signedOut',
    context: null,
    threads: [],
    threadId: null,
    error: null,
    busy: false,
  },
  command: vi.fn<(command: CloudCommand) => Promise<CloudCommandResult | null>>(),
}));
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = (initial: unknown) => (mock.slots[mock.cursor++] ??= { value: initial });
  return {
    ...react,
    useState: (initial: unknown) => {
      const current = slot(initial);
      return [
        current.value,
        (next: unknown) => {
          current.value = typeof next === 'function' ? next(current.value) : next;
        },
      ];
    },
    useRef: (initial: unknown) => slot({ current: initial }).value,
    useReducer: (reducer: (state: unknown, action: unknown) => unknown, initial: unknown) => {
      const current = slot(initial);
      return [
        current.value,
        (action: unknown) => {
          current.value = reducer(current.value, action);
        },
      ];
    },
    useEffect: (callback: () => (() => void) | void) => {
      const cleanup = callback();
      if (cleanup) mock.cleanups.push(cleanup);
    },
    useCallback: (callback: unknown) => callback,
    useSyncExternalStore: () => mock.messagingState,
  };
});
vi.mock('react-native', () => ({
  View: 'View',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  StyleSheet: { create: (value: unknown) => value },
  Platform: { OS: 'web', select: (value: Record<string, unknown>) => value.web ?? value.default },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
  Keyboard: { isVisible: () => false, dismiss: vi.fn() },
  Linking: { openURL: vi.fn(async () => undefined) },
  BackHandler: { addEventListener: () => ({ remove: vi.fn() }) },
  AppState: { currentState: 'active', addEventListener: () => ({ remove: vi.fn() }) },
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('expo-router', () => ({
  useRouter: () => mock.router,
  useFocusEffect: (callback: () => (() => void) | void) => {
    const cleanup = callback();
    if (cleanup) mock.cleanups.push(cleanup);
  },
}));
vi.mock('@/components/access', () => ({
  ChoiceChip: 'ChoiceChip',
  StatusBanner: 'StatusBanner',
  GhafIcon: 'GhafIcon',
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text', Card: 'Card' }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: 'LanguageSwitcher' }));
vi.mock('@/components/r002a', () => ({ R002aFlowHeader: 'Header', R002aScreen: 'Screen' }));
vi.mock('@/components/r003', () => ({
  R003Hero: 'Hero',
  R003Section: 'Section',
  R003ActionRow: 'ActionRow',
}));
vi.mock('@/components/cloudFamily/GrowthPanel', () => ({
  cloudGrowthStyles: { panel: {}, rule: {}, section: {} },
}));
vi.mock('@/components/familyMessaging/MessagingAccess', () => ({
  MessagingAccess: 'MessagingAccess',
}));
vi.mock('@/components/familyMessaging/MessagingConversation', () => ({
  MessagingConversation: 'MessagingConversation',
}));
vi.mock('@/components/familyMessaging/MessagingManagement', () => ({
  MessagingManagement: 'MessagingManagement',
}));
vi.mock('@/components/familyMessaging/shared', () => ({
  MessageButton: 'MessageButton',
  MessageText: 'MessageText',
  styles: {},
}));
vi.mock('@/components/study/StudyPractice', () => ({ StudyPractice: 'StudyPractice' }));
vi.mock('@/services', () => ({
  serviceRegistry: { familyMessaging: { controller: mock.messaging } },
}));
vi.mock('@/features/pilot/config', () => ({ getPilotConfig: () => ({ enabled: mock.real }) }));
vi.mock('@/state/usePrototypeStore', () => {
  const state = () => ({
    locale: mock.locale,
    direction: mock.locale === 'ar' ? 'rtl' : 'ltr',
    pilotSampleActive: mock.sample,
    demoEntryEpoch: 0,
    activeExperience: 'signed_out',
    activeChildId: 'child_salem',
    journey: null,
  });
  return {
    usePrototypeStore: Object.assign((selector: (value: object) => unknown) => selector(state()), {
      getState: state,
      subscribe: (callback: () => void) => {
        mock.storeUpdate = callback;
        return vi.fn();
      },
    }),
  };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tree = {
        ...resources[mock.locale].translation,
        cloudFamily: { companion: cloudFamilyCompanionResources[mock.locale] },
      };
      return key
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : key,
          tree,
        );
    },
  }),
}));

const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
function fixture(): CloudSnapshot {
  return {
    schema_version: 1,
    revision: 1,
    actor: { role: 'child', user_id: id(1), family_id: id(2), child_id: id(3) },
    family: {
      id: id(2),
      name: 'Saved family',
      locale: 'en',
      revision: 1,
      guardian_names: [],
      relatives: [],
    },
    children: [
      {
        id: id(3),
        family_id: id(2),
        nickname: 'Saved child',
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
      },
    ],
    categories: [],
    landscapes: [],
    templates: [],
    tasks: [
      {
        id: id(4),
        family_id: id(2),
        child_id: id(3),
        version: 1,
        status: 'assigned',
        template_id: null,
        title: 'Saved task',
        definition_of_done: 'Clean paper sorted',
        steps: ['Saved first step', 'Saved second step'],
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
        permitted_help: 'Ask a Parent to demonstrate.',
        supervision: 'Parent checks materials',
        recurrence: 'once',
        positive_action: 'Sort paper',
        why_it_matters: 'Reuse paper',
        safety: {
          adult_pre_check: 'Check paper.',
          adult_second_check: 'Check together.',
          adult_owned_actions: [],
          child_allowed_actions: ['Sort approved paper.'],
          excluded_hazards: [],
          stop_and_ask_adult: 'Ask for help.',
          route_constraint: null,
          indoor_alternative: null,
          aftercare: null,
        },
      },
    ],
    assignments: [
      {
        id: id(5),
        family_id: id(2),
        child_id: id(3),
        task_id: id(4),
        task_version: 1,
        state: 'chosen',
        help_requested: false,
        created_at: '2026-09-14',
      },
    ],
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
    permissions: [
      {
        child_id: id(3),
        ai_granted: true,
        media_granted: false,
        voice_granted: false,
        revision: 1,
      },
    ],
    community: { status: 'paused', revision: 0 },
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
type Node = ReactElement<Record<string, unknown>>;
function nodes(tree: ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!isValidElement<Record<string, unknown>>(tree)) return [];
  return [
    tree,
    ...nodes(tree.props.children as ReactNode),
    ...nodes(tree.props.header as ReactNode),
  ];
}
function byId(tree: ReactNode, testID: string) {
  return nodes(tree).find((node) => node.props.testID === testID);
}
function press(tree: ReactNode, testID: string) {
  const node = byId(tree, testID);
  expect(node, testID).toBeDefined();
  (node!.props.onPress as () => void)();
}
let snapshot: CloudSnapshot;
function render(active = true) {
  mock.cursor = 0;
  return CompanionPanel({ snapshot, active, busy: false, command: mock.command });
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}
beforeEach(() => {
  vi.clearAllMocks();
  mock.cursor = 0;
  mock.slots = [];
  mock.cleanups = [];
  mock.locale = 'en';
  mock.real = true;
  mock.sample = false;
  mock.storeUpdate = null;
  snapshot = fixture();
  Object.assign(mock.messagingState, {
    phase: 'signedOut',
    context: null,
    threads: [],
    threadId: null,
    error: null,
    busy: false,
  });
  mock.command.mockResolvedValue({ snapshot, result: {} });
});

describe('real family tools preservation', () => {
  it('mounts messaging only after explicit entry while the panel is active', () => {
    expect(nodes(render()).some((node) => node.type === FamilyMessagingScreen)).toBe(false);
    press(render(), 'cloud-companion-messages');
    const messaging = nodes(render()).find((node) => node.type === FamilyMessagingScreen)!;
    expect(messaging.props.localContext).toEqual({
      scope: `cloud:${id(1)}:${id(2)}:child:${id(3)}`,
      role: 'child',
    });
    expect(messaging.key).toContain(id(3));
    expect(render(false)).toBeNull();
    expect(mock.command).not.toHaveBeenCalled();
    expect(mock.router.replace).not.toHaveBeenCalled();
  });
  it('clears private messaging credentials when the cloud actor boundary unmounts', async () => {
    render();
    mock.cleanups[0]!();
    await settle();
    expect(mock.messaging.setVisible).toHaveBeenCalledWith(false);
    expect(mock.messaging.clearAccountSession).toHaveBeenCalledTimes(1);
  });
  it('keeps pure study and family practices reachable without reward or completion commands', () => {
    press(render(), 'cloud-companion-study');
    expect(nodes(render()).some((node) => node.type === StudyPractice)).toBe(true);
    press(render(), 'cloud-companion-back');
    press(render(), 'cloud-companion-practice');
    const practice = nodes(render()).find((node) => node.type === PracticeSessionScreen)!;
    expect(practice.props.embedded).toBe(true);
    expect(practice.props.role).toBe('child');
    (practice.props.onExit as () => void)();
    expect(byId(render(), 'cloud-companion-study')).toBeDefined();
    expect(mock.command).not.toHaveBeenCalled();
  });
  it.each(['permission', 'age', 'state', 'version', 'sibling'] as const)(
    'withholds task guidance for an invalid %s binding',
    (kind) => {
      if (kind === 'permission') snapshot.permissions = [];
      if (kind === 'age') snapshot.children[0]!.age_band = null;
      if (kind === 'state') snapshot.assignments[0]!.state = 'assigned';
      if (kind === 'version') snapshot.assignments[0]!.task_version = 2;
      if (kind === 'sibling') snapshot.tasks[0]!.child_id = id(6);
      press(render(), 'cloud-companion-coach');
      expect(byId(render(), 'cloud-coach-first')).toBeUndefined();
      expect(byId(render(), 'cloud-coach-help')).toBeUndefined();
      expect(mock.command).not.toHaveBeenCalled();
    },
  );
  it('uses the actual saved task steps and gives younger children only curated controls', () => {
    snapshot.children[0]!.age_band = '6_8';
    press(render(), 'cloud-companion-coach');
    expect(byId(render(), 'cloud-coach-cue')).toBeUndefined();
    press(render(), 'cloud-coach-first');
    expect(byId(render(), 'cloud-coach-response')!.props.children).toBe('Saved first step');
    mock.locale = 'ar';
    expect(byId(render(), 'cloud-coach-response')!.props.children).toBe('Saved first step');
    expect(mock.command).not.toHaveBeenCalled();
  });
  it('saves an actual assignment help request only once under rapid taps', async () => {
    press(render(), 'cloud-companion-coach');
    const tree = render();
    press(tree, 'cloud-coach-help');
    press(tree, 'cloud-coach-help');
    await settle();
    expect(mock.command).toHaveBeenCalledExactlyOnceWith({
      type: 'assignment.help',
      assignmentId: id(5),
    });
    expect(
      nodes(render()).some(
        (node) => node.props.message === cloudFamilyCompanionResources.en.helpSaved,
      ),
    ).toBe(true);
  });
  it('never publishes a successful help receipt after a rejected save', async () => {
    mock.command.mockResolvedValue(null);
    press(render(), 'cloud-companion-coach');
    press(render(), 'cloud-coach-help');
    await settle();
    expect(
      nodes(render()).some(
        (node) => node.props.message === cloudFamilyCompanionResources.en.failed,
      ),
    ).toBe(true);
  });
});

describe('preserved embedded shells and lifecycle', () => {
  it('withholds a previous messaging identity before the new cloud scope binds', () => {
    Object.assign(mock.messagingState, {
      phase: 'ready',
      context: {
        role: 'parent',
        personId: id(7),
        displayName: 'Previous private person',
        householdId: id(8),
        deviceId: id(9),
        ageBand: null,
      },
      threadId: id(10),
      threads: [
        {
          id: id(10),
          otherName: 'Previous private recipient',
          otherRole: 'child',
          childId: id(11),
          kind: 'parent_child',
        },
      ],
    });
    const tree = FamilyMessagingScreen({
      embedded: true,
      localContext: { scope: 'cloud:new-actor', role: 'child' },
    });
    expect(JSON.stringify(tree)).not.toContain('Previous private');
    expect(mock.messaging.setLocalContext).toHaveBeenCalledWith('cloud:new-actor', 'child');
  });
  it('binds expected messaging role before validation and exits inside the cloud screen', () => {
    const onExit = vi.fn();
    const tree = FamilyMessagingScreen({
      embedded: true,
      onExit,
      localContext: { scope: 'cloud:real-actor', role: 'child' },
    });
    expect(mock.messaging.setLocalContext).toHaveBeenCalledWith('cloud:real-actor', 'child');
    expect(mock.messaging.openFor).toHaveBeenCalledWith('child');
    expect(mock.messaging.setVisible).toHaveBeenCalledWith(true);
    press(tree, 'messaging-back');
    expect(onExit).toHaveBeenCalledOnce();
    expect(mock.router.replace).not.toHaveBeenCalled();
    mock.cleanups[0]!();
    expect(mock.messaging.setVisible).toHaveBeenLastCalledWith(false);
  });
  it('retains standalone messaging Back behavior without an embedded callback', () => {
    press(FamilyMessagingScreen(), 'messaging-back');
    expect(mock.router.replace).toHaveBeenCalledWith('/');
  });
  it('does not overwrite a real cloud messaging context when language changes', () => {
    MessagingLifecycle();
    expect(mock.messaging.setLocalContext).not.toHaveBeenCalled();
    mock.locale = 'ar';
    mock.storeUpdate!();
    expect(mock.messaging.setLocale).toHaveBeenLastCalledWith('ar');
    expect(mock.messaging.setLocalContext).not.toHaveBeenCalled();
    mock.sample = true;
    mock.storeUpdate!();
    expect(mock.messaging.setLocalContext).toHaveBeenCalledWith(
      '0:signed_out:child_salem:none',
      null,
    );
  });
  it('exits embedded practice without routing into the synthetic family', () => {
    const onExit = vi.fn();
    const tree = PracticeSessionScreen({ role: 'child', embedded: true, onExit });
    const header = nodes(tree).find((node) => node.type === 'Header')!;
    (header.props.onBack as () => void)();
    expect(onExit).toHaveBeenCalledOnce();
    expect(mock.router.replace).not.toHaveBeenCalled();
  });
});

it('keeps family tool resource keys equivalent in both languages', () => {
  expect(Object.keys(cloudFamilyCompanionResources.ar)).toEqual(
    Object.keys(cloudFamilyCompanionResources.en),
  );
});
