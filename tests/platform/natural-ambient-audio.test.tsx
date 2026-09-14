import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAmbientAudioPreference,
  parseAmbientAudioPreference,
  restoreAmbientAudioPreference,
  resolveAmbientPlaybackDecision,
} from '../../src/features/audio/ambientAudio';
import { resources } from '../../src/i18n/resources';
import {
  AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY,
  type AmbientAudioPreferenceRecord,
} from '../../src/models/audioPreferences';
import { serviceRegistry } from '../../src/services';
import {
  createAmbientAudioPreferencesRepository,
  createMemoryLocalKeyValueStorage,
} from '../../src/services/local';
import { deviceLocalStorage } from '../../src/services/local/storage';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

describe('Feature 006 ambient preference schema and repository', () => {
  it('round-trips device-local mute and volume and rejects expanded or malformed records', () => {
    const enabled = expectOk(createAmbientAudioPreference(true));
    const disabled = expectOk(createAmbientAudioPreference(false));

    expect(enabled).toEqual({
      schemaVersion: 1,
      ambientSoundEnabled: true,
      volume: 0.2,
      origin: 'device_local',
    });
    expect(parseAmbientAudioPreference(JSON.stringify(enabled))).toEqual({
      ok: true,
      data: enabled,
    });
    expect(parseAmbientAudioPreference(JSON.stringify(disabled))).toEqual({
      ok: true,
      data: disabled,
    });

    for (const raw of [
      'not-json',
      JSON.stringify({ schemaVersion: 2, ambientSoundEnabled: true, origin: 'device_local' }),
      JSON.stringify({ ...enabled, extra: true }),
      JSON.stringify({ ...enabled, ambientSoundEnabled: 'yes' }),
      JSON.stringify({ ...enabled, origin: 'account' }),
    ]) {
      expect(parseAmbientAudioPreference(raw)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    }
  });

  it('persists, clones, safely rejects corruption, preserves a prior value on failure, and clears', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createAmbientAudioPreferencesRepository(storage);

    expect(repository.read()).toEqual({ ok: true, data: null });
    const disabled = expectOk(repository.save(false));
    expect(repository.read()).toEqual({ ok: true, data: disabled });

    storage.failNextWrite();
    expect(repository.save(true)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toEqual({ ok: true, data: disabled });

    storage.setItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY, '{broken');
    expect(repository.read()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });

    storage.setItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY, JSON.stringify(disabled));
    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
  });

  it('stores no role, identity, media, account, or playback state', () => {
    const record = expectOk(createAmbientAudioPreference(true));
    expect(Object.keys(record).sort()).toEqual([
      'ambientSoundEnabled',
      'origin',
      'schemaVersion',
      'volume',
    ] satisfies (keyof AmbientAudioPreferenceRecord)[]);
    expect(JSON.stringify(record)).not.toMatch(
      /child|parent|household|account|session|token|media|microphone|position|playing/iu,
    );
  });

  it('restores absent and stored values but falls back to silence when storage is unavailable', () => {
    const disabled = expectOk(createAmbientAudioPreference(false));

    expect(restoreAmbientAudioPreference({ storageAvailable: true, record: null })).toEqual({
      enabled: true,
      volume: 0.2,
      status: 'ready',
      source: 'default',
    });
    expect(restoreAmbientAudioPreference({ storageAvailable: true, record: disabled })).toEqual({
      enabled: false,
      volume: 0.2,
      status: 'ready',
      source: 'stored',
    });
    expect(restoreAmbientAudioPreference({ storageAvailable: false })).toEqual({
      enabled: false,
      volume: 0.2,
      status: 'unavailable',
      source: 'safe_fallback',
    });
  });

  it('reads an existing boolean-only preference without rewriting it and retains its mute state', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const legacy = JSON.stringify({
      schemaVersion: 1,
      ambientSoundEnabled: false,
      origin: 'device_local',
    });
    storage.setItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY, legacy);
    const repository = createAmbientAudioPreferencesRepository(storage);
    expect(repository.read()).toMatchObject({
      ok: true,
      data: { volume: 0.2, ambientSoundEnabled: false },
    });
    expect(storage.getItem(AMBIENT_AUDIO_PREFERENCE_STORAGE_KEY)).toBe(legacy);
    expectOk(repository.save(false, 0.1));
    expect(createAmbientAudioPreferencesRepository(storage).read()).toMatchObject({
      ok: true,
      data: { volume: 0.1, ambientSoundEnabled: false },
    });
    expectOk(repository.save(true));
    expect(repository.read()).toMatchObject({
      ok: true,
      data: { volume: 0.1, ambientSoundEnabled: true },
    });
  });

  it.each([-1, 0.31, Number.NaN, Number.POSITIVE_INFINITY, null, '0.2'])(
    'rejects unsafe or malformed volume %s',
    (volume) => {
      expect(createAmbientAudioPreference(true, volume).ok).toBe(false);
    },
  );

  it('does not report persisted success when storage silently drops a volume write or clear', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createAmbientAudioPreferencesRepository(storage);
    expectOk(repository.save(true, 0.1));
    vi.spyOn(storage, 'setItem').mockImplementationOnce(() => undefined);
    expect(repository.save(true, 0.3).ok).toBe(false);
    expect(repository.read()).toMatchObject({ ok: true, data: { volume: 0.1 } });
    vi.spyOn(storage, 'removeItem').mockImplementationOnce(() => undefined);
    expect(repository.clear().ok).toBe(false);
    expect(repository.read()).toMatchObject({ ok: true, data: { volume: 0.1 } });
  });
});

describe('Feature 006 ambient playback policy', () => {
  const readyInput = {
    enabled: true,
    startupReady: true,
    appState: 'active',
    screenReaderActive: false,
    webPlaybackUnlocked: true,
    narrationPlaying: false,
    exclusiveAudioActive: false,
  } as const;

  it('plays quietly only when every eligibility condition passes and ducks for narration', () => {
    expect(resolveAmbientPlaybackDecision(readyInput)).toEqual({
      shouldPlay: true,
      volume: 0.2,
    });
    expect(resolveAmbientPlaybackDecision({ ...readyInput, narrationPlaying: true })).toEqual({
      shouldPlay: true,
      volume: 0.06,
    });
  });

  it.each([0, 0.1, 0.2, 0.3])(
    'applies chosen volume %s and preserves proportional narration ducking',
    (volume) => {
      expect(resolveAmbientPlaybackDecision({ ...readyInput, volume })).toEqual({
        shouldPlay: volume > 0,
        volume,
      });
      const ducked = resolveAmbientPlaybackDecision({
        ...readyInput,
        volume,
        narrationPlaying: true,
      });
      expect(ducked.shouldPlay).toBe(volume > 0);
      expect(ducked.volume).toBeCloseTo(volume * 0.3);
      expect(
        resolveAmbientPlaybackDecision({ ...readyInput, volume, enabled: false }).shouldPlay,
      ).toBe(false);
      expect(
        resolveAmbientPlaybackDecision({ ...readyInput, volume, exclusiveAudioActive: true })
          .shouldPlay,
      ).toBe(false);
    },
  );

  it.each([-0.1, 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'fails silently for invalid live volume %s',
    (volume) => {
      expect(resolveAmbientPlaybackDecision({ ...readyInput, volume })).toEqual({
        shouldPlay: false,
        volume: 0,
      });
    },
  );

  it.each([
    ['disabled', { enabled: false }],
    ['startup pending', { startupReady: false }],
    ['background', { appState: 'background' }],
    ['inactive', { appState: 'inactive' }],
    ['unknown app state', { appState: 'unknown' }],
    ['screen reader active', { screenReaderActive: true }],
    ['screen reader unknown', { screenReaderActive: null }],
    ['web playback locked', { webPlaybackUnlocked: false }],
    ['exclusive audio active', { exclusiveAudioActive: true }],
  ] as const)('pauses when %s', (_label, patch) => {
    expect(resolveAmbientPlaybackDecision({ ...readyInput, ...patch })).toMatchObject({
      shouldPlay: false,
    });
  });
});

describe('Feature 006 ambient preference store integration', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('starts default-on, persists only successful changes, and is shared across roles', () => {
    expect(usePrototypeStore.getState().ambientAudioPreference).toEqual({
      enabled: true,
      volume: 0.2,
      status: 'ready',
      source: 'default',
    });

    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(false));
    expect(usePrototypeStore.getState().ambientAudioPreference).toEqual({
      enabled: false,
      volume: 0.2,
      status: 'ready',
      source: 'stored',
    });
    expect(serviceRegistry.ambientAudioPreferences.read()).toMatchObject({
      ok: true,
      data: { ambientSoundEnabled: false },
    });

    usePrototypeStore.getState().setRole('child');
    expect(usePrototypeStore.getState().ambientAudioPreference.enabled).toBe(false);
    usePrototypeStore.getState().setRole('parent');
    expect(usePrototypeStore.getState().ambientAudioPreference.enabled).toBe(false);
  });

  it('retains the previous authoritative preference when persistence fails', () => {
    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(false));
    deviceLocalStorage.failNextWrite();

    expect(usePrototypeStore.getState().setAmbientSoundEnabled(true)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().ambientAudioPreference).toEqual({
      enabled: false,
      volume: 0.2,
      status: 'ready',
      source: 'stored',
    });
  });

  it('keeps one preference through real Parent and Child sign-out handoffs', async () => {
    await enterParentExperienceForTest();
    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(false));
    expectOk(usePrototypeStore.getState().signOutExperience());

    await enterChildExperienceForTest('child_salem');
    expect(usePrototypeStore.getState().ambientAudioPreference.enabled).toBe(false);
    expectOk(usePrototypeStore.getState().signOutExperience());

    await enterParentExperienceForTest();
    expect(usePrototypeStore.getState().ambientAudioPreference.enabled).toBe(false);
    expect(serviceRegistry.ambientAudioPreferences.read()).toMatchObject({
      ok: true,
      data: { ambientSoundEnabled: false },
    });
  });

  it('clears the stored choice and restores default-on during exact Parent reset', () => {
    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(false));
    expectOk(resetPrototypeForTest());

    expect(serviceRegistry.ambientAudioPreferences.read()).toEqual({ ok: true, data: null });
    expect(usePrototypeStore.getState().ambientAudioPreference).toEqual({
      enabled: true,
      volume: 0.2,
      status: 'ready',
      source: 'default',
    });
  });

  it('shares the persisted level across roles, preserves it when muted, and retains it after failed writes', async () => {
    await enterParentExperienceForTest();
    expectOk(usePrototypeStore.getState().setAmbientSoundVolume(0.1));
    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(false));
    expect(usePrototypeStore.getState().ambientAudioPreference).toMatchObject({
      enabled: false,
      volume: 0.1,
    });
    expectOk(usePrototypeStore.getState().signOutExperience());
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().ambientAudioPreference.volume).toBe(0.1);
    deviceLocalStorage.failNextWrite();
    expect(usePrototypeStore.getState().setAmbientSoundVolume(0.3).ok).toBe(false);
    expect(usePrototypeStore.getState().ambientAudioPreference).toMatchObject({
      enabled: false,
      volume: 0.1,
    });
    expect(serviceRegistry.ambientAudioPreferences.read()).toMatchObject({
      ok: true,
      data: { volume: 0.1 },
    });
    expectOk(usePrototypeStore.getState().setAmbientSoundEnabled(true));
    expect(usePrototypeStore.getState().ambientAudioPreference).toMatchObject({
      enabled: true,
      volume: 0.1,
    });
    expect(usePrototypeStore.getState().setAmbientSoundVolume(2).ok).toBe(false);
    expect(usePrototypeStore.getState().ambientAudioPreference.volume).toBe(0.1);
    expectOk(usePrototypeStore.getState().setAmbientSoundVolume(0));
    expect(serviceRegistry.ambientAudioPreferences.read()).toMatchObject({
      ok: true,
      data: { volume: 0 },
    });
  });
});

describe('Feature 006 presentation source contract', () => {
  const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  it('mounts one root player and removes the onboarding-only ambience player', () => {
    const provider = source('src/components/audio/AmbientAudioProvider.tsx');
    const root = source('app/_layout.tsx');
    const onboarding = source('src/components/onboarding/FirstRunOnboarding.tsx');
    const audioSources = source('src/components/onboarding/onboardingAudioSources.ts');

    expect(root).toContain('<AmbientAudioProvider');
    expect(provider).toContain("from 'expo-audio'");
    expect(provider).toContain('player.loop = true');
    expect(provider).toContain('resolveAmbientPlaybackDecision');
    expect(provider).toContain('player.pause()');
    expect(provider).toContain('shouldPlayInBackground: false');
    expect(provider).toContain('AccessibilityInfo.isScreenReaderEnabled()');
    expect(provider).toMatch(/AppState\.addEventListener\(\s*'change'/u);
    expect(provider).not.toMatch(
      /fetch\(|https?:\/\/|requestMicrophonePermissions|requestNotificationPermissions|requestRecordingPermissions|setIsAudioActiveAsync/iu,
    );
    expect(onboarding).toContain('setNarrationPlaying');
    expect(onboarding).not.toContain('useOnboardingAmbience');
    expect(audioSources).not.toContain('Ambience');
    expect(() => source('src/components/onboarding/useOnboardingAmbience.ts')).toThrow();
  });

  it('shows the same accessible native switch after language in Parent and Child Settings', () => {
    const component = source('src/components/settings/AmbientSoundSetting.tsx');
    const parent = source('app/parent/settings/index.tsx');
    const child = source('app/child/settings.tsx');

    expect(component).toContain("import { StyleSheet, Switch, View } from 'react-native'");
    expect(component).toContain('accessibilityRole="switch"');
    expect(component).toContain('accessibilityState={{ checked: preference.enabled }}');
    expect(component).toContain('minHeight: layout.touchTarget');
    expect(component).toContain('logicalRowDirection(direction)');
    expect(component).toContain('accessibilityRole="radiogroup"');
    expect(component).toContain('accessibilityRole="radio"');
    expect(component).toContain('accessibilityState={{ checked: preference.volume === volume }}');
    expect(component).toContain('setAmbientSoundVolume(volume)');
    expect(component).toContain("flexWrap: 'wrap'");
    for (const screen of [parent, child]) {
      const language = screen.indexOf('<LanguageSwitcher');
      const ambient = screen.indexOf('<AmbientSoundSetting');
      expect(language).toBeGreaterThanOrEqual(0);
      expect(ambient).toBeGreaterThan(language);
    }
  });

  it('keeps Arabic and English audio copy structurally paired', () => {
    const arabic = resources.ar.translation.r003.settings.ambientAudio;
    const english = resources.en.translation.r003.settings.ambientAudio;
    for (const key of ['sectionTitle', 'title', 'body', 'hint', 'saveError'] as const) {
      expect(arabic).toHaveProperty(key);
      expect(english).toHaveProperty(key);
      expect(arabic[key].length).toBeGreaterThan(0);
      expect(english[key].length).toBeGreaterThan(0);
    }
    const volumeArabic = resources.ar.translation.ambientVolume;
    const volumeEnglish = resources.en.translation.ambientVolume;
    for (const key of ['title', 'hint', 'silent', 'low', 'medium', 'high'] as const) {
      expect(volumeArabic[key].length).toBeGreaterThan(0);
      expect(volumeEnglish[key].length).toBeGreaterThan(0);
    }
  });
});

describe('Feature 010 calm soundscape source contract', () => {
  const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
  const v1Path = join(process.cwd(), 'assets/audio/ambient/nature-soundscape-v1.mp3');
  const v2Path = join(process.cwd(), 'assets/audio/ambient/calm-soundscape-v2.mp3');

  it('selects only the local v2 source and preserves the exact v1 rollback asset', () => {
    const provider = source('src/components/audio/AmbientAudioProvider.tsx');

    expect(provider).toContain("require('../../../assets/audio/ambient/calm-soundscape-v2.mp3')");
    expect(provider).not.toContain('nature-soundscape-v1.mp3');
    expect(existsSync(v1Path)).toBe(true);
    expect(existsSync(v2Path)).toBe(true);
    expect(createHash('sha256').update(readFileSync(v1Path)).digest('hex')).toBe(
      'd597335684f17773f6ac4c258122951488468fb871af190d8fae171a45253d71',
    );
  });

  it('keeps the new source compact and binds its exact identity to local provenance', () => {
    const readme = source('assets/audio/ambient/README.md');
    const bytes = readFileSync(v2Path);
    const sha256 = createHash('sha256').update(bytes).digest('hex');

    expect(statSync(v2Path).size).toBeGreaterThan(350_000);
    expect(statSync(v2Path).size).toBeLessThan(800_000);
    expect(readme).toContain('calm-soundscape-v2.mp3');
    expect(readme).toContain(sha256);
    expect(readme).toContain('fixed seeds');
    expect(readme).toMatch(/no sine or tonal generator/iu);
    expect(readme).toMatch(/no downloaded (?:field )?recording/iu);
    expect(readme).toMatch(/human\s+listening/iu);
  });
});
