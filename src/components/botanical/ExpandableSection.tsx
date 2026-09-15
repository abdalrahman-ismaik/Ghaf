import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { interactionMotion } from '@/design/motion';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

export interface ExpandableSectionProps extends PropsWithChildren {
  expanded: boolean;
  testID?: string;
}

// A real measured disclosure: the children keep their own layout and the container travels
// to that measurement. Nothing is stretched, scaled or reflowed to imitate expansion.
export function ExpandableSection({ children, expanded, testID }: ExpandableSectionProps) {
  const reducedMotion = useReducedMotionPreference();
  // Collapsed content that was never opened costs nothing; once opened it stays mounted so
  // the closing animation has something to show and reopening never remeasures from zero.
  const [presented, setPresented] = useState(expanded);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const height = useSharedValue(expanded && contentHeight !== null ? contentHeight : 0);
  const fade = useSharedValue(expanded ? 1 : 0);
  const settled = useRef<number | null>(null);
  if (expanded && !presented) setPresented(true);

  useEffect(() => {
    // The first opening waits one layout pass for a real height instead of guessing one.
    if (contentHeight === null) return;
    const target = expanded ? contentHeight : 0;
    if (settled.current === target && !reducedMotion) return;
    settled.current = target;
    cancelAnimation(height);
    cancelAnimation(fade);
    if (reducedMotion) {
      height.set(target);
      fade.set(expanded ? 1 : 0);
      return;
    }
    // Retargeting starts at the live height, so a reversed toggle never jumps.
    height.set(
      withTiming(target, {
        duration: interactionMotion.timing.disclosure,
        easing: interactionMotion.easing,
        // The live preference above supersedes Reanimated's startup snapshot.
        reduceMotion: ReduceMotion.Never,
      }),
    );
    fade.set(
      withTiming(expanded ? 1 : 0, {
        duration: interactionMotion.timing.disclosureFade,
        easing: interactionMotion.easing,
        reduceMotion: ReduceMotion.Never,
      }),
    );
  }, [contentHeight, expanded, fade, height, reducedMotion]);

  useEffect(
    () => () => {
      cancelAnimation(height);
      cancelAnimation(fade);
    },
    [fade, height],
  );

  const containerStyle = useAnimatedStyle(() => ({ height: height.get() }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const measure = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    setContentHeight((current) => (current === next ? current : next));
  };

  if (!presented) return null;

  return (
    <Animated.View
      // A closed section is not reachable by touch or by TalkBack even while it settles.
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
      pointerEvents={expanded ? 'auto' : 'none'}
      style={[styles.container, containerStyle]}
      testID={testID}
    >
      <Animated.View onLayout={measure} style={contentStyle}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
