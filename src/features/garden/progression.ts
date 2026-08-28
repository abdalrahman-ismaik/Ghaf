import type {
  DomainResult,
  FixedSeedAward,
  GardenStage,
  LandscapeGrowth,
  LandscapeProgress,
} from '../../models/familyGrowth';

const THRESHOLDS = [20, 60, 120, 200] as const;
const ALLOWED_AWARDS = new Set<number>([4, 6, 8, 12, 15]);

function assertCumulativeSeeds(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Cumulative Seeds must be a non-negative integer');
  }
}

export function stageForSeeds(cumulativeSeeds: number): GardenStage {
  assertCumulativeSeeds(cumulativeSeeds);
  if (cumulativeSeeds >= 200) return 'flourishing';
  if (cumulativeSeeds >= 120) return 'shade';
  if (cumulativeSeeds >= 60) return 'sapling';
  if (cumulativeSeeds >= 20) return 'shoot';
  return 'seed';
}

export function nextThresholdForSeeds(cumulativeSeeds: number): 20 | 60 | 120 | 200 | null {
  assertCumulativeSeeds(cumulativeSeeds);
  return THRESHOLDS.find((threshold) => cumulativeSeeds < threshold) ?? null;
}

function invalid(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export function planLandscapeGrowth(input: {
  readonly landscape: LandscapeProgress;
  readonly seedAmount: FixedSeedAward;
}): DomainResult<LandscapeGrowth> {
  const { landscape, seedAmount } = input;
  if (
    !Number.isInteger(seedAmount) ||
    seedAmount <= 0 ||
    !ALLOWED_AWARDS.has(seedAmount) ||
    !Number.isInteger(landscape.cumulativeSeeds) ||
    landscape.cumulativeSeeds < 0
  ) {
    return invalid('Landscape growth requires a positive fixed Seed award');
  }

  const expectedStage = stageForSeeds(landscape.cumulativeSeeds);
  const expectedNextThreshold = nextThresholdForSeeds(landscape.cumulativeSeeds);
  if (landscape.stage !== expectedStage || landscape.nextThreshold !== expectedNextThreshold) {
    return invalid('Landscape progress does not match the deterministic stage thresholds');
  }

  const seedsAfter = landscape.cumulativeSeeds + seedAmount;
  const stageAfter = stageForSeeds(seedsAfter);
  const crossedThreshold =
    THRESHOLDS.find(
      (threshold) => landscape.cumulativeSeeds < threshold && seedsAfter >= threshold,
    ) ?? null;

  return {
    ok: true,
    data: {
      landscapeId: landscape.landscapeId,
      seedsBefore: landscape.cumulativeSeeds,
      seedsAfter,
      stageBefore: expectedStage,
      stageAfter,
      crossedThreshold,
      symbolicOnly: true,
    },
  };
}
