import { StyleSheet, View } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

export interface EmptyStateProps {
  // A section with nothing in it still needs a shape, so the screen does not read as a
  // sentence that failed to load.
  direction: TextDirection;
  icon?: GhafIconName;
  message: string;
  testID?: string;
  title?: string;
}

export function EmptyState({ direction, icon = 'leaf', message, testID, title }: EmptyStateProps) {
  return (
    <View
      accessibilityLabel={title ? `${title}. ${message}` : message}
      accessible
      style={styles.card}
      testID={testID}
    >
      <View aria-hidden style={styles.icon}>
        <GhafIcon color={colors.ghafEmerald} name={icon} size={30} />
      </View>
      {title ? (
        <Text align="center" brand color="r001Ink" direction={direction} variant="heading">
          {title}
        </Text>
      ) : null}
      <Text align="center" brand color="onSurfaceVariant" direction={direction} variant="body">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
});
