import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { colors, motion, radii, spacing } from '@/design/tokens';
import type { GhafStage } from '@/models/prototype';

interface GhafTreeProps {
  progressPercent?: number;
  showProgress?: boolean;
  size?: number;
  stage: GhafStage;
}

const canopyLeaves = [
  { cx: 77, cy: 92, rx: 28, ry: 21, color: '#91B47E' },
  { cx: 112, cy: 67, rx: 31, ry: 25, color: '#6E9D64' },
  { cx: 148, cy: 76, rx: 34, ry: 27, color: '#80AA70' },
  { cx: 174, cy: 103, rx: 29, ry: 24, color: '#67955F' },
  { cx: 126, cy: 104, rx: 39, ry: 30, color: '#527F55' },
  { cx: 91, cy: 122, rx: 29, ry: 22, color: '#739F66' },
  { cx: 154, cy: 126, rx: 36, ry: 25, color: '#5E8C58' },
  { cx: 124, cy: 137, rx: 37, ry: 24, color: '#47784E' },
] as const;

const detailLeaves = [
  { cx: 58, cy: 108, rotation: -34 },
  { cx: 75, cy: 65, rotation: -15 },
  { cx: 111, cy: 41, rotation: -8 },
  { cx: 153, cy: 48, rotation: 18 },
  { cx: 193, cy: 82, rotation: 32 },
  { cx: 188, cy: 131, rotation: 55 },
  { cx: 147, cy: 150, rotation: 10 },
  { cx: 78, cy: 144, rotation: -30 },
] as const;

function stageLeafCount(stage: GhafStage): number {
  if (stage === 2) return 3;
  if (stage === 3) return 5;
  if (stage === 4) return 7;
  if (stage === 5) return 8;
  return 0;
}

export function GhafTree({
  progressPercent = 0,
  showProgress = true,
  size = 260,
  stage,
}: GhafTreeProps) {
  const { t } = useTranslation();
  const entrance = useSharedValue(0);
  const boundedPercent = Math.max(0, Math.min(100, Math.round(progressPercent)));

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, {
      duration: motion.duration.slow,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });

    return () => cancelAnimation(entrance);
  }, [entrance, stage]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 10 }, { scale: 0.96 + entrance.value * 0.04 }],
  }));

  const stageName = t(`ghaf.stageNames.${stage}`);
  const leafCount = stageLeafCount(stage);

  return (
    <View
      accessibilityLabel={`${stageName}. ${t('ghaf.progress', { percent: boundedPercent })}`}
      accessibilityRole="image"
      style={styles.wrapper}
    >
      <Animated.View style={[styles.canvas, { width: size, height: size }, entranceStyle]}>
        <Svg height="100%" viewBox="0 0 240 240" width="100%">
          <Circle cx="120" cy="116" fill={colors.sandLight} opacity={0.58} r="102" />
          <Circle cx="188" cy="48" fill={colors.goldLight} opacity={0.88} r="18" />
          <Path
            d="M30 202 C70 188 167 188 210 202 C177 224 65 224 30 202Z"
            fill={colors.sand}
            opacity={0.72}
          />
          <Ellipse
            cx="120"
            cy="202"
            fill={colors.earth}
            opacity={0.16}
            rx={stage > 1 ? 60 : 25}
            ry="8"
          />

          {stage <= 1 ? (
            <G>
              <Path
                d="M102 188 C109 174 132 174 139 190 C130 204 108 204 102 188Z"
                fill="#91684B"
              />
              <Path
                d="M106 188 C114 184 128 184 136 189"
                fill="none"
                stroke="#BE8E64"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </G>
          ) : null}

          {stage >= 1 ? (
            <G>
              <Path
                d="M120 188 C111 193 106 201 103 211"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="4"
              />
              <Path
                d="M120 190 C132 196 137 203 141 211"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="4"
              />
              <Path
                d="M119 191 C119 199 117 207 118 214"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </G>
          ) : null}

          {stage === 1 ? (
            <G>
              <Path
                d="M120 187 C121 166 119 154 121 137"
                fill="none"
                stroke={colors.ghaf}
                strokeLinecap="round"
                strokeWidth="5"
              />
              <Path
                d="M121 157 C110 151 105 143 107 136 C117 136 124 142 121 157Z"
                fill={colors.leaf}
              />
              <Path
                d="M121 148 C131 143 136 136 134 129 C124 130 118 138 121 148Z"
                fill="#5F915C"
              />
            </G>
          ) : null}

          {stage >= 2 ? (
            <G>
              <Path
                d={
                  stage === 2
                    ? 'M113 195 C117 169 117 142 120 112 C125 144 127 170 129 195Z'
                    : 'M105 199 C113 166 114 126 119 88 C126 125 132 166 136 199Z'
                }
                fill={colors.earth}
              />
              <Path
                d={
                  stage === 2 ? 'M120 148 C106 139 99 132 94 123' : 'M121 137 C101 122 87 108 74 92'
                }
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth={stage === 2 ? 5 : 8}
              />
              <Path
                d={
                  stage === 2
                    ? 'M123 141 C135 134 141 125 145 116'
                    : 'M124 126 C145 112 159 99 170 83'
                }
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth={stage === 2 ? 5 : 8}
              />
            </G>
          ) : null}

          {stage >= 4 ? (
            <G>
              <Path
                d="M116 119 C99 101 98 78 100 60"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="6"
              />
              <Path
                d="M128 117 C146 100 151 79 151 62"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="6"
              />
              <Path
                d="M113 145 C91 137 69 124 55 108"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="5"
              />
              <Path
                d="M131 149 C155 140 175 128 190 112"
                fill="none"
                stroke={colors.earth}
                strokeLinecap="round"
                strokeWidth="5"
              />
            </G>
          ) : null}

          {stage >= 3 ? (
            <G>
              {canopyLeaves.slice(0, leafCount).map((leaf, index) => (
                <Ellipse
                  cx={leaf.cx}
                  cy={leaf.cy}
                  fill={leaf.color}
                  key={`${leaf.cx}-${leaf.cy}`}
                  opacity={0.9 + index * 0.01}
                  rx={leaf.rx}
                  ry={leaf.ry}
                />
              ))}
            </G>
          ) : null}

          {stage === 2 ? (
            <G>
              <Ellipse
                cx="91"
                cy="120"
                fill={colors.leaf}
                rx="15"
                ry="10"
                transform="rotate(-24 91 120)"
              />
              <Ellipse
                cx="147"
                cy="113"
                fill="#5E915A"
                rx="15"
                ry="10"
                transform="rotate(22 147 113)"
              />
              <Ellipse cx="120" cy="101" fill="#75A76D" rx="14" ry="11" />
            </G>
          ) : null}

          {stage >= 4 ? (
            <G>
              {detailLeaves.slice(0, stage === 4 ? 5 : 8).map((leaf) => (
                <Path
                  d={`M${leaf.cx - 7} ${leaf.cy} C${leaf.cx - 2} ${leaf.cy - 8} ${leaf.cx + 7} ${leaf.cy - 7} ${leaf.cx + 9} ${leaf.cy} C${leaf.cx + 3} ${leaf.cy + 7} ${leaf.cx - 3} ${leaf.cy + 7} ${leaf.cx - 7} ${leaf.cy}Z`}
                  fill={stage === 5 ? colors.goldLight : colors.leafLight}
                  key={`${leaf.cx}-${leaf.cy}`}
                  opacity={stage === 5 ? 0.92 : 0.7}
                  transform={`rotate(${leaf.rotation} ${leaf.cx} ${leaf.cy})`}
                />
              ))}
            </G>
          ) : null}

          {stage === 5 ? (
            <G>
              <Circle cx="93" cy="94" fill={colors.gold} r="3" />
              <Circle cx="147" cy="91" fill={colors.gold} r="3" />
              <Circle cx="126" cy="125" fill={colors.gold} r="3" />
              <Path
                d="M184 54 Q191 47 198 54 Q205 47 212 54"
                fill="none"
                stroke={colors.forest}
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </G>
          ) : null}
        </Svg>
      </Animated.View>

      <View style={styles.stageCopy}>
        <View style={styles.stagePill}>
          <Text align="center" color="forest" variant="caption">
            {t('ghaf.stage', { current: stage + 1 })}
          </Text>
        </View>
        <Text align="center" color="forest" variant="heading">
          {stageName}
        </Text>
        {showProgress ? (
          <Text align="center" color="inkMuted" variant="label">
            {t('ghaf.progress', { percent: boundedPercent })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  canvas: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCopy: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  stagePill: {
    alignSelf: 'center',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.leafLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
