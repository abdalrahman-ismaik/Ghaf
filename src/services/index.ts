import { createFeature003ServiceRegistry } from './mock';
import type { Feature003ServiceRegistry } from './interfaces';

export type {
  ChildCoachService,
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
  TaskService,
} from './interfaces';
export {
  createFeature003ServiceRegistry,
  DeterministicChildCoachProvider,
  DeterministicFamilyProjectionService,
  DeterministicGardenService,
  DeterministicMediaService,
  DeterministicParentGuideProvider,
  DeterministicParentSummaryPolicy,
  DeterministicPrototypeSessionService,
  DeterministicRecognitionService,
  DeterministicTaskService,
} from './mock';
export { PARENT_GUIDE_FIXTURE, PARENT_SUMMARY_FIXTURE, PREPARED_PRAISE } from './mock/fixtures';

/** The active competition registry contains deterministic Feature 003 services only. */
export const serviceRegistry: Feature003ServiceRegistry = createFeature003ServiceRegistry();
