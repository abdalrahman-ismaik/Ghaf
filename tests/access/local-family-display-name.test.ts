import { describe, expect, it } from 'vitest';

import { createCanonicalDemoFamily } from '../../src/features/access/demoEntry';
import { resolveLocalFamilyDisplayName } from '../../src/features/access/localFamilyDisplayName';
import { resources } from '../../src/i18n/resources';

function preparedFamily() {
  const result = createCanonicalDemoFamily('2026-09-04T10:00:00.000Z');
  if (!result.ok) throw new Error('Expected prepared family');
  return result.data;
}

describe('prepared family display-name compatibility', () => {
  it.each(['ar', 'en'] as const)(
    'updates the old prepared name in %s without mutating its record',
    (locale) => {
      const record = {
        ...preparedFamily(),
        familyName: 'أسرة النور',
        appLanguage: locale,
        updatedAt: '2026-09-13T10:00:00.000Z',
      };
      const before = JSON.stringify(record);
      const label = resources[locale].translation.access.signIn.demoFamily;
      expect(resolveLocalFamilyDisplayName(record, label)).toBe(label);
      expect(JSON.stringify(record)).toBe(before);
    },
  );
  it('localizes the current prepared family name', () => {
    const record = preparedFamily();
    expect(resolveLocalFamilyDisplayName(record, 'Abu Rashid Family')).toBe('Abu Rashid Family');
  });
  it.each(['عائلة اختارها ولي الأمر', 'Al Noor Family', 'عائلة النخلة'])(
    'preserves the explicitly stored custom name %s',
    (familyName) => {
      expect(
        resolveLocalFamilyDisplayName({ ...preparedFamily(), familyName }, 'عائلة أبو راشد'),
      ).toBe(familyName);
    },
  );
  it('does not infer a prepared family from shared household identifiers alone', () => {
    const record = { ...preparedFamily(), familyName: 'أسرة النور' };
    const edited = [
      { ...record, parent: { ...record.parent, normalizedIdentifier: 'custom@example.com' } },
      {
        ...record,
        children: record.children.map((child) => ({
          ...child,
          nickname: `${child.nickname} Test`,
        })),
      },
      {
        ...record,
        familyConnections: { ...record.familyConnections, primaryGuardianName: 'أحمد' },
      },
      { ...record, pairedChildIds: [] },
    ];
    for (const family of edited) {
      expect(resolveLocalFamilyDisplayName(family, 'عائلة أبو راشد')).toBe('أسرة النور');
    }
  });
});
