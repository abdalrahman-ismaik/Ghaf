import { StyleSheet, View } from 'react-native';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { BotanicalAvatar, GhafIcon } from '@/components/access';
import { GhafHeaderTitle } from '@/components/brand';
import { botanical, layout, opacity, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';
import type { ChildTreeAvatarId } from '@/models/parentOnboarding';

interface ChildHomeHeaderProps {
  avatarId?: ChildTreeAvatarId;
  avatarLabel: string;
  direction: TextDirection;
  helpLabel: string;
  helpOpen: boolean;
  onToggleHelp: () => void;
  onAvatarPress?: () => void;
  title: string;
}

export function ChildHomeHeader({
  avatarId = 'ghaf_tree',
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
      <GhafIcon color={botanical.colors.forest} name="help" size={27} />
    </Pressable>
  );
  const titleControl = (
    <View style={styles.titleSlot}>
      <GhafHeaderTitle color="ghafEmerald" direction={direction} title={title} />
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
      <BotanicalAvatar direction={direction} id={avatarId} size={40} style={styles.avatar} />
    </Pressable>
  ) : (
    <View accessibilityLabel={avatarLabel} accessible style={styles.sideSlot}>
      <BotanicalAvatar direction={direction} id={avatarId} size={40} style={styles.avatar} />
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
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.sage,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
