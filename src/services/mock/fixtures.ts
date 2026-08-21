import {
  demoMediaAssets,
  demoMissionPayload,
  demoScenario,
} from '../../features/missions/demoContent';
import type {
  FamilyProfile,
  GeneratedMissionPayload,
  GhafProgress,
  ImpactSummary,
  MediaReference,
  Mission,
  MissionInput,
  MissionStep,
  PrototypeSession,
  SubmissionDraft,
} from '../../models/prototype';

export const DEMO_TIMESTAMP = '2026-08-22T00:00:00.000Z';

export function createSeededFamily(): FamilyProfile {
  const parent = {
    id: demoScenario.parent.id,
    role: 'parent' as const,
    displayName: { ...demoScenario.parent.displayName },
  };
  const child = {
    id: demoScenario.child.id,
    role: 'child' as const,
    displayName: { ...demoScenario.child.displayName },
    ageBand: demoScenario.child.ageBand,
  };

  return {
    id: demoScenario.family.id,
    displayName: { ...demoScenario.family.displayName },
    parentId: parent.id,
    childId: child.id,
    parent,
    child,
  };
}

export function createEmptyMissionInput(): MissionInput {
  return {
    id: 'mission-input-demo',
    childId: null,
    foodImageId: null,
    voiceNoteId: null,
    quantity: null,
    availableMinutes: demoScenario.inputDefaults.availableMinutes,
    reward: null,
    updatedAt: DEMO_TIMESTAMP,
  };
}

export function createDemoMissionInput(): MissionInput {
  return {
    id: 'mission-input-demo',
    childId: demoScenario.child.id,
    foodImageId: demoMediaAssets.foodImage.id,
    voiceNoteId: demoMediaAssets.familyWisdomArabic.id,
    quantity: { ...demoScenario.inputDefaults.quantity },
    availableMinutes: demoScenario.inputDefaults.availableMinutes,
    reward: { ...demoScenario.inputDefaults.reward },
    updatedAt: DEMO_TIMESTAMP,
  };
}

export function createPregeneratedMissionPayload(): GeneratedMissionPayload {
  return {
    schemaVersion: '1.0',
    title: { ...demoMissionPayload.title },
    story: { ...demoMissionPayload.story },
    steps: [
      {
        order: 1,
        instruction: { ...demoMissionPayload.steps[0].instruction },
      },
      {
        order: 2,
        instruction: { ...demoMissionPayload.steps[1].instruction },
      },
      {
        order: 3,
        instruction: { ...demoMissionPayload.steps[2].instruction },
      },
    ],
    reflectionPrompt: { ...demoMissionPayload.reflectionPrompt },
    impactTarget: { ...demoMissionPayload.impactTarget },
    evidenceMethod: demoMissionPayload.evidenceMethod,
    reward: { ...demoMissionPayload.reward },
    personalization: {
      childAgeBand: demoMissionPayload.personalization.childAgeBand,
      foodSituation: { ...demoMissionPayload.personalization.foodSituation },
      familyWisdomSummary: { ...demoMissionPayload.personalization.familyWisdomSummary },
      availableMinutes: demoMissionPayload.personalization.availableMinutes,
    },
  };
}

function createMissionSteps(
  payload: GeneratedMissionPayload,
): [MissionStep, MissionStep, MissionStep] {
  return payload.steps.map((step) => ({
    id: `${demoScenario.mission.id}:step-${step.order}`,
    order: step.order,
    instruction: { ...step.instruction },
    text: { ...step.instruction },
    completed: false,
  })) as [MissionStep, MissionStep, MissionStep];
}

export function createReviewMission(
  input: MissionInput = createDemoMissionInput(),
  attemptId = demoScenario.mission.generationAttemptId,
): Mission {
  const payload = createPregeneratedMissionPayload();
  if (!input.childId) {
    throw new Error('The deterministic review fixture requires a selected Child');
  }

  return {
    id: demoScenario.mission.id,
    inputId: input.id,
    version: 1,
    assignedChildId: input.childId,
    title: payload.title,
    story: payload.story,
    steps: createMissionSteps(payload),
    reflectionPrompt: payload.reflectionPrompt,
    impactTarget: payload.impactTarget,
    evidenceMethod: payload.evidenceMethod,
    reward: payload.reward,
    origin: 'pregenerated-mock',
    source: 'pregenerated-mock',
    status: 'parent-review',
    generationAttemptId: attemptId,
    approvedByParent: false,
  };
}

/** Compatibility helper; returns the unassigned pregenerated review fixture. */
export function createSeededMission(): Mission {
  return createReviewMission();
}

export function createSeededImpact(): ImpactSummary {
  return {
    rescuedGrams: 1_250,
    rescuedPortions: 5,
    completedMissions: 3,
    streakDays: 2,
  };
}

export function createSeededGhafProgress(): GhafProgress {
  return {
    stage: 2,
    progressPercent: 48,
    progressPoints: 48,
    unlockedMilestoneIds: ['sapling'],
    newMilestone: null,
  };
}

function mediaReference(
  asset: (typeof demoMediaAssets)[keyof typeof demoMediaAssets],
): MediaReference {
  return {
    id: asset.id,
    kind: asset.kind,
    uri: asset.relativePath,
    label: { ...asset.label },
    origin: 'prepared',
    durationMs: asset.durationMs,
    mimeType: asset.mimeType,
  };
}

export function createPreparedMedia(): readonly MediaReference[] {
  return Object.values(demoMediaAssets).map(mediaReference);
}

export function createPreparedImage(): MediaReference {
  return mediaReference(demoMediaAssets.foodImage);
}

export function createPreparedAudio(): MediaReference {
  return mediaReference(demoMediaAssets.familyWisdomArabic);
}

export function createPreparedEvidence(): MediaReference {
  return mediaReference(demoMediaAssets.evidenceImage);
}

export function createPreparedNarration(locale: 'ar' | 'en' = 'ar'): MediaReference {
  return mediaReference(
    locale === 'ar'
      ? demoMediaAssets.missionNarrationArabic
      : demoMediaAssets.missionNarrationEnglish,
  );
}

export function createEmptySubmissionDraft(): SubmissionDraft {
  return {
    evidenceMediaId: null,
    parentConfirmationRequested: false,
    reflection: '',
  };
}

export function createInitialPrototypeSession(): PrototypeSession {
  return {
    locale: 'ar',
    direction: 'rtl',
    role: 'parent',
    mode: 'mock',
    mockMode: true,
    family: createSeededFamily(),
    journeyStatus: 'draft-input',
    missionInput: createEmptyMissionInput(),
    activeMission: null,
    submissionDraft: createEmptySubmissionDraft(),
    submission: null,
    confirmation: null,
    sessionImpactRecords: [],
    impactSummary: createSeededImpact(),
    ghaf: createSeededGhafProgress(),
    celebration: null,
    generation: null,
    lastError: null,
  };
}
