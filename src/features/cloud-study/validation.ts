import { z } from 'zod';
import { studyCommandSchema, studyStateSchema } from '../study/validation';
import { validateCompleteFamilyConnectionDirectory } from '../family-connections';
import type {
  CloudDocumentCommand,
  CloudDocumentSnapshot,
  CloudFamilyDocument,
} from '../../models/cloudFamilyDocuments';

const uuid = z.string().uuid();
const text = (max: number) => z.string().trim().min(1).max(max);
const options = <const T extends readonly [string, ...string[]]>(values: T) =>
  z
    .array(z.enum(values))
    .max(values.length)
    .refine((items) => new Set(items).size === items.length);
const custom = text(160).nullable();
export const cloudPreferencesSchema = z.strictObject({
  avatarId: z.enum(['ghaf_tree', 'leaf', 'flower', 'energy_leaf', 'water_drop']),
  preferredLanguage: z.enum(['ar', 'en', 'both']),
  sex: z.enum(['male', 'female']),
  interests: options(['nature', 'making', 'stories', 'family_helping', 'sustainability']),
  hobbies: options(['drawing', 'reading', 'sports', 'puzzles', 'gardening']),
  accessibilityDefaults: options([
    'larger_text',
    'simpler_instructions',
    'high_contrast',
    'reduced_motion',
  ]),
  supportPreferences: options([
    'short_steps',
    'visual_examples',
    'extra_time',
    'adult_alongside',
    'quiet_reminders',
  ]),
  customInterest: custom,
  customHobby: custom,
  customSupportPreference: custom,
  customAccessibility: custom,
  personalizationEnabled: z.boolean(),
});
const localized = z.strictObject({ ar: text(180), en: text(180) });
export const cloudTemplateSchema = z.strictObject({
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
  title: localized,
  positiveAction: localized,
  recurrence: z.enum(['once', 'recurrent']),
});
const connections = z.unknown().transform((value, context) => {
  const parsed = validateCompleteFamilyConnectionDirectory(value);
  if (parsed.ok) return parsed.data;
  context.addIssue({ code: 'custom', message: 'Invalid family connections' });
  return z.NEVER;
});
const revision = z
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER - 1);
const route = z.enum(['story', 'accessible']);
export const cloudDocumentCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('study'),
    expectedRevision: revision,
    command: studyCommandSchema,
  }),
  z.strictObject({
    type: z.literal('connections.save'),
    expectedRevision: revision,
    input: connections,
  }),
  z.strictObject({
    type: z.literal('preferences.save'),
    childId: uuid,
    expectedRevision: revision,
    input: cloudPreferencesSchema,
  }),
  z.strictObject({
    type: z.literal('template.save'),
    id: uuid.nullable(),
    expectedRevision: revision,
    input: cloudTemplateSchema,
  }),
  z.strictObject({ type: z.literal('template.delete'), id: uuid, expectedRevision: revision }),
  z.strictObject({ type: z.enum(['learning.start', 'learning.complete']), route }),
  z.strictObject({
    type: z.literal('learning.step'),
    route,
    stepId: z.enum([
      'story_frame_1',
      'story_frame_2',
      'accessible_section_1',
      'accessible_section_2',
    ]),
  }),
  z.strictObject({
    type: z.literal('learning.check'),
    route,
    optionId: z.enum(['habitat_support_and_care', 'visit_or_task_reward']),
  }),
]);
const routeProgress = (steps: [string, string]) =>
  z
    .strictObject({
      steps: options(steps),
      checkSatisfied: z.boolean(),
    })
    .refine(
      (value) =>
        (!value.steps.includes(steps[1]) || value.steps.includes(steps[0])) &&
        (!value.checkSatisfied || value.steps.length === 2),
    );
const learning = z
  .strictObject({
    packageId: z.literal('learning.mangrove_roots.v1'),
    routes: z.strictObject({
      story: routeProgress(['story_frame_1', 'story_frame_2']),
      accessible: routeProgress(['accessible_section_1', 'accessible_section_2']),
    }),
    completedAt: z.string().datetime({ offset: true }).nullable(),
    completedRoute: route.nullable(),
  })
  .refine(
    (value) =>
      (value.completedAt === null) === (value.completedRoute === null) &&
      (value.completedRoute === null || value.routes[value.completedRoute].checkSatisfied),
  );
const rowSchema = z.strictObject({
  id: uuid,
  family_id: uuid,
  child_id: uuid.nullable(),
  kind: z.enum([
    'study_plan',
    'academic_goal',
    'connections',
    'profile_preferences',
    'saved_template',
    'learning',
  ]),
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  payload: z.unknown(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export function parseCloudDocuments(
  value: unknown,
  authority: { familyId: string; role: 'parent' | 'child'; childId: string | null },
): CloudFamilyDocument[] {
  const rows = z.array(rowSchema).max(300).parse(value);
  if (new Set(rows.map((row) => row.id)).size !== rows.length) throw new Error('invalid_response');
  const result: CloudFamilyDocument[] = [];
  for (const row of rows) {
    const privateParent = row.kind === 'connections' || row.kind === 'saved_template';
    if (
      row.family_id !== authority.familyId ||
      privateParent !== (row.child_id === null) ||
      (authority.role === 'child' && (privateParent || row.child_id !== authority.childId)) ||
      Date.parse(row.updated_at) < Date.parse(row.created_at)
    )
      throw new Error('invalid_response');
    const base = {
      id: row.id,
      familyId: row.family_id,
      childId: row.child_id,
      revision: row.revision,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    if (row.kind === 'study_plan' || row.kind === 'academic_goal') {
      const parsed = studyStateSchema.parse({
        schemaVersion: 1,
        familyKey: row.family_id,
        plans: row.kind === 'study_plan' ? [row.payload] : [],
        goals: row.kind === 'academic_goal' ? [row.payload] : [],
      });
      const payload = row.kind === 'study_plan' ? parsed.plans[0] : parsed.goals[0];
      if (!payload || payload.childId !== row.child_id) throw new Error('invalid_response');
      result.push({ ...base, kind: row.kind, payload } as CloudFamilyDocument);
    } else if (row.kind === 'connections')
      result.push({ ...base, kind: row.kind, payload: connections.parse(row.payload) });
    else if (row.kind === 'profile_preferences')
      result.push({ ...base, kind: row.kind, payload: cloudPreferencesSchema.parse(row.payload) });
    else if (row.kind === 'saved_template')
      result.push({ ...base, kind: row.kind, payload: cloudTemplateSchema.parse(row.payload) });
    else result.push({ ...base, kind: row.kind, payload: learning.parse(row.payload) });
  }
  studyStateSchema.parse({
    schemaVersion: 1,
    familyKey: authority.familyId,
    plans: result.flatMap((row) => (row.kind === 'study_plan' ? [row.payload] : [])),
    goals: result.flatMap((row) => (row.kind === 'academic_goal' ? [row.payload] : [])),
  });
  return result;
}
export function parseCloudDocumentCommand(value: unknown): CloudDocumentCommand {
  return cloudDocumentCommandSchema.parse(value) as CloudDocumentCommand;
}
export function parseCloudDocumentSnapshot(
  value: unknown,
  authority: { userId: string; familyId: string; role: 'parent' | 'child'; childId: string | null },
): CloudDocumentSnapshot {
  const snapshot = z
    .strictObject({
      schemaVersion: z.literal(1),
      actor: z.strictObject({
        userId: uuid,
        familyId: uuid,
        role: z.enum(['parent', 'child']),
        childId: uuid.nullable(),
      }),
      familyId: uuid,
      revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
      documentCount: z.number().int().min(0).max(300),
      documents: z.unknown(),
    })
    .parse(value);
  if (
    snapshot.actor.userId !== authority.userId ||
    snapshot.familyId !== authority.familyId ||
    snapshot.actor.familyId !== authority.familyId ||
    snapshot.actor.role !== authority.role ||
    snapshot.actor.childId !== authority.childId ||
    (snapshot.actor.role === 'parent'
      ? snapshot.actor.childId !== null
      : snapshot.actor.childId === null)
  ) {
    throw new Error('invalid_response');
  }
  const documents = parseCloudDocuments(snapshot.documents, authority);
  if (snapshot.documentCount !== documents.length) throw new Error('invalid_response');
  return { ...snapshot, documents };
}
export function parseCloudDocumentResponse(
  value: unknown,
  authority: { familyId: string; role: 'parent' | 'child'; childId: string | null },
): CloudFamilyDocument[] {
  const response = z
    .strictObject({
      documents: z.unknown(),
      result: z.strictObject({
        documentId: uuid,
        revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
      }),
    })
    .parse(value);
  return parseCloudDocuments(response.documents, authority);
}
