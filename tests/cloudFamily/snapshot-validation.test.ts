import { describe, expect, it } from 'vitest';

import {
  cloudError,
  parseCloudCommandResult,
  parseCloudSnapshot,
  type CloudExpectedActor,
} from '../../src/features/cloudFamily/validation';
import { CloudFamilyError, type CloudSnapshot } from '../../src/models/cloudFamily';
import { ParentAccountError } from '../../src/models/parentAccount';

const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const parent: CloudExpectedActor = { userId: id(1), role: 'parent', familyId: id(2) };
const childActor: CloudExpectedActor = {
  userId: id(3),
  role: 'child',
  familyId: id(2),
  childId: id(4),
};
const now = '2026-09-14T12:00:00.123456+00:00';

function snapshot(): CloudSnapshot {
  const safety = {
    adult_pre_check: 'Check the prepared materials.',
    adult_second_check: 'Ask before starting.',
    adult_owned_actions: ['Prepare the area.'],
    child_allowed_actions: ['Arrange the safe items.'],
    excluded_hazards: ['Sharp items'],
    stop_and_ask_adult: 'Stop and ask an adult when unsure.',
    route_constraint: null,
    indoor_alternative: null,
    aftercare: null,
  };
  return {
    schema_version: 1,
    revision: 4,
    actor: { user_id: id(1), role: 'parent', family_id: id(2), child_id: null },
    family: {
      id: id(2),
      name: 'Test household',
      locale: 'ar',
      revision: 4,
      guardian_names: [],
      relatives: [],
    },
    children: [
      {
        id: id(4),
        family_id: id(2),
        nickname: 'Test member',
        age_band: '9_11',
        age10_plus_confirmed: true,
        preferred_language: 'both',
        avatar_id: 'ghaf',
        active: true,
        preferences: {
          sex: null,
          interests: [],
          hobbies: [],
          accessibility: [],
          support: [],
          personalization_enabled: false,
          custom_interest: null,
          custom_hobby: null,
          custom_support: null,
          custom_accessibility: null,
        },
      },
    ],
    landscapes: [{ id: 'ghaf', label_ar: 'غاف', label_en: 'Ghaf' }],
    categories: [
      { id: 'home_responsibility', label_ar: 'المنزل', label_en: 'Home', landscape_id: 'ghaf' },
    ],
    templates: [
      {
        id: 'home.safe_items.v1',
        category_id: 'home_responsibility',
        landscape_id: 'ghaf',
        title_ar: 'ترتيب',
        title_en: 'Arrange',
        definition_ar: 'عناصر آمنة',
        definition_en: 'Arrange safe items.',
        steps_ar: ['رتب العناصر'],
        steps_en: ['Arrange the items.'],
        recognition_mode: 'standard',
        routine_phase: 'acquisition',
        seed_award: 4,
        visibility_scope: 'child_guardian',
        circle_eligible: false,
        reward_eligible: true,
        league_eligible: false,
        skill_ids: [],
        permitted_help_ar: 'مساعدة',
        permitted_help_en: 'Help is allowed.',
        supervision_ar: 'مع شخص بالغ',
        supervision_en: 'An adult is available.',
        safety_ar: safety,
        safety_en: safety,
        recurrence: 'once',
        age_bands: ['9_11'],
        positive_action_ar: 'ترتيب',
        positive_action_en: 'Arrange safely.',
        why_it_matters_ar: 'مساحة مشتركة',
        why_it_matters_en: 'Care for a shared space.',
      },
    ],
    tasks: [
      {
        id: id(5),
        family_id: id(2),
        child_id: id(4),
        version: 1,
        status: 'assigned',
        template_id: 'home.safe_items.v1',
        title: 'Arrange safe items',
        definition_of_done: 'The safe items are arranged.',
        steps: ['Arrange the items.'],
        content_locale: 'en',
        category_id: 'home_responsibility',
        landscape_id: 'ghaf',
        recognition_mode: 'standard',
        routine_phase: 'acquisition',
        seed_award: 4,
        visibility_scope: 'child_guardian',
        circle_eligible: false,
        reward_eligible: true,
        league_eligible: false,
        created_at: now,
        permitted_help: 'Help is allowed.',
        supervision: 'An adult is available.',
        safety,
        recurrence: 'once',
        positive_action: 'Arrange safely.',
        why_it_matters: 'Care for a shared space.',
      },
    ],
    assignments: [
      {
        id: id(6),
        family_id: id(2),
        child_id: id(4),
        task_id: id(5),
        task_version: 1,
        state: 'chosen',
        help_requested: false,
        created_at: now,
      },
    ],
    submissions: [],
    check_ins: [],
    adjustments: [],
    recognitions: [],
    seed_entries: [],
    landscape_progress: [
      {
        child_id: id(4),
        landscape_id: 'ghaf',
        cumulative_seeds: 0,
        stage: 'seed',
        next_threshold: 12,
      },
    ],
    legacy_records: [],
    legacy_available: false,
    saved_templates: [],
    reveals: [],
    impact_paths: [
      {
        child_id: id(4),
        lifetime_seeds: 0,
        reached_thresholds: [],
        next_threshold: 120,
        chapter_state: 'not_entered',
      },
    ],
    permissions: [
      {
        child_id: id(4),
        voice_granted: false,
        media_granted: false,
        ai_granted: false,
        revision: 0,
      },
    ],
    community: { status: 'continued', revision: 0 },
    extras: {
      rewards: [
        {
          id: id(7),
          childId: id(4),
          label: 'Family outing',
          kind: 'experience',
          amountFils: null,
          month: '2026-09',
          milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 24 },
          status: 'promised',
          version: 1,
          eligibleSeeds: 0,
          monthlyMaximumFils: 0,
          unlockedAt: null,
          givenAt: null,
        },
      ],
      masroofi: {
        cards: [
          {
            childId: id(4),
            balanceFils: 0,
            controlsVersion: 1,
            ageEligible: true,
            controls: {
              frozen: false,
              onlineAllowed: false,
              allowedCategories: ['stationery'],
              perPurchaseLimitFils: 500,
              dailyLimitFils: 1_000,
            },
            origin: 'simulated',
          },
        ],
        promises: [
          {
            id: id(8),
            childId: id(4),
            assignmentId: id(6),
            taskVersion: 1,
            status: 'promised',
            amountFils: 500,
          },
        ],
        transactions: [],
        purchaseCatalog: [
          { id: 'stationery', category: 'stationery', online: false, amountFils: 300 },
        ],
      },
      studyPlans: [
        {
          id: id(9),
          childId: id(4),
          createdBy: 'parent',
          subject: 'Maths',
          title: 'Practice',
          nextStep: 'Try a question.',
          durationMinutes: 10,
          dueDate: '2026-09-15',
          revisitDate: null,
          status: 'planned',
          helpRequest: null,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        },
      ],
      goals: [
        {
          id: id(10),
          childId: id(4),
          createdBy: 'parent',
          subject: 'Maths',
          title: 'Practice together',
          nextStep: 'Choose a question.',
          parentSupport: 'Explain a worked example.',
          criterion: { kind: 'practice_count', target: 3 },
          prize: null,
          status: 'proposed',
          revision: 1,
          parentApprovedRevision: null,
          childAcceptedRevision: null,
          submissions: [],
          prizeStatus: null,
          createdAt: now,
          updatedAt: now,
          acknowledgedAt: null,
          unlockedAt: null,
          givenAt: null,
        },
      ],
      learning: {
        packages: [
          {
            id: 'learning.mangrove_roots.v1',
            labelAr: 'القرم',
            labelEn: 'Mangrove',
            unlockThreshold: 132,
            available: true,
            unlockedChildIds: [],
            steps: { story: ['story_frame_1'], accessible: ['accessible_section_1'] },
            checkOptions: ['habitat_support_and_care', 'visit_or_task_reward'],
          },
        ],
        progress: [],
        completions: [],
        badges: [
          {
            childId: id(4),
            id: 'badge.journey.seed_start.v1',
            labelAr: 'البداية',
            labelEn: 'Seed Start',
            criteria: [{ kind: 'lifetime_seeds', required: 12 }],
            earnedAt: null,
          },
        ],
      },
      league: {
        circles: [
          {
            id: id(11),
            name: 'Test circle',
            isOwner: true,
            rows: [
              {
                nickname: 'Shared nickname',
                avatarId: 'ghaf',
                rank: 1,
                score: 0,
                confirmedLeaves: 0,
              },
            ],
            canopyContributions: 0,
            greenActions: 0,
            canopyHistory: [],
            memberships: [
              {
                childId: id(4),
                nickname: 'Shared nickname',
                avatarId: 'ghaf',
                nominatedAssignmentIds: [],
                eligibleAssignmentIds: [],
                restWeek: false,
              },
            ],
          },
        ],
        invitations: [],
      },
    },
  };
}

function childSnapshot(): CloudSnapshot {
  const value = snapshot();
  value.actor = { user_id: childActor.userId, role: 'child', family_id: id(2), child_id: id(4) };
  value.extras.masroofi.promises = [
    { id: id(8), childId: id(4), assignmentId: id(6), taskVersion: 1, status: 'promised' },
  ];
  value.extras.league.circles[0]!.isOwner = false;
  return value;
}

function recognizedSnapshot(): CloudSnapshot {
  const value = snapshot();
  value.assignments[0]!.state = 'recognized';
  value.submissions = [
    {
      id: id(12),
      assignment_id: id(6),
      child_id: id(4),
      task_version: 1,
      attempt: 1,
      completion_mode: 'permitted_help',
      definition_acknowledged: true,
      submitted_at: now,
    },
  ];
  value.check_ins = [
    {
      id: id(13),
      assignment_id: id(6),
      submission_id: id(12),
      decision: 'confirm',
      praise: 'You arranged the safe items with help.',
      observation: null,
      presentation: 'recognition_applied',
      created_at: now,
    },
  ];
  value.recognitions = [
    {
      id: id(14),
      child_id: id(4),
      assignment_id: id(6),
      task_id: id(5),
      task_version: 1,
      submission_id: id(12),
      check_in_id: id(13),
      seed_amount: 4,
      landscape_id: 'ghaf',
      created_at: now,
    },
  ];
  value.seed_entries = [
    { id: id(15), child_id: id(4), recognition_id: id(14), amount: 4, created_at: now },
  ];
  value.reveals = [{ id: id(16), child_id: id(4), recognition_id: id(14), acknowledged_at: null }];
  value.landscape_progress[0]!.cumulative_seeds = 4;
  value.impact_paths[0]!.lifetime_seeds = 4;
  return value;
}

function rejects(
  value: unknown,
  expected: CloudExpectedActor = parent,
  code = 'service_unavailable',
) {
  expect(() => parseCloudSnapshot(value, expected)).toThrowError(
    new CloudFamilyError(code as CloudFamilyError['code']),
  );
}

describe('normalized cloud response boundary', () => {
  it('retains complete actual server data and returns an isolated parsed copy', () => {
    const value = snapshot();
    const parsed = parseCloudSnapshot(value, parent);
    expect(parsed).toEqual(value);
    expect(parsed).not.toBe(value);
    parsed.children[0]!.nickname = 'Changed copy';
    expect(value.children[0]!.nickname).toBe('Test member');
  });

  it('accepts an empty household without injecting sample children or progress', () => {
    const value = snapshot();
    Object.assign(value, {
      revision: 0,
      children: [],
      tasks: [],
      assignments: [],
      landscape_progress: [],
      impact_paths: [],
      permissions: [],
    });
    value.family = { ...value.family, name: '', revision: 0 };
    value.extras = {
      rewards: [],
      masroofi: { cards: [], promises: [], transactions: [], purchaseCatalog: [] },
      studyPlans: [],
      goals: [],
      learning: { packages: [], progress: [], completions: [], badges: [] },
      league: { circles: [], invitations: [] },
    };
    expect(parseCloudSnapshot(value, parent)).toEqual(value);
  });

  it('binds an enrolled anonymous Child session to its server identity and hides the promise amount', () => {
    const parsed = parseCloudSnapshot(childSnapshot(), childActor);
    expect(parsed.actor).toMatchObject({
      user_id: childActor.userId,
      child_id: id(4),
      role: 'child',
    });
    expect(parsed.extras.masroofi.promises[0]).not.toHaveProperty('amountFils');
  });

  it('supports immutable earlier task versions referenced by server evidence', () => {
    const value = recognizedSnapshot();
    value.tasks.push({ ...value.tasks[0]!, version: 2, title: 'Later version' });
    expect(parseCloudSnapshot(value, parent).recognitions[0]!.task_version).toBe(1);
    value.tasks = value.tasks.filter((task) => task.version !== 1);
    rejects(value);
  });

  it.each([
    [
      'foreign user',
      (value: CloudSnapshot) => {
        value.actor.user_id = id(99);
      },
    ],
    [
      'forged Parent role',
      (value: CloudSnapshot) => {
        value.actor.role = 'child';
        value.actor.child_id = id(4);
      },
    ],
    [
      'foreign family',
      (value: CloudSnapshot) => {
        value.family.id = id(99);
      },
    ],
    [
      'foreign Child family',
      (value: CloudSnapshot) => {
        value.children[0]!.family_id = id(99);
      },
    ],
    [
      'foreign task family',
      (value: CloudSnapshot) => {
        value.tasks[0]!.family_id = id(99);
      },
    ],
    [
      'foreign assignment family',
      (value: CloudSnapshot) => {
        value.assignments[0]!.family_id = id(99);
      },
    ],
  ])('rejects %s instead of trusting the response actor', (_name, change) => {
    const value = snapshot();
    change(value);
    rejects(value, parent, 'access_denied');
  });

  it('does not accept Parent authorization from unsigned metadata in a Child response', () => {
    const value = childSnapshot();
    rejects(value, { ...childActor, role: 'parent', childId: undefined }, 'access_denied');
    rejects({ ...value, user_metadata: { role: 'parent' } }, childActor);
  });

  it('requires server-owned permissions and rejects sibling permission records', () => {
    const value = childSnapshot();
    expect(parseCloudSnapshot(value, childActor).permissions[0]!.ai_granted).toBe(false);
    rejects({ ...value, permissions: undefined }, childActor);
    value.permissions[0]!.child_id = id(99);
    rejects(value, childActor, 'access_denied');
  });

  it('rejects Postgres projections that omit profiles but retain their private records', () => {
    const value = snapshot();
    value.children = [];
    rejects(value, parent, 'access_denied');
  });

  it('requires the persisted card controls version for conflict-safe edits', () => {
    const value = snapshot();
    value.extras.masroofi.cards[0]!.controlsVersion = 3;
    expect(parseCloudSnapshot(value, parent).extras.masroofi.cards[0]!.controlsVersion).toBe(3);
    Object.assign(value.extras.masroofi.cards[0]!, { controlsVersion: undefined });
    rejects(value);
  });

  it('retains earned card funds after an honest age correction while requiring ineligible status', () => {
    const value = snapshot();
    value.children[0]!.age_band = '6_8';
    value.children[0]!.age10_plus_confirmed = false;
    value.extras.masroofi.cards[0]!.ageEligible = false;
    value.extras.masroofi.cards[0]!.balanceFils = 500;
    const parsed = parseCloudSnapshot(value, parent);
    expect(parsed.extras.masroofi.cards[0]).toMatchObject({ ageEligible: false, balanceFils: 500 });
    value.extras.masroofi.cards[0]!.ageEligible = true;
    rejects(value);
  });

  it('validates stored community status and revision without inventing consent', () => {
    const value = snapshot();
    value.community = { status: 'ended', revision: 3 };
    expect(parseCloudSnapshot(value, parent).community).toEqual(value.community);
    rejects({ ...value, community: { status: 'continued' } });
    rejects({ ...value, community: { status: 'joined', revision: 3 } });
  });

  it('accepts only own server-eligible League assignments and retained promise versions', () => {
    const value = snapshot();
    value.tasks[0]!.league_eligible = true;
    value.extras.league.circles[0]!.memberships[0]!.eligibleAssignmentIds = [id(6)];
    expect(
      parseCloudSnapshot(value, parent).extras.league.circles[0]!.memberships[0]!
        .eligibleAssignmentIds,
    ).toEqual([id(6)]);
    value.tasks[0]!.league_eligible = false;
    rejects(value);
    value.extras.league.circles[0]!.memberships[0]!.eligibleAssignmentIds = [];
    value.extras.masroofi.promises[0]!.taskVersion = 2;
    rejects(value);
  });

  it('preserves distinct promised versions after a preacceptance adjustment', () => {
    const value = snapshot();
    value.tasks.push({ ...value.tasks[0]!, version: 2 });
    value.assignments[0]!.task_version = 2;
    value.extras.masroofi.promises.push({
      ...value.extras.masroofi.promises[0]!,
      id: id(19),
      taskVersion: 2,
      amountFils: 300,
    });
    expect(parseCloudSnapshot(value, parent).extras.masroofi.promises).toHaveLength(2);
    value.extras.masroofi.promises[1]!.taskVersion = 1;
    rejects(value);
  });

  it.each([
    [
      'sibling profile',
      (value: CloudSnapshot) => {
        value.children.push({ ...value.children[0]!, id: id(99) });
      },
    ],
    [
      'sibling task',
      (value: CloudSnapshot) => {
        value.tasks[0]!.child_id = id(99);
      },
    ],
    [
      'sibling assignment',
      (value: CloudSnapshot) => {
        value.assignments[0]!.child_id = id(99);
      },
    ],
    [
      'sibling reward',
      (value: CloudSnapshot) => {
        value.extras.rewards[0]!.childId = id(99);
      },
    ],
    [
      'sibling card',
      (value: CloudSnapshot) => {
        value.extras.masroofi.cards[0]!.childId = id(99);
      },
    ],
    [
      'sibling promise',
      (value: CloudSnapshot) => {
        value.extras.masroofi.promises[0]!.childId = id(99);
      },
    ],
    [
      'sibling study plan',
      (value: CloudSnapshot) => {
        value.extras.studyPlans[0]!.childId = id(99);
      },
    ],
    [
      'sibling academic goal',
      (value: CloudSnapshot) => {
        value.extras.goals[0]!.childId = id(99);
      },
    ],
    [
      'sibling badge',
      (value: CloudSnapshot) => {
        value.extras.learning.badges[0]!.childId = id(99);
      },
    ],
    [
      'sibling learning unlock',
      (value: CloudSnapshot) => {
        value.extras.learning.packages[0]!.unlockedChildIds.push(id(99));
      },
    ],
    [
      'sibling private League membership',
      (value: CloudSnapshot) => {
        value.extras.league.circles[0]!.memberships[0]!.childId = id(99);
      },
    ],
    [
      'sibling Impact Path',
      (value: CloudSnapshot) => {
        value.impact_paths[0]!.child_id = id(99);
      },
    ],
    [
      'unreleased promise amount',
      (value: CloudSnapshot) => {
        value.extras.masroofi.promises[0]!.amountFils = 500;
      },
    ],
    [
      'unreviewed task',
      (value: CloudSnapshot) => {
        value.tasks[0]!.status = 'draft';
      },
    ],
    [
      'Parent invitation',
      (value: CloudSnapshot) => {
        value.extras.league.invitations.push({ id: id(99), circleName: 'Invitation' });
      },
    ],
    [
      'inactive enrollment',
      (value: CloudSnapshot) => {
        value.children[0]!.active = false;
      },
    ],
  ])('fails closed on a Child projection containing %s', (_name, change) => {
    const value = childSnapshot();
    change(value);
    rejects(value, childActor, 'access_denied');
  });

  it('allows earned Masroofi amounts only in the own Child projection', () => {
    const value = childSnapshot();
    value.extras.masroofi.promises[0] = {
      ...value.extras.masroofi.promises[0]!,
      status: 'credited',
      amountFils: 500,
    };
    expect(parseCloudSnapshot(value, childActor).extras.masroofi.promises[0]!.amountFils).toBe(500);
  });

  it.each([
    ['missing field', (value: CloudSnapshot) => ({ ...value, assignments: undefined })],
    ['string revision', (value: CloudSnapshot) => ({ ...value, revision: '4' })],
    [
      'unsafe revision',
      (value: CloudSnapshot) => ({ ...value, revision: Number.MAX_SAFE_INTEGER + 1 }),
    ],
    [
      'fixture identity',
      (value: CloudSnapshot) => ({ ...value, actor: { ...value.actor, user_id: 'child_salem' } }),
    ],
    ['future schema', (value: CloudSnapshot) => ({ ...value, schema_version: 2 })],
    [
      'unknown sensitive field',
      (value: CloudSnapshot) => ({ ...value, private_notes: ['Unexpected details'] }),
    ],
    [
      'oversized collection',
      (value: CloudSnapshot) => ({
        ...value,
        children: Array.from({ length: 101 }, () => value.children[0]),
      }),
    ],
    [
      'oversized text',
      (value: CloudSnapshot) => ({ ...value, family: { ...value.family, name: 'x'.repeat(161) } }),
    ],
    [
      'unknown enum',
      (value: CloudSnapshot) => ({
        ...value,
        children: [{ ...value.children[0], age_band: 'adult' }],
      }),
    ],
  ])('rejects malformed %s without coercion or provider details', (_name, change) => {
    rejects(change(snapshot()));
  });

  it.each([
    [
      'duplicate task version',
      (value: CloudSnapshot) => {
        value.tasks.push({ ...value.tasks[0]! });
      },
    ],
    [
      'missing referenced task',
      (value: CloudSnapshot) => {
        value.assignments[0]!.task_id = id(99);
      },
    ],
    [
      'nonexistent catalog',
      (value: CloudSnapshot) => {
        value.tasks[0]!.template_id = 'not.available';
      },
    ],
    [
      'inconsistent revision',
      (value: CloudSnapshot) => {
        value.family.revision += 1;
      },
    ],
    [
      'unsafe Green projection',
      (value: CloudSnapshot) => {
        value.tasks[0]!.circle_eligible = true;
      },
    ],
    [
      'maintenance award',
      (value: CloudSnapshot) => {
        value.tasks[0]!.routine_phase = 'maintenance';
      },
    ],
    [
      'recognition-only award',
      (value: CloudSnapshot) => {
        value.tasks[0]!.recognition_mode = 'recognition_only';
      },
    ],
    [
      'arbitrary award',
      (value: CloudSnapshot) => {
        value.tasks[0]!.seed_award = 7;
      },
    ],
    [
      'inaccurate card eligibility',
      (value: CloudSnapshot) => {
        value.children[0]!.age10_plus_confirmed = false;
      },
    ],
    [
      'incomplete study receipt',
      (value: CloudSnapshot) => {
        value.extras.studyPlans[0]!.status = 'completed';
      },
    ],
    [
      'invalid calendar date',
      (value: CloudSnapshot) => {
        value.extras.studyPlans[0]!.dueDate = '2026-02-30';
      },
    ],
    [
      'impossible goal acceptance',
      (value: CloudSnapshot) => {
        value.extras.goals[0]!.childAcceptedRevision = 2;
      },
    ],
    [
      'fabricated reward unlock',
      (value: CloudSnapshot) => {
        value.extras.rewards[0]!.status = 'unlocked';
      },
    ],
    [
      'invalid League score',
      (value: CloudSnapshot) => {
        value.extras.league.circles[0]!.rows[0]!.score = 10;
      },
    ],
    [
      'invalid League rank',
      (value: CloudSnapshot) => {
        value.extras.league.circles[0]!.rows[0]!.rank = 2;
      },
    ],
    [
      'premature Impact Path threshold',
      (value: CloudSnapshot) => {
        value.impact_paths[0]!.reached_thresholds.push(120);
      },
    ],
  ])('rejects %s from a structurally complete response', (_name, change) => {
    const value = snapshot();
    change(value);
    rejects(value);
  });

  it('rejects private properties in the shared League row instead of silently stripping them', () => {
    const value = snapshot();
    Object.assign(value.extras.league.circles[0]!.rows[0]!, {
      childId: id(4),
      seedAmount: 24,
      taskTitle: 'Private task',
    });
    rejects(value);
  });

  it('accepts shared League ties and rejects an invented speed tiebreak', () => {
    const value = snapshot();
    value.extras.league.circles[0]!.rows = [
      { nickname: 'First', avatarId: 'ghaf', rank: 1, score: 40, confirmedLeaves: 2 },
      { nickname: 'Second', avatarId: 'sidr', rank: 1, score: 40, confirmedLeaves: 2 },
      { nickname: 'Third', avatarId: 'samar', rank: 3, score: 20, confirmedLeaves: 1 },
    ];
    expect(parseCloudSnapshot(value, parent).extras.league.circles[0]!.rows[1]!.rank).toBe(1);
    value.extras.league.circles[0]!.rows[1]!.rank = 2;
    rejects(value);
  });

  it('requires immutable recognition to match the exact award, submission and check-in', () => {
    expect(parseCloudSnapshot(recognizedSnapshot(), parent).seed_entries[0]!.amount).toBe(4);
    const award = recognizedSnapshot();
    award.recognitions[0]!.seed_amount = 12;
    rejects(award);
    const checkIn = recognizedSnapshot();
    checkIn.check_ins[0]!.presentation = 'editing_praise';
    rejects(checkIn);
    const duplicate = recognizedSnapshot();
    duplicate.recognitions.push({ ...duplicate.recognitions[0]!, id: id(99) });
    rejects(duplicate);
  });

  it('accepts valid nullable awards for recognition-only and maintenance terms', () => {
    for (const mode of ['recognition_only', 'standard'] as const) {
      const value = snapshot();
      Object.assign(value.tasks[0]!, {
        recognition_mode: mode,
        routine_phase: mode === 'standard' ? 'maintenance' : 'not_applicable',
        seed_award: null,
      });
      expect(parseCloudSnapshot(value, parent).tasks[0]!.seed_award).toBeNull();
    }
  });
});

describe('normalized cloud command receipts', () => {
  it('validates the saved snapshot and the narrow operation result together', () => {
    const value = { snapshot: snapshot(), result: { task_id: id(5), ok: true } };
    expect(parseCloudCommandResult(value, parent)).toEqual(value);
    expect(() =>
      parseCloudCommandResult({ ...value, snapshot: childSnapshot() }, parent),
    ).toThrowError('access_denied');
  });

  it('accepts the actual public submit receipt only when its saved submission is present', () => {
    const value = { snapshot: recognizedSnapshot(), result: { submission_id: id(12) } };
    expect(parseCloudCommandResult(value, parent).result.submission_id).toBe(id(12));
    expect(() =>
      parseCloudCommandResult({ ...value, result: { submission_id: id(99) } }, parent),
    ).toThrowError('service_unavailable');
  });

  it('allows a complete Parent invitation but never projects the token to a Child', () => {
    const result = { token: 'a'.repeat(64), expires_at: now };
    expect(parseCloudCommandResult({ snapshot: snapshot(), result }, parent).result).toEqual(
      result,
    );
    expect(() =>
      parseCloudCommandResult({ snapshot: childSnapshot(), result }, childActor),
    ).toThrowError('access_denied');
    expect(() =>
      parseCloudCommandResult({ snapshot: snapshot(), result: { token: result.token } }, parent),
    ).toThrowError('service_unavailable');
  });

  it('accepts bounded extension results and rejects contradictory purchase receipts', () => {
    expect(
      parseCloudCommandResult({ snapshot: snapshot(), result: { id: id(10) } }, parent).result.id,
    ).toBe(id(10));
    expect(
      parseCloudCommandResult(
        {
          snapshot: childSnapshot(),
          result: { status: 'declined', declineReason: 'insufficient_balance' },
        },
        childActor,
      ).result.status,
    ).toBe('declined');
    expect(() =>
      parseCloudCommandResult(
        {
          snapshot: childSnapshot(),
          result: { status: 'approved', declineReason: 'insufficient_balance' },
        },
        childActor,
      ),
    ).toThrowError('service_unavailable');
    expect(() =>
      parseCloudCommandResult({ snapshot: snapshot(), result: { task_id: id(99) } }, parent),
    ).toThrowError('service_unavailable');
  });

  it.each([
    null,
    [],
    {},
    { snapshot: snapshot() },
    { snapshot: snapshot(), result: null },
    { snapshot: snapshot(), result: { task_id: 'synthetic-task' } },
    { snapshot: snapshot(), result: { access_token: 'must-not-escape' } },
  ])('rejects an incomplete or unexpected result', (value) => {
    expect(() => parseCloudCommandResult(value, parent)).toThrowError('service_unavailable');
  });
});

describe('sanitized cloud errors', () => {
  it.each([
    [{ code: 'PT409', message: 'revision_conflict' }, 'revision_conflict'],
    [{ code: 'PT409', message: 'request_conflict' }, 'request_conflict'],
    [{ code: 'PT403', message: 'reauthentication_required' }, 'reauthentication_required'],
    [{ code: 'PT400', message: 'five_leaves_required' }, 'invalid_input'],
    [{ code: 'PT409', message: 'immutable_goal' }, 'invalid_transition'],
    [{ code: 'PT409', message: 'week_locked' }, 'invalid_transition'],
    [{ code: 'PT403', message: 'learning_locked' }, 'invalid_transition'],
    [{ code: '42501', message: 'permission denied on private relation' }, 'access_denied'],
    [{ code: 'PGRST202', message: 'Private function missing' }, 'service_unavailable'],
    [{ code: 'PGRST301', message: 'JWT details' }, 'access_revoked'],
    [{ code: 'session_not_found' }, 'access_revoked'],
    [{ status: 401 }, 'access_revoked'],
    [{ status: 403 }, 'access_denied'],
    [new ParentAccountError('session_expired'), 'access_revoked'],
    [new ParentAccountError('network_unavailable'), 'network_unavailable'],
    [new ParentAccountError('provider_unavailable'), 'service_unavailable'],
    [new TypeError('Network request failed with private URL'), 'network_unavailable'],
    [{ name: 'AuthRetryableFetchError' }, 'network_unavailable'],
    [{ name: 'TimeoutError' }, 'network_unavailable'],
    [{ code: 'ECONNRESET' }, 'network_unavailable'],
    [{ code: '23514', message: 'SQL constraint details' }, 'invalid_input'],
    [
      { code: 'unknown_code', message: 'private SQL data', details: 'Sensitive' },
      'service_unavailable',
    ],
    [new Error('revision_conflict: private SQL detail'), 'service_unavailable'],
    ['private details', 'service_unavailable'],
    [null, 'service_unavailable'],
  ])('maps %o to only the approved error code', (value, expected) => {
    const error = cloudError(value);
    expect(error).toBeInstanceOf(CloudFamilyError);
    expect(error.code).toBe(expected);
    expect(error.message).toBe(expected);
    expect(error).not.toHaveProperty('details');
  });
});
