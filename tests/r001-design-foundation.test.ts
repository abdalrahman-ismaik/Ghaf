import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import {
  colors,
  fontFamilies,
  layout,
  motion,
  radii,
  r001Motion,
  r001Radii,
  r001Shadows,
  resolveR001TypographyRole,
  r001Typography,
  shadows,
} from '../src/design/tokens';

vi.mock('react-native', () => ({
  Platform: {
    select: (options: Record<string, string>) => options.default,
  },
}));

const root = fileURLToPath(new URL('../', import.meta.url));

const styledAccessFiles = [
  'src/components/access/AccessControls.tsx',
  'src/components/access/AccessShell.tsx',
  'src/components/access/BotanicalAvatar.tsx',
  'src/components/access/GhafIcon.tsx',
  'src/components/access/SuccessSheet.tsx',
] as const;

const accessBarrel = 'src/components/access/index.ts';

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

describe('R001 native design foundation', () => {
  it('defines the approved visual, spacing, radius, and font-role contract', () => {
    expect(colors.primary).toBe('#00503B');
    expect(colors.ghafEmerald).toBe('#126A50');
    expect(colors.pearlGround).toBe('#F7F8F3');
    expect(layout.screenPadding).toBe(20);
    expect(layout.touchTarget).toBeGreaterThanOrEqual(48);
    expect(layout.controlHeight).toBeGreaterThanOrEqual(48);
    expect(r001Radii.lg).toBe(16);
    expect(r001Radii.sheet).toBeGreaterThan(r001Radii.lg);

    expect(fontFamilies.runtime.alexandriaExtraBold).toBe('Alexandria_800ExtraBold');
    expect(fontFamilies.runtime.readexSemiBold).toBe('ReadexPro_600SemiBold');
    expect(r001Typography.roles.hero.family).toBe('alexandria');
    expect(r001Typography.roles.body.family).toBe('readexPro');

    expect(resolveR001TypographyRole('hero', 'ar', true)).toMatchObject({
      fontFamily: 'Alexandria_700Bold',
      fontSize: 32,
      letterSpacing: 0,
    });
    expect(resolveR001TypographyRole('body', 'ar', true)).toMatchObject({
      fontFamily: 'ReadexPro_400Regular',
      fontSize: 16,
      lineHeight: 26,
      letterSpacing: 0,
    });
    expect(resolveR001TypographyRole('body', 'en', false).fontFamily).toBe(
      fontFamilies.fallback.en,
    );
  });

  it('preserves every legacy visual token while adding scoped R001 geometry and motion', () => {
    expect(colors).toMatchObject({
      ghaf: '#1D684F',
      ghafPressed: '#14513E',
      forest: '#12372D',
      forestSoft: '#35594D',
      leaf: '#718E6A',
      leafLight: '#DCE5D7',
      leafMist: '#EDF1E8',
      mangrove: '#246B64',
      water: '#77A8A1',
      waterLight: '#D9E9E5',
      sand: '#CBB98F',
      sandLight: '#E9E0CC',
      ivory: '#F3F0E7',
      surface: '#FBFAF5',
      earth: '#6F513D',
      gold: '#B87524',
      goldLight: '#E7D2A5',
      goldGlow: '#F3E8D1',
      sky: '#D6E2DE',
      ink: '#172621',
      inkMuted: '#5B665F',
      line: '#CBCDC2',
      white: '#FFFFFF',
      success: '#317655',
      successLight: '#DDEBE1',
      danger: '#963E36',
      dangerLight: '#F1DEDA',
      coral: '#A94A3F',
      coralLight: '#F1DEDA',
      transparent: 'transparent',
    });
    expect(radii).toEqual({ sm: 6, md: 10, lg: 14, xl: 18, pill: 999 });
    expect(shadows).toEqual({
      soft: { boxShadow: '0 2px 10px rgba(24, 49, 39, 0.06)' },
      lifted: { boxShadow: '0 16px 40px rgba(24, 49, 39, 0.14)' },
    });
    expect(motion).toEqual({
      duration: { quick: 120, standard: 220, slow: 220, reveal: 650, growth: 650 },
      easing: [0.2, 0.8, 0.2, 1],
    });
    expect(r001Radii.lg).toBe(16);
    expect(r001Shadows.sheet.boxShadow).toContain('rgba(20, 34, 29');
    expect(r001Motion.duration.slow).toBe(280);
  });

  it('keeps the access layer native, stateless, and reusable', () => {
    for (const relativePath of styledAccessFiles) {
      expect(existsSync(`${root}${relativePath}`), relativePath).toBe(true);
      const contents = source(relativePath);
      expect(contents, relativePath).toContain('StyleSheet.create');
      expect(contents, relativePath).not.toContain('usePrototypeStore');
      expect(contents, relativePath).not.toMatch(/(?:document\.|window\.|<div|className=)/u);
      expect(contents, relativePath).not.toMatch(/tailwind|Material Symbols/iu);
    }

    expect(existsSync(`${root}${accessBarrel}`), accessBarrel).toBe(true);
    const barrel = source(accessBarrel);
    expect(barrel).toContain("export * from './AccessControls'");
    expect(barrel).toContain("export * from './AccessShell'");
    expect(barrel).toContain("export * from './BotanicalAvatar'");
    expect(barrel).toContain("export * from './GhafIcon'");
    expect(barrel).toContain("export * from './SuccessSheet'");
    expect(barrel).not.toContain('usePrototypeStore');
  });

  it('provides responsive shell, fields, OTP, selection, review, and botanical pieces', () => {
    const shell = source('src/components/access/AccessShell.tsx');
    const controls = source('src/components/access/AccessControls.tsx');
    const avatar = source('src/components/access/BotanicalAvatar.tsx');

    expect(shell).toContain('SafeAreaView');
    expect(shell).toContain('KeyboardAvoidingView');
    expect(shell).toContain('automaticallyAdjustKeyboardInsets');
    expect(shell).toContain('contentInsetAdjustmentBehavior="automatic"');
    expect(shell).toContain('maxWidth: contentMaxWidth');
    expect(controls).toContain('export function AccessTextField');
    expect(controls).toContain('export function OtpInput');
    expect(controls).toContain('export function SegmentedControl');
    expect(controls).toContain('export function ReviewRow');
    expect(controls).toContain("fontVariant: ['tabular-nums']");
    expect(avatar).toContain('export function BotanicalAvatarPicker');
    expect(avatar).toContain('ChildTreeAvatarId');
    expect(avatar).toContain("'ghaf_tree'");
    expect(avatar).toContain("ghaf_tree: 'ghaf-tree'");
    expect(avatar).toContain('accessibilityRole="radio"');
    expect(avatar).toContain('setInternalFocusedValue(id)');
  });

  it('uses one reduced-motion-safe GPU-only success reveal', () => {
    const success = source('src/components/access/SuccessSheet.tsx');

    expect(success).toContain('useReducedMotion');
    expect(success).toContain('opacity:');
    expect(success).toContain('translateY');
    expect(success).toContain('progress.get()');
    expect(success).not.toMatch(/progress\.value/u);
    expect(success).not.toMatch(/\b(?:height|width|margin|padding)\s*:\s*with/u);
    expect(success).not.toContain("from 'react-native'\n  Animated");
  });

  it('retains the baseline primitive APIs while adding explicit brand-font readiness', () => {
    const primitives = source('src/components/primitives.tsx');

    for (const exportedName of [
      'Screen',
      'Text',
      'Button',
      'PrimaryButton',
      'SecondaryButton',
      'QuietButton',
      'Card',
      'Input',
      'IconButton',
    ]) {
      expect(primitives).toContain(`export function ${exportedName}`);
    }

    expect(primitives).toContain('export function GhafFontProvider');
    expect(primitives).toContain('pressRetentionOffset');
    expect(primitives).toContain('backgroundColor: colors.ghafEmerald');
    expect(primitives).toContain('backgroundColor: colors.ghafEmeraldTint');
    expect(primitives).not.toContain('allowFontScaling={false}');
    expect(primitives).not.toContain('adjustsFontSizeToFit');
  });

  it('bundles and loads only the approved Alexandria and Readex Pro font roles', () => {
    const appConfig = source('app.config.ts');
    const rootLayout = source('app/_layout.tsx');
    const packageJson = JSON.parse(source('package.json')) as {
      dependencies: Record<string, string>;
    };

    expect(packageJson.dependencies['@expo-google-fonts/alexandria']).toBe('^0.4.2');
    expect(packageJson.dependencies['@expo-google-fonts/readex-pro']).toBe('^0.4.1');
    expect(packageJson.dependencies['expo-font']).toBe('~57.0.3');
    expect(appConfig).toContain("'expo-font'");
    expect(appConfig).toContain('Alexandria_800ExtraBold.ttf');
    expect(appConfig).toContain('ReadexPro_600SemiBold.ttf');
    expect(rootLayout).toContain("from '@expo-google-fonts/alexandria'");
    expect(rootLayout).toContain("from '@expo-google-fonts/readex-pro'");
    expect(rootLayout).toContain('<GhafFontProvider loaded={fontsLoaded}>');
  });
});
