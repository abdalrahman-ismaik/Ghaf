import { preparedMediaImageSources } from '@/components/demoAssets';
import { artworkSources } from '@/components/illustrations/illustrationSources';

import { loadLocalImage, type AssetModule } from './loadLocalImage';
import { sectionImageSources, startupImageSources } from './preloadStartupImages';
import { settleImageSourcesInBatches, type ImageBatchResult } from './settleImageSourcesInBatches';

export const DEFERRED_IMAGE_BATCH_SIZE = 6;

function uniqueImageSources(sources: readonly AssetModule[]): AssetModule[] {
  return Array.from(new Set(sources));
}

const startupSourceSet = new Set<AssetModule>(startupImageSources);
const preparedMediaSourceSet = new Set<AssetModule>(preparedMediaImageSources);
const sectionPriorityImageSources = uniqueImageSources(
  Object.values(sectionImageSources).flat(),
).filter((source) => !startupSourceSet.has(source));
const sectionPrioritySourceSet = new Set<AssetModule>(sectionPriorityImageSources);
const remainingArtworkImageSources = Object.values(artworkSources).filter(
  (source) =>
    !startupSourceSet.has(source) &&
    !sectionPrioritySourceSet.has(source) &&
    !preparedMediaSourceSet.has(source),
);

export const deferredImageSources = uniqueImageSources([
  ...sectionPriorityImageSources,
  ...remainingArtworkImageSources,
  ...preparedMediaImageSources,
]);
export const deferredImageTotal = deferredImageSources.length;

let deferredImageLoad: Promise<ImageBatchResult> | undefined;

export function preloadDeferredImages(): Promise<ImageBatchResult> {
  deferredImageLoad ??= settleImageSourcesInBatches({
    batchSize: DEFERRED_IMAGE_BATCH_SIZE,
    loadImage: loadLocalImage,
    sources: deferredImageSources,
  });
  return deferredImageLoad;
}

export type { ImageBatchResult as DeferredImageLoadResult };
