import { Pressable, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, logicalRowDirection, opacity, r001Radii, spacing } from '@/design/tokens';
import type { SyntheticChildId, TextDirection } from '@/models/familyGrowth';

export interface ParentChildSummaryItem {
  id: SyntheticChildId;
  name: string;
  next: string;
  selected: boolean;
  support: string;
}

interface ParentChildrenSectionProps {
  createTaskLabel: string;
  direction: TextDirection;
  items: readonly ParentChildSummaryItem[];
  selectedLabel: string;
  title: string;
  onCreateTask: () => void;
  onSelectChild: (childId: SyntheticChildId) => void;
}

export function ParentChildrenSection({
  createTaskLabel,
  direction,
  items,
  selectedLabel,
  title,
  onCreateTask,
  onSelectChild,
}: ParentChildrenSectionProps) {
  return (
    <View style={styles.section}>
      <Text brand color="deepForest" variant="screenTitle">
        {title}
      </Text>

      <View style={styles.rows}>
        {items.map((item) => (
          <Pressable
            accessibilityLabel={`${item.name}. ${item.next}${item.selected ? `. ${selectedLabel}` : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: item.selected }}
            key={item.id}
            onPress={() => onSelectChild(item.id)}
            style={({ pressed }) => [
              styles.row,
              { flexDirection: logicalRowDirection(direction) },
              item.selected ? styles.selectedRow : null,
              pressed ? styles.pressed : null,
            ]}
            testID={`parent-child-${item.id}`}
          >
            <View style={[styles.avatar, item.selected ? styles.selectedAvatar : null]}>
              <GhafIcon
                color={item.selected ? colors.ghafEmerald : colors.mangroveTeal}
                name="child"
                size={28}
              />
            </View>
            <View style={styles.content}>
              <View style={[styles.nameRow, { flexDirection: logicalRowDirection(direction) }]}>
                <Text brand color="onSurface" variant="bodyLarge">
                  {item.name}
                </Text>
                {item.selected ? (
                  <View style={styles.selectedChip}>
                    <Text brand color="primary" variant="caption">
                      {selectedLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text brand color="onSurfaceVariant">
                {item.next}
              </Text>
              <View style={[styles.support, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={colors.solarAmber} name="help" size={17} />
                <Text brand color="onSurfaceVariant" style={styles.grow} variant="caption">
                  {item.support}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Button
        brand
        icon={<GhafIcon color={colors.ghafEmerald} name="plus" size={22} />}
        onPress={onCreateTask}
        testID="parent-create-task-button"
        variant="secondary"
      >
        {createTaskLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  rows: {
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
  },
  row: {
    minHeight: 104,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    padding: spacing.md,
  },
  selectedRow: {
    backgroundColor: colors.ghafEmeraldSelection,
  },
  avatar: {
    width: 56,
    height: 56,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainer,
  },
  selectedAvatar: {
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.surfaceContainerLowest,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  nameRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  selectedChip: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmeraldTint,
    paddingHorizontal: spacing.sm,
  },
  support: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingTop: spacing.xxs,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
