import type { LocalFamilyRecord } from '../../models/localFamily';
import { isExactPlainDataEqual } from '../../utils/exactPlainData';
import { createCanonicalDemoFamily } from './demoEntry';

export function resolveLocalFamilyDisplayName(
  record: LocalFamilyRecord,
  preparedLabel: string,
): string {
  const prepared = createCanonicalDemoFamily(record.createdAt);
  if (!prepared.ok) return record.familyName;
  if (record.familyName !== 'أسرة النور' && record.familyName !== prepared.data.familyName) {
    return record.familyName;
  }
  const comparable = {
    ...record,
    familyName: prepared.data.familyName,
    appLanguage: prepared.data.appLanguage,
    updatedAt: prepared.data.updatedAt,
  };
  return isExactPlainDataEqual(comparable, prepared.data) ? preparedLabel : record.familyName;
}
