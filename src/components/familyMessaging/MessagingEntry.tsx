import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MessagingRole } from '@/features/familyMessaging';
import { serviceRegistry } from '@/services';
import { MessageButton, MessageText, styles } from './shared';

export function MessagingEntry({
  role,
  helperDraft = false,
}: {
  role: MessagingRole;
  helperDraft?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={styles.group}>
      <MessageButton
        variant="secondary"
        testID={helperDraft ? 'message-parent-draft' : `messages-entry-${role}`}
        onPress={() => {
          serviceRegistry.familyMessaging.controller.openFor(role, helperDraft);
          router.push('/messages' as Href);
        }}
      >
        {t(role === 'parent' ? 'messaging.parentEntry' : 'messaging.childEntry')}
      </MessageButton>
      <MessageText variant="caption" color="onSurfaceVariant">
        {t(helperDraft ? 'messaging.helperDraft' : 'messaging.entryBody')}
      </MessageText>
    </View>
  );
}
