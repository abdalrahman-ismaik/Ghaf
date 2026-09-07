import { createFeature003ServiceRegistry } from './mock';
import type { Feature003ServiceRegistry } from './interfaces';
import { createLocalFamilyRepository, deviceLocalStorage } from './local';

export type {
  BoundedParentGuideProvider,
  ChildCoachService,
  CoachAdaptationService,
  FamilyLeagueService,
  FamilyRewardService,
  FamilyProjectionService,
  Feature003ServiceRegistry,
  GardenService,
  MediaService,
  ParentGuideService,
  ParentSummaryPolicy,
  PreparedChildCoachProvider,
  PreparedParentGuideProvider,
  PrototypeSessionService,
  RecognitionService,
  ServiceMeta,
  ServiceResult,
  SessionAuthorityInput,
  SyntheticVoiceService,
  SyntheticAccessService,
  TaskService,
} from './interfaces';
export { GatewayParentGuideService, type GatewayParentGuideServiceOptions } from './remote';
export {
  createFeature003ServiceRegistry,
  DeterministicChildCoachProvider,
  DeterministicCoachAdaptationService,
  DeterministicFamilyRewardService,
  DeterministicFamilyLeagueService,
  DeterministicFamilyProjectionService,
  DeterministicGardenService,
  DeterministicMediaService,
  DeterministicParentGuideProvider,
  DeterministicParentSummaryPolicy,
  DeterministicPrototypeSessionService,
  DeterministicRecognitionService,
  DeterministicTaskService,
  DeterministicSyntheticVoiceService,
  DeterministicSyntheticAccessService,
} from './mock';
export { PARENT_GUIDE_FIXTURE, PARENT_SUMMARY_FIXTURE, PREPARED_PRAISE } from './mock/fixtures';
export {
  createLocalFamilyRepository,
  createMemoryLocalKeyValueStorage,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  type LocalFamilyRepository,
  type LocalKeyValueStorage,
} from './local';

// Competition defaults to deterministic services; live Parent Guide activation requires trusted injection.
export const serviceRegistry: Feature003ServiceRegistry & {
  readonly localFamily: ReturnType<typeof createLocalFamilyRepository>;
} = {
  ...createFeature003ServiceRegistry(),
  localFamily: createLocalFamilyRepository(deviceLocalStorage),
};
