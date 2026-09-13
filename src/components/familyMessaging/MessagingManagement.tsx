import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Input } from '@/components/primitives';
import type {
  FamilyMessagingController,
  MessagingState,
} from '@/features/familyMessaging/controller';
import type { MessagingAgeBand } from '@/features/familyMessaging';
import { MessageButton, MessageText, styles } from './shared';
import { MessagingPeerPermissions } from './MessagingPeerPermissions';

export function MessagingManagement({
  controller,
  state,
}: {
  controller: FamilyMessagingController;
  state: MessagingState;
}) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<MessagingAgeBand>('6_8');
  const [confirmation, setConfirmation] = useState<{
    type: 'revoke' | 'revokeAccount';
    id?: string;
  } | null>(null);
  useEffect(() => {
    void controller.manage('load');
  }, [controller]);
  return (
    <View style={styles.group} testID="messaging-management">
      <MessageText accessibilityRole="header" variant="heading">
        {t('messaging.manage')}
      </MessageText>
      {state.invitation ? (
        <View style={styles.notice}>
          <MessageText variant="label">
            {t('messaging.inviteTitle', { name: state.invitation.childName })}
          </MessageText>
          <MessageText>{t('messaging.inviteBody')}</MessageText>
          <MessageText selectable direction="ltr" variant="heading" style={styles.code}>
            {state.invitation.code}
          </MessageText>
          <MessageText variant="caption">
            {t('messaging.expires', {
              time: new Date(state.invitation.expiresAt).toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </MessageText>
          <MessageButton variant="secondary" onPress={() => controller.dismissInvitation()}>
            {t('messaging.hideCode')}
          </MessageButton>
        </View>
      ) : null}
      {state.children
        .filter((child) => child.active)
        .map((child) => (
          <View key={child.id} style={styles.recipient}>
            <MessageText variant="label" direction="auto">
              {child.displayName}
            </MessageText>
            <MessageText variant="caption">{t(`messaging.band${child.ageBand}`)}</MessageText>
            <MessageButton
              variant="secondary"
              disabled={state.busy}
              onPress={() => void controller.manage('invite', { id: child.id })}
            >
              {t('messaging.invite', { name: child.displayName })}
            </MessageButton>
          </View>
        ))}
      <View style={styles.section}>
        <Input
          brand
          label={t('messaging.childName')}
          maxLength={60}
          value={name}
          onChangeText={setName}
          editable={!state.busy}
        />
        <MessageText variant="label">{t('messaging.ageBand')}</MessageText>
        {(['6_8', '9_11', '12_14'] as const).map((band) => (
          <MessageButton
            key={band}
            variant={band === ageBand ? 'primary' : 'secondary'}
            accessibilityState={{ selected: ageBand === band }}
            disabled={state.busy}
            onPress={() => setAgeBand(band)}
          >
            {t(`messaging.band${band}`)}
          </MessageButton>
        ))}
        <MessageButton
          disabled={!name.trim()}
          busy={state.busy}
          busyLabel={t('messaging.working')}
          onPress={() => void controller.manage('create', { name: name.trim(), ageBand })}
        >
          {t('messaging.addChild')}
        </MessageButton>
      </View>
      <MessagingPeerPermissions controller={controller} state={state} />
      <View style={styles.section}>
        <MessageText accessibilityRole="header" variant="heading">
          {t('messaging.devices')}
        </MessageText>
        {state.devices
          .filter((device) => device.active)
          .map((device) => (
            <View key={device.id} style={styles.recipient}>
              <MessageText variant="label" direction="auto">
                {device.personName}
              </MessageText>
              <MessageText direction="auto">{device.label}</MessageText>
              {device.current ? (
                <MessageText variant="caption">{t('messaging.currentDevice')}</MessageText>
              ) : null}
              <MessageButton
                variant="secondary"
                disabled={state.busy}
                onPress={() => setConfirmation({ type: 'revoke', id: device.id })}
              >
                {t('messaging.revoke', { name: device.label })}
              </MessageButton>
            </View>
          ))}
        <MessageButton
          variant="quiet"
          disabled={state.busy}
          onPress={() => setConfirmation({ type: 'revokeAccount' })}
        >
          {t('messaging.revokeAccount')}
        </MessageButton>
      </View>
      {confirmation ? (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <MessageText>
            {t(
              confirmation.type === 'revokeAccount'
                ? 'messaging.revokeAccountBody'
                : 'messaging.revokeBody',
            )}
          </MessageText>
          <MessageButton
            busy={state.busy}
            busyLabel={t('messaging.working')}
            onPress={() => {
              void controller.manage(confirmation.type, { id: confirmation.id });
              setConfirmation(null);
            }}
          >
            {t('messaging.confirmRevoke')}
          </MessageButton>
          <MessageButton variant="secondary" onPress={() => setConfirmation(null)}>
            {t('messaging.cancel')}
          </MessageButton>
        </View>
      ) : null}
    </View>
  );
}
