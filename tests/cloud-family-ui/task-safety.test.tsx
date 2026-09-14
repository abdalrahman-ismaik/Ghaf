import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudTaskCatalog,
  CloudTaskDetail,
} from '../../src/components/cloud-family/CloudTaskViews';
import type { CloudFamilyController } from '../../src/features/cloud-family';
import { cloudFamilyResources } from '../../src/i18n/cloudFamilyResources';
import type { CloudFamilySnapshot, CloudFamilyTask } from '../../src/models/cloudFamily';
import { childId, cloudSnapshot, taskId } from '../cloud-family/fixtures';

const mock = vi.hoisted(() => ({
  locale: 'en' as 'ar' | 'en',
  cursor: 0,
  slots: [] as { value: unknown }[],
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState(initial: unknown) {
    const slot = (mock.slots[mock.cursor++] ??= {
      value: typeof initial === 'function' ? initial() : initial,
    });
    return [slot.value, (value: unknown) => (slot.value = value)];
  },
  useRef(initial: unknown) {
    return (mock.slots[mock.cursor++] ??= { value: { current: initial } }).value;
  },
  useEffect: () => undefined,
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'android', select: (options: Record<string, unknown>) => options.android },
  StyleSheet: { create: (value: unknown) => value },
  View: 'View',
}));
vi.mock('@/components/primitives', () => ({ Text: 'Text', Button: 'Button' }));
vi.mock('@/components/access', () => ({ AccessTextField: 'AccessTextField' }));
vi.mock('@/components/cloud-family/CloudMaintenancePrompt', () => ({
  CloudMaintenancePrompt: () => null,
}));
vi.mock('@/components/cloud-family/CloudPreparedTaskGuide', () => ({
  CloudPreparedTaskGuide: () => null,
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (select: (state: object) => unknown) =>
    select({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t(key: string, values?: Record<string, unknown>) {
      const label = key
        .replace(/^cloudFamily\./, '')
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[part]
              : undefined,
          cloudFamilyResources[mock.locale],
        );
      return Object.entries(values ?? {}).reduce(
        (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
        typeof label === 'string' ? label : key,
      );
    },
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
let controller: CloudFamilyController;

function expand(value: ReactNode): ReactNode {
  if (Array.isArray(value)) return value.map(expand);
  if (!isValidElement<Record<string, unknown>>(value)) return value;
  if (typeof value.type === 'function')
    return expand((value.type as (props: Record<string, unknown>) => ReactNode)(value.props));
  return createElement(value.type, value.props, expand(value.props.children as ReactNode));
}
function nodes(value: ReactNode): Node[] {
  if (Array.isArray(value)) return value.flatMap((child) => nodes(child));
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...nodes(value.props.children as ReactNode)];
}
function find(id: string) {
  return nodes(tree).find((node) => node.props.testID === id);
}
function labels(value: ReactNode): string[] {
  return nodes(value).flatMap((node) =>
    typeof node.props.children === 'string' ? [node.props.children] : [],
  );
}
function render(value: ReactNode) {
  mock.cursor = 0;
  tree = expand(value);
}
function detail(role: 'parent' | 'child', task?: CloudFamilyTask) {
  const data = cloudSnapshot();
  const activity: CloudFamilyTask = task ?? {
    ...data.tasks[0]!,
    status: 'assigned',
    revision: 1,
    stepStates: {},
    helpRequested: false,
    praise: null,
    submittedAt: null,
  };
  const snapshot: CloudFamilySnapshot = {
    ...data,
    actor: { ...data.actor, role, childId: role === 'child' ? childId : null },
    tasks: [activity],
  };
  render(
    <CloudTaskDetail
      task={activity}
      snapshot={snapshot}
      controller={controller}
      disabled={false}
      onGarden={() => undefined}
    />,
  );
  return activity;
}

beforeEach(() => {
  mock.locale = 'en';
  mock.cursor = 0;
  mock.slots = [];
  controller = { command: vi.fn(async () => true) } as unknown as CloudFamilyController;
});

describe('cloud task safety presentation', () => {
  it.each([
    ['ar', 'parent'],
    ['en', 'parent'],
    ['ar', 'child'],
    ['en', 'child'],
  ] as const)('shows the existing complete safety pack in %s for %s', (locale, role) => {
    mock.locale = locale;
    const task = detail(role);
    const safety = find('cloud-task-safety');
    expect(safety).toBeDefined();
    const text = labels(safety);
    for (const copy of [
      task.template.safety.adultPreCheck,
      task.template.safety.adultSecondCheck,
      ...task.template.safety.adultOwnedActions,
      ...task.template.safety.excludedHazards,
      task.template.safety.stopAndAskAdult,
      task.template.safety.routeConstraint!,
      task.template.safety.indoorAlternative!,
      task.template.safety.aftercare!,
    ])
      expect(text).toContain(copy[locale]);
    expect(text).toContain(cloudFamilyResources[locale].adultResponsibilities);
    expect(text).toContain(cloudFamilyResources[locale].afterActivity);
    expect(nodes(safety).some((node) => typeof node.props.onPress === 'function')).toBe(false);
    expect(nodes(safety).some((node) => node.props.accessibilityRole === 'checkbox')).toBe(false);
  });

  it.each(['ar', 'en'] as const)(
    'shows the safety pack during Parent assignment review in %s',
    (locale) => {
      mock.locale = locale;
      const snapshot = cloudSnapshot();
      const catalog = (
        <CloudTaskCatalog
          snapshot={snapshot}
          controller={controller}
          disabled={false}
          onAssigned={() => undefined}
        />
      );
      render(catalog);
      (find('cloud-review-GI01')!.props.onPress as () => void)();
      render(catalog);
      expect(labels(find('cloud-task-safety'))).toContain(
        snapshot.catalog[0]!.safety.aftercare![locale],
      );
      expect(find('cloud-task-assign')).toBeDefined();
      expect(controller.command).not.toHaveBeenCalled();
    },
  );

  it.each(['ar', 'en'] as const)(
    'omits absent route/aftercare and repeated safety copy in %s',
    (locale) => {
      mock.locale = locale;
      const task = cloudSnapshot().tasks[0]!;
      const precheck = task.template.safety.adultPreCheck;
      detail('child', {
        ...task,
        template: {
          ...task.template,
          safety: {
            ...task.template.safety,
            adultOwnedActions: [precheck, precheck],
            adultSecondCheck: precheck,
            routeConstraint: null,
            indoorAlternative: null,
            aftercare: null,
          },
        },
      });
      const text = labels(find('cloud-task-safety'));
      expect(text.filter((value) => value === precheck[locale])).toHaveLength(1);
      expect(text).not.toContain(cloudFamilyResources[locale].routeAndAlternative);
      expect(text).not.toContain(cloudFamilyResources[locale].afterActivity);
      expect(text).toContain(task.template.safety.stopAndAskAdult[locale]);
    },
  );

  it('keeps assigned-state help available without treating it as acceptance or completion', () => {
    detail('child');
    expect(find('cloud-task-help')!.props.disabled).toBe(false);
    (find('cloud-task-help')!.props.onPress as () => void)();
    expect(controller.command).toHaveBeenCalledExactlyOnceWith({
      type: 'request_help',
      taskId,
      expectedRevision: 1,
    });
    expect(find('cloud-task-accept')).toBeDefined();
    expect(find('cloud-task-submit')).toBeUndefined();
  });
});
