import type { AgeBand, SyntheticChildId } from '../../models/familyGrowth';
import type { LocalFamilyView } from '../../models/localFamily';
import { parseLocalFamilyRecord } from './schema';

export function resolveConfiguredChildAgeBand(
  localFamily: LocalFamilyView,
  childId: SyntheticChildId,
): AgeBand | null {
  if (
    localFamily.status !== 'ready' ||
    localFamily.errorCode !== null ||
    localFamily.record === null ||
    !localFamily.configuredChildIds.includes(childId)
  ) {
    return null;
  }
  try {
    const parsed = parseLocalFamilyRecord(JSON.stringify(localFamily.record));
    if (
      !parsed.ok ||
      parsed.data.children.length !== localFamily.configuredChildIds.length ||
      !parsed.data.children.every(
        (child, index) => child.id === localFamily.configuredChildIds[index],
      )
    ) {
      return null;
    }
    return parsed.data.children.find((child) => child.id === childId)?.ageBand ?? null;
  } catch {
    return null;
  }
}
