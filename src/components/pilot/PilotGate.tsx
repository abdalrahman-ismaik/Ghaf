import { useEffect, useRef, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import { AppState, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/primitives';
import { colors, logicalRowDirection, spacing } from '@/design/tokens';
import { getPilotConfig } from '@/features/pilot/config';
import { createPilotController } from '@/features/pilot/controller';
import { createPilotPrivateBoundary } from '@/features/pilot/privateBoundary';
import { ParentAccountError } from '@/models/parentAccount';
import { getParentAccountService, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { PilotAccountView } from './PilotAccountView';
import { AccountWorkspaceBoundary } from './AccountWorkspaceBoundary';

function createAccountRuntime() {
  let service = null;
  try {
    if (getPilotConfig().valid) service = getParentAccountService();
  } catch {
    // An unavailable provider keeps the entire sample navigator closed.
  }
  const boundary = createPilotPrivateBoundary(
    {
      async start() {
        const result = await usePrototypeStore.getState().startPilotSample();
        if (!result.ok) throw new ParentAccountError('provider_unavailable');
      },
      clear() {
        const previous = usePrototypeStore.getState();
        const result = previous.clearPilotSample();
        if (!result.ok) throw new ParentAccountError('provider_unavailable');
        if (usePrototypeStore.getState().locale !== previous.locale)
          usePrototypeStore.getState().setLocale(previous.locale);
      },
    },
    serviceRegistry.familyMessaging.controller,
  );
  return { controller: createPilotController(service, boundary), service };
}

export function PilotGate({ children }: PropsWithChildren) {
  if (!getPilotConfig().enabled) return children;
  return <EnabledPilotGate>{children}</EnabledPilotGate>;
}

export function EnabledPilotGate({ children }: PropsWithChildren) {
  const [{ controller, service }] = useState(createAccountRuntime);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const sampleActive = usePrototypeStore((current) => current.pilotSampleActive);
  const direction = usePrototypeStore((current) => current.direction);
  const locale = usePrototypeStore((current) => current.locale);
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useRootNavigationState();
  const navigatedGeneration = useRef<number | null>(null);
  const lifetime = useRef(0);
  const appliedPreference = useRef<string | null>(null);
  const demoMounted =
    state.phase === 'ready' && state.sampleOpen && sampleActive && !state.accountPanel;

  useEffect(() => {
    const profile = state.profile;
    if (profile && profile.userId === state.account?.userId) {
      const preferenceKey = `${profile.userId}:${profile.revision}`;
      if (appliedPreference.current === preferenceKey) return;
      appliedPreference.current = preferenceKey;
      const store = usePrototypeStore.getState();
      if (store.locale !== profile.preferredLocale) store.setLocale(profile.preferredLocale);
    }
  }, [state.profile, state.account?.userId]);

  useEffect(() => {
    lifetime.current += 1;
    void controller.initialize();
    return () => {
      const cleanup = ++lifetime.current;
      // StrictMode replays mount effects before this microtask; a real unmount disposes the service.
      void Promise.resolve().then(() => {
        if (lifetime.current === cleanup) controller.dispose();
      });
    };
  }, [controller]);

  useEffect(() => {
    const visible = () =>
      (AppState.currentState === null || AppState.currentState === 'active') &&
      (Platform.OS !== 'web' ||
        typeof document === 'undefined' ||
        document.visibilityState !== 'hidden');
    const changed = () => controller.setActive(visible());
    const appSubscription = AppState.addEventListener('change', changed);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', changed);
    }
    changed();
    const timer = setInterval(() => {
      if (visible()) void controller.refresh();
    }, 60_000);
    return () => {
      appSubscription.remove();
      clearInterval(timer);
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', changed);
      }
    };
  }, [controller]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = controller.getSnapshot();
      if (current.phase === 'ready' && current.sampleOpen && !current.accountPanel) return false;
      if (current.accountPanel) controller.continueSample();
      else if (['register', 'verify', 'forgot', 'recovery-code'].includes(current.phase)) {
        controller.showForm('signin');
      }
      return true;
    });
    return () => subscription.remove();
  }, [controller]);

  useEffect(() => {
    const current = controller.getSnapshot();
    if (!sampleActive && current.sampleOpen && !current.busy) controller.restartSample();
  }, [controller, sampleActive, state.sampleOpen, state.busy]);

  useEffect(() => {
    if (!demoMounted || !navigation?.key || navigatedGeneration.current === state.sampleGeneration)
      return;
    navigatedGeneration.current = state.sampleGeneration;
    router.replace('/parent');
  }, [demoMounted, navigation?.key, router, state.sampleGeneration]);

  if (!demoMounted)
    return (
      <PilotAccountView controller={controller} state={state}>
        {state.phase === 'ready' && state.account && service ? (
          <AccountWorkspaceBoundary
            key={state.account.userId}
            service={service}
            userId={state.account.userId}
          />
        ) : null}
      </PilotAccountView>
    );

  return (
    <View style={styles.root} testID="pilot-sample-boundary">
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.chrome}>
        <View style={[styles.chromeContent, { flexDirection: logicalRowDirection(direction) }]}>
          <Text brand variant="caption" style={styles.sampleLabel}>
            {t('pilot.sampleLabel')}
          </Text>
          <Button
            brand
            direction={direction}
            language={locale}
            fullWidth={false}
            onPress={() => controller.openAccount()}
            testID="pilot-open-account"
            variant="secondary"
          >
            {t('pilot.account')}
          </Button>
        </View>
      </SafeAreaView>
      <View style={styles.root}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    backgroundColor: colors.pearlGround,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  chromeContent: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sampleLabel: { flexGrow: 1, flexShrink: 1, flexBasis: 160 },
});
