import { useState } from 'react';
import { Redirect, useNavigationContainerRef, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BotanicalAvatar } from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Section, R003Status } from '@/components/r003';
import { AmbientSoundSetting } from '@/components/settings/AmbientSoundSetting';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';
import { entryMode } from '@/config/demoEntry';
import { prepareEntryReset } from '@/utils/navigation';

const PERMISSIONS = [
  { key: 'voiceGranted', label: 'r003.permissions.voice', icon: 'dialpad' },
  { key: 'mediaGranted', label: 'r003.permissions.media', icon: 'media-off' },
  { key: 'aiGranted', label: 'r003.permissions.ai', icon: 'sparkle' },
] as const;

export default function ChildSettingsScreen() {
  const router = useRouter();
  const navigation = useNavigationContainerRef();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const canEnter = usePrototypeStore(selectCanEnterChildExperience);
  const child = usePrototypeStore((state) => state.children[state.activeChildId]);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const getGrant = usePrototypeStore((state) => state.getOwnChildPermissionGrant);
  const beginTemporaryParentAccess = usePrototypeStore((state) => state.beginTemporaryParentAccess);
  const [error, setError] = useState<string | null>(null);
  const grant = getGrant();

  if (!canEnter) return <Redirect href="/" />;
  const name =
    localFamily.record?.children.find((profile) => profile.id === child.id)?.nickname ??
    localize(child.displayName, locale);

  const openParentAccess = () => {
    setError(null);
    const resetNavigation = entryMode === 'demo' ? prepareEntryReset(navigation) : null;
    if (entryMode === 'demo' && !resetNavigation) {
      setError(t('errors.safeRetry'));
      return;
    }
    const result = beginTemporaryParentAccess();
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
          onBack={() => router.replace('/child')}
          title={t('r003.childSettings.title')}
        />
      }
      testID="child-settings-screen"
    >
      <View style={[styles.profile, { flexDirection: logicalRowDirection(direction) }]}>
        <BotanicalAvatar
          direction={direction}
          id={
            localFamily.record?.children.find((profile) => profile.id === child.id)?.avatarId ??
            'ghaf_tree'
          }
          size={72}
        />
        <View style={styles.profileCopy}>
          <Text brand direction={direction} language={locale} variant="screenTitle">
            {name}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} language={locale}>
            {t('r003.childSettings.body')}
          </Text>
        </View>
      </View>
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
      <R003Section title={t('r003.settings.ambientAudio.sectionTitle')}>
        <AmbientSoundSetting />
      </R003Section>
      <R003ActionRow
        body={t('r003.childSettings.parentAccessBody')}
        direction={direction}
        icon="lock"
        language={locale}
        onPress={openParentAccess}
        testID="child-parent-access"
        title={t('r003.childSettings.parentAccess')}
      />
      {error ? (
        <R003Status direction={direction} language={locale} message={error} tone="warning" />
      ) : null}
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  profile: {
    minWidth: 0,
    alignItems: 'center',
    gap: botanical.space.row,
    paddingVertical: botanical.space.small,
    paddingBottom: botanical.space.section,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
  },
  profileCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
});
