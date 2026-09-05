import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhafIcon, type GhafIconName } from '@/components/access';
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

type ParentNavigationKey = 'family' | 'garden' | 'home' | 'tasks';

interface ParentNavigationItem {
  icon: GhafIconName;
  key: ParentNavigationKey;
  label: string;
  onPress: () => void;
}

interface ParentHomeNavigationProps {
  activeKey: ParentNavigationKey;
  familyLabel: string;
  direction: TextDirection;
  gardenLabel: string;
  homeLabel: string;
  tasksLabel: string;
  onFamily: () => void;
  onGarden: () => void;
  onHome: () => void;
  onTasks: () => void;
}

export function ParentHomeNavigation({
  activeKey,
  familyLabel,
  direction,
  gardenLabel,
  homeLabel,
  tasksLabel,
  onFamily,
  onGarden,
  onHome,
  onTasks,
}: ParentHomeNavigationProps) {
  const insets = useSafeAreaInsets();
  const items: readonly ParentNavigationItem[] = [
    { icon: 'home', key: 'home', label: homeLabel, onPress: onHome },
    { icon: 'check', key: 'tasks', label: tasksLabel, onPress: onTasks },
    { icon: 'flower', key: 'garden', label: gardenLabel, onPress: onGarden },
    { icon: 'family', key: 'family', label: familyLabel, onPress: onFamily },
  ];

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <View style={[styles.items, { flexDirection: logicalRowDirection(direction) }]}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              aria-selected={active}
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.item,
                active ? styles.activeItem : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`parent-nav-${item.key}`}
            >
              <GhafIcon
                color={active ? colors.onPrimary : colors.onSurfaceVariant}
                name={item.icon}
                size={22}
              />
              <Text
                align="center"
                brand
                color={active ? 'onPrimary' : 'onSurfaceVariant'}
                style={styles.label}
                variant="caption"
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    paddingTop: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    ...r001Shadows.sheet,
  },
  items: {
    minWidth: 0,
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: spacing.xxs,
  },
  item: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  label: {
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
  activeItem: {
    backgroundColor: colors.ghafEmerald,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
});
