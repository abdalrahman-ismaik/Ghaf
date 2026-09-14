import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ParentTaskWorkspace } from '@/components/r002a/parent/ParentTaskWorkspace';
import { TASK_CATEGORIES, TASK_TEMPLATES } from '@/features/tasks/demoContent';

type Element = ReactElement<Record<string, unknown>>;
type Props = ComponentProps<typeof ParentTaskWorkspace>;

const mock = vi.hoisted(() => ({ cursor: 0, state: [] as unknown[], width: 320 }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  memo: (component: unknown) => component,
  useCallback: (callback: unknown) => callback,
  useMemo: (factory: () => unknown) => factory(),
  useState: (initial: unknown) => {
    const index = mock.cursor++;
    if (!(index in mock.state)) mock.state[index] = initial;
    return [
      mock.state[index],
      (next: unknown) => {
        mock.state[index] = typeof next === 'function' ? next(mock.state[index]) : next;
      },
    ];
  },
}));
vi.mock('react-native', () => ({
  FlatList: 'FlatList',
  View: 'View',
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  useWindowDimensions: () => ({ width: mock.width }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/botanical', () => ({ BotanicalPressable: 'BotanicalPressable' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/i18n', () => ({
  localize: (text: Record<string, string>, locale: string) => text[locale],
}));

function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  if (typeof node.type === 'function') {
    return elements((node.type as (props: Record<string, unknown>) => ReactNode)(node.props));
  }
  const rows =
    node.type === 'FlatList'
      ? (node.props.data as readonly unknown[]).flatMap((item) =>
          elements((node.props.renderItem as (input: { item: unknown }) => ReactNode)({ item })),
        )
      : [];
  return [node, ...elements(node.props.children as ReactNode), ...rows];
}

function find(tree: ReactNode, testID: string): Element {
  const found = elements(tree).find((element) => element.props.testID === testID);
  if (!found) throw new Error(`Missing ${testID}`);
  return found;
}

function styleOf(style: unknown, pressed = false): Record<string, unknown> {
  if (typeof style === 'function') return styleOf(style({ pressed }), pressed);
  if (Array.isArray(style))
    return Object.assign({}, ...style.map((part) => styleOf(part, pressed)));
  return style && typeof style === 'object' ? (style as Record<string, unknown>) : {};
}

function geometry(element: Element) {
  const result = { ...styleOf(element.props.style) };
  delete result.borderColor;
  return result;
}

function press(element: Element) {
  (element.props.onPress as () => void)();
}

let props: Props;
function render() {
  mock.cursor = 0;
  return ParentTaskWorkspace(props);
}

beforeEach(() => {
  mock.cursor = 0;
  mock.state = [];
  mock.width = 320;
  props = {
    activeChildId: 'child_salem',
    childProfiles: [
      { id: 'child_salem', label: 'Salem' },
      { id: 'child_alya', label: 'Alya' },
    ],
    current: {
      childId: 'child_salem',
      childLabel: 'Salem',
      title: 'A task title with enough words to wrap across several lines',
      statusLabel: 'In progress',
    },
    direction: 'rtl',
    locale: 'ar',
    onCreateTask: vi.fn(),
    onOpenCurrent: vi.fn(),
  };
});

// Host execution checks selection/layout contracts, not measured native text or scroll performance.
describe.each([
  ['ar', 'rtl', 320],
  ['en', 'ltr', 390],
] as const)('task workspace feedback in %s', (locale, direction, width) => {
  beforeEach(() => {
    props = { ...props, locale, direction };
    mock.width = width;
  });

  it('keeps every category boundary stable during rapid selection and reversal', () => {
    let tree = render();
    const before = TASK_CATEGORIES.map((category) =>
      geometry(find(tree, `workspace-category-${category.id}`)),
    );

    for (const selected of [...TASK_CATEGORIES, ...[...TASK_CATEGORIES].reverse()]) {
      press(find(tree, `workspace-category-${selected.id}`));
      tree = render();
      for (const [index, category] of TASK_CATEGORIES.entries()) {
        const control = find(tree, `workspace-category-${category.id}`);
        expect(geometry(control)).toEqual(before[index]);
        expect(control.props.accessibilityRole).toBe('radio');
        expect(control.props.accessibilityState).toEqual({ checked: category.id === selected.id });
        expect(
          elements(control).some(
            (node) => node.props.accessibilityLabel === category.label[locale],
          ),
        ).toBe(true);
      }
      expect(find(tree, 'workspace-template-carousel').props.data).toEqual(
        TASK_TEMPLATES.filter((template) => template.categoryId === selected.id),
      );
    }
    expect(props.onCreateTask).not.toHaveBeenCalled();
    expect(props.onOpenCurrent).not.toHaveBeenCalled();
  });

  it('lets the shared pressable own feedback without adding opacity or transforms', () => {
    const controls = elements(render()).filter((node) => node.type === 'BotanicalPressable');
    expect(controls.length).toBeGreaterThan(TASK_CATEGORIES.length);
    for (const control of controls) {
      const idle = styleOf(control.props.style);
      const pressed = styleOf(control.props.style, true);
      expect(pressed).toEqual(idle);
      expect(pressed.opacity).toBeUndefined();
      expect(pressed.transform).toBeUndefined();
      expect(control.props.reducedMotion).toBeUndefined();
    }
  });

  it('keeps create and open actions immediate after changing the Child filter', () => {
    let tree = render();
    const current = elements(tree).find(
      (node) => node.type === 'BotanicalPressable' && node.props.accessibilityRole === 'button',
    );
    expect(current).toBeDefined();
    press(current!);
    expect(props.onOpenCurrent).toHaveBeenCalledTimes(1);

    for (const id of ['child_alya', 'all', 'child_salem'] as const) {
      press(find(tree, `workspace-child-${id}`));
      tree = render();
      expect(find(tree, `workspace-child-${id}`).props.accessibilityState).toEqual({
        checked: true,
      });
      press(find(tree, 'parent-tasks-create-task'));
      expect(props.onCreateTask).toHaveBeenLastCalledWith(id === 'all' ? props.activeChildId : id);
    }
    expect(props.onCreateTask).toHaveBeenCalledTimes(3);
  });
});
