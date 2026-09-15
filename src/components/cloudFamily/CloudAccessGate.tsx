import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { readCloudDeviceMode, writeCloudDeviceMode } from '@/features/cloudFamily/childService';
import { getParentAccountService } from '@/services';
import { CloudFamilyError } from '@/models/normalizedCloudFamily';
import { CloudChildEntry } from './CloudChildEntry';

export function CloudAccessGate({
  renderParent,
}: {
  renderParent: (enterChild: () => Promise<void>) => ReactNode;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'loading' | 'error' | 'parent' | 'child'>('loading');
  const [retry, setRetry] = useState(0);
  const lifetime = useRef(0);
  useEffect(() => {
    const attempt = ++lifetime.current;
    void readCloudDeviceMode()
      .then((value) => {
        if (attempt === lifetime.current) setMode(value);
      })
      .catch(() => {
        if (attempt === lifetime.current) setMode('error');
      });
    return () => {
      lifetime.current += 1;
    };
  }, [retry]);
  const enterChild = async () => {
    try {
      await writeCloudDeviceMode('child');
      setMode('child');
    } catch {
      setMode('error');
    }
  };
  const enterParent = async () => {
    const service = getParentAccountService();
    if (!service) throw new CloudFamilyError('service_unavailable');
    try {
      // Initialize the lazy service so signout clears a retained credential even after a failed restore.
      await service.restoreSession().catch(() => undefined);
      await service.signOut();
      await writeCloudDeviceMode('parent');
      setMode('parent');
    } finally {
      service.dispose();
    }
  };
  if (mode === 'parent') return renderParent(enterChild);
  if (mode === 'child') return <CloudChildEntry onParent={enterParent} />;
  return (
    <View style={styles.root} testID="cloud-device-mode">
      {mode === 'loading' ? (
        <ActivityIndicator
          color={colors.ghafEmerald}
          accessibilityLabel={t('normalizedCloudFamily.access.loading')}
        />
      ) : (
        <>
          <Text brand>{t('normalizedCloudFamily.access.modeError')}</Text>
          <Button
            brand
            onPress={() => {
              setMode('loading');
              setRetry((value) => value + 1);
            }}
          >
            {t('normalizedCloudFamily.access.retry')}
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.pearlGround,
  },
});
