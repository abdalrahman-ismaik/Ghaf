import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const CANOPY_LEAVES = [
  { cx: 73, cy: 63, rotation: -26 },
  { cx: 92, cy: 48, rotation: -14 },
  { cx: 115, cy: 39, rotation: -7 },
  { cx: 140, cy: 37, rotation: 8 },
  { cx: 166, cy: 43, rotation: 16 },
  { cx: 191, cy: 54, rotation: 25 },
  { cx: 213, cy: 70, rotation: 31 },
  { cx: 57, cy: 86, rotation: -38 },
  { cx: 84, cy: 77, rotation: -19 },
  { cx: 111, cy: 67, rotation: -8 },
  { cx: 140, cy: 65, rotation: 7 },
  { cx: 170, cy: 70, rotation: 13 },
  { cx: 200, cy: 83, rotation: 29 },
  { cx: 231, cy: 94, rotation: 42 },
  { cx: 67, cy: 111, rotation: -31 },
  { cx: 98, cy: 99, rotation: -16 },
  { cx: 130, cy: 92, rotation: -5 },
  { cx: 162, cy: 96, rotation: 12 },
  { cx: 194, cy: 105, rotation: 27 },
  { cx: 218, cy: 122, rotation: 38 },
  { cx: 87, cy: 129, rotation: -25 },
  { cx: 119, cy: 119, rotation: -11 },
  { cx: 151, cy: 121, rotation: 8 },
  { cx: 182, cy: 130, rotation: 20 },
  { cx: 142, cy: 142, rotation: 3 },
] as const;

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
  const earnedLeafCount = getVisibleLeafCount(contributionLeaves, goalLeaves);

  return (
    <View style={styles.canopy} testID={testID}>
      <View style={[styles.canopyLayout, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
          style={styles.canopyVisual}
        >
          <Svg aria-hidden height="100%" viewBox="0 0 288 208" width="100%">
            <Rect fill={colors.leafMist} height="208" width="288" />
            <Path
              d="M0 169 C54 153 93 166 142 158 C193 150 236 161 288 146 L288 208 L0 208Z"
              fill={colors.sandLight}
            />
            <Path
              d="M18 174 C73 165 107 175 156 166 C205 157 240 166 271 158"
              fill="none"
              stroke={colors.sand}
              strokeLinecap="round"
              strokeWidth="3"
            />

            <G opacity="0.94">
              <Ellipse cx="80" cy="88" fill={colors.leafLight} rx="55" ry="39" />
              <Ellipse cx="125" cy="62" fill={colors.leaf} opacity="0.52" rx="58" ry="43" />
              <Ellipse cx="173" cy="62" fill={colors.ghaf} opacity="0.65" rx="61" ry="44" />
              <Ellipse cx="216" cy="91" fill={colors.forestSoft} opacity="0.6" rx="51" ry="38" />
              <Ellipse cx="145" cy="105" fill={colors.ghaf} opacity="0.74" rx="81" ry="50" />
            </G>

            <G fill="none" stroke={colors.earth} strokeLinecap="round">
              <Path d="M135 169 C139 138 139 111 143 82" strokeWidth="13" />
              <Path d="M149 168 C151 137 150 109 146 81" strokeWidth="12" />
              <Path d="M144 118 C119 103 101 88 84 66" strokeWidth="9" />
              <Path d="M146 112 C169 98 185 83 202 61" strokeWidth="9" />
              <Path d="M142 138 C112 129 91 118 69 101" strokeWidth="7" />
              <Path d="M149 137 C178 126 201 114 222 96" strokeWidth="7" />
            </G>

            <Path
              d="M142 160 C123 171 109 183 101 198"
              fill="none"
              stroke={colors.earth}
              strokeLinecap="round"
              strokeWidth="5"
            />
            <Path
              d="M146 161 C163 172 177 184 184 198"
              fill="none"
              stroke={colors.earth}
              strokeLinecap="round"
              strokeWidth="5"
            />
            <Path
              d="M144 163 C142 177 142 187 143 201"
              fill="none"
              stroke={colors.earth}
              strokeLinecap="round"
              strokeWidth="4"
            />

            {CANOPY_LEAVES.map((leaf, index) => {
              const isEarned = index < earnedLeafCount;
              const isLatest =
                highlightLatestContribution && earnedLeafCount > 0 && index === earnedLeafCount - 1;
              const earnedFill =
                index % 3 === 0 ? colors.leafLight : index % 3 === 1 ? colors.leaf : colors.ghaf;

              return (
                <Ellipse
                  cx={leaf.cx}
                  cy={leaf.cy}
                  fill={isLatest ? colors.goldLight : isEarned ? earnedFill : colors.surface}
                  key={`${leaf.cx}-${leaf.cy}`}
                  opacity={isEarned ? 1 : 0.72}
                  rx={isLatest ? 8 : 7}
                  ry={isLatest ? 4.5 : 4}
                  stroke={isLatest ? colors.gold : isEarned ? colors.forestSoft : colors.line}
                  strokeWidth={isLatest ? 2 : 1}
                  transform={`rotate(${leaf.rotation} ${leaf.cx} ${leaf.cy})`}
                />
              );
            })}

            {highlightLatestContribution && earnedLeafCount > 0 ? (
              <G>
                <Circle
                  cx={CANOPY_LEAVES[earnedLeafCount - 1]?.cx ?? 142}
                  cy={CANOPY_LEAVES[earnedLeafCount - 1]?.cy ?? 90}
                  fill="none"
                  r="12"
                  stroke={colors.gold}
                  strokeDasharray="2 4"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </G>
            ) : null}
          </Svg>
        </View>

        <View style={styles.canopyCopy}>
          <View style={styles.titleGroup}>
            <View
              style={[
                styles.titleRule,
                direction === 'rtl' ? styles.titleRuleRtl : styles.titleRuleLtr,
              ]}
            />
            <Text color="forest" variant="heading">
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
      <Text color="forest" variant="label">
        {progressLabel}
      </Text>
      <Text color="inkMuted" variant="caption">
        {meaning}
      </Text>
      {latestContributionLabel ? (
        <View
          style={[styles.latestContribution, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
        >
          <NewLeafMark />
          <Text color="earth" style={styles.latestContributionText} variant="caption">
            {latestContributionLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function NewLeafMark() {
  return (
    <Svg aria-hidden height={28} viewBox="0 0 32 28" width={32}>
      <Path
        d="M15 23 C15 15 18 9 26 4"
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Path
        d="M17 14 C9 14 5 10 6 4 C14 3 18 7 17 14Z"
        fill={colors.goldLight}
        stroke={colors.gold}
      />
    </Svg>
  );
}

function getVisibleLeafCount(current: number, goal: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal) || goal <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / goal)) * CANOPY_LEAVES.length);
}

function getProgressPercent(current: number, goal: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal) || goal <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / goal)) * 100);
}

const styles = StyleSheet.create({
  canopy: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.leafMist,
  },
  canopyLayout: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  canopyVisual: {
    flexGrow: 1,
    flexBasis: 280,
    width: '100%',
    minWidth: 238,
    maxWidth: 360,
    height: 238,
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderCurve: 'continuous',
  },
  canopyCopy: {
    flexGrow: 1,
    flexBasis: 238,
    minWidth: 220,
    gap: spacing.lg,
  },
  titleGroup: {
    gap: spacing.sm,
  },
  titleRule: {
    width: 48,
    height: 3,
    backgroundColor: colors.gold,
  },
  titleRuleLtr: {
    alignSelf: 'flex-start',
  },
  titleRuleRtl: {
    alignSelf: 'flex-end',
  },
  contribution: {
    gap: spacing.xs,
  },
  progressTrack: {
    position: 'relative',
    height: 14,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.ghaf,
  },
  progressFillLtr: {
    left: 0,
  },
  progressFillRtl: {
    right: 0,
  },
  progressRoot: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 2,
    bottom: 2,
    width: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  progressRootLtr: {
    left: spacing.xs,
  },
  progressRootRtl: {
    right: spacing.xs,
  },
  latestContribution: {
    minHeight: 48,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
  },
  latestContributionText: {
    flex: 1,
  },
  rowLtr: {
    flexDirection: 'row',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
});
