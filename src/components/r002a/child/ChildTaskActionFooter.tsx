import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildTaskActionFooterProps {
  busy?: boolean;
  busyLabel?: string;
  direction: TextDirection;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}

export const ChildTaskActionFooter = forwardRef<View, ChildTaskActionFooterProps>(
  function ChildTaskActionFooter(
    { busy = false, busyLabel, direction, disabled = false, label, onPress, testID },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const unavailable = disabled || busy;
    return (
      <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: unavailable }}
          aria-busy={busy}
          disabled={unavailable}
          onPress={onPress}
          ref={ref}
          style={({ pressed }) => [
            styles.action,
            { flexDirection: logicalRowDirection(direction) },
            pressed && !unavailable ? styles.pressed : null,
            unavailable ? styles.disabled : null,
          ]}
          testID={testID}
        >
          {busy ? (
            <ActivityIndicator
              color={unavailable ? colors.onSurfaceVariant : colors.onPrimary}
              size="small"
            />
          ) : null}
          <Text
            align="center"
            brand
            color={unavailable ? 'onSurfaceVariant' : 'onPrimary'}
            direction={direction}
            variant="control"
          >
            {busy && busyLabel ? busyLabel : label}
          </Text>
          {!busy ? (
            <GhafIcon
              color={unavailable ? colors.onSurfaceVariant : colors.onPrimary}
              direction={direction === 'rtl' ? 'ltr' : 'rtl'}
              name="arrow-back"
              size={23}
            />
          ) : null}
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    zIndex: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.pearlGround,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    ...r001Shadows.sheet,
  },
  action: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    minHeight: layout.controlHeight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.ghafEmerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
});
