import { nextThresholdForSeeds, stageForSeeds } from '@/features/garden/progression';
import type {
  CloudChildProgress,
  CloudFamilyProgress,
  CloudFamilySnapshot,
} from '@/models/cloudFamily';
import type { LandscapeId, LandscapeProgress } from '@/models/familyGrowth';

const landscapeIds: readonly LandscapeId[] = ['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove'];

export function selectCloudFamilyProgress(snapshot: CloudFamilySnapshot): CloudFamilyProgress {
  const children: Record<string, CloudChildProgress> = {};
  for (const child of snapshot.children) {
    const receipts = snapshot.recognitions.filter((receipt) => receipt.childId === child.id);
    const landscapes = Object.fromEntries(
      landscapeIds.map((landscapeId) => {
        const cumulativeSeeds = receipts.reduce(
          (total, receipt) => total + (receipt.landscapeId === landscapeId ? receipt.seeds : 0),
          0,
        );
        const landscape: LandscapeProgress = {
          landscapeId,
          cumulativeSeeds,
          stage: stageForSeeds(cumulativeSeeds),
          nextThreshold: nextThresholdForSeeds(cumulativeSeeds),
        };
        return [landscapeId, Object.freeze(landscape)];
      }),
    ) as Record<LandscapeId, LandscapeProgress>;
    children[child.id] = Object.freeze({
      childId: child.id,
      seeds: receipts.reduce((total, receipt) => total + receipt.seeds, 0),
      landscapes: Object.freeze(landscapes),
      recognizedTasks: receipts.length,
    });
  }
  return Object.freeze({
    children: Object.freeze(children),
    canopyContributions: snapshot.familyCanopyContributions,
    scope: 'family',
  });
}
