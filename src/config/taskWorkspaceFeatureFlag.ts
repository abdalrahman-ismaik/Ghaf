export function resolveTaskWorkspaceFeatureFlag(value: unknown): boolean {
  return value === true || value === 'true';
}

export const taskWorkspaceFeatureFlag = resolveTaskWorkspaceFeatureFlag(
  process.env.EXPO_PUBLIC_TASK_WORKSPACE_CANDIDATE,
);
