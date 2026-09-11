import { Redirect, Stack, type Href } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ChildLayout() {
  const reducedMotion = Boolean(useReducedMotion());
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const authorizeChildExperience = usePrototypeStore((state) => state.authorizeChildExperience);
  const authorization = canEnterChildExperience ? authorizeChildExperience() : null;

  if (activeExperience === 'parent') return <Redirect href={'/parent' as Href} />;
  if (!authorization?.ok) return <Redirect href={'/' as Href} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
