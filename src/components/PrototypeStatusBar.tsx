import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function PrototypeStatusBar() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const direction = usePrototypeStore((state) => state.direction);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);

  const reset = () => {
    resetDemo();
    router.dismissAll();
    router.replace('/parent');
  };

  return (
    <View
      accessibilityLabel={`${t('prototypeStatus.mode')}. ${t('prototypeStatus.disclosure')}`}
      style={[styles.safeRoot, { paddingTop: insets.top }]}
      testID="prototype-status-bar"
    >
      <View style={[styles.content, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={[styles.disclosure, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
          <View style={styles.liveDot} />
          <Text color="white" style={styles.disclosureText} variant="caption">
            {t('prototypeStatus.mode')}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={t('common.reset')}
          accessibilityRole="button"
          hitSlop={6}
          onPress={reset}
          style={({ pressed }) => [styles.resetButton, pressed ? styles.pressed : null]}
          testID="reset-demo-button"
        >
          <Text align="center" color="goldLight" variant="caption">
            {t('common.reset')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
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
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  disclosure: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  disclosureText: {
    flexShrink: 1,
  },
  liveDot: {
    width: 4,
    height: 20,
    flexShrink: 0,
    borderRadius: radii.sm,
    backgroundColor: colors.gold,
  },
  resetButton: {
    minHeight: layout.touchTarget,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.forestSoft,
    backgroundColor: colors.transparent,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
