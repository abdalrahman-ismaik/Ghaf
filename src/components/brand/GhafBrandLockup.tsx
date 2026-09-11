import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/primitives';
import {
  logicalRowDirection,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

import { GhafRasterLogo } from './GhafRasterLogo';

interface GhafBrandLockupProps {
  readonly brand: string;
  readonly direction: LayoutDirection;
  readonly language: TypographyLanguage;
  readonly logoSize?: number;
  readonly testID?: string;
}

export function GhafBrandLockup({
  brand,
  direction,
  language,
  logoSize = 44,
  testID,
}: GhafBrandLockupProps) {
  return (
    <View
      accessibilityLabel={brand}
      style={[styles.lockup, { flexDirection: logicalRowDirection(direction) }]}
      testID={testID}
    >
      <GhafRasterLogo decorative size={logoSize} testID={testID ? `${testID}-logo` : undefined} />
      <Text
        accessibilityRole="text"
        brand
        color="ghafEmerald"
        direction={direction}
        language={language}
        numberOfLines={1}
        variant="screenTitle"
      >
        {brand}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
