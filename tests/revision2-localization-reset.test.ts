import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { colors, fontFamilies, layout, radii, typography } from '../src/design/tokens';
import { resources } from '../src/i18n/resources';

const APPROVED_ROUTE_FILES = [
  '../app/index.tsx',
  '../app/access/parent/sign-in.tsx',
  '../app/access/parent/verification.tsx',
  '../app/access/parent/family-basics.tsx',
  '../app/access/parent/add-first-child.tsx',
  '../app/access/parent/review-create.tsx',
  '../app/access/parent/family-created-success.tsx',
] as const;

const readSource = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('approved Ghaf R001 native onboarding contract', () => {
  it('keeps the canonical palette, typography roles, shape language, and touch floor', () => {
    expect(colors).toMatchObject({
      ghafEmerald: '#126A50',
      deepForest: '#0D3128',
      pearlGround: '#F7F8F3',
      ink: '#14221D',
    });
    expect(fontFamilies).toMatchObject({
      alexandriaRegular: 'Alexandria_400Regular',
      alexandriaBold: 'Alexandria_700Bold',
      alexandriaExtraBold: 'Alexandria_800ExtraBold',
      readexRegular: 'ReadexPro_400Regular',
      readexMedium: 'ReadexPro_500Medium',
      readexSemiBold: 'ReadexPro_600SemiBold',
      readexBold: 'ReadexPro_700Bold',
    });
    expect(typography.roles.display.fontFamily).toBe(fontFamilies.alexandriaExtraBold);
    expect(typography.roles.screenTitle.fontFamily).toBe(fontFamilies.alexandriaBold);
    expect(typography.roles.body.fontFamily).toBe(fontFamilies.readexRegular);
    expect(typography.roles.control.fontFamily).toBe(fontFamilies.readexSemiBold);
    expect(layout.touchTarget).toBeGreaterThanOrEqual(48);
    expect(layout.controlHeight).toBeGreaterThanOrEqual(layout.touchTarget);
    expect(radii).toMatchObject({ md: 12, lg: 16, sheet: 28 });
  });

  it('keeps every approved screen native and independent of Stitch web runtime artifacts', () => {
    const source = APPROVED_ROUTE_FILES.map(readSource).join('\n');

    expect(source).not.toMatch(/react-native-web|code\.html|source\.html|screen\.png/u);
    expect(source).not.toMatch(/<(?:div|button|input|form|section|main)\b/u);
    expect(source).not.toMatch(/className=|document\.|window\./u);
    expect(source).not.toMatch(/\bdirection:\s*['"](?:ltr|rtl)['"]/u);
    expect(source).toContain("from 'react-native'");
  });

  it('loads Alexandria and Readex Pro from bundled packages without a remote font URL', () => {
    const layoutSource = readSource('../app/_layout.tsx');
    const configSource = readSource('../app.config.ts');
    const combined = `${layoutSource}\n${configSource}`;

    expect(combined).toContain('@expo-google-fonts/alexandria');
    expect(combined).toContain('@expo-google-fonts/readex-pro');
    expect(combined).toContain("'expo-font'");
    expect(combined).not.toMatch(/https?:\/\//u);
  });

  it('keeps access copy paired and truthful in Arabic and English', () => {
    const ar = resources.ar.translation.access;
    const en = resources.en.translation.access;

    expect(Object.keys(ar)).toEqual(Object.keys(en));
    expect(ar.verification.invalidCode).toContain('424242');
    expect(en.verification.invalidCode).toContain('424242');
    expect(ar.signIn.origin).toContain('محلية');
    expect(en.signIn.origin).toMatch(/local/i);
    expect(ar.success.origin).toContain('اصطناعي');
    expect(en.success.origin).toMatch(/synthetic/i);
  });

  it('uses a native success sheet and protects the existing Parent route family', () => {
    const successSource = readSource('../app/access/parent/family-created-success.tsx');
    const sheetSource = readSource('../src/components/access/SuccessSheet.tsx');
    const rootLayoutSource = readSource('../app/_layout.tsx');
    const parentLayoutSource = readSource('../app/parent/_layout.tsx');

    expect(successSource).toContain('<SuccessSheet');
    expect(sheetSource).toContain("from 'react-native'");
    expect(sheetSource).toContain('<Modal');
    expect(parentLayoutSource).toContain('selectIsParentAuthenticated');
    expect(parentLayoutSource).toContain('<Redirect');
    expect(rootLayoutSource).toContain("pathname === '/role'");
    expect(rootLayoutSource).toContain("pathname.startsWith('/child')");
  });
});
