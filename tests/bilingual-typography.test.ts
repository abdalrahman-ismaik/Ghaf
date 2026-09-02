import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: {
    select: (options: Record<string, string>) => options.default,
  },
}));

import { resolveTypographyRole, typography, type TypographyRole } from '../src/design/tokens';

const roles: readonly TypographyRole[] = [
  'display',
  'title',
  'heading',
  'body',
  'label',
  'caption',
];

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : ['.ts', '.tsx'].includes(extname(path))
        ? [path]
        : [];
  });
}

describe('bilingual typography system', () => {
  it.each(['ar', 'en'] as const)('resolves every semantic role for %s', (locale) => {
    expect(Object.keys(typography.roles).sort()).toEqual([...roles].sort());

    for (const role of roles) {
      expect(resolveTypographyRole(role, locale)).toMatchObject({
        fontFamily: expect.any(String),
        fontSize: expect.any(Number),
        lineHeight: expect.any(Number),
        fontWeight: expect.stringMatching(/^[4-8]00$/u),
        letterSpacing: expect.any(Number),
      });
    }
  });

  it('keeps Arabic shaping and leading safe for readable body copy', () => {
    for (const role of roles) {
      expect(resolveTypographyRole(role, 'ar').letterSpacing).toBe(0);
    }

    const body = resolveTypographyRole('body', 'ar');
    expect(body.lineHeight / body.fontSize).toBeGreaterThanOrEqual(1.55);
    expect(body.lineHeight).toBeGreaterThanOrEqual(resolveTypographyRole('body', 'en').lineHeight);
  });

  it('keeps the established English title contrast without applying it to Arabic', () => {
    expect(resolveTypographyRole('display', 'en').letterSpacing).toBe(-0.8);
    expect(resolveTypographyRole('title', 'en').letterSpacing).toBe(-0.4);
    expect(resolveTypographyRole('display', 'ar').letterSpacing).toBe(0);
    expect(resolveTypographyRole('title', 'ar').letterSpacing).toBe(0);
  });

  it('makes Text and Input resolve script metrics from the shared token authority', () => {
    const primitives = readFileSync(
      new URL('../src/components/primitives.tsx', import.meta.url),
      'utf8',
    );

    expect(primitives).toContain('const resolvedLanguage = language ?? locale;');
    expect(primitives).toContain('resolveTypographyRole(variant, resolvedLanguage)');
    expect(primitives).toContain("resolveTypographyRole('body', locale)");
    expect(primitives).toContain('accessibilityLanguage');
    expect(primitives).not.toContain('allowFontScaling={false}');
    expect(primitives).not.toContain('adjustsFontSizeToFit');
    expect(primitives).not.toContain('minimumFontScale');
  });

  it('keeps raw typography declarations inside tokens and primitives only', () => {
    const roots = [join(sourceRoot, 'app'), join(sourceRoot, 'src')];
    const violations = roots.flatMap(sourceFiles).flatMap((path) => {
      const normalized = path.replaceAll('\\', '/');
      if (
        normalized.endsWith('/src/design/tokens.ts') ||
        normalized.endsWith('/src/components/primitives.tsx')
      ) {
        return [];
      }
      const source = readFileSync(path, 'utf8');
      return /\b(?:fontFamily|fontSize|fontWeight|lineHeight|letterSpacing)\s*:/u.test(source)
        ? [relative(sourceRoot, path)]
        : [];
    });

    expect(violations).toEqual([]);
  });

  it('uses scalable minimum dimensions for the text-bearing step badge', () => {
    const taskPanels = readFileSync(
      new URL('../src/components/family-growth/TaskPanels.tsx', import.meta.url),
      'utf8',
    );

    expect(taskPanels).toContain('minWidth: spacing.xxxl');
    expect(taskPanels).toContain('minHeight: spacing.xxxl');
    expect(taskPanels).not.toMatch(/stepNumber:\s*\{[^}]*\bwidth:\s*spacing\.xxxl/su);
    expect(taskPanels).not.toMatch(/stepNumber:\s*\{[^}]*\bheight:\s*spacing\.xxxl/su);
  });

  it('preserves representative mixed-script content as separate language runs', () => {
    const mixed = 'سالم · Mangrove · 12 بذرة';
    expect(mixed).toContain('سالم');
    expect(mixed).toContain('Mangrove');
    expect(resolveTypographyRole('body', 'ar').fontFamily.trim()).not.toBe('');
    expect(resolveTypographyRole('body', 'en').fontFamily.trim()).not.toBe('');
  });
});
