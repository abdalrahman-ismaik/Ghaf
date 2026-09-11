import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
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
    <View style={[styles.card, direction === 'rtl' ? styles.accentRight : styles.accentLeft]}>
      <View style={[styles.statusRow, { flexDirection: logicalRowDirection(direction) }]}>
        <GhafIcon color={colors.solarAmber} name="info" size={18} />
        <Text brand color="tertiary" style={styles.statusLabel} variant="label">
          {statusLabel}
        </Text>
      </View>

      <Text brand color="onSurface" variant="bodyLarge">
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

      <Button brand onPress={onPress} size="regular" testID="parent-primary-action">
        {actionLabel}
      </Button>
    </View>
  );
}

function MetaChip({ label, tone }: { label: string; tone: 'amber' | 'green' | 'neutral' }) {
  return (
    <View
      style={[
        styles.chip,
        tone === 'green'
          ? styles.greenChip
          : tone === 'amber'
            ? styles.amberChip
            : styles.neutralChip,
      ]}
    >
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
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  accentRight: {
    borderRightWidth: 6,
    borderRightColor: colors.solarAmber,
  },
  accentLeft: {
    borderLeftWidth: 6,
    borderLeftColor: colors.solarAmber,
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
    gap: spacing.xs,
  },
  chip: {
    minWidth: 0,
    minHeight: 30,
    maxWidth: '100%',
    flexShrink: 1,
    justifyContent: 'center',
    borderRadius: r001Radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  chipLabel: {
    flexShrink: 1,
  },
  neutralChip: {
    backgroundColor: colors.surfaceContainerLow,
  },
  greenChip: {
    backgroundColor: colors.ghafEmeraldTint,
  },
  amberChip: {
    backgroundColor: colors.solarAmberTint,
  },
  supportRow: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
