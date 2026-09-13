import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, Text } from '@/components/primitives';
import {
  colors,
  isolateBidiText,
  layout,
  logicalRowDirection,
  opacity,
  r001Motion,
  r001Radii,
  r001Shadows,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import {
  FAMILY_PLAN_CATALOG,
  calculateAnnualSavingsPercent,
  formatPriceFils,
} from '@/features/family-plan';

import { GhafIcon, type GhafIconName } from './GhafIcon';

interface FamilyPlusPreviewProps {
  readonly direction: LayoutDirection;
  readonly language: TypographyLanguage;
  readonly onDismiss: () => void;
  readonly visible: boolean;
}

interface PlanBenefitProps {
  readonly children: string;
  readonly direction: LayoutDirection;
  readonly icon: GhafIconName;
  readonly language: TypographyLanguage;
}

function PlanBenefit({ children, direction, icon, language }: PlanBenefitProps) {
  return (
    <View style={[styles.benefit, { flexDirection: logicalRowDirection(direction) }]}>
      <View style={styles.benefitIcon}>
        <GhafIcon color={colors.ghafEmerald} direction={direction} name={icon} size={17} />
      </View>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        style={styles.benefitCopy}
        variant="caption"
      >
        {children}
      </Text>
    </View>
  );
}

export function FamilyPlusPreview({
  direction,
  language,
  onDismiss,
  visible,
}: FamilyPlusPreviewProps) {
  const { t } = useTranslation();
  const reducedMotion = Boolean(useReducedMotion());
  const progress = useSharedValue(visible && reducedMotion ? 1 : 0);
  const announcementRef = useRef<View>(null);
  const plusPlan = FAMILY_PLAN_CATALOG.ghafPlus;
  const monthlyPrice = formatPriceFils(plusPlan.monthlyPriceFils ?? 0, language) ?? '';
  const annualPrice = formatPriceFils(plusPlan.annualPriceFils ?? 0, language) ?? '';
  const savingsPercent = new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    numberingSystem: language === 'ar' ? 'arab' : 'latn',
    useGrouping: false,
  }).format(calculateAnnualSavingsPercent());

  useLayoutEffect(() => {
    cancelAnimation(progress);
    if (!visible) {
      progress.set(0);
      return;
    }
    if (reducedMotion) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(
      withTiming(1, {
        duration: r001Motion.duration.slow,
        easing: Easing.bezier(...r001Motion.sheetEasing),
      }),
    );
    return () => cancelAnimation(progress);
  }, [progress, reducedMotion, visible]);

  useEffect(() => {
    if (!visible || Platform.OS === 'web') return undefined;
    const frame = requestAnimationFrame(() => {
      const reactTag = findNodeHandle(announcementRef.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    });
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [0, opacity.scrim]),
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.2, 1], [0.88, 1, 1]),
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [40, 0]) }],
  }));

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      testID="family-plus-preview"
      transparent
      visible={visible}
    >
      <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.overlay}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onPress={onDismiss}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
          <Animated.View style={[styles.sheet, sheetStyle]} testID="family-plus-preview-content">
            <View aria-hidden style={styles.handle} />
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                accessibilityLabel={`${t('access.setup.plusPreviewTitle')}. ${t(
                  'access.setup.plusPreviewBody',
                )}`}
                accessibilityLiveRegion="polite"
                accessible
                ref={announcementRef}
                style={styles.intro}
              >
                <View style={styles.plusMark}>
                  <GhafIcon color={colors.tertiary} direction={direction} name="family" size={30} />
                </View>
                <View style={styles.introCopy}>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    variant="screenTitle"
                  >
                    {t('access.setup.plusPreviewTitle')}
                  </Text>
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    language={language}
                    variant="body"
                  >
                    {t('access.setup.plusPreviewBody')}
                  </Text>
                </View>
              </View>

              <View style={styles.planComparison}>
                <View style={styles.freePlan}>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    variant="label"
                  >
                    {t('access.setup.freePlanName')}
                  </Text>
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    language={language}
                    variant="caption"
                  >
                    {t('access.setup.freePlanDetail')}
                  </Text>
                </View>
                <View style={styles.plusPlan}>
                  <View
                    style={[styles.planHeading, { flexDirection: logicalRowDirection(direction) }]}
                  >
                    <Text
                      brand
                      color="deepForest"
                      direction={direction}
                      language={language}
                      style={styles.planHeadingText}
                      variant="label"
                    >
                      {isolateBidiText(t('access.setup.plusPlanName'), 'ltr')}
                    </Text>
                    <View style={styles.capacityPill}>
                      <Text
                        brand
                        color="onTertiaryFixed"
                        direction={direction}
                        language={language}
                        tabular
                        variant="caption"
                      >
                        {t('access.setup.plusCapacity')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    language={language}
                    variant="caption"
                  >
                    {t('access.setup.plusPlanDetail')}
                  </Text>
                </View>
              </View>

              <View style={styles.benefits}>
                <PlanBenefit direction={direction} icon="family" language={language}>
                  {t('access.setup.plusOneHousehold')}
                </PlanBenefit>
                <PlanBenefit direction={direction} icon="check-filled" language={language}>
                  {t('access.setup.plusNoPerChildFee')}
                </PlanBenefit>
                <PlanBenefit direction={direction} icon="shield" language={language}>
                  {t('access.setup.plusSameCore')}
                </PlanBenefit>
                <PlanBenefit direction={direction} icon="media-off" language={language}>
                  {t('access.setup.plusNoChildPromotion')}
                </PlanBenefit>
              </View>

              <View style={styles.pricePanel}>
                <Text
                  brand
                  color="onTertiaryFixedVariant"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {t('access.setup.plusProposedPrice')}
                </Text>
                <View style={[styles.prices, { flexDirection: logicalRowDirection(direction) }]}>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    style={styles.price}
                    tabular
                    variant="label"
                  >
                    {t('access.setup.plusMonthlyPrice', { price: monthlyPrice })}
                  </Text>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    style={styles.price}
                    tabular
                    variant="label"
                  >
                    {t('access.setup.plusAnnualPrice', { price: annualPrice })}
                  </Text>
                </View>
                <Text
                  brand
                  color="onTertiaryFixedVariant"
                  direction={direction}
                  language={language}
                  tabular
                  variant="caption"
                >
                  {t('access.setup.plusAnnualSaving', { percent: savingsPercent })}
                </Text>
              </View>

              <View style={[styles.truthPanel, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={colors.mangroveTeal} direction={direction} name="info" size={20} />
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  style={styles.truthCopy}
                  variant="caption"
                >
                  {t('access.setup.plusPrototypeTruth')}
                </Text>
              </View>

              <PrimaryButton
                brand
                direction={direction}
                language={language}
                onPress={onDismiss}
                size="regular"
                testID="family-plus-preview-return"
              >
                {t('access.setup.plusBack')}
              </PrimaryButton>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.transparent,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
  },
  safeArea: {
    maxHeight: '94%',
    justifyContent: 'flex-end',
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.accessContentWidth,
    maxHeight: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: r001Radii.sheet,
    borderTopRightRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    backgroundColor: colors.r001Surface,
    ...r001Shadows.sheet,
  },
  handle: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.sm,
    alignSelf: 'center',
    width: layout.touchTarget,
    height: 5,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.outlineVariant,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  plusMark: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.solarAmberTint,
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
  },
  introCopy: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  planComparison: {
    overflow: 'hidden',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  freePlan: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  plusPlan: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.solarAmberTint,
  },
  planHeading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  planHeadingText: {
    minWidth: 0,
    flex: 1,
  },
  capacityPill: {
    minHeight: 28,
    flexShrink: 0,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: spacing.sm,
  },
  benefits: {
    gap: spacing.xs,
  },
  benefit: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmeraldTint,
  },
  benefitCopy: {
    minWidth: 0,
    flex: 1,
  },
  pricePanel: {
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.tertiaryFixed,
    padding: spacing.md,
  },
  prices: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  price: {
    flexGrow: 1,
    flexBasis: 152,
  },
  truthPanel: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.md,
  },
  truthCopy: {
    minWidth: 0,
    flex: 1,
  },
});
