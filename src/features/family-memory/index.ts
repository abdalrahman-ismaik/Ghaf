import { z } from 'zod';
import { validateTaskForReview } from '@/features/tasks/validation';

import type { PrototypeSession } from '@/models/familyGrowth';
import type {
  FamilyMemory,
  FamilyMemoryActor,
  FamilyMemoryCollection,
  FamilyMemoryResult,
} from '@/models/familyMemory';

const identifier = z.string().min(1).max(2048);
const timestamp = z.string().refine((value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
});
const memorySchema = z
  .object({
    id: identifier,
    familyKey: identifier,
    sourceEventId: identifier,
    occurrenceId: identifier,
    childId: z.enum(['child_salem', 'child_alya']),
    title: z
      .object({ ar: z.string().trim().min(1).max(500), en: z.string().trim().min(1).max(500) })
      .strict(),
    confirmedAt: timestamp,
    savedAt: timestamp,
    origin: z.literal('local_synthetic_activity'),
  })
  .strict();
const collectionSchema = z
  .object({
    schemaVersion: z.literal(1),
    familyKey: identifier,
    memories: z.array(memorySchema).max(1000),
    deletedSourceIds: z.array(identifier).max(10000),
  })
  .strict();

export function emptyFamilyMemories(familyKey: string): FamilyMemoryCollection {
  return { schemaVersion: 1, familyKey, memories: [], deletedSourceIds: [] };
}

export function parseFamilyMemories(value: unknown): FamilyMemoryResult<FamilyMemoryCollection> {
  const parsed = collectionSchema.safeParse(value);
  if (!parsed.success) return { ok: false, error: { code: 'invalid_data' } };
  const data = parsed.data;
  const sourceIds = data.memories.map((memory) => memory.sourceEventId);
  if (
    new Set(sourceIds).size !== sourceIds.length ||
    new Set(data.memories.map((memory) => memory.id)).size !== data.memories.length ||
    new Set(data.deletedSourceIds).size !== data.deletedSourceIds.length ||
    data.memories.some(
      (memory) =>
        memory.familyKey !== data.familyKey ||
        memory.id !== memory.sourceEventId ||
        data.deletedSourceIds.includes(memory.sourceEventId),
    )
  )
    return { ok: false, error: { code: 'invalid_data' } };
  return { ok: true, data };
}

export function memoryFromRecognition(
  session: PrototypeSession,
  context: { readonly familyKey: string; readonly runId: string; readonly savedAt: string },
): FamilyMemoryResult<FamilyMemory> {
  const journey = session.journey;
  const checkIn = journey?.checkIn;
  const receipt = checkIn?.recognitionKey
    ? session.recognitionLedger[checkIn.recognitionKey]
    : null;
  if (
    !journey ||
    journey.lifecycle !== 'recognized' ||
    !journey.assignment ||
    !journey.submission ||
    journey.assignment.approvedByParent !== true ||
    journey.assignment.taskId !== journey.task.id ||
    journey.assignment.taskVersion !== journey.task.version ||
    journey.submission.assignmentId !== journey.assignment.id ||
    !checkIn ||
    checkIn.decision !== 'confirm' ||
    checkIn.submissionId !== journey.submission.id ||
    checkIn.confirmationPresentation !== 'recognition_applied' ||
    !receipt ||
    receipt.recognitionKey !== checkIn.recognitionKey ||
    receipt.checkInId !== checkIn.id ||
    receipt.provenance.taskId !== journey.task.id ||
    receipt.provenance.taskVersion !== journey.task.version ||
    receipt.provenance.submissionId !== journey.submission.id ||
    receipt.provenance.profileId !== journey.task.targetChildId ||
    journey.assignment.childId !== journey.task.targetChildId ||
    journey.task.content.categoryId !== 'green_impact' ||
    journey.task.content.visibilityScope !== 'household' ||
    journey.task.content.circleEligible !== true ||
    receipt.provenance.projection.categoryId !== 'green_impact' ||
    receipt.provenance.projection.visibilityScope !== 'household' ||
    receipt.provenance.projection.circleEligible !== true ||
    receipt.provenance.projection.confirmed !== true ||
    receipt.provenance.projection.prohibitedSharedFieldsPresent !== false ||
    receipt.provenance.projection.consequenceKind !== 'rewarded_acquisition' ||
    !receipt.circleEvent ||
    !context.runId
  )
    return { ok: false, error: { code: 'ineligible' } };
  if (!validateTaskForReview(journey.task).ok) return { ok: false, error: { code: 'ineligible' } };
  const sourceEventId = `${context.runId}:${receipt.recognitionKey}`;
  const candidate: FamilyMemory = {
    id: sourceEventId,
    familyKey: context.familyKey,
    sourceEventId,
    occurrenceId: journey.assignment.id,
    childId: journey.task.targetChildId,
    title: { ...journey.task.content.title },
    confirmedAt: checkIn.praisePresentedAt ?? checkIn.createdAt,
    savedAt: context.savedAt,
    origin: 'local_synthetic_activity',
  };
  const parsed = memorySchema.safeParse(candidate);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: { code: 'invalid_data' } };
}

export function projectFamilyMemories(
  collection: FamilyMemoryCollection,
  familyKey: string,
  actor: FamilyMemoryActor,
): FamilyMemoryResult<readonly FamilyMemory[]> {
  if (collection.familyKey !== familyKey) return { ok: false, error: { code: 'family_mismatch' } };
  return {
    ok: true,
    data: collection.memories
      .filter((memory) => actor.role === 'parent' || memory.childId === actor.childId)
      .slice()
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || a.id.localeCompare(b.id)),
  };
}

export function addFamilyMemory(
  collection: FamilyMemoryCollection,
  actor: FamilyMemoryActor,
  memory: FamilyMemory,
): FamilyMemoryResult<FamilyMemoryCollection> {
  if (actor.role !== 'parent') return { ok: false, error: { code: 'forbidden' } };
  if (collection.familyKey !== memory.familyKey)
    return { ok: false, error: { code: 'family_mismatch' } };
  if (collection.deletedSourceIds.includes(memory.sourceEventId))
    return { ok: false, error: { code: 'deleted' } };
  if (collection.memories.some((item) => item.sourceEventId === memory.sourceEventId))
    return { ok: true, data: collection };
  return parseFamilyMemories({ ...collection, memories: [...collection.memories, memory] });
}

export function deleteFamilyMemory(
  collection: FamilyMemoryCollection,
  actor: FamilyMemoryActor,
  id: string,
): FamilyMemoryResult<FamilyMemoryCollection> {
  if (actor.role !== 'parent') return { ok: false, error: { code: 'forbidden' } };
  if (collection.deletedSourceIds.includes(id)) return { ok: true, data: collection };
  const found = collection.memories.find((memory) => memory.id === id);
  if (!found) return { ok: false, error: { code: 'not_found' } };
  return parseFamilyMemories({
    ...collection,
    memories: collection.memories.filter((memory) => memory.id !== id),
    deletedSourceIds: [...collection.deletedSourceIds, found.sourceEventId],
  });
}
