import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, BackHandler, Platform, View } from 'react-native';

import { MessageButton, MessageText, styles } from '@/components/familyMessaging/shared';
import { createCloudMessagingController } from '@/features/cloud-messaging/controller';
import { MessagingError } from '@/features/familyMessaging/contracts';
import type { CloudFamilyActor, CloudFamilyChild } from '@/models/cloudFamily';
import type { ParentAccountService } from '@/models/parentAccount';

import { CloudMessageConversation } from './CloudMessageConversation';
import { CloudMessageInbox } from './CloudMessageInbox';
import { useMessageCopy } from './common';

export interface CloudMessagingViewProps {
  readonly service: ParentAccountService;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudFamilyActor;
  readonly childProfiles: readonly CloudFamilyChild[];
  readonly onBack: () => void;
}

export function CloudMessagingView(props: CloudMessagingViewProps) {
  const { text } = useMessageCopy();
  const child = props.childProfiles.find((item) => item.id === props.actor.childId && item.active);
  if (
    props.actor.userId !== props.userId ||
    props.actor.familyId !== props.familyId ||
    (props.actor.role === 'child' && !child)
  )
    return <MessageText accessibilityRole="alert">{text('unavailable')}</MessageText>;
  const actor = {
    personId: props.actor.role === 'parent' ? props.userId : child!.id,
    role: props.actor.role,
    ageBand: props.actor.role === 'parent' ? null : child!.ageBand,
  };
  return (
    <CloudMessagingRuntime
      key={`${props.userId}:${props.familyId}:${actor.personId}:${actor.ageBand}`}
      {...props}
      messagingActor={actor}
    />
  );
}

function CloudMessagingRuntime({
  service,
  userId,
  familyId,
  messagingActor,
  onBack,
}: CloudMessagingViewProps & {
  readonly messagingActor: {
    readonly personId: string;
    readonly role: 'parent' | 'child';
    readonly ageBand: CloudFamilyChild['ageBand'] | null;
  };
}) {
  const { text } = useMessageCopy();
  const { personId, role, ageBand } = messagingActor;
  const transport = useMemo(
    () => ({
      familyRequest(name: string, args: Record<string, unknown>) {
        if (!service.familyRequest)
          return Promise.reject(new MessagingError('service_unavailable'));
        return service.familyRequest(name, args, userId);
      },
      subscribeFamily(id: string, listener: () => void) {
        if (!service.subscribeFamily)
          return Promise.reject(new MessagingError('service_unavailable'));
        return service.subscribeFamily(id, listener);
      },
    }),
    [service, userId],
  );
  const controller = useMemo(
    () =>
      createCloudMessagingController({
        service: transport,
        userId,
        familyId,
        actor: { personId, role, ageBand },
      }),
    [transport, userId, familyId, personId, role, ageBand],
  );
  const lifetimes = useRef(new WeakMap<typeof controller, number>());
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    const generations = lifetimes.current;
    generations.set(controller, (generations.get(controller) ?? 0) + 1);
    const update = () =>
      controller.setActive(
        (AppState.currentState === null || AppState.currentState === 'active') &&
          (Platform.OS !== 'web' ||
            typeof document === 'undefined' ||
            document.visibilityState !== 'hidden'),
      );
    void controller.load();
    const listener = AppState.addEventListener('change', update);
    if (Platform.OS === 'web' && typeof document !== 'undefined')
      document.addEventListener('visibilitychange', update);
    update();
    return () => {
      listener.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined')
        document.removeEventListener('visibilitychange', update);
      controller.setActive(false);
      const cleanup = (generations.get(controller) ?? 0) + 1;
      generations.set(controller, cleanup);
      void Promise.resolve().then(() => {
        if (generations.get(controller) === cleanup) {
          generations.delete(controller);
          controller.dispose();
        }
      });
    };
  }, [controller]);
  const back = useCallback(() => {
    if (state.threadId) controller.close();
    else if (!state.busy && !state.pending) onBack();
    return true;
  }, [controller, onBack, state.busy, state.pending, state.threadId]);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', back);
    return () => listener.remove();
  }, [back]);
  return (
    <View style={styles.group} testID="cloud-messaging-view">
      {!state.threadId ? (
        <MessageButton
          variant="quiet"
          disabled={state.busy || Boolean(state.pending)}
          onPress={onBack}
        >
          {text('back')}
        </MessageButton>
      ) : null}
      {state.status === 'loading' || state.busy ? (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <ActivityIndicator />
          <MessageText>{text(state.status === 'loading' ? 'loading' : 'working')}</MessageText>
        </View>
      ) : null}
      {state.error || state.status === 'unavailable' ? (
        <View style={styles.error}>
          <MessageText accessibilityRole="alert">
            {text(state.status === 'unavailable' ? 'unavailable' : 'error')}
          </MessageText>
          <MessageButton
            disabled={state.busy}
            variant="secondary"
            onPress={() => void controller.refresh()}
            testID="cloud-message-refresh-error"
          >
            {text('refresh')}
          </MessageButton>
        </View>
      ) : null}
      {state.inbox ? (
        <>
          {state.threadId ? (
            <CloudMessageConversation key={state.threadId} state={state} controller={controller} />
          ) : (
            <CloudMessageInbox state={state} controller={controller} />
          )}
          <MessageButton
            variant="quiet"
            disabled={state.busy}
            onPress={() => void controller.refresh()}
            testID="cloud-message-refresh"
          >
            {text('refresh')}
          </MessageButton>
        </>
      ) : null}
    </View>
  );
}
