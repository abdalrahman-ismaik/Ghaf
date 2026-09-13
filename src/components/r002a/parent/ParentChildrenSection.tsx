import { StyleSheet, View } from 'react-native';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
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
      <Text
        accessibilityRole="header"
        brand
        color="deepForest"
        direction={direction}
        variant="heading"
      >
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
                color={item.selected ? botanical.colors.onForest : botanical.colors.forest}
                name={item.id === 'child_salem' ? 'ghaf-tree' : 'flower'}
                size={28}
              />
            </View>
            <View style={styles.content}>
              <View style={[styles.nameRow, { flexDirection: logicalRowDirection(direction) }]}>
                <Text brand direction={direction} style={styles.nameLabel} variant="heading">
                  {item.name}
                </Text>
                {item.selected ? (
                  <View
                    style={[styles.selectedChip, { flexDirection: logicalRowDirection(direction) }]}
                  >
                    <GhafIcon color={botanical.colors.forest} name="check-filled" size={18} />
                    <Text
                      brand
                      direction={direction}
                      style={styles.selectedLabel}
                      variant="caption"
                    >
                      {selectedLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text brand color="onSurfaceVariant" direction={direction}>
                {item.next}
              </Text>
              <View style={[styles.support, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={botanical.colors.forestRaised} name="help" size={17} />
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  style={styles.grow}
                  variant="caption"
                >
                  {item.support}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Button
        brand
        direction={direction}
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
    gap: spacing.sm,
  },
  row: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.md,
  },
  selectedRow: {
    borderColor: botanical.colors.forestRaised,
    backgroundColor: botanical.colors.sage,
  },
  avatar: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
  },
  selectedAvatar: {
    backgroundColor: botanical.colors.forest,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  nameRow: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  nameLabel: {
    minWidth: 0,
    flexShrink: 1,
    color: botanical.colors.ink,
  },
  selectedChip: {
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  selectedLabel: {
    flexShrink: 1,
    color: botanical.colors.forest,
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
