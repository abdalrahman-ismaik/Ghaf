import type { SyntheticChildId } from './familyGrowth';

export const DEVICE_ACCESS_SCHEMA_VERSION = 1 as const;
export const DEVICE_ACCESS_STORAGE_KEY = 'ghaf.device-access.v1' as const;

export interface ParentDeviceAffinity {
  readonly role: 'parent';
  readonly parentId: 'parent_al_noor';
  readonly householdId: 'household_al_noor';
}

export interface ChildDeviceAffinity {
  readonly role: 'child';
  readonly childId: SyntheticChildId;
  readonly householdId: 'household_al_noor';
}

export interface DeviceAffinityRecord {
  readonly schemaVersion: typeof DEVICE_ACCESS_SCHEMA_VERSION;
  readonly principal: ParentDeviceAffinity | ChildDeviceAffinity;
  readonly familyCreatedAt: string;
  readonly updatedAt: string;
  readonly origin: 'local_demo';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

export interface DeviceAccessView {
  readonly status: 'ready' | 'unavailable';
  readonly record: DeviceAffinityRecord | null;
  readonly primaryRole: 'none' | 'parent' | 'child';
  readonly primaryChildId: SyntheticChildId | null;
  readonly storageTruth: 'device_local_demo_only';
  readonly productionAuthentication: false;
}

export interface TemporaryParentAccess {
  readonly returnChildId: SyntheticChildId;
  readonly startedAt: string;
}
