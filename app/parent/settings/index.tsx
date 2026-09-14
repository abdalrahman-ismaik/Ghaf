import { useState } from 'react';
import { useNavigationContainerRef, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PrimaryButton, QuietButton } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section, R003Status } from '@/components/r003';
import { AmbientSoundSetting } from '@/components/settings/AmbientSoundSetting';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { prepareEntryReset } from '@/utils/navigation';
import { entryMode } from '@/config/demoEntry';

export default function ParentSettingsScreen() {
  const router = useRouter();
  const navigation = useNavigationContainerRef();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const resetPrototype = usePrototypeStore((state) => state.resetPrototype);
  const signOutExperience = usePrototypeStore((state) => state.signOutExperience);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    const resetNavigation = prepareEntryReset(navigation);
    if (!resetNavigation) {
      setError(t('errors.safeRetry'));
      return;
    }
    const result = resetPrototype();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    resetNavigation();
  };

  const signOut = () => {
    setError(null);
    const resetNavigation = entryMode === 'demo' ? prepareEntryReset(navigation) : null;
    if (entryMode === 'demo' && !resetNavigation) {
      setError(t('errors.safeRetry'));
      return;
    }
    const result = signOutExperience();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    if (resetNavigation) resetNavigation();
    else router.replace('/');
  };

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/parent')}
          title={t('r003.settings.title')}
        />
      }
      testID="parent-settings-screen"
    >
      <R003Hero
        body={t('r003.settings.body')}
        direction={direction}
        icon="settings"
        language={locale}
        title={t('r003.settings.title')}
      />
      <R003Section title={t('r003.settings.languageTitle')}>
        <LanguageSwitcher compact showGuidance={false} />
      </R003Section>
      <R003Section title={t('r003.settings.ambientAudio.sectionTitle')}>
        <AmbientSoundSetting />
      </R003Section>
      <R003Section>
        <R003ActionRow
          body={t('familyConnectionEdit.body')}
          direction={direction}
          icon="family"
          language={locale}
          onPress={() => router.push('/parent/family/connections' as Href)}
          testID="open-family-connections"
          title={t('familyConnectionEdit.title')}
        />
        <R003ActionRow
          body={t('r003.settings.permissionsBody')}
          direction={direction}
          icon="shield"
          language={locale}
          onPress={() => router.push('/parent/settings/permissions' as Href)}
          testID="open-parent-permissions"
          title={t('r003.settings.permissionsTitle')}
        />
        <R003ActionRow
          body={t('r003.settings.devicesBody')}
          direction={direction}
          icon="dialpad"
          language={locale}
          onPress={() => router.push('/parent/settings/devices' as Href)}
          testID="open-parent-devices"
          title={t('r003.settings.devicesTitle')}
        />
      </R003Section>
      <R003Section>
        {confirmReset ? (
          <>
            <R003Status
              direction={direction}
              language={locale}
              message={t('reset.body')}
              tone="warning"
            />
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={reset}
              testID="confirm-reset-button"
            >
              {t('reset.confirm')}
            </PrimaryButton>
            <QuietButton
              brand
              direction={direction}
              language={locale}
              onPress={() => setConfirmReset(false)}
              testID="cancel-reset-button"
            >
              {t('common.cancel')}
            </QuietButton>
          </>
        ) : (
          <R003ActionRow
            direction={direction}
            icon="leaf"
            language={locale}
            onPress={() => setConfirmReset(true)}
            testID="reset-demo-button"
            title={t('r003.settings.resetTitle')}
          />
        )}
        <R003ActionRow
          body={t('r003.settings.signOutBody')}
          direction={direction}
          icon="lock"
          language={locale}
          onPress={signOut}
          testID="parent-sign-out"
          title={t('r003.settings.signOut')}
        />
        {error ? (
          <R003Status direction={direction} language={locale} message={error} tone="warning" />
        ) : null}
      </R003Section>
    </R002aScreen>
  );
}
