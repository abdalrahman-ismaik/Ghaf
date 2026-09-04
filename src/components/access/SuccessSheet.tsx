import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
import { scheduleOnRN } from 'react-native-worklets';

import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  opacity as opacityTokens,
  r001Motion,
  r001Radii,
  r001Shadows,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

import { GhafIcon } from './GhafIcon';

export interface SuccessSheetProps {
  actionLabel: string;
  children?: ReactNode;
  direction: LayoutDirection;
  dismissLabel?: string;
  language: TypographyLanguage;
  message: string;
  onAction: () => void;
  onDismiss?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  testID?: string;
  title: string;
  visible: boolean;
}

// The route owns transparent-modal navigation. This surface owns only deterministic presentation
// so Back handling and focus restoration remain explicit at the route boundary.
export function SuccessSheet({
  actionLabel,
  children,
  direction,
  dismissLabel,
  language,
  message,
  onAction,
  onDismiss,
  onSecondary,
  secondaryLabel,
  testID = 'success-sheet',
  title,
  visible,
}: SuccessSheetProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(visible && reducedMotion ? 1 : 0);
  const announcementRef = useRef<View>(null);

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
    opacity: interpolate(progress.get(), [0, 1], [0, opacityTokens.scrim]),
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.16, 1], [0.88, 1, 1]),
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [36, 0]) }],
  }));

  const requestDismiss = () => {
    if (!onDismiss) return;

    if (reducedMotion) {
      onDismiss();
      return;
    }

    cancelAnimation(progress);
    progress.set(
      withTiming(
        0,
        {
          duration: r001Motion.duration.standard,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) scheduleOnRN(onDismiss);
        },
      ),
    );
  };

  if (!visible) return null;

  return (
    <View
      accessibilityViewIsModal
      importantForAccessibility="yes"
      style={styles.modalSurface}
      testID={testID}
    >
      <Animated.View style={[styles.scrim, scrimStyle]}>
        <Pressable
          accessibilityLabel={onDismiss ? dismissLabel : undefined}
          accessibilityRole={onDismiss && dismissLabel ? 'button' : undefined}
          accessible={Boolean(onDismiss && dismissLabel)}
          disabled={!onDismiss}
          onPress={requestDismiss}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.sheet, sheetStyle]} testID={`${testID}-content`}>
        <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.safeArea}>
          <View aria-hidden style={styles.handle} />
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.sheetContent}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityLabel={`${title}. ${message}`}
              accessibilityLiveRegion="polite"
              accessible
              ref={announcementRef}
              style={styles.announcement}
            >
              <View
                accessibilityElementsHidden
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                style={styles.visualAnnouncement}
              >
                <View style={styles.successMark}>
                  <GhafIcon
                    color={colors.ghafEmerald}
                    direction={direction}
                    name="check-filled"
                    size={38}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  align="center"
                  brand
                  color="onSurface"
                  direction={direction}
                  language={language}
                  variant="screenTitle"
                >
                  {title}
                </Text>
                <Text
                  align="center"
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  style={styles.message}
                  variant="body"
                >
                  {message}
                </Text>
              </View>
            </View>
            {children}
            <PrimaryButton
              brand
              direction={direction}
              language={language}
              onPress={onAction}
              size="regular"
            >
              {actionLabel}
            </PrimaryButton>
            {secondaryLabel && onSecondary ? (
              <QuietButton
                brand
                direction={direction}
                language={language}
                onPress={onSecondary}
                size="compact"
              >
                {secondaryLabel}
              </QuietButton>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalSurface: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.accessContentWidth,
    maxHeight: '90%',
    overflow: 'hidden',
    borderTopLeftRadius: r001Radii.sheet,
    borderTopRightRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    backgroundColor: colors.r001Surface,
    ...r001Shadows.sheet,
  },
  safeArea: {
    maxHeight: '100%',
  },
  handle: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.md,
    alignSelf: 'center',
    width: layout.touchTarget,
    height: 6,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.outlineVariant,
    opacity: 0.56,
  },
  sheetContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
  announcement: {
    width: '100%',
  },
  visualAnnouncement: {
    alignItems: 'center',
    gap: spacing.md,
  },
  successMark: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: layout.readableContentWidth,
    marginBottom: spacing.xs,
  },
});
