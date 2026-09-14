import { describe, expect, it } from 'vitest';

import {
  createLocalFamilyRecord,
  parseLocalFamilyRecord,
} from '../../src/features/local-family/schema';
import {
  createLocalFamilyRepository,
  createMemoryLocalKeyValueStorage,
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
} from '../../src/services/local';

const child = {
  id: 'child_salem' as const,
  role: 'child' as const,
  nickname: 'Salem',
  avatarId: 'ghaf_tree' as const,
  ageBand: '9_11' as const,
  preferredLanguage: 'both' as const,
  sex: 'male' as const,
  interests: ['sustainability', 'nature'] as const,
  hobbies: ['gardening'] as const,
  accessibilityDefaults: ['simpler_instructions'] as const,
  supportPreferences: ['short_steps', 'adult_alongside'] as const,
  customInterest: 'Caring for plants',
  customHobby: 'Building paper models',
  customSupportPreference: 'Show one example first',
  customAccessibility: 'A quiet place',
  personalizationEnabled: true,
};

function validRecord() {
  const result = createLocalFamilyRecord({
    parentIdentifier: {
      normalizedIdentifier: 'parent@example.com',
      identifierKind: 'email',
      maskedDestination: 'p***@example.com',
    },
    familyConnections: {
      primaryGuardianName: 'Rashid',
      secondaryGuardianName: 'Maryam',
      relatives: [
        {
          id: 'relative_1',
          displayName: 'Grandmother Fatima',
          relationship: 'grandmother',
          rhythm: 'monthly',
        },
      ],
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

function previousChild(gender: 'boy' | 'girl' | 'prefer_not_to_say' | null = 'boy') {
  const {
    sex: _sex,
    customInterest: _customInterest,
    customHobby: _customHobby,
    customSupportPreference: _customSupportPreference,
    customAccessibility: _customAccessibility,
    ...previous
  } = child;
  return { ...previous, gender };
}

function migrationSource(key: string): string {
  const current = validRecord();
  if (key === PREVIOUS_LOCAL_FAMILY_STORAGE_KEY) {
    return JSON.stringify({ ...current, schemaVersion: 3, children: [previousChild()] });
  }
  const { familyConnections: _familyConnections, ...previous } = current;
  return JSON.stringify({
    ...previous,
    schemaVersion: key === LEGACY_LOCAL_FAMILY_STORAGE_KEY ? 2 : 1,
    parent:
      key === LEGACY_LOCAL_FAMILY_STORAGE_KEY
        ? current.parent
        : { id: current.parent.id, role: current.parent.role },
    children: [previousChild()],
  });
}

const canonicalWriteFaults = [
  'ignored_write',
  'changed_readback',
  'readback_throw',
  'write_throw',
] as const;

function storageWithCanonicalWriteFault(fault: (typeof canonicalWriteFaults)[number]) {
  const backing = createMemoryLocalKeyValueStorage();
  let enabled = true;
  let writeAttempted = false;
  return {
    backing,
    recover: () => {
      enabled = false;
    },
    storage: {
      getItem(key: string) {
        if (enabled && writeAttempted && key === LOCAL_FAMILY_STORAGE_KEY) {
          if (fault === 'readback_throw') throw new Error('Synthetic private storage detail');
          if (fault === 'changed_readback') return `${backing.getItem(key)} `;
        }
        return backing.getItem(key);
      },
      setItem(key: string, value: string) {
        if (enabled && key === LOCAL_FAMILY_STORAGE_KEY) {
          writeAttempted = true;
          if (fault === 'ignored_write') return;
          if (fault === 'write_throw') throw new Error('Synthetic private storage detail');
        }
        backing.setItem(key, value);
      },
      removeItem: backing.removeItem,
    },
  };
}

describe('device-local family schema', () => {
  it('round-trips the schema-4 directory with private family connection data', () => {
    const record = validRecord();
    const parsed = parseLocalFamilyRecord(JSON.stringify(record));

    expect(parsed).toEqual({ ok: true, data: record });
    expect(record).toMatchObject({
      schemaVersion: 4,
      householdId: 'household_al_noor',
      familyConnections: {
        primaryGuardianName: 'Rashid',
        secondaryGuardianName: 'Maryam',
        relatives: [{ displayName: 'Grandmother Fatima', relationship: 'grandmother' }],
      },
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
    JSON.stringify({ schemaVersion: 4 }),
    JSON.stringify({ ...validRecord(), children: [] }),
    JSON.stringify({ ...validRecord(), children: [child, child] }),
    JSON.stringify({ ...validRecord(), pairedChildIds: ['child_alya'] }),
    JSON.stringify({ ...validRecord(), children: [{ ...child, sex: null }] }),
    JSON.stringify({ ...validRecord(), children: [{ ...child, customInterest: 'x' }] }),
    JSON.stringify({ ...validRecord(), updatedAt: 'not-a-time' }),
    JSON.stringify({ ...validRecord(), secret: 'hidden' }),
  ])('fails closed for corrupt, unknown, partial, duplicated, or expanded input', (raw) => {
    expect(parseLocalFamilyRecord(raw)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('returns a validation failure instead of throwing for a missing family directory', () => {
    const record = validRecord();
    const {
      familyConnections: _familyConnections,
      schemaVersion: _schemaVersion,
      householdId: _householdId,
      parent: _parent,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      origin: _origin,
      capabilityTruth: _capabilityTruth,
      ...input
    } = record;

    expect(() =>
      createLocalFamilyRecord({
        ...input,
        parentIdentifier: {
          normalizedIdentifier: record.parent.normalizedIdentifier,
          identifierKind: record.parent.identifierKind,
          maskedDestination: 'p***@example.com',
        },
        familyConnections: undefined as never,
        now: record.createdAt,
      }),
    ).not.toThrow();
    expect(
      createLocalFamilyRecord({
        ...input,
        parentIdentifier: {
          normalizedIdentifier: record.parent.normalizedIdentifier,
          identifierKind: record.parent.identifierKind,
          maskedDestination: 'p***@example.com',
        },
        familyConnections: undefined as never,
        now: record.createdAt,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
  });
});

describe('device-local family repository', () => {
  it.each(canonicalWriteFaults)(
    'reports %s as an unverified save and allows an explicit retry',
    (fault) => {
      const fixture = storageWithCanonicalWriteFault(fault);
      const repository = createLocalFamilyRepository(fixture.storage);
      const record = validRecord();

      const failed = repository.save(record);
      expect(failed).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION', retryable: true },
      });
      expect(JSON.stringify(failed)).not.toContain('Synthetic private storage detail');
      fixture.recover();
      expect(repository.save(record)).toEqual({ ok: true, data: record });
      expect(createLocalFamilyRepository(fixture.backing).read()).toEqual({
        ok: true,
        data: record,
      });
    },
  );

  describe.each([
    PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
    LEGACY_LOCAL_FAMILY_STORAGE_KEY,
    OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  ])('migration source %s', (sourceKey) => {
    it.each(canonicalWriteFaults)('preserves the source when canonical storage has %s', (fault) => {
      const fixture = storageWithCanonicalWriteFault(fault);
      const repository = createLocalFamilyRepository(fixture.storage);
      const original = migrationSource(sourceKey);
      fixture.backing.setItem(sourceKey, original);

      const failed = repository.read();
      expect(failed).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION', retryable: true },
      });
      expect(JSON.stringify(failed)).not.toContain('Synthetic private storage detail');
      expect(fixture.backing.getItem(sourceKey)).toBe(original);
      fixture.recover();
      expect(repository.read()).toMatchObject({ ok: true, data: { schemaVersion: 4 } });
      expect(createLocalFamilyRepository(fixture.backing).read()).toMatchObject({
        ok: true,
        data: { schemaVersion: 4 },
      });
    });
  });

  it.each(canonicalWriteFaults)(
    'preserves every repair source until canonical write passes after %s',
    (fault) => {
      const fixture = storageWithCanonicalWriteFault(fault);
      const repository = createLocalFamilyRepository(fixture.storage);
      const record = validRecord();
      const sources = [
        PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
        LEGACY_LOCAL_FAMILY_STORAGE_KEY,
        OLDEST_LOCAL_FAMILY_STORAGE_KEY,
      ].map((key) => [key, migrationSource(key)] as const);
      for (const [key, raw] of sources) fixture.backing.setItem(key, raw);

      expect(repository.saveProfileRepair(record)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION', retryable: true },
      });
      for (const [key, raw] of sources) expect(fixture.backing.getItem(key)).toBe(raw);
      fixture.recover();
      expect(repository.saveProfileRepair(record)).toEqual({ ok: true, data: record });
      for (const [key] of sources) expect(fixture.backing.getItem(key)).toBeNull();
      expect(createLocalFamilyRepository(fixture.backing).read()).toEqual({
        ok: true,
        data: record,
      });
    },
  );

  it.each([
    PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
    LEGACY_LOCAL_FAMILY_STORAGE_KEY,
    OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  ])('retains the saved canonical repair when cleanup of %s is ignored, then retries', (key) => {
    const storage = createMemoryLocalKeyValueStorage();
    let ignoreCleanup = true;
    const repository = createLocalFamilyRepository({
      ...storage,
      removeItem(candidate) {
        if (ignoreCleanup && candidate === key) return;
        storage.removeItem(candidate);
      },
    });
    const raw = migrationSource(key);
    const record = validRecord();
    storage.setItem(key, raw);

    expect(repository.saveProfileRepair(record)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION', retryable: true },
    });
    expect(storage.getItem(key)).toBe(raw);
    expect(createLocalFamilyRepository(storage).read()).toEqual({ ok: true, data: record });
    ignoreCleanup = false;
    expect(repository.saveProfileRepair(record)).toEqual({ ok: true, data: record });
    expect(storage.getItem(key)).toBeNull();
    expect(repository.read()).toEqual({ ok: true, data: record });
  });

  it('does not report pairing success after an ignored write and pairs once on retry', () => {
    const fixture = storageWithCanonicalWriteFault('ignored_write');
    const record = validRecord();
    fixture.backing.setItem(LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(record));
    const repository = createLocalFamilyRepository(fixture.storage);
    const now = '2026-09-06T14:05:00.000Z';

    expect(repository.setPairedChild('child_salem', true, now)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION', retryable: true },
    });
    expect(repository.read()).toEqual({ ok: true, data: record });
    fixture.recover();
    const paired = repository.setPairedChild('child_salem', true, now);
    expect(paired).toEqual({
      ok: true,
      data: { ...record, pairedChildIds: ['child_salem'], updatedAt: now },
    });
    expect(repository.setPairedChild('child_salem', true, '2026-09-06T14:06:00.000Z')).toEqual(
      paired,
    );
  });

  it('migrates schema 3 explicit sex without inventing custom answers', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const current = validRecord();
    storage.setItem(
      PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
      JSON.stringify({ ...current, schemaVersion: 3, children: [previousChild('boy')] }),
    );

    expect(repository.read()).toMatchObject({
      ok: true,
      data: {
        schemaVersion: 4,
        children: [
          {
            sex: 'male',
            customInterest: null,
            customHobby: null,
            customSupportPreference: null,
            customAccessibility: null,
          },
        ],
      },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });

  it('fails closed instead of inferring sex for a previous declined or missing value', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const current = validRecord();
    storage.setItem(
      PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
      JSON.stringify({
        ...current,
        schemaVersion: 3,
        children: [previousChild('prefer_not_to_say')],
      }),
    );

    expect(repository.read()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
  });

  it('migrates schema 2 without inventing relatives', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const current = validRecord();
    const { familyConnections: _familyConnections, ...previous } = current;
    storage.setItem(
      LEGACY_LOCAL_FAMILY_STORAGE_KEY,
      JSON.stringify({ ...previous, schemaVersion: 2, children: [previousChild('girl')] }),
    );

    expect(repository.read()).toMatchObject({
      ok: true,
      data: {
        schemaVersion: 4,
        familyConnections: {
          primaryGuardianName: 'Parent',
          secondaryGuardianName: '',
          relatives: [],
        },
        children: [{ sex: 'female' }],
      },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });

  it('migrates the schema-1 fixture to the canonical prepared Parent email', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const current = validRecord();
    const { familyConnections: _familyConnections, ...previous } = current;
    const legacy = {
      ...previous,
      schemaVersion: 1,
      parent: { id: current.parent.id, role: current.parent.role },
      children: [previousChild('boy')],
    };
    storage.setItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY, JSON.stringify(legacy));

    expect(repository.read()).toMatchObject({
      ok: true,
      data: {
        schemaVersion: 4,
        familyConnections: {
          primaryGuardianName: 'Parent',
          secondaryGuardianName: '',
          relatives: [],
        },
        parent: {
          normalizedIdentifier: 'parent@example.com',
          identifierKind: 'email',
        },
      },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
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
    storage.setItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, '{}');
    storage.setItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY, '{}');
    storage.setItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY, '{}');

    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(OLDEST_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });

  it.each([
    OLDEST_LOCAL_FAMILY_STORAGE_KEY,
    LEGACY_LOCAL_FAMILY_STORAGE_KEY,
    PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
    LOCAL_FAMILY_STORAGE_KEY,
  ])('preserves the current family when reset cannot remove %s, then allows retry', (failedKey) => {
    const storage = createMemoryLocalKeyValueStorage();
    let failedRemovalKey: string | null = PREVIOUS_LOCAL_FAMILY_STORAGE_KEY;
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
    storage.setItem(
      PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
      JSON.stringify({ ...current, schemaVersion: 3, children: [previousChild('boy')] }),
    );
    expect(repository.read()).toMatchObject({ ok: false });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(repository.save(current)).toEqual({ ok: true, data: current });

    failedRemovalKey = failedKey;
    expect(repository.clear()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(createLocalFamilyRepository(storage).read()).toEqual({ ok: true, data: current });
    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(createLocalFamilyRepository(storage).read()).toEqual({ ok: true, data: null });
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
