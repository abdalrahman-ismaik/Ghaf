import { createFeature003ServiceRegistry } from './mock';
import type { Feature003ServiceRegistry } from './interfaces';
import { createLocalFamilyRepository, deviceLocalStorage } from './local';

export type {
  BoundedParentGuideProvider,
  CapabilityTokenRequest,
  CapabilityTokenService,
  ChildCoachService,
  CoachAdaptationService,
  FamilyLeagueService,
  FamilyRewardService,
  FamilyProjectionService,
  Feature003ServiceRegistry,
  Feature004ServiceRegistry,
  GardenService,
  MediaService,
  LiveChildCoachTextService,
  ParentGuideService,
  ParentTaskDraftingService,
  ParentSummaryPolicy,
  PreparedChildCoachProvider,
  PreparedParentGuideProvider,
  PreparedLiveChildCoachTextProvider,
  PreparedParentTaskDraftingProvider,
  PreparedVoiceTranscriptionProvider,
  PrototypeSessionService,
  RecognitionService,
  ServiceMeta,
  ServiceResult,
  SessionAuthorityInput,
  SyntheticVoiceService,
  SyntheticAccessService,
  TaskService,
  VoiceTranscriptionInput,
  VoiceTranscriptionService,
} from './interfaces';
export { GatewayParentGuideService, type GatewayParentGuideServiceOptions } from './remote';
export {
  createFeature003ServiceRegistry,
  BlockedCapabilityTokenService,
  createPreparedBoundedAiServices,
  DeterministicChildCoachProvider,
  DeterministicCoachAdaptationService,
  DeterministicFamilyRewardService,
  DeterministicFamilyLeagueService,
  DeterministicFamilyProjectionService,
  DeterministicGardenService,
  DeterministicMediaService,
  DeterministicLiveChildCoachTextProvider,
  DeterministicParentGuideProvider,
  DeterministicParentTaskDraftingProvider,
  DeterministicParentSummaryPolicy,
  DeterministicPrototypeSessionService,
  DeterministicRecognitionService,
  DeterministicTaskService,
  DeterministicSyntheticVoiceService,
  DeterministicSyntheticAccessService,
  DeterministicVoiceTranscriptionProvider,
} from './mock';
export {
  createPreparedChildCoachResponse,
  createPreparedParentTaskDraftSuggestion,
  createPreparedVoiceTranscription,
} from './mock/boundedAiFixtures';
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
