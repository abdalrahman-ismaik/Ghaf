import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/prototype';

export interface MasroofiCardProps {
  holderName: string;
  locale: LocaleCode;
  direction: TextDirection;
}

function CardEngraving() {
  return (
    <Svg aria-hidden height="100%" preserveAspectRatio="none" viewBox="0 0 400 252" width="100%">
      <Defs>
        <LinearGradient id="masroofi-card-metal" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={botanical.colors.forestRaised} />
          <Stop offset="1" stopColor={botanical.colors.forest} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#masroofi-card-metal)" height="252" width="400" />
      <G fill="none" opacity={0.22} stroke={botanical.colors.amber} strokeWidth={0.7}>
        {Array.from({ length: 9 }, (_, index) => (
          <Path
            d={`M${130 + index * 10} 270 C${340 + index * 3} ${175 - index * 5}, ${220 + index * 9} ${112 - index * 5}, 438 ${38 - index * 6}`}
            key={index}
          />
        ))}
      </G>
      <G fill="none" opacity={0.65} stroke={botanical.colors.amber} strokeWidth={0.8}>
        <Path d="M0 231H400M0 249H400" />
        {Array.from({ length: 20 }, (_, index) => (
          <G key={index}>
            <Path d={`M${index * 22 - 10} 240l10-7 10 7-10 7z`} />
            <Path
              d={`M${index * 22 - 5} 240l5-3 5 3-5 3z`}
              fill={botanical.colors.amber}
              stroke="none"
            />
          </G>
        ))}
      </G>
    </Svg>
  );
}

function GoldChip() {
  return (
    <Svg aria-hidden height={30} viewBox="0 0 50 36" width={42}>
      <Defs>
        <LinearGradient id="masroofi-chip-gold" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={botanical.colors.amberWash} />
          <Stop offset="0.5" stopColor={botanical.colors.amber} />
          <Stop offset="1" stopColor={colors.goldLight} />
        </LinearGradient>
      </Defs>
      <Rect
        fill="url(#masroofi-chip-gold)"
        height="35"
        rx="7"
        stroke={botanical.colors.amber}
        width="49"
        x="0.5"
        y="0.5"
      />
      <G fill="none" opacity={0.65} stroke={colors.earth} strokeWidth={0.75}>
        <Rect height="19" rx="4" width="21" x="14.5" y="8.5" />
        <Path d="M0 12h14M0 24h14M36 12h14M36 24h14M17 0v8M33 0v8M17 28v8M33 28v8" />
      </G>
    </Svg>
  );
}

function GhafSeal() {
  return (
    <Svg aria-hidden height={36} viewBox="0 0 48 48" width={36}>
      <G fill="none" stroke={botanical.colors.amber} strokeLinecap="round" strokeWidth={1.25}>
        <Path d="M24 38V19m0 10L14 19m10 6 10-9M16 39h16" />
        <Path d="M24 22C9 24 7 14 14 12c0-7 10-10 14-5 8-4 15 4 12 9 4 7-5 12-16 6Z" />
        <Path d="M18 15l6 7m8-9-8 9" />
      </G>
    </Svg>
  );
}

export function MasroofiCard({ holderName, locale, direction }: MasroofiCardProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardHeight = Math.max(
    184,
    Math.min(layout.compactContentWidth, width - layout.screenPadding * 2) / 1.586,
  );
  return (
    <View style={[styles.card, { minHeight: cardHeight }]} testID="masroofi-card">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <CardEngraving />
      </View>
      <View style={[styles.top, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.brand}>
          <Text brand color="white" direction={direction} language={locale} variant="screenTitle">
            {t('masroofi.title')}
          </Text>
        </View>
        <GhafSeal />
      </View>
      <View style={[styles.middle, { flexDirection: logicalRowDirection(direction) }]}>
        <GoldChip />
        <Text brand direction={direction} language={locale} style={styles.demo} variant="caption">
          {t('masroofi.demo')}
        </Text>
      </View>
      <View style={styles.holder}>
        <Text
          brand
          direction={direction}
          language={locale}
          style={styles.goldText}
          variant="caption"
        >
          {t('masroofi.holder')}
        </Text>
        <Text
          brand
          color="white"
          direction="auto"
          language={locale}
          style={styles.holderName}
          variant="control"
        >
          {holderName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: botanical.radius.surface,
    backgroundColor: botanical.colors.forest,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    justifyContent: 'space-between',
    boxShadow: botanical.shadow.floating,
  },
  top: { alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  brand: { flex: 1, minWidth: 0, gap: spacing.xxs },
  middle: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  demo: {
    color: botanical.colors.onForest,
    borderColor: botanical.colors.amber,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: botanical.radius.small,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    flexShrink: 1,
  },
  goldText: { color: botanical.colors.amberWash },
  holder: { gap: 0 },
  holderName: { flexShrink: 1 },
});
