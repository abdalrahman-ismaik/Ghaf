import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudRewardForm,
  isReachableRewardMilestone,
} from '../../src/components/cloud-growth/CloudRewardViews';
import { cloudGrowthResources } from '../../src/i18n/cloudGrowthResources';
import type { CloudRewardPlan } from '../../src/models/cloudGrowth';

const hooks = vi.hoisted(() => ({ cursor: 0, values: [] as unknown[] }));
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: (initial: unknown) => {
      const slot = hooks.cursor++;
      if (!(slot in hooks.values))
        hooks.values[slot] = typeof initial === 'function' ? initial() : initial;
      return [
        hooks.values[slot],
        (value: unknown) => {
          hooks.values[slot] = typeof value === 'function' ? value(hooks.values[slot]) : value;
        },
      ];
    },
  };
});
vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('@/components/cloud-growth/common', () => ({
  GrowthButton: 'Button',
  GrowthField: 'Field',
  GrowthRow: 'Row',
  GrowthText: 'Text',
  growthStyles: {},
  useGrowthPassword: () => ['test-password', vi.fn()],
  useGrowthCopy: () => ({
    locale: 'en',
    direction: 'ltr',
    number: String,
    text: (key: string, values?: Record<string, unknown>) =>
      String(cloudGrowthResources.en[key as keyof typeof cloudGrowthResources.en] ?? key).replace(
        /\{\{(\w+)\}\}/gu,
        (_match, name: string) => String(values?.[name] ?? ''),
      ),
  }),
}));

type Element = ReactElement<Record<string, unknown>>;
function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...Children.toArray(node.props.children as ReactNode).flatMap(elements)];
}
function byId(node: ReactNode, id: string): Element {
  const result = elements(node).find((element) => element.props.testID === id);
  if (!result) throw new Error(`Missing test element ${id}`);
  return result;
}
function button(node: ReactNode, label: string): Element {
  const result = elements(node).find(
    (element) => element.type === 'Button' && element.props.children === label,
  );
  if (!result) throw new Error(`Missing button ${label}`);
  return result;
}
const zero = { ghaf: 0, samar: 0, sidr: 0, date_palm: 0, mangrove: 0 };
function plan(
  milestone: CloudRewardPlan['milestone'],
  lifecycle: CloudRewardPlan['lifecycle'] = 'promised',
): CloudRewardPlan {
  return {
    id: '00000000-0000-4000-8000-000000000080',
    childId: '00000000-0000-4000-8000-000000000003',
    version: 1,
    lifecycle,
    month: '2026-09',
    promise: { kind: 'experience', label: { ar: 'وعد', en: 'An agreed activity' } },
    milestone,
    promisedAt: '2026-09-14T10:00:00.000Z',
    unlockedAt: lifecycle === 'promised' ? null : '2026-09-14T12:00:00.000Z',
    givenAt: lifecycle === 'given' ? '2026-09-14T13:00:00.000Z' : null,
    eligibleSeeds: 0,
    eligibleLandscapeSeeds: zero,
    eligibleLandscapeBaseline: zero,
  };
}
function render(input: Partial<Parameters<typeof CloudRewardForm>[0]> = {}) {
  hooks.cursor = 0;
  return CloudRewardForm({
    childId: '00000000-0000-4000-8000-000000000003',
    busy: false,
    onSave: vi.fn().mockResolvedValue(true),
    onCancel: vi.fn(),
    ...input,
  });
}

describe('reachable private reward targets', () => {
  beforeEach(() => {
    hooks.cursor = 0;
    hooks.values = [];
  });

  it('defaults a new landscape promise to Mangrove and disables unsupported landscapes', () => {
    const initial = render();
    (button(initial, cloudGrowthResources.en.landscape_stage).props.onPress as () => void)();
    const form = render();
    expect(byId(form, 'cloud-reward-landscape-mangrove').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    });
    for (const id of ['ghaf', 'samar', 'sidr', 'date_palm'])
      expect(byId(form, `cloud-reward-landscape-${id}`).props.disabled).toBe(true);
    expect(
      elements(form).some(
        (element) => element.props.children === cloudGrowthResources.en.supportedRewardLandscape,
      ),
    ).toBe(true);
  });

  it('offers only one landscape for a count milestone without inferring other eligibility', () => {
    (button(render(), cloudGrowthResources.en.landscapes_at_stage).props.onPress as () => void)();
    const form = render();
    expect(byId(form, 'cloud-reward-landscape-count-1').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    });
    for (const count of [2, 3, 4, 5])
      expect(byId(form, `cloud-reward-landscape-count-${count}`).props.disabled).toBe(true);
    expect(
      isReachableRewardMilestone({
        kind: 'landscapes_at_stage',
        targetStage: 'shoot',
        requiredCount: 2,
      }),
    ).toBe(false);
    expect(
      isReachableRewardMilestone({
        kind: 'landscape_stage',
        landscapeId: 'ghaf',
        targetStage: 'shoot',
      }),
    ).toBe(false);
    expect(
      isReachableRewardMilestone({
        kind: 'landscape_stage',
        landscapeId: 'mangrove',
        targetStage: 'shoot',
      }),
    ).toBe(true);
  });

  it('keeps a prior unsupported promise unchanged until an explicit supported revision is selected', () => {
    const existing = plan({ kind: 'landscapes_at_stage', requiredCount: 3, targetStage: 'shade' });
    const before = structuredClone(existing);
    const onSave = vi.fn().mockResolvedValue(true);
    let form = render({ plan: existing, onSave });
    expect(byId(form, 'cloud-reward-save').props.disabled).toBe(true);
    (byId(form, 'cloud-reward-save').props.onPress as () => void)();
    expect(onSave).not.toHaveBeenCalled();
    (byId(form, 'cloud-reward-landscape-count-1').props.onPress as () => void)();
    form = render({ plan: existing, onSave });
    expect(byId(form, 'cloud-reward-save').props.disabled).toBe(false);
    (byId(form, 'cloud-reward-save').props.onPress as () => void)();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'reward.revise',
        milestone: { kind: 'landscapes_at_stage', requiredCount: 1, targetStage: 'shade' },
      }),
      'test-password',
    );
    expect(existing).toEqual(before);
  });

  it.each(['unlocked', 'given'] as const)(
    'preserves an existing %s promise without exposing revision controls',
    (lifecycle) => {
      const existing = plan(
        { kind: 'landscape_stage', landscapeId: 'ghaf', targetStage: 'shade' },
        lifecycle,
      );
      const before = structuredClone(existing);
      const onSave = vi.fn().mockResolvedValue(true);
      const form = render({ plan: existing, onSave });
      expect(byId(form, 'cloud-reward-immutable')).toBeDefined();
      expect(elements(form).some((element) => element.props.testID === 'cloud-reward-save')).toBe(
        false,
      );
      expect(onSave).not.toHaveBeenCalled();
      expect(existing).toEqual(before);
    },
  );
});
