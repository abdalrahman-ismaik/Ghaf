import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessFooter,
  AccessHeader,
  AccessScreen,
  GhafIcon,
  SegmentedControl,
} from '@/components/access';
import { Button, Input, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import type { LocaleCode } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function FamilyBasicsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const parentAccess = usePrototypeStore((state) => state.parentAccess);
  const draft = usePrototypeStore((state) => state.parentOnboardingDraft);
  const updateDraft = usePrototypeStore((state) => state.updateParentOnboardingDraft);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const [name, setName] = useState(draft.familyName);
  const [error, setError] = useState<string | null>(null);

  if (!['verified', 'authenticated_parent'].includes(parentAccess.state)) {
    return <Redirect href="/access/parent/sign-in" />;
  }

  const chooseLanguage = (value: string) => {
    const appLanguage: LocaleCode = value === 'en' ? 'en' : 'ar';
    updateDraft({ appLanguage });
    setLocale(appLanguage);
  };

  const continueSetup = () => {
    const normalized = name.trim();
    if (normalized.length < 2) {
      setError(t('access.setup.familyNameError'));
      return;
    }
    updateDraft({ familyName: normalized });
    router.push('/access/parent/add-first-child');
  };

  return (
    <AccessScreen
      background="organic"
      footer={
        <AccessFooter originLabel={t('access.setup.origin')}>
          <Button onPress={continueSetup} testID="family-basics-continue-button">
            {t('access.setup.continue')}
          </Button>
        </AccessFooter>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          onBack={() => router.replace('/access/parent/verification')}
          step={1}
          title={t('common.brand')}
          totalSteps={3}
        />
      }
      keyboardAware
      testID="family-basics-screen"
    >
      <View style={styles.heading}>
        <Text color="forest" variant="title">
          {t('access.setup.familyTitle')}
        </Text>
        <Text color="inkMuted">{t('access.setup.familyBody')}</Text>
      </View>

      <View style={styles.form}>
        <Input
          autoCapitalize="words"
          direction="auto"
          errorText={error ?? undefined}
          label={t('access.setup.familyNameLabel')}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          onSubmitEditing={continueSetup}
          maxLength={60}
          placeholder={t('access.setup.familyNamePlaceholder')}
          returnKeyType="done"
          testID="family-name-input"
          value={name}
        />
        <View style={styles.privacyNote}>
          <GhafIcon color={colors.inkMuted} name="lock" size={18} />
          <Text color="inkMuted" style={styles.privacyCopy} variant="caption">
            {t('access.setup.familyPrivacy')}
          </Text>
        </View>
      </View>

      <View style={styles.languageField}>
        <Text variant="label">{t('access.setup.appLanguage')}</Text>
        <SegmentedControl
          accessibilityLabel={t('access.setup.appLanguage')}
          onChange={chooseLanguage}
          options={[
            { label: t('language.arabic'), value: 'ar' },
            { label: t('language.english'), value: 'en' },
          ]}
          value={draft.appLanguage}
        />
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.sm,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  privacyCopy: {
    flex: 1,
    minWidth: 0,
  },
  languageField: {
    gap: spacing.sm,
  },
});
