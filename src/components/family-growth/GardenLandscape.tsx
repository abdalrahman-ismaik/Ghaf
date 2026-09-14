import { useEffect, useLayoutEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { landscapeArtworkIds, LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical, colors, motion, spacing } from '@/design/tokens';
import type { GardenStage, LandscapeId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

const LANDSCAPE_ORDER: readonly LandscapeId[] = ['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'];

const STAGE_INDEX: Readonly<Record<GardenStage, number>> = {
  seed: 0,
  shoot: 1,
  sapling: 2,
  shade: 3,
  flourishing: 4,
};

const LANDSCAPE_STAGE_ORDER: readonly GardenStage[] = [
  'seed',
  'shoot',
  'sapling',
  'shade',
  'flourishing',
];

const DETAIL_ICON_BY_LANDSCAPE: Readonly<Record<LandscapeId, GhafIconName>> = {
  ghaf: 'ghaf-tree',
  samar: 'leaf',
  sidr: 'flower',
  date_palm: 'energy-leaf',
  mangrove: 'water-drop',
};

const SEED_TRAVEL_DURATION = motion.duration.standard + motion.duration.quick;
const DETAIL_REVEAL_DELAY = motion.duration.standard;
const DETAIL_REVEAL_DURATION = motion.duration.growth - DETAIL_REVEAL_DELAY;
const SEED_TRAVEL_DISTANCE = spacing.xxl;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export interface LandscapeTrackContent {
  readonly accessibilityLabel: string;
  readonly categoryLabel: string;
  readonly cumulativeSeeds: number;
  readonly name: string;
  readonly originNote?: string;
  readonly progressLabel: string;
  readonly stage: GardenStage;
  readonly stageLabel: string;
  readonly targetSeeds: number;
}

export interface GardenLandscapeLabels {
  readonly activeTrack: string;
  readonly inspiredBy: string;
  readonly symbolicDisclosure: string;
}

export interface GardenLandscapeProps {
  readonly accessibilityLabel: string;
  readonly activeLandscapeId?: LandscapeId;
  readonly labels: GardenLandscapeLabels;
  readonly recognitionReveal?: GardenRecognitionReveal;
  readonly testID?: string;
  readonly tracks: Readonly<Record<LandscapeId, LandscapeTrackContent>>;
}

export interface GardenRecognitionReveal {
  readonly accessibilityAnnouncement?: string;
  readonly play: boolean;
  readonly sequenceKey: string | number;
}

export interface LandscapeTrackProps {
  readonly activeLabel: string;
  readonly content: LandscapeTrackContent;
  readonly id: LandscapeId;
  readonly recognitionReveal?: GardenRecognitionReveal;
}

interface CompactHorizonTrackProps {
  readonly content: LandscapeTrackContent;
  readonly id: LandscapeId;
  readonly isLast: boolean;
}

export function GardenLandscape({
  accessibilityLabel,
  activeLandscapeId = 'mangrove',
  labels,
  recognitionReveal,
  testID,
  tracks,
}: GardenLandscapeProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const supportingLandscapeIds = LANDSCAPE_ORDER.filter((id) => id !== activeLandscapeId);

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.landscape} testID={testID}>
      <View style={[styles.landscapeHeading, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View aria-hidden style={styles.headingIcon}>
          <GhafIcon color={colors.earth} name="ghaf-tree" size={24} />
        </View>
        <Text brand color="deepForest" style={styles.landscapeHeadingText} variant="label">
          {labels.inspiredBy}
        </Text>
      </View>

      <View style={styles.trackLedger}>
        <LandscapeTrack
          activeLabel={labels.activeTrack}
          content={tracks[activeLandscapeId]}
          id={activeLandscapeId}
          recognitionReveal={recognitionReveal}
        />

        <View style={styles.supportingLedger}>
          {supportingLandscapeIds.map((id, index) => (
            <CompactHorizonTrack
              content={tracks[id]}
              id={id}
              isLast={index === supportingLandscapeIds.length - 1}
              key={id}
            />
          ))}
        </View>
      </View>

      <View style={[styles.symbolicNote, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View aria-hidden style={styles.symbolicIcon}>
          <GhafIcon color={botanical.colors.forest} name="info" size={20} />
        </View>
        <Text brand color="onSurfaceVariant" style={styles.noteText} variant="caption">
          {labels.symbolicDisclosure}
        </Text>
      </View>
    </View>
  );
}

export function LandscapeTrack({
  activeLabel,
  content,
  id,
  recognitionReveal,
}: LandscapeTrackProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const progress = getProgressPercent(content.cumulativeSeeds, content.targetSeeds);
  const reveal = useGardenRecognitionReveal(recognitionReveal, direction);

  return (
    <View style={styles.trackHero} testID="active-landscape-hero">
      <View style={styles.heroSpecimenFrame}>
        <LocalIllustration
          accessibilityLabel={content.accessibilityLabel}
          assetId={landscapeArtworkIds[id][content.stage]}
          direction={direction}
          fallbackLabel={content.accessibilityLabel}
          language={locale}
          priority="high"
          style={styles.heroArtwork}
          testID="active-landscape-artwork"
        />
        {reveal.shouldRender ? (
          <View pointerEvents="none" style={styles.heroOverlay}>
            <Animated.View
              aria-hidden
              style={[
                styles.recognitionSeedCue,
                direction === 'rtl' ? styles.recognitionSeedCueRtl : styles.recognitionSeedCueLtr,
                reveal.seedCueStyle,
              ]}
            >
              <View style={styles.recognitionSeedMark} />
            </Animated.View>
            <Animated.View
              aria-hidden
              style={[
                styles.biologicalDetail,
                direction === 'rtl' ? styles.biologicalDetailRtl : styles.biologicalDetailLtr,
                reveal.detailStyle,
              ]}
            >
              <View style={styles.biologicalDetailMark}>
                <GhafIcon
                  color={botanical.colors.forest}
                  name={DETAIL_ICON_BY_LANDSCAPE[id]}
                  size={24}
                />
              </View>
            </Animated.View>
          </View>
        ) : null}
      </View>

      <View style={styles.trackCopy}>
        <View style={[styles.trackHeader, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <View style={styles.trackNames}>
            <Text brand color="deepForest" variant="screenTitle">
              {content.name}
            </Text>
            <Text brand color="primary" variant="caption">
              {content.categoryLabel}
            </Text>
          </View>
          <View style={[styles.activeFlag, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
            <View style={styles.activeFlagLine} />
            <Text brand color="primary" variant="caption">
              {activeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.stageRow}>
          <Text brand color="deepForest" variant="label">
            {content.stageLabel}
          </Text>
          <StageRuler currentStage={content.stage} />
        </View>

        <ProgressBand
          accessibilityLabel={content.progressLabel}
          direction={direction}
          progress={progress}
        />
        <Text brand color="onSurfaceVariant" tabular variant="caption">
          {content.progressLabel}
        </Text>
        {content.originNote ? (
          <Text brand color="tertiary" variant="caption">
            {content.originNote}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function CompactHorizonTrack({ content, id, isLast }: CompactHorizonTrackProps) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      accessibilityLabel={content.accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: content.targetSeeds,
        now: Math.min(content.cumulativeSeeds, content.targetSeeds),
      }}
      style={[styles.compactTrack, isLast ? styles.compactTrackLast : null]}
      testID={`compact-landscape-${id}`}
    >
      <View style={[styles.compactTrackBody, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <LocalIllustration
          assetId={landscapeArtworkIds[id][content.stage]}
          decorative
          direction={direction}
          style={styles.compactSpecimenFrame}
        />
        <View style={styles.compactTrackCopy}>
          <Text brand color="deepForest" variant="label">
            {content.name}
          </Text>
          <View style={[styles.compactMeta, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
            <Text brand color="primary" variant="caption">
              {content.stageLabel}
            </Text>
            <View style={styles.compactMetaDot} />
            <Text brand color="onSurfaceVariant" direction={direction} tabular variant="caption">
              {content.progressLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function useGardenRecognitionReveal(
  recognitionReveal: GardenRecognitionReveal | undefined,
  direction: 'rtl' | 'ltr',
) {
  const reducedMotion = useReducedMotionPreference();
  const shouldRender = recognitionReveal?.play === true;
  const seedTravel = useSharedValue(shouldRender && !reducedMotion ? 0 : 1);
  const detailReveal = useSharedValue(shouldRender && !reducedMotion ? 0 : 1);
  const presentedSequences = useRef(new Set<string | number>());
  const announcedSequences = useRef(new Set<string | number>());
  const sequenceKey = recognitionReveal?.sequenceKey;

  useLayoutEffect(() => {
    cancelAnimation(seedTravel);
    cancelAnimation(detailReveal);

    const alreadyPresented =
      sequenceKey !== undefined && presentedSequences.current.has(sequenceKey);
    if (shouldRender && sequenceKey !== undefined) {
      // Static presentation also consumes the sequence before a live preference resolves.
      presentedSequences.current.add(sequenceKey);
    }

    if (!shouldRender || reducedMotion || alreadyPresented) {
      seedTravel.set(1);
      detailReveal.set(1);
      return;
    }

    seedTravel.set(0);
    detailReveal.set(0);
    // The live preference above owns policy; do not reuse Reanimated's startup snapshot.
    seedTravel.set(
      withTiming(1, {
        duration: SEED_TRAVEL_DURATION,
        easing: EASE_IN_OUT,
        reduceMotion: ReduceMotion.Never,
      }),
    );
    detailReveal.set(
      withDelay(
        DETAIL_REVEAL_DELAY,
        withTiming(1, {
          duration: DETAIL_REVEAL_DURATION,
          easing: EASE_OUT,
          reduceMotion: ReduceMotion.Never,
        }),
        ReduceMotion.Never,
      ),
    );

    return () => {
      cancelAnimation(seedTravel);
      cancelAnimation(detailReveal);
    };
  }, [detailReveal, reducedMotion, seedTravel, sequenceKey, shouldRender]);

  useEffect(() => {
    const announcement = recognitionReveal?.accessibilityAnnouncement;
    if (!shouldRender || !announcement || sequenceKey === undefined) return;
    if (announcedSequences.current.has(sequenceKey)) return;

    announcedSequences.current.add(sequenceKey);
    AccessibilityInfo.announceForAccessibility(announcement);
  }, [recognitionReveal?.accessibilityAnnouncement, sequenceKey, shouldRender]);

  const seedCueStyle = useAnimatedStyle(() => {
    const progress = seedTravel.get();
    const logicalOffset = direction === 'rtl' ? SEED_TRAVEL_DISTANCE : -SEED_TRAVEL_DISTANCE;
    return {
      opacity: reducedMotion ? 1 : interpolate(progress, [0, 0.5, 1], [0, 1, 0]),
      transform: [
        { translateX: logicalOffset * (1 - progress) },
        { translateY: spacing.xs * (1 - progress) },
        { scale: 0.96 + progress * 0.04 },
      ],
    };
  }, [direction, reducedMotion]);

  const detailStyle = useAnimatedStyle(() => {
    const progress = detailReveal.get();
    return {
      opacity: progress,
      transform: [{ translateY: spacing.xs * (1 - progress) }, { scale: 0.95 + progress * 0.05 }],
    };
  });

  return { detailStyle, seedCueStyle, shouldRender };
}

function StageRuler({ currentStage }: { readonly currentStage: GardenStage }) {
  const direction = usePrototypeStore((state) => state.direction);
  const currentIndex = STAGE_INDEX[currentStage];
  return (
    <View
      aria-hidden
      style={[styles.stageRuler, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
    >
      {LANDSCAPE_STAGE_ORDER.map((stage, index) => (
        <View
          key={stage}
          style={[
            styles.stageMark,
            index < currentIndex ? styles.stageMarkPast : null,
            index === currentIndex ? styles.stageMarkCurrent : null,
          ]}
        />
      ))}
    </View>
  );
}

function ProgressBand({
  accessibilityLabel,
  direction,
  progress,
}: {
  readonly accessibilityLabel: string;
  readonly direction: 'rtl' | 'ltr';
  readonly progress: number;
}) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={styles.progressTrack}
    >
      <View
        style={[
          styles.progressFill,
          direction === 'rtl' ? styles.progressFillRtl : styles.progressFillLtr,
          { width: `${progress}%` },
        ]}
      />
    </View>
  );
}

function getProgressPercent(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / target)) * 100);
}

const styles = StyleSheet.create({
  landscape: { width: '100%', gap: spacing.md },
  landscapeHeading: { alignItems: 'center', gap: spacing.sm },
  headingIcon: { width: 38, height: 32, alignItems: 'center', justifyContent: 'center' },
  landscapeHeadingText: { flex: 1 },
  trackLedger: {
    gap: botanical.space.section,
  },
  trackHero: {
    overflow: 'hidden',
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
  },
  heroSpecimenFrame: {
    position: 'relative',
    width: '100%',
    maxHeight: 280,
    aspectRatio: 176 / 104,
    overflow: 'hidden',
    backgroundColor: botanical.colors.water,
  },
  heroArtwork: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  supportingLedger: { minWidth: 0 },
  compactTrack: {
    position: 'relative',
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: botanical.colors.line,
    paddingVertical: botanical.space.row,
  },
  compactTrackLast: { borderBottomWidth: 0 },
  compactTrackBody: { minWidth: 0, alignItems: 'center', gap: spacing.md },
  compactSpecimenFrame: {
    width: 80,
    height: 60,
    flexShrink: 0,
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
  },
  compactTrackCopy: { minWidth: 0, flex: 1, gap: spacing.xxs },
  compactMeta: { alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  compactMetaDot: {
    width: spacing.xxs,
    height: spacing.xxs,
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.amber,
  },
  recognitionSeedCue: {
    position: 'absolute',
    bottom: spacing.xs,
    zIndex: 2,
    width: 42,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recognitionSeedCueLtr: { left: spacing.sm },
  recognitionSeedCueRtl: { right: spacing.sm },
  recognitionSeedMark: {
    width: 15,
    height: 10,
    borderRadius: botanical.radius.pill,
    borderWidth: 2,
    borderColor: colors.goldLight,
    backgroundColor: colors.earth,
    transform: [{ rotate: '-18deg' }],
  },
  biologicalDetail: { position: 'absolute', top: spacing.xs, zIndex: 2, width: 46, height: 46 },
  biologicalDetailLtr: { right: spacing.sm },
  biologicalDetailRtl: { left: spacing.sm },
  biologicalDetailMark: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: botanical.colors.line,
  },
  trackCopy: {
    width: '100%',
    gap: spacing.sm,
    padding: botanical.space.inset,
  },
  trackHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trackNames: { minWidth: 0, flexGrow: 1, flexBasis: 180, gap: spacing.xxs },
  activeFlag: {
    minHeight: 32,
    minWidth: 0,
    maxWidth: 160,
    flexShrink: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeFlagLine: { width: 13, height: 2, backgroundColor: botanical.colors.forestRaised },
  stageRow: { gap: spacing.xs },
  stageRuler: { minHeight: 12, alignItems: 'center', gap: spacing.xs },
  stageMark: {
    width: 14,
    height: 3,
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
  },
  stageMarkPast: { backgroundColor: colors.leaf },
  stageMarkCurrent: { width: 22, height: 5, backgroundColor: botanical.colors.forest },
  progressTrack: {
    position: 'relative',
    height: 6,
    overflow: 'hidden',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: botanical.colors.forestRaised,
  },
  progressFillLtr: { left: 0 },
  progressFillRtl: { right: 0 },
  symbolicNote: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: botanical.colors.line,
  },
  symbolicIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  noteText: { flex: 1 },
  rowLtr: { flexDirection: 'row' },
  rowRtl: { flexDirection: 'row-reverse' },
});
