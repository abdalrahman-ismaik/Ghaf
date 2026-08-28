import { useEffect, useLayoutEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/primitives';
import { colors, motion, radii, spacing } from '@/design/tokens';
import type { GardenStage, LandscapeId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const LANDSCAPE_ORDER: readonly LandscapeId[] = ['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'];

const STAGE_INDEX: Readonly<Record<GardenStage, number>> = {
  seed: 0,
  shoot: 1,
  sapling: 2,
  shade: 3,
  flourishing: 4,
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
        <LandscapeMark />
        <Text color="forest" style={styles.landscapeHeadingText} variant="label">
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
          <View
            style={[
              styles.connectionLine,
              direction === 'rtl' ? styles.connectionLineRtl : styles.connectionLineLtr,
            ]}
          />
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
        <SymbolicMark />
        <Text color="inkMuted" style={styles.noteText} variant="caption">
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
  const progress = getProgressPercent(content.cumulativeSeeds, content.targetSeeds);
  const reveal = useGardenRecognitionReveal(recognitionReveal, direction);

  return (
    <View style={styles.trackHero} testID="active-landscape-hero">
      <View
        accessibilityLabel={content.accessibilityLabel}
        accessibilityRole="image"
        style={styles.heroSpecimenFrame}
      >
        <LandscapeSpecimen active id={id} stage={content.stage} />
        {reveal.shouldRender ? (
          <>
            <Animated.View
              aria-hidden
              style={[
                styles.recognitionSeedCue,
                direction === 'rtl' ? styles.recognitionSeedCueRtl : styles.recognitionSeedCueLtr,
                reveal.seedCueStyle,
              ]}
            >
              <RecognitionSeedMark />
            </Animated.View>
            <Animated.View
              aria-hidden
              style={[
                styles.biologicalDetail,
                direction === 'rtl' ? styles.biologicalDetailRtl : styles.biologicalDetailLtr,
                reveal.detailStyle,
              ]}
            >
              <BiologicalDetailMark landscapeId={id} />
            </Animated.View>
          </>
        ) : null}
      </View>

      <View style={styles.trackCopy}>
        <View style={[styles.trackHeader, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <View style={styles.trackNames}>
            <Text color="forest" variant="heading">
              {content.name}
            </Text>
            <Text color="mangrove" variant="caption">
              {content.categoryLabel}
            </Text>
          </View>
          <View style={[styles.activeFlag, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
            <View style={styles.activeFlagLine} />
            <Text color="forest" variant="caption">
              {activeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.stageRow}>
          <Text color="forest" variant="label">
            {content.stageLabel}
          </Text>
          <StageRuler currentStage={content.stage} />
        </View>

        <ProgressBand
          accessibilityLabel={content.progressLabel}
          direction={direction}
          progress={progress}
        />
        <Text color="inkMuted" variant="caption">
          {content.progressLabel}
        </Text>
        {content.originNote ? (
          <Text color="earth" variant="caption">
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
      <View
        style={[
          styles.connectionNode,
          direction === 'rtl' ? styles.connectionNodeRtl : styles.connectionNodeLtr,
        ]}
      />
      <View style={[styles.compactTrackBody, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.compactSpecimenFrame}>
          <LandscapeSpecimen active={false} id={id} stage={content.stage} />
        </View>
        <View style={styles.compactTrackCopy}>
          <Text color="forest" variant="label">
            {content.name}
          </Text>
          <View style={[styles.compactMeta, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
            <Text color="forest" variant="caption">
              {content.stageLabel}
            </Text>
            <View style={styles.compactMetaDot} />
            <Text color="inkMuted" direction="ltr" variant="caption">
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
  const reducedMotion = useReducedMotion();
  const shouldRender = recognitionReveal?.play === true;
  const seedTravel = useSharedValue(shouldRender && !reducedMotion ? 0 : 1);
  const detailReveal = useSharedValue(shouldRender && !reducedMotion ? 0 : 1);
  const lastAnnouncedSequence = useRef<string | number | null>(null);
  const sequenceKey = recognitionReveal?.sequenceKey;

  useLayoutEffect(() => {
    cancelAnimation(seedTravel);
    cancelAnimation(detailReveal);

    if (!shouldRender || reducedMotion) {
      seedTravel.set(1);
      detailReveal.set(1);
      return;
    }

    seedTravel.set(0);
    detailReveal.set(0);
    seedTravel.set(
      withTiming(1, {
        duration: SEED_TRAVEL_DURATION,
        easing: EASE_IN_OUT,
        reduceMotion: ReduceMotion.System,
      }),
    );
    detailReveal.set(
      withDelay(
        DETAIL_REVEAL_DELAY,
        withTiming(1, {
          duration: DETAIL_REVEAL_DURATION,
          easing: EASE_OUT,
          reduceMotion: ReduceMotion.System,
        }),
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
    if (lastAnnouncedSequence.current === sequenceKey) return;

    lastAnnouncedSequence.current = sequenceKey;
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

function LandscapeSpecimen({
  active,
  id,
  stage,
}: {
  readonly active: boolean;
  readonly id: LandscapeId;
  readonly stage: GardenStage;
}) {
  const stageIndex = STAGE_INDEX[stage];
  const isCoastal = id === 'mangrove';

  return (
    <Svg aria-hidden height="100%" viewBox="0 0 176 104" width="100%">
      <Rect fill={isCoastal ? colors.waterLight : colors.sandLight} height="104" width="176" />
      <Path
        d={
          isCoastal
            ? 'M0 70 C35 64 60 72 88 67 C119 62 144 67 176 62 L176 104 L0 104Z'
            : 'M0 77 C31 67 58 73 88 69 C122 65 147 72 176 66 L176 104 L0 104Z'
        }
        fill={isCoastal ? colors.water : colors.sand}
        opacity={isCoastal ? 0.52 : 0.66}
      />
      {isCoastal ? (
        <G opacity={active ? 0.9 : 0.58}>
          <Path
            d="M8 83 C25 78 39 88 57 82 C75 76 91 87 109 81 C128 75 146 85 168 78"
            fill="none"
            stroke={colors.surface}
            strokeLinecap="round"
            strokeWidth="2"
          />
          <Path
            d="M24 94 C46 89 63 97 84 92 C108 87 129 96 153 90"
            fill="none"
            stroke={colors.waterLight}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </G>
      ) : (
        <Path
          d="M14 85 C49 79 75 85 108 80 C134 77 150 80 166 77"
          fill="none"
          stroke={colors.earth}
          strokeLinecap="round"
          strokeWidth="1.5"
          opacity="0.32"
        />
      )}

      {stageIndex === 0 ? <SeedStage coastal={isCoastal} /> : null}
      {stageIndex === 1 ? <ShootStage coastal={isCoastal} /> : null}
      {stageIndex >= 2 ? <DevelopedPlant id={id} stageIndex={stageIndex} /> : null}

      {active ? (
        <G>
          <Line
            stroke={colors.mangrove}
            strokeLinecap="round"
            strokeWidth="2"
            x1="14"
            x2="14"
            y1="15"
            y2="35"
          />
          <Circle cx="14" cy="10" fill={colors.gold} r="3" />
        </G>
      ) : null}
    </Svg>
  );
}

function SeedStage({ coastal }: { readonly coastal: boolean }) {
  return (
    <G>
      <Ellipse
        cx="88"
        cy={coastal ? 70 : 76}
        fill={colors.earth}
        rx="10"
        ry="6"
        transform={`rotate(-18 88 ${coastal ? 70 : 76})`}
      />
      <Path
        d={coastal ? 'M88 70 C78 78 74 87 73 94' : 'M88 76 C78 82 75 88 73 95'}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Circle cx="101" cy={coastal ? 73 : 79} fill={colors.goldLight} r="2.5" />
    </G>
  );
}

function ShootStage({ coastal }: { readonly coastal: boolean }) {
  const groundY = coastal ? 70 : 77;
  return (
    <G>
      <Path
        d={`M88 ${groundY + 3} C86 ${groundY - 6} 90 ${groundY - 17} 87 ${groundY - 28}`}
        fill="none"
        stroke={colors.ghaf}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Path
        d={`M87 ${groundY - 17} C76 ${groundY - 22} 72 ${groundY - 30} 75 ${groundY - 35} C84 ${groundY - 33} 90 ${groundY - 26} 87 ${groundY - 17}Z`}
        fill={colors.leaf}
      />
      <Path
        d={`M88 ${groundY - 24} C98 ${groundY - 30} 102 ${groundY - 37} 99 ${groundY - 42} C91 ${groundY - 39} 85 ${groundY - 33} 88 ${groundY - 24}Z`}
        fill={colors.ghaf}
      />
      <Path
        d={`M88 ${groundY + 1} C78 ${groundY + 8} 75 ${groundY + 14} 74 ${groundY + 20}`}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </G>
  );
}

function DevelopedPlant({
  id,
  stageIndex,
}: {
  readonly id: LandscapeId;
  readonly stageIndex: number;
}) {
  if (id === 'date_palm') return <DatePalm stageIndex={stageIndex} />;
  if (id === 'mangrove') return <Mangrove stageIndex={stageIndex} />;
  return <DesertTree id={id} stageIndex={stageIndex} />;
}

function DesertTree({ id, stageIndex }: { readonly id: LandscapeId; readonly stageIndex: number }) {
  const mature = stageIndex >= 3;
  const flourishing = stageIndex >= 4;
  const canopyFill = id === 'ghaf' ? colors.ghaf : id === 'samar' ? colors.leaf : colors.forestSoft;
  const crownY = id === 'samar' ? 35 : id === 'sidr' ? 37 : 31;

  return (
    <G>
      <Path
        d={
          mature
            ? 'M78 78 C81 64 82 51 84 38 C88 52 93 65 99 78Z'
            : 'M82 78 C84 64 85 50 87 39 C90 53 92 66 94 78Z'
        }
        fill={colors.earth}
      />
      <Path
        d={mature ? 'M86 55 C71 48 62 41 53 32' : 'M87 57 C77 52 72 47 66 41'}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth={mature ? 5 : 3.5}
      />
      <Path
        d={mature ? 'M89 53 C105 46 115 39 123 29' : 'M89 55 C99 50 105 45 110 38'}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth={mature ? 5 : 3.5}
      />
      <Ellipse
        cx={mature ? 60 : 68}
        cy={mature ? crownY + 5 : crownY + 13}
        fill={canopyFill}
        opacity={mature ? 0.82 : 0.76}
        rx={mature ? 29 : 18}
        ry={mature ? 17 : 12}
      />
      <Ellipse
        cx="90"
        cy={mature ? crownY : crownY + 8}
        fill={colors.ghaf}
        opacity="0.9"
        rx={mature ? 34 : 22}
        ry={mature ? 21 : 14}
      />
      <Ellipse
        cx={mature ? 121 : 110}
        cy={mature ? crownY + 7 : crownY + 14}
        fill={id === 'sidr' ? colors.leaf : colors.forestSoft}
        opacity="0.84"
        rx={mature ? 28 : 18}
        ry={mature ? 17 : 12}
      />
      {mature ? (
        <G>
          <Path
            d="M86 76 C71 82 63 87 57 94"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="3"
          />
          <Path
            d="M90 76 C106 82 116 87 122 94"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </G>
      ) : null}
      {flourishing ? (
        <G>
          <Circle cx="62" cy="31" fill={colors.goldLight} r="3" />
          <Circle cx="89" cy="24" fill={colors.gold} r="3" />
          <Circle cx="120" cy="35" fill={colors.goldLight} r="3" />
          <Path
            d="M132 17 Q138 11 144 17 Q150 11 156 17"
            fill="none"
            stroke={colors.forest}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </G>
      ) : null}
    </G>
  );
}

function DatePalm({ stageIndex }: { readonly stageIndex: number }) {
  const mature = stageIndex >= 3;
  const flourishing = stageIndex >= 4;
  return (
    <G>
      <Path
        d={
          mature
            ? 'M82 78 C84 57 84 36 89 20 C93 38 95 58 98 78Z'
            : 'M84 78 C85 59 86 43 89 29 C92 44 93 60 95 78Z'
        }
        fill={colors.earth}
      />
      <G fill="none" stroke={colors.ghaf} strokeLinecap="round" strokeWidth={mature ? 5 : 4}>
        <Path d={mature ? 'M89 24 C70 14 54 15 40 20' : 'M89 31 C75 24 65 25 56 29'} />
        <Path d={mature ? 'M90 23 C108 13 126 15 140 21' : 'M90 31 C103 24 115 26 124 31'} />
        <Path d={mature ? 'M89 22 C75 5 66 4 59 7' : 'M89 30 C80 18 73 17 67 19'} />
        <Path d={mature ? 'M90 22 C103 6 113 4 122 8' : 'M90 30 C99 19 107 18 114 21'} />
        <Path d="M90 24 C89 13 90 7 93 3" />
      </G>
      {mature ? (
        <G>
          <Path
            d="M86 78 C72 84 65 89 59 95"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="3"
          />
          <Path
            d="M95 78 C108 84 116 89 122 95"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </G>
      ) : null}
      {flourishing ? (
        <G>
          <Circle cx="83" cy="31" fill={colors.gold} r="3" />
          <Circle cx="87" cy="36" fill={colors.goldLight} r="3" />
          <Circle cx="96" cy="31" fill={colors.gold} r="3" />
          <Circle cx="100" cy="36" fill={colors.goldLight} r="3" />
        </G>
      ) : null}
    </G>
  );
}

function Mangrove({ stageIndex }: { readonly stageIndex: number }) {
  const mature = stageIndex >= 3;
  const flourishing = stageIndex >= 4;
  return (
    <G>
      <Path
        d={
          mature
            ? 'M80 70 C83 55 85 42 88 30 C92 44 95 56 99 70Z'
            : 'M83 70 C85 58 86 48 88 38 C91 49 93 60 95 70Z'
        }
        fill={colors.earth}
      />
      <G fill="none" stroke={colors.earth} strokeLinecap="round">
        <Path d="M86 64 C75 72 68 82 66 95" strokeWidth={mature ? 4 : 3} />
        <Path d="M89 62 C88 75 87 84 87 97" strokeWidth={mature ? 4 : 3} />
        <Path d="M93 64 C105 73 111 83 113 96" strokeWidth={mature ? 4 : 3} />
        {mature ? <Path d="M83 58 C68 66 57 77 52 91" strokeWidth="3" /> : null}
        {mature ? <Path d="M97 58 C113 65 125 76 131 91" strokeWidth="3" /> : null}
      </G>
      <Path
        d={mature ? 'M88 44 C70 36 61 29 52 20' : 'M88 49 C77 44 71 39 66 33'}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth={mature ? 5 : 3.5}
      />
      <Path
        d={mature ? 'M91 43 C107 35 118 28 126 19' : 'M91 48 C102 42 108 37 113 31'}
        fill="none"
        stroke={colors.earth}
        strokeLinecap="round"
        strokeWidth={mature ? 5 : 3.5}
      />
      <Ellipse
        cx={mature ? 61 : 69}
        cy={mature ? 24 : 34}
        fill={colors.mangrove}
        opacity="0.86"
        rx={mature ? 25 : 17}
        ry={mature ? 15 : 11}
      />
      <Ellipse
        cx="90"
        cy={mature ? 20 : 31}
        fill={colors.ghaf}
        opacity="0.92"
        rx={mature ? 31 : 21}
        ry={mature ? 18 : 13}
      />
      <Ellipse
        cx={mature ? 120 : 111}
        cy={mature ? 25 : 35}
        fill={colors.forestSoft}
        opacity="0.86"
        rx={mature ? 25 : 17}
        ry={mature ? 15 : 11}
      />
      {flourishing ? (
        <G>
          <Circle cx="67" cy="19" fill={colors.goldLight} r="3" />
          <Circle cx="92" cy="13" fill={colors.gold} r="3" />
          <Circle cx="118" cy="20" fill={colors.goldLight} r="3" />
          <Path
            d="M18 88 C37 82 51 91 69 86"
            fill="none"
            stroke={colors.surface}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <Path
            d="M126 85 C142 80 153 87 165 82"
            fill="none"
            stroke={colors.surface}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </G>
      ) : null}
    </G>
  );
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

const LANDSCAPE_STAGE_ORDER: readonly GardenStage[] = [
  'seed',
  'shoot',
  'sapling',
  'shade',
  'flourishing',
];

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

function LandscapeMark() {
  return (
    <Svg aria-hidden height={32} viewBox="0 0 38 32" width={38}>
      <Path
        d="M2 23 C11 16 18 20 26 14 C30 11 34 9 36 8"
        fill="none"
        stroke={colors.earth}
        strokeWidth="2"
      />
      <Path
        d="M2 27 C12 22 21 27 36 19"
        fill="none"
        stroke={colors.water}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M21 18 C22 11 24 7 27 3 C30 8 31 12 31 17"
        fill="none"
        stroke={colors.ghaf}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Circle cx="27" cy="4" fill={colors.gold} r="2.5" />
    </Svg>
  );
}

function SymbolicMark() {
  return (
    <Svg aria-hidden height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx="12" cy="12" fill={colors.surface} r="10" stroke={colors.line} />
      <Path
        d="M12 17 C11 13 12 9 16 6"
        fill="none"
        stroke={colors.ghaf}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Path d="M13 10 C8 10 6 8 6 5 C10 4 13 6 13 10Z" fill={colors.leaf} />
    </Svg>
  );
}

function RecognitionSeedMark() {
  return (
    <Svg aria-hidden height="100%" viewBox="0 0 42 32" width="100%">
      <Circle cx="21" cy="16" fill={colors.goldGlow} r="14" stroke={colors.goldLight} />
      <Ellipse cx="21" cy="16" fill={colors.earth} rx="7" ry="4.5" transform="rotate(-18 21 16)" />
      <Path
        d="M22 15 C26 11 29 8 33 7"
        fill="none"
        stroke={colors.ghaf}
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Circle cx="34" cy="7" fill={colors.gold} r="2" />
    </Svg>
  );
}

function BiologicalDetailMark({ landscapeId }: { readonly landscapeId: LandscapeId }) {
  const isMangrove = landscapeId === 'mangrove';
  const isDatePalm = landscapeId === 'date_palm';

  return (
    <Svg aria-hidden height="100%" viewBox="0 0 56 46" width="100%">
      <Circle cx="28" cy="22" fill={colors.surface} opacity="0.94" r="20" />
      {isMangrove ? (
        <G>
          <Path
            d="M8 35 C17 31 23 38 32 34 C40 31 46 34 51 31"
            fill="none"
            stroke={colors.water}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <Path
            d="M28 31 C27 24 29 18 31 13"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <Path
            d="M28 27 C22 32 19 36 18 41 M30 27 C35 32 38 36 39 41"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="2"
          />
          <Path d="M30 20 C21 20 17 16 18 10 C26 9 31 13 30 20Z" fill={colors.mangrove} />
          <Circle cx="34" cy="11" fill={colors.gold} r="2.5" />
        </G>
      ) : isDatePalm ? (
        <G>
          <Path d="M26 36 C27 27 28 18 29 10 C31 19 32 28 33 36Z" fill={colors.earth} />
          <Path
            d="M29 13 C20 8 15 9 10 12 M30 13 C39 8 45 9 50 13 M30 13 C29 7 30 4 32 2"
            fill="none"
            stroke={colors.ghaf}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <Circle cx="25" cy="17" fill={colors.gold} r="2.5" />
          <Circle cx="31" cy="19" fill={colors.goldLight} r="2.5" />
          <Circle cx="36" cy="16" fill={colors.gold} r="2.5" />
        </G>
      ) : (
        <G>
          <Path
            d="M13 34 C23 28 29 20 36 10"
            fill="none"
            stroke={colors.earth}
            strokeLinecap="round"
            strokeWidth="3"
          />
          <Path d="M27 22 C19 22 15 18 16 12 C24 11 29 15 27 22Z" fill={colors.ghaf} />
          <Path d="M33 15 C35 8 40 6 46 8 C45 15 40 18 33 15Z" fill={colors.leaf} />
          <Circle cx="37" cy="10" fill={colors.gold} r="2.5" />
        </G>
      )}
    </Svg>
  );
}

function getProgressPercent(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, current / target)) * 100);
}

const styles = StyleSheet.create({
  landscape: {
    width: '100%',
    gap: spacing.md,
  },
  landscapeHeading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  landscapeHeadingText: {
    flex: 1,
  },
  trackLedger: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  trackHero: {
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  heroSpecimenFrame: {
    position: 'relative',
    width: '100%',
    height: 176,
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.waterLight,
  },
  supportingLedger: {
    position: 'relative',
    backgroundColor: colors.surface,
  },
  connectionLine: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    bottom: spacing.xl,
    width: 1,
    backgroundColor: colors.earth,
    opacity: 0.3,
  },
  connectionLineLtr: {
    left: spacing.lg,
  },
  connectionLineRtl: {
    right: spacing.lg,
  },
  connectionNode: {
    position: 'absolute',
    pointerEvents: 'none',
    top: spacing.xl,
    width: 9,
    height: 9,
    borderWidth: 2,
    borderColor: colors.earth,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  connectionNodeLtr: {
    left: spacing.md,
  },
  connectionNodeRtl: {
    right: spacing.md,
  },
  compactTrack: {
    position: 'relative',
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingStart: spacing.xxl,
    paddingEnd: spacing.md,
    paddingVertical: spacing.sm,
  },
  compactTrackLast: {
    borderBottomWidth: 0,
  },
  compactTrackBody: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.md,
  },
  compactSpecimenFrame: {
    width: 72,
    height: 48,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
  },
  compactTrackCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  compactMeta: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  compactMetaDot: {
    width: spacing.xxs,
    height: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  recognitionSeedCue: {
    position: 'absolute',
    pointerEvents: 'none',
    bottom: spacing.xs,
    zIndex: 2,
    width: 42,
    height: 32,
  },
  recognitionSeedCueLtr: {
    left: spacing.sm,
  },
  recognitionSeedCueRtl: {
    right: spacing.sm,
  },
  biologicalDetail: {
    position: 'absolute',
    pointerEvents: 'none',
    top: spacing.xs,
    zIndex: 2,
    width: 56,
    height: 46,
  },
  biologicalDetailLtr: {
    right: spacing.sm,
  },
  biologicalDetailRtl: {
    left: spacing.sm,
  },
  trackCopy: {
    width: '100%',
    gap: spacing.xs,
  },
  trackHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trackNames: {
    flex: 1,
    gap: spacing.xxs,
  },
  activeFlag: {
    minHeight: 32,
    maxWidth: 160,
    flexShrink: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeFlagLine: {
    width: 13,
    height: 2,
    backgroundColor: colors.mangrove,
  },
  stageRow: {
    gap: spacing.xs,
  },
  stageRuler: {
    minHeight: 12,
    alignItems: 'center',
    gap: spacing.xs,
  },
  stageMark: {
    width: 14,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
  },
  stageMarkPast: {
    backgroundColor: colors.leaf,
  },
  stageMarkCurrent: {
    width: 22,
    height: 5,
    backgroundColor: colors.ghaf,
  },
  progressTrack: {
    position: 'relative',
    height: 8,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.leafLight,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.mangrove,
  },
  progressFillLtr: {
    left: 0,
  },
  progressFillRtl: {
    right: 0,
  },
  symbolicNote: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  noteText: {
    flex: 1,
  },
  rowLtr: {
    flexDirection: 'row',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
});
