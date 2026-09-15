import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/primitives';
import { masroofiCardPalette as palette } from '@/design/masroofi';
import { botanical, layout, logicalRowDirection, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/prototype';

export interface MasroofiCardProps {
  holderName: string;
  locale: LocaleCode;
  direction: TextDirection;
}

function PearlSurface() {
  return (
    <Svg aria-hidden height="100%" preserveAspectRatio="none" viewBox="0 0 400 252" width="100%">
      <Defs>
        <LinearGradient id="masroofi-pearl" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={palette.pearl} />
          <Stop offset="0.56" stopColor={palette.pearl} />
          <Stop offset="1" stopColor={palette.sand} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#masroofi-pearl)" height="252" width="400" />
      <Path d="M84 0V252" opacity={0.5} stroke={palette.gold} strokeWidth={1} />
    </Svg>
  );
}

function WovenPanel() {
  return (
    <Svg
      aria-hidden
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 80 300"
      width="100%"
    >
      <Rect fill={palette.wovenRed} height="300" width="80" />
      <Rect fill={palette.wovenDeep} height="300" width="44" x="18" />
      <G fill="none" stroke={palette.wovenIvory} strokeWidth={1}>
        <Path d="M8 0V300M13 0V300M67 0V300M72 0V300" />
      </G>
      <G fill={palette.wovenInk}>
        <Rect height="300" width="4" x="2" />
        <Rect height="300" width="4" x="74" />
      </G>
      {Array.from({ length: 6 }, (_, index) => (
        <G key={index} transform={`translate(0 ${index * 56 - 18})`}>
          <Path
            d="M40 4h5v5h5v5h5v5h5v10h-5v5h-5v5h-5v5H35v-5h-5v-5h-5v-5h-5V19h5v-5h5V9h5V4Z"
            fill={palette.wovenIvory}
          />
          <Path d="M40 12l12 12-12 12-12-12Z" fill={palette.wovenRed} />
          <Path d="M40 18l6 6-6 6-6-6Z" fill={palette.wovenInk} />
          <Path
            d="M17 46l6 6 6-6 6 6 6-6 6 6 6-6 6 6 5-6"
            fill="none"
            stroke={palette.gold}
            strokeWidth={1}
          />
          <Path
            d="M8 0l5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5M72 0l-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5"
            fill="none"
            stroke={palette.wovenIvory}
            strokeWidth={0.8}
          />
        </G>
      ))}
    </Svg>
  );
}

function GoldChip() {
  return (
    <Svg aria-hidden height={30} viewBox="0 0 50 36" width={42}>
      <Defs>
        <LinearGradient id="masroofi-chip-gold" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={palette.goldLight} />
          <Stop offset="0.48" stopColor={palette.gold} />
          <Stop offset="0.72" stopColor={palette.goldLight} />
          <Stop offset="1" stopColor={palette.gold} />
        </LinearGradient>
      </Defs>
      <Rect
        fill="url(#masroofi-chip-gold)"
        height="35"
        rx="6"
        stroke={palette.engraving}
        strokeWidth={0.75}
        width="49"
        x="0.5"
        y="0.5"
      />
      <G fill="none" opacity={0.75} stroke={palette.goldShadow} strokeWidth={0.65}>
        <Rect height="19" rx="4" width="21" x="14.5" y="8.5" />
        <Path d="M0 12h14M0 24h14M36 12h14M36 24h14M17 0v8M33 0v8M17 28v8M33 28v8" />
      </G>
    </Svg>
  );
}

function EmiratesFlag() {
  return (
    <Svg aria-hidden height={18} viewBox="0 0 36 18" width={36}>
      <Rect fill={palette.flagGreen} height="6" width="27" x="9" />
      <Rect fill={palette.flagWhite} height="6" width="27" x="9" y="6" />
      <Rect fill={palette.flagBlack} height="6" width="27" x="9" y="12" />
      <Rect fill={palette.flagRed} height="18" width="9" />
    </Svg>
  );
}

function EmiratesEngraving() {
  return (
    <Svg
      aria-hidden
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 148 64"
      width="100%"
    >
      <G
        fill="none"
        stroke={palette.engraving}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.8}
      >
        <Path d="M16 45V13h31v32M13 13h37M14 17h35M17 9v4M24 8v5M39 8v5M46 9v4" />
        <Path d="M20 21h9v18h-9zM34 21h9v18h-9zM20 21l9 18m5-18 9 18M15 42h33M12 45h40v8H12z" />
        <Path d="M52 52V36h23v16M55 36v-3h4v3h6v-3h4v3h6M59 52v-9h9v9" />
        <Path d="M89 50V29h5V18h4V8h2V2m0 6h2v10h4v11h5v21M95 31v19M101 22v28M106 35v15" />
        <Path d="M116 49V27h11v22M118 30h7m-7 5h7m-7 5h7M131 48V36h9v12" />
      </G>
      <G fill="none" stroke={palette.engraving} strokeWidth={0.65}>
        <Path d="M0 53c24 3 27 5 45 2 26-5 49-12 103-5" />
        <Path d="M1 58c20-1 32 4 48 0 30-7 58-7 99-3" opacity={0.65} />
        <Path d="M17 62c38 4 74-8 131-3" opacity={0.4} />
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
        <PearlSurface />
      </View>
      <View pointerEvents="none" style={styles.wovenPanel}>
        <WovenPanel />
      </View>
      <View style={[styles.top, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          brand
          direction={direction}
          language={locale}
          style={styles.title}
          variant="screenTitle"
        >
          {t('masroofi.title')}
        </Text>
        <View pointerEvents="none" style={styles.flag}>
          <EmiratesFlag />
        </View>
      </View>
      <View style={styles.artRow}>
        <GoldChip />
        <View pointerEvents="none" style={styles.engraving}>
          <EmiratesEngraving />
        </View>
      </View>
      <View style={styles.holder}>
        <View style={[styles.holderMeta, { flexDirection: logicalRowDirection(direction) }]}>
          <Text
            brand
            direction={direction}
            language={locale}
            style={styles.holderLabel}
            variant="caption"
          >
            {t('masroofi.holder')}
          </Text>
          <Text
            brand
            direction={direction}
            language={locale}
            style={styles.holderLabel}
            variant="caption"
          >
            {t('masroofi.emirates')}
          </Text>
        </View>
        <Text brand direction="auto" language={locale} style={styles.holderName} variant="control">
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
    // Native Yoga fixes the physical artwork direction; web already uses physical left/right.
    ...(Platform.OS === 'web' ? {} : { direction: 'ltr' as const }),
    borderRadius: botanical.radius.control,
    backgroundColor: palette.pearl,
    paddingLeft: '25%',
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    justifyContent: 'space-between',
    boxShadow: botanical.shadow.floating,
  },
  wovenPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '20%',
    overflow: 'hidden',
  },
  top: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  title: { color: palette.ink, flex: 1, minWidth: 0 },
  flag: { flexShrink: 0 },
  artRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  engraving: { flex: 1, minWidth: 0, height: 56 },
  holder: { gap: 0 },
  holderMeta: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  holderLabel: { color: palette.mutedInk },
  holderName: { color: palette.ink, flexShrink: 1 },
});
