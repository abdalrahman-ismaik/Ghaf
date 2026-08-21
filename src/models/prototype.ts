export const SUPPORTED_LOCALES = ['ar', 'en'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];
export type TextDirection = 'rtl' | 'ltr';
export type PrototypeRole = 'parent' | 'child';
export type PrototypeMode = 'mock' | 'live-optional';

export interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}

export type CapabilityOrigin =
  'seeded' | 'prepared' | 'simulated' | 'pregenerated-mock' | 'live-optional';

export type ServiceErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'INVALID_TRANSITION'
  | 'PERMISSION_DENIED'
  | 'REMOTE_UNAVAILABLE'
  | 'INVALID_RESPONSE';

export interface ServiceError {
  readonly code: ServiceErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly fallbackAvailable: boolean;
}

export interface ParentProfile {
  readonly id: string;
  readonly role: 'parent';
  readonly displayName: LocalizedText;
}

export interface ChildProfile {
  readonly id: string;
  readonly role: 'child';
  readonly displayName: LocalizedText;
  readonly ageBand: '8-10';
}

export interface FamilyProfile {
  readonly id: string;
  readonly displayName: LocalizedText;
  readonly parentId: string;
  readonly childId: string;
  readonly parent: ParentProfile;
  readonly child: ChildProfile;
}

export type QuantityUnit = 'grams' | 'portions';

export interface Quantity {
  readonly value: number;
  readonly unit: QuantityUnit;
}

export type MediaKind = 'food-image' | 'family-voice-note' | 'evidence-image' | 'narration';

export interface MediaReference {
  readonly id: string;
  readonly kind: MediaKind;
  readonly uri: string;
  readonly label: LocalizedText;
  readonly origin: CapabilityOrigin;
  readonly durationMs: number | null;
  readonly mimeType: string | null;
}

/** Compatibility alias retained while Feature 001 screens migrate to MediaReference. */
export type PreparedMedia = MediaReference;

export interface MissionInput {
  readonly id: string;
  readonly childId: string | null;
  readonly foodImageId: string | null;
  readonly voiceNoteId: string | null;
  readonly quantity: Quantity | null;
  readonly availableMinutes: number;
  readonly reward: LocalizedText | null;
  readonly updatedAt: string;
}

export type MissionLifecycleStatus =
  | 'draft-input'
  | 'generating'
  | 'parent-review'
  | 'assigned'
  | 'child-in-progress'
  | 'awaiting-parent-confirmation'
  | 'completed';

export interface GeneratedMissionStep {
  readonly order: 1 | 2 | 3;
  readonly instruction: LocalizedText;
}

export interface GeneratedMissionPayload {
  readonly schemaVersion: '1.0';
  readonly title: LocalizedText;
  readonly story: LocalizedText;
  readonly steps: readonly [GeneratedMissionStep, GeneratedMissionStep, GeneratedMissionStep];
  readonly reflectionPrompt: LocalizedText;
  readonly impactTarget: Quantity;
  readonly evidenceMethod: 'prepared-evidence' | 'parent-confirmation' | 'either';
  readonly reward: LocalizedText | null;
  readonly personalization: {
    readonly childAgeBand: string;
    readonly foodSituation: LocalizedText;
    readonly familyWisdomSummary: LocalizedText;
    readonly availableMinutes: number;
  };
}

export interface MissionStep {
  readonly id: string;
  readonly order: 1 | 2 | 3;
  readonly instruction: LocalizedText;
  /** Compatibility field for the small Feature 001 card. */
  readonly text: LocalizedText;
  readonly completed: boolean;
}

export interface Mission {
  readonly id: string;
  readonly inputId: string;
  readonly version: number;
  readonly assignedChildId: string;
  readonly title: LocalizedText;
  readonly story: LocalizedText;
  readonly steps: readonly [MissionStep, MissionStep, MissionStep];
  readonly reflectionPrompt: LocalizedText;
  readonly impactTarget: Quantity;
  readonly evidenceMethod: 'prepared-evidence' | 'parent-confirmation' | 'either';
  readonly reward: LocalizedText | null;
  readonly origin: CapabilityOrigin;
  /** Compatibility disclosure for the Feature 001 mission card. */
  readonly source: CapabilityOrigin;
  readonly status: MissionLifecycleStatus;
  readonly generationAttemptId: string;
  readonly approvedByParent: boolean;
}

/** Compatibility alias retained while Feature 001 UI is upgraded. */
export type MissionSummary = Mission;

export interface SubmissionDraft {
  readonly evidenceMediaId: string | null;
  readonly parentConfirmationRequested: boolean;
  readonly reflection: string;
}

export interface ChildSubmission {
  readonly id: string;
  readonly missionId: string;
  readonly completedStepIds: readonly [string, string, string];
  readonly evidenceMediaId: string | null;
  readonly parentConfirmationRequested: boolean;
  readonly reflection: string;
  readonly attempt: number;
  readonly status: 'editing' | 'awaiting-parent' | 'retry-requested' | 'approved';
}

export interface ParentConfirmation {
  readonly id: string;
  readonly missionId: string;
  readonly submissionId: string;
  readonly decision: 'approve' | 'retry';
  readonly confirmedQuantity: Quantity | null;
  readonly retryMessage: LocalizedText | null;
  readonly awardKey: string;
}

export interface ImpactRecord {
  readonly id: string;
  readonly awardKey: string;
  readonly missionId: string;
  readonly confirmationId: string;
  readonly rescuedQuantity: Quantity;
  readonly awardedProgressPoints: number;
  readonly origin: 'parent-estimate';
}

export interface ImpactSummary {
  readonly rescuedGrams: number;
  readonly rescuedPortions: number;
  readonly completedMissions: number;
  readonly streakDays: number;
}

export type GhafStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface GhafProgress {
  readonly stage: GhafStage;
  readonly progressPercent: number;
  readonly progressPoints: number;
  readonly unlockedMilestoneIds: readonly string[];
  readonly newMilestone: LocalizedText | null;
}

export interface CelebrationPayload {
  readonly missionId: string;
  readonly awardKey: string;
  readonly rescuedQuantity: Quantity;
  readonly awardedProgressPoints: number;
  readonly previousStage: GhafStage;
  readonly currentStage: GhafStage;
  readonly milestoneId: string | null;
  readonly milestone: LocalizedText | null;
  readonly reward: LocalizedText | null;
  readonly origin: 'parent-estimate';
}

export const GENERATION_STAGE_IDS = [
  'listening',
  'understanding',
  'creating',
  'preparing',
] as const;

export type GenerationStageId = (typeof GENERATION_STAGE_IDS)[number];

export interface GenerationState {
  readonly attemptId: string;
  readonly currentStageIndex: number;
  readonly stages: typeof GENERATION_STAGE_IDS;
  readonly status: 'running' | 'complete' | 'failed';
  readonly origin: CapabilityOrigin;
  readonly fallbackUsed: boolean;
}

export interface PrototypeSession {
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly role: PrototypeRole;
  readonly mode: PrototypeMode;
  /** Compatibility flag; mode remains the source of truth. */
  readonly mockMode: true;
  readonly family: FamilyProfile;
  readonly journeyStatus: MissionLifecycleStatus;
  readonly missionInput: MissionInput;
  readonly activeMission: Mission | null;
  readonly submissionDraft: SubmissionDraft;
  readonly submission: ChildSubmission | null;
  readonly confirmation: ParentConfirmation | null;
  readonly sessionImpactRecords: readonly ImpactRecord[];
  readonly impactSummary: ImpactSummary;
  readonly ghaf: GhafProgress;
  readonly celebration: CelebrationPayload | null;
  readonly generation: GenerationState | null;
  readonly lastError: ServiceError | null;
}

/**
 * Accepts values read from platform or prototype storage. Unsupported or malformed
 * values deliberately return the Arabic-first demo default.
 */
export function coerceLocale(value: unknown): LocaleCode {
  if (typeof value !== 'string') {
    return 'ar';
  }

  const language = value.trim().toLowerCase().split(/[-_]/, 1)[0];
  return language === 'en' ? 'en' : 'ar';
}

export function getLocaleDirection(value: unknown): TextDirection {
  return coerceLocale(value) === 'ar' ? 'rtl' : 'ltr';
}
