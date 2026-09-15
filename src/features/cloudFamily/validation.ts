import { z } from 'zod';

import {
  CloudFamilyError,
  type CloudCommandResult,
  type CloudFamilyErrorCode,
  type CloudSnapshot,
} from '../../models/normalizedCloudFamily';

export interface CloudExpectedActor {
  userId: string;
  role: 'parent' | 'child';
  familyId?: string;
  childId?: string;
}

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
const key = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,159}$/);
const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positive = integer.min(1);
const money = integer.max(1_000_000);
const text = z.string().max(4_000);
const label = z.string().min(1).max(160);
const paragraph = z.string().min(1).max(300);
const timestamp = z
  .string()
  .max(40)
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });
const locale = z.enum(['ar', 'en']);
const role = z.enum(['parent', 'child']);
const ageBand = z.enum(['6_8', '9_11', '12_14']);
const category = z.enum([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);
const landscape = z.enum(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']);
const stage = z.enum(['seed', 'shoot', 'sapling', 'shade', 'flourishing']);
const earnedStage = z.enum(['shoot', 'sapling', 'shade', 'flourishing']);
const recognitionMode = z.enum(['standard', 'fade_first', 'recognition_only']);
const routinePhase = z.enum(['acquisition', 'maintenance', 'not_applicable']);
const visibility = z.enum(['child_guardian', 'household']);
const recurrence = z.enum(['once', 'recurrent']);
const route = z.enum(['story', 'accessible']);
const spendingCategory = z.enum([
  'stationery',
  'books',
  'sports',
  'arts',
  'outings',
  'snacks',
  'gifts',
  'games',
]);
const product = z.enum([
  'stationery',
  'storybook',
  'football',
  'art_supplies',
  'museum_ticket',
  'snack',
  'gift',
  'game_online',
]);
const decline = z.enum([
  'card_disabled',
  'card_frozen',
  'category_blocked',
  'online_blocked',
  'per_purchase_limit',
  'daily_limit',
  'insufficient_balance',
]);
const list = <T extends z.ZodType>(item: T, limit = 10_000) => z.array(item).max(limit);
const strings = list(text, 100);
const keys = list(key, 100);

const safety = z.strictObject({
  adult_pre_check: text,
  adult_second_check: text,
  adult_owned_actions: strings,
  child_allowed_actions: strings,
  excluded_hazards: strings,
  stop_and_ask_adult: text,
  route_constraint: text.nullable(),
  indoor_alternative: text.nullable(),
  aftercare: text.nullable(),
});
const taskTerms = {
  recognition_mode: recognitionMode,
  routine_phase: routinePhase,
  seed_award: integer.max(15).nullable(),
  visibility_scope: visibility,
  circle_eligible: z.boolean(),
  reward_eligible: z.boolean(),
  league_eligible: z.boolean(),
};
const childPreferences = z.strictObject({
  sex: z.enum(['male', 'female']).nullable(),
  interests: strings,
  hobbies: strings,
  accessibility: strings,
  support: strings,
  personalization_enabled: z.boolean(),
  custom_interest: text.nullable(),
  custom_hobby: text.nullable(),
  custom_support: text.nullable(),
  custom_accessibility: text.nullable(),
});
const milestone = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('eligible_seed_delta'), requiredSeedDelta: positive }),
  z.strictObject({
    kind: z.literal('landscape_stage'),
    landscapeId: landscape,
    targetStage: earnedStage,
  }),
  z.strictObject({
    kind: z.literal('landscapes_at_stage'),
    targetStage: earnedStage,
    requiredCount: positive.max(5),
  }),
]);
const studyCriterion = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('practice_count'), target: positive.max(1_000) }),
  z.strictObject({ kind: z.literal('achievement'), description: paragraph }),
  z
    .strictObject({
      kind: z.literal('mark'),
      threshold: z.number().min(0).max(1_000_000),
      denominator: z.number().positive().max(1_000_000),
    })
    .refine((value) => value.threshold <= value.denominator),
]);
const reportedResult = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('practice_count'), count: integer.max(1_000_000) }),
  z.strictObject({ kind: z.literal('achievement'), achieved: z.boolean() }),
  z.strictObject({ kind: z.literal('mark'), value: z.number().min(0).max(1_000_000) }),
]);
const badgeCriterion = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('lifetime_seeds'), required: positive }),
  z.strictObject({ kind: z.literal('acquisition_credits'), skillId: key, required: positive }),
  z.strictObject({ kind: z.literal('prerequisite_badge'), badgeId: key }),
  z.strictObject({ kind: z.literal('station_reached'), threshold: integer }),
  z.strictObject({ kind: z.literal('learning_completed'), learningId: key }),
  z.strictObject({ kind: z.literal('semantic_component'), component: key }),
]);
const extras = z.strictObject({
  rewards: list(
    z.strictObject({
      id: uuid,
      childId: uuid,
      label,
      kind: z.enum(['money', 'gift', 'experience', 'privilege']),
      amountFils: money.min(1).nullable(),
      month: z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/),
      milestone,
      status: z.enum(['promised', 'unlocked', 'given']),
      version: positive,
      eligibleSeeds: integer,
      monthlyMaximumFils: money,
      unlockedAt: timestamp.nullable(),
      givenAt: timestamp.nullable(),
    }),
  ),
  masroofi: z.strictObject({
    cards: list(
      z.strictObject({
        childId: uuid,
        balanceFils: money,
        controlsVersion: positive,
        ageEligible: z.boolean(),
        origin: z.literal('simulated'),
        controls: z.strictObject({
          frozen: z.boolean(),
          onlineAllowed: z.boolean(),
          allowedCategories: list(spendingCategory, 8),
          perPurchaseLimitFils: money.min(1),
          dailyLimitFils: money.min(1),
        }),
      }),
      100,
    ),
    promises: list(
      z.strictObject({
        id: uuid,
        childId: uuid,
        assignmentId: uuid,
        taskVersion: positive,
        status: z.enum(['promised', 'credited']),
        amountFils: money.min(1).optional(),
      }),
    ),
    transactions: list(
      z.strictObject({
        id: uuid,
        childId: uuid,
        kind: z.enum(['reward', 'top_up', 'purchase']),
        amountFils: money.min(1),
        status: z.enum(['credited', 'approved', 'declined']),
        declineReason: decline.nullable(),
        fixtureId: product.nullable(),
        day: date,
        balanceAfterFils: money,
        assignmentId: uuid.nullable(),
      }),
    ),
    purchaseCatalog: list(
      z.strictObject({
        id: product,
        category: spendingCategory,
        online: z.boolean(),
        amountFils: money.min(1),
      }),
      100,
    ),
  }),
  studyPlans: list(
    z.strictObject({
      id: uuid,
      childId: uuid,
      createdBy: role,
      subject: label.max(80),
      title: label.max(120),
      nextStep: paragraph,
      durationMinutes: positive.max(60),
      dueDate: date.nullable(),
      revisitDate: date.nullable(),
      status: z.enum(['proposed', 'planned', 'active', 'paused', 'completed']),
      helpRequest: z.enum(['explain', 'smaller_step', 'together']).nullable(),
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: timestamp.nullable(),
    }),
  ),
  goals: list(
    z.strictObject({
      id: uuid,
      childId: uuid,
      createdBy: role,
      subject: label.max(80),
      title: label.max(120),
      nextStep: paragraph,
      parentSupport: paragraph,
      targetDate: date.nullable().default(null),
      reviewDate: date.nullable().default(null),
      criterion: studyCriterion,
      prize: z
        .strictObject({ kind: z.enum(['gift', 'experience', 'privilege']), label })
        .nullable(),
      status: z.enum([
        'proposed',
        'active',
        'paused',
        'awaiting_confirmation',
        'acknowledged',
        'declined',
        'change_requested',
      ]),
      revision: positive,
      parentApprovedRevision: positive.nullable(),
      childAcceptedRevision: positive.nullable(),
      submissions: list(
        z.strictObject({
          id: uuid,
          result: reportedResult,
          submittedAt: timestamp,
          reviewedAt: timestamp.nullable(),
          acknowledgement: text.nullable(),
          metCriterion: z.boolean().nullable(),
        }),
        1_000,
      ),
      prizeStatus: z.enum(['promised', 'unlocked', 'given']).nullable(),
      createdAt: timestamp,
      updatedAt: timestamp,
      acknowledgedAt: timestamp.nullable(),
      unlockedAt: timestamp.nullable(),
      givenAt: timestamp.nullable(),
    }),
  ),
  learning: z.strictObject({
    packages: list(
      z.strictObject({
        id: key,
        labelAr: label,
        labelEn: label,
        unlockThreshold: integer,
        available: z.boolean(),
        unlockedChildIds: list(uuid, 100),
        steps: z.strictObject({ story: keys, accessible: keys }),
        checkOptions: keys,
      }),
      100,
    ),
    progress: list(
      z.strictObject({
        childId: uuid,
        learningId: key,
        route,
        completedStepIds: keys,
        checkSatisfied: z.boolean(),
      }),
    ),
    completions: list(z.strictObject({ childId: uuid, learningId: key, completedAt: timestamp })),
    badges: list(
      z.strictObject({
        childId: uuid,
        id: key,
        labelAr: label,
        labelEn: label,
        criteria: list(badgeCriterion, 20),
        earnedAt: timestamp.nullable(),
      }),
    ),
  }),
  league: z.strictObject({
    circles: list(
      z.strictObject({
        id: uuid,
        name: label.max(80),
        isOwner: z.boolean(),
        rows: list(
          z.strictObject({
            nickname: label.max(40),
            avatarId: landscape,
            rank: positive,
            score: integer.max(100),
            confirmedLeaves: integer.max(5),
          }),
          1_000,
        ),
        canopyContributions: integer,
        greenActions: integer,
        canopyHistory: list(z.strictObject({ week: date, contributions: integer })),
        memberships: list(
          z.strictObject({
            childId: uuid,
            nickname: label.max(40),
            avatarId: landscape,
            nominatedAssignmentIds: list(uuid, 5),
            eligibleAssignmentIds: list(uuid),
            restWeek: z.boolean(),
          }),
          100,
        ),
      }),
      100,
    ),
    invitations: list(z.strictObject({ id: uuid, circleName: label.max(80) }), 100),
  }),
});

const snapshotSchema = z.strictObject({
  schema_version: z.literal(1),
  revision: integer,
  actor: z.strictObject({ user_id: uuid, role, family_id: uuid, child_id: uuid.nullable() }),
  family: z.strictObject({
    id: uuid,
    name: z.string().max(160),
    locale,
    revision: integer,
    guardian_names: list(label, 20),
    relatives: list(
      z.strictObject({
        id: uuid,
        display_name: label,
        relationship: z.enum(['grandmother', 'grandfather', 'aunt', 'uncle']),
        rhythm: z.enum(['weekly', 'monthly', 'every_three_months', 'no_schedule']),
      }),
      100,
    ),
  }),
  children: list(
    z.strictObject({
      id: uuid,
      family_id: uuid,
      nickname: label,
      age_band: ageBand.nullable(),
      age10_plus_confirmed: z.boolean(),
      preferred_language: z.enum(['ar', 'en', 'both']),
      avatar_id: key,
      active: z.boolean(),
      preferences: childPreferences,
    }),
    100,
  ),
  categories: list(
    z.strictObject({ id: category, label_ar: label, label_en: label, landscape_id: landscape }),
    100,
  ),
  landscapes: list(z.strictObject({ id: landscape, label_ar: label, label_en: label }), 100),
  templates: list(
    z.strictObject({
      id: key,
      category_id: category,
      landscape_id: landscape,
      title_ar: label,
      title_en: label,
      definition_ar: text,
      definition_en: text,
      steps_ar: strings,
      steps_en: strings,
      ...taskTerms,
      skill_ids: keys,
      permitted_help_ar: text,
      permitted_help_en: text,
      supervision_ar: text,
      supervision_en: text,
      safety_ar: safety,
      safety_en: safety,
      recurrence,
      age_bands: list(ageBand, 3),
      positive_action_ar: text,
      positive_action_en: text,
      why_it_matters_ar: text,
      why_it_matters_en: text,
    }),
    1_000,
  ),
  tasks: list(
    z.strictObject({
      id: uuid,
      family_id: uuid,
      child_id: uuid,
      version: positive,
      status: z.enum(['draft', 'reviewed', 'assigned']),
      template_id: key.nullable(),
      title: label,
      definition_of_done: text,
      steps: strings,
      content_locale: locale,
      category_id: category,
      landscape_id: landscape,
      ...taskTerms,
      created_at: timestamp,
      permitted_help: text,
      supervision: text,
      safety,
      recurrence,
      positive_action: text,
      why_it_matters: text,
    }),
  ),
  assignments: list(
    z.strictObject({
      id: uuid,
      family_id: uuid,
      child_id: uuid,
      task_id: uuid,
      task_version: positive,
      state: z.enum([
        'assigned',
        'chosen',
        'in_progress',
        'submitted',
        'retry',
        'confirmed',
        'recognized',
      ]),
      help_requested: z.boolean(),
      created_at: timestamp,
    }),
  ),
  submissions: list(
    z.strictObject({
      id: uuid,
      assignment_id: uuid,
      child_id: uuid,
      task_version: positive,
      attempt: positive,
      completion_mode: z.enum(['independent', 'permitted_help']),
      definition_acknowledged: z.literal(true),
      submitted_at: timestamp,
    }),
  ),
  check_ins: list(
    z.strictObject({
      id: uuid,
      assignment_id: uuid,
      submission_id: uuid,
      decision: z.enum(['confirm', 'kind_retry']),
      praise: text.nullable(),
      observation: text.nullable(),
      presentation: z
        .enum(['editing_praise', 'praise_presented', 'recognition_applied'])
        .nullable(),
      created_at: timestamp,
    }),
  ),
  adjustments: list(
    z.strictObject({
      id: uuid,
      assignment_id: uuid,
      child_id: uuid,
      source_version: positive,
      proposed_version: positive.nullable(),
      status: z.enum([
        'parent_review_required',
        'child_decision_required',
        'accepted',
        'kept_current',
      ]),
    }),
  ),
  recognitions: list(
    z.strictObject({
      id: uuid,
      child_id: uuid,
      assignment_id: uuid,
      task_id: uuid,
      task_version: positive,
      submission_id: uuid,
      check_in_id: uuid,
      seed_amount: integer.max(15),
      landscape_id: landscape,
      created_at: timestamp,
    }),
  ),
  seed_entries: list(
    z.strictObject({
      id: uuid,
      child_id: uuid,
      recognition_id: uuid,
      amount: positive.max(15),
      created_at: timestamp,
    }),
  ),
  landscape_progress: list(
    z.strictObject({
      child_id: uuid,
      landscape_id: landscape,
      cumulative_seeds: integer,
      stage,
      next_threshold: positive.nullable(),
    }),
    500,
  ),
  legacy_records: list(
    z.strictObject({
      id: uuid,
      child_id: uuid,
      kind: z.enum(['task', 'study']),
      title: label,
      subject: text.nullable(),
      next_step: text.nullable(),
      completed: z.boolean(),
      source_id: uuid,
      converted_task_id: uuid.nullable(),
    }),
  ),
  legacy_available: z.boolean(),
  extras,
  saved_templates: list(
    z.strictObject({ id: uuid, title: label, task_id: uuid, task_version: positive }),
  ),
  reveals: list(
    z.strictObject({
      id: uuid,
      child_id: uuid,
      recognition_id: uuid,
      acknowledged_at: timestamp.nullable(),
    }),
  ),
  impact_paths: list(
    z.strictObject({
      child_id: uuid,
      lifetime_seeds: integer,
      reached_thresholds: list(integer, 100),
      next_threshold: positive.nullable(),
      chapter_state: z.enum(['not_entered', 'active', 'completed']),
    }),
    100,
  ),
  permissions: list(
    z.strictObject({
      child_id: uuid,
      voice_granted: z.boolean(),
      media_granted: z.boolean(),
      ai_granted: z.boolean(),
      revision: integer,
    }),
    100,
  ),
  community: z.strictObject({
    status: z.enum(['continued', 'paused', 'ended']),
    revision: integer,
  }),
});

function invalid(): never {
  throw new CloudFamilyError('service_unavailable');
}

function denied(): never {
  throw new CloudFamilyError('access_denied');
}

function unique<T>(values: readonly T[], identify: (value: T) => string): Map<string, T> {
  const result = new Map<string, T>();
  for (const value of values) {
    const id = identify(value);
    if (result.has(id)) invalid();
    result.set(id, value);
  }
  return result;
}

function references(snapshot: CloudSnapshot, expected: CloudExpectedActor): void {
  const { actor, family } = snapshot;
  if (
    actor.user_id !== expected.userId ||
    actor.role !== expected.role ||
    actor.family_id !== family.id ||
    (expected.familyId !== undefined && actor.family_id !== expected.familyId)
  )
    denied();
  if (
    expected.role === 'parent'
      ? actor.child_id !== null || expected.childId !== undefined
      : actor.child_id === null ||
        (expected.childId !== undefined && actor.child_id !== expected.childId)
  )
    denied();
  if (snapshot.revision !== family.revision) invalid();
  const children = unique(snapshot.children, (value) => value.id);
  const child = (id: string) => {
    if (!children.has(id) || (actor.role === 'child' && id !== actor.child_id)) denied();
  };
  for (const value of children.values()) {
    if (value.family_id !== family.id) denied();
    child(value.id);
    if (value.age_band === '6_8' && value.age10_plus_confirmed) invalid();
  }
  if (
    actor.role === 'child' &&
    (children.size !== 1 ||
      !children.get(actor.child_id!)?.active ||
      family.relatives.length > 0 ||
      snapshot.legacy_records.length > 0 ||
      snapshot.legacy_available ||
      snapshot.saved_templates.length > 0)
  )
    denied();
  unique(family.relatives, (value) => value.id);
  const landscapes = unique(snapshot.landscapes, (value) => value.id);
  const categories = unique(snapshot.categories, (value) => value.id);
  const templates = unique(snapshot.templates, (value) => value.id);
  for (const value of categories.values()) if (!landscapes.has(value.landscape_id)) invalid();
  const checkTerms = (
    value: CloudSnapshot['tasks'][number] | CloudSnapshot['templates'][number],
  ) => {
    if (!categories.has(value.category_id) || !landscapes.has(value.landscape_id)) invalid();
    if (
      value.circle_eligible &&
      (value.category_id !== 'green_impact' || value.visibility_scope !== 'household')
    )
      invalid();
    if (
      value.recognition_mode === 'recognition_only'
        ? value.routine_phase !== 'not_applicable' || value.seed_award !== null
        : value.routine_phase === 'not_applicable'
    )
      invalid();
    if (
      value.routine_phase === 'acquisition'
        ? ![4, 6, 8, 12, 15].includes(value.seed_award ?? -1)
        : value.seed_award !== null
    )
      invalid();
  };
  for (const value of templates.values()) checkTerms(value);
  const tasks = unique(snapshot.tasks, (value) => `${value.id}:${value.version}`);
  const taskIds = new Set(snapshot.tasks.map((value) => value.id));
  for (const value of tasks.values()) {
    child(value.child_id);
    if (value.family_id !== family.id) denied();
    if (value.template_id !== null && !templates.has(value.template_id)) invalid();
    checkTerms(value);
    if (actor.role === 'child' && value.status !== 'assigned') denied();
  }
  const assignments = unique(snapshot.assignments, (value) => value.id);
  for (const value of assignments.values()) {
    child(value.child_id);
    if (value.family_id !== family.id) denied();
    const task = tasks.get(`${value.task_id}:${value.task_version}`);
    if (!task || task.child_id !== value.child_id || task.status !== 'assigned') invalid();
  }
  const submissions = unique(snapshot.submissions, (value) => value.id);
  unique(snapshot.submissions, (value) => `${value.assignment_id}:${value.attempt}`);
  for (const value of submissions.values()) {
    child(value.child_id);
    const assignment = assignments.get(value.assignment_id);
    if (
      !assignment ||
      assignment.child_id !== value.child_id ||
      !tasks.has(`${assignment.task_id}:${value.task_version}`)
    )
      invalid();
  }
  const checkIns = unique(snapshot.check_ins, (value) => value.id);
  for (const value of checkIns.values()) {
    const submission = submissions.get(value.submission_id);
    if (
      !submission ||
      submission.assignment_id !== value.assignment_id ||
      !assignments.has(value.assignment_id)
    )
      invalid();
    if (value.decision === 'kind_retry' && value.presentation !== null) invalid();
  }
  unique(snapshot.adjustments, (value) => value.id);
  for (const value of snapshot.adjustments) {
    child(value.child_id);
    const assignment = assignments.get(value.assignment_id);
    if (
      !assignment ||
      assignment.child_id !== value.child_id ||
      !tasks.has(`${assignment.task_id}:${value.source_version}`) ||
      (value.proposed_version !== null &&
        !tasks.has(`${assignment.task_id}:${value.proposed_version}`))
    )
      invalid();
  }
  const recognitions = unique(snapshot.recognitions, (value) => value.id);
  unique(snapshot.recognitions, (value) => value.assignment_id);
  for (const value of recognitions.values()) {
    child(value.child_id);
    const assignment = assignments.get(value.assignment_id);
    const task = tasks.get(`${value.task_id}:${value.task_version}`);
    const checkIn = checkIns.get(value.check_in_id);
    const submission = submissions.get(value.submission_id);
    if (
      !assignment ||
      !task ||
      !checkIn ||
      !submission ||
      assignment.child_id !== value.child_id ||
      assignment.task_id !== value.task_id ||
      submission.assignment_id !== value.assignment_id ||
      submission.task_version !== value.task_version ||
      checkIn.submission_id !== value.submission_id ||
      checkIn.decision !== 'confirm' ||
      checkIn.presentation !== 'recognition_applied' ||
      value.landscape_id !== task.landscape_id ||
      value.seed_amount !== (task.seed_award ?? 0)
    )
      invalid();
  }
  unique(snapshot.seed_entries, (value) => value.id);
  unique(snapshot.seed_entries, (value) => value.recognition_id);
  for (const value of snapshot.seed_entries) {
    child(value.child_id);
    const recognition = recognitions.get(value.recognition_id);
    if (
      !recognition ||
      recognition.child_id !== value.child_id ||
      recognition.seed_amount !== value.amount
    )
      invalid();
  }
  unique(snapshot.landscape_progress, (value) => `${value.child_id}:${value.landscape_id}`);
  for (const value of snapshot.landscape_progress) {
    child(value.child_id);
    if (
      !landscapes.has(value.landscape_id) ||
      (value.next_threshold !== null && value.next_threshold <= value.cumulative_seeds)
    )
      invalid();
  }
  unique(snapshot.legacy_records, (value) => value.id);
  for (const value of snapshot.legacy_records) {
    child(value.child_id);
    if (value.converted_task_id !== null && !taskIds.has(value.converted_task_id)) invalid();
  }
  unique(snapshot.saved_templates, (value) => value.id);
  for (const value of snapshot.saved_templates)
    if (!tasks.has(`${value.task_id}:${value.task_version}`)) invalid();
  unique(snapshot.reveals, (value) => value.id);
  unique(snapshot.reveals, (value) => value.recognition_id);
  for (const value of snapshot.reveals) {
    child(value.child_id);
    if (recognitions.get(value.recognition_id)?.child_id !== value.child_id) invalid();
  }
  unique(snapshot.impact_paths, (value) => value.child_id);
  for (const value of snapshot.impact_paths) {
    child(value.child_id);
    unique(value.reached_thresholds, String);
    if (
      value.reached_thresholds.some((threshold) => threshold > value.lifetime_seeds) ||
      (value.next_threshold !== null && value.next_threshold <= value.lifetime_seeds)
    )
      invalid();
  }
  const extra = snapshot.extras;
  unique(snapshot.permissions, (value) => value.child_id);
  for (const value of snapshot.permissions) child(value.child_id);
  unique(extra.rewards, (value) => value.id);
  for (const value of extra.rewards) {
    child(value.childId);
    if (
      (value.kind === 'money') !== (value.amountFils !== null) ||
      (value.status === 'promised') !== (value.unlockedAt === null) ||
      (value.status === 'given') !== (value.givenAt !== null)
    )
      invalid();
  }
  const cards = unique(extra.masroofi.cards, (value) => value.childId);
  for (const value of cards.values()) {
    child(value.childId);
    const profile = children.get(value.childId)!;
    const ageEligible =
      profile.active &&
      profile.age10_plus_confirmed &&
      (profile.age_band === '9_11' || profile.age_band === '12_14');
    if (value.ageEligible !== ageEligible) invalid();
    unique(value.controls.allowedCategories, (id) => id);
  }
  unique(extra.masroofi.promises, (value) => value.id);
  unique(extra.masroofi.promises, (value) => `${value.assignmentId}:${value.taskVersion}`);
  for (const value of extra.masroofi.promises) {
    child(value.childId);
    if (actor.role === 'child' && value.status === 'promised' && Object.hasOwn(value, 'amountFils'))
      denied();
    const assignment = assignments.get(value.assignmentId);
    if (
      !cards.has(value.childId) ||
      !assignment ||
      assignment.child_id !== value.childId ||
      !tasks.has(`${assignment.task_id}:${value.taskVersion}`) ||
      ((actor.role === 'parent' || value.status === 'credited') && value.amountFils === undefined)
    )
      invalid();
  }
  const products = unique(extra.masroofi.purchaseCatalog, (value) => value.id);
  unique(extra.masroofi.transactions, (value) => value.id);
  for (const value of extra.masroofi.transactions) {
    child(value.childId);
    if (
      !cards.has(value.childId) ||
      (value.status === 'declined') !== (value.declineReason !== null) ||
      (value.kind === 'purchase'
        ? value.fixtureId === null || !products.has(value.fixtureId) || value.status === 'credited'
        : value.fixtureId !== null || value.status !== 'credited') ||
      (value.assignmentId !== null &&
        assignments.get(value.assignmentId)?.child_id !== value.childId)
    )
      invalid();
  }
  unique(extra.studyPlans, (value) => value.id);
  for (const value of extra.studyPlans) {
    child(value.childId);
    if ((value.status === 'completed') !== (value.completedAt !== null)) invalid();
  }
  unique(extra.goals, (value) => value.id);
  for (const value of extra.goals) {
    child(value.childId);
    if (
      value.targetDate !== null &&
      value.reviewDate !== null &&
      value.reviewDate < value.targetDate
    )
      invalid();
    if (
      (value.parentApprovedRevision ?? 0) > value.revision ||
      (value.childAcceptedRevision ?? 0) > value.revision ||
      (value.status === 'acknowledged') !== (value.acknowledgedAt !== null) ||
      (value.prize === null) !== (value.prizeStatus === null) ||
      (value.prizeStatus === 'given') !== (value.givenAt !== null)
    )
      invalid();
    unique(value.submissions, (item) => item.id);
    for (const submission of value.submissions)
      if (
        submission.result.kind !== value.criterion.kind ||
        (submission.reviewedAt === null) !== (submission.metCriterion === null) ||
        (submission.reviewedAt === null) !== (submission.acknowledgement === null)
      )
        invalid();
  }
  const packages = unique(extra.learning.packages, (value) => value.id);
  for (const value of packages.values()) {
    unique(value.unlockedChildIds, (id) => id);
    for (const id of value.unlockedChildIds) child(id);
    unique(value.steps.story, (id) => id);
    unique(value.steps.accessible, (id) => id);
    unique(value.checkOptions, (id) => id);
  }
  unique(extra.learning.progress, (value) => `${value.childId}:${value.learningId}:${value.route}`);
  for (const value of extra.learning.progress) {
    child(value.childId);
    const learning = packages.get(value.learningId);
    if (!learning) invalid();
    unique(value.completedStepIds, (id) => id);
    for (const step of value.completedStepIds)
      if (!learning.steps[value.route].includes(step)) invalid();
  }
  unique(extra.learning.completions, (value) => `${value.childId}:${value.learningId}`);
  for (const value of extra.learning.completions) {
    child(value.childId);
    if (!packages.has(value.learningId)) invalid();
  }
  unique(extra.learning.badges, (value) => `${value.childId}:${value.id}`);
  for (const value of extra.learning.badges) child(value.childId);
  unique(extra.league.circles, (value) => value.id);
  for (const value of extra.league.circles) {
    if (actor.role === 'child' && value.isOwner) denied();
    unique(value.memberships, (item) => item.childId);
    unique(value.canopyHistory, (item) => item.week);
    for (const membership of value.memberships) {
      child(membership.childId);
      unique(membership.nominatedAssignmentIds, (id) => id);
      unique(membership.eligibleAssignmentIds, (id) => id);
      for (const id of membership.nominatedAssignmentIds)
        if (assignments.get(id)?.child_id !== membership.childId) invalid();
      for (const id of membership.eligibleAssignmentIds) {
        const assignment = assignments.get(id);
        if (
          !assignment ||
          assignment.child_id !== membership.childId ||
          !tasks.get(`${assignment.task_id}:${assignment.task_version}`)?.league_eligible
        )
          invalid();
      }
    }
    const rankByScore = new Map<number, number>();
    const scores = value.rows.map((row) => row.score).sort((a, b) => b - a);
    scores.forEach((score, index) => {
      if (!rankByScore.has(score)) rankByScore.set(score, index + 1);
    });
    for (const row of value.rows)
      if (row.score !== row.confirmedLeaves * 20 || row.rank !== rankByScore.get(row.score))
        invalid();
  }
  unique(extra.league.invitations, (value) => value.id);
  if (actor.role === 'child' && extra.league.invitations.length > 0) denied();
}

export function parseCloudSnapshot(value: unknown, expected: CloudExpectedActor): CloudSnapshot {
  const parsed = snapshotSchema.safeParse(value);
  if (!parsed.success) invalid();
  const snapshot: CloudSnapshot = parsed.data;
  references(snapshot, expected);
  return snapshot;
}

const commandResultSchema = z.strictObject({
  ok: z.literal(true).optional(),
  id: uuid.optional(),
  child_id: uuid.optional(),
  task_id: uuid.optional(),
  assignment_id: uuid.optional(),
  submission_id: uuid.optional(),
  check_in_id: uuid.optional(),
  recognition_id: uuid.optional(),
  adjustment_id: uuid.optional(),
  saved_template_id: uuid.optional(),
  reveal_id: uuid.optional(),
  token: z.string().min(16).max(256).optional(),
  expires_at: timestamp.optional(),
  status: z.enum(['approved', 'declined']).optional(),
  declineReason: decline.nullable().optional(),
});

export function parseCloudCommandResult(
  value: unknown,
  expected: CloudExpectedActor,
): CloudCommandResult {
  const parsed = z
    .strictObject({ snapshot: z.unknown(), result: commandResultSchema })
    .safeParse(value);
  if (!parsed.success) invalid();
  const snapshot = parseCloudSnapshot(parsed.data.snapshot, expected);
  const result = parsed.data.result;
  if (Object.hasOwn(result, 'token') || Object.hasOwn(result, 'expires_at')) {
    if (expected.role !== 'parent') denied();
    if (!result.token || !result.expires_at) invalid();
  }
  if (result.status !== undefined || Object.hasOwn(result, 'declineReason')) {
    if (
      result.status === undefined ||
      result.declineReason === undefined ||
      (result.status === 'declined') !== (result.declineReason !== null)
    )
      invalid();
  }
  const receiptTargets: [string | undefined, readonly { id: string }[]][] = [
    [result.child_id, snapshot.children],
    [result.task_id, snapshot.tasks],
    [result.assignment_id, snapshot.assignments],
    [result.submission_id, snapshot.submissions],
    [result.check_in_id, snapshot.check_ins],
    [result.recognition_id, snapshot.recognitions],
    [result.adjustment_id, snapshot.adjustments],
    [result.saved_template_id, snapshot.saved_templates],
    [result.reveal_id, snapshot.reveals],
  ];
  for (const [receiptId, targets] of receiptTargets) {
    if (receiptId !== undefined && !targets.some((target) => target.id === receiptId)) invalid();
  }
  return { snapshot, result };
}

const allowedErrors = new Set<CloudFamilyErrorCode>([
  'access_denied',
  'profile_incomplete',
  'invalid_command',
  'invalid_input',
  'invalid_transition',
  'not_found',
  'revision_conflict',
  'request_conflict',
  'invalid_invitation',
  'access_revoked',
  'reauthentication_required',
  'service_unavailable',
  'network_unavailable',
]);

export function cloudError(error: unknown): CloudFamilyError {
  if (error instanceof CloudFamilyError)
    return new CloudFamilyError(allowedErrors.has(error.code) ? error.code : 'service_unavailable');
  if (typeof error !== 'object' || error === null)
    return new CloudFamilyError('service_unavailable');
  const candidate = error as {
    code?: unknown;
    message?: unknown;
    status?: unknown;
    name?: unknown;
  };
  for (const value of [candidate.code, candidate.message]) {
    if (typeof value === 'string' && allowedErrors.has(value as CloudFamilyErrorCode))
      return new CloudFamilyError(value as CloudFamilyErrorCode);
  }
  const domainCodes: Record<string, CloudFamilyErrorCode> = {
    learning_unavailable: 'invalid_transition',
    learning_locked: 'invalid_transition',
    five_leaves_required: 'invalid_input',
    week_locked: 'invalid_transition',
    immutable_reward: 'invalid_transition',
    immutable_goal: 'invalid_transition',
    immutable_evidence: 'invalid_transition',
    parent_required: 'access_denied',
    child_required: 'access_denied',
    profile_mismatch: 'access_denied',
    card_disabled: 'invalid_transition',
    age_ineligible: 'profile_incomplete',
    invalid_amount: 'invalid_input',
    invalid_controls: 'invalid_input',
    balance_limit: 'invalid_input',
    task_ineligible: 'invalid_transition',
    promise_locked: 'invalid_transition',
  };
  for (const value of [candidate.code, candidate.message]) {
    if (typeof value === 'string' && Object.hasOwn(domainCodes, value))
      return new CloudFamilyError(domainCodes[value]!);
  }
  const codes: Record<string, CloudFamilyErrorCode> = {
    PT409: 'revision_conflict',
    PT400: 'invalid_input',
    PT403: 'access_denied',
    PT404: 'not_found',
    PGRST202: 'service_unavailable',
    PGRST301: 'access_revoked',
    PGRST303: 'access_revoked',
    '42501': 'access_denied',
    '23505': 'request_conflict',
    '23503': 'invalid_input',
    '23514': 'invalid_input',
    '22P02': 'invalid_input',
    session_expired: 'access_revoked',
    session_not_found: 'access_revoked',
    refresh_token_not_found: 'access_revoked',
    refresh_token_already_used: 'access_revoked',
    user_not_found: 'access_revoked',
    bad_jwt: 'access_revoked',
    access_unavailable: 'access_denied',
    account_unavailable: 'access_denied',
    recovery_required: 'reauthentication_required',
    profile_conflict: 'revision_conflict',
    invalid_profile: 'invalid_input',
    ECONNREFUSED: 'network_unavailable',
    ECONNRESET: 'network_unavailable',
    ETIMEDOUT: 'network_unavailable',
    ENOTFOUND: 'network_unavailable',
  };
  if (typeof candidate.code === 'string' && Object.hasOwn(codes, candidate.code))
    return new CloudFamilyError(codes[candidate.code]!);
  if (candidate.status === 401 || candidate.name === 'AuthSessionMissingError')
    return new CloudFamilyError('access_revoked');
  if (candidate.status === 403) return new CloudFamilyError('access_denied');
  if (
    candidate.status === 0 ||
    ['AbortError', 'TimeoutError', 'TypeError', 'AuthRetryableFetchError'].includes(
      String(candidate.name),
    )
  )
    return new CloudFamilyError('network_unavailable');
  return new CloudFamilyError('service_unavailable');
}
