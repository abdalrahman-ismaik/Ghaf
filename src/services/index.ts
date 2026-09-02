import { createFeature003ServiceRegistry } from './mock';
import type { Feature003ServiceRegistry } from './interfaces';

export type {
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
  SyntheticVoiceService,
  SyntheticAccessService,
  TaskService,
} from './interfaces';
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

// Competition uses only deterministic Feature 003 services from this registry.
export const serviceRegistry: Feature003ServiceRegistry = createFeature003ServiceRegistry();
