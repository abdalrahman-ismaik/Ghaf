import type {
  CapabilityOrigin,
  CelebrationPayload,
  ChildProfile,
  ChildSubmission,
  CoachRequest,
  CoachResponse,
  GeneratedMissionPayload,
  GhafProgress,
  ImpactRecord,
  ImpactSummary,
  LocalizedText,
  MediaKind,
  MediaReference,
  Mission,
  MissionInput,
  ParentConfirmation,
  PrototypeSession,
  Quantity,
  ServiceError,
  SubmissionDraft,
} from '../../models/prototype';

export type { ServiceError } from '../../models/prototype';

export interface ServiceMeta {
  readonly origin: CapabilityOrigin;
  readonly fallbackUsed: boolean;
}

export type ServiceResult<T> =
  | { readonly ok: true; readonly data: T; readonly meta: ServiceMeta }
  | { readonly ok: false; readonly error: ServiceError };

export interface MissionService {
  validateInput(input: MissionInput): ServiceResult<MissionInput>;
  buildReviewMission(
    input: MissionInput,
    payload: GeneratedMissionPayload,
    context: { readonly attemptId: string; readonly origin: CapabilityOrigin },
  ): ServiceResult<Mission>;
  approveForChild(mission: Mission): ServiceResult<Mission>;
  setStepCompleted(mission: Mission, stepId: string, completed: boolean): ServiceResult<Mission>;
  buildSubmission(
    mission: Mission,
    draft: SubmissionDraft,
    attempt?: number,
  ): ServiceResult<ChildSubmission>;
  requestRetry(
    mission: Mission,
    submission: ChildSubmission,
  ): ServiceResult<{ mission: Mission; submission: ChildSubmission }>;
}

export interface MediaService {
  listPrepared(kind: MediaKind): Promise<ServiceResult<readonly MediaReference[]>>;
  getPrepared(id: string): Promise<ServiceResult<MediaReference>>;
  playAudio(id: string): Promise<ServiceResult<{ durationMs: number }>>;
  pickImage?(): Promise<ServiceResult<MediaReference>>;
  recordVoiceNote?(): Promise<ServiceResult<MediaReference>>;
}

export interface MissionGenerationRequest {
  readonly attemptId: string;
  readonly child: Pick<ChildProfile, 'id' | 'ageBand'>;
  readonly input: MissionInput;
  readonly preparedTranscript?: LocalizedText;
  readonly mode: 'mock' | 'live-optional';
}

export interface AIService {
  generateMission(
    request: MissionGenerationRequest,
  ): Promise<ServiceResult<GeneratedMissionPayload>>;
  respondToCoach(request: CoachRequest): Promise<ServiceResult<CoachResponse>>;
}

export interface ApproveCompletionRequest {
  readonly mission: Mission;
  readonly submission: ChildSubmission;
  readonly confirmedQuantity: Quantity;
  readonly currentSummary: ImpactSummary;
  readonly currentGhaf: GhafProgress;
}

export interface CompletionAward {
  readonly alreadyApplied: boolean;
  readonly confirmation: ParentConfirmation;
  readonly impactRecord: ImpactRecord;
  readonly impactSummary: ImpactSummary;
  readonly ghaf: GhafProgress;
  readonly celebration: CelebrationPayload;
}

export interface ImpactService {
  approveCompletion(
    request: ApproveCompletionRequest,
    existingRecords: readonly ImpactRecord[],
  ): ServiceResult<CompletionAward>;
}

export interface ResetResult {
  readonly session: PrototypeSession;
  readonly navigateTo: '/parent';
}

export interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  reset(): ResetResult;
}

export interface ServiceRegistry {
  readonly mission: MissionService;
  readonly media: MediaService;
  readonly ai: AIService;
  readonly impact: ImpactService;
  readonly prototypeSession: PrototypeSessionService;
}
