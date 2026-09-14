import { useEffect, useRef, useState } from 'react';

import { Text } from '@/components/primitives';
import type { CloudFamilyController } from '@/features/cloud-family';
import type { CloudFamilySnapshot, CloudFamilyTask } from '@/models/cloudFamily';
import type { ParentAccountService } from '@/models/parentAccount';

import { CloudAction, CloudActions, CloudField, CloudSection, useCloudCopy } from './common';

export function CloudMaintenancePrompt({
  snapshot,
  task,
  service,
  controller,
  disabled,
}: {
  readonly snapshot: CloudFamilySnapshot;
  readonly task: CloudFamilyTask;
  readonly service?: ParentAccountService;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
}) {
  const { text } = useCloudCopy();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const confirmed = snapshot.recognitions.filter(
    (receipt) =>
      receipt.childId === task.childId &&
      snapshot.tasks.some(
        (prior) => prior.id === receipt.taskId && prior.catalogId === task.catalogId,
      ),
  ).length;
  const eligible =
    snapshot.actor.role === 'parent' &&
    task.status === 'assigned' &&
    task.template.recognitionMode === 'fade_first' &&
    task.template.recurrence === 'recurrent' &&
    task.template.routinePhase === 'acquisition' &&
    confirmed >= 3;
  if (!eligible) return null;
  const submit = async () => {
    if (disabled || busy || !password || !service?.reauthenticate) return;
    setBusy(true);
    setError(false);
    try {
      await service.reauthenticate(password);
      if (!mounted.current) return;
      const saved = await controller.command({
        type: 'begin_maintenance',
        taskId: task.id,
        expectedRevision: task.revision,
      });
      if (mounted.current) {
        setError(!saved);
        if (saved) setOpen(false);
      }
    } catch {
      if (mounted.current) setError(true);
    } finally {
      if (mounted.current) {
        setPassword('');
        setBusy(false);
      }
    }
  };
  return (
    <CloudSection title={text('maintenanceTitle')} testID="cloud-maintenance-review">
      <Text brand>{text('maintenanceBody')}</Text>
      {open ? (
        <>
          <CloudField
            label={text('parentPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled && !busy}
            maxLength={256}
            testID="cloud-maintenance-password"
          />
          {error ? (
            <Text brand accessibilityRole="alert">
              {text('reauthFailed')}
            </Text>
          ) : null}
          <CloudActions>
            <CloudAction
              disabled={disabled || busy || !password || !service?.reauthenticate}
              onPress={() => void submit()}
              testID="cloud-maintenance-confirm"
            >
              {text('maintenanceConfirm')}
            </CloudAction>
            <CloudAction
              disabled={busy}
              variant="quiet"
              onPress={() => {
                setOpen(false);
                setPassword('');
                setError(false);
              }}
            >
              {text('cancel')}
            </CloudAction>
          </CloudActions>
        </>
      ) : (
        <CloudAction
          disabled={disabled || !service?.reauthenticate}
          variant="secondary"
          onPress={() => setOpen(true)}
        >
          {text('maintenanceReview')}
        </CloudAction>
      )}
    </CloudSection>
  );
}
