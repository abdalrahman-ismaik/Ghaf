import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/primitives';
import { logicalRowDirection, spacing, type AppColor, type LayoutDirection } from '@/design/tokens';
import type { LocaleCode } from '@/models/familyGrowth';

import { GhafRasterLogo } from './GhafRasterLogo';

export interface GhafHeaderTitleProps {
  readonly color?: AppColor;
  readonly direction: LayoutDirection;
  readonly language?: LocaleCode;
  readonly title: string;
}

export function GhafHeaderTitle({
  color = 'r001Ink',
  direction,
  language,
  title,
}: GhafHeaderTitleProps) {
  return (
    <View style={[styles.root, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafRasterLogo decorative size={28} testID="ghaf-header-logo" />
      <Text
        accessibilityRole="header"
        align="center"
        brand
        color={color}
        direction={direction}
        language={language}
        style={styles.title}
        variant="screenTitle"
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    maxWidth: '100%',
    minWidth: 0,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  title: {
    minWidth: 0,
    flexShrink: 1,
  },
});
