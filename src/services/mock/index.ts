import type {
  AIService,
  ImpactService,
  MediaService,
  MissionService,
  PrototypeSessionService,
  ServiceRegistry,
  ServiceResult,
} from '../interfaces';
import type {
  GhafProgress,
  ImpactSummary,
  MissionSummary,
  PreparedMedia,
  PrototypeSession,
} from '../../models/prototype';
import {
  createInitialPrototypeSession,
  createPreparedAudio,
  createPreparedImage,
  createSeededGhafProgress,
  createSeededImpact,
  createSeededMission,
} from './fixtures';

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export class MockMissionService implements MissionService {
  async getActiveMission(): Promise<ServiceResult<MissionSummary>> {
    return success(createSeededMission());
  }
}

export class MockMediaService implements MediaService {
  async getPreparedImage(): Promise<ServiceResult<PreparedMedia>> {
    return success(createPreparedImage());
  }

  async getPreparedAudio(): Promise<ServiceResult<PreparedMedia>> {
    return success(createPreparedAudio());
  }
}

export class MockAIService implements AIService {
  async getPregeneratedMission(): Promise<ServiceResult<MissionSummary>> {
    return success(createSeededMission());
  }
}

export class MockImpactService implements ImpactService {
  async getSummary(): Promise<ServiceResult<ImpactSummary>> {
    return success(createSeededImpact());
  }

  async getGhafProgress(): Promise<ServiceResult<GhafProgress>> {
    return success(createSeededGhafProgress());
  }
}

export class MockPrototypeSessionService implements PrototypeSessionService {
  getInitialSession(): PrototypeSession {
    return createInitialPrototypeSession();
  }

  reset(): PrototypeSession {
    return createInitialPrototypeSession();
  }
}

export function createMockServiceRegistry(): ServiceRegistry {
  return {
    mission: new MockMissionService(),
    media: new MockMediaService(),
    ai: new MockAIService(),
    impact: new MockImpactService(),
    prototypeSession: new MockPrototypeSessionService(),
  };
}
