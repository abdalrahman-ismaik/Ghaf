import { createMockServiceRegistry } from './mock';
import { GatewayAIService } from './remote/GatewayAIService';

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
export { GatewayAIService } from './remote/GatewayAIService';
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

const gatewayUrl = process.env.EXPO_PUBLIC_GHAF_AI_GATEWAY_URL?.trim();

/**
 * Live AI is opt-in. This exported primary service may be remote, while
 * `serviceRegistry.ai` always remains the deterministic offline fallback.
 */
export const configuredAIService = gatewayUrl
  ? new GatewayAIService({ endpoint: gatewayUrl })
  : serviceRegistry.ai;
