import { StyleSheet, View } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildTodayTaskCardProps {
  actionDisabled?: boolean;
  actionLabel?: string;
  actionTestID?: string;
  awardLabel: string;
  categoryLabel: string;
  direction: TextDirection;
  effortLabel: string;
  helpLabel: string;
  recognitionLabel: string;
  recognitionValue: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionTestID?: string;
  statusLabel: string;
  supervisionLabel: string;
  supervisionValue: string;
  title: string;
  whyItMatters: string;
  whyLabel: string;
}

export function ChildTodayTaskCard({
  actionDisabled = false,
  actionLabel,
  actionTestID,
  awardLabel,
  categoryLabel,
  direction,
  effortLabel,
  helpLabel,
  recognitionLabel,
  recognitionValue,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionTestID,
  statusLabel,
  supervisionLabel,
  supervisionValue,
  title,
  whyItMatters,
  whyLabel,
}: ChildTodayTaskCardProps) {
  return (
    <View style={styles.frame}>
      <View aria-hidden style={styles.backplate} />
      <View style={styles.card}>
        <View style={[styles.chips, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.statusChip}>
            <GhafIcon color={colors.onTertiaryFixed} name="sparkle" size={15} />
            <Text brand color="onTertiaryFixed" direction={direction} variant="caption">
              {statusLabel}
            </Text>
          </View>
          <View style={styles.categoryChip}>
            <GhafIcon color={colors.mangroveTeal} name="leaf" size={15} />
            <Text brand color="mangroveTeal" direction={direction} variant="caption">
              {categoryLabel}
            </Text>
          </View>
        </View>

        <Text brand color="r001Ink" direction={direction} variant="screenTitle">
          {title}
        </Text>

        <View style={styles.meaning}>
          <Text brand color="ghafEmerald" direction={direction} variant="caption">
            {whyLabel}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction}>
            {whyItMatters}
          </Text>
        </View>

        <View style={styles.metadata}>
          <MetadataRow direction={direction} icon="calendar" label={effortLabel} tone="primary" />
          <MetadataRow direction={direction} icon="energy-leaf" label={awardLabel} tone="amber" />
          <MetadataRow
            direction={direction}
            icon="shield"
            label={`${supervisionLabel}: ${supervisionValue}`}
            tone="primary"
          />
          <MetadataRow
            direction={direction}
            icon="sparkle"
            label={`${recognitionLabel}: ${recognitionValue}`}
            tone="primary"
          />
        </View>

        <View style={[styles.help, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.tertiaryContainer} name="info" size={20} />
          <Text brand color="tertiaryContainer" direction={direction} style={styles.grow}>
            {helpLabel}
          </Text>
        </View>

        {actionLabel && onAction ? (
          <PrimaryButton
            brand
            direction={direction}
            disabled={actionDisabled}
            icon={
              <GhafIcon
                color={colors.onPrimary}
                direction={direction === 'rtl' ? 'ltr' : 'rtl'}
                name="arrow-back"
                size={22}
              />
            }
            iconPosition="end"
            onPress={onAction}
            size="regular"
            testID={actionTestID}
          >
            {actionLabel}
          </PrimaryButton>
        ) : null}

        {secondaryActionLabel && onSecondaryAction ? (
          <QuietButton
            brand
            direction={direction}
            onPress={onSecondaryAction}
            size="compact"
            testID={secondaryActionTestID}
          >
            {secondaryActionLabel}
          </QuietButton>
        ) : null}
      </View>
    </View>
  );
}

function MetadataRow({
  direction,
  icon,
  label,
  tone,
}: {
  direction: TextDirection;
  icon: GhafIconName;
  label: string;
  tone: 'amber' | 'primary';
}) {
  const color = tone === 'amber' ? colors.solarAmber : colors.ghafEmerald;
  return (
    <View style={[styles.metaRow, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={color} name={icon} size={20} />
      <Text brand color="onSurfaceVariant" direction={direction} style={styles.grow}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    padding: spacing.xs,
  },
  backplate: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: r001Radii.xl,
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ rotate: '0.6deg' }],
    opacity: 0.72,
  },
  card: {
    overflow: 'hidden',
    gap: spacing.lg,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  chips: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusChip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  categoryChip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: r001Radii.sm,
    backgroundColor: colors.mangroveTealTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  metadata: {
    gap: spacing.sm,
  },
  meaning: {
    gap: spacing.xxs,
  },
  metaRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  help: {
    minHeight: 48,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
