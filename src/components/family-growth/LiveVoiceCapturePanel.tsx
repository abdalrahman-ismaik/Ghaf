import { useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { AppState, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Input, Text } from '../primitives';
import { colors, logicalRowDirection, r001Radii, spacing } from '../../design/tokens';
import type { LiveVoiceCaptureState } from '../../features/assistants/liveVoiceCapture';
import type { LiveChildCoachGrant } from '../../models/boundedAi';
import type { LocaleCode, TextDirection } from '../../models/familyGrowth';

interface ActionResult {
  readonly ok: boolean;
}

interface LiveVoiceCapturePanelProps {
  readonly direction: TextDirection;
  readonly grant: LiveChildCoachGrant;
  readonly locale: LocaleCode;
  readonly state: LiveVoiceCaptureState | null;
  readonly onPrepare: (input: {
    readonly voiceSessionId: string;
    readonly requestId: string;
    readonly bindingNonce: string;
  }) => ActionResult;
  readonly onRequestPermission: () => Promise<ActionResult>;
  readonly onStartHold: () => Promise<ActionResult>;
  readonly onStopHold: () => Promise<ActionResult>;
  readonly onEditTranscript: (text: string) => ActionResult;
  readonly onMarkReady: () => ActionResult;
  readonly onDelete: () => Promise<ActionResult>;
  readonly onSend: (input: {
    readonly requestId: string;
    readonly bindingNonce: string;
    readonly intent: 'clarify_step';
  }) => Promise<ActionResult>;
  readonly onCancel: () => Promise<ActionResult>;
}

export function LiveVoiceCapturePanel({
  direction,
  grant,
  locale,
  state,
  onPrepare,
  onRequestPermission,
  onStartHold,
  onStopHold,
  onEditTranscript,
  onMarkReady,
  onDelete,
  onSend,
  onCancel,
}: LiveVoiceCapturePanelProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const pressActiveRef = useRef(false);
  const nativeHoldingRef = useRef(false);
  const stoppingRef = useRef(false);
  const status = state?.envelope.status ?? 'idle';
  const granted = grant.status === 'granted';
  const rowStyle = { flexDirection: logicalRowDirection(direction) } as const;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') void onCancel();
    });
    return () => {
      subscription.remove();
      void onCancel();
    };
  }, [onCancel]);

  const showFailure = () => setError(t('childTask.liveVoiceFailure'));

  const prepare = async () => {
    setError(null);
    const prepared = onPrepare({
      voiceSessionId: Crypto.randomUUID(),
      requestId: Crypto.randomUUID(),
      bindingNonce: Crypto.randomUUID(),
    });
    if (!prepared.ok || !(await onRequestPermission()).ok) showFailure();
  };

  const stopCapture = async () => {
    if (!nativeHoldingRef.current || stoppingRef.current) return;
    stoppingRef.current = true;
    nativeHoldingRef.current = false;
    const stopped = await onStopHold();
    stoppingRef.current = false;
    if (!stopped.ok) showFailure();
  };

  const startCapture = () => {
    pressActiveRef.current = true;
    setError(null);
    void (async () => {
      const started = await onStartHold();
      if (!started.ok) {
        showFailure();
        return;
      }
      nativeHoldingRef.current = true;
      if (!pressActiveRef.current) await stopCapture();
    })();
  };

  const releaseCapture = () => {
    pressActiveRef.current = false;
    void stopCapture();
  };

  const run = async (action: () => ActionResult | Promise<ActionResult>) => {
    setError(null);
    if (!(await action()).ok) showFailure();
  };

  const transcript = state?.transcript;
  const reviewing = status === 'transcript_review' || status === 'ready_to_send';

  return (
    <View style={styles.panel} testID="live-voice-capture-panel">
      <Text brand color="deepForest" direction={direction} variant="screenTitle">
        {t('childTask.liveVoiceTitle')}
      </Text>
      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
        {t('childTask.liveVoiceNotice')}
      </Text>
      <Text brand color="tertiary" direction={direction} variant="caption">
        {t('childTask.liveVoiceNoBackground')} {t('childTask.liveVoiceMaximum')}
      </Text>

      {!granted ? (
        <Text accessibilityLiveRegion="polite" brand color="tertiary" direction={direction}>
          {t('childTask.liveVoiceGrantRequired')}
        </Text>
      ) : !state || status === 'idle' || status === 'permission_denied' || status === 'deleted' ? (
        <>
          {status === 'permission_denied' ? (
            <Text accessibilityLiveRegion="polite" brand color="error" direction={direction}>
              {t('childTask.liveVoiceDenied')}
            </Text>
          ) : null}
          <Button brand direction={direction} onPress={() => void prepare()}>
            {t('childTask.liveVoicePermission')}
          </Button>
        </>
      ) : status === 'requesting_permission' ? (
        <Text accessibilityLiveRegion="polite" brand direction={direction}>
          {t('childTask.liveVoiceRequestingPermission')}
        </Text>
      ) : status === 'ready' || status === 'recording_held' ? (
        <Button
          accessibilityHint={t('childTask.liveVoiceHoldHint')}
          accessibilityState={{ selected: status === 'recording_held' }}
          brand
          direction={direction}
          onPressIn={status === 'ready' ? startCapture : undefined}
          onPressOut={releaseCapture}
          testID="live-voice-hold-button"
          variant={status === 'recording_held' ? 'secondary' : 'primary'}
        >
          <View style={[styles.heldRow, rowStyle]}>
            {status === 'recording_held' ? (
              <View aria-hidden style={styles.activeDot} testID="live-voice-held-indicator" />
            ) : null}
            <Text
              align="center"
              brand
              color={status === 'recording_held' ? 'ghafEmerald' : 'white'}
              direction={direction}
              variant="control"
            >
              {t(
                status === 'recording_held'
                  ? 'childTask.liveVoiceRecording'
                  : 'childTask.liveVoiceHold',
              )}
            </Text>
          </View>
        </Button>
      ) : status === 'transcribing' || status === 'deleting' || status === 'sending_text' ? (
        <Text accessibilityLiveRegion="polite" brand direction={direction}>
          {t(
            status === 'transcribing'
              ? 'childTask.liveVoiceTranscribing'
              : status === 'deleting'
                ? 'childTask.liveVoiceDeleting'
                : 'childTask.liveVoiceSending',
          )}
        </Text>
      ) : reviewing && transcript ? (
        <View style={styles.review} testID="live-voice-transcript">
          <Text brand color="mangroveTeal" direction={direction} variant="label">
            {t('childTask.liveVoiceTranscript')}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('childTask.liveVoiceAudioDeleted')}
          </Text>
          {transcript.origin === 'prepared_synthetic' ? (
            <Text brand color="tertiary" direction={direction} variant="caption">
              {t('childTask.liveVoicePreparedTranscript')}
            </Text>
          ) : null}
          <Input
            accessibilityLabel={t('childTask.liveVoiceTranscript')}
            brand
            direction={direction}
            language={locale}
            maxLength={240}
            multiline
            onChangeText={(value) => {
              if (!onEditTranscript(value).ok) showFailure();
            }}
            testID="live-voice-transcript-input"
            value={transcript.text}
          />
          <View style={[styles.actions, rowStyle]}>
            <Button
              brand
              disabled={status === 'ready_to_send'}
              fullWidth={false}
              onPress={() => void run(onMarkReady)}
              testID="live-voice-approve-text"
              variant="secondary"
            >
              {t('childTask.liveVoiceApproveText')}
            </Button>
            <Button
              brand
              fullWidth={false}
              onPress={() => void run(onDelete)}
              testID="live-voice-delete"
              variant="quiet"
            >
              {t('childTask.liveVoiceDelete')}
            </Button>
          </View>
          <Button
            brand
            disabled={status !== 'ready_to_send'}
            onPress={() =>
              void run(() =>
                onSend({
                  requestId: Crypto.randomUUID(),
                  bindingNonce: Crypto.randomUUID(),
                  intent: 'clarify_step',
                }),
              )
            }
            testID="live-voice-send-text"
          >
            {t('childTask.liveVoiceSendText')}
          </Button>
        </View>
      ) : status === 'terminal' ? (
        <Text accessibilityLiveRegion="polite" brand color="deepForest" direction={direction}>
          {t('childTask.liveVoiceSent')}
        </Text>
      ) : (
        <Text accessibilityLiveRegion="polite" brand color="error" direction={direction}>
          {t('childTask.liveVoiceFailure')}
        </Text>
      )}

      {state ? (
        <Button
          brand
          direction={direction}
          onPress={() => void run(onCancel)}
          testID="live-voice-cancel"
          variant="ghost"
        >
          {t('childTask.liveVoiceCancel')}
        </Button>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="error" direction={direction}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  heldRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.error,
  },
  review: {
    gap: spacing.sm,
  },
  actions: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
