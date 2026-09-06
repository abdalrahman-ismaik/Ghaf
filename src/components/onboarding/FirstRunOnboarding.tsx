import { useWindowDimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessScreen } from '@/components/access';
import { GhafBrandLockup } from '@/components/brand/GhafBrandLockup';
import { LocalIllustration, onboardingArtworkIds } from '@/components/illustrations';
import { Button, Text } from '@/components/primitives';
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

interface FirstRunStepCopy {
  readonly body: string;
  readonly imageAlt: string;
  readonly title: string;
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

export function FirstRunOnboarding() {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const { dispatch, state } = useFirstRunExperience();
  const visualProgress = useSharedValue(1);
  const copyProgress = useSharedValue(1);
  const stepIndex = ONBOARDING_STEPS.indexOf(state.step);
  const stepNumber = stepIndex + 1;
  const isCompactHeight = height < 760;
  const steps = t('firstRun.steps', { returnObjects: true }) as unknown as FirstRunStepCopy[];
  const step = steps[stepIndex] ?? steps[0];
  const artworkId = onboardingArtworkIds[stepIndex] ?? onboardingArtworkIds[0];
  const heroHeight = Math.min(208, Math.max(144, height * (isCompactHeight ? 0.2 : 0.22)));
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const showPillarNavigator = stepIndex <= 3;
  const storyAccent = storyAccents[stepIndex] ?? colors.ghafEmerald;
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
              onPress={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
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
              onPress={() => dispatch({ type: 'skip' })}
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
              priority="high"
              style={[styles.heroImage, { height: heroHeight }]}
              testID={`first-run-image-${state.step}`}
            />
            <View style={[styles.heroAccent, { backgroundColor: storyAccent }]} />
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
                    onPress={() => dispatch({ type: 'goToPillar', step: pillar })}
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
            align="start"
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
            align="start"
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

      <View style={styles.navigation}>
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
        >
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            tabular
            variant="caption"
          >
            {progressLabel}
          </Text>
          <View style={[styles.dots, { flexDirection: logicalRowDirection(direction) }]}>
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

        <View style={[styles.navigationActions, { flexDirection: logicalRowDirection(direction) }]}>
          <Button
            brand
            direction={direction}
            fullWidth={false}
            language={locale}
            onPress={() => dispatch({ type: isLast ? 'start' : 'next' })}
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
              onPress={() => dispatch({ type: 'back' })}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  topBar: {
    width: '100%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xxs,
  },
  topActions: {
    flexShrink: 0,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  topAction: {
    minWidth: layout.touchTarget,
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
    overflow: 'hidden',
    borderRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    ...r001Shadows.lifted,
  },
  heroImage: {
    width: '100%',
    minHeight: 170,
    maxHeight: 244,
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
  },
  heroAccent: {
    position: 'absolute',
    pointerEvents: 'none',
    right: spacing.lg,
    bottom: 0,
    left: spacing.lg,
    height: spacing.xs,
    borderRadius: r001Radii.pill,
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
    backgroundColor: colors.surfaceContainerHigh,
  },
  dotActive: {
    width: spacing.xl,
    backgroundColor: colors.ghafEmerald,
  },
});
