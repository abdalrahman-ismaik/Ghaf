import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ConfigContext } from 'expo/config';
import { describe, expect, it } from 'vitest';

import createExpoConfig from '../../app.config';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const packageJson = JSON.parse(readFileSync(join(sourceRoot, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

describe('Android runtime readiness', () => {
  it('retains the required Expo SDK 57 native runtime packages', () => {
    for (const dependency of [
      'expo',
      'expo-asset',
      'expo-audio',
      'expo-constants',
      'expo-crypto',
      'expo-file-system',
      'expo-font',
      'expo-image',
      'expo-linking',
      'expo-localization',
      'expo-router',
      'expo-splash-screen',
      'expo-sqlite',
    ]) {
      expect(packageJson.dependencies[dependency], dependency).toMatch(/^~57\./);
    }
  });

  it('disables Android backups, resizes for the keyboard, and blocks shared-storage permissions', () => {
    const config = createExpoConfig({
      config: { name: 'fixture', slug: 'fixture' },
    } as ConfigContext);
    const blockedPermissions = config.android?.blockedPermissions ?? [];

    expect(config.android).toMatchObject({
      allowBackup: false,
      predictiveBackGestureEnabled: true,
      softwareKeyboardLayoutMode: 'resize',
    });
    expect(blockedPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ]),
    );
    expect(blockedPermissions).not.toContain('android.permission.RECORD_AUDIO');
    expect(blockedPermissions).not.toContain('android.permission.MODIFY_AUDIO_SETTINGS');
  });

  it('configures approved voice capture without background recording or playback', () => {
    const config = createExpoConfig({
      config: { name: 'fixture', slug: 'fixture' },
    } as ConfigContext);

    expect(config.plugins).toContainEqual([
      'expo-audio',
      expect.objectContaining({
        recordAudioAndroid: true,
        enableBackgroundRecording: false,
        enableBackgroundPlayback: false,
      }),
    ]);
    expect(config.plugins).toEqual(
      expect.arrayContaining(['expo-router', 'expo-image', 'expo-sqlite']),
    );
  });

  it('declares Arabic and English support for the managed native build', () => {
    const config = createExpoConfig({
      config: { name: 'fixture', slug: 'fixture' },
    } as ConfigContext);

    expect(config.plugins).toContainEqual([
      'expo-localization',
      { supportedLocales: { android: ['ar', 'en'], ios: ['ar', 'en'] } },
    ]);
  });

  it('keeps headings, touch targets, and wrapping header actions accessible', () => {
    const primitives = readFileSync(join(sourceRoot, 'src/components/primitives.tsx'), 'utf8');
    const journey = readFileSync(join(sourceRoot, 'src/components/journey.tsx'), 'utf8');
    const headerActions = journey.match(/headerActions:\s*\{([^}]+)\}/)?.[1] ?? '';

    expect(journey).toContain('accessibilityRole="header"');
    expect(primitives).toContain('minHeight: layout.touchTarget');
    expect(headerActions).toContain('minHeight: layout.touchTarget');
    expect(headerActions).toContain("flexWrap: 'wrap'");
  });
});
