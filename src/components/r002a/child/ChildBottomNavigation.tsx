import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon, type GhafIconName } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, layout, spacing } from '@/design/tokens';
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
              style={[
                styles.item,
                active ? styles.activeItem : null,
                item.disabled ? styles.disabled : null,
              ]}
              testID={`child-nav-${item.id}`}
            >
              <GhafIcon
                color={active ? botanical.colors.onForest : botanical.colors.muted}
                name={item.icon}
                size={23}
              />
              <Text
                align="center"
                brand
                color={active ? 'onSecondaryContainer' : 'onSurfaceVariant'}
                direction={direction}
                style={active ? styles.activeLabel : styles.inactiveLabel}
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
    borderTopColor: botanical.colors.line,
    backgroundColor: botanical.colors.canvas,
    paddingTop: botanical.space.small,
    paddingHorizontal: layout.screenPadding,
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
    minHeight: layout.touchTarget + spacing.sm,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  activeItem: {
    backgroundColor: botanical.colors.forest,
  },
  activeLabel: { color: botanical.colors.onForest },
  inactiveLabel: { color: botanical.colors.muted },
  disabled: {
    opacity: 0.72,
  },
});
