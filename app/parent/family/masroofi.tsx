import { Redirect, type Href } from 'expo-router';

import { MasroofiParentScreen } from '@/components/masroofi/MasroofiParentScreen';
import { masroofiDemoEnabled } from '@/config/masroofi';

export default function ParentMasroofiRoute() {
  if (!masroofiDemoEnabled) return <Redirect href={'/parent/family' as Href} />;
  return <MasroofiParentScreen />;
}
