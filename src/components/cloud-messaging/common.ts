import { useTranslation } from 'react-i18next';

import type { createCloudMessagingController } from '@/features/cloud-messaging/controller';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export type CloudMessagingController = ReturnType<typeof createCloudMessagingController>;
export type { CloudMessagingState } from '@/models/cloudMessaging';

export function useMessageCopy() {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  return {
    locale,
    direction,
    text: (key: string, values?: Record<string, unknown>) => t(`cloudMessaging.${key}`, values),
  };
}
