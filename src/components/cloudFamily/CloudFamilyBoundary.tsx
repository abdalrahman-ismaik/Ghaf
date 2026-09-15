import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { useTranslation } from 'react-i18next';
import { AccessTextField, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import {
  createCloudFamilyController,
  type CloudFamilyService,
} from '@/features/cloudFamily/controller';
import { cloudError, type CloudExpectedActor } from '@/features/cloudFamily/validation';
import { CloudFamilyScreen } from './CloudFamilyScreen';

export function CloudFamilyBoundary({
  service,
  expected,
  reauthenticate,
  onAccessLost,
}: {
  service: CloudFamilyService;
  expected: CloudExpectedActor;
  reauthenticate?: (password: string) => Promise<void>;
  onAccessLost?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ar';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const [controller] = useState(() => createCloudFamilyController(service, expected, randomUUID));
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authDone, setAuthDone] = useState(false);
  const lifetime = useRef(0);
  const authPending = useRef(false);
  useEffect(() => {
    if (state.error === 'access_denied' || state.error === 'access_revoked') onAccessLost?.();
  }, [state.error, onAccessLost]);
  useEffect(() => {
    lifetime.current += 1;
    void controller.load();
    const refresh = () => {
      if (authPending.current || controller.getSnapshot().error === 'reauthentication_required')
        return;
      if (!AppState.currentState || AppState.currentState === 'active') void controller.load();
    };
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    const timer = setInterval(refresh, 30_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
      const cleanup = ++lifetime.current;
      void Promise.resolve().then(() => {
        if (lifetime.current === cleanup) controller.dispose();
      });
    };
  }, [controller]);
  const confirmIdentity = async () => {
    if (!reauthenticate || authPending.current || !password) return;
    authPending.current = true;
    setAuthBusy(true);
    setAuthError(null);
    setAuthDone(false);
    const submitted = password;
    setPassword('');
    const attempt = lifetime.current;
    try {
      await reauthenticate(submitted);
      if (attempt !== lifetime.current) return;
      setAuthDone(true);
      await controller.load();
    } catch (error) {
      if (attempt === lifetime.current) setAuthError(cloudError(error).code);
    } finally {
      authPending.current = false;
      if (attempt === lifetime.current) setAuthBusy(false);
    }
  };
  return (
    <View style={styles.root} testID="cloud-family-boundary">
      {state.error ? (
        <StatusBanner
          direction={direction}
          language={locale}
          tone="error"
          message={t(`cloudFamily.errors.${state.error}`)}
        />
      ) : null}
      {state.saved ? (
        <StatusBanner
          direction={direction}
          language={locale}
          tone="success"
          message={t('cloudFamily.saved')}
        />
      ) : null}
      {state.busy ? (
        <ActivityIndicator
          color={colors.ghafEmerald}
          accessibilityLabel={t('cloudFamily.loading')}
        />
      ) : null}
      {state.uncertain ? (
        <>
          <Text brand>{t('cloudFamily.uncertain')}</Text>
          <Button
            brand
            busy={state.busy}
            onPress={() => void controller.retry()}
            testID="cloud-retry-command"
          >
            {t('cloudFamily.retry')}
          </Button>
        </>
      ) : null}
      <Button
        brand
        disabled={state.busy}
        variant="quiet"
        onPress={() => void controller.load()}
        testID="cloud-refresh"
      >
        {t('cloudFamily.refresh')}
      </Button>
      {state.error === 'reauthentication_required' && reauthenticate ? (
        <View style={styles.root}>
          <AccessTextField
            label={t('cloudFamily.access.password')}
            language={locale}
            direction={direction}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!authBusy}
            onSubmitEditing={() => void confirmIdentity()}
            testID="cloud-reauth-password"
          />
          {authError ? (
            <StatusBanner
              direction={direction}
              language={locale}
              tone="error"
              message={t(`cloudFamily.errors.${authError}`)}
            />
          ) : null}
          <Button
            brand
            busy={authBusy}
            disabled={!password}
            onPress={() => void confirmIdentity()}
            testID="cloud-reauth-confirm"
          >
            {t('cloudFamily.access.confirm')}
          </Button>
        </View>
      ) : null}
      {authDone ? (
        <Text brand accessibilityLiveRegion="polite">
          {t('cloudFamily.access.reauthenticated')}
        </Text>
      ) : null}
      {state.snapshot ? (
        <View
          style={state.accessible ? styles.root : styles.hidden}
          accessibilityElementsHidden={!state.accessible}
          importantForAccessibility={state.accessible ? 'auto' : 'no-hide-descendants'}
        >
          {state.snapshot.legacy_available && expected.role === 'parent' ? (
            <View style={styles.root}>
              <Text brand>{t('cloudFamily.imported')}</Text>
              <Button
                brand
                disabled={state.busy || state.uncertain}
                onPress={() => void controller.command({ type: 'workspace.import' })}
                testID="cloud-import-legacy"
              >
                {t('cloudFamily.import')}
              </Button>
            </View>
          ) : null}
          <CloudFamilyScreen
            snapshot={state.snapshot}
            busy={state.busy || state.uncertain || state.error === 'revision_conflict'}
            command={controller.command}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: spacing.md },
  hidden: { display: 'none' },
});
