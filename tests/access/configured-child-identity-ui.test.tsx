import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { createInstance } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { resources } from '../../src/i18n/resources';
import { createInitialPrototypeSession } from '../../src/services/mock/fixtures';
import type { LocaleCode, SyntheticChildId } from '../../src/models/familyGrowth';
import ChildCredentialScreen from '../../app/access/child/pin';
import PairChildDeviceScreen from '../../app/access/child/pair';
import ParentDevicesScreen from '../../app/parent/settings/devices';
import ParentPermissionsScreen from '../../app/parent/settings/permissions';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

const mock = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  translate: (key: string, _values?: Record<string, unknown>) => key,
}));

vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mock.state),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mock.translate }),
}));

vi.mock('@/i18n', () => ({
  localize: (text: Record<string, string>, locale: string) => text[locale],
}));

vi.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    Platform: { select: (options: Record<string, unknown>) => options.default },
    StyleSheet: { create: (styles: unknown) => styles },
    View: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
    Pressable: ({ children }: { children?: ReactNode }) => createElement('button', null, children),
  };
});

vi.mock('@/components/primitives', async () => {
  const { createElement } = await import('react');
  const content = ({ children }: { children?: ReactNode }) => createElement('span', null, children);
  return { Text: content, PrimaryButton: content, SecondaryButton: content, QuietButton: content };
});

vi.mock('@/components/access', async () => {
  const { createElement } = await import('react');
  return {
    AccessHeader: () => null,
    AccessScreen: ({ children }: { children?: ReactNode }) =>
      createElement('section', null, children),
    BotanicalAvatar: ({ id }: { id: string }) => createElement('span', { 'data-avatar': id }),
    GhafIcon: () => null,
  };
});

vi.mock('@/components/r002a', async () => {
  const { createElement } = await import('react');
  return {
    R002aFlowHeader: ({ title }: { title: string }) => createElement('h1', null, title),
    R002aScreen: ({ children, header }: { children?: ReactNode; header?: ReactNode }) =>
      createElement('section', null, header, children),
  };
});

vi.mock('@/components/r003', async () => {
  const { createElement } = await import('react');
  const content = ({
    children,
    title,
    body,
    message,
    meta,
  }: {
    children?: ReactNode;
    title?: string;
    body?: string;
    message?: string;
    meta?: string;
  }) => createElement('div', null, title, body, message, meta, children);
  return { R003ActionRow: content, R003Hero: content, R003Section: content, R003Status: content };
});

const configured = [
  { id: 'child_salem', nickname: 'Palm Child One', avatarId: 'water_drop' },
  { id: 'child_alya', nickname: 'Palm Child Two', avatarId: 'energy_leaf' },
] as const;

function preparePresentation(
  locale: LocaleCode,
  childId: SyntheticChildId,
  configuredProfile = true,
) {
  const translator = createInstance();
  void translator.init({ resources, lng: locale, initAsync: false });
  mock.translate = (key, values) => translator.t(key, values);
  mock.state = {
    ...createInitialPrototypeSession(),
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    activeExperience: 'signed_out',
    activeChildId: childId,
    localFamily: {
      status: 'ready',
      record: configuredProfile ? { children: configured } : null,
    },
    childAccess: {
      selectedChildId: childId,
      credentialKind: childId === 'child_salem' ? 'pin' : 'picture_sequence',
      status: 'pairing_pending',
      pairingRequest: { childId },
      pairedDevices: [{ childId, deviceId: `prepared-${childId}`, status: 'paired' }],
    },
    liveChildAiGrants: {
      child_salem: { text: { status: 'denied' }, voice: { status: 'denied' } },
      child_alya: { text: { status: 'denied' }, voice: { status: 'denied' } },
    },
    getChildPermissionGrant: () => ({ ok: false }),
  };
}

const screens = [
  { name: 'Child credential', component: ChildCredentialScreen, avatar: true },
  { name: 'Child pairing', component: PairChildDeviceScreen, avatar: true },
  { name: 'Parent devices', component: ParentDevicesScreen, avatar: false },
  { name: 'Parent permissions', component: ParentPermissionsScreen, avatar: false },
] as const;

describe.each(['ar', 'en'] as const)('configured Child identity in %s', (locale) => {
  describe.each(configured)('$id', (profile) => {
    it.each(screens)('renders the configured identity on $name', ({ component, avatar }) => {
      preparePresentation(locale, profile.id);
      const markup = renderToStaticMarkup(createElement(component));

      expect(markup).toContain(profile.nickname);
      expect(markup).not.toContain(
        createInitialPrototypeSession().children[profile.id].displayName[locale],
      );
      if (avatar) expect(markup).toContain(`data-avatar="${profile.avatarId}"`);
    });
  });
});

describe('configured identity fallback and profile separation', () => {
  it.each(screens)('preserves the fixture fallback on $name', ({ component, avatar }) => {
    preparePresentation('en', 'child_salem', false);
    const markup = renderToStaticMarkup(createElement(component));

    expect(markup).toContain(createInitialPrototypeSession().children.child_salem.displayName.en);
    if (avatar) expect(markup).toContain('data-avatar="ghaf_tree"');
  });

  it('uses each paired profile nickname independently of the pending approval profile', () => {
    preparePresentation('en', 'child_alya');
    const childAccess = mock.state.childAccess as Record<string, unknown>;
    childAccess.status = 'pairing_approved';
    childAccess.pairedDevices = configured.map((profile) => ({
      childId: profile.id,
      deviceId: `prepared-${profile.id}`,
      status: 'paired',
    }));
    const markup = renderToStaticMarkup(createElement(ParentDevicesScreen));

    expect(markup).toContain(
      mock.translate('r003.devices.approvedFor', { name: configured[1].nickname }),
    );
    for (const profile of configured) {
      expect(markup).toContain(
        mock.translate('r003.devices.pairedFor', { name: profile.nickname }),
      );
      expect(markup).toContain(mock.translate('r003.devices.revoke', { name: profile.nickname }));
    }
  });
});
