import type { ChildAccessView } from '../features/access/childAccess';
import type { SyntheticChildId } from './familyGrowth';
import type { LocalFamilyRecord } from './localFamily';
import type { ParentOnboardingView } from './parentOnboarding';

export type EntryMode = 'ordinary' | 'demo';
export type DemoPrincipal = 'parent_al_noor' | 'child_salem' | 'child_alya';

export interface DemoEntryContext {
  readonly mode: EntryMode;
  readonly runGeneration: number;
  readonly entryEpoch: number;
  readonly activeExperience: 'signed_out' | 'parent' | 'child';
  readonly activeChildId: SyntheticChildId;
  readonly temporaryParentAccess: boolean;
}

export interface DemoEntryRequest {
  readonly principal: DemoPrincipal;
  readonly expectedGeneration: number;
  readonly expectedEpoch: number;
}

export interface DemoEntryHandoff {
  readonly principal: DemoPrincipal;
  readonly destination: '/parent' | '/child';
  readonly activeChildId: SyntheticChildId;
  readonly family: LocalFamilyRecord;
  readonly parentOnboarding: ParentOnboardingView;
  readonly childAccess: ChildAccessView;
  readonly runGeneration: number;
  readonly entryEpoch: number;
}
