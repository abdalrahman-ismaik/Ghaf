import type { AgeBand, LocalizedText } from './familyGrowth';

export type CoachPace = 'slow' | 'standard';
export type CoachTone = 'very_short' | 'friendly_clear' | 'respectful_mature';
export type AdultExitPlacement = 'early' | 'persistent';
export type PreparedCoachMaterialFixtureId = 'coach_recycling_steps_v1';

export interface ChildCoachOutputPolicy {
  readonly ageBand: AgeBand;
  readonly maximumSteps: 1 | 3;
  readonly pace: CoachPace;
  readonly tone: CoachTone;
  readonly quickChoiceLimit: 0 | 3;
  readonly adultExitPlacement: AdultExitPlacement;
}

export interface ActiveCoachOutputContext {
  readonly childId: string;
  readonly ageBand: AgeBand;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly lifecycle: 'chosen' | 'in_progress';
  readonly approvedByParent: boolean;
}

export interface PreparedCoachMaterial {
  readonly fixtureId: PreparedCoachMaterialFixtureId;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly steps: readonly LocalizedText[];
  readonly quickChoices: readonly LocalizedText[];
  readonly adultExit: LocalizedText;
  readonly aiDisclosure: LocalizedText;
  readonly origin: 'prepared';
}

export interface AdaptCoachResultInput {
  readonly context: ActiveCoachOutputContext;
  readonly material: PreparedCoachMaterial;
}

export interface AgeAdaptedCoachResult {
  readonly childId: string;
  readonly ageBand: AgeBand;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly policy: ChildCoachOutputPolicy;
  readonly steps: readonly LocalizedText[];
  readonly quickChoices: readonly LocalizedText[];
  readonly adultExit: {
    readonly label: LocalizedText;
    readonly placement: AdultExitPlacement;
    readonly alwaysVisible: true;
  };
  readonly aiDisclosure: LocalizedText;
  readonly changesDefinitionOfDone: false;
  readonly origin: 'prepared';
}

export type VoicePlaybackRate = 0.75 | 1;
export type SyntheticVoiceLifecycle = 'idle' | 'recording' | 'transcript_review' | 'sent';
export type PreparedVoiceTranscriptFixtureId =
  'voice_recycling_complete_v1' | 'voice_short_review_v1';

export interface PreparedVoiceTranscriptFixture {
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly transcript: LocalizedText;
}

export interface VoicePermissionSnapshot {
  readonly childId: string;
  readonly version: number;
  readonly voiceEnabled: boolean;
  readonly aiEnabled: boolean;
}

export interface VoiceAccessContext {
  readonly childId: string;
  readonly accessSessionId: string;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly lifecycle: 'chosen' | 'in_progress';
  readonly approvedByParent: boolean;
  readonly grant: VoicePermissionSnapshot;
}

export interface SyntheticVoiceSession {
  readonly voiceSessionId: string;
  readonly childId: string;
  readonly accessSessionId: string;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly permissionVersion: number;
  readonly lifecycle: SyntheticVoiceLifecycle;
  readonly transcriptFixtureId: PreparedVoiceTranscriptFixtureId | null;
  readonly transcript: LocalizedText | null;
  readonly captionsEnabled: boolean;
  readonly playbackRate: VoicePlaybackRate;
  readonly replayCount: number;
  readonly recordingVisible: boolean;
  readonly backgroundRecording: false;
  readonly sentAt: string | null;
  readonly origin: 'synthetic';
}

export interface CreateVoiceSessionInput {
  readonly voiceSessionId: string;
  readonly access: VoiceAccessContext;
}

export interface StopVoiceSessionInput {
  readonly access: VoiceAccessContext;
  readonly transcriptFixtureId: PreparedVoiceTranscriptFixtureId;
  readonly transcript: LocalizedText;
}

export interface VoicePlaybackInput {
  readonly captionsEnabled: boolean;
  readonly playbackRate: VoicePlaybackRate;
}
