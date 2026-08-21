import { create } from 'zustand';

import { requestRetryWithoutAward } from '../features/impact/awardCompletion';
import { generateMissionWithFallback } from '../features/missions/generateMission';
import { transitionLifecycle } from '../features/missions/lifecycle';
import { demoMediaAssets, demoScenario } from '../features/missions/demoContent';
import {
  coerceLocale,
  GENERATION_STAGE_IDS,
  getLocaleDirection,
  type ChildSubmission,
  type Mission,
  type MissionInput,
  type PrototypeRole,
  type PrototypeSession,
  type Quantity,
  type ServiceError,
  type TextDirection,
} from '../models/prototype';
import {
  serviceRegistry,
  type AIService,
  type CompletionAward,
  type ServiceResult,
} from '../services';

let generationAttemptSequence = 0;

export interface PrototypeStoreState extends PrototypeSession {
  readonly setLocale: (value: unknown) => void;
  readonly setRole: (role: PrototypeRole) => void;
  readonly switchRole: () => void;
  readonly updateMissionInput: (patch: Partial<MissionInput>) => void;
  readonly applyDemoInput: () => void;
  readonly startGeneration: () => ServiceResult<string>;
  readonly cancelGeneration: (attemptId: string) => ServiceResult<MissionInput>;
  readonly setGenerationStage: (index: number) => void;
  readonly completeGeneration: (primaryService?: AIService) => Promise<ServiceResult<Mission>>;
  readonly editMission: () => ServiceResult<MissionInput>;
  readonly approveMission: () => ServiceResult<Mission>;
  readonly openChildMission: () => ServiceResult<Mission>;
  readonly setStepCompleted: (stepId: string, completed: boolean) => ServiceResult<Mission>;
  readonly choosePreparedEvidence: () => void;
  readonly requestParentEvidenceConfirmation: () => void;
  readonly setReflection: (reflection: string) => void;
  readonly submitForConfirmation: () => ServiceResult<ChildSubmission>;
  readonly requestRetry: () => ServiceResult<{ mission: Mission; submission: ChildSubmission }>;
  readonly approveCompletion: (quantity: Quantity) => ServiceResult<CompletionAward>;
  readonly clearCelebration: () => void;
  readonly resetDemo: () => '/parent';
}

function success<T>(data: T, origin: 'seeded' | 'simulated'): ServiceResult<T> {
  return { ok: true, data, meta: { origin, fallbackUsed: false } };
}

function failure(
  code: 'INVALID_INPUT' | 'INVALID_TRANSITION' | 'INVALID_RESPONSE',
  message: string,
  options: { retryable?: boolean; fallbackAvailable?: boolean } = {},
): { readonly ok: false; readonly error: ServiceError } {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: options.retryable ?? false,
      fallbackAvailable: options.fallbackAvailable ?? false,
    },
  };
}

function errorPatch(error: ServiceError): Pick<PrototypeSession, 'lastError'> {
  return { lastError: error };
}

function demoMissionInput(current: MissionInput): MissionInput {
  return {
    ...current,
    childId: demoScenario.child.id,
    foodImageId: demoMediaAssets.foodImage.id,
    voiceNoteId: demoMediaAssets.familyWisdomArabic.id,
    quantity: { ...demoScenario.inputDefaults.quantity },
    availableMinutes: demoScenario.inputDefaults.availableMinutes,
    reward: { ...demoScenario.inputDefaults.reward },
  };
}

export const usePrototypeStore = create<PrototypeStoreState>((set, get) => ({
  ...serviceRegistry.prototypeSession.getInitialSession(),

  setLocale: (value) => {
    const locale = coerceLocale(value);
    set({ locale, direction: getLocaleDirection(locale) });
  },

  setRole: (role) => set({ role }),

  switchRole: () =>
    set((state) => ({
      role: state.role === 'parent' ? 'child' : 'parent',
    })),

  updateMissionInput: (patch) => {
    if (get().journeyStatus !== 'draft-input') return;
    set((state) => ({
      missionInput: {
        ...state.missionInput,
        ...patch,
        id: state.missionInput.id,
        updatedAt: state.missionInput.updatedAt,
      },
      lastError: null,
    }));
  },

  applyDemoInput: () => {
    if (get().journeyStatus !== 'draft-input') return;
    set((state) => ({ missionInput: demoMissionInput(state.missionInput), lastError: null }));
  },

  startGeneration: () => {
    const state = get();
    const validInput = serviceRegistry.mission.validateInput(state.missionInput);
    if (!validInput.ok) {
      set(errorPatch(validInput.error));
      return validInput;
    }
    const transition = transitionLifecycle(state.journeyStatus, 'start-generation');
    if (!transition.ok) {
      set(errorPatch(transition.error));
      return transition;
    }

    generationAttemptSequence += 1;
    const attemptId = `${demoScenario.mission.generationAttemptId}:${generationAttemptSequence}`;
    set({
      journeyStatus: transition.data,
      generation: {
        attemptId,
        currentStageIndex: 0,
        stages: GENERATION_STAGE_IDS,
        status: 'running',
        origin: 'simulated',
        fallbackUsed: false,
      },
      lastError: null,
    });
    return success(attemptId, 'simulated');
  },

  cancelGeneration: (attemptId) => {
    const state = get();
    if (
      state.journeyStatus !== 'generating' ||
      !state.generation ||
      state.generation.attemptId !== attemptId
    ) {
      return failure('INVALID_TRANSITION', 'Generation attempt is no longer active');
    }
    set({
      journeyStatus: 'draft-input',
      activeMission: null,
      generation: null,
      lastError: null,
    });
    return success(state.missionInput, 'seeded');
  },

  setGenerationStage: (index) => {
    const generation = get().generation;
    if (!generation || generation.status !== 'running') return;
    set({
      generation: {
        ...generation,
        currentStageIndex: Math.max(
          0,
          Math.min(GENERATION_STAGE_IDS.length - 1, Math.trunc(index)),
        ),
      },
    });
  },

  completeGeneration: async (primaryService = serviceRegistry.ai) => {
    const state = get();
    if (state.journeyStatus !== 'generating' || !state.generation) {
      const result = failure('INVALID_TRANSITION', 'Generation has not started');
      set(errorPatch(result.error));
      return result;
    }

    const generation = await generateMissionWithFallback({
      input: state.missionInput,
      attemptId: state.generation.attemptId,
      child: state.family.child,
      primaryService,
      fallbackService: serviceRegistry.ai,
    });
    const current = get();
    const currentGeneration = current.generation;
    if (
      current.journeyStatus !== 'generating' ||
      !currentGeneration ||
      currentGeneration.attemptId !== state.generation.attemptId
    ) {
      return failure('INVALID_TRANSITION', 'Generation attempt is no longer active');
    }
    if (!generation.ok) {
      set({
        generation: { ...currentGeneration, status: 'failed' },
        ...errorPatch(generation.error),
      });
      return generation;
    }

    const reviewMission = serviceRegistry.mission.buildReviewMission(
      generation.data.input,
      generation.data.payload,
      { attemptId: generation.data.attemptId, origin: generation.meta.origin },
    );
    if (!reviewMission.ok) {
      set({
        generation: { ...current.generation, status: 'failed' },
        ...errorPatch(reviewMission.error),
      });
      return reviewMission;
    }
    const transition = transitionLifecycle(
      current.journeyStatus,
      generation.meta.fallbackUsed ? 'use-mock-fallback' : 'generation-succeeded',
    );
    if (!transition.ok) {
      set(errorPatch(transition.error));
      return transition;
    }

    const versionedMission = {
      ...reviewMission.data,
      version: (current.activeMission?.version ?? 0) + 1,
    };
    set({
      journeyStatus: transition.data,
      activeMission: versionedMission,
      generation: {
        ...currentGeneration,
        currentStageIndex: GENERATION_STAGE_IDS.length - 1,
        status: 'complete',
        origin: generation.meta.origin,
        fallbackUsed: generation.meta.fallbackUsed,
      },
      lastError: null,
    });
    return {
      ok: true,
      data: versionedMission,
      meta: generation.meta,
    };
  },

  editMission: () => {
    const state = get();
    if (!state.activeMission) return failure('INVALID_INPUT', 'No mission is available to edit');
    const transition = transitionLifecycle(state.journeyStatus, 'edit-mission');
    if (!transition.ok) return transition;
    set({
      journeyStatus: transition.data,
      activeMission: {
        ...state.activeMission,
        status: transition.data,
        approvedByParent: false,
      },
      generation: null,
      lastError: null,
    });
    return success(state.missionInput, 'seeded');
  },

  approveMission: () => {
    const state = get();
    if (!state.activeMission) return failure('INVALID_INPUT', 'No reviewed mission is available');
    const approved = serviceRegistry.mission.approveForChild(state.activeMission);
    if (!approved.ok) {
      set(errorPatch(approved.error));
      return approved;
    }
    set({ journeyStatus: approved.data.status, activeMission: approved.data, lastError: null });
    return approved;
  },

  openChildMission: () => {
    const state = get();
    const mission = state.activeMission;
    if (!mission || !mission.approvedByParent) {
      return failure('INVALID_TRANSITION', 'A Parent-approved mission is required');
    }
    if (mission.status !== 'assigned') {
      if (
        ['child-in-progress', 'awaiting-parent-confirmation', 'completed'].includes(mission.status)
      ) {
        return success(mission, 'seeded');
      }
      return failure('INVALID_TRANSITION', 'Mission is not ready for Child work');
    }
    const transition = transitionLifecycle(mission.status, 'open-child-mission');
    if (!transition.ok) return transition;
    const opened = { ...mission, status: transition.data };
    set({ activeMission: opened, journeyStatus: transition.data, lastError: null });
    return success(opened, 'seeded');
  },

  setStepCompleted: (stepId, completed) => {
    const mission = get().activeMission;
    if (!mission) return failure('INVALID_INPUT', 'No active mission');
    const updated = serviceRegistry.mission.setStepCompleted(mission, stepId, completed);
    if (!updated.ok) {
      set(errorPatch(updated.error));
      return updated;
    }
    set({ activeMission: updated.data, lastError: null });
    return updated;
  },

  choosePreparedEvidence: () => {
    set((state) => ({
      submissionDraft: {
        ...state.submissionDraft,
        evidenceMediaId: demoMediaAssets.evidenceImage.id,
        parentConfirmationRequested: false,
      },
      lastError: null,
    }));
  },

  requestParentEvidenceConfirmation: () => {
    set((state) => ({
      submissionDraft: {
        ...state.submissionDraft,
        evidenceMediaId: null,
        parentConfirmationRequested: true,
      },
      lastError: null,
    }));
  },

  setReflection: (reflection) => {
    set((state) => ({
      submissionDraft: { ...state.submissionDraft, reflection },
      lastError: null,
    }));
  },

  submitForConfirmation: () => {
    const state = get();
    if (!state.activeMission) return failure('INVALID_INPUT', 'No active mission');
    const nextAttempt = (state.submission?.attempt ?? 0) + 1;
    const submission = serviceRegistry.mission.buildSubmission(
      state.activeMission,
      state.submissionDraft,
      nextAttempt,
    );
    if (!submission.ok) {
      set(errorPatch(submission.error));
      return submission;
    }
    const transition = transitionLifecycle(state.journeyStatus, 'submit-for-confirmation');
    if (!transition.ok) {
      set(errorPatch(transition.error));
      return transition;
    }
    set({
      journeyStatus: transition.data,
      activeMission: { ...state.activeMission, status: transition.data },
      submission: submission.data,
      confirmation: null,
      lastError: null,
    });
    return submission;
  },

  requestRetry: () => {
    const state = get();
    if (!state.activeMission || !state.submission) {
      return failure('INVALID_INPUT', 'No submission is available for retry');
    }
    const retry = serviceRegistry.mission.requestRetry(state.activeMission, state.submission);
    if (!retry.ok) {
      set(errorPatch(retry.error));
      return retry;
    }
    const retryDetail = requestRetryWithoutAward(state.activeMission, state.submission);
    if (!retryDetail.ok) return retryDetail;
    set({
      journeyStatus: retry.data.mission.status,
      activeMission: retry.data.mission,
      submission: retry.data.submission,
      confirmation: retryDetail.data.confirmation,
      celebration: null,
      lastError: null,
    });
    return retry;
  },

  approveCompletion: (quantity) => {
    const state = get();
    if (!state.activeMission || !state.submission) {
      return failure('INVALID_INPUT', 'No Child submission is available to approve');
    }
    const award = serviceRegistry.impact.approveCompletion(
      {
        mission: state.activeMission,
        submission: state.submission,
        confirmedQuantity: quantity,
        currentSummary: state.impactSummary,
        currentGhaf: state.ghaf,
      },
      state.sessionImpactRecords,
    );
    if (!award.ok) {
      set(errorPatch(award.error));
      return award;
    }
    if (award.data.alreadyApplied) {
      return {
        ...award,
        data: {
          ...award.data,
          celebration: state.celebration ?? award.data.celebration,
        },
      };
    }

    set({
      journeyStatus: 'completed',
      activeMission: { ...state.activeMission, status: 'completed' },
      submission: { ...state.submission, status: 'approved' },
      confirmation: award.data.confirmation,
      sessionImpactRecords: [...state.sessionImpactRecords, award.data.impactRecord],
      impactSummary: award.data.impactSummary,
      ghaf: award.data.ghaf,
      celebration: award.data.celebration,
      lastError: null,
    });
    return award;
  },

  clearCelebration: () => set({ celebration: null }),

  resetDemo: () => {
    const reset = serviceRegistry.prototypeSession.reset();
    set(reset.session);
    return reset.navigateTo;
  },
}));

export const selectCompletedStepCount = (state: PrototypeStoreState): number =>
  state.activeMission?.steps.filter((step) => step.completed).length ?? 0;

export const selectCanSubmit = (state: PrototypeStoreState): boolean =>
  state.activeMission?.steps.every((step) => step.completed) === true &&
  state.submissionDraft.reflection.trim().length > 0 &&
  (state.submissionDraft.evidenceMediaId !== null) !==
    state.submissionDraft.parentConfirmationRequested;

export const selectMissionOrigin = (state: PrototypeStoreState): Mission['origin'] | null =>
  state.activeMission?.origin ?? null;

export type PrototypeStoreSnapshot = Pick<
  PrototypeStoreState,
  | 'locale'
  | 'direction'
  | 'role'
  | 'journeyStatus'
  | 'missionInput'
  | 'activeMission'
  | 'submissionDraft'
  | 'submission'
  | 'impactSummary'
  | 'ghaf'
  | 'celebration'
> & { readonly direction: TextDirection };
