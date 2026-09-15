import { useCallback, useState, useSyncExternalStore } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { logicalRowDirection } from '@/design/tokens';
import type { MessagingRole } from '@/features/familyMessaging';
import type { FamilyMessagingController } from '@/features/familyMessaging/controller';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { MessagingAccess } from './MessagingAccess';
import { MessagingConversation } from './MessagingConversation';
import { MessagingManagement } from './MessagingManagement';
import { MessageButton, MessageText, styles } from './shared';

export interface FamilyMessagingScreenProps {
  readonly controller?: FamilyMessagingController;
  readonly onExit?: () => void;
  readonly embedded?: boolean;
  readonly localContext?: { readonly scope: string; readonly role: MessagingRole };
}

export function FamilyMessagingScreen({
  controller = serviceRegistry.familyMessaging.controller,
  onExit,
  embedded = false,
  localContext,
}: FamilyMessagingScreenProps = {}) {
  const { height } = useWindowDimensions();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const { t } = useTranslation();
  const router = useRouter();
  const direction = usePrototypeStore((store) => store.direction);
  const [boundScope, setBoundScope] = useState<string | null>(null);
  const [managementDevice, setManagementDevice] = useState<string | null>(null);
  const contextScope = localContext?.scope;
  const contextRole = localContext?.role;
  const scopeReady = !contextScope || boundScope === contextScope;
  const management =
    scopeReady &&
    state.phase === 'ready' &&
    Boolean(state.context) &&
    managementDevice === state.context?.deviceId;
  const back = useCallback(() => {
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      return;
    }
    if (management) {
      controller.dismissInvitation();
      setManagementDevice(null);
      return;
    }
    if (state.threadId) {
      controller.closeThread();
      return;
    }
    if (onExit) onExit();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [controller, management, onExit, router, state.threadId]);
  useFocusEffect(
    useCallback(() => {
      if (contextScope && contextRole) {
        controller.setLocalContext(contextScope, contextRole);
        controller.openFor(contextRole);
      }
      controller.setVisible(true);
      setBoundScope(contextScope ?? null);
      return () => controller.setVisible(false);
    }, [contextRole, contextScope, controller]),
  );
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        back();
        return true;
      });
      return () => subscription.remove();
    }, [back]),
  );
  const thread = scopeReady
    ? state.threads.find((candidate) => candidate.id === state.threadId)
    : undefined;
  const ready = scopeReady && state.phase === 'ready' && state.context !== null;
  const access =
    scopeReady &&
    (state.phase === 'signedOut' || state.phase === 'authenticating' || state.phase === 'revoked');
  return (
    <SafeAreaView
      style={[
        styles.root,
        embedded ? { flex: 0, height: Math.max(360, height - 160) } : null,
        Platform.OS === 'web' ? null : { direction: 'ltr' },
      ]}
      edges={embedded ? [] : ['top', 'left', 'right', 'bottom']}
      testID="family-messaging-screen"
    >
      <KeyboardAvoidingView
        style={styles.column}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.row,
              {
                direction: Platform.OS === 'web' ? direction : 'ltr',
                flexDirection: Platform.OS === 'web' ? 'row' : logicalRowDirection(direction),
              },
            ]}
          >
            <MessageButton
              variant="quiet"
              fullWidth={false}
              icon={<GhafIcon name="arrow-back" direction={direction} />}
              onPress={back}
              testID="messaging-back"
            >
              {t('messaging.back')}
            </MessageButton>
            <View style={styles.identity}>
              <MessageText
                accessibilityRole="header"
                variant="heading"
                direction={thread ? 'auto' : direction}
              >
                {thread?.otherName ?? t('messaging.title')}
              </MessageText>
              {ready ? (
                <MessageText variant="caption">
                  {t('messaging.identity', { name: state.context!.displayName })}
                </MessageText>
              ) : null}
            </View>
          </View>
          {ready && thread ? (
            <MessageText variant="caption" color="onSurfaceVariant">
              {t(
                thread.kind === 'child_child'
                  ? 'peerMessaging.participant'
                  : `messaging.${thread.otherRole}`,
              )}
            </MessageText>
          ) : (
            <LanguageSwitcher compact showGuidance={false} />
          )}
          {state.error ? (
            <View style={styles.error} accessibilityLiveRegion="polite" testID="messaging-error">
              <MessageText>{t(`messaging.errors.${state.error}`)}</MessageText>
            </View>
          ) : null}
        </View>
        {ready && thread && !management ? (
          <MessagingConversation key={thread.id} controller={controller} state={state} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {state.phase === 'unavailable' ? (
              <>
                <MessageText variant="heading">{t('messaging.unavailable')}</MessageText>
                <MessageText>{t('messaging.unavailableBody')}</MessageText>
              </>
            ) : null}
            {!scopeReady || state.phase === 'validating' ? (
              <MessageText accessibilityLiveRegion="polite">{t('messaging.loading')}</MessageText>
            ) : null}
            {state.phase === 'locked' ? (
              <>
                <MessageButton onPress={() => void controller.validate()}>
                  {t('messaging.retry')}
                </MessageButton>
                <MessageButton
                  variant="secondary"
                  busy={state.busy}
                  busyLabel={t('messaging.working')}
                  onPress={() => void controller.signOut()}
                >
                  {t('messaging.signOut')}
                </MessageButton>
              </>
            ) : null}
            {state.remoteSignoutUnconfirmed ? (
              <View style={styles.error}>
                <MessageText>{t('messaging.signOutNotice')}</MessageText>
              </View>
            ) : null}
            {access ? <MessagingAccess controller={controller} state={state} /> : null}
            {ready && management ? (
              <MessagingManagement controller={controller} state={state} />
            ) : null}
            {ready && !management ? (
              <>
                <MessageText color="onSurfaceVariant">{t('messaging.separate')}</MessageText>
                {state.peerAccessRemoved ? (
                  <MessageText accessibilityLiveRegion="polite">
                    {t('peerMessaging.removed')}
                  </MessageText>
                ) : null}
                <MessageText accessibilityRole="header" variant="heading">
                  {t('messaging.conversations')}
                </MessageText>
                {!state.threads.length ? (
                  <MessageText>{t('messaging.emptyThreads')}</MessageText>
                ) : null}
                {state.threads.map((candidate) => (
                  <View key={candidate.id} style={styles.recipient}>
                    <MessageText variant="heading" direction="auto">
                      {candidate.otherName}
                    </MessageText>
                    <MessageText variant="caption">
                      {t(
                        candidate.kind === 'child_child'
                          ? 'peerMessaging.participant'
                          : `messaging.${candidate.otherRole}`,
                      )}
                    </MessageText>
                    <MessageButton
                      variant="secondary"
                      onPress={() => void controller.openThread(candidate.id)}
                    >
                      {t('messaging.openThread', { name: candidate.otherName })}
                    </MessageButton>
                  </View>
                ))}
                {state.context?.role === 'parent' ? (
                  <MessageButton
                    onPress={() => setManagementDevice(state.context?.deviceId ?? null)}
                  >
                    {t('messaging.manage')}
                  </MessageButton>
                ) : null}
                <MessageText variant="caption" color="onSurfaceVariant">
                  {t('messaging.privacy')}
                </MessageText>
                <MessageButton
                  variant="quiet"
                  busy={state.busy}
                  busyLabel={t('messaging.working')}
                  onPress={() => void controller.signOut()}
                >
                  {t('messaging.signOut')}
                </MessageButton>
              </>
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
