import type {
  GardenStage,
  LandscapeGrowth,
  LandscapeProgress,
  RecognitionReceipt,
  SyntheticChildId,
  TaskJourney,
} from '@/models/familyGrowth';

const PRESENTABLE_GARDEN_STAGES: readonly GardenStage[] = [
  'seed',
  'shoot',
  'sapling',
  'shade',
  'flourishing',
];

interface ActiveGardenRecognitionInput {
  activeChildId: SyntheticChildId;
  journey: TaskJourney | null;
  recognitionLedger: Readonly<Record<string, RecognitionReceipt>>;
}

export interface ActiveGardenRecognition {
  growth: LandscapeGrowth | null;
  journey: TaskJourney;
  receipt: RecognitionReceipt;
  recognitionKey: string;
}

export function resolveActiveGardenRecognition({
  activeChildId,
  journey,
  recognitionLedger,
}: ActiveGardenRecognitionInput): ActiveGardenRecognition | null {
  if (
    journey?.lifecycle !== 'recognized' ||
    journey.task.targetChildId !== activeChildId ||
    journey.assignment?.childId !== activeChildId ||
    !journey.checkIn?.recognitionKey
  ) {
    return null;
  }

  const recognitionKey = journey.checkIn.recognitionKey;
  const receipt = recognitionLedger[recognitionKey] ?? null;
  if (
    !receipt ||
    receipt.recognitionKey !== recognitionKey ||
    receipt.checkInId !== journey.checkIn.id ||
    (receipt.seedTransaction !== null && receipt.seedTransaction.childId !== activeChildId)
  ) {
    return null;
  }

  return {
    growth: receipt.landscapeGrowth,
    journey,
    receipt,
    recognitionKey,
  };
}

export function deriveLandscapeDisplayTarget(
  progress: LandscapeProgress,
  matchingGrowth: LandscapeGrowth | null,
): number | null {
  const current = progress.cumulativeSeeds;
  if (
    !Number.isFinite(current) ||
    current < 0 ||
    !PRESENTABLE_GARDEN_STAGES.includes(progress.stage)
  ) {
    return null;
  }

  const provenExactCrossing =
    matchingGrowth?.landscapeId === progress.landscapeId &&
    matchingGrowth.seedsAfter === current &&
    matchingGrowth.crossedThreshold === current
      ? matchingGrowth.crossedThreshold
      : null;
  if (provenExactCrossing !== null) return provenExactCrossing;

  const next = progress.nextThreshold;
  if (next === null) return Math.max(current, 1);
  if (!Number.isFinite(next) || next <= current) return null;
  return next;
}
