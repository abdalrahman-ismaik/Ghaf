import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import type { ChildVoiceCommand, ChildVoiceView } from '@/features/assistants/childVoiceController';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface SyntheticVoicePanelProps {
  view: ChildVoiceView;
  onCommand: (command: ChildVoiceCommand) => void;
}

export function SyntheticVoicePanel({ view, onCommand }: SyntheticVoicePanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const transcript = view.transcript ? localize(view.transcript, locale) : null;
  const rowStyle = direction === 'rtl' ? styles.rowRtl : styles.rowLtr;
  const canReviewPlayback = view.availability === 'review' || view.availability === 'sent';
  const canReset =
    view.availability === 'ready' ||
    view.availability === 'active' ||
    view.availability === 'review' ||
    view.availability === 'sent';

  const updatePlayback = (
    captionsEnabled: boolean,
    playbackRate: ChildVoiceView['playbackRate'],
  ) => {
    onCommand({ type: 'playback', captionsEnabled, playbackRate });
  };

  return (
    <Card testID="synthetic-voice-panel" variant="water">
      <View style={[styles.heading, rowStyle]}>
        <View aria-hidden style={styles.voiceMark}>
          <View style={styles.voiceMarkBarShort} />
          <View style={styles.voiceMarkBarTall} />
          <View style={styles.voiceMarkBarShort} />
        </View>
        <View style={styles.copy}>
          <Text accessibilityRole="header" color="forest" variant="heading">
            {t('childVoice.title')}
          </Text>
          <Text color="inkMuted">{t('childVoice.disclosure')}</Text>
          <Text color="mangrove" variant="caption">
            {t('common.synthetic')} · {t('common.prepared')}
          </Text>
        </View>
      </View>

      <View
        accessibilityLiveRegion="polite"
        style={styles.state}
        testID={`child-voice-state-${view.availability}`}
      >
        {view.availability === 'parent_permission_required' ? (
          <>
            <Text color="forest" variant="label">
              {t('childVoice.disabled')}
            </Text>
            <Text color="inkMuted">{t('childVoice.permissionRequired')}</Text>
          </>
        ) : null}

        {view.availability === 'task_required' ? (
          <>
            <Text color="forest" variant="label">
              {t('childVoice.enabled')}
            </Text>
            <Text color="inkMuted">{t('childVoice.taskRequired')}</Text>
          </>
        ) : null}

        {view.availability === 'ready' ? (
          <>
            <Text color="forest" variant="label">
              {t('childVoice.ready')}
            </Text>
            <Button onPress={() => onCommand({ type: 'start' })} testID="child-voice-start-button">
              {t('childVoice.start')}
            </Button>
          </>
        ) : null}

        {view.availability === 'active' ? (
          <>
            <View style={[styles.activeStatus, rowStyle]} testID="child-voice-active-indicator">
              {view.activeIndicatorVisible ? <View aria-hidden style={styles.activeDot} /> : null}
              <Text color="forest" variant="label">
                {t('childVoice.active')}
              </Text>
            </View>
            <Text color="inkMuted">{t('childVoice.activeHelp')}</Text>
            <Button onPress={() => onCommand({ type: 'stop' })} testID="child-voice-stop-button">
              {t('childVoice.stop')}
            </Button>
          </>
        ) : null}

        {view.availability === 'review' ? (
          <>
            <Text color="forest" variant="label">
              {t('childVoice.reviewTitle')}
            </Text>
            <Text color="inkMuted">{t('childVoice.reviewBody')}</Text>
          </>
        ) : null}

        {view.availability === 'sent' ? (
          <Text color="forest" variant="label">
            {t('childVoice.sent')}
          </Text>
        ) : null}
      </View>

      {canReviewPlayback ? (
        <>
          <View style={styles.transcript} testID="child-voice-transcript">
            <Text color="mangrove" variant="caption">
              {t('childVoice.transcriptLabel')}
            </Text>
            {transcript ? (
              <Text language={locale}>{transcript}</Text>
            ) : (
              <Text color="danger">{t('childVoice.error')}</Text>
            )}
          </View>

          <Text color="inkMuted" variant="caption">
            {t('childVoice.simulatedPlayback')}
          </Text>

          <View style={[styles.actionGrid, rowStyle]}>
            <Button
              accessibilityState={{ selected: view.captionsEnabled }}
              fullWidth={false}
              onPress={() => updatePlayback(!view.captionsEnabled, view.playbackRate)}
              style={styles.action}
              testID="child-voice-captions-button"
              variant={view.captionsEnabled ? 'secondary' : 'quiet'}
            >
              {t('childVoice.captions')}
            </Button>
            <Button
              accessibilityState={{ selected: view.playbackRate === 0.75 }}
              fullWidth={false}
              onPress={() => updatePlayback(view.captionsEnabled, 0.75)}
              style={styles.action}
              testID="child-voice-slower-button"
              variant={view.playbackRate === 0.75 ? 'secondary' : 'quiet'}
            >
              <View style={styles.rateLabel}>
                <Text align="center" color="forest" variant="label">
                  {t('childVoice.slower')}
                </Text>
                <Text align="center" color="forest" direction="ltr" language="en" variant="caption">
                  0.75×
                </Text>
              </View>
            </Button>
            <Button
              accessibilityState={{ selected: view.playbackRate === 1 }}
              fullWidth={false}
              onPress={() => updatePlayback(view.captionsEnabled, 1)}
              style={styles.action}
              testID="child-voice-standard-speed-button"
              variant={view.playbackRate === 1 ? 'secondary' : 'quiet'}
            >
              <View style={styles.rateLabel}>
                <Text align="center" color="forest" variant="label">
                  {t('childVoice.standardSpeed')}
                </Text>
                <Text align="center" color="forest" direction="ltr" language="en" variant="caption">
                  1×
                </Text>
              </View>
            </Button>
          </View>

          <View style={styles.replayStatus}>
            <Text color="inkMuted" variant="caption">
              {t('childVoice.replayCount', { count: view.replayCount })}
            </Text>
            <Button
              fullWidth={false}
              onPress={() => onCommand({ type: 'replay' })}
              testID="child-voice-replay-button"
              variant="secondary"
            >
              {t('childVoice.replay')}
            </Button>
          </View>
        </>
      ) : null}

      {view.availability === 'review' ? (
        <>
          <Text color="inkMuted" variant="caption">
            {t('childVoice.rehearsalOnly')}
          </Text>
          <View style={[styles.actionGrid, rowStyle]}>
            <Button
              fullWidth={false}
              onPress={() => onCommand({ type: 'delete' })}
              style={styles.action}
              testID="child-voice-delete-button"
              variant="quiet"
            >
              {t('childVoice.delete')}
            </Button>
            <Button
              fullWidth={false}
              onPress={() => onCommand({ type: 'send' })}
              style={styles.action}
              testID="child-voice-send-button"
            >
              {t('childVoice.send')}
            </Button>
          </View>
        </>
      ) : null}

      {canReset ? (
        <Button
          onPress={() => onCommand({ type: 'reset' })}
          testID="child-voice-reset-button"
          variant="quiet"
        >
          {t('childVoice.reset')}
        </Button>
      ) : null}
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
    width: spacing.xxl,
    height: spacing.xxl,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.surface,
  },
  voiceMarkBarShort: {
    width: 2,
    height: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.mangrove,
  },
  voiceMarkBarTall: {
    width: 2,
    height: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.mangrove,
  },
  state: {
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  activeStatus: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeDot: {
    width: spacing.sm,
    height: spacing.sm,
    flexShrink: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
  },
  transcript: {
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.ivory,
    padding: spacing.md,
  },
  actionGrid: {
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  action: {
    minWidth: 0,
    flexGrow: 1,
    flexBasis: 160,
  },
  rateLabel: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  replayStatus: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
});
