import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import type {
  CompletionMode,
  LocalizedText,
  PrototypeSession,
  SyntheticChildId,
  TaskJourney,
} from '../../src/models/familyGrowth';
import { usePrototypeStore, type PrototypeStoreState } from '../../src/state/usePrototypeStore';
import {
  allocateTaskOccurrence,
  initializeProfileLandscapes,
  openingPersonalLandscapes,
  recordTaskJourney,
  routineProgressKey,
} from '../../src/features/tasks/assignmentInstances';
import { DeterministicTaskService } from '../../src/services/mock';
import { PREPARED_PRAISE } from '../../src/services/mock/fixtures';

function assertOk(result: { readonly ok: boolean; readonly error?: { readonly message: string } }) {
  if (!result.ok) throw new Error(result.error?.message ?? 'Expected synthetic access to succeed');
}

function data<T>(
  result:
    | { readonly ok: true; readonly data: T }
    | { readonly ok: false; readonly error: { readonly message: string } },
): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

// Explicit fixture hydration only: production commands still enforce every lifecycle transition.
export function seedPrototypeStateForTest(patch: Partial<PrototypeStoreState>): void {
  const current = usePrototypeStore.getState();
  const next = { ...current, ...patch };
  let collection = patch.taskAssignments ?? current.taskAssignments;
  let contexts = patch.taskContexts ?? current.taskContexts;
  const journey = patch.journey;
  if (journey) {
    const id =
      journey.task.occurrence?.instanceId ??
      (journey.task.id === 'task_recycling_p0_v1'
        ? 'assignment_recycling_p0_v1'
        : (journey.assignment?.id ?? null));
    if (id) {
      const entry = {
        id,
        childId: journey.task.targetChildId,
        templateRevision: journey.task.content.catalogExecution?.revision ?? 'p0_v1',
        routineKey: routineProgressKey(journey.task),
        approvedSnapshot: journey.assignment ? structuredClone(journey.task) : null,
        journey,
        attempts: journey.submission
          ? [
              {
                submission: structuredClone(journey.submission),
                checkIn: journey.checkIn ? structuredClone(journey.checkIn) : null,
              },
            ]
          : [],
      };
      collection = {
        ...collection,
        nextOccurrence: Math.max(
          collection.nextOccurrence,
          (journey.task.occurrence?.sequence ?? 0) + 1,
        ),
        legacyP0Allocated:
          collection.legacyP0Allocated || journey.task.id === 'task_recycling_p0_v1',
        order: collection.order.includes(id) ? collection.order : [...collection.order, id],
        byId: { ...collection.byId, [id]: entry },
        selectedByChild: { ...collection.selectedByChild, [entry.childId]: id },
        parentSelectedId: id,
      };
      contexts = {
        ...contexts,
        [id]: {
          confirmationPlan: patch.confirmationPlan ?? null,
          childTaskDraft: next.childTaskDraft,
          prospectiveTaskAdjustment: patch.prospectiveTaskAdjustment ?? null,
          preAcceptanceAdjustment: patch.preAcceptanceAdjustment ?? null,
        },
      };
    }
  }
  const maps =
    patch.landscapeProgressByChild ??
    (patch.landscapeProgress
      ? {
          child_salem: patch.landscapeProgress,
          child_alya: openingPersonalLandscapes('child_alya'),
        }
      : initializeProfileLandscapes(next));
  usePrototypeStore.setState({
    ...patch,
    taskAssignments: collection,
    taskContexts: contexts,
    landscapeProgressByChild: maps,
    landscapeProgress: maps[next.activeChildId],
    ...(journey
      ? {
          confirmationPlan: patch.confirmationPlan ?? null,
          lastRecognitionAttempt: patch.lastRecognitionAttempt ?? null,
        }
      : {}),
  });
}

export function taskPraiseForTest(
  journey: TaskJourney = usePrototypeStore.getState().journey!,
): LocalizedText {
  if (!journey) throw new Error('A task is required for prepared praise');
  const catalog = journey.task.content.catalogExecution;
  return catalog && journey.task.occurrence
    ? journey.submission?.completionMode === 'permitted_help'
      ? catalog.permittedHelpPraise
      : catalog.confirmationPraise
    : PREPARED_PRAISE;
}

export function createCatalogSubmittedStateForTest(
  templateId: string,
  options: {
    readonly childId?: SyntheticChildId;
    readonly completionMode?: CompletionMode;
    readonly routinePhase?: 'acquisition' | 'maintenance';
    readonly base?: PrototypeSession;
  } = {},
): PrototypeSession &
  Pick<
    PrototypeStoreState,
    | 'taskAssignments'
    | 'confirmationPlan'
    | 'lastRecognitionAttempt'
    | 'childTaskDraft'
    | 'preAcceptanceAdjustment'
    | 'prospectiveTaskAdjustment'
  > & { readonly journey: TaskJourney } {
  const state = usePrototypeStore.getState();
  const base = options.base ?? state;
  const childId = options.childId ?? 'child_salem';
  const service = new DeterministicTaskService();
  const template = service.listTemplates().find((item) => item.id === templateId);
  if (!template) throw new Error('Expected a reviewed catalog definition');
  const allocation = data(
    allocateTaskOccurrence(state.taskAssignments, {
      householdId: base.household.id,
      childId,
      templateId,
    }),
  );
  const childProfile = { id: childId, ageBand: '9_11' as const };
  const parentText =
    template.id === 'task_recycling_p0_v1'
      ? {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        }
      : template.positiveAction;
  let journey = data(
    service.createDraft({
      childId,
      templateId,
      parentText,
      occurrence: allocation.identity,
      childProfile,
      ...(options.routinePhase ? { routinePhase: options.routinePhase } : {}),
    }),
  );
  let collection = allocation.collection;
  const record = () => {
    collection = data(
      recordTaskJourney(collection, {
        instanceId: allocation.identity.instanceId,
        expectedTaskVersion: journey.task.version,
        journey,
      }),
    );
  };
  record();
  data(service.review(journey));
  journey = { ...journey, lifecycle: 'reviewed' };
  record();
  const approved = data(service.approveAssignment(journey, childProfile));
  journey = approved.journey;
  record();
  journey = data(service.chooseAssignment(journey, childId));
  record();
  journey = data(service.startAssignment(journey, childId));
  record();
  const completionMode = options.completionMode ?? 'permitted_help';
  journey = data(
    service.submit(journey, childId, {
      definitionAcknowledged: true,
      completionMode,
      helpUsed: completionMode === 'permitted_help' ? template.permittedHelp : null,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
  record();
  const maps = initializeProfileLandscapes(base);
  return {
    ...base,
    activeChildId: childId,
    activeAssignmentId: journey.assignment!.id,
    journey,
    confirmationPlan: null,
    lastRecognitionAttempt: null,
    preAcceptanceAdjustment: null,
    prospectiveTaskAdjustment: null,
    childTaskDraft: {
      selectedMediaFixtureId: null,
      removedMediaFixtureIds: [],
      unavailableMediaFixtureIds: [],
      reflection: null,
    },
    choicePool: { ...base.choicePool, p0AssignmentChoice: approved.executableChoice },
    landscapeProgressByChild: maps,
    landscapeProgress: maps[childId],
    taskAssignments: collection,
  };
}

export function resetPrototypeForTest() {
  usePrototypeStore.setState({ role: 'parent', activeExperience: 'parent' });
  return usePrototypeStore.getState().resetPrototype();
}

export async function enterParentExperienceForTest() {
  const current = usePrototypeStore.getState();
  if (current.activeExperience === 'parent' && current.authorizeParentExperience().ok) return;
  if (current.activeExperience !== 'signed_out') {
    assertOk(current.signOutExperience());
  }
  assertOk(
    usePrototypeStore
      .getState()
      [
        usePrototypeStore.getState().localFamily.record
          ? 'requestExistingParentVerification'
          : 'requestParentVerification'
      ]({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
  );
  assertOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  assertOk(usePrototypeStore.getState().completeParentOnboarding());
}

export async function enterChildExperienceForTest(childId: SyntheticChildId = 'child_salem') {
  let current = usePrototypeStore.getState();
  if (
    current.activeExperience === 'child' &&
    current.activeChildId === childId &&
    current.authorizeChildExperience().ok
  ) {
    return;
  }
  if (!current.localFamily.configuredChildIds.includes(childId)) {
    await enterParentExperienceForTest();
    assertOk(usePrototypeStore.getState().signOutExperience());
    current = usePrototypeStore.getState();
  }
  if (current.activeExperience !== 'signed_out') {
    assertOk(current.signOutExperience());
  }

  assertOk(usePrototypeStore.getState().selectChildAccessProfile(childId));
  const credential = childId === 'child_salem' ? '2468' : 'leaf-water-tree';
  const verified = usePrototypeStore.getState().verifyChildCredential(credential);
  assertOk(verified);
  if (usePrototypeStore.getState().activeExperience === 'child') return;

  assertOk(usePrototypeStore.getState().requestChildPairing());
  await enterParentExperienceForTest();
  assertOk(usePrototypeStore.getState().approveChildPairing());
  assertOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  assertOk(usePrototypeStore.getState().completeChildPairing());
}
