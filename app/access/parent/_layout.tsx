import { Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';

import { navigationMotionOptions } from '@/design/navigationMotion';
import { colors } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

export default function ParentAccessLayout() {
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const reducedMotion = useReducedMotionPreference();

  if (activeExperience === 'child') return <Redirect href="/child" />;

  return (
    <Stack screenOptions={navigationMotionOptions(Platform.OS, reducedMotion)}>
      <Stack.Screen
        name="family-created-success"
        options={{
          // SuccessSheet owns this surface's entrance and dismissal.
          animation: 'none',
          contentStyle: { backgroundColor: colors.transparent },
          gestureEnabled: false,
          presentation: 'transparentModal',
        }}
      />
    </Stack>
  );
}
