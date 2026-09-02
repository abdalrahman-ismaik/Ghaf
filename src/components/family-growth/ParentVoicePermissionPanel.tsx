import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface ParentVoicePermissionPanelProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ParentVoicePermissionPanel({ enabled, onChange }: ParentVoicePermissionPanelProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const actionLabel = t(enabled ? 'childVoice.parentDisable' : 'childVoice.parentEnable');

  return (
    <Card testID="parent-voice-permission-panel" variant={enabled ? 'water' : 'paper'}>
      <View style={[styles.heading, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View aria-hidden style={styles.voiceMark} />
        <View style={styles.copy}>
          <Text accessibilityRole="header" color="forest" variant="heading">
            {t('childVoice.parentTitle')}
          </Text>
          <Text color="inkMuted">{t('childVoice.parentBody')}</Text>
          <Text color="mangrove" variant="caption">
            {t('childVoice.disclosure')}
          </Text>
        </View>
      </View>

      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.status,
          direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
          enabled ? styles.statusEnabled : styles.statusDisabled,
        ]}
        testID="parent-voice-permission-status"
      >
        <View
          aria-hidden
          style={[styles.statusDot, enabled ? styles.statusDotEnabled : styles.statusDotDisabled]}
        />
        <Text color={enabled ? 'forest' : 'inkMuted'} variant="label">
          {t(enabled ? 'childVoice.enabled' : 'childVoice.disabled')}
        </Text>
      </View>

      {!enabled ? (
        <Text color="inkMuted" variant="caption">
          {t('childVoice.permissionRequired')}
        </Text>
      ) : null}

      <Button
        accessibilityHint={actionLabel}
        accessibilityLabel={t('childVoice.parentSetting')}
        accessibilityState={{ selected: enabled }}
        onPress={() => onChange(!enabled)}
        testID={enabled ? 'disable-child-voice-button' : 'enable-child-voice-button'}
        variant={enabled ? 'quiet' : 'secondary'}
      >
        {actionLabel}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  copy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  voiceMark: {
    width: spacing.xl,
    height: spacing.xl,
    flexShrink: 0,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.mangrove,
    backgroundColor: colors.waterLight,
  },
  status: {
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusEnabled: {
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
  },
  statusDisabled: {
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  statusDot: {
    width: spacing.xs,
    height: spacing.xs,
    flexShrink: 0,
    borderRadius: radii.pill,
  },
  statusDotEnabled: {
    backgroundColor: colors.success,
  },
  statusDotDisabled: {
    backgroundColor: colors.inkMuted,
  },
});
