import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { SecondaryButton, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function TrustedAdultIcon() {
  return (
    <Svg aria-hidden height={spacing.xl} viewBox="0 0 24 24" width={spacing.xl}>
      <Path
        d="M12 3 20 6v5.2c0 4.8-3.2 8-8 9.8-4.8-1.8-8-5-8-9.8V6l8-3Z"
        fill={colors.waterLight}
        stroke={colors.mangrove}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx="12" cy="9" fill={colors.mangrove} r="2" />
      <Path
        d="M8.7 16c.7-2 1.8-3 3.3-3s2.6 1 3.3 3"
        fill="none"
        stroke={colors.mangrove}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

interface TrustedAdultExitProps {
  actionLabel?: string;
  body: string;
  label: string;
  onPress: () => void;
  testID?: string;
}

export function TrustedAdultExit({
  actionLabel,
  body,
  label,
  onPress,
  testID,
}: TrustedAdultExitProps) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      style={[styles.adultExit, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
      testID={testID}
    >
      <View style={styles.adultExitIcon}>
        <TrustedAdultIcon />
      </View>
      <View style={styles.adultExitCopy}>
        <Text color="forest" variant="label">
          {label}
        </Text>
        <Text color="inkMuted" variant="caption">
          {body}
        </Text>
        <SecondaryButton
          fullWidth={false}
          onPress={onPress}
          testID={`${testID ?? 'adult-exit'}-button`}
        >
          {actionLabel ?? label}
        </SecondaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  adultExit: {
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  adultExitIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  adultExitCopy: { minWidth: 0, flex: 1, gap: spacing.xs },
});
