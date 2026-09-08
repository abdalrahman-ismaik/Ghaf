import { officialGhafRasterLogoSource } from '@/components/brand/GhafRasterLogo';
import { parentAccessPortraitSource } from '@/components/access/parentAccessAssets';
import { childAccessPortraitSource } from '@/components/access/childAccessAssets';
import {
  accessFieldArtworkSource,
  artworkSources,
  botanicalAvatarArtworkIds,
  onboardingArtworkIds,
  sectionTransitionArtworkSource,
  taskArtworkSource,
  welcomeArtworkSource,
} from '@/components/illustrations/illustrationSources';

import { loadLocalImage, type AssetModule } from './loadLocalImage';
import { settleStartupImageSources, type StartupImageProgress } from './settleStartupImageSources';

function uniqueImageSources(sources: readonly AssetModule[]): AssetModule[] {
  return Array.from(new Set(sources));
}

const onboardingImageSources = onboardingArtworkIds.map((id) => artworkSources[id]);
const botanicalAvatarImageSources = Object.values(botanicalAvatarArtworkIds).map(
  (id) => artworkSources[id],
);

export const startupCriticalImageSources = [
  officialGhafRasterLogoSource,
  sectionTransitionArtworkSource,
] as const satisfies readonly AssetModule[];

export const startupImageSources = uniqueImageSources([
  ...startupCriticalImageSources,
  ...onboardingImageSources,
  welcomeArtworkSource,
]);
export const startupImageTotal = startupImageSources.length;

const remainingImageSources = startupImageSources.filter(
  (source) => !startupCriticalImageSources.includes(source),
);

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

export type DynamicImageSection =
  'parent-access' | 'child-access' | 'parent-experience' | 'child-experience';

export interface SectionImageLoadResult {
  readonly failed: number;
  readonly total: number;
}

export const sectionImageSources: Readonly<Record<DynamicImageSection, readonly AssetModule[]>> = {
  'parent-access': [parentAccessPortraitSource, ...botanicalAvatarImageSources],
  'child-access': [childAccessPortraitSource, ...botanicalAvatarImageSources],
  'parent-experience': [accessFieldArtworkSource],
  'child-experience': [accessFieldArtworkSource, taskArtworkSource],
};

const sectionImageLoads = new Map<DynamicImageSection, Promise<SectionImageLoadResult>>();

export function preloadSectionImages(
  section: DynamicImageSection,
): Promise<SectionImageLoadResult> {
  const existing = sectionImageLoads.get(section);
  if (existing) return existing;

  const sources = uniqueImageSources(sectionImageSources[section]);
  const pending = Promise.allSettled(sources.map((source) => loadLocalImage(source))).then(
    (results) => ({
      failed: results.filter((result) => result.status === 'rejected').length,
      total: results.length,
    }),
  );
  sectionImageLoads.set(section, pending);
  return pending;
}

export type { StartupImageProgress } from './settleStartupImageSources';
