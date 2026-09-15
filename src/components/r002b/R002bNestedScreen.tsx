import { useCallback, type PropsWithChildren, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { GhafIcon } from '@/components/access';
import { GhafHeaderTitle } from '@/components/brand';
import { QuietButton, Text } from '@/components/primitives';
import { R002aScreen } from '@/components/r002a';
import { colors, layout, opacity, r001Radii, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

export interface R002bNestedScreenProps extends PropsWithChildren {
  readonly accessibilityViewIsModal?: boolean;
  readonly backLabel: string;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly direction: TextDirection;
  readonly footer?: ReactNode;
  readonly language: LocaleCode;
  readonly onBack: () => void;
  readonly reducedMotion: boolean;
  readonly scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  readonly testID: string;
  readonly title: string;
}

export function R002bNestedScreen({
  accessibilityViewIsModal = false,
  backLabel,
  children,
  contentContainerStyle,
  direction,
  footer,
  language,
  onBack,
  reducedMotion,
  scrollProps,
  testID,
  title,
}: R002bNestedScreenProps) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack();
        return true;
      });
      return () => subscription.remove();
    }, [onBack]),
  );

  const safeAreaEdges = footer
    ? (['top', 'left', 'right'] as const)
    : (['top', 'left', 'right', 'bottom'] as const);

  const backControl = (
    <Pressable
      accessibilityLabel={backLabel}
      accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
      accessibilityRole="button"
      hitSlop={spacing.xs}
      onPress={onBack}
      style={({ pressed }) => [
        styles.sideSlot,
        pressed ? (reducedMotion ? styles.pressedStatic : styles.pressedMotion) : null,
      ]}
      testID="r002b-nested-back-button"
    >
      <GhafIcon color={colors.ghafEmerald} direction={direction} name="arrow-back" size={26} />
    </Pressable>
  );
  const emptySlot = (
    <View importantForAccessibility="no-hide-descendants" style={styles.sideSlot} />
  );

  const screen = (
    <R002aScreen
      contentContainerStyle={contentContainerStyle}
      footer={footer}
      header={
        <View style={styles.headerRoot}>
          <View style={styles.physicalRow}>
            {direction === 'rtl' ? emptySlot : backControl}
            <View style={styles.titleSlot}>
              <GhafHeaderTitle direction={direction} language={language} title={title} />
            </View>
            {direction === 'rtl' ? backControl : emptySlot}
          </View>
        </View>
      }
      safeAreaEdges={safeAreaEdges}
      scrollProps={scrollProps}
      testID={testID}
    >
      {children}
    </R002aScreen>
  );

  return accessibilityViewIsModal ? (
    <View accessibilityViewIsModal style={styles.modalBoundary}>
      {screen}
    </View>
  ) : (
    screen
  );
}

export function R002bUnavailableState({
  actionLabel,
  body,
  direction,
  language,
  onAction,
  title,
}: {
  readonly actionLabel: string;
  readonly body: string;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly onAction: () => void;
  readonly title: string;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.unavailable}
      testID="r002b-unavailable-state"
    >
      <View style={styles.unavailableIcon}>
        <GhafIcon color={colors.error} name="info" size={24} />
      </View>
      <Text
        accessibilityRole="header"
        brand
        color="error"
        direction={direction}
        language={language}
        variant="heading"
      >
        {title}
      </Text>
      <Text brand color="onSurfaceVariant" direction={direction} language={language}>
        {body}
      </Text>
      <QuietButton
        brand
        direction={direction}
        onPress={onAction}
        size="compact"
        testID="r002b-unavailable-return-button"
      >
        {actionLabel}
      </QuietButton>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBoundary: {
    flex: 1,
  },
  headerRoot: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    backgroundColor: colors.pearlGround,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
  },
  physicalRow: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    minHeight: layout.touchTarget,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sideSlot: {
    width: 76,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },
  titleSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedStatic: {
    opacity: opacity.pressed,
  },
  pressedMotion: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  unavailable: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.errorContainer,
    padding: spacing.lg,
  },
  unavailableIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.touchTarget / 2,
    backgroundColor: colors.surfaceContainerLowest,
  },
});
