import { useEffect } from 'react';
import { Redirect } from 'expo-router';

import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function RetiredParentVerificationRoute() {
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const pendingFamilyCreation = usePrototypeStore((state) => state.pendingFamilyCreation);
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const stagedSetup =
    parentOnboarding.status === 'verified' &&
    !parentOnboarding.completionReceipt &&
    (pendingFamilyCreation === 'fresh' ||
      pendingFamilyCreation === 'replacement' ||
      pendingFamilyCreation === 'profile_repair');
  const staleVerification =
    activeExperience === 'signed_out' &&
    !stagedSetup &&
    (parentOnboarding.status === 'code_sent' ||
      parentOnboarding.status === 'verifying' ||
      parentOnboarding.status === 'verified');

  useEffect(() => {
    if (staleVerification) cancelParentVerification();
  }, [cancelParentVerification, staleVerification]);

  if (activeExperience === 'parent') return <Redirect href={'/parent'} />;
  if (activeExperience === 'child') return <Redirect href="/child" />;
  if (staleVerification) return null;
  if (stagedSetup) {
    return (
      <Redirect
        href={
          pendingFamilyCreation === 'profile_repair'
            ? '/access/parent/add-first-child'
            : '/access/parent/family-basics'
        }
      />
    );
  }
  return <Redirect href="/access/parent/sign-in" />;
}
