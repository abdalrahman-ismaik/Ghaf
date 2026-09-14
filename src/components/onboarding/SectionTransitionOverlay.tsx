import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { interactionMotion } from '@/design/motion';
import { preloadSectionImages, type DynamicImageSection } from '@/features/startup';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

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
  const reducedMotion = useReducedMotionPreference();
  const opacity = useSharedValue(0);

  useEffect(() => {
    const previous = previousSection.current;
    previousSection.current = section;
    if (!shouldShowSectionTransition(previous, section) || !isDynamicImageSection(section)) {
      setVisible(false);
      return;
    }

    setDestination(section);
    setVisible(true);
    let active = true;
    void preloadSectionImages(section).then(
      (result) => {
        if (!active) return;
        if (result.failed > 0 && !warnedSections.current.has(section)) {
          warnedSections.current.add(section);
          console.warn(
            `${result.failed} Ghaf ${section} image asset(s) could not be preloaded; using local fallbacks.`,
          );
        }
        setVisible(false);
      },
      () => {
        if (!active) return;
        if (!warnedSections.current.has(section)) {
          warnedSections.current.add(section);
          console.warn(`Ghaf ${section} images could not be preloaded; using local fallbacks.`);
        }
        setVisible(false);
      },
    );
    return () => {
      active = false;
    };
  }, [section]);

  const presenting = visible && destination === section;
  useLayoutEffect(() => {
    cancelAnimation(opacity);
    if (!presenting || reducedMotion) {
      opacity.set(presenting ? 1 : 0);
      return;
    }
    opacity.set(
      withTiming(1, {
        duration: interactionMotion.timing.fade,
        easing: interactionMotion.easing,
        reduceMotion: ReduceMotion.Never,
      }),
    );
    return () => cancelAnimation(opacity);
  }, [opacity, presenting, reducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  if (!presenting) return null;

  const destinationKey = destinationKeys[destination] ?? 'firstRun.loading.opening';

  return (
    <Animated.View
      accessibilityLabel={`${t(destinationKey)}. ${t('firstRun.loading.opening')}`}
      accessibilityLiveRegion="polite"
      accessibilityViewIsModal
      style={[styles.overlay, animatedStyle]}
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
