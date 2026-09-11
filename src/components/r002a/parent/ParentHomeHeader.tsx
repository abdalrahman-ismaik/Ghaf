import { StyleSheet, View } from 'react-native';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { GhafHeaderTitle } from '@/components/brand';
import { botanical, colors, layout, opacity, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ParentHomeHeaderProps {
  direction: TextDirection;
  profileLabel: string;
  settingsLabel: string;
  settingsOpen: boolean;
  title: string;
  onToggleSettings: () => void;
}

export function ParentHomeHeader({
  direction,
  profileLabel,
  settingsLabel,
  settingsOpen,
  title,
  onToggleSettings,
}: ParentHomeHeaderProps) {
  return (
    <View style={styles.root}>
      <View style={styles.physicalRow}>
        <Pressable
          accessibilityLabel={settingsLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: settingsOpen }}
          aria-expanded={settingsOpen}
          onPress={onToggleSettings}
          style={({ pressed }) => [styles.sideSlot, pressed ? styles.pressed : null]}
          testID="parent-settings-button"
        >
          <GhafIcon color={colors.onSurfaceVariant} name="settings" size={25} />
        </Pressable>

        <View style={styles.titleSlot}>
          <GhafHeaderTitle color="ghafEmerald" direction={direction} title={title} />
        </View>

        <View accessibilityLabel={profileLabel} accessible style={styles.sideSlot}>
          <View style={styles.avatar}>
            <GhafIcon color={colors.ghafEmerald} name="person" size={24} />
          </View>
        </View>
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
    flexDirection: 'row',
  },
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
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.sage,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
