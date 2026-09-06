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
import { settleImageSourcesInBatches } from '../src/features/startup/settleImageSourcesInBatches';
import { settleStartupImageSources } from '../src/features/startup/settleStartupImageSources';
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
  it('introduces Ghaf before three feature moments without granting an experience', () => {
    expect(ONBOARDING_STEPS).toEqual(['intro', 'choose', 'support', 'growth']);
    expect(initialFirstRunState).toEqual({ completed: false, step: 'intro' });

    const choose = reduceFirstRunState(initialFirstRunState, { type: 'next' });
    expect(choose).toEqual({ completed: false, step: 'choose' });
    expect(reduceFirstRunState(choose, { type: 'back' })).toEqual(initialFirstRunState);

    const support = reduceFirstRunState(choose, { type: 'next' });
    expect(support).toEqual({ completed: false, step: 'support' });
    expect(reduceFirstRunState(support, { type: 'back' })).toEqual(choose);

    const growth = reduceFirstRunState(support, { type: 'next' });
    expect(growth).toEqual({ completed: false, step: 'growth' });
    expect(reduceFirstRunState(growth, { type: 'start' })).toEqual({
      completed: true,
      step: 'growth',
    });
    expect(reduceFirstRunState(initialFirstRunState, { type: 'skip' })).toEqual({
      completed: true,
      step: 'intro',
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

  it('uses local raster-only first-run presentation and section-scoped asset loading', () => {
    const onboarding = source('src/components/onboarding/FirstRunOnboarding.tsx');
    const logo = source('src/components/brand/GhafRasterLogo.tsx');
    const brandLockup = source('src/components/brand/GhafBrandLockup.tsx');
    const accessShell = source('src/components/access/AccessShell.tsx');
    const splash = source('src/components/onboarding/BrandedSplash.tsx');
    const transition = source('src/components/onboarding/SectionTransitionOverlay.tsx');
    const rootLayout = source('app/_layout.tsx');
    const deferredImages = source('src/features/startup/preloadDeferredImages.ts');
    const localImageLoader = source('src/features/startup/loadLocalImage.ts');
    const startupImages = source('src/features/startup/preloadStartupImages.ts');
    const tokens = source('src/design/tokens.ts');
    const welcome = source('app/index.tsx');
    const combined = `${onboarding}\n${logo}\n${brandLockup}\n${splash}\n${transition}`;

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
    expect(rootLayout).toContain('firstRunMotion.splashHold');
    expect(rootLayout).toContain('firstRunMotion.loadingHold');
    expect(rootLayout).toContain('preloadStartupImages');
    expect(rootLayout).toContain('preloadDeferredImages');
    expect(rootLayout).toContain('fontsSettled && imagesSettled');
    expect(rootLayout).toContain('presentationReady');
    expect(rootLayout).toContain('nativeSplashHidden');
    expect(startupImages).not.toContain('Object.values(artworkSources)');
    expect(startupImages).not.toContain('preparedMediaImageSources');
    expect(startupImages).toContain('officialGhafRasterLogoSource');
    expect(startupImages).toContain('onboardingArtworkIds.map');
    expect(startupImages).toContain('welcomeArtworkSource');
    expect(startupImages).toContain('preloadSectionImages');
    expect(startupImages).toContain("'parent-access'");
    expect(startupImages).toContain("'child-experience'");
    expect(startupImages).not.toContain('landscapeArtworkSources');
    expect(startupImages).not.toContain('familyCanopyArtworkSources');
    expect(startupImages).toContain("from './loadLocalImage'");
    expect(localImageLoader).toContain('Asset.fromModule(source)');
    expect(localImageLoader).toContain('.downloadAsync()');
    expect(localImageLoader).toContain('localImageLoads');
    expect(deferredImages).toContain('Object.values(sectionImageSources)');
    expect(deferredImages).toContain('Object.values(artworkSources)');
    expect(deferredImages).toContain('preparedMediaImageSources');
    expect(deferredImages).toContain('DEFERRED_IMAGE_BATCH_SIZE = 6');
    expect(deferredImages.indexOf('...remainingArtworkImageSources')).toBeLessThan(
      deferredImages.indexOf('...preparedMediaImageSources'),
    );
    expect(rootLayout).toContain("startupPhase !== 'complete'");
    expect(rootLayout.match(/requestAnimationFrame/g)?.length).toBeGreaterThanOrEqual(3);
    expect(rootLayout).not.toContain('startupReady = fontsSettled && imagesSettled &&');
    expect(transition).toContain('firstRunMotion.orientationHold');
    expect(tokens).toContain('splashHold: 2000');
    expect(tokens).toContain('loadingHold: 1000');
    expect(tokens).toContain('orientationHold: 900');
    expect(accessShell).toContain('<GhafBrandLockup');
    expect(accessShell).toContain('assetId="section-transition"');
    expect(welcome).toContain('<FirstRunOnboarding');
    expect(welcome).toContain("activeExperience === 'parent'");
    expect(welcome).toContain("activeExperience === 'child'");
  });

  it('shows an opaque two-second splash, then loading, then onboarding', () => {
    const rootLayout = source('app/_layout.tsx');
    const splash = source('src/components/onboarding/BrandedSplash.tsx');

    expect(rootLayout).toContain("useState<StartupPresentationPhase>('splash')");
    expect(rootLayout).toContain("setStartupPhase('loading')");
    expect(rootLayout).toContain("setStartupPhase('complete')");
    expect(rootLayout.indexOf("setStartupPhase('loading')")).toBeLessThan(
      rootLayout.indexOf("setStartupPhase('complete')"),
    );
    expect(rootLayout).toContain("startupPhase !== 'loading' || !startupReady");
    expect(rootLayout).toContain("startupPhase !== 'complete'");
    expect(rootLayout).toContain('<BrandedSplash phase={startupPhase}');
    expect(splash).toContain("phase === 'loading'");
    expect(splash).toContain("phase === 'complete'");
    expect(splash).toContain("'startup-splash-stage'");
    expect(splash).toContain("'startup-loading-stage'");
    expect(splash).not.toContain('entering={FadeIn');
    expect(splash).not.toContain('FadeOut');
  });

  it('settles deferred images in bounded parallel batches without rejecting the queue', async () => {
    const calls: number[] = [];
    let active = 0;
    let maxActive = 0;

    const result = await settleImageSourcesInBatches({
      batchSize: 2,
      loadImage: async (source) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        calls.push(source);
        await Promise.resolve();
        active -= 1;
        if (source === 4) throw new Error('local fallback');
      },
      sources: [1, 2, 3, 4, 5],
    });

    expect(calls).toEqual([1, 2, 3, 4, 5]);
    expect(maxActive).toBe(2);
    expect(result).toEqual({ failed: 1, settled: 5, total: 5 });
  });

  it('settles the bounded signed-out images and reports fallback failures', async () => {
    const calls: number[] = [];
    const updates: Array<{
      readonly failed: number;
      readonly presentationReady: boolean;
      readonly settled: number;
      readonly total: number;
    }> = [];

    const result = await settleStartupImageSources({
      batchSize: 2,
      criticalSources: [1, 2],
      loadImage: async (source) => {
        const id = source as number;
        calls.push(id);
        if (id === 4) throw new Error('prepared fallback');
      },
      onProgress: (progress) => updates.push(progress),
      remainingSources: [3, 4, 5],
    });

    expect(calls).toEqual([1, 2, 3, 4, 5]);
    expect(updates[0]).toEqual({
      failed: 0,
      presentationReady: true,
      settled: 2,
      total: 5,
    });
    expect(updates.at(-1)).toEqual({
      failed: 1,
      presentationReady: true,
      settled: 5,
      total: 5,
    });
    expect(result).toEqual(updates.at(-1));
  });

  it('uses one simple accessible leaf loop with a static reduced-motion state', () => {
    const splash = source('src/components/onboarding/BrandedSplash.tsx');
    const leafLoader = source('src/components/onboarding/GhafLeafLoader.tsx');
    const transition = source('src/components/onboarding/SectionTransitionOverlay.tsx');

    expect(splash).not.toContain('ActivityIndicator');
    expect(splash).not.toContain('accessibilityValue');
    expect(splash).not.toContain('splashBody');
    expect(splash).not.toContain('progressScale');
    expect(splash).toContain('<GhafLeafLoader');
    expect(transition).not.toContain('ActivityIndicator');
    expect(transition).toContain('<GhafLeafLoader');
    expect(transition).toContain('preloadSectionImages');
    expect(leafLoader).toContain('accessibilityRole="progressbar"');
    expect(leafLoader).toContain('withRepeat');
    expect(leafLoader).toContain('useSharedValue');
    expect(leafLoader).toContain('useReducedMotion');
    expect(leafLoader).toContain('Easing.linear');
    expect(leafLoader).toContain('rotate: `${rotation.get()}deg`');
    expect(leafLoader).not.toMatch(/\b(?:height|width|margin|padding)\s*:\s*with/u);
  });

  it('loads only font files used by the current branded typography roles', () => {
    const rootLayout = source('app/_layout.tsx');
    const appConfig = source('app.config.ts');

    for (const face of [
      'Alexandria_700Bold',
      'Alexandria_800ExtraBold',
      'ReadexPro_400Regular',
      'ReadexPro_500Medium',
    ]) {
      expect(rootLayout).toContain(face);
      expect(appConfig).toContain(face);
    }

    for (const unusedFace of [
      'Alexandria_400Regular',
      'ReadexPro_600SemiBold',
      'ReadexPro_700Bold',
    ]) {
      expect(rootLayout).not.toContain(unusedFace);
      expect(appConfig).not.toContain(unusedFace);
    }
  });

  it('keeps equivalent Arabic and English first-run resources', () => {
    const arabic = resources.ar.translation.firstRun;
    const english = resources.en.translation.firstRun;

    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    expect(arabic.steps).toHaveLength(4);
    expect(english.steps).toHaveLength(4);
    expect(arabic.steps[0]?.title).toContain('غاف');
    expect(english.steps[0]?.title).toContain('Ghaf');
    for (const locale of [arabic, english]) {
      expect(locale.skip.length).toBeGreaterThan(0);
      expect(locale.next.length).toBeGreaterThan(0);
      expect(locale.start.length).toBeGreaterThan(0);
      expect(locale.loading.opening.length).toBeGreaterThan(0);
      for (const step of locale.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
        expect(step.imageAlt.length).toBeGreaterThan(0);
        expect(step.title.trim().split(/\s+/u).length).toBeLessThanOrEqual(9);
        expect(step.body.trim().split(/\s+/u).length).toBeLessThanOrEqual(28);
      }
    }
  });

  it('inherits one shared raster brand shell across every access route', () => {
    const accessRoutes = [
      'app/access/child/index.tsx',
      'app/access/child/pin.tsx',
      'app/access/child/pair.tsx',
      'app/access/parent/sign-in.tsx',
      'app/access/parent/sign-up.tsx',
      'app/access/parent/verification.tsx',
      'app/access/parent/family-basics.tsx',
      'app/access/parent/add-first-child.tsx',
      'app/access/parent/review-create.tsx',
    ];

    for (const route of accessRoutes) {
      expect(source(route), route).toContain('<AccessHeader');
    }
  });
});
