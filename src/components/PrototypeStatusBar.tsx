import { useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { colors, layout, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { replaceHistoryWithEntry } from '@/utils/navigation';

export function PrototypeStatusBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const direction = usePrototypeStore((state) => state.direction);
  const resetPrototype = usePrototypeStore((state) => state.resetPrototype);
  const [confirming, setConfirming] = useState(false);
  const canReset = role === 'parent' && pathname !== '/' && pathname !== '/role';

  const reset = () => {
    const result = resetPrototype();
    setConfirming(false);
    if (!result.ok) return;
    replaceHistoryWithEntry(router);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="prototype-status-bar">
      <View style={[styles.content, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={[styles.identity, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <View style={styles.identityRule} />
          <Text color="white" variant="caption">
            {t('common.prototype')} · {t('origin.synthetic')}
          </Text>
        </View>
        {canReset ? (
          confirming ? (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.confirmation, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
            >
              <Text color="white" variant="caption">
                {t('reset.title')}
              </Text>
              <StatusAction
                label={t('reset.confirm')}
                onPress={reset}
                testID="confirm-reset-button"
              />
              <StatusAction
                label={t('common.cancel')}
                onPress={() => setConfirming(false)}
                testID="cancel-reset-button"
              />
            </View>
          ) : (
            <StatusAction
              label={t('reset.action')}
              onPress={() => setConfirming(true)}
              testID="reset-demo-button"
            />
          )
        ) : null}
      </View>
    </View>
  );
}

function StatusAction({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}
      testID={testID}
    >
      <Text align="center" color="goldLight" variant="caption">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 10,
    backgroundColor: colors.forest,
    borderBottomWidth: 1,
    borderBottomColor: colors.forestSoft,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth + spacing.xl * 2,
    minHeight: layout.touchTarget,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  identity: { flex: 1, minWidth: 0, alignItems: 'center', gap: spacing.xs },
  identityRule: { width: 4, height: 20, backgroundColor: colors.gold },
  confirmation: {
    flexShrink: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  action: {
    minHeight: layout.touchTarget,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.forestSoft,
    paddingHorizontal: spacing.sm,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
