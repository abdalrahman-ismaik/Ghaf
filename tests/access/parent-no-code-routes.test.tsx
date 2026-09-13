import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ParentSignUpScreen from '../../app/access/parent/sign-up';
import RetiredParentVerificationRoute from '../../app/access/parent/verification';
import { resources } from '../../src/i18n/resources';

interface HostProps {
  readonly children?: ReactNode;
  readonly header?: ReactNode;
  readonly testID?: string;
  readonly onPress?: () => void;
  readonly onSubmitEditing?: () => void;
}
const harness = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  effects: [] as (() => unknown)[],
  controls: [] as HostProps[],
  router: { replace: vi.fn() },
  locale: 'ar' as 'ar' | 'en',
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useEffect: (effect: () => unknown) => harness.effects.push(effect),
}));
function host(tag: string, props: HostProps) {
  harness.controls.push(props);
  return createElement(tag, { 'data-testid': props.testID }, props.header, props.children);
}
vi.mock('expo-router', () => ({
  useRouter: () => harness.router,
  useLocalSearchParams: () => ({ preview: 'offline', flow: 'create-family' }),
  Redirect: ({ href }: { href: string }) => createElement('a', { href }, href),
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  BackHandler: { addEventListener: vi.fn() },
  StyleSheet: { create: <T,>(value: T) => value },
  View: (props: HostProps) => host('div', props),
}));
vi.mock('@/components/access', () => ({
  AccessScreen: (props: HostProps) => host('main', props),
  AccessHeader: (props: HostProps) => host('header', props),
  AccessTextField: (props: HostProps) => host('div', props),
  ParentAccessPortrait: () => null,
  StatusBanner: () => null,
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
const render = (component = RetiredParentVerificationRoute) =>
  renderToStaticMarkup(createElement(component));

beforeEach(() => {
  vi.clearAllMocks();
  harness.effects = [];
  harness.controls = [];
  harness.locale = 'ar';
  harness.state = {
    locale: 'ar',
    direction: 'rtl',
    activeExperience: 'signed_out',
    parentOnboarding: { status: 'signed_out', completionReceipt: null },
    pendingFamilyCreation: null,
    localFamily: { status: 'ready', record: null },
    beginLocalFamilySetup: vi.fn(() => ({ ok: true })),
    cancelParentVerification: vi.fn(() => {
      harness.state.parentOnboarding = { status: 'signed_out', completionReceipt: null };
      return { ok: true };
    }),
  };
});

describe('Parent routes without a code step', () => {
  it.each(['ar', 'en'] as const)(
    'connects the %s setup action directly to family details',
    (locale) => {
      harness.locale = locale;
      harness.state.locale = locale;
      harness.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
      const html = render(ParentSignUpScreen);
      expect(html).toContain(resources[locale].translation.access.signUp.action);
      expect(html).not.toContain(resources[locale].translation.access.verification.title);
      harness.controls
        .find((item) => item.testID === 'start-local-family-setup-button')
        ?.onPress?.();
      expect(harness.state.beginLocalFamilySetup).toHaveBeenCalledOnce();
      expect(harness.router.replace).toHaveBeenCalledWith('/access/parent/family-basics');
    },
  );
  it('keeps the creation form open when local staging fails', () => {
    harness.state.beginLocalFamilySetup = vi.fn(() => ({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    }));
    render(ParentSignUpScreen);
    harness.controls
      .find((item) => item.testID === 'parent-sign-up-identifier-input')
      ?.onSubmitEditing?.();
    expect(harness.router.replace).not.toHaveBeenCalled();
  });
  it('ignores a create-family query on the retired route and returns to account selection', () => {
    expect(render()).toContain('href="/access/parent/sign-in"');
    expect(harness.state.beginLocalFamilySetup).not.toHaveBeenCalled();
    expect(harness.state.cancelParentVerification).not.toHaveBeenCalled();
  });
  it.each(['fresh', 'replacement', 'profile_repair'])(
    'resumes staged %s details without a code',
    (intent) => {
      harness.state.parentOnboarding = { status: 'verified', completionReceipt: null };
      harness.state.pendingFamilyCreation = intent;
      expect(render()).toContain(
        intent === 'profile_repair'
          ? '/access/parent/add-first-child'
          : '/access/parent/family-basics',
      );
      harness.effects.forEach((effect) => effect());
      expect(harness.state.cancelParentVerification).not.toHaveBeenCalled();
    },
  );
  it.each(['code_sent', 'verifying', 'verified'])(
    'cancels stale %s state before redirecting',
    (status) => {
      harness.state.parentOnboarding = { status, completionReceipt: { householdId: 'existing' } };
      expect(render()).toBe('');
      harness.effects.forEach((effect) => effect());
      expect(harness.state.cancelParentVerification).toHaveBeenCalledOnce();
      expect(render()).toContain('/access/parent/sign-in');
      expect(harness.state.beginLocalFamilySetup).not.toHaveBeenCalled();
    },
  );
  it.each(['parent', 'child'])('preserves existing %s authority on a stale URL', (role) => {
    harness.state.activeExperience = role;
    expect(render()).toContain(`href="/${role}"`);
    harness.effects.forEach((effect) => effect());
    expect(harness.state.cancelParentVerification).not.toHaveBeenCalled();
  });
});
