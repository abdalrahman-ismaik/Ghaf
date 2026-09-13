import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { ViewStyle as TamaguiViewStyle, TextStyle as TamaguiTextStyle } from 'tamagui';

// Tamagui 2 treats its style prop as raw CSS on web. Pass flattened native styles as
// style props instead, so its React Native compatibility mode resolves logical edges and units.
export function nativeViewStyles(style: StyleProp<ViewStyle>) {
  return StyleSheet.flatten(style) as TamaguiViewStyle;
}

export function nativeTextStyles(style: StyleProp<TextStyle>) {
  return StyleSheet.flatten(style) as TamaguiTextStyle;
}
