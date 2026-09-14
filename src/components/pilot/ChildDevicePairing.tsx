import { useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { spacing } from '@/design/tokens';
import type { PilotController } from '@/features/pilot/controller';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function ChildDevicePairing({
  controller,
  busy,
}: {
  controller: PilotController;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [input, setInput] = useState({ token: '', requestId: randomUUID() });
  return (
    <View style={{ gap: spacing.sm }} testID="cloud-child-pairing">
      <Text brand color="deepForest" variant="label">
        {t('cloudAccess.pairTitle')}
      </Text>
      <Text brand color="onSurfaceVariant">
        {t('cloudAccess.pairBody')}
      </Text>
      <AccessTextField
        autoCapitalize="none"
        autoCorrect={false}
        editable={!busy}
        direction={direction}
        language={locale}
        label={t('cloudAccess.token')}
        value={input.token}
        maxLength={256}
        testID="cloud-child-pairing-token"
        onChangeText={(token) => setInput({ token, requestId: randomUUID() })}
      />
      <Button
        brand
        busy={busy}
        disabled={!input.token.trim()}
        onPress={() => void controller.pairChildDevice(input.token.trim(), input.requestId)}
        testID="cloud-child-pairing-submit"
      >
        {t('cloudAccess.pair')}
      </Button>
    </View>
  );
}
