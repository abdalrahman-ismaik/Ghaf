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

  const orbStyle = useAnimatedStyle(() => ({
    opacity: 0.66 + reveal.get() * 0.34,
    transform: [{ scale: 0.92 + reveal.get() * 0.08 }],
  }));

  return (
    <Card elevated style={styles.card} testID="generation-experience">
      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.halo} />
        <Animated.View style={[styles.orb, orbStyle]}>
          <View style={styles.orbCore}>
            <Text align="center" color="white" style={styles.orbGlyph}>
              ❧
            </Text>
          </View>
        </Animated.View>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.copy}>
        <Text align="center" color="forest" variant="title">
          {title}
        </Text>
        <View style={styles.disclosurePill}>
          <Text align="center" color="earth" variant="caption">
            {disclosure}
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {stages.map((stage, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          const stateLabel = complete ? '✓' : String(index + 1);

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
                  color={active || complete ? 'white' : 'inkMuted'}
                  variant="caption"
                >
                  {stateLabel}
                </Text>
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
    borderColor: colors.sand,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
  },
  hero: {
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderCurve: 'continuous',
    backgroundColor: colors.goldGlow,
    borderWidth: 1,
    borderColor: colors.goldLight,
  },
  orb: {
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 47,
    borderCurve: 'continuous',
    backgroundColor: colors.leafLight,
  },
  orbCore: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: colors.ghaf,
  },
  orbGlyph: {
    fontSize: 38,
    lineHeight: 44,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  disclosurePill: {
    maxWidth: 380,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
    borderRadius: radii.pill,
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
    backgroundColor: colors.ghaf,
  },
  stageCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  activeLine: {
    width: '100%',
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
});
