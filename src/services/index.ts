import { entryMode } from '../config/demoEntry';
import { createFamilyMessaging } from '../features/familyMessaging';
import {
  createFeature003ServiceRegistry,
  DeterministicFamilyLeagueService,
  DeterministicFamilyRewardService,
  DeterministicSyntheticVoiceService,
} from './mock';
import { getPilotConfig } from '../features/pilot/config';
import { createSupabaseParentAccountService } from './accounts';
import type { ParentAccountService } from '../models/parentAccount';
import type { Feature003ServiceRegistry } from './interfaces';
import {
  createAmbientAudioPreferencesRepository,
  createMemoryLocalKeyValueStorage,
  createDeviceAccessRepository,
  createLocalFamilyRepository,
  createSavedTaskTemplateRepository,
  deviceLocalStorage,
} from './local';

export type {
  BoundedParentGuideProvider,
  CapabilityTokenRequest,
  CapabilityTokenService,
  CapturedVoiceFile,
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
  LiveChildAiGrantService,
  EphemeralMediaFile,
  EphemeralMediaService,
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
  VoiceCaptureService,
} from './interfaces';
export {
  GatewayParentGuideService,
  GatewayChildCoachService,
  GatewayParentTaskDraftingService,
  GatewayVoiceTranscriptionService,
  type GatewayChildCoachServiceOptions,
  type GatewayParentGuideServiceOptions,
  type GatewayParentTaskDraftingServiceOptions,
  type GatewayVoiceTranscriptionServiceOptions,
} from './remote';
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
  DeterministicLiveChildAiGrantService,
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
  createAmbientAudioPreferencesRepository,
  createLocalFamilyRepository,
  createDeviceAccessRepository,
  createMemoryLocalKeyValueStorage,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  type LocalFamilyRepository,
  type SavedTaskTemplateRepository,
  type LocalKeyValueStorage,
} from './local';

// Competition defaults to deterministic services; live Parent Guide activation requires trusted injection.
export const pilotSampleEnabled = getPilotConfig().enabled;
const repositoryStorage =
  pilotSampleEnabled || entryMode === 'demo'
    ? createMemoryLocalKeyValueStorage()
    : deviceLocalStorage;

export const serviceRegistry: Feature003ServiceRegistry & {
  readonly createParentAccountService: () => ParentAccountService | null;
  readonly familyMessaging: ReturnType<typeof createFamilyMessaging>;
  readonly ambientAudioPreferences: ReturnType<typeof createAmbientAudioPreferencesRepository>;
  readonly deviceAccess: ReturnType<typeof createDeviceAccessRepository>;
  readonly localFamily: ReturnType<typeof createLocalFamilyRepository>;
  readonly savedTaskTemplates: ReturnType<typeof createSavedTaskTemplateRepository>;
} = {
  ...createFeature003ServiceRegistry(),
  createParentAccountService() {
    const config = getPilotConfig();
    if (!config.enabled || !config.valid || !config.supabaseUrl || !config.supabasePublishableKey) {
      return null;
    }
    return createSupabaseParentAccountService({
      url: config.supabaseUrl,
      publishableKey: config.supabasePublishableKey,
    });
  },
  familyMessaging: createFamilyMessaging(),
  ambientAudioPreferences: createAmbientAudioPreferencesRepository(repositoryStorage),
  deviceAccess: createDeviceAccessRepository(repositoryStorage),
  localFamily: createLocalFamilyRepository(repositoryStorage),
  savedTaskTemplates: createSavedTaskTemplateRepository(repositoryStorage),
};

// Each mounted gate owns a fresh lazy service and disposes it on final unmount.
export function getParentAccountService(): ParentAccountService | null {
  return serviceRegistry.createParentAccountService();
}

export function clearPilotSampleServiceHistory(): void {
  if (!pilotSampleEnabled) return;
  Object.assign(serviceRegistry, {
    familyLeague: new DeterministicFamilyLeagueService(serviceRegistry.access),
    familyReward: new DeterministicFamilyRewardService(serviceRegistry.access),
    syntheticVoice: new DeterministicSyntheticVoiceService(serviceRegistry.access),
  });
}
