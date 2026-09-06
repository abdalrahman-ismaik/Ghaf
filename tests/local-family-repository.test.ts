import { describe, expect, it } from 'vitest';

import {
  createLocalFamilyRecord,
  parseLocalFamilyRecord,
} from '../src/features/local-family/schema';
import {
  createLocalFamilyRepository,
  createMemoryLocalKeyValueStorage,
  LOCAL_FAMILY_STORAGE_KEY,
} from '../src/services/local';

const child = {
  id: 'child_salem' as const,
  role: 'child' as const,
  nickname: 'Salem',
  avatarId: 'ghaf_tree' as const,
  ageBand: '9_11' as const,
  preferredLanguage: 'both' as const,
  gender: 'prefer_not_to_say' as const,
  interests: ['sustainability', 'nature'] as const,
  hobbies: ['gardening'] as const,
  accessibilityDefaults: ['simpler_instructions'] as const,
  supportPreferences: ['short_steps', 'adult_alongside'] as const,
  personalizationEnabled: true,
};

function validRecord() {
  const result = createLocalFamilyRecord({
    familyName: 'Palm Family',
    appLanguage: 'en',
    children: [child],
    pairedChildIds: [],
    now: '2026-09-06T14:00:00.000Z',
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

describe('device-local family schema', () => {
  it('round-trips the minimum versioned directory without credentials or domain ledgers', () => {
    const record = validRecord();
    const parsed = parseLocalFamilyRecord(JSON.stringify(record));

    expect(parsed).toEqual({ ok: true, data: record });
    expect(record).toMatchObject({
      schemaVersion: 1,
      householdId: 'household_al_noor',
      parent: { id: 'parent_al_noor', role: 'parent' },
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(JSON.stringify(record)).not.toMatch(
      /verification|password|pin|pictureSequence|taskHistory|reward|seed|transcript|media/iu,
    );
  });

  it.each([
    'not-json',
    JSON.stringify({ schemaVersion: 2 }),
    JSON.stringify({ ...validRecord(), children: [] }),
    JSON.stringify({ ...validRecord(), children: [child, child] }),
    JSON.stringify({ ...validRecord(), pairedChildIds: ['child_alya'] }),
    JSON.stringify({ ...validRecord(), updatedAt: 'not-a-time' }),
    JSON.stringify({ ...validRecord(), secret: 'hidden' }),
  ])('fails closed for corrupt, unknown, partial, duplicated, or expanded input', (raw) => {
    expect(parseLocalFamilyRecord(raw)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });
});

describe('device-local family repository', () => {
  it('saves, reads, updates pairing idempotently, and clears one namespaced value', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const record = validRecord();

    expect(repository.read()).toEqual({ ok: true, data: null });
    expect(repository.save(record)).toEqual({ ok: true, data: record });
    expect(repository.read()).toEqual({ ok: true, data: record });

    const paired = repository.setPairedChild('child_salem', true, '2026-09-06T14:05:00.000Z');
    expect(paired).toMatchObject({
      ok: true,
      data: { pairedChildIds: ['child_salem'], updatedAt: '2026-09-06T14:05:00.000Z' },
    });
    expect(repository.setPairedChild('child_salem', true, '2026-09-06T14:06:00.000Z')).toEqual(
      paired,
    );
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();

    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
  });

  it('does not overwrite the prior complete record when validation or storage fails', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const record = validRecord();
    expect(repository.save(record).ok).toBe(true);

    expect(repository.save({ ...record, children: [] } as never)).toMatchObject({ ok: false });
    expect(repository.read()).toEqual({ ok: true, data: record });

    storage.failNextWrite();
    expect(repository.setPairedChild('child_salem', true, record.updatedAt)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toEqual({ ok: true, data: record });
  });
});
