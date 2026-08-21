import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale } from '@/i18n';
import type { LocaleCode } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface LanguageSwitcherProps {
  compact?: boolean;
  showGuidance?: boolean;
}

const localeOptions: readonly LocaleCode[] = ['ar', 'en'];

export function LanguageSwitcher({ compact = false, showGuidance = true }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const setLocale = usePrototypeStore((state) => state.setLocale);

  const chooseLocale = (nextLocale: LocaleCode) => {
    if (nextLocale === locale) {
      return;
    }

    configureNativeDirection(nextLocale);
    setLocale(nextLocale);
    void setI18nLocale(nextLocale);
  };

  return (
    <View style={[styles.wrapper, compact ? styles.compactWrapper : null]}>
      <View
        accessibilityLabel={t('entry.languageTitle')}
        accessibilityRole="radiogroup"
        style={[styles.segment, compact ? styles.compactSegment : null]}
      >
        {localeOptions.map((option) => {
          const isSelected = option === locale;
          const label = option === 'ar' ? t('language.arabic') : t('language.english');

          return (
            <Pressable
              accessibilityLabel={label}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={option}
              onPress={() => chooseLocale(option)}
              style={({ pressed }) => [
                styles.option,
                compact ? styles.compactOption : null,
                isSelected ? styles.optionSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                align="center"
                color={isSelected ? 'white' : 'forest'}
                variant={compact ? 'caption' : 'label'}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showGuidance ? (
        <Text align="center" color="inkMuted" style={styles.guidance} variant="caption">
          {t('language.restartGuidance')}
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
    flexDirection: 'row',
    width: '100%',
    padding: 4,
    gap: 4,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  compactSegment: {
    width: 'auto',
    borderRadius: radii.pill,
  },
  option: {
    flex: 1,
    minHeight: 44,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactOption: {
    flex: 0,
    minWidth: 64,
    minHeight: 38,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.ghaf,
  },
  pressed: {
    opacity: 0.75,
  },
  guidance: {
    paddingHorizontal: spacing.sm,
  },
});
