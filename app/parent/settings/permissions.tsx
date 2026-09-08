import { useMemo } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section, R003Status } from '@/components/r003';
import { Text } from '@/components/primitives';
import { aiFeatureFlags } from '@/config/aiFeatureFlags';
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
  const liveChildAiGrants = usePrototypeStore(
    (state) => state.liveChildAiGrants[state.activeChildId],
  );
  const name = localize(child.displayName, locale);
  const liveVoiceEligible = (child.ageBand as string) === '12_14';

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

  const changeLiveChildAi = (capability: 'text' | 'voice', granted: boolean) => {
    router.push({
      pathname: '/parent/reauthenticate',
      params: {
        profileId: activeChildId,
        kind: capability === 'text' ? 'live_child_text' : 'live_child_voice',
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
      {aiFeatureFlags.ai_child_coach_text_live || aiFeatureFlags.ai_child_coach_voice_live ? (
        <R003Section testID="live-child-ai-permissions">
          <Text brand color="deepForest" direction={direction} variant="heading">
            {t('r003.permissions.liveAiTitle')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('r003.permissions.liveAiPurpose')}
          </Text>
          <Text brand color="tertiary" direction={direction} variant="caption">
            {t('r003.permissions.liveAiRisk')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('r003.permissions.liveAiProviderBlocked')}
          </Text>
          {aiFeatureFlags.ai_child_coach_text_live ? (
            <R003ActionRow
              body={t('r003.permissions.liveAiDeletion')}
              direction={direction}
              icon="sparkle"
              language={locale}
              meta={t(
                liveChildAiGrants.text.status === 'granted'
                  ? 'r003.permissions.enabled'
                  : 'r003.permissions.disabled',
              )}
              onPress={() => changeLiveChildAi('text', liveChildAiGrants.text.status !== 'granted')}
              testID="change-live-child-ai-text"
              title={t(
                liveChildAiGrants.text.status === 'granted'
                  ? 'r003.permissions.liveAiRevoke'
                  : 'r003.permissions.liveAiText',
              )}
            />
          ) : null}
          {aiFeatureFlags.ai_child_coach_voice_live && liveVoiceEligible ? (
            <R003ActionRow
              body={t('r003.permissions.liveAiDeletion')}
              direction={direction}
              icon="dialpad"
              language={locale}
              meta={t(
                liveChildAiGrants.voice.status === 'granted'
                  ? 'r003.permissions.enabled'
                  : 'r003.permissions.disabled',
              )}
              onPress={() =>
                changeLiveChildAi('voice', liveChildAiGrants.voice.status !== 'granted')
              }
              testID="change-live-child-ai-voice"
              title={t(
                liveChildAiGrants.voice.status === 'granted'
                  ? 'r003.permissions.liveAiRevoke'
                  : 'r003.permissions.liveAiVoice',
              )}
            />
          ) : aiFeatureFlags.ai_child_coach_voice_live ? (
            <R003Status
              direction={direction}
              language={locale}
              message={t('r003.permissions.liveAiVoiceIneligible')}
              tone="warning"
            />
          ) : null}
          <Text brand color="tertiary" direction={direction} variant="caption">
            {t('r003.permissions.syntheticImplementationOnly')}
          </Text>
        </R003Section>
      ) : null}
      <R003Status
        direction={direction}
        icon="info"
        language={locale}
        message={t('r003.permissions.body')}
      />
    </R002aScreen>
  );
}
