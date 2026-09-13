import type {
  DomainResult,
  LandscapeId,
  LandscapeProgress,
  ParentCheckIn,
  PrototypeSession,
  Submission,
  SyntheticChildId,
  Task,
  TaskJourney,
  TaskOccurrenceIdentity,
} from '../../models/familyGrowth';
import { nextThresholdForSeeds, stageForSeeds } from '../garden/progression';

export interface TaskAssignmentInstance {
  readonly id: string;
  readonly childId: SyntheticChildId;
  readonly templateRevision: string;
  readonly routineKey: string;
  readonly approvedSnapshot: Task | null;
  readonly journey: TaskJourney;
  readonly attempts: readonly {
    readonly submission: Submission;
    readonly checkIn: ParentCheckIn | null;
  }[];
}

export interface TaskAssignmentCollection {
  readonly generationId: string;
  readonly nextOccurrence: number;
  readonly order: readonly string[];
  readonly byId: Readonly<Record<string, TaskAssignmentInstance>>;
  readonly selectedByChild: Readonly<Record<SyntheticChildId, string | null>>;
  readonly parentSelectedId: string | null;
  readonly legacyP0Allocated: boolean;
}

export interface TaskContextProjection {
  readonly collection: TaskAssignmentCollection;
  readonly journey: TaskJourney;
  readonly activeAssignmentId: string | null;
  readonly activeChildId: SyntheticChildId;
}

function invalid(message: string): DomainResult<never> {
  return {
    ok: false,
    error: { code: 'INVALID_TRANSITION', message, retryable: false, fallbackAvailable: false },
  };
}

function same(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
  const a = Object.keys(left).sort();
  const b = Object.keys(right).sort();
  return (
    a.length === b.length &&
    a.every(
      (key, index) =>
        key === b[index] &&
        same((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]),
    )
  );
}

export function createTaskAssignmentCollection(generationId: string): TaskAssignmentCollection {
  return {
    generationId,
    nextOccurrence: 1,
    order: [],
    byId: {},
    selectedByChild: { child_salem: null, child_alya: null },
    parentSelectedId: null,
    legacyP0Allocated: false,
  };
}

export function routineProgressKey(task: Task): string {
  return task.occurrence?.routineKey ?? task.id;
}

export function allocateTaskOccurrence(
  collection: TaskAssignmentCollection,
  input: {
    readonly householdId: string;
    readonly childId: SyntheticChildId;
    readonly templateId: string;
  },
): DomainResult<{
  readonly collection: TaskAssignmentCollection;
  readonly identity: TaskOccurrenceIdentity;
}> {
  if (
    !collection.generationId.trim() ||
    !input.householdId.trim() ||
    !input.templateId.trim() ||
    !['child_salem', 'child_alya'].includes(input.childId) ||
    !Number.isSafeInteger(collection.nextOccurrence) ||
    collection.nextOccurrence < 1 ||
    collection.nextOccurrence >= Number.MAX_SAFE_INTEGER
  )
    return invalid('A valid household generation and Child occurrence are required');
  const sequence = collection.nextOccurrence;
  const scope = `${encodeURIComponent(input.householdId)}:${encodeURIComponent(collection.generationId)}:${input.childId}`;
  const suffix = `${scope}:${sequence}:${encodeURIComponent(input.templateId)}`;
  const firstP0 =
    input.templateId === 'task_recycling_p0_v1' &&
    input.childId === 'child_salem' &&
    !collection.legacyP0Allocated &&
    !Object.values(collection.byId).some(
      (entry) => entry.journey.task.id === 'task_recycling_p0_v1',
    );
  const assignmentId = firstP0 ? 'assignment_recycling_p0_v1' : `assignment:${suffix}`;
  const identity: TaskOccurrenceIdentity = {
    instanceId: assignmentId,
    householdId: input.householdId,
    generationId: collection.generationId,
    sequence,
    childId: input.childId,
    taskId: firstP0 ? 'task_recycling_p0_v1' : `task:${suffix}`,
    assignmentId,
    routineKey:
      input.templateId === 'task_recycling_p0_v1'
        ? 'task_recycling_p0_v1'
        : `routine:${scope}:${encodeURIComponent(input.templateId)}`,
  };
  return {
    ok: true,
    data: {
      collection: {
        ...collection,
        nextOccurrence: sequence + 1,
        legacyP0Allocated: collection.legacyP0Allocated || firstP0,
      },
      identity,
    },
  };
}

export function isTaskOccurrenceIdentity(
  identity: TaskOccurrenceIdentity,
  task: Pick<Task, 'id' | 'templateId' | 'targetChildId'>,
): boolean {
  if (
    !identity ||
    typeof identity !== 'object' ||
    typeof identity.householdId !== 'string' ||
    typeof identity.generationId !== 'string' ||
    !identity.householdId.trim() ||
    !identity.generationId.trim() ||
    !Number.isSafeInteger(identity.sequence) ||
    identity.sequence < 1 ||
    identity.childId !== task.targetChildId ||
    identity.taskId !== task.id ||
    identity.instanceId !== identity.assignmentId
  )
    return false;
  if (task.id === 'task_recycling_p0_v1')
    return (
      task.targetChildId === 'child_salem' &&
      identity.assignmentId === 'assignment_recycling_p0_v1' &&
      identity.routineKey === 'task_recycling_p0_v1'
    );
  const scope = `${encodeURIComponent(identity.householdId)}:${encodeURIComponent(identity.generationId)}:${identity.childId}`;
  const suffix = `${scope}:${identity.sequence}:${encodeURIComponent(task.templateId)}`;
  return (
    identity.taskId === `task:${suffix}` &&
    identity.assignmentId === `assignment:${suffix}` &&
    identity.routineKey ===
      (task.templateId === 'task_recycling_p0_v1'
        ? 'task_recycling_p0_v1'
        : `routine:${scope}:${encodeURIComponent(task.templateId)}`)
  );
}

export function recordTaskJourney(
  collection: TaskAssignmentCollection,
  input: {
    readonly instanceId: string;
    readonly expectedTaskVersion: number;
    readonly journey: TaskJourney;
  },
): DomainResult<TaskAssignmentCollection> {
  const { journey, instanceId } = input;
  const previous = collection.byId[instanceId];
  const identity = journey.task.occurrence;
  const legacy =
    !identity &&
    journey.task.id === 'task_recycling_p0_v1' &&
    instanceId === 'assignment_recycling_p0_v1';
  if (
    (!legacy &&
      (!identity ||
        !isTaskOccurrenceIdentity(identity, journey.task) ||
        identity.instanceId !== instanceId ||
        identity.generationId !== collection.generationId)) ||
    journey.task.version !== input.expectedTaskVersion ||
    (previous &&
      (previous.childId !== journey.task.targetChildId ||
        previous.journey.task.id !== journey.task.id))
  )
    return invalid('The selected occurrence or approved version does not match');
  if (!previous && identity && journey.lifecycle !== 'draft')
    return invalid('A new occurrence must begin as a draft');
  if (previous && previous.journey.lifecycle !== journey.lifecycle) {
    const allowed: Readonly<Record<TaskJourney['lifecycle'], readonly TaskJourney['lifecycle'][]>> =
      {
        draft: ['reviewed'],
        reviewed: ['draft', 'assigned'],
        assigned: ['chosen'],
        chosen: ['in_progress'],
        in_progress: ['submitted'],
        submitted: ['retry', 'confirmed'],
        retry: ['in_progress'],
        confirmed: ['recognized'],
        recognized: [],
      };
    if (!allowed[previous.journey.lifecycle].includes(journey.lifecycle))
      return invalid('The occurrence cannot skip or rewind its lifecycle');
  }
  if (previous?.approvedSnapshot && !same(previous.approvedSnapshot, journey.task)) {
    const beforeAcceptance =
      previous.journey.lifecycle === 'assigned' &&
      journey.lifecycle === 'assigned' &&
      journey.task.version === previous.journey.task.version + 1;
    if (!beforeAcceptance) return invalid('An accepted task snapshot cannot be changed');
  }
  if (
    journey.assignment &&
    (journey.assignment.id !== instanceId ||
      journey.assignment.taskId !== journey.task.id ||
      journey.assignment.taskVersion !== journey.task.version ||
      journey.assignment.childId !== journey.task.targetChildId ||
      journey.assignment.approvedByParent !== true)
  )
    return invalid('Assignment authority does not match its occurrence');
  if (previous?.journey.lifecycle === 'recognized' && !same(previous.journey, journey))
    return invalid('Completed work is immutable');
  const attempts = [...(previous?.attempts ?? [])];
  if (journey.submission) {
    if (
      !journey.assignment ||
      journey.submission.assignmentId !== journey.assignment.id ||
      journey.submission.taskVersion !== journey.task.version ||
      (journey.checkIn && journey.checkIn.submissionId !== journey.submission.id)
    )
      return invalid('Submission authority does not match its occurrence');
    const index = attempts.findIndex((entry) => entry.submission.id === journey.submission!.id);
    if (index >= 0) {
      const archived = attempts[index]!;
      if (!same(archived.submission, journey.submission) || index !== attempts.length - 1)
        return invalid('Previous attempts cannot be replaced');
      attempts[index] = {
        submission: archived.submission,
        checkIn: journey.checkIn
          ? (JSON.parse(JSON.stringify(journey.checkIn)) as ParentCheckIn)
          : archived.checkIn,
      };
    } else {
      if (journey.submission.attempt !== attempts.length + 1)
        return invalid('A retry must create the next distinct attempt');
      attempts.push({
        submission: JSON.parse(JSON.stringify(journey.submission)) as Submission,
        checkIn: journey.checkIn
          ? (JSON.parse(JSON.stringify(journey.checkIn)) as ParentCheckIn)
          : null,
      });
    }
  }
  const entry: TaskAssignmentInstance = {
    id: instanceId,
    childId: journey.task.targetChildId,
    templateRevision: journey.task.content.catalogExecution?.revision ?? 'p0_v1',
    routineKey: routineProgressKey(journey.task),
    approvedSnapshot: journey.assignment
      ? (JSON.parse(JSON.stringify(journey.task)) as Task)
      : (previous?.approvedSnapshot ?? null),
    journey,
    attempts,
  };
  return {
    ok: true,
    data: {
      ...collection,
      legacyP0Allocated: collection.legacyP0Allocated || legacy,
      order: previous ? collection.order : [...collection.order, instanceId],
      byId: { ...collection.byId, [instanceId]: entry },
      parentSelectedId: instanceId,
      selectedByChild: { ...collection.selectedByChild, [entry.childId]: instanceId },
    },
  };
}

export function selectTaskInstance(
  collection: TaskAssignmentCollection,
  input: { readonly instanceId: string; readonly childId: SyntheticChildId },
): DomainResult<TaskContextProjection> {
  const entry = collection.byId[input.instanceId];
  if (!entry || entry.childId !== input.childId)
    return invalid('This task does not belong to the selected Child');
  return {
    ok: true,
    data: {
      collection: {
        ...collection,
        parentSelectedId: entry.id,
        selectedByChild: { ...collection.selectedByChild, [input.childId]: entry.id },
      },
      journey: entry.journey,
      activeAssignmentId: entry.journey.assignment?.id ?? null,
      activeChildId: input.childId,
    },
  };
}

export function selectAssignedTasks(
  collection: TaskAssignmentCollection,
  childId: SyntheticChildId,
): readonly TaskAssignmentInstance[] {
  return collection.order.flatMap((id) => {
    const entry = collection.byId[id];
    return entry && entry.childId === childId && entry.journey.assignment?.approvedByParent === true
      ? [entry]
      : [];
  });
}

export type PersonalLandscapes = Readonly<Record<LandscapeId, LandscapeProgress>>;

export function openingPersonalLandscapes(childId: SyntheticChildId): PersonalLandscapes {
  return Object.fromEntries(
    (['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove'] as const).map((landscapeId) => {
      const cumulativeSeeds = childId === 'child_salem' && landscapeId === 'mangrove' ? 48 : 0;
      return [
        landscapeId,
        {
          landscapeId,
          cumulativeSeeds,
          stage: stageForSeeds(cumulativeSeeds),
          nextThreshold: nextThresholdForSeeds(cumulativeSeeds),
        },
      ];
    }),
  ) as unknown as PersonalLandscapes;
}

export function landscapesForChild(
  session: PrototypeSession,
  childId: SyntheticChildId,
): PersonalLandscapes {
  return (
    session.landscapeProgressByChild?.[childId] ??
    (childId === 'child_salem' ? session.landscapeProgress : openingPersonalLandscapes(childId))
  );
}

export function initializeProfileLandscapes(
  session: PrototypeSession,
): NonNullable<PrototypeSession['landscapeProgressByChild']> {
  return (
    session.landscapeProgressByChild ?? {
      child_salem: session.landscapeProgress,
      child_alya: openingPersonalLandscapes('child_alya'),
    }
  );
}
