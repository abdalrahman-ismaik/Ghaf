import { describe, expect, it } from 'vitest';

import { selectCloudFamilyProgress } from '../../src/features/cloud-family/progress';
import {
  parseCloudFamilyCommand,
  parseCloudFamilyIdentity,
  parseCloudFamilySnapshot,
} from '../../src/features/cloud-family/validation';
import { childId, cloudId, cloudSnapshot, emptyCloudSnapshot, taskId, userId } from './fixtures';

describe('cloud family external boundary', () => {
  it('accepts successful empty accounts without adding people, work or progress', () => {
    const snapshot = parseCloudFamilySnapshot(emptyCloudSnapshot(), userId);
    expect(snapshot.family).toBeNull();
    expect(snapshot.children).toEqual([]);
    expect(snapshot.tasks).toEqual([]);
    expect(selectCloudFamilyProgress(snapshot)).toEqual({
      children: {},
      canopyContributions: 0,
      scope: 'family',
    });
  });

  it('derives zero opening balances and independent five-landscape progress from receipts only', () => {
    const before = selectCloudFamilyProgress(parseCloudFamilySnapshot(cloudSnapshot(), userId));
    expect(before.children[childId]?.seeds).toBe(0);
    expect(
      Object.values(before.children[childId]!.landscapes).every(
        (landscape) => landscape.cumulativeSeeds === 0 && landscape.stage === 'seed',
      ),
    ).toBe(true);
    const source = cloudSnapshot(true);
    const secondChild = { ...source.children[0]!, id: cloudId(9), displayName: 'Second Child' };
    const progress = selectCloudFamilyProgress(
      parseCloudFamilySnapshot({ ...source, children: [...source.children, secondChild] }, userId),
    );
    expect(progress.children[childId]?.seeds).toBe(8);
    expect(progress.children[childId]?.landscapes.mangrove.cumulativeSeeds).toBe(8);
    expect(progress.children[secondChild.id]?.seeds).toBe(0);
    expect(progress.canopyContributions).toBe(1);
  });

  it('keeps Child progress private while accepting the authorized coarse family canopy', () => {
    const source = cloudSnapshot(true);
    const childUser = cloudId(10);
    const snapshot = parseCloudFamilySnapshot(
      {
        ...source,
        actor: { userId: childUser, role: 'child', familyId: source.family!.id, childId },
        members: [],
        familyCanopyContributions: 4,
      },
      childUser,
    );
    expect(selectCloudFamilyProgress(snapshot).canopyContributions).toBe(4);
    expect(selectCloudFamilyProgress(snapshot).children[childId]?.seeds).toBe(8);
    expect(() =>
      parseCloudFamilySnapshot(
        {
          ...snapshot,
          children: [...snapshot.children, { ...snapshot.children[0]!, id: cloudId(11) }],
        },
        childUser,
      ),
    ).toThrow('invalid_response');
  });

  it('rejects another authenticated identity and fixture identifiers', () => {
    expect(() => parseCloudFamilySnapshot(cloudSnapshot(), cloudId(999))).toThrow(
      'invalid_response',
    );
    expect(() =>
      parseCloudFamilyIdentity(
        { userId, role: 'parent', familyId: null, childId: childId },
        userId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudFamilyCommand({ type: 'assign_task', childId: 'child_salem', catalogId: 'GI01' }),
    ).toThrow('invalid_command');
    expect(() =>
      parseCloudFamilyCommand({ type: 'recognize_task', taskId, expectedRevision: 4, seeds: 1000 }),
    ).toThrow('invalid_command');
  });

  it.each([
    'award',
    'duplicate',
    'orphan',
    'timestamp',
    'canopy',
    'unknown_field',
    'missing_actor',
  ])('rejects inconsistent %s authority without trusting displayed totals', (fault) => {
    const source = structuredClone(cloudSnapshot(true));
    if (fault === 'award') Object.assign(source.recognitions[0]!, { seeds: 12 });
    if (fault === 'duplicate')
      Object.assign(source, {
        recognitions: [...source.recognitions, { ...source.recognitions[0]!, id: cloudId(20) }],
      });
    if (fault === 'orphan') Object.assign(source.recognitions[0]!, { taskId: cloudId(21) });
    if (fault === 'timestamp')
      Object.assign(source.recognitions[0]!, { createdAt: '2026-09-14T10:03:00.000Z' });
    if (fault === 'canopy') Object.assign(source, { familyCanopyContributions: 5 });
    if (fault === 'unknown_field') Object.assign(source, { earnedSeeds: 500 });
    if (fault === 'missing_actor') Object.assign(source, { members: [] });
    expect(() => parseCloudFamilySnapshot(source, userId)).toThrow('invalid_response');
  });

  it('requires a real eligible source and exact immutable memory title', () => {
    const source = cloudSnapshot(true);
    const memory = {
      id: cloudId(22),
      taskId,
      childId,
      title: source.tasks[0]!.template.title,
      createdAt: '2026-09-14T10:04:00.000Z',
    };
    const accepted = parseCloudFamilySnapshot({ ...source, memories: [memory] }, userId);
    expect(accepted.memories).toHaveLength(1);
    expect(Object.isFrozen(accepted.tasks[0]?.template)).toBe(true);
    expect(() =>
      parseCloudFamilySnapshot(
        { ...source, memories: [{ ...memory, title: { ar: 'عنوان آخر', en: 'Unrelated title' } }] },
        userId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudFamilySnapshot(
        { ...source, memories: [memory, { ...memory, id: cloudId(23) }] },
        userId,
      ),
    ).toThrow('invalid_response');
  });

  it('rejects skipped required actions and recognized work without a receipt', () => {
    const source = structuredClone(cloudSnapshot());
    const action = source.tasks[0]!.template.catalogExecution!.steps.find(
      (step) => step.kind === 'action',
    )!;
    Object.assign(source.tasks[0]!, {
      stepStates: { ...source.tasks[0]!.stepStates, [action.id]: 'skipped' },
    });
    expect(() => parseCloudFamilySnapshot(source, userId)).toThrow('invalid_response');
    expect(() =>
      parseCloudFamilySnapshot({ ...cloudSnapshot(true), recognitions: [] }, userId),
    ).toThrow('invalid_response');
  });

  it('requires an explicit decision for every non-action step before submission', () => {
    const source = structuredClone(cloudSnapshot());
    const task = source.tasks[0];
    const optionalStep = task?.template.catalogExecution?.steps.find(
      (step) => step.kind !== 'action',
    );
    if (!task || !optionalStep) throw new Error('An approved non-action step is required');
    const stepStates = { ...task.stepStates };
    Object.assign(task, { stepStates });
    delete stepStates[optionalStep.id];
    expect(() => parseCloudFamilySnapshot(source, userId)).toThrow('invalid_response');

    stepStates[optionalStep.id] = 'skipped';
    expect(parseCloudFamilySnapshot(source, userId).tasks[0]?.stepStates[optionalStep.id]).toBe(
      'skipped',
    );

    stepStates[optionalStep.id] = 'done';
    expect(parseCloudFamilySnapshot(source, userId).tasks[0]?.stepStates[optionalStep.id]).toBe(
      'done',
    );
  });

  it('requires reviewed private zero-growth custom definitions and hides the template library from Children', () => {
    const source = cloudSnapshot();
    const id = cloudId(70);
    const template = {
      ...source.catalog[0]!,
      id: `custom_${id}`,
      recognitionMode: 'recognition_only' as const,
      routinePhase: 'not_applicable' as const,
      displayedSeedAward: null,
      visibilityScope: 'child_guardian' as const,
      circleEligible: false,
    };
    const record = {
      id,
      familyId: source.family!.id,
      revision: 0,
      template,
      createdAt: '2026-09-14T10:00:00Z',
      active: true,
    };
    expect(
      parseCloudFamilySnapshot({ ...source, customTemplates: [record] }, userId).customTemplates,
    ).toHaveLength(1);
    expect(() =>
      parseCloudFamilySnapshot(
        {
          ...source,
          customTemplates: [
            {
              ...record,
              template: { ...template, visibilityScope: 'household', circleEligible: true },
            },
          ],
        },
        userId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudFamilySnapshot(
        {
          ...source,
          actor: { userId, role: 'child', familyId: source.family!.id, childId },
          members: [],
          customTemplates: [record],
        },
        userId,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudFamilyCommand({
        type: 'create_custom_template',
        title: template.title,
        positiveAction: template.positiveAction,
        categoryId: 'green_impact',
        recurrence: 'once',
        reviewed: false,
      }),
    ).toThrow('invalid_command');
    expect(
      parseCloudFamilyCommand({
        type: 'create_custom_template',
        title: template.title,
        positiveAction: template.positiveAction,
        categoryId: 'green_impact',
        recurrence: 'once',
        reviewed: true,
      }).type,
    ).toBe('create_custom_template');
    expect(() =>
      parseCloudFamilyCommand({ type: 'begin_maintenance', taskId, expectedRevision: null }),
    ).toThrow('invalid_command');
  });
});
