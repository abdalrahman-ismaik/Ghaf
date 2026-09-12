import { StyleSheet, View } from 'react-native';

import { landscapeArtworkIds, LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical, spacing } from '@/design/tokens';
import type { GardenStage, LandscapeId, TextDirection } from '@/models/familyGrowth';

interface ChildTodayLandscapeProps {
  body: string;
  direction: TextDirection;
  landscapeId: LandscapeId;
  stage: GardenStage;
  title: string;
}

export function ChildTodayLandscape({
  body,
  direction,
  landscapeId,
  stage,
  title,
}: ChildTodayLandscapeProps) {
  return (
    <View style={styles.hero} testID="child-today-landscape">
      <LocalIllustration
        assetId={landscapeArtworkIds[landscapeId][stage]}
        decorative
        direction={direction}
        priority="high"
        style={styles.artwork}
      />
      <View style={styles.copy}>
        <Text brand direction={direction} style={styles.title} variant="screenTitle">
          {title}
        </Text>
        <Text brand direction={direction} style={styles.body}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.forest,
  },
  copy: {
    minWidth: 0,
    gap: spacing.xxs,
    padding: botanical.space.inset,
  },
  title: { color: botanical.colors.onForest },
  body: { color: botanical.colors.sageStrong },
  artwork: {
    width: '100%',
    aspectRatio: 2.4,
    backgroundColor: botanical.colors.water,
  },
});
