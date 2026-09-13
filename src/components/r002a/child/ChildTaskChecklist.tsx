import { StyleSheet, View } from 'react-native';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

export interface ChildTaskCheckpoint {
  detail: string;
  id: string;
  title: string;
}

interface ChildTaskChecklistProps {
  completedLabel: string;
  completedStepIds: readonly string[];
  direction: TextDirection;
  onToggle: (stepId: string) => void;
  steps: readonly ChildTaskCheckpoint[];
  title: string;
}

export function ChildTaskChecklist({
  completedLabel,
  completedStepIds,
  direction,
  onToggle,
  steps,
  title,
}: ChildTaskChecklistProps) {
  const completedCount = completedStepIds.length;
  const progress = steps.length === 0 ? 0 : (completedCount / steps.length) * 100;

  return (
    <View style={styles.card} testID="child-task-checklist">
      <View style={[styles.heading, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          brand
          color="deepForest"
          direction={direction}
          style={styles.grow}
          variant="screenTitle"
        >
          {title}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} tabular variant="caption">
          {completedLabel}
        </Text>
      </View>
      <View
        accessibilityLabel={completedLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: steps.length, now: completedCount }}
        style={styles.progressTrack}
        testID="task-step-progress"
      >
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
            direction === 'rtl' ? styles.fillRtl : styles.fillLtr,
          ]}
        />
      </View>

      <View style={styles.steps}>
        {steps.map((step) => {
          const completed = completedStepIds.includes(step.id);
          return (
            <Pressable
              accessibilityLabel={`${step.title}. ${step.detail}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              aria-checked={completed}
              key={step.id}
              onPress={() => onToggle(step.id)}
              style={({ pressed }) => [
                styles.step,
                direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
                completed ? styles.stepCompleted : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`task-step-${step.id}`}
            >
              <View style={[styles.check, completed ? styles.checkCompleted : null]}>
                {completed ? (
                  <GhafIcon color={botanical.colors.forest} name="check-filled" size={30} />
                ) : null}
              </View>
              <View style={styles.copy}>
                <Text
                  brand
                  color={completed ? 'ghafEmerald' : 'deepForest'}
                  direction={direction}
                  style={completed ? styles.completedText : null}
                  variant="label"
                >
                  {step.title}
                </Text>
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  style={completed ? styles.completedText : null}
                  variant="body"
                >
                  {step.detail}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingVertical: botanical.space.small,
  },
  heading: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
  },
  progressFill: {
    height: '100%',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.forest,
  },
  fillRtl: {
    alignSelf: 'flex-end',
  },
  fillLtr: {
    alignSelf: 'flex-start',
  },
  steps: {
    gap: spacing.sm,
  },
  step: {
    minHeight: layout.touchTarget + spacing.xl,
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.transparent,
    backgroundColor: botanical.colors.paper,
    padding: spacing.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  stepCompleted: {
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.sage,
  },
  check: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    borderWidth: 2,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
  },
  checkCompleted: {
    borderColor: botanical.colors.forest,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  completedText: {
    opacity: 1,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
