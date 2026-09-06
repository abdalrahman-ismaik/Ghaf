import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, motion, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafLeafLoader } from './GhafLeafLoader';

interface BrandedSplashProps {
  readonly visible: boolean;
}

export function BrandedSplash({ visible }: BrandedSplashProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);

  if (!visible) return null;

  return (
    <Animated.View
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
        <GhafRasterLogo decorative size={120} testID="branded-splash-logo" />
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          variant="parentHero"
        >
          {t('common.brand')}
        </Text>
        <GhafLeafLoader
          accessibilityLabel={t('firstRun.loading.progressA11y')}
          testID="branded-splash-leaf-loader"
        />
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
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});
