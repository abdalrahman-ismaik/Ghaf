import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { interactionMotion } from '@/design/motion';
import { botanical, layout, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

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

// A toggle has already changed the store. Motion only carries the eye from the previous
// state to the new one; the committed value is readable without it.
function useSettledProgress(target: number) {
  const reducedMotion = useReducedMotionPreference();
  const progress = useSharedValue(target);
  const settled = useRef(target);

  useEffect(() => {
    if (settled.current === target && !reducedMotion) return;
    settled.current = target;
    cancelAnimation(progress);
    if (reducedMotion) {
      progress.set(target);
      return;
    }
    // Retargeting starts at the live value, so a fast second toggle never restarts.
    progress.set(
      withTiming(target, {
        duration: interactionMotion.timing.progress,
        easing: interactionMotion.easing,
        // The live preference above supersedes Reanimated's startup snapshot.
        reduceMotion: ReduceMotion.Never,
      }),
    );
  }, [progress, reducedMotion, target]);

  useEffect(() => () => cancelAnimation(progress), [progress]);
  return progress;
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
  const progress = steps.length === 0 ? 0 : completedCount / steps.length;
  const fill = useSettledProgress(progress);
  // The track clips the rounded ends, so the fill scales from the reading start edge.
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.get() }] }));

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
        <Animated.View
          style={[
            styles.progressFill,
            direction === 'rtl' ? styles.fillRtl : styles.fillLtr,
            fillStyle,
          ]}
        />
      </View>

      <View style={styles.steps}>
        {steps.map((step) => (
          <ChecklistStep
            completed={completedStepIds.includes(step.id)}
            direction={direction}
            key={step.id}
            onToggle={onToggle}
            step={step}
          />
        ))}
      </View>
    </View>
  );
}

function ChecklistStep({
  completed,
  direction,
  onToggle,
  step,
}: {
  completed: boolean;
  direction: TextDirection;
  onToggle: (stepId: string) => void;
  step: ChildTaskCheckpoint;
}) {
  const settle = useSettledProgress(completed ? 1 : 0);
  const surfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      settle.get(),
      [0, 1],
      [botanical.colors.paper, botanical.colors.sage],
    ),
    // The resting border matches the row's own surface instead of a transparent colour,
    // so the fade never passes through the dark value that alpha interpolation produces.
    borderColor: interpolateColor(
      settle.get(),
      [0, 1],
      [botanical.colors.paper, botanical.colors.sageStrong],
    ),
  }));
  // The mark stays mounted so a reopened or reordered row never replays an entrance.
  const markStyle = useAnimatedStyle(() => ({
    opacity: settle.get(),
    transform: [{ scale: 0.72 + settle.get() * 0.28 }],
  }));

  return (
    <Pressable
      accessibilityLabel={`${step.title}. ${step.detail}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      aria-checked={completed}
      onPress={() => onToggle(step.id)}
      animatedStyle={surfaceStyle}
      style={[styles.step, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
      testID={`task-step-${step.id}`}
    >
      <View style={[styles.check, completed ? styles.checkCompleted : null]}>
        <Animated.View style={markStyle}>
          <GhafIcon color={botanical.colors.forest} name="check-filled" size={30} />
        </Animated.View>
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
    width: '100%',
    height: '100%',
    backgroundColor: botanical.colors.forest,
  },
  fillRtl: {
    transformOrigin: 'right center',
  },
  fillLtr: {
    transformOrigin: 'left center',
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
    padding: spacing.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
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
});
