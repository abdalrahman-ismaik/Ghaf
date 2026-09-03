import { Redirect, Slot } from 'expo-router';

import { selectIsParentAuthenticated, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ProtectedParentLayout() {
  const isParentAuthenticated = usePrototypeStore(selectIsParentAuthenticated);

  if (!isParentAuthenticated) {
    return <Redirect href="/access/parent/sign-in" />;
  }

  return <Slot />;
}
