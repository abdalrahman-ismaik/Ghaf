import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  classifyExperiencePath,
  initialFirstRunState,
  ONBOARDING_PILLARS,
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
  it('introduces Ghaf before Family, Sustainability, and bounded AI without granting an experience', () => {
    expect(ONBOARDING_STEPS).toEqual([
      'intro',
      'family',
      'sustainability',
      'ai',
      'support',
      'growth',
    ]);
    expect(ONBOARDING_PILLARS).toEqual(['family', 'sustainability', 'ai']);
    expect(initialFirstRunState).toEqual({ completed: false, step: 'intro' });

    const family = reduceFirstRunState(initialFirstRunState, { type: 'next' });
    expect(family).toEqual({ completed: false, step: 'family' });
    expect(reduceFirstRunState(family, { type: 'back' })).toEqual(initialFirstRunState);

    const sustainability = reduceFirstRunState(family, { type: 'next' });
    expect(sustainability).toEqual({ completed: false, step: 'sustainability' });
    expect(reduceFirstRunState(sustainability, { type: 'back' })).toEqual(family);

    const ai = reduceFirstRunState(sustainability, { type: 'next' });
    expect(ai).toEqual({ completed: false, step: 'ai' });
    expect(reduceFirstRunState(ai, { type: 'back' })).toEqual(sustainability);

    const support = reduceFirstRunState(ai, { type: 'next' });
    expect(support).toEqual({ completed: false, step: 'support' });
    expect(reduceFirstRunState(support, { type: 'back' })).toEqual(ai);

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

  it('lets the family inspect only the three onboarding pillars', () => {
    for (const pillar of ONBOARDING_PILLARS) {
      expect(
        reduceFirstRunState(initialFirstRunState, { type: 'goToPillar', step: pillar }),
      ).toEqual({ completed: false, step: pillar });
    }

    expect(
      reduceFirstRunState(initialFirstRunState, {
        type: 'goToPillar',
        step: 'growth' as (typeof ONBOARDING_PILLARS)[number],
      }),
    ).toEqual(initialFirstRunState);
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
    const rasterPresentation = `${logo}\n${brandLockup}\n${splash}\n${transition}`;

    expect(authoredRoutes()).toHaveLength(37);
    expect(rasterPresentation).not.toMatch(/react-native-svg|<Svg|GhafMark/u);
    expect(`${onboarding}\n${rasterPresentation}`).not.toMatch(/https?:\/\//u);
    expect(logo).toContain("from 'expo-image'");
    expect(logo).toContain("require('../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png')");
    expect(onboarding).toContain('LocalIllustration');
    expect(onboarding).toContain('accessibilityLiveRegion="polite"');
    expect(onboarding).toContain('useReducedMotion');
    expect(onboarding).toContain('first-run-pillar-');
    expect(onboarding).toContain('accessibilityState={{ selected:');
    expect(onboarding).toContain("type: 'goToPillar'");
    expect(onboarding).toContain('withDelay');
    expect(onboarding).toContain('testID="first-run-visual-story"');
    expect(onboarding).toContain('scale:');
    expect(onboarding).toContain('aspectRatio: 3 / 2');
    expect(onboarding).not.toContain('heroHeight');
    expect(onboarding).not.toContain('heroAccent');
    expect(onboarding).toContain("from 'react-native-svg'");
    expect(onboarding).toContain('ImagePerimeterProgress');
    expect(onboarding).toContain('AnimatedPath');
    expect(onboarding).toContain('strokeDasharray: [');
    expect(onboarding).toContain('PERIMETER_BRANCH_LENGTH * progress.get()');
    expect(onboarding).not.toContain('strokeDashoffset');
    expect(onboarding).toContain('`A ${PERIMETER_RADIUS} ${PERIMETER_RADIUS}');
    expect(onboarding).not.toContain('vectorEffect');
    expect(onboarding).toContain('INITIAL_PERIMETER_PROGRESS');
    expect(onboarding).toContain('ONBOARDING_STEPS.length - 1');
    expect(onboarding).toContain('accessibilityElementsHidden');
    expect(onboarding).toContain('testID="first-run-image-progress"');
    expect(onboarding).toContain('testID="first-run-progress"');
    expect(onboarding.indexOf('testID="first-run-progress"')).toBeGreaterThan(
      onboarding.indexOf('testID="first-run-visual-story"'),
    );
    expect(onboarding).toContain('testID="first-run-navigation-actions"');
    expect(onboarding.indexOf('testID="first-run-progress"')).toBeLessThan(
      onboarding.indexOf('testID="first-run-navigation-actions"'),
    );
    expect(onboarding).toContain('styles.progressRow');
    expect(onboarding).toContain('styles.dots');
    expect(onboarding).toContain('styles.dotActive');
    expect(onboarding).not.toContain('progressSegment');
    expect(onboarding).not.toContain('styles.storyProgress');
    expect(onboarding.match(/align="center"/gu)?.length).toBeGreaterThanOrEqual(3);
    expect(onboarding).toContain('useOnboardingNarrator');
    expect(onboarding).not.toMatch(
      /(?:height|width|margin|padding)\s*:\s*[^,\n]*Progress\.get\(\)/u,
    );
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

  it('keeps nine startup rasters and the 41-image post-paint queue', () => {
    const registry = source('src/components/illustrations/illustrationSources.ts');
    const manifest = JSON.parse(source('assets/images/illustrations/r003/ASSET_MANIFEST.json')) as {
      readonly assets: readonly { readonly id: string }[];
    };
    const listStart = registry.indexOf('export const onboardingArtworkIds = [');
    const listEnd = registry.indexOf('] as const satisfies readonly ArtworkId[];', listStart);
    const onboardingIds = registry.slice(listStart, listEnd).match(/'onboarding-[a-z-]+'/gu);
    const signedOutArtworkIds = new Set([
      'field-paper',
      'welcome-ghaf-habitat',
      ...(onboardingIds ?? []).map((id) => id.slice(1, -1)),
    ]);

    expect(onboardingIds).toHaveLength(6);
    expect(signedOutArtworkIds.size + 1).toBe(9);
    expect(manifest.assets.length - signedOutArtworkIds.size + 1).toBe(41);
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
    const updates: {
      readonly failed: number;
      readonly presentationReady: boolean;
      readonly settled: number;
      readonly total: number;
    }[] = [];

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
    expect(arabic.steps).toHaveLength(6);
    expect(english.steps).toHaveLength(6);
    expect(arabic.steps[0]?.title).toContain('غاف');
    expect(english.steps[0]?.title).toContain('Ghaf');
    expect(arabic.pillars.family).toContain('العائلة');
    expect(arabic.pillars.sustainability).toContain('الاستدامة');
    expect(arabic.pillars.ai).toContain('الذكاء');
    expect(english.pillars).toEqual({
      ai: 'AI',
      family: 'Family',
      sustainability: 'Sustainability',
    });
    expect(english.steps[3]?.body).toMatch(/Parent-approved task/iu);
    expect(english.steps[3]?.body).toMatch(/may be wrong/iu);
    expect(english.steps[3]?.body).toMatch(/adult/iu);
    expect(arabic.steps[3]?.body).toMatch(/وافق|معتمدة/u);
    expect(arabic.steps[3]?.body).toMatch(/قد (?:يخطئ|أخطئ)/u);
    expect(arabic.steps[3]?.body).toMatch(/بالغ|وليّ الأمر/u);
    expect(english.steps[0]?.title).toMatch(/I[’']m the Ghaf Guide/iu);
    expect(arabic.steps[0]?.title).toContain('دليل غاف');
    expect(english.narrator).toEqual(
      expect.objectContaining({
        replay: expect.any(String),
        unavailable: expect.any(String),
      }),
    );
    for (const locale of [arabic, english]) {
      expect(locale.skip.length).toBeGreaterThan(0);
      expect(locale.next.length).toBeGreaterThan(0);
      expect(locale.start.length).toBeGreaterThan(0);
      expect(locale.loading.opening.length).toBeGreaterThan(0);
      for (const step of locale.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
        expect(step.imageAlt.length).toBeGreaterThan(0);
        expect(step.title.trim().split(/\s+/u).length).toBeLessThanOrEqual(7);
        expect(step.body.trim().split(/\s+/u).length).toBeLessThanOrEqual(22);
      }
    }
  });

  it('uses prepared local narration and quiet foreground ambience after the slide settles', () => {
    const narration = source('src/components/onboarding/useOnboardingNarrator.ts');
    const playback = source('src/features/onboarding/playback.ts');
    const ambience = source('src/components/onboarding/useOnboardingAmbience.ts');
    const audioSources = source('src/components/onboarding/onboardingAudioSources.ts');
    const illustration = source('src/components/illustrations/LocalIllustration.tsx');
    const onboarding = source('src/components/onboarding/FirstRunOnboarding.tsx');
    const packageJson = JSON.parse(source('package.json')) as {
      readonly dependencies: Readonly<Record<string, string>>;
    };

    expect(packageJson.dependencies['expo-audio']).toMatch(/^~57\./u);
    expect(packageJson.dependencies['expo-speech']).toBeUndefined();
    expect(narration).toContain("from 'expo-audio'");
    expect(narration).toContain('onboardingNarrationSources[locale][step]');
    expect(narration).toContain('readonly ready: boolean');
    expect(narration).toContain("Platform.OS === 'web' ? false : null");
    expect(narration).toContain("if (Platform.OS === 'web') return");
    expect(narration).toContain('AccessibilityInfo.isScreenReaderEnabled()');
    expect(narration).toMatch(/addEventListener\(\s*'screenReaderChanged'/u);
    expect(playback).toContain('player.play()');
    expect(playback).toContain('player.pause()');
    expect(playback).toContain('player.seekTo(0)');
    expect(narration).toContain('createOnboardingPlayback(player)');
    expect(narration).toContain('return () => playback.setEnabled(false)');
    expect(onboarding).toContain('ready: playbackReady && narration.screenReaderReady');
    expect(narration).toContain('!ready ||');
    expect(narration).toContain('screenReaderEnabled !== false ||');
    expect(narration).toContain("Platform.OS === 'web' && !webPlaybackUnlocked");
    expect(ambience).toContain("from 'expo-audio'");
    expect(ambience).toContain('onboardingAmbienceSource');
    expect(ambience).toContain('player.loop = true');
    expect(ambience).toContain('player.volume = narrationPlaying');
    expect(ambience).toContain('player.pause()');
    expect(ambience).toContain('runOptionalAudio(() => player.pause())');
    expect(ambience).toContain('runOptionalAudio(() => player.play())');
    expect(ambience).toContain('runOptionalAudio(() => configureAmbiencePlayer(player))');
    expect(ambience).toContain(
      'runOptionalAudio(() => setAmbienceVolume(player, narrationPlaying))',
    );
    expect(ambience).toContain('shouldPlayInBackground: false');
    expect(ambience).toContain("Platform.OS === 'web' && !webPlaybackUnlocked");
    expect(
      audioSources.match(/require\('\.\.\/\.\.\/\.\.\/assets\/audio\/onboarding\//gu),
    ).toHaveLength(13);
    expect(audioSources).not.toMatch(/https?:\/\//u);
    expect(illustration).toContain('readonly onSettled?: () => void');
    expect(illustration).toContain('onLoad={onSettled}');
    expect(onboarding).toContain('onSettled={() => setImageReadyStep(state.step)}');
    expect(onboarding).toContain('ready: playbackReady');
    expect(onboarding).not.toContain('first-run-narrator');
    expect(onboarding).not.toContain('first-run-narration-toggle');
    expect(onboarding).toContain('first-run-narration-replay');
    expect(onboarding).toContain('<IconButton');
    expect(onboarding).toContain('name="speaker"');
    expect(onboarding).toContain('size={24}');
    expect(onboarding).not.toContain('narration.toggle');
    expect(`${narration}\n${ambience}\n${audioSources}`).not.toMatch(
      /AudioRecorder|requestRecordingPermissions|SpeechRecognition|fetch\(|https?:\/\//u,
    );

    const audioDirectory = resolve(repositoryRoot, 'assets/audio/onboarding');
    for (const file of [
      'ambience-nature-v1.mp3',
      ...['ar', 'en'].flatMap((locale) =>
        ONBOARDING_STEPS.map((step) => `narration-${locale}-${step}-v1.mp3`),
      ),
    ]) {
      expect(statSync(resolve(audioDirectory, file)).size, file).toBeGreaterThan(1_000);
    }
    expect(source('assets/audio/onboarding/README.md')).toMatch(/prepared synthetic|اصطناعي/iu);
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
