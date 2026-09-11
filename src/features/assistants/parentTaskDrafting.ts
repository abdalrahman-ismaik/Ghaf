import { evaluateAssistantSafety } from './policy';
import type {
  DomainResult,
  LocalizedText,
  TaskJourney,
  TaskTemplate,
} from '../../models/familyGrowth';
import {
  parentTaskArchetypeSchema,
  parentTaskDraftRequestV1Schema,
  parentTaskDraftSuggestionV1Schema,
  type ParentTaskDraftRequestV1,
  type ParentTaskDraftSuggestionV1,
} from '../../models/boundedAi';

export const PARENT_TASK_DRAFT_ATTRIBUTION = 'bounded_parent_task_draft_v1' as const;

export interface ParentTaskDraftCopy {
  readonly title: LocalizedText;
  readonly positiveAction: LocalizedText;
  readonly whyItMatters: LocalizedText;
  readonly steps: readonly {
    readonly order: number;
    readonly text: LocalizedText;
  }[];
  readonly supportCue: LocalizedText;
}

export interface TaskAuthoritySnapshotV1 {
  readonly schemaVersion: '1.0';
  readonly archetypeId: ParentTaskDraftRequestV1['archetypeId'];
  readonly taskId: string;
  readonly taskVersion: number;
  readonly targetChildId: TaskJourney['task']['targetChildId'];
  readonly draftRevision: number;
  readonly lifecycle: 'draft';
  readonly authorityDigest: string;
  readonly parentOriginalText: LocalizedText;
  readonly retainedCopy: ParentTaskDraftCopy;
}

export interface ParentTaskDraftRequestBuild {
  readonly request: ParentTaskDraftRequestV1;
  readonly snapshot: TaskAuthoritySnapshotV1;
}

export type ParentTaskDraftDecision = 'none' | 'accepted' | 'kept' | 'edited';

export interface ParentTaskDraftingView {
  readonly status: 'idle' | 'requesting' | 'ready' | 'fallback' | 'rejected';
  readonly origin: 'prepared' | 'live' | null;
  readonly suggestion: ParentTaskDraftSuggestionV1 | null;
  readonly retainedCopy: ParentTaskDraftCopy | null;
  readonly acceptedAttribution: {
    readonly origin: 'prepared' | 'live';
    readonly schemaVersion: '1.0';
    readonly archetypeId: ParentTaskDraftRequestV1['archetypeId'];
  } | null;
  readonly requestRevision: number;
  readonly decision: ParentTaskDraftDecision;
  readonly fallbackReason:
    'timeout' | 'remote_unavailable' | 'invalid_response' | 'safety_rejected' | null;
  readonly activeRequest: ParentTaskDraftRequestV1 | null;
  readonly authoritySnapshot: TaskAuthoritySnapshotV1 | null;
}

export const INITIAL_PARENT_TASK_DRAFTING_VIEW: ParentTaskDraftingView = Object.freeze({
  status: 'idle',
  origin: null,
  suggestion: null,
  retainedCopy: null,
  acceptedAttribution: null,
  requestRevision: 0,
  decision: 'none',
  fallbackReason: null,
  activeRequest: null,
  authoritySnapshot: null,
});

function failure(
  code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'INVALID_TRANSITION' | 'SAFETY_REJECTED',
  message: string,
): DomainResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: code !== 'INVALID_INPUT' },
  };
}

function cloneLocalized(value: LocalizedText): LocalizedText {
  return { ar: value.ar, en: value.en };
}

function retainedCopy(template: TaskTemplate): ParentTaskDraftCopy {
  return {
    title: cloneLocalized(template.title),
    positiveAction: cloneLocalized(template.positiveAction),
    whyItMatters: cloneLocalized(template.whyItMatters),
    steps: [{ order: 1, text: cloneLocalized(template.definitionOfDone) }],
    supportCue: cloneLocalized(template.permittedHelp),
  };
}

export function taskAuthorityValue(journey: TaskJourney) {
  const content = journey.task.content;
  return {
    taskId: journey.task.id,
    taskVersion: journey.task.version,
    templateId: journey.task.templateId,
    targetChildId: journey.task.targetChildId,
    taskOrigin: journey.task.origin,
    lifecycle: journey.lifecycle,
    assignment: journey.assignment,
    submission: journey.submission,
    checkIn: journey.checkIn,
    authority: {
      id: content.id,
      categoryId: content.categoryId,
      landscapeId: content.landscapeId,
      childAgeBands: content.childAgeBands,
      estimatedEffort: content.estimatedEffort,
      permittedHelp: content.permittedHelp,
      supervision: content.supervision,
      safety: content.safety,
      evidencePolicy: content.evidencePolicy,
      reflectionPolicy: content.reflectionPolicy,
      recognitionMode: content.recognitionMode,
      routinePhase: content.routinePhase,
      recurrence: content.recurrence,
      displayedSeedAward: content.displayedSeedAward,
      visibilityScope: content.visibilityScope,
      circleEligible: content.circleEligible,
      privacyNotice: content.privacyNotice,
      origin: content.origin,
    },
  };
}

function authorityDigest(journey: TaskJourney): string {
  const serialized = JSON.stringify(taskAuthorityValue(journey));
  let hash = 0x811c9dc5;
  for (const scalar of serialized) {
    hash ^= scalar.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function createTaskAuthoritySnapshot(
  journey: TaskJourney,
  draftRevision: number,
): TaskAuthoritySnapshotV1 {
  if (journey.lifecycle !== 'draft') {
    throw new Error('Only a task draft can produce a Parent drafting snapshot');
  }
  const archetype = parentTaskArchetypeSchema.safeParse(journey.task.templateId);
  if (!archetype.success) {
    throw new Error('Task template is outside the reviewed Parent drafting archetypes');
  }
  return {
    schemaVersion: '1.0',
    archetypeId: archetype.data,
    taskId: journey.task.id,
    taskVersion: journey.task.version,
    targetChildId: journey.task.targetChildId,
    draftRevision,
    lifecycle: 'draft',
    authorityDigest: authorityDigest(journey),
    parentOriginalText: cloneLocalized(journey.task.parentOriginalText),
    retainedCopy: retainedCopy(journey.task.content),
  };
}

export function createParentTaskDraftRequest(input: {
  readonly journey: TaskJourney;
  readonly ageBand: ParentTaskDraftRequestV1['ageBand'];
  readonly requestId: string;
  readonly bindingNonce: string;
  readonly catalogVersion: number;
  readonly intent: ParentTaskDraftRequestV1['intent'];
  readonly effortBand: ParentTaskDraftRequestV1['effortBand'];
  readonly stepCount: number;
  readonly supportMode: ParentTaskDraftRequestV1['supportMode'];
  readonly draftRevision?: number;
}): DomainResult<ParentTaskDraftRequestBuild> {
  if (input.journey.lifecycle !== 'draft') {
    return failure('INVALID_TRANSITION', 'Parent task drafting requires a current draft');
  }
  let snapshot: TaskAuthoritySnapshotV1;
  try {
    snapshot = createTaskAuthoritySnapshot(input.journey, input.draftRevision ?? 0);
  } catch {
    return failure('INVALID_INPUT', 'Task is outside the reviewed Parent drafting catalog');
  }
  const parsed = parentTaskDraftRequestV1Schema.safeParse({
    operation: 'draft_parent_task_v1',
    schemaVersion: '1.0',
    requestId: input.requestId,
    bindingNonce: input.bindingNonce,
    localeSet: 'ar_en',
    ageBand: input.ageBand,
    archetypeId: snapshot.archetypeId,
    catalogVersion: input.catalogVersion,
    intent: input.intent,
    effortBand: input.effortBand,
    stepCount: input.stepCount,
    supportMode: input.supportMode,
  });
  return parsed.success
    ? { ok: true, data: { request: parsed.data, snapshot } }
    : failure('INVALID_INPUT', 'Parent task drafting controls are outside policy');
}

export function validateParentTaskDraftSuggestion(
  request: ParentTaskDraftRequestV1,
  input: unknown,
): DomainResult<ParentTaskDraftSuggestionV1> {
  const parsed = parentTaskDraftSuggestionV1Schema.safeParse(input);
  if (
    !parsed.success ||
    parsed.data.requestId !== request.requestId ||
    parsed.data.bindingNonce !== request.bindingNonce ||
    parsed.data.archetypeId !== request.archetypeId ||
    parsed.data.steps.length > request.stepCount
  ) {
    return failure('INVALID_RESPONSE', 'Parent task drafting response is malformed or mismatched');
  }
  const texts = [
    parsed.data.title,
    parsed.data.positiveAction,
    parsed.data.whyItMatters,
    ...parsed.data.steps.map((step) => step.text),
    parsed.data.supportCue,
  ];
  if (!evaluateAssistantSafety({ audience: 'parent', texts }).accepted) {
    return failure('SAFETY_REJECTED', 'Parent task drafting response failed local safety policy');
  }
  return { ok: true, data: parsed.data };
}

function currentSnapshotMatches(
  journey: TaskJourney,
  snapshot: TaskAuthoritySnapshotV1,
  draftRevision: number,
): boolean {
  return (
    journey.lifecycle === 'draft' &&
    snapshot.lifecycle === 'draft' &&
    snapshot.taskId === journey.task.id &&
    snapshot.taskVersion === journey.task.version &&
    snapshot.targetChildId === journey.task.targetChildId &&
    snapshot.archetypeId === journey.task.templateId &&
    snapshot.draftRevision === draftRevision &&
    snapshot.parentOriginalText.ar === journey.task.parentOriginalText.ar &&
    snapshot.parentOriginalText.en === journey.task.parentOriginalText.en &&
    snapshot.authorityDigest === authorityDigest(journey)
  );
}

function stepsToDefinitionOfDone(steps: ParentTaskDraftSuggestionV1['steps']): LocalizedText {
  return {
    ar: steps.map((step) => `${step.order}. ${step.text.ar}`).join('\n'),
    en: steps.map((step) => `${step.order}. ${step.text.en}`).join('\n'),
  };
}

export function applyParentTaskDraftSuggestion(
  journey: TaskJourney,
  snapshot: TaskAuthoritySnapshotV1,
  suggestion: ParentTaskDraftSuggestionV1,
  draftRevision: number,
): DomainResult<TaskJourney> {
  if (!currentSnapshotMatches(journey, snapshot, draftRevision)) {
    return failure('INVALID_TRANSITION', 'Parent task drafting snapshot is stale');
  }
  if (suggestion.archetypeId !== snapshot.archetypeId) {
    return failure('INVALID_RESPONSE', 'Parent task drafting archetype is mismatched');
  }
  const request = {
    operation: 'draft_parent_task_v1' as const,
    schemaVersion: '1.0' as const,
    requestId: suggestion.requestId,
    bindingNonce: suggestion.bindingNonce,
    localeSet: 'ar_en' as const,
    ageBand: '9_11' as const,
    archetypeId: snapshot.archetypeId,
    catalogVersion: 1,
    intent: 'draft' as const,
    effortBand: 'fifteen_thirty' as const,
    stepCount: 4,
    supportMode: 'adult_alongside' as const,
  };
  const validated = validateParentTaskDraftSuggestion(request, suggestion);
  if (!validated.ok) return validated;
  return {
    ok: true,
    data: {
      ...journey,
      task: {
        ...journey.task,
        acceptedGuideFixtureId: PARENT_TASK_DRAFT_ATTRIBUTION,
        content: {
          ...journey.task.content,
          title: cloneLocalized(validated.data.title),
          positiveAction: cloneLocalized(validated.data.positiveAction),
          whyItMatters: cloneLocalized(validated.data.whyItMatters),
          definitionOfDone: stepsToDefinitionOfDone(validated.data.steps),
        },
      },
    },
  };
}
