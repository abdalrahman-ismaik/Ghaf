import { z } from 'zod';

import { parseCloudFamilyIdentity } from '@/features/cloud-family/validation';
import type { CloudFamilyActor } from '@/models/cloudFamily';
import {
  CloudMasroofiError,
  type CloudMasroofiCommand,
  type CloudMasroofiSnapshot,
} from '@/models/cloudMasroofi';
import { MASROOFI_CATEGORIES } from '@/models/masroofi';

import {
  MASROOFI_MAX_BALANCE_FILS,
  MASROOFI_MAX_REWARD_FILS,
  MASROOFI_MAX_TOP_UP_FILS,
  MASROOFI_PURCHASE_REFERENCES,
} from './reference';

const uuid = z.string().uuid();
const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positive = integer.min(1);
const balance = integer.max(MASROOFI_MAX_BALANCE_FILS);
const timestamp = z.iso.datetime({ offset: true });
const item = z.enum([
  'stationery',
  'storybook',
  'football',
  'art_supplies',
  'museum_ticket',
  'snack',
  'gift',
  'game_online',
]);
const unique = (ids: readonly string[]) => new Set(ids).size === ids.length;
const controls = z
  .object({
    frozen: z.boolean(),
    onlineAllowed: z.boolean(),
    allowedCategories: z.array(z.enum(MASROOFI_CATEGORIES)).max(8).refine(unique),
    perPurchaseLimitFils: positive.max(MASROOFI_MAX_TOP_UP_FILS),
    dailyLimitFils: positive.max(MASROOFI_MAX_TOP_UP_FILS),
  })
  .strict();
const actorSchema = z
  .object({
    userId: uuid,
    familyId: uuid,
    role: z.enum(['parent', 'child']),
    childId: uuid.nullable(),
  })
  .strict();
const commandSchema = z.discriminatedUnion('type', [
  z
    .object({ type: z.literal('card.enable'), childId: uuid, age10PlusConfirmed: z.literal(true) })
    .strict(),
  z
    .object({
      type: z.literal('card.controls'),
      childId: uuid,
      expectedVersion: positive,
      controls,
    })
    .strict(),
  z
    .object({
      type: z.literal('card.top_up'),
      childId: uuid,
      amountFils: positive.max(MASROOFI_MAX_TOP_UP_FILS),
    })
    .strict(),
  z
    .object({
      type: z.literal('reward.promise'),
      taskId: uuid,
      expectedTaskRevision: integer,
      amountFils: positive.max(MASROOFI_MAX_REWARD_FILS),
    })
    .strict(),
  z.object({ type: z.literal('purchase'), childId: uuid, fixtureId: item }).strict(),
]);
const snapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    actor: actorSchema,
    familyId: uuid,
    revision: integer,
    cards: z
      .array(
        z
          .object({
            childId: uuid,
            balanceFils: balance,
            controlsVersion: positive,
            age10PlusConfirmed: z.literal(true),
            controls,
          })
          .strict(),
      )
      .max(500),
    promises: z
      .array(
        z
          .object({
            id: uuid,
            childId: uuid,
            taskId: uuid,
            taskRevision: integer,
            amountFils: positive.max(MASROOFI_MAX_REWARD_FILS).optional(),
            status: z.enum(['promised', 'credited']),
            createdAt: timestamp,
            creditedAt: timestamp.nullable(),
          })
          .strict(),
      )
      .max(50000),
    transactions: z
      .array(
        z
          .object({
            id: uuid,
            childId: uuid,
            requestId: uuid,
            kind: z.enum(['reward', 'top_up', 'purchase']),
            amountFils: positive.max(MASROOFI_MAX_TOP_UP_FILS),
            status: z.enum(['credited', 'approved', 'declined']),
            declineReason: z
              .enum([
                'card_disabled',
                'card_frozen',
                'category_blocked',
                'online_blocked',
                'per_purchase_limit',
                'daily_limit',
                'insufficient_balance',
              ])
              .nullable(),
            fixtureId: item.nullable(),
            day: z.iso.date(),
            balanceAfterFils: balance,
            taskId: uuid.nullable(),
            createdAt: timestamp,
          })
          .strict(),
      )
      .max(50000),
  })
  .strict();

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function invalid(): never {
  throw new CloudMasroofiError('invalid_response');
}

export function parseCloudMasroofiCommand(value: unknown): CloudMasroofiCommand {
  const parsed = commandSchema.safeParse(value);
  if (!parsed.success) throw new CloudMasroofiError('invalid_command');
  return freeze(parsed.data);
}

export function assertCloudMasroofiActor(
  value: unknown,
  userId: string,
  familyId: string,
): CloudFamilyActor {
  try {
    const actor = parseCloudFamilyIdentity(value, userId);
    if (actor.familyId !== familyId || !uuid.safeParse(familyId).success) return invalid();
    return actor;
  } catch {
    return invalid();
  }
}

export function parseCloudMasroofiSnapshot(
  value: unknown,
  expectedActor: CloudFamilyActor,
): CloudMasroofiSnapshot;
export function parseCloudMasroofiSnapshot(
  value: unknown,
  userId: string,
  familyId: string,
  expectedActor: CloudFamilyActor,
): CloudMasroofiSnapshot;
export function parseCloudMasroofiSnapshot(
  value: unknown,
  userOrActor: string | CloudFamilyActor,
  expectedFamilyId?: string,
  providedActor?: CloudFamilyActor,
): CloudMasroofiSnapshot {
  const expectedActor = typeof userOrActor === 'string' ? providedActor : userOrActor;
  const userId = typeof userOrActor === 'string' ? userOrActor : userOrActor.userId;
  const familyId = typeof userOrActor === 'string' ? expectedFamilyId : userOrActor.familyId;
  if (!expectedActor || !familyId) return invalid();
  try {
    const serialized = JSON.stringify(value);
    if (!serialized || serialized.length > 32_000_000) return invalid();
  } catch {
    return invalid();
  }
  const parsed = snapshotSchema.safeParse(value);
  if (!parsed.success) return invalid();
  const snapshot = parsed.data;
  const actor = assertCloudMasroofiActor(snapshot.actor, userId, familyId);
  const expected = assertCloudMasroofiActor(expectedActor, userId, familyId);
  if (
    actor.role !== expected.role ||
    actor.childId !== expected.childId ||
    snapshot.familyId !== familyId ||
    !unique(snapshot.cards.map((card) => card.childId)) ||
    !unique(snapshot.promises.map((promise) => promise.id)) ||
    !unique(snapshot.promises.map((promise) => promise.taskId)) ||
    !unique(snapshot.transactions.map((transaction) => transaction.id)) ||
    !unique(snapshot.transactions.map((transaction) => transaction.requestId))
  )
    return invalid();
  const cards = new Map(snapshot.cards.map((card) => [card.childId, card]));
  const promisedByTask = new Map(snapshot.promises.map((promise) => [promise.taskId, promise]));
  const creditedTasks = new Set<string>();
  const balances = new Map<string, number>();
  const reservations = new Map<string, number>();
  for (const card of snapshot.cards) {
    if (actor.role === 'child' && card.childId !== actor.childId) return invalid();
  }
  for (const promise of snapshot.promises) {
    if (!cards.has(promise.childId)) return invalid();
    const hidden = actor.role === 'child' && promise.status === 'promised';
    if (hidden ? Object.hasOwn(promise, 'amountFils') : promise.amountFils === undefined)
      return invalid();
    if (promise.status === 'promised' ? promise.creditedAt !== null : promise.creditedAt === null)
      return invalid();
    if (promise.creditedAt && Date.parse(promise.creditedAt) < Date.parse(promise.createdAt))
      return invalid();
    if (promise.status === 'promised' && promise.amountFils !== undefined) {
      reservations.set(
        promise.childId,
        (reservations.get(promise.childId) ?? 0) + promise.amountFils,
      );
    }
  }
  for (const transaction of snapshot.transactions) {
    if (!cards.has(transaction.childId)) return invalid();
    if (transaction.kind === 'purchase') {
      if (
        transaction.fixtureId === null ||
        transaction.taskId !== null ||
        transaction.status === 'credited' ||
        (transaction.status === 'declined'
          ? transaction.declineReason === null
          : transaction.declineReason !== null) ||
        transaction.amountFils !== MASROOFI_PURCHASE_REFERENCES[transaction.fixtureId].amountFils
      )
        return invalid();
      if (transaction.status === 'approved')
        balances.set(
          transaction.childId,
          (balances.get(transaction.childId) ?? 0) - transaction.amountFils,
        );
    } else {
      if (
        transaction.status !== 'credited' ||
        transaction.declineReason !== null ||
        transaction.fixtureId !== null
      )
        return invalid();
      if (transaction.kind === 'top_up') {
        if (transaction.taskId !== null) return invalid();
      } else {
        if (transaction.taskId === null || creditedTasks.has(transaction.taskId)) return invalid();
        const promise = promisedByTask.get(transaction.taskId);
        if (
          !promise ||
          promise.status !== 'credited' ||
          promise.childId !== transaction.childId ||
          promise.amountFils !== transaction.amountFils ||
          promise.id !== transaction.requestId ||
          Date.parse(promise.creditedAt ?? '') !== Date.parse(transaction.createdAt)
        )
          return invalid();
        creditedTasks.add(transaction.taskId);
      }
      balances.set(
        transaction.childId,
        (balances.get(transaction.childId) ?? 0) + transaction.amountFils,
      );
    }
  }
  for (const promise of snapshot.promises) {
    if (promise.status === 'credited' && !creditedTasks.has(promise.taskId)) return invalid();
  }
  for (const card of snapshot.cards) {
    if (
      card.balanceFils !== (balances.get(card.childId) ?? 0) ||
      card.balanceFils + (reservations.get(card.childId) ?? 0) > MASROOFI_MAX_BALANCE_FILS
    )
      return invalid();
  }
  return freeze(snapshot);
}
