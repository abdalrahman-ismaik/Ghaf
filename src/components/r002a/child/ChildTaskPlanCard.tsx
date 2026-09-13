import { Platform, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

import type { ChildTaskCheckpoint } from './ChildTaskChecklist';

interface ChildTaskPlanCardProps {
  direction: TextDirection;
  steps: readonly ChildTaskCheckpoint[];
  title: string;
}

export function ChildTaskPlanCard({ direction, steps, title }: ChildTaskPlanCardProps) {
  const formatter = new Intl.NumberFormat(direction === 'rtl' ? 'ar-AE' : 'en-AE');
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.card} testID="child-task-plan">
      <View style={[styles.heading, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={botanical.colors.forest} name="calendar" size={24} />
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
            accessibilityLabel={
              isWeb ? undefined : `${formatter.format(index + 1)}. ${step.title}. ${step.detail}`
            }
            accessible={!isWeb}
            key={step.id}
            style={[styles.step, { flexDirection: logicalRowDirection(direction) }]}
          >
            <View
              accessibilityElementsHidden={!isWeb}
              aria-hidden={isWeb ? undefined : true}
              importantForAccessibility={isWeb ? undefined : 'no-hide-descendants'}
              style={styles.number}
            >
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
            <View
              accessibilityElementsHidden={!isWeb}
              aria-hidden={isWeb ? undefined : true}
              importantForAccessibility={isWeb ? undefined : 'no-hide-descendants'}
              style={styles.copy}
            >
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
    gap: botanical.space.row,
    paddingVertical: botanical.space.small,
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
    paddingVertical: botanical.space.small,
  },
  number: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.sage,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
    paddingTop: spacing.xxs,
  },
});
