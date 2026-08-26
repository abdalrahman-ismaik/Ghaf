import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Card, Text } from '@/components/primitives';
import { colors, motion, radii, spacing } from '@/design/tokens';

interface MissionGenerationExperienceProps {
  activeIndex: number;
  disclosure: string;
  stages: readonly string[];
  title: string;
}

export function MissionGenerationExperience({
  activeIndex,
  disclosure,
  stages,
  title,
}: MissionGenerationExperienceProps) {
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.set(0);
    reveal.set(
      withTiming(1, {
        duration: motion.duration.standard,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );

    return () => cancelAnimation(reveal);
  }, [activeIndex, reveal]);

  const plateStyle = useAnimatedStyle(() => ({
    opacity: 0.66 + reveal.get() * 0.34,
    transform: [{ translateY: (1 - reveal.get()) * 8 }],
  }));

  return (
    <Card style={styles.card} testID="generation-experience">
      <View style={styles.hero}>
        <Animated.View style={[styles.recordPlate, plateStyle]}>
          <View style={styles.recordSpine} />
          <View style={styles.signalRows}>
            <View style={[styles.signalLine, styles.signalLineLong]} />
            <View style={[styles.signalLine, styles.signalLineShort]} />
            <View style={[styles.signalLine, styles.signalLineMedium]} />
            <View style={[styles.signalLine, styles.signalLineLong]} />
          </View>
          <View style={styles.recordNode} />
        </Animated.View>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.copy}>
        <Text color="forest" variant="title">
          {title}
        </Text>
        <View style={styles.disclosureLine}>
          <Text color="earth" variant="caption">
            {disclosure}
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {stages.map((stage, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          const stateLabel = String(index + 1);

          return (
            <View
              accessibilityState={{ selected: active }}
              key={stage}
              style={styles.stageRow}
              testID={`generation-stage-${index + 1}`}
            >
              <View
                style={[
                  styles.stageMarker,
                  complete ? styles.stageMarkerComplete : null,
                  active ? styles.stageMarkerActive : null,
                ]}
              >
                <Text
                  align="center"
                  color={active ? 'white' : complete ? 'ghaf' : 'inkMuted'}
                  variant="caption"
                >
                  {stateLabel}
                </Text>
                {complete ? <View style={styles.completedTick} /> : null}
              </View>
              <View style={styles.stageCopy}>
                <Text color={active ? 'forest' : complete ? 'ghaf' : 'inkMuted'} variant="label">
                  {stage}
                </Text>
                {active ? <View style={styles.activeLine} /> : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: spacing.xl,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
  },
  hero: {
    height: 118,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  recordPlate: {
    height: 104,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.md,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recordSpine: {
    position: 'absolute',
    left: spacing.lg,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.ghaf,
  },
  signalRows: {
    gap: spacing.sm,
    paddingLeft: spacing.xxxl,
    paddingRight: spacing.lg,
  },
  signalLine: {
    height: 3,
    backgroundColor: colors.leaf,
  },
  signalLineLong: {
    width: '88%',
  },
  signalLineMedium: {
    width: '68%',
  },
  signalLineShort: {
    width: '42%',
    backgroundColor: colors.gold,
  },
  recordNode: {
    position: 'absolute',
    left: spacing.md,
    top: 46,
    width: 11,
    height: 11,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.ivory,
    backgroundColor: colors.gold,
  },
  copy: {
    gap: spacing.sm,
  },
  disclosureLine: {
    borderTopWidth: 1,
    borderTopColor: colors.gold,
    paddingTop: spacing.sm,
  },
  timeline: {
    gap: spacing.xs,
  },
  stageRow: {
    flexDirection: 'row',
    minHeight: 58,
    alignItems: 'center',
    gap: spacing.md,
  },
  stageMarker: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  stageMarkerActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  stageMarkerComplete: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafMist,
  },
  completedTick: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 6,
    height: 6,
    backgroundColor: colors.ghaf,
  },
  stageCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  activeLine: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gold,
  },
});
