import type {
  AgeBand,
  LandscapeId,
  LandscapeProgress,
  LocalizedText,
  TaskCategoryId,
  TaskTemplate,
} from './familyGrowth';

export interface CloudFamilyActor {
  readonly userId: string;
  readonly role: 'parent' | 'child';
  readonly familyId: string | null;
  readonly childId: string | null;
}

export interface CloudFamily {
  readonly id: string;
  readonly name: string;
  readonly revision: number;
}

export interface CloudFamilyMember {
  readonly id: string;
  readonly userId: string;
  readonly role: 'parent' | 'child';
  readonly childId: string | null;
  readonly active: boolean;
}

export interface CloudFamilyChild {
  readonly id: string;
  readonly familyId: string;
  readonly displayName: string;
  readonly ageBand: AgeBand;
  readonly active: boolean;
}

export type CloudTaskStatus =
  'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'praised' | 'recognized';

export interface CloudFamilyTask {
  readonly id: string;
  readonly familyId: string;
  readonly childId: string;
  readonly catalogId: string;
  readonly status: CloudTaskStatus;
  readonly revision: number;
  readonly stepStates: Readonly<Record<string, 'done' | 'skipped'>>;
  readonly helpRequested: boolean;
  readonly praise: string | null;
  readonly createdAt: string;
  readonly submittedAt: string | null;
  readonly recognizedAt: string | null;
  readonly template: TaskTemplate;
}

export interface CloudFamilyRecognition {
  readonly id: string;
  readonly taskId: string;
  readonly childId: string;
  readonly seeds: number;
  readonly landscapeId: LandscapeId;
  readonly canopyContribution: number;
  readonly createdAt: string;
}

export interface CloudFamilyMemory {
  readonly id: string;
  readonly taskId: string;
  readonly childId: string;
  readonly title: LocalizedText;
  readonly createdAt: string;
}

export interface CloudFamilySnapshot {
  readonly schemaVersion: 1;
  readonly actor: CloudFamilyActor;
  readonly families: readonly CloudFamily[];
  readonly family: CloudFamily | null;
  readonly familyCanopyContributions: number;
  readonly members: readonly CloudFamilyMember[];
  readonly children: readonly CloudFamilyChild[];
  readonly tasks: readonly CloudFamilyTask[];
  readonly recognitions: readonly CloudFamilyRecognition[];
  readonly memories: readonly CloudFamilyMemory[];
  readonly deletedMemoryTaskIds: readonly string[];
  readonly catalog: readonly TaskTemplate[];
  readonly customTemplates: readonly {
    readonly id: string;
    readonly familyId: string;
    readonly revision: number;
    readonly template: TaskTemplate;
    readonly createdAt: string;
    readonly active: boolean;
  }[];
}

export interface CloudTaskCopy {
  readonly title?: LocalizedText;
  readonly positiveAction?: LocalizedText;
}

export type CloudFamilyCommand =
  | { readonly type: 'create_family'; readonly name: string; readonly displayName?: string }
  | { readonly type: 'rename_family'; readonly name: string }
  | { readonly type: 'invite_parent' }
  | { readonly type: 'add_child'; readonly displayName: string; readonly ageBand: AgeBand }
  | { readonly type: 'rename_child'; readonly childId: string; readonly displayName: string }
  | { readonly type: 'invite_child' | 'revoke_child'; readonly childId: string }
  | {
      readonly type: 'assign_task';
      readonly childId: string;
      readonly catalogId: string;
      readonly content?: CloudTaskCopy;
    }
  | {
      readonly type: 'create_custom_template';
      readonly title: LocalizedText;
      readonly positiveAction: LocalizedText;
      readonly categoryId: TaskCategoryId;
      readonly recurrence: 'once' | 'recurrent';
      readonly reviewed: true;
    }
  | { readonly type: 'assign_custom_task'; readonly childId: string; readonly templateId: string }
  | {
      readonly type: 'remove_custom_template';
      readonly templateId: string;
      readonly expectedRevision: number;
    }
  | {
      readonly type: 'begin_maintenance';
      readonly taskId: string;
      readonly expectedRevision: number;
    }
  | {
      readonly type: 'edit_task';
      readonly taskId: string;
      readonly expectedRevision: number;
      readonly content: CloudTaskCopy;
    }
  | {
      readonly type:
        | 'accept_task'
        | 'start_task'
        | 'request_help'
        | 'submit_task'
        | 'recognize_task'
        | 'save_memory'
        | 'delete_memory';
      readonly taskId: string;
      readonly expectedRevision: number;
    }
  | {
      readonly type: 'praise_task';
      readonly taskId: string;
      readonly expectedRevision: number;
      readonly praise: string;
    }
  | {
      readonly type: 'set_step';
      readonly taskId: string;
      readonly expectedRevision: number;
      readonly stepId: string;
      readonly state: 'done' | 'skipped';
    };

export type CloudFamilyInvite =
  | { readonly token: string; readonly expiresAt: string; readonly childId: string | null }
  | {
      readonly tokenUnavailable: true;
      readonly expiresAt: string;
      readonly childId: string | null;
    };

export interface CloudFamilyCommandResponse {
  readonly snapshot: CloudFamilySnapshot;
  readonly result: Readonly<Record<string, unknown>> | null;
}

export type CloudFamilyErrorCode =
  | 'access_unavailable'
  | 'family_unavailable'
  | 'invalid_command'
  | 'invalid_transition'
  | 'request_conflict'
  | 'invalid_invite'
  | 'rate_limited'
  | 'network_unavailable'
  | 'provider_unavailable'
  | 'invalid_response'
  | 'session_expired'
  | 'storage_unavailable'
  | 'reauth_required';

export class CloudFamilyError extends Error {
  constructor(readonly code: CloudFamilyErrorCode) {
    super(code);
    this.name = 'CloudFamilyError';
  }
}

export interface CloudFamilyState {
  readonly status: 'loading' | 'ready' | 'empty' | 'error';
  readonly snapshot: CloudFamilySnapshot | null;
  readonly busy: boolean;
  readonly error: CloudFamilyErrorCode | null;
  readonly conflict: boolean;
  readonly pendingRequestId: string | null;
  readonly pendingCommand: CloudFamilyCommand['type'] | 'redeem_invite' | null;
  readonly lastInvite: CloudFamilyInvite | null;
  readonly subscriptionError: boolean;
}

export interface CloudChildProgress {
  readonly childId: string;
  readonly seeds: number;
  readonly landscapes: Readonly<Record<LandscapeId, LandscapeProgress>>;
  readonly recognizedTasks: number;
}

export interface CloudFamilyProgress {
  readonly children: Readonly<Record<string, CloudChildProgress>>;
  readonly canopyContributions: number;
  readonly scope: 'family' | 'own_child';
}

export type CloudFamilyRpcName =
  | 'ghaf_family_snapshot'
  | 'ghaf_family_command'
  | 'ghaf_redeem_family_invite'
  | 'ghaf_family_identity';

export interface CloudFamilyTransport {
  familyRequest(
    name: CloudFamilyRpcName,
    args: Readonly<Record<string, unknown>>,
  ): Promise<unknown>;
  subscribeFamily(familyId: string, onChange: () => void): Promise<() => void>;
}
