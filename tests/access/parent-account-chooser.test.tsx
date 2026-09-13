import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ParentSignInScreen from '../../app/access/parent/sign-in';
import { resources } from '../../src/i18n/resources';

interface HostProps {
  readonly children?: ReactNode;
  readonly header?: ReactNode;
  readonly testID?: string;
  readonly message?: string;
  readonly accessibilityLabel?: string;
  readonly disabled?: boolean;
  readonly onPress?: () => void;
  readonly onBack?: () => void;
}

const harness = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  controls: [] as HostProps[],
  router: { push: vi.fn(), replace: vi.fn() },
  locale: 'ar' as 'ar' | 'en',
}));
function host(tag: string, props: HostProps) {
  if (props.onPress || props.onBack) harness.controls.push(props);
  return createElement(
    tag,
    {
      'data-testid': props.testID,
      'aria-label': props.accessibilityLabel,
      disabled: props.disabled,
    },
    props.header,
    props.children,
    props.message,
  );
}
vi.mock('expo-router', () => ({
  useRouter: () => harness.router,
  useLocalSearchParams: () => ({ preview: 'offline' }),
  Redirect: () => null,
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  BackHandler: { addEventListener: vi.fn() },
  StyleSheet: { create: <T,>(value: T) => value },
  View: (props: HostProps) => host('div', props),
  ActivityIndicator: () => null,
}));
vi.mock('@/components/access', () => ({
  AccessScreen: (props: HostProps) => host('main', props),
  AccessHeader: (props: HostProps) => host('header', props),
  ParentAccessPortrait: () => null,
  StatusBanner: (props: HostProps) => host('p', props),
}));
vi.mock('@/components/access/BotanicalAvatar', () => ({ BotanicalAvatar: () => null }));
vi.mock('@/components/access/GhafIcon', () => ({ GhafIcon: () => null }));
vi.mock('@/components/botanical', () => ({
  BotanicalPressable: (props: HostProps) => host('button', props),
}));
vi.mock('@/components/primitives', () => ({
  Button: (props: HostProps) => host('button', props),
  Text: (props: HostProps) => host('span', props),
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(harness.state),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      let value: unknown = resources[harness.locale].translation;
      for (const part of key.split('.')) value = (value as Record<string, unknown>)[part];
      return typeof value === 'string' ? value : key;
    },
  }),
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server.node') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};
const render = () => renderToStaticMarkup(createElement(ParentSignInScreen));
const control = (testID: string) => {
  const value = harness.controls.find((item) => item.testID === testID);
  if (!value) throw new Error(`Missing ${testID}`);
  return value;
};

beforeEach(() => {
  vi.clearAllMocks();
  harness.controls = [];
  harness.locale = 'ar';
  harness.state = {
    locale: 'ar',
    direction: 'rtl',
    parentOnboarding: { status: 'signed_out', completionReceipt: null },
    activeExperience: 'signed_out',
    localFamilyProfileRepair: null,
    temporaryParentAccess: null,
    localFamily: { status: 'ready', record: null },
    enterLocalParentAccount: vi.fn(() => ({ ok: true, data: { destination: '/parent' } })),
    requestExistingParentVerification: vi.fn(),
    cancelTemporaryParentAccess: vi.fn(() => ({ ok: true })),
  };
});

describe('Parent account chooser rendered controls', () => {
  it.each(['ar', 'en'] as const)(
    'opens the prepared account without credential controls in %s',
    (locale) => {
      harness.locale = locale;
      harness.state.locale = locale;
      harness.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
      const html = render();
      expect(html).toContain(resources[locale].translation.access.signIn.demoFamily);
      expect(html).toContain(resources[locale].translation.access.signIn.createFamily);
      expect(html).not.toMatch(/<input|parent-identifier-input|request-parent-code-button/u);
      control('local-parent-account-button').onPress?.();
      expect(harness.state.enterLocalParentAccount).toHaveBeenCalledOnce();
      expect(harness.state.requestExistingParentVerification).not.toHaveBeenCalled();
      expect(harness.router.replace).toHaveBeenCalledWith('/parent');
    },
  );
  it('shows the actual saved family and keeps Create family as a separate action', () => {
    harness.state.localFamily = { status: 'ready', record: { familyName: 'عائلة Test' } };
    expect(render()).toContain('عائلة Test');
    control('create-family-button').onPress?.();
    expect(harness.router.push).toHaveBeenCalledWith('/access/parent/sign-up?preview=offline');
    expect(harness.state.enterLocalParentAccount).not.toHaveBeenCalled();
  });
  it('does not navigate on failed local authority', () => {
    harness.state.enterLocalParentAccount = vi.fn(() => ({ ok: false }));
    render();
    control('local-parent-account-button').onPress?.();
    expect(harness.router.replace).not.toHaveBeenCalled();
  });
  it('disables account selection when local data is unavailable', () => {
    harness.state.localFamily = { status: 'unavailable', record: null };
    render();
    expect(control('local-parent-account-button').disabled).toBe(true);
  });
  it('cancels temporary Parent access and returns to Child without opening Parent', () => {
    harness.state.temporaryParentAccess = { childId: 'child_salem' };
    render();
    harness.controls.find((item) => item.onBack)?.onBack?.();
    expect(harness.state.cancelTemporaryParentAccess).toHaveBeenCalledOnce();
    expect(harness.router.replace).toHaveBeenCalledWith('/child');
    expect(harness.state.enterLocalParentAccount).not.toHaveBeenCalled();
  });
});
