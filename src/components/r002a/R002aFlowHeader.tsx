import { Pressable, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { GhafHeaderTitle } from '@/components/brand';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, opacity, spacing, type LayoutDirection } from '@/design/tokens';

export interface R002aFlowHeaderProps {
  direction: LayoutDirection;
  title: string;
  backLabel: string;
  onBack: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
}

export function R002aFlowHeader({
  direction,
  title,
  backLabel,
  onBack,
  actionLabel,
  onAction,
  actionTestID,
}: R002aFlowHeaderProps) {
  const backControl = (
    <Pressable
      accessibilityLabel={backLabel}
      accessibilityRole="button"
      hitSlop={spacing.xs}
      onPress={onBack}
      style={({ pressed }) => [styles.sideSlot, pressed ? styles.pressed : null]}
      testID="r002a-flow-back-button"
    >
      <GhafIcon color={colors.ghafEmerald} direction={direction} name="arrow-back" size={26} />
    </Pressable>
  );
  const actionControl =
    actionLabel && onAction ? (
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        hitSlop={spacing.xs}
        onPress={onAction}
        style={({ pressed }) => [styles.sideSlot, pressed ? styles.pressed : null]}
        testID={actionTestID}
      >
        <Text align="center" brand color="ghafEmerald" direction={direction} variant="label">
          {actionLabel}
        </Text>
      </Pressable>
    ) : (
      <View importantForAccessibility="no-hide-descendants" style={styles.sideSlot} />
    );

  return (
    <View style={styles.root}>
      <View style={styles.physicalRow}>
        {direction === 'rtl' ? actionControl : backControl}
        <View style={styles.titleSlot}>
          <GhafHeaderTitle direction={direction} title={title} />
        </View>
        {direction === 'rtl' ? backControl : actionControl}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
    backgroundColor: botanical.colors.canvas,
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
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
});
