import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { createElement, type ReactNode } from 'react';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { useDemoOnboardingNarrator } from '@/components/demo/useDemoOnboardingNarrator';

const audio = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('expo-audio', () => ({ createAudioPlayer: audio.create }));
vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AccessibilityInfo: {},
  AppState: {},
}));
vi.mock('@/components/demo/demoNarrationSources', () => ({
  getDemoNarrationSource: (locale: string, step: number | null, active: boolean) =>
    locale === 'ar' && step !== null && active ? 101 + step : null,
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};
const root = fileURLToPath(new URL('../../', import.meta.url));

// Server rendering verifies silent construction only; it does not execute effects or native events.
// Mounted lifecycle evidence uses the separately granted real ReactDOM harness, with native mocks.
describe('demo narrator server-render safety', () => {
  it.each(['ar', 'en'] as const)('allocates no player during %s rendering', (locale) => {
    function Probe() {
      const narration = useDemoOnboardingNarrator({
        locale,
        step: 0,
        active: true,
        runGeneration: 0,
        entryEpoch: 0,
      });
      return createElement(
        'output',
        null,
        JSON.stringify({
          status: narration.status,
          canPlay: narration.canPlay,
          canStop: narration.canStop,
        }),
      );
    }
    const markup = renderToStaticMarkup(createElement(Probe));
    expect(markup).toContain('unavailable');
    expect(markup).not.toContain('true');
    expect(audio.create).not.toHaveBeenCalled();
  });
});

describe('approved local demo narration source identity', () => {
  const sourcePath = resolve(root, 'src/components/demo/demoNarrationSources.ts');
  const required: string[] = [];
  const exports: {
    getDemoNarrationSource?: (locale: unknown, step: unknown, active: boolean) => unknown;
  } = {};
  const compiled = ts.transpileModule(readFileSync(sourcePath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  // Execute the actual resolver while replacing only Metro's numeric asset registration.
  runInNewContext(
    compiled.outputText,
    {
      exports,
      require: (relative: string) => {
        required.push(resolve(dirname(sourcePath), relative));
        return 100 + required.length;
      },
    },
    { filename: sourcePath },
  );
  const resolveSource = exports.getDemoNarrationSource!;
  const assets = [
    ['together', '8782ac7eb4bbd6ec04296206e700dea62562cc4b43258744c5b66caeeab19edf'],
    ['support', '3815ad0eedd67a6cd8e9446599640239732e222f04272200ecd115acf756c034'],
    ['growth', 'ff7d2ae63f6985c5a8a0d19164f52c0bd9130273d68bad37d4189fc3c7da0d5e'],
  ] as const;

  it('selects only the three exact user-approved MP3 bytes in story order', () => {
    expect(required).toHaveLength(3);
    assets.forEach(([moment, hash], step) => {
      expect(required[step]).toBe(
        resolve(root, `assets/audio/demo-onboarding/ar-${moment}-wiam-v1.mp3`),
      );
      expect(createHash('sha256').update(readFileSync(required[step]!)).digest('hex')).toBe(hash);
      expect(resolveSource('ar', [2, 4, 5][step], true)).toBe(101 + step);
    });
  });

  it('returns no source for English, inactive stories or malformed steps', () => {
    for (const step of [0, 1, 2, 3, 4, 5]) {
      expect(resolveSource('en', step, true)).toBeNull();
      expect(resolveSource('ar', step, false)).toBeNull();
    }
    for (const step of [null, undefined, -1, 0, 1, 3, 6, 0.5, NaN, '0', 'length', '__proto__']) {
      expect(resolveSource('ar', step, true)).toBeNull();
    }
    expect(resolveSource('unknown', 0, true)).toBeNull();
  });
});
