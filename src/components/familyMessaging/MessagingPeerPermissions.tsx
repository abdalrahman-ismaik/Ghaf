import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type {
  FamilyMessagingController,
  MessagingState,
} from '@/features/familyMessaging/controller';
import { MessageButton, MessageText, styles } from './shared';

export function MessagingPeerPermissions({
  controller,
  state,
}: {
  controller: FamilyMessagingController;
  state: MessagingState;
}) {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState<{
    firstChildId: string;
    secondChildId: string;
    enabled: boolean;
  } | null>(null);
  return (
    <View style={styles.section} testID="messaging-peer-permissions">
      <MessageText accessibilityRole="header" variant="heading">
        {t('peerMessaging.title')}
      </MessageText>
      <MessageText>{t('peerMessaging.boundary')}</MessageText>
      {state.peerError ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <MessageText>{t('peerMessaging.unavailable')}</MessageText>
          <MessageButton
            variant="secondary"
            disabled={state.busy}
            onPress={() => void controller.loadPeerPermissions()}
          >
            {t('peerMessaging.retry')}
          </MessageButton>
        </View>
      ) : !state.peerPermissions.length ? (
        <MessageText>{t('peerMessaging.empty')}</MessageText>
      ) : null}
      {state.peerPermissions.map((pair) => (
        <View style={styles.recipient} key={`${pair.firstChildId}:${pair.secondChildId}`}>
          <MessageText variant="label" direction="auto">
            {t('peerMessaging.pair', { first: pair.firstName, second: pair.secondName })}
          </MessageText>
          <MessageText>
            {t(pair.enabled ? 'peerMessaging.enabled' : 'peerMessaging.disabled')}
          </MessageText>
          {!pair.available && !pair.enabled ? (
            <MessageText variant="caption">{t('peerMessaging.enrollFirst')}</MessageText>
          ) : null}
          <MessageButton
            variant="secondary"
            disabled={state.busy || (!pair.enabled && !pair.available)}
            onPress={() =>
              setConfirmation({
                firstChildId: pair.firstChildId,
                secondChildId: pair.secondChildId,
                enabled: !pair.enabled,
              })
            }
          >
            {t(pair.enabled ? 'peerMessaging.revoke' : 'peerMessaging.enable')}
          </MessageButton>
          {confirmation?.firstChildId === pair.firstChildId &&
          confirmation.secondChildId === pair.secondChildId ? (
            <View style={styles.notice}>
              <MessageText>
                {t(confirmation.enabled ? 'peerMessaging.enableBody' : 'peerMessaging.revokeBody')}
              </MessageText>
              <MessageButton
                busy={state.busy}
                busyLabel={t('messaging.working')}
                onPress={() => {
                  void controller.setPeerPermission(
                    confirmation.firstChildId,
                    confirmation.secondChildId,
                    confirmation.enabled,
                  );
                  setConfirmation(null);
                }}
              >
                {t(
                  confirmation.enabled
                    ? 'peerMessaging.confirmEnable'
                    : 'peerMessaging.confirmRevoke',
                )}
              </MessageButton>
              <MessageButton variant="quiet" onPress={() => setConfirmation(null)}>
                {t('messaging.cancel')}
              </MessageButton>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
