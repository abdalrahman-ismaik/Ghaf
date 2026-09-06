import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ConfigContext } from 'expo/config';
import { describe, expect, it } from 'vitest';

import createExpoConfig from '../app.config';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const packageJson = JSON.parse(readFileSync(join(sourceRoot, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe('Android runtime readiness', () => {
  it('uses the Expo SDK 57 compatible package patches without unused audio or form libraries', () => {
    expect(packageJson.dependencies).toMatchObject({
      expo: '~57.0.19',
      'expo-constants': '~57.0.17',
      'expo-linking': '~57.0.9',
      'expo-router': '~57.0.18',
    });

    for (const dependency of ['expo-audio', 'react-hook-form', '@hookform/resolvers']) {
      expect(packageJson.dependencies[dependency]).toBeUndefined();
    }
  });

  it('keeps the managed Android build private and blocks unused sensitive permissions', () => {
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
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ]),
    );
    expect(config.plugins).not.toContain('expo-audio');
    expect(config.plugins?.flat()).not.toContain('expo-audio');
    expect(config.plugins).toContainEqual([
      'expo-localization',
      { supportedLocales: { android: ['ar', 'en'], ios: ['ar', 'en'] } },
    ]);
  });

  it('uses one mounted locale effect without forcing native direction at runtime', () => {
    const layout = readFileSync(join(sourceRoot, 'app/_layout.tsx'), 'utf8');
    const languageSwitcher = readFileSync(
      join(sourceRoot, 'src/components/LanguageSwitcher.tsx'),
      'utf8',
    );
    const localization = readFileSync(join(sourceRoot, 'src/i18n/index.ts'), 'utf8');

    expect(layout).toContain('void setI18nLocale(locale)');
    expect(layout).toContain('style={[styles.root, { direction }]}');
    expect(languageSwitcher).not.toMatch(/setI18nLocale|configureNativeDirection|I18nManager/);
    expect(`${layout}\n${localization}`).not.toMatch(/forceRTL|configureNativeDirection/);

    const presentationSource = [
      ...sourceFiles(join(sourceRoot, 'app')),
      ...sourceFiles(join(sourceRoot, 'src/components')),
    ]
      .filter((path) => ['.ts', '.tsx'].includes(extname(path)))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(presentationSource).not.toContain("flexDirection: 'row-reverse'");
  });

  it('clears protected stacks and keeps headings, touch targets, and narrow headers accessible', () => {
    const navigation = readFileSync(join(sourceRoot, 'src/utils/navigation.ts'), 'utf8');
    const primitives = readFileSync(join(sourceRoot, 'src/components/primitives.tsx'), 'utf8');
    const journey = readFileSync(join(sourceRoot, 'src/components/journey.tsx'), 'utf8');
    const voice = readFileSync(
      join(sourceRoot, 'src/components/family-growth/SyntheticVoicePanel.tsx'),
      'utf8',
    );

    expect(navigation).toMatch(/replaceStackWithRoute[\s\S]*router\.dismissAll\(\)/);
    expect(readFileSync(join(sourceRoot, 'app/role.tsx'), 'utf8')).toContain(
      'replaceStackWithRoute(router, handoffRoute)',
    );
    expect(primitives).not.toMatch(/variant === 'display'[\s\S]*variant === 'heading'/);
    expect(journey).toContain('accessibilityRole="header"');
    expect(primitives).toContain('minHeight: layout.touchTarget');
    expect(journey).toContain("flexWrap: 'wrap'");
    expect(voice.match(/variant="secondary"/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it('keeps exactly the ten authored product routes', () => {
    const routes = sourceFiles(join(sourceRoot, 'app'))
      .filter((path) => ['.ts', '.tsx'].includes(extname(path)))
      .map((path) => relative(join(sourceRoot, 'app'), path).replaceAll('\\', '/'))
      .filter((path) => !path.startsWith('_') && !path.startsWith('+'))
      .sort();

    expect(routes).toEqual([
      'child/index.tsx',
      'child/task.tsx',
      'circle.tsx',
      'garden.tsx',
      'index.tsx',
      'parent/check-in.tsx',
      'parent/index.tsx',
      'parent/task/new.tsx',
      'parent/task/review.tsx',
      'role.tsx',
    ]);
    expect(routes).toHaveLength(10);
  });
});
