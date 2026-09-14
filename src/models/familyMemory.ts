import type { LocalizedText, SyntheticChildId } from './familyGrowth';

export const FAMILY_MEMORY_STORAGE_KEY = 'ghaf.family-memories.v1';

export interface FamilyMemory {
  readonly id: string;
  readonly familyKey: string;
  readonly sourceEventId: string;
  readonly occurrenceId: string;
  readonly childId: SyntheticChildId;
  readonly title: LocalizedText;
  readonly confirmedAt: string;
  readonly savedAt: string;
  readonly origin: 'local_synthetic_activity';
}

export interface FamilyMemoryCollection {
  readonly schemaVersion: 1;
  readonly familyKey: string;
  readonly memories: readonly FamilyMemory[];
  readonly deletedSourceIds: readonly string[];
}

export type FamilyMemoryActor =
  { readonly role: 'parent' } | { readonly role: 'child'; readonly childId: SyntheticChildId };

export type FamilyMemoryError =
  | 'forbidden'
  | 'ineligible'
  | 'deleted'
  | 'not_found'
  | 'invalid_data'
  | 'family_mismatch'
  | 'storage_read'
  | 'storage_write'
  | 'storage_clear';

export type FamilyMemoryResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: { readonly code: FamilyMemoryError } };
