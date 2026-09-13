import { useWindowDimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { AccessScreen, GhafIcon } from '@/components/access';
import { useAmbientAudio } from '@/components/audio';
import { GhafBrandLockup } from '@/components/brand/GhafBrandLockup';
import { LocalIllustration, onboardingArtworkIds } from '@/components/illustrations';
import { Button, IconButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  motion,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { ONBOARDING_PILLARS, ONBOARDING_STEPS, type OnboardingPillar } from './experienceModel';
import { useFirstRunExperience } from './FirstRunExperienceContext';
import { useOnboardingForeground } from './useOnboardingForeground';
import { useOnboardingNarrator } from './useOnboardingNarrator';

interface FirstRunStepCopy {
  readonly body: string;
  readonly imageAlt: string;
  readonly title: string;
}

interface ImagePerimeterProgressProps {
  readonly reducedMotion: boolean;
  readonly stepIndex: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const INITIAL_PERIMETER_PROGRESS = 0.06;
const PERIMETER_VIEWBOX_WIDTH = 300;
const PERIMETER_VIEWBOX_HEIGHT = 200;
const PERIMETER_INSET = 3;
const PERIMETER_RADIUS = 22;
const PERIMETER_BRANCH_LENGTH =
  PERIMETER_VIEWBOX_WIDTH -
  2 * PERIMETER_INSET -
  2 * PERIMETER_RADIUS +
  (PERIMETER_VIEWBOX_HEIGHT - 2 * PERIMETER_INSET - 2 * PERIMETER_RADIUS) +
  Math.PI * PERIMETER_RADIUS;
const PERIMETER_RIGHT_PATH = [
  `M ${PERIMETER_VIEWBOX_WIDTH / 2} ${PERIMETER_VIEWBOX_HEIGHT - PERIMETER_INSET}`,
  `H ${PERIMETER_VIEWBOX_WIDTH - PERIMETER_INSET - PERIMETER_RADIUS}`,
  `A ${PERIMETER_RADIUS} ${PERIMETER_RADIUS} 0 0 0 ${PERIMETER_VIEWBOX_WIDTH - PERIMETER_INSET} ${PERIMETER_VIEWBOX_HEIGHT - PERIMETER_INSET - PERIMETER_RADIUS}`,
  `V ${PERIMETER_INSET + PERIMETER_RADIUS}`,
  `A ${PERIMETER_RADIUS} ${PERIMETER_RADIUS} 0 0 0 ${PERIMETER_VIEWBOX_WIDTH - PERIMETER_INSET - PERIMETER_RADIUS} ${PERIMETER_INSET}`,
  `H ${PERIMETER_VIEWBOX_WIDTH / 2}`,
].join(' ');
const PERIMETER_LEFT_PATH = [
  `M ${PERIMETER_VIEWBOX_WIDTH / 2} ${PERIMETER_VIEWBOX_HEIGHT - PERIMETER_INSET}`,
  `H ${PERIMETER_INSET + PERIMETER_RADIUS}`,
  `A ${PERIMETER_RADIUS} ${PERIMETER_RADIUS} 0 0 1 ${PERIMETER_INSET} ${PERIMETER_VIEWBOX_HEIGHT - PERIMETER_INSET - PERIMETER_RADIUS}`,
  `V ${PERIMETER_INSET + PERIMETER_RADIUS}`,
  `A ${PERIMETER_RADIUS} ${PERIMETER_RADIUS} 0 0 1 ${PERIMETER_INSET + PERIMETER_RADIUS} ${PERIMETER_INSET}`,
  `H ${PERIMETER_VIEWBOX_WIDTH / 2}`,
].join(' ');

function ImagePerimeterProgress({ reducedMotion, stepIndex }: ImagePerimeterProgressProps) {
  const target =
    INITIAL_PERIMETER_PROGRESS +
    (1 - INITIAL_PERIMETER_PROGRESS) * (stepIndex / (ONBOARDING_STEPS.length - 1));
  const progress = useSharedValue(target);
  const animatedPathProps = useAnimatedProps(() => ({
    strokeDasharray: [PERIMETER_BRANCH_LENGTH * progress.get(), PERIMETER_BRANCH_LENGTH],
  }));

  useEffect(() => {
    cancelAnimation(progress);
    if (reducedMotion) {
      progress.set(target);
      return;
    }
    progress.set(
      withTiming(target, {
        duration: motion.duration.standard,
        easing: Easing.bezier(...motion.easing),
        reduceMotion: ReduceMotion.System,
      }),
    );
    return () => cancelAnimation(progress);
  }, [progress, reducedMotion, target]);

  return (
    <View
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.imagePerimeterProgress}
      testID="first-run-image-progress"
    >
      <Svg
        height="100%"
        preserveAspectRatio="none"
        viewBox={`0 0 ${PERIMETER_VIEWBOX_WIDTH} ${PERIMETER_VIEWBOX_HEIGHT}`}
        width="100%"
      >
        {[PERIMETER_LEFT_PATH, PERIMETER_RIGHT_PATH].map((path) => (
          <Path
            d={path}
            fill="none"
            key={`track-${path}`}
            stroke={colors.white}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.48}
            strokeWidth={3}
          />
        ))}
        {[PERIMETER_LEFT_PATH, PERIMETER_RIGHT_PATH].map((path) => (
          <AnimatedPath
            animatedProps={animatedPathProps}
            d={path}
            fill="none"
            key={`progress-${path}`}
            stroke={colors.solarAmber}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
        ))}
      </Svg>
    </View>
  );
}

const storyAccents = [
  colors.deepForest,
  colors.tertiary,
  colors.ghafEmerald,
  colors.mangroveTeal,
  colors.solarAmber,
  colors.deepForest,
] as const;

const pillarTones: Readonly<
  Record<OnboardingPillar, { readonly active: string; readonly idle: string }>
> = {
  family: { active: colors.tertiary, idle: colors.solarAmberTint },
  sustainability: { active: colors.primary, idle: colors.primaryFixedTint },
  ai: { active: colors.secondary, idle: colors.secondaryTint },
};

export function FirstRunOnboarding({
  narrationEnabled = true,
}: { readonly narrationEnabled?: boolean } = {}) {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const { dispatch, presentationReady, state } = useFirstRunExperience();
  const foreground = useOnboardingForeground();
  const [imageReadyStep, setImageReadyStep] = useState<(typeof ONBOARDING_STEPS)[number] | null>(
    null,
  );
  const [settledStep, setSettledStep] = useState<(typeof ONBOARDING_STEPS)[number] | null>(null);
  const { setNarrationPlaying, unlockPlayback, webPlaybackUnlocked } = useAmbientAudio();
  const visualProgress = useSharedValue(1);
  const copyProgress = useSharedValue(1);
  const stepIndex = ONBOARDING_STEPS.indexOf(state.step);
  const stepNumber = stepIndex + 1;
  const isCompactHeight = height < 760;
  const steps = t('firstRun.steps', { returnObjects: true }) as unknown as FirstRunStepCopy[];
  const step = steps[stepIndex] ?? steps[0];
  const artworkId = onboardingArtworkIds[stepIndex] ?? onboardingArtworkIds[0];
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const showPillarNavigator = stepIndex <= 3;
  const storyAccent = storyAccents[stepIndex] ?? colors.ghafEmerald;
  const slideReady = imageReadyStep === state.step && settledStep === state.step;
  const playbackReady = presentationReady && foreground && !state.completed && slideReady;
  const narration = useOnboardingNarrator({
    locale,
    ready: narrationEnabled && playbackReady,
    step: state.step,
    webPlaybackUnlocked,
  });
  const visualStyle = useAnimatedStyle(() => ({
    opacity: visualProgress.get(),
    transform: [
      { translateY: reducedMotion ? 0 : (1 - visualProgress.get()) * 8 },
      { scale: reducedMotion ? 1 : 0.985 + visualProgress.get() * 0.015 },
    ],
  }));
  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyProgress.get(),
    transform: [{ translateY: reducedMotion ? 0 : (1 - copyProgress.get()) * 8 }],
  }));
  const progressLabel = t('firstRun.progress', {
    current: stepNumber,
    total: ONBOARDING_STEPS.length,
  });
  const progressAlt = t('firstRun.progressAlt', {
    current: stepNumber,
    total: ONBOARDING_STEPS.length,
  });
  const narrationHint = narration.screenReaderActive
    ? t('firstRun.narrator.screenReader')
    : narration.status === 'unavailable'
      ? t('firstRun.narrator.unavailable')
      : t('firstRun.narrator.replayHint');

  useLayoutEffect(() => {
    cancelAnimation(visualProgress);
    cancelAnimation(copyProgress);
    if (reducedMotion) {
      visualProgress.set(1);
      copyProgress.set(1);
      return;
    }
    visualProgress.set(0);
    copyProgress.set(0);
    visualProgress.set(
      withTiming(1, {
        duration: motion.duration.standard,
        easing: Easing.bezier(...motion.easing),
        reduceMotion: ReduceMotion.System,
      }),
    );
    copyProgress.set(
      withDelay(
        45,
        withTiming(1, {
          duration: motion.duration.standard,
          easing: Easing.bezier(...motion.easing),
          reduceMotion: ReduceMotion.System,
        }),
      ),
    );
    return () => {
      cancelAnimation(visualProgress);
      cancelAnimation(copyProgress);
    };
  }, [copyProgress, reducedMotion, state.step, visualProgress]);

  useEffect(() => {
    setNarrationPlaying(narrationEnabled && narration.status === 'speaking');
    return () => setNarrationPlaying(false);
  }, [narration.status, narrationEnabled, setNarrationPlaying]);

  useEffect(() => {
    const settleDelay = reducedMotion ? 0 : motion.duration.standard + 45;
    const timeout = setTimeout(() => setSettledStep(state.step), settleDelay);
    return () => clearTimeout(timeout);
  }, [reducedMotion, state.step]);

  if (!step) return null;

  return (
    <AccessScreen
      background="welcome"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      header={
        <View style={[styles.topBar, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafBrandLockup
            brand={t('common.brand')}
            direction={direction}
            language={locale}
            logoSize={44}
            testID="first-run-brand-lockup"
          />
          <View style={[styles.topActions, { flexDirection: logicalRowDirection(direction) }]}>
            <Button
              accessibilityLabel={t('access.welcome.switchLanguage')}
              brand
              direction="ltr"
              fullWidth={false}
              language={locale}
              onPress={() => {
                unlockPlayback();
                setLocale(locale === 'ar' ? 'en' : 'ar');
              }}
              style={styles.topAction}
              testID="first-run-language-button"
              variant="quiet"
            >
              {t('access.welcome.switchLanguage')}
            </Button>
            <Button
              brand
              direction={direction}
              fullWidth={false}
              language={locale}
              onPress={() => {
                unlockPlayback();
                dispatch({ type: 'skip' });
              }}
              style={styles.topAction}
              testID="first-run-skip-button"
              variant="quiet"
            >
              {t('firstRun.skip')}
            </Button>
          </View>
        </View>
      }
      scrollProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
      testID="first-run-onboarding"
    >
      <View style={styles.story}>
        <Animated.View style={[styles.visualStory, visualStyle]} testID="first-run-visual-story">
          <View style={styles.heroFrame}>
            <LocalIllustration
              accessibilityLabel={step.imageAlt}
              assetId={artworkId}
              direction={direction}
              fallbackLabel={t('firstRun.imageFallback')}
              language={locale}
              key={artworkId}
              onSettled={() => setImageReadyStep(state.step)}
              priority="high"
              style={styles.heroImage}
              testID={`first-run-image-${state.step}`}
            />
            <ImagePerimeterProgress reducedMotion={reducedMotion} stepIndex={stepIndex} />
            <IconButton
              accessibilityHint={narrationHint}
              brand
              disabled={!narrationEnabled || narration.screenReaderActive || !narration.hasSource}
              icon={
                <GhafIcon color={colors.white} direction={direction} name="speaker" size={24} />
              }
              label={
                !narration.hasSource
                  ? t('firstRun.narrator.unavailable')
                  : t('firstRun.narrator.replay')
              }
              onPress={() => {
                unlockPlayback();
                if (narrationEnabled) narration.replay();
              }}
              style={styles.speakerButton}
              testID="first-run-narration-replay"
            />
          </View>
          {showPillarNavigator ? (
            <View
              accessibilityLabel={t('firstRun.pillarsLabel')}
              style={[styles.pillarRow, { flexDirection: logicalRowDirection(direction) }]}
            >
              {ONBOARDING_PILLARS.map((pillar) => {
                const label = t(`firstRun.pillars.${pillar}`);
                const selected = pillar === state.step;
                const tone = pillarTones[pillar];

                return (
                  <Button
                    accessibilityHint={t('firstRun.pillarHint', { pillar: label })}
                    accessibilityState={{ selected: selected }}
                    brand
                    direction={direction}
                    fullWidth={false}
                    key={pillar}
                    language={locale}
                    onPress={() => {
                      unlockPlayback();
                      dispatch({ type: 'goToPillar', step: pillar });
                    }}
                    size="compact"
                    style={[
                      styles.pillarButton,
                      { backgroundColor: selected ? tone.active : tone.idle },
                    ]}
                    testID={`first-run-pillar-${pillar}`}
                    variant={selected ? 'primary' : 'neutral'}
                  >
                    <Text
                      align="center"
                      brand
                      color={selected ? 'white' : 'deepForest'}
                      direction={direction}
                      language={locale}
                      variant="caption"
                    >
                      {label}
                    </Text>
                  </Button>
                );
              })}
            </View>
          ) : null}
        </Animated.View>
        <Animated.View accessibilityLiveRegion="polite" style={[styles.copy, copyStyle]}>
          <Text
            align="center"
            brand
            color="deepForest"
            direction={direction}
            language={locale}
            testID={`first-run-title-${state.step}`}
            variant={isCompactHeight ? 'screenTitle' : 'parentHero'}
          >
            {step.title}
          </Text>
          <Text
            align="center"
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant={isCompactHeight ? 'body' : 'bodyLarge'}
          >
            {step.body}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.navigation} testID="first-run-navigation">
        <View
          accessibilityLabel={progressAlt}
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: ONBOARDING_STEPS.length,
            min: 1,
            now: stepNumber,
            text: progressLabel,
          }}
          style={[styles.progressRow, { flexDirection: logicalRowDirection(direction) }]}
          testID="first-run-progress"
        >
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={locale}
            tabular
            variant="caption"
          >
            {progressLabel}
          </Text>
          <View
            accessibilityElementsHidden
            aria-hidden
            style={[styles.dots, { flexDirection: logicalRowDirection(direction) }]}
          >
            {ONBOARDING_STEPS.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.dot,
                  index === stepIndex ? [styles.dotActive, { backgroundColor: storyAccent }] : null,
                ]}
              />
            ))}
          </View>
        </View>
        <View
          style={[styles.navigationActions, { flexDirection: logicalRowDirection(direction) }]}
          testID="first-run-navigation-actions"
        >
          <Button
            brand
            direction={direction}
            fullWidth={false}
            language={locale}
            onPress={() => {
              unlockPlayback();
              dispatch({ type: isLast ? 'start' : 'next' });
            }}
            size="regular"
            style={styles.navigationAction}
            testID={isLast ? 'first-run-start-button' : 'first-run-next-button'}
          >
            {t(isLast ? 'firstRun.start' : 'firstRun.next')}
          </Button>
          {stepIndex > 0 ? (
            <Button
              brand
              direction={direction}
              fullWidth={false}
              language={locale}
              onPress={() => {
                unlockPlayback();
                dispatch({ type: 'back' });
              }}
              size="regular"
              style={styles.navigationAction}
              testID="first-run-back-button"
              variant="secondary"
            >
              {t('firstRun.back')}
            </Button>
          ) : null}
        </View>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  viewport: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  topBar: {
    width: '100%',
    flexWrap: 'wrap',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xxs,
  },
  topActions: {
    flexShrink: 0,
    maxWidth: '100%',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  topAction: {
    minWidth: layout.touchTarget,
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: spacing.xs,
  },
  story: {
    width: '100%',
    gap: spacing.md,
  },
  visualStory: {
    width: '100%',
    gap: spacing.md,
  },
  heroFrame: {
    width: '100%',
    aspectRatio: 3 / 2,
    overflow: 'hidden',
    borderRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    ...r001Shadows.lifted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
  },
  imagePerimeterProgress: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  speakerButton: {
    position: 'absolute',
    top: spacing.sm,
    end: spacing.sm,
    backgroundColor: colors.deepForest,
    borderColor: colors.solarAmber,
    ...r001Shadows.soft,
  },
  pillarRow: {
    width: '100%',
    gap: spacing.xs,
  },
  pillarButton: {
    flex: 1,
    minWidth: 0,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  copy: {
    width: '100%',
    gap: spacing.xs,
  },
  navigation: {
    width: '100%',
    marginTop: 'auto',
    gap: spacing.sm,
  },
  navigationActions: {
    width: '100%',
    gap: spacing.sm,
  },
  navigationAction: {
    flex: 1,
  },
  progressRow: {
    minHeight: spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dots: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.forestSoft,
  },
  dotActive: {
    width: spacing.xl,
    backgroundColor: colors.ghafEmerald,
  },
});
