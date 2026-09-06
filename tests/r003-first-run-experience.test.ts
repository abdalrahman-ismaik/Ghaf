import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  classifyExperiencePath,
  initialFirstRunState,
  ONBOARDING_STEPS,
  reduceFirstRunState,
  shouldShowSectionTransition,
} from '../src/components/onboarding/experienceModel';
import { resources } from '../src/i18n/resources';

const repositoryRoot = resolve(import.meta.dirname, '..');

function source(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function listTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(child);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [child] : [];
  });
}

function authoredRoutes(): string[] {
  const appRoot = resolve(repositoryRoot, 'app');
  return listTsxFiles(appRoot)
    .map((file) => relative(appRoot, file).split(sep).join('/'))
    .filter((file) => !file.endsWith('_layout.tsx') && file !== '+html.tsx');
}

describe('R003 first-run experience', () => {
  it('moves through exactly three optional moments without granting an experience', () => {
    expect(ONBOARDING_STEPS).toEqual(['choose', 'support', 'growth']);
    expect(initialFirstRunState).toEqual({ completed: false, step: 'choose' });

    const support = reduceFirstRunState(initialFirstRunState, { type: 'next' });
    expect(support).toEqual({ completed: false, step: 'support' });
    expect(reduceFirstRunState(support, { type: 'back' })).toEqual(initialFirstRunState);

    const growth = reduceFirstRunState(support, { type: 'next' });
    expect(growth).toEqual({ completed: false, step: 'growth' });
    expect(reduceFirstRunState(growth, { type: 'start' })).toEqual({
      completed: true,
      step: 'growth',
    });
    expect(reduceFirstRunState(initialFirstRunState, { type: 'skip' })).toEqual({
      completed: true,
      step: 'choose',
    });
  });

  it('buffers only directed major context handoffs and never same-role navigation', () => {
    expect(classifyExperiencePath('/', null)).toBe('welcome');
    expect(classifyExperiencePath('/access/parent/sign-in', null)).toBe('parent-access');
    expect(classifyExperiencePath('/access/child/pin', null)).toBe('child-access');
    expect(classifyExperiencePath('/parent/tasks', 'parent')).toBe('parent-experience');
    expect(classifyExperiencePath('/child/task', 'child')).toBe('child-experience');
    expect(classifyExperiencePath('/garden', 'parent')).toBe('parent-experience');
    expect(classifyExperiencePath('/garden', 'child')).toBe('child-experience');

    expect(shouldShowSectionTransition('welcome', 'parent-access')).toBe(true);
    expect(shouldShowSectionTransition('welcome', 'child-access')).toBe(true);
    expect(shouldShowSectionTransition('parent-access', 'parent-experience')).toBe(true);
    expect(shouldShowSectionTransition('child-access', 'child-experience')).toBe(true);
    expect(shouldShowSectionTransition('parent-experience', 'parent-experience')).toBe(false);
    expect(shouldShowSectionTransition('child-experience', 'child-experience')).toBe(false);
    expect(shouldShowSectionTransition('parent-access', 'welcome')).toBe(false);
  });

  it('uses local raster-only first-run presentation and the official raster logo', () => {
    const onboarding = source('src/components/onboarding/FirstRunOnboarding.tsx');
    const logo = source('src/components/onboarding/GhafRasterLogo.tsx');
    const splash = source('src/components/onboarding/BrandedSplash.tsx');
    const transition = source('src/components/onboarding/SectionTransitionOverlay.tsx');
    const rootLayout = source('app/_layout.tsx');
    const welcome = source('app/index.tsx');
    const combined = `${onboarding}\n${logo}\n${splash}\n${transition}`;

    expect(authoredRoutes()).toHaveLength(37);
    expect(combined).not.toMatch(/react-native-svg|<Svg|GhafMark|GhafIcon/u);
    expect(combined).not.toMatch(/https?:\/\//u);
    expect(logo).toContain("from 'expo-image'");
    expect(logo).toContain("require('../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png')");
    expect(onboarding).toContain('LocalIllustration');
    expect(onboarding).toContain('accessibilityLiveRegion="polite"');
    expect(onboarding).toContain('useReducedMotion');
    expect(transition).toContain('shouldShowSectionTransition');
    expect(rootLayout).toContain('SplashScreen.preventAutoHideAsync');
    expect(rootLayout).toContain('SplashScreen.hideAsync');
    expect(rootLayout).toContain('<SectionTransitionOverlay');
    expect(welcome).toContain('<FirstRunOnboarding');
    expect(welcome).toContain("activeExperience === 'parent'");
    expect(welcome).toContain("activeExperience === 'child'");
  });

  it('keeps equivalent Arabic and English first-run resources', () => {
    const arabic = resources.ar.translation.firstRun;
    const english = resources.en.translation.firstRun;

    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    expect(arabic.steps).toHaveLength(3);
    expect(english.steps).toHaveLength(3);
    for (const locale of [arabic, english]) {
      expect(locale.skip.length).toBeGreaterThan(0);
      expect(locale.next.length).toBeGreaterThan(0);
      expect(locale.start.length).toBeGreaterThan(0);
      expect(locale.loading.opening.length).toBeGreaterThan(0);
      for (const step of locale.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
        expect(step.imageAlt.length).toBeGreaterThan(0);
      }
    }
  });
});
