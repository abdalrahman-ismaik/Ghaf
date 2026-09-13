import { Redirect } from 'expo-router';

import { FamilyPracticesScreen } from '@/components/familyPractices/FamilyPracticesScreen';
import { selectHasActiveParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentPracticesRoute() {
  const canEnter = usePrototypeStore(selectHasActiveParentExperience);
  if (!canEnter) return <Redirect href="/" />;
  return <FamilyPracticesScreen role="parent" />;
}
