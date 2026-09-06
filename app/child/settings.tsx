import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section, R003Status } from '@/components/r003';
import { localize } from '@/i18n';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

const PERMISSIONS = [
  { key: 'voiceGranted', label: 'r003.permissions.voice', icon: 'dialpad' },
  { key: 'mediaGranted', label: 'r003.permissions.media', icon: 'media-off' },
  { key: 'aiGranted', label: 'r003.permissions.ai', icon: 'sparkle' },
] as const;

export default function ChildSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const canEnter = usePrototypeStore(selectCanEnterChildExperience);
  const child = usePrototypeStore((state) => state.children[state.activeChildId]);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const getGrant = usePrototypeStore((state) => state.getOwnChildPermissionGrant);
  const signOutExperience = usePrototypeStore((state) => state.signOutExperience);
  const [error, setError] = useState<string | null>(null);
  const grant = getGrant();

  if (!canEnter) return <Redirect href="/" />;
  const name =
    localFamily.record?.children.find((profile) => profile.id === child.id)?.nickname ??
    localize(child.displayName, locale);

  const signOut = () => {
    setError(null);
    const result = signOutExperience();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    router.replace('/');
  };

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/child')}
          title={t('r003.childSettings.title')}
        />
      }
      testID="child-settings-screen"
    >
      <R003Hero
        body={t('r003.childSettings.body')}
        direction={direction}
        icon="settings"
        language={locale}
        title={`${t('r003.childSettings.title')} · ${name}`}
      />
      <R003Section title={t('r003.childSettings.ownPermissions')}>
        {grant.ok ? (
          PERMISSIONS.map((permission) => (
            <R003ActionRow
              direction={direction}
              disabled
              icon={permission.icon}
              key={permission.key}
              language={locale}
              meta={t(
                grant.data[permission.key]
                  ? 'r003.permissions.enabled'
                  : 'r003.permissions.disabled',
              )}
              title={t(permission.label)}
            />
          ))
        ) : (
          <R003Status
            direction={direction}
            language={locale}
            message={t('r003.permissions.unavailable')}
            tone="warning"
          />
        )}
      </R003Section>
      <R003Status
        direction={direction}
        icon="person"
        language={locale}
        message={t('r003.childSettings.askParent')}
      />
      <R003Section title={t('r003.settings.languageTitle')}>
        <LanguageSwitcher compact showGuidance={false} />
      </R003Section>
      <R003ActionRow
        direction={direction}
        icon="lock"
        language={locale}
        onPress={signOut}
        testID="child-sign-out"
        title={t('r003.childSettings.signOut')}
      />
      {error ? (
        <R003Status direction={direction} language={locale} message={error} tone="warning" />
      ) : null}
    </R002aScreen>
  );
}
