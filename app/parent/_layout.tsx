import { Redirect, Slot } from 'expo-router';

import { selectCanEnterParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentLayout() {
  const hasParentReceipt = usePrototypeStore(selectCanEnterParentExperience);
  const authorizeParentExperience = usePrototypeStore((state) => state.authorizeParentExperience);
  const authorization = hasParentReceipt ? authorizeParentExperience() : null;

  if (!authorization?.ok) {
    return <Redirect href="/access/parent/sign-in" />;
  }

  return <Slot />;
}
