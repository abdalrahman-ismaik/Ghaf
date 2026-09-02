import { z } from 'zod';

import type { DomainErrorCode, DomainResult, TaskCategoryId } from '../../models/familyGrowth';
import {
  CHALLENGE_LEAVES_PER_WEEK,
  type ChallengeLeaf,
  type ChallengeLeafCandidate,
  type ConfirmChallengeLeafInput,
  type CreateLeagueWeekInput,
  type FamilyLeagueWeek,
  type LeagueEligibilityDecision,
  type LeagueParticipantId,
  type LeagueParticipantProjection,
  type LeagueProjectionInput,
  type LeagueRolloverInput,
  type LeagueRolloverResult,
  type PreparedEncouragementApplication,
  type PreparedLeagueEncouragementId,
  type SyntheticLeagueParticipant,
  type WeeklyGrowthResult,
} from '../../models/familyLeague';

export const SYNTHETIC_LEAGUE_PARTICIPANTS = [
  {
    id: 'child_salem',
    relationship: 'sibling',
    nickname: { ar: 'سالم', en: 'Salem' },
    treeAvatarToken: 'mangrove_shoot',
    ageBand: '9_11',
    invited: true,
    origin: 'synthetic',
  },
  {
    id: 'child_alya',
    relationship: 'sibling',
    nickname: { ar: 'علياء', en: 'Alya' },
    treeAvatarToken: 'ghaf_leaf',
    ageBand: '9_11',
    invited: true,
    origin: 'synthetic',
  },
  {
    id: 'cousin_noura',
    relationship: 'cousin',
    nickname: { ar: 'نورة', en: 'Noura' },
    treeAvatarToken: 'sidr_sapling',
    ageBand: '6_8',
    invited: true,
    origin: 'synthetic',
  },
] as const satisfies readonly SyntheticLeagueParticipant[];

export const PREPARED_LEAGUE_ENCOURAGEMENTS = {
  great_growing: { ar: 'نموّ رائع!', en: 'Great growing!' },
  keep_growing: { ar: 'استمر في النموّ!', en: 'Keep growing!' },
  one_leaf_together: { ar: 'ورقة أخرى لهدف الأسرة!', en: 'One more Leaf for the family goal!' },
} as const satisfies Readonly<
  Record<PreparedLeagueEncouragementId, { readonly ar: string; readonly en: string }>
>;

const PARTICIPANT_IDS = SYNTHETIC_LEAGUE_PARTICIPANTS.map((participant) => participant.id) as [
  LeagueParticipantId,
  LeagueParticipantId,
  LeagueParticipantId,
];
const participantIdSchema = z.enum(PARTICIPANT_IDS);
const ageBandSchema = z.enum(['6_8', '9_11', '12_14']);
const categorySchema = z.enum([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);
const gardenStageSchema = z.enum(['seed', 'shoot', 'sapling', 'shade', 'flourishing']);
const completionModeSchema = z.enum(['independent', 'permitted_help']);
const weekKeySchema = z.string().regex(/^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/u);
const localizedTextSchema = z.object({ ar: z.string().min(1), en: z.string().min(1) }).strict();
const taskReferenceSchema = z
  .object({ taskId: z.string().trim().min(1), taskVersion: z.number().int().positive() })
  .strict();
const protectedContentSchema = z
  .object({
    prayer: z.boolean(),
    kinship: z.boolean(),
    affection: z.boolean(),
    emotionalDisclosure: z.boolean(),
    relationshipCloseness: z.boolean(),
    foodConsumption: z.boolean(),
    privateWellbeing: z.boolean(),
    hygiene: z.boolean(),
    disabilityRelatedRoutine: z.boolean(),
  })
  .strict();
const challengeLeafCandidateSchema = z
  .object({
    id: z.string().trim().min(1),
    participantId: participantIdSchema,
    ageBands: z.array(ageBandSchema).min(1),
    approvedTaskRef: taskReferenceSchema,
    categoryId: categorySchema,
    visibilityScope: z.enum(['child_guardian', 'household']),
    parentApproved: z.boolean(),
    accessibilityAdaptable: z.boolean(),
    protectedContent: protectedContentSchema,
  })
  .strict();
const participantSchema = z
  .object({
    id: participantIdSchema,
    relationship: z.enum(['sibling', 'cousin']),
    nickname: localizedTextSchema,
    treeAvatarToken: z.enum(['mangrove_shoot', 'ghaf_leaf', 'sidr_sapling']),
    ageBand: ageBandSchema,
    invited: z.literal(true),
    origin: z.literal('synthetic'),
  })
  .strict();
const challengeLeafBaseSchema = z.object({
  id: z.string().trim().min(1),
  weekKey: weekKeySchema,
  participantId: participantIdSchema,
  ageBand: ageBandSchema,
  approvedTaskRef: taskReferenceSchema,
  categoryId: categorySchema,
  visibilityScope: z.literal('household'),
  parentApproved: z.literal(true),
  accessibilityAdaptable: z.literal(true),
  protectedContent: protectedContentSchema,
});
const assignedChallengeLeafSchema = challengeLeafBaseSchema
  .extend({
    state: z.literal('assigned'),
    recognitionKey: z.null(),
    completionMode: z.null(),
    accessibilityAdapted: z.literal(false),
  })
  .strict();
const confirmedChallengeLeafSchema = challengeLeafBaseSchema
  .extend({
    state: z.literal('confirmed'),
    recognitionKey: z.string().trim().min(1),
    completionMode: completionModeSchema,
    accessibilityAdapted: z.boolean(),
  })
  .strict();
const challengeLeafSchema = z.discriminatedUnion('state', [
  assignedChallengeLeafSchema,
  confirmedChallengeLeafSchema,
]);
const confirmationLedgerEntrySchema = z
  .object({
    recognitionKey: z.string().trim().min(1),
    leafId: z.string().trim().min(1),
    participantId: participantIdSchema,
  })
  .strict();
const preparedEncouragementSchema = z
  .object({
    id: z.string().trim().min(1),
    weekKey: weekKeySchema,
    senderId: participantIdSchema,
    recipientId: participantIdSchema,
    phraseId: z.enum(['great_growing', 'keep_growing', 'one_leaf_together']),
    text: localizedTextSchema,
    origin: z.literal('prepared'),
  })
  .strict();
const familyLeagueWeekSchema = z
  .object({
    weekKey: weekKeySchema,
    timeZone: z.literal('Asia/Dubai'),
    invitedParticipants: z.array(participantSchema).length(SYNTHETIC_LEAGUE_PARTICIPANTS.length),
    optedOutParticipantIds: z.array(participantIdSchema),
    leaves: z.array(challengeLeafSchema),
    confirmationLedger: z.record(z.string(), confirmationLedgerEntrySchema),
    cooperativeConfirmedCount: z.number().int().nonnegative(),
    cooperativeGoal: z.number().int().nonnegative(),
    preparedEncouragementLedger: z.array(preparedEncouragementSchema),
    origin: z.literal('synthetic_local'),
  })
  .strict();
const projectionCandidateSchema = z
  .object({
    participantId: participantIdSchema,
    completedLeafCount: z.number().int().min(0).max(CHALLENGE_LEAVES_PER_WEEK),
    score: z.number().int().min(0).max(100),
    position: z.number().int().positive(),
    protectedContentPresent: z.literal(false),
  })
  .strict();
const projectionInputSchema = z
  .object({ participants: z.array(projectionCandidateSchema) })
  .strict();
const preparedEncouragementInputSchema = z
  .object({
    week: familyLeagueWeekSchema,
    senderId: participantIdSchema,
    recipientId: participantIdSchema,
    phraseId: z.enum(['great_growing', 'keep_growing', 'one_leaf_together']),
  })
  .strict();
const permanentProgressSchema = z
  .object({
    earnedSeedsByChild: z
      .object({
        child_salem: z.number().int().nonnegative(),
        child_alya: z.number().int().nonnegative(),
      })
      .strict(),
    gardenByLandscape: z
      .object({
        ghaf: z
          .object({ cumulativeSeeds: z.number().int().nonnegative(), stage: gardenStageSchema })
          .strict(),
        samar: z
          .object({ cumulativeSeeds: z.number().int().nonnegative(), stage: gardenStageSchema })
          .strict(),
        sidr: z
          .object({ cumulativeSeeds: z.number().int().nonnegative(), stage: gardenStageSchema })
          .strict(),
        date_palm: z
          .object({ cumulativeSeeds: z.number().int().nonnegative(), stage: gardenStageSchema })
          .strict(),
        mangrove: z
          .object({ cumulativeSeeds: z.number().int().nonnegative(), stage: gardenStageSchema })
          .strict(),
      })
      .strict(),
  })
  .strict();

const PROTECTED_LEAGUE_CATEGORIES = new Set<TaskCategoryId>(['faith_gratitude', 'roots_kinship']);

function failure(code: DomainErrorCode, message: string): DomainResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function success<T>(data: T): DomainResult<T> {
  return { ok: true, data };
}

function fixedParticipant(participantId: LeagueParticipantId): SyntheticLeagueParticipant {
  return SYNTHETIC_LEAGUE_PARTICIPANTS.find(
    (participant) => participant.id === participantId,
  ) as SyntheticLeagueParticipant;
}

function hasProtectedContent(candidate: ChallengeLeafCandidate): boolean {
  return Object.values(candidate.protectedContent).some((value) => value);
}

export function evaluateChallengeLeafEligibility(
  candidate: ChallengeLeafCandidate,
  participant: SyntheticLeagueParticipant,
): LeagueEligibilityDecision {
  const fixed = SYNTHETIC_LEAGUE_PARTICIPANTS.find((item) => item.id === participant.id);
  if (!fixed || candidate.participantId !== fixed.id) {
    return { eligible: false, reason: 'unknown_participant' };
  }
  if (!candidate.parentApproved) return { eligible: false, reason: 'not_parent_approved' };
  if (!candidate.accessibilityAdaptable) {
    return { eligible: false, reason: 'not_accessibility_adaptable' };
  }
  if (!candidate.ageBands.includes(fixed.ageBand)) {
    return { eligible: false, reason: 'age_incompatible' };
  }
  if (candidate.visibilityScope !== 'household') {
    return { eligible: false, reason: 'private_activity' };
  }
  if (PROTECTED_LEAGUE_CATEGORIES.has(candidate.categoryId)) {
    return { eligible: false, reason: 'protected_category' };
  }
  if (hasProtectedContent(candidate)) {
    return { eligible: false, reason: 'protected_content' };
  }
  return { eligible: true, reason: null };
}

function validateFixedParticipants(participants: readonly SyntheticLeagueParticipant[]): boolean {
  return JSON.stringify(participants) === JSON.stringify(SYNTHETIC_LEAGUE_PARTICIPANTS);
}

function validateLeagueWeek(week: FamilyLeagueWeek): DomainResult<FamilyLeagueWeek> {
  const parsed = familyLeagueWeekSchema.safeParse(week);
  if (!parsed.success || !validateFixedParticipants(week.invitedParticipants)) {
    return failure('INVALID_INPUT', 'League week does not match the strict synthetic schema');
  }
  if (new Set(week.optedOutParticipantIds).size !== week.optedOutParticipantIds.length) {
    return failure('INVALID_INPUT', 'League opt-out identifiers must be unique');
  }
  const activeIds = PARTICIPANT_IDS.filter(
    (participantId) => !week.optedOutParticipantIds.includes(participantId),
  );
  const counts = activeIds.map(
    (participantId) => week.leaves.filter((item) => item.participantId === participantId).length,
  );
  if (counts.some((count) => count !== 0 && count !== CHALLENGE_LEAVES_PER_WEEK)) {
    return failure('INVALID_INPUT', 'Each active League participant needs zero or five Leaves');
  }
  if (
    week.optedOutParticipantIds.some((participantId) =>
      week.leaves.some((item) => item.participantId === participantId),
    )
  ) {
    return failure('INVALID_INPUT', 'Opted-out participants cannot hold Challenge Leaves');
  }
  if (new Set(week.leaves.map((item) => item.id)).size !== week.leaves.length) {
    return failure('INVALID_INPUT', 'Challenge Leaf identifiers must be unique');
  }
  if (week.leaves.some((item) => item.weekKey !== week.weekKey)) {
    return failure('INVALID_INPUT', 'Challenge Leaves must belong to the active League week');
  }
  const confirmedLeaves = week.leaves.filter(
    (item): item is Extract<ChallengeLeaf, { state: 'confirmed' }> => item.state === 'confirmed',
  );
  if (week.cooperativeConfirmedCount !== confirmedLeaves.length) {
    return failure('INVALID_INPUT', 'Cooperative count must match confirmed Challenge Leaves');
  }
  if (week.cooperativeGoal !== activeIds.length * CHALLENGE_LEAVES_PER_WEEK) {
    return failure('INVALID_INPUT', 'Cooperative goal must match the active five-Leaf plans');
  }
  const ledgerEntries = Object.values(week.confirmationLedger);
  if (ledgerEntries.length !== confirmedLeaves.length) {
    return failure('INVALID_INPUT', 'League confirmation ledger is incomplete');
  }
  for (const confirmed of confirmedLeaves) {
    const entry = week.confirmationLedger[confirmed.recognitionKey];
    if (
      !entry ||
      entry.recognitionKey !== confirmed.recognitionKey ||
      entry.leafId !== confirmed.id ||
      entry.participantId !== confirmed.participantId
    ) {
      return failure('INVALID_INPUT', 'League confirmation ledger does not match its Leaf');
    }
  }
  const activeSet = new Set<LeagueParticipantId>(activeIds);
  if (
    week.preparedEncouragementLedger.some(
      (item) =>
        item.weekKey !== week.weekKey ||
        item.senderId === item.recipientId ||
        !activeSet.has(item.senderId) ||
        !activeSet.has(item.recipientId) ||
        PREPARED_LEAGUE_ENCOURAGEMENTS[item.phraseId].ar !== item.text.ar ||
        PREPARED_LEAGUE_ENCOURAGEMENTS[item.phraseId].en !== item.text.en,
    )
  ) {
    return failure('INVALID_INPUT', 'Prepared encouragement ledger is not valid for this week');
  }
  return success(week);
}

export function createFamilyLeagueWeek(
  input: CreateLeagueWeekInput,
): DomainResult<FamilyLeagueWeek> {
  if (!weekKeySchema.safeParse(input.weekKey).success || input.timeZone !== 'Asia/Dubai') {
    return failure(
      'INVALID_INPUT',
      'League week requires an ISO week key and Asia/Dubai time zone',
    );
  }
  if (
    new Set(input.optedOutParticipantIds).size !== input.optedOutParticipantIds.length ||
    input.optedOutParticipantIds.some((participantId) => !PARTICIPANT_IDS.includes(participantId))
  ) {
    return failure('INVALID_INPUT', 'League opt-out identifiers must be unique fixed invitees');
  }
  if (
    input.leaves.some((candidate) => !challengeLeafCandidateSchema.safeParse(candidate).success)
  ) {
    return failure('INVALID_INPUT', 'Challenge Leaf candidate does not match the strict schema');
  }
  if (new Set(input.leaves.map((candidate) => candidate.id)).size !== input.leaves.length) {
    return failure('INVALID_INPUT', 'Challenge Leaf identifiers must be unique');
  }
  const taskReferences = input.leaves.map(
    (candidate) =>
      `${candidate.participantId}:${candidate.approvedTaskRef.taskId}:${candidate.approvedTaskRef.taskVersion}`,
  );
  if (new Set(taskReferences).size !== taskReferences.length) {
    return failure('INVALID_INPUT', 'Each Child needs five unique approved task references');
  }

  for (const participant of SYNTHETIC_LEAGUE_PARTICIPANTS) {
    const assigned = input.leaves.filter((candidate) => candidate.participantId === participant.id);
    if (input.optedOutParticipantIds.includes(participant.id)) {
      if (assigned.length !== 0) {
        return failure('INVALID_INPUT', 'Opted-out invitees cannot receive Challenge Leaves');
      }
      continue;
    }
    if (assigned.length !== CHALLENGE_LEAVES_PER_WEEK) {
      return failure(
        'INVALID_INPUT',
        'Each participating Child needs exactly five Challenge Leaves',
      );
    }
    for (const candidate of assigned) {
      const eligibility = evaluateChallengeLeafEligibility(candidate, participant);
      if (!eligibility.eligible) {
        const code =
          eligibility.reason === 'private_activity' ||
          eligibility.reason === 'protected_category' ||
          eligibility.reason === 'protected_content'
            ? 'SAFETY_REJECTED'
            : 'INVALID_INPUT';
        return failure(code, `Challenge Leaf is not eligible: ${eligibility.reason}`);
      }
    }
  }

  const leaves: readonly ChallengeLeaf[] = input.leaves.map((candidate) => ({
    id: candidate.id,
    weekKey: input.weekKey,
    participantId: candidate.participantId,
    ageBand: fixedParticipant(candidate.participantId).ageBand,
    approvedTaskRef: { ...candidate.approvedTaskRef },
    categoryId: candidate.categoryId,
    visibilityScope: 'household',
    parentApproved: true,
    accessibilityAdaptable: true,
    protectedContent: { ...candidate.protectedContent },
    state: 'assigned',
    recognitionKey: null,
    completionMode: null,
    accessibilityAdapted: false,
  }));
  const activeCount = SYNTHETIC_LEAGUE_PARTICIPANTS.length - input.optedOutParticipantIds.length;
  return success({
    weekKey: input.weekKey,
    timeZone: input.timeZone,
    invitedParticipants: SYNTHETIC_LEAGUE_PARTICIPANTS,
    optedOutParticipantIds: [...input.optedOutParticipantIds],
    leaves,
    confirmationLedger: {},
    cooperativeConfirmedCount: 0,
    cooperativeGoal: activeCount * CHALLENGE_LEAVES_PER_WEEK,
    preparedEncouragementLedger: [],
    origin: 'synthetic_local',
  });
}

export function confirmChallengeLeaf(
  input: ConfirmChallengeLeafInput,
): DomainResult<FamilyLeagueWeek> {
  const validWeek = validateLeagueWeek(input.week);
  if (!validWeek.ok) return validWeek;
  if (!input.recognitionKey.trim()) {
    return failure('INVALID_INPUT', 'League recognition key cannot be empty');
  }
  const existingCredit = input.week.confirmationLedger[input.recognitionKey];
  if (existingCredit) {
    return existingCredit.leafId === input.leafId
      ? success(input.week)
      : failure('INVALID_TRANSITION', 'Recognition key already credits another Challenge Leaf');
  }
  const leafIndex = input.week.leaves.findIndex((item) => item.id === input.leafId);
  if (leafIndex < 0) return failure('NOT_FOUND', 'Challenge Leaf was not assigned in this week');
  const leaf = input.week.leaves[leafIndex];
  if (!leaf) return failure('NOT_FOUND', 'Challenge Leaf was not assigned in this week');
  if (leaf.state === 'confirmed') {
    return leaf.recognitionKey === input.recognitionKey
      ? success(input.week)
      : failure('INVALID_TRANSITION', 'Challenge Leaf is already confirmed');
  }
  if (input.week.optedOutParticipantIds.includes(leaf.participantId)) {
    return failure('INVALID_TRANSITION', 'Opted-out participant cannot receive League credit');
  }
  const confirmed: ChallengeLeaf = {
    ...leaf,
    state: 'confirmed',
    recognitionKey: input.recognitionKey,
    completionMode: input.completionMode,
    accessibilityAdapted: input.accessibilityAdapted,
  };
  const leaves = input.week.leaves.map((item, index) => (index === leafIndex ? confirmed : item));
  return success({
    ...input.week,
    leaves,
    confirmationLedger: {
      ...input.week.confirmationLedger,
      [input.recognitionKey]: {
        recognitionKey: input.recognitionKey,
        leafId: leaf.id,
        participantId: leaf.participantId,
      },
    },
    cooperativeConfirmedCount: input.week.cooperativeConfirmedCount + 1,
  });
}

export function calculateWeeklyGrowthResults(
  week: FamilyLeagueWeek,
): DomainResult<readonly WeeklyGrowthResult[]> {
  const validWeek = validateLeagueWeek(week);
  if (!validWeek.ok) return validWeek;
  const results = week.invitedParticipants
    .filter((participant) => !week.optedOutParticipantIds.includes(participant.id))
    .map((participant) => {
      const completedLeafCount = week.leaves.filter(
        (item) => item.participantId === participant.id && item.state === 'confirmed',
      ).length;
      return {
        participantId: participant.id,
        completedLeafCount,
        score: Math.min(100, (completedLeafCount / CHALLENGE_LEAVES_PER_WEEK) * 100),
      };
    })
    .sort((left, right) => right.score - left.score);
  const positioned: WeeklyGrowthResult[] = [];
  for (const [index, result] of results.entries()) {
    const previous = positioned[index - 1];
    positioned.push({
      ...result,
      position: previous && previous.score === result.score ? previous.position : index + 1,
    });
  }
  return success(positioned);
}

export function projectLeagueParticipants(
  input: LeagueProjectionInput | unknown,
): DomainResult<readonly LeagueParticipantProjection[]> {
  const parsed = projectionInputSchema.safeParse(input);
  if (!parsed.success) {
    return failure('PRIVACY_REJECTED', 'League projection accepts only strict minimal fields');
  }
  if (
    new Set(parsed.data.participants.map((item) => item.participantId)).size !==
    parsed.data.participants.length
  ) {
    return failure('PRIVACY_REJECTED', 'League projection participants must be unique');
  }
  for (const participant of parsed.data.participants) {
    if (participant.score !== participant.completedLeafCount * 20) {
      return failure('PRIVACY_REJECTED', 'League score must match confirmed Challenge Leaves');
    }
  }
  const expectedPositions = new Map<LeagueParticipantId, number>();
  const rankedParticipants = [...parsed.data.participants].sort(
    (left, right) => right.score - left.score,
  );
  let previousScore: number | null = null;
  let previousPosition = 0;
  for (const [index, participant] of rankedParticipants.entries()) {
    const position = previousScore === participant.score ? previousPosition : index + 1;
    expectedPositions.set(participant.participantId, position);
    previousScore = participant.score;
    previousPosition = position;
  }
  const suppliedPositionsValid = parsed.data.participants.every((participant) => {
    return expectedPositions.get(participant.participantId) === participant.position;
  });
  if (!suppliedPositionsValid) {
    return failure(
      'PRIVACY_REJECTED',
      'League projection position does not match score-only ranking',
    );
  }
  return success(
    parsed.data.participants.map((candidate) => {
      const participant = fixedParticipant(candidate.participantId);
      return {
        nickname: participant.nickname,
        treeAvatarToken: participant.treeAvatarToken,
        completedLeafCount: candidate.completedLeafCount,
        score: candidate.score,
        position: candidate.position,
      };
    }),
  );
}

export function sendPreparedEncouragement(
  input: unknown,
): DomainResult<PreparedEncouragementApplication> {
  const parsed = preparedEncouragementInputSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      'PRIVACY_REJECTED',
      'League encouragement accepts only one reviewed bilingual phrase identifier',
    );
  }
  const validWeek = validateLeagueWeek(parsed.data.week as FamilyLeagueWeek);
  if (!validWeek.ok) return validWeek;
  const { week, senderId, recipientId, phraseId } = parsed.data;
  if (senderId === recipientId) {
    return failure('INVALID_TRANSITION', 'Prepared encouragement requires another participant');
  }
  if (
    week.optedOutParticipantIds.includes(senderId) ||
    week.optedOutParticipantIds.includes(recipientId)
  ) {
    return failure('INVALID_TRANSITION', 'Opted-out participants cannot send League encouragement');
  }
  const id = `league_encouragement:${week.weekKey}:${senderId}:${recipientId}:${phraseId}`;
  const existing = week.preparedEncouragementLedger.find((item) => item.id === id);
  if (existing)
    return success({ week: parsed.data.week as FamilyLeagueWeek, encouragement: existing });
  const encouragement = {
    id,
    weekKey: week.weekKey,
    senderId,
    recipientId,
    phraseId,
    text: PREPARED_LEAGUE_ENCOURAGEMENTS[phraseId],
    origin: 'prepared',
  } as const;
  return success({
    week: {
      ...(parsed.data.week as FamilyLeagueWeek),
      preparedEncouragementLedger: [
        ...(parsed.data.week as FamilyLeagueWeek).preparedEncouragementLedger,
        encouragement,
      ],
    },
    encouragement,
  });
}

function permanentProgressMatches(input: LeagueRolloverInput): boolean {
  const before = permanentProgressSchema.safeParse(input.permanentProgressBefore);
  const after = permanentProgressSchema.safeParse(input.permanentProgressAfter);
  return (
    before.success && after.success && JSON.stringify(before.data) === JSON.stringify(after.data)
  );
}

export function rolloverFamilyLeagueWeek(
  input: LeagueRolloverInput,
): DomainResult<LeagueRolloverResult> {
  const validWeek = validateLeagueWeek(input.currentWeek);
  if (!validWeek.ok) return validWeek;
  if (
    !weekKeySchema.safeParse(input.nextWeekKey).success ||
    input.nextWeekKey === input.currentWeek.weekKey ||
    input.timeZone !== 'Asia/Dubai'
  ) {
    return failure('INVALID_INPUT', 'Rollover requires a different valid ISO week key');
  }
  if (!permanentProgressMatches(input)) {
    return failure(
      'INVALID_TRANSITION',
      'League rollover cannot alter permanent Seed or Garden progress',
    );
  }
  return success({
    week: {
      weekKey: input.nextWeekKey,
      timeZone: input.timeZone,
      invitedParticipants: SYNTHETIC_LEAGUE_PARTICIPANTS,
      optedOutParticipantIds: [],
      leaves: [],
      confirmationLedger: {},
      cooperativeConfirmedCount: 0,
      cooperativeGoal: SYNTHETIC_LEAGUE_PARTICIPANTS.length * CHALLENGE_LEAVES_PER_WEEK,
      preparedEncouragementLedger: [],
      origin: 'synthetic_local',
    },
    permanentProgress: input.permanentProgressAfter,
    permanentProgressUnchanged: true,
  });
}

export type { FamilyLeagueWeek } from '../../models/familyLeague';
