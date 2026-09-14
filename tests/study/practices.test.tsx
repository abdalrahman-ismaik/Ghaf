import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChildPracticesRoute from '../../app/child/practices';
import ParentPracticesRoute from '../../app/parent/practices';
import { PracticeSessionScreen } from '../../src/components/familyPractices/FamilyPracticesScreen';
import {
  familyPractices,
  practiceSessionReducer,
  practiceSources,
  practiceStepIds,
  type PracticeAction,
  type PracticeSession,
} from '../../src/features/familyPractices';
import { familyPracticeResources } from '../../src/i18n/familyPracticeResources';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  state: {
    locale: 'en',
    direction: 'ltr',
    activeChildId: 'child_salem',
    parent: true,
    child: false,
  },
  back: null as (() => boolean) | null,
  router: { replace: vi.fn() },
  openURL: vi.fn(),
}));

vi.mock('react', async (original) => {
  const react = await original<typeof import('react')>();
  const slot = (initial: unknown) => (mock.slots[mock.cursor++] ??= { value: initial });
  return {
    ...react,
    useReducer: (reducer: (state: unknown, action: unknown) => unknown, initial: unknown) => {
      const current = slot(initial);
      return [
        current.value,
        (action: unknown) => {
          current.value = reducer(current.value, action);
        },
      ];
    },
    useState: (initial: unknown) => {
      const current = slot(initial);
      return [
        current.value,
        (value: unknown) => {
          current.value = value;
        },
      ];
    },
    useCallback: (callback: unknown) => callback,
  };
});
vi.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useRouter: () => mock.router,
  useFocusEffect: (callback: () => void) => callback(),
}));
vi.mock('react-native', () => ({
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: {
    OS: 'web',
    select: (values: Record<string, unknown>) => values.web ?? values.default,
  },
  Linking: { openURL: mock.openURL },
  BackHandler: {
    addEventListener: (_: string, callback: () => boolean) => {
      mock.back = callback;
      return { remove: vi.fn() };
    },
  },
}));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: 'LanguageSwitcher' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Card: 'Card', Text: 'Text' }));
vi.mock('@/components/r002a', () => ({ R002aFlowHeader: 'Header', R002aScreen: 'Screen' }));
vi.mock('@/components/r003', () => ({
  R003ActionRow: 'ActionRow',
  R003Hero: 'Hero',
  R003Section: 'Section',
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: typeof mock.state) => unknown) => selector(mock.state),
  selectHasActiveParentExperience: (state: typeof mock.state) => state.parent,
  selectCanEnterChildExperience: (state: typeof mock.state) => state.child,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, variables: Record<string, string | number> = {}) => {
      const resource = familyPracticeResources[mock.state.locale as 'ar' | 'en'];
      const value = key
        .replace(/^familyPractices\./u, '')
        .split('.')
        .reduce<unknown>(
          (current, part) =>
            current && typeof current === 'object'
              ? (current as Record<string, unknown>)[part]
              : undefined,
          resource,
        );
      if (typeof value !== 'string') return key;
      return value.replace(/\{\{(\w+)\}\}/gu, (_, name: string) => String(variables[name] ?? name));
    },
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
let role: 'parent' | 'child' = 'parent';

function find(predicate: (node: Node) => boolean, value: ReactNode = tree): Node | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = find(predicate, child);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement<Record<string, unknown>>(value)) return undefined;
  if (predicate(value)) return value;
  return (
    find(predicate, (value.props.children as ReactNode) ?? null) ??
    find(predicate, (value.props.header as ReactNode) ?? null)
  );
}
function byId(id: string) {
  return find((node) => node.props.testID === id);
}
function refresh() {
  mock.cursor = 0;
  tree = PracticeSessionScreen({ role });
}
function press(id: string) {
  const control = byId(id);
  expect(control, id).toBeDefined();
  (control!.props.onPress as () => void)();
  refresh();
}
function leafKeys(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafKeys(child, `${prefix}.${key}`),
  );
}
function apply(state: PracticeSession, ...actions: PracticeAction[]) {
  return actions.reduce(practiceSessionReducer, state);
}

beforeEach(() => {
  vi.clearAllMocks();
  mock.cursor = 0;
  mock.slots = [];
  mock.state = {
    locale: 'en',
    direction: 'ltr',
    activeChildId: 'child_salem',
    parent: true,
    child: false,
  };
  mock.back = null;
  mock.openURL.mockResolvedValue(undefined);
  role = 'parent';
});

describe('optional sourced family practice sessions', () => {
  it('has six bilingual activities with a supported version of every finite step and a cited source', () => {
    expect(familyPractices).toHaveLength(6);
    expect(leafKeys(familyPracticeResources.ar)).toEqual(leafKeys(familyPracticeResources.en));
    for (const { id, source } of familyPractices) {
      expect(practiceSources[source]).toMatch(
        /^https:\/\/(?:ies\.ed\.gov|educationendowmentfoundation\.org\.uk|www\.unicef\.org)\//u,
      );
      for (const locale of ['ar', 'en'] as const) {
        const activity = familyPracticeResources[locale].activities[id];
        expect(activity.parent.length).toBeGreaterThan(10);
        expect(activity.rationale.length).toBeGreaterThan(10);
        for (const step of practiceStepIds) {
          expect(activity.steps[step].together.length).toBeGreaterThan(10);
          expect(activity.steps[step].accessible.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('requires the last step before acknowledgement and treats both versions identically', () => {
    for (const practice of familyPractices) {
      const ready = apply(null, { type: 'choose', practiceId: practice.id });
      expect(apply(ready, { type: 'finish' })).toEqual(ready);
      const active = apply(ready, { type: 'start' });
      expect(apply(active, { type: 'finish' })).toEqual(active);
      for (const mode of ['together', 'accessible'] as const) {
        const outcome = apply(
          active,
          { type: 'mode', mode },
          { type: 'next' },
          { type: 'next' },
          { type: 'finish' },
        );
        expect(outcome).toEqual({ practiceId: practice.id, mode, stepIndex: 2, phase: 'finished' });
        expect(apply(outcome, { type: 'finish' }, { type: 'next' }, { type: 'skip' })).toEqual(
          outcome,
        );
      }
    }
  });

  it('keeps stopping distinct from completing, allows Back and starts another activity fresh', () => {
    const active = apply(
      null,
      { type: 'choose', practiceId: 'recall' },
      { type: 'start' },
      { type: 'mode', mode: 'accessible' },
      { type: 'next' },
    );
    expect(apply(active, { type: 'back' })).toMatchObject({
      phase: 'active',
      stepIndex: 0,
      mode: 'accessible',
    });
    expect(apply(active, { type: 'back' }, { type: 'back' })).toMatchObject({ phase: 'ready' });
    const skipped = apply(active, { type: 'skip' });
    expect(skipped?.phase).toBe('skipped');
    expect(apply(skipped, { type: 'finish' })).toEqual(skipped);
    expect(apply(skipped, { type: 'choose', practiceId: 'listen' })).toEqual({
      practiceId: 'listen',
      phase: 'ready',
      mode: 'together',
      stepIndex: 0,
    });
    expect(apply(active, { type: 'close' })).toBeNull();
  });

  it.each(['ar', 'en'] as const)(
    'runs the supported activity, Back and acknowledgement in %s without updating family state',
    (locale) => {
      mock.state.locale = locale;
      mock.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
      Object.freeze(mock.state);
      const before = { ...mock.state };
      refresh();
      press('practice-choose-recall');
      press('practice-mode');
      press('practice-primary');
      expect(byId('practice-step-body')?.props.children).toBe(
        familyPracticeResources[locale].activities.recall.steps.choose.accessible,
      );
      press('practice-primary');
      expect(mock.back?.()).toBe(true);
      refresh();
      expect(byId('practice-step-body')?.props.children).toBe(
        familyPracticeResources[locale].activities.recall.steps.choose.accessible,
      );
      press('practice-primary');
      press('practice-primary');
      expect(byId('practice-primary')?.props.children).toBe(familyPracticeResources[locale].finish);
      press('practice-primary');
      expect(
        find((node) => node.props.title === familyPracticeResources[locale].completed)?.props.body,
      ).toBe(familyPracticeResources[locale].completedBody);
      expect(byId('practice-primary')).toBeUndefined();
      expect(mock.state).toEqual(before);
      expect(mock.openURL).not.toHaveBeenCalled();
      press('practice-another');
      expect(byId('practice-choose-recall')).toBeDefined();
    },
  );

  it('offers a neutral stop, opens only the chosen source on request and recovers from link failure', async () => {
    refresh();
    press('practice-choose-listen');
    expect(mock.openURL).not.toHaveBeenCalled();
    mock.openURL.mockRejectedValueOnce(new Error('offline'));
    press('practice-source');
    await Promise.resolve();
    refresh();
    expect(mock.openURL).toHaveBeenCalledWith(practiceSources.unicef);
    expect(byId('practice-source-error')?.props.children).toBe(
      familyPracticeResources.en.sourceUnavailable,
    );
    press('practice-primary');
    expect(byId('practice-source-error')).toBeUndefined();
    press('practice-skip');
    expect(
      find((node) => node.props.title === familyPracticeResources.en.skipped)?.props.body,
    ).toBe(familyPracticeResources.en.skippedBody);
  });

  it('guards both routes and sends each role back to its own home', () => {
    expect(ParentPracticesRoute().props.role).toBe('parent');
    expect(ChildPracticesRoute().props.href).toBe('/');
    mock.state.parent = false;
    mock.state.child = true;
    expect(ParentPracticesRoute().props.href).toBe('/');
    expect(ChildPracticesRoute().props.role).toBe('child');
    for (const nextRole of ['parent', 'child'] as const) {
      role = nextRole;
      refresh();
      mock.back?.();
      expect(mock.router.replace).toHaveBeenLastCalledWith(`/${role}`);
    }
  });
});
