import { describe, expect, it } from 'vitest';

import type {
  AchievementEvaluationEvidence,
  AchievementState,
  ParentApprovedAcquisitionEvent,
  SemanticCriterionEvidence,
} from '../../src/models/achievements';
import {
  BADGE_IDS,
  BADGE_REGISTRY,
  MASTERY_LEVELS_AR,
  getBadgeDefinition,
} from '../../src/features/growth/badgeRegistry';
import {
  createEmptyAchievementState,
  evaluateBadgeAwards,
  projectBadgeDetail,
  projectBadgeGallery,
  recordParentApprovedAcquisition,
} from '../../src/features/growth/achievements';

const PROFILE_ID = 'child_salem';
const OTHER_PROFILE_ID = 'child_alya';
const EPOCH_ID = 'reset-epoch-001';
const OTHER_EPOCH_ID = 'reset-epoch-002';
const OCCURRED_AT = '2026-09-05T09:00:00.000Z';
const CANONICAL_STATIONS = [120, 132, 144, 156, 168, 180] as const;

const EXPECTED_REGISTRY = [
  ['badge.journey.seed_start.v1', 'بذرة البداية', 'Seed Start', 'confirmed lifetime Seeds ≥ 12'],
  [
    'badge.journey.growing_branch.v1',
    'غصن نامٍ',
    'Growing Branch',
    'confirmed lifetime Seeds ≥ 60',
  ],
  [
    'badge.journey.expanding_shade.v1',
    'ظلّ يتّسع',
    'Expanding Shade',
    'confirmed lifetime Seeds ≥ 120',
  ],
  [
    'badge.journey.coastal_care.v1',
    'رعاية الساحل',
    'Coastal Care',
    'confirmed lifetime Seeds ≥ 180',
  ],
  [
    'badge.skill.sorting.bud.v1',
    'الفرز الذكي — برعم',
    'Smart Sorting — Bud',
    'sorting acquisition credit ≥ 1',
  ],
  [
    'badge.skill.sorting.branch.v1',
    'الفرز الذكي — غصن',
    'Smart Sorting — Branch',
    'Sorting Bud earned and sorting credit ≥ 3',
  ],
  [
    'badge.skill.sorting.shade.v1',
    'الفرز الذكي — ظل',
    'Smart Sorting — Shade',
    'Sorting Branch earned and sorting credit ≥ 7',
  ],
  [
    'badge.skill.water.bud.v1',
    'ترشيد المياه — برعم',
    'Water Care — Bud',
    'station 156 reached and water credit ≥ 2',
  ],
  [
    'badge.skill.water.branch.v1',
    'ترشيد المياه — غصن',
    'Water Care — Branch',
    'Water Bud earned and water credit ≥ 5',
  ],
  [
    'badge.skill.water.shade.v1',
    'ترشيد المياه — ظل',
    'Water Care — Shade',
    'Water Branch earned and water credit ≥ 10',
  ],
  [
    'badge.skill.energy.bud.v1',
    'ترشيد الطاقة — برعم',
    'Energy Care — Bud',
    'energy acquisition credit ≥ 2',
  ],
  [
    'badge.habitat.ghaf_roots.v1',
    'جذور الغاف',
    'Ghaf Roots',
    '`learning.ghaf_basics.v1` complete and nature credit ≥ 3',
  ],
  [
    'badge.habitat.mangrove_care.v1',
    'رعاية القرم',
    'Mangrove Care',
    'station 132 reached, `learning.mangrove_roots.v1` complete, and coast-care credit ≥ 3',
  ],
  [
    'badge.biodiversity.wetland_exploration.v1',
    'استكشاف الأراضي الرطبة',
    'Wetland Exploration',
    'wetland learning and observation activity complete',
  ],
  [
    'badge.heritage.date_palm_gifts.v1',
    'عطاء النخلة',
    'Gifts of the Date Palm',
    'date-palm learning and Parent-led reuse activity complete',
  ],
  [
    'badge.heritage.sadu_patterns.v1',
    'نقوش السدو',
    'Al-Sadu Patterns',
    'Sadu learning and original-pattern activity complete',
  ],
] as const;

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

function emptyState(profileId = PROFILE_ID, profileEpochId = EPOCH_ID): AchievementState {
  const result = createEmptyAchievementState({ profileId, profileEpochId });
  expectOk(result);
  return result.data;
}

function evidence(
  lifetimeSeeds: number,
  options: {
    readonly reachedStations?: readonly (120 | 132 | 144 | 156 | 168 | 180)[];
    readonly learningIds?: readonly ('learning.ghaf_basics.v1' | 'learning.mangrove_roots.v1')[];
    readonly semanticEvidence?: readonly SemanticCriterionEvidence[];
    readonly profileId?: string;
    readonly profileEpochId?: string;
    readonly exact?: boolean;
  } = {},
): AchievementEvaluationEvidence {
  const profileId = options.profileId ?? PROFILE_ID;
  const profileEpochId = options.profileEpochId ?? EPOCH_ID;
  return {
    lifetimeSeeds: {
      profileId,
      profileEpochId,
      source: 'committed_seed_ledger',
      exact: options.exact ?? true,
      amount: lifetimeSeeds,
      entryIds: ['seed-entry-001'],
    },
    stationProjection: {
      profileId,
      profileEpochId,
      source: 'canonical_impact_path_projection',
      reachedThresholds:
        options.reachedStations ??
        CANONICAL_STATIONS.filter((threshold) => threshold <= lifetimeSeeds),
    },
    learningCompletions: (options.learningIds ?? []).map((learningId, index) => ({
      id: `learning-completion-${index}`,
      profileId,
      profileEpochId,
      learningId,
      status: 'committed' as const,
    })),
    semanticCriterionEvidence: options.semanticEvidence ?? [],
  };
}

function acquisitionEvent(
  occurrence: number,
  skillIds: ParentApprovedAcquisitionEvent['skillIds'],
  overrides: Partial<ParentApprovedAcquisitionEvent> = {},
): ParentApprovedAcquisitionEvent {
  return {
    eventId: `approval-event-${occurrence}`,
    occurrenceId: `task-occurrence-${occurrence}`,
    profileId: PROFILE_ID,
    profileEpochId: EPOCH_ID,
    taskId: `task-fixture-${occurrence}`,
    status: 'committed',
    recognitionMode: 'standard',
    routinePhase: 'acquisition',
    skillIds,
    ...overrides,
  };
}

function addCredits(
  state: AchievementState,
  skillId: NonNullable<ParentApprovedAcquisitionEvent['skillIds']>[number],
  count: number,
): AchievementState {
  let current = state;
  for (let index = 1; index <= count; index += 1) {
    const result = recordParentApprovedAcquisition({
      state: current,
      event: acquisitionEvent(index, [skillId]),
    });
    expectOk(result);
    current = result.data.state;
  }
  return current;
}

function evaluateLive(
  state: AchievementState,
  evaluationEvidence: AchievementEvaluationEvidence,
  triggerEventId = 'evaluation-event-001',
) {
  const result = evaluateBadgeAwards({
    state,
    evidence: evaluationEvidence,
    mode: 'live',
    triggerEventId,
    occurredAt: OCCURRED_AT,
  });
  expectOk(result);
  return result.data;
}

describe('R002b locked badge registry', () => {
  it('contains the exact 16 IDs, labels, order, and criteria with no seventeenth definition', () => {
    expect(BADGE_REGISTRY).toHaveLength(16);
    expect(BADGE_IDS).toHaveLength(16);
    expect(new Set(BADGE_IDS).size).toBe(16);
    expect(
      BADGE_REGISTRY.map((definition) => [
        definition.id,
        definition.label.ar,
        definition.label.en,
        definition.criterionText.en,
      ]),
    ).toEqual(EXPECTED_REGISTRY);
    expect(BADGE_IDS).toEqual(EXPECTED_REGISTRY.map(([id]) => id));
  });

  it('uses exactly the approved Arabic mastery levels', () => {
    expect(MASTERY_LEVELS_AR).toEqual(['برعم', 'غصن', 'ظل']);
  });

  it('deep-freezes definitions and keeps unapproved explanatory copy explicitly pending', () => {
    expect(Object.isFrozen(BADGE_REGISTRY)).toBe(true);
    for (const definition of BADGE_REGISTRY) {
      expect(Object.isFrozen(definition)).toBe(true);
      expect(Object.isFrozen(definition.criteria)).toBe(true);
      expect(definition.whyItMatters).toEqual({
        status: 'pending_human_copy_review',
        ar: null,
        en: null,
      });
      expect(definition.sourceNote.criterionAuthority).toBe('docs/content/BADGE_CATALOG.md');
      expect(definition.sourceNote).toEqual({
        criterionAuthority: 'docs/content/BADGE_CATALOG.md',
        provenanceManifest: 'unavailable',
        contentReview: 'not_run',
        rightsReview: 'not_run',
      });
    }
    expect(getBadgeDefinition('badge.not-real.v1')).toBeNull();
  });

  it('keeps every composite component explicit and does not invent missing package IDs', () => {
    expect(getBadgeDefinition('badge.habitat.mangrove_care.v1')?.criteria).toEqual([
      { kind: 'station_reached', threshold: 132 },
      { kind: 'learning_completed', learningId: 'learning.mangrove_roots.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.coast_care', required: 3 },
    ]);
    for (const badgeId of [
      'badge.biodiversity.wetland_exploration.v1',
      'badge.heritage.date_palm_gifts.v1',
      'badge.heritage.sadu_patterns.v1',
    ] as const) {
      const definition = getBadgeDefinition(badgeId);
      expect(
        definition?.criteria.every((criterion) => criterion.kind === 'semantic_component'),
      ).toBe(true);
      expect(JSON.stringify(definition)).not.toMatch(
        /learning\.(wetland|date_palm|sadu)|activity\./u,
      );
    }
  });
});

describe('R002b profile-scoped acquisition evidence', () => {
  it('maps one canonical recycling approval to separate sorting and coast-care credits once', () => {
    const base = emptyState();
    const event = acquisitionEvent(1, undefined, {
      taskId: 'task_recycling_p0_v1',
    });
    const first = recordParentApprovedAcquisition({ state: base, event });
    const concurrent = recordParentApprovedAcquisition({
      state: base,
      event: structuredClone(event),
    });
    expectOk(first);
    expectOk(concurrent);

    expect(first.data).toEqual(concurrent.data);
    expect(first.data.disposition).toBe('recorded');
    expect(first.data.state.acquisitionCredits.map((credit) => credit.skillId)).toEqual([
      'skill.sorting',
      'skill.coast_care',
    ]);
    expect(new Set(first.data.state.acquisitionCredits.map((credit) => credit.id)).size).toBe(2);
    expect(base.acquisitionCredits).toEqual([]);

    const duplicate = recordParentApprovedAcquisition({
      state: first.data.state,
      event: structuredClone(event),
    });
    expectOk(duplicate);
    expect(duplicate.data.disposition).toBe('already_recorded');
    expect(duplicate.data.state).toBe(first.data.state);
    expect(duplicate.data.addedCreditIds).toEqual([]);
  });

  it('fails closed when a canonical recycling caller supplies a different mastery mapping', () => {
    const base = emptyState();
    expect(
      recordParentApprovedAcquisition({
        state: base,
        event: acquisitionEvent(1, ['skill.water'], {
          taskId: 'task_recycling_p0_v1',
        }),
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
    expect(base.acquisitionCredits).toEqual([]);
  });

  it('deduplicates skill IDs and rejects reuse of either event or occurrence identity', () => {
    const base = emptyState();
    const firstEvent = acquisitionEvent(1, ['skill.water', 'skill.water']);
    const first = recordParentApprovedAcquisition({ state: base, event: firstEvent });
    expectOk(first);
    expect(first.data.state.acquisitionCredits).toHaveLength(1);

    expect(
      recordParentApprovedAcquisition({
        state: first.data.state,
        event: acquisitionEvent(2, ['skill.water'], { eventId: firstEvent.eventId }),
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
    expect(
      recordParentApprovedAcquisition({
        state: first.data.state,
        event: acquisitionEvent(1, ['skill.water'], { eventId: 'different-event' }),
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
    expect(first.data.state.acquisitionCredits).toHaveLength(1);
  });

  it('rejects ambiguous occurrence reuse, partial data, and non-acquisition evidence atomically', () => {
    const base = emptyState();
    const valid = acquisitionEvent(1, ['skill.water']);
    const first = recordParentApprovedAcquisition({ state: base, event: valid });
    expectOk(first);

    expect(
      recordParentApprovedAcquisition({
        state: first.data.state,
        event: { ...valid, eventId: 'conflicting-approval' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
    expect(
      recordParentApprovedAcquisition({
        state: base,
        event: { ...valid, routinePhase: 'maintenance' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'NON_ACQUISITION_EVIDENCE' } });
    expect(
      recordParentApprovedAcquisition({
        state: base,
        event: {
          ...valid,
          recognitionMode: 'recognition_only',
          routinePhase: 'not_applicable',
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'NON_ACQUISITION_EVIDENCE' } });
    expect(
      recordParentApprovedAcquisition({
        state: base,
        event: { profileId: PROFILE_ID } as ParentApprovedAcquisitionEvent,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_EVIDENCE' } });
    expect(first.data.state.acquisitionCredits).toHaveLength(1);
  });

  it('fails closed across profiles and reset epochs while allowing isolated new-epoch evidence', () => {
    const state = emptyState();
    expect(
      recordParentApprovedAcquisition({
        state,
        event: acquisitionEvent(1, ['skill.energy'], { profileId: OTHER_PROFILE_ID }),
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      recordParentApprovedAcquisition({
        state,
        event: acquisitionEvent(1, ['skill.energy'], { profileEpochId: OTHER_EPOCH_ID }),
      }),
    ).toMatchObject({ ok: false, error: { code: 'EPOCH_SCOPE_MISMATCH' } });

    const nextEpoch = emptyState(PROFILE_ID, OTHER_EPOCH_ID);
    const isolated = recordParentApprovedAcquisition({
      state: nextEpoch,
      event: acquisitionEvent(1, ['skill.energy'], { profileEpochId: OTHER_EPOCH_ID }),
    });
    expectOk(isolated);
    expect(isolated.data.state.acquisitionCredits[0]?.id).toContain(OTHER_EPOCH_ID);
  });

  it('rejects forged partial, extra, or internally inconsistent canonical occurrence groups', () => {
    const recorded = recordParentApprovedAcquisition({
      state: emptyState(),
      event: acquisitionEvent(1, undefined, { taskId: 'task_recycling_p0_v1' }),
    });
    expectOk(recorded);
    const [sortingCredit, coastCredit] = recorded.data.state.acquisitionCredits;
    expect(sortingCredit).toBeDefined();
    expect(coastCredit).toBeDefined();

    const partial = {
      ...recorded.data.state,
      acquisitionCredits: [sortingCredit!],
    } as AchievementState;
    expect(
      recordParentApprovedAcquisition({
        state: partial,
        event: acquisitionEvent(2, ['skill.energy']),
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });

    const extra = {
      ...recorded.data.state,
      acquisitionCredits: [
        ...recorded.data.state.acquisitionCredits,
        {
          ...sortingCredit!,
          id: `achievement-credit:${PROFILE_ID}:${EPOCH_ID}:task-occurrence-1:skill.water`,
          skillId: 'skill.water' as const,
        },
      ],
    } as AchievementState;
    expect(
      evaluateBadgeAwards({
        state: extra,
        evidence: evidence(0),
        mode: 'live',
        triggerEventId: 'forged-extra-credit',
        occurredAt: OCCURRED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });

    const inconsistent = {
      ...recorded.data.state,
      acquisitionCredits: [sortingCredit!, { ...coastCredit!, taskId: 'different-task' }],
    } as AchievementState;
    expect(
      evaluateBadgeAwards({
        state: inconsistent,
        evidence: evidence(0),
        mode: 'live',
        triggerEventId: 'forged-inconsistent-credit',
        occurredAt: OCCURRED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
  });
});

describe('R002b deterministic badge evaluation', () => {
  it.each([
    [0, []],
    [1, ['badge.skill.sorting.bud.v1']],
    [2, ['badge.skill.sorting.bud.v1']],
    [3, ['badge.skill.sorting.bud.v1', 'badge.skill.sorting.branch.v1']],
    [6, ['badge.skill.sorting.bud.v1', 'badge.skill.sorting.branch.v1']],
    [
      7,
      [
        'badge.skill.sorting.bud.v1',
        'badge.skill.sorting.branch.v1',
        'badge.skill.sorting.shade.v1',
      ],
    ],
  ] as const)(
    'applies sorting thresholds and prerequisite chains at %i credits',
    (count, expected) => {
      const state = addCredits(emptyState(), 'skill.sorting', count);
      const evaluated = evaluateLive(state, evidence(0), `sorting-evaluation-${count}`);
      expect(evaluated.state.awards.map((award) => award.badgeId)).toEqual(expected);
    },
  );

  it.each([
    [1, 156, []],
    [2, 155, []],
    [2, 156, ['badge.skill.water.bud.v1']],
    [5, 156, ['badge.skill.water.bud.v1', 'badge.skill.water.branch.v1']],
    [
      10,
      156,
      ['badge.skill.water.bud.v1', 'badge.skill.water.branch.v1', 'badge.skill.water.shade.v1'],
    ],
  ] as const)(
    'applies the water 2/5/10 chain and station-156 Bud gate at %i credits',
    (count, lifetimeSeeds, expected) => {
      const state = addCredits(emptyState(), 'skill.water', count);
      const evaluated = evaluateLive(
        state,
        evidence(lifetimeSeeds),
        `water-evaluation-${count}-${lifetimeSeeds}`,
      );
      expect(
        evaluated.state.awards
          .map((award) => award.badgeId)
          .filter((badgeId) => badgeId.includes('.skill.water.')),
      ).toEqual(expected);
    },
  );

  it('requires exactly two eligible energy acquisition credits', () => {
    const one = evaluateLive(addCredits(emptyState(), 'skill.energy', 1), evidence(0));
    expect(one.state.awards).toEqual([]);
    const two = evaluateLive(
      addCredits(emptyState(), 'skill.energy', 2),
      evidence(0),
      'energy-evaluation-002',
    );
    expect(two.newlyEarnedBadgeIds).toEqual(['badge.skill.energy.bud.v1']);
  });

  it('does not award Mangrove Care at station 132 without both remaining components', () => {
    const stationOnly = evaluateLive(emptyState(), evidence(132, { reachedStations: [120, 132] }));
    expect(stationOnly.state.awards.map((award) => award.badgeId)).not.toContain(
      'badge.habitat.mangrove_care.v1',
    );
  });

  it('awards Mangrove Care only with station 132, learning, and three coast credits', () => {
    const state = addCredits(emptyState(), 'skill.coast_care', 3);
    const missingLearning = evaluateLive(state, evidence(132, { reachedStations: [120, 132] }));
    expect(missingLearning.newlyEarnedBadgeIds).not.toContain('badge.habitat.mangrove_care.v1');

    const complete = evaluateLive(
      state,
      evidence(132, {
        reachedStations: [120, 132],
        learningIds: ['learning.mangrove_roots.v1'],
      }),
      'mangrove-composite-complete',
    );
    expect(complete.newlyEarnedBadgeIds).toContain('badge.habitat.mangrove_care.v1');
  });

  it('requires explicit committed generic evidence for catalog components without approved IDs', () => {
    const pending: SemanticCriterionEvidence[] = [
      {
        id: 'wetland-learning-review',
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        badgeId: 'badge.biodiversity.wetland_exploration.v1',
        component: 'wetland_learning',
        status: 'awaiting_review',
      },
      {
        id: 'wetland-observation-committed',
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        badgeId: 'badge.biodiversity.wetland_exploration.v1',
        component: 'observation_activity',
        status: 'committed',
      },
    ];
    const notYet = evaluateLive(emptyState(), evidence(0, { semanticEvidence: pending }));
    expect(notYet.state.awards).toEqual([]);

    const committed = pending.map((item) => ({ ...item, status: 'committed' as const }));
    const complete = evaluateLive(
      emptyState(),
      evidence(0, { semanticEvidence: committed }),
      'wetland-composite-complete',
    );
    expect(complete.newlyEarnedBadgeIds).toEqual(['badge.biodiversity.wetland_exploration.v1']);
  });

  it('rejects ambiguous, partial, and cross-scope evaluation evidence without mutation', () => {
    const state = emptyState();
    expect(
      evaluateBadgeAwards({
        state,
        evidence: evidence(120, { exact: false }),
        mode: 'historical_seed_backfill',
        triggerEventId: 'migration-receipt',
      }),
    ).toMatchObject({ ok: false, error: { code: 'AMBIGUOUS_LIFETIME_EVIDENCE' } });
    expect(
      evaluateBadgeAwards({
        state,
        evidence: evidence(120, { profileId: OTHER_PROFILE_ID }),
        mode: 'historical_seed_backfill',
        triggerEventId: 'migration-receipt',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      evaluateBadgeAwards({
        state,
        evidence: { lifetimeSeeds: null } as unknown as AchievementEvaluationEvidence,
        mode: 'historical_seed_backfill',
        triggerEventId: 'migration-receipt',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_EVIDENCE' } });
    expect(state.awards).toEqual([]);
  });

  it('rejects an unknown evaluation mode before constructing any award', () => {
    const state = emptyState();
    expect(
      evaluateBadgeAwards({
        state,
        evidence: evidence(120),
        mode: 'not-a-mode',
        triggerEventId: 'invalid-mode-event',
      } as unknown as Parameters<typeof evaluateBadgeAwards>[0]),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(state.awards).toEqual([]);
  });

  it.each([[[132]], [[120, 156]], [[120, 132, 132]], [[132, 120]]] as const)(
    'rejects a non-canonical reached-station sequence %j',
    (reachedStations) => {
      const state = emptyState();
      expect(
        evaluateBadgeAwards({
          state,
          evidence: evidence(156, { reachedStations }),
          mode: 'live',
          triggerEventId: 'inconsistent-stations',
          occurredAt: OCCURRED_AT,
        }),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_EVIDENCE' } });
      expect(state.awards).toEqual([]);
    },
  );

  it('rejects cross-profile and cross-epoch learning or semantic evidence', () => {
    const state = emptyState();
    const baseLearning = evidence(132, { learningIds: ['learning.mangrove_roots.v1'] });
    const wrongLearning: AchievementEvaluationEvidence = {
      ...baseLearning,
      learningCompletions: [
        {
          ...baseLearning.learningCompletions[0]!,
          profileId: OTHER_PROFILE_ID,
        },
      ],
    };
    expect(
      evaluateBadgeAwards({
        state,
        evidence: wrongLearning,
        mode: 'live',
        triggerEventId: 'wrong-learning-profile',
        occurredAt: OCCURRED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });

    const wrongSemantic = evidence(0, {
      semanticEvidence: [
        {
          id: 'wrong-semantic-epoch',
          profileId: PROFILE_ID,
          profileEpochId: OTHER_EPOCH_ID,
          badgeId: 'badge.heritage.sadu_patterns.v1',
          component: 'sadu_learning',
          status: 'committed',
        },
      ],
    });
    expect(
      evaluateBadgeAwards({
        state,
        evidence: wrongSemantic,
        mode: 'live',
        triggerEventId: 'wrong-semantic-epoch',
        occurredAt: OCCURRED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EPOCH_SCOPE_MISMATCH' } });
  });

  it('rejects duplicate completion records for one profile, epoch, and learning package', () => {
    const duplicated = evidence(132, { learningIds: ['learning.mangrove_roots.v1'] });
    const first = duplicated.learningCompletions[0]!;
    expect(
      evaluateBadgeAwards({
        state: emptyState(),
        evidence: {
          ...duplicated,
          learningCompletions: [first, { ...first, id: 'second-route-completion' }],
        },
        mode: 'live',
        triggerEventId: 'duplicate-learning',
        occurredAt: OCCURRED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EVIDENCE_CONFLICT' } });
  });

  it.each([
    [11, []],
    [12, ['badge.journey.seed_start.v1']],
    [59, ['badge.journey.seed_start.v1']],
    [60, ['badge.journey.seed_start.v1', 'badge.journey.growing_branch.v1']],
    [119, ['badge.journey.seed_start.v1', 'badge.journey.growing_branch.v1']],
    [
      120,
      [
        'badge.journey.seed_start.v1',
        'badge.journey.growing_branch.v1',
        'badge.journey.expanding_shade.v1',
      ],
    ],
    [
      179,
      [
        'badge.journey.seed_start.v1',
        'badge.journey.growing_branch.v1',
        'badge.journey.expanding_shade.v1',
      ],
    ],
    [
      180,
      [
        'badge.journey.seed_start.v1',
        'badge.journey.growing_branch.v1',
        'badge.journey.expanding_shade.v1',
        'badge.journey.coastal_care.v1',
      ],
    ],
  ] as const)('backfills the exact Seed threshold set at %i', (lifetimeSeeds, expected) => {
    const result = evaluateBadgeAwards({
      state: emptyState(),
      evidence: evidence(lifetimeSeeds),
      mode: 'historical_seed_backfill',
      triggerEventId: `seed-threshold-${lifetimeSeeds}`,
    });
    expectOk(result);
    expect(result.data.newlyEarnedBadgeIds).toEqual(expected);
  });

  it('silently backfills only proven Seed-threshold badges with unknown dates and no celebration', () => {
    const stateWithMastery = addCredits(emptyState(), 'skill.sorting', 7);
    const result = evaluateBadgeAwards({
      state: stateWithMastery,
      evidence: evidence(120),
      mode: 'historical_seed_backfill',
      triggerEventId: 'migration:r002b.seed-ledger.v1:child_salem:reset-epoch-001',
    });
    expectOk(result);

    expect(result.data.newlyEarnedBadgeIds).toEqual([
      'badge.journey.seed_start.v1',
      'badge.journey.growing_branch.v1',
      'badge.journey.expanding_shade.v1',
    ]);
    expect(result.data.celebrationBadgeIds).toEqual([]);
    expect(result.data.state.awards.every((award) => award.earnedAt === null)).toBe(true);
    expect(result.data.state.awards.every((award) => award.silentBackfill)).toBe(true);
    expect(result.data.state.awards.every((award) => award.private)).toBe(true);
    expect(result.data.state.awards.some((award) => award.badgeId.includes('.sorting.'))).toBe(
      false,
    );
  });

  it('preserves awards permanently and makes repeated or concurrent evaluation idempotent', () => {
    const eligible = addCredits(emptyState(), 'skill.sorting', 1);
    const first = evaluateLive(eligible, evidence(0), 'sorting-award-event');
    const concurrent = evaluateLive(eligible, evidence(0), 'sorting-award-event');
    expect(first).toEqual(concurrent);
    expect(first.celebrationBadgeIds).toEqual(['badge.skill.sorting.bud.v1']);

    const duplicate = evaluateLive(first.state, evidence(0), 'later-evaluation');
    expect(duplicate.newlyEarnedBadgeIds).toEqual([]);
    expect(duplicate.celebrationBadgeIds).toEqual([]);
    expect(duplicate.state.awards[0]).toEqual(first.state.awards[0]);

    const evidenceRemoved = {
      ...first.state,
      acquisitionCredits: [],
    } as AchievementState;
    const permanent = evaluateLive(evidenceRemoved, evidence(0), 'missing-source-recheck');
    expect(permanent.state.awards[0]).toEqual(first.state.awards[0]);
  });

  it('creates no Seed or existing reward consequence from learning or semantic evidence', () => {
    const before = evidence(132, {
      reachedStations: [120, 132],
      learningIds: ['learning.mangrove_roots.v1'],
    });
    const result = evaluateLive(emptyState(), before, 'learning-evaluation');
    expect(before.lifetimeSeeds.amount).toBe(132);
    expect(JSON.stringify(result)).not.toMatch(
      /seedDelta|gardenDelta|canopyDelta|leagueLeaf|challengeLeaf|familyReward/iu,
    );
  });
});

describe('R002b gallery and detail projections', () => {
  it('classifies earned, in-progress, next, locked, awaiting-review, and archived context', () => {
    let state = addCredits(emptyState(), 'skill.sorting', 1);
    const backfill = evaluateBadgeAwards({
      state,
      evidence: evidence(108),
      mode: 'historical_seed_backfill',
      triggerEventId: 'fixture-normalization',
    });
    expectOk(backfill);
    state = backfill.data.state;
    state = evaluateLive(state, evidence(108), 'mastery-evaluation').state;

    const pending: SemanticCriterionEvidence = {
      id: 'wetland-learning-pending',
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      badgeId: 'badge.biodiversity.wetland_exploration.v1',
      component: 'wetland_learning',
      status: 'awaiting_review',
    };
    const result = projectBadgeGallery({
      state,
      evidence: evidence(108, { semanticEvidence: [pending] }),
      context: {
        archivedSeedThresholds: [60],
        unlockedLearningIds: [],
        assignedTasks: [],
      },
    });
    expectOk(result);

    const byId = new Map(result.data.items.map((item) => [item.id, item]));
    expect(byId.get('badge.journey.seed_start.v1')?.displayState).toBe('earned');
    expect(byId.get('badge.journey.growing_branch.v1')?.archivedContext).toEqual({
      kind: 'completed_seed_stage',
      threshold: 60,
    });
    expect(byId.get('badge.journey.expanding_shade.v1')?.displayState).toBe('next_recommended');
    expect(byId.get('badge.skill.sorting.branch.v1')?.displayState).toBe('in_progress');
    expect(byId.get('badge.skill.energy.bud.v1')?.displayState).toBe('locked');
    expect(byId.get('badge.biodiversity.wetland_exploration.v1')?.displayState).toBe(
      'awaiting_review',
    );
    expect(
      result.data.items.filter((item) => item.displayState === 'next_recommended'),
    ).toHaveLength(1);
  });

  it('exposes exact component progress plus at most one deterministic contextual action', () => {
    const sortingState = evaluateLive(
      addCredits(emptyState(), 'skill.sorting', 1),
      evidence(108),
      'sorting-bud-earned',
    ).state;
    const frozenContext = Object.freeze({
      archivedSeedThresholds: Object.freeze([]),
      unlockedLearningIds: Object.freeze(['learning.mangrove_roots.v1'] as const),
      assignedTasks: Object.freeze([
        Object.freeze({
          assignmentId: 'assignment-sorting-001',
          profileId: PROFILE_ID,
          profileEpochId: EPOCH_ID,
          taskId: 'task_recycling_p0_v1',
          status: 'assigned' as const,
          skillIds: Object.freeze(['skill.sorting', 'skill.coast_care'] as const),
        }),
      ]),
    });

    const expanding = projectBadgeDetail({
      badgeId: 'badge.journey.expanding_shade.v1',
      state: sortingState,
      evidence: evidence(108),
      context: frozenContext,
    });
    expectOk(expanding);
    expect(expanding.data.criteria).toEqual([
      expect.objectContaining({ kind: 'lifetime_seeds', current: 108, required: 120 }),
    ]);
    expect(expanding.data.contextualAction).toEqual({
      kind: 'impact_path_station',
      threshold: 120,
    });

    const sorting = projectBadgeDetail({
      badgeId: 'badge.skill.sorting.branch.v1',
      state: sortingState,
      evidence: evidence(108),
      context: frozenContext,
    });
    expectOk(sorting);
    expect(sorting.data.contextualAction).toEqual({
      kind: 'assigned_task',
      assignmentId: 'assignment-sorting-001',
      taskId: 'task_recycling_p0_v1',
    });

    const mangrove = projectBadgeDetail({
      badgeId: 'badge.habitat.mangrove_care.v1',
      state: sortingState,
      evidence: evidence(132, { reachedStations: [120, 132] }),
      context: frozenContext,
    });
    expectOk(mangrove);
    expect(mangrove.data.contextualAction).toEqual({
      kind: 'unlocked_learning',
      learningId: 'learning.mangrove_roots.v1',
    });
    expect(
      [expanding.data, sorting.data, mangrove.data].every((item) => item.contextualAction),
    ).toBe(true);
    expect(frozenContext.assignedTasks).toHaveLength(1);
    expect(JSON.stringify(frozenContext)).not.toMatch(/create|assignTask|mutation/iu);
  });

  it('rejects unknown badges and cross-profile task opportunities', () => {
    expect(
      projectBadgeDetail({
        badgeId: 'badge.unknown.v1',
        state: emptyState(),
        evidence: evidence(0),
        context: { archivedSeedThresholds: [], unlockedLearningIds: [], assignedTasks: [] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'UNKNOWN_BADGE' } });

    expect(
      projectBadgeGallery({
        state: emptyState(),
        evidence: evidence(0),
        context: {
          archivedSeedThresholds: [],
          unlockedLearningIds: [],
          assignedTasks: [
            {
              assignmentId: 'cross-profile-assignment',
              profileId: OTHER_PROFILE_ID,
              profileEpochId: EPOCH_ID,
              taskId: 'task-water',
              status: 'assigned',
              skillIds: ['skill.water'],
            },
          ],
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
  });

  it('returns an explicit null action when no eligible existing destination exists', () => {
    const result = projectBadgeDetail({
      badgeId: 'badge.skill.energy.bud.v1',
      state: emptyState(),
      evidence: evidence(0),
      context: { archivedSeedThresholds: [], unlockedLearningIds: [], assignedTasks: [] },
    });
    expectOk(result);
    expect(result.data.contextualAction).toBeNull();
  });

  it('resolves a missing prerequisite through that badge’s own station criterion', () => {
    const result = projectBadgeDetail({
      badgeId: 'badge.skill.water.branch.v1',
      state: addCredits(emptyState(), 'skill.water', 5),
      evidence: evidence(155),
      context: { archivedSeedThresholds: [], unlockedLearningIds: [], assignedTasks: [] },
    });
    expectOk(result);
    expect(result.data.contextualAction).toEqual({
      kind: 'impact_path_station',
      threshold: 156,
    });
  });
});
