export interface AccountWorkspaceMember {
  readonly id: string;
  readonly nickname: string;
}

export interface AccountWorkspaceTask {
  readonly id: string;
  readonly childId: string;
  readonly title: string;
  readonly completed: boolean;
}

export interface AccountWorkspaceStudyPlan {
  readonly id: string;
  readonly childId: string;
  readonly subject: string;
  readonly nextStep: string;
  readonly completed: boolean;
}

export interface AccountWorkspace {
  readonly userId: string;
  readonly workspaceId: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly familyName: string;
  readonly members: readonly AccountWorkspaceMember[];
  readonly tasks: readonly AccountWorkspaceTask[];
  readonly studyPlans: readonly AccountWorkspaceStudyPlan[];
}

export type WorkspaceCommand =
  | { readonly type: 'rename_family'; readonly name: string }
  | { readonly type: 'add_member'; readonly nickname: string }
  | { readonly type: 'rename_member'; readonly id: string; readonly nickname: string }
  | { readonly type: 'add_task'; readonly childId: string; readonly title: string }
  | { readonly type: 'edit_task'; readonly id: string; readonly title: string }
  | { readonly type: 'complete_task'; readonly id: string; readonly completed: boolean }
  | {
      readonly type: 'add_study_plan';
      readonly childId: string;
      readonly subject: string;
      readonly nextStep: string;
    }
  | {
      readonly type: 'edit_study_plan';
      readonly id: string;
      readonly subject: string;
      readonly nextStep: string;
    }
  | { readonly type: 'complete_study_plan'; readonly id: string; readonly completed: boolean };

export interface AccountWorkspaceUpdate {
  readonly expectedRevision: number;
  readonly command: WorkspaceCommand;
}
