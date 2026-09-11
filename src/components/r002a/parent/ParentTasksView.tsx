import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';

export type ParentTasksViewState = 'empty' | 'current' | 'task_added';

export interface ParentTaskProjection {
  title: string;
  childLabel: string;
  statusLabel: string;
  metaLabel?: string;
  supportLabel?: string;
}

export interface ParentTasksViewProps {
  heading: string;
  direction: LayoutDirection;
  state: ParentTasksViewState;
  current: ParentTaskProjection | null;
  emptyTitle: string;
  emptyMessage: string;
  taskAddedMessage: string;
  actionLabel: string;
  onAction: () => void;
  actionTestID?: string;
  showAction?: boolean;
  testID?: string;
}

export function ParentTasksView({
  heading,
  direction,
  state,
  current,
  emptyTitle,
  emptyMessage,
  taskAddedMessage,
  actionLabel,
  onAction,
  actionTestID,
  showAction = true,
  testID = 'parent-tasks-view',
}: ParentTasksViewProps) {
  const hasCurrent = state !== 'empty' && current !== null;

  return (
    <View style={styles.root} testID={testID}>
      <Text brand color="r001Ink" direction={direction} variant="parentHero">
        {heading}
      </Text>

      {state === 'task_added' && hasCurrent ? (
        <View
          accessibilityLiveRegion="polite"
          accessible
          style={[styles.addedBanner, { flexDirection: logicalRowDirection(direction) }]}
          testID="parent-task-added-status"
        >
          <GhafIcon color={colors.ghafEmerald} name="check-filled" size={28} />
          <Text
            brand
            color="ghafEmerald"
            direction={direction}
            style={styles.flexText}
            variant="body"
          >
            {taskAddedMessage}
          </Text>
        </View>
      ) : null}

      {hasCurrent ? (
        <View style={styles.taskCard} testID="parent-current-task">
          <View style={[styles.taskHeading, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.iconWell}>
              <GhafIcon color={colors.ghafEmerald} name="leaf" size={28} />
            </View>
            <View style={styles.flexText}>
              <Text brand color="r001Ink" direction={direction} variant="heading">
                {current.title}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction} variant="body">
                {current.childLabel}
              </Text>
            </View>
          </View>

          <View style={[styles.details, { flexDirection: logicalRowDirection(direction) }]}>
            <View style={styles.statusChip}>
              <Text align="center" brand color="ghafEmerald" direction={direction} variant="label">
                {current.statusLabel}
              </Text>
            </View>
            {current.metaLabel ? (
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {current.metaLabel}
              </Text>
            ) : null}
          </View>

          {current.supportLabel ? (
            <View style={[styles.supportRow, { flexDirection: logicalRowDirection(direction) }]}>
              <GhafIcon color={colors.mangroveTeal} name="help" size={22} />
              <Text
                brand
                color="onSurfaceVariant"
                direction={direction}
                style={styles.flexText}
                variant="body"
              >
                {current.supportLabel}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View
          accessibilityLabel={[emptyTitle, emptyMessage].join('. ')}
          accessible
          style={styles.emptyCard}
        >
          <View style={styles.emptyIcon}>
            <GhafIcon color={colors.ghafEmerald} name="leaf" size={34} />
          </View>
          <Text align="center" brand color="r001Ink" direction={direction} variant="heading">
            {emptyTitle}
          </Text>
          <Text align="center" brand color="onSurfaceVariant" direction={direction} variant="body">
            {emptyMessage}
          </Text>
        </View>
      )}

      {showAction ? (
        <Button
          brand
          direction={direction}
          icon={<GhafIcon color={colors.onPrimary} name="plus" size={24} />}
          onPress={onAction}
          size="regular"
          testID={actionTestID}
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  addedBanner: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  taskCard: {
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  taskHeading: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWell: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
  details: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  supportRow: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.water,
    padding: spacing.sm,
  },
  emptyCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
  flexText: {
    flex: 1,
    minWidth: 0,
  },
});
