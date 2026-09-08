import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafLeafLoader } from './GhafLeafLoader';

export type StartupPresentationPhase = 'splash' | 'loading' | 'complete';

interface BrandedSplashProps {
  readonly phase: StartupPresentationPhase;
}

export function BrandedSplash({ phase }: BrandedSplashProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const isLoading = phase === 'loading';

  if (phase === 'complete') return null;

  return (
    <View
      accessibilityLabel={isLoading ? t('firstRun.loading.progressA11y') : t('common.brand')}
      accessibilityLiveRegion={isLoading ? 'polite' : 'none'}
      accessibilityViewIsModal
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
      <View
        style={styles.content}
        testID={isLoading ? 'startup-loading-stage' : 'startup-splash-stage'}
      >
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
        {isLoading ? (
          <GhafLeafLoader
            accessibilityLabel={t('firstRun.loading.progressA11y')}
            testID="branded-splash-leaf-loader"
          />
        ) : null}
      </View>
    </View>
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
