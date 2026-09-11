import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { LocalIllustration, type ArtworkId } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface FamilyCanopyProps {
  readonly accessibilityLabel: string;
  readonly contributionLeaves: number;
  readonly goalLeaves: number;
  readonly highlightLatestContribution?: boolean;
  readonly latestContributionLabel?: string;
  readonly meaning: string;
  readonly progressAccessibilityLabel: string;
  readonly progressLabel: string;
  readonly testID?: string;
  readonly title: string;
}

export interface HouseholdContributionProps {
  readonly accessibilityLabel: string;
  readonly current: number;
  readonly goal: number;
  readonly latestContributionLabel?: string;
  readonly meaning: string;
  readonly progressLabel: string;
}

export function FamilyCanopy({
  accessibilityLabel,
  contributionLeaves,
  goalLeaves,
  highlightLatestContribution = false,
  latestContributionLabel,
  meaning,
  progressAccessibilityLabel,
  progressLabel,
  testID,
  title,
}: FamilyCanopyProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const canopyAssetId: ArtworkId =
    contributionLeaves >= 20 ? 'family-canopy-20' : 'family-canopy-19';

  return (
    <View style={styles.canopy} testID={testID}>
      <View style={[styles.canopyLayout, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <LocalIllustration
          accessibilityLabel={accessibilityLabel}
          assetId={canopyAssetId}
          direction={direction}
          fallbackLabel={accessibilityLabel}
          language={locale}
          priority="high"
          style={styles.canopyVisual}
          testID="family-canopy-artwork"
        />

        <View style={styles.canopyCopy}>
          <View style={styles.titleGroup}>
            <View
              style={[
                styles.titleRule,
                direction === 'rtl' ? styles.titleRuleRtl : styles.titleRuleLtr,
              ]}
            />
            <Text brand color="deepForest" variant="screenTitle">
              {title}
            </Text>
          </View>
          <HouseholdContribution
            accessibilityLabel={progressAccessibilityLabel}
            current={contributionLeaves}
            goal={goalLeaves}
            latestContributionLabel={
              highlightLatestContribution ? latestContributionLabel : undefined
            }
            meaning={meaning}
            progressLabel={progressLabel}
          />
        </View>
      </View>
    </View>
  );
}

export function HouseholdContribution({
  accessibilityLabel,
  current,
  goal,
  latestContributionLabel,
  meaning,
  progressLabel,
}: HouseholdContributionProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const progress = getProgressPercent(current, goal);
  const safeGoal = Math.max(0, Number.isFinite(goal) ? goal : 0);
  const safeCurrent = Math.max(0, Math.min(safeGoal, Number.isFinite(current) ? current : 0));

  return (
    <View style={styles.contribution}>
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: safeGoal, now: safeCurrent }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressFill,
            direction === 'rtl' ? styles.progressFillRtl : styles.progressFillLtr,
            { width: `${progress}%` },
          ]}
        />
        <View
          style={[
            styles.progressRoot,
            direction === 'rtl' ? styles.progressRootRtl : styles.progressRootLtr,
          ]}
        />
      </View>
      <Text brand color="deepForest" tabular variant="label">
        {progressLabel}
      </Text>
      <Text brand color="onSurfaceVariant" variant="caption">
        {meaning}
      </Text>
      {latestContributionLabel ? (
        <View
          style={[styles.latestContribution, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
        >
          <View aria-hidden style={styles.latestIcon}>
            <GhafIcon color={colors.gold} name="leaf" size={24} />
          </View>
          <Text brand color="tertiary" style={styles.latestContributionText} variant="caption">
            {latestContributionLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getProgressPercent(current: number, goal: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal) || goal <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / goal)) * 100);
}

const styles = StyleSheet.create({
  canopy: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.soft,
  },
  canopyLayout: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
    padding: spacing.md,
  },
  canopyVisual: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 220,
    width: '100%',
    minWidth: 0,
    maxWidth: 360,
    aspectRatio: 288 / 208,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
  },
  canopyCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
  },
  titleGroup: { gap: spacing.sm },
  titleRule: { width: 48, height: 3, backgroundColor: colors.gold },
  titleRuleLtr: { alignSelf: 'flex-start' },
  titleRuleRtl: { alignSelf: 'flex-end' },
  contribution: { gap: spacing.xs },
  progressTrack: {
    position: 'relative',
    height: 14,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.ghafEmerald,
  },
  progressFillLtr: { left: 0 },
  progressFillRtl: { right: 0 },
  progressRoot: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 2,
    bottom: 2,
    width: 3,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.solarAmber,
  },
  progressRootLtr: { left: spacing.xs },
  progressRootRtl: { right: spacing.xs },
  latestContribution: {
    minHeight: 48,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
  latestIcon: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center' },
  latestContributionText: { flex: 1 },
  rowLtr: { flexDirection: 'row' },
  rowRtl: { flexDirection: 'row-reverse' },
});
