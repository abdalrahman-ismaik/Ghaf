import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MasroofiControlsForm,
  MasroofiEnrollmentForm,
  MasroofiFundsForm,
  MasroofiRewardForm,
  eligibleMasroofiTasks,
  parseMasroofiAmount,
} from '../../src/components/cloud-masroofi/forms';
import {
  MasroofiHistory,
  MasroofiPromises,
  MasroofiPurchaseShop,
  masroofiErrorCopy,
} from '../../src/components/cloud-masroofi/presentation';
import {
  MASROOFI_DEFAULT_CONTROLS,
  MASROOFI_PURCHASE_REFERENCES,
} from '../../src/features/cloud-masroofi/reference';
import { P0_RECYCLING_TEMPLATE } from '../../src/features/tasks/demoContent';
import { cloudMasroofiResources } from '../../src/i18n/cloudMasroofiResources';
import type { CloudFamilyTask } from '../../src/models/cloudFamily';
import type {
  CloudMasroofiCard,
  CloudMasroofiPromise,
  CloudMasroofiTransaction,
} from '../../src/models/cloudMasroofi';
import { MASROOFI_CATEGORIES } from '../../src/models/masroofi';
import { childId, cloudId, cloudSnapshot } from '../cloud-family/fixtures';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  locale: 'en' as 'ar' | 'en',
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState(initial: unknown) {
    const slot = (mock.slots[mock.cursor++] ??= {
      value: typeof initial === 'function' ? initial() : initial,
    });
    return [
      slot.value,
      (next: unknown) => {
        slot.value = typeof next === 'function' ? next(slot.value) : next;
      },
    ];
  },
}));
vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('@/components/cloud-masroofi/common', () => ({
  MasroofiButton: 'Button',
  MasroofiField: 'Field',
  MasroofiRow: 'Row',
  MasroofiText: 'Text',
  MasroofiToggle: 'Toggle',
  masroofiStyles: {},
  useMasroofiPassword: () => useState(''),
  useMasroofiCopy: () => ({
    locale: mock.locale,
    direction: mock.locale === 'ar' ? 'rtl' : 'ltr',
    money: (fils: number) => `AED ${(fils / 100).toFixed(2)}`,
    date: (value: string) => value,
    text: (key: string, values?: Record<string, unknown>) => {
      const copy: Readonly<Record<string, string>> = cloudMasroofiResources[mock.locale];
      return (copy[key] ?? key).replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
        String(values?.[name] ?? ''),
      );
    },
  }),
}));

type Element = ReactElement<Record<string, unknown>>;
function nodes(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  if (typeof node.type === 'function')
    return nodes((node.type as (props: object) => ReactNode)(node.props));
  return [node, ...nodes(node.props.children as ReactNode)];
}
function content(node: ReactNode): string {
  if (Array.isArray(node)) return node.map(content).join(' ');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!isValidElement<{ children?: ReactNode }>(node)) return '';
  if (typeof node.type === 'function')
    return content((node.type as (props: object) => ReactNode)(node.props));
  return content(node.props.children);
}
function find(node: ReactNode, type: string, label: string) {
  const found = nodes(node).find(
    (item) => item.type === type && (item.props.label === label || content(item) === label),
  );
  if (!found) throw new Error(`Missing ${type}: ${label}`);
  return found;
}
function press(node: ReactNode, label: string) {
  const button = find(node, 'Button', label);
  if (!button.props.disabled) (button.props.onPress as () => void)();
}
function edit(node: ReactNode, label: string, value: string) {
  (find(node, 'Field', label).props.onChangeText as (next: string) => void)(value);
}
function render(factory: () => ReactNode) {
  mock.cursor = 0;
  return factory();
}
const source = cloudSnapshot();
const child = source.children[0]!;
const task: CloudFamilyTask = {
  ...source.tasks[0]!,
  status: 'assigned',
  submittedAt: null,
  recognizedAt: null,
};
const card: CloudMasroofiCard = {
  childId,
  balanceFils: 0,
  age10PlusConfirmed: true,
  controlsVersion: 7,
  controls: MASROOFI_DEFAULT_CONTROLS,
};
const promise: CloudMasroofiPromise = {
  id: cloudId(40),
  childId,
  taskId: task.id,
  taskRevision: task.revision,
  amountFils: 1234,
  status: 'promised',
  createdAt: '2026-09-15T10:00:00Z',
  creditedAt: null,
};

describe('hosted Masroofi forms and private presentation', () => {
  beforeEach(() => {
    mock.cursor = 0;
    mock.slots = [];
    mock.locale = 'en';
  });

  it('provides matching Arabic/English resources and all eight spending labels', () => {
    expect(Object.keys(cloudMasroofiResources.ar).sort()).toEqual(
      Object.keys(cloudMasroofiResources.en).sort(),
    );
    for (const key of Object.keys(
      cloudMasroofiResources.ar,
    ) as (keyof typeof cloudMasroofiResources.ar)[]) {
      expect(cloudMasroofiResources.ar[key].trim()).not.toBe('');
      expect(cloudMasroofiResources.en[key].trim()).not.toBe('');
      expect(cloudMasroofiResources.ar[key].match(/\{\{[^}]+\}\}/gu) ?? []).toEqual(
        cloudMasroofiResources.en[key].match(/\{\{[^}]+\}\}/gu) ?? [],
      );
    }
    for (const locale of ['ar', 'en'] as const) {
      for (const category of MASROOFI_CATEGORIES)
        expect(cloudMasroofiResources[locale][category]).toBeTruthy();
    }
  });

  it('parses Arabic and English money exactly and rejects invalid or excessive amounts', () => {
    expect(parseMasroofiAmount('١٢٫٣٤', 50000)).toBe(1234);
    expect(parseMasroofiAmount('۱۲.۳۴', 50000)).toBe(1234);
    expect(parseMasroofiAmount('0.01', 50000)).toBe(1);
    expect(parseMasroofiAmount('500', 50000)).toBe(50000);
    for (const input of ['', '0', '-1', '1.005', '1e2', '500.01', 'NaN', 'Infinity', '1,000'])
      expect(parseMasroofiAmount(input, 50000)).toBeNull();
  });

  it('requires explicit age confirmation and a password even for the 9–11 age band', () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const draw = () =>
      render(() => MasroofiEnrollmentForm({ child, busy: false, onSave, onCancel: vi.fn() }));
    let tree = draw();
    expect(find(tree, 'Button', 'Activate card').props.disabled).toBe(true);
    press(tree, 'Activate card');
    expect(onSave).not.toHaveBeenCalled();
    (
      find(tree, 'Toggle', cloudMasroofiResources.en.ageConfirm).props.onChange as (
        value: boolean,
      ) => void
    )(true);
    tree = draw();
    expect(find(tree, 'Button', 'Activate card').props.disabled).toBe(true);
    edit(tree, 'Parent password', 'parent-secret');
    tree = draw();
    press(tree, 'Activate card');
    expect(onSave).toHaveBeenCalledWith(
      { type: 'card.enable', childId, age10PlusConfirmed: true },
      'parent-secret',
    );
    expect(find(draw(), 'Field', 'Parent password').props.value).toBe('');
  });

  it('denies 6–8 enrollment without displaying a password field or activation control', () => {
    const tree = render(() =>
      MasroofiEnrollmentForm({
        child: { ...child, ageBand: '6_8' },
        busy: false,
        onSave: vi.fn(),
        onCancel: vi.fn(),
      }),
    );
    expect(content(tree)).toContain(cloudMasroofiResources.en.underAge);
    expect(nodes(tree).filter((node) => node.type === 'Field' || node.type === 'Toggle')).toEqual(
      [],
    );
    expect(
      nodes(tree)
        .filter((node) => node.type === 'Button')
        .map(content),
    ).toEqual(['Cancel']);
  });

  it('saves selected categories, freeze and decimal limits against the loaded controls version', () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const draw = () =>
      render(() => MasroofiControlsForm({ card, busy: false, onSave, onCancel: vi.fn() }));
    let tree = draw();
    expect(nodes(tree).filter((node) => node.type === 'Toggle')).toHaveLength(10);
    (
      find(tree, 'Toggle', cloudMasroofiResources.en.freeze).props.onChange as (
        next: boolean,
      ) => void
    )(true);
    (
      find(tree, 'Toggle', cloudMasroofiResources.en.books).props.onChange as (
        next: boolean,
      ) => void
    )(true);
    edit(tree, cloudMasroofiResources.en.purchaseLimit, '١٠٫٥٠');
    edit(tree, cloudMasroofiResources.en.dailyLimit, '٢٥');
    edit(tree, 'Parent password', 'secret');
    tree = draw();
    press(tree, cloudMasroofiResources.en.saveControls);
    expect(onSave).toHaveBeenCalledWith(
      {
        type: 'card.controls',
        childId,
        expectedVersion: 7,
        controls: {
          ...card.controls,
          frozen: true,
          allowedCategories: ['stationery', 'books'],
          perPurchaseLimitFils: 1050,
          dailyLimitFils: 2500,
        },
      },
      'secret',
    );
    expect(card.balanceFils).toBe(0);
    expect(card.controls.frozen).toBe(false);
    expect(find(draw(), 'Field', 'Parent password').props.value).toBe('');
  });

  it('does not submit an invalid top-up and clears the password when a valid request is sent', () => {
    const onSave = vi.fn().mockResolvedValue(false);
    const draw = () =>
      render(() => MasroofiFundsForm({ childId, busy: false, onSave, onCancel: vi.fn() }));
    let tree = draw();
    edit(tree, 'Amount in AED', '500.01');
    edit(tree, 'Parent password', 'secret');
    press(draw(), 'Add practice funds');
    expect(onSave).not.toHaveBeenCalled();
    tree = draw();
    expect(content(tree)).toContain(cloudMasroofiResources.en.errorAmount);
    edit(tree, 'Amount in AED', '10.10');
    press(draw(), 'Add practice funds');
    expect(onSave).toHaveBeenCalledWith(
      { type: 'card.top_up', childId, amountFils: 1010 },
      'secret',
    );
    expect(find(draw(), 'Field', 'Parent password').props.value).toBe('');
  });

  it('preserves a controls draft across locale and server updates without silently overwriting new rules', () => {
    const onSave = vi.fn().mockResolvedValue(true);
    let loadedCard = card;
    const draw = () =>
      render(() =>
        MasroofiControlsForm({ card: loadedCard, busy: false, onSave, onCancel: vi.fn() }),
      );
    let tree = draw();
    edit(tree, cloudMasroofiResources.en.purchaseLimit, '12.34');
    edit(tree, 'Parent password', 'secret');
    mock.locale = 'ar';
    tree = draw();
    expect(find(tree, 'Field', cloudMasroofiResources.ar.purchaseLimit).props.value).toBe('12.34');
    loadedCard = {
      ...card,
      controlsVersion: card.controlsVersion + 1,
      controls: { ...card.controls, perPurchaseLimitFils: 500 },
    };
    tree = draw();
    expect(find(tree, 'Field', cloudMasroofiResources.ar.purchaseLimit).props.value).toBe('12.34');
    expect(content(tree)).toContain(cloudMasroofiResources.ar.controlsConflict);
    expect(find(tree, 'Button', cloudMasroofiResources.ar.saveControls).props.disabled).toBe(true);
    press(tree, cloudMasroofiResources.ar.saveControls);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('offers only canonical unaccepted own-family tasks without an existing reward', () => {
    expect(eligibleMasroofiTasks([task], child, [])).toEqual([task]);
    const rejected: CloudFamilyTask[] = [
      { ...task, childId: cloudId(90) },
      { ...task, familyId: cloudId(90) },
      { ...task, status: 'accepted' },
      { ...task, submittedAt: '2026-09-15T10:00:00Z' },
      { ...task, template: { ...task.template, title: { ar: 'تعديل', en: 'Changed' } } },
      { ...task, catalogId: 'custom' },
      { ...task, template: { ...task.template, routinePhase: 'maintenance' } },
      { ...task, template: { ...task.template, visibilityScope: 'child_guardian' } },
    ];
    expect(eligibleMasroofiTasks(rejected, child, [])).toEqual([]);
    expect(eligibleMasroofiTasks([task], child, [promise])).toEqual([]);
    expect(eligibleMasroofiTasks([task], { ...child, ageBand: '6_8' }, [])).toEqual([]);
    const personalized = JSON.parse(
      JSON.stringify(P0_RECYCLING_TEMPLATE)
        .replaceAll('Salem', child.displayName)
        .replaceAll('سالم', child.displayName),
    ) as CloudFamilyTask['template'];
    const recycling = { ...task, catalogId: P0_RECYCLING_TEMPLATE.id, template: personalized };
    expect(eligibleMasroofiTasks([recycling], child, [])).toEqual([recycling]);
  });

  it('locks a reward only after task selection and transmits the actual task revision', () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const draw = () =>
      render(() =>
        MasroofiRewardForm({
          child,
          tasks: [task],
          promises: [],
          busy: false,
          onSave,
          onCancel: vi.fn(),
        }),
      );
    let tree = draw();
    edit(tree, cloudMasroofiResources.en.rewardAmount, '12.34');
    edit(tree, 'Parent password', 'secret');
    expect(find(draw(), 'Button', cloudMasroofiResources.en.lockReward).props.disabled).toBe(true);
    press(draw(), task.template.title.en);
    tree = draw();
    expect(find(tree, 'Field', 'Parent password').props.value).toBe('');
    edit(tree, 'Parent password', 'secret');
    press(draw(), cloudMasroofiResources.en.lockReward);
    expect(onSave).toHaveBeenCalledWith(
      {
        type: 'reward.promise',
        taskId: task.id,
        expectedTaskRevision: task.revision,
        amountFils: 1234,
      },
      'secret',
    );
  });

  it('retains the reward amount but requires re-selection after the selected task changes', () => {
    const onSave = vi.fn().mockResolvedValue(true);
    let currentTask = task;
    const draw = () =>
      render(() =>
        MasroofiRewardForm({
          child,
          tasks: [currentTask],
          promises: [],
          busy: false,
          onSave,
          onCancel: vi.fn(),
        }),
      );
    let tree = draw();
    press(tree, task.template.title.en);
    tree = draw();
    edit(tree, cloudMasroofiResources.en.rewardAmount, '9.50');
    edit(tree, 'Parent password', 'secret');
    currentTask = { ...task, revision: task.revision + 1 };
    tree = draw();
    expect(find(tree, 'Field', cloudMasroofiResources.en.rewardAmount).props.value).toBe('9.50');
    expect(content(tree)).toContain(cloudMasroofiResources.en.taskConflict);
    expect(find(tree, 'Button', cloudMasroofiResources.en.lockReward).props.disabled).toBe(true);
    press(tree, cloudMasroofiResources.en.lockReward);
    expect(onSave).not.toHaveBeenCalled();
    press(tree, task.template.title.en);
    tree = draw();
    expect(find(tree, 'Field', 'Parent password').props.value).toBe('');
    edit(tree, 'Parent password', 'secret');
    press(draw(), cloudMasroofiResources.en.lockReward);
    expect(onSave).toHaveBeenCalledWith(
      {
        type: 'reward.promise',
        taskId: task.id,
        expectedTaskRevision: currentTask.revision,
        amountFils: 950,
      },
      'secret',
    );
  });

  it.each(['ar', 'en'] as const)(
    'hides every pending Child amount and sibling promise in %s',
    (locale) => {
      mock.locale = locale;
      const input = {
        promises: [
          promise,
          { ...promise, id: cloudId(42), childId: cloudId(99), amountFils: 9999 },
        ],
        tasks: [task],
        childId,
      };
      const childCopy = content(MasroofiPromises({ ...input, parent: false }));
      expect(childCopy).not.toContain('12.34');
      expect(childCopy).not.toContain('99.99');
      expect(childCopy).toContain(cloudMasroofiResources[locale].rewardNotice);
      expect(content(MasroofiPromises({ ...input, parent: true }))).toContain('12.34');
      expect(
        content(
          MasroofiPromises({
            ...input,
            promises: [{ ...promise, status: 'credited' }],
            parent: false,
          }),
        ),
      ).toContain('12.34');
    },
  );

  it('offers only the eight reference purchases and does not calculate a new balance', () => {
    const onPurchase = vi.fn();
    const tree = MasroofiPurchaseShop({ card, busy: false, onPurchase });
    const buttons = nodes(tree).filter((node) => node.type === 'Button');
    expect(buttons).toHaveLength(8);
    buttons.forEach((button) => (button.props.onPress as () => void)());
    expect(onPurchase.mock.calls.map(([id]) => id)).toEqual(
      Object.keys(MASROOFI_PURCHASE_REFERENCES),
    );
    expect(card.balanceFils).toBe(0);
  });

  it('shows the authoritative decline reason and balance without exposing sibling entries', () => {
    const entry: CloudMasroofiTransaction = {
      id: cloudId(50),
      childId,
      requestId: cloudId(51),
      kind: 'purchase',
      amountFils: 300,
      status: 'declined',
      declineReason: 'card_frozen',
      fixtureId: 'stationery',
      day: '2026-09-15',
      balanceAfterFils: 4321,
      taskId: null,
      createdAt: '2026-09-15T10:00:00Z',
    };
    const tree = MasroofiHistory({
      transactions: [entry, { ...entry, id: cloudId(52), childId: cloudId(99), amountFils: 9999 }],
      childId,
    });
    expect(content(tree)).toContain(cloudMasroofiResources.en.errorFrozen);
    expect(content(tree)).toContain('AED 43.21');
    expect(content(tree)).not.toContain('99.99');
    expect(masroofiErrorCopy('schema_unavailable')).toBe('schemaUnavailable');
    expect(masroofiErrorCopy('invalid_response')).toBe('invalidResponse');
  });
});
