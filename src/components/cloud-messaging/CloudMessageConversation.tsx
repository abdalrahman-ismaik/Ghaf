import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { CloudActions } from '@/components/cloud-family/common';
import { MessageButton, MessageText, styles } from '@/components/familyMessaging/shared';
import { Input } from '@/components/primitives';
import {
  phraseIds,
  phraseText,
  validBody,
  type PhraseId,
} from '@/features/familyMessaging/contracts';

import { useMessageCopy, type CloudMessagingController, type CloudMessagingState } from './common';

export function CloudMessageConversation({
  controller,
  state,
}: {
  readonly controller: CloudMessagingController;
  readonly state: CloudMessagingState;
}) {
  const { text, locale, direction } = useMessageCopy();
  const [draft, setDraft] = useState('');
  const [phrase, setPhrase] = useState<PhraseId | null>(null);
  const [discard, setDiscard] = useState(false);
  const [leave, setLeave] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const thread = state.inbox?.threads.find((item) => item.id === state.threadId);
  const actor = state.inbox?.actor;
  if (!thread || !actor) return null;
  const phraseOnly = actor.role === 'child' && actor.ageBand === '6_8';
  const locked = state.busy || state.pending !== null;
  const draftLocked = state.pending !== null;
  const send = async () => {
    if (locked || !validBody(draft) || (phraseOnly && !phrase)) return;
    const saved = await controller.send(draft, phrase ?? undefined);
    if (saved && mounted.current) {
      setDraft('');
      setPhrase(null);
    }
  };
  const retry = async () => {
    const saved = await controller.retry();
    if (saved && mounted.current) {
      setDraft('');
      setPhrase(null);
    }
  };
  return (
    <View style={styles.group} testID="cloud-message-conversation">
      <MessageText variant="heading" accessibilityRole="header" direction="auto">
        {thread.otherName}
      </MessageText>
      <MessageText variant="caption">
        {text(thread.kind === 'child_child' ? 'peerBoundary' : 'humanBoundary')}
      </MessageText>
      <MessageButton
        variant="quiet"
        disabled={locked}
        onPress={() => controller.close()}
        testID="cloud-message-close"
      >
        {text('inbox')}
      </MessageButton>
      {thread.kind === 'child_child' && actor.role === 'child' ? (
        <View style={styles.notice}>
          <MessageButton
            disabled={locked}
            variant="quiet"
            onPress={() => setLeave(true)}
            testID="cloud-message-leave"
          >
            {text('leave')}
          </MessageButton>
          {leave ? (
            <>
              <MessageText>{text('leaveBody')}</MessageText>
              <MessageButton
                disabled={locked}
                onPress={() => void controller.leavePeer()}
                testID="cloud-message-confirm-leave"
              >
                {text('confirmLeave')}
              </MessageButton>
              <MessageButton variant="quiet" onPress={() => setLeave(false)}>
                {text('cancel')}
              </MessageButton>
            </>
          ) : null}
        </View>
      ) : null}
      {state.hasMore ? (
        <MessageButton
          variant="secondary"
          disabled={state.busy}
          onPress={() => void controller.loadOlder()}
          testID="cloud-message-older"
        >
          {text('older')}
        </MessageButton>
      ) : null}
      {!state.messages.length && !state.busy ? (
        <MessageText color="onSurfaceVariant" testID="cloud-messages-empty">
          {text('emptyMessages')}
        </MessageText>
      ) : null}
      {state.messages.map((message) => {
        const mine = message.senderId === actor.personId;
        return (
          <View
            key={message.id}
            style={[
              styles.bubble,
              mine && styles.ownBubble,
              {
                alignSelf: mine
                  ? direction === 'rtl'
                    ? 'flex-start'
                    : 'flex-end'
                  : direction === 'rtl'
                    ? 'flex-end'
                    : 'flex-start',
              },
            ]}
            testID={`cloud-message-${message.sequence}`}
          >
            <MessageText variant="label" direction="auto">
              {mine ? text('you') : thread.otherName}
            </MessageText>
            <MessageText selectable direction="auto">
              {message.body}
            </MessageText>
            <MessageText variant="caption" color="onSurfaceVariant">
              {text('confirmed')} ·{' '}
              {new Date(message.createdAt).toLocaleString(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </MessageText>
          </View>
        );
      })}
      {state.pending ? (
        <View
          style={styles.error}
          accessibilityLiveRegion="polite"
          testID={`cloud-send-${state.pending.status}`}
        >
          <MessageText selectable direction="auto">
            {state.pending.body}
          </MessageText>
          <MessageText variant="label">
            {text(state.pending.status === 'sending' ? 'sending' : 'unconfirmed')}
          </MessageText>
          {state.pending.status === 'failed' ? (
            <>
              <MessageText>{text('unconfirmedBody')}</MessageText>
              <MessageButton
                disabled={state.busy}
                onPress={() => void retry()}
                testID="cloud-message-retry-send"
              >
                {text('retrySend')}
              </MessageButton>
              <MessageButton
                disabled={state.busy}
                variant="quiet"
                onPress={() => setDiscard(true)}
                testID="cloud-message-discard"
              >
                {text('discard')}
              </MessageButton>
              {discard ? (
                <>
                  <MessageText>{text('discardBody')}</MessageText>
                  <MessageButton
                    disabled={state.busy}
                    variant="secondary"
                    onPress={() => {
                      if (controller.discardPending()) {
                        setDiscard(false);
                        setDraft('');
                        setPhrase(null);
                      }
                    }}
                    testID="cloud-message-confirm-discard"
                  >
                    {text('confirmDiscard')}
                  </MessageButton>
                  <MessageButton variant="quiet" onPress={() => setDiscard(false)}>
                    {text('cancel')}
                  </MessageButton>
                </>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
      <View style={styles.notice}>
        <MessageText variant="caption">{text('confirmedMeaning')}</MessageText>
        <MessageText variant="caption">{text('retention')}</MessageText>
      </View>
      <View style={styles.group} testID="cloud-message-composer">
        {phraseOnly ? (
          <MessageText variant="label">{text('phraseOnly')}</MessageText>
        ) : (
          <MessageButton
            variant="quiet"
            accessibilityState={{ expanded: showPhrases }}
            onPress={() => setShowPhrases((value) => !value)}
          >
            {text('phrases')}
          </MessageButton>
        )}
        {phraseOnly || showPhrases ? (
          <CloudActions>
            {phraseIds.map((id) => (
              <MessageButton
                key={id}
                variant="secondary"
                fullWidth={false}
                disabled={draftLocked}
                onPress={() => {
                  setDraft(phraseText[locale][id]);
                  setPhrase(id);
                }}
                testID={`cloud-message-phrase-${id}`}
              >
                {phraseText[locale][id]}
              </MessageButton>
            ))}
          </CloudActions>
        ) : null}
        {phraseOnly ? (
          draft ? (
            <MessageText direction="auto" testID="cloud-message-phrase-review">
              {draft}
            </MessageText>
          ) : null
        ) : (
          <>
            <Input
              brand
              label={text('composer', { name: thread.otherName })}
              direction="auto"
              multiline
              value={draft}
              editable={!draftLocked}
              onChangeText={(value) => {
                setDraft(value);
                setPhrase(null);
              }}
              style={styles.messageInput}
              testID="cloud-message-input"
            />
            <MessageText variant="caption" tabular direction="ltr">
              {text('count', { count: Array.from(draft).length })}
            </MessageText>
          </>
        )}
        <MessageButton
          disabled={locked || !validBody(draft) || (phraseOnly && !phrase)}
          onPress={() => void send()}
          testID="cloud-message-send"
        >
          {text('send')}
        </MessageButton>
      </View>
    </View>
  );
}
