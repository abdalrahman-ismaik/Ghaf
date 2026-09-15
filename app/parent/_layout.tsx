import { Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';

import { navigationMotionOptions } from '@/design/navigationMotion';
import { selectHasActiveParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

export default function ParentLayout() {
  const reducedMotion = useReducedMotionPreference();
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const hasParentReceipt = usePrototypeStore(selectHasActiveParentExperience);
  const authorizeParentExperience = usePrototypeStore((state) => state.authorizeParentExperience);
  const authorization = hasParentReceipt ? authorizeParentExperience() : null;

  if (activeExperience === 'child') return <Redirect href="/child" />;
  if (!authorization?.ok) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={({ route }) => ({
        ...navigationMotionOptions(
          Platform.OS,
          reducedMotion,
          ['index', 'family/index'].includes(route.name) ? 'peer' : 'detail',
        ),
        // Parent replaces return from review, reauthentication and nested settings.
        animationTypeForReplace: 'pop',
      })}
    />
  );
}
