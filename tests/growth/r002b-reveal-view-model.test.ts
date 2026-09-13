import { describe, expect, it, vi } from 'vitest';

import { createRevealBundlePresentation } from '../../src/features/rewards/r002bRevealViewModel';
import type { RevealBundle } from '../../src/models/revealBundle';

function receipt<TConsequence>(
  id: string,
  authority: string,
  consequence: TConsequence,
): RevealBundle['items'][number] {
  return {
    id,
    authority,
    profileId: 'child_salem',
    profileEpochId: 'profile-epoch-0-child_salem',
    triggerEventId: 'recognition:submission_1',
    triggerKind: 'task_approval',
    status: 'committed',
    committedAt: '2026-09-05T08:00:00.000Z',
    consequence,
  } as RevealBundle['items'][number];
}

function maximalBundle(lifecycle: RevealBundle['lifecycle'] = 'presenting'): RevealBundle {
  return {
    id: 'reveal:child_salem:recognition:submission_1',
    schemaVersion: 'r002b.reveal-bundle.v1',
    profileId: 'child_salem',
    profileEpochId: 'profile-epoch-0-child_salem',
    triggerEventId: 'recognition:submission_1',
    triggerKind: 'task_approval',
    triggeredAt: '2026-09-05T08:00:00.000Z',
    lifecycle,
    sourceFingerprint: 'reveal-source:test',
    audience: 'child',
    items: [
      receipt('receipt:praise', 'parent_check_in', {
        kind: 'parent_praise',
        checkInId: 'check-in-1',
        text: { ar: 'لاحظتُ حرصك في الفرز خطوة بخطوة.', en: 'I noticed your careful sorting.' },
      }),
      receipt('receipt:seed', 'seed_ledger', {
        kind: 'seed',
        transactionId: 'seed-1',
        delta: 12,
        before: 108,
        after: 120,
        meaning: 'symbolic_nonfinancial',
      }),
      receipt('receipt:garden', 'garden', {
        kind: 'plant_stage',
        growthId: 'growth-1',
        landscapeId: 'mangrove',
        seedsBefore: 48,
        seedsAfter: 60,
        stageBefore: 'shoot',
        stageAfter: 'sapling',
        crossedThreshold: 60,
        symbolicOnly: true,
      }),
      receipt('receipt:canopy', 'canopy', {
        kind: 'canopy',
        contributionId: 'canopy-1',
        leavesBefore: 19,
        leavesAfter: 20,
        leafDelta: 1,
        goalLeaves: 25,
        origin: 'synthetic',
      }),
      receipt('receipt:circle', 'green_circle', {
        kind: 'green_circle',
        eventId: 'circle-1',
        actionsBefore: 4,
        actionsAfter: 5,
        actionDelta: 1,
        goal: 12,
        sourceScope: 'household',
        origin: 'synthetic_local',
      }),
      receipt('receipt:league', 'private_league', {
        kind: 'private_league_leaf',
        weekKey: '2026-W36',
        leagueReceiptId: 'league-1',
        leafId: 'leaf-1',
        confirmedLeavesBefore: 0,
        confirmedLeavesAfter: 1,
        leafDelta: 1,
        privacy: 'private_family_league',
      }),
      receipt('receipt:challenge', 'challenge_leaf', {
        kind: 'challenge_leaf',
        weekKey: '2026-W36',
        leafId: 'leaf-1',
        recognitionKey: 'recognition:submission_1',
        state: 'confirmed',
        privacy: 'private_family_league',
      }),
      receipt('receipt:reward', 'family_reward', {
        kind: 'private_family_reward',
        planId: 'reward-1',
        planVersion: 1,
        lifecycleBefore: 'promised',
        lifecycleAfter: 'unlocked',
        privacy: 'child_guardians_only',
      }),
      receipt('receipt:badge', 'achievements', {
        kind: 'earned_badge',
        awardId: 'award-1',
        badgeId: 'badge.journey.expanding_shade.v1',
        newlyEarned: true,
        earnedAt: '2026-09-05T08:00:00.000Z',
        private: true,
        permanent: true,
      }),
      receipt('receipt:station', 'impact_path', {
        kind: 'impact_path_station',
        threshold: 120,
        result: 'archive_mangrove_and_earn_expanding_shade',
        newlyReached: true,
      }),
      receipt('receipt:learning', 'learning', {
        kind: 'unlocked_learning',
        unlockId: 'unlock-1',
        learningId: 'learning.mangrove_roots.v1',
        newlyUnlocked: true,
      }),
      receipt('receipt:help', 'safe_help', {
        kind: 'safe_help',
        recognitionId: 'help-1',
        helpKind: 'asked_adult',
        recognized: true,
      }),
    ],
  };
}

const translate = (key: string, values?: Record<string, string | number>) =>
  `${key}${values ? `:${JSON.stringify(values)}` : ''}`;

describe('R002b RevealBundle presentation view model', () => {
  it('projects every committed consequence exactly once in canonical source order', () => {
    const presentation = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate,
      onAcknowledge: vi.fn(),
      onOpenGrowth: vi.fn(),
    });

    expect(presentation.ok).toBe(true);
    if (!presentation.ok) return;
    expect(presentation.data.screen.items.map((item) => item.kind)).toEqual([
      'parent_praise',
      'seed',
      'plant_stage',
      'canopy',
      'green_circle',
      'private_league_leaf',
      'challenge_leaf',
      'private_family_reward',
      'earned_badge',
      'impact_path_station',
      'unlocked_learning',
      'safe_help',
    ]);
    expect(presentation.data.screen.items[0]?.detail).toBe('I noticed your careful sorting.');
    expect(presentation.data.screen.items[8]?.title).toContain('Expanding Shade');
    expect(presentation.data.screen.items[1]?.value).toContain('12');
    expect(presentation.data.screen.items[1]?.detail).toContain('108');
    expect(presentation.data.screen.items[1]?.detail).toContain('120');
  });

  it('uses truthful task and learning introductions without minting a reward', () => {
    const task = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate,
      onAcknowledge: vi.fn(),
    });
    const badgeReceipt = maximalBundle().items[8]!;
    const learningTriggerId = 'learning:completion_1';
    const learningBundle = {
      ...maximalBundle(),
      id: `reveal:child_salem:${learningTriggerId}`,
      triggerEventId: learningTriggerId,
      triggerKind: 'learning_completion' as const,
      items: [
        {
          ...badgeReceipt,
          id: 'receipt:learning-badge',
          triggerEventId: learningTriggerId,
          triggerKind: 'learning_completion' as const,
        },
      ],
    };
    const learning = createRevealBundlePresentation({
      bundle: learningBundle,
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate,
      onAcknowledge: vi.fn(),
    });

    expect(task.ok && task.data.screen.introduction).toContain('taskApproval');
    expect(learning.ok && learning.data.screen.introduction).toContain('learningCompletion');
    expect(learning.ok && learning.data.screen.items.some((item) => item.kind === 'seed')).toBe(
      false,
    );
  });

  it('fails closed for another profile, epoch, malformed identity, or non-presentable lifecycle', () => {
    const common = {
      profileId: 'child_salem' as const,
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'en' as const,
      direction: 'ltr' as const,
      reducedMotion: false,
      translate,
      onAcknowledge: vi.fn(),
    };

    expect(
      createRevealBundlePresentation({
        ...common,
        bundle: { ...maximalBundle(), profileId: 'child_alya' },
      }),
    ).toMatchObject({ ok: false, reason: 'profile_mismatch' });
    expect(
      createRevealBundlePresentation({
        ...common,
        bundle: { ...maximalBundle(), profileEpochId: 'other-epoch' },
      }),
    ).toMatchObject({ ok: false, reason: 'epoch_mismatch' });
    expect(
      createRevealBundlePresentation({ ...common, bundle: { ...maximalBundle(), id: 'bad-id' } }),
    ).toMatchObject({ ok: false, reason: 'invalid_identity' });
    expect(
      createRevealBundlePresentation({
        ...common,
        bundle: maximalBundle('acknowledged'),
      }),
    ).toMatchObject({ ok: false, reason: 'already_seen' });
  });

  it('exposes acknowledgment and optional validated Growth navigation as presentation actions', () => {
    const onAcknowledge = vi.fn();
    const onOpenGrowth = vi.fn();
    const result = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate,
      onAcknowledge,
      onOpenGrowth,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    result.data.actions.primary.onPress();
    result.data.actions.secondary?.onPress();
    expect(onAcknowledge).toHaveBeenCalledOnce();
    expect(onOpenGrowth).toHaveBeenCalledOnce();
  });

  it('keeps committed local results usable offline and guards busy actions', () => {
    const onAcknowledge = vi.fn();
    const offline = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'en',
      direction: 'ltr',
      reducedMotion: true,
      recoveryState: 'offline',
      translate,
      onAcknowledge,
    });
    const busy = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'en',
      direction: 'ltr',
      reducedMotion: true,
      submitting: true,
      translate,
      onAcknowledge,
    });

    expect(offline.ok && offline.data.actions.primary.disabled).toBe(false);
    if (offline.ok) offline.data.actions.primary.onPress();
    if (busy.ok) busy.data.actions.primary.onPress();
    expect(onAcknowledge).toHaveBeenCalledOnce();
  });

  it('provides a safe recovery action for error state and includes visible status in grouped labels', () => {
    const onAcknowledge = vi.fn();
    const onRecover = vi.fn();
    const result = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      recoveryState: 'error',
      translate,
      onAcknowledge,
      onRecover,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.actions.primary.disabled).toBe(false);
    expect(result.data.actions.primary.label).toContain('recover');
    result.data.actions.primary.onPress();
    expect(onRecover).toHaveBeenCalledOnce();
    expect(onAcknowledge).not.toHaveBeenCalled();
    for (const item of result.data.screen.items.filter((candidate) => candidate.statusLabel)) {
      expect(item.accessibilityLabel).toContain(item.statusLabel);
    }
  });

  it('localizes and isolates the before-after progress range for Arabic RTL', () => {
    const result = createRevealBundlePresentation({
      bundle: maximalBundle(),
      profileId: 'child_salem',
      profileEpochId: 'profile-epoch-0-child_salem',
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate,
      onAcknowledge: vi.fn(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const plant = result.data.screen.items.find((item) => item.kind === 'plant_stage');
    expect(plant?.value).toContain('r002bReveal.item.plant.range');
    expect(plant?.value).toContain('\u2066');
    expect(plant?.value).toContain('\u2069');
  });
});
