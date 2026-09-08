import { Redirect, Slot } from 'expo-router';

import { selectHasActiveParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentLayout() {
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const hasParentReceipt = usePrototypeStore(selectHasActiveParentExperience);
  const authorizeParentExperience = usePrototypeStore((state) => state.authorizeParentExperience);
  const authorization = hasParentReceipt ? authorizeParentExperience() : null;

  if (activeExperience === 'child') return <Redirect href="/child" />;
  if (!authorization?.ok) return <Redirect href="/" />;

  return <Slot />;
}
