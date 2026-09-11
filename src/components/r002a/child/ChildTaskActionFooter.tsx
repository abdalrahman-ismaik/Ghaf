import { forwardRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
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
            style={styles.actionLabel}
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
    borderTopColor: botanical.colors.line,
    backgroundColor: botanical.colors.canvas,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPadding,
  },
  action: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    minHeight: layout.controlHeight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.forest,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  actionLabel: { minWidth: 0, flexShrink: 1 },
  disabled: {
    backgroundColor: botanical.colors.line,
  },
});
