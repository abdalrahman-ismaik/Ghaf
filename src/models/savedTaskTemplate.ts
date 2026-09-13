import type { LocalizedText, Recurrence, TaskCategoryId } from './familyGrowth';

export const SAVED_TASK_TEMPLATE_STORAGE_KEY = 'ghaf:saved-task-templates:v1';
export const SAVED_TASK_TEMPLATE_LIMIT = 20;

export interface SavedParentTaskTemplate {
  readonly id: string;
  readonly householdId: 'household_al_noor';
  readonly categoryId: TaskCategoryId;
  readonly title: LocalizedText;
  readonly positiveAction: LocalizedText;
  readonly recurrence: Recurrence;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly origin: 'parent_saved_local';
}

export type SavedParentTaskTemplateInput = Pick<
  SavedParentTaskTemplate,
  'householdId' | 'categoryId' | 'title' | 'positiveAction' | 'recurrence'
>;
