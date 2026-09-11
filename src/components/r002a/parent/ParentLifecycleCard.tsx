import { StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { nativeViewStyles } from '@/design/nativeStyles';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ParentLifecycleCardProps {
  actionLabel: string;
  categoryLabel?: string;
  childLabel?: string;
  direction: TextDirection;
  metaLabel?: string;
  statusLabel: string;
  supportLabel?: string;
  title: string;
  onPress: () => void;
}

export function ParentLifecycleCard({
  actionLabel,
  categoryLabel,
  childLabel,
  direction,
  metaLabel,
  statusLabel,
  supportLabel,
  title,
  onPress,
}: ParentLifecycleCardProps) {
  return (
    <YStack {...nativeViewStyles(styles.card)}>
      <View style={[styles.statusRow, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.solarAmber} name="info" size={18} />
        <Text brand color="tertiary" style={styles.statusLabel} variant="label">
          {statusLabel}
        </Text>
      </View>

      <Text brand direction={direction} style={styles.title} variant="heading">
        {title}
      </Text>

      {childLabel || categoryLabel || metaLabel ? (
        <View style={[styles.chips, { flexDirection: logicalRowDirection(direction) }]}>
          {childLabel ? <MetaChip label={childLabel} tone="neutral" /> : null}
          {categoryLabel ? <MetaChip label={categoryLabel} tone="green" /> : null}
          {metaLabel ? <MetaChip label={metaLabel} tone="amber" /> : null}
        </View>
      ) : null}

      {supportLabel ? (
        <View style={[styles.supportRow, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.outline} name="help" size={17} />
          <Text brand color="onSurfaceVariant" style={styles.grow} variant="caption">
            {supportLabel}
          </Text>
        </View>
      ) : null}

      <Button
        brand
        direction={direction}
        onPress={onPress}
        size="regular"
        testID="parent-primary-action"
      >
        {actionLabel}
      </Button>
    </YStack>
  );
}

function MetaChip({ label, tone }: { label: string; tone: 'amber' | 'green' | 'neutral' }) {
  return (
    <View style={styles.chip}>
      <Text
        brand
        color={tone === 'green' ? 'primary' : tone === 'amber' ? 'tertiary' : 'onSurfaceVariant'}
        style={styles.chipLabel}
        variant="caption"
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  title: {
    color: botanical.colors.forest,
  },
  statusRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusLabel: {
    minWidth: 0,
    flex: 1,
  },
  chips: {
    minWidth: 0,
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  chip: {
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    justifyContent: 'center',
  },
  chipLabel: {
    flexShrink: 1,
  },
  supportRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingTop: spacing.md,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
