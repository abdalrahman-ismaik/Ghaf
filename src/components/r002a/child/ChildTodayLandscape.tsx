import { StyleSheet, View } from 'react-native';

import { landscapeArtworkIds, LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
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
    <View
      style={[styles.hero, { flexDirection: logicalRowDirection(direction) }]}
      testID="child-today-landscape"
    >
      <View style={styles.copy}>
        <Text brand direction={direction} style={styles.title} variant="screenTitle">
          {title}
        </Text>
        <Text brand direction={direction} style={styles.body}>
          {body}
        </Text>
      </View>
      <LocalIllustration
        assetId={landscapeArtworkIds[landscapeId][stage]}
        decorative
        direction={direction}
        priority="high"
        style={styles.artwork}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: botanical.space.row,
    borderRadius: botanical.radius.hero,
    backgroundColor: botanical.colors.forest,
    padding: botanical.space.inset,
  },
  copy: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: { color: botanical.colors.onForest },
  body: { color: botanical.colors.onForest },
  artwork: {
    width: 100,
    flexGrow: 1,
    flexBasis: 100,
    height: 120,
    borderRadius: botanical.radius.control,
    overflow: 'hidden',
    backgroundColor: botanical.colors.water,
  },
});
