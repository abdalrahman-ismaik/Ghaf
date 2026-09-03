import { useLayoutEffect, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { colors, layout, motion, opacity, radii, shadows, spacing } from '@/design/tokens';

import { GhafIcon } from './GhafIcon';

interface SuccessSheetProps {
  actionLabel: string;
  children?: ReactNode;
  message: string;
  onAction: () => void;
  onDismiss?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  testID?: string;
  title: string;
  visible: boolean;
}

export function SuccessSheet({
  actionLabel,
  children,
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
  const progress = useSharedValue(visible && !reducedMotion ? 0 : 1);

  useLayoutEffect(() => {
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
        duration: motion.duration.slow,
        easing: Easing.bezier(...motion.easing),
      }),
    );
  }, [progress, reducedMotion, visible]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, opacity.scrim]),
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 1], [0.84, 1, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [440, 0]) }],
  }));

  const requestDismiss = () => {
    if (!onDismiss) return;
    if (reducedMotion) {
      onDismiss();
      return;
    }
    progress.set(
      withTiming(
        0,
        { duration: motion.duration.standard, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(onDismiss);
        },
      ),
    );
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="none"
      navigationBarTranslucent
      onRequestClose={requestDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modal} testID={testID}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable
            accessibilityLabel={onDismiss ? title : undefined}
            accessibilityRole={onDismiss ? 'button' : undefined}
            disabled={!onDismiss}
            onPress={requestDismiss}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[styles.sheet, sheetStyle]}
          testID={`${testID}-content`}
        >
          <View aria-hidden style={styles.handle} />
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successMark}>
              <GhafIcon
                color={colors.ghafEmerald}
                name="check-filled"
                size={38}
                strokeWidth={2.2}
              />
            </View>
            <Text accessibilityRole="header" align="center" color="onSurface" variant="screenTitle">
              {title}
            </Text>
            <Text align="center" color="onSurfaceVariant" style={styles.message} variant="body">
              {message}
            </Text>
            {children}
            <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton>
            {secondaryLabel && onSecondary ? (
              <QuietButton onPress={onSecondary} size="compact">
                {secondaryLabel}
              </QuietButton>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
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
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    ...shadows.sheet,
  },
  handle: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.md,
    alignSelf: 'center',
    width: layout.touchTarget,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.outlineVariant,
    opacity: 0.56,
  },
  sheetContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.massive,
    paddingBottom: spacing.xxl,
  },
  successMark: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: layout.readableContentWidth,
    marginBottom: spacing.md,
  },
});
