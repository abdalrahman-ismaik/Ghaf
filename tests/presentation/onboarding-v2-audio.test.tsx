import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import type { OnboardingStep } from '@/components/onboarding/experienceModel';
import { createOnboardingPlayback, runOptionalAudio } from '@/features/onboarding/playback';
import type { LocaleCode } from '@/models/familyGrowth';

type Sources = Record<LocaleCode, Record<OnboardingStep, number | null>>;
type Options = {
  locale: LocaleCode;
  step: OnboardingStep;
  ready: boolean;
  webPlaybackUnlocked: boolean;
};
type Narrator = {
  hasSource: boolean;
  status: 'idle' | 'speaking' | 'unavailable';
  replay(): void;
};
type Effect = () => void | (() => void);

const root = process.cwd();
function loadModule(path: string, requireModule: (name: string) => unknown) {
  const compiled = ts.transpileModule(readFileSync(resolve(root, path), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports: Record<string, unknown> = {};
  runInNewContext(compiled.outputText, { exports, require: requireModule }, { filename: path });
  return exports;
}

const sourcePath = 'src/components/onboarding/onboardingAudioSources.ts';
const registered: string[] = [];
const sources = loadModule(sourcePath, (name) => {
  registered.push(resolve(root, dirname(sourcePath), name));
  return registered.length;
}).onboardingNarrationSources as Sources;
const steps: readonly OnboardingStep[] = [
  'intro',
  'family',
  'sustainability',
  'ai',
  'support',
  'growth',
];
const arabicHashes = {
  intro: '57ad68490b226182a130e51b88c7932ad613c18e094212f135a0a6fd14c3a180',
  family: '12ab61cb8254ce3eafff0d688efaa0b7733a6282ec8a6216958a2d9fa6841d59',
  sustainability: 'f2f0b5886529b8767c3747f0dbeb94a1535732fb96f8449ef5588bbe93330549',
  ai: '3a324868de8c377588ec44a524dba5a25ddc599e783a3d97fa2866aeb0755267',
  support: '9b5e48a05da8f7e048dff6ac25f6bc098e258a08246992d264970d613b07789c',
  growth: '46e806eeccc019896a69b0f42664501f76fc6fc0dd1bd421fc95533969f25054',
} satisfies Record<OnboardingStep, string>;

const missingSources: Sources = { ...sources, ar: { ...sources.ar, sustainability: null } };

// Execute production hook effects with deterministic React/Expo doubles, not a mounted phone UI.
function harness(playing = false, error = false, narrationSources: Sources = sources) {
  let effects: Effect[] = [];
  let cleanups: (() => void)[] = [];
  const player = {
    loop: false,
    volume: 0,
    pause: vi.fn(),
    play: vi.fn(),
    seekTo: vi.fn(async (_seconds: number): Promise<void> => undefined),
  };
  const useAudioPlayer = vi.fn(() => player);
  const imports: Record<string, unknown> = {
    'expo-audio': { useAudioPlayer, useAudioPlayerStatus: () => ({ playing, error }) },
    react: {
      useCallback: (callback: unknown) => callback,
      useMemo: (factory: () => unknown) => factory(),
      useState: (initial: unknown) => [initial, vi.fn()],
      useEffect: (effect: Effect) => effects.push(effect),
    },
    'react-native': { Platform: { OS: 'web' }, AccessibilityInfo: {} },
    '@/features/onboarding/playback': { createOnboardingPlayback, runOptionalAudio },
    './onboardingAudioSources': { onboardingNarrationSources: narrationSources },
  };
  const invokeNarratorWithDoubles = loadModule(
    'src/components/onboarding/useOnboardingNarrator.ts',
    (name) => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
      return imports[name];
    },
  ).useOnboardingNarrator as (options: Options) => Narrator;
  return {
    player,
    useAudioPlayer,
    render(overrides: Partial<Options> = {}) {
      cleanups.forEach((cleanup) => cleanup());
      effects = [];
      const result = invokeNarratorWithDoubles({
        locale: 'ar',
        step: 'intro',
        ready: true,
        webPlaybackUnlocked: true,
        ...overrides,
      });
      cleanups = effects
        .map((effect) => effect())
        .filter((cleanup) => typeof cleanup === 'function');
      return result;
    },
  };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('selected Arabic v2 narration', () => {
  it('registers all six exact selected v2 files without an old Arabic voice', () => {
    expect(registered).toHaveLength(12);
    for (const [step, hash] of Object.entries(arabicHashes)) {
      const asset = registered[sources.ar[step as OnboardingStep]! - 1]!;
      expect(asset).toBe(
        resolve(
          root,
          `assets/audio/onboarding/narration-ar-${step === 'ai' ? 'assistant' : step}-v2.mp3`,
        ),
      );
      expect(createHash('sha256').update(readFileSync(asset)).digest('hex')).toBe(hash);
    }
    expect(registered.some((path) => /narration-ar-.*-v1\.mp3/u.test(path))).toBe(false);
  });

  it('preserves every English source including sustainability', () => {
    for (const step of steps) {
      expect(registered[sources.en[step]! - 1]).toBe(
        resolve(
          root,
          `assets/audio/onboarding/narration-en-${step === 'ai' ? 'assistant' : step}-v1.mp3`,
        ),
      );
    }
  });

  it('keeps a missing clip unavailable and silent even with stale playing status or Replay', async () => {
    const h = harness(true, false, missingSources);
    const narrator = h.render({ step: 'sustainability' });
    expect(h.useAudioPlayer).toHaveBeenCalledWith(null, { updateInterval: 120 });
    expect(narrator).toMatchObject({ hasSource: false, status: 'unavailable' });
    narrator.replay();
    await settle();
    expect(h.player.seekTo).not.toHaveBeenCalled();
    expect(h.player.play).not.toHaveBeenCalled();
  });

  it.each(steps)('plays and replays the available %s v2 clip after readiness', async (step) => {
    const h = harness();
    const narrator = h.render({ step });
    await settle();
    expect(narrator.hasSource).toBe(true);
    expect(h.player.play).toHaveBeenCalledOnce();
    narrator.replay();
    await settle();
    expect(h.player.play).toHaveBeenCalledTimes(2);
  });

  it('cancels a pending old seek when the next step has no recording', async () => {
    const h = harness(false, false, missingSources);
    let finishSeek!: () => void;
    h.player.seekTo.mockReturnValueOnce(
      new Promise<void>((done) => {
        finishSeek = done;
      }),
    );
    h.render();
    const missing = h.render({ step: 'sustainability' });
    finishSeek();
    missing.replay();
    await settle();
    expect(h.player.play).not.toHaveBeenCalled();
  });

  it('restores the English source after leaving an unavailable Arabic step', async () => {
    const h = harness(false, false, missingSources);
    h.render({ step: 'sustainability' });
    const english = h.render({ step: 'sustainability', locale: 'en' });
    await settle();
    expect(english.hasSource).toBe(true);
    expect(h.useAudioPlayer).toHaveBeenLastCalledWith(sources.en.sustainability, {
      updateInterval: 120,
    });
    expect(h.player.play).toHaveBeenCalledOnce();
  });

  it('keeps an available source replayable after a player error', async () => {
    const h = harness(false, true);
    const narrator = h.render();
    expect(narrator).toMatchObject({ hasSource: true, status: 'unavailable' });
    await settle();
    narrator.replay();
    await settle();
    expect(h.player.play).toHaveBeenCalledTimes(2);
  });
});
