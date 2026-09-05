import { useMemo } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section, R003Status } from '@/components/r003';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const PERMISSIONS = [
  { kind: 'voice', key: 'voiceGranted', icon: 'dialpad' },
  { kind: 'media', key: 'mediaGranted', icon: 'media-off' },
  { kind: 'ai', key: 'aiGranted', icon: 'sparkle' },
] as const;

export default function ParentPermissionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const child = usePrototypeStore((state) => state.children[state.activeChildId]);
  const getGrant = usePrototypeStore((state) => state.getChildPermissionGrant);
  const grant = useMemo(() => getGrant(activeChildId), [activeChildId, getGrant]);
  const name = localize(child.displayName, locale);

  const change = (kind: 'voice' | 'media' | 'ai', granted: boolean) => {
    router.push({
      pathname: '/parent/reauthenticate',
      params: {
        profileId: activeChildId,
        kind,
        granted: granted ? 'true' : 'false',
        returnTo: '/parent/settings/permissions',
      },
    } as unknown as Href);
  };

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/parent/settings' as Href)}
          title={t('r003.permissions.title', { name })}
        />
      }
      testID="parent-permissions-screen"
    >
      <R003Hero
        body={t('r003.permissions.body')}
        direction={direction}
        icon="shield"
        language={locale}
        title={t('r003.permissions.title', { name })}
      />
      {grant.ok ? (
        <R003Section>
          {PERMISSIONS.map((permission) => {
            const enabled = grant.data[permission.key];
            const label = t(`r003.permissions.${permission.kind}`);
            return (
              <R003ActionRow
                body={t('r003.permissions.reauth')}
                direction={direction}
                icon={permission.icon}
                key={permission.kind}
                language={locale}
                meta={t(enabled ? 'r003.permissions.enabled' : 'r003.permissions.disabled')}
                onPress={() => change(permission.kind, !enabled)}
                testID={`change-permission-${permission.kind}`}
                title={t('r003.permissions.change', { permission: label })}
              />
            );
          })}
        </R003Section>
      ) : (
        <R003Status
          direction={direction}
          language={locale}
          message={t('r003.permissions.unavailable')}
          tone="warning"
        />
      )}
      <R003Status
        direction={direction}
        icon="info"
        language={locale}
        message={t('r003.permissions.body')}
      />
    </R002aScreen>
  );
}
