import { View } from 'react-native';

import { Text } from '@/components/primitives';
import { masroofiDemoEnabled } from '@/config/masroofi';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { styles, useMasroofiPresentation } from './shared';

export function MasroofiTaskRewardNotice({
  assignmentId,
  taskVersion,
}: { assignmentId?: string; taskVersion?: number } = {}) {
  const { t, direction, amount } = useMasroofiPresentation();
  const journey = usePrototypeStore((state) => state.journey);
  const masroofi = usePrototypeStore((state) => state.masroofi);
  const getView = usePrototypeStore((state) => state.getMasroofiChild);
  void masroofi;
  if (!masroofiDemoEnabled) return null;
  const currentAssignmentId = assignmentId ?? journey?.assignment?.id;
  const currentVersion = taskVersion ?? journey?.task.version;
  if (!currentAssignmentId || currentVersion === undefined) return null;
  const view = getView();
  if (!view.ok) return null;
  const reward = view.data.transactions.find(
    (item) => item.kind === 'reward' && item.assignmentId === currentAssignmentId,
  );
  const promised = view.data.promisedTasks.some(
    (item) => item.assignmentId === currentAssignmentId && item.taskVersion === currentVersion,
  );
  if (!reward && !promised) return null;
  return (
    <View style={styles.message} testID="masroofi-task-reward-notice">
      <Text brand direction={direction} variant="label">
        {reward
          ? t('masroofi.earnedNotice', { amount: amount(reward.amountFils) })
          : t('masroofi.rewardNotice')}
      </Text>
    </View>
  );
}
