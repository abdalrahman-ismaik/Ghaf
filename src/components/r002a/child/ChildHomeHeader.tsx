import { Pressable, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { colors, layout, opacity, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildHomeHeaderProps {
  avatarLabel: string;
  direction: TextDirection;
  helpLabel: string;
  helpOpen: boolean;
  onToggleHelp: () => void;
  onAvatarPress?: () => void;
  title: string;
}

export function ChildHomeHeader({
  avatarLabel,
  direction,
  helpLabel,
  helpOpen,
  onToggleHelp,
  onAvatarPress,
  title,
}: ChildHomeHeaderProps) {
  const helpControl = (
    <Pressable
      accessibilityLabel={helpLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: helpOpen }}
      aria-expanded={helpOpen}
      onPress={onToggleHelp}
      style={({ pressed }) => [styles.sideSlot, pressed ? styles.pressed : null]}
      testID="child-help-button"
    >
      <GhafIcon color={colors.ghafEmerald} name="help" size={27} />
    </Pressable>
  );
  const titleControl = (
    <View style={styles.titleSlot}>
      <Text
        accessibilityRole="header"
        align="center"
        brand
        color="ghafEmerald"
        direction={direction}
        variant="screenTitle"
      >
        {title}
      </Text>
    </View>
  );
  const avatarControl = onAvatarPress ? (
    <Pressable
      accessibilityLabel={avatarLabel}
      accessibilityRole="button"
      onPress={onAvatarPress}
      style={({ pressed }) => [styles.sideSlot, pressed ? styles.pressed : null]}
      testID="child-settings-button"
    >
      <View style={styles.avatar}>
        <GhafIcon color={colors.ghafEmerald} name="ghaf-tree" size={26} />
      </View>
    </Pressable>
  ) : (
    <View accessibilityLabel={avatarLabel} accessible style={styles.sideSlot}>
      <View style={styles.avatar}>
        <GhafIcon color={colors.ghafEmerald} name="ghaf-tree" size={26} />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.physicalRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        {direction === 'rtl' ? (
          <>
            {avatarControl}
            {titleControl}
            {helpControl}
          </>
        ) : (
          <>
            {helpControl}
            {titleControl}
            {avatarControl}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 2,
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
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  sideSlot: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.surfaceContainerLowest,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
});
