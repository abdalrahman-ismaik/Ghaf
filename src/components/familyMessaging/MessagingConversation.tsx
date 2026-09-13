import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Input } from '@/components/primitives';
import { phraseIds, phraseText, validBody } from '@/features/familyMessaging';
import type {
  FamilyMessagingController,
  MessagingState,
} from '@/features/familyMessaging/controller';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { MessageButton, MessageText, styles } from './shared';

export function MessagingConversation({
  controller,
  state,
}: {
  controller: FamilyMessagingController;
  state: MessagingState;
}) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((store) => store.locale);
  const direction = usePrototypeStore((store) => store.direction);
  const scroll = useRef<ScrollView>(null);
  const [clearConfirmation, setClearConfirmation] = useState(false);
  const [details, setDetails] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const thread = state.threads.find((candidate) => candidate.id === state.threadId);
  if (!thread || !state.context) return null;
  const phraseOnly = state.context.role === 'child' && state.context.ageBand === '6_8';
  const locked = Boolean(state.pending) || state.busy;
  return (
    <>
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        testID="message-history"
      >
        <MessageButton
          variant="quiet"
          onPress={() => setDetails((value) => !value)}
          accessibilityState={{ expanded: details }}
        >
          {t('messaging.privacyTitle')}
        </MessageButton>
        {details ? (
          <View style={styles.notice}>
            <MessageText variant="caption">{t('messaging.privacy')}</MessageText>
            <MessageText variant="caption">{t('messaging.acceptedMeaning')}</MessageText>
            <MessageText variant="caption">{t('messaging.separate')}</MessageText>
            <MessageButton
              variant="secondary"
              busy={state.busy}
              busyLabel={t('messaging.working')}
              onPress={() => void controller.signOut()}
            >
              {t('messaging.signOut')}
            </MessageButton>
          </View>
        ) : null}
        {state.hasEarlier ? (
          <MessageButton
            variant="secondary"
            disabled={state.loading}
            onPress={() => void controller.sync(true)}
          >
            {t('messaging.older')}
          </MessageButton>
        ) : null}
        {!state.messages.length && !state.loading ? (
          <MessageText color="onSurfaceVariant">{t('messaging.emptyMessages')}</MessageText>
        ) : null}
        {state.messages.map((message) => {
          const mine = message.senderId === state.context!.personId;
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
              testID={`message-${message.sequence}`}
            >
              <MessageText variant="label" direction="auto">
                {mine ? t('messaging.you') : thread.otherName}
              </MessageText>
              <MessageText selectable direction="auto">
                {message.body}
              </MessageText>
              <MessageText variant="caption" color="onSurfaceVariant">
                {t('messaging.accepted')} ·{' '}
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
            testID={`send-${state.pending.status}`}
          >
            <MessageText selectable direction="auto">
              {state.pending.body}
            </MessageText>
            <MessageText variant="label">{t(`messaging.${state.pending.status}`)}</MessageText>
            {state.pending.status === 'unknown' ? (
              <MessageText>{t('messaging.unknownBody')}</MessageText>
            ) : null}
            {state.pending.status !== 'sending' ? (
              <>
                <MessageButton
                  disabled={state.pending.error === 'attempt_expired'}
                  busy={state.busy}
                  busyLabel={t('messaging.sending')}
                  onPress={() => void controller.send(true)}
                >
                  {t('messaging.retry')}
                </MessageButton>
                <MessageButton variant="quiet" onPress={() => setClearConfirmation(true)}>
                  {t('messaging.clearAttempt')}
                </MessageButton>
              </>
            ) : null}
            {clearConfirmation ? (
              <>
                <MessageText>{t('messaging.clearAttemptBody')}</MessageText>
                <MessageButton
                  variant="secondary"
                  onPress={() => {
                    controller.cancelAttempt();
                    setClearConfirmation(false);
                  }}
                >
                  {t('messaging.clearAttempt')}
                </MessageButton>
                <MessageButton variant="quiet" onPress={() => setClearConfirmation(false)}>
                  {t('messaging.cancel')}
                </MessageButton>
              </>
            ) : null}
          </View>
        ) : null}
        <MessageButton
          variant="quiet"
          busy={state.loading}
          busyLabel={t('messaging.working')}
          onPress={() => void controller.sync()}
        >
          {t('messaging.refresh')}
        </MessageButton>
      </ScrollView>
      <ScrollView
        style={styles.composer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.group}
      >
        {state.hasNewMessages ? (
          <MessageButton
            variant="secondary"
            onPress={() => {
              scroll.current?.scrollToEnd({ animated: false });
              controller.acknowledgeNewMessages();
            }}
          >
            {t('messaging.newMessages')}
          </MessageButton>
        ) : null}
        {state.draft.originScope ? (
          <MessageText
            variant="caption"
            color="onSurfaceVariant"
            testID="helper-draft-identity-notice"
          >
            {t('messaging.separate')}
          </MessageText>
        ) : null}
        {phraseOnly ? (
          <MessageText variant="label">{t('messaging.phrases')}</MessageText>
        ) : (
          <MessageButton
            variant="quiet"
            accessibilityState={{ expanded: showPhrases }}
            onPress={() => setShowPhrases((value) => !value)}
          >
            {t('messaging.phrases')}
          </MessageButton>
        )}
        {phraseOnly || showPhrases ? (
          <>
            <View style={styles.row}>
              {phraseIds.map((phrase) => (
                <MessageButton
                  key={phrase}
                  variant="secondary"
                  fullWidth={false}
                  disabled={locked}
                  onPress={() => {
                    controller.setDraft(phraseText[locale][phrase], phrase);
                    setShowPhrases(false);
                  }}
                >
                  {t(`messaging.phrasesText.${phrase}`)}
                </MessageButton>
              ))}
            </View>
          </>
        ) : null}
        {phraseOnly ? (
          <>
            <MessageText variant="caption">{t('messaging.phraseOnly')}</MessageText>
            {state.draft.text ? <MessageText>{state.draft.text}</MessageText> : null}
          </>
        ) : (
          <Input
            brand
            label={t('messaging.composer', { name: thread.otherName })}
            direction="auto"
            multiline
            value={state.draft.text}
            onChangeText={(text) => controller.setDraft(text)}
            editable={!locked}
            style={styles.messageInput}
          />
        )}
        {!phraseOnly ? (
          <MessageText variant="caption" direction="ltr" align="end" tabular>
            {t('messaging.count', { count: Array.from(state.draft.text).length })}
          </MessageText>
        ) : null}
        <MessageButton
          disabled={locked || !validBody(state.draft.text)}
          busy={state.pending?.status === 'sending'}
          busyLabel={t('messaging.sending')}
          onPress={() => void controller.send()}
        >
          {t('messaging.send')}
        </MessageButton>
      </ScrollView>
    </>
  );
}
