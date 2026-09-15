import type {
  AcademicGoal,
  AcademicGoalInput,
  StudyPlan,
  StudyPlanInput,
  StudyReportedResult,
} from './study';
import type { MasroofiCategory, MasroofiControls, MasroofiPurchaseFixtureId } from './masroofi';

export type CloudRole = 'parent' | 'child';
export type CloudLocale = 'ar' | 'en';
export type CloudAgeBand = '6_8' | '9_11' | '12_14';
export type CloudCategoryId =
  | 'faith_gratitude'
  | 'roots_kinship'
  | 'home_responsibility'
  | 'green_impact'
  | 'food_hospitality'
  | 'heritage_etiquette'
  | 'kindness_community'
  | 'learning_wellbeing';
export type CloudLandscapeId = 'ghaf' | 'samar' | 'sidr' | 'date_palm' | 'mangrove';
export type CloudStage = 'seed' | 'shoot' | 'sapling' | 'shade' | 'flourishing';
export type CloudRecognitionMode = 'standard' | 'fade_first' | 'recognition_only';
export type CloudRoutinePhase = 'acquisition' | 'maintenance' | 'not_applicable';
export interface CloudActor {
  role: CloudRole;
  family_id: string;
  child_id: string | null;
  user_id: string;
}
export interface CloudRelative {
  id: string;
  display_name: string;
  relationship: 'grandmother' | 'grandfather' | 'aunt' | 'uncle';
  rhythm: 'weekly' | 'monthly' | 'every_three_months' | 'no_schedule';
}
export interface CloudFamily {
  id: string;
  name: string;
  locale: CloudLocale;
  revision: number;
  guardian_names: string[];
  relatives: CloudRelative[];
}
export interface CloudChildPreferences {
  sex: 'male' | 'female' | null;
  interests: string[];
  hobbies: string[];
  accessibility: string[];
  support: string[];
  personalization_enabled: boolean;
  custom_interest: string | null;
  custom_hobby: string | null;
  custom_support: string | null;
  custom_accessibility: string | null;
}
export interface CloudChild {
  id: string;
  family_id: string;
  nickname: string;
  age_band: CloudAgeBand | null;
  age10_plus_confirmed: boolean;
  preferred_language: CloudLocale | 'both';
  avatar_id: string;
  active: boolean;
  preferences: CloudChildPreferences;
}
export interface CloudCategory {
  id: CloudCategoryId;
  label_ar: string;
  label_en: string;
  landscape_id: CloudLandscapeId;
}
export interface CloudLandscape {
  id: CloudLandscapeId;
  label_ar: string;
  label_en: string;
}
export interface CloudTemplate {
  id: string;
  category_id: CloudCategoryId;
  landscape_id: CloudLandscapeId;
  title_ar: string;
  title_en: string;
  definition_ar: string;
  definition_en: string;
  steps_ar: string[];
  steps_en: string[];
  recognition_mode: CloudRecognitionMode;
  routine_phase: CloudRoutinePhase;
  seed_award: number | null;
  visibility_scope: 'child_guardian' | 'household';
  circle_eligible: boolean;
  reward_eligible: boolean;
  league_eligible: boolean;
  skill_ids: string[];
  permitted_help_ar: string;
  permitted_help_en: string;
  supervision_ar: string;
  supervision_en: string;
  safety_ar: CloudTaskSafety;
  safety_en: CloudTaskSafety;
  recurrence: 'once' | 'recurrent';
  age_bands: CloudAgeBand[];
  positive_action_ar: string;
  positive_action_en: string;
  why_it_matters_ar: string;
  why_it_matters_en: string;
}
export interface CloudTaskSafety {
  adult_pre_check: string;
  adult_second_check: string;
  adult_owned_actions: string[];
  child_allowed_actions: string[];
  excluded_hazards: string[];
  stop_and_ask_adult: string;
  route_constraint: string | null;
  indoor_alternative: string | null;
  aftercare: string | null;
}
export interface CloudTask {
  id: string;
  family_id: string;
  child_id: string;
  version: number;
  status: 'draft' | 'reviewed' | 'assigned';
  template_id: string | null;
  title: string;
  definition_of_done: string;
  steps: string[];
  content_locale: CloudLocale;
  category_id: CloudCategoryId;
  landscape_id: CloudLandscapeId;
  recognition_mode: CloudRecognitionMode;
  routine_phase: CloudRoutinePhase;
  seed_award: number | null;
  visibility_scope: 'child_guardian' | 'household';
  circle_eligible: boolean;
  reward_eligible: boolean;
  league_eligible: boolean;
  created_at: string;
  permitted_help: string;
  supervision: string;
  safety: CloudTaskSafety;
  recurrence: 'once' | 'recurrent';
  positive_action: string;
  why_it_matters: string;
}
export type CloudAssignmentState =
  'assigned' | 'chosen' | 'in_progress' | 'submitted' | 'retry' | 'confirmed' | 'recognized';
export interface CloudAssignment {
  id: string;
  family_id: string;
  child_id: string;
  task_id: string;
  task_version: number;
  state: CloudAssignmentState;
  help_requested: boolean;
  created_at: string;
}
export interface CloudSubmission {
  id: string;
  assignment_id: string;
  child_id: string;
  task_version: number;
  attempt: number;
  completion_mode: 'independent' | 'permitted_help';
  definition_acknowledged: true;
  submitted_at: string;
}
export interface CloudCheckIn {
  id: string;
  assignment_id: string;
  submission_id: string;
  decision: 'confirm' | 'kind_retry';
  praise: string | null;
  presentation: 'editing_praise' | 'praise_presented' | 'recognition_applied' | null;
  created_at: string;
  observation: string | null;
}
export interface CloudAdjustment {
  id: string;
  assignment_id: string;
  child_id: string;
  source_version: number;
  proposed_version: number | null;
  status: 'parent_review_required' | 'child_decision_required' | 'accepted' | 'kept_current';
}
export interface CloudRecognition {
  id: string;
  child_id: string;
  assignment_id: string;
  task_id: string;
  task_version: number;
  submission_id: string;
  check_in_id: string;
  seed_amount: number;
  landscape_id: CloudLandscapeId;
  created_at: string;
}
export interface CloudSeedEntry {
  id: string;
  child_id: string;
  recognition_id: string;
  amount: number;
  created_at: string;
}
export interface CloudLandscapeProgress {
  child_id: string;
  landscape_id: CloudLandscapeId;
  cumulative_seeds: number;
  stage: CloudStage;
  next_threshold: number | null;
}
export interface CloudLegacyRecord {
  id: string;
  child_id: string;
  kind: 'task' | 'study';
  title: string;
  subject: string | null;
  next_step: string | null;
  completed: boolean;
  source_id: string;
  converted_task_id: string | null;
}

export interface CloudReward {
  id: string;
  childId: string;
  label: string;
  kind: 'money' | 'gift' | 'experience' | 'privilege';
  amountFils: number | null;
  month: string;
  milestone: CloudRewardMilestone;
  status: 'promised' | 'unlocked' | 'given';
  version: number;
  eligibleSeeds: number;
  unlockedAt: string | null;
  givenAt: string | null;
  monthlyMaximumFils: number;
}
export interface CloudMasroofiCard {
  childId: string;
  balanceFils: number;
  controls: MasroofiControls;
  controlsVersion: number;
  ageEligible: boolean;
  origin: 'simulated';
}
export interface CloudMasroofiPromise {
  id: string;
  childId: string;
  assignmentId: string;
  taskVersion: number;
  status: 'promised' | 'credited';
  amountFils?: number;
}
export interface CloudMasroofiTransaction {
  id: string;
  childId: string;
  kind: 'reward' | 'top_up' | 'purchase';
  amountFils: number;
  status: 'credited' | 'approved' | 'declined';
  declineReason: string | null;
  fixtureId: MasroofiPurchaseFixtureId | null;
  day: string;
  balanceAfterFils: number;
  assignmentId: string | null;
}
export interface CloudLearningPackage {
  id: string;
  labelAr: string;
  labelEn: string;
  unlockThreshold: number;
  available: boolean;
  unlockedChildIds: string[];
  steps: { story: string[]; accessible: string[] };
  checkOptions: string[];
}
export interface CloudLeagueCircle {
  id: string;
  name: string;
  isOwner: boolean;
  rows: {
    nickname: string;
    avatarId: string;
    rank: number;
    score: number;
    confirmedLeaves: number;
  }[];
  canopyContributions: number;
  greenActions: number;
  canopyHistory: { week: string; contributions: number }[];
  memberships: {
    childId: string;
    nickname: string;
    avatarId: string;
    nominatedAssignmentIds: string[];
    eligibleAssignmentIds: string[];
    restWeek: boolean;
  }[];
}
export interface CloudExtras {
  rewards: CloudReward[];
  masroofi: {
    cards: CloudMasroofiCard[];
    promises: CloudMasroofiPromise[];
    transactions: CloudMasroofiTransaction[];
    purchaseCatalog: {
      id: MasroofiPurchaseFixtureId;
      category: MasroofiCategory;
      online: boolean;
      amountFils: number;
    }[];
  };
  studyPlans: StudyPlan[];
  goals: AcademicGoal[];
  learning: {
    packages: CloudLearningPackage[];
    progress: {
      childId: string;
      learningId: string;
      route: 'story' | 'accessible';
      completedStepIds: string[];
      checkSatisfied: boolean;
    }[];
    completions: { childId: string; learningId: string; completedAt: string }[];
    badges: {
      childId: string;
      id: string;
      labelAr: string;
      labelEn: string;
      criteria: unknown;
      earnedAt: string | null;
    }[];
  };
  league: { circles: CloudLeagueCircle[]; invitations: { id: string; circleName: string }[] };
}

export interface CloudSnapshot {
  schema_version: 1;
  revision: number;
  actor: CloudActor;
  family: CloudFamily;
  children: CloudChild[];
  categories: CloudCategory[];
  landscapes: CloudLandscape[];
  templates: CloudTemplate[];
  tasks: CloudTask[];
  assignments: CloudAssignment[];
  submissions: CloudSubmission[];
  check_ins: CloudCheckIn[];
  adjustments: CloudAdjustment[];
  recognitions: CloudRecognition[];
  seed_entries: CloudSeedEntry[];
  landscape_progress: CloudLandscapeProgress[];
  legacy_records: CloudLegacyRecord[];
  legacy_available: boolean;
  extras: CloudExtras;
  saved_templates: { id: string; title: string; task_id: string; task_version: number }[];
  reveals: {
    id: string;
    child_id: string;
    recognition_id: string;
    acknowledged_at: string | null;
  }[];
  impact_paths: {
    child_id: string;
    lifetime_seeds: number;
    reached_thresholds: number[];
    next_threshold: number | null;
    chapter_state: 'not_entered' | 'active' | 'completed';
  }[];
  permissions: {
    child_id: string;
    voice_granted: boolean;
    media_granted: boolean;
    ai_granted: boolean;
    revision: number;
  }[];
  community: { status: 'continued' | 'paused' | 'ended'; revision: number };
}
export interface CloudTaskInput {
  childId: string;
  templateId?: string;
  savedTemplateId?: string;
  locale: CloudLocale;
  title?: string;
  definitionOfDone?: string;
  steps?: readonly string[];
  categoryId?: CloudCategoryId;
  permittedHelp?: string;
  supervision?: string;
  safety?: CloudTaskSafety;
  recognitionMode?: CloudRecognitionMode;
  routinePhase?: CloudRoutinePhase;
  seedAward?: number | null;
  visibilityScope?: 'child_guardian' | 'household';
  recurrence?: 'once' | 'recurrent';
  circleEligible?: boolean;
  positiveAction?: string;
  whyItMatters?: string;
}
export interface CloudChildInput {
  nickname: string;
  ageBand: CloudAgeBand;
  age10PlusConfirmed: boolean;
  preferredLanguage: CloudLocale | 'both';
  avatarId: string;
  preferences?: CloudChildPreferences;
}
export type CloudRewardMilestone =
  | { kind: 'eligible_seed_delta'; requiredSeedDelta: number }
  | {
      kind: 'landscape_stage';
      landscapeId: CloudLandscapeId;
      targetStage: Exclude<CloudStage, 'seed'>;
    }
  | {
      kind: 'landscapes_at_stage';
      targetStage: Exclude<CloudStage, 'seed'>;
      requiredCount: number;
    };
export interface CloudRewardInput {
  childId: string;
  label: string;
  kind: 'money' | 'gift' | 'experience' | 'privilege';
  amountFils?: number;
  month: string;
  monthlyMaximumFils: number;
  milestone: CloudRewardMilestone;
}
export type CloudCommand =
  | {
      type: 'family.update';
      name: string;
      locale: CloudLocale;
      guardianNames?: string[];
      relatives?: CloudRelative[];
    }
  | ({ type: 'child.create' } & CloudChildInput)
  | ({ type: 'child.update'; childId: string } & CloudChildInput)
  | { type: 'child.invite'; childId: string }
  | { type: 'child.revoke'; childId: string }
  | {
      type: 'child.permissions';
      childId: string;
      voiceGranted: boolean;
      mediaGranted: boolean;
      aiGranted: boolean;
    }
  | {
      type: 'community.participation';
      action: 'continue' | 'pause_new_contributions' | 'end_participation';
    }
  | { type: 'workspace.import' }
  | ({ type: 'task.create' } & CloudTaskInput)
  | ({ type: 'task.update'; taskId: string; expectedVersion: number } & CloudTaskInput)
  | { type: 'task.review' | 'task.assign' | 'task.save_template'; taskId: string }
  | {
      type:
        'assignment.accept' | 'assignment.start' | 'assignment.help' | 'assignment.resume_retry';
      assignmentId: string;
    }
  | { type: 'assignment.help_resolved'; assignmentId: string }
  | {
      type: 'assignment.submit';
      assignmentId: string;
      completionMode: 'independent' | 'permitted_help';
      definitionAcknowledged: true;
    }
  | { type: 'checkin.confirm'; assignmentId: string; praise: string }
  | { type: 'checkin.retry'; assignmentId: string; observation: string }
  | { type: 'checkin.praise_presented' | 'recognition.apply'; checkInId: string }
  | { type: 'adjustment.request'; assignmentId: string }
  | { type: 'adjustment.propose'; adjustmentId: string; templateId: string }
  | { type: 'adjustment.accept' | 'adjustment.keep'; adjustmentId: string }
  | { type: 'routine.phase'; taskId: string; phase: 'acquisition' | 'maintenance' }
  | { type: 'reveal.acknowledge'; revealId: string }
  | { type: 'legacy.convert'; legacyId: string; templateId: string; locale: CloudLocale }
  | ({ type: 'reward.create' } & CloudRewardInput)
  | ({ type: 'reward.edit'; id: string; expectedVersion: number } & CloudRewardInput)
  | { type: 'reward.give'; id: string }
  | { type: 'masroofi.enable'; childId: string }
  | {
      type: 'masroofi.controls';
      childId: string;
      controls: MasroofiControls;
      expectedVersion: number;
    }
  | { type: 'masroofi.top_up'; childId: string; amountFils: number }
  | {
      type: 'masroofi.promise';
      assignmentId: string;
      amountFils: number;
      expectedTaskVersion: number;
    }
  | { type: 'masroofi.purchase'; fixtureId: MasroofiPurchaseFixtureId }
  | { type: 'study.create'; childId: string; input: StudyPlanInput }
  | {
      type:
        'study.accept' | 'study.start' | 'study.pause' | 'study.complete' | 'study.help_resolved';
      id: string;
    }
  | { type: 'study.help'; id: string; request: 'explain' | 'smaller_step' | 'together' }
  | { type: 'study.revisit'; id: string; date: string | null }
  | { type: 'goal.create'; childId: string; input: AcademicGoalInput }
  | { type: 'goal.edit'; id: string; input: AcademicGoalInput; expectedRevision: number }
  | { type: 'goal.approve' | 'goal.accept'; id: string; expectedRevision: number }
  | {
      type: 'goal.decline' | 'goal.request_change' | 'goal.pause' | 'goal.resume' | 'goal.give';
      id: string;
    }
  | { type: 'goal.submit'; id: string; result: StudyReportedResult }
  | { type: 'goal.confirm'; id: string; submissionId: string; acknowledgement: string }
  | {
      type: 'learning.start' | 'learning.complete';
      learningId: string;
      route: 'story' | 'accessible';
    }
  | { type: 'learning.step'; learningId: string; route: 'story' | 'accessible'; stepId: string }
  | { type: 'learning.check'; learningId: string; route: 'story' | 'accessible'; optionId: string }
  | { type: 'circle.create'; name: string }
  | { type: 'circle.invite'; circleId: string; invitedOwnerId: string }
  | { type: 'circle.accept'; invitationId: string }
  | { type: 'circle.revoke'; circleId: string; familyId: string }
  | {
      type: 'circle.join_child';
      circleId: string;
      childId: string;
      nickname: string;
      avatarId: string;
    }
  | { type: 'league.nominate'; circleId: string; childId: string; assignmentIds: string[] }
  | { type: 'league.rest'; circleId: string; childId: string };

export interface CloudCommandResult {
  snapshot: CloudSnapshot;
  result: Record<string, unknown>;
}
export type CloudFamilyErrorCode =
  | 'access_denied'
  | 'profile_incomplete'
  | 'invalid_command'
  | 'invalid_input'
  | 'invalid_transition'
  | 'not_found'
  | 'revision_conflict'
  | 'request_conflict'
  | 'invalid_invitation'
  | 'access_revoked'
  | 'reauthentication_required'
  | 'service_unavailable'
  | 'network_unavailable';
export class CloudFamilyError extends Error {
  constructor(readonly code: CloudFamilyErrorCode) {
    super(code);
    this.name = 'CloudFamilyError';
  }
}
export type { MasroofiCategory };
