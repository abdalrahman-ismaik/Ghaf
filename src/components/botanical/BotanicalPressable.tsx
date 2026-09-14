import { forwardRef, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type View,
} from 'react-native';
import Animated, {
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { interactionMotion } from '@/design/motion';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Native press semantics are preserved while transforms run on the UI thread.
export const BotanicalPressable = forwardRef<View, PressableProps>(function BotanicalPressable(
  { android_ripple, disabled, onHoverIn, onHoverOut, onPressIn, onPressOut, style, ...props },
  ref,
) {
  const reducedMotion = useReducedMotionPreference();
  const nativeRipple = Platform.OS === 'android' && Boolean(android_ripple);
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (disabled || reducedMotion || nativeRipple) {
      cancelAnimation(scale);
      scale.set(1);
    }
    if (disabled || reducedMotion) {
      setPressed(false);
      setHovered(false);
    }
    return () => cancelAnimation(scale);
  }, [disabled, nativeRipple, reducedMotion, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const interactionState: PressableStateCallbackType & { readonly hovered: boolean } = {
    pressed: pressed && !disabled,
    hovered: hovered && !disabled,
  };

  return (
    <AnimatedPressable
      {...props}
      android_ripple={android_ripple}
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
        if (!disabled && !reducedMotion && !nativeRipple) {
          scale.set(
            withTiming(interactionMotion.displacement.pressScale, {
              duration: interactionMotion.timing.press,
              easing: interactionMotion.easing,
              // The live preference above supersedes Reanimated's startup snapshot.
              reduceMotion: ReduceMotion.Never,
            }),
          );
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        if (disabled || reducedMotion || nativeRipple) {
          cancelAnimation(scale);
          scale.set(1);
        } else {
          scale.set(
            withSpring(1, {
              ...interactionMotion.spring.pressRelease,
              reduceMotion: ReduceMotion.Never,
            }),
          );
        }
        onPressOut?.(event);
      }}
      ref={ref}
      style={[
        typeof style === 'function' ? style(interactionState) : style,
        animatedStyle,
        reducedMotion && interactionState.pressed && !nativeRipple
          ? { opacity: interactionMotion.reduced.pressedOpacity }
          : null,
      ]}
    />
  );
});
