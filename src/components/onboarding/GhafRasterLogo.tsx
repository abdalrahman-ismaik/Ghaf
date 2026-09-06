import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

interface GhafRasterLogoProps {
  readonly accessibilityLabel?: string;
  readonly decorative?: boolean;
  readonly size?: number;
  readonly style?: StyleProp<ImageStyle>;
  readonly testID?: string;
}

const officialGhafRasterLogo = require('../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png');

export function GhafRasterLogo({
  accessibilityLabel,
  decorative = false,
  size = 64,
  style,
  testID,
}: GhafRasterLogoProps) {
  return (
    <Image
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityRole={decorative ? undefined : 'image'}
      accessible={!decorative}
      aria-hidden={decorative || undefined}
      cachePolicy="memory-disk"
      contentFit="contain"
      priority="high"
      source={officialGhafRasterLogo}
      style={[styles.logo, { height: size, width: size }, style]}
      testID={testID}
      transition={0}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
