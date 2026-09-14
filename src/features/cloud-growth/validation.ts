import { z } from 'zod';
import { BADGE_IDS } from '@/features/growth/badgeRegistry';
import { parseCloudFamilyIdentity } from '@/features/cloud-family/validation';
import {
  CloudGrowthError,
  type CloudGrowthCommand,
  type CloudGrowthSnapshot,
} from '@/models/cloudGrowth';

const uuid = z.string().uuid();
const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positive = integer.min(1);
const text = (max: number) => z.string().trim().min(1).max(max);
const localized = z.object({ ar: text(200), en: text(200) }).strict();
const nickname = z.object({ ar: text(40), en: text(40) }).strict();
const timestamp = z.iso.datetime({ offset: true });
const week = z.string().regex(/^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/);
const month = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/);
const landscape = z.enum(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']);
const totals = z
  .object({ ghaf: integer, samar: integer, sidr: integer, date_palm: integer, mangrove: integer })
  .strict();
const stage = z.enum(['shoot', 'sapling', 'shade', 'flourishing']);
const avatar = z.enum(['mangrove_shoot', 'ghaf_leaf', 'sidr_sapling']);
const phrase = z.enum(['great_growing', 'keep_growing', 'one_leaf_together']);
const promise = z.union([
  z
    .object({
      kind: z.literal('money'),
      label: localized,
      currency: z.string().regex(/^[A-Z]{3}$/),
      amountMinor: integer,
    })
    .strict(),
  z.object({ kind: z.enum(['experience', 'privilege', 'gift']), label: localized }).strict(),
]);
const milestone = z.union([
  z.object({ kind: z.literal('eligible_seed_delta'), requiredSeedDelta: positive }).strict(),
  z
    .object({ kind: z.literal('landscape_stage'), landscapeId: landscape, targetStage: stage })
    .strict(),
  z
    .object({
      kind: z.literal('landscapes_at_stage'),
      targetStage: stage,
      requiredCount: positive.max(5),
    })
    .strict(),
]);
const commandSchema = z.union([
  z.object({ type: z.literal('reward.create'), childId: uuid, month, promise, milestone }).strict(),
  z
    .object({
      type: z.literal('reward.revise'),
      planId: uuid,
      expectedVersion: positive,
      month,
      promise,
      milestone,
    })
    .strict(),
  z.object({ type: z.literal('reward.give'), planId: uuid, expectedVersion: positive }).strict(),
  z
    .object({
      type: z.literal('league.nominate'),
      childId: uuid,
      expectedRevision: integer,
      nickname,
      treeAvatarToken: avatar,
      taskIds: z
        .array(uuid)
        .length(5)
        .refine((ids) => new Set(ids).size === 5),
    })
    .strict(),
  z
    .object({
      type: z.literal('league.rest'),
      childId: uuid,
      expectedRevision: integer,
      rest: z.boolean(),
    })
    .strict(),
  z.object({ type: z.literal('league.encourage'), recipientId: uuid, phraseId: phrase }).strict(),
]);
const snapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    actor: z
      .object({
        userId: uuid,
        familyId: uuid,
        childId: uuid.nullable(),
        role: z.enum(['parent', 'child']),
      })
      .strict(),
    familyId: uuid,
    revision: integer,
    currentWeekKey: week,
    children: z
      .array(
        z
          .object({
            childId: uuid,
            lifetimeSeeds: integer,
            landscapeSeeds: totals,
            sortingCredits: integer,
            coastCareCredits: integer,
            learningCompleted: z.array(z.literal('learning.mangrove_roots.v1')).max(1),
            badges: z
              .array(z.object({ badgeId: z.enum(BADGE_IDS), awardedAt: timestamp }).strict())
              .max(16),
          })
          .strict(),
      )
      .max(500),
    rewards: z
      .array(
        z
          .object({
            id: uuid,
            childId: uuid,
            version: positive,
            lifecycle: z.enum(['promised', 'unlocked', 'given']),
            month,
            promise,
            milestone,
            promisedAt: timestamp,
            unlockedAt: timestamp.nullable(),
            givenAt: timestamp.nullable(),
            eligibleSeeds: integer,
            eligibleLandscapeSeeds: totals,
            eligibleLandscapeBaseline: totals,
          })
          .strict(),
      )
      .max(5000),
    league: z
      .object({
        weekKey: week,
        revision: integer,
        rows: z
          .array(
            z
              .object({
                participantId: uuid,
                nickname,
                treeAvatarToken: avatar,
                completedLeafCount: integer.max(5),
                score: integer.max(100),
                position: positive,
              })
              .strict(),
          )
          .max(500),
        cooperativeConfirmedCount: integer,
        cooperativeGoal: integer,
        nominations: z
          .array(
            z
              .object({
                participantId: uuid,
                childId: uuid,
                nickname,
                treeAvatarToken: avatar,
                rest: z.boolean(),
                taskIds: z.array(uuid).length(5),
              })
              .strict(),
          )
          .max(500),
        ownParticipantId: uuid.nullable(),
        encouragements: z
          .array(
            z
              .object({
                id: uuid,
                senderId: uuid,
                recipientId: uuid,
                phraseId: phrase,
                createdAt: timestamp,
              })
              .strict(),
          )
          .max(5000),
      })
      .strict()
      .nullable(),
  })
  .strict();
const unique = (ids: readonly string[]) => ids.length === new Set(ids).size;
const sum = (values: Readonly<Record<string, number>>) =>
  Object.values(values).reduce((total, value) => total + value, 0);
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function invalid(): never {
  throw new CloudGrowthError('invalid_response');
}

export function parseCloudGrowthCommand(value: unknown): CloudGrowthCommand {
  const parsed = commandSchema.safeParse(value);
  if (!parsed.success) throw new CloudGrowthError('invalid_command');
  return freeze(parsed.data);
}
export function parseCloudGrowthSnapshot(
  value: unknown,
  userId: string,
  familyId: string,
): CloudGrowthSnapshot {
  const parsed = snapshotSchema.safeParse(value);
  if (!parsed.success) return invalid();
  const snapshot = parsed.data;
  try {
    parseCloudFamilyIdentity(snapshot.actor, userId);
  } catch {
    return invalid();
  }
  if (
    snapshot.familyId !== familyId ||
    snapshot.actor.familyId !== familyId ||
    !unique(snapshot.children.map((child) => child.childId)) ||
    !unique(snapshot.rewards.map((reward) => reward.id))
  )
    return invalid();
  if (
    snapshot.actor.role === 'child' &&
    (snapshot.children.length !== 1 || snapshot.children[0]?.childId !== snapshot.actor.childId)
  )
    return invalid();
  for (const child of snapshot.children) {
    if (
      sum(child.landscapeSeeds) !== child.lifetimeSeeds ||
      child.sortingCredits !== child.coastCareCredits ||
      child.sortingCredits * 12 > child.lifetimeSeeds ||
      !unique(child.badges.map((badge) => badge.badgeId))
    )
      return invalid();
    const eligible: Readonly<Record<string, boolean>> = {
      'badge.journey.seed_start.v1': child.lifetimeSeeds >= 12,
      'badge.journey.growing_branch.v1': child.lifetimeSeeds >= 60,
      'badge.journey.expanding_shade.v1': child.lifetimeSeeds >= 120,
      'badge.journey.coastal_care.v1': child.lifetimeSeeds >= 180,
      'badge.skill.sorting.bud.v1': child.sortingCredits >= 1,
      'badge.skill.sorting.branch.v1': child.sortingCredits >= 3,
      'badge.skill.sorting.shade.v1': child.sortingCredits >= 7,
      'badge.habitat.mangrove_care.v1':
        child.lifetimeSeeds >= 132 &&
        child.coastCareCredits >= 3 &&
        child.learningCompleted.includes('learning.mangrove_roots.v1'),
    };
    if (child.badges.some((badge) => !eligible[badge.badgeId])) return invalid();
  }
  for (const reward of snapshot.rewards) {
    const child = snapshot.children.find((row) => row.childId === reward.childId);
    if (
      !child ||
      sum(reward.eligibleLandscapeSeeds) !== reward.eligibleSeeds ||
      reward.eligibleSeeds + sum(reward.eligibleLandscapeBaseline) > child.lifetimeSeeds ||
      (snapshot.actor.role === 'child' && reward.childId !== snapshot.actor.childId)
    )
      return invalid();
    if (
      (reward.lifecycle === 'promised') !== (reward.unlockedAt === null) ||
      (reward.lifecycle === 'given') !== (reward.givenAt !== null)
    )
      return invalid();
    if (reward.unlockedAt !== null && Date.parse(reward.unlockedAt) < Date.parse(reward.promisedAt))
      return invalid();
    if (reward.givenAt !== null && Date.parse(reward.givenAt) < Date.parse(reward.unlockedAt!))
      return invalid();
  }
  const league = snapshot.league;
  if (league) {
    if (
      league.weekKey !== snapshot.currentWeekKey ||
      !unique(league.rows.map((row) => row.participantId)) ||
      !unique(league.nominations.map((row) => row.participantId)) ||
      !unique(league.encouragements.map((row) => row.id))
    )
      return invalid();
    if (
      league.cooperativeConfirmedCount !==
        league.rows.reduce((total, row) => total + row.completedLeafCount, 0) ||
      league.cooperativeGoal !== league.rows.length * 5
    )
      return invalid();
    if (
      league.rows.some(
        (row) =>
          row.score !== row.completedLeafCount * 20 ||
          row.position !== 1 + league.rows.filter((other) => other.score > row.score).length,
      )
    )
      return invalid();
    if (snapshot.actor.role === 'child' && league.nominations.length) return invalid();
    if (
      snapshot.actor.role === 'parent' &&
      (league.ownParticipantId !== null || league.encouragements.length)
    )
      return invalid();
    if (
      league.ownParticipantId !== null &&
      !league.rows.some((row) => row.participantId === league.ownParticipantId)
    )
      return invalid();
    if (
      league.encouragements.some(
        (item) =>
          item.senderId === item.recipientId ||
          !league.ownParticipantId ||
          (item.senderId !== league.ownParticipantId &&
            item.recipientId !== league.ownParticipantId),
      )
    )
      return invalid();
    if (
      league.nominations.some(
        (item) =>
          !unique(item.taskIds) ||
          !snapshot.children.some((child) => child.childId === item.childId),
      )
    )
      return invalid();
  }
  return freeze(snapshot);
}
