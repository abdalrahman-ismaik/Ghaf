import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Text } from '@/components/primitives';
import { colors, layout, opacity, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

export type ChildNavigationKey = 'league' | 'garden' | 'today';

interface ChildBottomNavigationProps {
  activeKey: ChildNavigationKey;
  direction: TextDirection;
  gardenLabel: string;
  leagueLabel: string;
  leagueUnavailableHint: string;
  onGarden: () => void;
  onLeague?: () => void;
  onToday: () => void;
  todayLabel: string;
}

interface NavigationItem {
  disabled: boolean;
  icon: GhafIconName;
  id: ChildNavigationKey;
  label: string;
  onPress?: () => void;
}

export function ChildBottomNavigation({
  activeKey,
  direction,
  gardenLabel,
  leagueLabel,
  leagueUnavailableHint,
  onGarden,
  onLeague,
  onToday,
  todayLabel,
}: ChildBottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const items: readonly NavigationItem[] = [
    { disabled: false, icon: 'calendar', id: 'today', label: todayLabel, onPress: onToday },
    { disabled: false, icon: 'flower', id: 'garden', label: gardenLabel, onPress: onGarden },
    {
      disabled: !onLeague,
      icon: 'league',
      id: 'league',
      label: leagueLabel,
      onPress: onLeague,
    },
  ];

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <View style={[styles.physicalRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        {items.map((item) => {
          const active = item.id === activeKey;
          return (
            <Pressable
              accessibilityHint={item.disabled ? leagueUnavailableHint : undefined}
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ disabled: item.disabled, selected: active }}
              aria-disabled={item.disabled}
              aria-selected={active}
              disabled={item.disabled}
              key={item.id}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.item,
                active ? styles.activeItem : null,
                pressed && !item.disabled ? styles.pressed : null,
                item.disabled ? styles.disabled : null,
              ]}
              testID={`child-nav-${item.id}`}
            >
              <GhafIcon
                color={active ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                name={item.icon}
                size={23}
              />
              <Text
                align="center"
                brand
                color={active ? 'onSecondaryContainer' : 'onSurfaceVariant'}
                direction={direction}
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
  physicalRow: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  item: {
    minWidth: 64,
    minHeight: layout.touchTarget + spacing.xs,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  activeItem: {
    backgroundColor: colors.secondaryContainer,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.72,
  },
});
