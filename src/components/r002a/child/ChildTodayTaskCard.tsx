import { StyleSheet, View } from 'react-native';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
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
    <View style={styles.card}>
      <View style={[styles.chips, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.statusChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forest} name="sparkle" size={15} />
          <Text
            brand
            color="onTertiaryFixed"
            direction={direction}
            style={styles.chipLabel}
            variant="caption"
          >
            {statusLabel}
          </Text>
        </View>
        <View style={[styles.categoryChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forestRaised} name="leaf" size={15} />
          <Text
            brand
            color="mangroveTeal"
            direction={direction}
            style={styles.chipLabel}
            variant="caption"
          >
            {categoryLabel}
          </Text>
        </View>
      </View>

      <Text brand color="r001Ink" direction={direction} variant="screenTitle">
        {title}
      </Text>

      <View style={styles.metadata}>
        <View style={styles.taskFacts}>
          <MetadataRow direction={direction} icon="calendar" label={effortLabel} tone="primary" />
          <MetadataRow direction={direction} icon="energy-leaf" label={awardLabel} tone="amber" />
        </View>
        <MetadataRow
          direction={direction}
          icon="shield"
          label={`${supervisionLabel}: ${supervisionValue}`}
          tone="primary"
        />
      </View>

      <View style={styles.decision}>
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

      <View style={styles.details}>
        <View style={styles.meaning}>
          <Text brand color="ghafEmerald" direction={direction} variant="caption">
            {whyLabel}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction}>
            {whyItMatters}
          </Text>
        </View>

        <MetadataRow
          direction={direction}
          icon="sparkle"
          label={`${recognitionLabel}: ${recognitionValue}`}
          tone="primary"
        />
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
  const color = tone === 'amber' ? colors.tertiary : botanical.colors.forest;
  return (
    <View style={[styles.metaRow, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={color} name={icon} size={20} />
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        style={styles.grow}
        tabular
        variant="caption"
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: botanical.space.row,
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
    padding: botanical.space.inset,
  },
  chips: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusChip: {
    maxWidth: '100%',
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  categoryChip: {
    maxWidth: '100%',
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: botanical.radius.small,
    backgroundColor: colors.transparent,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  metadata: {
    gap: spacing.sm,
  },
  chipLabel: { minWidth: 0, flexShrink: 1 },
  taskFacts: {
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
    paddingBottom: botanical.space.row,
    marginBottom: spacing.xxs,
  },
  decision: {
    gap: spacing.xs,
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingTop: botanical.space.row,
    gap: botanical.space.row,
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
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.canvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
