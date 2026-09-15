import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudMasroofiView,
  type CloudMasroofiViewProps,
} from '../../src/components/cloud-masroofi/CloudMasroofiView';
import type { CloudMasroofiState } from '../../src/features/cloud-masroofi/controller';
import { MASROOFI_DEFAULT_CONTROLS } from '../../src/features/cloud-masroofi/reference';
import { cloudMasroofiResources } from '../../src/i18n/cloudMasroofiResources';
import type { CloudMasroofiTransport } from '../../src/models/cloudMasroofi';
import type { ParentAccountService } from '../../src/models/parentAccount';
import { childId, cloudId, cloudSnapshot, familyId, userId } from '../cloud-family/fixtures';

interface Slot {
  value?: unknown;
  setter?: (value: unknown) => void;
  dependencies?: readonly unknown[];
  effect?: () => void | (() => void);
  cleanup?: () => void;
}
const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as Slot[],
  effects: [] as (() => void)[],
  locale: 'en' as 'ar' | 'en',
  createController: vi.fn(),
  appListeners: new Set<() => void>(),
  webListeners: new Set<() => void>(),
}));
vi.mock('react', async (original) => {
  const next = () => (mock.slots[mock.cursor++] ??= {});
  const same = (left?: readonly unknown[], right?: readonly unknown[]) =>
    Boolean(
      left &&
      right &&
      left.length === right.length &&
      left.every((value, index) => Object.is(value, right[index])),
    );
  return {
    ...(await original<typeof import('react')>()),
    useState(initial: unknown) {
      const slot = next();
      if (!('value' in slot)) slot.value = typeof initial === 'function' ? initial() : initial;
      slot.setter ??= (value: unknown) => {
        slot.value = typeof value === 'function' ? value(slot.value) : value;
      };
      return [slot.value, slot.setter];
    },
    useMemo(factory: () => unknown, dependencies: readonly unknown[]) {
      const slot = next();
      if (!same(slot.dependencies, dependencies)) slot.value = factory();
      slot.dependencies = dependencies;
      return slot.value;
    },
    useRef(initial: unknown) {
      const slot = next();
      slot.value ??= { current: initial };
      return slot.value;
    },
    useSyncExternalStore: (_subscribe: unknown, get: () => unknown) => get(),
    useEffect(effect: () => void | (() => void), dependencies: readonly unknown[]) {
      const slot = next();
      slot.effect = effect;
      if (same(slot.dependencies, dependencies)) return;
      slot.dependencies = dependencies;
      mock.effects.push(() => {
        slot.cleanup?.();
        slot.cleanup = effect() || undefined;
      });
    },
  };
});
vi.mock('react-native', () => ({
  View: 'View',
  Platform: { OS: 'web' },
  AppState: {
    currentState: 'active',
    addEventListener: (_name: string, callback: () => void) => {
      mock.appListeners.add(callback);
      return { remove: () => mock.appListeners.delete(callback) };
    },
  },
  BackHandler: { addEventListener: vi.fn() },
}));
vi.mock('@/features/cloud-masroofi/controller', () => ({
  createCloudMasroofiController: mock.createController,
}));
vi.mock('@/components/masroofi/MasroofiCard', () => ({ MasroofiCard: 'UaeCard' }));
vi.mock('@/components/cloud-masroofi/forms', () => ({
  MasroofiControlsForm: 'ControlsForm',
  MasroofiEnrollmentForm: 'EnrollmentForm',
  MasroofiFundsForm: 'FundsForm',
  MasroofiRewardForm: 'RewardForm',
}));
vi.mock('@/components/cloud-masroofi/presentation', async (original) => ({
  ...(await original<typeof import('../../src/components/cloud-masroofi/presentation')>()),
  MasroofiCardSummary: 'CardSummary',
  MasroofiHistory: 'History',
  MasroofiPromises: 'Promises',
  MasroofiPurchaseShop: 'Shop',
  MasroofiRulesSummary: 'Rules',
}));
vi.mock('@/components/cloud-masroofi/common', () => ({
  MasroofiButton: 'Button',
  MasroofiField: 'Field',
  MasroofiRow: 'Row',
  MasroofiText: 'Text',
  masroofiStyles: {},
  useMasroofiPassword: () => useState(''),
  useMasroofiCopy: () => ({
    locale: mock.locale,
    direction: mock.locale === 'ar' ? 'rtl' : 'ltr',
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
  return [node, ...nodes(node.props.children as ReactNode)];
}
function content(node: ReactNode): string {
  if (Array.isArray(node)) return node.map(content).join(' ');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return isValidElement<{ children?: ReactNode }>(node) ? content(node.props.children) : '';
}
function byType(node: ReactNode, type: string) {
  return nodes(node).filter((item) => item.type === type);
}
function press(node: ReactNode, label: string) {
  const button = byType(node, 'Button').find((item) => content(item) === label);
  if (!button) throw new Error(`Missing button ${label}`);
  if (!button.props.disabled) (button.props.onPress as () => void)();
}
function draw(props: CloudMasroofiViewProps) {
  mock.cursor = 0;
  const shell = CloudMasroofiView(props);
  const tree = (shell.type as (props: CloudMasroofiViewProps) => ReactNode)(shell.props);
  mock.effects.splice(0).forEach((effect) => effect());
  return tree;
}
function cleanup() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
}

const family = cloudSnapshot();
const service = {
  familyRequest: vi.fn().mockResolvedValue({}),
  subscribeFamily: vi.fn().mockResolvedValue(() => undefined),
  reauthenticate: vi.fn().mockResolvedValue({}),
} as unknown as ParentAccountService;
const props: CloudMasroofiViewProps = {
  userId,
  familyId,
  service,
  actor: family.actor,
  childProfiles: family.children,
  tasks: family.tasks,
};
const ready = (): CloudMasroofiState => ({
  snapshot: {
    schemaVersion: 1,
    actor: family.actor,
    familyId,
    revision: 1,
    cards: [
      {
        childId,
        balanceFils: 0,
        controlsVersion: 1,
        age10PlusConfirmed: true,
        controls: MASROOFI_DEFAULT_CONTROLS,
      },
    ],
    promises: [],
    transactions: [],
  },
  loading: false,
  busy: false,
  error: null,
  pendingRequestId: null,
  retryNeedsPassword: false,
  conflict: false,
  saved: false,
  subscriptionError: false,
});
function makeController(state: CloudMasroofiState) {
  return {
    getSnapshot: () => state,
    subscribe: vi.fn(),
    load: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    command: vi.fn().mockResolvedValue(true),
    retry: vi.fn().mockResolvedValue(true),
    cancelPending: vi.fn(),
    setActive: vi.fn(),
    dispose: vi.fn(),
  };
}

describe('hosted Masroofi view boundary and lifetime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mock.cursor = 0;
    mock.slots = [];
    mock.effects = [];
    mock.locale = 'en';
    mock.appListeners.clear();
    mock.webListeners.clear();
    mock.createController.mockReset();
    vi.clearAllMocks();
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: (_name: string, callback: () => void) => mock.webListeners.add(callback),
      removeEventListener: (_name: string, callback: () => void) =>
        mock.webListeners.delete(callback),
    });
  });
  afterEach(async () => {
    cleanup();
    await Promise.resolve();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(['ar', 'en'] as const)(
    'keeps the real holder artwork discoverable on an absent schema without inventing a balance (%s)',
    (locale) => {
      mock.locale = locale;
      mock.createController.mockReturnValue(
        makeController({ ...ready(), snapshot: null, error: 'schema_unavailable' }),
      );
      const tree = draw(props);
      expect(byType(tree, 'UaeCard')[0]?.props.holderName).toBe(family.children[0]!.displayName);
      expect(byType(tree, 'UaeCard')[0]?.props.direction).toBe(locale === 'ar' ? 'rtl' : 'ltr');
      expect(content(tree)).toContain(cloudMasroofiResources[locale].schemaUnavailable);
      expect(byType(tree, 'CardSummary')).toHaveLength(0);
      expect(byType(tree, 'EnrollmentForm')).toHaveLength(0);
      expect(
        nodes(tree).filter((item) => item.props.testID === 'hosted-masroofi-simulation-notice'),
      ).toHaveLength(1);
      expect(content(tree)).not.toContain('0.00');
    },
  );

  it('pins RPC and reauthentication to the session user and preserves a controller through locale changes', async () => {
    const controller = makeController(ready());
    mock.createController.mockReturnValue(controller);
    draw(props);
    const options = mock.createController.mock.calls[0]![0] as {
      transport: CloudMasroofiTransport;
    };
    await options.transport.familyRequest('ghaf_family_masroofi', { p_family_id: familyId });
    await options.transport.reauthenticate?.('secret');
    expect(service.familyRequest).toHaveBeenCalledWith(
      'ghaf_family_masroofi',
      { p_family_id: familyId },
      userId,
    );
    expect(service.reauthenticate).toHaveBeenCalledWith('secret', userId);
    mock.locale = 'ar';
    draw({ ...props, actor: { ...props.actor } });
    expect(mock.createController).toHaveBeenCalledOnce();
    expect(controller.load).toHaveBeenCalledOnce();
  });

  it('renders Parent controls and never gives the Parent a purchase action', () => {
    mock.createController.mockReturnValue(makeController(ready()));
    const tree = draw(props);
    expect(content(tree)).toContain('Add practice funds');
    expect(content(tree)).toContain('Link a task reward');
    expect(byType(tree, 'Shop')).toEqual([]);
    expect(byType(tree, 'CardSummary')[0]?.props.card).toEqual(ready().snapshot!.cards[0]);
  });

  it('restricts Child selection and actions to their own loaded card', () => {
    const actor = { ...family.actor, role: 'child' as const, childId };
    const state = { ...ready(), snapshot: { ...ready().snapshot!, actor } };
    const controller = makeController(state);
    mock.createController.mockReturnValue(controller);
    const input = {
      ...props,
      actor,
      childProfiles: [
        ...family.children,
        { ...family.children[0]!, id: cloudId(90), displayName: 'Other Child' },
      ],
    };
    let tree = draw(input);
    expect(content(tree)).not.toContain('Other Child');
    expect(content(tree)).not.toContain('Add practice funds');
    expect(content(tree)).not.toContain('Link a task reward');
    press(tree, cloudMasroofiResources.en.shopTitle);
    tree = draw(input);
    const shop = byType(tree, 'Shop')[0]!;
    (shop.props.onPurchase as (id: string) => void)('stationery');
    expect(controller.command).toHaveBeenCalledWith(
      { type: 'purchase', childId, fixtureId: 'stationery' },
      undefined,
    );
  });

  it('allows a corrected password after a known failed reauthentication', () => {
    let state = ready();
    const controller = { ...makeController(state), getSnapshot: () => state };
    mock.createController.mockReturnValue(controller);
    let tree = draw(props);
    press(tree, 'Add practice funds');
    tree = draw(props);
    state = { ...state, error: 'reauth_required' };
    tree = draw(props);
    expect(byType(tree, 'FundsForm')[0]?.props.busy).toBe(false);
    expect(content(tree)).toContain(cloudMasroofiResources.en.reauthError);
  });

  it('clears private presentation and form state on browser background, and refreshes on return', () => {
    const controller = makeController(ready());
    mock.createController.mockReturnValue(controller);
    let tree = draw(props);
    press(tree, 'Add practice funds');
    tree = draw(props);
    expect(byType(tree, 'FundsForm')).toHaveLength(1);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    mock.webListeners.forEach((callback) => callback());
    tree = draw(props);
    expect(controller.setActive).toHaveBeenLastCalledWith(false);
    expect(byType(tree, 'UaeCard')).toEqual([]);
    expect(byType(tree, 'FundsForm')).toEqual([]);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    mock.webListeners.forEach((callback) => callback());
    tree = draw(props);
    expect(controller.setActive).toHaveBeenLastCalledWith(true);
    expect(byType(tree, 'FundsForm')).toEqual([]);
  });

  it('survives effect replay and disposes the controller only after actual unmount', async () => {
    const controller = makeController(ready());
    mock.createController.mockReturnValue(controller);
    draw(props);
    cleanup();
    mock.slots.forEach((slot) => {
      if (slot.effect) slot.cleanup = slot.effect() || undefined;
    });
    await Promise.resolve();
    expect(controller.dispose).not.toHaveBeenCalled();
    expect(mock.webListeners.size).toBe(1);
    cleanup();
    await Promise.resolve();
    expect(controller.dispose).toHaveBeenCalledOnce();
    expect(mock.webListeners.size).toBe(0);
    expect(CloudMasroofiView(props).key).not.toBe(
      CloudMasroofiView({ ...props, userId: cloudId(95) }).key,
    );
  });
});
