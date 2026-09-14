import type { AgeBand, SyntheticChildId } from '../../src/models/familyGrowth';
import { serviceRegistry } from '../../src/services';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';

export function configureChildAgeForTest(
  ageBand: AgeBand,
  childId: SyntheticChildId = 'child_salem',
): void {
  const { localFamily } = usePrototypeStore.getState();
  if (!localFamily.record?.children.some((child) => child.id === childId)) {
    throw new Error('Configure the synthetic family before changing its test age band');
  }
  const saved = serviceRegistry.localFamily.save({
    ...localFamily.record,
    children: localFamily.record.children.map((child) =>
      child.id === childId ? { ...child, ageBand } : child,
    ),
  });
  if (!saved.ok) throw new Error('The synthetic configured age could not be saved');
  usePrototypeStore.setState({ localFamily: { ...localFamily, record: saved.data } });
}
