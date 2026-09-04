import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

import type { ChildTaskCheckpoint } from './ChildTaskChecklist';

interface ChildTaskPlanCardProps {
  direction: TextDirection;
  steps: readonly ChildTaskCheckpoint[];
  title: string;
}

export function ChildTaskPlanCard({ direction, steps, title }: ChildTaskPlanCardProps) {
  const formatter = new Intl.NumberFormat(direction === 'rtl' ? 'ar-AE' : 'en-AE');

  return (
    <View style={styles.card} testID="child-task-plan">
      <View style={[styles.heading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.ghafEmerald} name="calendar" size={24} />
        <Text
          brand
          color="deepForest"
          direction={direction}
          style={styles.grow}
          variant="screenTitle"
        >
          {title}
        </Text>
      </View>
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <View
            accessibilityLabel={`${formatter.format(index + 1)}. ${step.title}. ${step.detail}`}
            accessible
            key={step.id}
            style={[styles.step, { flexDirection: logicalRowDirection(direction) }]}
          >
            <View style={styles.number}>
              <Text
                align="center"
                brand
                color="ghafEmerald"
                direction={direction}
                tabular
                variant="label"
              >
                {formatter.format(index + 1)}
              </Text>
            </View>
            <View aria-hidden style={styles.copy}>
              <Text brand color="deepForest" direction={direction} variant="label">
                {step.title}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction}>
                {step.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  heading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  steps: {
    gap: spacing.md,
  },
  step: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  number: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
    paddingTop: spacing.xxs,
  },
});
