import { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, motion, r001Radii } from '@/design/tokens';

import { parentAccessPortraitSource } from './parentAccessAssets';

export function ParentAccessPortrait() {
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <View
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={styles.frame}
      testID="parent-access-portrait"
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        contentPosition="center"
        onError={() => setFailed(true)}
        priority="high"
        recyclingKey="parent-access-emirati-family-v2"
        source={parentAccessPortraitSource}
        style={styles.image}
        transition={reduceMotion ? 0 : motion.duration.quick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 3 / 2,
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderRadius: r001Radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
  },
  image: { width: '100%', height: '100%' },
});
