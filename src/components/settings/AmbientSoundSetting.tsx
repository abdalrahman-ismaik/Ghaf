import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { R003Status } from '@/components/r003';
import { colors, layout, logicalRowDirection, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function AmbientSoundSetting() {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const preference = usePrototypeStore((state) => state.ambientAudioPreference);
  const setAmbientSoundEnabled = usePrototypeStore((state) => state.setAmbientSoundEnabled);
  const [error, setError] = useState<string | null>(null);

  const updatePreference = (enabled: boolean) => {
    const result = setAmbientSoundEnabled(enabled);
    setError(result.ok ? null : t('r003.settings.ambientAudio.saveError'));
  };

  return (
    <>
      <View style={[styles.row, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.copy}>
          <Text brand color="deepForest" direction={direction} language={locale} variant="label">
            {t('r003.settings.ambientAudio.title')}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant="caption"
          >
            {t('r003.settings.ambientAudio.body')}
          </Text>
        </View>
        <Switch
          accessibilityHint={t('r003.settings.ambientAudio.hint')}
          accessibilityLabel={t('r003.settings.ambientAudio.title')}
          accessibilityRole="switch"
          accessibilityState={{ checked: preference.enabled }}
          ios_backgroundColor={colors.outlineVariant}
          onValueChange={updatePreference}
          thumbColor={colors.white}
          trackColor={{ false: colors.outlineVariant, true: colors.mangroveTeal }}
          value={preference.enabled}
          testID="ambient-sound-switch"
        />
      </View>
      {error ? (
        <R003Status direction={direction} language={locale} message={error} tone="warning" />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
});
