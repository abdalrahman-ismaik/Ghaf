import { forwardRef, useEffect, useState } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { botanical } from '@/design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Native press semantics are preserved while transforms run on the UI thread.
export const BotanicalPressable = forwardRef<View, PressableProps>(function BotanicalPressable(
  { disabled, onHoverIn, onHoverOut, onPressIn, onPressOut, style, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (disabled || reducedMotion) {
      cancelAnimation(scale);
      scale.set(1);
    }
    if (disabled) {
      setPressed(false);
      setHovered(false);
    }
    return () => cancelAnimation(scale);
  }, [disabled, reducedMotion, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const settle = (target: number) => {
    scale.set(
      withTiming(target, {
        duration: botanical.motion.press,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onPressIn={(event) => {
        setPressed(true);
        if (!disabled && !reducedMotion) settle(botanical.motion.pressScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        settle(1);
        onPressOut?.(event);
      }}
      ref={ref}
      style={[
        typeof style === 'function'
          ? style({ pressed: pressed && !disabled, hovered: hovered && !disabled })
          : style,
        animatedStyle,
      ]}
    />
  );
});
