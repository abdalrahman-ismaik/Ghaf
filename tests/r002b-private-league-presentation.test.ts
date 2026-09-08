import { describe, expect, it } from 'vitest';

import { buildPrivateLeaguePresentation } from '@/features/league/presentation';
import { createInitialPrototypeSession, createResetSourceSession } from '@/services/mock/fixtures';

describe('R002b private League presentation', () => {
  it('derives the approved synthetic reset week through the strict League projector', () => {
    const session = createInitialPrototypeSession();

    const result = buildPrivateLeaguePresentation({
      activeProfileId: session.activeChildId,
      journey: session.journey,
      recognitionLedger: session.recognitionLedger,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data).toMatchObject({
      activeProfileId: 'child_salem',
      leavesPerWeek: 5,
      origin: 'synthetic_local',
      weekKey: '2026-W36',
    });
    expect(result.data.activeParticipant).toMatchObject({
      completedLeafCount: 4,
      isActiveProfile: true,
      nickname: { ar: 'سالم', en: 'Salem' },
      position: 1,
      score: 80,
    });
    expect(result.data.participants).toEqual([
      expect.objectContaining({
        nickname: expect.objectContaining({ en: 'Salem' }),
        position: 1,
        score: 80,
      }),
      expect.objectContaining({
        nickname: expect.objectContaining({ en: 'Alya' }),
        position: 1,
        score: 80,
      }),
      expect.objectContaining({
        nickname: expect.objectContaining({ en: 'Noura' }),
        position: 3,
        score: 60,
      }),
    ]);
  });

  it('derives only Salem fifth Leaf from the exact recognized P0 receipt', () => {
    const reset = createInitialPrototypeSession();
    const recognized = createResetSourceSession('recognized');

    const before = buildPrivateLeaguePresentation({
      activeProfileId: reset.activeChildId,
      journey: reset.journey,
      recognitionLedger: reset.recognitionLedger,
    });
    const after = buildPrivateLeaguePresentation({
      activeProfileId: recognized.activeChildId,
      journey: recognized.journey,
      recognitionLedger: recognized.recognitionLedger,
    });

    if (!before.ok || !after.ok) throw new Error('Expected deterministic League fixtures');
    expect(before.data.activeParticipant).toMatchObject({ completedLeafCount: 4, score: 80 });
    expect(after.data.activeParticipant).toMatchObject({
      completedLeafCount: 5,
      position: 1,
      score: 100,
    });
    expect(after.data.participants.find((row) => row.nickname.en === 'Alya')).toMatchObject({
      completedLeafCount: 4,
      score: 80,
    });
  });

  it('does not credit an unrelated or malformed receipt and never mutates its input', () => {
    const recognized = createResetSourceSession('recognized');
    const original = structuredClone(recognized);
    const canonicalKey = Object.keys(recognized.recognitionLedger)[0]!;
    const canonicalReceipt = recognized.recognitionLedger[canonicalKey]!;
    const malformed = {
      ...recognized,
      recognitionLedger: {
        [canonicalKey]: {
          ...canonicalReceipt,
          seedTransaction: canonicalReceipt.seedTransaction
            ? { ...canonicalReceipt.seedTransaction, childId: 'child_alya' as const }
            : null,
        },
      },
    };

    const result = buildPrivateLeaguePresentation({
      activeProfileId: malformed.activeChildId,
      journey: malformed.journey,
      recognitionLedger: malformed.recognitionLedger,
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        activeParticipant: { completedLeafCount: 4, score: 80 },
      },
    });
    expect(recognized).toEqual(original);
  });

  it('rejects a structurally similar receipt without the exact projection provenance', () => {
    const recognized = createResetSourceSession('recognized');
    const canonicalKey = Object.keys(recognized.recognitionLedger)[0]!;
    const canonicalReceipt = recognized.recognitionLedger[canonicalKey]!;
    const forged = {
      ...recognized,
      recognitionLedger: {
        [canonicalKey]: {
          ...canonicalReceipt,
          canopyContribution: canonicalReceipt.canopyContribution
            ? { ...canonicalReceipt.canopyContribution, origin: 'prepared' }
            : null,
        },
      },
    } as unknown as typeof recognized;

    const result = buildPrivateLeaguePresentation({
      activeProfileId: forged.activeChildId,
      journey: forged.journey,
      recognitionLedger: forged.recognitionLedger,
    });

    expect(result).toMatchObject({
      ok: true,
      data: { activeParticipant: { completedLeafCount: 4, score: 80 } },
    });
  });

  it('marks only the active profile without exposing private task or reward fields', () => {
    const session = createInitialPrototypeSession();
    const result = buildPrivateLeaguePresentation({
      activeProfileId: 'child_alya',
      journey: session.journey,
      recognitionLedger: session.recognitionLedger,
    });

    if (!result.ok) throw new Error(result.error.message);
    expect(result.data.activeParticipant.nickname.en).toBe('Alya');
    expect(result.data.participants.filter((row) => row.isActiveProfile)).toHaveLength(1);
    for (const row of result.data.participants) {
      expect(Object.keys(row).sort()).toEqual([
        'completedLeafCount',
        'isActiveProfile',
        'nickname',
        'position',
        'score',
        'treeAvatarToken',
      ]);
      expect(JSON.stringify(row)).not.toMatch(
        /task|seed|badge|media|reflection|parentNote|completionTime|familyReward/iu,
      );
    }
  });

  it('fails closed when the active Child is outside the private League fixture', () => {
    const session = createInitialPrototypeSession();
    const result = buildPrivateLeaguePresentation({
      activeProfileId: 'child_unknown' as never,
      journey: session.journey,
      recognitionLedger: session.recognitionLedger,
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT', fallbackAvailable: true },
    });
  });
});
