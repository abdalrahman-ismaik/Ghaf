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
  OLDEST_LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
} from '../src/services/local';

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
