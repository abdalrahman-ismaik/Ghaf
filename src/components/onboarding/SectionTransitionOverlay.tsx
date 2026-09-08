import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, firstRunMotion, motion, spacing } from '@/design/tokens';
import { preloadSectionImages, type DynamicImageSection } from '@/features/startup';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafLeafLoader } from './GhafLeafLoader';
import {
  classifyExperiencePath,
  shouldShowSectionTransition,
  type ExperienceSection,
} from './experienceModel';
const destinationKeys: Partial<Record<ExperienceSection, string>> = {
  'parent-access': 'firstRun.loading.parentAccess',
  'child-access': 'firstRun.loading.childAccess',
  'parent-experience': 'firstRun.loading.parentExperience',
  'child-experience': 'firstRun.loading.childExperience',
};

function isDynamicImageSection(section: ExperienceSection): section is DynamicImageSection {
  return (
    section === 'parent-access' ||
    section === 'child-access' ||
    section === 'parent-experience' ||
    section === 'child-experience'
  );
}

export function SectionTransitionOverlay() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const section = classifyExperiencePath(pathname, activeExperience);
  const previousSection = useRef(section);
  const warnedSections = useRef(new Set<DynamicImageSection>());
  const [destination, setDestination] = useState<ExperienceSection>('neutral');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const previous = previousSection.current;
    previousSection.current = section;
    if (!shouldShowSectionTransition(previous, section) || !isDynamicImageSection(section)) return;

    setDestination(section);
    setVisible(true);
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let resolveMinimum: () => void = () => undefined;
    const minimum = new Promise<void>((resolve) => {
      resolveMinimum = resolve;
      timeout = setTimeout(resolve, firstRunMotion.orientationHold);
    });
    void Promise.all([minimum, preloadSectionImages(section)]).then(([, result]) => {
      if (result.failed > 0 && !warnedSections.current.has(section)) {
        warnedSections.current.add(section);
        console.warn(
          `${result.failed} Ghaf ${section} image asset(s) could not be preloaded; using local fallbacks.`,
        );
      }
      if (active) setVisible(false);
    });
    return () => {
      active = false;
      if (timeout !== undefined) clearTimeout(timeout);
      resolveMinimum();
    };
  }, [section]);

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
        <GhafLeafLoader
          accessibilityLabel={t('firstRun.loading.progressA11y')}
          testID="section-transition-leaf-loader"
        />
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
});
