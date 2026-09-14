import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PilotAccountView } from '../../src/components/pilot/PilotAccountView';
import { ChildDevicePairing } from '../../src/components/pilot/ChildDevicePairing';
import { EnabledPilotGate, PilotGate } from '../../src/components/pilot/PilotGate';
import type { PilotController, PilotState } from '../../src/features/pilot/controller';
import { pilotResources } from '../../src/i18n/pilotResources';
import { resources } from '../../src/i18n/resources';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  effect?: () => void | (() => void);
  cleanup?: () => void;
}

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  state: {} as Record<string, unknown>,
  pilot: {} as PilotState,
  config: { enabled: true, valid: true },
  platform: 'android',
  appState: 'active',
  navigationKey: undefined as string | undefined,
  backListeners: new Set<() => boolean>(),
  appListeners: new Set<() => void>(),
  controller: {} as PilotController,
  service: { testService: true },
  getService: vi.fn(),
  createController: vi.fn(),
  router: { replace: vi.fn() },
  uuidSequence: 0,
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const same = (a?: readonly unknown[], b?: readonly unknown[]) =>
    Boolean(
      a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index])),
    );
  return {
    ...react,
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current))
        current.value = typeof initial === 'function' ? initial() : initial;
      return [
        current.value,
        (next: unknown) => {
          current.value = typeof next === 'function' ? next(current.value) : next;
        },
      ];
    },
    useRef: (initial: unknown) => {
      const current = slot();
      current.value ??= { current: initial };
      return current.value;
    },
    useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
    useEffect: (effect: () => void | (() => void), dependencies?: readonly unknown[]) => {
      const current = slot();
      current.effect = effect;
      if (same(current.dependencies, dependencies)) return;
      current.dependencies = dependencies;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = effect() || undefined;
      });
    },
  };
});
vi.mock('expo-router', () => ({
  useRouter: () => mock.router,
  useRootNavigationState: () => (mock.navigationKey ? { key: mock.navigationKey } : undefined),
}));
vi.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
vi.mock('expo-crypto', () => ({
  randomUUID: () => `02000000-0000-4000-8000-${String(++mock.uuidSequence).padStart(12, '0')}`,
}));
vi.mock('react-native', () => ({
  View: 'View',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (values: Record<string, unknown>) => values[mock.platform] ?? values.default,
  },
  AppState: {
    get currentState() {
      return mock.appState;
    },
    addEventListener: (_event: string, listener: () => void) => {
      mock.appListeners.add(listener);
      return { remove: () => mock.appListeners.delete(listener) };
    },
  },
  BackHandler: {
    addEventListener: (_event: string, listener: () => boolean) => {
      mock.backListeners.add(listener);
      return { remove: () => mock.backListeners.delete(listener) };
    },
  },
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('@/components/access', () => ({
  AccessHeader: 'AccessHeader',
  AccessScreen: 'AccessScreen',
  AccessTextField: 'AccessTextField',
  StatusBanner: 'StatusBanner',
  normalizeOtpDigits: (value: string) =>
    value
      .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[^0-9]/g, ''),
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: 'LanguageSwitcher' }));
vi.mock('@/features/pilot/config', () => ({ getPilotConfig: () => mock.config }));
vi.mock('@/services', () => ({
  getParentAccountService: () => mock.getService(),
  serviceRegistry: {
    familyMessaging: {
      controller: {
        clearAccountSession: async () => {},
        getSnapshot: () => ({ error: null }),
      },
    },
  },
}));
vi.mock('../../src/components/pilot/AccountWorkspaceBoundary', () => ({
  AccountWorkspaceBoundary: 'AccountWorkspaceBoundary',
}));
vi.mock('../../src/components/pilot/RealFamilySession', () => ({
  RealFamilySession: 'RealFamilySession',
}));
vi.mock('@/features/pilot/controller', () => ({
  createPilotController: (...args: unknown[]) => mock.createController(...args),
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector(mock.state),
    {
      getState: () => mock.state,
    },
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[part]
              : undefined,
          resources[mock.state.locale === 'en' ? 'en' : 'ar'].translation,
        ) ?? key,
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
let renderedBodyKey: string | null | undefined;

function find(match: (node: Node) => boolean, value: ReactNode = tree): Node | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = find(match, child ?? null);
      if (found) return found;
    }
  }
  if (!isValidElement<Record<string, unknown>>(value)) return undefined;
  if (match(value)) return value;
  return (
    find(match, (value.props.children as ReactNode) ?? null) ??
    find(match, (value.props.header as ReactNode) ?? null)
  );
}

function byId(testID: string) {
  return find((node) => node.props.testID === testID);
}

function renderView(children?: ReactNode) {
  const shell = PilotAccountView({ controller: mock.controller, state: mock.pilot, children });
  const body = find((node) => typeof node.type === 'function', shell)!;
  // Model React's keyed body replacement while the surrounding access shell keeps its identity.
  if (body.key !== renderedBodyKey) {
    for (const slot of mock.slots) slot.cleanup?.();
    mock.slots = [];
    renderedBodyKey = body.key;
  }
  mock.cursor = 0;
  mock.uuidSequence = 0;
  const rendered = (body.type as (props: Record<string, unknown>) => ReactNode)(body.props);
  tree = cloneElement(shell, {
    children: Children.map(shell.props.children, (child) => (child === body ? rendered : child)),
  });
}

function renderGate() {
  mock.cursor = 0;
  tree = EnabledPilotGate({
    children: createElement('SensitiveDemo', { testID: 'private-demo-tree' }),
  });
  for (const effect of mock.effects.splice(0)) effect();
}

function press(testID: string) {
  const node = byId(testID);
  expect(node, `Control ${testID} should exist`).toBeDefined();
  (node!.props.onPress as () => void)();
}

beforeEach(() => {
  vi.useFakeTimers();
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  renderedBodyKey = undefined;
  mock.backListeners.clear();
  mock.appListeners.clear();
  mock.platform = 'android';
  mock.appState = 'active';
  mock.navigationKey = undefined;
  mock.config = { enabled: true, valid: true };
  mock.state = { locale: 'ar', direction: 'rtl', pilotSampleActive: false };
  mock.pilot = {
    phase: 'signin',
    busy: false,
    account: null,
    email: '',
    error: null,
    notice: null,
    sampleOpen: false,
    accountPanel: false,
    sampleGeneration: 0,
    profile: null,
    profileDraft: null,
    profileDirty: false,
    profileBusy: false,
    profileError: null,
    profileNotice: null,
  };
  mock.controller = {
    pairChildAvailable: false,
    pairChildDevice: vi.fn(async () => undefined),
    getSnapshot: () => mock.pilot,
    subscribe: vi.fn(() => () => undefined),
    initialize: vi.fn(async () => undefined),
    refresh: vi.fn(async () => undefined),
    reloadProfile: vi.fn(async () => undefined),
    editProfile: vi.fn(),
    saveProfile: vi.fn(async () => undefined),
    setActive: vi.fn(),
    showForm: vi.fn(),
    signIn: vi.fn(async () => undefined),
    register: vi.fn(async () => undefined),
    verify: vi.fn(async () => undefined),
    continueVerification: vi.fn(),
    resend: vi.fn(async () => undefined),
    requestRecovery: vi.fn(async () => undefined),
    verifyRecovery: vi.fn(async () => undefined),
    updatePassword: vi.fn(async () => undefined),
    explore: vi.fn(async () => undefined),
    openAccount: vi.fn(),
    continueSample: vi.fn(),
    restartSample: vi.fn(),
    signOut: vi.fn(async () => undefined),
    dispose: vi.fn(),
  };
  mock.getService.mockReset().mockReturnValue(mock.service);
  mock.createController.mockReset().mockImplementation((service: unknown) => {
    if (!service) mock.pilot = { ...mock.pilot, phase: 'configuration' };
    return mock.controller;
  });
  mock.router.replace.mockReset();
});

afterEach(async () => {
  for (const slot of mock.slots) slot.cleanup?.();
  await Promise.resolve();
  vi.useRealTimers();
});

describe('Pilot account forms', () => {
  it('keeps the pairing request ID stable across a failed send and changes it with the token', () => {
    const renderPairing = (busy = false) => {
      mock.cursor = 0;
      tree = ChildDevicePairing({ controller: mock.controller, busy });
    };
    renderPairing();
    const token = 'abcd0123'.repeat(8);
    (byId('cloud-child-pairing-token')!.props.onChangeText as (value: string) => void)(token);
    renderPairing();
    press('cloud-child-pairing-submit');
    const first = vi.mocked(mock.controller.pairChildDevice).mock.calls[0];
    expect(first).toEqual([token, expect.any(String)]);
    mock.pilot = { ...mock.pilot, error: 'network_unavailable' };
    renderPairing();
    press('cloud-child-pairing-submit');
    expect(vi.mocked(mock.controller.pairChildDevice).mock.calls[1]).toEqual(first);
    renderPairing(true);
    expect(byId('cloud-child-pairing-token')?.props.editable).toBe(false);
    expect(byId('cloud-child-pairing-submit')?.props.busy).toBe(true);
    (byId('cloud-child-pairing-token')!.props.onChangeText as (value: string) => void)(
      'ef'.repeat(32),
    );
    renderPairing();
    press('cloud-child-pairing-submit');
    expect(vi.mocked(mock.controller.pairChildDevice).mock.calls[2]?.[1]).not.toBe(first?.[1]);
  });

  it('keeps the access shell and dark status bar stable while replacing the phase-owned body', () => {
    renderView();
    const signedOutShell = byId('pilot-signin-screen')!;
    const signedOutBodyKey = renderedBodyKey;
    expect(find((node) => node.type === 'StatusBar')?.props).toMatchObject({
      style: 'dark',
      animated: false,
    });
    mock.pilot = { ...mock.pilot, phase: 'restoring' };
    renderView();
    const restoringShell = byId('pilot-restoring-screen')!;
    expect(restoringShell.type).toBe(signedOutShell.type);
    expect(restoringShell.key).toBe(signedOutShell.key);
    expect(restoringShell.key).toBeNull();
    expect(restoringShell.props.scrollResetKey).not.toBe(signedOutShell.props.scrollResetKey);
    expect(renderedBodyKey).not.toBe(signedOutBodyKey);
    mock.pilot = {
      ...mock.pilot,
      phase: 'ready',
      account: { userId: 'adult-a', email: 'a@example.test' },
    };
    renderView();
    expect(byId('pilot-ready-screen')?.type).toBe(signedOutShell.type);
    expect(byId('pilot-ready-screen')?.key).toBeNull();
    expect(find((node) => node.type === 'StatusBar')?.props.style).toBe('dark');
  });

  it('clears password and visibility on phase changes while using the controller email', () => {
    renderView();
    (byId('pilot-email-input')!.props.onChangeText as (value: string) => void)(
      'local@example.test',
    );
    (byId('pilot-password-input')!.props.onChangeText as (value: string) => void)('private draft');
    press('pilot-toggle-password');
    renderView();
    expect(byId('pilot-password-input')?.props.secureTextEntry).toBe(false);
    mock.pilot = { ...mock.pilot, phase: 'register', email: 'controller@example.test' };
    renderView();
    expect(byId('pilot-password-input')?.props).toMatchObject({ value: '', secureTextEntry: true });
    expect(byId('pilot-email-input')?.props.value).toBe('controller@example.test');
    mock.pilot = { ...mock.pilot, phase: 'signin' };
    renderView();
    expect(byId('pilot-password-input')?.props).toMatchObject({ value: '', secureTextEntry: true });
  });

  it('preserves the current form during rerenders but clears codes when the identity changes', () => {
    mock.pilot = {
      ...mock.pilot,
      phase: 'verify',
      account: { userId: 'adult-a', email: 'a@example.test' },
    };
    renderView();
    (byId('pilot-code-input')!.props.onChangeText as (value: string) => void)('123456');
    const originalResetKey = byId('pilot-verify-screen')?.props.scrollResetKey;
    mock.pilot = { ...mock.pilot, busy: true };
    renderView();
    expect(byId('pilot-code-input')?.props.value).toBe('123456');
    expect(byId('pilot-verify-screen')?.props.scrollResetKey).toBe(originalResetKey);
    mock.pilot = {
      ...mock.pilot,
      busy: false,
      account: { userId: 'adult-b', email: 'b@example.test' },
    };
    renderView();
    expect(byId('pilot-code-input')?.props.value).toBe('');
    expect(byId('pilot-verify-screen')?.props.scrollResetKey).not.toBe(originalResetKey);
  });

  it('removes protected children on the first denied render without an exit animation', () => {
    const privateWorkspace = createElement('PrivateWorkspace', { testID: 'private-workspace' });
    mock.pilot = { ...mock.pilot, phase: 'ready' };
    renderView(privateWorkspace);
    expect(byId('private-workspace')).toBeDefined();
    for (const phase of ['restoring', 'signin', 'logout-error'] as const) {
      mock.pilot = { ...mock.pilot, phase };
      renderView(privateWorkspace);
      expect(byId('private-workspace')).toBeUndefined();
      expect(byId('pilot-cloud-profile')).toBeUndefined();
    }
  });

  it.each(['ar', 'en'])('uses bilingual labeled secure credentials in %s', (locale) => {
    mock.state.locale = locale;
    mock.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
    renderView();
    const dictionary = pilotResources[locale as 'ar' | 'en'];
    expect(byId('pilot-email-input')?.props).toMatchObject({
      label: dictionary.email,
      direction: locale === 'ar' ? 'rtl' : 'ltr',
      autoComplete: 'email',
      style: { textAlign: 'left', writingDirection: 'ltr' },
    });
    expect(byId('pilot-password-input')?.props).toMatchObject({
      label: dictionary.password,
      secureTextEntry: true,
      autoComplete: 'current-password',
    });
    expect(byId('pilot-signin-screen')?.props.keyboardAware).toBe(true);
    expect(byId('pilot-language-switcher')).toBeDefined();
  });

  it('clears the password immediately after sign-in submission', () => {
    renderView();
    (byId('pilot-email-input')!.props.onChangeText as (value: string) => void)('adult@example.com');
    (byId('pilot-password-input')!.props.onChangeText as (value: string) => void)(
      'prepared-test-password',
    );
    renderView();
    press('pilot-submit');
    expect(mock.controller.signIn).toHaveBeenCalledWith(
      'adult@example.com',
      'prepared-test-password',
    );
    renderView();
    expect(byId('pilot-password-input')?.props.value).toBe('');
  });

  it('lets users reveal a password without changing it and hides it again on submission', () => {
    renderView();
    (byId('pilot-email-input')!.props.onChangeText as (value: string) => void)(
      'adult@example.test',
    );
    (byId('pilot-password-input')!.props.onChangeText as (value: string) => void)(
      '  prepared value  ',
    );
    press('pilot-toggle-password');
    renderView();
    expect(byId('pilot-password-input')?.props).toMatchObject({
      secureTextEntry: false,
      value: '  prepared value  ',
    });
    press('pilot-submit');
    renderView();
    expect(byId('pilot-password-input')?.props).toMatchObject({ secureTextEntry: true, value: '' });
    expect(mock.controller.signIn).toHaveBeenCalledWith('adult@example.test', '  prepared value  ');
  });

  it.each(['verify', 'recovery-code'] as const)(
    'normalizes and clears the six-digit %s code',
    (phase) => {
      mock.pilot = { ...mock.pilot, phase, email: 'adult@example.com' };
      renderView();
      expect(byId('pilot-email-input')).toBeUndefined();
      expect(byId('pilot-password-input')).toBeUndefined();
      (byId('pilot-code-input')!.props.onChangeText as (value: string) => void)('١٢٣٤٥٦');
      renderView();
      press('pilot-submit');
      expect(
        phase === 'verify' ? mock.controller.verify : mock.controller.verifyRecovery,
      ).toHaveBeenCalledWith('123456');
      renderView();
      expect(byId('pilot-code-input')?.props.value).toBe('');
      expect(byId('pilot-code-input')?.props).toMatchObject({
        maxLength: 8,
        textContentType: 'oneTimeCode',
        direction: 'rtl',
        style: { textAlign: 'left', writingDirection: 'ltr' },
      });
    },
  );

  it.each([
    ['verify', '١٢٣٤٥٦٧٨'],
    ['recovery-code', '١٢٣٤٥٦٧٨'],
    ['verify', '۱۲۳۴۵۶۷۸'],
    ['recovery-code', '۱۲۳۴۵۶۷۸'],
  ] as const)('normalizes all eight digits for %s using %s', (phase, enteredCode) => {
    mock.pilot = { ...mock.pilot, phase, email: 'adult@example.com' };
    renderView();
    (byId('pilot-code-input')!.props.onChangeText as (value: string) => void)(enteredCode);
    renderView();
    expect(byId('pilot-code-input')?.props.value).toBe('12345678');
    expect(byId('pilot-submit')?.props.disabled).toBe(false);
    press('pilot-submit');
    expect(
      phase === 'verify' ? mock.controller.verify : mock.controller.verifyRecovery,
    ).toHaveBeenCalledWith('12345678');
    renderView();
    expect(byId('pilot-code-input')?.props.value).toBe('');
  });

  it.each(['verify', 'recovery-code'] as const)(
    'blocks seven-digit %s codes on button and keyboard submission',
    (phase) => {
      mock.pilot = { ...mock.pilot, phase, email: 'adult@example.com' };
      renderView();
      (byId('pilot-code-input')!.props.onChangeText as (value: string) => void)('١٢٣٤٥٦٧');
      renderView();
      expect(byId('pilot-submit')?.props.disabled).toBe(true);
      press('pilot-submit');
      (byId('pilot-code-input')!.props.onSubmitEditing as () => void)();
      expect(mock.controller.verify).not.toHaveBeenCalled();
      expect(mock.controller.verifyRecovery).not.toHaveBeenCalled();
      renderView();
      expect(byId('pilot-code-input')?.props.value).toBe('1234567');
    },
  );

  it('allows an unverified returning adult to continue verification', () => {
    mock.pilot = { ...mock.pilot, email: 'adult@example.com', error: 'email_not_verified' };
    renderView();
    press('pilot-continue-verification');
    expect(mock.controller.continueVerification).toHaveBeenCalledWith('adult@example.com');
  });

  it('keeps signout usable during pending account operations and resets secrets first', () => {
    mock.pilot = { ...mock.pilot, phase: 'new-password', busy: true };
    renderView();
    expect(byId('pilot-signout')?.props.disabled).toBeUndefined();
    press('pilot-signout');
    expect(mock.controller.signOut).toHaveBeenCalledOnce();
  });

  it.each(['ar', 'en'] as const)(
    'describes incomplete logout in %s and offers cleanup retry without private forms',
    (locale) => {
      mock.state.locale = locale;
      mock.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
      mock.pilot = { ...mock.pilot, phase: 'logout-error', error: 'network_unavailable' };
      renderView();
      expect(byId('pilot-logout-error-screen')).toBeDefined();
      expect(
        find((node) => node.props.children === pilotResources[locale].status['logout-error'].title),
      ).toBeDefined();
      expect(
        find((node) => node.props.children === pilotResources[locale].status['logout-error'].body),
      ).toBeDefined();
      expect(
        find((node) => node.props.message === pilotResources[locale].errors.network_unavailable),
      ).toBeDefined();
      expect(byId('pilot-refresh')?.props.children).toBe(pilotResources[locale].retry);
      expect(byId('pilot-submit')).toBeUndefined();
      expect(byId('pilot-password-input')).toBeUndefined();
      expect(byId('pilot-cloud-profile')).toBeUndefined();
      press('pilot-refresh');
      expect(mock.controller.refresh).toHaveBeenCalledOnce();
      press('pilot-signout');
      expect(mock.controller.signOut).toHaveBeenCalledOnce();
    },
  );

  it('provides the launcher and separate account controls with explicit simulation copy', () => {
    mock.pilot = {
      ...mock.pilot,
      phase: 'ready',
      account: { userId: 'adult-id', email: 'adult@example.com' },
    };
    renderView();
    expect(byId('pilot-explore-sample')?.props.children).toBe(pilotResources.ar.explore);
    expect(find((node) => node.props.children === pilotResources.ar.sampleLabel)).toBeDefined();
    mock.pilot = { ...mock.pilot, sampleOpen: true, accountPanel: true };
    renderView();
    expect(byId('pilot-explore-sample')).toBeUndefined();
    press('pilot-continue-sample');
    press('pilot-restart-sample');
    press('pilot-signout');
    expect(mock.controller.continueSample).toHaveBeenCalledOnce();
    expect(mock.controller.restartSample).toHaveBeenCalledOnce();
    expect(mock.controller.signOut).toHaveBeenCalledOnce();
  });

  it('wires the same pilot resource keys into both translation dictionaries', () => {
    const keys = (value: object, prefix = ''): string[] =>
      Object.entries(value).flatMap(([key, item]) =>
        typeof item === 'object' ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`],
      );
    expect(keys(pilotResources.ar)).toEqual(keys(pilotResources.en));
    expect(resources.ar.translation.pilot).toBe(pilotResources.ar);
    expect(resources.en.translation.pilot).toBe(pilotResources.en);
  });
});

describe('cloud profile account panel', () => {
  beforeEach(() => {
    mock.pilot = {
      ...mock.pilot,
      phase: 'ready',
      account: { userId: 'adult-id', email: 'adult@example.test' },
      profile: {
        userId: 'adult-id',
        displayName: 'Prepared adult',
        preferredLocale: 'ar',
        revision: 1,
        updatedAt: '2026-09-14T00:00:00.000Z',
      },
      profileDraft: {
        userId: 'adult-id',
        displayName: 'Prepared adult',
        preferredLocale: 'ar',
        expectedRevision: 1,
      },
    };
  });

  it.each(['ar', 'en'] as const)('uses existing bilingual native form controls in %s', (locale) => {
    mock.state.locale = locale;
    mock.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
    renderView();
    expect(byId('pilot-profile-name')?.props).toMatchObject({
      label: pilotResources[locale].profile.displayName,
      value: 'Prepared adult',
      direction: locale === 'ar' ? 'rtl' : 'ltr',
      autoComplete: 'name',
      textContentType: 'name',
    });
    expect(byId('pilot-profile-language-ar')?.props).toMatchObject({
      accessibilityRole: 'radio',
      accessibilityState: { checked: true },
    });
    expect(byId('pilot-profile-language-en')?.props.accessibilityState).toEqual({ checked: false });
    expect(byId('pilot-profile-save')?.props.disabled).toBe(true);
    expect(
      find((node) => node.props.children === pilotResources[locale].profile.body),
    ).toBeDefined();
    expect(
      find((node) => node.props.children === pilotResources[locale].samplePrivacy),
    ).toBeDefined();
  });

  it('edits a controller-owned draft and keeps save and explicit discard/reload separate', () => {
    renderView();
    (byId('pilot-profile-name')!.props.onChangeText as (value: string) => void)('Unsaved name');
    press('pilot-profile-language-en');
    expect(mock.controller.editProfile).toHaveBeenCalledWith({ displayName: 'Unsaved name' });
    expect(mock.controller.editProfile).toHaveBeenCalledWith({ preferredLocale: 'en' });
    mock.pilot = { ...mock.pilot, profileDirty: true };
    renderView();
    expect(byId('pilot-profile-unsaved')).toBeDefined();
    expect(byId('pilot-profile-reload')?.props.children).toBe(
      pilotResources.ar.profile.discardReload,
    );
    press('pilot-profile-save');
    expect(mock.controller.saveProfile).toHaveBeenCalledOnce();
    press('pilot-profile-reload');
    expect(mock.controller.reloadProfile).toHaveBeenCalledOnce();
  });

  it('shows a conflict and requires reload before saving again', () => {
    mock.pilot = { ...mock.pilot, profileDirty: true, profileError: 'profile_conflict' };
    renderView();
    expect(byId('pilot-profile-save')?.props.disabled).toBe(true);
    expect(
      find((node) => node.props.message === pilotResources.ar.errors.profile_conflict),
    ).toBeDefined();
    expect(byId('pilot-profile-reload')?.props.disabled).toBe(false);
    expect(find((node) => node.props.message === pilotResources.ar.profile.saved)).toBeUndefined();
  });

  it('disables edits during a pending write while signout stays available', () => {
    mock.pilot = { ...mock.pilot, busy: true, profileBusy: true, profileDirty: true };
    renderView();
    expect(byId('pilot-profile-name')?.props.editable).toBe(false);
    expect(byId('pilot-profile-language-en')?.props.disabled).toBe(true);
    expect(byId('pilot-profile-save')?.props.busy).toBe(true);
    expect(byId('pilot-profile-reload')?.props.disabled).toBe(true);
    expect(byId('pilot-signout')?.props.disabled).toBeUndefined();
    expect(find((node) => node.props.message === pilotResources.ar.profile.saved)).toBeUndefined();
  });

  it('shows loading then a truthful retry state without fake profile fields', () => {
    mock.pilot = {
      ...mock.pilot,
      profile: null,
      profileDraft: null,
      busy: true,
      profileBusy: true,
    };
    renderView();
    expect(byId('pilot-profile-loading')).toBeDefined();
    expect(byId('pilot-profile-name')).toBeUndefined();
    mock.pilot = {
      ...mock.pilot,
      busy: false,
      profileBusy: false,
      profileError: 'profile_unavailable',
    };
    renderView();
    expect(byId('pilot-profile-loading')).toBeUndefined();
    expect(byId('pilot-profile-name')).toBeUndefined();
    expect(byId('pilot-profile-reload')?.props.disabled).toBe(false);
    expect(
      find((node) => node.props.message === pilotResources.ar.errors.profile_unavailable),
    ).toBeDefined();
  });

  it('withholds a stale profile for another identity and every signed-out view', () => {
    mock.pilot = {
      ...mock.pilot,
      account: { userId: 'different-adult', email: 'other@example.test' },
    };
    renderView();
    expect(byId('pilot-profile-name')).toBeUndefined();
    mock.pilot = { ...mock.pilot, phase: 'signin' };
    renderView();
    expect(byId('pilot-cloud-profile')).toBeUndefined();
  });
});

describe('Pilot navigator boundary', () => {
  it('keeps the same outer view across auth phases and retains the workspace identity boundary', () => {
    renderGate();
    const signin = find((node) => node.type === PilotAccountView)!;
    mock.pilot = {
      ...mock.pilot,
      phase: 'ready',
      account: { userId: 'adult-a', email: 'a@example.test' },
    };
    renderGate();
    const ready = find((node) => node.type === PilotAccountView)!;
    expect(ready.type).toBe(signin.type);
    expect(ready.key).toBe(signin.key);
    expect(ready.key).toBeNull();
    expect(find((node) => node.type === 'AccountWorkspaceBoundary')?.key).toBe('adult-a');
    mock.pilot = { ...mock.pilot, phase: 'signin', account: null };
    renderGate();
    expect(find((node) => node.type === 'AccountWorkspaceBoundary')).toBeUndefined();
    expect(find((node) => node.type === PilotAccountView)?.key).toBeNull();
  });

  it('returns the default demo without constructing an account service', () => {
    mock.config.enabled = false;
    const child = createElement('SensitiveDemo');
    expect(PilotGate({ children: child })).toBe(child);
    expect(mock.getService).not.toHaveBeenCalled();
  });

  it('renders configuration failure without a service or any protected child tree', () => {
    mock.config.valid = false;
    renderGate();
    expect(mock.getService).not.toHaveBeenCalled();
    expect(byId('private-demo-tree')).toBeUndefined();
    expect(find((node) => node.type === PilotAccountView)?.props.state).toMatchObject({
      phase: 'configuration',
    });
  });

  it.each([
    'restoring',
    'signin',
    'register',
    'verify',
    'forgot',
    'recovery-code',
    'new-password',
    'pending',
    'suspended',
    'error',
    'logout-error',
  ] as const)(
    'does not mount sample content in phase %s, including stale sample state',
    (phase) => {
      mock.pilot = { ...mock.pilot, phase, sampleOpen: true };
      renderGate();
      expect(byId('private-demo-tree')).toBeUndefined();
    },
  );

  it('mounts the sample only after approval, with persistent account access', () => {
    mock.pilot = { ...mock.pilot, phase: 'ready', sampleOpen: true, sampleGeneration: 1 };
    mock.state.pilotSampleActive = true;
    renderGate();
    expect(byId('private-demo-tree')).toBeDefined();
    press('pilot-open-account');
    expect(mock.controller.openAccount).toHaveBeenCalledOnce();
    mock.pilot = { ...mock.pilot, accountPanel: true };
    renderGate();
    expect(byId('private-demo-tree')).toBeUndefined();
  });

  it('waits for the navigator and navigates only once for each new sample, preserving Continue', () => {
    mock.pilot = { ...mock.pilot, phase: 'ready', sampleOpen: true, sampleGeneration: 1 };
    mock.state.pilotSampleActive = true;
    renderGate();
    expect(mock.router.replace).not.toHaveBeenCalled();
    mock.navigationKey = 'root';
    renderGate();
    expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith('/parent');
    mock.pilot = { ...mock.pilot, accountPanel: true };
    renderGate();
    mock.pilot = { ...mock.pilot, accountPanel: false };
    renderGate();
    expect(mock.router.replace).toHaveBeenCalledTimes(1);
    mock.pilot = { ...mock.pilot, sampleGeneration: 2 };
    renderGate();
    expect(mock.router.replace).toHaveBeenCalledTimes(2);
  });

  it('intercepts Android Back while denied and lets the current sample navigator handle it', () => {
    renderGate();
    const back = [...mock.backListeners][0]!;
    expect(back()).toBe(true);
    mock.pilot = { ...mock.pilot, phase: 'ready', sampleOpen: true, accountPanel: true };
    expect(back()).toBe(true);
    expect(mock.controller.continueSample).toHaveBeenCalledOnce();
    mock.pilot = { ...mock.pilot, accountPanel: false };
    expect(back()).toBe(false);
  });

  it('reacts to ordinary sample Reset but preserves synthetic role signout', () => {
    mock.pilot = { ...mock.pilot, phase: 'ready', sampleOpen: true };
    mock.state.pilotSampleActive = true;
    renderGate();
    expect(mock.controller.restartSample).not.toHaveBeenCalled();
    mock.state.pilotSampleActive = false;
    renderGate();
    expect(byId('private-demo-tree')).toBeUndefined();
    expect(mock.controller.restartSample).toHaveBeenCalledOnce();
  });

  it('closes a reset sample immediately even while the approval check is busy', () => {
    mock.pilot = { ...mock.pilot, phase: 'ready', sampleOpen: true, busy: true };
    mock.state.pilotSampleActive = false;
    renderGate();
    expect(byId('private-demo-tree')).toBeUndefined();
    expect(mock.controller.restartSample).not.toHaveBeenCalled();
    mock.pilot = { ...mock.pilot, busy: false };
    renderGate();
    expect(mock.controller.restartSample).toHaveBeenCalledOnce();
  });

  it('rechecks each active minute and reports foreground changes', () => {
    renderGate();
    expect(mock.controller.setActive).toHaveBeenLastCalledWith(true);
    vi.advanceTimersByTime(60_000);
    expect(mock.controller.refresh).toHaveBeenCalledOnce();
    mock.appState = 'background';
    [...mock.appListeners][0]!();
    expect(mock.controller.setActive).toHaveBeenLastCalledWith(false);
    vi.advanceTimersByTime(60_000);
    expect(mock.controller.refresh).toHaveBeenCalledOnce();
    mock.appState = 'active';
    [...mock.appListeners][0]!();
    expect(mock.controller.setActive).toHaveBeenLastCalledWith(true);
  });

  it('keeps controller alive through StrictMode effect replay and disposes after actual unmount', async () => {
    renderGate();
    const mountedEffects = mock.slots.filter((slot) => slot.effect);
    for (const slot of mountedEffects) slot.cleanup?.();
    for (const slot of mountedEffects) slot.cleanup = slot.effect!() || undefined;
    await Promise.resolve();
    expect(mock.controller.dispose).not.toHaveBeenCalled();
    for (const slot of mountedEffects) {
      slot.cleanup?.();
      slot.cleanup = undefined;
    }
    await Promise.resolve();
    expect(mock.controller.dispose).toHaveBeenCalledOnce();
    expect(mock.backListeners.size).toBe(0);
    expect(mock.appListeners.size).toBe(0);
  });
});
