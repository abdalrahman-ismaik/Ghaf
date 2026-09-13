import { describe, expect, it } from 'vitest';

import {
  createLocalFamilyRecord,
  parseLocalFamilyRecord,
} from '../src/features/local-family/schema';
import {
  createLocalFamilyRepository,
  createMemoryLocalKeyValueStorage,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
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
    parentIdentifier: {
      normalizedIdentifier: 'parent@example.com',
      identifierKind: 'email',
      maskedDestination: 'p***@example.com',
    },
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
  it('round-trips the schema-2 directory with one normalized Parent lookup identifier', () => {
    const record = validRecord();
    const parsed = parseLocalFamilyRecord(JSON.stringify(record));

    expect(parsed).toEqual({ ok: true, data: record });
    expect(record).toMatchObject({
      schemaVersion: 2,
      householdId: 'household_al_noor',
      parent: {
        id: 'parent_al_noor',
        role: 'parent',
        normalizedIdentifier: 'parent@example.com',
        identifierKind: 'email',
      },
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(JSON.stringify(record)).not.toMatch(
      /424242|verification|password|pin|pictureSequence|taskHistory|reward|seed|transcript|media/iu,
    );
  });

  it.each([
    'not-json',
    JSON.stringify({ schemaVersion: 3 }),
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
  it('migrates the previous schema-1 fixture to the canonical prepared Parent email', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const current = validRecord();
    const legacy = {
      ...current,
      schemaVersion: 1,
      parent: { id: current.parent.id, role: current.parent.role },
    };
    storage.setItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(legacy));

    expect(repository.read()).toMatchObject({
      ok: true,
      data: {
        schemaVersion: 2,
        parent: {
          normalizedIdentifier: 'parent@example.com',
          identifierKind: 'email',
        },
      },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });

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
    storage.setItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY, '{}');

    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
    expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
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

  it.each([LEGACY_LOCAL_FAMILY_STORAGE_KEY, LOCAL_FAMILY_STORAGE_KEY])(
    'preserves the current family when reset cannot remove %s, then allows retry',
    (failedKey) => {
      const storage = createMemoryLocalKeyValueStorage();
      let failedRemovalKey: string | null = LEGACY_LOCAL_FAMILY_STORAGE_KEY;
      const repository = createLocalFamilyRepository({
        getItem: storage.getItem,
        setItem: storage.setItem,
        removeItem(key) {
          if (key === failedRemovalKey) {
            failedRemovalKey = null;
            throw new Error('Prepared local storage removal failure');
          }
          storage.removeItem(key);
        },
      });
      const current = validRecord();
      const legacy = {
        ...current,
        schemaVersion: 1,
        familyName: 'Previous Family',
        pairedChildIds: ['child_salem'],
        parent: { id: current.parent.id, role: current.parent.role },
      };
      storage.setItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(legacy));

      expect(repository.read()).toMatchObject({ ok: false });
      expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
      expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
      expect(repository.save(current)).toEqual({ ok: true, data: current });

      failedRemovalKey = failedKey;
      expect(repository.clear()).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });

      expect(createLocalFamilyRepository(storage).read()).toEqual({ ok: true, data: current });
      expect(repository.clear()).toEqual({ ok: true, data: true });
      expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
      expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
      expect(createLocalFamilyRepository(storage).read()).toEqual({ ok: true, data: null });
    },
  );
});
