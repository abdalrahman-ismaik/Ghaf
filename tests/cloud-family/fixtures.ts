import { TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import type { CloudFamilySnapshot } from '../../src/models/cloudFamily';

export const cloudId = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
export const userId = cloudId(1);
export const familyId = cloudId(2);
export const childId = cloudId(3);
export const taskId = cloudId(4);

export function cloudSnapshot(recognized = false): CloudFamilySnapshot {
  const template = TASK_TEMPLATES.find((candidate) => candidate.id === 'GI01');
  if (!template) throw new Error('Approved Green task reference is required');
  const family = { id: familyId, name: 'Test family', revision: recognized ? 6 : 5 };
  return {
    schemaVersion: 1,
    actor: { userId, role: 'parent', familyId, childId: null },
    families: [family],
    family,
    familyCanopyContributions: recognized ? 1 : 0,
    members: [{ id: cloudId(5), userId, role: 'parent', childId: null, active: true }],
    children: [{ id: childId, familyId, displayName: 'Test Child', ageBand: '9_11', active: true }],
    tasks: [
      {
        id: taskId,
        familyId,
        childId,
        catalogId: template.id,
        status: recognized ? 'recognized' : 'praised',
        revision: recognized ? 5 : 4,
        stepStates: Object.fromEntries(
          (template.catalogExecution?.steps ?? []).map((step) => [step.id, 'done' as const]),
        ),
        helpRequested: true,
        praise: 'You sorted the clean materials and asked for help.',
        createdAt: '2026-09-14T10:00:00.000Z',
        submittedAt: '2026-09-14T10:01:00.000Z',
        recognizedAt: recognized ? '2026-09-14T10:02:00.000Z' : null,
        template: structuredClone(template),
      },
    ],
    recognitions: recognized
      ? [
          {
            id: cloudId(6),
            taskId,
            childId,
            seeds: 8,
            landscapeId: 'mangrove',
            canopyContribution: 1,
            createdAt: '2026-09-14T10:02:00.000Z',
          },
        ]
      : [],
    memories: [],
    deletedMemoryTaskIds: [],
    catalog: [structuredClone(template)],
    customTemplates: [],
  };
}

export function emptyCloudSnapshot(): CloudFamilySnapshot {
  return {
    ...cloudSnapshot(),
    actor: { userId, role: 'parent', familyId: null, childId: null },
    families: [],
    family: null,
    familyCanopyContributions: 0,
    members: [],
    children: [],
    tasks: [],
    recognitions: [],
    memories: [],
  };
}
