import type { FamilyConnectionDirectory } from './familyConnections';
import type { AcademicGoal, StudyCommand, StudyPlan } from './study';
import type { LocalChildProfile } from './localFamily';
import type { LocalizedText, Recurrence, TaskCategoryId } from './familyGrowth';
import type { CloudFamilyActor } from './cloudFamily';

export type CloudProfilePreferences = Pick<
  LocalChildProfile,
  | 'avatarId'
  | 'preferredLanguage'
  | 'sex'
  | 'interests'
  | 'hobbies'
  | 'accessibilityDefaults'
  | 'supportPreferences'
  | 'customInterest'
  | 'customHobby'
  | 'customSupportPreference'
  | 'customAccessibility'
  | 'personalizationEnabled'
>;
export interface CloudSavedTemplate {
  categoryId: TaskCategoryId;
  title: LocalizedText;
  positiveAction: LocalizedText;
  recurrence: Recurrence;
}
export interface CloudLearningEvidence {
  packageId: 'learning.mangrove_roots.v1';
  routes: {
    story: { steps: string[]; checkSatisfied: boolean };
    accessible: { steps: string[]; checkSatisfied: boolean };
  };
  completedAt: string | null;
  completedRoute: 'story' | 'accessible' | null;
}
export interface CloudDocumentPayloads {
  study_plan: StudyPlan;
  academic_goal: AcademicGoal;
  connections: FamilyConnectionDirectory;
  profile_preferences: CloudProfilePreferences;
  saved_template: CloudSavedTemplate;
  learning: CloudLearningEvidence;
}
export type CloudDocumentKind = keyof CloudDocumentPayloads;
export type CloudFamilyDocument = {
  [K in CloudDocumentKind]: {
    id: string;
    familyId: string;
    childId: string | null;
    kind: K;
    revision: number;
    payload: CloudDocumentPayloads[K];
    createdAt: string;
    updatedAt: string;
  };
}[CloudDocumentKind];
export interface CloudDocumentSnapshot {
  readonly schemaVersion: 1;
  readonly actor: CloudFamilyActor;
  readonly familyId: string;
  readonly revision: number;
  readonly documentCount: number;
  readonly documents: readonly CloudFamilyDocument[];
}
export type CloudDocumentCommand =
  | { type: 'study'; expectedRevision: number; command: StudyCommand }
  | { type: 'connections.save'; expectedRevision: number; input: FamilyConnectionDirectory }
  | {
      type: 'preferences.save';
      childId: string;
      expectedRevision: number;
      input: CloudProfilePreferences;
    }
  | {
      type: 'template.save';
      id: string | null;
      expectedRevision: number;
      input: CloudSavedTemplate;
    }
  | { type: 'template.delete'; id: string; expectedRevision: number }
  | { type: 'learning.start' | 'learning.complete'; route: 'story' | 'accessible' }
  | { type: 'learning.step'; route: 'story' | 'accessible'; stepId: string }
  | {
      type: 'learning.check';
      route: 'story' | 'accessible';
      optionId: 'habitat_support_and_care' | 'visit_or_task_reward';
    };
export type CloudDocumentError =
  | 'access_unavailable'
  | 'family_unavailable'
  | 'invalid_command'
  | 'invalid_transition'
  | 'request_conflict'
  | 'limit_reached'
  | 'provider_unavailable'
  | 'invalid_response';
export interface CloudDocumentServicePort {
  familyRequest(name: string, args: Record<string, unknown>): Promise<unknown>;
  subscribeFamily?(familyId: string, onChange: () => void): Promise<() => void>;
}
