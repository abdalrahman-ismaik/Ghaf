import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, motion, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface BrandedSplashProps {
  readonly visible: boolean;
}

export function BrandedSplash({ visible }: BrandedSplashProps) {
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);

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
        <GhafRasterLogo
          accessibilityLabel={t('common.brand')}
          size={120}
          testID="branded-splash-logo"
        />
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
        <View accessibilityRole="progressbar" style={styles.status}>
          {reducedMotion ? (
            <View style={styles.staticProgress} />
          ) : (
            <ActivityIndicator color={colors.ghafEmerald} />
          )}
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
  staticProgress: {
    width: spacing.huge,
    height: spacing.xxs,
    borderRadius: spacing.xxs,
    backgroundColor: colors.ghafEmerald,
  },
});
