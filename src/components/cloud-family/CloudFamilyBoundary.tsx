import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, Platform } from 'react-native';

import { AccessHeader, AccessScreen } from '@/components/access';
import { Text } from '@/components/primitives';
import { createCloudFamilyController } from '@/features/cloud-family';
import { CloudFamilyError } from '@/models/cloudFamily';
import type { ParentAccountService } from '@/models/parentAccount';

import { CloudFamilyView } from './CloudFamilyView';
import { CloudAction, CloudActions, cloudStyles, useCloudCopy } from './common';

export interface CloudFamilyBoundaryProps {
  readonly service: ParentAccountService;
  readonly userId: string;
  readonly onSignOut: () => void;
  readonly onOpenLegacy?: () => void;
  readonly onOpenAccount?: () => void;
}

export function CloudFamilyBoundary(props: CloudFamilyBoundaryProps) {
  return <CloudFamilyRuntime key={props.userId} {...props} />;
}

function CloudFamilyRuntime(props: CloudFamilyBoundaryProps) {
  const [controller] = useState(() =>
    createCloudFamilyController({
      service: {
        familyRequest(name, args) {
          if (!props.service.familyRequest)
            return Promise.reject(new CloudFamilyError('provider_unavailable'));
          return props.service.familyRequest(name, { ...args }, props.userId);
        },
        subscribeFamily(familyId, onChange) {
          if (!props.service.subscribeFamily)
            return Promise.reject(new CloudFamilyError('provider_unavailable'));
          return props.service.subscribeFamily(familyId, onChange);
        },
      },
      userId: props.userId,
    }),
  );
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const lifetime = useRef(0);
  const { text, locale, direction } = useCloudCopy();
  useEffect(() => {
    lifetime.current += 1;
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
      const cleanup = ++lifetime.current;
      void Promise.resolve().then(() => {
        if (cleanup === lifetime.current) controller.dispose();
      });
    };
  }, [controller]);

  if (!state.snapshot)
    return (
      <AccessScreen
        background="organic"
        contentStyle={cloudStyles.content}
        testID="cloud-family-boundary"
        header={
          <AccessHeader
            brand={locale === 'ar' ? 'غاف' : 'Ghaf'}
            direction={direction}
            language={locale}
            title={text('title')}
          />
        }
      >
        {state.status === 'loading' ? <ActivityIndicator /> : null}
        <Text brand accessibilityLiveRegion="polite">
          {text(state.status === 'loading' ? 'loading' : 'unavailable')}
        </Text>
        <CloudActions>
          {state.status !== 'loading' ? (
            <CloudAction
              disabled={state.busy}
              onPress={() => void controller.retry()}
              testID="cloud-family-load-retry"
            >
              {text('retry')}
            </CloudAction>
          ) : null}
          <CloudAction onPress={props.onSignOut} variant="quiet" testID="cloud-family-signout">
            {text('signOut')}
          </CloudAction>
        </CloudActions>
      </AccessScreen>
    );

  return (
    <CloudFamilyView
      key={`${props.userId}:${state.snapshot.family?.id ?? 'new'}`}
      {...props}
      controller={controller}
      state={state}
      snapshot={state.snapshot}
    />
  );
}
