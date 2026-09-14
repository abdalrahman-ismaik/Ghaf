import { useState } from 'react';
import { View } from 'react-native';

import { MessageButton, MessageText, styles } from '@/components/familyMessaging/shared';

import { useMessageCopy, type CloudMessagingController, type CloudMessagingState } from './common';

export function CloudMessageInbox({
  controller,
  state,
}: {
  readonly controller: CloudMessagingController;
  readonly state: CloudMessagingState;
}) {
  const { text } = useMessageCopy();
  const [confirmation, setConfirmation] = useState<{
    first: string;
    second: string;
    enabled: boolean;
  } | null>(null);
  const locked = state.busy || state.pending !== null;
  return (
    <View style={styles.group} testID="cloud-message-inbox">
      <MessageText variant="heading" accessibilityRole="header">
        {text('inbox')}
      </MessageText>
      <MessageText>{text('humanBoundary')}</MessageText>
      {!state.inbox?.threads.length ? (
        <MessageText color="onSurfaceVariant" testID="cloud-message-empty-inbox">
          {text('emptyInbox')}
        </MessageText>
      ) : null}
      {state.inbox?.threads.map((thread) => (
        <View key={thread.id} style={styles.recipient}>
          <MessageText variant="label" direction="auto">
            {thread.otherName}
          </MessageText>
          <MessageText variant="caption">
            {text(thread.otherRole === 'parent' ? 'parent' : 'child')} ·{' '}
            {text(thread.unreadCount ? 'unread' : 'noUnread', { count: thread.unreadCount })}
          </MessageText>
          <MessageButton
            disabled={locked}
            variant="secondary"
            onPress={() => void controller.open(thread.id)}
            testID={`cloud-open-thread-${thread.id}`}
          >
            {text('open')}
          </MessageButton>
        </View>
      ))}
      {state.inbox?.actor.role === 'parent' ? (
        <View style={styles.section} testID="cloud-peer-permissions">
          <MessageText variant="heading" accessibilityRole="header">
            {text('peerTitle')}
          </MessageText>
          <MessageText>{text('parentBoundary')}</MessageText>
          {!state.permissions.length ? <MessageText>{text('noPeers')}</MessageText> : null}
          {state.permissions.map((pair) => (
            <View key={`${pair.firstChildId}:${pair.secondChildId}`} style={styles.recipient}>
              <MessageText variant="label" direction="auto">
                {text('pair', { first: pair.firstName, second: pair.secondName })}
              </MessageText>
              <MessageText>{text(pair.enabled ? 'enabled' : 'disabled')}</MessageText>
              {!pair.available && !pair.enabled ? (
                <MessageText variant="caption">{text('pairFirst')}</MessageText>
              ) : null}
              <MessageButton
                disabled={locked || (!pair.enabled && !pair.available)}
                variant="secondary"
                onPress={() =>
                  setConfirmation({
                    first: pair.firstChildId,
                    second: pair.secondChildId,
                    enabled: !pair.enabled,
                  })
                }
                testID={`cloud-peer-change-${pair.firstChildId}-${pair.secondChildId}`}
              >
                {text(pair.enabled ? 'disablePeer' : 'enablePeer')}
              </MessageButton>
              {confirmation &&
              confirmation.first === pair.firstChildId &&
              confirmation.second === pair.secondChildId ? (
                <View style={styles.notice}>
                  <MessageText>
                    {text(confirmation.enabled ? 'enableBody' : 'disableBody')}
                  </MessageText>
                  <MessageButton
                    disabled={locked || (confirmation.enabled && !pair.available)}
                    onPress={() => {
                      void controller.setPeerPermission(
                        confirmation.first,
                        confirmation.second,
                        confirmation.enabled,
                      );
                      setConfirmation(null);
                    }}
                    testID="cloud-peer-confirm"
                  >
                    {text(confirmation.enabled ? 'enablePeer' : 'disablePeer')}
                  </MessageButton>
                  <MessageButton variant="quiet" onPress={() => setConfirmation(null)}>
                    {text('cancel')}
                  </MessageButton>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
