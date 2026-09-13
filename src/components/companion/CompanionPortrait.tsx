import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/primitives';
import { botanical } from '@/design/tokens';

export function CompanionPortrait() {
  const [failed, setFailed] = useState(false);
  const { t } = useTranslation();
  return (
    <View style={styles.frame} testID="task-helper-portrait">
      {failed ? (
        <Text brand variant="caption">
          {t('messaging.portraitFallback')}
        </Text>
      ) : (
        <Image
          accessible={false}
          source={require('../../../assets/images/companion/task-helper.png')}
          resizeMode="contain"
          style={styles.image}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 96,
    minHeight: 96,
    alignSelf: 'center',
    backgroundColor: botanical.colors.paper,
    borderRadius: botanical.radius.control,
  },
  image: { width: 96, height: 96 },
});
