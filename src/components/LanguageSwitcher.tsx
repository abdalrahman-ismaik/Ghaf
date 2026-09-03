import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access/GhafIcon';
import { Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale } from '@/i18n';
import type { LocaleCode } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export type LanguageSwitcherVariant = 'segmented' | 'utility';

export interface LanguageSwitcherProps {
  compact?: boolean;
  onLocaleChange?: (locale: LocaleCode) => void;
  showGuidance?: boolean;
  testID?: string;
  variant?: LanguageSwitcherVariant;
}

const localeOptions: readonly LocaleCode[] = ['ar', 'en'];

export function LanguageSwitcher({
  compact = false,
  onLocaleChange,
  showGuidance = true,
  testID = 'language-switcher',
  variant = 'segmented',
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [focusedLocale, setFocusedLocale] = useState<LocaleCode | null>(null);
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const setLocale = usePrototypeStore((state) => state.setLocale);

  const chooseLocale = (nextLocale: LocaleCode) => {
    if (nextLocale === locale) return;

    setLocale(nextLocale);
    onLocaleChange?.(nextLocale);
    void configureNativeDirection(nextLocale);
    void setI18nLocale(nextLocale);
  };

  if (variant === 'utility') {
    const nextLocale: LocaleCode = locale === 'ar' ? 'en' : 'ar';
    const label = nextLocale === 'ar' ? t('language.arabic') : t('language.english');

    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => chooseLocale(nextLocale)}
        style={({ pressed }) => [
          styles.utility,
          direction === 'rtl' ? styles.utilityRtl : null,
          pressed ? styles.pressed : null,
        ]}
        testID={testID}
      >
        <GhafIcon color={colors.ghafEmerald} name="language" size={22} />
        <Text
          color="ghafEmerald"
          direction={nextLocale === 'ar' ? 'rtl' : 'ltr'}
          language={nextLocale}
          variant="label"
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, compact ? styles.compactWrapper : null]} testID={testID}>
      <View
        accessibilityLabel={t('language.title')}
        accessibilityRole="radiogroup"
        style={[
          styles.segment,
          compact ? styles.compactSegment : null,
          direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
        ]}
      >
        {localeOptions.map((option) => {
          const isSelected = option === locale;
          const label = option === 'ar' ? t('language.arabic') : t('language.english');

          return (
            <Pressable
              aria-checked={isSelected}
              accessibilityLabel={label}
              accessibilityRole="radio"
              key={option}
              onBlur={() => setFocusedLocale(null)}
              onFocus={() => setFocusedLocale(option)}
              onPress={() => chooseLocale(option)}
              style={({ pressed }) => [
                styles.option,
                compact ? styles.compactOption : null,
                isSelected ? styles.optionSelected : null,
                focusedLocale === option ? styles.optionFocused : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`language-${option}`}
            >
              <Text
                align="center"
                color={isSelected ? 'ghafEmerald' : 'onSurfaceVariant'}
                direction={option === 'ar' ? 'rtl' : 'ltr'}
                language={option}
                variant={compact ? 'caption' : 'label'}
              >
                {label}
              </Text>
              <View aria-hidden style={isSelected ? styles.selectedMark : styles.markSpacer} />
            </Pressable>
          );
        })}
      </View>

      {showGuidance ? (
        <Text align="center" color="inkMuted" style={styles.guidance} variant="caption">
          {t('language.preserved')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.xs,
  },
  compactWrapper: {
    width: 'auto',
  },
  segment: {
    width: '100%',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.transparent,
  },
  compactSegment: {
    width: 'auto',
    borderRadius: radii.sm,
  },
  rowRtl: {
    flexDirection: 'row',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    minHeight: layout.touchTarget,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactOption: {
    flex: 0,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.leafMist,
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
  },
  optionFocused: {
    borderColor: colors.gold,
  },
  selectedMark: {
    width: spacing.lg,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  markSpacer: {
    width: spacing.lg,
    height: 2,
    backgroundColor: colors.transparent,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  guidance: {
    paddingHorizontal: spacing.sm,
  },
  utility: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  utilityRtl: {
    flexDirection: 'row-reverse',
  },
});
