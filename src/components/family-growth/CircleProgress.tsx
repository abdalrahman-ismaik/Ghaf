import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { circleGardenArtworkIds, LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const MAX_PROGRESS_MARKERS = 24;

export interface CooperativeGarden {
  readonly accessibilityLabel: string;
  readonly id: string;
  readonly label: string;
}

export interface CircleProgressProps {
  readonly accessibilityLabel: string;
  readonly announceMilestone?: boolean;
  readonly body: string;
  readonly current: number;
  readonly gardens: readonly CooperativeGarden[];
  readonly goal: number;
  readonly householdContributionLabel: string;
  readonly milestoneLabel?: string;
  readonly privacyDisclosure: string;
  readonly progressLabel: string;
  readonly syntheticDisclosure: string;
  readonly showHeading?: boolean;
  readonly testID?: string;
  readonly title: string;
}

export function CircleProgress({
  accessibilityLabel,
  announceMilestone = true,
  body,
  current,
  gardens,
  goal,
  householdContributionLabel,
  milestoneLabel,
  privacyDisclosure,
  progressLabel,
  syntheticDisclosure,
  showHeading = true,
  testID,
  title,
}: CircleProgressProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const markerCount = getMarkerCount(goal);
  const filledMarkerCount = getFilledMarkerCount(current, goal, markerCount);
  const safeGoal = Math.max(0, Number.isFinite(goal) ? goal : 0);
  const safeCurrent = Math.max(0, Math.min(safeGoal, Number.isFinite(current) ? current : 0));
  const milestoneReached = safeGoal > 0 && safeCurrent >= safeGoal;

  return (
    <View style={styles.circle} testID={testID}>
      {showHeading ? (
        <View style={styles.heading}>
          <Text color="forest" variant="heading">
            {title}
          </Text>
          <Text color="inkMuted">{body}</Text>
        </View>
      ) : null}

      <View style={styles.sharedGround}>
        <View style={[styles.gardenRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          {gardens.map((garden, index) => (
            <View key={garden.id} style={styles.garden}>
              <LocalIllustration
                accessibilityLabel={garden.accessibilityLabel}
                assetId={
                  circleGardenArtworkIds[index % circleGardenArtworkIds.length] ??
                  circleGardenArtworkIds[0]
                }
                direction={direction}
                fallbackLabel={garden.accessibilityLabel}
                language={locale}
                style={styles.gardenVisual}
                testID={`circle-garden-artwork-${index + 1}`}
              />
              <Text align="center" color="forest" variant="caption">
                {garden.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: safeGoal, now: safeCurrent }}
          style={styles.goalChannel}
        >
          <View
            style={[styles.channelMarkers, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
          >
            {Array.from({ length: markerCount }, (_, index) => {
              const filled = index < filledMarkerCount;
              const isCurrent = filled && index === filledMarkerCount - 1;
              return (
                <View
                  aria-hidden
                  key={`goal-marker-${index}`}
                  style={[
                    styles.channelMarker,
                    filled ? styles.channelMarkerFilled : null,
                    isCurrent ? styles.channelMarkerCurrent : null,
                  ]}
                >
                  <View style={styles.channelRoot} />
                </View>
              );
            })}
          </View>
          <View style={styles.channelWaterLine} />
        </View>

        <Text color="forest" variant="label">
          {progressLabel}
        </Text>

        <View
          style={[
            styles.householdContribution,
            direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
          ]}
        >
          <View aria-hidden style={styles.contributionIcon}>
            <GhafIcon color={colors.mangrove} name="leaf" size={28} />
          </View>
          <Text color="forest" style={styles.contributionText} variant="caption">
            {householdContributionLabel}
          </Text>
        </View>
      </View>

      {milestoneReached && milestoneLabel ? (
        <View
          accessibilityLiveRegion={announceMilestone ? 'polite' : undefined}
          style={[styles.milestone, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
        >
          <View aria-hidden style={styles.milestoneIcon}>
            <GhafIcon color={colors.success} name="check-filled" size={28} />
          </View>
          <Text color="forest" style={styles.milestoneText} variant="label">
            {milestoneLabel}
          </Text>
        </View>
      ) : null}

      <View style={styles.disclosures}>
        <DisclosureLine kind="synthetic" text={syntheticDisclosure} />
        <DisclosureLine kind="privacy" text={privacyDisclosure} />
      </View>
    </View>
  );
}

function DisclosureLine({
  kind,
  text,
}: {
  readonly kind: 'privacy' | 'synthetic';
  readonly text: string;
}) {
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <View style={[styles.disclosure, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
      <View aria-hidden style={styles.disclosureIcon}>
        <GhafIcon
          color={kind === 'privacy' ? colors.ghafEmerald : colors.mangrove}
          name={kind === 'privacy' ? 'shield' : 'info'}
          size={22}
        />
      </View>
      <Text color="inkMuted" style={styles.disclosureText} variant="caption">
        {text}
      </Text>
    </View>
  );
}

function getMarkerCount(goal: number): number {
  if (!Number.isFinite(goal) || goal <= 0) return 1;
  return Math.min(Math.round(goal), MAX_PROGRESS_MARKERS);
}

function getFilledMarkerCount(current: number, goal: number, markerCount: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal) || goal <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / goal)) * markerCount);
}

const styles = StyleSheet.create({
  circle: {
    width: '100%',
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.xs,
  },
  sharedGround: {
    overflow: 'hidden',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.waterLight,
  },
  gardenRow: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  garden: {
    flexGrow: 1,
    flexBasis: 112,
    maxWidth: 180,
    minWidth: 96,
    alignItems: 'center',
    gap: spacing.xs,
  },
  gardenVisual: {
    width: '100%',
    height: 104,
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  contributionIcon: {
    width: 42,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIcon: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosureIcon: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalChannel: {
    position: 'relative',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  channelMarkers: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
    zIndex: 1,
  },
  channelMarker: {
    flex: 1,
    minWidth: 5,
    maxWidth: 24,
    height: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  channelMarkerFilled: {
    height: 20,
    backgroundColor: colors.mangrove,
  },
  channelMarkerCurrent: {
    height: 27,
    backgroundColor: colors.gold,
  },
  channelRoot: {
    width: 2,
    height: 8,
    backgroundColor: colors.earth,
    opacity: 0.56,
  },
  channelWaterLine: {
    position: 'absolute',
    right: 0,
    bottom: spacing.sm,
    left: 0,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.water,
  },
  householdContribution: {
    minHeight: 56,
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.water,
  },
  contributionText: {
    flex: 1,
  },
  milestone: {
    minHeight: 56,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.successLight,
  },
  milestoneText: {
    flex: 1,
  },
  disclosures: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  disclosure: {
    minHeight: 44,
    alignItems: 'center',
    gap: spacing.sm,
  },
  disclosureText: {
    flex: 1,
  },
  rowLtr: {
    flexDirection: 'row',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
});
