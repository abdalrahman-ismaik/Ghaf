import { createMockServiceRegistry } from './mock';

export type {
  AIService,
  ImpactService,
  MediaService,
  MissionService,
  PrototypeSessionService,
  ServiceError,
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

/** Feature 001 binds every replaceable boundary to a deterministic offline service. */
export const serviceRegistry = createMockServiceRegistry();
