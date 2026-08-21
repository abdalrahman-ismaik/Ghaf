import type {
  GhafProgress,
  ImpactSummary,
  MissionSummary,
  PreparedMedia,
  PrototypeSession,
} from '../../models/prototype';

export interface ServiceError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
}

export type ServiceResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: ServiceError };

export interface MissionService {
  getActiveMission(): Promise<ServiceResult<MissionSummary>>;
}

export interface MediaService {
  getPreparedImage(): Promise<ServiceResult<PreparedMedia>>;
  getPreparedAudio(): Promise<ServiceResult<PreparedMedia>>;
}

export interface AIService {
  getPregeneratedMission(): Promise<ServiceResult<MissionSummary>>;
}

export interface ImpactService {
  getSummary(): Promise<ServiceResult<ImpactSummary>>;
  getGhafProgress(): Promise<ServiceResult<GhafProgress>>;
}

export interface PrototypeSessionService {
  getInitialSession(): PrototypeSession;
  reset(): PrototypeSession;
}

export interface ServiceRegistry {
  readonly mission: MissionService;
  readonly media: MediaService;
  readonly ai: AIService;
  readonly impact: ImpactService;
  readonly prototypeSession: PrototypeSessionService;
}
