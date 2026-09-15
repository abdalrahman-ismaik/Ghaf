import type { NativeStackNavigationOptions } from 'expo-router';

import { colors } from './tokens';

// Native stacks own page motion and its reverse; components must not animate the root again.
// Android's small vertical fade avoids physical left/right assumptions in Arabic layouts.
export function navigationMotionOptions(
  platform: string,
  reducedMotion: boolean,
  kind: 'detail' | 'peer' = 'detail',
): NativeStackNavigationOptions {
  return {
    // Existing header Back actions replace with a peer; reverse the departing detail in that case.
    animationTypeForReplace: kind === 'peer' ? 'pop' : 'push',
    animation:
      reducedMotion || kind === 'peer'
        ? 'none'
        : platform === 'android'
          ? 'fade_from_bottom'
          : platform === 'ios'
            ? 'default'
            : 'fade',
    contentStyle: { backgroundColor: colors.ivory },
    headerShown: false,
  };
}
