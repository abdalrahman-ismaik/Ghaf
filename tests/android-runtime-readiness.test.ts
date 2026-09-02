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
