import { z } from 'zod';

import { taskTemplateSchema, validateTaskTemplate } from '@/features/tasks/validation';
import {
  CloudFamilyError,
  type CloudFamilyActor,
  type CloudFamilyCommand,
  type CloudFamilyCommandResponse,
  type CloudFamilyInvite,
  type CloudFamilySnapshot,
} from '@/models/cloudFamily';

const uuid = z.string().uuid();
const revision = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const timestamp = z.iso
  .datetime({ offset: true })
  .refine((value) => Number.isFinite(Date.parse(value)));
const text = (max: number) => z.string().trim().min(1).max(max);
const localized = z.object({ ar: text(500), en: text(500) }).strict();
const actorSchema = z
  .object({
    userId: uuid,
    role: z.enum(['parent', 'child']),
    familyId: uuid.nullable(),
    childId: uuid.nullable(),
  })
  .strict();
const familySchema = z.object({ id: uuid, name: text(80), revision }).strict();
const childSchema = z
  .object({
    id: uuid,
    familyId: uuid,
    displayName: text(80),
    ageBand: z.enum(['6_8', '9_11', '12_14']),
    active: z.boolean(),
  })
  .strict();
const taskSchema = z
  .object({
    id: uuid,
    familyId: uuid,
    childId: uuid,
    catalogId: text(200),
    status: z.enum(['assigned', 'accepted', 'in_progress', 'submitted', 'praised', 'recognized']),
    revision,
    stepStates: z.record(text(200), z.enum(['done', 'skipped'])),
    helpRequested: z.boolean(),
    praise: text(500).nullable(),
    createdAt: timestamp,
    submittedAt: timestamp.nullable(),
    recognizedAt: timestamp.nullable(),
    template: taskTemplateSchema,
  })
  .strict();
const snapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    actor: actorSchema,
    families: z.array(familySchema).max(100),
    family: familySchema.nullable(),
    familyCanopyContributions: revision,
    members: z
      .array(
        z
          .object({
            id: uuid,
            userId: uuid,
            role: z.enum(['parent', 'child']),
            childId: uuid.nullable(),
            active: z.boolean(),
          })
          .strict(),
      )
      .max(500),
    children: z.array(childSchema).max(500),
    tasks: z.array(taskSchema).max(5000),
    recognitions: z
      .array(
        z
          .object({
            id: uuid,
            taskId: uuid,
            childId: uuid,
            seeds: z.number().int().min(0).max(15),
            landscapeId: z.enum(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']),
            canopyContribution: z.union([z.literal(0), z.literal(1)]),
            createdAt: timestamp,
          })
          .strict(),
      )
      .max(5000),
    memories: z
      .array(
        z
          .object({ id: uuid, taskId: uuid, childId: uuid, title: localized, createdAt: timestamp })
          .strict(),
      )
      .max(5000),
    deletedMemoryTaskIds: z.array(uuid).max(5000),
    catalog: z.array(taskTemplateSchema).max(100),
    customTemplates: z
      .array(
        z
          .object({
            id: uuid,
            familyId: uuid,
            revision,
            template: taskTemplateSchema,
            createdAt: timestamp,
            active: z.boolean(),
          })
          .strict(),
      )
      .max(5000),
  })
  .strict();
const copy = z
  .object({ title: localized.optional(), positiveAction: localized.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
const taskCommand = { taskId: uuid, expectedRevision: revision };
const commandSchema = z.union([
  z
    .object({ type: z.literal('create_family'), name: text(80), displayName: text(80).optional() })
    .strict(),
  z.object({ type: z.literal('rename_family'), name: text(80) }).strict(),
  z.object({ type: z.literal('invite_parent') }).strict(),
  z
    .object({
      type: z.literal('add_child'),
      displayName: text(80),
      ageBand: z.enum(['6_8', '9_11', '12_14']),
    })
    .strict(),
  z.object({ type: z.literal('rename_child'), childId: uuid, displayName: text(80) }).strict(),
  z.object({ type: z.enum(['invite_child', 'revoke_child']), childId: uuid }).strict(),
  z
    .object({
      type: z.literal('assign_task'),
      childId: uuid,
      catalogId: text(200),
      content: copy.optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('create_custom_template'),
      title: localized,
      positiveAction: localized,
      categoryId: z.enum([
        'faith_gratitude',
        'roots_kinship',
        'home_responsibility',
        'green_impact',
        'food_hospitality',
        'heritage_etiquette',
        'kindness_community',
        'learning_wellbeing',
      ]),
      recurrence: z.enum(['once', 'recurrent']),
      reviewed: z.literal(true),
    })
    .strict(),
  z.object({ type: z.literal('assign_custom_task'), childId: uuid, templateId: uuid }).strict(),
  z
    .object({
      type: z.literal('remove_custom_template'),
      templateId: uuid,
      expectedRevision: revision,
    })
    .strict(),
  z.object({ type: z.literal('begin_maintenance'), ...taskCommand }).strict(),
  z.object({ type: z.literal('edit_task'), ...taskCommand, content: copy }).strict(),
  z
    .object({
      type: z.enum([
        'accept_task',
        'start_task',
        'request_help',
        'submit_task',
        'recognize_task',
        'save_memory',
        'delete_memory',
      ]),
      ...taskCommand,
    })
    .strict(),
  z.object({ type: z.literal('praise_task'), ...taskCommand, praise: text(500) }).strict(),
  z
    .object({
      type: z.literal('set_step'),
      ...taskCommand,
      stepId: text(200),
      state: z.enum(['done', 'skipped']),
    })
    .strict(),
]);
const inviteSchema = z.union([
  z
    .object({ token: z.string().min(32).max(512), expiresAt: timestamp, childId: uuid.nullable() })
    .strict(),
  z
    .object({ tokenUnavailable: z.literal(true), expiresAt: timestamp, childId: uuid.nullable() })
    .strict(),
]);

function invalid(): never {
  throw new CloudFamilyError('invalid_response');
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function unique(values: readonly string[]) {
  return new Set(values).size === values.length;
}

export function parseCloudFamilyIdentity(value: unknown, userId: string): CloudFamilyActor {
  const parsed = actorSchema.safeParse(value);
  if (!parsed.success || parsed.data.userId !== userId) return invalid();
  const actor = parsed.data;
  if (
    actor.role === 'parent'
      ? actor.childId !== null
      : actor.childId === null || actor.familyId === null
  )
    return invalid();
  return freeze(actor);
}

export function parseCloudFamilySnapshot(value: unknown, userId: string): CloudFamilySnapshot {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return invalid();
  }
  if (!serialized || serialized.length > 16_000_000) return invalid();
  const parsed = snapshotSchema.safeParse(value);
  if (!parsed.success) return invalid();
  const snapshot = parsed.data;
  parseCloudFamilyIdentity(snapshot.actor, userId);
  for (const rows of [
    snapshot.families,
    snapshot.members,
    snapshot.children,
    snapshot.tasks,
    snapshot.recognitions,
    snapshot.memories,
    snapshot.catalog,
    snapshot.customTemplates,
  ]) {
    if (!unique(rows.map((row) => row.id))) return invalid();
  }
  if (snapshot.family === null) {
    if (
      snapshot.actor.familyId !== null ||
      snapshot.actor.role !== 'parent' ||
      snapshot.families.length ||
      snapshot.members.length ||
      snapshot.children.length ||
      snapshot.tasks.length ||
      snapshot.recognitions.length ||
      snapshot.memories.length ||
      snapshot.deletedMemoryTaskIds.length ||
      snapshot.customTemplates.length ||
      snapshot.familyCanopyContributions !== 0
    )
      return invalid();
  } else {
    if (
      snapshot.actor.familyId !== snapshot.family.id ||
      !snapshot.families.some(
        (family) =>
          family.id === snapshot.family!.id &&
          family.revision === snapshot.family!.revision &&
          family.name === snapshot.family!.name,
      )
    )
      return invalid();
  }
  const childIds = new Set(snapshot.children.map((child) => child.id));
  const tasks = new Map(snapshot.tasks.map((task) => [task.id, task]));
  if (snapshot.children.some((child) => child.familyId !== snapshot.family?.id)) return invalid();
  if (
    snapshot.members.some((member) =>
      member.role === 'parent'
        ? member.childId !== null
        : member.childId === null || !childIds.has(member.childId),
    )
  )
    return invalid();
  if (
    snapshot.actor.role === 'parent' &&
    snapshot.family !== null &&
    !snapshot.members.some(
      (member) => member.userId === userId && member.role === 'parent' && member.active,
    )
  )
    return invalid();
  if (
    snapshot.actor.role === 'child' &&
    (snapshot.members.length ||
      snapshot.customTemplates.length ||
      snapshot.children.some((child) => child.id !== snapshot.actor.childId) ||
      !childIds.has(snapshot.actor.childId!))
  )
    return invalid();
  const validCustom = (template: (typeof snapshot.catalog)[number]) =>
    template.recognitionMode === 'recognition_only' &&
    template.routinePhase === 'not_applicable' &&
    template.displayedSeedAward === null &&
    template.visibilityScope === 'child_guardian' &&
    !template.circleEligible &&
    validateTaskTemplate(template).ok;
  if (
    snapshot.customTemplates.some(
      (item) =>
        item.familyId !== snapshot.family?.id ||
        item.template.id !== `custom_${item.id}` ||
        !validCustom(item.template),
    )
  )
    return invalid();
  for (const template of snapshot.catalog) if (!validateTaskTemplate(template).ok) return invalid();
  for (const task of snapshot.tasks) {
    if (
      task.familyId !== snapshot.family?.id ||
      !childIds.has(task.childId) ||
      task.template.id !== task.catalogId ||
      !validateTaskTemplate(task.template).ok
    )
      return invalid();
    if (
      task.catalogId.startsWith('custom_') &&
      (!isCloudUuid(task.catalogId.slice(7)) || !validCustom(task.template))
    )
      return invalid();
    const steps = task.template.catalogExecution?.steps ?? [];
    if (
      Object.entries(task.stepStates).some(
        ([id, state]) =>
          !steps.some((step) => step.id === id && (state !== 'skipped' || step.kind !== 'action')),
      )
    )
      return invalid();
    const submitted = ['submitted', 'praised', 'recognized'].includes(task.status);
    if (
      submitted !== (task.submittedAt !== null) ||
      (task.status === 'recognized') !== (task.recognizedAt !== null)
    )
      return invalid();
    if (['praised', 'recognized'].includes(task.status) !== (task.praise !== null))
      return invalid();
    if (task.submittedAt !== null && Date.parse(task.submittedAt) < Date.parse(task.createdAt))
      return invalid();
    if (task.recognizedAt !== null && Date.parse(task.recognizedAt) < Date.parse(task.submittedAt!))
      return invalid();
    if (
      submitted &&
      steps.some(
        (step) =>
          task.stepStates[step.id] !== 'done' &&
          (step.kind === 'action' || task.stepStates[step.id] !== 'skipped'),
      )
    )
      return invalid();
  }
  if (
    !unique(snapshot.recognitions.map((row) => row.taskId)) ||
    !unique(snapshot.memories.map((row) => row.taskId))
  )
    return invalid();
  if (
    !unique(snapshot.deletedMemoryTaskIds) ||
    snapshot.deletedMemoryTaskIds.some(
      (id) =>
        !tasks.has(id) ||
        snapshot.memories.some((memory) => memory.taskId === id) ||
        !snapshot.recognitions.some(
          (receipt) => receipt.taskId === id && receipt.canopyContribution === 1,
        ),
    )
  )
    return invalid();
  for (const receipt of snapshot.recognitions) {
    const task = tasks.get(receipt.taskId);
    if (
      !task ||
      task.childId !== receipt.childId ||
      task.status !== 'recognized' ||
      receipt.landscapeId !== task.template.landscapeId
    )
      return invalid();
    const seeds =
      task.template.recognitionMode !== 'recognition_only' &&
      task.template.routinePhase === 'acquisition'
        ? (task.template.displayedSeedAward ?? 0)
        : 0;
    const canopy =
      seeds > 0 &&
      task.template.categoryId === 'green_impact' &&
      task.template.visibilityScope === 'household' &&
      task.template.circleEligible
        ? 1
        : 0;
    if (receipt.seeds !== seeds || receipt.canopyContribution !== canopy) return invalid();
    if (Date.parse(receipt.createdAt) !== Date.parse(task.recognizedAt!)) return invalid();
  }
  if (
    snapshot.tasks.some(
      (task) =>
        task.status === 'recognized' &&
        !snapshot.recognitions.some((receipt) => receipt.taskId === task.id),
    )
  )
    return invalid();
  const visibleCanopy = snapshot.recognitions.reduce(
    (sum, receipt) => sum + receipt.canopyContribution,
    0,
  );
  if (
    snapshot.actor.role === 'parent'
      ? snapshot.familyCanopyContributions !== visibleCanopy
      : snapshot.familyCanopyContributions < visibleCanopy
  )
    return invalid();
  for (const memory of snapshot.memories) {
    const task = tasks.get(memory.taskId);
    if (
      !task ||
      task.childId !== memory.childId ||
      task.status !== 'recognized' ||
      !snapshot.recognitions.some(
        (receipt) => receipt.taskId === task.id && receipt.canopyContribution === 1,
      ) ||
      memory.title.ar !== task.template.title.ar ||
      memory.title.en !== task.template.title.en ||
      Date.parse(memory.createdAt) < Date.parse(task.recognizedAt!)
    )
      return invalid();
  }
  return freeze(snapshot);
}

export function parseCloudFamilyCommand(value: unknown): CloudFamilyCommand {
  const parsed = commandSchema.safeParse(value);
  if (!parsed.success) throw new CloudFamilyError('invalid_command');
  return freeze(parsed.data);
}

export function parseCloudFamilyResponse(
  value: unknown,
  userId: string,
): CloudFamilyCommandResponse {
  const parsed = z
    .object({ snapshot: z.unknown(), result: z.record(z.string(), z.unknown()).nullable() })
    .strict()
    .safeParse(value);
  if (!parsed.success) return invalid();
  return freeze({
    snapshot: parseCloudFamilySnapshot(parsed.data.snapshot, userId),
    result: parsed.data.result,
  });
}

export function parseCloudFamilyInvite(value: unknown): CloudFamilyInvite {
  const parsed = inviteSchema.safeParse(value);
  if (!parsed.success) return invalid();
  return freeze(parsed.data);
}

export function isCloudUuid(value: unknown): value is string {
  return uuid.safeParse(value).success;
}
