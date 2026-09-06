import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, motion, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import {
  classifyExperiencePath,
  shouldShowSectionTransition,
  type ExperienceSection,
} from './experienceModel';
import { GhafRasterLogo } from './GhafRasterLogo';

const destinationKeys: Partial<Record<ExperienceSection, string>> = {
  'parent-access': 'firstRun.loading.parentAccess',
  'child-access': 'firstRun.loading.childAccess',
  'parent-experience': 'firstRun.loading.parentExperience',
  'child-experience': 'firstRun.loading.childExperience',
};

export function SectionTransitionOverlay() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const section = classifyExperiencePath(pathname, activeExperience);
  const previousSection = useRef(section);
  const [destination, setDestination] = useState<ExperienceSection>('neutral');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const previous = previousSection.current;
    previousSection.current = section;
    if (!shouldShowSectionTransition(previous, section)) return;

    setDestination(section);
    setVisible(true);
    const timeout = setTimeout(
      () => setVisible(false),
      reducedMotion ? motion.duration.quick : motion.duration.growth,
    );
    return () => clearTimeout(timeout);
  }, [reducedMotion, section]);

  if (!visible) return null;

  const destinationKey = destinationKeys[destination] ?? 'firstRun.loading.opening';

  return (
    <Animated.View
      accessibilityLabel={`${t(destinationKey)}. ${t('firstRun.loading.opening')}`}
      accessibilityLiveRegion="polite"
      accessibilityViewIsModal
      entering={FadeIn.duration(motion.duration.quick)}
      exiting={FadeOut.duration(motion.duration.standard)}
      style={styles.overlay}
      testID="section-transition-overlay"
    >
      <LocalIllustration
        assetId="section-transition"
        decorative
        priority="high"
        style={StyleSheet.absoluteFill}
        testID="section-transition-background"
      />
      <View style={styles.content}>
        <GhafRasterLogo decorative size={86} testID="section-transition-logo" />
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          variant="screenTitle"
        >
          {t(destinationKey)}
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
            {t('firstRun.loading.opening')}
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
    zIndex: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.pearlGround,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing.md,
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
