import { useWindowDimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessScreen } from '@/components/access';
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

import { ONBOARDING_STEPS } from './experienceModel';
import { useFirstRunExperience } from './FirstRunExperienceContext';
import { GhafRasterLogo } from './GhafRasterLogo';

interface FirstRunStepCopy {
  readonly body: string;
  readonly imageAlt: string;
  readonly title: string;
}

export function FirstRunOnboarding() {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const { dispatch, state } = useFirstRunExperience();
  const storyProgress = useSharedValue(1);
  const stepIndex = ONBOARDING_STEPS.indexOf(state.step);
  const stepNumber = stepIndex + 1;
  const steps = t('firstRun.steps', { returnObjects: true }) as unknown as FirstRunStepCopy[];
  const step = steps[stepIndex] ?? steps[0];
  const artworkId = onboardingArtworkIds[stepIndex] ?? onboardingArtworkIds[0];
  const heroHeight = Math.min(252, Math.max(190, height * 0.28));
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const storyStyle = useAnimatedStyle(() => ({
    opacity: storyProgress.get(),
    transform: [{ translateY: reducedMotion ? 0 : (1 - storyProgress.get()) * 8 }],
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
    cancelAnimation(storyProgress);
    if (reducedMotion) {
      storyProgress.set(1);
      return;
    }
    storyProgress.set(0);
    storyProgress.set(
      withTiming(1, {
        duration: motion.duration.standard,
        easing: Easing.bezier(...motion.easing),
        reduceMotion: ReduceMotion.System,
      }),
    );
    return () => cancelAnimation(storyProgress);
  }, [reducedMotion, state.step, storyProgress]);

  if (!step) return null;

  return (
    <AccessScreen
      background="plain"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      scrollProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
      testID="first-run-onboarding"
    >
      <View style={[styles.topBar, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.brandLockup, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafRasterLogo
            accessibilityLabel={t('common.brand')}
            size={46}
            testID="first-run-logo"
          />
          <Text
            brand
            color="ghafEmerald"
            direction={direction}
            language={locale}
            variant="screenTitle"
          >
            {t('common.brand')}
          </Text>
        </View>
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

      <Animated.View style={[styles.story, storyStyle]}>
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
        <View accessibilityLiveRegion="polite" style={styles.copy}>
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={locale}
            testID={`first-run-title-${state.step}`}
            variant="parentHero"
          >
            {step.title}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant="bodyLarge"
          >
            {step.body}
          </Text>
        </View>
      </Animated.View>

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
                style={[styles.dot, index === stepIndex ? styles.dotActive : null]}
              />
            ))}
          </View>
        </View>

        <Button
          brand
          direction={direction}
          language={locale}
          onPress={() => dispatch({ type: isLast ? 'start' : 'next' })}
          size="regular"
          testID={isLast ? 'first-run-start-button' : 'first-run-next-button'}
        >
          {t(isLast ? 'firstRun.start' : 'firstRun.next')}
        </Button>
        {stepIndex > 0 ? (
          <Button
            brand
            direction={direction}
            language={locale}
            onPress={() => dispatch({ type: 'back' })}
            size="regular"
            testID="first-run-back-button"
            variant="quiet"
          >
            {t('firstRun.back')}
          </Button>
        ) : null}
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
    gap: spacing.xl,
  },
  topBar: {
    width: '100%',
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  brandLockup: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
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
    gap: spacing.xl,
  },
  heroImage: {
    width: '100%',
    minHeight: 190,
    maxHeight: 252,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    ...r001Shadows.lifted,
  },
  copy: {
    width: '100%',
    gap: spacing.sm,
  },
  navigation: {
    width: '100%',
    marginTop: 'auto',
    gap: spacing.sm,
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
