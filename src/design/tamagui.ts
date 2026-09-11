import { createAnimations } from '@tamagui/animations-reanimated';
import { createFont, createTamagui, createTokens } from 'tamagui';
import { Easing, ReduceMotion } from 'react-native-reanimated';

import { botanical, botanicalFonts, spacing } from './tokens';

const size = { 0: 0, 1: 16, 2: 24, 3: 32, 4: 48, 5: 56, 6: 64, true: 48 };
const colors = botanical.colors;

// Components retain the locale-aware role resolver, including font-load failure fallback.
export const ghafTamaguiConfig = createTamagui({
  tokens: createTokens({
    color: colors,
    size,
    space: { ...spacing, 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, true: 16 },
    radius: { ...botanical.radius, 0: 0, 1: 10, 2: 16, 3: 20, 4: 28, true: 16 },
    zIndex: { 0: 0, 1: 1, 2: 10, 3: 100 },
  }),
  fonts: {
    body: createFont(botanicalFonts.body),
    heading: createFont(botanicalFonts.heading),
  },
  themes: {
    light: {
      background: colors.canvas,
      backgroundHover: colors.paper,
      backgroundPress: colors.sage,
      backgroundFocus: colors.paper,
      color: colors.ink,
      colorHover: colors.forest,
      colorPress: colors.forest,
      colorFocus: colors.forest,
      borderColor: colors.line,
      borderColorHover: colors.sageStrong,
      borderColorPress: colors.forest,
      borderColorFocus: colors.forest,
      placeholderColor: colors.muted,
      shadowColor: colors.forest,
    },
  },
  animations: createAnimations({
    press: {
      type: 'timing',
      duration: botanical.motion.press,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    },
    state: {
      type: 'timing',
      duration: botanical.motion.state,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    },
  }),
  settings: { defaultFont: 'body', styleCompat: 'react-native' },
});

type GhafTamaguiConfig = typeof ghafTamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Tamagui requires interface augmentation.
  interface TamaguiCustomConfig extends GhafTamaguiConfig {}
}
