import { createRequire } from 'node:module';

import { createElement, type ReactNode, type SetStateAction } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OriginalDemoChildChooser,
  type OriginalDemoChildChooserProps,
} from '@/components/demo/OriginalDemoChildChooser';
import { OriginalDemoEntryScreen } from '@/components/demo/OriginalDemoEntryScreen';
import type { DemoEntryCopy, DemoEntryScreenProps } from '@/components/demo/types';
import { resources } from '@/i18n/resources';

interface LeafProps {
  children?: ReactNode;
  header?: ReactNode;
  message?: string;
  title?: string;
  body?: string;
  testID?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityLiveRegion?: string;
  accessibilityState?: { disabled?: boolean; busy?: boolean };
  onPress?: () => void;
}

const rendered = vi.hoisted(() => ({
  nodes: [] as LeafProps[],
  controls: [] as LeafProps[],
  onboarding: [] as { narrationEnabled?: boolean }[],
  stateRequests: [] as unknown[],
  avatars: [] as { id: string; size: number }[],
  completed: false,
}));

function renderLeaf(tag: 'main' | 'div' | 'span' | 'button', props: LeafProps) {
  rendered.nodes.push(props);
  if (tag === 'button') rendered.controls.push(props);
  return createElement(
    tag,
    {
      'data-testid': props.testID,
      'aria-label': props.accessibilityLabel,
      role: props.accessibilityRole,
      'aria-live': props.accessibilityLiveRegion,
      disabled: tag === 'button' ? props.disabled : undefined,
    },
    props.header,
    props.children ?? props.message,
    props.title,
    props.body,
  );
}

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: <T,>(initial: T | (() => T)) => {
      const [value] = actual.useState(initial);
      return [value, (next: SetStateAction<T>) => rendered.stateRequests.push(next)] as const;
    },
  };
});

vi.mock('react-native', () => ({
  BackHandler: { addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: (props: LeafProps) => renderLeaf('div', props),
  Pressable: (props: LeafProps) => renderLeaf('button', props),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name: string }) => {
      const value = key.split('.').reduce<unknown>((current, part) => {
        return current && typeof current === 'object'
          ? (current as Record<string, unknown>)[part]
          : undefined;
      }, resources.en.translation);
      return typeof value === 'string' ? value.replace('{{name}}', options?.name ?? '') : key;
    },
  }),
}));
vi.mock('@/components/primitives', () => ({
  Text: (props: LeafProps) => renderLeaf('span', props),
  Button: (props: LeafProps) => renderLeaf('button', props),
}));
vi.mock('@/components/access', () => ({
  AccessScreen: (props: LeafProps) => renderLeaf('main', props),
  AccessHeader: ({ onBack }: { onBack: () => void }) =>
    renderLeaf('button', { testID: 'captured-header-back', onPress: onBack }),
  PrototypePill: (props: LeafProps) => renderLeaf('span', props),
  BotanicalAvatar: (props: { id: string; size: number }) => {
    rendered.avatars.push(props);
    return null;
  },
  ChildAccessPortrait: () => null,
  GhafIcon: () => null,
}));
vi.mock('@/components/brand/GhafRasterLogo', () => ({ GhafRasterLogo: () => null }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: () => null }));
vi.mock('@/components/r003', () => ({
  R003Hero: (props: LeafProps) => renderLeaf('div', props),
  R003Status: (props: LeafProps) => renderLeaf('div', props),
}));
vi.mock('@/components/onboarding', () => ({
  useFirstRunExperience: () => ({ state: { completed: rendered.completed } }),
  FirstRunOnboarding: (props: { narrationEnabled?: boolean }) => {
    rendered.onboarding.push(props);
    return createElement('section', { 'data-testid': 'captured-original-onboarding' });
  },
}));

// SSR and captured callbacks cover output and requested state changes only.
// The setter recorder does not simulate mounted navigation, effects, or hardware Back.
const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

function copyFixture(): DemoEntryCopy {
  const labels = resources.en.translation.demoEntry;
  return {
    ...labels,
    brand: resources.en.translation.common.brand,
    profiles: [
      {
        principal: 'parent_al_noor',
        name: 'Parent',
        roleLabel: 'Parent',
        description: labels.parentDescription,
        avatar: 'parent',
      },
      {
        principal: 'child_salem',
        name: 'Salem',
        roleLabel: 'Child',
        description: labels.salemDescription,
        avatar: 'ghaf_tree',
      },
      {
        principal: 'child_alya',
        name: 'Alya',
        roleLabel: 'Child',
        description: labels.alyaDescription,
        avatar: 'flower',
      },
    ],
    moments: [],
    story: { ...labels.story, progressLabel: (current, total) => `${current}/${total}` },
  };
}

function entryProps(overrides: Partial<DemoEntryScreenProps> = {}): DemoEntryScreenProps {
  return {
    locale: 'en',
    direction: 'ltr',
    copy: copyFixture(),
    busy: false,
    error: null,
    restartRequired: false,
    runGeneration: 0,
    entryEpoch: 0,
    onChooseProfile: vi.fn(),
    onChangeLocale: vi.fn(),
    ...overrides,
  };
}

function chooserProps(
  overrides: Partial<OriginalDemoChildChooserProps> = {},
): OriginalDemoChildChooserProps {
  return {
    locale: 'en',
    direction: 'ltr',
    copy: copyFixture(),
    busy: false,
    error: null,
    onChooseProfile: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
}

function node(testID: string) {
  const matches = rendered.nodes.filter((item) => item.testID === testID);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function press(testID: string) {
  const callback = node(testID).onPress;
  expect(callback).toEqual(expect.any(Function));
  callback!();
}

function expectText(markup: string, value: string) {
  expect(markup).toContain(renderToStaticMarkup(value));
}

beforeEach(() => {
  rendered.nodes.length = 0;
  rendered.controls.length = 0;
  rendered.onboarding.length = 0;
  rendered.stateRequests.length = 0;
  rendered.avatars.length = 0;
  rendered.completed = false;
});

describe('restored demo entry SSR and callback contracts', () => {
  it.each(['ar', 'en'] as const)(
    'uses the selected Arabic narrator without enabling English demo audio for %s',
    (locale) => {
      const props = { ...entryProps(), locale };
      const markup = renderToStaticMarkup(createElement(OriginalDemoEntryScreen, props));

      expect(rendered.onboarding).toEqual([{ narrationEnabled: locale === 'ar' }]);
      expect(markup).not.toContain('welcome-screen');
      expect(rendered.controls).toHaveLength(0);
      expect(props.onChooseProfile).not.toHaveBeenCalled();
    },
  );

  it.each([
    { completed: true, entryEpoch: 0 },
    { completed: false, entryEpoch: 1 },
  ])('uses the original Welcome when %j', ({ completed, entryEpoch }) => {
    rendered.completed = completed;
    const props = entryProps({ entryEpoch });
    const markup = renderToStaticMarkup(createElement(OriginalDemoEntryScreen, props));

    expect(rendered.onboarding).toHaveLength(0);
    expect(markup).toContain('welcome-screen');
    expectText(markup, resources.en.translation.access.welcome.title);
    expect(node('welcome-parent-button').disabled).toBe(false);
    expect(node('welcome-child-button').disabled).toBe(false);
    press('welcome-parent-button');
    expect(props.onChooseProfile).toHaveBeenCalledExactlyOnceWith('parent_al_noor');
    press('welcome-child-button');
    expect(rendered.stateRequests).toEqual([true]);
    expect(props.onChooseProfile).toHaveBeenCalledTimes(1);
    press('welcome-language-button');
    expect(props.onChangeLocale).toHaveBeenCalledExactlyOnceWith();
  });

  it.each(['busy', 'restartRequired'] as const)(
    'blocks both role callbacks and renders the notice when %s',
    (blockedBy) => {
      const props = entryProps({
        entryEpoch: blockedBy === 'busy' ? 1 : 0,
        error: 'Profile entry failed',
        [blockedBy]: true,
      });
      const markup = renderToStaticMarkup(createElement(OriginalDemoEntryScreen, props));

      expect(rendered.onboarding).toHaveLength(0);
      for (const id of ['welcome-parent-button', 'welcome-child-button']) {
        expect(node(id).disabled).toBe(true);
        press(id);
      }
      expect(props.onChooseProfile).not.toHaveBeenCalled();
      expect(rendered.stateRequests).toHaveLength(0);
      expect(node('demo-entry-error').accessibilityRole).toBe('alert');
      expectText(
        markup,
        blockedBy === 'restartRequired' ? props.copy.restartRequiredBody : props.error!,
      );
      if (blockedBy === 'busy') {
        expect(node('demo-entry-busy').accessibilityLiveRegion).toBe('polite');
        expectText(markup, props.copy.busyLabel);
      }
    },
  );

  it('keeps a recoverable entry error visible without disabling retry', () => {
    const props = entryProps({ entryEpoch: 1, error: 'Try this profile again' });
    const markup = renderToStaticMarkup(createElement(OriginalDemoEntryScreen, props));

    expectText(markup, props.error!);
    expect(node('demo-entry-error').accessibilityRole).toBe('alert');
    expect(node('welcome-parent-button').disabled).toBe(false);
    press('welcome-parent-button');
    expect(props.onChooseProfile).toHaveBeenCalledExactlyOnceWith('parent_al_noor');
  });
});

describe('restored demo Child chooser SSR and callbacks', () => {
  it('offers only Salem and Alya in canonical order with their matching callbacks and avatars', () => {
    const copy = copyFixture();
    const props = chooserProps({ copy: { ...copy, profiles: [...copy.profiles].reverse() } });
    const markup = renderToStaticMarkup(createElement(OriginalDemoChildChooser, props));

    expect(
      rendered.controls
        .filter((item) => item.testID?.startsWith('choose-'))
        .map((item) => item.testID),
    ).toEqual(['choose-child-salem', 'choose-child-alya']);
    expect(rendered.avatars).toEqual([
      expect.objectContaining({ id: 'ghaf_tree', size: 64 }),
      expect.objectContaining({ id: 'flower', size: 64 }),
    ]);
    for (const profile of copy.profiles.slice(1)) {
      expectText(markup, profile.name);
      expectText(markup, profile.description);
    }
    expectText(markup, copy.disclosure);
    expectText(markup, copy.body);
    expect(markup).not.toContain(resources.en.translation.r003.access.salemAccess);
    expect(markup).not.toContain(resources.en.translation.r003.access.alyaAccess);
    expect(props.onChooseProfile).not.toHaveBeenCalled();
    press('choose-child-salem');
    press('choose-child-alya');
    expect(props.onChooseProfile).toHaveBeenCalledTimes(2);
    expect(props.onChooseProfile).toHaveBeenNthCalledWith(1, 'child_salem');
    expect(props.onChooseProfile).toHaveBeenNthCalledWith(2, 'child_alya');
    press('captured-header-back');
    expect(props.onBack).toHaveBeenCalledExactlyOnceWith();
  });

  it.each(['missing-child', 'unsupported-child-avatar'] as const)(
    'fails closed for a %s fixture',
    (invalid) => {
      const copy = copyFixture();
      const profiles =
        invalid === 'missing-child'
          ? copy.profiles.filter((profile) => profile.principal !== 'child_alya')
          : copy.profiles.map((profile) =>
              profile.principal === 'child_alya'
                ? { ...profile, avatar: 'parent' as const }
                : profile,
            );
      const props = chooserProps({ copy: { ...copy, profiles } });
      const markup = renderToStaticMarkup(createElement(OriginalDemoChildChooser, props));

      expect(rendered.controls.some((item) => item.testID?.startsWith('choose-'))).toBe(false);
      expect(node('demo-entry-error').accessibilityRole).toBe('alert');
      expectText(markup, copy.unavailableError);
      expect(props.onChooseProfile).not.toHaveBeenCalled();
    },
  );

  it('disables and callback-guards both children while announcing busy and error states', () => {
    const props = chooserProps({ busy: true, error: 'Profile is temporarily unavailable' });
    const markup = renderToStaticMarkup(createElement(OriginalDemoChildChooser, props));

    for (const id of ['choose-child-salem', 'choose-child-alya']) {
      expect(node(id).disabled).toBe(true);
      expect(node(id).accessibilityState).toMatchObject({ disabled: true, busy: true });
      press(id);
    }
    expect(props.onChooseProfile).not.toHaveBeenCalled();
    expect(node('demo-entry-error').accessibilityRole).toBe('alert');
    expect(node('demo-entry-busy').accessibilityLiveRegion).toBe('polite');
    expectText(markup, props.copy.busyLabel);
    expectText(markup, props.error!);
  });
});
