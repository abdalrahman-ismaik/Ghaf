import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AmbientSoundSetting } from '../../src/components/settings/AmbientSoundSetting';
import { resources } from '../../src/i18n/resources';
import { createAmbientAudioPreferencesRepository } from '../../src/services/local/audioPreferencesRepository';
import { createMemoryLocalKeyValueStorage } from '../../src/services/local/memoryStorage';

const harness = vi.hoisted(() => ({
  error: null as string | null,
  state: {} as Record<string, unknown>,
  locale: 'ar' as 'ar' | 'en',
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: () => [
    harness.error,
    (value: string | null) => {
      harness.error = value;
    },
  ],
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (values: Record<string, unknown>) => values.default },
  StyleSheet: { create: (styles: unknown) => styles },
  Switch: 'Switch',
  View: 'View',
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/components/r003', () => ({ R003Status: 'R003Status' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: unknown) => unknown) => selector(harness.state),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      let value: unknown = resources[harness.locale].translation;
      for (const part of key.split('.')) value = (value as Record<string, unknown>)[part];
      return value;
    },
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
function nodes(tree: ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!isValidElement<Record<string, unknown>>(tree)) return [];
  return [tree, ...nodes(tree.props.children as ReactNode)];
}

let storage: ReturnType<typeof createMemoryLocalKeyValueStorage>;
let repository: ReturnType<typeof createAmbientAudioPreferencesRepository>;
function currentPreference() {
  return harness.state.ambientAudioPreference as { enabled: boolean; volume: number };
}
function controls() {
  return nodes(AmbientSoundSetting());
}
function choose(testID: string) {
  const button = controls().find((node) => node.props.testID === testID)!;
  (button.props.onPress as () => void)();
}

beforeEach(() => {
  storage = createMemoryLocalKeyValueStorage();
  repository = createAmbientAudioPreferencesRepository(storage);
  harness.error = null;
  harness.locale = 'ar';
  const save = (enabled: boolean, volume: number) => {
    const result = repository.save(enabled, volume);
    if (result.ok) {
      harness.state.ambientAudioPreference = {
        enabled: result.data.ambientSoundEnabled,
        volume: result.data.volume,
        status: 'ready',
        source: 'stored',
      };
    }
    return result;
  };
  harness.state = {
    direction: 'rtl',
    locale: 'ar',
    ambientAudioPreference: { enabled: true, volume: 0.2, status: 'ready', source: 'default' },
    setAmbientSoundEnabled: (enabled: boolean) => save(enabled, currentPreference().volume),
    setAmbientSoundVolume: (volume: number) => save(currentPreference().enabled, volume),
  };
});

describe('accessible ambience volume settings', () => {
  it.each(['ar', 'en'] as const)(
    'offers four localized %s choices with one checked level',
    (locale) => {
      harness.locale = locale;
      harness.state.locale = locale;
      harness.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
      const rendered = controls();
      const group = rendered.find((node) => node.props.accessibilityRole === 'radiogroup')!;
      expect(group.props.accessibilityLabel).toBe(
        resources[locale].translation.ambientVolume.title,
      );
      const options = rendered.filter((node) => node.props.accessibilityRole === 'radio');
      expect(options).toHaveLength(4);
      expect(options.map((node) => node.props.children)).toEqual(
        ['silent', 'low', 'medium', 'high'].map(
          (key) =>
            resources[locale].translation.ambientVolume[
              key as 'silent' | 'low' | 'medium' | 'high'
            ],
        ),
      );
      expect(options.map((node) => node.props.accessibilityState)).toEqual([
        { checked: false },
        { checked: false },
        { checked: true },
        { checked: false },
      ]);
    },
  );

  it('saves selected levels and keeps the choice through mute and a new repository', () => {
    choose('ambient-volume-1');
    const mute = controls().find((node) => node.props.testID === 'ambient-sound-switch')!;
    (mute.props.onValueChange as (enabled: boolean) => void)(false);
    expect(currentPreference()).toMatchObject({ enabled: false, volume: 0.1 });
    expect(createAmbientAudioPreferencesRepository(storage).read()).toMatchObject({
      ok: true,
      data: { ambientSoundEnabled: false, volume: 0.1 },
    });
    choose('ambient-volume-0');
    expect(currentPreference()).toMatchObject({ enabled: false, volume: 0 });
    const silent = controls().find((node) => node.props.testID === 'ambient-volume-0')!;
    expect(silent.props.accessibilityState).toEqual({ checked: true });
  });

  it('retains selection and exposes failure until an actual successful retry', () => {
    choose('ambient-volume-1');
    storage.failNextWrite();
    choose('ambient-volume-3');
    expect(currentPreference().volume).toBe(0.1);
    const warning = controls().find((node) => node.type === 'R003Status')!;
    expect(warning.props.message).toBe(
      resources.ar.translation.r003.settings.ambientAudio.saveError,
    );
    choose('ambient-volume-3');
    expect(currentPreference().volume).toBe(0.3);
    expect(controls().find((node) => node.type === 'R003Status')).toBeUndefined();
  });
});
