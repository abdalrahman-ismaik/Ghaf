import type { ImageSourcePropType } from 'react-native';

import type { PreparedMediaFixture } from '@/models/familyGrowth';

const preparedMediaSources = {
  fixture_recycling_clean_v1:
    require('../../assets/images/fixture-recycling-clean-v1.png') as number,
  fixture_salem_plan_ar_v1: null,
} as const satisfies Record<PreparedMediaFixture['id'], ImageSourcePropType | null>;

// Resolve the two reviewed media fixtures without breaking Metro bundling.
export function resolvePreparedMediaSource(
  id: PreparedMediaFixture['id'],
): ImageSourcePropType | null {
  return preparedMediaSources[id];
}
