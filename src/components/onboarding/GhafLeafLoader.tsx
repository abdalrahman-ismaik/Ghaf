import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii } from '@/design/tokens';

interface GhafLeafLoaderProps {
  readonly accessibilityLabel: string;
  readonly testID?: string;
}

export function GhafLeafLoader({ accessibilityLabel, testID }: GhafLeafLoaderProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const rotation = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(rotation);
    rotation.set(0);
    if (reducedMotion) return;

    rotation.set(
      withRepeat(
        withTiming(360, {
          duration: 1_600,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={styles.orbit}
      testID={testID}
    >
      <Animated.View aria-hidden style={[StyleSheet.absoluteFill, rotationStyle]}>
        <View style={[styles.leaf, styles.leafTop]} />
        <View style={[styles.leaf, styles.leafEnd]} />
        <View style={[styles.leaf, styles.leafStart]} />
      </Animated.View>
      <View aria-hidden style={styles.seed} />
    </View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaf: {
    position: 'absolute',
    width: 13,
    height: 22,
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    borderBottomLeftRadius: 3,
  },
  leafTop: {
    top: 1,
    left: 22,
    backgroundColor: colors.ghafEmerald,
    transform: [{ rotate: '38deg' }],
  },
  leafEnd: {
    right: 4,
    bottom: 8,
    backgroundColor: colors.mangrove,
    transform: [{ rotate: '158deg' }],
  },
  leafStart: {
    left: 4,
    bottom: 8,
    backgroundColor: colors.leaf,
    transform: [{ rotate: '-82deg' }],
  },
  seed: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
});
