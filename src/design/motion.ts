import { Easing, ReduceMotion, type WithSpringConfig } from 'react-native-reanimated';

import { botanical } from './tokens';

// Extend the existing botanical durations without changing frozen visual tokens.
export const interactionMotion = {
  timing: {
    press: botanical.motion.press,
    fade: 140,
    state: botanical.motion.state,
    panel: botanical.motion.sheet,
    busyOrbit: 1_600,
  },
  displacement: { pressScale: botanical.motion.pressScale, panel: 24, story: 8 },
  easing: Easing.out(Easing.cubic),
  // A small, firm return with no overshoot. Retargeting starts at the live value.
  spring: {
    pressRelease: {
      stiffness: 900,
      damping: 60,
      mass: 1,
      overshootClamping: true,
      reduceMotion: ReduceMotion.System,
    } satisfies WithSpringConfig,
  },
  reduced: { duration: 0, scale: 1, translation: 0, pressedOpacity: 0.88 },
} as const;
