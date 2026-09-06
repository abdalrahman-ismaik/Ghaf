import { Asset } from 'expo-asset';

import { officialGhafRasterLogoSource } from '@/components/brand/GhafRasterLogo';
import { preparedMediaImageSources } from '@/components/demoAssets';
import {
  artworkSources,
  sectionTransitionArtworkSource,
} from '@/components/illustrations/illustrationSources';

import { settleStartupImageSources, type StartupImageProgress } from './settleStartupImageSources';

type AssetModule = Parameters<typeof Asset.fromModule>[0];

const uniqueImageSources = Array.from(
  new Set<AssetModule>([
    ...Object.values(artworkSources),
    officialGhafRasterLogoSource,
    ...preparedMediaImageSources,
  ]),
);

export const startupCriticalImageSources = [
  officialGhafRasterLogoSource,
  sectionTransitionArtworkSource,
] as const satisfies readonly AssetModule[];

export const startupImageSources = uniqueImageSources;
export const startupImageTotal = startupImageSources.length;

const remainingImageSources = startupImageSources.filter(
  (source) => !startupCriticalImageSources.includes(source),
);

async function loadLocalImage(source: AssetModule): Promise<void> {
  await Asset.fromModule(source).downloadAsync();
}

export function preloadStartupImages(
  onProgress: (progress: StartupImageProgress) => void,
): Promise<StartupImageProgress> {
  return settleStartupImageSources({
    batchSize: 6,
    criticalSources: startupCriticalImageSources,
    loadImage: loadLocalImage,
    onProgress,
    remainingSources: remainingImageSources,
  });
}

export type { StartupImageProgress } from './settleStartupImageSources';
