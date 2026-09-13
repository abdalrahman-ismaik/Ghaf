import { describe, expect, it } from 'vitest';

import {
  deriveLandscapeDisplayTarget,
  resolveActiveGardenRecognition,
} from '../../src/features/garden/presentation';
import type { LandscapeProgress, RecognitionReceipt } from '../../src/models/familyGrowth';
import { createResetSourceSession } from '../../src/services/mock/fixtures';

function recognizedFixture() {
  const session = createResetSourceSession('recognized');
  const recognitionKey = session.journey?.checkIn?.recognitionKey;
  if (!session.journey || !recognitionKey) throw new Error('Recognized fixture is incomplete');
  const receipt = session.recognitionLedger[recognitionKey];
  if (!receipt) throw new Error('Recognized fixture receipt is missing');
  return { journey: session.journey, receipt, session };
}

describe('R002a Garden presentation selectors', () => {
  it('resolves the receipt through the active profile and journey identity chain', () => {
    const { journey, receipt } = recognizedFixture();
    const staleReceipt: RecognitionReceipt = {
      ...receipt,
      recognitionKey: 'recognition:stale-submission',
      checkInId: 'checkin_stale',
    };
    const recognitionLedger = {
      [staleReceipt.recognitionKey]: staleReceipt,
      [receipt.recognitionKey]: receipt,
    };

    expect(
      resolveActiveGardenRecognition({
        activeChildId: 'child_salem',
        journey,
        recognitionLedger,
      }),
    ).toEqual({
      journey,
      recognitionKey: receipt.recognitionKey,
      receipt,
      growth: receipt.landscapeGrowth,
    });
  });

  it('does not expose another profile’s cause, receipt, or reveal', () => {
    const { journey, session } = recognizedFixture();

    expect(
      resolveActiveGardenRecognition({
        activeChildId: 'child_alya',
        journey,
        recognitionLedger: session.recognitionLedger,
      }),
    ).toBeNull();
  });

  it('fails closed for a mismatched check-in or Seed recipient', () => {
    const { journey, receipt } = recognizedFixture();
    const wrongCheckIn = { ...receipt, checkInId: 'checkin_other' };
    const wrongChild = {
      ...receipt,
      seedTransaction: receipt.seedTransaction
        ? { ...receipt.seedTransaction, childId: 'child_alya' as const }
        : null,
    };

    expect(
      resolveActiveGardenRecognition({
        activeChildId: 'child_salem',
        journey,
        recognitionLedger: { [receipt.recognitionKey]: wrongCheckIn },
      }),
    ).toBeNull();
    expect(
      resolveActiveGardenRecognition({
        activeChildId: 'child_salem',
        journey,
        recognitionLedger: { [receipt.recognitionKey]: wrongChild },
      }),
    ).toBeNull();
  });

  it('keeps a valid recognition-only receipt but exposes no Garden-growth consequence', () => {
    const { journey, receipt } = recognizedFixture();
    const recognitionOnlyReceipt: RecognitionReceipt = {
      ...receipt,
      seedTransaction: null,
      landscapeGrowth: null,
      canopyContribution: null,
      circleEvent: null,
    };

    expect(
      resolveActiveGardenRecognition({
        activeChildId: 'child_salem',
        journey,
        recognitionLedger: { [receipt.recognitionKey]: recognitionOnlyReceipt },
      }),
    ).toMatchObject({ receipt: recognitionOnlyReceipt, growth: null });
  });

  it('pins only a proven exact crossing and otherwise follows the live track selector', () => {
    const { receipt } = recognizedFixture();
    const progressAtCrossing: LandscapeProgress = {
      landscapeId: 'mangrove',
      cumulativeSeeds: 60,
      stage: 'sapling',
      nextThreshold: 120,
    };
    const progressAfterCrossing: LandscapeProgress = {
      ...progressAtCrossing,
      cumulativeSeeds: 72,
    };
    const terminal: LandscapeProgress = {
      landscapeId: 'mangrove',
      cumulativeSeeds: 220,
      stage: 'flourishing',
      nextThreshold: null,
    };

    expect(deriveLandscapeDisplayTarget(progressAtCrossing, receipt.landscapeGrowth)).toBe(60);
    expect(deriveLandscapeDisplayTarget(progressAfterCrossing, receipt.landscapeGrowth)).toBe(120);
    expect(deriveLandscapeDisplayTarget(terminal, null)).toBe(220);
  });

  it('returns no target for malformed rehydrated progress', () => {
    const malformed = {
      landscapeId: 'mangrove',
      cumulativeSeeds: Number.NaN,
      stage: 'shoot',
      nextThreshold: 60,
    } as LandscapeProgress;

    expect(deriveLandscapeDisplayTarget(malformed, null)).toBeNull();
    expect(
      deriveLandscapeDisplayTarget(
        {
          ...malformed,
          cumulativeSeeds: 48,
          nextThreshold: Number.NaN,
        } as unknown as LandscapeProgress,
        null,
      ),
    ).toBeNull();
    expect(
      deriveLandscapeDisplayTarget(
        { ...malformed, cumulativeSeeds: 48, nextThreshold: 48 } as unknown as LandscapeProgress,
        null,
      ),
    ).toBeNull();
    expect(
      deriveLandscapeDisplayTarget(
        { ...malformed, cumulativeSeeds: 48, nextThreshold: 60, stage: 'unknown' as 'shoot' },
        null,
      ),
    ).toBeNull();
  });
});
