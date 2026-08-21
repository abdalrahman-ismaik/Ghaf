import type { DemoMediaAssetId } from '@/features/missions/demoContent';

/**
 * Metro requires static asset references. Keeping them in one UI-only map makes
 * the prepared demo path explicit and prevents routes from inventing remote URLs.
 */
const bundledMediaSources = {
  'child-evidence': require('../../assets/demo/child-evidence.jpg') as number,
  'family-wisdom-ar': require('../../assets/demo/family-wisdom-ar.mp3') as number,
  'family-wisdom-en': require('../../assets/demo/family-wisdom-en.mp3') as number,
  'food-rescue-bread': require('../../assets/demo/food-rescue-bread.jpg') as number,
  'mission-narration-ar': require('../../assets/demo/mission-narration-ar.mp3') as number,
  'mission-narration-en': require('../../assets/demo/mission-narration-en.mp3') as number,
} as const satisfies Record<DemoMediaAssetId, number>;

/**
 * Single Metro adapter for prepared media IDs. Screens deal in the same IDs exposed by
 * MediaService; a future remote resolver can replace this adapter without changing route logic.
 */
export function resolveDemoMediaSource(id: DemoMediaAssetId): number {
  return bundledMediaSources[id];
}
