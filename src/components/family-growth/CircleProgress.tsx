import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

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
            <View
              accessibilityLabel={garden.accessibilityLabel}
              accessibilityRole="image"
              key={garden.id}
              style={styles.garden}
            >
              <GardenSilhouette variant={index % 3} />
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
          <HouseholdContributionMark />
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
          <MilestoneMark />
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

function GardenSilhouette({ variant }: { readonly variant: number }) {
  return (
    <View style={styles.gardenVisual}>
      <Svg aria-hidden height="100%" viewBox="0 0 104 82" width="100%">
        <Rect fill={colors.waterLight} height="82" width="104" />
        <Path
          d="M0 61 C21 55 38 62 55 58 C73 54 88 59 104 54 L104 82 L0 82Z"
          fill={colors.sandLight}
        />
        <Path
          d="M8 70 C28 65 42 73 61 68 C77 64 90 68 98 65"
          fill="none"
          stroke={colors.water}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <G
          transform={
            variant === 1 ? 'translate(1 2)' : variant === 2 ? 'translate(-1 0)' : undefined
          }
        >
          <Path
            d={
              variant === 1
                ? 'M47 61 C49 48 50 36 52 25 C55 38 58 50 61 61Z'
                : 'M46 61 C49 47 50 34 52 21 C56 36 59 49 62 61Z'
            }
            fill={colors.earth}
          />
          <Path
            d="M52 43 C40 37 33 31 27 24"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="4"
          />
          <Path
            d="M55 41 C66 35 73 29 78 22"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="4"
          />
          <Ellipse
            cx="31"
            cy={variant === 1 ? 27 : 24}
            fill={variant === 2 ? colors.mangrove : colors.leaf}
            opacity="0.84"
            rx="18"
            ry="12"
          />
          <Ellipse cx="53" cy="20" fill={colors.ghaf} opacity="0.92" rx="23" ry="15" />
          <Ellipse
            cx="76"
            cy={variant === 1 ? 27 : 25}
            fill={variant === 1 ? colors.forestSoft : colors.mangrove}
            opacity="0.82"
            rx="17"
            ry="12"
          />
          <Path
            d="M51 59 C41 65 35 70 32 76"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <Path
            d="M57 59 C67 65 73 70 77 76"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          {variant === 2 ? <Circle cx="55" cy="15" fill={colors.goldLight} r="2.5" /> : null}
        </G>
      </Svg>
    </View>
  );
}

function HouseholdContributionMark() {
  return (
    <Svg aria-hidden height={36} viewBox="0 0 42 36" width={42}>
      <Path
        d="M4 28 C12 24 17 31 25 27 C31 24 35 26 39 24"
        fill="none"
        stroke={colors.water}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <Path
        d="M21 26 C21 18 24 12 32 7"
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Path d="M23 17 C14 18 10 14 11 8 C19 6 24 10 23 17Z" fill={colors.ghaf} />
      <Circle cx="33" cy="7" fill={colors.gold} r="2.5" />
    </Svg>
  );
}

function MilestoneMark() {
  return (
    <Svg aria-hidden height={32} viewBox="0 0 36 32" width={36}>
      <Circle cx="18" cy="16" fill={colors.surface} r="14" />
      <Path
        d="M11 17 L16 22 L26 10"
        fill="none"
        stroke={colors.success}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </Svg>
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
      <DisclosureMark kind={kind} />
      <Text color="inkMuted" style={styles.disclosureText} variant="caption">
        {text}
      </Text>
    </View>
  );
}

function DisclosureMark({ kind }: { readonly kind: 'privacy' | 'synthetic' }) {
  return (
    <Svg aria-hidden height={26} viewBox="0 0 28 26" width={28}>
      {kind === 'privacy' ? (
        <G>
          <Path
            d="M14 3 L23 7 V13 C23 19 19 22 14 24 C9 22 5 19 5 13 V7Z"
            fill={colors.leafMist}
            stroke={colors.ghaf}
            strokeWidth="1.5"
          />
          <Path
            d="M10 13 L13 16 L18 10"
            fill="none"
            stroke={colors.ghaf}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </G>
      ) : (
        <G>
          <Circle cx="14" cy="13" fill={colors.waterLight} r="10" stroke={colors.water} />
          <Line
            stroke={colors.mangrove}
            strokeLinecap="round"
            strokeWidth="2"
            x1="14"
            x2="14"
            y1="8"
            y2="14"
          />
          <Circle cx="14" cy="18" fill={colors.mangrove} r="1.5" />
        </G>
      )}
    </Svg>
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
