import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudMessageConversation } from '../../src/components/cloud-messaging/CloudMessageConversation';
import { CloudMessageInbox } from '../../src/components/cloud-messaging/CloudMessageInbox';
import type {
  CloudMessagingController,
  CloudMessagingState,
} from '../../src/components/cloud-messaging/common';
import { phraseText } from '../../src/features/familyMessaging/contracts';
import { cloudMessagingResources } from '../../src/i18n/cloudMessagingResources';

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
  useRef(initial: unknown) {
    return (mock.slots[mock.cursor++] ??= { value: { current: initial } }).value;
  },
  useEffect: () => undefined,
}));
vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('@/components/primitives', () => ({ Input: 'Input' }));
vi.mock('@/components/cloud-family/common', () => ({ CloudActions: 'CloudActions' }));
vi.mock('@/components/familyMessaging/shared', () => ({
  MessageButton: 'MessageButton',
  MessageText: 'MessageText',
  styles: {},
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (select: (state: object) => unknown) =>
    select({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t(key: string, values?: Record<string, unknown>) {
      const label =
        cloudMessagingResources[mock.locale][
          key.replace('cloudMessaging.', '') as keyof typeof cloudMessagingResources.en
        ] ?? key;
      return Object.entries(values ?? {}).reduce(
        (value, [name, replacement]) => value.replaceAll(`{{${name}}}`, String(replacement)),
        label as string,
      );
    },
  }),
}));

const parentId = '10000000-0000-4000-8000-000000000001';
const childId = '20000000-0000-4000-8000-000000000001';
const secondChildId = '20000000-0000-4000-8000-000000000002';
const threadId = '30000000-0000-4000-8000-000000000001';
const messageId = '40000000-0000-4000-8000-000000000001';
const requestId = '50000000-0000-4000-8000-000000000001';
function state(role: 'parent' | 'child' = 'parent'): CloudMessagingState {
  return {
    status: 'ready',
    inbox: {
      actor: {
        personId: role === 'parent' ? parentId : childId,
        role,
        ageBand: role === 'parent' ? null : '6_8',
      },
      threads: [
        {
          id: threadId,
          kind: 'parent_child',
          childId,
          otherName: role === 'parent' ? 'Test Child' : 'Test Parent',
          otherRole: role === 'parent' ? 'child' : 'parent',
          otherPersonId: role === 'parent' ? childId : parentId,
          lastSequence: 0,
          readSequence: 0,
          unreadCount: 0,
        },
      ],
    },
    permissions: [],
    threadId,
    messages: [],
    hasMore: false,
    busy: false,
    error: null,
    pending: null,
  };
}
let controller: CloudMessagingController;
let tree: ReactNode;
type Node = ReactElement<Record<string, unknown>>;
function visit(value: ReactNode): Node[] {
  if (Array.isArray(value)) return value.flatMap(visit);
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...visit(value.props.children as ReactNode)];
}
function find(id: string) {
  return visit(tree).find((node) => node.props.testID === id);
}
function render(component: () => ReactNode) {
  mock.cursor = 0;
  tree = component();
}
function press(id: string) {
  const node = find(id);
  expect(node, id).toBeDefined();
  (node!.props.onPress as () => void)();
}
function labels() {
  return visit(tree)
    .flatMap((node) => (typeof node.props.children === 'string' ? [node.props.children] : []))
    .join(' ');
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}
beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.locale = 'en';
  controller = {
    send: vi.fn(async () => true),
    retry: vi.fn(async () => true),
    refresh: vi.fn(async () => true),
    open: vi.fn(async () => true),
    close: vi.fn(() => true),
    discardPending: vi.fn(() => true),
    loadOlder: vi.fn(async () => true),
    leavePeer: vi.fn(async () => true),
    setPeerPermission: vi.fn(async () => true),
  } as unknown as CloudMessagingController;
});

describe('real-account messaging controls with synthetic server DTOs', () => {
  it.each(['ar', 'en'] as const)(
    'requires a reviewed approved phrase for age 6–8 in %s',
    async (locale) => {
      mock.locale = locale;
      const renderConversation = () =>
        CloudMessageConversation({ controller, state: state('child') });
      render(renderConversation);
      expect(find('cloud-message-input')).toBeUndefined();
      expect(find('cloud-message-send')!.props.disabled).toBe(true);
      press('cloud-message-phrase-help');
      render(renderConversation);
      expect(find('cloud-message-phrase-review')!.props.children).toBe(phraseText[locale].help);
      expect(controller.send).not.toHaveBeenCalled();
      press('cloud-message-send');
      await settle();
      expect(controller.send).toHaveBeenCalledExactlyOnceWith(phraseText[locale].help, 'help');
      render(renderConversation);
      expect(find('cloud-message-phrase-review')).toBeUndefined();
    },
  );

  it('validates the 500 Unicode character bound and waits for confirmed send before clearing', async () => {
    let resolve!: (value: boolean) => void;
    vi.mocked(controller.send).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const renderConversation = () => CloudMessageConversation({ controller, state: state() });
    render(renderConversation);
    (find('cloud-message-input')!.props.onChangeText as (value: string) => void)('a'.repeat(501));
    render(renderConversation);
    expect(find('cloud-message-send')!.props.disabled).toBe(true);
    press('cloud-message-send');
    expect(controller.send).not.toHaveBeenCalled();
    (find('cloud-message-input')!.props.onChangeText as (value: string) => void)('🌱'.repeat(500));
    render(renderConversation);
    expect(find('cloud-message-send')!.props.disabled).toBe(false);
    press('cloud-message-send');
    render(renderConversation);
    expect(find('cloud-message-input')!.props.value).toBe('🌱'.repeat(500));
    resolve(true);
    await settle();
    render(renderConversation);
    expect(find('cloud-message-input')!.props.value).toBe('');
  });

  it('keeps drafting available during a history refresh while send waits for the service', () => {
    render(() => CloudMessageConversation({ controller, state: { ...state(), busy: true } }));
    expect(find('cloud-message-input')!.props.editable).toBe(true);
    expect(find('cloud-message-send')!.props.disabled).toBe(true);
  });

  it('retains an unconfirmed draft and distinguishes retry from sending a new message', async () => {
    vi.mocked(controller.send).mockResolvedValue(false);
    const data = state();
    const renderConversation = () => CloudMessageConversation({ controller, state: data });
    render(renderConversation);
    (find('cloud-message-input')!.props.onChangeText as (value: string) => void)('Please help');
    render(renderConversation);
    press('cloud-message-send');
    await settle();
    render(renderConversation);
    expect(find('cloud-message-input')!.props.value).toBe('Please help');
    const pending = {
      requestId,
      threadId,
      body: 'Please help',
      phraseId: null,
      status: 'failed' as const,
      createdAt: Date.now(),
    };
    render(() => CloudMessageConversation({ controller, state: { ...data, pending } }));
    expect(find('cloud-send-failed')).toBeDefined();
    expect(find('cloud-message-1')).toBeUndefined();
    expect(find('cloud-message-send')!.props.disabled).toBe(true);
    expect(find('cloud-message-close')!.props.disabled).toBe(true);
    press('cloud-message-retry-send');
    expect(controller.retry).toHaveBeenCalledOnce();
    expect(controller.send).toHaveBeenCalledOnce();
  });

  it('labels only committed rows as saved and attributes the other participant by identity', () => {
    const data = {
      ...state('child'),
      messages: [
        {
          id: messageId,
          threadId,
          senderId: parentId,
          body: 'Specific encouragement',
          sequence: 1,
          createdAt: '2026-09-14T10:00:00Z',
          clientKey: requestId,
        },
      ],
    };
    render(() => CloudMessageConversation({ controller, state: data }));
    expect(find('cloud-message-1')).toBeDefined();
    expect(labels()).toContain('Test Parent');
    expect(labels()).not.toContain('You');
    expect(
      visit(tree).some(
        (node) => Array.isArray(node.props.children) && node.props.children.includes('Saved'),
      ),
    ).toBe(true);
  });

  it('requires explicit guardian confirmation and cannot enable unpaired Children', () => {
    const data = {
      ...state(),
      threadId: null,
      permissions: [
        {
          firstChildId: childId,
          secondChildId,
          firstName: 'First',
          secondName: 'Second',
          threadId: null,
          enabled: false,
          available: false,
        },
      ],
    };
    const button = `cloud-peer-change-${childId}-${secondChildId}`;
    render(() => CloudMessageInbox({ controller, state: data }));
    expect(find(button)!.props.disabled).toBe(true);
    data.permissions[0]!.available = true;
    const renderInbox = () => CloudMessageInbox({ controller, state: data });
    render(renderInbox);
    press(button);
    render(renderInbox);
    expect(controller.setPeerPermission).not.toHaveBeenCalled();
    press('cloud-peer-confirm');
    expect(controller.setPeerPermission).toHaveBeenCalledExactlyOnceWith(
      childId,
      secondChildId,
      true,
    );
    expect(find(`cloud-open-thread-${threadId}`)).toBeDefined();
    expect(
      visit(tree).filter((node) => String(node.props.testID).startsWith('cloud-open-thread-')),
    ).toHaveLength(1);
  });

  it('never shows guardian permission controls to a Child and allows explicit peer exit', () => {
    const base = state('child');
    const data: CloudMessagingState = {
      ...base,
      inbox: {
        ...base.inbox!,
        threads: [
          {
            ...base.inbox!.threads[0]!,
            kind: 'child_child',
            otherRole: 'child',
            otherPersonId: secondChildId,
          },
        ],
      },
    };
    render(() => CloudMessageInbox({ controller, state: data }));
    expect(find('cloud-peer-permissions')).toBeUndefined();
    mock.slots = [];
    const renderConversation = () => CloudMessageConversation({ controller, state: data });
    render(renderConversation);
    press('cloud-message-leave');
    render(renderConversation);
    expect(controller.leavePeer).not.toHaveBeenCalled();
    press('cloud-message-confirm-leave');
    expect(controller.leavePeer).toHaveBeenCalledOnce();
  });
});
