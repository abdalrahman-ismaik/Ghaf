import { Redirect, Stack, type Href } from 'expo-router';
import { Platform } from 'react-native';

import { navigationMotionOptions } from '@/design/navigationMotion';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

export default function ChildLayout() {
  const reducedMotion = useReducedMotionPreference();
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const authorizeChildExperience = usePrototypeStore((state) => state.authorizeChildExperience);
  const authorization = canEnterChildExperience ? authorizeChildExperience() : null;

  if (activeExperience === 'parent') return <Redirect href={'/parent' as Href} />;
  if (!authorization?.ok) return <Redirect href={'/' as Href} />;

  return (
    <Stack
      screenOptions={({ route }) =>
        navigationMotionOptions(
          Platform.OS,
          reducedMotion,
          route.name === 'index' ? 'peer' : 'detail',
        )
      }
    >
      <Stack.Screen
        name="reveal/[bundleId]"
        options={{
          animation: reducedMotion ? 'none' : 'fade',
          gestureEnabled: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
