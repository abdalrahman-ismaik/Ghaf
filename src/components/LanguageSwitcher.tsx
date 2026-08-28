import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale } from '@/i18n';
import type { LocaleCode } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface LanguageSwitcherProps {
  compact?: boolean;
  showGuidance?: boolean;
  testID?: string;
}

const localeOptions: readonly LocaleCode[] = ['ar', 'en'];

export function LanguageSwitcher({
  compact = false,
  showGuidance = true,
  testID = 'language-switcher',
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [focusedLocale, setFocusedLocale] = useState<LocaleCode | null>(null);
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const setLocale = usePrototypeStore((state) => state.setLocale);

  const chooseLocale = (nextLocale: LocaleCode) => {
    if (nextLocale === locale) return;

    setLocale(nextLocale);
    void configureNativeDirection(nextLocale);
    void setI18nLocale(nextLocale);
  };

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
                color={isSelected ? 'white' : 'forest'}
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
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  compactSegment: {
    width: 'auto',
    borderRadius: radii.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
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
    borderColor: colors.transparent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactOption: {
    flex: 0,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.ghaf,
  },
  optionFocused: {
    borderColor: colors.gold,
  },
  selectedMark: {
    width: spacing.lg,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.goldLight,
  },
  markSpacer: {
    width: spacing.lg,
    height: 2,
    backgroundColor: colors.transparent,
  },
  pressed: {
    opacity: 0.76,
  },
  guidance: {
    paddingHorizontal: spacing.sm,
  },
});
