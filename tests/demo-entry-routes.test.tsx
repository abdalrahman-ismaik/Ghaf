import { createRequire } from 'node:module';

import { createElement, type ComponentType, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DemoEntryScreenProps } from '@/components/demo/types';
import type { DemoPrincipal } from '@/models/demoEntry';
import type { ServiceResult } from '@/services/interfaces';
import type { EntryResetNavigation, EntryResetState } from '@/utils/navigation';

interface HostProps {
  readonly children?: ReactNode;
  readonly header?: ReactNode;
  readonly testID?: string;
  readonly title?: string;
  readonly message?: string;
  readonly onPress?: () => void;
}

const rendered = vi.hoisted(() => ({
  controls: [] as HostProps[],
  redirects: [] as string[],
  slots: 0,
  stacks: 0,
  demo: null as DemoEntryScreenProps | null,
  legacyOnboarding: vi.fn(),
  translate: (key: string, _values?: Record<string, unknown>): string => key,
  router: { replace: vi.fn(), push: vi.fn() },
  navigation: {
    getRootState: vi.fn<EntryResetNavigation['getRootState']>(),
    resetRoot: vi.fn<EntryResetNavigation['resetRoot']>(),
  },
}));

function host(tag: 'main' | 'div' | 'span' | 'button', props: HostProps) {
  if (props.onPress) rendered.controls.push(props);
  return createElement(
    tag,
    { 'data-testid': props.testID },
    props.header,
    props.children ?? props.title ?? props.message,
  );
}

vi.mock('expo-router', () => {
  const Stack = Object.assign(
    ({ children }: HostProps) => {
      rendered.stacks += 1;
      return createElement('div', null, children);
    },
    { Screen: () => null },
  );
  return {
    Redirect: ({ href }: { href: string }) => {
      rendered.redirects.push(href);
      return null;
    },
    Slot: () => {
      rendered.slots += 1;
      return null;
    },
    Stack,
    useRouter: () => rendered.router,
    useNavigationContainerRef: () => rendered.navigation,
  };
});
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  View: (props: HostProps) => host('div', props),
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => true }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'prepared-demo-route-test' }));
vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => undefined },
  useTranslation: () => ({ t: rendered.translate }),
}));
vi.mock('@/components/access', () => ({
  AccessScreen: (props: HostProps) => host('main', props),
  PrototypePill: () => null,
  BotanicalAvatar: () => null,
}));
vi.mock('@/components/brand/GhafRasterLogo', () => ({ GhafRasterLogo: () => null }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: () => null }));
vi.mock('@/components/primitives', () => ({
  Button: (props: HostProps) => host('button', props),
  PrimaryButton: (props: HostProps) => host('button', props),
  QuietButton: (props: HostProps) => host('button', props),
  Text: (props: HostProps) => host('span', props),
}));
vi.mock('@/components/onboarding', () => ({
  FirstRunOnboarding: () => {
    rendered.legacyOnboarding();
    return createElement('main', { 'data-testid': 'legacy-first-run' });
  },
  useFirstRunExperience: () => ({ state: { completed: false, step: 'intro' } }),
}));
vi.mock('@/components/demo/DemoEntryScreen', () => ({
  DemoEntryScreen: (props: DemoEntryScreenProps) => {
    rendered.demo = props;
    return createElement(
      'main',
      { 'data-testid': 'demo-entry-route' },
      props.restartRequired ? props.copy.restartRequiredBody : props.copy.body,
    );
  },
}));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => null }));
vi.mock('@/components/settings/AmbientSoundSetting', () => ({ AmbientSoundSetting: () => null }));
vi.mock('@/components/r002a', () => ({
  R002aScreen: (props: HostProps) => host('main', props),
  R002aFlowHeader: (props: HostProps) => host('div', props),
}));
vi.mock('@/components/r003', () => ({
  R003Hero: (props: HostProps) => host('div', props),
  R003Section: (props: HostProps) => host('div', props),
  R003Status: (props: HostProps) => host('span', props),
  R003ActionRow: (props: HostProps) => host('button', props),
}));
// Real React rendering and captured route callbacks exercise current store commands.
// Server rendering does not establish mounted effects, native audio, Back, or layout evidence.
const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

const principals = ['parent_al_noor', 'child_salem', 'child_alya'] as const;

function failure(): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message: 'Prepared route failure',
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function ok(result: { readonly ok: boolean }) {
  expect(result.ok).toBe(true);
}

async function freshRun(mode: 'demo' | 'ordinary' = 'demo') {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', mode === 'demo' ? 'true' : undefined);
  vi.resetModules();
  vi.doMock('@/state/usePrototypeStore', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/state/usePrototypeStore')>();
    return {
      ...original,
      usePrototypeStore: Object.assign(
        (selector: (state: ReturnType<typeof original.usePrototypeStore.getState>) => unknown) =>
          selector(original.usePrototypeStore.getState()),
        original.usePrototypeStore,
      ),
    };
  });
  const store = await import('@/state/usePrototypeStore');
  const { serviceRegistry } = await import('@/services');
  const { i18n, resources } = await import('@/i18n');
  const state = store.usePrototypeStore.getState;
  rendered.translate = (key, values) => i18n.t(key, { ...values, lng: state().locale });
  const [welcome, access, parent, child, parentSettings, childSettings] = await Promise.all([
    import('../app/index'),
    import('../app/access/_layout'),
    import('../app/parent/_layout'),
    import('../app/child/_layout'),
    import('../app/parent/settings/index'),
    import('../app/child/settings'),
  ]);
  const enter = (principal: DemoPrincipal) =>
    state().enterDemoExperience({
      principal,
      expectedGeneration: state().demoRunGeneration,
      expectedEpoch: state().demoEntryEpoch,
    });
  return {
    ...store,
    state,
    enter,
    serviceRegistry,
    resources,
    Welcome: welcome.default,
    Access: access.default,
    Parent: parent.default,
    Child: child.default,
    ParentSettings: parentSettings.default,
    ChildSettings: childSettings.default,
  };
}

function render(component: ComponentType) {
  rendered.controls.length = 0;
  rendered.redirects.length = 0;
  rendered.demo = null;
  rendered.slots = 0;
  rendered.stacks = 0;
  return renderToStaticMarkup(createElement(component));
}

function demoProps() {
  expect(rendered.demo).not.toBeNull();
  return rendered.demo!;
}

function press(testID: string) {
  const matches = rendered.controls.filter((control) => control.testID === testID);
  expect(matches).toHaveLength(1);
  expect(matches[0]!.onPress).toEqual(expect.any(Function));
  matches[0]!.onPress!();
}

function expectNoAuthority(run: Awaited<ReturnType<typeof freshRun>>) {
  expect(run.state().activeExperience).toBe('signed_out');
  expect(run.state().authorizeParentExperience().ok).toBe(false);
  expect(run.state().authorizeChildExperience().ok).toBe(false);
}

function resourceLeaves(value: unknown, path = ''): Record<string, string> {
  if (typeof value === 'string') return { [path]: value };
  if (value === null || typeof value !== 'object') throw new Error('Expected localized text');
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) =>
      Object.entries(resourceLeaves(child, path ? `${path}.${key}` : key)),
    ),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  rendered.navigation.getRootState.mockReturnValue({
    index: 0,
    routes: [
      { name: 'app-shell', state: { type: 'stack', routeNames: ['index', 'parent', 'child'] } },
    ],
  });
  rendered.navigation.resetRoot.mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.doUnmock('@/state/usePrototypeStore');
  vi.resetModules();
});

describe('demo welcome route and real controller handoff', () => {
  it.each(principals)('routes %s only after its controller gains authority', async (principal) => {
    const run = await freshRun();
    render(run.Welcome);
    const props = demoProps();
    expectNoAuthority(run);
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expect(rendered.legacyOnboarding).not.toHaveBeenCalled();

    props.onChooseProfile(principal);

    const destination = principal === 'parent_al_noor' ? '/parent' : '/child';
    expect(rendered.router.replace).toHaveBeenCalledExactlyOnceWith(destination);
    expect(run.state().authorizeParentExperience().ok).toBe(principal === 'parent_al_noor');
    expect(run.state().authorizeChildExperience().ok).toBe(principal !== 'parent_al_noor');
    if (principal !== 'parent_al_noor') expect(run.state().activeChildId).toBe(principal);
    expect(run.state().temporaryParentAccess).toBeNull();
    render(run.Welcome);
    expect(rendered.redirects).toEqual([destination]);
    expect(rendered.demo).toBeNull();
  });

  it.each(principals)(
    'does not navigate on rejected %s authority and permits retry',
    async (principal) => {
      const run = await freshRun();
      const authorization = vi
        .spyOn(run.serviceRegistry.access, 'authorizeCapability')
        .mockReturnValueOnce(failure());
      render(run.Welcome);

      demoProps().onChooseProfile(principal);

      expect(rendered.router.replace).not.toHaveBeenCalled();
      expect(rendered.router.push).not.toHaveBeenCalled();
      expectNoAuthority(run);
      authorization.mockRestore();
      render(run.Welcome);
      demoProps().onChooseProfile(principal);
      expect(rendered.router.replace).toHaveBeenCalledExactlyOnceWith(
        principal === 'parent_al_noor' ? '/parent' : '/child',
      );
    },
  );

  it('rejects a captured old selector after a completed entry and sign-out', async () => {
    const run = await freshRun();
    render(run.Welcome);
    const oldChoose = demoProps().onChooseProfile;
    oldChoose('parent_al_noor');
    ok(run.state().signOutExperience());
    rendered.router.replace.mockClear();

    oldChoose('child_alya');

    expectNoAuthority(run);
    expect(rendered.router.replace).not.toHaveBeenCalled();
    render(run.Welcome);
    demoProps().onChooseProfile('child_alya');
    ok(run.state().authorizeChildExperience());
    expect(rendered.router.replace).toHaveBeenCalledExactlyOnceWith('/child');
  });

  it('passes fresh narration scope after handoff and reset without granting authority', async () => {
    const run = await freshRun();
    render(run.Welcome);
    const original = demoProps();
    original.onChooseProfile('parent_al_noor');
    ok(run.state().signOutExperience());
    render(run.Welcome);
    const returned = demoProps();
    expect(returned.entryEpoch).toBeGreaterThan(original.entryEpoch);
    expect(returned.runGeneration).toBe(original.runGeneration);
    expectNoAuthority(run);

    returned.onChooseProfile('parent_al_noor');
    ok(run.state().resetPrototype());
    render(run.Welcome);
    const reset = demoProps();
    expect(reset.runGeneration).toBeGreaterThan(returned.runGeneration);
    expect(reset.entryEpoch).toBeGreaterThan(returned.entryEpoch);
    expect(reset.runGeneration).toBe(run.state().demoRunGeneration);
    expect(reset.entryEpoch).toBe(run.state().demoEntryEpoch);
    expectNoAuthority(run);
  });

  it('keeps the ordinary first-run route and denies its demo command', async () => {
    const run = await freshRun('ordinary');
    const markup = render(run.Welcome);
    expect(markup).toContain('legacy-first-run');
    expect(rendered.legacyOnboarding).toHaveBeenCalledOnce();
    expect(rendered.demo).toBeNull();
    expect(run.enter('parent_al_noor').ok).toBe(false);
    expectNoAuthority(run);
    ok(run.state().requestParentVerification({ identifier: 'parent@example.com' }));
    render(run.Access);
    expect(rendered.slots).toBe(1);
    expect(rendered.redirects).toEqual([]);
  });

  it.each(principals)('keeps %s behind its own authorized layout', async (principal) => {
    const run = await freshRun();
    ok(run.enter(principal));
    const parent = principal === 'parent_al_noor';
    render(parent ? run.Child : run.Parent);
    expect(rendered.redirects).toEqual([parent ? '/parent' : '/child']);
    expect(rendered.slots + rendered.stacks).toBe(0);
    render(parent ? run.Parent : run.Child);
    expect(rendered.redirects).toEqual([]);
    expect(rendered.slots + rendered.stacks).toBe(1);
    render(run.Access);
    expect(rendered.redirects).toEqual(['/']);
    expect(rendered.slots).toBe(0);
  });

  it('closes signed-out deep links and ordinary entry commands in demo mode', async () => {
    const run = await freshRun();
    for (const layout of [run.Access, run.Parent, run.Child]) {
      render(layout);
      expect(rendered.redirects).toEqual(['/']);
      expect(rendered.slots + rendered.stacks).toBe(0);
    }
    expect(run.state().requestParentVerification({ identifier: 'parent@example.com' }).ok).toBe(
      false,
    );
    expect(run.state().selectChildAccessProfile('child_salem').ok).toBe(false);
    expect(run.state().verifyChildCredential('2468').ok).toBe(false);
    expectNoAuthority(run);
  });

  it.each(['ar', 'en'] as const)(
    'passes the canonical %s resources and body script to presentation',
    async (locale) => {
      const run = await freshRun();
      run.state().setLocale(locale);
      render(run.Welcome);
      const props = demoProps();
      const copy = run.resources[locale].translation.demoEntry;
      expect(props.runGeneration).toBe(run.state().demoRunGeneration);
      expect(props.entryEpoch).toBe(run.state().demoEntryEpoch);
      for (const label of [
        'audioPlay',
        'audioStop',
        'audioReplay',
        'audioLoading',
        'audioScreenReader',
      ] as const) {
        expect(props.copy.story[label]).toBe(copy.story[label]);
      }
      expect(props.locale).toBe(locale);
      expect(props.direction).toBe(locale === 'ar' ? 'rtl' : 'ltr');
      expect(props.copy.body).toBe(copy.body);
      expect(props.copy.profiles.map((profile) => profile.principal)).toEqual(principals);
      expect(props.copy.moments.map((moment) => moment.body)).toEqual([
        copy.moments.intro.body,
        copy.moments.family.body,
        copy.moments.together.body,
        copy.moments.ai.body,
        copy.moments.support.body,
        copy.moments.growth.body,
      ]);
      const bodyText = [props.copy.body, ...props.copy.moments.map((moment) => moment.body)].join(
        ' ',
      );
      expect(/\p{Script=Arabic}/u.test(bodyText)).toBe(locale === 'ar');
      expect(/\p{Script=Latin}/u.test(bodyText)).toBe(locale === 'en');
      expect(props.copy.story.progressLabel(1, 6)).not.toContain('{{');
      expect(props.copy.story.progressLabel(1, 6)).toContain('1');
      expect(props.copy.story.progressLabel(1, 6)).toContain('6');
      const ar = resourceLeaves(run.resources.ar.translation.demoEntry);
      const en = resourceLeaves(run.resources.en.translation.demoEntry);
      expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
      for (const [key, value] of Object.entries(ar)) {
        expect(value.trim()).not.toBe('');
        expect(en[key]?.trim()).not.toBe('');
        expect(value.match(/\{\{[^}]+\}\}/gu) ?? []).toEqual(
          en[key]?.match(/\{\{[^}]+\}\}/gu) ?? [],
        );
      }
      props.onChangeLocale();
      expect(run.state().locale).toBe(locale === 'ar' ? 'en' : 'ar');
      expectNoAuthority(run);
    },
  );

  it('presents the failed-reset restart latch and denies root callbacks and both role routes', async () => {
    const run = await freshRun();
    ok(run.enter('parent_al_noor'));
    vi.spyOn(run.serviceRegistry.deviceAccess, 'clear').mockReturnValueOnce(failure());
    expect(run.state().resetPrototype().ok).toBe(false);

    const markup = render(run.Welcome);
    const props = demoProps();
    expect(props.restartRequired).toBe(true);
    expect(markup).toContain(run.resources.ar.translation.demoEntry.restartRequiredBodyWeb);
    expectNoAuthority(run);
    for (const principal of principals) props.onChooseProfile(principal);
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expectNoAuthority(run);
    for (const layout of [run.Access, run.Parent, run.Child]) {
      render(layout);
      expect(rendered.redirects).toEqual(['/']);
      expect(rendered.slots + rendered.stacks).toBe(0);
    }
    expect(rendered.legacyOnboarding).not.toHaveBeenCalled();
    props.onChangeLocale();
    render(run.Welcome);
    expect(demoProps().restartRequired).toBe(true);
    expect(demoProps().locale).toBe('en');
    expectNoAuthority(run);
  });
});

describe('demo settings entry navigation', () => {
  it.each(['parent_al_noor', 'child_salem'] as const)(
    'prepares navigation before %s sign-out and resets it only after authority ends',
    async (principal) => {
      const run = await freshRun();
      ok(run.enter(principal));
      const active = principal === 'parent_al_noor' ? 'parent' : 'child';
      const progress = structuredClone(run.state().children);
      const root = rendered.navigation.getRootState();
      const observed: string[] = [];
      rendered.navigation.getRootState.mockImplementation(() => {
        observed.push(`prepare:${run.state().activeExperience}`);
        return root;
      });
      rendered.navigation.resetRoot.mockImplementation((_entry: EntryResetState) => {
        observed.push(`reset:${run.state().activeExperience}`);
        expectNoAuthority(run);
      });
      render(active === 'parent' ? run.ParentSettings : run.ChildSettings);

      press(active === 'parent' ? 'parent-sign-out' : 'child-parent-access');

      expect(observed).toEqual([`prepare:${active}`, 'reset:signed_out']);
      expect(rendered.navigation.resetRoot).toHaveBeenCalledExactlyOnceWith({
        index: 0,
        routes: [{ name: 'app-shell', state: { index: 0, routes: [{ name: 'index' }] } }],
      });
      expect(rendered.router.replace).not.toHaveBeenCalled();
      expect(run.state().temporaryParentAccess).toBeNull();
      expect(run.state().children).toEqual(progress);
      render(run.Welcome);
      expect(demoProps().restartRequired).toBe(false);
    },
  );

  it.each(['parent_al_noor', 'child_salem'] as const)(
    'does not end %s authority when a safe navigation reset cannot be prepared',
    async (principal) => {
      const run = await freshRun();
      ok(run.enter(principal));
      const parent = principal === 'parent_al_noor';
      const before = run.state().activeExperience;
      rendered.navigation.getRootState.mockReturnValue(undefined);
      render(parent ? run.ParentSettings : run.ChildSettings);

      press(parent ? 'parent-sign-out' : 'child-parent-access');

      expect(run.state().activeExperience).toBe(before);
      ok(parent ? run.state().authorizeParentExperience() : run.state().authorizeChildExperience());
      expect(rendered.navigation.resetRoot).not.toHaveBeenCalled();
      expect(rendered.router.replace).not.toHaveBeenCalled();
      expect(run.state().temporaryParentAccess).toBeNull();
    },
  );
});
