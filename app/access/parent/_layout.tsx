import { Redirect, Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { colors } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentAccessLayout() {
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const reducedMotion = Boolean(useReducedMotion());

  if (activeExperience === 'child') return <Redirect href="/child" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="family-created-success"
        options={{
          animation: reducedMotion ? 'none' : 'fade',
          contentStyle: { backgroundColor: colors.transparent },
          gestureEnabled: false,
          presentation: 'transparentModal',
        }}
      />
    </Stack>
  );
}
