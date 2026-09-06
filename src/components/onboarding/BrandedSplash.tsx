import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, motion, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface BrandedSplashProps {
  readonly settledResources: number;
  readonly totalResources: number;
  readonly visible: boolean;
}

const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export function BrandedSplash({ settledResources, totalResources, visible }: BrandedSplashProps) {
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const logoScale = useSharedValue(1);
  const progressScale = useSharedValue(0);
  const safeTotal = Math.max(1, totalResources);
  const progress = Math.min(1, Math.max(0, settledResources / safeTotal));

  useEffect(() => {
    cancelAnimation(logoScale);
    if (reducedMotion) {
      logoScale.set(1);
      return;
    }
    logoScale.set(
      withRepeat(
        withSequence(
          withTiming(1.025, {
            duration: 900,
            easing: easeInOut,
            reduceMotion: ReduceMotion.System,
          }),
          withTiming(1, {
            duration: 900,
            easing: easeInOut,
            reduceMotion: ReduceMotion.System,
          }),
        ),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
    return () => cancelAnimation(logoScale);
  }, [logoScale, reducedMotion]);

  useEffect(() => {
    cancelAnimation(progressScale);
    progressScale.set(
      reducedMotion
        ? progress
        : withTiming(progress, {
            duration: motion.duration.slow,
            easing: easeOut,
            reduceMotion: ReduceMotion.System,
          }),
    );
  }, [progress, progressScale, reducedMotion]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.get() }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressScale.get() }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLabel={`${t('firstRun.loading.splashTitle')}. ${t('firstRun.loading.splashBody')}`}
      accessibilityLiveRegion="polite"
      accessibilityViewIsModal
      entering={FadeIn.duration(motion.duration.quick)}
      exiting={FadeOut.duration(motion.duration.standard)}
      style={styles.overlay}
      testID="branded-splash"
    >
      <LocalIllustration
        assetId="section-transition"
        decorative
        priority="high"
        style={StyleSheet.absoluteFill}
        testID="branded-splash-background"
      />
      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <GhafRasterLogo
            accessibilityLabel={t('common.brand')}
            size={120}
            testID="branded-splash-logo"
          />
        </Animated.View>
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          variant="parentHero"
        >
          {t('firstRun.loading.splashTitle')}
        </Text>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: safeTotal,
            min: 0,
            now: Math.min(settledResources, safeTotal),
            text: t('firstRun.loading.splashBody'),
          }}
          style={styles.status}
        >
          <View aria-hidden style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
            <View style={styles.seed} />
          </View>
          <Text
            align="center"
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant="body"
          >
            {t('firstRun.loading.splashBody')}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.pearlGround,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  status: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    width: spacing.massive * 2.5,
    height: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.ghafEmeraldTint,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  seed: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
});
