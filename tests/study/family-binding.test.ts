import { describe, expect, it } from 'vitest';

import {
  createLocalFamilyRecord,
  migrateLegacyLocalFamilyRecord,
  migrateOldestLocalFamilyRecord,
  migratePreviousLocalFamilyRecord,
  parseLocalFamilyRecord,
} from '../../src/features/local-family/schema';

function currentRecord() {
  const result = createLocalFamilyRecord({
    parentIdentifier: {
      normalizedIdentifier: 'parent@example.com',
      identifierKind: 'email',
      maskedDestination: 'p***@example.com',
    },
    familyConnections: {
      primaryGuardianName: 'Rashid',
      secondaryGuardianName: '',
      relatives: [],
    },
    familyName: 'Sample Family',
    appLanguage: 'en',
    children: [
      {
        id: 'child_salem',
        role: 'child',
        nickname: 'Salem',
        avatarId: 'ghaf_tree',
        ageBand: '9_11',
        preferredLanguage: 'both',
        sex: 'male',
        interests: [],
        hobbies: [],
        accessibilityDefaults: [],
        supportPreferences: [],
        customInterest: null,
        customHobby: null,
        customSupportPreference: null,
        customAccessibility: null,
        personalizationEnabled: false,
      },
    ],
    pairedChildIds: [],
    now: '2026-09-06T14:00:00.000Z',
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function historicalRecord(version: 1 | 2 | 3): Record<string, unknown> {
  const current = currentRecord();
  const record: Record<string, unknown> = {
    ...current,
    schemaVersion: version,
    children: current.children.map((child) => {
      const {
        sex: _sex,
        customInterest: _customInterest,
        customHobby: _customHobby,
        customSupportPreference: _customSupportPreference,
        customAccessibility: _customAccessibility,
        ...previous
      } = child;
      return { ...previous, gender: 'boy' };
    }),
  };
  if (version < 3) delete record.familyConnections;
  if (version === 1) record.parent = { id: 'parent_al_noor', role: 'parent' };
  return record;
}

describe('optional family-instance binding for study', () => {
  it('preserves the existing schema-4 shape when no study token is present', () => {
    const record = currentRecord();
    expect(Object.hasOwn(record, 'studyInstanceId')).toBe(false);
    expect(parseLocalFamilyRecord(JSON.stringify(record))).toEqual({ ok: true, data: record });
  });

  it.each(['study-550e8400-e29b-41d4-a716-446655440000', 'S_1', 'a'.repeat(100)])(
    'preserves an opaque token byte-for-byte: %s',
    (studyInstanceId) => {
      const record = { ...currentRecord(), studyInstanceId };
      expect(parseLocalFamilyRecord(JSON.stringify(record))).toEqual({ ok: true, data: record });
    },
  );

  it.each([
    '',
    ' leading',
    'trailing ',
    'contains space',
    'a'.repeat(101),
    'family:one',
    'هوية',
    'line\nbreak',
    'trailing\n',
    null,
    123,
    {},
  ])('rejects a malformed token %#', (studyInstanceId) => {
    expect(parseLocalFamilyRecord(JSON.stringify({ ...currentRecord(), studyInstanceId })).ok).toBe(
      false,
    );
  });

  it('does not weaken exact-key validation for other additions', () => {
    expect(
      parseLocalFamilyRecord(
        JSON.stringify({ ...currentRecord(), studyInstanceId: 'valid-token', unexpected: true }),
      ).ok,
    ).toBe(false);
  });

  it.each([
    [1, migrateOldestLocalFamilyRecord],
    [2, migrateLegacyLocalFamilyRecord],
    [3, migratePreviousLocalFamilyRecord],
  ] as const)('keeps historical schema %s migration token-free', (version, migrate) => {
    const record = historicalRecord(version);
    const migrated = migrate(JSON.stringify(record));
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) throw new Error(migrated.error.message);
    expect(Object.hasOwn(migrated.data, 'studyInstanceId')).toBe(false);
    expect(migrate(JSON.stringify({ ...record, studyInstanceId: 'unexpected-new-token' })).ok).toBe(
      false,
    );
  });
});
