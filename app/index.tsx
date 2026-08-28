import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function EntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="entry-screen">
      <View style={[styles.wordmark, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.brandSpecimen}>
          <View style={styles.brandStem} />
          <View style={[styles.brandLeaf, styles.brandLeafOne]} />
          <View style={[styles.brandLeaf, styles.brandLeafTwo]} />
        </View>
        <View style={[styles.wordmarkCopy, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <Text
            accessibilityRole="text"
            color="forest"
            direction="rtl"
            language="ar"
            variant="display"
          >
            {t('common.brand')}
          </Text>
          <Text color="ghaf" direction="ltr" language="en" variant="heading">
            {t('common.brandLatin')}
          </Text>
        </View>
        <Text color="earth" variant="caption">
          {t('common.prototype')}
        </Text>
      </View>

      <View
        accessibilityRole="image"
        accessibilityLabel={t('entry.landscape')}
        style={styles.landscape}
      >
        <Svg aria-hidden height="100%" viewBox="0 0 700 360" width="100%">
          <Rect fill={colors.sky} height="360" width="700" />
          <Circle cx="605" cy="72" fill={colors.goldLight} opacity="0.82" r="34" />
          <Path
            d="M0 238 C112 174 214 192 314 226 C414 260 520 184 700 207 L700 360 L0 360Z"
            fill={colors.sandLight}
          />
          <Path
            d="M0 286 C145 235 257 271 368 292 C482 313 567 248 700 261 L700 360 L0 360Z"
            fill={colors.sand}
          />
          <Path d="M0 309 H700 V360 H0Z" fill={colors.water} />
          <Path
            d="M28 329 C155 309 245 344 352 326 C467 307 559 338 677 316"
            fill="none"
            stroke={colors.waterLight}
            strokeLinecap="round"
            strokeWidth="6"
          />

          <G>
            <Path
              d="M273 304 C282 255 287 210 292 145 C305 199 314 251 326 304Z"
              fill={colors.earth}
            />
            <Path
              d="M298 211 C258 176 221 146 173 123 M303 197 C346 160 383 137 431 115"
              fill="none"
              stroke={colors.earth}
              strokeLinecap="round"
              strokeWidth="15"
            />
            <Path
              d="M286 299 C256 315 239 332 229 351 M310 299 C340 315 357 333 367 351"
              fill="none"
              stroke={colors.earth}
              strokeLinecap="round"
              strokeWidth="7"
            />
            <Ellipse cx="169" cy="125" fill={colors.ghaf} opacity="0.97" rx="100" ry="67" />
            <Ellipse cx="291" cy="84" fill={colors.leaf} opacity="0.96" rx="127" ry="74" />
            <Ellipse cx="431" cy="121" fill={colors.forestSoft} opacity="0.94" rx="105" ry="64" />
            <Ellipse cx="284" cy="151" fill={colors.mangrove} opacity="0.86" rx="96" ry="48" />
            <Circle cx="224" cy="75" fill={colors.goldLight} r="6" />
            <Circle cx="359" cy="77" fill={colors.waterLight} r="7" />
            <Circle cx="405" cy="130" fill={colors.leafLight} r="6" />
          </G>

          <G>
            <Path
              d="M571 321 C570 273 566 232 558 196"
              fill="none"
              stroke={colors.mangrove}
              strokeLinecap="round"
              strokeWidth="12"
            />
            <Path
              d="M568 276 C545 251 531 233 520 209 M566 257 C590 232 605 214 615 194"
              fill="none"
              stroke={colors.mangrove}
              strokeLinecap="round"
              strokeWidth="7"
            />
            <Path
              d="M519 207 C505 190 507 173 532 169 C544 187 538 201 519 207Z"
              fill={colors.ghaf}
            />
            <Path
              d="M615 193 C631 178 647 181 649 204 C632 214 619 207 615 193Z"
              fill={colors.ghaf}
            />
            <Path
              d="M570 318 C550 328 540 340 534 353 M574 318 C594 329 604 341 610 353"
              fill="none"
              stroke={colors.mangrove}
              strokeLinecap="round"
              strokeWidth="5"
            />
          </G>
        </Svg>
      </View>

      <View style={styles.heroCopy}>
        <Text color="forest" variant="title">
          {t('entry.title')}
        </Text>
        <Text color="inkMuted">{t('entry.body')}</Text>
        <View style={[styles.landscapeRecord, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <View style={styles.recordLine} />
          <Text color="earth" variant="caption">
            {t('entry.landscape')}
          </Text>
        </View>
      </View>

      <Button onPress={() => router.push('/role')} testID="enter-prototype-button">
        {t('entry.enter')}
      </Button>

      <View style={styles.languageSection}>
        <Text color="forest" variant="label">
          {t('language.title')}
        </Text>
        <LanguageSwitcher />
      </View>

      <View style={[styles.disclosure, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.disclosureMark} />
        <View style={styles.disclosureCopy}>
          <Text color="forest" variant="label">
            {t('origin.synthetic')} · {t('origin.prepared')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('entry.disclosure')}
          </Text>
          <Text color="earth" variant="caption">
            {t('entry.reloadWarning')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { justifyContent: 'center', paddingBottom: spacing.huge },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  wordmark: { alignItems: 'center', gap: spacing.sm },
  wordmarkCopy: { flex: 1, alignItems: 'baseline', gap: spacing.xs },
  brandSpecimen: {
    width: 50,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  brandStem: {
    position: 'absolute',
    bottom: 10,
    width: 4,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.earth,
  },
  brandLeaf: {
    position: 'absolute',
    width: 21,
    height: 12,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  brandLeafOne: { top: 16, start: 8, transform: [{ rotate: '26deg' }] },
  brandLeafTwo: { top: 28, end: 7, transform: [{ rotate: '-24deg' }] },
  landscape: {
    position: 'relative',
    height: 250,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.sky,
  },
  heroCopy: { gap: spacing.sm },
  landscapeRecord: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  recordLine: { width: 40, height: 1, backgroundColor: colors.gold },
  languageSection: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.lg,
  },
  disclosure: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.md,
  },
  disclosureMark: {
    width: 12,
    height: 18,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.mangrove,
  },
  disclosureCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
});
