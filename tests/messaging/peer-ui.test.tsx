import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { createInstance } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessagingPeerPermissions } from '../../src/components/familyMessaging/MessagingPeerPermissions';
import { MessagingConversation } from '../../src/components/familyMessaging/MessagingConversation';
import {
  FamilyMessagingController,
  type MessagingState,
} from '../../src/features/familyMessaging/controller';
import { resources } from '../../src/i18n/resources';
import { peerMessagingAr, peerMessagingEn } from '../../src/i18n/peerMessagingResources';
import { child, fakeService, ids, parent, thread } from './fixtures';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};
const mock = vi.hoisted(() => ({
  values: [] as unknown[],
  cursor: 0,
  locale: 'en' as 'ar' | 'en',
  actions: new Map<string, () => void>(),
  translate: (key: string, _values?: Record<string, unknown>) => key,
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => {
    const index = mock.cursor++;
    if (index >= mock.values.length)
      mock.values[index] = typeof initial === 'function' ? initial() : initial;
    return [
      mock.values[index],
      (next: unknown) => {
        mock.values[index] = typeof next === 'function' ? next(mock.values[index]) : next;
      },
    ];
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mock.translate }) }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: { locale: string; direction: string }) => unknown) =>
    selector({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  const container = ({ children, testID }: { children?: ReactNode; testID?: string }) =>
    createElement('div', { 'data-testid': testID }, children);
  return { View: container, ScrollView: container };
});
vi.mock('@/components/primitives', () => ({ Input: () => null }));
vi.mock('../../src/components/familyMessaging/shared', async () => {
  const { createElement } = await import('react');
  return {
    styles: {},
    MessageText: ({ children }: { children?: ReactNode }) => createElement('span', null, children),
    MessageButton: ({
      children,
      onPress,
      disabled,
      busy,
    }: {
      children?: ReactNode;
      onPress: () => void;
      disabled?: boolean;
      busy?: boolean;
    }) => {
      if (!disabled && !busy) mock.actions.set(String(children), onPress);
      return createElement('button', { disabled: disabled || busy }, children);
    },
  };
});

beforeEach(() => {
  mock.values = [];
  mock.cursor = 0;
  mock.actions.clear();
});
async function locale(language: 'ar' | 'en') {
  mock.locale = language;
  const i18n = createInstance();
  await i18n.init({
    lng: language,
    fallbackLng: language,
    resources: {
      ar: { translation: { ...resources.ar.translation, peerMessaging: peerMessagingAr } },
      en: { translation: { ...resources.en.translation, peerMessaging: peerMessagingEn } },
    },
    interpolation: { escapeValue: false },
  });
  mock.translate = (key, values) => i18n.t(key, values);
}
function render(node: ReactNode) {
  mock.cursor = 0;
  mock.actions.clear();
  return renderToStaticMarkup(node);
}
const peer = { ...thread, kind: 'child_child' as const };
const pair = {
  firstChildId: child.personId,
  secondChildId: '30000000-0000-4000-8000-000000000002',
  firstName: 'Synthetic First',
  secondName: 'Synthetic Second',
  threadId: null,
  enabled: false,
  available: true,
};

describe('bilingual peer conversation controls', () => {
  for (const language of ['ar', 'en'] as const) {
    it(`${language}: explains participant privacy and requires explicit Parent confirmation`, async () => {
      await locale(language);
      const labels = language === 'ar' ? peerMessagingAr : peerMessagingEn;
      const controller = new FamilyMessagingController(fakeService(parent), async () => ids.key);
      const permission = vi.spyOn(controller, 'setPeerPermission').mockResolvedValue();
      const state: MessagingState = {
        ...controller.getSnapshot(),
        phase: 'ready',
        context: parent,
        peerPermissions: [pair],
      };
      const node = createElement(MessagingPeerPermissions, { controller, state });
      expect(render(node)).toContain(labels.boundary);
      expect(mock.actions.has(labels.confirmEnable)).toBe(false);
      mock.actions.get(labels.enable)!();
      expect(permission).not.toHaveBeenCalled();
      expect(render(node)).toContain(labels.enableBody);
      mock.actions.get(labels.confirmEnable)!();
      expect(permission).toHaveBeenCalledWith(pair.firstChildId, pair.secondChildId, true);
    });

    it(`${language}: lets Child cancel or confirm stopping their peer conversation`, async () => {
      await locale(language);
      const labels = language === 'ar' ? peerMessagingAr : peerMessagingEn;
      const controller = new FamilyMessagingController(fakeService(child), async () => ids.key);
      const leave = vi.spyOn(controller, 'leavePeerThread').mockResolvedValue();
      const state: MessagingState = {
        ...controller.getSnapshot(),
        phase: 'ready',
        context: child,
        threads: [peer],
        threadId: peer.id,
      };
      const node = createElement(MessagingConversation, { controller, state });
      expect(render(node)).toContain(labels.childBoundary);
      mock.actions.get(labels.leave)!();
      expect(render(node)).toContain(labels.leaveBody);
      mock.actions.get(mock.translate('messaging.cancel'))!();
      render(node);
      expect(mock.actions.has(labels.confirmLeave)).toBe(false);
      expect(leave).not.toHaveBeenCalled();
      mock.actions.get(labels.leave)!();
      render(node);
      mock.actions.get(labels.confirmLeave)!();
      expect(leave).toHaveBeenCalledOnce();
    });
  }

  it('does not offer enable for a pair without enrolled devices', async () => {
    await locale('en');
    const controller = new FamilyMessagingController(fakeService(parent), async () => ids.key);
    const state: MessagingState = {
      ...controller.getSnapshot(),
      phase: 'ready',
      context: parent,
      peerPermissions: [{ ...pair, available: false }],
    };
    expect(render(createElement(MessagingPeerPermissions, { controller, state }))).toContain(
      peerMessagingEn.enrollFirst,
    );
    expect(mock.actions.has(peerMessagingEn.enable)).toBe(false);
  });
});
