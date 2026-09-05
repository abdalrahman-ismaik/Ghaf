import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { Button } from '@/components/primitives';
import { colors, layout, r001Shadows, spacing, type LayoutDirection } from '@/design/tokens';

export interface TaskBuilderFooterProps {
  actionLabel: string;
  busy?: boolean;
  busyLabel?: string;
  direction: LayoutDirection;
  disabled?: boolean;
  onPress: () => void;
  testID: string;
}

export function TaskBuilderFooter({
  actionLabel,
  busy = false,
  busyLabel,
  direction,
  disabled = false,
  onPress,
  testID,
}: TaskBuilderFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.content}>
        <Button
          brand
          busy={busy}
          busyLabel={busyLabel}
          direction={direction}
          disabled={disabled}
          icon={
            <GhafIcon color={colors.onPrimary} direction={direction} name="chevron" size={22} />
          }
          iconPosition="end"
          onPress={onPress}
          size="regular"
          testID={testID}
        >
          {actionLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.r001Surface,
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPadding,
    ...r001Shadows.sheet,
  },
  content: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
  },
});
