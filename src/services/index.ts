import { createMockServiceRegistry } from './mock';

export type {
  AIService,
  ApproveCompletionRequest,
  CompletionAward,
  ImpactService,
  MediaService,
  MissionGenerationRequest,
  MissionService,
  PrototypeSessionService,
  ResetResult,
  ServiceError,
  ServiceMeta,
  ServiceRegistry,
  ServiceResult,
} from './interfaces';
export {
  createMockServiceRegistry,
  MockAIService,
  MockImpactService,
  MockMediaService,
  MockMissionService,
  MockPrototypeSessionService,
} from './mock';

/** The competition build binds every replaceable boundary to deterministic local services. */
export const serviceRegistry = createMockServiceRegistry();
