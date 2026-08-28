import type { SyntheticChildId } from '@/models/familyGrowth';

interface ParentNextAction {
  readonly childId: SyntheticChildId;
  readonly nameKey: 'common.salem' | 'common.alya';
  readonly nextKey: 'parentHome.salemNext' | 'parentHome.alyaNext';
  readonly supportKey: 'parentHome.salemSupport' | 'parentHome.alyaSupport';
}

export const PARENT_NEXT_ACTIONS = [
  {
    childId: 'child_salem',
    nameKey: 'common.salem',
    nextKey: 'parentHome.salemNext',
    supportKey: 'parentHome.salemSupport',
  },
  {
    childId: 'child_alya',
    nameKey: 'common.alya',
    nextKey: 'parentHome.alyaNext',
    supportKey: 'parentHome.alyaSupport',
  },
] as const satisfies readonly [ParentNextAction, ParentNextAction];
