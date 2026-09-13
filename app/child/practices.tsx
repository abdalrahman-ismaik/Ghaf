import { Redirect } from 'expo-router';

import { FamilyPracticesScreen } from '@/components/familyPractices/FamilyPracticesScreen';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ChildPracticesRoute() {
  const canEnter = usePrototypeStore(selectCanEnterChildExperience);
  if (!canEnter) return <Redirect href="/" />;
  return <FamilyPracticesScreen role="child" />;
}
