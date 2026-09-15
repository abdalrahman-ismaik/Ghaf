import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccessHeader, AccessScreen, AccessTextField, StatusBanner } from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Text } from '@/components/primitives';
import { colors, layout, spacing } from '@/design/tokens';
import { createCloudChildService } from '@/features/cloudFamily/childService';
import { cloudError, parseCloudSnapshot } from '@/features/cloudFamily/validation';
import { CloudFamilyBoundary } from './CloudFamilyBoundary';
import { serviceRegistry } from '@/services';

export function CloudChildEntry({ onParent }: { onParent: () => Promise<void> }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ar';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const [service] = useState(createCloudChildService);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const lifetime = useRef(0);
  const mounts = useRef(0);
  const pending = useRef(false);
  const restore = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    const attempt = lifetime.current;
    try {
      const id = await service.restore();
      if (id) parseCloudSnapshot(await service.read(), { role: 'child', userId: id });
      if (attempt !== lifetime.current) return;
      setUserId(id);
      setRestoreFailed(false);
    } catch (cause) {
      if (attempt === lifetime.current) {
        setError(cloudError(cause).code);
        setRestoreFailed(true);
      }
    } finally {
      pending.current = false;
      if (attempt === lifetime.current) setBusy(false);
    }
  };
  useEffect(() => {
    mounts.current += 1;
    void Promise.resolve().then(restore);
    const subscription = AppState.addEventListener('change', (state) =>
      service.setActive(state === 'active'),
    );
    return () => {
      subscription.remove();
      const cleanup = ++mounts.current;
      void Promise.resolve().then(() => {
        if (mounts.current === cleanup) {
          lifetime.current += 1;
          service.dispose();
        }
      });
    };
    // The service and restoration lifetime belong to this mounted entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);
  const claim = async () => {
    if (pending.current || !token.trim()) return;
    pending.current = true;
    setBusy(true);
    const replaceRevokedSession =
      restoreFailed && (error === 'access_denied' || error === 'access_revoked');
    setError(null);
    const attempt = lifetime.current;
    const submitted = token.trim();
    setToken('');
    try {
      await serviceRegistry.familyMessaging.controller.clearAccountSession();
      if (serviceRegistry.familyMessaging.controller.getSnapshot().error)
        throw new Error('messaging_cleanup_failed');
      if (replaceRevokedSession) await service.signOut();
      const result = await service.claim(submitted);
      parseCloudSnapshot(result.snapshot, { role: 'child', userId: result.userId });
      if (attempt === lifetime.current) {
        setUserId(result.userId);
        setRestoreFailed(false);
      }
    } catch (cause) {
      if (attempt === lifetime.current) setError(cloudError(cause).code);
    } finally {
      pending.current = false;
      if (attempt === lifetime.current) setBusy(false);
    }
  };
  const leave = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    setUserId(null);
    setToken('');
    const attempt = lifetime.current;
    try {
      await serviceRegistry.familyMessaging.controller.clearAccountSession();
      if (serviceRegistry.familyMessaging.controller.getSnapshot().error)
        throw new Error('messaging_cleanup_failed');
      await service.signOut();
      await onParent();
    } catch (cause) {
      if (attempt === lifetime.current) setError(cloudError(cause).code);
    } finally {
      pending.current = false;
      if (attempt === lifetime.current) setBusy(false);
    }
  };
  return (
    <AccessScreen
      background="organic"
      contentMaxWidth={layout.readableContentWidth}
      keyboardAware
      testID="cloud-child-entry"
      header={
        <AccessHeader
          brand={t('common.brand')}
          title={t('normalizedCloudFamily.access.title')}
          direction={direction}
          language={locale}
        />
      }
    >
      <View style={styles.root}>
        <LanguageSwitcher compact showGuidance={false} />
        {busy ? (
          <ActivityIndicator
            color={colors.ghafEmerald}
            accessibilityLabel={t('normalizedCloudFamily.access.loading')}
          />
        ) : null}
        {error ? (
          <StatusBanner
            direction={direction}
            language={locale}
            tone="error"
            message={t(`normalizedCloudFamily.errors.${error}`)}
          />
        ) : null}
        {userId ? (
          <CloudFamilyBoundary
            key={userId}
            service={service}
            expected={{ role: 'child', userId }}
            onAccessLost={() => {
              setUserId(null);
              setRestoreFailed(true);
              setError('access_revoked');
            }}
          />
        ) : (
          <>
            <Text brand color="deepForest" variant="parentHero">
              {t('normalizedCloudFamily.access.title')}
            </Text>
            <Text brand>{t('normalizedCloudFamily.access.body')}</Text>
            <AccessTextField
              label={t('normalizedCloudFamily.access.token')}
              language={locale}
              direction="ltr"
              autoCapitalize="none"
              autoCorrect={false}
              value={token}
              onChangeText={setToken}
              editable={!busy}
              maxLength={256}
              onSubmitEditing={() => void claim()}
              testID="cloud-child-token"
            />
            <Button
              brand
              busy={busy}
              disabled={!token.trim()}
              onPress={() => void claim()}
              testID="cloud-child-claim"
            >
              {t('normalizedCloudFamily.access.join')}
            </Button>
            {restoreFailed ? (
              <Button
                brand
                disabled={busy}
                variant="secondary"
                onPress={() => void restore()}
                testID="cloud-child-restore"
              >
                {t('normalizedCloudFamily.access.retry')}
              </Button>
            ) : null}
          </>
        )}
        <Button
          brand
          disabled={busy}
          variant="quiet"
          onPress={() => void leave()}
          testID="cloud-child-parent"
        >
          {t('normalizedCloudFamily.access.parent')}
        </Button>
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, paddingVertical: spacing.md, width: '100%' },
});
